import type {
  CallStackFrameItem,
  CodeLineSpec,
  RecursionTreeNode,
  RecursionTraceStep,
} from '../../features/recursion-lab/data/recursionLabData';

export type LiveRecursionAlgorithm =
  | 'n-queens'
  | 'word-search'
  | 'subsets'
  | 'combination-sum'
  | 'permutations';

export interface RecursionStateMachineConfig {
  algorithm: LiveRecursionAlgorithm;
  /** N-Queens board size (3 or 4) */
  boardSize?: number;
  /** Target word for Word Search 2D grid DFS ('ABCCED' | 'SEE' | 'ABCB') */
  targetWord?: string;
  /** Input set for Subsets / Permutations (length 2..3) */
  elements?: number[];
  /** Candidates & target for Combination Sum */
  candidates?: number[];
  target?: number;
}

export interface GeneratedExecutionTrace {
  algorithm: LiveRecursionAlgorithm;
  title: string;
  complexitySummary: string;
  codeLines: CodeLineSpec[];
  treeNodes: RecursionTreeNode[];
  executionTrace: RecursionTraceStep[];
}

const NQUEENS_LINES: CodeLineSpec[] = [
  { lineNumber: 1, code: 'function solve(row: number) {', role: 'signature', roleLabel: 'Frame Entry' },
  { lineNumber: 2, code: '  if (row === N) { res.push([...queens]); return; }', role: 'base-case', roleLabel: 'Base Case' },
  { lineNumber: 3, code: '  for (let c = 0; c < N; c++) {', role: 'signature', roleLabel: 'Branch Loop' },
  { lineNumber: 4, code: '    if (cols.has(c) || d1.has(row-c) || d2.has(row+c)) continue;', role: 'prune-guard', roleLabel: 'Prune Guard' },
  { lineNumber: 5, code: '    queens.push(c); mark(row, c);', role: 'choose', roleLabel: 'Choose' },
  { lineNumber: 6, code: '    solve(row + 1); // push child frame', role: 'recurse', roleLabel: 'Recursive Step' },
  { lineNumber: 7, code: '    queens.pop(); unmark(row, c);', role: 'backtrack', roleLabel: 'Backtrack Undo' },
  { lineNumber: 8, code: '  }', role: 'signature', roleLabel: 'End Loop' },
];

const SUBSETS_LINES: CodeLineSpec[] = [
  { lineNumber: 1, code: 'function dfs(idx: number, path: number[]) {', role: 'signature', roleLabel: 'Frame Entry' },
  { lineNumber: 2, code: '  res.push([...path]); // capture prefix subset', role: 'base-case', roleLabel: 'Emit Subset' },
  { lineNumber: 3, code: '  for (let i = idx; i < nums.length; i++) {', role: 'signature', roleLabel: 'Choice Loop' },
  { lineNumber: 4, code: '    path.push(nums[i]); // choose element', role: 'choose', roleLabel: 'Choose' },
  { lineNumber: 5, code: '    dfs(i + 1, path); // recurse deeper', role: 'recurse', roleLabel: 'Recursive Step' },
  { lineNumber: 6, code: '    path.pop(); // restore parent path', role: 'backtrack', roleLabel: 'Backtrack Undo' },
  { lineNumber: 7, code: '  }', role: 'signature', roleLabel: 'Unwind Frame' },
];

const COMBINATION_LINES: CodeLineSpec[] = [
  { lineNumber: 1, code: 'function dfs(start: number, rem: number, path: number[]) {', role: 'signature', roleLabel: 'Frame Entry' },
  { lineNumber: 2, code: '  if (rem === 0) { res.push([...path]); return; }', role: 'base-case', roleLabel: 'Base Case' },
  { lineNumber: 3, code: '  for (let i = start; i < cands.length; i++) {', role: 'signature', roleLabel: 'Sorted Loop' },
  { lineNumber: 4, code: '    if (cands[i] > rem) break; // sorted bound prune', role: 'prune-guard', roleLabel: 'Prune Guard' },
  { lineNumber: 5, code: '    path.push(cands[i]);', role: 'choose', roleLabel: 'Choose' },
  { lineNumber: 6, code: '    dfs(i, rem - cands[i], path); // reuse index i', role: 'recurse', roleLabel: 'Recursive Step' },
  { lineNumber: 7, code: '    path.pop();', role: 'backtrack', roleLabel: 'Backtrack Undo' },
  { lineNumber: 8, code: '  }', role: 'signature', roleLabel: 'End Frame' },
];

const PERMUTATIONS_LINES: CodeLineSpec[] = [
  { lineNumber: 1, code: 'function permute(path: number[], used: boolean[]) {', role: 'signature', roleLabel: 'Frame Entry' },
  { lineNumber: 2, code: '  if (path.length === nums.length) { res.push([...path]); return; }', role: 'base-case', roleLabel: 'Base Case' },
  { lineNumber: 3, code: '  for (let i = 0; i < nums.length; i++) {', role: 'signature', roleLabel: 'Choice Loop' },
  { lineNumber: 4, code: '    if (used[i]) continue; // skip already placed', role: 'prune-guard', roleLabel: 'Used Guard' },
  { lineNumber: 5, code: '    used[i] = true; path.push(nums[i]);', role: 'choose', roleLabel: 'Choose' },
  { lineNumber: 6, code: '    permute(path, used); // descend depth + 1', role: 'recurse', roleLabel: 'Recursive Step' },
  { lineNumber: 7, code: '    path.pop(); used[i] = false;', role: 'backtrack', roleLabel: 'Backtrack Undo' },
  { lineNumber: 8, code: '  }', role: 'signature', roleLabel: 'End Frame' },
];

const WORD_SEARCH_LINES: CodeLineSpec[] = [
  { lineNumber: 1, code: 'function dfs(r: number, c: number, idx: number): boolean {', role: 'signature', roleLabel: 'Frame Entry' },
  { lineNumber: 2, code: '  if (idx === word.length) return true; // matched all chars', role: 'base-case', roleLabel: 'Base Case' },
  { lineNumber: 3, code: '  if (outOfBounds || board[r][c] !== word[idx]) return false;', role: 'prune-guard', roleLabel: 'Prune Guard' },
  { lineNumber: 4, code: '  const saved = board[r][c]; board[r][c] = "#"; // mark visited', role: 'choose', roleLabel: 'Choose Cell' },
  { lineNumber: 5, code: '  for (const [dr, dc] of DIRS) {', role: 'signature', roleLabel: '4-Dir Loop' },
  { lineNumber: 6, code: '    if (dfs(r + dr, c + dc, idx + 1)) return true;', role: 'recurse', roleLabel: 'Recursive Step' },
  { lineNumber: 7, code: '  }', role: 'signature', roleLabel: 'End Loop' },
  { lineNumber: 8, code: '  board[r][c] = saved; return false; // undo & backtrack', role: 'backtrack', roleLabel: 'Backtrack Undo' },
];

function layoutTreeNodes(nodes: RecursionTreeNode[]): RecursionTreeNode[] {
  const byDepth = new Map<number, RecursionTreeNode[]>();
  for (const n of nodes) {
    const arr = byDepth.get(n.depth) ?? [];
    arr.push(n);
    byDepth.set(n.depth, arr);
  }
  const maxDepth = Math.max(...nodes.map((n) => n.depth), 1);
  return nodes.map((n) => {
    const siblings = byDepth.get(n.depth) ?? [n];
    const idx = siblings.findIndex((s) => s.id === n.id);
    const x = Math.round(((idx + 1) / (siblings.length + 1)) * 600 + 20);
    const y = Math.round(28 + ((n.depth - 1) / Math.max(1, maxDepth - 1)) * 195);
    return { ...n, x, y };
  });
}

function snapshotStack(
  frames: { fn: string; depth: number; state: string }[],
  topStatus: CallStackFrameItem['status'],
): CallStackFrameItem[] {
  return frames.map((f, idx) => ({
    fn: f.fn,
    depth: f.depth,
    state: f.state,
    status: idx === frames.length - 1 ? topStatus : 'waiting',
  }));
}

/**
 * Pure TypeScript State-Machine Execution Trace Generator.
 * Deterministically executes the chosen recursion/backtracking algorithm and emits
 * real-time call-stack frames, parent-child tree edges, depth markers, and line mappings.
 */
export function generateExecutionTrace(
  config: RecursionStateMachineConfig,
): GeneratedExecutionTrace {
  const MAX_STEPS = 42;
  const trace: RecursionTraceStep[] = [];
  const rawNodes: RecursionTreeNode[] = [];
  let nodeSeq = 0;
  let exploredCount = 0;
  let prunedCount = 0;
  let peakDepth = 1;

  const pushNode = (
    parentId: string | null,
    depth: number,
    label: string,
    sublabel: string,
    kind: RecursionTreeNode['kind'],
  ): string => {
    const id = `rt-${++nodeSeq}`;
    rawNodes.push({
      id,
      parentId,
      depth,
      label,
      sublabel,
      x: 320,
      y: 28,
      stepIndex: trace.length,
      kind,
    });
    return id;
  };

  if (config.algorithm === 'n-queens') {
    const n = Math.max(3, Math.min(4, config.boardSize ?? 4));
    const queens: number[] = [];
    const cols = new Set<number>();
    const d1 = new Set<number>();
    const d2 = new Set<number>();
    const stackFrames: { fn: string; depth: number; state: string }[] = [];
    let foundFirstSolution = false;

    const solve = (row: number, parentId: string | null) => {
      if (trace.length >= MAX_STEPS || foundFirstSolution) return;
      const depth = row + 1;
      peakDepth = Math.max(peakDepth, depth);
      exploredCount++;

      const fnLabel = `solve(r=${row})`;
      const nodeLabel = row === 0 ? `solve(r=0)` : `Q(${row - 1},${queens[row - 1]})→r=${row}`;
      const isBase = row === n;
      const nodeId = pushNode(
        parentId,
        depth,
        nodeLabel,
        isBase ? 'SOLUTION' : `queens=[${queens.join(',')}]`,
        row === 0 ? 'root' : isBase ? 'solution' : 'call',
      );

      stackFrames.push({
        fn: fnLabel,
        depth,
        state: `queens=[${queens.join(', ')}]`,
      });

      if (isBase) {
        foundFirstSolution = true;
        trace.push({
          step: trace.length,
          action: 'solution',
          title: `Base Case Reached: row === ${n}`,
          explanation: `Valid ${n}-Queens placement [${queens.join(', ')}] recorded at Depth ${depth}! Returning to parent frame.`,
          activeNodeId: nodeId,
          activeLineNumbers: [2],
          stack: snapshotStack(stackFrames, 'returning'),
          depth,
          peakDepth,
          exploredCount,
          prunedCount,
          queens: [...queens],
        });
        stackFrames.pop();
        return;
      }

      trace.push({
        step: trace.length,
        action: 'call',
        title: `Enter ${fnLabel} (Depth ${depth})`,
        explanation: `Scanning columns 0..${n - 1} for row ${row} with active queens [${queens.join(', ')}].`,
        activeNodeId: nodeId,
        activeLineNumbers: [1, 3],
        stack: snapshotStack(stackFrames, 'active'),
        depth,
        peakDepth,
        exploredCount,
        prunedCount,
        queens: [...queens],
      });

      let placedAny = false;
      for (let c = 0; c < n; c++) {
        if (trace.length >= MAX_STEPS || foundFirstSolution) break;
        if (cols.has(c) || d1.has(row - c) || d2.has(row + c)) {
          prunedCount++;
          continue;
        }
        placedAny = true;
        queens.push(c);
        cols.add(c);
        d1.add(row - c);
        d2.add(row + c);

        solve(row + 1, nodeId);

        queens.pop();
        cols.delete(c);
        d1.delete(row - c);
        d2.delete(row + c);

        if (!foundFirstSolution && trace.length < MAX_STEPS) {
          trace.push({
            step: trace.length,
            action: 'backtrack',
            title: `Backtrack to ${fnLabel} (Undo Q(${row},${c}))`,
            explanation: `Popped Q(${row},${c}) and freed col ${c} + diagonals; resuming ${fnLabel} loop.`,
            activeNodeId: nodeId,
            activeLineNumbers: [7],
            stack: snapshotStack(stackFrames, 'active'),
            depth,
            peakDepth,
            exploredCount,
            prunedCount,
            queens: [...queens],
          });
        }
      }

      if (!placedAny && trace.length < MAX_STEPS) {
        const pruneId = pushNode(nodeId, depth + 1, `dead(r=${row})`, '0 safe cols', 'prune');
        trace.push({
          step: trace.length,
          action: 'prune',
          title: `Pruned Dead Branch at row ${row}`,
          explanation: `All ${n} columns in row ${row} conflict with existing queens [${queens.join(', ')}]. Unwinding to parent.`,
          activeNodeId: pruneId,
          activeLineNumbers: [4],
          stack: snapshotStack(stackFrames, 'pruned'),
          depth,
          peakDepth,
          exploredCount,
          prunedCount,
          queens: [...queens],
        });
      }

      stackFrames.pop();
    };

    solve(0, null);
    return {
      algorithm: 'n-queens',
      title: `N-Queens (${n}×${n}) Live State Machine Trace`,
      complexitySummary: `O(N!) pruned · Stack Space O(${n})`,
      codeLines: NQUEENS_LINES,
      treeNodes: layoutTreeNodes(rawNodes),
      executionTrace: trace,
    };
  }

  if (config.algorithm === 'word-search') {
    const grid: string[][] = [
      ['A', 'B', 'C', 'E'],
      ['S', 'F', 'C', 'S'],
      ['A', 'D', 'E', 'E'],
    ];
    const word = (config.targetWord || 'ABCCED').toUpperCase();
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set<string>();
    const pathCells: [number, number][] = [];
    const stackFrames: { fn: string; depth: number; state: string }[] = [];
    const dirs: [number, number, string][] = [
      [0, 1, 'R'],
      [1, 0, 'D'],
      [0, -1, 'L'],
      [-1, 0, 'U'],
    ];
    let foundWord = false;

    const dfs = (r: number, c: number, idx: number, parentId: string | null): boolean => {
      if (trace.length >= MAX_STEPS || foundWord) return false;
      const depth = stackFrames.length + 1;
      peakDepth = Math.max(peakDepth, depth);
      exploredCount++;

      const fnLabel = `dfs(${r},${c},i=${idx})`;
      const cellChar = grid[r][c];
      const prefix = word.slice(0, idx + 1);
      const isMatchLeaf = idx === word.length - 1;

      const nodeId = pushNode(
        parentId,
        depth,
        `${cellChar}(${r},${c})`,
        isMatchLeaf ? `FOUND "${word}"` : `match="${prefix}"`,
        depth === 1 ? 'root' : isMatchLeaf ? 'solution' : 'call',
      );

      visited.add(`${r},${c}`);
      pathCells.push([r, c]);
      stackFrames.push({
        fn: fnLabel,
        depth,
        state: `cell='${cellChar}' matched="${prefix}"`,
      });

      if (isMatchLeaf) {
        foundWord = true;
        trace.push({
          step: trace.length,
          action: 'solution',
          title: `Word Found: "${word}" at (${r},${c})`,
          explanation: `Matched final character '${cellChar}' at Depth ${depth}! Base case returns true up the entire active call stack.`,
          activeNodeId: nodeId,
          activeLineNumbers: [2],
          stack: snapshotStack(stackFrames, 'returning'),
          depth,
          peakDepth,
          exploredCount,
          prunedCount,
          wordGrid: grid,
          targetWord: word,
          visitedCells: pathCells.map(([rr, cc]) => [rr, cc]),
          activeCell: [r, c],
          matchedPrefix: prefix,
        });
        pathCells.pop();
        visited.delete(`${r},${c}`);
        stackFrames.pop();
        return true;
      }

      trace.push({
        step: trace.length,
        action: 'call',
        title: `Match '${cellChar}' at (${r},${c}) · Depth ${depth}`,
        explanation: `Marked (${r},${c}) as visited ('#'). Searching 4-neighbors for next character '${word[idx + 1]}'.`,
        activeNodeId: nodeId,
        activeLineNumbers: [1, 4, 5],
        stack: snapshotStack(stackFrames, 'active'),
        depth,
        peakDepth,
        exploredCount,
        prunedCount,
        wordGrid: grid,
        targetWord: word,
        visitedCells: pathCells.map(([rr, cc]) => [rr, cc]),
        activeCell: [r, c],
        matchedPrefix: prefix,
      });

      let triedAnyNeighbor = false;
      for (const [dr, dc, dirName] of dirs) {
        if (trace.length >= MAX_STEPS || foundWord) break;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (visited.has(`${nr},${nc}`)) {
          prunedCount++;
          continue;
        }
        if (grid[nr][nc] !== word[idx + 1]) {
          prunedCount++;
          continue;
        }
        triedAnyNeighbor = true;
        if (dfs(nr, nc, idx + 1, nodeId)) {
          pathCells.pop();
          visited.delete(`${r},${c}`);
          stackFrames.pop();
          return true;
        }
        if (!foundWord && trace.length < MAX_STEPS) {
          trace.push({
            step: trace.length,
            action: 'backtrack',
            title: `Backtrack to (${r},${c}) after ${dirName}→(${nr},${nc}) failed`,
            explanation: `Child frame dfs(${nr},${nc},i=${idx + 1}) returned false and popped. Resuming ${fnLabel} to try remaining directions.`,
            activeNodeId: nodeId,
            activeLineNumbers: [6, 8],
            stack: snapshotStack(stackFrames, 'active'),
            depth,
            peakDepth,
            exploredCount,
            prunedCount,
            wordGrid: grid,
            targetWord: word,
            visitedCells: pathCells.map(([rr, cc]) => [rr, cc]),
            activeCell: [r, c],
            matchedPrefix: prefix,
          });
        }
      }

      if (!triedAnyNeighbor && trace.length < MAX_STEPS) {
        const pruneId = pushNode(
          nodeId,
          depth + 1,
          `dead('${word[idx + 1]}')`,
          'no valid nbr',
          'prune',
        );
        trace.push({
          step: trace.length,
          action: 'prune',
          title: `Dead End at (${r},${c}) — Unmark & Pop`,
          explanation: `No unvisited neighbor holds '${word[idx + 1]}'. Restoring board[${r}][${c}] = '${cellChar}' and unwinding to parent frame.`,
          activeNodeId: pruneId,
          activeLineNumbers: [3, 8],
          stack: snapshotStack(stackFrames, 'pruned'),
          depth,
          peakDepth,
          exploredCount,
          prunedCount,
          wordGrid: grid,
          targetWord: word,
          visitedCells: pathCells.map(([rr, cc]) => [rr, cc]),
          activeCell: [r, c],
          matchedPrefix: prefix,
        });
      }

      pathCells.pop();
      visited.delete(`${r},${c}`);
      stackFrames.pop();
      return false;
    };

    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === word[0]) {
          if (dfs(r, c, 0, null)) break outer;
          if (trace.length >= MAX_STEPS) break outer;
        }
      }
    }

    return {
      algorithm: 'word-search',
      title: `Word Search ("${word}" on 3×4 Grid) Live DFS Backtracking Trace`,
      complexitySummary: `O(M·N·3^L) · Call Stack Space O(${word.length})`,
      codeLines: WORD_SEARCH_LINES,
      treeNodes: layoutTreeNodes(rawNodes),
      executionTrace: trace,
    };
  }

  if (config.algorithm === 'subsets') {
    const nums = (config.elements && config.elements.length > 0 ? config.elements : [1, 2, 3]).slice(0, 3);
    const path: number[] = [];
    const emitted: number[][] = [];
    const stackFrames: { fn: string; depth: number; state: string }[] = [];

    const dfs = (idx: number, parentId: string | null) => {
      if (trace.length >= MAX_STEPS) return;
      const depth = stackFrames.length + 1;
      peakDepth = Math.max(peakDepth, depth);
      exploredCount++;

      const fnLabel = `dfs(idx=${idx})`;
      const nodeId = pushNode(
        parentId,
        depth,
        `[${path.join(',')}]`,
        `idx=${idx}`,
        depth === 1 ? 'root' : 'solution',
      );
      stackFrames.push({
        fn: fnLabel,
        depth,
        state: `path=[${path.join(', ')}]`,
      });
      emitted.push([...path]);

      trace.push({
        step: trace.length,
        action: depth === 1 ? 'call' : 'solution',
        title: `Emit Subset [${path.join(', ')}] at Depth ${depth}`,
        explanation: `Frame ${fnLabel} records [${path.join(', ')}] (${emitted.length} total subsets captured).`,
        activeNodeId: nodeId,
        activeLineNumbers: [1, 2],
        stack: snapshotStack(stackFrames, 'active'),
        depth,
        peakDepth,
        exploredCount,
        prunedCount,
        currentPath: [...path],
        emittedSubsets: emitted.map((s) => [...s]),
      });

      for (let i = idx; i < nums.length; i++) {
        if (trace.length >= MAX_STEPS) break;
        path.push(nums[i]);
        dfs(i + 1, nodeId);
        const popped = path.pop();
        if (trace.length < MAX_STEPS) {
          trace.push({
            step: trace.length,
            action: 'backtrack',
            title: `Unchoose ${popped} → Back in ${fnLabel}`,
            explanation: `Popped ${popped} from path to restore [${path.join(', ')}] before next sibling choice.`,
            activeNodeId: nodeId,
            activeLineNumbers: [6],
            stack: snapshotStack(stackFrames, 'active'),
            depth,
            peakDepth,
            exploredCount,
            prunedCount,
            currentPath: [...path],
            emittedSubsets: emitted.map((s) => [...s]),
          });
        }
      }
      stackFrames.pop();
    };

    dfs(0, null);
    return {
      algorithm: 'subsets',
      title: `Subsets [${nums.join(', ')}] Live Power-Set Trace`,
      complexitySummary: `O(N · 2^N) · Stack Space O(${nums.length})`,
      codeLines: SUBSETS_LINES,
      treeNodes: layoutTreeNodes(rawNodes),
      executionTrace: trace,
    };
  }

  if (config.algorithm === 'combination-sum') {
    const cands = [...(config.candidates && config.candidates.length > 0 ? config.candidates : [2, 3, 6])].sort((a, b) => a - b);
    const target = Math.max(2, Math.min(8, config.target ?? 6));
    const path: number[] = [];
    const emitted: number[][] = [];
    const stackFrames: { fn: string; depth: number; state: string }[] = [];

    const dfs = (start: number, rem: number, parentId: string | null) => {
      if (trace.length >= MAX_STEPS) return;
      const depth = stackFrames.length + 1;
      peakDepth = Math.max(peakDepth, depth);
      exploredCount++;

      const fnLabel = `dfs(i=${start}, rem=${rem})`;
      const isHit = rem === 0;
      const nodeId = pushNode(
        parentId,
        depth,
        isHit ? `✓ [${path.join('+')}]` : `rem=${rem}`,
        `path=[${path.join(',')}]`,
        depth === 1 ? 'root' : isHit ? 'solution' : 'call',
      );
      stackFrames.push({
        fn: fnLabel,
        depth,
        state: `rem=${rem}, path=[${path.join(', ')}]`,
      });

      if (isHit) {
        emitted.push([...path]);
        trace.push({
          step: trace.length,
          action: 'solution',
          title: `Target Reached: [${path.join(' + ')}] = ${target}`,
          explanation: `Remaining target === 0 at Depth ${depth}! Captured combination and returning to parent.`,
          activeNodeId: nodeId,
          activeLineNumbers: [2],
          stack: snapshotStack(stackFrames, 'returning'),
          depth,
          peakDepth,
          exploredCount,
          prunedCount,
          remainingTarget: 0,
          currentPath: [...path],
          emittedCombinations: emitted.map((c) => [...c]),
        });
        stackFrames.pop();
        return;
      }

      trace.push({
        step: trace.length,
        action: 'call',
        title: `Enter ${fnLabel} (Depth ${depth})`,
        explanation: `Trying sorted candidates from index ${start} ([${cands.slice(start).join(', ')}]) with remaining=${rem}.`,
        activeNodeId: nodeId,
        activeLineNumbers: [1, 3],
        stack: snapshotStack(stackFrames, 'active'),
        depth,
        peakDepth,
        exploredCount,
        prunedCount,
        remainingTarget: rem,
        currentPath: [...path],
        emittedCombinations: emitted.map((c) => [...c]),
      });

      for (let i = start; i < cands.length; i++) {
        if (trace.length >= MAX_STEPS) break;
        if (cands[i] > rem) {
          prunedCount += cands.length - i;
          const pruneId = pushNode(nodeId, depth + 1, `prune ${cands[i]}>${rem}`, 'sorted break', 'prune');
          trace.push({
            step: trace.length,
            action: 'prune',
            title: `Sorted Bound Prune: ${cands[i]} > ${rem}`,
            explanation: `Since candidates are sorted, ${cands.slice(i).join(', ')} all exceed rem=${rem} — break immediately!`,
            activeNodeId: pruneId,
            activeLineNumbers: [4],
            stack: snapshotStack(stackFrames, 'pruned'),
            depth,
            peakDepth,
            exploredCount,
            prunedCount,
            remainingTarget: rem,
            prunedFromIdx: i,
            currentPath: [...path],
            emittedCombinations: emitted.map((c) => [...c]),
          });
          break;
        }
        path.push(cands[i]);
        dfs(i, rem - cands[i], nodeId);
        path.pop();
      }
      stackFrames.pop();
    };

    dfs(0, target, null);
    return {
      algorithm: 'combination-sum',
      title: `Combination Sum ([${cands.join(',')}], target=${target}) Live Trace`,
      complexitySummary: `O(N^(T/M)) pruned · Stack Depth <= ${Math.ceil(target / cands[0])}`,
      codeLines: COMBINATION_LINES,
      treeNodes: layoutTreeNodes(rawNodes),
      executionTrace: trace,
    };
  }

  // Permutations
  const nums = (config.elements && config.elements.length > 0 ? config.elements : [1, 2, 3]).slice(0, 3);
  const used = new Array(nums.length).fill(false);
  const path: number[] = [];
  const emitted: number[][] = [];
  const stackFrames: { fn: string; depth: number; state: string }[] = [];

  const permute = (parentId: string | null) => {
    if (trace.length >= MAX_STEPS) return;
    const depth = stackFrames.length + 1;
    peakDepth = Math.max(peakDepth, depth);
    exploredCount++;

    const isBase = path.length === nums.length;
    const fnLabel = `permute(len=${path.length})`;
    const nodeId = pushNode(
      parentId,
      depth,
      isBase ? `✓ [${path.join(',')}]` : `[${path.join(',')}]`,
      `depth=${depth}`,
      depth === 1 ? 'root' : isBase ? 'solution' : 'call',
    );
    stackFrames.push({
      fn: fnLabel,
      depth,
      state: `path=[${path.join(', ')}]`,
    });

    if (isBase) {
      emitted.push([...path]);
      trace.push({
        step: trace.length,
        action: 'solution',
        title: `Permutation Complete: [${path.join(', ')}]`,
        explanation: `Reached leaf depth ${depth} (path.length === ${nums.length}). Emitted permutation #${emitted.length} and unwinding.`,
        activeNodeId: nodeId,
        activeLineNumbers: [2],
        stack: snapshotStack(stackFrames, 'returning'),
        depth,
        peakDepth,
        exploredCount,
        prunedCount,
        currentPath: [...path],
        emittedSubsets: emitted.map((p) => [...p]),
      });
      stackFrames.pop();
      return;
    }

    trace.push({
      step: trace.length,
      action: 'call',
      title: `Enter ${fnLabel} (Depth ${depth})`,
      explanation: `Selecting next unused element from [${nums.join(', ')}] for slot ${path.length}.`,
      activeNodeId: nodeId,
      activeLineNumbers: [1, 3],
      stack: snapshotStack(stackFrames, 'active'),
      depth,
      peakDepth,
      exploredCount,
      prunedCount,
      currentPath: [...path],
      emittedSubsets: emitted.map((p) => [...p]),
    });

    for (let i = 0; i < nums.length; i++) {
      if (trace.length >= MAX_STEPS) break;
      if (used[i]) {
        prunedCount++;
        continue;
      }
      used[i] = true;
      path.push(nums[i]);
      permute(nodeId);
      path.pop();
      used[i] = false;
    }

    stackFrames.pop();
  };

  permute(null);
  return {
    algorithm: 'permutations',
    title: `Permutations [${nums.join(', ')}] Live Call-Stack Trace`,
    complexitySummary: `O(N · N!) · Stack Space O(${nums.length})`,
    codeLines: PERMUTATIONS_LINES,
    treeNodes: layoutTreeNodes(rawNodes),
    executionTrace: trace,
  };
}
