import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  Grid3X3,
  HelpCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  TRUTH_GRID_PUZZLES,
  type TruthCellState,
  createEmptyTruthGrid,
  detectGridContradictions,
  toggleTruthGridCell,
} from '../../core/step-generators/workspaceGenerators';

interface TruthEliminationGridProps {
  initialPuzzleId?: string;
}

export const TruthEliminationGrid: React.FC<TruthEliminationGridProps> = ({
  initialPuzzleId = 'engineer-ownership',
}) => {
  const [puzzleId, setPuzzleId] = useState(initialPuzzleId);
  const puzzle = useMemo(
    () => TRUTH_GRID_PUZZLES.find((p) => p.id === puzzleId) ?? TRUTH_GRID_PUZZLES[0],
    [puzzleId],
  );

  const [grid, setGrid] = useState<TruthCellState[][]>(() =>
    createEmptyTruthGrid(puzzle.rows.length, puzzle.cols.length),
  );
  const [autoCrossEliminate, setAutoCrossEliminate] = useState(true);
  const [verificationMsg, setVerificationMsg] = useState<{
    status: 'idle' | 'success' | 'error';
    text: string;
  }>({ status: 'idle', text: '' });

  const contradictions = useMemo(
    () => detectGridContradictions(grid, puzzle.rows, puzzle.cols),
    [grid, puzzle],
  );

  const conflictRows = new Set(
    contradictions
      .filter((c) => c.kind === 'row-double' || c.kind === 'row-empty')
      .map((c) => c.index),
  );
  const conflictCols = new Set(
    contradictions
      .filter((c) => c.kind === 'col-double' || c.kind === 'col-empty')
      .map((c) => c.index),
  );

  const switchPuzzle = (nextId: string) => {
    const nextPuzzle = TRUTH_GRID_PUZZLES.find((p) => p.id === nextId) ?? TRUTH_GRID_PUZZLES[0];
    setPuzzleId(nextPuzzle.id);
    setGrid(createEmptyTruthGrid(nextPuzzle.rows.length, nextPuzzle.cols.length));
    setVerificationMsg({ status: 'idle', text: '' });
  };

  const handleCellClick = (r: number, c: number) => {
    setGrid((prev) => toggleTruthGridCell(prev, r, c, autoCrossEliminate));
    setVerificationMsg({ status: 'idle', text: '' });
  };

  const handleVerify = () => {
    if (contradictions.length > 0) {
      setVerificationMsg({
        status: 'error',
        text: `Resolve ${contradictions.length} grid contradiction(s) before verifying.`,
      });
      return;
    }

    let confirmedCount = 0;
    let exactMatches = 0;
    for (let r = 0; r < puzzle.rows.length; r++) {
      const colIdx = grid[r].findIndex((v) => v === 'confirmed');
      if (colIdx !== -1) {
        confirmedCount++;
        if (puzzle.solution[r] === colIdx) exactMatches++;
      }
    }

    if (confirmedCount < puzzle.rows.length) {
      setVerificationMsg({
        status: 'error',
        text: `Incomplete deduction: ${confirmedCount} of ${puzzle.rows.length} rows confirmed. Keep eliminating cells using the clues.`,
      });
      return;
    }

    if (exactMatches === puzzle.rows.length) {
      setVerificationMsg({
        status: 'success',
        text: '100% Verified! Every clue is satisfied with zero contradictions and a unique 1-to-1 bijection.',
      });
    } else {
      setVerificationMsg({
        status: 'error',
        text: `${exactMatches} of ${puzzle.rows.length} assignments satisfy all clues. Re-check the clues against your confirmed cells.`,
      });
    }
  };

  const handleRevealSolution = () => {
    const solved = createEmptyTruthGrid(puzzle.rows.length, puzzle.cols.length);
    for (let r = 0; r < puzzle.rows.length; r++) {
      for (let c = 0; c < puzzle.cols.length; c++) {
        solved[r][c] = puzzle.solution[r] === c ? 'confirmed' : 'eliminated';
      }
    }
    setGrid(solved);
    setVerificationMsg({
      status: 'success',
      text: 'Reference bijection loaded. Inspect how each row and column holds exactly one ✓ Confirmed cell.',
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Deductive Constraint Propagation Grid</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {puzzle.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1">
          {TRUTH_GRID_PUZZLES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => switchPuzzle(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                puzzle.id === p.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {p.rowLabel}s
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Controls & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={autoCrossEliminate}
              onChange={(e) => setAutoCrossEliminate(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Auto cross-eliminate row & column on ✓ Confirm</span>
          </label>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" /> Confirmed
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-rose-700 dark:text-rose-400">
              <X className="w-3.5 h-3.5" /> Eliminated
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" /> Unknown
            </span>
          </div>
        </div>

        {/* Clues List */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Constraint Clues (Click cells to cycle ? → ✓ → ✗)
          </h4>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {puzzle.clues.map((clue, idx) => (
              <li key={idx} className="leading-relaxed">
                {clue}
              </li>
            ))}
          </ul>
        </div>

        {/* Contradiction Alert */}
        {contradictions.length > 0 && (
          <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Contradiction Detected ({contradictions.length})</span>
            </div>
            {contradictions.map((c, idx) => (
              <p key={idx}>{c.message}</p>
            ))}
          </div>
        )}

        {/* Interactive N x N Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2.5 text-left font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                  {puzzle.rowLabel} \ {puzzle.colLabel}
                </th>
                {puzzle.cols.map((col, cIdx) => (
                  <th
                    key={col}
                    className={`p-2.5 text-center font-semibold border border-slate-200 dark:border-slate-800 ${
                      conflictCols.has(cIdx)
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {puzzle.rows.map((rowName, rIdx) => (
                <tr key={rowName}>
                  <td
                    className={`p-2.5 font-semibold border border-slate-200 dark:border-slate-800 ${
                      conflictRows.has(rIdx)
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                        : 'bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {rowName}
                  </td>
                  {puzzle.cols.map((colName, cIdx) => {
                    const cell = grid[rIdx]?.[cIdx] ?? 'unknown';
                    const isConflict = conflictRows.has(rIdx) || conflictCols.has(cIdx);
                    return (
                      <td
                        key={`${rowName}-${colName}`}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          aria-label={`${rowName} ${colName}: ${cell}`}
                          className={`w-full py-2.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                            cell === 'confirmed'
                              ? isConflict
                                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                                : 'bg-emerald-600 text-white'
                              : cell === 'eliminated'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-dashed border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {cell === 'confirmed' && (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirmed</span>
                            </>
                          )}
                          {cell === 'eliminated' && (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Eliminated</span>
                            </>
                          )}
                          {cell === 'unknown' && <span>? Unknown</span>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions & Verification Result */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVerify}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify Deduction</span>
            </button>
            <button
              type="button"
              onClick={handleRevealSolution}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show Proof Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGrid(createEmptyTruthGrid(puzzle.rows.length, puzzle.cols.length));
                setVerificationMsg({ status: 'idle', text: '' });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {verificationMsg.status !== 'idle' && (
          <div
            className={`rounded-lg border p-3 text-xs font-medium flex items-center gap-2 ${
              verificationMsg.status === 'success'
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
            }`}
          >
            {verificationMsg.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{verificationMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
