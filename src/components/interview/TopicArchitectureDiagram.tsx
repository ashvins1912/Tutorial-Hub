import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
} from 'lucide-react';
import type { BigTechTopicCategory } from '../../types/dsa';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';

interface ArchNode {
  id: string;
  label: string;
  sub: string;
  metric: string;
}

interface ArchStep {
  title: string;
  activeNodeIds: string[];
  packet: string;
  invariant: string;
}

interface MatchedAlgoLink {
  label: string;
  algoId?: string;
  openFuzzySearch?: boolean;
}

interface TopicArchitectureSpec {
  subtitle: string;
  architectureTitle: string;
  realWorldBridge: string;
  nodes: ArchNode[];
  steps: ArchStep[];
  matchedAlgorithms: MatchedAlgoLink[];
}

const TOPIC_ARCHITECTURES: Record<BigTechTopicCategory, TopicArchitectureSpec> = {
  'Arrays & Prefix Sum': {
    subtitle: 'Cumulative State Index + O(1) Hash Complement Architecture',
    architectureTitle: 'Single-Pass Prefix Accumulator & Inverted Map Pipeline',
    realWorldBridge: 'Used in range-sum analytics, subarray sum = K, and O(1) cached-size inverted trigram indexes.',
    nodes: [
      { id: 'n1', label: '1. Input Stream', sub: 'nums = [3, 4, -7, 1, 3]', metric: 'O(N) pass' },
      { id: 'n2', label: '2. Running Prefix', sub: 'prefix += nums[i]', metric: 'P[i] = Σ0..i' },
      { id: 'n3', label: '3. HashMap Lookup', sub: 'seen.get(prefix - k)', metric: 'O(1) probe' },
      { id: 'n4', label: '4. Count & Store', sub: 'ans += freq; seen[P]++', metric: 'O(N) space' },
    ],
    steps: [
      { title: 'Seed Base Prefix {0: 1}', activeNodeIds: ['n2', 'n3'], packet: 'prefix = 0 → seen = {0: 1}', invariant: 'Allows subarrays starting at index 0 to match prefix - k === 0.' },
      { title: 'Accumulate Running Total', activeNodeIds: ['n1', 'n2'], packet: 'i=1, nums[1]=4 → prefix = 7', invariant: 'Every range sum [L..R] decomposes cleanly into P[R] - P[L-1].' },
      { title: 'Probe Complement in O(1)', activeNodeIds: ['n3'], packet: 'Query seen[7 - 7] = seen[0] → HIT (+1)', invariant: 'Replaces O(N²) nested start/end loops with one hash probe.' },
      { title: 'Commit Frequency & Emit', activeNodeIds: ['n3', 'n4'], packet: 'seen[7] = 1 · total subarrays updated', invariant: 'Never mutate seen before probing to avoid counting empty intervals.' },
    ],
    matchedAlgorithms: [
      { label: 'Prefix Sum + Hash Map', algoId: 'prefix-sum-hash' },
      { label: 'Kadane’s Algorithm', algoId: 'kadanes-algorithm' },
      { label: 'Inverted N-Gram Index', openFuzzySearch: true },
    ],
  },
  'Two Pointers': {
    subtitle: 'Monotonic Opposite-End / Same-Direction Pointer Contraction',
    architectureTitle: 'Sorted Array Boundary Squeeze & Zero-Allocation Partitioner',
    realWorldBridge: 'Powers sorted posting-list intersection (MergeSkip) and in-place memory compaction.',
    nodes: [
      { id: 'n1', label: '1. Sorted Space', sub: 'Order invariant a[0] <= ... <= a[n-1]', metric: 'O(N log N)' },
      { id: 'n2', label: '2. Dual Cursors', sub: 'L = 0, R = n - 1', metric: 'O(1) RAM' },
      { id: 'n3', label: '3. Monotonic Gate', sub: 'sum < target ? L++ : R--', metric: 'Prunes row/col' },
      { id: 'n4', label: '4. Verified Pair', sub: 'Emit [L, R] + skip dups', metric: 'O(N) scan' },
    ],
    steps: [
      { title: 'Establish Monotonic Order', activeNodeIds: ['n1'], packet: 'Sorted input guarantees deterministic pointer moves', invariant: 'Increasing L never decreases sum; decreasing R never increases sum.' },
      { title: 'Evaluate Extreme Pair', activeNodeIds: ['n2', 'n3'], packet: 'a[L] + a[R] compared against target', invariant: 'One comparison eliminates an entire row or column of the N×N pair grid.' },
      { title: 'Contract Inward Without Backtracking', activeNodeIds: ['n3'], packet: 'L advances right OR R steps left', invariant: 'Combined pointer distance shrinks by 1 every step → O(N) total.' },
      { title: 'Emit & Deduplicate Matches', activeNodeIds: ['n4'], packet: 'Record valid pair and skip identical adjacent keys', invariant: 'Zero hash-set overhead; pure O(1) auxiliary space.' },
    ],
    matchedAlgorithms: [
      { label: 'Two Pointers', algoId: 'two-pointers' },
      { label: 'Fast & Slow Pointers', algoId: 'fast-slow-pointers' },
      { label: 'Cyclic Sort', algoId: 'cyclic-sort' },
    ],
  },
  'Sliding Window': {
    subtitle: 'Dynamic Contiguous Window with Incremental Frequency State',
    architectureTitle: 'Expand-Validate-Shrink Stream Processor (Substring & N-Gram Slicer)',
    realWorldBridge: 'Core engine of Character N-Gram tokenization, TCP congestion windows, and real-time rate limiters.',
    nodes: [
      { id: 'n1', label: '1. Stream Input', sub: 'Expand right R++', metric: '1 pass' },
      { id: 'n2', label: '2. Window State', sub: 'freq[s[R]]++ / window sum', metric: 'O(1) update' },
      { id: 'n3', label: '3. Validity Gate', sub: 'while (!valid) shrink L++', metric: 'Amortized O(1)' },
      { id: 'n4', label: '4. Best Tracker', sub: 'best = opt(best, R - L + 1)', metric: 'O(N) total' },
    ],
    steps: [
      { title: 'Expand Right Boundary (R++)', activeNodeIds: ['n1', 'n2'], packet: 'Ingest s[R] into frequency table / trigram frame', invariant: 'Window [L..R] grows by 1 element per outer loop iteration.' },
      { title: 'Detect Constraint Violation', activeNodeIds: ['n2', 'n3'], packet: 'Distinct chars > K or duplicate detected', invariant: 'Monotonicity guarantees shrinking L moves toward validity.' },
      { title: 'Contract Left Boundary (L++)', activeNodeIds: ['n3'], packet: 'Evict s[L] from window state until valid again', invariant: 'Each index enters once (R) and exits once (L) → 2N max operations.' },
      { title: 'Record Optimal Contiguous Span', activeNodeIds: ['n4'], packet: 'Update best window length / emit n-gram slice', invariant: 'Optimal answer is guaranteed captured at peak valid boundary.' },
    ],
    matchedAlgorithms: [
      { label: 'Sliding Window', algoId: 'sliding-window' },
      { label: 'KMP / Rabin-Karp', algoId: 'kmp-rabin-karp' },
      { label: 'N-Gram Sliding Tokenizer', openFuzzySearch: true },
    ],
  },
  'Modified Binary Search': {
    subtitle: 'Monotonic Predicate Halving Over Arrays or Answer Space',
    architectureTitle: 'Predicate Bisector & Half-Space Elimination Pipeline',
    realWorldBridge: 'Powers B-Tree index seeks, length-bucket pruning in search engines, and capacity-planning solvers.',
    nodes: [
      { id: 'n1', label: '1. Search Bounds', sub: 'lo .. hi (index or answer)', metric: 'Space S' },
      { id: 'n2', label: '2. Safe Midpoint', sub: 'mid = lo + ((hi - lo) >> 1)', metric: 'No overflow' },
      { id: 'n3', label: '3. Monotonic Check', sub: 'isFeasible(mid) → F..F T..T', metric: 'O(check)' },
      { id: 'n4', label: '4. Half Pruner', sub: 'hi = mid or lo = mid + 1', metric: 'O(log S)' },
    ],
    steps: [
      { title: 'Frame Feasibility Domain [lo, hi]', activeNodeIds: ['n1'], packet: 'Identify true/false boundary over sorted or answer space', invariant: 'Answer lies strictly inside [lo, hi] at every iteration.' },
      { title: 'Probe Midpoint Predicate', activeNodeIds: ['n2', 'n3'], packet: 'Evaluate monotonic boolean check at mid', invariant: 'All values on one side of mid share the same feasibility verdict.' },
      { title: 'Discard 50% of Remaining Space', activeNodeIds: ['n4'], packet: 'Shrink search interval by half without skipping boundary', invariant: 'Convergence guaranteed in ceil(log2(hi - lo)) steps.' },
      { title: 'Converge lo === hi Boundary', activeNodeIds: ['n1', 'n4'], packet: 'Return exact first True (or last valid) boundary', invariant: 'Zero infinite loops when hi = mid and lo = mid + 1.' },
    ],
    matchedAlgorithms: [
      { label: 'Binary Search', algoId: 'binary-search' },
      { label: 'Merge Sort & Quick Sort', algoId: 'merge-sort' },
      { label: 'Length Bound Pruning', openFuzzySearch: true },
    ],
  },
  'Linked Lists': {
    subtitle: 'In-Place Pointer Rewiring & Floyd Tortoise-Hare Cycle Detector',
    architectureTitle: 'Zero-Copy Pointer Manipulation & Dual-Speed Node Scanner',
    realWorldBridge: 'Backbone of O(1) LRU/LFU caches, OS scheduler run-queues, and skip-list posting indexes.',
    nodes: [
      { id: 'n1', label: '1. Sentinel Dummy', sub: 'dummy.next = head', metric: 'No head edge' },
      { id: 'n2', label: '2. Slow / Fast Scan', sub: 'slow += 1, fast += 2', metric: 'O(1) space' },
      { id: 'n3', label: '3. Pointer Rewire', sub: 'next = cur.next; cur.next = prev', metric: 'In-place' },
      { id: 'n4', label: '4. Relinked Chain', sub: 'return dummy.next', metric: 'O(N) time' },
    ],
    steps: [
      { title: 'Attach Sentinel Dummy Node', activeNodeIds: ['n1'], packet: 'dummy → head eliminates special-case head deletion', invariant: 'Every real node now has a guaranteed non-null predecessor.' },
      { title: 'Advance Slow (1×) & Fast (2×)', activeNodeIds: ['n2'], packet: 'Find exact midpoint or detect cycle collision', invariant: 'Relative speed of 1 node/step guarantees meeting inside any cycle.' },
      { title: 'Rewire Next Pointers Safely', activeNodeIds: ['n3'], packet: 'Cache tmp = cur.next BEFORE overwriting cur.next', invariant: 'Preserves forward chain reachability during reversal.' },
      { title: 'Splice & Return New Head', activeNodeIds: ['n4'], packet: 'Reconnect reversed half or merged sorted nodes', invariant: 'O(N) single pass with strictly O(1) auxiliary memory.' },
    ],
    matchedAlgorithms: [
      { label: 'Fast & Slow Pointers', algoId: 'fast-slow-pointers' },
      { label: 'Two Pointers', algoId: 'two-pointers' },
    ],
  },
  'Monotonic Stack': {
    subtitle: 'Order-Maintaining LIFO Stack for Next Greater / Span Boundaries',
    architectureTitle: 'Amortized O(N) Monotonic Eviction & Span Resolution Engine',
    realWorldBridge: 'Used in stock span analytics, histogram/layout bounding boxes, and streaming sliding-window max.',
    nodes: [
      { id: 'n1', label: '1. Element Arrival', sub: 'Incoming val at index i', metric: '1 push/elem' },
      { id: 'n2', label: '2. Order Invariant', sub: 'while top violates order', metric: 'Pop & resolve' },
      { id: 'n3', label: '3. Boundary Calc', sub: 'width = i - stack.top - 1', metric: 'O(1) span' },
      { id: 'n4', label: '4. Push Index', sub: 'stack.push(i)', metric: 'O(N) total' },
    ],
    steps: [
      { title: 'Inspect Incoming Value a[i]', activeNodeIds: ['n1'], packet: 'Compare a[i] with a[stack.top()]', invariant: 'Stack indices remain strictly increasing or decreasing in value.' },
      { title: 'Pop All Dominated Elements', activeNodeIds: ['n2'], packet: 'Popped index j just discovered its nearest boundary at i', invariant: 'Each element is pushed once and popped at most once → 2N ops.' },
      { title: 'Compute Exact Span / Area', activeNodeIds: ['n3'], packet: 'Left boundary = new stack.top(), Right boundary = i', invariant: 'Resolves both left and right limits in a single pass.' },
      { title: 'Push Current Index i', activeNodeIds: ['n4'], packet: 'Restore monotonic invariant for future arrivals', invariant: 'No element ever needs to be re-inspected once popped.' },
    ],
    matchedAlgorithms: [
      { label: 'Monotonic Stack', algoId: 'monotonic-stack' },
      { label: 'Sliding Window', algoId: 'sliding-window' },
    ],
  },
  'Trees DFS/BFS': {
    subtitle: 'Hierarchical Post-Order Aggregation & Level-Order Queue Traversal',
    architectureTitle: 'Recursive Subtree Reducer (DFS) & Level-Frontier BFS Engine',
    realWorldBridge: 'Powers DOM/AST compilers, database B+Trees, LCA binary lifting, and hierarchical query plans.',
    nodes: [
      { id: 'n1', label: '1. Root / Frontier', sub: 'Stack (DFS) or Queue (BFS)', metric: 'O(W) / O(H)' },
      { id: 'n2', label: '2. Branch Split', sub: 'Recurse left & right children', metric: 'Every edge 1×' },
      { id: 'n3', label: '3. Subtree Merge', sub: 'Combine(leftRes, rightRes, node)', metric: 'Post-order' },
      { id: 'n4', label: '4. Global Answer', sub: 'Diameter / LCA / Level views', metric: 'O(N) visits' },
    ],
    steps: [
      { title: 'Choose Traversal Order', activeNodeIds: ['n1'], packet: 'BFS Queue for shortest/level depth; DFS Stack for subtree state', invariant: 'Every tree node has exactly 1 parent → no visited set required.' },
      { title: 'Expand Children / Levels', activeNodeIds: ['n2'], packet: 'Snapshot queue.length for level-by-level processing', invariant: 'Guarantees all nodes at depth d finish before depth d+1.' },
      { title: 'Aggregate Child Return Values', activeNodeIds: ['n3'], packet: 'Bubble height, sum, or validity upward in post-order', invariant: 'Solves subtree queries without recomputing descendants.' },
      { title: 'Update Global Metric & Return', activeNodeIds: ['n4'], packet: 'Emit diameter, LCA, or serialized structure', invariant: 'Visits every node exactly once in O(N) time.' },
    ],
    matchedAlgorithms: [
      { label: 'BFS (Queue)', algoId: 'bfs-traversal' },
      { label: 'DFS (Recursion)', algoId: 'dfs-traversal' },
      { label: 'Binary Lifting (LCA)', algoId: 'binary-lifting-lca' },
      { label: 'Segment Tree', algoId: 'segment-tree-lazy' },
    ],
  },
  'Heaps & Intervals': {
    subtitle: 'Sort-by-Start Sweep Line + Bounded O(log k) Priority Queue',
    architectureTitle: 'Streaming Top-K Min-Heap & Interval Resource Allocator',
    realWorldBridge: 'Directly powers Top-K Product Search ranking (O(C log k)), task schedulers, and k-way posting merges.',
    nodes: [
      { id: 'n1', label: '1. Candidate Stream', sub: 'Intervals or scored docs', metric: 'C items' },
      { id: 'n2', label: '2. Sort / Key Gate', sub: 'Sort by start OR compare heap.min', metric: 'O(1) peek' },
      { id: 'n3', label: '3. Bounded Min-Heap', sub: 'Size <= k · bubble up/down', metric: 'O(log k)' },
      { id: 'n4', label: '4. Top-K / Merged', sub: 'Extract exact top-k or rooms', metric: 'O(C log k)' },
    ],
    steps: [
      { title: 'Ingest Scored Candidate or Interval', activeNodeIds: ['n1'], packet: 'Compare candidate score against heap root (current kth best)', invariant: 'Heap root always holds the minimum active end-time or kth score.' },
      { title: 'Skip Dominated Items in O(1)', activeNodeIds: ['n2'], packet: 'If heap.size === k and score <= heap.peek() → reject immediately', invariant: 'Avoids O(C log C) full sort when k << C.' },
      { title: 'Push & Rebalance Heap', activeNodeIds: ['n3'], packet: 'Evict root + sift down in O(log k) height', invariant: 'Heap size never exceeds k → tiny bounded memory.' },
      { title: 'Emit Ranked Top-K Output', activeNodeIds: ['n4'], packet: 'Pop k items with deterministic tie-breakers', invariant: 'Optimal O(C log k) selection for real-time search & scheduling.' },
    ],
    matchedAlgorithms: [
      { label: 'Heaps & Intervals', algoId: 'heap-intervals' },
      { label: 'Greedy Intervals', algoId: 'greedy-intervals' },
      { label: '10M Top-K Product Search', openFuzzySearch: true },
    ],
  },
  'Graphs & Topo Sort': {
    subtitle: 'Adjacency Representation + Zero-In-Degree Kahn Dependency Queue',
    architectureTitle: 'DAG Dependency Resolver & Cycle-Detection Pipeline',
    realWorldBridge: 'Drives build systems (Bazel, Webpack), Airflow/Spark DAG schedulers, and package resolvers.',
    nodes: [
      { id: 'n1', label: '1. Edge List', sub: 'Directed prereq u → v', metric: 'V, E' },
      { id: 'n2', label: '2. Adj + In-Degree', sub: 'adj[u].push(v); indeg[v]++', metric: 'O(V + E)' },
      { id: 'n3', label: '3. Zero-Indeg Queue', sub: 'Enqueue all indeg[u] === 0', metric: 'Ready tasks' },
      { id: 'n4', label: '4. Peel & Verify', sub: 'count === V ? DAG : Cycle', metric: 'O(V + E)' },
    ],
    steps: [
      { title: 'Build Adjacency List & In-Degrees', activeNodeIds: ['n1', 'n2'], packet: 'Count incoming prerequisites for every vertex', invariant: 'Sum of all in-degrees equals |E|.' },
      { title: 'Seed Frontier with Independent Nodes', activeNodeIds: ['n3'], packet: 'Push every node with indeg === 0 into FIFO queue', invariant: 'Only zero-in-degree nodes can execute safely next.' },
      { title: 'Peel Edges & Unlock Neighbors', activeNodeIds: ['n3', 'n4'], packet: 'Pop u → decrement indeg[v]; enqueue when indeg[v] hits 0', invariant: 'Every vertex and edge is processed at most once.' },
      { title: 'Verify Complete Topological Order', activeNodeIds: ['n4'], packet: 'If emitted.length < V, remaining nodes form a cycle', invariant: 'Simultaneously outputs valid schedule AND detects cycles.' },
    ],
    matchedAlgorithms: [
      { label: 'Topological Sort (Kahn’s)', algoId: 'topological-sort' },
      { label: 'Tarjan / Kosaraju SCC', algoId: 'tarjan-kosaraju-scc' },
      { label: 'BFS (Queue)', algoId: 'bfs-traversal' },
    ],
  },
  'Union-Find & Shortest Path': {
    subtitle: 'Disjoint Set Path Compression & Priority-Queue Edge Relaxation',
    architectureTitle: 'Dynamic Connectivity Forest & Weighted Shortest-Path Router',
    realWorldBridge: 'Core of network routing (OSPF/BGP), maps navigation (A*/Dijkstra), and cluster deduplication.',
    nodes: [
      { id: 'n1', label: '1. Weighted Graph', sub: '(u, v, w) edges', metric: 'V, E' },
      { id: 'n2', label: '2. DSU / Min-Heap', sub: 'find(x) compression OR pop min d', metric: 'α(N) / log V' },
      { id: 'n3', label: '3. Relax / Merge', sub: 'd[u] + w < d[v] OR union(u,v)', metric: 'Greedy lock' },
      { id: 'n4', label: '4. Optimal Tree', sub: 'Shortest paths / MST', metric: 'O(E log V)' },
    ],
    steps: [
      { title: 'Initialize Distances / Singleton Sets', activeNodeIds: ['n1', 'n2'], packet: 'dist[src] = 0, parent[i] = i', invariant: 'Every vertex starts isolated or at ∞ distance.' },
      { title: 'Pop Closest Frontier or Lowest Edge', activeNodeIds: ['n2'], packet: 'Extract minimum-cost vertex from Min-Heap', invariant: 'With non-negative weights, first pop locks exact shortest distance.' },
      { title: 'Relax Neighbors / Compress Paths', activeNodeIds: ['n3'], packet: 'Update dist[v] = dist[u] + w or flatten parent pointers', invariant: 'Path compression + union by rank achieves near-O(1) α(N) ops.' },
      { title: 'Finalize Shortest Path / MST', activeNodeIds: ['n4'], packet: 'All reachable vertices settled with optimal cost', invariant: 'Switch to Bellman-Ford immediately if negative edges exist.' },
    ],
    matchedAlgorithms: [
      { label: 'Dijkstra’s Algorithm', algoId: 'dijkstra-shortest-path' },
      { label: 'Union-Find (DSU)', algoId: 'union-find' },
      { label: 'Bellman-Ford', algoId: 'bellman-ford' },
      { label: 'A* Search', algoId: 'a-star-search' },
    ],
  },
  'Backtracking & Tries': {
    subtitle: 'Prefix-Shared Radix Tree & Constraint-Pruned State-Space DFS',
    architectureTitle: 'Shared-Prefix Trie Index & Choose-Explore-Undo Search Tree',
    realWorldBridge: 'Powers autocomplete prefix dictionaries, Q-Gram NG-Trees, regex engines, and SAT/constraint solvers.',
    nodes: [
      { id: 'n1', label: '1. Prefix / State', sub: 'Trie root or partial path', metric: 'Shared memory' },
      { id: 'n2', label: '2. Choose & Prune', sub: 'Drop dead branches early', metric: 'O(1) check' },
      { id: 'n3', label: '3. Deep Explore', sub: 'Recurse child edge / choice', metric: 'DFS path' },
      { id: 'n4', label: '4. Undo Rollback', sub: 'path.pop(); restore state', metric: 'Zero copy' },
    ],
    steps: [
      { title: 'Anchor Shared Prefix / Decision Node', activeNodeIds: ['n1'], packet: 'Walk Trie character edge or current decision index', invariant: 'Prefix sharing avoids scanning disjoint dictionary branches.' },
      { title: 'Apply Constraint Pruning Before Recursing', activeNodeIds: ['n2'], packet: 'If child edge missing or constraint violated → prune subtree', invariant: 'Eliminating a branch at depth d saves b^(H-d) future states.' },
      { title: 'Recurse Along Valid Branch', activeNodeIds: ['n3'], packet: 'Push choice onto mutable path and descend', invariant: 'Single mutable buffer avoids O(N) array cloning per call.' },
      { title: 'Backtrack & Undo State', activeNodeIds: ['n4'], packet: 'Pop choice on return so sibling branches see clean state', invariant: 'Guarantees exhaustive exploration without cross-branch leaks.' },
    ],
    matchedAlgorithms: [
      { label: 'Backtracking', algoId: 'backtracking' },
      { label: 'Aho-Corasick Automaton', algoId: 'aho-corasick' },
      { label: 'NG-Tree / Q-Gram Trie', openFuzzySearch: true },
    ],
  },
  'Dynamic Programming': {
    subtitle: 'Overlapping Subproblem DAG → Memoized / Tabulated Recurrence',
    architectureTitle: 'SRTBOT State-Transition Matrix & Rolling-Row Space Optimizer',
    realWorldBridge: 'Drives Levenshtein fuzzy edit distance, Kondrak positional n-gram alignment, and resource optimization.',
    nodes: [
      { id: 'n1', label: '1. Subproblem DAG', sub: 'Identify overlapping states', metric: 'Exp → Poly' },
      { id: 'n2', label: '2. State Table', sub: 'dp[i][j] or rolling 1D row', metric: 'Cached' },
      { id: 'n3', label: '3. Recurrence Gate', sub: 'opt(prev states + cost)', metric: 'O(trans)' },
      { id: 'n4', label: '4. Optimal Sink', sub: 'dp[m][n] final optimum', metric: 'Exact global' },
    ],
    steps: [
      { title: 'Define Minimal State & Base Cases', activeNodeIds: ['n1', 'n2'], packet: 'Seed row 0 / col 0 boundary conditions', invariant: 'Each subproblem depends strictly on already-solved smaller states.' },
      { title: 'Evaluate State Transition Recurrence', activeNodeIds: ['n3'], packet: 'Combine cached neighbors (up, left, diagonal)', invariant: 'Computes every unique state exactly once instead of 2^N times.' },
      { title: 'Compress Memory to Rolling Rows', activeNodeIds: ['n2', 'n3'], packet: 'Discard row i-2 once row i only reads row i-1', invariant: 'Often slashes O(M·N) space down to O(min(M, N)).' },
      { title: 'Read Global Optimal Solution', activeNodeIds: ['n4'], packet: 'Return dp[m][n] (or backtrack parent pointers for path)', invariant: 'Mathematically guaranteed global optimum via optimal substructure.' },
    ],
    matchedAlgorithms: [
      { label: 'Dynamic Programming', algoId: 'dynamic-programming' },
      { label: 'Bitmask DP', algoId: 'bitmask-dp' },
      { label: 'DP on Trees (Rerooting)', algoId: 'dp-on-trees' },
      { label: 'N-Gram Levenshtein DP', openFuzzySearch: true },
    ],
  },
};

export function TopicArchitectureDiagram({ topic }: { topic: BigTechTopicCategory }) {
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);

  const spec = TOPIC_ARCHITECTURES[topic];
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [topic]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % spec.steps.length);
    }, 1700);
    return () => window.clearInterval(timer);
  }, [playing, spec.steps.length]);

  const currentStep = spec.steps[stepIdx] ?? spec.steps[0];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
            TOPIC ARCHITECTURE DIAGRAM · {topic.toUpperCase()} · {spec.subtitle}
          </div>
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {spec.architectureTitle}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'Pause Flow' : 'Animate Architecture'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((i) => (i + 1) % spec.steps.length);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Step {stepIdx + 1}/{spec.steps.length}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            aria-label="Reset diagram"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Animated 4-Stage Architecture Node Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        {spec.nodes.map((node, idx) => {
          const active = currentStep.activeNodeIds.includes(node.id);
          return (
            <div key={node.id} className="flex items-stretch gap-2">
              <motion.div
                animate={{ y: active ? -3 : 0 }}
                transition={{ duration: 0.2 }}
                className={`flex-1 rounded-xl border p-3.5 flex flex-col justify-between gap-2 transition-colors ${
                  active
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className={active ? 'text-sky-700 dark:text-sky-300 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                    {node.label}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                    {node.metric}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-snug">
                  {node.sub}
                </div>
              </motion.div>
              {idx < spec.nodes.length - 1 && (
                <div className="hidden lg:flex items-center text-slate-300 dark:text-slate-700 shrink-0">
                  <ArrowRight className={`w-4 h-4 ${active ? 'text-sky-500' : ''}`} aria-hidden="true" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Step Packet & Invariant Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/25 p-3 space-y-1">
          <div className="font-mono font-semibold text-sky-700 dark:text-sky-400">
            Step {stepIdx + 1}: {currentStep.title}
          </div>
          <div className="font-mono text-slate-800 dark:text-slate-200">{currentStep.packet}</div>
        </div>
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-1">
          <div className="font-semibold text-emerald-800 dark:text-emerald-300">
            Architectural Invariant & System Bridge
          </div>
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {currentStep.invariant} · <span className="text-slate-500 dark:text-slate-400">{spec.realWorldBridge}</span>
          </div>
        </div>
      </div>

      {/* Direct Links to Matching Algorithms (View or Continue Reading) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Matched Algorithms (Open to view animation or continue reading):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {spec.matchedAlgorithms.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => {
                if (link.openFuzzySearch) {
                  setActiveView('fuzzy-search');
                } else if (link.algoId) {
                  openAlgorithm(link.algoId);
                }
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                link.openFuzzySearch
                  ? 'border border-sky-300 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:border-sky-500'
                  : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
              }`}
            >
              {link.label}
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
