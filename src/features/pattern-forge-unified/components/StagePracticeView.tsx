import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  Play,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type {
  LearningTopic,
  PracticeCategory,
} from '../../../../shared/learningContract';
import {
  scorePatternRecognitionAttempt,
  type PatternRecognitionScoringResult,
} from '../../../../shared/masteryEngine';
import {
  runJsTestSuiteInSandbox,
  type SuiteExecutionReport,
} from '../../../lib/sandboxTestRunner';
import { useUnifiedLearningStore } from '../useUnifiedLearningStore';

interface StagePracticeViewProps {
  topic: LearningTopic;
  onAdvanceStage: () => void;
}

const CATEGORY_LABEL: Record<PracticeCategory, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  'edge-case': 'Edge-Case',
  debugging: 'Debugging Challenge',
  'mixed-pattern': 'Mixed Pattern',
  'unseen-transfer': 'Unseen Transfer',
};

export const StagePracticeView: React.FC<StagePracticeViewProps> = ({
  topic,
  onAdvanceStage,
}) => {
  const recordEvidence = useUnifiedLearningStore((s) => s.recordEvidence);
  const mastery = useUnifiedLearningStore((s) => s.getTopicMastery(topic.id));

  const [categoryFilter, setCategoryFilter] = useState<'all' | PracticeCategory>('all');
  const [blindMode, setBlindMode] = useState(true);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [code, setCode] = useState('');
  const [showHintIndex, setShowHintIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [execReport, setExecReport] = useState<SuiteExecutionReport | null>(null);

  // Pattern Recognition Intelligence state
  const prProblem = topic.problems.find((p) => Boolean(p.patternRecognitionPrompt));
  const prPrompt = prProblem?.patternRecognitionPrompt ?? null;
  const [prAnswers, setPrAnswers] = useState<Record<string, string>>({});
  const [prResult, setPrResult] = useState<PatternRecognitionScoringResult | null>(null);

  useEffect(() => {
    const debugProb = topic.problems.find((p) => p.category === 'debugging') ?? topic.problems[0];
    setSelectedProblemId(debugProb?.id ?? '');
    setCode(debugProb?.buggyCodeJs ?? debugProb?.starterCodeJs ?? '');
    setShowHintIndex(0);
    setExecReport(null);
    setPrAnswers({});
    setPrResult(null);
    setCategoryFilter('all');
  }, [topic.id, topic.problems]);

  if (topic.problems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-600 dark:text-slate-400">
        Progressive practice sets, debugging exercises, and Pattern Recognition prompts are currently authored for the 3 Published pilot patterns.
      </div>
    );
  }

  const filteredProblems =
    categoryFilter === 'all'
      ? topic.problems
      : topic.problems.filter((p) => p.category === categoryFilter);

  const activeProblem =
    filteredProblems.find((p) => p.id === selectedProblemId) ?? filteredProblems[0] ?? topic.problems[0];

  const handleSelectProblem = (id: string) => {
    const found = topic.problems.find((p) => p.id === id);
    if (!found) return;
    setSelectedProblemId(found.id);
    setCode(found.buggyCodeJs ?? found.starterCodeJs);
    setShowHintIndex(0);
    setExecReport(null);
  };

  const handleSubmitRecognition = () => {
    if (!prPrompt || !prProblem) return;
    const scored = scorePatternRecognitionAttempt(prPrompt, prAnswers);
    setPrResult(scored);
    void recordEvidence({
      topicId: topic.id,
      patternRecognitionProblemId: prProblem.id,
      patternRecognitionAnswers: { ...prAnswers },
    });
  };

  const handleRevealHint = () => {
    if (showHintIndex < activeProblem.hints.length) {
      setShowHintIndex((n) => n + 1);
      void recordEvidence({ topicId: topic.id, hintsUsedDelta: 1 });
    }
  };

  const handleRunPracticeCode = async () => {
    setRunning(true);
    const report = await runJsTestSuiteInSandbox(code, activeProblem.testSuite);
    setExecReport(report);
    setRunning(false);
    if (report.allPassed) {
      await recordEvidence({
        topicId: topic.id,
        verifiedProblemId: activeProblem.id,
      });
    }
  };

  const patternRevealed = !blindMode || !activeProblem.hidePatternUntilSolved || Boolean(execReport?.allPassed);

  return (
    <div className="space-y-8">
      {/* Section A: Pattern Recognition Intelligence (Section 8) */}
      {prPrompt && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-sky-700 dark:text-sky-400">
                Pattern Recognition Intelligence · Weighted Rubric (100%)
              </div>
              <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
                Diagnose Before Coding: {prPrompt.problemTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {prPrompt.problemExcerpt}
              </p>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {prPrompt.constraintsSummary}
              </div>
            </div>

            <div className="text-right font-mono tabular-nums">
              <div className="text-xs text-slate-500 dark:text-slate-400">Best Rubric Score</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {mastery.evidence.patternRecognitionBestPct}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {prPrompt.criteria.map((c) => {
              const selectedId = prAnswers[c.criterion];
              const graded = prResult?.breakdown.find((b) => b.criterion === c.criterion);
              return (
                <div
                  key={c.criterion}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {c.label}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      Weight {c.weight}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{c.question}</p>
                  <div className="space-y-1.5">
                    {c.options.map((opt) => {
                      const picked = selectedId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setPrAnswers((prev) => ({ ...prev, [c.criterion]: opt.id }))
                          }
                          className={`w-full text-left px-3 py-2 rounded-md border text-xs transition-colors ${
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
                  {graded && (
                    <div
                      className={`flex items-start gap-1.5 pt-1 text-[11px] font-medium ${
                        graded.isCorrect
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {graded.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                      <span>
                        {graded.earnedWeight}/{graded.weight}% · {graded.rationale}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Weights: Structural 20% · Pattern ID 25% · Data Structure 15% · Constraints 15% · Complexity 15% · Alternatives 10%
            </div>
            <button
              type="button"
              onClick={handleSubmitRecognition}
              disabled={Object.keys(prAnswers).length < prPrompt.criteria.length}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Evaluate Pattern Recognition ({Object.keys(prAnswers).length}/{prPrompt.criteria.length})
            </button>
          </div>
        </section>
      )}

      {/* Section B: Progressive Practice & Debugging Challenges */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
              Progressive Practice &amp; Debugging Lab
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Solve beginner, intermediate, mixed-pattern, and debugging challenges inside the live test sandbox.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBlindMode((b) => !b)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
            >
              {blindMode ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{blindMode ? 'Blind Pattern Mode: On' : 'Blind Pattern Mode: Off'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
          {(['all', 'beginner', 'intermediate', 'debugging', 'mixed-pattern'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? `All (${topic.problems.length})` : CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Problem List */}
          <div className="lg:col-span-4 space-y-2">
            {filteredProblems.map((p) => {
              const active = p.id === activeProblem.id;
              const solved = mastery.evidence.implementationsVerified.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProblem(p.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {p.title}
                    </span>
                    {solved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {CATEGORY_LABEL[p.category]} · {p.difficulty} · {p.testSuite.cases.length} tests
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Practice Workbench */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {activeProblem.category === 'debugging' && (
                    <Bug className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  )}
                  <span>
                    {CATEGORY_LABEL[activeProblem.category]} · {activeProblem.difficulty} ·{' '}
                    {patternRevealed ? `Pattern: ${topic.shortTitle}` : 'Pattern Hidden (Identify Independently)'}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
                  {activeProblem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCode(activeProblem.buggyCodeJs ?? activeProblem.starterCodeJs);
                  setExecReport(null);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeProblem.problemStatement}
            </p>

            {/* Progressive Hints */}
            {activeProblem.hints.length > 0 && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleRevealHint}
                  disabled={showHintIndex >= activeProblem.hints.length}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline disabled:opacity-50"
                >
                  <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {showHintIndex < activeProblem.hints.length
                      ? `Reveal Hint ${showHintIndex + 1} of ${activeProblem.hints.length} (tracked in adaptive revision)`
                      : 'All hints revealed'}
                  </span>
                </button>
                {showHintIndex > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    {activeProblem.hints.slice(0, showHintIndex).map((h, i) => (
                      <li key={i}>
                        <strong>Hint {i + 1}:</strong> {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <textarea
              aria-label="Practice solution editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={11}
              spellCheck={false}
              className="w-full p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-sky-500"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeProblem.category === 'debugging'
                  ? 'Passing all tests records Debugging Mastery evidence.'
                  : 'Passing all tests records Independent Implementation & Edge-Case evidence.'}
              </span>
              <button
                type="button"
                onClick={() => void handleRunPracticeCode()}
                disabled={running}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{running ? 'Verifying…' : 'Verify Solution'}</span>
              </button>
            </div>

            {execReport && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {execReport.fatalError ? (
                  <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-800 dark:text-rose-200">
                    {execReport.fatalError}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span
                        className={
                          execReport.allPassed
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }
                      >
                        {execReport.allPassed
                          ? `Verified: ${execReport.passedCount}/${execReport.totalCount} tests passed`
                          : `${execReport.passedCount}/${execReport.totalCount} tests passed — fix failing cases below`}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">{execReport.totalRuntimeMs} ms</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {execReport.results.map((r) => (
                        <div
                          key={r.caseId}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {r.name}
                            </span>
                            <span
                              className={`font-mono font-semibold shrink-0 ${
                                r.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {r.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          {!r.passed && (
                            <div className="mt-1 font-mono text-[11px] text-rose-700 dark:text-rose-300">
                              Exp {r.expectedDisplay} · Got {r.actualDisplay}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdvanceStage}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
        >
          <span>Continue to Stage 5: Mastery &amp; Spaced Revision</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
