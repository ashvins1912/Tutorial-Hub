import { useCallback, useEffect } from 'react';
import {
  type CanonicalBundlePayloadMap,
  type ContentBundleKey,
  getCanonicalFallbackBundle,
} from '../data/canonicalDataRegistry';
import {
  type BundleDataSource,
  type BundleLoadStatus,
  useContentBootstrapStore,
} from '../store/useContentBootstrapStore';

export interface AsyncCatalogResult<K extends ContentBundleKey> {
  data: CanonicalBundlePayloadMap[K];
  status: BundleLoadStatus;
  source: BundleDataSource;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<CanonicalBundlePayloadMap[K]>;
}

/**
 * Unified async catalog hook for every domain view.
 *
 * - First paint: immediately returns the canonical local dataset so the UI
 *   renders instantaneously with zero empty flash or layout shift.
 * - Background hydration: triggers a deduplicated async fetch for `key` from
 *   `/api/content-bootstrap/:key` when DB content pull is enabled.
 * - Resilient fallback: if DB is unavailable, returns null/empty, or is toggled
 *   off, seamlessly keeps the canonical local registry data.
 * - Fine-grained subscription: subscribes only to the requested `key` slice so
 *   hydrating one domain never re-renders unrelated views.
 */
export function useAsyncCatalog<K extends ContentBundleKey>(key: K): AsyncCatalogResult<K> {
  const hydrated = useContentBootstrapStore((s) => s.bundles[key]);
  const status = useContentBootstrapStore((s) => s.bundleStatus[key] ?? 'idle');
  const source = useContentBootstrapStore((s) => s.bundleSource[key] ?? 'local-fallback');
  const error = useContentBootstrapStore((s) => s.bundleError[key] ?? null);
  const pullFlagEnabled = useContentBootstrapStore((s) => s.pullFlagEnabled);
  const fetchBundle = useContentBootstrapStore((s) => s.fetchBundle);

  useEffect(() => {
    void fetchBundle(key);
  }, [key, pullFlagEnabled, fetchBundle]);

  const refresh = useCallback(
    () => fetchBundle(key, { force: true }),
    [fetchBundle, key]
  );

  const data =
    hydrated !== undefined && hydrated !== null
      ? (hydrated as CanonicalBundlePayloadMap[K])
      : getCanonicalFallbackBundle(key);

  return {
    data,
    status,
    source,
    isLoading: status === 'loading',
    error,
    refresh,
  };
}
