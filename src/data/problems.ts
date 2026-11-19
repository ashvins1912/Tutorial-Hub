import { ProblemDefinition, RaceFrame } from '../types/dsa';
import { TOP_INTERVIEW_PROBLEMS_A } from './topInterviewProblemsA';
import { TOP_INTERVIEW_PROBLEMS_B } from './topInterviewProblemsB';
import { TOP_INTERVIEW_PROBLEMS_C } from './topInterviewProblemsC';

// Trace Generators for 20-element Race Mode
function generateTwoSumBruteTrace(nums: number[], target: number): RaceFrame[] {
  const frames: RaceFrame[] = [];
  let ops = 0;
  let step = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      ops++;
      step++;
      const sum = nums[i] + nums[j];
      const found = sum === target;
      frames.push({
        step,
        pointers: [
          { label: 'i', index: i, color: 'sky' },
          { label: 'j', index: j, color: 'rose' },
        ],
        activeIndices: [i, j],
        redundantIndices: i > 0 && !found ? [j] : [],
        operationsCount: ops,
        memoryUnits: 2,
        statusText: found
          ? `Match found: nums[${i}] (${nums[i]}) + nums[${j}] (${nums[j]}) = ${target}`
          : `Pair (${i}, ${j}): ${nums[i]} + ${nums[j]} = ${sum} != ${target} (re-scanning array)`,
        bestValueLabel: found ? `[${i}, ${j}]` : 'Searching...',
        isComplete: found,
      });
      if (found) return frames;
    }
  }
  return frames;
}

function generateTwoSumOptimalTrace(nums: number[], target: number): RaceFrame[] {
  const frames: RaceFrame[] = [];
  const seen = new Map<number, number>();
  let ops = 0;
  for (let i = 0; i < nums.length; i++) {
    ops++;
    const comp = target - nums[i];
    if (seen.has(comp)) {
      const matchIdx = seen.get(comp)!;
      frames.push({
        step: i + 1,
        pointers: [
          { label: 'map', index: matchIdx, color: 'emerald' },
          { label: 'i', index: i, color: 'sky' },
        ],
        activeIndices: [matchIdx, i],
        redundantIndices: [],
        operationsCount: ops,
        memoryUnits: seen.size,
        statusText: `O(1) HashMap hit! Need ${comp}, found at index ${matchIdx}`,
        bestValueLabel: `[${matchIdx}, ${i}]`,
        isComplete: true,
      });
      return frames;
    }
    seen.set(nums[i], i);
    frames.push({
      step: i + 1,
      pointers: [{ label: 'i', index: i, color: 'sky' }],
      activeIndices: [i],
      redundantIndices: [],
      operationsCount: ops,
      memoryUnits: seen.size,
      statusText: `Check map[${comp}] -> miss. Store map[${nums[i]}] = ${i}`,
      bestValueLabel: `Map size: ${seen.size}`,
    });
  }
  return frames;
}

function generateSubstringBruteTrace(chars: string[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  let ops = 0;
  let step = 0;
  let best = 0;
  for (let i = 0; i < chars.length; i++) {
    const seen = new Set<string>();
    for (let j = i; j < chars.length; j++) {
      ops++;
      step++;
      if (seen.has(chars[j])) {
        frames.push({
          step,
          pointers: [
            { label: 'i', index: i, color: 'sky' },
            { label: 'j', index: j, color: 'rose' },
          ],
          activeIndices: [i, j],
          redundantIndices: Array.from({ length: j - i }, (_, k) => i + k),
          operationsCount: ops,
          memoryUnits: seen.size,
          statusText: `Duplicate '${chars[j]}' at ${j}. Discard window [${i}..${j}] and restart at i=${i + 1}`,
          bestValueLabel: `Best: ${best}`,
        });
        break;
      }
      seen.add(chars[j]);
      best = Math.max(best, j - i + 1);
      frames.push({
        step,
        pointers: [
          { label: 'i', index: i, color: 'sky' },
          { label: 'j', index: j, color: 'amber' },
        ],
        activeIndices: Array.from({ length: j - i + 1 }, (_, k) => i + k),
        redundantIndices: i > 0 ? [j] : [],
        operationsCount: ops,
        memoryUnits: seen.size,
        statusText: `Re-checking slice [${i}..${j}] (${j - i + 1} chars)`,
        bestValueLabel: `Best: ${best}`,
      });
    }
  }
  if (frames.length > 0) {
    frames[frames.length - 1].isComplete = true;
    frames[frames.length - 1].statusText = `Finished all O(N²) start indices. Max unique length = ${best}`;
  }
  return frames;
}

function generateSubstringOptimalTrace(chars: string[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  const lastIdx = new Map<string, number>();
  let left = 0;
  let best = 0;
  let ops = 0;
  for (let right = 0; right < chars.length; right++) {
    ops++;
    const ch = chars[right];
    if (lastIdx.has(ch) && lastIdx.get(ch)! >= left) {
      left = lastIdx.get(ch)! + 1;
    }
    lastIdx.set(ch, right);
    best = Math.max(best, right - left + 1);
    frames.push({
      step: right + 1,
      pointers: [
        { label: 'L', index: left, color: 'amber' },
        { label: 'R', index: right, color: 'sky' },
      ],
      activeIndices: Array.from({ length: right - left + 1 }, (_, k) => left + k),
      redundantIndices: [],
      operationsCount: ops,
      memoryUnits: lastIdx.size,
      statusText: `Window [${left}..${right}] '${ch}' -> single-pass jump, len=${right - left + 1}`,
      bestValueLabel: `Best: ${best}`,
      isComplete: right === chars.length - 1,
    });
  }
  return frames;
}

function generateDailyTempsBruteTrace(temps: number[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  let ops = 0;
  let step = 0;
  let resolved = 0;
  for (let i = 0; i < temps.length; i++) {
    let found = false;
    for (let j = i + 1; j < temps.length; j++) {
      ops++;
      step++;
      if (temps[j] > temps[i]) {
        resolved++;
        found = true;
        frames.push({
          step,
          pointers: [
            { label: 'i', index: i, color: 'sky' },
            { label: 'j', index: j, color: 'emerald' },
          ],
          activeIndices: [i, j],
          redundantIndices: Array.from({ length: j - i - 1 }, (_, k) => i + 1 + k),
          operationsCount: ops,
          memoryUnits: 2,
          statusText: `Day ${i} (${temps[i]}°): scanned forward to Day ${j} (${temps[j]}°) -> wait ${j - i}d`,
          bestValueLabel: `Resolved: ${resolved}/${temps.length}`,
        });
        break;
      }
      frames.push({
        step,
        pointers: [
          { label: 'i', index: i, color: 'sky' },
          { label: 'j', index: j, color: 'rose' },
        ],
        activeIndices: [i, j],
        redundantIndices: [j],
        operationsCount: ops,
        memoryUnits: 2,
        statusText: `Day ${i} (${temps[i]}°): ${temps[j]}° not warmer — scanning onward`,
        bestValueLabel: `Resolved: ${resolved}/${temps.length}`,
      });
    }
    if (!found) {
      resolved++;
    }
  }
  if (frames.length > 0) {
    frames[frames.length - 1].isComplete = true;
  }
  return frames;
}

function generateDailyTempsOptimalTrace(temps: number[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  const stack: number[] = [];
  let ops = 0;
  let resolved = 0;
  for (let i = 0; i < temps.length; i++) {
    ops++;
    const popped: number[] = [];
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      popped.push(idx);
      resolved++;
      ops++;
    }
    stack.push(i);
    frames.push({
      step: i + 1,
      pointers: [{ label: 'i', index: i, color: 'sky' }],
      activeIndices: [i, ...popped],
      redundantIndices: [],
      operationsCount: ops,
      memoryUnits: stack.length,
      statusText:
        popped.length > 0
          ? `Day ${i} (${temps[i]}°) resolved ${popped.length} stacked colder day(s); stack size = ${stack.length}`
          : `Day ${i} (${temps[i]}°) <= top; pushed onto monotonic stack (size ${stack.length})`,
      bestValueLabel: `Stack: [${stack.slice(-4).join(',')}]`,
      isComplete: i === temps.length - 1,
    });
  }
  return frames;
}

function generateRainWaterBruteTrace(heights: number[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  let ops = 0;
  let step = 0;
  let total = 0;
  for (let i = 0; i < heights.length; i++) {
    let leftMax = 0;
    for (let l = 0; l <= i; l++) {
      ops++;
      leftMax = Math.max(leftMax, heights[l]);
    }
    let rightMax = 0;
    for (let r = i; r < heights.length; r++) {
      ops++;
      rightMax = Math.max(rightMax, heights[r]);
    }
    const water = Math.max(0, Math.min(leftMax, rightMax) - heights[i]);
    total += water;
    step++;
    frames.push({
      step,
      pointers: [{ label: 'i', index: i, color: 'rose' }],
      activeIndices: [i],
      redundantIndices: Array.from({ length: heights.length }, (_, k) => k).filter((k) => k !== i),
      operationsCount: ops,
      memoryUnits: 3,
      statusText: `Bar ${i}: scanned all ${heights.length} bars again! Lmax=${leftMax}, Rmax=${rightMax}, +${water}`,
      bestValueLabel: `Water: ${total}`,
      isComplete: i === heights.length - 1,
    });
  }
  return frames;
}

function generateRainWaterOptimalTrace(heights: number[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  let l = 0;
  let r = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;
  let ops = 0;
  let step = 0;
  while (l < r) {
    ops++;
    step++;
    if (heights[l] < heights[r]) {
      leftMax = Math.max(leftMax, heights[l]);
      const gained = Math.max(0, leftMax - heights[l]);
      total += gained;
      frames.push({
        step,
        pointers: [
          { label: 'L', index: l, color: 'sky' },
          { label: 'R', index: r, color: 'amber' },
        ],
        activeIndices: [l],
        redundantIndices: [],
        operationsCount: ops,
        memoryUnits: 4,
        statusText: `h[L]=${heights[l]} < h[R]=${heights[r]}: trap +${gained} using Lmax=${leftMax}, advance L`,
        bestValueLabel: `Water: ${total}`,
      });
      l++;
    } else {
      rightMax = Math.max(rightMax, heights[r]);
      const gained = Math.max(0, rightMax - heights[r]);
      total += gained;
      frames.push({
        step,
        pointers: [
          { label: 'L', index: l, color: 'sky' },
          { label: 'R', index: r, color: 'amber' },
        ],
        activeIndices: [r],
        redundantIndices: [],
        operationsCount: ops,
        memoryUnits: 4,
        statusText: `h[R]=${heights[r]} <= h[L]=${heights[l]}: trap +${gained} using Rmax=${rightMax}, retreat R`,
        bestValueLabel: `Water: ${total}`,
      });
      r--;
    }
  }
  if (frames.length > 0) {
    frames[frames.length - 1].isComplete = true;
    frames[frames.length - 1].statusText = `Pointers met at index ${l}. Total trapped water = ${total} in ${ops} steps`;
  }
  return frames;
}

function generateCoinChangeBruteTrace(amounts: number[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  // Simulate exponential recursive calls exploding across amounts 0..19
  let ops = 0;
  for (let i = 0; i < amounts.length; i++) {
    const branchCalls = Math.min(240, Math.round(Math.pow(1.42, i + 1)));
    ops += branchCalls;
    frames.push({
      step: i + 1,
      pointers: [{ label: 'rec', index: i, color: 'rose' }],
      activeIndices: [i],
      redundantIndices: i >= 2 ? Array.from({ length: i }, (_, k) => k) : [],
      operationsCount: ops,
      memoryUnits: i + 1,
      statusText: `Amount ${i}: uncached recursion recomputed subtrees ${branchCalls} redundant times`,
      bestValueLabel: `Calls: ${ops}`,
      isComplete: i === amounts.length - 1,
    });
  }
  return frames;
}

function generateCoinChangeOptimalTrace(amounts: number[]): RaceFrame[] {
  const frames: RaceFrame[] = [];
  const coins = [1, 3, 4];
  const dp = new Array(amounts.length).fill(Infinity);
  dp[0] = 0;
  let ops = 0;
  for (let a = 0; a < amounts.length; a++) {
    const deps: number[] = [];
    if (a > 0) {
      for (const c of coins) {
        ops++;
        if (a - c >= 0 && dp[a - c] + 1 < dp[a]) {
          dp[a] = dp[a - c] + 1;
          deps.push(a - c);
        }
      }
    } else {
      ops++;
    }
    frames.push({
      step: a + 1,
      pointers: [{ label: 'dp', index: a, color: 'emerald' }],
      activeIndices: [a, ...deps],
      redundantIndices: [],
      operationsCount: ops,
      memoryUnits: amounts.length,
      statusText:
        a === 0
          ? `Base case: dp[0] = 0 coins`
          : `dp[${a}] = ${dp[a]} coin(s) via cached dependencies [${deps.join(', ')}]`,
      bestValueLabel: `dp[${a}] = ${dp[a]}`,
      isComplete: a === amounts.length - 1,
    });
  }
  return frames;
}

const TWO_SUM_RACE_NUMS = [14, 3, 21, 8, 17, 5, 29, 12, 6, 33, 19, 4, 25, 11, 9, 27, 16, 2, 7, 15];
const TWO_SUM_RACE_TARGET = 9;
const SUBSTRING_RACE_CHARS = 'abcdaefgbhijcklmnopq'.split('');
const DAILY_TEMPS_RACE = [78, 75, 73, 72, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 71, 74, 76, 79, 80, 82];
const RAIN_RACE_HEIGHTS = [0, 2, 1, 3, 0, 1, 2, 1, 4, 1, 2, 0, 3, 1, 2, 4, 1, 0, 2, 1];
const COIN_RACE_AMOUNTS = Array.from({ length: 20 }, (_, i) => i);

export const PROBLEMS: ProblemDefinition[] = [
  {
    id: 'two-sum',
    number: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    tier: 1,
    rankRequirement: 'Noob',
    patternId: 'arrays-hashing',
    patternName: 'Arrays & Hashing',
    topicQuizId: 'sliding-window',
    estimatedMinutes: 12,
    inputSizeExponent: 4,
    targetBigO: 'O(N)',
    bruteBigO: 'O(N²)',
    spaceOptimal: 'O(N)',
    spaceBrute: 'O(1)',
    summary: 'Find two distinct indices in an unsorted array whose values add up to a target sum.',
    statementSegments: [
      { text: 'Given an ' },
      { text: 'unsorted array of integers', signalId: 'unsorted-array' },
      { text: ' nums of length ' },
      { text: 'up to 10^4', signalId: 'input-n' },
      { text: ' and an integer target, return indices of the ' },
      { text: 'two distinct elements such that they add up to target', signalId: 'pair-complement' },
      { text: '. You may assume each input has ' },
      { text: 'exactly one solution', signalId: 'unique-solution' },
      { text: ', and you may not use the same element twice.' },
    ],
    signals: [
      {
        id: 'unsorted-array',
        phrase: 'unsorted array of integers',
        impliedConstraint: 'Order is arbitrary, and we must return original indices rather than values.',
        eliminatedPatterns: ['Two Pointers (without sorting)', 'Binary Search'],
        triggeredPatterns: ['HashMap Complement Lookup'],
        complexityHint: 'Sorting takes O(N log N) and loses original indices unless you pack pairs. Hashing keeps indices in O(N).',
      },
      {
        id: 'input-n',
        phrase: 'up to 10^4',
        impliedConstraint: 'N = 10,000 means N² = 10^8 operations — borderline TLE in strict judges.',
        eliminatedPatterns: ['Exponential Backtracking O(2^N)'],
        triggeredPatterns: ['Single-Pass O(N) HashMap'],
        complexityHint: 'Aim for O(N) or O(N log N) so total operations stay near 10^4 instead of 10^8.',
      },
      {
        id: 'pair-complement',
        phrase: 'two distinct elements such that they add up to target',
        impliedConstraint: 'Once nums[i] is fixed, the needed partner is uniquely determined: complement = target - nums[i].',
        eliminatedPatterns: ['Sliding Window (non-contiguous pair)'],
        triggeredPatterns: ['Arrays & Hashing (Complement Lookup)'],
        complexityHint: 'Turns a 2-variable search into a 1-variable existence check in O(1) expected time.',
      },
      {
        id: 'unique-solution',
        phrase: 'exactly one solution',
        impliedConstraint: 'We can return immediately on the first HashMap hit without handling multi-match deduplication.',
        eliminatedPatterns: ['Backtracking All-Subsets'],
        triggeredPatterns: ['Early-Exit HashMap Scan'],
        complexityHint: 'Safe to store value -> index as we scan left-to-right.',
      },
    ],
    quizPrompt: 'Based on the signal clues above, which Pattern + Data Structure solves this in O(N)?',
    quizOptions: [
      {
        id: 'opt-hash',
        pattern: 'Complement Lookup',
        dataStructure: 'HashMap (value -> index)',
        isCorrect: true,
        feedback: 'Exact match. Storing each visited value and its index lets us check (target - nums[i]) in O(1) time.',
      },
      {
        id: 'opt-tp',
        pattern: 'Converging Two Pointers',
        dataStructure: 'Sorted Array',
        isCorrect: false,
        feedback: 'Close, but the array is unsorted and sorting destroys original indices (and adds O(N log N) overhead).',
      },
      {
        id: 'opt-sw',
        pattern: 'Sliding Window',
        dataStructure: 'Contiguous Range [L..R]',
        isCorrect: false,
        feedback: 'The two elements do not need to be adjacent or contiguous, so a sliding window will miss separated pairs.',
      },
      {
        id: 'opt-heap',
        pattern: 'Top-K Selection',
        dataStructure: 'Min-Heap',
        isCorrect: false,
        feedback: 'A heap orders elements by magnitude, not by arithmetic complement (target - x).',
      },
    ],
    loopInvariantPrompt: 'Lock your Loop Invariant before assembling code blocks:',
    loopInvariants: [
      {
        id: 'inv-ts-1',
        statement: 'Before checking index i, the HashMap contains every value nums[0..i-1] mapped to its original index.',
        isCorrect: true,
        feedback: 'Correct invariant! Checking the map BEFORE inserting nums[i] guarantees we never pair an element with itself.',
      },
      {
        id: 'inv-ts-2',
        statement: 'The array stays sorted in ascending order at every step of the loop.',
        isCorrect: false,
        feedback: 'Sorting breaks original index positions required for the return value.',
      },
    ],
    feynmanPrompt: {
      templateBefore: 'Instead of re-scanning the remaining array for every element, a HashMap trades O(N) memory for ',
      templateAfter: ', cutting time from O(N²) to O(N).',
      choices: [
        {
          id: 'feyn-ts-1',
          phrase: 'O(1) complement lookup of (target - nums[i])',
          isCorrect: true,
          feedback: 'Clean Feynman summary! You have unlocked the 1-3-7-21 review schedule for Two Sum.',
        },
        {
          id: 'feyn-ts-2',
          phrase: 'O(log N) binary search across sorted indices',
          isCorrect: false,
          feedback: 'HashMap lookup is O(1) average time, not O(log N) binary search.',
        },
      ],
      twistConstraint: 'Now solve assuming the array IS sorted and you must use O(1) extra space.',
    },
    sandboxConfig: {
      type: 'two-sum',
      instruction: 'Click two array cells that sum to target = 9. Watch how checking complements avoids scanning every pair.',
      hint: 'Try inspecting element 2 (value 7) -> complement is 9 - 7 = 2, which we already stored from index 0!',
      sampleArray: [2, 11, 7, 15],
      targetSum: 9,
    },
    functionSignature: {
      java: {
        header: 'public int[] twoSum(int[] nums, int target) {',
        footer: '  return new int[]{}; \n}',
      },
      js: {
        header: 'function twoSum(nums, target) {',
        footer: '  return [];\n}',
      },
      python: {
        header: 'def two_sum(nums: list[int], target: int) -> list[int]:',
        footer: '    return []',
      },
    },
    blocks: [
      {
        id: 'ts-brute-init',
        label: 'Initialize Outer Index i = 0',
        category: 'Variables & Pointers',
        targetSlot: 'init',
        mode: 'brute',
        summary: 'Prepare to fix the first candidate index i across the array.',
        code: {
          java: ['  int n = nums.length;'],
          js: ['  const n = nums.length;'],
          python: ['    n = len(nums)'],
        },
      },
      {
        id: 'ts-brute-loop',
        label: 'Nested Pair Loop (i, j = i + 1)',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'brute',
        summary: 'Check every pair (i, j) with j > i — O(N²) total comparisons.',
        code: {
          java: ['  for (int i = 0; i < n; i++) {', '    for (int j = i + 1; j < n; j++) {'],
          js: ['  for (let i = 0; i < n; i++) {', '    for (let j = i + 1; j < n; j++) {'],
          python: ['    for i in range(n):', '        for j in range(i + 1, n):'],
        },
      },
      {
        id: 'ts-brute-update',
        label: 'If nums[i] + nums[j] == target, Return [i, j]',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'brute',
        summary: 'Direct equality test on the pair sum.',
        code: {
          java: ['      if (nums[i] + nums[j] == target) {', '        return new int[]{i, j};', '      }', '    }', '  }'],
          js: ['      if (nums[i] + nums[j] === target) {', '        return [i, j];', '      }', '    }', '  }'],
          python: ['            if nums[i] + nums[j] == target:', '                return [i, j]'],
        },
      },
      {
        id: 'ts-opt-init',
        label: 'Initialize Empty HashMap (seen)',
        category: 'Data Structure Ops',
        targetSlot: 'init',
        mode: 'optimal',
        summary: 'Allocate an O(1) lookup table mapping value -> array index.',
        code: {
          java: ['  Map<Integer, Integer> seen = new HashMap<>();'],
          js: ['  const seen = new Map();'],
          python: ['    seen = {}'],
        },
      },
      {
        id: 'ts-opt-loop',
        label: 'Single Pass Loop (i = 0 .. n - 1)',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'optimal',
        summary: 'Visit each element once and compute complement = target - nums[i].',
        code: {
          java: ['  for (int i = 0; i < nums.length; i++) {', '    int comp = target - nums[i];'],
          js: ['  for (let i = 0; i < nums.length; i++) {', '    const comp = target - nums[i];'],
          python: ['    for i, num in enumerate(nums):', '        comp = target - num'],
        },
      },
      {
        id: 'ts-opt-update',
        label: 'Lookup Complement in Map or Map.put(num, i)',
        category: 'Data Structure Ops',
        targetSlot: 'update',
        mode: 'optimal',
        summary: 'If complement exists, return immediately; otherwise record current value.',
        code: {
          java: ['    if (seen.containsKey(comp)) {', '      return new int[]{seen.get(comp), i};', '    }', '    seen.put(nums[i], i);', '  }'],
          js: ['    if (seen.has(comp)) {', '      return [seen.get(comp), i];', '    }', '    seen.set(nums[i], i);', '  }'],
          python: ['        if comp in seen:', '            return [seen[comp], i]', '        seen[num] = i'],
        },
      },
      {
        id: 'ts-dist-1',
        label: 'Sort nums[] In-Place First',
        category: 'Data Structure Ops',
        targetSlot: 'init',
        mode: 'distractor',
        summary: 'Sorting alters element positions before we capture indices.',
        distractorReason: 'Sorting destroys original array indices, and the problem requires returning the original indices.',
        code: {
          java: ['  Arrays.sort(nums); // Destroys original indices!'],
          js: ['  nums.sort((a, b) => a - b); // Destroys original indices!'],
          python: ['    nums.sort()  # Destroys original indices!'],
        },
      },
      {
        id: 'ts-dist-2',
        label: 'Check Adjacent Pair Only (nums[i] + nums[i+1])',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'distractor',
        summary: 'Checks only neighboring indices.',
        distractorReason: 'The matching pair can sit anywhere in the array, not necessarily side-by-side.',
        code: {
          java: ['    if (nums[i] + nums[i + 1] == target) return new int[]{i, i + 1};'],
          js: ['    if (nums[i] + nums[i + 1] === target) return [i, i + 1];'],
          python: ['        if nums[i] + nums[i + 1] == target: return [i, i + 1]'],
        },
      },
    ],
    bottleneck: {
      question: 'Watch the Rose-highlighted inner loop in the Brute Force trace. What exact work is being wasted?',
      options: [
        {
          id: 'bn-1',
          text: 'Re-scanning unsorted elements repeatedly to ask "does (target - nums[i]) exist?"',
          isCorrect: true,
          explanation: 'Spot on! Every iteration of j linearly searches for (target - nums[i]). Remembering previously seen values in a HashMap answers that question in O(1).',
        },
        {
          id: 'bn-2',
          text: 'Computing target - nums[i] subtraction inside the loop',
          isCorrect: false,
          explanation: 'Arithmetic subtraction is O(1). The bottleneck is the O(N) linear scan repeated N times.',
        },
        {
          id: 'bn-3',
          text: 'Allocating the output array of size 2',
          isCorrect: false,
          explanation: 'Returning a 2-element array is O(1) and only runs once upon finding the match.',
        },
      ],
    },
    raceDataset: {
      label: '20-element unsorted array · target = 9',
      values: TWO_SUM_RACE_NUMS,
      target: TWO_SUM_RACE_TARGET,
      bruteTrace: generateTwoSumBruteTrace(TWO_SUM_RACE_NUMS, TWO_SUM_RACE_TARGET),
      optimalTrace: generateTwoSumOptimalTrace(TWO_SUM_RACE_NUMS, TWO_SUM_RACE_TARGET),
    },
    interviewContext: {
      companies: ['Google', 'Amazon', 'Meta', 'Stripe', 'Bloomberg'],
      frequencyNote: 'Warmup screening classic; interviewers often pivot immediately to space constraints or unsorted vs sorted follow-ups.',
      followUpTwists: [
        {
          twist: 'What if the input array is already sorted and O(1) extra space is required?',
          adaptation: 'Drop the HashMap and use converging Two Pointers (L=0, R=n-1), moving L++ when sum < target and R-- when sum > target.',
        },
        {
          twist: 'What if there are duplicates and you must return all unique triplets summing to 0 (3Sum)?',
          adaptation: 'Sort first, fix nums[i] (skipping duplicates), and run Two Pointers on the remaining suffix.',
        },
      ],
      relatedProblems: [
        { title: 'Two Sum II (Sorted Input)', difficulty: 'Medium', sharedTrigger: 'Pair sum target with sorted order -> Two Pointers' },
        { title: 'Subarray Sum Equals K', difficulty: 'Medium', sharedTrigger: 'Complement lookup (prefixSum - K) inside HashMap' },
        { title: '4Sum II', difficulty: 'Medium', sharedTrigger: 'Split 4 arrays into 2 pair-sum HashMaps' },
      ],
    },
  },
  {
    id: 'longest-substring',
    number: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tier: 2,
    rankRequirement: 'Practitioner',
    patternId: 'sliding-window',
    patternName: 'Sliding Window',
    topicQuizId: 'sliding-window',
    estimatedMinutes: 16,
    inputSizeExponent: 5,
    targetBigO: 'O(N)',
    bruteBigO: 'O(N²)',
    spaceOptimal: 'O(min(N, Σ))',
    spaceBrute: 'O(min(N, Σ))',
    summary: 'Find the length of the longest contiguous substring containing all unique characters.',
    statementSegments: [
      { text: 'Given a string s of length ' },
      { text: 'up to 5 x 10^4', signalId: 'n-5e4' },
      { text: ', find the length of the ' },
      { text: 'longest contiguous substring', signalId: 'contiguous-longest' },
      { text: ' ' },
      { text: 'without repeating characters', signalId: 'unique-invariant' },
      { text: '.' },
    ],
    signals: [
      {
        id: 'n-5e4',
        phrase: 'up to 5 x 10^4',
        impliedConstraint: 'N = 50,000 means O(N²) = 2.5 x 10^9 ops -> guaranteed Time Limit Exceeded.',
        eliminatedPatterns: ['Nested Substring Enumeration O(N²)'],
        triggeredPatterns: ['Linear Sliding Window O(N)'],
        complexityHint: 'Must process each character at most twice (once by Right pointer, once by Left pointer).',
      },
      {
        id: 'contiguous-longest',
        phrase: 'longest contiguous substring',
        impliedConstraint: 'Characters must sit consecutively [L..R] without gaps.',
        eliminatedPatterns: ['Subsequence DP', 'Backtracking'],
        triggeredPatterns: ['Variable-Size Sliding Window'],
        complexityHint: 'Represent any candidate substring with just two indices: Left and Right.',
      },
      {
        id: 'unique-invariant',
        phrase: 'without repeating characters',
        impliedConstraint: 'Monotonic validity: if [L..R] has a duplicate, extending R further stays invalid until L passes the duplicate.',
        eliminatedPatterns: ['Binary Search on Length (slower O(N log N))'],
        triggeredPatterns: ['HashSet / Last-Seen Index Map'],
        complexityHint: 'Track last seen index of each char to jump Left directly past collisions.',
      },
    ],
    quizPrompt: 'Which Pattern + State Structure maintains a valid contiguous range in O(N)?',
    quizOptions: [
      {
        id: 'opt-sw-map',
        pattern: 'Dynamic Sliding Window',
        dataStructure: 'Left/Right Pointers + Last-Seen Map',
        isCorrect: true,
        feedback: 'Correct! Because validity is monotonic, Left never needs to move backward—jumping past duplicates keeps total steps O(N).',
      },
      {
        id: 'opt-stack',
        pattern: 'Monotonic Stack',
        dataStructure: 'Stack',
        isCorrect: false,
        feedback: 'Monotonic stacks solve next-greater/smaller ordering problems, not contiguous uniqueness.',
      },
      {
        id: 'opt-dp2d',
        pattern: '2D Dynamic Programming',
        dataStructure: 'N x N Table',
        isCorrect: false,
        feedback: 'An N x N table needs 2.5 x 10^9 memory cells for N = 5 x 10^4, causing Out of Memory.',
      },
      {
        id: 'opt-trie',
        pattern: 'Prefix Tree',
        dataStructure: 'Trie',
        isCorrect: false,
        feedback: 'Tries index dictionaries of multiple words rather than measuring unique ranges inside one string.',
      },
    ],
    loopInvariantPrompt: 'Lock your Loop Invariant before assembling code blocks:',
    loopInvariants: [
      {
        id: 'inv-ls-1',
        statement: 'At the end of every Right step, the window [left..right] contains zero duplicate characters and left never moves backward.',
        isCorrect: true,
        feedback: 'Locked! Math.max(left, lastIdx[ch] + 1) guarantees left only moves forward.',
      },
      {
        id: 'inv-ls-2',
        statement: 'Whenever a duplicate appears, reset left = right to clear the entire window.',
        isCorrect: false,
        feedback: 'Resetting left = right discards valid characters between the duplicate and right.',
      },
    ],
    feynmanPrompt: {
      templateBefore: 'Because substring validity is monotonic, we never restart from i+1—instead we ',
      templateAfter: ' whenever a duplicate enters the window.',
      choices: [
        {
          id: 'feyn-ls-1',
          phrase: 'jump the Left pointer directly past the previous occurrence using lastIdx',
          isCorrect: true,
          feedback: 'Sharp explanation! Both Left and Right move monotonically at most N steps.',
        },
        {
          id: 'feyn-ls-2',
          phrase: 'sort the characters inside [left..right] before expanding',
          isCorrect: false,
          feedback: 'Sorting breaks contiguous order and adds O(N log N) work.',
        },
      ],
      twistConstraint: 'Now allow at most K = 2 distinct characters instead of all unique characters.',
    },
    sandboxConfig: {
      type: 'sliding-window',
      instruction: 'Expand Right (R) to absorb characters. When a duplicate enters, advance Left (L) until the window is valid again.',
      hint: 'On "abcabcbb", hitting the second "a" at index 3 forces Left to jump from 0 to 1, keeping length = 3.',
      sampleString: 'abcabcbb',
    },
    functionSignature: {
      java: {
        header: 'public int lengthOfLongestSubstring(String s) {',
        footer: '  return best;\n}',
      },
      js: {
        header: 'function lengthOfLongestSubstring(s) {',
        footer: '  return best;\n}',
      },
      python: {
        header: 'def length_of_longest_substring(s: str) -> int:',
        footer: '    return best',
      },
    },
    blocks: [
      {
        id: 'ls-brute-init',
        label: 'Initialize best = 0',
        category: 'Variables & Pointers',
        targetSlot: 'init',
        mode: 'brute',
        summary: 'Track longest valid substring length found across all starts.',
        code: {
          java: ['  int best = 0;'],
          js: ['  let best = 0;'],
          python: ['    best = 0'],
        },
      },
      {
        id: 'ls-brute-loop',
        label: 'Restart Set & Scan j = i .. n-1',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'brute',
        summary: 'For every start i, build a fresh HashSet from scratch until collision.',
        code: {
          java: ['  for (int i = 0; i < s.length(); i++) {', '    Set<Character> seen = new HashSet<>();', '    for (int j = i; j < s.length(); j++) {'],
          js: ['  for (let i = 0; i < s.length; i++) {', '    const seen = new Set();', '    for (let j = i; j < s.length; j++) {'],
          python: ['    for i in range(len(s)):', '        seen = set()', '        for j in range(i, len(s)):'],
        },
      },
      {
        id: 'ls-brute-update',
        label: 'Break on Duplicate, Else Update best',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'brute',
        summary: 'If char already in Set, discard entire window and restart at i+1.',
        code: {
          java: ['      if (!seen.add(s.charAt(j))) break;', '      best = Math.max(best, j - i + 1);', '    }', '  }'],
          js: ['      if (seen.has(s[j])) break;', '      seen.add(s[j]);', '      best = Math.max(best, j - i + 1);', '    }', '  }'],
          python: ['            if s[j] in seen:', '                break', '            seen.add(s[j])', '            best = max(best, j - i + 1)'],
        },
      },
      {
        id: 'ls-opt-init',
        label: 'Init left = 0, best = 0, lastIndex Map',
        category: 'Data Structure Ops',
        targetSlot: 'init',
        mode: 'optimal',
        summary: 'Maintain a single active window [left..right] and each character’s latest index.',
        code: {
          java: ['  Map<Character, Integer> lastIdx = new HashMap<>();', '  int left = 0, best = 0;'],
          js: ['  const lastIdx = new Map();', '  let left = 0, best = 0;'],
          python: ['    last_idx = {}', '    left = best = 0'],
        },
      },
      {
        id: 'ls-opt-loop',
        label: 'Expand Right Pointer (right = 0 .. n-1)',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'optimal',
        summary: 'Advance right pointer once per character without ever resetting to left.',
        code: {
          java: ['  for (int right = 0; right < s.length(); right++) {', '    char ch = s.charAt(right);'],
          js: ['  for (let right = 0; right < s.length(); right++) {', '    const ch = s[right];'],
          python: ['    for right, ch in enumerate(s):'],
        },
      },
      {
        id: 'ls-opt-update',
        label: 'Jump Left Past Duplicate & Update best',
        category: 'Data Structure Ops',
        targetSlot: 'update',
        mode: 'optimal',
        summary: 'If ch appeared inside [left..right], jump left = lastIdx[ch] + 1; record right.',
        code: {
          java: ['    if (lastIdx.containsKey(ch)) {', '      left = Math.max(left, lastIdx.get(ch) + 1);', '    }', '    lastIdx.put(ch, right);', '    best = Math.max(best, right - left + 1);', '  }'],
          js: ['    if (lastIdx.has(ch)) {', '      left = Math.max(left, lastIdx.get(ch) + 1);', '    }', '    lastIdx.set(ch, right);', '    best = Math.max(best, right - left + 1);', '  }'],
          python: ['        if ch in last_idx and last_idx[ch] >= left:', '            left = last_idx[ch] + 1', '        last_idx[ch] = right', '        best = max(best, right - left + 1)'],
        },
      },
      {
        id: 'ls-dist-1',
        label: 'Reset left = right on Duplicate',
        category: 'Variables & Pointers',
        targetSlot: 'update',
        mode: 'distractor',
        summary: 'Jumps left all the way to right when a collision occurs.',
        distractorReason: 'Jumping left = right skips valid substrings like "bca" inside "abca"!',
        code: {
          java: ['    if (lastIdx.containsKey(ch)) left = right; // Drops valid prefix!'],
          js: ['    if (lastIdx.has(ch)) left = right; // Drops valid prefix!'],
          python: ['        if ch in last_idx: left = right  # Drops valid prefix!'],
        },
      },
      {
        id: 'ls-dist-2',
        label: 'Forget Math.max(left, ...) Guard',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'distractor',
        summary: 'Sets left = lastIdx.get(ch) + 1 without checking if lastIdx >= left.',
        distractorReason: 'A stale duplicate seen before the current window ("abba") would pull left backward!',
        code: {
          java: ['    left = lastIdx.get(ch) + 1; // Can move left backward on "abba"!'],
          js: ['    left = lastIdx.get(ch) + 1; // Can move left backward on "abba"!'],
          python: ['        left = last_idx[ch] + 1  # Can move left backward on "abba"!'],
        },
      },
    ],
    bottleneck: {
      question: 'Look at the Brute Force animation when a duplicate character hits. Why do operations spike to O(N²)?',
      options: [
        {
          id: 'bn-ls-1',
          text: 'It throws away the entire HashSet and re-scans characters already known to be unique between i+1 and j-1',
          isCorrect: true,
          explanation: 'Exactly! We already verified that [i+1 .. j-1] has no duplicates. Only sliding Left past the colliding character keeps all valid work.',
        },
        {
          id: 'bn-ls-2',
          text: 'HashSet lookups take O(N) time per character',
          isCorrect: false,
          explanation: 'HashSet lookup is O(1) expected time. The wasted O(N) factor comes from restarting the inner loop j = i.',
        },
        {
          id: 'bn-ls-3',
          text: 'String indexing s[j] copies the whole string',
          isCorrect: false,
          explanation: 'Character indexing is O(1). Re-visiting every valid substring prefix from scratch causes the quadratic blowup.',
        },
      ],
    },
    raceDataset: {
      label: '20-char stream · "abcdaefgbhijcklmnopq"',
      values: SUBSTRING_RACE_CHARS,
      bruteTrace: generateSubstringBruteTrace(SUBSTRING_RACE_CHARS),
      optimalTrace: generateSubstringOptimalTrace(SUBSTRING_RACE_CHARS),
    },
    interviewContext: {
      companies: ['Amazon', 'Meta', 'Microsoft', 'Apple', 'ByteDance'],
      frequencyNote: 'Top-5 most frequently asked Sliding Window question; used to test off-by-one boundaries and stale-map edge cases ("abba").',
      followUpTwists: [
        {
          twist: 'Allow at most K distinct characters instead of all unique characters.',
          adaptation: 'Replace lastIdx map with a frequency Map and shrink left while map.size > K.',
        },
        {
          twist: 'Allow replacing at most K characters to form the longest repeating-letter substring.',
          adaptation: 'Track maxFreq inside [left..right]; shrink left whenever (windowLen - maxFreq) > K.',
        },
      ],
      relatedProblems: [
        { title: 'Longest Repeating Character Replacement', difficulty: 'Medium', sharedTrigger: 'Contiguous longest + condition K -> Sliding Window' },
        { title: 'Minimum Window Substring', difficulty: 'Hard', sharedTrigger: 'Contiguous shortest containing target frequency -> Sliding Window' },
        { title: 'Fruit Into Baskets', difficulty: 'Medium', sharedTrigger: 'Longest subarray with <= 2 distinct types' },
      ],
    },
  },
  {
    id: 'daily-temperatures',
    number: 739,
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    tier: 3,
    rankRequirement: 'Practitioner',
    patternId: 'stacks-monotonic',
    patternName: 'Stacks & Monotonic Stack',
    topicQuizId: 'monotonic-stack',
    estimatedMinutes: 15,
    inputSizeExponent: 5,
    targetBigO: 'O(N)',
    bruteBigO: 'O(N²)',
    spaceOptimal: 'O(N)',
    spaceBrute: 'O(1)',
    summary: 'For each day, return how many days you must wait until a strictly warmer temperature occurs.',
    statementSegments: [
      { text: 'Given an array of daily temperatures of length ' },
      { text: 'up to 10^5', signalId: 'dt-n' },
      { text: ', return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a ' },
      { text: 'next warmer temperature', signalId: 'dt-next-greater' },
      { text: '. If there is no future day for which this is possible, keep answer[i] == 0.' },
    ],
    signals: [
      {
        id: 'dt-n',
        phrase: 'up to 10^5',
        impliedConstraint: 'N = 100,000 rules out scanning forward for each day (10^10 operations on decreasing temperatures).',
        eliminatedPatterns: ['Nested Forward Scan O(N²)'],
        triggeredPatterns: ['Amortized O(N) Stack Sweep'],
        complexityHint: 'Each day can only be resolved once when a warmer day finally arrives.',
      },
      {
        id: 'dt-next-greater',
        phrase: 'next warmer temperature',
        impliedConstraint: 'Classic "Next Greater Element to the Right" trigger.',
        eliminatedPatterns: ['Binary Search (temperatures unsorted)', 'Greedy'],
        triggeredPatterns: ['Monotonic Decreasing Stack'],
        complexityHint: 'Keep unresolved colder days on a stack in decreasing order so the first warmer day pops them in bulk.',
      },
    ],
    quizPrompt: 'Which Pattern + Structure resolves all waiting colder days in O(N) amortized time?',
    quizOptions: [
      {
        id: 'opt-dt-ms',
        pattern: 'Monotonic Decreasing Stack',
        dataStructure: 'Stack of Unresolved Indices',
        isCorrect: true,
        feedback: 'Exact match! Every index enters and leaves the stack at most once, guaranteeing O(N) time even on strictly decreasing days.',
      },
      {
        id: 'opt-dt-hm',
        pattern: 'HashMap Complement',
        dataStructure: 'HashMap',
        isCorrect: false,
        feedback: 'We are looking for the nearest index with a strictly GREATER value, not an exact arithmetic match.',
      },
      {
        id: 'opt-dt-sw',
        pattern: 'Fixed Sliding Window',
        dataStructure: 'Left/Right Pointers',
        isCorrect: false,
        feedback: 'Wait duration varies wildly from 1 day to N-1 days, so no fixed or monotonic window length applies.',
      },
      {
        id: 'opt-dt-bs',
        pattern: 'Binary Search',
        dataStructure: 'Sorted Array',
        isCorrect: false,
        feedback: 'Sorting temperatures destroys chronological day order.',
      },
    ],
    loopInvariantPrompt: 'Lock your Loop Invariant before assembling code blocks:',
    loopInvariants: [
      {
        id: 'inv-dt-1',
        statement: 'Indices inside the stack always represent temperatures in non-increasing order, waiting for their first warmer day.',
        isCorrect: true,
        feedback: 'Locked! As soon as temps[i] > temps[stack.top], the top index has found its exact next warmer day.',
      },
      {
        id: 'inv-dt-2',
        statement: 'The stack only holds the single coldest temperature seen so far.',
        isCorrect: false,
        feedback: 'Multiple unresolved days (e.g., [75, 71, 69]) can all be waiting simultaneously for 76.',
      },
    ],
    feynmanPrompt: {
      templateBefore: 'Instead of scanning forward from every day, we store unresolved days in a monotonic stack and ',
      templateAfter: ' in O(1) amortized work per day.',
      choices: [
        {
          id: 'feyn-dt-1',
          phrase: 'pop all colder waiting days as soon as a warmer day arrives',
          isCorrect: true,
          feedback: 'Crisp mental model! Each index is pushed once and popped at most once.',
        },
        {
          id: 'feyn-dt-2',
          phrase: 're-sort the stack whenever a warmer temperature appears',
          isCorrect: false,
          feedback: 'Popping smaller elements automatically keeps the stack monotonic with zero sorting.',
        },
      ],
      twistConstraint: 'Now suppose days wrap around in a circular 7-day forecast (Next Greater Element II).',
    },
    sandboxConfig: {
      type: 'monotonic-stack',
      instruction: 'Step through daily temperatures [73, 74, 75, 71, 69, 72, 76]. Watch unresolved colder days stack up until a warmer day pops them!',
      hint: 'Days 3 (71°) and 4 (69°) both wait on the stack until Day 5 (72°) arrives and resolves them together.',
      sampleArray: [73, 74, 75, 71, 69, 72, 76],
    },
    functionSignature: {
      java: {
        header: 'public int[] dailyTemperatures(int[] temps) {',
        footer: '  return ans;\n}',
      },
      js: {
        header: 'function dailyTemperatures(temps) {',
        footer: '  return ans;\n}',
      },
      python: {
        header: 'def daily_temperatures(temps: list[int]) -> list[int]:',
        footer: '    return ans',
      },
    },
    blocks: [
      {
        id: 'dt-brute-init',
        label: 'Init ans[] = 0',
        category: 'Variables & Pointers',
        targetSlot: 'init',
        mode: 'brute',
        summary: 'Allocate zero-filled answer array of length n.',
        code: {
          java: ['  int n = temps.length;', '  int[] ans = new int[n];'],
          js: ['  const n = temps.length;', '  const ans = new Array(n).fill(0);'],
          python: ['    n = len(temps)', '    ans = [0] * n'],
        },
      },
      {
        id: 'dt-brute-loop',
        label: 'Nested Scan (i = 0..n-1, j = i+1..n-1)',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'brute',
        summary: 'For each day i, scan future days j until a warmer temperature is found.',
        code: {
          java: ['  for (int i = 0; i < n; i++) {', '    for (int j = i + 1; j < n; j++) {'],
          js: ['  for (let i = 0; i < n; i++) {', '    for (let j = i + 1; j < n; j++) {'],
          python: ['    for i in range(n):', '        for j in range(i + 1, n):'],
        },
      },
      {
        id: 'dt-brute-update',
        label: 'If temps[j] > temps[i], Set ans[i] = j - i & Break',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'brute',
        summary: 'Record waiting days and stop scanning.',
        code: {
          java: ['      if (temps[j] > temps[i]) {', '        ans[i] = j - i;', '        break;', '      }', '    }', '  }'],
          js: ['      if (temps[j] > temps[i]) {', '        ans[i] = j - i;', '        break;', '      }', '    }', '  }'],
          python: ['            if temps[j] > temps[i]:', '                ans[i] = j - i', '                break'],
        },
      },
      {
        id: 'dt-opt-init',
        label: 'Init ans[] = 0 and Empty Index Stack',
        category: 'Data Structure Ops',
        targetSlot: 'init',
        mode: 'optimal',
        summary: 'Stack stores indices of days still waiting for a warmer temperature.',
        code: {
          java: ['  int[] ans = new int[temps.length];', '  Deque<Integer> stack = new ArrayDeque<>();'],
          js: ['  const ans = new Array(temps.length).fill(0);', '  const stack = [];'],
          python: ['    ans = [0] * len(temps)', '    stack = []'],
        },
      },
      {
        id: 'dt-opt-loop',
        label: 'Single Pass i = 0 .. n-1',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'optimal',
        summary: 'Process each day chronologically once.',
        code: {
          java: ['  for (int i = 0; i < temps.length; i++) {'],
          js: ['  for (let i = 0; i < temps.length; i++) {'],
          python: ['    for i, t in enumerate(temps):'],
        },
      },
      {
        id: 'dt-opt-update',
        label: 'While temps[i] > temps[stack.top], Pop & Push i',
        category: 'Data Structure Ops',
        targetSlot: 'update',
        mode: 'optimal',
        summary: 'Resolve all colder waiting days on stack, then push today’s index i.',
        code: {
          java: ['    while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {', '      int prev = stack.pop();', '      ans[prev] = i - prev;', '    }', '    stack.push(i);', '  }'],
          js: ['    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {', '      const prev = stack.pop();', '      ans[prev] = i - prev;', '    }', '    stack.push(i);', '  }'],
          python: ['        while stack and t > temps[stack[-1]]:', '            prev = stack.pop()', '            ans[prev] = i - prev', '        stack.append(i)'],
        },
      },
      {
        id: 'dt-dist-1',
        label: 'Push Temperatures Instead of Indices',
        category: 'Data Structure Ops',
        targetSlot: 'update',
        mode: 'distractor',
        summary: 'Stores raw temperature values on the stack.',
        distractorReason: 'Without the index i, you cannot compute (i - prevIndex) to know how many days elapsed!',
        code: {
          java: ['    stack.push(temps[i]); // Missing day index for (i - prev)!'],
          js: ['    stack.push(temps[i]); // Missing day index for (i - prev)!'],
          python: ['        stack.append(t)  # Missing day index for (i - prev)!'],
        },
      },
    ],
    bottleneck: {
      question: 'Look at days 0–13 in the Brute Force trace (decreasing temperatures). Why do operations explode?',
      options: [
        {
          id: 'bn-dt-1',
          text: 'Every day re-scans the exact same cold streak [75, 73, 72, 70, ...] over and over',
          isCorrect: true,
          explanation: 'Exactly! Remembering unresolved indices on a monotonic decreasing stack lets Day 14 resolve multiple days in one sweep.',
        },
        {
          id: 'bn-dt-2',
          text: 'Allocating the ans array takes O(N²)',
          isCorrect: false,
          explanation: 'Allocating an array of size N is O(N) time and space.',
        },
      ],
    },
    raceDataset: {
      label: '20-day cooling-then-warming forecast',
      values: DAILY_TEMPS_RACE,
      bruteTrace: generateDailyTempsBruteTrace(DAILY_TEMPS_RACE),
      optimalTrace: generateDailyTempsOptimalTrace(DAILY_TEMPS_RACE),
    },
    interviewContext: {
      companies: ['Meta', 'Amazon', 'Google', 'TikTok'],
      frequencyNote: 'Gateway problem for Monotonic Stacks; mastering this unlocks Histogram Area and Stock Span.',
      followUpTwists: [
        {
          twist: 'What if temperatures can wrap around circularly?',
          adaptation: 'Iterate i from 0 to 2*n - 1 using (i % n) and only push indices during the first pass.',
        },
      ],
      relatedProblems: [
        { title: 'Next Greater Element I', difficulty: 'Easy', sharedTrigger: 'First larger value to the right -> Monotonic Stack' },
        { title: 'Online Stock Span', difficulty: 'Medium', sharedTrigger: 'Consecutive smaller/equal history -> Monotonic Stack' },
        { title: 'Largest Rectangle in Histogram', difficulty: 'Hard', sharedTrigger: 'Next smaller left/right boundary -> Monotonic Stack' },
      ],
    },
  },
  {
    id: 'trapping-rain-water',
    number: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tier: 1,
    rankRequirement: 'Strategist',
    patternId: 'two-pointers',
    patternName: 'Two Pointers',
    topicQuizId: 'binary-search-answer',
    estimatedMinutes: 20,
    inputSizeExponent: 4,
    targetBigO: 'O(N)',
    bruteBigO: 'O(N²)',
    spaceOptimal: 'O(1)',
    spaceBrute: 'O(1)',
    summary: 'Compute total rainwater trapped between elevation bars after raining, aiming for O(N) time and O(1) space.',
    statementSegments: [
      { text: 'Given n non-negative integers representing an ' },
      { text: 'elevation map', signalId: 'bar-water-formula' },
      { text: ' where n is ' },
      { text: 'up to 2 x 10^4', signalId: 'n-2e4' },
      { text: ', compute how much water it can trap after raining, ideally in ' },
      { text: 'O(1) extra space', signalId: 'o1-space' },
      { text: '.' },
    ],
    signals: [
      {
        id: 'bar-water-formula',
        phrase: 'elevation map',
        impliedConstraint: 'Water above bar i equals min(maxLeft[i], maxRight[i]) - height[i]. Only the smaller boundary limits the water level!',
        eliminatedPatterns: ['Sliding Window (non-local boundary walls)'],
        triggeredPatterns: ['Converging Two Pointers / Prefix-Suffix Max'],
        complexityHint: 'Because water depends only on the minimum of leftMax and rightMax, we only need to know which wall is shorter.',
      },
      {
        id: 'n-2e4',
        phrase: 'up to 2 x 10^4',
        impliedConstraint: 'Scanning leftMax and rightMax from scratch at each bar takes 4 x 10^8 ops (TLE).',
        eliminatedPatterns: ['Per-Bar Left/Right Scan O(N²)'],
        triggeredPatterns: ['Single-Pass Linear Scan O(N)'],
        complexityHint: 'Must compute boundary maxima in a single pass.',
      },
      {
        id: 'o1-space',
        phrase: 'O(1) extra space',
        impliedConstraint: 'Rules out storing full prefixMax[] and suffixMax[] arrays of length N.',
        eliminatedPatterns: ['Prefix/Suffix DP Arrays O(N) space'],
        triggeredPatterns: ['Converging Two Pointers (L, R, leftMax, rightMax)'],
        complexityHint: 'If height[L] < height[R], leftMax is guaranteed to be the limiting bottleneck for bar L.',
      },
    ],
    quizPrompt: 'Which Pattern solves Trapping Rain Water in O(N) time AND O(1) space?',
    quizOptions: [
      {
        id: 'opt-rw-tp',
        pattern: 'Converging Two Pointers',
        dataStructure: 'L/R Pointers + Scalar leftMax / rightMax',
        isCorrect: true,
        feedback: 'Spot on! Advancing whichever side has the smaller height guarantees its local max is the true min(leftMax, rightMax).',
      },
      {
        id: 'opt-rw-pq',
        pattern: 'Heap Priority Queue',
        dataStructure: 'Min-Heap',
        isCorrect: false,
        feedback: 'A Min-Heap works for 2D Trapping Rain Water II (O(NM log NM)), but for 1D bars it adds unnecessary O(N log N) cost.',
      },
      {
        id: 'opt-rw-bs',
        pattern: 'Binary Search',
        dataStructure: 'Midpoint Partition',
        isCorrect: false,
        feedback: 'Elevation heights are not sorted, so binary search cannot discard half of the array.',
      },
      {
        id: 'opt-rw-bfs',
        pattern: 'Graph BFS',
        dataStructure: 'Adjacency Queue',
        isCorrect: false,
        feedback: '1D bars do not require graph traversal; water level at index i is purely a boundary-max formula.',
      },
    ],
    loopInvariantPrompt: 'Lock your Loop Invariant before assembling code blocks:',
    loopInvariants: [
      {
        id: 'inv-rw-1',
        statement: 'Whenever height[L] < height[R], leftMax is guaranteed <= the true rightMax of bar L, so L traps leftMax - height[L].',
        isCorrect: true,
        feedback: 'Locked! We never need to scan all bars to the right of L because height[R] already proves a wall >= height[L] exists.',
      },
      {
        id: 'inv-rw-2',
        statement: 'Always advance whichever pointer has the TALLER bar height.',
        isCorrect: false,
        feedback: 'Advancing the taller bar leaves the shorter wall unprotected against leakage.',
      },
    ],
    feynmanPrompt: {
      templateBefore: 'Trapped water at any bar is capped by the shorter of its left and right walls, so advancing ',
      templateAfter: ' lets us calculate water in O(N) time and O(1) space.',
      choices: [
        {
          id: 'feyn-rw-1',
          phrase: 'whichever end pointer currently has the shorter height',
          isCorrect: true,
          feedback: 'Mastery confirmed! You replaced two O(N) DP arrays with two scalar boundary trackers.',
        },
        {
          id: 'feyn-rw-2',
          phrase: 'both pointers simultaneously by 2 indices',
          isCorrect: false,
          feedback: 'Moving both blindly skips bars in the middle.',
        },
      ],
      twistConstraint: 'Now solve for a 2D height matrix (Trapping Rain Water II) where water can spill in 4 directions.',
    },
    sandboxConfig: {
      type: 'rain-water',
      instruction: 'Click the Left (L) or Right (R) pointer button to step inward. Always advance the shorter wall to lock in trapped water!',
      hint: 'Compare height[L] vs height[R]: the shorter side knows its exact limiting wall without ever scanning the opposite side.',
      sampleArray: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
    },
    functionSignature: {
      java: {
        header: 'public int trap(int[] height) {',
        footer: '  return water;\n}',
      },
      js: {
        header: 'function trap(height) {',
        footer: '  return water;\n}',
      },
      python: {
        header: 'def trap(height: list[int]) -> int:',
        footer: '    return water',
      },
    },
    blocks: [
      {
        id: 'rw-brute-init',
        label: 'Init water = 0',
        category: 'Variables & Pointers',
        targetSlot: 'init',
        mode: 'brute',
        summary: 'Accumulate trapped water column by column.',
        code: {
          java: ['  int water = 0, n = height.length;'],
          js: ['  let water = 0, n = height.length;'],
          python: ['    water, n = 0, len(height)'],
        },
      },
      {
        id: 'rw-brute-loop',
        label: 'For Each Bar i, Scan 0..i and i..n-1',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'brute',
        summary: 'Recompute leftMax and rightMax from scratch at every index i.',
        code: {
          java: ['  for (int i = 0; i < n; i++) {', '    int lMax = 0, rMax = 0;', '    for (int l = 0; l <= i; l++) lMax = Math.max(lMax, height[l]);', '    for (int r = i; r < n; r++) rMax = Math.max(rMax, height[r]);'],
          js: ['  for (let i = 0; i < n; i++) {', '    let lMax = 0, rMax = 0;', '    for (let l = 0; l <= i; l++) lMax = Math.max(lMax, height[l]);', '    for (let r = i; r < n; r++) rMax = Math.max(rMax, height[r]);'],
          python: ['    for i in range(n):', '        l_max = max(height[:i + 1])', '        r_max = max(height[i:])'],
        },
      },
      {
        id: 'rw-brute-update',
        label: 'Add min(lMax, rMax) - height[i]',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'brute',
        summary: 'Compute water trapped directly above bar i.',
        code: {
          java: ['    water += Math.min(lMax, rMax) - height[i];', '  }'],
          js: ['    water += Math.min(lMax, rMax) - height[i];', '  }'],
          python: ['        water += min(l_max, r_max) - height[i]'],
        },
      },
      {
        id: 'rw-opt-init',
        label: 'Init L = 0, R = n-1, leftMax = 0, rightMax = 0',
        category: 'Variables & Pointers',
        targetSlot: 'init',
        mode: 'optimal',
        summary: 'Four scalar variables give O(1) space.',
        code: {
          java: ['  int l = 0, r = height.length - 1;', '  int leftMax = 0, rightMax = 0, water = 0;'],
          js: ['  let l = 0, r = height.length - 1;', '  let leftMax = 0, rightMax = 0, water = 0;'],
          python: ['    l, r = 0, len(height) - 1', '    left_max = right_max = water = 0'],
        },
      },
      {
        id: 'rw-opt-loop',
        label: 'While L < R (Converge Pointers)',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'optimal',
        summary: 'Each iteration settles either L or R permanently in 1 step.',
        code: {
          java: ['  while (l < r) {'],
          js: ['  while (l < r) {'],
          python: ['    while l < r:'],
        },
      },
      {
        id: 'rw-opt-update',
        label: 'Advance Shorter Wall & Trap (max - height)',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'optimal',
        summary: 'If height[l] < height[r], leftMax limits bar l; else rightMax limits bar r.',
        code: {
          java: ['    if (height[l] < height[r]) {', '      leftMax = Math.max(leftMax, height[l]);', '      water += leftMax - height[l++];', '    } else {', '      rightMax = Math.max(rightMax, height[r]);', '      water += rightMax - height[r--];', '    }', '  }'],
          js: ['    if (height[l] < height[r]) {', '      leftMax = Math.max(leftMax, height[l]);', '      water += leftMax - height[l++];', '    } else {', '      rightMax = Math.max(rightMax, height[r]);', '      water += rightMax - height[r--];', '    }', '  }'],
          python: ['        if height[l] < height[r]:', '            left_max = max(left_max, height[l])', '            water += left_max - height[l]', '            l += 1', '        else:', '            right_max = max(right_max, height[r])', '            water += right_max - height[r]', '            r -= 1'],
        },
      },
      {
        id: 'rw-dist-1',
        label: 'Always Advance Taller Wall Instead',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'distractor',
        summary: 'Moves the taller wall inward first.',
        distractorReason: 'Advancing the taller wall leaves the shorter side unchecked, meaning a lower wall on the opposite side could let water spill out!',
        code: {
          java: ['    if (height[l] > height[r]) l++; // Wrong! Taller wall is not the bottleneck.'],
          js: ['    if (height[l] > height[r]) l++; // Wrong! Taller wall is not the bottleneck.'],
          python: ['        if height[l] > height[r]: l += 1  # Wrong! Taller wall is not the bottleneck.'],
        },
      },
      {
        id: 'rw-dist-2',
        label: 'Allocate O(N) Prefix/Suffix Arrays',
        category: 'Data Structure Ops',
        targetSlot: 'init',
        mode: 'distractor',
        summary: 'Creates two extra arrays of length N.',
        distractorReason: 'Prefix/suffix arrays run in O(N) time, but violate the O(1) extra space target.',
        code: {
          java: ['  int[] prefix = new int[n], suffix = new int[n]; // Uses O(N) space'],
          js: ['  const prefix = new Array(n), suffix = new Array(n); // Uses O(N) space'],
          python: ['    prefix, suffix = [0] * n, [0] * n  # Uses O(N) space'],
        },
      },
    ],
    bottleneck: {
      question: 'In the Brute Force scan, every bar re-scans the entire array in Rose Red. Why is that redundant?',
      options: [
        {
          id: 'bn-rw-1',
          text: 'Prefix leftMax and suffix rightMax change monotonically, and whichever side is shorter already locks the minimum wall height',
          isCorrect: true,
          explanation: 'Exactly! Moving inward from both ends with scalar leftMax and rightMax eliminates all repeated inner scans AND avoids O(N) array storage.',
        },
        {
          id: 'bn-rw-2',
          text: 'Bars with height 0 never trap water',
          isCorrect: false,
          explanation: 'Height 0 bars actually trap the most water when flanked by taller walls!',
        },
        {
          id: 'bn-rw-3',
          text: 'Math.min takes O(N) comparisons per bar',
          isCorrect: false,
          explanation: 'Math.min on two numbers is O(1). The O(N²) cost comes from the inner l and r loops.',
        },
      ],
    },
    raceDataset: {
      label: '20-bar elevation skyline',
      values: RAIN_RACE_HEIGHTS,
      bruteTrace: generateRainWaterBruteTrace(RAIN_RACE_HEIGHTS),
      optimalTrace: generateRainWaterOptimalTrace(RAIN_RACE_HEIGHTS),
    },
    interviewContext: {
      companies: ['Google', 'Goldman Sachs', 'Meta', 'Amazon', 'Uber'],
      frequencyNote: 'Signature Hard problem testing whether a candidate can compress O(N) DP arrays down to O(1) Two Pointers.',
      followUpTwists: [
        {
          twist: 'What if the terrain is a 2D elevation matrix (Trapping Rain Water II)?',
          adaptation: 'Push all outer boundary cells into a Min-Heap and run inward Dijkstra-style BFS so water leaks from the lowest rim.',
        },
        {
          twist: 'Find the single pair of walls holding the most water WITHOUT bars in between (Container With Most Water).',
          adaptation: 'Same converging Two Pointers, but area = (R - L) * min(height[L], height[R]).',
        },
      ],
      relatedProblems: [
        { title: 'Container With Most Water', difficulty: 'Medium', sharedTrigger: 'Converging Two Pointers advancing shorter wall' },
        { title: 'Largest Rectangle in Histogram', difficulty: 'Hard', sharedTrigger: 'Left/Right height boundary limits -> Monotonic Stack' },
        { title: 'Trapping Rain Water II', difficulty: 'Hardest', sharedTrigger: 'Boundary minimum rim -> Min-Heap BFS' },
      ],
    },
  },
  {
    id: 'coin-change',
    number: 322,
    title: 'Coin Change',
    difficulty: 'Hard',
    tier: 5,
    rankRequirement: 'Pro',
    patternId: 'dynamic-programming',
    patternName: '1D & 2D Dynamic Programming',
    topicQuizId: 'dp-1d',
    estimatedMinutes: 22,
    inputSizeExponent: 4,
    targetBigO: 'O(A·C)',
    bruteBigO: 'O(C^A)',
    spaceOptimal: 'O(A)',
    spaceBrute: 'O(A)',
    hasDpLadder: true,
    summary: 'Find the fewest number of coins needed to make up a target amount, given unlimited coin reuse.',
    statementSegments: [
      { text: 'Given integer coin denominations and an integer amount ' },
      { text: 'up to 10^4', signalId: 'cc-amount' },
      { text: ', return the ' },
      { text: 'fewest number of coins', signalId: 'cc-min-opt' },
      { text: ' that you need to make up that amount, using an ' },
      { text: 'infinite supply of each coin', signalId: 'cc-unbounded' },
      { text: '.' },
    ],
    signals: [
      {
        id: 'cc-amount',
        phrase: 'up to 10^4',
        impliedConstraint: 'Amount A = 10,000 rules out uncached exponential recursion O(C^A).',
        eliminatedPatterns: ['Pure Exponential Recursion'],
        triggeredPatterns: ['1D DP Table dp[0..amount]'],
        complexityHint: 'With <= 12 coins and A <= 10^4, O(A * C) = 1.2 x 10^5 ops runs effortlessly.',
      },
      {
        id: 'cc-min-opt',
        phrase: 'fewest number of coins',
        impliedConstraint: 'Minimization across choices where Greedy fails (e.g. coins=[1,3,4], amount=6 -> 3+3=2, not 4+1+1=3).',
        eliminatedPatterns: ['Greedy Largest-Coin First'],
        triggeredPatterns: ['Bottom-Up State Transition dp[a] = min(dp[a], 1 + dp[a-c])'],
        complexityHint: 'Optimal substructure: optimal answer for amount a builds directly on optimal answer for (a - coin).',
      },
      {
        id: 'cc-unbounded',
        phrase: 'infinite supply of each coin',
        impliedConstraint: 'Unbounded Knapsack state: only remaining amount a matters, not which previous coin set was picked.',
        eliminatedPatterns: ['Subset Bitmask DP'],
        triggeredPatterns: ['1D Unbounded Knapsack DP'],
        complexityHint: 'Single 1D array dp[0..amount] suffices instead of a 2D table.',
      },
    ],
    quizPrompt: 'Which Pattern solves Coin Change without falling into the Greedy trap?',
    quizOptions: [
      {
        id: 'opt-cc-dp',
        pattern: '1D Dynamic Programming (Bottom-Up)',
        dataStructure: '1D Array dp[0..amount]',
        isCorrect: true,
        feedback: 'Exact match! Caching every sub-amount 0..amount collapses exponential branching into O(Amount * Coins).',
      },
      {
        id: 'opt-cc-gr',
        pattern: 'Greedy Coin Selection',
        dataStructure: 'Sorted Coins Array',
        isCorrect: false,
        feedback: 'Greedy fails on coins = [1, 3, 4], amount = 6 (returns 3 coins instead of 2).',
      },
      {
        id: 'opt-cc-tp',
        pattern: 'Two Pointers',
        dataStructure: 'L/R Pointers',
        isCorrect: false,
        feedback: 'Two pointers only consider pairs of coins, whereas any coin can be reused unlimited times.',
      },
      {
        id: 'opt-cc-bs',
        pattern: 'Binary Search',
        dataStructure: 'Coin Bounds',
        isCorrect: false,
        feedback: 'Minimum coin count is not monotonic across coin denominations.',
      },
    ],
    loopInvariantPrompt: 'Lock your Loop Invariant before assembling code blocks:',
    loopInvariants: [
      {
        id: 'inv-cc-1',
        statement: 'When computing dp[a], every smaller subproblem dp[0..a-1] already holds its guaranteed minimum coin count.',
        isCorrect: true,
        feedback: 'Locked! Building bottom-up from 1 to amount guarantees all dependencies (a - coin) are finalized.',
      },
      {
        id: 'inv-cc-2',
        statement: 'Always pick the single largest coin <= remaining amount.',
        isCorrect: false,
        feedback: 'That is the Greedy trap! It fails on [1, 3, 4] for target 6.',
      },
    ],
    feynmanPrompt: {
      templateBefore: 'Pure recursion recomputes the same remaining amounts exponentially; 1D DP avoids that waste by ',
      templateAfter: ' so each sub-amount is solved once.',
      choices: [
        {
          id: 'feyn-cc-1',
          phrase: 'storing each sub-amount’s minimum in dp[a] and building bottom-up',
          isCorrect: true,
          feedback: 'Pro rank mastery! You collapsed an exponential tree into a linear DP table.',
        },
        {
          id: 'feyn-cc-2',
          phrase: 'always subtracting the largest coin denomination first',
          isCorrect: false,
          feedback: 'Greedy fails on non-canonical denominations like [1, 3, 4].',
        },
      ],
      twistConstraint: 'Now count the TOTAL NUMBER OF COMBINATIONS that sum to amount (Coin Change II) without double-counting permutations.',
    },
    sandboxConfig: {
      type: 'coin-change',
      instruction: 'Build dp[0..6] for coins [1, 3, 4]. Click each sub-amount cell in order to discover why amount 6 needs 2 coins (3 + 3), NOT greedy 4 + 1 + 1!',
      hint: 'Check dp[6 - 4] + 1 = dp[2] + 1 = 3 vs dp[6 - 3] + 1 = dp[3] + 1 = 2!',
      sampleArray: [1, 3, 4],
      targetSum: 6,
    },
    functionSignature: {
      java: {
        header: 'public int coinChange(int[] coins, int amount) {',
        footer: '  return dp[amount] > amount ? -1 : dp[amount];\n}',
      },
      js: {
        header: 'function coinChange(coins, amount) {',
        footer: '  return dp[amount] > amount ? -1 : dp[amount];\n}',
      },
      python: {
        header: 'def coin_change(coins: list[int], amount: int) -> int:',
        footer: '    return dp[amount] if dp[amount] <= amount else -1',
      },
    },
    blocks: [
      {
        id: 'cc-brute-init',
        label: 'Define Recursive Helper solve(rem)',
        category: 'Variables & Pointers',
        targetSlot: 'init',
        mode: 'brute',
        summary: 'No memoization table — recompute every sub-amount on every branch.',
        code: {
          java: ['  // Uncached recursion helper', '  int best = Integer.MAX_VALUE;'],
          js: ['  function solve(rem) {', '    if (rem === 0) return 0;'],
          python: ['    def solve(rem):', '        if rem == 0: return 0'],
        },
      },
      {
        id: 'cc-brute-loop',
        label: 'Branch Across Every Coin Without Cache',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'brute',
        summary: 'Explores O(C^A) overlapping recursive calls.',
        code: {
          java: ['  for (int c : coins) {', '    int sub = coinChange(coins, amount - c);'],
          js: ['    let best = Infinity;', '    for (const c of coins) {', '      if (rem - c >= 0) best = Math.min(best, 1 + solve(rem - c));'],
          python: ['        best = float("inf")', '        for c in coins:', '            if rem - c >= 0: best = min(best, 1 + solve(rem - c))'],
        },
      },
      {
        id: 'cc-brute-update',
        label: 'Return Minimum Recursive Branch',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'brute',
        summary: 'Returns result without caching for future branches.',
        code: {
          java: ['    if (sub >= 0) best = Math.min(best, 1 + sub);', '  }'],
          js: ['    }', '    return best;', '  }'],
          python: ['        return best'],
        },
      },
      {
        id: 'cc-opt-init',
        label: 'Init dp[0..amount] = Infinity, dp[0] = 0',
        category: 'Data Structure Ops',
        targetSlot: 'init',
        mode: 'optimal',
        summary: 'Allocate 1D DP array of size amount + 1 with base case dp[0] = 0.',
        code: {
          java: ['  int[] dp = new int[amount + 1];', '  Arrays.fill(dp, amount + 1);', '  dp[0] = 0;'],
          js: ['  const dp = new Array(amount + 1).fill(amount + 1);', '  dp[0] = 0;'],
          python: ['    dp = [amount + 1] * (amount + 1)', '    dp[0] = 0'],
        },
      },
      {
        id: 'cc-opt-loop',
        label: 'Iterate Amount a = 1 .. amount & Coins c',
        category: 'Loops',
        targetSlot: 'loop',
        mode: 'optimal',
        summary: 'Solve every sub-amount sequentially from 1 up to target amount.',
        code: {
          java: ['  for (int a = 1; a <= amount; a++) {', '    for (int c : coins) {'],
          js: ['  for (let a = 1; a <= amount; a++) {', '    for (const c of coins) {'],
          python: ['    for a in range(1, amount + 1):', '        for c in coins:'],
        },
      },
      {
        id: 'cc-opt-update',
        label: 'Transition dp[a] = min(dp[a], 1 + dp[a - c])',
        category: 'Data Structure Ops',
        targetSlot: 'update',
        mode: 'optimal',
        summary: 'Reuse already-solved dp[a - c] in O(1) time.',
        code: {
          java: ['      if (a - c >= 0) {', '        dp[a] = Math.min(dp[a], 1 + dp[a - c]);', '      }', '    }', '  }'],
          js: ['      if (a - c >= 0) {', '        dp[a] = Math.min(dp[a], 1 + dp[a - c]);', '      }', '    }', '  }'],
          python: ['            if a - c >= 0:', '                dp[a] = min(dp[a], 1 + dp[a - c])'],
        },
      },
      {
        id: 'cc-dist-1',
        label: 'Greedy Sort & Take Largest Coin First',
        category: 'Conditionals',
        targetSlot: 'update',
        mode: 'distractor',
        summary: 'Subtracts the biggest coin <= remaining amount.',
        distractorReason: 'Greedy fails on coins = [1, 3, 4], amount = 6 (returns 3 coins instead of optimal 2).',
        code: {
          java: ['    while (amount >= c) { amount -= c; count++; } // Fails on [1,3,4], target=6!'],
          js: ['    while (amount >= c) { amount -= c; count++; } // Fails on [1,3,4], target=6!'],
          python: ['        while amount >= c: amount -= c; count += 1  # Fails on [1,3,4], target=6!'],
        },
      },
    ],
    bottleneck: {
      question: 'Look at the Brute Force recursion operations surging in Rose Red. Why does pure recursion explode?',
      options: [
        {
          id: 'bn-cc-1',
          text: 'The exact same remaining amounts (like rem = 3 or rem = 2) are recomputed exponentially across different coin paths',
          isCorrect: true,
          explanation: 'Spot on! Caching dp[a] ensures each sub-amount is computed once, reducing O(C^A) to O(A * C).',
        },
        {
          id: 'bn-cc-2',
          text: 'Checking if rem == 0 is an O(N) operation',
          isCorrect: false,
          explanation: 'The base case check is O(1); the exponential blowup is purely from overlapping subproblems.',
        },
      ],
    },
    raceDataset: {
      label: 'Amounts 0..19 with coins [1, 3, 4]',
      values: COIN_RACE_AMOUNTS,
      target: 19,
      bruteTrace: generateCoinChangeBruteTrace(COIN_RACE_AMOUNTS),
      optimalTrace: generateCoinChangeOptimalTrace(COIN_RACE_AMOUNTS),
    },
    interviewContext: {
      companies: ['Google', 'Amazon', 'Microsoft', 'Airbnb', 'Uber'],
      frequencyNote: 'Gold-standard 1D DP benchmark; interviewers probe Greedy counterexamples first before asking for DP transitions.',
      followUpTwists: [
        {
          twist: 'Count total unique combinations that make up amount (Coin Change II).',
          adaptation: 'Flip the loops! Put `for coin in coins` OUTSIDE `for a in range(coin, amount+1)` so order permutations are not double-counted.',
        },
      ],
      relatedProblems: [
        { title: 'Coin Change II', difficulty: 'Medium', sharedTrigger: 'Unbounded Knapsack counting -> Outer coin loop' },
        { title: 'Perfect Squares', difficulty: 'Medium', sharedTrigger: 'Minimum terms summing to N -> 1D DP' },
        { title: 'Climbing Stairs', difficulty: 'Easy', sharedTrigger: '1D step recurrence -> Fibonacci DP' },
      ],
    },
  },
  ...TOP_INTERVIEW_PROBLEMS_A,
  ...TOP_INTERVIEW_PROBLEMS_B,
  ...TOP_INTERVIEW_PROBLEMS_C,
];
