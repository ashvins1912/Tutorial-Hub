import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Flame,
  Info,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Zap,
} from 'lucide-react';
import {
  SYSTEM_DFD_PATTERNS,
  type SystemDfdEdge,
  type SystemDfdNode,
  type SystemDfdPattern,
} from '../../data/systemDfdLibraryData';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import {
  computeEdgeHeatScore,
  computeHeatVisual,
  computeNodeHeatScore,
  DfdAnimatedEdge,
  DfdGridBackdrop,
  DfdInteractiveNode,
  DfdSvgDefs,
  useDfdPacketProgress,
} from './SystemDfdSvgEngine';

export interface SystemDfdSimulatorProps {
  selectedPatternId: string;
  onSelectPatternId: (patternId: string) => void;
  onOpenRoadmapModule: (moduleId: string) => void;
  onOpenAcademyTopic: (categoryId: string, topicId: string) => void;
  onOpenDbFlow: (flowId: string) => void;
  onOpenLabProblem?: (problemId: string) => void;
}

type InspectedTarget =
  | { kind: 'node'; node: SystemDfdNode; latencyMs: number }
  | { kind: 'edge'; edge: SystemDfdEdge; latencyMs: number };

export function SystemDfdSimulator({
  selectedPatternId,
  onSelectPatternId,
  onOpenRoadmapModule,
  onOpenAcademyTopic,
  onOpenDbFlow,
  onOpenLabProblem,
}: SystemDfdSimulatorProps) {
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);

  const pattern: SystemDfdPattern = useMemo(
    () => SYSTEM_DFD_PATTERNS.find((p) => p.id === selectedPatternId) ?? SYSTEM_DFD_PATTERNS[0],
    [selectedPatternId]
  );

  const [pathMode, setPathMode] = useState<'fast' | 'deep'>('fast');
  const [dbLatencyMs, setDbLatencyMs] = useState<number>(40);
  const [trafficLoadX, setTrafficLoadX] = useState<number>(2);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(2200);
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(false);
  const [inspected, setInspected] = useState<InspectedTarget | null>(null);

  const steps = pathMode === 'fast' ? pattern.fastPathSteps : pattern.deepPathSteps;
  const safeStepIdx = Math.min(stepIdx, Math.max(0, steps.length - 1));
  const currentStep = steps[safeStepIdx] ?? steps[0];

  // Reset step & tooltip selection when switching pattern or execution path
  useEffect(() => {
    setStepIdx(0);
    setInspected(null);
  }, [pattern.id, pathMode]);

  // Step auto-advancer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, steps.length]);

  const packetProgress = useDfdPacketProgress(isPlaying, Math.round(speedMs * 0.72));

  const nodeMap = useMemo(() => {
    const map = new Map<string, SystemDfdNode>();
    pattern.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [pattern.nodes]);

  const computeNodeLatency = (node: SystemDfdNode): number => {
    if (node.isDatabase) {
      return Math.round(dbLatencyMs * (1 + (trafficLoadX - 1) * 0.18));
    }
    if (node.isCache) {
      return Math.max(1, Math.round(node.baseLatencyMs * (1 + (trafficLoadX - 1) * 0.05)));
    }
    return Math.round(node.baseLatencyMs * (1 + (trafficLoadX - 1) * 0.08));
  };

  const computeEdgeLatency = (edge: SystemDfdEdge): number => {
    const targetNode = nodeMap.get(edge.to);
    if (edge.variant === 'db-miss' || targetNode?.isDatabase) {
      return Math.round(dbLatencyMs * (1 + (trafficLoadX - 1) * 0.16));
    }
    return Math.max(1, Math.round(edge.baseLatencyMs * (1 + (trafficLoadX - 1) * 0.06)));
  };

  const computeNodeLoadPct = (node: SystemDfdNode, isActive: boolean): number => {
    const base = isActive ? 28 : 10;
    const factor = node.isDatabase ? trafficLoadX * 9.5 : node.isCache ? trafficLoadX * 4.5 : trafficLoadX * 6;
    return Math.min(98, Math.round(base + factor));
  };

  // Compute end-to-end latency comparison for Fast vs Deep path
  const sumPathLatency = (pathSteps: typeof pattern.fastPathSteps) => {
    const visitedNodes = new Set<string>();
    pathSteps.forEach((st) => st.activeNodeIds.forEach((id) => visitedNodes.add(id)));
    let total = 0;
    visitedNodes.forEach((id) => {
      const n = nodeMap.get(id);
      if (n) total += computeNodeLatency(n);
    });
    return total;
  };

  const fastTotalMs = sumPathLatency(pattern.fastPathSteps);
  const deepTotalMs = sumPathLatency(pattern.deepPathSteps);
  const activePathMs = pathMode === 'fast' ? fastTotalMs : deepTotalMs;
  const speedupRatio =
    deepTotalMs > fastTotalMs
      ? `${(deepTotalMs / Math.max(1, fastTotalMs)).toFixed(1)}× faster`
      : `${(fastTotalMs / Math.max(1, deepTotalMs)).toFixed(1)}× delta`;

  const dbNode = pattern.nodes.find((n) => n.isDatabase);
  const dbPressurePct = dbNode
    ? computeNodeLoadPct(dbNode, currentStep.activeNodeIds.includes(dbNode.id))
    : 15;

  const activeTooltip: InspectedTarget = inspected ?? {
    kind: 'node',
    node: nodeMap.get(currentStep.activeNodeIds[currentStep.activeNodeIds.length - 1]) ?? pattern.nodes[0],
    latencyMs: computeNodeLatency(
      nodeMap.get(currentStep.activeNodeIds[currentStep.activeNodeIds.length - 1]) ?? pattern.nodes[0]
    ),
  };

  // Live per-node & per-edge thermal heat scores derived directly from the animation state
  const nodeHeatMap = new Map<string, number>();
  let hottestNode: { node: SystemDfdNode; score: number; latencyMs: number } | null = null;
  pattern.nodes.forEach((node) => {
    const isActive = currentStep.activeNodeIds.includes(node.id);
    const tag = currentStep.nodeTags[node.id] ?? (isActive ? 'ACTIVE' : 'IDLE');
    const latency = computeNodeLatency(node);
    const loadPct = computeNodeLoadPct(node, isActive);
    const score = computeNodeHeatScore({
      computedLatencyMs: latency,
      loadPct,
      active: isActive,
      stateTag: tag,
      packetProgress,
    });
    nodeHeatMap.set(node.id, score);
    if (!hottestNode || score > hottestNode.score) {
      hottestNode = { node, score, latencyMs: latency };
    }
  });

  const edgeHeatMap = new Map<string, number>();
  let hottestEdge: { edge: SystemDfdEdge; score: number; latencyMs: number } | null = null;
  pattern.edges.forEach((edge) => {
    const toNode = nodeMap.get(edge.to);
    const isActive = currentStep.activeEdgeIds.includes(edge.id);
    const latency = computeEdgeLatency(edge);
    const targetLoadPct = toNode
      ? computeNodeLoadPct(toNode, currentStep.activeNodeIds.includes(toNode.id))
      : 20;
    const score = computeEdgeHeatScore({
      computedLatencyMs: latency,
      targetLoadPct,
      active: isActive,
      variant: edge.variant,
      packetProgress,
    });
    edgeHeatMap.set(edge.id, score);
    if (!hottestEdge || score > hottestEdge.score) {
      hottestEdge = { edge, score, latencyMs: latency };
    }
  });

  const inspectedHeatScore =
    activeTooltip.kind === 'node'
      ? (nodeHeatMap.get(activeTooltip.node.id) ?? 0.2)
      : (edgeHeatMap.get(activeTooltip.edge.id) ?? 0.2);
  const inspectedHeat = computeHeatVisual(inspectedHeatScore);

  const handleOpenProblem = (problemId: string) => {
    if (onOpenLabProblem) {
      onOpenLabProblem(problemId);
      return;
    }
    selectProblem(problemId);
    setActiveView('workspace');
  };

  return (
    <div className="space-y-5">
      {/* Architecture Pattern Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                Interactive System Design DFD &amp; Latency Simulator
              </span>
              <span aria-hidden="true">·</span>
              <span>SVG Packet Engine · Live Node &amp; Edge Tooltips · Bidirectional Links</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
              {pattern.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {pattern.plainEnglishSummary}
            </p>
          </div>

          {/* Fast Path vs Deep Path Branch Switcher */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Simulate Request Branch
            </span>
            <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setPathMode('fast')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  pathMode === 'fast'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {pattern.fastPathLabel}
              </button>
              <button
                type="button"
                onClick={() => setPathMode('deep')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  pathMode === 'deep'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {pattern.deepPathLabel}
              </button>
            </div>
          </div>
        </div>

        {/* 6 Standard System Design Pattern Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SYSTEM_DFD_PATTERNS.map((item) => {
            const isSelected = item.id === pattern.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPatternId(item.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="truncate">{item.category}</span>
                  <span>{item.difficulty}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 truncate">
                  {item.shortTitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Parameter Sliders + KPI Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex items-center justify-between font-mono mb-1.5">
              <label htmlFor="dfd-db-latency" className="text-slate-700 dark:text-slate-300">
                DB Disk / Query Latency
              </label>
              <span className="font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                {dbLatencyMs} ms
              </span>
            </div>
            <input
              id="dfd-db-latency"
              type="range"
              min={10}
              max={160}
              step={5}
              value={dbLatencyMs}
              onChange={(e) => setDbLatencyMs(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
              <span>10 ms (Hot NVMe)</span>
              <span>160 ms (Cold I/O)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between font-mono mb-1.5">
              <label htmlFor="dfd-traffic-load" className="text-slate-700 dark:text-slate-300">
                Traffic Burst Multiplier
              </label>
              <span className="font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                {trafficLoadX}× Load
              </span>
            </div>
            <input
              id="dfd-traffic-load"
              type="range"
              min={1}
              max={10}
              step={1}
              value={trafficLoadX}
              onChange={(e) => setTrafficLoadX(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-0.5">
              <span>1× Steady</span>
              <span>10× Flash Sale</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Active Path Latency</div>
            <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {activePathMs} ms
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Fast vs. Deep Delta</div>
            <div className="text-lg font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
              {speedupRatio}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">DB Pressure</div>
            <div
              className={`text-lg font-mono font-bold tabular-nums mt-0.5 ${
                dbPressurePct >= 75
                  ? 'text-rose-700 dark:text-rose-400'
                  : dbPressurePct >= 45
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {dbPressurePct}% {dbPressurePct >= 75 ? 'HIGH' : dbPressurePct >= 45 ? 'MOD' : 'OK'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Step Progress</div>
            <div className="text-lg font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400 mt-0.5">
              {currentStep.step} / {steps.length}
            </div>
          </div>
        </div>
      </section>

      {/* Two-Zone Sandbox Stage (Left: Interactive SVG DFD Canvas · Right: Live Explanation Tooltip & Step Deck) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          {/* Playback Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Step {currentStep.step}: {currentStep.title}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Hover or click any component or arrow on the diagram to inspect its latency, role, and failure defense.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHeatmapEnabled((v) => !v)}
                aria-pressed={heatmapEnabled}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                  heatmapEnabled
                    ? 'border-orange-500 bg-orange-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-orange-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                {heatmapEnabled ? 'Latency Heatmap: ON' : 'Latency Heatmap'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((s) => (s - 1 + steps.length) % steps.length);
                }}
                aria-label="Previous DFD step"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500"
              >
                <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((s) => (s + 1) % steps.length);
                }}
                aria-label="Next DFD step"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500"
              >
                <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(0);
                }}
                aria-label="Reset DFD simulation"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-0.5 text-[11px] font-mono">
                {[
                  { label: '0.5×', ms: 3400 },
                  { label: '1×', ms: 2200 },
                  { label: '2×', ms: 1150 },
                ].map((sp) => (
                  <button
                    key={sp.label}
                    type="button"
                    onClick={() => setSpeedMs(sp.ms)}
                    className={`px-2 py-1 rounded ${
                      speedMs === sp.ms
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Latency Heatmap Scale Legend & Live Bottleneck Callout */}
          {heatmapEnabled && (
            <div className="rounded-lg border border-orange-200 dark:border-orange-900/70 bg-orange-50/50 dark:bg-orange-950/20 px-3.5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                  Thermal Load Scale:
                </span>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="inline-block w-24 h-2.5 rounded-sm bg-gradient-to-r from-emerald-500 via-yellow-500 via-orange-500 to-red-500" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">COOL</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">WARM</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-orange-700 dark:text-orange-400 font-semibold">HOT</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-rose-700 dark:text-rose-400 font-semibold">CRITICAL</span>
                </div>
              </div>
              {hottestNode && hottestEdge && (
                <div className="font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300">
                  Peak Node:{' '}
                  <strong className={computeHeatVisual((hottestNode as { score: number }).score).badgeTextClass}>
                    {(hottestNode as { node: SystemDfdNode }).node.label} ({Math.round((hottestNode as { score: number }).score * 100)}%)
                  </strong>
                  {' · '}
                  Peak Hop:{' '}
                  <strong className={computeHeatVisual((hottestEdge as { score: number }).score).badgeTextClass}>
                    {(hottestEdge as { edge: SystemDfdEdge }).edge.label} ({(hottestEdge as { latencyMs: number }).latencyMs}ms)
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Interactive SVG DFD Canvas */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3 overflow-x-auto">
            <svg
              viewBox="0 0 900 310"
              className="w-full min-w-[700px] h-auto"
              role="img"
              aria-label={`Interactive System Design Data Flow Diagram for ${pattern.title}`}
            >
              <DfdSvgDefs />
              <DfdGridBackdrop />

              {/* Animated Vector Edges */}
              {pattern.edges.map((edge) => {
                const fromNode = nodeMap.get(edge.from);
                const toNode = nodeMap.get(edge.to);
                if (!fromNode || !toNode) return null;
                const isActive = currentStep.activeEdgeIds.includes(edge.id);
                const latency = computeEdgeLatency(edge);
                const isSelected = inspected?.kind === 'edge' && inspected.edge.id === edge.id;
                return (
                  <DfdAnimatedEdge
                    key={edge.id}
                    edge={edge}
                    fromNode={fromNode}
                    toNode={toNode}
                    active={isActive}
                    packetProgress={packetProgress}
                    packetLabel={isActive ? currentStep.packetLabel : undefined}
                    computedLatencyMs={latency}
                    selected={isSelected}
                    heatmapEnabled={heatmapEnabled}
                    heatScore={edgeHeatMap.get(edge.id) ?? 0.2}
                    onInspect={() => setInspected({ kind: 'edge', edge, latencyMs: latency })}
                  />
                );
              })}

              {/* Interactive Architecture Nodes */}
              {pattern.nodes.map((node) => {
                const isActive = currentStep.activeNodeIds.includes(node.id);
                const tag = currentStep.nodeTags[node.id] ?? (isActive ? 'ACTIVE' : 'IDLE');
                const latency = computeNodeLatency(node);
                const loadPct = computeNodeLoadPct(node, isActive);
                const isSelected = inspected?.kind === 'node' && inspected.node.id === node.id;
                return (
                  <DfdInteractiveNode
                    key={node.id}
                    node={node}
                    active={isActive}
                    selected={isSelected}
                    stateTag={tag}
                    computedLatencyMs={latency}
                    loadPct={loadPct}
                    heatmapEnabled={heatmapEnabled}
                    heatScore={nodeHeatMap.get(node.id) ?? 0.2}
                    onInspect={() => setInspected({ kind: 'node', node, latencyMs: latency })}
                  />
                );
              })}
            </svg>
          </div>

          {/* Clickable Step Scrubber */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {steps.map((st, idx) => {
              const isCurr = idx === safeStepIdx;
              const isDone = idx < safeStepIdx;
              return (
                <button
                  key={`${pathMode}-${st.step}`}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(idx);
                  }}
                  className={`rounded-lg border p-2.5 text-left transition-colors ${
                    isCurr
                      ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                      : isDone
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Step {st.step} · {st.packetLabel}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">
                    {st.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Deck: Live Step Explanation + Interactive Node/Edge Tooltip Inspector */}
        <aside className="xl:col-span-4 space-y-4">
          {/* Active Step Plain-English & Standard Definition */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Active Step Walkthrough
              </span>
              <span className="font-mono text-sky-700 dark:text-sky-400">
                {currentStep.packetLabel}
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100">In Simple English</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.plainEnglish}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Standard Systems Definition
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.standardDef}
              </p>
            </div>
          </div>

          {/* Interactive Tooltip Inspector Panel */}
          <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {activeTooltip.kind === 'node' ? 'Component Tooltip Inspector' : 'Data Flow Edge Tooltip'}
              </div>
              <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {activeTooltip.latencyMs} ms
              </span>
            </div>

            {activeTooltip.kind === 'node' ? (
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activeTooltip.node.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {activeTooltip.node.sublabel}
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">Role: </strong>
                  {activeTooltip.node.tooltipPlainEnglish}
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="font-semibold text-slate-800 dark:text-slate-200">Spec: </strong>
                  {activeTooltip.node.tooltipStandardDef}
                </p>
                <div className="pt-2 border-t border-sky-200/70 dark:border-sky-900/70">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Production Guard:{' '}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {activeTooltip.node.tooltipMitigation}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeTooltip.edge.label}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeTooltip.edge.tooltipDetail}
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Flow: {activeTooltip.edge.from} → {activeTooltip.edge.to}
                </div>
              </div>
            )}
            {heatmapEnabled && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-2.5 flex items-center justify-between gap-2 font-mono text-[11px] tabular-nums">
                <span className="text-slate-600 dark:text-slate-400">
                  Live Heat Index:
                </span>
                <span className={`font-bold ${inspectedHeat.badgeTextClass}`}>
                  {inspectedHeat.band} · {inspectedHeat.pct}% ({activeTooltip.latencyMs} ms)
                </span>
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* Bidirectional Cross-Link Matrix: Design Topics <-> DFD <-> Algorithms & Coding Problems */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Bidirectional Concept Continuity · Design Topics ↔ DFDs ↔ Algorithms &amp; Problems
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Jump directly from this DFD simulation into the corresponding System Design theory lesson, Database internals DFD, or the exact data-structure algorithm &amp; coding problem that powers it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: System Design & DB DFD Deep-Dive Links */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Related System Design &amp; DB Topics
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenRoadmapModule(pattern.linkedRoadmapModuleId)}
                className="group w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-sky-500 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <span>{pattern.linkedRoadmapLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" aria-hidden="true" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Open directly in Master Roadmap &amp; Algos
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenAcademyTopic(pattern.linkedAcademyCategoryId, pattern.linkedAcademyTopicId)
                }
                className="group w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-sky-500 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <span>{pattern.linkedAcademyLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" aria-hidden="true" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Jump straight to Deep Academy lesson &amp; interview Q&amp;A
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenDbFlow(pattern.linkedDbFlowId)}
                className="group w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-sky-500 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <span className="inline-flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    {pattern.linkedDbFlowLabel}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" aria-hidden="true" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Inspect storage-layer internals in DB DFD Visualizer
                </div>
              </button>
            </div>
          </div>

          {/* Column 2: Underlying Core Algorithms */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              Core Algorithms Powering This DFD
            </div>
            <div className="space-y-2">
              {pattern.linkedAlgorithms.map((algo) => (
                <button
                  key={algo.algoId}
                  type="button"
                  onClick={() => openAlgorithm(algo.algoId, 'mental')}
                  className="group w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span>{algo.label}</span>
                    <span className="font-mono text-[10px] text-indigo-700 dark:text-indigo-400 shrink-0">
                      {algo.complexity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {algo.whyItMatters}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Related Hands-On Algorithmic Problems */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Code2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              Practice Related Coding Problems
            </div>
            <div className="space-y-2">
              {pattern.linkedProblems.map((prob) => (
                <button
                  key={prob.problemId}
                  type="button"
                  onClick={() => handleOpenProblem(prob.problemId)}
                  className="group w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-amber-500 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                      #{prob.number} {prob.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {prob.connection}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
