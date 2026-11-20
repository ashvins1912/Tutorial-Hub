export interface AlgorithmFollowUpTwist {
  question: string;
  invariantShift: string;
  complexityImpact: string;
}

export interface AlgorithmTutorGuide {
  algorithmId: string;
  simpleAnalogy: string;
  interviewScript30s: string;
  chooseWhen: string;
  avoidWhen: string;
  followUpTwists: AlgorithmFollowUpTwist[];
}

export const ALGORITHM_TUTOR_GUIDES: Record<string, AlgorithmTutorGuide> = {
  'prefix-sum-hash': {
    algorithmId: 'prefix-sum-hash',
    simpleAnalogy:
      'Like checking a car odometer at Mile 2 and Mile 7: subtracting two running totals tells you the exact distance between them in one subtraction—even when the road goes downhill (negative numbers).',
    interviewScript30s:
      '"Because elements can be negative, sliding window monotonicity breaks. I rewrite sum(L..R) = K as prefix[R] - prefix[L-1] = K, seed {0: 1} in a HashMap, and count matching prior prefixes in O(N) time and O(N) space."',
    chooseWhen: 'Static range sums, subarray sum == K with negatives, or batch offline range additions.',
    avoidWhen: 'Online interleaved point updates + range queries (upgrade to Fenwick Tree / Segment Tree).',
    followUpTwists: [
      {
        question: 'What if we need subarray sum DIVISIBLE by K with negative numbers?',
        invariantShift: 'Store normalized remainder `((prefix % k) + k) % k` as the HashMap key; matching remainders mean the slice between them is divisible by K.',
        complexityImpact: 'Still O(N) time, O(min(N, K)) space.',
      },
      {
        question: 'What if the array receives online point updates between sum queries?',
        invariantShift: 'Static prefix sums degrade to O(N) per update; replace with a 1-indexed Fenwick Tree (BIT).',
        complexityImpact: 'O(log N) update and O(log N) query.',
      },
    ],
  },
  'two-pointers': {
    algorithmId: 'two-pointers',
    simpleAnalogy:
      'Two readers starting at opposite ends of a sorted bookshelf walking inward: whenever the pair is too big, the right person steps left; whenever too small, the left person steps right.',
    interviewScript30s:
      '"On a sorted array (or bounded walls), moving the dominated pointer provably discards an entire row of worse pairs, dropping O(N²) search to O(N) in strictly O(1) space."',
    chooseWhen: 'Sorted pair/triplet sums, palindromes, in-place deduplication, or wall-bounded water area.',
    avoidWhen: 'Unsorted array where original indices cannot be destroyed (use HashMap instead).',
    followUpTwists: [
      {
        question: 'How do you extend 2Sum Sorted to 3Sum or K-Sum without duplicate tuples?',
        invariantShift: 'Sort once, fix outer anchors, run converging 2-pointer inside, and skip adjacent equal values on every level.',
        complexityImpact: 'O(N^(K-1)) time, O(1) auxiliary space (excluding output).',
      },
      {
        question: 'What if the input arrives as a Linked List instead of an array?',
        invariantShift: 'Cannot index backward; pivot to Fast/Slow same-direction pointers or reverse the right half first.',
        complexityImpact: 'O(N) time, O(1) space.',
      },
    ],
  },
  'sliding-window': {
    algorithmId: 'sliding-window',
    simpleAnalogy:
      'A stretchy rubber frame sliding rightward across a tape: stretch the right edge to collect new items, and pull the left edge forward whenever the frame breaks your rule.',
    interviewScript30s:
      '"Since frequencies or non-negative sums change monotonically as the window grows or shrinks, both pointers cross the array at most once—achieving O(N) amortized time instead of O(N²)."',
    chooseWhen: 'Longest or shortest contiguous subarray/substring with positive values or character counts.',
    avoidWhen: 'Negative values are present in sum constraints (monotonicity breaks -> use Prefix Sum + HashMap).',
    followUpTwists: [
      {
        question: 'How do you count subarrays with EXACTLY K distinct integers?',
        invariantShift: 'Sliding window tracks "at most K" cleanly; compute `atMost(K) - atMost(K - 1)` in two linear passes.',
        complexityImpact: 'O(N) time, O(K) map space.',
      },
      {
        question: 'What if negative numbers are added to "Shortest Subarray with Sum >= K"?',
        invariantShift: 'Standard left-shrink fails; switch to Prefix Sums + Monotonic Increasing Deque.',
        complexityImpact: 'Remains O(N) time, O(N) space.',
      },
    ],
  },
  'binary-search': {
    algorithmId: 'binary-search',
    simpleAnalogy:
      'Opening a dictionary straight to the middle: every single guess throws away half the remaining pages, turning a 1-million-page search into just 20 flips.',
    interviewScript30s:
      '"Notice the feasibility predicate is monotonic (False..False then True..True). Binary searching the answer range [lo..hi] with an O(N) checker solves this in O(N log(Range)) without enumerating every candidate."',
    chooseWhen: 'Sorted arrays, rotated sorted arrays, peaks, or "minimize the maximum / maximize the minimum" optimization.',
    avoidWhen: 'Feasibility predicate flips back and forth non-monotonically.',
    followUpTwists: [
      {
        question: 'What if Rotated Sorted Array contains duplicate elements (Search II)?',
        invariantShift: 'When `nums[lo] === nums[mid] === nums[hi]`, we cannot tell which half is sorted—shrink `lo++; hi--` safely.',
        complexityImpact: 'O(log N) average, O(N) worst case on all-equal arrays.',
      },
      {
        question: 'How do you prevent infinite loops between left-biased and right-biased mid?',
        invariantShift: 'Pair floor mid (`lo + ((hi - lo) >> 1)`) strictly with `hi = mid; else lo = mid + 1`.',
        complexityImpact: 'Guaranteed O(log(hi - lo)) termination.',
      },
    ],
  },
  'fast-slow-pointers': {
    algorithmId: 'fast-slow-pointers',
    simpleAnalogy:
      'Two runners on a track where one runs twice as fast: on a straight road the fast runner finishes when the slow runner hits the exact halfway point; on a circular loop they are guaranteed to lap and collide.',
    interviewScript30s:
      '"Using a 1-step slow pointer and 2-step fast pointer detects cycles and splits lists in half in O(N) time and O(1) memory, avoiding an O(N) visited HashSet."',
    chooseWhen: 'Linked list cycle detection, cycle entry node, midpoint split, or implicit duplicate cycle (Find Duplicate Number #287).',
    avoidWhen: 'Graph has branching nodes with > 1 outgoing edge (needs general Graph DFS/BFS).',
    followUpTwists: [
      {
        question: 'Once slow and fast collide, how do you locate the exact cycle entry node?',
        invariantShift: 'Reset one pointer to head and advance both 1 step at a time—by modular distance algebra, they meet at the cycle start.',
        complexityImpact: 'Still O(N) time, O(1) space.',
      },
      {
        question: 'How does Floyd detect a duplicate in a read-only array of [1..N]?',
        invariantShift: 'Treat `idx -> nums[idx]` as a functional linked list; the duplicate number is the cycle entry node with indegree >= 2.',
        complexityImpact: 'O(N) time, O(1) space without modifying the array.',
      },
    ],
  },
  'monotonic-stack': {
    algorithmId: 'monotonic-stack',
    simpleAnalogy:
      'People standing in line looking forward: anyone shorter than a tall newcomer behind them is permanently blocked from view and pops out of the line immediately.',
    interviewScript30s:
      '"Instead of scanning forward O(N²) from each index, I keep unresolved indices in monotonic order on a stack. Each element enters once and pops once when resolved, guaranteeing amortized O(N)."',
    chooseWhen: 'Next Greater/Smaller Element, Daily Temperatures, Stock Span, Largest Rectangle in Histogram.',
    avoidWhen: 'Fixed sliding window max/min (use Monotonic Deque) or global K-th order (use Heap).',
    followUpTwists: [
      {
        question: 'What if the array is circular (Next Greater Element II)?',
        invariantShift: 'Loop `i` from `0` to `2*N - 1` indexing `nums[i % N]`, pushing indices only during the first pass (`i < N`).',
        complexityImpact: 'O(N) time, O(N) space.',
      },
      {
        question: 'How do you avoid double-counting equal values in Sum of Subarray Minimums?',
        invariantShift: 'Use strict `<` on one boundary sweep and non-strict `<=` on the opposite side to partition ties uniquely.',
        complexityImpact: 'O(N) time, O(N) space.',
      },
    ],
  },
  'tree-bfs-dfs': {
    algorithmId: 'tree-bfs-dfs',
    simpleAnalogy:
      'Dropping a pebble in a pond: ripples expand ring-by-ring (distance 1, then 2, then 3), so the very first ripple to touch your target is guaranteed to be the shortest path.',
    interviewScript30s:
      '"Because every edge has unit cost 1, BFS visits nodes in non-decreasing distance waves. Marking nodes visited ON ENQUEUE guarantees O(V + E) time and shortest hops."',
    chooseWhen: 'Unweighted shortest paths, multi-source grid spread (Rotting Oranges), tree level-order views.',
    avoidWhen: 'Edges have varying positive weights (switch to Dijkstra) or path memory must stay O(depth) on deep wide trees (use DFS).',
    followUpTwists: [
      {
        question: 'How do you speed up Word Ladder when branching factor is huge?',
        invariantShift: 'Run Bidirectional BFS expanding whichever frontier set (start vs end) is currently smaller.',
        complexityImpact: 'Cuts search space from O(b^d) down to O(b^(d/2)).',
      },
      {
        question: 'What if edge weights are strictly {0, 1} (e.g., Minimum Cost Grid Path)?',
        invariantShift: 'Replace FIFO queue with a 0-1 BFS Deque: push 0-cost edges to front and 1-cost edges to back.',
        complexityImpact: 'O(V + E) instead of O((V + E) log V) Dijkstra.',
      },
    ],
  },
  'heap-intervals': {
    algorithmId: 'heap-intervals',
    simpleAnalogy:
      'Managing conference rooms: sort meetings by start time and keep a Min-Heap of occupied room end times—if the earliest-finishing room frees up before the next meeting starts, reuse it; otherwise open a new room.',
    interviewScript30s:
      '"Sorting by start time processes meetings chronologically, and a Min-Heap of end times lets us check the earliest free room in O(1) and update in O(log N), finishing in O(N log N)."',
    chooseWhen: 'Meeting Rooms II, Top-K streams, K-Way Merge, CPU Task Scheduler, Streaming Median.',
    avoidWhen: 'Only merging overlapping intervals (no heap needed—simple sort + linear merge suffices).',
    followUpTwists: [
      {
        question: 'Can you compute Minimum Meeting Rooms without a Heap?',
        invariantShift: 'Separate and sort start[] and end[] arrays independently, then run a two-pointer chronological sweep.',
        complexityImpact: 'Same O(N log N) time, lower constant factor.',
      },
      {
        question: 'What if you must assign WHICH exact room number each meeting gets?',
        invariantShift: 'Maintain two Min-Heaps: `availableRooms` (by room ID) and `busyRooms` (by [endTime, roomId]).',
        complexityImpact: 'O(N log R) time, O(R) space.',
      },
    ],
  },
  'graph-topo-sort': {
    algorithmId: 'graph-topo-sort',
    simpleAnalogy:
      'Getting dressed in the morning: you can put on socks and a shirt in any order (0 prerequisites), but shoes wait until socks are done; if two items require each other, you have an impossible cycle.',
    interviewScript30s:
      '"I model prerequisites as directed edges prereq -> course, enqueue all 0-indegree vertices, and peel them layer by layer via Kahn BFS. If processedCount < V, a dependency cycle exists."',
    chooseWhen: 'Course scheduling, build-order dependencies, Alien Dictionary ordering, DAG longest path.',
    avoidWhen: 'Graph is undirected (use Union-Find or BFS/DFS for undirected cycles).',
    followUpTwists: [
      {
        question: 'What if the interviewer asks for the LEXICOGRAPHICALLY smallest valid topological order?',
        invariantShift: 'Swap the standard FIFO Queue in Kahn’s algorithm for a Min-Heap so the smallest ready node always pops first.',
        complexityImpact: 'O((V + E) log V) time.',
      },
      {
        question: 'How do you find minimum parallel semesters to finish all courses?',
        invariantShift: 'Process Kahn’s queue level-by-level (snapshot `q.length` per semester); the number of BFS waves is the critical path.',
        complexityImpact: 'O(V + E) time, O(V) space.',
      },
    ],
  },
  'dijkstra-shortest-path': {
    algorithmId: 'dijkstra-shortest-path',
    simpleAnalogy:
      'A GPS exploring toll roads: always lock in the cheapest unvisited intersection next because adding more positive tolls later can never make a longer route cheaper.',
    interviewScript30s:
      '"With non-negative weights, the smallest unsettled vertex popped from the Min-Heap is permanently optimal. Skipping stale entries (`if (d > dist[u]) continue`) keeps total runtime O((V + E) log V)."',
    chooseWhen: 'Single-source shortest paths or min-max effort grid paths with strictly non-negative weights.',
    avoidWhen: 'Any edge has a negative weight (use Bellman-Ford) or edges are all unweighted (use plain BFS).',
    followUpTwists: [
      {
        question: 'What if you must find the shortest path using AT MOST K stops?',
        invariantShift: 'Track state as `(node, stopsUsed)` in Dijkstra or run K + 1 Bellman-Ford rounds over a cloned distance snapshot.',
        complexityImpact: 'O(K · E) Bellman-Ford or O(K · E log(K · V)) state Dijkstra.',
      },
      {
        question: 'How do you count the NUMBER of distinct shortest paths modulo 10^9+7?',
        invariantShift: 'Maintain `ways[v]`: on strict improvement `ways[v] = ways[u]`; on tie (`d + w === dist[v]`) add `ways[v] += ways[u]`.',
        complexityImpact: 'Same O((V + E) log V) time.',
      },
    ],
  },
  'backtracking-trie': {
    algorithmId: 'backtracking-trie',
    simpleAnalogy:
      'Exploring a maze with chalk in hand: draw a step (Choose), walk forward (Explore), and erase the chalk mark on your way back (Unchoose)—stopping immediately at dead-end signs (Pruning).',
    interviewScript30s:
      '"Since we must enumerate all valid configurations under small N, I use Choose -> Explore -> Unchoose with O(1) conflict sets (or Trie edges) to prune invalid subtrees before recursing."',
    chooseWhen: 'Subsets, permutations, combinations, Sudoku, N-Queens, Word Search II (with Trie pruning).',
    avoidWhen: 'Asked only for the COUNT or OPTIMAL score with large N > 25 (switch to Dynamic Programming).',
    followUpTwists: [
      {
        question: 'How do you handle duplicate input numbers without generating duplicate subsets?',
        invariantShift: 'Sort the array first and skip same-level duplicates via `if (i > start && nums[i] === nums[i - 1]) continue`.',
        complexityImpact: 'Same O(N · 2^N) worst case, zero extra HashSet overhead.',
      },
      {
        question: 'How do you optimize N-Queens conflict checks from O(N) to O(1)?',
        invariantShift: 'Use 3 integer bitmasks (cols, diag1, diag2) to test & toggle valid positions in single CPU bit instructions.',
        complexityImpact: 'O(N!) with ~10× faster constant factor.',
      },
    ],
  },
  'dynamic-programming': {
    algorithmId: 'dynamic-programming',
    simpleAnalogy:
      'Writing down answers to math problems on sticky notes so whenever the exact same subproblem appears again, you read the note in O(1) instead of redoing the work.',
    interviewScript30s:
      '"I follow SRTBOT: define dp[state] in one exact sentence, derive the recurrence and base cases, verify evaluation order, then compress 2D space to 1D rolling arrays if only the previous row is needed."',
    chooseWhen: 'Counting ways, min/max optimization, or decision problems with overlapping subproblems and optimal substructure.',
    avoidWhen: 'Asked to print ALL raw subsets/paths (Backtracking) or when a simple Greedy exchange proof works.',
    followUpTwists: [
      {
        question: 'When compressing 0/1 Knapsack to 1D, why MUST capacity iterate backwards?',
        invariantShift: 'Backward `w = W..wt[i]` ensures `dp[w - wt[i]]` still holds the previous row (item used <= 1 time); forward iteration allows unbounded reuse.',
        complexityImpact: 'Space drops from O(N · W) to O(W).',
      },
      {
        question: 'How do you optimize Longest Increasing Subsequence from O(N²) to O(N log N)?',
        invariantShift: 'Maintain `tails[len]` storing the smallest ending value of an increasing subsequence of length `len`, updated via Binary Search.',
        complexityImpact: 'Time drops from O(N²) to O(N log N).',
      },
    ],
  },
  'merge-sort-divide-conquer': {
    algorithmId: 'merge-sort-divide-conquer',
    simpleAnalogy:
      'Splitting a shuffled stack of exams in half repeatedly until each pile has 1 paper, then neatly zipping pairs of sorted piles together while counting out-of-order pairs for free.',
    interviewScript30s:
      '"Merge Sort guarantees worst-case O(N log N) and stability via T(N) = 2T(N/2) + O(N), while QuickSort gives O(1) extra space in practice when using randomized 3-way partitioning."',
    chooseWhen: 'Linked-list sorting, guaranteed O(N log N) stability, counting inversions / reverse pairs.',
    avoidWhen: 'Keys are bounded integers [0..K] where Counting/Radix/Cyclic Sort runs in O(N).',
    followUpTwists: [
      {
        question: 'Why is Merge Sort preferred over QuickSort for sorting a Linked List (#148)?',
        invariantShift: 'Linked lists lack O(1) random access and Merge Sort splits via slow/fast + merges in O(1) pointer rewiring (bottom-up Merge Sort hits O(1) space).',
        complexityImpact: 'O(N log N) time, O(1) auxiliary space (bottom-up).',
      },
      {
        question: 'How do you prevent QuickSort from degrading to O(N²) on arrays with many duplicates?',
        invariantShift: 'Use Randomized Pivot + 3-Way Dutch National Flag partitioning (`< pivot`, `== pivot`, `> pivot`).',
        complexityImpact: 'O(N) on all-equal arrays, O(N log N) expected.',
      },
    ],
  },
  'greedy-algorithms': {
    algorithmId: 'greedy-algorithms',
    simpleAnalogy:
      'Packing maximum meetings into one room by always picking whichever meeting ends soonest—leaving the largest possible unbooked afternoon for everything else.',
    interviewScript30s:
      '"By sorting intervals by end time (or tracking the farthest reach frontier), an exchange argument proves the greedy choice can never do worse than any optimal schedule, solving it in O(N log N) or O(N)."',
    chooseWhen: 'Interval merging/scheduling, Jump Game, Gas Station, Huffman coding, Kruskal/Prim MST.',
    avoidWhen: 'A tiny 3-item counterexample disproves greedy (e.g., Coin Change [1, 3, 4] for target 6 -> use DP).',
    followUpTwists: [
      {
        question: 'How do you prove to an interviewer that Greedy is actually optimal here?',
        invariantShift: 'State a 2-sentence Exchange Argument: assume an optimal solution differs at the first step, swap in the greedy choice, and prove feasibility + equal-or-better score.',
        complexityImpact: 'Eliminates DP table overhead (often O(N²) -> O(N log N) or O(N)).',
      },
      {
        question: 'What if intervals also carry different profit weights (Weighted Job Scheduling)?',
        invariantShift: 'Greedy breaks because a short low-pay job can block a huge-pay job; pivot to Sort-by-End + DP + Binary Search.',
        complexityImpact: 'O(N log N) time, O(N) space.',
      },
    ],
  },
  'kadanes-algorithm': {
    algorithmId: 'kadanes-algorithm',
    simpleAnalogy:
      'Walking a road collecting coins and paying tolls: if your pocket balance ever drops below zero, throw away the bad debt behind you and start fresh at the very next block.',
    interviewScript30s:
      '"At each index i, the best subarray ending at i either extends the prior subarray or starts fresh at nums[i]. Keeping just `cur = max(x, cur + x)` solves Maximum Subarray in O(N) time and O(1) space."',
    chooseWhen: 'Maximum contiguous subarray sum, Best Time to Buy/Sell Stock (difference form), 2D max submatrix reduction.',
    avoidWhen: 'Subarray length must be <= K or >= K (use Prefix Sums + Monotonic Deque).',
    followUpTwists: [
      {
        question: 'What if the array is CIRCULAR (Maximum Sum Circular Subarray #918)?',
        invariantShift: 'Answer is `max(normalMaxKadane, totalSum - minSubarrayKadane)`—guarding the all-negative edge case where `normalMax < 0`.',
        complexityImpact: 'Still O(N) time, O(1) space.',
      },
      {
        question: 'What if we want Maximum PRODUCT Subarray (#152) instead of sum?',
        invariantShift: 'A negative number flips the worst minimum product into the best maximum; track BOTH `curMax` and `curMin` at every step.',
        complexityImpact: 'O(N) time, O(1) space.',
      },
    ],
  },
  'cyclic-sort': {
    algorithmId: 'cyclic-sort',
    simpleAnalogy:
      'Sorting numbered mailboxes 1 to N: whenever mailbox #3 holds letter #5, swap letter #5 directly into mailbox #5 until every letter sits in its matching box.',
    interviewScript30s:
      '"Since valid values lie in [1..N], each swap places at least one number into its final index `x - 1`. Total swaps never exceed N, giving O(N) time and strictly O(1) space."',
    chooseWhen: 'Missing Number, Find All Duplicates, First Missing Positive with values constrained to [0..N] or [1..N].',
    avoidWhen: 'Input array is immutable/read-only (use Floyd Cycle Detection or XOR instead).',
    followUpTwists: [
      {
        question: 'What if numbers can be negative, zero, or larger than N (First Missing Positive #41)?',
        invariantShift: 'Ignore any value outside `[1..N]`, cyclically place valid values into `x - 1`, then return the first index `i` where `nums[i] !== i + 1`.',
        complexityImpact: 'O(N) time, O(1) extra space.',
      },
      {
        question: 'How do you prevent infinite loops when duplicate numbers exist?',
        invariantShift: 'Check `nums[i] !== nums[nums[i] - 1]` before swapping—if the target slot already matches, move on.',
        complexityImpact: 'Guarantees <= N total swaps.',
      },
    ],
  },
  'depth-first-search': {
    algorithmId: 'depth-first-search',
    simpleAnalogy:
      'Walking down one hallway of a maze all the way to the dead end before backing up to the last fork to try the next door.',
    interviewScript30s:
      '"DFS explores each connected component in O(V + E) time and O(V) stack space—ideal for connectivity, tree postorder aggregation, cycle detection, and topological post-order."',
    chooseWhen: 'Connected components, tree subtree summaries, directed 3-color cycle detection, path existence.',
    avoidWhen: 'Finding unweighted shortest paths (use BFS) or deep graphs risking call-stack overflow (use iterative stack).',
    followUpTwists: [
      {
        question: 'How do you detect a cycle in a DIRECTED graph using DFS?',
        invariantShift: 'Use 3 node states: 0 = unvisited, 1 = on active recursion stack (visiting), 2 = finished. Seeing state 1 proves a back-edge cycle.',
        complexityImpact: 'O(V + E) time, O(V) space.',
      },
      {
        question: 'What if the graph has 10^5 nodes in a straight chain causing RecursionError?',
        invariantShift: 'Replace recursion with an explicit heap-allocated stack storing `(node, state)` frames.',
        complexityImpact: 'O(V + E) time, zero call-stack limit risk.',
      },
    ],
  },
  'union-find-dsu': {
    algorithmId: 'union-find-dsu',
    simpleAnalogy:
      'Friend circles merging at a party: each group picks one team captain, and whenever you ask who your captain is, you remember the top captain directly (Path Compression) so future checks are instant.',
    interviewScript30s:
      '"Pairing Path Compression with Union-by-Size merges components and tests connectivity in inverse-Ackermann O(α(N)) ≈ O(1) amortized time—far faster than re-running DFS per edge."',
    chooseWhen: 'Dynamic connectivity, Redundant Connection, Accounts Merge, Kruskal MST, Number of Provinces.',
    avoidWhen: 'Directed graph cycles (use Kahn Topo Sort) or dynamic edge DELETIONS (require reverse-time offline DSU).',
    followUpTwists: [
      {
        question: 'How do you answer connectivity queries when edges are DELETED over time?',
        invariantShift: 'Process queries offline in REVERSE chronological order so deletions turn into standard Union-Find additions.',
        complexityImpact: 'O((E + Q) · α(V)) total time.',
      },
      {
        question: 'How do you handle weighted ratios like Evaluate Division (a / b = 2.0) in DSU?',
        invariantShift: 'Store a `weight[x]` multiplier relative to `parent[x]` and multiply weights during path compression.',
        complexityImpact: 'O(α(V)) per equation and query.',
      },
    ],
  },
  'bit-manipulation': {
    algorithmId: 'bit-manipulation',
    simpleAnalogy:
      'Toggling a compact row of 32 light switches inside one integer: flipping any switch twice cancels it out completely, and `n & (n - 1)` switches off only the rightmost lit bulb.',
    interviewScript30s:
      '"XOR cancels duplicate pairs cleanly via x ^ x = 0 in O(N) time and O(1) memory, while bitmasks pack small sets (N <= 20) into single integer keys."',
    chooseWhen: 'Single/Missing number in O(1) space, popcount, power-of-2 checks, or subset masks for N <= 20.',
    avoidWhen: 'Set size exceeds 30 bits in JS (use BigInt or Set/Map).',
    followUpTwists: [
      {
        question: 'What if EVERY number appears 3 times except one unique number (Single Number II)?',
        invariantShift: 'Sum each of the 32 bit columns modulo 3 (or track two bitmasks `ones` & `twos` as a mod-3 state machine).',
        complexityImpact: 'O(N) time, O(1) space.',
      },
      {
        question: 'What if TWO numbers appear once and all others appear twice (Single Number III)?',
        invariantShift: 'Compute `xorAll = a ^ b`, isolate any differing bit `mask = xorAll & -xorAll`, and XOR each partition separately.',
        complexityImpact: 'O(N) time, O(1) space.',
      },
    ],
  },
  'kmp-rabin-karp': {
    algorithmId: 'kmp-rabin-karp',
    simpleAnalogy:
      'KMP remembers how much of your search word already matches the start of itself so you never re-read text backward; Rabin-Karp turns every window into a numeric fingerprint you update in O(1).',
    interviewScript30s:
      '"KMP builds the LPS border table in O(M) so the text cursor never rewinds—guaranteeing O(N + M) worst-case matching. For multi-pattern or duplicate-length checks, Rabin-Karp rolls a polynomial hash in O(1) per shift."',
    chooseWhen: 'Guaranteed worst-case O(N + M) substring search, periodic strings, Longest Duplicate Substring.',
    avoidWhen: 'Typo-tolerant fuzzy matching is required (use N-Gram Inverted Index + Damerau-Levenshtein).',
    followUpTwists: [
      {
        question: 'How do you eliminate hash collision hacks against Rabin-Karp?',
        invariantShift: 'Use Double Hashing with two large coprime moduli (e.g., 10^9+7 and 10^9+9) and verify exact string match on hit.',
        complexityImpact: 'Collision probability drops to ~10^-18 while staying O(N).',
      },
      {
        question: 'How does KMP find the Shortest Palindrome by prepending characters (#214)?',
        invariantShift: 'Compute LPS of `s + "#" + reverse(s)`: `lps[last]` gives the longest palindromic prefix in O(N).',
        complexityImpact: 'O(N) time, O(N) space.',
      },
    ],
  },
  'bellman-ford': {
    algorithmId: 'bellman-ford',
    simpleAnalogy:
      'Passing gossip across a town in waves: after 1 wave everyone 1 hop away knows the cheapest deal; after V - 1 waves every shortest path is settled—if wave V still improves anything, a negative-cost infinite money loop exists.',
    interviewScript30s:
      '"Because negative edge weights break Dijkstra’s greedy assumption, I relax all E edges across V - 1 rounds in O(V · E). A V-th pass cleanly detects negative cycles, and K + 1 snapshot rounds solve K-stop flight limits."',
    chooseWhen: 'Graphs with negative edge weights, negative-cycle detection, or shortest paths capped at <= K edges.',
    avoidWhen: 'All weights are non-negative on large sparse graphs (Dijkstra is dramatically faster).',
    followUpTwists: [
      {
        question: 'Why must Cheapest Flights Within K Stops copy `prev = [...dist]` every round?',
        invariantShift: 'In-place updates allow a relaxed edge to chain multiple hops inside the same round, violating the <= K stops cap.',
        complexityImpact: 'O(K · E) time, O(V) space.',
      },
      {
        question: 'How can you terminate Bellman-Ford early in practice?',
        invariantShift: 'Track `changed = false` each round; if zero edges relax during a full pass, break immediately.',
        complexityImpact: 'Often finishes in O(d · E) where d is shortest-path hop depth.',
      },
    ],
  },
  'floyd-warshall': {
    algorithmId: 'floyd-warshall',
    simpleAnalogy:
      'Checking every city pair on a flight map by asking one layover city `k` at a time: "Is flying i -> k -> j cheaper than my current best i -> j?"',
    interviewScript30s:
      '"With V <= 400 and all-pairs distance queries, Floyd-Warshall runs a 3-loop DP (`k` outermost!) computing all shortest paths in O(V³) time and O(V²) space, naturally supporting negative edges."',
    chooseWhen: 'Dense small graphs (V <= 400) needing all-pairs shortest paths or transitive closure.',
    avoidWhen: 'V > 1,000 (O(V³) = 10^9 ops -> run Dijkstra from each source or Johnson’s algorithm).',
    followUpTwists: [
      {
        question: 'Why MUST the intermediate node loop `k` be the OUTERMOST loop?',
        invariantShift: 'DP state `dist[k][i][j]` means shortest path using intermediates in `{0..k}`; placing `k` inside uses uncomputed subpaths.',
        complexityImpact: 'Correctness invariant—same O(V³) time, O(V²) space.',
      },
      {
        question: 'How do you detect a negative cycle after Floyd-Warshall finishes?',
        invariantShift: 'Check if any diagonal entry `dist[i][i] < 0`.',
        complexityImpact: 'O(V) post-check.',
      },
    ],
  },
  'tarjan-kosaraju-scc': {
    algorithmId: 'tarjan-kosaraju-scc',
    simpleAnalogy:
      'Finding tight-knit loops on a one-way road map (Strongly Connected Components) and fragile single bridges whose removal disconnects two neighborhoods.',
    interviewScript30s:
      '"Tarjan tracks discovery time `tin[u]` and lowest reachable ancestor `low[u]` in one O(V + E) DFS pass: an undirected edge (u, v) is a critical bridge iff `low[v] > tin[u]`."',
    chooseWhen: 'Critical Connections / Bridges, Articulation Points, collapsing directed graphs into condensation DAGs, 2-SAT.',
    avoidWhen: 'Graph is an undirected tree or simple connected-component count (plain DFS or DSU is simpler).',
    followUpTwists: [
      {
        question: 'What is the exact difference between finding Bridges vs Articulation Points?',
        invariantShift: 'Bridge tests strict `low[v] > tin[u]`; Articulation Point tests `low[v] >= tin[u]` (plus special rule for DFS root needing >= 2 children).',
        complexityImpact: 'Still O(V + E) single DFS pass.',
      },
      {
        question: 'In Tarjan SCC on directed graphs, why must we check `onStack[v]` for back-edges?',
        invariantShift: 'Cross-edges to already-finished SCCs are NOT part of the current cycle and must not lower `low[u]`.',
        complexityImpact: 'O(V + E) time, O(V) space.',
      },
    ],
  },
  'a-star-search': {
    algorithmId: 'a-star-search',
    simpleAnalogy:
      'Like Dijkstra’s GPS, except you also glance at a compass pointing straight toward your destination so you explore roads heading toward the goal instead of radiating blindly backward.',
    interviewScript30s:
      '"A* ranks states by f(n) = g(n) + h(n). As long as heuristic h(n) is admissible (never overestimates true remaining cost, like Manhattan distance on a 4-dir grid), A* stays 100% optimal while pruning far more states than Dijkstra."',
    chooseWhen: 'Single-pair shortest path on grids, maps, or puzzles (Sliding Puzzle, 8-Puzzle) with a strong geometric heuristic.',
    avoidWhen: 'No admissible heuristic exists or all-targets shortest distances are needed (use Dijkstra).',
    followUpTwists: [
      {
        question: 'What happens if heuristic h(n) slightly OVERESTIMATES the remaining distance?',
        invariantShift: 'A* becomes Weighted A*—faster in practice, but no longer guaranteed to return the exact shortest path.',
        complexityImpact: 'Trades optimality guarantee for fewer expanded states.',
      },
      {
        question: 'Which heuristic is admissible on an 8-directional grid (diagonals allowed)?',
        invariantShift: 'Manhattan overestimates diagonals! Use Chebyshev distance `max(|dx|, |dy|)` (or Octile distance for √2 diagonals).',
        complexityImpact: 'Preserves exact optimality.',
      },
    ],
  },
  'max-flow-edmonds-karp': {
    algorithmId: 'max-flow-edmonds-karp',
    simpleAnalogy:
      'Pumping maximum water through a city pipe network: repeatedly find the shortest pipe path with leftover room, push as much water as the narrowest pipe allows, and add a "reverse refund pipe" so later paths can reroute flow smarter.',
    interviewScript30s:
      '"Edmonds-Karp finds shortest augmenting paths via BFS over a residual graph with reverse edges, bounding total augmentations to O(V · E) and total runtime to O(V · E²). It also solves Max Bipartite Matching and Min-Cut."',
    chooseWhen: 'Max flow, Min-Cut (Max-Flow Min-Cut Theorem), Maximum Bipartite Matching, edge-disjoint paths.',
    avoidWhen: 'Standard shortest path or MST problems (use Dijkstra/Kruskal).',
    followUpTwists: [
      {
        question: 'How do you extract the exact Minimum Cut edge set after Max Flow finishes?',
        invariantShift: 'Run BFS from source S in the final residual graph: every original edge going from a reachable node to an unreachable node belongs to the Min-Cut.',
        complexityImpact: 'O(V + E) post-pass.',
      },
      {
        question: 'How do you scale Max Flow when E is large and O(V · E²) is too slow?',
        invariantShift: 'Upgrade Edmonds-Karp to Dinic’s Algorithm (BFS level graph + DFS blocking flows with current-arc pointer).',
        complexityImpact: 'O(V² · E) general, O(E √V) for bipartite matching.',
      },
    ],
  },
  'prims-mst': {
    algorithmId: 'prims-mst',
    simpleAnalogy:
      'Growing a fiber-optic cable network outward from headquarters: at every step, plug in whichever unconnected building has the cheapest single cable to your already-wired cluster.',
    interviewScript30s:
      '"Prim’s grows one MST component greedily using a Min-Heap of crossing edges in O(E log V), and on complete dense graphs (like Min Cost to Connect All Points) an array-based Prim’s avoids building O(V²) edges to run in O(V²) time and O(V) space."',
    chooseWhen: 'Dense Minimum Spanning Tree graphs (e.g., all-pairs Manhattan points where E = V²).',
    avoidWhen: 'Edges are already given as a sparse sorted edge list (Kruskal + Union-Find is cleaner).',
    followUpTwists: [
      {
        question: 'Why does Prim’s beat Kruskal on Min Cost to Connect All Points (#1584, N = 1,000)?',
        invariantShift: 'Kruskal allocates & sorts N²/2 = 500k edges; array-based Prim’s tracks `minDist[v]` on the fly without storing the full graph.',
        complexityImpact: 'O(V²) time and O(V) space instead of O(V² log V) / O(V²).',
      },
      {
        question: 'What if the graph is disconnected?',
        invariantShift: 'Track `visitedCount`; if the heap empties before reaching V nodes, no spanning tree exists (or restart per component for a Minimum Spanning Forest).',
        complexityImpact: 'Same O(E log V).',
      },
    ],
  },
  'segment-tree-lazy': {
    algorithmId: 'segment-tree-lazy',
    simpleAnalogy:
      'A manager delegating a "$100 bonus to everyone in Engineering": instead of emailing 500 engineers right now, put a sticky note "+$100" on the Engineering folder and only pass it down to sub-teams when someone inspects them.',
    interviewScript30s:
      '"Lazy Propagation defers range-update propagation via pending tags pushed down only on partial overlap, keeping BOTH range updates and range queries strictly O(log N)."',
    chooseWhen: 'Online Range Add / Range Assign combined with Range Sum / Min / Max queries.',
    avoidWhen: 'Only point updates + prefix sums are needed (Fenwick BIT is 10 lines and faster).',
    followUpTwists: [
      {
        question: 'What happens if you combine Range-Assign AND Range-Add updates?',
        invariantShift: 'Assign overrides any pending Add tag on the same node, whereas Add increments an existing Assign tag—define tag composition order carefully.',
        complexityImpact: 'Still O(log N) per operation.',
      },
      {
        question: 'What if coordinates span [0..10^9] with sparse updates (My Calendar III)?',
        invariantShift: 'Use a Dynamic (Implicit) Segment Tree creating child nodes on demand instead of pre-allocating 4N.',
        complexityImpact: 'O(Q log(10^9)) time and space.',
      },
    ],
  },
  'fenwick-tree-bit': {
    algorithmId: 'fenwick-tree-bit',
    simpleAnalogy:
      'A super-compact accounting ladder where each rung stores a power-of-two chunk of numbers: climbing up (`i += i & -i`) updates your total in ~17 steps, and stepping down (`i -= i & -i`) sums any prefix in ~17 steps.',
    interviewScript30s:
      '"For invertible operations like prefix sums or inversion counting with online point updates, a 1-indexed Fenwick Tree uses just 10 lines of code and N space with tiny constant-factor O(log N) updates and queries."',
    chooseWhen: 'Dynamic prefix sums, Count Smaller After Self, 2D mutable range sums, online order statistics.',
    avoidWhen: 'Need Range Min/Max Query over arbitrary [L..R] (min/max has no subtraction inverse -> use Segment Tree).',
    followUpTwists: [
      {
        question: 'How do you find the K-th smallest element in a Fenwick frequency tree in O(log N) instead of O(log²N)?',
        invariantShift: 'Binary Lifting over BIT: step downward by powers of 2 (`bitMask = 1 << 17 .. 1`) accumulating prefix sums directly.',
        complexityImpact: 'Drops from O(log²N) binary search to single O(log N) lift.',
      },
      {
        question: 'Can a Fenwick Tree handle Range Add + Point Query?',
        invariantShift: 'Store a Difference Array inside the BIT: `add(L, +v); add(R + 1, -v);` and read point `i` via `prefix(i)`.',
        complexityImpact: 'O(log N) range add, O(log N) point query.',
      },
    ],
  },
  'binary-lifting-lca': {
    algorithmId: 'binary-lifting-lca',
    simpleAnalogy:
      'Giving every node in a family tree express-elevator tickets for 1, 2, 4, 8, and 16 floors up—so jumping up 13 ancestors takes just 3 express rides (8 + 4 + 1) instead of 13 stairs.',
    interviewScript30s:
      '"Precomputing `up[u][k]` (the 2^k-th ancestor of u) in O(N log N) answers both K-th Ancestor and Lowest Common Ancestor queries in O(log N) time."',
    chooseWhen: 'Repeated K-th Ancestor queries, multiple LCA queries on static trees, tree path distance queries.',
    avoidWhen: 'Only a single one-off LCA query is asked (one O(N) DFS uses zero O(N log N) preprocessing).',
    followUpTwists: [
      {
        question: 'How do you answer distance(u, v) on a weighted tree in O(log N)?',
        invariantShift: 'Precompute `rootDist[x]` via DFS, then `dist(u, v) = rootDist[u] + rootDist[v] - 2 * rootDist[lca(u, v)]`.',
        complexityImpact: 'O(N log N) build, O(log N) per query.',
      },
      {
        question: 'How do you query Maximum Edge Weight along the tree path from u to v?',
        invariantShift: 'Maintain a parallel table `maxEdge[u][k]` alongside `up[u][k]` and aggregate maxima while lifting to LCA.',
        complexityImpact: 'O(N log N) build, O(log N) per query.',
      },
    ],
  },
  'heavy-light-decomposition': {
    algorithmId: 'heavy-light-decomposition',
    simpleAnalogy:
      'Turning a branching tree into express highways (Heavy chains) connected by occasional local exits (Light edges): any trip between two nodes crosses at most log₂(N) highways, letting a Segment Tree answer path queries fast.',
    interviewScript30s:
      '"HLD decomposes any rooted tree so every root-to-node path crosses O(log N) heavy chains mapped contiguously onto a Segment Tree—supporting dynamic node updates and path queries in O(log²N)."',
    chooseWhen: 'Dynamic point/path updates combined with path sum/max/min queries on trees (N <= 10^5).',
    avoidWhen: 'Tree weights are completely static (Binary Lifting or Euler Tour + Fenwick is far simpler).',
    followUpTwists: [
      {
        question: 'How do you handle EDGE weights instead of NODE weights in HLD?',
        invariantShift: 'Push each edge’s weight down onto its deeper child node, and exclude the LCA node itself from the final range query.',
        complexityImpact: 'Same O(log²N) query, O(log N) update.',
      },
      {
        question: 'How does HLD also support full Subtree queries simultaneously?',
        invariantShift: 'Because HLD assigns DFS entry times `pos[u]`, node u’s entire subtree occupies contiguous range `[pos[u] .. pos[u] + size[u] - 1]`.',
        complexityImpact: 'O(log N) subtree query on the same Segment Tree.',
      },
    ],
  },
  'mos-algorithm': {
    algorithmId: 'mos-algorithm',
    simpleAnalogy:
      'A warehouse picker with 10,000 range orders: instead of running wildly back and forth across aisles, group orders by starting aisle block of size √N and sort right endpoints smoothly so the cart barely moves.',
    interviewScript30s:
      '"When offline range queries lack an associative merge (like counting distinct elements or mode frequency), sorting queries by `(L / √N, R)` bounds pointer slides to O((N + Q) √N)."',
    chooseWhen: 'Offline static range queries with non-mergeable aggregates (distinct count, frequency-squared) where N, Q <= 10^5.',
    avoidWhen: 'Queries are online or require O(log N) worst-case latency.',
    followUpTwists: [
      {
        question: 'How do you cut Mo’s constant factor nearly in half?',
        invariantShift: 'Use Hilbert Curve ordering or Alternating Parity (even blocks sort R ascending, odd blocks sort R descending) so R sweeps like a snake.',
        complexityImpact: 'Same O((N + Q)√N), ~35–45% fewer pointer steps.',
      },
      {
        question: 'Can Mo’s Algorithm support point updates?',
        invariantShift: 'Add a 3rd time dimension `t` with block size `N^(2/3)` (Mo’s with Updates).',
        complexityImpact: 'O(Q · N^(2/3)) time.',
      },
    ],
  },
  'z-algorithm': {
    algorithmId: 'z-algorithm',
    simpleAnalogy:
      'Measuring how far every suffix matches the start of the string while remembering the furthest "already-copied mirror window" [L..R] so you copy known prefix lengths in O(1) before scanning new chars.',
    interviewScript30s:
      '"Z-Algorithm computes for every index i the longest common prefix with s[0..] in strict O(N) time by reusing matches inside the rightmost Z-box [L..R]. Concatenating `pat + "$" + text` solves pattern search without LPS fallback confusion."',
    chooseWhen: 'Linear pattern search, Longest Prefix-Suffix, counting pattern occurrences, Sum of Scores of Built Strings.',
    avoidWhen: 'Streaming character-by-character text where you cannot concatenate pattern + text upfront (use KMP).',
    followUpTwists: [
      {
        question: 'Why is `r` guaranteed to increase at most N times across the entire algorithm?',
        invariantShift: 'Every character comparison inside the `while` loop strictly advances the rightmost boundary `r`, bounding total comparisons to <= 2N.',
        complexityImpact: 'Strict O(N) worst-case time.',
      },
      {
        question: 'How do you solve Sum of Scores of Built Strings (#2223) with Z-Algorithm?',
        invariantShift: 'Each suffix score is literally `Z[i]`, so the answer is simply `n + sum(Z)`!',
        complexityImpact: 'O(N) time, O(N) space.',
      },
    ],
  },
  'manachers-algorithm': {
    algorithmId: 'manachers-algorithm',
    simpleAnalogy:
      'Standing inside a giant hall of mirrors: if you already know a huge palindrome centered at C, any center on the right half mirrors the exact palindrome radius of its twin on the left half—skipping redundant expansion.',
    interviewScript30s:
      '"Inserting `#` separators unifies odd and even palindromes, and mirroring radii inside the rightmost palindrome `[L..R]` computes every palindrome center radius in strict O(N) instead of O(N²)."',
    chooseWhen: 'Longest Palindromic Substring or Palindromic Substrings count when N = 10^5 requires O(N).',
    avoidWhen: 'N <= 1,000 in a short interview where Expand-Around-Center O(N²) / O(1) is quicker to code bug-free.',
    followUpTwists: [
      {
        question: 'How do you count total palindromic substrings from Manacher’s radius array P[]?',
        invariantShift: 'Each transformed radius `P[i]` contributes `Math.floor((P[i] + 1) / 2)` original palindromes.',
        complexityImpact: 'O(N) time, O(N) space.',
      },
      {
        question: 'Why do we add sentinel characters `^` and `$` at both ends of the transformed string?',
        invariantShift: 'Distinct sentinels stop the inner expansion loop cleanly without writing array bounds checks on every iteration.',
        complexityImpact: 'Cleaner loop and zero out-of-bounds bugs.',
      },
    ],
  },
  'aho-corasick': {
    algorithmId: 'aho-corasick',
    simpleAnalogy:
      'Think of KMP upgraded for an ENTIRE dictionary at once: build one Trie of all banned/target words, then wire "failure shortcut links" so scanning a document once catches every matching keyword simultaneously.',
    interviewScript30s:
      '"Running KMP separately for K patterns costs O(K·N). Aho-Corasick builds a Trie + BFS failure automaton in O(Σ|pat|), then scans text ONCE in O(N + matches) to find all patterns simultaneously."',
    chooseWhen: 'Multi-pattern content moderation, Stream of Characters (#1032), DNA motif scanning over large texts.',
    avoidWhen: 'Only a single pattern is searched (plain KMP/Z is far simpler).',
    followUpTwists: [
      {
        question: 'How do you avoid missing shorter suffix matches ending at the same text index?',
        invariantShift: 'Maintain compressed `output/dictionary links` chaining each node to its nearest failure-link ancestor that is a word end.',
        complexityImpact: 'O(N + totalMatches) guaranteed.',
      },
      {
        question: 'How does Stream of Characters (#1032) solve online suffix queries simply?',
        invariantShift: 'Insert words REVERSED into a Trie (or run Aho-Corasick forward) to check incoming stream characters in O(1) per char.',
        complexityImpact: 'O(1) per streamed character with Aho-Corasick automaton.',
      },
    ],
  },
  'suffix-array-lcp': {
    algorithmId: 'suffix-array-lcp',
    simpleAnalogy:
      'Sorting every ending slice of a book alphabetically in an index: once sorted, any repeated phrase appears side-by-side in the index, and Kasai’s LCP array measures how many letters neighbors share.',
    interviewScript30s:
      '"Prefix-doubling sorts all N suffixes in O(N log N) (or O(N log²N)), and Kasai’s algorithm computes adjacent Longest Common Prefixes in O(N)—solving distinct substring counts and longest repeated substrings cleanly."',
    chooseWhen: 'Count Distinct Substrings, Longest Common Substring across K strings, lexicographical substring queries.',
    avoidWhen: 'Simple single-pattern search (KMP/Z is simpler and O(N)).',
    followUpTwists: [
      {
        question: 'How do you count the exact number of DISTINCT substrings of length-N string s?',
        invariantShift: 'Total substrings minus overlapping prefixes: `N*(N+1)/2 - sum(LCP)`.',
        complexityImpact: 'O(N log N) build, O(N) sum.',
      },
      {
        question: 'How do you find Longest Common Substring of two strings A and B?',
        invariantShift: 'Build Suffix Array + LCP on `A + "#" + B` and take max `LCP[i]` across adjacent suffixes belonging to different strings.',
        complexityImpact: 'O((N + M) log(N + M)) time.',
      },
    ],
  },
  'bitmask-dp': {
    algorithmId: 'bitmask-dp',
    simpleAnalogy:
      'Packing a checklist of up to 20 visited cities into a single integer barcode so a DP table can instantly look up "cheapest tour covering this exact subset ending at city u."',
    interviewScript30s:
      '"When N <= 20 and permutations explode to O(N!), noticing order inside the visited set doesn’t matter collapses N! states into 2^N bitmask states—solving TSP or assignment in O(N² · 2^N)."',
    chooseWhen: 'N <= 20 subset partitioning, Traveling Salesperson, Shortest Path Visiting All Nodes, assignment matching.',
    avoidWhen: 'N > 22 (2^N exceeds memory/time budgets).',
    followUpTwists: [
      {
        question: 'How do you iterate over all non-empty SUBMASKS of a given bitmask in O(3^N) total?',
        invariantShift: 'Use `for (let sub = mask; sub > 0; sub = (sub - 1) & mask)`—proven by binomial theorem to sum to 3^N across all masks.',
        complexityImpact: 'O(3^N) instead of O(4^N).',
      },
      {
        question: 'When can you drop the `lastNode` dimension in Bitmask DP?',
        invariantShift: 'In task assignment (pairing N workers to N jobs), worker index equals `popcount(mask)`, shrinking state from `N · 2^N` to `2^N`.',
        complexityImpact: 'O(N · 2^N) time, O(2^N) space.',
      },
    ],
  },
  'digit-dp': {
    algorithmId: 'digit-dp',
    simpleAnalogy:
      'Building a valid number one digit at a time from left to right like a combination lock: a single `tight` flag tells you whether you are still hugged against the upper limit R or free to pick any digit 0–9.',
    interviewScript30s:
      '"To count numbers in [L, R] up to 10^18 satisfying digit constraints, I solve `count(R) - count(L - 1)` via memoized recursion over `(pos, tight, leadingZero, state)` in O(digits × states)."',
    chooseWhen: 'Counting integers up to 10^18 with digit-sum, no-repeated-digits, or forbidden-digit constraints.',
    avoidWhen: 'Range N <= 10^6 where a direct linear scan or sieve is simpler.',
    followUpTwists: [
      {
        question: 'Why do we need a `leadingZero` flag in problems like "No Repeated Digits"?',
        invariantShift: 'Leading zeros like `005` are padding, NOT actual digit `0`s—don’t mark digit 0 as used until the first non-zero digit is placed.',
        complexityImpact: 'Adds only a ×2 boolean state factor.',
      },
      {
        question: 'Why memoize ONLY when `tight === false` (or include `tight` in the key)?',
        invariantShift: 'When `tight === false`, the remaining suffix is unconstrained and safely reusable across both `count(R)` and `count(L-1)`.',
        complexityImpact: 'Cuts cache memory and enables cross-query reuse.',
      },
    ],
  },
  'dp-on-trees-rerooting': {
    algorithmId: 'dp-on-trees-rerooting',
    simpleAnalogy:
      'First compute total commute distance assuming HQ sits at Root 0; then slide HQ one edge to neighbor `v`—every city inside `v`’s subtree gets 1 mile closer and every city outside gets 1 mile farther, updating in O(1)!',
    interviewScript30s:
      '"Running DFS from every root takes O(N²). Rerooting DP computes subtree answers for root 0 in Pass 1, then shifts the root down each edge in O(1) during Pass 2—answering all N roots in O(N)."',
    chooseWhen: 'Sum of Distances in Tree (#834), Minimum Height Trees, or any metric asked for EVERY node as root.',
    avoidWhen: 'Metric is only requested for a single fixed root (standard 1-pass Postorder Tree DP suffices).',
    followUpTwists: [
      {
        question: 'What if the combine operation is MAX (not SUM) so you cannot subtract a child’s contribution?',
        invariantShift: 'Precompute Prefix Max and Suffix Max over each node’s children list (or track top-2 deepest branches) to exclude child `v` in O(1).',
        complexityImpact: 'Still O(N) total time.',
      },
      {
        question: 'What is the exact rerooting transition for Sum of Distances in Tree?',
        invariantShift: '`ans[child] = ans[parent] - subSize[child] + (N - subSize[child])`.',
        complexityImpact: 'O(1) per edge -> O(N) total.',
      },
    ],
  },
  'convex-hull-trick': {
    algorithmId: 'convex-hull-trick',
    simpleAnalogy:
      'Choosing the cheapest cell-phone plan (`cost = rate * minutes + baseFee`) across thousands of plans: draw all lines on a graph and keep ONLY the lower envelope—dominated plans that are never cheapest at any usage disappear.',
    interviewScript30s:
      '"When a DP recurrence takes the form `dp[i] = min_j (m_j · x_i + c_j)`, maintaining the lower convex hull of lines cuts O(N²) transitions to O(N) (monotonic slopes/queries via Deque) or O(N log N) (Li Chao Tree)."',
    chooseWhen: '1D DP transitions of linear form `a[j] * b[i] + c[j]` with N = 10^5 where O(N²) TLEs.',
    avoidWhen: 'N <= 3,000 where plain O(N²) DP passes easily with less code complexity.',
    followUpTwists: [
      {
        question: 'What if slopes `m_j` or query points `x_i` are NOT monotonic?',
        invariantShift: 'Replace the deque CHT with a Li Chao Segment Tree or Dynamic Line Container (balanced BST).',
        complexityImpact: 'O(N log N) time for arbitrary insertion & query order.',
      },
      {
        question: 'How do you avoid floating-point precision errors when checking line intersections?',
        invariantShift: 'Cross-multiply with 64-bit BigInt: `(c2 - c1) * (m1 - m3) >= (c3 - c1) * (m1 - m2)` (mind denominator signs).',
        complexityImpact: 'Exact integer arithmetic with zero precision drift.',
      },
    ],
  },
  'sieve-of-eratosthenes': {
    algorithmId: 'sieve-of-eratosthenes',
    simpleAnalogy:
      'Cross off multiples of 2, then 3, then 5 on a numbered grid starting from p²—because any smaller multiple like 5×3 was already crossed off when you processed 3.',
    interviewScript30s:
      '"Marking multiples starting at `p * p` finds all primes up to N in O(N log log N) time and O(N) space—nearly linear for N = 10^7."',
    chooseWhen: 'Count Primes, fast prime factorization via Smallest Prime Factor (SPF) array, prime queries up to 10^7.',
    avoidWhen: 'Testing primality of a single huge 64-bit number (use Miller-Rabin or O(√N) trial division).',
    followUpTwists: [
      {
        question: 'How do you factorize Q = 10^5 numbers up to 10^6 in O(log x) per query?',
        invariantShift: 'Modify the sieve to record `spf[m] = p` (Smallest Prime Factor), then divide `x /= spf[x]` repeatedly.',
        complexityImpact: 'O(N log log N) build, O(log x) per factorization.',
      },
      {
        question: 'How do you find primes in `[L, R]` when `R = 10^12` and `R - L <= 10^6`?',
        invariantShift: 'Use a Segmented Sieve: sieve base primes up to √R = 10^6, then mark their multiples inside the shifted `[0..R-L]` window.',
        complexityImpact: 'O((R - L + √R) log log R) time, O(R - L) space.',
      },
    ],
  },
  'euclidean-extended-gcd': {
    algorithmId: 'euclidean-extended-gcd',
    simpleAnalogy:
      'Tiling a rectangular floor with the largest possible square tiles: cut off squares of the shorter side repeatedly until zero strip remains—that final square size is the GCD.',
    interviewScript30s:
      '"Euclidean GCD shrinks arguments logarithmically via `gcd(a, b) = gcd(b, a % b)` in O(log min(a, b)), while Extended GCD finds Bézout coefficients `ax + by = gcd` for modular inverses even when the modulus is composite."',
    chooseWhen: 'Simplifying fractions, Water & Jug reachability (`target % gcd(x, y) === 0`), LCM, modular inverses.',
    avoidWhen: 'Modulus is prime and Fermat’s Little Theorem (`a^(p-2) mod p`) is already available via fast pow.',
    followUpTwists: [
      {
        question: 'How do you avoid integer overflow when computing `lcm(a, b)`?',
        invariantShift: 'Divide BEFORE multiplying: `(a / gcd(a, b)) * b`.',
        complexityImpact: 'O(log min(a, b)) time, prevents intermediate overflow.',
      },
      {
        question: 'When does a modular multiplicative inverse of `a` modulo `m` exist?',
        invariantShift: 'If and only if `gcd(a, m) === 1`; Extended GCD returns `((x % m) + m) % m`.',
        complexityImpact: 'O(log m) time.',
      },
    ],
  },
  'modular-exponentiation': {
    algorithmId: 'modular-exponentiation',
    simpleAnalogy:
      'Instead of multiplying 2 by itself 1,000 times, keep squaring it (2, 4, 16, 256...) and only multiply into your result for the 1-bits of the binary exponent—finishing in just 10 steps.',
    interviewScript30s:
      '"Binary squaring inspects each bit of exponent `e` while reducing modulo `M` every multiplication, computing `a^e mod M` in O(log e) time and O(1) space without overflow."',
    chooseWhen: 'Large powers up to 10^18, combinatorics nCr mod 10^9+7 (Fermat inverse), Matrix Exponentiation for O(log N) linear recurrences.',
    avoidWhen: 'Base or modulus exceeds 2^26 in JS Number (use BigInt to prevent 53-bit float precision loss).',
    followUpTwists: [
      {
        question: 'How do you compute the 10^18-th Fibonacci number mod 10^9+7?',
        invariantShift: 'Apply the exact same Binary Squaring algorithm to the 2×2 Fibonacci transition matrix `[[1,1],[1,0]]^N`.',
        complexityImpact: 'O(log N) time, O(1) space.',
      },
      {
        question: 'Why must JavaScript use BigInt for `(a * b) % 1_000_000_007`?',
        invariantShift: '`10^9 × 10^9 = 10^18` exceeds `Number.MAX_SAFE_INTEGER` (9×10^15), silently corrupting low bits without BigInt.',
        complexityImpact: 'Exact 64-bit modular arithmetic.',
      },
    ],
  },
  'convex-hull-graham-scan': {
    algorithmId: 'convex-hull-graham-scan',
    simpleAnalogy:
      'Hammer nails into a wooden board at every point and snap a giant rubber band around the outside: Andrew’s Monotone Chain walks left-to-right popping any inward "right turn" nails.',
    interviewScript30s:
      '"Sorting points by `(x, y)` and sweeping lower and upper hulls using 2D cross products pops concave turns in amortized O(N) after O(N log N) sort—avoiding trig angles and floating-point drift."',
    chooseWhen: 'Erect the Fence (#587), outer boundary geometry, farthest pair of points (Rotating Calipers).',
    avoidWhen: 'Points are strictly 1D or simple bounding-box min/max suffices.',
    followUpTwists: [
      {
        question: 'What if the problem asks to INCLUDE collinear points lying along hull edges (Erect the Fence)?',
        invariantShift: 'Pop strictly negative cross products (`cross < 0` instead of `cross <= 0`) and deduplicate vertices when merging upper + lower hulls.',
        complexityImpact: 'Same O(N log N) time.',
      },
      {
        question: 'How do you find the maximum Euclidean distance between any two points in O(N log N)?',
        invariantShift: 'The farthest pair MUST lie on the Convex Hull; sweep opposite antipodal hull vertices via Rotating Calipers in O(N).',
        complexityImpact: 'O(N log N) instead of O(N²) pairwise checks.',
      },
    ],
  },
  'reservoir-sampling': {
    algorithmId: 'reservoir-sampling',
    simpleAnalogy:
      'Picking K raffle winners fairly from an endless parade of people when you do not know how long the parade is: keep the first K, and for the i-th passerby roll an i-sided die—if it lands on 1..K, swap them in.',
    interviewScript30s:
      '"Without knowing stream length N upfront, keeping the first K items and replacing a random slot with probability K / i guarantees every element seen so far has exact probability K / N in O(N) time and O(K) space."',
    chooseWhen: 'Random Pick Index on giant/infinite streams, Linked List Random Node (#382), distributed log sampling.',
    avoidWhen: 'Array is already in memory with known length N (a single `rand(0, N - 1)` runs in O(1)).',
    followUpTwists: [
      {
        question: 'Prove in two lines why every item has exact probability K / N.',
        invariantShift: 'Item i enters with probability K / i, and survives every later step j = i+1..N with probability (j-1)/j; telescoping cancels everything to K / N.',
        complexityImpact: 'O(N) time, O(K) space.',
      },
      {
        question: 'How do you sample from a stream with WEIGHTED probabilities?',
        invariantShift: 'Assign each item key `u^(1 / weight)` (A-Res algorithm) and keep the K largest keys in a size-K Min-Heap.',
        complexityImpact: 'O(N log K) time, O(K) space.',
      },
    ],
  },
  quickselect: {
    algorithmId: 'quickselect',
    simpleAnalogy:
      'Finding the 5th-tallest student in a gym: pick a random height divider, send shorter students left and taller right—then completely ignore whichever side cannot contain #5!',
    interviewScript30s:
      '"Because we only recurse into the ONE partition containing index `N - K`, expected work forms the geometric series N + N/2 + N/4 + ... = O(N) average time and O(1) space—beating O(N log K) heaps in memory."',
    chooseWhen: 'K-th Largest Element, K Closest Points to Origin, Top-K Frequent (over unique frequencies) when in-place mutation is allowed.',
    avoidWhen: 'Input is an online unbounded stream (use bounded Min-Heap) or adversarial worst-case O(N) is strictly demanded without randomization.',
    followUpTwists: [
      {
        question: 'How do you protect Quickselect against O(N²) worst case on all-duplicate arrays?',
        invariantShift: 'Combine Randomized Pivot with 3-Way Dutch Partition (`< pivot`, `== pivot`, `> pivot`): if target lies in the equal band, return immediately!',
        complexityImpact: 'O(N) even when all 10^5 elements are identical.',
      },
      {
        question: 'When should you prefer a Min-Heap over Quickselect in a system design interview?',
        invariantShift: 'When data streams infinitely or exceeds RAM, a size-K Min-Heap needs only O(K) memory and never requires random access.',
        complexityImpact: 'O(N log K) time, O(K) RAM.',
      },
    ],
  },
  'monotonic-deque': {
    algorithmId: 'monotonic-deque',
    simpleAnalogy:
      'Think of a VIP lounge line with a clock: anyone who gets too old leaves out the front door, and whenever a taller VIP walks in the back door, everyone shorter in front of them can never be the tallest again—so they leave immediately.',
    interviewScript30s:
      '"I store indices in a decreasing deque so the front is always the window maximum in O(1). Expiring front indices takes O(1) and evicting smaller back indices means every element enters and leaves at most once—giving true O(N) time and O(K) space."',
    chooseWhen: 'Sliding Window Maximum/Minimum, bounded max-min subarrays, or sliding-window DP optimization.',
    avoidWhen: 'Arbitrary random range [L, R] queries (use Segment Tree / Sparse Table) or streaming median (use Dual Heaps).',
    followUpTwists: [
      {
        question: 'What if you need the longest subarray where max - min <= limit (LC 1438)?',
        invariantShift: 'Run TWO monotonic deques in lockstep (one decreasing for max, one increasing for min) and advance left whenever maxDeque[0] - minDeque[0] > limit.',
        complexityImpact: 'Still O(N) time, O(N) space.',
      },
      {
        question: 'Why must you store INDICES instead of values in the deque?',
        invariantShift: 'Duplicate values cannot tell you whether the front element has fallen out of window [i - k + 1, i]; indices make expiration exact (`dq[0] <= i - k`).',
        complexityImpact: 'Same O(N) time, eliminates duplicate-value bugs.',
      },
    ],
  },
  'zero-one-bfs': {
    algorithmId: 'zero-one-bfs',
    simpleAnalogy:
      'Like taking a highway with free express lanes (cost 0) and $1 toll booths (cost 1): anyone who uses a free lane jumps to the front of the line, while toll payers wait at the back—no fancy priority queue needed!',
    interviewScript30s:
      '"Because every edge weight is strictly 0 or 1, the frontier only ever holds distances d and d+1. Pushing w=0 relaxations to the deque front and w=1 to the back keeps exact shortest-first ordering in O(V + E), dropping Dijkstra’s log V factor."',
    chooseWhen: 'Binary-cost grids (follow arrow = 0, flip = 1; empty cell = 0, remove wall = 1) or free-vs-paid state transitions.',
    avoidWhen: 'Edges have general weights like 2, 5, 10 (use Dijkstra) or negative weights (use Bellman-Ford).',
    followUpTwists: [
      {
        question: 'Can a node be pushed into the deque more than once in 0-1 BFS?',
        invariantShift: 'Yes—if first reached via a w=1 edge and later improved via a w=0 edge, it re-enters at the front; guard with `if (d > dist[u]) continue` just like Dijkstra.',
        complexityImpact: 'Each edge relaxes at most once → still strictly O(V + E).',
      },
      {
        question: 'What if edge weights are small integers 0..K (e.g., K <= 10)?',
        invariantShift: 'Generalize 0-1 BFS to Dial’s Algorithm using an array of K + 1 circular buckets.',
        complexityImpact: 'O(V · K + E) time.',
      },
    ],
  },
  'bidirectional-bfs': {
    algorithmId: 'bidirectional-bfs',
    simpleAnalogy:
      'Instead of digging one giant tunnel from New York to Boston, two crews dig from both ends and meet in the middle—cutting the total dirt excavated from a giant circle into two tiny half-radius circles.',
    interviewScript30s:
      '"Since both start and end states are known upfront in an unweighted graph, I expand two hash-set frontiers and always step the smaller one—slashing O(b^d) states down to O(b^(d/2)) until the sets intersect."',
    chooseWhen: 'Word Ladder, Open the Lock, or social-network shortest paths where branching factor b is huge and target is known.',
    avoidWhen: 'Target is unknown (e.g., nearest exit), graph is weighted (requires modified bidirectional Dijkstra stopping criteria), or edges are irreversible.',
    followUpTwists: [
      {
        question: 'Why do we always expand the SMALLER frontier instead of alternating strictly?',
        invariantShift: 'If one end sits inside a dense hub of 1,000 neighbors and the other has 3 neighbors, expanding the smaller set avoids blowing up the branching factor.',
        complexityImpact: 'Massive practical speedup on skewed-degree graphs.',
      },
      {
        question: 'How do you return ALL shortest transformation paths (Word Ladder II, LC 126)?',
        invariantShift: 'Delay removing words from the dictionary until an ENTIRE level finishes, record parent adjacency links, then DFS-reconstruct shortest paths.',
        complexityImpact: 'O(b^(d/2) + outputPaths) time.',
      },
    ],
  },
  'kruskals-mst': {
    algorithmId: 'kruskals-mst',
    simpleAnalogy:
      'Connecting towns with fiber-optic cables on a tight budget: sort every possible cable from cheapest to priciest and lay each cable only if the two towns cannot already reach each other.',
    interviewScript30s:
      '"I sort all undirected edges ascending by cost in O(E log E) and sweep them with Path-Compressed Union-Find—accepting every edge whose endpoints lie in different components until V - 1 edges connect the graph."',
    chooseWhen: 'Sparse edge-list graphs, minimum spanning forest with K clusters, or Critical & Pseudo-Critical MST edges.',
    avoidWhen: 'Dense complete graphs (E ≈ V² like N=1000 coordinate points) where Prim’s MST runs in O(V²) without storing O(V²) edges.',
    followUpTwists: [
      {
        question: 'How do you find the minimum cost to leave exactly K connected clusters instead of 1?',
        invariantShift: 'Run Kruskal identically and stop early as soon as `components === K` (after V - K edges instead of V - 1).',
        complexityImpact: 'Still O(E log E) time.',
      },
      {
        question: 'How do you test whether a specific edge is CRITICAL (must appear in every MST)?',
        invariantShift: 'Run Kruskal skipping that edge; if MST fails to connect or total cost strictly increases, the edge is critical.',
        complexityImpact: 'O(E² · α(V)) across all edges (LC 1489).',
      },
    ],
  },
  'bipartite-graph-coloring': {
    algorithmId: 'bipartite-graph-coloring',
    simpleAnalogy:
      'Seating wedding guests at two tables where rivals cannot sit together: seat the first guest at Table A, every rival at Table B, their rivals back at Table A—if anyone ends up sitting with a rival, a 3-way (odd) rivalry loop makes it impossible.',
    interviewScript30s:
      '"A graph is bipartite iff it contains no odd-length cycle. I iterate across every uncolored component, run BFS assigning alternating 0/1 colors, and return false the instant an edge connects two same-colored nodes—O(V + E) time and O(V) space."',
    chooseWhen: 'Is Graph Bipartite (LC 785), Possible Bipartition (LC 886), odd-cycle detection, or 2-shift conflict scheduling.',
    avoidWhen: 'More than 2 colors/groups are allowed (3-coloring is NP-Complete) or graph edges are directed dependencies (use Topological Sort).',
    followUpTwists: [
      {
        question: 'What bug catches 40% of candidates on Is Graph Bipartite?',
        invariantShift: 'Starting BFS only from node 0 misses disconnected components that contain an odd cycle; always wrap BFS in `for (i = 0..n-1) if (color[i] == -1)`.',
        complexityImpact: 'Still O(V + E), guarantees 100% component coverage.',
      },
      {
        question: 'Can you also test bipartiteness dynamically using Union-Find (DSU)?',
        invariantShift: 'Yes—either use an enemy-node offset `u + N` (union `u` with `v + N` and `v` with `u + N`) or Parity DSU; conflict occurs when `find(u) === find(v)`.',
        complexityImpact: 'O((V + E) · α(V)) online edge checks.',
      },
    ],
  },
  'sweep-line-events': {
    algorithmId: 'sweep-line-events',
    simpleAnalogy:
      'Standing at a conference hall door with a clicker: +1 every time a meeting starts, -1 every time a meeting ends (letting people exit before new ones enter at the same minute), and remembering the highest number ever shown on the clicker.',
    interviewScript30s:
      '"I flatten every [start, end) interval into (+1) and (-1) timeline events, sort by timestamp with -1 before +1 on ties, and sweep a single active counter in O(N log N) time—scaling effortlessly to timestamps up to 10^9."',
    chooseWhen: 'Meeting Rooms II, Car Pooling with large coordinates, My Calendar overlaps, and The Skyline Problem.',
    avoidWhen: 'Intervals arrive online one-by-one requiring instant peak queries after each insert (use TreeMap or Lazy Segment Tree).',
    followUpTwists: [
      {
        question: 'How does the tie-breaker flip if intervals are CLOSED `[start, end]` instead of half-open `[start, end)`?',
        invariantShift: 'If touching endpoints `[1, 5]` and `[5, 8]` count as overlapping at t=5, sort `+1` BEFORE `-1` on ties!',
        complexityImpact: 'Still O(N log N) time, O(N) space.',
      },
      {
        question: 'How do you extend Sweep Line to The Skyline Problem (LC 218)?',
        invariantShift: 'Replace the scalar `active` counter with a Max-Heap / multiset of active building heights, emitting a key point whenever the max height changes.',
        complexityImpact: 'O(N log N) time, O(N) space.',
      },
    ],
  },
  'dual-heaps-median': {
    algorithmId: 'dual-heaps-median',
    simpleAnalogy:
      'Lining students up in two halves facing each other: the tallest person in the short half (Max-Heap) shakes hands with the shortest person in the tall half (Min-Heap)—so the exact middle of the class is always right at their handshake.',
    interviewScript30s:
      '"I balance a lower Max-Heap and upper Min-Heap using a 3-step invariant: push to lo, move lo.top to hi, rebalance hi.top back to lo if hi grows larger. Every add takes O(log N) and findMedian reads the tops in O(1)."',
    chooseWhen: 'Find Median from Data Stream (LC 295), Sliding Window Median (LC 480), or two-phase capital/profit scheduling (IPO).',
    avoidWhen: 'All values are integers inside a tiny fixed range like [0..100] (a 101-slot frequency bucket beats heaps in O(1)).',
    followUpTwists: [
      {
        question: 'How do you remove outgoing elements in Sliding Window Median (LC 480)?',
        invariantShift: 'Heaps lack O(log N) arbitrary delete; store expired numbers in a `delayed` frequency HashMap and prune them lazily only when they surface at a heap top.',
        complexityImpact: 'O(N log K) time, O(N) space.',
      },
      {
        question: 'How do you track the 90th percentile (P90) instead of the 50th percentile?',
        invariantShift: 'Keep the exact same two heaps, but rebalance to maintain `lo.size ≈ 9 * hi.size` instead of `lo.size ≈ hi.size`!',
        complexityImpact: 'Still O(log N) add and O(1) P90 read.',
      },
    ],
  },
  'lis-patience-sorting': {
    algorithmId: 'lis-patience-sorting',
    simpleAnalogy:
      'Like dealing playing cards into piles left-to-right where you always place each new card onto the leftmost pile whose top card is >= yours: keeping each pile’s top card as small as possible leaves maximum space for future cards to build a longer sequence.',
    interviewScript30s:
      '"Instead of O(N²) DP scanning all predecessors, I maintain `tails[k]` as the smallest possible ending value of an increasing subsequence of length k+1. Since `tails` stays sorted, `lower_bound` binary search updates each element in O(log N) for O(N log N) total."',
    chooseWhen: 'Longest Increasing Subsequence with N <= 10^5, Russian Doll Envelopes (2D sort + LIS), or patience pile games.',
    avoidWhen: 'You need the COUNT of all distinct LIS sequences (requires O(N²) DP or Fenwick/Segment Tree storing (maxLen, count) pairs).',
    followUpTwists: [
      {
        question: 'What changes if EQUAL elements are allowed (Longest NON-DECREASING Subsequence)?',
        invariantShift: 'Switch `lower_bound` (`tails[mid] < x`) to `upper_bound` (`tails[mid] <= x`) so equal values append after existing equals instead of overwriting them.',
        complexityImpact: 'Still O(N log N) time, O(N) space.',
      },
      {
        question: 'How do you reconstruct the ACTUAL subsequence elements (not just the length)?',
        invariantShift: 'Store element indices in `tailsIdx` alongside a `parent[i]` array recording `tailsIdx[pos - 1]` when placing index `i`, then walk backward from `tailsIdx.at(-1)`.',
        complexityImpact: 'O(N log N) time, O(N) space.',
      },
    ],
  },
  'meet-in-the-middle': {
    algorithmId: 'meet-in-the-middle',
    simpleAnalogy:
      'Trying to open a 40-switch combination lock by brute force takes a trillion tries (2^40). Split the switches into Left 20 and Right 20 (1 million each), list all outcomes of each half, and match pairs in seconds!',
    interviewScript30s:
      '"At N = 40 with 10^9 values, 2^N backtracking TLEs and subset-sum DP OOMs. Splitting into two halves of N/2 creates two 2^(N/2) lists (~10^6), sorts the right half, and binary searches complements in O(N · 2^(N/2))—a square-root speedup over 2^N."',
    chooseWhen: 'N is roughly 30–44 AND values are too large (10^7–10^9) or negative for pseudo-polynomial DP (LC 1755, LC 2035, 4Sum II).',
    avoidWhen: 'N <= 20 (plain backtracking/bitmask DP is simpler) or total sum S is small (O(N·S) Knapsack DP is faster and smaller).',
    followUpTwists: [
      {
        question: 'How do you adapt Meet in the Middle when BOTH halves must contribute an EXACT total count of K elements (LC 2035)?',
        invariantShift: 'Group generated sums by popcount (`leftByCount[c]` and `rightByCount[K - c]`) and binary search only across matching complementary sizes!',
        complexityImpact: 'O(N · 2^(N/2)) time, O(2^(N/2)) space.',
      },
      {
        question: 'Can you eliminate the O(log 2^(N/2)) binary search factor during the merge?',
        invariantShift: 'Sort BOTH `leftSums` and `rightSums` (or merge-sort incrementally as each element is added) and sweep with O(2^(N/2)) converging Two Pointers!',
        complexityImpact: 'Cuts runtime ~5× in practice for N = 40.',
      },
    ],
  },
};

export function getAlgorithmTutorGuide(algorithmId: string): AlgorithmTutorGuide | null {
  return ALGORITHM_TUTOR_GUIDES[algorithmId] ?? null;
}
