import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  GitCommitHorizontal,
  Layers,
} from 'lucide-react';
import type {
  DeepTopicContent,
  LinkedCodingProblem,
} from '../../../core/schema/deepTopic.types';

interface MutationLadderVisualizerProps {
  topicId: string;
  deepTopic: DeepTopicContent;
  onPracticeProblem?: (problemId: string) => void;
  onOpenProblemTrainer?: (slug: string) => void;
}

const STORAGE_KEY = 'patternforge_solved_mutations_v1';

function readSolvedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Extracts a concise edge mutation label like "+ Circular Wrap" or "+ Negatives" from mutation text */
function summarizeEdgeConstraint(problem: LinkedCodingProblem, index: number): string {
  if (index === 0) return 'Base Invariant';
  const raw = problem.mutationFromPrevious
    .replace(/^Mutation\s*\d+\s*·\s*/i, '')
    .replace(/^Twist\s*\d+\s*·\s*/i, '')
    .trim();
  const short = raw.split(/[(.—–]/)[0].trim();
  if (short.length <= 28) return `+ ${short}`;
  return `+ ${short.slice(0, 26).trim()}…`;
}

const DIFF_COLOR: Record<LinkedCodingProblem['difficulty'], string> = {
  Easy: 'text-emerald-700 dark:text-emerald-400',
  Medium: 'text-amber-700 dark:text-amber-400',
  Hard: 'text-rose-700 dark:text-rose-400',
  System: 'text-indigo-700 dark:text-indigo-400',
};

export function MutationLadderVisualizer({
  topicId,
  deepTopic,
  onPracticeProblem,
  onOpenProblemTrainer,
}: MutationLadderVisualizerProps) {
  const ladder = deepTopic.problemMutationLadder;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [solvedIds, setSolvedIds] = useState<string[]>(() => readSolvedIds());

  useEffect(() => {
    setSelectedIdx(0);
    setSolvedIds(readSolvedIds());
  }, [topicId]);

  if (!ladder || ladder.length === 0) return null;

  const activeProblem = ladder[selectedIdx] ?? ladder[0];
  const previousProblem = selectedIdx > 0 ? ladder[selectedIdx - 1] : null;
  const stageLabel = (idx: number) =>
    idx === 0 ? 'Base Problem' : idx === ladder.length - 1 && ladder[idx].difficulty === 'System' ? 'System Scale' : `Twist ${idx}`;

  return (
    <section
      aria-label="Problem Mutation Ladder Graph"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            <GitCommitHorizontal className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Mutation Ladder Graph</span>
          </div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            How Constraint Twists Evolve One Problem Into Another
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[65ch] leading-relaxed">
            Click any node in the progression graph below to inspect how a single constraint change mutates the base pattern into harder interview variations.
          </p>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={selectedIdx === 0}
            onClick={() => setSelectedIdx((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:border-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Prev Twist
          </button>
          <button
            type="button"
            disabled={selectedIdx >= ladder.length - 1}
            onClick={() => setSelectedIdx((i) => Math.min(ladder.length - 1, i + 1))}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            Next Twist
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Interactive Clickable Directed Mutation Graph */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 overflow-x-auto">
        <div className="flex items-stretch min-w-max gap-0">
          {ladder.map((prob, idx) => {
            const isSelected = idx === selectedIdx;
            const isPriorPath = idx < selectedIdx;
            const isSolved = solvedIds.includes(prob.problemId);
            const edgeConstraint = summarizeEdgeConstraint(prob, idx);

            return (
              <div key={prob.problemId} className="flex items-center">
                {/* Directional Constraint Edge Connector (between nodes) */}
                {idx > 0 && (
                  <div className="flex flex-col items-center justify-center px-2 w-36 shrink-0">
                    <span
                      title={prob.mutationFromPrevious}
                      className={`text-[10px] font-mono text-center leading-tight mb-1.5 line-clamp-2 ${
                        idx <= selectedIdx
                          ? 'text-sky-800 dark:text-sky-300 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {edgeConstraint}
                    </span>
                    <svg
                      viewBox="0 0 112 16"
                      className="w-28 h-4 overflow-visible"
                      aria-hidden="true"
                    >
                      <line
                        x1="2"
                        y1="8"
                        x2="100"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth={idx <= selectedIdx ? '2.5' : '1.75'}
                        strokeDasharray={idx <= selectedIdx ? undefined : '4 3'}
                        className={
                          idx <= selectedIdx
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }
                      />
                      <polygon
                        points="98,3 110,8 98,13"
                        fill="currentColor"
                        className={
                          idx <= selectedIdx
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }
                      />
                    </svg>
                  </div>
                )}

                {/* Clickable Problem Node */}
                <button
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  aria-pressed={isSelected}
                  className={`w-48 text-left rounded-xl border p-3.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0 ${
                    isSelected
                      ? 'border-sky-500 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-sky-500/20'
                      : isPriorPath
                        ? 'border-sky-300/80 dark:border-sky-800 bg-white/80 dark:bg-slate-900/70 hover:border-sky-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span
                      className={
                        isSelected
                          ? 'font-bold text-sky-700 dark:text-sky-400'
                          : 'font-semibold text-slate-500 dark:text-slate-400'
                      }
                    >
                      {stageLabel(idx)}
                    </span>
                    {isSolved ? (
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                        aria-label="Solved"
                      />
                    ) : (
                      <span className={`font-semibold ${DIFF_COLOR[prob.difficulty]}`}>
                        {prob.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 min-h-[2rem]">
                    {prob.title}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    <span className="truncate">{prob.solutions.optimal.complexity.split('·')[0].trim()}</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Mutation Detail Inspector */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="font-bold text-sky-700 dark:text-sky-400">
                {stageLabel(selectedIdx)}
              </span>
              <span aria-hidden="true">·</span>
              <span className={`font-semibold ${DIFF_COLOR[activeProblem.difficulty]}`}>
                {activeProblem.difficulty}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{activeProblem.solutions.optimal.complexity}</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans">{activeProblem.companyTags.join(', ')}</span>
            </div>
            <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
              {activeProblem.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onPracticeProblem && (
              <button
                type="button"
                onClick={() => onPracticeProblem(activeProblem.problemId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap shrink-0"
              >
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                Practice Recall
              </button>
            )}
            {activeProblem.trainerSlug && onOpenProblemTrainer && (
              <button
                type="button"
                onClick={() => onOpenProblemTrainer(activeProblem.trainerSlug!)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
              >
                Open Problem Lab
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Constraint Mutation Delta & Invariant Adaptation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {previousProblem
                  ? `Mutation From "${previousProblem.title}"`
                  : 'Baseline Problem Setup'}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeProblem.mutationFromPrevious}
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              Scale: {activeProblem.blankPageSteps.step1_constraintHint}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3 space-y-1">
            <div className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              How the Core Invariant Adapts
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeProblem.blankPageSteps.step4_optimalInvariant}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Eliminates: {activeProblem.blankPageSteps.step3_bruteForceBottleneck}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
