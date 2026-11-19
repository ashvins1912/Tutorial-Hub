import type { CognitiveDomain } from '../knowledge-base/types';

// ============================================================================
// 1. ARRAY / POINTER / N-GRAM VISUALIZER STEP TRACES
// ============================================================================

export type ArrayTracePresetId =
  | 'sliding-window'
  | 'ngram-fuzzy'
  | 'two-pointers'
  | 'binary-search';

export interface PostingListHit {
  docId: string;
  label: string;
  matchedGrams: number;
  editDist?: number;
  confidence?: number;
  pruned?: boolean;
}

export interface ArrayPointerStep {
  stepIndex: number;
  title: string;
  explanation: string;
  cells: string[];
  left?: number;
  right?: number;
  mid?: number;
  windowRange?: [number, number];
  highlightIndices?: number[];
  hashMap: { key: string; value: string; active?: boolean }[];
  postingHits?: PostingListHit[];
  activeCodeLine: number;
  metrics: { label: string; value: string }[];
}

export interface ArrayPointerTrace {
  id: ArrayTracePresetId;
  title: string;
  subtitle: string;
  codeLines: string[];
  steps: ArrayPointerStep[];
}

export function generateArrayPointerTrace(preset: ArrayTracePresetId): ArrayPointerTrace {
  if (preset === 'ngram-fuzzy') {
    const padded = ['␣', '␣', 'i', 'p', 'h', 'n', 'e', '␣', '␣'];
    const codeLines = [
      'const padded = "  " + query.toLowerCase() + "  ";',
      'for (let i = 0; i <= padded.length - 3; i++) {',
      '  const tri = padded.slice(i, i + 3);',
      '  for (const docId of invertedIndex.get(tri) ?? []) hits[docId]++;',
      '}',
      'const cands = pruneByLengthAndOverlap(hits, minOverlap = 2);',
      'return rerankWithDamerauAndJaroWinkler(query, cands);',
    ];

    const steps: ArrayPointerStep[] = [
      {
        stepIndex: 0,
        title: 'Boundary Padding ("  iphne  ")',
        explanation: 'Pad query with 2 boundary spaces so typos at the start or end ("iphne" missing "o") retain high trigram overlap.',
        cells: padded,
        left: 0,
        right: 2,
        windowRange: [0, 2],
        hashMap: [{ key: 'tri[0]', value: '"  i"', active: true }],
        postingHits: [
          { docId: 'D1', label: 'iPhone 15', matchedGrams: 1 },
          { docId: 'D2', label: 'iPhone 14', matchedGrams: 1 },
          { docId: 'D3', label: 'iPad Pro', matchedGrams: 1 },
          { docId: 'D4', label: 'Phone Case', matchedGrams: 0 },
        ],
        activeCodeLine: 0,
        metrics: [
          { label: 'Stage', value: '1 · Tokenize' },
          { label: 'Window', value: '[0..2]' },
          { label: 'Hits', value: '3 docs' },
        ],
      },
      {
        stepIndex: 1,
        title: 'Slide Trigram Window -> " ip"',
        explanation: 'Extract trigram " ip" and merge its posting list [D1, D2, D3] into the accumulator map.',
        cells: padded,
        left: 1,
        right: 3,
        windowRange: [1, 3],
        hashMap: [
          { key: 'tri[0]', value: '"  i"' },
          { key: 'tri[1]', value: '" ip"', active: true },
        ],
        postingHits: [
          { docId: 'D1', label: 'iPhone 15', matchedGrams: 2 },
          { docId: 'D2', label: 'iPhone 14', matchedGrams: 2 },
          { docId: 'D3', label: 'iPad Pro', matchedGrams: 2 },
          { docId: 'D4', label: 'Phone Case', matchedGrams: 0 },
        ],
        activeCodeLine: 3,
        metrics: [
          { label: 'Stage', value: '1 · Postings' },
          { label: 'Window', value: '[1..3]' },
          { label: 'Top Count', value: '2' },
        ],
      },
      {
        stepIndex: 2,
        title: 'Slide Trigram Window -> "iph"',
        explanation: 'Trigram "iph" exclusively hits iPhone candidates [D1, D2], separating them from "iPad Pro".',
        cells: padded,
        left: 2,
        right: 4,
        windowRange: [2, 4],
        hashMap: [
          { key: 'tri[1]', value: '" ip"' },
          { key: 'tri[2]', value: '"iph"', active: true },
        ],
        postingHits: [
          { docId: 'D1', label: 'iPhone 15', matchedGrams: 3 },
          { docId: 'D2', label: 'iPhone 14', matchedGrams: 3 },
          { docId: 'D3', label: 'iPad Pro', matchedGrams: 2 },
          { docId: 'D4', label: 'Phone Case', matchedGrams: 0 },
        ],
        activeCodeLine: 3,
        metrics: [
          { label: 'Stage', value: '1 · Postings' },
          { label: 'Window', value: '[2..4]' },
          { label: 'Top Count', value: '3' },
        ],
      },
      {
        stepIndex: 3,
        title: 'Typo Bridge Trigrams ("phn", "hne", "ne ")',
        explanation: '"phn" misses because of the deleted "o", while trailing "ne " still matches "iPhone" and "Phone Case" via boundary overlap.',
        cells: padded,
        left: 5,
        right: 7,
        windowRange: [5, 7],
        hashMap: [
          { key: 'tri[3]', value: '"phn" (miss)' },
          { key: 'tri[4]', value: '"hne" (miss)' },
          { key: 'tri[5]', value: '"ne "', active: true },
        ],
        postingHits: [
          { docId: 'D1', label: 'iPhone 15', matchedGrams: 4 },
          { docId: 'D2', label: 'iPhone 14', matchedGrams: 4 },
          { docId: 'D3', label: 'iPad Pro', matchedGrams: 2 },
          { docId: 'D4', label: 'Phone Case', matchedGrams: 1 },
        ],
        activeCodeLine: 3,
        metrics: [
          { label: 'Stage', value: '1 · Postings' },
          { label: 'Window', value: '[5..7]' },
          { label: 'Top Count', value: '4' },
        ],
      },
      {
        stepIndex: 4,
        title: 'Stage 1 Length & Overlap Count Pruning',
        explanation: 'Prune candidates below minOverlap >= 3 or outside length tolerance. "iPad Pro" and "Phone Case" are eliminated before expensive DP!',
        cells: padded,
        windowRange: [0, 8],
        hashMap: [
          { key: 'minOverlap', value: '>= 3', active: true },
          { key: 'survivors', value: '2 / 4 docs', active: true },
        ],
        postingHits: [
          { docId: 'D1', label: 'iPhone 15', matchedGrams: 4, pruned: false },
          { docId: 'D2', label: 'iPhone 14', matchedGrams: 4, pruned: false },
          { docId: 'D3', label: 'iPad Pro', matchedGrams: 2, pruned: true },
          { docId: 'D4', label: 'Phone Case', matchedGrams: 1, pruned: true },
        ],
        activeCodeLine: 5,
        metrics: [
          { label: 'Stage', value: '1 · Prune' },
          { label: 'Pruned', value: '50%' },
          { label: 'Latency', value: '1.2 ms' },
        ],
      },
      {
        stepIndex: 5,
        title: 'Stage 2 Confident Reranking (Edit Dist + Jaro-Winkler)',
        explanation: 'Run Damerau-Levenshtein (editDist=1 on prefix "iphone") + Jaro-Winkler prefix boost on survivors only to emit calibrated confidence scores.',
        cells: padded,
        highlightIndices: [2, 3, 4, 5, 6],
        hashMap: [
          { key: 'editDist', value: '1 (insert "o")', active: true },
          { key: 'jaroWinkler', value: '0.94', active: true },
        ],
        postingHits: [
          { docId: 'D1', label: 'iPhone 15', matchedGrams: 4, editDist: 1, confidence: 0.93 },
          { docId: 'D2', label: 'iPhone 14', matchedGrams: 4, editDist: 1, confidence: 0.91 },
          { docId: 'D3', label: 'iPad Pro', matchedGrams: 2, pruned: true },
          { docId: 'D4', label: 'Phone Case', matchedGrams: 1, pruned: true },
        ],
        activeCodeLine: 6,
        metrics: [
          { label: 'Stage', value: '2 · Rerank' },
          { label: 'Top Conf', value: '93%' },
          { label: 'Total', value: '2.1 ms' },
        ],
      },
    ];

    return {
      id: 'ngram-fuzzy',
      title: 'Two-Stage N-Gram Fuzzy Search Trace',
      subtitle: 'Query "iphne" -> Padded Trigram Sliding Window + Inverted Index Pruning + Rerank',
      codeLines,
      steps,
    };
  }

  if (preset === 'two-pointers') {
    const arr = [1, 8, 6, 2, 5, 4, 8, 3, 7];
    const cells = arr.map(String);
    const codeLines = [
      'let left = 0, right = h.length - 1, best = 0;',
      'while (left < right) {',
      '  const area = Math.min(h[left], h[right]) * (right - left);',
      '  best = Math.max(best, area);',
      '  if (h[left] < h[right]) left++;',
      '  else right--;',
      '}',
    ];
    const steps: ArrayPointerStep[] = [];
    let l = 0;
    let r = arr.length - 1;
    let best = 0;
    let idx = 0;
    while (l < r && idx < 8) {
      const area = Math.min(arr[l], arr[r]) * (r - l);
      const improved = area > best;
      best = Math.max(best, area);
      const moveLeft = arr[l] < arr[r];
      steps.push({
        stepIndex: idx++,
        title: `Compare h[${l}]=${arr[l]} vs h[${r}]=${arr[r]}`,
        explanation: `Width = ${r - l}, limiting wall = ${Math.min(arr[l], arr[r])}, area = ${area}${improved ? ' (new best!)' : ''}. Advance shorter wall (${moveLeft ? 'left++' : 'right--'}).`,
        cells,
        left: l,
        right: r,
        windowRange: [l, r],
        highlightIndices: [l, r],
        hashMap: [
          { key: 'area', value: String(area), active: improved },
          { key: 'best', value: String(best), active: true },
          { key: 'move', value: moveLeft ? 'left++' : 'right--' },
        ],
        activeCodeLine: moveLeft ? 4 : 5,
        metrics: [
          { label: 'Width', value: String(r - l) },
          { label: 'Area', value: String(area) },
          { label: 'Best', value: String(best) },
        ],
      });
      if (moveLeft) l++;
      else r--;
    }
    return {
      id: 'two-pointers',
      title: 'Two Pointers: Container With Most Water',
      subtitle: 'Converging pointers eliminate dominated widths in O(N) time and O(1) space',
      codeLines,
      steps,
    };
  }

  if (preset === 'binary-search') {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72];
    const target = 23;
    const cells = arr.map(String);
    const codeLines = [
      'let left = 0, right = nums.length - 1;',
      'while (left <= right) {',
      '  const mid = left + Math.floor((right - left) / 2);',
      '  if (nums[mid] === target) return mid;',
      '  if (nums[mid] < target) left = mid + 1;',
      '  else right = mid - 1;',
      '}',
    ];
    const steps: ArrayPointerStep[] = [];
    let l = 0;
    let r = arr.length - 1;
    let stepIdx = 0;
    while (l <= r) {
      const m = l + Math.floor((r - l) / 2);
      const found = arr[m] === target;
      const goRight = arr[m] < target;
      steps.push({
        stepIndex: stepIdx++,
        title: found ? `Target ${target} Found at Index ${m}` : `Probe mid=${m} (value ${arr[m]})`,
        explanation: found
          ? `nums[${m}] === ${target}. Halving converged in ${stepIdx} probes instead of linear scan.`
          : goRight
            ? `${arr[m]} < ${target}, so the entire left half [${l}..${m}] is discarded (left = ${m + 1}).`
            : `${arr[m]} > ${target}, so the entire right half [${m}..${r}] is discarded (right = ${m - 1}).`,
        cells,
        left: l,
        mid: m,
        right: r,
        windowRange: [l, r],
        highlightIndices: [m],
        hashMap: [
          { key: 'target', value: String(target) },
          { key: 'nums[mid]', value: String(arr[m]), active: true },
          { key: 'remaining', value: `${r - l + 1} cells` },
        ],
        activeCodeLine: found ? 3 : goRight ? 4 : 5,
        metrics: [
          { label: 'Probes', value: String(stepIdx) },
          { label: 'Range', value: `[${l}..${r}]` },
          { label: 'Mid', value: String(m) },
        ],
      });
      if (found) break;
      if (goRight) l = m + 1;
      else r = m - 1;
    }
    return {
      id: 'binary-search',
      title: 'Binary Search Halving Trace',
      subtitle: 'Target = 23 over sorted array — monotonic half-elimination in O(log N)',
      codeLines,
      steps,
    };
  }

  // Default: Variable Sliding Window (At most K=2 distinct chars on "eceba")
  const str = 'eceba';
  const k = 2;
  const cells = str.split('');
  const codeLines = [
    'const freq = new Map<string, number>(); let left = 0, best = 0;',
    'for (let right = 0; right < s.length; right++) {',
    '  freq.set(s[right], (freq.get(s[right]) ?? 0) + 1);',
    '  while (freq.size > k) {',
    '    freq.set(s[left], freq.get(s[left])! - 1);',
    '    if (freq.get(s[left]) === 0) freq.delete(s[left]); left++;',
    '  }',
    '  best = Math.max(best, right - left + 1);',
    '}',
  ];

  const steps: ArrayPointerStep[] = [];
  const freq = new Map<string, number>();
  let left = 0;
  let best = 0;
  let stepIdx = 0;

  for (let right = 0; right < str.length; right++) {
    const ch = str[right];
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
    steps.push({
      stepIndex: stepIdx++,
      title: `Expand right -> '${ch}' at index ${right}`,
      explanation: `Acquire '${ch}'. Distinct count = ${freq.size} (${freq.size <= k ? `valid <= ${k}` : `VIOLATES k=${k}! Must shrink left`}).`,
      cells,
      left,
      right,
      windowRange: [left, right],
      highlightIndices: [right],
      hashMap: Array.from(freq.entries()).map(([key, val]) => ({
        key: `'${key}'`,
        value: String(val),
        active: key === ch,
      })),
      activeCodeLine: freq.size > k ? 3 : 2,
      metrics: [
        { label: 'Distinct', value: `${freq.size} / ${k}` },
        { label: 'Window', value: `"${str.slice(left, right + 1)}"` },
        { label: 'Best Len', value: String(best) },
      ],
    });

    while (freq.size > k) {
      const out = str[left];
      const nextCount = (freq.get(out) ?? 1) - 1;
      if (nextCount === 0) freq.delete(out);
      else freq.set(out, nextCount);
      left++;
      steps.push({
        stepIndex: stepIdx++,
        title: `Shrink left -> evict '${out}', left=${left}`,
        explanation: `Evicted '${out}' to restore invariant (distinct <= ${k}). Current distinct count = ${freq.size}.`,
        cells,
        left,
        right,
        windowRange: [left, right],
        highlightIndices: [left - 1],
        hashMap: Array.from(freq.entries()).map(([key, val]) => ({
          key: `'${key}'`,
          value: String(val),
          active: key === out,
        })),
        activeCodeLine: 5,
        metrics: [
          { label: 'Distinct', value: `${freq.size} / ${k}` },
          { label: 'Window', value: `"${str.slice(left, right + 1)}"` },
          { label: 'Best Len', value: String(best) },
        ],
      });
    }

    best = Math.max(best, right - left + 1);
    steps.push({
      stepIndex: stepIdx++,
      title: `Record Valid Window "${str.slice(left, right + 1)}"`,
      explanation: `Window [${left}..${right}] has ${freq.size} distinct chars <= ${k}. Best length = max(${best}, ${right - left + 1}) = ${best}.`,
      cells,
      left,
      right,
      windowRange: [left, right],
      hashMap: Array.from(freq.entries()).map(([key, val]) => ({
        key: `'${key}'`,
        value: String(val),
      })),
      activeCodeLine: 7,
      metrics: [
        { label: 'Distinct', value: `${freq.size} / ${k}` },
        { label: 'Window', value: `"${str.slice(left, right + 1)}"` },
        { label: 'Best Len', value: String(best) },
      ],
    });
  }

  return {
    id: 'sliding-window',
    title: 'Variable Sliding Window: At Most K=2 Distinct',
    subtitle: 'String "eceba" — expand right, shrink left only when distinct > K',
    codeLines,
    steps,
  };
}

// ============================================================================
// 2. TRUTH ELIMINATION GRID (DEDUCTIVE CONSTRAINT PUZZLES)
// ============================================================================

export type TruthCellState = 'unknown' | 'confirmed' | 'eliminated';

export interface TruthGridPuzzle {
  id: string;
  title: string;
  rowLabel: string;
  colLabel: string;
  rows: string[];
  cols: string[];
  clues: string[];
  /** Ground truth col index for each row index */
  solution: number[];
}

export const TRUTH_GRID_PUZZLES: TruthGridPuzzle[] = [
  {
    id: 'engineer-ownership',
    title: '4-Engineer Release Ownership (Bijection Grid)',
    rowLabel: 'Engineer',
    colLabel: 'Service',
    rows: ['Ava', 'Ben', 'Chen', 'Diya'],
    cols: ['Auth', 'Billing', 'Search', 'Queue'],
    clues: [
      'Clue 1: Diya owns Auth.',
      'Clue 2: Ava does not own Auth or Billing.',
      'Clue 3: The Search owner is neither Ava nor Ben.',
      'Clue 4: Chen does not own Queue.',
    ],
    solution: [3, 1, 2, 0], // Ava->Queue, Ben->Billing, Chen->Search, Diya->Auth
  },
  {
    id: 'knights-roles',
    title: 'Truth-Tellers, Liars & Alternators Matrix',
    rowLabel: 'Speaker',
    colLabel: 'Identity',
    rows: ['Orion', 'Priya', 'Quinn'],
    cols: ['Truth-Teller', 'Liar', 'Alternator'],
    clues: [
      'Clue 1: Orion says "I am a Liar." (Neither a Truth-Teller nor a Liar can truthfully/falsely utter this -> Orion is Alternator!)',
      'Clue 2: Priya says "Quinn is the Truth-Teller."',
      'Clue 3: Quinn says "Priya is not the Truth-Teller." (Consistent only when Quinn is Truth-Teller & Priya is Liar? Check carefully: if Priya is Truth-Teller then Quinn must be Truth-Teller — contradiction!)',
    ],
    solution: [2, 1, 0], // Orion->Alternator, Priya->Liar, Quinn->Truth-Teller
  },
  {
    id: 'meeting-schedule',
    title: '4-Slot Architecture Review Schedule',
    rowLabel: 'Track',
    colLabel: 'Time Slot',
    rows: ['Storage', 'Search', 'Auth', 'Metrics'],
    cols: ['09:00', '10:00', '11:00', '12:00'],
    clues: [
      'Clue 1: Search runs immediately before Metrics, and neither runs at 09:00.',
      'Clue 2: Auth is strictly earlier than Storage.',
      'Clue 3: Storage is not at 12:00 and not at 11:00.',
    ],
    solution: [1, 2, 0, 3], // Storage->10:00, Search->11:00, Auth->09:00, Metrics->12:00
  },
];

export interface GridContradiction {
  kind: 'row-double' | 'col-double' | 'row-empty' | 'col-empty';
  index: number;
  message: string;
}

export function createEmptyTruthGrid(rows: number, cols: number): TruthCellState[][] {
  return Array.from({ length: rows }, () => Array<TruthCellState>(cols).fill('unknown'));
}

export function toggleTruthGridCell(
  grid: TruthCellState[][],
  row: number,
  col: number,
  autoCrossEliminate: boolean,
): TruthCellState[][] {
  const next = grid.map((r) => [...r]);
  const current = next[row][col];
  const nextState: TruthCellState =
    current === 'unknown' ? 'confirmed' : current === 'confirmed' ? 'eliminated' : 'unknown';

  next[row][col] = nextState;

  if (nextState === 'confirmed' && autoCrossEliminate) {
    for (let c = 0; c < next[row].length; c++) {
      if (c !== col && next[row][c] === 'unknown') next[row][c] = 'eliminated';
    }
    for (let r = 0; r < next.length; r++) {
      if (r !== row && next[r][col] === 'unknown') next[r][col] = 'eliminated';
    }
  }

  return next;
}

export function detectGridContradictions(
  grid: TruthCellState[][],
  rowNames: string[],
  colNames: string[],
): GridContradiction[] {
  const issues: GridContradiction[] = [];

  for (let r = 0; r < grid.length; r++) {
    const confirmed = grid[r].filter((v) => v === 'confirmed').length;
    const open = grid[r].filter((v) => v !== 'eliminated').length;
    if (confirmed > 1) {
      issues.push({
        kind: 'row-double',
        index: r,
        message: `Row "${rowNames[r]}" has ${confirmed} confirmed assignments (bijection allows at most 1).`,
      });
    }
    if (open === 0) {
      issues.push({
        kind: 'row-empty',
        index: r,
        message: `Contradiction: Row "${rowNames[r]}" has 0 remaining candidates.`,
      });
    }
  }

  const colCount = grid[0]?.length ?? 0;
  for (let c = 0; c < colCount; c++) {
    let confirmed = 0;
    let open = 0;
    for (let r = 0; r < grid.length; r++) {
      if (grid[r][c] === 'confirmed') confirmed++;
      if (grid[r][c] !== 'eliminated') open++;
    }
    if (confirmed > 1) {
      issues.push({
        kind: 'col-double',
        index: c,
        message: `Column "${colNames[c]}" is confirmed for ${confirmed} rows simultaneously.`,
      });
    }
    if (open === 0) {
      issues.push({
        kind: 'col-empty',
        index: c,
        message: `Contradiction: Column "${colNames[c]}" has 0 remaining candidates.`,
      });
    }
  }

  return issues;
}

// ============================================================================
// 3. INVARIANT TRACKER TABLE (MATH, PARITY & GAME THEORY)
// ============================================================================

export type InvariantPresetId = 'chessboard-parity' | 'nim-xor' | 'chameleon-mod3';

export interface InvariantRow {
  step: number;
  action: string;
  stateDisplay: string;
  sum: number;
  parity: 'EVEN' | 'ODD';
  xorValue: number;
  moduloLabel: string;
  invariantHeld: boolean;
  proofNote: string;
}

export interface InvariantMoveOption {
  id: string;
  label: string;
  description: string;
}

export interface InvariantPreset {
  id: InvariantPresetId;
  title: string;
  domainLabel: string;
  invariantFormula: string;
  goalStatement: string;
  initialTuple: number[];
  tupleLabels: string[];
  moves: InvariantMoveOption[];
}

export const INVARIANT_PRESETS: InvariantPreset[] = [
  {
    id: 'chessboard-parity',
    title: 'Mutilated 8x8 Chessboard Domino Tiling',
    domainLabel: 'Parity & Coloring Invariant',
    invariantFormula: 'Color Imbalance = (White - Black) stays CONSTANT (+2) after every 1x2 domino!',
    goalStatement: 'Goal (0 White, 0 Black) requires imbalance = 0, but start has (32 W, 30 B) => imbalance = +2.',
    initialTuple: [32, 30],
    tupleLabels: ['White', 'Black'],
    moves: [
      { id: 'place-domino', label: 'Place 1x2 Domino (-1 W, -1 B)', description: 'Legal domino covers 1 White + 1 Black square.' },
      { id: 'place-5-dominoes', label: 'Place 5 Dominoes (-5 W, -5 B)', description: 'Fast-forward 5 legal placements.' },
      { id: 'place-10-dominoes', label: 'Place 10 Dominoes (-10 W, -10 B)', description: 'Fast-forward 10 legal placements.' },
    ],
  },
  {
    id: 'nim-xor',
    title: 'Multi-Pile Stone Nim (XOR Nim-Sum)',
    domainLabel: 'Game Theory Invariant',
    invariantFormula: 'Winning Move forces XOR(p1, p2, p3) === 0 (P-Position); any move from XOR === 0 MUST make XOR !== 0.',
    goalStatement: 'From [3, 4, 5], XOR = 2 != 0. Reduce pile 0 from 3 -> 1 to lock XOR = 0!',
    initialTuple: [3, 4, 5],
    tupleLabels: ['Pile A', 'Pile B', 'Pile C'],
    moves: [
      { id: 'optimal-nim', label: 'Play Optimal Move (Force XOR -> 0)', description: 'Computes pile p with (p ^ xor) < p and drops it to p ^ xor.' },
      { id: 'take-1-a', label: 'Take 1 from Pile A', description: 'Remove 1 stone from Pile A.' },
      { id: 'take-2-b', label: 'Take 2 from Pile B', description: 'Remove 2 stones from Pile B.' },
      { id: 'take-1-c', label: 'Take 1 from Pile C', description: 'Remove 1 stone from Pile C.' },
    ],
  },
  {
    id: 'chameleon-mod3',
    title: 'Chameleon Island (13 Red, 15 Green, 17 Blue)',
    domainLabel: 'Modular Arithmetic Invariant',
    invariantFormula: 'Pairwise diffs (R-G, G-B, R-B) mod 3 NEVER CHANGE on any meeting (-1, -1, +2)!',
    goalStatement: 'Can all 45 become one color (45, 0, 0)? Target needs two counts congruent mod 3; initial (1, 0, 2) mod 3 has NONE!',
    initialTuple: [13, 15, 17],
    tupleLabels: ['Red', 'Green', 'Blue'],
    moves: [
      { id: 'meet-rg', label: 'Red + Green -> 2 Blue', description: 'R-1, G-1, B+2' },
      { id: 'meet-gb', label: 'Green + Blue -> 2 Red', description: 'G-1, B-1, R+2' },
      { id: 'meet-rb', label: 'Red + Blue -> 2 Green', description: 'R-1, B-1, G+2' },
    ],
  },
];

export function evaluateInvariantRow(
  presetId: InvariantPresetId,
  tuple: number[],
  step: number,
  action: string,
): InvariantRow {
  const sum = tuple.reduce((a, b) => a + b, 0);
  const xorValue = tuple.reduce((a, b) => a ^ b, 0);
  const parity: 'EVEN' | 'ODD' = sum % 2 === 0 ? 'EVEN' : 'ODD';

  if (presetId === 'chessboard-parity') {
    const diff = tuple[0] - tuple[1];
    const stuck = tuple[1] === 0 && tuple[0] > 0;
    return {
      step,
      action,
      stateDisplay: `W=${tuple[0]}, B=${tuple[1]}`,
      sum,
      parity,
      xorValue,
      moduloLabel: `W-B = ${diff >= 0 ? `+${diff}` : diff}`,
      invariantHeld: diff === 2,
      proofNote: stuck
        ? '2 White squares remain with 0 Black squares -> Tiling PROVEN IMPOSSIBLE!'
        : `Imbalance W - B = +${diff} unchanged (monovariant Sum decreased to ${sum}).`,
    };
  }

  if (presetId === 'nim-xor') {
    return {
      step,
      action,
      stateDisplay: `[${tuple.join(', ')}]`,
      sum,
      parity,
      xorValue,
      moduloLabel: xorValue === 0 ? 'P-Pos (Losing)' : 'N-Pos (Winning)',
      invariantHeld: xorValue === 0,
      proofNote:
        sum === 0
          ? 'Terminal state [0, 0, 0]: Player who just moved WINS!'
          : xorValue === 0
            ? 'XOR === 0 locked! Opponent is mathematically forced to break XOR back to != 0.'
            : `XOR = ${xorValue} != 0: Current player has a guaranteed winning move back to XOR = 0.`,
    };
  }

  // chameleon-mod3
  const mod = (x: number) => ((x % 3) + 3) % 3;
  const rMinusG = mod(tuple[0] - tuple[1]);
  const gMinusB = mod(tuple[1] - tuple[2]);
  const allDistinct = rMinusG !== 0 && gMinusB !== 0 && mod(tuple[0] - tuple[2]) !== 0;

  return {
    step,
    action,
    stateDisplay: `R=${tuple[0]}, G=${tuple[1]}, B=${tuple[2]}`,
    sum,
    parity,
    xorValue,
    moduloLabel: `(R-G,G-B)%3 = (${rMinusG},${gMinusB})`,
    invariantHeld: allDistinct,
    proofNote: allDistinct
      ? `Total stays ${sum} and (R-G, G-B) mod 3 remains (${rMinusG}, ${gMinusB}) != (0, 0) -> Unification IMPOSSIBLE.`
      : 'Two counts are congruent mod 3!',
  };
}

export function applyInvariantMove(
  presetId: InvariantPresetId,
  tuple: number[],
  moveId: string,
): { nextTuple: number[]; actionLabel: string; blockedReason?: string } {
  const next = [...tuple];

  if (presetId === 'chessboard-parity') {
    const count = moveId === 'place-10-dominoes' ? 10 : moveId === 'place-5-dominoes' ? 5 : 1;
    const legal = Math.min(count, next[0], next[1]);
    if (legal <= 0) {
      return {
        nextTuple: next,
        actionLabel: 'Blocked',
        blockedReason: 'No adjacent Black square left! 2 White squares remain un-tileable.',
      };
    }
    next[0] -= legal;
    next[1] -= legal;
    return { nextTuple: next, actionLabel: `Placed ${legal} domino${legal > 1 ? 'es' : ''}` };
  }

  if (presetId === 'nim-xor') {
    const xorVal = next.reduce((a, b) => a ^ b, 0);
    if (moveId === 'optimal-nim') {
      if (xorVal === 0) {
        const idx = next.findIndex((p) => p > 0);
        if (idx === -1) return { nextTuple: next, actionLabel: 'Game Over', blockedReason: 'All piles are empty.' };
        next[idx] -= 1;
        return { nextTuple: next, actionLabel: `No XOR=0 move exists; took 1 from Pile ${['A', 'B', 'C'][idx]}` };
      }
      for (let i = 0; i < next.length; i++) {
        const target = next[i] ^ xorVal;
        if (target < next[i]) {
          const take = next[i] - target;
          next[i] = target;
          return { nextTuple: next, actionLabel: `Optimal: took ${take} from Pile ${['A', 'B', 'C'][i]} (-> XOR=0)` };
        }
      }
    }
    if (moveId === 'take-1-a') {
      if (next[0] < 1) return { nextTuple: next, actionLabel: 'Blocked', blockedReason: 'Pile A is empty.' };
      next[0] -= 1;
      return { nextTuple: next, actionLabel: 'Took 1 from Pile A' };
    }
    if (moveId === 'take-2-b') {
      if (next[1] < 2) return { nextTuple: next, actionLabel: 'Blocked', blockedReason: 'Pile B has fewer than 2 stones.' };
      next[1] -= 2;
      return { nextTuple: next, actionLabel: 'Took 2 from Pile B' };
    }
    if (moveId === 'take-1-c') {
      if (next[2] < 1) return { nextTuple: next, actionLabel: 'Blocked', blockedReason: 'Pile C is empty.' };
      next[2] -= 1;
      return { nextTuple: next, actionLabel: 'Took 1 from Pile C' };
    }
  }

  // chameleon-mod3
  if (moveId === 'meet-rg') {
    if (next[0] < 1 || next[1] < 1) return { nextTuple: next, actionLabel: 'Blocked', blockedReason: 'Need >= 1 Red and >= 1 Green.' };
    next[0] -= 1; next[1] -= 1; next[2] += 2;
    return { nextTuple: next, actionLabel: 'Red + Green -> 2 Blue' };
  }
  if (moveId === 'meet-gb') {
    if (next[1] < 1 || next[2] < 1) return { nextTuple: next, actionLabel: 'Blocked', blockedReason: 'Need >= 1 Green and >= 1 Blue.' };
    next[1] -= 1; next[2] -= 1; next[0] += 2;
    return { nextTuple: next, actionLabel: 'Green + Blue -> 2 Red' };
  }
  if (moveId === 'meet-rb') {
    if (next[0] < 1 || next[2] < 1) return { nextTuple: next, actionLabel: 'Blocked', blockedReason: 'Need >= 1 Red and >= 1 Blue.' };
    next[0] -= 1; next[2] -= 1; next[1] += 2;
    return { nextTuple: next, actionLabel: 'Red + Blue -> 2 Green' };
  }

  return { nextTuple: next, actionLabel: 'No-op' };
}

// ============================================================================
// 4. LOGIC PIECE BUILDER ("COMPLETE IN PIECES" MODE)
// ============================================================================

export interface LogicPiece {
  id: string;
  role: 'Initialization' | 'Loop Invariant' | 'Pruning / Guard' | 'State Transition' | 'Verification / Return';
  code: string;
  correctOrder: number;
  diagnosticHint: string;
}

export interface LogicBuilderChallenge {
  id: string;
  title: string;
  domain: CognitiveDomain;
  prompt: string;
  pieces: LogicPiece[];
}

export const LOGIC_BUILDER_CHALLENGES: LogicBuilderChallenge[] = [
  {
    id: 'piece-sliding-window',
    title: 'Assemble Variable Sliding Window Invariant',
    domain: 'DSA_ALGORITHMIC',
    prompt: 'Arrange the 5 execution blocks so the window invariant (distinct <= k) is ALWAYS restored BEFORE updating the best length.',
    pieces: [
      {
        id: 'sw-3',
        role: 'Pruning / Guard',
        code: 'while (freq.size > k) { decrement(s[left]); if (count === 0) freq.delete(s[left]); left++; }',
        correctOrder: 2,
        diagnosticHint: 'Shrink loop MUST run immediately after acquiring s[right] and BEFORE recording best length.',
      },
      {
        id: 'sw-1',
        role: 'Initialization',
        code: 'const freq = new Map<string, number>(); let left = 0, best = 0;',
        correctOrder: 0,
        diagnosticHint: 'State initialization (frequency map + left pointer + best) must precede the sweep.',
      },
      {
        id: 'sw-5',
        role: 'Verification / Return',
        code: 'return best; // Guaranteed O(N) because left & right each advance <= N times',
        correctOrder: 4,
        diagnosticHint: 'Return the accumulated maximum only after the outer right-pointer sweep finishes.',
      },
      {
        id: 'sw-2',
        role: 'State Transition',
        code: 'for (let right = 0; right < s.length; right++) { freq.set(s[right], (freq.get(s[right]) ?? 0) + 1);',
        correctOrder: 1,
        diagnosticHint: 'Acquire s[right] into the frequency map at the start of each iteration.',
      },
      {
        id: 'sw-4',
        role: 'Loop Invariant',
        code: 'best = Math.max(best, right - left + 1); } // Invariant: [left..right] has <= k distinct chars',
        correctOrder: 3,
        diagnosticHint: 'Only measure right - left + 1 AFTER the while loop restores freq.size <= k.',
      },
    ],
  },
  {
    id: 'piece-ngram-pipeline',
    title: 'Assemble Two-Stage Fuzzy Search Pipeline',
    domain: 'SYSTEM_STATE_LOGIC',
    prompt: 'Order the 5 pipeline stages so expensive Stage 2 edit-distance reranking ONLY executes on pruned Stage 1 candidates.',
    pieces: [
      {
        id: 'ng-4',
        role: 'State Transition',
        code: 'scored = survivors.map(c => 0.45 * damerauSim(q, c) + 0.30 * jaroWinkler(q, c) + 0.25 * dice(q, c));',
        correctOrder: 3,
        diagnosticHint: 'Stage 2 Damerau-Levenshtein + Jaro-Winkler must run AFTER Stage 1 length/overlap pruning.',
      },
      {
        id: 'ng-2',
        role: 'Loop Invariant',
        code: 'for (const tri of trigrams) for (const docId of invertedIndex.get(tri) ?? []) hitCount[docId]++;',
        correctOrder: 1,
        diagnosticHint: 'Merge inverted posting lists right after generating padded trigrams.',
      },
      {
        id: 'ng-1',
        role: 'Initialization',
        code: 'const trigrams = extractPaddedTrigrams("  " + normalize(query) + "  ");',
        correctOrder: 0,
        diagnosticHint: 'Normalize and pad the query into character trigrams first.',
      },
      {
        id: 'ng-5',
        role: 'Verification / Return',
        code: 'return scored.sort((a, b) => b.confidence - a.confidence).slice(0, topK);',
        correctOrder: 4,
        diagnosticHint: 'Sort calibrated confidence scores and emit Top-K as the final stage.',
      },
      {
        id: 'ng-3',
        role: 'Pruning / Guard',
        code: 'const survivors = filterByLengthAndMinOverlap(hitCount, minOverlap = 2, cap = 500);',
        correctOrder: 2,
        diagnosticHint: 'Length & count pruning must bound candidates to <= 500 BEFORE Stage 2 edit distance.',
      },
    ],
  },
  {
    id: 'piece-invariant-proof',
    title: 'Construct Algebraic Invariant Impossibility Proof',
    domain: 'MATHEMATICAL_LOGIC',
    prompt: 'Assemble the 4 proof steps in strict logical order to prove a target state is unreachable.',
    pieces: [
      {
        id: 'inv-3',
        role: 'Loop Invariant',
        code: 'Show f(nextState) === f(state) algebraically for EVERY legal transition rule.',
        correctOrder: 2,
        diagnosticHint: 'You must prove invariance over all transitions before concluding unreachability.',
      },
      {
        id: 'inv-1',
        role: 'Initialization',
        code: 'Define candidate invariant function f(state) (e.g. White - Black or (R - G) mod 3).',
        correctOrder: 0,
        diagnosticHint: 'Start by defining the exact scalar function f(state) you are tracking.',
      },
      {
        id: 'inv-4',
        role: 'Verification / Return',
        code: 'Conclude: since f(Start) !== f(Goal) and f never changes, Goal is mathematically unreachable.',
        correctOrder: 3,
        diagnosticHint: 'The impossibility conclusion follows only after computing f(Start), f(Goal), and proving invariance.',
      },
      {
        id: 'inv-2',
        role: 'State Transition',
        code: 'Evaluate f(Start) and f(Goal) and observe that f(Start) !== f(Goal).',
        correctOrder: 1,
        diagnosticHint: 'Compute f(Start) vs f(Goal) right after defining f(state) to check whether they separate.',
      },
    ],
  },
];

export interface PieceValidationResult {
  isCorrect: boolean;
  correctCount: number;
  totalCount: number;
  feedback: string;
  firstMismatchIndex: number | null;
}

export function validateLogicPieceOrder(
  challenge: LogicBuilderChallenge,
  orderedIds: string[],
): PieceValidationResult {
  const byId = new Map(challenge.pieces.map((p) => [p.id, p]));
  let correctCount = 0;
  let firstMismatchIndex: number | null = null;
  let mismatchFeedback = '';

  orderedIds.forEach((id, idx) => {
    const piece = byId.get(id);
    if (!piece) return;
    if (piece.correctOrder === idx) {
      correctCount++;
    } else if (firstMismatchIndex === null) {
      firstMismatchIndex = idx;
      mismatchFeedback = `Slot ${idx + 1} (${piece.role}) violates execution order: ${piece.diagnosticHint}`;
    }
  });

  const isCorrect = correctCount === challenge.pieces.length;
  return {
    isCorrect,
    correctCount,
    totalCount: challenge.pieces.length,
    firstMismatchIndex,
    feedback: isCorrect
      ? 'Invariant verified! Every initialization, guard, transition, and verification step executes in provably valid order.'
      : mismatchFeedback,
  };
}
