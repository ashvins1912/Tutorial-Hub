import { AlgorithmDefinition } from './algorithmsCatalog';

export interface Master73Item {
  number: number;
  section: 'core' | 'advanced' | 'systems';
  subsection: string;
  title: string;
  algorithmId: string;
  secondaryAlgorithmId?: string;
  productionUse: string;
  linkedProblem: string;
  comboPartner?: { id: string; label: string };
}

export interface AlgorithmPowerCombo {
  id: string;
  title: string;
  partnerIds: string[];
  synergyOutput: string;
  architectureFlow: string;
  interviewUseCase: string;
}

export interface AlgorithmFlowStage {
  step: string;
  title: string;
  role: 'Input' | 'Structure' | 'Engine' | 'Output';
  summary: string;
  cost: string;
  guardrail: string;
}

export const MASTER_73_SECTIONS: {
  id: 'core' | 'advanced' | 'systems';
  title: string;
  range: string;
  subtitle: string;
}[] = [
  {
    id: 'core',
    title: '1. Core Data Structures & Coding Patterns (Foundational)',
    range: '#01 – #34',
    subtitle: 'Arrays, strings, lists, stacks, trees, heaps, core graphs, and hash tables tested in 85% of FAANG interviews.',
  },
  {
    id: 'advanced',
    title: '2. Advanced & Competitive Algorithms',
    range: '#35 – #62',
    subtitle: 'Range queries, spatial trees, compression, flow/matching, probabilistic sketches, caches, and lock-free concurrency.',
  },
  {
    id: 'systems',
    title: '3. Database & Distributed Systems Internals',
    range: '#63 – #73',
    subtitle: 'Storage engines, crash recovery, SQL query execution, consistent routing, consensus, anti-entropy sync, and CRDTs.',
  },
];

export const MASTER_73_ROADMAP: Master73Item[] = [
  // Section 1: Core (#1–#34)
  { number: 1, section: 'core', subsection: 'Arrays & Strings', title: 'Linear Search', algorithmId: 'linear-search', productionUse: 'Small cache-hot array scans (N ≤ 32) & single-pass streams', linkedProblem: 'Find First Occurrence', comboPartner: { id: 'hash-table-probing', label: 'Upgrade to Hash Map O(1)' } },
  { number: 2, section: 'core', subsection: 'Arrays & Strings', title: 'Binary Search', algorithmId: 'binary-search', productionUse: 'Sorted index lookup & Binary Search on Answer', linkedProblem: 'LC 33 / LC 875 Koko Bananas', comboPartner: { id: 'greedy-algorithms', label: 'Binary Search + Greedy Feasibility' } },
  { number: 3, section: 'core', subsection: 'Arrays & Strings', title: 'Interpolation Search', algorithmId: 'interpolation-search', productionUse: 'Uniformly spaced timestamp/ID column pages', linkedProblem: 'Uniform Key Lookup O(log log N)', comboPartner: { id: 'binary-search', label: 'Hybrid Binary Fallback' } },
  { number: 4, section: 'core', subsection: 'Arrays & Strings', title: 'Quick Sort', algorithmId: 'merge-sort-divide-conquer', secondaryAlgorithmId: 'quickselect', productionUse: 'C++ Introsort fast-path & in-place partitioning', linkedProblem: 'LC 912 / LC 215 Quickselect', comboPartner: { id: 'heapify-heapsort', label: 'Introsort = Quick + Heap + Insertion' } },
  { number: 5, section: 'core', subsection: 'Arrays & Strings', title: 'Merge Sort', algorithmId: 'merge-sort-divide-conquer', productionUse: 'Stable sorting, inversion counting & TimSort runs', linkedProblem: 'LC 148 Sort List / Count Inversions', comboPartner: { id: 'elementary-sorts', label: 'TimSort = Merge + Insertion' } },
  { number: 6, section: 'core', subsection: 'Arrays & Strings', title: 'Heap Sort', algorithmId: 'heapify-heapsort', productionUse: 'Linux kernel sort() & Introsort O(N log N) worst-case safety net', linkedProblem: 'LC 912 O(1) Space Sort', comboPartner: { id: 'merge-sort-divide-conquer', label: 'QuickSort + HeapSort Fallback' } },
  { number: 7, section: 'core', subsection: 'Arrays & Strings', title: 'Bubble, Insertion, & Selection Sort', algorithmId: 'elementary-sorts', productionUse: 'TimSort/Introsort N ≤ 32 base case & nearly sorted streams', linkedProblem: 'LC 147 Insertion Sort List', comboPartner: { id: 'merge-sort-divide-conquer', label: 'Hybrid Cutoff Merge/QuickSort' } },
  { number: 8, section: 'core', subsection: 'Arrays & Strings', title: 'Counting Sort & Radix Sort', algorithmId: 'counting-radix-sort', productionUse: 'O(N) integer sorting, GPU sorting & Suffix Array doubling', linkedProblem: 'LC 164 Maximum Gap', comboPartner: { id: 'suffix-array-lcp', label: 'Radix + Suffix Array O(N log N)' } },
  { number: 9, section: 'core', subsection: 'Arrays & Strings', title: 'Kadane’s Algorithm (Maximum Subarray)', algorithmId: 'kadanes-algorithm', productionUse: 'Financial max drawdown / max gain streaming window', linkedProblem: 'LC 53 / LC 918 Circular Subarray', comboPartner: { id: 'prefix-sum-hash', label: 'Prefix Sum + Kadane 2D Matrix' } },
  { number: 10, section: 'core', subsection: 'Arrays & Strings', title: 'Two-Pointer Technique', algorithmId: 'two-pointers', productionUse: 'Sorted pair matching, SQL Sort-Merge Join & rain trapping', linkedProblem: 'LC 15 3Sum / LC 42 Trapping Rain Water', comboPartner: { id: 'sql-joins-volcano', label: 'Powers Sort-Merge Join' } },
  { number: 11, section: 'core', subsection: 'Arrays & Strings', title: 'Sliding Window Technique', algorithmId: 'sliding-window', productionUse: 'API rate limiters, network TCP flow & contiguous subarrays', linkedProblem: 'LC 76 Minimum Window Substring', comboPartner: { id: 'monotonic-deque', label: 'Sliding Window + Monotonic Deque' } },
  { number: 12, section: 'core', subsection: 'Arrays & Strings', title: 'Knuth-Morris-Pratt (KMP) Pattern Matching', algorithmId: 'kmp-rabin-karp', productionUse: 'Zero-backtrack linear streaming text search', linkedProblem: 'LC 28 / LC 1392 Longest Happy Prefix', comboPartner: { id: 'z-algorithm', label: 'KMP Prefix Table vs Z-Array' } },
  { number: 13, section: 'core', subsection: 'Arrays & Strings', title: 'Rabin-Karp Rolling Hash', algorithmId: 'kmp-rabin-karp', productionUse: 'Plagiarism detection, rsync CDC chunking & 2D pattern search', linkedProblem: 'LC 1044 Longest Duplicate Substring', comboPartner: { id: 'binary-search', label: 'Binary Search + Rolling Hash' } },
  { number: 14, section: 'core', subsection: 'Linked Lists, Stacks & Queues', title: 'Floyd’s Cycle-Finding (Tortoise & Hare)', algorithmId: 'fast-slow-pointers', productionUse: 'O(1) cycle detection, midpoint discovery & Pollard’s Rho', linkedProblem: 'LC 142 / LC 287 Duplicate Number', comboPartner: { id: 'linked-list-reversal', label: 'Midpoint + In-Place Reversal (LC 234)' } },
  { number: 15, section: 'core', subsection: 'Linked Lists, Stacks & Queues', title: 'In-Place Linked List Reversal', algorithmId: 'linked-list-reversal', productionUse: 'Zero-allocation pointer reversal & K-group batch flipping', linkedProblem: 'LC 206 / LC 25 Reverse K-Group', comboPartner: { id: 'fast-slow-pointers', label: 'Reorder / Palindrome List' } },
  { number: 16, section: 'core', subsection: 'Linked Lists, Stacks & Queues', title: 'Shunting-Yard Algorithm (Expression Parsing)', algorithmId: 'shunting-yard-parser', productionUse: 'Spreadsheet formula compilers & SQL WHERE evaluators', linkedProblem: 'LC 227 / LC 772 Basic Calculator III', comboPartner: { id: 'monotonic-stack', label: 'Precedence Monotonic Operator Stack' } },
  { number: 17, section: 'core', subsection: 'Linked Lists, Stacks & Queues', title: 'Monotonic Stack / Monotonic Queue', algorithmId: 'monotonic-stack', secondaryAlgorithmId: 'monotonic-deque', productionUse: 'Histogram bounds, sliding extrema & O(N) DP queue optimization', linkedProblem: 'LC 84 Histogram / LC 239 Window Max', comboPartner: { id: 'dynamic-programming', label: 'Monotonic Deque + DP O(N)' } },
  { number: 18, section: 'core', subsection: 'Trees & Heaps', title: 'Depth-First Search (In-order, Pre-order, Post-order)', algorithmId: 'depth-first-search', productionUse: 'AST evaluation, serialization, garbage collection & cycle detection', linkedProblem: 'LC 124 Max Path Sum / LC 297 Serialize', comboPartner: { id: 'dp-on-trees-rerooting', label: 'Post-Order DFS + Tree DP' } },
  { number: 19, section: 'core', subsection: 'Trees & Heaps', title: 'Breadth-First Search (Level-order)', algorithmId: 'tree-bfs-dfs', productionUse: 'Shortest unweighted hops, social degrees & multi-source spread', linkedProblem: 'LC 102 Level Order / LC 994 Rotting Oranges', comboPartner: { id: 'bidirectional-bfs', label: 'Bidirectional BFS O(b^(d/2))' } },
  { number: 20, section: 'core', subsection: 'Trees & Heaps', title: 'AVL & Red-Black Tree Rotations', algorithmId: 'avl-red-black-trees', productionUse: 'Java TreeMap, C++ std::map, Linux CFS scheduler & epoll', linkedProblem: 'LC 1382 Balance BST / LC 729 Calendar', comboPartner: { id: 'bplus-tree-storage', label: 'Disk Evolution → B+ Tree' } },
  { number: 21, section: 'core', subsection: 'Trees & Heaps', title: 'Lowest Common Ancestor (LCA)', algorithmId: 'binary-lifting-lca', productionUse: 'Git merge-base, tree path distance & O(log N) ancestor jumps', linkedProblem: 'LC 236 LCA / LC 1483 Kth Ancestor', comboPartner: { id: 'heavy-light-decomposition', label: 'LCA + HLD Path Queries' } },
  { number: 22, section: 'core', subsection: 'Trees & Heaps', title: 'Huffman Coding', algorithmId: 'huffman-coding', productionUse: 'gzip/DEFLATE, PNG, JPEG & HTTP/2 HPACK entropy coding', linkedProblem: 'LC 1167 Minimum Cost to Connect Sticks', comboPartner: { id: 'lzw-compression', label: 'LZ/Dictionary + Huffman = DEFLATE' } },
  { number: 23, section: 'core', subsection: 'Trees & Heaps', title: 'Trie Prefix Search & Auto-Complete', algorithmId: 'trie-prefix-autocomplete', productionUse: 'Search autocomplete, IP routing tables & DFS dictionary pruning', linkedProblem: 'LC 208 Implement Trie / LC 212 Word Search II', comboPartner: { id: 'aho-corasick', label: 'Trie + KMP Failure Links = Aho-Corasick' } },
  { number: 24, section: 'core', subsection: 'Trees & Heaps', title: 'Heapify (Up/Down) & Build-Heap', algorithmId: 'heapify-heapsort', productionUse: 'O(N) priority queue initialization & task schedulers', linkedProblem: 'LC 215 Kth Largest / Heapify O(N)', comboPartner: { id: 'dijkstra-shortest-path', label: 'Min-Heap Powers Dijkstra' } },
  { number: 25, section: 'core', subsection: 'Trees & Heaps', title: 'Top-K Elements & Two-Heap Median Maintenance', algorithmId: 'dual-heaps-median', secondaryAlgorithmId: 'heap-intervals', productionUse: 'Real-time p50 latency median, Top-K streams & meeting rooms', linkedProblem: 'LC 295 Find Median / LC 347 Top K', comboPartner: { id: 'hash-table-probing', label: 'Dual Heaps + Lazy-Delete HashMap (LC 480)' } },
  { number: 26, section: 'core', subsection: 'Graphs', title: 'Dijkstra’s Shortest Path', algorithmId: 'dijkstra-shortest-path', productionUse: 'OSPF network routing & Google Maps weighted road graphs', linkedProblem: 'LC 743 Network Delay / LC 778 Swim Water', comboPartner: { id: 'a-star-search', label: 'Dijkstra + Heuristic = A* Search' } },
  { number: 27, section: 'core', subsection: 'Graphs', title: 'Bellman-Ford Algorithm', algorithmId: 'bellman-ford', productionUse: 'Negative-weight shortest paths, K-stop flights & FX arbitrage', linkedProblem: 'LC 787 Cheapest Flights Within K Stops', comboPartner: { id: 'johnsons-all-pairs', label: 'Bellman-Ford + Dijkstra = Johnson’s' } },
  { number: 28, section: 'core', subsection: 'Graphs', title: 'Floyd-Warshall (All-Pairs Shortest Path)', algorithmId: 'floyd-warshall', productionUse: 'Dense small graphs (V ≤ 400) & transitive closure matrices', linkedProblem: 'LC 1334 Smallest City Threshold', comboPartner: { id: 'johnsons-all-pairs', label: 'Sparse Upgrade → Johnson’s' } },
  { number: 29, section: 'core', subsection: 'Graphs', title: 'A* Search Algorithm', algorithmId: 'a-star-search', productionUse: 'GPS turn-by-turn routing & robotics/game grid pathfinding', linkedProblem: 'LC 1091 Shortest Path in Binary Matrix', comboPartner: { id: 'bidirectional-bfs', label: 'Bidirectional A* Search' } },
  { number: 30, section: 'core', subsection: 'Graphs', title: 'Kruskal’s & Prim’s Minimum Spanning Tree (MST)', algorithmId: 'kruskals-mst', secondaryAlgorithmId: 'prims-mst', productionUse: 'Fiber/power grid wiring, single-linkage clustering & LAN spanning tree', linkedProblem: 'LC 1584 Min Cost Connect All Points', comboPartner: { id: 'union-find-dsu', label: 'Kruskal’s Powered by Union-Find DSU' } },
  { number: 31, section: 'core', subsection: 'Graphs', title: 'Topological Sort (Kahn’s Algorithm)', algorithmId: 'graph-topo-sort', productionUse: 'Bazel/Webpack build order, Airflow DAGs & package managers', linkedProblem: 'LC 210 Course Schedule II / LC 269 Alien Dict', comboPartner: { id: 'dynamic-programming', label: 'Topo Sort + DAG Longest-Path DP' } },
  { number: 32, section: 'core', subsection: 'Graphs', title: 'Tarjan’s & Kosaraju’s (Strongly Connected Components)', algorithmId: 'tarjan-kosaraju-scc', productionUse: 'Deadlock cycles, 2-SAT solvers & condensation DAG compression', linkedProblem: '2-SAT / Directed Cycle Condensation', comboPartner: { id: 'graph-topo-sort', label: 'SCC Condensation → DAG Topo DP' } },
  { number: 33, section: 'core', subsection: 'Graphs', title: 'Disjoint Set Union / Union-Find (Path Compression & Rank)', algorithmId: 'union-find-dsu', productionUse: 'O(α(N)) dynamic connectivity, image segmentation & Kruskal MST', linkedProblem: 'LC 684 Redundant Connection / LC 721 Accounts Merge', comboPartner: { id: 'kruskals-mst', label: 'DSU + Sorted Edges = Kruskal MST' } },
  { number: 34, section: 'core', subsection: 'Hash Tables', title: 'Chaining & Open Addressing (Probing & Double Hashing)', algorithmId: 'hash-table-probing', productionUse: 'Python dict, Rust SwissTable, Java HashMap (treeified buckets)', linkedProblem: 'LC 706 Design HashMap / LC 380 O(1) RandomizedSet', comboPartner: { id: 'cache-lru-lfu-arc', label: 'Hash Table + DLL = O(1) LRU Cache' } },

  // Section 2: Advanced & Competitive (#35–#62)
  { number: 35, section: 'advanced', subsection: 'Range Queries & Spatial', title: 'Segment Trees & Lazy Propagation', algorithmId: 'segment-tree-lazy', productionUse: 'Dynamic range-add + range-min/max/sum in O(log N)', linkedProblem: 'LC 307 Range Sum Mutable / LC 699 Falling Squares', comboPartner: { id: 'heavy-light-decomposition', label: 'HLD + Segment Tree = Tree Path Queries' } },
  { number: 36, section: 'advanced', subsection: 'Range Queries & Spatial', title: 'Fenwick Trees (Binary Indexed Trees)', algorithmId: 'fenwick-tree-bit', productionUse: 'Ultra-compact O(log N) prefix sums & inversion counts', linkedProblem: 'LC 315 Count Smaller After Self', comboPartner: { id: 'binary-search', label: 'BIT Binary Lifting K-th Order Statistic' } },
  { number: 37, section: 'advanced', subsection: 'Range Queries & Spatial', title: 'Splay Tree Rotations', algorithmId: 'splay-tree-rotations', productionUse: 'Working-set hot caches & Link-Cut dynamic trees', linkedProblem: 'Dynamic Sequence Split/Reverse', comboPartner: { id: 'cache-lru-lfu-arc', label: 'Self-Adjusting Locality vs Explicit LRU' } },
  { number: 38, section: 'advanced', subsection: 'Range Queries & Spatial', title: 'K-D Trees (Nearest Neighbor Search)', algorithmId: 'kd-tree-nearest-neighbor', productionUse: 'Low-D GPS nearest neighbor, LiDAR & 3D ray tracing', linkedProblem: 'LC 973 K Closest Points (Dynamic)', comboPartner: { id: 'quadtree-octree-spatial', label: 'K-D Tree vs Adaptive Quadtree' } },
  { number: 39, section: 'advanced', subsection: 'Range Queries & Spatial', title: 'Quadtrees & Octrees', algorithmId: 'quadtree-octree-spatial', productionUse: 'Uber/Yelp proximity tiles, 2D/3D game physics & voxel engines', linkedProblem: 'LC 427 Construct Quad Tree', comboPartner: { id: 'consistent-hashing-dht', label: 'Quadtree + Sharded Geo-Workers' } },
  { number: 40, section: 'advanced', subsection: 'Range Queries & Spatial', title: 'Graham Scan & Jarvis March (Convex Hull)', algorithmId: 'convex-hull-graham-scan', productionUse: 'Collision bounding hulls, GIS geofencing & CHT DP envelopes', linkedProblem: 'LC 587 Erect the Fence', comboPartner: { id: 'convex-hull-trick', label: 'Lower Convex Hull Powers CHT DP' } },
  { number: 41, section: 'advanced', subsection: 'Advanced Strings & Compression', title: 'Suffix Arrays & Kasai’s LCP Algorithm', algorithmId: 'suffix-array-lcp', productionUse: 'Distinct substring counts, longest repeated substring & BWT build', linkedProblem: 'LC 1044 Longest Duplicate Substring', comboPartner: { id: 'bwt-fm-index', label: 'Suffix Array + BWT = FM-Index' } },
  { number: 42, section: 'advanced', subsection: 'Advanced Strings & Compression', title: 'Aho-Corasick Multi-Pattern Matching', algorithmId: 'aho-corasick', productionUse: 'Antivirus/IDS signature engines, profanity & DLP scanners', linkedProblem: 'LC 1032 Stream of Characters', comboPartner: { id: 'trie-prefix-autocomplete', label: 'Built by Adding KMP Links to a Trie' } },
  { number: 43, section: 'advanced', subsection: 'Advanced Strings & Compression', title: 'Z-Algorithm', algorithmId: 'z-algorithm', productionUse: 'O(N) pattern matching & prefix-vs-suffix string borders', linkedProblem: 'LC 2223 Sum of Scores of Built Strings', comboPartner: { id: 'kmp-rabin-karp', label: 'Simpler Z-Box Alternative to KMP' } },
  { number: 44, section: 'advanced', subsection: 'Advanced Strings & Compression', title: 'Manacher’s Algorithm (Longest Palindrome)', algorithmId: 'manachers-algorithm', productionUse: 'Strict O(N) longest palindromic substring via mirror reuse', linkedProblem: 'LC 5 Longest Palindromic Substring', comboPartner: { id: 'z-algorithm', label: 'Rightmost-Box Mirror Paradigm' } },
  { number: 45, section: 'advanced', subsection: 'Advanced Strings & Compression', title: 'Burrows-Wheeler Transform (BWT) & FM-Index', algorithmId: 'bwt-fm-index', productionUse: 'bzip2 compression & Bowtie2/BWA human genome aligners', linkedProblem: 'Compressed O(|P|) Backward Search', comboPartner: { id: 'huffman-coding', label: 'BWT + MTF + RLE + Huffman = bzip2' } },
  { number: 46, section: 'advanced', subsection: 'Advanced Strings & Compression', title: 'Lempel-Ziv-Welch (LZW) Compression', algorithmId: 'lzw-compression', productionUse: 'GIF, TIFF, PDF streams & adaptive dictionary coding', linkedProblem: 'LC 443 Compression / KwKwK Codec', comboPartner: { id: 'huffman-coding', label: 'Dictionary Coding + Huffman Entropy' } },
  { number: 47, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Ford-Fulkerson, Edmonds-Karp, & Dinic’s (Max Flow)', algorithmId: 'max-flow-edmonds-karp', productionUse: 'Network bandwidth routing, min-cut image segmentation & project selection', linkedProblem: 'Max-Flow / Min-Cut Project Selection', comboPartner: { id: 'hopcroft-karp-hungarian', label: 'Unit-Cap Dinic’s = Hopcroft-Karp O(E√V)' } },
  { number: 48, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Hopcroft-Karp & Hungarian (Bipartite Matching)', algorithmId: 'hopcroft-karp-hungarian', productionUse: 'Driver-rider dispatch, ad-slot allocation & multi-object tracking', linkedProblem: 'LC 1349 Max Students / LC 1947 Assignment', comboPartner: { id: 'bipartite-graph-coloring', label: 'Verify 2-Colorability First' } },
  { number: 49, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Hierholzer’s & Fleury’s (Eulerian Paths)', algorithmId: 'eulerian-hierholzer', productionUse: 'DNA De Bruijn genome assembly, flight itineraries & PCB routing', linkedProblem: 'LC 332 Reconstruct Itinerary / LC 2097', comboPartner: { id: 'depth-first-search', label: 'Post-Order DFS Edge Splicing' } },
  { number: 50, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Tarjan’s Bridge-Finding Algorithm', algorithmId: 'tarjan-bridges-articulation', productionUse: 'Datacenter single-point-of-failure & critical link auditing', linkedProblem: 'LC 1192 Critical Connections in Network', comboPartner: { id: 'tarjan-kosaraju-scc', label: 'Shared disc[] & low[] DFS Framework' } },
  { number: 51, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Johnson’s Algorithm', algorithmId: 'johnsons-all-pairs', productionUse: 'Sparse all-pairs shortest path with negative weights', linkedProblem: 'Sparse Negative-Edge APSP', comboPartner: { id: 'dijkstra-shortest-path', label: 'Bellman-Ford Reweight + V× Dijkstra' } },
  { number: 52, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Heavy-Light Decomposition (HLD)', algorithmId: 'heavy-light-decomposition', productionUse: 'O(log² N) dynamic path updates & queries on trees', linkedProblem: 'QTREE Path Max & Point Update', comboPartner: { id: 'segment-tree-lazy', label: 'HLD Flattens Tree Paths for SegTree' } },
  { number: 53, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Centroid Decomposition', algorithmId: 'centroid-decomposition', productionUse: 'All-paths length-K counting & dynamic nearest-marked node', linkedProblem: 'CF 342E Xenia and Tree', comboPartner: { id: 'binary-lifting-lca', label: 'Centroid Tree + O(log N) LCA Distance' } },
  { number: 54, section: 'advanced', subsection: 'Advanced Graph Theory', title: 'Mo’s Algorithm (Square Root Decomposition)', algorithmId: 'mos-algorithm', productionUse: 'Offline distinct-in-range & mode frequency queries in O((N+Q)√N)', linkedProblem: 'DQUERY Distinct Values in [L, R]', comboPartner: { id: 'sliding-window', label: 'Block-Sorted Sliding Window' } },
  { number: 55, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Bloom Filters', algorithmId: 'bloom-filter', productionUse: 'RocksDB/Cassandra SSTable disk-skip & Chrome URL filtering', linkedProblem: '10B URL Deduplicator / SSTable Guard', comboPartner: { id: 'lsm-tree-compaction', label: 'Bloom Filter + LSM-Tree = Fast Reads' } },
  { number: 56, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Skip Lists', algorithmId: 'skip-list', productionUse: 'Redis Sorted Sets (ZSET), RocksDB MemTable & ConcurrentSkipListMap', linkedProblem: 'LC 1206 Design Skiplist', comboPartner: { id: 'lsm-tree-compaction', label: 'Skip List Powers LSM MemTables' } },
  { number: 57, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Count-Min Sketch', algorithmId: 'count-min-sketch', productionUse: 'Streaming heavy hitters, DDoS rate limits & Caffeine TinyLFU', linkedProblem: 'LC 347 Top-K at 1B Stream Scale', comboPartner: { id: 'heap-intervals', label: 'Count-Min Sketch + Size-K Min-Heap' } },
  { number: 58, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'HyperLogLog', algorithmId: 'hyperloglog', productionUse: 'Redis PFCOUNT & BigQuery APPROX_COUNT_DISTINCT in 12 KB', linkedProblem: '1B Unique Daily Visitors in 12 KB', comboPartner: { id: 'crdt-gcounter-orset', label: 'HLL Max-Merge Is a Valid CRDT!' } },
  { number: 59, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Cache Replacement (LRU, LFU, ARC)', algorithmId: 'cache-lru-lfu-arc', productionUse: 'DB buffer pools (InnoDB/ZFS ARC), CDNs & Redis eviction', linkedProblem: 'LC 146 LRU Cache / LC 460 LFU Cache', comboPartner: { id: 'count-min-sketch', label: 'W-TinyLFU = CMS Admission + LRU' } },
  { number: 60, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Buddy Memory Allocation', algorithmId: 'buddy-memory-allocator', productionUse: 'Linux Kernel physical page allocator (XOR buddy coalescing)', linkedProblem: 'LC 2502 Design Memory Allocator', comboPartner: { id: 'bit-manipulation', label: 'O(1) XOR Bitwise Buddy Calculation' } },
  { number: 61, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Persistent Path Copying & Fat Node Versioning', algorithmId: 'persistent-data-structures', productionUse: 'Git object DAG, ZFS/Btrfs CoW snapshots & MVCC reads', linkedProblem: 'LC 1146 Snapshot Array / MKTHNUM', comboPartner: { id: 'segment-tree-lazy', label: 'Persistent Segment Tree (K-th in [L,R])' } },
  { number: 62, section: 'advanced', subsection: 'Probabilistic & Memory/Cache', title: 'Lock-Free CAS Loops, Michael-Scott Queue & RCU', algorithmId: 'lockfree-cas-rcu', productionUse: 'Java ConcurrentLinkedQueue & Linux Kernel RCU routing tables', linkedProblem: 'ABA-Proof Versioned CAS Queue', comboPartner: { id: 'skip-list', label: 'CAS Powers Lock-Free Skip Lists' } },

  // Section 3: Database & Distributed Systems Internals (#63–#73)
  { number: 63, section: 'systems', subsection: 'Storage Engines & Query Execution', title: 'B+ Tree Page Splitting & Merging', algorithmId: 'bplus-tree-storage', productionUse: 'PostgreSQL, MySQL InnoDB & SQLite clustered/secondary indexes', linkedProblem: '16KB Disk Page Splits & Range Scans', comboPartner: { id: 'aries-wal-recovery', label: 'B+ Tree + ARIES WAL + LRU = RDBMS' } },
  { number: 64, section: 'systems', subsection: 'Storage Engines & Query Execution', title: 'LSM-Tree Flushing & Compaction (STCS & Leveled)', algorithmId: 'lsm-tree-compaction', productionUse: 'RocksDB, Cassandra, ScyllaDB & CockroachDB Pebble', linkedProblem: 'Write-Heavy KV Engine Compaction', comboPartner: { id: 'bloom-filter', label: 'LSM + Bloom Filter + K-Way Merge' } },
  { number: 65, section: 'systems', subsection: 'Storage Engines & Query Execution', title: 'External K-Way Merge Sort', algorithmId: 'external-kway-merge', productionUse: 'Disk-bounded SQL ORDER BY, Spark shuffle & SSTable compaction', linkedProblem: 'LC 23 Merge k Sorted Lists (Disk Scale)', comboPartner: { id: 'sql-joins-volcano', label: 'External Sort Powers Sort-Merge Join' } },
  { number: 66, section: 'systems', subsection: 'Storage Engines & Query Execution', title: 'ARIES Crash Recovery (WAL: Analysis, Redo, Undo)', algorithmId: 'aries-wal-recovery', productionUse: 'PostgreSQL / InnoDB / DB2 ACID durability & double-crash CLRs', linkedProblem: 'WAL Replay & Uncommitted Loser Undo', comboPartner: { id: 'bplus-tree-storage', label: 'Protects STEAL/NO-FORCE B+ Pages' } },
  { number: 67, section: 'systems', subsection: 'Storage Engines & Query Execution', title: 'Hash Join, Sort-Merge Join & Volcano Iterator Model', algorithmId: 'sql-joins-volcano', productionUse: 'PostgreSQL/DuckDB query execution pipelines & Grace Hash Join', linkedProblem: 'Streaming O(N+M) Equi-Join Engine', comboPartner: { id: 'bloom-filter', label: 'Bloom Filter Pushdown Accelerates Joins' } },
  { number: 68, section: 'systems', subsection: 'Distributed Routing, Consensus & Sync', title: 'Consistent Hashing (VNodes), Chord DHT & Rendezvous', algorithmId: 'consistent-hashing-dht', productionUse: 'DynamoDB, Cassandra ring, Memcached & Akamai CDN routing', linkedProblem: 'Minimal-Movement Cluster Shard Router', comboPartner: { id: 'gossip-phi-accrual', label: 'Gossip Propagates Ring Membership' } },
  { number: 69, section: 'systems', subsection: 'Distributed Routing, Consensus & Sync', title: 'Raft & Paxos Consensus (Election & Log Replication)', algorithmId: 'raft-paxos-consensus', productionUse: 'etcd (Kubernetes), CockroachDB Multi-Raft, Consul & Spanner', linkedProblem: 'Quorum Leader Election & Fencing', comboPartner: { id: 'aries-wal-recovery', label: 'Raft Log + Durable WAL + Snapshots' } },
  { number: 70, section: 'systems', subsection: 'Distributed Routing, Consensus & Sync', title: 'Gossip Protocol & Phi Accrual Failure Detector', algorithmId: 'gossip-phi-accrual', productionUse: 'Cassandra/ScyllaDB/Consul SWIM membership & jitter-proof detection', linkedProblem: 'O(log N) Cluster Convergence & Φ Score', comboPartner: { id: 'consistent-hashing-dht', label: 'Gossip + Consistent Hash Ring' } },
  { number: 71, section: 'systems', subsection: 'Distributed Routing, Consensus & Sync', title: 'Merkle Trees (Anti-Entropy Sync)', algorithmId: 'merkle-tree-sync', productionUse: 'Cassandra nodetool repair, Git objects, BitTorrent & Blockchain SPV', linkedProblem: 'O(log N) Replica Divergence Repair', comboPartner: { id: 'vector-clocks-lamport', label: 'Merkle Finds Diffs + Vector Clocks Resolve' } },
  { number: 72, section: 'systems', subsection: 'Distributed Routing, Consensus & Sync', title: 'Vector Clocks & Lamport Timestamps', algorithmId: 'vector-clocks-lamport', productionUse: 'Amazon Dynamo & Riak causal conflict detection without NTP trust', linkedProblem: 'Causal Ordering & Concurrent Sibling Merge', comboPartner: { id: 'crdt-gcounter-orset', label: 'Vector Clocks + CRDTs = Zero-Loss AP' } },
  { number: 73, section: 'systems', subsection: 'Distributed Routing, Consensus & Sync', title: 'Conflict-Free Replicated Data Types (CRDTs)', algorithmId: 'crdt-gcounter-orset', productionUse: 'Figma/Yjs collaborative editing, offline mobile & multi-region Redis', linkedProblem: 'Join-Semilattice G-Counter & OR-Set', comboPartner: { id: 'gossip-phi-accrual', label: 'Gossip Disseminates CRDT State Joins' } },
];

export const ALGORITHM_POWER_COMBOS: AlgorithmPowerCombo[] = [
  {
    id: 'combo-rocksdb',
    title: 'RocksDB / Cassandra Write-Optimized Engine: LSM-Tree + Skip List + Bloom Filter + External K-Way Merge',
    partnerIds: ['lsm-tree-compaction', 'skip-list', 'bloom-filter', 'external-kway-merge'],
    synergyOutput: '10× higher random write throughput than B+ Trees while eliminating ~99% of disk SSTable lookups on missing keys.',
    architectureFlow: 'Write → WAL + Skip List MemTable → Flush Immutable SSTable + Bloom Filter → Background External K-Way Compaction.',
    interviewUseCase: 'System Design: Design a Write-Heavy Time-Series DB, Chat Message Store, or Distributed KV Engine.',
  },
  {
    id: 'combo-postgres',
    title: 'ACID Relational Engine (PostgreSQL / InnoDB): B+ Tree + ARIES WAL + LRU/ARC Buffer Pool + Hash/Merge Joins',
    partnerIds: ['bplus-tree-storage', 'aries-wal-recovery', 'cache-lru-lfu-arc', 'sql-joins-volcano'],
    synergyOutput: 'Predictable 3–4 I/O point & range reads, full crash-safe ACID durability, and O(N+M) SQL query execution.',
    architectureFlow: 'Query → Volcano Hash/Sort-Merge Join → LRU/ARC Buffer Pool → B+ Tree Leaf Pages (protected by ARIES WAL).',
    interviewUseCase: 'System Design: Bank Ledger, Order Fulfillment DB, or Explaining Why UUIDv4 Hurts InnoDB Inserts.',
  },
  {
    id: 'combo-dynamo',
    title: 'Amazon Dynamo / Cassandra AP Cluster: Consistent Hashing + Gossip/Phi + Merkle Trees + Vector Clocks + CRDTs',
    partnerIds: ['consistent-hashing-dht', 'gossip-phi-accrual', 'merkle-tree-sync', 'vector-clocks-lamport', 'crdt-gcounter-orset'],
    synergyOutput: 'Always-writable, zero-master multi-region cluster that self-heals partitions in O(log N) network traffic with zero lost updates.',
    architectureFlow: 'Consistent Hash VNodes route keys → Gossip+Phi tracks live peers → Vector Clocks/CRDTs merge concurrent writes → Merkle Trees sync anti-entropy.',
    interviewUseCase: 'Staff System Design: Globally Distributed Shopping Cart / Multi-Region Active-Active Key-Value Store.',
  },
  {
    id: 'combo-raft-kv',
    title: 'Strongly Consistent Control Plane (etcd / CockroachDB): Raft Consensus + ARIES WAL + B+ / LSM Storage',
    partnerIds: ['raft-paxos-consensus', 'aries-wal-recovery', 'lsm-tree-compaction', 'bplus-tree-storage'],
    synergyOutput: 'Linearizable CP consensus surviving f node failures (2f+1 replicas) with durable disk recovery and snapshot compaction.',
    architectureFlow: 'Client → Raft Leader WAL Append → Quorum AppendEntries Commit → Deterministic Apply to Local LSM/B+ Engine.',
    interviewUseCase: 'System Design: Distributed Lock Manager, Kubernetes etcd, or Multi-Raft Transactional SQL.',
  },
  {
    id: 'combo-introsort',
    title: 'Production Introsort / TimSort Hybrid: Quick Sort + Heap Sort + Insertion Sort',
    partnerIds: ['merge-sort-divide-conquer', 'heapify-heapsort', 'elementary-sorts'],
    synergyOutput: 'Combines Quick Sort’s cache-friendly speed, Heap Sort’s guaranteed O(N log N) anti-adversarial ceiling, and Insertion Sort’s O(N) small-block/nearly-sorted finish.',
    architectureFlow: 'Partition via QuickSort → if recursion depth > 2 log N switch to HeapSort → for partitions ≤ 16 finish with Insertion Sort.',
    interviewUseCase: 'C++ std::sort, Python/Java TimSort, and answering "Why not plain QuickSort in production?"',
  },
  {
    id: 'combo-johnson',
    title: 'Johnson’s Sparse APSP: Bellman-Ford Potentials + V× Dijkstra',
    partnerIds: ['johnsons-all-pairs', 'bellman-ford', 'dijkstra-shortest-path'],
    synergyOutput: 'Slashes sparse All-Pairs Shortest Path with negative edges from O(V³) Floyd-Warshall down to O(V·E log V) (50×–100× faster!).',
    architectureFlow: '1× Bellman-Ford computes node potentials h[v] → Reweight w\'=w+h[u]−h[v] ≥ 0 → V× Dijkstra recovers exact shortest paths.',
    interviewUseCase: 'Advanced Graph Interviews & Currency Arbitrage / Network Routing All-Pairs Matrices.',
  },
  {
    id: 'combo-sliding-dp',
    title: 'O(N) Sliding-Window DP Optimization: Dynamic Programming + Monotonic Deque',
    partnerIds: ['monotonic-deque', 'dynamic-programming', 'sliding-window'],
    synergyOutput: 'Drops DP transitions over a window of size K (`dp[i] = val[i] + max_{j ∈ [i-K..i-1]} dp[j]`) from O(N·K) straight to O(N)!',
    architectureFlow: 'Maintain decreasing Monotonic Deque of candidate dp[j] indices → read O(1) best predecessor at front → evict out-of-window front.',
    interviewUseCase: 'LC 1696 Jump Game VI, LC 1425 Constrained Subsequence Sum, LC 862 Shortest Subarray with Sum ≥ K.',
  },
  {
    id: 'combo-bsearch-greedy',
    title: 'Binary Search on Answer: Modified Binary Search + Greedy Feasibility / Rolling Hash',
    partnerIds: ['binary-search', 'greedy-algorithms', 'kmp-rabin-karp'],
    synergyOutput: 'Turns hard optimization problems ("minimize the maximum capacity/distance") into an O(N log U) yes/no feasibility loop!',
    architectureFlow: 'Pick midpoint answer M → run O(N) Greedy check (or Rolling Hash duplicate check) → tighten [lo, hi] monotonically.',
    interviewUseCase: 'LC 875 Koko Eating Bananas, LC 410 Split Array Largest Sum, LC 1044 Longest Duplicate Substring.',
  },
  {
    id: 'combo-hld-segtree',
    title: 'Dynamic Tree Path Engine: Heavy-Light Decomposition + Segment Tree + LCA',
    partnerIds: ['heavy-light-decomposition', 'segment-tree-lazy', 'binary-lifting-lca'],
    synergyOutput: 'Supports arbitrary path sum/max updates AND queries on an N-node tree in O(log² N) instead of O(N) per query.',
    architectureFlow: 'Decompose tree into ≤ log N heavy chains → map chains contiguously onto a Lazy Segment Tree → jump chains upward to LCA.',
    interviewUseCase: 'Competitive & Staff Graph Queries on Dynamic Trees (QTREE, dynamic network link capacities).',
  },
  {
    id: 'combo-bwt-sa-huffman',
    title: 'Genomic & bzip2 Compression Stack: Suffix Array + BWT/FM-Index + Huffman / LZW',
    partnerIds: ['bwt-fm-index', 'suffix-array-lcp', 'huffman-coding', 'lzw-compression', 'counting-radix-sort'],
    synergyOutput: 'Compresses gigabytes of text/DNA by 5×–10× while STILL supporting O(|P|) exact substring search without decompressing!',
    architectureFlow: 'Radix-accelerated Suffix Array → BWT last column clusters repeated characters → FM-Index Occ tables + Huffman entropy coding.',
    interviewUseCase: 'Bioinformatics Genome Alignment (Bowtie2/BWA) and High-Ratio Archivers (bzip2/gzip).',
  },
  {
    id: 'combo-stream-heavy',
    title: 'Sub-Linear Stream Telemetry: Count-Min Sketch + Min-Heap + HyperLogLog + W-TinyLFU',
    partnerIds: ['count-min-sketch', 'heap-intervals', 'hyperloglog', 'cache-lru-lfu-arc'],
    synergyOutput: 'Tracks Top-K heavy hitters AND billion-user unique counts across real-time firehoses using kilobytes instead of terabytes of RAM!',
    architectureFlow: 'Incoming events → HyperLogLog counts distincts (12 KB) + Count-Min Sketch estimates freq → Size-K Min-Heap maintains live Top-K.',
    interviewUseCase: 'System Design: Real-Time Trending Topics, DDoS Mitigation, and Java Caffeine W-TinyLFU Cache.',
  },
  {
    id: 'combo-trie-aho-dfs',
    title: 'Multi-Pattern Search & Autocomplete: Trie + Aho-Corasick + Backtracking DFS',
    partnerIds: ['trie-prefix-autocomplete', 'aho-corasick', 'backtracking-trie', 'depth-first-search'],
    synergyOutput: 'Matches 10,000 patterns simultaneously in O(Text + Matches) linear time or prunes 99% of invalid grid DFS branches immediately.',
    architectureFlow: 'Compile dictionary into Trie → wire KMP-style BFS failure links (Aho-Corasick) or pass TrieNode down grid DFS (Word Search II).',
    interviewUseCase: 'LC 212 Word Search II, LC 1032 Stream of Characters, and Antivirus / DLP Network Scanners.',
  },
  {
    id: 'combo-dual-heap-hash',
    title: 'Sliding Window Median: Dual Heaps + Hash Map Lazy Deletion',
    partnerIds: ['dual-heaps-median', 'hash-table-probing', 'sliding-window'],
    synergyOutput: 'Maintains exact running median over a moving window of size K in O(N log K) without O(K) arbitrary-element heap scans.',
    architectureFlow: 'Push entering element to Max/Min Heap → mark outgoing window element in delayed HashMap → prune tombstones only when they reach heap top!',
    interviewUseCase: 'LC 480 Sliding Window Median & Real-Time Streaming p50 Sensor Telemetry.',
  },
  {
    id: 'combo-list-pal',
    title: 'O(1) Space Linked List Pipeline: Floyd’s Fast/Slow + In-Place 3-Pointer Reversal',
    partnerIds: ['fast-slow-pointers', 'linked-list-reversal', 'two-pointers'],
    synergyOutput: 'Checks palindromes or reorders an N-node linked list in O(N) time and strictly O(1) memory without copying to an array.',
    architectureFlow: 'Fast/Slow finds exact midpoint → 3-Pointer reverses second half in-place → Two Pointers compare/interleave halves → restore list.',
    interviewUseCase: 'LC 234 Palindrome Linked List and LC 143 Reorder List.',
  },
  {
    id: 'combo-kruskal-dsu-lca',
    title: 'Minimum Bottleneck Path Engine: Kruskal’s MST + Union-Find + Binary Lifting LCA',
    partnerIds: ['kruskals-mst', 'union-find-dsu', 'binary-lifting-lca'],
    synergyOutput: 'Answers thousands of "minimum maximum edge weight between any (u, v)" queries in O(log N) each instead of O(E log V) Dijkstra per query!',
    architectureFlow: 'Sort edges + DSU builds MST once → Max edge on MST path(u, v) equals global min-bottleneck → Binary Lifting LCA answers max edge in O(log N).',
    interviewUseCase: 'Network Capacity Routing & LC 1697 Checking Existence of Edge Length Limited Paths.',
  },
  {
    id: 'combo-persistent-seg',
    title: 'Time-Travel Range Order Statistics: Persistent Path Copying + Segment Tree',
    partnerIds: ['persistent-data-structures', 'segment-tree-lazy', 'binary-search'],
    synergyOutput: 'Answers "what is the K-th smallest element in subarray [L..R]?" in O(log N) time with only O(N log N) total memory!',
    architectureFlow: 'Insert array prefix 1..N into Persistent Value Segment Tree → subtract roots[R] − roots[L−1] while descending left/right by K.',
    interviewUseCase: 'SPOJ MKTHNUM, Git/MVCC Versioned Snapshots, and Historical Analytics Queries.',
  },
];

export function getAlgorithmCombinations(algo: AlgorithmDefinition): AlgorithmPowerCombo[] {
  const direct = ALGORITHM_POWER_COMBOS.filter((c) => c.partnerIds.includes(algo.id));
  if (direct.length > 0) return direct;

  // Smart fallback combo based on category so all 94 algorithms offer actionable architectural synergy
  if (algo.category === 'Advanced Graph Algorithms' || algo.category === 'Tree & Graph Traversal') {
    return [
      {
        id: `auto-graph-${algo.id}`,
        title: `${algo.shortName} + Topological / Union-Find Preprocessing`,
        partnerIds: [algo.id, 'union-find-dsu', 'graph-topo-sort'],
        synergyOutput: 'Pre-filtering disconnected components via Union-Find or condensing cycles via SCC shrinks the graph before running the primary solver.',
        architectureFlow: `Input Graph → Component/SCC Filter → ${algo.shortName} Core (${algo.timeComplexity}) → Verified Path/Cut Output.`,
        interviewUseCase: 'Multi-stage network routing, dependency analysis, and constrained graph optimization.',
      },
    ];
  }

  return [
    {
      id: `auto-core-${algo.id}`,
      title: `${algo.shortName} + Hash Table / Binary Search Hybrid`,
      partnerIds: [algo.id, 'hash-table-probing', 'binary-search'],
      synergyOutput: 'Pairing O(1) Hash index lookups or O(log N) monotonic search boundaries eliminates redundant inner scans and stabilizes tail latency.',
      architectureFlow: `Raw Input → Index/Preprocess → ${algo.shortName} (${algo.timeComplexity}) → Verified Output (${algo.spaceComplexity}).`,
      interviewUseCase: 'Senior interview follow-ups asking to scale the base pattern to high-throughput or dynamic query streams.',
    },
  ];
}

export function getAlgorithmFlowStages(algo: AlgorithmDefinition): AlgorithmFlowStage[] {
  const firstFrame = algo.frames[0];
  const midFrame = algo.frames[Math.min(1, algo.frames.length - 1)];
  const lateFrame = algo.frames[Math.min(2, algo.frames.length - 1)];
  const lastFrame = algo.frames[algo.frames.length - 1];

  return [
    {
      step: '01',
      title: 'Input & Preconditions',
      role: 'Input',
      summary: firstFrame?.title ?? 'Validate constraints, bounds, and input shape.',
      cost: 'O(1) validate',
      guardrail: algo.whenItFails.split('.')[0] + '.',
    },
    {
      step: '02',
      title: 'State & Data Structure Setup',
      role: 'Structure',
      summary: midFrame?.title ?? 'Initialize core pointers, indices, or auxiliary structures.',
      cost: algo.spaceComplexity,
      guardrail: firstFrame?.invariantCheck ?? algo.loopInvariant.slice(0, 90),
    },
    {
      step: '03',
      title: 'Invariant Transform Loop',
      role: 'Engine',
      summary: lateFrame?.title ?? algo.tagline,
      cost: algo.timeComplexity,
      guardrail: algo.loopInvariant,
    },
    {
      step: '04',
      title: 'Verified Output & Edge Guard',
      role: 'Output',
      summary: lastFrame?.title ?? 'Return exact optimal result or safe sentinel.',
      cost: 'Verified ✓',
      guardrail: lastFrame?.invariantCheck ?? 'Handles empty, single-element, and boundary inputs cleanly.',
    },
  ];
}
