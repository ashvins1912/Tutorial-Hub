import { Briefcase, GitFork, Sparkles, X } from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';

export function InterviewContextDrawer() {
  const open = usePatternForgeStore((s) => s.interviewDrawerOpen);
  const setOpen = usePatternForgeStore((s) => s.setInterviewDrawerOpen);
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);

  if (!open) return null;

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const ctx = problem.interviewContext;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Interview Context and Follow-Up Twists"
    >
      <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
                INTERVIEW FREQUENCY & PATTERN TRANSFER
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                {problem.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Interview Context"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

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

        <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
          >
            Return to Problem
          </button>
        </div>
      </div>
    </div>
  );
}
