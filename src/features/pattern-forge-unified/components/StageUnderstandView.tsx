import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { LearningTopic } from '../../../../shared/learningContract';
import { useUnifiedLearningStore } from '../useUnifiedLearningStore';

interface StageUnderstandViewProps {
  topic: LearningTopic;
  onSelectTopic: (topicId: string) => void;
  onAdvanceStage: () => void;
}

export const StageUnderstandView: React.FC<StageUnderstandViewProps> = ({
  topic,
  onSelectTopic,
  onAdvanceStage,
}) => {
  const recordEvidence = useUnifiedLearningStore((s) => s.recordEvidence);
  const mastery = useUnifiedLearningStore((s) => s.getTopicMastery(topic.id));

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOptionId(null);
  }, [topic.id]);

  const u = topic.understand;

  if (!u) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Status: {topic.verificationStatus} · v{topic.version.version} · Registered Canonical Inventory
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 dark:text-slate-100">
            {topic.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {topic.description}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Per Content Quality Governance, this pattern is registered in the 28-pattern canonical contract with prerequisites, objectives, and recognition signals, and is intentionally NOT labeled Published until full multi-language test suites and traces pass technical review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recognition Signals
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
              {topic.recognitionSignals.map((sig) => (
                <li key={sig}>{sig}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Learning Objectives ({topic.learningObjectives.length})
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
              {topic.learningObjectives.map((obj) => (
                <li key={obj.id}>{obj.statement}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const chosenOption = u.conceptCheck.options.find((o) => o.id === selectedOptionId);

  const handleChooseConceptOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const opt = u.conceptCheck.options.find((o) => o.id === optionId);
    void recordEvidence({
      topicId: topic.id,
      understandCompleted: true,
      conceptCheckPassed: Boolean(opt?.isCorrect),
    });
  };

  return (
    <div className="space-y-8">
      {/* Core Mental Model & Real-World Analogy */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-sky-700 dark:text-sky-400">
              Stage 1 · Conceptual Foundation
            </div>
            <h2 className="text-2xl font-display font-semibold text-slate-900 dark:text-slate-100">
              What is {topic.shortTitle} and Why Does It Exist?
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Pattern Definition</h3>
              <p className="mt-1">{u.whatIsPattern}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Why It Exists</h3>
              <p className="mt-1">{u.whyItExists}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Core Problem Solved</h3>
              <p className="mt-1">{u.problemItSolves}</p>
            </div>
          </div>

          {topic.prerequisites.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Prerequisites
              </h3>
              <div className="space-y-2">
                {topic.prerequisites.map((pr) => (
                  <div
                    key={pr.topicId}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectTopic(pr.topicId)}
                        className="font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        {pr.title}
                      </button>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{pr.required ? 'Required' : 'Recommended'}</span>
                    </div>
                    <span>{pr.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Real-World Analogy
          </div>
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
            {u.realWorldAnalogy.title}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {u.realWorldAnalogy.narrative}
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Mapping to the Algorithm
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {u.realWorldAnalogy.mappingToAlgorithm}
            </p>
          </div>
        </div>
      </section>

      {/* When to Use vs. When NOT to Use + Advantages / Limitations */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-slate-900 dark:text-slate-100">
            When to Use &amp; Advantages
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
            {u.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Key Advantages
            </div>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-5">
              {u.advantages.map((adv) => (
                <li key={adv}>{adv}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-display font-semibold text-slate-900 dark:text-slate-100">
            When NOT to Use &amp; Limitations
          </h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
            {u.whenNotToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Trade-Offs &amp; Limitations
            </div>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-5">
              {u.limitations.map((lim) => (
                <li key={lim}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Brute Force vs. Optimized Comparisons */}
      <section className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
          Brute Force vs. Optimized Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {u.bruteForceComparisons.map((cmp) => (
            <div
              key={cmp.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
            >
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {cmp.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Brute Force · <span className="font-mono">{cmp.bruteTime} / {cmp.bruteSpace}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{cmp.bruteApproach}</p>
                </div>
                <div className="p-3 rounded-lg bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 space-y-1">
                  <div className="font-semibold text-sky-900 dark:text-sky-200">
                    Optimized · <span className="font-mono">{cmp.optimizedTime} / {cmp.optimizedSpace}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{cmp.optimizedApproach}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">Bottleneck Eliminated:</strong> {cmp.bottleneck}{' '}
                {cmp.whyBetter}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Worked Simple Example & Conceptual Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
          Worked Examples &amp; Key Observations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[u.simpleExample, ...u.conceptualExamples].map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {ex.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{ex.problemStatement}</p>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-1">
                  <div>In: {ex.input}</div>
                  <div>Out: {ex.output}</div>
                </div>
                <ol className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-decimal pl-4">
                  {ex.walkthrough.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-sky-800 dark:text-sky-300">
                <strong>Key Observation:</strong> {ex.keyObservation}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Misconceptions */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <h3 className="text-base font-display font-semibold text-slate-900 dark:text-slate-100">
          Common Misconceptions to Avoid
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {u.commonMisconceptions.map((item) => (
            <div
              key={item.misconception}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                Misconception: {item.misconception}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">Correction:</strong>{' '}
                {item.correction}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stage 1 Conceptual Check Evidence Gate */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-display font-semibold text-slate-900 dark:text-slate-100">
              Conceptual Verification Check
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passing this check records Stage 1 Conceptual Understanding evidence.
            </p>
          </div>
          {mastery.evidence.conceptCheckPassed && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Concept Check Verified
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {u.conceptCheck.prompt}
        </p>

        <div className="space-y-2">
          {u.conceptCheck.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChooseConceptOption(opt.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  isSelected && opt.isCorrect
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                    : isSelected && !opt.isCorrect
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {chosenOption && (
          <div
            className={`flex items-start gap-2 text-xs font-medium ${
              chosenOption.isCorrect
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-700 dark:text-rose-400'
            }`}
          >
            {chosenOption.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span>{chosenOption.explanation}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              void recordEvidence({ topicId: topic.id, understandCompleted: true });
              onAdvanceStage();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
          >
            <span>Continue to Stage 2: Visualize</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
};
