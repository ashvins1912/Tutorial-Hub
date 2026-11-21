import { useEffect, useMemo, useState } from 'react';
import type { CurriculumTopic, VisualizerFrame } from '../../topics/types';
import { generateVisualizerFrames } from '../engine/stepGenerator';
import { ComplexityDepthToggle } from './ComplexityDepthToggle';
import { getTopicComplexityProfile } from '../data/complexityComparisonData';
import { PlaybackControlBar } from '../../../components/ui';
import { withMemoizedVisualizer } from '../../../components/hoc';

interface AlgorithmVisualizerProps {
  topic: CurriculumTopic;
}

const SPEED_OPTIONS = [
  { label: '0.5×', ms: 2000 },
  { label: '1×', ms: 1200 },
  { label: '2×', ms: 600 },
] as const;

function AlgorithmVisualizerBase({ topic }: AlgorithmVisualizerProps) {
  const frames = useMemo(() => generateVisualizerFrames(topic), [topic]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);

  // Reset playback whenever user switches topic
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [topic.id]);

  const totalSteps = frames.length;
  const safeIdx = Math.min(stepIdx, Math.max(0, totalSteps - 1));
  const frame: VisualizerFrame = frames[safeIdx] ?? frames[0];
  const complexityProfile = useMemo(() => getTopicComplexityProfile(topic.id), [topic.id]);
  const liveRecursiveDepth =
    frame.stackItems && frame.stackItems.length > 0
      ? frame.stackItems.length
      : Math.max(1, safeIdx + 1);

  useEffect(() => {
    if (!isPlaying) return;
    if (safeIdx >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIdx((prev) => Math.min(prev + 1, totalSteps - 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, safeIdx, totalSteps, speedMs]);

  return (
    <div className="space-y-4">
      {/* Visualizer Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {topic.visualizer.presetLabel}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Input: {topic.visualizer.inputSummary}
          </div>
        </div>
        <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 tabular-nums">
          Step {safeIdx + 1} / {totalSteps}
        </div>
      </div>

      {/* Time Complexity Toggle: Current Recursive Depth vs. Iterative Alternative */}
      <ComplexityDepthToggle
        profile={complexityProfile}
        currentDepth={liveRecursiveDepth}
        currentStep={safeIdx + 1}
        totalSteps={totalSteps}
        defaultOpen
      />

      {/* Visual State Canvas */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-4">
        {/* Step Title & Explanation */}
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {frame.title}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {frame.explanation}
          </p>
        </div>

        {/* 1. Array / Pointer / Sliding Window Stage */}
        {frame.arrayValues && (
          <div className="space-y-2 overflow-x-auto pb-1">
            <div className="flex items-end gap-2 min-w-max pt-5 pb-1">
              {frame.arrayValues.map((val, idx) => {
                const inWindow =
                  frame.windowRange &&
                  idx >= frame.windowRange[0] &&
                  idx <= frame.windowRange[1];
                const isHighlighted = frame.highlightIndices?.includes(idx);
                const ptrNames = Object.entries(frame.pointers ?? {})
                  .filter(([, pIdx]) => pIdx === idx)
                  .map(([name]) => name);

                return (
                  <div key={idx} className="flex flex-col items-center gap-1 relative">
                    {ptrNames.length > 0 && (
                      <div className="absolute -top-5 text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 whitespace-nowrap">
                        {ptrNames.join('/')}
                      </div>
                    )}
                    <div
                      className={`min-w-[44px] px-2.5 h-11 rounded-lg border flex items-center justify-center font-mono text-xs font-bold tabular-nums transition-colors ${
                        isHighlighted
                          ? 'border-sky-600 bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950'
                          : inWindow
                            ? 'border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      [{idx}]
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Hash Map State */}
        {frame.mapEntries && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
              Hash Map State ({frame.mapEntries.length} entries)
            </div>
            {frame.mapEntries.length === 0 ? (
              <div className="text-xs font-mono text-slate-400">{'{ empty }'}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {frame.mapEntries.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs flex items-center justify-between gap-2 tabular-nums ${
                      entry.highlight
                        ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{entry.key}</span>
                    <span className="text-slate-500 dark:text-slate-400">→ {entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Stack / Deque / Call Stack State */}
        {frame.stackItems && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
              Active Stack / Frontier ({frame.stackItems.length})
            </div>
            {frame.stackItems.length === 0 ? (
              <div className="text-xs font-mono text-slate-400">[ empty ]</div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {frame.stackItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. 2D Dynamic Programming Matrix */}
        {frame.dpGrid && (
          <div className="overflow-x-auto">
            <table className="border-collapse font-mono text-xs tabular-nums">
              <thead>
                <tr>
                  <th className="w-10 h-9 text-slate-400" />
                  {frame.dpGrid.colLabels.map((c, j) => (
                    <th key={j} className="w-10 h-9 text-center text-sky-700 dark:text-sky-400 font-bold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frame.dpGrid.cells.map((row, i) => (
                  <tr key={i}>
                    <th className="w-10 h-9 text-center text-sky-700 dark:text-sky-400 font-bold">
                      {frame.dpGrid!.rowLabels[i]}
                    </th>
                    {row.map((cell, j) => {
                      const isActive =
                        frame.dpGrid!.activeCell?.[0] === i &&
                        frame.dpGrid!.activeCell?.[1] === j;
                      return (
                        <td
                          key={j}
                          className={`w-10 h-9 text-center border border-slate-200 dark:border-slate-800 transition-colors ${
                            isActive
                              ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-bold'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. N-Gram Sliding Window + Inverted Index Pruning Stage */}
        {frame.ngramState && (
          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                Padded Query Trigrams (&ldquo;{frame.ngramState.query}&rdquo;)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {frame.ngramState.queryGrams.map((g, i) => (
                  <span
                    key={`${g}-${i}`}
                    className={`px-2 py-1 rounded border font-mono text-[11px] ${
                      i <= frame.ngramState!.activeGramIndex
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500'
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Candidate Pruning & Scoring Stream
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {frame.ngramState.candidates.map((cand) => (
                  <div
                    key={cand.title}
                    className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {cand.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cand.reason}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums shrink-0">
                      <span className="text-slate-500 dark:text-slate-400">
                        |D|={cand.gramCount} · ∩={cand.overlap}
                      </span>
                      <span
                        className={`font-bold ${
                          cand.status === 'pruned'
                            ? 'text-rose-700 dark:text-rose-400'
                            : cand.status === 'reranked' || cand.status === 'kept'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cand.status === 'pruned'
                          ? 'PRUNED'
                          : cand.status === 'reranked'
                            ? `RANKED (${cand.score.toFixed(2)})`
                            : cand.status === 'kept'
                              ? `KEPT (${cand.score.toFixed(2)})`
                              : 'QUEUED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loop Invariant Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-800 dark:text-emerald-300">
          Invariant: {frame.invariantNote}
        </div>
      </div>

      {/* Synchronized Execution Line-Highlighted Code */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 py-2.5 overflow-x-auto font-mono text-xs leading-6">
        {topic.visualizer.codeLines.map((line, i) => {
          const lineNo = i + 1;
          const active = lineNo === frame.activeLine;
          return (
            <div
              key={lineNo}
              className={`px-3.5 flex gap-3 transition-colors ${
                active ? 'bg-sky-500/25 text-sky-100 font-semibold' : 'text-slate-300'
              }`}
            >
              <span className="w-4 text-right text-slate-500 select-none tabular-nums">
                {lineNo}
              </span>
              <span className="whitespace-pre">{line}</span>
            </div>
          );
        })}
      </div>

      {/* Playback Controls */}
      <PlaybackControlBar
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (!isPlaying && safeIdx >= totalSteps - 1) setStepIdx(0);
          setIsPlaying((p) => !p);
        }}
        onStepBack={() => {
          setIsPlaying(false);
          setStepIdx((i) => Math.max(0, i - 1));
        }}
        onStepForward={() => {
          setIsPlaying(false);
          setStepIdx((i) => Math.min(totalSteps - 1, i + 1));
        }}
        onReset={() => {
          setIsPlaying(false);
          setStepIdx(0);
        }}
        currentStep={safeIdx}
        totalSteps={totalSteps}
        speedMs={speedMs}
        onChangeSpeedMs={setSpeedMs}
        speeds={SPEED_OPTIONS}
        playLabel={safeIdx >= totalSteps - 1 ? 'Replay' : 'Play'}
        className="pt-1"
      />
    </div>
  );
}

export const AlgorithmVisualizer = withMemoizedVisualizer(AlgorithmVisualizerBase);
