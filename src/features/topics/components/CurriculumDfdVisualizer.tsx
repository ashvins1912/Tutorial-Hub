import { useEffect, useId, useMemo, useState } from 'react';
import {
  ArrowRight,
  PanelRightOpen,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import type {
  CurriculumDfdGraph,
  CurriculumDfdNode,
  CurriculumDfdNodeKind,
  CurriculumTopic,
} from '../types';
import { getCurriculumDfdGraph } from '../data/curriculumDfdBuilder';

interface CurriculumDfdVisualizerProps {
  topic: CurriculumTopic;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  variant?: 'full' | 'compact';
  onOpenFullDfdTab?: () => void;
}

const KIND_LABELS: Record<CurriculumDfdNodeKind, string> = {
  'external-input': 'External Input',
  process: 'Core Process',
  'data-store': 'Data Store',
  'external-output': 'Output Sink',
};

const NODE_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  'input-entity': { x: 18, y: 36, w: 156, h: 92 },
  'process-core': { x: 222, y: 30, w: 178, h: 104 },
  'state-store': { x: 222, y: 196, w: 178, h: 86 },
  'process-guard': { x: 448, y: 30, w: 178, h: 104 },
  'output-entity': { x: 674, y: 36, w: 156, h: 92 },
};

function getNodeGeometryClasses(kind: CurriculumDfdNodeKind, isSelected: boolean): string {
  if (isSelected) {
    return 'border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500/25';
  }
  if (kind === 'data-store') {
    return 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/25 hover:border-amber-500';
  }
  if (kind === 'external-input') {
    return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500';
  }
  if (kind === 'external-output') {
    return 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500';
  }
  return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500';
}

function getKindTextColor(kind: CurriculumDfdNodeKind): string {
  if (kind === 'data-store') return 'text-amber-800 dark:text-amber-300';
  if (kind === 'external-output') return 'text-emerald-800 dark:text-emerald-300';
  if (kind === 'process') return 'text-sky-800 dark:text-sky-300';
  return 'text-slate-600 dark:text-slate-400';
}

export function CurriculumDfdVisualizer({
  topic,
  selectedNodeId,
  onSelectNode,
  variant = 'full',
  onOpenFullDfdTab,
}: CurriculumDfdVisualizerProps) {
  const svgUid = useId().replace(/:/g, '');
  const graph: CurriculumDfdGraph = useMemo(() => getCurriculumDfdGraph(topic), [topic]);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeIndex = useMemo(() => {
    const idx = graph.nodes.findIndex((n) => n.id === selectedNodeId);
    return idx >= 0 ? idx : 0;
  }, [graph.nodes, selectedNodeId]);

  const activeNode: CurriculumDfdNode = graph.nodes[activeIndex] ?? graph.nodes[0];

  useEffect(() => {
    setIsPlaying(false);
  }, [topic.id]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      const nextIdx = activeIndex + 1;
      if (nextIdx >= graph.nodes.length) {
        setIsPlaying(false);
        return;
      }
      onSelectNode(graph.nodes[nextIdx].id);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeIndex, graph.nodes, onSelectNode]);

  // Compact clickable DFD pipeline strip for TheoryMentalModelPane
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Click any DFD stage to inspect its Time Complexity, Space Complexity, Input, and Output in the side drawer.
          </div>
          {onOpenFullDfdTab && (
            <button
              type="button"
              onClick={onOpenFullDfdTab}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap shrink-0"
            >
              <PanelRightOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Open Full DFD Visualizer
            </button>
          )}
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex items-stretch gap-1.5 min-w-max">
            {graph.nodes.map((node, idx) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div key={node.id} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <ArrowRight
                      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    aria-pressed={isSelected}
                    className={`w-40 text-left px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      node.kind === 'data-store'
                        ? 'border-y-2 border-x border-dashed rounded-md'
                        : node.kind === 'process'
                          ? 'rounded-xl border'
                          : 'rounded-md border'
                    } ${getNodeGeometryClasses(node.kind, isSelected)}`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span className={`font-bold ${getKindTextColor(node.kind)}`}>
                        {node.code} · {KIND_LABELS[node.kind]}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {node.label}
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate tabular-nums">
                      {node.timeComplexity}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full Interactive Level-1 DFD Canvas for CurriculumWorkbench Playground
  return (
    <div className="space-y-4">
      {/* Header & Trace Controls */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              Level-1 Data Flow Diagram
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{graph.optimalTime} Time</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{graph.optimalSpace} Space</span>
          </div>
          <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            {graph.topicTitle} Pipeline Architecture
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-[65ch]">
            Click any entity, process, or data store node below to inspect its Time Complexity, Space Complexity, Input, and Output metadata in the persistent side drawer.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!isPlaying && activeIndex >= graph.nodes.length - 1) {
                onSelectNode(graph.nodes[0].id);
              }
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {isPlaying ? 'Pause' : 'Trace Flow'}
          </button>

          <button
            type="button"
            disabled={activeIndex <= 0}
            onClick={() => {
              setIsPlaying(false);
              onSelectNode(graph.nodes[Math.max(0, activeIndex - 1)].id);
            }}
            aria-label="Previous DFD node"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35"
          >
            <SkipBack className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            disabled={activeIndex >= graph.nodes.length - 1}
            onClick={() => {
              setIsPlaying(false);
              onSelectNode(graph.nodes[Math.min(graph.nodes.length - 1, activeIndex + 1)].id);
            }}
            aria-label="Next DFD node"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-35"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onSelectNode(graph.nodes[0].id);
            }}
            aria-label="Reset DFD flow"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Interactive SVG DFD Stage */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 overflow-x-auto">
        <svg
          viewBox="0 0 850 306"
          role="img"
          aria-label={`${graph.topicTitle} interactive Level-1 Data Flow Diagram`}
          className="w-full min-w-[720px] h-auto select-none"
        >
          <defs>
            <marker
              id={`cur-dfd-arrow-active-${svgUid}`}
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-sky-600 dark:fill-sky-400" />
            </marker>
            <marker
              id={`cur-dfd-arrow-muted-${svgUid}`}
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-600" />
            </marker>
            <marker
              id={`cur-dfd-arrow-store-${svgUid}`}
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-amber-600 dark:fill-amber-400" />
            </marker>
          </defs>

          {/* Subtle blueprint dot grid */}
          <g className="text-slate-300/60 dark:text-slate-800/70" fill="currentColor">
            {Array.from({ length: 17 }).map((_, cx) =>
              Array.from({ length: 6 }).map((__, cy) => (
                <circle key={`${cx}-${cy}`} cx={24 + cx * 50} cy={22 + cy * 54} r="1" />
              )),
            )}
          </g>

          {/* Directional Edges */}
          {graph.edges.map((edge) => {
            const fromPos = NODE_POSITIONS[edge.from];
            const toPos = NODE_POSITIONS[edge.to];
            if (!fromPos || !toPos) return null;

            const isEdgeHighlighted =
              selectedNodeId === edge.from || selectedNodeId === edge.to;
            const isStoreIo = edge.kind === 'store-io';

            let pathD = '';
            let labelX = 0;
            let labelY = 0;

            if (edge.from === 'process-core' && edge.to === 'state-store') {
              const x = fromPos.x + fromPos.w / 2;
              pathD = `M ${x} ${fromPos.y + fromPos.h} L ${x} ${toPos.y}`;
              labelX = x + 64;
              labelY = fromPos.y + fromPos.h + 32;
            } else if (edge.from === 'state-store' && edge.to === 'process-guard') {
              const startX = fromPos.x + fromPos.w;
              const startY = fromPos.y + fromPos.h / 2;
              const endX = toPos.x + toPos.w / 2;
              const endY = toPos.y + toPos.h;
              pathD = `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY}`;
              labelX = (startX + endX) / 2 + 10;
              labelY = startY - 10;
            } else {
              const startX = fromPos.x + fromPos.w;
              const startY = fromPos.y + fromPos.h / 2;
              const endX = toPos.x;
              const endY = toPos.y + toPos.h / 2;
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              labelX = (startX + endX) / 2;
              labelY = startY - 11;
            }

            const strokeClass = isEdgeHighlighted
              ? isStoreIo
                ? 'stroke-amber-600 dark:stroke-amber-400'
                : 'stroke-sky-600 dark:stroke-sky-400'
              : 'stroke-slate-300 dark:stroke-slate-700';

            const markerEnd = isEdgeHighlighted
              ? isStoreIo
                ? `url(#cur-dfd-arrow-store-${svgUid})`
                : `url(#cur-dfd-arrow-active-${svgUid})`
              : `url(#cur-dfd-arrow-muted-${svgUid})`;

            return (
              <g key={edge.id}>
                <path
                  d={pathD}
                  fill="none"
                  strokeWidth={isEdgeHighlighted ? 2.4 : 1.75}
                  strokeDasharray={isStoreIo ? '5 4' : undefined}
                  className={`${strokeClass} transition-colors`}
                  markerEnd={markerEnd}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isEdgeHighlighted
                      ? isStoreIo
                        ? 'fill-amber-700 dark:fill-amber-300 font-semibold'
                        : 'fill-sky-700 dark:fill-sky-300 font-semibold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Clickable Level-1 DFD Nodes */}
          {graph.nodes.map((node) => {
            const pos = NODE_POSITIONS[node.id];
            if (!pos) return null;
            const isSelected = selectedNodeId === node.id;

            const fillClass = isSelected
              ? 'fill-sky-50 dark:fill-sky-950/90'
              : node.kind === 'data-store'
                ? 'fill-amber-50/90 dark:fill-amber-950/40'
                : node.kind === 'external-output'
                  ? 'fill-emerald-50/80 dark:fill-emerald-950/35'
                  : 'fill-white dark:fill-slate-900';

            const strokeClass = isSelected
              ? 'stroke-sky-600 dark:stroke-sky-400'
              : node.kind === 'data-store'
                ? 'stroke-amber-500 dark:stroke-amber-700'
                : node.kind === 'external-output'
                  ? 'stroke-emerald-500 dark:stroke-emerald-700'
                  : 'stroke-slate-300 dark:stroke-slate-700';

            const trimmedLabel =
              node.label.length > 22 ? `${node.label.slice(0, 21)}…` : node.label;
            const trimmedTime =
              node.timeComplexity.length > 24
                ? `${node.timeComplexity.slice(0, 23)}…`
                : node.timeComplexity;
            const trimmedSpace =
              node.spaceComplexity.length > 24
                ? `${node.spaceComplexity.slice(0, 23)}…`
                : node.spaceComplexity;

            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${node.code} ${node.label}. Time ${node.timeComplexity}, Space ${node.spaceComplexity}. Click to inspect metadata.`}
                onClick={() => {
                  setIsPlaying(false);
                  onSelectNode(node.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsPlaying(false);
                    onSelectNode(node.id);
                  }
                }}
                className="cursor-pointer focus:outline-none group"
              >
                {node.kind === 'data-store' ? (
                  <>
                    {/* Open-sided Level-1 DFD Data Store geometry */}
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.w}
                      height={pos.h}
                      className={`${fillClass} transition-colors`}
                    />
                    <line
                      x1={pos.x}
                      y1={pos.y}
                      x2={pos.x + pos.w}
                      y2={pos.y}
                      strokeWidth={isSelected ? 2.8 : 2}
                      className={strokeClass}
                    />
                    <line
                      x1={pos.x}
                      y1={pos.y + pos.h}
                      x2={pos.x + pos.w}
                      y2={pos.y + pos.h}
                      strokeWidth={isSelected ? 2.8 : 2}
                      className={strokeClass}
                    />
                    <line
                      x1={pos.x}
                      y1={pos.y}
                      x2={pos.x}
                      y2={pos.y + pos.h}
                      strokeWidth={isSelected ? 2.8 : 2}
                      className={strokeClass}
                    />
                  </>
                ) : (
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx={node.kind === 'process' ? 14 : 4}
                    strokeWidth={isSelected ? 2.6 : 1.6}
                    className={`${fillClass} ${strokeClass} transition-colors`}
                  />
                )}

                {/* Node Code & Kind Header */}
                <text
                  x={pos.x + 12}
                  y={pos.y + 20}
                  className={`text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'fill-sky-700 dark:fill-sky-300'
                      : node.kind === 'data-store'
                        ? 'fill-amber-800 dark:fill-amber-300'
                        : node.kind === 'external-output'
                          ? 'fill-emerald-800 dark:fill-emerald-300'
                          : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {node.code} · {KIND_LABELS[node.kind]}
                </text>

                {/* Node Title */}
                <text
                  x={pos.x + 12}
                  y={pos.y + 40}
                  className="text-[12px] font-semibold fill-slate-900 dark:fill-slate-100"
                >
                  {trimmedLabel}
                </text>

                {/* Time & Space Complexity Inline Preview */}
                <text
                  x={pos.x + 12}
                  y={pos.y + 60}
                  className="text-[10px] font-mono fill-slate-600 dark:fill-slate-300"
                >
                  T: {trimmedTime}
                </text>
                <text
                  x={pos.x + 12}
                  y={pos.y + 76}
                  className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                >
                  S: {trimmedSpace}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick Clickable Stage Selector Row (accessible fallback + keyboard parity) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {graph.nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  onSelectNode(node.id);
                }}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500'
                }`}
              >
                <span className="font-mono text-[10px] tabular-nums opacity-75">{node.code}</span>
                <span>{node.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          Selected: {activeNode.code} ({activeIndex + 1}/{graph.nodes.length})
        </div>
      </div>
    </div>
  );
}
