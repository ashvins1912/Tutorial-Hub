import { useEffect, useId, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type {
  OodConcept,
  OodNodeKind,
  OodNodeState,
  OodVisualEdge,
  OodVisualNode,
} from '../data/ood/oodTypes';

interface OodAnimationStageProps {
  concept: OodConcept;
}

type PlaybackSpeed = 0.75 | 1 | 1.5;

const SPEEDS: PlaybackSpeed[] = [0.75, 1, 1.5];

const KIND_TAG_LABELS: Record<OodNodeKind, string> = {
  client: 'CLIENT',
  interface: 'INTERFACE',
  class: 'CLASS',
  object: 'OBJECT',
  memory: 'MEMORY',
  gate: 'GATE',
  event: 'EVENT',
  broken: 'SMELL',
};

function getNodeSurfaceClasses(node: OodVisualNode): string {
  const isDashed = node.kind === 'interface';
  const borderStyle = isDashed ? 'border-dashed' : 'border-solid';

  const stateMap: Record<OodNodeState, string> = {
    idle: 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100',
    active:
      'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/80 text-slate-900 dark:text-sky-50 ring-2 ring-sky-500/25',
    highlight:
      'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/75 text-slate-900 dark:text-indigo-50 ring-2 ring-indigo-500/20',
    warn:
      'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/70 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/20',
    error:
      'border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-950/75 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/25',
    success:
      'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/75 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20',
  };

  return `${borderStyle} ${stateMap[node.state]}`;
}

function getKindTextClass(kind: OodNodeKind, state: OodNodeState): string {
  if (state === 'error' || kind === 'broken') return 'text-rose-700 dark:text-rose-300';
  if (state === 'warn') return 'text-amber-700 dark:text-amber-300';
  if (state === 'success') return 'text-emerald-700 dark:text-emerald-300';
  if (kind === 'interface' || state === 'active') return 'text-sky-700 dark:text-sky-300';
  if (kind === 'gate' || state === 'highlight') return 'text-indigo-700 dark:text-indigo-300';
  return 'text-slate-500 dark:text-slate-400';
}

function getEdgeStroke(edge: OodVisualEdge): {
  stroke: string;
  strokeWidth: number;
  dashArray?: string;
  markerKey: 'default' | 'active' | 'blocked' | 'inherit';
  pulseColor: string;
} {
  if (edge.style === 'blocked') {
    return {
      stroke: '#e11d48',
      strokeWidth: 0.55,
      dashArray: '1.6 1.2',
      markerKey: 'blocked',
      pulseColor: '#f43f5e',
    };
  }
  if (edge.style === 'inherit') {
    return {
      stroke: edge.active ? '#0284c7' : '#64748b',
      strokeWidth: edge.active ? 0.55 : 0.4,
      dashArray: edge.active ? undefined : '1.4 1.1',
      markerKey: 'inherit',
      pulseColor: '#0ea5e9',
    };
  }
  if (edge.active) {
    return {
      stroke: '#0284c7',
      strokeWidth: 0.6,
      dashArray: edge.style === 'dashed' ? '1.8 1.2' : undefined,
      markerKey: 'active',
      pulseColor: '#0ea5e9',
    };
  }
  return {
    stroke: '#94a3b8',
    strokeWidth: 0.38,
    dashArray: edge.style === 'dashed' ? '1.6 1.2' : undefined,
    markerKey: 'default',
    pulseColor: '#0ea5e9',
  };
}

function getBadgeToneClasses(badge: string): string {
  const upper = badge.toUpperCase();
  if (upper.includes('BROKEN') || upper.includes('SMELL') || upper.includes('BAD') || upper.includes('TRAP')) {
    return 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300';
  }
  if (upper.includes('CLEAN') || upper.includes('AFTER') || upper.includes('SOLVED') || upper.includes('WIN')) {
    return 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300';
  }
  return 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300';
}

export function OodAnimationStage({ concept }: OodAnimationStageProps) {
  const svgUid = useId().replace(/:/g, '');
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const frames = concept.frames;
  const safeIdx = Math.min(frameIdx, Math.max(0, frames.length - 1));
  const frame = frames[safeIdx];

  // Reset playback cleanly whenever learner switches concept
  useEffect(() => {
    setFrameIdx(0);
    setIsPlaying(false);
  }, [concept.id]);

  // Auto-advance timer when playing
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const intervalMs = Math.round(2800 / speed);
    const timer = window.setInterval(() => {
      setFrameIdx((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, frames.length]);

  const nodeById = useMemo(() => {
    const map = new Map<string, OodVisualNode>();
    if (!frame) return map;
    for (const node of frame.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [frame]);

  if (!frame) return null;

  const isFirst = safeIdx === 0;
  const isLast = safeIdx === frames.length - 1;

  const handleTogglePlay = () => {
    if (!isPlaying && isLast) {
      setFrameIdx(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Step Header & Caption */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded border text-[11px] font-mono font-semibold tracking-wide uppercase ${getBadgeToneClasses(
                frame.badge
              )}`}
            >
              {frame.badge}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Step {safeIdx + 1} of {frames.length}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {frame.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {frame.caption}
          </p>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 shrink-0 self-start">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1">
            Speed
          </span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded text-xs font-mono tabular-nums transition-colors ${
                speed === s
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Architecture & Memory Animation Canvas */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/70">
        <div
          className="relative w-full h-[320px] sm:h-[360px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(148,163,184,0.22) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* SVG Directional Edges & Signal Pulses */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id={`arrow-default-${svgUid}`}
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
                id={`arrow-active-${svgUid}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
              </marker>
              <marker
                id={`arrow-blocked-${svgUid}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#e11d48" />
              </marker>
              <marker
                id={`arrow-inherit-${svgUid}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path
                  d="M 1 1.5 L 9 5 L 1 8.5 z"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                />
              </marker>
            </defs>

            {frame.edges.map((edge, idx) => {
              const fromNode = nodeById.get(edge.from);
              const toNode = nodeById.get(edge.to);
              if (!fromNode || !toNode) return null;

              // Shorten path slightly so arrowheads land outside node centers cleanly
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const dist = Math.hypot(dx, dy) || 1;
              const trimStart = Math.min(7, dist * 0.2);
              const trimEnd = Math.min(9.5, dist * 0.28);

              const x1 = fromNode.x + (dx / dist) * trimStart;
              const y1 = fromNode.y + (dy / dist) * trimStart;
              const x2 = toNode.x - (dx / dist) * trimEnd;
              const y2 = toNode.y - (dy / dist) * trimEnd;

              const styleSpec = getEdgeStroke(edge);
              const pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
              const animDur = `${(1.35 / speed).toFixed(2)}s`;

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={styleSpec.stroke}
                    strokeWidth={styleSpec.strokeWidth}
                    strokeDasharray={styleSpec.dashArray}
                    strokeLinecap="round"
                    markerEnd={`url(#arrow-${styleSpec.markerKey}-${svgUid})`}
                    opacity={edge.active || edge.style === 'blocked' ? 0.95 : 0.65}
                  />
                  {(edge.active || edge.style === 'call') && (
                    <circle r="0.95" fill={styleSpec.pulseColor}>
                      <animateMotion dur={animDur} repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Midpoint Edge Labels */}
          {frame.edges.map((edge, idx) => {
            if (!edge.label) return null;
            const fromNode = nodeById.get(edge.from);
            const toNode = nodeById.get(edge.to);
            if (!fromNode || !toNode) return null;
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            const isBlocked = edge.style === 'blocked';
            return (
              <div
                key={`lbl-${edge.from}-${edge.to}-${idx}`}
                style={{ left: `${midX}%`, top: `${midY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap border pointer-events-none transition-all duration-300 ${
                  isBlocked
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-200 font-semibold'
                    : edge.active
                      ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-slate-900 text-sky-800 dark:text-sky-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-slate-600 dark:text-slate-300'
                }`}
              >
                {edge.label}
              </div>
            );
          })}

          {/* Visual Architecture & Memory Nodes */}
          {frame.nodes.map((node) => (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 min-w-[118px] max-w-[178px] rounded-lg border px-2.5 py-2 transition-all duration-500 ${getNodeSurfaceClasses(
                node
              )}`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span
                  className={`text-[9px] font-mono font-bold tracking-wider uppercase ${getKindTextClass(
                    node.kind,
                    node.state
                  )}`}
                >
                  {KIND_TAG_LABELS[node.kind]}
                </span>
                {node.state === 'active' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shrink-0"
                    aria-hidden="true"
                  />
                )}
                {node.state === 'error' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {node.state === 'success' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="text-xs font-semibold leading-tight truncate">{node.label}</div>

              {node.sublabel && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                  {node.sublabel}
                </div>
              )}

              {node.fields && node.fields.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/70 space-y-0.5">
                  {node.fields.slice(0, 3).map((field, fIdx) => (
                    <div
                      key={fIdx}
                      className="text-[10px] font-mono leading-tight text-slate-700 dark:text-slate-300 truncate"
                    >
                      {field}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live State & Memory Watch Strip */}
        {frame.stateWatch.length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {frame.stateWatch.map((item, idx) => {
              const toneClass =
                item.tone === 'good'
                  ? 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : item.tone === 'bad'
                    ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    : item.tone === 'warn'
                      ? 'border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
              return (
                <div
                  key={`${item.key}-${idx}`}
                  className={`rounded-lg border px-3 py-2 flex items-baseline justify-between gap-2 text-xs ${toneClass}`}
                >
                  <span className="font-medium opacity-80 truncate">{item.key}</span>
                  <span className="font-mono font-semibold tabular-nums text-right truncate">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Playback Controls & Step Scrubber */}
      <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setFrameIdx((prev) => Math.max(0, prev - 1));
            }}
            disabled={isFirst}
            aria-label="Previous animation step"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Prev
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                {isLast ? 'Replay Animation' : 'Play Animation'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setFrameIdx((prev) => Math.min(frames.length - 1, prev + 1));
            }}
            disabled={isLast}
            aria-label="Next animation step"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setFrameIdx(0);
            }}
            aria-label="Reset animation to step 1"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Clickable Step Scrubber */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Animation steps">
          {frames.map((f, idx) => {
            const active = idx === safeIdx;
            return (
              <button
                key={`${concept.id}-step-${f.stepNumber}`}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setIsPlaying(false);
                  setFrameIdx(idx);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono tabular-nums transition-colors ${
                  active
                    ? 'bg-sky-600 dark:bg-sky-400 text-white dark:text-slate-950 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {idx + 1}. {f.badge}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
