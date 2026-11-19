import type { ConstraintDrillQuestion } from '../../topics/types';

export const CONSTRAINT_DRILLS: ConstraintDrillQuestion[] = [
  {
    id: 'drill-1',
    problemTitle: 'Subarray Sum Equals K (With Negatives)',
    statement:
      'Given an unsorted integer array nums (elements between -1000 and 1000) and target k, return the total number of contiguous subarrays summing to k.',
    constraints: ['1 <= N <= 10^5', '-1000 <= nums[i] <= 1000', 'Target: O(N) time'],
    targetComplexity: 'O(N) time · O(N) space',
    linkedTopicId: 'prefix-sum-diff-array',
    options: [
      {
        id: 'a',
        pattern: 'Variable Sliding Window',
        dataStructure: 'Two Pointers + Running Sum',
        isCorrect: false,
        rationale: 'Negative numbers destroy monotonicity — shrinking left can INCREASE the sum, breaking sliding window.',
      },
      {
        id: 'b',
        pattern: 'Prefix Sum + Complement Lookup',
        dataStructure: 'Frequency Hash Map seeded with {0: 1}',
        isCorrect: true,
        rationale: 'Correct! prefix[i] - k === prefix[j] works identically for positive, zero, and negative numbers in O(N).',
      },
      {
        id: 'c',
        pattern: 'Binary Search on Sorted Prefix',
        dataStructure: 'Sorted Array',
        isCorrect: false,
        rationale: 'Prefix sums are NOT monotonic when negative values exist, so binary search cannot be applied.',
      },
    ],
  },
  {
    id: 'drill-2',
    problemTitle: '10M Typo-Tolerant Product Autocomplete (<20ms P99)',
    statement:
      'Search 10 million product titles (avg 60 chars) for top-k matches resilient to spelling typos and missing spaces with similarity >= threshold.',
    constraints: ['N = 10^7 titles', 'Query length 3..50', 'P99 latency < 20 ms'],
    targetComplexity: 'O(Σ_rare |Postings| + C·k·L)',
    linkedTopicId: 'ngram-fuzzy-candidate-retrieval',
    options: [
      {
        id: 'a',
        pattern: 'Linear Damerau-Levenshtein Scan',
        dataStructure: 'Flat Title Array',
        isCorrect: false,
        rationale: 'Scanning 10^7 titles with O(L·M) DP takes ~80 seconds per query — 4,000× slower than the 20ms SLA.',
      },
      {
        id: 'b',
        pattern: 'Two-Stage Filter-and-Refine (N-Gram + Banded Edit Rerank)',
        dataStructure: 'Padded Trigram Inverted Index + O(1) Length Pruning + Top-K Min-Heap',
        isCorrect: true,
        rationale: 'Correct! Stage-1 inverted trigrams + length bounds eliminate >99.9% of titles before Stage-2 exact reranking.',
      },
      {
        id: 'c',
        pattern: 'Standard Exact Prefix Trie Only',
        dataStructure: '26-ary Trie',
        isCorrect: false,
        rationale: 'An exact Trie immediately fails on a typo at character 0 ("wirless" vs "wireless").',
      },
    ],
  },
  {
    id: 'drill-3',
    problemTitle: 'Minimum Shipping Capacity Within D Days',
    statement:
      'Packages must ship in order with weights[i] up to 500. Find the least conveyor belt weight capacity that ships all packages within D days.',
    constraints: ['1 <= N <= 5×10^4', 'Total weight <= 2.5×10^7', 'Target: O(N log(Sum))'],
    targetComplexity: 'O(N log(Sum)) time · O(1) space',
    linkedTopicId: 'binary-search',
    options: [
      {
        id: 'a',
        pattern: 'Binary Search on Monotonic Answer Space',
        dataStructure: 'Lower-Bound [lo, hi] + O(N) Greedy Feasibility Check',
        isCorrect: true,
        rationale: 'Correct! If capacity C ships within D days, every C+1 also works (monotonic F..F T..T boundary).',
      },
      {
        id: 'b',
        pattern: '0/1 Knapsack 2D DP',
        dataStructure: 'DP Table [N][TotalWeight]',
        isCorrect: false,
        rationale: 'N × TotalWeight = 10^12 states causes immediate MLE/TLE.',
      },
      {
        id: 'c',
        pattern: 'Monotonic Stack',
        dataStructure: 'Index Stack',
        isCorrect: false,
        rationale: 'Packages partition into D sequential groups, not nearest-greater relationships.',
      },
    ],
  },
  {
    id: 'drill-4',
    problemTitle: 'Dynamic Range Sums With Live Element Updates',
    statement:
      'Process 10^5 interleaved operations: either update nums[idx] = val or return the exact sum of nums[L..R].',
    constraints: ['N, Q <= 10^5', '50% updates, 50% range queries', 'Target: O(Q log N)'],
    targetComplexity: 'O(log N) update & query',
    linkedTopicId: 'segment-fenwick-trees',
    options: [
      {
        id: 'a',
        pattern: 'Static Prefix Sum Array',
        dataStructure: '1D Prefix Array',
        isCorrect: false,
        rationale: 'Every point update forces rebuilding O(N) prefix entries -> O(Q·N) = 10^10 ops TLE.',
      },
      {
        id: 'b',
        pattern: 'Fenwick Tree (BIT) or Segment Tree',
        dataStructure: '1-Indexed Binary Indexed Tree',
        isCorrect: true,
        rationale: 'Correct! Both point update and prefix sum run in O(log N) (~17 ops at N = 10^5).',
      },
      {
        id: 'c',
        pattern: 'Difference Array',
        dataStructure: '1D Diff Array',
        isCorrect: false,
        rationale: 'Difference arrays excel at batch offline range updates, NOT interleaved online range queries.',
      },
    ],
  },
  {
    id: 'drill-5',
    problemTitle: 'Rolling Window Peak Latency Over Live Stream',
    statement:
      'Given an array of N = 2×10^5 latency readings and fixed window width k = 50,000, return the maximum reading inside every contiguous k-window.',
    constraints: ['N = 2×10^5', 'k = 5×10^4', 'Target: strict O(N) time'],
    targetComplexity: 'O(N) time · O(k) space',
    linkedTopicId: 'queues-monotonic-deque',
    options: [
      {
        id: 'a',
        pattern: 'Monotonic Decreasing Deque',
        dataStructure: 'Double-Ended Index Queue (Deque)',
        isCorrect: true,
        rationale: 'Correct! Expire out-of-window indices from front and pop dominated smaller values from back in O(1) amortized.',
      },
      {
        id: 'b',
        pattern: 'Nested Window Rescan',
        dataStructure: 'Two Loops',
        isCorrect: false,
        rationale: 'O(N · k) = 10^10 operations -> guaranteed TLE.',
      },
      {
        id: 'c',
        pattern: 'Prefix Maximum Array',
        dataStructure: 'Single Running Max',
        isCorrect: false,
        rationale: 'A running max cannot shrink when the largest value slides out of the left edge of the window.',
      },
    ],
  },
  {
    id: 'drill-6',
    problemTitle: 'Next Warmer Day / Histogram Span Boundaries',
    statement:
      'For each bar in a histogram of N = 10^5 heights, compute the distance to the first strictly smaller bar on both its left and right.',
    constraints: ['1 <= N <= 10^5', 'Target: O(N) single pass'],
    targetComplexity: 'O(N) time · O(N) space',
    linkedTopicId: 'stacks-monotonic-stack',
    options: [
      {
        id: 'a',
        pattern: 'Monotonic Increasing Index Stack',
        dataStructure: 'ArrayDeque / Stack of Indices',
        isCorrect: true,
        rationale: 'Correct! Popping a taller bar reveals its exact right smaller wall (current i) and left smaller wall (new stack top).',
      },
      {
        id: 'b',
        pattern: 'Two Pointers From Ends',
        dataStructure: 'L & R Pointers',
        isCorrect: false,
        rationale: 'Converging pointers solve Container With Most Water, NOT Largest Rectangle in Histogram where bars block interior height.',
      },
      {
        id: 'c',
        pattern: 'Union-Find Only',
        dataStructure: 'DSU Array',
        isCorrect: false,
        rationale: 'Sorting heights + DSU works in O(N log N), missing the cleaner O(N) single-pass stack optimum.',
      },
    ],
  },
  {
    id: 'drill-7',
    problemTitle: 'Rescuing Anagrams & Acoustic Typos in Stage-2 Reranking',
    statement:
      'Stage 1 returned 150 candidates for query "filosofy" and "recieve". Eliminate anagrams ("silent" for "listen"), treat adjacent swaps as 1 edit, and rescue phonetic spelling.',
    constraints: ['C = 150 candidates', 'Edit budget k <= 2', 'Latency < 3 ms'],
    targetComplexity: 'O(C · k · min(L, M)) + O(1) phonetic map',
    linkedTopicId: 'confident-fuzzy-reranking',
    options: [
      {
        id: 'a',
        pattern: 'Unweighted Jaccard Bag-of-Bigrams',
        dataStructure: 'HashSet Intersection',
        isCorrect: false,
        rationale: 'Set intersection ignores character order (anagrams score high) and misses "filosofy" vs "philosophy" (different letters).',
      },
      {
        id: 'b',
        pattern: 'Ukkonen Banded Damerau-Levenshtein + Waterfall Double Metaphone',
        dataStructure: '±k Banded DP + Phonetic Consonant Index',
        isCorrect: true,
        rationale: 'Correct! Damerau counts adjacent swaps as 1 edit, Ukkonen cuts distant candidates early, and Metaphone rescues acoustic typos.',
      },
      {
        id: 'c',
        pattern: 'KMP Prefix Table',
        dataStructure: 'LPS Array',
        isCorrect: false,
        rationale: 'KMP only finds exact substring occurrences with zero tolerance for edits or phonetic spelling.',
      },
    ],
  },
  {
    id: 'drill-8',
    problemTitle: 'Detect Redundant Edge in Undirected Dynamic Network',
    statement:
      'Edges arrive sequentially in an undirected graph of N = 10^5 nodes. Return the first edge (u, v) that connects two nodes already in the same component.',
    constraints: ['N, E <= 10^5', 'Online edge stream', 'Target: ~O(E)'],
    targetComplexity: 'O(E · α(N)) time · O(N) space',
    linkedTopicId: 'graphs-traversal-dsu',
    options: [
      {
        id: 'a',
        pattern: 'Fresh BFS per Edge',
        dataStructure: 'Adjacency List + Queue',
        isCorrect: false,
        rationale: 'Running O(V+E) BFS per incoming edge hits O(E^2) = 10^10 operations (TLE).',
      },
      {
        id: 'b',
        pattern: 'Disjoint Set Union (Path Compression + Union by Rank)',
        dataStructure: 'Parent & Rank Arrays',
        isCorrect: true,
        rationale: 'Correct! find(u) === find(v) detects cycles in O(α(N)) ≈ O(1) amortized time.',
      },
      {
        id: 'c',
        pattern: 'Floyd-Warshall All-Pairs Matrix',
        dataStructure: 'N × N Matrix',
        isCorrect: false,
        rationale: 'O(N^3) is strictly limited to N <= 400.',
      },
    ],
  },
  {
    id: 'drill-9',
    problemTitle: 'Sort Array Containing Only 0s, 1s, and 2s In-Place (One Pass)',
    statement:
      'Given an array nums of length N = 10^5 where every element is 0, 1, or 2, sort it in-place in a single pass with O(1) extra space.',
    constraints: ['N <= 10^5', 'Values in {0, 1, 2}', 'One pass · O(1) space'],
    targetComplexity: 'O(N) time · O(1) space',
    linkedTopicId: 'sorting-algorithms',
    options: [
      {
        id: 'a',
        pattern: 'Standard Merge Sort',
        dataStructure: 'Auxiliary O(N) Merge Buffer',
        isCorrect: false,
        rationale: 'Merge Sort takes O(N log N) time and O(N) auxiliary memory—violating both O(N) one-pass and O(1) space.',
      },
      {
        id: 'b',
        pattern: '3-Way Partition (Dutch National Flag)',
        dataStructure: 'Three Pointers (lt, i, gt)',
        isCorrect: true,
        rationale: 'Correct! Swapping 0s to lt++ and 2s to gt-- partitions all three bands in one O(N) pass with O(1) memory.',
      },
      {
        id: 'c',
        pattern: 'Min-Heap Sort',
        dataStructure: 'Binary Heap',
        isCorrect: false,
        rationale: 'Heap Sort performs O(N log N) sift operations instead of a single O(N) pass.',
      },
    ],
  },
  {
    id: 'drill-10',
    problemTitle: 'List ALL Unique Combinations Summing to Target (Duplicates Allowed)',
    statement:
      'Given an array of N <= 25 positive integers (with duplicates) and target T <= 30, return EVERY unique combination whose sum equals T.',
    constraints: ['N <= 25', 'Target T <= 30', 'Return ALL unique combinations'],
    targetComplexity: 'Pruned O(2^N) · O(N) stack',
    linkedTopicId: 'backtracking',
    options: [
      {
        id: 'a',
        pattern: '1D Dynamic Programming Count Table',
        dataStructure: 'Integer Array dp[T + 1]',
        isCorrect: false,
        rationale: '1D DP only counts how many ways exist; listing every explicit unique combination requires exploring the decision tree.',
      },
      {
        id: 'b',
        pattern: 'Sorted Branch-and-Bound Backtracking',
        dataStructure: 'Sorted Array + Mutable Path + Duplicate Skip',
        isCorrect: true,
        rationale: 'Correct! Sorting enables O(1) suffix break when cands[j] > rem and skips same-level duplicates via j > start && cands[j] === cands[j-1].',
      },
      {
        id: 'c',
        pattern: 'Two-Pointer Sliding Window',
        dataStructure: 'Left/Right Indices',
        isCorrect: false,
        rationale: 'Sliding Window only finds contiguous subarrays, not arbitrary non-contiguous combinations.',
      },
    ],
  },
];
