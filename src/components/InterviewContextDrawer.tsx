import { Briefcase, GitFork, Sparkles } from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { OverlayHeader, SlideOverDrawer } from './ui';

export function InterviewContextDrawer() {
  const open = usePatternForgeStore((s) => s.interviewDrawerOpen);
  const setOpen = usePatternForgeStore((s) => s.setInterviewDrawerOpen);
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const { data: problems } = useAsyncCatalog('interactive-problems');

  const problem = problems.find((p) => p.id === activeProblemId) ?? problems[0];
  if (!problem) return null;

  const ctx = problem.interviewContext;

  return (
    <SlideOverDrawer
      open={open}
      onClose={() => setOpen(false)}
      ariaLabel="Interview Context and Follow-Up Twists"
      maxWidthClass="max-w-lg"
      panelClassName="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
    >
      <OverlayHeader
        kicker="INTERVIEW FREQUENCY & PATTERN TRANSFER"
        title={
          <>
            <Briefcase className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            {problem.title}
          </>
        }
        onClose={() => setOpen(false)}
        closeAriaLabel="Close Interview Context"
      />

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
          <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
            REPORTED INTERVIEW APPEARANCES
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {ctx.companies.join(' · ')}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {ctx.frequencyNote}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            INTERVIEWER FOLLOW-UP TWISTS
          </div>
          {ctx.followUpTwists.map((item) => (
            <div
              key={item.twist}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {item.twist}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.adaptation}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
            <GitFork className="w-3.5 h-3.5" aria-hidden="true" />
            3 ADAPTABLE RELATED PROBLEMS
          </div>
          {ctx.relatedProblems.map((rel) => (
            <div
              key={rel.title}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
            >
              <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <span>{rel.title}</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-normal">
                  {rel.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Shared Trigger: {rel.sharedTrigger}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-right shrink-0">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
        >
          Return to Problem
        </button>
      </div>
    </SlideOverDrawer>
  );
}
