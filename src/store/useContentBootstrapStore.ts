import { create } from 'zustand';
import { apiFetch } from '../lib/apiFetch';

export type ContentBundleKey =
  | 'algorithms-catalog'
  | 'master-73-roadmap'
  | 'algorithm-power-combos'
  | 'curriculum-topics'
  | 'curated-interview-bank'
  | 'solver-strategies';

export interface ContentCollectionMeta {
  collectionKey: ContentBundleKey;
  schemaVersion: string;
  checksum: string;
  itemCount: number;
  syncedAt: string;
  source: 'mongodb' | 'in-memory';
}

const FLAG_STORAGE_KEY = 'patternforge_db_content_pull_enabled_v1';

function readInitialPullFlag(): boolean {
  try {
    const saved = window.localStorage.getItem(FLAG_STORAGE_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    // ignore storage errors
  }
  const envVal = (import.meta.env.VITE_ENABLE_DB_CONTENT_PULL as string | undefined)?.trim().toLowerCase();
  if (!envVal) return true;
  return envVal !== 'false' && envVal !== '0' && envVal !== 'off';
}

export interface ContentBootstrapState {
  pullFlagEnabled: boolean;
  status: 'idle' | 'loading' | 'pulled' | 'disabled' | 'error';
  storageMode: 'mongodb' | 'in-memory' | 'static-local';
  syncedAt: string | null;
  totalItems: number;
  collections: ContentCollectionMeta[];
  bundles: Partial<Record<ContentBundleKey, unknown[]>>;
  lastError: string | null;
  isPushing: boolean;
  initialized: boolean;

  bootstrapOnStartup: () => Promise<void>;
  setPullFlagEnabled: (enabled: boolean) => Promise<void>;
  pullFromDb: (forcePull?: boolean) => Promise<void>;
  pushToDb: (force?: boolean) => Promise<void>;
}

export const useContentBootstrapStore = create<ContentBootstrapState>((set, get) => ({
  pullFlagEnabled: typeof window !== 'undefined' ? readInitialPullFlag() : true,
  status: 'idle',
  storageMode: 'static-local',
  syncedAt: null,
  totalItems: 0,
  collections: [],
  bundles: {},
  lastError: null,
  isPushing: false,
  initialized: false,

  bootstrapOnStartup: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    if (!get().pullFlagEnabled) {
      set({ status: 'disabled', storageMode: 'static-local' });
      return;
    }
    await get().pullFromDb(true);
  },

  setPullFlagEnabled: async (enabled: boolean) => {
    try {
      window.localStorage.setItem(FLAG_STORAGE_KEY, String(enabled));
    } catch {
      // ignore storage errors
    }
    set({ pullFlagEnabled: enabled, lastError: null });
    if (enabled) {
      await get().pullFromDb(true);
    } else {
      set({
        status: 'disabled',
        storageMode: 'static-local',
        bundles: {},
      });
    }
  },

  pullFromDb: async (forcePull = false) => {
    const enabled = forcePull || get().pullFlagEnabled;
    if (!enabled) {
      set({ status: 'disabled', storageMode: 'static-local' });
      return;
    }

    set({ status: 'loading', lastError: null });
    try {
      const res = await apiFetch('/api/content-bootstrap?pull=1');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        pullEnabled: boolean;
        storageMode: 'mongodb' | 'in-memory' | 'static-local';
        syncedAt: string;
        totalItems: number;
        collections: ContentCollectionMeta[];
        bundles: Partial<Record<ContentBundleKey, unknown[]>>;
      };

      set({
        status: data.pullEnabled ? 'pulled' : 'disabled',
        storageMode: data.storageMode,
        syncedAt: data.syncedAt,
        totalItems: data.totalItems,
        collections: data.collections ?? [],
        bundles: data.bundles ?? {},
        lastError: null,
      });
    } catch (err) {
      set({
        status: 'error',
        storageMode: 'static-local',
        lastError: err instanceof Error ? err.message : 'Failed to pull content from DB.',
      });
    }
  },

  pushToDb: async (force = true) => {
    set({ isPushing: true, lastError: null });
    try {
      const res = await apiFetch('/api/content-bootstrap/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const report = (await res.json()) as {
        storageMode: 'mongodb' | 'in-memory';
        syncedAt: string;
        totalItems: number;
        collections: ContentCollectionMeta[];
      };

      set({
        isPushing: false,
        storageMode: report.storageMode,
        syncedAt: report.syncedAt,
        totalItems: report.totalItems,
        collections: report.collections ?? [],
        status: get().pullFlagEnabled ? 'pulled' : get().status,
      });

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
