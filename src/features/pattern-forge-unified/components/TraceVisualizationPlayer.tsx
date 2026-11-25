import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import type { LearningTopic, TracePointer } from '../../../../shared/learningContract';
import { buildLearningTrace } from '../../../../shared/traceEngine';
import { useUnifiedLearningStore } from '../useUnifiedLearningStore';

interface TraceVisualizationPlayerProps {
  topic: LearningTopic;
  onAdvanceStage?: () => void;
}

const POINTER_STYLE: Record<TracePointer['color'], string> = {
  sky: 'text-sky-700 dark:text-sky-300 border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-950/60',
  emerald: 'text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
  amber: 'text-amber-700 dark:text-amber-300 border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/60',
  rose: 'text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/60',
  indigo: 'text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60',
};

export const TraceVisualizationPlayer: React.FC<TraceVisualizationPlayerProps> = ({
  topic,
  onAdvanceStage,
}) => {
  const recordEvidence = useUnifiedLearningStore((s) => s.recordEvidence);
  const mastery = useUnifiedLearningStore((s) => s.getTopicMastery(topic.id));

  const [selectedTraceId, setSelectedTraceId] = useState<string>(topic.traceIds[0] ?? '');
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);
  const [answeredCheckpoints, setAnsweredCheckpoints] = useState<
    Record<string, { optionId: string; isCorrect: boolean; feedback: string }>
  >({});

  useEffect(() => {
    setSelectedTraceId(topic.traceIds[0] ?? '');
    setCustomInputs({});
    setStepIdx(0);
    setIsPlaying(false);
    setAnsweredCheckpoints({});
  }, [topic.id, topic.traceIds]);

  const trace = useMemo(
    () => (selectedTraceId ? buildLearningTrace(selectedTraceId, customInputs) : null),
    [selectedTraceId, customInputs]
  );

  const traceOptions = useMemo(
    () =>
      topic.traceIds
        .map((id) => buildLearningTrace(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [topic.traceIds]
  );

  const totalSteps = trace?.steps.length ?? 0;
  const clampedIdx = Math.min(stepIdx, Math.max(0, totalSteps - 1));
  const currentStep = trace?.steps[clampedIdx] ?? null;
  const activeCheckpoint = currentStep?.checkpoint;
  const checkpointAnswer = activeCheckpoint ? answeredCheckpoints[activeCheckpoint.id] : undefined;
  const checkpointBlocksForward = Boolean(activeCheckpoint && !checkpointAnswer);

  // Record trace completion evidence when reaching final step
  useEffect(() => {
    if (trace && totalSteps > 0 && clampedIdx === totalSteps - 1) {
      if (!mastery.evidence.tracesCompleted.includes(trace.id)) {
        void recordEvidence({ topicId: topic.id, traceCompletedId: trace.id });
      }
    }
  }, [clampedIdx, totalSteps, trace, topic.id, mastery.evidence.tracesCompleted, recordEvidence]);

  // Deterministic playback loop (automatically pauses at prediction checkpoints)
  useEffect(() => {
    if (!isPlaying || !trace) return;
    if (clampedIdx >= totalSteps - 1 || checkpointBlocksForward) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, clampedIdx, totalSteps, speedMs, checkpointBlocksForward, trace]);

  if (!trace || !currentStep) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-600 dark:text-slate-400">
        Interactive traces are not yet authored for this pattern ({topic.verificationStatus}). Switch to a Published pilot pattern (HashMap &amp; HashSet, Sliding Window, or Dynamic Programming) to run the live visualization engine.
      </div>
    );
  }

  const handleSelectTrace = (id: string) => {
    setSelectedTraceId(id);
    setCustomInputs({});
    setStepIdx(0);
    setIsPlaying(false);
    setAnsweredCheckpoints({});
  };

  const handleApplyInput = (key: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [key]: value }));
    setStepIdx(0);
    setIsPlaying(false);
    setAnsweredCheckpoints({});
  };

  const handleAnswerCheckpoint = (option: { id: string; isCorrect: boolean; feedback: string }) => {
    if (!activeCheckpoint || answeredCheckpoints[activeCheckpoint.id]) return;
    setAnsweredCheckpoints((prev) => ({
      ...prev,
      [activeCheckpoint.id]: {
        optionId: option.id,
        isCorrect: option.isCorrect,
        feedback: option.feedback,
      },
    }));
    void recordEvidence({
      topicId: topic.id,
      checkpointTraceId: trace.id,
      checkpointId: activeCheckpoint.id,
      checkpointCorrect: option.isCorrect,
    });
  };

  const state = currentStep.state;
  const highlightedSet = new Set(currentStep.operation.highlightedIndices ?? []);

  return (
    <div className="space-y-6">
      {/* Trace Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
            Interactive Deterministic Trace Engine
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {trace.algorithmName} · {mastery.evidence.tracesCompleted.length}/{topic.traceIds.length} traces completed ·{' '}
            {mastery.evidence.predictionCheckpointsCorrect}/{mastery.evidence.predictionCheckpointsTotal} checkpoints correct
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {traceOptions.map((item, idx) => {
            const active = item.id === trace.id;
            const done = mastery.evidence.tracesCompleted.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTrace(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>Trace {idx + 1}: {item.title.split('—')[0].trim()}</span>
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: 65% Visual Stage | 35% Controls & Variables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Zone (Interactive Data Structure Stage) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Step Header & Operation Summary */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Step {clampedIdx + 1} of {totalSteps} · Operation: {currentStep.operation.type}
              </div>
              {state.finalResult ? (
                <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  Final Result: {state.finalResult}
                </div>
              ) : state.intermediateResult ? (
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400 tabular-nums">
                  {state.intermediateResult}
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {currentStep.operation.summary}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.operation.detail}
              </p>
            </div>

            {/* Array + Pointer + Window Renderer */}
            {state.array && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Input Sequence ({state.array.length} items)
                  </span>
                  {state.windowRange && (
                    <span
                      className={`font-mono font-medium tabular-nums ${
                        state.windowRange.valid
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      Window [{state.windowRange.left}..{state.windowRange.right}] ·{' '}
                      {state.windowRange.valid ? 'Valid Invariant' : 'Contracting Duplicate'}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex items-end gap-2 min-w-full">
                    {state.array.map((val, idx) => {
                      const inWindow =
                        state.windowRange &&
                        idx >= state.windowRange.left &&
                        idx <= state.windowRange.right;
                      const isHighlighted = highlightedSet.has(idx);
                      const cellPointers = (state.pointers ?? []).filter((p) => p.index === idx);

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 min-w-[54px]">
                          {/* Pointer labels above cell */}
                          <div className="min-h-[22px] flex items-center gap-1">
                            {cellPointers.map((pt) => (
                              <span
                                key={pt.name}
                                className={`px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded border ${POINTER_STYLE[pt.color]}`}
                              >
                                {pt.name}
                              </span>
                            ))}
                          </div>

                          {/* Cell Box */}
                          <div
                            className={`w-full px-2.5 py-3 rounded-lg border text-center font-mono text-sm font-semibold tabular-nums transition-colors ${
                              inWindow
                                ? state.windowRange?.valid
                                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100'
                                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-100'
                                : isHighlighted
                                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-slate-900 dark:text-slate-100'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {String(val)}
                          </div>

                          {/* Index below cell */}
                          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                            {idx}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* HashMap Renderer */}
            {state.hashMap && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  HashMap State ({state.hashMap.length} entries)
                </div>
                {state.hashMap.length === 0 ? (
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 py-2">
                    {'{ empty }'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {state.hashMap.map((entry) => (
                      <div
                        key={entry.key}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border font-mono text-xs tabular-nums ${
                          entry.highlighted
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                            : entry.isNew
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-semibold">{entry.key}</span>
                        <span className="text-slate-400" aria-hidden="true">→</span>
                        <span>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HashSet Renderer */}
            {state.hashSet && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  HashSet Membership ({state.hashSet.length} unique values)
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.hashSet.map((item) => (
                    <div
                      key={item.value}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs tabular-nums ${
                        item.highlighted
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1D DP Table Renderer */}
            {state.dp1d && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    1D DP State Table
                  </span>
                  <span>
                    Sky: current cell · Amber: dependencies read · Emerald: final answer
                  </span>
                </div>
                <div className="overflow-x-auto pb-1">
                  <div className="inline-flex gap-2">
                    {state.dp1d.map((cell) => (
                      <div
                        key={cell.index}
                        className={`min-w-[66px] px-2.5 py-2 rounded-lg border text-center font-mono tabular-nums ${
                          cell.role === 'answer'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100'
                            : cell.role === 'current'
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100'
                              : cell.role === 'dependency'
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-100'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {cell.label ?? `dp[${cell.index}]`}
                        </div>
                        <div className="mt-0.5 text-sm font-semibold">{cell.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2D DP Table Renderer */}
            {state.dp2d && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  2D DP Grid Table
                </div>
                <div className="overflow-x-auto">
                  <table className="border-collapse font-mono text-xs tabular-nums">
                    <thead>
                      <tr>
                        <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-500">
                          dp[r][c]
                        </th>
                        {state.dp2d.colHeaders.map((col, cIdx) => (
                          <th
                            key={cIdx}
                            className="p-2 min-w-[44px] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {state.dp2d.grid.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                            {state.dp2d!.rowHeaders[rIdx]}
                          </th>
                          {row.map((val, cIdx) => {
                            const hl = state.dp2d!.highlights.find(
                              (h) => h.row === rIdx && h.col === cIdx
                            );
                            return (
                              <td
                                key={cIdx}
                                className={`p-2 text-center border border-slate-200 dark:border-slate-800 ${
                                  hl?.role === 'answer'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold'
                                    : hl?.role === 'current'
                                      ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 font-bold'
                                      : hl?.role === 'dependency'
                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* State Change & Algorithm Invariant */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">State Transition</div>
                <p className="text-slate-600 dark:text-slate-400 font-mono">{currentStep.stateChangeSummary}</p>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Algorithm Invariant</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{currentStep.invariant}</p>
              </div>
            </div>
          </div>

          {/* Interactive Prediction Checkpoint Gate */}
          {activeCheckpoint && (
            <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-900 dark:text-sky-200">
                <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Prediction Checkpoint — Predict Before Stepping Forward</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200">{activeCheckpoint.prompt}</p>
              <div className="space-y-2">
                {activeCheckpoint.options.map((opt) => {
                  const chosen = checkpointAnswer?.optionId === opt.id;
                  const answered = Boolean(checkpointAnswer);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={answered}
                      onClick={() => handleAnswerCheckpoint(opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                        answered && opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                          : chosen && !opt.isCorrect
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {checkpointAnswer && (
                <div
                  className={`flex items-start gap-2 pt-2 text-xs font-medium ${
                    checkpointAnswer.isCorrect
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {checkpointAnswer.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <span>{checkpointAnswer.feedback}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Zone (Playback Controls, Custom Input & Variable Inspector) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Playback & Timeline Controls */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Playback Controls
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {Math.round(((clampedIdx + 1) / Math.max(1, totalSteps)) * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((p) => Math.max(0, p - 1));
                }}
                disabled={clampedIdx === 0}
                aria-label="Previous step"
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (clampedIdx >= totalSteps - 1) setStepIdx(0);
                  setIsPlaying((p) => !p);
                }}
                disabled={checkpointBlocksForward}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>{clampedIdx >= totalSteps - 1 ? 'Replay' : 'Play'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((p) => Math.min(totalSteps - 1, p + 1));
                }}
                disabled={clampedIdx >= totalSteps - 1 || checkpointBlocksForward}
                aria-label="Next step"
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(0);
                }}
                aria-label="Reset trace"
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {checkpointBlocksForward && (
              <p className="text-xs text-sky-700 dark:text-sky-400">
                Answer the prediction checkpoint to unlock the next step.
              </p>
            )}

            {/* Timeline Scrubber */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <label htmlFor="trace-timeline">Timeline Step</label>
                <span className="font-mono tabular-nums">
                  {clampedIdx + 1} / {totalSteps}
                </span>
              </div>
              <input
                id="trace-timeline"
                type="range"
                min={0}
                max={Math.max(0, totalSteps - 1)}
                value={clampedIdx}
                onChange={(e) => {
                  const target = Number(e.target.value);
                  if (checkpointBlocksForward && target > clampedIdx) return;
                  setIsPlaying(false);
                  setStepIdx(target);
                }}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Speed Selector */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Playback Speed</span>
              <div className="flex items-center gap-1">
                {[
                  { label: '0.5x', ms: 2000 },
                  { label: '1x', ms: 1200 },
                  { label: '2x', ms: 550 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSpeedMs(opt.ms)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                      speedMs === opt.ms
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Variable Inspector */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Variable Inspector
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentStep.variables.map((v) => (
                <div
                  key={v.name}
                  className="py-2 flex items-center justify-between gap-3 text-xs font-mono tabular-nums"
                >
                  <span className="text-slate-500 dark:text-slate-400">{v.name}</span>
                  <span
                    className={
                      v.changed
                        ? 'font-semibold text-sky-700 dark:text-sky-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }
                  >
                    {v.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Input Editor */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Custom Input</span>
            </div>
            <div className="space-y-3">
              {trace.inputSchema.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label
                    htmlFor={`trace-in-${field.key}`}
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`trace-in-${field.key}`}
                    type="text"
                    value={customInputs[field.key] ?? trace.defaultInput[field.key] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => handleApplyInput(field.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{field.helpText}</p>
                </div>
              ))}
            </div>
          </div>

          {onAdvanceStage && (
            <button
              type="button"
              onClick={onAdvanceStage}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:border-sky-500 transition-colors"
            >
              Continue to Stage 3: Implement →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
