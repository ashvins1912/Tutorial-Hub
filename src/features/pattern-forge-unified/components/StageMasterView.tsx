import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import type { LearningTopic } from '../../../../shared/learningContract';
import { SPACED_REVISION_INTERVALS } from '../../../../shared/masteryEngine';
import { useUnifiedLearningStore } from '../useUnifiedLearningStore';

interface StageMasterViewProps {
  topic: LearningTopic;
}

export const StageMasterView: React.FC<StageMasterViewProps> = ({ topic }) => {
  const mastery = useUnifiedLearningStore((s) => s.getTopicMastery(topic.id));
  const revision = useUnifiedLearningStore((s) => s.revisionsByTopic[topic.id] ?? null);
  const assessmentHistory = useUnifiedLearningStore((s) =>
    s.assessmentHistory.filter((a) => a.topicId === topic.id)
  );
  const submitAssessmentAttempt = useUnifiedLearningStore((s) => s.submitAssessmentAttempt);
  const submitRevisionAttempt = useUnifiedLearningStore((s) => s.submitRevisionAttempt);

  const assessment = topic.assessments[0] ?? null;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resultFeedback, setResultFeedback] = useState<{
    scorePct: number;
    passed: boolean;
    items: Array<{ questionId: string; isCorrect: boolean; explanation: string }>;
  } | null>(null);
  const [revisionNotice, setRevisionNotice] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    setAnswers({});
    setResultFeedback(null);
    setRevisionNotice(null);
    startTimeRef.current = Date.now();
  }, [topic.id]);

  const handleSubmitExam = async () => {
    if (!assessment) return;
    setSubmitting(true);
    const elapsedSec = Math.max(5, Math.round((Date.now() - startTimeRef.current) / 1000));
    const res = await submitAssessmentAttempt(assessment.id, topic.id, answers, {
      hintsUsed: 0,
      timeTakenSec: elapsedSec,
    });
    setSubmitting(false);
    if (res) {
      setResultFeedback({
        scorePct: res.attempt.scorePct,
        passed: res.attempt.passed,
        items: res.feedback.map((f) => ({
          questionId: f.questionId,
          isCorrect: f.isCorrect,
          explanation: f.explanation,
        })),
      });
    }
  };

  const handleDelayedRecallLog = async (outcome: 'independent' | 'assisted' | 'struggled') => {
    const payload =
      outcome === 'independent'
        ? { scorePct: 95, hintsUsed: 0, timeTakenSec: 90, mistakesCount: 0 }
        : outcome === 'assisted'
          ? { scorePct: 78, hintsUsed: 1, timeTakenSec: 260, mistakesCount: 1 }
          : { scorePct: 50, hintsUsed: 2, timeTakenSec: 420, mistakesCount: 3 };
    const updated = await submitRevisionAttempt(topic.id, payload);
    if (updated) {
      setRevisionNotice(updated.adjustmentReason);
    }
  };

  return (
    <div className="space-y-8">
      {topic.verificationStatus !== 'Published' && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <strong>{topic.title} is inventory-only.</strong> The full five-stage content and transfer assessment are not published for this pattern yet. This panel may show saved evidence, but it does not certify a completed course.
        </div>
      )}
      {/* 8-Dimension Evidence-Based Mastery Dashboard */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-sky-700 dark:text-sky-400">
              Evidence-Based Mastery Engine · 8 Independent Dimensions
            </div>
            <h2 className="text-2xl font-display font-semibold text-slate-900 dark:text-slate-100">
              {topic.title} — Current Standing: {mastery.level}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mastered requires verifiable evidence across all 8 dimensions — watching a lesson or solving one easy problem never auto-awards Mastery.
            </p>
          </div>
          <div className="text-right font-mono tabular-nums">
            <div className="text-xs text-slate-500 dark:text-slate-400">Composite Evidence</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {mastery.overallScorePct}%
            </div>
          </div>
        </div>

        {/* 8 Dimension Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mastery.dimensions.map((dim) => (
            <div
              key={dim.dimension}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {dim.label}
                </span>
                <span
                  className={`font-mono font-semibold tabular-nums inline-flex items-center gap-1 ${
                    dim.metMasteryThreshold
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {dim.metMasteryThreshold && (
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {dim.scorePct}% / 80%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dim.metMasteryThreshold ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-sky-600 dark:bg-sky-500'
                  }`}
                  style={{ width: `${dim.scorePct}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {dim.metMasteryThreshold
                  ? `Threshold met (${dim.evidenceCount} verified evidence item${dim.evidenceCount === 1 ? '' : 's'}).`
                  : `In progress (${dim.evidenceCount} recorded evidence item${dim.evidenceCount === 1 ? '' : 's'}).`}
              </div>
            </div>
          ))}
        </div>

        {/* Remaining Evidence Required for Mastered */}
        {mastery.missingForMastery.length > 0 ? (
          <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Evidence Required to Reach Mastered ({mastery.missingForMastery.length} remaining)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {mastery.missingForMastery.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center gap-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            <Award className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Evidence-Verified Mastery Achieved across all 8 independent dimensions!</span>
          </div>
        )}
      </section>

      {/* Unseen Transfer Assessment */}
      {assessment && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
                <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                <span>Unseen Transfer &amp; Complexity Assessment · Passing Score {assessment.passingScorePct}%</span>
              </div>
              <h3 className="mt-1 text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
                {assessment.title}
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              Best Transfer Score: {mastery.evidence.transferAssessmentBestPct}% · Attempts: {assessmentHistory.length}
            </div>
          </div>

          <div className="space-y-5">
            {assessment.questions.map((q, idx) => {
              const fb = resultFeedback?.items.find((f) => f.questionId === q.id);
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {idx + 1}. {q.prompt}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const picked = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors ${
                            picked
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100 font-medium'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {fb && (
                    <div
                      className={`flex items-start gap-1.5 text-xs font-medium ${
                        fb.isCorrect
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {fb.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                      <span>{fb.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {resultFeedback ? (
              <div
                className={`text-sm font-semibold font-mono tabular-nums ${
                  resultFeedback.passed
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                Scored {resultFeedback.scorePct}% · {resultFeedback.passed ? 'Passed Transfer Gate' : 'Below 80% — Review Explanations & Retry'}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Historical attempts are preserved with content version v{topic.version.version}.
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleSubmitExam()}
              disabled={submitting || Object.keys(answers).length < assessment.questions.length}
              className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {submitting ? 'Grading…' : `Submit Transfer Assessment (${Object.keys(answers).length}/${assessment.questions.length})`}
            </button>
          </div>
        </section>
      )}

      {/* Adaptive Spaced-Revision Schedule (Day 1 -> 3 -> 7 -> 14 -> 30) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-400">
              <CalendarClock className="w-4 h-4" aria-hidden="true" />
              <span>Adaptive Spaced-Revision Schedule</span>
            </div>
            <h3 className="mt-1 text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
              Retention Ladder: Day 1 → Day 3 → Day 7 → Day 14 → Day 30
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {revision
              ? `Current Interval: Day ${revision.intervalDays} · Due ${new Date(revision.dueAt).toLocaleDateString()}`
              : 'Not yet scheduled (complete practice or transfer assessment)'}
          </div>
        </div>

        {/* Visual Interval Steps */}
        <div className="grid grid-cols-5 gap-2">
          {SPACED_REVISION_INTERVALS.map((day, idx) => {
            const active = revision ? revision.currentStageIndex === idx : idx === 0;
            const completed = revision ? revision.currentStageIndex > idx : false;
            return (
              <div
                key={day}
                className={`p-3 rounded-lg border text-center font-mono text-xs tabular-nums ${
                  active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold'
                    : completed
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400'
                }`}
              >
                Day {day}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          {revisionNotice ??
            revision?.adjustmentReason ??
            'Log a delayed-recall review below to see how independent recall advances intervals while struggles trigger targeted reinforcement.'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleDelayedRecallLog('independent')}
            className="px-3.5 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 whitespace-nowrap"
          >
            Log Independent Recall (Advance Interval)
          </button>
          <button
            type="button"
            onClick={() => void handleDelayedRecallLog('assisted')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-sky-500 whitespace-nowrap"
          >
            Log Assisted Recall (Hold Interval)
          </button>
          <button
            type="button"
            onClick={() => void handleDelayedRecallLog('struggled')}
            className="px-3.5 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:border-amber-500 whitespace-nowrap"
          >
            Log Recall Struggle (Reinforce Earlier)
          </button>
        </div>
      </section>
    </div>
  );
};
