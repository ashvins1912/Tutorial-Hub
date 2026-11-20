import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  GitBranch,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  ComplexityOrder,
  EngineAnalysisResult,
} from '../../core/knowledge-base/types';
import type { UniversalCatalogMatchBundle } from '../../core/engine/catalogStrategyBridge';
import {
  type ComplexityChoice,
  evaluateOptimization,
} from '../../core/engine/optimizationChecker';
import type { AlgorithmDetailTab } from '../../store/usePatternForgeStore';

export interface OptimizationCheckerPanelProps {
  problemTitle: string;
  analysis: EngineAnalysisResult;
  catalogMatches: UniversalCatalogMatchBundle;
  onOpenAlgorithm?: (algoId: string, tab?: AlgorithmDetailTab) => void;
  onJumpToOptimalCode?: () => void;
  compact?: boolean;
}

const APPROACH_PRESETS: Array<{ label: string; text: string; complexity: ComplexityChoice }> = [
  {
    label: 'Nested Loop Brute Force',
    text: 'Use two nested for loops to check every pair (i, j) and compute the best answer.',
    complexity: 'O(N^2)',
  },
  {
    label: 'Sort + Scan / Binary Search',
    text: 'Sort the array first in O(N log N), then run binary search or a single scan over sorted elements.',
    complexity: 'O(N log N)',
  },
  {
    label: 'Unmemoized Recursion / DFS',
    text: 'Recursively branch on every choice (take or skip) to explore all subsets and combinations.',
    complexity: 'O(2^N)',
  },
  {
    label: 'HashMap / Two Pointers',
    text: 'Single pass with a HashMap or sliding window / two pointers to track state in O(1) per element.',
    complexity: 'O(N)',
  },
];

const COMPLEXITY_OPTIONS: ComplexityChoice[] = [
  'auto',
  'O(1)',
  'O(log N)',
  'O(N)',
  'O(N log N)',
  'O(N^2)',
  'O(2^N)',
  'O(N!)',
];

export const OptimizationCheckerPanel: React.FC<OptimizationCheckerPanelProps> = ({
  problemTitle,
  analysis,
  catalogMatches,
  onOpenAlgorithm,
  onJumpToOptimalCode,
  compact = false,
}) => {
  const [approachDraft, setApproachDraft] = useState<string>(
    'Use nested for loops to check every pair or subarray and track the best result.'
  );
  const [claimedComplexity, setClaimedComplexity] = useState<ComplexityChoice>('auto');

  const report = useMemo(
    () =>
      evaluateOptimization({
        userApproachText: approachDraft,
        claimedComplexity,
        analysis,
        catalogMatches,
      }),
    [approachDraft, claimedComplexity, analysis, catalogMatches]
  );

  const verdictStyles = useMemo(() => {
    if (report.verdict === 'optimal') {
      return {
        box: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/35',
        accent: 'text-emerald-800 dark:text-emerald-300',
        Icon: CheckCircle2,
      };
    }
    if (report.verdict === 'improvable') {
      return {
        box: 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/35',
        accent: 'text-amber-800 dark:text-amber-300',
        Icon: AlertTriangle,
      };
    }
    return {
      box: 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/35',
      accent: 'text-rose-800 dark:text-rose-300',
      Icon: ShieldAlert,
    };
  }, [report.verdict]);

  const VerdictIcon = verdictStyles.Icon;

  return (
    <section
      aria-label="Algorithmic Optimization Checker"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
            <Gauge className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              Optimization Checker · Comparing Against 94-Algorithm Benchmarks · {problemTitle}
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Compare Your Current Approach Against Optimal Complexity Patterns
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label
            htmlFor={`opt-complexity-${compact ? 'compact' : 'full'}`}
            className="text-[11px] font-medium text-slate-500 dark:text-slate-400"
          >
            Claimed Big-O:
          </label>
          <select
            id={`opt-complexity-${compact ? 'compact' : 'full'}`}
            value={claimedComplexity}
            onChange={(e) => setClaimedComplexity(e.target.value as ComplexityChoice)}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
          >
            {COMPLEXITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'auto' ? 'Auto-Detect' : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User Approach Input + Quick Presets */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Test an approach:</span>
          {APPROACH_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setApproachDraft(preset.text);
                setClaimedComplexity('auto');
              }}
              className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <textarea
          rows={compact ? 2 : 3}
          value={approachDraft}
          onChange={(e) => setApproachDraft(e.target.value)}
          placeholder="Describe your current idea or paste pseudocode/code (e.g., 'Sort array then two pointers', 'for i in range(n): if x in arr:', 'DFS without memo')..."
          aria-label="Describe or paste your current approach for optimization checking"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Dual-Coded Verdict Banner */}
      <div className={`rounded-lg border p-3.5 space-y-2 ${verdictStyles.box}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className={`flex items-center gap-2 text-xs font-bold ${verdictStyles.accent}`}>
            <VerdictIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{report.verdictLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-200">
            <span>
              Yours: <strong>{report.userTimeComplexity}</strong> ({report.userSpaceComplexity})
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span>
              Optimal: <strong className="text-emerald-700 dark:text-emerald-400">{report.optimalTimeComplexity}</strong> ({report.optimalSpaceComplexity})
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
          {report.verdictSummary}
        </p>

        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
          Detected Pattern: {report.detectedApproachLabel} · Problem Ceiling: {report.constraintCeiling}
          {report.complexityGapSteps > 0
            ? ` · Gap: ${report.complexityGapSteps} Big-O tier${report.complexityGapSteps > 1 ? 's' : ''}`
            : ' · On Target'}
        </div>
      </div>

      {/* 6-Tier Complexity Spectrum Visualizer */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>Complexity Spectrum (Left = Faster · Right = Slower)</span>
          <span>Ceiling: {report.constraintCeiling}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {report.complexityLadder.map((tier) => {
            const tileTone =
              tier.isUser && tier.isOptimal
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                : tier.isUser && tier.isUnsafe
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                  : tier.isUser
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                    : tier.isOptimal
                      ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100'
                      : tier.isUnsafe
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 text-slate-400 dark:text-slate-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400';

            return (
              <div
                key={tier.order}
                className={`rounded-lg border px-2 py-2 text-center space-y-1 ${tileTone}`}
              >
                <div className="text-xs font-mono font-bold tabular-nums">{tier.order}</div>
                <div className="text-[10px] truncate">{tier.label}</div>
                <div className="text-[10px] font-semibold min-h-[14px]">
                  {tier.isUser && tier.isOptimal
                    ? 'You · Optimal'
                    : tier.isUser
                      ? tier.isUnsafe
                        ? 'You (TLE)'
                        : 'Your Draft'
                      : tier.isOptimal
                        ? 'Optimal'
                        : tier.isCeiling
                          ? 'Max Ceiling'
                          : tier.isUnsafe
                            ? 'Too Slow'
                            : 'Safe'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detected Bottlenecks */}
      {report.detectedBottlenecks.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>Detected Bottlenecks &amp; Hidden Traps</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            {report.detectedBottlenecks.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold">›</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concrete Algorithmic Refinement Suggestions */}
      {report.refinementSuggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>
                {report.verdict === 'optimal'
                  ? 'Verified Optimal Blueprint & Synergy Upgrades'
                  : 'Recommended Algorithmic Refinements'}
              </span>
            </div>
            {onJumpToOptimalCode && (
              <button
                type="button"
                onClick={onJumpToOptimalCode}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <Zap className="w-3 h-3" aria-hidden="true" />
                <span>Inspect Optimal Code</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {report.refinementSuggestions.map((ref) => (
              <div
                key={ref.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      {ref.isPowerCombo
                        ? 'Synergy Combo'
                        : ref.masterNumber
                          ? `Master #${String(ref.masterNumber).padStart(2, '0')}`
                          : 'Optimal Pattern'}
                    </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {ref.fromComplexity} → {ref.toComplexity}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {ref.isPowerCombo && (
                      <GitBranch className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
                    )}
                    <span>{ref.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ref.whyFaster}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Invariant shift: {ref.keyInvariantShift}
                  </p>
                </div>

                {ref.algorithmId && onOpenAlgorithm && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => onOpenAlgorithm(ref.algorithmId!, 'upgrade-trace')}
                      className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-400 hover:underline"
                    >
                      <span>View Upgrade DFD</span>
                      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <button
                      type="button"
                      onClick={() => onOpenAlgorithm(ref.algorithmId!, 'mental')}
                      className="text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      Animate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
