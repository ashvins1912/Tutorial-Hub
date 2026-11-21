import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  GitBranch,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import type { LangTrack } from '../../data/languagesTutorialData';
import {
  LANG_CONCURRENCY_EXCEPTIONS_MODULES,
  type ConceptDfdEdge,
  type ConceptDfdNode,
  type ConceptDfdStep,
  type LangDeepDiveModule,
  type MasteryTrackGroup,
} from '../../data/langConcurrencyExceptionsData';
import { CopyButton, SegmentedTabBar } from '../ui';

export interface ConcurrencyExceptionsDeepDiveProps {
  languageFilter: 'all' | LangTrack;
}

/* ============================================================================
   ANIMATED CONCEPT DFD ENGINE
   ============================================================================ */

interface ConceptDfdStageProps {
  title: string;
  nodes: ConceptDfdNode[];
  edges: ConceptDfdEdge[];
  steps: ConceptDfdStep[];
  resetKey: string;
}

function ConceptDfdStage({ title, nodes, edges, steps, resetKey }: ConceptDfdStageProps) {
  const markerPrefix = useId().replace(/:/g, '');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [packetT, setPacketT] = useState(0.5);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
    setPacketT(0.5);
  }, [resetKey]);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (reducedMotion) {
      setPacketT(0.55);
      const timer = window.setInterval(() => {
        setStepIdx((prev) => (prev + 1) % steps.length);
      }, 2500);
      return () => window.clearInterval(timer);
    }

    lastTimeRef.current = performance.now();
    let localT = 0;
    const tick = (now: number) => {
      const dt = Math.min(80, now - lastTimeRef.current);
      lastTimeRef.current = now;
      localT += dt / 2300;
      if (localT >= 1) {
        localT = 0;
        setStepIdx((prev) => (prev + 1) % steps.length);
      }
      setPacketT(localT);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, reducedMotion, steps.length]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, ConceptDfdNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const currentStep = steps[stepIdx] ?? steps[0];
  const activeNodes = new Set(currentStep?.activeNodeIds ?? []);
  const activeEdges = new Set(currentStep?.activeEdgeIds ?? []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Execution Flow Animation (DFD)
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play Flow'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => (p - 1 + steps.length) % steps.length);
              setPacketT(0.55);
            }}
            aria-label="Previous step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
            {stepIdx + 1}/{steps.length}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => (p + 1) % steps.length);
              setPacketT(0.55);
            }}
            aria-label="Next step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
              setPacketT(0.5);
            }}
            aria-label="Reset animation"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 668 220"
            className="w-full min-w-[540px] h-auto max-h-[235px]"
            role="img"
            aria-label={`Execution flow diagram for ${title}`}
          >
            <defs>
              <marker
                id={`${markerPrefix}-idle`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
              </marker>
              <marker
                id={`${markerPrefix}-active`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;
              const x1 = from.x + ux * 64;
              const y1 = from.y + uy * 26;
              const x2 = to.x - ux * 68;
              const y2 = to.y - uy * 26;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2 - 11;
              const isActive = activeEdges.has(edge.id);
              const px = x1 + (x2 - x1) * packetT;
              const py = y1 + (y2 - y1) * packetT;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? undefined : '4 4'}
                    markerEnd={`url(#${markerPrefix}-${isActive ? 'active' : 'idle'})`}
                    className={
                      isActive
                        ? 'stroke-sky-600 dark:stroke-sky-400'
                        : 'stroke-slate-300 dark:stroke-slate-700'
                    }
                  />
                  <rect
                    x={midX - 48}
                    y={midY - 8.5}
                    width={96}
                    height={16}
                    rx={4}
                    strokeWidth={1}
                    className={
                      isActive
                        ? 'fill-sky-50 dark:fill-sky-950/90 stroke-sky-300 dark:stroke-sky-700'
                        : 'fill-white/95 dark:fill-slate-900/95 stroke-slate-200 dark:stroke-slate-800'
                    }
                  />
                  <text
                    x={midX}
                    y={midY + 2}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[8.5px] font-mono font-semibold fill-sky-800 dark:fill-sky-300'
                        : 'text-[8.5px] font-mono fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {edge.label}
                  </text>
                  {isActive && (
                    <g>
                      <circle
                        cx={px}
                        cy={py}
                        r={5.5}
                        className="fill-sky-600 dark:fill-sky-400 stroke-white dark:stroke-slate-950"
                        strokeWidth={2}
                      />
                      <g transform={`translate(${px}, ${py - 14})`}>
                        <rect
                          x={-46}
                          y={-8.5}
                          width={92}
                          height={15}
                          rx={4}
                          className="fill-slate-900 dark:fill-sky-500"
                        />
                        <text
                          x={0}
                          y={2}
                          textAnchor="middle"
                          className="text-[8px] font-mono font-bold fill-white dark:fill-slate-950"
                        >
                          {currentStep.packetLabel.slice(0, 16)}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}

            {nodes.map((node) => {
              const isActive = activeNodes.has(node.id);
              const w = 132;
              const h = 52;
              return (
                <g key={node.id} transform={`translate(${node.x - w / 2}, ${node.y - h / 2})`}>
                  <rect
                    width={w}
                    height={h}
                    rx={9}
                    strokeWidth={isActive ? 2 : 1.2}
                    className={
                      isActive
                        ? 'fill-sky-50 dark:fill-sky-950/75 stroke-sky-600 dark:stroke-sky-400'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                    }
                  />
                  <text
                    x={w / 2}
                    y={22}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[10.5px] font-bold fill-slate-900 dark:fill-white'
                        : 'text-[10.5px] font-semibold fill-slate-800 dark:fill-slate-200'
                    }
                  >
                    {node.label}
                  </text>
                  <text
                    x={w / 2}
                    y={39}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[9px] font-mono fill-sky-700 dark:fill-sky-300'
                        : 'text-[9px] font-mono fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {currentStep && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-5">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                Step {currentStep.step} — Simple English
              </div>
              <p className="text-slate-700 dark:text-slate-300">{currentStep.plainEnglish}</p>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
              <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mb-1">
                JVM &amp; CPython Runtime Detail
              </div>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                {currentStep.technicalDetail}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   LIVE INTERACTIVE THREADPOOL + COMPLETABLEFUTURE / ASYNCIO DAG SIMULATOR
   ============================================================================ */

interface PoolTask {
  id: string;
  progress: number;
}

type DagStageStatus = 'idle' | 'running' | 'done' | 'failed' | 'recovered';

function LiveConcurrencyPipelineSimulator() {
  const [simMode, setSimMode] = useState<'threadpool' | 'completable-dag'>('completable-dag');

  // --- ThreadPoolExecutor state ---
  const [coreThreads, setCoreThreads] = useState<number>(3);
  const [queueCap, setQueueCap] = useState<number>(4);
  const [rejectionPolicy, setRejectionPolicy] = useState<'AbortPolicy' | 'CallerRunsPolicy'>('CallerRunsPolicy');
  const [workers, setWorkers] = useState<(PoolTask | null)[]>([
    { id: 'T1', progress: 50 },
    null,
    null,
  ]);
  const [taskQueue, setTaskQueue] = useState<string[]>(['T2']);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [nextTaskId, setNextTaskId] = useState<number>(3);
  const [poolLog, setPoolLog] = useState<string>(
    'ThreadPoolExecutor ready (core=3, queueCap=4). Submit a burst of tasks to watch queue filling and Rejection Policy backpressure!'
  );

  // Sync worker array length when coreThreads changes
  useEffect(() => {
    setWorkers((prev) => {
      const next: (PoolTask | null)[] = Array(coreThreads).fill(null);
      for (let i = 0; i < Math.min(prev.length, coreThreads); i++) next[i] = prev[i];
      return next;
    });
  }, [coreThreads]);

  // --- CompletableFuture / asyncio.TaskGroup DAG state ---
  const [dagTick, setDagTick] = useState<number>(0);
  const [injectError, setInjectError] = useState<boolean>(false);
  const [dagLog, setDagLog] = useState<string>(
    'Click "Step Async DAG" to trace supplyAsync -> parallel thenCompose (Orders || Credit) -> thenCombine -> exceptionally() / except* recovery!'
  );

  const handleSubmitTasks = (count: number) => {
    const nextWorkers = workers.map((w) => (w ? { ...w } : null));
    const nextQueue = [...taskQueue];
    let seq = nextTaskId;
    let addedWorkers = 0;
    let queued = 0;
    let callerRan = 0;
    let aborted = 0;

    for (let i = 0; i < count; i++) {
      const tid = `T${seq++}`;
      const idleIdx = nextWorkers.findIndex((w) => w === null);
      if (idleIdx >= 0) {
        nextWorkers[idleIdx] = { id: tid, progress: 25 };
        addedWorkers++;
      } else if (nextQueue.length < queueCap) {
        nextQueue.push(tid);
        queued++;
      } else if (rejectionPolicy === 'CallerRunsPolicy') {
        callerRan++;
      } else {
        aborted++;
      }
    }

    setWorkers(nextWorkers);
    setTaskQueue(nextQueue);
    setNextTaskId(seq);
    if (callerRan > 0) setCompletedCount((c) => c + callerRan);
    if (aborted > 0) setRejectedCount((r) => r + aborted);

    setPoolLog(
      aborted > 0
        ? `RejectedExecutionException (AbortPolicy)! Queue full (${queueCap}/${queueCap}): ${aborted} task(s) rejected; ${addedWorkers} started, ${queued} queued.`
        : callerRan > 0
        ? `CallerRunsPolicy BACKPRESSURE! Queue full -> caller thread synchronously executed ${callerRan} task(s) to slow submission.`
        : `Dispatched ${count} task(s): ${addedWorkers} assigned directly to idle core workers, ${queued} buffered in ArrayBlockingQueue.`
    );
  };

  const handlePoolTick = () => {
    const nextQueue = [...taskQueue];
    let doneNow = 0;
    const nextWorkers = workers.map((w) => {
      if (!w) {
        if (nextQueue.length > 0) {
          const pulled = nextQueue.shift()!;
          return { id: pulled, progress: 50 };
        }
        return null;
      }
      if (w.progress + 50 >= 100) {
        doneNow++;
        if (nextQueue.length > 0) {
          const pulled = nextQueue.shift()!;
          return { id: pulled, progress: 25 };
        }
        return null;
      }
      return { ...w, progress: w.progress + 50 };
    });
    setWorkers(nextWorkers);
    setTaskQueue(nextQueue);
    setCompletedCount((c) => c + doneNow);
    setPoolLog(
      doneNow > 0
        ? `Tick completed ${doneNow} task(s) and immediately polled waiting work from ArrayBlockingQueue!`
        : 'Tick advanced active worker tasks by 50%.'
    );
  };

  // Compute DAG statuses based on dagTick (0..4) and injectError
  const dagStages: {
    id: string;
    javaApi: string;
    pyApi: string;
    label: string;
    status: DagStageStatus;
  }[] = useMemo(() => {
    const s1: DagStageStatus = dagTick === 0 ? 'idle' : dagTick === 1 ? 'running' : 'done';
    const s2a: DagStageStatus = dagTick < 2 ? 'idle' : dagTick === 2 ? 'running' : 'done';
    const s2b: DagStageStatus =
      dagTick < 2
        ? 'idle'
        : dagTick === 2
        ? 'running'
        : injectError
        ? 'failed'
        : 'done';
    const s3: DagStageStatus =
      dagTick < 3
        ? 'idle'
        : dagTick === 3
        ? 'running'
        : injectError
        ? 'recovered'
        : 'done';
    const s4: DagStageStatus = dagTick < 4 ? 'idle' : 'done';

    return [
      { id: 'root', javaApi: 'supplyAsync(ioPool)', pyApi: 'await fetch_user()', label: '1. Fetch User', status: s1 },
      { id: 'orders', javaApi: 'thenCompose -> Orders', pyApi: 'tg.create_task(orders)', label: '2A. Fetch Orders (Parallel)', status: s2a },
      { id: 'credit', javaApi: 'thenCompose -> Credit', pyApi: 'tg.create_task(credit)', label: '2B. Credit Score (Parallel)', status: s2b },
      { id: 'combine', javaApi: 'thenCombine + exceptionally', pyApi: 'except* TimeoutError', label: '3. Join / Fallback', status: s3 },
      { id: 'done', javaApi: 'join() / HTTP 200', pyApi: 'return DashboardDTO', label: '4. Emit Response', status: s4 },
    ];
  }, [dagTick, injectError]);

  const handleDagAdvance = () => {
    const next = dagTick >= 4 ? 0 : dagTick + 1;
    setDagTick(next);
    if (next === 1) {
      setDagLog('Stage 1: supplyAsync(fetchUser, ioPool) running on non-blocking I/O worker (caller thread stays free!).');
    } else if (next === 2) {
      setDagLog('Stage 2: Fan-Out! Orders API and Credit Score API execute IN PARALLEL via thenCompose / asyncio.TaskGroup.');
    } else if (next === 3) {
      setDagLog(
        injectError
          ? 'Stage 3: Credit API threw TimeoutException! .exceptionally() / except* caught it cleanly and substituted fallback score=650 without crashing!'
          : 'Stage 3: Both parallel futures completed -> thenCombine() merged Orders + Credit=790 into DashboardDTO.'
      );
    } else if (next === 4) {
      setDagLog('Stage 4: Pipeline completed cleanly with full non-blocking throughput! Click Step to replay.');
    } else {
      setDagLog('Reset Async Pipeline DAG to idle.');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Interactive Concurrency &amp; Async Pipeline Simulator
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Simulate ThreadPoolExecutor Backpressure &amp; CompletableFuture / asyncio.TaskGroup DAGs
          </h3>
        </div>
        <SegmentedTabBar<'completable-dag' | 'threadpool'>
          ariaLabel="Concurrency simulator mode"
          activeTab={simMode}
          onChange={setSimMode}
          size="xs"
          tabs={[
            { id: 'completable-dag', label: 'CompletableFuture & asyncio DAG', icon: GitBranch },
            { id: 'threadpool', label: 'ThreadPoolExecutor & Queue', icon: Cpu },
          ]}
        />
      </div>

      <div className="p-4 space-y-4">
        {simMode === 'completable-dag' ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDagAdvance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Zap className="w-3.5 h-3.5" />
                {dagTick >= 4 ? 'Replay DAG' : `Step Async DAG (${dagTick}/4)`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInjectError((e) => !e);
                  setDagTick(0);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  injectError
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {injectError ? 'Failure Injected (Credit Timeout)' : 'Inject Timeout Exception'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDagTick(0);
                  setDagLog('Reset Async DAG to idle.');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {dagStages.map((st) => {
                const styleMap: Record<DagStageStatus, string> = {
                  idle: 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40',
                  running: 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/50',
                  done: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40',
                  failed: 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40',
                  recovered: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40',
                };
                const badgeText: Record<DagStageStatus, string> = {
                  idle: 'PENDING',
                  running: 'RUNNING',
                  done: 'COMPLETE',
                  failed: 'TIMEOUT ERR',
                  recovered: 'FALLBACK OK',
                };
                return (
                  <div key={st.id} className={`rounded-lg border p-3 space-y-1.5 ${styleMap[st.status]}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {st.label}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                      Java: {st.javaApi}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                      Py: {st.pyApi}
                    </div>
                    <div className="pt-1 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200">
                      State: {badgeText[st.status]}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {dagLog}
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSubmitTasks(1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit +1 Task
              </button>
              <button
                type="button"
                onClick={() => handleSubmitTasks(5)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Burst +5 Tasks
              </button>
              <button
                type="button"
                onClick={handlePoolTick}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white"
              >
                Step Execution Tick
              </button>

              <label className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                Core:
                <select
                  value={coreThreads}
                  onChange={(e) => setCoreThreads(Number(e.target.value))}
                  className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-1 text-xs"
                >
                  {[2, 3, 4, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                Queue Cap:
                <select
                  value={queueCap}
                  onChange={(e) => setQueueCap(Number(e.target.value))}
                  className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-1 text-xs"
                >
                  {[2, 4, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() =>
                  setRejectionPolicy((p) =>
                    p === 'CallerRunsPolicy' ? 'AbortPolicy' : 'CallerRunsPolicy'
                  )
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                Policy: {rejectionPolicy}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Bounded Queue */}
              <div className="lg:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    ArrayBlockingQueue
                  </span>
                  <span className="text-slate-500">
                    {taskQueue.length}/{queueCap} slots
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: queueCap }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-14 py-1.5 rounded border text-center font-mono text-xs ${
                        taskQueue[i]
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold'
                          : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {taskQueue[i] ?? '—'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Worker Pool */}
              <div className="lg:col-span-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Worker Threads ({workers.filter(Boolean).length}/{coreThreads} busy)
                  </span>
                  <span className="text-slate-500">
                    Completed: {completedCount} · Rejected: {rejectedCount}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {workers.map((w, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-2 font-mono text-xs ${
                        w
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/50'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          Worker-{idx + 1}
                        </span>
                        <span className={w ? 'text-sky-700 dark:text-sky-400 font-bold' : 'text-slate-400'}>
                          {w ? `${w.id} (${w.progress}%)` : 'IDLE'}
                        </span>
                      </div>
                      <div className="h-1.5 mt-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-sky-600 dark:bg-sky-400 transition-all"
                          style={{ width: `${w ? w.progress : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {poolLog}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export function ConcurrencyExceptionsDeepDive({
  languageFilter,
}: ConcurrencyExceptionsDeepDiveProps) {
  const [group, setGroup] = useState<'all' | MasteryTrackGroup>('all');
  const [selectedId, setSelectedId] = useState<string>(LANG_CONCURRENCY_EXCEPTIONS_MODULES[0].id);

  const visibleModules = useMemo(
    () =>
      group === 'all'
        ? LANG_CONCURRENCY_EXCEPTIONS_MODULES
        : LANG_CONCURRENCY_EXCEPTIONS_MODULES.filter((m) => m.group === group),
    [group]
  );

  const activeModule: LangDeepDiveModule =
    visibleModules.find((m) => m.id === selectedId) ?? visibleModules[0];

  useEffect(() => {
    if (!visibleModules.some((m) => m.id === selectedId) && visibleModules[0]) {
      setSelectedId(visibleModules[0].id);
    }
  }, [visibleModules, selectedId]);

  const showPython = languageFilter === 'all' || languageFilter === 'python';
  const showJava = languageFilter === 'all' || languageFilter === 'java';

  return (
    <div className="space-y-6">
      {/* Live Interactive Concurrency & CompletableFuture Simulator */}
      <LiveConcurrencyPipelineSimulator />

      {/* 8-Topic Deep-Dive Selector */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              Complete Python 3.13+ &amp; Java 21+ Language Mastery
            </div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
              OOP Dispatch, Exceptions, Collections, Thread Pools, Future &amp; CompletableFuture
            </h3>
          </div>

          <SegmentedTabBar<'all' | MasteryTrackGroup>
            ariaLabel="Filter deep-dive modules"
            activeTab={group}
            onChange={setGroup}
            size="xs"
            tabs={[
              { id: 'all', label: 'All 8 Modules', count: LANG_CONCURRENCY_EXCEPTIONS_MODULES.length },
              {
                id: 'oop-exceptions-collections',
                label: 'OOP, Exceptions & Collections',
                count: LANG_CONCURRENCY_EXCEPTIONS_MODULES.filter(
                  (m) => m.group === 'oop-exceptions-collections'
                ).length,
              },
              {
                id: 'threads-futures-concurrency',
                label: 'Threads, Futures & Concurrency',
                count: LANG_CONCURRENCY_EXCEPTIONS_MODULES.filter(
                  (m) => m.group === 'threads-futures-concurrency'
                ).length,
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {visibleModules.map((mod) => {
            const active = mod.id === activeModule.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedId(mod.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-400">
                  {mod.number}. {mod.shortTitle}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                  {mod.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module Deep Explanation */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
            Module {activeModule.number}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {activeModule.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <BookOpen className="w-3.5 h-3.5" />
              In Simple English
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeModule.simpleEnglish}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
              Runtime &amp; Compiler Internals
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeModule.technicalInternals}
            </p>
          </div>
        </div>

        {/* Python vs Java Comparison Matrix */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Dimension</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400">
                  Python 3.13+
                </th>
                <th className="py-2.5 px-3 font-semibold text-amber-700 dark:text-amber-400">
                  Java 21+ LTS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeModule.keyComparison.map((row) => (
                <tr key={row.aspect} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.aspect}
                  </td>
                  <td className="py-2 px-3">{row.python}</td>
                  <td className="py-2 px-3">{row.java}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Animated Execution DFD */}
      <ConceptDfdStage
        title={activeModule.title}
        nodes={activeModule.dfdNodes}
        edges={activeModule.dfdEdges}
        steps={activeModule.dfdSteps}
        resetKey={activeModule.id}
      />

      {/* Side-by-Side Code Examples */}
      <div className={`grid grid-cols-1 ${showPython && showJava ? 'xl:grid-cols-2' : ''} gap-4`}>
        {showPython && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                <Code2 className="w-3.5 h-3.5" />
                Python 3.13+ Example
              </div>
              <CopyButton text={activeModule.pythonCode} label="Copy" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
              <code>{activeModule.pythonCode}</code>
            </pre>
          </div>
        )}

        {showJava && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
                <Code2 className="w-3.5 h-3.5" />
                Java 21+ LTS Example
              </div>
              <CopyButton text={activeModule.javaCode} label="Copy" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
              <code>{activeModule.javaCode}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Pitfall vs Best Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Common Production Pitfall
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
            {activeModule.pitfall}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Production Best Practice
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
            {activeModule.bestPractice}
          </p>
        </div>
      </div>
    </div>
  );
}
