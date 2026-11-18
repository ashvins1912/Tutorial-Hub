import { useState } from 'react';
import { CheckCircle2, ClipboardCheck, X } from 'lucide-react';
import { COIN_CHANGE_SRTBOT } from '../../data/academyResources';

export function SrtbotWorksheetModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  if (!open) return null;

  const steps = COIN_CHANGE_SRTBOT.steps;
  const correctCount = steps.filter((step) => {
    const pick = selected[step.key];
    return step.options.find((o) => o.id === pick)?.isCorrect;
  }).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="MIT SRTBOT Dynamic Programming Worksheet"
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              MIT 6.006 FRAMEWORK · COIN CHANGE DP
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              SRTBOT 6-Step Recurrence Worksheet
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close SRTBOT worksheet"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => {
            const pick = selected[step.key];
            return (
              <div
                key={step.key}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                    {step.letter}. {step.title}
                  </span>
                  {step.options.find((o) => o.id === pick)?.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  )}
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{step.prompt}</p>
                <div className="space-y-2">
                  {step.options.map((opt) => {
                    const isPicked = pick === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelected((prev) => ({ ...prev, [step.key]: opt.id }))}
                        className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors ${
                          isPicked
                            ? opt.isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                              : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-slate-900 dark:text-slate-100'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium">{opt.text}</div>
                        {isPicked && (
                          <div
                            className={`mt-1 text-[11px] font-medium ${
                              opt.isCorrect
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {opt.feedback}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
            Verified: {correctCount} / {steps.length} SRTBOT steps
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
          >
            {correctCount === steps.length ? 'Done — Optimal DP Ready' : 'Return to Problem'}
          </button>
        </div>
      </div>
    </div>
  );
}
