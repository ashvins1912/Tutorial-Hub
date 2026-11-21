export interface QueryPipelineStage {
  id: string;
  step: number;
  name: string;
  shortName: string;
  latencySharePct: number;
  summary: string;
  internals: string;
  productionNote: string;
  artifacts: string[];
}

export interface JoinAlgorithmSpec {
  id: 'nested-loop' | 'hash-join' | 'merge-join';
  name: string;
  complexity: string;
  bestWhen: string;
  memoryFootprint: string;
  mechanism: string;
  watchOut: string;
}

export interface StorageComparisonRow {
  feature: string;
  bPlusTree: string;
  lsmTree: string;
}

export interface IsolationLevelRow {
  level: string;
  badge: string;
  dirtyRead: 'Possible' | 'Prevented';
  nonRepeatableRead: 'Possible' | 'Prevented';
  phantomRead: 'Possible' | 'Prevented' | 'Prevented (Postgres)';
  writeSkew: 'Possible' | 'Prevented';
  mechanism: string;
}

export interface SqlPlaygroundPreset {
  id: string;
  title: string;
  subtitle: string;
  tableRowsDefault: number;
  sql: string;
  defaultIndex: IndexStrategyId;
  recommendedIndex: IndexStrategyId;
  joinUsed: 'nested-loop' | 'hash-join' | 'merge-join' | 'none';
  bottleneckSummary: string;
  fixedSql: string;
}

export type IndexStrategyId =
  | 'none'
  | 'btree-single'
  | 'composite-covering-expression'
  | 'gin-jsonb';

export interface OptimizerSimulationResult {
  scanType: string;
  joinType: string;
  estimatedCost: string;
  actualTimeMs: number;
  rowsScanned: number;
  rowsReturned: number;
  sharedHits: number;
  sharedReads: number;
  heapFetches: number;
  diskSpillKb: number;
  bufferHitPct: number;
  planLines: string[];
  diagnosis: string;
  stageLatenciesMs: Record<string, number>;
}

export interface ExplainBottleneck {
  id: string;
  number: number;
  title: string;
  signalInPlan: string;
  impact: string;
  remediation: string;
}

export interface StackCheatSheet {
  id: 'postgresql' | 'mysql' | 'mongodb' | 'cassandra' | 'snowflake';
  name: string;
  engineType: string;
  primaryStorage: string;
  topDiagnosticCommand: string;
  rules: {
    title: string;
    metricOrCommand: string;
    guidance: string;
  }[];
  goldenConfig: string;
}

export interface ProductionChecklistItem {
  id: string;
  category: 'Primary Keys' | 'Partitioning & Lifecycle' | 'Zero-Downtime DDL' | 'Security & Multi-Tenancy' | 'DR & Observability';
  title: string;
  rationale: string;
  commandSnippet: string;
}

export interface OutageCommand {
  id: string;
  label: string;
  command: string;
  output: string;
  clue: string;
}

export interface OutageScenario {
  id: string;
  title: string;
  engine: 'PostgreSQL' | 'Cassandra' | 'pgvector + Postgres';
  severity: 'SEV-1' | 'SEV-2';
  alertTitle: string;
  initialAlerts: string[];
  metrics: { label: string; value: string; status: 'critical' | 'warning' | 'nominal' }[];
  commands: OutageCommand[];
  diagnosisOptions: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  remediationSteps: string[];
}

export interface ContinuousAiTask {
  id: string;
  stageNumber: number;
  title: string;
  cadence: string;
  focus: string;
  prompt: string;
}

export interface DatabaseQuizQuestion {
  id: string;
  topic: string;
  question: string;
  hint: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    reason: string;
  }[];
}

export const QUERY_PIPELINE_STAGES: QueryPipelineStage[] = [
  {
    id: 'transport',
    step: 1,
    name: 'Transport & Connection Layer',
    shortName: 'Transport',
    latencySharePct: 8,
    summary: 'Manages TCP/TLS sockets, authentication, and worker process/thread allocation.',
    internals:
      'PostgreSQL spawns one OS process per connection (~5–10 MB RAM each). Unpooled bursts of 4,000 app pods cause context-switching storms and OOM kills.',
    productionNote:
      'Deploy PgBouncer (transaction pooling) or ProxySQL to multiplex thousands of app sockets onto 50–100 active DB worker processes.',
    artifacts: ['TCP/TLS Handshake', 'PgBouncer Transaction Pool', 'Active Worker Slot'],
  },
  {
    id: 'parser',
    step: 2,
    name: 'Parser & Lexer',
    shortName: 'Parser',
    latencySharePct: 5,
    summary: 'Tokenizes raw SQL text into lexical tokens and builds an Abstract Syntax Tree (AST).',
    internals:
      'Validates grammar syntax purely structurally without checking whether tables or columns exist yet. Prepared statements amortize repeated parsing cost.',
    productionNote:
      'Always use parameterized queries ($1, $2) to block SQL injection and allow plan caching across high-QPS endpoints.',
    artifacts: ['Lexical Tokens', 'Raw Parse Tree (AST)', 'Bind Parameters'],
  },
  {
    id: 'analyzer',
    step: 3,
    name: 'Analyzer & Catalog Resolver',
    shortName: 'Analyzer',
    latencySharePct: 7,
    summary: 'Consults pg_catalog / information_schema to resolve relations, types, views, and RBAC/RLS policies.',
    internals:
      'Rewrites views into base tables, injects Row-Level Security (RLS) predicate filters, checks column data types, and outputs a validated Query Tree.',
    productionNote:
      'Type mismatches (e.g., passing text to a BIGINT column) force implicit casts that can silently disable index usage.',
    artifacts: ['pg_catalog Lookup', 'RLS Policy Injection', 'Semantic Query Tree'],
  },
  {
    id: 'optimizer',
    step: 4,
    name: 'Cost-Based Query Optimizer (CBO)',
    shortName: 'Optimizer',
    latencySharePct: 18,
    summary: 'Enumerates mathematically equivalent plans and picks the lowest estimated I/O + CPU cost.',
    internals:
      'Uses pg_statistic histograms, Most Common Values (MCVs), distinct counts, and correlation to estimate row cardinality, scan types, and join algorithms.',
    productionNote:
      'Stale statistics cause catastrophic plan flips (e.g., picking Nested Loop on 1M rows). Run ANALYZE after bulk loads and tune autovacuum scale factors.',
    artifacts: ['Histogram Cardinality', 'Index Selection', 'Join Algorithm Plan'],
  },
  {
    id: 'executor',
    step: 5,
    name: 'Execution Engine & Storage Manager',
    shortName: 'Executor',
    latencySharePct: 62,
    summary: 'Pulls tuples via the Volcano/Iterator model (Next()), reading 8KB/16KB pages through the Buffer Pool.',
    internals:
      'Checks shared_buffers (RAM) before issuing OS reads, verifies MVCC visibility (xmin/xmax or Visibility Map), sorts in work_mem, and writes WAL before dirtying pages.',
    productionNote:
      'Aim for >99% Buffer Cache Hit Ratio for OLTP workloads; watch for temp disk spills when sorts or hash tables exceed work_mem.',
    artifacts: ['Volcano Next() Pipeline', '8KB/16KB Buffer Pool Pages', 'WAL + Visibility Map'],
  },
];

export const JOIN_ALGORITHMS: JoinAlgorithmSpec[] = [
  {
    id: 'nested-loop',
    name: 'Nested Loop Join',
    complexity: 'O(N log M)',
    bestWhen: 'Outer input is small (e.g., 10–500 rows) and inner table has a B-Tree index on the join key.',
    memoryFootprint: 'Minimal — O(1) streaming without building a hash table.',
    mechanism: 'For each outer tuple, probes the inner index directly to fetch matching rows.',
    watchOut: 'If cardinality estimates under-predict N by 100x, Nested Loop turns into millions of random probes.',
  },
  {
    id: 'hash-join',
    name: 'Hash Join',
    complexity: 'O(N + M)',
    bestWhen: 'Large, unindexed equi-joins (=) where one side fits comfortably inside work_mem.',
    memoryFootprint: 'O(min(N, M)) in work_mem; spills to temp hash batches on disk if oversized.',
    mechanism: 'Builds an in-memory hash table on the smaller relation, then streams the larger table to probe buckets.',
    watchOut: 'Only supports equality predicates; watch "Batches: >1" in EXPLAIN ANALYZE indicating disk spill.',
  },
  {
    id: 'merge-join',
    name: 'Merge Join',
    complexity: 'O(N + M)',
    bestWhen: 'Both join inputs are already ordered on the join key (via B-Tree indexes or upstream sort).',
    memoryFootprint: 'Low when inputs are pre-sorted; requires sort memory otherwise.',
    mechanism: 'Zips two sorted tuple streams together in a single linear forward pass like merge sort.',
    watchOut: 'Unindexed inputs require an expensive upfront Sort node that can spill to disk.',
  },
];

export const STORAGE_ENGINE_COMPARISON: StorageComparisonRow[] = [
  {
    feature: 'Core Mechanism',
    bPlusTree: 'Updates data in-place inside fixed-size 8KB (Postgres) or 16KB (InnoDB) pages on disk.',
    lsmTree: 'Appends writes sequentially to an in-memory MemTable + WAL, then flushes immutable SSTables to disk.',
  },
  {
    feature: 'Write Amplification',
    bPlusTree: 'Higher — random I/O page splits, dirty page writeback, and full-page writes after checkpoints.',
    lsmTree: 'Ultra-low latency sequential writes — ideal for write-heavy telemetry, time-series, and NoSQL ingestion.',
  },
  {
    feature: 'Read Performance',
    bPlusTree: 'Fast O(log_B N) traversal (3–4 page hops for billions of rows) with predictable p99 reads.',
    lsmTree: 'Must inspect MemTable + multiple SSTable levels (mitigated via in-memory Bloom Filters & block caches).',
  },
  {
    feature: 'Space & Maintenance',
    bPlusTree: 'Fragmented pages and dead tuples require VACUUM (Postgres) or InnoDB purge/defragmentation.',
    lsmTree: 'Background Compaction (Size-Tiered / Leveled) merges SSTables and purges deleted tombstones.',
  },
  {
    feature: 'Representative Engines',
    bPlusTree: 'PostgreSQL, MySQL InnoDB, Oracle, SQL Server, SQLite.',
    lsmTree: 'Apache Cassandra, RocksDB, ScyllaDB, Pebble (CockroachDB), LevelDB.',
  },
];

export const ISOLATION_LEVELS_MATRIX: IsolationLevelRow[] = [
  {
    level: 'Read Uncommitted',
    badge: 'Lowest Isolation',
    dirtyRead: 'Possible',
    nonRepeatableRead: 'Possible',
    phantomRead: 'Possible',
    writeSkew: 'Possible',
    mechanism: 'Reads uncommitted dirty pages directly (PostgreSQL transparently upgrades this to Read Committed).',
  },
  {
    level: 'Read Committed',
    badge: 'PostgreSQL Default',
    dirtyRead: 'Prevented',
    nonRepeatableRead: 'Possible',
    phantomRead: 'Possible',
    writeSkew: 'Possible',
    mechanism: 'Acquires a fresh MVCC snapshot at the start of every statement inside a transaction.',
  },
  {
    level: 'Repeatable Read',
    badge: 'MySQL InnoDB Default',
    dirtyRead: 'Prevented',
    nonRepeatableRead: 'Prevented',
    phantomRead: 'Prevented (Postgres)',
    writeSkew: 'Possible',
    mechanism: 'Holds a single MVCC snapshot from transaction start; InnoDB uses Next-Key Locks to stop phantoms on locking reads.',
  },
  {
    level: 'Serializable',
    badge: 'Strictest Guarantee',
    dirtyRead: 'Prevented',
    nonRepeatableRead: 'Prevented',
    phantomRead: 'Prevented',
    writeSkew: 'Prevented',
    mechanism: 'Uses SSI (Serializable Snapshot Isolation) to track SIREAD/RW dependency cycles and aborts conflicts (40001).',
  },
];

export const SQL_PLAYGROUND_PRESETS: SqlPlaygroundPreset[] = [
  {
    id: 'orders-shipped-email',
    title: 'E-Commerce Shipped Orders (20M Rows)',
    subtitle: 'Non-SARGable LOWER() + Sort Disk Spill + Heap Fetches',
    tableRowsDefault: 20_000_000,
    sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT order_id, total_amount, created_at
FROM orders
WHERE LOWER(customer_email) = 'priya.sharma@example.in'
  AND status = 'SHIPPED'
ORDER BY created_at DESC
LIMIT 20;`,
    defaultIndex: 'none',
    recommendedIndex: 'composite-covering-expression',
    joinUsed: 'none',
    bottleneckSummary:
      'LOWER(customer_email) bypasses a plain B-Tree index, scanning 20M rows and spilling a 14.2 MB sort to disk.',
    fixedSql: `CREATE INDEX CONCURRENTLY idx_orders_email_shipped_covering
ON orders (LOWER(customer_email), created_at DESC)
INCLUDE (order_id, total_amount)
WHERE status = 'SHIPPED';

ANALYZE orders;`,
  },
  {
    id: 'tenant-order-join',
    title: 'Multi-Tenant Orders + Line Items Join',
    subtitle: 'Cardinality Misestimation & Join Strategy Selection',
    tableRowsDefault: 12_000_000,
    sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT o.order_id, o.created_at, i.sku, i.qty
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
WHERE o.tenant_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
  AND o.created_at >= NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 50;`,
    defaultIndex: 'btree-single',
    recommendedIndex: 'composite-covering-expression',
    joinUsed: 'nested-loop',
    bottleneckSummary:
      'Without a composite (tenant_id, created_at DESC) index and indexed FK on order_items(order_id), the join falls back to heavy hash builds.',
    fixedSql: `CREATE INDEX CONCURRENTLY idx_orders_tenant_created
ON orders (tenant_id, created_at DESC) INCLUDE (order_id);

CREATE INDEX CONCURRENTLY idx_items_order_covering
ON order_items (order_id) INCLUDE (sku, qty);`,
  },
  {
    id: 'jsonb-metadata-filter',
    title: 'JSONB Telemetry Payload Search',
    subtitle: 'Full Table Scan vs. GIN Containment (@>) Index',
    tableRowsDefault: 8_000_000,
    sql: `EXPLAIN (ANALYZE, BUFFERS)
SELECT event_id, payload->>'region' AS region, created_at
FROM audit_events
WHERE payload @> '{"service": "checkout", "severity": "ERROR"}'::jsonb
ORDER BY created_at DESC
LIMIT 25;`,
    defaultIndex: 'none',
    recommendedIndex: 'gin-jsonb',
    joinUsed: 'none',
    bottleneckSummary:
      'Standard B-Tree cannot index arbitrary JSONB containment predicates (@>); GIN jsonb_path_ops cuts disk reads by >99%.',
    fixedSql: `CREATE INDEX CONCURRENTLY idx_audit_payload_gin
ON audit_events USING GIN (payload jsonb_path_ops);`,
  },
];

export function simulateSqlOptimizer(params: {
  preset: SqlPlaygroundPreset;
  rowCount: number;
  indexStrategy: IndexStrategyId;
  workMemMb: number;
  joinAlgorithm: 'auto' | 'nested-loop' | 'hash-join' | 'merge-join';
}): OptimizerSimulationResult {
  const { preset, rowCount, indexStrategy, workMemMb, joinAlgorithm } = params;
  const scaleFactor = Math.max(0.05, rowCount / 20_000_000);
  const rowsReturned = 20;

  const isOptimal =
    indexStrategy === preset.recommendedIndex ||
    (preset.id === 'jsonb-metadata-filter' && indexStrategy === 'gin-jsonb');

  const isPartialBtree = indexStrategy === 'btree-single';

  const resolvedJoin =
    preset.joinUsed === 'none'
      ? 'None (Single-Relation Scan)'
      : joinAlgorithm === 'auto'
        ? isOptimal
          ? 'Nested Loop Join (Indexed Inner Probe)'
          : 'Hash Join (In-Memory Build)'
        : joinAlgorithm === 'nested-loop'
          ? 'Nested Loop Join'
          : joinAlgorithm === 'hash-join'
            ? 'Hash Join'
            : 'Merge Join';

  if (isOptimal && preset.id === 'orders-shipped-email') {
    const latency = Number((0.08 + 0.015 * Math.log10(Math.max(10, rowCount / 1000))).toFixed(3));
    const sharedHits = Math.max(4, Math.round(4 + Math.log10(Math.max(10, rowCount)) * 0.2));
    return {
      scanType: 'Index Only Scan (Composite Partial + Covering Expression)',
      joinType: resolvedJoin,
      estimatedCost: '0.56..14.82',
      actualTimeMs: latency,
      rowsScanned: rowsReturned,
      rowsReturned,
      sharedHits,
      sharedReads: 0,
      heapFetches: 0,
      diskSpillKb: 0,
      bufferHitPct: 100,
      planLines: [
        `Limit  (cost=0.56..14.82 rows=20 width=32) (actual time=0.042..${latency.toFixed(3)} rows=20 loops=1)`,
        `  ->  Index Only Scan using idx_orders_email_shipped_covering on orders  (cost=0.56..67120.40 rows=94210 width=32) (actual time=0.040..${(latency * 0.85).toFixed(3)} rows=20 loops=1)`,
        `        Index Cond: (lower(customer_email) = 'priya.sharma@example.in'::text)`,
        `        Heap Fetches: 0`,
        `        Buffers: shared hit=${sharedHits}`,
        `Execution Time: ${latency.toFixed(3)} ms`,
      ],
      diagnosis:
        'Optimal plan: SARGable expression key matches LOWER(customer_email), partial predicate shrinks index to SHIPPED rows, created_at DESC avoids sorting, and INCLUDE columns eliminate heap fetches.',
      stageLatenciesMs: {
        transport: 0.012,
        parser: 0.008,
        analyzer: 0.01,
        optimizer: 0.025,
        executor: Number(Math.max(0.02, latency - 0.055).toFixed(3)),
      },
    };
  }

  if (isOptimal) {
    const latency = Number((1.4 + scaleFactor * 1.8).toFixed(2));
    const hits = Math.round(18 + scaleFactor * 24);
    return {
      scanType:
        indexStrategy === 'gin-jsonb'
          ? 'Bitmap Index Scan (GIN jsonb_path_ops)'
          : 'Index Only Scan + Indexed Nested Loop',
      joinType: resolvedJoin,
      estimatedCost: `1.24..${(42 * scaleFactor + 18).toFixed(2)}`,
      actualTimeMs: latency,
      rowsScanned: Math.round(rowsReturned * 2.5),
      rowsReturned,
      sharedHits: hits,
      sharedReads: 0,
      heapFetches: indexStrategy === 'gin-jsonb' ? 20 : 0,
      diskSpillKb: 0,
      bufferHitPct: 100,
      planLines: [
        `Limit  (cost=1.24..42.10 rows=${rowsReturned} width=48) (actual time=0.220..${latency.toFixed(2)} rows=${rowsReturned} loops=1)`,
        `  ->  ${indexStrategy === 'gin-jsonb' ? 'Bitmap Heap Scan on audit_events' : 'Index Only Scan using idx_orders_tenant_created'}  (actual time=0.210..${(latency * 0.9).toFixed(2)} rows=${rowsReturned} loops=1)`,
        `        Buffers: shared hit=${hits} read=0`,
        `Execution Time: ${latency.toFixed(2)} ms`,
      ],
      diagnosis:
        'Index aligns directly with filter and ordering predicates. Zero disk spill, 100% buffer pool hit ratio, predictable sub-10ms p99 latency.',
      stageLatenciesMs: {
        transport: 0.14,
        parser: 0.06,
        analyzer: 0.09,
        optimizer: 0.26,
        executor: Number(Math.max(0.2, latency - 0.55).toFixed(2)),
      },
    };
  }

  if (isPartialBtree) {
    const matchingRows = Math.round(94_210 * scaleFactor);
    const spillKb = workMemMb < 16 ? Math.round(14_208 * scaleFactor) : 0;
    const diskReads = Math.round(14_500 * scaleFactor);
    const sharedHits = Math.round(3_800 * scaleFactor);
    const latency = Number(((preset.id === 'orders-shipped-email' ? 420 : 185) * scaleFactor + (spillKb > 0 ? 95 * scaleFactor : 0)).toFixed(2));
    const bufferHitPct = Number(((sharedHits / Math.max(1, sharedHits + diskReads)) * 100).toFixed(1));
    return {
      scanType:
        preset.id === 'orders-shipped-email'
          ? 'Seq Scan (Plain B-Tree Bypassed by LOWER())'
          : 'Bitmap Index Scan + Heap Fetches + Sort',
      joinType: resolvedJoin,
      estimatedCost: `2410.00..${Math.round(98400 * scaleFactor)}.45`,
      actualTimeMs: latency,
      rowsScanned: matchingRows,
      rowsReturned,
      sharedHits,
      sharedReads: diskReads,
      heapFetches: matchingRows,
      diskSpillKb: spillKb,
      bufferHitPct,
      planLines: [
        `Limit  (cost=98120.00..98124.20 rows=${rowsReturned} width=32) (actual time=${(latency * 0.98).toFixed(2)}..${latency.toFixed(2)} rows=${rowsReturned} loops=1)`,
        `  ->  Sort  (actual time=${(latency * 0.97).toFixed(2)}..${(latency * 0.99).toFixed(2)} rows=${rowsReturned} loops=1)`,
        `        Sort Method: ${spillKb > 0 ? `external merge  Disk: ${spillKb}kB` : 'top-N heapsort  Memory: 32kB'}`,
        `        Buffers: shared hit=${sharedHits} read=${diskReads}${spillKb > 0 ? `, temp written=${Math.round(spillKb / 8)}` : ''}`,
        `        ->  Bitmap Heap Scan  (rows=${matchingRows} heap fetches=${matchingRows})`,
        `Execution Time: ${latency.toFixed(2)} ms`,
      ],
      diagnosis:
        preset.id === 'orders-shipped-email'
          ? 'A standard B-Tree on customer_email cannot satisfy LOWER(customer_email). You need an expression index + INCLUDE columns.'
          : `Single-column index narrows rows, but still requires ${matchingRows.toLocaleString()} heap lookups${spillKb > 0 ? ` and spills ${spillKb.toLocaleString()} kB to disk (raise work_mem or index ORDER BY)` : ''}.`,
      stageLatenciesMs: {
        transport: 0.4,
        parser: 0.15,
        analyzer: 0.25,
        optimizer: 1.2,
        executor: Number(Math.max(1, latency - 2.0).toFixed(2)),
      },
    };
  }

  // Worst case: Seq Scan + External Merge Disk Spill
  const matchingRows = Math.round(94_210 * scaleFactor);
  const removedRows = Math.max(0, rowCount - matchingRows);
  const diskReads = Math.round(184_920 * scaleFactor);
  const sharedHits = Math.round(1_240 * scaleFactor);
  const spillKb = workMemMb < 24 ? Math.round(14_208 * scaleFactor) : 0;
  const latency = Number((1480.12 * scaleFactor * (spillKb === 0 ? 0.88 : 1)).toFixed(2));
  const bufferHitPct = Number(((sharedHits / Math.max(1, sharedHits + diskReads)) * 100).toFixed(2));

  return {
    scanType: 'Sequential Scan (Full Table Read)',
    joinType: resolvedJoin,
    estimatedCost: `${Math.round(412890 * scaleFactor)}.12..${Math.round(413102 * scaleFactor)}.80`,
    actualTimeMs: latency,
    rowsScanned: rowCount,
    rowsReturned,
    sharedHits,
    sharedReads: diskReads,
    heapFetches: matchingRows,
    diskSpillKb: spillKb,
    bufferHitPct,
    planLines: [
      `Limit  (cost=${Math.round(412890 * scaleFactor)}.12..${Math.round(412892 * scaleFactor)}.45 rows=${rowsReturned} width=32) (actual time=${(latency - 1.9).toFixed(3)}..${(latency - 1.1).toFixed(3)} rows=${rowsReturned} loops=1)`,
      `  ->  Sort  (cost=${Math.round(412890 * scaleFactor)}.12..${Math.round(413102 * scaleFactor)}.80 rows=${matchingRows} width=32) (actual time=${(latency - 1.9).toFixed(3)}..${(latency - 1.1).toFixed(3)} rows=${rowsReturned} loops=1)`,
      `        Sort Key: created_at DESC`,
      `        Sort Method: ${spillKb > 0 ? `external merge  Disk: ${spillKb}kB` : `quicksort  Memory: ${Math.max(48, Math.round(14208 * scaleFactor))}kB`}`,
      `        Buffers: shared hit=${sharedHits} read=${diskReads}${spillKb > 0 ? `, temp read=${Math.round(spillKb / 8)} written=${Math.round(spillKb / 8) + 4}` : ''}`,
      `        ->  Seq Scan on orders  (cost=0.00..${Math.round(405120 * scaleFactor)}.00 rows=${matchingRows} width=32) (actual time=0.412..${(latency * 0.95).toFixed(3)} rows=${matchingRows} loops=1)`,
      `              Filter: ((status = 'SHIPPED'::text) AND (lower(customer_email) = 'priya.sharma@example.in'::text))`,
      `              Rows Removed by Filter: ${removedRows.toLocaleString()}`,
      `Execution Time: ${latency.toFixed(3)} ms`,
    ],
    diagnosis:
      `Critical bottleneck: Full Seq Scan reads ${diskReads.toLocaleString()} 8KB blocks (${((diskReads * 8) / 1024).toFixed(0)} MB) from disk${spillKb > 0 ? ` and spills ${spillKb.toLocaleString()} kB of temporary sort files because work_mem (${workMemMb} MB) is exceeded` : ''}. Switch to the recommended index strategy to see the 15,000x+ speedup.`,
    stageLatenciesMs: {
      transport: 0.6,
      parser: 0.2,
      analyzer: 0.3,
      optimizer: 1.5,
      executor: Number(Math.max(2, latency - 2.6).toFixed(2)),
    },
  };
}

export const EXPLAIN_BOTTLENECKS: ExplainBottleneck[] = [
  {
    id: 'non-sargable',
    number: 1,
    title: 'Non-SARGable Predicate: LOWER(customer_email)',
    signalInPlan: 'Seq Scan on orders · Rows Removed by Filter: 19,905,790 · read=184,920',
    impact:
      'Wrapping an indexed column in a function invalidates any standard B-Tree index on customer_email, forcing a full scan across 20M rows (~1.44 GB of disk blocks).',
    remediation:
      'Index the exact expression: ON orders (LOWER(customer_email), created_at DESC) or migrate the column to citext / normalized lowercase on write.',
  },
  {
    id: 'disk-spill',
    number: 2,
    title: 'External Merge Sort Disk Spill',
    signalInPlan: 'Sort Method: external merge  Disk: 14208kB · temp read=1776 written=1780',
    impact:
      'Sorting 94,210 matching rows exceeded session work_mem, writing 14.2 MB of temporary sort runs to disk and adding random I/O latency.',
    remediation:
      'Include created_at DESC as the trailing key of the composite index so rows arrive pre-ordered, eliminating the Sort operator completely.',
  },
  {
    id: 'heap-fetches',
    number: 3,
    title: 'Main Table Heap Fetches & Unfiltered Index Bloat',
    signalInPlan: 'SELECT order_id, total_amount, created_at · WHERE status = \'SHIPPED\'',
    impact:
      'Even with an index on email + created_at, fetching total_amount jumps back to random heap pages, and indexing CANCELLED/PENDING rows bloats RAM.',
    remediation:
      'Add INCLUDE (order_id, total_amount) for an Index-Only Scan (Heap Fetches: 0) and WHERE status = \'SHIPPED\' for a compact partial index.',
  },
];

export const STACK_CHEAT_SHEETS: StackCheatSheet[] = [
  {
    id: 'postgresql',
    name: 'PostgreSQL 16+',
    engineType: 'Relational MVCC · B+ Tree + GIN/GiST/HNSW',
    primaryStorage: '8KB Slotted Pages + WAL + Visibility Map + TOAST',
    topDiagnosticCommand: 'EXPLAIN (ANALYZE, BUFFERS, SETTINGS, VERBOSE) <query>;',
    rules: [
      {
        title: 'Monitor Top Latency & I/O Consumers',
        metricOrCommand: 'SELECT query, calls, mean_exec_time, shared_blks_read FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;',
        guidance: 'Rank queries by total_exec_time and shared_blks_read, not just single-query max latency.',
      },
      {
        title: 'Guard Against TXID Wraparound',
        metricOrCommand: 'SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY age DESC;',
        guidance: 'Alert at 500M and page SRE at 1B transactions; tune autovacuum_vacuum_cost_limit on high-churn tables.',
      },
      {
        title: 'Zero-Downtime DDL Guardrails',
        metricOrCommand: "SET lock_timeout = '2s'; SET statement_timeout = '30s'; CREATE INDEX CONCURRENTLY ...",
        guidance: 'Never run blocking CREATE INDEX or NOT NULL rewrites without lock_timeout; blocked DDL queues all subsequent queries.',
      },
      {
        title: 'Right-Size Memory & Connection Pooling',
        metricOrCommand: 'shared_buffers = 25% RAM · effective_cache_size = 75% RAM · PgBouncer transaction mode',
        guidance: 'Keep work_mem conservative (16–64MB) because it allocates per sort/hash node per concurrent worker.',
      },
    ],
    goldenConfig: `# postgresql.conf — 64 GB RAM / 16 vCPU NVMe OLTP Baseline
shared_buffers = '16GB'
effective_cache_size = '48GB'
work_mem = '32MB'
maintenance_work_mem = '2GB'
random_page_cost = 1.1
effective_io_concurrency = 200
wal_level = 'logical'
max_wal_size = '16GB'
checkpoint_completion_target = 0.9`,
  },
  {
    id: 'mysql',
    name: 'MySQL 8 (InnoDB)',
    engineType: 'Relational MVCC · Clustered B+ Tree',
    primaryStorage: '16KB Pages + Redo Log + Undo Rollback Segments',
    topDiagnosticCommand: 'EXPLAIN ANALYZE <query>;',
    rules: [
      {
        title: 'Keep Clustered Primary Key Narrow & Sequential',
        metricOrCommand: 'PRIMARY KEY (id BIGINT UNSIGNED / BINARY(16) UUIDv7)',
        guidance: 'Every secondary index stores the Primary Key as its row pointer; bloated random UUIDv4 PKs bloat every index.',
      },
      {
        title: 'Tune InnoDB Buffer Pool to 70–75% of Dedicated RAM',
        metricOrCommand: 'SHOW ENGINE INNODB STATUS; -- Buffer pool hit rate > 995/1000',
        guidance: 'InnoDB uses O_DIRECT to bypass OS double buffering, so allocate most RAM directly to innodb_buffer_pool_size.',
      },
      {
        title: 'Watch Gap & Next-Key Lock Deadlocks',
        metricOrCommand: 'innodb_print_all_deadlocks = ON',
        guidance: 'Repeatable Read takes Next-Key locks on range scans; consider Read Committed for high-concurrency OLTP queues.',
      },
    ],
    goldenConfig: `# my.cnf — InnoDB Dedicated 64 GB RAM OLTP Baseline
innodb_buffer_pool_size = 46G
innodb_buffer_pool_instances = 8
innodb_flush_method = O_DIRECT
innodb_redo_log_capacity = 8G
innodb_flush_log_at_trx_commit = 1
transaction_isolation = READ-COMMITTED`,
  },
  {
    id: 'mongodb',
    name: 'MongoDB 7 (WiredTiger)',
    engineType: 'Document Store · B-Tree + Compression',
    primaryStorage: 'WiredTiger Cache (50% RAM - 1GB) + Snappy/Zstd Pages',
    topDiagnosticCommand: 'db.orders.find({...}).sort({...}).explain("executionStats")',
    rules: [
      {
        title: 'Enforce the ESR Compound Index Rule',
        metricOrCommand: 'Equality keys -> Sort keys -> Range keys',
        guidance: 'Order compound index fields strictly Equality first, Sort second, Range last to prevent blocking in-memory SORT stages.',
      },
      {
        title: 'Audit totalDocsExamined / nReturned Ratio',
        metricOrCommand: 'totalKeysExamined ≈ totalDocsExamined ≈ nReturned',
        guidance: 'A 500,000:10 ratio means a COLLSCAN or poorly selective leading index key is burning CPU and cache.',
      },
      {
        title: 'Bound Embedded Array Growth',
        metricOrCommand: 'Avoid unbounded arrays (>1,000 elements) inside 16MB docs',
        guidance: 'Use the Bucket Pattern or Outlier Pattern for time-series/events to avoid rewriting huge documents on every push.',
      },
    ],
    goldenConfig: `// Compound Index aligned to ESR: status (=), createdAt (sort), total (range)
db.orders.createIndex(
  { tenantId: 1, status: 1, createdAt: -1, totalAmount: 1 },
  { name: "idx_orders_esr_tenant_status_created" }
);`,
  },
  {
    id: 'cassandra',
    name: 'Apache Cassandra / ScyllaDB',
    engineType: 'Wide-Column LSM-Tree · Leaderless Dynamo Quorum',
    primaryStorage: 'CommitLog + MemTable + Immutable SSTables + Bloom Filters',
    topDiagnosticCommand: 'nodetool tablestats <keyspace>.<table> && nodetool tpstats',
    rules: [
      {
        title: 'Design Tables Around Queries (Partition + Clustering Keys)',
        metricOrCommand: 'PRIMARY KEY ((tenant_id, bucket_month), created_at, event_id)',
        guidance: 'Time-bucket partition keys so no single partition exceeds ~100 MB or ~100,000 rows.',
      },
      {
        title: 'Prevent the Tombstone Trap',
        metricOrCommand: 'tombstone_warn_threshold = 1000 · tombstone_failure_threshold = 100000',
        guidance: 'Never use Cassandra as a FIFO queue; avoid inserting NULLs (use UNSET) and use TimeWindowCompactionStrategy (TWCS) for TTL data.',
      },
      {
        title: 'Enforce Strong Local Quorum Consistency',
        metricOrCommand: 'RF = 3 · Write = LOCAL_QUORUM (2) · Read = LOCAL_QUORUM (2)',
        guidance: '2 + 2 = 4 > 3 guarantees read-after-write consistency while surviving 1 node outage per datacenter.',
      },
    ],
    goldenConfig: `CREATE TABLE orders_by_customer_month (
  customer_id uuid,
  order_month text,
  created_at timestamp,
  order_id timeuuid,
  total_amount decimal,
  PRIMARY KEY ((customer_id, order_month), created_at, order_id)
) WITH CLUSTERING ORDER BY (created_at DESC, order_id DESC)
  AND compaction = {'class': 'TimeWindowCompactionStrategy', 'compaction_window_unit': 'DAYS', 'compaction_window_size': 7};`,
  },
  {
    id: 'snowflake',
    name: 'Snowflake / Columnar OLAP',
    engineType: 'Columnar Cloud Warehouse · Decoupled Storage & Compute',
    primaryStorage: 'Immutable 16MB Compressed Micro-Partitions (S3/GCS)',
    topDiagnosticCommand: 'SELECT * FROM TABLE(GET_QUERY_OPERATOR_STATS(LAST_QUERY_ID()));',
    rules: [
      {
        title: 'Maximize Micro-Partition Pruning',
        metricOrCommand: 'Partitions scanned / Partitions total < 5%',
        guidance: 'Cluster multi-TB tables by your dominant WHERE filter (e.g., event_date, tenant_id) and never wrap clustering keys in functions.',
      },
      {
        title: 'Eliminate Remote Disk Spilling',
        metricOrCommand: 'Bytes spilled to remote storage = 0',
        guidance: 'Scale warehouse size vertically for heavy joins/aggregations that spill to S3; use Multi-Cluster Warehouses for concurrency bursts.',
      },
      {
        title: 'Avoid Row-by-Row OLTP DML',
        metricOrCommand: 'Batch via COPY INTO / Snowpipe Streaming / MERGE every 1–5 min',
        guidance: 'Single-row INSERTs rewrite 16MB micro-partitions and explode metadata overhead.',
      },
    ],
    goldenConfig: `ALTER TABLE analytics.orders_fact
  CLUSTER BY (TO_DATE(created_at), tenant_id);

-- Check clustering depth (lower = better pruning)
SELECT SYSTEM$CLUSTERING_INFORMATION('analytics.orders_fact', '(TO_DATE(created_at), tenant_id)');`,
  },
];

export const PRODUCTION_CHECKLIST: ProductionChecklistItem[] = [
  {
    id: 'uuidv7-pk',
    category: 'Primary Keys',
    title: 'Use time-ordered UUIDv7 or ULID instead of random UUIDv4',
    rationale:
      'Random UUIDv4 inserts scatter across B+ Tree leaf pages, causing 50/50 page splits, buffer cache misses, and WAL bloat. UUIDv7 appends monotonically to the rightmost leaf.',
    commandSnippet: 'id UUID PRIMARY KEY DEFAULT uuidv7() -- 48-bit ms timestamp + 74-bit randomness',
  },
  {
    id: 'range-partitioning',
    category: 'Partitioning & Lifecycle',
    title: 'Partition high-velocity tables by time (RANGE created_at) with pg_partman',
    rationale:
      'Detaching and dropping expired monthly/daily partitions completes in milliseconds without autovacuum storms or table-wide locks.',
    commandSnippet: 'ALTER TABLE events DETACH PARTITION events_2025_01 CONCURRENTLY;\nDROP TABLE events_2025_01;',
  },
  {
    id: 'zero-downtime-ddl',
    category: 'Zero-Downtime DDL',
    title: 'Enforce CREATE INDEX CONCURRENTLY + lock_timeout = 2s on all migrations',
    rationale:
      'An unguarded DDL migration waiting behind a slow analytics query blocks every subsequent production SELECT/UPDATE in the lock queue.',
    commandSnippet: "SET lock_timeout = '2s';\nCREATE INDEX CONCURRENTLY idx_orders_email ON orders (LOWER(customer_email));",
  },
  {
    id: 'rls-multitenancy',
    category: 'Security & Multi-Tenancy',
    title: 'Enforce Row-Level Security (RLS) on multi-tenant & AI RAG tables',
    rationale:
      'Prevents cross-tenant data or vector leaks even when application code omits a WHERE tenant_id filter.',
    commandSnippet: "ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;\nCREATE POLICY tenant_iso ON knowledge_base USING (tenant_id = current_setting('app.current_tenant_id')::UUID);",
  },
  {
    id: 'pitr-dr',
    category: 'DR & Observability',
    title: 'Verify automated Base Backups + Continuous WAL Archiving (PITR) & restore drills',
    rationale:
      'An untested backup is not a backup. Continuous WAL archiving (pgBackRest) gives sub-minute RPO to recover 1 second before an accidental DROP TABLE.',
    commandSnippet: 'pgbackrest --stanza=prod --type=time --target="2026-11-21 19:22:59+05:30" restore',
  },
  {
    id: 'txid-observability',
    category: 'DR & Observability',
    title: 'Alert on pg_stat_statements regressions & TXID wraparound age(datfrozenxid)',
    rationale:
      'If PostgreSQL autovacuum falls behind and transaction age approaches 2 billion, Postgres refuses all writes to prevent wraparound data corruption.',
    commandSnippet: 'SELECT datname, age(datfrozenxid), round(age(datfrozenxid) / 20000000.0, 2) AS pct_to_shutdown FROM pg_database;',
  },
];

export const OUTAGE_SCENARIOS: OutageScenario[] = [
  {
    id: 'pg-lock-pool-storm',
    title: 'Connection Pool Exhaustion & DDL Lock Queue Cascade',
    engine: 'PostgreSQL',
    severity: 'SEV-1',
    alertTitle: 'P99 API Latency > 12,000ms · PgBouncer waiting clients = 1,840 · Checkout 503s',
    initialAlerts: [
      '14:12:03 UTC — Datadog: pgbouncer.cl_waiting surged from 0 to 1,840 in 40 seconds.',
      '14:12:18 UTC — Checkout API returning HTTP 503: "canceling statement due to statement timeout".',
      '14:12:35 UTC — CI/CD log shows schema migration PR #4821 started at 14:11:48 UTC.',
    ],
    metrics: [
      { label: 'Active DB Connections', value: '100 / 100', status: 'critical' },
      { label: 'PgBouncer Waiting', value: '1,840', status: 'critical' },
      { label: 'Primary CPU', value: '14%', status: 'nominal' },
      { label: 'Checkout Error Rate', value: '78.4%', status: 'critical' },
    ],
    commands: [
      {
        id: 'pg-stat-activity',
        label: 'Inspect pg_stat_activity & wait events',
        command: `SELECT pid, state, wait_event_type, wait_event, now() - query_start AS duration, left(query, 70)
FROM pg_stat_activity WHERE state <> 'idle' ORDER BY duration DESC LIMIT 5;`,
        output: ` pid  | state  | wait_event_type | wait_event    | duration | query
------+--------+-----------------+---------------+----------+------------------------------------------------------------
 8412 | active | IO              | DataFileRead  | 00:08:42 | SELECT region, sum(total) FROM orders GROUP BY 1 -- BI job
 9104 | active | Lock            | relation      | 00:01:55 | ALTER TABLE orders ADD COLUMN promo_code text DEFAULT '' NOT NULL
 9108 | active | Lock            | relation      | 00:01:54 | SELECT order_id, status FROM orders WHERE id = $1
 9112 | active | Lock            | relation      | 00:01:54 | UPDATE orders SET status = 'PAID' WHERE id = $1`,
        clue: 'PID 9104 (ALTER TABLE) is waiting for ACCESS EXCLUSIVE behind an 8-minute BI query (PID 8412), and blocking EVERY subsequent SELECT/UPDATE!',
      },
      {
        id: 'pg-blocking',
        label: 'Check pg_blocking_pids()',
        command: `SELECT pid, pg_blocking_pids(pid) AS blocked_by, left(query, 55)
FROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0 LIMIT 4;`,
        output: ` pid  | blocked_by  | query
------+-------------+-------------------------------------------------
 9104 | {8412}      | ALTER TABLE orders ADD COLUMN promo_code ...
 9108 | {9104}      | SELECT order_id, status FROM orders WHERE id=$1
 9112 | {9104}      | UPDATE orders SET status = 'PAID' WHERE id=$1
 (96 more rows blocked by {9104})`,
        clue: 'Classic PostgreSQL lock-queue cascade: 96 worker slots are piled up behind PID 9104.',
      },
      {
        id: 'pgbouncer-stats',
        label: 'Check PgBouncer pool saturation',
        command: 'SHOW POOLS;',
        output: `database | cl_active | cl_waiting | sv_active | sv_idle | maxwait
---------+-----------+------------+-----------+---------+--------
prod_db  | 100       | 1840       | 100       | 0       | 48s`,
        clue: 'CPU is idle at 14%, proving this is a lock contention stall — NOT a CPU saturation issue.',
      },
    ],
    diagnosisOptions: [
      {
        id: 'wrong-cpu',
        label: 'Primary DB CPU is undersized; immediately scale up from 16 to 64 vCPUs and increase max_connections to 2,000.',
        isCorrect: false,
        explanation:
          'Primary CPU is only 14%! Raising max_connections without clearing the lock queue will just exhaust RAM with more blocked worker processes.',
      },
      {
        id: 'correct-lock-queue',
        label: 'Unprotected ALTER TABLE (PID 9104) is waiting for ACCESS EXCLUSIVE behind long BI query (PID 8412), queuing all OLTP queries and exhausting PgBouncer.',
        isCorrect: true,
        explanation:
          'Spot on! Even before acquiring the lock, a waiting ACCESS EXCLUSIVE request blocks all newly arriving ACCESS SHARE (SELECT) and ROW EXCLUSIVE (UPDATE) requests in FIFO lock order.',
      },
      {
        id: 'wrong-vacuum',
        label: 'Run VACUUM FULL orders immediately to reclaim dead tuples and unblock PgBouncer.',
        isCorrect: false,
        explanation:
          'VACUUM FULL also takes an ACCESS EXCLUSIVE lock and rewrites the entire table — it would make this SEV-1 outage dramatically worse!',
      },
    ],
    remediationSteps: [
      'Immediate mitigation (<10s): Cancel the blocked migration first (`SELECT pg_cancel_backend(9104);`) so the lock queue drains instantly and checkout recovers.',
      'Route BI/analytics queries to a dedicated read replica so long scans never hold AccessShareLock on the primary.',
      'Permanent guardrail: Enforce `SET lock_timeout = \'2s\';` in every migration wrapper with exponential retry, and avoid heavy table rewrites during peak hours.',
    ],
  },
  {
    id: 'pg-txid-wraparound',
    title: 'PostgreSQL TXID Wraparound Warning & Autovacuum Starvation',
    engine: 'PostgreSQL',
    severity: 'SEV-1',
    alertTitle: 'CRITICAL: Database "payments" age(datfrozenxid) = 1,890,000,000 (94.5% of shutdown limit)',
    initialAlerts: [
      '03:15:10 UTC — PostgreSQL log: WARNING: database "payments" must be vacuumed within 110,000,000 transactions.',
      '03:16:00 UTC — Write throughput degrading as aggressive anti-wraparound autovacuum kicks in.',
      '03:18:40 UTC — Disk write IOPS pegged at 98% on ledger_events table.',
    ],
    metrics: [
      { label: 'age(datfrozenxid)', value: '1.89B / 2.00B', status: 'critical' },
      { label: 'Autovacuum Workers', value: '3 / 3 (stalled)', status: 'warning' },
      { label: 'Disk Write IOPS', value: '14,800 / 15,000', status: 'critical' },
      { label: 'Replication Slot Lag', value: '412 GB WAL', status: 'critical' },
    ],
    commands: [
      {
        id: 'txid-tables',
        label: 'Find oldest unfrozen tables',
        command: `SELECT c.oid::regclass AS table_name, age(c.relfrozenxid) AS xid_age, pg_size_pretty(pg_total_relation_size(c.oid))
FROM pg_class c WHERE c.relkind = 'r' ORDER BY xid_age DESC LIMIT 3;`,
        output: ` table_name    | xid_age    | pg_size_pretty
---------------+------------+----------------
 ledger_events | 1890441201 | 1.4 TB
 audit_logs    |  410220110 | 320 GB
 accounts      |   82110440 | 48 GB`,
        clue: 'ledger_events alone is holding back the entire database frozenxid horizon.',
      },
      {
        id: 'check-slots-long-tx',
        label: 'Check long-running transactions & orphaned replication slots',
        command: `SELECT slot_name, active, xmin, catalog_xmin FROM pg_replication_slots;
SELECT pid, state, now() - xact_start AS xact_age, query FROM pg_stat_activity WHERE backend_xid IS NOT NULL OR backend_xmin IS NOT NULL ORDER BY xact_age DESC LIMIT 2;`,
        output: `slot_name          | active | xmin       | catalog_xmin
-------------------+--------+------------+-------------
debezium_old_test  | f      | 1120045100 | 1120045100

 pid  | state               | xact_age  | query
------+---------------------+-----------+--------------------------------
 4421 | idle in transaction | 19 days   | BEGIN; SELECT * FROM ledger_events LIMIT 1;`,
        clue: 'An inactive replication slot (debezium_old_test) AND a 19-day "idle in transaction" session are pinning xmin so VACUUM cannot freeze old tuples!',
      },
    ],
    diagnosisOptions: [
      {
        id: 'correct-xmin-pin',
        label: 'Orphaned inactive replication slot and a 19-day idle-in-transaction session pin the global xmin horizon, preventing autovacuum from freezing ledger_events.',
        isCorrect: true,
        explanation:
          'Exactly right! PostgreSQL cannot freeze or reclaim tuples newer than the oldest active xmin across sessions, prepared transactions, and replication slots.',
      },
      {
        id: 'wrong-restart',
        label: 'Restart PostgreSQL immediately so transaction IDs reset back to 0.',
        isCorrect: false,
        explanation:
          'Transaction IDs are persisted in pg_control and tuple headers (xmin/xmax); restarting does NOT reset TXIDs and will not clear an inactive replication slot.',
      },
      {
        id: 'wrong-reindex',
        label: 'Run REINDEX DATABASE payments to reset relfrozenxid.',
        isCorrect: false,
        explanation:
          'REINDEX rebuilds index pages only and does not freeze heap tuple transaction IDs.',
      },
    ],
    remediationSteps: [
      'Terminate the 19-day idle-in-transaction session (`SELECT pg_terminate_backend(4421);`) and drop the abandoned replication slot (`SELECT pg_drop_replication_slot(\'debezium_old_test\');`).',
      'Raise `autovacuum_vacuum_cost_limit` and run targeted `VACUUM (FREEZE, VERBOSE, PARALLEL 4) ledger_events;` to advance `relfrozenxid` before reaching 2B.',
      'Set `idle_in_transaction_session_timeout = \'5min\'` and `max_slot_wal_keep_size` in postgresql.conf so abandoned consumers can never pin WAL/xmin again.',
    ],
  },
  {
    id: 'cassandra-tombstone-storm',
    title: 'Cassandra Tombstone Overwhelming & Hot-Partition Failure',
    engine: 'Cassandra',
    severity: 'SEV-1',
    alertTitle: 'Read timeouts spiking to 34% · TombstoneOverwhelmingException in notification_queue',
    initialAlerts: [
      '10:04:12 UTC — Node cass-03 JVM G1GC pause time exceeded 4,200ms.',
      '10:04:29 UTC — Coordinator throwing ReadFailureException: Scanned over 100,001 tombstones during query.',
      '10:05:01 UTC — Single partition key "global_pending" receiving 92% of cluster reads.',
    ],
    metrics: [
      { label: 'Read Failure Rate', value: '34.2%', status: 'critical' },
      { label: 'Tombstones / Read', value: '148,920', status: 'critical' },
      { label: 'JVM GC Pause p99', value: '4.2 s', status: 'critical' },
      { label: 'Active SSTables/Read', value: '27', status: 'warning' },
    ],
    commands: [
      {
        id: 'nodetool-tablestats',
        label: 'Run nodetool tablestats',
        command: 'nodetool tablestats messaging.notification_queue',
        output: `Table: notification_queue
SSTable count: 44
Space used (live): 18.4 GB
Maximum tombstones per slice (last five minutes): 148920
Maximum live cells per slice (last five minutes): 42
Compacted partition maximum bytes: 642,810,422`,
        clue: '148,920 tombstones scanned just to return 42 live cells — and a single 642 MB hot partition!',
      },
      {
        id: 'describe-table',
        label: 'Inspect table schema & write pattern',
        command: 'DESCRIBE TABLE messaging.notification_queue;',
        output: `CREATE TABLE messaging.notification_queue (
  queue_name text,          -- always 'global_pending'
  created_at timeuuid,
  payload text,
  PRIMARY KEY (queue_name, created_at)
) WITH compaction = {'class': 'SizeTieredCompactionStrategy'};`,
        clue: 'Anti-pattern detected: Cassandra is being used as a FIFO queue with a single static partition key and constant DELETEs.',
      },
    ],
    diagnosisOptions: [
      {
        id: 'wrong-raise-limit',
        label: 'Raise tombstone_failure_threshold to 5,000,000 in cassandra.yaml and restart nodes.',
        isCorrect: false,
        explanation:
          'Raising the safety limit lets nodes scan millions of tombstones into JVM heap, causing full OutOfMemoryError node crashes across the ring.',
      },
      {
        id: 'correct-fifo-tombstone',
        label: 'Using Cassandra as a single-partition FIFO queue creates massive tombstone accumulation and a 642MB hot partition that triggers GC pauses and ReadFailureException.',
        isCorrect: true,
        explanation:
          'Correct! LSM-Trees convert DELETEs into tombstone markers until compaction + gc_grace_seconds expire. Scanning 148K tombstones per read overwhelms JVM GC.',
      },
      {
        id: 'wrong-rf',
        label: 'Increase Replication Factor from 3 to 5 to distribute the hot partition.',
        isCorrect: false,
        explanation:
          'Increasing RF copies the same hot partition to more replicas and increases write amplification without fixing the partition key or tombstones.',
      },
    ],
    remediationSteps: [
      'Short-term relief: Lower `gc_grace_seconds` cautiously (after ensuring repairs run), trigger major compaction / scrub expired buckets, and shed non-critical polling.',
      'Architectural fix: Move FIFO job queuing to Kafka, RabbitMQ, or PostgreSQL (`FOR UPDATE SKIP LOCKED`) — never an LSM-Tree wide-column store.',
      'For append-only event storage in Cassandra: Salt/time-bucket partition keys `PRIMARY KEY ((tenant_id, hour_bucket), created_at)` and use `TimeWindowCompactionStrategy (TWCS)` with TTL.',
    ],
  },
  {
    id: 'pgvector-hnsw-oom',
    title: 'pgvector HNSW Index Memory Exhaustion & Replica Lag Storm',
    engine: 'pgvector + Postgres',
    severity: 'SEV-2',
    alertTitle: 'AI RAG Search p99 jumped from 18ms -> 2,400ms · Read Replica Lag = 94 seconds',
    initialAlerts: [
      '09:40:02 UTC — Bulk re-embedding job inserted 4M 1536-dim vectors into knowledge_base.',
      '09:44:15 UTC — OS Linux OOM-Killer logged high page-cache thrashing; Buffer hit ratio dropped from 99.6% to 61%.',
      '09:45:30 UTC — WAL generation spiked to 220 MB/s; streaming replica lag climbed to 94s.',
    ],
    metrics: [
      { label: 'Vector Search p99', value: '2,410 ms', status: 'critical' },
      { label: 'Buffer Hit Ratio', value: '61.2%', status: 'critical' },
      { label: 'HNSW Index Size', value: '48.6 GB (RAM: 32 GB)', status: 'critical' },
      { label: 'Replica Lag', value: '94 s', status: 'critical' },
    ],
    commands: [
      {
        id: 'index-size',
        label: 'Check HNSW index vs RAM footprint',
        command: `SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) AS idx_size
FROM pg_stat_user_indexes WHERE relname = 'knowledge_base';`,
        output: `indexrelname               | idx_size
---------------------------+---------
idx_kb_embedding_hnsw_fp32 | 48.6 GB`,
        clue: 'The float32 HNSW graph (48.6 GB) exceeds total host RAM (32 GB), causing random graph-hop page faults on every query!',
      },
      {
        id: 'explain-vec',
        label: 'Run EXPLAIN (ANALYZE, BUFFERS) on RAG query',
        command: `EXPLAIN (ANALYZE, BUFFERS)
SELECT doc_id FROM knowledge_base ORDER BY embedding <=> $1 LIMIT 10;`,
        output: `Limit (actual time=2388.4..2391.2 rows=10)
  -> Index Scan using idx_kb_embedding_hnsw_fp32
       Buffers: shared hit=840 read=14920
Execution Time: 2394.6 ms`,
        clue: '14,920 random disk reads during HNSW graph traversal because the index no longer fits in RAM.',
      },
    ],
    diagnosisOptions: [
      {
        id: 'correct-hnsw-ram',
        label: 'Float32 HNSW graph (48.6 GB) outgrew the 32 GB RAM host, causing severe disk page-fault thrashing during graph hops and WAL spikes during bulk updates.',
        isCorrect: true,
        explanation:
          'Exact root cause! HNSW performs random pointer jumps across neighbor layers — the moment the index spills out of RAM, latency jumps 100x.',
      },
      {
        id: 'wrong-btree',
        label: 'Replace the HNSW index with a standard B-Tree index on the 1536-dim embedding column.',
        isCorrect: false,
        explanation:
          'B-Tree indexes cannot perform high-dimensional cosine/L2 approximate nearest neighbor search.',
      },
    ],
    remediationSteps: [
      'Switch from `vector(1536)` (float32) to `halfvec(1536)` (float16) or Binary Quantization + rerank, immediately cutting HNSW index RAM by 50–90%.',
      'Right-size instance RAM so Active HNSW Index + Hot Working Set fits inside ~70% of host memory, and throttle batch re-embedding writes to protect WAL replication bandwidth.',
      'Partition `knowledge_base` by tenant tier or use filtered HNSW/iterative scans with RLS so each tenant searches a compact hot subset.',
    ],
  },
];

export const CONTINUOUS_AI_TASKS: ContinuousAiTask[] = [
  {
    id: 'ai-task-1',
    stageNumber: 1,
    title: 'Weekly Chaos & Outage Simulation Drill',
    cadence: 'Weekly · 25 min',
    focus: 'TXID wraparound, MongoDB step-down, Cassandra hot partitions, Redis stampede, pgvector OOM',
    prompt:
      'Act as a Principal Site Reliability Engineer (SRE). Present me with a realistic, high-severity production database incident (rotating weekly across: PostgreSQL TXID wraparound, MongoDB primary step-down storm, Cassandra hot-partition cascading failure, Redis cache stampede, or pgvector HNSW memory exhaustion). Give me only the initial monitoring alerts, slow-query logs, and system metrics. Wait for my diagnostic commands, simulate the realistic engine output for every command I run, and grade my root-cause analysis and zero-downtime remediation.',
  },
  {
    id: 'ai-task-2',
    stageNumber: 2,
    title: 'Automated Query & Schema Code-Review Gatekeeper',
    cadence: 'Per PR / Migration · 10 min',
    focus: 'DDL lock safety, SARGability, Leftmost Prefix / ESR index ordering, N+1 & disk spills',
    prompt:
      'Act as a Database Performance Architect. I will paste a raw DDL schema migration and a complex analytical or transactional query. Audit it against production scale (100M+ rows, 5,000 QPS). Identify: (1) Lock-acquisition risks during DDL, (2) Non-SARGable predicates, (3) Suboptimal index column ordering (Leftmost Prefix / ESR rule), (4) N+1 or memory-spill risks, and (5) Rewrite both the schema and query for sub-10ms p99 latency.',
  },
  {
    id: 'ai-task-3',
    stageNumber: 3,
    title: 'Polyglot Architecture Trade-Off Simulator',
    cadence: 'Bi-Weekly · 30 min',
    focus: 'CAP/PACELC, sharding keys, quorum math, caching, and Debezium CDC pipelines',
    prompt:
      'Give me a real-world system specification with exact read/write QPS, payload size, consistency requirements (CAP/PACELC), and retention rules (e.g., UPI-scale payment ledger, real-time ride-hailing geospatial tracker, or multi-tenant enterprise RAG search). Require me to design the primary storage engine, sharding key, replication quorum, caching layer, and CDC pipeline. Challenge every weak assumption in my design with edge-case failure scenarios.',
  },
  {
    id: 'ai-task-4',
    stageNumber: 4,
    title: 'Spaced-Repetition Weak-Spot Quiz Generator',
    cadence: 'Weekly · 15 min',
    focus: 'Isolation anomalies, MVCC vacuum, LSM compaction, Raft consensus, CBO cost math',
    prompt:
      'Generate a 5-question scenario-based diagnostic quiz targeting advanced database internals (Isolation anomalies, MVCC vacuum mechanics, LSM compaction, Raft consensus, and query planner cost estimation). Make every distractor a plausible misconception held by mid-level engineers. After I answer, explain the exact internal data-structure behavior behind each option.',
  },
];

export const DATABASE_MASTERY_QUIZ: DatabaseQuizQuestion[] = [
  {
    id: 'q-lsm-vs-btree',
    topic: 'Storage Engines: B+ Trees vs. LSM-Trees',
    question:
      'Why do write-heavy NoSQL databases like Apache Cassandra and RocksDB rely on Log-Structured Merge-Trees (LSM-Trees) rather than traditional B+ Trees?',
    hint: 'Think about sequential disk appends vs. random in-place page updates on storage media.',
    options: [
      {
        id: 'a',
        text: 'LSM-Trees buffer writes in an in-memory MemTable and flush sequential immutable SSTables to disk, eliminating random disk I/O page splits during heavy write bursts.',
        isCorrect: true,
        reason:
          'Correct! Sequential disk appends in LSM-Trees drastically reduce write amplification and maximize throughput for write-intensive workloads, whereas B+ Trees perform random in-place page updates.',
      },
      {
        id: 'b',
        text: 'LSM-Trees avoid background maintenance entirely, whereas B+ Trees require periodic SSTable compaction.',
        isCorrect: false,
        reason:
          'Incorrect. It is the reverse: LSM-Trees require background compaction to merge SSTables and remove deleted tombstones.',
      },
      {
        id: 'c',
        text: 'LSM-Trees support multi-table ACID foreign key constraints natively in O(1) time without needing Bloom filters.',
        isCorrect: false,
        reason:
          'Incorrect. LSM-Trees use Bloom filters specifically to speed up reads across multiple SSTables and are not designed around relational foreign key enforcement.',
      },
      {
        id: 'd',
        text: 'B+ Trees store data exclusively in volatile RAM, whereas LSM-Trees persist data directly to NVMe SSDs without memory buffering.',
        isCorrect: false,
        reason:
          'Incorrect. Both engines persist data to disk and use memory buffers (Buffer Pool for B+ Trees; MemTable for LSM-Trees).',
      },
    ],
  },
  {
    id: 'q-explain-disk-spill',
    topic: 'PostgreSQL Internals: EXPLAIN ANALYZE Diagnostics',
    question:
      'In a PostgreSQL EXPLAIN (ANALYZE, BUFFERS) output, you observe: Sort Method: external merge Disk: 48200kB. What is the root cause and primary remediation?',
    hint: 'Which PostgreSQL memory parameter controls the memory available to individual sort and hash operations before spilling to disk?',
    options: [
      {
        id: 'a',
        text: 'The database ran out of shared_buffers cache; increase shared_buffers to 80% of total system RAM.',
        isCorrect: false,
        reason:
          'Incorrect. shared_buffers caches table/index pages, whereas per-operation sorting and hashing rely on work_mem.',
      },
      {
        id: 'b',
        text: 'The sort operation exceeded the session work_mem allocation and spilled temporary sort files to disk; optimize the sort via an index or tune work_mem carefully.',
        isCorrect: true,
        reason:
          'Correct! When sorting or hash-joining exceeds work_mem, Postgres spills to temporary disk files ("external merge Disk"). Adding a matching ORDER BY index or safely increasing work_mem resolves the disk spill.',
      },
      {
        id: 'c',
        text: 'Dead tuples from unvacuumed transactions forced a sequential scan; run VACUUM FULL immediately.',
        isCorrect: false,
        reason:
          'Incorrect. Dead tuples cause table bloat and slower scans, not external disk merge sorts.',
      },
      {
        id: 'd',
        text: 'The query planner lacked foreign key constraints; add a hash index on the ORDER BY column.',
        isCorrect: false,
        reason:
          'Incorrect. Hash indexes only support equality (=) lookups and cannot be used for ORDER BY sorting.',
      },
    ],
  },
  {
    id: 'q-quorum-consistency',
    topic: 'Distributed Databases: Quorum Consistency',
    question:
      'A leaderless distributed database (such as Cassandra or DynamoDB-style architecture) replicates data across N = 5 nodes. Which combination of Write Quorum (W) and Read Quorum (R) guarantees strong consistency?',
    hint: 'Apply the quorum consistency inequality: W + R > N.',
    options: [
      {
        id: 'a',
        text: 'W = 1, R = 1',
        isCorrect: false,
        reason:
          'Incorrect. W + R = 2, which is not greater than N = 5, allowing reads to hit nodes that have not received the latest write.',
      },
      {
        id: 'b',
        text: 'W = 2, R = 3',
        isCorrect: false,
        reason:
          'Incorrect. W + R = 5, which equals N rather than exceeding N, meaning the read and write replica sets might not overlap.',
      },
      {
        id: 'c',
        text: 'W = 3, R = 3',
        isCorrect: true,
        reason:
          'Correct! Strong consistency in quorum systems requires W + R > N. With N = 5, W = 3 and R = 3 gives W + R = 6 > 5, guaranteeing at least one overlapping node holds the latest write.',
      },
      {
        id: 'd',
        text: 'W = 5, R = 0',
        isCorrect: false,
        reason:
          'Incorrect. R = 0 means no replicas are read, which cannot return data.',
      },
    ],
  },
  {
    id: 'q-uuidv7-vs-v4',
    topic: 'Database Design: Primary Key Selection',
    question:
      'Why do high-throughput relational databases prefer time-ordered UUIDv7 over random UUIDv4 for clustered primary keys?',
    hint: 'Consider where new keys land inside a sorted B+ Tree structure when keys are completely random versus monotonically increasing.',
    options: [
      {
        id: 'a',
        text: 'UUIDv7 uses 32 bits instead of 128 bits, reducing index storage size by 75%.',
        isCorrect: false,
        reason: 'Incorrect. Both UUIDv4 and UUIDv7 are 128-bit identifiers.',
      },
      {
        id: 'b',
        text: 'UUIDv7 embeds a timestamp prefix so new inserts append sequentially to the rightmost B+ Tree leaf pages, preventing random page splits and buffer pool cache thrashing.',
        isCorrect: true,
        reason:
          'Correct! Random UUIDv4 values insert at arbitrary points across the B+ Tree, causing frequent 50/50 page splits, fragmentation, and poor buffer cache hit ratios.',
      },
      {
        id: 'c',
        text: 'UUIDv4 cannot be indexed with a B-Tree and requires a GIN index.',
        isCorrect: false,
        reason:
          'Incorrect. UUIDv4 can be indexed with a B-Tree, though it suffers from poor locality and fragmentation.',
      },
      {
        id: 'd',
        text: 'UUIDv7 automatically encrypts row payloads at rest using AES-256.',
        isCorrect: false,
        reason: 'Incorrect. UUIDv7 is an identifier format and does not provide encryption.',
      },
    ],
  },
  {
    id: 'q-covering-visibility-map',
    topic: 'Indexing Internals: Covering Indexes & Index-Only Scans',
    question:
      'When is a PostgreSQL Index-Only Scan forced to perform Heap Fetches even though all requested columns are present in a Covering Index (INCLUDE)?',
    hint: 'Remember where PostgreSQL stores MVCC transaction visibility information (xmin/xmax) and how the Visibility Map tracks clean pages.',
    options: [
      {
        id: 'a',
        text: 'Whenever the query includes a LIMIT clause smaller than 100 rows.',
        isCorrect: false,
        reason: 'Incorrect. LIMIT reduces rows fetched and works seamlessly with Index-Only Scans.',
      },
      {
        id: 'b',
        text: 'When the table Visibility Map indicates that pages containing matching rows have recently been modified and not yet marked all-visible by VACUUM.',
        isCorrect: true,
        reason:
          'Correct! Because PostgreSQL stores MVCC visibility metadata (xmin/xmax) in the table heap rather than the index, it checks the Visibility Map; if a page is not marked all-visible, Postgres must fetch the heap tuple to verify transaction visibility.',
      },
      {
        id: 'c',
        text: 'Whenever the covering index uses a B-Tree structure instead of a BRIN structure.',
        isCorrect: false,
        reason:
          'Incorrect. B-Tree indexes are the primary structure that supports Index-Only Scans; BRIN indexes do not.',
      },
      {
        id: 'd',
        text: 'Whenever the WHERE clause filters on an integer primary key.',
        isCorrect: false,
        reason: 'Incorrect. Filtering on an integer primary key works cleanly with Index-Only Scans.',
      },
    ],
  },
  {
    id: 'q-consistent-hashing',
    topic: 'Distributed Sharding: Consistent Hashing',
    question:
      'What is the primary architectural advantage of Consistent Hashing over naive modulo sharding (hash(key) % N) when scaling a distributed database cluster from N to N + 1 nodes?',
    hint: 'Think about how many keys change ownership when the divisor N changes in hash(key) % N versus adding a point on a hash ring.',
    options: [
      {
        id: 'a',
        text: 'Consistent hashing eliminates the need for network replication across availability zones.',
        isCorrect: false,
        reason:
          'Incorrect. Consistent hashing handles key-to-node partitioning, not fault-tolerant replication.',
      },
      {
        id: 'b',
        text: 'Consistent hashing remaps only approximately 1/(N + 1) of total keys on average, whereas modulo sharding invalidates and relocates nearly all existing key mappings.',
        isCorrect: true,
        reason:
          'Correct! By arranging nodes and keys on a virtual hash ring, adding or removing a node only transfers keys from its immediate neighbor on the ring.',
      },
      {
        id: 'c',
        text: 'Consistent hashing guarantees zero hot partitions even when all writes share the exact same partition key.',
        isCorrect: false,
        reason:
          'Incorrect. If all writes use a single identical key, that key still hashes to a single point on the ring; salting/composite keys are needed for single-key hotspots.',
      },
      {
        id: 'd',
        text: 'Consistent hashing converts NoSQL document stores into ACID-compliant relational databases.',
        isCorrect: false,
        reason:
          'Incorrect. Consistent hashing is a data distribution algorithm and does not change the transactional semantics of the storage engine.',
      },
    ],
  },
  {
    id: 'q-write-skew-ssi',
    topic: 'Concurrency Internals: Isolation Levels & Write Skew',
    question:
      'Two on-call doctors simultaneously check that at least 2 doctors are on duty, and each updates their own separate row to go off-call under Repeatable Read (Snapshot Isolation). Why does this violate the invariant, and how does PostgreSQL Serializable prevent it?',
    hint: 'Both transactions read the same snapshot and update disjoint rows — so row-level write locks never collide.',
    options: [
      {
        id: 'a',
        text: 'It is a Dirty Read caused by uncommitted pages; Read Committed prevents it.',
        isCorrect: false,
        reason:
          'Incorrect. Neither transaction reads uncommitted data. Both see committed data from their MVCC snapshot.',
      },
      {
        id: 'b',
        text: 'It is Write Skew on disjoint rows; Serializable Snapshot Isolation (SSI) tracks SIREAD/RW dependency cycles and aborts one transaction with SQLSTATE 40001.',
        isCorrect: true,
        reason:
          'Correct! Because the two transactions modify different rows, Snapshot Isolation detects no write-write conflict. SSI tracks predicate read-write anti-dependencies and aborts one transaction to preserve serializability.',
      },
      {
        id: 'c',
        text: 'It is caused by missing foreign keys; adding a B-Tree index prevents concurrent commits.',
        isCorrect: false,
        reason: 'Incorrect. Indexes accelerate lookups but do not enforce multi-row cross-tuple invariants.',
      },
      {
        id: 'd',
        text: 'MVCC prevents all concurrency anomalies automatically at Repeatable Read.',
        isCorrect: false,
        reason:
          'Incorrect. Snapshot Isolation prevents Dirty Reads and Non-Repeatable Reads, but explicitly still allows Write Skew.',
      },
    ],
  },
  {
    id: 'q-rls-rag',
    topic: 'Security & Multi-Tenancy: Row-Level Security (RLS)',
    question:
      'Why is database-enforced Row-Level Security (RLS) paired with SET LOCAL app.current_tenant_id critical for multi-tenant SaaS and AI RAG vector tables?',
    hint: 'Consider what happens when a new query or pgvector similarity search forgets a WHERE tenant_id = ? filter — and how PgBouncer transaction pooling behaves.',
    options: [
      {
        id: 'a',
        text: 'RLS injects the tenant predicate inside the Analyzer/Query Tree at the engine level, and SET LOCAL scopes the tenant variable strictly to the current pooled transaction.',
        isCorrect: true,
        reason:
          'Correct! Engine-level RLS guarantees zero cross-tenant leaks even on raw SELECTs or vector similarity queries, while SET LOCAL automatically resets when the transaction ends in PgBouncer.',
      },
      {
        id: 'b',
        text: 'SET (session-level) is safer than SET LOCAL when running behind PgBouncer transaction pooling.',
        isCorrect: false,
        reason:
          'Incorrect — dangerous! Session-level SET leaks the previous tenant ID into the next pooled transaction on the same backend worker.',
      },
      {
        id: 'c',
        text: 'RLS compresses vector embeddings by 75% in PostgreSQL TOAST storage.',
        isCorrect: false,
        reason: 'Incorrect. RLS is an authorization filter policy, not a storage compression mechanism.',
      },
      {
        id: 'd',
        text: 'RLS replaces TLS encryption in transit between the application and database.',
        isCorrect: false,
        reason: 'Incorrect. TLS protects network transport; RLS enforces row-level authorization inside the engine.',
      },
    ],
  },
  {
    id: 'q-cdc-dual-write',
    topic: 'Streaming Pipelines: Log-Based CDC vs. Dual Writes',
    question:
      'Your service commits an order update to PostgreSQL and then calls Pinecone and Kafka via HTTP. Why is Log-Based CDC (PostgreSQL WAL -> Debezium -> Kafka) strictly superior?',
    hint: 'What happens if the application pod crashes or times out right after PostgreSQL commits, before the HTTP call completes?',
    options: [
      {
        id: 'a',
        text: 'Log-Based CDC lets the app commit atomically to Postgres only, then streams ordered committed changes directly from the WAL with guaranteed delivery and zero dual-write drift.',
        isCorrect: true,
        reason:
          'Correct! Dual writes cannot share an atomic transaction across Postgres and HTTP APIs. Tailing wal_level=logical via Debezium guarantees downstream Vector DBs, Redis caches, and warehouses converge reliably.',
      },
      {
        id: 'b',
        text: 'Dual writes are always faster and guarantee strict cross-service ACID atomicity.',
        isCorrect: false,
        reason:
          'Incorrect. Dual writes add synchronous network latency and silently drift whenever crashes or timeouts occur between writes.',
      },
      {
        id: 'c',
        text: 'Debezium polls SELECT * FROM orders every second, bypassing the WAL completely.',
        isCorrect: false,
        reason:
          'Incorrect. Polling misses deletes and hammers the primary; Debezium reads the PostgreSQL logical replication slot (WAL) directly.',
      },
      {
        id: 'd',
        text: 'Log-Based CDC requires disabling Write-Ahead Logging in PostgreSQL.',
        isCorrect: false,
        reason: 'Incorrect. Log-Based CDC specifically depends on WAL with wal_level = logical.',
      },
    ],
  },
  {
    id: 'q-nosql-esr-tombstone',
    topic: 'NoSQL Internals: MongoDB ESR & Cassandra Tombstones',
    question:
      'In MongoDB, an endpoint query filters by status = "SHIPPED", createdAt >= lastWeek, and sorts by priority DESC. According to the ESR rule, what is the optimal compound index key order?',
    hint: 'ESR stands for Equality -> Sort -> Range.',
    options: [
      {
        id: 'a',
        text: '{ createdAt: 1, priority: -1, status: 1 }',
        isCorrect: false,
        reason:
          'Incorrect. Putting the Range predicate (createdAt) first breaks index-ordered sorting on priority and forces an in-memory blocking SORT.',
      },
      {
        id: 'b',
        text: '{ status: 1, priority: -1, createdAt: 1 }',
        isCorrect: true,
        reason:
          'Correct! Equality (status) narrows to an exact prefix, Sort (priority: -1) delivers keys already ordered without a blocking sort stage, and Range (createdAt) filters the ordered slice cleanly.',
      },
      {
        id: 'c',
        text: '{ priority: -1, createdAt: 1, status: 1 }',
        isCorrect: false,
        reason:
          'Incorrect. Leading with Sort before Equality forces MongoDB to scan entries for non-matching statuses.',
      },
      {
        id: 'd',
        text: 'Three separate single-field indexes so MongoDB always intersects them in O(1).',
        isCorrect: false,
        reason:
          'Incorrect. A single ESR-ordered compound index vastly outperforms index intersection and avoids sorting.',
      },
    ],
  },
];

export const DYNAMO_VS_PG_COMPARISON = [
  {
    dimension: 'Schema & Access Pattern',
    dynamodb: 'Single-Table Design: Overloaded PK/SK (`PK=TENANT#42#ORD`, `SK=2026-11-21#ORD#91`) plus GSIs tailored strictly to known read paths.',
    postgresJsonb: 'Normalized core columns (`tenant_id`, `order_id`, `status`, `created_at`) + `metadata JSONB` with GIN index for flexible attributes.',
  },
  {
    dimension: 'Latency & Scaling Envelope',
    dynamodb: 'Single-digit ms p99 at virtually unlimited throughput via automatic partition splitting — provided partition keys avoid hot keys.',
    postgresJsonb: 'Sub-5ms p99 on 100M+ rows with proper indexing & partitioning; vertical scaling + Citus/read replicas for massive scale.',
  },
  {
    dimension: 'Ad-Hoc Queries & Joins',
    dynamodb: 'No server-side joins or ad-hoc filters; new access patterns require backfilling a new GSI or ETL to analytics.',
    postgresJsonb: 'Full SQL joins, CTEs, window functions, transactional ACID across tables, and ad-hoc JSONB containment (`@>`) queries.',
  },
  {
    dimension: 'Multi-Tenant Security & Ops',
    dynamodb: 'IAM policy conditions on `dynamodb:LeadingKeys` + zero server maintenance; watch `ProvisionedThroughputExceededException` on hot keys.',
    postgresJsonb: 'Native Row-Level Security (RLS) + PgBouncer + pg_partman + PITR; requires tuning VACUUM, buffer pool, and indexes.',
  },
];
