import { useEffect, useState } from 'react';
import type {
  DfdEdgeVariant,
  DfdNodeStateTag,
  DfdTierId,
  SystemDfdEdge,
  SystemDfdNode,
} from '../../data/systemDfdLibraryData';

export interface DfdEdgeGeometry {
  pathD: string;
  midX: number;
  midY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  ctrlX: number;
  ctrlY: number;
}

/**
 * Computes a clean quadratic Bezier path between two SVG architecture nodes,
 * supporting curved separation when bidirectional edges connect the same pair.
 */
export function computeDfdEdgeGeometry(
  from: SystemDfdNode,
  to: SystemDfdNode,
  curveOffset = 0
): DfdEdgeGeometry {
  const fromCx = from.x + from.width / 2;
  const fromCy = from.y + from.height / 2;
  const toCx = to.x + to.width / 2;
  const toCy = to.y + to.height / 2;

  const dx = toCx - fromCx;
  const dy = toCy - fromCy;

  let startX = fromCx;
  let startY = fromCy;
  let endX = toCx;
  let endY = toCy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    startX = dx >= 0 ? from.x + from.width : from.x;
    endX = dx >= 0 ? to.x - 4 : to.x + to.width + 4;
  } else {
    startY = dy >= 0 ? from.y + from.height : from.y;
    endY = dy >= 0 ? to.y - 4 : to.y + to.height + 4;
  }

  const midLineX = (startX + endX) / 2;
  const midLineY = (startY + endY) / 2;
  const len = Math.max(1, Math.hypot(endX - startX, endY - startY));
  const nx = -(endY - startY) / len;
  const ny = (endX - startX) / len;

  const ctrlX = midLineX + nx * curveOffset * 1.8;
  const ctrlY = midLineY + ny * curveOffset * 1.8;

  // Point at t = 0.5 on quadratic Bezier
  const midX = 0.25 * startX + 0.5 * ctrlX + 0.25 * endX;
  const midY = 0.25 * startY + 0.5 * ctrlY + 0.25 * endY;

  return {
    pathD: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`,
    midX,
    midY,
    startX,
    startY,
    endX,
    endY,
    ctrlX,
    ctrlY,
  };
}

/**
 * Evaluates a point along a quadratic Bezier curve at parameter t in [0, 1].
 */
export function sampleQuadraticPoint(geo: DfdEdgeGeometry, t: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * geo.startX + 2 * mt * t * geo.ctrlX + t * t * geo.endX,
    y: mt * mt * geo.startY + 2 * mt * t * geo.ctrlY + t * t * geo.endY,
  };
}

/**
 * Smooth requestAnimationFrame packet progress hook that respects
 * prefers-reduced-motion automatically.
 */
export function useDfdPacketProgress(active: boolean, durationMs: number): number {
  const [progress, setProgress] = useState(0.5);

  useEffect(() => {
    if (!active) {
      setProgress(0.5);
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setProgress(0.5);
      return;
    }

    let rafId = 0;
    const startTs = performance.now();
    const cycle = Math.max(700, durationMs);

    const tick = (now: number) => {
      const t = ((now - startTs) % cycle) / cycle;
      setProgress(t);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [active, durationMs]);

  return progress;
}

const TIER_COLUMNS: { id: DfdTierId; label: string; x: number }[] = [
  { id: 'edge', label: '1. Client & Edge', x: 14 },
  { id: 'compute', label: '2. Compute & Routing', x: 236 },
  { id: 'cache_async', label: '3. Cache & Async', x: 466 },
  { id: 'storage', label: '4. Persistent Storage', x: 696 },
];

export type HeatmapBand = 'COOL' | 'WARM' | 'HOT' | 'CRITICAL';

export interface HeatVisualStyle {
  band: HeatmapBand;
  pct: number;
  hex: string;
  strokeHex: string;
  lightFillHex: string;
  textOnFill: string;
  subOnFill: string;
  badgeTextClass: string;
  markerId: string;
}

/**
 * Computes a smooth, perceptually clear Green -> Lime -> Amber -> Orange -> Red
 * thermal color + accessible dual-coded band label for Latency Heatmap mode.
 */
export function computeHeatVisual(heatScore: number): HeatVisualStyle {
  const clamped = Math.max(0, Math.min(1, heatScore));
  const pct = Math.round(clamped * 100);

  if (clamped < 0.3) {
    return {
      band: 'COOL',
      pct,
      hex: '#10b981', // emerald-500
      strokeHex: '#047857', // emerald-700
      lightFillHex: '#ecfdf5',
      textOnFill: '#ffffff',
      subOnFill: '#d1fae5',
      badgeTextClass: 'text-emerald-700 dark:text-emerald-400',
      markerId: 'url(#dfd-arr-heat-cool)',
    };
  }
  if (clamped < 0.55) {
    return {
      band: 'WARM',
      pct,
      hex: '#eab308', // yellow-500
      strokeHex: '#a16207', // yellow-700
      lightFillHex: '#fefce8',
      textOnFill: '#0f172a',
      subOnFill: '#422006',
      badgeTextClass: 'text-amber-700 dark:text-amber-400',
      markerId: 'url(#dfd-arr-heat-warm)',
    };
  }
  if (clamped < 0.78) {
    return {
      band: 'HOT',
      pct,
      hex: '#f97316', // orange-500
      strokeHex: '#c2410c', // orange-700
      lightFillHex: '#fff7ed',
      textOnFill: '#ffffff',
      subOnFill: '#ffedd5',
      badgeTextClass: 'text-orange-700 dark:text-orange-400',
      markerId: 'url(#dfd-arr-heat-hot)',
    };
  }
  return {
    band: 'CRITICAL',
    pct,
    hex: '#ef4444', // red-500
    strokeHex: '#b91c1c', // red-700
    lightFillHex: '#fef2f2',
    textOnFill: '#ffffff',
    subOnFill: '#fee2e2',
    badgeTextClass: 'text-rose-700 dark:text-rose-400',
    markerId: 'url(#dfd-arr-heat-critical)',
  };
}

/**
 * Derives a live normalized heat score [0..1] for a DFD node from the current
 * animation state (active step, state tag, computed latency, and load pressure).
 */
export function computeNodeHeatScore(params: {
  computedLatencyMs: number;
  loadPct: number;
  active: boolean;
  stateTag: DfdNodeStateTag;
  packetProgress?: number;
}): number {
  const { computedLatencyMs, loadPct, active, stateTag, packetProgress = 0.5 } = params;
  const latencyNorm = Math.min(1, computedLatencyMs / 115);
  const loadNorm = Math.min(1, loadPct / 100);
  const stateBoost =
    stateTag === 'BLOCKED'
      ? 0.28
      : stateTag === 'DB READ'
        ? 0.2
        : stateTag === 'QUEUED'
          ? 0.1
          : stateTag === 'CACHE HIT'
            ? -0.14
            : 0;
  // Gentle live wave tied to animation packet progress when active
  const pulse = active ? 0.12 + 0.06 * Math.sin(packetProgress * Math.PI) : -0.12;
  const raw = latencyNorm * 0.48 + loadNorm * 0.42 + stateBoost + pulse;
  return Math.max(0.06, Math.min(1, raw));
}

/**
 * Derives a live normalized heat score [0..1] for a DFD pathway (edge) from its
 * latency, target node pressure, and active animation packet traversal.
 */
export function computeEdgeHeatScore(params: {
  computedLatencyMs: number;
  targetLoadPct: number;
  active: boolean;
  variant: DfdEdgeVariant;
  packetProgress?: number;
}): number {
  const { computedLatencyMs, targetLoadPct, active, variant, packetProgress = 0.5 } = params;
  const latencyNorm = Math.min(1, computedLatencyMs / 95);
  const targetNorm = Math.min(1, targetLoadPct / 100);
  const variantBoost =
    variant === 'blocked'
      ? 0.26
      : variant === 'db-miss'
        ? 0.2
        : variant === 'cache-hit'
          ? -0.16
          : 0.02;
  const activeSurge = active ? 0.14 + 0.06 * Math.sin(packetProgress * Math.PI) : -0.16;
  const raw = latencyNorm * 0.52 + targetNorm * 0.36 + variantBoost + activeSurge;
  return Math.max(0.05, Math.min(1, raw));
}

export function DfdSvgDefs() {
  return (
    <defs>
      <pattern id="sys-dfd-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path
          d="M 24 0 L 0 0 0 24"
          fill="none"
          className="stroke-slate-200/60 dark:stroke-slate-800/60"
          strokeWidth="0.6"
        />
      </pattern>
      <filter id="dfd-heat-glow" x="-15%" y="-15%" width="130%" height="130%">
        <feGaussianBlur stdDeviation="3.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {[
        { id: 'dfd-arr-muted', cls: 'fill-slate-300 dark:fill-slate-700' },
        { id: 'dfd-arr-nominal', cls: 'fill-sky-600 dark:fill-sky-400' },
        { id: 'dfd-arr-hit', cls: 'fill-emerald-600 dark:fill-emerald-400' },
        { id: 'dfd-arr-miss', cls: 'fill-amber-600 dark:fill-amber-400' },
        { id: 'dfd-arr-async', cls: 'fill-indigo-600 dark:fill-indigo-400' },
        { id: 'dfd-arr-blocked', cls: 'fill-rose-600 dark:fill-rose-400' },
      ].map((m) => (
        <marker
          key={m.id}
          id={m.id}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" className={m.cls} />
        </marker>
      ))}
      {[
        { id: 'dfd-arr-heat-cool', fill: '#10b981' },
        { id: 'dfd-arr-heat-warm', fill: '#eab308' },
        { id: 'dfd-arr-heat-hot', fill: '#f97316' },
        { id: 'dfd-arr-heat-critical', fill: '#ef4444' },
      ].map((m) => (
        <marker
          key={m.id}
          id={m.id}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={m.fill} />
        </marker>
      ))}
    </defs>
  );
}

export function DfdGridBackdrop() {
  return (
    <g>
      <rect x="0" y="0" width="900" height="310" fill="url(#sys-dfd-grid)" rx="12" />
      {TIER_COLUMNS.map((col) => (
        <g key={col.id}>
          <rect
            x={col.x}
            y={12}
            width={194}
            height={286}
            rx={10}
            className="fill-white/55 dark:fill-slate-900/45 stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <text
            x={col.x + 97}
            y={30}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono font-semibold"
          >
            {col.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function getEdgeStyle(variant: DfdEdgeVariant, active: boolean) {
  if (!active) {
    return {
      stroke: 'stroke-slate-300 dark:stroke-slate-700',
      marker: 'url(#dfd-arr-muted)',
      packetFill: 'fill-slate-400',
      labelFill: 'fill-slate-500 dark:fill-slate-400',
    };
  }
  switch (variant) {
    case 'cache-hit':
      return {
        stroke: 'stroke-emerald-600 dark:stroke-emerald-400',
        marker: 'url(#dfd-arr-hit)',
        packetFill: 'fill-emerald-500 dark:fill-emerald-300',
        labelFill: 'fill-emerald-800 dark:fill-emerald-300',
      };
    case 'db-miss':
      return {
        stroke: 'stroke-amber-600 dark:stroke-amber-400',
        marker: 'url(#dfd-arr-miss)',
        packetFill: 'fill-amber-500 dark:fill-amber-300',
        labelFill: 'fill-amber-800 dark:fill-amber-300',
      };
    case 'async':
      return {
        stroke: 'stroke-indigo-600 dark:stroke-indigo-400',
        marker: 'url(#dfd-arr-async)',
        packetFill: 'fill-indigo-500 dark:fill-indigo-300',
        labelFill: 'fill-indigo-800 dark:fill-indigo-300',
      };
    case 'blocked':
      return {
        stroke: 'stroke-rose-600 dark:stroke-rose-400',
        marker: 'url(#dfd-arr-blocked)',
        packetFill: 'fill-rose-500 dark:fill-rose-300',
        labelFill: 'fill-rose-800 dark:fill-rose-300',
      };
    default:
      return {
        stroke: 'stroke-sky-600 dark:stroke-sky-400',
        marker: 'url(#dfd-arr-nominal)',
        packetFill: 'fill-sky-500 dark:fill-sky-300',
        labelFill: 'fill-sky-800 dark:fill-sky-300',
      };
  }
}

export function DfdAnimatedEdge({
  edge,
  fromNode,
  toNode,
  active,
  packetProgress,
  packetLabel,
  computedLatencyMs,
  selected,
  heatmapEnabled = false,
  heatScore = 0,
  onInspect,
}: {
  edge: SystemDfdEdge;
  fromNode: SystemDfdNode;
  toNode: SystemDfdNode;
  active: boolean;
  packetProgress: number;
  packetLabel?: string;
  computedLatencyMs: number;
  selected: boolean;
  heatmapEnabled?: boolean;
  heatScore?: number;
  onInspect: () => void;
}) {
  const geo = computeDfdEdgeGeometry(fromNode, toNode, edge.curveOffset ?? 0);
  const style = getEdgeStyle(edge.variant, active);
  const heat = computeHeatVisual(heatScore);
  const packetPt = sampleQuadraticPoint(geo, packetProgress);

  return (
    <g
      onClick={onInspect}
      onMouseEnter={onInspect}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Inspect data flow edge: ${edge.label} (${computedLatencyMs} ms${heatmapEnabled ? `, ${heat.band} ${heat.pct}%` : ''})`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInspect();
        }
      }}
    >
      {/* Wide invisible hit target for easy hover/click inspection */}
      <path d={geo.pathD} fill="none" stroke="transparent" strokeWidth={16} />

      {/* Thermal Halo Underlay when Latency Heatmap is Active */}
      {heatmapEnabled && (
        <path
          d={geo.pathD}
          fill="none"
          stroke={heat.hex}
          strokeWidth={active ? 9 : 6}
          strokeOpacity={active ? 0.28 : 0.14}
          strokeLinecap="round"
        />
      )}

      <path
        d={geo.pathD}
        fill="none"
        stroke={heatmapEnabled ? heat.hex : undefined}
        strokeWidth={selected ? 3.4 : active ? 2.8 : heatmapEnabled ? 2.2 : 1.3}
        strokeDasharray={edge.variant === 'async' ? '6 4' : undefined}
        className={heatmapEnabled ? 'transition-all duration-300' : `transition-colors ${style.stroke}`}
        markerEnd={heatmapEnabled ? heat.markerId : style.marker}
      />

      {/* Edge Label + Latency / Thermal Band */}
      <g transform={`translate(${geo.midX}, ${geo.midY - 8})`}>
        <rect
          x={heatmapEnabled ? -60 : -54}
          y={-11}
          width={heatmapEnabled ? 120 : 108}
          height={20}
          rx={5}
          stroke={heatmapEnabled ? heat.strokeHex : undefined}
          className={
            heatmapEnabled
              ? 'fill-white dark:fill-slate-900'
              : active || selected
                ? 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                : 'fill-white/85 dark:fill-slate-900/80 stroke-slate-200 dark:stroke-slate-800'
          }
          strokeWidth={heatmapEnabled ? 1.4 : 1}
        />
        <text
          x={0}
          y={2}
          textAnchor="middle"
          fill={heatmapEnabled ? heat.strokeHex : undefined}
          className={
            heatmapEnabled
              ? 'text-[8.5px] font-mono font-bold'
              : `text-[9px] font-mono font-semibold ${style.labelFill}`
          }
        >
          {heatmapEnabled
            ? `${heat.band} ${heat.pct}% · ${computedLatencyMs}ms`
            : `${edge.label.length > 15 ? `${edge.label.slice(0, 14)}…` : edge.label} · ${computedLatencyMs}ms`}
        </text>
      </g>

      {/* Live Animated Packet Glyph */}
      {active && (
        <g transform={`translate(${packetPt.x}, ${packetPt.y})`}>
          <circle
            r={6.5}
            fill={heatmapEnabled ? heat.hex : undefined}
            className={heatmapEnabled ? 'opacity-30' : `${style.packetFill} opacity-25`}
          />
          <circle
            r={4}
            fill={heatmapEnabled ? heat.hex : undefined}
            className={heatmapEnabled ? undefined : style.packetFill}
          />
          {packetLabel && (
            <g transform="translate(0, -14)">
              <rect
                x={-38}
                y={-9}
                width={76}
                height={15}
                rx={4}
                className="fill-slate-900 dark:fill-slate-100"
              />
              <text
                x={0}
                y={1.5}
                textAnchor="middle"
                className="fill-white dark:fill-slate-950 text-[8.5px] font-mono font-bold"
              >
                {packetLabel.length > 14 ? `${packetLabel.slice(0, 13)}…` : packetLabel}
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  );
}

function getNodeColors(tag: DfdNodeStateTag, active: boolean) {
  if (tag === 'CACHE HIT') {
    return {
      rect: 'fill-emerald-600 dark:fill-emerald-500 stroke-emerald-700 dark:stroke-emerald-300',
      title: 'fill-white dark:fill-slate-950',
      sub: 'fill-emerald-100 dark:fill-slate-900',
      barTrack: 'fill-emerald-800/40 dark:fill-slate-950/30',
      barFill: 'fill-white dark:fill-slate-950',
    };
  }
  if (tag === 'BLOCKED') {
    return {
      rect: 'fill-rose-600 dark:fill-rose-500 stroke-rose-700 dark:stroke-rose-300',
      title: 'fill-white dark:fill-slate-950',
      sub: 'fill-rose-100 dark:fill-slate-900',
      barTrack: 'fill-rose-800/40 dark:fill-slate-950/30',
      barFill: 'fill-white dark:fill-slate-950',
    };
  }
  if (tag === 'DB READ') {
    return {
      rect: 'fill-amber-600 dark:fill-amber-500 stroke-amber-700 dark:stroke-amber-300',
      title: 'fill-white dark:fill-slate-950',
      sub: 'fill-amber-100 dark:fill-slate-900',
      barTrack: 'fill-amber-800/40 dark:fill-slate-950/30',
      barFill: 'fill-white dark:fill-slate-950',
    };
  }
  if (tag === 'QUEUED') {
    return {
      rect: 'fill-indigo-600 dark:fill-indigo-500 stroke-indigo-700 dark:stroke-indigo-300',
      title: 'fill-white dark:fill-slate-950',
      sub: 'fill-indigo-100 dark:fill-slate-900',
      barTrack: 'fill-indigo-800/40 dark:fill-slate-950/30',
      barFill: 'fill-white dark:fill-slate-950',
    };
  }
  if (active) {
    return {
      rect: 'fill-sky-600 dark:fill-sky-500 stroke-sky-700 dark:stroke-sky-300',
      title: 'fill-white dark:fill-slate-950',
      sub: 'fill-sky-100 dark:fill-slate-900',
      barTrack: 'fill-sky-800/40 dark:fill-slate-950/30',
      barFill: 'fill-white dark:fill-slate-950',
    };
  }
  return {
    rect: 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700',
    title: 'fill-slate-900 dark:fill-slate-100',
    sub: 'fill-slate-500 dark:fill-slate-400',
    barTrack: 'fill-slate-200 dark:fill-slate-800',
    barFill: 'fill-slate-400 dark:fill-slate-600',
  };
}

export function DfdInteractiveNode({
  node,
  active,
  selected,
  stateTag,
  computedLatencyMs,
  loadPct,
  heatmapEnabled = false,
  heatScore = 0,
  onInspect,
}: {
  node: SystemDfdNode;
  active: boolean;
  selected: boolean;
  stateTag: DfdNodeStateTag;
  computedLatencyMs: number;
  loadPct: number;
  heatmapEnabled?: boolean;
  heatScore?: number;
  onInspect: () => void;
}) {
  const palette = getNodeColors(stateTag, active);
  const heat = computeHeatVisual(heatScore);
  const clampedLoad = Math.max(8, Math.min(100, heatmapEnabled ? heat.pct : loadPct));
  const barWidth = Math.round(((node.width - 24) * clampedLoad) / 100);

  return (
    <g
      onClick={onInspect}
      onMouseEnter={onInspect}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Inspect ${node.label} (${heatmapEnabled ? `${heat.band} ${heat.pct}%` : stateTag}, ${computedLatencyMs} ms)`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onInspect();
        }
      }}
    >
      {/* Subtle Thermal Aura Ring on Hot/Critical Nodes in Heatmap Mode */}
      {heatmapEnabled && heatScore >= 0.55 && (
        <rect
          x={node.x - 4}
          y={node.y - 4}
          width={node.width + 8}
          height={node.height + 8}
          rx={13}
          fill={heat.hex}
          fillOpacity={heatScore >= 0.78 ? 0.24 : 0.14}
          filter="url(#dfd-heat-glow)"
        />
      )}

      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        rx={10}
        fill={heatmapEnabled ? heat.hex : undefined}
        stroke={heatmapEnabled ? heat.strokeHex : undefined}
        strokeWidth={selected ? 2.8 : active || heatmapEnabled ? 2.2 : 1.2}
        className={heatmapEnabled ? 'transition-all duration-300' : `transition-colors ${palette.rect}`}
      />

      {/* Explicit State Tag / Heat Band + Latency (Dual-Coded Accessibility) */}
      <text
        x={node.x + 12}
        y={node.y + 17}
        fill={heatmapEnabled ? heat.subOnFill : undefined}
        className={heatmapEnabled ? 'text-[8.5px] font-mono font-bold' : `text-[8.5px] font-mono font-bold ${palette.sub}`}
      >
        {heatmapEnabled ? `${heat.band} ${heat.pct}%` : stateTag}
      </text>
      <text
        x={node.x + node.width - 12}
        y={node.y + 17}
        textAnchor="end"
        fill={heatmapEnabled ? heat.subOnFill : undefined}
        className={heatmapEnabled ? 'text-[9px] font-mono font-semibold' : `text-[9px] font-mono font-semibold ${palette.sub}`}
      >
        {computedLatencyMs} ms
      </text>

      {/* Node Title & Subtitle */}
      <text
        x={node.x + 12}
        y={node.y + 35}
        fill={heatmapEnabled ? heat.textOnFill : undefined}
        className={heatmapEnabled ? 'text-[12px] font-semibold' : `text-[12px] font-semibold ${palette.title}`}
      >
        {node.label.length > 21 ? `${node.label.slice(0, 20)}…` : node.label}
      </text>
      <text
        x={node.x + 12}
        y={node.y + 50}
        fill={heatmapEnabled ? heat.subOnFill : undefined}
        className={heatmapEnabled ? 'text-[9.5px] font-mono' : `text-[9.5px] font-mono ${palette.sub}`}
      >
        {node.sublabel}
      </text>

      {/* Live Utilization / Latency Pressure Bar */}
      <rect
        x={node.x + 12}
        y={node.y + 57}
        width={node.width - 24}
        height={4}
        rx={2}
        fill={heatmapEnabled ? 'rgba(15, 23, 42, 0.25)' : undefined}
        className={heatmapEnabled ? undefined : palette.barTrack}
      />
      <rect
        x={node.x + 12}
        y={node.y + 57}
        width={barWidth}
        height={4}
        rx={2}
        fill={heatmapEnabled ? heat.textOnFill : undefined}
        className={heatmapEnabled ? undefined : palette.barFill}
      />
    </g>
  );
}
