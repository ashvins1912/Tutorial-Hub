export type Dsa28TopicGroupId =
  | 'arrays-hashing-two-pointers'
  | 'linked-lists-stacks-queues'
  | 'binary-search-heaps'
  | 'trees-graphs-tries'
  | 'recursion-greedy-dp';

export type Dsa28Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Dsa28TopicGroup {
  id: Dsa28TopicGroupId;
  order: number;
  title: string;
  shortTitle: string;
  patternRange: string;
  summary: string;
}

export interface Dsa28Problem {
  id: string;
  leetcodeNumber: number;
  title: string;
  slug: string;
  difficulty: Dsa28Difficulty;
  url: string;
  patternId: string;
  isCanonical28: boolean;
  keyIdea: string;
  timeComplexity: string;
  spaceComplexity: string;
  companies: string[];
}

export interface Dsa28Pattern {
  id: string;
  number: number;
  groupId: Dsa28TopicGroupId;
  title: string;
  shortTitle: string;
  summary: string;
  mentalModel: string;
  triggerSignals: string[];
  timeComplexity: string;
  spaceComplexity: string;
  hasTrickyTemplate: boolean;
  canonicalSlug: string;
  problems: Dsa28Problem[];
}

export interface Dsa28CrossCuttingTechnique {
  id: string;
  title: string;
  summary: string;
  whenToApply: string[];
  canonicalExamples: Array<{
    leetcodeNumber: number;
    title: string;
    slug: string;
    difficulty: Dsa28Difficulty;
    keyTrick: string;
  }>;
}

export interface CustomPattern28Problem {
  id: string;
  patternId: string;
  sourcePlatform: 'LeetCode' | 'GeeksforGeeks' | 'Custom';
  title: string;
  slug: string;
  url: string;
  difficulty: Dsa28Difficulty;
  topics: string[];
  keyIdea: string;
  statement?: string;
  examples?: string[];
  constraints?: string[];
  savedRecordId?: string;
  addedAt: string;
  confidence?: number;
}

export interface Pattern28ClassificationMatch {
  patternId: string;
  patternNumber: number;
  patternTitle: string;
  groupTitle: string;
  score: number;
  confidence: number;
  matchedReasons: string[];
}

export interface Pattern28ClassificationResult {
  best: Pattern28ClassificationMatch;
  alternatives: Pattern28ClassificationMatch[];
}

function p(
  patternId: string,
  leetcodeNumber: number,
  title: string,
  slug: string,
  difficulty: Dsa28Difficulty,
  isCanonical28: boolean,
  keyIdea: string,
  timeComplexity: string,
  spaceComplexity: string,
  companies: string[]
): Dsa28Problem {
  return {
    id: `dsa28-${slug}`,
    leetcodeNumber,
    title,
    slug,
    difficulty,
    url: `https://leetcode.com/problems/${slug}/`,
    patternId,
    isCanonical28,
    keyIdea,
    timeComplexity,
    spaceComplexity,
    companies,
  };
}

export const DSA28_TOPIC_GROUPS: Dsa28TopicGroup[] = [
  {
    id: 'arrays-hashing-two-pointers',
    order: 1,
    title: '1. Arrays, Hashing & Two Pointers',
    shortTitle: 'Arrays & Windows',
    patternRange: 'Patterns 1–10',
    summary: 'O(1) lookup structures, cumulative ranges, converging pointers, sliding windows, intervals, and in-place matrix simulations.',
  },
  {
    id: 'linked-lists-stacks-queues',
    order: 2,
    title: '2. Linked Lists, Stacks & Queues',
    shortTitle: 'Lists, Stacks & Deques',
    patternRange: 'Patterns 11–14',
    summary: 'O(1)-space pointer invariants for cycles and reversals alongside monotonic structures for next-greater and window-extrema queries.',
  },
  {
    id: 'binary-search-heaps',
    order: 3,
    title: '3. Binary Search & Heaps',
    shortTitle: 'Binary Search & Heaps',
    patternRange: 'Patterns 15–19',
    summary: 'Logarithmic search over rotated spaces or monotonic answer domains, plus priority queues for top-K, streaming medians, and k-way merges.',
  },
  {
    id: 'trees-graphs-tries',
    order: 4,
    title: '4. Trees, Graphs & Tries',
    shortTitle: 'Trees, Graphs & Tries',
    patternRange: 'Patterns 20–26',
    summary: 'Recursive DFS and level-order BFS on hierarchies, prefix trees, multi-source shortest grids, DAG ordering, disjoint sets, and weighted paths.',
  },
  {
    id: 'recursion-greedy-dp',
    order: 5,
    title: '5. Recursion, Greedy & Dynamic Programming',
    shortTitle: 'Backtracking & DP',
    patternRange: 'Patterns 27–28',
    summary: 'Systematic decision-tree search with undoable state and cached overlapping subproblems across 1D, 2D, knapsack, LIS, and interval DP.',
  },
];

export const DSA28_PATTERNS: Dsa28Pattern[] = [
  // =========================================================================
  // GROUP 1: ARRAYS, HASHING & TWO POINTERS (1 - 10)
  // =========================================================================
  {
    id: 'hashmap-hashset-lookup',
    number: 1,
    groupId: 'arrays-hashing-two-pointers',
    title: 'HashMap / HashSet Lookup',
    shortTitle: 'HashMap / HashSet',
    summary: 'Track frequencies, detect duplicates, or achieve O(1) complement lookups (Two Sum, Group Anagrams).',
    mentalModel: 'Trade O(n) space to eliminate an inner O(n) linear scan by storing seen values, canonical keys, or frequency counts.',
    triggerSignals: ['find pair with target sum', 'frequency count', 'anagram grouping', 'longest consecutive sequence', 'first unique'],
    timeComplexity: 'Expected O(total input size) for key construction plus n expected O(1) hash operations; n strings of length k commonly cost O(n · k). Collision-heavy worst cases depend on the map implementation.',
    spaceComplexity: 'O(n) auxiliary map/set entries plus stored key material proportional to total key length; input and returned groups are excluded.',
    hasTrickyTemplate: false,
    canonicalSlug: 'two-sum',
    problems: [
      p('hashmap-hashset-lookup', 1, 'Two Sum', 'two-sum', 'Easy', true, 'Store value -> index as you scan and check target - num in O(1).', 'O(n)', 'O(n)', ['Google', 'Amazon', 'Meta']),
      p('hashmap-hashset-lookup', 49, 'Group Anagrams', 'group-anagrams', 'Medium', false, 'Map each string to a 26-char frequency signature key to bucket anagrams in O(n * k).', 'O(n · k)', 'O(n · k)', ['Amazon', 'Meta', 'Uber']),
      p('hashmap-hashset-lookup', 128, 'Longest Consecutive Sequence', 'longest-consecutive-sequence', 'Medium', false, 'Insert into a HashSet and only start counting upward when num - 1 is absent.', 'O(n)', 'O(n)', ['Google', 'Meta', 'Microsoft']),
      p('hashmap-hashset-lookup', 217, 'Contains Duplicate', 'contains-duplicate', 'Easy', false, 'Short-circuit as soon as a number already exists in the seen HashSet.', 'O(n)', 'O(n)', ['Amazon', 'Apple']),
      p('hashmap-hashset-lookup', 242, 'Valid Anagram', 'valid-anagram', 'Easy', false, 'Increment counts for s, decrement for t, and verify every bucket returns to zero.', 'O(n)', 'O(1)', ['Amazon', 'Microsoft']),
      p('hashmap-hashset-lookup', 36, 'Valid Sudoku', 'valid-sudoku', 'Medium', false, 'Track seen digits across row, column, and 3x3 box keys in one single pass.', 'O(1)', 'O(1)', ['Amazon', 'Apple', 'Uber']),
    ],
  },
  {
    id: 'prefix-sum-difference-array',
    number: 2,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Prefix Sum & Difference Array',
    shortTitle: 'Prefix Sum / Diff',
    summary: 'Precompute cumulative sums for O(1) range queries or bulk range updates (Subarray Sum Equals K, Range Sum Query).',
    mentalModel: 'Range(l..r) = prefix[r+1] - prefix[l]. Pair prefix sums with a HashMap to count valid subarrays even with negative numbers.',
    triggerSignals: ['subarray sum equals k', 'range sum query', 'divisible by k', 'contiguous equal 0s and 1s', 'bulk range increments'],
    timeComplexity: 'O(n) preprocessing/sweep; O(1) per range query; prefix-frequency counting is expected O(n) with hashing.',
    spaceComplexity: 'O(n) for prefix storage or frequency maps; difference-array storage depends on the coordinate range.',
    hasTrickyTemplate: true,
    canonicalSlug: 'subarray-sum-equals-k',
    problems: [
      p('prefix-sum-difference-array', 560, 'Subarray Sum Equals K', 'subarray-sum-equals-k', 'Medium', true, 'Count prior prefix sums equal to currentPrefix - k using a frequency map seeded with {0: 1}.', 'O(n)', 'O(n)', ['Meta', 'Google', 'Amazon']),
      p('prefix-sum-difference-array', 303, 'Range Sum Query - Immutable', 'range-sum-query-immutable', 'Easy', false, 'Build prefix[i+1] = prefix[i] + nums[i] so sumRange(l, r) is O(1).', 'O(1) query', 'O(n)', ['Meta', 'Google']),
      p('prefix-sum-difference-array', 238, 'Product of Array Except Self', 'product-of-array-except-self', 'Medium', false, 'Multiply left prefix products on pass 1 and right suffix products on pass 2 without division.', 'O(n)', 'O(1) extra', ['Meta', 'Amazon', 'Apple']),
      p('prefix-sum-difference-array', 525, 'Contiguous Array', 'contiguous-array', 'Medium', false, 'Treat 0 as -1 and store the earliest index of each running balance to maximize length.', 'O(n)', 'O(n)', ['Meta', 'Google']),
      p('prefix-sum-difference-array', 974, 'Subarray Sums Divisible by K', 'subarray-sums-divisible-by-k', 'Medium', false, 'Normalize negative remainders with ((prefix % k) + k) % k and count matching remainders.', 'O(n)', 'O(k)', ['Amazon', 'Bloomberg']),
      p('prefix-sum-difference-array', 1094, 'Car Pooling', 'car-pooling', 'Medium', false, 'Apply +passengers at pickup and -passengers at drop-off on a difference array, then sweep.', 'O(n + M)', 'O(M)', ['Amazon', 'Uber']),
    ],
  },
  {
    id: 'two-pointers-opposite-ends',
    number: 3,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Two Pointers (Opposite Ends)',
    shortTitle: 'Two Pointers (Inward)',
    summary: 'Converge from left and right on sorted arrays or palindromes (Container With Most Water, Trapping Rain Water).',
    mentalModel: 'Start pointers at 0 and n-1; at every step prove which side is the bottleneck and advance it to eliminate an entire row/column of pairs.',
    triggerSignals: ['sorted array pair/triplet', 'palindrome check', 'maximize container area', 'trapping rain water', 'O(1) extra space'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hasTrickyTemplate: false,
    canonicalSlug: 'container-with-most-water',
    problems: [
      p('two-pointers-opposite-ends', 11, 'Container With Most Water', 'container-with-most-water', 'Medium', true, 'Always move the shorter wall inward because moving the taller wall can never increase height.', 'O(n)', 'O(1)', ['Amazon', 'Google', 'Meta']),
      p('two-pointers-opposite-ends', 42, 'Trapping Rain Water', 'trapping-rain-water', 'Hard', false, 'Maintain leftMax and rightMax; water at the shorter boundary is fully determined in O(1) space.', 'O(n)', 'O(1)', ['Google', 'Meta', 'Amazon']),
      p('two-pointers-opposite-ends', 15, '3Sum', '3sum', 'Medium', false, 'Sort, fix i, run opposite-end two pointers for -nums[i], and skip duplicate values.', 'O(n²)', 'O(1) extra', ['Meta', 'Amazon', 'Google']),
      p('two-pointers-opposite-ends', 167, 'Two Sum II - Input Array Is Sorted', 'two-sum-ii-input-array-is-sorted', 'Medium', false, 'Shrink right if sum > target, advance left if sum < target.', 'O(n)', 'O(1)', ['Amazon', 'Apple']),
      p('two-pointers-opposite-ends', 125, 'Valid Palindrome', 'valid-palindrome', 'Easy', false, 'Skip non-alphanumeric chars from both ends and compare case-insensitively.', 'O(n)', 'O(1)', ['Meta', 'Microsoft']),
      p('two-pointers-opposite-ends', 977, 'Squares of a Sorted Array', 'squares-of-a-sorted-array', 'Easy', false, 'Compare absolute values at left and right ends and fill the output array from back to front.', 'O(n)', 'O(n)', ['Meta', 'Amazon']),
    ],
  },
  {
    id: 'two-pointers-same-direction',
    number: 4,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Two Pointers (Same Direction / Partitioning)',
    shortTitle: 'Partition Pointers',
    summary: 'In-place array filtering, deduplication, or Dutch National Flag sorting (Move Zeroes, Sort Colors).',
    mentalModel: 'Maintain a slow write boundary separating processed valid elements from the fast read explorer (or 3-way low/mid/high boundaries).',
    triggerSignals: ['in-place deduplication', 'move zeroes preserving order', '3-way partition', 'Dutch National Flag', 'remove element in O(1) space'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hasTrickyTemplate: false,
    canonicalSlug: 'sort-colors',
    problems: [
      p('two-pointers-same-direction', 75, 'Sort Colors', 'sort-colors', 'Medium', true, 'Maintain low/mid/high invariants for 0s, 1s, and 2s; do not increment mid when swapping with high.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon', 'Meta']),
      p('two-pointers-same-direction', 283, 'Move Zeroes', 'move-zeroes', 'Easy', false, 'Swap every non-zero read element into the slow write index and increment write.', 'O(n)', 'O(1)', ['Meta', 'Google', 'Apple']),
      p('two-pointers-same-direction', 26, 'Remove Duplicates from Sorted Array', 'remove-duplicates-from-sorted-array', 'Easy', false, 'Only copy nums[fast] to nums[slow++] when it differs from the previous written value.', 'O(n)', 'O(1)', ['Meta', 'Microsoft']),
      p('two-pointers-same-direction', 80, 'Remove Duplicates from Sorted Array II', 'remove-duplicates-from-sorted-array-ii', 'Medium', false, 'Compare nums[fast] against nums[slow - 2] to allow at most two copies in-place.', 'O(n)', 'O(1)', ['Meta', 'Amazon']),
      p('two-pointers-same-direction', 443, 'String Compression', 'string-compression', 'Medium', false, 'Read contiguous runs with fast pointer and write char + digits at slow pointer.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon', 'Apple']),
      p('two-pointers-same-direction', 905, 'Sort Array By Parity', 'sort-array-by-parity', 'Easy', false, 'Partition even numbers ahead of odd numbers in a single linear swap pass.', 'O(n)', 'O(1)', ['Amazon', 'Bloomberg']),
    ],
  },
  {
    id: 'fixed-sliding-window',
    number: 5,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Fixed Sliding Window',
    shortTitle: 'Fixed Window',
    summary: 'Maintain a running state over a fixed-length contiguous subarray (Maximum Average Subarray I).',
    mentalModel: 'Add the entering element at right and evict the leaving element at right - k once the window reaches exact length k.',
    triggerSignals: ['subarray of size k', 'fixed window length k', 'find all anagrams of p', 'permutation in string', 'rolling average'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) or O(alphabet)',
    hasTrickyTemplate: false,
    canonicalSlug: 'maximum-average-subarray-i',
    problems: [
      p('fixed-sliding-window', 643, 'Maximum Average Subarray I', 'maximum-average-subarray-i', 'Easy', true, 'Slide a length-k running sum by adding nums[i] and subtracting nums[i - k].', 'O(n)', 'O(1)', ['Google', 'Meta']),
      p('fixed-sliding-window', 438, 'Find All Anagrams in a String', 'find-all-anagrams-in-a-string', 'Medium', false, 'Keep a fixed window of size p.length and track matched character counts in O(1) per slide.', 'O(n)', 'O(1)', ['Meta', 'Amazon', 'Google']),
      p('fixed-sliding-window', 567, 'Permutation in String', 'permutation-in-string', 'Medium', false, 'Slide a window of length s1.length over s2 and check when all 26 frequency diffs hit zero.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon']),
      p('fixed-sliding-window', 1456, 'Maximum Number of Vowels in a Substring of Given Length', 'maximum-number-of-vowels-in-a-substring-of-given-length', 'Medium', false, 'Maintain vowel count inside window [i - k + 1 .. i] with O(1) enter/exit updates.', 'O(n)', 'O(1)', ['Amazon', 'Google']),
      p('fixed-sliding-window', 2461, 'Maximum Sum of Distinct Subarrays With Length K', 'maximum-sum-of-distinct-subarrays-with-length-k', 'Medium', false, 'Combine fixed-k running sum with a frequency map checking map.size === k.', 'O(n)', 'O(k)', ['Amazon', 'Meta']),
      p('fixed-sliding-window', 1423, 'Maximum Points You Can Obtain from Cards', 'maximum-points-you-can-obtain-from-cards', 'Medium', false, 'Maximize k outer cards by minimizing the inner fixed sliding window of length n - k.', 'O(n)', 'O(1)', ['Google', 'Amazon']),
    ],
  },
  {
    id: 'dynamic-sliding-window',
    number: 6,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Dynamic Sliding Window',
    shortTitle: 'Dynamic Window',
    summary: 'Expand right to satisfy a condition, shrink left to optimize length (Minimum Window Substring, Longest Substring Without Repeating Characters).',
    mentalModel: 'Grow right monotonically; shrink left while the window is invalid (longest-window problems) or while valid (shortest-window problems).',
    triggerSignals: ['longest substring', 'minimum window substring', 'at most k distinct', 'contiguous subarray with non-negative sums', 'character replacement'],
    timeComplexity: 'O(n) amortized when both boundaries move only forward and the validity/shrink rule is monotone; each item enters and leaves at most once.',
    spaceComplexity: 'O(min(n, distinct values)) for frequency state; deque candidates use O(k) for window size k.',
    hasTrickyTemplate: true,
    canonicalSlug: 'minimum-window-substring',
    problems: [
      p('dynamic-sliding-window', 76, 'Minimum Window Substring', 'minimum-window-substring', 'Hard', true, 'Track formed == required distinct characters; shrink left greedily whenever all requirements hold.', 'O(|s| + |t|)', 'O(|s| + |t|)', ['Meta', 'Google', 'Amazon']),
      p('dynamic-sliding-window', 3, 'Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'Medium', false, 'Jump left to lastSeen[ch] + 1 whenever a duplicate falls inside the active window.', 'O(n)', 'O(min(n, Σ))', ['Amazon', 'Google', 'Meta']),
      p('dynamic-sliding-window', 424, 'Longest Repeating Character Replacement', 'longest-repeating-character-replacement', 'Medium', false, 'Window is valid while (windowLen - maxFreq) <= k; maxFreq never needs to decrease.', 'O(n)', 'O(1)', ['Google', 'Amazon']),
      p('dynamic-sliding-window', 1004, 'Max Consecutive Ones III', 'max-consecutive-ones-iii', 'Medium', false, 'Count zeroes inside [left..right] and shrink left whenever zeroes > k.', 'O(n)', 'O(1)', ['Meta', 'Google']),
      p('dynamic-sliding-window', 209, 'Minimum Size Subarray Sum', 'minimum-size-subarray-sum', 'Medium', false, 'Because all numbers are positive, shrink left while runningSum >= target to record min length.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon']),
      p('dynamic-sliding-window', 904, 'Fruit Into Baskets', 'fruit-into-baskets', 'Medium', false, 'Longest subarray with at most 2 distinct fruit types using a frequency map.', 'O(n)', 'O(1)', ['Google', 'Amazon']),
    ],
  },
  {
    id: 'kadanes-algorithm',
    number: 7,
    groupId: 'arrays-hashing-two-pointers',
    title: "Kadane's Algorithm",
    shortTitle: "Kadane's Algo",
    summary: 'Track local vs. global maximum for contiguous subarrays with negative numbers (Maximum Subarray, Maximum Product Subarray).',
    mentalModel: 'At index i, either extend the best subarray ending at i-1 or restart fresh at nums[i] whenever the prefix becomes a drag.',
    triggerSignals: ['maximum contiguous subarray', 'negative numbers included', 'maximum product subarray', 'circular subarray max sum', 'best time to buy/sell'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hasTrickyTemplate: false,
    canonicalSlug: 'maximum-subarray',
    problems: [
      p('kadanes-algorithm', 53, 'Maximum Subarray', 'maximum-subarray', 'Medium', true, 'cur = max(x, cur + x); best = max(best, cur) — handles all-negative arrays cleanly.', 'O(n)', 'O(1)', ['Amazon', 'Google', 'Microsoft']),
      p('kadanes-algorithm', 152, 'Maximum Product Subarray', 'maximum-product-subarray', 'Medium', false, 'Track both curMax and curMin because multiplying by a negative flips min into max.', 'O(n)', 'O(1)', ['Amazon', 'LinkedIn', 'Google']),
      p('kadanes-algorithm', 918, 'Maximum Sum Circular Subarray', 'maximum-sum-circular-subarray', 'Medium', false, 'Answer is max(normalKadane, totalSum - minSubarrayKadane) unless all numbers are negative.', 'O(n)', 'O(1)', ['Google', 'Amazon']),
      p('kadanes-algorithm', 121, 'Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'Easy', false, 'Equivalent to Kadane on daily deltas: track minPrice so far and maximize price - minPrice.', 'O(n)', 'O(1)', ['Meta', 'Amazon', 'Google']),
      p('kadanes-algorithm', 1749, 'Maximum Absolute Sum of Any Subarray', 'maximum-absolute-sum-of-any-subarray', 'Medium', false, 'Run max-Kadane and min-Kadane simultaneously (or take maxPrefix - minPrefix).', 'O(n)', 'O(1)', ['Microsoft', 'Amazon']),
      p('kadanes-algorithm', 1186, 'Maximum Subarray Sum with One Deletion', 'maximum-subarray-sum-with-one-deletion', 'Medium', false, 'Track two Kadane states: noDeletion and oneDeletion at each index.', 'O(n)', 'O(1)', ['Google', 'Uber']),
    ],
  },
  {
    id: 'cyclic-sort',
    number: 8,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Cyclic Sort',
    shortTitle: 'Cyclic Sort',
    summary: 'Place numbers in range [1, n] at their exact index in O(n) time and O(1) space (Find All Numbers Disappeared in an Array, First Missing Positive).',
    mentalModel: 'When values live in [1..n] or [0..n-1], each number belongs at index num - 1; swap until settled, then scan for mismatches.',
    triggerSignals: ['numbers in range [1, n]', 'first missing positive', 'find missing or duplicate in O(1) space', 'in-place index placement'],
    timeComplexity: 'O(n) only when values map to a bounded index range and each swap places a value; define duplicate and out-of-range handling.',
    spaceComplexity: 'O(1) auxiliary space when the input may be mutated; output storage is excluded.',
    hasTrickyTemplate: false,
    canonicalSlug: 'first-missing-positive',
    problems: [
      p('cyclic-sort', 41, 'First Missing Positive', 'first-missing-positive', 'Hard', true, 'Swap every 1 <= nums[i] <= n into index nums[i]-1; the first index where nums[i] != i+1 wins.', 'O(n)', 'O(1)', ['Amazon', 'Google', 'Microsoft']),
      p('cyclic-sort', 448, 'Find All Numbers Disappeared in an Array', 'find-all-numbers-disappeared-in-an-array', 'Easy', false, 'Place each x at index x-1 (or negate nums[|x|-1]) and collect unmarked indices.', 'O(n)', 'O(1)', ['Google', 'Amazon']),
      p('cyclic-sort', 442, 'Find All Duplicates in an Array', 'find-all-duplicates-in-an-array', 'Medium', false, 'Cyclic sort or sign-flip nums[|x|-1]; hitting an already negative slot reveals a duplicate.', 'O(n)', 'O(1)', ['Amazon', 'Meta']),
      p('cyclic-sort', 268, 'Missing Number', 'missing-number', 'Easy', false, 'Place values 0..n-1 at their matching index (or use Gauss sum / XOR).', 'O(n)', 'O(1)', ['Amazon', 'Microsoft']),
      p('cyclic-sort', 645, 'Set Mismatch', 'set-mismatch', 'Easy', false, 'After cyclic sort, the single slot where nums[i] != i+1 gives [duplicate, missing].', 'O(n)', 'O(1)', ['Amazon', 'Adobe']),
      p('cyclic-sort', 287, 'Find the Duplicate Number', 'find-the-duplicate-number', 'Medium', false, 'Cyclic placement finds duplicate in O(n) if mutation is allowed; Floyd cycle if read-only.', 'O(n)', 'O(1)', ['Amazon', 'Microsoft', 'Google']),
    ],
  },
  {
    id: 'merge-intervals',
    number: 9,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Merge Intervals',
    shortTitle: 'Merge Intervals',
    summary: 'Sort intervals by start/end time to merge overlaps or find conflicts (Merge Intervals, Meeting Rooms II).',
    mentalModel: 'Sort by start time to coalesce overlaps (cur.start <= prev.end), or sort by end time to maximize non-overlapping picks.',
    triggerSignals: ['overlapping intervals', 'merge schedules', 'minimum meeting rooms', 'insert interval', 'burst balloons / arrows'],
    timeComplexity: 'O(n log n) including sorting; the merge scan is O(n).',
    spaceComplexity: 'O(n) for the merged output; sorting workspace depends on the language/runtime and sort implementation.',
    hasTrickyTemplate: false,
    canonicalSlug: 'merge-intervals',
    problems: [
      p('merge-intervals', 56, 'Merge Intervals', 'merge-intervals', 'Medium', true, 'Sort by start; extend merged.back().end = max(end, cur.end) whenever cur.start <= prev.end.', 'O(n log n)', 'O(n)', ['Meta', 'Google', 'Amazon']),
      p('merge-intervals', 57, 'Insert Interval', 'insert-interval', 'Medium', false, 'Three phases: emit intervals before newInterval, merge all overlapping ones, emit remainder.', 'O(n)', 'O(n)', ['Google', 'Meta', 'Amazon']),
      p('merge-intervals', 435, 'Non-overlapping Intervals', 'non-overlapping-intervals', 'Medium', false, 'Sort by end time and greedily keep the interval finishing earliest to minimize removals.', 'O(n log n)', 'O(1)', ['Amazon', 'Meta']),
      p('merge-intervals', 253, 'Meeting Rooms II', 'meeting-rooms-ii', 'Medium', false, 'Track concurrent meetings via a min-heap of end times or sorted start/end sweep pointers.', 'O(n log n)', 'O(n)', ['Google', 'Meta', 'Amazon']),
      p('merge-intervals', 452, 'Minimum Number of Arrows to Burst Balloons', 'minimum-number-of-arrows-to-burst-balloons', 'Medium', false, 'Sort by end coordinate and shoot one arrow at the end of the earliest-ending active balloon.', 'O(n log n)', 'O(1)', ['Amazon', 'Microsoft']),
      p('merge-intervals', 986, 'Interval List Intersections', 'interval-list-intersections', 'Medium', false, 'Two pointers on two sorted lists: overlap is [max(s1,s2), min(e1,e2)]; advance the earlier end.', 'O(m + n)', 'O(1)', ['Meta', 'Uber']),
    ],
  },
  {
    id: 'matrix-traversal-simulation',
    number: 10,
    groupId: 'arrays-hashing-two-pointers',
    title: 'Matrix Traversal & Simulation',
    shortTitle: 'Matrix Simulation',
    summary: 'Layer-by-layer rotation, spiral traversal, or in-place marker flags (Spiral Matrix, Rotate Image, Set Matrix Zeroes).',
    mentalModel: 'Control traversal with shrinking boundary walls (top/bottom/left/right), transpose+reverse algebra, or first-row/col O(1) markers.',
    triggerSignals: ['spiral order', 'rotate 90 degrees in-place', 'set matrix zeroes in O(1)', 'diagonal traversal', 'game of life in-place'],
    timeComplexity: 'O(m · n)',
    spaceComplexity: 'O(1)',
    hasTrickyTemplate: false,
    canonicalSlug: 'spiral-matrix',
    problems: [
      p('matrix-traversal-simulation', 54, 'Spiral Matrix', 'spiral-matrix', 'Medium', true, 'Shrink top, right, bottom, left boundaries after each edge sweep; guard bottom/left against duplicates.', 'O(m · n)', 'O(1)', ['Microsoft', 'Amazon', 'Google']),
      p('matrix-traversal-simulation', 48, 'Rotate Image', 'rotate-image', 'Medium', false, '90° clockwise rotation = transpose across main diagonal + reverse every row in-place.', 'O(n²)', 'O(1)', ['Amazon', 'Microsoft', 'Apple']),
      p('matrix-traversal-simulation', 73, 'Set Matrix Zeroes', 'set-matrix-zeroes', 'Medium', false, 'Use row 0 and col 0 as O(1) marker flags plus one boolean for column 0.', 'O(m · n)', 'O(1)', ['Amazon', 'Meta', 'Microsoft']),
      p('matrix-traversal-simulation', 289, 'Game of Life', 'game-of-life', 'Medium', false, 'Encode transitions in bit 1 (next state) while preserving bit 0 (current state), then right-shift.', 'O(m · n)', 'O(1)', ['Google', 'Dropbox']),
      p('matrix-traversal-simulation', 498, 'Diagonal Traverse', 'diagonal-traverse', 'Medium', false, 'Flip up-right / down-left direction whenever hitting row/col boundaries.', 'O(m · n)', 'O(1)', ['Meta', 'Google']),
      p('matrix-traversal-simulation', 59, 'Spiral Matrix II', 'spiral-matrix-ii', 'Medium', false, 'Fill 1..n² using the exact same four-wall shrinking loop as Spiral Matrix.', 'O(n²)', 'O(1)', ['Amazon', 'Apple']),
    ],
  },

  // =========================================================================
  // GROUP 2: LINKED LISTS, STACKS & QUEUES (11 - 14)
  // =========================================================================
  {
    id: 'fast-slow-pointers',
    number: 11,
    groupId: 'linked-lists-stacks-queues',
    title: "Fast & Slow Pointers (Floyd's Cycle)",
    shortTitle: 'Fast & Slow Pointers',
    summary: 'Detect cycles, find cycle entry points, or locate midpoints in O(1) space (Linked List Cycle II, Find the Duplicate Number).',
    mentalModel: 'Move slow by 1 and fast by 2; if they meet inside a cycle, resetting one pointer to head and walking both by 1 meets at the cycle entry.',
    triggerSignals: ['linked list cycle entry', 'middle of linked list', 'happy number', 'duplicate in read-only array', 'O(1) space palindrome list'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hasTrickyTemplate: false,
    canonicalSlug: 'linked-list-cycle-ii',
    problems: [
      p('fast-slow-pointers', 142, 'Linked List Cycle II', 'linked-list-cycle-ii', 'Medium', true, 'After slow == fast, reset one pointer to head and advance both by 1 to hit the exact entry node.', 'O(n)', 'O(1)', ['Amazon', 'Microsoft', 'Google']),
      p('fast-slow-pointers', 287, 'Find the Duplicate Number', 'find-the-duplicate-number', 'Medium', false, 'Treat i -> nums[i] as a functional linked list; Floyd Phase 2 returns the duplicate without mutating.', 'O(n)', 'O(1)', ['Amazon', 'Google', 'Meta']),
      p('fast-slow-pointers', 141, 'Linked List Cycle', 'linked-list-cycle', 'Easy', false, 'If fast reaches null there is no cycle; if fast catches slow a cycle exists.', 'O(n)', 'O(1)', ['Amazon', 'Microsoft']),
      p('fast-slow-pointers', 876, 'Middle of the Linked List', 'middle-of-the-linked-list', 'Easy', false, 'When fast reaches the end, slow sits squarely at the midpoint.', 'O(n)', 'O(1)', ['Amazon', 'Apple']),
      p('fast-slow-pointers', 143, 'Reorder List', 'reorder-list', 'Medium', false, 'Find midpoint via fast/slow, reverse second half in-place, then interleave both halves.', 'O(n)', 'O(1)', ['Meta', 'Amazon', 'Google']),
      p('fast-slow-pointers', 202, 'Happy Number', 'happy-number', 'Easy', false, 'Apply sum-of-squares transition once for slow and twice for fast to detect non-1 cycles.', 'O(log n)', 'O(1)', ['Google', 'Uber']),
    ],
  },
  {
    id: 'in-place-linked-list-reversal',
    number: 12,
    groupId: 'linked-lists-stacks-queues',
    title: 'In-Place Linked List Reversal',
    shortTitle: 'LL Reversal',
    summary: 'Rewire next pointers without extra memory (Reverse Linked List, Reverse Nodes in k-Group).',
    mentalModel: 'Use a dummy head plus prev/curr/next pointers to rewire links safely without losing the remainder of the list.',
    triggerSignals: ['reverse linked list', 'reverse sublist left..right', 'reverse nodes in k-group', 'swap nodes in pairs', 'O(1) extra memory'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hasTrickyTemplate: true,
    canonicalSlug: 'reverse-nodes-in-k-group',
    problems: [
      p('in-place-linked-list-reversal', 25, 'Reverse Nodes in k-Group', 'reverse-nodes-in-k-group', 'Hard', true, 'Verify k nodes exist ahead of groupPrev, reverse the k-block, and reconnect groupPrev and groupTail.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon', 'Meta']),
      p('in-place-linked-list-reversal', 206, 'Reverse Linked List', 'reverse-linked-list', 'Easy', false, 'Save next = curr.next, point curr.next = prev, advance prev = curr, curr = next.', 'O(n)', 'O(1)', ['Amazon', 'Google', 'Apple']),
      p('in-place-linked-list-reversal', 92, 'Reverse Linked List II', 'reverse-linked-list-ii', 'Medium', false, 'Walk to node left - 1, then repeatedly head-insert curr.next right after preLeft.', 'O(n)', 'O(1)', ['Meta', 'Amazon']),
      p('in-place-linked-list-reversal', 24, 'Swap Nodes in Pairs', 'swap-nodes-in-pairs', 'Medium', false, 'Special case of k-group reversal with k = 2 using a dummy sentinel node.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon']),
      p('in-place-linked-list-reversal', 234, 'Palindrome Linked List', 'palindrome-linked-list', 'Easy', false, 'Reverse the second half from the midpoint, compare node-by-node, and optionally restore.', 'O(n)', 'O(1)', ['Meta', 'Amazon']),
      p('in-place-linked-list-reversal', 61, 'Rotate List', 'rotate-list', 'Medium', false, 'Connect tail to head to form a ring and break after length - (k % length) steps.', 'O(n)', 'O(1)', ['Amazon', 'Bloomberg']),
    ],
  },
  {
    id: 'monotonic-stack',
    number: 13,
    groupId: 'linked-lists-stacks-queues',
    title: 'Monotonic Stack',
    shortTitle: 'Monotonic Stack',
    summary: 'Maintain increasing/decreasing order to find the next greater/smaller element in O(n) (Daily Temperatures, Largest Rectangle in Histogram).',
    mentalModel: 'Each index is pushed once and popped once; popping happens the exact instant we discover its next greater or smaller boundary.',
    triggerSignals: ['next greater element', 'previous smaller element', 'histogram largest rectangle', 'stock span', 'sum of subarray minimums'],
    timeComplexity: 'O(n) amortized: each index is pushed once and popped at most once.',
    spaceComplexity: 'O(n) worst-case stack entries.',
    hasTrickyTemplate: true,
    canonicalSlug: 'daily-temperatures',
    problems: [
      p('monotonic-stack', 739, 'Daily Temperatures', 'daily-temperatures', 'Medium', true, 'Keep a monotonic decreasing stack of indices; when temp[i] > temp[top], resolve ans[top] = i - top.', 'O(n)', 'O(n)', ['Meta', 'Amazon', 'Google']),
      p('monotonic-stack', 84, 'Largest Rectangle in Histogram', 'largest-rectangle-in-histogram', 'Hard', false, 'Monotonic increasing stack of indices with a 0 sentinel; popped bar spans from new top + 1 to i - 1.', 'O(n)', 'O(n)', ['Google', 'Amazon', 'Microsoft']),
      p('monotonic-stack', 496, 'Next Greater Element I', 'next-greater-element-i', 'Easy', false, 'Precompute nextGreater map on nums2 with a decreasing stack, then lookup nums1 in O(1).', 'O(n + m)', 'O(n)', ['Amazon', 'Bloomberg']),
      p('monotonic-stack', 503, 'Next Greater Element II', 'next-greater-element-ii', 'Medium', false, 'Iterate 0 .. 2n - 1 using i % n to handle wrap-around next greater queries.', 'O(n)', 'O(n)', ['Google', 'Amazon']),
      p('monotonic-stack', 907, 'Sum of Subarray Minimums', 'sum-of-subarray-minimums', 'Medium', false, 'Find prev strictly-smaller and next smaller-or-equal via monotonic stack to avoid double counting.', 'O(n)', 'O(n)', ['Amazon', 'Google']),
      p('monotonic-stack', 402, 'Remove K Digits', 'remove-k-digits', 'Medium', false, 'Pop larger previous digits greedily while k > 0 to build the lexicographically smallest number.', 'O(n)', 'O(n)', ['Microsoft', 'Meta']),
    ],
  },
  {
    id: 'monotonic-deque',
    number: 14,
    groupId: 'linked-lists-stacks-queues',
    title: 'Monotonic Deque',
    shortTitle: 'Monotonic Deque',
    summary: 'Track the sliding window maximum or minimum in O(1) amortized time (Sliding Window Maximum).',
    mentalModel: 'Evict expired indices from the front (idx <= i - k) and drop dominated smaller values from the back so the front is always the window extremum.',
    triggerSignals: ['sliding window maximum', 'sliding window minimum', 'bounded subarray max - min <= limit', 'jump game VI DP optimization'],
    timeComplexity: 'O(n) amortized: each index enters and leaves the deque at most once.',
    spaceComplexity: 'O(k) candidate indices for a window of size k.',
    hasTrickyTemplate: true,
    canonicalSlug: 'sliding-window-maximum',
    problems: [
      p('monotonic-deque', 239, 'Sliding Window Maximum', 'sliding-window-maximum', 'Hard', true, 'Store indices in decreasing value order; pop front if out of window, pop back while nums[back] <= nums[i].', 'O(n)', 'O(k)', ['Amazon', 'Google', 'Meta']),
      p('monotonic-deque', 1438, 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', 'longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit', 'Medium', false, 'Maintain both a decreasing maxDeque and increasing minDeque alongside a shrinking left pointer.', 'O(n)', 'O(n)', ['Google', 'Uber']),
      p('monotonic-deque', 862, 'Shortest Subarray with Sum at Least K', 'shortest-subarray-with-sum-at-least-k', 'Hard', false, 'Keep prefix sums in an increasing deque; pop front when prefix[i] - prefix[front] >= k.', 'O(n)', 'O(n)', ['Google', 'Meta']),
      p('monotonic-deque', 1696, 'Jump Game VI', 'jump-game-vi', 'Medium', false, 'Optimize dp[i] = nums[i] + max(dp[i-k..i-1]) from O(nk) to O(n) via a max deque.', 'O(n)', 'O(k)', ['Amazon', 'Google']),
      p('monotonic-deque', 1425, 'Constrained Subsequence Sum', 'constrained-subsequence-sum', 'Hard', false, 'Maintain a decreasing deque of positive dp[j] values within distance k.', 'O(n)', 'O(k)', ['Google', 'Meta']),
      p('monotonic-deque', 1499, 'Max Value of Equation', 'max-value-of-equation', 'Hard', false, 'Maximize (y_i - x_i) + (y_j + x_j) by keeping (y_i - x_i) in a decreasing deque where x_j - x_i <= k.', 'O(n)', 'O(n)', ['Google', 'Uber']),
    ],
  },

  // =========================================================================
  // GROUP 3: BINARY SEARCH & HEAPS (15 - 19)
  // =========================================================================
  {
    id: 'modified-binary-search',
    number: 15,
    groupId: 'binary-search-heaps',
    title: 'Modified Binary Search',
    shortTitle: 'Modified Binary Search',
    summary: 'Search in rotated, bitonic, or 2D sorted spaces (Search in Rotated Sorted Array, Find Peak Element).',
    mentalModel: 'Even when an array is rotated or bitonic, one half around mid preserves an invariant that lets you discard half the space every step.',
    triggerSignals: ['rotated sorted array', 'find peak element', 'O(log n) required', 'first and last position', 'sorted 2D matrix'],
    timeComplexity: 'O(log n) when each iteration discards a constant fraction; duplicate-heavy rotated-array variants can degrade to O(n).',
    spaceComplexity: 'O(1) auxiliary space for iterative search; recursive implementations use O(log n) stack.',
    hasTrickyTemplate: true,
    canonicalSlug: 'search-in-rotated-sorted-array',
    problems: [
      p('modified-binary-search', 33, 'Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'Medium', true, 'Check whether [lo..mid] or [mid..hi] is sorted, then test if target lies strictly inside that sorted half.', 'O(log n)', 'O(1)', ['Meta', 'Amazon', 'Google']),
      p('modified-binary-search', 162, 'Find Peak Element', 'find-peak-element', 'Medium', false, 'If nums[mid] < nums[mid + 1], a peak must exist on the right; otherwise on the left including mid.', 'O(log n)', 'O(1)', ['Meta', 'Google', 'Amazon']),
      p('modified-binary-search', 153, 'Find Minimum in Rotated Sorted Array', 'find-minimum-in-rotated-sorted-array', 'Medium', false, 'Compare nums[mid] with nums[hi]: if greater, minimum is strictly right of mid; else at or left of mid.', 'O(log n)', 'O(1)', ['Amazon', 'Microsoft', 'Meta']),
      p('modified-binary-search', 34, 'Find First and Last Position of Element in Sorted Array', 'find-first-and-last-position-of-element-in-sorted-array', 'Medium', false, 'Run lower_bound(target) and upper_bound(target) - 1 with clean half-open intervals.', 'O(log n)', 'O(1)', ['Meta', 'Google', 'LinkedIn']),
      p('modified-binary-search', 74, 'Search a 2D Matrix', 'search-a-2d-matrix', 'Medium', false, 'Map flat index mid in [0, m*n - 1] directly to (Math.floor(mid / n), mid % n).', 'O(log(m · n))', 'O(1)', ['Amazon', 'Microsoft']),
      p('modified-binary-search', 4, 'Median of Two Sorted Arrays', 'median-of-two-sorted-arrays', 'Hard', false, 'Binary search the partition cut on the smaller array so maxLeft <= minRight on both sides.', 'O(log min(m, n))', 'O(1)', ['Google', 'Amazon', 'Meta']),
    ],
  },
  {
    id: 'binary-search-on-answer',
    number: 16,
    groupId: 'binary-search-heaps',
    title: 'Binary Search on Answer',
    shortTitle: 'BS on Answer',
    summary: 'Binary search over a monotonic answer range using a greedy validation function (Koko Eating Bananas, Capacity To Ship Packages).',
    mentalModel: 'Whenever feasible(x) flips monotonically from False...False to True...True (or vice versa), binary search the boundary x with an O(n) check.',
    triggerSignals: ['minimize the maximum', 'maximize the minimum', 'minimum speed/capacity to finish in H hours', 'split array largest sum', 'k-th smallest distance'],
    timeComplexity: 'O(C(n) log R), where C(n) is one feasibility-check cost and R is the candidate-range width; O(n log R) when each check is O(n).',
    spaceComplexity: 'O(1) auxiliary space only when the feasibility check itself uses O(1) extra space.',
    hasTrickyTemplate: true,
    canonicalSlug: 'koko-eating-bananas',
    problems: [
      p('binary-search-on-answer', 875, 'Koko Eating Bananas', 'koko-eating-bananas', 'Medium', true, 'Search speed k in [1, max(piles)]; feasible(k) sums ceil(pile / k) <= h to find the smallest valid k.', 'O(n log M)', 'O(1)', ['Google', 'Amazon', 'Meta']),
      p('binary-search-on-answer', 1011, 'Capacity To Ship Packages Within D Days', 'capacity-to-ship-packages-within-d-days', 'Medium', false, 'Search capacity in [max(weights), sum(weights)] and greedily pack consecutive days.', 'O(n log S)', 'O(1)', ['Amazon', 'Meta', 'Google']),
      p('binary-search-on-answer', 410, 'Split Array Largest Sum', 'split-array-largest-sum', 'Hard', false, 'Search max subarray sum in [max(nums), sum(nums)]; count greedy splits needed <= k.', 'O(n log S)', 'O(1)', ['Google', 'Meta', 'Amazon']),
      p('binary-search-on-answer', 1482, 'Minimum Number of Days to Make m Bouquets', 'minimum-number-of-days-to-make-m-bouquets', 'Medium', false, 'Binary search day in [minDay, maxDay] and count adjacent bloomed runs of length k.', 'O(n log D)', 'O(1)', ['Google', 'Amazon']),
      p('binary-search-on-answer', 1552, 'Magnetic Force Between Two Balls', 'magnetic-force-between-two-balls', 'Medium', false, 'Maximize the minimum distance: sort positions and greedily place balls spaced >= mid apart.', 'O(n log(maxPos))', 'O(1)', ['Amazon', 'Uber']),
      p('binary-search-on-answer', 1283, 'Find the Smallest Divisor Given a Threshold', 'find-the-smallest-divisor-given-a-threshold', 'Medium', false, 'Identical monotonic feasibility shape to Koko Eating Bananas on [1, max(nums)].', 'O(n log M)', 'O(1)', ['Google', 'Microsoft']),
    ],
  },
  {
    id: 'top-k-elements-heap',
    number: 17,
    groupId: 'binary-search-heaps',
    title: 'Top K Elements (Heap)',
    shortTitle: 'Top K (Heap)',
    summary: 'Use a min-heap of size K for largest items or max-heap of size K for smallest (Kth Largest Element in an Array, Top K Frequent Elements).',
    mentalModel: 'Keep only the K best candidates in a bounded heap of size K so every eviction costs O(log K) instead of O(n log n) full sorting.',
    triggerSignals: ['kth largest / smallest', 'top k frequent', 'k closest points', 'reorganize string', 'task scheduler'],
    timeComplexity: 'O(n log k) with a bounded heap for 1 <= k <= n; alternative selection methods have different expected/worst-case bounds.',
    spaceComplexity: 'O(k) auxiliary heap entries, excluding input and output.',
    hasTrickyTemplate: false,
    canonicalSlug: 'kth-largest-element-in-an-array',
    problems: [
      p('top-k-elements-heap', 215, 'Kth Largest Element in an Array', 'kth-largest-element-in-an-array', 'Medium', true, 'Push into a min-heap and pop whenever size > k; the root holds the exact kth largest.', 'O(n log k)', 'O(k)', ['Meta', 'Amazon', 'Google']),
      p('top-k-elements-heap', 347, 'Top K Frequent Elements', 'top-k-frequent-elements', 'Medium', false, 'Count frequencies, then maintain a size-k min-heap (or O(n) frequency bucket sort).', 'O(n log k)', 'O(n)', ['Meta', 'Amazon', 'Google']),
      p('top-k-elements-heap', 973, 'K Closest Points to Origin', 'k-closest-points-to-origin', 'Medium', false, 'Maintain a max-heap of size k keyed by x² + y² (no sqrt needed).', 'O(n log k)', 'O(k)', ['Meta', 'Amazon', 'Uber']),
      p('top-k-elements-heap', 767, 'Reorganize String', 'reorganize-string', 'Medium', false, 'Pop the most frequent remaining char from a max-heap and hold the previously used char for 1 turn.', 'O(n log 26)', 'O(1)', ['Amazon', 'Google', 'Meta']),
      p('top-k-elements-heap', 621, 'Task Scheduler', 'task-scheduler', 'Medium', false, 'Process highest-frequency tasks from a max-heap with a cooldown queue (or O(n) idle math).', 'O(n)', 'O(1)', ['Meta', 'Amazon', 'Uber']),
      p('top-k-elements-heap', 703, 'Kth Largest Element in a Stream', 'kth-largest-element-in-a-stream', 'Easy', false, 'Persist a min-heap capped at size k so add(val) answers in O(log k).', 'O(log k)', 'O(k)', ['Amazon', 'Google']),
    ],
  },
  {
    id: 'two-heaps',
    number: 18,
    groupId: 'binary-search-heaps',
    title: 'Two Heaps',
    shortTitle: 'Two Heaps',
    summary: 'Balance a max-heap (lower half) and min-heap (upper half) for streaming medians (Find Median from Data Stream).',
    mentalModel: 'Split numbers at the median: maxHeap holds the smaller half, minHeap holds the larger half, and |size(max) - size(min)| <= 1.',
    triggerSignals: ['median from data stream', 'sliding window median', 'maximize capital (IPO)', 'split dynamic stream into halves'],
    timeComplexity: 'O(log n) insertion/rebalancing and O(1) median lookup for two balanced heaps.',
    spaceComplexity: 'O(n) stored values across both heaps.',
    hasTrickyTemplate: true,
    canonicalSlug: 'find-median-from-data-stream',
    problems: [
      p('two-heaps', 295, 'Find Median from Data Stream', 'find-median-from-data-stream', 'Hard', true, 'Push to low (max-heap), move low.top() to high (min-heap), then rebalance if high.size > low.size.', 'O(log n)', 'O(n)', ['Google', 'Amazon', 'Meta']),
      p('two-heaps', 480, 'Sliding Window Median', 'sliding-window-median', 'Hard', false, 'Pair Two Heaps with a lazy-deletion hash map to remove elements sliding out of the k-window.', 'O(n log k)', 'O(n)', ['Google', 'Meta', 'Amazon']),
      p('two-heaps', 502, 'IPO', 'ipo', 'Hard', false, 'Min-heap by required capital unlocks affordable projects into a max-heap keyed by profit.', 'O(n log n)', 'O(n)', ['Amazon', 'Microsoft']),
      p('two-heaps', 436, 'Find Right Interval', 'find-right-interval', 'Medium', false, 'Two heaps (or sorted start times) pair each interval end with the smallest start >= end.', 'O(n log n)', 'O(n)', ['Google', 'Uber']),
      p('two-heaps', 2402, 'Meeting Rooms III', 'meeting-rooms-iii', 'Hard', false, 'Keep an availableRooms min-heap and a busyRooms min-heap ordered by (endTime, roomId).', 'O(m log n)', 'O(n)', ['Google', 'Uber']),
      p('two-heaps', 1825, 'Finding MK Average', 'finding-mk-average', 'Hard', false, 'Partition the last m items across lower-k, middle, and upper-k balanced structures.', 'O(log m)', 'O(m)', ['Google', 'Bloomberg']),
    ],
  },
  {
    id: 'k-way-merge',
    number: 19,
    groupId: 'binary-search-heaps',
    title: 'K-Way Merge',
    shortTitle: 'K-Way Merge',
    summary: 'Use a min-heap to merge multiple sorted arrays or linked lists (Merge K Sorted Lists, Kth Smallest Element in a Sorted Matrix).',
    mentalModel: 'Seed a min-heap with the head of each sorted stream; pop the smallest global element and push its immediate successor from the same stream.',
    triggerSignals: ['merge k sorted lists', 'kth smallest in sorted matrix', 'k pairs with smallest sums', 'smallest range covering k lists'],
    timeComplexity: 'O(N log k) for N total elements across k sorted sources using a heap of at most k heads.',
    spaceComplexity: 'O(k) heap entries, excluding the merged output.',
    hasTrickyTemplate: true,
    canonicalSlug: 'merge-k-sorted-lists',
    problems: [
      p('k-way-merge', 23, 'Merge k Sorted Lists', 'merge-k-sorted-lists', 'Hard', true, 'Seed a min-heap with each non-null list head; pop min, attach to tail, and push min.next.', 'O(N log k)', 'O(k)', ['Meta', 'Amazon', 'Google']),
      p('k-way-merge', 378, 'Kth Smallest Element in a Sorted Matrix', 'kth-smallest-element-in-a-sorted-matrix', 'Medium', false, 'Treat each sorted row as a stream; pop k times pushing (row, col + 1) into the min-heap.', 'O(k log n)', 'O(n)', ['Meta', 'Google', 'Amazon']),
      p('k-way-merge', 373, 'Find K Pairs with Smallest Sums', 'find-k-pairs-with-smallest-sums', 'Medium', false, 'Seed (i, 0) for i < min(k, n1); popping (i, j) pushes only (i, j + 1) to avoid duplicates.', 'O(k log k)', 'O(k)', ['Amazon', 'LinkedIn']),
      p('k-way-merge', 632, 'Smallest Range Covering Elements from K Lists', 'smallest-range-covering-elements-from-k-lists', 'Hard', false, 'Track currentMax alongside a min-heap of one item per list; advance whichever list holds the min.', 'O(N log k)', 'O(k)', ['Google', 'Amazon', 'Meta']),
      p('k-way-merge', 264, 'Ugly Number II', 'ugly-number-ii', 'Medium', false, '3-way merge of streams 2*dp[i2], 3*dp[i3], and 5*dp[i5] advancing all tied pointers.', 'O(n)', 'O(n)', ['Google', 'Bloomberg']),
      p('k-way-merge', 1439, 'Find the Kth Smallest Sum of a Matrix With Sorted Rows', 'find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows', 'Hard', false, 'Iteratively k-way merge the current top-k sums with the next row.', 'O(m · k log k)', 'O(k)', ['Google', 'Amazon']),
    ],
  },

  // =========================================================================
  // GROUP 4: TREES, GRAPHS & TRIES (20 - 26)
  // =========================================================================
  {
    id: 'tree-dfs',
    number: 20,
    groupId: 'trees-graphs-tries',
    title: 'Tree DFS (Pre/In/Post-Order)',
    shortTitle: 'Tree DFS',
    summary: 'Pass state down from root or aggregate return values up from subtrees (Diameter of Binary Tree, Lowest Common Ancestor).',
    mentalModel: 'Decide if the problem is Top-Down (pass bounds/path sum as arguments) or Bottom-Up Post-Order (combine left & right subtree returns).',
    triggerSignals: ['diameter / max path sum', 'lowest common ancestor', 'validate BST bounds', 'subtree height / balance', 'serialize binary tree'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    hasTrickyTemplate: false,
    canonicalSlug: 'lowest-common-ancestor-of-a-binary-tree',
    problems: [
      p('tree-dfs', 236, 'Lowest Common Ancestor of a Binary Tree', 'lowest-common-ancestor-of-a-binary-tree', 'Medium', true, 'Post-order: return node if null/p/q; if both left and right are non-null, current node is the LCA.', 'O(n)', 'O(h)', ['Meta', 'Amazon', 'Google']),
      p('tree-dfs', 543, 'Diameter of Binary Tree', 'diameter-of-binary-tree', 'Easy', false, 'Return subtree height upward while updating global diameter = max(diameter, leftH + rightH).', 'O(n)', 'O(h)', ['Meta', 'Google', 'Amazon']),
      p('tree-dfs', 124, 'Binary Tree Maximum Path Sum', 'binary-tree-maximum-path-sum', 'Hard', false, 'Clamp negative child gains to 0; update global best with left + node.val + right, return single branch.', 'O(n)', 'O(h)', ['Meta', 'Google', 'Microsoft']),
      p('tree-dfs', 98, 'Validate Binary Search Tree', 'validate-binary-search-tree', 'Medium', false, 'Top-down DFS passing strict (minVal, maxVal) bounds to every descendant.', 'O(n)', 'O(h)', ['Amazon', 'Meta', 'Microsoft']),
      p('tree-dfs', 105, 'Construct Binary Tree from Preorder and Inorder Traversal', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Medium', false, 'Pick root sequentially from preorder and split left/right subtrees in O(1) via an inorder index map.', 'O(n)', 'O(n)', ['Amazon', 'Microsoft', 'Google']),
      p('tree-dfs', 297, 'Serialize and Deserialize Binary Tree', 'serialize-and-deserialize-binary-tree', 'Hard', false, 'Preorder traversal with explicit null sentinel markers uniquely reconstructs the tree in O(n).', 'O(n)', 'O(n)', ['Meta', 'Google', 'Amazon']),
    ],
  },
  {
    id: 'tree-bfs',
    number: 21,
    groupId: 'trees-graphs-tries',
    title: 'Tree BFS (Level-Order)',
    shortTitle: 'Tree BFS',
    summary: 'Process nodes depth-by-depth using a queue (Binary Tree Right Side View, Zigzag Level Order Traversal).',
    mentalModel: 'Snapshot levelSize = queue.length at the start of each outer loop iteration so all nodes processed inside belong strictly to the same depth.',
    triggerSignals: ['level order traversal', 'right side view', 'zigzag traversal', 'maximum width of binary tree', 'connect next right pointers'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(w)',
    hasTrickyTemplate: false,
    canonicalSlug: 'binary-tree-right-side-view',
    problems: [
      p('tree-bfs', 199, 'Binary Tree Right Side View', 'binary-tree-right-side-view', 'Medium', true, 'Snapshot each level size and record the last node popped at every depth.', 'O(n)', 'O(w)', ['Meta', 'Amazon', 'Google']),
      p('tree-bfs', 103, 'Binary Tree Zigzag Level Order Traversal', 'binary-tree-zigzag-level-order-traversal', 'Medium', false, 'Write into level[i] on even depths and level[size - 1 - i] on odd depths.', 'O(n)', 'O(w)', ['Amazon', 'Microsoft', 'Meta']),
      p('tree-bfs', 102, 'Binary Tree Level Order Traversal', 'binary-tree-level-order-traversal', 'Medium', false, 'Classic level-size queue loop collecting values depth-by-depth.', 'O(n)', 'O(w)', ['Amazon', 'Meta', 'Microsoft']),
      p('tree-bfs', 662, 'Maximum Width of Binary Tree', 'maximum-width-of-binary-tree', 'Medium', false, 'Store normalized heap indices (idx - levelStart) per node to prevent integer overflow.', 'O(n)', 'O(w)', ['Google', 'Amazon']),
      p('tree-bfs', 116, 'Populating Next Right Pointers in Each Node', 'populating-next-right-pointers-in-each-node', 'Medium', false, 'Link curr.left -> curr.right and curr.right -> curr.next.left level by level in O(1) space.', 'O(n)', 'O(1)', ['Microsoft', 'Amazon']),
      p('tree-bfs', 863, 'All Nodes Distance K in Binary Tree', 'all-nodes-distance-k-in-binary-tree', 'Medium', false, 'Record parent pointers via DFS, then run a 3-neighbor BFS outward from target for K steps.', 'O(n)', 'O(n)', ['Meta', 'Amazon', 'Google']),
    ],
  },
  {
    id: 'trie-prefix-tree',
    number: 22,
    groupId: 'trees-graphs-tries',
    title: 'Trie (Prefix Tree)',
    shortTitle: 'Trie (Prefix Tree)',
    summary: 'Store strings character-by-character for fast prefix matching and autocomplete (Implement Trie, Word Search II).',
    mentalModel: 'Share common string prefixes along tree edges so insert, exact lookup, and prefix pruning run in O(L) independent of dictionary size.',
    triggerSignals: ['prefix search / autocomplete', 'wildcard dictionary search', 'find multiple words on a grid', 'word suggestions', 'maximum XOR pair'],
    timeComplexity: 'O(L) per insert/search/prefix operation for fixed-alphabet direct child lookup; map-backed children have expected per-character lookup.',
    spaceComplexity: 'O(total stored characters) nodes with sparse child maps; fixed-size child arrays add alphabet-factor storage.',
    hasTrickyTemplate: true,
    canonicalSlug: 'implement-trie-prefix-tree',
    problems: [
      p('trie-prefix-tree', 208, 'Implement Trie (Prefix Tree)', 'implement-trie-prefix-tree', 'Medium', true, 'Each TrieNode holds children map/array[26] and isEnd flag for O(L) insert, search, and startsWith.', 'O(L)', 'O(Σ · N)', ['Google', 'Amazon', 'Meta']),
      p('trie-prefix-tree', 212, 'Word Search II', 'word-search-ii', 'Hard', false, 'Build a Trie of target words and prune grid DFS dead branches plus matched leaves dynamically.', 'O(M·N·3^L)', 'O(total chars)', ['Amazon', 'Google', 'Uber']),
      p('trie-prefix-tree', 211, 'Design Add and Search Words Data Structure', 'design-add-and-search-words-data-structure', 'Medium', false, 'Walk Trie normally on letters and branch DFS across all existing children on "." wildcard.', 'O(L) avg', 'O(total chars)', ['Meta', 'Amazon', 'Google']),
      p('trie-prefix-tree', 1268, 'Search Suggestions System', 'search-suggestions-system', 'Medium', false, 'Store up to 3 lexicographically smallest suggestions on each Trie node along the prefix path.', 'O(total chars)', 'O(total chars)', ['Amazon', 'Google']),
      p('trie-prefix-tree', 648, 'Replace Words', 'replace-words', 'Medium', false, 'Insert dictionary roots into a Trie and stop at the first isEnd hit while scanning each word.', 'O(total chars)', 'O(total chars)', ['Uber', 'Google']),
      p('trie-prefix-tree', 421, 'Maximum XOR of Two Numbers in an Array', 'maximum-xor-of-two-numbers-in-an-array', 'Medium', false, 'Bitwise Trie from MSB to LSB greedily picks the opposite bit at every depth.', 'O(32 · n)', 'O(32 · n)', ['Google', 'Meta']),
    ],
  },
  {
    id: 'graph-bfs-multi-source',
    number: 23,
    groupId: 'trees-graphs-tries',
    title: 'Graph BFS & Multi-Source BFS',
    shortTitle: 'Graph & Multi-BFS',
    summary: 'Find shortest paths in unweighted grids or spread state simultaneously from multiple sources (Rotting Oranges, Shortest Path in Binary Matrix).',
    mentalModel: 'Mark visited at enqueue time (never on pop!) and enqueue all initial sources together at t = 0 so BFS ripples outward in exact shortest-step waves.',
    triggerSignals: ['shortest path in unweighted grid', 'rotting oranges / fire spread', 'nearest 0 or gate distance', 'word ladder minimum transforms'],
    timeComplexity: 'O(V + E) across all vertices and edges reachable from the sources.',
    spaceComplexity: 'O(V) auxiliary queue and visited state, excluding the graph representation and returned paths.',
    hasTrickyTemplate: true,
    canonicalSlug: 'rotting-oranges',
    problems: [
      p('graph-bfs-multi-source', 994, 'Rotting Oranges', 'rotting-oranges', 'Medium', true, 'Enqueue every initially rotten orange at t = 0, decrement fresh count on enqueue, and count BFS waves.', 'O(m · n)', 'O(m · n)', ['Amazon', 'Google', 'Meta']),
      p('graph-bfs-multi-source', 1091, 'Shortest Path in Binary Matrix', 'shortest-path-in-binary-matrix', 'Medium', false, '8-directional unweighted BFS from (0,0) marking visited immediately upon enqueue.', 'O(n²)', 'O(n²)', ['Meta', 'Google', 'Amazon']),
      p('graph-bfs-multi-source', 542, '01 Matrix', '01-matrix', 'Medium', false, 'Multi-source BFS starting from all 0-cells simultaneously computes distance to nearest 0 in one pass.', 'O(m · n)', 'O(m · n)', ['Google', 'Amazon']),
      p('graph-bfs-multi-source', 127, 'Word Ladder', 'word-ladder', 'Hard', false, 'BFS over implicit graph via wildcard patterns (h*t) — or bidirectional BFS for faster fanout.', 'O(N · L²)', 'O(N · L²)', ['Amazon', 'Meta', 'Google']),
      p('graph-bfs-multi-source', 286, 'Walls and Gates', 'walls-and-gates', 'Medium', false, 'Push all gates (value 0) into the initial queue so every empty room gets filled with its shortest distance.', 'O(m · n)', 'O(m · n)', ['Meta', 'Google', 'Uber']),
      p('graph-bfs-multi-source', 752, 'Open the Lock', 'open-the-lock', 'Medium', false, 'State-space BFS over 4-wheel strings with deadends pre-inserted into the visited set.', 'O(10^4)', 'O(10^4)', ['Google', 'Amazon']),
    ],
  },
  {
    id: 'topological-sort',
    number: 24,
    groupId: 'trees-graphs-tries',
    title: "Topological Sort (Kahn's / DFS)",
    shortTitle: 'Topological Sort',
    summary: 'Order tasks with dependencies or detect cycles in directed graphs (Course Schedule II, Alien Dictionary).',
    mentalModel: "Kahn's BFS queues every node with indegree 0, peels off outgoing edges, and detects a directed cycle whenever processedCount < V.",
    triggerSignals: ['course prerequisites', 'build / task dependency order', 'alien dictionary character order', 'detect cycle in directed graph', 'DAG longest path'],
    timeComplexity: 'O(V + E) for Kahn or DFS topological ordering of a DAG.',
    spaceComplexity: 'O(V) auxiliary indegree/visited/queue/order state, excluding the stored adjacency graph.',
    hasTrickyTemplate: true,
    canonicalSlug: 'course-schedule-ii',
    problems: [
      p('topological-sort', 210, 'Course Schedule II', 'course-schedule-ii', 'Medium', true, 'Build adjacency list + indegree array; peel indegree-0 queue and return [] if order.length < numCourses.', 'O(V + E)', 'O(V + E)', ['Amazon', 'Google', 'Meta']),
      p('topological-sort', 269, 'Alien Dictionary', 'alien-dictionary', 'Hard', false, 'Compare adjacent words for the first differing char to create directed edges, then run Kahn’s sort.', 'O(C)', 'O(1)', ['Meta', 'Google', 'Airbnb']),
      p('topological-sort', 207, 'Course Schedule', 'course-schedule', 'Medium', false, 'Directed cycle detection: return true iff Kahn’s algorithm visits all numCourses nodes.', 'O(V + E)', 'O(V + E)', ['Amazon', 'Meta', 'Microsoft']),
      p('topological-sort', 310, 'Minimum Height Trees', 'minimum-height-trees', 'Medium', false, 'Iteratively peel degree-1 leaf layers from the tree until 1 or 2 centroid nodes remain.', 'O(V)', 'O(V)', ['Google', 'Amazon']),
      p('topological-sort', 802, 'Find Eventual Safe States', 'find-eventual-safe-states', 'Medium', false, 'Reverse edges and run Kahn’s sort starting from terminal (outdegree-0) nodes.', 'O(V + E)', 'O(V + E)', ['Google', 'Bloomberg']),
      p('topological-sort', 1136, 'Parallel Courses', 'parallel-courses', 'Medium', false, 'Level-by-level Kahn’s BFS counts the exact minimum semesters needed to finish all courses.', 'O(V + E)', 'O(V + E)', ['Google', 'Meta']),
    ],
  },
  {
    id: 'union-find-disjoint-set',
    number: 25,
    groupId: 'trees-graphs-tries',
    title: 'Union-Find (Disjoint Set)',
    shortTitle: 'Union-Find (DSU)',
    summary: 'Dynamically track connected components and detect cycles in undirected graphs (Number of Provinces, Redundant Connection).',
    mentalModel: 'Combine Path Compression in find(x) with Union by Rank/Size so connectivity checks and merges run in near-constant O(α(n)) amortized time.',
    triggerSignals: ['connected components', 'redundant edge in undirected graph', 'merge accounts / equivalence classes', 'minimum spanning tree (Kruskal)', 'dynamic connectivity'],
    timeComplexity: 'O(α(n)) amortized per operation with path compression plus union by rank or size; without both optimizations the bound differs.',
    spaceComplexity: 'O(n) parent and rank/size arrays.',
    hasTrickyTemplate: true,
    canonicalSlug: 'redundant-connection',
    problems: [
      p('union-find-disjoint-set', 684, 'Redundant Connection', 'redundant-connection', 'Medium', true, 'Process undirected edges in order; the first edge whose endpoints already share a root closes the cycle.', 'O(n · α(n))', 'O(n)', ['Google', 'Amazon', 'Meta']),
      p('union-find-disjoint-set', 547, 'Number of Provinces', 'number-of-provinces', 'Medium', false, 'Start with n components and decrement whenever union(i, j) merges two distinct roots.', 'O(n² · α(n))', 'O(n)', ['Amazon', 'Google']),
      p('union-find-disjoint-set', 721, 'Accounts Merge', 'accounts-merge', 'Medium', false, 'Map each email to its first seen account index, union shared accounts, then group emails by root.', 'O(N log N)', 'O(N)', ['Meta', 'Google', 'Amazon']),
      p('union-find-disjoint-set', 323, 'Number of Connected Components in an Undirected Graph', 'number-of-connected-components-in-an-undirected-graph', 'Medium', false, 'Direct DSU component counter decrementing on each successful union.', 'O((V + E) · α(V))', 'O(V)', ['Amazon', 'LinkedIn']),
      p('union-find-disjoint-set', 261, 'Graph Valid Tree', 'graph-valid-tree', 'Medium', false, 'A graph is a valid tree iff edges.length === n - 1 and no union encounters an existing cycle.', 'O(V · α(V))', 'O(V)', ['Google', 'Meta']),
      p('union-find-disjoint-set', 1584, 'Min Cost to Connect All Points', 'min-cost-to-connect-all-points', 'Medium', false, "Kruskal's MST: sort Manhattan edges by weight and union until n - 1 edges are accepted.", 'O(n² log n)', 'O(n²)', ['Amazon', 'Microsoft']),
    ],
  },
  {
    id: 'shortest-path-weighted',
    number: 26,
    groupId: 'trees-graphs-tries',
    title: 'Shortest Path (Dijkstra / Bellman-Ford)',
    shortTitle: 'Shortest Path',
    summary: 'Find minimum-cost paths in weighted graphs (Network Delay Time, Cheapest Flights Within K Stops).',
    mentalModel: 'Use Dijkstra (min-heap + stale-entry skip) for non-negative weights; use Bellman-Ford (K edge-relaxation rounds on a snapshot) for negative weights or stop limits.',
    triggerSignals: ['weighted shortest path', 'minimum network delay', 'cheapest flights within k stops', 'minimum effort path in grid', 'maximum probability path'],
    timeComplexity: 'O((V + E) log V) with an adjacency list and binary heap for Dijkstra on non-negative weights; negative weights require another algorithm.',
    spaceComplexity: 'O(V + E) including graph storage and heap entries; auxiliary distance/heap state is O(V) to O(E) depending on heap strategy.',
    hasTrickyTemplate: true,
    canonicalSlug: 'network-delay-time',
    problems: [
      p('shortest-path-weighted', 743, 'Network Delay Time', 'network-delay-time', 'Medium', true, 'Run Dijkstra from k with a min-heap of (dist, node); skip popped entries where d > dist[u].', 'O(E log V)', 'O(V + E)', ['Google', 'Amazon', 'Uber']),
      p('shortest-path-weighted', 787, 'Cheapest Flights Within K Stops', 'cheapest-flights-within-k-stops', 'Medium', false, 'Run K + 1 Bellman-Ford relaxation rounds reading from prevDist snapshot so edges do not chain.', 'O(K · E)', 'O(V)', ['Airbnb', 'Google', 'Amazon']),
      p('shortest-path-weighted', 1631, 'Path With Minimum Effort', 'path-with-minimum-effort', 'Medium', false, 'Dijkstra on grid where path cost is max(effortSoFar, abs(h[nr][nc] - h[r][c])).', 'O(m·n log(m·n))', 'O(m · n)', ['Google', 'Meta']),
      p('shortest-path-weighted', 778, 'Swim in Rising Water', 'swim-in-rising-water', 'Hard', false, 'Min-heap Dijkstra expanding the lowest elevation neighbor until reaching (n-1, n-1).', 'O(n² log n)', 'O(n²)', ['Google', 'Amazon']),
      p('shortest-path-weighted', 1514, 'Path with Maximum Probability', 'path-with-maximum-probability', 'Medium', false, 'Max-heap Dijkstra multiplying edge probabilities in [0, 1].', 'O(E log V)', 'O(V + E)', ['Google', 'Microsoft']),
      p('shortest-path-weighted', 1976, 'Number of Ways to Arrive at Destination', 'number-of-ways-to-arrive-at-destination', 'Medium', false, 'Track dist[v] and ways[v] inside Dijkstra: reset ways on strict improvement, add ways on tie.', 'O(E log V)', 'O(V + E)', ['Google', 'Uber']),
    ],
  },

  // =========================================================================
  // GROUP 5: RECURSION, GREEDY & DYNAMIC PROGRAMMING (27 - 28)
  // =========================================================================
  {
    id: 'backtracking',
    number: 27,
    groupId: 'recursion-greedy-dp',
    title: 'Backtracking (Subsets, Permutations, Grid Search)',
    shortTitle: 'Backtracking',
    summary: 'Build candidates incrementally and undo choices when constraints fail (Combination Sum, N-Queens, Word Search).',
    mentalModel: 'Choose -> Explore -> Unchoose (pop/restore). Sort input and skip i > start && nums[i] === nums[i-1] to prune duplicate branches cleanly.',
    triggerSignals: ['return all subsets / combinations / permutations', 'N-Queens / Sudoku solver', 'word search on grid', 'palindrome partitioning', 'generate parentheses'],
    timeComplexity: 'Problem-dependent and output-sensitive: commonly O(2^n) for subsets or O(n!) for permutations, plus work per node and output cost.',
    spaceComplexity: 'O(depth) recursion/path state (O(n) for common subset/permutation search), excluding stored output.',
    hasTrickyTemplate: true,
    canonicalSlug: 'combination-sum',
    problems: [
      p('backtracking', 39, 'Combination Sum', 'combination-sum', 'Medium', true, 'Sort candidates, pass start index to allow reuse (recurse with i, not i+1), and prune when cand > remaining.', 'O(N^(T/M))', 'O(T/M)', ['Airbnb', 'Meta', 'Amazon']),
      p('backtracking', 51, 'N-Queens', 'n-queens', 'Hard', false, 'Place one queen per row tracking occupied cols, diag1 (r - c), and diag2 (r + c) sets in O(1).', 'O(n!)', 'O(n)', ['Google', 'Amazon', 'Meta']),
      p('backtracking', 79, 'Word Search', 'word-search', 'Medium', false, 'DFS 4-directionally marking board[r][c] temporarily visited and restoring it on backtrack.', 'O(M·N·3^L)', 'O(L)', ['Amazon', 'Microsoft', 'Meta']),
      p('backtracking', 78, 'Subsets', 'subsets', 'Medium', false, 'Record a copy of path at every recursion node and loop i from start..n-1.', 'O(n · 2^n)', 'O(n)', ['Meta', 'Amazon', 'Google']),
      p('backtracking', 46, 'Permutations', 'permutations', 'Medium', false, 'Track a boolean used[] array (or in-place swap) and emit path when path.length === n.', 'O(n · n!)', 'O(n)', ['Microsoft', 'Amazon', 'Meta']),
      p('backtracking', 131, 'Palindrome Partitioning', 'palindrome-partitioning', 'Medium', false, 'Only cut at end if s[start..end] is a palindrome, then recurse from end + 1.', 'O(n · 2^n)', 'O(n)', ['Google', 'Amazon']),
    ],
  },
  {
    id: 'dynamic-programming',
    number: 28,
    groupId: 'recursion-greedy-dp',
    title: 'Dynamic Programming (1D, 2D, Knapsack, LIS, Interval)',
    shortTitle: 'Dynamic Programming',
    summary: 'Cache overlapping subproblems via memoization or tabulation (Coin Change, Longest Common Subsequence, Edit Distance, Partition Equal Subset Sum).',
    mentalModel: 'Define state dp[...], write the recurrence transition, set base cases, determine evaluation order, and optimize rolling space when possible.',
    triggerSignals: ['minimum coins / cost to reach target', 'number of ways', 'longest common subsequence / edit distance', 'subset sum / knapsack', 'longest increasing subsequence'],
    timeComplexity: 'O(number of states × transitions per state), plus preprocessing and output reconstruction.',
    spaceComplexity: 'O(number of stored states); rolling arrays may reduce this to O(row) when dependencies permit.',
    hasTrickyTemplate: true,
    canonicalSlug: 'coin-change',
    problems: [
      p('dynamic-programming', 322, 'Coin Change', 'coin-change', 'Medium', true, 'Unbounded knapsack 1D DP: dp[a] = min(dp[a], 1 + dp[a - coin]) seeded with dp[0] = 0.', 'O(A · C)', 'O(A)', ['Amazon', 'Google', 'Meta']),
      p('dynamic-programming', 1143, 'Longest Common Subsequence', 'longest-common-subsequence', 'Medium', false, '2D DP: match adds 1 + dp[i-1][j-1]; mismatch takes max(dp[i-1][j], dp[i][j-1]).', 'O(m · n)', 'O(min(m, n))', ['Amazon', 'Google', 'Microsoft']),
      p('dynamic-programming', 72, 'Edit Distance', 'edit-distance', 'Medium', false, '2D DP over prefixes: 1 + min(insert, delete, replace) on mismatch.', 'O(m · n)', 'O(min(m, n))', ['Google', 'Amazon', 'Meta']),
      p('dynamic-programming', 416, 'Partition Equal Subset Sum', 'partition-equal-subset-sum', 'Medium', false, '0/1 Knapsack boolean DP iterating capacity backward from target down to num.', 'O(n · S)', 'O(S)', ['Meta', 'Amazon', 'Google']),
      p('dynamic-programming', 300, 'Longest Increasing Subsequence', 'longest-increasing-subsequence', 'Medium', false, 'O(n²) DP or O(n log n) patience-sorting tails array with lower_bound binary search.', 'O(n log n)', 'O(n)', ['Google', 'Amazon', 'Microsoft']),
      p('dynamic-programming', 312, 'Burst Balloons', 'burst-balloons', 'Hard', false, 'Interval DP: choose which balloon k bursts LAST inside open range (l, r) so boundaries stay fixed.', 'O(n³)', 'O(n²)', ['Google', 'Amazon']),
    ],
  },
];

export const DSA28_CROSS_CUTTING_TECHNIQUES: Dsa28CrossCuttingTechnique[] = [
  {
    id: 'greedy-technique',
    title: 'Greedy Choice & Local Invariants',
    summary: 'Appears across intervals, heaps, and array sweeps whenever a provably optimal local choice never needs to be undone.',
    whenToApply: [
      'Reachability jumps (track farthest reachable index in one pass)',
      'Circular net-surplus restarts (reset start when running tank drops below zero)',
      'Two-pass neighbor constraints (left-to-right then right-to-left)',
    ],
    canonicalExamples: [
      { leetcodeNumber: 55, title: 'Jump Game', slug: 'jump-game', difficulty: 'Medium', keyTrick: 'Maintain farthest = max(farthest, i + nums[i]); fail if i > farthest.' },
      { leetcodeNumber: 134, title: 'Gas Station', slug: 'gas-station', difficulty: 'Medium', keyTrick: 'If totalGas >= totalCost, reset start to i + 1 whenever tank dips below 0.' },
      { leetcodeNumber: 135, title: 'Candy', slug: 'candy', difficulty: 'Hard', keyTrick: 'Left pass enforces ascending right neighbors; right pass enforces ascending left neighbors.' },
    ],
  },
  {
    id: 'bit-manipulation-xor',
    title: 'Bit Manipulation & XOR Tricks',
    summary: 'Lightweight O(1)-space algebraic primitives used alongside hashing, cyclic sort, and DP bitmasks.',
    whenToApply: [
      'Self-cancellation: a ^ a = 0 and a ^ 0 = a finds unique/missing values in O(1) space',
      'Lowest set bit isolation: x & -x splits two unique numbers or powers Fenwick Trees',
      'Clear lowest set bit: x & (x - 1) counts set bits (Kernighan) or checks powers of two',
    ],
    canonicalExamples: [
      { leetcodeNumber: 136, title: 'Single Number', slug: 'single-number', difficulty: 'Easy', keyTrick: 'XOR every element; all pairs cancel to 0 leaving the lone integer.' },
      { leetcodeNumber: 338, title: 'Counting Bits', slug: 'counting-bits', difficulty: 'Easy', keyTrick: 'dp[i] = dp[i >> 1] + (i & 1) computes popcounts for 0..n in O(n).' },
      { leetcodeNumber: 260, title: 'Single Number III', slug: 'single-number-iii', difficulty: 'Medium', keyTrick: 'Partition numbers by diffBit = xorAll & -xorAll to separate the two singletons.' },
    ],
  },
];

export const DSA28_COMPACT_REVISION_LIST: Array<{
  patternNumber: number;
  patternId: string;
  patternTitle: string;
  groupId: Dsa28TopicGroupId;
  problem: Dsa28Problem;
}> = DSA28_PATTERNS.map((pat) => {
  const canonical = pat.problems.find((item) => item.isCanonical28) ?? pat.problems[0];
  return {
    patternNumber: pat.number,
    patternId: pat.id,
    patternTitle: pat.title,
    groupId: pat.groupId,
    problem: canonical,
  };
});

export interface Dsa28BundlePayload {
  groups: Dsa28TopicGroup[];
  patterns: Dsa28Pattern[];
  crossCutting: Dsa28CrossCuttingTechnique[];
}

export const DSA28_CANONICAL_BUNDLE: Dsa28BundlePayload = {
  groups: DSA28_TOPIC_GROUPS,
  patterns: DSA28_PATTERNS,
  crossCutting: DSA28_CROSS_CUTTING_TECHNIQUES,
};

// =========================================================================
// DETERMINISTIC ELIGIBLE-CATEGORY CLASSIFIER (FOR LEETCODE / GFG PULLS)
// =========================================================================

interface PatternSignalRule {
  patternId: string;
  tagKeywords: string[];
  textKeywords: string[];
  strongPhrases: string[];
}

const PATTERN_CLASSIFIER_RULES: PatternSignalRule[] = [
  {
    patternId: 'hashmap-hashset-lookup',
    tagKeywords: ['hash table', 'hashing', 'hash map', 'hash set', 'counting'],
    textKeywords: ['anagram', 'duplicate', 'frequency', 'complement', 'two sum', 'consecutive sequence', 'isomorphic', 'sudoku'],
    strongPhrases: ['find a pair', 'frequency of each', 'group anagrams', 'contains duplicate'],
  },
  {
    patternId: 'prefix-sum-difference-array',
    tagKeywords: ['prefix sum', 'difference array'],
    textKeywords: ['prefix sum', 'subarray sum', 'range sum', 'cumulative', 'divisible by k', 'contiguous array', 'car pooling', 'product except self'],
    strongPhrases: ['sum equals k', 'range sum query', 'bulk range update', 'difference array'],
  },
  {
    patternId: 'two-pointers-opposite-ends',
    tagKeywords: ['two pointers'],
    textKeywords: ['palindrome', 'container', 'trapping rain', '3sum', '4sum', 'sorted array', 'opposite ends', 'water'],
    strongPhrases: ['two pointers', 'sorted input array', 'valid palindrome', 'most water'],
  },
  {
    patternId: 'two-pointers-same-direction',
    tagKeywords: ['two pointers', 'in-place'],
    textKeywords: ['in-place', 'move zeroes', 'remove duplicates', 'sort colors', 'dutch national flag', 'partition', 'compress'],
    strongPhrases: ['modify the input array in-place', 'without making a copy', 'sort colors', 'move all zeroes'],
  },
  {
    patternId: 'fixed-sliding-window',
    tagKeywords: ['sliding window'],
    textKeywords: ['length k', 'size k', 'fixed window', 'permutation in string', 'anagrams in a string', 'maximum average', 'k consecutive'],
    strongPhrases: ['subarray of length k', 'substring of length k', 'window of size k'],
  },
  {
    patternId: 'dynamic-sliding-window',
    tagKeywords: ['sliding window', 'string'],
    textKeywords: ['longest substring', 'minimum window', 'without repeating', 'at most k', 'character replacement', 'distinct characters', 'subarray product'],
    strongPhrases: ['minimum window substring', 'longest substring', 'at most k distinct', 'contiguous subarray'],
  },
  {
    patternId: 'kadanes-algorithm',
    tagKeywords: ['kadane', 'maximum subarray'],
    textKeywords: ['kadane', 'maximum subarray', 'largest sum contiguous', 'maximum product subarray', 'circular subarray', 'buy and sell stock'],
    strongPhrases: ['maximum sum subarray', 'contiguous subarray with the largest sum', 'kadane'],
  },
  {
    patternId: 'cyclic-sort',
    tagKeywords: ['cyclic sort'],
    textKeywords: ['first missing positive', 'missing number', 'disappeared', 'range [1, n]', '1 to n', 'set mismatch'],
    strongPhrases: ['in the range [1, n]', 'smallest missing positive', 'o(1) auxiliary space'],
  },
  {
    patternId: 'merge-intervals',
    tagKeywords: ['intervals', 'line sweep', 'sorting'],
    textKeywords: ['interval', 'meeting room', 'overlap', 'merge intervals', 'balloon', 'calendar', 'schedule'],
    strongPhrases: ['overlapping intervals', 'minimum number of meeting rooms', 'merge all overlapping'],
  },
  {
    patternId: 'matrix-traversal-simulation',
    tagKeywords: ['matrix', 'simulation'],
    textKeywords: ['spiral', 'rotate image', 'rotate matrix', 'set matrix zeroes', 'diagonal', 'game of life', 'transpose', 'clockwise'],
    strongPhrases: ['spiral order', 'rotate the image by 90', 'matrix zeroes'],
  },
  {
    patternId: 'fast-slow-pointers',
    tagKeywords: ['linked list', 'two pointers'],
    textKeywords: ['cycle', 'floyd', 'middle of the linked list', 'linked list cycle', 'happy number', 'duplicate number', 'reorder list'],
    strongPhrases: ['detect cycle', 'node where the cycle begins', 'middle node'],
  },
  {
    patternId: 'in-place-linked-list-reversal',
    tagKeywords: ['linked list'],
    textKeywords: ['reverse linked list', 'k-group', 'swap nodes', 'rotate list', 'reverse nodes', 'palindrome linked list'],
    strongPhrases: ['reverse the linked list', 'reverse nodes in k', 'in-place reversal'],
  },
  {
    patternId: 'monotonic-stack',
    tagKeywords: ['monotonic stack', 'stack'],
    textKeywords: ['next greater', 'next smaller', 'histogram', 'daily temperatures', 'stock span', 'subarray minimums', 'remove k digits', 'asteroid'],
    strongPhrases: ['next greater element', 'largest rectangle in histogram', 'warmer temperature'],
  },
  {
    patternId: 'monotonic-deque',
    tagKeywords: ['monotonic queue', 'queue', 'deque'],
    textKeywords: ['sliding window maximum', 'sliding window minimum', 'deque', 'absolute diff', 'jump game vi', 'constrained subsequence'],
    strongPhrases: ['sliding window maximum', 'maximum of each window', 'monotonic deque'],
  },
  {
    patternId: 'modified-binary-search',
    tagKeywords: ['binary search'],
    textKeywords: ['rotated sorted', 'peak element', 'first and last position', 'search a 2d matrix', 'bitonic', 'median of two sorted'],
    strongPhrases: ['rotated sorted array', 'o(log n) runtime complexity', 'find peak element'],
  },
  {
    patternId: 'binary-search-on-answer',
    tagKeywords: ['binary search'],
    textKeywords: ['koko', 'eating bananas', 'ship packages', 'bouquets', 'magnetic force', 'smallest divisor', 'split array largest', 'allocate books', 'aggressive cows'],
    strongPhrases: ['minimize the maximum', 'maximize the minimum', 'minimum speed', 'minimum capacity', 'within d days'],
  },
  {
    patternId: 'top-k-elements-heap',
    tagKeywords: ['heap (priority queue)', 'heap', 'priority queue', 'quickselect'],
    textKeywords: ['kth largest', 'kth smallest', 'top k', 'k closest', 'reorganize string', 'task scheduler', 'most frequent'],
    strongPhrases: ['kth largest element', 'top k frequent', 'k closest points'],
  },
  {
    patternId: 'two-heaps',
    tagKeywords: ['heap (priority queue)', 'heap'],
    textKeywords: ['median from data stream', 'sliding window median', 'running median', 'stream median', 'ipo', 'maximize capital'],
    strongPhrases: ['find median from data stream', 'median of the stream', 'two heaps'],
  },
  {
    patternId: 'k-way-merge',
    tagKeywords: ['heap (priority queue)', 'merge sort', 'divide and conquer'],
    textKeywords: ['merge k sorted', 'k sorted lists', 'k sorted arrays', 'sorted matrix', 'k pairs with smallest', 'smallest range'],
    strongPhrases: ['merge k sorted', 'kth smallest element in a sorted matrix', 'smallest range covering'],
  },
  {
    patternId: 'tree-dfs',
    tagKeywords: ['tree', 'binary tree', 'binary search tree', 'depth-first search'],
    textKeywords: ['diameter', 'lowest common ancestor', 'lca', 'maximum path sum', 'validate binary search tree', 'inorder', 'preorder', 'postorder', 'subtree', 'serialize'],
    strongPhrases: ['lowest common ancestor', 'diameter of binary tree', 'binary search tree', 'maximum path sum'],
  },
  {
    patternId: 'tree-bfs',
    tagKeywords: ['tree', 'binary tree', 'breadth-first search'],
    textKeywords: ['level order', 'right side view', 'zigzag', 'maximum width', 'depth-by-depth', 'next right pointers', 'distance k', 'average of levels'],
    strongPhrases: ['level order traversal', 'right side view', 'zigzag level'],
  },
  {
    patternId: 'trie-prefix-tree',
    tagKeywords: ['trie'],
    textKeywords: ['trie', 'prefix tree', 'autocomplete', 'startswith', 'word search ii', 'search suggestions', 'dictionary', 'prefix'],
    strongPhrases: ['prefix tree', 'implement trie', 'starts with prefix', 'word dictionary'],
  },
  {
    patternId: 'graph-bfs-multi-source',
    tagKeywords: ['breadth-first search', 'graph', 'shortest path'],
    textKeywords: ['rotting oranges', 'word ladder', 'walls and gates', '01 matrix', 'open the lock', 'shortest path in binary matrix', 'minimum steps', 'grid'],
    strongPhrases: ['shortest path in', 'minimum number of minutes', 'minimum number of steps', 'multi-source'],
  },
  {
    patternId: 'topological-sort',
    tagKeywords: ['topological sort', 'directed graph', 'dag'],
    textKeywords: ['prerequisite', 'course schedule', 'alien dictionary', 'topological', 'dependency', 'indegree', 'safe states', 'dag'],
    strongPhrases: ['course schedule', 'topological order', 'prerequisites', 'directed acyclic'],
  },
  {
    patternId: 'union-find-disjoint-set',
    tagKeywords: ['union find', 'disjoint set'],
    textKeywords: ['union find', 'disjoint set', 'provinces', 'redundant connection', 'connected components', 'accounts merge', 'valid tree', 'spanning tree', 'kruskal'],
    strongPhrases: ['connected components', 'redundant connection', 'disjoint set', 'accounts merge'],
  },
  {
    patternId: 'shortest-path-weighted',
    tagKeywords: ['shortest path', 'dijkstra', 'bellman-ford', 'graph'],
    textKeywords: ['dijkstra', 'bellman', 'network delay', 'cheapest flights', 'weighted graph', 'minimum effort', 'swim in rising water', 'maximum probability', 'k stops'],
    strongPhrases: ['cheapest price', 'network delay', 'weighted directed graph', 'minimum effort'],
  },
  {
    patternId: 'backtracking',
    tagKeywords: ['backtracking', 'recursion'],
    textKeywords: ['subsets', 'permutations', 'combination sum', 'n-queens', 'sudoku', 'word search', 'palindrome partitioning', 'generate parentheses', 'all possible'],
    strongPhrases: ['return all possible', 'combination sum', 'n-queens', 'generate all'],
  },
  {
    patternId: 'dynamic-programming',
    tagKeywords: ['dynamic programming', 'memoization', 'knapsack'],
    textKeywords: ['coin change', 'longest common subsequence', 'edit distance', 'knapsack', 'subset sum', 'longest increasing subsequence', 'climbing stairs', 'house robber', 'burst balloons', 'minimum cost', 'number of ways'],
    strongPhrases: ['dynamic programming', 'number of ways to', 'minimum number of coins', 'longest common subsequence', 'edit distance'],
  },
];

export function classifyQuestionToPattern28(input: {
  title?: string;
  statement?: string;
  topics?: string[];
  constraints?: string[];
}): Pattern28ClassificationResult {
  const title = (input.title ?? '').toLowerCase();
  const statement = (input.statement ?? '').toLowerCase();
  const topics = (input.topics ?? []).map((t) => t.toLowerCase());
  const constraints = (input.constraints ?? []).join(' ').toLowerCase();
  const combined = `${title} ${statement} ${topics.join(' ')} ${constraints}`;

  const groupMap = new Map(DSA28_TOPIC_GROUPS.map((g) => [g.id, g.title]));

  const scored: Pattern28ClassificationMatch[] = DSA28_PATTERNS.map((pat) => {
    const rule = PATTERN_CLASSIFIER_RULES.find((r) => r.patternId === pat.id);
    let score = 0;
    const reasons: string[] = [];

    // Direct canonical/supporting slug or title match
    const exactMatch = pat.problems.find(
      (prob) =>
        title.includes(prob.title.toLowerCase()) ||
        title.includes(prob.slug.replace(/-/g, ' '))
    );
    if (exactMatch) {
      score += 45;
      reasons.push(`Matches canonical pattern problem (${exactMatch.title})`);
    }

    if (rule) {
      for (const tagKw of rule.tagKeywords) {
        if (topics.some((t) => t.includes(tagKw))) {
          score += 14;
          reasons.push(`Topic tag matches "${tagKw}"`);
        }
      }
      for (const phrase of rule.strongPhrases) {
        if (combined.includes(phrase)) {
          score += 18;
          reasons.push(`Strong signal: "${phrase}"`);
        }
      }
      for (const kw of rule.textKeywords) {
        if (title.includes(kw)) {
          score += 12;
          reasons.push(`Title keyword "${kw}"`);
        } else if (statement.includes(kw)) {
          score += 6;
          reasons.push(`Statement keyword "${kw}"`);
        }
      }
    }

    // Check pattern's own triggerSignals
    for (const sig of pat.triggerSignals) {
      const normalized = sig.toLowerCase();
      if (combined.includes(normalized)) {
        score += 10;
        reasons.push(`Matches trigger "${sig}"`);
      }
    }

    const dedupedReasons = Array.from(new Set(reasons)).slice(0, 4);
    return {
      patternId: pat.id,
      patternNumber: pat.number,
      patternTitle: pat.title,
      groupTitle: groupMap.get(pat.groupId) ?? '',
      score,
      confidence: 0,
      matchedReasons: dedupedReasons,
    };
  });

  scored.sort((a, b) => b.score - a.score || a.patternNumber - b.patternNumber);

  const topScore = scored[0]?.score ?? 0;
  const secondScore = scored[1]?.score ?? 0;

  const withConfidence = scored.map((item, idx) => {
    if (topScore === 0) {
      return {
        ...item,
        confidence: idx === 0 ? 45 : 30,
        matchedReasons:
          item.matchedReasons.length > 0
            ? item.matchedReasons
            : ['General array / lookup baseline — review and pick the best fit'],
      };
    }
    const ratio = item.score / Math.max(topScore, 1);
    const marginBoost = idx === 0 && topScore - secondScore >= 12 ? 8 : 0;
    const rawConf = Math.min(98, Math.max(25, Math.round(42 + ratio * 48 + marginBoost)));
    return {
      ...item,
      confidence: rawConf,
    };
  });

  return {
    best: withConfidence[0],
    alternatives: withConfidence.slice(1, 4),
  };
}
