import { useState } from 'react';
import { Gauge, GitCompare, Layers, Repeat } from 'lucide-react';
import type { ComplexityComparisonProfile } from '../data/complexityComparisonData';

export type ComplexityViewMode = 'recursive' | 'iterative' | 'compare';

export interface ComplexityDepthToggleProps {
  profile: ComplexityComparisonProfile;
  /** Current live recursive depth (e.g. call stack frame count or step-derived depth) */
  currentDepth: number;
  /** Current live step number (1-indexed) for iterative pass counter */
  currentStep: number;
  /** Total steps in the active trace */
  totalSteps: number;
  /** Default expanded state (default true on recursion visualizers, toggleable everywhere) */
  defaultOpen?: boolean;
}

export function ComplexityDepthToggle({
  profile,
  currentDepth,
  currentStep,
  totalSteps,
  defaultOpen = false,
}: ComplexityDepthToggleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<ComplexityViewMode>('compare');

  const safeDepth = Math.max(1, currentDepth);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Compact Header Toggle Strip */}
      <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-950/60">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap"
        >
          <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
          <span>Time Complexity Toggle</span>
          <span className="font-mono text-[11px] font-normal text-slate-500 dark:text-slate-400 tabular-nums">
            · Recursive Depth ({profile.recursiveTimeBigO}) vs. Iterative ({profile.iterativeTimeBigO})
          </span>
        </button>

        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-900">
              {(
                [
                  { id: 'compare', label: 'Compare Both', icon: GitCompare },
                  { id: 'recursive', label: 'Recursive Depth', icon: Layers },
                  { id: 'iterative', label: 'Iterative Alt', icon: Repeat },
                ] as const
              ).map((tab) => {
                const TabIcon = tab.icon;
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMode(tab.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <TabIcon className="w-3 h-3" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-mono font-semibold transition-colors whitespace-nowrap ${
              isOpen
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400'
            }`}
          >
            {isOpen ? 'Hide Big O' : 'Show Big O'}
          </button>
        </div>
      </div>

      {/* Expandable Big O Comparison Body */}
      {isOpen && (
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div
            className={`grid gap-3 ${
              mode === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* Recursive Depth Panel */}
            {(mode === 'compare' || mode === 'recursive') && (
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/25 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-900 dark:text-sky-200">
                    <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                    <span>{profile.recursiveApproach}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums whitespace-nowrap">
                    Live Depth d = {safeDepth}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Time Big O</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {profile.recursiveTimeBigO}
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Stack Space ({profile.maxDepthBigO})
                    </div>
                    <div className="font-bold text-amber-700 dark:text-amber-400">
                      {profile.recursiveSpaceBigO}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1 tabular-nums">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Recurrence: </span>
                    <span className="font-semibold">{profile.recurrenceRelation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">At Current Depth: </span>
                    <span className="text-sky-800 dark:text-sky-300 font-semibold">
                      {profile.depthWorkFormula(safeDepth)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Iterative Alternative Panel */}
            {(mode === 'compare' || mode === 'iterative') && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/25 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    <Repeat className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>{profile.iterativeApproach}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                    Iter {currentStep} / {totalSteps}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Time Big O</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {profile.iterativeTimeBigO}
                    </div>
                  </div>
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Space Big O</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400">
                      {profile.iterativeSpaceBigO}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-1 tabular-nums">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Call Stack Overhead: </span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {profile.iterativeStackOverhead}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Stack Overflow Risk: </span>
                    <span className="font-semibold">Eliminated (heap/register loop)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Engineering Verdict Footer */}
          <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              Big O Tradeoff:{' '}
            </span>
            {profile.tradeoffVerdict}
          </div>
        </div>
      )}
    </div>
  );
}
