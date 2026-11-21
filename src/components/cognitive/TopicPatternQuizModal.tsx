import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { OverlayDialog, OverlayHeader } from '../ui';

export function TopicPatternQuizModal() {
  const quizModalOpen = usePatternForgeStore((s) => s.quizModalOpen);
  const activeTopicQuiz = usePatternForgeStore((s) => s.activeTopicQuiz);
  const closeTopicQuiz = usePatternForgeStore((s) => s.closeTopicQuiz);
  const submitTopicQuiz = usePatternForgeStore((s) => s.submitTopicQuiz);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [result, setResult] = useState<{
    scorePct: number;
    passed: boolean;
    promoted: boolean;
    breakdown: {
      questionId: string;
      isCorrect: boolean;
      feedback: string;
      optimalComplexity: { time: string; space: string };
    }[];
  } | null>(null);

  useEffect(() => {
    if (!quizModalOpen) return;
    setAnswers({});
    setSecondsLeft(60);
    setResult(null);
  }, [quizModalOpen, activeTopicQuiz?.topicId]);

  useEffect(() => {
    if (!quizModalOpen || !timerEnabled || result) return;
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [quizModalOpen, timerEnabled, secondsLeft, result]);

  if (!activeTopicQuiz) return null;

  const handleGrade = async () => {
    const res = await submitTopicQuiz(answers);
    if (res) setResult(res);
  };

  return (
    <OverlayDialog
      open={quizModalOpen}
      onClose={closeTopicQuiz}
      ariaLabel="Topic Pattern Intuition Quiz"
      maxWidthClass="max-w-3xl"
    >
      <OverlayHeader
        kicker={`TOPIC PATTERN REFLEX QUIZ · ${activeTopicQuiz.tier.toUpperCase()} GATE`}
        title={activeTopicQuiz.topicTitle}
        onClose={closeTopicQuiz}
        closeAriaLabel="Close quiz modal"
        extraActions={
          <button
            type="button"
            onClick={() => setTimerEnabled((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300"
          >
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            {timerEnabled ? `Reflex: ${secondsLeft}s` : 'Timer Off'}
          </button>
        }
      />

      <div className="p-6 overflow-y-auto flex-1 space-y-5">
        <div className="space-y-6">
          {activeTopicQuiz.questions.map((q, idx) => {
            const selectedId = answers[q.id];
            const resItem = result?.breakdown.find((b) => b.questionId === q.id);

            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    Scenario {idx + 1}
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    Constraint: {q.constraintHint}
                  </span>
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {q.scenarioText}
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {q.questionPrompt}
                </p>

                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isPicked = selectedId === opt.id;
                    const showOutcome = Boolean(result) || isPicked;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        className={`w-full p-3 rounded-lg border text-left text-xs transition-colors ${
                          isPicked
                            ? opt.isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900 dark:text-slate-100">{opt.text}</div>
                        {isPicked && showOutcome && (
                          <p
                            className={`mt-1.5 font-medium ${
                              opt.isCorrect
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {opt.isCorrect ? 'VERIFIED: ' : 'FLAW: '}
                            {opt.cognitiveFeedback}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {resItem && (
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                    Optimal Complexity: {resItem.optimalComplexity.time} time · {resItem.optimalComplexity.space} space
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {result && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              result.passed
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {result.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>
                Score: {result.scorePct}% —{' '}
                {result.promoted
                  ? 'Rank Promotion Unlocked!'
                  : result.passed
                    ? 'Topic Quiz Passed (>= 80%)'
                    : 'Review Socratic feedback and retry to clear 80% gate'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={closeTopicQuiz}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleGrade}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
        >
          Submit & Score Quiz
        </button>
      </div>
    </OverlayDialog>
  );
}
