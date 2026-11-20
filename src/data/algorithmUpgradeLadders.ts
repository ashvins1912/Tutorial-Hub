import type { AlgorithmDefinition } from './algorithmsCatalog';

export interface UpgradeStage {
  label: string;
  approach: string;
  time: string;
  space: string;
  bottleneckOrWin: string;
}

export interface AlgorithmUpgradeAndArchitectSpec {
  algorithmId: string;
  brute: UpgradeStage;
  better: UpgradeStage;
  optimal: UpgradeStage;
  codeLevelDfd: string;
  realWorldUseCases: string[];
  challengesFaced: string[];
}

const BESPOKE_UPGRADE_SPECS: Record<string, AlgorithmUpgradeAndArchitectSpec> = {
  'prefix-sum-hash': {
    algorithmId: 'prefix-sum-hash',
    brute: { label: 'Brute Force', approach: 'Sum every contiguous slice [L..R] via nested loops.', time: 'O(N²)', space: 'O(1)', bottleneckOrWin: 'Re-adds overlapping slices millions of times; TLEs at N = 10^5.' },
    better: { label: 'Better', approach: 'Precompute static prefix[] array so each [L..R] query is O(1).', time: 'O(N²)', space: 'O(N)', bottleneckOrWin: 'Still tests all N² pairs (L, R) unless complement lookup is indexed.' },
    optimal: { label: 'Optimal', approach: 'Running prefix + HashMap seeded with {0: 1} counting prefix - K.', time: 'O(N)', space: 'O(N)', bottleneckOrWin: 'Eliminates inner loop completely—works even with negative values.' },
    codeLevelDfd: 'Input nums[i] → accumulate runningSum → query freqMap.get(runningSum - K) → increment totalCount → record freqMap[runningSum]++ → emit total subarrays.',
    realWorldUseCases: ['Financial time-series cumulative P&L window queries', 'Database analytical range-sum rollups and telemetry rate counters'],
    challengesFaced: ['Forgetting to seed {0: 1} drops subarrays starting at index 0.', 'Inserting into map BEFORE querying breaks K = 0 by self-matching.', 'Negative modulo in divisible-by-K variants requires ((p % k) + k) % k.'],
  },
  'two-pointers': {
    algorithmId: 'two-pointers',
    brute: { label: 'Brute Force', approach: 'Check every pair (i, j) with nested loops.', time: 'O(N²)', space: 'O(1)', bottleneckOrWin: 'Ignores sorted monotonicity and inspects dominated pairs.' },
    better: { label: 'Better', approach: 'For each i, binary search complement target - nums[i].', time: 'O(N log N)', space: 'O(1)', bottleneckOrWin: 'Extra log N per element when linear convergence suffices.' },
    optimal: { label: 'Optimal', approach: 'Converging L/R pointers eliminate an entire row/column per step.', time: 'O(N)', space: 'O(1)', bottleneckOrWin: 'Single monotonic pass with zero auxiliary memory.' },
    codeLevelDfd: 'Sorted Array + [L=0, R=N-1] → evaluate f(L, R) vs target → discard dominated side (L++ or R--) → skip adjacent duplicates → emit matched pairs.',
    realWorldUseCases: ['Sorted merge-joins in relational query engines (PostgreSQL Merge Join)', 'Zero-copy in-place stream deduplication & log compaction'],
    challengesFaced: ['Applying converging pointers on unsorted data without preserving original indices.', 'Off-by-one loop guard (L < R vs L <= R) causing self-pairing.', 'Missing duplicate-skip loops in 3Sum/4Sum producing repeated tuples.'],
  },
  'sliding-window': {
    algorithmId: 'sliding-window',
    brute: { label: 'Brute Force', approach: 'Re-evaluate character frequencies for every substring [L..R].', time: 'O(N³)', space: 'O(Σ)', bottleneckOrWin: 'Rebuilds frequency table from scratch on every candidate slice.' },
    better: { label: 'Better', approach: 'Expand R from each fixed L maintaining incremental counts.', time: 'O(N²)', space: 'O(Σ)', bottleneckOrWin: 'Restarts R from scratch whenever L advances by 1.' },
    optimal: { label: 'Optimal', approach: 'Right pointer expands to include; Left pointer shrinks only when invalid.', time: 'O(N)', space: 'O(Σ)', bottleneckOrWin: 'Both pointers only move rightward (<= 2N total state updates).' },
    codeLevelDfd: 'Stream s[R] → increment windowState[s[R]] → while window invalid/satisfied: record best & decrement windowState[s[L++]] → emit optimal span.',
    realWorldUseCases: ['API gateway sliding-window rate limiters (Redis / Envoy)', 'TCP congestion control & real-time moving-average telemetry pipelines'],
    challengesFaced: ['Fails on subarray sums with NEGATIVE numbers (monotonicity breaks—use Prefix+Hash).', 'Moving left pointer backward when jumping via lastSeen map (always use Math.max).', 'Using window.size instead of exact satisfied count `formed === required` on duplicate chars.'],
  },
  'monotonic-stack': {
    algorithmId: 'monotonic-stack',
    brute: { label: 'Brute Force', approach: 'Scan right/left from every index i to locate next greater/smaller.', time: 'O(N²)', space: 'O(1)', bottleneckOrWin: 'Re-scans the same valleys repeatedly on sorted/sawtooth inputs.' },
    better: { label: 'Better', approach: 'Segment Tree / Binary Search over value indices.', time: 'O(N log N)', space: 'O(N)', bottleneckOrWin: 'Over-engineered log factor for nearest-boundary queries.' },
    optimal: { label: 'Optimal', approach: 'Stack of unresolved indices popped the instant a dominant element arrives.', time: 'O(N)', space: 'O(N)', bottleneckOrWin: 'Every index enters and leaves stack at most once (<= 2N ops).' },
    codeLevelDfd: 'Element a[i] → while stack non-empty & a[top] dominated by a[i]: pop top & resolve span[top] → push i → flush remaining with trailing sentinel 0.',
    realWorldUseCases: ['Stock span & financial drawdown analytics', 'DOM/CSS layout bounding-box & histogram visibility engines'],
    challengesFaced: ['Forgetting a trailing sentinel (height 0) leaves unresolved bars trapped on stack.', 'Confusing strict `<` vs `<=` breaks duplicate-value width calculations.', 'Pushing values instead of indices loses exact span distance `i - top`.'],
  },
  'monotonic-deque': {
    algorithmId: 'monotonic-deque',
    brute: { label: 'Brute Force', approach: 'Scan all K elements inside each sliding window.', time: 'O(N · K)', space: 'O(1)', bottleneckOrWin: 'Re-reads K - 1 identical elements on every single slide.' },
    better: { label: 'Better', approach: 'Max-Heap of (value, index) with lazy expiration at top.', time: 'O(N log K)', space: 'O(N)', bottleneckOrWin: 'Heap accumulates stale indices and pays log K per push/pop.' },
    optimal: { label: 'Optimal', approach: 'Decreasing deque of indices: expire front (`<= i - k`) & evict smaller back.', time: 'O(N)', space: 'O(K)', bottleneckOrWin: 'True linear amortized time with O(1) window-max readout at front.' },
    codeLevelDfd: 'Index i → expire front if dq[head] <= i - k → pop back while a[back] <= a[i] → push i → when i >= k - 1 emit a[dq[head]].',
    realWorldUseCases: ['Real-time peak CPU / P100 latency tracking over rolling 60-second windows', 'High-frequency trading rolling bid/ask extrema & DP sliding-window acceleration'],
    challengesFaced: ['Using JS Array.shift() turns O(N) into O(N²)—always track a `head` pointer or ring buffer.', 'Storing values instead of indices breaks front expiration on duplicate values.', 'Using wrong inequality direction reverses max-deque into min-deque.'],
  },
  'binary-search': {
    algorithmId: 'binary-search',
    brute: { label: 'Brute Force', approach: 'Linearly test every index or candidate answer 1..Max.', time: 'O(N) or O(N·Max)', space: 'O(1)', bottleneckOrWin: 'Times out instantly when search space reaches 10^9.' },
    better: { label: 'Better', approach: 'Jump search / exponential stepping in blocks of √N.', time: 'O(√N)', space: 'O(1)', bottleneckOrWin: 'Still wastes thousands of probes compared to halving.' },
    optimal: { label: 'Optimal', approach: 'Halve monotonic predicate space `[lo, hi]` with safe `lo + ((hi - lo) >> 1)`.', time: 'O(log Range · check)', space: 'O(1)', bottleneckOrWin: 'Searches 10^9 candidates in just 30 iterations.' },
    codeLevelDfd: 'Monotonic Range [lo, hi] → midpoint m → evaluate feasible(m) → shrink boundary preserving invariant → converge at exact threshold lo.',
    realWorldUseCases: ['B-Tree / LSM-Tree SSTable index lookup in databases', 'Git bisect regression hunting & cloud autoscaler capacity sizing'],
    challengesFaced: ['Infinite loops when `lo = mid` without upward rounding `mid = (lo + hi + 1) >> 1`.', 'Integer overflow `(lo + hi) / 2` in Java/C++ when bounds exceed 10^9.', 'Off-by-one inclusive (`lo <= hi`) vs half-open (`lo < hi`) termination contracts.'],
  },
  'dijkstra-shortest-path': {
    algorithmId: 'dijkstra-shortest-path',
    brute: { label: 'Brute Force', approach: 'DFS exploring all simple paths between source and target.', time: 'O(V!)', space: 'O(V)', bottleneckOrWin: 'Combinatorial explosion even on small 25-node graphs.' },
    better: { label: 'Better', approach: 'Bellman-Ford relaxing every edge V - 1 rounds.', time: 'O(V · E)', space: 'O(V)', bottleneckOrWin: 'Re-relaxes settled edges needlessly when all weights are non-negative.' },
    optimal: { label: 'Optimal', approach: 'Binary Min-Heap settling minimum unsettled vertex + stale-entry guard.', time: 'O((V + E) log V)', space: 'O(V + E)', bottleneckOrWin: 'Greedy settlement settles every vertex permanently on first valid pop.' },
    codeLevelDfd: 'MinHeap[(0, src)] → pop min (d, u) → skip if d > dist[u] → relax neighbors (u→v, w) → push improved (d+w, v) → emit dist[].',
    realWorldUseCases: ['OSPF / IS-IS internet packet routing protocols', 'Google Maps / Uber road-network travel-time routing (with A* heuristics)'],
    challengesFaced: ['Silent wrong answers if ANY edge weight is negative (pivot to Bellman-Ford).', 'Omitting `if (d > dist[u]) continue` causes redundant re-expansions and TLE.', 'Confusing 0/1 weight grids where 0-1 BFS removes the log V factor cleanly.'],
  },
  'zero-one-bfs': {
    algorithmId: 'zero-one-bfs',
    brute: { label: 'Brute Force', approach: 'Backtracking DFS over all valid paths in the binary-cost grid.', time: 'O(4^(R·C))', space: 'O(R·C)', bottleneckOrWin: 'Exponentially revisits cells along suboptimal cost paths.' },
    better: { label: 'Better', approach: 'Standard Min-Heap Dijkstra treating 0 and 1 as generic weights.', time: 'O((V + E) log V)', space: 'O(V)', bottleneckOrWin: 'Pays unnecessary O(log V) heap sifting for just two weight values.' },
    optimal: { label: 'Optimal', approach: 'Deque pushing w=0 neighbors to FRONT and w=1 neighbors to BACK.', time: 'O(V + E)', space: 'O(V)', bottleneckOrWin: 'Maintains exact sorted two-wave frontier in strictly O(1) per push/pop.' },
    codeLevelDfd: 'Pop front u → inspect edge (u→v, w ∈ {0,1}) → if dist[u]+w < dist[v]: update dist[v], w===0 ? pushFront(v) : pushBack(v) → emit dist[].',
    realWorldUseCases: ['Robot path planning with free straight moves vs paid rotation turns', 'Network packet switching with zero-cost intra-rack vs 1-hop cross-rack links'],
    challengesFaced: ['Fails immediately if any edge weight is >= 2 or negative.', 'Using Array.unshift/shift in JS without a ring buffer degrades large 10^5 grids.', 'Marking visited on first enqueue instead of relaxing via `dist[u] + w < dist[v]` misses shorter 0-cost detours.'],
  },
  'bidirectional-bfs': {
    algorithmId: 'bidirectional-bfs',
    brute: { label: 'Brute Force', approach: 'DFS enumerating all transformation chains.', time: 'O(b^d)', space: 'O(d)', bottleneckOrWin: 'No shortest-path guarantee and explodes exponentially.' },
    better: { label: 'Better', approach: 'Standard single-source BFS from start until hitting target.', time: 'O(b^d)', space: 'O(b^d)', bottleneckOrWin: 'Frontier size multiplies by branching factor b at every depth layer.' },
    optimal: { label: 'Optimal', approach: 'Expand two sets (front, back), always stepping the smaller frontier.', time: 'O(b^(d/2))', space: 'O(b^(d/2))', bottleneckOrWin: 'Square-root reduction in visited states; collides cleanly in the middle.' },
    codeLevelDfd: 'front={src}, back={dst} → swap so |front| <= |back| → generate 1-hop neighbors → if neighbor ∈ back return steps+1 → advance front.',
    realWorldUseCases: ['LinkedIn / Facebook shortest degrees-of-separation queries across billions of edges', 'Rubiks Cube & state-space puzzle solvers (Word Ladder, Lock Cracking)'],
    challengesFaced: ['Forgetting to verify `endWord` exists in the dictionary returns false hits.', 'Deleting words too early breaks Word Ladder II (all shortest paths).', 'Not swapping to the smaller frontier forfeits speedup on asymmetric degree hubs.'],
  },
  'kruskals-mst': {
    algorithmId: 'kruskals-mst',
    brute: { label: 'Brute Force', approach: 'Enumerate spanning subgraphs of V - 1 edges and check connectivity.', time: 'O(C(E, V-1))', space: 'O(V)', bottleneckOrWin: 'Astronomical combinations even for 20 vertices.' },
    better: { label: 'Better', approach: 'Sort edges and run O(V) DFS cycle check before adding each edge.', time: 'O(E · V)', space: 'O(V + E)', bottleneckOrWin: 'Repeated graph traversal for every candidate edge.' },
    optimal: { label: 'Optimal', approach: 'Sort edges O(E log E) + Union-Find (Path Compression & Size) cycle guard.', time: 'O(E log E)', space: 'O(V + E)', bottleneckOrWin: 'O(α(V)) ≈ O(1) cycle detection with early stop at V - 1 edges.' },
    codeLevelDfd: 'EdgeList → Sort ascending by weight → for (u,v,w): if find(u) != find(v) union(u,v) & add w → stop at V - 1 edges → emit MST cost.',
    realWorldUseCases: ['Telecom fiber-optic & power-grid minimum cable layout planning', 'Single-linkage hierarchical clustering in unsupervised machine learning'],
    challengesFaced: ['Forgetting to check `edgesUsed === V - 1` silently returns partial cost on disconnected graphs.', 'On dense complete graphs (E = V²), sorting V² edges wastes RAM vs O(V)-space Prim.', 'Applying Kruskal on directed graphs fails (directed MST requires Edmonds’ Chu-Liu algorithm).'],
  },
  'bipartite-graph-coloring': {
    algorithmId: 'bipartite-graph-coloring',
    brute: { label: 'Brute Force', approach: 'Try all 2^V team assignments and validate every edge.', time: 'O(2^V · E)', space: 'O(V)', bottleneckOrWin: 'Exponentially impossible past V = 25.' },
    better: { label: 'Better', approach: 'Run cycle-length enumeration to check for odd cycles.', time: 'O(V · E)', space: 'O(V)', bottleneckOrWin: 'Complex and unnecessary when greedy 2-coloring proves parity directly.' },
    optimal: { label: 'Optimal', approach: 'Component-sweeping BFS/DFS alternating color 0 ↔ 1 across edges.', time: 'O(V + E)', space: 'O(V)', bottleneckOrWin: 'Single linear pass detects any odd cycle immediately on conflict.' },
    codeLevelDfd: 'For each uncolored node i → seed color[i]=0 → BFS neighbor v: uncolored ? paint 1-color[u] : if color[v]===color[u] return false.',
    realWorldUseCases: ['Register allocation & 2-frequency radio/cell-tower interference partitioning', 'Matching buyers/sellers or jobs/workers in bipartite flow pipelines'],
    challengesFaced: ['Starting BFS only from node 0 misses disconnected components with odd cycles!', 'Confusing undirected conflict graphs with directed dependency graphs (Topo Sort).', 'Using 0 as unvisited sentinel collides with Team 0—always initialize color[] to -1.'],
  },
  'sweep-line-events': {
    algorithmId: 'sweep-line-events',
    brute: { label: 'Brute Force', approach: 'Count overlaps at every integer timestamp t in [minStart..maxEnd].', time: 'O(N · T)', space: 'O(T)', bottleneckOrWin: 'OOMs and TLEs immediately when timestamps reach 10^9.' },
    better: { label: 'Better', approach: 'Sort intervals by start + maintain a Min-Heap of end times.', time: 'O(N log N)', space: 'O(N)', bottleneckOrWin: 'Works well, though event sweep simplifies multi-attribute delta tracking.' },
    optimal: { label: 'Optimal', approach: 'Emit (+1 start, -1 end) events, sort with -1 before +1 ties, sweep active.', time: 'O(N log N)', space: 'O(N)', bottleneckOrWin: 'Coordinate-independent sparse sweep handling 10^9 timestamps cleanly.' },
    codeLevelDfd: 'Intervals [s,e) → expand to (s,+1) & (e,-1) → sort (time asc, delta asc) → accumulate active += delta → track max peak.',
    realWorldUseCases: ['Cloud VM peak concurrency billing & conference-room reservation schedulers', '2D CAD/GIS polygon intersection & skyline rendering engines'],
    challengesFaced: ['Wrong tie-breaking order (+1 before -1) overcounts rooms on back-to-back `[0,10],[10,20]`.', 'Forgetting offline nature: online bookings need TreeMap or Dynamic Lazy Segment Tree.', 'Closed vs half-open interval semantics flip the tie-breaking sign completely.'],
  },
  'dual-heaps-median': {
    algorithmId: 'dual-heaps-median',
    brute: { label: 'Brute Force', approach: 'Append each arrival and re-sort the full array on every median query.', time: 'O(N² log N)', space: 'O(N)', bottleneckOrWin: 'Repeats sorting work on every incoming event.' },
    better: { label: 'Better', approach: 'Binary-search insertion into a sorted array (O(N) shift per add).', time: 'O(N²)', space: 'O(N)', bottleneckOrWin: 'Array shifting bottlenecks streams beyond 10^4 elements.' },
    optimal: { label: 'Optimal', approach: 'Lower Max-Heap (`lo`) + Upper Min-Heap (`hi`) rebalanced to size diff <= 1.', time: 'O(log N) add · O(1) read', space: 'O(N)', bottleneckOrWin: 'Exposes the exact split boundary at both heap roots in O(1).' },
    codeLevelDfd: 'Stream x → push to lo(MaxHeap) → move lo.pop() to hi(MinHeap) → if |hi|>|lo| move hi.pop() to lo → median from root(s).',
    realWorldUseCases: ['Real-time APM latency P50 / P95 streaming monitors (Prometheus / Datadog)', 'Online financial order-book mid-price & sliding-window signal median filters'],
    challengesFaced: ['Skipping the unconditional spill `lo → hi` causes ordering inversion `max(lo) > min(hi)`.', 'Sliding Window Median requires lazy-deletion maps because binary heaps lack O(log N) arbitrary remove.', 'JavaScript lacks a native Heap—interviewers expect clear siftUp/siftDown or clean class abstraction.'],
  },
  'lis-patience-sorting': {
    algorithmId: 'lis-patience-sorting',
    brute: { label: 'Brute Force', approach: 'Test all 2^N subsequences for strictly increasing order.', time: 'O(N · 2^N)', space: 'O(N)', bottleneckOrWin: 'Completely infeasible past N = 25.' },
    better: { label: 'Better', approach: '1D DP `dp[i] = 1 + max(dp[j])` for all `j < i` with `a[j] < a[i]`.', time: 'O(N²)', space: 'O(N)', bottleneckOrWin: 'TLEs when N = 10^5 (10^10 comparisons).' },
    optimal: { label: 'Optimal', approach: 'Maintain monotonic `tails[]` and binary search `lower_bound` per element.', time: 'O(N log N)', space: 'O(N)', bottleneckOrWin: 'Compresses inner O(N) predecessor scan into O(log N) binary search.' },
    codeLevelDfd: 'Element x → lower_bound(tails, x) → overwrite tails[idx]=x (or append if idx===len) → final LIS length = tails.length.',
    realWorldUseCases: ['Git / Myers diff longest common subsequence alignment acceleration', 'Bioinformatics genome sequence alignment & 2D box-stacking logistics'],
    challengesFaced: ['Assuming `tails` contains the actual subsequence elements (it only guarantees exact LENGTH—track parent pointers to reconstruct).', 'Using `upper_bound` instead of `lower_bound` breaks strictly-increasing duplicates like `[7,7,7]`.', 'Forgetting descending height tie-break in 2D Russian Doll Envelopes allows invalid equal-width nesting.'],
  },
  'meet-in-the-middle': {
    algorithmId: 'meet-in-the-middle',
    brute: { label: 'Brute Force', approach: 'Backtrack all 2^N subsets across the full array.', time: 'O(2^N)', space: 'O(N)', bottleneckOrWin: 'At N = 40, 2^40 ≈ 1.1×10^12 ops causes immediate TLE.' },
    better: { label: 'Better', approach: 'Pseudo-polynomial Subset Sum DP over target sum S.', time: 'O(N · S)', space: 'O(S)', bottleneckOrWin: 'OOMs & TLEs when values reach ±10^7 or 10^9.' },
    optimal: { label: 'Optimal', approach: 'Split N into two N/2 halves, generate 2^(N/2) sums each, sort right + binary search.', time: 'O(N · 2^(N/2))', space: 'O(2^(N/2))', bottleneckOrWin: 'Cuts 10^12 down to ~10^6 (square-root exponential compression).' },
    codeLevelDfd: 'nums[0..N-1] → split Left/Right → enumerate 2^(N/2) sums → sort Right → binary search goal - sL (check lo & lo-1) → emit min diff.',
    realWorldUseCases: ['Cryptographic meet-in-the-middle attacks (Double-DES key-space reduction)', 'Combinatorial portfolio balancing & exact subset-partition optimization'],
    challengesFaced: ['Checking only `right[lo]` without checking `right[lo - 1]` misses closer smaller sums.', 'Memory exhaustion above N = 46 if deduplication or popcount bucketing is ignored.', 'Ignoring empty subset `0` breaks cases where selecting nothing is closest to goal.'],
  },
  quickselect: {
    algorithmId: 'quickselect',
    brute: { label: 'Brute Force', approach: 'Sort the entire array ascending and index `nums[N - K]`.', time: 'O(N log N)', space: 'O(log N)', bottleneckOrWin: 'Wastes work ordering the N - 1 elements you never asked for.' },
    better: { label: 'Better', approach: 'Maintain a bounded Min-Heap of size K across one pass.', time: 'O(N log K)', space: 'O(K)', bottleneckOrWin: 'Optimal for streams, but slightly slower than linear in-place partition.' },
    optimal: { label: 'Optimal', approach: 'Randomized 3-way Lomuto/Hoare partition recursing into ONE side only.', time: 'O(N) avg', space: 'O(1)', bottleneckOrWin: 'Geometric work series N + N/2 + N/4 + ... = 2N = O(N) expected.' },
    codeLevelDfd: 'Array[lo..hi] + random pivot → 3-way partition (<, ==, >) → discard irrelevant half → converge directly on target index N - K.',
    realWorldUseCases: ['C++ std::nth_element & NumPy np.partition fast percentile computation', 'Database Top-K query execution & k-NN spatial KD-tree median splitting'],
    challengesFaced: ['Fixed pivot (last element) degrades to O(N²) on already-sorted inputs.', 'All-duplicate arrays degrade 2-way partition to O(N²) unless 3-way Dutch partition is used.', 'Mutates the input array in-place (clone or use Heap if input is read-only/streaming).'],
  },
};

export function getAlgorithmUpgradeSpec(algo: AlgorithmDefinition): AlgorithmUpgradeAndArchitectSpec {
  if (BESPOKE_UPGRADE_SPECS[algo.id]) {
    return BESPOKE_UPGRADE_SPECS[algo.id];
  }

  const cat = algo.category;
  const leapParts = algo.complexityLeap.split('→').map((s) => s.trim());
  const bruteTimeGuess = leapParts[0]?.match(/O\([^)]+\)/)?.[0] ?? 'O(N²) / O(2^N)';
  const bruteDesc = leapParts[0] || `Naive nested / exhaustive search for ${algo.shortName}.`;

  let useCases: string[] = [
    `High-throughput production pipelines applying ${algo.shortName} under strict latency SLAs.`,
    `Core algorithmic kernel powering ${algo.linkedTopics.join(' & ')} services.`,
  ];
  let challenges: string[] = [
    algo.whenItFails,
    `Maintaining the core invariant ("${algo.loopInvariant.slice(0, 110)}${algo.loopInvariant.length > 110 ? '...' : ''}") across empty, single-element, and duplicate-value boundary inputs.`,
    `Preventing silent complexity regressions when constraints scale to N = 10^5+ or adversarial inputs trigger worst-case behavior.`,
  ];

  if (cat === 'Advanced Graph Algorithms' || cat === 'Tree & Graph Traversal') {
    useCases = [
      `Distributed dependency resolution, network routing, and service-mesh topology analysis (${algo.shortName}).`,
      `Large-scale graph storage engines, map navigation, and build-system DAG schedulers.`,
    ];
  } else if (cat === 'Range Queries & Advanced Trees') {
    useCases = [
      `Time-series database range aggregations and real-time financial order-book interval queries.`,
      `High-frequency mutable analytics dashboards requiring O(log N) updates and range reads.`,
    ];
  } else if (cat === 'Advanced String Algorithms') {
    useCases = [
      `Search-engine indexing, intrusion-detection multi-pattern packet scanners, and IDE syntax search.`,
      `Genomic DNA/RNA sequence alignment and log-stream signature matching.`,
    ];
  } else if (cat === 'Advanced Dynamic Programming' || cat === 'Optimization & Decision Making') {
    useCases = [
      `Resource allocation, compiler register/instruction scheduling, and route-cost optimization.`,
      `Quantitative finance dynamic programming, ad-budget pacing, and logistics planning.`,
    ];
  } else if (cat === 'Number Theory & Geometry' || cat === 'Randomized & Heuristic Algorithms') {
    useCases = [
      `Public-key cryptography (RSA/ECC modular math), graphics collision hulls, and streaming telemetry sampling.`,
      `Distributed observability sampling and probabilistic load balancing at petabyte scale.`,
    ];
  }

  return {
    algorithmId: algo.id,
    brute: {
      label: 'Brute Force',
      approach: bruteDesc,
      time: bruteTimeGuess,
      space: 'O(1) – O(N)',
      bottleneckOrWin: 'Performs redundant recomputation across overlapping subproblems or unpruned search states.',
    },
    better: {
      label: 'Better',
      approach: `Pre-index or prune obvious dead states before applying full ${algo.shortName} invariant.`,
      time: 'Intermediate',
      space: algo.spaceComplexity,
      bottleneckOrWin: 'Cuts constant factor or partial work, but still hits TLE/OOM on tight 10^5+ interview constraints.',
    },
    optimal: {
      label: 'Optimal',
      approach: algo.coreIdea,
      time: algo.timeComplexity,
      space: algo.spaceComplexity,
      bottleneckOrWin: leapParts[1] || `Enforces invariant directly in ${algo.timeComplexity} time and ${algo.spaceComplexity} space.`,
    },
    codeLevelDfd: `Input State → Initialize ${algo.shortName} structure → Step invariant (${algo.mentalModelSteps[0] ?? 'process state'}) → Transition (${algo.mentalModelSteps[1] ?? 'update optimal state'}) → Emit verified result in ${algo.timeComplexity}.`,
    realWorldUseCases: useCases,
    challengesFaced: challenges,
  };
}
