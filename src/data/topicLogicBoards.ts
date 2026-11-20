import type { CurriculumTopic } from '../features/topics/types';
import type { LogicBoardEnrichment } from './logicBoardMathTypes';

export const TOPIC_LOGIC_BOARDS: Record<string, LogicBoardEnrichment> = {
  'arrays-hashing': {
    formalDefinition:
      'An Array stores a contiguous sequence A[0..n-1] supporting O(1) indexed address arithmetic, while a Hash Table maps keys k from a large universe U into m buckets via a hash function h(k) ∈ {0, …, m-1}, trading O(n) memory for O(1) expected membership, frequency counting, and complement lookup.',
    problemStatementForm:
      'Given an unsorted sequence A[0..n-1] (or stream of records) and an equality, grouping, or pair-sum relation R(x, y), compute frequencies, canonical equivalence classes, or matching indices without an O(n²) nested scan.',
    logicBoard: [
      {
        step: '01 · Canonicalize',
        condition: 'Incoming element x needs equivalence grouping or complement lookup',
        action: 'Compute canonical key k = key(x) (value, sorted signature, or 26-letter count tuple)',
        invariant: 'Two items belong to the same bucket if and only if key(a) = key(b)',
      },
      {
        step: '02 · Query Seen State',
        condition: 'Target complement c = target - x (or duplicate key k) already exists in map M',
        action: 'Emit or accumulate answer immediately using stored index / frequency M[c]',
        invariant: 'Map M strictly represents elements strictly to the left of current index i',
      },
      {
        step: '03 · Update Hash State',
        condition: 'Current element x has been evaluated against prior state',
        action: 'Insert or increment M[k] ← M[k] + 1 (or record earliest/latest index)',
        invariant: 'Load factor α = n / m stays bounded (resize & rehash at α > 0.75)',
      },
      {
        step: '04 · Pivot Check',
        condition: 'Input is sorted or requires O(1) extra space / range queries',
        action: 'Switch from Hash Map to Two Pointers, Prefix Sum, or Cyclic Sort',
        invariant: 'Memory budget and ordering requirements match the chosen data structure',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Contiguous Array Address Arithmetic',
          formula: 'addr(A[i]) = base_addr + i × sizeof(T)',
          meaning: 'Constant-time random access independent of array length n.',
        },
        {
          name: 'Expected Hash Lookup Under Simple Uniform Hashing',
          formula: 'α = n / m,   E[probes] = 1 + α  (chaining),   1 / (1 - α)  (open addressing)',
          meaning: 'Keeping load factor α ≤ 0.75 guarantees O(1) amortized lookup and insert.',
        },
        {
          name: 'Complement Lookup Identity (Two-Sum Reduction)',
          formula: 'A[i] + A[j] = T  ⟺  A[i] = T - A[j]  (i < j)',
          meaning: 'Replaces O(n²) pair enumeration with a single O(1) hash query per element.',
        },
      ],
      proofSketch:
        'Under universal hashing P(h(x) = h(y)) ≤ 1/m for x ≠ y, the expected chain length for any query key is ∑_{y≠x} 1/m = (n-1)/m < α. Resizing m → 2m whenever n > 0.75m yields O(1) amortized cost per operation via the potential function Φ = 2n - m.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Unsorted array asking for pair sum, duplicates, or anagram grouping',
        recommendedPattern: 'Hash Map / Frequency Counter',
        linkedId: 'arrays-hashing',
        linkedKind: 'topic',
        whyItFits: 'Direct O(1) lookup removes the inner scan without sorting overhead.',
      },
      {
        ifYouSee: 'Subarray sum equals K with negative numbers allowed',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-diff-array',
        linkedKind: 'topic',
        whyItFits: 'Combines running prefix sums with hash lookup of (currSum - K).',
      },
      {
        ifYouSee: 'Input is already sorted and O(1) auxiliary space is required',
        recommendedPattern: 'Two Pointers',
        linkedId: 'two-pointers',
        linkedKind: 'topic',
        whyItFits: 'Monotonic order lets inward pointers discard impossible pairs in O(1) space.',
      },
    ],
  },

  'two-pointers': {
    formalDefinition:
      'The Two-Pointer Technique maintains two monotonic indices (L, R) over a sorted or structured sequence so that each comparison provably eliminates an entire row or column of candidate pairs, reducing quadratic O(n²) search spaces to linear O(n) time in O(1) extra space.',
    problemStatementForm:
      'Given a sorted array (or sequence where pairs/partitions satisfy a monotonic predicate), find optimal pairs/triplets, partition elements in-place, or compress duplicates without allocating auxiliary memory.',
    logicBoard: [
      {
        step: '01 · Initialize Bounds',
        condition: 'Opposite-ends pair search vs. same-direction in-place compaction',
        action: 'Set L = 0, R = n - 1 (opposite) OR slow = 0, fast = 0 (same-direction)',
        invariant: 'All uninspected valid candidates remain strictly within the active region',
      },
      {
        step: '02 · Evaluate Predicate',
        condition: 'Current pair metric f(L, R) < target (too small)',
        action: 'Advance L ← L + 1 because A[L] paired with any j ≤ R is also < target',
        invariant: 'No optimal or valid pair is ever skipped by discarding index L',
      },
      {
        step: '03 · Prune Right Bound',
        condition: 'Current pair metric f(L, R) > target (too large)',
        action: 'Decrement R ← R - 1 because A[R] paired with any i ≥ L is also > target',
        invariant: 'Remaining feasible pairs lie inside [L, R - 1]',
      },
      {
        step: '04 · Match & Deduplicate',
        condition: 'f(L, R) == target (or fast encounters valid write element)',
        action: 'Record answer, advance pointers, and skip duplicate adjacent values if unique tuples required',
        invariant: 'R - L strictly decreases (or fast strictly increases), guaranteeing termination in ≤ n steps',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Monotonic Pruning Proof (Sorted Pair Sum)',
          formula: 'A[L] + A[R] < T  ⟹  ∀j ≤ R: A[L] + A[j] ≤ A[L] + A[R] < T',
          meaning: 'Proves index L can never participate in any valid pair with the remaining suffix.',
        },
        {
          name: 'Work Bound via Pointer Distance Potential',
          formula: 'Φ(L, R) = R - L,   ΔΦ ≤ -1 per iteration  ⟹  T(n) ≤ n - 1 = O(n)',
          meaning: 'Strictly decreasing nonnegative potential proves linear worst-case time.',
        },
        {
          name: 'Container With Most Water Dominance',
          formula: 'Area(L, R) = (R - L) × min(h[L], h[R])',
          meaning: 'Moving the taller wall cannot increase min(h[L], h[R]) while shrinking width; only moving the shorter wall can improve area.',
        },
      ],
      proofSketch:
        'Each step eliminates either the current left index or right index from all future consideration. Because the eliminated index is mathematically dominated across every remaining partner, the global optimum must survive until L and R meet.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sorted array pair/triplet sum, palindrome check, or in-place partitioning',
        recommendedPattern: 'Two Pointers',
        linkedId: 'two-pointers',
        linkedKind: 'topic',
        whyItFits: 'Monotonic ordering allows O(1)-space pruning in a single pass.',
      },
      {
        ifYouSee: 'Contiguous subarray/substring optimization (longest/shortest window)',
        recommendedPattern: 'Sliding Window',
        linkedId: 'sliding-window',
        linkedKind: 'topic',
        whyItFits: 'Same-direction pointers maintain dynamic window state rather than pair endpoints.',
      },
      {
        ifYouSee: 'Cycle detection or midpoint discovery inside a linked list',
        recommendedPattern: 'Linked Lists (Fast & Slow Pointers)',
        linkedId: 'linked-lists',
        linkedKind: 'topic',
        whyItFits: 'Speed differential (1x vs 2x) finds midpoints and cycles in O(1) space.',
      },
    ],
  },

  'sliding-window': {
    formalDefinition:
      'Sliding Window maintains a dynamic contiguous interval [L, R] over a sequence whose validity predicate is monotonic under expansion and contraction; each index enters once via R and exits at most once via L, yielding O(n) amortized runtime.',
    problemStatementForm:
      'Given an array or string S[0..n-1], find the longest, shortest, or count of contiguous subarrays/substrings satisfying a frequency, distinct-count, or nonnegative-sum constraint.',
    logicBoard: [
      {
        step: '01 · Expand Right Edge',
        condition: 'R < n (next element enters the window)',
        action: 'Incorporate S[R] into window state (sum, frequency map, satisfied counter)',
        invariant: 'Window state accurately reflects the multiset S[L..R]',
      },
      {
        step: '02 · Check Constraint',
        condition: 'Window violates constraint (longest problem) OR satisfies constraint (shortest problem)',
        action: 'Enter inner contraction loop while condition holds',
        invariant: 'Contraction is strictly monotonic: L never moves backwards',
      },
      {
        step: '03 · Shrink Left Edge',
        condition: 'Contraction loop is active and L ≤ R',
        action: 'Remove S[L] from window state, decrement satisfied counts if threshold crossed, set L ← L + 1',
        invariant: 'For shortest window: update answer BEFORE removing S[L]; for longest: update AFTER loop',
      },
      {
        step: '04 · Commit Optimum',
        condition: 'Window [L, R] is valid at current right boundary R',
        action: 'Update best = max/min(best, R - L + 1) or accumulate count += (R - L + 1)',
        invariant: 'Optimal valid window ending at R is captured before advancing R',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Amortized Pointer Movement Bound',
          formula: 'Total moves = ΔR + ΔL ≤ n + n = 2n = O(n)',
          meaning: 'Even with a nested while-loop, each element is added once and removed at most once.',
        },
        {
          name: 'Exactly-K Subarrays Inclusion-Exclusion Identity',
          formula: 'Count(exactly K) = Count(at most K) - Count(at most K - 1)',
          meaning: 'Converts non-monotonic "exact K distinct" counts into two monotonic sliding windows.',
        },
        {
          name: 'Nonnegative Monotonicity Requirement',
          formula: '∀i: A[i] ≥ 0  ⟹  sum(L, R+1) ≥ sum(L, R)  and  sum(L+1, R) ≤ sum(L, R)',
          meaning: 'Required so shrinking L predictably reduces the window sum.',
        },
      ],
      proofSketch:
        'Because validity is hereditary (if [L, R] is invalid for a max-constraint, every super-window [L, R\'] with R\' > R is also invalid), advancing L to the first valid start for R can never skip a valid window ending at any future R\' > R.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Longest/shortest contiguous substring with at most K distinct or frequency match',
        recommendedPattern: 'Sliding Window',
        linkedId: 'sliding-window',
        linkedKind: 'topic',
        whyItFits: 'Window frequency map updates in O(1) as L and R move monotonically.',
      },
      {
        ifYouSee: 'Subarray sum equals K when negative numbers exist in the array',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-diff-array',
        linkedKind: 'topic',
        whyItFits: 'Negative elements break window sum monotonicity; prefix-sum hashing restores O(n).',
      },
      {
        ifYouSee: 'Need maximum or minimum inside every fixed-size window of length K',
        recommendedPattern: 'Queues & Monotonic Deque',
        linkedId: 'queues-monotonic-deque',
        linkedKind: 'topic',
        whyItFits: 'A monotonic deque tracks sliding window extrema in O(1) amortized time.',
      },
    ],
  },

  'prefix-sum-diff-array': {
    formalDefinition:
      'A Prefix Sum array P stores cumulative aggregates P[i] = ∑_{k=0}^{i-1} A[k] to answer arbitrary static range sums in O(1) via subtraction, while its inverse—a Difference Array D—applies batch range increments [L, R] += Δ in O(1) via two boundary updates.',
    problemStatementForm:
      'Given static arrays (1D or 2D) requiring many range sum queries, subarray sum-equals-K counts (including negatives), or offline batch range additions before a single materialization pass.',
    logicBoard: [
      {
        step: '01 · Precompute Prefix',
        condition: 'Static range sum queries or subarray sum matching',
        action: 'Set P[0] = 0 and P[i + 1] = P[i] + A[i] for i = 0..n-1',
        invariant: 'P[r + 1] - P[l] equals the exact sum of A[l..r]',
      },
      {
        step: '02 · Hash Target Diff',
        condition: 'Counting subarrays with sum == K or divisible by K',
        action: 'Seed map M = {0: 1}; at each prefix p, add M[p - K] (or M[((p % K) + K) % K]) to count',
        invariant: 'Seeding {0: 1} accounts for valid subarrays beginning at index 0',
      },
      {
        step: '03 · Difference Update',
        condition: 'Batch range update: add Δ to every element in A[l..r]',
        action: 'Execute D[l] += Δ and (if r + 1 < n) D[r + 1] -= Δ',
        invariant: 'Prefix sum of D reconstructs the exact updated array after all batches',
      },
      {
        step: '04 · Interleaved Updates?',
        condition: 'Point/range updates and range queries are interleaved online',
        action: 'Upgrade from static Prefix Sum to Fenwick Tree (BIT) or Segment Tree',
        invariant: 'Dynamic updates remain O(log n) instead of degrading to O(n) rebuilds',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: '1D Range Sum Telescoping Identity',
          formula: 'sum(l, r) = P[r + 1] - P[l],   where P[0] = 0,  P[i] = ∑_{k=0}^{i-1} A[k]',
          meaning: 'Prefix subtraction cancels A[0..l-1] in O(1) time.',
        },
        {
          name: '2D Inclusion-Exclusion Submatrix Sum',
          formula: 'S(r1,c1,r2,c2) = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]',
          meaning: 'Adds back the top-left rectangle subtracted twice.',
        },
        {
          name: 'Discrete Fundamental Theorem (Prefix ↔ Difference)',
          formula: 'D[0] = A[0],  D[i] = A[i] - A[i-1]  ⟹  ∑_{k=0}^{i} D[k] = A[i]',
          meaning: 'Prefix summation and finite differencing are exact algebraic inverses.',
        },
      ],
      proofSketch:
        'By telescoping cancellation, P[r+1] - P[l] = (A[0]+…+A[r]) - (A[0]+…+A[l-1]) = ∑_{k=l}^{r} A[k]. Because addition forms an abelian group with inverse (-), any invertible associative operation (sum, XOR) supports O(1) prefix queries.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Subarray sum == K or divisible by K with negative values present',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-diff-array',
        linkedKind: 'topic',
        whyItFits: 'Telescoping sum P[j] - P[i] = K holds regardless of sign.',
      },
      {
        ifYouSee: 'Interleaved point updates and range sum/min queries',
        recommendedPattern: 'Segment Trees & Fenwick (BIT)',
        linkedId: 'segment-fenwick-trees',
        linkedKind: 'topic',
        whyItFits: 'Maintains dynamic range aggregates in O(log n) without O(n) prefix rebuilds.',
      },
      {
        ifYouSee: 'Maximum contiguous subarray sum (no target K constraint)',
        recommendedPattern: 'Dynamic Programming (Kadane)',
        linkedId: 'dynamic-programming',
        linkedKind: 'topic',
        whyItFits: 'Only requires tracking the running minimum prefix or best suffix sum in O(1) space.',
      },
    ],
  },

  'stacks-monotonic-stack': {
    formalDefinition:
      'A Stack enforces Last-In-First-Out (LIFO) nesting discipline for paired contexts, while a Monotonic Stack maintains strictly increasing or decreasing values (storing indices) so each pop immediately resolves the Nearest Greater or Smaller Element in O(n) total time.',
    problemStatementForm:
      'Given nested syntax (brackets, expressions, call frames) or an array asking for Next/Previous Greater/Smaller elements, stock spans, histogram rectangles, or trapped rainwater.',
    logicBoard: [
      {
        step: '01 · Inspect Top',
        condition: 'Stack is non-empty and incoming A[i] breaks monotonic order against A[stack.top]',
        action: 'Pop index idx = stack.pop(); current index i is now the exact right boundary for idx',
        invariant: 'Every element remaining in the stack has not yet encountered its right boundary',
      },
      {
        step: '02 · Resolve Popped Span',
        condition: 'An index idx was just popped due to A[i]',
        action: 'Left boundary is stack.top (or -1 if empty); width = i - left - 1',
        invariant: 'A[idx] is strictly the extremum across the open interval (left, i)',
      },
      {
        step: '03 · Push Current Index',
        condition: 'Monotonic invariant is restored with stack.top',
        action: 'Push index i onto the stack (always store indices, not raw values)',
        invariant: 'Stack values remain strictly monotonic from bottom to top',
      },
      {
        step: '04 · Flush Sentinel',
        condition: 'Array iteration finishes with unresolved indices on stack',
        action: 'Append sentinel (-∞ or +∞) or drain remaining indices with right boundary = n',
        invariant: 'Every index is pushed once and popped once → ≤ 2n stack operations',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Amortized Linear Push-Pop Bound',
          formula: '∑_{i=0}^{n-1} (1 push + pops_i) ≤ 2n  ⟹  T(n) = O(n)',
          meaning: 'Each array index enters the stack once and can be popped at most once.',
        },
        {
          name: 'Histogram Maximal Rectangle Span Formula',
          formula: 'Area(idx) = H[idx] × (R_smaller(idx) - L_smaller(idx) - 1)',
          meaning: 'Popping idx at R_smaller reveals both its right and left smaller boundaries simultaneously.',
        },
        {
          name: 'Contribution Sum Over All Subarrays',
          formula: '∑_{all subarrays} min(sub) = ∑_{i=0}^{n-1} A[i] × (i - L_i) × (R_i - i)',
          meaning: 'Break ties strictly on one side (< vs ≤) to avoid double-counting duplicate values.',
        },
      ],
      proofSketch:
        'Suppose stack stores increasing heights. When H[i] < H[top], no element between stack[secondTop] and i can be smaller than H[top] (otherwise it would have already popped top). Thus stack[secondTop] and i are the exact nearest strictly smaller bars on left and right.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Next Greater/Smaller Element, Largest Rectangle in Histogram, or Sum of Subarray Mins',
        recommendedPattern: 'Stacks & Monotonic Stack',
        linkedId: 'stacks-monotonic-stack',
        linkedKind: 'topic',
        whyItFits: 'Resolves both nearest left and right bounds in a single O(n) pass.',
      },
      {
        ifYouSee: 'Need sliding window maximum/minimum with expiration from the left edge',
        recommendedPattern: 'Queues & Monotonic Deque',
        linkedId: 'queues-monotonic-deque',
        linkedKind: 'topic',
        whyItFits: 'Deque adds O(1) front eviction for out-of-window indices.',
      },
      {
        ifYouSee: 'Infix math expression evaluation with operator precedence and parentheses',
        recommendedPattern: 'Shunting-Yard Parser',
        linkedId: 'shunting-yard-parser',
        linkedKind: 'algorithm',
        whyItFits: 'Uses an operator stack governed by precedence and associativity rules.',
      },
    ],
  },

  'queues-monotonic-deque': {
    formalDefinition:
      'A Queue enforces First-In-First-Out (FIFO) level ordering for shortest unweighted traversal, while a Monotonic Deque (double-ended queue) combines back-pruning of dominated elements with front-eviction of expired indices to deliver O(1) sliding window extrema.',
    problemStatementForm:
      'Given a fixed-size sliding window, bounded-jump DP transition, or unweighted shortest-path/multi-source propagation problem requiring FIFO or sliding-max/min tracking.',
    logicBoard: [
      {
        step: '01 · Evict Expired Front',
        condition: 'Deque is non-empty and deque.front ≤ i - k (outside current window)',
        action: 'Pop index from front of deque (deque.popFront())',
        invariant: 'All indices inside the deque belong to the active window [i - k + 1, i]',
      },
      {
        step: '02 · Prune Dominated Back',
        condition: 'Deque is non-empty and A[deque.back] ≤ A[i] (for sliding max; ≥ for sliding min)',
        action: 'Pop from back (deque.popBack()) because older smaller value can never beat A[i]',
        invariant: 'Deque stays strictly monotonic in value AND strictly increasing in index',
      },
      {
        step: '03 · Push Candidate',
        condition: 'Dominated tail elements removed',
        action: 'Push index i to the back of the deque',
        invariant: 'deque.front holds the exact optimum index for the current window',
      },
      {
        step: '04 · Emit Window Answer',
        condition: 'i ≥ k - 1 (first full window reached)',
        action: 'Record A[deque.front] as the window answer',
        invariant: 'Total deque operations across n steps ≤ 2n → O(n) time, O(k) space',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dominance Elimination Criterion',
          formula: 'j < i  ∧  A[j] ≤ A[i]  ⟹  ∀W ⊇ {i}: max(W) ≠ A[j] (unless tied)',
          meaning: 'Since index i is both larger AND expires later than j, j is permanently obsolete.',
        },
        {
          name: 'Monotonic Queue DP Optimization',
          formula: 'dp[i] = cost[i] + min_{i - k ≤ j < i} dp[j]   (O(nk) → O(n))',
          meaning: 'Replaces an O(k) inner minimization loop with O(1) amortized deque lookup.',
        },
      ],
      proofSketch:
        'Each element is appended to the deque back exactly once and removed from either front or back at most once. Because deque values are strictly decreasing from front to back while indices strictly increase, the front is guaranteed to be the maximum valid index in [i-k+1, i].',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sliding window maximum/minimum or Jump Game with bounded step size K',
        recommendedPattern: 'Queues & Monotonic Deque',
        linkedId: 'queues-monotonic-deque',
        linkedKind: 'topic',
        whyItFits: 'Maintains window extrema in O(1) amortized time instead of O(log k) heap overhead.',
      },
      {
        ifYouSee: 'Need arbitrary rank (median or Kth element) inside a sliding window',
        recommendedPattern: 'Heaps & Priority Queues (Dual Heaps)',
        linkedId: 'heaps-priority-queues',
        linkedKind: 'topic',
        whyItFits: 'Monotonic deque only tracks min/max; dual heaps with lazy deletion track medians.',
      },
      {
        ifYouSee: 'Weighted graph edges are exclusively 0 or 1',
        recommendedPattern: '0-1 BFS',
        linkedId: 'zero-one-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Deque push-front (weight 0) and push-back (weight 1) beats Dijkstra in O(V + E).',
      },
    ],
  },

  'sorting-algorithms': {
    formalDefinition:
      'Sorting reorders a sequence A[0..n-1] into non-decreasing order under a total comparator (≤); comparison-based sorts obey an Ω(n log n) information-theoretic lower bound, while integer/fixed-radix sorts exploit key structure to reach O(n + k) linear time.',
    problemStatementForm:
      'Given unsorted items, intervals, or custom priority rules where establishing global order enables O(n) sweeping, binary search, duplicate adjacency, or greedy selection.',
    logicBoard: [
      {
        step: '01 · Inspect Key Domain',
        condition: 'Keys are bounded small integers [0..K] or fixed-length strings/digits',
        action: 'Choose Counting Sort / Radix Sort for O(n + K) or O(d(n + b)) non-comparison sorting',
        invariant: 'Stable counting pass preserves relative order of earlier radix digits',
      },
      {
        step: '02 · Check Stability & Worst-Case',
        condition: 'Need guaranteed O(n log n) AND stability (or sorting linked lists / counting inversions)',
        action: 'Use Merge Sort (divide, sort halves, linear stable merge)',
        invariant: 'Merge combines two sorted halves in O(n) while counting cross-half inversions',
      },
      {
        step: '03 · Need In-Place Speed or Kth Order',
        condition: 'Memory constrained or only the Kth largest/smallest element is needed',
        action: 'Use Randomized QuickSort / QuickSelect (or HeapSort for guaranteed O(1) space O(n log n))',
        invariant: 'After partition, pivot sits at its final sorted rank with left ≤ pivot ≤ right',
      },
      {
        step: '04 · Custom Comparator Transitivity',
        condition: 'Problem asks for largest concatenated number, interval merge, or custom scheduling',
        action: 'Verify comparator defines a strict weak ordering (irreflexive, asymmetric, transitive)',
        invariant: 'Pairwise dominance (a+b > b+a) guarantees a consistent global optimum',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Comparison Sorting Lower Bound (Decision Tree + Stirling)',
          formula: 'h ≥ ⌈log₂(n!)⌉ = Ω(n log n)',
          meaning: 'A binary decision tree must distinguish all n! permutations, requiring ≥ n log₂ n - 1.44n comparisons.',
        },
        {
          name: 'Merge Sort Recurrence (Master Theorem Case 2)',
          formula: 'T(n) = 2T(n/2) + Θ(n)  ⟹  T(n) = Θ(n log n)',
          meaning: 'Balanced log₂ n recursion levels each performing Θ(n) merge work.',
        },
        {
          name: 'Radix Sort Complexity',
          formula: 'T(n) = O(d · (n + b)),   d = ⌊log_b(maxVal)⌋ + 1',
          meaning: 'Choosing base b = n yields O(n) linear time for polynomial-bounded keys.',
        },
      ],
      proofSketch:
        'Every deterministic comparison sort corresponds to a binary tree with at least n! leaves. A binary tree of height h has at most 2^h leaves, so 2^h ≥ n! ⟹ h ≥ log₂(n!) = Θ(n log n). Non-comparison sorts bypass this by using keys as direct array addresses.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Overlapping intervals (merge, meeting rooms, minimum arrows)',
        recommendedPattern: 'Sort + Sweep / Heap Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Sorting by start or end time turns 2D overlap checks into a linear scan.',
      },
      {
        ifYouSee: 'Count inversions or count smaller numbers after self',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Every right-half pick during merge contributes (mid - i + 1) inversions.',
      },
      {
        ifYouSee: 'Array contains numbers strictly in range [1..n] or [0..n]',
        recommendedPattern: 'Cyclic Sort',
        linkedId: 'cyclic-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Places each value v at index v - 1 in O(n) time and O(1) space.',
      },
    ],
  },

  'linked-lists': {
    formalDefinition:
      'A Linked List represents a linear sequence of heap-allocated nodes linked by explicit next/prev pointers, supporting O(1) structural rewiring (insertion, deletion, splicing, in-place reversal) once positioned, at the cost of O(n) random access.',
    problemStatementForm:
      'Given singly or doubly linked nodes, reverse segments in-place, detect/locate cycles, merge sorted chains, or implement O(1) eviction structures like LRU/LFU caches.',
    logicBoard: [
      {
        step: '01 · Guard Head Edge Cases',
        condition: 'Head node itself may be deleted, inserted before, or reversed',
        action: 'Allocate sentinel dummy node with dummy.next = head; operate relative to prev',
        invariant: 'dummy.next always points to the true head, eliminating null-head special cases',
      },
      {
        step: '02 · Three-Pointer Reversal',
        condition: 'Reversing a list or sub-segment in O(1) extra space',
        action: 'Save next = curr.next, rewire curr.next = prev, advance prev = curr, curr = next',
        invariant: 'prev heads the reversed prefix; curr heads the untouched suffix',
      },
      {
        step: '03 · Fast & Slow Tortoise/Hare',
        condition: 'Finding midpoint, Kth-from-end, or cycle detection/entry',
        action: 'Advance slow by 1 and fast by 2 (or give fast a K-node head start)',
        invariant: 'If a cycle exists, fast laps slow inside the cycle in ≤ μ + λ steps',
      },
      {
        step: '04 · O(1) Node Deletion',
        condition: 'Hash Map points directly to nodes needing O(1) move-to-front or removal',
        action: 'Use Doubly Linked List with dummy head & tail; rewire node.prev.next and node.next.prev',
        invariant: 'Adjacent links stay symmetric after every detach and insert',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Floyd Cycle Entry Modular Identity',
          formula: '2(μ + x) = μ + x + kλ  ⟹  μ = kλ - x  ≡  (λ - x) (mod λ)',
          meaning: 'Distance μ from head to cycle entry equals remaining steps from meeting point x around the cycle of length λ.',
        },
        {
          name: 'Intersection Two-Pointer Equalization',
          formula: 'dist(A→B) = a + c + b = b + c + a = dist(B→A)',
          meaning: 'Redirecting each exhausted pointer to the other head forces both pointers to align at the shared tail.',
        },
      ],
      proofSketch:
        'When slow enters a cycle of length λ after μ steps, fast is already inside at offset μ mod λ. Each step decreases their modular gap by 1, so they must meet within λ steps. Resetting one pointer to head and moving both at speed 1 guarantees collision at the exact cycle entry after μ steps.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Cycle detection, cycle entry node, or duplicate number in [1..n] with O(1) space',
        recommendedPattern: 'Fast & Slow Pointers (Floyd)',
        linkedId: 'fast-slow-pointers',
        linkedKind: 'algorithm',
        whyItFits: 'Functional graph f(i) = nums[i] has a cycle whose entry is the duplicate value.',
      },
      {
        ifYouSee: 'Reverse K-group, palindrome linked list, or reorder list in-place',
        recommendedPattern: 'In-Place Linked List Reversal',
        linkedId: 'linked-list-reversal',
        linkedKind: 'algorithm',
        whyItFits: 'Combines midpoint discovery with O(1)-space 3-pointer rewiring.',
      },
      {
        ifYouSee: 'O(1) get/put cache with recency or frequency eviction',
        recommendedPattern: 'Cache Replacement (LRU / LFU / ARC)',
        linkedId: 'cache-lru-lfu-arc',
        linkedKind: 'algorithm',
        whyItFits: 'Pairs a Hash Map for O(1) lookup with a Doubly Linked List for O(1) recency splicing.',
      },
    ],
  },

  'binary-search': {
    formalDefinition:
      'Binary Search partitions any totally ordered domain [lo, hi] where a boolean feasibility predicate P(x) is monotonic (False…False, True…True), halving the candidate search space on every probe to locate the exact transition boundary in O(log(hi - lo)) evaluations.',
    problemStatementForm:
      'Given a sorted array, rotated sorted array, unimodal peak, or optimization prompt ("minimize the maximum..." / "maximize the minimum..."), locate the exact boundary value satisfying P(x).',
    logicBoard: [
      {
        step: '01 · Define Monotonic P(x)',
        condition: 'Target is an array index OR an answer value in [lo, hi]',
        action: 'Formulate boolean predicate feasible(mid) such that P is F…F T…T (or T…T F…F)',
        invariant: 'Answer is guaranteed to lie inside the active search interval [lo, hi]',
      },
      {
        step: '02 · Overflow-Safe Midpoint',
        condition: 'lo < hi (boundary template) or lo <= hi (exact match template)',
        action: 'Compute mid = lo + Math.floor((hi - lo) / 2) (use upper-mid when setting lo = mid)',
        invariant: 'Interval strictly shrinks on every branch, preventing infinite loops when hi = lo + 1',
      },
      {
        step: '03 · Branch on Predicate',
        condition: 'feasible(mid) is True (searching for first True)',
        action: 'Keep mid as candidate: set hi = mid (else discard mid: lo = mid + 1)',
        invariant: 'First True remains inside [lo, hi] after every halving step',
      },
      {
        step: '04 · Converge & Verify',
        condition: 'lo == hi',
        action: 'Return lo (after checking boundary validity if target might not exist)',
        invariant: 'Converges in at most ⌈log₂(hi - lo + 1)⌉ predicate evaluations',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Search Space Halving Recurrence',
          formula: 'T(N) = T(N/2) + C_pred  ⟹  T(N) = O(C_pred · log₂ N)',
          meaning: 'Even for N = 10¹⁸, at most 60 predicate checks are needed.',
        },
        {
          name: 'Binary Search on Answer Monotonicity',
          formula: 'feasible(x) = True  ⟹  ∀y > x: feasible(y) = True',
          meaning: 'Monotonic feasibility lets us search the answer space without sorting or enumerating outputs.',
        },
        {
          name: 'Integer Overflow-Safe Midpoint',
          formula: 'mid = lo + ⌊(hi - lo) / 2⌋   (upper-mid: lo + ⌊(hi - lo + 1) / 2⌋)',
          meaning: 'Prevents 32-bit signed integer overflow when lo + hi > 2³¹ - 1.',
        },
      ],
      proofSketch:
        'Let W_k = hi - lo + 1 be the interval width after k iterations. Since mid splits W_k into halves of size ≤ ⌈W_k / 2⌉, after k = ⌈log₂ W_0⌉ iterations W_k = 1. By induction on the invariant that the boundary lies in [lo, hi], the final single element is the exact transition point.',
    },
    patternRecommendations: [
      {
        ifYouSee: '"Minimize the maximum..." or "Maximize the minimum..." with an O(n) greedy feasibility check',
        recommendedPattern: 'Binary Search on Answer',
        linkedId: 'binary-search',
        linkedKind: 'algorithm',
        whyItFits: 'Turns an optimization problem into O(log(range)) yes/no feasibility queries.',
      },
      {
        ifYouSee: 'Uniformly distributed huge sorted numeric dataset',
        recommendedPattern: 'Interpolation Search',
        linkedId: 'interpolation-search',
        linkedKind: 'algorithm',
        whyItFits: 'Estimates probe position proportionally to reach O(log log n) expected time.',
      },
      {
        ifYouSee: 'Longest Increasing Subsequence in O(n log n)',
        recommendedPattern: 'LIS & Patience Sorting',
        linkedId: 'lis-patience-sorting',
        linkedKind: 'algorithm',
        whyItFits: 'Binary searches the smallest tail value ≥ x to maintain active pile tops.',
      },
    ],
  },

  'trees-bst-nary': {
    formalDefinition:
      'A Rooted Tree is a connected acyclic graph of n nodes and n - 1 edges with a unique path between any two nodes; a Binary Search Tree (BST) further enforces the ordering invariant left.val < node.val < right.val for O(h) ordered queries.',
    problemStatementForm:
      'Given a hierarchical binary, BST, or N-ary tree, aggregate subtree properties (height, diameter, path sums), serialize/reconstruct structure, traverse by level, or find Lowest Common Ancestors.',
    logicBoard: [
      {
        step: '01 · Base Null Case',
        condition: 'node === null',
        action: 'Return identity element (0 for height/sum, true for validity, null for search)',
        invariant: 'Empty subtree satisfies all structural and aggregate identities cleanly',
      },
      {
        step: '02 · Choose Direction (Top-Down vs Bottom-Up)',
        condition: 'Need ancestor context (bounds/path) vs. child aggregation (diameter/LCA/balance)',
        action: 'Pass bounds (min, max) downward (Pre-order) OR compute left/right first (Post-order)',
        invariant: 'Each node is visited once in O(n) total time and O(h) stack space',
      },
      {
        step: '03 · Separate Return vs Global Best',
        condition: 'Path can bend through a node (diameter, max path sum) without returning both branches',
        action: 'Update globalBest with left + right + val, but return ONLY max(left, right) + val to parent',
        invariant: 'Returned value always represents a single non-forking path extendable by parent',
      },
      {
        step: '04 · Level-Order BFS Switch',
        condition: 'Query asks for right-side view, minimum depth, zigzag levels, or level averages',
        action: 'Use FIFO Queue; snapshot levelSize = queue.length at the start of each level loop',
        invariant: 'All nodes popped during one outer iteration share the exact same depth d',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Tree Edge-Vertex Identity',
          formula: '|E| = |V| - 1   (connected ∧ acyclic)',
          meaning: 'Any connected graph with n nodes and n-1 edges is a tree with unique paths.',
        },
        {
          name: 'Balanced vs Skewed Height Bounds',
          formula: '⌊log₂ n⌋ ≤ h ≤ n - 1',
          meaning: 'Unbalanced BST degrades to O(n); self-balancing trees (AVL/Red-Black) enforce h = Θ(log n).',
        },
        {
          name: 'BST In-Order Ordering Theorem',
          formula: 'InOrder(T) is strictly sorted  ⟺  T is a valid BST',
          meaning: 'Validates BSTs and finds Kth smallest elements in O(h + k) time.',
        },
      ],
      proofSketch:
        'Structural induction: every property P(T) holds for the empty tree and, assuming P(T_left) and P(T_right) hold after recursive post-order calls, combining them at the root establishes P(T). Because each edge is traversed once downward and once upward, total work is Θ(n).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Path sum, diameter, subtree validation, or level-order views',
        recommendedPattern: 'Tree BFS & DFS Traversals',
        linkedId: 'tree-bfs-dfs',
        linkedKind: 'algorithm',
        whyItFits: 'Post-order aggregates subtree values; BFS groups exact depth levels.',
      },
      {
        ifYouSee: 'Repeated LCA or Kth-ancestor queries on a static tree',
        recommendedPattern: 'Binary Lifting & LCA',
        linkedId: 'binary-lifting-lca',
        linkedKind: 'algorithm',
        whyItFits: 'Precomputes 2^j jump pointers for O(log n) ancestor and LCA queries.',
      },
      {
        ifYouSee: 'Need answer computed for EVERY node treated as the root',
        recommendedPattern: 'DP on Trees & Rerooting',
        linkedId: 'dp-on-trees-rerooting',
        linkedKind: 'algorithm',
        whyItFits: 'Two-pass DFS shifts the root in O(1) per edge for O(n) total time.',
      },
    ],
  },

  'tries-radix': {
    formalDefinition:
      'A Trie (Prefix Tree) indexes a dictionary of strings over alphabet Σ by sharing common prefix edges from the root, giving O(L) lookup/insert independent of dictionary size N; a Radix Tree compresses single-child chains into edge substrings.',
    problemStatementForm:
      'Given a dictionary of words and prefix queries, autocomplete lookups, wildcard search, word-board pruning, or maximum pairwise XOR over fixed-width integers.',
    logicBoard: [
      {
        step: '01 · Character/Bit Dispatch',
        condition: 'Processing character c = word[i] (or bit b = (num >> k) & 1 for Bitwise Trie)',
        action: 'Check node.children[c]; allocate child node if inserting, or abort false if searching',
        invariant: 'Depth d along any root-to-node path encodes the exact length-d prefix',
      },
      {
        step: '02 · Mark Terminal & Counts',
        condition: 'Reached end of word (i === word.length)',
        action: 'Set node.isWord = true (and maintain prefixCount / wordRef for autocomplete or deletion)',
        invariant: 'isWord distinguishes complete dictionary entries from mere prefixes',
      },
      {
        step: '03 · Prune Dead Branches',
        condition: 'Combined with DFS/Backtracking (e.g., Word Search II)',
        action: 'Immediately terminate DFS when board cell char is absent from current trie node children',
        invariant: 'Eliminates exponential search subtrees that cannot match any dictionary word',
      },
      {
        step: '04 · Opposite-Bit Greedy (XOR Trie)',
        condition: 'Maximizing num ⊕ y using a 31-bit MSB-first Binary Trie',
        action: 'Prefer child branch (1 - bit) whenever present; otherwise fall back to bit',
        invariant: 'Higher-order bit gain 2^k strictly outweighs the sum of all lower bits 2^k - 1',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dictionary-Size-Independent Latency',
          formula: 'T_search(L) = O(L),   independent of N = |dictionary|',
          meaning: 'Unlike hash tables or BSTs over strings, lookup does not re-hash or compare multiple keys.',
        },
        {
          name: 'Prefix Sharing Space Bound',
          formula: 'Nodes ≤ 1 + ∑_{w ∈ D} |w|,   Space = O(Nodes × |Σ|)',
          meaning: 'Use hash-map children or Radix compression when alphabet |Σ| is large and sparse.',
        },
        {
          name: 'MSB Bitwise Dominance (Max XOR Trie)',
          formula: '2^k > ∑_{j=0}^{k-1} 2^j = 2^k - 1',
          meaning: 'Greedy bit-by-bit selection from MSB to LSB guarantees the global maximum XOR.',
        },
      ],
      proofSketch:
        'Each string of length L maps to a unique deterministic path of L transitions from the root. Prefix queries descend once in O(L) and inspect only the subtree rooted at that prefix node, guaranteeing zero false-positive prefix scans.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Autocomplete, prefix counts, wildcard "." dictionary matching, or IP routing',
        recommendedPattern: 'Trie Prefix Search & Auto-Complete',
        linkedId: 'trie-prefix-autocomplete',
        linkedKind: 'algorithm',
        whyItFits: 'Shared prefix edges turn startsWith and wildcard DFS into O(L) traversals.',
      },
      {
        ifYouSee: 'Search a 2D letter grid for hundreds of dictionary words simultaneously',
        recommendedPattern: 'Backtracking + Trie Pruning',
        linkedId: 'backtracking-trie',
        linkedKind: 'algorithm',
        whyItFits: 'One grid traversal matches all words simultaneously by stepping down the Trie.',
      },
      {
        ifYouSee: 'Scan a single long text for thousands of fixed patterns simultaneously',
        recommendedPattern: 'Aho-Corasick Multi-Pattern Matching',
        linkedId: 'aho-corasick',
        linkedKind: 'algorithm',
        whyItFits: 'Adds KMP-style failure links to a Trie for linear O(n + m + z) multi-pattern matching.',
      },
    ],
  },

  'heaps-priority-queues': {
    formalDefinition:
      'A Binary Heap is a complete binary tree stored compactly in an array satisfying the heap-order invariant (parent ≤ children for min-heap), providing O(1) extremum peek, O(log n) push/pop, and O(n) Floyd bottom-up construction.',
    problemStatementForm:
      'Given a stream or collection requiring repeated extraction of the current minimum/maximum, Top-K largest/smallest elements, K-way sorted merging, greedy task scheduling, or streaming median maintenance.',
    logicBoard: [
      {
        step: '01 · Choose Heap Polarity',
        condition: 'Keeping Top-K LARGEST elements vs. Top-K SMALLEST elements',
        action: 'Use a Min-Heap of size K to evict smallest (keeps K largest); Max-Heap of size K for K smallest',
        invariant: 'Heap root is the exact Kth boundary threshold; size stays capped at K',
      },
      {
        step: '02 · Sift-Up on Insert',
        condition: 'New element appended at index i violates heap order with parent ⌊(i-1)/2⌋',
        action: 'Swap with parent repeatedly until root reached or heap property restored',
        invariant: 'Complete tree shape and ancestor heap order preserved in O(log n)',
      },
      {
        step: '03 · Sift-Down on Extract',
        condition: 'Root popped; last element moved to index 0',
        action: 'Swap root with its smaller (min-heap) child repeatedly until leaf or valid',
        invariant: 'Minimum element is restored at index 0 in O(log n)',
      },
      {
        step: '04 · Dual-Heap Balance (Median)',
        condition: 'Streaming median requires both lower and upper half boundaries',
        action: 'Keep Max-Heap (lower half) and Min-Heap (upper half) with |maxH| - |minH| ∈ {0, 1}',
        invariant: 'Median is maxH.top (odd n) or (maxH.top + minH.top) / 2 (even n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Array Index Navigation (0-Indexed Complete Tree)',
          formula: 'parent(i) = ⌊(i - 1)/2⌋,   left(i) = 2i + 1,   right(i) = 2i + 2',
          meaning: 'Zero pointer overhead and high CPU cache locality.',
        },
        {
          name: 'Floyd Bottom-Up Build-Heap Linear Proof',
          formula: '∑_{h=0}^{⌊log₂ n⌋} ⌈n / 2^{h+1}⌉ · O(h) ≤ n · ∑_{h=0}^{∞} h / 2^{h+1} = n = O(n)',
          meaning: 'Most nodes sit near the leaves with tiny sift-down heights, beating O(n log n) insertion.',
        },
        {
          name: 'Top-K Streaming Complexity',
          formula: 'T(n, k) = O(n log k),   Space = O(k)',
          meaning: 'Strictly faster and leaner than O(n log n) full sorting when k ≪ n.',
        },
      ],
      proofSketch:
        'Using the series identity ∑_{h=1}^{∞} h·x^h = x / (1-x)² at x = 1/2 yields ∑ h / 2^h = 2. Since at most ⌈n / 2^{h+1}⌉ nodes have subtree height h, bottom-up heapify performs at most 2n swaps in total.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Top-K frequent/closest elements, merge K sorted lists, or meeting rooms',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Maintains the earliest-ending resource or smallest active candidate in O(log k).',
      },
      {
        ifYouSee: 'Continuous median of a data stream or sliding window median',
        recommendedPattern: 'Two-Heap Median Maintenance',
        linkedId: 'dual-heaps-median',
        linkedKind: 'algorithm',
        whyItFits: 'Balances lower Max-Heap and upper Min-Heap for O(1) median queries.',
      },
      {
        ifYouSee: 'Non-negative weighted shortest path in a graph',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Min-Heap extracts the globally settled minimum-distance frontier vertex.',
      },
    ],
  },

  'recursion-divide-conquer': {
    formalDefinition:
      'Divide & Conquer decomposes a problem of size n into a ≥ 1 independent subproblems of size n/b, solves them recursively down to base cases, and combines sub-results in f(n) work; asymptotic runtime is governed by the Master Theorem.',
    problemStatementForm:
      'Given a problem exhibiting self-similar subproblems (sorting, inversion counting, fast exponentiation, tree construction, closest pair of points, or matrix multiplication).',
    logicBoard: [
      {
        step: '01 · Anchor Base Case',
        condition: 'Input size n ≤ 1 (or l >= r)',
        action: 'Return trivial answer immediately without recursive spawning',
        invariant: 'Recursion strictly reduces problem measure on every branch, ensuring termination',
      },
      {
        step: '02 · Divide Cleanly',
        condition: 'Problem size n > 1',
        action: 'Split domain at mid = l + ⌊(r - l) / 2⌋ into disjoint subproblems',
        invariant: 'Subproblems do not overlap (if they overlap, add memoization / DP)',
      },
      {
        step: '03 · Trust Recursive Contract',
        condition: 'Subproblem calls solve(l, mid) and solve(mid + 1, r) return',
        action: 'Assume both sub-results strictly satisfy the postcondition contract',
        invariant: 'Inductive hypothesis removes the need to mentally unroll deep call stacks',
      },
      {
        step: '04 · Combine Cross-Boundary',
        condition: 'Left and right answers computed',
        action: 'Merge sorted halves or compute cross-midpoint contributions in f(n) work',
        invariant: 'Combined result covers left-only, right-only, and cross-boundary cases completely',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Master Theorem Recurrence',
          formula: 'T(n) = a · T(n / b) + f(n),   c_crit = log_b(a)',
          meaning: 'Compare f(n) against n^{log_b a} to classify root-heavy, balanced, or leaf-heavy cost.',
        },
        {
          name: 'Master Theorem Three Regimes',
          formula: 'f = O(n^{c-ε}) ⇒ Θ(n^c)  |  f = Θ(n^c log^k n) ⇒ Θ(n^c log^{k+1} n)  |  f = Ω(n^{c+ε}) ⇒ Θ(f(n))',
          meaning: 'Instantly yields Merge Sort O(n log n), Binary Search O(log n), and Strassen O(n^{2.81}).',
        },
        {
          name: 'Call Stack Memory Bound',
          formula: 'Space_stack = O(depth) = O(log_b n)  (balanced split)',
          meaning: 'Only one active root-to-leaf path resides on the call stack at any instant.',
        },
      ],
      proofSketch:
        'Expanding the recursion tree of depth log_b n shows level j contains a^j subproblems of size n / b^j, doing a^j · f(n / b^j) work. Summing the geometric series across all levels proves the three Master Theorem regimes.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Count inversions, reverse pairs, or stable O(n log n) sorting',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Linear merge step counts cross-half pairs while maintaining sorted halves.',
      },
      {
        ifYouSee: 'Subproblems overlap repeatedly (same arguments recomputed)',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'topic',
        whyItFits: 'Memoization collapses exponential recursion trees into polynomial DAG evaluations.',
      },
      {
        ifYouSee: 'Need to enumerate ALL valid subsets, permutations, or constraint boards',
        recommendedPattern: 'Backtracking',
        linkedId: 'backtracking',
        linkedKind: 'topic',
        whyItFits: 'Explores the decision tree with choose-explore-unchoose pruning.',
      },
    ],
  },

  backtracking: {
    formalDefinition:
      'Backtracking performs a depth-first search over an implicit state-space decision tree, incrementally extending partial candidates and immediately pruning branches that violate problem constraints, restoring state upon return (choose → explore → unchoose).',
    problemStatementForm:
      'Given small constraints (typically n ≤ 20) asking to enumerate ALL valid subsets, permutations, combinations, partitions, N-Queens placements, or Sudoku completions.',
    logicBoard: [
      {
        step: '01 · Goal Check',
        condition: 'Partial candidate reaches target depth/sum/completion',
        action: 'Push a DEEP COPY [...path] into results and return',
        invariant: 'Copying prevents subsequent unchoose mutations from corrupting saved answers',
      },
      {
        step: '02 · Prune & Deduplicate',
        condition: 'Remaining sum < 0, constraint violated, OR (i > start && nums[i] === nums[i-1])',
        action: 'Skip/break immediately (requires sorting input first for duplicate skipping)',
        invariant: 'Every generated branch represents a distinct, constraint-feasible partial state',
      },
      {
        step: '03 · Choose & Mark',
        condition: 'Candidate choice c passes validity checks',
        action: 'Append c to path and mark used[c] / col / diag bitmasks',
        invariant: 'State reflects active choice before descending to depth + 1',
      },
      {
        step: '04 · Unchoose (Backtrack)',
        condition: 'Recursive explore() returns from child subtree',
        action: 'Pop c from path and clear used[c] / bitmask flags symmetrically',
        invariant: 'State is byte-for-byte identical to before step 03, ready for next sibling',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Combinatorial Search Tree Sizes',
          formula: 'Subsets: 2^n   |   Combinations: C(n, k) = n! / (k!(n-k)!)   |   Permutations: n!',
          meaning: 'Explains why n ≤ 20 signals subset backtracking and n ≤ 10 signals permutation backtracking.',
        },
        {
          name: 'Diagonal Bitmask Encoding (N-Queens)',
          formula: 'mainDiag = row - col + n,   antiDiag = row + col',
          meaning: 'Compresses conflict checks from O(n) board scans into O(1) bit operations.',
        },
        {
          name: 'Output-Copy Work Bound',
          formula: 'T(n) = O(#valid_states × copy_cost) = O(n · 2^n)  or  O(n · n!)',
          meaning: 'Total runtime includes copying each leaf solution of length O(n).',
        },
      ],
      proofSketch:
        'By soundness of constraint pruning, any partial assignment violating a monotonic constraint cannot be extended into a valid full solution. Complete DFS over surviving branches visits every valid leaf exactly once when canonical ordering (index start or sorted dedup) breaks symmetry.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Enumerate all combinations, subsets, permutations, or N-Queens with n ≤ 20',
        recommendedPattern: 'Backtracking',
        linkedId: 'backtracking',
        linkedKind: 'topic',
        whyItFits: 'All-solutions output inherently requires traversing the pruned decision tree.',
      },
      {
        ifYouSee: 'Only asks for the COUNT or OPTIMAL VALUE (not the actual list of paths)',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'topic',
        whyItFits: 'Avoids exponential path enumeration by caching identical subproblem states.',
      },
      {
        ifYouSee: 'n ≈ 35–42 subset-sum where 2^n is too large but 2^(n/2) fits',
        recommendedPattern: 'Meet-in-the-Middle',
        linkedId: 'meet-in-the-middle',
        linkedKind: 'algorithm',
        whyItFits: 'Splits search into two 2^(n/2) halves joined via sorting + binary search.',
      },
    ],
  },

  'greedy-algorithms': {
    formalDefinition:
      'A Greedy Algorithm constructs a global optimum by committing to a locally optimal choice at every step without backtracking, valid if and only if the problem satisfies both the Greedy-Choice Property and Optimal Substructure.',
    problemStatementForm:
      'Given intervals, jobs, gas stations, jump ranges, or prefix codes where sorting by an explicit dominance metric (earliest end time, smallest frequency, highest ratio) allows single-pass commitment.',
    logicBoard: [
      {
        step: '01 · Order by Dominance Key',
        condition: 'Items lack natural order (intervals, jobs, Huffman frequencies)',
        action: 'Sort by the provably dominant criterion (e.g., earliest end time, profit/weight ratio)',
        invariant: 'First available item maximizes remaining capacity for all future items',
      },
      {
        step: '02 · Commit Local Optimum',
        condition: 'Next candidate satisfies feasibility constraint against current state',
        action: 'Select candidate irreversibly and update frontier (e.g., lastEnd, maxReach, fuel)',
        invariant: 'There exists an optimal global solution that extends our current prefix',
      },
      {
        step: '03 · Exchange Argument Audit',
        condition: 'Testing whether greedy is valid (before coding!)',
        action: 'Try swapping the first differing choice in an optimal solution with the greedy choice',
        invariant: 'If swap never worsens the objective and preserves feasibility, greedy is proven',
      },
      {
        step: '04 · Counterexample Abort',
        condition: 'A small counterexample breaks greedy (e.g., Coin Change {1, 3, 4} for 6)',
        action: 'Immediately pivot from Greedy to Dynamic Programming',
        invariant: 'Never ship an unproven greedy heuristic when subproblems interact',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Exchange Argument Proof Template',
          formula: 'OPT = {o_1, …, o_k}  ⇒  OPT\' = (OPT \\ {o_1}) ∪ {g_1}  s.t.  feasible(OPT\') ∧ val(OPT\') ≥ val(OPT)',
          meaning: 'Proves mathematically that greedy stays ahead of or matches every optimal solution.',
        },
        {
          name: 'Greedy Stays Ahead Induction (Interval Scheduling)',
          formula: 'finish(g_r) ≤ finish(o_r)   ∀r ≥ 1',
          meaning: 'Picking earliest finish time leaves the largest possible suffix for remaining intervals.',
        },
        {
          name: 'Matroid / Exchange Structure',
          formula: 'I ∈ ℐ, J ∈ ℐ, |I| < |J|  ⟹  ∃x ∈ J \\ I : I ∪ {x} ∈ ℐ',
          meaning: 'Guarantees greedy finds maximum-weight bases (e.g., Kruskal MST on graphic matroids).',
        },
      ],
      proofSketch:
        'Suppose greedy picks choice g_1 first, and let OPT be any optimal solution whose first choice is o_1 ≠ g_1. Replacing o_1 with g_1 produces a feasible solution OPT\' with cost no worse than OPT. By induction on the remaining subproblem, greedy matches OPT.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Non-overlapping intervals, jump reachability, or gas station circular tour',
        recommendedPattern: 'Greedy Algorithms',
        linkedId: 'greedy-algorithms',
        linkedKind: 'algorithm',
        whyItFits: 'Exchange argument holds cleanly, achieving O(n) or O(n log n) time.',
      },
      {
        ifYouSee: 'Minimum-cost prefix-free encoding or merging stones/ropes by cost',
        recommendedPattern: 'Huffman Coding',
        linkedId: 'huffman-coding',
        linkedKind: 'algorithm',
        whyItFits: 'Repeatedly merging the two lowest-weight nodes minimizes weighted path length.',
      },
      {
        ifYouSee: 'Arbitrary coin denominations or 0/1 Knapsack where local choice traps future capacity',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'topic',
        whyItFits: 'DP evaluates all reachable capacity states when exchange argument fails.',
      },
    ],
  },

  'graphs-traversal-dsu': {
    formalDefinition:
      'A Graph G = (V, E) models entities V and pairwise relationships E (directed/undirected, weighted/unweighted); BFS explores by hop-distance layers, DFS exposes cycle/component/DAG structure, Dijkstra/Bellman-Ford compute shortest paths, and DSU tracks dynamic connectivity in near-O(1) time.',
    problemStatementForm:
      'Given vertices and edges (or an implicit 2D grid / word-transformation / dependency graph), find shortest paths, connected components, cycles, topological orderings, or minimum spanning trees.',
    logicBoard: [
      {
        step: '01 · Classify Edge Weights',
        condition: 'Unweighted vs. 0/1 vs. non-negative weights vs. negative weights',
        action: 'Select BFS (unweighted) · 0-1 BFS (deque) · Dijkstra (min-heap) · Bellman-Ford (negative)',
        invariant: 'Shortest-path engine strictly matches edge-weight assumptions',
      },
      {
        step: '02 · Track Visitation State',
        condition: 'Undirected traversal vs. Directed cycle detection',
        action: 'Use 2-state visited (undirected) OR 3-color {0:Unvisited, 1:Visiting, 2:Done} (directed)',
        invariant: 'Back-edge to a Visiting (gray) node proves a directed cycle',
      },
      {
        step: '03 · Topological DAG Peel',
        condition: 'Prerequisite ordering / dependency scheduling on directed graph',
        action: 'Enqueue inDegree == 0 nodes (Kahn BFS); decrement neighbor inDegrees on pop',
        invariant: 'Visited count < |V| if and only if the graph contains a cycle',
      },
      {
        step: '04 · Dynamic Connectivity (DSU)',
        condition: 'Incremental edge unions, redundant edge, or Kruskal MST',
        action: 'Maintain parent[] with Path Compression and rank[] with Union by Rank/Size',
        invariant: 'Find/Union run in O(α(V)) amortized time where α(V) ≤ 4 for all practical V',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Traversal & Shortest Path Bounds',
          formula: 'BFS/DFS/Topo: O(V + E)  |  Dijkstra: O((V + E) log V)  |  Bellman-Ford: O(VE)',
          meaning: 'Adjacency lists scale with actual edges E rather than dense O(V²) matrices.',
        },
        {
          name: 'Handshake Lemma',
          formula: '∑_{v ∈ V} deg(v) = 2|E|   (undirected),   ∑ deg⁺(v) = ∑ deg⁻(v) = |E| (directed)',
          meaning: 'Proves iterating over every vertex’s adjacency list examines each edge at most twice.',
        },
        {
          name: 'Disjoint Set Union Inverse Ackermann Bound',
          formula: 'T_m_ops = O(m · α(n)),   α(10^{80}) ≤ 4',
          meaning: 'Combining Path Compression + Union by Rank makes dynamic connectivity effectively constant-time.',
        },
      ],
      proofSketch:
        'In unweighted BFS, induction on distance d shows the queue contains only vertices at distances d and d+1, so every vertex is first discovered via a shortest path. In Dijkstra with w ≥ 0, the popped minimum vertex cannot be improved by any unvisited path.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Weighted graph with non-negative edges asking for single-source shortest path',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Min-heap relaxation settles each vertex in non-decreasing distance order.',
      },
      {
        ifYouSee: 'Dependency resolution, build order, or cycle detection in a DAG',
        recommendedPattern: 'Topological Sort (Kahn)',
        linkedId: 'graph-topo-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Zero in-degree peeling produces a valid linear order or exposes cycles.',
      },
      {
        ifYouSee: 'Merge dynamic groups, count islands online, or build MST',
        recommendedPattern: 'Union-Find (DSU)',
        linkedId: 'union-find-dsu',
        linkedKind: 'algorithm',
        whyItFits: 'Path compression + union by rank answers connectivity in O(α(n)).',
      },
    ],
  },

  'dynamic-programming': {
    formalDefinition:
      'Dynamic Programming solves optimization and counting problems exhibiting Optimal Substructure and Overlapping Subproblems by storing each unique state’s value once in a topological table (bottom-up) or memo cache (top-down), eliminating redundant exponential recomputation.',
    problemStatementForm:
      'Given a sequential decision, knapsack capacity, string alignment, interval split, or DAG path problem asking for min/max cost, feasibility, or total number of ways.',
    logicBoard: [
      {
        step: '01 · Define Minimal State',
        condition: 'Identifying what past history affects future decisions',
        action: 'Define dp[state] in one exact sentence (e.g., min cost using prefix 0..i with capacity w)',
        invariant: 'State satisfies the Markov property: future transitions depend ONLY on state variables',
      },
      {
        step: '02 · Write Recurrence',
        condition: 'Enumerating all legal last actions entering dp[state]',
        action: 'Combine smaller subproblems via min / max / sum (+ transition cost)',
        invariant: 'Transition graph forms a strict DAG (no cyclic state dependencies)',
      },
      {
        step: '03 · Seed Base Cases',
        condition: 'Boundary states (empty prefix, capacity 0, single element)',
        action: 'Initialize reachable boundaries to 0 / 1 and unreachable sentinels to +∞ / -∞',
        invariant: 'Invalid transitions cannot accidentally win min/max comparisons',
      },
      {
        step: '04 · Order & Compress Space',
        condition: 'dp[i] depends only on dp[i - 1] (or dp[i - 2])',
        action: 'Iterate capacity backward for 0/1 Knapsack, forward for Unbounded; roll to 1D/O(1) state',
        invariant: 'Compressed update reads strictly from the intended previous vs. current row',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Bellman Principle of Optimality',
          formula: 'V*(s) = opt_{a ∈ A(s)} [ cost(s, a) + V*(next(s, a)) ]',
          meaning: 'An optimal policy has the property that every remaining sub-policy is itself optimal.',
        },
        {
          name: '0/1 Knapsack vs Unbounded Transition',
          formula: '0/1: dp[w] = max(dp[w], dp[w-wt] + val) (w↓)  |  Unbounded: same recurrence (w↑)',
          meaning: 'Loop direction enforces at-most-once vs. unlimited reuse in O(W) space.',
        },
        {
          name: 'DP Complexity Law',
          formula: 'Time = (# unique states) × (avg transitions per state)',
          meaning: 'Instantly lets you estimate if a state space fits within 10⁷ operations.',
        },
      ],
      proofSketch:
        'View states as vertices and transitions as directed edges in a DAG. Processing vertices in topological order ensures all predecessor subproblems are finalized before computing dp[s], so by induction dp[s] holds the exact optimum in O(|V_states| + |E_transitions|).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Subsequences, edit distance, knapsack, or counting paths with overlapping states',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'Memoizes overlapping subproblems along a clean DAG transition.',
      },
      {
        ifYouSee: 'Small set of items (n ≤ 20) tracking which subset has been visited (TSP/assignment)',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Encodes visited subsets as an integer bitmask in O(n² · 2^n).',
      },
      {
        ifYouSee: 'Count integers in [L, R] satisfying digit constraints (up to 10¹⁸)',
        recommendedPattern: 'Digit DP',
        linkedId: 'digit-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Walks decimal digits with a boolean tight flag in O(digits × states).',
      },
    ],
  },

  'segment-fenwick-trees': {
    formalDefinition:
      'Segment Trees and Fenwick Trees (Binary Indexed Trees) partition an array [0..n-1] into O(log n) hierarchical range aggregates, supporting interleaved updates and associative range queries (sum, min, max, GCD) in O(log n) time.',
    problemStatementForm:
      'Given an array subject to interleaved point or range mutations AND range sum/min/max/frequency queries where O(n) scans per query would time out (n, q ≤ 2×10⁵).',
    logicBoard: [
      {
        step: '01 · Choose BIT vs Segment Tree',
        condition: 'Invertible range sum + point update vs. non-invertible min/max or range assign',
        action: 'Pick Fenwick Tree (BIT) for compact sum/freq; pick Segment Tree (+ Lazy) for min/max/range-set',
        invariant: 'Data structure matches the monoid (group vs. semigroup) property of the operator',
      },
      {
        step: '02 · Point Update Ascent',
        condition: 'Updating A[idx] by delta (BIT) or setting A[idx] = val (Segment Tree)',
        action: 'BIT: for (i = idx+1; i <= n; i += i & -i) bit[i] += delta; SegTree: update leaf & pull parents',
        invariant: 'Only the O(log n) ancestor intervals containing idx are modified',
      },
      {
        step: '03 · Range Query Decomposition',
        condition: 'Querying [ql, qr]',
        action: 'BIT: prefix(qr) - prefix(ql - 1); SegTree: return full overlap, skip disjoint, recurse partial',
        invariant: 'At most 2 nodes per level split partially → O(log n) nodes visited',
      },
      {
        step: '04 · Lazy Propagation Push',
        condition: 'Range update [ul, ur] hits a completely covered Segment Tree node',
        action: 'Update node value, tag lazy[node], and defer child updates until pushDown() is needed',
        invariant: 'Pending updates are pushed before descending to either child, preserving O(log n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Fenwick Least Significant Set Bit (LSB)',
          formula: 'LSB(i) = i & (-i),   Update: i ← i + LSB(i),   Query: i ← i - LSB(i)',
          meaning: 'Two’s complement negation isolates the lowest 1-bit, defining each BIT bucket’s span length.',
        },
        {
          name: 'Segment Tree Node Bound',
          formula: 'Array size ≤ 4n,   Query visits ≤ 4 · ⌈log₂ n⌉ nodes',
          meaning: 'Any contiguous interval [l, r] decomposes into O(log n) canonical dyadic segments.',
        },
        {
          name: 'Monoid Associativity Requirement',
          formula: '(a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)  with identity e',
          meaning: 'Segment Trees support any associative monoid; BIT additionally needs an inverse (group).',
        },
      ],
      proofSketch:
        'At every depth of a Segment Tree, a query interval [ql, qr] can partially straddle at most 2 nodes (one at ql, one at qr); every node strictly inside returns immediately in O(1). Across ⌈log₂ n⌉ levels, at most 4 log₂ n nodes are visited.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Dynamic range min/max or range add/assign + range sum queries',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Handles arbitrary associative monoids and deferred range mutations in O(log n).',
      },
      {
        ifYouSee: 'Dynamic prefix sums, inversion count, or order-statistic frequency queries',
        recommendedPattern: 'Fenwick Tree (BIT)',
        linkedId: 'fenwick-tree-bit',
        linkedKind: 'algorithm',
        whyItFits: 'Half the memory and 10 lines of bit arithmetic for invertible range sums.',
      },
      {
        ifYouSee: 'Offline non-invertible range queries (e.g., distinct count in [L, R]) with no updates',
        recommendedPattern: 'Mo’s Algorithm (Sqrt Decomposition)',
        linkedId: 'mos-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Sorts queries into √n blocks to achieve O((n + q)√n) with simple add/remove hooks.',
      },
    ],
  },

  'bit-manipulation': {
    formalDefinition:
      'Bit Manipulation treats fixed-width integers as parallel boolean vectors in GF(2)^w, executing subset algebra, parity cancellation (XOR), power-of-two checks, and lowest-set-bit jumps directly in single-cycle CPU ALU instructions.',
    problemStatementForm:
      'Given unique-element cancellation prompts, compact subset enumeration (n ≤ 20), hardware-level arithmetic without +/-, or O(1) bitset/flag operations.',
    logicBoard: [
      {
        step: '01 · Self-Canceling XOR',
        condition: 'Every element appears twice except one (or missing number in 0..n)',
        action: 'Accumulate acc ^= x across all elements (and indices 0..n if missing number)',
        invariant: 'Pairs cancel via x ⊕ x = 0, leaving the unique unpaired value',
      },
      {
        step: '02 · Clear / Isolate Lowest Bit',
        condition: 'Counting set bits (Kernighan) or splitting two unique numbers',
        action: 'Clear lowest 1-bit via n &= (n - 1); isolate lowest 1-bit via lsb = x & (-x)',
        invariant: 'Each Kernighan step removes exactly one 1-bit → O(popcount(n)) iterations',
      },
      {
        step: '03 · Bit-by-Bit Mod-K Count',
        condition: 'Every element appears 3 (or K) times except one',
        action: 'For each bit position b ∈ [0..31], sum set bits mod K to reconstruct the outlier bit',
        invariant: 'Generalizes XOR (mod 2) to arbitrary multiplicity K in O(32n) = O(n) time',
      },
      {
        step: '04 · Subset Enumeration',
        condition: 'Iterating over all submasks of a bitmask m',
        action: 'Use for (sub = m; sub > 0; sub = (sub - 1) & m)',
        invariant: 'Iterating submasks across all 2^n masks takes exactly 3^n total steps',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'XOR Abelian Group Axioms',
          formula: 'x ⊕ x = 0,   x ⊕ 0 = x,   a ⊕ b = b ⊕ a,   (a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)',
          meaning: 'Every integer is its own inverse under bitwise XOR.',
        },
        {
          name: 'Two’s Complement Lowest-Bit Identities',
          formula: 'n & (n - 1) clears LSB   |   n & (-n) isolates LSB   |   (n > 0 ∧ (n & (n - 1)) === 0) ⟺ n = 2^k',
          meaning: 'Derived directly from -n = ~n + 1 flipping all trailing zeros into carries.',
        },
        {
          name: 'Submask Enumeration Binomial Sum',
          formula: '∑_{k=0}^{n} C(n, k) · 2^k = (1 + 2)^n = 3^n',
          meaning: 'Each bit has 3 choices: absent from mask, in mask only, or in both mask and submask.',
        },
      ],
      proofSketch:
        'In two’s complement, subtracting 1 from n flips the rightmost 1-bit to 0 and all trailing 0s to 1s while leaving higher bits untouched. Bitwise AND with n therefore zeros out that rightmost 1-bit and nothing else.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Single number among pairs/triplets, power-of-2 test, or bitset state flags',
        recommendedPattern: 'Bit Manipulation',
        linkedId: 'bit-manipulation',
        linkedKind: 'algorithm',
        whyItFits: 'Runs in O(1) extra space with single-cycle algebraic identities.',
      },
      {
        ifYouSee: 'TSP or assignment DP over a subset of n ≤ 20 items',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Represents the full visited set inside a single integer index.',
      },
      {
        ifYouSee: 'Maximum pairwise XOR across an array of integers',
        recommendedPattern: 'Trie Prefix Search (Bitwise Trie)',
        linkedId: 'trie-prefix-autocomplete',
        linkedKind: 'algorithm',
        whyItFits: '31-bit MSB Trie chooses opposite bits greedily in O(32n).',
      },
    ],
  },

  'exact-string-matching': {
    formalDefinition:
      'Exact String Matching locates all occurrences of pattern P[0..m-1] inside text T[0..n-1] in O(n + m) time by eliminating redundant character re-comparisons via prefix-function automata (KMP / Z-Algorithm) or algebraic rolling-hash fingerprints (Rabin-Karp).',
    problemStatementForm:
      'Given a text T and pattern P (or repeated substring / longest prefix-suffix / palindrome query), find exact matches without O(n·m) worst-case backtracking.',
    logicBoard: [
      {
        step: '01 · Build LPS / Z-Table',
        condition: 'Preprocessing pattern P[0..m-1] for KMP (or P + "#" + T for Z-Algorithm)',
        action: 'Track longest proper prefix that is also a suffix lps[i]; fallback len = lps[len - 1] on mismatch',
        invariant: 'lps[i] encodes the maximal safe shift that never misses an overlapping match',
      },
      {
        step: '02 · Scan Text Without Rewind',
        condition: 'Comparing T[i] against P[j]',
        action: 'If equal advance both; on mismatch jump j = lps[j - 1] (never decrement text pointer i)',
        invariant: 'Text index i moves strictly forward; total j fallbacks ≤ total j increments ≤ n',
      },
      {
        step: '03 · Rolling Hash Alternative',
        condition: 'Searching fixed-length duplicates, 2D grids, or multiple same-length patterns',
        action: 'Slide polynomial hash H_new = ((H - old·B^{m-1})·B + new) mod M; verify on collision',
        invariant: 'O(1) hash slide per step; double hashing (two primes) drives collision risk < 10⁻¹⁸',
      },
      {
        step: '04 · Report & Overlap Shift',
        condition: 'Full match reached (j === m)',
        action: 'Record match start i - m, then set j = lps[j - 1] to detect overlapping occurrences',
        invariant: 'Overlapping matches (e.g., "aba" in "ababa") are all discovered cleanly',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'KMP Prefix-Suffix Automaton Bound',
          formula: 'Φ = j,   increases ≤ n times,   each fallback decreases j ≥ 1  ⟹  T = O(n + m)',
          meaning: 'Potential argument proves the inner mismatch while-loop runs at most n times across the entire text.',
        },
        {
          name: 'Rabin-Karp Polynomial Rolling Hash',
          formula: 'H(S[0..m-1]) = (∑_{k=0}^{m-1} S[k] · B^{m-1-k}) mod M',
          meaning: 'Removing the leading term and multiplying by B shifts the window in O(1) arithmetic.',
        },
        {
          name: 'Smallest Period Theorem (KMP)',
          formula: 'p = m - lps[m - 1];   P is periodic ⟺ p | m  and  lps[m - 1] > 0',
          meaning: 'Instantly solves "Repeated Substring Pattern" in O(m) time.',
        },
      ],
      proofSketch:
        'Suppose P[0..j-1] matched T[i-j..i-1] and P[j] ≠ T[i]. Any valid shift aligning a prefix of P with a suffix of T[i-j..i-1] must be a border (prefix = suffix) of P[0..j-1]. By definition lps[j-1] is the longest such border, so jumping j → lps[j-1] skips only provably impossible alignments.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Single pattern search, shortest palindrome prefix, or repeated substring period',
        recommendedPattern: 'KMP & Rabin-Karp',
        linkedId: 'kmp-rabin-karp',
        linkedKind: 'algorithm',
        whyItFits: 'LPS table solves exact matching and periodicity in deterministic O(n + m).',
      },
      {
        ifYouSee: 'Need longest palindromic substring in linear O(n) time',
        recommendedPattern: 'Manacher’s Algorithm',
        linkedId: 'manachers-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Mirrors previously computed palindrome radii around the rightmost center.',
      },
      {
        ifYouSee: 'Match thousands of patterns simultaneously against a streaming text',
        recommendedPattern: 'Aho-Corasick',
        linkedId: 'aho-corasick',
        linkedKind: 'algorithm',
        whyItFits: 'Generalizes KMP failure transitions across an entire Trie of patterns.',
      },
    ],
  },

  'ngram-fuzzy-candidate-retrieval': {
    formalDefinition:
      'N-Gram Inverted Indexing decomposes strings into overlapping length-q substrings (q-grams) and maps each q-gram to a posting list of candidate IDs, pruning massive dictionaries down to a small shortlist before expensive edit-distance verification.',
    problemStatementForm:
      'Given a corpus of millions of records and a noisy/typo-ridden query string, retrieve all candidate strings within edit distance ≤ k or Jaccard/Dice similarity ≥ τ in sublinear milliseconds.',
    logicBoard: [
      {
        step: '01 · Normalize & Pad',
        condition: 'Indexing record s or receiving user query q',
        action: 'Lowercase, normalize whitespace, pad boundaries ("##" + s + "##"), extract q-grams (q = 2 or 3)',
        invariant: 'Padding weights start/end typos equally with interior characters',
      },
      {
        step: '02 · Posting List Accumulate',
        condition: 'Query produces G(q) unique q-grams',
        action: 'Traverse inverted index postings[g] for each g ∈ G(q) and increment overlap count[docId]++',
        invariant: 'Only documents sharing ≥ 1 q-gram are ever touched (skips 99%+ of corpus)',
      },
      {
        step: '03 · Apply Lower-Bound Filter',
        condition: 'Candidate docId has overlap c = |G(q) ∩ G(s)|',
        action: 'Prune if ||s| - |q|| > k OR c < max(|q|, |s|) - q + 1 - k·q (q-gram count lemma)',
        invariant: 'Zero false negatives: every true match with EditDist ≤ k strictly passes the threshold',
      },
      {
        step: '04 · Prefix Filter & Hand-Off',
        condition: 'High-frequency q-grams dominate posting lists',
        action: 'Order q-grams by rarest IDF first; probe only the prefix subset, then pass shortlist to reranker',
        invariant: 'Maintains exact recall while shrinking candidate verification to O(shortlist)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Q-Gram Edit-Distance Count Lemma',
          formula: 'ED(s, q) ≤ k  ⟹  |G(s) ∩ G(q)| ≥ max(|s|, |q|) - q + 1 - k · q',
          meaning: 'One single-character edit destroys at most q overlapping q-grams.',
        },
        {
          name: 'Jaccard & Dice Set Similarities',
          formula: 'Jaccard(A, B) = |A ∩ B| / |A ∪ B|   |   Dice(A, B) = 2|A ∩ B| / (|A| + |B|)',
          meaning: 'Fast set-overlap proxies computed directly from posting-list hit counts.',
        },
        {
          name: 'Length Filtering Bound',
          formula: 'ED(s, q) ≤ k  ⟹  | |s| - |q| | ≤ k',
          meaning: 'Instant O(1) rejection before touching edit-distance matrices.',
        },
      ],
      proofSketch:
        'A string of length L produces L - q + 1 q-grams. Each insertion, deletion, or substitution touches at most q consecutive q-grams. Therefore k edits can destroy at most k·q q-grams, proving any string with fewer shared q-grams cannot be within edit distance k.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Typo-tolerant search across a large catalog requiring sub-50ms recall',
        recommendedPattern: 'N-Gram Fuzzy Candidate Retrieval',
        linkedId: 'ngram-fuzzy-candidate-retrieval',
        linkedKind: 'topic',
        whyItFits: 'Inverted q-gram index guarantees recall while skipping non-overlapping records.',
      },
      {
        ifYouSee: 'Need final precision scoring and confidence calibration on retrieved candidates',
        recommendedPattern: 'Confident Fuzzy Reranking',
        linkedId: 'confident-fuzzy-reranking',
        linkedKind: 'topic',
        whyItFits: 'Stage-2 banded edit distance + Jaro-Winkler + margin scoring eliminates false positives.',
      },
      {
        ifYouSee: 'Exact prefix autocomplete with zero typos allowed',
        recommendedPattern: 'Trie Prefix Search',
        linkedId: 'trie-prefix-autocomplete',
        linkedKind: 'algorithm',
        whyItFits: 'Direct O(L) prefix descent is simpler and faster when exact prefixes suffice.',
      },
    ],
  },

  'confident-fuzzy-reranking': {
    formalDefinition:
      'Confident Fuzzy Reranking is Stage 2 of production entity resolution: it computes exact banded Damerau-Levenshtein / Jaro-Winkler scores over the retrieved shortlist, combines normalized features, and applies threshold + top-1/top-2 margin abstention to prevent silent false merges.',
    problemStatementForm:
      'Given a shortlist of candidate matches for a noisy query, rank them accurately in O(k·L) per candidate and decide between Auto-Accept, Human Review, or Reject with calibrated confidence.',
    logicBoard: [
      {
        step: '01 · Banded Edit Distance',
        condition: 'Scoring candidate s against query q with max edit budget k',
        action: 'Compute DP cells ONLY inside the Ukkonen diagonal band |i - j| ≤ k; early-abort if row min > k',
        invariant: 'Reduces DP from O(mn) to O(k · min(m, n)) with exact distance when ED ≤ k',
      },
      {
        step: '02 · Multi-Signal Score Fusion',
        condition: 'Combining typo distance, prefix agreement, and token order',
        action: 'Compute weighted score S = w₁·(1 - ED/maxLen) + w₂·JaroWinkler + w₃·TokenSortRatio',
        invariant: 'Normalized score S ∈ [0, 1] stays comparable across short and long strings',
      },
      {
        step: '03 · Margin Calibration',
        condition: 'Candidates sorted descending: top1 (S₁) and runner-up (S₂)',
        action: 'Compute ambiguity margin Δ = S₁ - S₂ alongside absolute threshold τ_high',
        invariant: 'Distinguishes unambiguous matches from near-tie collisions (e.g., "John Smith" vs "Jon Smith")',
      },
      {
        step: '04 · Three-Way Decision Gate',
        condition: 'Evaluating (S₁, Δ) against calibrated operating points',
        action: 'S₁ ≥ τ_high ∧ Δ ≥ δ_min ⇒ Auto-Accept; S₁ ≥ τ_low ⇒ Review; else ⇒ Reject',
        invariant: 'Controls false-accept precision independently from candidate-stage recall',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Ukkonen Banded Edit Distance Complexity',
          formula: 'T_banded = O(k · min(|s|, |q|)),   cells evaluated: |i - j| ≤ k',
          meaning: 'Leaving the diagonal band costs > k insertions/deletions, so outside cells are provably > k.',
        },
        {
          name: 'Jaro-Winkler Prefix Boost Formula',
          formula: 'JW(s, q) = Jaro(s, q) + ℓ · p · (1 - Jaro(s, q)),   ℓ ≤ 4,  p = 0.1',
          meaning: 'Rewards matching prefixes (e.g., names/codes) where typos occur more frequently in suffixes.',
        },
        {
          name: 'Margin-Gated Abstention Criterion',
          formula: 'Accept  ⟺  (S₁ ≥ τ_high)  ∧  (S₁ - S₂ ≥ δ_min)',
          meaning: 'Prevents high-confidence errors when two distinct entities tie closely in score.',
        },
      ],
      proofSketch:
        'Any alignment path passing through cell (i, j) with |i - j| > k must perform at least |i - j| > k net insertions or deletions, giving edit cost > k. Pruning outside the band therefore never alters the exact distance whenever ED(s, q) ≤ k.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Need Stage-1 fast candidate generation across millions of strings first',
        recommendedPattern: 'N-Gram Fuzzy Candidate Retrieval',
        linkedId: 'ngram-fuzzy-candidate-retrieval',
        linkedKind: 'topic',
        whyItFits: 'Avoids running banded edit distance against the entire corpus.',
      },
      {
        ifYouSee: 'Core recurrence behind Levenshtein / sequence alignment',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'topic',
        whyItFits: 'Edit distance is the canonical 2-string 2D DP table compressed to O(min(m, n)) space.',
      },
      {
        ifYouSee: 'Exact multi-keyword dictionary matching without typo tolerance',
        recommendedPattern: 'Aho-Corasick',
        linkedId: 'aho-corasick',
        linkedKind: 'algorithm',
        whyItFits: 'Deterministic automaton matches exact dictionary hits in linear time.',
      },
    ],
  },
};

export function getTopicLogicBoard(topic: CurriculumTopic): LogicBoardEnrichment {
  const exact = TOPIC_LOGIC_BOARDS[topic.id];
  if (exact) return exact;

  return {
    formalDefinition: `${topic.title}: ${topic.tagline} Achieves ${topic.solutions.optimal.timeComplexity} time and ${topic.solutions.optimal.spaceComplexity} space by exploiting problem structure.`,
    problemStatementForm: `Given an input matching ${topic.category} constraints, transform the naive ${topic.solutions.brute.timeComplexity} approach into ${topic.solutions.optimal.timeComplexity}.`,
    logicBoard: topic.mentalModelSteps.slice(0, 4).map((step, i) => ({
      step: `0${i + 1} · Stage ${i + 1}`,
      condition: topic.patternClues[i]?.signal ?? 'Invariant precondition active',
      action: step,
      invariant: topic.solutions.optimal.intuition,
    })),
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Asymptotic Complexity Improvement',
          formula: `${topic.solutions.brute.timeComplexity}  ⟶  ${topic.solutions.optimal.timeComplexity}  (Space: ${topic.solutions.optimal.spaceComplexity})`,
          meaning: topic.solutions.optimal.bottleneckOrUpgrade,
        },
      ],
      proofSketch: topic.solutions.optimal.intuition,
    },
    patternRecommendations: topic.patternClues.slice(0, 3).map((clue) => ({
      ifYouSee: clue.signal,
      recommendedPattern: topic.shortTitle,
      linkedId: topic.id,
      linkedKind: 'topic',
      whyItFits: clue.whyItMatches,
    })),
  };
}
