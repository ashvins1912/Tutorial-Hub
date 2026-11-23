import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  Code2,
  Database,
  ShieldAlert,
  Square,
  Terminal,
} from 'lucide-react';
import {
  FAILURE_MODE_RUNBOOKS,
  type FailureModeRunbook,
} from '../../data/fullStackArchitectureData';
import {
  STORAGE_DEEP_ALGORITHMS,
  STORAGE_DIAGNOSTICS_MERMAID,
} from '../../data/fullStackDeepEnrichmentData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton, SegmentedTabBar } from '../ui';

interface StorageAndDiagnosticsLabProps {
  verifiedRunbookIds: string[];
  onToggleRunbook: (id: string) => void;
}

type LayerFilter = 'All' | FailureModeRunbook['layer'];

export function StorageAndDiagnosticsLab({
  verifiedRunbookIds,
  onToggleRunbook,
}: StorageAndDiagnosticsLabProps) {
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('All');

  const filteredRunbooks = useMemo(
    () =>
      layerFilter === 'All'
        ? FAILURE_MODE_RUNBOOKS
        : FAILURE_MODE_RUNBOOKS.filter((r) => r.layer === layerFilter),
    [layerFilter]
  );

  return (
    <div className="space-y-6">
      {/* Section 7: Database, ORM Pooling, Vector Indexing & Safetensors Storage */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div>
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Section 07 · Persistence, Connection Pooling &amp; Vector Storage Internals
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            ORMs, Relational Engines, Vector Indexes &amp; Memory-Mapped Model Weights
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs leading-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              1. ORMs &amp; Binary Wire Connection Pools
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Hibernate/JPA</strong>, <strong>SQLAlchemy AsyncSession</strong>, <strong>Prisma</strong>, and <strong>GORM</strong> serialize queries over PostgreSQL/MySQL binary TCP protocols. Always multiplex thousands of app coroutines onto 50–100 DB backends via <strong>PgBouncer</strong> (Transaction Mode), <strong>HikariCP</strong>, or <strong>ProxySQL</strong>.
            </p>
            <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
              Prevent N+1: JOIN FETCH · selectinload() · DataLoader batching
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              2. Relational &amp; NoSQL Storage Physics
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>PostgreSQL / MySQL</strong> parse SQL into cost-based plans, mutate 8KB/16KB pages in RAM Buffer Pools, flush sequential <strong>WAL</strong> via <code className="font-mono">fsync()</code>, and isolate readers via <strong>MVCC</strong> + <strong>B+ Trees</strong>. <strong>Cassandra</strong> uses append-only <strong>LSM-Trees</strong>; <strong>Redis</strong> caches semantic RAG hits in RAM (&lt;1 ms).
            </p>
            <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
              Audit live: EXPLAIN (ANALYZE, BUFFERS) · redis-cli --latency
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              3. Vector DBs &amp; Safetensors mmap Loading
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Qdrant, Milvus, pgvector, Weaviate &amp; Pinecone</strong> search 1536-dim embeddings using <strong>HNSW</strong> skip-list graphs (RAM-heavy, high recall) or <strong>IVF-PQ</strong> compressed clusters with AVX-512 SIMD Cosine math. Model weights stream from S3/NVMe via zero-copy <code className="font-mono">mmap</code> <strong>Safetensors</strong> into GPU HBM.
            </p>
            <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
              Tip: halfvec (fp16) / binary quantization cuts HNSW RAM 2–8×
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Storage, Pooling, Vector & Safetensors Architecture DFD */}
      <FlightMermaidViewer
        title="Persistence, PgBouncer Pooling, Vector HNSW & Safetensors Architecture DFD"
        subtitle="Trace how application queries multiplex through PgBouncer into PostgreSQL WAL/B+Trees, Redis semantic caches, HNSW vector indexes, and zero-copy mmap weight loaders."
        mermaidCode={STORAGE_DIAGNOSTICS_MERMAID}
        trafficDomain="database"
        compact
      />

      {/* Live Storage & Database Traffic Flow Simulator */}
      <LiveTrafficFlowSimulator
        mermaidCode={STORAGE_DIAGNOSTICS_MERMAID}
        mermaidTitle="Storage, Cache & Vector DB Pipeline"
        domain="database"
        compact
        heading="Live Storage, Connection Pool & Vector Query Traffic Simulator"
      />

      {/* Core Storage & SRE Backpressure Algorithms */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div>
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Core Storage &amp; SRE Resilience Algorithms
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            HNSW Vector Graph Search &amp; Bounded Admission Backpressure Implementation
          </h3>
        </div>

        <div className="space-y-5">
          {STORAGE_DEEP_ALGORITHMS.map((algo) => (
            <div
              key={algo.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {algo.name}
                </h4>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 shrink-0">
                  {algo.complexity}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                <strong className="text-slate-900 dark:text-slate-100">Formal Definition: </strong>
                {algo.formalDefinition}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900">
                    <span className="text-[11px] font-mono text-slate-300">
                      Reference Code ({algo.language})
                    </span>
                    <CopyButton text={algo.code} label="Copy Code" copiedLabel="Copied" size="xs" />
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-sky-200 leading-5 overflow-x-auto">
                    {algo.code}
                  </pre>
                </div>

                <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Deep Implementation Mechanics
                  </div>
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-5 list-decimal list-inside">
                    {algo.implementationWalkthrough.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8: Production Failure Modes & Live CLI Diagnostic Runbooks */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
              Section 08 · Edge Cases, Failure Modes &amp; Production CLI Diagnostics
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Staff SRE Failure Mode &amp; Profiler Runbook ({verifiedRunbookIds.length}/{FAILURE_MODE_RUNBOOKS.length} Reviewed)
            </h2>
          </div>

          <SegmentedTabBar<LayerFilter>
            ariaLabel="Filter failure runbooks by stack layer"
            activeTab={layerFilter}
            onChange={setLayerFilter}
            size="xs"
            tabs={[
              { id: 'All', label: 'All Layers' },
              { id: 'Framework & Runtime', label: 'Frameworks', shortLabel: 'App' },
              { id: 'GPU & LLM', label: 'GPU & LLM', shortLabel: 'GPU' },
              { id: 'Database & Vector', label: 'DB & Vector', shortLabel: 'DB' },
              { id: 'OS & Network', label: 'OS & Net', shortLabel: 'Net' },
            ]}
          />
        </div>

        <div className="space-y-3">
          {filteredRunbooks.map((item) => {
            const checked = verifiedRunbookIds.includes(item.id);
            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400">
                      {item.layer}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                      {item.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleRunbook(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap shrink-0"
                  >
                    {checked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    )}
                    {checked ? 'Reviewed' : 'Mark Reviewed'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs leading-5">
                  <div className="space-y-1.5">
                    <div>
                      <strong className="text-rose-700 dark:text-rose-400">Production Symptom:</strong>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{item.symptom}</span>
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">Root Cause:</strong>{' '}
                      <span className="text-slate-600 dark:text-slate-400">{item.rootCause}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <strong className="text-emerald-700 dark:text-emerald-400">Production Fix:</strong>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{item.productionFix}</span>
                    </div>
                    <div className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
                      Key Alert Metric: {item.keyTelemetry}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5">
                  <code className="font-mono text-[11px] text-emerald-300 flex items-center gap-2 overflow-x-auto">
                    <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>{item.diagnosticCmd}</span>
                  </code>
                  <CopyButton text={item.diagnosticCmd} label="Copy CLI" copiedLabel="Copied" size="xs" />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
