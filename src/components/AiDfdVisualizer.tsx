import { useEffect, useId, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { AiDfdEdge, AiDfdNode, DfdNodeKind } from '../data/aiEngineeringData';

interface AiDfdVisualizerProps {
  title: string;
  subtitle: string;
  nodes: AiDfdNode[];
  edges: AiDfdEdge[];
  inspectedNodeIds: string[];
  onInspectNode: (nodeId: string) => void;
}

const KIND_LABELS: Record<DfdNodeKind, string> = {
  source: 'SOURCE',
  process: 'TRANSFORM',
  store: 'DATA STORE',
  decision: 'DECISION',
  guardrail: 'GUARDRAIL',
  output: 'OUTPUT',
};

function getNodeCardStyle(kind: DfdNodeKind, isSelected: boolean): string {
  if (isSelected) {
    return 'border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/80 text-slate-900 dark:text-sky-50 ring-2 ring-sky-500/25';
  }
  switch (kind) {
    case 'guardrail':
      return 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-slate-900 dark:text-amber-100 hover:border-amber-500';
    case 'store':
      return 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/35 text-slate-900 dark:text-indigo-100 hover:border-indigo-500';
    case 'output':
      return 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-emerald-100 hover:border-emerald-500';
    default:
      return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-sky-400';
  }
}

function getKindCaptionColor(kind: DfdNodeKind): string {
  switch (kind) {
    case 'guardrail':
      return 'text-amber-700 dark:text-amber-300';
    case 'store':
      return 'text-indigo-700 dark:text-indigo-300';
    case 'output':
      return 'text-emerald-700 dark:text-emerald-300';
    case 'decision':
      return 'text-sky-700 dark:text-sky-300';
    default:
      return 'text-slate-500 dark:text-slate-400';
  }
}

export function AiDfdVisualizer({
  title,
  subtitle,
  nodes,
  edges,
  inspectedNodeIds,
  onInspectNode,
}: AiDfdVisualizerProps) {
  const svgUid = useId().replace(/:/g, '');
  const orderedNodes = useMemo(
    () => [...nodes].sort((a, b) => a.stepOrder - b.stepOrder),
    [nodes]
  );

  const [selectedId, setSelectedId] = useState<string>(orderedNodes[0]?.id ?? '');
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset selected node whenever phase nodes change
  useEffect(() => {
    setSelectedId(orderedNodes[0]?.id ?? '');
    setIsPlaying(false);
  }, [orderedNodes]);

  // Step-through flow playback
  useEffect(() => {
    if (!isPlaying || orderedNodes.length <= 1) return;
    const timer = window.setInterval(() => {
      setSelectedId((prev) => {
        const currentIdx = orderedNodes.findIndex((n) => n.id === prev);
        const nextIdx = currentIdx + 1;
        if (nextIdx >= orderedNodes.length) {
          setIsPlaying(false);
          return prev;
        }
        const nextNode = orderedNodes[nextIdx];
        onInspectNode(nextNode.id);
        return nextNode.id;
      });
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isPlaying, orderedNodes, onInspectNode]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, AiDfdNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  const selectedNode = nodeMap.get(selectedId) ?? orderedNodes[0];
  const inspectedSet = useMemo(() => new Set(inspectedNodeIds), [inspectedNodeIds]);
  const inspectedCountHere = orderedNodes.filter((n) => inspectedSet.has(n.id)).length;

  if (!selectedNode) return null;

  const handleSelectNode = (id: string) => {
    setIsPlaying(false);
    setSelectedId(id);
    onInspectNode(id);
  };

  const handleTogglePlay = () => {
    const idx = orderedNodes.findIndex((n) => n.id === selectedNode.id);
    if (!isPlaying && idx >= orderedNodes.length - 1) {
      const first = orderedNodes[0];
      setSelectedId(first.id);
      onInspectNode(first.id);
      setIsPlaying(true);
      return;
    }
    onInspectNode(selectedNode.id);
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header & Controls */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              Interactive Data Flow Diagram
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {inspectedCountHere}/{orderedNodes.length} nodes inspected
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                Pause Flow
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Trace Pipeline
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setSelectedId(orderedNodes[0].id);
            }}
            aria-label="Reset pipeline trace"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 2-Zone Sandbox: 62% Interactive Canvas + 38% Live Node Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12">
        {/* Left Zone: Clickable DFD Stage */}
        <div className="xl:col-span-7 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div
            className="relative w-full h-[310px] sm:h-[340px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(148,163,184,0.22) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* SVG Directional Edges */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id={`dfd-arrow-flow-${svgUid}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
                </marker>
                <marker
                  id={`dfd-arrow-muted-${svgUid}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#94a3b8" />
                </marker>
                <marker
                  id={`dfd-arrow-feedback-${svgUid}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#059669" />
                </marker>
              </defs>

              {edges.map((edge, idx) => {
                const fromNode = nodeMap.get(edge.from);
                const toNode = nodeMap.get(edge.to);
                if (!fromNode || !toNode) return null;

                const isHighlighted =
                  edge.from === selectedNode.id || edge.to === selectedNode.id;
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const dist = Math.hypot(dx, dy) || 1;
                const trimStart = Math.min(8, dist * 0.22);
                const trimEnd = Math.min(10, dist * 0.28);

                const x1 = fromNode.x + (dx / dist) * trimStart;
                const y1 = fromNode.y + (dy / dist) * trimStart;
                const x2 = toNode.x - (dx / dist) * trimEnd;
                const y2 = toNode.y - (dy / dist) * trimEnd;

                const isFeedback = edge.style === 'feedback';
                const strokeColor = isFeedback
                  ? '#059669'
                  : isHighlighted
                    ? '#0284c7'
                    : '#94a3b8';
                const markerKey = isFeedback
                  ? 'feedback'
                  : isHighlighted
                    ? 'flow'
                    : 'muted';
                const pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;

                return (
                  <g key={`${edge.from}-${edge.to}-${idx}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHighlighted ? 0.62 : 0.4}
                      strokeDasharray={edge.style === 'branch' ? '1.6 1.2' : undefined}
                      strokeLinecap="round"
                      markerEnd={`url(#dfd-arrow-${markerKey}-${svgUid})`}
                      opacity={isHighlighted ? 0.95 : 0.65}
                    />
                    {isHighlighted && (
                      <circle r="0.95" fill={strokeColor}>
                        <animateMotion dur="1.3s" repeatCount="indefinite" path={pathD} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Midpoint Edge Labels */}
            {edges.map((edge, idx) => {
              if (!edge.label) return null;
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);
              if (!fromNode || !toNode) return null;
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;
              const isHighlighted =
                edge.from === selectedNode.id || edge.to === selectedNode.id;

              return (
                <span
                  key={`edge-lbl-${idx}`}
                  style={{ left: `${midX}%`, top: `${midY}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap border pointer-events-none ${
                    isHighlighted
                      ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-slate-900 text-sky-800 dark:text-sky-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {edge.label}
                </span>
              );
            })}

            {/* Clickable Pipeline Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNode.id;
              const isInspected = inspectedSet.has(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleSelectNode(node.id)}
                  aria-pressed={isSelected}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 min-w-[116px] max-w-[154px] text-left rounded-lg border px-2.5 py-2 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${getNodeCardStyle(
                    node.kind,
                    isSelected
                  )}`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span
                      className={`text-[9px] font-mono font-bold tracking-wider ${getKindCaptionColor(
                        node.kind
                      )}`}
                    >
                      {KIND_LABELS[node.kind]}
                    </span>
                    {isInspected && (
                      <CheckCircle2
                        className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="text-[11px] font-semibold leading-tight truncate">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5">
                    {node.shortRole}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step Strip for Keyboard / Mobile Accessibility */}
          <div className="flex flex-wrap items-center gap-1.5">
            {orderedNodes.map((n) => {
              const active = n.id === selectedNode.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleSelectNode(n.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-400'
                  }`}
                >
                  {n.stepOrder}. {n.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Zone: Deep Node Inspector */}
        <div className="xl:col-span-5 p-5 space-y-4 bg-white dark:bg-slate-900">
          <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className={`font-mono font-semibold ${getKindCaptionColor(selectedNode.kind)}`}>
                Step {selectedNode.stepOrder} · {KIND_LABELS[selectedNode.kind]}
              </span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                {selectedNode.complexity}
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {selectedNode.label}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNode.shortRole}</p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Inputs Entering Node
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedNode.inputs}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Outputs Produced
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedNode.outputs}
              </p>
            </div>

            <div className="rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/60 dark:bg-rose-950/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Common Failure Mode
              </div>
              <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                {selectedNode.failureMode}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Production Engineering Rule
              </div>
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                {selectedNode.productionTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
