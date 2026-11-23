import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gauge,
  Layers,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  MULTITHREADING_CONCURRENCY_SCENARIOS,
  type ConcurrencyDifficulty,
  type ThreadStateBadge,
} from '../../data/multithreadingConcurrencyLabData';
import type { LangTrack } from '../../data/languagesTutorialData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton, SegmentedTabBar } from '../ui';

interface MultithreadingTelemetryLabProps {
  languageFilter?: 'all' | LangTrack;
}

type WorkloadProfile = 'io-bound' | 'cpu-bound';
type SyncStrategy = 'locked' | 'lock-free-async';

const STATE_COLOR: Record<ThreadStateBadge, { stroke: string; fillClass: string; textClass: string }> = {
  RUNNING: {
    stroke: '#059669',
    fillClass: 'fill-emerald-50 dark:fill-emerald-950/60',
    textClass: 'fill-emerald-800 dark:fill-emerald-300',
  },
  RUNNABLE: {
    stroke: '#0284c7',
    fillClass: 'fill-sky-50 dark:fill-sky-950/50',
    textClass: 'fill-sky-800 dark:fill-sky-300',
  },
  BLOCKED: {
    stroke: '#d97706',
    fillClass: 'fill-amber-50 dark:fill-amber-950/50',
    textClass: 'fill-amber-800 dark:fill-amber-300',
  },
  WAITING: {
    stroke: '#6366f1',
    fillClass: 'fill-indigo-50 dark:fill-indigo-950/50',
    textClass: 'fill-indigo-800 dark:fill-indigo-300',
  },
  PARKED_IO: {
    stroke: '#0ea5e9',
    fillClass: 'fill-sky-50/70 dark:fill-sky-950/40',
    textClass: 'fill-sky-700 dark:fill-sky-300',
  },
  GIL_WAIT: {
    stroke: '#d97706',
    fillClass: 'fill-amber-50 dark:fill-amber-950/50',
    textClass: 'fill-amber-800 dark:fill-amber-300',
  },
  DEADLOCK: {
    stroke: '#e11d48',
    fillClass: 'fill-rose-50 dark:fill-rose-950/60',
    textClass: 'fill-rose-800 dark:fill-rose-300',
  },
  DONE: {
    stroke: '#10b981',
    fillClass: 'fill-emerald-50/60 dark:fill-emerald-950/30',
    textClass: 'fill-emerald-700 dark:fill-emerald-400',
  },
};

export const MultithreadingTelemetryLab: React.FC<MultithreadingTelemetryLabProps> = ({
  languageFilter = 'all',
}) => {
  const [levelFilter, setLevelFilter] = useState<'All' | ConcurrencyDifficulty>('All');
  const [selectedId, setSelectedId] = useState<string>(MULTITHREADING_CONCURRENCY_SCENARIOS[0].id);
  const [frameIdx, setFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [threadLoad, setThreadLoad] = useState<number>(8);
  const [workload, setWorkload] = useState<WorkloadProfile>('io-bound');
  const [syncStrategy, setSyncStrategy] = useState<SyncStrategy>('locked');
  const [packetPhase, setPacketPhase] = useState<number>(0);
  const [quizChoice, setQuizChoice] = useState<Record<string, string>>({});

  const visibleScenarios = useMemo(
    () =>
      levelFilter === 'All'
        ? MULTITHREADING_CONCURRENCY_SCENARIOS
        : MULTITHREADING_CONCURRENCY_SCENARIOS.filter((s) => s.level === levelFilter),
    [levelFilter]
  );

  const scenario = useMemo(
    () => visibleScenarios.find((s) => s.id === selectedId) ?? visibleScenarios[0],
    [visibleScenarios, selectedId]
  );

  useEffect(() => {
    setFrameIdx(0);
    setIsPlaying(true);
  }, [scenario.id]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Frame auto-advance
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % scenario.frames.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [isPlaying, scenario.frames.length, prefersReducedMotion]);

  // Smooth data-flow packet animation on SVG canvas
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    let rafId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setPacketPhase(((now - start) % 1800) / 1800);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, prefersReducedMotion, scenario.id]);

  const activeFrame =
    scenario.frames[Math.min(frameIdx, scenario.frames.length - 1)] ?? scenario.frames[0];

  // Dynamic live telemetry scaling based on interactive Thread Count, Workload & Sync controls
  const liveTelemetry = useMemo(() => {
    const base = activeFrame.telemetry;
    const scaleFactor = threadLoad / 8;
    const workloadMult = workload === 'io-bound' ? 1.25 : 0.85;
    const syncMult = syncStrategy === 'lock-free-async' ? 1.38 : 1;
    const contentionMult = syncStrategy === 'lock-free-async' ? 0.35 : 1 + Math.max(0, scaleFactor - 1) * 0.4;

    return {
      contextSwitchesPerSec: Math.round(
        base.contextSwitchesPerSec *
          (syncStrategy === 'lock-free-async' ? 0.45 : scaleFactor) *
          (workload === 'cpu-bound' ? 1.15 : 0.9)
      ),
      lockContentionPct: Math.min(100, Math.round(base.lockContentionPct * contentionMult)),
      throughputOpsSec: Math.round(base.throughputOpsSec * workloadMult * syncMult * Math.min(1.6, 0.55 + scaleFactor * 0.45)),
      queueDepth: Math.max(0, Math.round(base.queueDepth * scaleFactor)),
    };
  }, [activeFrame.telemetry, threadLoad, workload, syncStrategy]);

  const pickedAnswer = quizChoice[scenario.id];

  return (
    <div className="space-y-5">
      {/* Studio Header & Difficulty Filter */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                Deep Multithreading &amp; Concurrency Telemetry Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>Java (1+ &rarr; 21+ Loom) &amp; Python (0+ &rarr; asyncio &amp; 3.13t No-GIL)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
              Live CPU Core Lanes, Thread Context-Switch Telemetry &amp; Data Flow Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
              See threads schedule across CPU cores, pause on locks, park on I/O, or unmount off Loom carriers in real time—paired with side-by-side Java &amp; Python code, Mermaid concurrency DFDs, and live traffic simulation.
            </p>
          </div>

          <SegmentedTabBar<'All' | ConcurrencyDifficulty>
            ariaLabel="Filter multithreading scenarios by difficulty"
            activeTab={levelFilter}
            onChange={(lvl) => {
              setLevelFilter(lvl);
              const first =
                lvl === 'All'
                  ? MULTITHREADING_CONCURRENCY_SCENARIOS[0]
                  : MULTITHREADING_CONCURRENCY_SCENARIOS.find((s) => s.level === lvl);
              if (first) setSelectedId(first.id);
            }}
            size="xs"
            tabs={[
              { id: 'All', label: `All (${MULTITHREADING_CONCURRENCY_SCENARIOS.length})` },
              { id: 'Basics', label: 'Basics' },
              { id: 'Intermediate', label: 'Intermediate' },
              { id: 'Advanced', label: 'Advanced' },
            ]}
          />
        </div>

        {/* Scenario Selector Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {visibleScenarios.map((sc) => {
            const active = sc.id === scenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedId(sc.id)}
                className={`text-left rounded-xl border p-3.5 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-sky-700 dark:text-sky-400">
                    Module {String(sc.number).padStart(2, '0')}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{sc.level}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {sc.shortTitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Thread Telemetry & Interactive Animated CPU/Thread-Switch Stage */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Scenario Title + Playback Controls */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                {scenario.level}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Phase {activeFrame.frameNo} of {scenario.frames.length}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                {activeFrame.dataFlowPacket}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 dark:text-slate-100">
              {scenario.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">{scenario.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-600 bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setFrameIdx((p) => (p - 1 + scenario.frames.length) % scenario.frames.length);
              }}
              aria-label="Previous concurrency frame"
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-200 hover:border-sky-500"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setFrameIdx((p) => (p + 1) % scenario.frames.length);
              }}
              aria-label="Next concurrency frame"
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-200 hover:border-sky-500"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setFrameIdx(0);
              }}
              aria-label="Reset concurrency animation"
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-200 hover:border-sky-500"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Interactive Thread Load / Workload / Sync Controls + Live Telemetry Strip */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="thread-load-slider" className="font-medium text-slate-600 dark:text-slate-400">
                Active Thread Concurrency
              </label>
              <span className="font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                {threadLoad} threads
              </span>
            </div>
            <input
              id="thread-load-slider"
              type="range"
              min={2}
              max={16}
              step={2}
              value={threadLoad}
              onChange={(e) => setThreadLoad(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-center gap-2">
            <SegmentedTabBar<WorkloadProfile>
              ariaLabel="Select concurrency workload type"
              activeTab={workload}
              onChange={setWorkload}
              size="xs"
              tabs={[
                { id: 'io-bound', label: 'I/O-Bound' },
                { id: 'cpu-bound', label: 'CPU-Bound' },
              ]}
            />
            <SegmentedTabBar<SyncStrategy>
              ariaLabel="Select synchronization strategy"
              activeTab={syncStrategy}
              onChange={setSyncStrategy}
              size="xs"
              tabs={[
                { id: 'locked', label: 'Mutex / Sync', icon: Lock },
                { id: 'lock-free-async', label: 'Lock-Free / Loom / Async', icon: Zap },
              ]}
            />
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Ctx Switches/s</div>
              <div className="text-xs font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {liveTelemetry.contextSwitchesPerSec.toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Contention</div>
              <div
                className={`text-xs font-mono font-bold tabular-nums ${
                  liveTelemetry.lockContentionPct >= 60
                    ? 'text-rose-600 dark:text-rose-400'
                    : liveTelemetry.lockContentionPct >= 25
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {liveTelemetry.lockContentionPct}%
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Throughput</div>
              <div className="text-xs font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                {(liveTelemetry.throughputOpsSec / 1000).toFixed(1)}k/s
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Wait Queue</div>
              <div className="text-xs font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {liveTelemetry.queueDepth}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Zone Animated Thread-Switch Visual Canvas (Left 7) + Step Breakdown (Right 5) */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: Live Animated SVG CPU Core Lanes & Thread Data Flow */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/80 p-4 overflow-x-auto">
              <svg
                viewBox="0 0 680 285"
                role="img"
                aria-label={`Live CPU core lanes and thread switching diagram for ${scenario.shortTitle}`}
                className="w-full min-w-[600px] h-auto select-none"
              >
                <defs>
                  <marker
                    id="mt-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
                  </marker>
                </defs>

                {/* Column Titles */}
                <text x="16" y="18" className="text-[10px] font-mono font-semibold fill-slate-500 dark:fill-slate-400">
                  SCHEDULER / READY QUEUE
                </text>
                <text x="242" y="18" className="text-[10px] font-mono font-semibold fill-slate-500 dark:fill-slate-400">
                  CPU CORES &amp; CONTEXT SWITCHES
                </text>
                <text x="515" y="18" className="text-[10px] font-mono font-semibold fill-slate-500 dark:fill-slate-400">
                  SHARED HEAP / I/O
                </text>

                {/* Left Box: Ready Queue & Thread States */}
                <rect
                  x="14"
                  y="28"
                  width="175"
                  height="240"
                  rx="10"
                  className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="1.2"
                />
                {activeFrame.threads.map((th, idx) => {
                  const y = 42 + idx * 54;
                  const style = STATE_COLOR[th.state];
                  return (
                    <g key={th.threadId} transform={`translate(24, ${y})`}>
                      <rect
                        width="155"
                        height="44"
                        rx="7"
                        className={style.fillClass}
                        stroke={style.stroke}
                        strokeWidth="1.4"
                      />
                      <text x="8" y="15" className="text-[10.5px] font-semibold fill-slate-900 dark:fill-slate-100">
                        {th.threadId}
                      </text>
                      <text x="147" y="15" textAnchor="end" className={`text-[9px] font-mono font-semibold ${style.textClass}`}>
                        {th.state}
                      </text>
                      <text x="8" y="29" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400">
                        {th.holdingLock
                          ? `Lock: ${th.holdingLock}`
                          : th.waitingFor
                            ? `Wait: ${th.waitingFor}`
                            : `Progress: ${th.progressPct}%`}
                      </text>
                      {/* Progress bar */}
                      <rect x="8" y="35" width="139" height="4" rx="2" className="fill-slate-200 dark:fill-slate-800" />
                      <rect x="8" y="35" width={(139 * th.progressPct) / 100} height="4" rx="2" fill={style.stroke} />
                    </g>
                  );
                })}

                {/* Middle Zone: CPU Core Execution Lanes */}
                {activeFrame.cores.map((core, idx) => {
                  const rowH = activeFrame.cores.length > 2 ? 54 : 102;
                  const y = 34 + idx * (rowH + 10);
                  const style = STATE_COLOR[core.state];
                  const pktX = 240 + (220 * ((packetPhase + idx * 0.25) % 1));
                  return (
                    <g key={core.coreId}>
                      {/* Flow link from Scheduler -> Core */}
                      <line
                        x1="189"
                        y1={y + rowH / 2}
                        x2="236"
                        y2={y + rowH / 2}
                        stroke={core.contextSwitch ? '#7c3aed' : '#0284c7'}
                        strokeWidth={core.contextSwitch ? 2.2 : 1.5}
                        strokeDasharray="5 3"
                        markerEnd="url(#mt-arrow)"
                      />
                      {/* Animated packet into core */}
                      <circle
                        cx={193 + 40 * ((packetPhase + idx * 0.3) % 1)}
                        cy={y + rowH / 2}
                        r="3.8"
                        fill={core.contextSwitch ? '#7c3aed' : '#0284c7'}
                      />

                      {/* CPU Core Card */}
                      <rect
                        x="240"
                        y={y}
                        width="230"
                        height={rowH}
                        rx="9"
                        className={style.fillClass}
                        stroke={core.contextSwitch ? '#7c3aed' : style.stroke}
                        strokeWidth={core.contextSwitch ? 2.2 : 1.5}
                      />
                      <text x="252" y={y + 18} className="text-[10px] font-mono font-semibold fill-slate-500 dark:fill-slate-400">
                        {core.coreId}
                      </text>
                      <text
                        x="458"
                        y={y + 18}
                        textAnchor="end"
                        className={`text-[9px] font-mono font-bold ${
                          core.contextSwitch ? 'fill-violet-700 dark:fill-violet-300' : style.textClass
                        }`}
                      >
                        {core.contextSwitch ? 'CTX SWITCH' : core.state}
                      </text>
                      <text x="252" y={y + 34} className="text-[11.5px] font-semibold fill-slate-900 dark:fill-slate-100">
                        {core.activeThread} · {core.taskLabel}
                      </text>
                      {rowH > 60 && (
                        <>
                          {/* Live Execution Data Stream Track inside Core */}
                          <line
                            x1="252"
                            y1={y + rowH - 22}
                            x2="458"
                            y2={y + rowH - 22}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity="0.6"
                          />
                          {core.state === 'RUNNING' && (
                            <circle
                              cx={Math.max(255, Math.min(455, pktX))}
                              cy={y + rowH - 22}
                              r="4.5"
                              fill="#059669"
                              stroke="#ffffff"
                              strokeWidth="1.3"
                            />
                          )}
                          <text x="252" y={y + rowH - 8} className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400">
                            {core.state === 'RUNNING'
                              ? 'Executing Instructions -> L1/L2 Cache Active'
                              : core.state === 'DEADLOCK'
                                ? 'STALLED: Circular Wait Detected'
                                : 'Core Waiting / Context Unmounted'}
                          </text>
                        </>
                      )}

                      {/* Link from Core -> Shared Heap / IO */}
                      <line
                        x1="470"
                        y1={y + rowH / 2}
                        x2="510"
                        y2={y + rowH / 2}
                        stroke={style.stroke}
                        strokeWidth="1.6"
                        markerEnd="url(#mt-arrow)"
                      />
                    </g>
                  );
                })}

                {/* Right Box: Shared Heap Memory, Locks & Kernel I/O */}
                <rect
                  x="514"
                  y="28"
                  width="152"
                  height="240"
                  rx="10"
                  className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
                  strokeWidth="1.2"
                />
                <rect
                  x="524"
                  y="44"
                  width="132"
                  height="64"
                  rx="8"
                  className="fill-sky-50/70 dark:fill-sky-950/40 stroke-sky-400/70"
                  strokeWidth="1.2"
                />
                <text x="534" y="64" className="text-[10px] font-semibold fill-sky-900 dark:fill-sky-200">
                  Shared Heap &amp; Atomics
                </text>
                <text x="534" y="80" className="text-[9px] font-mono fill-slate-600 dark:fill-slate-400">
                  Memory Fence Sync
                </text>
                <text x="534" y="95" className="text-[9px] font-mono fill-sky-700 dark:fill-sky-300">
                  {(liveTelemetry.throughputOpsSec / 1000).toFixed(1)}k ops/sec
                </text>

                <rect
                  x="524"
                  y="122"
                  width="132"
                  height="64"
                  rx="8"
                  className="fill-amber-50/60 dark:fill-amber-950/30 stroke-amber-400/70"
                  strokeWidth="1.2"
                />
                <text x="534" y="142" className="text-[10px] font-semibold fill-amber-900 dark:fill-amber-200">
                  Mutex / GIL / Queue
                </text>
                <text x="534" y="158" className="text-[9px] font-mono fill-slate-600 dark:fill-slate-400">
                  Contention: {liveTelemetry.lockContentionPct}%
                </text>
                <text x="534" y="173" className="text-[9px] font-mono fill-amber-800 dark:fill-amber-300">
                  Waiters: {liveTelemetry.queueDepth}
                </text>

                <rect
                  x="524"
                  y="200"
                  width="132"
                  height="56"
                  rx="8"
                  className="fill-emerald-50/60 dark:fill-emerald-950/30 stroke-emerald-400/70"
                  strokeWidth="1.2"
                />
                <text x="534" y="220" className="text-[10px] font-semibold fill-emerald-900 dark:fill-emerald-200">
                  Kernel epoll / Sockets
                </text>
                <text x="534" y="238" className="text-[9px] font-mono fill-emerald-800 dark:fill-emerald-300">
                  {workload === 'io-bound' ? 'Async I/O Wakeups' : 'Compute Saturated'}
                </text>
              </svg>
            </div>

            {/* Frame Stepper Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {scenario.frames.map((fr, idx) => (
                <button
                  key={fr.frameNo}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setFrameIdx(idx);
                  }}
                  className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                    idx === frameIdx
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 font-semibold text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <div className="truncate">{fr.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Plain English + Under the Hood + Formal Definition */}
          <div className="lg:col-span-5 space-y-3 text-xs leading-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-sky-700 dark:text-sky-400 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                  {activeFrame.title}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  What Is Happening Right Now
                </div>
                <p className="text-slate-700 dark:text-slate-300">{activeFrame.plainEnglish}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                  Under the Hood (OS Kernel / JVM / CPython)
                </div>
                <p className="text-slate-600 dark:text-slate-400">{activeFrame.underTheHood}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Formal Definition &amp; Language Mental Models
              </div>
              <p className="text-slate-600 dark:text-slate-300">{scenario.formalDefinition}</p>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-2.5">
                  <span className="font-semibold text-amber-900 dark:text-amber-300">Java: </span>
                  <span className="text-slate-700 dark:text-slate-300">{scenario.javaMentalModel}</span>
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-2.5">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">Python: </span>
                  <span className="text-slate-700 dark:text-slate-300">{scenario.pythonMentalModel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Production Code (Java & Python) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            Production Multithreading Code Comparison (Java &amp; Python)
          </span>
        </div>

        <div
          className={`grid grid-cols-1 ${
            languageFilter === 'all' ? 'lg:grid-cols-2' : ''
          } gap-4 items-stretch`}
        >
          {(languageFilter === 'all' || languageFilter === 'java') && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  Java (1+ Core to Java 21+ Loom)
                </span>
                <CopyButton text={scenario.javaCode} label="Copy" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-sky-200 font-mono text-xs leading-5 overflow-x-auto border border-slate-800 flex-1">
                {scenario.javaCode}
              </pre>
            </div>
          )}

          {(languageFilter === 'all' || languageFilter === 'python') && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  Python (0+ Core to asyncio &amp; 3.13t)
                </span>
                <CopyButton text={scenario.pythonCode} label="Copy" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800 flex-1">
                {scenario.pythonCode}
              </pre>
            </div>
          )}
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {scenario.keyTakeaways.map((tip) => (
            <li
              key={tip}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5"
            >
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Rendered Mermaid.js Concurrency Flow DFD + Live Traffic Simulator */}
      <FlightMermaidViewer
        title={`${scenario.shortTitle} — Thread Switching & Synchronization DFD (Mermaid.js)`}
        subtitle="End-to-end thread state transitions, lock barriers, queue backpressure, and carrier scheduling."
        mermaidCode={scenario.mermaidDfd}
        trafficDomain="system-design"
        compact
      />

      <LiveTrafficFlowSimulator
        mermaidCode={scenario.mermaidDfd}
        mermaidTitle={`${scenario.shortTitle} Thread Flow`}
        domain="system-design"
        compact
        heading={`Live Thread Scheduling & Lock-Contention Traffic — ${scenario.shortTitle}`}
      />

      {/* Interactive Concurrency Check */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Concurrency Mastery Check
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {scenario.quickQuiz.question}
        </p>
        <div className="space-y-2">
          {scenario.quickQuiz.options.map((opt) => {
            const picked = pickedAnswer === opt.id;
            const isCorrect = opt.id === scenario.quickQuiz.correctId;
            const revealed = Boolean(pickedAnswer);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setQuizChoice((prev) => ({ ...prev, [scenario.id]: opt.id }))}
                className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs transition-colors ${
                  revealed && isCorrect
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                    : revealed && picked && !isCorrect
                      ? 'border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
        {pickedAnswer && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
            <strong className="text-slate-900 dark:text-slate-100">
              {pickedAnswer === scenario.quickQuiz.correctId ? 'Correct: ' : 'Key Insight: '}
            </strong>
            {scenario.quickQuiz.explanation}
          </div>
        )}
      </section>
    </div>
  );
};
