import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Gauge,
  Lock,
  RotateCcw,
  ShieldAlert,
  Unlock,
  XCircle,
} from 'lucide-react';

export interface ConstraintComplexityDecoderProps {
  problemId: string;
  /** Exponent e for N <= 10^e (e.g. 5 => N <= 10^5) */
  inputSizeExponent: number;
  /** Expected optimal complexity string (e.g. "O(N)", "O(N log N)", "O(A·C)") */
  targetBigO: string;
  /** Brute force complexity string for comparison proof */
  bruteBigO: string;
  /** Whether the user has unlocked hints & patterns for this problem */
  isUnlocked: boolean;
  /** Triggered once user selects the valid complexity class */
  onUnlock: (selectedNotation: string) => void;
  /** Optional reset handler to re-lock Step 0 for active practice */
  onRelock?: () => void;
}

interface ComplexityChoice {
  id: string;
  notation: string;
  label: string;
  typicalRange: string;
  calcOps: (n: number) => number;
}

const OPS_BUDGET = 100_000_000; // 10^8 ops/sec

function formatOps(ops: number): string {
  if (ops >= 1_000_000_000_000) return '> 10^12 ops';
  if (ops >= 1_000_000_000) return `${(ops / 1_000_000_000).toFixed(1)}B ops`;
  if (ops >= 1_000_000) return `${(ops / 1_000_000).toFixed(1)}M ops`;
  if (ops >= 1_000) return `${(ops / 1_000).toFixed(1)}K ops`;
  return `${ops} ops`;
}

function resolveTargetChoiceId(targetBigO: string): string {
  const norm = targetBigO.toLowerCase().replace(/\s+/g, '');
  if (norm === 'o(1)' || norm.includes('o(1)')) return 'const';
  if (
    norm.includes('a·c') ||
    norm.includes('a*c') ||
    norm.includes('m·n') ||
    norm.includes('m*n') ||
    norm.includes('v+e') ||
    norm.includes('nlogk')
  ) {
    return 'special-target';
  }
  if (norm.includes('nlogn')) return 'nlogn';
  if (norm.includes('logn')) return 'logn';
  if (norm.includes('n²') || norm.includes('n^2')) return 'n2';
  if (norm.includes('2^n') || norm.includes('c^a')) return 'exp';
  return 'n';
}

export function ConstraintComplexityDecoder({
  problemId,
  inputSizeExponent,
  targetBigO,
  bruteBigO,
  isUnlocked,
  onUnlock,
  onRelock,
}: ConstraintComplexityDecoderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nValue = Math.pow(10, inputSizeExponent);
  const expectedChoiceId = useMemo(() => resolveTargetChoiceId(targetBigO), [targetBigO]);

  const choices: ComplexityChoice[] = useMemo(() => {
    const base: ComplexityChoice[] = [
      {
        id: 'logn',
        notation: 'O(log N)',
        label: 'Logarithmic',
        typicalRange: 'Sorted / Range ≤ 10⁹',
        calcOps: (n) => Math.max(1, Math.round(Math.log2(n))),
      },
      {
        id: 'n',
        notation: 'O(N)',
        label: 'Linear',
        typicalRange: 'N ≤ 10⁶',
        calcOps: (n) => n,
      },
      {
        id: 'nlogn',
        notation: 'O(N log N)',
        label: 'Linearithmic',
        typicalRange: 'N ≤ 2×10⁵',
        calcOps: (n) => Math.round(n * Math.log2(n)),
      },
      {
        id: 'n2',
        notation: 'O(N²)',
        label: 'Quadratic',
        typicalRange: 'N ≤ 3×10³',
        calcOps: (n) => n * n,
      },
      {
        id: 'exp',
        notation: 'O(2^N)',
        label: 'Exponential',
        typicalRange: 'N ≤ 20',
        calcOps: (n) => (n > 30 ? Number.MAX_SAFE_INTEGER : Math.pow(2, n)),
      },
    ];

    if (expectedChoiceId === 'const') {
      base.unshift({
        id: 'const',
        notation: 'O(1)',
        label: 'Constant Time',
        typicalRange: 'Direct Hash + Pointer',
        calcOps: () => 1,
      });
    } else if (expectedChoiceId === 'special-target') {
      const lower = targetBigO.toLowerCase();
      const label = lower.includes('v+e')
        ? 'Linear Graph'
        : lower.includes('m·n')
          ? 'Linear Grid'
          : lower.includes('log k')
            ? 'Bounded Heap'
            : 'Pseudo-Polynomial DP';
      const typicalRange = lower.includes('v+e')
        ? 'V + E ≤ 2×10⁵'
        : lower.includes('m·n')
          ? 'M × N ≤ 10⁵'
          : lower.includes('log k')
            ? 'N ≤ 10⁵, Heap K'
            : 'Amount × Coins ≤ 10⁶';
      base.splice(2, 0, {
        id: 'special-target',
        notation: targetBigO,
        label,
        typicalRange,
        calcOps: (n) => Math.min(OPS_BUDGET / 10, n * 10),
      });
    }

    return base;
  }, [expectedChoiceId, targetBigO]);

  useEffect(() => {
    setSelectedId(isUnlocked ? expectedChoiceId : null);
  }, [problemId, isUnlocked, expectedChoiceId]);

  const selectedChoice = choices.find((c) => c.id === selectedId) ?? null;
  const isCorrectSelection = selectedId === expectedChoiceId;

  const handleSelect = (choice: ComplexityChoice) => {
    setSelectedId(choice.id);
    if (choice.id === expectedChoiceId) {
      onUnlock(choice.notation);
    }
  };

  return (
    <section
      aria-label="Constraint-to-Complexity Decoder Gate"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            )}
            <span>Step 0. Constraint-to-Complexity Decoder</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span
              className={
                isUnlocked
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }
            >
              {isUnlocked ? 'Hints & Patterns Unlocked' : 'Required Before Hints'}
            </span>
          </div>
          <h2 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
            Decode the Target Time Complexity from Input Bound{' '}
            <span className="font-mono text-sky-700 dark:text-sky-400 tabular-nums">
              N ≤ 10^{inputSizeExponent}
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[65ch] leading-relaxed">
            With a judge budget of ~10⁸ operations/sec and N up to{' '}
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {nValue.toLocaleString()}
            </span>
            , pick the expected optimal complexity class to unlock X-Ray signal clues and pattern hints below.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>N ≤ 10^{inputSizeExponent}</span>
          </div>
          {isUnlocked && onRelock && (
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                onRelock();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Re-lock
            </button>
          )}
        </div>
      </div>

      {/* Interactive Complexity Class Selector */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 ${
          choices.length === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'
        } gap-2.5`}
      >
        {choices.map((choice) => {
          const isPicked = selectedId === choice.id;
          const isRight = isPicked && choice.id === expectedChoiceId;
          const isWrong = isPicked && choice.id !== expectedChoiceId;

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleSelect(choice)}
              className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isRight
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                  : isWrong
                    ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 hover:border-sky-500'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-sm font-bold tabular-nums">
                  {choice.notation}
                </span>
                {isRight && (
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isWrong && (
                  <XCircle
                    className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                {choice.label}
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 mt-0.5 tabular-nums">
                {choice.typicalRange}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quantitative Feedback Proof */}
      {selectedChoice && (
        <div
          className={`rounded-lg border p-3.5 text-xs space-y-1.5 ${
            isCorrectSelection
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
              : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100'
          }`}
        >
          {isCorrectSelection ? (
            <>
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span>
                  Verified: {selectedChoice.notation} executes ~{formatOps(selectedChoice.calcOps(nValue))} at N = 10^{inputSizeExponent} — X-Ray Hints &amp; Pattern Checks Unlocked.
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                Brute force ({bruteBigO}) is eliminated before reading pattern templates because it exceeds the 10⁸ ops/sec time limit.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                <span>
                  {selectedChoice.calcOps(nValue) > OPS_BUDGET
                    ? `${selectedChoice.notation} Triggers TLE (${formatOps(selectedChoice.calcOps(nValue))} > 10⁸ ops/sec)`
                    : selectedChoice.id === 'logn'
                      ? `${selectedChoice.notation} is too tight — unsorted input requires inspecting elements linearly`
                      : `${selectedChoice.notation} passes the time limit (~${formatOps(selectedChoice.calcOps(nValue))}), but a tighter optimal class avoids unnecessary sorting`}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                Hints and pattern clues remain locked until you pick the exact target complexity class for N ≤ 10^{inputSizeExponent}.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
