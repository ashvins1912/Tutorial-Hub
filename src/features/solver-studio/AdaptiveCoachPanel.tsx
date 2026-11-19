import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CalendarClock,
  CheckCircle2,
  Target,
  Zap,
} from 'lucide-react';
import type {
  AdaptiveTelemetryState,
  MicroDrillSpec,
  ProgressionTier,
} from '../../core/knowledge-base/types';

interface AdaptiveCoachPanelProps {
  telemetry: AdaptiveTelemetryState;
  onCompleteDrill: (drillId: string) => void;
}

const TIERS: ProgressionTier[] = ['Easy', 'Medium', 'Hard', 'System Design'];

const ActiveMicroDrillCard: React.FC<{
  drill: MicroDrillSpec;
  onComplete: (drillId: string) => void;
}> = ({ drill, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = drill.questions.every((q) => answers[q.id] !== undefined);
  const correctCount = drill.questions.filter((q) => answers[q.id] === q.correctIndex).length;

  return (
    <div className="rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>{drill.title}</span>
            <span className="text-amber-600 dark:text-amber-400">·</span>
            <span className="font-mono">{drill.estimatedMinutes}m</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{drill.diagnosedGap}</p>
        </div>
        <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 shrink-0">
          Phase: {drill.targetPhase}
        </span>
      </div>

      <div className="space-y-3">
        {drill.questions.map((q, qIdx) => {
          const picked = answers[q.id];
          return (
            <div
              key={q.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2"
            >
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Q{qIdx + 1}. {q.prompt}
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, oIdx) => {
                  const isPicked = picked === oIdx;
                  const isCorrect = oIdx === q.correctIndex;
                  let tone =
                    'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-indigo-400';
                  if (submitted) {
                    if (isCorrect) {
                      tone =
                        'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-medium';
                    } else if (isPicked && !isCorrect) {
                      tone =
                        'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                    }
                  } else if (isPicked) {
                    tone =
                      'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-medium';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                      className={`w-full text-left px-2.5 py-2 rounded-md border text-xs transition-colors ${tone}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        {!submitted ? (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
          >
            Check Micro-Drill
          </button>
        ) : (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
              Score: {correctCount} / {drill.questions.length}
            </span>
            <button
              type="button"
              onClick={() => onComplete(drill.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Gap Repaired</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdaptiveCoachPanel: React.FC<AdaptiveCoachPanelProps> = ({
  telemetry,
  onCompleteDrill,
}) => {
  const pendingDrills = telemetry.microDrills.filter((d) => !d.completed);
  const tierIdx = TIERS.indexOf(telemetry.unlockedTier);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-5">
      {/* Progression Tier Unlocks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Mastery Tier Progression</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {telemetry.completedProblemIds.length} solved · Unlocked: {telemetry.unlockedTier}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {TIERS.map((tier, idx) => {
            const unlocked = idx <= tierIdx;
            return (
              <div
                key={tier}
                className={`rounded-lg border px-2.5 py-2 text-center text-xs font-medium ${
                  unlocked
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-500'
                }`}
              >
                <div>{unlocked ? '✓' : '○'} {tier}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Micro-Drills (Drop Intelligence) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Targeted 2-Min Micro-Drills ({pendingDrills.length} queued)</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Auto-queued from Socratic phase drops
          </span>
        </div>

        {pendingDrills.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-400">
            No pending cognitive gaps. If you get stuck during any Socratic phase, click{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Stuck Here · Log Phase Drop
            </span>{' '}
            to diagnose the exact blindspot and auto-queue a 2-minute repair drill.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDrills.map((drill) => (
              <ActiveMicroDrillCard
                key={drill.id}
                drill={drill}
                onComplete={onCompleteDrill}
              />
            ))}
          </div>
        )}
      </div>

      {/* SM-2 Spaced Repetition Queue */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <CalendarClock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>SM-2 Spaced Repetition Queue ({telemetry.sm2Queue.length})</span>
          </div>
        </div>

        {telemetry.sm2Queue.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-400">
            Complete a problem to compute your independence mastery score and schedule your next SM-2 review interval.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 px-3 font-semibold">Problem</th>
                  <th className="py-2 px-3 font-semibold">Mastery</th>
                  <th className="py-2 px-3 font-semibold">SM-2 Ease</th>
                  <th className="py-2 px-3 font-semibold">Next Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {telemetry.sm2Queue.map((item) => (
                  <tr key={item.problemId} className="text-slate-700 dark:text-slate-300">
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {item.problemTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.domain} · {item.independent ? 'Independent' : 'Assisted'} · {item.hintsUsed} hint(s)
                      </div>
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                      {item.masteryScore}%
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums">
                      EF {item.easeFactor} (rep {item.repetitions})
                    </td>
                    <td className="py-2 px-3 font-mono tabular-nums">
                      in {item.intervalDays}d ({item.nextReviewAt.slice(0, 10)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Drop Diagnostic Log */}
      {telemetry.drops.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Recent Drop Diagnostics ({telemetry.drops.length})</span>
          </div>
          <div className="space-y-1">
            {telemetry.drops.slice(0, 4).map((drop) => (
              <div
                key={drop.id}
                className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2"
              >
                <span className="truncate">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {drop.problemTitle}
                  </span>{' '}
                  · {drop.droppedAtPhase}
                </span>
                <span className="font-mono text-[11px] shrink-0">{drop.timestamp.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
