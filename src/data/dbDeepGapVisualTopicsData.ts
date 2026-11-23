export type DbDeepGapCategory =
  | 'Storage & Vacuum'
  | 'Connections & Migrations'
  | 'Distributed & Clocks'
  | 'Streaming & Analytics';

export interface DbDeepGapStep {
  step: number;
  nodeId: string;
  label: string;
  metricBadge: string;
  summary: string;
  internalsDetail: string;
  stateSnapshot: string;
}

export interface DbDeepGapVisualTopic {
  id: string;
  title: string;
  category: DbDeepGapCategory;
  difficulty: 'Senior' | 'Staff';
  engines: string;
  plainEnglish: string;
  formalDefinition: string;
  whyGapMatters: string;
  steps: DbDeepGapStep[];
  buildMermaid: (activeNodeId: string | null, visitedNodeIds: string[]) => string;
  sqlOrConfigTitle: string;
  sqlOrConfig: string;
  failureModes: { symptom: string; rootCause: string; mitigation: string }[];
}

function buildHighlightedMermaid(
  baseLines: string[],
  allNodeIds: string[],
  activeNodeId: string | null,
  visitedNodeIds: string[]
): string {
  const styles: string[] = [];
  for (const id of visitedNodeIds) {
    if (allNodeIds.includes(id) && id !== activeNodeId) {
      styles.push(`  style ${id} fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px`);
    }
  }
  if (activeNodeId && allNodeIds.includes(activeNodeId)) {
    styles.push(`  style ${activeNodeId} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`);
  }
  return [...baseLines, ...styles].join('\n');
}

export const DB_DEEP_GAP_VISUAL_TOPICS: DbDeepGapVisualTopic[] = [
  {
    id: 'pg-vacuum-hot-xid-wraparound',
    title: 'PostgreSQL VACUUM, Autovacuum, HOT Updates & Transaction ID (XID) Wraparound',
    category: 'Storage & Vacuum',
    difficulty: 'Staff',
    engines: 'PostgreSQL / Aurora PG / AlloyDB',
    plainEnglish:
      'Because MVCC UPDATE writes a new row version instead of overwriting in place, dead tuples bloat tables and 32-bit transaction IDs eventually wrap around unless Autovacuum reclaims space and freezes old rows.',
    formalDefinition:
      'Asynchronous tuple garbage collection scanning heap pages via the Visibility Map to reclaim dead MVCC versions, maintain Heap-Only Tuple (HOT) chains, update the Free Space Map (FSM), and advance `relfrozenxid` before 2^31 XID wraparound.',
    whyGapMatters:
      'Table bloat silently degrades index scans by 10x, and hitting the 2-billion XID wraparound horizon forces PostgreSQL into emergency single-user read-only shutdown.',
    steps: [
      {
        step: 1,
        nodeId: 'UPDATE',
        label: 'MVCC UPDATE Creates Dead Tuple',
        metricBadge: 'xmin=402 · xmax=408',
        summary: 'Updating a row marks the old tuple with `xmax=408` and inserts a brand-new row version in the 8KB heap page.',
        internalsDetail: 'If no indexed column changed AND free space exists in the same 8KB page (`fillfactor=80`), PostgreSQL executes a fast Heap-Only Tuple (HOT) update skipping ALL secondary index writes.',
        stateSnapshot: 'page#14: [v1 DEAD xmax=408] -> [v2 LIVE xmin=408] · hotChain=YES',
      },
      {
        step: 2,
        nodeId: 'BLOAT',
        label: 'Dead Tuples Accumulate & Trigger Autovacuum',
        metricBadge: 'n_dead_tup > 20%',
        summary: 'Once dead tuples exceed `autovacuum_vacuum_threshold + scale_factor * reltuples`, a background worker schedules the table.',
        internalsDetail: 'A single long-running idle-in-transaction session pins the oldest XID horizon so Autovacuum CANNOT reclaim any tuple newer than that zombie transaction!',
        stateSnapshot: 'deadTuples=184,200 · oldestActiveXid=401 · autovacuum=QUEUED',
      },
      {
        step: 3,
        nodeId: 'VACUUM',
        label: 'VACUUM Scans Heap, Cleans Indexes & Updates FSM/VM',
        metricBadge: 'No Table Lock · Online',
        summary: 'Standard `VACUUM` removes dead pointers from B+Tree indexes, marks space reusable in the Free Space Map, and sets All-Visible bits in the Visibility Map.',
        internalsDetail: 'All-Visible bits unlock ultra-fast Index-Only Scans without touching heap pages. (`VACUUM FULL` takes an AccessExclusive lock—use `pg_repack` instead!)',
        stateSnapshot: 'reclaimedSlots=184,200 · visibilityMap=ALL_VISIBLE · lock=NONE',
      },
      {
        step: 4,
        nodeId: 'FREEZE',
        label: 'XID Freeze Prevents 2^31 Wraparound Shutdown',
        metricBadge: 'age(relfrozenxid) Reset',
        summary: 'When tuple age nears `autovacuum_freeze_max_age` (200M XIDs), VACUUM stamps old committed tuples with `HEAP_XMIN_FROZEN` so they remain visible forever.',
        internalsDetail: 'Monitoring `max(age(datfrozenxid))` in Prometheus catches wraparound weeks before the 2-billion hard stop.',
        stateSnapshot: 'frozenXidAge=205M -> 12M · wraparoundRisk=ZERO',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  UPDATE["1. MVCC UPDATE / HOT Chain"] -->|"Dead Tuple + xmax"| BLOAT["2. Autovacuum Threshold Trigger"]',
          '  BLOAT -->|"Skip Long-Tx Horizon"| VACUUM["3. Online VACUUM (FSM + Visibility Map)"]',
          '  VACUUM -->|"age > 200M XIDs"| FREEZE["4. Freeze Old Tuples (Prevent Wraparound)"]',
          '  VACUUM -.->|"All-Visible Bit"| IOS["Index-Only Scan Fast Path"]',
        ],
        ['UPDATE', 'BLOAT', 'VACUUM', 'FREEZE', 'IOS'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'tune-hot-autovacuum-and-monitor-xid.sql',
    sqlOrConfig: `-- Leave 20% page headroom for fast HOT updates on write-heavy tables
ALTER TABLE wallet_balances SET (
  fillfactor = 80,
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_cost_limit = 2000
);
-- Alert if any DB approaches 2^31 XID wraparound
SELECT datname, age(datfrozenxid) AS xid_age FROM pg_database ORDER BY xid_age DESC;`,
    failureModes: [
      {
        symptom: 'Table grows from 40 GB to 280 GB despite constant row count',
        rootCause: 'Default 20% scale_factor waits for 20M dead rows on a 100M-row table, or an abandoned BI transaction holds `xmin` open for 14 hours.',
        mitigation: 'Lower per-table `autovacuum_vacuum_scale_factor = 0.01`, set `idle_in_transaction_session_timeout = 60s`, and reclaim bloat online with `pg_repack`.',
      },
    ],
  },
  {
    id: 'connection-pooling-pgbouncer',
    title: 'Connection Pooling Internals (PgBouncer Transaction vs. Session Pooling)',
    category: 'Connections & Migrations',
    difficulty: 'Senior',
    engines: 'PostgreSQL + PgBouncer / RDS Proxy / ProxySQL',
    plainEnglish:
      'Every PostgreSQL connection spawns a separate OS process (~5–10 MB RAM + snapshot contention). Watch PgBouncer multiplex 5,000 microservice sockets onto 64 hot backend DB processes with zero connection storms.',
    formalDefinition:
      'L4/L7 database protocol multiplexing decoupling thousands of short-lived client TCP connections from a bounded pool of persistent server backend processes at Session, Transaction, or Statement granularity.',
    whyGapMatters:
      'Serverless functions (AWS Lambda) or 200 Kubernetes pods opening 25 pooled connections each instantly hit `FATAL: sorry, too many clients already` and thrash OS context switches.',
    steps: [
      {
        step: 1,
        nodeId: 'STORM',
        label: '5,000 Microservice / Serverless Client Sockets',
        metricBadge: '5,000 Client Conns',
        summary: '200 K8s pods and Lambda workers open 5,000 concurrent TCP/TLS client connections—98% idle between HTTP requests.',
        internalsDetail: 'Connecting directly to PostgreSQL would burn ~40 GB RAM just for idle backends and cause O(N) ProcArray snapshot lock contention.',
        stateSnapshot: 'clientSockets=5,000 · activeInFlightQueries=48 (99% idle)',
      },
      {
        step: 2,
        nodeId: 'MUX',
        label: 'PgBouncer Transaction-Mode Multiplexer',
        metricBadge: '78:1 Multiplex Ratio',
        summary: 'PgBouncer holds client sockets in lightweight epoll memory (~2 KB each) and assigns a real DB backend ONLY from `BEGIN` until `COMMIT`.',
        internalsDetail: 'Because backend connections rotate per transaction, session-level state (`SET search_path`, temp tables, advisory session locks, unnamed prepared statements on older PG) must be avoided.',
        stateSnapshot: 'poolMode=transaction · waitQueue=0ms · serverPool=48/64',
      },
      {
        step: 3,
        nodeId: 'PG',
        label: '64 Optimal PostgreSQL Backend Processes',
        metricBadge: 'CPU Cores × 2–4',
        summary: 'PostgreSQL runs at peak throughput with ~64 active backends—keeping CPU L3 caches warm and context-switch overhead near zero.',
        internalsDetail: 'Throughput actually INCREASES when shrinking max active DB connections from 1,000 down to 64!',
        stateSnapshot: 'pgBackends=64 · cpuContextSwitches=-88% · p99=11ms',
      },
      {
        step: 4,
        nodeId: 'RETURN',
        label: 'Instant Backend Release on COMMIT',
        metricBadge: 'Sub-ms Handoff',
        summary: 'The millisecond Transaction A commits, Backend #17 immediately serves Transaction B from another pod without TCP/TLS handshake cost.',
        internalsDetail: 'Pairs cleanly with `query_wait_timeout` so brief traffic bursts queue smoothly for 50ms instead of failing fast.',
        stateSnapshot: 'txA=COMMITTED -> backend#17 reassigned to txB in 0.1ms',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  STORM["1. 5,000 App / Lambda Sockets"] -->|"Lightweight epoll (2KB)"| MUX["2. PgBouncer (Transaction Pooling)"]',
          '  MUX -->|"Assign on BEGIN"| PG[("3. 64 Persistent PG Backends")]',
          '  PG -->|"Release on COMMIT"| RETURN["4. Instant Reuse + Zero Conn Storm"]',
        ],
        ['STORM', 'MUX', 'PG', 'RETURN'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'pgbouncer-production.ini',
    sqlOrConfig: `[pgbouncer]
pool_mode = transaction
max_client_conn = 10000
default_pool_size = 64
reserve_pool_size = 16
max_prepared_statements = 200
server_idle_timeout = 300`,
    failureModes: [
      {
        symptom: 'Random `prepared statement "s1" does not exist` errors after enabling PgBouncer',
        rootCause: 'Client driver prepared statement on Backend #12, then executed on Backend #41 in transaction mode.',
        mitigation: 'Upgrade to PgBouncer >= 1.21 with `max_prepared_statements > 0` or configure protocol-level prepared statement handling in driver.',
      },
    ],
  },
  {
    id: 'spanner-truetime-hlc-clocks',
    title: 'Distributed Clocks: Google Spanner TrueTime, Commit-Wait (2ε) & Hybrid Logical Clocks (HLC)',
    category: 'Distributed & Clocks',
    difficulty: 'Staff',
    engines: 'Google Cloud Spanner / CockroachDB / YugabyteDB',
    plainEnglish:
      'Server wall clocks drift by 100ms+, breaking global transaction ordering. Watch how Spanner’s GPS + Atomic Clocks bound uncertainty (`ε < 7ms`) and sleep `2ε` before returning COMMIT to guarantee external consistency worldwide.',
    formalDefinition:
      'Globally linearizable (strictly serializable) distributed concurrency control bounding physical clock skew via GPS/atomic TrueTime intervals `[earliest, latest]` or NTP-backed Hybrid Logical Clocks (HLC).',
    whyGapMatters:
      'Without bounded clock uncertainty, a transaction committed in Tokyo at 10:00:00.010 could get a LOWER timestamp than a transaction committed earlier in New York—causing stale reads and causal anomalies.',
    steps: [
      {
        step: 1,
        nodeId: 'TX',
        label: 'Cross-Continent Transaction Coordinates via 2PC + Paxos',
        metricBadge: 'Multi-Region Shard',
        summary: 'Coordinator acquires locks across Paxos/Raft shard groups and prepares the commit across New York & Frankfurt replicas.',
        internalsDetail: 'Paxos/Raft guarantees durability inside each shard; 2PC coordinates atomicity across shards.',
        stateSnapshot: 'shards=[us-east, eu-west] · 2pcState=PREPARED',
      },
      {
        step: 2,
        nodeId: 'TT',
        label: 'TrueTime API Returns Bounded Interval [earliest, latest]',
        metricBadge: 'ε = 3.2ms Uncertainty',
        summary: 'Instead of a single lie-prone timestamp, GPS + Atomic Clock receivers return `[t_earliest, t_latest]` guaranteed to contain true absolute time.',
        internalsDetail: 'Coordinator chooses commit timestamp `s = TT.now().latest` (strictly greater than any previously started causal event).',
        stateSnapshot: 'TT.now()=[100.001, 100.007] · commitTs=100.007 · ε=3.2ms',
      },
      {
        step: 3,
        nodeId: 'WAIT',
        label: 'Commit-Wait Sleeps Until TT.after(s) (~2ε = 6.4ms)',
        metricBadge: 'External Consistency',
        summary: 'Coordinator waits ~6ms before releasing locks & acknowledging the client, guaranteeing true physical time has passed `s` everywhere on Earth.',
        internalsDetail: 'Because lock release happens strictly AFTER true time passes `s`, any subsequent transaction anywhere on Earth is guaranteed a timestamp `s2 > s`.',
        stateSnapshot: 'commitWait=6.4ms · TT.now().earliest > s -> RELEASE LOCKS',
      },
      {
        step: 4,
        nodeId: 'READ',
        label: 'Lock-Free Snapshot Reads at Any Global Replica',
        metricBadge: '0ms Lock · Local Read',
        summary: 'Because timestamps reflect true global causality, read-only queries read a consistent global snapshot from the nearest local replica with ZERO locks!',
        internalsDetail: 'CockroachDB achieves similar guarantees on commodity cloud NTP using Hybrid Logical Clocks (HLC) + read-restart retries when skew exceeds `max_offset`.',
        stateSnapshot: 'readReplica=tokyo-local · locksAcquired=0 · consistent=TRUE',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  TX["1. 2PC + Paxos/Raft Prepare"] -->|"Pick s = TT.latest"| TT["2. TrueTime GPS + Atomic Clock [e, l]"]',
          '  TT -->|"Sleep 2ε (~6ms)"| WAIT["3. Commit-Wait Until TT.after(s)"]',
          '  WAIT -->|"Ack Client + Unlock"| READ["4. Global Lock-Free Consistent Reads"]',
        ],
        ['TX', 'TT', 'WAIT', 'READ'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'spanner-stale-and-strong-reads.sql',
    sqlOrConfig: `-- Strong globally consistent read (external consistency, zero locks)
SET TRANSACTION READ ONLY;
SELECT account_id, balance FROM global_ledger WHERE account_id = 'acct_918';

-- Bounded staleness read (serves from nearest regional replica at <5ms)
-- Spanner API: TimestampBound.ofMaxStaleness(15, TimeUnit.SECONDS)`,
    failureModes: [
      {
        symptom: 'CockroachDB nodes self-terminate with `clock offset exceeded max_offset (500ms)`',
        rootCause: 'Broken NTP/Chrony daemon allowed a VM wall clock to drift beyond the cluster HLC safety window.',
        mitigation: 'Use AWS Time Sync / GCP Metadata NTP with Chrony step-monitoring alerts at >100ms drift.',
      },
    ],
  },
  {
    id: 'cdc-outbox-wal-streaming',
    title: 'Log-Based CDC & Transactional Outbox (WAL Logical Decoding -> Debezium -> Kafka)',
    category: 'Streaming & Analytics',
    difficulty: 'Senior',
    engines: 'PostgreSQL Logical WAL + Debezium + Kafka',
    plainEnglish:
      'Never write to Postgres AND publish to Kafka in application code (one can crash after the other!). Write an Outbox row in the same DB transaction and let Debezium stream the WAL reliably.',
    formalDefinition:
      'Exactly-once state-to-event propagation pairing atomic local ACID outbox inserts with asynchronous Write-Ahead Log (WAL) logical decoding into partitioned event logs.',
    whyGapMatters:
      'Dual writes (`db.commit(); kafka.send()`) cause permanent silent data drift between your payment database, Elasticsearch search index, Redis cache, and data warehouse whenever a pod crashes mid-request.',
    steps: [
      {
        step: 1,
        nodeId: 'ACID',
        label: 'Single Atomic DB Transaction (Domain + Outbox)',
        metricBadge: 'Zero Dual-Write Bug',
        summary: 'Checkout inserts into `orders` AND `outbox_events` inside ONE `BEGIN ... COMMIT` block—either both commit or both roll back.',
        internalsDetail: 'Zero network call to Kafka on the synchronous checkout hot path, cutting checkout latency & error rate.',
        stateSnapshot: 'tx=COMMIT · orders=+1 · outbox_events=+1 · walLSN=0/4A18F20',
      },
      {
        step: 2,
        nodeId: 'SLOT',
        label: 'PostgreSQL Logical Replication Slot (`pgoutput`)',
        metricBadge: 'Sequential WAL Tail',
        summary: 'Debezium tails the committed WAL stream sequentially from the exact last-acknowledged Log Sequence Number (LSN) with minimal DB CPU overhead.',
        internalsDetail: 'Always monitor replication slot lag (`pg_replication_slots`)—an orphaned stopped consumer holds old WAL files until the DB disk fills 100%!',
        stateSnapshot: 'slot=debezium_orders · confirmedFlushLsn=0/4A18F20 · lag=12ms',
      },
      {
        step: 3,
        nodeId: 'KAFKA',
        label: 'Kafka Partitioned Event Stream (Outbox Router SMT)',
        metricBadge: 'Ordered per Aggregate',
        summary: 'Debezium Outbox Router transforms the WAL row into a clean domain event keyed by `aggregate_id` (`order_id`) so all events for one order stay strictly ordered.',
        internalsDetail: 'At-least-once delivery from WAL -> Kafka requires idempotent consumers deduplicating on `event_id`.',
        stateSnapshot: 'topic=orders.events · partition=14 · key=ord_9912',
      },
      {
        step: 4,
        nodeId: 'SINKS',
        label: 'Idempotent Fan-Out to Search, Cache & Lakehouse',
        metricBadge: 'Zero Drift Sync',
        summary: 'Independent consumer groups update Elasticsearch search indexes, invalidate Redis keys, trigger emails, and land Iceberg analytics tables.',
        internalsDetail: 'Adding a new downstream microservice requires zero changes to the Checkout service—just attach a new Kafka consumer group.',
        stateSnapshot: 'esSynced=OK · redisInvalidated=OK · icebergRows=+1',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  ACID["1. Single ACID Tx (orders + outbox)"] -->|"Sequential WAL"| SLOT["2. PG Logical Replication Slot"]',
          '  SLOT -->|"Debezium Outbox SMT"| KAFKA[("3. Kafka Topic (Key = order_id)")]',
          '  KAFKA -->|"Idempotent Consumers"| SINKS["4. Elasticsearch + Redis + Iceberg"]',
        ],
        ['ACID', 'SLOT', 'KAFKA', 'SINKS'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'transactional-outbox-and-slot-guard.sql',
    sqlOrConfig: `-- 1. Atomic write (zero dual-write race)
BEGIN;
  INSERT INTO orders (id, user_id, total_cents) VALUES ($1, $2, $3);
  INSERT INTO outbox_events (id, aggregate_id, event_type, payload)
  VALUES (gen_random_uuid(), $1, 'OrderCreated', $4::jsonb);
COMMIT;
-- 2. Always set max_slot_wal_keep_size to protect DB disk!
-- postgresql.conf: max_slot_wal_keep_size = '50GB'`,
    failureModes: [
      {
        symptom: 'Primary PostgreSQL disk hits 100% and crashes 48 hours after Debezium stops',
        rootCause: 'Inactive logical replication slot prevents PostgreSQL from recycling old `pg_wal` segments.',
        mitigation: 'Configure `max_slot_wal_keep_size` and alert immediately on inactive replication slots or WAL lag > 5 GB.',
      },
    ],
  },
  {
    id: 'zero-downtime-schema-migrations',
    title: 'Zero-Downtime Schema Migrations: Expand-and-Contract, `CONCURRENTLY` & Online DDL',
    category: 'Connections & Migrations',
    difficulty: 'Senior',
    engines: 'PostgreSQL / MySQL (`gh-ost` / `pt-osc`)',
    plainEnglish:
      'Running a naive `ALTER TABLE` or `CREATE INDEX` locks a busy production table and queues every checkout query behind it. Master the 4-phase Expand-Backfill-Switch-Contract pattern.',
    formalDefinition:
      'Non-blocking schema evolution maintaining backward-and-forward application compatibility across rolling deployments by decoupling additive DDL, batched background backfills, dual-writing, and lock-timeout-guarded cutovers.',
    whyGapMatters:
      'A single `ALTER TABLE orders ADD COLUMN ...` waiting behind a 10-second analytics query takes an AccessExclusive lock in PostgreSQL’s wait queue—blocking ALL subsequent SELECTs and taking down production.',
    steps: [
      {
        step: 1,
        nodeId: 'EXPAND',
        label: 'Phase 1: Expand (Additive Nullable DDL + Lock Timeout)',
        metricBadge: 'lock_timeout=2s',
        summary: 'Add the new nullable column (`email_normalized`) or build the index via `CREATE INDEX CONCURRENTLY` with strict `SET lock_timeout = 2s`.',
        internalsDetail: '`CREATE INDEX CONCURRENTLY` performs two table scans without blocking concurrent reads or writes.',
        stateSnapshot: 'alter=ADD COLUMN NULL · index=CONCURRENTLY · blockedQueries=0',
      },
      {
        step: 2,
        nodeId: 'DUAL',
        label: 'Phase 2: Deploy Dual-Write + Throttled Backfill',
        metricBadge: '5K Rows / Batch',
        summary: 'Deploy App v2 writing BOTH old and new columns while a throttled worker backfills historical rows in 5,000-row chunks pausing if replication lag > 200ms.',
        internalsDetail: 'Unthrottled `UPDATE orders SET ...` across 100M rows floods WAL, spikes replica lag, and causes massive dead-tuple bloat.',
        stateSnapshot: 'backfill=68% · batchSize=5000 · replicaLag=42ms',
      },
      {
        step: 3,
        nodeId: 'SWITCH',
        label: 'Phase 3: Validate Constraint (`NOT VALID`) & Switch Reads',
        metricBadge: 'No Full Table Lock',
        summary: 'Add `CHECK (col IS NOT NULL) NOT VALID` (instant metadata lock) then `VALIDATE CONSTRAINT` (ShareUpdateExclusive — allows reads/writes!) before switching App v3 reads.',
        internalsDetail: 'Every running pod works seamlessly during the rolling deploy because both schemas coexist cleanly.',
        stateSnapshot: 'constraint=VALIDATED · reads=new_col · downtime=0ms',
      },
      {
        step: 4,
        nodeId: 'CONTRACT',
        label: 'Phase 4: Contract (Drop Legacy Column Safely)',
        metricBadge: 'Zero Active Readers',
        summary: 'After App v3 is 100% rolled out and rollback window passes, drop the unused legacy column and old index cleanly.',
        internalsDetail: 'For MySQL large table rewrites, `gh-ost` creates a shadow table, replays binlog deltas, and performs an atomic metadata rename.',
        stateSnapshot: 'legacyColumn=DROPPED · migrationStatus=COMPLETE',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  EXPAND["1. Expand: Nullable Col + INDEX CONCURRENTLY"] -->|"Deploy App v2"| DUAL["2. Dual-Write + Throttled Backfill"]',
          '  DUAL -->|"NOT VALID -> VALIDATE"| SWITCH["3. Switch Reads to New Column (App v3)"]',
          '  SWITCH -->|"After Rollback Window"| CONTRACT["4. Contract: Drop Legacy Column"]',
        ],
        ['EXPAND', 'DUAL', 'SWITCH', 'CONTRACT'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'zero-downtime-pg-migration.sql',
    sqlOrConfig: `SET lock_timeout = '2s';
-- Safe concurrent index build (never blocks OLTP reads/writes)
CREATE INDEX CONCURRENTLY idx_orders_email_norm ON orders (email_normalized);
-- Safe NOT NULL enforcement without AccessExclusive table scan lock
ALTER TABLE orders ADD CONSTRAINT chk_email_nn CHECK (email_normalized IS NOT NULL) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT chk_email_nn;`,
    failureModes: [
      {
        symptom: 'Tiny 1-line `ALTER TABLE` freezes the entire website for 4 minutes',
        rootCause: 'An AccessExclusive lock waited behind a slow reporting query, causing all incoming SELECTs to pile up behind the waiting ALTER in the lock queue.',
        mitigation: 'Always wrap DDL in `SET lock_timeout = 2s;` with retry-backoff loops and route reporting queries to read replicas.',
      },
    ],
  },
  {
    id: 'timeseries-geo-fulltext-internals',
    title: 'Specialized Indexes: Time-Series Gorilla Compression, Geospatial H3/R-Tree & Inverted BM25',
    category: 'Storage & Vacuum',
    difficulty: 'Senior',
    engines: 'TimescaleDB / InfluxDB / PostGIS / Elasticsearch',
    plainEnglish:
      'B+Trees fail on 2D maps, billion-point IoT sensor streams, and fuzzy text search. Compare how Gorilla delta-of-delta encoding, H3/R-Tree spatial trees, and BM25 Inverted Indexes compress and accelerate specialized workloads 50x.',
    formalDefinition:
      'Domain-specialized physical access methods exploiting temporal monotonicity (Gorilla XOR/delta-of-delta), 2D spatial locality (R-Tree MBR / Uber H3 hexagons), and token-to-document posting lists (Inverted Index + WAND BM25).',
    whyGapMatters:
      'Running `WHERE lat BETWEEN ... AND lng BETWEEN ...` or `LIKE "%iphone%"` on a standard B+Tree forces full index scans and kills OLTP databases at scale.',
    steps: [
      {
        step: 1,
        nodeId: 'TS',
        label: 'Time-Series: Chunk Partitioning + Gorilla Delta-of-Delta',
        metricBadge: '12x Compression',
        summary: 'Metrics arriving every 10s store `delta-of-delta = 0` in 1 single bit and XOR floating-point readings, shrinking 16 bytes/point down to ~1.37 bytes.',
        internalsDetail: 'Time-range chunks (`hypertables`) allow instant O(1) retention drops (`DROP CHUNK`) instead of expensive `DELETE` vacuum bloat.',
        stateSnapshot: 'ts=[1000,1010,1020] -> dod=0 (1 bit!) · ratio=11.8x',
      },
      {
        step: 2,
        nodeId: 'GEO',
        label: 'Geospatial: R-Tree Bounding Boxes & Uber H3 Hexagons',
        metricBadge: 'O(log N) / O(1) K-Ring',
        summary: 'PostGIS GiST R-Trees group nearby polygons into Minimum Bounding Rectangles; Uber H3 maps `(lat, lng)` to 64-bit hexagonal cell IDs with 6 equidistant neighbors.',
        internalsDetail: 'Unlike square grids/Geohash (which suffer diagonal corner distortion), every H3 hexagon neighbor is at the exact same center-to-center distance.',
        stateSnapshot: 'h3Res9=8928308280fffff · kRing1=7 cells -> 42 drivers',
      },
      {
        step: 3,
        nodeId: 'FTS',
        label: 'Full-Text: Analyzer -> Inverted Index + Roaring Bitmaps',
        metricBadge: 'Term -> DocID List',
        summary: 'Tokenizer lowercases, stems (`running -> run`), and maps each term to a compressed sorted posting list of Document IDs + term frequencies.',
        internalsDetail: 'Lucene/Elasticsearch skips non-matching blocks via Block-Max WAND so multi-word top-10 queries evaluate only a fraction of matching docs.',
        stateSnapshot: 'term="kafka" -> [doc4, doc19, doc88] · wandSkipped=91%',
      },
      {
        step: 4,
        nodeId: 'BM25',
        label: 'BM25 Scoring + Hybrid Vector RRF Fusion',
        metricBadge: 'Exact + Semantic',
        summary: 'BM25 ranks rare exact tokens (`SKU-9421`) highly with saturating TF and length normalization, then Reciprocal Rank Fusion merges lexical + vector ANN scores.',
        internalsDetail: 'Hybrid BM25 + HNSW beats pure vector search dramatically on product codes, error strings, and technical names.',
        stateSnapshot: 'bm25Rank=#1 + vectorRank=#3 -> RRF=0.031 -> Top-1',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  TS["1. Time-Series: Gorilla 1-Bit Delta-of-Delta"] -->|"Specialized Access"| GEO["2. Geospatial: PostGIS R-Tree / H3 Hex"]',
          '  GEO -->|"Text Workload"| FTS["3. Inverted Index + WAND Posting Lists"]',
          '  FTS -->|"Rank + Merge"| BM25["4. BM25 Lexical + Vector Hybrid RRF"]',
        ],
        ['TS', 'GEO', 'FTS', 'BM25'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'specialized-indexes-postgis-gin.sql',
    sqlOrConfig: `-- Geospatial R-Tree (GiST) for O(log N) radius queries
CREATE INDEX idx_stores_geom ON dark_stores USING GIST (location_geog);
-- Full-Text Inverted Index (GIN) for fast multi-term lexical search
CREATE INDEX idx_docs_tsv ON articles USING GIN (to_tsvector('english', title || ' ' || body));`,
    failureModes: [
      {
        symptom: 'Deleting 30-day-old telemetry rows via `DELETE FROM metrics WHERE ts < ...` locks IO for hours',
        rootCause: 'Row-by-row DELETE generates massive WAL + dead tuples requiring endless Autovacuum.',
        mitigation: 'Partition time-series tables by day/week (PostgreSQL Declarative Partitioning / TimescaleDB) and use instant `DROP TABLE` / `DROP CHUNK`.',
      },
    ],
  },
  {
    id: 'sharding-rebalance-hot-salting',
    title: 'Sharding Internals: Vitess/Citus Routing, Hot-Partition Salting & Live Shard Splitting',
    category: 'Distributed & Clocks',
    difficulty: 'Staff',
    engines: 'Vitess / Citus / DynamoDB / CockroachDB',
    plainEnglish:
      'See how a query router picks the exact shard without scatter-gather, why a single viral celebrity key melts 1 shard even in a 64-shard cluster, and how live VReplication splits a full shard with zero downtime.',
    formalDefinition:
      'Horizontal data partitioning distributing keyspace ranges or hash slots across independent storage shards via stateless query routers, write-salting hot keys, and online binlog-driven shard splitting.',
    whyGapMatters:
      'Picking the wrong shard key (e.g., `created_at` timestamp or unbalanced `tenant_id`) directs 100% of writes to a single hot shard while the other 63 shards sit completely idle.',
    steps: [
      {
        step: 1,
        nodeId: 'ROUTE',
        label: 'Stateless Shard Router (VTGate / Citus Coordinator)',
        metricBadge: 'Single-Shard Fast Path',
        summary: 'Router hashes the shard key (`tenant_id` or `user_id`) via Vindex / CRC16 to route 99% of OLTP queries to exactly ONE shard.',
        internalsDetail: 'Cross-shard `JOIN` or `ORDER BY` without shard key triggers expensive scatter-gather across every shard.',
        stateSnapshot: 'sql="WHERE user_id=42" -> hash=0x4B -> Shard #3 (1 hop)',
      },
      {
        step: 2,
        nodeId: 'HOT',
        label: 'Hot-Partition Detection & Key Salting',
        metricBadge: 'Split 1 Key -> 16 Slots',
        summary: 'When a mega-celebrity or flash-sale merchant spikes Shard #3 to 98% CPU, write-salting appends a random suffix `celeb#0..15` spreading writes across 16 shards.',
        internalsDetail: 'Reads merge the 16 salted counters or read from an aggregated Redis/materialized rollup cache.',
        stateSnapshot: 'hotKey=celeb_1 -> salted=[celeb_1#0..15] · shardCpu=98%->14%',
      },
      {
        step: 3,
        nodeId: 'SPLIT',
        label: 'Online Shard Split (`Reshard` / VReplication)',
        metricBadge: 'Live Dual-Stream Copy',
        summary: 'When Shard #3 (`0x40-0x80`) reaches 70% disk, two child shards (`0x40-0x60` & `0x60-0x80`) copy a consistent snapshot and tail live binlog/WAL changes in real time.',
        internalsDetail: 'Production traffic keeps serving Shard #3 normally throughout the multi-hour background copy.',
        stateSnapshot: 'copyProgress=100% · binlogCatchupLag=4ms · readyCutover=YES',
      },
      {
        step: 4,
        nodeId: 'CUTOVER',
        label: 'Atomic Routing-Table Cutover (<500ms Pause)',
        metricBadge: 'Zero Data Loss',
        summary: 'Router briefly pauses writes to Shard #3 (~300ms), verifies final binlog sync, flips routing metadata to the two child shards, and resumes writes immediately.',
        internalsDetail: 'Reverse replication stays armed so operators can instantly roll back if needed.',
        stateSnapshot: 'activeShards=[0x40-0x60, 0x60-0x80] · writePause=280ms',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  ROUTE["1. Shard Router (VTGate / Citus)"] -->|"Hash(key) Single-Shard"| HOT["2. Hot-Key Salting (key#0..15)"]',
          '  HOT -->|"Disk > 70%"| SPLIT["3. Online Shard Split (Snapshot + WAL Tail)"]',
          '  SPLIT -->|"300ms Atomic Flip"| CUTOVER["4. Child Shards Live + Reverse Sync"]',
        ],
        ['ROUTE', 'HOT', 'SPLIT', 'CUTOVER'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'citus-distributed-co-located-tables.sql',
    sqlOrConfig: `-- Co-locate orders & order_items by tenant_id so JOINs stay single-shard!
SELECT create_distributed_table('orders', 'tenant_id');
SELECT create_distributed_table('order_items', 'tenant_id', colocate_with => 'orders');`,
    failureModes: [
      {
        symptom: 'Sharding by monotonically increasing `created_at` causes 100% write saturation on the newest shard',
        rootCause: 'Range-partitioning by timestamp always routes every new INSERT to the right-most shard.',
        mitigation: 'Hash-shard by high-cardinality `tenant_id` or `user_id` (and partition by time inside each shard for fast retention drops).',
      },
    ],
  },
  {
    id: 'lakehouse-iceberg-snapshots-zorder',
    title: 'Lakehouse Internals: Apache Iceberg / Delta Snapshots, Manifest Pruning & Z-Order Clustering',
    category: 'Streaming & Analytics',
    difficulty: 'Staff',
    engines: 'Apache Iceberg / Delta Lake / BigQuery / Snowflake',
    plainEnglish:
      'How do modern data lakes run ACID transactions, Time Travel queries, and 100x faster analytics directly on cheap S3/GCS Parquet files? Follow Iceberg’s immutable snapshot metadata tree.',
    formalDefinition:
      'Open lakehouse table format providing ACID optimistic concurrency, snapshot isolation time-travel, hidden partitioning, and multi-dimensional min/max manifest pruning over immutable columnar Parquet object storage.',
    whyGapMatters:
      'Legacy Hive directory listing (`s3:ListObjects` across 100K partitions) took minutes before a query even started and failed with partial corrupt files if a Spark job crashed mid-write.',
    steps: [
      {
        step: 1,
        nodeId: 'CAT',
        label: 'Atomic Catalog Pointer Swap (Optimistic ACID)',
        metricBadge: 'CAS Swap · 0 Partial Files',
        summary: 'Writer writes new immutable Parquet files + Manifests to S3, then atomically compares-and-swaps `current_metadata_ptr` in the Catalog (Nessie / Glue / REST).',
        internalsDetail: 'If a Spark job crashes halfway, readers still point to the previous immutable snapshot—never seeing half-written files!',
        stateSnapshot: 'snapshotId=snap_482 -> snap_483 (CAS OK) · isolation=SERIALIZABLE',
      },
      {
        step: 2,
        nodeId: 'MLIST',
        label: 'Manifest List & Partition Pruning (Zero `s3:ListObjects`)',
        metricBadge: '96% Partitions Pruned',
        summary: 'Query planner reads the lightweight Manifest List Avro file and skips every partition outside `event_date = 2026-11-22` without listing S3.',
        internalsDetail: 'Iceberg Hidden Partitioning automatically applies `days(event_ts)` transforms so analysts never forget partition columns in `WHERE` clauses.',
        stateSnapshot: 'manifestsScanned=2/54 · s3ListCalls=0',
      },
      {
        step: 3,
        nodeId: 'MFILE',
        label: 'Column Min/Max Zone-Map & Z-Order File Pruning',
        metricBadge: 'Read 14 / 4,200 Files',
        summary: 'Each Manifest stores exact per-file `[min, max]` bounds for every column; Z-Order clustering co-locates multi-column filters (`tenant_id` + `region`) into tight files.',
        internalsDetail: 'Eliminates 99%+ of S3 GET requests and network egress before the vectorized Parquet reader touches a single byte.',
        stateSnapshot: 'parquetFilesMatched=14/4200 · bytesScanned=-99.6%',
      },
      {
        step: 4,
        nodeId: 'TTRAVEL',
        label: 'Zero-Copy Time Travel, Branching & Compaction',
        metricBadge: 'AS OF VERSION 481',
        summary: 'Analysts query historical snapshots cleanly for ML reproducibility or instant rollback while background jobs compact tiny streaming files into 256MB Parquet blocks.',
        internalsDetail: 'Expire old snapshots (`expire_snapshots`) after 7–30 days to prevent unbounded S3 storage bloat.',
        stateSnapshot: 'timeTravel=snap_481 · smallFilesCompacted=1200->8',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  CAT["1. Iceberg Catalog (Atomic CAS Pointer)"] -->|"Current Snapshot"| MLIST["2. Manifest List (Partition Pruning)"]',
          '  MLIST -->|"Min/Max Zone Maps + Z-Order"| MFILE["3. Manifest Files (Skip 99% Parquet)"]',
          '  MFILE -->|"Vectorized Scan"| TTRAVEL[("4. Immutable S3/GCS Parquet + Time Travel")]',
        ],
        ['CAT', 'MLIST', 'MFILE', 'TTRAVEL'],
        active,
        visited
      ),
    sqlOrConfigTitle: 'iceberg-time-travel-and-compaction.sql',
    sqlOrConfig: `-- Zero-copy Time Travel to debug a bad ETL pipeline deploy
SELECT count(*), sum(amount) FROM prod.lakehouse.orders VERSION AS OF 481;

-- Compact thousands of tiny Kafka-streamed Parquet files into 256MB blocks
CALL prod.system.rewrite_data_files(
  table => 'lakehouse.orders',
  strategy => 'sort',
  sort_order => 'zorder(tenant_id, region)'
);`,
    failureModes: [
      {
        symptom: 'Streaming Kafka->Iceberg table slows to a crawl after 2 weeks ("Small Files Problem")',
        rootCause: 'Flink/Kafka Connect commits a 200 KB Parquet file every minute -> 20,000 tiny files choke metadata planning and S3 GET latency.',
        mitigation: 'Schedule automated `rewrite_data_files` compaction (target 256–512 MB files) + `expire_snapshots` maintenance jobs.',
      },
    ],
  },
];
