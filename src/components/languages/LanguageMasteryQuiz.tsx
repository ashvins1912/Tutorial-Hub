import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import {
  LANGUAGE_MASTERY_QUIZ,
  type LangTrack,
} from '../../data/languagesTutorialData';

interface LanguageMasteryQuizProps {
  languageFilter: 'all' | LangTrack;
  solvedQuizIds: string[];
  onMarkQuizSolved: (id: string) => void;
  onResetQuizProgress: () => void;
}

export function LanguageMasteryQuiz({
  languageFilter,
  solvedQuizIds,
  onMarkQuizSolved,
  onResetQuizProgress,
}: LanguageMasteryQuizProps) {
  const questions = useMemo(
    () =>
      languageFilter === 'all'
        ? LANGUAGE_MASTERY_QUIZ
        : LANGUAGE_MASTERY_QUIZ.filter((q) => q.language === languageFilter),
    [languageFilter]
  );

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const handleChoose = (questionId: string, optionId: string, correctOptionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (optionId === correctOptionId) {
      onMarkQuizSolved(questionId);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Python 3.13+ &amp; Java 21+ Mastery Quiz
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Verify deep understanding from basic pitfalls to Virtual Threads, Generational ZGC, asyncio, and PEP 703 No-GIL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
            {solvedQuizIds.length}/{LANGUAGE_MASTERY_QUIZ.length} Mastered
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedAnswers({});
              onResetQuizProgress();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Quiz
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const picked = selectedAnswers[q.id];
          const isCorrect = picked === q.correctOptionId;
          const alreadySolved = solvedQuizIds.includes(q.id);

          return (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    Q{idx + 1}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-mono font-semibold ${
                      q.language === 'python'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {q.language === 'python' ? 'Python 3.13+' : 'Java 21+'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{q.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>{q.topic}</span>
                </div>
                {alreadySolved && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Solved
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-6">
                {q.question}
              </div>

              <div className="space-y-2">
                {q.options.map((opt) => {
                  const chosen = picked === opt.id;
                  const rightChoice = opt.id === q.correctOptionId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChoose(q.id, opt.id, q.correctOptionId)}
                      className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs transition-colors flex items-start gap-2.5 ${
                        picked
                          ? rightChoice
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                            : chosen
                              ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-sky-400 dark:hover:border-sky-600'
                      }`}
                    >
                      <span className="font-mono font-bold uppercase shrink-0">{opt.id}.</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {picked && (
                <div
                  className={`rounded-lg border p-3.5 text-xs space-y-1.5 ${
                    isCorrect
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        Not quite — here&apos;s why:
                      </>
                    )}
                  </div>
                  <p className="leading-5">
                    <strong>Simple English:</strong> {q.simpleExplanation}
                  </p>
                  <p className="font-mono text-[11px] opacity-90">
                    Technical Note: {q.technicalNote}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
