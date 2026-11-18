import { CheckCircle2, Lightbulb, Lock, MessageSquareQuote, Play, Compass } from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { PROBLEMS } from '../../data/problems';
import { PolyaStep } from '../../types/dsa';

const POLYA_STEPS: { id: PolyaStep; num: string; title: string; subtitle: string }[] = [
  { id: 'understand', num: '01', title: 'Understand', subtitle: 'X-Ray & Dry-Run' },
  { id: 'plan', num: '02', title: 'Plan', subtitle: 'Invariant Lock' },
  { id: 'execute', num: '03', title: 'Execute', subtitle: 'Blocks & Race' },
  { id: 'reflect', num: '04', title: 'Reflect', subtitle: 'Feynman Check' },
];

export function PolyaWorkflowBar() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const polyaStep = usePatternForgeStore((s) => s.polyaStep);
  const setPolyaStep = usePatternForgeStore((s) => s.setPolyaStep);
  const setCurrentStage = usePatternForgeStore((s) => s.setCurrentStage);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const selectLoopInvariant = usePatternForgeStore((s) => s.selectLoopInvariant);
  const submitFeynmanReflection = usePatternForgeStore((s) => s.submitFeynmanReflection);
  const openTopicQuiz = usePatternForgeStore((s) => s.openTopicQuiz);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];

  const stepDone: Record<PolyaStep, boolean> = {
    understand: progress.quizSolved && progress.sandboxSolved,
    plan: progress.invariantSolved,
    execute: progress.bottleneckSolved,
    reflect: progress.feynmanCompleted,
  };

  return (
    <section
      aria-label="Polya 4-Step Problem Solving Heuristic"
      className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Polya 4-Step Cognitive Loop
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {progress.isRecallMode ? '1-3-7-21 Recall Mode (Zero Hints)' : problem.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-3xl">
          {POLYA_STEPS.map((step) => {
            const isActive = polyaStep === step.id;
            const isDone = stepDone[step.id];
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setPolyaStep(step.id)}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${
                  isActive
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50/70 dark:bg-sky-950/50 text-slate-900 dark:text-slate-100'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {step.num} · {step.title}
                  </div>
                  <div className="text-xs font-medium truncate">{step.subtitle}</div>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-label="Completed" />
                ) : (
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                    {isActive ? 'ACTIVE' : 'OPEN'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 02: Loop Invariant Lock Panel */}
      {polyaStep === 'plan' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>{problem.loopInvariantPrompt}</span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {progress.invariantSolved ? 'INVARIANT VERIFIED' : 'REQUIRED BEFORE BLOCK ASSEMBLY'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {problem.loopInvariants.map((inv) => {
              const selected = progress.lockedInvariantId === inv.id;
              return (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => selectLoopInvariant(inv.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selected
                      ? inv.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100'
                        : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-sm font-medium">{inv.statement}</p>
                  {selected && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        inv.isCorrect
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {inv.isCorrect ? 'VERIFIED: ' : 'FLAW DETECTED: '}
                      {inv.feedback}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
          {progress.invariantSolved && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStage(3)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Proceed to Logic Block Builder
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 04: Feynman Rubber-Duck Reflection Panel */}
      {polyaStep === 'reflect' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <MessageSquareQuote className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Feynman Rubber-Duck Check — Explain the Core Speedup</span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {progress.feynmanCompleted ? 'LOGGED IN 1-3-7-21 QUEUE' : 'COMPLETE TO SCHEDULE RECALL'}
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mb-3 leading-relaxed">
            {problem.feynmanPrompt.templateBefore}
            <span className="font-mono font-semibold text-sky-700 dark:text-sky-300 underline decoration-dotted underline-offset-4">
              {progress.feynmanOptionId
                ? problem.feynmanPrompt.choices.find((c) => c.id === progress.feynmanOptionId)?.phrase
                : '[ select the accurate mental model below ]'}
            </span>
            {problem.feynmanPrompt.templateAfter}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {problem.feynmanPrompt.choices.map((choice) => {
              const selected = progress.feynmanOptionId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => submitFeynmanReflection(choice.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selected
                      ? choice.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100'
                        : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-sm font-medium">{choice.phrase}</p>
                  {selected && (
                    <p
                      className={`mt-2 text-xs font-medium ${
                        choice.isCorrect
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {choice.isCorrect ? 'VERIFIED: ' : 'RETHINK: '}
                      {choice.feedback}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {progress.feynmanCompleted && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                <span>
                  Next Review Twist: <strong className="text-slate-800 dark:text-slate-200">{problem.feynmanPrompt.twistConstraint}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => openTopicQuiz(problem.topicQuizId)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Take Topic Pattern Reflex Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
