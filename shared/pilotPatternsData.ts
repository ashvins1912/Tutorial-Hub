import type {
  CanonicalAssessment,
  CanonicalProblem,
  ContentVersion,
  LearningObjective,
  LearningTopic,
  MasteryRequirement,
  UnderstandStageContent,
} from './learningContract';

export const STANDARD_MASTERY_REQUIREMENTS: MasteryRequirement[] = [
  {
    dimension: 'understanding',
    label: 'Conceptual Understanding',
    minimumScorePct: 80,
    evidenceDescription: 'Complete Stage 1 Understand and pass the conceptual misconception check.',
  },
  {
    dimension: 'patternRecognition',
    label: 'Pattern Recognition',
    minimumScorePct: 80,
    evidenceDescription: 'Score at least 80% on the 6-criterion Pattern Recognition Intelligence rubric.',
  },
  {
    dimension: 'visualization',
    label: 'Visualization & Invariants',
    minimumScorePct: 80,
    evidenceDescription: 'Step through at least 2 interactive traces and answer prediction checkpoints.',
  },
  {
    dimension: 'implementation',
    label: 'Independent Implementation',
    minimumScorePct: 80,
    evidenceDescription: 'Pass verified test suites for at least 2 problems independently.',
  },
  {
    dimension: 'correctness',
    label: 'Correctness & Edge Cases',
    minimumScorePct: 80,
    evidenceDescription: 'Pass boundary and edge-case test cases without runtime or invariant failures.',
  },
  {
    dimension: 'complexityAnalysis',
    label: 'Complexity Analysis',
    minimumScorePct: 80,
    evidenceDescription: 'Correctly justify Time and Space complexity trade-offs vs. brute force.',
  },
  {
    dimension: 'debugging',
    label: 'Debugging & Root Cause',
    minimumScorePct: 80,
    evidenceDescription: 'Identify and fix the invariant defect in at least 1 debugging challenge.',
  },
  {
    dimension: 'transferAbility',
    label: 'Unseen Problem Transfer',
    minimumScorePct: 80,
    evidenceDescription: 'Score at least 80% on an unfamiliar transfer problem without pattern hints.',
  },
];

function makePilotVersion(contentId: string, notes: string): ContentVersion {
  return {
    contentId,
    version: '1.0.0',
    publicationStatus: 'published',
    verificationStatus: 'Published',
    createdAt: '2026-11-24T00:00:00.000Z',
    updatedAt: '2026-11-24T00:00:00.000Z',
    author: 'Pattern Forge Curriculum Team',
    technicalReviewer: 'Staff Algorithms Reviewer',
    learningReviewer: 'Instructional Design Reviewer',
    reviewHistory: [
      {
        id: `${contentId}-rev-1`,
        version: '1.0.0',
        role: 'author',
        reviewer: 'Pattern Forge Curriculum Team',
        statusGranted: 'Structurally Valid',
        reviewedAt: '2026-11-22T10:00:00.000Z',
        notes: 'Authored canonical five-stage topic content, multi-language implementations, and test fixtures.',
      },
      {
        id: `${contentId}-rev-2`,
        version: '1.0.0',
        role: 'technical-reviewer',
        reviewer: 'Staff Algorithms Reviewer',
        statusGranted: 'Code Verified',
        reviewedAt: '2026-11-23T14:30:00.000Z',
        notes: 'Verified Java 21, ES2022 JavaScript, and Python 3.12 solutions, complexity bounds, and deterministic trace invariants.',
      },
      {
        id: `${contentId}-rev-3`,
        version: '1.0.0',
        role: 'learning-reviewer',
        reviewer: 'Instructional Design Reviewer',
        statusGranted: 'Published',
        reviewedAt: '2026-11-24T08:00:00.000Z',
        notes,
      },
    ],
  };
}

// ============================================================================
// PILOT 1: HASHMAP & HASHSET (hashmap-hashset-lookup)
// ============================================================================

const HASHMAP_OBJECTIVES: LearningObjective[] = [
  {
    id: 'obj-hm-1',
    statement: 'Explain how O(n) hash memory eliminates an inner O(n) linear scan and identify when ordering constraints disqualify hashing.',
    stage: 'understand',
    dimension: 'understanding',
  },
  {
    id: 'obj-hm-2',
    statement: 'Trace one-pass complement lookups and sequence-head filtering while preserving distinct-index and O(n) visit invariants.',
    stage: 'visualize',
    dimension: 'visualization',
  },
  {
    id: 'obj-hm-3',
    statement: 'Implement brute-force, sorting/better, and optimal O(n) HashMap/HashSet solutions cleanly in Java 21, JavaScript, and Python 3.12.',
    stage: 'implement',
    dimension: 'implementation',
  },
  {
    id: 'obj-hm-4',
    statement: 'Diagnose self-pairing, duplicate-key overwrite, and non-canonical signature bugs in practice and debugging exercises.',
    stage: 'practice',
    dimension: 'debugging',
  },
  {
    id: 'obj-hm-5',
    statement: 'Transfer HashMap/HashSet invariants to unseen streaming, deduplication, and grouping problems.',
    stage: 'master',
    dimension: 'transferAbility',
  },
];

const HASHMAP_UNDERSTAND: UnderstandStageContent = {
  whatIsPattern:
    'The HashMap & HashSet Lookup pattern trades O(n) auxiliary space for amortized O(1) membership checks, complement lookups, frequency counting, and equivalence-class bucketing.',
  whyItExists:
    'Naive nested loops repeatedly re-scan already visited elements to answer "have I seen this value or its complement before?". Storing indexed facts as you scan eliminates redundant scans completely.',
  problemItSolves:
    'Reduces quadratic O(n²) search, pair-matching, duplicate detection, and grouping problems down to linear O(n) time when element ordering does not need to be sorted.',
  whenToUse: [
    'Unsorted input where you need O(1) lookup of a complement (e.g., target - x), duplicate, or frequency count.',
    'Grouping items by a canonical equivalence key (anagrams, isomorphic shapes, normalized routes).',
    'Finding longest consecutive chains without sorting by checking sequence starts (num - 1 not in set).',
    'Input size n up to 10^5 where O(n²) times out and O(n) extra memory is permitted.',
  ],
  whenNotToUse: [
    'Strict O(1) auxiliary space is mandated (prefer Two Pointers on sorted input or in-place Cyclic Sort).',
    'Queries require range ordering, predecessor/successor lookup, or sorted iteration (prefer TreeMap / Binary Search).',
    'Contiguous subarray constraints with monotonic sums where a sliding window achieves O(1) space.',
  ],
  advantages: [
    'Amortized O(1) insert, lookup, and delete cuts O(n²) algorithms to O(n).',
    'Works on unsorted inputs without destroying original indices.',
    'Single-pass formulation naturally handles streaming data.',
  ],
  limitations: [
    'Requires O(n) extra memory and has higher constant-factor overhead than contiguous arrays due to hashing and cache misses.',
    'Iteration order is not sorted; worst-case hash collisions degrade lookup to O(n) under adversarial keys.',
    'Mutable objects cannot safely serve as keys without immutable canonicalization.',
  ],
  realWorldAnalogy: {
    title: 'Coat Check Ticket Counter vs. Searching Every Coat Rack',
    narrative:
      'Imagine checking whether a guest’s matching luggage tag is already in the room. Walking down every row of 1,000 racks for every arriving guest takes ~500,000 inspections. Instead, the clerk writes each arriving tag number on an indexed whiteboard keyed by tag ID — every lookup is instant.',
    mappingToAlgorithm:
      'The coat racks are the input array; the indexed whiteboard is the HashMap mapping value -> index; checking the board before writing prevents matching a guest with their own tag.',
  },
  simpleExample: {
    id: 'hm-ex-simple',
    title: 'Two Sum (One-Pass Complement Lookup)',
    problemStatement:
      'Given an array of integers nums and an integer target, return the indices of the two distinct elements that add up to target.',
    input: 'nums = [2, 7, 11, 15], target = 9',
    output: '[0, 1]',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i], target <= 10^9', 'Exactly one valid pair exists'],
    walkthrough: [
      'i = 0, nums[0] = 2: complement = 9 - 2 = 7. Is 7 in seen {}? No → store seen[2] = 0.',
      'i = 1, nums[1] = 7: complement = 9 - 7 = 2. Is 2 in seen {2: 0}? Yes, at index 0!',
      'Return [0, 1] immediately without scanning indices 2 and 3.',
    ],
    keyObservation:
      'Checking seen BEFORE inserting nums[i] guarantees index i never pairs with itself (critical when nums[i] * 2 == target).',
  },
  conceptualExamples: [
    {
      id: 'hm-ex-1',
      title: 'Two Sum with Duplicate Values (nums = [3, 3], target = 6)',
      problemStatement: 'Verify why lookup-before-insert handles repeated values cleanly.',
      input: 'nums = [3, 3], target = 6',
      output: '[0, 1]',
      constraints: ['Cannot reuse the same element twice'],
      walkthrough: [
        'i = 0 (val 3): complement = 3. Not in {} → insert seen[3] = 0.',
        'i = 1 (val 3): complement = 3. Found at index 0 BEFORE overwriting seen[3] → return [0, 1].',
      ],
      keyObservation: 'Even though both elements share value 3, one-pass lookup-before-insert finds index 0 before index 1 overwrites key 3.',
    },
    {
      id: 'hm-ex-2',
      title: 'Longest Consecutive Sequence (Head-Only Expansion)',
      problemStatement: 'Find the length of the longest consecutive elements sequence in an unsorted array in O(n) time.',
      input: 'nums = [100, 4, 200, 1, 3, 2]',
      output: '4 (sequence 1, 2, 3, 4)',
      constraints: ['Must run in O(n) time (sorting in O(n log n) is disallowed)'],
      walkthrough: [
        'Insert all elements into a HashSet: {100, 4, 200, 1, 3, 2}.',
        'For 4, 3, and 2: num - 1 exists in the set → skip immediately.',
        'For 1: 0 is NOT in the set → walk 1 → 2 → 3 → 4 (length 4).',
      ],
      keyObservation: 'Each number is visited at most twice total (once in the outer scan, once in a head-started while loop), proving O(n) amortized time.',
    },
  ],
  bruteForceComparisons: [
    {
      id: 'hm-bf-1',
      title: 'Two Sum: Nested Loops vs. One-Pass HashMap',
      bruteApproach: 'Check every pair (i, j) with 0 <= i < j < n until nums[i] + nums[j] == target.',
      bruteTime: 'O(n²)',
      bruteSpace: 'O(1)',
      bottleneck: 'For each i, the inner loop re-scans up to n - 1 elements just to ask if target - nums[i] exists.',
      optimizedApproach: 'Store seen[nums[i]] = i during a single scan and query seen.get(target - nums[i]) in O(1).',
      optimizedTime: 'O(n)',
      optimizedSpace: 'O(n)',
      whyBetter: 'For n = 10^4, worst-case operations drop from ~50,000,000 pair checks to at most 10,000 hash lookups.',
    },
    {
      id: 'hm-bf-2',
      title: 'Longest Consecutive Sequence: Sort vs. HashSet Head Filtering',
      bruteApproach: 'Sort the array in O(n log n) and scan adjacent elements while skipping duplicates.',
      bruteTime: 'O(n log n)',
      bruteSpace: 'O(1) or O(n)',
      bottleneck: 'Global sorting orders all elements even though we only need local neighbor existence (x - 1 and x + 1).',
      optimizedApproach: 'Load values into a HashSet and only expand upward from elements where (x - 1) is absent.',
      optimizedTime: 'O(n)',
      optimizedSpace: 'O(n)',
      whyBetter: 'Removes the log n sorting factor and directly tests neighbor membership in O(1).',
    },
  ],
  importantObservations: [
    'Always inspect the order of operations: lookup BEFORE insert prevents self-matching bugs.',
    'A HashMap stores key -> metadata (index, frequency, bucket), while a HashSet suffices when only presence matters.',
    'When grouping strings by anagram signature, a 26-element count signature is O(k) per string vs. O(k log k) for sorting characters.',
  ],
  commonMisconceptions: [
    {
      misconception: 'Pre-populating the entire HashMap first is always equivalent to one-pass insertion.',
      correction:
        'Pre-populating overwrites duplicate keys and forces extra self-index guards (seen.get(comp) != i). One-pass lookup-before-insert avoids both issues naturally.',
    },
    {
      misconception: 'Any while loop nested inside a for loop makes an algorithm O(n²).',
      correction:
        'In Longest Consecutive Sequence, the inner while loop runs ONLY when (num - 1) is absent, so every element in the set enters the while loop at most once across the entire run — strictly O(n).',
    },
  ],
  conceptCheck: {
    id: 'hm-concept-check',
    prompt: 'Given nums = [3, 2, 4] and target = 6, why does inserting nums[i] into the HashMap BEFORE checking for (target - nums[i]) fail?',
    options: [
      {
        id: 'self-pair',
        label: 'At i = 0 (nums[0] = 3), it inserts 3 -> 0 and then immediately matches 6 - 3 = 3 with index 0 itself, returning [0, 0].',
        isCorrect: true,
        explanation: 'Correct! Lookup-before-insert maintains the invariant that seen only contains strictly earlier indices (< i).',
      },
      {
        id: 'memory-leak',
        label: 'It doubles the memory complexity from O(n) to O(n²).',
        isCorrect: false,
        explanation: 'Memory stays O(n); the bug is a correctness failure (self-pairing index 0 with index 0).',
      },
      {
        id: 'no-bug',
        label: 'It works identically as long as all array elements are distinct.',
        isCorrect: false,
        explanation: 'Even with all distinct elements like [3, 2, 4], 3 + 3 = 6 falsely matches index 0 with itself!',
      },
    ],
  },
};

const HASHMAP_PROBLEMS: CanonicalProblem[] = [
  {
    id: 'prob-hm-two-sum',
    topicId: 'hashmap-hashset-lookup',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'beginner',
    hidePatternUntilSolved: false,
    problemStatement:
      'Given an integer array nums and an integer target, return the two indices [i, j] (i < j) such that nums[i] + nums[j] == target. You may not use the same element twice. Return an empty array if no pair exists.',
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9.' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6 (must not pair index 0 with itself).' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]', explanation: 'Duplicate values at different indices are valid.' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i], target <= 10^9'],
    hints: [
      'For each number x, you only need to know whether (target - x) appeared earlier.',
      'Check the map before inserting the current index to prevent pairing an index with itself.',
    ],
    starterCodeJs: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}`,
    solution: {
      problemId: 'prob-hm-two-sum',
      variants: [
        {
          tier: 'brute',
          label: 'Brute Force (Nested Pairs)',
          summary: 'Inspect every pair (i, j) with i < j until their sum equals target.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)',
          stepByStepExplanation: [
            'Iterate i from 0 to n - 2.',
            'Iterate j from i + 1 to n - 1 and test nums[i] + nums[j] == target.',
            'Return [i, j] on first match, or [] if no pair matches.',
          ],
          code: {
            java: `public class Solution {
    public int[] twoSumBrute(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[0];
    }
}`,
            javascript: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}`,
            python: `def two_sum_brute(nums: list[int], target: int) -> list[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
          },
        },
        {
          tier: 'better',
          label: 'Better (Sort + Two Pointers with Original Indices)',
          summary: 'Attach original indices, sort by value in O(n log n), then converge two pointers inward.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          stepByStepExplanation: [
            'Pair each value with its original index and sort ascending by value.',
            'Place left = 0 and right = n - 1; move left++ if sum < target, right-- if sum > target.',
            'Return original indices sorted ascending once sum == target.',
          ],
          code: {
            java: `import java.util.Arrays;
import java.util.Comparator;

public class Solution {
    public int[] twoSumSorted(int[] nums, int target) {
        int[][] indexed = new int[nums.length][2];
        for (int i = 0; i < nums.length; i++) {
            indexed[i][0] = nums[i];
            indexed[i][1] = i;
        }
        Arrays.sort(indexed, Comparator.comparingInt(a -> a[0]));
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int sum = indexed[left][0] + indexed[right][0];
            if (sum == target) {
                int a = indexed[left][1], b = indexed[right][1];
                return a < b ? new int[] { a, b } : new int[] { b, a };
            }
            if (sum < target) left++;
            else right--;
        }
        return new int[0];
    }
}`,
            javascript: `function twoSum(nums, target) {
  const indexed = nums.map((val, idx) => [val, idx]).sort((a, b) => a[0] - b[0]);
  let left = 0, right = indexed.length - 1;
  while (left < right) {
    const sum = indexed[left][0] + indexed[right][0];
    if (sum === target) {
      return [indexed[left][1], indexed[right][1]].sort((a, b) => a - b);
    }
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
            python: `def two_sum_sorted(nums: list[int], target: int) -> list[int]:
    indexed = sorted((val, idx) for idx, val in enumerate(nums))
    left, right = 0, len(indexed) - 1
    while left < right:
        total = indexed[left][0] + indexed[right][0]
        if total == target:
            return sorted([indexed[left][1], indexed[right][1]])
        if total < target:
            left += 1
        else:
            right -= 1
    return []`,
          },
        },
        {
          tier: 'optimal',
          label: 'Optimal (One-Pass HashMap Lookup)',
          summary: 'Query target - nums[i] in a HashMap before inserting nums[i] -> i.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          stepByStepExplanation: [
            'Initialize an empty HashMap mapping seen value -> index.',
            'For each index i, compute complement = target - nums[i].',
            'If complement is already in the map, return [seen.get(complement), i].',
            'Otherwise store seen.put(nums[i], i) and continue.',
          ],
          code: {
            java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            Integer prevIndex = seen.get(complement);
            if (prevIndex != null) {
                return new int[] { prevIndex, i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
            javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
            python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'At the start of iteration i, seen contains (nums[k] -> k) for all 0 <= k < i and no pair within [0..i-1] sums to target.',
        initialization: 'Before i = 0, [0..-1] is empty and seen is empty, so the invariant holds trivially.',
        maintenance: 'If a valid pair ends at i, its partner j < i is already in seen and found immediately. Otherwise inserting nums[i] -> i restores the invariant for i + 1.',
        termination: 'If any valid pair (j, i) exists with j < i, the loop terminates at i and returns [j, i]; otherwise it finishes all n elements and returns [].',
      },
      complexityAnalysis: {
        time: 'O(n)',
        timeJustification: 'Each element performs at most one HashMap lookup and one insertion (both O(1) amortized).',
        space: 'O(n)',
        spaceJustification: 'In the worst case (pair at the very end or absent), up to n - 1 entries are stored in seen.',
      },
      edgeCases: [
        { caseTitle: 'Half-target element', inputExample: 'nums = [3, 2, 4], target = 6', expectedBehavior: 'Must NOT return [0, 0]; must return [1, 2].' },
        { caseTitle: 'Duplicate values forming target', inputExample: 'nums = [3, 3], target = 6', expectedBehavior: 'Returns [0, 1] because lookup precedes overwrite.' },
        { caseTitle: 'Negative numbers and zero', inputExample: 'nums = [-3, 4, 3, 90], target = 0', expectedBehavior: 'Returns [0, 2] cleanly.' },
      ],
      commonMistakes: [
        { mistake: 'Inserting nums[i] before checking seen.has(complement)', whyItFails: 'Pairs index i with itself when 2 * nums[i] == target.', fix: 'Always perform seen.has(complement) first.' },
        { mistake: 'Using a plain JS object {} instead of Map', whyItFails: 'Coerces keys to strings and collides with prototype keys in general HashMap tasks.', fix: 'Use new Map() in JavaScript and HashMap<> in Java.' },
      ],
    },
    testSuite: {
      id: 'ts-hm-two-sum',
      entryFunctionName: { java: 'twoSum', javascript: 'twoSum', python: 'two_sum' },
      comparator: 'exact',
      cases: [
        { id: 'c1', name: 'Standard match', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { id: 'c2', name: 'Self-pair guard (3+3)', args: [[3, 2, 4], 6], expected: [1, 2], isEdgeCase: true },
        { id: 'c3', name: 'Duplicate values', args: [[3, 3], 6], expected: [0, 1], isEdgeCase: true },
        { id: 'c4', name: 'Negative + positive zero sum', args: [[-3, 4, 3, 90], 0], expected: [0, 2], isBoundary: true },
        { id: 'c5', name: 'No valid pair', args: [[1, 2, 3], 10], expected: [], isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
  },
  {
    id: 'prob-hm-longest-consecutive',
    topicId: 'hashmap-hashset-lookup',
    slug: 'longest-consecutive-sequence',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    category: 'intermediate',
    hidePatternUntilSolved: true,
    problemStatement:
      'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence (x, x+1, x+2, ...). Your algorithm must run in O(n) time.',
    examples: [
      { input: 'nums = [100, 4, 200, 1, 3, 2]', output: '4', explanation: 'The longest consecutive sequence is [1, 2, 3, 4] of length 4.' },
      { input: 'nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', output: '9', explanation: 'Duplicates like 0 do not break or extend the streak [0..8].' },
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9', 'Required time complexity: O(n)'],
    hints: [
      'Think about how to recognize the exact starting number of a consecutive run.',
      'A number x starts a run only when (x - 1) does not exist in the set.',
    ],
    starterCodeJs: `function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let best = 0;\n  for (const num of set) {\n    if (!set.has(num - 1)) {\n      let curr = num;\n      while (set.has(curr + 1)) curr++;\n      best = Math.max(best, curr - num + 1);\n    }\n  }\n  return best;\n}`,
    solution: {
      problemId: 'prob-hm-longest-consecutive',
      variants: [
        {
          tier: 'brute',
          label: 'Brute Force (Linear Search per Step)',
          summary: 'For every element, repeatedly search the array for x + 1, x + 2, ...',
          timeComplexity: 'O(n³)',
          spaceComplexity: 'O(1)',
          stepByStepExplanation: ['Start from every num in nums and linearly scan for curr + 1.'],
          code: {
            java: `public class Solution {
    public int longestConsecutiveBrute(int[] nums) {
        int best = 0;
        for (int num : nums) {
            int curr = num;
            while (contains(nums, curr + 1)) curr++;
            best = Math.max(best, curr - num + 1);
        }
        return best;
    }
    private boolean contains(int[] nums, int target) {
        for (int v : nums) if (v == target) return true;
        return false;
    }
}`,
            javascript: `function longestConsecutive(nums) {
  let best = 0;
  for (const num of nums) {
    let curr = num;
    while (nums.includes(curr + 1)) curr++;
    best = Math.max(best, curr - num + 1);
  }
  return best;
}`,
            python: `def longest_consecutive_brute(nums: list[int]) -> int:
    best = 0
    for num in nums:
        curr = num
        while (curr + 1) in nums:
            curr += 1
        best = max(best, curr - num + 1)
    return best`,
          },
        },
        {
          tier: 'better',
          label: 'Better (Sort + Single Scan)',
          summary: 'Sort the array and track consecutive runs while skipping duplicates.',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(1) extra',
          stepByStepExplanation: ['Sort nums ascending; skip equal adjacent values; increment streak on diff == 1, reset otherwise.'],
          code: {
            java: `import java.util.Arrays;

public class Solution {
    public int longestConsecutiveSorted(int[] nums) {
        if (nums.length == 0) return 0;
        Arrays.sort(nums);
        int best = 1, streak = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == nums[i - 1]) continue;
            if (nums[i] == nums[i - 1] + 1) streak++;
            else streak = 1;
            best = Math.max(best, streak);
        }
        return best;
    }
}`,
            javascript: `function longestConsecutive(nums) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  let best = 1, streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) continue;
    streak = sorted[i] === sorted[i - 1] + 1 ? streak + 1 : 1;
    best = Math.max(best, streak);
  }
  return best;
}`,
            python: `def longest_consecutive_sorted(nums: list[int]) -> int:
    if not nums:
        return 0
    arr = sorted(nums)
    best = streak = 1
    for i in range(1, len(arr)):
        if arr[i] == arr[i - 1]:
            continue
        streak = streak + 1 if arr[i] == arr[i - 1] + 1 else 1
        best = max(best, streak)
    return best`,
          },
        },
        {
          tier: 'optimal',
          label: 'Optimal (HashSet Sequence-Head Filtering)',
          summary: 'Insert all numbers into a HashSet and only walk upward from true heads where (num - 1) is absent.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          stepByStepExplanation: [
            'Insert all values into a HashSet (automatically deduplicating).',
            'Iterate over unique values in the set (not the raw array with duplicates!).',
            'If !set.contains(num - 1), expand curr = num, num + 1, ... and update best.',
          ],
          code: {
            java: `import java.util.HashSet;
import java.util.Set;

public class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) set.add(num);
        int best = 0;
        for (int num : set) {
            if (!set.contains(num - 1)) {
                int curr = num;
                while (set.contains(curr + 1)) {
                    curr++;
                }
                best = Math.max(best, curr - num + 1);
            }
        }
        return best;
    }
}`,
            javascript: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const num of set) {
    if (!set.has(num - 1)) {
      let curr = num;
      while (set.has(curr + 1)) curr++;
      best = Math.max(best, curr - num + 1);
    }
  }
  return best;
}`,
            python: `def longest_consecutive(nums: list[int]) -> int:
    seen = set(nums)
    best = 0
    for num in seen:
        if (num - 1) not in seen:
            curr = num
            while (curr + 1) in seen:
                curr += 1
            best = max(best, curr - num + 1)
    return best`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'Every maximal consecutive interval [L..R] has a unique left endpoint L with (L - 1) not in set.',
        initialization: 'best = 0 holds for an empty set of evaluated intervals.',
        maintenance: 'Each maximal interval [L..R] is walked exactly once when iterating num = L, updating best = max(best, R - L + 1).',
        termination: 'After checking every unique element in set, best equals the maximum length over all maximal intervals.',
      },
      complexityAnalysis: {
        time: 'O(n)',
        timeJustification: 'Building the set is O(n), and every element enters the inner while loop at most once across all iterations.',
        space: 'O(n)',
        spaceJustification: 'The HashSet holds at most n distinct integers.',
      },
      edgeCases: [
        { caseTitle: 'Empty array', inputExample: 'nums = []', expectedBehavior: 'Returns 0.' },
        { caseTitle: 'Heavy duplicates of sequence head', inputExample: 'nums = [1, 1, 1, 2, 3]', expectedBehavior: 'Iterating over the Set (not raw array) keeps runtime O(n).' },
        { caseTitle: 'Negative consecutive values', inputExample: 'nums = [-2, -3, -1, 5]', expectedBehavior: 'Returns 3 for [-3, -2, -1].' },
      ],
      commonMistakes: [
        { mistake: 'Iterating over raw nums instead of the deduplicated Set', whyItFails: 'If the smallest element of a length-n chain repeats n/2 times, it re-walks the chain O(n²) times!', fix: 'Always iterate `for (const num of set)`.' },
      ],
    },
    testSuite: {
      id: 'ts-hm-longest-consecutive',
      entryFunctionName: { java: 'longestConsecutive', javascript: 'longestConsecutive', python: 'longest_consecutive' },
      comparator: 'exact',
      cases: [
        { id: 'c1', name: 'Classic unsorted', args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
        { id: 'c2', name: 'Duplicates inside sequence', args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9, isEdgeCase: true },
        { id: 'c3', name: 'Empty input', args: [[]], expected: 0, isBoundary: true },
        { id: 'c4', name: 'Negative sequence', args: [[-2, -3, -1, 10]], expected: 3, isEdgeCase: true },
        { id: 'c5', name: 'Single element', args: [[42]], expected: 1, isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
    patternRecognitionPrompt: {
      id: 'pr-hm-longest-consecutive',
      problemTitle: 'Longest Consecutive Sequence',
      problemExcerpt: 'Given an unsorted integer array nums (n <= 10^5), find the longest consecutive run x, x+1, x+2, ... in strict O(n) time.',
      constraintsSummary: 'n <= 10^5 · Unsorted · O(n) time required',
      criteria: [
        {
          criterion: 'structuralUnderstanding',
          label: 'Structural Understanding',
          weight: 20,
          question: 'What structural property defines the starting element of any maximal consecutive chain?',
          options: [
            { id: 'a', label: 'A value x starts a chain iff (x - 1) is absent from the dataset', isCorrect: true, rationale: 'Every chain has exactly one minimum element whose predecessor is missing.' },
            { id: 'b', label: 'A value x starts a chain iff it appears at index 0', isCorrect: false, rationale: 'The array is unsorted; index order has no relationship to numeric order.' },
          ],
        },
        {
          criterion: 'patternIdentification',
          label: 'Pattern Identification',
          weight: 25,
          question: 'Which primary pattern satisfies the strict O(n) time requirement on unsorted integers?',
          options: [
            { id: 'a', label: 'HashSet O(1) Membership + Head-Only Expansion', isCorrect: true, rationale: 'HashSet membership avoids O(n log n) sorting while expanding each element at most once.' },
            { id: 'b', label: 'Sorting + Two Pointers', isCorrect: false, rationale: 'Sorting costs O(n log n), violating the O(n) time constraint.' },
            { id: 'c', label: 'Binary Search on Answer', isCorrect: false, rationale: 'There is no monotonic predicate over unsorted elements without hashing or sorting.' },
          ],
        },
        {
          criterion: 'dataStructureSelection',
          label: 'Data Structure Selection',
          weight: 15,
          question: 'Which data structure is most appropriate here?',
          options: [
            { id: 'a', label: 'HashSet (only membership matters, no key-value metadata needed)', isCorrect: true, rationale: 'We only query existence of (x - 1) and (x + 1), and deduplication is free.' },
            { id: 'b', label: 'Min-Heap / Priority Queue', isCorrect: false, rationale: 'Popping all elements from a heap costs O(n log n).' },
          ],
        },
        {
          criterion: 'constraintReasoning',
          label: 'Constraint Reasoning',
          weight: 15,
          question: 'Why must we iterate over the HashSet instead of the original nums array?',
          options: [
            { id: 'a', label: 'Duplicate copies of a sequence head would trigger repeated chain walks, degrading to O(n²)', isCorrect: true, rationale: 'Iterating over unique keys ensures each head expands once.' },
            { id: 'b', label: 'HashSet automatically sorts the numbers in ascending order', isCorrect: false, rationale: 'HashSet does not sort elements; deduplication is the reason.' },
          ],
        },
        {
          criterion: 'complexityAnalysis',
          label: 'Complexity Analysis',
          weight: 15,
          question: 'What are the amortized time and auxiliary space complexities of the optimal approach?',
          options: [
            { id: 'a', label: 'O(n) time, O(n) space', isCorrect: true, rationale: 'Each unique element is checked at most twice overall.' },
            { id: 'b', label: 'O(n²) time, O(n) space because of the nested while loop', isCorrect: false, rationale: 'Amortized analysis counts total while-loop steps across the entire run (<= n).' },
          ],
        },
        {
          criterion: 'alternativeApproachEvaluation',
          label: 'Alternative Approach Evaluation',
          weight: 10,
          question: 'When would sorting in O(n log n) actually be preferred over the HashSet approach?',
          options: [
            { id: 'a', label: 'When O(1) extra memory is strictly required and in-place mutation of nums is allowed', isCorrect: true, rationale: 'In-place sorting trades an extra log n time factor to avoid O(n) hash table memory.' },
            { id: 'b', label: 'Whenever negative numbers appear in the input', isCorrect: false, rationale: 'HashSet handles negative integers identically to positive integers.' },
          ],
        },
      ],
    },
  },
  {
    id: 'prob-hm-debug-subarray',
    topicId: 'hashmap-hashset-lookup',
    slug: 'two-sum-debug-challenge',
    title: 'Debug Challenge: Broken Complement Lookup',
    difficulty: 'Medium',
    category: 'debugging',
    hidePatternUntilSolved: false,
    problemStatement:
      'The code below attempts to solve Two Sum in one pass, but it contains TWO subtle HashMap bugs: it inserts before checking (causing self-pairing on [3, 2, 4], target = 6) and uses a truthy check that breaks when index 0 is the match! Fix the code so all 5 test cases pass.',
    examples: [
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'Buggy code wrongly returns [0, 0].' },
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Buggy truthy check treats index 0 as falsy!' },
    ],
    constraints: ['Must remain O(n) time using Map'],
    hints: [
      'Check `seen.has(complement)` instead of `if (seen.get(complement))` because index `0` is falsy in JavaScript!',
      'Move `seen.set(nums[i], i)` AFTER the complement check.',
    ],
    starterCodeJs: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    // BUG 1: inserting before checking allows self-pairing\n    seen.set(nums[i], i);\n    const complement = target - nums[i];\n    // BUG 2: index 0 is falsy in JS!\n    if (seen.get(complement)) {\n      return [seen.get(complement), i];\n    }\n  }\n  return [];\n}`,
    buggyCodeJs: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    // BUG 1: inserting before checking allows self-pairing\n    seen.set(nums[i], i);\n    const complement = target - nums[i];\n    // BUG 2: index 0 is falsy in JS!\n    if (seen.get(complement)) {\n      return [seen.get(complement), i];\n    }\n  }\n  return [];\n}`,
    bugDescription: 'Combines two classic interview bugs: insert-before-lookup (self-match) and truthiness check on index 0.',
    solution: {
      problemId: 'prob-hm-debug-subarray',
      variants: [
        {
          tier: 'optimal',
          label: 'Fixed One-Pass HashMap',
          summary: 'Check seen.has(complement) before calling seen.set(nums[i], i).',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          stepByStepExplanation: [
            'Use seen.has(complement) so index 0 is never dropped as falsy.',
            'Call seen.set(nums[i], i) strictly after checking seen.has(complement).',
          ],
          code: {
            java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
            javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
            python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, val in enumerate(nums):
        comp = target - val
        if comp in seen:
            return [seen[comp], i]
        seen[val] = i
    return []`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'seen contains only indices strictly less than i, and key presence is tested explicitly via .has().',
        initialization: 'Empty Map at i = 0.',
        maintenance: 'Explicit .has() handles index 0 safely; post-check insertion prevents self-pairing.',
        termination: 'Returns earliest valid pair or [].',
      },
      complexityAnalysis: {
        time: 'O(n)',
        timeJustification: 'Single pass with O(1) map operations.',
        space: 'O(n)',
        spaceJustification: 'Stores up to n elements.',
      },
      edgeCases: [
        { caseTitle: 'Index 0 in result', inputExample: '[2, 7, 11], target = 9', expectedBehavior: 'Returns [0, 1].' },
        { caseTitle: 'Half-target at index 0', inputExample: '[3, 2, 4], target = 6', expectedBehavior: 'Returns [1, 2].' },
      ],
      commonMistakes: [
        { mistake: 'Using `if (seen.get(k))`', whyItFails: 'Returns false when stored index is 0.', fix: 'Use `if (seen.has(k))` or `!== undefined`.' },
      ],
    },
    testSuite: {
      id: 'ts-hm-debug',
      entryFunctionName: { java: 'twoSum', javascript: 'twoSum', python: 'two_sum' },
      comparator: 'exact',
      cases: [
        { id: 'd1', name: 'Index 0 match (falsy guard)', args: [[2, 7, 11, 15], 9], expected: [0, 1], isEdgeCase: true },
        { id: 'd2', name: 'Self-pair guard', args: [[3, 2, 4], 6], expected: [1, 2], isEdgeCase: true },
        { id: 'd3', name: 'Duplicate pair', args: [[3, 3], 6], expected: [0, 1], isEdgeCase: true },
        { id: 'd4', name: 'Negatives', args: [[-10, 4, 10], 0], expected: [0, 2], isBoundary: true },
        { id: 'd5', name: 'No match', args: [[1, 5, 9], 20], expected: [], isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
  },
  {
    id: 'prob-hm-mixed-subarray-sum-k',
    topicId: 'hashmap-hashset-lookup',
    slug: 'subarray-sum-equals-k',
    title: 'Mixed Pattern: Subarray Sum Equals K (HashMap + Prefix Sum)',
    difficulty: 'Hard',
    category: 'mixed-pattern',
    hidePatternUntilSolved: true,
    problemStatement:
      'Given an array of integers nums (which may include negative numbers and zeroes) and an integer k, return the total number of contiguous subarrays whose sum equals k.',
    examples: [
      { input: 'nums = [1, 1, 1], k = 2', output: '2', explanation: 'Subarrays [1,1] at indices [0..1] and [1..2].' },
      { input: 'nums = [1, -1, 0], k = 0', output: '3', explanation: '[1,-1], [0], and [1,-1,0] all sum to 0.' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000'],
    hints: [
      'Why does Sliding Window fail here? Negative numbers break monotonicity!',
      'Track running prefixSum and store how many times each prefixSum has occurred (seeded with {0: 1}).',
    ],
    starterCodeJs: `function subarraySum(nums, k) {\n  const freq = new Map([[0, 1]]);\n  let prefix = 0;\n  let count = 0;\n  for (const num of nums) {\n    prefix += num;\n    count += freq.get(prefix - k) ?? 0;\n    freq.set(prefix, (freq.get(prefix) ?? 0) + 1);\n  }\n  return count;\n}`,
    solution: {
      problemId: 'prob-hm-mixed-subarray-sum-k',
      variants: [
        {
          tier: 'optimal',
          label: 'Optimal (Prefix Sum + Frequency HashMap)',
          summary: 'Count prior prefix sums equal to prefix - k using a HashMap seeded with {0: 1}.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          stepByStepExplanation: [
            'Seed frequency map with prefix sum 0 having count 1 (empty prefix).',
            'As each number is added to prefix, add freq[prefix - k] to count.',
            'Increment freq[prefix] after querying so k = 0 does not self-count the empty subarray.',
          ],
          code: {
            java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        freq.put(0, 1);
        int prefix = 0, count = 0;
        for (int num : nums) {
            prefix += num;
            count += freq.getOrDefault(prefix - k, 0);
            freq.merge(prefix, 1, Integer::sum);
        }
        return count;
    }
}`,
            javascript: `function subarraySum(nums, k) {
  const freq = new Map([[0, 1]]);
  let prefix = 0;
  let count = 0;
  for (const num of nums) {
    prefix += num;
    count += freq.get(prefix - k) ?? 0;
    freq.set(prefix, (freq.get(prefix) ?? 0) + 1);
  }
  return count;
}`,
            python: `def subarray_sum(nums: list[int], k: int) -> int:
    freq: dict[int, int] = {0: 1}
    prefix = 0
    count = 0
    for num in nums:
        prefix += num
        count += freq.get(prefix - k, 0)
        freq[prefix] = freq.get(prefix, 0) + 1
    return count`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'Before updating freq at index i, freq[s] equals the exact number of prefixes [0..j] (including empty prefix j = -1) with sum s.',
        initialization: 'Empty prefix has sum 0, so freq = {0: 1} is exact before index 0.',
        maintenance: 'Every subarray (j..i] has sum prefix[i] - prefix[j] == k iff prefix[j] == prefix[i] - k.',
        termination: 'Summing matches over all end indices i counts every valid contiguous subarray exactly once.',
      },
      complexityAnalysis: {
        time: 'O(n)',
        timeJustification: 'One linear scan with O(1) HashMap operations.',
        space: 'O(n)',
        spaceJustification: 'Up to n + 1 distinct prefix sums stored in freq.',
      },
      edgeCases: [
        { caseTitle: 'k = 0 with zeroes and negatives', inputExample: 'nums = [1, -1, 0], k = 0', expectedBehavior: 'Returns 3.' },
        { caseTitle: 'Whole prefix equals k', inputExample: 'nums = [5], k = 5', expectedBehavior: 'Seed {0: 1} catches prefix - k = 0 and returns 1.' },
      ],
      commonMistakes: [
        { mistake: 'Forgetting to seed freq with {0: 1}', whyItFails: 'Misses every valid subarray starting at index 0.', fix: 'Always initialize freq = new Map([[0, 1]]).' },
      ],
    },
    testSuite: {
      id: 'ts-hm-subarray-k',
      entryFunctionName: { java: 'subarraySum', javascript: 'subarraySum', python: 'subarray_sum' },
      comparator: 'exact',
      cases: [
        { id: 'm1', name: 'Positive ones', args: [[1, 1, 1], 2], expected: 2 },
        { id: 'm2', name: 'Negatives and zero', args: [[1, -1, 0], 0], expected: 3, isEdgeCase: true },
        { id: 'm3', name: 'Single match at index 0', args: [[5], 5], expected: 1, isBoundary: true },
        { id: 'm4', name: 'No valid subarray', args: [[1, 2, 3], 7], expected: 0, isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
  },
];

const HASHMAP_ASSESSMENTS: CanonicalAssessment[] = [
  {
    id: 'assess-hm-transfer',
    topicId: 'hashmap-hashset-lookup',
    title: 'Unseen Transfer & Complexity Assessment — HashMap & HashSet',
    kind: 'unseen-transfer',
    passingScorePct: 80,
    questions: [
      {
        id: 'hm-q1',
        objectiveId: 'obj-hm-5',
        dimension: 'transferAbility',
        prompt: 'An API gateway logs 500,000 request IDs per minute and must flag the first duplicate request ID arriving in real time. Which approach is optimal?',
        options: [
          { id: 'a', label: 'Maintain a HashSet of seen request IDs; if !set.add(id), flag duplicate in O(1) amortized time', isCorrect: true, explanation: 'Real-time streaming duplicate detection is a classic O(1) HashSet membership transfer.' },
          { id: 'b', label: 'Re-sort the request ID list after every incoming request and binary search', isCorrect: false, explanation: 'Re-sorting on every arrival would cost O(n² log n).' },
        ],
      },
      {
        id: 'hm-q2',
        objectiveId: 'obj-hm-1',
        dimension: 'complexityAnalysis',
        prompt: 'You group N strings of maximum length K into anagram buckets using a 26-letter frequency count signature instead of sorting each string. What is the improved time complexity?',
        options: [
          { id: 'a', label: 'O(N · K) instead of O(N · K log K)', isCorrect: true, explanation: 'Counting characters into a fixed 26-bucket signature avoids sorting each string.' },
          { id: 'b', label: 'O(N) independent of string length K', isCorrect: false, explanation: 'Every character of every string must still be inspected at least once: O(N · K).' },
        ],
      },
      {
        id: 'hm-q3',
        objectiveId: 'obj-hm-4',
        dimension: 'correctness',
        prompt: 'In Subarray Sum Equals K with negative integers, why must we initialize `freq.set(0, 1)` before scanning?',
        options: [
          { id: 'a', label: 'So any valid subarray starting at index 0 (where prefix == k) finds prefix - k = 0 in the map', isCorrect: true, explanation: 'The empty prefix before index 0 has sum 0 and occurs once.' },
          { id: 'b', label: 'Because JavaScript Maps throw an error when initialized empty', isCorrect: false, explanation: 'Empty Maps are valid; {0: 1} encodes the mathematical empty-prefix base case.' },
        ],
      },
      {
        id: 'hm-q4',
        objectiveId: 'obj-hm-5',
        dimension: 'transferAbility',
        prompt: 'You must find the Kth smallest element in a continuously changing stream AND support range queries [L, R]. Should you pick a HashMap?',
        options: [
          { id: 'a', label: 'No — HashMaps do not preserve sorted order; use a balanced BST / TreeMap or Heap depending on operations', isCorrect: true, explanation: 'Recognizing when NOT to use a pattern is essential evidence of mastery.' },
          { id: 'b', label: 'Yes — HashMap supports O(1) range queries [L, R]', isCorrect: false, explanation: 'Hash tables scatter keys uniformly and cannot execute ordered range queries in O(1).' },
        ],
      },
    ],
  },
];

// ============================================================================
// PILOT 2: SLIDING WINDOW (dynamic-sliding-window)
// ============================================================================

const SLIDING_WINDOW_OBJECTIVES: LearningObjective[] = [
  {
    id: 'obj-sw-1',
    statement: 'Distinguish Fixed-Size vs. Variable-Size Sliding Windows and verify the monotonicity precondition before applying them.',
    stage: 'understand',
    dimension: 'understanding',
  },
  {
    id: 'obj-sw-2',
    statement: 'Trace monotonic left/right pointer movement, O(1) window deltas, and shrink-while-invalid/valid invariants.',
    stage: 'visualize',
    dimension: 'visualization',
  },
  {
    id: 'obj-sw-3',
    statement: 'Implement brute-force, better, and optimal O(n) Sliding Window algorithms in Java 21, JavaScript, and Python 3.12.',
    stage: 'implement',
    dimension: 'implementation',
  },
  {
    id: 'obj-sw-4',
    statement: 'Identify monotonicity violations (negative numbers) and backward-left pointer bugs during practice and debugging.',
    stage: 'practice',
    dimension: 'debugging',
  },
  {
    id: 'obj-sw-5',
    statement: 'Apply Sliding Window recognition independently to unfamiliar rate-limiting, telemetry, and string-window problems.',
    stage: 'master',
    dimension: 'transferAbility',
  },
];

const SLIDING_WINDOW_UNDERSTAND: UnderstandStageContent = {
  whatIsPattern:
    'Sliding Window maintains a contiguous range [left..right] over an array or string, updating window state incrementally in O(1) as right expands and left contracts monotonically.',
  whyItExists:
    'Checking all O(n²) contiguous subarrays or substrings wastes work by recomputing overlapping interiors from scratch. Sliding Window reuses the overlap between adjacent windows.',
  problemItSolves:
    'Solves longest/shortest/optimal contiguous subarray or substring problems in O(n) time whenever window validity behaves monotonically as edges move.',
  whenToUse: [
    'Problem asks for a contiguous subarray or substring (never a non-contiguous subsequence).',
    'Fixed window length k (add incoming nums[r], remove outgoing nums[r - k]).',
    'Variable window where expanding right monotonically moves toward or away from validity (unique characters, at most k distinct, sum >= target with positive integers).',
  ],
  whenNotToUse: [
    'Subarray sum problems containing negative numbers (expanding/shrinking no longer changes sum monotonically — use Prefix Sum + HashMap or Monotonic Deque).',
    'Problems asking for non-contiguous subsequences (use Dynamic Programming or Greedy).',
  ],
  advantages: [
    'Reduces O(n²) or O(n·k) subarray scans to O(n) amortized time because left and right each advance at most n times.',
    'Often achieves O(1) or O(alphabet) space.',
  ],
  limitations: [
    'Strictly depends on monotonicity; breaks silently if negative numbers invalidate the shrink decision.',
    'Off-by-one errors between inclusive [left..right] length (right - left + 1) and stale map indices are common traps.',
  ],
  realWorldAnalogy: {
    title: 'Train Window Moving Past a Billboard',
    narrative:
      'As a train window glides forward past mile markers, you do not recount every marker inside the frame from scratch — you only note the one marker entering on the right and the one leaving on the left.',
    mappingToAlgorithm:
      'Entering on the right is `right++` updating state; leaving on the left is `left++` removing state; the frame width `right - left + 1` is the active contiguous range.',
  },
  simpleExample: {
    id: 'sw-ex-simple',
    title: 'Longest Substring Without Repeating Characters',
    problemStatement: 'Given a string s, find the length of the longest contiguous substring without repeating characters.',
    input: 's = "abcabcbb"',
    output: '3 ("abc")',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols, and spaces'],
    walkthrough: [
      'right = 0..2 ("abc"): all unique, bestLen = 3.',
      'right = 3 ("a"): duplicate "a" was last seen at index 0 >= left (0) → jump left to 1. Window is "bca" (len 3).',
      'Continue until right reaches end; left never moves backward.',
    ],
    keyObservation:
      'Always use `left = Math.max(left, lastSeen.get(ch) + 1)` so a stale character seen BEFORE the current left pointer never pulls left backward!',
  },
  conceptualExamples: [
    {
      id: 'sw-ex-1',
      title: 'The Stale-Index Trap: s = "abba"',
      problemStatement: 'Trace why `left = Math.max(left, prev + 1)` is non-negotiable.',
      input: 's = "abba"',
      output: '2 ("ab" or "ba")',
      constraints: ['All ASCII characters possible'],
      walkthrough: [
        'right = 0 ("a"): left = 0, lastSeen = {a: 0}, len = 1.',
        'right = 1 ("b"): left = 0, lastSeen = {a: 0, b: 1}, len = 2.',
        'right = 2 ("b"): duplicate b at 1 → left jumps to 2.',
        'right = 3 ("a"): lastSeen["a"] = 0 < left (2)! Without Math.max, left would jump BACKWARD to 1 and falsely include two "b"s!',
      ],
      keyObservation: 'Monotonicity requires left to ONLY move right: `left = Math.max(left, lastSeen[ch] + 1)`.',
    },
    {
      id: 'sw-ex-2',
      title: 'Fixed Window vs. Variable Window Mental Switch',
      problemStatement: 'Recognize the two structural templates of Sliding Window.',
      input: 'Fixed: max average of length k | Variable: min length with sum >= target (positive nums)',
      output: 'O(n) single pass for both',
      constraints: ['Contiguous ranges only'],
      walkthrough: [
        'Fixed size k: once right >= k - 1, record answer and subtract nums[right - k + 1] before next slide.',
        'Variable size: expand right, then `while (invalid)` or `while (valid)` contract left until boundary restores invariant.',
      ],
      keyObservation: 'Even with an inner `while` loop, `left` only increments from 0 to n — total inner iterations across the entire run are <= n, proving O(n).',
    },
  ],
  bruteForceComparisons: [
    {
      id: 'sw-bf-1',
      title: 'Longest Unique Substring: All Substrings vs. Sliding Window',
      bruteApproach: 'Enumerate every start i and end j (O(n²)), checking uniqueness with a Set (O(n) per pair -> O(n³), or O(n²) with incremental Set).',
      bruteTime: 'O(n²)',
      bruteSpace: 'O(min(n, Σ))',
      bottleneck: 'When a duplicate appears at j, restarting j from i + 1 re-scans the already verified unique segment [i+1..j-1].',
      optimizedApproach: 'Keep [left..right] unique and advance left directly past the conflicting duplicate index.',
      optimizedTime: 'O(n)',
      optimizedSpace: 'O(min(n, Σ))',
      whyBetter: 'Each character enters and leaves the window at most once: 50,000 steps instead of ~1.25 billion.',
    },
    {
      id: 'sw-bf-2',
      title: 'Max Average Subarray of Size k: Re-summing vs. Delta Update',
      bruteApproach: 'For each of the n - k + 1 windows, loop k times to sum its elements.',
      bruteTime: 'O(n · k)',
      bruteSpace: 'O(1)',
      bottleneck: 'Adjacent windows share k - 1 identical elements that get re-added on every shift.',
      optimizedApproach: 'Compute first window sum once, then update `sum += nums[r] - nums[r - k]` in O(1).',
      optimizedTime: 'O(n)',
      optimizedSpace: 'O(1)',
      whyBetter: 'Drops from O(n · k) to strictly O(n) regardless of how large k is.',
    },
  ],
  importantObservations: [
    'Sliding Window requires TWO guarantees: (1) contiguous slice, and (2) monotonic validity when expanding/shrinking.',
    'Use inclusive bounds `[left..right]` so window length is consistently `right - left + 1`.',
    'Never let `left` move backward when jumping using a last-seen index map (`left = Math.max(left, prev + 1)`).',
  ],
  commonMisconceptions: [
    {
      misconception: 'Sliding Window works for any contiguous subarray sum problem.',
      correction:
        'False! If the array can contain negative numbers, shrinking `left` can increase the sum, destroying monotonicity. Use Prefix Sum + HashMap (for exact sum k) or Prefix Sum + Monotonic Deque (for shortest subarray with sum >= k).',
    },
    {
      misconception: 'An inner `while` loop inside `for (right = 0..n-1)` makes Sliding Window O(n²).',
      correction:
        'Because `left` starts at 0, never decreases, and stops at <= n, the inner `while` body executes at most n times TOTAL across the entire algorithm — O(2n) = O(n).',
    },
  ],
  conceptCheck: {
    id: 'sw-concept-check',
    prompt: 'Why does standard Sliding Window FAIL on finding the shortest subarray with sum >= K when the array is [2, -1, 2] and K = 3?',
    options: [
      {
        id: 'non-monotonic',
        label: 'Negative numbers break monotonicity: shrinking left can increase the sum, so discarding a left boundary may miss a shorter valid subarray.',
        isCorrect: true,
        explanation: 'Correct! Sliding window monotonicity requires adding/removing elements to move the window metric predictably in one direction.',
      },
      {
        id: 'overflow',
        label: 'Negative numbers cause integer overflow in 32-bit counters.',
        isCorrect: false,
        explanation: 'Small negative numbers do not overflow; the failure is a broken monotonicity invariant.',
      },
    ],
  },
};

const SLIDING_WINDOW_PROBLEMS: CanonicalProblem[] = [
  {
    id: 'prob-sw-longest-unique',
    topicId: 'dynamic-sliding-window',
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'beginner',
    hidePatternUntilSolved: false,
    problemStatement:
      'Given a string s, return the length of the longest contiguous substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'Longest unique substring is "abc" with length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'Longest unique substring is "b".' },
      { input: 's = "abba"', output: '2', explanation: 'Tests the stale-index guard: left must not move backward on the final "a".' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 'ASCII characters'],
    hints: [
      'Track the last seen index of each character in a Map.',
      'Guard left with Math.max(left, lastSeen.get(ch) + 1) so stale entries outside the window are ignored.',
    ],
    starterCodeJs: `function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const ch = s[right];\n    if (lastSeen.has(ch)) {\n      left = Math.max(left, lastSeen.get(ch) + 1);\n    }\n    lastSeen.set(ch, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}`,
    solution: {
      problemId: 'prob-sw-longest-unique',
      variants: [
        {
          tier: 'brute',
          label: 'Brute Force (Scan From Every Start)',
          summary: 'For each starting index i, expand j until a duplicate character appears in a fresh Set.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(min(n, Σ))',
          stepByStepExplanation: ['Reset a HashSet at every start index i and extend j until a duplicate occurs.'],
          code: {
            java: `import java.util.HashSet;
import java.util.Set;

public class Solution {
    public int lengthOfLongestSubstringBrute(String s) {
        int best = 0;
        for (int i = 0; i < s.length(); i++) {
            Set<Character> seen = new HashSet<>();
            for (int j = i; j < s.length(); j++) {
                if (!seen.add(s.charAt(j))) break;
                best = Math.max(best, j - i + 1);
            }
        }
        return best;
    }
}`,
            javascript: `function lengthOfLongestSubstring(s) {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const seen = new Set();
    for (let j = i; j < s.length; j++) {
      if (seen.has(s[j])) break;
      seen.add(s[j]);
      best = Math.max(best, j - i + 1);
    }
  }
  return best;
}`,
            python: `def length_of_longest_substring_brute(s: str) -> int:
    best = 0
    for i in range(len(s)):
        seen: set[str] = set()
        for j in range(i, len(s)):
            if s[j] in seen:
                break
            seen.add(s[j])
            best = max(best, j - i + 1)
    return best`,
          },
        },
        {
          tier: 'better',
          label: 'Better (Shrink-One-By-One HashSet Window)',
          summary: 'Remove s[left++] one character at a time while s[right] is already in the Set.',
          timeComplexity: 'O(n) (up to 2n ops)',
          spaceComplexity: 'O(min(n, Σ))',
          stepByStepExplanation: ['Maintain active window characters in a Set; shrink left until duplicate is evicted.'],
          code: {
            java: `import java.util.HashSet;
import java.util.Set;

public class Solution {
    public int lengthOfLongestSubstringSet(String s) {
        Set<Character> window = new HashSet<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            while (window.contains(ch)) {
                window.remove(s.charAt(left++));
            }
            window.add(ch);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
            javascript: `function lengthOfLongestSubstring(s) {
  const window = new Set();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      window.delete(s[left++]);
    }
    window.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
            python: `def length_of_longest_substring_set(s: str) -> int:
    window: set[str] = set()
    left = best = 0
    for right, ch in enumerate(s):
        while ch in window:
            window.remove(s[left])
            left += 1
        window.add(ch)
        best = max(best, right - left + 1)
    return best`,
          },
        },
        {
          tier: 'optimal',
          label: 'Optimal (One-Pass Last-Seen Index Jump)',
          summary: 'Store last index per character and jump left directly to max(left, prev + 1) in O(1).',
          timeComplexity: 'O(n) (exact n steps)',
          spaceComplexity: 'O(min(n, Σ))',
          stepByStepExplanation: [
            'Track `lastSeen[ch]` = most recent index of `ch`.',
            'When `ch` was seen before, set `left = Math.max(left, lastSeen[ch] + 1)`.',
            'Update `lastSeen[ch] = right` and `best = Math.max(best, right - left + 1)`.',
          ],
          code: {
            java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            Integer prev = lastSeen.get(ch);
            if (prev != null && prev >= left) {
                left = prev + 1;
            }
            lastSeen.put(ch, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
            javascript: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch)) {
      left = Math.max(left, lastSeen.get(ch) + 1);
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
            python: `def length_of_longest_substring(s: str) -> int:
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'After each iteration right, [left..right] is the longest unique substring ending at index right.',
        initialization: 'Empty string yields best = 0; single character yields [0..0] of length 1.',
        maintenance: 'If s[right] appeared at prev >= left, no unique substring ending at right can start at or before prev, so left = prev + 1 is minimal and unique.',
        termination: 'Taking the maximum over all right from 0 to n - 1 returns the global longest unique substring.',
      },
      complexityAnalysis: {
        time: 'O(n)',
        timeJustification: 'Single loop of n iterations with O(1) map operations.',
        space: 'O(min(n, Σ))',
        spaceJustification: 'Map stores at most one entry per distinct character in the alphabet Σ.',
      },
      edgeCases: [
        { caseTitle: 'Empty string', inputExample: 's = ""', expectedBehavior: 'Returns 0.' },
        { caseTitle: 'Stale duplicate before left', inputExample: 's = "abba"', expectedBehavior: 'Returns 2 (not 3!).' },
        { caseTitle: 'All unique characters', inputExample: 's = "abcdef"', expectedBehavior: 'Returns 6.' },
      ],
      commonMistakes: [
        { mistake: 'Writing `left = lastSeen.get(ch) + 1` without `Math.max`', whyItFails: 'On "abba", when right = 3 ("a"), left jumps backward from 2 to 1, including duplicate "b"s.', fix: 'Use `left = Math.max(left, lastSeen.get(ch) + 1)`.' },
      ],
    },
    testSuite: {
      id: 'ts-sw-longest-unique',
      entryFunctionName: { java: 'lengthOfLongestSubstring', javascript: 'lengthOfLongestSubstring', python: 'length_of_longest_substring' },
      comparator: 'exact',
      cases: [
        { id: 's1', name: 'Repeating pattern', args: ['abcabcbb'], expected: 3 },
        { id: 's2', name: 'Stale-index trap ("abba")', args: ['abba'], expected: 2, isEdgeCase: true },
        { id: 's3', name: 'All identical', args: ['bbbbb'], expected: 1, isEdgeCase: true },
        { id: 's4', name: 'Empty string', args: [''], expected: 0, isBoundary: true },
        { id: 's5', name: 'Answer at trailing suffix', args: ['dvdf'], expected: 3, isEdgeCase: true },
      ],
    },
    verificationStatus: 'Published',
    patternRecognitionPrompt: {
      id: 'pr-sw-longest-unique',
      problemTitle: 'Longest Substring Without Repeating Characters',
      problemExcerpt: 'Given a string s (up to 50,000 chars), find the length of the longest contiguous substring containing no duplicate characters.',
      constraintsSummary: 'n <= 50,000 · Contiguous substring · Uniqueness constraint',
      criteria: [
        {
          criterion: 'structuralUnderstanding',
          label: 'Structural Understanding',
          weight: 20,
          question: 'Which two properties of the problem define its structure?',
          options: [
            { id: 'a', label: 'A contiguous substring requirement + a duplicate-character exclusion invariant over a changing range', isCorrect: true, rationale: 'Contiguity + dynamic range uniqueness are the textbook signals for Variable Sliding Window.' },
            { id: 'b', label: 'A non-contiguous subsequence requirement + shortest path weights', isCorrect: false, rationale: 'Substrings are strictly contiguous; non-contiguous subsequences cannot use a single window.' },
          ],
        },
        {
          criterion: 'patternIdentification',
          label: 'Pattern Identification',
          weight: 25,
          question: 'Which algorithmic pattern solves this optimally?',
          options: [
            { id: 'a', label: 'Variable-Size Sliding Window', isCorrect: true, rationale: 'Expand right, and advance left past any duplicate character in O(1).' },
            { id: 'b', label: 'Fixed-Size Sliding Window', isCorrect: false, rationale: 'The target substring length is unknown and varies dynamically.' },
            { id: 'c', label: 'Divide and Conquer Merge Sort', isCorrect: false, rationale: 'Sorting destroys character adjacency.' },
          ],
        },
        {
          criterion: 'dataStructureSelection',
          label: 'Data Structure Selection',
          weight: 15,
          question: 'Which auxiliary structure gives O(1) left-pointer jumping?',
          options: [
            { id: 'a', label: 'HashMap (char -> last seen index)', isCorrect: true, rationale: 'Storing last seen index lets left jump directly to prev + 1 without shrinking step-by-step.' },
            { id: 'b', label: 'Min-Heap', isCorrect: false, rationale: 'A heap cannot query whether a specific character exists in O(1).' },
          ],
        },
        {
          criterion: 'constraintReasoning',
          label: 'Constraint Reasoning',
          weight: 15,
          question: 'With n <= 5 × 10^4, what complexity budget is required and why?',
          options: [
            { id: 'a', label: 'O(n) or O(n log n); O(n²) requires ~2.5 × 10^9 operations and risks timeout', isCorrect: true, rationale: 'Linear O(n) executes in ~50,000 operations (sub-millisecond).' },
            { id: 'b', label: 'O(n³) is safe because alphabet size is small', isCorrect: false, rationale: 'O(n³) would exceed 10^13 operations.' },
          ],
        },
        {
          criterion: 'complexityAnalysis',
          label: 'Complexity Analysis',
          weight: 15,
          question: 'What is the time and space complexity of the optimal Sliding Window solution?',
          options: [
            { id: 'a', label: 'O(n) time, O(min(n, Σ)) space where Σ is alphabet size', isCorrect: true, rationale: 'Right visits each index once, and map size is bounded by both n and alphabet size.' },
            { id: 'b', label: 'O(n log n) time, O(n²) space', isCorrect: false, rationale: 'No sorting or 2D table is used.' },
          ],
        },
        {
          criterion: 'alternativeApproachEvaluation',
          label: 'Alternative Approach Evaluation',
          weight: 10,
          question: 'Why is the Last-Seen HashMap jump strictly better than the HashSet shrink-one-by-one approach?',
          options: [
            { id: 'a', label: 'Both are O(n), but HashMap performs exactly n loop steps instead of up to 2n character removals', isCorrect: true, rationale: 'Jumping left directly avoids re-visiting intermediate characters when evicting a duplicate.' },
            { id: 'b', label: 'HashSet cannot solve the problem in O(n)', isCorrect: false, rationale: 'HashSet shrink-while-duplicate is also O(n), just with up to 2n operations.' },
          ],
        },
      ],
    },
  },
  {
    id: 'prob-sw-min-subarray',
    topicId: 'dynamic-sliding-window',
    slug: 'minimum-size-subarray-sum',
    title: 'Minimum Size Subarray Sum',
    difficulty: 'Medium',
    category: 'intermediate',
    hidePatternUntilSolved: true,
    problemStatement:
      'Given an array of positive integers nums and a positive integer target, return the minimal length of a contiguous subarray whose sum is greater than or equal to target. Return 0 if no such subarray exists.',
    examples: [
      { input: 'target = 7, nums = [2, 3, 1, 2, 4, 3]', output: '2', explanation: 'Subarray [4, 3] has minimal length 2 with sum 7.' },
      { input: 'target = 11, nums = [1, 1, 1, 1]', output: '0', explanation: 'Total sum is 4 < 11.' },
    ],
    constraints: ['1 <= target <= 10^9', '1 <= nums.length <= 10^5', '1 <= nums[i] <= 10^4 (strictly positive)'],
    hints: [
      'Because every element is strictly positive, expanding right increases sum and shrinking left decreases sum.',
      'Shrink left inside a while (windowSum >= target) loop and record right - left + 1 before removing nums[left].',
    ],
    starterCodeJs: `function minSubArrayLen(target, nums) {\n  let left = 0;\n  let windowSum = 0;\n  let best = Infinity;\n  for (let right = 0; right < nums.length; right++) {\n    windowSum += nums[right];\n    while (windowSum >= target) {\n      best = Math.min(best, right - left + 1);\n      windowSum -= nums[left++];\n    }\n  }\n  return best === Infinity ? 0 : best;\n}`,
    solution: {
      problemId: 'prob-sw-min-subarray',
      variants: [
        {
          tier: 'optimal',
          label: 'Optimal (Expand-Until-Valid, Shrink-While-Valid)',
          summary: 'Expand right to reach target, then shrink left greedily while sum >= target.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          stepByStepExplanation: [
            'Add nums[right] to windowSum.',
            'While windowSum >= target, update best = min(best, right - left + 1) and subtract nums[left++].',
            'Return 0 if best was never updated.',
          ],
          code: {
            java: `public class Solution {
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0, windowSum = 0;
        int best = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            windowSum += nums[right];
            while (windowSum >= target) {
                best = Math.min(best, right - left + 1);
                windowSum -= nums[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}`,
            javascript: `function minSubArrayLen(target, nums) {
  let left = 0;
  let windowSum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    while (windowSum >= target) {
      best = Math.min(best, right - left + 1);
      windowSum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}`,
            python: `def min_sub_array_len(target: int, nums: list[int]) -> int:
    left = 0
    window_sum = 0
    best = len(nums) + 1
    for right, num in enumerate(nums):
        window_sum += num
        while window_sum >= target:
            best = min(best, right - left + 1)
            window_sum -= nums[left]
            left += 1
    return 0 if best == len(nums) + 1 else best`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'For every right, the while loop examines the shortest valid window ending at right, and positive values ensure discarded left positions cannot yield shorter windows later.',
        initialization: 'windowSum = 0, best = ∞.',
        maintenance: 'Shrinking while valid finds the exact tightest left for the current right.',
        termination: 'Returns minimum over all valid windows or 0 if none existed.',
      },
      complexityAnalysis: {
        time: 'O(n)',
        timeJustification: 'Both left and right move forward at most n times.',
        space: 'O(1)',
        spaceJustification: 'Uses only three integer scalars.',
      },
      edgeCases: [
        { caseTitle: 'Single element >= target', inputExample: 'target = 4, nums = [1, 4, 4]', expectedBehavior: 'Returns 1.' },
        { caseTitle: 'Unreachable target', inputExample: 'target = 100, nums = [1, 2, 3]', expectedBehavior: 'Returns 0.' },
      ],
      commonMistakes: [
        { mistake: 'Returning Infinity instead of 0 when unreachable', whyItFails: 'Fails boundary case when total sum < target.', fix: 'Check sentinel before returning.' },
      ],
    },
    testSuite: {
      id: 'ts-sw-min-subarray',
      entryFunctionName: { java: 'minSubArrayLen', javascript: 'minSubArrayLen', python: 'min_sub_array_len' },
      comparator: 'exact',
      cases: [
        { id: 'm1', name: 'Classic positive array', args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
        { id: 'm2', name: 'Single element match', args: [4, [1, 4, 4]], expected: 1, isEdgeCase: true },
        { id: 'm3', name: 'Unreachable target', args: [11, [1, 1, 1, 1, 1]], expected: 0, isBoundary: true },
        { id: 'm4', name: 'Entire array required', args: [15, [1, 2, 3, 4, 5]], expected: 5, isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
  },
  {
    id: 'prob-sw-debug-stale-left',
    topicId: 'dynamic-sliding-window',
    slug: 'sliding-window-debug-stale-left',
    title: 'Debug Challenge: Backward Left-Pointer Regression',
    difficulty: 'Medium',
    category: 'debugging',
    hidePatternUntilSolved: false,
    problemStatement:
      'The implementation below passes "abcabcbb" and "bbbbb" — yet FAILS on "abba" by returning 3 instead of 2! Diagnose why left moves backward and fix the invariant violation.',
    examples: [
      { input: 's = "abba"', output: '2', explanation: 'Buggy code moves left backward from 2 to 1 when seeing the second "a".' },
    ],
    constraints: ['Must remain O(n) single-pass'],
    hints: [
      'Inspect `left = lastSeen.get(ch) + 1;` when `lastSeen.get(ch)` is smaller than the current `left`.',
      'Wrap the assignment with `Math.max(left, lastSeen.get(ch) + 1)`.',
    ],
    starterCodeJs: `function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const ch = s[right];\n    if (lastSeen.has(ch)) {\n      // BUG: stale index outside current window pulls left backward!\n      left = lastSeen.get(ch) + 1;\n    }\n    lastSeen.set(ch, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}`,
    buggyCodeJs: `function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const ch = s[right];\n    if (lastSeen.has(ch)) {\n      // BUG: stale index outside current window pulls left backward!\n      left = lastSeen.get(ch) + 1;\n    }\n    lastSeen.set(ch, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}`,
    bugDescription: 'Missing Math.max guard lets stale map entries from before `left` pull `left` backward.',
    solution: {
      problemId: 'prob-sw-debug-stale-left',
      variants: [
        {
          tier: 'optimal',
          label: 'Fixed Monotonic Left Pointer',
          summary: 'Guard left with Math.max(left, lastSeen.get(ch) + 1).',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(min(n, Σ))',
          stepByStepExplanation: ['Ensure left is monotonically non-decreasing via Math.max.'],
          code: {
            java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (lastSeen.containsKey(ch)) {
                left = Math.max(left, lastSeen.get(ch) + 1);
            }
            lastSeen.put(ch, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
            javascript: `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch)) {
      left = Math.max(left, lastSeen.get(ch) + 1);
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
            python: `def length_of_longest_substring(s: str) -> int:
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen:
            left = max(left, last_seen[ch] + 1)
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'left is monotonically non-decreasing across all iterations.',
        initialization: 'left = 0.',
        maintenance: 'Math.max(left, prev + 1) guarantees left >= old left.',
        termination: 'Window never contains duplicates.',
      },
      complexityAnalysis: { time: 'O(n)', timeJustification: 'Single pass.', space: 'O(min(n, Σ))', spaceJustification: 'Character map.' },
      edgeCases: [{ caseTitle: 'Palindrome duplicate ("abba")', inputExample: 's = "abba"', expectedBehavior: 'Returns 2.' }],
      commonMistakes: [{ mistake: 'Omitting Math.max', whyItFails: 'Breaks monotonicity on "abba".', fix: 'Use Math.max(left, prev + 1).' }],
    },
    testSuite: {
      id: 'ts-sw-debug',
      entryFunctionName: { java: 'lengthOfLongestSubstring', javascript: 'lengthOfLongestSubstring', python: 'length_of_longest_substring' },
      comparator: 'exact',
      cases: [
        { id: 'sd1', name: 'Stale-index palindrome ("abba")', args: ['abba'], expected: 2, isEdgeCase: true },
        { id: 'sd2', name: 'Classic ("abcabcbb")', args: ['abcabcbb'], expected: 3 },
        { id: 'sd3', name: 'Nested repeat ("tmmzuxt")', args: ['tmmzuxt'], expected: 5, isEdgeCase: true },
        { id: 'sd4', name: 'Empty string', args: [''], expected: 0, isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
  },
];

const SLIDING_WINDOW_ASSESSMENTS: CanonicalAssessment[] = [
  {
    id: 'assess-sw-transfer',
    topicId: 'dynamic-sliding-window',
    title: 'Unseen Transfer & Invariant Assessment — Sliding Window',
    kind: 'unseen-transfer',
    passingScorePct: 80,
    questions: [
      {
        id: 'sw-q1',
        objectiveId: 'obj-sw-5',
        dimension: 'transferAbility',
        prompt: 'You receive a sorted list of positive network packet timestamps (ms) and must find the maximum number of packets arriving inside any 1,000 ms window. Which approach is optimal?',
        options: [
          { id: 'a', label: 'Variable Sliding Window: advance right on each packet and shrink left while timestamps[right] - timestamps[left] > 1000', isCorrect: true, explanation: 'Sorted timestamps are monotonic, so a two-pointer sliding window computes the max burst in O(n) time and O(1) space.' },
          { id: 'b', label: 'Nested loops checking every pair of timestamps', isCorrect: false, explanation: 'Nested loops degrade to O(n²).' },
        ],
      },
      {
        id: 'sw-q2',
        objectiveId: 'obj-sw-1',
        dimension: 'understanding',
        prompt: 'Which problem CANNOT be solved with a plain O(n) Sliding Window?',
        options: [
          { id: 'a', label: 'Shortest subarray with sum >= K when the array includes both positive and negative integers', isCorrect: true, explanation: 'Negative values break monotonicity; requires Prefix Sum + Monotonic Deque.' },
          { id: 'b', label: 'Longest subarray containing at most 2 distinct fruit types', isCorrect: false, explanation: 'Distinct count is monotonic under expansion/contraction, so Variable Sliding Window works in O(n).' },
        ],
      },
      {
        id: 'sw-q3',
        objectiveId: 'obj-sw-4',
        dimension: 'correctness',
        prompt: 'In `lengthOfLongestSubstring("tmmzuxt")`, why does the final character `t` at index 6 NOT trigger a shrink even though `t` is in `lastSeen` at index 0?',
        options: [
          { id: 'a', label: 'Because left is already at index 2 (past index 0), so `lastSeen["t"] = 0 < left` is outside the active window', isCorrect: true, explanation: 'Stale entries from before `left` are logically absent from the current window.' },
          { id: 'b', label: 'Because the map deletes every entry whenever left moves', isCorrect: false, explanation: 'The O(1) jump variant leaves stale keys in the map and filters them with `Math.max(left, prev + 1)`.' },
        ],
      },
      {
        id: 'sw-q4',
        objectiveId: 'obj-sw-3',
        dimension: 'complexityAnalysis',
        prompt: 'In Minimum Size Subarray Sum, there is a `while (windowSum >= target)` inside `for (right = 0..n-1)`. Why is the worst-case time complexity still O(n)?',
        options: [
          { id: 'a', label: 'Each element is added once by right and subtracted at most once by left, bounding total loop work to <= 2n', isCorrect: true, explanation: 'Amortized pointer accounting proves O(n) worst-case runtime.' },
          { id: 'b', label: 'The while loop executes at most log(n) times per iteration', isCorrect: false, explanation: 'It can run many times on one step, but at most n times summed over the entire run.' },
        ],
      },
    ],
  },
];

// ============================================================================
// PILOT 3: DYNAMIC PROGRAMMING (dynamic-programming)
// ============================================================================

const DP_OBJECTIVES: LearningObjective[] = [
  {
    id: 'obj-dp-1',
    statement: 'Identify Optimal Substructure and Overlapping Subproblems and explain why Greedy fails without the greedy-choice property.',
    stage: 'understand',
    dimension: 'understanding',
  },
  {
    id: 'obj-dp-2',
    statement: 'Trace 1D and 2D bottom-up DP state transitions, base cases, and dependency directions deterministically.',
    stage: 'visualize',
    dimension: 'visualization',
  },
  {
    id: 'obj-dp-3',
    statement: 'Implement recursive brute-force, top-down memoization, and bottom-up space-optimized DP in Java 21, JavaScript, and Python 3.12.',
    stage: 'implement',
    dimension: 'implementation',
  },
  {
    id: 'obj-dp-4',
    statement: 'Debug sentinel overflow, missing base cases, and wrong iteration-order bugs in DP tables.',
    stage: 'practice',
    dimension: 'debugging',
  },
  {
    id: 'obj-dp-5',
    statement: 'Formulate state definitions and recurrence transitions independently on unseen optimization and counting problems.',
    stage: 'master',
    dimension: 'transferAbility',
  },
];

const DP_UNDERSTAND: UnderstandStageContent = {
  whatIsPattern:
    'Dynamic Programming solves complex optimization or counting problems by decomposing them into overlapping subproblems, caching each state’s exact answer once, and building larger states from proven optimal smaller states.',
  whyItExists:
    'Plain recursion can revisit the same subproblem exponentially many times (e.g., O(2^n) or O(k^amount)). Memoization solves each distinct state once, producing a state DAG; total work is O(states × transitions). When a state ranges over a numeric magnitude such as amount or capacity, this bound is pseudo-polynomial in that value, not polynomial in its bit length.',
  problemItSolves:
    'Transforms repeated decision-tree work (min/max cost, number of ways, feasibility, sequence alignment) into O(states × transitions) work. This is polynomial in the number of represented states; numeric ranges such as coin amount can make the algorithm pseudo-polynomial in the input magnitude.',
  whenToUse: [
    'Optimal Substructure: an optimal answer to state S can be computed from optimal answers to smaller subproblems.',
    'Overlapping Subproblems: the recursion tree visits the exact same state parameters repeatedly.',
    'Prompt asks for "minimum/maximum", "total number of ways", "longest subsequence", or "is it possible" when greedy has counterexamples.',
  ],
  whenNotToUse: [
    'Subproblems never overlap (use Divide & Conquer like Merge Sort).',
    'A provable Greedy Choice property exists (e.g., Interval Scheduling or Dijkstra with non-negative weights — Greedy is faster and simpler).',
    'You must enumerate ALL actual configurations/combinations rather than count or optimize them (use Backtracking).',
  ],
  advantages: [
    'Avoids repeated recursive work by solving each distinct state once; the resulting O(states × transitions) bound may be pseudo-polynomial when a state dimension is a numeric magnitude.',
    'Systematic framework (State → Recurrence → Base Case → Topological Order → Space Compression).',
  ],
  limitations: [
    'State space explodes if too many dimensions are encoded (curse of dimensionality).',
    'Requires careful base-case and sentinel selection (e.g., avoiding `Integer.MAX_VALUE + 1` overflow). Numeric-state DP such as O(k × amount) Coin Change is pseudo-polynomial: amount may require only O(log amount) input bits.',
  ],
  realWorldAnalogy: {
    title: 'Distance Ledger on a Multi-City Road Map',
    narrative:
      'If you already calculated and wrote down the shortest route from Town B to the capital, any highway reaching Town B does not need to re-explore all roads beyond B — it simply adds one leg to the ledger entry for B.',
    mappingToAlgorithm:
      'Each town is a DP state; the ledger is the `dp[]` table; adding a road leg is a state transition `dp[curr] = min(dp[curr], cost + dp[next])`.',
  },
  simpleExample: {
    id: 'dp-ex-simple',
    title: 'Coin Change (Minimum Coins)',
    problemStatement:
      'Given coin denominations `coins` and a target `amount`, return the fewest number of coins needed to make up that amount, or -1 if impossible.',
    input: 'coins = [1, 3, 4], amount = 6',
    output: '2 (3 + 3)',
    constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10^4'],
    walkthrough: [
      'Base case: dp[0] = 0 (0 coins for amount 0). Initialize dp[1..6] = amount + 1 (unreachable sentinel).',
      'dp[1] = 1 (coin 1), dp[2] = 2 (1+1), dp[3] = 1 (coin 3), dp[4] = 1 (coin 4), dp[5] = 2 (4+1).',
      'dp[6] = min(1+dp[5]=3, 1+dp[3]=2, 1+dp[2]=3) = 2!',
    ],
    keyObservation:
      'Greedy fails on coins = [1, 3, 4], amount = 6 (picks 4+1+1 = 3 coins). DP evaluates every denomination and discovers 3+3 = 2 coins.',
  },
  conceptualExamples: [
    {
      id: 'dp-ex-1',
      title: 'The 5-Step DP Blueprint (SRTBOT)',
      problemStatement: 'How to derive any DP recurrence systematically without guessing.',
      input: 'State → Recurrence → Topological Order → Base Case → Original Answer → Time/Space',
      output: 'Deterministic O(S · T) solution',
      constraints: ['No cyclic state dependencies'],
      walkthrough: [
        '1. State: define dp[i] in one precise English sentence.',
        '2. Recurrence: express dp[i] strictly in terms of already-solved smaller states.',
        '3. Base cases & safe sentinels (use `amount + 1`, never `Integer.MAX_VALUE` + 1).',
        '4. Order: fill states so dependencies are computed before dependents.',
      ],
      keyObservation: 'If you cannot write a crystal-clear 1-sentence meaning for dp[i], the recurrence will be guesswork.',
    },
    {
      id: 'dp-ex-2',
      title: 'Space Compression from O(n) to O(1) (House Robber)',
      problemStatement: 'Inspect dependency distance to shrink memory.',
      input: 'dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])',
      output: 'O(1) space using prev2 and prev1',
      constraints: ['Only final value required (not reconstructing full path)'],
      walkthrough: [
        'dp[i] only ever reads dp[i - 1] and dp[i - 2].',
        'Replace the entire array with two rolling variables: prev2 and prev1.',
      ],
      keyObservation: 'Every rolling-variable optimization comes straight from inspecting which previous cells the recurrence reads.',
    },
  ],
  bruteForceComparisons: [
    {
      id: 'dp-bf-1',
      title: 'Coin Change: Plain Recursion vs. Bottom-Up 1D DP',
      bruteApproach: 'Try every coin recursively: min(1 + solve(amount - c)) without caching.',
      bruteTime: 'O(k^amount)',
      bruteSpace: 'O(amount) stack',
      bottleneck: 'Subproblem solve(3) gets recomputed along dozens of branches.',
      optimizedApproach: 'Solve dp[0..amount] bottom-up once per amount.',
      optimizedTime: 'O(amount × k)',
      optimizedSpace: 'O(amount)',
      whyBetter: 'For amount = 50 and 5 coins, collapses trillions of recursive calls into 250 table updates.',
    },
    {
      id: 'dp-bf-2',
      title: 'House Robber: Exponential Take/Skip vs. Rolling O(1) DP',
      bruteApproach: 'Recursively branch rob(i) = max(rob(i-1), nums[i] + rob(i-2)).',
      bruteTime: 'O(2^n)',
      bruteSpace: 'O(n)',
      bottleneck: 'Fibonacci-style overlapping branches blow up past n = 35.',
      optimizedApproach: 'Sweep once from left to right keeping only prev2 and prev1.',
      optimizedTime: 'O(n)',
      optimizedSpace: 'O(1)',
      whyBetter: 'Linear time and constant memory for arrays of length 10^5.',
    },
  ],
  importantObservations: [
    'Use `amount + 1` instead of `Integer.MAX_VALUE` as the unreachable sentinel in Java/C++ so `1 + dp[a - c]` never overflows to negative!',
    'In 2D DP (like LCS), adding a 0th row and 0th column for empty prefixes eliminates messy out-of-bounds checks.',
    'Always verify greedy counterexamples before choosing Greedy over DP.',
  ],
  commonMisconceptions: [
    {
      misconception: 'Top-down memoization is always slower asymptotically than bottom-up tabulation.',
      correction:
        'Both have the same O(states × transitions) asymptotic complexity. Tabulation simply removes recursion stack overhead and enables rolling-array space compression.',
    },
    {
      misconception: 'Initializing a min-DP array with `Integer.MAX_VALUE` is always safe.',
      correction:
        'In Java/C++, `1 + Integer.MAX_VALUE` overflows to `-2147483648`, which `Math.min` immediately picks as the "best" answer! Use a bounded sentinel like `amount + 1`.',
    },
  ],
  conceptCheck: {
    id: 'dp-concept-check',
    prompt: 'In Java Coin Change, why is `int INF = amount + 1` strictly safer than `int INF = Integer.MAX_VALUE` when computing `Math.min(dp[a], 1 + dp[a - coin])`?',
    options: [
      {
        id: 'overflow-guard',
        label: 'Adding 1 to Integer.MAX_VALUE overflows to Integer.MIN_VALUE (-2^31), corrupting Math.min, whereas amount + 1 + 1 never overflows.',
        isCorrect: true,
        explanation: 'Correct! Sentinel overflow is one of the top real-world bugs in bottom-up DP implementations.',
      },
      {
        id: 'faster-cpu',
        label: 'Integer.MAX_VALUE cannot be stored inside an int[] array.',
        isCorrect: false,
        explanation: 'It fits in an int[], but adding 1 wraps around to negative in two’s complement arithmetic.',
      },
    ],
  },
};

const DP_PROBLEMS: CanonicalProblem[] = [
  {
    id: 'prob-dp-coin-change',
    topicId: 'dynamic-programming',
    slug: 'coin-change',
    title: 'Coin Change (Minimum Coins)',
    difficulty: 'Medium',
    category: 'beginner',
    hidePatternUntilSolved: false,
    problemStatement:
      'You are given an integer array coins representing coin denominations and an integer amount. Return the fewest number of coins needed to make up that amount, or -1 if that amount cannot be made up by any combination of the coins.',
    examples: [
      { input: 'coins = [1, 3, 4], amount = 6', output: '2', explanation: '3 + 3 = 6 uses 2 coins (greedy 4 + 1 + 1 uses 3).' },
      { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Amount 3 cannot be formed using only 2s.' },
      { input: 'coins = [1], amount = 0', output: '0', explanation: 'Zero coins are needed for amount 0.' },
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    hints: [
      'Define dp[a] = minimum coins needed to form amount a.',
      'Initialize dp[0] = 0 and dp[1..amount] = amount + 1 (unreachable sentinel).',
    ],
    starterCodeJs: `function coinChange(coins, amount) {\n  const INF = amount + 1;\n  const dp = new Array(amount + 1).fill(INF);\n  dp[0] = 0;\n  for (let a = 1; a <= amount; a++) {\n    for (const coin of coins) {\n      if (coin <= a) {\n        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);\n      }\n    }\n  }\n  return dp[amount] > amount ? -1 : dp[amount];\n}`,
    solution: {
      problemId: 'prob-dp-coin-change',
      variants: [
        {
          tier: 'brute',
          label: 'Brute Force (Unmemoized Recursion)',
          summary: 'Explore every denomination branch recursively without caching.',
          timeComplexity: 'O(k^amount)',
          spaceComplexity: 'O(amount)',
          stepByStepExplanation: ['Base case rem == 0 returns 0; rem < 0 returns ∞; try all coins.'],
          code: {
            java: `public class Solution {
    public int coinChangeBrute(int[] coins, int amount) {
        int ans = dfs(coins, amount, amount + 1);
        return ans > amount ? -1 : ans;
    }
    private int dfs(int[] coins, int rem, int inf) {
        if (rem == 0) return 0;
        if (rem < 0) return inf;
        int best = inf;
        for (int coin : coins) {
            best = Math.min(best, 1 + dfs(coins, rem - coin, inf));
        }
        return best;
    }
}`,
            javascript: `function coinChange(coins, amount) {
  const INF = amount + 1;
  function dfs(rem) {
    if (rem === 0) return 0;
    if (rem < 0) return INF;
    let best = INF;
    for (const c of coins) best = Math.min(best, 1 + dfs(rem - c));
    return best;
  }
  const ans = dfs(amount);
  return ans > amount ? -1 : ans;
}`,
            python: `def coin_change_brute(coins: list[int], amount: int) -> int:
    inf = amount + 1
    def dfs(rem: int) -> int:
        if rem == 0:
            return 0
        if rem < 0:
            return inf
        return min(1 + dfs(rem - c) for c in coins)
    ans = dfs(amount)
    return -1 if ans > amount else ans`,
          },
        },
        {
          tier: 'better',
          label: 'Better (Top-Down Memoization)',
          summary: 'Cache each remaining amount in a memo array so each state is solved at most once.',
          timeComplexity: 'O(amount × k)',
          spaceComplexity: 'O(amount)',
          stepByStepExplanation: ['Store computed min coins for each rem in memo[rem] before returning.'],
          code: {
            java: `import java.util.Arrays;

public class Solution {
    public int coinChangeMemo(int[] coins, int amount) {
        int[] memo = new int[amount + 1];
        Arrays.fill(memo, -2);
        int ans = dfs(coins, amount, amount + 1, memo);
        return ans > amount ? -1 : ans;
    }
    private int dfs(int[] coins, int rem, int inf, int[] memo) {
        if (rem == 0) return 0;
        if (rem < 0) return inf;
        if (memo[rem] != -2) return memo[rem];
        int best = inf;
        for (int coin : coins) {
            best = Math.min(best, 1 + dfs(coins, rem - coin, inf, memo));
        }
        return memo[rem] = best;
    }
}`,
            javascript: `function coinChange(coins, amount) {
  const INF = amount + 1;
  const memo = new Array(amount + 1).fill(-1);
  function dfs(rem) {
    if (rem === 0) return 0;
    if (rem < 0) return INF;
    if (memo[rem] !== -1) return memo[rem];
    let best = INF;
    for (const c of coins) best = Math.min(best, 1 + dfs(rem - c));
    return (memo[rem] = best);
  }
  const ans = dfs(amount);
  return ans > amount ? -1 : ans;
}`,
            python: `from functools import lru_cache

def coin_change_memo(coins: list[int], amount: int) -> int:
    inf = amount + 1
    @lru_cache(maxsize=None)
    def dfs(rem: int) -> int:
        if rem == 0:
            return 0
        if rem < 0:
            return inf
        return min(1 + dfs(rem - c) for c in coins)
    ans = dfs(amount)
    return -1 if ans > amount else ans`,
          },
        },
        {
          tier: 'optimal',
          label: 'Optimal (Bottom-Up 1D Tabulation)',
          summary: 'Iteratively compute dp[1..amount] without recursion stack overhead using safe sentinel amount + 1.',
          timeComplexity: 'O(amount × k)',
          spaceComplexity: 'O(amount)',
          stepByStepExplanation: [
            'Allocate dp[0..amount] filled with INF = amount + 1 and set dp[0] = 0.',
            'For each a from 1 to amount, try every coin <= a: dp[a] = min(dp[a], 1 + dp[a - coin]).',
            'Return -1 if dp[amount] > amount, else dp[amount].',
          ],
          code: {
            java: `import java.util.Arrays;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        int inf = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, inf);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a) {
                    dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
            javascript: `function coinChange(coins, amount) {
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
            python: `def coin_change(coins: list[int], amount: int) -> int:
    inf = amount + 1
    dp = [inf] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], 1 + dp[a - coin])
    return -1 if dp[amount] > amount else dp[amount]`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'After outer iteration a, dp[0..a] holds the exact minimum coin count for every sub-amount 0..a (or amount + 1 if unreachable).',
        initialization: 'dp[0] = 0 is exact because 0 coins sum to 0.',
        maintenance: 'Any optimal coin multiset for amount a contains some last coin c <= a, leaving an optimal multiset for a - c; taking min over all c <= a preserves optimality.',
        termination: 'At a = amount, dp[amount] holds the exact global optimum (or > amount iff unreachable).',
      },
      complexityAnalysis: {
        time: 'O(amount × k)',
        timeJustification: 'Outer loop runs amount times; inner loop checks k coins.',
        space: 'O(amount)',
        spaceJustification: 'Single 1D array of size amount + 1.',
      },
      edgeCases: [
        { caseTitle: 'Zero target amount', inputExample: 'coins = [2], amount = 0', expectedBehavior: 'Returns 0 immediately.' },
        { caseTitle: 'Non-canonical coins (Greedy trap)', inputExample: 'coins = [1, 3, 4], amount = 6', expectedBehavior: 'Returns 2 (3 + 3), NOT 3 (4 + 1 + 1).' },
        { caseTitle: 'Unreachable amount', inputExample: 'coins = [2, 5], amount = 3', expectedBehavior: 'Returns -1.' },
      ],
      commonMistakes: [
        { mistake: 'Using greedy largest-coin-first', whyItFails: 'Fails on [1, 3, 4], amount = 6.', fix: 'Use DP over all coins.' },
        { mistake: 'Using Integer.MAX_VALUE sentinel in Java', whyItFails: '1 + Integer.MAX_VALUE overflows negative.', fix: 'Use amount + 1.' },
      ],
    },
    testSuite: {
      id: 'ts-dp-coin-change',
      entryFunctionName: { java: 'coinChange', javascript: 'coinChange', python: 'coin_change' },
      comparator: 'exact',
      cases: [
        { id: 'dp1', name: 'Greedy counterexample ([1,3,4], 6)', args: [[1, 3, 4], 6], expected: 2, isEdgeCase: true },
        { id: 'dp2', name: 'Classic ([1,2,5], 11)', args: [[1, 2, 5], 11], expected: 3 },
        { id: 'dp3', name: 'Unreachable ([2], 3)', args: [[2], 3], expected: -1, isEdgeCase: true },
        { id: 'dp4', name: 'Zero amount boundary', args: [[1], 0], expected: 0, isBoundary: true },
        { id: 'dp5', name: 'Coin larger than amount', args: [[5, 10], 3], expected: -1, isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
    patternRecognitionPrompt: {
      id: 'pr-dp-coin-change',
      problemTitle: 'Coin Change (Minimum Coins)',
      problemExcerpt: 'Given arbitrary coin denominations (up to 12) and target amount <= 10,000, find the fewest coins summing to amount (unlimited copies of each coin).',
      constraintsSummary: 'k <= 12 · amount <= 10^4 · Arbitrary denominations',
      criteria: [
        {
          criterion: 'structuralUnderstanding',
          label: 'Structural Understanding',
          weight: 20,
          question: 'Why does this problem exhibit overlapping subproblems and optimal substructure?',
          options: [
            { id: 'a', label: 'Many coin paths arrive at the exact same remaining amount `rem`, and optimal `rem` uses optimal `rem - coin`', isCorrect: true, rationale: 'State depends solely on remaining amount, creating massive subproblem reuse.' },
            { id: 'b', label: 'Every coin can be used at most once in sorted order', isCorrect: false, rationale: 'Coins have unlimited supply (unbounded knapsack).' },
          ],
        },
        {
          criterion: 'patternIdentification',
          label: 'Pattern Identification',
          weight: 25,
          question: 'Which pattern solves this reliably for ALL valid coin sets?',
          options: [
            { id: 'a', label: 'Dynamic Programming (Unbounded Knapsack / 1D Tabulation)', isCorrect: true, rationale: 'Evaluates all coin choices per sub-amount and guarantees global optimality.' },
            { id: 'b', label: 'Greedy (always pick the largest coin <= remaining)', isCorrect: false, rationale: 'Fails on [1, 3, 4], amount = 6 (returns 3 instead of 2).' },
            { id: 'c', label: 'Two Pointers', isCorrect: false, rationale: 'We are not searching for a pair of indices.' },
          ],
        },
        {
          criterion: 'dataStructureSelection',
          label: 'Data Structure Selection',
          weight: 15,
          question: 'What table structure represents the DP state cleanly?',
          options: [
            { id: 'a', label: '1D integer array dp[0..amount] initialized to amount + 1 with dp[0] = 0', isCorrect: true, rationale: 'Each index directly encodes a remaining amount subproblem.' },
            { id: 'b', label: 'Stack of coin differences', isCorrect: false, rationale: 'A stack does not cache arbitrary subproblem indices in O(1).' },
          ],
        },
        {
          criterion: 'constraintReasoning',
          label: 'Constraint Reasoning',
          weight: 15,
          question: 'With k <= 12 and amount <= 10^4, how many operations does bottom-up DP take?',
          options: [
            { id: 'a', label: 'At most 12 × 10^4 = 120,000 simple comparisons (instant)', isCorrect: true, rationale: 'The state × transition product easily fits within sub-millisecond budgets.' },
            { id: 'b', label: '12^10000 operations (infeasible)', isCorrect: false, rationale: 'That is the unmemoized brute-force bound, not DP.' },
          ],
        },
        {
          criterion: 'complexityAnalysis',
          label: 'Complexity Analysis',
          weight: 15,
          question: 'What are the time and space complexities of 1D Bottom-Up Coin Change?',
          options: [
            { id: 'a', label: 'O(amount × k) time, O(amount) space', isCorrect: true, rationale: 'State count is amount + 1 with k transitions per state.' },
            { id: 'b', label: 'O(k log k) time, O(1) space', isCorrect: false, rationale: 'Sorting coins alone does not solve arbitrary denominations.' },
          ],
        },
        {
          criterion: 'alternativeApproachEvaluation',
          label: 'Alternative Approach Evaluation',
          weight: 10,
          question: 'How does BFS shortest path on amounts 0..amount compare to Bottom-Up DP?',
          options: [
            { id: 'a', label: 'Both are O(amount × k) worst-case; BFS can terminate early on small answers while DP has lower constant overhead', isCorrect: true, rationale: 'Each coin adds weight 1, so unweighted BFS from 0 to amount is a valid alternative.' },
            { id: 'b', label: 'BFS cannot find minimum coin counts', isCorrect: false, explanation: '', rationale: 'Since every coin step has unit cost 1, BFS level equals coin count.' } as { id: string; label: string; isCorrect: boolean; rationale: string },
          ],
        },
      ],
    },
  },
  {
    id: 'prob-dp-house-robber',
    topicId: 'dynamic-programming',
    slug: 'house-robber',
    title: 'House Robber (O(1) Space Compression)',
    difficulty: 'Medium',
    category: 'intermediate',
    hidePatternUntilSolved: true,
    problemStatement:
      'Given an integer array nums representing the amount of money at each house along a street, return the maximum amount you can rob without robbing two adjacent houses.',
    examples: [
      { input: 'nums = [2, 7, 9, 3, 1]', output: '12', explanation: 'Rob house 0 (2) + house 2 (9) + house 4 (1) = 12.' },
      { input: 'nums = [2, 1, 1, 2]', output: '4', explanation: 'Skipping two middle houses (2 + 2 = 4) proves why alternating even/odd sums fails!' },
    ],
    constraints: ['0 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    hints: [
      'Recurrence: dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]).',
      'Since only the previous two states matter, maintain just `prev2` and `prev1`.',
    ],
    starterCodeJs: `function rob(nums) {\n  let prev2 = 0;\n  let prev1 = 0;\n  for (const num of nums) {\n    const curr = Math.max(prev1, prev2 + num);\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}`,
    solution: {
      problemId: 'prob-dp-house-robber',
      variants: [
        {
          tier: 'optimal',
          label: 'Optimal (O(1) Space Rolling DP)',
          summary: 'Compress dp[i-2] and dp[i-1] into two scalar registers.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          stepByStepExplanation: [
            'Initialize prev2 = 0, prev1 = 0.',
            'For each house value num, compute curr = max(prev1, prev2 + num), then shift prev2 = prev1, prev1 = curr.',
            'Return prev1.',
          ],
          code: {
            java: `public class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int num : nums) {
            int curr = Math.max(prev1, prev2 + num);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
            javascript: `function rob(nums) {
  let prev2 = 0;
  let prev1 = 0;
  for (const num of nums) {
    const curr = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
            python: `def rob(nums: list[int]) -> int:
    prev2 = prev1 = 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'After processing index i, prev1 = optimal loot for [0..i] and prev2 = optimal loot for [0..i-1].',
        initialization: 'Before index 0, prev2 = prev1 = 0.',
        maintenance: 'Choosing max(skip = prev1, take = prev2 + nums[i]) preserves non-adjacency and optimality.',
        termination: 'After last element, prev1 equals the global maximum.',
      },
      complexityAnalysis: { time: 'O(n)', timeJustification: 'Single linear pass.', space: 'O(1)', spaceJustification: 'Two rolling variables.' },
      edgeCases: [
        { caseTitle: 'Skip two in a row', inputExample: '[2, 1, 1, 2]', expectedBehavior: 'Returns 4 (beats alternating even/odd sums of 3).' },
        { caseTitle: 'Empty array', inputExample: '[]', expectedBehavior: 'Returns 0.' },
      ],
      commonMistakes: [
        { mistake: 'Comparing only sum of even indices vs. sum of odd indices', whyItFails: 'Fails on [2, 1, 1, 2] where optimal skips two consecutive houses.', fix: 'Use take/skip DP recurrence.' },
      ],
    },
    testSuite: {
      id: 'ts-dp-house-robber',
      entryFunctionName: { java: 'rob', javascript: 'rob', python: 'rob' },
      comparator: 'exact',
      cases: [
        { id: 'hr1', name: 'Classic street', args: [[2, 7, 9, 3, 1]], expected: 12 },
        { id: 'hr2', name: 'Skip-two trap ([2,1,1,2])', args: [[2, 1, 1, 2]], expected: 4, isEdgeCase: true },
        { id: 'hr3', name: 'Empty street', args: [[]], expected: 0, isBoundary: true },
        { id: 'hr4', name: 'Single house', args: [[9]], expected: 9, isBoundary: true },
      ],
    },
    verificationStatus: 'Published',
  },
  {
    id: 'prob-dp-debug-coin-base',
    topicId: 'dynamic-programming',
    slug: 'coin-change-debug-challenge',
    title: 'Debug Challenge: Broken DP Base Case & Greedy Shortcut',
    difficulty: 'Medium',
    category: 'debugging',
    hidePatternUntilSolved: false,
    problemStatement:
      'The Coin Change function below initializes `dp` with `0` instead of an unreachable sentinel and forgets to check for unreachable amounts! Fix it so all test cases (including [1, 3, 4], 6 and [2], 3) pass.',
    examples: [
      { input: 'coins = [1, 3, 4], amount = 6', output: '2', explanation: 'Buggy dp initialized to 0 makes Math.min(0, ...) always stay 0!' },
    ],
    constraints: ['Must run in O(amount × coins.length)'],
    hints: [
      'Fill `dp` with `amount + 1` (unreachable sentinel), then set ONLY `dp[0] = 0`.',
      'Return `-1` when `dp[amount] > amount`.',
    ],
    starterCodeJs: `function coinChange(coins, amount) {\n  // BUG 1: filling with 0 makes Math.min(dp[a], ...) always pick 0!\n  const dp = new Array(amount + 1).fill(0);\n  for (let a = 1; a <= amount; a++) {\n    for (const coin of coins) {\n      if (coin <= a) {\n        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);\n      }\n    }\n  }\n  // BUG 2: does not return -1 when amount is unreachable\n  return dp[amount];\n}`,
    buggyCodeJs: `function coinChange(coins, amount) {\n  // BUG 1: filling with 0 makes Math.min(dp[a], ...) always pick 0!\n  const dp = new Array(amount + 1).fill(0);\n  for (let a = 1; a <= amount; a++) {\n    for (const coin of coins) {\n      if (coin <= a) {\n        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);\n      }\n    }\n  }\n  // BUG 2: does not return -1 when amount is unreachable\n  return dp[amount];\n}`,
    bugDescription: 'Zero initialization collapses every Math.min transition to 0 and hides unreachable states.',
    solution: {
      problemId: 'prob-dp-debug-coin-base',
      variants: [
        {
          tier: 'optimal',
          label: 'Fixed Sentinel & Unreachable Guard',
          summary: 'Initialize dp to amount + 1, set dp[0] = 0, and return -1 if dp[amount] > amount.',
          timeComplexity: 'O(amount × k)',
          spaceComplexity: 'O(amount)',
          stepByStepExplanation: ['Use amount + 1 sentinel and check reachability before returning.'],
          code: {
            java: `import java.util.Arrays;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        int inf = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, inf);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a) dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
            javascript: `function coinChange(coins, amount) {
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
            python: `def coin_change(coins: list[int], amount: int) -> int:
    inf = amount + 1
    dp = [inf] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], 1 + dp[a - coin])
    return -1 if dp[amount] > amount else dp[amount]`,
          },
        },
      ],
      correctnessProof: {
        invariant: 'Unvisited states stay > amount so only reachable chains improve dp[a].',
        initialization: 'dp[0] = 0, dp[1..amount] = amount + 1.',
        maintenance: 'Transitions only improve values when dp[a - coin] <= amount.',
        termination: 'dp[amount] > amount cleanly identifies unreachable targets.',
      },
      complexityAnalysis: { time: 'O(amount × k)', timeJustification: 'Table fill.', space: 'O(amount)', spaceJustification: '1D table.' },
      edgeCases: [{ caseTitle: 'Unreachable target', inputExample: '[2], 3', expectedBehavior: 'Returns -1.' }],
      commonMistakes: [{ mistake: 'Zero-initializing min-DP tables', whyItFails: '0 beats every positive candidate.', fix: 'Use amount + 1.' }],
    },
    testSuite: {
      id: 'ts-dp-debug',
      entryFunctionName: { java: 'coinChange', javascript: 'coinChange', python: 'coin_change' },
      comparator: 'exact',
      cases: [
        { id: 'dd1', name: 'Non-greedy ([1,3,4], 6)', args: [[1, 3, 4], 6], expected: 2, isEdgeCase: true },
        { id: 'dd2', name: 'Unreachable ([2], 3)', args: [[2], 3], expected: -1, isEdgeCase: true },
        { id: 'dd3', name: 'Zero amount', args: [[2], 0], expected: 0, isBoundary: true },
        { id: 'dd4', name: 'Standard ([1,2,5], 11)', args: [[1, 2, 5], 11], expected: 3 },
      ],
    },
    verificationStatus: 'Published',
  },
];

const DP_ASSESSMENTS: CanonicalAssessment[] = [
  {
    id: 'assess-dp-transfer',
    topicId: 'dynamic-programming',
    title: 'Unseen Transfer & State Formulation Assessment — Dynamic Programming',
    kind: 'unseen-transfer',
    passingScorePct: 80,
    questions: [
      {
        id: 'dp-q1',
        objectiveId: 'obj-dp-5',
        dimension: 'transferAbility',
        prompt: 'A cloud scheduler assigns jobs along a timeline where running job i earns profit[i] but forces a 1-slot cooldown (cannot run job i-1). What is the optimal DP recurrence?',
        options: [
          { id: 'a', label: 'dp[i] = max(dp[i - 1], dp[i - 2] + profit[i]) — structurally identical to House Robber', isCorrect: true, explanation: 'Unseen transfer succeeds when you map domain constraints (1-slot cooldown) onto the take/skip recurrence.' },
          { id: 'b', label: 'Sort profits descending and greedily pick the top half', isCorrect: false, explanation: 'Adjacent high-profit jobs violate the cooldown constraint.' },
        ],
      },
      {
        id: 'dp-q2',
        objectiveId: 'obj-dp-1',
        dimension: 'understanding',
        prompt: 'What differentiates 0/1 Knapsack from Unbounded Knapsack (like Coin Change) in a 1D space-optimized loop?',
        options: [
          { id: 'a', label: '0/1 Knapsack iterates capacity backward (W down to w) so each item is used at most once; Unbounded iterates forward (w up to W)', isCorrect: true, explanation: 'Loop direction determines whether dp[a - w] reflects the previous row (0/1) or the current row (reusable item).' },
          { id: 'b', label: '0/1 Knapsack always runs in O(n) while Unbounded is O(n²)', isCorrect: false, explanation: 'Both run in O(n × W) pseudo-polynomial time.' },
        ],
      },
      {
        id: 'dp-q3',
        objectiveId: 'obj-dp-3',
        dimension: 'complexityAnalysis',
        prompt: 'In Longest Common Subsequence for strings of length m and n, what are the standard 2D DP time and space complexities (and space-optimized bound)?',
        options: [
          { id: 'a', label: 'O(m × n) time; O(m × n) standard space, compressible to O(min(m, n)) space', isCorrect: true, explanation: 'Each row only reads the immediately preceding row, enabling two-row compression.' },
          { id: 'b', label: 'O(m + n) time and O(1) space', isCorrect: false, explanation: 'Comparing prefix alignments across both strings requires O(m × n) states.' },
        ],
      },
      {
        id: 'dp-q4',
        objectiveId: 'obj-dp-4',
        dimension: 'correctness',
        prompt: 'In 2D LCS (`dp[r][c]`), when `text1[r-1] == text2[c-1]`, why must we take `1 + dp[r-1][c-1]` instead of `1 + max(dp[r-1][c], dp[r][c-1])`?',
        options: [
          { id: 'a', label: 'Taking top or left could match the same character twice; diagonal consumes one character from BOTH strings', isCorrect: true, explanation: 'Diagonal transition guarantees every matched character is used at most once in each string.' },
          { id: 'b', label: 'Diagonal lookup is faster in CPU cache', isCorrect: false, explanation: 'This is strictly a correctness requirement, not a cache optimization.' },
        ],
      },
    ],
  },
];

// ============================================================================
// EXPORT PILOT REFERENCE TOPICS MAP
// ============================================================================

export const PILOT_TOPIC_OVERRIDES: Record<
  string,
  Pick<
    LearningTopic,
    | 'isPilotReference'
    | 'prerequisites'
    | 'learningObjectives'
    | 'concepts'
    | 'recognitionSignals'
    | 'antiPatterns'
    | 'understand'
    | 'traceIds'
    | 'problems'
    | 'assessments'
    | 'masteryRequirements'
    | 'references'
    | 'version'
    | 'verificationStatus'
    | 'activityCounts'
  >
> = {
  'hashmap-hashset-lookup': {
    isPilotReference: true,
    prerequisites: [],
    learningObjectives: HASHMAP_OBJECTIVES,
    concepts: [
      'Amortized O(1) hash lookup vs. O(n) scan',
      'Lookup-before-insert distinct-index invariant',
      'Canonical equivalence keys (frequency signatures)',
      'HashSet sequence-head filtering for O(n) chains',
    ],
    recognitionSignals: [
      'Unsorted input requiring pair/complement lookup (target - x)',
      'Duplicate detection or frequency counting in O(n)',
      'Grouping items by equivalence signature (anagrams, isomorphic strings)',
      'Consecutive sequence length required in O(n) without sorting',
    ],
    antiPatterns: [
      'Using a HashMap when O(1) space is strictly required on sorted data',
      'Inserting before checking complement (causes self-pairing when 2x == target)',
      'Using truthy checks (`if (map.get(k))`) when valid stored indices include 0',
    ],
    understand: HASHMAP_UNDERSTAND,
    traceIds: [
      'trace-hashmap-two-sum',
      'trace-hashmap-longest-consecutive',
      'trace-hashmap-group-anagrams',
    ],
    problems: HASHMAP_PROBLEMS,
    assessments: HASHMAP_ASSESSMENTS,
    masteryRequirements: STANDARD_MASTERY_REQUIREMENTS,
    references: [
      { title: 'CLRS — Hash Tables & Universal Hashing', source: 'Introduction to Algorithms, Ch. 11' },
      { title: 'Java 21 HashMap & HashSet Specification', source: 'OpenJDK 21 API Docs' },
    ],
    version: makePilotVersion(
      'hashmap-hashset-lookup',
      'Validated all 5 stages, 3 deterministic traces, 4 verified practice/debugging problems, and 8-dimension mastery evidence.'
    ),
    verificationStatus: 'Published',
    activityCounts: {
      conceptualExamples: 2,
      interactiveTraces: 3,
      bruteForceComparisons: 2,
      codingProblems: 3,
      edgeCaseChallenges: 3,
      debuggingExercises: 1,
      mixedPatternProblems: 1,
      unseenTransferExercises: 1,
    },
  },
  'dynamic-sliding-window': {
    isPilotReference: true,
    prerequisites: [
      {
        topicId: 'hashmap-hashset-lookup',
        title: 'HashMap / HashSet Lookup',
        reason: 'Variable sliding windows track active character frequencies or last-seen indices in O(1) using HashMaps.',
        required: true,
      },
    ],
    learningObjectives: SLIDING_WINDOW_OBJECTIVES,
    concepts: [
      'Fixed-size O(1) delta updates (+incoming - outgoing)',
      'Variable-size expand-and-shrink monotonicity',
      'Last-seen index jump with non-decreasing left guard',
      'Amortized O(2n) = O(n) pointer accounting',
    ],
    recognitionSignals: [
      'Contiguous subarray or substring optimization (longest, shortest, max average)',
      'Constraint depends on window state (unique chars, at most K distinct, sum >= target on positive numbers)',
      'Monotonic behavior: expanding right and shrinking left move the validity metric predictably',
    ],
    antiPatterns: [
      'Applying Sliding Window to subarray sums with negative numbers (breaks monotonicity)',
      'Allowing left to jump backward on stale HashMap entries ("abba" bug)',
      'Applying Sliding Window to non-contiguous subsequences',
    ],
    understand: SLIDING_WINDOW_UNDERSTAND,
    traceIds: [
      'trace-sw-longest-unique',
      'trace-sw-fixed-avg',
      'trace-sw-min-subarray',
    ],
    problems: SLIDING_WINDOW_PROBLEMS,
    assessments: SLIDING_WINDOW_ASSESSMENTS,
    masteryRequirements: STANDARD_MASTERY_REQUIREMENTS,
    references: [
      { title: 'Amortized Two-Pointer Analysis', source: 'Pattern Forge Reference Specification' },
      { title: 'Monotonic Window Invariants', source: 'Tutorial Hub Curriculum Standard v1.0' },
    ],
    version: makePilotVersion(
      'dynamic-sliding-window',
      'Validated Fixed & Variable Sliding Window traces, stale-index debugging exercise, and monotonicity transfer assessment.'
    ),
    verificationStatus: 'Published',
    activityCounts: {
      conceptualExamples: 2,
      interactiveTraces: 3,
      bruteForceComparisons: 2,
      codingProblems: 3,
      edgeCaseChallenges: 3,
      debuggingExercises: 1,
      mixedPatternProblems: 1,
      unseenTransferExercises: 1,
    },
  },
  'dynamic-programming': {
    isPilotReference: true,
    prerequisites: [
      {
        topicId: 'hashmap-hashset-lookup',
        title: 'HashMap / HashSet Lookup',
        reason: 'Top-down memoization relies on caching subproblem states in O(1) maps or arrays.',
        required: true,
      },
      {
        topicId: 'backtracking',
        title: 'Backtracking (Subsets, Permutations, Grid Search)',
        reason: 'Understanding recursive decision trees clarifies how overlapping subproblems emerge and collapse into DP states.',
        required: false,
      },
    ],
    learningObjectives: DP_OBJECTIVES,
    concepts: [
      'Optimal substructure & overlapping subproblems',
      'SRTBOT 5-step recurrence formulation',
      'Top-down memoization vs. bottom-up tabulation',
      'Safe unreachable sentinels & rolling space compression',
    ],
    recognitionSignals: [
      'Optimization ("minimum coins", "maximum loot", "longest subsequence") or counting ("number of ways")',
      'Local greedy choices have counterexamples (e.g., coins [1, 3, 4] for amount 6)',
      'Recursive formulation visits identical states repeatedly',
    ],
    antiPatterns: [
      'Using Greedy without proving the greedy-choice property',
      'Zero-initializing a minimization DP table or adding 1 to Integer.MAX_VALUE',
      'Attempting DP when all explicit combinations must be enumerated (use Backtracking)',
    ],
    understand: DP_UNDERSTAND,
    traceIds: [
      'trace-dp-coin-change',
      'trace-dp-house-robber',
      'trace-dp-lcs-2d',
    ],
    problems: DP_PROBLEMS,
    assessments: DP_ASSESSMENTS,
    masteryRequirements: STANDARD_MASTERY_REQUIREMENTS,
    references: [
      { title: 'CLRS — Dynamic Programming', source: 'Introduction to Algorithms, Ch. 14' },
      { title: 'MIT 6.006 — SRTBOT Framework', source: 'Dynamic Programming Lecture Notes' },
    ],
    version: makePilotVersion(
      'dynamic-programming',
      'Validated 1D & 2D DP interactive traces, brute-to-optimal implementations in Java 21/JS/Python 3.12, and transfer assessment.'
    ),
    verificationStatus: 'Published',
    activityCounts: {
      conceptualExamples: 2,
      interactiveTraces: 3,
      bruteForceComparisons: 2,
      codingProblems: 3,
      edgeCaseChallenges: 3,
      debuggingExercises: 1,
      mixedPatternProblems: 1,
      unseenTransferExercises: 1,
    },
  },
};
