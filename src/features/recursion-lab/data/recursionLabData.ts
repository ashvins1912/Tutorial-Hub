export type RecursionProblemId = 'n-queens' | 'subsets' | 'combination-sum';
export type BlockBucket = 'base-case' | 'recursive-step';

export type CodeLineRole =
  | 'signature'
  | 'base-case'
  | 'prune-guard'
  | 'choose'
  | 'recurse'
  | 'backtrack';

export interface CodeLineSpec {
  lineNumber: number;
  code: string;
  role: CodeLineRole;
  roleLabel: string;
}

export interface RecursionTreeNode {
  id: string;
  parentId: string | null;
  depth: number;
  label: string;
  sublabel: string;
  /** Percentage X coordinate in SVG viewBox (0..640) */
  x: number;
  /** Y coordinate in SVG viewBox (0..250) */
  y: number;
  stepIndex: number;
  kind: 'root' | 'call' | 'prune' | 'solution' | 'backtrack';
}

export interface CallStackFrameItem {
  fn: string;
  depth: number;
  state: string;
  status: 'active' | 'waiting' | 'returning' | 'pruned';
}

export interface RecursionTraceStep {
  step: number;
  action: 'call' | 'prune' | 'solution' | 'backtrack';
  title: string;
  explanation: string;
  activeNodeId: string;
  activeLineNumbers: number[];
  stack: CallStackFrameItem[];
  depth: number;
  peakDepth: number;
  exploredCount: number;
  prunedCount: number;
  /** For N-Queens 4x4 visualization: queen column per placed row */
  queens?: number[];
  probeCell?: [number, number];
  conflictCell?: [number, number];
  /** For Subsets visualization */
  currentPath?: number[];
  emittedSubsets?: number[][];
  /** For Combination Sum visualization */
  remainingTarget?: number;
  activeCandidateIdx?: number;
  prunedFromIdx?: number;
  emittedCombinations?: number[][];
  /** For Word Search 2D Grid DFS backtracking visualization */
  wordGrid?: string[][];
  targetWord?: string;
  visitedCells?: [number, number][];
  activeCell?: [number, number];
  matchedPrefix?: string;
}

export interface BuildingBlockItem {
  id: string;
  label: string;
  code: string;
  correctBucket: BlockBucket;
  explanation: string;
}

export interface BuildingBlocksChallenge {
  id: RecursionProblemId;
  title: string;
  subtitle: string;
  blocks: BuildingBlockItem[];
}

export interface RecursionProblemConfig {
  id: RecursionProblemId;
  shortLabel: string;
  title: string;
  complexitySummary: string;
  baseCaseSummary: string;
  recursiveStepSummary: string;
  codeLines: CodeLineSpec[];
  treeNodes: RecursionTreeNode[];
  trace: RecursionTraceStep[];
}

export const NQUEENS_CODE: CodeLineSpec[] = [
  {
    lineNumber: 1,
    code: 'function solve(row: number) {',
    role: 'signature',
    roleLabel: 'Frame Entry',
  },
  {
    lineNumber: 2,
    code: '  if (row === N) { res.push([...queens]); return; }',
    role: 'base-case',
    roleLabel: 'Base Case',
  },
  {
    lineNumber: 3,
    code: '  for (let c = 0; c < N; c++) {',
    role: 'signature',
    roleLabel: 'Branch Loop',
  },
  {
    lineNumber: 4,
    code: '    if (cols.has(c) || d1.has(row-c) || d2.has(row+c)) continue;',
    role: 'prune-guard',
    roleLabel: 'Prune Guard',
  },
  {
    lineNumber: 5,
    code: '    queens.push(c); cols.add(c); d1.add(row-c); d2.add(row+c);',
    role: 'choose',
    roleLabel: 'Choose',
  },
  {
    lineNumber: 6,
    code: '    solve(row + 1); // push child frame (depth + 1)',
    role: 'recurse',
    roleLabel: 'Recursive Step',
  },
  {
    lineNumber: 7,
    code: '    queens.pop(); cols.delete(c); d1.delete(row-c); d2.delete(row+c);',
    role: 'backtrack',
    roleLabel: 'Backtrack Undo',
  },
  {
    lineNumber: 8,
    code: '  }',
    role: 'signature',
    roleLabel: 'End Loop',
  },
];

export const NQUEENS_TREE: RecursionTreeNode[] = [
  {
    id: 'nq-root',
    parentId: null,
    depth: 1,
    label: 'solve(r=0)',
    sublabel: 'root',
    x: 320,
    y: 28,
    stepIndex: 0,
    kind: 'root',
  },
  {
    id: 'nq-c0',
    parentId: 'nq-root',
    depth: 2,
    label: 'Q(0,0) → r=1',
    sublabel: 'try c=2',
    x: 155,
    y: 82,
    stepIndex: 1,
    kind: 'call',
  },
  {
    id: 'nq-c0-dead',
    parentId: 'nq-c0',
    depth: 3,
    label: 'Q(1,2) → r=2',
    sublabel: '0 safe cols',
    x: 110,
    y: 138,
    stepIndex: 2,
    kind: 'prune',
  },
  {
    id: 'nq-c1',
    parentId: 'nq-root',
    depth: 2,
    label: 'Q(0,1) → r=1',
    sublabel: 'c=3 safe',
    x: 350,
    y: 82,
    stepIndex: 3,
    kind: 'backtrack',
  },
  {
    id: 'nq-c1-r2',
    parentId: 'nq-c1',
    depth: 3,
    label: 'Q(1,3) → r=2',
    sublabel: 'try c=0',
    x: 350,
    y: 138,
    stepIndex: 4,
    kind: 'call',
  },
  {
    id: 'nq-c1-r3',
    parentId: 'nq-c1-r2',
    depth: 4,
    label: 'Q(2,0) → r=3',
    sublabel: 'try c=2',
    x: 350,
    y: 192,
    stepIndex: 5,
    kind: 'call',
  },
  {
    id: 'nq-c1-sol',
    parentId: 'nq-c1-r3',
    depth: 5,
    label: 'r=4 BASE',
    sublabel: '[1,3,0,2]',
    x: 350,
    y: 244,
    stepIndex: 6,
    kind: 'solution',
  },
  {
    id: 'nq-c2',
    parentId: 'nq-root',
    depth: 2,
    label: 'Q(0,2) → r=1',
    sublabel: 'next branch',
    x: 525,
    y: 82,
    stepIndex: 7,
    kind: 'backtrack',
  },
];

export const NQUEENS_TRACE: RecursionTraceStep[] = [
  {
    step: 0,
    action: 'call',
    title: 'Enter Root Frame: solve(row = 0)',
    explanation:
      'Start at depth 1 (row = 0) with empty column and diagonal occupancy sets. Probe column 0 first.',
    activeNodeId: 'nq-root',
    activeLineNumbers: [1, 3],
    stack: [{ fn: 'solve(row=0)', depth: 1, state: 'try col=0', status: 'active' }],
    depth: 1,
    peakDepth: 1,
    exploredCount: 1,
    prunedCount: 0,
    queens: [],
    probeCell: [0, 0],
  },
  {
    step: 1,
    action: 'call',
    title: 'Place Q(0,0) → Recurse solve(row = 1)',
    explanation:
      'Column 0 is unattacked. Lock col=0, d1=0, d2=0 and push child frame solve(row=1). Columns 0 and 1 collide immediately, so try col=2.',
    activeNodeId: 'nq-c0',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'solve(row=0)', depth: 1, state: 'placed (0,0)', status: 'waiting' },
      { fn: 'solve(row=1)', depth: 2, state: 'try col=2', status: 'active' },
    ],
    depth: 2,
    peakDepth: 2,
    exploredCount: 2,
    prunedCount: 2,
    queens: [0],
    probeCell: [1, 2],
  },
  {
    step: 2,
    action: 'prune',
    title: 'Dead End at row = 2 — Conflict Guard Prunes Every Column',
    explanation:
      'With Q(0,0) and Q(1,2), all 4 columns in row 2 hit cols, d1 (row-c), or d2 (row+c). O(1) pruning halts descent before reaching depth 4.',
    activeNodeId: 'nq-c0-dead',
    activeLineNumbers: [4],
    stack: [
      { fn: 'solve(row=0)', depth: 1, state: 'placed (0,0)', status: 'waiting' },
      { fn: 'solve(row=1)', depth: 2, state: 'placed (1,2)', status: 'waiting' },
      { fn: 'solve(row=2)', depth: 3, state: '0 safe cols → unwind', status: 'pruned' },
    ],
    depth: 3,
    peakDepth: 3,
    exploredCount: 4,
    prunedCount: 6,
    queens: [0, 2],
    conflictCell: [2, 1],
  },
  {
    step: 3,
    action: 'backtrack',
    title: 'Backtrack to row = 0 → Unchoose (0,0), Try (0,1)',
    explanation:
      'Unwind stack frames back to depth 1, execute line 7 to delete (0,0) from cols/d1/d2, then advance the loop to column 1.',
    activeNodeId: 'nq-c1',
    activeLineNumbers: [7, 3],
    stack: [{ fn: 'solve(row=0)', depth: 1, state: 'undo (0,0) → try col=1', status: 'active' }],
    depth: 1,
    peakDepth: 3,
    exploredCount: 6,
    prunedCount: 9,
    queens: [],
    probeCell: [0, 1],
  },
  {
    step: 4,
    action: 'call',
    title: 'Place Q(0,1) → Q(1,3) → Recurse solve(row = 2)',
    explanation:
      'Q(0,1) leaves (1,3) open. Call stack climbs cleanly to depth 3 at solve(row=2), where (2,0) avoids every diagonal.',
    activeNodeId: 'nq-c1-r2',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'solve(row=0)', depth: 1, state: 'placed (0,1)', status: 'waiting' },
      { fn: 'solve(row=1)', depth: 2, state: 'placed (1,3)', status: 'waiting' },
      { fn: 'solve(row=2)', depth: 3, state: 'try col=0', status: 'active' },
    ],
    depth: 3,
    peakDepth: 3,
    exploredCount: 9,
    prunedCount: 11,
    queens: [1, 3],
    probeCell: [2, 0],
  },
  {
    step: 5,
    action: 'call',
    title: 'Place Q(2,0) → Recurse solve(row = 3)',
    explanation:
      'Stack reaches depth 4: solve(row=3) checks columns 0..3 against cols {1,3,0} and diagonals, discovering col=2 is completely safe.',
    activeNodeId: 'nq-c1-r3',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'solve(row=0)', depth: 1, state: 'placed (0,1)', status: 'waiting' },
      { fn: 'solve(row=1)', depth: 2, state: 'placed (1,3)', status: 'waiting' },
      { fn: 'solve(row=2)', depth: 3, state: 'placed (2,0)', status: 'waiting' },
      { fn: 'solve(row=3)', depth: 4, state: 'try col=2', status: 'active' },
    ],
    depth: 4,
    peakDepth: 4,
    exploredCount: 11,
    prunedCount: 13,
    queens: [1, 3, 0],
    probeCell: [3, 2],
  },
  {
    step: 6,
    action: 'solution',
    title: 'Base Case Hit: solve(row = 4) → Valid Solution [1, 3, 0, 2]!',
    explanation:
      'Line 2 fires: row === N (4 === 4)! Snapshot immutable board copy [1, 3, 0, 2] into res and return immediately.',
    activeNodeId: 'nq-c1-sol',
    activeLineNumbers: [2],
    stack: [
      { fn: 'solve(row=0)', depth: 1, state: 'placed (0,1)', status: 'waiting' },
      { fn: 'solve(row=1)', depth: 2, state: 'placed (1,3)', status: 'waiting' },
      { fn: 'solve(row=2)', depth: 3, state: 'placed (2,0)', status: 'waiting' },
      { fn: 'solve(row=3)', depth: 4, state: 'placed (3,2)', status: 'waiting' },
      { fn: 'solve(row=4)', depth: 5, state: 'BASE CASE → emit!', status: 'returning' },
    ],
    depth: 5,
    peakDepth: 5,
    exploredCount: 12,
    prunedCount: 13,
    queens: [1, 3, 0, 2],
  },
  {
    step: 7,
    action: 'backtrack',
    title: 'Unwind Stack & Restore Sets to Explore Column 2',
    explanation:
      'Frames pop in reverse LIFO order, undoing each queen from cols/d1/d2 so the mirrored solution [2, 0, 3, 1] starts with a clean board.',
    activeNodeId: 'nq-c2',
    activeLineNumbers: [7, 3],
    stack: [
      { fn: 'solve(row=0)', depth: 1, state: 'undo (0,1) → next col=2', status: 'active' },
    ],
    depth: 1,
    peakDepth: 5,
    exploredCount: 13,
    prunedCount: 13,
    queens: [],
    probeCell: [0, 2],
  },
];

export const SUBSETS_CODE: CodeLineSpec[] = [
  {
    lineNumber: 1,
    code: 'function dfs(start: number, path: number[]) {',
    role: 'signature',
    roleLabel: 'Frame Entry',
  },
  {
    lineNumber: 2,
    code: '  res.push([...path]); // snapshot every node',
    role: 'base-case',
    roleLabel: 'Snapshot Base',
  },
  {
    lineNumber: 3,
    code: '  if (start === nums.length) return;',
    role: 'base-case',
    roleLabel: 'Leaf Guard',
  },
  {
    lineNumber: 4,
    code: '  for (let i = start; i < nums.length; i++) {',
    role: 'signature',
    roleLabel: 'Forward Loop',
  },
  {
    lineNumber: 5,
    code: '    path.push(nums[i]); // mutate shared path',
    role: 'choose',
    roleLabel: 'Choose',
  },
  {
    lineNumber: 6,
    code: '    dfs(i + 1, path); // descend suffix',
    role: 'recurse',
    roleLabel: 'Recursive Step',
  },
  {
    lineNumber: 7,
    code: '    path.pop(); // restore for next sibling',
    role: 'backtrack',
    roleLabel: 'Backtrack Undo',
  },
  {
    lineNumber: 8,
    code: '  }',
    role: 'signature',
    roleLabel: 'End Loop',
  },
];

export const SUBSETS_TREE: RecursionTreeNode[] = [
  {
    id: 'sub-root',
    parentId: null,
    depth: 1,
    label: '[]',
    sublabel: 'start=0',
    x: 320,
    y: 30,
    stepIndex: 0,
    kind: 'solution',
  },
  {
    id: 'sub-1',
    parentId: 'sub-root',
    depth: 2,
    label: '[1]',
    sublabel: 'start=1',
    x: 165,
    y: 96,
    stepIndex: 1,
    kind: 'call',
  },
  {
    id: 'sub-12',
    parentId: 'sub-1',
    depth: 3,
    label: '[1,2]',
    sublabel: 'start=2',
    x: 105,
    y: 164,
    stepIndex: 2,
    kind: 'call',
  },
  {
    id: 'sub-123',
    parentId: 'sub-12',
    depth: 4,
    label: '[1,2,3]',
    sublabel: 'start=3 leaf',
    x: 105,
    y: 230,
    stepIndex: 3,
    kind: 'solution',
  },
  {
    id: 'sub-13',
    parentId: 'sub-1',
    depth: 3,
    label: '[1,3]',
    sublabel: 'pop 2 → +3',
    x: 245,
    y: 164,
    stepIndex: 4,
    kind: 'backtrack',
  },
  {
    id: 'sub-2',
    parentId: 'sub-root',
    depth: 2,
    label: '[2] → [2,3] → [3]',
    sublabel: 'remaining siblings',
    x: 470,
    y: 96,
    stepIndex: 5,
    kind: 'backtrack',
  },
];

export const SUBSETS_TRACE: RecursionTraceStep[] = [
  {
    step: 0,
    action: 'solution',
    title: 'Root Call: dfs(start = 0, path = [])',
    explanation:
      'Every node in the Subsets tree is a valid subset. Line 2 snapshots [] immediately at depth 1 before entering the loop.',
    activeNodeId: 'sub-root',
    activeLineNumbers: [1, 2],
    stack: [{ fn: 'dfs(start=0)', depth: 1, state: 'path=[]', status: 'active' }],
    depth: 1,
    peakDepth: 1,
    exploredCount: 1,
    prunedCount: 0,
    currentPath: [],
    emittedSubsets: [[]],
  },
  {
    step: 1,
    action: 'call',
    title: 'Choose 1 → Push dfs(start = 1, path = [1])',
    explanation:
      'Push 1 onto shared mutable path (line 5), recurse to start = 1 (line 6), and snapshot [1] at depth 2.',
    activeNodeId: 'sub-1',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'dfs(start=0)', depth: 1, state: 'chose 1', status: 'waiting' },
      { fn: 'dfs(start=1)', depth: 2, state: 'path=[1]', status: 'active' },
    ],
    depth: 2,
    peakDepth: 2,
    exploredCount: 2,
    prunedCount: 0,
    currentPath: [1],
    emittedSubsets: [[], [1]],
  },
  {
    step: 2,
    action: 'call',
    title: 'Choose 2 → Push dfs(start = 2, path = [1, 2])',
    explanation:
      'Push 2 onto path, emit [1, 2], and descend strictly rightward (i + 1 = 2) to depth 3.',
    activeNodeId: 'sub-12',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'dfs(start=0)', depth: 1, state: 'chose 1', status: 'waiting' },
      { fn: 'dfs(start=1)', depth: 2, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(start=2)', depth: 3, state: 'path=[1,2]', status: 'active' },
    ],
    depth: 3,
    peakDepth: 3,
    exploredCount: 3,
    prunedCount: 0,
    currentPath: [1, 2],
    emittedSubsets: [[], [1], [1, 2]],
  },
  {
    step: 3,
    action: 'solution',
    title: 'Leaf Base Case (start === 3) → Emit [1, 2, 3]',
    explanation:
      'Peak call stack depth O(N + 1) = 4 reached. Snapshot [1, 2, 3], hit line 3 (start === nums.length), and return.',
    activeNodeId: 'sub-123',
    activeLineNumbers: [2, 3],
    stack: [
      { fn: 'dfs(start=0)', depth: 1, state: 'chose 1', status: 'waiting' },
      { fn: 'dfs(start=1)', depth: 2, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(start=2)', depth: 3, state: 'chose 3', status: 'waiting' },
      { fn: 'dfs(start=3)', depth: 4, state: 'BASE → emit [1,2,3]', status: 'returning' },
    ],
    depth: 4,
    peakDepth: 4,
    exploredCount: 4,
    prunedCount: 0,
    currentPath: [1, 2, 3],
    emittedSubsets: [[], [1], [1, 2], [1, 2, 3]],
  },
  {
    step: 4,
    action: 'backtrack',
    title: 'Pop 3 & Pop 2 → Choose 3 from [1] → Emit [1, 3]',
    explanation:
      'Line 7 pops 3 and 2 as frames unwind to dfs(start=1), leaving path=[1] untouched before selecting element 3.',
    activeNodeId: 'sub-13',
    activeLineNumbers: [7, 5, 6],
    stack: [
      { fn: 'dfs(start=0)', depth: 1, state: 'chose 1', status: 'waiting' },
      { fn: 'dfs(start=1)', depth: 2, state: 'pop 2 → chose 3', status: 'waiting' },
      { fn: 'dfs(start=3)', depth: 3, state: 'emit [1,3]', status: 'active' },
    ],
    depth: 3,
    peakDepth: 4,
    exploredCount: 5,
    prunedCount: 0,
    currentPath: [1, 3],
    emittedSubsets: [[], [1], [1, 2], [1, 2, 3], [1, 3]],
  },
  {
    step: 5,
    action: 'backtrack',
    title: 'Unwind to Root → Explore [2], [2, 3], and [3]',
    explanation:
      'Pop 1 so path returns to []. Remaining sibling branches emit [2], [2, 3], and [3] — all 2³ = 8 subsets in O(N) stack space.',
    activeNodeId: 'sub-2',
    activeLineNumbers: [7, 2],
    stack: [
      { fn: 'dfs(start=0)', depth: 1, state: 'pop 1 → chose 2', status: 'waiting' },
      { fn: 'dfs(start=2)', depth: 2, state: 'emit [2], [2,3], [3]', status: 'returning' },
    ],
    depth: 2,
    peakDepth: 4,
    exploredCount: 8,
    prunedCount: 0,
    currentPath: [2, 3],
    emittedSubsets: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]],
  },
];

export const COMB_SUM_CODE: CodeLineSpec[] = [
  {
    lineNumber: 1,
    code: 'function dfs(idx: number, rem: number) {',
    role: 'signature',
    roleLabel: 'Frame Entry',
  },
  {
    lineNumber: 2,
    code: '  if (rem === 0) { res.push([...path]); return; }',
    role: 'base-case',
    roleLabel: 'Base Case',
  },
  {
    lineNumber: 3,
    code: '  for (let j = idx; j < cands.length; j++) {',
    role: 'signature',
    roleLabel: 'Sorted Loop',
  },
  {
    lineNumber: 4,
    code: '    if (cands[j] > rem) break; // sorted suffix prune',
    role: 'prune-guard',
    roleLabel: 'Prune Guard',
  },
  {
    lineNumber: 5,
    code: '    path.push(cands[j]);',
    role: 'choose',
    roleLabel: 'Choose',
  },
  {
    lineNumber: 6,
    code: '    dfs(j, rem - cands[j]); // allow reuse of j',
    role: 'recurse',
    roleLabel: 'Recursive Step',
  },
  {
    lineNumber: 7,
    code: '    path.pop(); // undo candidate',
    role: 'backtrack',
    roleLabel: 'Backtrack Undo',
  },
  {
    lineNumber: 8,
    code: '  }',
    role: 'signature',
    roleLabel: 'End Loop',
  },
];

export const COMB_SUM_TREE: RecursionTreeNode[] = [
  {
    id: 'cs-root',
    parentId: null,
    depth: 1,
    label: 'rem=7',
    sublabel: '[]',
    x: 320,
    y: 28,
    stepIndex: 0,
    kind: 'root',
  },
  {
    id: 'cs-2',
    parentId: 'cs-root',
    depth: 2,
    label: '+2 → rem=5',
    sublabel: '[2]',
    x: 165,
    y: 86,
    stepIndex: 1,
    kind: 'call',
  },
  {
    id: 'cs-22',
    parentId: 'cs-2',
    depth: 3,
    label: '+2 → rem=3',
    sublabel: '[2,2]',
    x: 155,
    y: 146,
    stepIndex: 2,
    kind: 'call',
  },
  {
    id: 'cs-222',
    parentId: 'cs-22',
    depth: 4,
    label: '+2 → rem=1',
    sublabel: '2 > 1 break',
    x: 88,
    y: 214,
    stepIndex: 3,
    kind: 'prune',
  },
  {
    id: 'cs-223',
    parentId: 'cs-22',
    depth: 4,
    label: '+3 → rem=0',
    sublabel: 'BASE [2,2,3]',
    x: 245,
    y: 214,
    stepIndex: 4,
    kind: 'solution',
  },
  {
    id: 'cs-3',
    parentId: 'cs-root',
    depth: 2,
    label: '+3 → rem=4',
    sublabel: '3+3>4 prune',
    x: 360,
    y: 86,
    stepIndex: 5,
    kind: 'backtrack',
  },
  {
    id: 'cs-7',
    parentId: 'cs-root',
    depth: 2,
    label: '+7 → rem=0',
    sublabel: 'BASE [7]',
    x: 525,
    y: 86,
    stepIndex: 6,
    kind: 'solution',
  },
];

export const COMB_SUM_TRACE: RecursionTraceStep[] = [
  {
    step: 0,
    action: 'call',
    title: 'Root Call: dfs(idx = 0, rem = 7) on Sorted [2, 3, 6, 7]',
    explanation:
      'Sort candidates ascending first so any overshoot cands[j] > rem immediately breaks the entire remaining loop.',
    activeNodeId: 'cs-root',
    activeLineNumbers: [1, 3],
    stack: [{ fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'path=[]', status: 'active' }],
    depth: 1,
    peakDepth: 1,
    exploredCount: 1,
    prunedCount: 0,
    currentPath: [],
    remainingTarget: 7,
    activeCandidateIdx: 0,
    emittedCombinations: [],
  },
  {
    step: 1,
    action: 'call',
    title: 'Choose 2 → Recurse dfs(idx = 0, rem = 5)',
    explanation:
      '2 ≤ 7, so push 2 and pass j = 0 again (allowing unbounded reuse of 2) with rem = 7 − 2 = 5.',
    activeNodeId: 'cs-2',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=5)', depth: 2, state: 'path=[2]', status: 'active' },
    ],
    depth: 2,
    peakDepth: 2,
    exploredCount: 2,
    prunedCount: 0,
    currentPath: [2],
    remainingTarget: 5,
    activeCandidateIdx: 0,
    prunedFromIdx: 2,
    emittedCombinations: [],
  },
  {
    step: 2,
    action: 'call',
    title: 'Reuse 2 → Recurse dfs(idx = 0, rem = 3)',
    explanation:
      'Push a second 2 onto path = [2, 2]. Remaining sum drops to 3, which automatically prunes 6 and 7.',
    activeNodeId: 'cs-22',
    activeLineNumbers: [5, 6],
    stack: [
      { fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=5)', depth: 2, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=3)', depth: 3, state: 'path=[2,2]', status: 'active' },
    ],
    depth: 3,
    peakDepth: 3,
    exploredCount: 3,
    prunedCount: 2,
    currentPath: [2, 2],
    remainingTarget: 3,
    activeCandidateIdx: 0,
    prunedFromIdx: 2,
    emittedCombinations: [],
  },
  {
    step: 3,
    action: 'prune',
    title: 'Overshoot Prune at rem = 1: cands[0] = 2 > 1 → break!',
    explanation:
      'Trying a third 2 leaves rem = 1. Since the smallest candidate (2) exceeds 1, line 4 breaks out of the entire loop in O(1).',
    activeNodeId: 'cs-222',
    activeLineNumbers: [4],
    stack: [
      { fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=5)', depth: 2, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=3)', depth: 3, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=1)', depth: 4, state: '2 > 1 → break', status: 'pruned' },
    ],
    depth: 4,
    peakDepth: 4,
    exploredCount: 4,
    prunedCount: 6,
    currentPath: [2, 2, 2],
    remainingTarget: 1,
    activeCandidateIdx: 0,
    prunedFromIdx: 0,
    emittedCombinations: [],
  },
  {
    step: 4,
    action: 'solution',
    title: 'Pop 2 → Try 3 → Base Case rem === 0 Emits [2, 2, 3]!',
    explanation:
      'Backtrack to path = [2, 2], choose 3 → rem = 0 triggers line 2 Base Case! Snapshot [2, 2, 3] and unwind.',
    activeNodeId: 'cs-223',
    activeLineNumbers: [2],
    stack: [
      { fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=5)', depth: 2, state: 'chose 2', status: 'waiting' },
      { fn: 'dfs(idx=0, rem=3)', depth: 3, state: 'chose 3', status: 'waiting' },
      { fn: 'dfs(idx=1, rem=0)', depth: 4, state: 'BASE → [2,2,3]', status: 'returning' },
    ],
    depth: 4,
    peakDepth: 4,
    exploredCount: 5,
    prunedCount: 6,
    currentPath: [2, 2, 3],
    remainingTarget: 0,
    activeCandidateIdx: 1,
    emittedCombinations: [[2, 2, 3]],
  },
  {
    step: 5,
    action: 'backtrack',
    title: 'Unwind to Root → Try 3 (rem = 4) → Suffix Pruned',
    explanation:
      'Pop all 2s so path is clean. Branch [3] leaves rem = 4; reusing 3 leaves rem = 1 < 3 (pruned), and 6 > 4 (pruned).',
    activeNodeId: 'cs-3',
    activeLineNumbers: [7, 4],
    stack: [
      { fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'try j=1 (val 3)', status: 'waiting' },
      { fn: 'dfs(idx=1, rem=4)', depth: 2, state: '6 > 4 → prune', status: 'active' },
    ],
    depth: 2,
    peakDepth: 4,
    exploredCount: 7,
    prunedCount: 9,
    currentPath: [3],
    remainingTarget: 4,
    activeCandidateIdx: 1,
    prunedFromIdx: 2,
    emittedCombinations: [[2, 2, 3]],
  },
  {
    step: 6,
    action: 'solution',
    title: 'Root Branch j = 3 (val 7) → Base Case rem === 0 Emits [7]!',
    explanation:
      'After 6 leaves rem = 1 (pruned immediately), selecting 7 hits rem === 0 at depth 2 — emitting the final combination [7].',
    activeNodeId: 'cs-7',
    activeLineNumbers: [5, 2],
    stack: [
      { fn: 'dfs(idx=0, rem=7)', depth: 1, state: 'chose 7', status: 'waiting' },
      { fn: 'dfs(idx=3, rem=0)', depth: 2, state: 'BASE → [7]', status: 'returning' },
    ],
    depth: 2,
    peakDepth: 4,
    exploredCount: 9,
    prunedCount: 11,
    currentPath: [7],
    remainingTarget: 0,
    activeCandidateIdx: 3,
    emittedCombinations: [[2, 2, 3], [7]],
  },
];

export const RECURSION_PROBLEMS: Record<RecursionProblemId, RecursionProblemConfig> = {
  'n-queens': {
    id: 'n-queens',
    shortLabel: 'N-Queens (4×4)',
    title: 'N-Queens Constraint Backtracking (4×4 Board)',
    complexitySummary: 'Time: O(N!) pruned · Stack Depth: O(N + 1)',
    baseCaseSummary: 'row === N → snapshot valid board & return',
    recursiveStepSummary: 'Lock (col, row-c, row+c) → solve(row + 1) → undo sets',
    codeLines: NQUEENS_CODE,
    treeNodes: NQUEENS_TREE,
    trace: NQUEENS_TRACE,
  },
  subsets: {
    id: 'subsets',
    shortLabel: 'Subsets ([1, 2, 3])',
    title: 'Power Set Subsets Generation ([1, 2, 3])',
    complexitySummary: 'Time: O(N · 2^N) · Stack Depth: O(N + 1)',
    baseCaseSummary: 'Snapshot [...path] at every frame; return at start === N',
    recursiveStepSummary: 'path.push(nums[i]) → dfs(i + 1) → path.pop()',
    codeLines: SUBSETS_CODE,
    treeNodes: SUBSETS_TREE,
    trace: SUBSETS_TRACE,
  },
  'combination-sum': {
    id: 'combination-sum',
    shortLabel: 'Combination Sum (target = 7)',
    title: 'Combination Sum with Sorted Branch & Bound',
    complexitySummary: 'Time: O(N^(T/min)) pruned · Stack Depth: O(T/min)',
    baseCaseSummary: 'rem === 0 → emit [...path]; cands[j] > rem → break loop',
    recursiveStepSummary: 'path.push(cands[j]) → dfs(j, rem - cands[j]) → path.pop()',
    codeLines: COMB_SUM_CODE,
    treeNodes: COMB_SUM_TREE,
    trace: COMB_SUM_TRACE,
  },
};

export const BUILDING_BLOCKS_CHALLENGES: BuildingBlocksChallenge[] = [
  {
    id: 'n-queens',
    title: 'N-Queens (4×4 Board)',
    subtitle: 'Separate Base Case & Conflict Pruning Guards from Recursive Placement & Backtrack Undo.',
    blocks: [
      {
        id: 'nq-b1',
        label: 'Row Completion Check',
        code: 'if (row === n) { res.push(formatBoard(board)); return; }',
        correctBucket: 'base-case',
        explanation:
          'Base Case: stops recursion once all N rows have a valid queen and records a snapshot copy.',
      },
      {
        id: 'nq-b2',
        label: 'Column & Diagonal Conflict Guard',
        code: 'if (cols.has(c) || d1.has(row - c) || d2.has(row + c)) continue;',
        correctBucket: 'base-case',
        explanation:
          'Pruning Guard: rejects attacked cells in O(1) before pushing an invalid recursive frame.',
      },
      {
        id: 'nq-b3',
        label: 'Commit Queen & Lock Sets',
        code: 'board[row][c] = "Q"; cols.add(c); d1.add(row - c); d2.add(row + c);',
        correctBucket: 'recursive-step',
        explanation:
          'Choose Step: mutates board and occupancy sets before recursing to row + 1.',
      },
      {
        id: 'nq-b4',
        label: 'Descend to Next Row',
        code: 'solve(row + 1);',
        correctBucket: 'recursive-step',
        explanation:
          'Recursive Call: advances strictly toward the base case (row === n) by incrementing row.',
      },
      {
        id: 'nq-b5',
        label: 'Unchoose Queen & Release Sets',
        code: 'board[row][c] = "."; cols.delete(c); d1.delete(row - c); d2.delete(row + c);',
        correctBucket: 'recursive-step',
        explanation:
          'Backtrack Step: restores exact board state on stack unwind so sibling columns are not corrupted.',
      },
      {
        id: 'nq-b6',
        label: 'Invalid Board Dimension Guard',
        code: 'if (n === 2 || n === 3) return [];',
        correctBucket: 'base-case',
        explanation:
          'Base / Edge Guard: immediately terminates impossible board sizes without exploring any frames.',
      },
    ],
  },
  {
    id: 'subsets',
    title: 'Subsets Power Set ([1, 2, 3])',
    subtitle: 'Classify Termination / Snapshot Guards vs. Recursive Choose-Explore-Unchoose Steps.',
    blocks: [
      {
        id: 'sub-b1',
        label: 'Snapshot Current Path Copy',
        code: 'res.push([...path]);',
        correctBucket: 'base-case',
        explanation:
          'Leaf/Node Recording: captures an immutable copy of path before looping further.',
      },
      {
        id: 'sub-b2',
        label: 'Index Boundary Termination',
        code: 'if (start === nums.length) return;',
        correctBucket: 'base-case',
        explanation:
          'Base Case: halts deeper calls once all input indices have been considered.',
      },
      {
        id: 'sub-b3',
        label: 'Choose Current Element',
        code: 'path.push(nums[i]);',
        correctBucket: 'recursive-step',
        explanation:
          'Choose Step: includes nums[i] in the active subset branch before recursing.',
      },
      {
        id: 'sub-b4',
        label: 'Recurse on Remaining Suffix',
        code: 'dfs(i + 1, path);',
        correctBucket: 'recursive-step',
        explanation:
          'Recursive Call: moves strictly forward to i + 1 so combinations never duplicate in reverse order.',
      },
      {
        id: 'sub-b5',
        label: 'Pop to Restore Sibling Path',
        code: 'path.pop();',
        correctBucket: 'recursive-step',
        explanation:
          'Unchoose Step: undoes the last push when returning from child frame.',
      },
      {
        id: 'sub-b6',
        label: 'Duplicate Sibling Prune (Subsets II)',
        code: 'if (i > start && nums[i] === nums[i - 1]) continue;',
        correctBucket: 'base-case',
        explanation:
          'Pruning Guard: skips identical values at the same recursion depth on sorted inputs.',
      },
    ],
  },
  {
    id: 'combination-sum',
    title: 'Combination Sum (Branch & Bound)',
    subtitle: 'Separate Base / Sorted Overshoot Cutoffs from Recursive Reduction & Undo.',
    blocks: [
      {
        id: 'cs-b1',
        label: 'Exact Target Base Case',
        code: 'if (rem === 0) { res.push([...path]); return; }',
        correctBucket: 'base-case',
        explanation:
          'Base Case: remaining sum hit zero — emit valid combination and stop descending.',
      },
      {
        id: 'cs-b2',
        label: 'Sorted Suffix Break Guard',
        code: 'if (cands[j] > rem) break;',
        correctBucket: 'base-case',
        explanation:
          'Pruning Guard: because candidates are sorted ascending, all remaining items also overshoot rem.',
      },
      {
        id: 'cs-b3',
        label: 'Push Candidate to Path',
        code: 'path.push(cands[j]);',
        correctBucket: 'recursive-step',
        explanation:
          'Choose Step: commits candidate cands[j] into the current combination.',
      },
      {
        id: 'cs-b4',
        label: 'Recurse with Reduced Remaining Sum',
        code: 'dfs(j, rem - cands[j]);',
        correctBucket: 'recursive-step',
        explanation:
          'Recursive Call: shrinks rem toward 0 while allowing reuse of index j.',
      },
      {
        id: 'cs-b5',
        label: 'Pop Candidate on Unwind',
        code: 'path.pop();',
        correctBucket: 'recursive-step',
        explanation:
          'Backtrack Step: restores path cleanly before advancing to j + 1.',
      },
    ],
  },
];
