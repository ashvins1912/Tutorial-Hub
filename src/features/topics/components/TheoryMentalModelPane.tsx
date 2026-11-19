import { ArrowUpRight, CheckCircle2, Circle } from 'lucide-react';
import type { CurriculumTopic, ProblemDifficulty } from '../types';

interface TheoryMentalModelPaneProps {
  topic: CurriculumTopic;
  isMastered: boolean;
  onToggleMastered: () => void;
  onOpenDeepLink: () => void;
  onOpenProblemTrainer: (slug: string) => void;
}

const DIFF_TEXT: Record<ProblemDifficulty, string> = {
  Easy: 'text-emerald-700 dark:text-emerald-400',
  Medium: 'text-amber-700 dark:text-amber-400',
  Hard: 'text-rose-700 dark:text-rose-400',
  'Real-World System': 'text-indigo-700 dark:text-indigo-400',
};

export function TheoryMentalModelPane({
  topic,
  isMastered,
  onToggleMastered,
  onOpenDeepLink,
  onOpenProblemTrainer,
}: TheoryMentalModelPaneProps) {
  const tiers = [topic.solutions.brute, topic.solutions.better, topic.solutions.optimal];

  return (
    <div className="space-y-5">
      {/* Topic Header Card */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="text-sky-700 dark:text-sky-400 font-semibold">{topic.tier}</span>
              <span aria-hidden="true">·</span>
              <span>{topic.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Topic {String(topic.order).padStart(2, '0')} of 19</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {topic.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {topic.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleMastered}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                isMastered
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {isMastered ? (
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Circle className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isMastered ? 'Topic Mastered' : 'Mark Mastered'}
            </button>

            {topic.deepLink && (
              <button
                type="button"
                onClick={onOpenDeepLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 transition-colors whitespace-nowrap"
              >
                {topic.deepLink.label}
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Pattern Identification Clues */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            01. Pattern Identification Clues
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Signals and constraints in a problem statement that point directly to this pattern.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topic.patternClues.map((clue, idx) => (
            <div key={idx} className="py-3 first:pt-1 last:pb-0 space-y-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {clue.signal}
              </div>
              <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                Constraint Signal: {clue.constraintHint}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {clue.whyItMatches}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Think (Mental Model) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            02. How to Think (Mental Model Before Coding)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Walk through these invariants before writing line 1.
          </p>
        </div>

        <ol className="space-y-2.5">
          {topic.mentalModelSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums shrink-0 mt-0.5">
                {idx + 1}.
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 3-Tier Complexity Comparison Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            03. Brute Force → Better → Optimal Progression
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare exact trade-offs and see which bottleneck each upgrade eliminates.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-3 font-semibold">Tier</th>
                <th className="py-2 pr-3 font-semibold">Approach</th>
                <th className="py-2 pr-3 font-semibold">Time</th>
                <th className="py-2 font-semibold">Space</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {tiers.map((t) => (
                <tr key={t.tier} className="align-top">
                  <td className="py-2.5 pr-3 font-mono font-semibold whitespace-nowrap">
                    <span
                      className={
                        t.tier === 'brute'
                          ? 'text-rose-700 dark:text-rose-400'
                          : t.tier === 'better'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                      }
                    >
                      {t.tier === 'brute' ? 'Brute' : t.tier === 'better' ? 'Better' : 'Optimal'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200 font-medium">
                    {t.title}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                    {t.timeComplexity}
                  </td>
                  <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                    {t.spaceComplexity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Curated 5-Problem Ladder */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
              04. Curated Problem Ladder (Easy → Hard → System)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5 progressive problems ordered strictly by difficulty and production complexity.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
            5 Problems
          </span>
        </div>

        <ol className="divide-y divide-slate-100 dark:divide-slate-800">
          {topic.problemLadder.map((prob, idx) => (
            <li key={prob.id} className="py-3 first:pt-1 last:pb-0 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-slate-400 tabular-nums">{idx + 1}.</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {prob.title}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono pl-5">
                  <span className={`font-semibold ${DIFF_TEXT[prob.difficulty]}`}>
                    {prob.difficulty}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-400">{prob.targetComplexity}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400 font-sans">
                    {prob.patternTwist}
                  </span>
                </div>
              </div>

              {prob.trainerSlug && (
                <button
                  type="button"
                  onClick={() => onOpenProblemTrainer(prob.trainerSlug!)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors whitespace-nowrap shrink-0"
                >
                  Open Trainer
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
