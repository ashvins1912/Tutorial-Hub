import type { LogicBoardEnrichment } from './logicBoardMathTypes';

export const CORE_A_LOGIC_BOARDS: Record<string, LogicBoardEnrichment> = {
  'prefix-sum-hash': {
    formalDefinition:
      'Prefix Sum + Hash Map combines cumulative sums P[i] = ∑_{k=0}^{i-1} A[k] with a frequency/earliest-index hash table to detect any contiguous subarray [l, r] satisfying P[r+1] - P[l] = K (or modular congruence) in O(n) time even when A contains negative values.',
    problemStatementForm:
      'Given an integer array A[0..n-1] (possibly negative) and target K, count or maximize the length of subarrays whose sum equals K or is divisible by K.',
    logicBoard: [
      {
        step: '01 · Seed Identity',
        condition: 'Before scanning index 0',
        action: 'Initialize prefix = 0 and map M = {0: 1} (count) or {0: -1} (longest length)',
        invariant: 'Empty prefix accounts for valid subarrays starting at index 0',
      },
      {
        step: '02 · Advance Prefix',
        condition: 'Processing A[i]',
        action: 'Update prefix += A[i] and compute required past prefix need = prefix - K',
        invariant: 'prefix equals exact cumulative sum ∑_{k=0}^{i} A[k]',
      },
      {
        step: '03 · Query Prior Prefix',
        condition: 'M.has(need) is true',
        action: 'Add M.get(need) to count OR update bestLen = max(bestLen, i - M.get(need))',
        invariant: 'Every stored entry represents a strictly earlier index j < i',
      },
      {
        step: '04 · Record Current Prefix',
        condition: 'After querying M',
        action: 'Increment M[prefix]++ (count) OR set M[prefix] = i ONLY if absent (longest)',
        invariant: 'Keeping earliest index strictly maximizes future span i - j',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Prefix Difference Equivalence',
          formula: '∑_{k=l}^{r} A[k] = K  ⟺  P[r + 1] - P[l] = K  ⟺  P[l] = P[r + 1] - K',
          meaning: 'Transforms O(n²) subarray enumeration into O(1) complement lookup.',
        },
        {
          name: 'Non-Negative Modulo Normalization',
          formula: 'rem = ((P[i] % K) + K) % K   ∈ [0, K - 1]',
          meaning: 'Handles negative remainders so congruent prefixes map to one bucket.',
        },
      ],
      proofSketch:
        'Each valid subarray [l, r] corresponds uniquely to an ordered pair (l, r+1) with l < r+1 and P[r+1] - P[l] = K. Querying M before inserting P[r+1] ensures only earlier indices l are matched.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Subarray sum == K or contiguous 0/1 balance with negative values',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-hash',
        linkedKind: 'algorithm',
        whyItFits: 'Works unconditionally with negative numbers where sliding window fails.',
      },
      {
        ifYouSee: 'All elements ≥ 0 asking for shortest/longest subarray with sum ≤ K',
        recommendedPattern: 'Sliding Window',
        linkedId: 'sliding-window',
        linkedKind: 'algorithm',
        whyItFits: 'Non-negative monotonicity drops extra space from O(n) to O(1).',
      },
      {
        ifYouSee: 'Point updates interleaved with range sum queries',
        recommendedPattern: 'Fenwick Tree (BIT)',
        linkedId: 'fenwick-tree-bit',
        linkedKind: 'algorithm',
        whyItFits: 'Maintains dynamic prefix sums in O(log n) per update and query.',
      },
    ],
  },

  'two-pointers': {
    formalDefinition:
      'Two Pointers deploys two monotonically moving indices (L, R) over a sorted or structured sequence so every comparison discards a provably dominated row or column of candidate pairs in O(n) total time and O(1) space.',
    problemStatementForm:
      'Given a sorted array (or sequence after sorting) find pairs/triplets matching a sum, maximize trapped area, verify palindromes, or partition elements in-place.',
    logicBoard: [
      {
        step: '01 · Place Endpoints',
        condition: 'Sorted array pair search',
        action: 'Set L = 0, R = n - 1 (for 3Sum, fix outer i and search [i+1, n-1])',
        invariant: 'All untested valid pairs satisfy L < R',
      },
      {
        step: '02 · Sum Too Small',
        condition: 'A[L] + A[R] < target',
        action: 'Increment L ← L + 1',
        invariant: 'Since A[R] is the maximum remaining partner, A[L] cannot pair with any j ≤ R',
      },
      {
        step: '03 · Sum Too Large',
        condition: 'A[L] + A[R] > target',
        action: 'Decrement R ← R - 1',
        invariant: 'Since A[L] is the minimum remaining partner, A[R] cannot pair with any i ≥ L',
      },
      {
        step: '04 · Match & Skip Dups',
        condition: 'A[L] + A[R] == target',
        action: 'Emit pair; advance L++, R-- skipping consecutive equal values if deduping',
        invariant: 'R - L decreases strictly at each step → terminates in ≤ n steps',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Search Matrix Elimination Bound',
          formula: 'Δ(R - L) ≤ -1 per step  ⟹  Comparisons ≤ n - 1 = O(n)',
          meaning: 'Walks a staircase path across the n × n sorted sum matrix instead of all n² cells.',
        },
        {
          name: 'Two-Wall Water Trap Bound',
          formula: 'water[i] = max(0, min(leftMax, rightMax) - height[i])',
          meaning: 'When leftMax ≤ rightMax, water at L depends strictly on leftMax in O(1) space.',
        },
      ],
      proofSketch:
        'View pairs (i, j) as cells of a sorted matrix M[i][j] = A[i] + A[j]. Starting at top-right (0, n-1), each comparison eliminates an entire row (L++) or column (R--), proving completeness in ≤ n steps.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sorted array pair/triplet sums or O(1)-space in-place deduplication',
        recommendedPattern: 'Two Pointers',
        linkedId: 'two-pointers',
        linkedKind: 'algorithm',
        whyItFits: 'Monotonic pruning beats O(n log n) binary search and uses O(1) space.',
      },
      {
        ifYouSee: 'Unsorted pair sum where modifying/sorting input is disallowed',
        recommendedPattern: 'Arrays & Hashing',
        linkedId: 'arrays-hashing',
        linkedKind: 'topic',
        whyItFits: 'Hash map achieves O(n) time without sorting overhead.',
      },
      {
        ifYouSee: 'Linked list cycle or midpoint discovery',
        recommendedPattern: 'Fast & Slow Pointers',
        linkedId: 'fast-slow-pointers',
        linkedKind: 'algorithm',
        whyItFits: 'Uses relative speed differential rather than opposite-end convergence.',
      },
    ],
  },

  'sliding-window': {
    formalDefinition:
      'Sliding Window tracks a contiguous range [L, R] via incremental state updates as R expands and L contracts monotonically whenever a hereditary constraint is violated (longest) or satisfied (shortest), running in O(n) amortized time.',
    problemStatementForm:
      'Given an array or string S[0..n-1], compute the optimal contiguous subarray/substring length, minimum cover window, or count under a frequency or non-negative sum constraint.',
    logicBoard: [
      {
        step: '01 · Expand Right',
        condition: 'Next index R ∈ [0..n-1]',
        action: 'Add S[R] to frequency map / sum; increment formed counter if target freq met',
        invariant: 'Window state exactly reflects multiset S[L..R]',
      },
      {
        step: '02 · Trigger Shrink',
        condition: 'Constraint broken (longest) OR constraint satisfied (shortest)',
        action: 'While condition holds, evict S[L] from state and increment L ← L + 1',
        invariant: 'L moves strictly rightward; no index is evicted more than once',
      },
      {
        step: '03 · Capture Answer',
        condition: 'Inside shrink loop (shortest) OR immediately after shrink loop (longest)',
        action: 'Update best = min/max(best, R - L + 1) or total += (R - L + 1)',
        invariant: 'Captures tightest valid window ending at right boundary R',
      },
      {
        step: '04 · Exact-K Decomposition',
        condition: 'Prompt asks for subarrays with EXACTLY K distinct items',
        action: 'Return atMost(K) - atMost(K - 1)',
        invariant: 'Two monotonic windows solve a non-monotonic exact-K count in O(n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Two-Pointer Amortized Budget',
          formula: 'Ops = ∑ ΔR + ∑ ΔL ≤ n + n = 2n = O(n)',
          meaning: 'Total shrink steps across the entire run cannot exceed n.',
        },
        {
          name: 'Exact-K Reduction',
          formula: 'F(= K) = F(≤ K) - F(≤ K - 1)',
          meaning: 'Converts non-monotonic exact frequency counts into monotonic upper-bound windows.',
        },
      ],
      proofSketch:
        'If [L, R] is minimal and valid for shortest-window, advancing L stops at the unique largest invalid start, ensuring no future R\' > R misses a shorter valid start.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Minimum window substring, longest substring without repeats, or K replacements',
        recommendedPattern: 'Sliding Window',
        linkedId: 'sliding-window',
        linkedKind: 'algorithm',
        whyItFits: 'Frequency table delta updates in O(1) per pointer movement.',
      },
      {
        ifYouSee: 'Subarray sum with negative integers',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-hash',
        linkedKind: 'algorithm',
        whyItFits: 'Restores O(n) when negative numbers break window sum monotonicity.',
      },
      {
        ifYouSee: 'Maximum or minimum element inside every window of length K',
        recommendedPattern: 'Monotonic Deque',
        linkedId: 'monotonic-deque',
        linkedKind: 'algorithm',
        whyItFits: 'Maintains sliding extrema in O(1) amortized time per step.',
      },
    ],
  },

  'fast-slow-pointers': {
    formalDefinition:
      'Floyd’s Tortoise & Hare Algorithm traverses a linked structure or functional graph x_{k+1} = f(x_k) with a 1-step pointer (slow) and a 2-step pointer (fast) to detect cycles, locate exact cycle entry μ, and measure cycle period λ in O(μ + λ) time and O(1) space.',
    problemStatementForm:
      'Given a singly linked list or read-only integer array f(i) = A[i], detect cycles, find the cycle entry node, or locate the midpoint without extra memory.',
    logicBoard: [
      {
        step: '01 · Race Phase 1',
        condition: 'fast !== null && fast.next !== null',
        action: 'Move slow = slow.next and fast = fast.next.next',
        invariant: 'Modular distance from fast to slow decreases by 1 per step inside a cycle',
      },
      {
        step: '02 · Detect Termination',
        condition: 'fast === null || fast.next === null',
        action: 'Return no cycle (slow currently rests at the exact list midpoint)',
        invariant: 'Acyclic list terminates in ⌊n/2⌋ steps',
      },
      {
        step: '03 · Collision Found',
        condition: 'slow === fast',
        action: 'Reset entry = head; keep slow at meeting point',
        invariant: 'Meeting offset x inside cycle satisfies μ ≡ (λ - x) (mod λ)',
      },
      {
        step: '04 · Phase 2 Convergence',
        condition: 'entry !== slow',
        action: 'Advance both entry and slow at equal speed 1 until they meet',
        invariant: 'Both arrive simultaneously at the exact cycle entry after μ steps',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Phase-1 Distance Congruence',
          formula: 'd(fast) = 2 · d(slow)  ⟹  2(μ + x) - (μ + x) = kλ  ⟹  μ + x = kλ',
          meaning: 'Total steps taken by slow at collision is an integer multiple of cycle length λ.',
        },
        {
          name: 'Phase-2 Entry Alignment',
          formula: 'μ = kλ - x = (k - 1)λ + (λ - x)',
          meaning: 'Walking μ steps from collision offset x lands exactly on cycle offset 0.',
        },
      ],
      proofSketch:
        'Once slow enters the cycle at step μ, fast narrows the forward modular gap by 1 each step, forcing collision within ≤ λ steps. Since μ + x = kλ, advancing one pointer from head and one from the meeting point at speed 1 guarantees collision at the cycle entry.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Cycle detection, cycle entry node, happy number, or find duplicate in [1..n] O(1) space',
        recommendedPattern: 'Fast & Slow Pointers',
        linkedId: 'fast-slow-pointers',
        linkedKind: 'algorithm',
        whyItFits: 'Proves cycle entry mathematically in O(1) space with zero mutation.',
      },
      {
        ifYouSee: 'Reversing second half of a list after finding midpoint',
        recommendedPattern: 'In-Place Linked List Reversal',
        linkedId: 'linked-list-reversal',
        linkedKind: 'algorithm',
        whyItFits: 'Pairs directly with midpoint discovery for O(1)-space palindrome/reorder.',
      },
      {
        ifYouSee: 'Directed graph with arbitrary out-degree (branching edges)',
        recommendedPattern: 'Depth-First Search',
        linkedId: 'depth-first-search',
        linkedKind: 'algorithm',
        whyItFits: '3-color DFS detects cycles across general branching directed graphs.',
      },
    ],
  },

  'monotonic-stack': {
    formalDefinition:
      'A Monotonic Stack stores indices whose corresponding array values remain strictly increasing or decreasing, popping violated elements to resolve Nearest Greater/Smaller boundaries on both sides in a single O(n) pass.',
    problemStatementForm:
      'Given an array of heights, temperatures, or prices, find Next/Previous Greater/Smaller elements, largest histogram rectangle, stock span, or sum of subarray minimums/maximums.',
    logicBoard: [
      {
        step: '01 · Violation Check',
        condition: 'Stack non-empty AND incoming A[i] breaks monotonic order with A[stack.top]',
        action: 'Pop mid = stack.pop(); index i is mid’s exact right boundary',
        invariant: 'No index between stack.newTop and i is more extreme than A[mid]',
      },
      {
        step: '02 · Compute Contribution',
        condition: 'Popped index mid resolved',
        action: 'left = stack.length ? stack.top : -1; span = i - left - 1 (or (mid - left) * (i - mid))',
        invariant: 'Break duplicate ties strictly (< on one side, ≤ on other) to avoid double counting',
      },
      {
        step: '03 · Push Current Index',
        condition: 'Stack top satisfies monotonic order with A[i]',
        action: 'Push index i onto stack',
        invariant: 'Stack values remain strictly monotonic from bottom to top',
      },
      {
        step: '04 · Sentinel Flush',
        condition: 'End of array reached (i === n)',
        action: 'Process sentinel (-∞ / +∞) to flush remaining stack entries',
        invariant: 'Every element pushed once & popped once → ≤ 2n ops = O(n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Amortized Push-Pop Bound',
          formula: 'Pushes = n,   Pops ≤ n  ⟹  Total Stack Ops ≤ 2n = O(n)',
          meaning: 'Guarantees linear runtime despite the inner while-loop.',
        },
        {
          name: 'Subarray Minima Contribution Sum',
          formula: '∑_{l ≤ r} min(A[l..r]) = ∑_{i=0}^{n-1} A[i] · (i - PLE[i]) · (NLE[i] - i)',
          meaning: 'Counts exact subarrays where A[i] is the canonical minimum.',
        },
      ],
      proofSketch:
        'An index j is popped at the earliest i > j violating monotonic order. Every element between stack’s previous entry p and i was already popped (strictly dominated by A[j]), proving p and i are exact nearest boundaries.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Next greater element, daily temperatures, histogram area, or trapping rain water',
        recommendedPattern: 'Monotonic Stack',
        linkedId: 'monotonic-stack',
        linkedKind: 'algorithm',
        whyItFits: 'Resolves both left/right nearest bounds in one O(n) pass.',
      },
      {
        ifYouSee: 'Fixed-width sliding window maximum/minimum requiring left expiration',
        recommendedPattern: 'Monotonic Deque',
        linkedId: 'monotonic-deque',
        linkedKind: 'algorithm',
        whyItFits: 'Adds O(1) front eviction when older extrema exit window [i-k+1, i].',
      },
      {
        ifYouSee: 'Arbitrary online range minimum queries [L, R]',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Answers dynamic RMQ queries in O(log n).',
      },
    ],
  },

  'kadanes-algorithm': {
    formalDefinition:
      'Kadane’s Algorithm computes the maximum contiguous subarray sum in O(n) time and O(1) space by tracking the optimal subarray ending at each index i, resetting whenever the prior prefix becomes negative.',
    problemStatementForm:
      'Given an integer array A[0..n-1] (containing positive and negative values), find the maximum sum (or circular sum / max product variant) of any non-empty contiguous subarray.',
    logicBoard: [
      {
        step: '01 · Initialize Non-Empty',
        condition: 'Before iterating i = 1..n-1',
        action: 'Set currBest = A[0], globalBest = A[0] (never 0 if all elements may be negative)',
        invariant: 'currBest equals optimal non-empty subarray ending at index 0',
      },
      {
        step: '02 · Extend vs Restart',
        condition: 'At index i',
        action: 'currBest = max(A[i], currBest + A[i]) (track currMin as well for product/circular)',
        invariant: 'Optimal subarray ending at i either extends i-1 or starts fresh at i',
      },
      {
        step: '03 · Update Global Max',
        condition: 'After updating currBest',
        action: 'globalBest = max(globalBest, currBest)',
        invariant: 'globalBest equals max_{0 ≤ l ≤ r ≤ i} sum(l..r)',
      },
      {
        step: '04 · Circular Wrap Check',
        condition: 'Array wraps circularly from n-1 to 0',
        action: 'If globalBest < 0 return globalBest; else max(globalBest, totalSum - minSubarraySum)',
        invariant: 'Wrapping maximum subarray is the complement of an interior minimum subarray',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Kadane 1D DP Recurrence',
          formula: 'dp[i] = max(A[i], dp[i - 1] + A[i]),   Ans = max_{0 ≤ i < n} dp[i]',
          meaning: 'Compresses O(n) DP table to O(1) scalar state.',
        },
        {
          name: 'Circular Maximum Duality',
          formula: 'MaxCircular = (maxSub < 0) ? maxSub : max(maxSub, TotalSum - minSub)',
          meaning: 'Guards against all-negative arrays where TotalSum - minSub would be empty.',
        },
      ],
      proofSketch:
        'Any subarray ending at i either has length 1 (sum A[i]) or appends A[i] to a subarray ending at i-1 (optimal sum dp[i-1] + A[i]). Taking max across all i covers every subarray.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Maximum subarray sum, circular max subarray, or single buy/sell stock profit',
        recommendedPattern: 'Kadane’s Algorithm',
        linkedId: 'kadanes-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Optimal O(n) time, O(1) space prefix-reset DP.',
      },
      {
        ifYouSee: 'Subarray sum must equal exact target K',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-hash',
        linkedKind: 'algorithm',
        whyItFits: 'Exact K matching requires hashing all historical prefixes.',
      },
      {
        ifYouSee: 'Dynamic point updates + max subarray query on arbitrary [L, R]',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Merges (sum, pref, suff, best) 4-tuples in O(log n).',
      },
    ],
  },

  'monotonic-deque': {
    formalDefinition:
      'A Monotonic Deque maintains candidate indices ordered monotonically in both position and value, evicting expired indices from the front and dominated candidates from the back to report sliding window extrema in O(1) amortized time.',
    problemStatementForm:
      'Given an array A[0..n-1] and window size K (or jump bound K), compute the max/min for every window [i-K+1, i] or optimize bounded-range DP transitions.',
    logicBoard: [
      {
        step: '01 · Expire Front',
        condition: 'dq.length > 0 && dq[0] <= i - k',
        action: 'Pop index from front of deque',
        invariant: 'Every index in deque lies strictly inside active window [i - k + 1, i]',
      },
      {
        step: '02 · Evict Dominated Back',
        condition: 'dq.length > 0 && A[dq[back]] <= A[i]',
        action: 'Pop back while incoming A[i] dominates older smaller element',
        invariant: 'Deque values stay strictly decreasing; indices stay strictly increasing',
      },
      {
        step: '03 · Append Index',
        condition: 'Dominance invariant restored',
        action: 'Push index i to back of deque',
        invariant: 'deque.front holds the exact window optimum',
      },
      {
        step: '04 · Record Front Optimum',
        condition: 'i >= k - 1',
        action: 'Emit A[dq[0]] as answer for window ending at i',
        invariant: 'Each index pushed once and popped ≤ once → O(n) time, O(k) space',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dominance Elimination Law',
          formula: 'j < i  ∧  A[j] ≤ A[i]  ⟹  j can never win any future window containing i',
          meaning: 'Proves pruning back elements never discards a future maximum.',
        },
        {
          name: 'Monotonic Queue DP Optimization',
          formula: 'dp[i] = w[i] + max_{i-k ≤ j < i} dp[j]   (O(nk) ⟶ O(n))',
          meaning: 'Replaces inner O(k) scan with O(1) amortized deque lookup.',
        },
      ],
      proofSketch:
        'Each element enters the back once and exits either front or back at most once, proving O(n) total operations. Strict decreasing values with increasing indices guarantee the front is always the maximum valid element.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sliding window max/min, constrained subsequence sum, or shortest subarray ≥ K with negatives',
        recommendedPattern: 'Monotonic Deque',
        linkedId: 'monotonic-deque',
        linkedKind: 'algorithm',
        whyItFits: 'Combines O(1) front expiration with back dominance pruning.',
      },
      {
        ifYouSee: 'Nearest greater/smaller element without sliding window expiration',
        recommendedPattern: 'Monotonic Stack',
        linkedId: 'monotonic-stack',
        linkedKind: 'algorithm',
        whyItFits: 'Single-ended stack is simpler when no left expiration occurs.',
      },
      {
        ifYouSee: 'Graph shortest path with edge weights strictly in {0, 1}',
        recommendedPattern: '0-1 BFS',
        linkedId: 'zero-one-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Deque push-front/back solves 0-1 shortest paths in O(V + E).',
      },
    ],
  },

  'linked-list-reversal': {
    formalDefinition:
      'In-Place Linked List Reversal redirects each node’s next pointer to its predecessor using three rolling pointers (prev, curr, next) in O(n) time and O(1) auxiliary space, generalizing to bounded sublists and K-group chunks.',
    problemStatementForm:
      'Given a singly linked list head, reverse the entire list, reverse sublist [left, right], reverse every K-node group, or check palindrome / reorder list in-place.',
    logicBoard: [
      {
        step: '01 · Anchor Sentinel',
        condition: 'Reversing sublist or K-group that may include head',
        action: 'Allocate dummy.next = head; position groupPrev immediately before reversal start',
        invariant: 'groupPrev cleanly reconnects reversed head into the outer list',
      },
      {
        step: '02 · Save Next Link',
        condition: 'curr !== stopNode',
        action: 'Capture nextNode = curr.next before mutating curr.next',
        invariant: 'Prevents severing access to the remaining suffix',
      },
      {
        step: '03 · Flip & Advance',
        condition: 'nextNode captured',
        action: 'Set curr.next = prev; prev = curr; curr = nextNode',
        invariant: 'prev heads reversed prefix; curr heads untouched suffix',
      },
      {
        step: '04 · Stitch Boundaries',
        condition: 'Segment reversal completes',
        action: 'Connect groupPrev.next = newHead and oldHead.next = nextGroupHead',
        invariant: 'Zero cycles or dangling tails after segment splice',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Pointer Mutation Budget',
          formula: 'Rewires = n edges,   Auxiliary Memory = 3 pointers = O(1)',
          meaning: 'Matches information-theoretic lower bound for singly linked reversal.',
        },
        {
          name: 'K-Group Visit Bound',
          formula: 'Full groups = ⌊n / k⌋,   Total pointer steps ≤ 2n = O(n)',
          meaning: 'Lookahead verifies k nodes exist so partial tail stays unaltered.',
        },
      ],
      proofSketch:
        'At iteration t, the first t nodes form a valid reversed list headed at prev while nodes t+1..n remain intact from curr. At t = n, curr is null and prev is the exact reversed head.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Reverse list, reverse K-groups, reorder list, or O(1)-space palindrome linked list',
        recommendedPattern: 'In-Place Linked List Reversal',
        linkedId: 'linked-list-reversal',
        linkedKind: 'algorithm',
        whyItFits: 'Zero-allocation three-pointer rewiring handles all structural reversals.',
      },
      {
        ifYouSee: 'Need to locate exact midpoint before reversing second half',
        recommendedPattern: 'Fast & Slow Pointers',
        linkedId: 'fast-slow-pointers',
        linkedKind: 'algorithm',
        whyItFits: 'Finds midpoint in one pass without pre-counting list length.',
      },
      {
        ifYouSee: 'Merge K sorted linked lists',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Min-heap of size K extracts next smallest head in O(log K).',
      },
    ],
  },

  'shunting-yard-parser': {
    formalDefinition:
      'Dijkstra’s Shunting-Yard Algorithm converts infix arithmetic expressions to Reverse Polish Notation (RPN) or evaluates them directly in O(n) time using an operator stack governed by precedence, associativity, and parenthesis barriers.',
    problemStatementForm:
      'Given an infix expression string with numbers, parentheses, unary signs, and binary operators (+, -, *, /, ^), evaluate it respecting operator precedence and associativity.',
    logicBoard: [
      {
        step: '01 · Emit Operands',
        condition: 'Token is a number or identifier',
        action: 'Push directly to output queue (or operand value stack)',
        invariant: 'Operand relative ordering is invariant between infix and postfix',
      },
      {
        step: '02 · Pop Higher/Equal Ops',
        condition: 'Operator op₁ vs stack top op₂ ≠ "(" with prec(op₂) > prec(op₁) OR (equal & left-assoc)',
        action: 'Pop op₂ to output (or apply op₂ immediately to top two values) until condition breaks',
        invariant: 'Stack operators strictly increase in precedence inside any parenthesis frame',
      },
      {
        step: '03 · Handle Parentheses',
        condition: 'Token is "(" or ")"',
        action: 'Push "("; on ")" pop operators until matching "(" is discarded',
        invariant: 'Unmatched parentheses detected immediately if stack empties early',
      },
      {
        step: '04 · Drain Remaining Ops',
        condition: 'End of token stream',
        action: 'Pop all remaining operators to output/evaluator',
        invariant: 'Every token pushed once and popped at most once → O(n) time',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Associativity Pop Rule',
          formula: 'Pop op₂  ⟺  prec(op₂) > prec(op₁)  ∨  (prec(op₂) = prec(op₁) ∧ leftAssoc(op₁))',
          meaning: 'Evaluates 2^3^2 right-to-left (512) and 8-3-2 left-to-right (3).',
        },
        {
          name: 'Linear Token Bound',
          formula: 'T(n) = O(n) time,   Space = O(n) stack depth',
          meaning: 'Single-pass evaluation without materializing an explicit AST.',
        },
      ],
      proofSketch:
        'Each operator stays on the stack until every operand in its right subtree has been emitted, outputting the exact post-order traversal of the expression parse tree.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Basic Calculator I/II/III, infix-to-postfix, or precedence expression evaluation',
        recommendedPattern: 'Shunting-Yard Parser',
        linkedId: 'shunting-yard-parser',
        linkedKind: 'algorithm',
        whyItFits: 'Cleanly handles arbitrary precedence, associativity, and nested parentheses.',
      },
      {
        ifYouSee: 'Nearest greater/smaller element without grammar tokens',
        recommendedPattern: 'Monotonic Stack',
        linkedId: 'monotonic-stack',
        linkedKind: 'algorithm',
        whyItFits: 'Operator precedence stack is structurally a monotonic stack over precedence ranks.',
      },
      {
        ifYouSee: 'Recursive grammar with function calls or conditional syntax',
        recommendedPattern: 'Recursion & Divide-and-Conquer',
        linkedId: 'recursion-divide-conquer',
        linkedKind: 'topic',
        whyItFits: 'Recursive-descent parsing maps directly onto BNF grammar productions.',
      },
    ],
  },

  'hash-table-probing': {
    formalDefinition:
      'Hash Table Collision Resolution maps keys to bucket indices via h(k) mod m, resolving collisions via Separate Chaining or Open Addressing (Linear/Quadratic Probing, Double Hashing, Robin Hood) with tombstone deletion and load-factor rehashing.',
    problemStatementForm:
      'Design a cache-friendly O(1) expected dictionary or set supporting insert, lookup, and delete while controlling load factor α and clustering.',
    logicBoard: [
      {
        step: '01 · Compute Probe Sequence',
        condition: 'Inserting or searching key k in capacity m',
        action: 'Probe idx_i = (h₁(k) + f(i)) mod m where f(i) = i, c₁i+c₂i², or i·h₂(k)',
        invariant: 'For double hashing, gcd(h₂(k), m) = 1 visits every slot in the table',
      },
      {
        step: '02 · Resolve Match / Collision',
        condition: 'Slot is OCCUPIED',
        action: 'If slot.key === k return/update; else increment i++ (Robin Hood swaps if PSL > slot PSL)',
        invariant: 'Search stops immediately at first EMPTY_NEVER_USED slot',
      },
      {
        step: '03 · Tombstone Deletion',
        condition: 'Deleting key k in open addressing',
        action: 'Mark slot DELETED (tombstone) rather than EMPTY so subsequent probe chains stay intact',
        invariant: 'Inserts reuse first tombstone; searches continue past tombstones',
      },
      {
        step: '04 · Load-Factor Rehash',
        condition: '(occupied + tombstones) / m > threshold (0.5–0.75)',
        action: 'Double capacity m → 2m, re-insert live entries, purge all tombstones',
        invariant: 'Amortized O(1) operations via geometric capacity growth',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Open Addressing Expected Probes',
          formula: 'Uniform: 1 / (1 - α)   |   Linear Probing: ½(1 + 1 / (1 - α)²)',
          meaning: 'Shows why linear probing slows sharply past α > 0.7 due to primary clustering.',
        },
        {
          name: 'Double Hashing Full-Cycle Criterion',
          formula: 'h(k, i) = (h₁(k) + i · h₂(k)) mod m,   gcd(h₂(k), m) = 1',
          meaning: 'Prime m and h₂(k) ∈ [1, m-1] eliminate primary and secondary clustering.',
        },
      ],
      proofSketch:
        'Under uniform probing, the probability of ≥ i occupied probes is ≤ α^i. Summing ∑ α^i = 1/(1-α) proves O(1) expected lookup whenever α stays bounded below 1.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Design HashMap/HashSet or CPU cache-friendly in-memory lookup table',
        recommendedPattern: 'Hash Table Chaining & Open Addressing',
        linkedId: 'hash-table-probing',
        linkedKind: 'algorithm',
        whyItFits: 'Open addressing maximizes cache locality; chaining tolerates higher α.',
      },
      {
        ifYouSee: 'Approximate membership with tiny memory budget (false positives allowed)',
        recommendedPattern: 'Bloom Filter',
        linkedId: 'bloom-filter',
        linkedKind: 'algorithm',
        whyItFits: 'Bit array uses ~10 bits/key without storing raw keys.',
      },
      {
        ifYouSee: 'Distributing keys across dynamic servers with minimal remapping',
        recommendedPattern: 'Consistent Hashing & DHT',
        linkedId: 'consistent-hashing-dht',
        linkedKind: 'algorithm',
        whyItFits: 'Avoids O(N) remapping when server count m changes.',
      },
    ],
  },

  'binary-search': {
    formalDefinition:
      'Binary Search locates the exact boundary where a monotonic boolean predicate P(x) flips from False to True across an ordered domain [lo, hi] in ⌈log₂(hi - lo + 1)⌉ probes.',
    problemStatementForm:
      'Given a sorted/rotated array OR an optimization prompt ("minimize the maximum..." / "maximize the minimum...") with a fast O(n) feasibility check, find the exact optimal threshold.',
    logicBoard: [
      {
        step: '01 · Frame Search Space',
        condition: 'Index search vs. Answer-space search',
        action: 'Set lo = minPossible, hi = maxPossible so true answer strictly lies in [lo, hi]',
        invariant: 'Answer ∈ [lo, hi] holds initially and after every halving',
      },
      {
        step: '02 · Overflow-Safe Mid',
        condition: 'lo < hi',
        action: 'mid = lo + Math.floor((hi - lo) / 2) (add +1 bias when setting lo = mid)',
        invariant: 'Interval width strictly shrinks, preventing infinite loops at hi = lo + 1',
      },
      {
        step: '03 · Branch on Predicate',
        condition: 'feasible(mid) is True (searching first-True)',
        action: 'Keep mid: hi = mid; else discard mid: lo = mid + 1',
        invariant: 'First True remains trapped inside [lo, hi]',
      },
      {
        step: '04 · Return Boundary',
        condition: 'lo === hi',
        action: 'Verify A[lo] === target (exact search) or return lo directly (answer search)',
        invariant: 'Converges in O(log(hi - lo) · T_feasible)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Halving Recurrence',
          formula: 'T(N) = T(N/2) + T_check  ⟹  T(N) = O(T_check · log₂ N)',
          meaning: 'Reduces a 10⁹ search space to ≤ 30 feasibility checks.',
        },
        {
          name: 'Rotated Array Sorted-Half Property',
          formula: 'A[lo] ≤ A[mid] ⟹ left [lo..mid] sorted;  else right [mid..hi] sorted',
          meaning: 'At least one half of any rotated sorted array (distinct keys) is strictly sorted.',
        },
      ],
      proofSketch:
        'By monotonicity, P(mid) = True eliminates all x > mid from being first-True, and P(mid) = False eliminates all x ≤ mid. Halving interval width ⌈log₂ W⌉ times forces convergence at the exact transition.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Koko Eating Bananas, Split Array Largest Sum, Ship Packages, or rotated array',
        recommendedPattern: 'Binary Search',
        linkedId: 'binary-search',
        linkedKind: 'algorithm',
        whyItFits: 'Monotonic feasibility turns hard optimization into O(n log(maxVal)).',
      },
      {
        ifYouSee: 'Uniformly distributed large sorted numeric dataset',
        recommendedPattern: 'Interpolation Search',
        linkedId: 'interpolation-search',
        linkedKind: 'algorithm',
        whyItFits: 'Linear interpolation cuts expected probes to O(log log n).',
      },
      {
        ifYouSee: 'Unsorted array asking only for Kth largest element',
        recommendedPattern: 'Quickselect',
        linkedId: 'quickselect',
        linkedKind: 'algorithm',
        whyItFits: 'Expected O(n) selection without sorting.',
      },
    ],
  },

  'heap-intervals': {
    formalDefinition:
      'Sort + Min-Heap Interval Scheduling orders intervals by start time and tracks active resources by earliest end time in a Min-Heap, solving room allocation, concurrency peaks, and K-way merges in O(n log n) time.',
    problemStatementForm:
      'Given intervals [start, end] or K sorted streams, compute minimum concurrent rooms/machines, merge overlaps, or schedule prioritized tasks.',
    logicBoard: [
      {
        step: '01 · Sort by Start Time',
        condition: 'Input intervals unsorted',
        action: 'Sort ascending by interval.start (tie-break by end)',
        invariant: 'Intervals arrive in chronological activation order',
      },
      {
        step: '02 · Reuse Freed Resource',
        condition: 'Min-Heap non-empty AND minHeap.peek() <= curr.start',
        action: 'Pop earliest-ending interval (room freed) before pushing curr.end',
        invariant: 'Heap size equals active concurrent overlaps at curr.start',
      },
      {
        step: '03 · Allocate / Push',
        condition: 'No active interval has ended (minHeap.peek() > curr.start)',
        action: 'Push curr.end onto Min-Heap (allocates new concurrent room)',
        invariant: 'Heap root always exposes earliest-finishing active interval in O(1)',
      },
      {
        step: '04 · Extract Peak',
        condition: 'All intervals processed',
        action: 'Return heap.size (minimum rooms) or merged output list',
        invariant: 'O(n log n) runtime, O(n) worst-case space',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Interval Graph Chromatic Identity',
          formula: 'MinRooms = χ(G_interval) = ω(G_interval) = max_t |{i : s_i ≤ t < e_i}|',
          meaning: 'Minimum rooms strictly equals maximum simultaneous overlap at any time t.',
        },
        {
          name: 'K-Way Merge Bound',
          formula: 'T(N, K) = O(N log K),   Space = O(K)',
          meaning: 'Heap holds at most one active head per sorted stream.',
        },
      ],
      proofSketch:
        'When a new room opens at s_i, every already-allocated room has end > s_i, witnessing a point where all heap.size intervals overlap simultaneously—proving optimality.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Meeting Rooms II, CPU task scheduler, or Merge K Sorted Lists',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Min-Heap greedily reuses earliest-available resource in O(log n).',
      },
      {
        ifYouSee: 'Skyline outline, rectangle union area, or aggregate overlap counts',
        recommendedPattern: 'Sweep Line Events',
        linkedId: 'sweep-line-events',
        linkedKind: 'algorithm',
        whyItFits: 'Discrete (+1/-1) events simplify multi-interval sweeps.',
      },
      {
        ifYouSee: 'Maximize non-overlapping intervals on ONE machine',
        recommendedPattern: 'Greedy Algorithms',
        linkedId: 'greedy-algorithms',
        linkedKind: 'algorithm',
        whyItFits: 'Sorting by earliest end time solves single-room selection without a heap.',
      },
    ],
  },

  'merge-sort-divide-conquer': {
    formalDefinition:
      'Merge Sort recursively splits an array into balanced halves, sorts each half, and performs a stable linear O(n) two-pointer merge, guaranteeing O(n log n) worst-case time while enabling inversion counting across split boundaries.',
    problemStatementForm:
      'Sort linked lists or arrays stably in guaranteed O(n log n) worst-case time, or count cross-index pairs (inversions, reverse pairs, range sums) during merge.',
    logicBoard: [
      {
        step: '01 · Base Return',
        condition: 'left >= right (size ≤ 1)',
        action: 'Return immediately (sorted, 0 inversions)',
        invariant: 'Single-element slices are trivially sorted',
      },
      {
        step: '02 · Recurse Halves',
        condition: 'left < right',
        action: 'mid = left + ((right - left) >> 1); recurse on [left..mid] and [mid+1..right]',
        invariant: 'Both halves return independently sorted',
      },
      {
        step: '03 · Cross-Split Count',
        condition: 'Counting inversions (A[i] > A[j]) or reverse pairs (A[i] > 2·A[j])',
        action: 'When right element A[j] beats A[i], add (mid - i + 1) to count',
        invariant: 'All remaining A[i..mid] are strictly larger than A[j]',
      },
      {
        step: '04 · Stable Linear Merge',
        condition: 'Merging halves into temp buffer',
        action: 'Choose A[i] when A[i] <= A[j] (≤ preserves stability!), then copy back',
        invariant: 'Combined range [left..right] is globally sorted and stable',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Master Theorem Case 2',
          formula: 'T(n) = 2T(n/2) + Θ(n)  ⟹  T(n) = Θ(n log n)  (best, avg, worst)',
          meaning: 'Immune to adversarial pivot inputs.',
        },
        {
          name: 'Cross-Half Inversion Count',
          formula: 'A[i] > A[j] (i ≤ mid < j)  ⟹  Δinversions = mid - i + 1',
          meaning: 'Counts all pairs (k, j) for k ∈ [i..mid] in O(1).',
        },
      ],
      proofSketch:
        'Each recursion level partitions n items into sorted runs merged in Θ(n) total work across ⌈log₂ n⌉ levels, yielding Θ(n log n).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Count inversions, reverse pairs, or O(n log n) linked list sort',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Stable linear merge counts cross-half order violations cleanly.',
      },
      {
        ifYouSee: 'Dataset exceeds RAM and lives on disk',
        recommendedPattern: 'External K-Way Merge Sort',
        linkedId: 'external-kway-merge',
        linkedKind: 'algorithm',
        whyItFits: 'Extends 2-way merge to K disk runs using a Min-Heap.',
      },
      {
        ifYouSee: 'Need O(1) extra space with guaranteed O(n log n) worst case',
        recommendedPattern: 'Heapify & Heap Sort',
        linkedId: 'heapify-heapsort',
        linkedKind: 'algorithm',
        whyItFits: 'Removes Merge Sort’s O(n) auxiliary buffer.',
      },
    ],
  },

  'cyclic-sort': {
    formalDefinition:
      'Cyclic Sort exploits the bijection between values in [1..n] (or [0..n-1]) and array indices by repeatedly swapping each misplaced value directly to its home slot, running in O(n) time and O(1) space.',
    problemStatementForm:
      'Given a mutable array containing integers in [1..n] or [0..n], find First Missing Positive, all missing numbers, or all duplicates in O(n) time and O(1) space.',
    logicBoard: [
      {
        step: '01 · Compute Home Slot',
        condition: 'Inspecting A[i]',
        action: 'Target slot target = A[i] - 1 (for 1..n domain)',
        invariant: 'Valid in-range values satisfy 0 <= target < n',
      },
      {
        step: '02 · Swap While Misplaced',
        condition: '1 <= A[i] <= n AND A[i] !== A[target]',
        action: 'Swap A[i] with A[target]; do NOT increment i yet',
        invariant: 'Each swap seats at least one new value permanently at its home slot',
      },
      {
        step: '03 · Advance Pointer',
        condition: 'A[i] out of range, already seated, or duplicates A[target]',
        action: 'Increment i ← i + 1',
        invariant: 'A[i] !== A[target] guard prevents infinite swap loops on duplicates',
      },
      {
        step: '04 · Scan Mismatches',
        condition: 'Placement pass done',
        action: 'Index i where A[i] !== i + 1 reveals missing (i + 1) and duplicate A[i]',
        invariant: 'Total swaps across full array ≤ n → O(n) time',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Potential Function Swap Bound',
          formula: 'Φ = |{j : A[j] ≠ j + 1}|,   each swap reduces Φ by ≥ 1  ⟹  Swaps ≤ n',
          meaning: 'Proves nested while-loop runs at most n times across the entire array.',
        },
        {
          name: 'First Missing Positive Pigeonhole Bound',
          formula: 'FirstMissingPositive(A[0..n-1]) ∈ [1, n + 1]',
          meaning: 'Values ≤ 0 or > n can be safely ignored.',
        },
      ],
      proofSketch:
        'Every swap moves a non-seated value into its exact home index, strictly raising the count of seated indices by ≥ 1. Since at most n slots exist, total swaps ≤ n.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'First Missing Positive, Find All Duplicates, or Missing Number in [1..n] O(1) space',
        recommendedPattern: 'Cyclic Sort',
        linkedId: 'cyclic-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Uses the array itself as a zero-overhead hash map in O(n) time, O(1) space.',
      },
      {
        ifYouSee: 'Read-only array with one duplicate in [1..n] and O(1) space',
        recommendedPattern: 'Fast & Slow Pointers',
        linkedId: 'fast-slow-pointers',
        linkedKind: 'algorithm',
        whyItFits: 'Finds duplicate as cycle entry without mutating the array.',
      },
      {
        ifYouSee: 'Arbitrary unbounded integer keys',
        recommendedPattern: 'Arrays & Hashing',
        linkedId: 'arrays-hashing',
        linkedKind: 'topic',
        whyItFits: 'Hash set handles unbounded key domains in O(n).',
      },
    ],
  },

  'sweep-line-events': {
    formalDefinition:
      'The Sweep Line Paradigm reduces 1D/2D interval and geometric problems into a sorted sequence of endpoint events (x, Δtype), scanning a virtual line across x while maintaining only the active cross-section state.',
    problemStatementForm:
      'Given intervals, building silhouettes (Skyline), calendar bookings, or axis-aligned rectangles, compute peak overlap, total covered measure, or skyline key points.',
    logicBoard: [
      {
        step: '01 · Emit Endpoint Events',
        condition: 'Each interval [L, R] or building [L, R, H]',
        action: 'Create start event (L, +1 / +H) and end event (R, -1 / -H)',
        invariant: 'Cross-section state changes exclusively at these 2n coordinates',
      },
      {
        step: '02 · Tie-Break Same X',
        condition: 'Multiple events share coordinate x',
        action: 'Sort end before start for [L, R) overlap; higher start before lower end for Skyline',
        invariant: 'Eliminates phantom spikes or duplicate key points at touching boundaries',
      },
      {
        step: '03 · Sweep Cross-Section',
        condition: 'Advancing x_prev → x_curr',
        action: 'Add (x_curr - x_prev) if active > 0; apply event Δ to counter/heap',
        invariant: 'State is constant across open strip (x_prev, x_curr)',
      },
      {
        step: '04 · Record State Change',
        condition: 'Active maximum height or peak count changes',
        action: 'Emit (x_curr, newMax) or update globalPeak',
        invariant: 'O(n log n) total runtime independent of coordinate magnitude (up to 10⁹)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Interval Union Measure Formula',
          formula: 'Measure(⋃ [L_i, R_i]) = ∑_k (x_{k+1} - x_k) · 𝟙[active(x_k) > 0]',
          meaning: 'Integrates exact covered length without double-counting overlaps.',
        },
        {
          name: 'Event Complexity Bound',
          formula: '2n events  ⟹  Sort O(n log n) + Sweep O(n log n) = O(n log n)',
          meaning: 'Avoids coordinate arrays when coordinates span 10⁹.',
        },
      ],
      proofSketch:
        'Active intervals are piecewise constant between sorted endpoints, so evaluating transitions strictly at the 2n events captures every peak and outline transition.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'The Skyline Problem, Rectangle Area II, or peak bookings across huge coordinates',
        recommendedPattern: 'Sweep Line Events',
        linkedId: 'sweep-line-events',
        linkedKind: 'algorithm',
        whyItFits: 'Handles 10⁹ coordinate spans via 2n sorted boundary events.',
      },
      {
        ifYouSee: 'Need to allocate specific room IDs or merge K streams',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Min-Heap tracks individual active resource IDs directly.',
      },
      {
        ifYouSee: '2D rectangle union area needing dynamic active Y-length',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Maintains active vertical coverage in O(log n) per sweep event.',
      },
    ],
  },

  'dual-heaps-median': {
    formalDefinition:
      'Two-Heap Median Maintenance splits a numeric stream into a lower Max-Heap and an upper Min-Heap whose sizes differ by at most 1, delivering O(log n) insertion and O(1) exact median queries.',
    problemStatementForm:
      'Given an online stream of numbers (or sliding window of size K), support addNum(x) and findMedian() without re-sorting on every arrival.',
    logicBoard: [
      {
        step: '01 · Route Element',
        condition: 'New value x arrives',
        action: 'Push x to lower Max-Heap if empty or x <= lo.peek(), else upper Min-Heap',
        invariant: 'Ordering invariant: max(lo) <= min(hi)',
      },
      {
        step: '02 · Rebalance Sizes',
        condition: 'lo.size > hi.size + 1 OR hi.size > lo.size',
        action: 'Pop root from larger heap and push into smaller heap',
        invariant: 'Size invariant: 0 <= lo.size - hi.size <= 1',
      },
      {
        step: '03 · O(1) Median Read',
        condition: 'findMedian() invoked',
        action: 'If lo.size > hi.size return lo.peek(); else return (lo.peek() + hi.peek()) / 2',
        invariant: 'Exact middle order statistic(s) reside directly at the two roots',
      },
      {
        step: '04 · Lazy Deletion (Window)',
        condition: 'Sliding window expires an interior element',
        action: 'Increment dead[val]++, adjust logical balance, prune dead roots when exposed',
        invariant: 'Preserves O(log k) amortized deletion without O(k) heap search',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dual-Heap Partition Invariant',
          formula: '∀a ∈ Lo, ∀b ∈ Hi: a ≤ b   ∧   0 ≤ |Lo| - |Hi| ≤ 1',
          meaning: 'Guarantees Lo.top is the ⌈n/2⌉-th order statistic at every step.',
        },
        {
          name: 'Streaming Latency Bound',
          formula: 'addNum: O(log n),   findMedian: O(1),   Space: O(n)',
          meaning: 'At most 1 push + 1 rebalance transfer per insertion.',
        },
      ],
      proofSketch:
        'Because max(Lo) ≤ min(Hi) and |Lo| = ⌈n/2⌉, Lo.top is ≥ ⌈n/2⌉ elements and ≤ ⌊n/2⌋ + 1 elements—matching the exact definition of the median.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Find Median from Data Stream, Sliding Window Median, or IPO maximization',
        recommendedPattern: 'Two-Heap Median Maintenance',
        linkedId: 'dual-heaps-median',
        linkedKind: 'algorithm',
        whyItFits: 'Exposes the exact midpoint boundary in O(1) with O(log n) updates.',
      },
      {
        ifYouSee: 'Only need Top-K largest/smallest (not the 50th percentile)',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Single size-K heap uses O(K) space instead of O(n).',
      },
      {
        ifYouSee: 'Static unsorted array asking for median once',
        recommendedPattern: 'Quickselect',
        linkedId: 'quickselect',
        linkedKind: 'algorithm',
        whyItFits: 'O(n) expected selection beats O(n log n) heap building.',
      },
    ],
  },

  'linear-search': {
    formalDefinition:
      'Linear Search sequentially scans A[0..n-1] against a target predicate until a match is found or the end is reached, requiring zero ordering preconditions in O(n) worst-case time and O(1) space.',
    problemStatementForm:
      'Given an unsorted array, linked list, or streaming predicate with no preprocessing budget, find the first/last match or global extremum.',
    logicBoard: [
      {
        step: '01 · Initialize Cursor',
        condition: 'Start at i = 0',
        action: 'Optionally place sentinel at A[n] to remove loop bounds check',
        invariant: 'No index in [0..i-1] satisfies target predicate',
      },
      {
        step: '02 · Evaluate Predicate',
        condition: 'i < n',
        action: 'If P(A[i]) is true, return i immediately (early exit)',
        invariant: 'Left-to-right scan guarantees first-match index',
      },
      {
        step: '03 · Sequential Advance',
        condition: 'P(A[i]) is false',
        action: 'Increment i ← i + 1 (unit stride maximizes CPU prefetch)',
        invariant: 'Beats binary search on tiny arrays (n ≤ 32) due to zero branch mispredicts',
      },
      {
        step: '04 · Miss Result',
        condition: 'i === n',
        action: 'Return -1',
        invariant: 'Matches Ω(n) lower bound for unstructured search',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Expected Successful Comparisons',
          formula: 'E[comparisons] = (1/n) · ∑_{i=1}^{n} i = (n + 1) / 2',
          meaning: 'Uniform random target requires inspecting half the sequence on average.',
        },
        {
          name: 'Unstructured Lower Bound',
          formula: 'T_worst(n) ≥ n   (adversary hides target in last uninspected slot)',
          meaning: 'Proves O(n) is optimal without prior sorting or indexing.',
        },
      ],
      proofSketch:
        'If any deterministic search stops before reading all n slots without a hit, an adversary can place the target in an unread slot, proving Ω(n) is tight.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Single query on unsorted data or tiny array (n ≤ 32)',
        recommendedPattern: 'Linear Search',
        linkedId: 'linear-search',
        linkedKind: 'algorithm',
        whyItFits: 'O(n) beats O(n log n) sort + search for one-off queries.',
      },
      {
        ifYouSee: 'Data is sorted or queried many times',
        recommendedPattern: 'Binary Search',
        linkedId: 'binary-search',
        linkedKind: 'algorithm',
        whyItFits: 'Drops query latency from O(n) to O(log n).',
      },
      {
        ifYouSee: 'Repeated exact equality lookups on unsorted keys',
        recommendedPattern: 'Hash Table Chaining & Open Addressing',
        linkedId: 'hash-table-probing',
        linkedKind: 'algorithm',
        whyItFits: 'O(n) preprocessing unlocks O(1) expected lookups.',
      },
    ],
  },

  'interpolation-search': {
    formalDefinition:
      'Interpolation Search probes a sorted numeric array at the linearly interpolated index pos = lo + ⌊((x - A[lo]) / (A[hi] - A[lo])) · (hi - lo)⌋, achieving O(log log n) expected time on uniformly distributed keys and O(n) worst case on skewed keys.',
    problemStatementForm:
      'Given a huge sorted array of uniformly distributed numeric keys (timestamps, sequential IDs), locate target with minimal page/memory probes.',
    logicBoard: [
      {
        step: '01 · Range Guard',
        condition: 'lo <= hi && x >= A[lo] && x <= A[hi]',
        action: 'Return -1 immediately if x lies outside [A[lo], A[hi]]',
        invariant: 'Prevents out-of-bounds index extrapolation',
      },
      {
        step: '02 · Zero-Denominator Check',
        condition: 'A[lo] === A[hi]',
        action: 'Return lo if A[lo] === x else -1',
        invariant: 'Prevents divide-by-zero on flat ranges',
      },
      {
        step: '03 · Linear Probe Estimate',
        condition: 'A[lo] < A[hi]',
        action: 'pos = lo + Math.floor(((x - A[lo]) * (hi - lo)) / (A[hi] - A[lo]))',
        invariant: 'Lands within O(√(hi - lo)) of true rank for uniform keys',
      },
      {
        step: '04 · Narrow Bounds',
        condition: 'Compare A[pos] vs x',
        action: 'Equal → pos; A[pos] < x → lo = pos + 1; else hi = pos - 1',
        invariant: 'Width shrinks w → √w per probe → O(log log n) expected iterations',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Linear Value Interpolation Formula',
          formula: 'pos = lo + ⌊ ((x - A[lo]) / (A[hi] - A[lo])) · (hi - lo) ⌋',
          meaning: 'Estimates index proportion directly from value proportion.',
        },
        {
          name: 'Double-Logarithmic Recurrence',
          formula: 'T(n) = T(√n) + O(1)  ⟹  T(n) = O(log log n)',
          meaning: '~5 probes for n = 10⁹ uniform keys vs 30 for Binary Search.',
        },
      ],
      proofSketch:
        'For n i.i.d. uniform keys, the rank deviation from linear interpolation has standard deviation O(√n). Repeating √-shrinkage k times yields n^{1/2^k} = O(1) at k = O(log log n).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Huge uniformly distributed sorted timestamps or dense numeric IDs',
        recommendedPattern: 'Interpolation Search',
        linkedId: 'interpolation-search',
        linkedKind: 'algorithm',
        whyItFits: 'Expected O(log log n) probes sharply reduces expensive page reads.',
      },
      {
        ifYouSee: 'Skewed, exponential, or non-numeric sorted arrays',
        recommendedPattern: 'Binary Search',
        linkedId: 'binary-search',
        linkedKind: 'algorithm',
        whyItFits: 'Strict O(log n) worst-case guarantee regardless of key distribution.',
      },
      {
        ifYouSee: 'Dynamic disk-backed database range index with inserts/deletes',
        recommendedPattern: 'B+ Tree Page Splitting & Merging',
        linkedId: 'bplus-tree-storage',
        linkedKind: 'algorithm',
        whyItFits: 'Maintains balanced low-height disk pages under concurrent mutations.',
      },
    ],
  },

  'elementary-sorts': {
    formalDefinition:
      'Bubble, Selection, and Insertion Sort are O(n²) in-place comparison sorts; Insertion Sort achieves O(n + I) adaptive linear time on nearly sorted inputs (I = inversions), making it the production leaf sorter inside Timsort and Introsort.',
    problemStatementForm:
      'Sort tiny partitions (n ≤ 32), k-sorted / nearly sorted streams, or minimize physical writes (Selection Sort) in O(1) auxiliary space.',
    logicBoard: [
      {
        step: '01 · Insertion Prefix',
        condition: 'Processing key = A[i] for i = 1..n-1',
        action: 'Shift elements A[j] > key right; insert key at j + 1',
        invariant: 'Prefix A[0..i] stays sorted and stable',
      },
      {
        step: '02 · Selection Min-Write',
        condition: 'Minimizing physical swaps (e.g., EEPROM/flash)',
        action: 'Find minIdx in A[i..n-1] and perform at most 1 swap with A[i]',
        invariant: '≤ n - 1 total swaps (minimum possible), but unstable',
      },
      {
        step: '03 · Bubble Early Exit',
        condition: 'Pass finishes with swapped === false',
        action: 'Terminate in O(n) on already-sorted arrays',
        invariant: 'Pass k locks the k largest elements at suffix A[n-k..n-1]',
      },
      {
        step: '04 · Hybrid Cutoff',
        condition: 'Unsorted partition size n > 32',
        action: 'Delegate to Merge Sort, QuickSort, or Heap Sort',
        invariant: 'Prevents quadratic blowup on large random inputs',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Insertion Sort Inversion-Adaptive Bound',
          formula: 'T_insertion(n) = Θ(n + I),   I = |{(i, j) : i < j ∧ A[i] > A[j]}|',
          meaning: 'Linear O(n) when I = O(n) (nearly sorted) and O(nk) for k-sorted arrays.',
        },
        {
          name: 'Worst-Case Pairwise Inversions',
          formula: 'I_max = n(n - 1) / 2 = Θ(n²)',
          meaning: 'Reverse-sorted arrays trigger maximum shifts.',
        },
      ],
      proofSketch:
        'Each shift in Insertion Sort removes exactly one inversion, and each outer iteration adds 1 terminating comparison, giving n - 1 + I comparisons total.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Small subarrays (n ≤ 32) or almost-sorted input streams',
        recommendedPattern: 'Bubble, Insertion, & Selection Sort',
        linkedId: 'elementary-sorts',
        linkedKind: 'algorithm',
        whyItFits: 'Insertion Sort’s O(n + I) adaptivity and zero recursion overhead beat O(n log n) sorts.',
      },
      {
        ifYouSee: 'Large arrays needing guaranteed O(n log n) stability',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Guarantees O(n log n) even on reverse-sorted data.',
      },
      {
        ifYouSee: 'Bounded integer keys [0..K]',
        recommendedPattern: 'Counting Sort & Radix Sort',
        linkedId: 'counting-radix-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Achieves O(n + K) non-comparison linear sorting.',
      },
    ],
  },

  'heapify-heapsort': {
    formalDefinition:
      'Heap Sort builds an in-place Max-Heap in O(n) via Floyd’s bottom-up sift-down and repeatedly swaps the maximum root into the shrinking tail followed by O(log n) sift-down, achieving guaranteed O(n log n) worst-case time in O(1) space.',
    problemStatementForm:
      'Sort an array in-place with strict O(1) auxiliary space and guaranteed O(n log n) worst-case latency (no QuickSort quadratic risk), or build a heap in O(n).',
    logicBoard: [
      {
        step: '01 · Bottom-Up Build-Heap',
        condition: 'i = Math.floor(n / 2) - 1 down to 0',
        action: 'Run siftDown(A, i, n) on internal nodes (leaves already satisfy heap order)',
        invariant: 'Array A[0..n-1] becomes a valid Max-Heap in O(n) linear time',
      },
      {
        step: '02 · Swap Root to Tail',
        condition: 'end = n - 1 down to 1',
        action: 'Swap A[0] (current global max) with A[end]',
        invariant: 'Suffix A[end..n-1] is permanently sorted ascending',
      },
      {
        step: '03 · Restore Heap Prefix',
        condition: 'New root A[0] violates heap order in [0..end-1]',
        action: 'Run siftDown(A, 0, end) swapping with larger child',
        invariant: 'Prefix A[0..end-1] regains Max-Heap invariant in O(log end)',
      },
      {
        step: '04 · Stability Audit',
        condition: 'Equal keys need original relative ordering preserved',
        action: 'Use Merge Sort instead (long-range heap swaps are unstable)',
        invariant: 'Choose Heap Sort for O(1)-space worst-case guarantees (e.g., Introsort fallback)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Floyd Build-Heap Linear Bound',
          formula: 'T_build(n) ≤ ∑_{h=0}^{⌊log₂ n⌋} (n / 2^{h+1}) · 2h ≤ 2n = O(n)',
          meaning: 'Half the nodes have height 0; only the root has height log n.',
        },
        {
          name: 'Extraction Phase Bound',
          formula: 'T_extract(n) = ∑_{k=2}^{n} O(log k) = O(n log n),   Space = O(1)',
          meaning: 'Strict worst-case O(n log n) with zero auxiliary arrays.',
        },
      ],
      proofSketch:
        'Bottom-up induction ensures both child subtrees are valid Max-Heaps before siftDown(i), restoring the heap invariant at i. Extracting n-1 roots sorts the entire array in-place.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Strict O(1) space + guaranteed O(n log n) worst-case sorting',
        recommendedPattern: 'Heapify & Heap Sort',
        linkedId: 'heapify-heapsort',
        linkedKind: 'algorithm',
        whyItFits: 'Zero quadratic worst-case risk and O(1) space.',
      },
      {
        ifYouSee: 'Only need Top-K elements rather than full sort',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Build-heap + K pops runs in O(n + K log n).',
      },
      {
        ifYouSee: 'Need stable sorting with strong sequential cache locality',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Preserves order of equal keys cleanly.',
      },
    ],
  },

  'counting-radix-sort': {
    formalDefinition:
      'Counting Sort orders keys in [0..K] by tallying bucket frequencies and prefix-summing output offsets in O(n + K) stable time; LSD Radix Sort applies stable Counting Sort digit-by-digit from least to most significant digit in O(d(n + b)) time.',
    problemStatementForm:
      'Given non-negative integers or fixed-width strings with bounded range or digit count d, sort in linear time (Maximum Gap, Sort Colors, large 32/64-bit integer arrays).',
    logicBoard: [
      {
        step: '01 · Tally Frequencies',
        condition: 'Digit pass exp = b^p',
        action: 'Extract digit d = Math.floor(A[i] / exp) % b and increment count[d]++',
        invariant: 'count[d] stores exact frequency of digit d at current radix',
      },
      {
        step: '02 · Prefix-Sum Offsets',
        condition: 'Frequencies tallied over [0..b-1]',
        action: 'Accumulate count[d] += count[d - 1] for d = 1..b-1',
        invariant: 'count[d] marks 1 past final output slot for bucket d',
      },
      {
        step: '03 · Backward Stable Scatter',
        condition: 'Iterating i = n - 1 DOWN TO 0',
        action: 'Write A[i] to out[--count[digit(A[i])]]',
        invariant: 'Backward scatter preserves relative order from earlier (less-significant) passes',
      },
      {
        step: '04 · Next Radix Digit',
        condition: 'exp *= b <= maxVal',
        action: 'Copy out → A and advance to next digit (flip sign bit for signed ints)',
        invariant: 'After pass p, array is stably sorted on its last p digits',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Counting & Radix Complexity',
          formula: 'Counting: O(n + K)   |   Radix: O(d · (n + b)),  d = ⌊log_b(M)⌋ + 1',
          meaning: 'Breaks the Ω(n log n) comparison bound via direct bucket addressing.',
        },
        {
          name: 'Byte/16-Bit Hardware Radix',
          formula: 'b = 2⁸ (4 passes for 32-bit int) or b = 2¹⁶ (2 passes)',
          meaning: 'Replaces integer division with bitwise shift and mask.',
        },
      ],
      proofSketch:
        'By induction on digit p, stability of pass p preserves already-sorted order on lower p-1 digits whenever p-th digits tie, yielding a globally sorted array after d passes.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Maximum Gap in O(n), Sort Colors, or huge arrays of integers',
        recommendedPattern: 'Counting Sort & Radix Sort',
        linkedId: 'counting-radix-sort',
        linkedKind: 'algorithm',
        whyItFits: 'True O(n) linear sorting when key range or bit-width is bounded.',
      },
      {
        ifYouSee: 'Keys strictly in [1..n] requiring O(1) extra space',
        recommendedPattern: 'Cyclic Sort',
        linkedId: 'cyclic-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Eliminates Counting Sort’s O(n + K) auxiliary buffer.',
      },
      {
        ifYouSee: 'Arbitrary custom object comparators',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Handles arbitrary total comparators stably.',
      },
    ],
  },

  'tree-bfs-dfs': {
    formalDefinition:
      'Tree DFS (Pre-order, In-order, Post-order) traverses rooted trees vertically in O(n) time and O(h) stack space for subtree aggregation and BST ordering, while Tree BFS traverses horizontally level-by-level via a FIFO queue in O(w) width space.',
    problemStatementForm:
      'Given a binary or N-ary tree, compute height, diameter, max path sum, BST validation, serialization, level-order views, or minimum depth.',
    logicBoard: [
      {
        step: '01 · Pick Visit Timing',
        condition: 'Pre-order (clone/bounds) · In-order (BST sort) · Post-order (height/diameter) · BFS (levels)',
        action: 'Align work before/between/after children with information flow direction',
        invariant: 'Every node and edge visited once → O(n) time',
      },
      {
        step: '02 · Separate Return vs Global',
        condition: 'Bent paths (diameter, max path sum)',
        action: 'Update globalBest with left + right + val; return single arm max(left, right) + val',
        invariant: 'Returned value always represents a single parent-extendable path',
      },
      {
        step: '03 · BFS Level Snapshot',
        condition: 'Level averages, right-side view, or zigzag traversal',
        action: 'Freeze size = queue.length at level start; pop exactly size nodes',
        invariant: 'Queue strictly separates depth d from depth d + 1',
      },
      {
        step: '04 · O(1)-Space Morris Option',
        condition: 'Recursion stack O(h) prohibited',
        action: 'Temporarily thread in-order predecessor’s right child to curr and restore on second visit',
        invariant: 'O(n) time, O(1) space while leaving tree intact',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Tree Time & Space Bounds',
          formula: 'Time = Θ(n)   |   DFS Space = O(h) ∈ [log n, n]   |   BFS Space = O(w) ≤ ⌈n/2⌉',
          meaning: 'DFS saves memory on wide balanced trees; BFS saves memory on deep skinny trees.',
        },
        {
          name: 'Full Binary Tree Leaf Identity',
          formula: 'Leaves = InternalNodes + 1',
          meaning: 'Bottom level of a complete binary tree holds ≈ n/2 nodes.',
        },
      ],
      proofSketch:
        'DFS traverses each of the n - 1 tree edges once downward and once upward (2n - 2 crossings), guaranteeing Θ(n) runtime and structural induction validity.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Diameter, max path sum, BST Kth smallest, or level-order / right-side view',
        recommendedPattern: 'Tree BFS & DFS Traversals',
        linkedId: 'tree-bfs-dfs',
        linkedKind: 'algorithm',
        whyItFits: 'Matches vertical subtree aggregation or horizontal depth grouping.',
      },
      {
        ifYouSee: 'Repeated LCA or Kth-ancestor queries on static trees',
        recommendedPattern: 'Binary Lifting & LCA',
        linkedId: 'binary-lifting-lca',
        linkedKind: 'algorithm',
        whyItFits: 'Answers LCA in O(log n) instead of O(n) per query.',
      },
      {
        ifYouSee: 'Compute subtree answer for EVERY node as root',
        recommendedPattern: 'DP on Trees & Rerooting',
        linkedId: 'dp-on-trees-rerooting',
        linkedKind: 'algorithm',
        whyItFits: 'Two-pass DFS computes all n roots in O(n) total.',
      },
    ],
  },

  'graph-topo-sort': {
    formalDefinition:
      'Topological Sort orders vertices of a Directed Acyclic Graph (DAG) so u precedes v for every directed edge u → v; Kahn’s BFS peels zero in-degree vertices in O(V + E) and detects cycles whenever fewer than |V| vertices are emitted.',
    problemStatementForm:
      'Given tasks, courses, or build modules with prerequisite edges u → v, compute a valid execution order, detect cyclic deadlocks, or find longest/critical DAG paths.',
    logicBoard: [
      {
        step: '01 · Build Graph & In-Degrees',
        condition: 'Prerequisite edge u → v',
        action: 'Push v to adj[u] and increment inDegree[v]++',
        invariant: 'inDegree[v] equals exact remaining prerequisite count of v',
      },
      {
        step: '02 · Seed Zero Frontier',
        condition: 'All edges processed',
        action: 'Enqueue every vertex with inDegree === 0 (use Min-Heap for lexicographical order)',
        invariant: 'Queued nodes have zero unsatisfied dependencies',
      },
      {
        step: '03 · Peel & Relax',
        condition: 'Queue non-empty',
        action: 'Pop u, append to order; decrement inDegree[v] for each v ∈ adj[u], enqueueing on 0',
        invariant: 'Each edge relaxed exactly once → O(V + E) time',
      },
      {
        step: '04 · Cycle Verdict',
        condition: 'Queue empties',
        action: 'If order.length === V return order; else cycle detected (return empty)',
        invariant: 'Nodes inside or downstream of any cycle keep inDegree ≥ 1 forever',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Topological Existence Theorem',
          formula: 'G admits a topological ordering  ⟺  G is a DAG (acyclic)',
          meaning: 'Every non-empty finite DAG contains at least one source with inDegree = 0.',
        },
        {
          name: 'DAG Shortest / Longest Path DP',
          formula: 'dist[v] = opt_{(u→v) ∈ E} (dist[u] + w(u, v))   in O(V + E)',
          meaning: 'Topological DP handles negative edges and longest paths in linear time.',
        },
      ],
      proofSketch:
        'Following incoming edges backward in a finite acyclic graph must hit a vertex with inDegree = 0. Peeling that vertex leaves a smaller DAG; induction guarantees all |V| vertices emit in valid order.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Course Schedule, Alien Dictionary, build order, or DAG critical path',
        recommendedPattern: 'Topological Sort (Kahn)',
        linkedId: 'graph-topo-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Peels prerequisite layers and detects deadlocks in O(V + E).',
      },
      {
        ifYouSee: 'Directed graph contains cycles that need collapsing into a DAG',
        recommendedPattern: 'Tarjan & Kosaraju SCC',
        linkedId: 'tarjan-kosaraju-scc',
        linkedKind: 'algorithm',
        whyItFits: 'Condensing SCCs transforms any directed graph into a DAG.',
      },
      {
        ifYouSee: 'Undirected connectivity or incremental cycle detection',
        recommendedPattern: 'Union-Find (DSU)',
        linkedId: 'union-find-dsu',
        linkedKind: 'algorithm',
        whyItFits: 'DSU handles undirected cycles in O(α(V)).',
      },
    ],
  },

  'dijkstra-shortest-path': {
    formalDefinition:
      'Dijkstra’s Algorithm computes single-source shortest paths on graphs with non-negative edge weights w(u, v) ≥ 0 by greedily settling the closest unsettled vertex from a Min-Heap and relaxing its outgoing edges in O((V + E) log V) time.',
    problemStatementForm:
      'Given a weighted graph with w(u, v) ≥ 0 (network latency, road map, min-effort grid path), compute shortest distance from source s to target t or all vertices.',
    logicBoard: [
      {
        step: '01 · Seed Source',
        condition: 'Initializing distances',
        action: 'Set dist[v] = +∞, dist[s] = 0, push (0, s) into Min-Heap',
        invariant: 'dist[v] is always an upper bound on true shortest path δ(s, v)',
      },
      {
        step: '02 · Pop & Skip Stale',
        condition: 'Pop (d, u) from Min-Heap',
        action: 'If d > dist[u] immediately continue (stale duplicate entry)',
        invariant: 'With w ≥ 0, first non-stale pop permanently settles dist[u] = δ(s, u)',
      },
      {
        step: '03 · Relax Outgoing Edges',
        condition: 'For each neighbor (v, w) of u',
        action: 'If dist[u] + w < dist[v], update dist[v] = dist[u] + w and push (dist[v], v)',
        invariant: 'Restores triangle inequality dist[v] ≤ dist[u] + w(u, v)',
      },
      {
        step: '04 · Negative Weight Guard',
        condition: 'Any edge has w(u, v) < 0',
        action: 'Do NOT use Dijkstra; switch to Bellman-Ford',
        invariant: 'Negative edges can lower an already-settled vertex, breaking greedy lock-in',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Edge Relaxation Inequality',
          formula: 'if  dist[u] + w(u, v) < dist[v]  then  dist[v] ← dist[u] + w(u, v)',
          meaning: 'Monotonically tightens path upper bounds until exact convergence.',
        },
        {
          name: 'Binary Heap Runtime',
          formula: 'T = O((V + E) log V)   (at most E lazy entries pushed)',
          meaning: 'Clean lazy-duplicate heap avoids complex decrease-key pointers.',
        },
      ],
      proofSketch:
        'If u were the first settled vertex with dist[u] > δ(s, u), let (x, y) be the first edge leaving the settled set along a true shortest path s ⇝ u. Then dist[y] ≤ δ(s, y) ≤ δ(s, u) < dist[u] (using w ≥ 0), contradicting that u was the heap minimum.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Network Delay Time, Path With Minimum Effort, or weighted routing (w ≥ 0)',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Optimal greedy shortest-path engine for non-negative weights.',
      },
      {
        ifYouSee: 'Negative edge weights or K-stops constrained shortest path',
        recommendedPattern: 'Bellman-Ford Algorithm',
        linkedId: 'bellman-ford',
        linkedKind: 'algorithm',
        whyItFits: 'Handles negative weights and exact hop-count bounds safely.',
      },
      {
        ifYouSee: 'Edge weights strictly in {0, 1}',
        recommendedPattern: '0-1 BFS',
        linkedId: 'zero-one-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Deque removes O(log V) heap factor for O(V + E) runtime.',
      },
    ],
  },
};
