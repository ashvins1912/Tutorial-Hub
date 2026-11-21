export interface DatabaseParadigm {
  id: string;
  name: string;
  engines: string;
  category: 'SQL / Relational' | 'NoSQL' | 'Specialized / AI & OLAP';
  capPosition: 'CP' | 'AP' | 'Tunable CP/AP';
  pacelc: string;
  consistencyModel: string;
  storageLayout: string;
  indexStructure: string;
  simpleEnglish: string;
  standardDefinition: string;
  idealWorkloads: string[];
  avoidWhen: string;
  realWorldExample: string;
  failureMode: string;
  mitigation: string;
}

export interface WorkloadMatcherPreset {
  id: string;
  label: string;
  requirements: string;
  recommendedIds: string[];
  rationale: string;
  secondaryPattern: string;
}

export interface SqlMasteryPattern {
  id: string;
  group: 'ddl' | 'dml' | 'dql' | 'pagination-vector';
  title: string;
  subtitle: string;
  simpleEnglish: string;
  standardDefinition: string;
  antiPatternTitle: string;
  antiPatternSql: string;
  antiPatternImpact: string;
  productionTitle: string;
  productionSql: string;
  productionImpact: string;
  keyTakeaway: string;
}

export interface ShardingStrategyComparison {
  id: 'range' | 'modulo' | 'consistent-hash';
  name: string;
  howItWorks: string;
  rangeQueries: string;
  rebalanceCost: string;
  hotspotRisk: string;
  bestFor: string;
}

export const DATABASE_PARADIGMS: DatabaseParadigm[] = [
  {
    id: 'relational',
    name: 'Relational (RDBMS)',
    engines: 'PostgreSQL, MySQL InnoDB, Oracle',
    category: 'SQL / Relational',
    capPosition: 'CP',
    pacelc: 'PC/EC (Consistency over Availability & Latency)',
    consistencyModel: 'Strong ACID (MVCC + Snapshot / SSI)',
    storageLayout: 'Row-Oriented 8KB/16KB Slotted Pages + WAL',
    indexStructure: 'B+ Tree, GIN, GiST, BRIN, Partial Covering',
    simpleEnglish:
      'Strict spreadsheets with rules, relationships, and unbreakable transaction guarantees—money never disappears between accounts.',
    standardDefinition:
      'Schema-enforced relational database management system organizing tuples into normalized tables with ACID transactions, relational algebra joins, and cost-based query optimization.',
    idealWorkloads: [
      'Banking & UPI financial ledgers',
      'E-commerce orders, inventory & billing',
      'Multi-tenant SaaS core system-of-record',
    ],
    avoidWhen: 'Extreme multi-region active-active raw telemetry ingestion (>500K writes/sec) without sharding.',
    realWorldExample: 'Stripe payment ledgers, Shopify core commerce, UPI settlement ledgers.',
    failureMode: 'Connection storms, TXID wraparound, or blocking DDL lock queues.',
    mitigation: 'PgBouncer transaction pooling, UUIDv7 PKs, range partitioning, and lock_timeout = 2s.',
  },
  {
    id: 'document',
    name: 'Document Store',
    engines: 'MongoDB (WiredTiger), Couchbase',
    category: 'NoSQL',
    capPosition: 'CP',
    pacelc: 'PC/EC (Majority Write Concern & Read Concern)',
    consistencyModel: 'Single-document atomic; tunable replica-set majority',
    storageLayout: 'Compressed BSON/JSON Document Pages (WiredTiger)',
    indexStructure: 'B-Tree Compound Indexes (ESR Rule), Multikey, Atlas Search',
    simpleEnglish:
      'Stores each entity as a self-contained JSON folder so nested data (like a product catalog with varied specs) loads in one read without 8 joins.',
    standardDefinition:
      'Schema-flexible document-oriented database persisting hierarchical JSON/BSON records with secondary indexing and replica-set horizontal sharding.',
    idealWorkloads: [
      'Polymorphic product catalogs & CMS',
      'User profiles with evolving attributes',
      'Order snapshots & event payloads',
    ],
    avoidWhen: 'Complex ad-hoc multi-collection relational joins or heavy cross-entity financial accounting.',
    realWorldExample: 'E-commerce product catalogs (varying attributes for laptops vs. shoes) & CMS platforms.',
    failureMode: 'COLLSCAN on unindexed queries, violated ESR index ordering, or unbounded embedded arrays hitting 16MB limit.',
    mitigation: 'Audit .explain("executionStats") for 1:1 examined/returned ratio, apply ESR rule, and use Bucket Pattern.',
  },
  {
    id: 'key-value',
    name: 'Key-Value Store',
    engines: 'Redis, Amazon DynamoDB, Valkey',
    category: 'NoSQL',
    capPosition: 'Tunable CP/AP',
    pacelc: 'PA/EL (DynamoDB Eventual) or PC/EC (Strong Read)',
    consistencyModel: 'Eventual or Strong per-request (DynamoDB); Single-threaded atomic (Redis)',
    storageLayout: 'In-Memory Hash Table (Redis) / Partitioned B-Tree + SSD Log (DynamoDB)',
    indexStructure: 'O(1) Hash Map + Partition Key / Sort Key + GSIs',
    simpleEnglish:
      'A lightning-fast coat check: hand over an exact ticket key and get your value back in under a millisecond—no complex searching required.',
    standardDefinition:
      'High-throughput associative dictionary mapping opaque keys to values or structured single-table items with predictable O(1) lookup latency.',
    idealWorkloads: [
      'Session state, rate limiting & distributed caches (Redis)',
      'Shopping carts & high-scale single-table microservices (DynamoDB)',
      'Real-time leaderboards (Redis Sorted Sets)',
    ],
    avoidWhen: 'Unpredictable ad-hoc analytical queries across arbitrary non-indexed columns.',
    realWorldExample: 'Amazon shopping cart & checkout state (DynamoDB); Twitter/X timeline & rate-limit cache (Redis).',
    failureMode: 'Redis cache stampede / hot-key saturation; DynamoDB ProvisionedThroughputExceededException on unsharded keys.',
    mitigation: 'Request coalescing + jittered TTLs in Redis; write-sharded salted PKs (PK#0..15) + DAX in DynamoDB.',
  },
  {
    id: 'wide-column',
    name: 'Wide-Column (LSM)',
    engines: 'Apache Cassandra, ScyllaDB, Bigtable',
    category: 'NoSQL',
    capPosition: 'AP',
    pacelc: 'PA/EL (Tunable Strong via W + R > N Quorum)',
    consistencyModel: 'Leaderless Dynamo Quorum (LOCAL_QUORUM for strong reads)',
    storageLayout: 'LSM-Tree: CommitLog + MemTable + Immutable SSTables',
    indexStructure: 'Consistent Hashing Ring Partition Key + Sorted Clustering Keys + Bloom Filters',
    simpleEnglish:
      'Built like a massive write-only logbook spread across hundreds of servers—absorbs millions of writes per second even if entire racks go offline.',
    standardDefinition:
      'Masterless distributed wide-column store utilizing consistent hashing, LSM-Tree sequential storage, and tunable quorum replication for linear write scalability.',
    idealWorkloads: [
      'Chat message histories & social activity feeds',
      'High-volume IoT & sensor write bursts',
      'Multi-region active-active always-writable workloads',
    ],
    avoidWhen: 'Mutable FIFO queues (frequent deletes), ad-hoc joins, or cross-partition ACID transactions.',
    realWorldExample: 'Discord message storage (ScyllaDB), Apple/Netflix multi-region activity & telemetry stores.',
    failureMode: 'TombstoneOverwhelmingException from frequent DELETEs or unbounded >500MB hot partitions.',
    mitigation: 'Time-bucket partition keys ((tenant_id, month)), never insert NULLs, and use TimeWindowCompactionStrategy (TWCS).',
  },
  {
    id: 'graph',
    name: 'Graph Database',
    engines: 'Neo4j, Amazon Neptune, Memgraph',
    category: 'NoSQL',
    capPosition: 'CP',
    pacelc: 'PC/EC (ACID transactional graph traversals)',
    consistencyModel: 'ACID (Causal Clustering with Raft in Neo4j)',
    storageLayout: 'Index-Free Adjacency (Direct Physical Edge Pointers)',
    indexStructure: 'Direct Node->Relationship Pointer Chains + Label Indexes',
    simpleEnglish:
      'Instead of doing 6 slow table joins to find "friends of friends who share a credit card", every node holds direct physical pointers to its neighbors.',
    standardDefinition:
      'Native property-graph engine storing vertices and directed typed edges with index-free adjacency for O(degree) multi-hop relationship traversal.',
    idealWorkloads: [
      'Real-time payment fraud rings & AML detection',
      'Knowledge graphs & GraphRAG entity reasoning',
      'Social network recommendations & supply-chain dependencies',
    ],
    avoidWhen: 'Flat tabular aggregations across billions of unrelated log rows.',
    realWorldExample: 'Banking fraud ring detection (shared device/IP/account hops), LinkedIn connection paths.',
    failureMode: 'Supernodes (celebrity vertices with 50M edges) exhausting traversal memory.',
    mitigation: 'Cap hop depth, filter by edge direction/type early, and offload supernode fan-out to precomputed caches.',
  },
  {
    id: 'time-series',
    name: 'Time-Series & Real-Time OLAP',
    engines: 'TimescaleDB, ClickHouse, InfluxDB',
    category: 'Specialized / AI & OLAP',
    capPosition: 'Tunable CP/AP',
    pacelc: 'PA/EL (ClickHouse) or PC/EC (TimescaleDB on PG)',
    consistencyModel: 'Append-optimized eventual (ClickHouse) or Full ACID (TimescaleDB)',
    storageLayout: 'Columnar Compressed Blocks (Delta-of-Delta, Gorilla, ZSTD) + Time Chunks',
    indexStructure: 'Sparse Primary Index / BRIN / Time-Chunk Hypertables',
    simpleEnglish:
      'Packs timestamped measurements column-by-column with extreme compression so computing 30-day p99 latency across 10 billion events finishes in milliseconds.',
    standardDefinition:
      'Time-partitioned columnar or chunked storage engine optimized for high-velocity chronological appends, continuous rollups, and vectorized range aggregations.',
    idealWorkloads: [
      'Observability metrics, APM traces & server telemetry',
      'Real-time rider GPS / IoT fleet tracking',
      'Financial tick data & clickstream analytics',
    ],
    avoidWhen: 'Frequent random single-row UPDATE/DELETE mutations across historical timestamps.',
    realWorldExample: 'Uber/DoorDash live driver GPS telemetry, Cloudflare real-time HTTP log analytics (ClickHouse).',
    failureMode: 'High-cardinality tag explosion or row-by-row inserts creating thousands of tiny unmerged parts.',
    mitigation: 'Batch inserts (10K–100K rows/sec), use materialized rollups, and drop expired time chunks automatically.',
  },
  {
    id: 'vector-ai',
    name: 'Vector / AI Search Engine',
    engines: 'pgvector, Qdrant, Pinecone, Milvus',
    category: 'Specialized / AI & OLAP',
    capPosition: 'Tunable CP/AP',
    pacelc: 'PC/EC (pgvector) or PA/EL (Dedicated Distributed Vector)',
    consistencyModel: 'Transactional with SQL (pgvector) or Eventual Index Convergence',
    storageLayout: 'Dense/Quantized Float Arrays + Layered Proximity Graphs in RAM',
    indexStructure: 'HNSW (Hierarchical Navigable Small World), DiskANN, IVFFlat',
    simpleEnglish:
      'Turns text or images into numeric coordinates (embeddings) and navigates a RAM expressway graph to find the most semantically similar meanings in milliseconds.',
    standardDefinition:
      'Approximate Nearest Neighbor (ANN) search index executing cosine, inner-product, or L2 distance queries over high-dimensional embeddings combined with metadata filtering.',
    idealWorkloads: [
      'Enterprise Multi-Tenant AI RAG knowledge retrieval',
      'Semantic product & image similarity search',
      'Hybrid BM25 lexical + dense vector reranking',
    ],
    avoidWhen: 'Exact keyword/ID lookups or transactional ledger accounting.',
    realWorldExample: 'Multi-tenant enterprise AI copilots (pgvector + RLS), semantic e-commerce discovery.',
    failureMode: 'Float32 HNSW graph exceeding host RAM causing 100× disk page-fault latency spikes, or post-filter recall collapse.',
    mitigation: 'Use halfvec (fp16) or binary quantization, enforce RLS + iterative filtered scans, and size RAM >= 1.4× HNSW size.',
  },
  {
    id: 'cloud-olap',
    name: 'Cloud OLAP Warehouse',
    engines: 'Snowflake, Google BigQuery, Databricks SQL',
    category: 'Specialized / AI & OLAP',
    capPosition: 'CP',
    pacelc: 'PC/EC (Snapshot Isolation over Object Storage)',
    consistencyModel: 'ACID Snapshot Isolation for Batch & Streaming Loads',
    storageLayout: 'Immutable 16MB Columnar Micro-Partitions on S3/GCS (Decoupled Compute)',
    indexStructure: 'Zone Maps (Min/Max Metadata Pruning) + Clustering Keys',
    simpleEnglish:
      'Stores petabytes of historical business data cheaply in cloud object storage and spins up elastic compute clusters to scan only the exact columns needed.',
    standardDefinition:
      'Massively Parallel Processing (MPP) columnar analytical warehouse separating durable object storage from stateless elastic compute engines.',
    idealWorkloads: [
      'Executive BI dashboards & multi-year cohort analysis',
      'Petabyte-scale SQL joins & ML feature engineering',
      'Downstream sink for Debezium/Kafka CDC pipelines',
    ],
    avoidWhen: 'Sub-20ms high-concurrency OLTP single-row lookups or frequent single-row UPDATEs.',
    realWorldExample: 'Company-wide revenue attribution, ML training datasets, and regulatory audit lakes.',
    failureMode: 'Single-row OLTP inserts fragmenting micro-partitions or unclustered queries scanning full terabytes.',
    mitigation: 'Ingest via Snowpipe/COPY INTO batches, cluster by dominant date/tenant filters, and monitor remote disk spills.',
  },
];

export const WORKLOAD_MATCHER_PRESETS: WorkloadMatcherPreset[] = [
  {
    id: 'upi-ledger',
    label: 'UPI / Banking Payment Ledger',
    requirements: 'Zero lost money, strict ACID, Serializable/atomic balances, 5K+ TPS',
    recommendedIds: ['relational', 'key-value'],
    rationale:
      'PostgreSQL (CP / PC-EC) guarantees strict ACID durability, atomic balance deductions, and SSI against Write Skew. Pair with Redis strictly for idempotency keys and rate limits.',
    secondaryPattern: 'Stream committed ledger deltas via Debezium CDC -> Snowflake for financial reporting.',
  },
  {
    id: 'food-delivery-gps',
    label: 'Food Delivery Live Rider Tracking',
    requirements: '200K GPS pings/sec, time-window queries, low-latency current location lookup',
    recommendedIds: ['time-series', 'key-value'],
    rationale:
      'Redis Geospatial handles sub-millisecond live driver coordinates, while TimescaleDB or ClickHouse compresses high-velocity historical GPS tracks in columnar time chunks.',
    secondaryPattern: 'Drop expired GPS partitions after 30 days in O(1) ms without DELETE vacuum storms.',
  },
  {
    id: 'enterprise-rag',
    label: 'Multi-Tenant Enterprise AI RAG Search',
    requirements: 'Zero cross-tenant data leaks, hybrid SQL metadata + 1536-dim vector similarity',
    recommendedIds: ['vector-ai', 'relational'],
    rationale:
      'PostgreSQL + pgvector (halfvec HNSW) with engine-enforced Row-Level Security (RLS) keeps permissions, metadata, and embeddings transactionally consistent.',
    secondaryPattern: 'For 100M+ vectors, decouple via PostgreSQL Logical WAL -> Debezium -> Kafka -> Qdrant/Pinecone.',
  },
  {
    id: 'chat-telemetry',
    label: 'Global Chat History & IoT Write Storm',
    requirements: '500K writes/sec, always-writable multi-region, linear horizontal scaling',
    recommendedIds: ['wide-column'],
    rationale:
      'Cassandra / ScyllaDB LSM-Trees convert random bursts into sequential CommitLog + MemTable writes with Consistent Hashing and LOCAL_QUORUM (W+R>N).',
    secondaryPattern: 'Bucket partition keys by (channel_id, month) and use TWCS to prevent unbounded partitions.',
  },
  {
    id: 'fraud-ring',
    label: 'Real-Time Payment Fraud Ring Detection',
    requirements: 'Traverse 4–6 hops (User -> Device -> Card -> Merchant) in < 30ms',
    recommendedIds: ['graph', 'relational'],
    rationale:
      'Neo4j Index-Free Adjacency follows direct pointer chains in O(degree) instead of 6 expensive relational self-joins, while Postgres remains the transactional ledger.',
    secondaryPattern: 'Feed confirmed transactions asynchronously from Postgres WAL CDC into the Graph engine.',
  },
];

export const SQL_MASTERY_PATTERNS: SqlMasteryPattern[] = [
  {
    id: 'ddl-zero-downtime',
    group: 'ddl',
    title: 'DDL: Declarative Partitioning, Constraints & Zero-Downtime Migrations',
    subtitle: 'CREATE, ALTER, TRUNCATE, PARTITION BY RANGE, CONCURRENTLY & lock_timeout',
    simpleEnglish:
      'Structure tables with time-ordered IDs and monthly drawers you can detach in milliseconds, and always add a 2-second lock seatbelt before altering live production tables.',
    standardDefinition:
      'Data Definition Language (DDL) schema orchestration governing physical table layout, declarative range partitioning, integrity constraints, and non-blocking metadata evolution.',
    antiPatternTitle: 'Anti-Pattern: Blocking DDL & Random UUIDv4 + Bulk DELETE',
    antiPatternSql: `-- DANGEROUS IN PRODUCTION:
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- random UUIDv4 fragments B+ Tree!
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL
);

-- Blocks ALL writes & queues behind slow BI queries:
ALTER TABLE events ADD COLUMN region TEXT NOT NULL DEFAULT 'us';
CREATE INDEX idx_events_created ON events (created_at);

-- Causes hours of WAL bloat & autovacuum starvation:
DELETE FROM events WHERE created_at < NOW() - INTERVAL '90 days';`,
    antiPatternImpact: 'ACCESS EXCLUSIVE lock outage + 50/50 B+ Tree splits + 40GB WAL delete storm',
    productionTitle: 'Production Pattern: UUIDv7 + Range Partitioning + Safe DDL',
    productionSql: `-- 1. Partitioned table with sequential UUIDv7 primary key
CREATE TABLE events (
  id         UUID NOT NULL DEFAULT uuidv7(),
  tenant_id  UUID NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. Zero-downtime migration guardrails
SET lock_timeout = '2s';
ALTER TABLE events ADD COLUMN region TEXT; -- Instant nullable metadata add
CREATE INDEX CONCURRENTLY idx_events_tenant_time ON events (tenant_id, created_at DESC);

-- 3. Instant O(1) retention cleanup (milliseconds, zero vacuum bloat)
ALTER TABLE events DETACH PARTITION events_2025_08 CONCURRENTLY;
DROP TABLE events_2025_08;`,
    productionImpact: '< 2ms metadata DDL · 0 blocked checkout traffic · O(1) partition drop',
    keyTakeaway:
      'TRUNCATE / DROP PARTITION frees disk blocks instantly in O(1); DELETE marks dead tuples one-by-one and forces autovacuum to clean them.',
  },
  {
    id: 'dml-merge-skiplocked',
    group: 'dml',
    title: 'DML: Idempotent MERGE / Upsert, RETURNING & SKIP LOCKED Queues',
    subtitle: 'INSERT ON CONFLICT, MERGE, Atomic UPDATE, Batched DML & Job Workers',
    simpleEnglish:
      'Combine "insert if new, update if existing" into one atomic command, return the result immediately to save a round-trip, and let parallel workers skip rows already claimed by peers.',
    standardDefinition:
      'Data Manipulation Language (DML) transactional patterns enforcing idempotent upserts, atomic read-modify-write semantics, and contention-free concurrent queue consumption.',
    antiPatternTitle: 'Anti-Pattern: Check-Then-Insert Race & Blocking Queue Poll',
    antiPatternSql: `-- RACE CONDITION (2 requests both see 0 rows -> duplicate key crash):
SELECT * FROM user_quota WHERE user_id = $1;
-- App code decides to INSERT or UPDATE in a separate round trip!

-- LOST UPDATE (app reads balance=150, computes 50 in Node, overwrites):
UPDATE accounts SET balance = 50 WHERE id = $1;

-- QUEUE LOCK CONTENTION (50 workers fight over the exact same top row):
SELECT job_id FROM jobs WHERE status = 'PENDING' ORDER BY created_at LIMIT 1 FOR UPDATE;`,
    antiPatternImpact: 'Duplicate key failures · Silent overdrafts · 49 of 50 workers stalled on row lock',
    productionTitle: 'Production Pattern: Atomic MERGE/Upsert + RETURNING + SKIP LOCKED',
    productionSql: `-- 1. Atomic Idempotent Upsert with RETURNING (1 round trip)
INSERT INTO user_quota (user_id, credits_used, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
  credits_used = user_quota.credits_used + EXCLUDED.credits_used,
  updated_at   = NOW()
RETURNING user_id, credits_used;

-- 2. SQL-Standard MERGE for batch sync pipelines
MERGE INTO inventory AS t
USING incoming_stock AS s ON t.sku = s.sku
WHEN MATCHED THEN UPDATE SET qty = t.qty + s.delta
WHEN NOT MATCHED THEN INSERT (sku, qty) VALUES (s.sku, s.delta);

-- 3. Lock-Free Concurrent Worker Queue (zero wait across 100 workers)
WITH next_job AS (
  SELECT job_id FROM jobs
  WHERE status = 'PENDING'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
UPDATE jobs j SET status = 'RUNNING', started_at = NOW()
FROM next_job WHERE j.job_id = next_job.job_id
RETURNING j.job_id, j.payload;`,
    productionImpact: 'Zero race conditions · 50% fewer DB round-trips · Linear worker throughput',
    keyTakeaway:
      'Never split read-check-write across network hops when the database engine can execute it atomically via ON CONFLICT, MERGE, or atomic UPDATE.',
  },
  {
    id: 'dql-ctes-windows',
    group: 'dql',
    title: 'DQL & Analytics: CTEs (WITH) & Window Functions (ROW_NUMBER, RANK, LAG)',
    subtitle: 'Top-N per Group, Running Totals & Period-over-Period Deltas in 1 Pass',
    simpleEnglish:
      'Window functions let you rank items inside each group or compare today’s row with yesterday’s row without collapsing your table like GROUP BY or doing slow self-joins.',
    standardDefinition:
      'Declarative analytical SQL leveraging Common Table Expressions (CTEs) and OVER (PARTITION BY ... ORDER BY ...) window frames for single-pass ranking and lag/lead comparisons.',
    antiPatternTitle: 'Anti-Pattern: Correlated Subquery (O(N^2) Execution)',
    antiPatternSql: `-- Executes an inner subquery for EVERY SINGLE ORDER ROW!
SELECT o.customer_id, o.order_id, o.total_amount
FROM orders o
WHERE o.total_amount = (
  SELECT MAX(o2.total_amount)
  FROM orders o2
  WHERE o2.customer_id = o.customer_id
);`,
    antiPatternImpact: 'O(N^2) repeated scans · 18+ seconds on 5M orders',
    productionTitle: 'Production Pattern: CTE + ROW_NUMBER / LAG Window Pass',
    productionSql: `WITH ranked_orders AS (
  SELECT
    customer_id,
    order_id,
    total_amount,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY total_amount DESC, created_at DESC
    ) AS rn,
    LAG(total_amount) OVER (
      PARTITION BY customer_id
      ORDER BY created_at
    ) AS prev_order_amount,
    SUM(total_amount) OVER (
      PARTITION BY customer_id
      ORDER BY created_at
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_ltv
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '90 days'
)
SELECT customer_id, order_id, total_amount,
       total_amount - COALESCE(prev_order_amount, 0) AS delta_vs_prev,
       running_ltv
FROM ranked_orders
WHERE rn <= 3; -- Top 3 orders per customer in a single scan`,
    productionImpact: 'Single ordered pass O(N log N) · Top-N + LTV + Delta computed together',
    keyTakeaway:
      'ROW_NUMBER() guarantees unique 1,2,3 ranks; RANK() leaves gaps on ties (1,1,3); DENSE_RANK() keeps contiguous ranks (1,1,2).',
  },
  {
    id: 'dql-keyset-vector',
    group: 'pagination-vector',
    title: 'Keyset (Cursor) Pagination vs. OFFSET & Hybrid Vector Search (<=>)',
    subtitle: 'O(log N) Deep Pagination & Filtered pgvector Semantic Retrieval',
    simpleEnglish:
      'OFFSET 100000 forces the database to walk past and throw away 100,000 rows every single page click. Keyset pagination jumps directly to the last item you saw in microseconds.',
    standardDefinition:
      'Seek-method tuple-comparison pagination leveraging composite B+ Tree ordering for constant-time deep paging, paired with pgvector HNSW cosine distance (<=>) for hybrid AI retrieval.',
    antiPatternTitle: 'Anti-Pattern: Deep OFFSET Pagination (Gets Slower Every Page)',
    antiPatternSql: `-- Scans and discards 200,000 rows just to return 20!
-- Also skips/duplicates rows if new orders arrive while paging.
SELECT order_id, created_at, total_amount
FROM orders
WHERE tenant_id = $1
ORDER BY created_at DESC, order_id DESC
LIMIT 20 OFFSET 200000;`,
    antiPatternImpact: 'Latency climbs linearly with page number: 640 ms at page 10,000',
    productionTitle: 'Production Pattern: Keyset Seek Cursor + Hybrid Vector Search (<=>)',
    productionSql: `-- 1. O(log N) Keyset Pagination (requires composite index on tenant_id, created_at DESC, order_id DESC)
SELECT order_id, created_at, total_amount
FROM orders
WHERE tenant_id = $1
  AND (created_at, order_id) < ($last_created_at, $last_order_id)
ORDER BY created_at DESC, order_id DESC
LIMIT 20;

-- 2. Hybrid Metadata + Semantic AI Vector Search (pgvector halfvec HNSW + RLS)
SELECT doc_id, title,
       1 - (embedding::halfvec(1536) <=> $query_vec::halfvec(1536)) AS cosine_score
FROM knowledge_base
WHERE category = 'runbooks'
ORDER BY embedding::halfvec(1536) <=> $query_vec::halfvec(1536)
LIMIT 10;`,
    productionImpact: 'Constant 0.4 ms even at page 100,000 · Zero skipped rows · Sub-15ms RAG recall',
    keyTakeaway:
      'Always include a unique tie-breaker column (order_id) in Keyset tuple comparisons (created_at, order_id) < ($1, $2) so equal timestamps never drop rows.',
  },
];

export const SHARDING_STRATEGIES: ShardingStrategyComparison[] = [
  {
    id: 'range',
    name: 'Range Sharding',
    howItWorks: 'Assigns contiguous key ranges (e.g., A–F -> Shard 1, Jan–Mar -> Shard 2) via a routing metadata table.',
    rangeQueries: 'Excellent — BETWEEN / ORDER BY scans hit 1–2 adjacent shards only.',
    rebalanceCost: 'Medium — requires splitting hot ranges and migrating range chunks.',
    hotspotRisk: 'High for monotonically increasing keys (e.g., today’s timestamp all hits the latest shard).',
    bestFor: 'Time-series analytics, CockroachDB / TiDB / HBase range splits.',
  },
  {
    id: 'modulo',
    name: 'Modulo Hashing (hash(k) % N)',
    howItWorks: 'Computes hash(shard_key) % N to map each key uniformly across N shards.',
    rangeQueries: 'Poor — requires Scatter-Gather fan-out across all N shards.',
    rebalanceCost: 'Catastrophic — changing N -> N+1 remaps ~85–95% of all data.',
    hotspotRisk: 'Low for uniform keys; still vulnerable to single celebrity key.',
    bestFor: 'Fixed-size static partition pools (e.g., 256 logical buckets never resized).',
  },
  {
    id: 'consistent-hash',
    name: 'Consistent Hashing + Virtual Nodes',
    howItWorks: 'Places keys and 100–256 Virtual Nodes per server on a 0..2^32 ring; routes clockwise.',
    rangeQueries: 'Poor — range queries require Scatter-Gather unless combined with clustering keys.',
    rebalanceCost: 'Optimal — adding a node moves only ~1/(N+1) of keys from adjacent ring neighbors.',
    hotspotRisk: 'Balanced across hardware via vnodes; salt extreme single-key celebrities.',
    bestFor: 'Cassandra, DynamoDB, Redis Cluster, elastic horizontal scale-out.',
  },
];

export const STANDARD_DFD_BLUEPRINTS: Record<
  string,
  { level0Title: string; level0Ascii: string; level1Title: string; level1Ascii: string }
> = {
  'query-pipeline-dfd': {
    level0Title: 'Level-0 Context DFD (External Entities <-> Database Engine)',
    level0Ascii: `[App / API Clients] --(1. SQL + Bind Params)--> ( 0.0 RDBMS Engine ) --(4. Result Tuples)--> [App / API Clients]
                                                        |   ^
                                   (2. WAL Append)      |   | (3. 8KB Page Read/Write)
                                                        v   |
                                            [D1: Disk Storage / WAL / Catalog]`,
    level1Title: 'Level-1 Query Execution Pipeline DFD (Write & Read Path)',
    level1Ascii: `[Client] -> (1.0 PgBouncer Pool) -> (2.0 Parser/AST) -> (3.0 Analyzer + RLS)
                                                              |   ^
                                                              |   | Read Metadata
                                                              |  [D1: pg_catalog]
                                                              v
                                                     (4.0 CBO Optimizer) <-- [D2: pg_statistic]
                                                              | Physical Plan
                                                              v
                                                     (5.0 Volcano Executor)
                                                       /                \\
                                            [D3: RAM Buffer Pool]    [D4: Sequential WAL]
                                                     | Cache Miss Only
                                                     v
                                            [D5: NVMe Heap & B+ Tree Indexes]`,
  },
  'btree-index-visual': {
    level0Title: 'Level-0 Context DFD (B+ Tree Index Manager)',
    level0Ascii: `[Executor Search/Insert] --(Key / UUIDv7)--> ( 0.0 B+ Tree Index ) --(TID / INCLUDE Row)--> [Executor]
                                                      |
                                        (Page Read / Split / Append)
                                                      v
                                        [D1: 8KB Slotted Index Pages + VM]`,
    level1Title: 'Level-1 B+ Tree Traversal & Page Split DFD',
    level1Ascii: `[Lookup Key=412] -> (1.0 Root Page in RAM) --[200..599]--> (2.0 Internal Page L1)
                                                                    |
                                                                    v
                                                       (3.0 Leaf Page Binary Search)
                                                         /                    \\
                                            [D1: Visibility Map]     [Sibling Next-Leaf Chain]
                                            (All-Visible => 0 Heap)   (ORDER BY / Range Scan)`,
  },
  'lsm-tree-dfd': {
    level0Title: 'Level-0 Context DFD (LSM-Tree Storage Engine)',
    level0Ascii: `[Write Burst] --(Put/Delete)--> ( 0.0 LSM Storage Engine ) <--(Get Key)-- [Reader]
                                        |             ^
                           (Sequential Flush)     (Bloom Filter + SSTable Read)
                                        v             |
                              [D1: CommitLog + Immutable SSTables]`,
    level1Title: 'Level-1 LSM Write, Bloom Filter Read & Compaction DFD',
    level1Ascii: `[Write] --+--> [D1: CommitLog WAL (Sequential Disk)]
          |
          +--> (1.0 MemTable SkipList in RAM) --(64MB Full)--> [D2: L0 Immutable SSTables]
                                                                     |
[Read]  -----> (2.0 Bloom Filter Check) --(Maybe Present)------------+
                                                                     v
                                                        (3.0 K-Way Merge Compaction)
                                                                     | Purge Tombstones
                                                                     v
                                                        [D3: L1/L2 Clean SSTables]`,
  },
  'mvcc-aries-dfd': {
    level0Title: 'Level-0 Context DFD (MVCC + ARIES Recovery)',
    level0Ascii: `[Concurrent Tx A & B] --(Snapshot Read / Atomic Write)--> ( 0.0 Tx & Recovery Mgr )
                                                                 |            |
                                                          [D1: Heap Tuples] [D2: WAL + Checkpoint]`,
    level1Title: 'Level-1 MVCC Visibility & ARIES 3-Phase Crash Recovery DFD',
    level1Ascii: `[Reader Tx100] --> (1.0 Snapshot Check xmin<=100) --> [D1: Row v1 (xmin:80, xmax:101)]
[Writer Tx101] --> (2.0 WAL Append fsync) --> [D2: WAL LSN=501] --> [D1: Row v2 (xmin:101)]
                                                      |
                                         (On Power Failure Reboot)
                                                      v
                       (3.1 Analysis: DPT/ATT) -> (3.2 Redo History) -> (3.3 Undo Losers + CLRs)`,
  },
  'distributed-quorum-raft': {
    level0Title: 'Level-0 Context DFD (Distributed Sharded & Replicated Cluster)',
    level0Ascii: `[Clients] --(Read/Write Key)--> ( 0.0 Consistent Hash Router & Quorum Coordinator )
                                                |               |               |
                                           [Shard Node A]  [Shard Node B]  [Shard Node C]`,
    level1Title: 'Level-1 Consistent Hashing Ring & Raft / Quorum Replication DFD',
    level1Ascii: `[Key] -> (1.0 Hash Ring Lookup O(log V)) -> (2.0 Raft Leader / Coordinator)
                                                  /                 \\
                                      (AppendEntries W)         (AppendEntries W)
                                             v                         v
                                    [D1: Replica Node B]      [D2: Replica Node C]
                                             \\                         /
                                              +--> (3.0 Quorum Read R: W + R > N) --> [Fresh Value]`,
  },
  'rls-cdc-rag-dfd': {
    level0Title: 'Level-0 Context DFD (Multi-Tenant RLS + CDC Polyglot Sync)',
    level0Ascii: `[SaaS / AI API] --(SET LOCAL tenant + Commit)--> ( 0.0 Postgres + CDC Bus )
                                                           |      |      |
                                                      [Vector DB] [Redis] [Snowflake]`,
    level1Title: 'Level-1 RLS Policy Injection & Debezium Logical WAL CDC DFD',
    level1Ascii: `[API Tx] -> (1.0 SET LOCAL tenant_id) -> (2.0 Postgres Engine + RLS Guard)
                                                    | Single Atomic Commit
                                                    v
                                          [D1: Logical WAL (wal_level=logical)]
                                                    | Tail Replication Slot
                                                    v
                                          (3.0 Debezium -> Apache Kafka Topic)
                                            /            |            \\
                                           v             v             v
                                    [pgvector/RAG]  [Redis Evict]  [Snowflake OLAP]`,
  },
};
