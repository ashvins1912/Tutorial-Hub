import React from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

export interface SpeedOption {
  label: string;
  ms: number;
}

export interface PlaybackControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  currentStep: number; // 0-indexed
  totalSteps: number;
  speedMs?: number;
  onChangeSpeedMs?: (ms: number) => void;
  speeds?: readonly SpeedOption[];
  playLabel?: string;
  pauseLabel?: string;
  compact?: boolean;
  className?: string;
}

const DEFAULT_SPEEDS: readonly SpeedOption[] = [
  { label: '0.5×', ms: 2200 },
  { label: '1×', ms: 1350 },
  { label: '2×', ms: 700 },
];

/**
 * Unified step-by-step playback transport strip for algorithm visualizers,
 * DFD simulations, and trace sandboxes.
 */
export const PlaybackControlBar: React.FC<PlaybackControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  currentStep,
  totalSteps,
  speedMs,
  onChangeSpeedMs,
  speeds = DEFAULT_SPEEDS,
  playLabel = 'Play',
  pauseLabel = 'Pause',
  compact = false,
  className = '',
}) => {
  const safeTotal = Math.max(1, totalSteps);
  const safeStep = Math.min(Math.max(0, currentStep), safeTotal - 1);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onReset}
          title="Reset to step 1"
          aria-label="Reset playback"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-sky-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onStepBack}
          disabled={safeStep <= 0}
          title="Previous step"
          aria-label="Previous step"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-sky-400 disabled:opacity-40 transition-colors"
        >
          <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{isPlaying ? pauseLabel : playLabel}</span>
        </button>
        <button
          type="button"
          onClick={onStepForward}
          disabled={safeStep >= safeTotal - 1}
          title="Next step"
          aria-label="Next step"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-sky-400 disabled:opacity-40 transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
          Step {safeStep + 1} / {safeTotal}
        </span>

        {speedMs !== undefined && onChangeSpeedMs && (
          <div
            className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-0.5"
            role="group"
            aria-label="Playback speed"
          >
            {speeds.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onChangeSpeedMs(s.ms)}
                className={`${
                  compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
                } rounded-md font-mono font-medium transition-colors whitespace-nowrap ${
                  speedMs === s.ms
                    ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
