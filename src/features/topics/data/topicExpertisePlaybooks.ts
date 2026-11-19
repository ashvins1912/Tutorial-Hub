import type { CurriculumTopic } from '../types';

export interface TopicTrapFix {
  trap: string;
  bestWayFix: string;
}

export interface TopicExpertiseGuide {
  goldenInvariant: string;
  canonicalRecipe: string;
  verbalizationScript: string;
  trapsAndFixes: TopicTrapFix[];
  masteryCheckpoints: string[];
}

const EXPERTISE_BY_TOPIC_ID: Record<string, TopicExpertiseGuide> = {
  'arrays-hashing': {
    goldenInvariant:
      'Every element seen prior to index i is already indexed in O(1), so checking the complement BEFORE inserting i prevents self-pairing bugs.',
    canonicalRecipe:
      'Query seen.get(target - x) first → return on hit → seen.set(x, i). For anagram/grouping keys, prefer a 26-int frequency signature over O(K log K) sorting.',
    verbalizationScript:
      '"Brute force checks all O(N²) pairs. Notice the inner loop is just asking if complement = target - nums[i] existed earlier. Trading O(N) memory for a HashMap collapses lookup to O(1) and total runtime to O(N)."',
    trapsAndFixes: [
      {
        trap: 'Inserting nums[i] into the map before checking target - nums[i] (causes 3 + 3 = 6 self-match).',
        bestWayFix: 'Always check-before-insert inside a single forward pass.',
      },
      {
        trap: 'Sorting every string in Group Anagrams when strings are long.',
        bestWayFix: 'Use a fixed 26-bucket character count key for O(N · K) linear grouping.',
      },
      {
        trap: 'Using HashSet/Map when array is already sorted and O(1) space is demanded.',
        bestWayFix: 'Immediately pivot to Converging Two Pointers for O(1) extra space.',
      },
    ],
    masteryCheckpoints: [
      'Derive the exact HashMap key/value contract before writing the loop',
      'Explain hash collision worst-case vs expected O(1) and memory overhead',
      'Know when to switch to Cyclic Sort / Index-as-Hash for O(1) space (First Missing Positive)',
      'Solve Two Sum, Group Anagrams, and Longest Consecutive Sequence bug-free on dry run',
    ],
  },
  'two-pointers': {
    goldenInvariant:
      'Each pointer step provably eliminates an entire row/column of dominated pairs because monotonicity guarantees no skipped pair can improve the objective.',
    canonicalRecipe:
      'Sort first if unsorted → initialize l = 0, r = n - 1 → prove which side is strictly dominated → skip adjacent duplicates cleanly with while (nums[l] === nums[l - 1]) l++.',
    verbalizationScript:
      '"Because the array is sorted (or bounded by walls), moving the taller wall can only shrink width without raising min-height. Therefore advancing the shorter pointer is provably lossless and cuts O(N²) to O(N) in O(1) space."',
    trapsAndFixes: [
      {
        trap: 'Forgetting duplicate-skipping guards in 3Sum, emitting repeated triplets.',
        bestWayFix: 'Skip duplicate outer pivot (i > 0 && a[i] === a[i-1]) AND duplicate inner l/r right after recording a match.',
      },
      {
        trap: 'Advancing the wrong pointer in Trapping Rain Water without updating running max first.',
        bestWayFix: 'Compare height[l] <= height[r]; update leftMax/rightMax and add max - height[ptr] before stepping.',
      },
      {
        trap: 'Using Two Pointers on unsorted negative-number subarray sums.',
        bestWayFix: 'Switch to Prefix Sum + HashMap when monotonicity does not hold.',
      },
    ],
    masteryCheckpoints: [
      'Prove aloud why the discarded side can never contain a better solution',
      'Distinguish opposite-end convergence vs same-direction read/write compaction',
      'Write Dutch National Flag 3-way partition without advancing mid after swapping with high',
      'Upgrade O(N)-space Rain Water to O(1)-space converging pointers cleanly',
    ],
  },
  'sliding-window': {
    goldenInvariant:
      'Maintain a single contiguous invariant over [left..right]: expand right unconditionally, shrink left ONLY while the window violates validity, and record best strictly when valid.',
    canonicalRecipe:
      'for (right = 0..n-1): acquire(s[right]) → while (!valid()) evict(s[left++]) → best = max(best, right - left + 1). For "exact K", compute atMost(K) - atMost(K - 1).',
    verbalizationScript:
      '"Since elements are non-negative (or counts are monotonic), both left and right only move rightward at most N times total—yielding amortized O(N) time instead of O(N²) substring re-scans."',
    trapsAndFixes: [
      {
        trap: 'Applying variable Sliding Window to subarrays with negative numbers.',
        bestWayFix: 'Negative values break monotonicity; use Prefix Sum + HashMap (or Monotonic Deque for >= K).',
      },
      {
        trap: 'Updating best length BEFORE the inner while loop restores window validity.',
        bestWayFix: 'For longest valid window, record AFTER while-shrink; for shortest valid window, record INSIDE while-valid.',
      },
      {
        trap: 'Rescanning a 26-element frequency array on every step.',
        bestWayFix: 'Maintain a scalar matchedChars / missingCount counter for O(1) validity checks.',
      },
    ],
    masteryCheckpoints: [
      'Clearly separate Longest-Valid (shrink while invalid) vs Shortest-Valid (shrink while valid)',
      'Track O(1) scalar validity state (formed === required) for Minimum Window Substring',
      'Apply atMost(K) - atMost(K - 1) transformation for exact-K subarray counts',
      'Recognize immediately when negative values require Prefix Sum or Monotonic Deque',
    ],
  },
  'prefix-sums': {
    goldenInvariant:
      'Any contiguous range sum [L..R] is O(1) difference P[R+1] - P[L]; seeding prefixCount.set(0, 1) captures all valid prefixes starting at index 0.',
    canonicalRecipe:
      'Static queries: build 1-padded prefix[n+1]. Count sum === K: seed map {0: 1}, add map.get(sum - k) BEFORE map.set(sum, count + 1). Range adds: diff[l] += v; diff[r+1] -= v.',
    verbalizationScript:
      '"Negative numbers break sliding window monotonicity, so I rewrite sum(L..R) = K as prefix[R] - prefix[L-1] = K. Tracking prior prefix frequencies in a HashMap answers all ending-at-R subarrays in O(1) per element."',
    trapsAndFixes: [
      {
        trap: 'Omitting freq.set(0, 1), missing every valid subarray starting at index 0.',
        bestWayFix: 'Always seed the empty prefix {0: 1} before iterating index 0.',
      },
      {
        trap: 'Negative modulo in divisibility problems returning -1 instead of k - 1.',
        bestWayFix: 'Normalize every remainder via ((sum % k) + k) % k.',
      },
      {
        trap: 'Using static prefix sums when point updates interleave with range queries.',
        bestWayFix: 'Upgrade immediately to Fenwick Tree (BIT) or Segment Tree for O(log N) updates.',
      },
    ],
    masteryCheckpoints: [
      'Always use n + 1 length with prefix[0] = 0 to eliminate index-0 special cases',
      'Normalize negative remainders in subarray-divisible-by-K problems',
      'Use Difference Arrays for offline batch range increments in O(N + Q)',
      'Compute Product Except Self in O(1) extra space via output prefix + scalar suffix',
    ],
  },
  'monotonic-stack': {
    goldenInvariant:
      'Each index is pushed once and popped at most once when a strictly dominant element resolves its Previous/Next boundary—guaranteeing amortized O(N) runtime.',
    canonicalRecipe:
      'Store INDICES (not raw values) on the stack; append a sentinel (e.g., 0 for Histogram) to flush remaining bars cleanly without a second cleanup loop.',
    verbalizationScript:
      '"For every bar/day, brute force scans outward in O(N²). Keeping unresolved indices in monotonic order lets each arriving element resolve all dominated predecessors in one amortized O(N) sweep."',
    trapsAndFixes: [
      {
        trap: 'Pushing values instead of indices and losing width/distance calculation.',
        bestWayFix: 'Always push index i and read nums[stack[top]] when comparing.',
      },
      {
        trap: 'Forgetting to flush remaining stack entries at array end in Histogram.',
        bestWayFix: 'Iterate i from 0..n treating curHeight = (i === n ? 0 : heights[i]) as a flushing sentinel.',
      },
      {
        trap: 'Double-counting equal elements in Sum of Subarray Minimums.',
        bestWayFix: 'Use strict (<) on one side and non-strict (<=) on the opposite side to partition ties uniquely.',
      },
    ],
    masteryCheckpoints: [
      'Choose strictly increasing vs decreasing stack instantly from Nearest Smaller vs Greater',
      'Compute exact histogram width (stack empty ? i : i - stack.top - 1) without off-by-one errors',
      'Handle duplicate tie-breaking (< vs <=) cleanly in subarray-contribution problems',
      'Know when Sliding Window Maximum needs a Monotonic Deque instead of a Stack',
    ],
  },
  'queues-monotonic-deque': {
    goldenInvariant:
      'Keep window candidate INDICES in strictly monotonic order inside a double-ended queue: expire out-of-window indices from the FRONT and evict dominated values from the BACK so every index enters and leaves at most once in O(N).',
    canonicalRecipe:
      '1) If deque[front] <= i - k, pop front (expired). 2) While nums[deque[back]] <= nums[i], pop back (dominated). 3) Push i to back. 4) Once i >= k - 1, nums[deque[front]] is the exact window maximum.',
    verbalizationScript:
      '"Scanning every k-window takes O(N·k) and a Max-Heap takes O(N log k) with stale entries. Notice an older, smaller element in the same window can NEVER win once a newer, larger element arrives—so a Monotonic Deque gives O(1) amortized max per window and O(N) total."',
    trapsAndFixes: [
      {
        trap: 'Using JavaScript array.shift() on huge queues (O(N) shift degrades O(N) to O(N²)).',
        bestWayFix: 'Track a moving `head` index pointer over an array or use a circular ring buffer for true O(1) front eviction.',
      },
      {
        trap: 'Storing raw values instead of indices in the deque, making window expiry impossible.',
        bestWayFix: 'Always push array index `i` so expiry is simply `deque[head] <= i - k`.',
      },
      {
        trap: 'Emitting window answers before the first full window reaches index k - 1.',
        bestWayFix: 'Guard output emission strictly with `if (i >= k - 1) result.push(nums[deque[head]])`.',
      },
    ],
    masteryCheckpoints: [
      'Explain why older smaller values are permanently dominated inside any fixed sliding window',
      'Implement Sliding Window Maximum in true O(N) with O(1) head-pointer eviction',
      'Distinguish FIFO BFS Queue vs 0-1 BFS Deque vs Monotonic Deque fluently',
      'Solve Shortest Subarray with Sum at Least K (negative numbers + monotonic prefix deque)',
    ],
  },
  'sorting-algorithms': {
    goldenInvariant:
      'Comparison sorts cannot beat Ω(N log N); choose Merge Sort for stability & inversion counting, Randomized QuickSort/Quickselect for O(1) space or O(N) K-th selection, and Counting/Radix for bounded integer keys.',
    canonicalRecipe:
      'Prefer Merge Sort for linked lists & stability, randomized 3-way QuickSort for duplicates, and Bucket/Counting sort for O(N) Top-K Frequent or bounded ranges.',
    verbalizationScript:
      '"Instead of blindly calling sort(), I check stability, memory, and key domain: randomized Quickselect finds K-th largest in O(N) average time, while Merge Sort counts cross-inversions in O(N log N)."',
    trapsAndFixes: [
      {
        trap: 'Picking first/last pivot in QuickSort on already-sorted arrays (O(N²) blowup).',
        bestWayFix: 'Always randomize pivot index or use 3-way Dutch partition for heavy duplicates.',
      },
      {
        trap: 'Forgetting JavaScript Array.prototype.sort() defaults to lexicographical string order.',
        bestWayFix: 'Always pass an explicit numeric comparator (a, b) => a - b.',
      },
      {
        trap: 'Full O(N log N) sorting when only Top-K or streaming order is required.',
        bestWayFix: 'Use a size-K Min-Heap O(N log K) or Bucket Sort O(N).',
      },
    ],
    masteryCheckpoints: [
      'Articulate exact time/space/stability trade-offs of Merge, Quick, Heap, and TimSort',
      'Implement Quickselect with randomized partition for O(N) average K-th order statistics',
      'Use Merge Sort divide-and-conquer to count inversions or smaller-after-self',
      'Spot custom-comparator problems (Largest Number, Interval Scheduling) immediately',
    ],
  },
  'recursion-divide-conquer': {
    goldenInvariant:
      'Every recursive function is a mathematical induction proof: trust the recursive call on strictly smaller subproblems, write the terminating base case FIRST, and combine cleanly.',
    canonicalRecipe:
      'Define exact frame return contract → guard base case at line 1 → split cleanly into disjoint subproblems → verify stack depth O(log N) vs O(N) and memoize if subproblems overlap.',
    verbalizationScript:
      '"I define the exact contract of solve(l, r), prove the base case terminates, and confirm via Master Theorem T(N) = 2T(N/2) + O(N) = O(N log N) with O(log N) call stack space."',
    trapsAndFixes: [
      {
        trap: 'Calling recursion on overlapping subproblems without memoization (exponential blowup).',
        bestWayFix: 'Draw the first 3 levels of the Call Stack Tree; if identical state tuples repeat, add memoization or bottom-up DP.',
      },
      {
        trap: 'Slicing arrays inside recursive calls (e.g., arr.slice(0, mid)) inflating O(N log N) memory.',
        bestWayFix: 'Pass (lo, hi) index bounds by reference so every frame uses O(1) auxiliary space.',
      },
      {
        trap: 'Hitting stack overflow on skewed recursion depth > 10^4.',
        bestWayFix: 'Convert tail/linear recursion to an explicit iterative stack or binary exponentiation loop.',
      },
    ],
    masteryCheckpoints: [
      'Trace active LIFO call stack frames, depth markers, and unwind order accurately',
      'Compute exact Master Theorem complexity AND call-stack memory overhead',
      'Compare recursive depth O(H) vs iterative O(1) space alternatives fluently',
      'Verify zero hidden O(N) array slicing inside divide-and-conquer frames',
    ],
  },
  backtracking: {
    goldenInvariant:
      'Follow strict Choose → Explore → Unchoose symmetry so parent frame state is 100% identical before and after every recursive child returns, pruning invalid branches BEFORE descending.',
    canonicalRecipe:
      '1) Sort input if duplicates exist → 2) Base case copies [...path] → 3) Prune in O(1) using cols/d1/d2 sets or sorted break → 4) push / recurse / pop.',
    verbalizationScript:
      '"Because N is small and we must enumerate all valid configurations, I model a decision tree with O(1) constraint pruning sets (cols, r-c, r+c) and strict choose/unchoose symmetry to keep memory O(N)."',
    trapsAndFixes: [
      {
        trap: 'Pushing path directly (res.push(path)) instead of a snapshot copy, leaving all outputs empty [].',
        bestWayFix: 'Always clone at the leaf: res.push([...path]).',
      },
      {
        trap: 'Skipping duplicates with nums[i] === nums[i-1] without checking i > startIndex.',
        bestWayFix: 'Guard with if (i > start && nums[i] === nums[i - 1]) continue so same-value elements on DIFFERENT levels still work.',
      },
      {
        trap: 'Checking conflicts in O(N) inside N-Queens instead of O(1) diagonal sets.',
        bestWayFix: 'Track cols, diag1 (r - c), and diag2 (r + c) in O(1) hash sets or bitmasks.',
      },
    ],
    masteryCheckpoints: [
      'Separate Base/Prune guards from Choose/Recurse/Unchoose steps cleanly',
      'Trace N-Queens, Subsets II, and Combination Sum II call stacks without missing undo steps',
      'Use sorted early-break (if cand > rem break) to prune entire dead subtrees',
      'Know when "count only" + large N means switch from Backtracking to DP',
    ],
  },
  'binary-search': {
    goldenInvariant:
      'Whenever feasibility predicate P(x) is monotonic (False..False → True..True), maintain a crisp half-open or closed bracket invariant that shrinks strictly every iteration.',
    canonicalRecipe:
      'while (lo < hi): mid = lo + Math.floor((hi - lo) / 2); if (feasible(mid)) hi = mid; else lo = mid + 1; return lo.',
    verbalizationScript:
      '"Instead of simulating linearly up to 10^9, notice that if speed K works, any speed > K also works. That monotonicity lets us binary search the answer space in O(N log(Range)) with O(1) space."',
    trapsAndFixes: [
      {
        trap: 'Infinite loop when computing left-biased mid and setting lo = mid.',
        bestWayFix: 'Pair lo < hi + floor mid with hi = mid / lo = mid + 1 (or use ceil mid when setting lo = mid).',
      },
      {
        trap: 'Setting hi bound too tight (e.g., forgetting single-day ship capacity equals sum(weights)).',
        bestWayFix: 'Explicitly derive exact mathematical [minPossible, maxPossible] before writing the loop.',
      },
      {
        trap: 'Mishandling <= vs < in Search in Rotated Sorted Array.',
        bestWayFix: 'Identify which half is sorted via nums[lo] <= nums[mid], then test strict membership inside that sorted half.',
      },
    ],
    masteryCheckpoints: [
      'Write lower_bound and upper_bound templates with zero off-by-one hesitation',
      'Spot "minimize the maximum" / "maximize the minimum" as Binary Search on Answer immediately',
      'Prove feasibility checker runs in O(N) and stays strictly monotonic',
      'Solve Rotated Sorted Array, Koko Eating Bananas, and Median of Two Sorted Arrays cleanly',
    ],
  },
  'linked-lists': {
    goldenInvariant:
      'Always attach a dummy sentinel before head-mutating operations and save next = curr.next BEFORE rewiring curr.next so the tail is never orphaned.',
    canonicalRecipe:
      'Use dummy = new ListNode(0, head) for merges/deletes; slow=head, fast=head (or fast=head.next for left-mid) for Floyd cycle & split-in-half.',
    verbalizationScript:
      '"Copying into an array costs O(N) space. Using a dummy sentinel and 3-pointer rewiring (prev, curr, next) reverses or interleaves links in O(N) time and strictly O(1) auxiliary space."',
    trapsAndFixes: [
      {
        trap: 'Null dereference when checking fast.next.next without guarding fast && fast.next.',
        bestWayFix: 'Always write while (fast !== null && fast.next !== null).',
      },
      {
        trap: 'Forgetting to sever the first half tail (slow.next = null) before merging/reordering.',
        bestWayFix: 'Explicitly terminate left half with slow.next = null before reversing the right half.',
      },
      {
        trap: 'Messy null checks in LRU Cache doubly linked list.',
        bestWayFix: 'Use permanent dummy head and dummy tail sentinel nodes so insertAfterHead and removeNode need zero null branches.',
      },
    ],
    masteryCheckpoints: [
      'Code iterative 3-pointer reversal and dummy-head merge without null bugs',
      'Prove Floyd Cycle II entry-node distance algebra cleanly',
      'Implement O(1) LRU Cache (HashMap + Sentinel Doubly Linked List) under 12 minutes',
      'Combine Find-Mid + Reverse + Interleave cleanly for Reorder List & Palindrome List',
    ],
  },
  'trees-bst': {
    goldenInvariant:
      'Decide up front whether the node needs Bottom-Up child summaries (Postorder: height, diameter, LCA, Max Path Sum) or Top-Down ancestor constraints (Preorder: Validate BST min/max bounds).',
    canonicalRecipe:
      'Distinguish globalBest (may split across left + node + right) from returnValue (single extendable upward path). Snapshot q.length at the start of every BFS level.',
    verbalizationScript:
      '"A single postorder pass computes each subtree height once in O(N) time instead of O(N²) repeated height scans, updating global diameter/max-path while returning the single best upward branch."',
    trapsAndFixes: [
      {
        trap: 'Validating a BST by checking only left.val < root.val < right.val (misses deep subtree violations).',
        bestWayFix: 'Propagate strict (lo, hi) bounds top-down to every descendant.',
      },
      {
        trap: 'Returning a split left+root+right path to the parent in Binary Tree Max Path Sum.',
        bestWayFix: 'Update globalMax with leftGain + node.val + rightGain, but return ONLY node.val + max(leftGain, rightGain).',
      },
      {
        trap: 'Using dynamic queue.length inside a BFS level loop.',
        bestWayFix: 'Freeze const levelSize = queue.length before iterating that level.',
      },
    ],
    masteryCheckpoints: [
      'Separate split-path global update from single-branch recursive return value',
      'Implement LCA, Validate BST, and Serialize/Deserialize cleanly in one pass',
      'Use iterative stack inorder traversal for early-exit O(H + K) BST K-th Smallest',
      'Analyze skewed O(N) vs balanced O(log N) call-stack space accurately',
    ],
  },
  'tries-prefix': {
    goldenInvariant:
      'Share common character prefixes along tree edges so insert, exact lookup, and prefix queries run in O(L) completely independent of dictionary size M.',
    canonicalRecipe:
      'TrieNode { children, isWord, word? }. In Word Search II, store full word at leaf, clear leaf.word after match to deduplicate, and prune empty child nodes on unwind.',
    verbalizationScript:
      '"Scanning M dictionary words takes O(M · L) per keystroke. Indexing into a Trie shares prefixes and drops lookup to O(L), while pruning dead branches instantly in grid word search."',
    trapsAndFixes: [
      {
        trap: 'Returning true for search("app") when only "apple" was inserted.',
        bestWayFix: 'Always distinguish startsWith (path exists) from search (path exists AND node.isWord).',
      },
      {
        trap: 'Not pruning exhausted Trie leaves during Word Search II backtracking (causes TLE).',
        bestWayFix: 'Delete child edges once their subtree has 0 remaining words.',
      },
      {
        trap: 'Allocating 256-slot arrays per node on sparse Unicode dictionaries.',
        bestWayFix: 'Use Map<string, TrieNode> or Compressed Radix Tree edges for memory efficiency.',
      },
    ],
    masteryCheckpoints: [
      'Implement Trie insert/search/startsWith cleanly in under 5 minutes',
      'Handle "." wildcard DFS branching cleanly (Add & Search Words)',
      'Combine Grid Backtracking + Trie node pruning for Word Search II',
      'Know when to upgrade from Prefix Trie to N-Gram Inverted Index for typo tolerance',
    ],
  },
  'heaps-priority-queues': {
    goldenInvariant:
      'Maintain a bounded heap of size K (min-heap for K largest, max-heap for K smallest) to evict losers in O(log K) without paying O(N log N) full sort cost.',
    canonicalRecipe:
      'Top-K Largest: push into Min-Heap, pop if size > K → root is K-th largest. Streaming Median: Max-Heap lower half + Min-Heap upper half keeping 0 <= left.size - right.size <= 1.',
    verbalizationScript:
      '"We do not need all N elements sorted—only the K largest frontier. Capping a Min-Heap at size K keeps memory O(K) and runtime O(N log K), and works online on unbounded streams."',
    trapsAndFixes: [
      {
        trap: 'Using a Max-Heap of size N instead of a Min-Heap of size K for Top-K Largest.',
        bestWayFix: 'Keep the smallest of the top-K at the Min-Heap root so any larger arrival evicts it in O(log K).',
      },
      {
        trap: 'Forgetting to rebalance the two heaps after every addNum() in Streaming Median.',
        bestWayFix: 'Push to lower Max-Heap → move its top to upper Min-Heap → if upper exceeds lower, move upper top back.',
      },
      {
        trap: 'Skipping lazy expiration checks when using a heap for Sliding Window Maximum.',
        bestWayFix: 'Either pop stale indices (top.idx <= i - k) or use an O(N) Monotonic Deque.',
      },
    ],
    masteryCheckpoints: [
      'Pick Min-Heap vs Max-Heap orientation without second-guessing',
      'Implement K-Way Merge (Merge K Sorted Lists / Design Twitter) in O(N log K)',
      'Balance Two-Heap Streaming Median in O(log N) add / O(1) query',
      'Explain O(N) Floyd heapify build vs O(N log N) repeated insertion',
    ],
  },
  'graphs-bfs-dfs': {
    goldenInvariant:
      'Mark nodes visited ON ENQUEUE (never on dequeue) in BFS to guarantee O(V + E) unweighted shortest paths, and verify processedCount === V in Kahn Topological Sort to catch cycles.',
    canonicalRecipe:
      'Unweighted shortest steps / spread → Multi-Source BFS. Dependencies / build order → Kahn Indegree Queue. Components / cycles → DFS / DSU.',
    verbalizationScript:
      '"Because every edge transition costs 1 step, BFS discovers vertices in strictly non-decreasing distance layers—guaranteeing minimal hops on first visit in O(V + E) time."',
    trapsAndFixes: [
      {
        trap: 'Marking visited when popping from queue instead of when pushing (causes exponential queue duplicates on grids).',
        bestWayFix: 'Set visited[next] = true immediately before queue.push(next).',
      },
      {
        trap: 'Building prerequisite edges backwards (course -> prereq instead of prereq -> course).',
        bestWayFix: 'Always draw "A must come before B" as A → B and increment indegree[B]++.',
      },
      {
        trap: 'Using DFS to find shortest path in an unweighted grid.',
        bestWayFix: 'DFS finds A path, not the SHORTEST path—always use BFS for unweighted minimum steps.',
      },
    ],
    masteryCheckpoints: [
      'Write Multi-Source BFS (Rotting Oranges) initializing all sources at t = 0 simultaneously',
      'Implement Kahn Topological Sort + cycle detection (order.length === V) cleanly',
      'Build implicit wildcard adjacency graphs cleanly (Word Ladder) in O(N · L²)',
      'Handle disconnected graphs by looping over all vertices 0..V-1',
    ],
  },
  'union-find': {
    goldenInvariant:
      'Combine Path Compression in find(x) with Union-by-Size/Rank so every dynamic connectivity merge and query runs in inverse-Ackermann O(α(N)) ≈ O(1).',
    canonicalRecipe:
      'find(x): return parent[x] === x ? x : (parent[x] = find(parent[x])). union(a, b): attach smaller root under larger root; return false if ra === rb (cycle detected!).',
    verbalizationScript:
      '"Running DFS per incoming edge costs O(E · V). Disjoint Set Union with path compression and union-by-size answers dynamic connectivity and Kruskal MST merges in near-constant O(α(V)) amortized time."',
    trapsAndFixes: [
      {
        trap: 'Comparing parent[a] === parent[b] directly instead of find(a) === find(b).',
        bestWayFix: 'Always resolve roots via find(a) === find(b) because parent[] may be stale before compression.',
      },
      {
        trap: 'Using Union-Find to detect cycles in a DIRECTED graph.',
        bestWayFix: 'DSU only detects UNDIRECTED cycles; use Kahn Topological Sort or 3-color DFS for directed graphs.',
      },
      {
        trap: 'Forgetting to initialize componentCount = n and decrement only on successful union.',
        bestWayFix: 'Decrement components-- strictly inside union() when ra !== rb.',
      },
    ],
    masteryCheckpoints: [
      'Write Path Compression + Union by Size cleanly from scratch in 12 lines',
      'Solve Accounts Merge (email → accountId DSU) and Redundant Connection cleanly',
      'Explain why DSU handles edge additions cleanly while edge deletions require offline reverse processing',
      'Combine sorted edges + DSU cleanly for Kruskal Minimum Spanning Tree',
    ],
  },
  'shortest-paths': {
    goldenInvariant:
      'Match edge-weight class to algorithm: unweighted → BFS, {0,1} weights → 0-1 Deque BFS, non-negative weights → Min-Heap Dijkstra with stale-entry skip, negative weights / K-stop cap → Bellman-Ford.',
    canonicalRecipe:
      'Dijkstra: pop [d, u] from Min-Heap → if (d > dist[u]) continue; → relax if d + w < dist[v]. K-Stops: run K+1 Bellman-Ford layers reading from a cloned prevDist array.',
    verbalizationScript:
      '"With all weights >= 0, the globally smallest unsettled distance popped from the min-heap can never be improved later—making greedy Dijkstra exact in O((V + E) log V)."',
    trapsAndFixes: [
      {
        trap: 'Running Dijkstra on graphs with negative edge weights.',
        bestWayFix: 'Switch to Bellman-Ford O(V · E) (also detects negative cycles on the V-th pass).',
      },
      {
        trap: 'Omitting if (d > dist[u]) continue; after popping from Min-Heap.',
        bestWayFix: 'Always skip stale entries so each vertex relaxes outgoing edges at most once.',
      },
      {
        trap: 'Relaxing in-place during Cheapest Flights Within K Stops (allows > 1 edge per round).',
        bestWayFix: 'Read from prev = [...dist] and write to next[] each layer so K + 1 layers enforce <= K stops.',
      },
    ],
    masteryCheckpoints: [
      'Select BFS vs 0-1 BFS vs Dijkstra vs Bellman-Ford in under 10 seconds from constraints',
      'Include the stale-heap guard (d > dist[u]) in every Dijkstra implementation',
      'Model multi-dimensional state graphs (node, stopsLeft) cleanly for constrained routing',
      'Solve Network Delay Time, Cheapest Flights Within K Stops, and Path With Minimum Effort',
    ],
  },
  'greedy-algorithms': {
    goldenInvariant:
      'Never trust greedy intuition without attempting an Exchange Argument proof (or trying to build a small counterexample like coins [1,3,4] for target 6).',
    canonicalRecipe:
      'Merge Intervals → sort by START. Max Non-Overlapping / Min Arrows → sort by END. Jump Game → track farthest reachable frontier in O(N) / O(1).',
    verbalizationScript:
      '"By sorting intervals by earliest end time, choosing the earliest finish leaves the strictly largest remaining timeline—proven via exchange argument in O(N log N) without O(N²) DP."',
    trapsAndFixes: [
      {
        trap: 'Sorting by start time instead of end time when maximizing non-overlapping intervals.',
        bestWayFix: 'A long interval [1, 100] starts early but blocks everything; sort by END time ascending.',
      },
      {
        trap: 'Assuming greedy works for arbitrary Coin Change or 0/1 Knapsack.',
        bestWayFix: 'Test a tiny 3-item counterexample first; if greedy fails, pivot immediately to DP.',
      },
      {
        trap: 'Mishandling touching endpoints [1, 2] and [2, 3].',
        bestWayFix: 'Explicitly clarify with interviewer whether closed touching intervals count as overlapping.',
      },
    ],
    masteryCheckpoints: [
      'State exact sort key (start vs end vs ratio) and justify via exchange argument',
      'Distinguish Merge Intervals (sort start) vs Erase Overlaps (sort end) vs Meeting Rooms II (sweep/heap)',
      'Solve Jump Game I & II in O(N) time and O(1) space via BFS-level frontier tracking',
      'Catch greedy counterexamples within 30 seconds before committing to code',
    ],
  },
  'dynamic-programming': {
    goldenInvariant:
      'Follow the SRTBOT recipe: State definition (1 exact sentence) → Recurrence → Topological evaluation order → Base cases → Original problem answer → Time/Space compression.',
    canonicalRecipe:
      '0/1 Knapsack: iterate capacity w BACKWARDS (W down to wt[i]). Unbounded Knapsack: iterate w FORWARDS. 2D String DP: pad row/col 0 for empty prefixes and save prevDiag for 1D compression.',
    verbalizationScript:
      '"Naive recursion recomputes identical (i, remaining) states exponentially. Defining dp[i][w] as the optimal value using the first i items within capacity w collapses work to O(N · W), and reverse-capacity iteration compresses memory to O(W)."',
    trapsAndFixes: [
      {
        trap: 'Iterating capacity forward in 0/1 Knapsack (accidentally reuses the same item infinitely).',
        bestWayFix: '0/1 Knapsack = backward capacity loop; Unbounded Knapsack = forward capacity loop.',
      },
      {
        trap: 'Overwriting dp[j-1] from the previous row during 1D Edit Distance / LCS compression.',
        bestWayFix: 'Cache prevDiag before updating dp[j] so diagonal transitions always read row i - 1.',
      },
      {
        trap: 'Using O(N²) LIS DP when N <= 10^5.',
        bestWayFix: 'Switch to Patience Sorting tails[] + Binary Search for O(N log N).',
      },
    ],
    masteryCheckpoints: [
      'Write a 1-sentence English definition of dp[state] BEFORE writing the recurrence',
      'Spot 0/1 vs Unbounded loop direction instantly without guessing',
      'Compress 2D/1D tables to rolling row or O(1) scalars safely after verifying transitions',
      'Solve Coin Change, Word Break, LIS O(N log N), Partition Equal Subset, LCS, and Edit Distance',
    ],
  },
  'segment-trees': {
    goldenInvariant:
      'Decompose any range [L..R] into O(log N) disjoint power-of-two tree segments so both dynamic point/range updates and associative range queries stay strictly O(log N).',
    canonicalRecipe:
      'For invertible prefix sums, prefer a 1-indexed Fenwick BIT (10 lines). For Range Min/Max/GCD or lazy range updates, use an iterative 2N or recursive 4N Segment Tree.',
    verbalizationScript:
      '"Static prefix sums degrade to O(N) on updates. A Segment Tree maintains associative range aggregates across balanced sub-intervals, keeping both updates and queries strictly O(log N)."',
    trapsAndFixes: [
      {
        trap: 'Using 0-based index in Fenwick Tree lowbit loop (i += i & -i infinite loops at i = 0).',
        bestWayFix: 'Keep Fenwick BIT strictly 1-indexed (shift external index by +1).',
      },
      {
        trap: 'Allocating 2*N instead of 4*N for a recursive Segment Tree.',
        bestWayFix: 'Allocate 4*N for recursive trees (or use bottom-up iterative 2*N trees for point updates).',
      },
      {
        trap: 'Forgetting to pushDown() lazy tags before querying/updating child intervals.',
        bestWayFix: 'Always invoke pushDown(node, l, r) before descending into partial overlaps.',
      },
    ],
    masteryCheckpoints: [
      'Choose Fenwick BIT (prefix sum / inversions) vs Segment Tree (RMQ / lazy range updates) cleanly',
      'Code an iterative 2N Segment Tree and 1-indexed Fenwick Tree without index errors',
      'Apply Coordinate Compression when array values span [-10^9, 10^9]',
      'Identify the exact merge identity element (0 for sum, +Infinity for min, -Infinity for max)',
    ],
  },
  'bit-manipulation': {
    goldenInvariant:
      'Exploit per-bit independence, XOR self-cancellation (x ^ x = 0), and Brian Kernighan lowest-bit clearing (n & (n - 1)) to hit O(1) space and branchless speed.',
    canonicalRecipe:
      'Isolate rightmost 1-bit: low = x & -x. Clear rightmost 1-bit: x &= (x - 1). Test bit k: (mask & (1 << k)) !== 0. Full adder: sum = a ^ b, carry = (a & b) << 1.',
    verbalizationScript:
      '"Because XOR is commutative, associative, and self-canceling (x ^ x = 0), reducing the array cancels every duplicate pair in O(N) time and O(1) space without a HashMap."',
    trapsAndFixes: [
      {
        trap: 'Operator precedence bug: writing x & 1 == 0 instead of (x & 1) === 0.',
        bestWayFix: 'Always wrap bitwise expressions in explicit parentheses.',
      },
      {
        trap: 'Arithmetic right shift >> preserving sign bit on negative numbers causing infinite loops.',
        bestWayFix: 'Use unsigned right shift >>> in JS/Java when shifting bitmasks right.',
      },
      {
        trap: 'Bitmask overflow past 31 bits in JavaScript signed 32-bit bitwise ops.',
        bestWayFix: 'Use BigInt bitmasks whenever N > 30.',
      },
    ],
    masteryCheckpoints: [
      'Derive Single Number I/II/III using XOR and differentiating-bit partitioning',
      'Count set bits in O(popcount) via Brian Kernighan n & (n - 1)',
      'Encode visited subsets as integer bitmasks for N <= 20 DP/backtracking problems',
      'Simulate addition without +/- via XOR sum and shifted AND carry',
    ],
  },
  'exact-string-matching': {
    goldenInvariant:
      'Never rewind the text cursor on mismatch: precompute border reuse (KMP LPS / Z-Box) for guaranteed worst-case O(N + M), or slide polynomial fingerprints (Rabin-Karp) for multi-pattern hashing.',
    canonicalRecipe:
      'Worst-case linear single pattern → KMP LPS or Z(pattern + "$" + text). Duplicate substring / multi-pattern → Double-Mod Rabin-Karp + Binary Search on length.',
    verbalizationScript:
      '"Naive search degrades to O(N · M) on repetitive strings like aaaaab. Precomputing the LPS failure table reuses matched borders so the text index never moves backward—guaranteeing O(N + M) worst-case."',
    trapsAndFixes: [
      {
        trap: 'Using if instead of while on KMP fallback len = lps[len - 1].',
        bestWayFix: 'Always loop fallback until characters match or len hits 0.',
      },
      {
        trap: 'Negative hash modulo after subtracting outgoing character in Rabin-Karp.',
        bestWayFix: 'Normalize via ((hash - out * pow) % mod + mod) % mod and verify string equality on collision.',
      },
      {
        trap: 'Choosing a Z-Algorithm separator character that appears inside text or pattern.',
        bestWayFix: 'Use an out-of-alphabet sentinel (e.g., "\\0") when concatenating pat + sep + text.',
      },
    ],
    masteryCheckpoints: [
      'Build KMP LPS table cleanly and explain border reuse on mismatch',
      'Compute Z-Array [L..R] Z-box reuse in O(N) for Longest Happy Prefix',
      'Implement overflow-safe Rabin-Karp rolling hash with exact collision confirmation',
      'Know when exact matching fails (typos) and transition to N-Gram Fuzzy Search',
    ],
  },
  'ngram-tokenization': {
    goldenInvariant:
      'Pad string boundaries ("  word  ") before slicing character trigrams so typos at index 0 or the final character carry fair similarity weight, and weight rare grams higher via TF-IDF.',
    canonicalRecipe:
      'Normalize + Unicode fold → pad with (n - 1) boundary spaces → slice trigrams (bigrams for len <= 3) → score via Dice (typo sensitivity) or TF-IDF Cosine (corpus discrimination).',
    verbalizationScript:
      '"Exact hashing returns 0 results on a 1-letter typo. Converting strings into padded trigram sets preserves shared overlap despite edits, letting us score similarity via Jaccard/Dice in O(|Q|)."',
    trapsAndFixes: [
      {
        trap: 'Omitting boundary padding ("cat" -> only 1 trigram "cat"), causing 0 overlap on any single typo.',
        bestWayFix: 'Pad with n - 1 spaces ("  cat  " -> 5 trigrams) so every character spans 3 trigrams.',
      },
      {
        trap: 'Using trigrams on 1–2 character queries without a fallback.',
        bestWayFix: 'Drop to edge n-grams or direct edit distance <= 1 for short queries.',
      },
      {
        trap: 'Letting ubiquitous trigrams ("ing", "the") dominate similarity scores.',
        bestWayFix: 'Apply IDF weighting (log(N / df)) so rare distinctive trigrams drive ranking.',
      },
    ],
    masteryCheckpoints: [
      'Compare Jaccard, Sørensen-Dice, Overlap, and TF-IDF Cosine trade-offs accurately',
      'Explain why padded trigrams beat unpadded trigrams on start/end typos',
      'Combine Edge N-Grams (instant prefix) with Padded Trigrams (typo tolerance)',
      'Handle CJK/Unicode normalization and short-token fallbacks cleanly',
    ],
  },
  'candidate-generation': {
    goldenInvariant:
      'Never run O(L²) edit distance over 10M records: intersect inverted n-gram posting lists with Length & Min-Overlap Count Pruning (or SymSpell/MinHash LSH) to shrink to <= 500 candidates in < 5ms.',
    canonicalRecipe:
      'Inverted Index (gram -> sorted docIds) + length bound |len(d) - len(q)| <= k + minimum shared grams threshold >= max(1, |G_q| - n * maxEdits) + WAND/Roaring Bitmap skips.',
    verbalizationScript:
      '"To meet a <10ms SLA over 10M SKUs, Stage 1 trades memory for an Inverted N-Gram Index with length and count pruning—guaranteeing high recall while capping Stage 2 to <= 500 survivors."',
    trapsAndFixes: [
      {
        trap: 'Scanning all posting lists without pruning ultra-common stop-grams.',
        bestWayFix: 'Sort query grams rarest-first and apply count/length lower-bound pruning.',
      },
      {
        trap: 'Using BK-Trees with non-metric Cosine similarity (breaks triangle inequality).',
        bestWayFix: 'Use BK-Trees strictly with metric distances (Levenshtein); use LSH/HNSW for Cosine.',
      },
      {
        trap: 'Running SymSpell with maxEditDistance >= 4 (combinatorial RAM explosion).',
        bestWayFix: 'Cap SymSpell at edit distance 1–2 and fall back to N-Gram Inverted Index for longer edits.',
      },
    ],
    masteryCheckpoints: [
      'Derive the exact minimum shared n-gram lower bound |Q| - n * d for lossless pruning',
      'Compare Inverted N-Gram Index, SymSpell, BK-Trees, and MinHash + LSH by workload',
      'Explain delta encoding and Roaring Bitmaps for compressed posting-list intersections',
      'Benchmark Stage 1 candidate cap (500–1,000 docs) to guarantee < 10ms end-to-end latency',
    ],
  },
  'confident-reranking': {
    goldenInvariant:
      'Decouple recall from precision: spend Stage 2 CPU budget ONLY on Stage 1 survivors, blending banded Damerau-Levenshtein (transpositions), Jaro-Winkler (prefix boost), and calibrated [0..1] confidence.',
    canonicalRecipe:
      'Score = w1 * damerauSim + w2 * jaroWinkler + w3 * tfidfDice + w4 * logPopularity - penalties; emit calibrated confidence thresholds for Auto-Correct (>= 0.88) vs "Did you mean?" (0.65..0.87).',
    verbalizationScript:
      '"Standard Levenshtein penalizes adjacent keyboard swaps ("teh") as 2 edits. Stage 2 uses banded Damerau-Levenshtein + Jaro-Winkler prefix boost on top-K survivors to deliver calibrated confidence in < 3ms."',
    trapsAndFixes: [
      {
        trap: 'Using standard Levenshtein instead of Damerau-Levenshtein on keyboard transpositions.',
        bestWayFix: 'Include adjacent transposition cost = 1 (Damerau-Levenshtein) for realistic human typos.',
      },
      {
        trap: 'Unbanded O(L1 · L2) DP on long product descriptions.',
        bestWayFix: 'Use Ukkonen banded DP (only compute |i - j| <= maxEdit) for O(L · d) speed.',
      },
      {
        trap: 'Comparing raw edit distances across 3-char vs 20-char queries.',
        bestWayFix: 'Normalize similarity by max(len(a), len(b)) and calibrate confidence bands empirically.',
      },
    ],
    masteryCheckpoints: [
      'Implement Damerau-Levenshtein and explain banded Ukkonen early abort',
      'Explain why Jaro-Winkler boosts matching prefixes for autocomplete UX',
      'Design calibrated confidence thresholds separating Auto-Select, Suggest, and No-Match',
      'End-to-end architect Stage 1 Retrieval + Stage 2 Reranking under strict < 10ms p99 SLA',
    ],
  },
};

const CANONICAL_PLAYBOOK_ALIASES: Record<string, string> = {
  'prefix-sum-diff-array': 'prefix-sums',
  'stacks-monotonic-stack': 'monotonic-stack',
  'trees-bst-nary': 'trees-bst',
  'tries-radix': 'tries-prefix',
  'graphs-traversal-dsu': 'graphs-bfs-dfs',
  'segment-fenwick-trees': 'segment-trees',
  'ngram-fuzzy-candidate-retrieval': 'candidate-generation',
  'confident-fuzzy-reranking': 'confident-reranking',
};

export function getTopicExpertiseGuide(topic: CurriculumTopic): TopicExpertiseGuide {
  const resolvedKey = CANONICAL_PLAYBOOK_ALIASES[topic.id] ?? topic.id;
  const direct = EXPERTISE_BY_TOPIC_ID[resolvedKey];
  if (direct) return direct;

  // Smart structured fallback derived from the topic's actual metadata
  return {
    goldenInvariant:
      topic.mentalModelSteps[0] ??
      `Lock down the core invariant for ${topic.title} before writing loops or recursion.`,
    canonicalRecipe: `${topic.solutions.optimal.title} (${topic.solutions.optimal.timeComplexity} time · ${topic.solutions.optimal.spaceComplexity} space).`,
    verbalizationScript: `"Start from ${topic.solutions.brute.title} (${topic.solutions.brute.timeComplexity}), isolate the repeated work, and upgrade to ${topic.solutions.optimal.title} in ${topic.solutions.optimal.timeComplexity} time and ${topic.solutions.optimal.spaceComplexity} space."`,
    trapsAndFixes: [
      {
        trap: 'Jumping into code before stating input scale ceiling and invariant.',
        bestWayFix: 'State constraint ceiling and loop/recursion invariant in 2 sentences first.',
      },
      {
        trap: 'Ignoring degenerate inputs (empty, single-element, duplicates, negatives).',
        bestWayFix: 'Dry-run minimum boundary and adversarial duplicate cases before finishing.',
      },
    ],
    masteryCheckpoints: [
      `Recognize ${topic.title} trigger clues within 30 seconds of reading constraints`,
      `Explain the exact bottleneck eliminated from ${topic.solutions.brute.timeComplexity} → ${topic.solutions.optimal.timeComplexity}`,
      'Code the optimal solution cleanly with zero off-by-one boundary bugs',
      'Complete at least 1 Medium and 1 Hard problem from the ladder independently',
    ],
  };
}
