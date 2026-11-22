export type DbAlgoDomain =
  | 'Storage & Indexing'
  | 'Query & Joins'
  | 'Concurrency & Isolation'
  | 'Recovery & Durability'
  | 'Distributed & Sharding'
  | 'Vector & AI Indexing';

export interface DbAlgoVisualBlock {
  id: string;
  label: string;
  sublabel: string;
  state: 'idle' | 'active' | 'highlight' | 'warn';
}

export interface DbAlgoAnimationStep {
  step: number;
  phase: string;
  title: string;
  explanation: string;
  blocks: DbAlgoVisualBlock[];
  metrics: { label: string; value: string }[];
}

export interface DbNamedAlgorithmSpec {
  id: string;
  number: number;
  domain: DbAlgoDomain;
  name: string;
  shortName: string;
  inventorsOrPaper: string;
  usedBy: string[];
  plainEnglish: string;
  formalDefinition: string;
  complexity: {
    time: string;
    space: string;
    diskIo: string;
    guarantees: string;
  };
  useCases: string[];
  whenNotToUse: string[];
  workedExample: string;
  sqlOrConfigTitle: string;
  sqlOrConfig: string;
  animationTitle: string;
  animationSteps: DbAlgoAnimationStep[];
  mermaidDiagram: string;
  completenessNotes: string;
}

export const DB_COMPLETENESS_AUDIT_DOMAINS: {
  domain: DbAlgoDomain;
  algorithmsCount: number;
  coverageScope: string;
}[] = [
  {
    domain: 'Storage & Indexing',
    algorithmsCount: 5,
    coverageScope: 'B+Tree, LSM-Tree Compaction, Bloom Filter, Extendible/Linear Hashing, Buffer Pool Clock-Sweep/LRU-K',
  },
  {
    domain: 'Query & Joins',
    algorithmsCount: 4,
    coverageScope: 'System R & Cascades Optimizer, Grace Hash Join, Sort-Merge & External K-Way Merge, Index Nested Loop Join',
  },
  {
    domain: 'Concurrency & Isolation',
    algorithmsCount: 4,
    coverageScope: 'MVCC Snapshot Isolation, Strict 2PL + Wound-Wait/Wait-For, Serializable Snapshot Isolation (SSI), Kung-Robinson OCC',
  },
  {
    domain: 'Recovery & Durability',
    algorithmsCount: 1,
    coverageScope: 'ARIES Steal/No-Force Crash Recovery (Analysis, Redo, Undo, CLRs, Checkpointing, WAL LSNs)',
  },
  {
    domain: 'Distributed & Sharding',
    algorithmsCount: 3,
    coverageScope: 'Raft / Multi-Paxos Consensus, Two-Phase Commit (2PC) vs Outbox/Saga, Consistent Hashing with Virtual Nodes',
  },
  {
    domain: 'Vector & AI Indexing',
    algorithmsCount: 1,
    coverageScope: 'HNSW Hierarchical Small World Graph + IVF-PQ Quantized ANN Search',
  },
];

export const DB_NAMED_ALGORITHMS: DbNamedAlgorithmSpec[] = [
  /* ===================== 1. STORAGE & INDEXING ===================== */
  {
    id: 'algo-bplustree',
    number: 1,
    domain: 'Storage & Indexing',
    name: 'B+Tree Balanced Multi-Way Index (Bayer-McCreight)',
    shortName: 'B+Tree Index',
    inventorsOrPaper: 'Rudolf Bayer & Edward McCreight (1972)',
    usedBy: ['PostgreSQL', 'MySQL InnoDB', 'Oracle', 'SQLite', 'SQL Server'],
    plainEnglish:
      'A short, wide, always-balanced tree designed around 8 KB–16 KB disk pages. Internal nodes store only routing separator keys (so hundreds of keys fit in one page), while ALL actual row pointers sit in the bottom leaf pages linked side-to-side for ultra-fast range scans.',
    formalDefinition:
      'An m-ary balanced search tree of height h = O(log_B N) where every leaf resides at equal depth, internal nodes maintain between ceil(B/2) and B child pointers, and leaf nodes form a doubly linked sequential list supporting O(log_B N + K) range predicates.',
    complexity: {
      time: 'Lookup/Insert/Delete: O(log_B N)',
      space: 'O(N) (~1.3x due to ~69% average page fill)',
      diskIo: '3–4 page reads for 100M rows (root + internal pinned in RAM)',
      guarantees: 'Sorted order, logarithmic worst-case latency, fast BETWEEN/ORDER BY',
    },
    useCases: [
      'Primary keys and foreign-key lookups in OLTP relational databases.',
      'Range queries (`WHERE created_at BETWEEN ...`), prefix `LIKE "abc%"`, and sorted pagination (`ORDER BY id`).',
      'Covering indexes (`INCLUDE`) enabling Index-Only Scans without touching heap pages.',
    ],
    whenNotToUse: [
      'Extreme write-heavy append streams (millions of random UUIDv4 inserts/sec cause random 8KB page splits -> use UUIDv7 or LSM-Tree).',
      'High-dimensional vector similarity search (curse of dimensionality -> use HNSW/IVF).',
    ],
    workedExample:
      'With 8 KB pages and 16-byte key+pointer entries, branching factor B ≈ 500. Level 1 (Root): 1 page -> Level 2: 500 pages -> Level 3: 250,000 pages -> Level 4 (Leaves): 125,000,000 keys! Only 4 hops (often 1 disk read since top 3 levels stay hot in Buffer Pool).',
    sqlOrConfigTitle: 'PostgreSQL Covering B+Tree Index & Keyset Pagination',
    sqlOrConfig: `-- Covering B+Tree avoids Heap Fetch (Index-Only Scan)
CREATE INDEX CONCURRENTLY idx_orders_user_created
  ON orders (user_id, created_at DESC)
  INCLUDE (total_cents, status);

-- Use monotonic UUIDv7 or BIGINT (never random UUIDv4) to prevent 50% page split fragmentation
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total_cents, status
FROM orders
WHERE user_id = 402 AND created_at < '2026-05-01'
ORDER BY created_at DESC LIMIT 20;`,
    animationTitle: 'Step-by-Step: B+Tree Point Lookup + Sibling Leaf Range Scan',
    animationSteps: [
      {
        step: 1,
        phase: 'Root Probe',
        title: '1. Binary Search Root Page (Pinned in RAM)',
        explanation: 'Query seeks keys [42..55]. Root page holds separators [30 | 60]. Since 30 <= 42 < 60, follow middle child pointer.',
        blocks: [
          { id: 'r', label: 'Root Page [30 | 60]', sublabel: 'RAM Buffer Hit (0 I/O)', state: 'active' },
          { id: 'i1', label: 'Internal [10|20]', sublabel: 'Skipped', state: 'idle' },
          { id: 'i2', label: 'Internal [40|50]', sublabel: 'Next Pointer ->', state: 'highlight' },
          { id: 'l1', label: 'Leaf [40..49]', sublabel: 'Sibling ->', state: 'idle' },
          { id: 'l2', label: 'Leaf [50..59]', sublabel: 'Sibling ->', state: 'idle' },
        ],
        metrics: [
          { label: 'Tree Depth', value: '3 Levels' },
          { label: 'Disk I/O', value: '0 (Root Hot)' },
        ],
      },
      {
        step: 2,
        phase: 'Internal Routing',
        title: '2. Descend Internal Node [40 | 50]',
        explanation: 'Binary search inside Internal Page finds 40 <= 42 < 50 -> descends directly to Leaf Page [40..49].',
        blocks: [
          { id: 'r', label: 'Root Page [30 | 60]', sublabel: 'Visited', state: 'idle' },
          { id: 'i1', label: 'Internal [10|20]', sublabel: 'Skipped', state: 'idle' },
          { id: 'i2', label: 'Internal [40|50]', sublabel: 'Binary Search O(log B)', state: 'active' },
          { id: 'l1', label: 'Leaf [40..49]', sublabel: 'Target Leaf ->', state: 'highlight' },
          { id: 'l2', label: 'Leaf [50..59]', sublabel: 'Next Sibling', state: 'idle' },
        ],
        metrics: [
          { label: 'Keys Checked', value: '~9 comparisons' },
          { label: 'Disk I/O', value: '0–1 page' },
        ],
      },
      {
        step: 3,
        phase: 'Leaf Scan',
        title: '3. Hit Leaf [40..49] & Follow Horizontal Sibling Pointer',
        explanation: 'Emit rows 42..49 from Leaf 1, then jump directly via the doubly-linked leaf pointer to Leaf [50..59] to emit 50..55—without re-traversing the root!',
        blocks: [
          { id: 'r', label: 'Root Page [30 | 60]', sublabel: 'Not Re-Visited', state: 'idle' },
          { id: 'i2', label: 'Internal [40|50]', sublabel: 'Not Re-Visited', state: 'idle' },
          { id: 'l1', label: 'Leaf [40..49]', sublabel: 'Emit 42..49', state: 'active' },
          { id: 'l2', label: 'Leaf [50..59]', sublabel: 'Linked Sibling -> 50..55', state: 'highlight' },
        ],
        metrics: [
          { label: 'Rows Emitted', value: '14 rows sorted' },
          { label: 'Total Cost', value: 'O(log_B N + K)' },
        ],
      },
      {
        step: 4,
        phase: 'Page Split',
        title: '4. Write Path: Leaf Overflow & Balanced Split',
        explanation: 'When inserting into a full leaf page, the engine allocates a new sibling page, moves the upper 50% keys, and promotes the median separator upward to keep height perfectly balanced.',
        blocks: [
          { id: 'r', label: 'Root [30 | 45 | 60]', sublabel: 'Promoted Key 45', state: 'highlight' },
          { id: 'l1', label: 'Leaf Left [40..44]', sublabel: '50% Full', state: 'active' },
          { id: 'l2', label: 'Leaf Right [45..49]', sublabel: 'New Split Page', state: 'warn' },
        ],
        metrics: [
          { label: 'Balance', value: '100% Equal Depth' },
          { label: 'WAL Logged', value: 'Full-Page Write' },
        ],
      },
    ],
    mermaidDiagram: `flowchart TD
  Q["SQL Query: WHERE id BETWEEN 42 AND 55"] --> Root["Root Page (Pinned in Buffer Pool)<br/>Keys: 30 | 60"]
  Root -->|"< 30"| IntL["Internal [10 | 20]"]
  Root -->|"30..59"| IntM["Internal [40 | 50]"]
  Root -->|">= 60"| IntR["Internal [70 | 85]"]
  IntM --> Leaf1["Leaf [40..49] + Tuple Pointers"]
  IntM --> Leaf2["Leaf [50..59] + Tuple Pointers"]
  Leaf1 <-->|"Sibling Pointer (Fast Range Scan)"| Leaf2
  Leaf1 -.->|"Heap Fetch (Skipped if Covering Index)"| Heap[("Table Heap Pages (8KB)")]`,
    completenessNotes:
      'Audit Note: Always verify index selectivity, leftmost composite prefix order (Equality columns -> Range column -> Sort column), and periodic bloat monitoring (`pgstatindex` / `REINDEX CONCURRENTLY`).',
  },
  {
    id: 'algo-lsm-tree',
    number: 2,
    domain: 'Storage & Indexing',
    name: 'LSM-Tree (Log-Structured Merge-Tree) & Leveled Compaction',
    shortName: 'LSM-Tree & Compaction',
    inventorsOrPaper: 'Patrick O’Neil, Edward Cheng, Dieter Gawlick, Elizabeth O’Neil (1996)',
    usedBy: ['RocksDB', 'Apache Cassandra', 'ScyllaDB', 'CockroachDB (Pebble)', 'TiKV', 'LevelDB'],
    plainEnglish:
      'Instead of doing slow random disk writes to update B+Tree pages in place, an LSM-Tree converts ALL writes into fast sequential appends: write to an append-only WAL + sorted in-memory MemTable, then flush immutable sorted SSTable files to disk and merge them asynchronously via Compaction.',
    formalDefinition:
      'A multi-level write-optimized storage architecture maintaining an in-memory sorted MemTable (SkipList/RB-Tree) backed by a WAL, flushing into immutable disk-resident Sorted String Tables (SSTables) across levels L0..Lk merged via Size-Tiered (STCS) or Leveled (LCS) compaction.',
    complexity: {
      time: 'Write: O(log M) RAM + O(1) seq WAL · Point Read: O(L * log N) accelerated by Bloom Filters',
      space: '1.1x (Leveled) to 2x (Size-Tiered) space amplification',
      diskIo: 'Sequential write throughput (10x–50x faster than random B+Tree writes)',
      guarantees: 'Sustained high ingest rate; tunable Read vs Write vs Space amplification (RUM conjecture)',
    },
    useCases: [
      'High-ingest IoT telemetry, messaging apps (Discord/WhatsApp), time-series metrics, and distributed KV stores.',
      'Workloads with heavy random writes and deletes (deletes append lightweight Tombstone markers).',
    ],
    whenNotToUse: [
      'Predictable ultra-low tail latency read-mostly OLTP where compaction I/O spikes hurt p99 without careful throttling.',
      'Small datasets fitting comfortably in memory with complex ad-hoc relational joins.',
    ],
    workedExample:
      'Write key="u99", val="v2": (1) Append to WAL (0.05ms seq I/O), (2) Insert into SkipList MemTable (0.01ms). When MemTable hits 64 MB -> freeze & flush as immutable L0 SSTable. Background Leveled Compaction merges L0 into non-overlapping L1..L3 runs, discarding shadowed "v1" and expired tombstones.',
    sqlOrConfigTitle: 'RocksDB / Pebble Leveled Compaction & Bloom Filter Tuning',
    sqlOrConfig: `# Production LSM-Tree (RocksDB / CockroachDB) Tuning Profile
write_buffer_size = 64MB             # MemTable flush threshold
max_write_buffer_number = 4          # Allow concurrent flushes before write stall
level0_file_num_compaction_trigger = 4
compaction_style = kCompactionStyleLevel  # Lower read/space amplification
bloom_bits_per_key = 10              # ~1% false-positive rate (skips 99% SSTables)
compression_per_level = [none, none, lz4, zstd, zstd]`,
    animationTitle: 'Step-by-Step: LSM Write Path -> MemTable Flush -> Leveled Compaction',
    animationSteps: [
      {
        step: 1,
        phase: 'Sequential Ingest',
        title: '1. Append WAL + Insert Sorted MemTable',
        explanation: 'Write k="ord:42" appends sequentially to disk WAL for crash durability and inserts into RAM SkipList MemTable—zero random disk seeks!',
        blocks: [
          { id: 'wal', label: 'Disk WAL (Seq Append)', sublabel: 'fsync durable', state: 'highlight' },
          { id: 'mem', label: 'Active MemTable (RAM)', sublabel: '48/64 MB SkipList', state: 'active' },
          { id: 'l0', label: 'L0 SSTables', sublabel: '3 immutable files', state: 'idle' },
          { id: 'l1', label: 'L1 Sorted Runs', sublabel: 'Non-overlapping', state: 'idle' },
        ],
        metrics: [
          { label: 'Write Latency', value: '0.08 ms' },
          { label: 'Disk Pattern', value: '100% Sequential' },
        ],
      },
      {
        step: 2,
        phase: 'Flush',
        title: '2. MemTable Full (64 MB) -> Flush Immutable L0 SSTable',
        explanation: 'Active MemTable freezes, a fresh empty MemTable takes new writes, and a background thread writes the frozen sorted keys + Bloom filter to an immutable L0 SSTable.',
        blocks: [
          { id: 'wal', label: 'New WAL Segment', sublabel: 'Rotated', state: 'idle' },
          { id: 'mem', label: 'Immutable MemTable', sublabel: 'Flushing 64 MB ->', state: 'active' },
          { id: 'l0', label: 'L0 SSTable #4', sublabel: 'Created + Bloom Filter', state: 'highlight' },
          { id: 'l1', label: 'L1 Sorted Runs', sublabel: 'Awaiting merge', state: 'idle' },
        ],
        metrics: [
          { label: 'L0 File Count', value: '4 (Triggers Compact)' },
          { label: 'Write Stall', value: 'None' },
        ],
      },
      {
        step: 3,
        phase: 'Compaction',
        title: '3. Leveled Compaction: Merge Sort & Purge Tombstones',
        explanation: 'Background K-way merge combines overlapping L0 + L1 SSTables, keeps only the newest value per key, drops obsolete tombstones, and writes clean non-overlapping L1 files.',
        blocks: [
          { id: 'l0', label: 'L0 Overlapping Files', sublabel: 'Merged & Deleted', state: 'warn' },
          { id: 'merge', label: 'K-Way Merge Sort', sublabel: 'Dedup + GC Tombstones', state: 'active' },
          { id: 'l1', label: 'L1 Clean SSTables', sublabel: 'Disjoint Key Ranges', state: 'highlight' },
        ],
        metrics: [
          { label: 'Space Reclaimed', value: '38% bloat removed' },
          { label: 'Read Amp', value: 'Reduced 4x -> 1x' },
        ],
      },
      {
        step: 4,
        phase: 'Read Path',
        title: '4. Point Read Uses Bloom Filters to Skip Unrelated SSTables',
        explanation: 'Reader checks MemTable -> L0 -> L1. Per-SSTable Bloom Filters eliminate 99% of disk lookups instantly in RAM before touching disk.',
        blocks: [
          { id: 'mem', label: 'MemTable', sublabel: 'Miss', state: 'idle' },
          { id: 'bf', label: 'Bloom Filters (RAM)', sublabel: 'Skipped 3/4 SSTables', state: 'highlight' },
          { id: 'l1', label: 'L1 Target Block', sublabel: 'Binary Search -> Found!', state: 'active' },
        ],
        metrics: [
          { label: 'SSTables Read', value: '1 of 12' },
          { label: 'False Negatives', value: '0% (Guaranteed)' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  W["Client Write / Delete"] --> WAL[("Append-Only WAL<br/>(Crash Safety)")]
  W --> Mem["MemTable (RAM SkipList)"]
  Mem -->|"Flush @ 64MB"| L0["L0 Immutable SSTables<br/>(May Overlap)"]
  L0 -->|"Leveled Compaction<br/>(K-Way Merge + Purge Tombstones)"| L1["L1 Non-Overlapping SSTables (10x)"]
  L1 -->|"Compaction"| L2["L2 Non-Overlapping SSTables (100x)"]
  R["Point Read"] --> Mem
  R --> BF{"Per-SSTable Bloom Filter"}
  BF -->|"Definitely Absent (99%)"| Skip["Skip Disk Read"]
  BF -->|"Possibly Present"| L1`,
    completenessNotes:
      'Audit Note: Watch for Write Stalls (when L0 file count exceeds compaction speed) and Tombstone storms during range scans over heavily deleted partitions in Cassandra/RocksDB.',
  },
  {
    id: 'algo-bloom-filter',
    number: 3,
    domain: 'Storage & Indexing',
    name: 'Bloom Filter (Burton Howard Bloom) & Cuckoo/Quotient Filters',
    shortName: 'Bloom Filter',
    inventorsOrPaper: 'Burton Howard Bloom (1970)',
    usedBy: ['RocksDB', 'Cassandra', 'PostgreSQL (bloom ext)', 'Bigtable', 'ClickHouse', 'Parquet'],
    plainEnglish:
      'A tiny bit-array bouncer standing in front of slow disk files. It hashes a key with k hash functions and checks k bits: if ANY bit is 0, the key is 100% GUARANTEED absent (zero disk I/O!); if all bits are 1, the key is "probably present" so we verify on disk.',
    formalDefinition:
      'A space-efficient probabilistic set membership data structure over an m-bit array with k independent hash functions achieving 0% false-negative rate and false-positive probability p ≈ (1 - e^{-kn/m})^k, optimal at k = (m/n) ln 2 ≈ 0.693(m/n).',
    complexity: {
      time: 'Insert / Query: O(k) — typically 7 bit probes (~10 nanoseconds)',
      space: '~10 bits per key for 1% false-positive rate (1.2 MB for 1M keys!)',
      diskIo: 'Eliminates 99% of unnecessary disk SSTable / Parquet row-group reads',
      guarantees: 'Zero false negatives; standard Bloom does not support delete (use Counting/Cuckoo Filter)',
    },
    useCases: [
      'LSM-Tree SSTable read acceleration (avoid opening disk files that do not contain the key).',
      'Distributed semi-join pushdown (Hash Join Bloom filter pruning in Spark/Trino/ClickHouse).',
      'One-hit-wonder CDN cache admission & malicious URL / credential blocklist pre-filtering.',
    ],
    whenNotToUse: [
      'Range queries (`WHERE age > 25`) — hashing destroys sort order (use Zone Maps / Min-Max / SuRF).',
      'Exact membership without a backing source of truth (1% false positives must be verified).',
    ],
    workedExample:
      'For n = 1,000,000 keys at target p = 1%: m = -n ln(p)/(ln 2)^2 ≈ 9.58M bits (1.2 MB RAM) with k = 7 hash functions. Checking an absent key reads 7 bits in RAM instead of 400 KB of disk SSTables.',
    sqlOrConfigTitle: 'ClickHouse & PostgreSQL Bloom Filter Index Setup',
    sqlOrConfig: `-- ClickHouse Data Skipping Bloom Filter Index on high-cardinality trace_id
ALTER TABLE api_logs
  ADD INDEX idx_trace_bloom trace_id TYPE bloom_filter(0.01) GRANULARITY 4;

-- PostgreSQL multi-column equality Bloom index (contrib/bloom)
CREATE EXTENSION IF NOT EXISTS bloom;
CREATE INDEX idx_events_multi_bloom ON events
  USING bloom (tenant_id, region, status, event_type)
  WITH (length=80, col1=2, col2=2, col3=2, col4=2);`,
    animationTitle: 'Step-by-Step: Bit-Array Hashing, False-Positive Check & Disk Skip',
    animationSteps: [
      {
        step: 1,
        phase: 'Insert Key',
        title: '1. Insert "order_901" -> Set Bits h1=2, h2=5, h3=9',
        explanation: 'Run k=3 independent hashes on "order_901". Flip bit positions 2, 5, and 9 from 0 to 1.',
        blocks: [
          { id: 'k', label: 'Key: "order_901"', sublabel: 'h1=2, h2=5, h3=9', state: 'active' },
          { id: 'b', label: 'Bit Array [0,0,1,0,0,1,0,0,0,1]', sublabel: '3 bits set to 1', state: 'highlight' },
        ],
        metrics: [
          { label: 'Bits/Key', value: '10 bits' },
          { label: 'Insert Cost', value: 'O(k) = 3 hashes' },
        ],
      },
      {
        step: 2,
        phase: 'True Negative',
        title: '2. Query "order_404" -> Hits Bit 7 = 0 -> SKIP DISK!',
        explanation: 'Hashes map to [2, 7, 9]. Bit 7 is 0! The key CANNOT exist in this SSTable—return MISS immediately in 10 ns.',
        blocks: [
          { id: 'k', label: 'Query: "order_404"', sublabel: 'h1=2(1), h2=7(0!), h3=9(1)', state: 'active' },
          { id: 'b', label: 'Bit 7 == 0', sublabel: '100% Definitely Absent', state: 'highlight' },
          { id: 'd', label: 'Disk SSTable', sublabel: 'NEVER OPENED (0 I/O)', state: 'idle' },
        ],
        metrics: [
          { label: 'Disk Reads', value: '0' },
          { label: 'Latency', value: '12 ns' },
        ],
      },
      {
        step: 3,
        phase: 'False Positive',
        title: '3. Rare 1% Collision -> Verify Against Disk SSTable',
        explanation: 'Another absent key hashes to [2, 5, 9] which were already set by earlier inserts. Filter says "Maybe" -> engine checks SSTable index block and confirms NOT FOUND.',
        blocks: [
          { id: 'k', label: 'Query: "order_777"', sublabel: 'h=[2,5,9] all 1s', state: 'warn' },
          { id: 'd', label: 'SSTable Verify', sublabel: 'Binary search -> Absent', state: 'active' },
        ],
        metrics: [
          { label: 'FP Rate', value: '1.0% (tunable)' },
          { label: 'Correctness', value: '100% Exact' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  Key["Lookup Key X"] --> H1["Hash h1(X) mod m"]
  Key --> H2["Hash h2(X) mod m"]
  Key --> H3["Hash h3(X) mod m"]
  H1 & H2 & H3 --> Bits{"All k Bits == 1?"}
  Bits -->|"No (Any bit == 0)"| Absent["100% Definitely Absent<br/>(Skip Disk I/O!)"]
  Bits -->|"Yes (All bits == 1)"| Maybe["Possibly Present (~1% FP)<br/>Read SSTable / Parquet Block"]`,
    completenessNotes:
      'Audit Note: Remember the rule of thumb: ~10 bits per key yields 1% FP; adding ~4.8 bits per key cuts FP by 10x (15 bits -> 0.1%). Use Ribbon Filters (RocksDB) for 30% lower RAM.',
  },
  {
    id: 'algo-extendible-hashing',
    number: 4,
    domain: 'Storage & Indexing',
    name: 'Extendible & Linear Hashing (Dynamic Disk Hash Indexes)',
    shortName: 'Extendible Hashing',
    inventorsOrPaper: 'Ronald Fagin et al. (1979) / Witold Litwin (1980)',
    usedBy: ['PostgreSQL Hash Index (Linear)', 'IBM DB2', 'DuckDB Hash Tables', 'Key-Value Engines'],
    plainEnglish:
      'A classic static hash table freezes the database when it fills up and has to rehash millions of rows at once. Extendible Hashing uses a lightweight pointer directory indexed by the first D bits of the hash so only ONE overflowing bucket splits at a time!',
    formalDefinition:
      'Dynamic external hashing schemes maintaining Global Depth D (directory size 2^D) and per-bucket Local Depth d <= D (Extendible) or a rotating split pointer across linear buckets (Linear Hashing), bounding split cost to O(1) page rewrites.',
    complexity: {
      time: 'Equality Lookup: O(1) (1–2 page fetches)',
      space: 'O(N) with ~69% average bucket occupancy',
      diskIo: 'Single bucket page read for exact-match predicates',
      guarantees: 'No stop-the-world full table rehashing on growth',
    },
    useCases: [
      'Exact-match (`=`) lookups on wide strings/URLs/UUIDs where PostgreSQL Hash indexes are smaller than B+Trees.',
      'In-memory hash join tables and group-by aggregation operators.',
    ],
    whenNotToUse: [
      'Range queries (`<`, `>`, `BETWEEN`), sorting (`ORDER BY`), or multi-column prefix queries (use B+Tree).',
    ],
    workedExample:
      'Directory has Global Depth D=2 (4 pointers: 00, 01, 10, 11). Bucket A (local depth d=1) overflows -> split Bucket A into A0 (prefix 00) and A1 (prefix 01), increment d to 2, update only pointer 01—ZERO other buckets touched!',
    sqlOrConfigTitle: 'PostgreSQL Crash-Safe Linear Hash Index (PG 10+ WAL-Logged)',
    sqlOrConfig: `-- Smaller than B+Tree for long exact-match tokens/URLs (equality '=' only!)
CREATE INDEX idx_shortlinks_url_hash
  ON shortlinks USING hash (original_url);

-- Verify exact-match Index Scan (will NOT be used for LIKE or ORDER BY)
EXPLAIN SELECT short_code FROM shortlinks WHERE original_url = 'https://example.com/a';`,
    animationTitle: 'Step-by-Step: Local Bucket Overflow & Directory Doubling',
    animationSteps: [
      {
        step: 1,
        phase: 'Steady State',
        title: '1. Global Depth D=1 (Directory [0, 1])',
        explanation: 'Hash prefix 0 points to Bucket A; prefix 1 points to Bucket B. Both have Local Depth d=1.',
        blocks: [
          { id: 'dir', label: 'Directory (D=1)', sublabel: '0 -> BktA | 1 -> BktB', state: 'active' },
          { id: 'a', label: 'Bucket A (d=1)', sublabel: '[0010, 0110] FULL', state: 'warn' },
          { id: 'b', label: 'Bucket B (d=1)', sublabel: '[1001]', state: 'idle' },
        ],
        metrics: [
          { label: 'Global Depth D', value: '1 (2 slots)' },
          { label: 'Buckets Split', value: '0' },
        ],
      },
      {
        step: 2,
        phase: 'Local Split',
        title: '2. Bucket A Overflows (d == D) -> Double Directory to D=2',
        explanation: 'Only Bucket A splits into A0 (00*) and A1 (01*). Bucket B is NOT copied—both 10 and 11 simply share a pointer to Bucket B!',
        blocks: [
          { id: 'dir', label: 'Directory (D=2)', sublabel: '00->A0 | 01->A1 | 10,11->B', state: 'highlight' },
          { id: 'a0', label: 'Bucket A0 (d=2)', sublabel: '[0010]', state: 'active' },
          { id: 'a1', label: 'Bucket A1 (d=2)', sublabel: '[0110, 0111]', state: 'active' },
          { id: 'b', label: 'Bucket B (d=1)', sublabel: 'Untouched (Shared Ptr)', state: 'idle' },
        ],
        metrics: [
          { label: 'Pages Rewritten', value: '1 Bucket Only' },
          { label: 'Stop-the-World', value: 'None' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  K["Key Hash: 01101..."] --> Prefix["Read First D=2 Bits: '01'"]
  Prefix --> Dir["Directory Array (2^D)<br/>00 | 01 | 10 | 11"]
  Dir -->|"00"| B0["Bucket A0 (d=2)"]
  Dir -->|"01"| B1["Bucket A1 (d=2)"]
  Dir -->|"10 & 11 (Shared)"| B2["Bucket B (d=1, Untouched)"]`,
    completenessNotes:
      'Audit Note: PostgreSQL Hash indexes became fully WAL-logged and replication-safe starting in PostgreSQL 10 (avoiding older folklore that warned against them), though they still do not support UNIQUE constraints or range predicates.',
  },
  {
    id: 'algo-buffer-pool',
    number: 5,
    domain: 'Storage & Indexing',
    name: 'Buffer Pool Replacement: Clock-Sweep, LRU-K & 2Q',
    shortName: 'Clock-Sweep / LRU-K',
    inventorsOrPaper: 'O’Neil, O’Neil & Weikum (LRU-K, 1993) / Corbato (Clock)',
    usedBy: ['PostgreSQL (Clock-Sweep + Ring Buffer)', 'MySQL InnoDB (Midpoint LRU)', 'SQL Server (LRU-K)'],
    plainEnglish:
      'The database caches hot disk pages in RAM (Buffer Pool). Plain LRU breaks catastrophically when a single `SELECT *` full table scan streams 10 GB of cold pages and evicts your entire hot B+Tree index! Clock-Sweep + Ring Buffers and LRU-K protect frequently accessed pages from sequential scan pollution.',
    formalDefinition:
      'Scan-resistant page replacement policies tracking reference frequency (`usage_count` in PostgreSQL Clock-Sweep) or the K-th most recent access timestamp (LRU-K / InnoDB Midpoint Insertion) to isolate sequential scan pages from the hot working set.',
    complexity: {
      time: 'O(1) amortized frame lookup & victim selection',
      space: 'Fixed RAM pool (`shared_buffers` / `innodb_buffer_pool_size`)',
      diskIo: 'Maintains > 99% buffer cache hit ratio under mixed OLTP + reporting scans',
      guarantees: 'Sequential scan resistance; dirty pages flushed via WAL-first before eviction',
    },
    useCases: [
      'Mixed OLTP + analytical export workloads sharing one database server.',
      'High-concurrency read workloads where avoiding global LRU mutex contention is critical (Clock-Sweep avoids moving pointers on every read hit!).',
    ],
    whenNotToUse: [
      'Direct-I/O bypass analytics engines reading cold Parquet object storage once (no reuse benefit).',
    ],
    workedExample:
      'In PostgreSQL Clock-Sweep, each frame has `usage_count` (0..5). Hot root index page has count=5. A sequential scan uses a 256 KB private Ring Buffer so it recycles its own 32 frames instead of sweeping count=5 hot frames out of `shared_buffers`.',
    sqlOrConfigTitle: 'PostgreSQL Buffer Pool Hit Ratio & InnoDB Midpoint Tuning',
    sqlOrConfig: `-- Check PostgreSQL Buffer Cache Hit Ratio (Target > 99% for OLTP)
SELECT
  round(100.0 * sum(blks_hit) / nullif(sum(blks_hit + blks_read), 0), 2) AS hit_ratio_pct
FROM pg_stat_database;

-- MySQL InnoDB Midpoint Insertion keeps seq scans in old sublist (37%):
-- innodb_old_blocks_pct = 37
-- innodb_old_blocks_time = 1000  (page must be re-read after 1s to promote to Young list!)`,
    animationTitle: 'Step-by-Step: Clock-Sweep Hand & Sequential Scan Protection',
    animationSteps: [
      {
        step: 1,
        phase: 'Clock Scan',
        title: '1. Clock Hand Visits Hot Index Page (usage_count = 4)',
        explanation: 'A new page needs a RAM frame. Clock hand inspects Frame 0 (B+Tree Root, usage=4). Decrements usage to 3 and moves on—hot page stays protected!',
        blocks: [
          { id: 'f0', label: 'Frame 0: B+Tree Root', sublabel: 'usage: 4 -> 3 (Spared)', state: 'highlight' },
          { id: 'f1', label: 'Frame 1: Orders Leaf', sublabel: 'usage: 2', state: 'idle' },
          { id: 'f2', label: 'Frame 2: Cold Report', sublabel: 'usage: 0 (Candidate)', state: 'warn' },
          { id: 'f3', label: 'Frame 3: Pinned Tx', sublabel: 'pin_count=1 (Locked)', state: 'idle' },
        ],
        metrics: [
          { label: 'Cache Hit Ratio', value: '99.4%' },
          { label: 'Evicted', value: 'None yet' },
        ],
      },
      {
        step: 2,
        phase: 'Evict Victim',
        title: '2. Hand Hits Frame 2 (usage=0, pin=0) -> Flush If Dirty & Evict',
        explanation: 'Frame 2 has usage_count=0 and pin_count=0. If dirty, flush WAL then page to disk; otherwise overwrite Frame 2 immediately with the requested page.',
        blocks: [
          { id: 'f0', label: 'Frame 0: B+Tree Root', sublabel: 'Protected in RAM', state: 'highlight' },
          { id: 'f1', label: 'Frame 1: Orders Leaf', sublabel: 'Protected in RAM', state: 'idle' },
          { id: 'f2', label: 'Frame 2: NEW Page #812', sublabel: 'Loaded (usage=1)', state: 'active' },
          { id: 'f3', label: 'Frame 3: Pinned Tx', sublabel: 'Untouched', state: 'idle' },
        ],
        metrics: [
          { label: 'Global LRU Lock', value: 'Zero Contention' },
          { label: 'Scan Pollution', value: 'Blocked' },
        ],
      },
    ],
    mermaidDiagram: `flowchart TD
  Req["Buffer Pool Page Request"] --> Hash{"In Buffer Hash Table?"}
  Hash -->|"Hit (~99%)"| Inc["Increment usage_count (max 5)<br/>Return RAM Frame Pointer"]
  Hash -->|"Miss"| Hand["Clock-Sweep Hand Advances"]
  Hand --> Check{"pin_count == 0 AND<br/>usage_count == 0?"}
  Check -->|"No"| Dec["Decrement usage_count (-1)<br/>Skip Pinned/Hot Frame"] --> Hand
  Check -->|"Yes"| Dirty{"Is Victim Dirty?"}
  Dirty -->|"Yes"| Flush["Ensure WAL Flushed -> Write Page to Disk"] --> Load["Load Requested Page Into Frame"]
  Dirty -->|"No"| Load`,
    completenessNotes:
      'Audit Note: Set PostgreSQL `shared_buffers` to ~25% of host RAM (OS page cache uses the rest) and MySQL `innodb_buffer_pool_size` to ~70–75% of RAM (uses `O_DIRECT`).',
  },

  /* ===================== 2. QUERY & JOINS ===================== */
  {
    id: 'algo-systemr-cascades',
    number: 6,
    domain: 'Query & Joins',
    name: 'System R (Selinger) DP & Cascades Cost-Based Query Optimizer',
    shortName: 'Selinger / Cascades',
    inventorsOrPaper: 'Patricia Selinger et al. (1979) / Goetz Graefe (Cascades, 1995)',
    usedBy: ['PostgreSQL (System R DP + GEQO)', 'SQL Server (Cascades)', 'CockroachDB', 'Greenplum ORCA', 'Calcite'],
    plainEnglish:
      'SQL describes WHAT you want, not HOW to fetch it. A 5-table join has hundreds of execution orders—some take 2ms, others take 2 hours! System R builds optimal join plans bottom-up using dynamic programming and table histograms; Cascades searches top-down with memoization and branch-and-bound pruning.',
    formalDefinition:
      'Cost-based optimization searching logical-to-physical operator equivalences minimizing Cost = w_io * Pages + w_cpu * Tuples using column histograms, MCV (Most Common Values), NDV statistics, and memoized DP / top-down Cascades transformation rules.',
    complexity: {
      time: 'System R DP: O(n * 2^n) subsets (falls back to genetic/greedy when n > 12 tables)',
      space: 'O(2^n) memo table of best plan per relation subset & interesting order',
      diskIo: 'Prevents catastrophic plans (e.g. 10,000x I/O difference from wrong join order)',
      guarantees: 'Optimal plan within the chosen cost model assuming accurate cardinality statistics',
    },
    useCases: [
      'Every multi-table SQL join, subquery decorrelation, predicate pushdown, and index selection decision.',
      'Fixing slow queries where `EXPLAIN ANALYZE` shows huge gaps between Estimated Rows vs Actual Rows (stale `ANALYZE` stats or correlated columns!).',
    ],
    whenNotToUse: [
      'Joining > 12 tables without breaking into CTEs/materialized stages (exponential search space triggers heuristic fallback).',
    ],
    workedExample:
      'Joining `Orders (10M)` ⋈ `Customers (1M)` ⋈ `VIP_Filter (200 rows)`: Pushing `VIP_Filter` first shrinks intermediate rows from 10M to 400 before probing `Orders` via index, cutting total cost from 450,000 units to 180 units.',
    sqlOrConfigTitle: 'Fixing Correlated Column Misestimates with Extended Statistics',
    sqlOrConfig: `-- Optimizer assumes city='Austin' AND state='TX' are independent (underestimates rows!)
-- Fix with PostgreSQL Multivariate Extended Statistics:
CREATE STATISTICS st_cust_city_state (dependencies, ndistinct, mcv)
  ON city, state FROM customers;

ANALYZE customers;
-- Now inspect Estimated vs Actual rows:
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE c.city = 'Austin' AND c.state = 'TX';`,
    animationTitle: 'Step-by-Step: Parse -> Rewrite -> Cost Model Search -> Physical Plan',
    animationSteps: [
      {
        step: 1,
        phase: 'Logical Rewrite',
        title: '1. Predicate Pushdown & Subquery Unnesting',
        explanation: 'Push `WHERE status = "VIP"` below the JOIN so filters run before multiplying tables.',
        blocks: [
          { id: 'p', label: 'SQL AST', sublabel: '3-Way Join + Filter', state: 'idle' },
          { id: 'r', label: 'Logical Algebra', sublabel: 'Filter Pushed to Leaf', state: 'active' },
          { id: 's', label: 'Catalog Stats', sublabel: 'MCV + Histograms', state: 'highlight' },
        ],
        metrics: [
          { label: 'Est. Selectivity', value: '0.02% (200 rows)' },
          { label: 'Rows Pruned', value: '99.98%' },
        ],
      },
      {
        step: 2,
        phase: 'DP / Memo Search',
        title: '2. Compare Candidate Join Orders & Physical Operators',
        explanation: 'Memoizer evaluates `(Orders ⋈ Customers)` Hash Join (Cost 84,200) vs `(VIP ⋈ Orders)` Index Nested Loop (Cost 210) -> prunes expensive branch immediately!',
        blocks: [
          { id: 'c1', label: 'Plan A: SeqScan + HashJoin', sublabel: 'Cost: 84,200 (Pruned)', state: 'warn' },
          { id: 'c2', label: 'Plan B: VIP -> Index NLJ', sublabel: 'Cost: 210 (WINNER)', state: 'highlight' },
        ],
        metrics: [
          { label: 'Speedup', value: '400x cheaper' },
          { label: 'Plan Cached', value: 'Prepared Stmt' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  SQL["SQL Query"] --> Parse["Parser -> AST"]
  Parse --> Rewrite["Logical Rewriter<br/>(Predicate Pushdown / Unnest)"]
  Stats[("Catalog Statistics<br/>Histograms / MCV / NDV")] --> Cost
  Rewrite --> Cost["Cost-Based Optimizer<br/>(System R DP / Cascades Memo)"]
  Cost --> P1["Candidate 1: SeqScan + HashJoin<br/>Cost = 84,200 (Pruned)"]
  Cost --> P2["Candidate 2: IndexScan + INLJ<br/>Cost = 210 (Selected!)"]
  P2 --> Exec["Volcano / Vectorized Executor"]`,
    completenessNotes:
      'Audit Note: 80% of "bad query plans" come from cardinality estimation errors (missing `ANALYZE`, correlated columns, or functions wrapping indexed columns like `WHERE LOWER(email) = ...`).',
  },
  {
    id: 'algo-grace-hash-join',
    number: 7,
    domain: 'Query & Joins',
    name: 'Grace Hash Join (Partitioned Build & Probe)',
    shortName: 'Grace Hash Join',
    inventorsOrPaper: 'Masaru Kitsuregawa, Hidehiko Tanaka & Tohru Moto-oka (1983)',
    usedBy: ['PostgreSQL', 'Spark SQL', 'DuckDB', 'Trino', 'Snowflake', 'ClickHouse'],
    plainEnglish:
      'The champion algorithm for large unsorted equi-joins (`A.id = B.id`). Build an in-memory hash table on the smaller table, then stream the larger table through it probing in O(1). If the build table exceeds `work_mem`, Grace Hash Join hashes BOTH tables into disk partitions first so each partition pair fits cleanly in RAM!',
    formalDefinition:
      'A two-phase partitioned equi-join algorithm executing Phase 1 (hash-partition R and S into B disjoint buckets via h1 on join key) and Phase 2 (for each bucket i, build an in-memory hash table on R_i with h2 and probe with S_i) in O(|R| + |S|) time.',
    complexity: {
      time: 'O(M + N) linear in input sizes',
      space: 'O(min(M, N)) RAM, or O(sqrt(M)) via Grace disk partitioning',
      diskIo: '1 pass (in-memory) or 3*(M + N) page I/Os when spilling to temp disk',
      guarantees: 'Handles arbitrary unsorted equi-joins in linear time',
    },
    useCases: [
      'Joining two large tables on equality (`ON orders.customer_id = customers.id`) without pre-existing sorted indexes.',
      'OLAP star-schema joins (Fact table probing Dimension hash tables with Bloom filter pushdown).',
    ],
    whenNotToUse: [
      'Non-equality joins (`a.ts BETWEEN b.start AND b.end`) — Hash Join ONLY supports `=` predicates!',
      'Highly selective queries needing only `LIMIT 10` (Hash Join must build the entire inner table first before emitting row 1).',
    ],
    workedExample:
      'Joining Customers (40 MB) with Orders (2 GB) when `work_mem = 16 MB`: Grace partitions both into 4 batches (`h1(cust_id) % 4`) of ~10 MB Customers + 500 MB Orders each, then joins batch 0..3 sequentially in RAM with zero OOM.',
    sqlOrConfigTitle: 'Detecting Hash Join Disk Spills in EXPLAIN ANALYZE',
    sqlOrConfig: `-- Look for "Batches: 1" (Pure RAM) vs "Batches: 8" (Disk Spill!)
SET LOCAL work_mem = '64MB';
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.tier, sum(o.total_cents)
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.tier;`,
    animationTitle: 'Step-by-Step: Hash Partition -> In-Memory Build -> Stream Probe',
    animationSteps: [
      {
        step: 1,
        phase: 'Build Phase',
        title: '1. Build Hash Table on Smaller Relation (Customers)',
        explanation: 'Scan smaller table `Customers` once and insert `(customer_id -> row)` into in-memory hash buckets.',
        blocks: [
          { id: 'c', label: 'Smaller Table: Customers', sublabel: 'Streaming into RAM', state: 'active' },
          { id: 'ht', label: 'Hash Table (work_mem)', sublabel: 'h(42)->Alice | h(99)->Bob', state: 'highlight' },
          { id: 'o', label: 'Larger Table: Orders', sublabel: 'Waiting for Build', state: 'idle' },
        ],
        metrics: [
          { label: 'Batches', value: '1 (Pure RAM)' },
          { label: 'Build Cost', value: 'O(M)' },
        ],
      },
      {
        step: 2,
        phase: 'Probe Phase',
        title: '2. Stream Orders & Probe Hash Table in O(1)',
        explanation: 'Each Order row hashes `customer_id`, jumps straight to the matching bucket in RAM, and emits joined rows immediately.',
        blocks: [
          { id: 'o', label: 'Orders Row (cid=42)', sublabel: 'Streaming...', state: 'active' },
          { id: 'ht', label: 'Hash Bucket #42', sublabel: 'O(1) Match: Alice!', state: 'highlight' },
          { id: 'out', label: 'Joined Output', sublabel: '(Order#7, Alice)', state: 'highlight' },
        ],
        metrics: [
          { label: 'Probe Cost', value: 'O(N)' },
          { label: 'Total Time', value: 'O(M + N)' },
        ],
      },
      {
        step: 3,
        phase: 'Grace Spill',
        title: '3. If Build > work_mem -> Grace Partitioning Spills Matching Buckets',
        explanation: 'If RAM fills up, Grace splits both tables using h1(key) into K temp disk partitions (P0..PK), then loads one small partition pair at a time into RAM.',
        blocks: [
          { id: 'p0', label: 'Partition 0 (C0 + O0)', sublabel: 'Fits in RAM -> Joined', state: 'highlight' },
          { id: 'p1', label: 'Partition 1 (C1 + O1)', sublabel: 'Spilled -> Queued', state: 'warn' },
          { id: 'p2', label: 'Partition 2 (C2 + O2)', sublabel: 'Spilled -> Queued', state: 'idle' },
        ],
        metrics: [
          { label: 'OOM Risk', value: '0% (Bounded RAM)' },
          { label: 'Batches', value: '4 (Temp Disk)' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  R["Smaller Table R"] --> Check{"Fits in work_mem?"}
  S["Larger Table S"] --> Check
  Check -->|"Yes (Batches=1)"| Build["Build In-Memory Hash Table(R)"] --> Probe["Stream S -> O(1) Probe -> Emit"]
  Check -->|"No (Grace Spill)"| Part["Partition R & S by h1(key)<br/>into K Disk Buckets"]
  Part --> B1["Load R_i into RAM + Probe S_i"] --> Emit["Emit Joined Tuples"]`,
    completenessNotes:
      'Audit Note: Skewed join keys (e.g., 50% of rows having `customer_id = NULL` or a single giant tenant) cause one Grace partition to blow up in memory—always filter NULLs early and watch for skew.',
  },
  {
    id: 'algo-sort-merge-join',
    number: 8,
    domain: 'Query & Joins',
    name: 'Sort-Merge Join & External K-Way Merge Sort',
    shortName: 'Sort-Merge Join',
    inventorsOrPaper: 'Classic External Memory Sorting (Knuth TAOCP Vol. 3)',
    usedBy: ['PostgreSQL', 'Oracle', 'SQL Server', 'Spark SQL', 'ClickHouse'],
    plainEnglish:
      'When both inputs are already sorted (e.g., via B+Tree index scans) or the query also wants `ORDER BY`, Sort-Merge Join walks two pointers smoothly down both tables like zipping a jacket—using almost zero RAM! For datasets larger than RAM, External K-Way Merge Sort sorts RAM-sized chunks and merges them with a min-heap.',
    formalDefinition:
      'A join operator advancing cursors (i, j) across sorted relations R and S in O(|R| + |S|) merge time (or O(M log M + N log N) if sorting via External K-Way Merge with B buffer pages requiring ceil(log_{B-1}(N/B)) passes).',
    complexity: {
      time: 'O(M + N) if pre-sorted; O(M log M + N log N) with external sort',
      space: 'O(1) merge memory (only buffers duplicate key runs)',
      diskIo: 'Pure sequential I/O — ideal for huge datasets spilling past RAM',
      guarantees: 'Output arrives naturally sorted on the join key (eliminates final ORDER BY sort!)',
    },
    useCases: [
      'Joining two giant tables that are already indexed/clustered on the join key.',
      'Queries requiring `ORDER BY join_key` or streaming `MERGE` / time-series alignment.',
    ],
    whenNotToUse: [
      'Unsorted tables where Hash Join fits cleanly in RAM (avoids paying O(N log N) sort cost).',
    ],
    workedExample:
      'Sorting 100 GB with 1 GB RAM: Pass 0 creates 100 sorted 1 GB runs on disk. Pass 1 opens all 100 runs simultaneously with a 100-way min-heap in RAM (10 MB buffer each) and streams the 100 GB sorted output in JUST 2 passes!',
    sqlOrConfigTitle: 'Leveraging Pre-Sorted B+Tree Indexes for Zero-Sort Merge Join',
    sqlOrConfig: `-- Both tables indexed on account_id -> Planner picks Merge Join with ZERO Sort node!
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.id, l.amount_cents
FROM accounts a
JOIN ledger_entries l ON l.account_id = a.id
ORDER BY a.id
LIMIT 500;`,
    animationTitle: 'Step-by-Step: Two-Pointer Zipper Merge Over Sorted Runs',
    animationSteps: [
      {
        step: 1,
        phase: 'Align Pointers',
        title: '1. Compare Heads: Left=10 vs Right=10 -> MATCH!',
        explanation: 'Both cursors point to key 10. Emit joined tuple and advance Right cursor to check for duplicate 10s.',
        blocks: [
          { id: 'l', label: 'Left Sorted [10*, 20, 35]', sublabel: 'Cursor L -> 10', state: 'active' },
          { id: 'r', label: 'Right Sorted [10*, 10, 25]', sublabel: 'Cursor R -> 10', state: 'active' },
          { id: 'o', label: 'Sorted Output', sublabel: 'Emit (10, R1)', state: 'highlight' },
        ],
        metrics: [
          { label: 'RAM Needed', value: 'O(1) Pointers' },
          { label: 'Order Preserved', value: 'Yes (Sorted)' },
        ],
      },
      {
        step: 2,
        phase: 'Advance Smaller',
        title: '2. Left=20 < Right=25 -> Advance Only Left Pointer',
        explanation: 'Since inputs are sorted, key 20 cannot appear later in Right. Skip 20 immediately without scanning backwards!',
        blocks: [
          { id: 'l', label: 'Left Sorted [10, 20*, 35]', sublabel: '20 < 25 -> Advance L', state: 'warn' },
          { id: 'r', label: 'Right Sorted [10, 10, 25*]', sublabel: 'Hold R at 25', state: 'active' },
          { id: 'o', label: 'Sorted Output', sublabel: '(10,R1), (10,R2)', state: 'highlight' },
        ],
        metrics: [
          { label: 'Comparisons', value: 'Linear O(M+N)' },
          { label: 'Backtracking', value: 'Duplicates Only' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  R["Sorted Run R (or External K-Way Sort)"] --> Merge["Two-Pointer Zipper Merge"]
  S["Sorted Run S (or External K-Way Sort)"] --> Merge
  Merge -->|"L == R"| Emit["Emit Match (Handle Duplicate Group)"]
  Merge -->|"L < R"| AdvL["Advance Left Pointer"]
  Merge -->|"L > R"| AdvR["Advance Right Pointer"]`,
    completenessNotes:
      'Audit Note: For huge sorts, External K-Way Merge Sort using a Min-Heap tournament tree completes 100+ GB sorts in just 2 sequential disk passes.',
  },
  {
    id: 'algo-index-nested-loop',
    number: 9,
    domain: 'Query & Joins',
    name: 'Index Nested Loop Join (INLJ) & Batched Key Access',
    shortName: 'Index Nested Loop',
    inventorsOrPaper: 'Foundational Relational Execution Operator',
    usedBy: ['PostgreSQL', 'MySQL InnoDB', 'SQLite', 'Oracle'],
    plainEnglish:
      'Pick a tiny outer result set (say, 15 orders for one customer), and for each row, probe the inner table’s B+Tree index directly instead of scanning the entire inner table. Starts streaming the first row in < 1ms!',
    formalDefinition:
      'A pipelined join operator iterating over outer tuples r in R and probing an index on inner relation S in O(|R| * log_B |S|) time without materializing S.',
    complexity: {
      time: 'O(|R| * log_B |S|) — unbeatable when |R| is small',
      space: 'O(1) memory (fully pipelined)',
      diskIo: 'Low when outer |R| is tiny; terrible (random I/O storm!) if |R| is huge',
      guarantees: 'Lowest time-to-first-row (TTFB) for `LIMIT N` OLTP endpoints',
    },
    useCases: [
      'Interactive OLTP pagination (`LIMIT 20`) and single-user dashboards.',
      'Non-equality joins (`ON a.ts BETWEEN b.start AND b.end`) where Hash Join cannot run.',
    ],
    whenNotToUse: [
      'When outer driving table actually returns 500,000 rows (due to stale stats!) -> causes 500,000 random index probes instead of a 1-pass Hash Join.',
    ],
    workedExample:
      'Fetch 10 recent orders for User #42 and join `products` (10M rows): Outer returns 10 rows -> 10 B+Tree probes on `products(id)` = ~30 page hits = 0.6ms total!',
    sqlOrConfigTitle: 'Fast OLTP Index Nested Loop Join for Paginated APIs',
    sqlOrConfig: `-- Outer returns 10 rows -> 10 O(log N) PK probes on products!
EXPLAIN (ANALYZE, BUFFERS)
SELECT o.id, p.title, o.qty
FROM orders o
JOIN products p ON p.id = o.product_id
WHERE o.user_id = 42
ORDER BY o.created_at DESC
LIMIT 10;`,
    animationTitle: 'Step-by-Step: Small Outer Driving Loop Probing Inner B+Tree',
    animationSteps: [
      {
        step: 1,
        phase: 'Outer Filter',
        title: '1. Outer Index Scan Yields 10 Orders for User #42',
        explanation: 'Driving table is pruned down to just 10 rows immediately via `idx_orders_user_created`.',
        blocks: [
          { id: 'o', label: 'Outer: 10 Orders', sublabel: 'product_id = 501', state: 'active' },
          { id: 'idx', label: 'Inner B+Tree (products.pk)', sublabel: 'Probing 501 (3 hops)', state: 'highlight' },
          { id: 'out', label: 'Stream Row #1', sublabel: 'TTFB < 0.5 ms!', state: 'highlight' },
        ],
        metrics: [
          { label: 'Outer Rows', value: '10' },
          { label: 'TTFB', value: '0.4 ms' },
        ],
      },
      {
        step: 2,
        phase: 'Trap Warning',
        title: '2. Warning: If Outer Has 500K Rows -> Switch to Hash Join',
        explanation: 'If stale statistics fool the planner into picking INLJ on 500K outer rows, 500K random B+Tree lookups thrash disk I/O.',
        blocks: [
          { id: 'o', label: 'Bad Estimate: Est=10, Actual=500K', sublabel: '500K Random Probes!', state: 'warn' },
          { id: 'fix', label: 'Fix: Run ANALYZE', sublabel: 'Planner switches to Hash Join', state: 'highlight' },
        ],
        metrics: [
          { label: 'Bad Plan', value: '18,000 ms' },
          { label: 'Fixed HashJoin', value: '140 ms' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  Outer["Small Outer Result R (10 rows)"] --> Loop["For Each Row r in R"]
  Loop --> Probe["Probe Inner B+Tree Index(S.key = r.key)<br/>O(log_B |S|)"]
  Probe --> Emit["Pipelined Output (Instant LIMIT N TTFB)"]`,
    completenessNotes:
      'Audit Note: Whenever you see `Nested Loop` with `loops=100000` in `EXPLAIN ANALYZE`, check whether an index is missing on the inner join column or if stale stats misled the optimizer.',
  },

  /* ===================== 3. CONCURRENCY & ISOLATION ===================== */
  {
    id: 'algo-mvcc',
    number: 10,
    domain: 'Concurrency & Isolation',
    name: 'MVCC (Multi-Version Concurrency Control) & Snapshot Isolation',
    shortName: 'MVCC & Snapshots',
    inventorsOrPaper: 'David Reed (1978) / Berenson et al. (1995)',
    usedBy: ['PostgreSQL', 'MySQL InnoDB (Undo Log)', 'Oracle', 'CockroachDB', 'SQL Server (RCSI)'],
    plainEnglish:
      'Readers NEVER block writers and writers NEVER block readers! Instead of overwriting a row in place, an UPDATE creates a new version of the row stamped with transaction IDs (`xmin`, `xmax`). Each transaction reads a consistent point-in-time Snapshot based on which transaction IDs had committed when it started.',
    formalDefinition:
      'A concurrency mechanism retaining multiple physical versions per logical tuple, evaluating visibility predicates against a transaction’s active snapshot `(xmin_bound, xmax_bound, active_xids)` so reads observe consistent state without shared read locks.',
    complexity: {
      time: 'Read visibility check: O(1) header check (or undo-chain walk in InnoDB)',
      space: 'Dead tuple versions accumulate until reclaimed by VACUUM / Purge thread',
      diskIo: 'PostgreSQL HOT (Heap-Only Tuples) avoids updating indexes when indexed columns do not change',
      guarantees: 'Prevents Dirty Reads & Non-Repeatable Reads; vulnerable to Write Skew unless upgraded to SSI',
    },
    useCases: [
      'High-concurrency OLTP apps running live reporting queries alongside constant updates.',
      'Zero-lock consistent database backups (`pg_dump --single-transaction`).',
    ],
    whenNotToUse: [
      'Unmonitored long-running idle-in-transaction sessions (blocks VACUUM from reclaiming millions of dead tuples -> table bloat & XID wraparound!).',
    ],
    workedExample:
      'Row balance=100 has `(xmin=10, xmax=NULL)`. Tx 15 starts Snapshot (sees xid <= 14). Tx 16 updates balance to 50 -> marks old tuple `xmax=16`, inserts new tuple `(xmin=16, xmax=NULL, bal=50)` and commits. Tx 15 STILL reads 100 cleanly without blocking Tx 16!',
    sqlOrConfigTitle: 'Inspecting PostgreSQL MVCC Tuple Metadata & Autovacuum Health',
    sqlOrConfig: `-- Inspect hidden MVCC system columns directly in PostgreSQL!
SELECT ctid, xmin, xmax, id, balance
FROM accounts WHERE id = 1;

-- Guard against bloat: kill transactions left idle > 2 minutes
ALTER SYSTEM SET idle_in_transaction_session_timeout = '120s';`,
    animationTitle: 'Step-by-Step: Concurrent Snapshot Read During Active UPDATE',
    animationSteps: [
      {
        step: 1,
        phase: 'Snapshot Start',
        title: '1. Tx 15 Opens Snapshot (Sees Committed XIDs <= 14)',
        explanation: 'Tuple v1 `(xmin=10, xmax=NULL, bal=$100)` is visible to Tx 15. No read lock acquired.',
        blocks: [
          { id: 't15', label: 'Tx 15 (Reader)', sublabel: 'Snapshot <= 14', state: 'active' },
          { id: 'v1', label: 'Tuple v1: $100', sublabel: 'xmin=10, xmax=NULL', state: 'highlight' },
        ],
        metrics: [
          { label: 'Read Locks', value: '0' },
          { label: 'Tx 15 Sees', value: '$100' },
        ],
      },
      {
        step: 2,
        phase: 'Copy-On-Write',
        title: '2. Tx 16 Updates Balance -> Writes v2 ($50) & Commits',
        explanation: 'Tx 16 stamps v1 `xmax=16` and appends v2 `(xmin=16, bal=$50)`. Both versions coexist in the heap!',
        blocks: [
          { id: 't16', label: 'Tx 16 (Writer)', sublabel: 'COMMITTED', state: 'active' },
          { id: 'v1', label: 'Tuple v1: $100', sublabel: 'xmin=10, xmax=16 (Old)', state: 'idle' },
          { id: 'v2', label: 'Tuple v2: $50', sublabel: 'xmin=16, xmax=NULL (New)', state: 'highlight' },
        ],
        metrics: [
          { label: 'Writer Blocked?', value: 'No' },
          { label: 'New Tx 17 Sees', value: '$50' },
        ],
      },
      {
        step: 3,
        phase: 'Vacuum GC',
        title: '3. Tx 15 Finishes -> Autovacuum Reclaims Dead Tuple v1',
        explanation: 'Once no active snapshot can see XID 16’s predecessor, Autovacuum marks v1’s space reusable without locking reads.',
        blocks: [
          { id: 'v1', label: 'Tuple v1 (Dead)', sublabel: 'Reclaimed by VACUUM', state: 'warn' },
          { id: 'v2', label: 'Tuple v2: $50', sublabel: 'Live Active Tuple', state: 'highlight' },
        ],
        metrics: [
          { label: 'Table Bloat', value: 'Reclaimed' },
          { label: 'XID Wraparound', value: 'Frozen Safely' },
        ],
      },
    ],
    mermaidDiagram: `sequenceDiagram
  autonumber
  participant R as Tx 15 (Repeatable Read)
  participant W as Tx 16 (Writer)
  participant Heap as Heap Versions (MVCC)
  R->>Heap: BEGIN Snapshot (sees <= 14)
  W->>Heap: UPDATE bal=50 -> v1.xmax=16, insert v2(xmin=16)
  W->>Heap: COMMIT (XID 16)
  R->>Heap: SELECT bal (checks visibility: v2.xmin=16 > 14 -> skip, v1 visible!)
  Heap-->>R: Returns $100 (Zero Locks, Consistent Snapshot)
  Note over Heap: After Tx 15 ends -> Autovacuum reclaims v1`,
    completenessNotes:
      'Audit Note: Contrast PostgreSQL MVCC (old versions stay in Heap -> needs VACUUM) vs MySQL InnoDB MVCC (new version overwrites clustered index in place; old deltas live in Rollback/Undo Segment).',
  },
  {
    id: 'algo-strict-2pl',
    number: 11,
    domain: 'Concurrency & Isolation',
    name: 'Strict 2PL, Wound-Wait / Wait-Die & Wait-For Graph Deadlock Detection',
    shortName: 'Strict 2PL & Deadlocks',
    inventorsOrPaper: 'Eswaran et al. (1976) / Rosenkrantz, Stearns & Lewis (1978)',
    usedBy: ['MySQL InnoDB (Next-Key Locks)', 'PostgreSQL (FOR UPDATE)', 'SQL Server', 'Oracle'],
    plainEnglish:
      'Strict Two-Phase Locking acquires Shared (S) or Exclusive (X) row locks during execution (Growing Phase) and holds ALL exclusive locks until COMMIT or ROLLBACK (Shrinking Phase). To break deadlocks (Tx A waits for B, B waits for A), engines either detect cycles in a Wait-For Graph or enforce timestamp ordering (Wound-Wait / Wait-Die).',
    formalDefinition:
      'A pessimistic concurrency protocol ensuring conflict serializability and strict recoverability (avoiding cascading aborts) by holding all write locks until transaction termination, paired with Wait-For Graph DFS cycle detection or Wound-Wait preemptive aborts.',
    complexity: {
      time: 'Lock acquisition: O(1) lock hash table · Deadlock DFS: O(V + E)',
      space: 'O(active locks) in Lock Manager RAM table',
      diskIo: 'Zero extra disk I/O (in-memory lock table; lock escalation if memory exhausted)',
      guarantees: 'Conflict serializability & zero cascading aborts',
    },
    useCases: [
      'Double-entry ledger transfers (`SELECT ... FOR UPDATE`), inventory reservation, and seat booking.',
      'High-contention rows where optimistic retries would waste excessive CPU.',
    ],
    whenNotToUse: [
      'Holding row locks across external HTTP/Stripe network calls (destroys connection pool & triggers lock timeout storms!).',
    ],
    workedExample:
      'Tx 1 locks Account A, wants B; Tx 2 locks Account B, wants A. Wait-For Graph finds cycle `Tx1 -> Tx2 -> Tx1` in 1s (`deadlock_timeout`) and aborts the lower-cost victim so the other commits. Prevention: ALWAYS lock accounts in deterministic `ORDER BY account_id ASC`!',
    sqlOrConfigTitle: 'Deadlock-Free Strict 2PL Row Locking Order',
    sqlOrConfig: `BEGIN;
-- Deterministic canonical ordering eliminates A->B / B->A deadlock cycles!
SELECT id, balance FROM accounts
WHERE id IN (101, 205)
ORDER BY id ASC
FOR UPDATE;

UPDATE accounts SET balance = balance - 500 WHERE id = 101;
UPDATE accounts SET balance = balance + 500 WHERE id = 205;
COMMIT; -- All X-locks released atomically at COMMIT`,
    animationTitle: 'Step-by-Step: Growing Phase, Deadlock Cycle & Victim Abort',
    animationSteps: [
      {
        step: 1,
        phase: 'Growing Phase',
        title: '1. Tx1 Acquires X(A), Tx2 Acquires X(B)',
        explanation: 'Both transactions enter the Growing Phase and acquire exclusive row locks in opposite orders.',
        blocks: [
          { id: 't1', label: 'Tx 1', sublabel: 'Holds X(Row A)', state: 'active' },
          { id: 't2', label: 'Tx 2', sublabel: 'Holds X(Row B)', state: 'active' },
        ],
        metrics: [
          { label: 'Phase', value: 'Growing (Acquiring)' },
          { label: 'Wait-For Cycle', value: 'None' },
        ],
      },
      {
        step: 2,
        phase: 'Deadlock Cycle',
        title: '2. Tx1 Requests X(B) & Tx2 Requests X(A) -> Cycle Detected!',
        explanation: 'Wait-For Graph detects `Tx1 -> Tx2 -> Tx1`. Deadlock Detector aborts Tx2 (rolls back & releases X(B)).',
        blocks: [
          { id: 't1', label: 'Tx 1 (Survivor)', sublabel: 'Acquires X(B) -> COMMITS', state: 'highlight' },
          { id: 't2', label: 'Tx 2 (Victim)', sublabel: 'SQLSTATE 40P01 Aborted', state: 'warn' },
        ],
        metrics: [
          { label: 'Detection', value: 'DFS Cycle O(V+E)' },
          { label: 'Best Fix', value: 'ORDER BY id ASC' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  Tx1["Transaction 1<br/>Holds X(Row A)"] -->|"Waits for X(Row B)"| Tx2["Transaction 2<br/>Holds X(Row B)"]
  Tx2 -->|"Waits for X(Row A)"| Tx1
  Tx1 -.-> Detector{"Wait-For Graph<br/>DFS Cycle Detector"}
  Detector -->|"Abort Victim Tx2"| Free["Release X(Row B)<br/>Tx1 Proceeds & Commits"]`,
    completenessNotes:
      'Audit Note: Remember MySQL InnoDB Gap Locks + Next-Key Locks prevent Phantom Reads under Repeatable Read, while PostgreSQL uses pure MVCC + SSI for Serializable.',
  },
  {
    id: 'algo-ssi',
    number: 12,
    domain: 'Concurrency & Isolation',
    name: 'Serializable Snapshot Isolation (SSI — Cahill et al.)',
    shortName: 'SSI (Write-Skew Proof)',
    inventorsOrPaper: 'Michael Cahill, Uwe Röhm & Alan Fekete (SIGMOD 2008 Best Paper)',
    usedBy: ['PostgreSQL (SERIALIZABLE)', 'CockroachDB', 'FoundationDB', 'YugabyteDB'],
    plainEnglish:
      'Plain Snapshot Isolation allows a sneaky bug called Write Skew (e.g., two on-call doctors both see 2 doctors on duty and simultaneously mark themselves off-call, leaving 0 doctors!). SSI fixes this WITHOUT blocking readers by tracking lightweight SIREAD predicate locks and aborting one transaction only when two consecutive read-write conflicts (`rw-antidependency`) form a dangerous cycle.',
    formalDefinition:
      'An optimistic extension of MVCC Snapshot Isolation maintaining SIREAD predicate locks to detect adjacent `rw-antidependency` edges (T1 -rw-> T2 -rw-> T3) in the serialization graph, aborting a pivot transaction before any non-serializable anomaly can commit.',
    complexity: {
      time: 'Near-MVCC speed under low conflict; retry cost only on dangerous rw-structures',
      space: 'SIREAD predicate locks tracked in shared RAM (promoted to page/relation if large)',
      diskIo: 'Zero read-blocking locks',
      guarantees: 'True ANSI SERIALIZABLE isolation (prevents Write Skew, Phantom Reads & Read-Only anomalies)',
    },
    useCases: [
      'Invariants spanning multiple rows (on-call scheduling, multi-account minimum combined balance, double-booking prevention).',
      'Financial & ledger correctness where subtle race conditions cannot be tolerated.',
    ],
    whenNotToUse: [
      'Clients that do not implement an automatic retry loop for `SQLSTATE 40001 (serialization_failure)`.',
    ],
    workedExample:
      'Doctors Alice & Bob are both on-call. Tx1 checks `COUNT(*) >= 2` (true, acquires SIREAD lock on table), updates Alice=OFF. Concurrently Tx2 checks `COUNT(*) >= 2` (true, SIREAD), updates Bob=OFF. Tx1 commits -> Tx2 commit triggers `rw-cycle` detection -> PostgreSQL aborts Tx2 with `40001`!',
    sqlOrConfigTitle: 'PostgreSQL True Serializable (SSI) Guarding Multi-Row Invariants',
    sqlOrConfig: `BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Both concurrent doctors run this check:
SELECT count(*) FROM on_call WHERE shift_date = '2026-05-01' AND active = true;
-- If count >= 2, proceed:
UPDATE on_call SET active = false WHERE doctor_id = 'alice' AND shift_date = '2026-05-01';

COMMIT;
-- Second concurrent tx receives ERROR 40001: could not serialize access due to read/write dependencies
-- Application catches 40001 -> retries -> now sees count=1 -> cleanly refuses!`,
    animationTitle: 'Step-by-Step: Detecting Dangerous rw-Antidependency Write Skew',
    animationSteps: [
      {
        step: 1,
        phase: 'SIREAD Locks',
        title: '1. Tx1 & Tx2 Both Read `count(*) = 2` Without Blocking',
        explanation: 'Neither blocks! PostgreSQL records non-blocking SIREAD predicate locks for both transactions.',
        blocks: [
          { id: 't1', label: 'Tx 1 (Alice)', sublabel: 'Reads 2 active · SIREAD', state: 'active' },
          { id: 't2', label: 'Tx 2 (Bob)', sublabel: 'Reads 2 active · SIREAD', state: 'active' },
        ],
        metrics: [
          { label: 'Blocking', value: '0 ms (Non-Blocking)' },
          { label: 'SIREAD Tracked', value: '2 predicates' },
        ],
      },
      {
        step: 2,
        phase: 'Cycle Abort',
        title: '2. Disjoint Updates Create `Tx1 -rw-> Tx2 -rw-> Tx1` -> Abort Tx2!',
        explanation: 'Each updated a row the other read! Tx1 commits; SSI catches the dangerous structure and aborts Tx2 (`40001`), preserving the invariant.',
        blocks: [
          { id: 't1', label: 'Tx 1 (Alice=OFF)', sublabel: 'COMMITTED (1 doctor left)', state: 'highlight' },
          { id: 't2', label: 'Tx 2 (Bob=OFF)', sublabel: 'ABORTED 40001 (Write Skew Blocked!)', state: 'warn' },
        ],
        metrics: [
          { label: 'Doctors On-Call', value: '1 (Invariant Safe!)' },
          { label: 'Isolation', value: 'True Serializable' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  T1["Tx 1: Reads on_call (SIREAD)<br/>Updates Alice = OFF"] -->|"-rw- conflict (Tx2 writes row Tx1 read)"| T2["Tx 2: Reads on_call (SIREAD)<br/>Updates Bob = OFF"]
  T2 -->|"-rw- conflict (Tx1 writes row Tx2 read)"| T1
  T1 --> Commit1["Tx 1 Commits"]
  T2 --> SSI{"SSI Dangerous Structure Check"}
  SSI -->|"Cycle Detected!"| Abort["Abort Tx 2 (SQLSTATE 40001)<br/>App Retries & Sees Count=1"]`,
    completenessNotes:
      'Audit Note: Always pair `ISOLATION LEVEL SERIALIZABLE` with an idempotent client retry loop on `40001`, and keep transactions short so SIREAD lock tables stay compact.',
  },
  {
    id: 'algo-occ',
    number: 13,
    domain: 'Concurrency & Isolation',
    name: 'Optimistic Concurrency Control (Kung-Robinson OCC)',
    shortName: 'Kung-Robinson OCC',
    inventorsOrPaper: 'H.T. Kung & John T. Robinson (ACM TODS 1981)',
    usedBy: ['DynamoDB Conditional Writes', 'JPA @Version', 'MongoDB', 'CockroachDB', 'HTTP ETags'],
    plainEnglish:
      'Assume conflicts are rare! Read the row and its `version = 7` without holding any database lock, let the user edit or compute in app memory, then update with `WHERE id = 1 AND version = 7` setting `version = 8`. If 0 rows updated, someone beat you to it—reload and retry!',
    formalDefinition:
      'A non-blocking concurrency control protocol structured into three phases—Read (local workspace), Validation (atomic version/read-set check), and Write (commit if valid, abort/retry on conflict)—eliminating lock waits and deadlocks.',
    complexity: {
      time: 'O(1) single conditional write under low contention',
      space: '1 extra `version BIGINT` column per row (8 bytes)',
      diskIo: 'Zero lock table overhead; wasted retries only under high hot-row contention',
      guarantees: 'Deadlock-free; safe across stateless HTTP / multi-second human edit workflows',
    },
    useCases: [
      'Stateless web forms, wiki/document editing, shopping cart updates, and HTTP `If-Match: ETag` APIs.',
      'Distributed NoSQL writes (`DynamoDB ConditionExpression`) where long-lived row locks do not exist.',
    ],
    whenNotToUse: [
      'Flash-sale hot inventory SKU with 5,000 writers/sec hitting the exact same row (99% retries cause livelock -> use Pessimistic Lock or Redis atomic `DECR`).',
    ],
    workedExample:
      'User A and User B both load Ticket #9 (`version=3`). User A saves first: `UPDATE tickets SET owner="A", version=4 WHERE id=9 AND version=3` -> `1 row affected`. User B runs with `version=3` -> `0 rows affected` -> API returns `HTTP 409 Conflict`!',
    sqlOrConfigTitle: 'Atomic Compare-And-Swap (CAS) Optimistic Version Update',
    sqlOrConfig: `-- Zero locks held during user think-time or external API calls!
UPDATE inventory
SET stock = stock - 1,
    version = version + 1
WHERE sku = 'LAPTOP-PRO-14'
  AND version = 42
  AND stock >= 1
RETURNING stock, version;
-- If 0 rows returned -> Conflict! Reload latest version & retry with jitter.`,
    animationTitle: 'Step-by-Step: Read -> Validate Version Token -> CAS Commit / Conflict',
    animationSteps: [
      {
        step: 1,
        phase: 'Read Phase',
        title: '1. Both Workers Read Row (stock=5, version=42) Without Locks',
        explanation: 'Zero DB locks held! Workers validate coupons or call payment APIs freely.',
        blocks: [
          { id: 'w1', label: 'Worker A', sublabel: 'Loaded version=42', state: 'active' },
          { id: 'w2', label: 'Worker B', sublabel: 'Loaded version=42', state: 'active' },
          { id: 'db', label: 'DB Row', sublabel: 'stock=5, version=42', state: 'highlight' },
        ],
        metrics: [
          { label: 'DB Locks Held', value: '0' },
          { label: 'Deadlock Risk', value: '0%' },
        ],
      },
      {
        step: 2,
        phase: 'Validation & Write',
        title: '2. Worker A Wins CAS (`v42 -> v43`); Worker B Sees 0 Rows -> Retry',
        explanation: 'Worker A commits cleanly (`version=43`). Worker B’s `WHERE version=42` matches 0 rows—preventing lost update!',
        blocks: [
          { id: 'w1', label: 'Worker A', sublabel: '1 row updated -> OK', state: 'highlight' },
          { id: 'w2', label: 'Worker B', sublabel: '0 rows -> 409 Retry', state: 'warn' },
          { id: 'db', label: 'DB Row', sublabel: 'stock=4, version=43', state: 'active' },
        ],
        metrics: [
          { label: 'Lost Updates', value: '0 (Prevented)' },
          { label: 'Action', value: 'Retry w/ Backoff' },
        ],
      },
    ],
    mermaidDiagram: `sequenceDiagram
  autonumber
  participant A as Worker A
  participant B as Worker B
  participant DB as Database (version=42)
  A->>DB: SELECT stock, version (No Lock) -> (5, v42)
  B->>DB: SELECT stock, version (No Lock) -> (5, v42)
  A->>DB: UPDATE SET stock=4, version=43 WHERE version=42
  DB-->>A: 1 row affected (COMMITTED!)
  B->>DB: UPDATE SET stock=4, version=43 WHERE version=42
  DB-->>B: 0 rows affected (CONFLICT -> Reload v43 & Retry)`,
    completenessNotes:
      'Audit Note: Always add exponential backoff + jitter on OCC retries and cap max retries (e.g. 3–5 attempts) to prevent retry storms under sudden hot-key spikes.',
  },

  /* ===================== 4. RECOVERY & DURABILITY ===================== */
  {
    id: 'algo-aries',
    number: 14,
    domain: 'Recovery & Durability',
    name: 'ARIES Crash Recovery Algorithm (Analysis, Redo, Undo + WAL)',
    shortName: 'ARIES Crash Recovery',
    inventorsOrPaper: 'C. Mohan, Don Haderle, Bruce Lindsay, Hamid Pirahesh & Peter Schwarz (IBM, 1992)',
    usedBy: ['PostgreSQL', 'MySQL InnoDB', 'SQL Server', 'IBM DB2', 'Oracle'],
    plainEnglish:
      'When power is yanked mid-transaction, RAM Buffer Pool vanishes—some committed pages never reached disk, while some uncommitted dirty pages DID reach disk ("Steal / No-Force"). ARIES uses the Write-Ahead Log (WAL) with monotonic LSN numbers to recover to the exact millisecond before power loss in 3 deterministic phases: Analysis -> Redo (repeat history) -> Undo (roll back uncommitted).',
    formalDefinition:
      'A Steal/No-Force physical-to-logical recovery protocol governed by Write-Ahead Logging (WAL), monotonically increasing Log Sequence Numbers (LSN / pageLSN), Repeating History during Redo, and logging Compensation Log Records (CLRs) during Undo so even crashes during recovery remain idempotent.',
    complexity: {
      time: 'O(WAL size since last Checkpoint) — bounded by `checkpoint_timeout` / `max_wal_size`',
      space: 'In-memory Dirty Page Table (DPT) + Active Transaction Table (ATT)',
      diskIo: 'Sequential WAL writes at commit; sequential WAL scan on crash restart',
      guarantees: 'Atomicity + Durability (A & D in ACID) even across repeated crashes during recovery!',
    },
    useCases: [
      'Instant crash survival after sudden power loss, kernel panic, or Kubernetes OOMKill.',
      'Point-In-Time Recovery (PITR) replaying WAL archives up to 1 second before an accidental `DROP TABLE`.',
    ],
    whenNotToUse: [
      'Temporary scratch/staging unlogged tables (`CREATE UNLOGGED TABLE`) where speed beats crash durability.',
    ],
    workedExample:
      'Crash occurs at LSN 500. Tx 1 committed at LSN 480 (dirty page never flushed!). Tx 2 modified Page 9 at LSN 490 (flushed to disk!) and never committed. Restart: (1) Analysis scans from Checkpoint LSN 400 -> finds Tx2 active, Page 7 & 9 dirty. (2) Redo replays LSN 400..500 -> restores Tx1’s Page 7! (3) Undo walks Tx2 backward -> reverts Page 9 & writes CLR!',
    sqlOrConfigTitle: 'PostgreSQL WAL Durability & Checkpoint Recovery Tuning',
    sqlOrConfig: `-- Guarantee fsync WAL durability on commit & bound crash recovery time
SHOW wal_level;                  -- replica or logical (for CDC / PITR)
SHOW synchronous_commit;         -- on (strict durability)
SHOW checkpoint_timeout;         -- 5min..15min (bounds Redo scan window)
SHOW full_page_writes;           -- on (prevents torn 8KB pages after OS crash!)`,
    animationTitle: 'Step-by-Step: Power Loss -> Analysis -> Redo -> Undo + CLR',
    animationSteps: [
      {
        step: 1,
        phase: 'Crash Event',
        title: '1. Sudden Power Loss (Steal / No-Force State)',
        explanation: 'Tx1 committed (in WAL only, lost from RAM). Tx2 uncommitted (dirty page already stolen to disk).',
        blocks: [
          { id: 'wal', label: 'Disk WAL (LSN 400..500)', sublabel: 'Intact on NVMe', state: 'highlight' },
          { id: 'ram', label: 'RAM Buffer Pool', sublabel: 'WIPED ON CRASH', state: 'warn' },
          { id: 'disk', label: 'Data Pages', sublabel: 'Missing Tx1 · Has Uncommitted Tx2', state: 'warn' },
        ],
        metrics: [
          { label: 'Last Checkpoint', value: 'LSN 400' },
          { label: 'Crash Point', value: 'LSN 500' },
        ],
      },
      {
        step: 2,
        phase: 'Phase 1: Analysis',
        title: '2. Analysis: Scan WAL Forward From Last Checkpoint',
        explanation: 'Reconstructs Dirty Page Table (DPT: oldest recLSN) and Active Transaction Table (ATT: identifies Loser Tx2).',
        blocks: [
          { id: 'att', label: 'Active Tx Table', sublabel: 'Tx1=COMMIT · Tx2=LOSER', state: 'active' },
          { id: 'dpt', label: 'Dirty Page Table', sublabel: 'P7(recLSN 450), P9(490)', state: 'highlight' },
        ],
        metrics: [
          { label: 'Winner Txs', value: 'Tx 1' },
          { label: 'Loser Txs', value: 'Tx 2' },
        ],
      },
      {
        step: 3,
        phase: 'Phase 2: Redo',
        title: '3. Redo: Repeat History Forward From Min(recLSN)',
        explanation: 'Reapplies every WAL record where `page.pageLSN < record.LSN`—bringing disk pages back to exact crash state (restoring Tx1!).',
        blocks: [
          { id: 'p7', label: 'Page 7 (Tx1)', sublabel: 'pageLSN < 480 -> REAPPLIED!', state: 'highlight' },
          { id: 'p9', label: 'Page 9 (Tx2)', sublabel: 'pageLSN >= 490 -> Skipped', state: 'idle' },
        ],
        metrics: [
          { label: 'Durability', value: 'Tx1 100% Restored' },
          { label: 'Idempotent', value: 'Yes (via pageLSN)' },
        ],
      },
      {
        step: 4,
        phase: 'Phase 3: Undo',
        title: '4. Undo: Roll Back Loser Tx2 Backward & Log CLR',
        explanation: 'Follows Tx2’s `prevLSN` chain backwards, reverses Page 9, and writes a Compensation Log Record (CLR) so it never undoes twice if power fails again!',
        blocks: [
          { id: 'p7', label: 'Page 7 (Tx1)', sublabel: 'Committed & Durable', state: 'highlight' },
          { id: 'p9', label: 'Page 9 (Reverted)', sublabel: 'Tx2 Rolled Back + CLR Logged', state: 'active' },
        ],
        metrics: [
          { label: 'Atomicity', value: '100% Enforced' },
          { label: 'DB Status', value: 'ONLINE & Clean' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  Crash["Sudden Crash / Power Loss"] --> P1["Phase 1: ANALYSIS<br/>Scan WAL from Checkpoint<br/>Rebuild ATT + Dirty Page Table"]
  P1 --> P2["Phase 2: REDO (Repeat History)<br/>Replay WAL where pageLSN < LSN<br/>Restores All Committed Winners"]
  P2 --> P3["Phase 3: UNDO (Rollback Losers)<br/>Walk Loser prevLSN Backward<br/>Emit Compensation Log Records (CLR)"]
  P3 --> Online["Database Consistent & Online"]`,
    completenessNotes:
      'Audit Note: Remember the WAL Golden Rule: a dirty data page can NEVER be flushed to disk until its WAL log record is safely `fsync()`ed first!',
  },

  /* ===================== 5. DISTRIBUTED & SHARDING ===================== */
  {
    id: 'algo-raft-consensus',
    number: 15,
    domain: 'Distributed & Sharding',
    name: 'Raft Consensus Algorithm (Ongaro & Ousterhout) & Multi-Paxos',
    shortName: 'Raft Consensus',
    inventorsOrPaper: 'Diego Ongaro & John Ousterhout (USENIX ATC 2014)',
    usedBy: ['etcd (Kubernetes)', 'CockroachDB', 'TiKV', 'Consul', 'Kafka KRaft', 'MongoDB'],
    plainEnglish:
      'How do 5 database replicas agree on the exact order of writes even when servers crash or networks split? Raft elects ONE Leader per Term via randomized election timeouts. Every write goes to the Leader, gets replicated to a Majority Quorum (`N/2 + 1`, e.g., 3 of 5), and is committed only after quorum acknowledges—guaranteeing zero split-brain!',
    formalDefinition:
      'A leader-based replicated state machine consensus protocol decomposing agreement into Leader Election (randomized timers + monotonic Terms), Log Replication (`AppendEntries` with `prevLogIndex`/`prevLogTerm` consistency checks), and Safety (only candidates with up-to-date logs win quorum).',
    complexity: {
      time: 'Commit latency = 1 Leader-to-Quorum network RTT',
      space: 'O(Log size) compacted periodically via Raft Snapshots',
      diskIo: '1 sequential fsync per Raft batch on quorum nodes',
      guarantees: 'Linearizability (CP in CAP), survives up to F = (N-1)/2 node failures (e.g. 2 of 5)',
    },
    useCases: [
      'Distributed SQL shards (CockroachDB/TiKV Raft groups) and metadata stores (Kubernetes `etcd`, Kafka `KRaft`).',
      'Leader election, distributed locks, and strongly consistent configuration registries.',
    ],
    whenNotToUse: [
      'Cross-continent high-throughput fire-and-forget writes where 120ms inter-region RTT is unacceptable (use async replication or local quorum).',
    ],
    workedExample:
      '5-node cluster (Quorum = 3). Network splits into [Leader + 1 Follower] (size 2) vs [3 Followers] (size 3). The old Leader can NEVER commit new writes (only 2/5 acks!). Meanwhile the 3-node side elects a new Leader in Term+1 and serves traffic safely with zero split-brain.',
    sqlOrConfigTitle: 'Production Odd-Sized Quorum Sizing Rule (3 or 5 Nodes)',
    sqlOrConfig: `# Quorum Formula: Q = floor(N / 2) + 1  |  Fault Tolerance F = floor((N - 1) / 2)
# N = 3 nodes -> Quorum = 2 -> Survives 1 node failure (Best for 3-AZ regional HA)
# N = 4 nodes -> Quorum = 3 -> Survives 1 node failure (WORSE availability than 3!)
# N = 5 nodes -> Quorum = 3 -> Survives 2 node failures (Maintenance + 1 crash!)
etcdctl endpoint status --write-out=table`,
    animationTitle: 'Step-by-Step: Leader Election -> Quorum Replication -> Split-Brain Defense',
    animationSteps: [
      {
        step: 1,
        phase: 'Election',
        title: '1. Term 4: Randomized Timeout Expires -> Node 1 Wins 3/5 Votes',
        explanation: 'Node 1 transitions Follower -> Candidate, increments Term=4, broadcasts RequestVote, and secures majority (3/5) to become Leader.',
        blocks: [
          { id: 'n1', label: 'Node 1 (LEADER)', sublabel: 'Term 4 · 3/5 Votes', state: 'highlight' },
          { id: 'n2', label: 'Node 2 (Follower)', sublabel: 'Voted Node 1', state: 'active' },
          { id: 'n3', label: 'Node 3 (Follower)', sublabel: 'Voted Node 1', state: 'active' },
          { id: 'n4', label: 'Node 4 (Follower)', sublabel: 'Synced', state: 'idle' },
          { id: 'n5', label: 'Node 5 (Down)', sublabel: 'Unreachable', state: 'warn' },
        ],
        metrics: [
          { label: 'Quorum Size', value: '3 of 5' },
          { label: 'Split-Brain', value: 'Impossible' },
        ],
      },
      {
        step: 2,
        phase: 'Log Replication',
        title: '2. Client Write Appends Log #88 -> Replicated to Quorum -> Committed!',
        explanation: 'Leader writes entry #88 locally and sends `AppendEntries` RPC in parallel. Once 2 followers fsync & ack (3/5 total), Leader commits and replies OK!',
        blocks: [
          { id: 'n1', label: 'Leader (Log #88)', sublabel: 'COMMITTED (3/5)', state: 'highlight' },
          { id: 'n2', label: 'Follower 2 (#88)', sublabel: 'ACK fsynced', state: 'highlight' },
          { id: 'n3', label: 'Follower 3 (#88)', sublabel: 'ACK fsynced', state: 'highlight' },
          { id: 'n4', label: 'Follower 4', sublabel: 'Catches up async', state: 'idle' },
        ],
        metrics: [
          { label: 'Commit RTT', value: '1 Round-Trip' },
          { label: 'Durability', value: 'Survives 2 Crashes' },
        ],
      },
    ],
    mermaidDiagram: `sequenceDiagram
  autonumber
  participant C as Client
  participant L as Raft Leader (Term 4)
  participant F1 as Follower 1
  participant F2 as Follower 2
  participant F3 as Follower 3 (Slow/Partitioned)
  C->>L: SET balance=500
  L->>L: Append Log #88 (Uncommitted)
  par Parallel AppendEntries RPC
    L->>F1: AppendEntries(#88, prevLog=#87)
    L->>F2: AppendEntries(#88, prevLog=#87)
    L--xF3: Network Packet Dropped
  end
  F1-->>L: ACK (fsync OK)
  F2-->>L: ACK (fsync OK)
  Note over L: Majority Quorum (3/5) Reached -> Commit #88!
  L-->>C: 200 OK (Linearizable Commit)`,
    completenessNotes:
      'Audit Note: Always deploy an ODD number of Raft voters (3 or 5 across 3 Availability Zones). Never deploy 2 or 4 voters!',
  },
  {
    id: 'algo-2pc-saga',
    number: 16,
    domain: 'Distributed & Sharding',
    name: 'Two-Phase Commit (2PC) vs. Transactional Outbox & Saga Pattern',
    shortName: '2PC vs Outbox/Saga',
    inventorsOrPaper: 'Jim Gray (1978) / Hector Garcia-Molina & Kenneth Salem (Saga, 1987)',
    usedBy: ['PostgreSQL XA / CockroachDB (2PC)', 'Stripe / Uber / E-Commerce Microservices (Outbox + Saga)'],
    plainEnglish:
      'Need atomic writes across two separate databases? Two-Phase Commit (2PC) asks all participants to lock & vote PREPARE, then broadcasts COMMIT—strong consistency, but if the Coordinator crashes mid-flight, participants stay BLOCKED holding locks! Microservices instead use the Transactional Outbox + Saga pattern: commit locally + publish an event asynchronously, running compensating rollbacks if a downstream step fails.',
    formalDefinition:
      '2PC is a blocking atomic commitment protocol (Phase 1: Prepare/Vote; Phase 2: Global Commit/Abort). Saga replaces global locks with a sequence of local ACID transactions T1..Tn paired with compensating transactions C1..Cn-1 achieving eventual atomicity.',
    complexity: {
      time: '2PC: 2+ network RTTs + coordinator fsync · Saga: 1 local ACID tx per step',
      space: 'Outbox table stores pending events until CDC relay (Debezium) ships to Kafka',
      diskIo: '2PC holds distributed locks across RTTs; Saga holds zero cross-service locks',
      guarantees: '2PC = Strong Atomic Isolation (blocking); Saga = High Availability + Eventual Consistency',
    },
    useCases: [
      '2PC: Multi-shard transactions INSIDE one homogeneous distributed SQL cluster (CockroachDB, Spanner) over fast datacenter networks.',
      'Transactional Outbox + Saga: Cross-microservice checkout (`Order DB` -> `Payment Gateway` -> `Inventory` -> `Shipping`).',
    ],
    whenNotToUse: [
      'Never run XA 2PC across independent microservice databases or third-party REST APIs (one slow service locks every database).',
    ],
    workedExample:
      'Checkout Saga: (1) Order Service atomically writes `orders` row + `outbox_events` row in ONE local Postgres transaction. (2) Debezium CDC streams WAL outbox -> Kafka. (3) Payment succeeds -> Inventory fails (out of stock) -> Saga triggers Compensating Tx `RefundPayment` + `CancelOrder`!',
    sqlOrConfigTitle: 'Transactional Outbox Pattern (Eliminates Dual-Write Race Bug)',
    sqlOrConfig: `-- Single Local ACID Transaction: NEVER do db.commit() followed by kafka.send()!
BEGIN;
  INSERT INTO orders (id, user_id, total_cents, status)
  VALUES ('ord_901', 42, 4500, 'PENDING');

  INSERT INTO outbox_events (id, aggregate_id, topic, payload)
  VALUES (gen_random_uuid(), 'ord_901', 'orders.created', '{"orderId":"ord_901","cents":4500}');
COMMIT;
-- Debezium tails Postgres WAL logical replication -> publishes reliably to Kafka!`,
    animationTitle: 'Step-by-Step: Dual-Write Failure vs. Transactional Outbox + Saga Compensation',
    animationSteps: [
      {
        step: 1,
        phase: 'Local Outbox Commit',
        title: '1. Order Service Commits Order + Outbox Row Atomically',
        explanation: 'Both tables live in the SAME PostgreSQL database—either both commit or neither does. Zero lost Kafka events!',
        blocks: [
          { id: 'db', label: 'Orders DB (ACID)', sublabel: 'Order + Outbox Row', state: 'highlight' },
          { id: 'cdc', label: 'Debezium CDC', sublabel: 'Reads Postgres WAL ->', state: 'active' },
          { id: 'k', label: 'Kafka Topic', sublabel: 'orders.created', state: 'idle' },
        ],
        metrics: [
          { label: 'Dual-Write Bug', value: 'Eliminated' },
          { label: 'Cross-DB Locks', value: '0' },
        ],
      },
      {
        step: 2,
        phase: 'Saga Compensation',
        title: '2. Inventory Out-of-Stock -> Saga Emits Compensating Refund',
        explanation: 'Payment succeeded, but Inventory rejected. Instead of holding distributed locks, Saga runs `RefundPayment` and marks order `CANCELLED`.',
        blocks: [
          { id: 'pay', label: 'Payment Service', sublabel: 'Compensate: Refund $45', state: 'warn' },
          { id: 'inv', label: 'Inventory Service', sublabel: 'Stock=0 (Failed)', state: 'warn' },
          { id: 'ord', label: 'Order Service', sublabel: 'Status -> CANCELLED', state: 'highlight' },
        ],
        metrics: [
          { label: 'Consistency', value: 'Eventual Atomic' },
          { label: 'Availability', value: 'Non-Blocking' },
        ],
      },
    ],
    mermaidDiagram: `sequenceDiagram
  autonumber
  participant Ord as Order Service + DB
  participant CDC as Debezium CDC -> Kafka
  participant Pay as Payment Service
  participant Inv as Inventory Service
  Ord->>Ord: BEGIN ACID (Insert Order + Outbox) COMMIT
  Ord->>CDC: WAL Logical Stream -> orders.created
  CDC->>Pay: Charge $45 (Idempotency-Key)
  Pay-->>CDC: payment.succeeded
  CDC->>Inv: Reserve SKU
  Inv-->>CDC: inventory.failed (Out of Stock)
  CDC->>Pay: Compensate: Refund $45
  CDC->>Ord: Compensate: Mark Order CANCELLED`,
    completenessNotes:
      'Audit Note: Every Saga consumer MUST be idempotent (deduplicate by `event_id` in an `inbox_processed` table) because CDC + Kafka deliver at-least-once.',
  },
  {
    id: 'algo-consistent-hashing',
    number: 17,
    domain: 'Distributed & Sharding',
    name: 'Consistent Hashing with Virtual Nodes (Karger et al.)',
    shortName: 'Consistent Hashing',
    inventorsOrPaper: 'David Karger et al. (MIT STOC 1997) / Amazon Dynamo (2007)',
    usedBy: ['Amazon DynamoDB', 'Apache Cassandra', 'Redis Cluster (16384 Slots)', 'Memcached', 'Akamai CDN'],
    plainEnglish:
      'If you shard data with `hash(key) % N`, adding just 1 server changes N from 4 to 5 and invalidates ~80% of all keys at once (causing a massive database stampede!). Consistent Hashing places both servers and keys on a 0..2^32-1 ring; adding a server moves ONLY `1/N` keys from its immediate neighbor, and Virtual Nodes (vnodes) spread load evenly.',
    formalDefinition:
      'A distributed partitioning scheme mapping nodes and keys onto a cyclic hash space `[0, 2^m)` where key k is owned by the first clockwise node >= h(k), augmented with V virtual tokens per physical node to bound load variance to O(1/sqrt(V)) and restrict key movement to K/N on topology change.',
    complexity: {
      time: 'Shard lookup: O(log(N * V)) binary search over sorted ring array',
      space: 'O(N * V) ring metadata in client/router RAM',
      diskIo: 'Rebalancing moves only ~1/N of dataset instead of ~(N-1)/N',
      guarantees: 'Minimal key disruption on scale-out/failover; uniform distribution via vnodes',
    },
    useCases: [
      'Horizontal sharding of distributed KV/NoSQL databases (Cassandra/DynamoDB) and distributed Redis/Memcached clusters.',
      'Sticky stateful load balancing (routing the same user/session to the same cache node).',
    ],
    whenNotToUse: [
      'Range queries across partition keys (`WHERE user_id BETWEEN 100 AND 200`) — hashing scatters adjacent keys across all shards (use Range Partitioning like CockroachDB/Spanner).',
    ],
    workedExample:
      '10M cached keys across 4 Redis nodes. Naive `hash % 4 -> hash % 5` remaps 8.0M keys (80% cache miss tsunami!). Consistent Hashing adding Node 5 with 150 vnodes remaps only 2.0M keys (20% = 1/5) cleanly from existing nodes.',
    sqlOrConfigTitle: 'Redis Cluster Fixed Hash Slots (16,384 Virtual Buckets)',
    sqlOrConfig: `# Redis Cluster uses CRC16(key) mod 16384 fixed slots (vnode variant):
# Node A: slots 0..5460 | Node B: slots 5461..10922 | Node C: slots 10923..16383
# Use {hash_tags} so multi-key transactions land on the SAME shard!
MSET {user:42}:profile "{...}" {user:42}:cart "[...]"`,
    animationTitle: 'Step-by-Step: Hash Ring Routing & Adding Shard 4 With Minimal Key Movement',
    animationSteps: [
      {
        step: 1,
        phase: 'Ring Lookup',
        title: '1. Hash Key -> Walk Clockwise to Nearest VNode Owner',
        explanation: 'Key "u:42" hashes to angle 110° -> walks clockwise to Shard B (120°). Replication stores copies on next 2 distinct physical nodes (C, A).',
        blocks: [
          { id: 'sa', label: 'Shard A (0°, 180°)', sublabel: 'Owns 270°..360°', state: 'idle' },
          { id: 'sb', label: 'Shard B (120°, 300°)', sublabel: 'KEY u:42 (110°) -> OWNER!', state: 'highlight' },
          { id: 'sc', label: 'Shard C (240°, 60°)', sublabel: 'Replica Copy #2', state: 'active' },
        ],
        metrics: [
          { label: 'Lookup Cost', value: 'O(log(N*V))' },
          { label: 'Load Balance', value: '±5% via VNodes' },
        ],
      },
      {
        step: 2,
        phase: 'Scale-Out',
        title: '2. Add Shard D -> Only 1/4 of Keys Migrate (Zero Stampede!)',
        explanation: 'Inserting Shard D takes only small slices from its clockwise neighbors—75% of keys stay untouched in warm caches!',
        blocks: [
          { id: 'sd', label: 'New Shard D', sublabel: 'Absorbs 25% Keys Only', state: 'highlight' },
          { id: 'stay', label: 'Existing Shards A,B,C', sublabel: '75% Keys Untouched!', state: 'active' },
        ],
        metrics: [
          { label: 'Naive % N Moved', value: '75%–80%' },
          { label: 'Consistent Hash Moved', value: '25% (Optimal 1/N)' },
        ],
      },
    ],
    mermaidDiagram: `flowchart LR
  Key["Key 'user:42' -> Hash = 110°"] --> Ring["Consistent Hash Ring (0°..360°)<br/>With 150 VNodes/Server"]
  Ring -->|"Clockwise Owner"| B["Primary: Shard B (120°)"]
  B -->|"Async/Quorum Copy 1"| C["Replica: Shard C (240°)"]
  C -->|"Async/Quorum Copy 2"| A["Replica: Shard A (360°)"]`,
    completenessNotes:
      'Audit Note: Always map replicas to DISTINCT physical servers / Availability Zones when walking clockwise around a vnode ring so two vnodes of the same host never hold both primary and backup copies.',
  },

  /* ===================== 6. VECTOR & AI INDEXING ===================== */
  {
    id: 'algo-hnsw-ivfpq',
    number: 18,
    domain: 'Vector & AI Indexing',
    name: 'HNSW (Malkov & Yashunin) + IVF-PQ Vector ANN Indexing',
    shortName: 'HNSW & IVF-PQ',
    inventorsOrPaper: 'Yury Malkov & Dmitry Yashunin (2016) / Jégou et al. (PQ, 2011)',
    usedBy: ['pgvector', 'Qdrant', 'Milvus', 'Pinecone', 'Elasticsearch', 'Weaviate', 'Faiss'],
    plainEnglish:
      'Searching 10 million 1,536-dimensional AI embeddings with exact brute-force Cosine distance takes seconds per query. HNSW builds a multi-layer skip-list graph: top layers act like express highways leaping across semantic space, and Layer 0 walks fine-grained local streets to find top-K nearest neighbors in 4ms with 98%+ recall! IVF-PQ clusters vectors into K Voronoi cells and compresses floats 16x–32x for billion-scale RAM savings.',
    formalDefinition:
      'Approximate Nearest Neighbor (ANN) search combining Hierarchical Navigable Small World multi-layer proximity graphs (O(log N) greedy beam search with parameters `M` and `ef_search`) or Inverted File Voronoi partitions with Product Quantization (`IVF-PQ`) trading exactness for sub-10ms latency.',
    complexity: {
      time: 'HNSW Query: O(log N * M * ef_search) (~2–8 ms for 10M vectors)',
      space: 'HNSW: ~1.5x–2x raw vector RAM · IVF-PQ: 10x–32x RAM compression',
      diskIo: 'HNSW stays RAM-resident; DiskANN / IVF-PQ streams efficiently from NVMe',
      guarantees: '95%–99% Recall@10 tunable at query time (`hnsw.ef_search` / `ivfflat.probes`)',
    },
    useCases: [
      'Production RAG (Retrieval-Augmented Generation) semantic search over millions of document chunks.',
      'Hybrid Search combining PostgreSQL `pgvector` HNSW cosine similarity + BM25 keyword Reciprocal Rank Fusion (RRF).',
    ],
    whenNotToUse: [
      'Datasets under ~50,000 vectors (exact SIMD scan takes < 5ms with 100% recall and zero index RAM overhead).',
      'Selective pre-filters returning 0.1% of rows without Iterative HNSW Scan (post-filtering starves top-K results!).',
    ],
    workedExample:
      '1M 1536-dim float32 vectors = 6.1 GB raw. HNSW (`M=16, ef_construction=64`) takes ~8.5 GB RAM and answers top-10 cosine queries in 3.2ms at 98.4% recall. Switching to `halfvec` (fp16) or binary quantization cuts RAM by 2x–32x!',
    sqlOrConfigTitle: 'PostgreSQL pgvector HNSW Index + Query-Time Recall Tuning',
    sqlOrConfig: `-- Build HNSW index on half-precision vectors (50% less RAM, ~same recall!)
CREATE INDEX idx_docs_emb_hnsw
  ON documents USING hnsw ((embedding::halfvec(1536)) halfvec_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Tune recall vs latency per query session:
SET LOCAL hnsw.ef_search = 100;
SELECT id, title, 1 - (embedding <=> $1::vector) AS cosine_sim
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 10;`,
    animationTitle: 'Step-by-Step: HNSW Express Top-Layer Leap -> Fine-Grained Layer-0 Beam Search',
    animationSteps: [
      {
        step: 1,
        phase: 'Layer 2 Express',
        title: '1. Enter Sparse Top Layer (Express Highway)',
        explanation: 'Start at entry node on Layer 2. Take 2 long-range greedy hops that leap across the vector space toward the query embedding.',
        blocks: [
          { id: 'l2', label: 'Layer 2 (Sparse Express)', sublabel: '2 Long Hops -> Local Min', state: 'highlight' },
          { id: 'l1', label: 'Layer 1 (Regional)', sublabel: 'Waiting to Descend', state: 'idle' },
          { id: 'l0', label: 'Layer 0 (All 10M Vectors)', sublabel: 'Waiting', state: 'idle' },
        ],
        metrics: [
          { label: 'Vectors Visited', value: '6 of 10,000,000' },
          { label: 'Elapsed', value: '0.4 ms' },
        ],
      },
      {
        step: 2,
        phase: 'Layer 0 Beam',
        title: '2. Descend to Layer 0 & Expand `ef_search=100` Beam -> Top-K!',
        explanation: 'Drop down to dense Layer 0 right in the target semantic neighborhood, explore closest `ef_search` candidates, and return Top-10 neighbors.',
        blocks: [
          { id: 'l2', label: 'Layer 2', sublabel: 'Done', state: 'idle' },
          { id: 'l1', label: 'Layer 1', sublabel: 'Refined Region', state: 'active' },
          { id: 'l0', label: 'Layer 0 Beam (ef=100)', sublabel: 'Top-10 Recall 98.4%!', state: 'highlight' },
        ],
        metrics: [
          { label: 'Total Latency', value: '3.2 ms (vs 1,800ms scan)' },
          { label: 'Recall@10', value: '98.4%' },
        ],
      },
    ],
    mermaidDiagram: `flowchart TD
  Q["Query Embedding Vector (1536-dim)"] --> L2["HNSW Layer 2 (Sparse Long-Range Links)<br/>Greedy Zoom-In"]
  L2 -->|"Drop to Closest Entry"| L1["HNSW Layer 1 (Medium-Range Links)<br/>Refine Neighborhood"]
  L1 -->|"Drop to Closest Entry"| L0["HNSW Layer 0 (Dense All-Vector Graph)<br/>Beam Search (ef_search=100)"]
  L0 --> TopK["Return Top-K Nearest Neighbors (3.2ms)<br/>Optional Re-Rank with Exact fp32 / BM25 RRF"]`,
    completenessNotes:
      'Audit Note: For filtered vector search (`WHERE tenant_id = X ORDER BY emb <=> q`), enable `pgvector 0.8+ hnsw.iterative_scan = relaxed_order` or partition by `tenant_id` so filters never return fewer than K rows.',
  },
];
