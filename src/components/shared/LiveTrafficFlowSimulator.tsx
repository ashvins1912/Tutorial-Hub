import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Flame,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Scale,
  Server,
  ShieldAlert,
  ShieldCheck,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  computeTrafficSimulation,
  LIVE_TRAFFIC_PRESETS,
  parseMermaidToTrafficTopology,
  type TrafficDomain,
  type TrafficEdge,
  type TrafficNode,
  type TrafficNodeRole,
  type TrafficTopology,
} from '../../utils/liveTrafficTopology';
import {
  getRealWorldExplanationForTopology,
  REAL_WORLD_TRAFFIC_TOPOLOGIES,
} from '../../utils/realWorldTrafficBlueprints';

export interface LiveTrafficFlowSimulatorProps {
  /** Direct topology to animate (e.g. from Playground or active architecture) */
  topology?: TrafficTopology | null;
  /** Optional Mermaid flowchart string; automatically parsed into an animated topology when provided */
  mermaidCode?: string;
  /** Title used when parsing mermaidCode */
  mermaidTitle?: string;
  /** Default domain filter for preset switcher */
  domain?: TrafficDomain;
  /** Optional preset ID to select initially when topology/mermaidCode are not passed */
  initialPresetId?: string;
  /** Show preset selector bar so user can switch architectural patterns */
  allowPresetSwitcher?: boolean;
  /** Compact height & tighter padding for inline Mermaid / Drawer embeds */
  compact?: boolean;
  /** Optional heading override */
  heading?: string;
}

const ROLE_ICON: Record<TrafficNodeRole, LucideIcon> = {
  client: Globe,
  edge: Globe,
  'load-balancer': Scale,
  service: Server,
  cache: Zap,
  queue: Workflow,
  shard: HardDrive,
  replica: Layers,
  db: Database,
  security: ShieldCheck,
  observability: Activity,
  k8s: Cpu,
};

const ROLE_LABEL: Record<TrafficNodeRole, string> = {
  client: 'Client',
  edge: 'Edge',
  'load-balancer': 'LB / Router',
  service: 'Service',
  cache: 'Cache',
  queue: 'Queue',
  shard: 'DB Shard',
  replica: 'Replica',
  db: 'Database',
  security: 'Security',
  observability: 'OTel / SLO',
  k8s: 'K8s Pods',
};

interface LayoutNode extends TrafficNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PacketParticle {
  id: string;
  edgeId: string;
  progress: number;
  speed: number;
  kind: 'primary' | 'cache-hit' | 'bottleneck' | 'failover' | 'async';
}

function formatCompactRps(rps: number): string {
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(1)}M`;
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(rps >= 10_000 ? 0 : 1)}k`;
  return `${Math.round(rps)}`;
}

/** Deterministic layered DAG coordinate layout for crisp SVG rendering */
function computeSvgLayout(nodes: TrafficNode[], compact: boolean): {
  layoutNodes: LayoutNode[];
  nodeById: Map<string, LayoutNode>;
  viewWidth: number;
  viewHeight: number;
} {
  const tiers = new Map<number, TrafficNode[]>();
  for (const n of nodes) {
    const bucket = tiers.get(n.tier) ?? [];
    bucket.push(n);
    tiers.set(n.tier, bucket);
  }
  const sortedTierKeys = Array.from(tiers.keys()).sort((a, b) => a - b);
  const numCols = Math.max(2, sortedTierKeys.length);
  const maxRows = Math.max(1, ...Array.from(tiers.values()).map((b) => b.length));

  const nodeW = compact ? 156 : 168;
  const nodeH = compact ? 74 : 82;
  const colGap = compact ? 54 : 66;
  const rowGap = compact ? 26 : 32;
  const padX = 28;
  const padY = 30;

  const viewWidth = Math.max(760, padX * 2 + numCols * nodeW + (numCols - 1) * colGap);
  const viewHeight = Math.max(
    compact ? 250 : 300,
    padY * 2 + maxRows * nodeH + (maxRows - 1) * rowGap
  );

  const layoutNodes: LayoutNode[] = [];
  const nodeById = new Map<string, LayoutNode>();

  sortedTierKeys.forEach((tierKey, colIdx) => {
    const colNodes = tiers.get(tierKey) ?? [];
    const colTotalH = colNodes.length * nodeH + Math.max(0, colNodes.length - 1) * rowGap;
    const startY = (viewHeight - colTotalH) / 2;
    const x = padX + colIdx * ((viewWidth - padX * 2 - nodeW) / Math.max(1, numCols - 1));

    colNodes.forEach((n, rowIdx) => {
      const y = startY + rowIdx * (nodeH + rowGap);
      const ln: LayoutNode = { ...n, x, y, w: nodeW, h: nodeH };
      layoutNodes.push(ln);
      nodeById.set(n.id, ln);
    });
  });

  return { layoutNodes, nodeById, viewWidth, viewHeight };
}

function getEdgePathGeometry(src: LayoutNode, dst: LayoutNode, isFailover: boolean): {
  d: string;
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  mid: { x: number; y: number };
} {
  // Same-column failover arc curves smoothly along the right side
  if (Math.abs(src.x - dst.x) < 20) {
    const xRight = src.x + src.w;
    const y1 = src.y + src.h * 0.5;
    const y2 = dst.y + dst.h * 0.5;
    const bulge = isFailover ? 44 : 34;
    const p0 = { x: xRight, y: y1 };
    const p2 = { x: xRight, y: y2 };
    const p1 = { x: xRight + bulge, y: (y1 + y2) / 2 };
    const d = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;
    return {
      d,
      p0,
      p1,
      p2,
      mid: { x: 0.25 * p0.x + 0.5 * p1.x + 0.25 * p2.x, y: 0.25 * p0.y + 0.5 * p1.y + 0.25 * p2.y },
    };
  }

  const leftToRight = src.x < dst.x;
  const p0 = { x: leftToRight ? src.x + src.w : src.x, y: src.y + src.h / 2 };
  const p2 = { x: leftToRight ? dst.x : dst.x + dst.w, y: dst.y + dst.h / 2 };
  const midX = (p0.x + p2.x) / 2;
  const curveOffset = isFailover ? -26 : (p2.y - p0.y) * 0.14;
  const p1 = { x: midX, y: (p0.y + p2.y) / 2 + curveOffset };
  const d = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

  return {
    d,
    p0,
    p1,
    p2,
    mid: {
      x: 0.25 * p0.x + 0.5 * p1.x + 0.25 * p2.x,
      y: 0.25 * p0.y + 0.5 * p1.y + 0.25 * p2.y,
    },
  };
}

function evalQuadraticBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

export const LiveTrafficFlowSimulator: React.FC<LiveTrafficFlowSimulatorProps> = ({
  topology,
  mermaidCode,
  mermaidTitle,
  domain = 'system-design',
  initialPresetId,
  allowPresetSwitcher = true,
  compact = false,
  heading,
}) => {
  const parsedMermaidTopology = useMemo(() => {
    if (!mermaidCode) return null;
    return parseMermaidToTrafficTopology(
      mermaidCode,
      mermaidTitle || 'Active Mermaid Architecture Flow',
      domain
    );
  }, [mermaidCode, mermaidTitle, domain]);

  const externalTopology = topology ?? parsedMermaidTopology;

  const availablePresets = useMemo(() => {
    const core =
      domain === 'devops'
        ? [
            ...LIVE_TRAFFIC_PRESETS.filter((p) => p.domain === 'devops'),
            ...LIVE_TRAFFIC_PRESETS.filter((p) => p.domain !== 'devops'),
          ]
        : domain === 'database'
          ? [
              ...LIVE_TRAFFIC_PRESETS.filter((p) => p.domain === 'database'),
              ...LIVE_TRAFFIC_PRESETS.filter((p) => p.domain !== 'database'),
            ]
          : LIVE_TRAFFIC_PRESETS;
    return [...core, ...REAL_WORLD_TRAFFIC_TOPOLOGIES];
  }, [domain]);

  const [selectedModeId, setSelectedModeId] = useState<string>(() => {
    if (externalTopology) return '__synced__';
    return initialPresetId ?? availablePresets[0].id;
  });
  const [showRealWorldDirectory, setShowRealWorldDirectory] = useState<boolean>(false);
  const [showBlueprintExplanation, setShowBlueprintExplanation] = useState<boolean>(() => !compact);

  // If external topology changes identity (e.g. user switches pattern), stay synced when in synced mode
  const prevExternalIdRef = useRef<string | null>(externalTopology?.id ?? null);
  useEffect(() => {
    if (externalTopology && externalTopology.id !== prevExternalIdRef.current) {
      prevExternalIdRef.current = externalTopology.id;
      setSelectedModeId('__synced__');
    }
  }, [externalTopology]);

  const activeTopology: TrafficTopology = useMemo(() => {
    if (selectedModeId === '__synced__' && externalTopology) {
      return externalTopology;
    }
    return (
      availablePresets.find((p) => p.id === selectedModeId) ??
      externalTopology ??
      availablePresets[0]
    );
  }, [selectedModeId, externalTopology, availablePresets]);

  const activeRealWorldExplanation = useMemo(
    () => getRealWorldExplanationForTopology(activeTopology),
    [activeTopology]
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [entryRps, setEntryRps] = useState<number>(activeTopology.defaultRps);
  const [cacheHitPct, setCacheHitPct] = useState<number>(activeTopology.defaultCacheHitPct);
  const [hotShardSkew, setHotShardSkew] = useState<boolean>(false);
  const [failedNodeIds, setFailedNodeIds] = useState<string[]>(() =>
    activeTopology.nodes.filter((n) => n.defaultFailed).map((n) => n.id)
  );
  const [activeScenarioTag, setActiveScenarioTag] = useState<string>('normal');

  // Reset simulation parameters when switching topologies
  useEffect(() => {
    setEntryRps(activeTopology.defaultRps);
    setCacheHitPct(activeTopology.defaultCacheHitPct);
    setHotShardSkew(false);
    setFailedNodeIds(activeTopology.nodes.filter((n) => n.defaultFailed).map((n) => n.id));
    setActiveScenarioTag('normal');
  }, [activeTopology.id]);

  const snapshot = useMemo(
    () =>
      computeTrafficSimulation(activeTopology, {
        entryRps,
        cacheHitPct,
        hotShardSkew,
        failedNodeIds,
      }),
    [activeTopology, entryRps, cacheHitPct, hotShardSkew, failedNodeIds]
  );

  const layout = useMemo(
    () => computeSvgLayout(activeTopology.nodes, compact),
    [activeTopology.nodes, compact]
  );

  // Precompute Bezier edge curves
  const edgeGeometries = useMemo(() => {
    const map = new Map<
      string,
      ReturnType<typeof getEdgePathGeometry> & { edge: TrafficEdge }
    >();
    for (const edge of activeTopology.edges) {
      const src = layout.nodeById.get(edge.source);
      const dst = layout.nodeById.get(edge.target);
      if (!src || !dst) continue;
      map.set(edge.id, {
        ...getEdgePathGeometry(src, dst, edge.kind === 'failover'),
        edge,
      });
    }
    return map;
  }, [activeTopology.edges, layout.nodeById]);

  // Smooth requestAnimationFrame packet clock (respects prefers-reduced-motion)
  const [clockSec, setClockSec] = useState<number>(0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    let rafId = 0;
    let lastTs = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.08, (now - lastTs) / 1000);
      lastTs = now;
      setClockSec((prev) => (prev + dt) % 1000);
      rafId = window.requestAnimationFrame(frame);
    };
    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, prefersReducedMotion]);

  // Derive live animated particles deterministically from clockSec + edgeStats
  const particles = useMemo<PacketParticle[]>(() => {
    const list: PacketParticle[] = [];
    for (const edge of activeTopology.edges) {
      const est = snapshot.edgeStats[edge.id];
      if (!est || est.rps <= 0 || est.isDropped) continue;

      const count = est.isFailoverActive
        ? 3
        : Math.max(1, Math.min(4, Math.ceil(est.rps / Math.max(4000, entryRps * 0.22))));
      const baseSpeed = est.isBottlenecked ? 0.24 : est.isFailoverActive ? 0.55 : 0.48;
      const kind: PacketParticle['kind'] = est.isFailoverActive
        ? 'failover'
        : est.isBottlenecked
          ? 'bottleneck'
          : edge.kind === 'async'
            ? 'async'
            : 'primary';

      for (let i = 0; i < count; i++) {
        const offset = i / count;
        const progress = prefersReducedMotion
          ? (0.22 + offset * 0.65) % 1
          : (clockSec * baseSpeed + offset) % 1;
        list.push({
          id: `${edge.id}-p-${i}`,
          edgeId: edge.id,
          progress,
          speed: baseSpeed,
          kind,
        });
      }
    }
    return list;
  }, [activeTopology.edges, snapshot.edgeStats, entryRps, clockSec, prefersReducedMotion]);

  const toggleNodeFault = (nodeId: string) => {
    setActiveScenarioTag('custom');
    setFailedNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const applyQuickScenario = (mode: 'normal' | 'surge' | 'stampede' | 'hot-shard' | 'failover') => {
    setActiveScenarioTag(mode);
    if (mode === 'normal') {
      setEntryRps(activeTopology.defaultRps);
      setCacheHitPct(activeTopology.defaultCacheHitPct);
      setHotShardSkew(false);
      setFailedNodeIds([]);
      return;
    }
    if (mode === 'surge') {
      setEntryRps(Math.min(150000, Math.round(activeTopology.defaultRps * 3.4)));
      setCacheHitPct(activeTopology.defaultCacheHitPct);
      setHotShardSkew(false);
      setFailedNodeIds([]);
      return;
    }
    if (mode === 'stampede') {
      setEntryRps(Math.min(120000, Math.round(activeTopology.defaultRps * 1.45)));
      setCacheHitPct(12);
      setHotShardSkew(false);
      setFailedNodeIds([]);
      return;
    }
    if (mode === 'hot-shard') {
      setEntryRps(Math.min(120000, Math.round(activeTopology.defaultRps * 1.35)));
      setCacheHitPct(Math.max(30, activeTopology.defaultCacheHitPct - 18));
      setHotShardSkew(true);
      setFailedNodeIds([]);
      return;
    }
    if (mode === 'failover') {
      const target =
        activeTopology.primaryFailNodeId ??
        activeTopology.nodes.find((n) => Boolean(n.failoverTargetId))?.id ??
        activeTopology.nodes[Math.min(2, activeTopology.nodes.length - 1)]?.id;
      setEntryRps(activeTopology.defaultRps);
      setCacheHitPct(activeTopology.defaultCacheHitPct);
      setHotShardSkew(false);
      setFailedNodeIds(target ? [target] : []);
    }
  };

  const hasCacheNode = activeTopology.nodes.some((n) => n.role === 'cache' || n.role === 'edge');
  const hasShardNode = activeTopology.nodes.some((n) => n.isHotShard || n.role === 'shard');

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header & Pattern Selector */}
      <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              {heading ?? 'Live Traffic Visualization & Failover Simulator'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Click any node to inject a fault</span>
          </div>
          <h3 className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
            {activeTopology.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {allowPresetSwitcher && (
            <>
              <select
                aria-label="Select architectural or real-world traffic blueprint"
                value={selectedModeId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedModeId(nextId);
                  if (nextId.startsWith('rw-')) {
                    setShowBlueprintExplanation(true);
                  }
                }}
                className="max-w-[280px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {externalTopology && (
                  <option value="__synced__">Active Pattern: {externalTopology.title.slice(0, 38)}</option>
                )}
                <optgroup label={`Real-World System Blueprints (${REAL_WORLD_TRAFFIC_TOPOLOGIES.length})`}>
                  {REAL_WORLD_TRAFFIC_TOPOLOGIES.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.title.slice(0, 56)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Core System Design Patterns">
                  {LIVE_TRAFFIC_PRESETS.filter((p) => p.domain === 'system-design').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="DevOps & Cloud Patterns">
                  {LIVE_TRAFFIC_PRESETS.filter((p) => p.domain === 'devops').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Database Internals Patterns">
                  {LIVE_TRAFFIC_PRESETS.filter((p) => p.domain === 'database').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={() => setShowRealWorldDirectory((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  showRealWorldDirectory
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                Real-World Blueprints ({REAL_WORLD_TRAFFIC_TOPOLOGIES.length})
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              isPlaying
                ? 'border-sky-600 bg-sky-600 text-white hover:bg-sky-700'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-sky-500'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => applyQuickScenario('normal')}
            aria-label="Reset live traffic simulation"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Quick Real-World Blueprints Browser (All 17 Production System Designs) */}
      {allowPresetSwitcher && showRealWorldDirectory && (
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              All 17 Real-World System Blueprints — Click any system to animate its live traffic &amp; inspect full architecture
            </span>
            {externalTopology && (
              <button
                type="button"
                onClick={() => setSelectedModeId('__synced__')}
                className="text-sky-700 dark:text-sky-400 font-semibold hover:underline"
              >
                Back to Synced Pattern
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {REAL_WORLD_TRAFFIC_TOPOLOGIES.map((bp) => {
              const expl = getRealWorldExplanationForTopology(bp);
              const isSelected = activeTopology.id === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => {
                    setSelectedModeId(bp.id);
                    setShowBlueprintExplanation(true);
                  }}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {expl?.shortTitle ?? bp.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {expl?.scaleBadge ?? bp.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Controls & Chaos Scenarios Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* RPS Slider */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={`rps-slider-${activeTopology.id}`} className="font-medium text-slate-600 dark:text-slate-400">
                Ingress Traffic Load
              </label>
              <span className="font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                {entryRps.toLocaleString()} RPS
              </span>
            </div>
            <input
              id={`rps-slider-${activeTopology.id}`}
              type="range"
              min={2000}
              max={150000}
              step={2000}
              value={entryRps}
              onChange={(e) => {
                setActiveScenarioTag('custom');
                setEntryRps(Number(e.target.value));
              }}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          {/* Cache Hit Ratio Slider */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={`cache-slider-${activeTopology.id}`} className="font-medium text-slate-600 dark:text-slate-400">
                {hasCacheNode ? 'Cache / Edge Hit Ratio' : 'Edge Offload Ratio'}
              </label>
              <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {cacheHitPct}% ({formatCompactRps(snapshot.cacheOffloadRps)} RPS)
              </span>
            </div>
            <input
              id={`cache-slider-${activeTopology.id}`}
              type="range"
              min={0}
              max={95}
              step={5}
              value={cacheHitPct}
              onChange={(e) => {
                setActiveScenarioTag('custom');
                setCacheHitPct(Number(e.target.value));
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Live SLO Metrics */}
          <div className="md:col-span-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">p99 Latency</div>
              <div
                className={`text-xs font-mono font-bold tabular-nums ${
                  snapshot.p99LatencyMs > 120
                    ? 'text-rose-600 dark:text-rose-400'
                    : snapshot.p99LatencyMs > 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {snapshot.p99LatencyMs} ms
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Bottlenecks</div>
              <div
                className={`text-xs font-mono font-bold tabular-nums ${
                  snapshot.bottleneckNodeIds.length > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {snapshot.bottleneckNodeIds.length} nodes
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1.5">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Error / Drop</div>
              <div
                className={`text-xs font-mono font-bold tabular-nums ${
                  snapshot.errorRatePct > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {snapshot.errorRatePct}%
              </div>
            </div>
          </div>
        </div>

        {/* One-Click Chaos & Traffic Scenarios */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'normal', label: 'Steady Traffic' },
                { id: 'surge', label: '3.4x Flash Surge' },
                { id: 'stampede', label: 'Cache Stampede' },
                ...(hasShardNode ? [{ id: 'hot-shard' as const, label: 'Hot-Shard Skew' }] : []),
                { id: 'failover', label: 'Trigger Primary Failover' },
              ] satisfies { id: 'normal' | 'surge' | 'stampede' | 'hot-shard' | 'failover'; label: string }[]
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => applyQuickScenario(btn.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeScenarioTag === btn.id
                    ? btn.id === 'failover' || btn.id === 'stampede'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 font-semibold'
                      : btn.id === 'surge' || btn.id === 'hot-shard'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold'
                        : 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                {btn.id === 'failover' && <ShieldAlert className="w-3 h-3" aria-hidden="true" />}
                {btn.id === 'surge' && <Flame className="w-3 h-3" aria-hidden="true" />}
                {btn.label}
              </button>
            ))}
          </div>

          {/* Packet Legend (Clean inline text, zero pills) */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" aria-hidden="true" />
              Routed Req
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 bg-emerald-500 inline-block" aria-hidden="true" />
              Cache Hit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" aria-hidden="true" />
              Bottleneck Queue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" aria-hidden="true" />
              Failover Reroute
            </span>
          </div>
        </div>
      </div>

      {/* Live Animated SVG Topology Stage */}
      <div className="bg-slate-50/70 dark:bg-slate-950/80 overflow-x-auto px-3 py-4">
        <svg
          viewBox={`0 0 ${layout.viewWidth} ${layout.viewHeight}`}
          className="w-full min-w-[700px] h-auto select-none"
          role="img"
          aria-label={`Live traffic simulation canvas for ${activeTopology.title}`}
        >
          <defs>
            <marker
              id={`arrow-normal-${activeTopology.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id={`arrow-bottleneck-${activeTopology.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
            </marker>
            <marker
              id={`arrow-failover-${activeTopology.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed" />
            </marker>
          </defs>

          {/* Subtle Blueprint Dot Grid */}
          <g opacity="0.16">
            {Array.from({ length: Math.ceil(layout.viewWidth / 40) }).map((_, xi) =>
              Array.from({ length: Math.ceil(layout.viewHeight / 40) }).map((__, yi) => (
                <circle
                  key={`g-${xi}-${yi}`}
                  cx={xi * 40 + 20}
                  cy={yi * 40 + 20}
                  r="1"
                  className="fill-slate-400 dark:fill-slate-600"
                />
              ))
            )}
          </g>

          {/* Directed Edges */}
          {activeTopology.edges.map((edge) => {
            const geom = edgeGeometries.get(edge.id);
            const est = snapshot.edgeStats[edge.id];
            if (!geom || !est) return null;

            const isFailover = edge.kind === 'failover';
            const isAsync = edge.kind === 'async' || edge.kind === 'replication';
            const strokeColor = est.isFailoverActive
              ? '#7c3aed'
              : est.isDropped
                ? '#e11d48'
                : est.isBottlenecked
                  ? '#d97706'
                  : isFailover
                    ? '#94a3b8'
                    : est.rps > 0
                      ? '#0284c7'
                      : '#94a3b8';

            const strokeWidth = est.isFailoverActive
              ? 2.8
              : est.isBottlenecked
                ? 2.6
                : est.rps > 0
                  ? 1.9
                  : 1.2;

            const strokeOpacity = isFailover && !est.isFailoverActive ? 0.32 : est.isDropped ? 0.35 : 0.78;
            const markerId = est.isFailoverActive
              ? `url(#arrow-failover-${activeTopology.id})`
              : est.isBottlenecked
                ? `url(#arrow-bottleneck-${activeTopology.id})`
                : `url(#arrow-normal-${activeTopology.id})`;

            return (
              <g key={edge.id}>
                <path
                  d={geom.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeDasharray={isFailover || isAsync ? '6 4' : undefined}
                  markerEnd={markerId}
                />
                {(edge.label || est.rps > 0) && (
                  <g transform={`translate(${geom.mid.x}, ${geom.mid.y - 7})`}>
                    <rect
                      x="-40"
                      y="-9"
                      width="80"
                      height="16"
                      rx="4"
                      className="fill-white/90 dark:fill-slate-900/90 stroke-slate-200 dark:stroke-slate-700"
                      strokeWidth="0.75"
                    />
                    <text
                      textAnchor="middle"
                      y="2"
                      className="text-[9px] font-mono fill-slate-700 dark:fill-slate-300"
                    >
                      {est.isFailoverActive
                        ? `FAILOVER ${formatCompactRps(est.rps)}`
                        : est.rps > 0
                          ? `${formatCompactRps(est.rps)} rps`
                          : edge.label ?? 'standby'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Cache-Hit Short-Circuit Return Arcs on Cache Nodes */}
          {layout.layoutNodes
            .filter((n) => n.role === 'cache' && snapshot.nodeStats[n.id]?.status !== 'failed' && cacheHitPct > 0)
            .map((cacheNode) => {
              const rx = cacheNode.x + cacheNode.w / 2;
              const ry = cacheNode.y;
              const hitPath = `M ${rx + 18} ${ry} Q ${rx} ${ry - 26} ${rx - 18} ${ry}`;
              const t = prefersReducedMotion ? 0.5 : (clockSec * 0.75) % 1;
              const pt = evalQuadraticBezier(
                { x: rx + 18, y: ry },
                { x: rx, y: ry - 26 },
                { x: rx - 18, y: ry },
                t
              );
              return (
                <g key={`hit-${cacheNode.id}`}>
                  <path
                    d={hitPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="1.6"
                    strokeDasharray="4 3"
                    opacity="0.85"
                  />
                  <polygon
                    points={`${pt.x},${pt.y - 4.5} ${pt.x + 4.5},${pt.y} ${pt.x},${pt.y + 4.5} ${pt.x - 4.5},${pt.y}`}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  <text
                    x={rx}
                    y={ry - 18}
                    textAnchor="middle"
                    className="text-[9px] font-mono font-semibold fill-emerald-700 dark:fill-emerald-400"
                  >
                    {cacheHitPct}% Cache Hit (&lt;2ms)
                  </text>
                </g>
              );
            })}

          {/* Animated Data Packets */}
          {particles.map((p) => {
            const geom = edgeGeometries.get(p.edgeId);
            if (!geom) return null;
            const pt = evalQuadraticBezier(geom.p0, geom.p1, geom.p2, p.progress);

            if (p.kind === 'failover') {
              return (
                <rect
                  key={p.id}
                  x={pt.x - 4.5}
                  y={pt.y - 4.5}
                  width="9"
                  height="9"
                  rx="2"
                  fill="#7c3aed"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              );
            }
            if (p.kind === 'bottleneck') {
              return (
                <polygon
                  key={p.id}
                  points={`${pt.x},${pt.y - 5} ${pt.x + 5},${pt.y + 4} ${pt.x - 5},${pt.y + 4}`}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.1"
                />
              );
            }
            return (
              <circle
                key={p.id}
                cx={pt.x}
                cy={pt.y}
                r={p.kind === 'async' ? 3.8 : 4.4}
                fill={p.kind === 'async' ? '#6366f1' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Interactive Architectural Nodes */}
          {layout.layoutNodes.map((node) => {
            const st = snapshot.nodeStats[node.id];
            const status = st?.status ?? 'nominal';
            const util = st?.utilizationPct ?? 0;
            const clampedBarW = Math.min(100, Math.max(0, util));

            const borderStroke =
              status === 'failed'
                ? '#e11d48'
                : status === 'bottleneck'
                  ? '#d97706'
                  : status === 'failover-active'
                    ? '#7c3aed'
                    : status === 'elevated'
                      ? '#0284c7'
                      : '#cbd5e1';

            const statusText =
              status === 'failed'
                ? 'FAILED (CLICK TO RESTORE)'
                : status === 'bottleneck'
                  ? `BOTTLENECK · ${util}%`
                  : status === 'failover-active'
                    ? `FAILOVER RX · ${util}%`
                    : `${ROLE_LABEL[node.role]} · ${util}%`;

            const statusFillClass =
              status === 'failed'
                ? 'fill-rose-600 dark:fill-rose-400'
                : status === 'bottleneck'
                  ? 'fill-amber-700 dark:fill-amber-400'
                  : status === 'failover-active'
                    ? 'fill-violet-700 dark:fill-violet-400'
                    : 'fill-slate-500 dark:fill-slate-400';

            const barFill =
              status === 'failed'
                ? '#e11d48'
                : util >= 90
                  ? '#d97706'
                  : status === 'failover-active'
                    ? '#7c3aed'
                    : '#0284c7';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => toggleNodeFault(node.id)}
                onKeyDown={(evt) => {
                  if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault();
                    toggleNodeFault(node.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}: ${statusText}. Click to toggle failure simulation.`}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width={node.w}
                  height={node.h}
                  rx="10"
                  className={
                    status === 'failed'
                      ? 'fill-rose-50/90 dark:fill-rose-950/60'
                      : status === 'bottleneck'
                        ? 'fill-amber-50/90 dark:fill-amber-950/40'
                        : status === 'failover-active'
                          ? 'fill-violet-50/90 dark:fill-violet-950/40'
                          : 'fill-white dark:fill-slate-900'
                  }
                  stroke={borderStroke}
                  strokeWidth={status === 'nominal' ? 1.2 : 2.2}
                />

                {/* Top Status Micro-Header */}
                <text
                  x="10"
                  y="16"
                  className={`text-[9px] font-mono font-semibold ${statusFillClass}`}
                >
                  {statusText}
                </text>

                {/* Node Title */}
                <text
                  x="10"
                  y="34"
                  className="text-[11.5px] font-semibold fill-slate-900 dark:fill-slate-100"
                >
                  {node.label.length > 21 ? `${node.label.slice(0, 19)}…` : node.label}
                </text>

                {/* Sublabel */}
                <text
                  x="10"
                  y="48"
                  className="text-[9.5px] fill-slate-500 dark:fill-slate-400"
                >
                  {node.sublabel.length > 25 ? `${node.sublabel.slice(0, 23)}…` : node.sublabel}
                </text>

                {/* Live RPS + Latency Telemetry */}
                <text
                  x="10"
                  y={node.h - 15}
                  className="text-[9.5px] font-mono fill-slate-700 dark:fill-slate-300"
                >
                  {status === 'failed'
                    ? 'OFFLINE'
                    : `${formatCompactRps(st?.incomingRps ?? 0)} rps · ${st?.latencyMs ?? 0}ms`}
                </text>

                {/* Utilization Bar */}
                <rect
                  x="10"
                  y={node.h - 10}
                  width={node.w - 20}
                  height="4.5"
                  rx="2.25"
                  className="fill-slate-200 dark:fill-slate-800"
                />
                <rect
                  x="10"
                  y={node.h - 10}
                  width={((node.w - 20) * clampedBarW) / 100}
                  height="4.5"
                  rx="2.25"
                  fill={barFill}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Bottleneck & Failover Diagnostics Deck */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8 space-y-2">
          {snapshot.diagnostics.slice(0, compact ? 2 : 3).map((diag, idx) => {
            const Icon =
              diag.severity === 'critical'
                ? ShieldAlert
                : diag.severity === 'warn'
                  ? AlertTriangle
                  : CheckCircle2;
            const toneClass =
              diag.severity === 'critical'
                ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                : diag.severity === 'warn'
                  ? 'border-amber-200 dark:border-amber-900/70 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
                  : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300';

            return (
              <div
                key={`${diag.title}-${idx}`}
                className={`rounded-lg border px-3 py-2 text-xs space-y-0.5 ${toneClass}`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{diag.title}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{diag.detail}</p>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  Mitigation: {diag.mitigation}
                </p>
              </div>
            );
          })}
        </div>

        {/* Node Quick-Fault Toggles & Role Summary */}
        <div className="lg:col-span-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Fault Injection &amp; Node Health
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {failedNodeIds.length} failed
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeTopology.nodes.map((n) => {
              const Icon = ROLE_ICON[n.role];
              const isFailed = failedNodeIds.includes(n.id);
              const util = snapshot.nodeStats[n.id]?.utilizationPct ?? 0;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => toggleNodeFault(n.id)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-mono transition-colors ${
                    isFailed
                      ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 font-semibold'
                      : util >= 90
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[110px]">{n.label}</span>
                  <span className="tabular-nums opacity-80">{isFailed ? 'OFF' : `${util}%`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complete Architecture & Real-World Blueprint Explanation Deck */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <button
          type="button"
          onClick={() => setShowBlueprintExplanation((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {activeRealWorldExplanation
                ? `Complete Real-World System Design Explanation — ${activeRealWorldExplanation.shortTitle}`
                : 'Architecture Flow Explanation & Design Highlights'}
            </span>
            {activeRealWorldExplanation && (
              <>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {activeRealWorldExplanation.domainLabel} · {activeRealWorldExplanation.scaleBadge}
                </span>
              </>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-400 shrink-0">
            {showBlueprintExplanation ? 'Hide Details' : 'Read Full Explanation'}
            {showBlueprintExplanation ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </span>
        </button>

        {showBlueprintExplanation && (
          <div className="px-4 pb-4 pt-1 space-y-4 text-xs leading-5">
            {activeRealWorldExplanation ? (
              <>
                {/* Scale & Communication Profile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeRealWorldExplanation.capacityNumbers.slice(0, 4).map((cap) => (
                    <div
                      key={cap.metric}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
                    >
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cap.metric}
                      </div>
                      <div className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                        {cap.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simple English + Formal System Definition */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-300">
                      How It Works in Simple English
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {activeRealWorldExplanation.simpleEnglish}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Formal Architecture &amp; Protocols ({activeRealWorldExplanation.commPatterns.join(' · ')})
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {activeRealWorldExplanation.formalDefinition}
                    </p>
                  </div>
                </div>

                {/* Step-by-Step Request Lifecycle */}
                {activeRealWorldExplanation.requestLifecycleSteps.length > 0 && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 font-semibold text-slate-900 dark:text-slate-100">
                      End-to-End Request Lifecycle (Synced to Animated Topology Nodes)
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activeRealWorldExplanation.requestLifecycleSteps.map((st) => (
                        <div key={st.step} className="p-3 grid grid-cols-1 md:grid-cols-12 gap-2">
                          <div className="md:col-span-4 space-y-0.5">
                            <div className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                              Step {st.step} · {st.packetLabel}
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {st.title}
                            </div>
                          </div>
                          <div className="md:col-span-4 text-slate-700 dark:text-slate-300">
                            {st.plainEnglish}
                          </div>
                          <div className="md:col-span-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {st.technicalDetail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Algorithms, Storage, Bottleneck & Multi-Region DR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1.5">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Core Algorithms &amp; Storage Design
                    </div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc pl-4">
                      {activeRealWorldExplanation.coreAlgorithms.map((alg) => (
                        <li key={alg}>{alg}</li>
                      ))}
                    </ul>
                    <p className="pt-1 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                      <strong className="text-slate-800 dark:text-slate-200">DB Strategy:</strong>{' '}
                      {activeRealWorldExplanation.dbDesignSummary}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-3.5 space-y-1.5">
                    <div className="font-semibold text-amber-900 dark:text-amber-300">
                      Primary Bottleneck &amp; Production Fix
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {activeRealWorldExplanation.bottleneckAndFix}
                    </p>
                    <p className="pt-1 text-slate-600 dark:text-slate-400 border-t border-amber-200/70 dark:border-amber-900/50">
                      <strong className="text-slate-800 dark:text-slate-200">Caching:</strong>{' '}
                      {activeRealWorldExplanation.cachingStrategy}
                    </p>
                  </div>

                  <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 p-3.5 space-y-1.5">
                    <div className="font-semibold text-sky-900 dark:text-sky-300">
                      Consistency, RPO/RTO &amp; Failover DR
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">Consistency:</strong>{' '}
                      {activeRealWorldExplanation.consistencyModel}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">RPO / RTO:</strong>{' '}
                      {activeRealWorldExplanation.rpoRto}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Multi-Region DR:</strong>{' '}
                      {activeRealWorldExplanation.multiRegionDr}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-2">
                <p className="text-slate-700 dark:text-slate-300">{activeTopology.subtitle}</p>
                {activeTopology.patternHighlights.length > 0 && (
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                    {activeTopology.patternHighlights.map((hl) => (
                      <li key={hl}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
