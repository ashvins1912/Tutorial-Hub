import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Eye, EyeOff, ShieldAlert, Trophy, X } from 'lucide-react';
import { BIG_TECH_36_PROBLEMS } from '../../../server/seed/bigTechTopicSeed';
import { CodeLanguage, SprintTask } from '../../types/dsa';
import { useSprintStore } from '../../store/useSprintStore';

export function Mock45SimulatorModal() {
  const open = useSprintStore((s) => s.mock45Open);
  const dayNumber = useSprintStore((s) => s.mock45DayNumber);
  const closeMock45 = useSprintStore((s) => s.closeMock45);
  const activeSprint = useSprintStore((s) => s.activeSprint);
  const completeSprintTask = useSprintStore((s) => s.completeSprintTask);

  const daySchedule = useMemo(
    () => activeSprint?.dailySchedule.find((d) => d.dayNumber === dayNumber) ?? null,
    [activeSprint, dayNumber]
  );

  const simTasks: SprintTask[] = useMemo(() => {
    if (!daySchedule) return [];
    const mockTasks = daySchedule.tasks.filter(
      (t) => t.taskType === 'Mock45Sim' || t.taskType === 'BlindArena'
    );
    return mockTasks.length > 0 ? mockTasks : daySchedule.tasks;
  }, [daySchedule]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [clarifiedIds, setClarifiedIds] = useState<Record<string, boolean>>({});
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<CodeLanguage>('python');
  const [showReference, setShowReference] = useState(false);
  const [twistChecked, setTwistChecked] = useState<Record<string, boolean>>({});
  const [submittedTasks, setSubmittedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open || !daySchedule) return;
    setActiveIdx(0);
    setSecondsLeft(daySchedule.dayNumber === 14 ? 45 * 60 : 30 * 60);
    setShowReference(false);
  }, [open, daySchedule]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  if (!open || !daySchedule || simTasks.length === 0) return null;

  const currentTask = simTasks[Math.min(activeIdx, simTasks.length - 1)];
  const problem = BIG_TECH_36_PROBLEMS.find((p) => p.slug === currentTask.problemSlug);
  if (!problem) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const draft = codeDrafts[currentTask.taskId] ?? '';
  const hasClarified = Boolean(clarifiedIds[currentTask.taskId]);
  const hasTwist = Boolean(twistChecked[currentTask.taskId]);
  const isAlreadyDone = currentTask.isCompleted || Boolean(submittedTasks[currentTask.taskId]);

  const handleSubmitTask = async () => {
    const score =
      72 +
      (hasClarified ? 10 : 0) +
      (draft.trim().length > 35 ? 10 : 4) +
      (hasTwist ? 8 : 0);

    setSubmittedTasks((prev) => ({ ...prev, [currentTask.taskId]: true }));
    await completeSprintTask(daySchedule.dayNumber, currentTask.taskId, Math.min(100, score));

    if (activeIdx + 1 < simTasks.length) {
      setActiveIdx(activeIdx + 1);
      setShowReference(false);
    } else {
      closeMock45();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock45-title"
    >
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
        {/* Top Arena Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" aria-hidden="true" />
              {daySchedule.dayNumber === 14
                ? `${activeSprint?.targetCompany.toUpperCase()} DAY 14 · 45-MIN SIMULATED INTERVIEW`
                : `DAY ${daySchedule.dayNumber} · ZERO-HINT BLIND ARENA`}
            </p>
            <h2 id="mock45-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Question {activeIdx + 1} of {simTasks.length}: #{problem.number} {problem.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 tabular-nums">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              {mins}:{secs}
            </div>
            <button
              type="button"
              onClick={closeMock45}
              aria-label="Exit simulated interview"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Question Switcher when Day 14 has 2 problems */}
        {simTasks.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {simTasks.map((t, idx) => (
              <button
                key={t.taskId}
                type="button"
                onClick={() => {
                  setActiveIdx(idx);
                  setShowReference(false);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
                  activeIdx === idx
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {(t.isCompleted || submittedTasks[t.taskId]) && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                )}
                Q{idx + 1}: {t.problemTitle} ({t.difficulty})
              </button>
            ))}
          </div>
        )}

        {/* Prompt Statement (Zero Hints by default) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2 text-xs">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            Prompt ({problem.difficulty})
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200">{problem.promptSummary}</p>
          <p className="font-mono text-slate-500 dark:text-slate-400">
            Constraints: {problem.constraintsText}
          </p>
        </div>

        {/* Interactive Pre-Code Clarification & Twist Defense */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              1. Edge-Case Clarification Check
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {problem.interviewSolutionLadder.clarifyingQuestions[0]?.question}
            </p>
            <button
              type="button"
              onClick={() =>
                setClarifiedIds((prev) => ({ ...prev, [currentTask.taskId]: true }))
              }
              className={`px-3 py-1.5 rounded-md font-semibold ${
                hasClarified
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                  : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
              }`}
            >
              {hasClarified ? 'Clarified With Interviewer' : 'Verify Edge Cases'}
            </button>
            {hasClarified && (
              <p className="text-slate-700 dark:text-slate-300 pt-1">
                Interviewer: &ldquo;{problem.interviewSolutionLadder.clarifyingQuestions[0]?.interviewerAnswer}&rdquo;
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/30 dark:bg-amber-950/20 space-y-2.5">
            <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              2. Live Interviewer Constraint Twist
            </div>
            <p className="text-slate-800 dark:text-slate-200">{currentTask.twistConstraint}</p>
            <button
              type="button"
              onClick={() =>
                setTwistChecked((prev) => ({ ...prev, [currentTask.taskId]: true }))
              }
              className={`px-3 py-1.5 rounded-md font-semibold border ${
                hasTwist
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : 'border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300'
              }`}
            >
              {hasTwist ? 'Adaptation Verified' : 'Check Optimal Adaptation'}
            </button>
            {hasTwist && (
              <p className="text-slate-700 dark:text-slate-300 pt-1">
                {problem.interviewSolutionLadder.interviewerFollowUp.adaptation}
              </p>
            )}
          </div>
        </div>

        {/* Blind Code Scratchpad */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="blind-arena-editor"
              className="text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              3. Write Invariant & Optimal Implementation (Zero-Hint Mode)
            </label>
            <div className="flex items-center gap-2">
              {(['python', 'js', 'java'] as CodeLanguage[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                    lang === l
                      ? 'border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowReference((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
              >
                {showReference ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showReference ? 'Hide Reference' : 'Compare Reference'}
              </button>
            </div>
          </div>

          <textarea
            id="blind-arena-editor"
            rows={7}
            value={draft}
            onChange={(e) =>
              setCodeDrafts((prev) => ({ ...prev, [currentTask.taskId]: e.target.value }))
            }
            placeholder={`// State your time/space invariant and write ${lang.toUpperCase()} solution here...`}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs leading-6 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {showReference && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                REFERENCE OPTIMAL ({problem.interviewSolutionLadder.optimalPitch.time} ·{' '}
                {problem.interviewSolutionLadder.optimalPitch.space}) — {problem.interviewSolutionLadder.optimalPitch.invariant}
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-emerald-900">
                {problem.solutions[lang]}
              </pre>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Submitting logs this problem to your {activeSprint?.targetCompany} Readiness Gauge.
          </span>
          <button
            type="button"
            onClick={handleSubmitTask}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            {isAlreadyDone
              ? activeIdx + 1 < simTasks.length
                ? 'Next Interview Question'
                : 'Finish Simulation'
              : activeIdx + 1 < simTasks.length
                ? 'Submit Q1 & Advance'
                : 'Submit & Complete Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
