import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Cpu,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import {
  VISUAL_FLOW_SCENARIOS,
  type DfdEdge,
  type DfdNode,
} from '../../data/databaseVisualData';
import { STANDARD_DFD_BLUEPRINTS } from '../../data/databaseTaxonomyAndSqlData';
import { CopyButton, SegmentedTabBar } from '../ui';

interface DatabaseVisualAnimatorProps {
  selectedFlowId: string;
  onSelectFlowId: (flowId: string) => void;
}

function getEdgePoints(fromNode: DfdNode, toNode: DfdNode) {
  const fromCx = fromNode.x + fromNode.width / 2;
  const fromCy = fromNode.y + fromNode.height / 2;
  const toCx = toNode.x + toNode.width / 2;
  const toCy = toNode.y + toNode.height / 2;

  const dx = toCx - fromCx;
  const dy = toCy - fromCy;

  // Choose clean anchor ports on box boundaries
  let x1 = fromCx;
  let y1 = fromCy;
  let x2 = toCx;
  let y2 = toCy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    x1 = dx >= 0 ? fromNode.x + fromNode.width : fromNode.x;
    x2 = dx >= 0 ? toNode.x : toNode.x + toNode.width;
  } else {
    y1 = dy >= 0 ? fromNode.y + fromNode.height : fromNode.y;
    y2 = dy >= 0 ? toNode.y : toNode.y + toNode.height;
  }

  return { x1, y1, x2, y2 };
}

function getNodePalette(kind: DfdNode['kind'], active: boolean) {
  if (active) {
    return {
      fill: 'fill-sky-600 dark:fill-sky-500',
      stroke: 'stroke-sky-700 dark:stroke-sky-300',
      title: 'fill-white dark:fill-slate-950',
      sub: 'fill-sky-100 dark:fill-slate-900',
    };
  }
  switch (kind) {
    case 'memory':
      return {
        fill: 'fill-emerald-50 dark:fill-emerald-950/50',
        stroke: 'stroke-emerald-300 dark:stroke-emerald-800',
        title: 'fill-slate-900 dark:fill-slate-100',
        sub: 'fill-emerald-800 dark:fill-emerald-300',
      };
    case 'security':
      return {
        fill: 'fill-amber-50 dark:fill-amber-950/40',
        stroke: 'stroke-amber-300 dark:stroke-amber-800',
        title: 'fill-slate-900 dark:fill-slate-100',
        sub: 'fill-amber-800 dark:fill-amber-300',
      };
    case 'storage':
      return {
        fill: 'fill-slate-100 dark:fill-slate-800/80',
        stroke: 'stroke-slate-300 dark:stroke-slate-700',
        title: 'fill-slate-900 dark:fill-slate-100',
        sub: 'fill-slate-600 dark:fill-slate-400',
      };
    default:
      return {
        fill: 'fill-white dark:fill-slate-900',
        stroke: 'stroke-slate-300 dark:stroke-slate-700',
        title: 'fill-slate-900 dark:fill-slate-100',
        sub: 'fill-slate-500 dark:fill-slate-400',
      };
  }
}

export function DatabaseVisualAnimator({
  selectedFlowId,
  onSelectFlowId,
}: DatabaseVisualAnimatorProps) {
  const flow = useMemo(
    () => VISUAL_FLOW_SCENARIOS.find((f) => f.id === selectedFlowId) ?? VISUAL_FLOW_SCENARIOS[0],
    [selectedFlowId]
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMs, setSpeedMs] = useState(2800);
  const [packetProgress, setPacketProgress] = useState(0);
  const [diagramMode, setDiagramMode] = useState<'animated' | 'dfd-blueprint'>('animated');

  const blueprint = STANDARD_DFD_BLUEPRINTS[flow.id];

  // Reset to step 0 when flow changes
  useEffect(() => {
    setStepIdx(0);
    setPacketProgress(0);
  }, [flow.id]);

  // Step auto-advancer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % flow.steps.length);
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, flow.steps.length]);

  // Smooth data-packet animation along active edge (respects reduced motion)
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPacketProgress(0.5);
      return;
    }

    let rafId = 0;
    let startTs = performance.now();
    const duration = Math.max(900, Math.round(speedMs * 0.65));

    const tick = (now: number) => {
      const elapsed = now - startTs;
      const t = (elapsed % duration) / duration;
      setPacketProgress(t);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [stepIdx, speedMs, flow.id]);

  const currentStep = flow.steps[stepIdx] ?? flow.steps[0];
  const nodeMap = useMemo(() => {
    const map = new Map<string, DfdNode>();
    flow.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [flow.nodes]);

  const packetEdge: DfdEdge | undefined = currentStep.packetEdgeId
    ? flow.edges.find((e) => e.id === currentStep.packetEdgeId)
    : undefined;

  const packetCoords = useMemo(() => {
    if (!packetEdge) return null;
    const fromNode = nodeMap.get(packetEdge.from);
    const toNode = nodeMap.get(packetEdge.to);
    if (!fromNode || !toNode) return null;
    const { x1, y1, x2, y2 } = getEdgePoints(fromNode, toNode);
    return {
      x: x1 + (x2 - x1) * packetProgress,
      y: y1 + (y2 - y1) * packetProgress,
    };
  }, [packetEdge, nodeMap, packetProgress]);

  return (
    <div className="space-y-6">
      {/* Flow Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {VISUAL_FLOW_SCENARIOS.map((item) => {
          const active = item.id === flow.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFlowId(item.id)}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                {item.category}
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                {item.shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Zone Interactive Animation Stage */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              {flow.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              {flow.simpleSummary}
            </p>
          </div>

          {/* Playback & DFD View Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <SegmentedTabBar<'animated' | 'dfd-blueprint'>
              ariaLabel="Visual mode"
              activeTab={diagramMode}
              onChange={setDiagramMode}
              size="xs"
              tabs={[
                { id: 'animated', label: 'Animated SVG' },
                { id: 'dfd-blueprint', label: 'Level-0 & Level-1 DFD' },
              ]}
            />
            {diagramMode === 'animated' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx((prev) => (prev - 1 + flow.steps.length) % flow.steps.length);
                  }}
                  aria-label="Previous step"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500"
                >
                  <SkipBack className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Play Animation</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx((prev) => (prev + 1) % flow.steps.length);
                  }}
                  aria-label="Next step"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStepIdx(0);
                    setIsPlaying(true);
                  }}
                  aria-label="Restart animation"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
                <select
                  aria-label="Animation speed"
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-200"
                >
                  <option value={4000}>0.75x</option>
                  <option value={2800}>1.0x</option>
                  <option value={1700}>1.5x</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Standard Level-0 & Level-1 DFD Blueprint View OR Interactive Animated SVG */}
        {diagramMode === 'dfd-blueprint' && blueprint ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {blueprint.level0Title}
                </span>
                <CopyButton text={blueprint.level0Ascii} label="Copy Level-0" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
                {blueprint.level0Ascii}
              </pre>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {blueprint.level1Title}
                </span>
                <CopyButton text={blueprint.level1Ascii} label="Copy Level-1" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
                {blueprint.level1Ascii}
              </pre>
            </div>
          </div>
        ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3 sm:p-4 overflow-x-auto">
          <svg
            viewBox="0 0 800 315"
            className="w-full min-w-[680px] h-auto select-none"
            role="img"
            aria-label={`Interactive Data Flow Diagram for ${flow.title}`}
          >
            <defs>
              <marker
                id="dfd-arrow-muted"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
              </marker>
              <marker
                id="dfd-arrow-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
              </marker>
            </defs>

            {/* Subtle blueprint grid lines */}
            <g className="stroke-slate-200/70 dark:stroke-slate-800/60" strokeWidth="1">
              {[80, 160, 240].map((y) => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} strokeDasharray="3 6" />
              ))}
            </g>

            {/* DFD Edges */}
            {flow.edges.map((edge) => {
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);
              if (!fromNode || !toNode) return null;
              const { x1, y1, x2, y2 } = getEdgePoints(fromNode, toNode);
              const isActive = currentStep.activeEdgeIds.includes(edge.id);
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2 - 7;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={isActive ? 2.8 : 1.5}
                    strokeDasharray={edge.dashed ? '5 4' : undefined}
                    markerEnd={isActive ? 'url(#dfd-arrow-active)' : 'url(#dfd-arrow-muted)'}
                    className={
                      isActive
                        ? 'stroke-sky-600 dark:stroke-sky-400 transition-colors'
                        : 'stroke-slate-300 dark:stroke-slate-700 transition-colors'
                    }
                  />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    className={`text-[10px] font-mono ${
                      isActive
                        ? 'fill-sky-700 dark:fill-sky-300 font-semibold'
                        : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* DFD Nodes */}
            {flow.nodes.map((node) => {
              const isActive = currentStep.activeNodeIds.includes(node.id);
              const palette = getNodePalette(node.kind, isActive);
              return (
                <g key={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={10}
                    strokeWidth={isActive ? 2.2 : 1.2}
                    className={`${palette.fill} ${palette.stroke} transition-colors`}
                  />
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + 26}
                    textAnchor="middle"
                    className={`text-[12px] font-semibold ${palette.title}`}
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + 45}
                    textAnchor="middle"
                    className={`text-[10px] font-mono ${palette.sub}`}
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}

            {/* Animated Traveling Data Packet */}
            {packetCoords && (
              <g transform={`translate(${packetCoords.x}, ${packetCoords.y})`}>
                <circle r="7" className="fill-sky-500/25 dark:fill-sky-400/25" />
                <circle r="4.5" className="fill-sky-600 dark:fill-sky-300 stroke-white dark:stroke-slate-950" strokeWidth="1.5" />
                {currentStep.packetLabel && (
                  <g transform="translate(0, -14)">
                    <rect
                      x="-48"
                      y="-11"
                      width="96"
                      height="16"
                      rx="4"
                      className="fill-slate-900 dark:fill-sky-400"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      className="text-[9.5px] font-mono font-semibold fill-white dark:fill-slate-950"
                    >
                      {currentStep.packetLabel}
                    </text>
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>
        )}

        {/* Clickable Step Timeline Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {flow.steps.map((s, idx) => {
            const active = idx === stepIdx;
            return (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
                className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400">
                  Step 0{s.stepNumber}
                </div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Step Narration: Simple English + Exact Algorithm Internals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Step 0{currentStep.stepNumber} in Simple English
              </span>
              <span className="text-[11px] font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                {currentStep.metricTag}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {currentStep.title}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
              {currentStep.simpleEnglish}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Under the Hood: Algorithm &amp; Data Structure
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-6">
              {currentStep.algorithmDetail}
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {flow.algorithmName} · {flow.complexity}
            </div>
          </div>
        </div>

        {/* Standard Definition & Real-World Production Application Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Standard Technical Definition
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-5">
              {flow.standardDefinition}
            </p>
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Standard Real-World Application
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-5">
              {flow.realWorldApplication}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
