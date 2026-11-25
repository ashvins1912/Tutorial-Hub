import { BigTechTopicCategory, CodeLanguage } from '../types/dsa';
import { EXTRA_6_ALGORITHMS, PRACTICE_CHALLENGES, AlgorithmPracticeSpec } from './algorithmsPracticeExtras';
import { ADV_GRAPH_ALGORITHMS, ADV_GRAPH_PRACTICE } from './algorithmsAdvGraphs';
import { ADV_TREE_ALGORITHMS, ADV_TREE_PRACTICE } from './algorithmsAdvTrees';
import { ADV_STRING_ALGORITHMS, ADV_STRING_PRACTICE } from './algorithmsAdvStrings';
import { ADV_DP_ALGORITHMS, ADV_DP_PRACTICE } from './algorithmsAdvDp';
import { ADV_MATH_RAND_ALGORITHMS, ADV_MATH_RAND_PRACTICE } from './algorithmsAdvMathRand';
import { SPECIALIST_9_ALGORITHMS, SPECIALIST_9_PRACTICE } from './algorithmsSpecialistPack';
import { MASTER_CORE_11_ALGORITHMS, MASTER_CORE_11_PRACTICE } from './algorithmsMasterCorePack';
import { MASTER_ADV_18_ALGORITHMS, MASTER_ADV_18_PRACTICE } from './algorithmsMasterAdvancedPack';
import { MASTER_SYSTEMS_11_ALGORITHMS, MASTER_SYSTEMS_11_PRACTICE } from './algorithmsMasterSystemsPack';

export type AlgorithmCategory =
  | 'Array & String Patterns'
  | 'Searching & Sorting'
  | 'Tree & Graph Traversal'
  | 'Optimization & Decision Making'
  | 'Specialized Algorithms'
  | 'Advanced Graph Algorithms'
  | 'Range Queries & Advanced Trees'
  | 'Advanced String Algorithms'
  | 'Advanced Dynamic Programming'
  | 'Number Theory & Geometry'
  | 'Randomized & Heuristic Algorithms'
  | 'Probabilistic & Memory Systems'
  | 'Database Storage & Query Engines'
  | 'Distributed Systems & Consensus';

export const CORE_ALGORITHM_CATEGORIES: AlgorithmCategory[] = [
  'Array & String Patterns',
  'Searching & Sorting',
  'Tree & Graph Traversal',
  'Optimization & Decision Making',
  'Specialized Algorithms',
];

export const ADVANCED_ALGORITHM_CATEGORIES: AlgorithmCategory[] = [
  'Advanced Graph Algorithms',
  'Range Queries & Advanced Trees',
  'Advanced String Algorithms',
  'Advanced Dynamic Programming',
  'Number Theory & Geometry',
  'Randomized & Heuristic Algorithms',
];

export const SYSTEMS_ALGORITHM_CATEGORIES: AlgorithmCategory[] = [
  'Probabilistic & Memory Systems',
  'Database Storage & Query Engines',
  'Distributed Systems & Consensus',
];

export type AlgorithmVisualType =
  | 'prefix-hash'
  | 'two-pointers'
  | 'sliding-window'
  | 'binary-search'
  | 'fast-slow'
  | 'monotonic-stack'
  | 'tree-traversal'
  | 'heap-intervals'
  | 'graph-topo'
  | 'dijkstra-graph'
  | 'backtracking-tree'
  | 'dp-table'
  | 'merge-sort'
  | 'greedy-intervals'
  | 'kadane'
  | 'cyclic-sort'
  | 'dfs-stack'
  | 'union-find'
  | 'bit-grid'
  | 'kmp-match'
  | 'weighted-network'
  | 'matrix-grid'
  | 'tree-structure'
  | 'array-cells-bit'
  | 'stream-partition'
  | 'geometry-hull'
  | 'number-sieve';

export interface AlgorithmStepFrame {
  step: number;
  title: string;
  explanation: string;
  invariantCheck: string;
  variables: { name: string; value: string }[];
  array?: (number | string)[];
  secondaryArray?: (number | string | null)[];
  pointers?: { label: string; index: number; tone: 'sky' | 'emerald' | 'amber' | 'rose' }[];
  highlightIndices?: number[];
  matchedIndices?: number[];
  eliminatedIndices?: number[];
  windowRange?: [number, number];
  hashEntries?: { key: string; val: string; active?: boolean; hit?: boolean }[];
  stackItems?: { label: string; sub?: string; active?: boolean }[];
  queueItems?: string[];
  activeNodes?: string[];
  visitedNodes?: string[];
  prunedNodes?: string[];
  activeEdges?: string[];
  nodeBadges?: Record<string, string>;
  dpDependencies?: { from: number; to: number; label: string }[];
  intervals?: {
    id: string;
    start: number;
    end: number;
    status: 'pending' | 'active' | 'selected' | 'skipped' | 'reused';
    room?: number;
  }[];
  mergeLevels?: { values: number[]; range: [number, number]; active?: boolean; sorted?: boolean }[];
  outputSeq?: string[];
  matrix?: {
    subtitle?: string;
    rowLabels?: string[];
    colLabels?: string[];
    cells: (string | number)[][];
    activeCells?: [number, number][];
    matchedCells?: [number, number][];
    blockedCells?: [number, number][];
  };
  graphSpec?: {
    caption?: string;
    nodes: { id: string; x: number; y: number; group?: number; sub?: string }[];
    edges: { u: string; v: string; label?: string; directed?: boolean; dashed?: boolean }[];
  };
  geometrySpec?: {
    mode: 'hull' | 'lines';
    caption?: string;
    queryX?: number;
    points: { x: number; y: number; label: string; highlight?: boolean; pruned?: boolean }[];
    hullPath?: [number, number][];
    lines?: { m: number; b: number; label: string; status: 'hull' | 'active' | 'pruned' }[];
  };
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  shortName: string;
  category: AlgorithmCategory;
  visualType: AlgorithmVisualType;
  tagline: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityLeap: string;
  coreIdea: string;
  mentalModelSteps: string[];
  loopInvariant: string;
  whenToUse: string[];
  whenItFails: string;
  linkedTopics: BigTechTopicCategory[];
  linkedProblemSlugs: string[];
  featuredLabId?: string;
  hasDpLabLink?: boolean;
  templates: Record<CodeLanguage, string>;
  frames: AlgorithmStepFrame[];
}

const BASE_14_ALGORITHMS: AlgorithmDefinition[] = [
  // 1. Prefix Sum & Hashing
  {
    id: 'prefix-sum-hash',
    name: 'Prefix Sum & Hash Map',
    shortName: 'Prefix Sum',
    category: 'Array & String Patterns',
    visualType: 'prefix-hash',
    tagline: 'Turn O(N²) subarray checks into expected O(N) time with hash-map complement lookups.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) nested range sum → O(N) single running total sweep',
    coreIdea:
      'Every contiguous slice [i+1 .. j] has sum Prefix[j] - Prefix[i]. Instead of scanning backward to find all starting points i, store the frequency of every earlier Prefix[i] in a hash map and query Prefix[j] - k with an expected O(1) hash-map lookup (worst-case lookup can be slower).',
    mentalModelSteps: [
      'Seed the hash map with {0: 1} to represent an empty prefix before index 0.',
      'Maintain a single running sum variable prefix as you scan left to right.',
      'At index j, add freq[prefix - k] to the answer; the frequency records how many earlier prefixes match.',
      'Increment freq[prefix] AFTER checking so you never pair an index with itself.',
    ],
    loopInvariant:
      'Before processing nums[j], freq[s] equals the exact number of prefixes ending strictly before j whose sum is s.',
    whenToUse: [
      'Contiguous subarray sum equals target k (even with negative numbers or zeros)',
      'Subarray sum divisible by k (store prefix % k)',
      'Fast repeated immutable range sum queries sum(l, r) = P[r+1] - P[l]',
    ],
    whenItFails:
      'For target-sum subarray counting, a sliding window is not generally valid when negative values are present: removing a value may increase the sum. Prefix sums with a frequency map handle negative values; their O(N) time bound is expected under typical hash-map behavior. For repeated immutable range-sum queries, a prefix array alone supports O(1) queries after O(N) preprocessing.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['subarray-sum-equals-k', 'two-sum', 'product-of-array-except-self', 'first-missing-positive'],
    featuredLabId: 'two-sum',
    templates: {
      python: `def subarray_sum(nums, k):
    freq = {0: 1}
    prefix = count = 0
    for x in nums:
        prefix += x
        count += freq.get(prefix - k, 0)
        freq[prefix] = freq.get(prefix, 0) + 1
    return count`,
      js: `function subarraySum(nums, k) {
  const freq = new Map([[0, 1]]);
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += freq.get(prefix - k) || 0;
    freq.set(prefix, (freq.get(prefix) || 0) + 1);
  }
  return count;
}`,
      java: `public int subarraySum(int[] nums, int k) {
  Map<Integer, Integer> freq = new HashMap<>();
  freq.put(0, 1);
  int prefix = 0, count = 0;
  for (int x : nums) {
    prefix += x;
    count += freq.getOrDefault(prefix - k, 0);
    freq.put(prefix, freq.getOrDefault(prefix, 0) + 1);
  }
  return count;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Seed empty prefix {0: 1}',
        explanation: 'Initialize prefix = 0, count = 0, and map = {0: 1} for target k = 3 on nums = [1, 2, 1, -1, 2].',
        invariantCheck: 'Empty prefix sum 0 occurs once before index 0.',
        variables: [
          { name: 'target k', value: '3' },
          { name: 'prefix', value: '0' },
          { name: 'count', value: '0' },
        ],
        array: [1, 2, 1, -1, 2],
        secondaryArray: [null, null, null, null, null],
        pointers: [],
        hashEntries: [{ key: '0', val: '1', active: true }],
      },
      {
        step: 2,
        title: 'Index 0: x = 1 → prefix = 1',
        explanation: 'Need prefix - k = 1 - 3 = -2. Not in map. Record prefix 1 in map.',
        invariantCheck: 'Check complement before inserting current prefix.',
        variables: [
          { name: 'j', value: '0' },
          { name: 'prefix', value: '1' },
          { name: 'need (p-k)', value: '-2 (miss)' },
          { name: 'count', value: '0' },
        ],
        array: [1, 2, 1, -1, 2],
        secondaryArray: [1, null, null, null, null],
        pointers: [{ label: 'j', index: 0, tone: 'sky' }],
        highlightIndices: [0],
        hashEntries: [
          { key: '0', val: '1' },
          { key: '1', val: '1', active: true },
        ],
      },
      {
        step: 3,
        title: 'Index 1: x = 2 → prefix = 3 (HIT!)',
        explanation: 'Need 3 - 3 = 0. Map has freq[0] = 1! Subarray [1, 2] sums to 3. Count becomes 1.',
        invariantCheck: 'Prefix 3 minus earlier prefix 0 yields slice [0..1].',
        variables: [
          { name: 'j', value: '1' },
          { name: 'prefix', value: '3' },
          { name: 'need (p-k)', value: '0 (HIT +1)' },
          { name: 'count', value: '1' },
        ],
        array: [1, 2, 1, -1, 2],
        secondaryArray: [1, 3, null, null, null],
        pointers: [{ label: 'j', index: 1, tone: 'emerald' }],
        matchedIndices: [0, 1],
        hashEntries: [
          { key: '0', val: '1', hit: true },
          { key: '1', val: '1' },
          { key: '3', val: '1', active: true },
        ],
      },
      {
        step: 4,
        title: 'Index 2: x = 1 → prefix = 4 (HIT!)',
        explanation: 'Need 4 - 3 = 1. Map has freq[1] = 1! Slice [2, 1] (indices 1..2) sums to 3. Count becomes 2.',
        invariantCheck: 'Prefix 4 minus earlier prefix 1 yields slice [1..2].',
        variables: [
          { name: 'j', value: '2' },
          { name: 'prefix', value: '4' },
          { name: 'need (p-k)', value: '1 (HIT +1)' },
          { name: 'count', value: '2' },
        ],
        array: [1, 2, 1, -1, 2],
        secondaryArray: [1, 3, 4, null, null],
        pointers: [{ label: 'j', index: 2, tone: 'emerald' }],
        matchedIndices: [1, 2],
        hashEntries: [
          { key: '0', val: '1' },
          { key: '1', val: '1', hit: true },
          { key: '3', val: '1' },
          { key: '4', val: '1', active: true },
        ],
      },
      {
        step: 5,
        title: 'Index 3: x = -1 → prefix = 3 (HIT with negative!)',
        explanation: 'Negative value drops prefix back to 3. Need 3 - 3 = 0 → freq[0] = 1! Slice [1, 2, 1, -1] sums to 3. Count = 3.',
        invariantCheck: 'Works seamlessly with negatives where Sliding Window fails.',
        variables: [
          { name: 'j', value: '3' },
          { name: 'prefix', value: '3' },
          { name: 'need (p-k)', value: '0 (HIT +1)' },
          { name: 'count', value: '3' },
        ],
        array: [1, 2, 1, -1, 2],
        secondaryArray: [1, 3, 4, 3, null],
        pointers: [{ label: 'j', index: 3, tone: 'emerald' }],
        matchedIndices: [0, 1, 2, 3],
        hashEntries: [
          { key: '0', val: '1', hit: true },
          { key: '1', val: '1' },
          { key: '3', val: '2', active: true },
          { key: '4', val: '1' },
        ],
      },
      {
        step: 6,
        title: 'Index 4: x = 2 → prefix = 5 (Done)',
        explanation: 'Need 5 - 3 = 2 → not in map. Final answer: 3 contiguous subarrays sum to k = 3. The scan is expected O(N) time with a hash map and O(N) auxiliary space.',
        invariantCheck: 'Expected total work is O(N), instead of checking N(N+1)/2 subarrays; hash-table worst-case behavior depends on collisions.',
        variables: [
          { name: 'j', value: '4' },
          { name: 'prefix', value: '5' },
          { name: 'need (p-k)', value: '2 (miss)' },
          { name: 'final count', value: '3' },
        ],
        array: [1, 2, 1, -1, 2],
        secondaryArray: [1, 3, 4, 3, 5],
        pointers: [{ label: 'j', index: 4, tone: 'sky' }],
        highlightIndices: [4],
        hashEntries: [
          { key: '0', val: '1' },
          { key: '1', val: '1' },
          { key: '3', val: '2' },
          { key: '4', val: '1' },
          { key: '5', val: '1', active: true },
        ],
      },
    ],
  },

  // 2. Two Pointers
  {
    id: 'two-pointers',
    name: 'Converging Two Pointers',
    shortName: 'Two Pointers',
    category: 'Array & String Patterns',
    visualType: 'two-pointers',
    tagline: 'Reduce pair checks to O(N) when the problem has a proven monotonic rule for safely discarding candidates.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(N²) all pairs → O(N) single inward sweep in O(1) space',
    coreIdea:
      'For a problem with a valid discard proof, place L and R at opposite ends and evaluate the current pair. Move only the pointer that the proof shows cannot lead to a better remaining answer. The rule depends on the objective: for container area, move the shorter wall; for a sorted target-sum pair, move L when the sum is too small and R when it is too large. Do not apply one pointer-movement rule to every two-pointer problem.',
    mentalModelSteps: [
      'Start pointers at opposite extremes: L = 0, R = n - 1.',
      'Evaluate the current pair (e.g., area = (R - L) * min(h[L], h[R]) or sum = a[L] + a[R]).',
      'Choose the movement rule proved for this problem (for container area, move the shorter wall; for sorted pair sum, move the side that moves the sum toward the target).',
      'Advance only the limiting pointer inward until L meets R.',
    ],
    loopInvariant:
      'Every pair eliminated by moving the shorter wall had strictly smaller width and height capped by that same shorter wall.',
    whenToUse: [
      'Sorted array pair / triplet sums (2Sum II, 3Sum, 4Sum)',
      'Container With Most Water & Trapping Rain Water',
      'Palindrome validation or in-place array partitioning',
    ],
    whenItFails:
      'For pair-sum on unsorted input, sorting is safe only if you retain the original index associated with each value and map the result back. If preserving order or avoiding sorting matters, a hash map may be a better fit. The converging-pointer method also requires a monotonic discard rule; it is not a generic replacement for checking all pairs.',
    linkedTopics: ['Two Pointers'],
    linkedProblemSlugs: ['container-with-most-water', 'trapping-rain-water', '3sum', 'valid-palindrome-ii'],
    featuredLabId: 'trapping-rain-water',
    templates: {
      python: `def max_area(height):
    l, r, best = 0, len(height) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,
      js: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, (r - l) * Math.min(height[l], height[r]));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}`,
      java: `public int maxArea(int[] h) {
  int l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, (r - l) * Math.min(h[l], h[r]));
    if (h[l] < h[r]) l++; else r--;
  }
  return best;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Start at maximum width (L=0, R=5)',
        explanation: 'Heights [3, 8, 2, 5, 7, 4]. Width = 5, limiting wall = min(3, 4) = 3 → Area = 15.',
        invariantCheck: 'h[0]=3 < h[5]=4, so L=0 can never pair better with any smaller width.',
        variables: [
          { name: 'L / R', value: '0 / 5' },
          { name: 'area', value: '5 × 3 = 15' },
          { name: 'best', value: '15' },
        ],
        array: [3, 8, 2, 5, 7, 4],
        pointers: [
          { label: 'L', index: 0, tone: 'sky' },
          { label: 'R', index: 5, tone: 'amber' },
        ],
        windowRange: [0, 5],
      },
      {
        step: 2,
        title: 'Advance shorter wall L → 1',
        explanation: 'Now h[1]=8 and h[5]=4. Width = 4, min(8, 4) = 4 → Area = 16 (new best!).',
        invariantCheck: 'Now h[5]=4 is the limiting wall, so discard R=5 next.',
        variables: [
          { name: 'L / R', value: '1 / 5' },
          { name: 'area', value: '4 × 4 = 16' },
          { name: 'best', value: '16' },
        ],
        array: [3, 8, 2, 5, 7, 4],
        pointers: [
          { label: 'L', index: 1, tone: 'sky' },
          { label: 'R', index: 5, tone: 'amber' },
        ],
        eliminatedIndices: [0],
        windowRange: [1, 5],
      },
      {
        step: 3,
        title: 'Advance shorter wall R → 4 (Optimal!)',
        explanation: 'h[1]=8 and h[4]=7. Width = 3, min(8, 7) = 7 → Area = 21! Huge jump despite narrower width.',
        invariantCheck: 'Both tall walls are now discovered without testing interior junk bars.',
        variables: [
          { name: 'L / R', value: '1 / 4' },
          { name: 'area', value: '3 × 7 = 21' },
          { name: 'best', value: '21' },
        ],
        array: [3, 8, 2, 5, 7, 4],
        pointers: [
          { label: 'L', index: 1, tone: 'emerald' },
          { label: 'R', index: 4, tone: 'emerald' },
        ],
        eliminatedIndices: [0, 5],
        matchedIndices: [1, 4],
        windowRange: [1, 4],
      },
      {
        step: 4,
        title: 'Advance R → 3 (h[3] = 5)',
        explanation: 'Width = 2, min(8, 5) = 5 → Area = 10 (< best 21). Advance shorter wall R again.',
        invariantCheck: 'Best remains 21.',
        variables: [
          { name: 'L / R', value: '1 / 3' },
          { name: 'area', value: '2 × 5 = 10' },
          { name: 'best', value: '21' },
        ],
        array: [3, 8, 2, 5, 7, 4],
        pointers: [
          { label: 'L', index: 1, tone: 'sky' },
          { label: 'R', index: 3, tone: 'amber' },
        ],
        eliminatedIndices: [0, 4, 5],
        windowRange: [1, 3],
      },
      {
        step: 5,
        title: 'Converge at L=1, R=2 → Done',
        explanation: 'Width = 1, min(8, 2) = 2 → Area = 2. Next step L == R terminates. Global optimum = 21 in O(N) steps.',
        invariantCheck: 'Each pointer only moved inward; 5 checks vs 15 brute-force pairs.',
        variables: [
          { name: 'L / R', value: '1 / 2' },
          { name: 'area', value: '1 × 2 = 2' },
          { name: 'final best', value: '21' },
        ],
        array: [3, 8, 2, 5, 7, 4],
        pointers: [
          { label: 'L', index: 1, tone: 'sky' },
          { label: 'R', index: 2, tone: 'amber' },
        ],
        eliminatedIndices: [0, 3, 4, 5],
        matchedIndices: [1, 4],
        windowRange: [1, 2],
      },
    ],
  },

  // 3. Sliding Window
  {
    id: 'sliding-window',
    name: 'Variable Sliding Window',
    shortName: 'Sliding Window',
    category: 'Array & String Patterns',
    visualType: 'sliding-window',
    tagline: 'Advance the right edge; move the left edge only when a proven rule restores the required window condition.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(min(N, |Σ|))',
    complexityLeap: 'O(N²) rescan every substring → O(N) amortized two-pointer slide',
    coreIdea:
      'Maintain a contiguous window [L .. R] and update a compact state (such as a running sum, character counts or last-seen indices). Advance R one step at a time. If the validity condition of the problem is monotonic under removing elements, move L forward until the condition is restored; some problems permit a direct jump. State updates are often O(1), while hash-map operations are expected O(1).',
    mentalModelSteps: [
      'Initialize left = 0 and a frequency map / last-seen index map.',
      'Expand right across indices 0 .. n - 1, adding s[right] into the window.',
      'While the window breaks the validity constraint, shrink from left (or jump left past the duplicate).',
      'Record the optimal window length (or shortest valid window) when the invariant holds.',
    ],
    loopInvariant:
      'After the adjustment at each right index, [left .. right] satisfies the problem-specific window invariant. For the longest-substring-without-repeating-characters example, that invariant is that every character in the current window is distinct.',
    whenToUse: [
      'Longest/shortest contiguous substring or subarray meeting a monotonic condition',
      'Fixed-size window max/average (with Deque or running sum)',
      'At most K distinct characters or minimum window covering target string t',
    ],
    whenItFails:
      'A sliding window is not a universal solution for arbitrary subarray constraints. It is unsuitable when the required condition cannot be maintained by moving boundaries monotonically—for example, target-sum counting with negative values. Fixed-size windows and other explicitly maintained window statistics can still work with negative values.',
    linkedTopics: ['Sliding Window'],
    linkedProblemSlugs: [
      'longest-substring-without-repeating',
      'minimum-window-substring',
      'sliding-window-maximum',
      'best-time-to-buy-and-sell-stock',
    ],
    featuredLabId: 'longest-substring',
    templates: {
      python: `def longest_unique_substring(s):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best`,
      js: `function longestUniqueSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r]) && last.get(s[r]) >= left) {
      left = last.get(s[r]) + 1;
    }
    last.set(s[r], r);
    best = Math.max(best, r - left + 1);
  }
  return best;
}`,
      java: `public int lengthOfLongestSubstring(String s) {
  Map<Character, Integer> last = new HashMap<>();
  int left = 0, best = 0;
  for (int r = 0; r < s.length(); r++) {
    char c = s.charAt(r);
    if (last.containsKey(c)) left = Math.max(left, last.get(c) + 1);
    last.put(c, r);
    best = Math.max(best, r - left + 1);
  }
  return best;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Expand R = 0..2 ("abc")',
        explanation: 'Characters a, b, c are all unique inside [0..2]. Current window length = 3.',
        invariantCheck: 'All chars in [0..2] have count 1.',
        variables: [
          { name: 'window', value: '"abc" [0..2]' },
          { name: 'length', value: '3' },
          { name: 'best', value: '3' },
        ],
        array: ['a', 'b', 'c', 'b', 'a', 'd', 'e'],
        pointers: [
          { label: 'L', index: 0, tone: 'sky' },
          { label: 'R', index: 2, tone: 'emerald' },
        ],
        windowRange: [0, 2],
        hashEntries: [
          { key: 'a', val: 'idx 0' },
          { key: 'b', val: 'idx 1' },
          { key: 'c', val: 'idx 2', active: true },
        ],
      },
      {
        step: 2,
        title: 'Collision at R = 3 ("b")!',
        explanation: "'b' was last seen at index 1 (>= L). Jump L immediately to 1 + 1 = 2 without backtracking R.",
        invariantCheck: 'Skipping index 0 and 1 restores uniqueness in O(1).',
        variables: [
          { name: 'duplicate', value: "'b' @ idx 1" },
          { name: 'jump L →', value: '2' },
          { name: 'window', value: '"cb" [2..3]' },
          { name: 'best', value: '3' },
        ],
        array: ['a', 'b', 'c', 'b', 'a', 'd', 'e'],
        pointers: [
          { label: 'L', index: 2, tone: 'amber' },
          { label: 'R', index: 3, tone: 'rose' },
        ],
        eliminatedIndices: [0, 1],
        windowRange: [2, 3],
        hashEntries: [
          { key: 'a', val: 'idx 0' },
          { key: 'b', val: 'idx 3', hit: true },
          { key: 'c', val: 'idx 2' },
        ],
      },
      {
        step: 3,
        title: 'Expand R = 4 ("a" is stale!)',
        explanation: "'a' exists in map at index 0, which is < L (2). Because it's outside the window, L does NOT move!",
        invariantCheck: 'Using Math.max(L, last[ch]+1) prevents L from ever moving backward.',
        variables: [
          { name: 'window', value: '"cba" [2..4]' },
          { name: 'length', value: '3' },
          { name: 'best', value: '3' },
        ],
        array: ['a', 'b', 'c', 'b', 'a', 'd', 'e'],
        pointers: [
          { label: 'L', index: 2, tone: 'sky' },
          { label: 'R', index: 4, tone: 'emerald' },
        ],
        eliminatedIndices: [0, 1],
        windowRange: [2, 4],
        hashEntries: [
          { key: 'a', val: 'idx 4', active: true },
          { key: 'b', val: 'idx 3' },
          { key: 'c', val: 'idx 2' },
        ],
      },
      {
        step: 4,
        title: 'Expand R = 5 ("d") → New Best = 4',
        explanation: "'d' is unseen. Window grows to \"cbad\" [2..5], length = 4.",
        invariantCheck: 'Window [2..5] remains 100% unique.',
        variables: [
          { name: 'window', value: '"cbad" [2..5]' },
          { name: 'length', value: '4' },
          { name: 'best', value: '4' },
        ],
        array: ['a', 'b', 'c', 'b', 'a', 'd', 'e'],
        pointers: [
          { label: 'L', index: 2, tone: 'sky' },
          { label: 'R', index: 5, tone: 'emerald' },
        ],
        eliminatedIndices: [0, 1],
        windowRange: [2, 5],
        hashEntries: [
          { key: 'a', val: 'idx 4' },
          { key: 'b', val: 'idx 3' },
          { key: 'c', val: 'idx 2' },
          { key: 'd', val: 'idx 5', active: true },
        ],
      },
      {
        step: 5,
        title: 'Expand R = 6 ("e") → Final Best = 5',
        explanation: 'Window reaches "cbade" [2..6] of length 5. Every character was visited once by R and at most once by L.',
        invariantCheck: 'Each element enters and leaves the window at most once, so total pointer movement is O(N) and the runtime is amortized O(N).',
        variables: [
          { name: 'window', value: '"cbade" [2..6]' },
          { name: 'final best', value: '5' },
        ],
        array: ['a', 'b', 'c', 'b', 'a', 'd', 'e'],
        pointers: [
          { label: 'L', index: 2, tone: 'emerald' },
          { label: 'R', index: 6, tone: 'emerald' },
        ],
        eliminatedIndices: [0, 1],
        matchedIndices: [2, 3, 4, 5, 6],
        windowRange: [2, 6],
        hashEntries: [
          { key: 'a', val: 'idx 4' },
          { key: 'b', val: 'idx 3' },
          { key: 'c', val: 'idx 2' },
          { key: 'd', val: 'idx 5' },
          { key: 'e', val: 'idx 6', active: true },
        ],
      },
    ],
  },

  // 4. Modified Binary Search
  {
    id: 'binary-search',
    name: 'Modified Binary Search',
    shortName: 'Binary Search',
    category: 'Searching & Sorting',
    visualType: 'binary-search',
    tagline: 'Halve sorted or monotonic search spaces in O(log N); rotated arrays need distinct values for the usual bound.',
    timeComplexity: 'O(log N) with distinct values; O(N) worst case with duplicates',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(N) linear scan → O(log N) when values distinguish the sorted half; duplicates can require linear shrinking',
    coreIdea:
      'For a rotated non-decreasing array with distinct values, at least one half around mid is sorted, so its range can guide the next search. With duplicates, equal boundary values can make the sorted half ambiguous; shrink a boundary safely when necessary, and note that the worst case can degrade to O(N).',
    mentalModelSteps: [
      'Maintain closed search range [L, R] and compute overflow-safe mid = L + (R - L) // 2.',
      'Check if nums[mid] == target first.',
      'For a rotated array with distinct values, one half is sorted: if nums[L] <= nums[mid], left [L..mid] is sorted; otherwise right [mid..R] is sorted. With duplicates, equal boundary values can make this test ambiguous; safely shrink equal boundaries, accepting an O(N) worst case.',
      'Check if target lies inside the sorted half bounds to discard the opposite 50% safely.',
    ],
    loopInvariant:
      'If target exists in the array, it is strictly contained inside the remaining bracket [L, R].',
    whenToUse: [
      'Sorted-array lookup in O(log N); rotated-array lookup in O(log N) with distinct values, and up to O(N) with duplicates',
      'Minimum feasible speed/capacity problems (Binary Search on Answer: Koko, Ship Packages)',
      'Finding first/last occurrence (lower_bound / upper_bound) or median partition',
    ],
    whenItFails:
      'Cannot be used without a monotonic predicate (False, False, ..., True, True) or sorted half structure.',
    linkedTopics: ['Modified Binary Search'],
    linkedProblemSlugs: [
      'search-in-rotated-sorted-array',
      'koko-eating-bananas',
      'median-of-two-sorted-arrays',
      'binary-search-classic',
    ],
    templates: {
      python: `def search_rotated(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = l + (r - l) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:
            if nums[l] <= target < nums[m]:
                r = m - 1
            else:
                l = m + 1
        else:
            if nums[m] < target <= nums[r]:
                l = m + 1
            else:
                r = m - 1
    return -1`,
      js: `function searchRotated(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = l + ((r - l) >> 1);
    if (nums[m] === target) return m;
    if (nums[l] <= nums[m]) {
      if (nums[l] <= target && target < nums[m]) r = m - 1;
      else l = m + 1;
    } else {
      if (nums[m] < target && target <= nums[r]) l = m + 1;
      else r = m - 1;
    }
  }
  return -1;
}`,
      java: `public int searchRotated(int[] nums, int target) {
  int l = 0, r = nums.length - 1;
  while (l <= r) {
    int m = l + (r - l) / 2;
    if (nums[m] == target) return m;
    if (nums[l] <= nums[m]) {
      if (nums[l] <= target && target < nums[m]) r = m - 1;
      else l = m + 1;
    } else {
      if (nums[m] < target && target <= nums[r]) l = m + 1;
      else r = m - 1;
    }
  }
  return -1;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Initial bracket [0..6], target = 4',
        explanation: 'Search for target = 4 in rotated array [6, 7, 1, 2, 3, 4, 5]. The initial midpoint is index 3, where nums[3] = 2, so the target is not found yet.',
        invariantCheck: 'Searching target = 4 in [6, 7, 1, 2, 3, 4, 5]. Full range [0..6] active.',
        variables: [
          { name: 'target', value: '4' },
          { name: 'L / Mid / R', value: '0 / 3 / 6' },
          { name: 'nums[Mid]', value: '2' },
        ],
        array: [6, 7, 1, 2, 3, 4, 5],
        pointers: [
          { label: 'L', index: 0, tone: 'sky' },
          { label: 'M', index: 3, tone: 'amber' },
          { label: 'R', index: 6, tone: 'sky' },
        ],
        highlightIndices: [3, 4, 5, 6],
      },
      {
        step: 2,
        title: 'Right half [3..6] is sorted → Discard left!',
        explanation: 'nums[0]=6 > nums[3]=2, so right side [2, 3, 4, 5] is strictly sorted. Since 2 < 4 <= 5, move L = mid + 1 = 4.',
        invariantCheck: '4 elements [0..3] eliminated in a single comparison.',
        variables: [
          { name: 'target', value: '4' },
          { name: 'L / Mid / R', value: '4 / 5 / 6' },
          { name: 'nums[Mid]', value: '4 (MATCH!)' },
        ],
        array: [6, 7, 1, 2, 3, 4, 5],
        pointers: [
          { label: 'L', index: 4, tone: 'sky' },
          { label: 'M', index: 5, tone: 'emerald' },
          { label: 'R', index: 6, tone: 'sky' },
        ],
        eliminatedIndices: [0, 1, 2, 3],
        matchedIndices: [5],
      },
      {
        step: 3,
        title: 'Found target 4 at index 5 in 2 steps',
        explanation: 'nums[5] == 4! Return index 5. Even with 1,000,000 elements, halving finishes in <= 20 steps.',
        invariantCheck: 'O(log N) time, O(1) space.',
        variables: [
          { name: 'result', value: 'index 5' },
          { name: 'comparisons', value: '2' },
        ],
        array: [6, 7, 1, 2, 3, 4, 5],
        pointers: [{ label: 'HIT', index: 5, tone: 'emerald' }],
        eliminatedIndices: [0, 1, 2, 3, 4, 6],
        matchedIndices: [5],
      },
    ],
  },

  // 5. Fast & Slow Pointers (Floyd Cycle Detection)
  {
    id: 'fast-slow-pointers',
    name: 'Fast & Slow Pointers (Floyd)',
    shortName: 'Fast & Slow',
    category: 'Array & String Patterns',
    visualType: 'fast-slow',
    tagline: 'Detect linked-list cycles, find midpoints, and locate loop entry in O(1) space.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(N) HashSet memory → O(1) two-speed pointer collision',
    coreIdea:
      'Move slow by 1 hop and fast by 2 hops. In an acyclic list, fast reaches null cleanly. Inside a cycle of length C, the distance between fast and slow closes by 1 every step—guaranteeing collision without ever jumping over each other.',
    mentalModelSteps: [
      'Initialize slow = head and fast = head.',
      'Loop while fast != null && fast.next != null.',
      'Advance slow = slow.next and fast = fast.next.next.',
      'If slow === fast, a cycle exists. (To find cycle entry: reset one pointer to head and step both by 1.)',
    ],
    loopInvariant:
      'Once both pointers enter the cycle, their separation modulo cycle length decreases by exactly 1 each iteration.',
    whenToUse: [
      'Linked List Cycle detection (LC 141) and cycle entry point (LC 142)',
      'Finding exact middle of a linked list in one pass',
      'Happy Number / Duplicate Number implicit state-machine cycles',
    ],
    whenItFails:
      'Remember to compare node object references, never node.val (duplicate values exist in acyclic lists).',
    linkedTopics: ['Linked Lists'],
    linkedProblemSlugs: ['linked-list-cycle', 'reverse-linked-list', 'lru-cache', 'merge-k-sorted-lists'],
    templates: {
      python: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
      js: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
      java: `public boolean hasCycle(ListNode head) {
  ListNode slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
  }
  return false;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Start: Slow & Fast at Head (10)',
        explanation: 'List has 5 nodes with tail 50 looping back to node 20. Both S and F begin at node 10.',
        invariantCheck: 'Zero extra HashSet memory allocated.',
        variables: [
          { name: 'Slow (S)', value: 'Node 10' },
          { name: 'Fast (F)', value: 'Node 10' },
          { name: 'status', value: 'Running' },
        ],
        activeNodes: ['10'],
        nodeBadges: { '10': 'S, F' },
      },
      {
        step: 2,
        title: 'Tick 1: S → 20 (+1), F → 30 (+2)',
        explanation: 'Slow enters the cycle at 20 while Fast leaps ahead to 30.',
        invariantCheck: 'Fast moves 2× speed of Slow.',
        variables: [
          { name: 'Slow (S)', value: 'Node 20' },
          { name: 'Fast (F)', value: 'Node 30' },
          { name: 'gap in loop', value: '3 hops behind' },
        ],
        activeNodes: ['20', '30'],
        visitedNodes: ['10'],
        activeEdges: ['10->20', '20->30'],
        nodeBadges: { '20': 'S', '30': 'F' },
      },
      {
        step: 3,
        title: 'Tick 2: S → 30, F → 50',
        explanation: 'Slow steps to 30. Fast jumps 30 → 40 → 50. Relative distance closes by 1.',
        invariantCheck: 'Gap shrinks strictly: 3 → 2 hops.',
        variables: [
          { name: 'Slow (S)', value: 'Node 30' },
          { name: 'Fast (F)', value: 'Node 50' },
          { name: 'gap in loop', value: '2 hops behind' },
        ],
        activeNodes: ['30', '50'],
        visitedNodes: ['10', '20'],
        activeEdges: ['20->30', '30->40', '40->50'],
        nodeBadges: { '30': 'S', '50': 'F' },
      },
      {
        step: 4,
        title: 'Tick 3: S → 40, F wraps 50 → 20 → 30',
        explanation: 'Fast follows the back-edge 50 → 20 and lands on 30, now just 1 step behind Slow (40)!',
        invariantCheck: 'Gap shrinks strictly: 2 → 1 hop.',
        variables: [
          { name: 'Slow (S)', value: 'Node 40' },
          { name: 'Fast (F)', value: 'Node 30' },
          { name: 'gap in loop', value: '1 hop behind' },
        ],
        activeNodes: ['40', '30'],
        visitedNodes: ['10', '20', '50'],
        activeEdges: ['50->20', '20->30', '30->40'],
        nodeBadges: { '40': 'S', '30': 'F' },
      },
      {
        step: 5,
        title: 'Tick 4: COLLISION at Node 50!',
        explanation: 'Slow steps 40 → 50 and Fast leaps 30 → 40 → 50. Slow === Fast proves a cycle exists in O(1) space!',
        invariantCheck: 'In a finite cycle, the two pointers eventually meet; the exact bound depends on the cycle length and the distance from the entry.',
        variables: [
          { name: 'Slow (S)', value: 'Node 50' },
          { name: 'Fast (F)', value: 'Node 50' },
          { name: 'verdict', value: 'CYCLE DETECTED' },
        ],
        activeNodes: ['50'],
        visitedNodes: ['10', '20', '30', '40', '50'],
        activeEdges: ['40->50', '30->40'],
        nodeBadges: { '50': 'HIT (S=F)' },
      },
    ],
  },

  // 6. Monotonic Stack
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    shortName: 'Monotonic Stack',
    category: 'Array & String Patterns',
    visualType: 'monotonic-stack',
    tagline: 'Resolve Next Greater / Smaller Element boundaries in a single O(N) pass.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) look-ahead scans → O(N) push/pop once per index',
    coreIdea:
      'Keep indices in a stack whose referenced values follow a monotonic order (for this next-strictly-greater pattern, non-increasing from bottom to top). When a new value is strictly larger than the top value, it is the first strictly greater value to the right for that popped index: no earlier index between them could have resolved it, because the stack preserves unresolved candidates.',
    mentalModelSteps: [
      'Store INDICES (not just values) on the stack so you can compute index distances i - prevIdx.',
      'For each day i, while stack is non-empty and arr[i] > arr[stack.top()], pop prevIdx.',
      'Record answer[prevIdx] = i - prevIdx (resolved!).',
      'Push i onto the stack as unresolved until a future warmer day arrives.',
    ],
    loopInvariant:
      'Temperatures referenced by stack indices are non-increasing from bottom to top; equal temperatures may remain together because this example resolves only strictly warmer days.',
    whenToUse: [
      'Next Greater / Next Smaller Element (Daily Temperatures)',
      'Largest Rectangle in Histogram (nearest smaller bar on both left & right)',
      'Stock Span, Online Stock Span, Sum of Subarray Minimums',
    ],
    whenItFails:
      'For a fixed-width sliding-window maximum, use a monotonic deque: it supports removing expired indices from the front while maintaining candidate maxima at the back. A stack alone cannot efficiently expire candidates by index.',
    linkedTopics: ['Monotonic Stack'],
    linkedProblemSlugs: ['daily-temperatures', 'largest-rectangle-in-histogram', 'valid-parentheses', 'min-stack'],
    featuredLabId: 'daily-temperatures',
    templates: {
      python: `def daily_temperatures(temps):
    ans = [0] * len(temps)
    stack = []  # monotonic decreasing indices
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            prev = stack.pop()
            ans[prev] = i - prev
        stack.append(i)
    return ans`,
      js: `function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const prev = stack.pop();
      ans[prev] = i - prev;
    }
    stack.push(i);
  }
  return ans;
}`,
      java: `public int[] dailyTemperatures(int[] temps) {
  int[] ans = new int[temps.length];
  Deque<Integer> st = new ArrayDeque<>();
  for (int i = 0; i < temps.length; i++) {
    while (!st.isEmpty() && temps[st.peek()] < temps[i]) {
      int prev = st.pop();
      ans[prev] = i - prev;
    }
    st.push(i);
  }
  return ans;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Day 0 (73°) → Push onto empty stack',
        explanation: 'No waiting colder days yet. Push index 0 (73°) onto the stack.',
        invariantCheck: 'Stack values: [73].',
        variables: [
          { name: 'day i', value: '0 (73°)' },
          { name: 'popped', value: 'none' },
        ],
        array: [73, 74, 75, 71, 69, 72, 76],
        secondaryArray: [0, 0, 0, 0, 0, 0, 0],
        pointers: [{ label: 'i', index: 0, tone: 'sky' }],
        highlightIndices: [0],
        stackItems: [{ label: 'idx 0', sub: '73°', active: true }],
      },
      {
        step: 2,
        title: 'Day 1 (74°) > 73° → Pop & Resolve Day 0!',
        explanation: '74° > 73°! Pop index 0 → ans[0] = 1 - 0 = 1 day wait. Push index 1 (74°).',
        invariantCheck: 'Index 0 entered and exited stack once.',
        variables: [
          { name: 'day i', value: '1 (74°)' },
          { name: 'resolved', value: 'ans[0] = 1' },
        ],
        array: [73, 74, 75, 71, 69, 72, 76],
        secondaryArray: [1, 0, 0, 0, 0, 0, 0],
        pointers: [{ label: 'i', index: 1, tone: 'emerald' }],
        matchedIndices: [0],
        highlightIndices: [1],
        stackItems: [{ label: 'idx 1', sub: '74°', active: true }],
      },
      {
        step: 3,
        title: 'Day 2 (75°) pops 74°; Days 3–4 (71°, 69°) cool down',
        explanation: '75° resolves Day 1 (ans[1]=1). Days 3 (71°) and 4 (69°) are cooler, so they stack up cleanly in decreasing order.',
        invariantCheck: 'Stack holds strictly decreasing temps: 75° → 71° → 69°.',
        variables: [
          { name: 'day i', value: '4 (69°)' },
          { name: 'stack size', value: '3' },
        ],
        array: [73, 74, 75, 71, 69, 72, 76],
        secondaryArray: [1, 1, 0, 0, 0, 0, 0],
        pointers: [{ label: 'i', index: 4, tone: 'sky' }],
        matchedIndices: [0, 1],
        highlightIndices: [2, 3, 4],
        stackItems: [
          { label: 'idx 2', sub: '75°' },
          { label: 'idx 3', sub: '71°' },
          { label: 'idx 4', sub: '69°', active: true },
        ],
      },
      {
        step: 4,
        title: 'Day 5 (72°) pops 69° AND 71°!',
        explanation: '72° beats 69° (ans[4]=1) and 71° (ans[3]=2), stopping at 75° because 75° >= 72°.',
        invariantCheck: 'Stack stays monotonic: 75° → 72°.',
        variables: [
          { name: 'day i', value: '5 (72°)' },
          { name: 'resolved', value: 'ans[4]=1, ans[3]=2' },
        ],
        array: [73, 74, 75, 71, 69, 72, 76],
        secondaryArray: [1, 1, 0, 2, 1, 0, 0],
        pointers: [{ label: 'i', index: 5, tone: 'emerald' }],
        matchedIndices: [0, 1, 3, 4],
        highlightIndices: [5],
        stackItems: [
          { label: 'idx 2', sub: '75°' },
          { label: 'idx 5', sub: '72°', active: true },
        ],
      },
      {
        step: 5,
        title: 'Day 6 (76°) sweeps remaining stack → Done!',
        explanation: '76° resolves Day 5 (ans[5]=1) and Day 2 (ans[2]=4). Every element pushed once and popped at most once → O(N).',
        invariantCheck: 'Total pushes + pops <= 2N.',
        variables: [
          { name: 'day i', value: '6 (76°)' },
          { name: 'ans[]', value: '[1,1,4,2,1,1,0]' },
        ],
        array: [73, 74, 75, 71, 69, 72, 76],
        secondaryArray: [1, 1, 4, 2, 1, 1, 0],
        pointers: [{ label: 'i', index: 6, tone: 'emerald' }],
        matchedIndices: [0, 1, 2, 3, 4, 5],
        stackItems: [{ label: 'idx 6', sub: '76°', active: true }],
      },
    ],
  },

  // 7. Tree BFS & DFS Traversal
  {
    id: 'tree-bfs-dfs',
    name: 'Breadth-First Search (BFS)',
    shortName: 'BFS (Queue)',
    category: 'Tree & Graph Traversal',
    visualType: 'tree-traversal',
    tagline: 'Master wave-sized BFS level queues and bottom-up postorder subtree returns.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H) DFS / O(W) BFS',
    complexityLeap: 'O(N²) repeated subtree height calls → O(N) single traversal',
    coreIdea:
      'Use level-order BFS (process a snapshot of the queue size) for depth grouping and shortest paths in an unweighted tree. Use postorder DFS (compute child results, then combine at the parent) for subtree heights, sums, and many diameter or path problems. Lowest common ancestor has its own traversal and return logic; choose the variant that matches the tree type and problem.',
    mentalModelSteps: [
      'BFS: Enqueue the root. At each level, save levelSize = q.length and process exactly that many nodes; children added during the level belong to the next wave.',
      'Push each popped node’s non-null left and right children for the next depth wave.',
      'DFS Postorder: Separate what a recursive call RETURNS to its parent (single branch) from the GLOBAL best updated at the node (curved path).',
    ],
    loopInvariant:
      'At the start of every BFS while-iteration, the queue contains ALL nodes of exactly one depth level.',
    whenToUse: [
      'Level Order, Zigzag, Right Side View, Minimum Depth → BFS Queue',
      'Diameter, Maximum Path Sum, Balanced Check, LCA → Postorder DFS',
      'BST sorted validation / kth smallest → Inorder DFS',
    ],
    whenItFails:
      'BFS can require O(W) queue space, where W is the maximum level width; DFS uses O(H) call-stack space for a recursive traversal, where H is tree height and can be O(N) for a skewed tree. Choose based on tree shape and memory constraints.',
    linkedTopics: ['Trees DFS/BFS'],
    linkedProblemSlugs: [
      'binary-tree-level-order',
      'diameter-of-binary-tree',
      'lowest-common-ancestor',
      'binary-tree-maximum-path-sum',
    ],
    templates: {
      python: `from collections import deque

def level_order(root):
    if not root:
        return []
    q, levels = deque([root]), []
    while q:
        wave = []
        for _ in range(len(q)):
            node = q.popleft()
            wave.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        levels.append(wave)
    return levels`,
      js: `function levelOrder(root) {
  if (!root) return [];
  const levels = [];
  let q = [root];
  while (q.length) {
    const wave = [], next = [];
    for (const node of q) {
      wave.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    levels.push(wave);
    q = next;
  }
  return levels;
}`,
      java: `public List<List<Integer>> levelOrder(TreeNode root) {
  List<List<Integer>> res = new ArrayList<>();
  if (root == null) return res;
  Deque<TreeNode> q = new ArrayDeque<>();
  q.offer(root);
  while (!q.isEmpty()) {
    int sz = q.size();
    List<Integer> wave = new ArrayList<>();
    for (int i = 0; i < sz; i++) {
      TreeNode cur = q.poll();
      wave.add(cur.val);
      if (cur.left != null) q.offer(cur.left);
      if (cur.right != null) q.offer(cur.right);
    }
    res.add(wave);
  }
  return res;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Depth 0 Wave: Seed queue with Root (8)',
        explanation: 'Snapshot wave size = 1. Pop 8 and enqueue its children (4, 12).',
        invariantCheck: 'Queue holds Depth 0 exclusively.',
        variables: [
          { name: 'depth', value: '0' },
          { name: 'wave size', value: '1' },
        ],
        activeNodes: ['8'],
        visitedNodes: ['8'],
        activeEdges: ['8->4', '8->12'],
        queueItems: ['4', '12'],
        outputSeq: ['[8]'],
      },
      {
        step: 2,
        title: 'Depth 1 Wave: Pop 4, enqueue leaves (2, 6)',
        explanation: 'Wave size = 2. First pop 4, append to Depth 1 list, and push children 2 and 6 to back of queue.',
        invariantCheck: 'Loop stops after 2 pops so Depth 2 children wait cleanly.',
        variables: [
          { name: 'depth', value: '1' },
          { name: 'processing', value: 'Node 4 (1 of 2)' },
        ],
        activeNodes: ['4'],
        visitedNodes: ['8', '4'],
        activeEdges: ['4->2', '4->6'],
        queueItems: ['12', '2', '6'],
        outputSeq: ['[8]', '[4, ...]'],
      },
      {
        step: 3,
        title: 'Depth 1 Wave: Pop 12, enqueue (10, 15)',
        explanation: 'Finish Depth 1 by popping 12 and pushing 10 and 15. Depth 1 closes as [4, 12].',
        invariantCheck: 'Queue now holds all 4 nodes of Depth 2.',
        variables: [
          { name: 'depth', value: '1 complete' },
          { name: 'next wave', value: '4 nodes' },
        ],
        activeNodes: ['12'],
        visitedNodes: ['8', '4', '12'],
        activeEdges: ['12->10', '12->15'],
        queueItems: ['2', '6', '10', '15'],
        outputSeq: ['[8]', '[4, 12]'],
      },
      {
        step: 4,
        title: 'Depth 2 Wave: Drain leaves [2, 6, 10, 15]',
        explanation: 'Pop all 4 leaf nodes (no children to enqueue). Queue becomes empty and traversal completes in O(N).',
        invariantCheck: 'Every tree node enqueued and dequeued exactly once.',
        variables: [
          { name: 'depth', value: '2 complete' },
          { name: 'total visited', value: '7 / 7' },
        ],
        activeNodes: ['2', '6', '10', '15'],
        visitedNodes: ['8', '4', '12', '2', '6', '10', '15'],
        queueItems: [],
        outputSeq: ['[8]', '[4, 12]', '[2, 6, 10, 15]'],
      },
    ],
  },

  // 8. Heaps & Interval Sweep
  {
    id: 'heap-intervals',
    name: 'Min-Heap & Interval Scheduling',
    shortName: 'Heaps & Intervals',
    category: 'Searching & Sorting',
    visualType: 'heap-intervals',
    tagline: 'Sort intervals by start time and track earliest-ending resources with a Min-Heap.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) room scan per meeting → O(log N) earliest-free lookup',
    coreIdea:
      'Sort meetings chronologically by start time. Keep active rooms’ end times in a Min-Heap so the root ALWAYS tells you the earliest room to free up. If earliestEnd <= nextStart, pop and reuse that room; otherwise allocate a new room.',
    mentalModelSteps: [
      'Sort all intervals ascending by start time.',
      'Maintain a Min-Heap storing the end time of every currently occupied conference room.',
      'For each meeting [s, e]: if heap.peek() <= s, pop the freed room.',
      'Push e into the Min-Heap. The heap size tracks active concurrent rooms.',
    ],
    loopInvariant:
      'Min-Heap root always equals the minimum end time among all currently busy conference rooms.',
    whenToUse: [
      'Meeting Rooms II, CPU Task Scheduling, Merge Intervals',
      'Top-K Frequent / Kth Largest in Stream (size-K Min-Heap)',
      'Streaming Median (Dual Max-Heap + Min-Heap)',
    ],
    whenItFails:
      'If you only need to count max non-overlapping intervals to KEEP (not rooms needed), sort by END time greedily without a heap.',
    linkedTopics: ['Heaps & Intervals'],
    linkedProblemSlugs: ['meeting-rooms-ii', 'merge-intervals', 'kth-largest-in-stream', 'find-median-from-data-stream'],
    templates: {
      python: `import heapq

def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])
    ends = []
    for start, end in intervals:
        if ends and ends[0] <= start:
            heapq.heappop(ends)
        heapq.heappush(ends, end)
    return len(ends)`,
      js: `function minMeetingRooms(intervals) {
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] < ends[e]) rooms++;
    else e++;
  }
  return rooms;
}`,
      java: `public int minMeetingRooms(int[][] intervals) {
  Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
  PriorityQueue<Integer> minHeap = new PriorityQueue<>();
  for (int[] m : intervals) {
    if (!minHeap.isEmpty() && minHeap.peek() <= m[0]) minHeap.poll();
    minHeap.offer(m[1]);
  }
  return minHeap.size();
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Meeting A [1, 5] → Allocate Room 1',
        explanation: 'Intervals sorted by start: [1,5], [2,8], [6,10], [9,12]. Heap empty → push end=5.',
        invariantCheck: 'Active rooms = 1 (earliest free at t=5).',
        variables: [
          { name: 'meeting', value: '[1, 5]' },
          { name: 'heap top', value: '5' },
          { name: 'rooms', value: '1' },
        ],
        intervals: [
          { id: 'A [1,5]', start: 1, end: 5, status: 'active', room: 1 },
          { id: 'B [2,8]', start: 2, end: 8, status: 'pending' },
          { id: 'C [6,10]', start: 6, end: 10, status: 'pending' },
          { id: 'D [9,12]', start: 9, end: 12, status: 'pending' },
        ],
        stackItems: [{ label: 'end = 5', sub: 'Room 1', active: true }],
      },
      {
        step: 2,
        title: 'Meeting B [2, 8] overlaps! → Allocate Room 2',
        explanation: 'Start 2 < heap.peek() (5), so Room 1 is still busy. Push end=8 into Min-Heap → 2 concurrent rooms.',
        invariantCheck: 'Min-Heap keeps 5 on top so we check the earliest-finishing room first.',
        variables: [
          { name: 'meeting', value: '[2, 8]' },
          { name: '2 < 5?', value: 'Overlap → New Room' },
          { name: 'rooms', value: '2' },
        ],
        intervals: [
          { id: 'A [1,5]', start: 1, end: 5, status: 'selected', room: 1 },
          { id: 'B [2,8]', start: 2, end: 8, status: 'active', room: 2 },
          { id: 'C [6,10]', start: 6, end: 10, status: 'pending' },
          { id: 'D [9,12]', start: 9, end: 12, status: 'pending' },
        ],
        stackItems: [
          { label: 'end = 5', sub: 'Room 1 (min)' },
          { label: 'end = 8', sub: 'Room 2', active: true },
        ],
      },
      {
        step: 3,
        title: 'Meeting C [6, 10] → Reuse Room 1!',
        explanation: 'Start 6 >= heap.peek() (5)! Pop 5 (Room 1 is free) and push end=10. Still only 2 rooms needed.',
        invariantCheck: 'Heap now has [8, 10] with 8 as new earliest free time.',
        variables: [
          { name: 'meeting', value: '[6, 10]' },
          { name: '6 >= 5?', value: 'Pop 5 & Reuse R1' },
          { name: 'rooms', value: '2' },
        ],
        intervals: [
          { id: 'A [1,5]', start: 1, end: 5, status: 'selected', room: 1 },
          { id: 'B [2,8]', start: 2, end: 8, status: 'selected', room: 2 },
          { id: 'C [6,10]', start: 6, end: 10, status: 'reused', room: 1 },
          { id: 'D [9,12]', start: 9, end: 12, status: 'pending' },
        ],
        stackItems: [
          { label: 'end = 8', sub: 'Room 2 (min)' },
          { label: 'end = 10', sub: 'Room 1', active: true },
        ],
      },
      {
        step: 4,
        title: 'Meeting D [9, 12] → Reuse Room 2! Final = 2 Rooms',
        explanation: 'Start 9 >= heap.peek() (8)! Pop 8 and push 12. All 4 meetings hosted in just 2 conference rooms.',
        invariantCheck: 'Final heap size = 2 = minimum rooms required.',
        variables: [
          { name: 'meeting', value: '[9, 12]' },
          { name: '9 >= 8?', value: 'Pop 8 & Reuse R2' },
          { name: 'min rooms', value: '2' },
        ],
        intervals: [
          { id: 'A [1,5]', start: 1, end: 5, status: 'selected', room: 1 },
          { id: 'B [2,8]', start: 2, end: 8, status: 'selected', room: 2 },
          { id: 'C [6,10]', start: 6, end: 10, status: 'reused', room: 1 },
          { id: 'D [9,12]', start: 9, end: 12, status: 'reused', room: 2 },
        ],
        stackItems: [
          { label: 'end = 10', sub: 'Room 1 (min)' },
          { label: 'end = 12', sub: 'Room 2', active: true },
        ],
      },
    ],
  },

  // 9. Graph BFS & Topological Sort (Kahn's Algorithm)
  {
    id: 'graph-topo-sort',
    name: 'Topological Sort (Kahn’s BFS)',
    shortName: 'Topo Sort & BFS',
    category: 'Tree & Graph Traversal',
    visualType: 'graph-topo',
    tagline: 'Resolve directed dependencies and detect cycles by peeling zero-indegree vertices.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    complexityLeap: 'Repeated dependency scans O(V²) → O(V + E) indegree queue peel',
    coreIdea:
      'Count incoming prerequisites (indegree) for every vertex. Push all vertices with indegree == 0 into a BFS queue. Pop a ready vertex, append it to the schedule, decrement neighbors’ indegrees, and enqueue any neighbor hitting 0.',
    mentalModelSteps: [
      'Build adjacency list prereq → [dependent courses] and indegree[v] array.',
      'Seed BFS queue with every vertex having indegree == 0 (no unmet dependencies).',
      'Pop u, append u to order, and decrement indegree[v] for each outgoing edge u → v.',
      'If order.length < V at termination, a directed cycle blocked the remaining nodes!',
    ],
    loopInvariant:
      'Every node placed in the BFS queue has had 100% of its prerequisite vertices already emitted.',
    whenToUse: [
      'Course Schedule I / II, Build Systems, Task Dependency Ordering',
      'Alien Dictionary character ordering from sorted words',
      'Cycle detection in directed graphs (DAG verification)',
    ],
    whenItFails:
      'Only applies to Directed Graphs. For undirected connectivity or dynamic edge grouping, use BFS/DFS or Union-Find.',
    linkedTopics: ['Graphs & Topo Sort'],
    linkedProblemSlugs: ['course-schedule-ii', 'number-of-islands', 'word-ladder', 'flood-fill'],
    templates: {
      python: `from collections import deque

def topo_sort(n, prereqs):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for course, pre in prereqs:
        adj[pre].append(course)
        indeg[course] += 1
    q = deque([i for i in range(n) if indeg[i] == 0])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []`,
      js: `function topoSort(n, prereqs) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [c, p] of prereqs) { adj[p].push(c); indeg[c]++; }
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const order = [];
  let head = 0;
  while (head < q.length) {
    const u = q[head++]; // O(1) dequeue; avoid Array.shift() reindexing
    order.push(u);
    for (const v of adj[u]) {
      if (--indeg[v] === 0) q.push(v);
    }
  }
  return order.length === n ? order : [];
}`,
      java: `public int[] findOrder(int n, int[][] prereqs) {
  List<List<Integer>> adj = new ArrayList<>();
  for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
  int[] indeg = new int[n];
  for (int[] e : prereqs) { adj.get(e[1]).add(e[0]); indeg[e[0]]++; }
  Deque<Integer> q = new ArrayDeque<>();
  for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
  int[] order = new int[n]; int idx = 0;
  while (!q.isEmpty()) {
    int u = q.poll(); order[idx++] = u;
    for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
  }
  return idx == n ? order : new int[0];
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Compute Indegrees & Seed Queue with Zero-Indegree Nodes',
        explanation: 'Courses 0 and 1 have 0 prerequisites (indegree = 0), so both enter the ready queue immediately.',
        invariantCheck: 'C2 waits for C0; C3 waits for C0 & C1; C4 waits for C2 & C3.',
        variables: [
          { name: 'ready queue', value: '[C0, C1]' },
          { name: 'emitted', value: '0 / 5' },
        ],
        activeNodes: ['C0', 'C1'],
        nodeBadges: { C0: 'in:0', C1: 'in:0', C2: 'in:1', C3: 'in:2', C4: 'in:2' },
        queueItems: ['C0', 'C1'],
        outputSeq: [],
      },
      {
        step: 2,
        title: 'Pop C0 → Unlock C2 (indegree 1 → 0)',
        explanation: 'Completing C0 removes edges C0→C2 and C0→C3. C2 drops to indegree 0 and enters the queue; C3 drops 2→1.',
        invariantCheck: 'C3 still waits for C1 before becoming ready.',
        variables: [
          { name: 'popped', value: 'C0' },
          { name: 'unlocked', value: 'C2' },
        ],
        activeNodes: ['C0', 'C2'],
        visitedNodes: ['C0'],
        activeEdges: ['C0->C2', 'C0->C3'],
        nodeBadges: { C0: 'done', C1: 'in:0', C2: 'in:0', C3: 'in:1', C4: 'in:2' },
        queueItems: ['C1', 'C2'],
        outputSeq: ['C0'],
      },
      {
        step: 3,
        title: 'Pop C1 → Unlock C3 (indegree 1 → 0)',
        explanation: 'Completing C1 peels edge C1→C3, dropping C3 to indegree 0 so C3 joins the queue.',
        invariantCheck: 'All prerequisites of C3 (C0, C1) are now done.',
        variables: [
          { name: 'popped', value: 'C1' },
          { name: 'unlocked', value: 'C3' },
        ],
        activeNodes: ['C1', 'C3'],
        visitedNodes: ['C0', 'C1'],
        activeEdges: ['C1->C3'],
        nodeBadges: { C0: 'done', C1: 'done', C2: 'in:0', C3: 'in:0', C4: 'in:2' },
        queueItems: ['C2', 'C3'],
        outputSeq: ['C0', 'C1'],
      },
      {
        step: 4,
        title: 'Pop C2 & C3 → Unlock Capstone C4',
        explanation: 'Both dependencies of C4 finish (indegree 2 → 1 → 0). C4 enters the queue as the final course.',
        invariantCheck: 'Zero cycles detected so far.',
        variables: [
          { name: 'popped', value: 'C2, C3' },
          { name: 'unlocked', value: 'C4' },
        ],
        activeNodes: ['C2', 'C3', 'C4'],
        visitedNodes: ['C0', 'C1', 'C2', 'C3'],
        activeEdges: ['C2->C4', 'C3->C4'],
        nodeBadges: { C0: 'done', C1: 'done', C2: 'done', C3: 'done', C4: 'in:0' },
        queueItems: ['C4'],
        outputSeq: ['C0', 'C1', 'C2', 'C3'],
      },
      {
        step: 5,
        title: 'Pop C4 → Valid Topological Order Complete!',
        explanation: 'All 5/5 courses emitted: [C0, C1, C2, C3, C4]. Every edge points strictly forward in the sequence.',
        invariantCheck: 'len(order) == V confirms the graph is a valid DAG.',
        variables: [
          { name: 'emitted', value: '5 / 5 (Valid DAG)' },
        ],
        activeNodes: ['C4'],
        visitedNodes: ['C0', 'C1', 'C2', 'C3', 'C4'],
        nodeBadges: { C0: 'done', C1: 'done', C2: 'done', C3: 'done', C4: 'done' },
        queueItems: [],
        outputSeq: ['C0', 'C1', 'C2', 'C3', 'C4'],
      },
    ],
  },

  // 10. Dijkstra & Union-Find (Shortest Path)
  {
    id: 'dijkstra-shortest-path',
    name: 'Dijkstra’s Algorithm',
    shortName: 'Dijkstra’s Algo',
    category: 'Tree & Graph Traversal',
    visualType: 'dijkstra-graph',
    tagline: 'Greedily settle the closest unvisited vertex via Min-Heap edge relaxation.',
    timeComplexity: 'O(V + E log(E + 1)) with a binary min-heap and lazy duplicate entries',
    spaceComplexity: 'O(V + E)',
    complexityLeap: 'O(V²) dense scan → O(V + E log(E + 1)) heap-based relaxation',
    coreIdea:
      'Maintain a min-heap of (distance, node) entries, starting with (0, source). With non-negative edge weights, a node popped with a distance equal to its current best distance is settled: no later path can improve it. Lazy heaps may contain older entries, so skip a popped entry when its distance is greater than dist[node].',
    mentalModelSteps: [
      'Initialize dist[source] = 0 and all other dist[v] = ∞; push (0, source) to Min-Heap.',
      'Pop the smallest (d, u). If d > dist[u], skip it (stale heap entry).',
      'For every neighbor (v, weight): if d + weight < dist[v], update dist[v] and push (d + weight, v).',
      'Repeat until heap empties; every reachable node holds its exact minimum cost.',
    ],
    loopInvariant:
      'With non-negative weights, no future path through an unvisited node can ever decrease an already popped minimum distance.',
    whenToUse: [
      'Shortest path in non-negative weighted graphs (Network Delay Time)',
      'Minimax path problems (Swim in Rising Water, Path With Minimum Effort)',
      'Pair with Disjoint Set Union (Union-Find) for MST / dynamic grouping (Accounts Merge)',
    ],
    whenItFails:
      'Dijkstra requires non-negative edge weights. For graphs with negative edges (and no reachable negative cycle), use Bellman-Ford; for a bounded number of edges or stops, use a state-aware dynamic-programming or layered shortest-path formulation. The examples assume path-distance sums fit the chosen numeric type.',
    linkedTopics: ['Union-Find & Shortest Path'],
    linkedProblemSlugs: ['network-delay-time', 'swim-in-rising-water', 'accounts-merge', 'find-if-path-exists'],
    templates: {
      python: `import heapq

def dijkstra(graph, src):
    dist = {src: 0}
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist`,
      js: `function dijkstra(adj, src, n) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const heap = [];
  const push = item => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const min = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let smallest = i;
        if (l < heap.length && heap[l][0] < heap[smallest][0]) smallest = l;
        if (r < heap.length && heap[r][0] < heap[smallest][0]) smallest = r;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return min;
  };
  push([0, src]);
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue; // ignore stale entry
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        push([nd, v]);
      }
    }
  }
  return dist;
}`,
      java: `public long[] dijkstra(List<int[]>[] adj, int src, int n) {
  long[] dist = new long[n];
  Arrays.fill(dist, Long.MAX_VALUE);
  dist[src] = 0L;
  PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
  pq.offer(new long[]{0L, src});
  while (!pq.isEmpty()) {
    long[] cur = pq.poll();
    long d = cur[0];
    int u = (int) cur[1];
    if (d > dist[u]) continue; // ignore stale entry
    for (int[] e : adj[u]) {
      int v = e[0], weight = e[1];
      long nd = d + weight;
      if (nd < dist[v]) {
        dist[v] = nd;
        pq.offer(new long[]{nd, v});
      }
    }
  }
  return dist;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Seed Source A with dist = 0',
        explanation: 'Initialize dist[A] = 0 and all others = ∞. Push (0, A) into the Min-Heap.',
        invariantCheck: 'Only source A is known with cost 0.',
        variables: [
          { name: 'popped', value: '(0, A)' },
          { name: 'heap', value: '[(0, A)]' },
        ],
        activeNodes: ['A'],
        nodeBadges: { A: '0', B: '∞', C: '∞', D: '∞', E: '∞' },
        queueItems: ['(0, A)'],
      },
      {
        step: 2,
        title: 'Settle A (0) → Relax B (4) and C (1)',
        explanation: 'A→B costs 4, A→C costs 1. Update dist[B]=4, dist[C]=1 and push both to Min-Heap.',
        invariantCheck: 'Min-Heap orders C(1) ahead of B(4).',
        variables: [
          { name: 'settled', value: 'A (0)' },
          { name: 'relaxed', value: 'C→1, B→4' },
        ],
        activeNodes: ['B', 'C'],
        visitedNodes: ['A'],
        activeEdges: ['A->B', 'A->C'],
        nodeBadges: { A: '0', B: '4', C: '1', D: '∞', E: '∞' },
        queueItems: ['(1, C)', '(4, B)'],
      },
      {
        step: 3,
        title: 'Settle C (1) → Better path to B (1+2=3) & D (1+5=6)!',
        explanation: 'Pop (1, C). Path A→C→B costs 3 < 4! Relax dist[B] from 4 down to 3 and dist[D] to 6.',
        invariantCheck: 'Edge relaxation upgrades B before B is settled.',
        variables: [
          { name: 'settled', value: 'C (1)' },
          { name: 'improved B', value: '4 → 3' },
        ],
        activeNodes: ['C', 'B', 'D'],
        visitedNodes: ['A', 'C'],
        activeEdges: ['A->C', 'C->B', 'C->D'],
        nodeBadges: { A: '0', B: '3', C: '1', D: '6', E: '∞' },
        queueItems: ['(3, B)', '(4, B stale)', '(6, D)'],
      },
      {
        step: 4,
        title: 'Settle B (3) → Relax E (3+1=4)',
        explanation: 'Pop (3, B). Relax B→E to 4. Next pop (4, B) is skipped as stale since 4 > dist[B]=3.',
        invariantCheck: 'Stale guard (d > dist[u]) avoids duplicate work.',
        variables: [
          { name: 'settled', value: 'B (3)' },
          { name: 'relaxed', value: 'E→4' },
        ],
        activeNodes: ['B', 'E'],
        visitedNodes: ['A', 'C', 'B'],
        activeEdges: ['A->C', 'C->B', 'B->E'],
        nodeBadges: { A: '0', B: '3', C: '1', D: '6', E: '4' },
        queueItems: ['(4, E)', '(6, D)'],
      },
      {
        step: 5,
        title: 'Settle E (4) → Relax D (4+1=5) → All Shortest Paths Locked!',
        explanation: 'Pop (4, E) and improve D from 6 → 5 via A→C→B→E→D! Final shortest distances: A:0, C:1, B:3, E:4, D:5.',
        invariantCheck: 'Shortest distances finalized; with a lazy binary heap the bound is O(V + E log(E + 1)).',
        variables: [
          { name: 'distances', value: 'A:0 C:1 B:3 E:4 D:5' },
        ],
        activeNodes: ['E', 'D'],
        visitedNodes: ['A', 'B', 'C', 'D', 'E'],
        activeEdges: ['A->C', 'C->B', 'B->E', 'E->D'],
        nodeBadges: { A: '0', B: '3', C: '1', D: '5', E: '4' },
        queueItems: [],
      },
    ],
  },

  // 11. Backtracking & Pruning
  {
    id: 'backtracking-trie',
    name: 'Backtracking & Branch Pruning',
    shortName: 'Backtracking',
    category: 'Optimization & Decision Making',
    visualType: 'backtracking-tree',
    tagline: 'Choose → Explore → Unchoose over decision trees with early bound pruning.',
    timeComplexity: 'Exponential in the worst case; pruning reduces explored branches but does not change the worst-case class',
    spaceComplexity: 'O(d) auxiliary path/recursion space, excluding stored results',
    complexityLeap: 'Unpruned exhaustive search → early-cut DFS decision tree',
    coreIdea:
      'Build candidate solutions incrementally on a mutable path. Choose an option, recurse, then undo that choice before exploring the next branch. Pruning is valid only when a proven bound shows a branch cannot produce a solution; sorting can make such bounds easier to check. A trie can also stop word-search branches that no dictionary word can complete.',
    mentalModelSteps: [
      'Check the base case (remain == 0 → copy the current path into results). For Combination Sum, assume candidates are positive; otherwise the recursion may not make progress.',
      'Loop candidate index i from start .. n-1 to avoid duplicate permutations.',
      'PRUNE early: if sorted cand[i] > remain, break immediately.',
      'Choose path.push(cand[i]), recurse dfs(i, remain - cand[i]), then Unchoose path.pop().',
    ],
    loopInvariant:
      'Upon returning from every recursive call, path is restored to its exact state before that branch began.',
    whenToUse: [
      'Return ALL subsets, permutations, or combinations (Combination Sum, Subsets)',
      'Constraint satisfaction (N-Queens, Sudoku, Palindrome Partitioning)',
      'Grid word matching accelerated with a Prefix Trie (Word Search II)',
    ],
    whenItFails:
      'If the task asks only for a count or optimum and many branches reach the same state, dynamic programming or memoization may merge repeated work. This is not automatically polynomial: the number of distinct states and transitions determines the bound. If every solution must be listed, output size itself may be exponential.',
    linkedTopics: ['Backtracking & Tries'],
    linkedProblemSlugs: ['combination-sum', 'subsets', 'implement-trie', 'word-search-ii'],
    templates: {
      python: `def combination_sum(candidates, target):
    candidates.sort()
    res, path = [], []
    def dfs(start, rem):
        if rem == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > rem:
                break  # prune remaining larger candidates
            path.append(candidates[i])
            dfs(i, rem - candidates[i])
            path.pop()  # backtrack / unchoose
    dfs(0, target)
    return res`,
      js: `function combinationSum(candidates, target) {
  candidates.sort((a, b) => a - b);
  const res = [], path = [];
  const dfs = (start, rem) => {
    if (rem === 0) { res.push([...path]); return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > rem) break;
      path.push(candidates[i]);
      dfs(i, rem - candidates[i]);
      path.pop();
    }
  };
  dfs(0, target);
  return res;
}`,
      java: `void dfs(int start, int rem, int[] c, List<Integer> path, List<List<Integer>> res) {
  if (rem == 0) { res.add(new ArrayList<>(path)); return; }
  for (int i = start; i < c.length && c[i] <= rem; i++) {
    path.add(c[i]);
    dfs(i, rem - c[i], c, path, res);
    path.remove(path.size() - 1);
  }
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Root: candidates = [2, 3, 5], target = 5',
        explanation: 'Start at empty path [], remaining = 5. Branch first with smallest candidate 2.',
        invariantCheck: 'Sorted candidates enable instant break when cand[i] > rem.',
        variables: [
          { name: 'path', value: '[]' },
          { name: 'remain', value: '5' },
        ],
        activeNodes: ['root'],
        outputSeq: [],
      },
      {
        step: 2,
        title: 'Choose 2 → Choose 2 → Prune! (remain = 1 < 2)',
        explanation: 'Path [2, 2] leaves remain = 1. Smallest candidate is 2 > 1, so prune entire subtree and backtrack!',
        invariantCheck: 'Early pruning cuts off dead recursion immediately.',
        variables: [
          { name: 'path', value: '[2, 2]' },
          { name: 'remain', value: '1 (PRUNE)' },
        ],
        activeNodes: ['n2', 'n22'],
        visitedNodes: ['root', 'n2'],
        prunedNodes: ['n22'],
        activeEdges: ['root->n2', 'n2->n22'],
        outputSeq: [],
      },
      {
        step: 3,
        title: 'Backtrack to [2] → Choose 3 → HIT [2, 3]!',
        explanation: 'Pop 2 back to [2] (rem=3). Pick 3 → rem = 0! Clone [2, 3] into results.',
        invariantCheck: 'Start index prevents generating duplicate [3, 2] later.',
        variables: [
          { name: 'path', value: '[2, 3]' },
          { name: 'remain', value: '0 (SOLUTION)' },
        ],
        activeNodes: ['n23'],
        visitedNodes: ['root', 'n2', 'n23'],
        prunedNodes: ['n22'],
        activeEdges: ['root->n2', 'n2->n23'],
        outputSeq: ['[2, 3]'],
      },
      {
        step: 4,
        title: 'Backtrack to Root → Branch [3] pruned → Branch [5] HIT!',
        explanation: 'From [3] (rem=2), candidates >= 3 exceed rem=2 so [3] prunes. Next pick 5 → rem=0 → clone [5]!',
        invariantCheck: 'All unique combinations found: [2, 3] and [5].',
        variables: [
          { name: 'path', value: '[5]' },
          { name: 'solutions', value: '2 found' },
        ],
        activeNodes: ['n5'],
        visitedNodes: ['root', 'n2', 'n23', 'n5'],
        prunedNodes: ['n22', 'n3'],
        activeEdges: ['root->n5'],
        outputSeq: ['[2, 3]', '[5]'],
      },
    ],
  },

  // 12. Dynamic Programming (Tabulation)
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming (SRTBOT)',
    shortName: 'Dynamic Programming',
    category: 'Optimization & Decision Making',
    visualType: 'dp-table',
    tagline: 'Cache overlapping subproblems and build optimal answers from smaller states.',
    timeComplexity: 'O(Amount · Coins)',
    spaceComplexity: 'O(Amount)',
    complexityLeap: 'O(C^Amount) exponential recursion → O(Amount · C) table fill',
    coreIdea:
      'Define one crystal-clear state meaning (e.g., dp[x] = minimum coins needed to make amount x). Express dp[x] from smaller already-solved subproblems dp[x - coin] + 1 and evaluate in topological order.',
    mentalModelSteps: [
      'Define state: dp[x] = the minimum number of coins needed to make amount x (use a sentinel for unreachable states). Assume coin denominations are positive integers and amount is non-negative.',
      'Set Base Case: dp[0] = 0 (zero coins needed to make amount 0).',
      'Write Transition: dp[x] = min(dp[x], 1 + dp[x - c]) for every coin c <= x.',
      'Order: iterate x from 1 to amount so every x - c is already finalized.',
    ],
    loopInvariant:
      'After completing iteration x, dp[0 .. x] all hold exact globally optimal minimum coin counts.',
    whenToUse: [
      'Counting ways or finding min/max cost with overlapping subproblems',
      'Minimum-coin change where greedy can fail (for coins [1, 3, 4] and target 6, greedy takes 4+1+1 = 3 coins, while 3+3 = 2)',
      'Knapsack, Grid Paths, LCS / Edit Distance, LIS',
    ],
    whenItFails:
      'If subproblems never repeat (like generating all distinct permutations), memoization adds overhead without speedup—use Backtracking.',
    linkedTopics: ['Dynamic Programming'],
    linkedProblemSlugs: ['coin-change', 'edit-distance', 'longest-increasing-subsequence', 'climbing-stairs'],
    featuredLabId: 'coin-change',
    hasDpLabLink: true,
    templates: {
      python: `def coin_change(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for x in range(1, amount + 1):
        for c in coins:
            if c <= x:
                dp[x] = min(dp[x], 1 + dp[x - c])
    return -1 if dp[amount] > amount else dp[amount]`,
      js: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x) dp[x] = Math.min(dp[x], 1 + dp[x - c]);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `public int coinChange(int[] coins, int amount) {
  int[] dp = new int[amount + 1];
  Arrays.fill(dp, amount + 1);
  dp[0] = 0;
  for (int x = 1; x <= amount; x++) {
    for (int c : coins) {
      if (c <= x) dp[x] = Math.min(dp[x], 1 + dp[x - c]);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Base Case: dp[0] = 0 (coins = [1, 3, 4], target = 6)',
        explanation: 'Initialize dp[0] = 0 and dp[1..6] = ∞. Notice Greedy would fail on target 6 (4+1+1 = 3 coins vs optimal 3+3 = 2).',
        invariantCheck: 'dp[0] is our foundation state.',
        variables: [
          { name: 'coins', value: '[1, 3, 4]' },
          { name: 'solving', value: 'base dp[0] = 0' },
        ],
        array: [0, '∞', '∞', '∞', '∞', '∞', '∞'],
        matchedIndices: [0],
      },
      {
        step: 2,
        title: 'Fill dp[1] = 1, dp[2] = 2 using coin 1',
        explanation: 'For x=1, only coin 1 fits → 1+dp[0]=1. For x=2 → 1+dp[1]=2.',
        invariantCheck: 'Each state reads strictly smaller indices.',
        variables: [
          { name: 'dp[1]', value: '1 (1)' },
          { name: 'dp[2]', value: '2 (1+1)' },
        ],
        array: [0, 1, 2, '∞', '∞', '∞', '∞'],
        highlightIndices: [1, 2],
        matchedIndices: [0, 1, 2],
        dpDependencies: [{ from: 1, to: 2, label: '+coin 1' }],
      },
      {
        step: 3,
        title: 'Fill dp[3] = 1 & dp[4] = 1 (Direct single-coin hits!)',
        explanation: 'At x=3: min(1+dp[2]=3, 1+dp[0]=1) = 1. At x=4: min(1+dp[3]=2, 1+dp[1]=2, 1+dp[0]=1) = 1.',
        invariantCheck: 'Coin 3 beats three 1s; coin 4 beats 3+1.',
        variables: [
          { name: 'dp[3]', value: '1 (coin 3)' },
          { name: 'dp[4]', value: '1 (coin 4)' },
        ],
        array: [0, 1, 2, 1, 1, '∞', '∞'],
        highlightIndices: [3, 4],
        matchedIndices: [0, 1, 2, 3, 4],
        dpDependencies: [
          { from: 0, to: 3, label: '+3' },
          { from: 0, to: 4, label: '+4' },
        ],
      },
      {
        step: 4,
        title: 'Fill dp[5] = 2 (4+1 or 3+2)',
        explanation: 'At x=5: coin 1 → 1+dp[4]=2; coin 3 → 1+dp[2]=3; coin 4 → 1+dp[1]=2. Best is 2 coins.',
        invariantCheck: 'dp[0..5] are all optimal.',
        variables: [
          { name: 'candidates', value: '1+dp[4]=2, 1+dp[2]=3, 1+dp[1]=2' },
          { name: 'dp[5]', value: '2' },
        ],
        array: [0, 1, 2, 1, 1, 2, '∞'],
        highlightIndices: [5],
        matchedIndices: [0, 1, 2, 3, 4, 5],
        dpDependencies: [
          { from: 4, to: 5, label: '+1 → 2' },
          { from: 1, to: 5, label: '+4 → 2' },
        ],
      },
      {
        step: 5,
        title: 'Fill dp[6] = 2 (3 + 3 BEATS Greedy 4 + 1 + 1!)',
        explanation: 'Compare all 3 transitions: coin 1 → 1+dp[5]=3, coin 3 → 1+dp[3]=2 (WINNER!), coin 4 → 1+dp[2]=3. Optimal = 2 coins!',
        invariantCheck: 'DP avoids the Greedy trap by reusing optimal dp[3] = 1.',
        variables: [
          { name: 'coin 1', value: '1 + dp[5] = 3' },
          { name: 'coin 3', value: '1 + dp[3] = 2 (BEST)' },
          { name: 'coin 4', value: '1 + dp[2] = 3' },
        ],
        array: [0, 1, 2, 1, 1, 2, 2],
        matchedIndices: [0, 1, 2, 3, 4, 5, 6],
        highlightIndices: [3, 6],
        dpDependencies: [
          { from: 3, to: 6, label: '+coin 3 → 2 (Optimal)' },
          { from: 2, to: 6, label: '+coin 4 → 3' },
        ],
      },
    ],
  },

  // 13. Divide & Conquer (Merge Sort)
  {
    id: 'merge-sort-divide-conquer',
    name: 'Merge Sort & Quick Sort',
    shortName: 'Merge / Quick Sort',
    category: 'Searching & Sorting',
    visualType: 'merge-sort',
    tagline: 'Split until each part has at most one item, then merge sorted halves in O(N log N).',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) Bubble/Insertion Sort → guaranteed O(N log N) stable sort',
    coreIdea:
      'Recursively split the input into two halves until every chunk has length 1 (trivially sorted). Then merge two sorted halves linearly using two pointers, guaranteeing worst-case O(N log N) and stability.',
    mentalModelSteps: [
      'Base case: arrays of length <= 1 are already sorted.',
      'Divide: split at mid = len // 2 into left and right subarrays.',
      'Conquer: recursively sort left and right.',
      'Combine: merge two sorted lists with two pointers in O(N) linear work per level (log N levels).',
    ],
    loopInvariant:
      'Each recursive call returns its segment in non-decreasing order; the merge step preserves that order while combining two sorted segments.',
    whenToUse: [
      'Guaranteed O(N log N) worst-case stable sorting (unlike QuickSort worst-case O(N²))',
      'Sorting linked lists with iterative merge sort in O(1) auxiliary space; recursive linked-list merge sort uses O(log N) stack space',
      'Merge K Sorted Lists (divide-and-conquer pairing) & Count Inversions',
    ],
    whenItFails:
      'Array merge sort typically needs O(N) auxiliary buffer space. If in-place O(1) extra array space is required and stability is unnecessary, HeapSort offers O(N log N) worst-case time; randomized QuickSort is often fast in practice but has O(N²) worst-case time.',
    linkedTopics: ['Linked Lists', 'Modified Binary Search'],
    linkedProblemSlugs: ['merge-k-sorted-lists', 'median-of-two-sorted-arrays', 'reverse-linked-list', 'binary-search-classic'],
    templates: {
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    res, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i]); i += 1
        else:
            res.append(right[j]); j += 1
    return res + left[i:] + right[j:]`,
      js: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const L = mergeSort(arr.slice(0, mid));
  const R = mergeSort(arr.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) {
    out.push(L[i] <= R[j] ? L[i++] : R[j++]);
  }
  return out.concat(L.slice(i), R.slice(j));
}`,
      java: `void mergeSort(int[] a, int l, int r) {
  if (l >= r) return;
  int m = l + (r - l) / 2;
  mergeSort(a, l, m);
  mergeSort(a, m + 1, r);
  merge(a, l, m, r);
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Divide Phase: Split [38, 27, 43, 3, 9, 82] into halves',
        explanation: 'Split into [38, 27, 43] and [3, 9, 82]. Depth of recursion tree = ceil(log₂ N) = 3 levels.',
        invariantCheck: 'Each level processes all N elements at most once during merge.',
        variables: [
          { name: 'phase', value: 'Divide' },
          { name: 'depth', value: '1 of 3' },
        ],
        mergeLevels: [
          { values: [38, 27, 43, 3, 9, 82], range: [0, 5] },
          { values: [38, 27, 43], range: [0, 2], active: true },
          { values: [3, 9, 82], range: [3, 5], active: true },
        ],
      },
      {
        step: 2,
        title: 'Base Case: Atomic Single-Element Chunks',
        explanation: 'Every 1-element slice [38], [27], [43], [3], [9], [82] is trivially sorted. Begin bottom-up merging.',
        invariantCheck: 'All 6 leaves satisfy sorted invariant.',
        variables: [
          { name: 'phase', value: 'Base Cases' },
          { name: 'chunks', value: '6 sorted units' },
        ],
        mergeLevels: [
          { values: [38], range: [0, 0], sorted: true },
          { values: [27], range: [1, 1], sorted: true },
          { values: [43], range: [2, 2], sorted: true },
          { values: [3], range: [3, 3], sorted: true },
          { values: [9], range: [4, 4], sorted: true },
          { values: [82], range: [5, 5], sorted: true },
        ],
      },
      {
        step: 3,
        title: 'Merge Level 2: Zip halves → [27, 38, 43] & [3, 9, 82]',
        explanation: 'Compare fronts of left & right pairs to assemble two sorted halves in linear time.',
        invariantCheck: 'Both halves are now completely sorted.',
        variables: [
          { name: 'phase', value: 'Conquer & Merge' },
          { name: 'left half', value: '[27, 38, 43]' },
          { name: 'right half', value: '[3, 9, 82]' },
        ],
        mergeLevels: [
          { values: [27, 38, 43], range: [0, 2], active: true, sorted: true },
          { values: [3, 9, 82], range: [3, 5], active: true, sorted: true },
        ],
      },
      {
        step: 4,
        title: 'Final Merge: Zip into [3, 9, 27, 38, 43, 82]',
        explanation: 'Two pointers pick 3, 9, 27, 38, 43, 82 in 6 steps. Total work = O(N log N) guaranteed!',
        invariantCheck: 'Stable, worst-case O(N log N) sort complete.',
        variables: [
          { name: 'result', value: '[3, 9, 27, 38, 43, 82]' },
          { name: 'complexity', value: 'O(N log N)' },
        ],
        mergeLevels: [{ values: [3, 9, 27, 38, 43, 82], range: [0, 5], sorted: true }],
      },
    ],
  },

  // 14. Greedy Algorithms (Interval Selection & Exchange Argument)
  {
    id: 'greedy-algorithms',
    name: 'Greedy & Exchange Argument',
    shortName: 'Greedy',
    category: 'Optimization & Decision Making',
    visualType: 'greedy-intervals',
    tagline: 'Lock the locally optimal choice that leaves maximum room for all future choices.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(2^N) subset search / O(N²) DP → O(N log N) single greedy sweep',
    coreIdea:
      'In Activity Selection / Non-Overlapping Intervals, sort by END time ascending and always pick the next compatible interval finishing earliest. By the Exchange Argument, finishing earlier can never hurt future compatibility.',
    mentalModelSteps: [
      'Identify the greedy ordering key (earliest end time for max activities; running min buy price for stock profit).',
      'Prove the Exchange Argument: swapping any optimal solution’s choice for the greedy choice cannot worsen the result.',
      'Sort once in O(N log N) if order matters, then sweep linearly keeping track of lastEnd.',
      'Accept every item with start >= lastEnd and update lastEnd = item.end.',
    ],
    loopInvariant:
      'After processing k intervals, our greedy set ends at the earliest possible timestamp among all valid sets of the same size.',
    whenToUse: [
      'Non-overlapping interval maximization, Merge Intervals, Jump Game',
      'Single-pass profit/extremum tracking (Best Time to Buy & Sell Stock, Container With Most Water)',
      'Huffman coding, Kruskal MST, Dijkstra relaxation',
    ],
    whenItFails:
      'If a local choice blocks a better global combination (like Coin Change [1, 3, 4] for target 6 or 0/1 Knapsack), Greedy fails—immediately switch to Dynamic Programming.',
    linkedTopics: ['Heaps & Intervals', 'Sliding Window', 'Two Pointers'],
    linkedProblemSlugs: [
      'merge-intervals',
      'best-time-to-buy-and-sell-stock',
      'container-with-most-water',
      'meeting-rooms-ii',
    ],
    templates: {
      python: `def max_non_overlapping(intervals):
    intervals.sort(key=lambda x: x[1])  # sort by END time
    kept, last_end = 0, float('-inf')
    for start, end in intervals:
        if start >= last_end:
            kept += 1
            last_end = end
    return kept`,
      js: `function maxNonOverlapping(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) { kept++; lastEnd = e; }
  }
  return kept;
}`,
      java: `public int maxNonOverlapping(int[][] ivs) {
  Arrays.sort(ivs, (a, b) -> Integer.compare(a[1], b[1]));
  int kept = 0, lastEnd = Integer.MIN_VALUE;
  for (int[] iv : ivs) {
    if (iv[0] >= lastEnd) { kept++; lastEnd = iv[1]; }
  }
  return kept;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Sort by END time → Pick Earliest Finisher [1, 3]',
        explanation: 'Sorted by end: [1,3], [2,5], [4,7], [6,8], [8,11]. Picking [1,3] frees the timeline at t=3.',
        invariantCheck: 'No other interval finishes earlier than t = 3.',
        variables: [
          { name: 'lastEnd', value: '3' },
          { name: 'kept', value: '1' },
        ],
        intervals: [
          { id: '[1,3]', start: 1, end: 3, status: 'selected' },
          { id: '[2,5]', start: 2, end: 5, status: 'pending' },
          { id: '[4,7]', start: 4, end: 7, status: 'pending' },
          { id: '[6,8]', start: 6, end: 8, status: 'pending' },
          { id: '[8,11]', start: 8, end: 11, status: 'pending' },
        ],
      },
      {
        step: 2,
        title: 'Skip [2, 5] (conflicts with lastEnd = 3)',
        explanation: 'Start 2 < 3 → overlaps [1,3]. Discard [2,5] cleanly.',
        invariantCheck: 'lastEnd stays 3.',
        variables: [
          { name: 'checking', value: '[2, 5] (2 < 3 SKIP)' },
          { name: 'kept', value: '1' },
        ],
        intervals: [
          { id: '[1,3]', start: 1, end: 3, status: 'selected' },
          { id: '[2,5]', start: 2, end: 5, status: 'skipped' },
          { id: '[4,7]', start: 4, end: 7, status: 'pending' },
          { id: '[6,8]', start: 6, end: 8, status: 'pending' },
          { id: '[8,11]', start: 8, end: 11, status: 'pending' },
        ],
      },
      {
        step: 3,
        title: 'Pick [4, 7] (4 >= 3) → Skip [6, 8]',
        explanation: '[4,7] starts at 4 >= 3, so accept it (lastEnd = 7). Then [6,8] conflicts (6 < 7) and is skipped.',
        invariantCheck: 'Finishing at 7 leaves room for [8,11].',
        variables: [
          { name: 'lastEnd', value: '7' },
          { name: 'kept', value: '2' },
        ],
        intervals: [
          { id: '[1,3]', start: 1, end: 3, status: 'selected' },
          { id: '[2,5]', start: 2, end: 5, status: 'skipped' },
          { id: '[4,7]', start: 4, end: 7, status: 'selected' },
          { id: '[6,8]', start: 6, end: 8, status: 'skipped' },
          { id: '[8,11]', start: 8, end: 11, status: 'pending' },
        ],
      },
      {
        step: 4,
        title: 'Pick [8, 11] → Maximum 3 Non-Overlapping Activities!',
        explanation: 'Start 8 >= 7 → accept [8,11]. Greedy sweep achieves exact global maximum (3) in O(N log N).',
        invariantCheck: 'Exchange argument proves no 4-activity schedule exists.',
        variables: [
          { name: 'lastEnd', value: '11' },
          { name: 'max kept', value: '3' },
        ],
        intervals: [
          { id: '[1,3]', start: 1, end: 3, status: 'selected' },
          { id: '[2,5]', start: 2, end: 5, status: 'skipped' },
          { id: '[4,7]', start: 4, end: 7, status: 'selected' },
          { id: '[6,8]', start: 6, end: 8, status: 'skipped' },
          { id: '[8,11]', start: 8, end: 11, status: 'selected' },
        ],
      },
    ],
  },
];

const ORDERED_CATEGORY_SEQUENCE: AlgorithmCategory[] = [
  ...CORE_ALGORITHM_CATEGORIES,
  ...ADVANCED_ALGORITHM_CATEGORIES,
  ...SYSTEMS_ALGORITHM_CATEGORIES,
];

const ALL_RAW_ALGORITHMS: AlgorithmDefinition[] = [
  ...BASE_14_ALGORITHMS,
  ...EXTRA_6_ALGORITHMS,
  ...SPECIALIST_9_ALGORITHMS,
  ...MASTER_CORE_11_ALGORITHMS,
  ...ADV_GRAPH_ALGORITHMS,
  ...ADV_TREE_ALGORITHMS,
  ...ADV_STRING_ALGORITHMS,
  ...ADV_DP_ALGORITHMS,
  ...ADV_MATH_RAND_ALGORITHMS,
  ...MASTER_ADV_18_ALGORITHMS,
  ...MASTER_SYSTEMS_11_ALGORITHMS,
];

export const ALGORITHMS_CATALOG: AlgorithmDefinition[] = ORDERED_CATEGORY_SEQUENCE.flatMap((cat) =>
  ALL_RAW_ALGORITHMS.filter((algo) => algo.category === cat)
);

export const ALL_PRACTICE_CHALLENGES: Record<string, AlgorithmPracticeSpec> = {
  ...PRACTICE_CHALLENGES,
  ...SPECIALIST_9_PRACTICE,
  ...MASTER_CORE_11_PRACTICE,
  ...ADV_GRAPH_PRACTICE,
  ...ADV_TREE_PRACTICE,
  ...ADV_STRING_PRACTICE,
  ...ADV_DP_PRACTICE,
  ...ADV_MATH_RAND_PRACTICE,
  ...MASTER_ADV_18_PRACTICE,
  ...MASTER_SYSTEMS_11_PRACTICE,
};

