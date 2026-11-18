import { ArrowRight, CheckCircle2, Eye, Gauge, XCircle } from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';

interface ComplexityCheck {
  label: string;
  notation: string;
  calcOps: (n: number) => number;
  note: string;
}

const COMPLEXITIES: ComplexityCheck[] = [
  {
    label: 'Logarithmic',
    notation: 'O(log N)',
    calcOps: (n) => Math.max(1, Math.round(Math.log2(n))),
    note: 'Binary Search / Balanced BST',
  },
  {
    label: 'Linear',
    notation: 'O(N)',
    calcOps: (n) => n,
    note: 'HashMap / Two Pointers / Sliding Window',
  },
  {
    label: 'Linearithmic',
    notation: 'O(N log N)',
    calcOps: (n) => Math.round(n * Math.log2(n)),
    note: 'Sorting / Heap / Divide & Conquer',
  },
  {
    label: 'Quadratic',
    notation: 'O(N²)',
    calcOps: (n) => n * n,
    note: 'Nested Loops / Unoptimized Pair Scan',
  },
  {
    label: 'Exponential',
    notation: 'O(2^N)',
    calcOps: (n) => (n > 30 ? Number.MAX_SAFE_INTEGER : Math.pow(2, n)),
    note: 'Uncached Recursion / All Subsets',
  },
];

const OPS_BUDGET_PER_SEC = 100_000_000; // 10^8 ops benchmark

function formatOps(ops: number): string {
  if (ops >= 1_000_000_000_000) return '> 10^12 ops';
  if (ops >= 1_000_000_000) return `${(ops / 1_000_000_000).toFixed(1)}B ops`;
  if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(1)}M ops`;
  if (ops >= 1_000) return `${(ops / 1_000).toFixed(1)}K ops`;
  return `${ops} ops`;
}

export function ProblemXRayReader() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const selectSignal = usePatternForgeStore((s) => s.selectSignal);
  const setConstraintExponent = usePatternForgeStore((s) => s.setConstraintExponent);
  const answerPatternQuiz = usePatternForgeStore((s) => s.answerPatternQuiz);
  const setCurrentStage = usePatternForgeStore((s) => s.setCurrentStage);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const activeSignal =
    problem.signals.find((sig) => sig.id === progress.selectedSignalId) ?? problem.signals[0];

  const nValue = Math.pow(10, progress.constraintExponent);

  return (
    <div className="space-y-6">
      {/* Top Split: Interactive Signal Reader + Signal Decoder Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Step 1. X-Ray Problem Statement
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {progress.exploredSignals.length}/{problem.signals.length} clues decoded
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Click any highlighted signal phrase below to see which algorithms it eliminates and which pattern it triggers.
            </p>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-base leading-8 text-slate-800 dark:text-slate-200">
              {problem.statementSegments.map((seg, idx) => {
                if (!seg.signalId) {
                  return <span key={idx}>{seg.text}</span>;
                }
                const isSelected = progress.selectedSignalId === seg.signalId;
                const isExplored = progress.exploredSignals.includes(seg.signalId);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSignal(seg.signalId!)}
                    className={`inline px-1.5 py-0.5 mx-0.5 rounded-md font-medium transition-colors border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500'
                        : isExplored
                          ? 'bg-amber-100/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-200/70'
                          : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60'
                    }`}
                  >
                    {seg.text}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Pattern: {problem.patternName}</span>
            <span aria-hidden="true">·</span>
            <span>Brute: {problem.bruteBigO}</span>
            <span aria-hidden="true">·</span>
            <span>Optimal: {problem.targetBigO}</span>
          </div>
        </div>

        {/* Signal Decoder Inspector */}
        <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 flex flex-col justify-between">
          {activeSignal ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
                  SIGNAL PHRASE DECODER
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  “{activeSignal.phrase}”
                </h3>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Implied Structural Constraint
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeSignal.impliedConstraint}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/50 dark:bg-rose-950/20">
                  <p className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 mb-1.5">
                    ELIMINATED
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {activeSignal.eliminatedPatterns.map((p) => (
                      <li key={p}>× {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <p className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                    TRIGGERED
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {activeSignal.triggeredPatterns.map((p) => (
                      <li key={p}>→ {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">Complexity Clue:</strong>{' '}
                {activeSignal.complexityHint}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Split: Constraint-to-Big-O Calculator + Pattern Identification Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Constraint-to-Big-O Reverse Calculator
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              Judge limit: 10^8 ops/sec
            </span>
          </div>

          <div className="mb-5 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="constraint-n-slider"
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Input Size (N):{' '}
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
                  N = 10^{progress.constraintExponent} ({nValue.toLocaleString()})
                </span>
              </label>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Problem default: 10^{problem.inputSizeExponent}
              </span>
            </div>
            <input
              id="constraint-n-slider"
              type="range"
              min={2}
              max={6}
              step={1}
              value={progress.constraintExponent}
              onChange={(e) => setConstraintExponent(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              <span>10^2</span>
              <span>10^3</span>
              <span>10^4</span>
              <span>10^5</span>
              <span>10^6</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {COMPLEXITIES.map((c) => {
              const ops = c.calcOps(nValue);
              const passes = ops <= OPS_BUDGET_PER_SEC;
              const isBorderline = ops > 10_000_000 && ops <= OPS_BUDGET_PER_SEC;
              return (
                <div
                  key={c.notation}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {c.notation}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {c.note}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatOps(ops)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${
                        !passes
                          ? 'text-rose-700 dark:text-rose-400'
                          : isBorderline
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {passes ? (
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      {!passes ? 'TLE' : isBorderline ? 'TIGHT' : 'PASS'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pattern Identification Micro-Quiz */}
        <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Pattern Identification Check
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {progress.quizSolved ? 'UNLOCKED' : 'SELECT PATTERN'}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{problem.quizPrompt}</p>

            <div className="space-y-2.5">
              {problem.quizOptions.map((opt) => {
                const selected = progress.quizOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => answerPatternQuiz(opt.id)}
                    className={`w-full p-3.5 rounded-lg border text-left transition-colors ${
                      selected
                        ? opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {opt.pattern}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {opt.dataStructure}
                      </span>
                    </div>
                    {selected && (
                      <p
                        className={`mt-2 text-xs leading-relaxed font-medium ${
                          opt.isCorrect
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {opt.isCorrect ? 'CORRECT: ' : 'NOT QUITE: '}
                        {opt.feedback}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {progress.quizSolved
                ? 'Pattern verified. Ready to simulate manually.'
                : 'Select the matching pattern to verify your intuition.'}
            </span>
            <button
              type="button"
              onClick={() => setCurrentStage(2)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Open Visual Sandbox
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
