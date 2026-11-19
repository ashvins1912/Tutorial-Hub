import type { CurriculumTopic } from '../types';
import { DEEP_BLUEPRINTS_PART_1 } from './deepBlueprintsPart1';
import { DEEP_BLUEPRINTS_PART_2 } from './deepBlueprintsPart2';

export interface CommonBugTrap {
  bugTitle: string;
  badSnippet: string;
  fixedSnippet: string;
  whyItHappens: string;
}

export interface FadedCodeChallenge {
  language: 'python' | 'java' | 'typescript';
  prompt: string;
  skeletonWithBlanks: string;
  missingLines: {
    placeholder: string;
    label: string;
    expected: string;
    acceptedKeywords: string[];
    hint: string;
  }[];
}

export interface LinkedMutationProblem {
  problemId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'System';
  mutationDelta: string;
  companyTags: string[];
  trainerSlug?: string;
  fadedCodeChallenge: FadedCodeChallenge;
}

export interface BlankPageDrillSpec {
  tinyInput: string;
  manualQuestion: string;
  memoryBridge: string;
  bruteBottleneck: string;
  invariantPrompt: string;
  adversarialCases: { label: string; input: string; trap: string }[];
}

export interface DeepTopicBlueprint {
  id: string;
  title: string;
  category: string;
  // 1. EASE OF READING & INTUITION
  eli5Analogy: string;
  whenToUse: string[];
  whenNotToUse: string[];
  // 2. CONSTRAINT-TO-COMPLEXITY MATRIX
  constraintGuide: {
    inputBound: string;
    expectedComplexity: string;
    correctTierId: 'exp' | 'n2' | 'nlogn' | 'n' | 'logn';
    eliminatedApproaches: string[];
    mathProof: string;
  };
  // 3. BLANK-PAGE PROTOCOL DRILL
  blankPageDrill: BlankPageDrillSpec;
  // 4. ALGORITHM DNA & INVARIANT + BUGS
  coreInvariant: string;
  commonBugsAndTraps: CommonBugTrap[];
  // 5. BIDIRECTIONAL PROBLEM MUTATION LADDER
  linkedProblems: LinkedMutationProblem[];
}

const BLUEPRINTS_BY_ID: Record<string, DeepTopicBlueprint> = {
  'stacks-monotonic-stack': {
    id: 'stacks-monotonic-stack',
    title: 'Stacks & Monotonic Stack',
    category: 'Linear Structures',
    eli5Analogy:
      'Standing in a line of people of different heights looking right: you can only see people taller than everyone standing in front of them; shorter people trapped in between are permanently blocked and can be forgotten.',
    whenToUse: [
      'Asking for the "Next Greater", "Next Smaller", or "Previous Smaller" element for every index',
      'Computing spans, wait distances, or largest rectangle widths bounded by shorter bars',
      'Brute force scans rightward from every index i to find the first taller/shorter element in O(N²)',
    ],
    whenNotToUse: [
      'Need the K-th largest element globally (use a Min-Heap / QuickSelect instead)',
      'Need arbitrary range minimum queries with updates (use a Segment Tree)',
      'Elements have no ordering relation or require non-contiguous subset selection',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5 elements',
      expectedComplexity: 'O(N) amortized time, O(N) space',
      correctTierId: 'n',
      eliminatedApproaches: ['Nested double-loop forward scan O(N²)', 'Sorting (destroys index positions)'],
      mathProof: 'At N = 10^5, O(N²) executes 10^10 operations (~100s TLE). Each element pushed & popped once = <= 2×10^5 ops (< 5ms).',
    },
    blankPageDrill: {
      tinyInput: 'temps = [73, 74, 71, 75]',
      manualQuestion: 'At index 2 (71°), 74° is still waiting. When index 3 (75°) arrives, which waiting days get answered immediately?',
      memoryBridge: 'A waiting list of unresolved indices sorted strictly decreasing by temperature.',
      bruteBottleneck: 'Re-scanning right from every index repeats comparisons against valleys already overshadowed by taller peaks.',
      invariantPrompt: 'At the start of iteration i, the stack stores indices whose ___ has not been seen yet, in strictly ___ order.',
      adversarialCases: [
        { label: 'Strictly Decreasing', input: '[90, 80, 70, 60]', trap: 'Nothing ever pops; every answer must remain 0.' },
        { label: 'Equal Plateau', input: '[70, 70, 70, 75]', trap: 'Use strict > (not >=) if "strictly warmer" is required.' },
        { label: 'Single Element', input: '[73]', trap: 'Loop finishes with stack size 1; return [0].' },
        { label: 'Histogram Tail Flush', input: '[2, 4, 6]', trap: 'Append sentinel 0 at the end so remaining bars pop & compute area.' },
      ],
    },
    coreInvariant:
      'The stack always holds indices of elements whose next greater (or smaller) boundary has not been found yet, ordered strictly monotonically from bottom to top.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Pushing raw values instead of indices',
        badSnippet: 'stack.push(temps[i]); // loses position!',
        fixedSnippet: 'stack.push(i); // access value via temps[stack[top]]',
        whyItHappens: 'Width/distance calculations (i - prevIdx) are impossible once the original array index is discarded.',
      },
      {
        bugTitle: 'Forgetting sentinel flush in Largest Rectangle in Histogram',
        badSnippet: 'for (let i = 0; i < heights.length; i++) { ... } // misses tail!',
        fixedSnippet: 'for (let i = 0; i <= heights.length; i++) { const h = i === heights.length ? 0 : heights[i]; ... }',
        whyItHappens: 'Strictly increasing bars stay trapped on the stack at loop end unless a 0-height sentinel flushes them.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'nge-1',
        title: 'Next Greater Element I',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Pure decreasing stack invariant recording next greater value in a map',
        companyTags: ['Amazon', 'Microsoft', 'Adobe'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the popping condition and stack push to maintain the decreasing invariant:',
          skeletonWithBlanks: `const nextGreater = new Map<number, number>();
const stack: number[] = [];
for (const x of nums2) {
  while (stack.length > 0 && ___BLANK_1___) {
    nextGreater.set(stack.pop()!, x);
  }
  ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Pop condition (when x resolves stack top)',
              expected: 'x > stack[stack.length - 1]',
              acceptedKeywords: ['x', '>', 'stack'],
              hint: 'Pop whenever the incoming element x is strictly greater than the top of the stack.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Push unresolved element onto stack',
              expected: 'stack.push(x)',
              acceptedKeywords: ['stack.push', 'x'],
              hint: 'Push x so future larger elements can resolve it.',
            },
          ],
        },
      },
      {
        problemId: 'daily-temps',
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 1 · Store INDICES instead of values so popped index computes wait distance (i - prev)',
        companyTags: ['Meta', 'Google', 'Amazon'],
        trainerSlug: 'daily-temperatures',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Fill in the index comparison and wait-distance assignment:',
          skeletonWithBlanks: `const ans = new Array(temps.length).fill(0);
const st: number[] = [];
for (let i = 0; i < temps.length; i++) {
  while (st.length && ___BLANK_1___) {
    const prev = st.pop()!;
    ___BLANK_2___;
  }
  st.push(i);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Compare incoming temp against stack top index',
              expected: 'temps[i] > temps[st[st.length - 1]]',
              acceptedKeywords: ['temps[i]', '>', 'st'],
              hint: 'Remember st holds indices, so look up temps[st[st.length - 1]].',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Record days waited for prev index',
              expected: 'ans[prev] = i - prev',
              acceptedKeywords: ['ans[prev]', 'i', '-', 'prev'],
              hint: 'Distance between warmer day i and waiting day prev.',
            },
          ],
        },
      },
      {
        problemId: 'stock-span',
        title: 'Online Stock Span',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 2 · Streaming input — compress popped consecutive smaller days into (price, span) pairs',
        companyTags: ['Uber', 'Flipkart', 'Swiggy'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the span accumulation while popping weaker prior days:',
          skeletonWithBlanks: `next(price: number): number {
  let span = 1;
  while (this.st.length && ___BLANK_1___) {
    ___BLANK_2___;
  }
  this.st.push([price, span]);
  return span;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Absorb prior days with price <= today',
              expected: 'this.st[this.st.length - 1][0] <= price',
              acceptedKeywords: ['<=', 'price'],
              hint: 'Stock span includes equal or smaller consecutive prior prices (<=).',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Add popped span into current span',
              expected: 'span += this.st.pop()![1]',
              acceptedKeywords: ['span', '+=', 'pop'],
              hint: 'Compress the popped day’s span count into today’s running span.',
            },
          ],
        },
      },
      {
        problemId: 'largest-rectangle',
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        mutationDelta: 'Mutation 3 · Increasing stack tracks BOTH Previous Smaller (new top) and Next Smaller (index i) simultaneously',
        companyTags: ['Google', 'Amazon', 'Uber', 'Atlassian'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Compute exact width between previous smaller (new top) and next smaller (i):',
          skeletonWithBlanks: `for (let i = 0; i <= h.length; i++) {
  const cur = i === h.length ? 0 : h[i];
  while (st.length && h[st[st.length - 1]] > cur) {
    const height = h[st.pop()!];
    const width = ___BLANK_1___;
    ___BLANK_2___;
  }
  st.push(i);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Width bounded by (i - 1) and new stack top',
              expected: 'st.length === 0 ? i : i - st[st.length - 1] - 1',
              acceptedKeywords: ['i', '-', '1'],
              hint: 'If stack is empty, bar extends all the way to 0 (width = i); else i - st[top] - 1.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Update maxArea',
              expected: 'maxArea = Math.max(maxArea, height * width)',
              acceptedKeywords: ['maxArea', 'height', '*', 'width'],
              hint: 'Area is height * width.',
            },
          ],
        },
      },
    ],
  },

  'arrays-hashing': {
    id: 'arrays-hashing',
    title: 'Arrays & Hashing',
    category: 'Foundations',
    eli5Analogy:
      'Instead of asking every guest in a room if they have your missing puzzle piece, drop each visited guest’s piece number onto a labeled coat-check board so any partner finds it in one glance.',
    whenToUse: [
      'Need O(1) membership, complement lookup, deduplication, or frequency grouping',
      'Brute force checks all O(N²) pairs asking "have I seen value X before?"',
      'Input is unsorted and sorting would destroy original indices or cost extra O(N log N)',
    ],
    whenNotToUse: [
      'Array is already sorted and O(1) extra space is required (use Two Pointers)',
      'Queries ask for range sums or nearest value <= X (use Binary Search / TreeMap)',
      'Keys need lexicographical prefix matching (use a Trie)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5 elements',
      expectedComplexity: 'O(N) expected time, O(N) space',
      correctTierId: 'n',
      eliminatedApproaches: ['Nested pair check O(N²)', 'Backtracking combinations O(2^N)'],
      mathProof: '10^5 elements require <= ~10^6 operations; a single hash-table pass visits every item once in O(1) average.',
    },
    blankPageDrill: {
      tinyInput: 'nums = [3, 2, 4], target = 6',
      manualQuestion: 'At index 0 (val=3), complement is 3. Why must we NOT return [0, 0]?',
      memoryBridge: 'Map<value, index> storing ONLY elements strictly before index i.',
      bruteBottleneck: 'Inner loop linearly re-searches the array for (target - nums[i]) on every element.',
      invariantPrompt: 'Before inspecting index i, the HashMap contains every element in range ___ so checking complement first prevents ___.',
      adversarialCases: [
        { label: 'Half-Target Self-Match', input: '[3, 2, 4], target=6', trap: 'Inserting before querying falsely pairs 3 with itself.' },
        { label: 'Duplicate Values', input: '[3, 3], target=6', trap: 'Valid answer [0, 1] works cleanly if check happens before overwrite.' },
        { label: 'Negative Numbers', input: '[-4, -1, 5], target=1', trap: 'Complement math works identically; never assume positive keys.' },
        { label: 'Empty / Single', input: '[5], target=10', trap: 'Gracefully return empty/not-found without out-of-bounds.' },
      ],
    },
    coreInvariant:
      'At iteration i, seen contains exactly the elements from [0..i-1]; querying seen.has(target - nums[i]) BEFORE inserting nums[i] guarantees distinct indices.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Insert-before-query self-pairing bug',
        badSnippet: 'seen.set(nums[i], i);\nif (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];',
        fixedSnippet: 'const comp = target - nums[i];\nif (seen.has(comp)) return [seen.get(comp)!, i];\nseen.set(nums[i], i);',
        whyItHappens: 'When nums[i] * 2 === target, inserting first causes index i to pair with itself.',
      },
      {
        bugTitle: 'Sorting every long string in Group Anagrams',
        badSnippet: 'const key = str.split("").sort().join(""); // O(K log K)',
        fixedSnippet: 'const cnt = new Array(26).fill(0); for (const c of str) cnt[c.charCodeAt(0)-97]++; const key = cnt.join("#");',
        whyItHappens: 'A fixed 26-bucket signature drops grouping from O(N·K log K) to linear O(N·K).',
      },
    ],
    linkedProblems: [
      {
        problemId: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Complement lookup in a single check-before-insert pass',
        companyTags: ['Google', 'Amazon', 'Meta', 'Adobe'],
        trainerSlug: 'two-sum',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the check-before-insert invariant:',
          skeletonWithBlanks: `const seen = new Map<number, number>();
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i];
  if (___BLANK_1___) return [seen.get(need)!, i];
  ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Check complement before inserting',
              expected: 'seen.has(need)',
              acceptedKeywords: ['seen.has', 'need'],
              hint: 'Check if need already exists in the Map.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Index current element after check',
              expected: 'seen.set(nums[i], i)',
              acceptedKeywords: ['seen.set', 'nums[i]', 'i'],
              hint: 'Store value -> index mapping.',
            },
          ],
        },
      },
      {
        problemId: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 1 · Hash a canonical 26-char frequency signature instead of a scalar number',
        companyTags: ['Amazon', 'Uber', 'Microsoft'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Fill in the frequency bucket increment and delimited key builder:',
          skeletonWithBlanks: `const groups = new Map<string, string[]>();
for (const word of strs) {
  const freq = new Array(26).fill(0);
  for (const ch of word) ___BLANK_1___;
  const key = ___BLANK_2___;
  groups.set(key, [...(groups.get(key) ?? []), word]);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Increment character bucket',
              expected: 'freq[ch.charCodeAt(0) - 97]++',
              acceptedKeywords: ['freq', '97', '++'],
              hint: 'Map "a".."z" into indices 0..25 using charCodeAt(0) - 97.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Build collision-free string key',
              expected: 'freq.join("#")',
              acceptedKeywords: ['freq.join', '#'],
              hint: 'Join with a delimiter like "#" so [1, 11] never collides with [11, 1].',
            },
          ],
        },
      },
      {
        problemId: 'longest-consecutive',
        title: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 2 · Only expand forward from sequence STARTS (!set.has(x - 1)) to guarantee O(N) total work',
        companyTags: ['Google', 'Meta', 'Atlassian'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Prevent O(N²) re-walks by guarding sequence starts:',
          skeletonWithBlanks: `const set = new Set(nums);
let best = 0;
for (const x of set) {
  if (___BLANK_1___) {
    let cur = x;
    while (___BLANK_2___) cur++;
    best = Math.max(best, cur - x + 1);
  }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Sequence-start guard',
              expected: '!set.has(x - 1)',
              acceptedKeywords: ['!set.has', 'x', '-', '1'],
              hint: 'Skip x if x - 1 is in the set—x is in the middle of a chain.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Walk consecutive chain forward',
              expected: 'set.has(cur + 1)',
              acceptedKeywords: ['set.has', 'cur', '+', '1'],
              hint: 'Keep advancing cur while cur + 1 exists in the set.',
            },
          ],
        },
      },
      {
        problemId: 'lru-cache-hash',
        title: 'LRU Cache (HashMap + DLL)',
        difficulty: 'System',
        mutationDelta: 'Mutation 3 · Combine O(1) HashMap lookup with a Doubly Linked List for O(1) recency eviction',
        companyTags: ['Google', 'Uber', 'Amazon', 'Atlassian', 'Razorpay'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(1) eviction guard when capacity overflows:',
          skeletonWithBlanks: `if (this.map.size > this.capacity) {
  const lru = ___BLANK_1___;
  this.removeNode(lru);
  ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Locate least recently used node before sentinel tail',
              expected: 'this.tail.prev!',
              acceptedKeywords: ['tail.prev'],
              hint: 'LRU sits immediately before the dummy tail sentinel.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Purge evicted key from HashMap',
              expected: 'this.map.delete(lru.key)',
              acceptedKeywords: ['map.delete', 'lru.key'],
              hint: 'Always delete from BOTH the linked list AND the HashMap.',
            },
          ],
        },
      },
    ],
  },

  'sliding-window': {
    id: 'sliding-window',
    title: 'Sliding Window (Fixed & Variable)',
    category: 'Foundations',
    eli5Analogy:
      'Slide a stretchy picture frame along a strip of film: move the right edge forward to include a new frame, and only pull the left edge inward when the photo inside breaks the rule.',
    whenToUse: [
      'Contiguous subarray or substring optimization (longest, shortest, count) with monotonic property',
      'All numbers are non-negative OR validity depends on character counts/distinct elements',
      'Brute force recomputes sums/frequencies across overlapping O(N²) slices',
    ],
    whenNotToUse: [
      'Subarray sum with NEGATIVE numbers (shrinking left can increase sum — use Prefix Sum + HashMap)',
      'Problem asks for non-contiguous subsequences (use DP or Greedy)',
      'Order of elements does not matter and grouping is needed (use HashMap)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5 characters / positive ints',
      expectedComplexity: 'O(N) amortized time, O(K) space',
      correctTierId: 'n',
      eliminatedApproaches: ['Generate all O(N²) substrings', 'Re-scan 26-char frequency table per step O(26·N)'],
      mathProof: 'Both left and right move rightward at most N steps each → <= 2N pointer updates total.',
    },
    blankPageDrill: {
      tinyInput: 's = "abba"',
      manualQuestion: 'At index 3 ("a"), lastSeen["a"] is 0 while left is already 2. What breaks if you assign left = 0 + 1?',
      memoryBridge: 'Window frequency map (or lastSeen index) + scalar validity counter.',
      bruteBottleneck: 'Re-scanning every substring starting at i repeats work already verified in [left..right-1].',
      invariantPrompt: 'After the inner while loop finishes, the slice [left..right] is guaranteed to ___ so best can be updated safely.',
      adversarialCases: [
        { label: 'Stale Left Jump', input: '"abba"', trap: 'Must use left = Math.max(left, lastSeen[ch] + 1) so left never moves backward.' },
        { label: 'All Identical', input: '"aaaaa"', trap: 'Window must collapse to length 1 cleanly.' },
        { label: 'Negative Numbers', input: '[-2, 3, -1], sum=2', trap: 'Disqualifies sliding window — pivot to Prefix Sum + HashMap!' },
        { label: 'Exact K Subarrays', input: 'k = 2 distinct', trap: 'Use atMost(K) - atMost(K - 1) reduction.' },
      ],
    },
    coreInvariant:
      'Expand right unconditionally every iteration; shrink left ONLY while the window invariant is violated (Longest) or valid (Shortest); left never moves backward.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Allowing left pointer to jump backward on stale character index',
        badSnippet: 'if (lastSeen.has(ch)) left = lastSeen.get(ch)! + 1;',
        fixedSnippet: 'if (lastSeen.has(ch)) left = Math.max(left, lastSeen.get(ch)! + 1);',
        whyItHappens: 'A character seen before the current window still lives in lastSeen; resetting left backward re-introduces evicted duplicates.',
      },
      {
        bugTitle: 'Recording answer before restoring validity',
        badSnippet: 'best = Math.max(best, r - l + 1); while (!valid) shrink();',
        fixedSnippet: 'while (!valid) shrink(); best = Math.max(best, r - l + 1);',
        whyItHappens: 'For longest-valid problems, [l..r] is only guaranteed legal AFTER the shrinking while loop exits.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'longest-unique-sub',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Variable window with Math.max(left, lastSeen + 1) jump guard',
        companyTags: ['Amazon', 'Meta', 'Google', 'Microsoft'],
        trainerSlug: 'longest-substring-without-repeating',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the monotonic left-pointer guard and best update:',
          skeletonWithBlanks: `const seen = new Map<string, number>();
let left = 0, best = 0;
for (let r = 0; r < s.length; r++) {
  if (seen.has(s[r])) ___BLANK_1___;
  seen.set(s[r], r);
  ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Monotonic left jump (never step backward)',
              expected: 'left = Math.max(left, seen.get(s[r])! + 1)',
              acceptedKeywords: ['Math.max', 'left', '+ 1'],
              hint: 'Clamp with Math.max(left, ...) to ignore stale indices left of the window.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Update longest valid window length',
              expected: 'best = Math.max(best, r - left + 1)',
              acceptedKeywords: ['best', 'r - left + 1'],
              hint: 'Inclusive window length is right - left + 1.',
            },
          ],
        },
      },
      {
        problemId: 'min-window-sub',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        mutationDelta: 'Mutation 1 · Flip to SHORTEST valid window (record INSIDE while-valid loop) + O(1) formed counter',
        companyTags: ['Meta', 'Google', 'Uber', 'LinkedIn'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Track shortest valid window inside the shrinking loop:',
          skeletonWithBlanks: `while (formed === required) {
  if (___BLANK_1___) { bestLen = r - l + 1; bestStart = l; }
  const out = s[l++];
  win.set(out, win.get(out)! - 1);
  if (need.has(out) && ___BLANK_2___) formed--;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Check if current valid window is strictly shorter',
              expected: 'r - l + 1 < bestLen',
              acceptedKeywords: ['r - l + 1', '<', 'bestLen'],
              hint: 'Update bestLen whenever current length is smaller.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Detect when evicting out breaks required quota',
              expected: 'win.get(out)! < need.get(out)!',
              acceptedKeywords: ['win.get', '<', 'need.get'],
              hint: 'Decrement formed only when window count drops strictly below need count.',
            },
          ],
        },
      },
      {
        problemId: 'subarrays-k-distinct',
        title: 'Subarrays with K Different Integers',
        difficulty: 'Hard',
        mutationDelta: 'Mutation 2 · Exact-K breaks direct shrink; transform via atMost(K) - atMost(K - 1)',
        companyTags: ['Google', 'Amazon', 'Uber'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the atMost(K) counting formula and exact-K reduction:',
          skeletonWithBlanks: `function atMost(nums: number[], k: number): number {
  let l = 0, total = 0;
  for (let r = 0; r < nums.length; r++) {
    // ...acquire & shrink while map.size > k...
    ___BLANK_1___;
  }
  return total;
}
return ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Count all valid subarrays ending at r',
              expected: 'total += r - l + 1',
              acceptedKeywords: ['total', '+=', 'r - l + 1'],
              hint: 'Every starting index in [l..r] forms a valid subarray ending at r.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Exact K via subtraction',
              expected: 'atMost(nums, k) - atMost(nums, k - 1)',
              acceptedKeywords: ['atMost', 'k - 1'],
              hint: 'Subtract arrays with <= K-1 distinct from <= K distinct.',
            },
          ],
        },
      },
    ],
  },

  'backtracking': {
    id: 'backtracking',
    title: 'Backtracking & Pruning',
    category: 'Recursion & Search',
    eli5Analogy:
      'Exploring a hedge maze with a spool of chalk string: mark each step you take, abort down dead ends immediately, and erase your chalk mark as you step back to try the next corridor.',
    whenToUse: [
      'Small input bounds (N <= 20) demanding ALL valid combinations, permutations, partitions, or board placements',
      'Constraints let you prune invalid partial states early in O(1) before reaching leaves',
      'Problem requires explicit Undo/Restore of shared state across sibling branches',
    ],
    whenNotToUse: [
      'N >= 30 and only the COUNT or OPTIMAL VALUE is requested (overlapping subproblems → use DP!)',
      'Greedy local choice is provably optimal (use Greedy + Sorting)',
      'Shortest path with unweighted hops (use BFS instead of DFS backtracking)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 16 (or Grid <= 6×6)',
      expectedComplexity: 'O(Branching^Depth) heavily pruned, O(Depth) stack',
      correctTierId: 'exp',
      eliminatedApproaches: ['Generate all N^N placements then filter', 'Unpruned naive DFS without diagonal/visited guards'],
      mathProof: 'N <= 16 signals exponential search space; O(1) HashSet/bitmask pruning cuts 99%+ of dead subtrees.',
    },
    blankPageDrill: {
      tinyInput: '4-Queens on 4×4 board',
      manualQuestion: 'After placing Q at (0,0) and (1,2), row 2 has zero legal columns. Which frame pops and what exact state must be restored?',
      memoryBridge: 'Call stack holds (row) + shared cols, diag1 (r-c), diag2 (r+c) sets.',
      bruteBottleneck: 'Placing N queens blindly and checking conflicts at the end wastes 4^4 = 256 states instead of ~15 pruned states.',
      invariantPrompt: 'Before descending to row + 1, we mutate state via ___; immediately after the recursive call returns, we restore symmetry via ___.',
      adversarialCases: [
        { label: 'Missing Snapshot Clone', input: 'res.push(path)', trap: 'Pushes live reference that gets emptied to [] on unwind — always push [...path]!' },
        { label: 'Duplicate Permutations', input: 'candidates = [1, 1, 2]', trap: 'Sort first and skip if (i > start && a[i] === a[i-1]).' },
        { label: 'Unsolvable N=2,3', input: 'N = 3 Queens', trap: 'Must cleanly backtrack all frames and return [].' },
        { label: 'Word Search Re-Visit', input: '"ABCB" on grid', trap: 'Must restore board[r][c] = saved BEFORE returning false.' },
      ],
    },
    coreInvariant:
      'Every recursive frame leaves shared mutable state (path, board marks, diagonal sets) bit-for-bit identical upon exit to how it entered.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Pushing mutable array reference instead of cloning snapshot',
        badSnippet: 'if (row === n) { res.push(path); return; } // ends up all []!',
        fixedSnippet: 'if (row === n) { res.push([...path]); return; }',
        whyItHappens: 'Subsequent path.pop() backtracking calls mutate the exact same array reference stored inside res.',
      },
      {
        bugTitle: 'Forgetting to unmark board cell on dead-end return in Word Search',
        badSnippet: 'board[r][c] = "#"; return dfs(r+1,c) || dfs(r,c+1);',
        fixedSnippet: 'const saved = board[r][c]; board[r][c] = "#"; const ok = explore(); board[r][c] = saved; return ok;',
        whyItHappens: 'Leaving "#" permanently blocks valid future paths that legitimately pass through (r, c).',
      },
    ],
    linkedProblems: [
      {
        problemId: 'subsets-base',
        title: 'Subsets (Power Set)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Pure Choose → Recurse(i + 1) → Pop Undo without constraint pruning',
        companyTags: ['Meta', 'Amazon', 'Google'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the snapshot clone and backtrack undo step:',
          skeletonWithBlanks: `function dfs(start: number, path: number[]) {
  ___BLANK_1___;
  for (let i = start; i < nums.length; i++) {
    path.push(nums[i]);
    dfs(i + 1, path);
    ___BLANK_2___;
  }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Clone current subset snapshot',
              expected: 'res.push([...path])',
              acceptedKeywords: ['res.push', '...path'],
              hint: 'Always shallow-copy [...path] so pops do not erase saved results.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Undo choice before next sibling',
              expected: 'path.pop()',
              acceptedKeywords: ['path.pop'],
              hint: 'Restore path to its parent state.',
            },
          ],
        },
      },
      {
        problemId: 'word-search-dfs',
        title: 'Word Search (2D Grid DFS)',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 1 · 4-directional grid traversal + in-place "#" visited marker & restore on unwind',
        companyTags: ['Amazon', 'Microsoft', 'Uber', 'Adobe'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the in-place mark and backtracking restore lines:',
          skeletonWithBlanks: `const saved = board[r][c];
___BLANK_1___;
const found = dirs.some(([dr, dc]) => dfs(r + dr, c + dc, idx + 1));
___BLANK_2___;
return found;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Mark current cell visited to prevent reuse',
              expected: 'board[r][c] = "#"',
              acceptedKeywords: ['board[r][c]', '='],
              hint: 'Temporarily overwrite cell with a sentinel like "#".',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Restore original character on unwind',
              expected: 'board[r][c] = saved',
              acceptedKeywords: ['board[r][c]', 'saved'],
              hint: 'Restore saved char so sibling paths can still visit (r, c).',
            },
          ],
        },
      },
      {
        problemId: 'n-queens-hard',
        title: 'N-Queens',
        difficulty: 'Hard',
        mutationDelta: 'Mutation 2 · O(1) conflict pruning via cols, main diagonal (row - col), and anti-diagonal (row + col)',
        companyTags: ['Google', 'Amazon', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(1) diagonal conflict check and recursive descent:',
          skeletonWithBlanks: `for (let c = 0; c < n; c++) {
  if (___BLANK_1___) continue;
  cols.add(c); d1.add(row - c); d2.add(row + c);
  ___BLANK_2___;
  cols.delete(c); d1.delete(row - c); d2.delete(row + c);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'O(1) column & both-diagonal attack guard',
              expected: 'cols.has(c) || d1.has(row - c) || d2.has(row + c)',
              acceptedKeywords: ['cols.has', 'row - c', 'row + c'],
              hint: 'Check cols, d1 (row - c), and d2 (row + c).',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Descend to next row',
              expected: 'solve(row + 1)',
              acceptedKeywords: ['solve', 'row + 1'],
              hint: 'Recurse on row + 1 after placing the queen.',
            },
          ],
        },
      },
    ],
  },

  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search & Search on Answer',
    category: 'Intermediate',
    eli5Analogy:
      'Opening a 1,000-page dictionary straight to the middle: one glance tells you whether your word lives in the left half or right half, throwing away 500 pages in a single flip.',
    whenToUse: [
      'Sorted array lookup, rotated sorted array, or peak finding in O(log N)',
      'Minimax / capacity / rate optimization ("minimum speed K to finish within H hours") with monotonic feasible(X)',
      'N <= 10^9 answer range where linear trial would TLE instantly',
    ],
    whenNotToUse: [
      'Unsorted data with no monotonic feasibility predicate',
      'Linked lists (no O(1) random-access midpoint)',
      'Non-monotonic objective curves with multiple local minima',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5, Answer Range <= 10^9',
      expectedComplexity: 'O(log N) or O(N log(MaxVal))',
      correctTierId: 'logn',
      eliminatedApproaches: ['Linearly testing every candidate speed K = 1..10^9 O(N·MaxVal)'],
      mathProof: 'log2(10^9) ≈ 30 iterations! Even with an O(N) check inside, 30 × 10^5 = 3×10^6 ops (< 15ms).',
    },
    blankPageDrill: {
      tinyInput: 'piles = [3, 6, 7, 11], H = 8',
      manualQuestion: 'At speed mid = 6, hours = 1+1+2+2 = 6 <= 8 (feasible!). Should we set hi = mid or hi = mid - 1?',
      memoryBridge: 'Closed bracket [lo, hi] maintaining invariant: answer is ALWAYS inside [lo, hi].',
      bruteBottleneck: 'Trying speeds 1, 2, 3, ... up to max(piles)=10^9 repeats monotonic True/False checks.',
      invariantPrompt: 'Throughout the loop, every value < lo is provably ___ and every value >= hi is provably ___.',
      adversarialCases: [
        { label: 'Infinite Loop on 2 Elements', input: 'lo=2, hi=3, hi=mid', trap: 'If lo=mid is used with floor midpoint, mid=2 loops forever! Use ceil midpoint or hi=mid with lo=mid+1.' },
        { label: 'Integer Overflow', input: 'lo=1.5e9, hi=2e9', trap: 'Use lo + Math.floor((hi - lo) / 2), never (lo + hi) / 2.' },
        { label: 'Rotated Pivot Duplicate', input: '[4,5,6,7,0,1,2]', trap: 'Always identify which half is strictly sorted first.' },
        { label: 'Single Element', input: '[7], target=7', trap: 'Verify boundary condition works when lo === hi.' },
      ],
    },
    coreInvariant:
      'Maintain lo <= answer <= hi cleanly: for first-True search use while (lo < hi), if feasible(mid) set hi = mid, else lo = mid + 1; return lo.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Discarding the valid answer with hi = mid - 1 in lower-bound search',
        badSnippet: 'if (feasible(mid)) hi = mid - 1; // drops mid if mid IS the exact minimum!',
        fixedSnippet: 'if (feasible(mid)) hi = mid; else lo = mid + 1;',
        whyItHappens: 'When feasible(mid) is true, mid itself may be the smallest valid answer—keep it inside [lo, hi].',
      },
      {
        bugTitle: 'Infinite loop with lo = mid and floor division',
        badSnippet: 'const mid = Math.floor((lo + hi) / 2); if (ok(mid)) lo = mid;',
        fixedSnippet: 'const mid = lo + Math.floor((hi - lo + 1) / 2); if (ok(mid)) lo = mid; else hi = mid - 1;',
        whyItHappens: 'When hi === lo + 1, floor midpoint equals lo, so lo = mid never shrinks the interval.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'bs-standard',
        title: 'Binary Search (First True Template)',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Classic lower-bound boundary search on sorted array',
        companyTags: ['Google', 'Amazon', 'Microsoft'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the overflow-safe midpoint and boundary update:',
          skeletonWithBlanks: `let lo = 0, hi = nums.length;
while (lo < hi) {
  const mid = ___BLANK_1___;
  if (nums[mid] >= target) ___BLANK_2___;
  else lo = mid + 1;
}
return lo;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Overflow-safe midpoint',
              expected: 'lo + Math.floor((hi - lo) / 2)',
              acceptedKeywords: ['lo', 'hi - lo', '2'],
              hint: 'Compute lo + Math.floor((hi - lo) / 2).',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Keep valid candidate mid in search space',
              expected: 'hi = mid',
              acceptedKeywords: ['hi', '=', 'mid'],
              hint: 'Set hi = mid so mid is not accidentally discarded.',
            },
          ],
        },
      },
      {
        problemId: 'koko-bananas',
        title: 'Koko Eating Bananas',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 1 · Search over an IMPLICIT answer space [1..max(piles)] using a greedy O(N) feasibility predicate',
        companyTags: ['Amazon', 'Flipkart', 'Google', 'Uber'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the ceiling-hour predicate and binary search branch:',
          skeletonWithBlanks: `const hours = piles.reduce((acc, p) => acc + ___BLANK_1___, 0);
if (hours <= h) ___BLANK_2___;
else lo = mid + 1;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Hours needed for pile p at rate mid',
              expected: 'Math.ceil(p / mid)',
              acceptedKeywords: ['ceil', 'p', 'mid'],
              hint: 'Partial piles still consume a full hour: Math.ceil(p / mid).',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Feasible rate — try slower',
              expected: 'hi = mid',
              acceptedKeywords: ['hi', '=', 'mid'],
              hint: 'Keep mid and test lower rates.',
            },
          ],
        },
      },
      {
        problemId: 'rotated-sorted',
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 2 · Identify which half [lo..mid] or [mid..hi] is cleanly sorted before checking target range',
        companyTags: ['Meta', 'Google', 'Amazon', 'Microsoft'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Check if left half is sorted and whether target falls inside it:',
          skeletonWithBlanks: `if (___BLANK_1___) {
  if (___BLANK_2___) hi = mid - 1;
  else lo = mid + 1;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Detect sorted left half (inclusive <= for 2 elements)',
              expected: 'nums[lo] <= nums[mid]',
              acceptedKeywords: ['nums[lo]', '<=', 'nums[mid]'],
              hint: 'Use <= because mid can equal lo when 2 elements remain.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Check if target is strictly inside sorted left half',
              expected: 'nums[lo] <= target && target < nums[mid]',
              acceptedKeywords: ['nums[lo]', 'target', 'nums[mid]'],
              hint: 'Target must be >= nums[lo] and < nums[mid].',
            },
          ],
        },
      },
    ],
  },

  'dynamic-programming': {
    id: 'dynamic-programming',
    title: 'Dynamic Programming (1D / 2D)',
    category: 'Advanced',
    eli5Analogy:
      'Climbing a staircase where each step asks for the cheapest path from 1 or 2 steps below: write the best cost on every stair with chalk as you climb so you never recalculate the bottom stairs twice.',
    whenToUse: [
      'Asks for Optimal Value (min/max cost) or Total Ways (count) with overlapping subproblems',
      'Greedy fails on a simple counterexample (e.g., coins [1, 3, 4] for target 6)',
      'Recurrence depends cleanly on a small state tuple (index, remaining capacity)',
    ],
    whenNotToUse: [
      'Asks to PRINT all actual paths/combinations (use Backtracking)',
      'Greedy choice property holds provably (e.g., interval scheduling by earliest end)',
      'Subproblems never overlap (plain Divide & Conquer / Memo gives no gain)',
    ],
    constraintGuide: {
      inputBound: 'N <= 10^3 (2D DP) or N <= 10^5 (1D DP)',
      expectedComplexity: 'O(States × Transitions) time, O(State) space',
      correctTierId: 'n2',
      eliminatedApproaches: ['Unmemoized recursion O(2^N)', 'Naive greedy heuristic (wrong answer)'],
      mathProof: 'With N=1000, O(2^N) exceeds atoms in the universe; memoizing N×M states runs in <= 10^6 ops (< 10ms).',
    },
    blankPageDrill: {
      tinyInput: 'coins = [1, 3, 4], amount = 6',
      manualQuestion: 'Greedy chooses 4+1+1 (3 coins). Looking back from amount 6 by 1, 3, and 4, which prior dp[] state unlocks 2 coins?',
      memoryBridge: 'dp[a] = fewest coins needed to make exact amount a.',
      bruteBottleneck: 'Recursive tree recomputes dp[3] and dp[2] exponentially many times along different branches.',
      invariantPrompt: 'When computing dp[a], every smaller sub-amount dp[0..a-1] is already ___ so we take min over ___.',
      adversarialCases: [
        { label: 'Greedy Trap', input: 'coins=[1,3,4], amt=6', trap: 'Optimal is 3+3 (2 coins), NOT 4+1+1.' },
        { label: 'Unreachable Target', input: 'coins=[2], amt=3', trap: 'dp[3] stays Infinity — must return -1, not Infinity.' },
        { label: '0/1 vs Unbounded Order', input: '0/1 Knapsack 1D', trap: '0/1 Knapsack iterates capacity BACKWARD; Unbounded iterates FORWARD.' },
        { label: 'Zero Amount Base', input: 'amount = 0', trap: 'dp[0] = 0 (zero coins needed to make 0).' },
      ],
    },
    coreInvariant:
      'Every state dp[s] stores the exact optimal answer for subproblem s, computed strictly after all smaller states it depends on (topological order).',
    commonBugsAndTraps: [
      {
        bugTitle: 'Iterating 1D 0/1 Knapsack capacity forward (reuses same item twice!)',
        badSnippet: 'for (let w = weight[i]; w <= W; w++) dp[w] = Math.max(dp[w], dp[w - weight[i]] + val[i]);',
        fixedSnippet: 'for (let w = W; w >= weight[i]; w--) dp[w] = Math.max(dp[w], dp[w - weight[i]] + val[i]);',
        whyItHappens: 'Forward iteration reads the already-updated dp[w - weight[i]] from the CURRENT item i, turning 0/1 into unbounded knapsack.',
      },
      {
        bugTitle: 'Forgetting unreachable sentinel check before returning dp[target]',
        badSnippet: 'return dp[amount]; // leaks Infinity!',
        fixedSnippet: 'return dp[amount] === Infinity ? -1 : dp[amount];',
        whyItHappens: 'Unreachable states remain initialized to Infinity; callers expect -1.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'house-robber',
        title: 'House Robber (1D Take/Skip)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · 1D linear recurrence with O(1) rolling two-variable space compression',
        companyTags: ['Amazon', 'Google', 'Adobe'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the take-vs-skip transition with O(1) space:',
          skeletonWithBlanks: `let prev2 = 0, prev1 = 0;
for (const money of nums) {
  const best = ___BLANK_1___;
  prev2 = prev1;
  ___BLANK_2___;
}
return prev1;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Max of skipping vs robbing current house',
              expected: 'Math.max(prev1, prev2 + money)',
              acceptedKeywords: ['Math.max', 'prev1', 'prev2', 'money'],
              hint: 'Either keep prev1 (skip) or take prev2 + money.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Advance rolling window pointer',
              expected: 'prev1 = best',
              acceptedKeywords: ['prev1', '=', 'best'],
              hint: 'Shift prev1 forward to best.',
            },
          ],
        },
      },
      {
        problemId: 'coin-change-dp',
        title: 'Coin Change (Unbounded Min-Cost)',
        difficulty: 'Medium',
        mutationDelta: 'Mutation 1 · State transitions branch across K variable coin offsets instead of fixed i-1 / i-2',
        companyTags: ['Amazon', 'Google', 'Uber', 'Microsoft'],
        trainerSlug: 'coin-change',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Fill in the base case and coin transition:',
          skeletonWithBlanks: `const dp = new Array(amount + 1).fill(Infinity);
___BLANK_1___;
for (let a = 1; a <= amount; a++) {
  for (const c of coins) {
    if (a >= c) ___BLANK_2___;
  }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Seed zero-amount base case',
              expected: 'dp[0] = 0',
              acceptedKeywords: ['dp[0]', '=', '0'],
              hint: 'Zero coins are needed to form amount 0.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Relax dp[a] using coin c',
              expected: 'dp[a] = Math.min(dp[a], dp[a - c] + 1)',
              acceptedKeywords: ['Math.min', 'dp[a - c]', '+ 1'],
              hint: 'Take min of current dp[a] and 1 + dp[a - c].',
            },
          ],
        },
      },
      {
        problemId: 'edit-distance-2d',
        title: 'Edit Distance (2D Grid DP)',
        difficulty: 'Hard',
        mutationDelta: 'Mutation 2 · Two-string 2D state dp[i][j] choosing match (diag) vs 1 + min(insert, delete, replace)',
        companyTags: ['Google', 'Meta', 'Uber', 'Atlassian'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the character match and mismatch 3-way transition:',
          skeletonWithBlanks: `if (a[i - 1] === b[j - 1]) {
  ___BLANK_1___;
} else {
  dp[i][j] = 1 + ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Zero cost when characters match',
              expected: 'dp[i][j] = dp[i - 1][j - 1]',
              acceptedKeywords: ['dp[i - 1][j - 1]'],
              hint: 'Inherit directly from the diagonal subproblem.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Min of delete, insert, and replace',
              expected: 'Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])',
              acceptedKeywords: ['Math.min', 'dp[i - 1][j]', 'dp[i][j - 1]'],
              hint: 'Take Math.min over top, left, and top-left cells.',
            },
          ],
        },
      },
    ],
  },
  ...DEEP_BLUEPRINTS_PART_1,
  ...DEEP_BLUEPRINTS_PART_2,
};

/**
 * Generates a complete, domain-faithful DeepTopicBlueprint for ANY of the 22 curriculum topics.
 * Topics with bespoke handcrafted entries return directly; remaining topics synthesize rich
 * analogies, constraint guides, bug traps, and faded code challenges from their topic metadata.
 */
export function getDeepTopicBlueprint(topic: CurriculumTopic): DeepTopicBlueprint {
  if (BLUEPRINTS_BY_ID[topic.id]) {
    return BLUEPRINTS_BY_ID[topic.id];
  }

  const optimal = topic.solutions.optimal;
  const brute = topic.solutions.brute;
  const firstClue = topic.patternClues[0];
  const ladder = topic.problemLadder;

  const isLog = optimal.timeComplexity.toLowerCase().includes('log') && !optimal.timeComplexity.includes('N log');
  const isNLogN = optimal.timeComplexity.toLowerCase().includes('n log') || optimal.timeComplexity.toLowerCase().includes('e log');
  const isExp = optimal.timeComplexity.includes('^') || optimal.timeComplexity.includes('!');

  const correctTierId: DeepTopicBlueprint['constraintGuide']['correctTierId'] = isExp
    ? 'exp'
    : isLog
      ? 'logn'
      : isNLogN
        ? 'nlogn'
        : 'n';

  const inputBound =
    firstClue?.constraintHint ??
    (isExp ? '1 <= N <= 20' : isNLogN ? '1 <= N <= 2 × 10^5' : '1 <= N <= 10^5');

  return {
    id: topic.id,
    title: topic.title,
    category: topic.category,
    eli5Analogy: `${topic.tagline} Think of it like organizing only the minimal signal you need at each step so you never redo earlier work.`,
    whenToUse: topic.patternClues.slice(0, 3).map((c) => `${c.signal} (${c.constraintHint})`),
    whenNotToUse: [
      `When input constraints allow a simpler linear scan without extra ${topic.title} structure overhead`,
      `When the core invariant of ${topic.title} is broken by negative weights, unsorted mutations, or non-monotonic updates`,
      'When problem explicitly asks to enumerate all raw permutations/subsets rather than optimize or structure queries',
    ],
    constraintGuide: {
      inputBound,
      expectedComplexity: `${optimal.timeComplexity} time · ${optimal.spaceComplexity} space`,
      correctTierId,
      eliminatedApproaches: [
        `Brute Force (${brute.title}: ${brute.timeComplexity}) — triggers TLE at production scale`,
        'Unstructured repeated re-scanning across overlapping states',
      ],
      mathProof: `Given ${inputBound}, budget is ~10^8 ops/sec. ${brute.timeComplexity} exceeds budget, while ${optimal.timeComplexity} completes in milliseconds.`,
    },
    blankPageDrill: {
      tinyInput: `Small hand-trace case (N = 4) for ${topic.title}`,
      manualQuestion: `Walk through 4 elements by hand: what exact information from step i-1 must be remembered so step i doesn't restart from index 0?`,
      memoryBridge: topic.mentalModelSteps[1] ?? topic.mentalModelSteps[0] ?? optimal.title,
      bruteBottleneck: `${brute.title} (${brute.timeComplexity}) repeats work that ${optimal.title} eliminates.`,
      invariantPrompt: `At every iteration of ${topic.title}, our core state structure guarantees ___ in ${optimal.timeComplexity} time.`,
      adversarialCases: [
        { label: 'Empty / Single Input', input: 'N = 0 or N = 1', trap: 'Ensure loop/base-case exits cleanly without null/index crashes.' },
        { label: 'All Duplicates', input: '[5, 5, 5, 5]', trap: 'Verify strict (<) vs inclusive (<=) boundary operators.' },
        { label: 'Sorted vs Reverse', input: '[1,2,3,4] vs [4,3,2,1]', trap: 'Avoid O(N²) worst-case degeneration on ordered input.' },
        { label: 'Negative / Large Values', input: '[-10^9, 10^9]', trap: 'Avoid fixed positive assumptions or 32-bit overflow.' },
      ],
    },
    coreInvariant: topic.mentalModelSteps[0] ?? optimal.intuition,
    commonBugsAndTraps: [
      {
        bugTitle: `Reverting to ${brute.timeComplexity} inside an inner loop`,
        badSnippet: `// Re-scanning prior elements every step (${brute.timeComplexity})\nfor (let i = 0; i < n; i++) for (let j = i; j < n; j++) { ... }`,
        fixedSnippet: `// Maintain ${optimal.title} invariant in ${optimal.timeComplexity}\n// Update state incrementally per step instead of re-scanning`,
        whyItHappens: 'Skipping the invariant statement before coding leads to accidental nested lookups.',
      },
      {
        bugTitle: 'Off-by-one boundary condition (< vs <=) or stale state',
        badSnippet: 'while (left < right) { /* forgets edge case when pointers meet */ }',
        fixedSnippet: '// Explicitly verify N=1, empty input, and loop termination condition on a 3-element dry run',
        whyItHappens: 'Skipping a manual N=3 trace hides boundary bugs until submission.',
      },
    ],
    linkedProblems: ladder.slice(0, 4).map((item, idx) => ({
      problemId: item.id,
      title: item.title,
      difficulty: item.difficulty === 'Real-World System' ? 'System' : item.difficulty,
      mutationDelta:
        idx === 0
          ? `Base Form · ${item.patternTwist}`
          : `Mutation ${idx} · ${item.patternTwist} (${item.targetComplexity})`,
      companyTags:
        idx === 0
          ? ['Amazon', 'Microsoft']
          : idx === 1
            ? ['Google', 'Meta', 'Uber']
            : ['Google', 'Uber', 'Atlassian', 'Flipkart'],
      trainerSlug: item.trainerSlug,
      fadedCodeChallenge: {
        language: 'typescript',
        prompt: `Recall the core invariant guard and state update for ${item.title} (${topic.title}):`,
        skeletonWithBlanks: `// Pattern: ${optimal.title} (${item.targetComplexity})
function solve(input: unknown) {
  // 1. Initialize core invariant state
  const state = ___BLANK_1___;
  // 2. Apply transition for: ${item.patternTwist}
  //    Target complexity: ${item.targetComplexity}
  return ___BLANK_2___;
}`,
        missingLines: [
          {
            placeholder: '___BLANK_1___',
            label: 'Primary data structure / state initialization',
            expected: 'new Map() // or optimal structure for ' + topic.title,
            acceptedKeywords: ['map', 'set', 'array', 'stack', 'queue', 'heap', 'dp', '0', '[]', '{}'],
            hint: `Use the core ${optimal.spaceComplexity} data structure from ${optimal.title}.`,
          },
          {
            placeholder: '___BLANK_2___',
            label: 'Final invariant result expression',
            expected: 'result',
            acceptedKeywords: ['result', 'ans', 'best', 'dp', 'state', 'count', 'lo', 'true'],
            hint: 'Return the accumulated optimal answer once the invariant loop finishes.',
          },
        ],
      },
    })),
  };
}
