import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  type ArrayTracePresetId,
  generateArrayPointerTrace,
} from '../../core/step-generators/workspaceGenerators';
import { PlaybackControlBar } from '../../components/ui';
import { withMemoizedVisualizer } from '../../components/hoc';

interface ArrayPointerVisualizerProps {
  initialPreset?: ArrayTracePresetId;
  strategyName?: string;
}

const PRESET_OPTIONS: { id: ArrayTracePresetId; label: string }[] = [
  { id: 'sliding-window', label: 'Sliding Window' },
  { id: 'ngram-fuzzy', label: 'N-Gram Fuzzy Search' },
  { id: 'two-pointers', label: 'Two Pointers' },
  { id: 'binary-search', label: 'Binary Search' },
];

const SPEED_OPTIONS = [
  { label: '0.5×', ms: 2300 },
  { label: '1×', ms: 1150 },
  { label: '1.5×', ms: 767 },
  { label: '2×', ms: 575 },
] as const;

const ArrayPointerVisualizerBase: React.FC<ArrayPointerVisualizerProps> = ({
  initialPreset = 'sliding-window',
  strategyName,
}) => {
  const [preset, setPreset] = useState<ArrayTracePresetId>(initialPreset);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(1150);

  useEffect(() => {
    setPreset(initialPreset);
    setStepIndex(0);
    setIsPlaying(false);
  }, [initialPreset]);

  const trace = useMemo(() => generateArrayPointerTrace(preset), [preset]);
  const totalSteps = trace.steps.length;
  const safeIdx = Math.min(stepIndex, Math.max(0, totalSteps - 1));
  const current = trace.steps[safeIdx];

  useEffect(() => {
    if (!isPlaying) return;
    if (safeIdx >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, safeIdx, totalSteps, speedMs]);

  const handlePresetChange = (next: ArrayTracePresetId) => {
    setPreset(next);
    setStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden">
      {/* Header & Preset Selector */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Execution Visualizer</span>
            {strategyName && (
              <>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 dark:text-slate-300">{strategyName}</span>
              </>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {trace.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">{trace.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePresetChange(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                preset === opt.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
        <PlaybackControlBar
          isPlaying={isPlaying}
          onTogglePlay={() => {
            if (safeIdx >= totalSteps - 1) setStepIndex(0);
            setIsPlaying((p) => !p);
          }}
          onStepBack={() => {
            setIsPlaying(false);
            setStepIndex((p) => Math.max(0, p - 1));
          }}
          onStepForward={() => {
            setIsPlaying(false);
            setStepIndex((p) => Math.min(totalSteps - 1, p + 1));
          }}
          onReset={() => {
            setIsPlaying(false);
            setStepIndex(0);
          }}
          currentStep={safeIdx}
          totalSteps={totalSteps}
          speedMs={speedMs}
          onChangeSpeedMs={setSpeedMs}
          speeds={SPEED_OPTIONS}
          playLabel={safeIdx >= totalSteps - 1 ? 'Replay' : 'Play'}
          compact
        />
      </div>

      {/* Main Stage */}
      <div className="p-4 space-y-4">
        {/* Metrics Strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          {current.metrics.map((m, idx) => (
            <div key={m.label} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-slate-300 dark:text-slate-700">·</span>}
              <span>{m.label}:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* Array Cells & Pointer Indicators */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 overflow-x-auto">
          <div className="flex items-end gap-2 min-w-max py-2">
            {current.cells.map((cell, idx) => {
              const inWindow =
                current.windowRange !== undefined &&
                idx >= current.windowRange[0] &&
                idx <= current.windowRange[1];
              const isHighlighted = current.highlightIndices?.includes(idx);
              const isLeft = current.left === idx;
              const isRight = current.right === idx;
              const isMid = current.mid === idx;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
                    {idx}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-sm transition-all ${
                      isHighlighted
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 scale-105'
                        : inWindow
                          ? 'border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {cell}
                  </div>
                  <div className="h-5 flex items-center justify-center gap-0.5 text-[10px] font-mono font-bold">
                    {isLeft && (
                      <span className="px-1 py-0.5 rounded bg-emerald-600 text-white">L</span>
                    )}
                    {isMid && (
                      <span className="px-1 py-0.5 rounded bg-amber-600 text-white">M</span>
                    )}
                    {isRight && (
                      <span className="px-1 py-0.5 rounded bg-indigo-600 text-white">R</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-medium text-slate-900 dark:text-slate-100 mt-1">
            {current.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            {current.explanation}
          </p>
        </div>

        {/* Auxiliary State (Hash Map + Optional Inverted Postings) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Auxiliary State / Hash Map
            </h4>
            <div className="space-y-1.5">
              {current.hashMap.map((entry) => (
                <div
                  key={entry.key}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md font-mono text-xs ${
                    entry.active
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{entry.key}</span>
                  <span className="font-semibold tabular-nums">{entry.value}</span>
                </div>
              ))}
            </div>

            {current.postingHits && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Inverted Index Postings & Rerank
                </h5>
                <div className="space-y-1">
                  {current.postingHits.map((hit) => (
                    <div
                      key={hit.docId}
                      className={`flex items-center justify-between px-2 py-1 rounded text-xs font-mono ${
                        hit.pruned
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>
                        {hit.docId} · {hit.label}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {hit.pruned
                          ? '✗ PRUNED'
                          : hit.confidence !== undefined
                            ? `✓ ${Math.round(hit.confidence * 100)}% (ed=${hit.editDist})`
                            : `${hit.matchedGrams} hits`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Synchronized Code Trace */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 overflow-x-auto">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Synchronized Execution Line
            </h4>
            <pre className="text-xs font-mono leading-relaxed">
              {trace.codeLines.map((line, lineIdx) => {
                const isActive = lineIdx === current.activeCodeLine;
                return (
                  <div
                    key={lineIdx}
                    className={`px-2 py-0.5 rounded flex gap-3 ${
                      isActive
                        ? 'bg-indigo-500/25 text-indigo-100 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-4 text-right select-none text-slate-600 tabular-nums">
                      {lineIdx + 1}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ArrayPointerVisualizer = withMemoizedVisualizer(ArrayPointerVisualizerBase);
