import type { CurriculumTopic, VisualizerFrame } from '../../topics/types';

/**
 * Pure headless step-generator decoupled from React/DOM.
 * Reusable in Web, React Native, or micro-frontend clients.
 */
export function generateVisualizerFrames(topic: CurriculumTopic): VisualizerFrame[] {
  const { kind } = topic.visualizer;

  switch (kind) {
    case 'sliding-window':
      return buildSlidingWindowFrames(topic.visualizer.sampleString || 'pwwkew');
    case 'array-pointers':
      return buildArrayPointerFrames(
        topic.visualizer.sampleArray || [1, 3, 5, 7, 11, 14, 18],
        topic.visualizer.sampleTarget ?? 14,
        topic.id
      );
    case 'hash-map':
      return buildHashMapFrames(
        topic.visualizer.sampleArray || [3, 4, -7, 1, 3, 3, 1, -4],
        topic.visualizer.sampleTarget ?? 7,
        topic.id
      );
    case 'stack-queue':
      return buildStackQueueFrames(
        topic.visualizer.sampleArray || [73, 74, 75, 71, 69, 72, 76, 73],
        topic.id
      );
    case 'dp-table':
      return buildDpTableFrames(topic.id);
    case 'recursion-stack':
      return buildRecursionFrames(topic.id);
    case 'ngram-pipeline':
      return buildNGramPipelineFrames(
        topic.visualizer.sampleQuery || 'aple iphon',
        topic.visualizer.sampleCandidates || [
          'apple iphone 15 pro',
          'apple airpods pro',
          'samsung galaxy s24',
          'usb c cable',
        ],
        topic.id
      );
    case 'tree-graph':
    default:
      return buildTreeGraphFrames(topic.id);
  }
}

function buildSlidingWindowFrames(str: string): VisualizerFrame[] {
  const chars = str.split('');
  const frames: VisualizerFrame[] = [];
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;

  frames.push({
    step: 0,
    title: 'Initialize Window & Last-Seen Map',
    explanation: `Start with left = 0, best = 0, and empty map lastSeen for "${str}".`,
    activeLine: 1,
    invariantNote: 'Invariant: s[left..right] contains strictly unique characters.',
    arrayValues: chars,
    pointers: { L: 0, R: 0 },
    windowRange: [0, 0],
    mapEntries: [],
  });

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    const prev = lastSeen.get(ch);
    if (prev !== undefined && prev >= left) {
      left = prev + 1;
      frames.push({
        step: frames.length,
        title: `Duplicate '${ch}' Detected — Shrink Left`,
        explanation: `'${ch}' was already inside window at index ${prev}. Jump left to ${left} in O(1).`,
        activeLine: 4,
        invariantNote: `Window restored to unique characters [${left}..${right}].`,
        arrayValues: chars,
        pointers: { L: left, R: right },
        highlightIndices: [prev, right],
        windowRange: [left, right],
        mapEntries: Array.from(lastSeen.entries()).map(([k, v]) => ({
          key: `'${k}'`,
          value: `idx ${v}`,
          highlight: k === ch,
        })),
      });
    }

    lastSeen.set(ch, right);
    const len = right - left + 1;
    best = Math.max(best, len);

    frames.push({
      step: frames.length,
      title: `Expand Right to '${ch}' (Window = ${len}, Best = ${best})`,
      explanation: `Record lastSeen['${ch}'] = ${right}. Current valid window is "${str.slice(left, right + 1)}".`,
      activeLine: 6,
      invariantNote: `Each index visited at most twice -> O(N) total time; best = ${best}.`,
      arrayValues: chars,
      pointers: { L: left, R: right },
      highlightIndices: [right],
      windowRange: [left, right],
      mapEntries: Array.from(lastSeen.entries()).map(([k, v]) => ({
        key: `'${k}'`,
        value: `idx ${v}`,
        highlight: k === ch,
      })),
    });
  }

  return frames;
}

function buildArrayPointerFrames(
  arr: number[],
  target: number,
  topicId: string
): VisualizerFrame[] {
  const frames: VisualizerFrame[] = [];

  if (topicId === 'sorting-algorithms') {
    const a = [...arr];
    const pivot = target;
    let lt = 0;
    let i = 0;
    let gt = a.length - 1;

    frames.push({
      step: 0,
      title: `Initialize 3-Way Partition (pivot = ${pivot})`,
      explanation: `Partition [${a.join(', ')}] into (< ${pivot}), (== ${pivot}), and (> ${pivot}) bands in a single O(N) pass.`,
      activeLine: 2,
      invariantNote: '[0..lt-1] < pivot · [lt..i-1] == pivot · [gt+1..n-1] > pivot.',
      arrayValues: [...a],
      pointers: { lt, i, gt },
      windowRange: [lt, gt],
    });

    while (i <= gt) {
      const val = a[i];
      if (val < pivot) {
        [a[lt], a[i]] = [a[i], a[lt]];
        frames.push({
          step: frames.length,
          title: `${val} < ${pivot} — Swap a[lt=${lt}] ↔ a[i=${i}]`,
          explanation: `Move ${val} into the (< ${pivot}) band, then advance both lt -> ${lt + 1} and i -> ${i + 1}.`,
          activeLine: 4,
          invariantNote: `Left band [0..${lt}] strictly < ${pivot}.`,
          arrayValues: [...a],
          pointers: { lt, i, gt },
          highlightIndices: [lt, i],
          windowRange: [lt, gt],
        });
        lt++;
        i++;
      } else if (val > pivot) {
        [a[i], a[gt]] = [a[gt], a[i]];
        frames.push({
          step: frames.length,
          title: `${val} > ${pivot} — Swap a[i=${i}] ↔ a[gt=${gt}]`,
          explanation: `Move ${val} into the (> ${pivot}) band and decrement gt -> ${gt - 1}. Keep i = ${i} to inspect the swapped-in element!`,
          activeLine: 5,
          invariantNote: `Right band [${gt}..${a.length - 1}] strictly > ${pivot}.`,
          arrayValues: [...a],
          pointers: { lt, i, gt },
          highlightIndices: [i, gt],
          windowRange: [lt, gt],
        });
        gt--;
      } else {
        frames.push({
          step: frames.length,
          title: `${val} == ${pivot} — Keep in Middle Band`,
          explanation: `Element equals pivot ${pivot}; advance i -> ${i + 1} without swapping.`,
          activeLine: 6,
          invariantNote: `Equal band [${lt}..${i}] holds all values == ${pivot}.`,
          arrayValues: [...a],
          pointers: { lt, i, gt },
          highlightIndices: [i],
          windowRange: [lt, gt],
        });
        i++;
      }
    }

    frames.push({
      step: frames.length,
      title: `Partition Complete — Recurse Outside [${lt}..${gt}]`,
      explanation: `Left band [${a.slice(0, lt).join(', ')}] < ${pivot} == [${a.slice(lt, gt + 1).join(', ')}] < Right band [${a.slice(gt + 1).join(', ')}].`,
      activeLine: 8,
      invariantNote: 'Every equal element is already in final sorted position; O(N) on all duplicates.',
      arrayValues: [...a],
      pointers: { lt, gt },
      highlightIndices: Array.from({ length: Math.max(0, gt - lt + 1) }, (_, idx) => lt + idx),
      windowRange: [lt, gt],
    });
    return frames;
  }

  if (topicId === 'binary-search') {
    let lo = 0;
    let hi = arr.length - 1;
    frames.push({
      step: 0,
      title: `Initialize Search Space [0..${hi}]`,
      explanation: `Search sorted array for target = ${target} by halving search space each step.`,
      activeLine: 1,
      invariantNote: `Invariant: if target exists, it lies inside [lo=${lo}, hi=${hi}].`,
      arrayValues: arr,
      pointers: { lo, hi },
      windowRange: [lo, hi],
    });

    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      const val = arr[mid];
      if (val === target) {
        frames.push({
          step: frames.length,
          title: `Target Found at mid = ${mid} (${val})`,
          explanation: `arr[${mid}] === ${target}. Terminate in O(log N) comparisons.`,
          activeLine: 4,
          invariantNote: `Exact match returned at index ${mid}.`,
          arrayValues: arr,
          pointers: { lo, mid, hi },
          highlightIndices: [mid],
          windowRange: [lo, hi],
        });
        break;
      } else if (val < target) {
        frames.push({
          step: frames.length,
          title: `arr[${mid}] = ${val} < ${target} — Discard Left Half`,
          explanation: `Everything <= mid is too small. Advance lo = ${mid + 1}.`,
          activeLine: 5,
          invariantNote: `Search space halved from ${hi - lo + 1} to ${Math.max(0, hi - mid)} elements.`,
          arrayValues: arr,
          pointers: { lo, mid, hi },
          highlightIndices: [mid],
          windowRange: [mid + 1, hi],
        });
        lo = mid + 1;
      } else {
        frames.push({
          step: frames.length,
          title: `arr[${mid}] = ${val} > ${target} — Discard Right Half`,
          explanation: `Everything >= mid is too large. Shrink hi = ${mid - 1}.`,
          activeLine: 6,
          invariantNote: `Search space halved to [${lo}..${mid - 1}].`,
          arrayValues: arr,
          pointers: { lo, mid, hi },
          highlightIndices: [mid],
          windowRange: [lo, mid - 1],
        });
        hi = mid - 1;
      }
    }
    return frames;
  }

  // Two-pointer converging search (sorted pair sum / container water)
  let left = 0;
  let right = arr.length - 1;
  frames.push({
    step: 0,
    title: 'Initialize Converging Pointers',
    explanation: `Place L = 0 (${arr[0]}) and R = ${right} (${arr[right]}) to search for sum = ${target}.`,
    activeLine: 1,
    invariantNote: 'Monotonicity lets us eliminate an entire row/column per step in O(1).',
    arrayValues: arr,
    pointers: { L: left, R: right },
    highlightIndices: [left, right],
  });

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      frames.push({
        step: frames.length,
        title: `Pair Found: arr[${left}] + arr[${right}] = ${sum}`,
        explanation: `${arr[left]} + ${arr[right]} equals target ${target}. Return [${left}, ${right}].`,
        activeLine: 4,
        invariantNote: 'Solved in O(N) time and O(1) extra space.',
        arrayValues: arr,
        pointers: { L: left, R: right },
        highlightIndices: [left, right],
      });
      break;
    } else if (sum < target) {
      frames.push({
        step: frames.length,
        title: `Sum ${sum} < ${target} — Advance Left Pointer`,
        explanation: `Even paired with largest remaining value ${arr[right]}, ${arr[left]} is too small.`,
        activeLine: 5,
        invariantNote: `Eliminated index ${left}; advance L -> ${left + 1}.`,
        arrayValues: arr,
        pointers: { L: left, R: right },
        highlightIndices: [left, right],
      });
      left++;
    } else {
      frames.push({
        step: frames.length,
        title: `Sum ${sum} > ${target} — Decrement Right Pointer`,
        explanation: `Even paired with smallest remaining value ${arr[left]}, ${arr[right]} is too large.`,
        activeLine: 6,
        invariantNote: `Eliminated index ${right}; move R -> ${right - 1}.`,
        arrayValues: arr,
        pointers: { L: left, R: right },
        highlightIndices: [left, right],
      });
      right--;
    }
  }
  return frames;
}

function buildHashMapFrames(arr: number[], target: number, topicId: string): VisualizerFrame[] {
  const frames: VisualizerFrame[] = [];

  if (topicId === 'prefix-sum-diff-array') {
    const freq = new Map<number, number>([[0, 1]]);
    let prefix = 0;
    let count = 0;
    frames.push({
      step: 0,
      title: 'Seed Prefix Map { 0: 1 }',
      explanation: `Count subarrays summing to k = ${target}. Seed prefix 0 once so prefix===k matches.`,
      activeLine: 1,
      invariantNote: 'Subarray(j+1..i) = k  <=>  prefix[i] - k === prefix[j].',
      arrayValues: arr,
      pointers: { i: 0 },
      mapEntries: [{ key: 'sum=0', value: '1×', highlight: true }],
    });

    for (let i = 0; i < arr.length; i++) {
      prefix += arr[i];
      const need = prefix - target;
      const hits = freq.get(need) ?? 0;
      count += hits;
      freq.set(prefix, (freq.get(prefix) ?? 0) + 1);
      frames.push({
        step: frames.length,
        title: `i=${i}, val=${arr[i]} → prefix=${prefix} (Need ${need}: ${hits} hit${hits === 1 ? '' : 's'})`,
        explanation:
          hits > 0
            ? `Found ${hits} earlier prefix(es) equal to ${need}. Total valid subarrays = ${count}.`
            : `No prior prefix equals ${need}. Record prefix ${prefix} in hash map.`,
        activeLine: hits > 0 ? 4 : 5,
        invariantNote: `O(1) lookup replaces O(N) backward scan; running total = ${count}.`,
        arrayValues: arr,
        pointers: { i },
        highlightIndices: [i],
        mapEntries: Array.from(freq.entries()).map(([k, v]) => ({
          key: `sum=${k}`,
          value: `${v}×`,
          highlight: k === need || k === prefix,
        })),
      });
    }
    return frames;
  }

  // Standard Arrays & Hashing (Two Sum / Complement Lookup)
  const seen = new Map<number, number>();
  frames.push({
    step: 0,
    title: 'Initialize Empty Complement Map',
    explanation: `Scan once to find pair summing to ${target} in O(N) time.`,
    activeLine: 1,
    invariantNote: 'Map stores every previously visited value -> index.',
    arrayValues: arr,
    pointers: { i: 0 },
    mapEntries: [],
  });

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    const comp = target - val;
    if (seen.has(comp)) {
      const j = seen.get(comp)!;
      frames.push({
        step: frames.length,
        title: `Complement Hit! ${comp} at idx ${j} + ${val} at idx ${i}`,
        explanation: `Map contains ${comp} -> ${j}. Return [${j}, ${i}] immediately.`,
        activeLine: 4,
        invariantNote: 'O(1) hash lookup avoids O(N^2) nested pair loop.',
        arrayValues: arr,
        pointers: { prev: j, i },
        highlightIndices: [j, i],
        mapEntries: Array.from(seen.entries()).map(([k, v]) => ({
          key: `${k}`,
          value: `idx ${v}`,
          highlight: k === comp,
        })),
      });
      break;
    }
    seen.set(val, i);
    frames.push({
      step: frames.length,
      title: `Store ${val} → idx ${i} (Need ${comp})`,
      explanation: `${comp} not in map yet. Insert ${val}: ${i} and advance.`,
      activeLine: 5,
      invariantNote: `Map size = ${seen.size}; invariant preserved.`,
      arrayValues: arr,
      pointers: { i },
      highlightIndices: [i],
      mapEntries: Array.from(seen.entries()).map(([k, v]) => ({
        key: `${k}`,
        value: `idx ${v}`,
        highlight: k === val,
      })),
    });
  }
  return frames;
}

function buildStackQueueFrames(arr: number[], topicId: string): VisualizerFrame[] {
  const frames: VisualizerFrame[] = [];
  const isDeque = topicId === 'queues-monotonic-deque';
  const stack: number[] = [];
  const k = 3;

  frames.push({
    step: 0,
    title: isDeque ? 'Initialize Monotonic Decreasing Deque (k = 3)' : 'Initialize Monotonic Decreasing Stack',
    explanation: isDeque
      ? 'Keep candidate max indices in decreasing value order; evict indices outside window.'
      : 'Store unresolved indices waiting for their Next Greater Element.',
    activeLine: 1,
    invariantNote: 'Each index is pushed once and popped at most once -> O(N) amortized.',
    arrayValues: arr,
    pointers: { i: 0 },
    stackItems: [],
  });

  for (let i = 0; i < arr.length; i++) {
    if (isDeque && stack.length > 0 && stack[0] <= i - k) {
      stack.shift();
    }
    const popped: number[] = [];
    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      popped.push(stack.pop()!);
    }
    stack.push(i);

    frames.push({
      step: frames.length,
      title:
        popped.length > 0
          ? `i=${i} (${arr[i]}) Resolved [${popped.map((idx) => arr[idx]).join(', ')}]`
          : `Push i=${i} (${arr[i]}) Preserving Monotonic Order`,
      explanation: isDeque
        ? `Window max is front of deque: arr[${stack[0]}] = ${arr[stack[0]]}.`
        : popped.length > 0
          ? `Popped smaller elements because ${arr[i]} is their first greater day.`
          : `${arr[i]} <= stack top, so push index ${i} onto monotonic stack.`,
      activeLine: popped.length > 0 ? 4 : 6,
      invariantNote: `Structure strictly decreasing: [${stack.map((idx) => arr[idx]).join(' >= ')}].`,
      arrayValues: arr,
      pointers: { i },
      highlightIndices: [i, ...popped],
      windowRange: isDeque ? [Math.max(0, i - k + 1), i] : undefined,
      stackItems: stack.map((idx) => `idx ${idx} (${arr[idx]})`),
    });
  }
  return frames;
}

function buildDpTableFrames(topicId: string): VisualizerFrame[] {
  const a = topicId === 'confident-fuzzy-reranking' ? 'teh' : 'cat';
  const b = topicId === 'confident-fuzzy-reranking' ? 'the' : 'cut';
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  const rowLabels = ['∅', ...a.split('')];
  const colLabels = ['∅', ...b.split('')];
  const frames: VisualizerFrame[] = [
    {
      step: 0,
      title: `Base Cases Initialized ("${a}" → "${b}")`,
      explanation: 'Row 0 and Col 0 encode pure insertions/deletions from empty prefix.',
      activeLine: 2,
      invariantNote: 'dp[i][j] = minimum edits to transform a[0..i-1] into b[0..j-1].',
      dpGrid: {
        rowLabels,
        colLabels,
        cells: dp.map((r) => [...r]),
        activeCell: [0, 0],
      },
    },
  ];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = a[i - 1] === b[j - 1];
      let best = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (match ? 0 : 1));
      let transposition = false;
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        if (dp[i - 2][j - 2] + 1 < best) {
          best = dp[i - 2][j - 2] + 1;
          transposition = true;
        }
      }
      dp[i][j] = best;
      frames.push({
        step: frames.length,
        title: `dp[${i}][${j}] = ${best} ('${a[i - 1]}' vs '${b[j - 1]}')`,
        explanation: transposition
          ? `Adjacent transposition detected! Cost = dp[${i - 2}][${j - 2}] + 1 = ${best}.`
          : match
            ? `Characters match ('${a[i - 1]}'). Carry diagonal dp[${i - 1}][${j - 1}] = ${best}.`
            : `Mismatch: min(del=${dp[i - 1][j] + 1}, ins=${dp[i][j - 1] + 1}, sub=${dp[i - 1][j - 1] + 1}) = ${best}.`,
        activeLine: transposition ? 6 : match ? 4 : 5,
        invariantNote: `Optimal substructure holds for prefix ("${a.slice(0, i)}" → "${b.slice(0, j)}").`,
        dpGrid: {
          rowLabels,
          colLabels,
          cells: dp.map((r) => [...r]),
          activeCell: [i, j],
        },
      });
    }
  }
  return frames;
}

function buildRecursionFrames(topicId: string): VisualizerFrame[] {
  if (topicId === 'recursion-divide-conquer') {
    const exps = [10, 5, 2, 1, 0];
    return [
      {
        step: 0,
        title: 'Push Frame: fastPow(2, 10)',
        explanation: 'n = 10 is non-zero; halve exponent to 5 and pause this frame awaiting half = fastPow(2, 5).',
        activeLine: 3,
        invariantNote: 'Call stack grows logarithmically: O(log N) frames instead of O(N).',
        arrayValues: exps,
        pointers: { n: 0 },
        highlightIndices: [0],
        stackItems: ['fastPow(2, 10) [even]'],
      },
      {
        step: 1,
        title: 'Push Frame: fastPow(2, 5)',
        explanation: 'n = 5 is odd; halve exponent to 2 and remember to multiply by extra factor 2 on unwind.',
        activeLine: 3,
        invariantNote: 'Single recursive call per frame prevents exponential blowup.',
        arrayValues: exps,
        pointers: { n: 1 },
        highlightIndices: [0, 1],
        stackItems: ['fastPow(2, 10) [even]', 'fastPow(2, 5) [odd ×2]'],
      },
      {
        step: 2,
        title: 'Push Frames: fastPow(2, 2) → fastPow(2, 1) → Base (0)',
        explanation: 'Continue halving 2 → 1 → 0 until base case n === 0 returns 1 immediately.',
        activeLine: 2,
        invariantNote: 'Base case hit at depth 5 (log₂(10) + 1); stack unwind begins.',
        arrayValues: exps,
        pointers: { n: 4 },
        highlightIndices: [4],
        stackItems: [
          'fastPow(2, 10)',
          'fastPow(2, 5)',
          'fastPow(2, 2)',
          'fastPow(2, 1)',
          'fastPow(2, 0) → returns 1',
        ],
      },
      {
        step: 3,
        title: 'Unwind: n=1 → 2, n=2 → 4, n=5 → 4×4×2 = 32',
        explanation: 'Each returning frame squares its child half (and multiplies by 2 when n is odd).',
        activeLine: 4,
        invariantNote: 'Leap of faith combines child result in O(1) per frame.',
        arrayValues: [1024, 32, 4, 2, 1],
        pointers: { n: 1 },
        highlightIndices: [1, 2, 3],
        stackItems: ['fastPow(2, 10) [awaiting 32]', 'fastPow(2, 5) → 4·4·2 = 32'],
      },
      {
        step: 4,
        title: 'Final Unwind: fastPow(2, 10) = 32 × 32 = 1024',
        explanation: 'Root frame squares 32 to return 1024 in just 4 halving calls (O(log N) total).',
        activeLine: 4,
        invariantNote: 'Call stack completely empty; exact answer 1024 returned.',
        arrayValues: [1024, 32, 4, 2, 1],
        pointers: { n: 0 },
        highlightIndices: [0],
        stackItems: ['fastPow(2, 10) → 32·32 = 1024 ✓'],
      },
    ];
  }

  const nums = [1, 2, 3];
  const frames: VisualizerFrame[] = [
    {
      step: 0,
      title: 'Root Call: backtrack(index=0, path=[])',
      explanation:
        topicId === 'bit-manipulation'
          ? 'Explore 2^N subset masks from 000 to 111 using bit shifts.'
          : 'Enter decision tree at depth 0 with empty candidate path.',
      activeLine: 1,
      invariantNote: 'Each branch makes a choice, recurses, then undoes the choice (backtrack).',
      arrayValues: nums,
      pointers: { idx: 0 },
      stackItems: ['backtrack(0, [])'],
    },
    {
      step: 1,
      title: 'Choose 1 → Recurse backtrack(1, [1])',
      explanation: 'Push 1 onto path and descend to index 1.',
      activeLine: 3,
      invariantNote: 'Call stack depth = 2; active path = [1].',
      arrayValues: nums,
      pointers: { idx: 1 },
      highlightIndices: [0],
      stackItems: ['backtrack(0, [])', 'backtrack(1, [1])'],
    },
    {
      step: 2,
      title: 'Choose 2 → Recurse backtrack(2, [1, 2])',
      explanation: 'Push 2 onto path and descend to index 2.',
      activeLine: 3,
      invariantNote: 'Call stack depth = 3; active path = [1, 2].',
      arrayValues: nums,
      pointers: { idx: 2 },
      highlightIndices: [0, 1],
      stackItems: ['backtrack(0, [])', 'backtrack(1, [1])', 'backtrack(2, [1, 2])'],
    },
    {
      step: 3,
      title: 'Leaf Reached → Emit [1, 2, 3] & Pop',
      explanation: 'Record complete leaf solution [1, 2, 3], then pop 3 to restore [1, 2].',
      activeLine: 5,
      invariantNote: 'State restoration guarantees sibling branches remain uncorrupted.',
      arrayValues: nums,
      pointers: { idx: 2 },
      highlightIndices: [0, 1, 2],
      stackItems: ['backtrack(0, [])', 'backtrack(1, [1])', 'backtrack(2, [1, 2]) → pop()'],
    },
    {
      step: 4,
      title: 'Backtrack to Root & Explore Branch [2]',
      explanation: 'Unwind stack back to depth 1 and start next sibling branch with 2.',
      activeLine: 6,
      invariantNote: 'All 2^N subsets enumerated without duplicating intermediate arrays.',
      arrayValues: nums,
      pointers: { idx: 1 },
      highlightIndices: [1],
      stackItems: ['backtrack(0, [])', 'backtrack(2, [2])'],
    },
  ];
  return frames;
}

function buildNGramPipelineFrames(
  query: string,
  candidates: string[],
  topicId: string
): VisualizerFrame[] {
  const padded = `__${query.toLowerCase()}__`;
  const qGrams: string[] = [];
  for (let i = 0; i <= padded.length - 3; i++) {
    qGrams.push(padded.slice(i, i + 3));
  }
  const qSet = new Set(qGrams);
  const threshold = 0.3;
  const minD = Math.ceil(threshold * qSet.size);
  const maxD = Math.floor(qSet.size / threshold);

  const analyzed = candidates.map((title) => {
    const p = `__${title.toLowerCase()}__`;
    const gSet = new Set<string>();
    for (let i = 0; i <= p.length - 3; i++) gSet.add(p.slice(i, i + 3));
    let overlap = 0;
    for (const g of qSet) if (gSet.has(g)) overlap++;
    const jaccard = overlap / (qSet.size + gSet.size - overlap);
    const outOfBounds = gSet.size < minD || gSet.size > maxD;
    return { title, gramCount: gSet.size, overlap, jaccard, outOfBounds };
  });

  return [
    {
      step: 0,
      title: `1. Normalize & Slice Padded Trigrams ("${query}")`,
      explanation: `Pad query to "${padded}" and slide window n=3 to produce ${qGrams.length} boundary-protected trigrams.`,
      activeLine: 1,
      invariantNote: `|Q| = ${qSet.size} unique trigrams; edge typos protected by boundary markers.`,
      ngramState: {
        query,
        queryGrams: qGrams,
        activeGramIndex: 0,
        candidates: analyzed.map((c) => ({
          title: c.title,
          gramCount: c.gramCount,
          overlap: 0,
          score: 0,
          status: 'scanning',
          reason: 'Queued in inverted index',
        })),
      },
    },
    {
      step: 1,
      title: `2. O(1) Length Pruning Bounds [${minD} .. ${maxD}]`,
      explanation: `At Jaccard >= ${threshold}, any candidate with |D| < ${minD} or |D| > ${maxD} is mathematically impossible and rejected in O(1).`,
      activeLine: 3,
      invariantNote: `Formula: ceil(t*|Q|) <= |D| <= floor(|Q|/t) eliminates short/long noise immediately.`,
      ngramState: {
        query,
        queryGrams: qGrams,
        activeGramIndex: Math.min(2, qGrams.length - 1),
        candidates: analyzed.map((c) => ({
          title: c.title,
          gramCount: c.gramCount,
          overlap: 0,
          score: 0,
          status: c.outOfBounds ? 'pruned' : 'scanning',
          reason: c.outOfBounds
            ? `Pruned in O(1): |D|=${c.gramCount} outside [${minD}, ${maxD}]`
            : `Passes length bound (|D|=${c.gramCount})`,
        })),
      },
    },
    {
      step: 2,
      title: '3. Inverted Posting-List Overlap Accumulation',
      explanation: `Traverse posting lists only for query trigrams to count exact |Q ∩ D| intersections without scanning the full catalog.`,
      activeLine: 5,
      invariantNote: 'Only documents sharing >= 1 trigram are ever touched.',
      ngramState: {
        query,
        queryGrams: qGrams,
        activeGramIndex: Math.min(4, qGrams.length - 1),
        candidates: analyzed.map((c) => ({
          title: c.title,
          gramCount: c.gramCount,
          overlap: c.outOfBounds ? 0 : c.overlap,
          score: c.outOfBounds ? 0 : Number(c.jaccard.toFixed(3)),
          status: c.outOfBounds || c.jaccard < threshold ? 'pruned' : 'kept',
          reason: c.outOfBounds
            ? 'Skipped (length pruned)'
            : c.jaccard >= threshold
              ? `Kept for Stage 2: Jaccard ${c.jaccard.toFixed(2)} >= ${threshold}`
              : `Pruned: Jaccard ${c.jaccard.toFixed(2)} < ${threshold}`,
        })),
      },
    },
    {
      step: 3,
      title:
        topicId === 'confident-fuzzy-reranking'
          ? '4. Stage-2 Damerau-Levenshtein + Jaro-Winkler Rerank'
          : '4. Emit High-Recall Candidate Set → Stage 2',
      explanation:
        'Top surviving candidates advance to banded edit-distance & prefix confidence reranking and Waterfall routing.',
      activeLine: 7,
      invariantNote: 'Two-stage Filter-and-Refine guarantees <20ms P99 latency at 10M scale.',
      ngramState: {
        query,
        queryGrams: qGrams,
        activeGramIndex: qGrams.length - 1,
        candidates: [...analyzed]
          .sort((a, b) => b.jaccard - a.jaccard)
          .map((c) => ({
            title: c.title,
            gramCount: c.gramCount,
            overlap: c.outOfBounds ? 0 : c.overlap,
            score: c.outOfBounds ? 0 : Number(c.jaccard.toFixed(3)),
            status: !c.outOfBounds && c.jaccard >= threshold ? 'reranked' : 'pruned',
            reason:
              !c.outOfBounds && c.jaccard >= threshold
                ? `Top Ranked Match (Score ${c.jaccard.toFixed(2)})`
                : 'Rejected before expensive DP',
          })),
      },
    },
  ];
}

function buildTreeGraphFrames(topicId: string): VisualizerFrame[] {
  const nodes =
    topicId === 'segment-fenwick-trees'
      ? ['[0..3]=18', '[0..1]=7', '[2..3]=11', '[0]=3', '[1]=4', '[2]=5', '[3]=6']
      : topicId === 'tries-radix'
        ? ['root', 'a', 'ap', 'app', 'appl', 'apple*']
        : ['Node 0', 'Node 1', 'Node 2', 'Node 3', 'Node 4'];

  return [
    {
      step: 0,
      title: 'Initialize Frontier / Root State',
      explanation: 'Seed traversal queue or root node with initial state and visited guard.',
      activeLine: 1,
      invariantNote: 'Visited tracking guarantees O(V + E) or O(log N) work without infinite cycles.',
      arrayValues: nodes,
      pointers: { cur: 0 },
      highlightIndices: [0],
      stackItems: [nodes[0]],
    },
    {
      step: 1,
      title: 'Expand Immediate Children / Outgoing Edges',
      explanation: 'Inspect active node neighbors and enqueue unvisited / overlapping partitions.',
      activeLine: 3,
      invariantNote: 'Frontier advances monotonically by level or tree height.',
      arrayValues: nodes,
      pointers: { cur: 1 },
      highlightIndices: [0, 1, 2],
      stackItems: nodes.slice(1, 3),
    },
    {
      step: 2,
      title: 'Aggregate Subproblem / Mark Complete',
      explanation: 'Combine child results or relax shortest path / range sum in logarithmic or linear steps.',
      activeLine: 5,
      invariantNote: 'Each node or edge processed cleanly within complexity budget.',
      arrayValues: nodes,
      pointers: { cur: Math.min(3, nodes.length - 1) },
      highlightIndices: [1, 2, 3],
      stackItems: nodes.slice(2, Math.min(5, nodes.length)),
    },
  ];
}
