import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type {
  LearningTopic,
  ReferenceLanguage,
  SolutionTier,
} from '../../../../shared/learningContract';
import {
  runJsTestSuiteInSandbox,
  type SuiteExecutionReport,
} from '../../../lib/sandboxTestRunner';
import { useUnifiedLearningStore } from '../useUnifiedLearningStore';

interface StageImplementViewProps {
  topic: LearningTopic;
  onAdvanceStage: () => void;
}

const LANGUAGE_LABELS: Record<ReferenceLanguage, string> = {
  java: 'Java 21 (Primary)',
  javascript: 'JavaScript (ES2022)',
  python: 'Python 3.12',
};

export const StageImplementView: React.FC<StageImplementViewProps> = ({
  topic,
  onAdvanceStage,
}) => {
  const recordEvidence = useUnifiedLearningStore((s) => s.recordEvidence);
  const mastery = useUnifiedLearningStore((s) => s.getTopicMastery(topic.id));

  const coreProblems = topic.problems.filter((p) => p.category !== 'debugging');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(coreProblems[0]?.id ?? '');
  const [selectedTier, setSelectedTier] = useState<SolutionTier>('optimal');
  const [selectedLang, setSelectedLang] = useState<ReferenceLanguage>('java');
  const [editorCode, setEditorCode] = useState<string>(coreProblems[0]?.starterCodeJs ?? '');
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<SuiteExecutionReport | null>(null);

  useEffect(() => {
    const first = topic.problems.filter((p) => p.category !== 'debugging')[0];
    setSelectedProblemId(first?.id ?? '');
    setEditorCode(first?.starterCodeJs ?? '');
    setSelectedTier('optimal');
    setReport(null);
  }, [topic.id, topic.problems]);

  const problem =
    coreProblems.find((p) => p.id === selectedProblemId) ?? coreProblems[0] ?? null;

  if (!problem) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-600 dark:text-slate-400">
        Verified Java 21 / JavaScript / Python 3.12 implementations are not yet published for this inventory pattern ({topic.verificationStatus}). Explore a Published pilot pattern to run verified implementations and test suites.
      </div>
    );
  }

  const activeVariant =
    problem.solution.variants.find((v) => v.tier === selectedTier) ??
    problem.solution.variants[problem.solution.variants.length - 1];

  const isVerifiedByLearner = mastery.evidence.implementationsVerified.includes(problem.id);

  const handleSelectProblem = (id: string) => {
    const next = coreProblems.find((p) => p.id === id);
    if (!next) return;
    setSelectedProblemId(next.id);
    setEditorCode(next.starterCodeJs);
    setSelectedTier(next.solution.variants.some((v) => v.tier === 'optimal') ? 'optimal' : next.solution.variants[0].tier);
    setReport(null);
  };

  const handleRunTests = async () => {
    setRunning(true);
    const result = await runJsTestSuiteInSandbox(editorCode, problem.testSuite);
    setReport(result);
    setRunning(false);
    if (result.allPassed) {
      await recordEvidence({
        topicId: topic.id,
        verifiedProblemId: problem.id,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
            Reference Implementations &amp; Verified Execution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Java 21 primary reference · Modern JavaScript &amp; Python 3.12 ·{' '}
            {mastery.evidence.implementationsVerified.length}/{topic.problems.length} verified by you
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {coreProblems.map((p) => {
            const active = p.id === problem.id;
            const passed = mastery.evidence.implementationsVerified.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProblem(p.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{p.title}</span>
                {passed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Specification & Complexity Summary */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
              {problem.title}
            </h3>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {problem.difficulty} · {problem.verificationStatus} · Time {problem.solution.complexityAnalysis.time} · Space{' '}
              {problem.solution.complexityAnalysis.space}
            </div>
          </div>
          {isVerifiedByLearner && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              All Tests Verified
            </span>
          )}
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {problem.problemStatement}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Verified Examples</div>
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono space-y-0.5"
              >
                <div className="text-slate-800 dark:text-slate-200">{ex.input}</div>
                <div className="text-sky-700 dark:text-sky-400">Output: {ex.output}</div>
                <div className="font-sans text-slate-500 dark:text-slate-400">{ex.explanation}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Constraints</div>
              <ul className="list-disc pl-5 space-y-1 font-mono text-slate-600 dark:text-slate-400">
                {problem.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Critical Edge Cases</div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {problem.solution.edgeCases.map((ec) => (
                  <li key={ec.caseTitle}>
                    <strong className="text-slate-800 dark:text-slate-200">{ec.caseTitle}:</strong>{' '}
                    <span className="font-mono">{ec.inputExample}</span> → {ec.expectedBehavior}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Code Progression (Brute -> Better -> Optimal) x (Java 21 / JS / Python 3.12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* Tier Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
              {problem.solution.variants.map((v) => (
                <button
                  key={v.tier}
                  type="button"
                  onClick={() => setSelectedTier(v.tier)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                    activeVariant.tier === v.tier
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {v.tier === 'brute' ? 'Brute Force' : v.tier === 'better' ? 'Better' : 'Optimal'}
                </button>
              ))}
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
              {(['java', 'javascript', 'python'] as ReferenceLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedLang === lang
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {activeVariant.label}
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
              Time {activeVariant.timeComplexity} · Space {activeVariant.spaceComplexity}
            </span>
          </div>

          <pre className="p-5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
            <code>{activeVariant.code[selectedLang]}</code>
          </pre>

          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3 text-xs">
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Step-by-Step Explanation
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                {activeVariant.stepByStepExplanation.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Isolated Client-Side Sandbox Verification Runner */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Independent Verification Sandbox (JavaScript)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Executes inside an isolated browser Web Worker with a 1500ms timeout and zero network/server access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditorCode(problem.starterCodeJs);
                setReport(null);
              }}
              aria-label="Reset code to starter"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <textarea
            aria-label="JavaScript solution editor"
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-sky-500"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {problem.testSuite.cases.length} tests ({problem.testSuite.cases.filter((c) => c.isEdgeCase || c.isBoundary).length} boundary/edge)
            </span>
            <button
              type="button"
              onClick={() => void handleRunTests()}
              disabled={running}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{running ? 'Running Suite…' : 'Run Verified Test Suite'}</span>
            </button>
          </div>

          {report && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              {report.fatalError ? (
                <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-200 font-mono">
                  Error: {report.fatalError}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span
                      className={
                        report.allPassed
                          ? 'text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5'
                          : 'text-rose-700 dark:text-rose-400 inline-flex items-center gap-1.5'
                      }
                    >
                      {report.allPassed ? (
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                      )}
                      {report.passedCount}/{report.totalCount} Tests Passed
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {report.totalRuntimeMs} ms
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {report.results.map((r) => (
                      <div
                        key={r.caseId}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {r.name}
                            {(r.isEdgeCase || r.isBoundary) && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal">
                                {' '}· {r.isEdgeCase ? 'Edge Case' : 'Boundary'}
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-mono font-semibold ${
                              r.passed
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                        {!r.passed && (
                          <div className="font-mono text-[11px] text-rose-700 dark:text-rose-300">
                            Expected {r.expectedDisplay}, got {r.actualDisplay}
                            {r.error ? ` (${r.error})` : ''}
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

      {/* Correctness Proof & Common Implementation Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 text-xs">
          <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100">
            Formal Correctness Proof (Loop Invariant)
          </h3>
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Invariant:</strong> {problem.solution.correctnessProof.invariant}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>Initialization:</strong> {problem.solution.correctnessProof.initialization}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>Maintenance:</strong> {problem.solution.correctnessProof.maintenance}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>Termination:</strong> {problem.solution.correctnessProof.termination}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 text-xs">
          <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100">
            Complexity Justification &amp; Common Implementation Mistakes
          </h3>
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Time ({problem.solution.complexityAnalysis.time}):</strong>{' '}
            {problem.solution.complexityAnalysis.timeJustification}
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Space ({problem.solution.complexityAnalysis.space}):</strong>{' '}
            {problem.solution.complexityAnalysis.spaceJustification}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {problem.solution.commonMistakes.map((m) => (
              <div key={m.mistake} className="text-slate-600 dark:text-slate-400">
                <strong className="text-rose-700 dark:text-rose-400">{m.mistake}:</strong> {m.whyItFails}{' '}
                <span className="text-emerald-700 dark:text-emerald-400">Fix: {m.fix}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdvanceStage}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
        >
          <span>Continue to Stage 4: Practice &amp; Pattern Recognition</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
