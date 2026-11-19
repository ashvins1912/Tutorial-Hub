import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  HelpCircle,
  Lock,
  RotateCcw,
  Sparkles,
  Unlock,
  XCircle,
} from 'lucide-react';

export interface ActiveRecallCodeEditorProps {
  /** Complete multi-line code template string (newline-separated) */
  codeTemplate: string;
  /** 0-based line indices in codeTemplate that render as interactive blank editor slots */
  blankIndices: number[];
  /** File / language display label (e.g. "solution.py", "Solution.java") */
  languageLabel: string;
  /** Complexity readout (e.g. "O(N)") */
  complexityLabel: string;
  /** Optional contextual hints aligned with blankIndices */
  hints?: string[];
  /** Optional distractor lines mixed into the quick-snap bank */
  distractorLines?: string[];
  /** Key that resets local editor state when problem or language changes */
  resetKey: string;
  /** Whether the Optimal solution code is already unlocked */
  isUnlocked: boolean;
  /** Triggered when all blank lines pass verification (or user chooses to unlock) */
  onUnlockOptimal: () => void;
  /** Optional callback to re-lock and practice again */
  onRelock?: () => void;
}

function normalizeLine(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/['"`]/g, '')
    .replace(/;+$/g, '');
}

/** Extract meaningful identifier / operator tokens to allow minor naming or spacing variations */
function extractKeyTokens(line: string): string[] {
  const matches = line.toLowerCase().match(/[a-z_][a-z0-9_]*|[<>!=]=|&&|\|\||[+\-*]/g) ?? [];
  const noise = new Set(['const', 'let', 'var', 'int', 'if', 'for', 'while', 'return', 'new', 'final']);
  return Array.from(new Set(matches.filter((t) => t.length >= 2 && !noise.has(t))));
}

function verifyBlankLine(input: string, expected: string): boolean {
  const trimmedInput = input.trim();
  if (!trimmedInput) return false;
  const normIn = normalizeLine(trimmedInput);
  const normExp = normalizeLine(expected);
  if (normIn === normExp) return true;

  // Allow semantically equivalent syntax (e.g. minor whitespace/quote/type annotation differences)
  const expectedTokens = extractKeyTokens(expected);
  if (expectedTokens.length === 0) return normIn === normExp;
  const lowerInput = trimmedInput.toLowerCase();
  const matched = expectedTokens.filter((tok) => lowerInput.includes(tok)).length;
  return matched >= Math.max(1, Math.ceil(expectedTokens.length * 0.75));
}

export function ActiveRecallCodeEditor({
  codeTemplate,
  blankIndices,
  languageLabel,
  complexityLabel,
  hints = [],
  distractorLines = [],
  resetKey,
  isUnlocked,
  onUnlockOptimal,
  onRelock,
}: ActiveRecallCodeEditorProps) {
  const lines = useMemo(() => codeTemplate.split('\n'), [codeTemplate]);
  const sortedBlanks = useMemo(
    () =>
      Array.from(new Set(blankIndices))
        .filter((idx) => idx >= 0 && idx < lines.length)
        .sort((a, b) => a - b),
    [blankIndices, lines.length],
  );

  const [values, setValues] = useState<Record<number, string>>({});
  const [focusedLineIdx, setFocusedLineIdx] = useState<number>(sortedBlanks[0] ?? 0);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [validation, setValidation] = useState<{
    checked: boolean;
    results: Record<number, boolean>;
    allValid: boolean;
  } | null>(null);

  useEffect(() => {
    setValues({});
    setFocusedLineIdx(sortedBlanks[0] ?? 0);
    setRevealedHints({});
    setValidation(null);
  }, [resetKey, sortedBlanks.join(',')]);

  const snippetBank = useMemo(() => {
    const correctLines = sortedBlanks.map((idx) => lines[idx].trim()).filter(Boolean);
    const cleanedDistractors = distractorLines
      .map((d) => d.trim())
      .filter((d) => d.length > 0 && !correctLines.includes(d))
      .slice(0, 2);

    const combined = Array.from(new Set([...correctLines, ...cleanedDistractors]));
    const seed = resetKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return combined
      .map((snippet, idx) => ({
        snippet,
        rank: ((seed + idx * 37 + snippet.length * 13) % 89) / 89,
      }))
      .sort((a, b) => a.rank - b.rank)
      .map((entry) => entry.snippet);
  }, [sortedBlanks, lines, distractorLines, resetKey]);

  const handleInsertSnippet = (snippet: string) => {
    const targetIdx = sortedBlanks.includes(focusedLineIdx)
      ? focusedLineIdx
      : (sortedBlanks.find((idx) => !(values[idx] ?? '').trim()) ?? sortedBlanks[0]);
    if (targetIdx === undefined) return;

    setValues((prev) => ({ ...prev, [targetIdx]: snippet }));
    const pos = sortedBlanks.indexOf(targetIdx);
    if (pos >= 0 && pos + 1 < sortedBlanks.length) {
      setFocusedLineIdx(sortedBlanks[pos + 1]);
    }
    setValidation(null);
  };

  const handleVerify = () => {
    const results: Record<number, boolean> = {};
    let allValid = true;
    for (const idx of sortedBlanks) {
      const ok = verifyBlankLine(values[idx] ?? '', lines[idx] ?? '');
      results[idx] = ok;
      if (!ok) allValid = false;
    }
    setValidation({ checked: true, results, allValid });
    if (allValid) {
      onUnlockOptimal();
    }
  };

  const handleReset = () => {
    setValues({});
    setFocusedLineIdx(sortedBlanks[0] ?? 0);
    setValidation(null);
    onRelock?.();
  };

  const filledCount = sortedBlanks.filter((idx) => (values[idx] ?? '').trim().length > 0).length;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            {isUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>Active Recall Editor</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300 tabular-nums">
              {sortedBlanks.length} Critical Lines
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isUnlocked
              ? 'Optimal solution unlocked! Review the full synchronized code or re-lock to test your recall.'
              : `Fill in the ${sortedBlanks.length} missing critical lines of logic (type directly or click a snippet below) to reveal the full Optimal solution.`}
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
          {filledCount}/{sortedBlanks.length} filled
        </span>
      </div>

      {/* Interactive Code Editor Surface */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
        <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <span>{languageLabel}</span>
          <span className="tabular-nums">
            Target: {complexityLabel} · Active Line {focusedLineIdx + 1}
          </span>
        </div>

        <div className="p-3.5 font-mono text-xs leading-6 overflow-x-auto space-y-0.5">
          {lines.map((line, lineIdx) => {
            const blankPos = sortedBlanks.indexOf(lineIdx);
            const isBlank = blankPos !== -1;

            if (!isBlank) {
              return (
                <div key={lineIdx} className="flex gap-3 text-slate-300 whitespace-pre">
                  <span className="w-5 text-right select-none text-slate-600 tabular-nums shrink-0">
                    {lineIdx + 1}
                  </span>
                  <span>{line}</span>
                </div>
              );
            }

            const indentMatch = line.match(/^\s*/);
            const indent = indentMatch ? indentMatch[0] : '';
            const status = validation?.checked
              ? validation.results[lineIdx]
                ? 'correct'
                : 'wrong'
              : 'idle';
            const isFocused = focusedLineIdx === lineIdx;
            const hintText = hints[blankPos];

            return (
              <div key={lineIdx} className="space-y-1 py-0.5">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-right select-none text-sky-400 font-bold tabular-nums shrink-0">
                    {lineIdx + 1}
                  </span>
                  <div className="flex items-center flex-1 min-w-0">
                    {indent && <span className="whitespace-pre select-none">{indent}</span>}
                    <input
                      type="text"
                      value={values[lineIdx] ?? ''}
                      onFocus={() => setFocusedLineIdx(lineIdx)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValues((prev) => ({ ...prev, [lineIdx]: val }));
                        setValidation(null);
                      }}
                      placeholder={`Line ${lineIdx + 1}: enter missing logic…`}
                      aria-label={`Missing logic line ${lineIdx + 1}`}
                      className={`flex-1 min-w-[210px] rounded-md border px-2.5 py-1 font-mono text-xs bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                        status === 'correct'
                          ? 'border-emerald-500 ring-1 ring-emerald-500/40'
                          : status === 'wrong'
                            ? 'border-rose-500 ring-1 ring-rose-500/40'
                            : isFocused
                              ? 'border-sky-400 ring-1 ring-sky-400/40'
                              : 'border-slate-700'
                      }`}
                    />
                    {status === 'correct' && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-400 ml-2 shrink-0"
                        aria-label="Correct line"
                      />
                    )}
                    {status === 'wrong' && (
                      <XCircle
                        className="w-4 h-4 text-rose-400 ml-2 shrink-0"
                        aria-label="Incorrect line"
                      />
                    )}
                    {hintText && (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedHints((prev) => ({
                            ...prev,
                            [lineIdx]: !prev[lineIdx],
                          }))
                        }
                        title="Toggle hint for this line"
                        className="ml-1.5 p-1 rounded text-slate-400 hover:text-sky-300 transition-colors shrink-0"
                      >
                        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                {hintText && revealedHints[lineIdx] && (
                  <div className="ml-8 text-[11px] font-sans text-sky-300 bg-sky-950/50 border border-sky-900/70 rounded px-2.5 py-1">
                    Hint (Line {lineIdx + 1}): {hintText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick-Snap Logic Snippet Bank */}
      {snippetBank.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Click to insert into Line {focusedLineIdx + 1}</span>
            <span>Watch for bug distractors</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {snippetBank.map((snippet, i) => {
              const used = Object.values(values).some((v) => v.trim() === snippet);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInsertSnippet(snippet)}
                  className={`px-2.5 py-1.5 rounded-md border font-mono text-[11px] text-left transition-colors ${
                    used
                      ? 'border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  {snippet}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleVerify}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Verify &amp; Unlock Optimal
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        {!isUnlocked && (
          <button
            type="button"
            onClick={() => {
              const filled: Record<number, string> = {};
              for (const idx of sortedBlanks) filled[idx] = lines[idx].trim();
              setValues(filled);
              setValidation({
                checked: true,
                results: Object.fromEntries(sortedBlanks.map((idx) => [idx, true])),
                allValid: true,
              });
              onUnlockOptimal();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors whitespace-nowrap shrink-0"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            Reveal Solution
          </button>
        )}
      </div>

      {/* Verification Status Feedback */}
      {validation?.checked && (
        <div
          className={`rounded-lg border px-3.5 py-2.5 text-xs flex items-center gap-2 font-medium ${
            validation.allValid
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
              : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
          }`}
        >
          {validation.allValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>All critical lines verified — Optimal synchronized code is now unlocked below.</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              <span>Some lines do not match the optimal invariant. Check highlighted lines or toggle a line hint.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
