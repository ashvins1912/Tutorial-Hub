import { useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  Layers,
  Scale,
  Server,
  Zap,
} from 'lucide-react';

type WorkloadId = 'point-lookup' | 'single-update' | 'analytical-agg' | 'batch-append';

interface WorkloadSimulation {
  id: WorkloadId;
  shortLabel: string;
  title: string;
  sql: string;
  winner: 'OLTP' | 'OLAP';
  speedupLabel: string;
  explanation: string;
  oltp: {
    bytesRead: string;
    latency: string;
    pagesTouched: string;
    ioEfficiency: string;
    activeRowPages: number[]; // indices 0..5 of 8KB row pages touched
    note: string;
  };
  olap: {
    bytesRead: string;
    latency: string;
    chunksTouched: string;
    compression: string;
    activeColChunks: string[]; // subset of ['order_id','user_id','region','year','status','revenue']
    prunedRowGroups: string;
    note: string;
  };
}

const COLUMNS = ['order_id', 'user_id', 'region', 'year', 'status', 'revenue'] as const;

const SAMPLE_ROWS = [
  { id: 1041, user: 'u_19', region: 'US', year: 2025, status: 'PAID', rev: '$84' },
  { id: 1042, user: 'u_72', region: 'EU', year: 2026, status: 'PENDING', rev: '$240' },
  { id: 1043, user: 'u_08', region: 'EU', year: 2026, status: 'PAID', rev: '$510' },
  { id: 1044, user: 'u_55', region: 'APAC', year: 2026, status: 'PAID', rev: '$190' },
  { id: 1045, user: 'u_91', region: 'US', year: 2026, status: 'PAID', rev: '$320' },
  { id: 1046, user: 'u_14', region: 'US', year: 2025, status: 'REFUND', rev: '$65' },
];

const WORKLOADS: WorkloadSimulation[] = [
  {
    id: 'analytical-agg',
    shortLabel: '1. Analytical SUM (100M Rows)',
    title: 'Analytical Revenue Aggregation Across 100M Orders (20 Columns)',
    sql: `SELECT region, SUM(revenue) FROM orders WHERE year = 2026 GROUP BY region;`,
    winner: 'OLAP',
    speedupLabel: 'OLAP is ~59x faster (98% less disk I/O!)',
    explanation:
      'Row-based OLTP must pull all 20 columns of every row off disk just to read `region`, `year`, and `revenue`! Columnar OLAP (Parquet/ClickHouse/Snowflake) reads ONLY those 3 compressed column chunks, skips 2025 Row Groups via Min/Max zone maps, and sums 8 values per CPU cycle with SIMD!',
    oltp: {
      bytesRead: '18.4 GB scanned',
      latency: '14,200 ms',
      pagesTouched: '2,350,000 x 8KB pages',
      ioEfficiency: '12% useful bytes (88% wasted cols)',
      activeRowPages: [0, 1, 2, 3, 4, 5],
      note: 'Must load EVERY full row tuple (`user_id`, `status`, JSON metadata, etc.) into RAM buffers just to sum `revenue`.',
    },
    olap: {
      bytesRead: '310 MB scanned',
      latency: '240 ms',
      chunksTouched: '3 of 20 columns (Column Pruning)',
      compression: '6.4x (RLE + Dict + ZSTD)',
      activeColChunks: ['region', 'year', 'revenue'],
      prunedRowGroups: 'Skipped 65% of old 2024–2025 Row Groups via Footer Min/Max!',
      note: 'Vectorized SIMD engine reads tight contiguous `revenue` + `region` chunks and skips 17 unused columns completely.',
    },
  },
  {
    id: 'point-lookup',
    shortLabel: '2. Point Lookup (`WHERE id = 1042`)',
    title: 'Single-Order Checkout Lookup by Primary Key',
    sql: `SELECT * FROM orders WHERE order_id = 1042;`,
    winner: 'OLTP',
    speedupLabel: 'OLTP is ~180x faster (<1ms p99)',
    explanation:
      'Because OLTP stores all columns of Order #1042 contiguously in a single 8KB heap page pointed to by the Primary Key B+Tree, ONE single disk seek fetches the complete order! Columnar OLAP must decompress and stitch together all 20 separate column chunks.',
    oltp: {
      bytesRead: '16 KB (B-Tree + 1 Page)',
      latency: '0.6 ms',
      pagesTouched: '1 single 8KB heap page',
      ioEfficiency: '100% targeted single-tuple read',
      activeRowPages: [1],
      note: 'B+Tree jumps straight to Page #1 Slot #2 -> entire row returned in sub-millisecond latency!',
    },
    olap: {
      bytesRead: '4.8 MB (Decompress Chunks)',
      latency: '110 ms',
      chunksTouched: 'All 20 column chunks stitched',
      compression: 'Must decode entire 64K-row page',
      activeColChunks: ['order_id', 'user_id', 'region', 'year', 'status', 'revenue'],
      prunedRowGroups: 'Even after Row Group pruning, reconstructing 1 row reads every column!',
      note: 'Columnar stores hate `SELECT * WHERE id = X` point queries because a single row is shredded across 20 files/chunks.',
    },
  },
  {
    id: 'single-update',
    shortLabel: '3. Single-Row ACID `UPDATE`',
    title: 'Live Payment Webhook Updating 1 Order Status Atomically',
    sql: `UPDATE orders SET status = 'PAID' WHERE order_id = 1042; -- ACID WAL`,
    winner: 'OLTP',
    speedupLabel: 'OLTP wins (0.9ms ACID vs Immutable Rewrite)',
    explanation:
      'OLTP updates Order #1042 in place (appending 1 tiny WAL record + 1 MVCC tuple version in <1ms). Columnar Parquet/Iceberg files are IMMUTABLE — updating 1 single row triggers expensive Copy-on-Write file rewrites or Merge-on-Read delete files!',
    oltp: {
      bytesRead: '8 KB WAL + 1 Heap Tuple',
      latency: '0.9 ms',
      pagesTouched: '1 single page + sequential WAL',
      ioEfficiency: 'Strict ACID + Row-Level Locking',
      activeRowPages: [1],
      note: 'Built for 50,000+ concurrent single-row mutations/sec with exact ACID isolation & zero file fragmentation.',
    },
    olap: {
      bytesRead: '128 MB Parquet Rewrite!',
      latency: '1,850 ms (Copy-on-Write)',
      chunksTouched: 'Re-encodes full Row Group',
      compression: 'Small-File Explosion risk!',
      activeColChunks: ['order_id', 'user_id', 'region', 'year', 'status', 'revenue'],
      prunedRowGroups: 'Never run high-frequency single-row UPDATEs directly on Parquet/Iceberg!',
      note: 'Stream single-row OLTP updates via CDC into batched Micro-Batch MERGEs every 1–15 minutes instead.',
    },
  },
  {
    id: 'batch-append',
    shortLabel: '4. Bulk Batch Ingest (5M Rows)',
    title: 'Nightly / Streaming Micro-Batch Load of 5M Telemetry Events',
    sql: `COPY INTO lakehouse.orders FROM 's3://stage/batch_5m.parquet';`,
    winner: 'OLAP',
    speedupLabel: 'OLAP ingests 15x faster & 6x smaller on disk',
    explanation:
      'Inserting 5M rows into an indexed OLTP table triggers millions of random B-Tree page splits, WAL fsyncs, and MVCC overhead. Columnar OLAP sorts, RLE/Dictionary-compresses, and streams sequential 256MB Parquet files straight to cheap S3/GCS object storage!',
    oltp: {
      bytesRead: '4.2 GB WAL + 5 B-Tree Splits',
      latency: '48,000 ms (Write Amp)',
      pagesTouched: 'Random B-Tree index updates',
      ioEfficiency: 'High RAM/NVMe cost per TB',
      activeRowPages: [0, 1, 2, 3, 4, 5],
      note: 'Updating 4–5 secondary B-Tree indexes per inserted row creates heavy random I/O write amplification.',
    },
    olap: {
      bytesRead: '680 MB Sequential Parquet',
      latency: '3,100 ms (Bulk Append)',
      chunksTouched: 'Sequential Columnar Row Groups',
      compression: '6.2x compression on S3 ($0.02/GB)',
      activeColChunks: ['order_id', 'user_id', 'region', 'year', 'status', 'revenue'],
      prunedRowGroups: 'Writes sorted Min/Max footer statistics automatically for instant future pruning!',
      note: 'Zero random B-Tree maintenance; atomic Iceberg/Delta catalog pointer exposes all 5M rows instantaneously.',
    },
  },
];

const COMPARISON_MATRIX = [
  {
    dimension: 'Primary Purpose',
    oltp: 'Live operational apps: checkouts, bank transfers, bookings, user auth.',
    olap: 'BI dashboards, historical trends, data science, ML training & AI Lakehouses.',
  },
  {
    dimension: 'Physical Storage Layout',
    oltp: 'Row-Oriented (8KB Heap Pages — all columns of 1 row stored together).',
    olap: 'Column-Oriented (Parquet/ORC Column Chunks — all values of 1 column together).',
  },
  {
    dimension: 'Concurrency & Consistency',
    oltp: 'Strict ACID Transactions, MVCC row snapshots, row-level locking, WAL fsync.',
    olap: 'Snapshot Isolation (Iceberg/Delta), Write-Audit-Publish (WAP), batch/micro-batch MERGE.',
  },
  {
    dimension: 'Indexing Strategy',
    oltp: 'B+Trees, Hash Indexes, Covering Indexes (`INCLUDE`) for O(log N) point seeks.',
    olap: 'Min/Max Zone Maps, Bloom Filters, Partitioning, Z-Order Clustering (skip files!).',
  },
  {
    dimension: 'Compression & CPU Execution',
    oltp: 'Modest (~1.5x, mixed types per row), tuple-at-a-time volcano executor.',
    olap: 'Massive (5x–10x via Dictionary, RLE, Delta + ZSTD), SIMD Vectorized execution.',
  },
  {
    dimension: 'Schema & Modeling Style',
    oltp: 'Normalized 3NF (zero update anomalies, strict Foreign Keys).',
    olap: 'Dimensional Star Schema (Fact + SCD Type 2 Dimensions) & Medallion (Bronze/Silver/Gold).',
  },
  {
    dimension: 'Representative Systems',
    oltp: 'PostgreSQL, MySQL/InnoDB, Oracle, CockroachDB, Cloud Spanner, DynamoDB.',
    olap: 'Snowflake, Databricks (Delta), BigQuery, ClickHouse, Apache Iceberg + Trino/DuckDB.',
  },
];

export function OltpVsOlapArchitectureLab() {
  const [workloadId, setWorkloadId] = useState<WorkloadId>('analytical-agg');
  const active = WORKLOADS.find((w) => w.id === workloadId) ?? WORKLOADS[0];

  return (
    <div className="space-y-5">
      {/* Header & Workload Selector */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Storage Engine Architecture Comparison
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              OLTP (Row-Based ACID) vs. OLAP (Columnar Batch-Processing) Interactive Visualizer
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Switch between 4 real production SQL workloads below to watch exactly how disk pages, column pruning, Min/Max zone maps, and ACID locks behave differently on Row Stores vs. Columnar Lakehouses!
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold shrink-0 ${
              active.winner === 'OLTP'
                ? 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            Winner: {active.speedupLabel}
          </div>
        </div>

        {/* 4 Interactive Workload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {WORKLOADS.map((w) => {
            const selected = w.id === active.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setWorkloadId(w.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {w.shortLabel}
                </div>
                <div className="text-[10px] font-mono text-sky-700 dark:text-sky-400 mt-1">
                  Best on: {w.winner}
                </div>
              </button>
            );
          })}
        </div>

        {/* Executed Query & Plain-English Insight */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5">
          <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
            {active.sql}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {active.explanation}
          </p>
        </div>
      </div>

      {/* Side-by-Side Visual Storage Layout: Row-Store Heap Pages vs Columnar Parquet Chunks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT PANEL: OLTP ROW-BASED STORAGE */}
        <div
          className={`border rounded-xl bg-white dark:bg-slate-900 overflow-hidden ${
            active.winner === 'OLTP'
              ? 'border-sky-400 dark:border-sky-700'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  OLTP: Row-Based Storage (8KB Heap + WAL)
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  PostgreSQL / MySQL InnoDB / Spanner
                </p>
              </div>
            </div>
            {active.winner === 'OLTP' && (
              <span className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
              </span>
            )}
          </div>

          <div className="p-4 space-y-4">
            {/* OLTP Live Telemetry */}
            <div className="grid grid-cols-2 gap-2.5 font-mono tabular-nums text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[9px] text-slate-500">DISK I/O</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {active.oltp.bytesRead}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[9px] text-slate-500">EST. LATENCY</div>
                <div
                  className={`font-bold mt-0.5 ${
                    active.winner === 'OLTP'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {active.oltp.latency}
                </div>
              </div>
            </div>

            {/* Visual Horizontal Row-Store Disk Blocks */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Physical Disk Layout: Contiguous Row Tuples</span>
                <span>Blue = Read Into RAM</span>
              </div>
              <div className="space-y-1.5">
                {SAMPLE_ROWS.map((row, idx) => {
                  const touched = active.oltp.activeRowPages.includes(idx);
                  return (
                    <div
                      key={row.id}
                      className={`p-2 rounded-lg border font-mono text-[10px] flex flex-wrap items-center justify-between gap-1.5 transition-colors ${
                        touched
                          ? 'border-sky-400 dark:border-sky-700 bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="font-bold text-sky-700 dark:text-sky-400">
                        Page #{idx}
                      </span>
                      <span>id:{row.id}</span>
                      <span>usr:{row.user}</span>
                      <span>reg:{row.region}</span>
                      <span>yr:{row.year}</span>
                      <span>st:{row.status}</span>
                      <span className="font-semibold">rev:{row.rev}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="font-mono text-[10px] uppercase text-sky-700 dark:text-sky-400 block mb-1">
                {active.oltp.pagesTouched} · {active.oltp.ioEfficiency}
              </strong>
              {active.oltp.note}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: OLAP COLUMNAR STORAGE */}
        <div
          className={`border rounded-xl bg-white dark:bg-slate-900 overflow-hidden ${
            active.winner === 'OLAP'
              ? 'border-emerald-400 dark:border-emerald-700'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  OLAP: Columnar Storage (Parquet / Iceberg / SIMD)
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  Snowflake / Databricks / ClickHouse / BigQuery
                </p>
              </div>
            </div>
            {active.winner === 'OLAP' && (
              <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
              </span>
            )}
          </div>

          <div className="p-4 space-y-4">
            {/* OLAP Live Telemetry */}
            <div className="grid grid-cols-2 gap-2.5 font-mono tabular-nums text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[9px] text-slate-500">DISK I/O</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {active.olap.bytesRead}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[9px] text-slate-500">EST. LATENCY</div>
                <div
                  className={`font-bold mt-0.5 ${
                    active.winner === 'OLAP'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {active.olap.latency}
                </div>
              </div>
            </div>

            {/* Visual Vertical Columnar Chunks */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Physical Disk Layout: Compressed Column Chunks</span>
                <span>Green = Read · Dim = Pruned!</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {COLUMNS.map((col) => {
                  const activeCol = active.olap.activeColChunks.includes(col);
                  const values =
                    col === 'order_id'
                      ? ['1041', '1042', '1043', '1044', '1045', '1046']
                      : col === 'user_id'
                        ? ['u_19', 'u_72', 'u_08', 'u_55', 'u_91', 'u_14']
                        : col === 'region'
                          ? ['US', 'EU', 'EU', 'APAC', 'US', 'US']
                          : col === 'year'
                            ? ['2025', '2026', '2026', '2026', '2026', '2025']
                            : col === 'status'
                              ? ['PAID', 'PEND', 'PAID', 'PAID', 'PAID', 'REF']
                              : ['$84', '$240', '$510', '$190', '$320', '$65'];
                  return (
                    <div
                      key={col}
                      className={`rounded-lg border overflow-hidden font-mono text-[9.5px] transition-colors ${
                        activeCol
                          ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 opacity-50'
                      }`}
                    >
                      <div className="px-1.5 py-1 border-b border-inherit font-bold text-center truncate">
                        {col}
                      </div>
                      <div className="p-1.5 space-y-0.5 text-center tabular-nums">
                        {values.map((v, i) => (
                          <div key={i}>{v}</div>
                        ))}
                      </div>
                      <div className="px-1 py-0.5 border-t border-inherit text-[8.5px] text-center font-semibold">
                        {activeCol ? 'READ' : 'SKIP'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400 pt-0.5">
                Parquet Footer Zone Map: {active.olap.prunedRowGroups}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-400 block mb-1">
                {active.olap.chunksTouched} · {active.olap.compression}
              </strong>
              {active.olap.note}
            </div>
          </div>
        </div>
      </div>

      {/* Bridging OLTP -> OLAP in Modern Production (CDC / HTAP Pattern) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          How Production Systems Combine Both (The Modern Data &amp; AI Bridge)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
            <div className="font-mono text-[10px] text-sky-700 dark:text-sky-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> 1. OLTP Source
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              PostgreSQL/MySQL handles live user checkouts with strict 3NF &amp; ACID row locks.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
            <div className="font-mono text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> 2. WAL CDC Stream
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Debezium reads sequential WAL logs into Kafka with zero OLTP scan impact.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
            <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" /> 3. OLAP Lakehouse
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Iceberg/Delta batches updates into compressed Parquet Gold Star &amp; SCD2 tables.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
            <div className="font-mono text-[10px] text-violet-700 dark:text-violet-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> 4. AI &amp; BI Serving
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              BI dashboards, ML training sets, and Online Feature Stores / Vector DBs stay synced!
            </p>
          </div>
        </div>
      </div>

      {/* Full Side-by-Side Architecture Comparison Matrix */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Complete OLTP vs. OLAP Architectural Comparison Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500">
              <tr>
                <th className="px-4 py-2.5 w-48">Dimension</th>
                <th className="px-4 py-2.5 text-sky-700 dark:text-sky-400">OLTP (Row-Based ACID)</th>
                <th className="px-4 py-2.5 text-emerald-700 dark:text-emerald-400">
                  OLAP (Columnar Batch / Lakehouse)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {COMPARISON_MATRIX.map((row) => (
                <tr key={row.dimension} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {row.dimension}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {row.oltp}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {row.olap}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
