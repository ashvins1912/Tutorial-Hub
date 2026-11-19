import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Compass,
  Eye,
  EyeOff,
  Lightbulb,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { BlankPageDrillSpec } from '../data/deepTopicBlueprints';

interface BlankPageProtocolWidgetProps {
  topicId: string;
  drill: BlankPageDrillSpec;
  coreInvariant: string;
  constraintSummary: string;
}

function scoreInvariantDraft(draft: string, golden: string): { matched: number; total: number } {
  const stopWords = new Set([
    'the',
    'and',
    'for',
    'that',
    'with',
    'from',
    'this',
    'into',
    'have',
    'been',
    'always',
    'never',
    'each',
    'when',
    'only',
    'must',
    'before',
    'after',
    'over',
    'under',
    'every',
  ]);
  const goldenTokens = Array.from(
    new Set(
      golden
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !stopWords.has(w)),
    ),
  );
  if (goldenTokens.length === 0) return { matched: 0, total: 0 };
  const normalizedDraft = draft.toLowerCase();
  const matched = goldenTokens.filter((tok) => normalizedDraft.includes(tok)).length;
  return { matched, total: Math.min(goldenTokens.length, 6) };
}

export function BlankPageProtocolWidget({
  topicId,
  drill,
  coreInvariant,
  constraintSummary,
}: BlankPageProtocolWidgetProps) {
  const [showBridge, setShowBridge] = useState(false);
  const [showBottleneck, setShowBottleneck] = useState(false);
  const [userInvariant, setUserInvariant] = useState('');
  const [comparedInvariant, setComparedInvariant] = useState(false);
  const [checkedCases, setCheckedCases] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setShowBridge(false);
    setShowBottleneck(false);
    setUserInvariant('');
    setComparedInvariant(false);
    setCheckedCases({});
  }, [topicId]);

  const toggleCase = (idx: number) => {
    setCheckedCases((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const checkedCount = Object.values(checkedCases).filter(Boolean).length;
  const score = comparedInvariant ? scoreInvariantDraft(userInvariant, coreInvariant) : null;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>5-MINUTE BLANK-PAGE PROTOCOL</span>
          </div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            How to Start When You Don&apos;t Know the Pattern Yet
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[65ch] leading-relaxed">
            Train problem initiation instead of template memorization. Walk through these 5 checkpoints on a blank sheet before touching code.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          {checkedCount}/{drill.adversarialCases.length} Edge Cases Verified
        </span>
      </div>

      {/* Step 1: Constraint Ceiling */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
        <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
          <span className="text-sky-700 dark:text-sky-400">STEP 01</span>
          <span aria-hidden="true">·</span>
          <span>LOCK COMPLEXITY CEILING</span>
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          {constraintSummary}
        </p>
      </div>

      {/* Step 2: Tiny N=4 Manual Dry-Run */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            <span className="text-sky-700 dark:text-sky-400">STEP 02</span>
            <span aria-hidden="true">·</span>
            <span>SOLVE TINY CASE BY HAND (N ≈ 4)</span>
          </div>
          <code className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
            {drill.tinyInput}
          </code>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-[65ch]">
          {drill.manualQuestion}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBridge((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
          >
            {showBridge ? (
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {showBridge ? 'Hide Memory Bridge' : 'Reveal Memory Bridge (i-1 → i)'}
          </button>
        </div>
        {showBridge && (
          <div className="rounded-md border border-sky-200 dark:border-sky-900/70 bg-sky-50/70 dark:bg-sky-950/30 p-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            <span className="font-mono font-semibold text-sky-800 dark:text-sky-300">
              Minimum State to Remember:{' '}
            </span>
            {drill.memoryBridge}
          </div>
        )}
      </div>

      {/* Step 3: Brute-Force Bottleneck Diagnosis */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            <span className="text-sky-700 dark:text-sky-400">STEP 03</span>
            <span aria-hidden="true">·</span>
            <span>DIAGNOSE THE BRUTE-FORCE REPEATED WORK</span>
          </div>
          <button
            type="button"
            onClick={() => setShowBottleneck((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline"
          >
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
            {showBottleneck ? 'Hide Diagnosis' : 'Reveal Bottleneck'}
          </button>
        </div>
        {showBottleneck ? (
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed max-w-[65ch]">
            {drill.bruteBottleneck}
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Ask yourself: &ldquo;Which exact comparison or subarray calculation does the naive loop redo over and over?&rdquo;
          </p>
        )}
      </div>

      {/* Step 4: Active Free-Text Invariant Recall */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
          <span className="text-sky-700 dark:text-sky-400">STEP 04</span>
          <span aria-hidden="true">·</span>
          <span>WRITE THE LOOP / STATE INVARIANT FROM MEMORY</span>
        </div>
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {drill.invariantPrompt}
        </p>
        <textarea
          value={userInvariant}
          onChange={(e) => {
            setUserInvariant(e.target.value);
            if (comparedInvariant) setComparedInvariant(false);
          }}
          rows={2}
          placeholder="Type your invariant in plain English before comparing (e.g., what stays strictly true at every step?)"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setComparedInvariant(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Compare Against Golden Invariant
          </button>
          {score && userInvariant.trim().length > 0 && (
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 tabular-nums">
              Concept Overlap: {Math.min(score.matched, score.total)}/{score.total} core keywords
            </span>
          )}
        </div>

        {comparedInvariant && (
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>GOLDEN INVARIANT</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              {coreInvariant}
            </p>
          </div>
        )}
      </div>

      {/* Step 5: 4-Card Adversarial Edge-Case Attack */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span className="text-sky-700 dark:text-sky-400">STEP 05</span>
          <span aria-hidden="true">·</span>
          <span>ADVERSARIAL EDGE-CASE ATTACK CHECKLIST</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {drill.adversarialCases.map((item, idx) => {
            const done = !!checkedCases[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleCase(idx)}
                className={`text-left rounded-lg border p-3 transition-colors space-y-1 ${
                  done
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/25'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.label}
                  </span>
                  {done ? (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400 break-all">
                  Input: {item.input}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.trap}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
