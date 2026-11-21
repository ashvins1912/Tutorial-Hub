import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Columns2,
  Eye,
  EyeOff,
  RotateCcw,
  SearchCheck,
} from 'lucide-react';
import {
  LANGUAGE_COMPARISON_PAIRS,
  LANGUAGE_PRACTICE_CHALLENGES,
  type LangTrack,
} from '../../data/languagesTutorialData';
import { CopyButton } from '../ui';

interface LanguagePracticeWorkbenchProps {
  languageFilter: 'all' | LangTrack;
  completedPracticeIds: string[];
  onMarkPracticeSolved: (id: string) => void;
}

function checkDelimiterSyntax(code: string, lang: LangTrack): string[] {
  const errors: string[] = [];
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const prev = code[i - 1];
    if (ch === "'" && !inDouble && prev !== '\\') {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle && prev !== '\\') {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;

    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (stack.pop() !== pairs[ch]) {
        errors.push(`Unmatched closing "${ch}" detected.`);
        break;
      }
    }
  }

  if (inSingle) errors.push("Unclosed single quote (') string literal.");
  if (inDouble) errors.push('Unclosed double quote (") string literal.');
  if (stack.length > 0) errors.push(`Missing closing delimiter for "${stack[stack.length - 1]}".`);

  if (lang === 'python' && /^\s*(def|class|if|for|while|async\s+def)\b[^:\n]+$/m.test(code)) {
    const lines = code.split('\n');
    const badLine = lines.find((l) => {
      const t = l.trim();
      return (
        /^(def|class|async\s+def)\s+/.test(t) &&
        !t.endsWith(':') &&
        !t.includes('#') &&
        t.includes(')')
      );
    });
    if (badLine) {
      errors.push(`Python block header appears to be missing a trailing colon ":": ${badLine.trim()}`);
    }
  }

  return errors;
}

export function LanguagePracticeWorkbench({
  languageFilter,
  completedPracticeIds,
  onMarkPracticeSolved,
}: LanguagePracticeWorkbenchProps) {
  const visibleChallenges = useMemo(
    () =>
      languageFilter === 'all'
        ? LANGUAGE_PRACTICE_CHALLENGES
        : LANGUAGE_PRACTICE_CHALLENGES.filter((c) => c.language === languageFilter),
    [languageFilter]
  );

  const [activeId, setActiveId] = useState<string>(LANGUAGE_PRACTICE_CHALLENGES[0].id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [activeComparisonId, setActiveComparisonId] = useState<string>(LANGUAGE_COMPARISON_PAIRS[0].id);

  const challenge = useMemo(
    () => visibleChallenges.find((c) => c.id === activeId) ?? visibleChallenges[0] ?? LANGUAGE_PRACTICE_CHALLENGES[0],
    [visibleChallenges, activeId]
  );

  const code = drafts[challenge.id] ?? challenge.starterCode;

  const syntaxErrors = useMemo(
    () => checkDelimiterSyntax(code, challenge.language),
    [code, challenge.language]
  );

  const evaluation = useMemo(() => {
    const results = challenge.rules.map((r) => ({
      ...r,
      passed: r.test(code),
    }));
    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === results.length && syntaxErrors.length === 0;
    return { results, passedCount, total: results.length, allPassed };
  }, [challenge, code, syntaxErrors.length]);

  useEffect(() => {
    if (evaluation.allPassed && !completedPracticeIds.includes(challenge.id)) {
      onMarkPracticeSolved(challenge.id);
    }
  }, [evaluation.allPassed, challenge.id, completedPracticeIds, onMarkPracticeSolved]);

  const activeComparison = useMemo(
    () => LANGUAGE_COMPARISON_PAIRS.find((p) => p.id === activeComparisonId) ?? LANGUAGE_COMPARISON_PAIRS[0],
    [activeComparisonId]
  );

  const updateCode = (next: string) => {
    setDrafts((prev) => ({ ...prev, [challenge.id]: next }));
  };

  const handleInsertSnippet = (snippet: string) => {
    const trimmed = code.trim();
    updateCode(trimmed ? `${trimmed}\n${snippet}` : snippet);
  };

  return (
    <div className="space-y-6">
      {/* Part 1: Side-by-Side Python 3.13+ vs Java 21+ Translator */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Columns2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Side-by-Side Idiom Translator: Python 3.13+ vs. Java 21+
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Compare how modern Python and Java 21 solve the exact same engineering problems cleanly.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {LANGUAGE_COMPARISON_PAIRS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => setActiveComparisonId(pair.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                  pair.id === activeComparison.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {pair.topic}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                Python 3.13+ · {activeComparison.topic}
              </span>
              <CopyButton text={activeComparison.pythonCode} label="Copy" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
              {activeComparison.pythonCode}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                Java 21 LTS · {activeComparison.topic}
              </span>
              <CopyButton text={activeComparison.javaCode} label="Copy" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
              {activeComparison.javaCode}
            </pre>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 leading-5 pt-1 border-t border-slate-200 dark:border-slate-800">
          <strong className="text-slate-900 dark:text-slate-100">Architect Takeaway:</strong>{' '}
          {activeComparison.keyTakeaway}
        </div>
      </section>

      {/* Part 2: Guided Hands-On Coding & Syntax Validator Labs */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SearchCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Guided Practice &amp; Live Syntax Validator Labs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Write modern Python 3.13+ and Java 21+ patterns with live syntax checks, quick-insert building blocks, and instant verification.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
            {completedPracticeIds.length}/{LANGUAGE_PRACTICE_CHALLENGES.length} Labs Solved
          </span>
        </div>

        {/* Balanced Lab Selector Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${
            visibleChallenges.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-6'
          }`}
        >
          {visibleChallenges.map((item) => {
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
                <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                  <span
                    className={
                      item.language === 'python'
                        ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                        : 'font-semibold text-amber-700 dark:text-amber-400'
                    }
                  >
                    {item.language === 'python' ? 'Py 3.13' : 'Java 21'} · {item.level}
                  </span>
                  {solved && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Two-Zone Editor & Live Validator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Prompt + Editor + Building Blocks */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-1.5 text-xs leading-5">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Lab 0{challenge.number}: {challenge.title}
              </div>
              <p className="text-slate-600 dark:text-slate-400">{challenge.scenario}</p>
              <p className="text-sky-800 dark:text-sky-300 font-medium">Goal: {challenge.goal}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Quick-Insert Building Blocks
              </div>
              <div className="flex flex-wrap gap-1.5">
                {challenge.buildingBlocks.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => handleInsertSnippet(b.snippet)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
                  >
                    + {b.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              aria-label={`Code editor for ${challenge.title}`}
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              rows={11}
              spellCheck={false}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-6 p-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSolution((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  {showSolution ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      Hide Solution
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      Show Reference Solution
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => updateCode(challenge.referenceSolution)}
                  className="px-3 py-1.5 rounded-lg border border-sky-500/60 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/70 transition-colors whitespace-nowrap"
                >
                  Load Solution
                </button>
              </div>
              <button
                type="button"
                onClick={() => updateCode(challenge.starterCode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset Starter
              </button>
            </div>

            {showSolution && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Reference Solution
                  </span>
                  <CopyButton text={challenge.referenceSolution} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {challenge.referenceSolution}
                </pre>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                  <strong>Why this works:</strong> {challenge.whyItWorks}
                </p>
              </div>
            )}
          </div>

          {/* Right 5 Cols: Real-Time Syntax & Rule Validation Checklist */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`rounded-xl border p-4 space-y-2 text-xs ${
                evaluation.allPassed
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : syntaxErrors.length > 0
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>Live Syntax &amp; Pattern Checks</span>
                <span className="font-mono tabular-nums">
                  {evaluation.passedCount}/{evaluation.total} Passed
                </span>
              </div>
              {syntaxErrors.length > 0 ? (
                <div className="space-y-1 pt-1">
                  {syntaxErrors.map((err) => (
                    <div key={err} className="flex items-start gap-1.5 font-mono text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] font-mono">
                  {evaluation.allPassed
                    ? 'ALL CHECKS PASSED — Syntax valid & modern pattern verified!'
                    : 'Syntax delimiters balanced. Complete the remaining pattern assertions below.'}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
              {evaluation.results.map((r) => (
                <div key={r.id} className="p-3.5 flex items-start gap-2.5 text-xs">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="space-y-1">
                    <div
                      className={`font-semibold ${
                        r.passed
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {r.label}
                    </div>
                    {!r.passed && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hint: {r.hint}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
