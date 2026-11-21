import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Target } from 'lucide-react';

export interface TrackKpiStat {
  label: string;
  value: string | number;
  suffix?: string;
}

export interface WorkflowGuideStep {
  title: string;
  body: string;
}

export interface TrackProgressHeaderProps {
  kicker?: string;
  countSummary: string;
  title: string;
  description: string;
  stats: TrackKpiStat[];
  progressPercent: number;
  workflowSteps?: WorkflowGuideStep[];
  defaultShowGuide?: boolean;
}

const DEFAULT_WORKFLOW_STEPS: WorkflowGuideStep[] = [
  {
    title: '1. Understand',
    body: 'Restate inputs, outputs, constraints and edge cases.',
  },
  {
    title: '2. Derive',
    body: 'Write brute force first, then identify the bottleneck and pattern.',
  },
  {
    title: '3. Implement',
    body: 'Code the optimal approach independently without copying a solution.',
  },
  {
    title: '4. Reflect',
    body: 'Record invariant, complexity, failed attempt and one variation.',
  },
];

/**
 * Reusable progress hero strip + collapsible workflow guide shared across
 * curated interview study tracks and academy courses.
 */
export const TrackProgressHeader: React.FC<TrackProgressHeaderProps> = ({
  kicker = 'Interview preparation track',
  countSummary,
  title,
  description,
  stats,
  progressPercent,
  workflowSteps = DEFAULT_WORKFLOW_STEPS,
  defaultShowGuide = true,
}) => {
  const [showStudyGuide, setShowStudyGuide] = useState(defaultShowGuide);
  const clampedPct = Math.max(0, Math.min(100, progressPercent));

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-sky-300">
            <Target className="h-4 w-4" aria-hidden="true" />
            <span>{kicker}</span>
          </span>
          <span className="text-xs font-mono tabular-nums text-slate-300">
            {countSummary}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl tracking-tight">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/15 bg-white/5 p-4"
            >
              <div className="text-xs text-slate-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums">
                {stat.value}
                {stat.suffix && (
                  <span className="text-sm font-normal text-slate-400">{stat.suffix}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${clampedPct}%` }}
          />
        </div>
      </div>

      {workflowSteps.length > 0 && (
        <div className="p-5">
          <button
            type="button"
            onClick={() => setShowStudyGuide((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Recommended solving workflow</span>
            </span>
            {showStudyGuide ? (
              <ChevronUp className="h-4 w-4 text-slate-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
            )}
          </button>
          {showStudyGuide && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-3"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
