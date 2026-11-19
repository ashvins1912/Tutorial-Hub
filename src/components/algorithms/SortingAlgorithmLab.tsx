import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  ArrayPresetKey,
  buildBubbleSortTrace,
  buildMergeSortTrace,
  buildQuickSortTrace,
  generatePresetArray,
  SortAlgorithmKey,
  SortStepFrame,
  SortTrace,
} from './sortingEngine';

type LabMode = 'race' | 'single';

const SPEEDS = [
  { label: '0.5×', ms: 420 },
  { label: '1×', ms: 180 },
  { label: '2×', ms: 75 },
  { label: '4×', ms: 28 },
] as const;

const PRESETS: { id: ArrayPresetKey; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'reverse', label: 'Reverse Sorted' },
  { id: 'nearly-sorted', label: 'Nearly Sorted' },
  { id: 'duplicates', label: 'Duplicates' },
];

function SortBarsCanvas({
  frame,
  compact = false,
}: {
  frame: SortStepFrame;
  compact?: boolean;
}) {
  const maxVal = Math.max(...frame.array, 100);
  const sortedSet = new Set(frame.sortedIndices);
  const comparingSet = new Set(frame.comparing);
  const swappingSet = new Set(frame.swapping);

  return (
    <div
      className={`w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 px-3 pt-4 pb-2.5 flex items-end gap-1 ${
        compact ? 'h-40' : 'h-60'
      }`}
    >
      {frame.array.map((val, idx) => {
        const isSwap = swappingSet.has(idx);
        const isCompare = comparingSet.has(idx);
        const isPivot = frame.pivotIndex === idx;
        const isSorted = sortedSet.has(idx);
        const inRange =
          !frame.activeRange ||
          (idx >= frame.activeRange[0] && idx <= frame.activeRange[1]);

        let barColor = 'bg-slate-400 dark:bg-slate-600';
        if (isSwap) barColor = 'bg-rose-500 dark:bg-rose-400';
        else if (isPivot) barColor = 'bg-indigo-500 dark:bg-indigo-400';
        else if (isCompare) barColor = 'bg-amber-500 dark:bg-amber-400';
        else if (isSorted) barColor = 'bg-emerald-500 dark:bg-emerald-400';
        else if (inRange) barColor = 'bg-sky-600 dark:bg-sky-500';

        const pct = Math.max(8, Math.round((val / maxVal) * 100));

        return (
          <div
            key={idx}
            className="flex-1 h-full flex flex-col items-center justify-end gap-1 min-w-0"
          >
            {!compact && frame.array.length <= 20 && (
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 tabular-nums leading-none">
                {val}
              </span>
            )}
            <div
              className={`w-full rounded-t transition-all duration-150 ${barColor} ${
                !inRange && !isSorted ? 'opacity-40' : 'opacity-100'
              }`}
              style={{ height: `${pct}%` }}
              title={`index ${idx}: ${val}`}
            />
          </div>
        );
      })}
    </div>
  );
}

function RaceComparisonChart({
  bubble,
  merge,
  quick,
  tick,
  arraySize,
}: {
  bubble: SortTrace;
  merge: SortTrace;
  quick: SortTrace;
  tick: number;
  arraySize: number;
}) {
  const maxSteps = Math.max(bubble.frames.length, merge.frames.length, quick.frames.length, 1);

  const bFrame = bubble.frames[Math.min(tick, bubble.frames.length - 1)];
  const mFrame = merge.frames[Math.min(tick, merge.frames.length - 1)];
  const qFrame = quick.frames[Math.min(tick, quick.frames.length - 1)];

  const bOps = bFrame.comparisons + bFrame.swaps;
  const mOps = mFrame.comparisons + mFrame.swaps;
  const qOps = qFrame.comparisons + qFrame.swaps;

  const maxOps = Math.max(
    bubble.totalComparisons + bubble.totalSwaps,
    merge.totalComparisons + merge.totalSwaps,
    quick.totalComparisons + quick.totalSwaps,
    10
  );

  // Build SVG polyline points up to current tick (sampled smoothly)
  const sampleCount = 36;
  const W = 440;
  const H = 155;
  const padL = 36;
  const padR = 14;
  const padT = 14;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const buildPolyline = (trace: SortTrace) => {
    const pts: string[] = [];
    const currentLimit = Math.min(tick, maxSteps - 1);
    const stepsToPlot = Math.max(1, Math.min(sampleCount, currentLimit + 1));
    for (let s = 0; s <= stepsToPlot; s++) {
      const t = Math.round((s / stepsToPlot) * currentLimit);
      const fr = trace.frames[Math.min(t, trace.frames.length - 1)];
      const ops = fr.comparisons + fr.swaps;
      const x = padL + (t / Math.max(1, maxSteps - 1)) * plotW;
      const y = padT + plotH - (ops / maxOps) * plotH;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Asymptotic curve data for n = 10..200
  const maxN = 200;
  const maxQuad = maxN * maxN;
  const curvePoints = (fn: (n: number) => number) => {
    const pts: string[] = [];
    for (let n = 8; n <= maxN; n += 8) {
      const x = padL + (n / maxN) * plotW;
      const y = padT + plotH - Math.min(1, fn(n) / maxQuad) * plotH;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const n1000Quad = 1000 * 1000;
  const n1000Log = Math.round(1000 * Math.log2(1000));
  const speedupAt1000 = Math.round(n1000Quad / n1000Log);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Real-Time Race Operations Line Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
              Live Race Telemetry · Cumulative Operations (n = {arraySize})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Comparisons + Swaps/Writes tracked per step in real time
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
            <span className="text-rose-600 dark:text-rose-400">Bubble: {bOps}</span>
            <span className="text-sky-600 dark:text-sky-400">Merge: {mOps}</span>
            <span className="text-emerald-600 dark:text-emerald-400">Quick: {qOps}</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 overflow-visible" role="img" aria-label="Real-time sorting operations race chart">
          {/* Grid lines */}
          {[0, 0.5, 1].map((frac) => {
            const y = padT + plotH * (1 - frac);
            const label = Math.round(maxOps * frac);
            return (
              <g key={frac}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray={frac === 0 ? undefined : '3 3'}
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={padL + plotW / 2}
            y={H - 4}
            textAnchor="middle"
            className="fill-slate-400 text-[9px] font-mono"
          >
            Race Timeline (Step {Math.min(tick, maxSteps - 1)} / {maxSteps - 1})
          </text>

          {/* Curves */}
          <polyline
            fill="none"
            className="stroke-rose-500"
            strokeWidth="2.2"
            points={buildPolyline(bubble)}
          />
          <polyline
            fill="none"
            className="stroke-sky-500"
            strokeWidth="2.2"
            points={buildPolyline(merge)}
          />
          <polyline
            fill="none"
            className="stroke-emerald-500"
            strokeWidth="2.2"
            points={buildPolyline(quick)}
          />
        </svg>
      </div>

      {/* Asymptotic Growth Curve: O(n^2) vs O(n log n) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
              Asymptotic Complexity Gap · O(n²) vs O(n log n)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              At n = 1,000: O(n²) ≈ 1,000,000 ops vs O(n log n) ≈ 9,966 ops ({speedupAt1000}× faster)
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-rose-600 dark:text-rose-400">O(n²) Bubble</span>
            <span className="text-emerald-600 dark:text-emerald-400">O(n log n) Merge/Quick</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 overflow-visible" role="img" aria-label="O(n squared) versus O(n log n) complexity growth curve">
          {[0, 0.5, 1].map((frac) => {
            const y = padT + plotH * (1 - frac);
            const label = frac === 0 ? '0' : frac === 0.5 ? '20k' : '40k';
            return (
              <g key={frac}>
                <line
                  x1={padL}
                  y1={y}
                  x2={W - padR}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray={frac === 0 ? undefined : '3 3'}
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {label}
                </text>
              </g>
            );
          })}

          <text
            x={padL + plotW / 2}
            y={H - 4}
            textAnchor="middle"
            className="fill-slate-400 text-[9px] font-mono"
          >
            Input Size n (8 → 200 elements)
          </text>

          {/* O(n^2) quadratic curve */}
          <polyline
            fill="none"
            className="stroke-rose-500"
            strokeWidth="2.4"
            points={curvePoints((n) => n * n)}
          />
          {/* O(n log n) curve */}
          <polyline
            fill="none"
            className="stroke-emerald-500"
            strokeWidth="2.4"
            points={curvePoints((n) => n * Math.log2(n))}
          />

          {/* Current n marker */}
          {(() => {
            const cx = padL + (arraySize / maxN) * plotW;
            return (
              <g>
                <line
                  x1={cx}
                  y1={padT}
                  x2={cx}
                  y2={padT + plotH}
                  className="stroke-sky-500/70"
                  strokeDasharray="2 2"
                />
                <text
                  x={cx + 4}
                  y={padT + 10}
                  className="fill-sky-600 dark:fill-sky-400 text-[9px] font-mono font-bold"
                >
                  n={arraySize}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

export function SortingAlgorithmLab() {
  const [labMode, setLabMode] = useState<LabMode>('race');
  const [selectedAlgo, setSelectedAlgo] = useState<SortAlgorithmKey>('quick');
  const [arraySize, setArraySize] = useState(14);
  const [preset, setPreset] = useState<ArrayPresetKey>('random');
  const [seed, setSeed] = useState(42);
  const [speedMs, setSpeedMs] = useState<number>(180);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const baseArray = useMemo(
    () => generatePresetArray(arraySize, preset, seed),
    [arraySize, preset, seed]
  );

  const traces = useMemo(() => {
    const bubble = buildBubbleSortTrace(baseArray);
    const merge = buildMergeSortTrace(baseArray);
    const quick = buildQuickSortTrace(baseArray);
    return { bubble, merge, quick };
  }, [baseArray]);

  const maxSteps =
    labMode === 'race'
      ? Math.max(traces.bubble.frames.length, traces.merge.frames.length, traces.quick.frames.length)
      : traces[selectedAlgo].frames.length;

  useEffect(() => {
    setStep(0);
    setIsPlaying(false);
  }, [baseArray, labMode, selectedAlgo]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= maxSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => window.clearInterval(id);
  }, [isPlaying, speedMs, maxSteps]);

  const activeSingleTrace = traces[selectedAlgo];
  const activeSingleFrame =
    activeSingleTrace.frames[Math.min(step, activeSingleTrace.frames.length - 1)];

  const raceCards: {
    key: SortAlgorithmKey;
    trace: SortTrace;
    accent: string;
  }[] = [
    { key: 'bubble', trace: traces.bubble, accent: 'text-rose-600 dark:text-rose-400' },
    { key: 'merge', trace: traces.merge, accent: 'text-sky-600 dark:text-sky-400' },
    { key: 'quick', trace: traces.quick, accent: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Mode Switcher */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Sorting Algorithm Lab · Bubble Sort O(n²) vs Merge Sort & Quick Sort O(n log n)
            </p>
            <h2 className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Step-by-Step Swapping Visualizer & Real-Time Complexity Race
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-fit">
            <button
              type="button"
              onClick={() => setLabMode('race')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                labMode === 'race'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              3-Way Race Mode
            </button>
            <button
              type="button"
              onClick={() => setLabMode('single')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                labMode === 'single'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
              Single Algorithm Inspector
            </button>
          </div>
        </div>

        {/* Array Configuration & Playback Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                  preset === p.id
                    ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setPreset('random');
                setSeed((s) => s + 17);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              New Array
            </button>

            <label className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 pl-2 tabular-nums">
              <span>n = {arraySize}</span>
              <input
                type="range"
                min={8}
                max={24}
                step={2}
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="w-24 accent-sky-600 cursor-pointer"
                aria-label="Array size"
              />
            </label>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStep(0);
              }}
              aria-label="Reset playback"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
              aria-label="Step back"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-35"
            >
              <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (step >= maxSteps - 1) setStep(0);
                setIsPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isPlaying ? 'Pause' : labMode === 'race' ? 'Start Race' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStep((s) => Math.min(maxSteps - 1, s + 1));
              }}
              disabled={step >= maxSteps - 1}
              aria-label="Step forward"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-35"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1 pl-1">
              {SPEEDS.map((sp) => (
                <button
                  key={sp.label}
                  type="button"
                  onClick={() => setSpeedMs(sp.ms)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-semibold ${
                    speedMs === sp.ms
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            Comparing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            Swapping / Writing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" />
            Quick Pivot
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            Locked Sorted
          </span>
        </div>
      </section>

      {/* Race Mode: 3 Side-by-Side Live Tracks */}
      {labMode === 'race' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {raceCards.map(({ key, trace, accent }) => {
            const frame = trace.frames[Math.min(step, trace.frames.length - 1)];
            const finished = step >= trace.frames.length - 1;
            return (
              <div
                key={key}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`text-xs font-mono font-bold ${accent}`}>
                      {trace.complexity} · Space {trace.space}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {trace.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-semibold tabular-nums ${
                      finished
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {finished
                      ? `Done (${trace.frames.length - 1} steps)`
                      : `Step ${frame.step}/${trace.frames.length - 1}`}
                  </span>
                </div>

                <SortBarsCanvas frame={frame} compact />

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                  <span>Comparisons: {frame.comparisons}</span>
                  <span>Swaps/Writes: {frame.swaps}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug min-h-[2.25rem]">
                  {frame.note}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Algorithm Deep Inspector */
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'bubble', label: 'Bubble Sort · O(n²)' },
                  { id: 'merge', label: 'Merge Sort · O(n log n)' },
                  { id: 'quick', label: 'Quick Sort · O(n log n)' },
                ] as const
              ).map((algo) => (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setSelectedAlgo(algo.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedAlgo === algo.id
                      ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
              Step {activeSingleFrame.step} / {activeSingleTrace.frames.length - 1} · Comparisons{' '}
              <strong>{activeSingleFrame.comparisons}</strong> · Swaps/Writes{' '}
              <strong>{activeSingleFrame.swaps}</strong>
            </div>
          </div>

          <SortBarsCanvas frame={activeSingleFrame} />

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-slate-100">Active Step:</strong>{' '}
            {activeSingleFrame.note}
          </div>
        </section>
      )}

      {/* Real-Time Comparison & Asymptotic Complexity Chart */}
      <RaceComparisonChart
        bubble={traces.bubble}
        merge={traces.merge}
        quick={traces.quick}
        tick={step}
        arraySize={arraySize}
      />
    </div>
  );
}
