import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CloudDownload,
  Database,
  HardDrive,
  Loader2,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import {
  ALL_CONTENT_BUNDLE_KEYS,
  CANONICAL_BUNDLE_DEFINITIONS,
  CONTENT_DOMAINS,
  type ContentBundleKey,
  type ContentDomainId,
  getCanonicalFallbackBundle,
  getTotalCanonicalRecordCount,
} from '../../data/canonicalDataRegistry';
import {
  type ContentCollectionMeta,
  useContentBootstrapStore,
} from '../../store/useContentBootstrapStore';

function formatKb(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatSyncTime(iso: string | null | undefined): string {
  if (!iso) return 'Not synced';
  try {
    const dt = new Date(iso);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export const DbSyncInspectorCard: React.FC = () => {
  const pullFlagEnabled = useContentBootstrapStore((s) => s.pullFlagEnabled);
  const storageMode = useContentBootstrapStore((s) => s.storageMode);
  const syncedAt = useContentBootstrapStore((s) => s.syncedAt);
  const totalBytes = useContentBootstrapStore((s) => s.totalBytes);
  const collections = useContentBootstrapStore((s) => s.collections);
  const bundleStatus = useContentBootstrapStore((s) => s.bundleStatus);
  const bundleSource = useContentBootstrapStore((s) => s.bundleSource);
  const lastError = useContentBootstrapStore((s) => s.lastError);
  const isPushing = useContentBootstrapStore((s) => s.isPushing);
  const isPullingAll = useContentBootstrapStore((s) => s.isPullingAll);

  const setPullFlagEnabled = useContentBootstrapStore((s) => s.setPullFlagEnabled);
  const fetchManifest = useContentBootstrapStore((s) => s.fetchManifest);
  const fetchBundle = useContentBootstrapStore((s) => s.fetchBundle);
  const pullAllBundles = useContentBootstrapStore((s) => s.pullAllBundles);
  const pushToDb = useContentBootstrapStore((s) => s.pushToDb);

  const [domainFilter, setDomainFilter] = useState<'all' | ContentDomainId>('all');
  const [pushSuccessMsg, setPushSuccessMsg] = useState<string | null>(null);

  const metaByKey = useMemo(() => {
    const map = new Map<ContentBundleKey, ContentCollectionMeta>();
    for (const c of collections) {
      map.set(c.collectionKey, c);
    }
    return map;
  }, [collections]);

  const rows = useMemo(() => {
    return ALL_CONTENT_BUNDLE_KEYS.map((key) => {
      const def = CANONICAL_BUNDLE_DEFINITIONS[key];
      const localCount = def.countItems(getCanonicalFallbackBundle(key) as never);
      const meta = metaByKey.get(key) ?? null;
      const status = bundleStatus[key] ?? 'idle';
      const source = bundleSource[key] ?? null;
      return {
        key,
        label: def.label,
        domain: def.domain,
        description: def.description,
        localCount,
        dbCount: meta?.itemCount ?? null,
        byteSize: meta?.byteSize ?? 0,
        schemaVersion: meta?.schemaVersion ?? '—',
        checksum: meta?.checksum ?? '—',
        syncedAt: meta?.syncedAt ?? null,
        serverSource: meta?.source ?? null,
        status,
        source,
      };
    });
  }, [metaByKey, bundleStatus, bundleSource]);

  const filteredRows = useMemo(
    () => (domainFilter === 'all' ? rows : rows.filter((r) => r.domain === domainFilter)),
    [rows, domainFilter]
  );

  const totalCanonicalRecords = useMemo(() => getTotalCanonicalRecordCount(), []);
  const syncedServerCount = collections.length;
  const hydratedLiveCount = useMemo(
    () =>
      ALL_CONTENT_BUNDLE_KEYS.filter(
        (k) => bundleSource[k] === 'mongodb' || bundleSource[k] === 'in-memory'
      ).length,
    [bundleSource]
  );

  const handlePushAll = async () => {
    setPushSuccessMsg(null);
    await pushToDb(true);
    setPushSuccessMsg(
      `Pushed all ${ALL_CONTENT_BUNDLE_KEYS.length} canonical bundles (${totalCanonicalRecords.toLocaleString()} records) to database.`
    );
  };

  const domainLabelMap = useMemo(() => {
    const map = new Map<ContentDomainId, string>();
    for (const d of CONTENT_DOMAINS) {
      map.set(d.id, d.shortLabel);
    }
    return map;
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
            <Database className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Async Catalog &amp; Database Sync Inspector</span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            Unified Content Store ({ALL_CONTENT_BUNDLE_KEYS.length} Canonical Bundles)
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Every domain pulls its dataset lazily on demand via Zustand. If the database is offline,
            disabled, or returns an empty payload, records automatically map from the single
            canonical local data registry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void setPullFlagEnabled(!pullFlagEnabled)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
              pullFlagEnabled
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            DB Pull: {pullFlagEnabled ? 'Enabled' : 'Local Only'}
          </button>

          <button
            type="button"
            onClick={() => void fetchManifest(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-400 transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Refresh Index</span>
          </button>

          <button
            type="button"
            onClick={() => void pullAllBundles()}
            disabled={isPullingAll || !pullFlagEnabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-400 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isPullingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <CloudDownload className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isPullingAll ? 'Hydrating All...' : 'Pull All 25'}</span>
          </button>

          <button
            type="button"
            onClick={() => void handlePushAll()}
            disabled={isPushing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {isPushing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isPushing ? 'Pushing All...' : 'Push All to Database'}</span>
          </button>
        </div>
      </div>

      {/* Feedback banners */}
      {pushSuccessMsg && (
        <div className="px-4 sm:px-5 py-2.5 border-b border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{pushSuccessMsg}</span>
        </div>
      )}
      {lastError && (
        <div className="px-4 sm:px-5 py-2.5 border-b border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300">
          Database request fallback active ({lastError}). Serving seamlessly from the canonical
          local data registry.
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Managed Collections
          </div>
          <div className="mt-1 text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {syncedServerCount}/{ALL_CONTENT_BUNDLE_KEYS.length}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {CONTENT_DOMAINS.length} platform domains
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Canonical Records
          </div>
          <div className="mt-1 text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {totalCanonicalRecords.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {formatKb(totalBytes)} indexed
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Active Session Hydrated
          </div>
          <div className="mt-1 text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {hydratedLiveCount}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              / {ALL_CONTENT_BUNDLE_KEYS.length} pulled
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Lazy-loaded per opened section
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Active Storage Backend
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {storageMode === 'mongodb' ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-700 dark:text-emerald-400">MongoDB Live</span>
              </>
            ) : storageMode === 'in-memory' ? (
              <>
                <HardDrive className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span className="text-sky-700 dark:text-sky-400">Server Snapshot Store</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="text-amber-700 dark:text-amber-400">Local Canonical Registry</span>
              </>
            )}
          </div>
          <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Last sync: {formatSyncTime(syncedAt)}
          </div>
        </div>
      </div>

      {/* Domain Filter Strip */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setDomainFilter('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
            domainFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({ALL_CONTENT_BUNDLE_KEYS.length})
        </button>
        {CONTENT_DOMAINS.map((domain) => {
          const count = rows.filter((r) => r.domain === domain.id).length;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => setDomainFilter(domain.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                domainFilter === domain.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {domain.shortLabel} ({count})
            </button>
          );
        })}
      </div>

      {/* Sync Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-2.5 pl-4 sm:pl-5 pr-3">Collection Bundle</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Domain</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Records (DB / Local)</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Size</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Client Hydration</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Checksum</th>
              <th className="py-2.5 pl-3 pr-4 sm:pr-5 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredRows.map((row) => {
              const isRowLoading = row.status === 'loading';
              const sourceLabel =
                row.source === 'mongodb'
                  ? 'MongoDB'
                  : row.source === 'in-memory'
                    ? 'Server Memory'
                    : row.source === 'local-fallback'
                      ? 'Local Fallback'
                      : 'Lazy (On Demand)';

              const sourceClass =
                row.source === 'mongodb'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : row.source === 'in-memory'
                    ? 'text-sky-700 dark:text-sky-400'
                    : row.source === 'local-fallback'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400';

              return (
                <tr
                  key={row.key}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 pl-4 sm:pl-5 pr-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {row.label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {row.key}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {domainLabelMap.get(row.domain) ?? row.domain}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.dbCount !== null ? row.dbCount : '—'} / {row.localCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatKb(row.byteSize)}
                  </td>
                  <td className={`py-2.5 px-3 whitespace-nowrap font-medium ${sourceClass}`}>
                    {isRowLoading ? 'Pulling...' : sourceLabel}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {row.checksum.slice(0, 10)}
                  </td>
                  <td className="py-2.5 pl-3 pr-4 sm:pr-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => void fetchBundle(row.key, { force: true })}
                      disabled={isRowLoading}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-sky-400 disabled:opacity-50 transition-colors"
                    >
                      {isRowLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <CloudDownload className="w-3 h-3" aria-hidden="true" />
                      )}
                      <span>Pull</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
