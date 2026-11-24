import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Cpu,
  Gauge,
  Lock,
  Pause,
  Play,
  Sliders,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import { SegmentedTabBar } from '../ui';

export type TelemetryWorkload = 'cpu-bound' | 'io-bound' | 'lock-contention';

interface ThreadTelemetryOverlayProps {
  /** Compact inline mode (used inside visualizers) vs dismissible overlay bar in LanguagesTutorialStudio */
  mode?: 'inline' | 'overlay';
  onClose?: () => void;
  defaultWorkload?: TelemetryWorkload;
}

interface LaneTelemetry {
  id: string;
  label: string;
  state: 'RUNNING' | 'BLOCKED' | 'GIL_WAIT' | 'IO_WAIT';
  /** Normalized speed multiplier: 1.0 = full speed, 0.14 = heavily slowed/blocked */
  velocity: number;
  throughputOps: number;
  queueWaitMs: number;
}

const LANE_Y = [34, 72, 110, 148];

export const ThreadTelemetryOverlay: React.FC<ThreadTelemetryOverlayProps> = ({
  mode = 'inline',
  onClose,
  defaultWorkload = 'cpu-bound',
}) => {
  const [workload, setWorkload] = useState<TelemetryWorkload>(defaultWorkload);
  const [threadCount, setThreadCount] = useState<number>(6);
  const [forceBlocked, setForceBlocked] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [tickPhase, setTickPhase] = useState<number>(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Continuous animation phase for SVG data flow packets & dashed lines
  useEffect(() => {
    if (!isRunning || prefersReducedMotion) return;
    let rafId = 0;
    let lastTs = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      setTickPhase((prev) => (prev + dt) % 1000);
      rafId = window.requestAnimationFrame(loop);
    };
    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [isRunning, prefersReducedMotion]);

  // Periodic GIL owner slot index (switches every ~1.2s of simulation time)
  const activeGilLane = Math.floor(tickPhase / 1.2) % 4;
  const activeLockLane = Math.floor(tickPhase / 1.5) % 4;

  const { javaLanes, pythonLanes, javaSummary, pythonSummary } = useMemo(() => {
    const scaleFactor = threadCount / 4;

    const jLanes: LaneTelemetry[] = [0, 1, 2, 3].map((idx) => {
      if (forceBlocked && (idx === 1 || idx === 2)) {
        return {
          id: `java-t${idx + 1}`,
          label: `Java T-${idx + 1}`,
          state: 'BLOCKED',
          velocity: 0.12,
          throughputOps: 420,
          queueWaitMs: 38.4,
        };
      }
      if (workload === 'lock-contention') {
        const isOwner = idx === activeLockLane;
        return {
          id: `java-t${idx + 1}`,
          label: `Java T-${idx + 1}`,
          state: isOwner ? 'RUNNING' : 'BLOCKED',
          velocity: isOwner ? 0.92 : 0.16,
          throughputOps: isOwner ? Math.round(4600 * Math.min(1.4, scaleFactor)) : 540,
          queueWaitMs: isOwner ? 1.8 : 24.5,
        };
      }
      if (workload === 'io-bound') {
        const parked = idx === (activeLockLane + 2) % 4;
        return {
          id: `java-t${idx + 1}`,
          label: `Java VT-${idx + 1}`,
          state: parked ? 'IO_WAIT' : 'RUNNING',
          velocity: parked ? 0.45 : 1.0,
          throughputOps: Math.round((parked ? 3100 : 6200) * Math.min(2.2, scaleFactor)),
          queueWaitMs: parked ? 6.2 : 0.9,
        };
      }
      // CPU-bound: Java achieves true 4-core parallelism across OS threads
      return {
        id: `java-t${idx + 1}`,
        label: `Java Core-${idx + 1}`,
        state: 'RUNNING',
        velocity: 1.0,
        throughputOps: Math.round(5800 * Math.min(1.8, scaleFactor)),
        queueWaitMs: 0.6,
      };
    });

    const pLanes: LaneTelemetry[] = [0, 1, 2, 3].map((idx) => {
      if (forceBlocked) {
        const isOwner = idx === activeGilLane;
        return {
          id: `py-t${idx + 1}`,
          label: `Py T-${idx + 1}`,
          state: isOwner ? 'BLOCKED' : 'GIL_WAIT',
          velocity: 0.08,
          throughputOps: isOwner ? 310 : 120,
          queueWaitMs: isOwner ? 44.0 : 86.5,
        };
      }
      if (workload === 'cpu-bound') {
        // Only ONE Python thread executes bytecode under the GIL; the other 3 stall in GIL_WAIT
        const holdsGil = idx === activeGilLane;
        return {
          id: `py-t${idx + 1}`,
          label: `Py T-${idx + 1}`,
          state: holdsGil ? 'RUNNING' : 'GIL_WAIT',
          velocity: holdsGil ? 0.72 : 0.1,
          throughputOps: holdsGil ? 2650 : 140,
          queueWaitMs: holdsGil ? 4.8 : Number((18.5 * scaleFactor).toFixed(1)),
        };
      }
      if (workload === 'lock-contention') {
        const holdsBoth = idx === activeGilLane;
        return {
          id: `py-t${idx + 1}`,
          label: `Py T-${idx + 1}`,
          state: holdsBoth ? 'RUNNING' : 'BLOCKED',
          velocity: holdsBoth ? 0.62 : 0.09,
          throughputOps: holdsBoth ? 2100 : 110,
          queueWaitMs: holdsBoth ? 7.4 : Number((29.2 * scaleFactor).toFixed(1)),
        };
      }
      // I/O-bound: CPython releases the GIL during socket/file syscalls so pipelines flow fast
      const onSocket = idx !== activeGilLane;
      return {
        id: `py-t${idx + 1}`,
        label: `Py T-${idx + 1}`,
        state: onSocket ? 'IO_WAIT' : 'RUNNING',
        velocity: onSocket ? 0.68 : 0.88,
        throughputOps: Math.round((onSocket ? 2800 : 3900) * Math.min(1.8, scaleFactor)),
        queueWaitMs: onSocket ? 5.1 : 2.3,
      };
    });

    const javaTotalOps = jLanes.reduce((sum, l) => sum + l.throughputOps, 0);
    const pyTotalOps = pLanes.reduce((sum, l) => sum + l.throughputOps, 0);
    const javaAvgWait = Number(
      (jLanes.reduce((sum, l) => sum + l.queueWaitMs, 0) / jLanes.length).toFixed(1)
    );
    const pyAvgWait = Number(
      (pLanes.reduce((sum, l) => sum + l.queueWaitMs, 0) / pLanes.length).toFixed(1)
    );
    const speedup = Number((javaTotalOps / Math.max(1, pyTotalOps)).toFixed(2));

    return {
      javaLanes: jLanes,
      pythonLanes: pLanes,
      javaSummary: {
        totalOps: javaTotalOps,
        avgWaitMs: javaAvgWait,
        activeCount: jLanes.filter((l) => l.state === 'RUNNING').length,
      },
      pythonSummary: {
        totalOps: pyTotalOps,
        avgWaitMs: pyAvgWait,
        activeCount: pLanes.filter((l) => l.state === 'RUNNING').length,
        speedup,
      },
    };
  }, [workload, threadCount, forceBlocked, activeGilLane, activeLockLane]);

  const renderPipelineSvg = (
    lanes: LaneTelemetry[],
    accent: 'java' | 'python',
    gateLabel: string,
    gateConstrained: boolean
  ) => {
    return (
      <svg
        viewBox="0 0 460 180"
        role="img"
        aria-label={`${accent === 'java' ? 'Java' : 'Python'} animated thread data flow pipelines`}
        className="w-full h-auto"
      >
        {/* Stage Column Labels */}
        <text x="48" y="14" textAnchor="middle" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400">
          INGRESS
        </text>
        <text x="230" y="14" textAnchor="middle" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400">
          {gateLabel}
        </text>
        <text x="412" y="14" textAnchor="middle" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400">
          SINK / OUT
        </text>

        {/* Central Concurrency Gate / Scheduler Box */}
        <rect
          x="184"
          y="20"
          width="92"
          height="146"
          rx="8"
          className={
            gateConstrained
              ? 'fill-amber-50/70 dark:fill-amber-950/35 stroke-amber-400 dark:stroke-amber-700'
              : 'fill-sky-50/60 dark:fill-sky-950/30 stroke-sky-300 dark:stroke-sky-800'
          }
          strokeWidth="1.2"
          strokeDasharray={gateConstrained ? '4 3' : undefined}
        />

        {/* Animated Data Flow Pipelines (velocity slows dramatically when thread is blocked) */}
        {lanes.map((lane, idx) => {
          const y = LANE_Y[idx];
          const isSlowed = lane.state === 'BLOCKED' || lane.state === 'GIL_WAIT';
          const strokeColor = isSlowed
            ? '#d97706'
            : lane.state === 'IO_WAIT'
              ? '#6366f1'
              : accent === 'java'
                ? '#0284c7'
                : '#10b981';

          // Line dash offset moves proportionally to lane.velocity (slower when blocked!)
          const dashOffset = prefersReducedMotion ? 0 : -(tickPhase * 46 * lane.velocity);
          // 2 packets per lane advancing at lane.velocity
          const p1 = prefersReducedMotion ? 0.28 : (tickPhase * 0.42 * lane.velocity + idx * 0.21) % 1;
          const p2 = prefersReducedMotion ? 0.74 : (tickPhase * 0.42 * lane.velocity + idx * 0.21 + 0.5) % 1;

          const startX = 90;
          const endX = 368;
          const span = endX - startX;

          return (
            <g key={lane.id}>
              {/* Source Thread Badge */}
              <rect
                x="8"
                y={y - 12}
                width="80"
                height="24"
                rx="6"
                className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1"
              />
              <text
                x="48"
                y={y + 3}
                textAnchor="middle"
                className="text-[10px] font-mono font-semibold fill-slate-800 dark:fill-slate-200"
              >
                {lane.label}
              </text>

              {/* Base Track Line */}
              <line
                x1={startX}
                y1={y}
                x2={endX}
                y2={y}
                stroke={strokeColor}
                strokeWidth={isSlowed ? 1.5 : 2.2}
                strokeOpacity={isSlowed ? 0.45 : 0.35}
              />

              {/* Animated Flowing Pipeline Line (slows down visibly when blocked) */}
              <line
                x1={startX}
                y1={y}
                x2={endX}
                y2={y}
                stroke={strokeColor}
                strokeWidth={isSlowed ? 2 : 2.5}
                strokeDasharray={isSlowed ? '4 8' : '10 6'}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />

              {/* Traveling Data Packets */}
              {[p1, p2].map((prog, pIdx) => {
                const cx = startX + prog * span;
                return (
                  <g key={pIdx} transform={`translate(${cx}, ${y})`}>
                    <circle
                      r={isSlowed ? 3.5 : 4.5}
                      fill={strokeColor}
                      stroke="#ffffff"
                      strokeWidth="1.3"
                    />
                  </g>
                );
              })}

              {/* Center State Indicator inside Scheduler/GIL Column */}
              <rect
                x="194"
                y={y - 10}
                width="72"
                height="20"
                rx="4"
                className={
                  isSlowed
                    ? 'fill-amber-100 dark:fill-amber-950/90 stroke-amber-400 dark:stroke-amber-700'
                    : lane.state === 'IO_WAIT'
                      ? 'fill-indigo-100 dark:fill-indigo-950/80 stroke-indigo-300 dark:stroke-indigo-700'
                      : 'fill-emerald-100 dark:fill-emerald-950/80 stroke-emerald-400 dark:stroke-emerald-700'
                }
                strokeWidth="1"
              />
              <text
                x="230"
                y={y + 3}
                textAnchor="middle"
                className={`text-[9px] font-mono font-semibold ${
                  isSlowed
                    ? 'fill-amber-900 dark:fill-amber-200'
                    : lane.state === 'IO_WAIT'
                      ? 'fill-indigo-900 dark:fill-indigo-200'
                      : 'fill-emerald-900 dark:fill-emerald-200'
                }`}
              >
                {lane.state}
              </text>

              {/* Sink Throughput Readout */}
              <rect
                x="370"
                y={y - 12}
                width="82"
                height="24"
                rx="6"
                className="fill-slate-50 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              <text
                x="411"
                y={y + 3}
                textAnchor="middle"
                className="text-[9.5px] font-mono tabular-nums fill-slate-700 dark:fill-slate-300"
              >
                {lane.throughputOps.toLocaleString()} op/s
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <section
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${
        mode === 'overlay' ? 'p-4 sm:p-5 shadow-sm' : 'p-4 sm:p-5'
      } space-y-4`}
      aria-label="Thread Telemetry Overlay and Data Flow Pipelines"
    >
      {/* Top Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              Live Thread Telemetry Overlay &amp; Data Flow Pipelines
            </span>
            <span aria-hidden="true">·</span>
            <span>Pipeline lines slow down automatically when a thread blocks or waits on the GIL</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Compare high-concurrency Java multi-core execution against CPython&apos;s Global Interpreter Lock (GIL) in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentedTabBar<TelemetryWorkload>
            ariaLabel="Select pipeline workload profile"
            activeTab={workload}
            onChange={setWorkload}
            size="xs"
            tabs={[
              { id: 'cpu-bound', label: 'CPU-Bound' },
              { id: 'io-bound', label: 'I/O-Bound' },
              { id: 'lock-contention', label: 'Lock Contention' },
            ]}
          />

          <button
            type="button"
            onClick={() => setForceBlocked((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              forceBlocked
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-amber-500'
            }`}
          >
            {forceBlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                Release Block
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                Simulate Thread Block
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsRunning((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
          >
            {isRunning ? (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {isRunning ? 'Pause' : 'Resume'}
          </button>

          {mode === 'overlay' && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close telemetry overlay"
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Concurrency Slider + Speedup Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs">
        <label className="flex items-center gap-3 min-w-[220px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            <Sliders className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            Active Threads:
            <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
              {threadCount}
            </span>
          </span>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={threadCount}
            onChange={(e) => setThreadCount(Number(e.target.value))}
            className="w-28 sm:w-36 accent-sky-600"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] tabular-nums">
          <span className="text-slate-600 dark:text-slate-400">
            Java Throughput:{' '}
            <strong className="text-sky-700 dark:text-sky-400">
              {javaSummary.totalOps.toLocaleString()} op/s
            </strong>
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Python GIL Throughput:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400">
              {pythonSummary.totalOps.toLocaleString()} op/s
            </strong>
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            Java / Python Ratio:{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              {pythonSummary.speedup}x
            </strong>
          </span>
        </div>
      </div>

      {/* Dual Side-by-Side Animated Data Flow Pipelines */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Java JVM Pipeline */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Java JVM · Multi-Core Parallel Pipelines
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
              <span>{javaSummary.activeCount}/4 Running</span>
              <span>Wait {javaSummary.avgWaitMs}ms</span>
            </div>
          </div>

          {renderPipelineSvg(
            javaLanes,
            'java',
            workload === 'io-bound' ? 'LOOM CARRIERS' : '4 OS CORES',
            forceBlocked || workload === 'lock-contention'
          )}

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-5">
            {workload === 'cpu-bound' && !forceBlocked
              ? 'All 4 pipelines stream at full velocity across physical CPU cores—no global interpreter lock serializes bytecode.'
              : workload === 'io-bound' && !forceBlocked
                ? 'Java 21 Virtual Threads unmount during blocking I/O so carrier pipelines stay saturated without stalling other requests.'
                : 'Only threads contending on the same monitor/lock slow down; independent lanes keep streaming smoothly.'}
          </p>
        </div>

        {/* Python CPython GIL Pipeline */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              Python (CPython) · Single-Owner GIL Pipeline
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
              <span>{pythonSummary.activeCount}/4 Running</span>
              <span>Wait {pythonSummary.avgWaitMs}ms</span>
            </div>
          </div>

          {renderPipelineSvg(
            pythonLanes,
            'python',
            workload === 'io-bound' ? 'GIL RELEASED (I/O)' : 'GIL MUTEX GATE',
            workload !== 'io-bound' || forceBlocked
          )}

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-5">
            {workload === 'cpu-bound' && !forceBlocked
              ? 'Notice 3 lanes crawl in amber GIL_WAIT while only 1 thread executes Python bytecode—use ProcessPoolExecutor or Python 3.13t No-GIL for CPU-bound scale.'
              : workload === 'io-bound' && !forceBlocked
                ? 'During network/disk syscalls CPython releases the GIL, allowing multiple I/O pipelines to overlap efficiently (or use asyncio).'
                : 'App-level Lock contention stacks on top of GIL acquisition, causing severe pipeline deceleration across queued threads.'}
          </p>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            Fast solid-dash stream = Running on CPU core
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Slow sparse amber stream = Blocked / Waiting on Lock or GIL
          </span>
        </div>
        <span className="font-mono text-[10px]">
          5ms CPython switch interval · JVM preemptive OS scheduler
        </span>
      </div>
    </section>
  );
};
