import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react';
import { ModalShell } from '../../../shared/ui/ModalShell';
import { CONSTRAINT_DRILLS } from '../data/constraintDrills';

interface PatternRecognitionQuizModalProps {
  open: boolean;
  onClose: () => void;
  onOpenTopic: (topicId: string) => void;
}

const DRILL_SECONDS = 60;

export function PatternRecognitionQuizModal({
  open,
  onClose,
  onOpenTopic,
}: PatternRecognitionQuizModalProps) {
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DRILL_SECONDS);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = CONSTRAINT_DRILLS[index % CONSTRAINT_DRILLS.length];
  const isAnswered = selectedOptionId !== null;
  const isTimeUp = secondsLeft <= 0 && !isAnswered;

  useEffect(() => {
    if (!open || isAnswered || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, isAnswered, secondsLeft]);

  const handleChoose = (optionId: string) => {
    if (isAnswered || isTimeUp) return;
    setSelectedOptionId(optionId);
    setAnsweredCount((c) => c + 1);
    const opt = current.options.find((o) => o.id === optionId);
    if (opt?.isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setIndex((i) => (i + 1) % CONSTRAINT_DRILLS.length);
    setSelectedOptionId(null);
    setSecondsLeft(DRILL_SECONDS);
  };

  const handleRestart = () => {
    setIndex(0);
    setSelectedOptionId(null);
    setSecondsLeft(DRILL_SECONDS);
    setScore(0);
    setAnsweredCount(0);
    setStreak(0);
  };

  const pct = Math.round((secondsLeft / DRILL_SECONDS) * 100);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="60-Second Constraint-Reading Pattern Drill"
      subtitle="Read constraints first, eliminate O(N²) traps, and pick the optimal DSA pattern & data structure before time expires."
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Live Timer & Score Strip */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span>
                Drill {(index % CONSTRAINT_DRILLS.length) + 1} / {CONSTRAINT_DRILLS.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Score: <strong className="text-slate-900 dark:text-slate-100">{score}/{answeredCount}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Streak: <strong className="text-emerald-700 dark:text-emerald-400">{streak}</strong>
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 font-bold ${
                secondsLeft <= 15
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-sky-700 dark:text-sky-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {secondsLeft}s remaining
            </div>
          </div>

          <div className="h-1.5 w-full rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                secondsLeft <= 15
                  ? 'bg-rose-600 dark:bg-rose-400'
                  : 'bg-sky-600 dark:bg-sky-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Problem Statement & Constraints */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2.5">
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
            {current.problemTitle}
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {current.statement}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] font-mono text-sky-700 dark:text-sky-400">
            {current.constraints.map((c, idx) => (
              <span key={c}>
                {idx > 0 && <span className="text-slate-400 mr-3">·</span>}
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Pattern + Data Structure Choices */}
        <div className="space-y-2.5">
          {current.options.map((opt) => {
            const chosen = selectedOptionId === opt.id;
            const reveal = isAnswered || isTimeUp;
            const correctHighlight = reveal && opt.isCorrect;
            const wrongHighlight = reveal && chosen && !opt.isCorrect;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChoose(opt.id)}
                disabled={reveal}
                className={`w-full text-left rounded-xl border p-3.5 transition-colors space-y-1.5 ${
                  correctHighlight
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40'
                    : wrongHighlight
                      ? 'border-rose-400 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {opt.pattern}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Data Structure: {opt.dataStructure}
                    </div>
                  </div>
                  {correctHighlight && (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-label="Correct"
                    />
                  )}
                  {wrongHighlight && (
                    <XCircle
                      className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0"
                      aria-label="Incorrect"
                    />
                  )}
                </div>

                {reveal && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200/70 dark:border-slate-800">
                    {opt.rationale}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Restart
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenTopic(current.linkedTopicId);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-800 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500"
            >
              Study Topic
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors"
          >
            Next Constraint Drill →
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
