import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  CheckSquare,
  Cpu,
  Database,
  FileCode2,
  HardDrive,
  Lock,
  ShieldCheck,
  Square,
  Workflow,
} from 'lucide-react';
import {
  PRODUCTION_CHECKLIST,
  STACK_CHEAT_SHEETS,
  type StackCheatSheet,
} from '../../data/databaseInternalsData';
import { CopyButton, SegmentedTabBar } from '../ui';

type OpsSubTab = 'capacity' | 'security-cdc' | 'pitr-hardware' | 'cheatsheets';

interface ProductionOpsAndCapacityLabProps {
  completedChecklistIds: string[];
  onToggleChecklistId: (id: string) => void;
}

const RLS_SQL_SNIPPET = `-- 1. Enable Row-Level Security on the vector knowledge base
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base FORCE ROW LEVEL SECURITY;

-- 2. Enforce tenant isolation policy at the storage engine level
CREATE POLICY tenant_isolation_policy ON knowledge_base
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- 3. Application sets session variable per pooled transaction (safe with PgBouncer)
BEGIN;
SET LOCAL app.current_tenant_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
SELECT doc_id, title FROM knowledge_base ORDER BY embedding <=> $1 LIMIT 5;
COMMIT;`;

const RAG_SAMPLE_DOCS = [
  { id: 'doc-101', tenant: 'Tenant A (Acme)', title: 'Acme Q4 M&A Term Sheet (Confidential)', similarity: '0.94' },
  { id: 'doc-204', tenant: 'Tenant B (Globex)', title: 'Globex Payroll & Equity Ledger 2026', similarity: '0.91' },
  { id: 'doc-108', tenant: 'Tenant A (Acme)', title: 'Acme Production Runbook: Payment Retries', similarity: '0.88' },
  { id: 'doc-219', tenant: 'Tenant B (Globex)', title: 'Globex Enterprise Customer Contracts', similarity: '0.86' },
];

export function ProductionOpsAndCapacityLab({
  completedChecklistIds,
  onToggleChecklistId,
}: ProductionOpsAndCapacityLabProps) {
  const [subTab, setSubTab] = useState<OpsSubTab>('capacity');

  // Capacity Planning Calculator State
  const [rowsMillions, setRowsMillions] = useState(50);
  const [avgRowBytes, setAvgRowBytes] = useState(512);
  const [writeQps, setWriteQps] = useState(2500);
  const [readQps, setReadQps] = useState(12000);
  const [hotWorkingSetPct, setHotWorkingSetPct] = useState(20);
  const [vectorsMillions, setVectorsMillions] = useState(2);
  const [vectorDims, setVectorDims] = useState(1536);
  const [vectorQuantization, setVectorQuantization] = useState<'fp32' | 'halfvec'>('halfvec');

  // RLS Simulator State
  const [rlsEnabled, setRlsEnabled] = useState(true);
  const [activeTenant, setActiveTenant] = useState<'Tenant A (Acme)' | 'Tenant B (Globex)'>('Tenant A (Acme)');

  // CDC vs Dual-Write State
  const [pipelineMode, setPipelineMode] = useState<'cdc' | 'dual-write'>('cdc');
  const [simulatePodCrash, setSimulatePodCrash] = useState(true);

  // Stack Cheat Sheet State
  const [selectedStackId, setSelectedStackId] = useState<StackCheatSheet['id']>('postgresql');

  const capacity = useMemo(() => {
    const rawDataGb = (rowsMillions * 1_000_000 * avgRowBytes) / 1e9;
    const indexOverheadGb = rawDataGb * 0.45;
    const mvccBloatHeadroomGb = (rawDataGb + indexOverheadGb) * 0.25;
    const totalDiskGb = rawDataGb + indexOverheadGb + mvccBloatHeadroomGb;

    const hotSetGb = (rawDataGb + indexOverheadGb) * (hotWorkingSetPct / 100);

    // HNSW memory: vectors * dims * bytesPerDim * graphOverhead (~1.55x for M=16 links)
    const bytesPerDim = vectorQuantization === 'fp32' ? 4 : 2;
    const hnswRamGb = (vectorsMillions * 1_000_000 * vectorDims * bytesPerDim * 1.55) / 1e9;

    const recommendedRamGb = Math.max(8, Math.ceil((hotSetGb + hnswRamGb) / 0.7));
    const sharedBuffersGb = Number((recommendedRamGb * 0.25).toFixed(1));
    const effectiveCacheGb = Number((recommendedRamGb * 0.75).toFixed(1));

    // WAL throughput: writeQps * (avgRowBytes + index/WAL header ~1.8x write amp)
    const walMbPerSec = Number(((writeQps * avgRowBytes * 1.8) / (1024 * 1024)).toFixed(1));

    // Required IOPS: write IOPS (WAL + checkpoint dirty pages) + cache-miss reads (~3% miss on OLTP)
    const requiredIops = Math.round(writeQps * 1.6 + readQps * 0.03);

    return {
      rawDataGb: Number(rawDataGb.toFixed(1)),
      totalDiskGb: Number(totalDiskGb.toFixed(1)),
      hotSetGb: Number(hotSetGb.toFixed(1)),
      hnswRamGb: Number(hnswRamGb.toFixed(1)),
      recommendedRamGb,
      sharedBuffersGb,
      effectiveCacheGb,
      walMbPerSec,
      requiredIops,
    };
  }, [
    rowsMillions,
    avgRowBytes,
    writeQps,
    readQps,
    hotWorkingSetPct,
    vectorsMillions,
    vectorDims,
    vectorQuantization,
  ]);

  const visibleRagDocs = useMemo(
    () => (rlsEnabled ? RAG_SAMPLE_DOCS.filter((d) => d.tenant === activeTenant) : RAG_SAMPLE_DOCS),
    [rlsEnabled, activeTenant]
  );

  const activeCheatSheet = useMemo(
    () => STACK_CHEAT_SHEETS.find((s) => s.id === selectedStackId) ?? STACK_CHEAT_SHEETS[0],
    [selectedStackId]
  );

  return (
    <div className="space-y-6">
      <SegmentedTabBar<OpsSubTab>
        ariaLabel="Production engineering workspaces"
        activeTab={subTab}
        onChange={setSubTab}
        tabs={[
          { id: 'capacity', label: 'Capacity & HNSW Planner', shortLabel: 'Capacity', icon: Calculator },
          { id: 'security-cdc', label: 'Multi-Tenant RLS & CDC Pipeline', shortLabel: 'RLS & CDC', icon: ShieldCheck },
          { id: 'pitr-hardware', label: 'PITR, Hardware & Prod Checklist', shortLabel: 'PITR & Ops', icon: HardDrive },
          { id: 'cheatsheets', label: 'Stack Tuning Cheat Sheets', shortLabel: 'Cheat Sheets', icon: FileCode2 },
        ]}
      />

      {/* SUB-TAB 1: DATABASE CAPACITY PLANNING CALCULATOR */}
      {subTab === 'capacity' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Interactive Database Capacity &amp; Vector Memory Planner
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Estimate RAM, Buffer Pool (<code className="font-mono">shared_buffers</code>), NVMe IOPS, WAL replication throughput, and pgvector HNSW graph RAM before provisioning hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6 Cols: Workload Sliders */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <label htmlFor="cap-rows">Total Table Rows</label>
                    <span className="font-mono tabular-nums font-semibold">{rowsMillions}M</span>
                  </div>
                  <input
                    id="cap-rows"
                    type="range"
                    min={1}
                    max={500}
                    step={5}
                    value={rowsMillions}
                    onChange={(e) => setRowsMillions(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <label htmlFor="cap-rowbytes">Avg Row Payload</label>
                    <span className="font-mono tabular-nums font-semibold">{avgRowBytes} B</span>
                  </div>
                  <input
                    id="cap-rowbytes"
                    type="range"
                    min={128}
                    max={4096}
                    step={128}
                    value={avgRowBytes}
                    onChange={(e) => setAvgRowBytes(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <label htmlFor="cap-wqps">Write Throughput (QPS)</label>
                    <span className="font-mono tabular-nums font-semibold">{writeQps.toLocaleString()}</span>
                  </div>
                  <input
                    id="cap-wqps"
                    type="range"
                    min={100}
                    max={25000}
                    step={100}
                    value={writeQps}
                    onChange={(e) => setWriteQps(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <label htmlFor="cap-rqps">Read Throughput (QPS)</label>
                    <span className="font-mono tabular-nums font-semibold">{readQps.toLocaleString()}</span>
                  </div>
                  <input
                    id="cap-rqps"
                    type="range"
                    min={500}
                    max={80000}
                    step={500}
                    value={readQps}
                    onChange={(e) => setReadQps(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <label htmlFor="cap-hot">Hot Active Working Set in RAM</label>
                  <span className="font-mono tabular-nums font-semibold">{hotWorkingSetPct}%</span>
                </div>
                <input
                  id="cap-hot"
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={hotWorkingSetPct}
                  onChange={(e) => setHotWorkingSetPct(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    AI RAG / pgvector HNSW Index Footprint
                  </span>
                  <SegmentedTabBar<'fp32' | 'halfvec'>
                    ariaLabel="Vector precision"
                    activeTab={vectorQuantization}
                    onChange={setVectorQuantization}
                    size="xs"
                    tabs={[
                      { id: 'fp32', label: 'vector (fp32)' },
                      { id: 'halfvec', label: 'halfvec (fp16 · -50% RAM)' },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <label htmlFor="cap-vecs">Embedded Vectors</label>
                      <span className="font-mono tabular-nums font-semibold">{vectorsMillions}M</span>
                    </div>
                    <input
                      id="cap-vecs"
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={vectorsMillions}
                      onChange={(e) => setVectorsMillions(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <label htmlFor="cap-dims">Embedding Dimensions</label>
                      <span className="font-mono tabular-nums font-semibold">{vectorDims}d</span>
                    </div>
                    <select
                      id="cap-dims"
                      value={vectorDims}
                      onChange={(e) => setVectorDims(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
                    >
                      <option value={768}>768 dims</option>
                      <option value={1024}>1024 dims</option>
                      <option value={1536}>1536 dims (Standard)</option>
                      <option value={3072}>3072 dims (Large)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Computed Hardware & Postgres Config Sizing */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Recommended RAM', value: `${capacity.recommendedRamGb} GB`, sub: `shared_buffers: ${capacity.sharedBuffersGb} GB` },
                  { label: 'HNSW Vector RAM', value: `${capacity.hnswRamGb} GB`, sub: vectorQuantization === 'halfvec' ? 'fp16 quantized' : 'fp32 full precision' },
                  { label: 'Provisioned Disk', value: `${capacity.totalDiskGb} GB`, sub: `Raw: ${capacity.rawDataGb} GB + Indexes` },
                  { label: 'Required NVMe IOPS', value: capacity.requiredIops.toLocaleString(), sub: 'Sustained OLTP + Checkpoint' },
                  { label: 'WAL Write Rate', value: `${capacity.walMbPerSec} MB/s`, sub: 'Replica network floor' },
                  { label: 'effective_cache_size', value: `${capacity.effectiveCacheGb} GB`, sub: `Hot set: ${capacity.hotSetGb} GB` },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5"
                  >
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{metric.label}</div>
                    <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                      {metric.value}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {metric.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Sizing Sanity Checks
                </div>
                <p>
                  • Keep <strong>Hot Working Set ({capacity.hotSetGb} GB) + HNSW Vector Index ({capacity.hnswRamGb} GB)</strong> under 70% of total RAM so graph traversals never hit disk page faults.
                </p>
                <p>
                  • Provision cross-AZ replication links for at least <strong>{(capacity.walMbPerSec * 2.5).toFixed(0)} MB/s</strong> burst capacity to avoid streaming replica lag during bulk backfills or index builds.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUB-TAB 2: MULTI-TENANT RLS FOR AI RAG & LOG-BASED CDC VS DUAL WRITES */}
      {subTab === 'security-cdc' && (
        <div className="space-y-6">
          {/* Interactive Multi-Tenant RLS Lab */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Multi-Tenant Row-Level Security (RLS) Simulator for AI RAG
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Test what happens when a developer forgets <code className="font-mono">WHERE tenant_id = ?</code> on a vector similarity search.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRlsEnabled((v) => !v)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                    rlsEnabled
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {rlsEnabled ? 'RLS Policy: ENABLED (Engine-Enforced)' : 'RLS Policy: DISABLED (App Filter Missing)'}
                </button>
                <SegmentedTabBar<'Tenant A (Acme)' | 'Tenant B (Globex)'>
                  ariaLabel="Active session tenant"
                  activeTab={activeTenant}
                  onChange={setActiveTenant}
                  size="xs"
                  tabs={[
                    { id: 'Tenant A (Acme)', label: 'Session: Tenant A' },
                    { id: 'Tenant B (Globex)', label: 'Session: Tenant B' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PostgreSQL Engine Policy + PgBouncer-Safe SET LOCAL
                  </span>
                  <CopyButton text={RLS_SQL_SNIPPET} label="Copy RLS SQL" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {RLS_SQL_SNIPPET}
                </pre>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    Executed: SELECT doc_id, title FROM knowledge_base;
                  </span>
                  <span
                    className={`font-semibold ${
                      rlsEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {rlsEnabled ? 'Zero Cross-Tenant Leak' : 'CRITICAL: Cross-Tenant Data Leak'}
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {visibleRagDocs.map((doc) => {
                    const isLeak = doc.tenant !== activeTenant;
                    return (
                      <div
                        key={doc.id}
                        className={`p-3 flex items-center justify-between gap-3 text-xs ${
                          isLeak
                            ? 'bg-rose-50/70 dark:bg-rose-950/30'
                            : 'bg-slate-50/50 dark:bg-slate-950/40'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {doc.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {doc.id} · Owner: {doc.tenant}
                          </div>
                        </div>
                        <span
                          className={`font-mono font-semibold whitespace-nowrap shrink-0 ${
                            isLeak
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {isLeak ? 'LEAKED' : `sim ${doc.similarity}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                  Pair RLS with <strong>Column-Level Encryption</strong> (Envelope KMS keys for PII/tokens), <strong>Dynamic Data Masking</strong> for support roles, and strict <strong>Parameterized Queries</strong> to eliminate SQL injection.
                </p>
              </div>
            </div>
          </section>

          {/* Log-Based CDC vs Dual-Write Pipeline */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Change Data Capture (CDC): Solving the Dual-Write Problem
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Compare fragile application dual-writes against WAL logical decoding (<code className="font-mono">Debezium -&gt; Kafka -&gt; Vector DB / Redis / Snowflake</code>).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedTabBar<'cdc' | 'dual-write'>
                  ariaLabel="Streaming sync architecture"
                  activeTab={pipelineMode}
                  onChange={setPipelineMode}
                  size="xs"
                  tabs={[
                    { id: 'cdc', label: 'Log-Based CDC (Production)' },
                    { id: 'dual-write', label: 'Dual Writes (Anti-Pattern)' },
                  ]}
                />
                <button
                  type="button"
                  onClick={() => setSimulatePodCrash((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                    simulatePodCrash
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {simulatePodCrash ? 'Pod Crash Mid-Request: ON' : 'Pod Crash Mid-Request: OFF'}
                </button>
              </div>
            </div>

            {pipelineMode === 'cdc' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {[
                    {
                      step: '01. Atomic Commit',
                      title: 'App -> PostgreSQL Only',
                      detail: 'Single local ACID transaction commits to PostgreSQL. Zero synchronous HTTP fan-out.',
                    },
                    {
                      step: '02. Logical WAL',
                      title: 'wal_level = logical',
                      detail: 'PostgreSQL records ordered committed row deltas durably in its Write-Ahead Log.',
                    },
                    {
                      step: '03. Replication Slot',
                      title: 'Debezium -> Apache Kafka',
                      detail: 'Debezium tails the replication slot and emits Avro/JSON change events with offset checkpoints.',
                    },
                    {
                      step: '04. Downstream Sync',
                      title: 'Vector DB · Redis · Snowflake',
                      detail: 'Independent consumers re-embed text, invalidate caches, and stream OLAP tables with at-least-once delivery.',
                    },
                  ].map((node) => (
                    <div
                      key={node.step}
                      className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1"
                    >
                      <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">{node.step}</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{node.title}</div>
                      <p className="text-slate-600 dark:text-slate-400 leading-5">{node.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {simulatePodCrash
                      ? 'Pod crashed right after DB commit — Debezium still reads the committed WAL entry and updates Pinecone, Redis, and Snowflake automatically.'
                      : 'Nominal operation — sub-second end-to-end streaming with zero drift across polyglot stores.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1">
                    <div className="font-mono text-[11px] text-slate-500">01. Write #1</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">COMMIT to PostgreSQL</div>
                    <p className="text-emerald-700 dark:text-emerald-400">Succeeded — row persisted.</p>
                  </div>
                  <div
                    className={`rounded-lg border p-3.5 space-y-1 ${
                      simulatePodCrash
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="font-mono text-[11px] text-slate-500">02. HTTP Call #2</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">POST Vector DB / Elasticsearch</div>
                    <p className={simulatePodCrash ? 'text-rose-700 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                      {simulatePodCrash ? 'FAILED: App pod OOM-killed before HTTP call finished!' : 'Succeeded (adds tail latency).'}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border p-3.5 space-y-1 ${
                      simulatePodCrash
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="font-mono text-[11px] text-slate-500">03. Outcome</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Permanent Data Drift</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {simulatePodCrash
                        ? 'Postgres has the new document; AI RAG vector index & Redis are permanently stale.'
                        : 'Concurrent updates can still arrive out-of-order across services.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Avoid dual writes across independent datastores. Use Transactional Outbox or WAL Log-Based CDC.</span>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUB-TAB 3: PITR, HARDWARE PHYSICS & PRODUCTION CHECKLIST */}
      {subTab === 'pitr-hardware' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Hardware, OS &amp; Storage Physics
              </h2>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                  <strong className="text-slate-900 dark:text-slate-100">Double Buffering (OS Page Cache vs. DB Buffer Pool):</strong>{' '}
                  PostgreSQL reads through the Linux Page Cache (hence <code className="font-mono">shared_buffers = 25%</code> RAM so OS caches the rest). MySQL InnoDB uses <code className="font-mono">O_DIRECT</code> to bypass OS caching and claim 70–75% RAM directly.
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                  <strong className="text-slate-900 dark:text-slate-100">fsync() &amp; NVMe IOPS Limits:</strong>{' '}
                  ACID durability requires <code className="font-mono">fsync()</code> flushing WAL sectors to non-volatile media on commit. Group commit batches concurrent WAL flushes to stay within EBS/NVMe IOPS ceilings.
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                  <strong className="text-slate-900 dark:text-slate-100">TOAST (Oversized Attribute Storage Technique):</strong>{' '}
                  PostgreSQL rows cannot span 8KB pages. Columns &gt;2KB (large JSONB/text/vectors) are transparently compressed (LZ4/pglz) and moved out-of-line into a secondary TOAST table.
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Disaster Recovery (PITR, RPO/RTO) &amp; Observability
              </h2>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 space-y-1.5">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Point-in-Time Recovery (PITR) Timeline
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-sky-700 dark:text-sky-400">
                    <span>Nightly Base Backup (00:00)</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    <span>Continuous WAL to S3 (pgBackRest)</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    <span className="text-emerald-700 dark:text-emerald-400">Restore: 19:22:59 (1s before DROP TABLE)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Target <strong>RPO</strong> (max acceptable data loss: &lt;1 min via WAL shipping) and <strong>RTO</strong> (max downtime: &lt;15 min via warm standby + automated restore drills).
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                  <strong className="text-slate-900 dark:text-slate-100">Critical Telemetry Signals:</strong>{' '}
                  Track <code className="font-mono">pg_stat_statements</code> (total/mean time &amp; shared block reads), <code className="font-mono">age(datfrozenxid)</code> (2B TXID wraparound shutdown cliff), replica replay lag bytes, and RED/USE saturation metrics.
                </div>
              </div>
            </section>
          </div>

          {/* Persistent Production Table Orchestration Checklist */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Production-Ready Table Orchestration &amp; Data Strategy Checklist
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Check off each Staff-level production safeguard as you verify it in your stack (synced to your account).
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
                {completedChecklistIds.length} / {PRODUCTION_CHECKLIST.length} Verified
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
              {PRODUCTION_CHECKLIST.map((item) => {
                const checked = completedChecklistIds.includes(item.id);
                return (
                  <div key={item.id} className="p-4 flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => onToggleChecklistId(item.id)}
                      aria-label={`Toggle ${item.title}`}
                      className="mt-0.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 shrink-0"
                    >
                      {checked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Square className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-sky-700 dark:text-sky-400">{item.category}</span>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          checked
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {item.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">{item.rationale}</p>
                      <pre className="p-2.5 rounded-md bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                        {item.commandSnippet}
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* SUB-TAB 4: CUSTOM STACK TUNING CHEAT SHEET GENERATOR */}
      {subTab === 'cheatsheets' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Stack-Specific Production Tuning Cheat Sheet
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Select your target database engine for tailored diagnostic commands, tuning rules, and baseline configuration.
              </p>
            </div>
            <SegmentedTabBar<StackCheatSheet['id']>
              ariaLabel="Target database stack"
              activeTab={selectedStackId}
              onChange={setSelectedStackId}
              size="xs"
              tabs={STACK_CHEAT_SHEETS.map((s) => ({ id: s.id, label: s.name.split(' ')[0] }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{activeCheatSheet.name}</span>
            <span aria-hidden="true">·</span>
            <span>{activeCheatSheet.engineType}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{activeCheatSheet.primaryStorage}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              {activeCheatSheet.rules.map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-1.5"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.title}</div>
                  <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400 break-words">
                    {rule.metricOrCommand}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">{rule.guidance}</p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Diagnostic Command
                  </span>
                  <CopyButton text={activeCheatSheet.topDiagnosticCommand} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
                  {activeCheatSheet.topDiagnosticCommand}
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Production Golden Baseline
                  </span>
                  <CopyButton text={activeCheatSheet.goldenConfig} label="Copy Config" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {activeCheatSheet.goldenConfig}
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
