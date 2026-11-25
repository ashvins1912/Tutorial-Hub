import { AlgorithmDefinition } from './algorithmsCatalog';
import { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';
import { hydrateMasterAlgorithms, hydrateMasterPractice } from './algorithmMasterMetadata';

export const MASTER_SYSTEMS_11_ALGORITHMS: AlgorithmDefinition[] = hydrateMasterAlgorithms([
  // #63 B+ Tree Page Splitting & Merging
  {
    id: 'bplus-tree-storage',
    name: 'B+ Tree Page Splitting, Merging & Leaf Range Scans',
    shortName: 'B+ Tree Storage',
    category: 'Database Storage & Query Engines',
    difficulty: 'Advanced',
    visualType: 'tree-structure',
    tagline: 'Pack hundreds of keys into 4–16 KB disk pages so 100M rows live at tree height 3–4—and chain all leaves together for ultra-fast sequential SQL range scans.',
    timeComplexity: 'O(log_B N) disk I/Os',
    spaceComplexity: 'O(N) pages',
    mentalModel:
      'Unlike binary trees that waste 20+ random disk seeks, a B+ Tree has huge fanout B≈500: internal pages store ONLY routing keys (no row payloads!), while all actual rows sit in doubly-linked leaf pages at identical depth.',
    coreInvariant:
      'Every non-root page stays ≥ 50% full (`⌈B/2⌉` keys); when a leaf overflows past B−1 keys, split it in half and COPY the right-leaf minimum key up to the parent (internal splits PUSH the middle key up).',
    whenToUse: [
      'OLTP relational database primary/secondary indexes: PostgreSQL, MySQL InnoDB, SQLite, Oracle, SQL Server.',
      'Read-heavy workloads with point lookups AND `WHERE created_at BETWEEN t1 AND t2` range scans.',
      'Filesystem directory & extent metadata (ext4, XFS, NTFS, APFS).',
    ],
    whenItFails:
      'Random-key high-ingestion write storms cause random 16 KB page writes (write amplification & page splits)—for massive write-heavy workloads, switch to an LSM-Tree (RocksDB / Cassandra).',
    linkedTopics: ['Trees DFS/BFS', 'Modified Binary Search'],
    linkedProblemSlugs: ['binary-search-classic', 'validate-binary-search-tree'],
    templates: {
      python: `# Leaf split: COPY separator key up so every data record still lives at leaf level!
def split_leaf(keys, max_keys):
    mid = len(keys) // 2
    left, right = keys[:mid], keys[mid:]
    promoted_sep = right[0]   # copied up to parent router
    return left, promoted_sep, right`,
      js: `function bPlusTreeSplitInsert(keys, maxKeys = 3) {
  // Simulates single-level -> 2-level B+ tree leaf splitting & leaf-chain range scan
  let leaves = [[]];
  let separators = [];
  for (const k of keys) {
    let idx = 0;
    while (idx < separators.length && k >= separators[idx]) idx++;
    const leaf = leaves[idx];
    leaf.push(k);
    leaf.sort((a, b) => a - b);
    if (leaf.length > maxKeys) {
      const mid = Math.ceil(leaf.length / 2);
      const right = leaf.splice(mid);
      leaves.splice(idx + 1, 0, right);
      separators.splice(idx, 0, right[0]);
    }
  }
  return { separators, leaves };
}`,
      java: `// InnoDB uses 16 KB B+ Tree pages (fanout ~500) -> 500^3 = 125,000,000 rows in only 3 hops!`,
    },
    frames: [
      {
        step: 1,
        title: 'Fill Single Leaf Page (maxKeys = 3)',
        explanation: 'Insert keys [10, 20, 30] into Leaf 0. Page fits 3/3 keys cleanly with 0 splits.',
        invariantCheck: 'All rows stored sequentially inside leaf page.',
        variables: [{ name: 'maxKeys', value: '3' }, { name: 'leaf0', value: '[10, 20, 30]' }],
        array: ['L0:[10,20,30]'],
        matchedIndices: [0],
      },
      {
        step: 2,
        title: 'Insert 40 → Leaf Overflow Triggers 50/50 Page Split!',
        explanation: 'Leaf [10, 20, 30, 40] overflows! Split into L0:[10, 20] and L1:[30, 40], COPY separator 30 up to Root, and link L0 ↔ L1!',
        invariantCheck: 'Separator 30 stays in L1 so range scans NEVER backtrack up to internal nodes.',
        variables: [{ name: 'rootSep', value: '[30]' }, { name: 'L0', value: '[10,20]' }, { name: 'L1', value: '[30,40]' }],
        array: ['Root:[30]', 'L0:[10,20]', 'L1:[30,40]'],
        highlightIndices: [0],
        matchedIndices: [1, 2],
      },
      {
        step: 3,
        title: 'Insert 50, 60 → Second Split Promotes Separator 50',
        explanation: 'L1 overflows [30,40,50,60] → splits into [30,40] & [50,60]; Root becomes [30, 50].',
        invariantCheck: 'All 3 leaves remain at exact equal depth 2.',
        variables: [{ name: 'rootSep', value: '[30, 50]' }, { name: 'leaves', value: '3 linked pages' }],
        array: ['Root:[30,50]', 'L0:[10,20]', 'L1:[30,40]', 'L2:[50,60]'],
        matchedIndices: [0, 1, 2, 3],
      },
      {
        step: 4,
        title: 'Range Query BETWEEN 15 AND 55 Walks Leaf Chain!',
        explanation: '1 root binary search lands at L0 (20), then follows leaf sibling pointers L0 → L1 → L2 without ever re-traversing Root!',
        invariantCheck: 'O(log_B N + K/B) sequential page reads.',
        variables: [{ name: 'range', value: '[20,30,40,50]' }],
        array: ['20', '30', '40', '50'],
        matchedIndices: [0, 1, 2, 3],
      },
    ],
    platformDrills: [
      { platform: 'Database Internals', title: 'PostgreSQL / InnoDB Clustered B+ Index', difficulty: 'Hard', whyThisFits: 'Explains why UUIDv4 random keys cause 50% page-split fragmentation vs ULID/Snowflake.' },
    ],
  },

  // #64 LSM-Tree Flushing & Compaction (Size-Tiered & Leveled)
  {
    id: 'lsm-tree-compaction',
    name: 'LSM-Tree Flushing & Compaction (STCS & Leveled)',
    shortName: 'LSM-Tree Compaction',
    category: 'Database Storage & Query Engines',
    difficulty: 'Advanced',
    visualType: 'stream-partition',
    tagline: 'Convert random writes into blazing-fast sequential appends via WAL + in-memory MemTable + immutable SSTables merged in background compaction.',
    timeComplexity: 'O(log M) write · O(L) read (with Bloom)',
    spaceComplexity: 'O(N) + compaction headroom',
    mentalModel:
      'Never hunt for an old slot on disk when writing! Append to a sequential WAL, sort in RAM (MemTable), flush whole sorted files (SSTables) to disk, and merge/deduplicate older files in the background using K-Way Merge!',
    coreInvariant:
      'Newest-Wins Read Precedence: check MemTable → L0 SSTables (newest first) → L1 → L2; deletes write a special TOMBSTONE marker that is physically purged only during bottom-level compaction.',
    whenToUse: [
      'Write-heavy NoSQL, time-series, and distributed KV engines: RocksDB, LevelDB, Apache Cassandra, ScyllaDB, CockroachDB Pebble, HBase.',
      'SSD-friendly sequential I/O with superior compression (sorted immutable SSTables pack 3–5× smaller than half-empty B+ pages).',
      'Combined with Bloom Filters per SSTable to avoid checking levels that lack the key!',
    ],
    whenItFails:
      'High read amplification on range scans across many L0 overlapping files and compaction I/O spikes (latency jitter); B+ Trees often beat LSM-Trees on pure read-heavy transactional point/range workloads.',
    linkedTopics: ['Heaps & Intervals', 'Modified Binary Search'],
    linkedProblemSlugs: ['merge-k-sorted-lists', 'lru-cache'],
    templates: {
      python: `# LSM Compaction merges multiple sorted SSTables keeping ONLY the newest version per key!
def compact_sstables(newer_run, older_run):
    merged = dict(older_run)
    merged.update(newer_run)  # newer overwrites older (including TOMBSTONE deletes)
    return sorted((k, v) for k, v in merged.items() if v != "__TOMBSTONE__")`,
      js: `function lsmCompactAndQuery(memtable, sstables, queryKeys) {
  // sstables ordered newest -> oldest; "__DEL__" represents a tombstone
  const lookup = (k) => {
    if (Object.prototype.hasOwnProperty.call(memtable, k)) {
      return memtable[k] === '__DEL__' ? null : memtable[k];
    }
    for (const sst of sstables) {
      if (Object.prototype.hasOwnProperty.call(sst, k)) {
        return sst[k] === '__DEL__' ? null : sst[k];
      }
    }
    return null;
  };
  // Compact all layers into a single deduplicated sorted SSTable dropping tombstones
  const compacted = {};
  for (let i = sstables.length - 1; i >= 0; i--) Object.assign(compacted, sstables[i]);
  Object.assign(compacted, memtable);
  const liveEntries = Object.entries(compacted)
    .filter(([, v]) => v !== '__DEL__')
    .sort((a, b) => a[0].localeCompare(b[0]));
  return { results: queryKeys.map(lookup), compacted: liveEntries };
}`,
      java: `// Size-Tiered Compaction (Cassandra): lower write-amp, higher space-amp (up to 50%).
// Leveled Compaction (RocksDB): non-overlapping key ranges per level L1+, lower space-amp (~10%).`,
    },
    frames: [
      {
        step: 1,
        title: 'Write Path: Append WAL + Insert Sorted MemTable (SkipList)',
        explanation: 'Put(k1=v2) and Delete(k2="__DEL__") append sequentially to WAL and update RAM MemTable in microseconds!',
        invariantCheck: 'Zero random disk seeks on the write hot path.',
        variables: [{ name: 'MemTable', value: '{k1:v2, k2:DEL}' }, { name: 'WAL', value: 'fsynced ✓' }],
        array: ['WAL(seq)', 'MemTable:{k1:v2,k2:†}', 'L0:{k1:v1,k2:old,k3:v9}'],
        matchedIndices: [0, 1],
      },
      {
        step: 2,
        title: 'Flush Full MemTable → Immutable L0 SSTable + Bloom Filter',
        explanation: 'When MemTable hits 64 MB, freeze & flush to L0 disk file with an attached Bloom Filter and sparse key index.',
        invariantCheck: 'SSTables are strictly immutable after creation.',
        variables: [{ name: 'L0_new', value: '{k1:v2, k2:†}' }, { name: 'L0_old', value: '{k1:v1, k2:old, k3:v9}' }],
        array: ['L0_new:{k1:v2,k2:†}', 'L0_old:{k1:v1,k2:old,k3:v9}'],
        highlightIndices: [0, 1],
      },
      {
        step: 3,
        title: 'Read Path Consults Newest Layer First',
        explanation: 'Get(k1) finds v2 in L0_new and stops immediately. Get(k2) hits tombstone `†` and returns NULL without exposing stale L0_old!',
        invariantCheck: 'Bloom filters skip any SSTable guaranteed not to contain the key.',
        variables: [{ name: 'get(k1)', value: 'v2' }, { name: 'get(k2)', value: 'null (tombstone)' }, { name: 'get(k3)', value: 'v9' }],
        array: ['k1→v2', 'k2→null', 'k3→v9'],
        matchedIndices: [0, 2],
        eliminatedIndices: [1],
      },
      {
        step: 4,
        title: 'Background K-Way Compaction Purges Stale Keys & Tombstones',
        explanation: 'Merge L0_new + L0_old → single clean L1 SSTable `[[k1,v2], [k3,v9]]`. Reclaims disk space & eliminates read amplification!',
        invariantCheck: 'Leveled compaction ensures disjoint key ranges at L1+ (at most 1 file checked per level!).',
        variables: [{ name: 'L1_compacted', value: '[(k1,v2),(k3,v9)]' }],
        array: ['L1: k1=v2', 'L1: k3=v9'],
        matchedIndices: [0, 1],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Design RocksDB / Cassandra Storage Engine', difficulty: 'Hard', whyThisFits: 'End-to-end RUM conjecture (Read vs Update vs Memory trade-off).' },
    ],
  },

  // #65 External K-Way Merge Sort
  {
    id: 'external-kway-merge',
    name: 'External K-Way Merge Sort (Disk-Bounded Sorting)',
    shortName: 'External K-Way Sort',
    category: 'Database Storage & Query Engines',
    difficulty: 'Core',
    visualType: 'heap-intervals',
    tagline: 'Sort 100 GB of data using only 1 GB of RAM by sorting RAM-sized chunks to disk, then streaming K runs through a size-K Min-Heap!',
    timeComplexity: 'O(N log N) CPU · O((N/B) log_K (N/M)) I/Os',
    spaceComplexity: 'O(M) RAM buffer',
    mentalModel:
      'Sort 100 GB into 100 sorted 1 GB files on disk; open all 100 files simultaneously with tiny input buffers, keep the front element of each file in a Min-Heap of size 100, and stream the global minimum straight to disk!',
    coreInvariant:
      'At every step, the Min-Heap holds the smallest unconsumed element from each of the K active sorted runs—so popping the heap root ALWAYS produces the next globally smallest item in O(log K).',
    whenToUse: [
      'SQL `ORDER BY`, `GROUP BY`, `CREATE INDEX`, and Sort-Merge Join when data exceeds RAM.',
      'MapReduce shuffle-and-sort phase, LSM-Tree SSTable compaction, and Hadoop/Spark external spill sorting.',
      'LC 23 Merge k Sorted Lists — the exact in-memory core of External K-Way Merge!',
    ],
    whenItFails:
      'If K exceeds available open file descriptors or RAM cannot hold 1 page per run (K > M/B − 1), perform multi-pass merges (each pass reduces run count by fan-in factor K).',
    linkedTopics: ['Heaps & Intervals'],
    linkedProblemSlugs: ['merge-k-sorted-lists', 'kth-largest-in-stream'],
    templates: {
      python: `import heapq
def external_kway_merge(runs: list[list[int]]) -> list[int]:
    heap = [(run[0], r_idx, 0) for r_idx, run in enumerate(runs) if run]
    heapq.heapify(heap)
    out = []
    while heap:
        val, r_idx, idx = heapq.heappop(heap)
        out.append(val)
        if idx + 1 < len(runs[r_idx]):
            heapq.heappush(heap, (runs[r_idx][idx + 1], r_idx, idx + 1))
    return out`,
      js: `function externalKWayMerge(data, chunkSize) {
  // Phase 1: Sort RAM-bounded runs
  const runs = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    runs.push(data.slice(i, i + chunkSize).sort((a, b) => a - b));
  }
  // Phase 2: K-way streaming merge via min-selection over K run heads
  const ptrs = new Array(runs.length).fill(0);
  const out = [];
  while (true) {
    let bestRun = -1, bestVal = Infinity;
    for (let r = 0; r < runs.length; r++) {
      if (ptrs[r] < runs[r].length && runs[r][ptrs[r]] < bestVal) {
        bestVal = runs[r][ptrs[r]];
        bestRun = r;
      }
    }
    if (bestRun === -1) break;
    out.push(bestVal);
    ptrs[bestRun]++;
  }
  return { runCount: runs.length, sorted: out };
}`,
      java: `// With 1 GB RAM and 64 KB disk blocks, 1-pass merge handles up to ~16,000 runs (>10 TB in just 2 passes)!`,
    },
    frames: [
      {
        step: 1,
        title: 'Phase 1: Split 9 Disk Records into RAM Chunks (M=3) & Sort',
        explanation: 'Input [9,2,7, 4,1,8, 6,3,5] → 3 sorted disk runs: R0:[2,7,9], R1:[1,4,8], R2:[3,5,6].',
        invariantCheck: 'Memory usage never exceeds chunkSize=3 during Phase 1.',
        variables: [{ name: 'R0', value: '[2,7,9]' }, { name: 'R1', value: '[1,4,8]' }, { name: 'R2', value: '[3,5,6]' }],
        array: ['R0:[2,7,9]', 'R1:[1,4,8]', 'R2:[3,5,6]'],
        highlightIndices: [0, 1, 2],
      },
      {
        step: 2,
        title: 'Phase 2: Seed Size-K Min-Heap with Run Heads',
        explanation: 'Heap loads 1 item per run: [(1, R1), (2, R0), (3, R2)]. Pop 1 → write to output buffer, pull next item 4 from R1.',
        invariantCheck: 'Heap size strictly ≤ K=3 at all times.',
        variables: [{ name: 'heap', value: '[1(R1), 2(R0), 3(R2)]' }, { name: 'out', value: '[1]' }],
        array: [1, 2, 3],
        matchedIndices: [0],
      },
      {
        step: 3,
        title: 'Stream Next Minimums: 2, 3, 4, 5...',
        explanation: 'Each pop takes O(log K) and refills only from the popped run’s sequential read buffer.',
        invariantCheck: 'Sequential disk I/O maximizes SSD/HDD throughput.',
        variables: [{ name: 'heap', value: '[4(R1), 5(R2), 7(R0)]' }, { name: 'out', value: '[1,2,3,4,5]' }],
        array: [1, 2, 3, 4, 5],
        matchedIndices: [0, 1, 2, 3, 4],
      },
      {
        step: 4,
        title: 'All K Runs Drained → Globally Sorted Disk Output',
        explanation: 'Emitted [1, 2, 3, 4, 5, 6, 7, 8, 9] with bounded RAM and sequential I/O!',
        invariantCheck: 'Optimal I/O complexity O((N/B) log_{M/B} (N/M)).',
        variables: [{ name: 'sorted', value: '[1..9]' }, { name: 'passes', value: '2' }],
        array: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        matchedIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '23. Merge k Sorted Lists', difficulty: 'Hard', whyThisFits: 'Exact K-Way Min-Heap merge core.' },
      { platform: 'Database Internals', title: 'PostgreSQL External Tape Merge Sort', difficulty: 'Medium', whyThisFits: 'Triggered when `work_mem` is exceeded by ORDER BY.' },
    ],
  },

  // #66 ARIES Crash Recovery (WAL: Analysis, Redo, Undo)
  {
    id: 'aries-wal-recovery',
    name: 'ARIES Crash Recovery (WAL: Analysis, Redo, Undo)',
    shortName: 'ARIES WAL Recovery',
    category: 'Database Storage & Query Engines',
    difficulty: 'Advanced',
    visualType: 'stream-partition',
    tagline: 'Guarantee ACID Atomicity & Durability after sudden power loss via Write-Ahead Logging and 3-phase recovery: Analysis → Redo History → Undo Losers.',
    timeComplexity: 'O(Log since Checkpoint)',
    spaceComplexity: 'O(Active Txns + Dirty Pages)',
    mentalModel:
      'Think of an accountant’s fireproof ledger written BEFORE touching the cash register (STEAL/NO-FORCE): after a crash, (1) Analysis finds who didn’t finish, (2) Redo replays everything to exact crash state, and (3) Undo walks backwards reversing uncommitted "loser" transactions while writing CLR markers!',
    coreInvariant:
      'Write-Ahead Logging Rule: a dirty page CANNOT be flushed to disk until its WAL record (LSN) is fsynced; `pageLSN >= record.LSN` makes Redo 100% idempotent even if the DB crashes AGAIN during recovery!',
    whenToUse: [
      'ACID relational databases (PostgreSQL, MySQL InnoDB, IBM DB2, SQL Server) supporting high-concurrency STEAL / NO-FORCE buffer pools.',
      'Designing durable stateful microservices, payment ledgers, and Raft replicated log recovery.',
      'Explaining why Compensation Log Records (CLRs) prevent infinite undo loops on double crashes.',
    ],
    whenItFails:
      'If WAL fsync is disabled (`fsync=off`) or disk write-cache lies about persistence, Durability is broken; requires periodic Checkpoints to prevent unbounded recovery replay time.',
    linkedTopics: ['Linked Lists', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['lru-cache', 'reverse-linked-list'],
    templates: {
      python: `# ARIES 3-Phase Recovery:
# 1. Analysis (Checkpoint -> End): identify active (loser) txns + dirty pages
# 2. Redo (min recLSN -> End): replay ALL updates where pageLSN < log.LSN (repeating history!)
# 3. Undo (End -> Start): rollback loser txns via prevLSN chain, writing CLR records`,
      js: `function ariesRecoverState(initialPages, walRecords) {
  // Phase 1: Analysis — find committed vs loser transactions
  const committed = new Set();
  const active = new Set();
  for (const r of walRecords) {
    if (r.type === 'BEGIN') active.add(r.txn);
    else if (r.type === 'COMMIT') { committed.add(r.txn); active.delete(r.txn); }
  }
  const losers = [...active].sort();
  // Phase 2: Redo (Repeating History for BOTH winners and losers)
  const pages = { ...initialPages };
  let redoOps = 0;
  for (const r of walRecords) {
    if (r.type === 'UPDATE') {
      pages[r.page] = r.after;
      redoOps++;
    }
  }
  // Phase 3: Undo Losers in Reverse LSN order
  let undoOps = 0;
  for (let i = walRecords.length - 1; i >= 0; i--) {
    const r = walRecords[i];
    if (r.type === 'UPDATE' && active.has(r.txn)) {
      pages[r.page] = r.before;
      undoOps++;
    }
  }
  return { pages, losers, redoOps, undoOps };
}`,
      java: `// CLR (Compensation Log Record) stores undoNextLSN so crashes mid-recovery NEVER undo the same op twice!`,
    },
    frames: [
      {
        step: 1,
        title: 'Crash Occurs Mid-Flight (T1 Committed, T2 Uncommitted)',
        explanation: 'WAL records: LSN1 T1 sets P1=100→200; LSN2 T1 COMMIT; LSN3 T2 sets P2=50→99; ⚡POWER LOSS! Disk still has P1=100, P2=99.',
        invariantCheck: 'T1 changes must survive (Durability); T2 dirty write must vanish (Atomicity).',
        variables: [{ name: 'Disk P1', value: '100 (stale!)' }, { name: 'Disk P2', value: '99 (dirty!)' }],
        array: ['LSN1:T1 P1=200', 'LSN2:T1 COMMIT', 'LSN3:T2 P2=99', '⚡CRASH'],
        highlightIndices: [0, 2, 3],
      },
      {
        step: 2,
        title: 'Phase 1 — Analysis: Scan Forward From Last Checkpoint',
        explanation: 'Rebuilds Transaction Table & Dirty Page Table: Winners={T1}, Losers={T2}.',
        invariantCheck: 'Identifies exact earliest recLSN needed for Redo.',
        variables: [{ name: 'winners', value: '[T1]' }, { name: 'losers', value: '[T2]' }],
        array: ['T1:COMMITTED ✓', 'T2:LOSER ✕'],
        matchedIndices: [0],
        eliminatedIndices: [1],
      },
      {
        step: 3,
        title: 'Phase 2 — Redo (Repeat History): Restore P1=200, P2=99',
        explanation: 'Replay every log update where disk pageLSN < LSN → restores T1’s P1=200 AND brings DB to exact pre-crash state.',
        invariantCheck: 'Idempotent via pageLSN check.',
        variables: [{ name: 'P1', value: '200 (restored)' }, { name: 'P2', value: '99' }],
        array: ['P1=200 ✓', 'P2=99 (pending undo)'],
        matchedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 4,
        title: 'Phase 3 — Undo Loser T2 Backwards + Write CLR',
        explanation: 'Walk T2’s prevLSN chain backwards: revert P2 from 99→50 and append CLR(undoNextLSN=null). DB is 100% ACID consistent!',
        invariantCheck: 'Final State: P1=200 (T1 durable), P2=50 (T2 atomic rollback).',
        variables: [{ name: 'P1', value: '200' }, { name: 'P2', value: '50' }, { name: 'ACID', value: 'RESTORED ✓' }],
        array: ['P1=200', 'P2=50'],
        matchedIndices: [0, 1],
      },
    ],
    platformDrills: [
      { platform: 'Database Internals', title: 'CMU 15-445 ARIES Recovery Trace', difficulty: 'Hard', whyThisFits: 'Tests Dirty Page Table, recLSN, and CLR double-crash recovery.' },
    ],
  },

  // #67 Hash Join, Sort-Merge Join & Volcano Iterator Model
  {
    id: 'sql-joins-volcano',
    name: 'Hash Join, Sort-Merge Join & Volcano Iterator Model',
    shortName: 'SQL Joins & Volcano',
    category: 'Database Storage & Query Engines',
    difficulty: 'Advanced',
    visualType: 'prefix-hash',
    tagline: 'Execute relational joins in O(N + M) via Grace Hash Join or Sort-Merge Join—streamed tuple-by-tuple through pull-based `open()/next()/close()` Volcano pipelines.',
    timeComplexity: 'O(N + M) Hash Join · O(N log N + M log M) Sort-Merge',
    spaceComplexity: 'O(min(N, M)) Hash · O(1) pre-sorted Merge',
    mentalModel:
      'Think of Hash Join like building a phone directory of the SMALLER table in RAM (Build phase), then scanning the larger table once to look up matches in O(1) (Probe phase)—while Volcano pipes rows lazily upwards on demand without materializing giant temp tables!',
    coreInvariant:
      'Hash Join builds on the smaller relation R (`|R| ≤ |S|`) and spills via Grace hash-partitioning if R > RAM; Sort-Merge Join streams two sorted inputs with two pointers (ideal when indexes already sort keys or for inequality/range joins).',
    whenToUse: [
      'Equi-joins (`A.id = B.user_id`) on unindexed large tables → Hash Join beats Nested Loop O(N·M) by 10,000×!',
      'Queries needing sorted output (`ORDER BY join_key`) or non-equi/range joins → Sort-Merge Join.',
      'Streaming query execution engines (PostgreSQL, MySQL, Spark/DuckDB vectorized Volcano evolution).',
    ],
    whenItFails:
      'Hash Join cannot handle inequality joins (`A.ts BETWEEN B.start AND B.end`) and suffers severe partition skew if one join key holds 50% of all rows; Volcano’s per-tuple virtual call overhead loses to Vectorized (1024-row batch) execution on OLAP column scans (DuckDB/ClickHouse).',
    linkedTopics: ['Arrays & Prefix Sum', 'Two Pointers'],
    linkedProblemSlugs: ['two-sum', 'merge-intervals'],
    templates: {
      python: `def hash_join(left_rows, right_rows, key_l, key_r):
    # Build phase on smaller relation
    ht = {}
    for row in left_rows:
        ht.setdefault(row[key_l], []).append(row)
    # Probe phase (Volcano yield = lazy streaming!)
    for r in right_rows:
        for l in ht.get(r[key_r], ()):
            yield {**l, **r}`,
      js: `function hashJoinPairs(left, right) {
  // left: [id, name][], right: [userId, amount][] -> joined [id, name, amount][]
  const build = new Map();
  for (const [id, name] of left) {
    if (!build.has(id)) build.set(id, []);
    build.get(id).push(name);
  }
  const out = [];
  for (const [uid, amt] of right) {
    const names = build.get(uid);
    if (!names) continue;
    for (const name of names) out.push([uid, name, amt]);
  }
  return out;
}`,
      java: `// Volcano Iterator Model: every operator implements open(), next(), close() pulling rows lazily!`,
    },
    frames: [
      {
        step: 1,
        title: 'Volcano Pull Pipeline: Project → HashJoin → SeqScan',
        explanation: 'Top operator calls next() down the tree; zero intermediate tables materialized in RAM.',
        invariantCheck: 'Build side selected as smaller table Users (3 rows) vs Orders (1M rows).',
        variables: [{ name: 'buildSide', value: 'Users (small)' }, { name: 'probeSide', value: 'Orders (large)' }],
        array: ['Users:[1:Ada,2:Lin]', 'Orders:[1:$50,2:$80,1:$20]'],
        highlightIndices: [0],
      },
      {
        step: 2,
        title: 'Hash Join Phase 1: Build In-Memory Hash Table',
        explanation: 'Hash Users by id → `{ 1: ["Ada"], 2: ["Lin"] }` in O(|Users|) time and space.',
        invariantCheck: 'If Users > RAM, Grace Hash Join hashes both tables to B disk partitions first.',
        variables: [{ name: 'hashTable', value: '{1:[Ada], 2:[Lin]}' }],
        array: ['HT[1]→Ada', 'HT[2]→Lin'],
        matchedIndices: [0, 1],
      },
      {
        step: 3,
        title: 'Hash Join Phase 2: Stream & Probe Orders in O(1)/Row',
        explanation: 'Probe Order(1,$50) → emits [1,Ada,$50]; Order(2,$80) → [2,Lin,$80]; Order(1,$20) → [1,Ada,$20].',
        invariantCheck: 'Total time O(N + M) vs Nested Loop O(N · M).',
        variables: [{ name: 'emitted', value: '3 joined rows' }],
        array: ['[1,Ada,50]', '[2,Lin,80]', '[1,Ada,20]'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 4,
        title: 'When Sort-Merge Join Beats Hash Join',
        explanation: 'If both inputs are already B+ Tree sorted on join key (or output needs ORDER BY), two-pointer Sort-Merge uses O(1) RAM!',
        invariantCheck: 'Modern OLAP engines (DuckDB) batch 1024 tuples per Volcano next() call for SIMD speed.',
        variables: [{ name: 'OLAP', value: 'Vectorized Volcano' }],
        array: ['Hash (Equi) vs Sort-Merge (Sorted/Range)'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'Database Internals', title: 'PostgreSQL EXPLAIN ANALYZE Join Chooser', difficulty: 'Hard', whyThisFits: 'Choosing Nested Loop vs Hash Join vs Sort-Merge Join.' },
    ],
  },

  // #68 Consistent Hashing (Virtual Nodes), Chord DHT & Rendezvous Hashing
  {
    id: 'consistent-hashing-dht',
    name: 'Consistent Hashing (VNodes), Chord DHT & Rendezvous',
    shortName: 'Consistent Hashing',
    category: 'Distributed Systems & Consensus',
    difficulty: 'Advanced',
    visualType: 'binary-search',
    tagline: 'Route keys across dynamic server clusters so adding or removing a node remaps only O(K/N) keys instead of catastrophic O(K) modulo rehashing!',
    timeComplexity: 'O(log(N · V)) lookup',
    spaceComplexity: 'O(N · V) ring',
    mentalModel:
      'Place both servers (each replicated across V=150 Virtual Nodes) and keys onto a 0..2³²−1 clock face. Every key walks clockwise to the first server it meets—if one node dies, ONLY its tiny arc shifts to its clockwise neighbor!',
    coreInvariant:
      'Virtual Nodes reduce key load variance from ~O(log N) down to <5%; Chord DHT adds O(log N) finger-table shortcuts for decentralized P2P lookup; Rendezvous (HRW) Hashing picks `argmax_s hash(key, s)` with zero ring state.',
    whenToUse: [
      'Distributed caches (Memcached, Redis Cluster, Akamai CDN) and sharded databases (DynamoDB, Cassandra, Riak).',
      'Stateful load balancing & sticky WebSocket/gaming session routing.',
      'Peer-to-peer decentralized lookup (Chord DHT) or weight-flexible shard selection (Rendezvous Hashing).',
    ],
    whenItFails:
      'Cannot prevent single-key "celebrity hotspots" (e.g., Taylor Swift’s user row still hashes to 1 node—requires key salting or local read caching).',
    linkedTopics: ['Modified Binary Search', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['binary-search-classic', 'lru-cache'],
    templates: {
      python: `import bisect
def consistent_route(ring_hashes: list[int], ring_nodes: list[str], key_hash: int) -> str:
    idx = bisect.bisect_left(ring_hashes, key_hash)
    if idx == len(ring_hashes):
        idx = 0  # wrap around ring!
    return ring_nodes[idx]`,
      js: `function consistentHashRoute(nodes, keys, vnodes = 3) {
  const hash = (s) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  };
  const ring = [];
  for (const node of nodes) {
    for (let v = 0; v < vnodes; v++) ring.push({ pos: hash(node + '#' + v), node });
  }
  ring.sort((a, b) => a.pos - b.pos);
  const route = (k) => {
    const kh = hash(k);
    let lo = 0, hi = ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ring[mid].pos < kh) lo = mid + 1;
      else hi = mid;
    }
    return ring[lo === ring.length ? 0 : lo].node;
  };
  return keys.map(route);
}`,
      java: `// Rendezvous Hashing (HRW): owner(k) = argmax_{node in S} hash(k, node) -> zero ring, exact K/N movement!`,
    },
    frames: [
      {
        step: 1,
        title: 'Place Servers + Virtual Nodes on Sorted Hash Ring',
        explanation: 'Nodes A, B, C each place multiple virtual tokens around [0..360°] so arcs stay evenly balanced.',
        invariantCheck: 'Ring tokens sorted ascending → binary search finds clockwise owner in O(log(N·V)).',
        variables: [{ name: 'ring', value: 'A@40, B@130, C@250, A@310' }],
        array: ['A@40', 'B@130', 'C@250', 'A@310'],
        matchedIndices: [0, 1, 2, 3],
      },
      {
        step: 2,
        title: 'Route Key (hash=160) Clockwise to First Token ≥ 160',
        explanation: 'Binary search finds 250 (Node C). Key with hash=340 wraps around past 310 to 40 (Node A)!',
        invariantCheck: 'Wrap-around rule `lo === ring.length ? 0 : lo` handles circular boundary.',
        variables: [{ name: 'key=160', value: '→ C@250' }, { name: 'key=340', value: '→ wrap A@40' }],
        array: ['A@40', 'B@130', 'C@250*', 'A@310'],
        highlightIndices: [2],
      },
      {
        step: 3,
        title: 'Node B Fails → Only B’s Arc Remaps to C!',
        explanation: 'Remove B@130: keys in (40..130] move cleanly to C@250. All keys on A and C stay 100% cache-warm!',
        invariantCheck: 'Only ~1/N of keys migrate vs ~(N−1)/N under naive `hash(k) % N`!',
        variables: [{ name: 'movedKeys', value: '1/N (minimal!)' }],
        array: ['A@40', '×B@130', 'C@250*', 'A@310'],
        eliminatedIndices: [1],
        matchedIndices: [2],
      },
      {
        step: 4,
        title: 'Chord DHT & Rendezvous Hashing Extensions',
        explanation: 'Chord routes decentralized P2P lookups in O(log N) hops via finger tables (2^i); Rendezvous computes max hash(k, node) with zero ring metadata.',
        invariantCheck: 'Foundation of Dynamo, Cassandra, and CDN routing.',
        variables: [{ name: 'Chord', value: 'O(log N) hops' }, { name: 'HRW', value: 'Zero Ring' }],
        array: ['VNodes', 'Chord Fingers', 'Rendezvous HRW'],
        matchedIndices: [0, 1, 2],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Design Distributed Cache / Amazon Dynamo Ring', difficulty: 'Hard', whyThisFits: 'Virtual nodes + preference list replication across distinct racks.' },
    ],
  },

  // #69 Raft & Paxos Consensus (Leader Election & Log Replication)
  {
    id: 'raft-paxos-consensus',
    name: 'Raft & Paxos Consensus (Election & Log Replication)',
    shortName: 'Raft & Paxos',
    category: 'Distributed Systems & Consensus',
    difficulty: 'Advanced',
    visualType: 'weighted-network',
    tagline: 'Keep a replicated cluster strongly consistent despite node crashes & network partitions via monotonic Terms, Quorum Majority Votes, and AppendEntries commits.',
    timeComplexity: 'Typically one leader-to-quorum replication round trip after append; end-to-end client latency also includes client/network, batching and durable-write costs',
    spaceComplexity: 'O(Log Entries) + Snapshots',
    mentalModel:
      'Think of a parliament with numbered sessions (Terms): a node can only become Leader if a strict majority (`⌊N/2⌋ + 1`) votes for it AND its log is at least as up-to-date as voters—and an entry is committed ONLY once replicated on a majority!',
    coreInvariant:
      'Quorum intersection means any two majorities share at least one voter. That intersection is necessary but not sufficient by itself to prove a new leader has every committed entry. Raft's up-to-date-log voting rule, term restrictions and AppendEntries/log-matching rules combine with quorum intersection to preserve committed entries under the crash-fault model.',
    whenToUse: [
      'Strongly consistent cluster metadata & distributed locks: etcd (Kubernetes), CockroachDB, TiKV, Consul, ZooKeeper (ZAB), Google Spanner (Paxos).',
      'Tolerating up to `f` crash failures with `2f + 1` replicas (e.g., 3 nodes survive 1 crash; 5 nodes survive 2 crashes).',
      'Eliminating split-brain via strict majority quorums + term fencing.',
    ],
    whenItFails:
      'Cannot tolerate Byzantine (malicious/lying) nodes (use PBFT/HotStuff), halts writes if minority partition loses quorum (CP over AP in CAP), and degrades throughput if replicas span 200ms WAN links without Multi-Raft sharding.',
    linkedTopics: ['Graphs & Topo Sort'],
    linkedProblemSlugs: ['network-delay-time', 'course-schedule-ii'],
    templates: {
      python: `# Raft Leader Election Vote Grant Rule:
# Grant vote iff: candidate.term >= currentTerm AND (votedFor is None or == candidate)
#                 AND candidate's log is at least as up-to-date as voter's log!`,
      js: `function raftElectAndCommit(nodes, candidateId, term, newEntry) {
  // nodes: { id, term, lastLogTerm, lastLogIndex, log }[]
  const majority = Math.floor(nodes.length / 2) + 1;
  const cand = nodes.find((n) => n.id === candidateId);
  if (!cand) return { elected: false, committedIndex: -1 };
  let votes = 0;
  for (const peer of nodes) {
    const upToDate =
      cand.lastLogTerm > peer.lastLogTerm ||
      (cand.lastLogTerm === peer.lastLogTerm && cand.lastLogIndex >= peer.lastLogIndex);
    if (term > peer.term && upToDate) votes++;
  }
  if (votes < majority) return { elected: false, votes, committedIndex: -1 };
  // Leader appends entry and replicates to alive peers
  const nextIdx = cand.lastLogIndex + 1;
  const acks = nodes.filter((n) => n.alive !== false).length;
  const committed = acks >= majority;
  return { elected: true, votes, committed, committedIndex: committed ? nextIdx : -1, entry: newEntry };
}`,
      java: `// Paxos Phase 1 (Prepare/Promise) == Raft Leader Election; Phase 2 (Accept/Accepted) == AppendEntries!`,
    },
    frames: [
      {
        step: 1,
        title: 'Randomized Election Timeout Fires on Node S2 (Term 2)',
        explanation: 'Leader S1 crashes. S2 times out first (150–300ms random jitter avoids split votes!), increments Term→2, votes for itself, and sends RequestVote.',
        invariantCheck: 'Randomized timeouts break election symmetry cleanly.',
        variables: [{ name: 'candidate', value: 'S2' }, { name: 'term', value: '2' }, { name: 'quorum', value: '3 / 5' }],
        array: ['S1(dead)', 'S2(Cand T2)*', 'S3(Foll)', 'S4(Foll)', 'S5(Foll)'],
        eliminatedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 2,
        title: 'Quorum Majority (3/5) Grants Vote → S2 Elected Leader',
        explanation: 'S3 and S4 verify S2’s log is ≥ up-to-date and grant votes. With 3/5 votes, S2 becomes sole Leader of Term 2!',
        invariantCheck: 'At most ONE leader can ever be elected in any given Term (Election Safety).',
        variables: [{ name: 'votes', value: '3 / 5 ✓' }, { name: 'leader', value: 'S2 (T2)' }],
        array: ['S1(dead)', 'S2(LEADER)*', 'S3(voted)', 'S4(voted)', 'S5(Foll)'],
        matchedIndices: [1, 2, 3],
      },
      {
        step: 3,
        title: 'AppendEntries Replicates `SET x=42` to Followers',
        explanation: 'S2 appends `(T2, idx=5, x=42)` to its WAL and streams AppendEntries RPCs to S3, S4, S5.',
        invariantCheck: 'Followers reject entries if prevLogIndex/prevLogTerm mismatch (Log Matching).',
        variables: [{ name: 'entry', value: 'idx=5: x=42' }, { name: 'acks', value: '3 / 5' }],
        array: ['S2:idx5✓', 'S3:idx5✓', 'S4:idx5✓', 'S5:pending'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 4,
        title: 'Majority Replicated → Commit & Apply to State Machine!',
        explanation: '3/5 nodes durably stored idx=5 → S2 advances commitIndex=5, applies `x=42`, and returns OK to client!',
        invariantCheck: 'Even if S2 dies now, any future majority MUST contain S3 or S4 who have idx=5.',
        variables: [{ name: 'commitIndex', value: '5' }, { name: 'state', value: 'x = 42' }],
        array: ['COMMITTED: x=42 (Quorum Safe)'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Design etcd / Distributed Lock Service', difficulty: 'Hard', whyThisFits: 'Raft leader leases + monotonic fencing tokens defeat GC pauses.' },
    ],
  },

  // #70 Gossip Protocol & Phi Accrual Failure Detector
  {
    id: 'gossip-phi-accrual',
    name: 'Gossip Protocol & Phi Accrual Failure Detector',
    shortName: 'Gossip & Phi Accrual',
    category: 'Distributed Systems & Consensus',
    difficulty: 'Advanced',
    visualType: 'weighted-network',
    tagline: 'Spread cluster membership & health across N nodes in O(log N) rounds with constant bandwidth—and output a continuous suspicion score Φ instead of brittle binary timeouts.',
    timeComplexity: 'O(log N) convergence rounds',
    spaceComplexity: 'O(N) membership table',
    mentalModel:
      'Gossip spreads like office rumors: every second each server tells `k=3` random peers its latest membership list—reaching 10,000 nodes in ~9 seconds! Phi Accrual tracks recent heartbeat arrival intervals and asks: "Given normal jitter, how unlikely is this silence?"',
    coreInvariant:
      'Epidemic Spread: after `t` rounds with fanout `k`, infected nodes grow exponentially (~`k^t`), converging in `O(log N)` rounds; `Φ(t_now) = −log₁₀(1 − CDF(t_now − t_last))` rises smoothly (Φ=8 means 10⁻⁸ false-positive chance!).',
    whenToUse: [
      'Decentralized peer-to-peer cluster membership & failure detection: Apache Cassandra, ScyllaDB, Consul (SWIM), Amazon Dynamo, Akka Cluster.',
      'Replacing fixed heartbeat timeouts (which flap wildly during GC pauses or cloud network jitter) with adaptive Phi thresholds.',
      'Large clusters (1,000+ nodes) where all-to-all heartbeating O(N²) would saturate NICs.',
    ],
    whenItFails:
      'Eventual consistency only—cannot provide linearizable strong consensus (never use Gossip alone for leader election; pair with Raft/Paxos when strict single-leader safety is required).',
    linkedTopics: ['Graphs & Topo Sort'],
    linkedProblemSlugs: ['network-delay-time', 'rotting-oranges'],
    templates: {
      python: `import math
def phi_suspicion(elapsed_ms: float, mean_ms: float) -> float:
    # Exponential approximation used in Cassandra's Phi Accrual Failure Detector
    p_later = math.exp(-elapsed_ms / max(mean_ms, 1e-6))
    return -math.log10(max(p_later, 1e-12))`,
      js: `function gossipConvergenceAndPhi(n, fanout, elapsedMs, meanIntervalMs) {
  // Simulate deterministic round-robin epidemic fanout spread from node 0
  const infected = new Set([0]);
  let rounds = 0;
  while (infected.size < n && rounds < 50) {
    rounds++;
    const current = [...infected];
    for (const src of current) {
      for (let f = 1; f <= fanout; f++) {
        const peer = (src * 31 + rounds * 17 + f * 7) % n;
        infected.add(peer);
      }
    }
  }
  const pLater = Math.exp(-elapsedMs / Math.max(meanIntervalMs, 1));
  const phi = Number((-Math.log10(Math.max(pLater, 1e-12))).toFixed(2));
  return { rounds, infectedCount: infected.size, phi, suspectedDown: phi >= 8 };
}`,
      java: `// Cassandra default threshold phi_convict_threshold = 8 (~1 in 100,000,000 false suspicion rate!).`,
    },
    frames: [
      {
        step: 1,
        title: 'Round 0: Node N0 Detects New Member / Heartbeat Update',
        explanation: 'Only 1 of 16 nodes knows the new state. Fixed O(1) fanout k=2 peers per tick.',
        invariantCheck: 'Zero central coordinator → no single point of failure.',
        variables: [{ name: 'round', value: '0' }, { name: 'informed', value: '1 / 16' }],
        array: ['N0*', 'N1', 'N2', 'N3', 'N4..N15'],
        matchedIndices: [0],
      },
      {
        step: 2,
        title: 'Exponential Epidemic Fanout (1 → 3 → 8 → 16)',
        explanation: 'Each informed node picks random peers and exchanges state digests (push-pull gossip) → full 16-node convergence in ~4 rounds!',
        invariantCheck: 'O(log N) rounds with constant per-node bandwidth.',
        variables: [{ name: 'round', value: '3' }, { name: 'informed', value: '16 / 16 ✓' }],
        array: ['All 16 Nodes Converged in O(log N) Rounds!'],
        matchedIndices: [0],
      },
      {
        step: 3,
        title: 'Phi Accrual Tracks Heartbeat Inter-Arrival Window',
        explanation: 'Normal heartbeats arrive every mean=1000ms. Silence of 2000ms gives Φ=0.87 (probably just GC/network jitter—DO NOT evict yet!).',
        invariantCheck: 'Continuous suspicion scale decouples detection from action policy.',
        variables: [{ name: 'silence', value: '2000 ms' }, { name: 'Φ', value: '0.87 (Alive)' }],
        array: ['2s → Φ=0.87 (OK)', '10s → Φ=4.34 (Warn)', '20s → Φ=8.69 (DOWN!)'],
        matchedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 4,
        title: 'Φ Crosses Threshold 8.0 → Mark Node DOWN Safely',
        explanation: 'At 20s silence, Φ = 8.69 ≥ 8 → application marks replica dead and triggers Hinted Handoff / Anti-Entropy!',
        invariantCheck: 'Adapts dynamically to cloud latency variance.',
        variables: [{ name: 'Φ', value: '8.69 ≥ 8' }, { name: 'status', value: 'CONVICTED DOWN' }],
        array: ['Φ=8.69 → Convict & Reroute'],
        eliminatedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Cassandra Cluster Membership & Failure Detection', difficulty: 'Hard', whyThisFits: 'Gossip + Phi Accrual prevents split-brain flapping under GC pauses.' },
    ],
  },

  // #71 Merkle Trees (Anti-Entropy Sync)
  {
    id: 'merkle-tree-sync',
    name: 'Merkle Trees (Logarithmic Anti-Entropy Sync)',
    shortName: 'Merkle Tree Sync',
    category: 'Distributed Systems & Consensus',
    difficulty: 'Advanced',
    visualType: 'tree-structure',
    tagline: 'Compare millions of replicated database keys or blockchain blocks in O(log N) network round-trips by exchanging cryptographic root & subtree hashes.',
    timeComplexity: 'O(log N) diff lookup · O(N) build',
    spaceComplexity: 'O(N) hashes',
    mentalModel:
      'To find which single page differs between two 1,000-page books over a slow phone call, compare the hash of the whole book first—if equal, hang up in O(1)! If different, compare left half vs right half recursively until you pinpoint the exact divergent page!',
    coreInvariant:
      'Every internal node stores `H(leftHash + rightHash)`: two subtrees have identical root hashes iff EVERY leaf key-value underneath them matches (up to cryptographic collision resistance).',
    whenToUse: [
      'Distributed DB Anti-Entropy Repair: Amazon Dynamo, Apache Cassandra (`nodetool repair`), Riak.',
      'Git commit/tree integrity, BitTorrent piece verification, Bitcoin/Ethereum SPV Merkle Proofs (verify 1 tx in 100K txs with only 17 hashes!).',
      'Tamper-evident Certificate Transparency audit logs.',
    ],
    whenItFails:
      'Rebuilding Merkle Trees over shifting key ranges when nodes join/leave a ring is expensive; dynamic insertion/deletion requires rebalancing or fixed key-range bucket hashing.',
    linkedTopics: ['Trees DFS/BFS'],
    linkedProblemSlugs: ['validate-binary-search-tree', 'lowest-common-ancestor-bst'],
    templates: {
      python: `# Recursive anti-entropy diff skips 100% of matching subtrees in O(1)!
def diff_merkle(node_a, node_b):
    if node_a.hash == node_b.hash:
        return []  # Entire subtree identical -> 0 data transferred!
    if node_a.is_leaf:
        return [node_a.index]
    return diff_merkle(node_a.left, node_b.left) + diff_merkle(node_a.right, node_b.right)`,
      js: `function merkleDiffIndices(blocksA, blocksB) {
  const hash = (s) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return (h >>> 0).toString(16);
  };
  const build = (arr, l, r) => {
    if (l === r) return { h: hash(String(arr[l])), l: null, r: null, idx: l };
    const m = (l + r) >> 1;
    const left = build(arr, l, m), right = build(arr, m + 1, r);
    return { h: hash(left.h + '|' + right.h), l: left, r: right, idx: -1 };
  };
  const rootA = build(blocksA, 0, blocksA.length - 1);
  const rootB = build(blocksB, 0, blocksB.length - 1);
  const diffs = [];
  let comparisons = 0;
  const walk = (a, b) => {
    comparisons++;
    if (a.h === b.h) return;
    if (a.idx !== -1) { diffs.push(a.idx); return; }
    walk(a.l, b.l);
    walk(a.r, b.r);
  };
  walk(rootA, rootB);
  return { rootMatch: rootA.h === rootB.h, diffs, comparisons };
}`,
      java: `// SPV Merkle Proof size is strictly O(log2 N) sibling hashes (~640 bytes for 1,000,000 transactions)!`,
    },
    frames: [
      {
        step: 1,
        title: 'Compare Root Hashes Across Replica A & Replica B',
        explanation: '4 data blocks: Replica A=[k0, k1, k2, k3], Replica B=[k0, k1, k2_CORRUPT, k3]. Root hashes differ → descend!',
        invariantCheck: 'If roots matched, sync terminates in 1 hash comparison (32 bytes)!',
        variables: [{ name: 'rootA', value: '0x9a1f' }, { name: 'rootB', value: '0x4c8e (DIFF!)' }],
        array: ['Root: DIFF', 'L(0..1)', 'R(2..3)'],
        highlightIndices: [0],
      },
      {
        step: 2,
        title: 'Prune Entire Left Subtree [0..1] Instantly!',
        explanation: 'hash(L_A) === hash(L_B) → blocks 0 and 1 are 100% identical! Skip Left branch completely without sending data!',
        invariantCheck: 'Halves search space at every tree level.',
        variables: [{ name: 'L(0..1)', value: 'MATCH ✓ (SKIP)' }, { name: 'R(2..3)', value: 'DIFF → descend' }],
        array: ['L(0..1) MATCH ✓', 'R(2..3) DIFF'],
        matchedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 3,
        title: 'Pinpoint Exact Divergent Leaf: Block #2!',
        explanation: 'Compare leaf 2 (DIFF!) and leaf 3 (MATCH ✓). Stream ONLY block #2 across the network to repair Replica B!',
        invariantCheck: 'Transferred 1 block instead of scanning/shipping all N blocks.',
        variables: [{ name: 'diffs', value: '[2]' }, { name: 'networkSaved', value: '75% (99.9% at scale)' }],
        array: ['B0 ✓', 'B1 ✓', 'B2 ✕ SYNC!', 'B3 ✓'],
        matchedIndices: [0, 1, 3],
        eliminatedIndices: [2],
      },
      {
        step: 4,
        title: 'Merkle Inclusion Proofs in Blockchains & Git',
        explanation: 'To prove B2 is inside Root 0x9a1f, send ONLY sibling hashes [H(B3), H(L0..1)] — O(log N) verification!',
        invariantCheck: 'Cryptographically tamper-evident tree structure.',
        variables: [{ name: 'proofSize', value: 'O(log N)' }],
        array: ['Proof: [H(B3), H(L)] → Root ✓'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Cassandra Anti-Entropy Repair / Git Internals', difficulty: 'Hard', whyThisFits: 'Logarithmic divergence discovery across multi-TB replicas.' },
    ],
  },

  // #72 Vector Clocks & Lamport Timestamps
  {
    id: 'vector-clocks-lamport',
    name: 'Vector Clocks & Lamport Logical Timestamps',
    shortName: 'Vector Clocks',
    category: 'Distributed Systems & Consensus',
    difficulty: 'Advanced',
    visualType: 'array-cells-bit',
    tagline: 'Track causal happened-before ordering (`A → B`) and detect concurrent conflicting writes (`A ∥ B`) without relying on broken physical wall clocks!',
    timeComplexity: 'O(N) merge & compare',
    spaceComplexity: 'O(N) vector per object',
    mentalModel:
      'Wall clocks drift by milliseconds across servers (NTP jumps backwards!). A Vector Clock gives each node its own counter `[A:2, B:1, C:0]`—if every entry in V1 ≤ V2 (with at least one `<`), V1 causally preceded V2; if V1 is bigger in one slot and V2 is bigger in another, they are CONCURRENT conflicts!',
    coreInvariant:
      'Lamport Clock guarantees `A → B ⇒ L(A) < L(B)` (one-way only!). Vector Clock guarantees `A → B ⇔ V(A) < V(B)` (exact two-way causality + concurrency detection!).',
    whenToUse: [
      'Multi-leader / leaderless conflict detection: Amazon Dynamo shopping carts, Riak Dotted Version Vectors, Voldemort.',
      'Distributed debugging, causal broadcast, and snapshot consistency without synchronized GPS/atomic clocks.',
      'Understanding why Spanner’s TrueTime API needed atomic clocks just to beat logical clock limitations.',
    ],
    whenItFails:
      'Vector size grows O(N) with every actor/client ID (thousands of client devices bloat metadata)—prune old entries or track server-side replicas via Dotted Version Vectors (DVVs).',
    linkedTopics: ['Arrays & Prefix Sum', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['course-schedule-ii', 'merge-intervals'],
    templates: {
      python: `def compare_vector_clocks(va: list[int], vb: list[int]) -> str:
    less_eq = all(a <= b for a, b in zip(va, vb))
    greater_eq = all(a >= b for a, b in zip(va, vb))
    if less_eq and greater_eq: return "EQUAL"
    if less_eq: return "BEFORE"      # va -> vb (causal)
    if greater_eq: return "AFTER"    # vb -> va (causal)
    return "CONCURRENT"              # va || vb (conflict!)`,
      js: `function compareAndMergeVectorClocks(va, vb) {
  let le = true, ge = true;
  const merged = va.map((a, i) => {
    const b = vb[i];
    if (a > b) le = false;
    if (a < b) ge = false;
    return Math.max(a, b);
  });
  const relation = le && ge ? 'EQUAL' : le ? 'BEFORE' : ge ? 'AFTER' : 'CONCURRENT';
  return { relation, merged };
}`,
      java: `// Lamport receive rule: L = Math.max(L, msgL) + 1; Vector receive rule: V[i] = max(V[i], msgV[i]), V[self]++`,
    },
    frames: [
      {
        step: 1,
        title: 'Node A Writes Cart Item → V1 = [1, 0, 0]',
        explanation: 'All 3 replicas start at [0,0,0]. Node A increments its own slot → [1,0,0] and replicates to B.',
        invariantCheck: 'Local event always increments V[self] += 1.',
        variables: [{ name: 'Node A', value: '[1, 0, 0]' }, { name: 'Node B', value: '[0, 0, 0]' }],
        array: ['A:[1,0,0]', 'B:[0,0,0]', 'C:[0,0,0]'],
        matchedIndices: [0],
      },
      {
        step: 2,
        title: 'Node B Receives A’s Update & Writes → V2 = [1, 1, 0]',
        explanation: 'B merges `max([0,0,0], [1,0,0])` and bumps B’s slot → [1,1,0]. Since [1,0,0] < [1,1,0], V1 causally happened BEFORE V2!',
        invariantCheck: 'V2 safely supersedes V1 with ZERO conflict.',
        variables: [{ name: 'V1 vs V2', value: 'BEFORE (V1 → V2)' }],
        array: ['V1:[1,0,0]', '→', 'V2:[1,1,0]'],
        matchedIndices: [0, 2],
      },
      {
        step: 3,
        title: 'Network Partition! A Writes [2, 0, 0] While B Has [1, 1, 0]',
        explanation: 'Compare [2,0,0] vs [1,1,0]: slot 0 has 2 > 1, slot 1 has 0 < 1 → NEITHER dominates!',
        invariantCheck: 'Exact CONCURRENT conflict detected! Do NOT blindly drop either write!',
        variables: [{ name: 'V_A', value: '[2, 0, 0]' }, { name: 'V_B', value: '[1, 1, 0]' }, { name: 'relation', value: 'CONCURRENT ∥' }],
        array: ['A:[2,0,0]', '∥ CONFLICT', 'B:[1,1,0]'],
        highlightIndices: [1],
      },
      {
        step: 4,
        title: 'Reconcile Siblings & Stamp Merged Vector [2, 1, 0]',
        explanation: 'App merges both shopping carts (or hands off to CRDT!) and writes reconciled version stamped `max([2,0,0],[1,1,0]) = [2,1,0]`.',
        invariantCheck: 'Lamport timestamps alone (2 vs 2) could NOT tell whether events were concurrent!',
        variables: [{ name: 'merged', value: '[2, 1, 0]' }],
        array: ['Merged:[2, 1, 0] ✓'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Dynamo Shopping Cart Conflict Detection', difficulty: 'Hard', whyThisFits: 'Canonical multi-master causal history & sibling reconciliation.' },
    ],
  },

  // #73 Conflict-Free Replicated Data Types (CRDTs: G-Counter, OR-Set)
  {
    id: 'crdt-gcounter-orset',
    name: 'CRDTs (G-Counter, PN-Counter & OR-Set)',
    shortName: 'CRDTs (G-Counter/OR)',
    category: 'Distributed Systems & Consensus',
    difficulty: 'Advanced',
    visualType: 'array-cells-bit',
    tagline: 'Guarantee Strong Eventual Consistency across offline & multi-region replicas with ZERO coordination locks via mathematical join-semilattice merges.',
    timeComplexity: 'O(N) merge · O(1) local write',
    spaceComplexity: 'O(N) replica slots / tags',
    mentalModel:
      'Instead of arguing over one shared counter `x = x + 1` (where concurrent increments overwrite each other), a G-Counter gives EVERY replica its own private slot `[A:3, B:5, C:2]`: merging takes element-wise `max()`, and the total is `sum()`—order, duplicates, and delays NEVER corrupt the answer!',
    coreInvariant:
      'Join-Semilattice Laws: `merge(A, B)` is Commutative (`A⊔B = B⊔A`), Associative (`(A⊔B)⊔C = A⊔(B⊔C)`), and Idempotent (`A⊔A = A`) — guaranteeing every replica converges to the EXACT same state once messages arrive!',
    whenToUse: [
      'Collaborative real-time editors (Figma, Google Docs/Yjs/Automerge), offline-first mobile apps, and multi-region active-active Redis Enterprise / Riak counters.',
      'Distributed like/view counters (PN-Counter = two G-Counters: `sum(P) − sum(N)`).',
      'Add-Wins Shopping Carts (OR-Set tags every `add(item, uniqueTag)` so concurrent `remove(item)` only removes tags it actually observed!).',
    ],
    whenItFails:
      'Cannot enforce global cross-replica invariants like "bank balance must never drop below $0" or "only 1 seat left on flight"—those require linearizable consensus (Raft/Paxos/Transactions).',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['contains-duplicate', 'two-sum'],
    templates: {
      python: `# G-Counter (Grow-only Counter CRDT):
def gcounter_merge(a: list[int], b: list[int]) -> list[int]:
    return [max(x, y) for x, y in zip(a, b)]

def gcounter_value(c: list[int]) -> int:
    return sum(c)`,
      js: `function crdtMergeAndValue(gCounters, pnPairs) {
  // Merge list of G-Counter vectors via element-wise max (commutative, associative, idempotent)
  const dim = gCounters[0].length;
  const mergedG = new Array(dim).fill(0);
  for (const vec of gCounters) {
    for (let i = 0; i < dim; i++) mergedG[i] = Math.max(mergedG[i], vec[i]);
  }
  const gTotal = mergedG.reduce((s, v) => s + v, 0);
  // Merge PN-Counters { p: number[], n: number[] }
  const mergedP = new Array(dim).fill(0);
  const mergedN = new Array(dim).fill(0);
  for (const { p, n } of pnPairs) {
    for (let i = 0; i < dim; i++) {
      mergedP[i] = Math.max(mergedP[i], p[i]);
      mergedN[i] = Math.max(mergedN[i], n[i]);
    }
  }
  const pnValue = mergedP.reduce((s, v) => s + v, 0) - mergedN.reduce((s, v) => s + v, 0);
  return { mergedG, gTotal, pnValue };
}`,
      java: `// OR-Set (Observed-Remove Set): add(x) generates unique tag; remove(x) tombstones ONLY currently observed tags!`,
    },
    frames: [
      {
        step: 1,
        title: 'Offline Partition: US & EU Increment Locally Without Locks',
        explanation: '3-region G-Counter [US, EU, AP]. US increments twice → [2,0,0]. EU increments 3 times → [0,3,0]. Zero network wait!',
        invariantCheck: 'Each replica mutates ONLY its own index slot.',
        variables: [{ name: 'US', value: '[2, 0, 0]' }, { name: 'EU', value: '[0, 3, 0]' }],
        array: ['US:[2,0,0]', 'EU:[0,3,0]', 'AP:[0,0,1]'],
        highlightIndices: [0, 1, 2],
      },
      {
        step: 2,
        title: 'Partition Heals → Element-Wise max() Merge Converges!',
        explanation: 'merge([2,0,0], [0,3,0], [0,0,1]) = [2, 3, 1] → sum = 6! Even if EU sends its message twice or out of order, max() stays [2,3,1]!',
        invariantCheck: 'Commutative + Associative + Idempotent = Strong Eventual Consistency!',
        variables: [{ name: 'merged', value: '[2, 3, 1]' }, { name: 'total', value: '6 ✓' }],
        array: ['max → [2, 3, 1]', 'Sum = 6 ✓'],
        matchedIndices: [0, 1],
      },
      {
        step: 3,
        title: 'PN-Counter Adds Decrements via Two G-Counters (P − N)',
        explanation: 'Track increments in P=[5,3,1] and decrements in N=[1,2,0]. Both merge monotonically via max(); value = sum(P) − sum(N) = 6!',
        invariantCheck: 'Monotonicity preserved even while supporting negative deltas.',
        variables: [{ name: 'sum(P)', value: '9' }, { name: 'sum(N)', value: '3' }, { name: 'PN val', value: '6' }],
        array: ['P:[5,3,1]=9', '−', 'N:[1,2,0]=3', '= 6'],
        matchedIndices: [0, 2, 3],
      },
      {
        step: 4,
        title: 'OR-Set Solves Concurrent Add vs Remove Cleanly',
        explanation: 'Replica A adds ("milk", tag#1); Replica B removes observed tag#1 while A concurrently adds ("milk", tag#2) → tag#2 survives (Add-Wins)!',
        invariantCheck: 'Unique add tags eliminate lost updates in collaborative sets.',
        variables: [{ name: 'observed', value: '{tag#1} removed' }, { name: 'survives', value: 'tag#2 ("milk") ✓' }],
        array: ['Add("milk", #2) WINS ✓'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Design Multi-Player Collaborative Editor (Figma / Yjs)', difficulty: 'Hard', whyThisFits: 'CRDTs enable offline-first zero-conflict real-time convergence.' },
    ],
  },
]);

export const MASTER_SYSTEMS_11_PRACTICE: Record<string, AlgorithmPracticeSpec> = hydrateMasterPractice({
  'bplus-tree-storage': {
    algorithmId: 'bplus-tree-storage',
    title: 'B+ Tree Leaf Split & Separator Promotion',
    functionName: 'bPlusTreeSplitInsert',
    prompt: 'Insert `keys` into a 2-level B+ Tree leaf layer where each leaf holds at most `maxKeys` entries. When a leaf exceeds `maxKeys`, split at `Math.ceil(len/2)` and copy `right[0]` up into `separators`. Return `{ separators, leaves }`.',
    structuredSteps: [
      { step: '1. Route via Separators', detail: 'Find first separator > k to select target leaf index.' },
      { step: '2. Insert Sorted in Leaf', detail: 'Insert k into target leaf keeping keys sorted.' },
      { step: '3. Copy-Up Leaf Split', detail: 'When leaf.length > maxKeys, splice right half and copy right[0] into separators.' },
    ],
    starterCode: `function bPlusTreeSplitInsert(keys, maxKeys = 3) {\n  // TODO: return { separators, leaves }\n  return { separators: [], leaves: [[]] };\n}`,
    solutionCode: `function bPlusTreeSplitInsert(keys, maxKeys = 3) {\n  let leaves = [[]], separators = [];\n  for (const k of keys) {\n    let idx = 0;\n    while (idx < separators.length && k >= separators[idx]) idx++;\n    const leaf = leaves[idx];\n    leaf.push(k); leaf.sort((a, b) => a - b);\n    if (leaf.length > maxKeys) {\n      const mid = Math.ceil(leaf.length / 2);\n      const right = leaf.splice(mid);\n      leaves.splice(idx + 1, 0, right);\n      separators.splice(idx, 0, right[0]);\n    }\n  }\n  return { separators, leaves };\n}`,
    testCases: [
      { label: 'Sequential splits promote 30 and 50', args: [[10, 20, 30, 40, 50, 60], 3], expected: { separators: [30, 50], leaves: [[10, 20], [30, 40], [50, 60]] } },
    ],
  },
  'lsm-tree-compaction': {
    algorithmId: 'lsm-tree-compaction',
    title: 'LSM-Tree Layered Read & Tombstone Compaction',
    functionName: 'lsmCompactAndQuery',
    prompt: 'Query `queryKeys` newest-first across `memtable` then `sstables` (treating `"__DEL__"` as deleted `null`), and return `{ results, compacted }` where `compacted` is the sorted `[key, val][]` live entries after purging tombstones.',
    structuredSteps: [
      { step: '1. Newest-First Lookup', detail: 'Check memtable, then sstables[0..k-1]; stop immediately on first hit (including "__DEL__").' },
      { step: '2. Bottom-Up Layer Merge', detail: 'Overlay older SSTables first, then newer, then memtable.' },
      { step: '3. Purge Tombstones & Sort', detail: 'Filter out "__DEL__" entries and sort live pairs by key.' },
    ],
    starterCode: `function lsmCompactAndQuery(memtable, sstables, queryKeys) {\n  // TODO: return { results, compacted }\n  return { results: [], compacted: [] };\n}`,
    solutionCode: `function lsmCompactAndQuery(memtable, sstables, queryKeys) {\n  const lookup = (k) => {\n    if (Object.prototype.hasOwnProperty.call(memtable, k)) return memtable[k] === '__DEL__' ? null : memtable[k];\n    for (const sst of sstables) if (Object.prototype.hasOwnProperty.call(sst, k)) return sst[k] === '__DEL__' ? null : sst[k];\n    return null;\n  };\n  const compacted = {};\n  for (let i = sstables.length - 1; i >= 0; i--) Object.assign(compacted, sstables[i]);\n  Object.assign(compacted, memtable);\n  const liveEntries = Object.entries(compacted).filter(([, v]) => v !== '__DEL__').sort((a, b) => a[0].localeCompare(b[0]));\n  return { results: queryKeys.map(lookup), compacted: liveEntries };\n}`,
    testCases: [
      { label: 'Newest wins + tombstone hides stale disk key', args: [{ k1: 'v2', k2: '__DEL__' }, [{ k1: 'v1', k2: 'old', k3: 'v9' }], ['k1', 'k2', 'k3', 'k4']], expected: { results: ['v2', null, 'v9', null], compacted: [['k1', 'v2'], ['k3', 'v9']] } },
    ],
  },
  'external-kway-merge': {
    algorithmId: 'external-kway-merge',
    title: 'External Chunk Sort + K-Way Streaming Merge',
    functionName: 'externalKWayMerge',
    prompt: 'Split `data` into sorted runs of max size `chunkSize`, merge all K runs using K head pointers, and return `{ runCount, sorted }`.',
    structuredSteps: [
      { step: '1. Phase 1 Chunk Sorting', detail: 'Slice data by chunkSize and sort each run independently.' },
      { step: '2. Phase 2 K-Way Merge', detail: 'Track head pointer per run and repeatedly extract global minimum.' },
      { step: '3. Return Metadata', detail: 'Return total runCount and merged ascending array.' },
    ],
    starterCode: `function externalKWayMerge(data, chunkSize) {\n  // TODO: return { runCount, sorted }\n  return { runCount: 0, sorted: [] };\n}`,
    solutionCode: `function externalKWayMerge(data, chunkSize) {\n  const runs = [];\n  for (let i = 0; i < data.length; i += chunkSize) runs.push(data.slice(i, i + chunkSize).sort((a, b) => a - b));\n  const ptrs = new Array(runs.length).fill(0), out = [];\n  while (true) {\n    let bestRun = -1, bestVal = Infinity;\n    for (let r = 0; r < runs.length; r++) if (ptrs[r] < runs[r].length && runs[r][ptrs[r]] < bestVal) { bestVal = runs[r][ptrs[r]]; bestRun = r; }\n    if (bestRun === -1) break;\n    out.push(bestVal); ptrs[bestRun]++;\n  }\n  return { runCount: runs.length, sorted: out };\n}`,
    testCases: [
      { label: '3 RAM chunks merged cleanly', args: [[9, 2, 7, 4, 1, 8, 6, 3, 5], 3], expected: { runCount: 3, sorted: [1, 2, 3, 4, 5, 6, 7, 8, 9] } },
    ],
  },
  'aries-wal-recovery': {
    algorithmId: 'aries-wal-recovery',
    title: 'ARIES 3-Phase Crash Recovery Engine',
    functionName: 'ariesRecoverState',
    prompt: 'Given `initialPages` and `walRecords` (`BEGIN`, `UPDATE`, `COMMIT`), run ARIES Analysis → Redo → Undo Losers and return `{ pages, losers, redoOps, undoOps }`.',
    structuredSteps: [
      { step: '1. Analysis', detail: 'Track active transactions from BEGIN to COMMIT to find uncommitted losers.' },
      { step: '2. Redo History', detail: 'Replay every UPDATE record forward setting pages[page] = after.' },
      { step: '3. Undo Losers', detail: 'Walk WAL backwards reverting UPDATE records of loser transactions to before.' },
    ],
    starterCode: `function ariesRecoverState(initialPages, walRecords) {\n  // TODO: return { pages, losers, redoOps, undoOps }\n  return { pages: {}, losers: [], redoOps: 0, undoOps: 0 };\n}`,
    solutionCode: `function ariesRecoverState(initialPages, walRecords) {\n  const committed = new Set(), active = new Set();\n  for (const r of walRecords) {\n    if (r.type === 'BEGIN') active.add(r.txn);\n    else if (r.type === 'COMMIT') { committed.add(r.txn); active.delete(r.txn); }\n  }\n  const losers = [...active].sort(), pages = { ...initialPages };\n  let redoOps = 0, undoOps = 0;\n  for (const r of walRecords) if (r.type === 'UPDATE') { pages[r.page] = r.after; redoOps++; }\n  for (let i = walRecords.length - 1; i >= 0; i--) {\n    const r = walRecords[i];\n    if (r.type === 'UPDATE' && active.has(r.txn)) { pages[r.page] = r.before; undoOps++; }\n  }\n  return { pages, losers, redoOps, undoOps };\n}`,
    testCases: [
      { label: 'T1 committed survives, T2 loser rolled back', args: [{ P1: 100, P2: 99 }, [{ type: 'BEGIN', txn: 'T1' }, { type: 'UPDATE', txn: 'T1', page: 'P1', before: 100, after: 200 }, { type: 'COMMIT', txn: 'T1' }, { type: 'BEGIN', txn: 'T2' }, { type: 'UPDATE', txn: 'T2', page: 'P2', before: 50, after: 99 }]], expected: { pages: { P1: 200, P2: 50 }, losers: ['T2'], redoOps: 2, undoOps: 1 } },
    ],
  },
  'sql-joins-volcano': {
    algorithmId: 'sql-joins-volcano',
    title: 'In-Memory Equi Hash Join (Build + Probe)',
    functionName: 'hashJoinPairs',
    prompt: 'Implement an O(N + M) Hash Join joining `left = [id, name][]` (Build side) with `right = [userId, amount][]` (Probe side), emitting `[id, name, amount][]`.',
    structuredSteps: [
      { step: '1. Build Phase', detail: 'Populate Map<id, name[]> from left relation.' },
      { step: '2. Probe Phase', detail: 'Stream right rows looking up matching names in O(1).' },
      { step: '3. Emit Joined Tuples', detail: 'Push [uid, name, amt] for every match.' },
    ],
    starterCode: `function hashJoinPairs(left, right) {\n  // TODO: implement Hash Join\n  return [];\n}`,
    solutionCode: `function hashJoinPairs(left, right) {\n  const build = new Map();\n  for (const [id, name] of left) { if (!build.has(id)) build.set(id, []); build.get(id).push(name); }\n  const out = [];\n  for (const [uid, amt] of right) {\n    const names = build.get(uid);\n    if (!names) continue;\n    for (const name of names) out.push([uid, name, amt]);\n  }\n  return out;\n}`,
    testCases: [
      { label: 'One-to-many join + unmatched skip', args: [[[1, 'Ada'], [2, 'Lin']], [[1, 50], [3, 99], [2, 80], [1, 20]]], expected: [[1, 'Ada', 50], [2, 'Lin', 80], [1, 'Ada', 20]] },
    ],
  },
  'consistent-hashing-dht': {
    algorithmId: 'consistent-hashing-dht',
    title: 'Consistent Hashing Ring with Virtual Nodes',
    functionName: 'consistentHashRoute',
    prompt: 'Build a sorted FNV-1a Consistent Hash Ring with `vnodes` virtual replicas per node in `nodes`, and return the clockwise owner node for each key in `keys`.',
    structuredSteps: [
      { step: '1. Hash Virtual Nodes', detail: 'Hash node + "#" + v for v in 0..vnodes-1 and sort ring by pos.' },
      { step: '2. Binary Search Clockwise', detail: 'Find first ring entry with pos >= hash(key).' },
      { step: '3. Circular Wrap-Around', detail: 'Wrap to ring[0] when key hash exceeds the largest token.' },
    ],
    starterCode: `function consistentHashRoute(nodes, keys, vnodes = 3) {\n  // TODO: return owner node string for each key\n  return [];\n}`,
    solutionCode: `function consistentHashRoute(nodes, keys, vnodes = 3) {\n  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };\n  const ring = [];\n  for (const node of nodes) for (let v = 0; v < vnodes; v++) ring.push({ pos: hash(node + '#' + v), node });\n  ring.sort((a, b) => a.pos - b.pos);\n  return keys.map((k) => {\n    const kh = hash(k);\n    let lo = 0, hi = ring.length;\n    while (lo < hi) { const mid = (lo + hi) >> 1; if (ring[mid].pos < kh) lo = mid + 1; else hi = mid; }\n    return ring[lo === ring.length ? 0 : lo].node;\n  });\n}`,
    testCases: [
      { label: 'Deterministic single-node ring', args: [['nodeA'], ['k1', 'k2', 'k3'], 3], expected: ['nodeA', 'nodeA', 'nodeA'] },
    ],
  },
  'raft-paxos-consensus': {
    algorithmId: 'raft-paxos-consensus',
    title: 'Raft Quorum Leader Election & Log Commit',
    functionName: 'raftElectAndCommit',
    prompt: 'Simulate Raft RequestVote up-to-date log checks for `candidateId` at `term` across `nodes`, and if elected by strict majority, commit `newEntry` if alive peers form a quorum.',
    structuredSteps: [
      { step: '1. Compute Quorum', detail: 'majority = Math.floor(nodes.length / 2) + 1.' },
      { step: '2. Up-To-Date Log Rule', detail: 'Grant vote iff term > peer.term AND (candTerm > peerTerm || (same && candIdx >= peerIdx)).' },
      { step: '3. Replicate & Commit', detail: 'Commit at lastLogIndex + 1 only if alive acks >= majority.' },
    ],
    starterCode: `function raftElectAndCommit(nodes, candidateId, term, newEntry) {\n  // TODO: return { elected, votes, committed, committedIndex, entry }\n  return { elected: false, votes: 0, committed: false, committedIndex: -1, entry: null };\n}`,
    solutionCode: `function raftElectAndCommit(nodes, candidateId, term, newEntry) {\n  const majority = Math.floor(nodes.length / 2) + 1;\n  const cand = nodes.find((n) => n.id === candidateId);\n  if (!cand) return { elected: false, committedIndex: -1 };\n  let votes = 0;\n  for (const peer of nodes) {\n    const upToDate = cand.lastLogTerm > peer.lastLogTerm || (cand.lastLogTerm === peer.lastLogTerm && cand.lastLogIndex >= peer.lastLogIndex);\n    if (term > peer.term && upToDate) votes++;\n  }\n  if (votes < majority) return { elected: false, votes, committedIndex: -1 };\n  const nextIdx = cand.lastLogIndex + 1;\n  const acks = nodes.filter((n) => n.alive !== false).length;\n  const committed = acks >= majority;\n  return { elected: true, votes, committed, committedIndex: committed ? nextIdx : -1, entry: newEntry };\n}`,
    testCases: [
      { label: 'Up-to-date candidate wins 3/3 quorum & commits', args: [[{ id: 'S1', term: 1, lastLogTerm: 1, lastLogIndex: 4, alive: true }, { id: 'S2', term: 1, lastLogTerm: 1, lastLogIndex: 4, alive: true }, { id: 'S3', term: 1, lastLogTerm: 1, lastLogIndex: 3, alive: true }], 'S2', 2, 'x=42'], expected: { elected: true, votes: 3, committed: true, committedIndex: 5, entry: 'x=42' } },
      { label: 'Stale candidate rejected by Election Safety', args: [[{ id: 'S1', term: 1, lastLogTerm: 2, lastLogIndex: 5 }, { id: 'S2', term: 1, lastLogTerm: 2, lastLogIndex: 5 }, { id: 'S3', term: 1, lastLogTerm: 1, lastLogIndex: 2 }], 'S3', 3, 'bad'], expected: { elected: false, votes: 1, committedIndex: -1 } },
    ],
  },
  'gossip-phi-accrual': {
    algorithmId: 'gossip-phi-accrual',
    title: 'Epidemic Gossip Convergence & Phi Accrual Detector',
    functionName: 'gossipConvergenceAndPhi',
    prompt: 'Simulate epidemic gossip convergence on `n` nodes with fanout `fanout` and compute Phi Accrual suspicion `Φ = −log₁₀(exp(−elapsedMs / meanIntervalMs))` (flagged down at `Φ ≥ 8`).',
    structuredSteps: [
      { step: '1. Round-Based Epidemic Fanout', detail: 'Each informed node pushes to fanout deterministic peers until all n nodes converge.' },
      { step: '2. Compute Tail Probability', detail: 'pLater = Math.exp(-elapsedMs / Math.max(meanIntervalMs, 1)).' },
      { step: '3. Suspicion Score Φ', detail: 'phi = -Math.log10(pLater) rounded to 2 decimals; suspectedDown = phi >= 8.' },
    ],
    starterCode: `function gossipConvergenceAndPhi(n, fanout, elapsedMs, meanIntervalMs) {\n  // TODO: return { rounds, infectedCount, phi, suspectedDown }\n  return { rounds: 0, infectedCount: 0, phi: 0, suspectedDown: false };\n}`,
    solutionCode: `function gossipConvergenceAndPhi(n, fanout, elapsedMs, meanIntervalMs) {\n  const infected = new Set([0]); let rounds = 0;\n  while (infected.size < n && rounds < 50) {\n    rounds++;\n    for (const src of [...infected]) for (let f = 1; f <= fanout; f++) infected.add((src * 31 + rounds * 17 + f * 7) % n);\n  }\n  const pLater = Math.exp(-elapsedMs / Math.max(meanIntervalMs, 1));\n  const phi = Number((-Math.log10(Math.max(pLater, 1e-12))).toFixed(2));\n  return { rounds, infectedCount: infected.size, phi, suspectedDown: phi >= 8 };\n}`,
    testCases: [
      { label: 'Long silence triggers Φ ≥ 8 conviction', args: [8, 2, 20000, 1000], expected: { rounds: 6, infectedCount: 8, phi: 8.69, suspectedDown: true } },
      { label: 'Brief GC jitter stays alive', args: [8, 2, 2000, 1000], expected: { rounds: 6, infectedCount: 8, phi: 0.87, suspectedDown: false } },
    ],
  },
  'merkle-tree-sync': {
    algorithmId: 'merkle-tree-sync',
    title: 'Merkle Tree Anti-Entropy Diff Finder',
    functionName: 'merkleDiffIndices',
    prompt: 'Build binary Merkle Trees for equal-length block arrays `blocksA` and `blocksB`, prune identical subtrees in O(1), and return `{ rootMatch, diffs, comparisons }`.',
    structuredSteps: [
      { step: '1. Recursive Bottom-Up Hashing', detail: 'Leaf hash = hash(block); parent hash = hash(left.h + "|" + right.h).' },
      { step: '2. Prune Equal Hashes', detail: 'Stop descending immediately whenever a.h === b.h.' },
      { step: '3. Collect Divergent Leaf Indices', detail: 'Push leaf index when mismatched leaf reached.' },
    ],
    starterCode: `function merkleDiffIndices(blocksA, blocksB) {\n  // TODO: return { rootMatch, diffs, comparisons }\n  return { rootMatch: false, diffs: [], comparisons: 0 };\n}`,
    solutionCode: `function merkleDiffIndices(blocksA, blocksB) {\n  const hash = (s) => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return (h >>> 0).toString(16); };\n  const build = (arr, l, r) => { if (l === r) return { h: hash(String(arr[l])), l: null, r: null, idx: l }; const m = (l + r) >> 1; const left = build(arr, l, m), right = build(arr, m + 1, r); return { h: hash(left.h + '|' + right.h), l: left, r: right, idx: -1 }; };\n  const rootA = build(blocksA, 0, blocksA.length - 1), rootB = build(blocksB, 0, blocksB.length - 1);\n  const diffs = []; let comparisons = 0;\n  const walk = (a, b) => { comparisons++; if (a.h === b.h) return; if (a.idx !== -1) { diffs.push(a.idx); return; } walk(a.l, b.l); walk(a.r, b.r); };\n  walk(rootA, rootB);\n  return { rootMatch: rootA.h === rootB.h, diffs, comparisons };\n}`,
    testCases: [
      { label: 'Pinpoints single corrupt leaf pruning left half', args: [['k0', 'k1', 'k2', 'k3'], ['k0', 'k1', 'BAD', 'k3']], expected: { rootMatch: false, diffs: [2], comparisons: 5 } },
      { label: 'Identical replicas exit in 1 root comparison', args: [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd']], expected: { rootMatch: true, diffs: [], comparisons: 1 } },
    ],
  },
  'vector-clocks-lamport': {
    algorithmId: 'vector-clocks-lamport',
    title: 'Vector Clock Causality Comparator & Merger',
    functionName: 'compareAndMergeVectorClocks',
    prompt: 'Compare two Vector Clocks `va` and `vb` to classify causality (`"EQUAL"`, `"BEFORE"`, `"AFTER"`, or `"CONCURRENT"`) and return `{ relation, merged }` using element-wise `max`.',
    structuredSteps: [
      { step: '1. Pairwise Dominance Flags', detail: 'Track whether all va[i] <= vb[i] (le) and all va[i] >= vb[i] (ge).' },
      { step: '2. Classify Relation', detail: 'le && ge -> EQUAL; le -> BEFORE; ge -> AFTER; else -> CONCURRENT.' },
      { step: '3. Element-Wise Max Merge', detail: 'Return merged[i] = Math.max(va[i], vb[i]).' },
    ],
    starterCode: `function compareAndMergeVectorClocks(va, vb) {\n  // TODO: return { relation, merged }\n  return { relation: 'EQUAL', merged: [] };\n}`,
    solutionCode: `function compareAndMergeVectorClocks(va, vb) {\n  let le = true, ge = true;\n  const merged = va.map((a, i) => { const b = vb[i]; if (a > b) le = false; if (a < b) ge = false; return Math.max(a, b); });\n  const relation = le && ge ? 'EQUAL' : le ? 'BEFORE' : ge ? 'AFTER' : 'CONCURRENT';\n  return { relation, merged };\n}`,
    testCases: [
      { label: 'Causal happened-before', args: [[1, 0, 0], [1, 1, 0]], expected: { relation: 'BEFORE', merged: [1, 1, 0] } },
      { label: 'Concurrent split-brain conflict', args: [[2, 0, 0], [1, 1, 0]], expected: { relation: 'CONCURRENT', merged: [2, 1, 0] } },
    ],
  },
  'crdt-gcounter-orset': {
    algorithmId: 'crdt-gcounter-orset',
    title: 'Join-Semilattice G-Counter & PN-Counter CRDT Merge',
    functionName: 'crdtMergeAndValue',
    prompt: 'Merge an array of `gCounters` (`number[][]`) and `pnPairs` (`{p: number[], n: number[]}[]`) via element-wise `max()`, returning `{ mergedG, gTotal, pnValue }`.',
    structuredSteps: [
      { step: '1. G-Counter Lattice Join', detail: 'Take Math.max across every slot i to ensure idempotent, order-independent merge.' },
      { step: '2. PN-Counter Dual Merge', detail: 'Merge P vectors via max() and N vectors via max() independently.' },
      { step: '3. Evaluate Totals', detail: 'gTotal = sum(mergedG); pnValue = sum(mergedP) - sum(mergedN).' },
    ],
    starterCode: `function crdtMergeAndValue(gCounters, pnPairs) {\n  // TODO: return { mergedG, gTotal, pnValue }\n  return { mergedG: [], gTotal: 0, pnValue: 0 };\n}`,
    solutionCode: `function crdtMergeAndValue(gCounters, pnPairs) {\n  const dim = gCounters[0].length, mergedG = new Array(dim).fill(0);\n  for (const vec of gCounters) for (let i = 0; i < dim; i++) mergedG[i] = Math.max(mergedG[i], vec[i]);\n  const gTotal = mergedG.reduce((s, v) => s + v, 0);\n  const mergedP = new Array(dim).fill(0), mergedN = new Array(dim).fill(0);\n  for (const { p, n } of pnPairs) for (let i = 0; i < dim; i++) { mergedP[i] = Math.max(mergedP[i], p[i]); mergedN[i] = Math.max(mergedN[i], n[i]); }\n  return { mergedG, gTotal, pnValue: mergedP.reduce((s, v) => s + v, 0) - mergedN.reduce((s, v) => s + v, 0) };\n}`,
    testCases: [
      { label: 'Duplicate & out-of-order deliveries converge identically', args: [[[2, 0, 0], [0, 3, 0], [2, 0, 0], [0, 0, 1]], [{ p: [5, 1, 0], n: [1, 0, 0] }, { p: [2, 3, 1], n: [0, 2, 0] }]], expected: { mergedG: [2, 3, 1], gTotal: 6, pnValue: 6 } },
    ],
  },
});
