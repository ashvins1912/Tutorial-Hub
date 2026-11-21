export interface DfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number; // SVG coordinate in 800x340 viewBox
  y: number;
  width: number;
  height: number;
  kind: 'client' | 'compute' | 'memory' | 'storage' | 'network' | 'security';
}

export interface DfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
}

export interface VisualAnimationStep {
  stepNumber: number;
  title: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetEdgeId?: string;
  packetLabel?: string;
  simpleEnglish: string;
  algorithmDetail: string;
  metricTag: string;
}

export interface VisualFlowScenario {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  simpleSummary: string;
  standardDefinition: string;
  realWorldApplication: string;
  algorithmName: string;
  complexity: string;
  nodes: DfdNode[];
  edges: DfdEdge[];
  steps: VisualAnimationStep[];
}

export interface ArchitectConcept {
  id: string;
  number: number;
  category: 'Query Engine' | 'Storage & Indexing' | 'Concurrency & ACID' | 'Distributed Systems' | 'Security, CDC & AI';
  title: string;
  relatedFlowId: string;
  simpleEnglish: string;
  standardDefinition: string;
  realWorldApplication: string;
  algorithmDetails: {
    name: string;
    dataStructure: string;
    complexity: string;
    howItWorks: string;
  };
  commonTrap: string;
  clearSolution: string;
  codeExample: string;
}

export interface PracticeValidationRule {
  id: string;
  label: string;
  explanation: string;
  test: (input: string) => boolean;
}

export interface PracticeChallenge {
  id: string;
  number: number;
  difficulty: 'Core' | 'Production' | 'Staff';
  topic: string;
  title: string;
  scenario: string;
  goal: string;
  starterCode: string;
  quickTokens: { label: string; snippet: string }[];
  hints: string[];
  referenceSolution: string;
  whyItWorks: string;
  beforeMetric: string;
  afterMetric: string;
  rules: PracticeValidationRule[];
}

export const VISUAL_FLOW_SCENARIOS: VisualFlowScenario[] = [
  {
    id: 'query-pipeline-dfd',
    title: '5-Stage SQL Query Execution Data Flow (DFD)',
    shortTitle: 'Query Pipeline DFD',
    category: 'Query Execution',
    simpleSummary:
      'Watch how a plain SQL text query travels through a connection pooler, gets checked for grammar and permissions, is turned into the fastest execution plan, and reads 8KB pages from RAM before ever touching disk.',
    standardDefinition:
      'A multi-stage relational query processing pipeline transforming declarative SQL into a physical Volcano/Iterator execution tree backed by a shared buffer pool and system catalog.',
    realWorldApplication:
      'Every PostgreSQL, MySQL, and Oracle production checkout, banking ledger, and SaaS API endpoint executes through this exact 5-stage pipeline thousands of times per second.',
    algorithmName: 'Dynamic Programming Cost-Based Optimization (System-R / Selinger CBO) + Volcano Iterator',
    complexity: 'Plan search O(3^k) pruned via dynamic programming; Index Lookup O(log_B N)',
    nodes: [
      { id: 'client', label: 'App / API Pods', sublabel: '4,000 sockets', x: 20, y: 120, width: 112, height: 64, kind: 'client' },
      { id: 'pooler', label: '1. PgBouncer', sublabel: '50-100 workers', x: 158, y: 120, width: 112, height: 64, kind: 'network' },
      { id: 'parser', label: '2. Lexer/Parser', sublabel: 'SQL -> AST', x: 296, y: 40, width: 118, height: 60, kind: 'compute' },
      { id: 'analyzer', label: '3. Analyzer', sublabel: 'pg_catalog + RLS', x: 296, y: 204, width: 118, height: 60, kind: 'security' },
      { id: 'optimizer', label: '4. CBO Planner', sublabel: 'Histograms & Joins', x: 452, y: 120, width: 126, height: 64, kind: 'compute' },
      { id: 'buffer', label: '5. Buffer Pool', sublabel: '8KB RAM Pages', x: 618, y: 52, width: 146, height: 64, kind: 'memory' },
      { id: 'disk', label: 'NVMe Storage', sublabel: 'Heap + WAL + Index', x: 618, y: 196, width: 146, height: 64, kind: 'storage' },
    ],
    edges: [
      { id: 'e-client-pool', from: 'client', to: 'pooler', label: 'TCP/TLS SQL' },
      { id: 'e-pool-parser', from: 'pooler', to: 'parser', label: 'Worker Slot' },
      { id: 'e-parser-analyzer', from: 'parser', to: 'analyzer', label: 'AST' },
      { id: 'e-analyzer-opt', from: 'analyzer', to: 'optimizer', label: 'Query Tree' },
      { id: 'e-opt-buf', from: 'optimizer', to: 'buffer', label: 'Physical Plan' },
      { id: 'e-buf-disk', from: 'buffer', to: 'disk', label: 'Cache Miss I/O', dashed: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Connection Multiplexing (Transport Layer)',
        activeNodeIds: ['client', 'pooler'],
        activeEdgeIds: ['e-client-pool'],
        packetEdgeId: 'e-client-pool',
        packetLabel: 'SELECT ...',
        simpleEnglish:
          'Instead of letting 4,000 app servers each open a heavy database process (which would exhaust RAM), PgBouncer funnels all traffic onto 50–100 active database workers.',
        algorithmDetail:
          'Transaction-mode multiplexing assigns a backend server process only for the duration of BEGIN..COMMIT, immediately recycling it to the next queued client.',
        metricTag: 'RAM Saved: ~38 GB',
      },
      {
        stepNumber: 2,
        title: 'Tokenizing SQL into an AST (Parser & Lexer)',
        activeNodeIds: ['pooler', 'parser'],
        activeEdgeIds: ['e-pool-parser'],
        packetEdgeId: 'e-pool-parser',
        packetLabel: 'Tokens -> AST',
        simpleEnglish:
          'The database breaks your SQL sentence into keywords, table names, and operators, checking that the grammar is valid—like spell-checking before reading meaning.',
        algorithmDetail:
          'Flex/Bison LALR(1) grammar parser builds an Abstract Syntax Tree (AST) while keeping bind parameters ($1, $2) strictly separated from syntax to prevent SQL injection.',
        metricTag: 'Latency: ~0.08 ms',
      },
      {
        stepNumber: 3,
        title: 'Catalog Validation & RLS Policy Injection (Analyzer)',
        activeNodeIds: ['parser', 'analyzer'],
        activeEdgeIds: ['e-parser-analyzer'],
        packetEdgeId: 'e-parser-analyzer',
        packetLabel: 'Verified Tree',
        simpleEnglish:
          'Now the engine checks its dictionary (pg_catalog) to verify the table exists, column types match, and silently injects Row-Level Security filters so tenants only see their own rows.',
        algorithmDetail:
          'Semantic resolution rewrites views, checks RBAC grants, attaches RLS WHERE predicates into the Query Tree, and validates implicit casts.',
        metricTag: 'Security: RLS Injected',
      },
      {
        stepNumber: 4,
        title: 'Picking the Cheapest Execution Plan (Cost-Based Optimizer)',
        activeNodeIds: ['analyzer', 'optimizer'],
        activeEdgeIds: ['e-analyzer-opt'],
        packetEdgeId: 'e-analyzer-opt',
        packetLabel: 'Lowest Cost Plan',
        simpleEnglish:
          'Think of this as GPS navigation for your data: the optimizer checks table statistics to compare routes (Seq Scan vs. Index-Only Scan, Nested Loop vs. Hash Join) and picks the fastest one.',
        algorithmDetail:
          'Uses pg_statistic histograms, Most Common Values (MCVs), and n_distinct estimates to calculate total_cost = (seq_pages * 1.0) + (random_pages * 1.1) + (tuples * cpu_cost).',
        metricTag: 'Cost: 0.56..14.82',
      },
      {
        stepNumber: 5,
        title: 'Volcano Execution & Buffer Pool RAM Hit',
        activeNodeIds: ['optimizer', 'buffer'],
        activeEdgeIds: ['e-opt-buf'],
        packetEdgeId: 'e-opt-buf',
        packetLabel: 'Next() Tuples',
        simpleEnglish:
          'The Execution Engine pulls rows one-by-one using Next() calls, checking the fast RAM Buffer Pool first. A cache hit returns data in microseconds with zero slow disk reads.',
        algorithmDetail:
          'Buffer Manager hashes (RelFileNode, BlockNumber) into shared_buffers using Clock-Sweep eviction; if an Index-Only Scan hits an all-visible page in the Visibility Map, Heap Fetches = 0.',
        metricTag: 'Buffer Hit: 99.8%',
      },
      {
        stepNumber: 6,
        title: 'Disk Fault Only on Cache Miss (NVMe Storage)',
        activeNodeIds: ['buffer', 'disk'],
        activeEdgeIds: ['e-buf-disk'],
        packetEdgeId: 'e-buf-disk',
        packetLabel: '8KB Page Load',
        simpleEnglish:
          'Only if a requested 8KB page is missing from RAM does the Storage Manager fetch it from NVMe disk into the Buffer Pool. For writes, changes hit the sequential WAL before dirtying RAM.',
        algorithmDetail:
          'Reads fault an 8KB page through the OS page cache into shared_buffers; writes enforce Write-Ahead Logging (fsync to WAL) before background checkpointer flushes.',
        metricTag: 'Total: 0.095 ms (Indexed)',
      },
    ],
  },
  {
    id: 'btree-index-visual',
    title: 'B+ Tree Search & UUIDv7 vs. UUIDv4 Page Split Animation',
    shortTitle: 'B+ Tree Algorithm',
    category: 'Storage & Indexing',
    simpleSummary:
      'See why a B+ Tree finds 1 row out of 1 billion in just 3–4 jumps, and why random UUIDv4 primary keys cause expensive 50/50 page splits while time-ordered UUIDv7 appends cleanly.',
    standardDefinition:
      'A self-balancing m-ary search tree optimized for block storage (8KB–16KB pages) where internal nodes store routing keys and all row pointers/payloads live in doubly-linked leaf pages.',
    realWorldApplication:
      'The core index structure powering PostgreSQL, MySQL InnoDB, Oracle, SQL Server, and SQLite for range queries, ORDER BY sorting, and point lookups.',
    algorithmName: 'B+ Tree Binary-Search Routing & Leaf-Page Split/Append Algorithm',
    complexity: 'Search / Insert / Delete: O(log_B N) — branching factor B ≈ 300–500 keys per 8KB page',
    nodes: [
      { id: 'root', label: 'Root Page (L0)', sublabel: 'Keys: [200 | 600]', x: 325, y: 24, width: 150, height: 56, kind: 'memory' },
      { id: 'int-left', label: 'Internal L1-A', sublabel: '[50 | 120]', x: 115, y: 126, width: 140, height: 56, kind: 'compute' },
      { id: 'int-mid', label: 'Internal L1-B', sublabel: '[310 | 480]', x: 330, y: 126, width: 140, height: 56, kind: 'compute' },
      { id: 'int-right', label: 'Internal L1-C', sublabel: '[720 | 910]', x: 545, y: 126, width: 140, height: 56, kind: 'compute' },
      { id: 'leaf-1', label: 'Leaf Page 1', sublabel: '10..119 (Cold)', x: 40, y: 238, width: 152, height: 62, kind: 'storage' },
      { id: 'leaf-2', label: 'Leaf Page 2', sublabel: '310..479 (Split Risk)', x: 230, y: 238, width: 162, height: 62, kind: 'storage' },
      { id: 'leaf-3', label: 'Leaf Page 3', sublabel: '720..909', x: 428, y: 238, width: 146, height: 62, kind: 'storage' },
      { id: 'leaf-4', label: 'Rightmost Leaf', sublabel: '910..999 (UUIDv7 Hot)', x: 608, y: 238, width: 168, height: 62, kind: 'memory' },
    ],
    edges: [
      { id: 'e-r-l', from: 'root', to: 'int-left', label: '< 200' },
      { id: 'e-r-m', from: 'root', to: 'int-mid', label: '200..599' },
      { id: 'e-r-r', from: 'root', to: 'int-right', label: '>= 600' },
      { id: 'e-il-1', from: 'int-left', to: 'leaf-1', label: 'Ptr' },
      { id: 'e-im-2', from: 'int-mid', to: 'leaf-2', label: 'Ptr' },
      { id: 'e-ir-3', from: 'int-right', to: 'leaf-3', label: 'Ptr' },
      { id: 'e-ir-4', from: 'int-right', to: 'leaf-4', label: 'Append' },
      { id: 'e-l2-l3', from: 'leaf-2', to: 'leaf-3', label: 'Next Leaf', dashed: true },
      { id: 'e-l3-l4', from: 'leaf-3', to: 'leaf-4', label: 'Next Leaf', dashed: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Binary Search Inside Root Page (Hop 1)',
        activeNodeIds: ['root'],
        activeEdgeIds: [],
        simpleEnglish:
          'Every search begins at the Root Page, which stays permanently pinned in RAM. The database runs a fast binary search over ~400 separator keys inside this single 8KB page.',
        algorithmDetail:
          'Target key = 412. Comparing 412 against [200 | 600] routes immediately down the middle pointer (200..599) in O(log2 400) ≈ 9 CPU comparisons.',
        metricTag: 'Depth Hop: 1 of 3',
      },
      {
        stepNumber: 2,
        title: 'Descend to Internal Routing Page (Hop 2)',
        activeNodeIds: ['root', 'int-mid'],
        activeEdgeIds: ['e-r-m'],
        packetEdgeId: 'e-r-m',
        packetLabel: 'Key 412',
        simpleEnglish:
          'Because each page holds hundreds of pointers, just 2 hops narrow down from billions of rows to a few thousand candidates.',
        algorithmDetail:
          'With branching factor B = 400, a 3-level B+ Tree indexes 400^3 = 64,000,000 keys; a 4-level tree indexes 25.6 billion keys.',
        metricTag: 'Depth Hop: 2 of 3',
      },
      {
        stepNumber: 3,
        title: 'Leaf Page Hit & Range Scan via Sibling Links (Hop 3)',
        activeNodeIds: ['int-mid', 'leaf-2', 'leaf-3'],
        activeEdgeIds: ['e-im-2', 'e-l2-l3'],
        packetEdgeId: 'e-im-2',
        packetLabel: 'Fetch Row / INCLUDE',
        simpleEnglish:
          'The leaf page holds the exact key and either a pointer to the table heap or the actual INCLUDE columns (Index-Only Scan). Because leaves are linked sideways, ORDER BY and BETWEEN scan sequentially!',
        algorithmDetail:
          'Doubly-linked leaf sibling pointers allow forward and backward range scans (ORDER BY created_at DESC) without re-traversing the root.',
        metricTag: 'Total Hops: 3 · O(log_B N)',
      },
      {
        stepNumber: 4,
        title: 'The UUIDv4 Trap: Random Mid-Tree Page Split',
        activeNodeIds: ['int-mid', 'leaf-2'],
        activeEdgeIds: ['e-im-2'],
        packetEdgeId: 'e-im-2',
        packetLabel: 'Random UUIDv4',
        simpleEnglish:
          'If you insert random UUIDv4 keys, every new row lands in a random cold leaf page. When that full page splits 50/50, it triggers random disk reads, WAL full-page writes, and fragmented ~69% fill factor.',
        algorithmDetail:
          'Mid-page insertion forces allocating a new 8KB page, copying 50% of tuples, updating sibling links, and propagating a new separator key up to the parent page.',
        metricTag: 'Write Amp: High · Cache Misses',
      },
      {
        stepNumber: 5,
        title: 'The UUIDv7 Fix: Sequential Rightmost Leaf Append',
        activeNodeIds: ['root', 'int-right', 'leaf-4'],
        activeEdgeIds: ['e-r-r', 'e-ir-4'],
        packetEdgeId: 'e-ir-4',
        packetLabel: 'Time-Ordered UUIDv7',
        simpleEnglish:
          'UUIDv7 embeds a millisecond timestamp prefix, so every new insert lands cleanly on the single hot Rightmost Leaf page already in RAM—zero random splits and near-100% cache hit ratio.',
        algorithmDetail:
          'Monotonically increasing inserts keep only the rightmost spine pinned in shared_buffers, cutting B+ Tree WAL volume and random disk IOPS dramatically.',
        metricTag: 'Cache Hit: ~99.9% · Sequential',
      },
    ],
  },
  {
    id: 'lsm-tree-dfd',
    title: 'LSM-Tree Write Path, Bloom Filter & Compaction DFD',
    shortTitle: 'LSM-Tree & Bloom',
    category: 'Storage & Indexing',
    simpleSummary:
      'Discover how Cassandra, RocksDB, and ScyllaDB absorb massive write storms with zero random disk seeks by appending to RAM + CommitLog, then using Bloom Filters to keep reads fast.',
    standardDefinition:
      'A Log-Structured Merge-Tree architecture converting random updates and deletes into sequential disk appends via an in-memory MemTable, immutable sorted SSTables, Bloom Filters, and background compaction.',
    realWorldApplication:
      'Powers high-ingestion telemetry, IoT sensors, messaging platforms (Discord/Instagram activity feeds), RocksDB storage layers, and Apache Cassandra clusters.',
    algorithmName: 'SkipList MemTable + k-Hash Bloom Filter + K-Way Merge Compaction',
    complexity: 'Write O(log M) in RAM + sequential append; Read O(L) SSTables pruned by Bloom Filter',
    nodes: [
      { id: 'writer', label: 'Write Burst', sublabel: '100K writes/sec', x: 18, y: 120, width: 112, height: 64, kind: 'client' },
      { id: 'wal', label: 'CommitLog (WAL)', sublabel: 'Sequential Disk', x: 162, y: 214, width: 132, height: 60, kind: 'storage' },
      { id: 'memtable', label: 'MemTable (RAM)', sublabel: 'Sorted SkipList', x: 162, y: 42, width: 132, height: 62, kind: 'memory' },
      { id: 'l0', label: 'L0 SSTables', sublabel: 'Immutable Flushes', x: 338, y: 42, width: 136, height: 62, kind: 'storage' },
      { id: 'bloom', label: 'Bloom Filters', sublabel: 'In-RAM Bit Array', x: 338, y: 214, width: 136, height: 60, kind: 'compute' },
      { id: 'compact', label: 'Compaction', sublabel: 'K-Way Merge Sort', x: 518, y: 126, width: 124, height: 62, kind: 'compute' },
      { id: 'l1', label: 'L1/L2 SSTables', sublabel: 'Deduped + Clean', x: 668, y: 126, width: 114, height: 62, kind: 'storage' },
    ],
    edges: [
      { id: 'e-w-wal', from: 'writer', to: 'wal', label: '1. Append' },
      { id: 'e-w-mem', from: 'writer', to: 'memtable', label: '2. RAM Insert' },
      { id: 'e-mem-l0', from: 'memtable', to: 'l0', label: '3. Flush' },
      { id: 'e-l0-comp', from: 'l0', to: 'compact', label: 'Merge Runs' },
      { id: 'e-comp-l1', from: 'compact', to: 'l1', label: 'Purge Tombstones' },
      { id: 'e-bloom-l0', from: 'bloom', to: 'l0', label: 'Skip Missing Files', dashed: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Durability First: Sequential CommitLog Append',
        activeNodeIds: ['writer', 'wal'],
        activeEdgeIds: ['e-w-wal'],
        packetEdgeId: 'e-w-wal',
        packetLabel: 'Append Entry',
        simpleEnglish:
          'When a write arrives, the engine does NOT search disk to overwrite old data. It simply appends the write to the end of a sequential log file—the fastest possible disk operation.',
        algorithmDetail:
          'Append-only sequential I/O achieves near hardware max throughput on SSD/NVMe with zero seek latency or page-split amplification.',
        metricTag: 'Disk Seek: 0 · Sequential',
      },
      {
        stepNumber: 2,
        title: 'Sorted In-Memory Buffering (MemTable)',
        activeNodeIds: ['writer', 'memtable'],
        activeEdgeIds: ['e-w-mem'],
        packetEdgeId: 'e-w-mem',
        packetLabel: 'Key + Value',
        simpleEnglish:
          'Simultaneously, the key is inserted into a sorted structure in RAM (MemTable) and the database immediately acknowledges success to the client.',
        algorithmDetail:
          'MemTables are commonly implemented as lock-free concurrent SkipLists or Red-Black Trees supporting O(log M) ordered inserts and range scans.',
        metricTag: 'Write ACK: < 1 ms',
      },
      {
        stepNumber: 3,
        title: 'Immutable Flush to Level-0 SSTable',
        activeNodeIds: ['memtable', 'l0'],
        activeEdgeIds: ['e-mem-l0'],
        packetEdgeId: 'e-mem-l0',
        packetLabel: 'Sorted Flush',
        simpleEnglish:
          'Once the MemTable reaches its size threshold (e.g., 64 MB), it freezes and flushes straight to disk in one clean sequential stream as an immutable Sorted String Table (SSTable).',
        algorithmDetail:
          'Because SSTables are never modified in-place, deletes are written as special "Tombstone" markers rather than erasing older bytes on disk.',
        metricTag: 'Immutable L0 File',
      },
      {
        stepNumber: 4,
        title: 'Fast Reads via In-Memory Bloom Filters',
        activeNodeIds: ['bloom', 'l0'],
        activeEdgeIds: ['e-bloom-l0'],
        packetEdgeId: 'e-bloom-l0',
        packetLabel: 'k-Hash Bit Check',
        simpleEnglish:
          'Because a key might live in any of dozens of SSTables, reads check tiny RAM Bloom Filters first. If a Bloom Filter says "NO", that disk file is 100% skipped without reading disk!',
        algorithmDetail:
          'A probabilistic bit array hashed with k independent functions guarantees zero false negatives and tunable ~1% false positives using ~10 bits per key.',
        metricTag: 'Disk Reads Saved: ~95%',
      },
      {
        stepNumber: 5,
        title: 'Background K-Way Merge Compaction',
        activeNodeIds: ['l0', 'compact', 'l1'],
        activeEdgeIds: ['e-l0-comp', 'e-comp-l1'],
        packetEdgeId: 'e-comp-l1',
        packetLabel: 'Clean SSTable',
        simpleEnglish:
          'In the background, Compaction merges multiple older SSTables together like a giant Merge Sort—keeping only the newest value of each key and finally erasing old deleted tombstones.',
        algorithmDetail:
          'Uses a Min-Heap K-Way Merge across sorted SSTable iterators (Size-Tiered, Leveled, or Time-Window Compaction Strategy) to bound read and space amplification.',
        metricTag: 'Space Reclaimed + Fast Reads',
      },
    ],
  },
  {
    id: 'mvcc-aries-dfd',
    title: 'MVCC Snapshot Isolation, WAL & ARIES Crash Recovery Flow',
    shortTitle: 'MVCC & ARIES WAL',
    category: 'Concurrency & ACID',
    simpleSummary:
      'See how readers and writers never block each other using MVCC row versions (xmin/xmax), and how ARIES replays the Write-Ahead Log in 3 phases to survive sudden power loss with zero data loss.',
    standardDefinition:
      'Multi-Version Concurrency Control paired with Write-Ahead Logging (ARIES) ensuring non-blocking snapshot reads, atomicity, and idempotent crash recovery.',
    realWorldApplication:
      'Enables banking apps, payment ledgers, and high-concurrency e-commerce inventory systems to run live analytics and writes simultaneously without table locks or corrupted balances.',
    algorithmName: 'MVCC Snapshot Visibility (xmin/xmax) + ARIES (Analysis -> Redo -> Undo)',
    complexity: 'Snapshot check O(1) per tuple header; Recovery linear in WAL bytes since last checkpoint',
    nodes: [
      { id: 'tx-read', label: 'Reader Tx (100)', sublabel: 'Snapshot <= 100', x: 20, y: 42, width: 132, height: 60, kind: 'client' },
      { id: 'tx-write', label: 'Writer Tx (101)', sublabel: 'UPDATE bal=400', x: 20, y: 210, width: 132, height: 60, kind: 'client' },
      { id: 'wal-log', label: 'WAL (fsync)', sublabel: 'LSN 501: Tx 101', x: 210, y: 210, width: 134, height: 60, kind: 'storage' },
      { id: 'tuple-v1', label: 'Row v1 (bal=500)', sublabel: 'xmin:80 xmax:101', x: 210, y: 42, width: 146, height: 60, kind: 'memory' },
      { id: 'tuple-v2', label: 'Row v2 (bal=400)', sublabel: 'xmin:101 xmax:∞', x: 410, y: 42, width: 146, height: 60, kind: 'memory' },
      { id: 'vacuum', label: 'Autovacuum / VM', sublabel: 'Reclaim Dead v1', x: 612, y: 42, width: 154, height: 60, kind: 'compute' },
      { id: 'aries', label: 'ARIES Recovery', sublabel: 'Analysis->Redo->Undo', x: 430, y: 210, width: 170, height: 60, kind: 'security' },
    ],
    edges: [
      { id: 'e-r-v1', from: 'tx-read', to: 'tuple-v1', label: 'Reads v1' },
      { id: 'e-w-wal', from: 'tx-write', to: 'wal-log', label: '1. Log First' },
      { id: 'e-wal-v2', from: 'wal-log', to: 'tuple-v2', label: '2. Append v2' },
      { id: 'e-v1-v2', from: 'tuple-v1', to: 'tuple-v2', label: 'Old -> New', dashed: true },
      { id: 'e-v2-vac', from: 'tuple-v2', to: 'vacuum', label: 'Freeze & Clean', dashed: true },
      { id: 'e-wal-aries', from: 'wal-log', to: 'aries', label: 'Crash Replay' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Reader Takes Non-Blocking MVCC Snapshot',
        activeNodeIds: ['tx-read', 'tuple-v1'],
        activeEdgeIds: ['e-r-v1'],
        packetEdgeId: 'e-r-v1',
        packetLabel: 'Sees bal=500',
        simpleEnglish:
          'Transaction 100 starts reading. Instead of locking the row, it takes a lightweight timestamp snapshot showing all changes committed up to ID 100.',
        algorithmDetail:
          'Visibility check verifies xmin (80) is committed and <= snapshot_max, and xmax (101) is not yet visible to snapshot 100.',
        metricTag: 'Read Locks Held: 0',
      },
      {
        stepNumber: 2,
        title: 'Writer Logs Sequentially to WAL Before Touching Data',
        activeNodeIds: ['tx-write', 'wal-log'],
        activeEdgeIds: ['e-w-wal'],
        packetEdgeId: 'e-w-wal',
        packetLabel: 'WAL fsync()',
        simpleEnglish:
          'At the exact same instant, Writer 101 updates the balance to 400. Before modifying any table page, the change is written durably to the Write-Ahead Log.',
        algorithmDetail:
          'WAL protocol guarantees durability without forcing random 8KB heap page writes on every COMMIT.',
        metricTag: 'ACID Durability Locked',
      },
      {
        stepNumber: 3,
        title: 'New Row Version Appended — Zero Blocking',
        activeNodeIds: ['wal-log', 'tuple-v1', 'tuple-v2'],
        activeEdgeIds: ['e-wal-v2', 'e-v1-v2'],
        packetEdgeId: 'e-wal-v2',
        packetLabel: 'xmin:101',
        simpleEnglish:
          'PostgreSQL creates a brand-new version (v2: bal=400) and stamps v1 as expired for future transactions. Reader 100 still cleanly reads v1 (bal=500) without waiting!',
        algorithmDetail:
          'PostgreSQL appends tuples in-heap (xmin/xmax); MySQL InnoDB modifies in-place and pushes v1 into the Undo Rollback Segment.',
        metricTag: 'Readers Never Block Writers',
      },
      {
        stepNumber: 4,
        title: 'Autovacuum Reclaims Dead Tuples & Marks Visibility Map',
        activeNodeIds: ['tuple-v2', 'vacuum'],
        activeEdgeIds: ['e-v2-vac'],
        packetEdgeId: 'e-v2-vac',
        packetLabel: 'All-Visible Bit',
        simpleEnglish:
          'Once Reader 100 finishes, nobody can ever see old v1 again. Background Autovacuum frees that space, advances frozen transaction IDs (preventing 2B TXID wraparound), and enables 0-heap-fetch Index-Only Scans.',
        algorithmDetail:
          'Updates the Visibility Map bit per 8KB page and freezes old xmin values so age(datfrozenxid) stays safely below 2 billion.',
        metricTag: 'Heap Fetches -> 0',
      },
      {
        stepNumber: 5,
        title: 'Power Loss? ARIES Recovers in 3 Deterministic Phases',
        activeNodeIds: ['wal-log', 'aries'],
        activeEdgeIds: ['e-wal-aries'],
        packetEdgeId: 'e-wal-aries',
        packetLabel: 'Analysis->Redo->Undo',
        simpleEnglish:
          'If the server crashes before RAM pages reach disk, ARIES reads the WAL on reboot: Analysis finds what was running, Redo replays all committed changes, and Undo rolls back half-finished writes.',
        algorithmDetail:
          'Compensation Log Records (CLRs) written during Undo guarantee idempotent recovery even if power fails a second time during recovery.',
        metricTag: 'Zero Committed Data Loss',
      },
    ],
  },
  {
    id: 'distributed-quorum-raft',
    title: 'Distributed Quorum (W+R>N), Raft Consensus & Consistent Hashing',
    shortTitle: 'Quorum & Hashing',
    category: 'Distributed Systems',
    simpleSummary:
      'Understand how globally distributed databases stay consistent when servers fail using Raft leader replication, Quorum overlap (W+R>N), and Consistent Hashing rings that move only 1/(N+1) keys when scaling.',
    standardDefinition:
      'Decentralized partitioning and state-machine replication combining virtual-node consistent hashing with majority quorum intersection and Raft consensus.',
    realWorldApplication:
      'Underpins CockroachDB, DynamoDB, Cassandra, TiDB, YugabyteDB, and etcd (Kubernetes state store) across multi-region cloud clusters.',
    algorithmName: 'Consistent Hashing Ring (Virtual Nodes) + Raft Consensus + Quorum Intersection',
    complexity: 'Key routing O(log V) via sorted virtual-node ring; Scale-out migration O(K / N)',
    nodes: [
      { id: 'router', label: 'Coordinator / Client', sublabel: 'Hash(key) on Ring', x: 20, y: 128, width: 140, height: 64, kind: 'client' },
      { id: 'leader', label: 'Node A (Leader)', sublabel: 'Token 0° · Write #1', x: 230, y: 34, width: 150, height: 60, kind: 'compute' },
      { id: 'rep-b', label: 'Node B (Replica)', sublabel: 'Token 120° · Overlap', x: 460, y: 34, width: 156, height: 60, kind: 'memory' },
      { id: 'rep-c', label: 'Node C (Replica)', sublabel: 'Token 240° · Overlap', x: 460, y: 214, width: 156, height: 60, kind: 'memory' },
      { id: 'rep-d', label: 'Node D (New Shard)', sublabel: 'Takes only 1/(N+1)', x: 230, y: 214, width: 156, height: 60, kind: 'network' },
      { id: 'reader', label: 'Quorum Read (R=2)', sublabel: 'W(2)+R(2) > N(3)', x: 648, y: 128, width: 134, height: 64, kind: 'security' },
    ],
    edges: [
      { id: 'e-c-lead', from: 'router', to: 'leader', label: '1. Route Key' },
      { id: 'e-lead-b', from: 'leader', to: 'rep-b', label: '2. Raft Append' },
      { id: 'e-lead-c', from: 'leader', to: 'rep-c', label: '2. Raft Append' },
      { id: 'e-b-read', from: 'rep-b', to: 'reader', label: 'Latest v42' },
      { id: 'e-c-read', from: 'rep-c', to: 'reader', label: 'Latest v42' },
      { id: 'e-d-ring', from: 'rep-d', to: 'rep-c', label: 'Steal 1/(N+1) Range', dashed: true },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Consistent Hashing Ring Routing',
        activeNodeIds: ['router', 'leader'],
        activeEdgeIds: ['e-c-lead'],
        packetEdgeId: 'e-c-lead',
        packetLabel: 'hash(user_42)',
        simpleEnglish:
          'Instead of hash(key) % N (which breaks almost every key when you add a server), keys and servers are placed on a 0..2^32 circle. A key walks clockwise to the first server it meets.',
        algorithmDetail:
          'Each physical server owns 100–256 Virtual Nodes around the ring so data load balances evenly even with heterogeneous hardware.',
        metricTag: 'Routing: O(log V)',
      },
      {
        stepNumber: 2,
        title: 'Raft Majority Replication (Replacing Legacy 2PC)',
        activeNodeIds: ['leader', 'rep-b', 'rep-c'],
        activeEdgeIds: ['e-lead-b', 'e-lead-c'],
        packetEdgeId: 'e-lead-b',
        packetLabel: 'AppendEntries(v42)',
        simpleEnglish:
          'Unlike old 2-Phase Commit (which froze the whole cluster if the coordinator crashed), the Raft Leader replicates log entries to followers and commits as soon as a majority acknowledges.',
        algorithmDetail:
          'With N=3 replicas, W=2 acknowledgments form a quorum. Even if 1 node crashes permanently, the remaining 2 elect a new leader automatically.',
        metricTag: 'Quorum Write: W = 2/3',
      },
      {
        stepNumber: 3,
        title: 'Guaranteed Overlap on Quorum Read (W + R > N)',
        activeNodeIds: ['rep-b', 'rep-c', 'reader'],
        activeEdgeIds: ['e-b-read', 'e-c-read'],
        packetEdgeId: 'e-b-read',
        packetLabel: 'Return v42',
        simpleEnglish:
          'By pigeonhole math, whenever W + R > N (like 2 + 2 > 3 or 3 + 3 > 5), the nodes you read from MUST overlap with at least one node that received the latest write—guaranteeing fresh reads.',
        algorithmDetail:
          'Coordinator compares version timestamps across the R responses, returns the newest value, and triggers background Read Repair on any stale replica.',
        metricTag: 'W + R > N Verified',
      },
      {
        stepNumber: 4,
        title: 'Zero-Storm Cluster Scale-Out (Adding Node D)',
        activeNodeIds: ['rep-d', 'rep-c'],
        activeEdgeIds: ['e-d-ring'],
        packetEdgeId: 'e-d-ring',
        packetLabel: 'Move 1/(N+1) Keys',
        simpleEnglish:
          'When traffic grows and you add Node D onto the ring, it only copies a slice of keys from its immediate neighbor—leaving ~75–90% of the cluster completely untouched.',
        algorithmDetail:
          'Growing from 6 to 7 nodes moves ~85.7% of keys under modulo hashing, versus only 14.3% under Consistent Hashing.',
        metricTag: 'Data Moved: 1/(N+1)',
      },
    ],
  },
  {
    id: 'rls-cdc-rag-dfd',
    title: 'Multi-Tenant RLS + Log-Based CDC Streaming DFD (Zero Dual-Write Drift)',
    shortTitle: 'RLS & CDC Pipeline',
    category: 'Security, CDC & AI',
    simpleSummary:
      'Trace how an enterprise SaaS & AI RAG platform prevents cross-tenant data leaks inside the DB engine via RLS, and keeps Vector DBs, Redis, and Snowflake in perfect sync via WAL-based CDC.',
    standardDefinition:
      'Engine-enforced Row-Level Security combined with logical Write-Ahead Log Change Data Capture (Debezium -> Kafka) eliminating dual-write inconsistencies across polyglot systems.',
    realWorldApplication:
      'Standard architecture for multi-tenant B2B SaaS, FinTech ledgers, and Enterprise AI RAG copilots where Tenant A must never retrieve Tenant B documents or stale embeddings.',
    algorithmName: 'Policy Predicate Injection (RLS) + Logical WAL Decoding Slot (CDC)',
    complexity: 'Single atomic OLTP commit O(1); Asynchronous fan-out decoupled from API latency',
    nodes: [
      { id: 'api', label: 'SaaS / AI API', sublabel: 'SET LOCAL tenant_id', x: 16, y: 124, width: 130, height: 64, kind: 'client' },
      { id: 'pg-rls', label: 'Postgres + RLS', sublabel: 'Atomic Commit + Guard', x: 184, y: 124, width: 142, height: 64, kind: 'security' },
      { id: 'wal-logical', label: 'Logical WAL', sublabel: 'wal_level = logical', x: 364, y: 124, width: 124, height: 64, kind: 'storage' },
      { id: 'debezium', label: 'Debezium + Kafka', sublabel: 'Ordered Event Stream', x: 522, y: 124, width: 132, height: 64, kind: 'network' },
      { id: 'vector', label: 'Vector DB / RAG', sublabel: 'Re-embed & Upsert', x: 678, y: 30, width: 108, height: 56, kind: 'memory' },
      { id: 'redis', label: 'Redis Cache', sublabel: 'Invalidate Keys', x: 678, y: 128, width: 108, height: 56, kind: 'compute' },
      { id: 'olap', label: 'Snowflake OLAP', sublabel: 'Analytics Stream', x: 678, y: 226, width: 108, height: 56, kind: 'storage' },
    ],
    edges: [
      { id: 'e-api-pg', from: 'api', to: 'pg-rls', label: '1. Single Tx' },
      { id: 'e-pg-wal', from: 'pg-rls', to: 'wal-logical', label: '2. WAL Delta' },
      { id: 'e-wal-deb', from: 'wal-logical', to: 'debezium', label: '3. Tail Slot' },
      { id: 'e-deb-vec', from: 'debezium', to: 'vector', label: 'Embed' },
      { id: 'e-deb-red', from: 'debezium', to: 'redis', label: 'Evict' },
      { id: 'e-deb-olap', from: 'debezium', to: 'olap', label: 'Load' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Transaction-Scoped Tenant Context (PgBouncer Safe)',
        activeNodeIds: ['api', 'pg-rls'],
        activeEdgeIds: ['e-api-pg'],
        packetEdgeId: 'e-api-pg',
        packetLabel: 'SET LOCAL tenant',
        simpleEnglish:
          'At the start of every request transaction, the app tells PostgreSQL who the current tenant is using SET LOCAL—and commits ONLY to PostgreSQL, never making fragile extra HTTP calls.',
        algorithmDetail:
          'SET LOCAL automatically clears at COMMIT/ROLLBACK so pooled PgBouncer workers never leak Tenant A credentials into Tenant B requests.',
        metricTag: 'Zero Cross-Tenant Leak',
      },
      {
        stepNumber: 2,
        title: 'Engine-Enforced RLS & Logical WAL Record',
        activeNodeIds: ['pg-rls', 'wal-logical'],
        activeEdgeIds: ['e-pg-wal'],
        packetEdgeId: 'e-pg-wal',
        packetLabel: 'Committed Row',
        simpleEnglish:
          'PostgreSQL automatically enforces tenant isolation on every read/write and appends the committed row change directly to its Logical Write-Ahead Log.',
        algorithmDetail:
          'FORCE ROW LEVEL SECURITY ensures even table owners cannot accidentally bypass the tenant_id policy during raw SELECTs or vector similarity queries.',
        metricTag: 'Atomic Single Write',
      },
      {
        stepNumber: 3,
        title: 'Debezium Tails Replication Slot into Kafka',
        activeNodeIds: ['wal-logical', 'debezium'],
        activeEdgeIds: ['e-wal-deb'],
        packetEdgeId: 'e-wal-deb',
        packetLabel: 'Avro CDC Event',
        simpleEnglish:
          'Debezium reads the committed WAL stream in exact transaction order and publishes events to Kafka. Even if the API server crashed right after commit, no event is ever lost.',
        algorithmDetail:
          'Logical replication slot tracks confirmed_flush_lsn; configure max_slot_wal_keep_size to protect disk if a consumer stays offline.',
        metricTag: 'Zero Dual-Write Drift',
      },
      {
        stepNumber: 4,
        title: 'Parallel Downstream Fan-Out (AI RAG, Cache & Analytics)',
        activeNodeIds: ['debezium', 'vector', 'redis', 'olap'],
        activeEdgeIds: ['e-deb-vec', 'e-deb-red', 'e-deb-olap'],
        packetEdgeId: 'e-deb-vec',
        packetLabel: 'Sync Consumers',
        simpleEnglish:
          'Independent Kafka consumers re-embed updated documents into the AI Vector DB, clear stale Redis cache keys, and stream clean records into Snowflake—all without slowing down the user checkout.',
        algorithmDetail:
          'Idempotent consumer upserts keyed by (entity_id, lsn) guarantee exactly-once state convergence under at-least-once Kafka delivery.',
        metricTag: 'Polyglot Sync Complete',
      },
    ],
  },
];

export const ARCHITECT_CONCEPTS: ArchitectConcept[] = [
  {
    id: 'connection-pooling',
    number: 1,
    category: 'Query Engine',
    title: 'Connection Pooling & Multiplexing (PgBouncer / ProxySQL)',
    relatedFlowId: 'query-pipeline-dfd',
    simpleEnglish:
      'Think of a restaurant with 10 chefs and 500 customers. Instead of hiring 500 chefs (who would crowd the kitchen and crash it), waiters take orders and share the 10 active chefs efficiently.',
    standardDefinition:
      'A middleware layer that decouples client TCP connections from heavyweight database worker processes by multiplexing short-lived transactions over a bounded pool of active backend sessions.',
    realWorldApplication:
      'Used in front of PostgreSQL/MySQL on Kubernetes microservices and serverless runtimes (AWS Lambda, Cloud Run) where thousands of stateless pods connect simultaneously.',
    algorithmDetails: {
      name: 'Transaction-Level Connection Multiplexing (FIFO Wait Queue)',
      dataStructure: 'Bounded Server Pool + Epoll/Libevent Non-Blocking Socket Loop',
      complexity: 'O(1) connection borrow/return per transaction',
      howItWorks:
        'PgBouncer holds thousands of idle client sockets in tiny ~2KB memory buffers and binds one of ~50–100 PostgreSQL backend processes only between BEGIN and COMMIT.',
    },
    commonTrap:
      'Raising PostgreSQL max_connections to 5,000 directly—causes massive OS context-switching overhead, lock-table contention, and OOM crashes under load spikes.',
    clearSolution:
      'Keep PostgreSQL max_connections modest (100–250), put PgBouncer in transaction pooling mode in front, and always use SET LOCAL (never session SET) for per-request variables.',
    codeExample: `# pgbouncer.ini — High-Concurrency Production Baseline
pool_mode = transaction
max_client_conn = 5000
default_pool_size = 80
reserve_pool_size = 15`,
  },
  {
    id: 'cbo-joins',
    number: 2,
    category: 'Query Engine',
    title: 'Cost-Based Query Optimizer (CBO) & Join Algorithms',
    relatedFlowId: 'query-pipeline-dfd',
    simpleEnglish:
      'The database brain that acts like Google Maps: before touching your data, it checks traffic stats (table histograms) to pick the cheapest scan and join strategy.',
    standardDefinition:
      'An algebraic and statistical query planner that enumerates equivalent physical execution trees and selects the plan minimizing estimated I/O and CPU cost units.',
    realWorldApplication:
      'Decides automatically whether an e-commerce query should use an Index-Only Scan + Nested Loop (sub-ms OLTP) or a Hash Join / Merge Join (multi-million-row analytics).',
    algorithmDetails: {
      name: 'System-R Dynamic Programming + Nested Loop / Hash Join / Merge Join',
      dataStructure: 'pg_statistic Histograms, Most Common Values (MCVs), In-Memory Hash Table',
      complexity: 'Nested Loop O(N log M); Hash Join O(N + M); Merge Join O(N + M)',
      howItWorks:
        'Estimates selectivity from column histograms, chooses Nested Loop for small outer + indexed inner, Hash Join for large unindexed equi-joins, and Merge Join when both inputs are pre-sorted.',
    },
    commonTrap:
      'Stale table statistics after bulk imports cause the planner to expect 10 rows when 500,000 exist, triggering a catastrophic Nested Loop storm.',
    clearSolution:
      'Run ANALYZE immediately after bulk loads/index builds, inspect estimated vs. actual rows in EXPLAIN (ANALYZE, BUFFERS), and add extended statistics (CREATE STATISTICS) for correlated columns.',
    codeExample: `CREATE STATISTICS stats_orders_tenant_status (dependencies)
ON tenant_id, status FROM orders;
ANALYZE orders;`,
  },
  {
    id: 'btree-covering',
    number: 3,
    category: 'Storage & Indexing',
    title: 'B+ Tree Indexing, SARGability & Covering Indexes (INCLUDE)',
    relatedFlowId: 'btree-index-visual',
    simpleEnglish:
      'Like a book index that not only tells you the exact page in 3 flips, but also prints the short answer right inside the index so you never have to open the main book at all.',
    standardDefinition:
      'A balanced, disk-block-aligned search tree whose leaf pages store ordered keys and optional non-key INCLUDE payload columns to satisfy queries via Index-Only Scans.',
    realWorldApplication:
      'Turns 1,480 ms full-table scans on 20M-row order tables into 0.095 ms sub-millisecond lookups in production SaaS and e-commerce APIs.',
    algorithmDetails: {
      name: 'B+ Tree Binary Search + Partial Covering Index-Only Scan',
      dataStructure: '8KB/16KB Slotted Pages + Doubly-Linked Leaf Chain + Visibility Map',
      complexity: 'O(log_B N) — 3 to 4 page hops for billions of rows',
      howItWorks:
        'Aligns index leading keys with exact WHERE expressions (SARGable), orders trailing key to match ORDER BY, embeds SELECT columns in INCLUDE, and skips heap lookups whenever the Visibility Map marks a page all-visible.',
    },
    commonTrap:
      'Wrapping an indexed column in a function like WHERE LOWER(email) = ... bypasses a plain B-Tree index completely and triggers a full Seq Scan.',
    clearSolution:
      'Keep predicates SARGable or create a composite partial covering expression index matching the exact function, sort order, and filter.',
    codeExample: `CREATE INDEX CONCURRENTLY idx_orders_email_shipped_covering
ON orders (LOWER(customer_email), created_at DESC)
INCLUDE (order_id, total_amount)
WHERE status = 'SHIPPED';`,
  },
  {
    id: 'lsm-bloom',
    number: 4,
    category: 'Storage & Indexing',
    title: 'LSM-Trees, SSTables, Bloom Filters & Compaction',
    relatedFlowId: 'lsm-tree-dfd',
    simpleEnglish:
      'Instead of erasing and rewriting random pages in a notebook, you write every change quickly on a sticky note pad (RAM), copy full sheets neatly to folders (SSTables), and merge folders later.',
    standardDefinition:
      'An append-optimized storage engine converting random mutations into sequential I/O via an in-memory MemTable, immutable disk SSTables, probabilistic Bloom Filters, and background compaction.',
    realWorldApplication:
      'Drives write-intensive workloads in Apache Cassandra, ScyllaDB, RocksDB, and CockroachDB Pebble (IoT telemetry, chat histories, clickstreams, time-series).',
    algorithmDetails: {
      name: 'SkipList MemTable + k-Hash Bloom Filter + K-Way Merge Compaction',
      dataStructure: 'Concurrent SkipList + Immutable Sorted Blocks + Bit-Array Bloom Filter',
      complexity: 'Sequential Write O(log M); Point Read pruned by Bloom Filter ~O(1) disk hit',
      howItWorks:
        'Writes append to CommitLog + MemTable; full MemTables flush as immutable SSTables; reads check RAM Bloom Filters to avoid scanning SSTables that cannot contain the key; compaction merges runs and drops tombstones.',
    },
    commonTrap:
      'Using Cassandra as a FIFO job queue with frequent DELETEs creates hundreds of thousands of tombstones per partition, triggering JVM GC pauses and TombstoneOverwhelmingException.',
    clearSolution:
      'Never use LSM stores as mutable queues (use Kafka or Postgres SKIP LOCKED). Time-bucket partition keys and use TimeWindowCompactionStrategy (TWCS) with TTL for time-series data.',
    codeExample: `PRIMARY KEY ((tenant_id, bucket_month), created_at, event_id)
WITH compaction = { 'class': 'TimeWindowCompactionStrategy', 'compaction_window_size': 7 };`,
  },
  {
    id: 'wal-aries',
    number: 5,
    category: 'Concurrency & ACID',
    title: 'Write-Ahead Logging (WAL) & ARIES Crash Recovery',
    relatedFlowId: 'mvcc-aries-dfd',
    simpleEnglish:
      'Like a pilot black-box flight recorder: every change is written to an append-only journal on disk before the memory copy is updated, so after any sudden power cut the engine replays the journal cleanly.',
    standardDefinition:
      'A durability protocol requiring sequential log persistence (fsync) prior to dirty-page flush, paired with ARIES three-phase recovery (Analysis, Redo, Undo) for atomic, idempotent restarts.',
    realWorldApplication:
      'Guarantees zero committed transaction loss across PostgreSQL, MySQL InnoDB, SQLite, and enables streaming replication plus Point-in-Time Recovery (PITR).',
    algorithmDetails: {
      name: 'ARIES (Algorithms for Recovery and Isolation Exploiting Semantics)',
      dataStructure: 'Append-Only WAL Segments (LSN-ordered) + Dirty Page Table + Active Tx Table',
      complexity: 'O(WAL bytes since last checkpoint)',
      howItWorks:
        '1. Analysis scans forward from checkpoint to find dirty pages and active transactions. 2. Redo repeats history from earliest RecLSN. 3. Undo rolls back uncommitted losers backward using CLRs.',
    },
    commonTrap:
      'Disabling fsync or synchronous_commit globally on financial ledgers risks silent data corruption or acknowledged payments vanishing on host crash.',
    clearSolution:
      'Keep fsync=on always, tune max_wal_size and checkpoint_completion_target=0.9 to smooth I/O spikes, and ship continuous WAL archives to object storage (pgBackRest) for PITR.',
    codeExample: `pgbackrest --stanza=prod --type=time \\
  --target="2026-11-21 19:22:59+05:30" restore`,
  },
  {
    id: 'mvcc-vacuum',
    number: 6,
    category: 'Concurrency & ACID',
    title: 'MVCC Concurrency, Autovacuum & TXID Wraparound',
    relatedFlowId: 'mvcc-aries-dfd',
    simpleEnglish:
      'Every row edit keeps the previous snapshot around briefly so readers see a calm, consistent photo while writers keep working—then a background cleaner sweeps up old photos.',
    standardDefinition:
      'Multi-Version Concurrency Control maintains multiple physical tuple versions (xmin/xmax in Postgres; Undo Logs in InnoDB) so reads never block writes and writes never block reads.',
    realWorldApplication:
      'Allows live customer traffic and heavy financial reporting to run on the same relational database without read/write lock contention.',
    algorithmDetails: {
      name: 'Snapshot Visibility Horizon + Anti-Wraparound Autovacuum Freezing',
      dataStructure: 'Tuple Headers (xmin/xmax) + Visibility Map + Free Space Map',
      complexity: 'O(1) snapshot visibility evaluation per tuple',
      howItWorks:
        'Transactions compare tuple xmin/xmax against their snapshot bounds. Autovacuum removes tuples dead to all active snapshots and freezes old xmin values before the 32-bit 2B transaction wraparound limit.',
    },
    commonTrap:
      'Leaving an "idle in transaction" session or an abandoned logical replication slot open for days pins the global xmin horizon, causing severe table bloat and risking TXID wraparound write shutdown.',
    clearSolution:
      'Enforce idle_in_transaction_session_timeout = 5min, set max_slot_wal_keep_size, monitor age(datfrozenxid), and tune per-table autovacuum_vacuum_scale_factor = 0.02 on high-churn tables.',
    codeExample: `ALTER SYSTEM SET idle_in_transaction_session_timeout = '5min';
SELECT datname, age(datfrozenxid) FROM pg_database ORDER BY age DESC;`,
  },
  {
    id: 'isolation-ssi',
    number: 7,
    category: 'Concurrency & ACID',
    title: 'ANSI Isolation Levels, Lost Updates & Write Skew (SSI)',
    relatedFlowId: 'mvcc-aries-dfd',
    simpleEnglish:
      'Even when two transactions never touch the exact same row, they can still break a shared business rule (like two on-call doctors both going off duty at the same time). Serializable catches that.',
    standardDefinition:
      'Four ANSI SQL isolation tiers governing visibility of Dirty Reads, Non-Repeatable Reads, Phantom Reads, and Serialization Anomalies (Write Skew), with Serializable Snapshot Isolation (SSI) preventing dependency cycles.',
    realWorldApplication:
      'Protects bank account transfers, ticket/seat reservations, double-spend prevention, and shift-scheduling invariants in mission-critical backends.',
    algorithmDetails: {
      name: 'Serializable Snapshot Isolation (SSI) — RW Anti-Dependency Cycle Detection',
      dataStructure: 'Predicate SIREAD Locks + Transaction Serialization Dependency Graph',
      complexity: 'Tracks lightweight rw-conflicts without blocking readers; aborts only on dangerous 2-edge cycles',
      howItWorks:
        'Monitors when Tx1 reads data later overwritten by Tx2 and vice versa; when a dangerous structure appears, PostgreSQL aborts one transaction with SQLSTATE 40001 so the app safely retries.',
    },
    commonTrap:
      'Reading a user balance into application RAM, subtracting $100 in Java/Node, and running UPDATE accounts SET balance = $new—classic Lost Update race condition.',
    clearSolution:
      'Use single-statement atomic SQL (SET balance = balance - 100 WHERE balance >= 100), pessimistic locking (SELECT ... FOR UPDATE), or ISOLATION LEVEL SERIALIZABLE with retry on 40001.',
    codeExample: `UPDATE accounts
SET balance = balance - 100
WHERE id = $1 AND balance >= 100
RETURNING balance;`,
  },
  {
    id: 'locks-deadlocks',
    number: 8,
    category: 'Concurrency & ACID',
    title: 'Lock Managers, Deadlock Wait-For Graphs & SKIP LOCKED',
    relatedFlowId: 'query-pipeline-dfd',
    simpleEnglish:
      'When Worker A waits for Worker B while Worker B waits for Worker A, neither can move—the engine draws a cycle graph and cancels one to break the freeze. For queues, SKIP LOCKED lets workers grab the next free job instantly.',
    standardDefinition:
      'Hierarchical table/row/advisory locking coordinated by a Lock Manager with cycle-based deadlock detection and non-blocking concurrent queue consumption via FOR UPDATE SKIP LOCKED.',
    realWorldApplication:
      'Powers distributed background job workers, zero-downtime schema deployments, and safe inventory reservation under flash-sale contention.',
    algorithmDetails: {
      name: 'Directed Wait-For Graph DFS Cycle Detection + Lock-Free Queue Skipping',
      dataStructure: 'Hash-Partitioned Lock Table + Directed Wait-For Graph',
      complexity: 'Cycle check runs only after deadlock_timeout (1s) — zero overhead in the common path',
      howItWorks:
        'Orders multi-row updates consistently by primary key to prevent cycles; SKIP LOCKED bypasses already-locked rows so 100 workers pull disjoint jobs with zero lock waits.',
    },
    commonTrap:
      'Running ALTER TABLE without lock_timeout behind a slow analytics query creates an ACCESS EXCLUSIVE lock queue that blocks every incoming production SELECT and drains the connection pool.',
    clearSolution:
      'Always prefix DDL migrations with SET lock_timeout = \'2s\', lock rows in deterministic primary-key order, and use FOR UPDATE SKIP LOCKED for database-backed worker queues.',
    codeExample: `SELECT job_id, payload FROM jobs
WHERE status = 'PENDING'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;`,
  },
  {
    id: 'consistent-hashing',
    number: 9,
    category: 'Distributed Systems',
    title: 'Consistent Hashing & Virtual Nodes vs. Modulo Sharding',
    relatedFlowId: 'distributed-quorum-raft',
    simpleEnglish:
      'Imagine seating guests around a circular table instead of numbering chairs 1 to N. When a new host joins the circle, they only serve the few guests right next to them instead of reshuffling the entire room.',
    standardDefinition:
      'A ring-based hash partitioning algorithm mapping both data keys and multiple virtual instances of each physical node onto a circular 0..2^32 keyspace so scaling relocates only ~1/(N+1) of keys.',
    realWorldApplication:
      'Used in Cassandra, DynamoDB, Redis Cluster, Memcached clients, and CDN edge routing to scale clusters smoothly without cache/rebalance storms.',
    algorithmDetails: {
      name: 'Clockwise Virtual-Node Ring Lookup',
      dataStructure: 'Balanced BST / Sorted Array of Virtual Node Ring Tokens (100–256 vnodes/node)',
      complexity: 'Key lookup O(log V); Cluster resize data movement O(K / (N + 1))',
      howItWorks:
        'Hashes partition key via Murmur3/SHA-256 to a ring position and binary-searches for the next clockwise virtual node token (and next R-1 distinct physical nodes for replicas).',
    },
    commonTrap:
      'Assuming Consistent Hashing fixes a single hot partition key (e.g., celebrity_id = 1)—all requests for that exact key still hash to the same point on the ring!',
    clearSolution:
      'Combine Consistent Hashing with composite time-bucketed or salted partition keys (e.g., tenant_id#0..15) for extreme hot-key workloads.',
    codeExample: `// Write-sharded partition key eliminates single-point ring hotspots
const shardBucket = hash(orderId) % 16;
const partitionKey = \`TENANT#\${tenantId}#SHARD#\${shardBucket}\`;`,
  },
  {
    id: 'quorum-raft',
    number: 10,
    category: 'Distributed Systems',
    title: 'Quorum Consistency (W + R > N) & Raft Consensus',
    relatedFlowId: 'distributed-quorum-raft',
    simpleEnglish:
      'If a club has 5 members, requiring 3 signatures to change a rule and asking 3 members when checking the rule guarantees at least 1 person you ask was in the room when the rule changed.',
    standardDefinition:
      'Fault-tolerant distributed state replication using intersecting read/write quorums (W + R > N) in leaderless systems or majority-log Raft consensus in strongly consistent NewSQL clusters.',
    realWorldApplication:
      'Cassandra/DynamoDB tune W & R per query for latency vs. consistency; CockroachDB, TiDB, YugabyteDB, and etcd use Raft to stay strongly consistent across AZ outages.',
    algorithmDetails: {
      name: 'Quorum Intersection + Raft Leader Election & Log Replication',
      dataStructure: 'Replicated Monotonic Term-Indexed Commit Log',
      complexity: '1 RTT leader-to-majority replication; tolerates f failures with 2f + 1 nodes',
      howItWorks:
        'Raft elects a leader via randomized election timeouts and commits log entries once > N/2 nodes persist them—eliminating the single-coordinator blocking flaw of legacy 2-Phase Commit (2PC).',
    },
    commonTrap:
      'Setting W=2, R=3 on N=5 thinking "that adds up to 5"—because 5 is NOT strictly greater than 5, the read and write replica sets can be completely disjoint and return stale data!',
    clearSolution:
      'Strictly enforce W + R > N (e.g., N=3 -> W=2, R=2; N=5 -> W=3, R=3) for strong consistency, and deploy odd node counts (3 or 5) across independent availability zones for Raft.',
    codeExample: `-- Cassandra strong local consistency on RF=3
CONSISTENCY LOCAL_QUORUM; -- W=2, R=2 => 2 + 2 = 4 > 3 (Strong)`,
  },
  {
    id: 'rls-security',
    number: 11,
    category: 'Security, CDC & AI',
    title: 'Multi-Tenant Row-Level Security (RLS) for SaaS & AI RAG',
    relatedFlowId: 'rls-cdc-rag-dfd',
    simpleEnglish:
      'Instead of hoping every programmer remembers to write "AND tenant_id = current_user" in 500 queries, you lock the safety rule directly inside the database vault itself.',
    standardDefinition:
      'Database-enforced fine-grained authorization policies automatically appended by the Analyzer to every table scan, join, and vector similarity search based on transaction-local session context.',
    realWorldApplication:
      'Essential defense-in-depth for multi-tenant B2B SaaS platforms and Enterprise AI RAG knowledge bases stored in PostgreSQL + pgvector.',
    algorithmDetails: {
      name: 'Query-Tree Security Barrier Predicate Injection',
      dataStructure: 'System Catalog Policy Expressions + Transaction-Scoped GUC (SET LOCAL)',
      complexity: 'Zero extra network hop; pushes tenant_id directly into leading composite index scans',
      howItWorks:
        'Analyzer rewrites every query against an RLS-enabled table to AND the policy expression before execution; pairing with a leading (tenant_id, ...) index keeps queries sub-millisecond.',
    },
    commonTrap:
      'Using session-level SET instead of SET LOCAL behind PgBouncer transaction pooling leaks Tenant A context onto the next request from Tenant B!',
    clearSolution:
      'Enable + FORCE Row-Level Security, set SET LOCAL app.current_tenant_id inside every transaction middleware, and index tenant_id as the leading column.',
    codeExample: `ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_iso ON knowledge_base
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
SET LOCAL app.current_tenant_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';`,
  },
  {
    id: 'cdc-streaming',
    number: 12,
    category: 'Security, CDC & AI',
    title: 'Log-Based Change Data Capture (CDC) vs. Dual Writes',
    relatedFlowId: 'rls-cdc-rag-dfd',
    simpleEnglish:
      'Never try to update two separate databases from your app at the same time—if it crashes in the middle, they permanently disagree. Write once to Postgres and let Debezium stream the WAL to everywhere else.',
    standardDefinition:
      'Asynchronous event streaming that decodes committed transactions directly from the database Write-Ahead Log (wal_level=logical) via Debezium and Kafka to synchronize caches, search, vector DBs, and warehouses.',
    realWorldApplication:
      'Keeps Pinecone/pgvector embeddings, Elasticsearch indexes, Redis caches, and Snowflake analytics in reliable sync with transactional PostgreSQL/MySQL primaries.',
    algorithmDetails: {
      name: 'Logical WAL Decoding (pgoutput) + Offset-Checkpointed Stream Fan-Out',
      dataStructure: 'PostgreSQL Replication Slot + Partitioned Kafka Log',
      complexity: 'Zero extra write latency on OLTP commit; linear sequential log tailing',
      howItWorks:
        'App commits once to Postgres -> WAL records committed delta -> Debezium emits ordered change event -> idempotent downstream consumers update Vector DB, Redis, and Snowflake.',
    },
    commonTrap:
      'Polling SELECT * FROM orders WHERE updated_at > ? every second misses hard DELETEs, adds read load to the primary, and suffers clock-skew gaps.',
    clearSolution:
      'Enable wal_level = logical, deploy Debezium with heartbeat + max_slot_wal_keep_size guardrails, and make downstream Kafka consumers idempotent by (id, lsn).',
    codeExample: `-- PostgreSQL logical CDC setup
ALTER SYSTEM SET wal_level = 'logical';
ALTER SYSTEM SET max_slot_wal_keep_size = '20GB';`,
  },
  {
    id: 'uuidv7-partitioning',
    number: 13,
    category: 'Storage & Indexing',
    title: 'UUIDv7 Primary Keys, Partitioning & Zero-Downtime DDL',
    relatedFlowId: 'btree-index-visual',
    simpleEnglish:
      'Give new rows timestamp-ordered IDs so they stack neatly at the end of the shelf, slice massive tables into monthly drawers you can drop instantly, and never lock live traffic during migrations.',
    standardDefinition:
      'Time-ordered 128-bit identifiers (RFC 9562 UUIDv7) combined with declarative RANGE time-partitioning and non-blocking DDL workflows (CONCURRENTLY + lock_timeout).',
    realWorldApplication:
      'Standard table lifecycle blueprint for high-velocity event logs, payment ledgers, and multi-hundred-million-row SaaS tables.',
    algorithmDetails: {
      name: 'Monotonic B+ Tree Rightmost Append + Partition Pruning + Expand/Contract DDL',
      dataStructure: '48-bit Timestamp Prefix UUIDv7 + Range Partition Metadata Tree',
      complexity: 'Dropping 100M expired rows via DETACH/DROP PARTITION takes O(1) milliseconds vs. hours of DELETE + VACUUM',
      howItWorks:
        'Planner prunes non-matching time partitions at plan time; pg_partman automates monthly creation/retention; CONCURRENTLY builds indexes over 2 snapshots without blocking writes.',
    },
    commonTrap:
      'Running DELETE FROM events WHERE created_at < NOW() - INTERVAL \'90 days\' on 500M rows causes massive WAL spikes, replica lag, and weeks of autovacuum bloat.',
    clearSolution:
      'Partition by RANGE (created_at), detach/drop expired partitions in milliseconds, use UUIDv7 PKs, and enforce SET lock_timeout = \'2s\' + CREATE INDEX CONCURRENTLY.',
    codeExample: `SET lock_timeout = '2s';
ALTER TABLE events DETACH PARTITION events_2025_10 CONCURRENTLY;
DROP TABLE events_2025_10;`,
  },
  {
    id: 'hnsw-hardware-physics',
    number: 14,
    category: 'Security, CDC & AI',
    title: 'pgvector HNSW Indexing, Hardware Physics & PITR',
    relatedFlowId: 'query-pipeline-dfd',
    simpleEnglish:
      'Vector search navigates a multi-layer expressway graph in RAM—if the graph outgrows RAM, speed falls off a cliff. Match memory to working sets, understand OS caching, and test PITR restores.',
    standardDefinition:
      'Hierarchical Navigable Small World (HNSW) approximate nearest-neighbor graph indexing paired with OS/storage tuning (Double Buffering, fsync, TOAST) and continuous-WAL Point-in-Time Recovery.',
    realWorldApplication:
      'Powers hybrid SQL + semantic AI search inside PostgreSQL (pgvector) while maintaining enterprise RPO/RTO disaster recovery guarantees.',
    algorithmDetails: {
      name: 'HNSW Multi-Layer Proximity Graph Search (ef_search / M)',
      dataStructure: 'Layered Skip-Graph of Quantized Embeddings (halfvec fp16 / binary)',
      complexity: 'Approximate Nearest Neighbor search in O(log N) graph hops when RAM-resident',
      howItWorks:
        'Enters top sparse graph layer for coarse leaps, greedily descends to dense bottom layer to refine top-K cosine neighbors; halfvec (fp16) cuts RAM by 50% with negligible recall loss.',
    },
    commonTrap:
      'Indexing 4M float32 1536-dim vectors (~48 GB HNSW graph) on a 32 GB RAM server causes catastrophic random page-fault thrashing and 2,400 ms RAG search latency.',
    clearSolution:
      'Use halfvec(1536) quantization, size RAM so Hot Set + HNSW Index <= 70% of memory, respect Double Buffering (Postgres shared_buffers = 25% RAM), and drill PITR restores quarterly.',
    codeExample: `CREATE INDEX CONCURRENTLY idx_kb_hnsw_halfvec
ON knowledge_base USING hnsw ((embedding::halfvec(1536)) halfvec_cosine_ops)
WITH (m = 16, ef_construction = 64);`,
  },
  {
    id: 'sql-operators-joins-windows',
    number: 15,
    category: 'Query Engine',
    title: 'SQL Operators, 7 Join Patterns, Window Functions & SARGability',
    relatedFlowId: 'query-pipeline-dfd',
    simpleEnglish:
      'SQL is how you ask the database precise questions—filtering with SARGable operators (BETWEEN, IN, EXISTS), combining tables cleanly with the right Join, and ranking rows with Window Functions without collapsing them.',
    standardDefinition:
      'Declarative relational algebra covering predicate pushdown (SARGable filters), inner/outer/anti/self/cross join strategies, CTEs & correlated subqueries, and analytic window frames (OVER PARTITION BY ORDER BY).',
    realWorldApplication:
      'Powers reporting dashboards, leaderboards, deduplication, cohort retention analytics, and multi-table transactional APIs without N+1 query round trips.',
    algorithmDetails: {
      name: 'Predicate Pushdown + Hash/Merge Join + Window Partition Sort',
      dataStructure: 'B+ Tree Index Seek + In-Memory Hash Table + Bounded Sort Buffer',
      complexity: 'O(log N + K) for indexed SARGable filters; O(M + N) for Hash Joins; O(K log K) for Window Sorts',
      howItWorks:
        'Keeps indexed columns bare (never wrapped in LOWER(col) or DATE(col)) so the planner seeks the B+ Tree first, executes Hash/Nested-Loop Joins on the reduced set, then computes ROW_NUMBER/LAG/SUM OVER partitions in one pass.',
    },
    commonTrap:
      'Using NOT IN (subquery) when the subquery can return NULL causes SQL 3-valued logic to silently return 0 rows, and wrapping indexed columns in functions forces full Sequential Scans.',
    clearSolution:
      'Use NOT EXISTS (anti-join) instead of NOT IN, keep WHERE predicates SARGable with range bounds, replace UNION with UNION ALL when rows are disjoint, and use Window Functions instead of self-joins.',
    codeExample: `SELECT u.id, u.name,
       COALESCE(o.status, 'NO_ORDER') AS ord_status,
       ROW_NUMBER() OVER (PARTITION BY u.plan ORDER BY o.amount DESC) AS plan_rank
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2026-01-01' AND u.created_at < '2026-02-01';`,
  },
  {
    id: 'fast-fetch-insert-compression',
    number: 16,
    category: 'Storage & Indexing',
    title: 'Fast Fetch (Keyset Seek) → Bulk Ingest (COPY) & Storage Compression',
    relatedFlowId: 'btree-index-visual',
    simpleEnglish:
      'Reading and loading millions of rows fast means stopping two silent killers: deep OFFSET pagination (which throws away scanned rows) and row-by-row INSERTs (which trigger a network + WAL round-trip per row).',
    standardDefinition:
      'High-throughput ETL and OLTP ingestion combining Keyset (Seek) pagination, covering Index-Only scans, unlogged/batched COPY streaming, deferred index builds, and LZ4/ZSTD/Columnar compression.',
    realWorldApplication:
      'Used in analytics pipelines, multi-million-row migrations, event ingestion, and time-series archival where storage cost and load time must drop by 5×–50×.',
    algorithmDetails: {
      name: 'Keyset B+ Tree Seek + Streaming Bulk COPY + Delta/Dictionary ZSTD Compression',
      dataStructure: 'Covering Composite B+ Tree (INCLUDE) + 8KB TOAST / Columnar Stripes',
      complexity: 'O(log N + page_size) constant-time pagination regardless of page depth; 20×–50× lower WAL amplification on COPY',
      howItWorks:
        'Fetches slices with WHERE (created_at, id) > ($last_ts, $last_id) LIMIT 5000, streams via binary COPY with deferred secondary index creation, and compresses payloads using LZ4 (low-latency OLTP) or Delta+ZSTD (5×–10× smaller columnar archives).',
    },
    commonTrap:
      'Paginating deep exports with OFFSET 500000 scans and discards 500k rows per page, while inserting 100k rows inside a 1-row-per-commit loop stalls on 100k WAL fsync round trips.',
    clearSolution:
      'Switch pagination to Keyset Seek with a composite index, batch writes (1,000–5,000 rows/tx) or use COPY with deferred index creation, and enable LZ4 TOAST or columnar ZSTD compression.',
    codeExample: `-- 1. Fast O(log N) Keyset Fetch
SELECT id, tenant_id, amount FROM orders
WHERE (created_at, id) > ('2026-11-01', 90421)
ORDER BY created_at ASC, id ASC LIMIT 5000;

-- 2. Fast Bulk Ingest + LZ4 Compression
ALTER TABLE events ALTER COLUMN payload SET COMPRESSION lz4;
COPY events (id, tenant_id, payload) FROM STDIN WITH (FORMAT binary);`,
  },
];

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: 'practice-covering-index',
    number: 1,
    difficulty: 'Production',
    topic: 'PostgreSQL Indexing & SARGability',
    title: 'Eliminate a 1,480 ms Seq Scan & Disk Spill on 20M Orders',
    scenario:
      'Endpoint query: SELECT order_id, total_amount, created_at FROM orders WHERE LOWER(customer_email) = $1 AND status = \'SHIPPED\' ORDER BY created_at DESC LIMIT 20;',
    goal:
      'Write a zero-downtime composite partial covering expression index on orders that satisfies LOWER(customer_email), pre-sorts by created_at DESC, includes order_id and total_amount, and filters strictly to SHIPPED rows.',
    starterCode: `-- Write your production index DDL below and run Verification:
CREATE INDEX idx_orders_fix
ON orders (customer_email);`,
    quickTokens: [
      { label: '+ CONCURRENTLY', snippet: 'CREATE INDEX CONCURRENTLY idx_orders_email_shipped_covering' },
      { label: '+ LOWER() + DESC', snippet: 'ON orders (LOWER(customer_email), created_at DESC)' },
      { label: '+ INCLUDE (...)', snippet: 'INCLUDE (order_id, total_amount)' },
      { label: '+ Partial WHERE', snippet: "WHERE status = 'SHIPPED';" },
    ],
    hints: [
      'Use CREATE INDEX CONCURRENTLY so production writes to orders are never blocked during index build.',
      'Wrap customer_email in LOWER(customer_email) inside the index definition and add created_at DESC as the second key to remove the Sort node.',
      'Add INCLUDE (order_id, total_amount) for an Index-Only Scan (Heap Fetches: 0) and WHERE status = \'SHIPPED\' to shrink index RAM.',
    ],
    referenceSolution: `CREATE INDEX CONCURRENTLY idx_orders_email_shipped_covering
ON orders (LOWER(customer_email), created_at DESC)
INCLUDE (order_id, total_amount)
WHERE status = 'SHIPPED';

ANALYZE orders;`,
    whyItWorks:
      'Matches the exact LOWER() expression (making it SARGable), streams rows already sorted by created_at DESC (zero external disk sort), covers all SELECT columns via INCLUDE (Heap Fetches: 0), and keeps the index compact via the partial WHERE clause.',
    beforeMetric: '1,480.12 ms · 184,920 disk reads · 14.2 MB disk spill',
    afterMetric: '0.095 ms · 0 disk reads · 0 heap fetches (15,580× faster)',
    rules: [
      {
        id: 'r-concurrent',
        label: 'Non-blocking CONCURRENTLY build',
        explanation: 'Use CREATE INDEX CONCURRENTLY so live checkout writes are not blocked.',
        test: (s) => /create\s+index\s+concurrently/i.test(s),
      },
      {
        id: 'r-lower',
        label: 'SARGable expression key LOWER(customer_email)',
        explanation: 'Index the exact LOWER(customer_email) expression used in the WHERE predicate.',
        test: (s) => /lower\s*\(\s*customer_email\s*\)/i.test(s),
      },
      {
        id: 'r-sort',
        label: 'Pre-sorted trailing key created_at DESC',
        explanation: 'Include created_at DESC right after the equality key to eliminate external merge disk sort.',
        test: (s) => /created_at\s+desc/i.test(s),
      },
      {
        id: 'r-include',
        label: 'Covering INCLUDE (order_id, total_amount)',
        explanation: 'INCLUDE both non-key SELECT columns so PostgreSQL performs an Index-Only Scan.',
        test: (s) => /include\s*\([^)]*order_id[^)]*total_amount|include\s*\([^)]*total_amount[^)]*order_id/i.test(s),
      },
      {
        id: 'r-partial',
        label: "Partial predicate WHERE status = 'SHIPPED'",
        explanation: "Filter index entries with WHERE status = 'SHIPPED' to keep the hot index lean in RAM.",
        test: (s) => /where\s+status\s*=\s*'shipped'/i.test(s),
      },
    ],
  },
  {
    id: 'practice-rls-rag',
    number: 2,
    difficulty: 'Staff',
    topic: 'Multi-Tenant Security & AI RAG',
    title: 'Lock Down a Multi-Tenant pgvector Knowledge Base with RLS',
    scenario:
      'Your AI RAG table knowledge_base(doc_id, tenant_id, content, embedding) serves 400 enterprise tenants through PgBouncer transaction pooling.',
    goal:
      'Enable Row-Level Security on knowledge_base, create a tenant isolation policy comparing tenant_id to current_setting(\'app.current_tenant_id\'), and show the PgBouncer-safe transaction-local command to set the tenant.',
    starterCode: `-- Harden knowledge_base against cross-tenant vector leaks:
ALTER TABLE knowledge_base ...`,
    quickTokens: [
      { label: '+ ENABLE RLS', snippet: 'ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;' },
      { label: '+ CREATE POLICY', snippet: "CREATE POLICY tenant_isolation ON knowledge_base USING (tenant_id = current_setting('app.current_tenant_id')::UUID);" },
      { label: '+ SET LOCAL', snippet: "SET LOCAL app.current_tenant_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';" },
    ],
    hints: [
      'First turn RLS on with ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY.',
      'Create a policy USING (tenant_id = current_setting(\'app.current_tenant_id\')::UUID).',
      'Use SET LOCAL (never plain SET) so the tenant ID resets cleanly at transaction end inside PgBouncer.',
    ],
    referenceSolution: `ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON knowledge_base
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

SET LOCAL app.current_tenant_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';`,
    whyItWorks:
      'Even if an application query or vector similarity search omits a WHERE clause, the database Analyzer enforces tenant_id isolation automatically, and SET LOCAL prevents session-bleed across PgBouncer connections.',
    beforeMetric: '1 forgotten WHERE clause leaks all 400 tenants’ documents',
    afterMetric: 'Engine-enforced zero-leak tenant isolation across pooled workers',
    rules: [
      {
        id: 'r-enable',
        label: 'Enable Row-Level Security on knowledge_base',
        explanation: 'Run ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY.',
        test: (s) => /alter\s+table\s+knowledge_base\s+enable\s+row\s+level\s+security/i.test(s),
      },
      {
        id: 'r-policy',
        label: 'CREATE POLICY filtering tenant_id via current_setting',
        explanation: "Compare tenant_id to current_setting('app.current_tenant_id') inside CREATE POLICY ... USING (...).",
        test: (s) => /create\s+policy[\s\S]*using\s*\([\s\S]*tenant_id[\s\S]*current_setting/i.test(s),
      },
      {
        id: 'r-set-local',
        label: 'PgBouncer-safe SET LOCAL app.current_tenant_id',
        explanation: 'Use SET LOCAL so the tenant setting clears automatically at COMMIT/ROLLBACK.',
        test: (s) => /set\s+local\s+app\.current_tenant_id/i.test(s),
      },
    ],
  },
  {
    id: 'practice-atomic-lock',
    number: 3,
    difficulty: 'Core',
    topic: 'Concurrency, Lost Updates & Job Queues',
    title: 'Fix a Wallet Lost Update & Build a Non-Blocking Job Queue Query',
    scenario:
      'Two concurrent withdrawals of $100 hit an account with $150 balance at the same millisecond, causing a negative balance. Meanwhile, 50 background workers are deadlocking when claiming pending jobs.',
    goal:
      'Write (1) an atomic SQL UPDATE deducting 100 from accounts only when balance >= 100, and (2) a worker claim SELECT on job_queue using FOR UPDATE SKIP LOCKED.',
    starterCode: `-- 1. Atomic balance deduction (prevent Lost Update):
UPDATE accounts SET balance = ...

-- 2. Non-blocking job worker claim:
SELECT job_id FROM job_queue WHERE status = 'PENDING' ...`,
    quickTokens: [
      { label: '+ Atomic balance - 100', snippet: 'UPDATE accounts SET balance = balance - 100 WHERE id = $1 AND balance >= 100;' },
      { label: '+ FOR UPDATE SKIP LOCKED', snippet: "SELECT job_id FROM job_queue WHERE status = 'PENDING' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1;" },
    ],
    hints: [
      'Avoid reading balance into app code; compute balance = balance - 100 directly in SQL with AND balance >= 100 in the WHERE clause.',
      'For the worker queue, add FOR UPDATE SKIP LOCKED LIMIT 1 so concurrent workers skip claimed rows without waiting.',
    ],
    referenceSolution: `UPDATE accounts
SET balance = balance - 100
WHERE id = $1 AND balance >= 100;

SELECT job_id
FROM job_queue
WHERE status = 'PENDING'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;`,
    whyItWorks:
      'PostgreSQL acquires a row-level lock during the atomic UPDATE and re-evaluates WHERE balance >= 100 on the latest committed tuple—preventing overdrafts. SKIP LOCKED eliminates lock-wait queues across parallel workers.',
    beforeMetric: 'Concurrent double-spend overdrafts + worker lock timeouts',
    afterMetric: 'Strictly atomic ledger + 0 lock waits across 50+ queue workers',
    rules: [
      {
        id: 'r-atomic',
        label: 'Atomic balance = balance - 100 expression',
        explanation: 'Mutate balance relative to its current stored value inside SQL.',
        test: (s) => /set\s+balance\s*=\s*balance\s*-\s*100/i.test(s),
      },
      {
        id: 'r-guard',
        label: 'Balance guard predicate (balance >= 100)',
        explanation: 'Include balance >= 100 in the WHERE clause so concurrent withdrawals cannot overdraft.',
        test: (s) => /balance\s*>=\s*100/i.test(s),
      },
      {
        id: 'r-skip-locked',
        label: 'Non-blocking FOR UPDATE SKIP LOCKED queue claim',
        explanation: 'Add FOR UPDATE SKIP LOCKED so concurrent job workers never block each other.',
        test: (s) => /for\s+update\s+skip\s+locked/i.test(s),
      },
    ],
  },
  {
    id: 'practice-zero-downtime-ddl',
    number: 4,
    difficulty: 'Production',
    topic: 'Zero-Downtime Migrations & Lock Safety',
    title: 'Safely Add a Nullable Column Without Causing a Lock Queue Storm',
    scenario:
      'Last sprint, an ALTER TABLE on the 80M-row orders table waited behind a slow BI query and took down checkout for 6 minutes.',
    goal:
      'Write a safe migration guard that sets a 2-second lock_timeout, adds a nullable promo_code TEXT column to orders, and creates a non-blocking index on promo_code.',
    starterCode: `-- Protect production traffic before running DDL:
ALTER TABLE orders ADD COLUMN promo_code TEXT;`,
    quickTokens: [
      { label: "+ lock_timeout = '2s'", snippet: "SET lock_timeout = '2s';" },
      { label: '+ ADD COLUMN', snippet: 'ALTER TABLE orders ADD COLUMN promo_code TEXT;' },
      { label: '+ CONCURRENTLY Index', snippet: 'CREATE INDEX CONCURRENTLY idx_orders_promo ON orders (promo_code);' },
    ],
    hints: [
      "Start with SET lock_timeout = '2s'; so the DDL aborts cleanly instead of queuing production traffic.",
      'Add promo_code as a nullable column first (instant metadata-only operation in Postgres).',
      'Always build the supporting index with CREATE INDEX CONCURRENTLY.',
    ],
    referenceSolution: `SET lock_timeout = '2s';
ALTER TABLE orders ADD COLUMN promo_code TEXT;
CREATE INDEX CONCURRENTLY idx_orders_promo ON orders (promo_code);`,
    whyItWorks:
      'Setting lock_timeout caps lock-queue waiting to 2 seconds so failed DDL can safely retry with backoff without ever cascading into a PgBouncer outage, and CONCURRENTLY avoids write locks.',
    beforeMetric: '6-minute SEV-1 checkout outage from blocked ACCESS EXCLUSIVE queue',
    afterMetric: 'Zero-downtime deployment · < 2s bounded lock window',
    rules: [
      {
        id: 'r-lock-timeout',
        label: "Guard DDL with SET lock_timeout = '2s'",
        explanation: 'Always bound lock wait time so blocked DDL never stalls incoming OLTP traffic.',
        test: (s) => /set\s+lock_timeout\s*=\s*'?\d+\s*(s|ms)'?/i.test(s),
      },
      {
        id: 'r-add-col',
        label: 'Instant nullable ALTER TABLE ADD COLUMN',
        explanation: 'Add promo_code as nullable first without a full table rewrite.',
        test: (s) => /alter\s+table\s+orders\s+add\s+column\s+promo_code/i.test(s),
      },
      {
        id: 'r-idx-conc',
        label: 'Non-blocking CREATE INDEX CONCURRENTLY',
        explanation: 'Build the new index concurrently to allow uninterrupted reads and writes.',
        test: (s) => /create\s+index\s+concurrently/i.test(s),
      },
    ],
  },
  {
    id: 'practice-mongo-esr',
    number: 5,
    difficulty: 'Core',
    topic: 'NoSQL Query Tuning (MongoDB ESR Rule)',
    title: 'Design an Optimal ESR Compound Index in MongoDB',
    scenario:
      'Slow query: db.orders.find({ status: "SHIPPED", createdAt: { $gte: lastWeek } }).sort({ priority: -1 }).limit(10) is currently examining 500,000 docs (COLLSCAN).',
    goal:
      'Write the db.orders.createIndex({...}) command ordered strictly by the ESR Rule (Equality -> Sort -> Range).',
    starterCode: `db.orders.createIndex({
  createdAt: 1,
  priority: -1,
  status: 1
});`,
    quickTokens: [
      { label: 'Apply ESR Order', snippet: 'db.orders.createIndex({ status: 1, priority: -1, createdAt: 1 });' },
    ],
    hints: [
      'Identify each predicate type: status is Equality (=), priority is Sort (-1), and createdAt ($gte) is Range.',
      'Order keys strictly Equality -> Sort -> Range: status first, priority: -1 second, createdAt third.',
    ],
    referenceSolution: `db.orders.createIndex({ status: 1, priority: -1, createdAt: 1 });`,
    whyItWorks:
      'Putting Equality first narrows the B-Tree slice immediately, Sort second streams documents already ordered by priority DESC (zero blocking in-memory SORT), and Range last filters the date window.',
    beforeMetric: '500,000 docs examined for 10 returned · 1,640 ms COLLSCAN',
    afterMetric: '10 docs examined for 10 returned (1:1 ratio) · 1.8 ms IXSCAN',
    rules: [
      {
        id: 'r-create-index',
        label: 'Uses db.orders.createIndex({...})',
        explanation: 'Call createIndex on the orders collection.',
        test: (s) => /db\.orders\.createIndex\s*\(/i.test(s),
      },
      {
        id: 'r-esr-order',
        label: 'Follows Equality (status) -> Sort (priority: -1) -> Range (createdAt)',
        explanation: 'Ensure status comes before priority: -1, which comes before createdAt.',
        test: (s) => /status\s*:\s*1[\s\S]*priority\s*:\s*-1[\s\S]*createdAt\s*:\s*-?1/i.test(s),
      },
    ],
  },
  {
    id: 'practice-keyset-window',
    number: 6,
    difficulty: 'Production',
    topic: 'DQL Analytics & Keyset Pagination',
    title: 'Replace Slow OFFSET 200000 with Keyset Seek & Rank Top Orders',
    scenario:
      'Your customer timeline API suffers 640 ms latency on deep pages using OFFSET 200000, and needs a single-pass Window Function ranking each customer’s latest orders.',
    goal:
      'Write (1) a Keyset cursor query filtering (created_at, order_id) < ($1, $2) with LIMIT 20 (zero OFFSET), and (2) a ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) ranking expression.',
    starterCode: `-- 1. Fix deep pagination (remove OFFSET!):
SELECT order_id, created_at FROM orders
ORDER BY created_at DESC, order_id DESC
LIMIT 20 OFFSET 200000;

-- 2. Add single-pass customer ranking window function:`,
    quickTokens: [
      { label: '+ Keyset Cursor', snippet: 'WHERE (created_at, order_id) < ($1, $2)' },
      { label: '+ ROW_NUMBER() Window', snippet: 'ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn' },
    ],
    hints: [
      'Delete OFFSET 200000 completely so PostgreSQL never scans and discards 200,000 rows.',
      'Add a tuple seek predicate: WHERE (created_at, order_id) < ($1, $2).',
      'Use ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) to rank each customer’s orders in one pass.',
    ],
    referenceSolution: `SELECT order_id, customer_id, created_at,
       ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
FROM orders
WHERE (created_at, order_id) < ($1, $2)
ORDER BY created_at DESC, order_id DESC
LIMIT 20;`,
    whyItWorks:
      'Tuple seek comparison jumps straight into the composite (created_at DESC, order_id DESC) B+ Tree leaf in O(log N) constant time regardless of page depth, while ROW_NUMBER() computes per-customer ranks in a single ordered pass.',
    beforeMetric: '640 ms at page 10,000 (scans & discards 200,000 rows)',
    afterMetric: '0.4 ms constant time at any depth · single-pass window rank',
    rules: [
      {
        id: 'r-no-offset',
        label: 'Eliminates slow OFFSET pagination',
        explanation: 'Remove OFFSET completely so deep pages never scan and discard prior rows.',
        test: (s) => !/\boffset\b/i.test(s),
      },
      {
        id: 'r-keyset',
        label: 'Uses Keyset tuple comparison (created_at, order_id) < (...)',
        explanation: 'Seek directly past the last seen cursor tuple with a unique tie-breaker.',
        test: (s) => /\(\s*created_at\s*,\s*order_id\s*\)\s*<\s*\(/i.test(s),
      },
      {
        id: 'r-window',
        label: 'Uses ROW_NUMBER() OVER (PARTITION BY customer_id ...)',
        explanation: 'Apply a window function partitioned by customer_id to rank in a single pass.',
        test: (s) => /row_number\s*\(\s*\)\s+over\s*\([\s\S]*partition\s+by\s+customer_id/i.test(s),
      },
    ],
  },
];
