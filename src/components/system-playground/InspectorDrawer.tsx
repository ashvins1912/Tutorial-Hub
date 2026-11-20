import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Info,
  PowerOff,
  Send,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import { CATEGORY_META, COMPONENT_CATALOG_MAP } from '../../data/componentCatalog';
import { useSystemStore } from '../../store/useSystemStore';
import type { NodeStatus, ReplicationMode, RoutingAlgorithm } from '../../types/system';
import { formatRps, getComponentIcon } from './iconMap';

type InspectorTab = 'overview' | 'config' | 'chaos' | 'metrics';

const CACHE_SUPPORTED = new Set(['cdn', 'redis', 'auth_provider', 'feature_store']);
const ROUTING_SUPPORTED = new Set([
  'dns',
  'load_balancer',
  'reverse_proxy',
  'dynamic_router',
  'api_gateway',
]);
const REPLICATION_SUPPORTED = new Set([
  'postgres',
  'oracle',
  'mongodb',
  'cassandra',
  'elasticsearch',
  'redis',
  'kafka',
  's3_storage',
  'vector_db',
]);

export const InspectorDrawer: React.FC = () => {
  const selectedNodeId = useSystemStore((s) => s.selectedNodeId);
  const node = useSystemStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId) ?? null);
  const selectNode = useSystemStore((s) => s.selectNode);
  const updateNodeConfig = useSystemStore((s) => s.updateNodeConfig);
  const updateNodeStatus = useSystemStore((s) => s.updateNodeStatus);
  const updateNodeLabel = useSystemStore((s) => s.updateNodeLabel);
  const deleteNode = useSystemStore((s) => s.deleteNode);
  const runRequestTrace = useSystemStore((s) => s.runRequestTrace);

  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');

  if (!selectedNodeId || !node) return null;

  const { data } = node;
  const catMeta = CATEGORY_META[data.category];
  const catalog = COMPONENT_CATALOG_MAP[data.componentType];
  const Icon = getComponentIcon(catalog?.iconName ?? 'Server');
  const maxTotalRps = Math.round(
    data.config.maxRpsPerReplica *
      data.config.replicas *
      (data.status === 'DEGRADED' ? 0.5 : 1),
  );

  const supportsCache = CACHE_SUPPORTED.has(data.componentType);
  const supportsRouting = ROUTING_SUPPORTED.has(data.componentType);
  const supportsReplication = REPLICATION_SUPPORTED.has(data.componentType);
  const isRateLimiter = data.componentType === 'rate_limiter';

  return (
    <aside
      aria-label="Node Inspector and Chaos Control Panel"
      className="fixed inset-y-0 right-0 z-40 lg:static w-[340px] sm:w-[370px] shrink-0 bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl lg:shadow-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${catMeta.headerBgClass}`}
          >
            <Icon className={`w-4 h-4 ${catMeta.textAccentClass}`} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={data.label}
              onChange={(e) => updateNodeLabel(node.id, e.target.value)}
              aria-label="Node label"
              className="w-full bg-transparent text-sm font-semibold text-slate-100 focus:outline-none focus:bg-slate-950 focus:px-1.5 rounded truncate"
            />
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className={catMeta.textAccentClass}>{catMeta.label}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{data.componentType}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => selectNode(null)}
          aria-label="Close inspector"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Tabs */}
      <div className="px-3 pt-2.5 pb-2 border-b border-slate-800">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
          {(
            [
              { id: 'overview', label: 'Impact', Icon: Info },
              { id: 'config', label: 'Config', Icon: Sliders },
              { id: 'chaos', label: 'Chaos', Icon: Flame },
              { id: 'metrics', label: 'Metrics', Icon: Activity },
            ] as const
          ).map(({ id, label, Icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'bg-slate-800 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TabIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: Overview & Architecture Impact */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-200">Why This Component Exists</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{data.impact.whyAdded}</p>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/60">
              {[
                { label: 'Latency Impact', text: data.impact.latencyImpact },
                { label: 'Throughput Impact', text: data.impact.throughputImpact },
                { label: 'Availability Impact', text: data.impact.availabilityImpact },
              ].map((row) => (
                <div key={row.label} className="p-3 space-y-1">
                  <div className="text-[11px] font-semibold text-sky-400">{row.label}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{row.text}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">Production Best Practices</h4>
              <ul className="space-y-1.5">
                {data.impact.bestPractices.map((bp, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: Editable Configuration */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Replicas */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="cfg-replicas" className="font-medium text-slate-300">
                  Replicas / Instances
                </label>
                <span className="font-mono tabular-nums font-semibold text-sky-300">
                  {data.config.replicas}x
                </span>
              </div>
              <input
                id="cfg-replicas"
                type="range"
                min={1}
                max={24}
                step={1}
                value={data.config.replicas}
                onChange={(e) =>
                  updateNodeConfig(node.id, { replicas: Number(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 (SPOF)</span>
                <span>3 (HA Quorum)</span>
                <span>24 (Fleet)</span>
              </div>
            </div>

            {/* Max RPS per Replica */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="cfg-max-rps" className="font-medium text-slate-300">
                  Max RPS / Replica
                </label>
                <span className="font-mono tabular-nums font-semibold text-sky-300">
                  {formatRps(data.config.maxRpsPerReplica)}/s
                </span>
              </div>
              <input
                id="cfg-max-rps"
                type="number"
                min={500}
                max={2_000_000}
                step={1000}
                value={data.config.maxRpsPerReplica}
                onChange={(e) =>
                  updateNodeConfig(node.id, {
                    maxRpsPerReplica: Math.max(500, Number(e.target.value) || 1000),
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono tabular-nums text-slate-100 focus:outline-none focus:border-sky-500"
              />
              <p className="text-[11px] font-mono tabular-nums text-slate-400">
                Effective Cluster Capacity: {formatRps(maxTotalRps)} RPS
              </p>
            </div>

            {/* Base Latency */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="cfg-latency" className="font-medium text-slate-300">
                  Base Processing Latency
                </label>
                <span className="font-mono tabular-nums font-semibold text-sky-300">
                  {data.config.baseLatencyMs} ms
                </span>
              </div>
              <input
                id="cfg-latency"
                type="range"
                min={1}
                max={250}
                step={1}
                value={data.config.baseLatencyMs}
                onChange={(e) =>
                  updateNodeConfig(node.id, { baseLatencyMs: Number(e.target.value) })
                }
                className="w-full accent-sky-500"
              />
            </div>

            {/* Cache Hit Ratio */}
            {supportsCache && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="cfg-cache-hit" className="font-medium text-slate-300">
                    Cache Hit Ratio
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-emerald-400">
                    {Math.round((data.config.cacheHitRatio ?? 0) * 100)}%
                  </span>
                </div>
                <input
                  id="cfg-cache-hit"
                  type="range"
                  min={0}
                  max={99}
                  step={1}
                  value={Math.round((data.config.cacheHitRatio ?? 0) * 100)}
                  onChange={(e) =>
                    updateNodeConfig(node.id, {
                      cacheHitRatio: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Shields downstream databases from{' '}
                  {Math.round((data.config.cacheHitRatio ?? 0) * 100)}% of read RPS.
                </p>
              </div>
            )}

            {/* Rate Limit Cap */}
            {isRateLimiter && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="cfg-rate-limit" className="font-medium text-slate-300">
                    Token Bucket Ceiling (RPS)
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-amber-300">
                    {formatRps(data.config.rateLimitRps ?? 25_000)}/s
                  </span>
                </div>
                <input
                  id="cfg-rate-limit"
                  type="number"
                  min={100}
                  max={1_000_000}
                  step={1000}
                  value={data.config.rateLimitRps ?? 25_000}
                  onChange={(e) =>
                    updateNodeConfig(node.id, {
                      rateLimitRps: Math.max(100, Number(e.target.value) || 1000),
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Routing Algorithm */}
            {supportsRouting && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label htmlFor="cfg-routing" className="block text-xs font-medium text-slate-300">
                  Routing Algorithm
                </label>
                <select
                  id="cfg-routing"
                  value={data.config.routingAlgo ?? 'LEAST_CONN'}
                  onChange={(e) =>
                    updateNodeConfig(node.id, {
                      routingAlgo: e.target.value as RoutingAlgorithm,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="ROUND_ROBIN">Round Robin</option>
                  <option value="LEAST_CONN">Least Connections</option>
                  <option value="CONSISTENT_HASH">Consistent Hashing</option>
                  <option value="IP_HASH">IP Hash / Sticky</option>
                </select>
              </div>
            )}

            {/* DB Replication Mode */}
            {supportsReplication && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label htmlFor="cfg-repl" className="block text-xs font-medium text-slate-300">
                  Replication / Partitioning Mode
                </label>
                <select
                  id="cfg-repl"
                  value={data.config.replicationMode ?? 'PRIMARY_REPLICA'}
                  onChange={(e) =>
                    updateNodeConfig(node.id, {
                      replicationMode: e.target.value as ReplicationMode,
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="SINGLE_NODE">Single Node (No Failover)</option>
                  <option value="PRIMARY_REPLICA">Primary + Read Replicas</option>
                  <option value="MULTI_MASTER">Multi-Master / Active-Active</option>
                  <option value="SHARDED_CLUSTER">Horizontally Sharded Cluster</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Chaos Engineering & Request Tracer */}
        {activeTab === 'chaos' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">
                Fault Injection State
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inject live node degradation or sudden crashes to observe traffic rerouting,
                downstream starvation, and HTTP 502/503/504 failure payloads.
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {(
                  [
                    {
                      id: 'ONLINE' as NodeStatus,
                      title: 'ONLINE (Healthy)',
                      desc: '100% capacity, nominal baseline latency.',
                      activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-300',
                      Icon: CheckCircle2,
                    },
                    {
                      id: 'DEGRADED' as NodeStatus,
                      title: 'DEGRADED (High Latency)',
                      desc: '50% throughput ceiling and 3x processing latency.',
                      activeClass: 'border-amber-500 bg-amber-500/15 text-amber-300',
                      Icon: AlertTriangle,
                    },
                    {
                      id: 'OFFLINE' as NodeStatus,
                      title: 'OFFLINE (Crashed / 503)',
                      desc: '0 capacity; drops 100% incoming traffic immediately.',
                      activeClass: 'border-rose-500 bg-rose-500/15 text-rose-300',
                      Icon: PowerOff,
                    },
                  ] as const
                ).map(({ id, title, desc, activeClass, Icon: StateIcon }) => {
                  const active = data.status === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => updateNodeStatus(node.id, id)}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        active
                          ? activeClass
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <StateIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single-Request Tracer */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  Single-Request Packet Tracer
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Fire one traced request from Client to{' '}
                  <span className="text-slate-200 font-medium">{data.label}</span> and inspect the
                  exact hop-by-hop latency waterfall and Mock JSON payload.
                </p>
              </div>

              <button
                type="button"
                onClick={() => runRequestTrace(node.id)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-colors"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Send Test Request to This Node</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Live Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  label: 'Incoming RPS',
                  value: `${formatRps(data.metrics.incomingRps)}/s`,
                  color: 'text-slate-100',
                },
                {
                  label: 'Processed RPS',
                  value: `${formatRps(data.metrics.processedRps)}/s`,
                  color: 'text-emerald-400',
                },
                {
                  label: 'Dropped RPS',
                  value: `${formatRps(data.metrics.droppedRps)}/s`,
                  color: data.metrics.droppedRps > 0 ? 'text-rose-400' : 'text-slate-400',
                },
                {
                  label: 'Error Rate',
                  value: `${data.metrics.errorRatePercent}%`,
                  color:
                    data.metrics.errorRatePercent > 5
                      ? 'text-rose-400'
                      : data.metrics.errorRatePercent > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400',
                },
                {
                  label: 'Live Latency',
                  value: data.status === 'OFFLINE' ? 'OFFLINE' : `${data.metrics.currentLatencyMs} ms`,
                  color:
                    data.status === 'OFFLINE'
                      ? 'text-rose-400'
                      : data.metrics.currentLatencyMs > 150
                        ? 'text-amber-400'
                        : 'text-sky-300',
                },
                {
                  label: 'Cluster Max RPS',
                  value: `${formatRps(maxTotalRps)}/s`,
                  color: 'text-slate-300',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1"
                >
                  <div className="text-[11px] text-slate-400">{stat.label}</div>
                  <div className={`text-sm font-mono font-bold tabular-nums ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* CPU / Saturation Gauge */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-slate-300 font-sans font-medium">CPU / Capacity Load</span>
                <span
                  className={
                    data.metrics.cpuUsagePercent >= 95
                      ? 'text-rose-400 font-semibold'
                      : data.metrics.cpuUsagePercent >= 75
                        ? 'text-amber-400 font-semibold'
                        : 'text-emerald-400 font-semibold'
                  }
                >
                  {data.metrics.cpuUsagePercent}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    data.metrics.cpuUsagePercent >= 95
                      ? 'bg-rose-500'
                      : data.metrics.cpuUsagePercent >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, data.metrics.cpuUsagePercent)}%` }}
                />
              </div>
              {data.metrics.cacheAbsorbedRps > 0 && (
                <div className="text-[11px] font-mono tabular-nums text-emerald-400 pt-1">
                  Cache Absorbed: {formatRps(data.metrics.cacheAbsorbedRps)} req/s
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => runRequestTrace(node.id)}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-sky-500/50 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Trace Live Packet &amp; Inspect JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Delete Action */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/60">
        <span className="text-[11px] font-mono text-slate-500 truncate">id: {node.id}</span>
        <button
          type="button"
          onClick={() => deleteNode(node.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Remove Node</span>
        </button>
      </div>
    </aside>
  );
};
