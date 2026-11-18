import { useState } from 'react';
import { Award, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { BigTechProblem } from '../../types/dsa';
import { RubricResult } from '../../store/useSprintStore';

interface BigTechRubricScorecardProps {
  problem: BigTechProblem;
  result: RubricResult;
  onContinue: () => void;
}

export function BigTechRubricScorecard({
  problem,
  result,
  onContinue,
}: BigTechRubricScorecardProps) {
  const [twistRevealed, setTwistRevealed] = useState(false);

  const signals = [
    {
      label: 'Edge-Case Clarification',
      score: result.clarifyScore,
      note: 'Verified input bounds, duplicates, and null edge cases before coding.',
    },
    {
      label: 'Pattern Identification Speed',
      score: result.identifyScore,
      note: 'Mapped prompt keyword triggers to optimal invariant and ruled out Brute Force.',
    },
    {
      label: 'Code & Invariant Cleanliness',
      score: result.invariantScore,
      note: 'Structured verbal pitch (Brute → Bottleneck → Optimal) cleanly.',
    },
    {
      label: 'Follow-Up Twist Readiness',
      score: twistRevealed ? 95 : result.twistScore,
      note: 'Prepared adaptation when interviewer shifts scale or memory constraints.',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" aria-hidden="true" />
            BIG TECH HIRING COMMITTEE SCORECARD · #{problem.number} {problem.title.toUpperCase()}
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Verdict: {result.verdict} ({result.overallScore}% Readiness)
          </h2>
        </div>

        <div className="px-4 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          PROBLEM LOGGED AS MASTERED
        </div>
      </div>

      {/* 4 Big Tech Interview Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((sig) => (
          <div
            key={sig.label}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{sig.label}</span>
              <span className="font-mono font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
                {sig.score}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${sig.score >= 85 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                style={{ width: `${sig.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{sig.note}</p>
          </div>
        ))}
      </div>

      {/* Interactive Follow-Up Twist Check */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            INTERVIEWER FOLLOW-UP TWIST CHALLENGE
          </span>
          <button
            type="button"
            onClick={() => setTwistRevealed((v) => !v)}
            className="px-3 py-1 rounded-md border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 font-semibold text-amber-800 dark:text-amber-300"
          >
            {twistRevealed ? 'Hide Optimal Adaptation' : 'Reveal Optimal Adaptation'}
          </button>
        </div>

        <p className="text-slate-800 dark:text-slate-200 font-medium">
          &ldquo;{problem.interviewSolutionLadder.interviewerFollowUp.twist}&rdquo;
        </p>

        {twistRevealed && (
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong>Adaptation: </strong>
              {problem.interviewSolutionLadder.interviewerFollowUp.adaptation}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
        >
          Continue Training
        </button>
      </div>
    </div>
  );
}
