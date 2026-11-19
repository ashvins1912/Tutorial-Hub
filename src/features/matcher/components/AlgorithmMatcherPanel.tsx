import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Code2,
  Cpu,
  Network,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  analyzeProblemForAlgorithms,
  MatcherConstraintOverrides,
  ScaleTier,
} from '../../../utils/algorithmMatcherEngine';
import { usePatternForgeStore } from '../../../store/usePatternForgeStore';
import { PROBLEMS } from '../../../data/problems';
import { CurriculumTopic } from '../../topics/types';

interface AlgorithmMatcherPanelProps {
  mode: 'embedded' | 'modal';
  activeTopic?: CurriculumTopic;
  onNavigateDone?: () => void;
  onSelectTopic?: (topicId: string) => void;
}

const SAMPLE_PROMPTS: { label: string; text: string }[] = [
  {
    label: 'Subarray Sum + Negatives',
    text: 'Given an integer array nums (N <= 10^5, elements can be negative) and an integer k, return the total number of contiguous subarrays whose sum equals k in O(N) time.',
  },
  {
    label: 'Dynamic Range Min + Updates',
    text: 'Given an array of N = 10^5 integers, process 10^5 online queries supporting both dynamic range updates (add val to [L..R]) and range minimum queries in O(log N) time.',
  },
  {
    label: '10M Typo-Tolerant Search',
    text: 'Design an in-memory autocomplete search module over 10 million product titles (N = 10^7, L <= 60) with < 20 ms P99 latency. Handle single-character typos, transpositions, and missing spaces. Return top k product_ids ranked by Jaccard similarity >= threshold.',
  },
  {
    label: 'Minimize Max Capacity',
    text: 'Given N <= 10^5 package weights in order and D days, find the minimum capacity ship needed to deliver all packages within D days. Minimize the maximum load per day.',
  },
  {
    label: 'Tree Path Queries (HLD)',
    text: 'Given a tree with N = 10^5 nodes, support dynamic update node weights and answer maximum value queries along the tree path between two nodes u and v.',
  },
  {
    label: 'Visit All Nodes (N <= 18)',
    text: 'Given a weighted graph with N <= 18 cities, find the minimum cost traveling salesman tour to visit all nodes starting from city 0.',
  },
];

const SCALE_OPTIONS: { id: 'auto' | ScaleTier; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'small', label: 'N ≤ 20' },
  { id: 'medium', label: 'N ≤ 5×10³' },
  { id: 'large', label: 'N ≤ 10⁵' },
  { id: 'huge', label: 'N ≥ 10⁷' },
];

export function AlgorithmMatcherPanel({
  mode,
  activeTopic,
  onNavigateDone,
  onSelectTopic,
}: AlgorithmMatcherPanelProps) {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const openArchitecture = usePatternForgeStore((s) => s.openArchitecture);
  const openNGramAlgorithm = usePatternForgeStore((s) => s.openNGramAlgorithm);

  const [promptInput, setPromptInput] = useState(SAMPLE_PROMPTS[0].text);
  const [scaleOverride, setScaleOverride] = useState<'auto' | ScaleTier>('auto');
  const [requireO1Space, setRequireO1Space] = useState(false);
  const [hasNegativeValues, setHasNegativeValues] = useState(false);
  const [isOnlineDynamic, setIsOnlineDynamic] = useState(false);

  const activeLabProblem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];

  const overrides: MatcherConstraintOverrides = useMemo(
    () => ({
      scaleOverride,
      requireO1Space,
      hasNegativeValues,
      isOnlineDynamic,
    }),
    [scaleOverride, requireO1Space, hasNegativeValues, isOnlineDynamic]
  );

  const analysis = useMemo(
    () => analyzeProblemForAlgorithms(promptInput, overrides),
    [promptInput, overrides]
  );

  const handleLoadContextProblem = () => {
    if (activeTopic) {
      const firstProb = activeTopic.problemLadder[0];
      const clues = activeTopic.patternClues
        .map((c) => `${c.signal} (${c.constraintHint})`)
        .join('. ');
      setPromptInput(
        `${activeTopic.title}${firstProb ? ` — ${firstProb.title}` : ''}: ${clues}. Target complexity: ${activeTopic.solutions.optimal.timeComplexity}.`
      );
      return;
    }
    const fullText = activeLabProblem.statementSegments.map((s) => s.text).join('');
    setPromptInput(
      `${activeLabProblem.title}: ${fullText} Constraints: N <= 10^${activeLabProblem.inputSizeExponent}.`
    );
  };

  const handleResetOverrides = () => {
    setScaleOverride('auto');
    setRequireO1Space(false);
    setHasNegativeValues(false);
    setIsOnlineDynamic(false);
  };

  const hasManualOverride =
    scaleOverride !== 'auto' || requireO1Space || hasNegativeValues || isOnlineDynamic;

  const isWideSplit = mode === 'modal';

  return (
    <div
      className={
        isWideSplit
          ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-5'
          : 'space-y-5'
      }
    >
      {/* Input, Presets, Constraint Simulator & Verdict */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor={`matcher-prompt-${mode}`}
              className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300"
            >
              Problem Description & Constraints
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLoadContextProblem}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                {activeTopic
                  ? `Load Topic (${activeTopic.shortTitle})`
                  : `Load Lab #${activeLabProblem.number}`}
              </button>
              {promptInput.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setPromptInput('')}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            id={`matcher-prompt-${mode}`}
            rows={isWideSplit ? 5 : 4}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Paste a problem description with constraints (e.g. N <= 10^5, negative values, O(log N), range updates, typos, top k)..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />

          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROMPTS.map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => {
                  setPromptInput(sp.text);
                  handleResetOverrides();
                }}
                className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 transition-colors whitespace-nowrap"
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Constraint Overrides */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Constraint Simulator
            </span>
            {hasManualOverride && (
              <button
                type="button"
                onClick={handleResetOverrides}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {SCALE_OPTIONS.map((opt) => {
              const active = scaleOverride === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setScaleOverride(opt.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors whitespace-nowrap tabular-nums ${
                    active
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                label: 'O(1) Space',
                active: requireO1Space,
                toggle: () => setRequireO1Space((v) => !v),
              },
              {
                label: 'Negative Values',
                active: hasNegativeValues,
                toggle: () => setHasNegativeValues((v) => !v),
              },
              {
                label: 'Online Updates',
                active: isOnlineDynamic,
                toggle: () => setIsOnlineDynamic((v) => !v),
              },
            ].map((flag) => (
              <button
                key={flag.label}
                type="button"
                aria-pressed={flag.active}
                onClick={flag.toggle}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  flag.active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {flag.active ? '✓ ' : '+ '}
                {flag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity Ceiling Verdict */}
        <div className="rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/25 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-mono font-bold text-sky-900 dark:text-sky-300">
            <Cpu className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{analysis.complexityVerdict.scaleLabel}</span>
          </div>
          <div className="font-mono text-slate-800 dark:text-slate-200">
            Target Ceiling:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400">
              {analysis.complexityVerdict.maxAllowedComplexity}
            </strong>
          </div>
          <div className="font-mono text-rose-700 dark:text-rose-400">
            Eliminated: {analysis.complexityVerdict.eliminatedComplexities.join(' · ')}
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {analysis.complexityVerdict.rationale}
          </p>
        </div>

        {/* Extracted Constraint Signals */}
        {analysis.detectedConstraints.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
              Extracted Complexity & Structural Signals ({analysis.detectedConstraints.length})
            </div>
            <div className="space-y-2">
              {analysis.detectedConstraints.map((c) => (
                <div key={c.label} className="text-xs space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {c.label}{' '}
                    <span className="font-mono font-normal text-sky-700 dark:text-sky-400">
                      · {c.matchedText}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-snug">
                    {c.implication}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ranked Pattern & Algorithm Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            Matched DSA Patterns & Algorithms ({analysis.recommendations.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Ranked by clue + scale fit
          </span>
        </div>

        <div className="space-y-3">
          {analysis.recommendations.map((rec, idx) => (
            <div
              key={rec.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    #{idx + 1} · {rec.category} · Time {rec.timeComplexity} · Space {rec.spaceComplexity}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {rec.name}
                  </div>
                </div>
                <span
                  className={`text-xs font-mono font-bold shrink-0 tabular-nums ${
                    rec.cautionNote
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {rec.confidence}% fit
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {rec.whyItFits}
              </p>

              {rec.cautionNote && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span>{rec.cautionNote}</span>
                </div>
              )}

              <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                Signals: {rec.matchedSignals.join(' · ')}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {rec.targetDestination === 'algorithms' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        openAlgorithm(rec.targetAlgoId, 'mental');
                        onNavigateDone?.();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                    >
                      Algorithms Studio
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openAlgorithm(rec.targetAlgoId, 'code');
                        onNavigateDone?.();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-400 transition-colors whitespace-nowrap"
                    >
                      <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openAlgorithm(rec.targetAlgoId, 'practice');
                        onNavigateDone?.();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-400 transition-colors whitespace-nowrap"
                    >
                      Practice
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        openNGramAlgorithm(rec.targetAlgoId, 'taxonomy');
                        onNavigateDone?.();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                    >
                      N-Gram Studio
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openNGramAlgorithm(rec.targetAlgoId, 'pruning-sim');
                        onNavigateDone?.();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 transition-colors whitespace-nowrap"
                    >
                      Pruning Sim
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}

                {rec.hasArchitectureView && (
                  <button
                    type="button"
                    onClick={() => {
                      openArchitecture(rec.hasArchitectureView!);
                      onNavigateDone?.();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 transition-colors whitespace-nowrap"
                  >
                    <Network className="w-3.5 h-3.5" aria-hidden="true" />
                    Architecture
                  </button>
                )}

                {rec.curriculumTopicId && onSelectTopic && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTopic(rec.curriculumTopicId!);
                      onNavigateDone?.();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-sky-400 transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    Curriculum
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
