import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  CornerDownRight,
  GitBranch,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  StepForward,
} from 'lucide-react';
import {
  RECURSION_PROBLEMS,
  type RecursionProblemId,
  type RecursionTreeNode,
} from '../data/recursionLabData';

interface CallStackVisualizerProps {
  initialProblemId?: RecursionProblemId;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;

export const CallStackVisualizer: React.FC<CallStackVisualizerProps> = ({
  initialProblemId = 'n-queens',
}) => {
  const [problemId, setProblemId] = useState<RecursionProblemId>(initialProblemId);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  const problemList = useMemo(() => Object.values(RECURSION_PROBLEMS), []);
  const problem = RECURSION_PROBLEMS[problemId] ?? RECURSION_PROBLEMS['n-queens'];

  const totalSteps = problem.trace.length;
  const safeStepIdx = Math.min(stepIdx, Math.max(0, totalSteps - 1));
  const current = problem.trace[safeStepIdx];

  useEffect(() => {
    if (!isPlaying) return;
    if (safeStepIdx >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
    }, Math.round(1200 / speed));
    return () => window.clearTimeout(timer);
  }, [isPlaying, safeStepIdx, totalSteps, speed]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, RecursionTreeNode>();
    for (const n of problem.treeNodes) map.set(n.id, n);
    return map;
  }, [problem.treeNodes]);

  const activeNode = nodeMap.get(current.activeNodeId) ?? problem.treeNodes[0];

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
    () => problem.treeNodes.filter((n) => n.parentId === activeNode?.id),
    [problem.treeNodes, activeNode],
  );

  // Depth lanes grouping all tree nodes by depth marker
  const depthLanes = useMemo(() => {
    const maxDepth = Math.max(...problem.treeNodes.map((n) => n.depth), 1);
    const lanes: { depth: number; nodes: RecursionTreeNode[] }[] = [];
    for (let d = 1; d <= maxDepth; d++) {
      lanes.push({
        depth: d,
        nodes: problem.treeNodes.filter((n) => n.depth === d),
      });
    }
    return lanes;
  }, [problem.treeNodes]);

  const handleSelectProblem = (nextId: RecursionProblemId) => {
    setProblemId(nextId);
    setStepIdx(0);
    setIsPlaying(false);
  };

  const handleVisualizeStep = () => {
    setIsPlaying(false);
    setStepIdx((prev) => (prev >= totalSteps - 1 ? 0 : prev + 1));
  };

  // Stack frames ordered Top-of-Stack first (LIFO)
  const lifoFrames = [...current.stack].reverse();

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header & Problem Switcher */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-sky-600 dark:text-sky-400">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Call Stack Visualizer</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-600 dark:text-slate-400">
              {problem.complexitySummary}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {problem.title}
          </h3>
        </div>

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
              if (safeStepIdx >= totalSteps - 1) setStepIdx(0);
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
              setStepIdx((p) => Math.max(0, p - 1));
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
              setStepIdx(0);
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          <span>
            Current Depth:{' '}
            <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
              D{current.depth}
            </strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>
            Peak Stack Depth:{' '}
            <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
              D{current.peakDepth}
            </strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>
            Active Frames:{' '}
            <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
              {current.stack.length}
            </strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>
            Nodes Explored:{' '}
            <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
              {current.exploredCount}
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

        {/* Step Narrative Banner */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
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
                  ? '✕ PRUNED BRANCH'
                  : current.action === 'backtrack'
                    ? '↩ UNWIND / BACKTRACK'
                    : '↓ PUSH RECURSIVE CALL'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {current.explanation}
          </p>
        </div>

        {/* Two-Column Core: Live LIFO Call Stack + Parent-Child Relationship & Depth Lanes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left 5 cols: Active Recursive Call Stack Tower */}
          <div className="lg:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Active Call Stack (LIFO)</span>
              <span className="font-mono tabular-nums">Top → Base</span>
            </div>

            <div className="space-y-2">
              {lifoFrames.map((frame, idx) => {
                const isTop = idx === 0;
                const parentFrame = lifoFrames[idx + 1];
                const statusLabel =
                  frame.status === 'active'
                    ? '● ACTIVE'
                    : frame.status === 'returning'
                      ? '↩ RETURNING'
                      : frame.status === 'pruned'
                        ? '✕ PRUNED'
                        : '⏸ WAITING';

                return (
                  <div
                    key={`${frame.fn}-${frame.depth}-${idx}`}
                    className={`rounded-lg border p-2.5 transition-colors space-y-1 ${
                      frame.status === 'pruned'
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40'
                        : frame.status === 'returning'
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40'
                          : isTop
                            ? 'border-sky-400 dark:border-sky-600 bg-sky-50/70 dark:bg-sky-950/40'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        D{frame.depth} · {frame.fn}
                      </span>
                      <span
                        className={`font-semibold ${
                          frame.status === 'pruned'
                            ? 'text-rose-700 dark:text-rose-300'
                            : frame.status === 'returning'
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : isTop
                                ? 'text-sky-700 dark:text-sky-300'
                                : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                      state: {frame.state}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>
                        {parentFrame
                          ? `Called by D${parentFrame.depth} (${parentFrame.fn})`
                          : 'Entry Frame (Root Caller)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 7 cols: Parent-Child Relationships & Depth Marker Lanes */}
          <div className="lg:col-span-7 space-y-3">
            {/* Explicit Parent -> Active -> Children Card */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Parent-Child Call Linkage</span>
                </span>
                <span className="font-mono">Click any node to jump</span>
              </div>

              {/* Ancestor Path Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {ancestorChain.map((node, idx) => (
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
                        setStepIdx(Math.min(node.stepIndex, totalSteps - 1));
                      }}
                      className={`px-2 py-1 rounded-md border font-mono text-[11px] transition-colors ${
                        node.id === activeNode.id
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                      }`}
                    >
                      D{node.depth}: {node.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Parent & Direct Children Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="rounded-md bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Parent Caller Frame
                  </div>
                  {parentNode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setStepIdx(Math.min(parentNode.stepIndex, totalSteps - 1));
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
                    Direct Child Calls ({childNodes.length})
                  </div>
                  {childNodes.length === 0 ? (
                    <div className="mt-1 text-slate-500 dark:text-slate-400 font-mono">
                      Leaf / Base Case / Pruned Node
                    </div>
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {childNodes.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            setIsPlaying(false);
                            setStepIdx(Math.min(child.stepIndex, totalSteps - 1));
                          }}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-200 hover:border-sky-500"
                        >
                          D{child.depth}: {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Depth Marker Lanes */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Depth Markers & Call Hierarchy Map
              </div>
              <div className="space-y-1.5">
                {depthLanes.map((lane) => {
                  const isCurrentDepth = lane.depth === current.depth;
                  return (
                    <div
                      key={lane.depth}
                      className={`flex items-start gap-2.5 rounded-md p-2 border ${
                        isCurrentDepth
                          ? 'border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/30'
                          : 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50/40 dark:bg-slate-950/30'
                      }`}
                    >
                      <span
                        className={`w-16 shrink-0 font-mono tabular-nums text-[11px] font-bold pt-0.5 ${
                          isCurrentDepth
                            ? 'text-sky-700 dark:text-sky-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Depth {lane.depth}
                      </span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {lane.nodes.map((node) => {
                          const isActive = node.id === activeNode.id;
                          const isAncestor = ancestorChain.some((a) => a.id === node.id);
                          const isVisited = node.stepIndex <= safeStepIdx;
                          return (
                            <button
                              key={node.id}
                              type="button"
                              onClick={() => {
                                setIsPlaying(false);
                                setStepIdx(Math.min(node.stepIndex, totalSteps - 1));
                              }}
                              className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                                isActive
                                  ? 'border-sky-600 bg-sky-600 text-white font-semibold'
                                  : isAncestor
                                    ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                                    : node.kind === 'solution' && isVisited
                                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                                      : node.kind === 'prune' && isVisited
                                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                                        : isVisited
                                          ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                                          : 'border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                              }`}
                            >
                              {node.kind === 'solution'
                                ? '✓ '
                                : node.kind === 'prune'
                                  ? '✕ '
                                  : ''}
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
            {problem.codeLines.map((line) => {
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
