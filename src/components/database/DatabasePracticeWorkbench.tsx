import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { PRACTICE_CHALLENGES } from '../../data/databaseVisualData';
import { CopyButton } from '../ui';

interface DatabasePracticeWorkbenchProps {
  completedPracticeIds: string[];
  onMarkPracticeSolved: (challengeId: string) => void;
}

export function DatabasePracticeWorkbench({
  completedPracticeIds,
  onMarkPracticeSolved,
}: DatabasePracticeWorkbenchProps) {
  const [activeId, setActiveId] = useState(PRACTICE_CHALLENGES[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(PRACTICE_CHALLENGES.map((c) => [c.id, c.starterCode]))
  );
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [showSolution, setShowSolution] = useState(false);

  const challenge = useMemo(
    () => PRACTICE_CHALLENGES.find((c) => c.id === activeId) ?? PRACTICE_CHALLENGES[0],
    [activeId]
  );

  const code = drafts[challenge.id] ?? challenge.starterCode;
  const hintLevel = revealedHints[challenge.id] ?? 0;

  const evaluation = useMemo(() => {
    const results = challenge.rules.map((rule) => ({
      ...rule,
      passed: rule.test(code),
    }));
    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === results.length;
    return { results, passedCount, total: results.length, allPassed };
  }, [challenge, code]);

  // Persist completion automatically as soon as all architectural assertions pass
  useEffect(() => {
    if (evaluation.allPassed && !completedPracticeIds.includes(challenge.id)) {
      onMarkPracticeSolved(challenge.id);
    }
  }, [evaluation.allPassed, challenge.id, completedPracticeIds, onMarkPracticeSolved]);

  const updateCode = (next: string) => {
    setDrafts((prev) => ({ ...prev, [challenge.id]: next }));
  };

  const handleInsertToken = (snippet: string) => {
    const trimmed = code.trim();
    const next = trimmed ? `${trimmed}\n${snippet}` : snippet;
    updateCode(next);
  };

  const confidencePct = Math.round(
    (completedPracticeIds.length / Math.max(1, PRACTICE_CHALLENGES.length)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Challenge Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {PRACTICE_CHALLENGES.map((item) => {
          const active = item.id === challenge.id;
          const solved = completedPracticeIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveId(item.id);
                setShowSolution(false);
              }}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-sky-700 dark:text-sky-400 font-semibold">
                  Lab 0{item.number} · {item.difficulty}
                </span>
                {solved && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug line-clamp-2">
                {item.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Practice Workbench */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
              Hands-On Lab 0{challenge.number} · {challenge.topic}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              {challenge.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
              <strong className="text-slate-900 dark:text-slate-200">Scenario: </strong>
              {challenge.scenario}
            </p>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-6">
              <strong>Your Task: </strong>
              {challenge.goal}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-4 py-3 shrink-0 min-w-[180px]">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Practice Confidence</div>
            <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {confidencePct}% ({completedPracticeIds.length}/{PRACTICE_CHALLENGES.length})
            </div>
          </div>
        </div>

        {/* Two-Column Practice Split: Left Editor, Right Live Verifier & Hints */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: Interactive SQL / Index / Config Editor */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="practice-sql-editor"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100"
              >
                <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Practice SQL / Index Editor (Live Verification)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateCode(challenge.starterCode)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-400 whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCode(challenge.referenceSolution);
                    setShowSolution(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  Load Reference Solution
                </button>
              </div>
            </div>

            <textarea
              id="practice-sql-editor"
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              rows={9}
              spellCheck={false}
              className="w-full p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-6 border border-slate-800 focus:outline-none focus:border-sky-500 resize-y"
            />

            {/* Quick-Insert Building Blocks for Beginner Confidence */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Quick-Insert Building Blocks (click to append into editor):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {challenge.quickTokens.map((tok) => (
                  <button
                    key={tok.label}
                    type="button"
                    onClick={() => handleInsertToken(tok.snippet)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                  >
                    {tok.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progressive Hint Ladder */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={hintLevel >= challenge.hints.length}
                  onClick={() =>
                    setRevealedHints((prev) => ({
                      ...prev,
                      [challenge.id]: Math.min(challenge.hints.length, hintLevel + 1),
                    }))
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline disabled:opacity-40"
                >
                  <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                  {hintLevel === 0
                    ? `Show Step-by-Step Hint (1/${challenge.hints.length})`
                    : hintLevel < challenge.hints.length
                      ? `Reveal Next Hint (${hintLevel + 1}/${challenge.hints.length})`
                      : 'All Hints Revealed'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSolution((v) => !v)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  {showSolution ? 'Hide Solution Notes' : 'Show Solution Explanation'}
                </button>
              </div>

              {hintLevel > 0 && (
                <ol className="space-y-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-xs text-amber-950 dark:text-amber-200 list-decimal pl-7">
                  {challenge.hints.slice(0, hintLevel).map((hint) => (
                    <li key={hint} className="leading-5">
                      {hint}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Real-Time Architectural Assertions & Impact Proof */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Live Production Readiness Checks
                </span>
                <span
                  className={`text-xs font-mono tabular-nums font-semibold ${
                    evaluation.allPassed
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {evaluation.passedCount} / {evaluation.total} Passed
                </span>
              </div>

              <div className="space-y-2">
                {evaluation.results.map((rule) => (
                  <div
                    key={rule.id}
                    className={`rounded-lg border p-3 text-xs space-y-1 transition-colors ${
                      rule.passed
                        ? 'border-emerald-300 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      {rule.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 pl-6 leading-5">
                      {rule.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Outcome Banner */}
            {(evaluation.allPassed || showSolution) && (
              <div className="rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                    {evaluation.allPassed
                      ? 'Verified Production Solution — Confidence Unlocked'
                      : 'Architect Reference Explanation'}
                  </span>
                  <CopyButton
                    text={challenge.referenceSolution}
                    label="Copy Ref"
                    copiedLabel="Copied"
                    size="xs"
                  />
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-5">{challenge.whyItWorks}</p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/60 font-mono text-[11px]">
                  <span className="text-rose-700 dark:text-rose-400">Before: {challenge.beforeMetric}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                    After: {challenge.afterMetric}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
