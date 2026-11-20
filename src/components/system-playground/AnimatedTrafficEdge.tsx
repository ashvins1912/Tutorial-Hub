import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { SystemEdge } from '../../types/system';
import { formatRps } from './iconMap';

const AnimatedTrafficEdgeComponent: React.FC<EdgeProps<SystemEdge>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });

  const activeRps = data?.activeRps ?? 0;
  const droppedRps = data?.droppedRps ?? 0;
  const healthColor = data?.healthColor ?? '#475569';
  const packetSpeedMs = Math.max(240, Math.min(2800, data?.packetSpeedMs ?? 1500));
  const status = data?.status ?? 'IDLE';
  const isObs = Boolean(data?.isObservabilityEdge);
  const edgeLabel = data?.edgeLabel;

  const isFlowing = activeRps > 0 || status === 'ERROR';
  const durationSec = `${(packetSpeedMs / 1000).toFixed(2)}s`;
  const halfOffsetSec = `${(packetSpeedMs / 2000).toFixed(2)}s`;

  return (
    <>
      {/* Base Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#38bdf8' : healthColor,
          strokeWidth: selected ? 2.6 : isObs ? 1.5 : status === 'ERROR' ? 2.4 : 2,
          strokeDasharray: isObs ? '5 4' : status === 'ERROR' ? '6 4' : undefined,
          opacity: status === 'IDLE' ? 0.55 : 0.9,
          transition: 'stroke 220ms ease',
        }}
      />

      {/* Animated SVG Traffic Packet Circles moving along exact path */}
      {isFlowing && (
        <g aria-hidden="true">
          <circle r={isObs ? 2.6 : 3.6} fill={healthColor}>
            <animateMotion dur={durationSec} repeatCount="indefinite" path={edgePath} />
          </circle>
          {activeRps >= 5_000 && !isObs && (
            <circle r={3} fill={healthColor} opacity={0.85}>
              <animateMotion
                dur={durationSec}
                begin={halfOffsetSec}
                repeatCount="indefinite"
                path={edgePath}
              />
            </circle>
          )}
        </g>
      )}

      {/* Edge Metric / Semantic Label */}
      {(activeRps > 0 || droppedRps > 0 || edgeLabel) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className={`px-1.5 py-0.5 rounded bg-slate-950/90 border text-[10px] font-mono tabular-nums whitespace-nowrap shadow-xs ${
              status === 'ERROR'
                ? 'border-rose-500/60 text-rose-300'
                : status === 'WARN'
                  ? 'border-amber-500/60 text-amber-300'
                  : 'border-slate-700/90 text-slate-300'
            }`}
          >
            {edgeLabel && <span className="text-slate-400 mr-1">{edgeLabel}</span>}
            {status === 'ERROR' && activeRps === 0
              ? 'BLOCKED'
              : `${formatRps(activeRps)}/s`}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const AnimatedTrafficEdge = memo(AnimatedTrafficEdgeComponent);
