import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';
import { RaceFrame } from '../types/dsa';
import { useSpeechNarrator } from '../hooks/useSpeechNarrator';

function BigOCurveChart({ bruteOps, optimalOps }: { bruteOps: number; optimalOps: number }) {
  // Clean SVG comparing quadratic O(N^2) vs linear O(N) up to N=20
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-950/50">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          Operations Growth Curve (N = 1..20)
        </span>
        <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          Brute: {bruteOps} ops · Optimal: {optimalOps} ops
        </span>
      </div>
      <svg viewBox="0 0 320 110" className="w-full h-28 overflow-visible" role="img" aria-label="Brute vs Optimal operations curve">
        <line x1="24" y1="92" x2="306" y2="92" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
        <line x1="24" y1="12" x2="24" y2="92" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
        {/* Quadratic curve */}
        <path
          d="M 24 90 Q 170 86 300 14"
          fill="none"
          stroke="#e11d48"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Linear curve */}
        <path
          d="M 24 90 L 300 72"
          fill="none"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="225" y="22" className="fill-rose-600 dark:fill-rose-400 text-[10px] font-mono font-semibold">
          Brute O(N²)
        </text>
        <text x="225" y="66" className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-mono font-semibold">
          Optimal O(N)
        </text>
      </svg>
    </div>
  );
}

function RaceTrack({
  title,
  complexity,
  variant,
  values,
  frame,
}: {
  title: string;
  complexity: string;
  variant: 'brute' | 'optimal';
  values: (number | string)[];
  frame: RaceFrame;
}) {
  const isBrute = variant === 'brute';

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isBrute
          ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50/30 dark:bg-rose-950/15'
          : 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/30 dark:bg-emerald-950/15'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-semibold ${
                isBrute ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isBrute ? 'BRUTE FORCE TRACK' : 'OPTIMAL TRACK'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{frame.statusText}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Time: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{complexity}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Ops: </span>
            <span
              className={`font-bold ${
                isBrute ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {frame.operationsCount}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Mem: </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{frame.memoryUnits}</span>
          </div>
          <div className="font-semibold text-sky-700 dark:text-sky-300">{frame.bestValueLabel}</div>
        </div>
      </div>

      {/* 20-element track */}
      <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
        {values.map((val, idx) => {
          const isActive = frame.activeIndices.includes(idx);
          const isRedundant = frame.redundantIndices.includes(idx);
          const ptrs = frame.pointers.filter((p) => p.index === idx);

          return (
            <motion.div
              key={idx}
              layout={false}
              animate={{ scale: isActive ? 1.06 : 1 }}
              transition={{ duration: 0.15 }}
              className={`rounded-md border py-2 text-center font-mono text-xs transition-colors ${
                isRedundant
                  ? 'border-rose-500 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-bold'
                  : isActive
                    ? isBrute
                      ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/50 text-slate-900 dark:text-slate-100 font-bold'
                      : 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div>{String(val)}</div>
              <div className="text-[9px] h-3 font-semibold text-sky-700 dark:text-sky-300 truncate">
                {ptrs.map((p) => p.label).join(',')}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function RaceModeVisualizer() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const markBruteRunCompleted = usePatternForgeStore((s) => s.markBruteRunCompleted);
  const answerBottleneck = usePatternForgeStore((s) => s.answerBottleneck);
  const setPolyaStep = usePatternForgeStore((s) => s.setPolyaStep);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const bruteFrames = problem.raceDataset.bruteTrace;
  const optimalFrames = problem.raceDataset.optimalTrace;

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const narrator = useSpeechNarrator();

  const maxSteps = Math.max(bruteFrames.length, optimalFrames.length);

  // Reset playback when problem switches
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [activeProblemId]);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(80, Math.round(450 / speed));
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        const next = prev + 1;
        if (next >= maxSteps - 1) {
          setIsPlaying(false);
          markBruteRunCompleted();
          return maxSteps - 1;
        }
        if (next >= Math.min(8, bruteFrames.length - 1)) {
          markBruteRunCompleted();
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, maxSteps, bruteFrames.length, markBruteRunCompleted]);

  const currentBruteFrame = bruteFrames[Math.min(stepIdx, bruteFrames.length - 1)];
  const currentOptimalFrame = optimalFrames[Math.min(stepIdx, optimalFrames.length - 1)];

  useEffect(() => {
    if (!narrator.enabled) return;
    const text = progress.bottleneckSolved
      ? currentOptimalFrame?.statusText
      : currentBruteFrame?.statusText;
    if (text) narrator.speak(text);
  }, [stepIdx, narrator.enabled, progress.bottleneckSolved, currentOptimalFrame, currentBruteFrame, narrator]);

  return (
    <div className="space-y-6">
      {/* Playback Controls Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
            STAGE 4 · BRUTE FORCE → BOTTLENECK → SPLIT-SCREEN RACE
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {problem.raceDataset.label}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Reset race"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((s) => Math.max(0, s - 1));
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Step backward"
          >
            <SkipBack className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
            {isPlaying ? 'Pause' : progress.bottleneckSolved ? 'Run Split-Screen Race' : 'Run Brute Force Scan'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              const next = Math.min(maxSteps - 1, stepIdx + 1);
              setStepIdx(next);
              if (next >= 3) markBruteRunCompleted();
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Step forward"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg ml-1">
            {[0.5, 1, 2, 3].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setSpeed(spd)}
                className={`px-2 py-1 text-xs font-mono rounded-md transition-colors ${
                  speed === spd
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {narrator.supported && (
            <button
              type="button"
              onClick={narrator.toggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                narrator.enabled
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {narrator.enabled ? <Volume2 className="w-3.5 h-3.5" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
              {narrator.enabled ? 'Listen Mode On' : 'Listen Mode'}
            </button>
          )}
        </div>
      </div>

      {/* Brute Force Track (always visible) */}
      <RaceTrack
        title="Nested / Redundant Approach"
        complexity={problem.bruteBigO}
        variant="brute"
        values={problem.raceDataset.values}
        frame={currentBruteFrame}
      />

      {/* Bottleneck Analyzer Card */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Bottleneck Spotlight Analyzer
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {progress.bottleneckSolved ? 'OPTIMAL TRACK UNLOCKED' : 'DIAGNOSE WASTED WORK TO UNLOCK OPTIMAL'}
          </span>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300">{problem.bottleneck.question}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {problem.bottleneck.options.map((opt) => {
            const selected = progress.bottleneckOptionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => answerBottleneck(opt.id)}
                className={`p-3.5 rounded-lg border text-left transition-colors ${
                  selected
                    ? opt.isCorrect
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                      : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {opt.text}
                </p>
                {selected && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      opt.isCorrect
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {opt.explanation}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optimal Track + Big-O Growth Curve (unlocked when bottleneck answered) */}
      {progress.bottleneckSolved ? (
        <div className="space-y-4">
          <RaceTrack
            title={problem.patternName}
            complexity={problem.targetBigO}
            variant="optimal"
            values={problem.raceDataset.values}
            frame={currentOptimalFrame}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7">
              <BigOCurveChart
                bruteOps={bruteFrames[bruteFrames.length - 1]?.operationsCount ?? 190}
                optimalOps={optimalFrames[optimalFrames.length - 1]?.operationsCount ?? 20}
              />
            </div>
            <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Optimal Speedup Verified
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {problem.patternName} cut total operations from{' '}
                    <strong className="font-mono text-rose-600 dark:text-rose-400">
                      {bruteFrames[bruteFrames.length - 1]?.operationsCount}
                    </strong>{' '}
                    down to{' '}
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      {optimalFrames[optimalFrames.length - 1]?.operationsCount}
                    </strong>
                    . Complete your Feynman Reflection to schedule 1-3-7-21 review.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPolyaStep('reflect')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
              >
                Complete Feynman Check (Polya 04)
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
