import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Crown,
  GitBranch,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Undo2,
  XCircle,
} from 'lucide-react';
import {
  CodeLineRole,
  RECURSION_PROBLEMS,
  RecursionProblemId,
  RecursionTreeNode,
} from '../data/recursionLabData';
import { ComplexityDepthToggle } from '../../visualizer/components/ComplexityDepthToggle';
import { RECURSION_LAB_COMPLEXITY_PROFILES } from '../../visualizer/data/complexityComparisonData';

const PLAYBACK_SPEEDS = [
  { label: '0.5×', ms: 2200 },
  { label: '1×', ms: 1350 },
  { label: '2×', ms: 700 },
] as const;

const ROLE_STYLES: Record<
  CodeLineRole,
  { activeRow: string; badgeText: string; gutterDot: string }
> = {
  signature: {
    activeRow: 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100',
    badgeText: 'text-slate-500 dark:text-slate-400',
    gutterDot: 'bg-slate-400',
  },
  'base-case': {
    activeRow: 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100',
    badgeText: 'text-emerald-700 dark:text-emerald-400 font-semibold',
    gutterDot: 'bg-emerald-500',
  },
  'prune-guard': {
    activeRow: 'bg-rose-100/90 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100',
    badgeText: 'text-rose-700 dark:text-rose-400 font-semibold',
    gutterDot: 'bg-rose-500',
  },
  choose: {
    activeRow: 'bg-sky-100/90 dark:bg-sky-950/60 text-sky-950 dark:text-sky-100',
    badgeText: 'text-sky-700 dark:text-sky-400 font-semibold',
    gutterDot: 'bg-sky-500',
  },
  recurse: {
    activeRow: 'bg-sky-100/90 dark:bg-sky-950/60 text-sky-950 dark:text-sky-100',
    badgeText: 'text-sky-700 dark:text-sky-400 font-semibold',
    gutterDot: 'bg-sky-600',
  },
  backtrack: {
    activeRow: 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100',
    badgeText: 'text-amber-700 dark:text-amber-400 font-semibold',
    gutterDot: 'bg-amber-500',
  },
};

function NQueensBoardStage({
  queens,
  probeCell,
  conflictCell,
}: {
  queens: number[];
  probeCell?: [number, number];
  conflictCell?: [number, number];
}) {
  const isAttacked = (r: number, c: number) =>
    queens.some(
      (qc, qr) => qr !== r && (qc === c || Math.abs(qr - r) === Math.abs(qc - c))
    );

  const colsSet = queens;
  const diag1Set = queens.map((c, r) => r - c);
  const diag2Set = queens.map((c, r) => r + c);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
        <span>4×4 N-Queens Board</span>
        <span>Queens Placed: {queens.length} / 4</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="grid grid-cols-4 gap-1 shrink-0">
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const hasQueen = queens[r] === c;
              const isProbe = probeCell && probeCell[0] === r && probeCell[1] === c;
              const isConflict = conflictCell && conflictCell[0] === r && conflictCell[1] === c;
              const attacked = !hasQueen && r >= queens.length && isAttacked(r, c);
              const darkTile = (r + c) % 2 === 1;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`h-11 w-11 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                    hasQueen
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                      : isConflict
                        ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : isProbe
                          ? 'border-sky-500 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200'
                          : attacked
                            ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-amber-500'
                            : darkTile
                              ? 'border-slate-200 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800/70 text-slate-400'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                  title={`Row ${r}, Col ${c}`}
                >
                  {hasQueen ? (
                    <Crown className="w-4 h-4" aria-label={`Queen at row ${r} col ${c}`} />
                  ) : isConflict ? (
                    '×'
                  ) : isProbe ? (
                    '?'
                  ) : attacked ? (
                    '·'
                  ) : (
                    ''
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Live O(1) Conflict Occupancy Sets */}
        <div className="flex-1 min-w-0 space-y-2 text-[11px] font-mono">
          <div className="text-slate-500 dark:text-slate-400 font-semibold">
            O(1) Attack Sets (Locked by Current Stack)
          </div>
          <div className="space-y-1.5 text-slate-700 dark:text-slate-300 tabular-nums">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
              <span className="text-slate-400">cols = </span>
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                {'{'}
                {colsSet.length > 0 ? colsSet.join(', ') : '∅'}
                {'}'}
              </span>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
              <span className="text-slate-400">diag1 (r−c) = </span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {'{'}
                {diag1Set.length > 0 ? diag1Set.join(', ') : '∅'}
                {'}'}
              </span>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5">
              <span className="text-slate-400">diag2 (r+c) = </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {'{'}
                {diag2Set.length > 0 ? diag2Set.join(', ') : '∅'}
                {'}'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Legend: Crown = Placed · ? = Probe · × = Conflict · · = Attacked
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveRecursionTreeSvg({
  nodes,
  activeNodeId,
  currentStepIdx,
  maxDepth,
  onSelectStep,
}: {
  nodes: RecursionTreeNode[];
  activeNodeId: string;
  currentStepIdx: number;
  maxDepth: number;
  onSelectStep: (stepIndex: number) => void;
}) {
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Compute active ancestor chain from activeNodeId up to root
  const activeChainIds = useMemo(() => {
    const chain = new Set<string>();
    let cursor = nodeById.get(activeNodeId);
    while (cursor) {
      chain.add(cursor.id);
      cursor = cursor.parentId ? nodeById.get(cursor.parentId) : undefined;
    }
    return chain;
  }, [activeNodeId, nodeById]);

  const depthYs = useMemo(() => {
    const map = new Map<number, number>();
    for (const n of nodes) {
      if (!map.has(n.depth)) map.set(n.depth, n.y);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [nodes]);

  const svgHeight = Math.max(270, ...nodes.map((n) => n.y + 34));

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
          <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <span>Interactive Recursion Tree & Depth Map</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className="text-sky-700 dark:text-sky-400">● Call</span>
          <span className="text-emerald-700 dark:text-emerald-400">✓ Base Case</span>
          <span className="text-rose-700 dark:text-rose-400">× Pruned</span>
          <span className="text-amber-700 dark:text-amber-400">↺ Backtrack</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 640 ${svgHeight}`}
          className="w-full min-w-[500px] h-auto select-none"
          role="img"
          aria-label={`Recursion call tree up to depth ${maxDepth}. Click any node to inspect its call stack frame.`}
        >
          {/* Horizontal Depth Lanes */}
          {depthYs.map(([depth, y]) => (
            <g key={`lane-${depth}`}>
              <line
                x1={56}
                y1={y}
                x2={628}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="3 4"
                strokeWidth={1}
              />
              <text
                x={8}
                y={y + 4}
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]"
              >
                d={depth}
              </text>
            </g>
          ))}

          {/* Parent -> Child Edges */}
          {nodes.map((node) => {
            if (!node.parentId) return null;
            const parent = nodeById.get(node.parentId);
            if (!parent) return null;
            const onActivePath = activeChainIds.has(node.id) && activeChainIds.has(parent.id);
            const reached = node.stepIndex <= currentStepIdx;

            const edgeStroke = onActivePath
              ? node.kind === 'solution'
                ? 'stroke-emerald-500'
                : node.kind === 'prune'
                  ? 'stroke-rose-500'
                  : node.kind === 'backtrack'
                    ? 'stroke-amber-500'
                    : 'stroke-sky-500'
              : reached
                ? 'stroke-slate-400 dark:stroke-slate-600'
                : 'stroke-slate-200 dark:stroke-slate-800';

            return (
              <line
                key={`edge-${parent.id}-${node.id}`}
                x1={parent.x}
                y1={parent.y + 15}
                x2={node.x}
                y2={node.y - 15}
                className={`${edgeStroke} transition-colors`}
                strokeWidth={onActivePath ? 2.5 : 1.5}
                strokeDasharray={node.kind === 'prune' ? '4 3' : undefined}
              />
            );
          })}

          {/* Clickable Tree Nodes */}
          {nodes.map((node) => {
            const isActive = node.id === activeNodeId;
            const isOnChain = activeChainIds.has(node.id);
            const reached = node.stepIndex <= currentStepIdx;

            const glyph =
              node.kind === 'solution'
                ? '✓'
                : node.kind === 'prune'
                  ? '×'
                  : node.kind === 'backtrack'
                    ? '↺'
                    : '●';

            const boxFill = isActive
              ? node.kind === 'solution'
                ? 'fill-emerald-100 dark:fill-emerald-950 stroke-emerald-500'
                : node.kind === 'prune'
                  ? 'fill-rose-100 dark:fill-rose-950 stroke-rose-500'
                  : node.kind === 'backtrack'
                    ? 'fill-amber-100 dark:fill-amber-950 stroke-amber-500'
                    : 'fill-sky-100 dark:fill-sky-950 stroke-sky-500'
              : isOnChain
                ? 'fill-white dark:fill-slate-900 stroke-sky-400 dark:stroke-sky-600'
                : reached
                  ? 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  : 'fill-slate-100/70 dark:fill-slate-900/40 stroke-slate-200 dark:stroke-slate-800';

            const labelFill = isActive
              ? node.kind === 'solution'
                ? 'fill-emerald-900 dark:fill-emerald-200'
                : node.kind === 'prune'
                  ? 'fill-rose-900 dark:fill-rose-200'
                  : node.kind === 'backtrack'
                    ? 'fill-amber-900 dark:fill-amber-200'
                    : 'fill-sky-900 dark:fill-sky-100'
              : reached
                ? 'fill-slate-800 dark:fill-slate-200'
                : 'fill-slate-400 dark:fill-slate-500';

            const boxWidth = Math.max(96, node.label.length * 7.2 + 28);

            return (
              <g
                key={node.id}
                onClick={() => onSelectStep(node.stepIndex)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectStep(node.stepIndex);
                  }
                }}
                aria-label={`Jump to step ${node.stepIndex + 1}: ${node.label} (${node.sublabel})`}
              >
                <rect
                  x={node.x - boxWidth / 2}
                  y={node.y - 16}
                  width={boxWidth}
                  height={32}
                  rx={8}
                  className={`${boxFill} transition-colors`}
                  strokeWidth={isActive ? 2.2 : 1.25}
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  className={`${labelFill} font-mono text-[10.5px] font-bold`}
                >
                  {glyph} {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 font-mono text-[9px]"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Click any node in the recursion tree to inspect its call stack depth, active base/prune guard, and variable state.
      </p>
    </div>
  );
}

export interface RecursionBacktrackingVisualizerProps {
  /** Direct link handler to navigate to the Recursion or Backtracking module in Curriculum Workbench */
  onOpenCurriculumModule?: (topicId: 'backtracking' | 'recursion-divide-conquer') => void;
  /** Optional currently active topic ID when embedded inside Curriculum Workbench */
  activeCurriculumTopicId?: string;
}

export function RecursionBacktrackingVisualizer({
  onOpenCurriculumModule,
  activeCurriculumTopicId,
}: RecursionBacktrackingVisualizerProps) {
  const [problemId, setProblemId] = useState<RecursionProblemId>('n-queens');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(PLAYBACK_SPEEDS[1].ms);

  const problem = RECURSION_PROBLEMS[problemId];
  const trace = problem.trace;
  const activeStep = trace[Math.min(stepIdx, trace.length - 1)];
  const maxTraceDepth = useMemo(
    () => Math.max(...trace.map((s) => s.peakDepth), 1),
    [trace]
  );

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [problemId]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= trace.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, trace.length]);

  const phaseMeta =
    activeStep.action === 'solution'
      ? {
          label: 'Base Case Executed',
          icon: CheckCircle2,
          cls: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200',
        }
      : activeStep.action === 'prune'
        ? {
            label: 'Pruning Guard Triggered',
            icon: XCircle,
            cls: 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200',
          }
        : activeStep.action === 'backtrack'
          ? {
              label: 'Backtrack & State Undo',
              icon: Undo2,
              cls: 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200',
            }
          : {
              label: 'Recursive Step (Push Frame)',
              icon: Layers,
              cls: 'border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200',
            };

  const PhaseIcon = phaseMeta.icon;
  const sortedCands = [2, 3, 6, 7];

  return (
    <div className="space-y-4">
      {/* Problem Selector + Direct Curriculum Module Links */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            ['n-queens', 'subsets', 'combination-sum'] as RecursionProblemId[]
          ).map((pid) => (
            <button
              key={pid}
              type="button"
              onClick={() => setProblemId(pid)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                problemId === pid
                  ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-400'
              }`}
            >
              {RECURSION_PROBLEMS[pid].shortLabel}
            </button>
          ))}
        </div>

        {onOpenCurriculumModule && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenCurriculumModule('backtracking')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCurriculumTopicId === 'backtracking'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                  : 'border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 hover:border-sky-500'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Backtracking Module
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onOpenCurriculumModule('recursion-divide-conquer')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCurriculumTopicId === 'recursion-divide-conquer'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500'
              }`}
            >
              Recursion & D&C Module
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Problem Contract Metadata + Playback Deck */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {problem.title}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {problem.complexitySummary}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-900">
            {PLAYBACK_SPEEDS.map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setSpeedMs(sp.ms)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors whitespace-nowrap ${
                  speedMs === sp.ms
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
            }}
            aria-label="Reset trace"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-sky-400"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((s) => Math.max(0, s - 1));
            }}
            disabled={stepIdx === 0}
            aria-label="Previous step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-35"
          >
            <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (stepIdx >= trace.length - 1) setStepIdx(0);
              setIsPlaying((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Animate Stack'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((s) => Math.min(trace.length - 1, s + 1));
            }}
            disabled={stepIdx >= trace.length - 1}
            aria-label="Next step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-35"
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Live Call Stack Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
          <div className="text-[10px] text-slate-500">Current Stack Depth</div>
          <div className="text-sm font-bold text-sky-700 dark:text-sky-400">
            {activeStep.depth} frames
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
          <div className="text-[10px] text-slate-500">Peak Stack Depth</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {activeStep.peakDepth} max
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
          <div className="text-[10px] text-slate-500">States Explored</div>
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {activeStep.exploredCount}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
          <div className="text-[10px] text-slate-500">Pruned / Backtracked</div>
          <div className="text-sm font-bold text-amber-700 dark:text-amber-400">
            {activeStep.prunedCount}
          </div>
        </div>
      </div>

      {/* Time Complexity Toggle: Live Recursive Depth vs. Iterative Alternative */}
      <ComplexityDepthToggle
        profile={RECURSION_LAB_COMPLEXITY_PROFILES[problemId]}
        currentDepth={activeStep.depth}
        currentStep={activeStep.step + 1}
        totalSteps={trace.length}
        defaultOpen
      />

      {/* Interactive SVG Recursion Tree & Depth Lanes */}
      <InteractiveRecursionTreeSvg
        nodes={problem.treeNodes}
        activeNodeId={activeStep.activeNodeId}
        currentStepIdx={stepIdx}
        maxDepth={maxTraceDepth}
        onSelectStep={(idx) => {
          setIsPlaying(false);
          setStepIdx(idx);
        }}
      />

      {/* Active Step Narrative Callout + Scrubber */}
      <div className={`rounded-xl border p-3.5 space-y-2 ${phaseMeta.cls}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold">
            <PhaseIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{activeStep.title}</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums">
            {phaseMeta.label} · Step {activeStep.step + 1} / {trace.length}
          </span>
        </div>
        <p className="text-xs leading-relaxed opacity-95">{activeStep.explanation}</p>
        <input
          type="range"
          min={0}
          max={trace.length - 1}
          value={stepIdx}
          aria-label="Scrub recursion trace steps"
          onChange={(e) => {
            setIsPlaying(false);
            setStepIdx(Number(e.target.value));
          }}
          className="w-full accent-sky-600 cursor-pointer"
        />
      </div>

      {/* Synchronized Call Stack Tower + Live Problem State Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Live LIFO Call Stack Frame Tower */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Live Call Stack (LIFO · Top → Bottom)</span>
            <span className="tabular-nums">
              {activeStep.depth} / {maxTraceDepth} frames
            </span>
          </div>

          {/* Segmented Stack Depth Gauge */}
          <div className="flex items-center gap-1">
            {Array.from({ length: maxTraceDepth }).map((_, idx) => {
              const filled = idx < activeStep.depth;
              const isTop = idx === activeStep.depth - 1;
              return (
                <div
                  key={idx}
                  className={`flex-1 h-2 rounded-sm transition-colors ${
                    isTop
                      ? activeStep.action === 'solution'
                        ? 'bg-emerald-500'
                        : activeStep.action === 'prune'
                          ? 'bg-rose-500'
                          : activeStep.action === 'backtrack'
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                      : filled
                        ? 'bg-sky-300 dark:bg-sky-700'
                        : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <div className="space-y-1.5">
            {[...activeStep.stack].reverse().map((frame) => (
              <div
                key={`${frame.depth}-${frame.fn}`}
                className={`rounded-lg border px-3 py-2 font-mono text-xs flex items-center justify-between gap-2 ${
                  frame.status === 'active'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100'
                    : frame.status === 'returning'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : frame.status === 'pruned'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 mr-1.5">d={frame.depth}</span>
                  <span className="font-semibold">{frame.fn}</span>
                </div>
                <span className="text-[11px] truncate">{frame.state}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Problem State Stage */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
          {problemId === 'n-queens' ? (
            <NQueensBoardStage
              queens={activeStep.queens ?? []}
              probeCell={activeStep.probeCell}
              conflictCell={activeStep.conflictCell}
            />
          ) : problemId === 'subsets' ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Mutable Active Path (Shared Across Frames)
                </div>
                <div className="font-mono text-sm font-bold text-sky-700 dark:text-sky-400">
                  path = [{(activeStep.currentPath ?? []).join(', ')}]
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Emitted Subsets ({activeStep.emittedSubsets?.length ?? 0} / 8)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(activeStep.emittedSubsets ?? []).map((sub, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 font-mono text-[11px] text-emerald-800 dark:text-emerald-300"
                    >
                      [{sub.join(', ')}]
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">
                  Sorted Candidates · Target = 7
                </span>
                <span className="font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                  Remaining (rem) = {activeStep.remainingTarget ?? 0}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs tabular-nums">
                {sortedCands.map((val, idx) => {
                  const isPruned =
                    activeStep.prunedFromIdx !== undefined && idx >= activeStep.prunedFromIdx;
                  const isActiveCand = activeStep.activeCandidateIdx === idx;
                  return (
                    <div
                      key={val}
                      className={`rounded-lg border p-2 text-center ${
                        isPruned
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                          : isActiveCand
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>{val}</div>
                      <div className="text-[9px] mt-0.5">
                        {isPruned ? '× > rem' : isActiveCand ? '● active' : `j=${idx}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                Active path:{' '}
                <strong className="text-sky-700 dark:text-sky-400">
                  [{(activeStep.currentPath ?? []).join(', ')}]
                </strong>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Emitted Valid Combinations ({activeStep.emittedCombinations?.length ?? 0} / 2)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(activeStep.emittedCombinations ?? []).length === 0 ? (
                    <span className="text-[11px] font-mono text-slate-400">None emitted yet</span>
                  ) : (
                    (activeStep.emittedCombinations ?? []).map((comb, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 font-mono text-[11px] text-emerald-800 dark:text-emerald-300"
                      >
                        [{comb.join(', ')}]
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Annotated Pseudocode: Base Case vs Pruning Guard vs Recursive Step Mapping */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Live Code Mapping · Base Cases, Pruning Guards & Recursive Steps
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Base: {problem.baseCaseSummary}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-900 font-mono text-xs overflow-x-auto">
          {problem.codeLines.map((line) => {
            const isExec = activeStep.activeLineNumbers.includes(line.lineNumber);
            const style = ROLE_STYLES[line.role];
            return (
              <div
                key={line.lineNumber}
                className={`px-3.5 py-1.5 flex items-center justify-between gap-3 transition-colors ${
                  isExec
                    ? style.activeRow
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-4 text-right text-[10px] text-slate-400 tabular-nums shrink-0">
                    {line.lineNumber}
                  </span>
                  <span
                    className={`w-3 text-center text-[11px] font-bold shrink-0 ${
                      isExec ? style.badgeText : 'text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    ▸
                  </span>
                  <code className="whitespace-pre">{line.code}</code>
                </div>
                <span className={`text-[10px] whitespace-nowrap shrink-0 ${style.badgeText}`}>
                  {isExec ? `→ ${line.roleLabel}` : line.roleLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
