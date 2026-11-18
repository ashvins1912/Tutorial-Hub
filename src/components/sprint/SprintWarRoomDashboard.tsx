import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Gauge,
  Lock,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { SprintTask } from '../../types/dsa';
import { useSprintStore } from '../../store/useSprintStore';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { BIG_TECH_36_PROBLEMS } from '../../../server/seed/bigTechTopicSeed';

const TASK_TYPE_LABELS: Record<SprintTask['taskType'], string> = {
  PatternWarmup: 'PATTERN WARMUP',
  CoreProblem: 'CORE PROBLEM',
  SpacedRecall: 'SPACED RECALL TWIST',
  BlindArena: 'BLIND ARENA',
  Mock45Sim: '45-MIN MOCK INTERVIEW',
};

export function SprintWarRoomDashboard() {
  const activeSprint = useSprintStore((s) => s.activeSprint);
  const selectedDayNumber = useSprintStore((s) => s.selectedDayNumber);
  const setSelectedDayNumber = useSprintStore((s) => s.setSelectedDayNumber);
  const setConfiguratorOpen = useSprintStore((s) => s.setConfiguratorOpen);
  const openTrainerForProblem = useSprintStore((s) => s.openTrainerForProblem);
  const openMock45ForDay = useSprintStore((s) => s.openMock45ForDay);
  const completeSprintTask = useSprintStore((s) => s.completeSprintTask);
  const sprintBannerMessage = useSprintStore((s) => s.sprintBannerMessage);
  const clearSprintBanner = useSprintStore((s) => s.clearSprintBanner);

  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const brainProfile = usePatternForgeStore((s) => s.brainProfile);

  if (!activeSprint) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
          <Compass className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="max-w-xl mx-auto space-y-2">
          <p className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
            14-DAY COMPANY-SPECIFIC INTERVIEW WAR-ROOM
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Build Your Weighted 14-Day Big Tech Sprint
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Pick Google, Meta, Amazon, Microsoft, or Apple and your daily budget (60 or 120 mins). PatternForge dynamically weights high-frequency patterns, schedules 1-3-7-21 spaced recall twists on Days 4, 7, 10, and 13, and culminates in a Day 14 45-Minute Simulated Interview.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfiguratorOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
        >
          <Play className="w-3.5 h-3.5" aria-hidden="true" />
          Launch 14-Day Company Sprint
        </button>
      </div>
    );
  }

  const activeDay =
    activeSprint.dailySchedule.find((d) => d.dayNumber === selectedDayNumber) ??
    activeSprint.dailySchedule[0];

  const allTasks = activeSprint.dailySchedule.flatMap((d) => d.tasks);
  const completedCount = allTasks.filter((t) => t.isCompleted).length;
  const recallTasks = allTasks.filter((t) => t.taskType === 'SpacedRecall');
  const recallDone = recallTasks.filter((t) => t.isCompleted).length;
  const recallPct = recallTasks.length ? Math.round((recallDone / recallTasks.length) * 100) : 100;

  const handleLaunchTask = (task: SprintTask) => {
    if (task.taskType === 'Mock45Sim' || task.taskType === 'BlindArena') {
      openMock45ForDay(activeDay.dayNumber);
      return;
    }

    openTrainerForProblem(task.problemSlug, {
      sprintId: activeSprint.id,
      dayNumber: activeDay.dayNumber,
      taskId: task.taskId,
      problemSlug: task.problemSlug,
      taskType: task.taskType,
      twistConstraint: task.twistConstraint,
    });
    setActiveView('roadmap');
  };

  const handleOpenPolyaLab = (task: SprintTask) => {
    if (task.labProblemId) {
      selectProblem(task.labProblemId, {
        recallMode: task.taskType === 'SpacedRecall',
      });
    }
  };

  return (
    <div className="space-y-6">
      {sprintBannerMessage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-medium text-emerald-800 dark:text-emerald-200">
          <span>{sprintBannerMessage}</span>
          <button
            type="button"
            onClick={clearSprintBanner}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top War-Room Summary & Live Readiness Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
                {activeSprint.targetCompany.toUpperCase()} 14-DAY WAR-ROOM · {activeSprint.dailyMinutesBudget} MIN/DAY PACE
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                Day {activeSprint.currentDay} Active — {completedCount}/{allTasks.length} Sprint Tasks Cleared
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setConfiguratorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Reconfigure Sprint
            </button>
          </div>

          {/* Company Pattern Weight Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            {Object.entries(activeSprint.companyPatternWeights)
              .slice(0, 6)
              .map(([topic, weight]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300 truncate">{topic}</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {weight}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 dark:bg-sky-400"
                      style={{ width: `${Math.min(100, Number(weight) * 3)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Live Readiness Gauge */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              {activeSprint.targetCompany.toUpperCase()} READINESS GAUGE
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {activeSprint.readinessScore}%
            </span>
          </div>

          <div className="h-2.5 w-full rounded-md bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${activeSprint.readinessScore}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums pt-1">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Pattern Acc</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {brainProfile.cognitiveMetrics.signalRecognitionScore}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Diagnosis</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {brainProfile.cognitiveMetrics.bottleneckDiagnosisScore}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-slate-500">Recall Ret</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{recallPct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 14-Day Horizontal Timeline Strip */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            14-Day Progression Strip
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            Emerald = Completed · Blue = Active Day · Trophy = Day 14 45-Min Mock
          </span>
        </div>

        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {activeSprint.dailySchedule.map((day) => {
            const allDone = day.tasks.every((t) => t.isCompleted);
            const isSelected = activeDay.dayNumber === day.dayNumber;
            const isCurrent = activeSprint.currentDay === day.dayNumber;
            const isDay14 = day.dayNumber === 14;

            let tone =
              'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-500';
            if (allDone) {
              tone =
                'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
            } else if (day.isUnlocked || isCurrent) {
              tone =
                'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200';
            }

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`min-w-[88px] px-3 py-2.5 rounded-xl border text-left transition-all shrink-0 ${tone} ${
                  isSelected ? 'ring-2 ring-sky-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-xs font-mono font-bold">
                  <span>Day {day.dayNumber}</span>
                  {isDay14 ? (
                    <Trophy
                      className={`w-3.5 h-3.5 ${
                        day.isUnlocked ? 'text-amber-500 drop-shadow-xs' : 'text-amber-500/70'
                      }`}
                      aria-hidden="true"
                    />
                  ) : allDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  ) : !day.isUnlocked ? (
                    <Lock className="w-3 h-3 opacity-70" aria-hidden="true" />
                  ) : null}
                </div>
                <div className="text-[10px] truncate mt-0.5 opacity-85">
                  {isDay14 ? '45-Min Mock' : day.focusPattern.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Insider Strategy Banner */}
      <div className="rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/20 p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <div className="font-mono font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {activeSprint.targetCompany.toUpperCase()} INSIDER STRATEGY · DAY {activeDay.dayNumber}
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {activeDay.companyInsiderTip}
          </p>
          <p className="text-slate-600 dark:text-slate-400">{activeDay.phaseTitle}</p>
        </div>

        <div className="space-y-1.5 lg:border-l lg:border-sky-200 dark:lg:border-sky-900 lg:pl-5">
          <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            READ &amp; IDENTIFY TRIGGER REMINDER · {activeDay.focusPattern.toUpperCase()}
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeDay.patternTriggerReminder}
          </p>
        </div>
      </div>

      {/* Today's Action Checklist */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Day {activeDay.dayNumber} Action Checklist
            {!activeDay.isUnlocked && (
              <span className="ml-2 text-xs font-mono text-amber-600 dark:text-amber-400">
                [PREVIEW · Complete Day {activeDay.dayNumber - 1} to unlock officially]
              </span>
            )}
          </h3>
          {activeDay.dayNumber === 14 && (
            <button
              type="button"
              onClick={() => openMock45ForDay(14)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
            >
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              Launch 45-Minute Simulated Interview
            </button>
          )}
        </div>

        <div className="space-y-3">
          {activeDay.tasks.map((task) => {
            const fullProblem = BIG_TECH_36_PROBLEMS.find((p) => p.slug === task.problemSlug);
            return (
              <div
                key={task.taskId}
                className={`rounded-xl border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  task.isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`font-mono font-bold ${
                        task.taskType === 'SpacedRecall'
                          ? 'text-amber-700 dark:text-amber-400'
                          : task.taskType === 'Mock45Sim' || task.taskType === 'BlindArena'
                            ? 'text-rose-700 dark:text-rose-400'
                            : 'text-sky-700 dark:text-sky-400'
                      }`}
                    >
                      {TASK_TYPE_LABELS[task.taskType]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      #{task.problemNumber}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {task.problemTitle}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {task.difficulty} · {task.topicCategory} · ~{task.estimatedMinutes}m
                    </span>
                  </div>

                  {fullProblem && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Pattern: {fullProblem.primaryPattern} · {fullProblem.promptSummary}
                    </p>
                  )}

                  {task.taskType === 'SpacedRecall' && task.twistConstraint && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{task.twistConstraint}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {task.labProblemId && (
                    <button
                      type="button"
                      onClick={() => handleOpenPolyaLab(task)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      5-Stage Lab
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleLaunchTask(task)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      task.isCompleted
                        ? 'border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
                    }`}
                  >
                    {task.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Passed ({task.scoreEarned}%) · Review
                      </>
                    ) : (
                      <>
                        {task.taskType === 'Mock45Sim' || task.taskType === 'BlindArena'
                          ? 'Enter Timed Arena'
                          : 'Start Guided Drill'}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </>
                    )}
                  </button>

                  {!task.isCompleted && (
                    <button
                      type="button"
                      onClick={() => completeSprintTask(activeDay.dayNumber, task.taskId, 90)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
