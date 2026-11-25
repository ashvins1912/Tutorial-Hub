import type { LearningTrace, TraceStep } from './learningContract';

/**
 * Deterministic Interactive Visualization Trace Engine (Layer 2 / Section 6)
 * Algorithm execution is strictly separated from UI rendering.
 * Every trace step emits exact variables, data structure snapshots, state diffs,
 * invariants, and interactive prediction checkpoints.
 */

function parseIntArray(raw: string, fallback: number[], maxLen = 10): number[] {
  const parsed = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n) && Math.abs(n) <= 9999);
  if (parsed.length < 2) return fallback;
  return parsed.slice(0, maxLen).map((n) => Math.trunc(n));
}

function parseIntValue(raw: string, fallback: number, min = -9999, max = 9999): number {
  const n = Number(raw.trim());
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function parseWordList(raw: string, fallback: string[], maxLen = 7): string[] {
  const parts = raw
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean);
  if (parts.length < 2) return fallback;
  return parts.slice(0, maxLen);
}

function parseCleanString(raw: string, fallback: string, maxLen = 14): string {
  const cleaned = raw.trim().replace(/\s+/g, '');
  if (!cleaned) return fallback;
  return cleaned.slice(0, maxLen);
}

// ============================================================================
// 1. HASHMAP & HASHSET TRACES
// ============================================================================

export function generateTwoSumTrace(input: Record<string, string> = {}): LearningTrace {
  const nums = parseIntArray(input.nums ?? '2, 7, 11, 15', [2, 7, 11, 15], 10);
  const target = parseIntValue(input.target ?? '9', 9);

  const steps: TraceStep[] = [];
  const seen = new Map<number, number>();
  const invariant =
    'Before processing index i, seen contains every (nums[k] -> k) for 0 <= k < i, and no pair inside [0..i-1] sums to target.';

  const snapshotMap = (highlightKey?: number, newKey?: number) =>
    Array.from(seen.entries()).map(([k, v]) => ({
      key: String(k),
      value: `idx ${v}`,
      highlighted: highlightKey !== undefined && k === highlightKey,
      isNew: newKey !== undefined && k === newKey,
    }));

  steps.push({
    stepIndex: 0,
    operation: {
      type: 'init',
      summary: 'Initialize empty HashMap',
      detail: `Target is ${target}. We scan left-to-right and check whether complement = target - nums[i] already exists in O(1).`,
      highlightedIndices: [],
    },
    variables: [
      { name: 'target', value: String(target), role: 'state' },
      { name: 'i', value: '—', role: 'pointer' },
      { name: 'complement', value: '—', role: 'accumulator' },
      { name: 'seen.size', value: '0', role: 'state' },
    ],
    state: {
      array: nums,
      pointers: [],
      hashMap: [],
      intermediateResult: 'No pair found yet',
    },
    stateChangeSummary: 'HashMap initialized as empty {}.',
    invariant,
  });

  let found: [number, number] | null = null;
  let checkpointAdded = false;

  for (let i = 0; i < nums.length; i++) {
    const val = nums[i];
    const complement = target - val;
    const matchIndex = seen.get(complement);

    const willFind = matchIndex !== undefined;
    const needsCheckpoint = !checkpointAdded && (willFind || i === 1);

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'lookup',
        summary: `Inspect nums[${i}] = ${val}; lookup complement ${complement}`,
        detail: willFind
          ? `Complement ${complement} exists in seen at index ${matchIndex}. Valid pair [${matchIndex}, ${i}] discovered!`
          : `Complement ${complement} is not in seen. We will record ${val} -> ${i} so future elements can match it in O(1).`,
        highlightedIndices: willFind ? [matchIndex, i] : [i],
      },
      variables: [
        { name: 'target', value: String(target), role: 'state' },
        { name: 'i', value: String(i), changed: true, role: 'pointer' },
        { name: 'nums[i]', value: String(val), changed: true, role: 'state' },
        { name: 'complement', value: `${target} - ${val} = ${complement}`, changed: true, role: 'accumulator' },
        { name: 'seen.has(comp)', value: String(willFind), changed: true, role: 'result' },
      ],
      state: {
        array: nums,
        pointers: [
          ...(willFind ? [{ name: 'match', index: matchIndex, color: 'emerald' as const }] : []),
          { name: 'i', index: i, color: 'sky' as const },
        ],
        hashMap: snapshotMap(willFind ? complement : undefined),
        intermediateResult: willFind
          ? `Match found: nums[${matchIndex}] + nums[${i}] = ${target}`
          : `Miss for ${complement}; preparing to store ${val} -> ${i}`,
      },
      stateChangeSummary: willFind
        ? `O(1) HashMap hit for key ${complement} (index ${matchIndex}).`
        : `HashMap lookup for ${complement} returned miss.`,
      invariant,
      checkpoint: needsCheckpoint
        ? {
            id: `two-sum-cp-${i}`,
            prompt: `At index i = ${i} (nums[i] = ${val}, complement = ${complement}), what happens next?`,
            options: [
              {
                id: 'hit-return',
                label: `Return pair [${matchIndex ?? 0}, ${i}] immediately`,
                isCorrect: willFind,
                feedback: willFind
                  ? `Correct! ${complement} was stored at index ${matchIndex}, so checking before inserting guarantees distinct indices.`
                  : `Not yet — ${complement} is not in the HashMap, so no valid complement has been seen before index ${i}.`,
              },
              {
                id: 'insert-continue',
                label: `Store ${val} -> ${i} in HashMap and advance i`,
                isCorrect: !willFind,
                feedback: !willFind
                  ? `Correct! Because ${complement} is absent, we record ${val} -> ${i} and preserve the invariant for index ${i + 1}.`
                  : `Missed opportunity — ${complement} is already in the HashMap at index ${matchIndex}, so we can terminate immediately.`,
              },
              {
                id: 'scan-nested',
                label: 'Run an inner loop from i + 1 to n - 1',
                isCorrect: false,
                feedback: 'Running an inner loop reverts to O(n²). The HashMap replaces that inner scan with O(1) lookup.',
              },
            ],
          }
        : undefined,
    });

    if (needsCheckpoint) checkpointAdded = true;

    if (willFind) {
      found = [matchIndex, i];
      steps.push({
        stepIndex: steps.length,
        operation: {
          type: 'complete',
          summary: `Return [${found[0]}, ${found[1]}]`,
          detail: `Verified: nums[${found[0]}] (${nums[found[0]]}) + nums[${found[1]}] (${nums[found[1]]}) = ${target}. Total lookups: ${i + 1}.`,
          highlightedIndices: [found[0], found[1]],
        },
        variables: [
          { name: 'result', value: `[${found[0]}, ${found[1]}]`, changed: true, role: 'result' },
          { name: 'lookups', value: String(i + 1), role: 'accumulator' },
          { name: 'seen.size', value: String(seen.size), role: 'state' },
        ],
        state: {
          array: nums,
          pointers: [
            { name: 'first', index: found[0], color: 'emerald' },
            { name: 'second', index: found[1], color: 'sky' },
          ],
          hashMap: snapshotMap(complement),
          finalResult: `[${found[0]}, ${found[1]}]`,
        },
        stateChangeSummary: `Algorithm terminated with pair [${found[0]}, ${found[1]}].`,
        invariant,
      });
      break;
    }

    seen.set(val, i);
    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'insert',
        summary: `Insert ${val} -> idx ${i} into HashMap`,
        detail: `Storing after lookup prevents an element from pairing with itself (e.g., when target = 2 * nums[i]).`,
        highlightedIndices: [i],
      },
      variables: [
        { name: 'i', value: String(i), role: 'pointer' },
        { name: 'inserted', value: `${val} -> ${i}`, changed: true, role: 'state' },
        { name: 'seen.size', value: String(seen.size), changed: true, role: 'state' },
      ],
      state: {
        array: nums,
        pointers: [{ name: 'i', index: i, color: 'sky' }],
        hashMap: snapshotMap(undefined, val),
        intermediateResult: `Stored ${val} -> ${i}`,
      },
      stateChangeSummary: `seen[${val}] = ${i} (size is now ${seen.size}).`,
      invariant,
    });
  }

  if (!found) {
    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'complete',
        summary: 'No pair found — return []',
        detail: `Scanned all ${nums.length} elements in O(n) time without finding a pair summing to ${target}.`,
        highlightedIndices: [],
      },
      variables: [
        { name: 'result', value: '[]', changed: true, role: 'result' },
        { name: 'seen.size', value: String(seen.size), role: 'state' },
      ],
      state: {
        array: nums,
        pointers: [],
        hashMap: snapshotMap(),
        finalResult: '[] (No valid pair)',
      },
      stateChangeSummary: 'Scan exhausted with no matching complement.',
      invariant,
    });
  }

  return {
    id: 'trace-hashmap-two-sum',
    topicId: 'hashmap-hashset-lookup',
    title: 'Two Sum — One-Pass Complement Lookup',
    algorithmName: 'One-Pass HashMap Lookup',
    description: 'Watch how checking target - nums[i] before inserting turns O(n²) pair search into O(n) while preventing self-pairing.',
    primaryStructure: 'hashmap',
    defaultInputLabel: 'nums = [2, 7, 11, 15], target = 9',
    defaultInput: { nums: nums.join(', '), target: String(target) },
    inputSchema: [
      { key: 'nums', label: 'Array (nums)', placeholder: '2, 7, 11, 15', helpText: '2 to 10 comma-separated integers' },
      { key: 'target', label: 'Target Sum', placeholder: '9', helpText: 'Integer target sum' },
    ],
    invariantRule: invariant,
    steps,
  };
}

export function generateLongestConsecutiveTrace(input: Record<string, string> = {}): LearningTrace {
  const nums = parseIntArray(input.nums ?? '100, 4, 200, 1, 3, 2', [100, 4, 200, 1, 3, 2], 10);
  const uniqueSet = new Set(nums);
  const uniqueList = Array.from(uniqueSet);
  const invariant =
    'A number x starts an upward chain walk if and only if (x - 1) is NOT in the HashSet — guaranteeing every element is visited at most twice overall.';

  const steps: TraceStep[] = [];
  let best = 0;

  const setSnapshot = (activeVal?: number) =>
    uniqueList.map((v) => ({ value: String(v), highlighted: activeVal === v }));

  steps.push({
    stepIndex: 0,
    operation: {
      type: 'init',
      summary: 'Load all distinct values into HashSet',
      detail: `Inserted ${uniqueList.length} unique numbers into HashSet in O(n) for O(1) membership checks.`,
      highlightedIndices: [],
    },
    variables: [
      { name: 'set.size', value: String(uniqueList.length), changed: true, role: 'state' },
      { name: 'best', value: '0', role: 'result' },
    ],
    state: {
      array: uniqueList,
      hashSet: setSnapshot(),
      intermediateResult: 'Ready to scan set for sequence heads',
    },
    stateChangeSummary: `HashSet populated with {${uniqueList.join(', ')}}.`,
    invariant,
  });

  let cpDone = false;
  for (let i = 0; i < uniqueList.length; i++) {
    const num = uniqueList[i];
    const hasPrev = uniqueSet.has(num - 1);
    const shouldCp = !cpDone && hasPrev;

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'inspect',
        summary: `Check if ${num} is a sequence start (is ${num - 1} in set?)`,
        detail: hasPrev
          ? `${num - 1} exists in the HashSet, so ${num} is in the middle of a sequence. Skip it in O(1)!`
          : `${num - 1} is absent, so ${num} is a true sequence head. Expand upward (${num}, ${num + 1}, ...).`,
        highlightedIndices: [i],
      },
      variables: [
        { name: 'num', value: String(num), changed: true, role: 'pointer' },
        { name: 'has(num - 1)', value: String(hasPrev), changed: true, role: 'state' },
        { name: 'best', value: String(best), role: 'result' },
      ],
      state: {
        array: uniqueList,
        pointers: [{ name: 'num', index: i, color: hasPrev ? 'amber' : 'emerald' }],
        hashSet: setSnapshot(num),
        intermediateResult: hasPrev ? `Skip ${num} (not a start)` : `Start streak at ${num}`,
      },
      stateChangeSummary: hasPrev ? `Skipped ${num} because ${num - 1} is present.` : `Identified sequence head ${num}.`,
      invariant,
      checkpoint: shouldCp
        ? {
            id: `lcs-cp-${i}`,
            prompt: `We are inspecting ${num}, and ${num - 1} IS in the HashSet. What must we do to stay O(n)?`,
            options: [
              {
                id: 'skip',
                label: `Skip ${num} immediately without counting upward`,
                isCorrect: true,
                feedback: `Correct! ${num} will be counted when the loop starts from its true sequence head. Skipping prevents O(n²) work.`,
              },
              {
                id: 'count-anyway',
                label: `Walk ${num}, ${num + 1}, ... to measure its streak`,
                isCorrect: false,
                feedback: 'Walking from non-heads repeats work for every suffix of a chain, degrading time to O(n²).',
              },
            ],
          }
        : undefined,
    });
    if (shouldCp) cpDone = true;

    if (!hasPrev) {
      let curr = num;
      const chain = [curr];
      while (uniqueSet.has(curr + 1)) {
        curr += 1;
        chain.push(curr);
      }
      best = Math.max(best, chain.length);
      steps.push({
        stepIndex: steps.length,
        operation: {
          type: 'update-best',
          summary: `Chain [${chain.join(' → ')}] has length ${chain.length}`,
          detail: `Updated best = max(best, ${chain.length}) = ${best}.`,
          highlightedIndices: chain.map((v) => uniqueList.indexOf(v)).filter((idx) => idx >= 0),
        },
        variables: [
          { name: 'chain', value: chain.join(' → '), changed: true, role: 'accumulator' },
          { name: 'length', value: String(chain.length), changed: true, role: 'accumulator' },
          { name: 'best', value: String(best), changed: true, role: 'result' },
        ],
        state: {
          array: uniqueList,
          pointers: [{ name: 'head', index: i, color: 'emerald' }],
          hashSet: setSnapshot(curr),
          intermediateResult: `Best streak length = ${best}`,
        },
        stateChangeSummary: `Expanded streak from ${num} to ${curr} (length ${chain.length}); best = ${best}.`,
        invariant,
      });
    }
  }

  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return longest consecutive length = ${best}`,
      detail: 'Each number was checked once as a potential head and visited at most once during a streak expansion: O(n) total.',
      highlightedIndices: [],
    },
    variables: [{ name: 'best', value: String(best), role: 'result' }],
    state: {
      array: uniqueList,
      hashSet: setSnapshot(),
      finalResult: String(best),
    },
    stateChangeSummary: `Completed with longest consecutive sequence length ${best}.`,
    invariant,
  });

  return {
    id: 'trace-hashmap-longest-consecutive',
    topicId: 'hashmap-hashset-lookup',
    title: 'Longest Consecutive Sequence — Head-Only HashSet Expansion',
    algorithmName: 'HashSet Sequence-Head Filtering',
    description: 'See why skipping any value whose predecessor exists keeps total work strictly O(n) without sorting.',
    primaryStructure: 'hashset',
    defaultInputLabel: 'nums = [100, 4, 200, 1, 3, 2]',
    defaultInput: { nums: nums.join(', ') },
    inputSchema: [
      { key: 'nums', label: 'Array (nums)', placeholder: '100, 4, 200, 1, 3, 2', helpText: 'Unsorted integers (2 to 10 values)' },
    ],
    invariantRule: invariant,
    steps,
  };
}

export function generateGroupAnagramsTrace(input: Record<string, string> = {}): LearningTrace {
  const words = parseWordList(input.words ?? 'eat, tea, tan, ate, nat, bat', ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'], 7);
  const buckets = new Map<string, string[]>();
  const invariant =
    'Two strings belong to the exact same HashMap bucket if and only if they share the exact same canonical character signature.';

  const mapSnap = (hlKey?: string, newKey?: string) =>
    Array.from(buckets.entries()).map(([k, list]) => ({
      key: k,
      value: `[${list.join(', ')}]`,
      highlighted: hlKey === k,
      isNew: newKey === k,
    }));

  const steps: TraceStep[] = [
    {
      stepIndex: 0,
      operation: {
        type: 'init',
        summary: 'Initialize signature-to-group HashMap',
        detail: 'Each word is mapped to its canonical anagram key so all anagrams collide into the same bucket.',
        highlightedIndices: [],
      },
      variables: [
        { name: 'words.length', value: String(words.length), role: 'state' },
        { name: 'groups', value: '0', role: 'result' },
      ],
      state: {
        array: words,
        hashMap: [],
        intermediateResult: '0 anagram groups created',
      },
      stateChangeSummary: 'Empty bucket HashMap created.',
      invariant,
    },
  ];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const sig = word.split('').sort().join('');
    const existed = buckets.has(sig);
    const list = buckets.get(sig) ?? [];
    list.push(word);
    buckets.set(sig, list);

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'insert',
        summary: `Map "${word}" → key "${sig}"`,
        detail: existed
          ? `Key "${sig}" already exists! Append "${word}" to existing bucket [${list.join(', ')}].`
          : `New canonical signature "${sig}". Create bucket ["${word}"].`,
        highlightedIndices: [i],
      },
      variables: [
        { name: 'i', value: String(i), changed: true, role: 'pointer' },
        { name: 'word', value: `"${word}"`, changed: true, role: 'state' },
        { name: 'signature', value: `"${sig}"`, changed: true, role: 'accumulator' },
        { name: 'bucketCount', value: String(buckets.size), changed: !existed, role: 'result' },
      ],
      state: {
        array: words,
        pointers: [{ name: 'i', index: i, color: 'sky' }],
        hashMap: mapSnap(sig, existed ? undefined : sig),
        intermediateResult: `${buckets.size} group(s)`,
      },
      stateChangeSummary: `buckets["${sig}"] = [${list.join(', ')}].`,
      invariant,
      checkpoint:
        i === 1
          ? {
              id: 'anagram-cp-1',
              prompt: `For "${word}", its canonical signature is "${sig}". Where should "${word}" be placed?`,
              options: [
                {
                  id: 'same-bucket',
                  label: existed ? `Append to existing "${sig}" bucket` : `Create a brand new "${sig}" bucket`,
                  isCorrect: true,
                  feedback: existed
                    ? `Correct! Because "${word}" has the exact same character multiset as earlier words with key "${sig}", they collide into one group.`
                    : `Correct! No previous word had signature "${sig}", so it opens a new bucket.`,
                },
                {
                  id: 'wrong-bucket',
                  label: existed ? 'Create a new bucket because string order differs' : 'Merge into the first existing bucket',
                  isCorrect: false,
                  feedback: 'Anagram equivalence depends only on character frequencies (canonical signature), not character positions.',
                },
              ],
            }
          : undefined,
    });
  }

  const finalGroups = Array.from(buckets.values())
    .map((g) => `[${g.join(', ')}]`)
    .join(', ');

  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return ${buckets.size} grouped anagram buckets`,
      detail: `Final groups: ${finalGroups}.`,
      highlightedIndices: [],
    },
    variables: [{ name: 'groupCount', value: String(buckets.size), role: 'result' }],
    state: {
      array: words,
      hashMap: mapSnap(),
      finalResult: `[${finalGroups}]`,
    },
    stateChangeSummary: `Returned all ${buckets.size} HashMap values.`,
    invariant,
  });

  return {
    id: 'trace-hashmap-group-anagrams',
    topicId: 'hashmap-hashset-lookup',
    title: 'Group Anagrams — Canonical Signature Bucketing',
    algorithmName: 'Canonical Key HashMap Grouping',
    description: 'Watch strings map to canonical keys so every anagram family lands in the same O(1) bucket.',
    primaryStructure: 'hashmap',
    defaultInputLabel: 'words = [eat, tea, tan, ate, nat, bat]',
    defaultInput: { words: words.join(', ') },
    inputSchema: [
      { key: 'words', label: 'Words', placeholder: 'eat, tea, tan, ate, nat, bat', helpText: '2 to 7 lowercase words' },
    ],
    invariantRule: invariant,
    steps,
  };
}

// ============================================================================
// 2. SLIDING WINDOW TRACES
// ============================================================================

export function generateLongestUniqueSubstringTrace(input: Record<string, string> = {}): LearningTrace {
  const s = parseCleanString(input.s ?? 'abcabcbb', 'abcabcbb', 14);
  const chars = s.split('');
  const lastSeen = new Map<string, number>();
  const invariant =
    'After each step, window [left..right] contains strictly unique characters (no duplicates), and left never moves backward.';

  const mapSnap = (hlChar?: string) =>
    Array.from(lastSeen.entries()).map(([k, v]) => ({
      key: `'${k}'`,
      value: `idx ${v}`,
      highlighted: hlChar === k,
    }));

  const steps: TraceStep[] = [
    {
      stepIndex: 0,
      operation: {
        type: 'init',
        summary: 'Initialize window left = 0 and empty lastSeen map',
        detail: `Scan "${s}" with right pointer. If s[right] appeared inside [left..right-1], jump left to lastSeen[ch] + 1.`,
        highlightedIndices: [],
      },
      variables: [
        { name: 'left', value: '0', role: 'pointer' },
        { name: 'right', value: '—', role: 'pointer' },
        { name: 'bestLen', value: '0', role: 'result' },
        { name: 'bestSub', value: '""', role: 'result' },
      ],
      state: {
        array: chars,
        pointers: [{ name: 'L', index: 0, color: 'amber' }],
        windowRange: null,
        hashMap: [],
        intermediateResult: 'best = 0',
      },
      stateChangeSummary: 'Window starts empty at index 0.',
      invariant,
    },
  ];

  let left = 0;
  let bestLen = 0;
  let bestStart = 0;
  let checkpointPlaced = false;

  for (let right = 0; right < chars.length; right++) {
    const ch = chars[right];
    const prevIdx = lastSeen.get(ch);
    const hasCollision = prevIdx !== undefined && prevIdx >= left;

    if (hasCollision) {
      const nextLeft = prevIdx + 1;
      const shouldCp = !checkpointPlaced;
      steps.push({
        stepIndex: steps.length,
        operation: {
          type: 'shrink',
          summary: `Duplicate '${ch}' detected inside window (prev at ${prevIdx})`,
          detail: `Because lastSeen['${ch}'] = ${prevIdx} >= left (${left}), shrink window by setting left = ${nextLeft}.`,
          highlightedIndices: [prevIdx, right],
        },
        variables: [
          { name: 'left', value: `${left} → ${nextLeft}`, changed: true, role: 'pointer' },
          { name: 'right', value: String(right), changed: true, role: 'pointer' },
          { name: 'char', value: `'${ch}'`, changed: true, role: 'state' },
          { name: 'bestLen', value: String(bestLen), role: 'result' },
        ],
        state: {
          array: chars,
          pointers: [
            { name: 'L', index: left, color: 'rose' },
            { name: 'R', index: right, color: 'sky' },
          ],
          windowRange: { left, right, valid: false },
          hashMap: mapSnap(ch),
          intermediateResult: `Duplicate '${ch}' violates uniqueness`,
        },
        stateChangeSummary: `Contracting left from ${left} to ${nextLeft} to expel duplicate '${ch}'.`,
        invariant,
        checkpoint: shouldCp
          ? {
              id: `sw-unique-cp-${right}`,
              prompt: `At right = ${right}, char '${ch}' already appeared at index ${prevIdx} (inside window [${left}..${right - 1}]). What should left become?`,
              options: [
                {
                  id: 'jump-prev-plus-1',
                  label: `Jump left to max(left, ${prevIdx} + 1) = ${nextLeft}`,
                  isCorrect: true,
                  feedback: `Correct! Jumping directly to ${nextLeft} restores uniqueness in O(1) while guaranteeing left never moves backward.`,
                },
                {
                  id: 'reset-to-right',
                  label: `Reset left = ${right} (discard entire prefix)`,
                  isCorrect: false,
                  feedback: `Too aggressive! Characters between ${nextLeft} and ${right - 1} are still unique and can form a longer valid substring.`,
                },
                {
                  id: 'keep-left',
                  label: `Keep left = ${left} and overwrite lastSeen['${ch}']`,
                  isCorrect: false,
                  feedback: `Keeping left = ${left} leaves two copies of '${ch}' inside the window, violating the uniqueness invariant.`,
                },
              ],
            }
          : undefined,
      });
      if (shouldCp) checkpointPlaced = true;
      left = nextLeft;
    }

    lastSeen.set(ch, right);
    const windowLen = right - left + 1;
    const improved = windowLen > bestLen;
    if (improved) {
      bestLen = windowLen;
      bestStart = left;
    }

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: improved ? 'update-best' : 'expand',
        summary: `Valid window [${left}..${right}] = "${s.slice(left, right + 1)}" (len ${windowLen})`,
        detail: improved
          ? `Recorded lastSeen['${ch}'] = ${right} and updated bestLen to ${bestLen} ("${s.slice(bestStart, bestStart + bestLen)}").`
          : `Recorded lastSeen['${ch}'] = ${right}. Window length ${windowLen} does not exceed bestLen (${bestLen}).`,
        highlightedIndices: Array.from({ length: windowLen }, (_, k) => left + k),
      },
      variables: [
        { name: 'left', value: String(left), role: 'pointer' },
        { name: 'right', value: String(right), changed: true, role: 'pointer' },
        { name: 'windowLen', value: String(windowLen), changed: true, role: 'accumulator' },
        { name: 'bestLen', value: String(bestLen), changed: improved, role: 'result' },
        { name: 'bestSub', value: `"${s.slice(bestStart, bestStart + bestLen)}"`, changed: improved, role: 'result' },
      ],
      state: {
        array: chars,
        pointers: [
          { name: 'L', index: left, color: 'amber' },
          { name: 'R', index: right, color: 'sky' },
        ],
        windowRange: { left, right, valid: true },
        hashMap: mapSnap(ch),
        intermediateResult: `Best so far: "${s.slice(bestStart, bestStart + bestLen)}" (length ${bestLen})`,
      },
      stateChangeSummary: `lastSeen['${ch}'] = ${right}; active window "${s.slice(left, right + 1)}".`,
      invariant,
    });
  }

  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return bestLen = ${bestLen} ("${s.slice(bestStart, bestStart + bestLen)}")`,
      detail: `Both left and right moved monotonically across ${chars.length} characters: O(n) time, O(min(n, alphabet)) space.`,
      highlightedIndices: Array.from({ length: bestLen }, (_, k) => bestStart + k),
    },
    variables: [
      { name: 'bestLen', value: String(bestLen), role: 'result' },
      { name: 'bestSub', value: `"${s.slice(bestStart, bestStart + bestLen)}"`, role: 'result' },
    ],
    state: {
      array: chars,
      pointers: bestLen > 0 ? [{ name: 'L', index: bestStart, color: 'emerald' }, { name: 'R', index: bestStart + bestLen - 1, color: 'emerald' }] : [],
      windowRange: bestLen > 0 ? { left: bestStart, right: bestStart + bestLen - 1, valid: true } : null,
      hashMap: mapSnap(),
      finalResult: `${bestLen} ("${s.slice(bestStart, bestStart + bestLen)}")`,
    },
    stateChangeSummary: `Finished with longest unique substring length ${bestLen}.`,
    invariant,
  });

  return {
    id: 'trace-sw-longest-unique',
    topicId: 'dynamic-sliding-window',
    title: 'Longest Substring Without Repeating Characters',
    algorithmName: 'Variable Sliding Window + Last-Seen Index Map',
    description: 'Observe monotonic window expansion and O(1) left-pointer jumps whenever a duplicate enters the active range.',
    primaryStructure: 'window',
    defaultInputLabel: 's = "abcabcbb"',
    defaultInput: { s },
    inputSchema: [
      { key: 's', label: 'Input String (s)', placeholder: 'abcabcbb', helpText: 'Up to 14 non-whitespace characters' },
    ],
    invariantRule: invariant,
    steps,
  };
}

export function generateFixedWindowMaxAvgTrace(input: Record<string, string> = {}): LearningTrace {
  const nums = parseIntArray(input.nums ?? '1, 12, -5, -6, 50, 3', [1, 12, -5, -6, 50, 3], 10);
  const k = Math.max(1, Math.min(nums.length, parseIntValue(input.k ?? '4', 4, 1, 10)));
  const invariant =
    'For every index right >= k - 1, windowSum equals the exact sum of the k contiguous elements [right - k + 1 .. right], updated in O(1).';

  const steps: TraceStep[] = [];
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i];
  let bestSum = windowSum;
  let bestStart = 0;

  steps.push({
    stepIndex: 0,
    operation: {
      type: 'init',
      summary: `Seed initial fixed window [0..${k - 1}]`,
      detail: `Sum of first ${k} elements is ${windowSum} (avg ${(windowSum / k).toFixed(2)}). Next slides add incoming and subtract outgoing in O(1).`,
      highlightedIndices: Array.from({ length: k }, (_, i) => i),
    },
    variables: [
      { name: 'k', value: String(k), role: 'state' },
      { name: 'windowSum', value: String(windowSum), changed: true, role: 'accumulator' },
      { name: 'bestAvg', value: (bestSum / k).toFixed(2), changed: true, role: 'result' },
    ],
    state: {
      array: nums,
      pointers: [
        { name: 'L', index: 0, color: 'amber' },
        { name: 'R', index: k - 1, color: 'sky' },
      ],
      windowRange: { left: 0, right: k - 1, valid: true },
      intermediateResult: `Initial sum = ${windowSum}, avg = ${(windowSum / k).toFixed(2)}`,
    },
    stateChangeSummary: `Seeded window [0..${k - 1}] with sum ${windowSum}.`,
    invariant,
  });

  for (let right = k; right < nums.length; right++) {
    const outgoing = nums[right - k];
    const incoming = nums[right];
    const nextSum = windowSum + incoming - outgoing;
    const left = right - k + 1;
    const improved = nextSum > bestSum;

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: improved ? 'update-best' : 'expand',
        summary: `Slide to [${left}..${right}]: +${incoming} - (${outgoing})`,
        detail: `windowSum = ${windowSum} + ${incoming} - (${outgoing}) = ${nextSum} (avg ${(nextSum / k).toFixed(2)}).`,
        highlightedIndices: Array.from({ length: k }, (_, idx) => left + idx),
      },
      variables: [
        { name: 'left', value: String(left), changed: true, role: 'pointer' },
        { name: 'right', value: String(right), changed: true, role: 'pointer' },
        { name: 'delta', value: `+${incoming} - (${outgoing})`, changed: true, role: 'accumulator' },
        { name: 'windowSum', value: String(nextSum), changed: true, role: 'accumulator' },
        { name: 'bestAvg', value: ((improved ? nextSum : bestSum) / k).toFixed(2), changed: improved, role: 'result' },
      ],
      state: {
        array: nums,
        pointers: [
          { name: 'L', index: left, color: 'amber' },
          { name: 'R', index: right, color: 'sky' },
        ],
        windowRange: { left, right, valid: true },
        intermediateResult: `Sum = ${nextSum}, best avg = ${((improved ? nextSum : bestSum) / k).toFixed(2)}`,
      },
      stateChangeSummary: `Window slid by 1: sum ${windowSum} → ${nextSum}.`,
      invariant,
      checkpoint:
        right === k
          ? {
              id: 'sw-fixed-cp-1',
              prompt: `Sliding the fixed window from [0..${k - 1}] to [1..${k}], how do we compute the new sum in O(1)?`,
              options: [
                {
                  id: 'delta',
                  label: `windowSum + nums[${right}] (${incoming}) - nums[${right - k}] (${outgoing}) = ${nextSum}`,
                  isCorrect: true,
                  feedback: 'Correct! Adding the incoming element and subtracting the outgoing element avoids re-summing all k elements.',
                },
                {
                  id: 'resum',
                  label: `Loop across indices 1..${k} to re-add all ${k} elements`,
                  isCorrect: false,
                  feedback: 'Re-summing every window costs O(n · k). The O(1) delta update reduces total time to O(n).',
                },
              ],
            }
          : undefined,
    });

    windowSum = nextSum;
    if (improved) {
      bestSum = nextSum;
      bestStart = left;
    }
  }

  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Maximum average = ${(bestSum / k).toFixed(2)} (sum ${bestSum})`,
      detail: `Best contiguous window of length ${k} is [${bestStart}..${bestStart + k - 1}].`,
      highlightedIndices: Array.from({ length: k }, (_, idx) => bestStart + idx),
    },
    variables: [
      { name: 'bestSum', value: String(bestSum), role: 'result' },
      { name: 'bestAvg', value: (bestSum / k).toFixed(2), role: 'result' },
    ],
    state: {
      array: nums,
      pointers: [
        { name: 'L', index: bestStart, color: 'emerald' },
        { name: 'R', index: bestStart + k - 1, color: 'emerald' },
      ],
      windowRange: { left: bestStart, right: bestStart + k - 1, valid: true },
      finalResult: `${(bestSum / k).toFixed(2)} (window [${bestStart}..${bestStart + k - 1}])`,
    },
    stateChangeSummary: `Completed with maximum k-window average ${(bestSum / k).toFixed(2)}.`,
    invariant,
  });

  return {
    id: 'trace-sw-fixed-avg',
    topicId: 'dynamic-sliding-window',
    title: 'Maximum Average Subarray I — Fixed-Size Window Delta',
    algorithmName: 'Fixed-Size Sliding Window',
    description: 'Eliminate repeated k-length summations by adding one incoming value and subtracting one outgoing value per slide.',
    primaryStructure: 'window',
    defaultInputLabel: 'nums = [1, 12, -5, -6, 50, 3], k = 4',
    defaultInput: { nums: nums.join(', '), k: String(k) },
    inputSchema: [
      { key: 'nums', label: 'Array (nums)', placeholder: '1, 12, -5, -6, 50, 3', helpText: 'Comma-separated integers' },
      { key: 'k', label: 'Window Size (k)', placeholder: '4', helpText: '1 <= k <= nums.length' },
    ],
    invariantRule: invariant,
    steps,
  };
}

export function generateMinSubarrayLenTrace(input: Record<string, string> = {}): LearningTrace {
  const nums = parseIntArray(input.nums ?? '2, 3, 1, 2, 4, 3', [2, 3, 1, 2, 4, 3], 10).map((n) => Math.max(1, Math.abs(n)));
  const target = parseIntValue(input.target ?? '7', 7, 1, 9999);
  const invariant =
    'Because all numbers are positive, expanding right monotonically increases sum and shrinking left monotonically decreases sum.';

  const steps: TraceStep[] = [
    {
      stepIndex: 0,
      operation: {
        type: 'init',
        summary: `Find shortest subarray with sum >= ${target}`,
        detail: 'Expand right until windowSum >= target, then greedily shrink left while the condition still holds.',
        highlightedIndices: [],
      },
      variables: [
        { name: 'target', value: String(target), role: 'state' },
        { name: 'left', value: '0', role: 'pointer' },
        { name: 'windowSum', value: '0', role: 'accumulator' },
        { name: 'minLen', value: '∞', role: 'result' },
      ],
      state: {
        array: nums,
        pointers: [{ name: 'L', index: 0, color: 'amber' }],
        windowRange: null,
        intermediateResult: 'minLen = ∞',
      },
      stateChangeSummary: 'Window initialized empty.',
      invariant,
    },
  ];

  let left = 0;
  let windowSum = 0;
  let minLen = Infinity;
  let bestRange: [number, number] | null = null;
  let cpDone = false;

  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'expand',
        summary: `Expand right to ${right} (+${nums[right]} → sum ${windowSum})`,
        detail:
          windowSum >= target
            ? `windowSum (${windowSum}) >= target (${target})! Enter shrink loop to minimize length.`
            : `windowSum (${windowSum}) < target (${target}). Keep expanding right.`,
        highlightedIndices: Array.from({ length: right - left + 1 }, (_, k) => left + k),
      },
      variables: [
        { name: 'left', value: String(left), role: 'pointer' },
        { name: 'right', value: String(right), changed: true, role: 'pointer' },
        { name: 'windowSum', value: String(windowSum), changed: true, role: 'accumulator' },
        { name: 'minLen', value: minLen === Infinity ? '∞' : String(minLen), role: 'result' },
      ],
      state: {
        array: nums,
        pointers: [
          { name: 'L', index: left, color: 'amber' },
          { name: 'R', index: right, color: 'sky' },
        ],
        windowRange: { left, right, valid: windowSum >= target },
        intermediateResult: `sum = ${windowSum} / target ${target}`,
      },
      stateChangeSummary: `Added nums[${right}] = ${nums[right]}; windowSum = ${windowSum}.`,
      invariant,
    });

    while (windowSum >= target) {
      const len = right - left + 1;
      if (len < minLen) {
        minLen = len;
        bestRange = [left, right];
      }
      const removing = nums[left];
      const nextSum = windowSum - removing;
      const shouldCp = !cpDone;

      steps.push({
        stepIndex: steps.length,
        operation: {
          type: 'shrink',
          summary: `Valid window [${left}..${right}] (len ${len}); shrink left (-${removing})`,
          detail: `Recorded minLen = ${minLen}. Subtract nums[${left}] = ${removing} → new sum ${nextSum}.`,
          highlightedIndices: Array.from({ length: len }, (_, k) => left + k),
        },
        variables: [
          { name: 'left', value: `${left} → ${left + 1}`, changed: true, role: 'pointer' },
          { name: 'right', value: String(right), role: 'pointer' },
          { name: 'windowSum', value: `${windowSum} → ${nextSum}`, changed: true, role: 'accumulator' },
          { name: 'minLen', value: String(minLen), changed: true, role: 'result' },
        ],
        state: {
          array: nums,
          pointers: [
            { name: 'L', index: left, color: 'emerald' },
            { name: 'R', index: right, color: 'sky' },
          ],
          windowRange: { left, right, valid: true },
          intermediateResult: `Best valid length = ${minLen}`,
        },
        stateChangeSummary: `Updated minLen = ${minLen}, removed nums[${left}] (${removing}).`,
        invariant,
        checkpoint: shouldCp
          ? {
              id: `sw-minlen-cp-${right}-${left}`,
              prompt: `Window [${left}..${right}] satisfies sum ${windowSum} >= ${target}. Why is it safe to shrink left permanently?`,
              options: [
                {
                  id: 'monotonic',
                  label: 'All values are positive, so any later window starting at left can only be longer',
                  isCorrect: true,
                  feedback: 'Correct! Positivity gives monotonicity: extending right from this left would only increase length, so we never need left again.',
                },
                {
                  id: 'works-negatives',
                  label: 'Sliding window always works even when the array contains negative numbers',
                  isCorrect: false,
                  feedback: 'False! With negative numbers, shrinking left can actually increase the sum, breaking monotonicity (use Prefix Sum + Monotonic Deque instead).',
                },
              ],
            }
          : undefined,
      });

      if (shouldCp) cpDone = true;
      windowSum = nextSum;
      left += 1;
    }
  }

  const finalLen = minLen === Infinity ? 0 : minLen;
  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return shortest valid length = ${finalLen}`,
      detail: bestRange
        ? `Optimal minimal subarray is [${bestRange[0]}..${bestRange[1]}] = [${nums.slice(bestRange[0], bestRange[1] + 1).join(', ')}].`
        : `No contiguous subarray reached target sum ${target}.`,
      highlightedIndices: bestRange ? Array.from({ length: bestRange[1] - bestRange[0] + 1 }, (_, k) => bestRange![0] + k) : [],
    },
    variables: [{ name: 'minLen', value: String(finalLen), role: 'result' }],
    state: {
      array: nums,
      pointers: bestRange
        ? [
            { name: 'L', index: bestRange[0], color: 'emerald' },
            { name: 'R', index: bestRange[1], color: 'emerald' },
          ]
        : [],
      windowRange: bestRange ? { left: bestRange[0], right: bestRange[1], valid: true } : null,
      finalResult: String(finalLen),
    },
    stateChangeSummary: `Completed with minimal subarray length ${finalLen}.`,
    invariant,
  });

  return {
    id: 'trace-sw-min-subarray',
    topicId: 'dynamic-sliding-window',
    title: 'Minimum Size Subarray Sum — Expand & Shrink Monotonicity',
    algorithmName: 'Shrink-While-Valid Sliding Window',
    description: 'Practice the expand-until-valid / shrink-while-valid pattern and understand why positive elements are required.',
    primaryStructure: 'window',
    defaultInputLabel: 'nums = [2, 3, 1, 2, 4, 3], target = 7',
    defaultInput: { nums: nums.join(', '), target: String(target) },
    inputSchema: [
      { key: 'nums', label: 'Positive Integers (nums)', placeholder: '2, 3, 1, 2, 4, 3', helpText: 'Positive integers only' },
      { key: 'target', label: 'Target Sum', placeholder: '7', helpText: 'Positive target sum' },
    ],
    invariantRule: invariant,
    steps,
  };
}

// ============================================================================
// 3. DYNAMIC PROGRAMMING TRACES
// ============================================================================

export function generateCoinChangeTrace(input: Record<string, string> = {}): LearningTrace {
  const coins = parseIntArray(input.coins ?? '1, 3, 4', [1, 3, 4], 5)
    .map((c) => Math.max(1, Math.abs(c)))
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .sort((a, b) => a - b);
  const amount = parseIntValue(input.amount ?? '6', 6, 1, 12);
  const INF = amount + 1;
  const dp = Array(amount + 1).fill(INF);
  dp[0] = 0;

  const invariant =
    'After solving subproblem a, dp[a] stores the exact minimum number of coins required to make amount a (or ∞ if unreachable).';

  const dpSnap = (current?: number, deps: number[] = [], answerIdx?: number) =>
    dp.map((val, idx) => ({
      index: idx,
      label: `amt ${idx}`,
      value: val >= INF ? '∞' : String(val),
      role:
        answerIdx === idx
          ? ('answer' as const)
          : current === idx
            ? ('current' as const)
            : deps.includes(idx)
              ? ('dependency' as const)
              : undefined,
    }));

  const steps: TraceStep[] = [
    {
      stepIndex: 0,
      operation: {
        type: 'init',
        summary: `Initialize DP table dp[0..${amount}] with base case dp[0] = 0`,
        detail: `Coins = [${coins.join(', ')}]. Every amount > 0 starts as ∞ (unreachable) until improved via transition dp[a] = min(dp[a], 1 + dp[a - coin]).`,
      },
      variables: [
        { name: 'coins', value: `[${coins.join(', ')}]`, role: 'state' },
        { name: 'amount', value: String(amount), role: 'state' },
        { name: 'dp[0]', value: '0', changed: true, role: 'state' },
      ],
      state: {
        dp1d: dpSnap(0),
        intermediateResult: 'Base case dp[0] = 0 set',
      },
      stateChangeSummary: `dp[0] = 0, dp[1..${amount}] = ∞.`,
      invariant,
    },
  ];

  let cpDone = false;

  for (let a = 1; a <= amount; a++) {
    const validCoins = coins.filter((c) => c <= a);
    const candidates = validCoins.map((c) => ({
      coin: c,
      prev: a - c,
      cost: dp[a - c] >= INF ? INF : 1 + dp[a - c],
    }));

    let bestCost = INF;
    let bestCoin: number | null = null;
    for (const cand of candidates) {
      if (cand.cost < bestCost) {
        bestCost = cand.cost;
        bestCoin = cand.coin;
      }
    }

    const shouldCp = !cpDone && a === amount && candidates.length >= 2;
    const prevDeps = candidates.map((c) => c.prev);
    const prevValueBefore = dp[a];
    dp[a] = bestCost;

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'transition',
        summary: `Solve subproblem dp[${a}] = ${bestCost >= INF ? '∞' : bestCost}`,
        detail:
          candidates.length > 0
            ? `Evaluated ${candidates
                .map((c) => `coin ${c.coin}: 1 + dp[${c.prev}] (${dp[c.prev] >= INF ? '∞' : dp[c.prev]}) = ${c.cost >= INF ? '∞' : c.cost}`)
                .join(' | ')}. Minimum is ${bestCost >= INF ? '∞' : bestCost}${bestCoin !== null ? ` via coin ${bestCoin}` : ''}.`
            : `No coin <= ${a}, so dp[${a}] remains ∞.`,
      },
      variables: [
        { name: 'a', value: String(a), changed: true, role: 'pointer' },
        { name: 'bestCoin', value: bestCoin !== null ? String(bestCoin) : 'none', changed: true, role: 'accumulator' },
        { name: `dp[${a}]`, value: bestCost >= INF ? '∞' : String(bestCost), changed: bestCost !== prevValueBefore, role: 'result' },
      ],
      state: {
        dp1d: dpSnap(a, prevDeps),
        intermediateResult: `dp[${a}] = ${bestCost >= INF ? '∞' : bestCost}`,
      },
      stateChangeSummary: `dp[${a}] updated from ∞ to ${bestCost >= INF ? '∞' : bestCost}.`,
      invariant,
      checkpoint: shouldCp
        ? {
            id: `dp-coin-cp-${a}`,
            prompt: `To compute dp[${a}] using coins [${coins.join(', ')}], why does greedy (always taking the largest coin) fail on coins [1, 3, 4] for amount 6?`,
            options: [
              {
                id: 'greedy-fails',
                label: 'Greedy picks 4 + 1 + 1 (3 coins), while DP compares all choices and finds 3 + 3 (2 coins)',
                isCorrect: true,
                feedback: 'Correct! Coin Change lacks the greedy-choice property for arbitrary denominations; DP checks every coin transition.',
              },
              {
                id: 'greedy-works',
                label: 'Greedy always produces the exact same minimum count as DP',
                isCorrect: false,
                feedback: 'Only canonical coin systems satisfy greedy. For [1, 3, 4] and amount 6, greedy gives 3 coins instead of the optimal 2.',
              },
            ],
          }
        : undefined,
    });
    if (shouldCp) cpDone = true;
  }

  const answer = dp[amount] >= INF ? -1 : dp[amount];
  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return ${answer} ${answer === -1 ? '(unreachable)' : 'minimum coin(s)'}`,
      detail: `Final answer read directly from dp[${amount}] after O(amount × coins.length) transitions.`,
    },
    variables: [{ name: 'answer', value: String(answer), role: 'result' }],
    state: {
      dp1d: dpSnap(undefined, [], amount),
      finalResult: String(answer),
    },
    stateChangeSummary: `Completed DP table; answer = ${answer}.`,
    invariant,
  });

  return {
    id: 'trace-dp-coin-change',
    topicId: 'dynamic-programming',
    title: 'Coin Change — Bottom-Up 1D DP Table',
    algorithmName: 'Unbounded Knapsack / Bottom-Up 1D DP',
    description: 'Watch every subproblem amount build monotonically from optimal smaller amounts, and see why greedy fails on [1, 3, 4].',
    primaryStructure: 'dp-1d',
    defaultInputLabel: 'coins = [1, 3, 4], amount = 6',
    defaultInput: { coins: coins.join(', '), amount: String(amount) },
    inputSchema: [
      { key: 'coins', label: 'Coins', placeholder: '1, 3, 4', helpText: 'Up to 5 positive coin values' },
      { key: 'amount', label: 'Target Amount', placeholder: '6', helpText: 'Integer between 1 and 12' },
    ],
    invariantRule: invariant,
    steps,
  };
}

export function generateHouseRobberTrace(input: Record<string, string> = {}): LearningTrace {
  const nums = parseIntArray(input.nums ?? '2, 7, 9, 3, 1', [2, 7, 9, 3, 1], 10).map((n) => Math.max(0, n));
  const dp: number[] = Array(nums.length).fill(0);
  const invariant =
    'dp[i] equals the maximum value achievable from houses [0..i] without ever taking two adjacent indices.';

  const dpSnap = (current?: number, deps: number[] = [], answerIdx?: number) =>
    dp.map((val, idx) => ({
      index: idx,
      label: `H${idx} ($${nums[idx]})`,
      value: idx <= (current ?? nums.length) ? String(val) : '—',
      role:
        answerIdx === idx
          ? ('answer' as const)
          : current === idx
            ? ('current' as const)
            : deps.includes(idx)
              ? ('dependency' as const)
              : undefined,
    }));

  const steps: TraceStep[] = [
    {
      stepIndex: 0,
      operation: {
        type: 'init',
        summary: 'Define recurrence dp[i] = max(dp[i-1], dp[i-2] + nums[i])',
        detail: 'At each house i we choose the better of skipping house i (keep dp[i-1]) or robbing house i (dp[i-2] + nums[i]).',
      },
      variables: [
        { name: 'houses', value: `[${nums.join(', ')}]`, role: 'state' },
        { name: 'dp[0]', value: String(nums[0]), role: 'state' },
      ],
      state: {
        array: nums,
        dp1d: dp.map((_, idx) => ({ index: idx, label: `H${idx} ($${nums[idx]})`, value: '—' })),
        intermediateResult: 'Ready to compute recurrence',
      },
      stateChangeSummary: 'Prepared DP array of length ' + nums.length + '.',
      invariant,
    },
  ];

  for (let i = 0; i < nums.length; i++) {
    if (i === 0) {
      dp[0] = nums[0];
    } else if (i === 1) {
      dp[1] = Math.max(nums[0], nums[1]);
    } else {
      dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    }

    const skipVal = i > 0 ? dp[i - 1] : 0;
    const takeVal = (i > 1 ? dp[i - 2] : 0) + nums[i];
    const took = i === 0 || takeVal >= skipVal;

    steps.push({
      stepIndex: steps.length,
      operation: {
        type: 'transition',
        summary: `dp[${i}] = ${dp[i]} (${took ? `rob house ${i}` : `skip house ${i}`})`,
        detail:
          i === 0
            ? `Base case: only house 0 available → dp[0] = ${nums[0]}.`
            : i === 1
              ? `Base case: max(nums[0]=${nums[0]}, nums[1]=${nums[1]}) = ${dp[1]}.`
              : `Skip gives dp[${i - 1}] = ${skipVal}; Rob gives dp[${i - 2}] + ${nums[i]} = ${takeVal}. Max = ${dp[i]}.`,
        highlightedIndices: [i],
      },
      variables: [
        { name: 'i', value: String(i), changed: true, role: 'pointer' },
        { name: 'skip (dp[i-1])', value: i > 0 ? String(skipVal) : '0', role: 'accumulator' },
        { name: 'rob (dp[i-2]+v)', value: String(takeVal), changed: true, role: 'accumulator' },
        { name: `dp[${i}]`, value: String(dp[i]), changed: true, role: 'result' },
      ],
      state: {
        array: nums,
        pointers: [{ name: 'i', index: i, color: 'sky' }],
        dp1d: dpSnap(i, i >= 2 ? [i - 1, i - 2] : i === 1 ? [0] : []),
        intermediateResult: `Best through house ${i} = ${dp[i]}`,
      },
      stateChangeSummary: `dp[${i}] set to ${dp[i]}.`,
      invariant,
      checkpoint:
        i === 2
          ? {
              id: 'dp-robber-cp-2',
              prompt: `At house 2 (value ${nums[2]}), which two previous states determine dp[2]?`,
              options: [
                {
                  id: 'prev-two',
                  label: `dp[1] (${dp[1]}) if skipping, or dp[0] + nums[2] (${dp[0] + nums[2]}) if robbing`,
                  isCorrect: true,
                  feedback: 'Correct! Because dp[i] depends only on dp[i-1] and dp[i-2], we can even compress space to O(1) with two variables.',
                },
                {
                  id: 'all-prev',
                  label: 'Every index from 0 to i - 1 must be re-scanned in an inner loop',
                  isCorrect: false,
                  feedback: 'Since dp[i-1] already represents the best non-adjacent prefix up to i-1, looking back only 2 steps is sufficient.',
                },
              ],
            }
          : undefined,
    });
  }

  const finalAns = dp[nums.length - 1];
  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return maximum loot = ${finalAns}`,
      detail: `Solved in O(n) time; notice space compresses to O(1) using only prev2 and prev1.`,
    },
    variables: [{ name: 'answer', value: String(finalAns), role: 'result' }],
    state: {
      array: nums,
      dp1d: dpSnap(undefined, [], nums.length - 1),
      finalResult: String(finalAns),
    },
    stateChangeSummary: `Final optimal value = ${finalAns}.`,
    invariant,
  });

  return {
    id: 'trace-dp-house-robber',
    topicId: 'dynamic-programming',
    title: 'House Robber — Take vs. Skip 1D Recurrence',
    algorithmName: 'Linear Take-or-Skip Dynamic Programming',
    description: 'Visualize how local take/skip decisions depend only on the previous two states, unlocking O(1) space optimization.',
    primaryStructure: 'dp-1d',
    defaultInputLabel: 'nums = [2, 7, 9, 3, 1]',
    defaultInput: { nums: nums.join(', ') },
    inputSchema: [
      { key: 'nums', label: 'House Values (nums)', placeholder: '2, 7, 9, 3, 1', helpText: 'Non-negative integers' },
    ],
    invariantRule: invariant,
    steps,
  };
}

export function generateLcs2dTrace(input: Record<string, string> = {}): LearningTrace {
  const text1 = parseCleanString(input.text1 ?? 'abcde', 'abcde', 6);
  const text2 = parseCleanString(input.text2 ?? 'ace', 'ace', 6);
  const m = text1.length;
  const n = text2.length;
  const grid: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const rowHeaders = ['""', ...text1.split('')];
  const colHeaders = ['""', ...text2.split('')];
  const invariant =
    'dp[r][c] stores the exact Longest Common Subsequence length between prefixes text1[0..r-1] and text2[0..c-1].';

  const cloneGrid = () => grid.map((row) => [...row]);

  const steps: TraceStep[] = [
    {
      stepIndex: 0,
      operation: {
        type: 'init',
        summary: `Initialize (${m + 1} × ${n + 1}) 2D DP table with 0 base borders`,
        detail: 'Row 0 and Col 0 represent empty prefixes, whose LCS with any string is 0.',
      },
      variables: [
        { name: 'text1', value: `"${text1}"`, role: 'state' },
        { name: 'text2', value: `"${text2}"`, role: 'state' },
      ],
      state: {
        dp2d: { rowHeaders, colHeaders, grid: cloneGrid(), highlights: [] },
        intermediateResult: 'Base borders = 0',
      },
      stateChangeSummary: '2D DP grid initialized with zeroed row 0 and col 0.',
      invariant,
    },
  ];

  let cpDone = false;
  for (let r = 1; r <= m; r++) {
    for (let c = 1; c <= n; c++) {
      const ch1 = text1[r - 1];
      const ch2 = text2[c - 1];
      const match = ch1 === ch2;
      if (match) {
        grid[r][c] = grid[r - 1][c - 1] + 1;
      } else {
        grid[r][c] = Math.max(grid[r - 1][c], grid[r][c - 1]);
      }

      const shouldCp = !cpDone && match && r > 1;
      steps.push({
        stepIndex: steps.length,
        operation: {
          type: 'transition',
          summary: match
            ? `Match '${ch1}' == '${ch2}': dp[${r}][${c}] = 1 + dp[${r - 1}][${c - 1}] = ${grid[r][c]}`
            : `Mismatch '${ch1}' != '${ch2}': dp[${r}][${c}] = max(${grid[r - 1][c]}, ${grid[r][c - 1]}) = ${grid[r][c]}`,
          detail: match
            ? `Characters match! Extend the diagonal prefix LCS by 1.`
            : `Characters differ: inherit the better LCS from dropping either '${ch1}' (top) or '${ch2}' (left).`,
        },
        variables: [
          { name: '(r, c)', value: `(${r}, ${c})`, changed: true, role: 'pointer' },
          { name: 'compare', value: `'${ch1}' vs '${ch2}'`, changed: true, role: 'state' },
          { name: `dp[${r}][${c}]`, value: String(grid[r][c]), changed: true, role: 'result' },
        ],
        state: {
          dp2d: {
            rowHeaders,
            colHeaders,
            grid: cloneGrid(),
            highlights: match
              ? [
                  { row: r - 1, col: c - 1, role: 'dependency' },
                  { row: r, col: c, role: 'current' },
                ]
              : [
                  { row: r - 1, col: c, role: 'dependency' },
                  { row: r, col: c - 1, role: 'dependency' },
                  { row: r, col: c, role: 'current' },
                ],
          },
          intermediateResult: `dp[${r}][${c}] = ${grid[r][c]}`,
        },
        stateChangeSummary: `Filled cell (${r}, ${c}) = ${grid[r][c]}.`,
        invariant,
        checkpoint: shouldCp
          ? {
              id: `dp-lcs-cp-${r}-${c}`,
              prompt: `At (${r}, ${c}), text1[${r - 1}] == text2[${c - 1}] == '${ch1}'. Which dependency cell do we read?`,
              options: [
                {
                  id: 'diag',
                  label: `Diagonal dp[${r - 1}][${c - 1}] + 1 = ${grid[r][c]}`,
                  isCorrect: true,
                  feedback: 'Correct! Consuming both matching characters reduces both prefixes by 1, pointing to the top-left diagonal cell.',
                },
                {
                  id: 'top-left',
                  label: `max(dp[${r - 1}][${c}], dp[${r}][${c - 1}]) + 1`,
                  isCorrect: false,
                  feedback: `Adding 1 to top or left risks double-counting '${ch1}' if it was already matched in one of those prefixes.`,
                },
              ],
            }
          : undefined,
      });
      if (shouldCp) cpDone = true;
    }
  }

  const finalLcs = grid[m][n];
  steps.push({
    stepIndex: steps.length,
    operation: {
      type: 'complete',
      summary: `Return LCS length = ${finalLcs}`,
      detail: `Final answer is dp[${m}][${n}] = ${finalLcs}. Computed in O(m × n) time.`,
    },
    variables: [{ name: 'LCS', value: String(finalLcs), role: 'result' }],
    state: {
      dp2d: {
        rowHeaders,
        colHeaders,
        grid: cloneGrid(),
        highlights: [{ row: m, col: n, role: 'answer' }],
      },
      finalResult: String(finalLcs),
    },
    stateChangeSummary: `2D DP table complete; LCS("${text1}", "${text2}") = ${finalLcs}.`,
    invariant,
  });

  return {
    id: 'trace-dp-lcs-2d',
    topicId: 'dynamic-programming',
    title: 'Longest Common Subsequence — 2D Prefix Table',
    algorithmName: '2D Sequence Alignment DP',
    description: 'Inspect diagonal match transitions vs. top/left skip transitions on a live 2D DP table.',
    primaryStructure: 'dp-2d',
    defaultInputLabel: 'text1 = "abcde", text2 = "ace"',
    defaultInput: { text1, text2 },
    inputSchema: [
      { key: 'text1', label: 'String 1 (text1)', placeholder: 'abcde', helpText: 'Up to 6 characters' },
      { key: 'text2', label: 'String 2 (text2)', placeholder: 'ace', helpText: 'Up to 6 characters' },
    ],
    invariantRule: invariant,
    steps,
  };
}

// ============================================================================
// Trace Registry & Dispatcher
// ============================================================================

export type TraceGenerator = (input?: Record<string, string>) => LearningTrace;

export const TRACE_REGISTRY: Record<string, TraceGenerator> = {
  'trace-hashmap-two-sum': generateTwoSumTrace,
  'trace-hashmap-longest-consecutive': generateLongestConsecutiveTrace,
  'trace-hashmap-group-anagrams': generateGroupAnagramsTrace,
  'trace-sw-longest-unique': generateLongestUniqueSubstringTrace,
  'trace-sw-fixed-avg': generateFixedWindowMaxAvgTrace,
  'trace-sw-min-subarray': generateMinSubarrayLenTrace,
  'trace-dp-coin-change': generateCoinChangeTrace,
  'trace-dp-house-robber': generateHouseRobberTrace,
  'trace-dp-lcs-2d': generateLcs2dTrace,
};

export function buildLearningTrace(
  traceId: string,
  customInput?: Record<string, string>
): LearningTrace | null {
  const generator = TRACE_REGISTRY[traceId];
  if (!generator) return null;
  return generator(customInput);
}
