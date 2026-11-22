export interface DbFlowPropagationStep {
  step: number;
  layer: string;
  nodeId: string;
  title: string;
  detail: string;
  latencyMs: number;
  cumulativeMs: number;
  artifact: string;
}

export interface DbQueryDataFlowScenario {
  id: string;
  commandLabel: string;
  category: 'OLTP Read' | 'ACID Write & CDC' | 'Vector ANN' | 'NoSQL LSM' | 'OLAP Columnar' | 'Crash Recovery';
  sqlOrCommand: string;
  summary: string;
  matchKeywords: string[];
  steps: DbFlowPropagationStep[];
  buildFlowchartMermaid: (activeStepIndex: number) => string;
  sequenceMermaid: string;
}

function activeStyle(nodeId: string, activeNodeId: string): string {
  return nodeId === activeNodeId
    ? `  style ${nodeId} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`
    : '';
}

export const DB_QUERY_DATA_FLOW_SCENARIOS: DbQueryDataFlowScenario[] = [
  {
    id: 'flow-oltp-read-cache-btree',
    commandLabel: 'SELECT ... Index-Only Read (Cache-Aside + B+Tree)',
    category: 'OLTP Read',
    sqlOrCommand: `SELECT id, total_cents, status
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;`,
    summary:
      'Traces a high-throughput OLTP read through Edge Gateway, Redis Cache-Aside, PgBouncer pool, System R Optimizer, Buffer Pool Clock-Sweep, and a Covering B+Tree Index-Only Scan.',
    matchKeywords: ['select', 'limit', 'order by', 'where', 'index'],
    steps: [
      {
        step: 1,
        layer: 'Client & Edge',
        nodeId: 'Edge',
        title: 'API Gateway Authenticates JWT & Checks Rate Limit',
        detail: 'Terminates TLS 1.3, validates user_id=42 claim, and forwards parameterized request to Order Service.',
        latencyMs: 2.1,
        cumulativeMs: 2.1,
        artifact: 'GET /v1/orders?limit=20 (JWT Verified)',
      },
      {
        step: 2,
        layer: 'Cache Layer',
        nodeId: 'Redis',
        title: 'Redis Cache-Aside Probe (Miss -> Fallback to DB)',
        detail: 'Checks `orders:u42:p1` in 0.8ms. On Cache Hit (85% traffic), returns immediately. On Miss, proceeds to DB Read Replica.',
        latencyMs: 0.8,
        cumulativeMs: 2.9,
        artifact: 'GET orders:u42:p1 -> (nil) CACHE MISS',
      },
      {
        step: 3,
        layer: 'Connection Pool',
        nodeId: 'Pool',
        title: 'PgBouncer Assigns Warm Transaction-Pooled Backend',
        detail: 'Multiplexes 5,000 app connections onto 40 warm PostgreSQL worker processes without fork overhead.',
        latencyMs: 0.4,
        cumulativeMs: 3.3,
        artifact: 'PgBouncer TX Slot #17 -> Backend PID 8412',
      },
      {
        step: 4,
        layer: 'Query Planner',
        nodeId: 'Planner',
        title: 'System R Cost Optimizer Picks Covering B+Tree Index-Only Scan',
        detail: 'Histograms show user_id=42 is highly selective (~0.01%). Chooses `idx_orders_user_created INCLUDE (total_cents, status)`.',
        latencyMs: 0.6,
        cumulativeMs: 3.9,
        artifact: 'Plan: Limit -> Index Only Scan (Cost 0.43..14.8)',
      },
      {
        step: 5,
        layer: 'Buffer Pool & Storage',
        nodeId: 'BTree',
        title: 'Clock-Sweep Buffer Pool Hit + Visibility Map Verification',
        detail: 'Traverses 3 hot B+Tree pages in RAM (`shared_buffers`), confirms all-visible bits in Visibility Map -> zero heap table fetches!',
        latencyMs: 1.5,
        cumulativeMs: 5.4,
        artifact: 'Buffers: shared hit=4 read=0 · 20 rows',
      },
      {
        step: 6,
        layer: 'Cache Hydration',
        nodeId: 'Hydrate',
        title: 'Hydrate Redis With TTL + Return JSON Payload',
        detail: 'Writes serialized 20 rows back to Redis (`SETEX 60s`) so the next 100 reads serve in < 2ms.',
        latencyMs: 0.9,
        cumulativeMs: 6.3,
        artifact: 'SETEX orders:u42:p1 60 -> HTTP 200 OK',
      },
    ],
    buildFlowchartMermaid: (activeIdx) => {
      const activeId =
        DB_QUERY_DATA_FLOW_SCENARIOS[0].steps[activeIdx]?.nodeId ?? 'Edge';
      return [
        'flowchart LR',
        '  Edge["1. API Gateway<br/>JWT + Rate Limit"] --> Redis["2. Redis Cache<br/>Cache-Aside Check"]',
        '  Redis -->|"Hit (85%, 1.2ms)"| Fast["Return 200 OK"]',
        '  Redis -->|"Miss (15%)"| Pool["3. PgBouncer<br/>TX Connection Pool"]',
        '  Pool --> Planner["4. Cost Optimizer<br/>System R Plan"]',
        '  Planner --> BTree[("5. Buffer Pool + B+Tree<br/>Index-Only Scan")]',
        '  BTree --> Hydrate["6. Hydrate Redis TTL<br/>Return 200 OK"]',
        activeStyle('Edge', activeId),
        activeStyle('Redis', activeId),
        activeStyle('Pool', activeId),
        activeStyle('Planner', activeId),
        activeStyle('BTree', activeId),
        activeStyle('Hydrate', activeId),
      ]
        .filter(Boolean)
        .join('\n');
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  participant C as Client / Gateway
  participant R as Redis Cache
  participant P as PgBouncer Pool
  participant PG as PostgreSQL (Planner + Buffer Pool)
  C->>R: GET orders:u42:p1
  alt Cache Hit (85%)
    R-->>C: 200 OK (1.2ms, Zero DB Load)
  else Cache Miss (15%)
    R-->>C: MISS
    C->>P: Parameterized SELECT ... LIMIT 20
    P->>PG: Dispatch on Warm Backend #17
    PG->>PG: System R -> Covering B+Tree (4 RAM Buffer Hits)
    PG-->>C: 20 Sorted Rows (2.1ms)
    C->>R: SETEX orders:u42:p1 TTL=60s
  end`,
  },
  {
    id: 'flow-acid-write-mvcc-wal-cdc',
    commandLabel: 'BEGIN; UPDATE ...; INSERT outbox; COMMIT (ACID + WAL + CDC)',
    category: 'ACID Write & CDC',
    sqlOrCommand: `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 101;
INSERT INTO outbox_events (topic, payload) VALUES ('ledger.debited', '{"id":101}');
COMMIT;`,
    summary:
      'Visualizes how a transactional write acquires Strict 2PL row locks, creates new MVCC tuple versions, fsyncs sequential WAL for ARIES durability, and propagates via Streaming Replication & Debezium CDC to Kafka.',
    matchKeywords: ['update', 'insert', 'delete', 'begin', 'commit', 'for update', 'outbox'],
    steps: [
      {
        step: 1,
        layer: 'Transaction & Locking',
        nodeId: 'Lock',
        title: 'Strict 2PL Acquires Exclusive Row Lock on Account 101',
        detail: 'Lock Manager verifies no conflicting active writer on row 101 and enters Growing Phase.',
        latencyMs: 0.7,
        cumulativeMs: 0.7,
        artifact: 'X-Lock acquired on accounts(id=101)',
      },
      {
        step: 2,
        layer: 'MVCC Heap & Buffer',
        nodeId: 'MVCC',
        title: 'Copy-on-Write MVCC Tuple in Shared Buffers (Dirty Page)',
        detail: 'Old tuple marked `xmax=9102`; new tuple written `(xmin=9102, bal=bal-500)` + Outbox row inserted in Buffer Pool.',
        latencyMs: 1.4,
        cumulativeMs: 2.1,
        artifact: 'Dirty Pages #412 & #889 (in RAM only)',
      },
      {
        step: 3,
        layer: 'Durability (WAL)',
        nodeId: 'WAL',
        title: 'WAL-First Sequential Append & NVMe fsync (ARIES LSN)',
        detail: 'Before `COMMIT` returns OK, WAL records (LSN 0/4A2018) are sequentially flushed to NVMe—guaranteeing crash durability!',
        latencyMs: 2.8,
        cumulativeMs: 4.9,
        artifact: 'WAL LSN 0/4A2018 fsynced -> X-Locks Released',
      },
      {
        step: 4,
        layer: 'High Availability',
        nodeId: 'Replica',
        title: 'Streaming WAL Ships to Standby & Read Replicas',
        detail: 'WAL Sender streams physical bytes to Standby Replicas in < 5ms for automatic failover and read scaling.',
        latencyMs: 3.5,
        cumulativeMs: 8.4,
        artifact: 'Standby Replay LSN 0/4A2018 (Lag < 4ms)',
      },
      {
        step: 5,
        layer: 'Event Propagation (CDC)',
        nodeId: 'CDC',
        title: 'Debezium Tails Logical WAL Slot -> Publishes to Kafka',
        detail: 'Reads committed `outbox_events` from WAL slot without polling the DB and emits `ledger.debited` reliably to downstream microservices.',
        latencyMs: 6.0,
        cumulativeMs: 14.4,
        artifact: 'Kafka Topic: ledger.debited (Offset #98112)',
      },
    ],
    buildFlowchartMermaid: (activeIdx) => {
      const activeId =
        DB_QUERY_DATA_FLOW_SCENARIOS[1].steps[activeIdx]?.nodeId ?? 'Lock';
      return [
        'flowchart LR',
        '  App["Service: BEGIN..COMMIT"] --> Lock["1. Lock Manager<br/>Strict 2PL Row X-Lock"]',
        '  Lock --> MVCC["2. Buffer Pool MVCC<br/>New Tuple + Outbox Row"]',
        '  MVCC --> WAL[("3. Sequential WAL<br/>fsync LSN (ARIES)")]',
        '  WAL -->|"Physical Stream"| Replica[("4. Hot Standby /<br/>Read Replicas")]',
        '  WAL -->|"Logical Replication"| CDC["5. Debezium CDC<br/>-> Kafka Event Bus"]',
        activeStyle('Lock', activeId),
        activeStyle('MVCC', activeId),
        activeStyle('WAL', activeId),
        activeStyle('Replica', activeId),
        activeStyle('CDC', activeId),
      ]
        .filter(Boolean)
        .join('\n');
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  participant App as Checkout Service
  participant LM as Lock Mgr & Buffer Pool
  participant WAL as Disk WAL (NVMe)
  participant Rep as Standby Replica
  participant CDC as Debezium -> Kafka
  App->>LM: BEGIN; UPDATE accounts + INSERT outbox
  LM->>LM: Acquire X-Lock + Write Dirty MVCC Pages
  App->>WAL: COMMIT -> Sequential fsync(LSN 0/4A2018)
  WAL-->>App: COMMIT OK (Durable! Locks Released)
  par Async Propagation
    WAL->>Rep: Physical WAL Stream (HA Failover)
    WAL->>CDC: Logical Outbox Decode -> Emit Kafka Event
  end`,
  },
  {
    id: 'flow-vector-rag-hnsw',
    commandLabel: 'SELECT ... ORDER BY embedding <=> $1 LIMIT 10 (Vector HNSW RAG)',
    category: 'Vector ANN',
    sqlOrCommand: `SET LOCAL hnsw.ef_search = 100;
SELECT id, title, 1 - (embedding <=> $1::halfvec(1536)) AS score
FROM knowledge_chunks
WHERE tenant_id = 'acme'
ORDER BY embedding <=> $1::halfvec(1536) LIMIT 10;`,
    summary:
      'Follows an AI RAG semantic query from raw user prompt through embedding inference, HNSW multi-layer graph descent, hybrid BM25 Reciprocal Rank Fusion, and top-K context retrieval.',
    matchKeywords: ['vector', 'embedding', 'hnsw', 'ivf', '<=>', 'rag', 'cosine'],
    steps: [
      {
        step: 1,
        layer: 'Embedding Inference',
        nodeId: 'Embed',
        title: 'Encode Prompt Into 1,536-Dim Normalized Vector',
        detail: 'Embedding model converts query text into float16 (`halfvec`) vector representation.',
        latencyMs: 18.0,
        cumulativeMs: 18.0,
        artifact: 'v = [0.021, -0.084, ..., 0.119] (halfvec 3 KB)',
      },
      {
        step: 2,
        layer: 'HNSW Upper Layers',
        nodeId: 'HNSWTop',
        title: 'Greedy Express Leap Across Sparse Layers 2 -> 1',
        detail: 'Navigates long-range proximity edges to jump directly into the target semantic cluster in < 1ms.',
        latencyMs: 0.8,
        cumulativeMs: 18.8,
        artifact: '9 nodes inspected across Layers 2 & 1',
      },
      {
        step: 3,
        layer: 'HNSW Layer 0 Beam',
        nodeId: 'HNSWBase',
        title: 'Layer 0 Beam Search (`ef_search=100`) + Tenant Filter',
        detail: 'Expands local neighborhood using SIMD cosine distance with iterative scan ensuring 10 matching `acme` chunks.',
        latencyMs: 2.9,
        cumulativeMs: 21.7,
        artifact: 'Top-20 ANN candidates (98.4% Recall)',
      },
      {
        step: 4,
        layer: 'Hybrid Re-Ranking',
        nodeId: 'RRF',
        title: 'Reciprocal Rank Fusion (Vector + BM25) & Return Top-10',
        detail: 'Combines semantic vector ranks with exact keyword BM25 ranks so exact SKU/error codes never get missed.',
        latencyMs: 1.5,
        cumulativeMs: 23.2,
        artifact: 'Top-10 Grounded Chunks -> Prompt Context',
      },
    ],
    buildFlowchartMermaid: (activeIdx) => {
      const activeId =
        DB_QUERY_DATA_FLOW_SCENARIOS[2].steps[activeIdx]?.nodeId ?? 'Embed';
      return [
        'flowchart LR',
        '  Q["User Prompt"] --> Embed["1. Embedding Model<br/>1536-dim halfvec"]',
        '  Embed --> HNSWTop["2. HNSW Layers 2->1<br/>Sparse Express Leap"]',
        '  HNSWTop --> HNSWBase[("3. HNSW Layer 0 Beam<br/>ef_search=100 + Filter")]',
        '  HNSWBase --> RRF["4. Hybrid RRF Re-Rank<br/>(Cosine + BM25 -> Top-10)"]',
        activeStyle('Embed', activeId),
        activeStyle('HNSWTop', activeId),
        activeStyle('HNSWBase', activeId),
        activeStyle('RRF', activeId),
      ]
        .filter(Boolean)
        .join('\n');
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  participant U as RAG API
  participant M as Embedding Model
  participant V as pgvector / Vector DB
  U->>M: Encode User Query Text
  M-->>U: 1536-dim halfvec Embedding (18ms)
  U->>V: ORDER BY embedding <=> $1 LIMIT 10
  V->>V: HNSW Layer 2->1->0 Beam Search (ef_search=100)
  V->>V: Apply Tenant Filter + BM25 Hybrid RRF
  V-->>U: Top-10 Relevant Chunks (3.7ms)`,
  },
  {
    id: 'flow-nosql-lsm-write-read',
    commandLabel: 'PUT / GET Partition Key (Consistent Hash + LSM-Tree + Bloom Filter)',
    category: 'NoSQL LSM',
    sqlOrCommand: `PUT table=Events PK="USER#42" SK="TS#2026-05-01T10:00Z" (Consistency: QUORUM W=2/3)
GET table=Events PK="USER#42" SK="TS#2026-05-01T10:00Z" (Consistency: QUORUM R=2/3)`,
    summary:
      'Traces distributed NoSQL routing through a Consistent Hashing Ring, Quorum replication (`R + W > N`), MemTable + CommitLog append, and Bloom-Filter accelerated SSTable compaction.',
    matchKeywords: ['put', 'get', 'nosql', 'lsm', 'cassandra', 'dynamo', 'quorum', 'bloom'],
    steps: [
      {
        step: 1,
        layer: 'Shard Routing',
        nodeId: 'Ring',
        title: 'Consistent Hash Ring Maps PK="USER#42" to 3 Replica Nodes',
        detail: 'Murmur3 hash jumps clockwise on VNode ring to select Primary Shard B and Replicas C & A across 3 AZs.',
        latencyMs: 0.5,
        cumulativeMs: 0.5,
        artifact: 'Token #110° -> Replicas [Node-B, Node-C, Node-A]',
      },
      {
        step: 2,
        layer: 'Quorum Write',
        nodeId: 'Quorum',
        title: 'Coordinator Fan-Out Waits for W=2 Majority ACKs',
        detail: 'With N=3, W=2, R=2 (`2 + 2 > 3`), every subsequent quorum read is guaranteed to see the latest write.',
        latencyMs: 2.2,
        cumulativeMs: 2.7,
        artifact: 'ACKs received: Node-B + Node-C (2/3 Quorum)',
      },
      {
        step: 3,
        layer: 'LSM Write Path',
        nodeId: 'Mem',
        title: 'Sequential CommitLog Append + RAM SkipList MemTable',
        detail: 'Zero random disk seeks! Writes land sequentially in CommitLog and sorted in RAM MemTable until 64 MB flush.',
        latencyMs: 0.3,
        cumulativeMs: 3.0,
        artifact: 'MemTable 51/64 MB · CommitLog synced',
      },
      {
        step: 4,
        layer: 'SSTable & Bloom Filter',
        nodeId: 'SST',
        title: 'Background Leveled Compaction & Bloom-Filtered Reads',
        detail: 'Immutable L0 SSTables merge into non-overlapping L1/L2 runs; per-SSTable Bloom Filters skip 99% of disk files on reads.',
        latencyMs: 1.1,
        cumulativeMs: 4.1,
        artifact: 'Bloom Filter skipped 11/12 SSTables -> 1.1ms Read',
      },
    ],
    buildFlowchartMermaid: (activeIdx) => {
      const activeId =
        DB_QUERY_DATA_FLOW_SCENARIOS[3].steps[activeIdx]?.nodeId ?? 'Ring';
      return [
        'flowchart LR',
        '  Client["App SDK"] --> Ring["1. Consistent Hash Ring<br/>VNode Shard Lookup"]',
        '  Ring --> Quorum{"2. Coordinator<br/>Quorum W=2 / R=2 (N=3)"}',
        '  Quorum --> Mem["3. CommitLog WAL +<br/>RAM MemTable SkipList"]',
        '  Mem -->|"Flush + Compact"| SST[("4. L0->L2 SSTables +<br/>Per-File Bloom Filters")]',
        activeStyle('Ring', activeId),
        activeStyle('Quorum', activeId),
        activeStyle('Mem', activeId),
        activeStyle('SST', activeId),
      ]
        .filter(Boolean)
        .join('\n');
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  participant C as App Client
  participant Coord as Hash Ring Coordinator
  participant N1 as Shard B (AZ-1)
  participant N2 as Shard C (AZ-2)
  C->>Coord: PUT PK="USER#42" (QUORUM)
  par Replicate to 3 AZs
    Coord->>N1: Append WAL + MemTable
    Coord->>N2: Append WAL + MemTable
  end
  N1-->>Coord: ACK (0.8ms)
  N2-->>Coord: ACK (1.9ms) -> Quorum 2/3 Reached!
  Coord-->>C: 200 OK (Strong Quorum Durability)`,
  },
  {
    id: 'flow-olap-columnar-scan',
    commandLabel: 'SELECT region, SUM(revenue) ... GROUP BY (OLAP Columnar Engine)',
    category: 'OLAP Columnar',
    sqlOrCommand: `SELECT region, SUM(revenue_cents) AS total_rev
FROM fact_orders_parquet
WHERE event_date BETWEEN '2026-04-01' AND '2026-04-30'
GROUP BY region;`,
    summary:
      'Demonstrates why OLAP engines (BigQuery, ClickHouse, Snowflake, DuckDB) scan 500M rows in < 1 second via partition pruning, Parquet Zone Maps, columnar projection, and SIMD vectorized execution.',
    matchKeywords: ['group by', 'sum', 'olap', 'analytics', 'parquet', 'bigquery', 'clickhouse'],
    steps: [
      {
        step: 1,
        layer: 'Partition & Zone Pruning',
        nodeId: 'Prune',
        title: 'Metadata Catalog Prunes 92% of Parquet Files Before Reading',
        detail: 'Uses `event_date` partition directories + Parquet Min/Max Zone Maps to skip all non-April row groups.',
        latencyMs: 12.0,
        cumulativeMs: 12.0,
        artifact: 'Scanned 24 of 365 daily partitions (93% pruned)',
      },
      {
        step: 2,
        layer: 'Columnar Projection',
        nodeId: 'Col',
        title: 'Read ONLY 2 Compressed Columns Out of 48 Table Columns',
        detail: 'Streams only `region` (Dictionary Encoded) and `revenue_cents` (Delta + ZSTD) from Object Storage.',
        latencyMs: 85.0,
        cumulativeMs: 97.0,
        artifact: 'Read 140 MB instead of 4.8 GB (97% I/O saved)',
      },
      {
        step: 3,
        layer: 'Vectorized SIMD Exec',
        nodeId: 'SIMD',
        title: 'CPU AVX2 Vectorized Batch Processing (4,096 Values/Batch)',
        detail: 'Processes contiguous column arrays inside L1/L2 CPU cache without row-by-row Volcano virtual call overhead.',
        latencyMs: 42.0,
        cumulativeMs: 139.0,
        artifact: '420M rows/sec/core sustained scan',
      },
      {
        step: 4,
        layer: 'Parallel Hash Aggregate',
        nodeId: 'Agg',
        title: 'Worker Partial Sums -> Coordinator Final Merge',
        detail: 'Each worker builds a tiny local hash table per region, then sends 5 summary rows to the coordinator.',
        latencyMs: 14.0,
        cumulativeMs: 153.0,
        artifact: '5 region totals returned in 153 ms',
      },
    ],
    buildFlowchartMermaid: (activeIdx) => {
      const activeId =
        DB_QUERY_DATA_FLOW_SCENARIOS[4].steps[activeIdx]?.nodeId ?? 'Prune';
      return [
        'flowchart LR',
        '  BI["Analytics Query"] --> Prune["1. Partition & Zone Map<br/>Prune 93% Row Groups"]',
        '  Prune --> Col[("2. Columnar Object Store<br/>Read Only 2/48 Columns")]',
        '  Col --> SIMD["3. Vectorized SIMD Engine<br/>4096-Val Batches in L1 Cache"]',
        '  SIMD --> Agg["4. Parallel Partial Hash Agg<br/>-> Final 5-Row Summary"]',
        activeStyle('Prune', activeId),
        activeStyle('Col', activeId),
        activeStyle('SIMD', activeId),
        activeStyle('Agg', activeId),
      ]
        .filter(Boolean)
        .join('\n');
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  participant BI as BI / SQL Client
  participant Plan as Distributed OLAP Planner
  participant S3 as Parquet / Columnar Storage
  participant W as Vectorized Workers (SIMD)
  BI->>Plan: SELECT region, SUM(rev) WHERE date IN April
  Plan->>S3: Prune via Partition + Zone Maps (93% skipped)
  S3-->>W: Stream ONLY 2 compressed columns (140 MB)
  W->>W: AVX2 Vectorized Partial Hash Aggregation
  W-->>Plan: 5 Partial Sums per Worker
  Plan-->>BI: Final Aggregated Table (153ms)`,
  },
  {
    id: 'flow-aries-crash-recovery',
    commandLabel: 'CRASH RESTART -> ARIES Recovery (Analysis -> Redo -> Undo + CLR)',
    category: 'Crash Recovery',
    sqlOrCommand: `-- Triggered automatically on DB restart after power loss / OOMKill:
-- WAL Checkpoint LSN: 0/400000 | Crash LSN: 0/500000
-- Recovers ALL committed transactions & reverts uncommitted dirty pages`,
    summary:
      'Illustrates the 3-phase ARIES recovery propagation from disk WAL back into Buffer Pool and Data Pages, ensuring strict Atomicity and Durability even after sudden crashes.',
    matchKeywords: ['crash', 'aries', 'wal', 'recovery', 'checkpoint', 'pitr', 'vacuum'],
    steps: [
      {
        step: 1,
        layer: 'Checkpoint Anchor',
        nodeId: 'Ckpt',
        title: 'Read Master Record -> Jump to Last Fuzzy Checkpoint LSN',
        detail: 'Locates last known consistent checkpoint (`0/400000`) so recovery never scans the entire WAL history.',
        latencyMs: 5.0,
        cumulativeMs: 5.0,
        artifact: 'Anchor: Checkpoint LSN 0/400000',
      },
      {
        step: 2,
        layer: 'Phase 1: Analysis',
        nodeId: 'Analysis',
        title: 'Scan WAL Forward -> Rebuild Active Tx & Dirty Page Tables',
        detail: 'Identifies committed Winners (Tx1) vs uncommitted Losers (Tx2) and earliest dirty `recLSN`.',
        latencyMs: 35.0,
        cumulativeMs: 40.0,
        artifact: 'Winners=[Tx1] · Losers=[Tx2] · Min recLSN=0/420000',
      },
      {
        step: 3,
        layer: 'Phase 2: Redo',
        nodeId: 'Redo',
        title: 'Repeat History Forward Where `pageLSN < record.LSN`',
        detail: 'Restores every committed page lost when RAM Buffer Pool vanished on power loss (idempotent!).',
        latencyMs: 90.0,
        cumulativeMs: 130.0,
        artifact: 'Tx1 durability 100% restored on disk',
      },
      {
        step: 4,
        layer: 'Phase 3: Undo + CLR',
        nodeId: 'Undo',
        title: 'Walk Loser prevLSN Backward & Log Compensation Records (CLR)',
        detail: 'Reverts uncommitted dirty pages stolen to disk before crash and logs CLRs so even a second crash stays safe.',
        latencyMs: 25.0,
        cumulativeMs: 155.0,
        artifact: 'Tx2 rolled back · Database Ready for Connections',
      },
    ],
    buildFlowchartMermaid: (activeIdx) => {
      const activeId =
        DB_QUERY_DATA_FLOW_SCENARIOS[5].steps[activeIdx]?.nodeId ?? 'Ckpt';
      return [
        'flowchart LR',
        '  Ckpt["1. Master Record<br/>Last Checkpoint LSN"] --> Analysis["2. ARIES Analysis<br/>Rebuild ATT & DPT"]',
        '  Analysis --> Redo[("3. ARIES Redo<br/>Repeat History (pageLSN < LSN)")]',
        '  Redo --> Undo["4. ARIES Undo + CLR<br/>Rollback Uncommitted Losers"]',
        '  Undo --> Ready["DB Online & ACID Consistent"]',
        activeStyle('Ckpt', activeId),
        activeStyle('Analysis', activeId),
        activeStyle('Redo', activeId),
        activeStyle('Undo', activeId),
      ]
        .filter(Boolean)
        .join('\n');
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  participant Boot as DB Startup Engine
  participant WAL as Sequential WAL Disk
  participant Pages as Data Pages (8KB)
  Boot->>WAL: Read Last Checkpoint Anchor
  Boot->>WAL: Phase 1 Analysis (Build ATT + DPT)
  Boot->>Pages: Phase 2 Redo (Reapply where pageLSN < WAL LSN)
  Boot->>Pages: Phase 3 Undo Losers + Write CLRs to WAL
  Boot-->>Boot: Accept Client Connections (100% ACID)`,
  },
];

export function matchScenarioForCustomSql(input: string): DbQueryDataFlowScenario {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return DB_QUERY_DATA_FLOW_SCENARIOS[0];
  for (const sc of DB_QUERY_DATA_FLOW_SCENARIOS) {
    if (sc.matchKeywords.some((kw) => normalized.includes(kw))) {
      return sc;
    }
  }
  return DB_QUERY_DATA_FLOW_SCENARIOS[0];
}
