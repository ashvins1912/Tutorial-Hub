import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  FunctionSquare,
  GitBranch,
} from 'lucide-react';
import type { LogicBoardEnrichment, PatternRecommendation } from '../../data/logicBoardMathTypes';

interface LogicBoardMathCardProps {
  title: string;
  entityKind: 'algorithm' | 'topic';
  enrichment: LogicBoardEnrichment;
  currentEntityId?: string;
  onSelectAlgorithm?: (algoId: string) => void;
  onSelectTopic?: (topicId: string) => void;
}

export function LogicBoardMathCard({
  title,
  entityKind,
  enrichment,
  currentEntityId,
  onSelectAlgorithm,
  onSelectTopic,
}: LogicBoardMathCardProps) {
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);

  useEffect(() => {
    setActiveRuleIndex(0);
  }, [title, currentEntityId]);

  const rules = enrichment.logicBoard;
  const safeIndex = Math.min(activeRuleIndex, Math.max(0, rules.length - 1));
  const activeRule = rules[safeIndex];

  const handleJump = (rec: PatternRecommendation) => {
    if (!rec.linkedId) return;
    if (rec.linkedKind === 'algorithm' && onSelectAlgorithm) {
      onSelectAlgorithm(rec.linkedId);
      return;
    }
    if (rec.linkedKind === 'topic' && onSelectTopic) {
      onSelectTopic(rec.linkedId);
      return;
    }
    if (onSelectAlgorithm && rec.linkedKind === 'algorithm') {
      onSelectAlgorithm(rec.linkedId);
    }
  };

  const canJump = (rec: PatternRecommendation): boolean => {
    if (!rec.linkedId) return false;
    if (rec.linkedId === currentEntityId && rec.linkedKind === entityKind) return false;
    if (rec.linkedKind === 'algorithm') return Boolean(onSelectAlgorithm);
    if (rec.linkedKind === 'topic') return Boolean(onSelectTopic);
    return false;
  };

  return (
    <section
      aria-label={`Formal statement, logic board, mathematics, and pattern recommendations for ${title}`}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6"
    >
      {/* 1. Complete Formal Statement & Canonical Problem Definition */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Formal Statement &amp; Complete Definition</span>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {rules.length} logic rules · {enrichment.mathematics.hasMath ? `${enrichment.mathematics.equations.length} equations` : 'qualitative'} · {enrichment.patternRecommendations.length} pattern pivots
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 max-w-[75ch]">
          {enrichment.formalDefinition}
        </p>

        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Canonical Problem Form:{' '}
          </span>
          <span className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {enrichment.problemStatementForm}
          </span>
        </div>
      </div>

      {/* 2. Interactive Logic Board (Condition -> Action -> Invariant) */}
      <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              <GitBranch className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Interactive Logic Board</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any rule row or step through the board to verify preconditions, state updates, and invariants.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveRuleIndex((i) => Math.max(0, i - 1))}
              disabled={safeIndex === 0}
              aria-label="Previous logic rule"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="px-2 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
              Rule {safeIndex + 1} / {rules.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveRuleIndex((i) => Math.min(rules.length - 1, i + 1))}
              disabled={safeIndex >= rules.length - 1}
              aria-label="Next logic rule"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-3 whitespace-nowrap">Stage</th>
                <th className="py-2 px-3">If / Condition</th>
                <th className="py-2 px-3">State Update / Action</th>
                <th className="py-2 pl-3">Invariant Held</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {rules.map((rule, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <tr
                    key={`${rule.step}-${idx}`}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveRuleIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveRuleIndex(idx);
                      }
                    }}
                    className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      isActive
                        ? 'bg-sky-50/80 dark:bg-sky-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 pr-3 align-top font-mono text-xs font-semibold text-sky-800 dark:text-sky-300 whitespace-nowrap tabular-nums">
                      {rule.step}
                    </td>
                    <td className="py-2.5 px-3 align-top text-slate-700 dark:text-slate-300 leading-relaxed">
                      {rule.condition}
                    </td>
                    <td className="py-2.5 px-3 align-top text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                      {rule.action}
                    </td>
                    <td className="py-2.5 pl-3 align-top text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rule.invariant}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeRule && (
          <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
              Active Trace ({activeRule.step}):
            </span>
            <span className="text-slate-800 dark:text-slate-200">{activeRule.action}</span>
            <span aria-hidden="true">·</span>
            <span>Invariant: {activeRule.invariant}</span>
          </div>
        )}
      </div>

      {/* 3. Mathematical Foundation & Proof Sketch */}
      {enrichment.mathematics.hasMath && enrichment.mathematics.equations.length > 0 && (
        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <FunctionSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Mathematical Foundation &amp; Correctness Proof</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {enrichment.mathematics.equations.map((eq, idx) => (
              <div key={`${eq.name}-${idx}`} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {eq.name}
                </div>
                <div className="overflow-x-auto py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-[13px] text-slate-900 dark:text-sky-200 tabular-nums">
                  {eq.formula}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-[75ch]">
                  {eq.meaning}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Proof &amp; Convergence Sketch:{' '}
            </span>
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {enrichment.mathematics.proofSketch}
            </span>
          </div>
        </div>
      )}

      {/* 4. Pattern Recognition & Recommendation Matrix */}
      <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Pattern Recognition &amp; Pivot Recommendations</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Match incoming problem constraints to the right algorithmic pattern — jump directly when a twist changes the optimal engine.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {enrichment.patternRecommendations.map((rec, idx) => {
            const jumpable = canJump(rec);
            const isCurrent =
              rec.linkedId === currentEntityId && rec.linkedKind === entityKind;
            return (
              <div
                key={`${rec.recommendedPattern}-${idx}`}
                className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-start"
              >
                <div className="md:col-span-5 space-y-0.5">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    If you see this signal
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {rec.ifYouSee}
                  </p>
                </div>

                <div className="md:col-span-7 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Use: {rec.recommendedPattern}
                      {isCurrent && (
                        <span className="ml-2 font-mono text-[11px] font-normal text-emerald-700 dark:text-emerald-400">
                          · Current {entityKind}
                        </span>
                      )}
                    </div>

                    {jumpable && (
                      <button
                        type="button"
                        onClick={() => handleJump(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors whitespace-nowrap shrink-0"
                      >
                        Open {rec.linkedKind === 'topic' ? 'Topic' : 'Algorithm'}
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.whyItFits}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
