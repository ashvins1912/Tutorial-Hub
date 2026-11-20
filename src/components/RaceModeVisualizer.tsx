import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Code2,
  History,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';
import { CodeLanguage, ProblemDefinition, RaceFrame } from '../types/dsa';
import { useSpeechNarrator } from '../hooks/useSpeechNarrator';
import { useAccountState } from '../hooks/useAccountState';

interface SavedRaceCodeLines {
  init: string[];
  loop: string[];
  update: string[];
}

export interface SavedRaceReplay {
  problemId: string;
  problemTitle: string;
  patternName: string;
  datasetLabel: string;
  values: (number | string)[];
  bruteBigO: string;
  targetBigO: string;
  language: CodeLanguage;
  bruteSteps: RaceFrame[];
  optimalSteps: RaceFrame[];
  bruteCode: SavedRaceCodeLines;
  optimalCode: SavedRaceCodeLines;
  finalBruteOps: number;
  finalOptimalOps: number;
  speedupRatio: number;
  completedAt: string;
}

const LAST_RACE_STORAGE_KEY = 'patternforge_last_race_replay_v1';

function extractCodeBySlot(
  problem: ProblemDefinition,
  mode: 'brute' | 'optimal',
  language: CodeLanguage
): SavedRaceCodeLines {
  const bySlot = (slot: 'init' | 'loop' | 'update') => {
    const match = problem.blocks.find((b) => b.mode === mode && b.targetSlot === slot);
    return match ? match.code[language] : [];
  };
  return {
    init: bySlot('init'),
    loop: bySlot('loop'),
    update: bySlot('update'),
  };
}

function getActiveCodePhase(stepIndex: number, totalSteps: number): 'init' | 'loop' | 'update' {
  if (stepIndex === 0) return 'init';
  if (stepIndex >= totalSteps - 1) return 'update';
  return stepIndex % 2 === 1 ? 'loop' : 'update';
}

function BigOCurveChart({ bruteOps, optimalOps }: { bruteOps: number; optimalOps: number }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          Operations Growth Curve (N = 1..20)
        </span>
        <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          Brute: {bruteOps} ops · Optimal: {optimalOps} ops
        </span>
      </div>
      <svg
        viewBox="0 0 320 110"
        className="w-full h-28 overflow-visible"
        role="img"
        aria-label="Brute vs Optimal operations curve"
      >
        <line
          x1="24"
          y1="92"
          x2="306"
          y2="92"
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth="1"
        />
        <line
          x1="24"
          y1="12"
          x2="24"
          y2="92"
          stroke="currentColor"
          className="text-slate-300 dark:text-slate-700"
          strokeWidth="1"
        />
        <path
          d="M 24 90 Q 170 86 300 14"
          fill="none"
          stroke="#e11d48"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 24 90 L 300 72"
          fill="none"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text
          x="225"
          y="22"
          className="fill-rose-600 dark:fill-rose-400 text-[10px] font-mono font-semibold"
        >
          Brute O(N²)
        </text>
        <text
          x="225"
          y="66"
          className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-mono font-semibold"
        >
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
  compactGrid = false,
}: {
  title: string;
  complexity: string;
  variant: 'brute' | 'optimal';
  values: (number | string)[];
  frame: RaceFrame;
  compactGrid?: boolean;
}) {
  const isBrute = variant === 'brute';

  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 space-y-3 min-w-0 ${
        isBrute
          ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50/30 dark:bg-rose-950/15'
          : 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/30 dark:bg-emerald-950/15'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-mono font-semibold ${
                isBrute ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isBrute ? 'BRUTE FORCE TRACK' : 'OPTIMAL TRACK'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{frame.statusText}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono tabular-nums shrink-0">
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
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {frame.memoryUnits}
            </span>
          </div>
          <div className="font-semibold text-sky-700 dark:text-sky-300">{frame.bestValueLabel}</div>
        </div>
      </div>

      {/* Responsive 20-element track */}
      <div
        className={`grid gap-1 ${
          compactGrid ? 'grid-cols-5 sm:grid-cols-10' : 'grid-cols-5 sm:grid-cols-10 lg:grid-cols-20'
        }`}
      >
        {values.map((val, idx) => {
          const isActive = frame.activeIndices.includes(idx);
          const isRedundant = frame.redundantIndices.includes(idx);
          const ptrs = frame.pointers.filter((p) => p.index === idx);

          return (
            <motion.div
              key={idx}
              layout={false}
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ duration: 0.15 }}
              className={`rounded-md border py-1.5 sm:py-2 text-center font-mono text-xs transition-colors ${
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
              <div className="text-[9px] h-3 font-semibold text-sky-700 dark:text-sky-300 truncate px-0.5">
                {ptrs.map((p) => p.label).join(',')}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReplayCodePathBlock({
  variant,
  code,
  activePhase,
  finished,
  language,
}: {
  variant: 'brute' | 'optimal';
  code: SavedRaceCodeLines;
  activePhase: 'init' | 'loop' | 'update';
  finished: boolean;
  language: CodeLanguage;
}) {
  const isBrute = variant === 'brute';
  const sections: { id: 'init' | 'loop' | 'update'; label: string; lines: string[] }[] = [
    { id: 'init', label: '1. Initialize State', lines: code.init },
    { id: 'loop', label: '2. Scan / Iterate', lines: code.loop },
    { id: 'update', label: '3. Update & Record', lines: code.update },
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-[11px] font-mono">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold ${
            isBrute ? 'text-rose-300' : 'text-emerald-300'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
          {isBrute ? 'Brute-Force Code Path' : 'Optimal Code Path'} ({language.toUpperCase()})
        </span>
        <span className="text-slate-400">
          {finished ? 'Completed' : `Active: ${activePhase.toUpperCase()}`}
        </span>
      </div>

      <div className="p-2.5 space-y-1.5 font-mono text-[11px] leading-relaxed overflow-x-auto">
        {sections.map((sec) => {
          const isCurrent = !finished && activePhase === sec.id;
          return (
            <div
              key={sec.id}
              className={`rounded-md px-2.5 py-1.5 transition-colors border ${
                isCurrent
                  ? isBrute
                    ? 'border-rose-500/80 bg-rose-950/50 text-rose-100'
                    : 'border-emerald-500/80 bg-emerald-950/50 text-emerald-100'
                  : 'border-transparent bg-slate-900/50 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-75 mb-0.5">
                {sec.label}
              </div>
              {sec.lines.length > 0 ? (
                sec.lines.map((line, idx) => (
                  <div key={idx} className="whitespace-pre">
                    {line}
                  </div>
                ))
              ) : (
                <div className="italic opacity-60">Step executed via state transition</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RaceReplayStudio({
  replay,
  onExitReplay,
}: {
  replay: SavedRaceReplay;
  onExitReplay: () => void;
}) {
  const maxSteps = Math.max(replay.bruteSteps.length, replay.optimalSteps.length);
  const [replayIdx, setReplayIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(100, Math.round(520 / speed));
    const timer = window.setInterval(() => {
      setReplayIdx((prev) => {
        if (prev >= maxSteps - 1) {
          setIsPlaying(false);
          return maxSteps - 1;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, maxSteps]);

  const bruteFrameIdx = Math.min(replayIdx, replay.bruteSteps.length - 1);
  const optimalFrameIdx = Math.min(replayIdx, replay.optimalSteps.length - 1);
  const bruteFrame = replay.bruteSteps[bruteFrameIdx];
  const optimalFrame = replay.optimalSteps[optimalFrameIdx];

  const bruteFinished = replayIdx >= replay.bruteSteps.length - 1;
  const optimalFinished = replayIdx >= replay.optimalSteps.length - 1;
  const opsSavedAtStep = Math.max(0, bruteFrame.operationsCount - optimalFrame.operationsCount);

  return (
    <div className="space-y-5">
      {/* Replay Studio Header & Synchronized Transport Controls */}
      <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>SAVED RACE REPLAY · SIDE-BY-SIDE EXECUTION PATH</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                {replay.speedupRatio}x Faster
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {replay.problemTitle} — {replay.bruteBigO} vs {replay.targetBigO} ({replay.patternName})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Recorded {new Date(replay.completedAt).toLocaleString()} · {replay.bruteSteps.length} brute steps vs{' '}
              {replay.optimalSteps.length} optimal steps
            </p>
          </div>

          <button
            type="button"
            onClick={onExitReplay}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap self-start lg:self-auto"
          >
            Back to Live Race
          </button>
        </div>

        {/* Playback Controls + Timeline Scrubber */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setReplayIdx(0);
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="Restart replay"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setReplayIdx((s) => Math.max(0, s - 1));
              }}
              disabled={replayIdx === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              aria-label="Step replay backward"
            >
              <SkipBack className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (replayIdx >= maxSteps - 1) setReplayIdx(0);
                setIsPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isPlaying ? 'Pause Replay' : replayIdx >= maxSteps - 1 ? 'Replay Again' : 'Play Side-by-Side'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setReplayIdx((s) => Math.min(maxSteps - 1, s + 1));
              }}
              disabled={replayIdx >= maxSteps - 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              aria-label="Step replay forward"
            >
              <SkipForward className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg ml-1">
              {[0.5, 1, 2].map((spd) => (
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
          </div>

          {/* Synchronized Timeline Scrubber */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <input
              type="range"
              min={0}
              max={Math.max(0, maxSteps - 1)}
              value={replayIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setReplayIdx(Number(e.target.value));
              }}
              aria-label="Scrub replay execution timeline"
              className="w-full accent-sky-600 cursor-pointer"
            />
            <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0">
              Tick {replayIdx + 1} / {maxSteps}
            </span>
          </div>
        </div>

        {/* Live Operation Delta Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono tabular-nums">
          <div className="rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/40 dark:bg-rose-950/20 px-3 py-2 flex items-center justify-between">
            <span className="text-rose-700 dark:text-rose-400 font-semibold">Brute Ops</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {bruteFrame.operationsCount} / {replay.finalBruteOps}
            </span>
          </div>
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/20 px-3 py-2 flex items-center justify-between">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Optimal Ops</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {optimalFrame.operationsCount} / {replay.finalOptimalOps}
            </span>
          </div>
          <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/20 px-3 py-2 flex items-center justify-between">
            <span className="text-sky-700 dark:text-sky-400 font-semibold inline-flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Work Avoided
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {opsSavedAtStep} ops saved
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Execution Paths */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        {/* LEFT COLUMN: BRUTE FORCE PATH */}
        <div className="space-y-3 min-w-0">
          <RaceTrack
            title="Nested / Redundant Path"
            complexity={replay.bruteBigO}
            variant="brute"
            values={replay.values}
            frame={bruteFrame}
            compactGrid
          />

          <ReplayCodePathBlock
            variant="brute"
            code={replay.bruteCode}
            activePhase={getActiveCodePhase(bruteFrameIdx, replay.bruteSteps.length)}
            finished={bruteFinished}
            language={replay.language}
          />

          {/* Brute Step Log */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span>Brute Execution Trace</span>
              <span className="font-mono tabular-nums text-slate-500">
                Step {bruteFrameIdx + 1}/{replay.bruteSteps.length}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {replay.bruteSteps.map((st, idx) => {
                const isCurrent = idx === bruteFrameIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setReplayIdx(idx);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between gap-2 transition-colors ${
                      isCurrent
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="truncate">
                      <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 mr-2">
                        #{idx + 1}
                      </span>
                      {st.statusText}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums shrink-0">
                      {st.operationsCount} ops
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OPTIMAL PATH */}
        <div className="space-y-3 min-w-0">
          <RaceTrack
            title={replay.patternName}
            complexity={replay.targetBigO}
            variant="optimal"
            values={replay.values}
            frame={optimalFrame}
            compactGrid
          />

          <ReplayCodePathBlock
            variant="optimal"
            code={replay.optimalCode}
            activePhase={getActiveCodePhase(optimalFrameIdx, replay.optimalSteps.length)}
            finished={optimalFinished}
            language={replay.language}
          />

          {/* Optimal Step Log */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Optimal Execution Trace</span>
              <span className="font-mono tabular-nums text-slate-500">
                Step {optimalFrameIdx + 1}/{replay.optimalSteps.length}
                {optimalFinished ? ' · Done' : ''}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {replay.optimalSteps.map((st, idx) => {
                const isCurrent = idx === optimalFrameIdx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setReplayIdx(idx);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between gap-2 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="truncate">
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 mr-2">
                        #{idx + 1}
                      </span>
                      {st.statusText}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums shrink-0">
                      {st.operationsCount} ops
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RaceModeVisualizer() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const activeLanguage = usePatternForgeStore((s) => s.activeLanguage);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const markBruteRunCompleted = usePatternForgeStore((s) => s.markBruteRunCompleted);
  const answerBottleneck = usePatternForgeStore((s) => s.answerBottleneck);
  const setPolyaStep = usePatternForgeStore((s) => s.setPolyaStep);

  const [lastRaceReplay, setLastRaceReplay] = useAccountState<SavedRaceReplay | null>(
    'race-mode-last-replay',
    null,
    LAST_RACE_STORAGE_KEY
  );
  const [replayModeOpen, setReplayModeOpen] = useState(false);
  const [justSavedBanner, setJustSavedBanner] = useState(false);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const bruteFrames = problem.raceDataset.bruteTrace;
  const optimalFrames = problem.raceDataset.optimalTrace;

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const narrator = useSpeechNarrator();

  const maxSteps = Math.max(bruteFrames.length, optimalFrames.length);

  const saveCurrentRaceSnapshot = useCallback(() => {
    const finalBruteOps = bruteFrames[bruteFrames.length - 1]?.operationsCount ?? 1;
    const finalOptimalOps = Math.max(
      1,
      optimalFrames[optimalFrames.length - 1]?.operationsCount ?? 1
    );
    const snapshot: SavedRaceReplay = {
      problemId: problem.id,
      problemTitle: problem.title,
      patternName: problem.patternName,
      datasetLabel: problem.raceDataset.label,
      values: problem.raceDataset.values,
      bruteBigO: problem.bruteBigO,
      targetBigO: problem.targetBigO,
      language: activeLanguage,
      bruteSteps: bruteFrames,
      optimalSteps: optimalFrames,
      bruteCode: extractCodeBySlot(problem, 'brute', activeLanguage),
      optimalCode: extractCodeBySlot(problem, 'optimal', activeLanguage),
      finalBruteOps,
      finalOptimalOps,
      speedupRatio: Number((finalBruteOps / finalOptimalOps).toFixed(1)),
      completedAt: new Date().toISOString(),
    };
    setLastRaceReplay(snapshot);
    setJustSavedBanner(true);
  }, [problem, bruteFrames, optimalFrames, activeLanguage, setLastRaceReplay]);

  // Reset playback when problem switches
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
    setJustSavedBanner(false);
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
          saveCurrentRaceSnapshot();
          return maxSteps - 1;
        }
        if (next >= Math.min(8, bruteFrames.length - 1)) {
          markBruteRunCompleted();
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, maxSteps, bruteFrames.length, markBruteRunCompleted, saveCurrentRaceSnapshot]);

  const currentBruteFrame = bruteFrames[Math.min(stepIdx, bruteFrames.length - 1)];
  const currentOptimalFrame = optimalFrames[Math.min(stepIdx, optimalFrames.length - 1)];

  useEffect(() => {
    if (!narrator.enabled || replayModeOpen) return;
    const text = progress.bottleneckSolved
      ? currentOptimalFrame?.statusText
      : currentBruteFrame?.statusText;
    if (text) narrator.speak(text);
  }, [
    stepIdx,
    narrator.enabled,
    progress.bottleneckSolved,
    currentOptimalFrame,
    currentBruteFrame,
    narrator,
    replayModeOpen,
  ]);

  const finalBruteOps = bruteFrames[bruteFrames.length - 1]?.operationsCount ?? 190;
  const finalOptimalOps = optimalFrames[optimalFrames.length - 1]?.operationsCount ?? 20;

  const canLaunchReplay = useMemo(() => Boolean(lastRaceReplay), [lastRaceReplay]);

  if (replayModeOpen && lastRaceReplay) {
    return (
      <RaceReplayStudio
        replay={lastRaceReplay}
        onExitReplay={() => setReplayModeOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Playback Controls Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
            STAGE 4 · BRUTE FORCE → BOTTLENECK → SPLIT-SCREEN RACE
          </p>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
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
            onClick={() => {
              if (stepIdx >= maxSteps - 1) setStepIdx(0);
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {isPlaying
              ? 'Pause'
              : progress.bottleneckSolved
                ? 'Run Split-Screen Race'
                : 'Run Brute Force Scan'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              const next = Math.min(maxSteps - 1, stepIdx + 1);
              setStepIdx(next);
              if (next >= 3) markBruteRunCompleted();
              if (next >= maxSteps - 1) saveCurrentRaceSnapshot();
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Step forward"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
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

          {canLaunchReplay && lastRaceReplay && (
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setReplayModeOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 text-xs font-semibold hover:border-sky-500 transition-colors whitespace-nowrap shrink-0"
            >
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Replay Last Race</span>
            </button>
          )}

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
              {narrator.enabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {narrator.enabled ? 'Listen On' : 'Listen'}
            </button>
          )}
        </div>
      </div>

      {/* Saved Replay Callout Banner */}
      {justSavedBanner && lastRaceReplay && (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Race execution saved ({lastRaceReplay.problemTitle} · {lastRaceReplay.speedupRatio}x speedup). Inspect Brute vs. Optimal code paths side by side.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplayModeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold whitespace-nowrap shrink-0"
          >
            <History className="w-3.5 h-3.5" aria-hidden="true" />
            Open Side-by-Side Replay
          </button>
        </div>
      )}

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
            {progress.bottleneckSolved
              ? 'OPTIMAL TRACK UNLOCKED'
              : 'DIAGNOSE WASTED WORK TO UNLOCK OPTIMAL'}
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
              <BigOCurveChart bruteOps={finalBruteOps} optimalOps={finalOptimalOps} />
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
                      {finalBruteOps}
                    </strong>{' '}
                    down to{' '}
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      {finalOptimalOps}
                    </strong>
                    . Save &amp; replay both code paths side by side or finish your Feynman Reflection.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    saveCurrentRaceSnapshot();
                    setReplayModeOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 text-xs font-semibold hover:border-sky-500 transition-colors whitespace-nowrap shrink-0"
                >
                  <History className="w-3.5 h-3.5" aria-hidden="true" />
                  Save &amp; Replay Side-by-Side
                </button>
                <button
                  type="button"
                  onClick={() => setPolyaStep('reflect')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
                >
                  Complete Feynman Check
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
