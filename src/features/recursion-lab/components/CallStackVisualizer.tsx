import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  CheckCircle2,
  CornerDownRight,
  GitBranch,
  History,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  StepForward,
  Undo2,
} from 'lucide-react';
import {
  RECURSION_PROBLEMS,
  type CodeLineSpec,
  type RecursionProblemId,
  type RecursionTraceStep,
  type RecursionTreeNode,
} from '../data/recursionLabData';

export interface CallStackVisualizerProps {
  initialProblemId?: RecursionProblemId;
  /** Optional live-piped execution trace auto-generated from VisualSandbox state machine */
  externalTrace?: RecursionTraceStep[];
  externalTreeNodes?: RecursionTreeNode[];
  externalCodeLines?: CodeLineSpec[];
  externalTitle?: string;
  externalComplexity?: string;
  /** Controlled step index for real-time bidirectional synchronization */
  syncedStepIndex?: number;
  onStepIndexChange?: (nextStep: number) => void;
  /** Optional status text rendered in header when piped */
  syncBadgeText?: string;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;

interface DepthVisualStyle {
  border: string;
  activeBg: string;
  laneBg: string;
  badgeText: string;
  rail: string;
  dot: string;
  name: string;
}

const DEPTH_PALETTE: DepthVisualStyle[] = [
  {
    name: 'L1',
    border: 'border-sky-400 dark:border-sky-500',
    activeBg: 'bg-sky-50/80 dark:bg-sky-950/50',
    laneBg: 'bg-sky-50/40 dark:bg-sky-950/25 border-sky-300/80 dark:border-sky-800/80',
    badgeText: 'text-sky-700 dark:text-sky-300',
    rail: 'bg-sky-400 dark:bg-sky-500',
    dot: 'bg-sky-500',
  },
  {
    name: 'L2',
    border: 'border-indigo-400 dark:border-indigo-500',
    activeBg: 'bg-indigo-50/80 dark:bg-indigo-950/50',
    laneBg: 'bg-indigo-50/40 dark:bg-indigo-950/25 border-indigo-300/80 dark:border-indigo-800/80',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    rail: 'bg-indigo-400 dark:bg-indigo-500',
    dot: 'bg-indigo-500',
  },
  {
    name: 'L3',
    border: 'border-violet-400 dark:border-violet-500',
    activeBg: 'bg-violet-50/80 dark:bg-violet-950/50',
    laneBg: 'bg-violet-50/40 dark:bg-violet-950/25 border-violet-300/80 dark:border-violet-800/80',
    badgeText: 'text-violet-700 dark:text-violet-300',
    rail: 'bg-violet-400 dark:bg-violet-500',
    dot: 'bg-violet-500',
  },
  {
    name: 'L4',
    border: 'border-amber-400 dark:border-amber-500',
    activeBg: 'bg-amber-50/80 dark:bg-amber-950/50',
    laneBg: 'bg-amber-50/40 dark:bg-amber-950/25 border-amber-300/80 dark:border-amber-800/80',
    badgeText: 'text-amber-700 dark:text-amber-300',
    rail: 'bg-amber-400 dark:bg-amber-500',
    dot: 'bg-amber-500',
  },
  {
    name: 'L5',
    border: 'border-teal-400 dark:border-teal-500',
    activeBg: 'bg-teal-50/80 dark:bg-teal-950/50',
    laneBg: 'bg-teal-50/40 dark:bg-teal-950/25 border-teal-300/80 dark:border-teal-800/80',
    badgeText: 'text-teal-700 dark:text-teal-300',
    rail: 'bg-teal-400 dark:bg-teal-500',
    dot: 'bg-teal-500',
  },
  {
    name: 'L6',
    border: 'border-rose-400 dark:border-rose-500',
    activeBg: 'bg-rose-50/80 dark:bg-rose-950/50',
    laneBg: 'bg-rose-50/40 dark:bg-rose-950/25 border-rose-300/80 dark:border-rose-800/80',
    badgeText: 'text-rose-700 dark:text-rose-300',
    rail: 'bg-rose-400 dark:bg-rose-500',
    dot: 'bg-rose-500',
  },
];

function getDepthStyle(depth: number): DepthVisualStyle {
  const safeIdx = Math.max(0, depth - 1) % DEPTH_PALETTE.length;
  return DEPTH_PALETTE[safeIdx];
}

export const CallStackVisualizer: React.FC<CallStackVisualizerProps> = ({
  initialProblemId = 'n-queens',
  externalTrace,
  externalTreeNodes,
  externalCodeLines,
  externalTitle,
  externalComplexity,
  syncedStepIndex,
  onStepIndexChange,
  syncBadgeText,
}) => {
  const [problemId, setProblemId] = useState<RecursionProblemId>(initialProblemId);
  const [internalStepIdx, setInternalStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [stackOrder, setStackOrder] = useState<'indented' | 'lifo'>('indented');

  const isPipedMode = Boolean(externalTrace && externalTrace.length > 0);
  const isControlledStep = typeof syncedStepIndex === 'number' && typeof onStepIndexChange === 'function';

  const problemList = useMemo(() => Object.values(RECURSION_PROBLEMS), []);
  const problem = RECURSION_PROBLEMS[problemId] ?? RECURSION_PROBLEMS['n-queens'];

  const activeTrace = isPipedMode ? externalTrace! : problem.trace;
  const activeTreeNodes =
    isPipedMode && externalTreeNodes && externalTreeNodes.length > 0
      ? externalTreeNodes
      : problem.treeNodes;
  const activeCodeLines =
    isPipedMode && externalCodeLines && externalCodeLines.length > 0
      ? externalCodeLines
      : problem.codeLines;
  const activeTitle = isPipedMode && externalTitle ? externalTitle : problem.title;
  const activeComplexity =
    isPipedMode && externalComplexity ? externalComplexity : problem.complexitySummary;

  const totalSteps = activeTrace.length;
  const rawStepIdx = isControlledStep ? syncedStepIndex! : internalStepIdx;
  const safeStepIdx = Math.min(Math.max(0, rawStepIdx), Math.max(0, totalSteps - 1));
  const current = activeTrace[safeStepIdx];

  const commitStep = (next: number) => {
    const clamped = Math.min(Math.max(0, next), Math.max(0, totalSteps - 1));
    if (isControlledStep) {
      onStepIndexChange!(clamped);
    } else {
      setInternalStepIdx(clamped);
    }
  };

  // Stop auto-playback whenever a freshly generated external trace arrives
  useEffect(() => {
    setIsPlaying(false);
  }, [externalTrace]);

  useEffect(() => {
    if (!isPlaying) return;
    if (safeStepIdx >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      commitStep(safeStepIdx + 1);
    }, Math.round(1200 / speed));
    return () => window.clearTimeout(timer);
  }, [isPlaying, safeStepIdx, totalSteps, speed]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, RecursionTreeNode>();
    for (const n of activeTreeNodes) map.set(n.id, n);
    return map;
  }, [activeTreeNodes]);

  const activeNode = nodeMap.get(current.activeNodeId) ?? activeTreeNodes[0];

  // Build ancestor chain from root -> ... -> activeNode
  const ancestorChain = useMemo(() => {
    const chain: RecursionTreeNode[] = [];
    let cursor: RecursionTreeNode | undefined = activeNode;
    const guard = new Set<string>();
    while (cursor && !guard.has(cursor.id)) {
      guard.add(cursor.id);
      chain.unshift(cursor);
      cursor = cursor.parentId ? nodeMap.get(cursor.parentId) : undefined;
    }
    return chain;
  }, [activeNode, nodeMap]);

  const parentNode = activeNode?.parentId ? nodeMap.get(activeNode.parentId) ?? null : null;

  // Immediate child calls spawned by the active node
  const childNodes = useMemo(
    () => activeTreeNodes.filter((n) => n.parentId === activeNode?.id),
    [activeTreeNodes, activeNode],
  );

  // Depth lanes grouping all tree nodes by depth marker
  const depthLanes = useMemo(() => {
    const maxDepth = Math.max(...activeTreeNodes.map((n) => n.depth), 1);
    const lanes: { depth: number; nodes: RecursionTreeNode[] }[] = [];
    for (let d = 1; d <= maxDepth; d++) {
      lanes.push({
        depth: d,
        nodes: activeTreeNodes.filter((n) => n.depth === d),
      });
    }
    return lanes;
  }, [activeTreeNodes]);

  const handleSelectProblem = (nextId: RecursionProblemId) => {
    setProblemId(nextId);
    commitStep(0);
    setIsPlaying(false);
  };

  const handleVisualizeStep = () => {
    setIsPlaying(false);
    commitStep(safeStepIdx >= totalSteps - 1 ? 0 : safeStepIdx + 1);
  };

  // Stack frames in either Root->Leaf depth-indented order or Top-of-Stack LIFO order
  const orderedActiveFrames = useMemo(() => {
    const baseFrames = current.stack.map((frame, stackPos) => ({
      frame,
      isTopOfStack: stackPos === current.stack.length - 1,
      parentFrame: stackPos > 0 ? current.stack[stackPos - 1] : null,
    }));
    return stackOrder === 'lifo' ? [...baseFrames].reverse() : baseFrames;
  }, [current.stack, stackOrder]);

  const activeNodeIdSet = useMemo(() => new Set(ancestorChain.map((n) => n.id)), [ancestorChain]);

  // Resolved / popped sub-calls: visited earlier in execution trace, but no longer on the live call stack
  const resolvedSubCalls = useMemo(() => {
    return activeTreeNodes
      .filter((node) => node.stepIndex <= safeStepIdx && !activeNodeIdSet.has(node.id))
      .sort((a, b) => b.stepIndex - a.stepIndex);
  }, [activeTreeNodes, safeStepIdx, activeNodeIdSet]);

  const isBacktrackingStep = current.action === 'backtrack' || current.action === 'prune';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header & Problem Switcher */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-sky-600 dark:text-sky-400">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Call Stack Visualizer</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-600 dark:text-slate-400">
              {activeComplexity}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {activeTitle}
          </h3>
        </div>

        {isPipedMode ? (
          <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
            ⇄ {syncBadgeText ?? 'Synced with VisualSandbox State Machine'}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-950 p-1">
            {problemList.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProblem(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  problem.id === p.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Playback Toolbar with explicit "Visualize Step" button */}
      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleVisualizeStep}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <StepForward className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {safeStepIdx >= totalSteps - 1 ? 'Visualize Step (Restart)' : 'Visualize Step'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (safeStepIdx >= totalSteps - 1) commitStep(0);
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              commitStep(safeStepIdx - 1);
            }}
            disabled={safeStepIdx === 0}
            aria-label="Previous step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              commitStep(0);
            }}
            aria-label="Reset trace"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded font-mono tabular-nums text-[11px] font-medium ${
                  speed === s
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            Step {safeStepIdx + 1} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Telemetry / Depth Metrics Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Current Depth:{' '}
              <strong className={`font-mono tabular-nums ${getDepthStyle(current.depth).badgeText}`}>
                D{current.depth}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Peak Depth:{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                D{current.peakDepth}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Active on Stack:{' '}
              <strong className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                {current.stack.length}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Resolved / Popped:{' '}
              <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {resolvedSubCalls.length}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>
              Pruned:{' '}
              <strong className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                {current.prunedCount}
              </strong>
            </span>
          </div>

          {/* Color-Coded Depth Level Key */}
          <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono">
            <span className="text-slate-500 dark:text-slate-400">Depth Markers:</span>
            {depthLanes.map((lane) => {
              const ds = getDepthStyle(lane.depth);
              return (
                <span key={lane.depth} className="inline-flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-xs ${ds.dot}`} aria-hidden="true" />
                  <span className={ds.badgeText}>D{lane.depth}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Step Narrative Banner (explicitly flags Backtracking unwind moments) */}
        <div
          className={`rounded-lg border p-3 space-y-1 transition-colors ${
            current.action === 'backtrack'
              ? 'border-amber-400 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/35'
              : current.action === 'prune'
                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                : current.action === 'solution'
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
              {current.action === 'backtrack' && (
                <Undo2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" aria-hidden="true" />
              )}
              {current.title}
            </span>
            <span
              className={`text-[11px] font-mono font-semibold uppercase ${
                current.action === 'solution'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : current.action === 'prune'
                    ? 'text-rose-700 dark:text-rose-400'
                    : current.action === 'backtrack'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-sky-700 dark:text-sky-400'
              }`}
            >
              {current.action === 'solution'
                ? '✓ SOLUTION BASE CASE'
                : current.action === 'prune'
                  ? '✕ PRUNED DEAD END · POPPING'
                  : current.action === 'backtrack'
                    ? '↩ BACKTRACKING · FRAME UNWOUND'
                    : '↓ PUSH RECURSIVE CALL'}
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {current.explanation}
          </p>
        </div>

        {/* Two-Column Core: Indented Active Stack + Resolved Sub-Calls | Parent-Child & Depth Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left 5 cols: Active Stack Frames (Indented & Color-Coded by Depth) + Resolved Sub-Calls Tray */}
          <div className="lg:col-span-5 space-y-3">
            {/* Active Call Stack Container */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Active Call Stack ({current.stack.length})
                </div>
                <div className="flex items-center gap-1 rounded-md bg-slate-200/70 dark:bg-slate-900 p-0.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setStackOrder('indented')}
                    className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                      stackOrder === 'indented'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Depth Indented
                  </button>
                  <button
                    type="button"
                    onClick={() => setStackOrder('lifo')}
                    className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                      stackOrder === 'lifo'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    LIFO Top-First
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {orderedActiveFrames.map(({ frame, isTopOfStack, parentFrame }, idx) => {
                  const depthStyle = getDepthStyle(frame.depth);
                  const indentLevels = Math.min(Math.max(0, frame.depth - 1), 5);
                  const isBacktrackResume = isTopOfStack && current.action === 'backtrack';

                  const statusLabel = isBacktrackResume
                    ? '↩ BACKTRACK RESUME'
                    : frame.status === 'active'
                      ? '● EXECUTING'
                      : frame.status === 'returning'
                        ? '✓ RETURNING'
                        : frame.status === 'pruned'
                          ? '✕ PRUNED · UNWIND'
                          : '⏸ SUSPENDED CALLER';

                  return (
                    <div
                      key={`${frame.fn}-${frame.depth}-${idx}`}
                      className="flex items-stretch gap-1.5"
                    >
                      {/* Visual Depth Indentation Rails (one subtle colored rail per ancestor depth) */}
                      {indentLevels > 0 && (
                        <div
                          className="flex items-stretch gap-1.5 shrink-0 pl-0.5"
                          aria-hidden="true"
                        >
                          {Array.from({ length: indentLevels }).map((_, railIdx) => {
                            const railStyle = getDepthStyle(railIdx + 1);
                            return (
                              <span
                                key={railIdx}
                                className={`w-1 rounded-full opacity-45 ${railStyle.rail}`}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Frame Card with Depth-Coded Full Border & Clear Active vs Waiting State */}
                      <div
                        className={`flex-1 min-w-0 rounded-lg border p-2.5 transition-all space-y-1 ${
                          frame.status === 'pruned'
                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50/80 dark:bg-rose-950/45 ring-1 ring-rose-400/40'
                            : frame.status === 'returning'
                              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/45 ring-1 ring-emerald-400/40'
                              : isBacktrackResume
                                ? 'border-amber-500 dark:border-amber-500 bg-amber-50/85 dark:bg-amber-950/45 ring-1 ring-amber-400/50'
                                : isTopOfStack
                                  ? `${depthStyle.border} ${depthStyle.activeBg} ring-1 ring-sky-400/40`
                                  : `${depthStyle.border} bg-white dark:bg-slate-900 opacity-90`
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <span
                              className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums border ${depthStyle.border} ${depthStyle.badgeText} bg-white/80 dark:bg-slate-950/70 shrink-0`}
                            >
                              D{frame.depth}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {frame.fn}
                            </span>
                          </span>
                          <span
                            className={`font-semibold text-[10px] shrink-0 ${
                              frame.status === 'pruned'
                                ? 'text-rose-700 dark:text-rose-300'
                                : frame.status === 'returning'
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : isBacktrackResume
                                    ? 'text-amber-800 dark:text-amber-300'
                                    : isTopOfStack
                                      ? depthStyle.badgeText
                                      : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate">
                          state: {frame.state}
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 truncate">
                            <CornerDownRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">
                              {parentFrame
                                ? `Called by D${parentFrame.depth} (${parentFrame.fn})`
                                : 'Root Stack Frame (Entry)'}
                            </span>
                          </span>
                          <span className="font-mono text-[9.5px] uppercase shrink-0 text-slate-400">
                            {isTopOfStack ? 'TOP OF STACK' : 'ON STACK'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolved / Popped Sub-Calls Panel — Clearly Separated From Active Stack */}
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/30 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <History className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Resolved & Popped Sub-Calls ({resolvedSubCalls.length})</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  Off Stack · Click to inspect
                </span>
              </div>

              {resolvedSubCalls.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  No sub-calls have popped yet. Advance with <strong>Visualize Step</strong> to see pruned or completed branches unwind here when backtracking occurs.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                  {resolvedSubCalls.map((node) => {
                    const ds = getDepthStyle(node.depth);
                    const indentPx = Math.min(Math.max(0, node.depth - 1) * 10, 40);
                    const outcomeLabel =
                      node.kind === 'solution'
                        ? '✓ RESOLVED (HIT)'
                        : node.kind === 'prune'
                          ? '✕ PRUNED & POPPED'
                          : '↩ BACKTRACKED';
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          commitStep(node.stepIndex);
                        }}
                        style={{ marginLeft: `${indentPx}px`, width: `calc(100% - ${indentPx}px)` }}
                        className={`text-left rounded-md border border-dashed px-2.5 py-1.5 transition-colors flex items-center justify-between gap-2 opacity-80 hover:opacity-100 ${
                          node.kind === 'solution'
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/25'
                            : node.kind === 'prune'
                              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/25'
                              : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5 min-w-0 font-mono text-[11px]">
                          <span className={`font-bold tabular-nums shrink-0 ${ds.badgeText}`}>
                            D{node.depth}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 line-through decoration-slate-400/70 truncate">
                            {node.label}
                          </span>
                        </span>
                        <span
                          className={`font-mono text-[9.5px] font-semibold shrink-0 ${
                            node.kind === 'solution'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : node.kind === 'prune'
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {outcomeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right 7 cols: Parent-Child Relationships & Color-Coded Depth Marker Lanes */}
          <div className="lg:col-span-7 space-y-3">
            {/* Explicit Parent -> Active -> Children Card */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Active Stack Chain (Root → Executing Frame)</span>
                </span>
                <span className="font-mono">Click any node to jump</span>
              </div>

              {/* Ancestor Path Breadcrumb with Depth Colors */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {ancestorChain.map((node, idx) => {
                  const ds = getDepthStyle(node.depth);
                  const isCurr = node.id === activeNode.id;
                  return (
                    <React.Fragment key={node.id}>
                      {idx > 0 && (
                        <ArrowDownRight
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlaying(false);
                          commitStep(node.stepIndex);
                        }}
                        className={`px-2 py-1 rounded-md border font-mono text-[11px] transition-colors ${
                          isCurr
                            ? `${ds.border} ${ds.activeBg} ${ds.badgeText} font-bold ring-1 ring-sky-400/40`
                            : `${ds.border} bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`
                        }`}
                      >
                        D{node.depth}: {node.label}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Parent & Direct Children Details (showing Active vs Resolved child sub-calls!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="rounded-md bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Parent Caller Frame (Suspended on Stack)
                  </div>
                  {parentNode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        commitStep(parentNode.stepIndex);
                      }}
                      className="mt-1 text-left font-mono font-semibold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400"
                    >
                      D{parentNode.depth} · {parentNode.label} ({parentNode.sublabel})
                    </button>
                  ) : (
                    <div className="mt-1 text-slate-500 dark:text-slate-400 font-mono">
                      None (Root Invocation)
                    </div>
                  )}
                </div>

                <div className="rounded-md bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Direct Sub-Calls Spawned ({childNodes.length})
                  </div>
                  {childNodes.length === 0 ? (
                    <div className="mt-1 text-slate-500 dark:text-slate-400 font-mono">
                      Leaf / Base Case / Pruned Node
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {childNodes.map((child) => {
                        const childVisited = child.stepIndex <= safeStepIdx;
                        const childResolved = childVisited && !activeNodeIdSet.has(child.id);
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              setIsPlaying(false);
                              commitStep(child.stepIndex);
                            }}
                            className={`px-2 py-0.5 rounded border font-mono text-[11px] transition-colors ${
                              childResolved
                                ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 line-through'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                            }`}
                          >
                            {childResolved ? '↩ ' : ''}D{child.depth}: {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color-Coded Depth Marker Lanes with Active vs Resolved Legend */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Depth Markers & Call Hierarchy Map
                </span>
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-sky-700 dark:text-sky-300 font-semibold">● Executing</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold">⏸ On Stack</span>
                  <span className="text-amber-700 dark:text-amber-400">↩ Resolved/Popped</span>
                  <span className="text-slate-400">○ Pending</span>
                </div>
              </div>

              {isBacktrackingStep && (
                <div className="rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 px-2.5 py-1.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                  <span>
                    <strong>Backtracking Point:</strong> Dashed nodes below have already unwound off the stack; solid depth-bordered nodes remain active callers.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                {depthLanes.map((lane) => {
                  const isCurrentDepth = lane.depth === current.depth;
                  const laneStyle = getDepthStyle(lane.depth);
                  return (
                    <div
                      key={lane.depth}
                      className={`flex items-start gap-2.5 rounded-md p-2 border transition-colors ${
                        isCurrentDepth
                          ? laneStyle.laneBg
                          : 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50/30 dark:bg-slate-950/30'
                      }`}
                    >
                      <div className="w-20 shrink-0 flex items-center gap-1.5 pt-0.5">
                        <span
                          className={`w-2 h-2 rounded-xs shrink-0 ${laneStyle.dot}`}
                          aria-hidden="true"
                        />
                        <span
                          className={`font-mono tabular-nums text-[11px] font-bold ${
                            isCurrentDepth
                              ? laneStyle.badgeText
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Depth {lane.depth}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {lane.nodes.map((node) => {
                          const isActive = node.id === activeNode.id;
                          const isOnActiveStack = activeNodeIdSet.has(node.id);
                          const isVisited = node.stepIndex <= safeStepIdx;
                          const isResolvedOffStack = isVisited && !isOnActiveStack;
                          return (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => {
                                setIsPlaying(false);
                                commitStep(node.stepIndex);
                              }}
                              title={
                                isActive
                                  ? 'Currently executing frame (Top of Stack)'
                                  : isOnActiveStack
                                    ? 'Active caller frame waiting on stack'
                                    : isResolvedOffStack
                                      ? 'Resolved & popped sub-call (already backtracked)'
                                      : 'Unvisited future call'
                              }
                              className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                                isActive
                                  ? `${laneStyle.border} bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-bold shadow-xs`
                                  : isOnActiveStack
                                    ? `${laneStyle.border} ${laneStyle.activeBg} ${laneStyle.badgeText} font-semibold`
                                    : node.kind === 'solution' && isResolvedOffStack
                                      ? 'border-dashed border-emerald-400 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 opacity-85'
                                      : node.kind === 'prune' && isResolvedOffStack
                                        ? 'border-dashed border-rose-400 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 opacity-80'
                                        : isResolvedOffStack
                                          ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 line-through opacity-75'
                                          : 'border-dotted border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                              }`}
                            >
                              {isActive
                                ? '● '
                                : isOnActiveStack
                                  ? '⏸ '
                                  : node.kind === 'solution' && isResolvedOffStack
                                    ? '✓ '
                                    : node.kind === 'prune' && isResolvedOffStack
                                      ? '✕ '
                                      : isResolvedOffStack
                                        ? '↩ '
                                        : '○ '}
                              {node.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Synchronized Code Trace */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span>Active Recursive Frame Code Mapping</span>
            <span className="font-mono text-slate-500">
              Line {current.activeLineNumbers.join(', ')}
            </span>
          </div>
          <pre className="text-xs font-mono leading-relaxed">
            {activeCodeLines.map((line) => {
              const active = current.activeLineNumbers.includes(line.lineNumber);
              return (
                <div
                  key={line.lineNumber}
                  className={`px-2 py-0.5 rounded flex items-center justify-between gap-4 ${
                    active ? 'bg-sky-500/25 text-sky-100 font-semibold' : 'text-slate-400'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="w-4 text-right select-none text-slate-600 tabular-nums">
                      {line.lineNumber}
                    </span>
                    <span className="whitespace-pre">{line.code}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 shrink-0">
                    {line.roleLabel}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
};
