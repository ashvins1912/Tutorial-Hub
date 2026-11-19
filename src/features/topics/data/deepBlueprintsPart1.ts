import type { DeepTopicBlueprint } from './deepTopicBlueprints';

/**
 * Bespoke Deep Topic Blueprints (Part 1 of 2):
 * Covers Foundations & Intermediate topics so 100% of curriculum modules have
 * plain-English analogies, constraint math proofs, tailored bug traps,
 * and Blind 75 / NeetCode 150 faded-code active recall drills.
 */
export const DEEP_BLUEPRINTS_PART_1: Record<string, DeepTopicBlueprint> = {
  'two-pointers': {
    id: 'two-pointers',
    title: 'Two Pointers',
    category: 'Linear Structures',
    eli5Analogy:
      'Imagine two people holding a measuring tape from opposite ends of a sorted bookshelf looking for two books whose heights add up to 20cm: if the sum is too big, only the right person steps inward; if too small, only the left person steps inward—neither ever walks backward.',
    whenToUse: [
      'Input array is already sorted (or sorting in O(N log N) is allowed) and you need pairs, triplets, or closest sums',
      'Asked to remove duplicates, partition elements (0/1/2), or reverse in-place with O(1) extra memory',
      'Comparing opposite boundaries (palindromes, Container With Most Water, Trapping Rain Water)',
    ],
    whenNotToUse: [
      'Unsorted array where original indices MUST be preserved and sorting would destroy them (use HashMap)',
      'Subarray sum equals K with negative numbers (pointers lose monotonic direction; use Prefix Sum + HashMap)',
      'Non-contiguous subset optimization problems (use DP or Backtracking)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5 (or N <= 3,000 for 3Sum)',
      expectedComplexity: 'O(N) time (O(N²) for 3Sum), O(1) auxiliary space',
      correctTierId: 'n',
      eliminatedApproaches: ['Nested pair loop O(N²)', 'HashMap when O(1) space is explicitly demanded'],
      mathProof:
        'Each pointer moves monotonically toward the other at most N total steps, cutting N²/2 pair checks (~5×10^9 ops) down to <= N steps (~10^5 ops).',
    },
    blankPageDrill: {
      tinyInput: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
      manualQuestion:
        'With left=0 (height 1) and right=8 (height 7), why is moving the taller wall (right) guaranteed to NEVER improve the area?',
      memoryBridge:
        'Width strictly shrinks by 1 on every move, and water height is capped by min(h[L], h[R])—only moving the shorter wall can possibly raise the bottleneck.',
      bruteBottleneck: 'Checking every (i, j) pair wastes O(N²) work testing walls already limited by a shorter opposite wall.',
      invariantPrompt: 'At every step, moving the ___ pointer is provably lossless because no skipped pair can beat ___.',
      adversarialCases: [
        { label: 'Duplicate Triplets (3Sum)', input: '[-1, -1, 0, 1, 1]', trap: 'Must skip adjacent duplicate values for i, L, and R after a hit.' },
        { label: 'Two Elements Only', input: '[2, 2]', trap: 'Loop must be strict L < R (never L <= R) so an element is not paired with itself.' },
        { label: 'All Negatives', input: '[-5, -4, -3, -2]', trap: 'Do not assume target or values are positive.' },
        { label: 'Dutch Flag Swap', input: '[2, 0, 1]', trap: 'After swapping mid with high, do NOT increment mid until inspecting the swapped value.' },
      ],
    },
    coreInvariant:
      'Every step eliminates an entire row or column of dominated pairs by moving whichever pointer strictly cannot form a better answer.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Emitting duplicate triplets in 3Sum',
        badSnippet: 'if (sum === 0) { res.push([a[i], a[l], a[r]]); l++; r--; }',
        fixedSnippet:
          'if (sum === 0) { res.push([a[i], a[l], a[r]]); while (l < r && a[l] === a[l + 1]) l++; while (l < r && a[r] === a[r - 1]) r--; l++; r--; }',
        whyItHappens: 'Repeated adjacent numbers in a sorted array generate identical triplets unless both pointers skip over duplicates.',
      },
      {
        bugTitle: 'Advancing mid blindly after swapping with high in 3-way partition',
        badSnippet: 'if (nums[mid] === 2) { swap(mid, hi--); mid++; } // skips uninspected value!',
        fixedSnippet: 'if (nums[mid] === 2) { swap(mid, hi--); } // inspect newly arrived nums[mid] first',
        whyItHappens: 'The element coming back from hi has never been examined yet and could be 0 or 2.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'tp-two-sum-ii',
        title: 'Two Sum II — Sorted Array (#167)',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Opposite-end pointers converge on a sorted array in O(1) space',
        companyTags: ['Amazon', 'Google', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the pointer convergence loop to find the 1-indexed pair summing to target:',
          skeletonWithBlanks: `function twoSumSorted(nums: number[], target: number): number[] {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const sum = nums[l] + nums[r];
    if (sum === target) return [l + 1, r + 1];
    if (___BLANK_1___) l++;
    else ___BLANK_2___;
  }
  return [];
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Condition to raise the pair sum',
              expected: 'sum < target',
              acceptedKeywords: ['sum < target', 'target > sum'],
              hint: 'In a sorted array, moving l rightward increases the sum.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Move right pointer inward when sum is too large',
              expected: 'r--',
              acceptedKeywords: ['r--', 'r -= 1'],
              hint: 'Decrement the right index to decrease the sum.',
            },
          ],
        },
      },
      {
        problemId: 'tp-container-water',
        title: 'Container With Most Water (#11)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Greedy dominance proof decides which wall pointer moves inward',
        companyTags: ['Google', 'Meta', 'Amazon', 'Bloomberg'],
        trainerSlug: 'container-with-most-water',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the area calculation and shorter-wall advancement rule:',
          skeletonWithBlanks: `function maxArea(h: number[]): number {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, ___BLANK_1___);
    if (___BLANK_2___) l++;
    else r--;
  }
  return best;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Water area bounded by shorter wall × width',
              expected: 'Math.min(h[l], h[r]) * (r - l)',
              acceptedKeywords: ['Math.min', 'r - l'],
              hint: 'Area = min(leftHeight, rightHeight) multiplied by (r - l).',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Advance the shorter side',
              expected: 'h[l] < h[r]',
              acceptedKeywords: ['h[l] < h[r]', 'h[l] <= h[r]'],
              hint: 'Move l when left wall is shorter than right wall.',
            },
          ],
        },
      },
      {
        problemId: 'tp-trapping-rain',
        title: 'Trapping Rain Water (#42)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Track running leftMax and rightMax to accumulate trapped water in O(1) space',
        companyTags: ['Google', 'Amazon', 'Meta', 'Goldman Sachs'],
        trainerSlug: 'trapping-rain-water',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(1)-space rain-trapping update when the left boundary is the bottleneck:',
          skeletonWithBlanks: `function trap(h: number[]): number {
  let l = 0, r = h.length - 1, lMax = 0, rMax = 0, water = 0;
  while (l < r) {
    if (h[l] <= h[r]) {
      lMax = Math.max(lMax, h[l]);
      water += ___BLANK_1___;
      l++;
    } else {
      rMax = Math.max(rMax, h[r]);
      water += ___BLANK_2___;
      r--;
    }
  }
  return water;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Water trapped above index l',
              expected: 'lMax - h[l]',
              acceptedKeywords: ['lMax - h[l]'],
              hint: 'Because h[l] <= h[r], lMax is guaranteed <= rMax, so trapped water is lMax - h[l].',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Water trapped above index r',
              expected: 'rMax - h[r]',
              acceptedKeywords: ['rMax - h[r]'],
              hint: 'Symmetrically, trapped water on the right is rMax - h[r].',
            },
          ],
        },
      },
    ],
  },

  'prefix-sum-diff-array': {
    id: 'prefix-sum-diff-array',
    title: 'Prefix Sums & Difference Arrays',
    category: 'Linear Structures',
    eli5Analogy:
      'Think of a car odometer on a highway trip: to find the exact distance driven between Mile Marker 3 and Mile Marker 7, you never re-drive the road—you simply subtract Odometer(7) minus Odometer(3) in one subtraction.',
    whenToUse: [
      'Repeated static range-sum queries sum(L..R) that must answer in O(1) after O(N) build',
      'Counting subarrays with sum == K or divisible by K when elements CAN BE NEGATIVE (breaking sliding window)',
      'Applying thousands of batch range updates [L..R] += delta before reading the final array once (Difference Array)',
    ],
    whenNotToUse: [
      'Point updates and range-sum queries are interleaved online (upgrade to Fenwick Tree / Segment Tree)',
      'Asked for Range Minimum/Maximum Query (min/max has no inverse like subtraction; use Segment Tree / Sparse Table)',
      'All values are positive and you need longest/shortest subarray <= K in O(1) space (Sliding Window uses less RAM)',
    ],
    constraintGuide: {
      inputBound: '1 <= N, Q <= 10^5 (with negative numbers allowed)',
      expectedComplexity: 'O(N) build · O(1) query · O(N) space',
      correctTierId: 'n',
      eliminatedApproaches: ['Re-summing every [L..R] subarray in O(N²)', 'Sliding Window (invalid with negative values)'],
      mathProof:
        'At N = 10^5, testing every (L, R) pair takes 5×10^9 ops (TLE). Precomputing prefix sums reduces every range query or complement lookup to O(1), finishing in 10^5 ops.',
    },
    blankPageDrill: {
      tinyInput: 'nums = [3, 4, -7, 1, 3, 3], k = 7',
      manualQuestion:
        'At index 1 (prefix = 7), why does forgetting to initialize freq = { 0: 1 } miss the valid subarray [3, 4]?',
      memoryBridge: 'prefix[R] - prefix[L-1] = k means we need to count how many earlier prefixes equalled (prefix - k).',
      bruteBottleneck: 'Re-adding the same overlapping elements across nested (i, j) loops repeats O(N²) additions.',
      invariantPrompt: 'Before inserting the current prefix into the map, we look up ___ and must seed ___ for index-0 matches.',
      adversarialCases: [
        { label: 'Starts at Index 0', input: 'nums = [7], k = 7', trap: 'Fails unless map starts with { 0: 1 }.' },
        { label: 'Target k = 0', input: 'nums = [1, -1, 0], k = 0', trap: 'If you insert prefix BEFORE querying (prefix - 0), you self-count empty subarrays!' },
        { label: 'Negative Remainder', input: 'nums = [-1, 2, 9], k = 2', trap: 'In JS/Java, -1 % 2 = -1; normalize with ((sum % k) + k) % k.' },
        { label: 'Difference Boundary', input: 'diff[r + 1] -= val', trap: 'Allocate diff array of length N + 1 so r = N - 1 never goes out of bounds.' },
      ],
    },
    coreInvariant:
      'Every contiguous range [L..R] equals prefix[R + 1] - prefix[L], turning subarray sum equations into O(1) hash lookups even with negative numbers.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Forgetting to seed empty prefix { 0: 1 }',
        badSnippet: 'const freq = new Map<number, number>(); // misses subarrays starting at index 0!',
        fixedSnippet: 'const freq = new Map<number, number>([[0, 1]]);',
        whyItHappens: 'A subarray [0..i] has sum equal to prefix[i] - 0, which requires prefix 0 to have been seen once before index 0.',
      },
      {
        bugTitle: 'Unnormalized negative modulo in Subarray Sums Divisible by K',
        badSnippet: 'const rem = prefix % k; // -1 % 5 is -1 in JS/Java, not 4!',
        fixedSnippet: 'const rem = ((prefix % k) + k) % k;',
        whyItHappens: 'JavaScript and Java keep the negative sign on remainder, splitting mathematically equivalent residues into separate map keys.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'ps-subarray-k',
        title: 'Subarray Sum Equals K (#560)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Running prefix sum + HashMap count handles positive, zero, and negative numbers',
        companyTags: ['Meta', 'Google', 'Amazon', 'Microsoft'],
        trainerSlug: 'subarray-sum-equals-k',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the empty-prefix seed and complement lookup order:',
          skeletonWithBlanks: `function subarraySum(nums: number[], k: number): number {
  const freq = new Map<number, number>([___BLANK_1___]);
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += freq.get(___BLANK_2___) ?? 0;
    freq.set(prefix, (freq.get(prefix) ?? 0) + 1);
  }
  return count;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Initial empty prefix entry',
              expected: '[0, 1]',
              acceptedKeywords: ['[0, 1]', '[0,1]'],
              hint: 'Prefix sum 0 occurs once before scanning any elements.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Prior prefix needed to form sum k',
              expected: 'prefix - k',
              acceptedKeywords: ['prefix - k'],
              hint: 'Solve prefix - prior = k for prior.',
            },
          ],
        },
      },
      {
        problemId: 'ps-product-except-self',
        title: 'Product of Array Except Self (#238)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Prefix product × suffix product computed directly in the output array in O(1) extra space',
        companyTags: ['Amazon', 'Meta', 'Apple', 'Asana'],
        trainerSlug: 'product-of-array-except-self',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the backward suffix multiplication pass without using division:',
          skeletonWithBlanks: `function productExceptSelf(nums: number[]): number[] {
  const res = new Array(nums.length).fill(1);
  let pref = 1;
  for (let i = 0; i < nums.length; i++) { res[i] = pref; pref *= nums[i]; }
  let suff = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    res[i] *= ___BLANK_1___;
    suff *= ___BLANK_2___;
  }
  return res;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Multiply stored prefix by running suffix product',
              expected: 'suff',
              acceptedKeywords: ['suff'],
              hint: 'At index i, suff holds the product of all elements strictly right of i.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Include nums[i] into suffix for the next leftward index',
              expected: 'nums[i]',
              acceptedKeywords: ['nums[i]'],
              hint: 'Update suff after applying it to res[i].',
            },
          ],
        },
      },
      {
        problemId: 'ps-flight-bookings',
        title: 'Corporate Flight Bookings (#1109)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 2 · Flip Prefix Sum into a Difference Array for O(1) batch range additions',
        companyTags: ['Google', 'Uber', 'Booking.com'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the two O(1) difference-array markers for inclusive 1-based range [first..last]:',
          skeletonWithBlanks: `function corpFlightBookings(bookings: number[][], n: number): number[] {
  const diff = new Array(n + 1).fill(0);
  for (const [first, last, seats] of bookings) {
    diff[first - 1] += ___BLANK_1___;
    diff[___BLANK_2___] -= seats;
  }
  const ans = new Array(n).fill(0);
  let run = 0;
  for (let i = 0; i < n; i++) { run += diff[i]; ans[i] = run; }
  return ans;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Range increment delta at start boundary',
              expected: 'seats',
              acceptedKeywords: ['seats'],
              hint: 'Add seats starting at index first - 1.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Index right after range end where delta cancels out',
              expected: 'last',
              acceptedKeywords: ['last'],
              hint: 'Because bookings are 1-indexed, index (last - 1) + 1 equals last.',
            },
          ],
        },
      },
    ],
  },

  'queues-monotonic-deque': {
    id: 'queues-monotonic-deque',
    title: 'Queues & Monotonic Deques',
    category: 'Linear Structures',
    eli5Analogy:
      'Think of a scoreboard watching the tallest basketball player on a moving conveyor belt of length K: anyone who steps off the front of the belt is dismissed immediately, and any shorter player already standing on the belt gets permanently overshadowed the moment a taller newcomer steps on.',
    whenToUse: [
      'Need the sliding window maximum or minimum over every contiguous k-length subarray in O(N)',
      'Shortest subarray with sum >= K when negative numbers exist (monotonic increasing deque over prefix sums)',
      '0-1 BFS (edges weigh 0 or 1: push 0-cost to front, 1-cost to back) or strict FIFO level-order scheduling',
    ],
    whenNotToUse: [
      'Need the K-th largest or median inside a sliding window (monotonic deque only tracks extrema; use two heaps/BST)',
      'Only need next greater element without a fixed window expiry boundary (a simpler Monotonic Stack suffices)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5, 1 <= k <= N',
      expectedComplexity: 'O(N) amortized time, O(k) space',
      correctTierId: 'n',
      eliminatedApproaches: ['Re-scanning k elements per window O(N·k)', 'Priority Queue O(N log N) when linear O(N) is expected'],
      mathProof:
        'Each index is pushed onto the deque back once and popped from either front or back at most once, bounding total operations strictly to 2N.',
    },
    blankPageDrill: {
      tinyInput: 'nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3',
      manualQuestion:
        'When 5 arrives at index 4, why can we permanently discard -1 and -3 from the back of the deque?',
      memoryBridge: 'Both -1 and -3 are older AND smaller than 5—they will leave the window before 5 does and can never outrank 5.',
      bruteBottleneck: 'Scanning all k numbers at each shift does O(N·k) comparisons (2.5×10^9 when k = N/2).',
      invariantPrompt: 'The deque stores valid in-window ___ ordered strictly ___ by value, so the front is always the window maximum.',
      adversarialCases: [
        { label: 'Window Size k = 1', input: 'nums = [4, -2], k = 1', trap: 'Front expires every step; output must equal nums.' },
        { label: 'Strictly Decreasing', input: '[9, 8, 7, 6], k = 2', trap: 'Back never pops, so FRONT expiry (dq[head] <= i - k) does all the work.' },
        { label: 'Duplicate Maxima', input: '[5, 5, 5, 1], k = 2', trap: 'Using <= when popping back keeps only the newest index so it lasts longest.' },
        { label: 'JS shift() Trap', input: 'N = 10^5, k = 50000', trap: 'Calling dq.shift() in JS is O(k) per pop; use a head pointer instead.' },
      ],
    },
    coreInvariant:
      'The deque holds indices inside [i - k + 1 .. i] whose values strictly decrease from front to back, placing the exact window maximum at the front in O(1).',
    commonBugsAndTraps: [
      {
        bugTitle: 'Using Array.shift() instead of a moving head pointer',
        badSnippet: 'if (dq[0] <= i - k) dq.shift(); // O(N) array shift in JS!',
        fixedSnippet: 'if (dq[head] <= i - k) head++; // true O(1) front expiry',
        whyItHappens: 'JavaScript arrays copy every remaining element left on shift(), silently turning O(N) into O(N²) on large windows.',
      },
      {
        bugTitle: 'Checking stale front using value instead of index',
        badSnippet: 'if (dq[head] === nums[i - k]) head++; // breaks on duplicates!',
        fixedSnippet: 'if (dq[head] <= i - k) head++; // exact index expiry',
        whyItHappens: 'Storing indices guarantees unambiguous expiry regardless of duplicate values.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'dq-sliding-max',
        title: 'Sliding Window Maximum (#239)',
        difficulty: 'Hard',
        mutationDelta: 'Base Form · Monotonic decreasing index deque with front expiry and back dominance eviction',
        companyTags: ['Google', 'Amazon', 'Meta', 'Uber'],
        trainerSlug: 'sliding-window-maximum',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete front expiry and back dominance eviction using a head pointer:',
          skeletonWithBlanks: `function maxSlidingWindow(nums: number[], k: number): number[] {
  const dq: number[] = [], res: number[] = [];
  let head = 0;
  for (let i = 0; i < nums.length; i++) {
    if (head < dq.length && ___BLANK_1___) head++;
    while (head < dq.length && ___BLANK_2___) dq.pop();
    dq.push(i);
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Expire front index outside window [i-k+1 .. i]',
              expected: 'dq[head] <= i - k',
              acceptedKeywords: ['dq[head] <= i - k', 'dq[head] < i - k + 1'],
              hint: 'An index at or before i - k has slid out of the k-length window.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Evict smaller dominated values from the back',
              expected: 'nums[dq[dq.length - 1]] <= nums[i]',
              acceptedKeywords: ['nums[dq[dq.length - 1]]', '<= nums[i]', '< nums[i]'],
              hint: 'Compare the value at the back index against nums[i].',
            },
          ],
        },
      },
      {
        problemId: 'dq-longest-limit',
        title: 'Longest Subarray With Abs Diff <= Limit (#1438)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Run TWO monotonic deques simultaneously (maxDeque + minDeque) inside a variable sliding window',
        companyTags: ['Google', 'Uber', 'ByteDance'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the shrink condition comparing current window maximum and minimum:',
          skeletonWithBlanks: `while (___BLANK_1___ > limit) {
  if (maxDq[maxH] === l) maxH++;
  if (minDq[minH] === l) minH++;
  ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Difference between current window max and min',
              expected: 'nums[maxDq[maxH]] - nums[minDq[minH]]',
              acceptedKeywords: ['nums[maxDq', 'nums[minDq', '-'],
              hint: 'Subtract the minimum deque front value from the maximum deque front value.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Advance left window edge',
              expected: 'l++',
              acceptedKeywords: ['l++', 'l += 1'],
              hint: 'Shrink window from the left after expiring any front matching l.',
            },
          ],
        },
      },
      {
        problemId: 'dq-shortest-at-least-k',
        title: 'Shortest Subarray with Sum at Least K (#862)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Combine Prefix Sums with a Monotonic Increasing Deque to handle negative numbers in O(N)',
        companyTags: ['Google', 'Goldman Sachs', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the front-pop valid-subarray check over prefix sums:',
          skeletonWithBlanks: `for (let i = 0; i <= n; i++) {
  while (head < dq.length && ___BLANK_1___) {
    best = Math.min(best, i - dq[head++]);
  }
  while (head < dq.length && pref[dq[dq.length - 1]] >= pref[i]) ___BLANK_2___;
  dq.push(i);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Check if subarray from dq[head] to i reaches sum >= k',
              expected: 'pref[i] - pref[dq[head]] >= k',
              acceptedKeywords: ['pref[i] - pref[dq[head]]', '>= k'],
              hint: 'Subarray sum equals current prefix minus earliest candidate prefix.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Discard larger prior prefixes that can never form a shorter valid range',
              expected: 'dq.pop()',
              acceptedKeywords: ['dq.pop()'],
              hint: 'Pop from the back to keep prefixes strictly increasing.',
            },
          ],
        },
      },
    ],
  },

  'sorting-algorithms': {
    id: 'sorting-algorithms',
    title: 'Sorting Algorithms (Merge, Quick, Cyclic & Counting)',
    category: 'Foundations',
    eli5Analogy:
      'Think of organizing a messy deck of cards: Merge Sort splits the deck in half recursively and zips sorted halves cleanly; QuickSort picks a divider card and throws smaller cards left and bigger cards right; Cyclic Sort places numbered cards 1..N straight into their exact matching slot.',
    whenToUse: [
      'Need guaranteed worst-case O(N log N), stability, linked-list sorting, or inversion counting (Merge Sort)',
      'Need K-th largest/smallest element in O(N) average time without sorting the whole array (Quickselect)',
      'Values are strictly in [1..N] or [0..N] and O(1) space is demanded (Cyclic Sort — Find Missing / Duplicate)',
      'Small bounded integer keys or character frequencies where O(N + K) beats O(N log N) (Counting / Bucket Sort)',
    ],
    whenNotToUse: [
      'Data arrives as an unbounded online stream (use a Min/Max Heap or Balanced BST instead)',
      'Problem asks to preserve original relative indices unless you pair values with indices before sorting',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 2 × 10^5 elements',
      expectedComplexity: 'O(N log N) comparison · O(N) Quickselect / Cyclic / Bucket',
      correctTierId: 'nlogn',
      eliminatedApproaches: ['Bubble / Insertion / Selection Sort O(N²)', 'Deterministic first-element QuickSort on sorted input'],
      mathProof:
        'Information-theoretic lower bound proves any comparison sort needs at least log₂(N!) = Ω(N log N) comparisons; beating it requires structure (Cyclic/Counting/Bucket) or partial order (Quickselect).',
    },
    blankPageDrill: {
      tinyInput: 'nums = [3, 1, 5, 4, 2] (Cyclic Sort) & [5, 2, 6, 1] (Inversions)',
      manualQuestion:
        'In Cyclic Sort on [3, 1, 5, 4, 2], why do we use a `while` swap at index `i` instead of moving `i++` right after one swap?',
      memoryBridge: 'Each swap puts at least one number into its permanent final home, so total swaps across the entire array is at most N.',
      bruteBottleneck: 'O(N²) comparison sorts perform 5×10^9 swaps at N=10^5, whereas Merge/Quick/Cyclic finish in milliseconds.',
      invariantPrompt: 'In Merge Sort inversion counting, whenever right[j] < left[i], EVERY remaining element in ___ forms an inversion.',
      adversarialCases: [
        { label: 'Already Sorted QuickSort', input: '[1, 2, 3, 4, 5, ...]', trap: 'Picking pivot = arr[hi] degrades QuickSort to O(N²); always randomize pivot.' },
        { label: 'JS Default Sort Bug', input: '[10, 2, 30]', trap: 'nums.sort() sorts as strings -> [10, 2, 30]! Always pass (a, b) => a - b.' },
        { label: 'Duplicate in Cyclic Sort', input: '[1, 3, 4, 2, 2]', trap: 'Check nums[i] !== nums[targetIdx] before swapping to avoid infinite loop.' },
        { label: 'Custom String Comparator', input: '[3, 30, 34]', trap: 'Compare (b + a) vs (a + b) to form Largest Number.' },
      ],
    },
    coreInvariant:
      'Match the sorting engine to the constraint: Merge Sort for stability/inversions, Randomized Quickselect for O(N) K-th order, Cyclic Sort for [1..N] in O(1) space, and Bucket Sort for O(N) Top-K.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Calling JavaScript .sort() without a numeric comparator',
        badSnippet: 'nums.sort(); // [10, 2, 1] becomes [1, 10, 2]!',
        fixedSnippet: 'nums.sort((a, b) => a - b);',
        whyItHappens: 'JavaScript converts elements to UTF-16 strings by default when no comparator function is provided.',
      },
      {
        bugTitle: 'Infinite swap loop on duplicates in Cyclic Sort',
        badSnippet: 'while (nums[i] !== i + 1) swap(i, nums[i] - 1); // hangs if duplicate!',
        fixedSnippet: 'while (nums[i] >= 1 && nums[i] <= n && nums[i] !== nums[nums[i] - 1]) swap(i, nums[i] - 1);',
        whyItHappens: 'If the destination slot already contains the same duplicate number, swapping exchanges equal values forever.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'sort-colors-75',
        title: 'Sort Colors / Dutch National Flag (#75)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Single-pass 3-way partition sorts 3 keys in O(N) time and O(1) space',
        companyTags: ['Microsoft', 'Amazon', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the 3-way Dutch National Flag partition updates:',
          skeletonWithBlanks: `let lo = 0, mid = 0, hi = nums.length - 1;
while (mid <= hi) {
  if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; ___BLANK_1___; }
  else if (nums[mid] === 1) mid++;
  else { [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; ___BLANK_2___; }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Advance both lo and mid after placing 0',
              expected: 'lo++; mid++',
              acceptedKeywords: ['lo++', 'mid++'],
              hint: 'Everything left of mid is already 0 or 1, so both lo and mid move forward.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Shrink hi without advancing mid',
              expected: 'hi--',
              acceptedKeywords: ['hi--'],
              hint: 'Only decrement hi because the swapped element from hi is uninspected.',
            },
          ],
        },
      },
      {
        problemId: 'sort-kth-largest',
        title: 'Kth Largest Element via Quickselect (#215)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Recurse into ONLY the partition side containing index (n - k) for O(N) average time',
        companyTags: ['Meta', 'Amazon', 'Google', 'LinkedIn'],
        trainerSlug: 'kth-largest-element-in-an-array',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the single-branch Quickselect narrowing step:',
          skeletonWithBlanks: `const target = nums.length - k;
while (lo <= hi) {
  const p = partition(nums, lo, hi);
  if (p === target) return nums[p];
  if (p < target) ___BLANK_1___;
  else ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Search right partition when pivot index is too small',
              expected: 'lo = p + 1',
              acceptedKeywords: ['lo = p + 1'],
              hint: 'Discard the left half including p.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Search left partition when pivot index is too large',
              expected: 'hi = p - 1',
              acceptedKeywords: ['hi = p - 1'],
              hint: 'Discard the right half including p.',
            },
          ],
        },
      },
      {
        problemId: 'sort-first-missing-pos',
        title: 'First Missing Positive (#41)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Cyclic Sort places every positive x in [1..N] at index x - 1 in O(N) time and O(1) space',
        companyTags: ['Google', 'Amazon', 'Meta', 'Stripe'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the cyclic placement guard and final missing-slot scan:',
          skeletonWithBlanks: `for (let i = 0; i < n; i++) {
  while (nums[i] >= 1 && nums[i] <= n && ___BLANK_1___) {
    const j = nums[i] - 1;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
}
for (let i = 0; i < n; i++) if (___BLANK_2___) return i + 1;
return n + 1;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Guard preventing duplicate infinite swap',
              expected: 'nums[nums[i] - 1] !== nums[i]',
              acceptedKeywords: ['nums[nums[i] - 1] !== nums[i]', 'nums[i] !== nums[nums[i] - 1]'],
              hint: 'Only swap when the target slot does not already hold nums[i].',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Detect first misplaced index',
              expected: 'nums[i] !== i + 1',
              acceptedKeywords: ['nums[i] !== i + 1'],
              hint: 'Index i should hold value i + 1.',
            },
          ],
        },
      },
    ],
  },

  'linked-lists': {
    id: 'linked-lists',
    title: 'Linked Lists (Reversal, Cycles & LRU)',
    category: 'Pointer Structures',
    eli5Analogy:
      'Think of a scavenger hunt where each envelope holds only the address of the next envelope: to reverse the trail without losing the rest of the hunt, you MUST write down the next address on a sticky note before overwriting the current card.',
    whenToUse: [
      'O(1) head/middle node insertion, deletion, or splicing once you hold the predecessor pointer (LRU Cache)',
      'In-place reversal, merging sorted chains, finding midpoint, or detecting cycles in O(1) extra space',
      'Problems explicitly forbidding copying nodes into an O(N) array',
    ],
    whenNotToUse: [
      'Frequent random index lookups arr[k] (linked lists need O(N) traversal vs O(1) array indexing)',
      'Heavy numerical computation requiring CPU cache locality (contiguous arrays are dramatically faster)',
    ],
    constraintGuide: {
      inputBound: '0 <= N <= 10^5 nodes',
      expectedComplexity: 'O(N) time, O(1) auxiliary space',
      correctTierId: 'n',
      eliminatedApproaches: ['Copying values into an auxiliary Array O(N) space', 'Nested cycle check O(N²)'],
      mathProof:
        'Each pointer visits each node at most twice (slow/fast or prev/curr), achieving O(N) time and strictly O(1) memory even for 100k nodes.',
    },
    blankPageDrill: {
      tinyInput: '1 -> 2 -> 3 -> 4 -> null',
      manualQuestion:
        'In 3-pointer reversal, what happens immediately if you write `curr.next = prev` BEFORE saving `const next = curr.next`?',
      memoryBridge: 'Dummy sentinel eliminates head-deletion edge cases; `next = curr.next` protects the remaining chain.',
      bruteBottleneck: 'Using a HashSet to detect cycles or an Array to reverse wastes O(N) RAM when pointers do it in O(1).',
      invariantPrompt: 'During reversal, `prev` is always the head of the ___ prefix and `curr` is the head of the ___ suffix.',
      adversarialCases: [
        { label: 'Empty or 1-Node List', input: 'head = null or [1]', trap: 'Must guard fast && fast.next before dereferencing fast.next.next.' },
        { label: 'Delete Head Node', input: 'Remove 1st node of [1, 2]', trap: 'Without a dummy sentinel pointing to head, head-deletion needs separate branches.' },
        { label: 'Even-Length Mid Split', input: '[1, 2, 3, 4]', trap: 'Sever the left tail (slow.next = null) before reversing right half or you create a cycle!' },
        { label: 'LRU Capacity 1', input: 'cap = 1, put(1), put(2)', trap: 'Evict before/after inserting cleanly using permanent dummy head & tail sentinels.' },
      ],
    },
    coreInvariant:
      'Attach a dummy sentinel before mutating heads, save `next = curr.next` before rewiring pointers, and pair slow/fast pointers for O(1)-space cycle and midpoint splits.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Null crash in fast/slow loop guard',
        badSnippet: 'while (fast.next !== null) { fast = fast.next.next; } // crashes when fast is null!',
        fixedSnippet: 'while (fast !== null && fast.next !== null) { slow = slow.next; fast = fast.next.next; }',
        whyItHappens: 'On even-length lists, `fast.next.next` lands directly on `null`, causing a TypeError on the next condition check.',
      },
      {
        bugTitle: 'Forgetting to sever left half in Reorder List / Merge Sort',
        badSnippet: 'let second = reverse(slow.next); // slow.next STILL points into reversed tail -> cycle!',
        fixedSnippet: 'const right = slow.next; slow.next = null; let second = reverse(right);',
        whyItHappens: 'Leaving the old link intact creates a 2-node infinite cycle during interleaving.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'll-reverse-206',
        title: 'Reverse Linked List (#206)',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · 3-pointer in-place reversal (prev, curr, next) in O(1) space',
        companyTags: ['Amazon', 'Microsoft', 'Apple', 'Meta'],
        trainerSlug: 'reverse-linked-list',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the 4-line 3-pointer reversal invariant:',
          skeletonWithBlanks: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null, curr = head;
  while (curr !== null) {
    const next = ___BLANK_1___;
    curr.next = ___BLANK_2___;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Save remaining suffix before breaking link',
              expected: 'curr.next',
              acceptedKeywords: ['curr.next'],
              hint: 'Store the pointer to the next node first.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Point current node backward to reversed prefix',
              expected: 'prev',
              acceptedKeywords: ['prev'],
              hint: 'Redirect curr.next to prev.',
            },
          ],
        },
      },
      {
        problemId: 'll-reorder-143',
        title: 'Reorder List (#143)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Compose 3 primitives: Find Mid (slow/fast) -> Sever & Reverse Right -> Interleave',
        companyTags: ['Meta', 'Amazon', 'Google'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the midpoint severing and alternating interleave pointer steps:',
          skeletonWithBlanks: `// slow is at midpoint
let second = reverse(slow.next);
___BLANK_1___; // sever first half cleanly
let first = head;
while (second) {
  const t1 = first.next, t2 = second.next;
  first.next = second;
  second.next = ___BLANK_2___;
  first = t1; second = t2;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Terminate first half tail to avoid cycles',
              expected: 'slow.next = null',
              acceptedKeywords: ['slow.next = null'],
              hint: 'Set slow.next to null after grabbing the right half.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Reconnect second node back to remaining first half',
              expected: 't1',
              acceptedKeywords: ['t1'],
              hint: 'Link second.next to the saved first.next (t1).',
            },
          ],
        },
      },
      {
        problemId: 'll-lru-146',
        title: 'LRU Cache (#146)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 2 · HashMap (O(1) lookup) + Sentinel Doubly Linked List (O(1) move-to-front & tail eviction)',
        companyTags: ['Google', 'Meta', 'Amazon', 'Uber', 'Stripe'],
        trainerSlug: 'lru-cache',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(1) doubly linked node unlink helper:',
          skeletonWithBlanks: `private remove(node: DNode): void {
  const prev = node.prev!, next = node.next!;
  prev.next = ___BLANK_1___;
  next.prev = ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Bypass node going forward',
              expected: 'next',
              acceptedKeywords: ['next'],
              hint: 'Connect prev directly to next.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Bypass node going backward',
              expected: 'prev',
              acceptedKeywords: ['prev'],
              hint: 'Connect next.prev directly to prev.',
            },
          ],
        },
      },
    ],
  },

  'trees-bst-nary': {
    id: 'trees-bst-nary',
    title: 'Trees (Binary, BST & N-ary)',
    category: 'Trees & Graphs',
    eli5Analogy:
      'Think of a company org chart: in Bottom-Up (Postorder) questions like Diameter or Max Path Sum, every manager asks their two direct reports for their best single-branch number before reporting upward; in Top-Down (Preorder) questions like Validate BST, the CEO passes strict min/max rules down to every employee.',
    whenToUse: [
      'Hierarchical parent-child data where every subtree is a smaller identical subproblem (Postorder DFS)',
      'Level-by-level visibility, shortest root-to-leaf depth, or right-side view (BFS Queue with levelSize snapshot)',
      'Ordered dynamic lookups, K-th smallest, or predecessor/successor queries (BST Inorder traversal)',
    ],
    whenNotToUse: [
      'Graph contains cycles or multiple parents per node (needs visited set + Graph BFS/DFS instead of Tree DFS)',
      'Need arbitrary range updates over flat array indices (use Segment / Fenwick Tree)',
    ],
    constraintGuide: {
      inputBound: '0 <= N <= 10^5 nodes',
      expectedComplexity: 'O(N) time · O(H) call stack (O(log N) balanced, O(N) skewed)',
      correctTierId: 'n',
      eliminatedApproaches: ['Recomputing subtree height inside every node visit O(N²)', 'Validating BST only against immediate children'],
      mathProof:
        'A single postorder DFS visits every node and edge once (O(N)), avoiding the O(N²) trap of calling height(left) at every ancestor.',
    },
    blankPageDrill: {
      tinyInput: 'root = [-10, 9, 20, null, null, 15, 7] (Max Path Sum)',
      manualQuestion:
        'At node 20 (children 15 and 7), why is the best path THROUGH 20 equal to 15+20+7=42, yet 20 can only RETURN 20+15=35 to its parent -10?',
      memoryBridge: 'A path cannot fork twice: update globalMax with a split (L + node + R), return ONLY a single upward branch (node + max(L, R)).',
      bruteBottleneck: 'Calling height() or pathSum() freshly from each node repeats O(N²) work on skewed trees.',
      invariantPrompt: 'In Postorder tree DP, ___ may combine both left and right children, while the ___ must pick at most one child.',
      adversarialCases: [
        { label: 'All Negative Values', input: '[-3, -2, -1]', trap: 'Initialize globalMax = -Infinity (not 0), and clamp child gains with Math.max(0, gain).' },
        { label: 'Deep BST Violation', input: '[5, 4, 6, null, null, 3, 7]', trap: '3 < 6 looks locally valid, but violates 3 > root(5)! Propagate (lo, hi) bounds.' },
        { label: 'Skewed Chain Tree', input: '1 -> 2 -> ... -> 10^4', trap: 'Call stack height H = N (not log N); mention iterative stack for deep trees.' },
        { label: 'BFS Level Boundary', input: 'Right Side View', trap: 'Freeze `const size = queue.length` BEFORE iterating each level.' },
      ],
    },
    coreInvariant:
      'Decide immediately between Bottom-Up Postorder (combine child returns; separate global split from upward branch) vs Top-Down Preorder (pass ancestor constraints downward).',
    commonBugsAndTraps: [
      {
        bugTitle: 'Checking only immediate children in Validate BST',
        badSnippet: 'return node.left.val < node.val && node.right.val > node.val; // misses deep violations!',
        fixedSnippet: 'return node.val > lo && node.val < hi && dfs(node.left, lo, node.val) && dfs(node.right, node.val, hi);',
        whyItHappens: 'A node deep in the right subtree must stay strictly greater than ALL ancestors that turned right, not just its direct parent.',
      },
      {
        bugTitle: 'Returning forked path (left + node + right) to parent in Max Path Sum',
        badSnippet: 'return left + node.val + right; // illegal branch fork!',
        fixedSnippet: 'globalMax = Math.max(globalMax, left + node.val + right); return node.val + Math.max(left, right);',
        whyItHappens: 'A simple tree path can visit each vertex at most once; once it splits across both children it cannot also continue upward.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'tree-validate-bst',
        title: 'Validate Binary Search Tree (#98)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Top-down (min, max) bound propagation in O(N)',
        companyTags: ['Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
        trainerSlug: 'validate-binary-search-tree',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the top-down strict BST range recursion:',
          skeletonWithBlanks: `function isValid(node: TreeNode | null, lo = -Infinity, hi = Infinity): boolean {
  if (!node) return true;
  if (___BLANK_1___) return false;
  return isValid(node.left, lo, ___BLANK_2___) && isValid(node.right, node.val, hi);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Reject node violating strict (lo, hi) bounds',
              expected: 'node.val <= lo || node.val >= hi',
              acceptedKeywords: ['<= lo', '>= hi'],
              hint: 'BST requires strict inequality: lo < node.val < hi.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Tightened upper bound for left subtree',
              expected: 'node.val',
              acceptedKeywords: ['node.val'],
              hint: 'Every node in the left subtree must be strictly less than node.val.',
            },
          ],
        },
      },
      {
        problemId: 'tree-lca-236',
        title: 'Lowest Common Ancestor of a Binary Tree (#236)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Bottom-up postorder bubbles found targets up; first node receiving non-null from both sides is LCA',
        companyTags: ['Meta', 'Google', 'Amazon', 'LinkedIn'],
        trainerSlug: 'lowest-common-ancestor-of-a-binary-tree',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the postorder LCA merge decision:',
          skeletonWithBlanks: `function lca(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
  if (!root || root === p || root === q) return root;
  const left = lca(root.left, p, q);
  const right = lca(root.right, p, q);
  if (___BLANK_1___) return root;
  return ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Condition proving p and q live in opposite subtrees',
              expected: 'left && right',
              acceptedKeywords: ['left && right', 'left !== null && right !== null'],
              hint: 'Both recursive calls returned non-null.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Bubble up whichever side found a target (or null)',
              expected: 'left ?? right',
              acceptedKeywords: ['left ?? right', 'left || right', 'left ? left : right'],
              hint: 'Return the non-null child result.',
            },
          ],
        },
      },
      {
        problemId: 'tree-max-path-124',
        title: 'Binary Tree Maximum Path Sum (#124)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Separate global split-path update from single-branch return gain with zero-clamping',
        companyTags: ['Google', 'Meta', 'Amazon', 'DoorDash'],
        trainerSlug: 'binary-tree-maximum-path-sum',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the postorder gain clamping and upward return contract:',
          skeletonWithBlanks: `let best = -Infinity;
function gain(node: TreeNode | null): number {
  if (!node) return 0;
  const l = Math.max(0, gain(node.left));
  const r = Math.max(0, gain(node.right));
  best = Math.max(best, ___BLANK_1___);
  return ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Best path splitting across current node',
              expected: 'l + node.val + r',
              acceptedKeywords: ['l + node.val + r', 'node.val + l + r'],
              hint: 'Combine clamped left gain, node value, and clamped right gain.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Best single branch extendable by parent',
              expected: 'node.val + Math.max(l, r)',
              acceptedKeywords: ['node.val + Math.max(l, r)', 'Math.max(l, r) + node.val'],
              hint: 'Return node.val plus only the larger of l or r.',
            },
          ],
        },
      },
    ],
  },

  'tries-radix': {
    id: 'tries-radix',
    title: 'Tries (Standard & Compressed/Radix)',
    category: 'Trees & Graphs',
    eli5Analogy:
      'Think of a city street directory organized letter-by-letter into branching corridors: "apple" and "app" share the exact same corridor A→P→P, with a small green flag posted at the third room to show "app" is a complete word.',
    whenToUse: [
      'Prefix autocomplete, dictionary validation, or wildcard "." searches over thousands of strings',
      'Searching many dictionary words simultaneously on a 2D letter board (Word Search II — prune dead prefixes instantly)',
      'Maximum XOR of Two Numbers in an array (Binary Bitwise Trie greedily picks opposite bits MSB→LSB)',
    ],
    whenNotToUse: [
      'Need typo-tolerant fuzzy search where the very first character might be misspelled (use N-Gram Inverted Index)',
      'Only checking exact full-word membership with zero prefix queries (a plain HashSet uses far less memory)',
    ],
    constraintGuide: {
      inputBound: 'M <= 3×10^4 words, word length L <= 30',
      expectedComplexity: 'O(L) per insert / search / startsWith · O(Total Chars) space',
      correctTierId: 'n',
      eliminatedApproaches: ['Scanning all M words per prefix query O(M · L)', 'Running separate grid DFS per word in Word Search II'],
      mathProof:
        'A Trie lookup depends ONLY on query length L (e.g., 10 hops), completely independent of whether the dictionary holds 100 or 1,000,000 words.',
    },
    blankPageDrill: {
      tinyInput: 'words = ["oath", "pea", "eat", "rain"] on 4×4 board',
      manualQuestion:
        'Why does storing `node.word = fullWord` at the Trie leaf and deleting exhausted leaves make Word Search II 10× faster?',
      memoryBridge: 'Deleting matched leaves shrinks the Trie dynamically so dead board cells stop triggering DFS branches.',
      bruteBottleneck: 'Running independent grid DFS for each of 30,000 words re-explores identical grid paths thousands of times.',
      invariantPrompt: 'A Trie distinguishes `startsWith` (path exists) from `search` (path exists AND ___).',
      adversarialCases: [
        { label: 'Prefix Not a Word', input: 'insert("apple"), search("app")', trap: 'Must return false because isWord flag at "p" is false.' },
        { label: 'Duplicate Grid Matches', input: 'Two paths spell "eat"', trap: 'Clear `nextNode.word = null` right after collecting to prevent duplicate output.' },
        { label: 'Wildcard "." Branching', input: 'search("b.d")', trap: 'Branch DFS over ALL children of current node when char === ".".' },
        { label: 'Bitwise XOR Trie', input: '[3, 10, 5, 25]', trap: 'Always traverse from bit 31 down to bit 0 (MSB first) to maximize XOR.' },
      ],
    },
    coreInvariant:
      'Every root-to-node path encodes a shared string prefix in O(L) time, enabling instant dead-prefix pruning independent of dictionary size.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Confusing startsWith() with exact search()',
        badSnippet: 'search(word) { return Boolean(this.walk(word)); } // returns true for partial prefix!',
        fixedSnippet: 'search(word) { const node = this.walk(word); return Boolean(node && node.isWord); }',
        whyItHappens: 'Reaching a valid node only confirms the string is a prefix of some inserted word, not a complete word itself.',
      },
      {
        bugTitle: 'Forgetting to prune empty Trie nodes in Word Search II',
        badSnippet: 'if (next.word) { res.push(next.word); next.word = null; } // still revisits dead subtrees!',
        fixedSnippet: 'if (next.children.size === 0) node.children.delete(ch); // O(1) dead-branch pruning',
        whyItHappens: 'On large boards with many shared prefixes, unpruned leaves cause repeated useless DFS calls and TLE.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'trie-impl-208',
        title: 'Implement Trie (Prefix Tree) (#208)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Character-edge tree supporting insert, search, and startsWith in O(L)',
        companyTags: ['Google', 'Amazon', 'Meta', 'Microsoft'],
        trainerSlug: 'implement-trie-prefix-tree',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete Trie insert and exact word verification:',
          skeletonWithBlanks: `insert(word: string): void {
  let node = this.root;
  for (const ch of word) {
    if (!node.children.has(ch)) ___BLANK_1___;
    node = node.children.get(ch)!;
  }
  ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Create missing child TrieNode',
              expected: 'node.children.set(ch, new TrieNode())',
              acceptedKeywords: ['node.children.set', 'TrieNode'],
              hint: 'Attach a fresh TrieNode under edge ch.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Mark end-of-word flag on terminal node',
              expected: 'node.isWord = true',
              acceptedKeywords: ['node.isWord = true', 'isWord'],
              hint: 'Flag the final node so search() distinguishes complete words from prefixes.',
            },
          ],
        },
      },
      {
        problemId: 'trie-wildcard-211',
        title: 'Design Add and Search Words (#211)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Add recursive DFS branching over all child edges whenever query char is "."',
        companyTags: ['Meta', 'Amazon', 'Google'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the wildcard "." branching loop inside Trie DFS:',
          skeletonWithBlanks: `function dfs(node: TrieNode, idx: number): boolean {
  if (idx === word.length) return ___BLANK_1___;
  const ch = word[idx];
  if (ch === '.') {
    for (const child of node.children.values()) {
      if (___BLANK_2___) return true;
    }
    return false;
  }
  return node.children.has(ch) ? dfs(node.children.get(ch)!, idx + 1) : false;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Base case check at end of word',
              expected: 'node.isWord',
              acceptedKeywords: ['node.isWord'],
              hint: 'Only return true if the terminal node marks a stored word.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Recurse into child advancing idx + 1',
              expected: 'dfs(child, idx + 1)',
              acceptedKeywords: ['dfs(child, idx + 1)'],
              hint: 'Try matching the remainder of word starting from each child.',
            },
          ],
        },
      },
      {
        problemId: 'trie-word-search-ii',
        title: 'Word Search II (#212)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Grid Backtracking guided by Trie edges + dead-leaf pruning',
        companyTags: ['Amazon', 'Google', 'Uber', 'Microsoft'],
        trainerSlug: 'word-search-ii',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the matched-word deduplication and dead-branch leaf pruning:',
          skeletonWithBlanks: `const next = node.children.get(ch);
if (!next) return;
if (next.word !== null) {
  res.push(next.word);
  ___BLANK_1___;
}
// ... mark visited, explore 4 neighbors, unmark ...
if (next.children.size === 0) ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Prevent duplicate collection of the same word',
              expected: 'next.word = null',
              acceptedKeywords: ['next.word = null'],
              hint: 'Clear next.word once added to res.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Prune exhausted Trie leaf from parent',
              expected: 'node.children.delete(ch)',
              acceptedKeywords: ['node.children.delete(ch)'],
              hint: 'Delete edge ch from parent node when next has no remaining children.',
            },
          ],
        },
      },
    ],
  },

  'heaps-priority-queues': {
    id: 'heaps-priority-queues',
    title: 'Heaps & Priority Queues',
    category: 'Trees & Graphs',
    eli5Analogy:
      'Think of a VIP lounge with exactly K seats for the K richest guests: to keep the right K people inside as new guests arrive, you station the bouncer next to the POOREST guest currently inside (a Min-Heap root)—if a richer newcomer arrives, the poorest VIP leaves immediately.',
    whenToUse: [
      'Top-K Largest, K-th Largest, K Closest Points, or Top-K Frequent without paying O(N log N) full sort',
      'Merging K sorted lists/arrays/streams continuously (K-Way Merge in O(N log K))',
      'Streaming Median (Dual-Heap: Max-Heap lower half + Min-Heap upper half) or greedy task scheduling',
    ],
    whenNotToUse: [
      'Need arbitrary element search or deletion by value in O(log N) (standard binary heap lacks O(1) lookup; use Balanced BST or indexed heap)',
      'Need full sorted output of all N elements once (just sort in O(N log N))',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5, 1 <= K <= N',
      expectedComplexity: 'O(N log K) time · O(K) space (O(1) peek, O(log K) push/pop)',
      correctTierId: 'nlogn',
      eliminatedApproaches: ['Re-sorting array on every stream insert O(N² log N)', 'Full O(N) Max-Heap when K << N'],
      mathProof:
        'Capping heap size at K makes every push/pop O(log K); for K = 10 over N = 10^6 stream events, log₂(10) ≈ 3.3 vs log₂(10^6) ≈ 20 (6× faster, 100,000× less RAM).',
    },
    blankPageDrill: {
      tinyInput: 'stream = [5, 15, 1, 3] (Find Median from Data Stream)',
      manualQuestion:
        'Why do we use a MIN-heap for the K LARGEST elements and a MAX-heap for the K SMALLEST elements?',
      memoryBridge: 'Always keep the weakest member of your Top-K group at the root so you can compare & evict it in O(1)/O(log K).',
      bruteBottleneck: 'Re-sorting on every incoming stream number costs O(N² log N) instead of O(N log N).',
      invariantPrompt: 'In Dual-Heap Median, maxHeap holds the ___ half, minHeap holds the ___ half, and sizes differ by at most 1.',
      adversarialCases: [
        { label: 'Inverted Heap Type', input: 'Top-3 Largest of [1..100]', trap: 'A Max-Heap keeps 100 on top and evicts 100 instead of the smallest VIP!' },
        { label: 'Merge K Empty Lists', input: 'lists = [[], [1], []]', trap: 'Filter out null heads before seeding the initial Min-Heap.' },
        { label: 'Median Rebalance', input: 'addNum(10), addNum(2)', trap: 'Always push to lower Max-Heap -> move its top to upper Min-Heap -> rebalance if upper > lower.' },
        { label: 'Task Scheduler Idle Slots', input: 'tasks = ["A","A","A"], n = 2', trap: 'Track cooldown queue [remainingCount, readyTime] alongside Max-Heap.' },
      ],
    },
    coreInvariant:
      'Maintain a bounded priority frontier of size K so the next eviction or globally smallest/largest candidate is always accessible at the root in O(1).',
    commonBugsAndTraps: [
      {
        bugTitle: 'Using a Max-Heap of size K for Top-K Largest',
        badSnippet: 'maxHeap.push(x); if (maxHeap.size() > k) maxHeap.pop(); // evicts the LARGEST element!',
        fixedSnippet: 'minHeap.push(x); if (minHeap.size() > k) minHeap.pop(); // evicts the smallest outsider',
        whyItHappens: 'You must evict the threshold element (smallest among the K largest), which sits at the root of a Min-Heap.',
      },
      {
        bugTitle: 'Skipping cross-heap handoff in Streaming Median',
        badSnippet: 'if (num <= maxHeap.peek()) maxHeap.push(num); // misses empty check & ordering violations!',
        fixedSnippet:
          'maxHeap.push(num); minHeap.push(maxHeap.pop()); if (minHeap.size() > maxHeap.size()) maxHeap.push(minHeap.pop());',
        whyItHappens: 'Always routing through lower -> upper -> rebalance enforces the ordering invariant (every lower <= every upper) in 3 lines with zero edge cases.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'heap-kth-stream-703',
        title: 'Kth Largest Element in a Stream (#703)',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Bounded Min-Heap of size K exposes the K-th largest at root in O(1)',
        companyTags: ['Amazon', 'Google', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the bounded Min-Heap add(val) method:',
          skeletonWithBlanks: `add(val: number): number {
  this.minHeap.push(val);
  if (___BLANK_1___) this.minHeap.pop();
  return ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Evict smallest when heap exceeds capacity k',
              expected: 'this.minHeap.size() > this.k',
              acceptedKeywords: ['size()', '> this.k', '> k'],
              hint: 'Pop whenever the heap holds more than k elements.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Return K-th largest at heap root',
              expected: 'this.minHeap.peek()',
              acceptedKeywords: ['peek()', '[0]'],
              hint: 'The root of a size-K Min-Heap is the K-th largest element.',
            },
          ],
        },
      },
      {
        problemId: 'heap-merge-k-23',
        title: 'Merge K Sorted Lists (#23)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 1 · Min-Heap of size K always pops the globally smallest active list head in O(N log K)',
        companyTags: ['Meta', 'Amazon', 'Google', 'Microsoft'],
        trainerSlug: 'merge-k-sorted-lists',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the K-way heap extraction and successor push loop:',
          skeletonWithBlanks: `while (!minHeap.isEmpty()) {
  const smallest = ___BLANK_1___;
  tail.next = smallest;
  tail = tail.next;
  if (smallest.next) ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Pop smallest active head node',
              expected: 'minHeap.pop()',
              acceptedKeywords: ['minHeap.pop()'],
              hint: 'Extract the minimum node from the priority queue.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Advance that list by pushing its successor',
              expected: 'minHeap.push(smallest.next)',
              acceptedKeywords: ['minHeap.push(smallest.next)'],
              hint: 'Refill the heap frontier with smallest.next.',
            },
          ],
        },
      },
      {
        problemId: 'heap-median-295',
        title: 'Find Median from Data Stream (#295)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Dual-Heap (Lower Max-Heap + Upper Min-Heap) balances ordering & size in O(log N)',
        companyTags: ['Google', 'Amazon', 'Meta', 'Uber', 'Apple'],
        trainerSlug: 'find-median-from-data-stream',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the 3-step cross-heap balance in addNum():',
          skeletonWithBlanks: `addNum(num: number): void {
  this.lowerMax.push(num);
  this.upperMin.push(___BLANK_1___);
  if (this.upperMin.size() > this.lowerMax.size()) {
    this.lowerMax.push(___BLANK_2___);
  }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Pass largest element of lower half into upper half',
              expected: 'this.lowerMax.pop()',
              acceptedKeywords: ['lowerMax.pop()'],
              hint: 'Pop from lowerMax so upperMin always receives the largest candidate.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Restore size invariant (lowerMax.size >= upperMin.size)',
              expected: 'this.upperMin.pop()',
              acceptedKeywords: ['upperMin.pop()'],
              hint: 'Move the smallest element of upperMin back to lowerMax.',
            },
          ],
        },
      },
    ],
  },
};
