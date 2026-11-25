import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Table2,
} from 'lucide-react';
import type {
  CurriculumTopic,
  SolutionTierKey,
  SupportedLanguage,
} from '../../topics/types';
import { CopyButton } from '../../../components/ui';
import { findLineByLinePatternForTopicId } from '../../../data/dsaLineByLineMasteryData';

interface BruteToOptimalCodeViewerProps {
  topic: CurriculumTopic;
  initialTier?: SolutionTierKey;
}

const TIER_TABS: { id: SolutionTierKey; label: string }[] = [
  { id: 'brute', label: '1. Brute Force' },
  { id: 'better', label: '2. Better' },
  { id: 'optimal', label: '3. Optimal' },
];

const LANG_TABS: { id: SupportedLanguage; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
];

export function BruteToOptimalCodeViewer({
  topic,
  initialTier = 'optimal',
}: BruteToOptimalCodeViewerProps) {
  const [tier, setTier] = useState<SolutionTierKey>(initialTier);
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [selectedLineIdx, setSelectedLineIdx] = useState<number>(0);
  const [codeViewMode, setCodeViewMode] = useState<'focus' | 'ledger'>('focus');
  const [showProof, setShowProof] = useState<boolean>(false);

  const linkedBlueprint = useMemo(
    () => findLineByLinePatternForTopicId(topic.id),
    [topic.id]
  );

  useEffect(() => {
    setTier(initialTier);
    setSelectedLineIdx(0);
    setShowProof(false);
  }, [topic.id, initialTier]);

  const spec = topic.solutions[tier];
  const lines = spec.code[language];
  const safeLineIdx = Math.min(selectedLineIdx, Math.max(0, lines.length - 1));
  const activeLine = lines[safeLineIdx];

  const stepLine = (delta: number) => {
    setSelectedLineIdx((prev) => Math.max(0, Math.min(lines.length - 1, prev + delta)));
  };

  return (
    <div className="space-y-4">
      {/* Tier + Language Switcher Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
          {TIER_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTier(t.id);
                setSelectedLineIdx(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                tier === t.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setCodeViewMode('focus')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                codeViewMode === 'focus'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Stepper</span>
            </button>
            <button
              type="button"
              onClick={() => setCodeViewMode('ledger')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                codeViewMode === 'ledger'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table2 className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Line Ledger</span>
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
            {LANG_TABS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLanguage(l.id);
                  setSelectedLineIdx(0);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
                  language === l.id
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <CopyButton
            text={() => lines.map((l) => l.code).join('\n')}
            label="Copy"
            copiedLabel="Copied"
            ariaLabel="Copy code"
            size="sm"
          />
        </div>
      </div>

      {/* Tier Intuition & Complexity Summary */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            {spec.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
            <span className="text-sky-700 dark:text-sky-400 font-semibold">
              Time: {spec.timeComplexity}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              Space: {spec.spaceComplexity}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {spec.intuition}
        </p>

        <div
          className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${
            tier === 'brute'
              ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
              : tier === 'better'
                ? 'border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                : 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <strong className="font-semibold">
            {tier === 'brute'
              ? 'Why Brute Fails: '
              : tier === 'better'
                ? 'Bottleneck Remaining: '
                : 'Why Optimal Wins: '}
          </strong>
          {spec.bottleneckOrUpgrade}
        </div>
      </div>

      {/* Interactive Line-by-Line Focus Stepper OR Complete Line Ledger */}
      {codeViewMode === 'focus' ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>Click any line or step line-by-line to inspect its exact role</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => stepLine(-1)}
                disabled={safeLineIdx === 0}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-35 whitespace-nowrap shrink-0"
                aria-label="Previous line"
              >
                <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                <span>Prev</span>
              </button>
              <span className="tabular-nums">
                {safeLineIdx + 1}/{lines.length}
              </span>
              <button
                type="button"
                onClick={() => stepLine(1)}
                disabled={safeLineIdx >= lines.length - 1}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-35 whitespace-nowrap shrink-0"
                aria-label="Next line"
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="py-2.5 overflow-x-auto font-mono text-xs leading-6">
            {lines.map((item, idx) => {
              const isSelected = idx === safeLineIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedLineIdx(idx)}
                  className={`w-full text-left px-3.5 flex items-baseline gap-3 transition-colors ${
                    isSelected
                      ? 'bg-sky-500/25 text-sky-100 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="w-5 text-right text-slate-500 select-none shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre flex-1">{item.code}</span>
                </button>
              );
            })}
          </div>

          {/* Active Line Annotation Deck */}
          {activeLine && (
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/95 text-xs text-sky-100 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-sky-400 tabular-nums">
                  Line {safeLineIdx + 1} of {lines.length} · Explanation
                </span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[60%]">
                  {activeLine.code.trim() || 'blank separator'}
                </span>
              </div>
              <p className="leading-relaxed text-slate-200">{activeLine.annotation}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-2 pl-3 pr-2 w-8 font-mono">#</th>
                  <th className="py-2 px-3 w-[48%]">Code Line</th>
                  <th className="py-2 px-3">Why This Line Exists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {lines.map((item, idx) => (
                  <tr key={idx} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2 pl-3 pr-2 font-mono tabular-nums text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] bg-slate-950 text-slate-100 whitespace-pre">
                      {item.code || ' '}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.annotation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collapsible Karumanchi Textbook Proof & Core Invariant */}
      {linkedBlueprint && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowProof((v) => !v)}
            aria-expanded={showProof}
            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                Karumanchi Textbook Proof · {linkedBlueprint.karumanchiChapter}
              </span>
            </div>
            {showProof ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            )}
          </button>
          {showProof && (
            <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs leading-relaxed">
              <p className="text-slate-700 dark:text-slate-300">
                <strong className="font-semibold text-slate-900 dark:text-slate-100">
                  Mathematical Proof:{' '}
                </strong>
                {linkedBlueprint.karumanchiFoundation}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong className="font-semibold text-indigo-700 dark:text-indigo-400">
                  Core Invariant:{' '}
                </strong>
                {linkedBlueprint.coreInvariant}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edge-Case Checklist */}
      {spec.edgeCases.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            Interview Edge-Case Checklist
          </div>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
            {spec.edgeCases.map((edge, idx) => (
              <li key={idx}>{edge}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

