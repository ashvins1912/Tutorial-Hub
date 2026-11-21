import { useEffect, useState } from 'react';
import type {
  CurriculumTopic,
  SolutionTierKey,
  SupportedLanguage,
} from '../../topics/types';
import { CopyButton } from '../../../components/ui';

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

  useEffect(() => {
    setTier(initialTier);
    setSelectedLineIdx(0);
  }, [topic.id, initialTier]);

  const spec = topic.solutions[tier];
  const lines = spec.code[language];
  const activeLine = lines[Math.min(selectedLineIdx, Math.max(0, lines.length - 1))];

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

        <div className="flex items-center gap-2">
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

      {/* Interactive Line-by-Line Annotated Code Block */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="py-2.5 overflow-x-auto font-mono text-xs leading-6">
          {lines.map((item, idx) => {
            const isSelected = idx === selectedLineIdx;
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

        {/* Active Line Annotation Bar */}
        {activeLine && (
          <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/90 text-xs text-sky-200 flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-sky-400 tabular-nums shrink-0">
              Line {selectedLineIdx + 1}:
            </span>
            <span>{activeLine.annotation}</span>
          </div>
        )}
      </div>

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
