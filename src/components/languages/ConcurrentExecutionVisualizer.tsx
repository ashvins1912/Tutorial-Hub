import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Workflow,
} from 'lucide-react';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { SegmentedTabBar } from '../ui';
import { ThreadTelemetryOverlay } from './ThreadTelemetryOverlay';

type ThreadLifecycleState = 'NEW' | 'RUNNABLE' | 'RUNNING' | 'WAITING' | 'TERMINATED';
type RuntimeComparisonMode = 'java-jvm' | 'python-gil' | 'side-by-side';

interface LifecyclePhaseInfo {
  id: ThreadLifecycleState;
  label: string;
  javaTrigger: string;
  pythonTrigger: string;
  javaContextDetail: string;
  pythonGilDetail: string;
  transitionNote: string;
  cpuUtilizationJava: number;
  cpuUtilizationPython: number;
  contextSwitchUsJava: number;
  contextSwitchUsPython: number;
}

const LIFECYCLE_PHASES: LifecyclePhaseInfo[] = [
  {
    id: 'NEW',
    label: 'New (Allocated)',
    javaTrigger: 'new Thread(task) or Thread.ofVirtual().unstarted(task)',
    pythonTrigger: 't = threading.Thread(target=worker)',
    javaContextDetail:
      'JVM allocates the Java Thread object on the heap. No OS thread or stack memory is scheduled yet until start() is invoked.',
    pythonGilDetail:
      'CPython creates a Thread wrapper object in Python memory; OS pthread is not spawned until t.start() runs.',
    transitionNote: 'Calling start() moves the thread into the OS/JVM scheduler queue (Runnable).',
    cpuUtilizationJava: 4,
    cpuUtilizationPython: 4,
    contextSwitchUsJava: 0,
    contextSwitchUsPython: 0,
  },
  {
    id: 'RUNNABLE',
    label: 'Runnable (Ready Queue)',
    javaTrigger: 'thread.start() -> JVM & OS Ready Queue',
    pythonTrigger: 't.start() -> OS Ready Queue + awaits GIL acquisition',
    javaContextDetail:
      'Thread sits in the OS scheduler run-queue ready for any free CPU core. Multiple Runnable Java threads can be dispatched simultaneously onto separate cores.',
    pythonGilDetail:
      'Even if 4 OS CPU cores are idle, a Runnable CPython thread cannot execute Python bytecode until it acquires the single process-wide GIL mutex.',
    transitionNote: 'Scheduler selects the thread and grants a CPU time quantum -> Running.',
    cpuUtilizationJava: 42,
    cpuUtilizationPython: 24,
    contextSwitchUsJava: 3.2,
    contextSwitchUsPython: 11.8,
  },
  {
    id: 'RUNNING',
    label: 'Running (Executing on CPU)',
    javaTrigger: 'OS Thread / Loom Carrier executes bytecode & JIT native code',
    pythonTrigger: 'Holds GIL -> CPython Eval Loop executes bytecode (5ms slice)',
    javaContextDetail:
      'HotSpot JIT compiles hot loops to native x86/ARM instructions across all cores in parallel. Thread-local stack frames run independently without a global lock.',
    pythonGilDetail:
      'The single GIL owner executes Python bytecode. After sys.getswitchinterval() (5ms default), another thread sets gil_drop_request to force a GIL handoff.',
    transitionNote: 'Blocking on I/O, lock.lock(), wait(), or time.sleep() parks the thread -> Waiting.',
    cpuUtilizationJava: 96,
    cpuUtilizationPython: 27,
    contextSwitchUsJava: 4.5,
    contextSwitchUsPython: 28.4,
  },
  {
    id: 'WAITING',
    label: 'Waiting / Blocked',
    javaTrigger: 'Object.wait() / LockSupport.park() / synchronized / Socket I/O',
    pythonTrigger: 'lock.acquire() / queue.get() / time.sleep() / Socket I/O',
    javaContextDetail:
      'Platform threads block their OS thread; Java 21 Virtual Threads unmount cleanly from their carrier thread so another virtual thread runs immediately.',
    pythonGilDetail:
      'Blocking I/O and C extensions (NumPy, socket recv) release the GIL so another Python thread can run; pure Python lock contention stalls both the app lock and GIL.',
    transitionNote: 'Lock release, notifyAll(), or I/O readiness wakes the thread -> Runnable (or completes -> Terminated).',
    cpuUtilizationJava: 78,
    cpuUtilizationPython: 54,
    contextSwitchUsJava: 2.1,
    contextSwitchUsPython: 14.6,
  },
  {
    id: 'TERMINATED',
    label: 'Terminated (Completed)',
    javaTrigger: 'run() returns or uncaught exception exits -> GC reclaims stack',
    pythonTrigger: 'target() returns -> GIL released & OS thread joined/reaped',
    javaContextDetail:
      'Thread releases monitors, notifies any join() callers, and becomes eligible for garbage collection. Cannot be restarted.',
    pythonGilDetail:
      'Thread drops the GIL for the final time, signals t.join() waiters, and cleans up its PyThreadState frame.',
    transitionNote: 'Lifecycle complete. Loop restarts at New to simulate the next request/worker.',
    cpuUtilizationJava: 8,
    cpuUtilizationPython: 6,
    contextSwitchUsJava: 1.1,
    contextSwitchUsPython: 3.4,
  },
];

function buildThreadLifecycleMermaid(
  activeState: ThreadLifecycleState,
  runtimeMode: RuntimeComparisonMode
): string {
  const runningLabel =
    runtimeMode === 'python-gil'
      ? 'Running: Holds CPython GIL (1 Core / 5ms Slice)'
      : runtimeMode === 'java-jvm'
        ? 'Running: JVM Preemptive Multi-Core / Loom Carrier'
        : 'Running: Java Multi-Core vs Python Single-GIL';

  const waitingLabel =
    runtimeMode === 'python-gil'
      ? 'Waiting / Blocked: Releases GIL on I/O or Waits on Lock'
      : runtimeMode === 'java-jvm'
        ? 'Waiting / Blocked: Park / Monitor Wait / Loom Unmount'
        : 'Waiting / Blocked: Lock, I/O, or GIL Contention';

  const lines = [
    'flowchart LR',
    '  NEW["1. NEW<br/>Thread Object Allocated"]',
    '  RUNNABLE["2. RUNNABLE<br/>Ready Queue / Scheduler"]',
    `  RUNNING["3. RUNNING<br/>${runningLabel}"]`,
    `  WAITING["4. WAITING / BLOCKED<br/>${waitingLabel}"]`,
    '  TERMINATED["5. TERMINATED<br/>Stack Reaped / join() Signaled"]',
    '  NEW -->|"start()"| RUNNABLE',
    '  RUNNABLE -->|"Dispatch / Acquire CPU or GIL"| RUNNING',
    '  RUNNING -->|"Time Slice / Preempt / GIL Drop"| RUNNABLE',
    '  RUNNING -->|"I/O, wait(), Lock, sleep()"| WAITING',
    '  WAITING -->|"I/O Ready / notify() / Unlock"| RUNNABLE',
    '  RUNNING -->|"run() exits"| TERMINATED',
  ];

  // Highlight active lifecycle state node
  const styleMap: Record<ThreadLifecycleState, string> = {
    NEW: 'style NEW fill:#0284c7,stroke:#0369a1,color:#ffffff',
    RUNNABLE: 'style RUNNABLE fill:#0284c7,stroke:#0369a1,color:#ffffff',
    RUNNING: 'style RUNNING fill:#059669,stroke:#047857,color:#ffffff',
    WAITING: 'style WAITING fill:#d97706,stroke:#b45309,color:#ffffff',
    TERMINATED: 'style TERMINATED fill:#475569,stroke:#334155,color:#ffffff',
  };

  lines.push(`  ${styleMap[activeState]}`);
  return lines.join('\n');
}

interface SwitchEvent {
  tick: number;
  javaEvent: string;
  pythonEvent: string;
  javaThreadsRunning: string[];
  pythonGilOwner: string;
  pythonWaiting: string[];
}

const SWITCH_EVENTS: SwitchEvent[] = [
  {
    tick: 1,
    javaEvent: 'Core-0 runs T1, Core-1 runs T2, Core-2 runs T3, Core-3 runs T4 simultaneously',
    pythonEvent: 'T1 acquires GIL (0ms); T2, T3, T4 park on GIL condition variable',
    javaThreadsRunning: ['T1', 'T2', 'T3', 'T4'],
    pythonGilOwner: 'T1',
    pythonWaiting: ['T2', 'T3', 'T4'],
  },
  {
    tick: 2,
    javaEvent: 'T2 hits DB socket read -> Loom unmounts T2; Core-1 immediately mounts T5',
    pythonEvent: '5ms switch interval elapsed -> T1 sets drop flag and hands GIL to T2',
    javaThreadsRunning: ['T1', 'T5', 'T3', 'T4'],
    pythonGilOwner: 'T2',
    pythonWaiting: ['T1', 'T3', 'T4'],
  },
  {
    tick: 3,
    javaEvent: 'T3 acquires ReentrantLock; T4 continues independent work on Core-3 unblocked',
    pythonEvent: 'T2 calls socket.recv() -> releases GIL -> T3 grabs GIL for JSON parsing',
    javaThreadsRunning: ['T1', 'T5', 'T3', 'T4'],
    pythonGilOwner: 'T3',
    pythonWaiting: ['T1', 'T4'],
  },
  {
    tick: 4,
    javaEvent: 'DB response returns -> T2 moves WAITING -> RUNNABLE -> resumes on Core-0',
    pythonEvent: 'T3 CPU loop hits 5ms cap -> GIL convoy contention stalls T4 before handoff',
    javaThreadsRunning: ['T2', 'T5', 'T3', 'T4'],
    pythonGilOwner: 'T4',
    pythonWaiting: ['T1', 'T2', 'T3'],
  },
];

export const ConcurrentExecutionVisualizer: React.FC = () => {
  const [phaseIdx, setPhaseIdx] = useState<number>(2); // Start on RUNNING so users see active execution immediately
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(2200);
  const [runtimeMode, setRuntimeMode] = useState<RuntimeComparisonMode>('side-by-side');
  const [showLiveTraffic, setShowLiveTraffic] = useState<boolean>(true);
  const [switchIdx, setSwitchIdx] = useState<number>(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setPhaseIdx((prev) => (prev + 1) % LIFECYCLE_PHASES.length);
      setSwitchIdx((prev) => (prev + 1) % SWITCH_EVENTS.length);
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, prefersReducedMotion]);

  const activePhase = LIFECYCLE_PHASES[phaseIdx];
  const activeSwitch = SWITCH_EVENTS[switchIdx];

  const liveMermaidCode = useMemo(
    () => buildThreadLifecycleMermaid(activePhase.id, runtimeMode),
    [activePhase.id, runtimeMode]
  );

  const baseTrafficMermaid = useMemo(
    () => buildThreadLifecycleMermaid('RUNNING', runtimeMode),
    [runtimeMode]
  );

  return (
    <div className="space-y-5">
      {/* Studio Control Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Workflow className="w-3.5 h-3.5" aria-hidden="true" />
                Concurrent Execution Visualizer
              </span>
              <span aria-hidden="true">·</span>
              <span>Real-Time Mermaid Thread Lifecycle &amp; Java vs. Python GIL Context Switching</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
              Thread Lifecycle State Machine &amp; Live Context-Switch Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
              Watch threads transition across New, Runnable, Running, Waiting, and Terminated in real time, then toggle the Live Traffic telemetry view to compare JVM multi-core scheduling against CPython&apos;s GIL handoffs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <SegmentedTabBar<RuntimeComparisonMode>
              ariaLabel="Select runtime scheduler model"
              activeTab={runtimeMode}
              onChange={setRuntimeMode}
              size="xs"
              tabs={[
                { id: 'side-by-side', label: 'Java vs. Python GIL' },
                { id: 'java-jvm', label: 'Java JVM' },
                { id: 'python-gil', label: 'Python GIL' },
              ]}
            />

            <button
              type="button"
              onClick={() => setShowLiveTraffic((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                showLiveTraffic
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-sky-500'
              }`}
            >
              <Radio className="w-3.5 h-3.5" aria-hidden="true" />
              {showLiveTraffic ? 'Hide Live Traffic Telemetry' : 'Show Live Traffic Telemetry'}
            </button>
          </div>
        </div>

        {/* Lifecycle State Stepper & Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {LIFECYCLE_PHASES.map((phase, idx) => {
              const active = idx === phaseIdx;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setPhaseIdx(idx);
                  }}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? phase.id === 'RUNNING'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : phase.id === 'WAITING'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {idx + 1}. {phase.id}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 whitespace-nowrap"
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
              aria-label="Previous lifecycle state"
              onClick={() => {
                setIsPlaying(false);
                setPhaseIdx((p) => (p - 1 + LIFECYCLE_PHASES.length) % LIFECYCLE_PHASES.length);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next lifecycle state"
              onClick={() => {
                setIsPlaying(false);
                setPhaseIdx((p) => (p + 1) % LIFECYCLE_PHASES.length);
                setSwitchIdx((p) => (p + 1) % SWITCH_EVENTS.length);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Reset lifecycle"
              onClick={() => {
                setIsPlaying(false);
                setPhaseIdx(0);
                setSwitchIdx(0);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <select
              aria-label="Playback speed"
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300"
            >
              <option value={3200}>0.7x Slow</option>
              <option value={2200}>1.0x Normal</option>
              <option value={1300}>1.7x Fast</option>
            </select>
          </div>
        </div>
      </section>

      {/* Real-Time Synced Mermaid Thread Lifecycle Diagram */}
      <FlightMermaidViewer
        title={`Thread Lifecycle Real-Time State Machine — Active: ${activePhase.label}`}
        subtitle={activePhase.transitionNote}
        mermaidCode={liveMermaidCode}
        trafficDomain="system-design"
        compact
      />

      {/* Active State Runtime Comparison Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(runtimeMode === 'side-by-side' || runtimeMode === 'java-jvm') && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                Java (JVM &amp; Project Loom) · {activePhase.id}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                CPU {activePhase.cpuUtilizationJava}% · Switch {activePhase.contextSwitchUsJava}µs
              </span>
            </div>
            <div className="rounded-lg bg-slate-950 px-3 py-2 font-mono text-[11px] text-sky-300 border border-slate-800">
              {activePhase.javaTrigger}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
              {activePhase.javaContextDetail}
            </p>
          </div>
        )}

        {(runtimeMode === 'side-by-side' || runtimeMode === 'python-gil') && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Python (CPython GIL) · {activePhase.id}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                CPU {activePhase.cpuUtilizationPython}% · Switch {activePhase.contextSwitchUsPython}µs
              </span>
            </div>
            <div className="rounded-lg bg-slate-950 px-3 py-2 font-mono text-[11px] text-emerald-300 border border-slate-800">
              {activePhase.pythonTrigger}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
              {activePhase.pythonGilDetail}
            </p>
          </div>
        )}
      </section>

      {/* Toggleable Live Traffic Telemetry View: Context Switching + Animated Data Flow Pipelines + Live Traffic Flow */}
      {showLiveTraffic && (
        <div className="space-y-4">
          {/* Context-Switch Quantum Trace Strip */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Live Thread Context-Switch Telemetry (Quantum Tick #{activeSwitch.tick})
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Java 4-Core Parallelism vs. Python Single-GIL Handoff
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-700 dark:text-sky-400">
                    Java OS / Carrier Cores Active
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-emerald-700 dark:text-emerald-400">
                    {activeSwitch.javaThreadsRunning.join(' · ')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-5">
                  {activeSwitch.javaEvent}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    Python GIL Owner: {activeSwitch.pythonGilOwner}
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-amber-700 dark:text-amber-400">
                    Waiting: {activeSwitch.pythonWaiting.join(', ')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-5">
                  {activeSwitch.pythonEvent}
                </p>
              </div>
            </div>
          </section>

          {/* Animated Data Flow Pipelines (slow down when threads block) */}
          <ThreadTelemetryOverlay mode="inline" defaultWorkload="cpu-bound" />

          {/* Generic Live Traffic Flow Simulator wired to the Thread Lifecycle Mermaid DFD */}
          <LiveTrafficFlowSimulator
            mermaidCode={baseTrafficMermaid}
            mermaidTitle="Thread Lifecycle Execution Traffic"
            domain="system-design"
            compact
            heading="Live Thread State-Transition Packet Traffic Simulator"
          />
        </div>
      )}
    </div>
  );
};
