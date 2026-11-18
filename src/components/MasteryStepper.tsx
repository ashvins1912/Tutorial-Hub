import { Check, ChevronRight } from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';

const STAGES: { id: 1 | 2 | 3 | 4 | 5; label: string; detail: string }[] = [
  { id: 1, label: '1. Problem X-Ray', detail: 'Signals & Big-O' },
  { id: 2, label: '2. Visual Sandbox', detail: 'Manual Dry-Run' },
  { id: 3, label: '3. Logic Builder', detail: 'Blocks & Code' },
  { id: 4, label: '4. Brute vs Optimal', detail: 'Race & Bottleneck' },
  { id: 5, label: '5. Mastery Map', detail: '18-Pattern Tree' },
];

export function MasteryStepper() {
  const currentStage = usePatternForgeStore((s) => s.currentStage);
  const setCurrentStage = usePatternForgeStore((s) => s.setCurrentStage);
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];

  const isStageDone = (stageId: number) => {
    if (stageId === 1) return progress.quizSolved;
    if (stageId === 2) return progress.sandboxSolved;
    if (stageId === 3) {
      return Boolean(
        progress.placedBlocks.optimal.init &&
          progress.placedBlocks.optimal.loop &&
          progress.placedBlocks.optimal.update
      );
    }
    if (stageId === 4) return progress.bottleneckSolved;
    return progress.feynmanCompleted;
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            #{problem.number} {problem.title}
          </span>
          <span aria-hidden="true">·</span>
          <span>{problem.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{problem.patternName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-sky-700 dark:text-sky-400">
            Target {problem.targetBigO} / {problem.spaceOptimal}
          </span>
        </div>

        <nav aria-label="5-Stage Mastery Stepper" className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
          {STAGES.map((stage, idx) => {
            const active = currentStage === stage.id;
            const done = isStageDone(stage.id);
            return (
              <div key={stage.id} className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentStage(stage.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 border-slate-900 dark:border-sky-500'
                      : done
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {done && !active && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />}
                  <span>{stage.label}</span>
                  <span className={`hidden sm:inline text-[11px] ${active ? 'opacity-80' : 'text-slate-400 dark:text-slate-500'}`}>
                    {stage.detail}
                  </span>
                </button>
                {idx < STAGES.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
