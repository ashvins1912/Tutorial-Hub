import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertTriangle, Flame, PowerOff } from 'lucide-react';
import { CATEGORY_META, COMPONENT_CATALOG_MAP } from '../../data/componentCatalog';
import type { SystemNode } from '../../types/system';
import { formatRps, getComponentIcon } from './iconMap';

const CustomSystemNodeComponent: React.FC<NodeProps<SystemNode>> = ({ data, selected }) => {
  const catMeta = CATEGORY_META[data.category];
  const catalogItem = COMPONENT_CATALOG_MAP[data.componentType];
  const Icon = getComponentIcon(catalogItem?.iconName ?? 'Server');
  const { metrics, status, config, isHighlighted } = data;

  const isOffline = status === 'OFFLINE';
  const isDegraded = status === 'DEGRADED';
  const isOverloaded = !isOffline && metrics.isOverloaded;

  const borderClass = isOffline
    ? 'border-rose-500/80 ring-1 ring-rose-500/40'
    : isOverloaded
      ? 'border-rose-500 ring-2 ring-rose-500/35'
      : isDegraded
        ? 'border-amber-500/80 ring-1 ring-amber-500/30'
        : selected
          ? 'border-sky-400 ring-2 ring-sky-400/30'
          : isHighlighted
            ? 'border-indigo-400 ring-2 ring-indigo-400/40'
            : 'border-slate-700/90 hover:border-slate-500';

  const statusText = isOffline
    ? 'OFFLINE'
    : isOverloaded
      ? 'OVERLOAD'
      : isDegraded
        ? 'DEGRADED'
        : 'ONLINE';

  const statusColorClass = isOffline || isOverloaded
    ? 'text-rose-400'
    : isDegraded
      ? 'text-amber-400'
      : 'text-emerald-400';

  const cpuBarClass =
    metrics.cpuUsagePercent >= 95
      ? 'bg-rose-500'
      : metrics.cpuUsagePercent >= 75
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const isClient = data.componentType === 'client';

  return (
    <div
      className={`w-[232px] rounded-xl bg-slate-900/95 text-slate-100 border transition-all shadow-lg backdrop-blur-xs select-none ${borderClass} ${
        isOffline ? 'opacity-80' : ''
      }`}
    >
      {/* Target Handle (Left) — omitted on pure client entry */}
      {!isClient && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 hover:!bg-sky-400 transition-colors"
        />
      )}

      {/* Color-Coded Category Header */}
      <div
        className={`px-3 py-2 rounded-t-[11px] border-b flex items-center justify-between gap-2 ${catMeta.headerBgClass}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-3.5 h-3.5 shrink-0 ${catMeta.textAccentClass}`} aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-tight text-slate-200 truncate">
            {catMeta.shortLabel}
          </span>
        </div>

        <div className={`flex items-center gap-1 text-[10px] font-mono font-semibold shrink-0 ${statusColorClass}`}>
          {isOffline && <PowerOff className="w-3 h-3" aria-hidden="true" />}
          {isOverloaded && <Flame className="w-3 h-3" aria-hidden="true" />}
          {isDegraded && !isOverloaded && <AlertTriangle className="w-3 h-3" aria-hidden="true" />}
          <span>{statusText}</span>
        </div>
      </div>

      {/* Node Title & Subtitle */}
      <div className="px-3 pt-2.5 pb-2 space-y-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-50 truncate leading-snug">
            {data.label}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
            <span className="truncate">{data.subtitle}</span>
            {config.replicas > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-300 shrink-0">
                  {config.replicas}x
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live Telemetry Row */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/90 text-[11px] font-mono tabular-nums">
          <div>
            <div className="text-[10px] text-slate-500">Traffic</div>
            <div className="text-slate-100 font-semibold">
              {formatRps(metrics.incomingRps)}
              <span className="text-[10px] font-normal text-slate-400"> /s</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500">Latency</div>
            <div
              className={`font-semibold ${
                metrics.currentLatencyMs > 150
                  ? 'text-amber-400'
                  : isOffline
                    ? 'text-rose-400'
                    : 'text-slate-100'
              }`}
            >
              {isOffline ? 'DOWN' : `${metrics.currentLatencyMs}ms`}
            </div>
          </div>
        </div>

        {/* Cache Hit or Drop Note */}
        {metrics.cacheAbsorbedRps > 0 && !isOffline && (
          <div className="text-[10px] font-mono tabular-nums text-emerald-400 flex items-center justify-between">
            <span>Cache Shield</span>
            <span>
              -{formatRps(metrics.cacheAbsorbedRps)}/s ({Math.round((config.cacheHitRatio ?? 0) * 100)}%)
            </span>
          </div>
        )}

        {metrics.droppedRps > 0 && (
          <div className="text-[10px] font-mono tabular-nums text-rose-400 flex items-center justify-between">
            <span>Dropped</span>
            <span>
              {formatRps(metrics.droppedRps)}/s ({metrics.errorRatePercent}%)
            </span>
          </div>
        )}

        {/* CPU / Load Capacity Bar */}
        {!isClient && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
              <span>Load</span>
              <span className={metrics.cpuUsagePercent >= 90 ? 'text-rose-400 font-semibold' : ''}>
                {isOffline ? '0%' : `${metrics.cpuUsagePercent}%`}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${cpuBarClass}`}
                style={{ width: `${isOffline ? 0 : Math.min(100, metrics.cpuUsagePercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Source Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 hover:!bg-sky-400 transition-colors"
      />
    </div>
  );
};

export const CustomSystemNode = memo(CustomSystemNodeComponent);
