import { create } from 'zustand';
import { apiFetch } from '../lib/apiFetch';
import {
  ALL_CONTENT_BUNDLE_KEYS,
  type CanonicalBundlePayloadMap,
  type ContentBundleKey,
  type ContentDomainId,
  getCanonicalFallbackBundle,
  getTotalCanonicalRecordCount,
  resolveBundleWithFallback,
} from '../data/canonicalDataRegistry';

export type { ContentBundleKey, ContentDomainId };

export type BundleLoadStatus = 'idle' | 'loading' | 'loaded' | 'fallback' | 'error';
export type BundleDataSource = 'mongodb' | 'in-memory' | 'local-fallback';

export interface ContentCollectionMeta {
  collectionKey: ContentBundleKey;
  domain: ContentDomainId;
  label: string;
  schemaVersion: string;
  checksum: string;
  itemCount: number;
  byteSize: number;
  syncedAt: string;
  source: 'mongodb' | 'in-memory';
}

const FLAG_STORAGE_KEY = 'patternforge_db_content_pull_enabled_v1';

// Module-level deduplication map so simultaneous mounts never fire duplicate fetches
const inFlightBundleFetches = new Map<ContentBundleKey, Promise<unknown>>();

function readInitialPullFlag(): boolean {
  try {
    const saved = window.localStorage.getItem(FLAG_STORAGE_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    // ignore storage errors
  }
  const envVal = (import.meta.env.VITE_ENABLE_DB_CONTENT_PULL as string | undefined)
    ?.trim()
    .toLowerCase();
  if (!envVal) return true;
  return envVal !== 'false' && envVal !== '0' && envVal !== 'off';
}

export interface ContentBootstrapState {
  pullFlagEnabled: boolean;
  status: 'idle' | 'loading' | 'pulled' | 'disabled' | 'error';
  storageMode: 'mongodb' | 'in-memory' | 'static-local';
  syncedAt: string | null;
  totalCollections: number;
  totalItems: number;
  totalBytes: number;
  collections: ContentCollectionMeta[];
  bundles: Partial<{ [K in ContentBundleKey]: CanonicalBundlePayloadMap[K] }>;
  bundleStatus: Partial<Record<ContentBundleKey, BundleLoadStatus>>;
  bundleSource: Partial<Record<ContentBundleKey, BundleDataSource>>;
  bundleError: Partial<Record<ContentBundleKey, string | null>>;
  lastError: string | null;
  isPushing: boolean;
  isPullingAll: boolean;
  initialized: boolean;

  bootstrapOnStartup: () => Promise<void>;
  setPullFlagEnabled: (enabled: boolean) => Promise<void>;
  fetchManifest: (forcePull?: boolean) => Promise<void>;
  fetchBundle: <K extends ContentBundleKey>(
    key: K,
    options?: { force?: boolean }
  ) => Promise<CanonicalBundlePayloadMap[K]>;
  pullAllBundles: () => Promise<void>;
  pullFromDb: (forcePull?: boolean) => Promise<void>;
  pushToDb: (force?: boolean, keys?: ContentBundleKey[]) => Promise<void>;
}

export function selectBundleData<K extends ContentBundleKey>(
  state: ContentBootstrapState,
  key: K
): CanonicalBundlePayloadMap[K] {
  const hydrated = state.bundles[key];
  if (hydrated !== undefined && hydrated !== null) {
    return hydrated as CanonicalBundlePayloadMap[K];
  }
  return getCanonicalFallbackBundle(key);
}

export const useContentBootstrapStore = create<ContentBootstrapState>((set, get) => ({
  pullFlagEnabled: typeof window !== 'undefined' ? readInitialPullFlag() : true,
  status: 'idle',
  storageMode: 'static-local',
  syncedAt: null,
  totalCollections: ALL_CONTENT_BUNDLE_KEYS.length,
  totalItems: getTotalCanonicalRecordCount(),
  totalBytes: 0,
  collections: [],
  bundles: {},
  bundleStatus: {},
  bundleSource: {},
  bundleError: {},
  lastError: null,
  isPushing: false,
  isPullingAll: false,
  initialized: false,

  bootstrapOnStartup: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    if (!get().pullFlagEnabled) {
      set({ status: 'disabled', storageMode: 'static-local' });
      return;
    }
    // Lightweight (<5 KB) manifest fetch on boot; domain bundles lazy-load on demand
    await get().fetchManifest(false);
  },

  setPullFlagEnabled: async (enabled: boolean) => {
    try {
      window.localStorage.setItem(FLAG_STORAGE_KEY, String(enabled));
    } catch {
      // ignore storage errors
    }
    set({ pullFlagEnabled: enabled, lastError: null });
    if (enabled) {
      await get().fetchManifest(true);
      // Re-hydrate any bundles that were previously requested while disabled
      const activeKeys = Object.keys(get().bundleStatus) as ContentBundleKey[];
      await Promise.all(activeKeys.map((k) => get().fetchBundle(k, { force: true })));
    } else {
      const nextSource: Partial<Record<ContentBundleKey, BundleDataSource>> = {};
      const nextStatus: Partial<Record<ContentBundleKey, BundleLoadStatus>> = {};
      for (const key of Object.keys(get().bundleStatus) as ContentBundleKey[]) {
        nextSource[key] = 'local-fallback';
        nextStatus[key] = 'fallback';
      }
      set({
        status: 'disabled',
        storageMode: 'static-local',
        bundles: {},
        bundleSource: nextSource,
        bundleStatus: nextStatus,
      });
    }
  },

  fetchManifest: async (forcePull = false) => {
    const enabled = forcePull || get().pullFlagEnabled;
    if (!enabled) {
      set({ status: 'disabled', storageMode: 'static-local' });
      return;
    }

    set({ status: 'loading', lastError: null });
    try {
      const res = await apiFetch('/api/content-bootstrap/index?pull=1');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        pullEnabled: boolean;
        storageMode: 'mongodb' | 'in-memory' | 'static-local';
        syncedAt: string;
        totalCollections?: number;
        totalItems: number;
        totalBytes?: number;
        collections: ContentCollectionMeta[];
      };

      set({
        status: data.pullEnabled ? 'pulled' : 'disabled',
        storageMode: data.storageMode,
        syncedAt: data.syncedAt,
        totalCollections: data.totalCollections ?? data.collections?.length ?? ALL_CONTENT_BUNDLE_KEYS.length,
        totalItems: data.totalItems > 0 ? data.totalItems : getTotalCanonicalRecordCount(),
        totalBytes: data.totalBytes ?? 0,
        collections: data.collections ?? [],
        lastError: null,
      });
    } catch (err) {
      set({
        status: 'error',
        storageMode: 'static-local',
        lastError: err instanceof Error ? err.message : 'Failed to fetch content manifest from DB.',
      });
    }
  },

  fetchBundle: async <K extends ContentBundleKey>(
    key: K,
    options?: { force?: boolean }
  ): Promise<CanonicalBundlePayloadMap[K]> => {
    const force = Boolean(options?.force);
    const state = get();

    // When DB pull is disabled, immediately map from Single Canonical Local Data Registry
    if (!state.pullFlagEnabled && !force) {
      const fallback = getCanonicalFallbackBundle(key);
      if (state.bundleSource[key] !== 'local-fallback' || state.bundleStatus[key] !== 'fallback') {
        set((prev) => ({
          bundleStatus: { ...prev.bundleStatus, [key]: 'fallback' },
          bundleSource: { ...prev.bundleSource, [key]: 'local-fallback' },
          bundleError: { ...prev.bundleError, [key]: null },
        }));
      }
      return fallback;
    }

    // Return already hydrated bundle unless force refresh requested
    const existingStatus = state.bundleStatus[key];
    if (!force && existingStatus === 'loaded' && state.bundles[key] !== undefined) {
      return state.bundles[key] as CanonicalBundlePayloadMap[K];
    }

    // Deduplicate concurrent requests for the same bundle key
    const existingPromise = inFlightBundleFetches.get(key);
    if (!force && existingPromise) {
      return existingPromise as Promise<CanonicalBundlePayloadMap[K]>;
    }

    const requestPromise = (async (): Promise<CanonicalBundlePayloadMap[K]> => {
      set((prev) => ({
        bundleStatus: { ...prev.bundleStatus, [key]: 'loading' },
        bundleError: { ...prev.bundleError, [key]: null },
      }));

      try {
        const res = await apiFetch(`/api/content-bootstrap/${encodeURIComponent(key)}?pull=1`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as {
          pullEnabled: boolean;
          found: boolean;
          storageMode: 'mongodb' | 'in-memory' | 'static-local';
          meta: ContentCollectionMeta | null;
          payload: unknown;
        };

        // Strict guard: if DB returned null/empty/invalid, seamlessly map from Single Local Data Registry
        const resolved = resolveBundleWithFallback(
          key,
          data.pullEnabled && data.found ? data.payload : null
        );

        const resolvedSource: BundleDataSource = resolved.usedFallback
          ? 'local-fallback'
          : data.storageMode === 'mongodb'
            ? 'mongodb'
            : 'in-memory';

        set((prev) => {
          const nextCollections = data.meta
            ? upsertCollectionMeta(prev.collections, data.meta)
            : prev.collections;

          return {
            bundles: {
              ...prev.bundles,
              [key]: resolved.data,
            },
            bundleStatus: {
              ...prev.bundleStatus,
              [key]: resolved.usedFallback ? 'fallback' : 'loaded',
            },
            bundleSource: {
              ...prev.bundleSource,
              [key]: resolvedSource,
            },
            bundleError: {
              ...prev.bundleError,
              [key]: null,
            },
            collections: nextCollections,
            storageMode:
              resolvedSource === 'mongodb'
                ? 'mongodb'
                : prev.storageMode === 'static-local' && resolvedSource === 'in-memory'
                  ? 'in-memory'
                  : prev.storageMode,
          };
        });

        return resolved.data;
      } catch (err) {
        const fallback = getCanonicalFallbackBundle(key);
        set((prev) => ({
          bundles: {
            ...prev.bundles,
            [key]: fallback,
          },
          bundleStatus: {
            ...prev.bundleStatus,
            [key]: 'fallback',
          },
          bundleSource: {
            ...prev.bundleSource,
            [key]: 'local-fallback',
          },
          bundleError: {
            ...prev.bundleError,
            [key]: err instanceof Error ? err.message : 'DB fetch failed; using local registry.',
          },
        }));
        return fallback;
      } finally {
        inFlightBundleFetches.delete(key);
      }
    })();

    inFlightBundleFetches.set(key, requestPromise);
    return requestPromise;
  },

  pullAllBundles: async () => {
    set({ isPullingAll: true, lastError: null });
    try {
      await get().fetchManifest(true);
      // Hydrate bundles in small concurrent batches to stay smooth on the main thread
      const batchSize = 5;
      for (let i = 0; i < ALL_CONTENT_BUNDLE_KEYS.length; i += batchSize) {
        const batch = ALL_CONTENT_BUNDLE_KEYS.slice(i, i + batchSize);
        await Promise.all(batch.map((key) => get().fetchBundle(key, { force: true })));
      }
    } finally {
      set({ isPullingAll: false });
    }
  },

  pullFromDb: async (forcePull = false) => {
    await get().fetchManifest(forcePull);
    if (!forcePull && !get().pullFlagEnabled) return;
    const activeKeys = Object.keys(get().bundleStatus) as ContentBundleKey[];
    if (activeKeys.length > 0) {
      await Promise.all(activeKeys.map((key) => get().fetchBundle(key, { force: true })));
    }
  },

  pushToDb: async (force = true, keys?: ContentBundleKey[]) => {
    set({ isPushing: true, lastError: null });
    try {
      const res = await apiFetch('/api/content-bootstrap/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force, keys }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const report = (await res.json()) as {
        storageMode: 'mongodb' | 'in-memory';
        syncedAt: string;
        totalCollections?: number;
        totalItems: number;
        totalBytes?: number;
        collections: ContentCollectionMeta[];
      };

      set((prev) => ({
        isPushing: false,
        storageMode: report.storageMode,
        syncedAt: report.syncedAt,
        totalCollections: keys?.length
          ? Math.max(prev.totalCollections, report.collections?.length ?? 0)
          : report.totalCollections ?? report.collections?.length ?? ALL_CONTENT_BUNDLE_KEYS.length,
        totalItems: keys?.length ? prev.totalItems : report.totalItems,
        totalBytes: keys?.length ? prev.totalBytes : report.totalBytes ?? prev.totalBytes,
        collections: keys?.length
          ? report.collections.reduce(upsertCollectionMeta, prev.collections)
          : report.collections ?? [],
        status: prev.pullFlagEnabled ? 'pulled' : prev.status,
      }));

      if (get().pullFlagEnabled) {
        await get().pullFromDb(true);
      }
    } catch (err) {
      set({
        isPushing: false,
        lastError: err instanceof Error ? err.message : 'Failed to push content to DB.',
      });
    }
  },
}));

function upsertCollectionMeta(
  list: ContentCollectionMeta[],
  item: ContentCollectionMeta
): ContentCollectionMeta[] {
  const idx = list.findIndex((c) => c.collectionKey === item.collectionKey);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}
