import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface QuizOptionItem {
  id: string;
  label: string;
}

export interface ConceptQuizQuestion {
  id: string;
  prompt: string;
  options: QuizOptionItem[];
  correctOptionId: string;
  explanation: string;
}

export interface ConceptQuizPanelProps {
  questions: ConceptQuizQuestion[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  heading?: string;
  className?: string;
}

/**
 * Reusable interactive multiple-choice knowledge check with answer validation,
 * explanation reveal, and tabular score readout.
 */
export const ConceptQuizPanel: React.FC<ConceptQuizPanelProps> = ({
  questions,
  answers,
  onSelectAnswer,
  heading,
  className = '',
}) => {
  const correctCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] === q.correctOptionId
  ).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {heading && (
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{heading}</h3>
          <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            {correctCount} / {questions.length} correct
          </span>
        </div>
      )}

      {questions.map((item, idx) => {
        const chosen = answers[item.id];
        const isAnswered = Boolean(chosen);
        const isCorrect = chosen === item.correctOptionId;

        return (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                <span className="font-mono text-slate-400 mr-2">{idx + 1}.</span>
                {item.prompt}
              </p>
              {isAnswered && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap shrink-0 ${
                    isCorrect
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{isCorrect ? 'Correct' : 'Review'}</span>
                </span>
              )}
            </div>

            <div className="grid gap-2">
              {item.options.map((opt) => {
                const selected = chosen === opt.id;
                const isAnswerOption = opt.id === item.correctOptionId;

                let stateClass =
                  'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-sky-400 text-slate-800 dark:text-slate-200';
                if (isAnswered) {
                  if (isAnswerOption) {
                    stateClass =
                      'border-emerald-400 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                  } else if (selected && !isAnswerOption) {
                    stateClass =
                      'border-rose-400 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectAnswer(item.id, opt.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm transition-colors ${stateClass}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                {item.explanation}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
};
