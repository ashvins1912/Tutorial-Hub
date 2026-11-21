import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Flame,
  Gauge,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  DYNAMO_VS_PG_COMPARISON,
  EXPLAIN_BOTTLENECKS,
} from '../../data/databaseInternalsData';
import { CopyButton, SegmentedTabBar } from '../ui';

type LabSubTab = 'pg-explain' | 'nosql-audit' | 'dynamo-vs-pg';

const SLOW_QUERY_SQL = `EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, total_amount, created_at
FROM orders
WHERE LOWER(customer_email) = 'priya.sharma@example.in'
  AND status = 'SHIPPED'
ORDER BY created_at DESC
LIMIT 20;`;

const BEFORE_PLAN = `Limit  (cost=412890.12..412892.45 rows=20 width=32) (actual time=1478.210..1479.004 rows=20 loops=1)
  ->  Sort  (cost=412890.12..413102.80 rows=85072 width=32) (actual time=1478.205..1478.990 rows=20 loops=1)
        Sort Key: created_at DESC
        Sort Method: external merge  Disk: 14208kB
        Buffers: shared hit=1240 read=184920, temp read=1776 written=1780
        ->  Seq Scan on orders  (cost=0.00..405120.00 rows=85072 width=32) (actual time=0.412..1410.550 rows=94210 loops=1)
              Filter: ((status = 'SHIPPED'::text) AND (lower(customer_email) = 'priya.sharma@example.in'::text))
              Rows Removed by Filter: 19905790
Execution Time: 1480.120 ms`;

const PRODUCTION_FIX_SQL = `-- Create a composite partial + covering index aligned with the exact query pattern
CREATE INDEX CONCURRENTLY idx_orders_email_shipped_covering
ON orders (LOWER(customer_email), created_at DESC)
INCLUDE (order_id, total_amount)
WHERE status = 'SHIPPED';

-- Refresh planner statistics
ANALYZE orders;`;

const AFTER_PLAN = `Limit  (cost=0.56..14.82 rows=20 width=32) (actual time=0.042..0.068 rows=20 loops=1)
  ->  Index Only Scan using idx_orders_email_shipped_covering on orders  (cost=0.56..67120.40 rows=94210 width=32) (actual time=0.040..0.061 rows=20 loops=1)
        Index Cond: (lower(customer_email) = 'priya.sharma@example.in'::text)
        Heap Fetches: 0
        Buffers: shared hit=5
Execution Time: 0.095 ms`;

const DYNAMO_SINGLE_TABLE_CODE = `// DynamoDB Single-Table Design — Orders + Items + Invoices in 1 Table
// Partition Key (PK) + Sort Key (SK) + GSI1 (Status Timeline)
{
  "PK": "TENANT#acme#CUST#priya",
  "SK": "ORDER#2026-11-21T14:20:00Z#ord_991",
  "GSI1PK": "TENANT#acme#STATUS#SHIPPED",
  "GSI1SK": "2026-11-21T14:20:00Z#ord_991",
  "totalAmount": 4250,
  "entityType": "ORDER"
}
// Hot-Key Mitigation: Salt write-heavy partition keys
// PK = "TENANT#mega#SHARD#" + (hash(orderId) % 16)`;

const PG_JSONB_SCHEMA_CODE = `-- PostgreSQL Hybrid Relational + JSONB Schema
CREATE TABLE orders (
  order_id       UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  customer_email TEXT NOT NULL,
  status         TEXT NOT NULL,
  total_amount   NUMERIC(12,2) NOT NULL,
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Fast structured OLTP + flexible attribute filtering
CREATE INDEX CONCURRENTLY idx_orders_esr ON orders (tenant_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_orders_meta_gin ON orders USING GIN (metadata jsonb_path_ops);`;

export function ExplainAndNoSqlLab() {
  const [subTab, setSubTab] = useState<LabSubTab>('pg-explain');
  const [planPhase, setPlanPhase] = useState<'before' | 'after'>('before');
  const [selectedBottleneckId, setSelectedBottleneckId] = useState(EXPLAIN_BOTTLENECKS[0].id);

  // MongoDB ESR Rule Interactive State
  const [mongoIndexOrder, setMongoIndexOrder] = useState<'none' | 'range-first' | 'esr-optimal'>('range-first');

  // Cassandra Tombstone Trap Interactive State
  const [tombstonesPerScan, setTombstonesPerScan] = useState(115_000);

  const selectedBottleneck = useMemo(
    () => EXPLAIN_BOTTLENECKS.find((b) => b.id === selectedBottleneckId) ?? EXPLAIN_BOTTLENECKS[0],
    [selectedBottleneckId]
  );

  const mongoStats = useMemo(() => {
    if (mongoIndexOrder === 'esr-optimal') {
      return {
        stage: 'IXSCAN -> FETCH (Zero In-Memory SORT)',
        indexSpec: '{ status: 1, priority: -1, createdAt: 1 }  // Equality -> Sort -> Range',
        docsExamined: 10,
        keysExamined: 10,
        nReturned: 10,
        ratio: '1.0 : 1',
        latencyMs: 1.8,
        healthy: true,
        note: 'Optimal ESR alignment: Equality pins exact prefix, Sort streams keys in order, Range bounds scan cleanly.',
      };
    }
    if (mongoIndexOrder === 'range-first') {
      return {
        stage: 'IXSCAN -> FETCH -> SORT (Blocking 32MB Memory Limit Risk)',
        indexSpec: '{ createdAt: 1, status: 1, priority: -1 }  // Range-First Anti-Pattern',
        docsExamined: 142_800,
        keysExamined: 142_800,
        nReturned: 10,
        ratio: '14,280 : 1',
        latencyMs: 390,
        healthy: false,
        note: 'Leading with Range (createdAt) breaks index sort order on priority, forcing MongoDB to examine 142K docs and run a blocking SORT.',
      };
    }
    return {
      stage: 'COLLSCAN -> SORT (Full Collection Scan)',
      indexSpec: 'No matching index',
      docsExamined: 500_000,
      keysExamined: 0,
      nReturned: 10,
      ratio: '50,000 : 1',
      latencyMs: 1640,
      healthy: false,
      note: 'Scanning 500,000 documents to return 10 saturates WiredTiger cache and risks hitting the 32MB in-memory sort abort.',
    };
  }, [mongoIndexOrder]);

  const cassandraState = useMemo(() => {
    if (tombstonesPerScan >= 100_000) {
      return {
        status: 'ABORTED: TombstoneOverwhelmingException',
        tone: 'text-rose-700 dark:text-rose-400',
        gcPauseMs: Math.round(1800 + (tombstonesPerScan - 100_000) * 0.025),
        summary:
          'Exceeded tombstone_failure_threshold (100,000). Coordinator aborts read immediately to protect JVM heap from OutOfMemoryError.',
      };
    }
    if (tombstonesPerScan >= 1_000) {
      return {
        status: 'WARNING: High Tombstone Scan (GC Pressure)',
        tone: 'text-amber-700 dark:text-amber-400',
        gcPauseMs: Math.round(120 + tombstonesPerScan * 0.015),
        summary:
          'Exceeded tombstone_warn_threshold (1,000). Young/Old-Gen JVM GC spikes and tail latency degrades across SSTables.',
      };
    }
    return {
      status: 'NOMINAL: Clean SSTable Read Path',
      tone: 'text-emerald-700 dark:text-emerald-400',
      gcPauseMs: 14,
      summary:
        'Tombstone count is well below warn threshold. Bloom filters + TWCS compaction keep read latency low and predictable.',
    };
  }, [tombstonesPerScan]);

  return (
    <div className="space-y-6">
      <SegmentedTabBar<LabSubTab>
        ariaLabel="Query plan debugging labs"
        activeTab={subTab}
        onChange={setSubTab}
        tabs={[
          { id: 'pg-explain', label: 'PostgreSQL EXPLAIN ANALYZE Lab', shortLabel: 'PG EXPLAIN', icon: Terminal },
          { id: 'nosql-audit', label: 'NoSQL Query Plans (Mongo, Cassandra, Dynamo)', shortLabel: 'NoSQL Plans', icon: Flame },
          { id: 'dynamo-vs-pg', label: 'DynamoDB Single-Table vs. Postgres JSONB', shortLabel: 'Dynamo vs PG', icon: Layers },
        ]}
      />

      {/* SUB-TAB 1: POSTGRESQL 20M-ROW EXPLAIN ANALYZE DEBUGGING LAB */}
      {subTab === 'pg-explain' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Live EXPLAIN ANALYZE Debugging Lab: 20M-Row Orders Table
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Diagnose a 1,480 ms e-commerce endpoint, inspect the 3 engine bottlenecks, and verify the 15,580× speedup.
                </p>
              </div>
              <SegmentedTabBar<'before' | 'after'>
                ariaLabel="Before and after optimization toggle"
                activeTab={planPhase}
                onChange={setPlanPhase}
                size="xs"
                tabs={[
                  { id: 'before', label: 'Before Fix (1,480 ms)' },
                  { id: 'after', label: 'After Fix (0.095 ms)' },
                ]}
              />
            </div>

            {/* Quantitative Impact Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: 'Execution Latency',
                  before: '1,480.12 ms',
                  after: '0.095 ms',
                  delta: '15,580× faster',
                },
                {
                  label: 'Disk Blocks Read',
                  before: '184,920',
                  after: '0',
                  delta: '100% RAM hit (5 blocks)',
                },
                {
                  label: 'External Sort Spill',
                  before: '14,208 kB',
                  after: '0 kB',
                  delta: 'Sort node eliminated',
                },
                {
                  label: 'Heap Fetches',
                  before: '94,210',
                  after: '0',
                  delta: 'Index-Only Scan',
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{kpi.label}</div>
                  <div
                    className={`text-xl font-mono font-bold tabular-nums mt-0.5 ${
                      planPhase === 'after'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {planPhase === 'after' ? kpi.after : kpi.before}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {planPhase === 'after' ? kpi.delta : `Target: ${kpi.after}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Step 1: Production Query
                  </span>
                  <CopyButton text={SLOW_QUERY_SQL} label="Copy Query" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {SLOW_QUERY_SQL}
                </pre>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Step 3: Composite Partial Covering Expression Index
                  </span>
                  <CopyButton text={PRODUCTION_FIX_SQL} label="Copy Fix DDL" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {PRODUCTION_FIX_SQL}
                </pre>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {planPhase === 'before'
                      ? 'Planner Output (Before Optimization — Bottlenecked)'
                      : 'Verified Execution Plan (After Optimization — Sub-Millisecond)'}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      planPhase === 'after'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {planPhase === 'after' ? 'Index Only Scan' : 'Seq Scan + Disk Spill'}
                  </span>
                </div>
                <pre
                  className={`p-4 rounded-lg bg-slate-950 font-mono text-xs leading-5 overflow-x-auto border ${
                    planPhase === 'after'
                      ? 'text-emerald-300 border-emerald-900/70'
                      : 'text-amber-200 border-rose-900/70'
                  }`}
                >
                  {planPhase === 'before' ? BEFORE_PLAN : AFTER_PLAN}
                </pre>

                {/* Step 2: Interactive 3-Bottleneck Inspector */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Step 2: Root-Cause Bottleneck Inspector (Select Each Finding)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {EXPLAIN_BOTTLENECKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBottleneckId(b.id)}
                        className={`text-left rounded-lg border p-3 transition-colors ${
                          selectedBottleneck.id === b.id
                            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[11px] font-mono text-slate-500">Bottleneck 0{b.number}</div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                          {b.title}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2 text-xs">
                    <div className="font-mono text-rose-700 dark:text-rose-400">{selectedBottleneck.signalInPlan}</div>
                    <p className="text-slate-700 dark:text-slate-300 leading-5">
                      <strong className="text-slate-900 dark:text-slate-100">Why it hurts: </strong>
                      {selectedBottleneck.impact}
                    </p>
                    <p className="text-emerald-800 dark:text-emerald-300 leading-5">
                      <strong>Production Fix: </strong>
                      {selectedBottleneck.remediation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SUB-TAB 2: NOSQL QUERY PLAN AUDITING (MONGODB, CASSANDRA, DYNAMODB) */}
      {subTab === 'nosql-audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* MongoDB executionStats & ESR Rule Lab */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                MongoDB .explain(&quot;executionStats&quot;) &amp; ESR Rule
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Query: <code className="font-mono">find(&#123; status: &quot;SHIPPED&quot;, createdAt: &#123; $gte: lastWeek &#125; &#125;).sort(&#123; priority: -1 &#125;).limit(10)</code>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'none', label: 'No Index (COLLSCAN)' },
                  { id: 'range-first', label: 'Range-First Index' },
                  { id: 'esr-optimal', label: 'ESR Optimal Index' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMongoIndexOrder(opt.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    mongoIndexOrder === opt.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="rounded-lg bg-slate-950 text-slate-100 font-mono text-xs p-4 space-y-1.5 border border-slate-800">
              <div className="text-slate-400">// Index: {mongoStats.indexSpec}</div>
              <div className={mongoStats.healthy ? 'text-emerald-400' : 'text-rose-400'}>
                winningPlan.stage: &quot;{mongoStats.stage}&quot;
              </div>
              <div>totalKeysExamined: {mongoStats.keysExamined.toLocaleString()}</div>
              <div>totalDocsExamined: {mongoStats.docsExamined.toLocaleString()}</div>
              <div>nReturned: {mongoStats.nReturned}</div>
              <div>
                examined / returned ratio:{' '}
                <span className={mongoStats.healthy ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {mongoStats.ratio}
                </span>{' '}
                · executionTimeMillis: {mongoStats.latencyMs} ms
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-5">
              {mongoStats.healthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span>{mongoStats.note}</span>
            </div>
          </section>

          {/* Cassandra Tombstone Trap & DynamoDB Hot-Key Throttling */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Cassandra SSTable &amp; Tombstone Trap Simulator
                </h2>
                <span className={`text-xs font-mono font-semibold tabular-nums ${cassandraState.tone}`}>
                  GC Pause: {cassandraState.gcPauseMs} ms
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <label htmlFor="tombstone-slider">Tombstones Scanned per Range Query</label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {tombstonesPerScan.toLocaleString()}
                  </span>
                </div>
                <input
                  id="tombstone-slider"
                  type="range"
                  min={100}
                  max={160_000}
                  step={1000}
                  value={tombstonesPerScan}
                  onChange={(e) => setTombstonesPerScan(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1.5 text-xs">
                <div className={`font-mono font-semibold ${cassandraState.tone}`}>{cassandraState.status}</div>
                <p className="text-slate-600 dark:text-slate-400 leading-5">{cassandraState.summary}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                DynamoDB Hot-Key Throttling (ProvisionedThroughputExceededException)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-5">
                Each DynamoDB physical partition caps at <strong className="font-mono text-slate-900 dark:text-slate-100">1,000 WCU / 3,000 RCU</strong>. Even with high table capacity, concentrating writes on one celebrity or tenant partition key triggers throttling.
              </p>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <span>Bad PK: TENANT#celebrity</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="text-emerald-700 dark:text-emerald-400">
                  Fix: Write Sharding PK = TENANT#celebrity#0..15 + DAX read cache
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SUB-TAB 3: DYNAMODB SINGLE-TABLE VS POSTGRESQL JSONB */}
      {subTab === 'dynamo-vs-pg' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Concrete Microservices Schema: DynamoDB Single-Table Design vs. PostgreSQL JSONB
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Compare how an order-management microservice models multi-tenant entities, flexible payloads, and query evolution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  DynamoDB Single-Table Design
                </span>
                <CopyButton text={DYNAMO_SINGLE_TABLE_CODE} label="Copy" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-950 text-amber-200 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                {DYNAMO_SINGLE_TABLE_CODE}
              </pre>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  PostgreSQL Normalized + JSONB + GIN
                </span>
                <CopyButton text={PG_JSONB_SCHEMA_CODE} label="Copy" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                {PG_JSONB_SCHEMA_CODE}
              </pre>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">Dimension</th>
                  <th className="py-2.5 px-4 font-semibold">DynamoDB Single-Table</th>
                  <th className="py-2.5 pl-4 font-semibold">PostgreSQL + JSONB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {DYNAMO_VS_PG_COMPARISON.map((row) => (
                  <tr key={row.dimension} className="align-top">
                    <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {row.dimension}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-5">
                      {row.dynamodb}
                    </td>
                    <td className="py-3 pl-4 text-slate-700 dark:text-slate-300 leading-5">
                      {row.postgresJsonb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
