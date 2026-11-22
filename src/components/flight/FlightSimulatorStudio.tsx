import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Flame,
  GitBranch,
  Globe,
  Layers,
  Pause,
  Play,
  Plus,
  Rocket,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import {
  DOMAIN_TEMPLATES,
  FEATURE_MODULES,
  INFRA_NODE_CATALOG,
  buildPresetTopology,
  generateFeatureSequenceMermaid,
  generateTopologyMermaid,
  validateTopology,
  type ArchitectureParadigm,
  type BranchingModel,
  type BudgetTier,
  type DomainTemplateId,
  type FlightEdgeData,
  type FlightNodeData,
  type InfraNodeType,
  type RepoModel,
  type RolloutStrategyId,
  type UxJourneyStep,
} from '../../data/flightSimulatorData';
import { withStudioBoundary } from '../hoc';
import { CopyButton, SegmentedTabBar } from '../ui';
import { FlightMermaidViewer } from './FlightMermaidViewer';

type FlightStage = 1 | 2 | 3 | 4 | 5 | 6;
type InspectorTab = 'what-why' | 'live-dfd' | 'algorithms' | 'handoff';

interface CustomFlowNodeData extends Record<string, unknown> {
  label: string;
  techStack: string;
  category: 'edge' | 'compute' | 'data';
  replicas: number;
  killed?: boolean;
  latencyInjectedMs?: number;
  throttled?: boolean;
  selectedNode?: boolean;
}

const FlightArchitectureNode: React.FC<NodeProps<Node<CustomFlowNodeData>>> = ({ data }) => {
  const borderClass = data.killed
    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60'
    : data.selectedNode
      ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 ring-2 ring-sky-500/40'
      : data.category === 'edge'
        ? 'border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900'
        : data.category === 'compute'
          ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900'
          : 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900';

  return (
    <div className={`min-w-[162px] rounded-lg border px-3 py-2 shadow-xs transition-colors ${borderClass}`}>
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-sky-500" />
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="uppercase text-slate-500 dark:text-slate-400">{data.category}</span>
        <span
          className={`font-semibold tabular-nums ${
            data.killed
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {data.killed ? 'DOWN' : `x${data.replicas}`}
        </span>
      </div>
      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
        {data.label}
      </div>
      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
        {data.techStack}
      </div>
      {(data.latencyInjectedMs || data.throttled) && !data.killed && (
        <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-1">
          {data.latencyInjectedMs ? `+${data.latencyInjectedMs}ms ` : ''}
          {data.throttled ? 'Throttled' : ''}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-sky-500" />
    </div>
  );
};

const NODE_TYPES = { flightNode: FlightArchitectureNode };

const CI_STAGES = [
  { id: 'lint', label: '1. Code Lint', detail: 'ESLint / Ruff / Gitleaks secret check clean (0.9s)' },
  { id: 'tests', label: '2. Unit & Int Tests', detail: '348 assertions + Testcontainers DB passed (28s)' },
  { id: 'sec', label: '3. Security Scan', detail: 'Semgrep SAST + Trivy 0 Critical CVEs (19s)' },
  { id: 'docker', label: '4. Docker Build', detail: 'Multi-stage distroless image built (18.2 MB) + SBOM' },
  { id: 'push', label: '5. Registry Push', detail: 'Signed sha256 digest pushed with Cosign attestation' },
];

const FlightSimulatorStudioInner: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  // Cockpit Stage Navigation
  const [stage, setStage] = useState<FlightStage>(1);

  // Stage 1: Product & UX State
  const [domainId, setDomainId] = useState<DomainTemplateId>('ecommerce');
  const [dau, setDau] = useState<number>(450000);
  const [budget, setBudget] = useState<BudgetTier>('growth');
  const [targetLatencyMs, setTargetLatencyMs] = useState<number>(120);
  const [uxSteps, setUxSteps] = useState<UxJourneyStep[]>(DOMAIN_TEMPLATES[0].uxJourney);

  // Stage 2: Architect Topology State
  const [paradigm, setParadigm] = useState<ArchitectureParadigm>('microservices');
  const initialPreset = useMemo(() => buildPresetTopology('microservices'), []);
  const [nodes, setNodes] = useState<FlightNodeData[]>(initialPreset.nodes);
  const [edges, setEdges] = useState<FlightEdgeData[]>(initialPreset.edges);

  // Stage 3: Engineering State
  const [repoModel, setRepoModel] = useState<RepoModel>('monorepo');
  const [branchModel, setBranchModel] = useState<BranchingModel>('trunk-based');
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([
    'feat-auth',
    'feat-search',
    'feat-cart',
    'feat-checkout',
  ]);
  const [gitFeed, setGitFeed] = useState<string[]>([
    'eng-maya pushed feat/search-bm25 -> PR #418 checks green',
    'eng-rohan merged fix/cart-redis-ttl -> main@a94f2c1',
  ]);

  // Stage 4: DevOps CI/CD & Promotion State
  const [ciRunning, setCiRunning] = useState<boolean>(false);
  const [ciStepIdx, setCiStepIdx] = useState<number>(4);
  const [rolloutStrategy, setRolloutStrategy] = useState<RolloutStrategyId>('canary');
  const [promotedEnvIdx, setPromotedEnvIdx] = useState<number>(2); // 0=Dev, 1=QA/Staging, 2=Prod

  // Stage 5: Live Runtime & Discrete-Event Simulation State
  const [trafficRps, setTrafficRps] = useState<number>(8500);
  const [simPlaying, setSimPlaying] = useState<boolean>(true);
  const [packetPhase, setPacketPhase] = useState<number>(0);

  // Click-to-Inspect 4-Tab Deep Learning Drawer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('n-gw');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('what-why');

  const activeDomain = useMemo(
    () => DOMAIN_TEMPLATES.find((d) => d.id === domainId) ?? DOMAIN_TEMPLATES[0],
    [domainId]
  );

  const selectDomainTemplate = (id: DomainTemplateId) => {
    const tmpl = DOMAIN_TEMPLATES.find((d) => d.id === id) ?? DOMAIN_TEMPLATES[0];
    setDomainId(id);
    setDau(tmpl.defaultDau);
    setTargetLatencyMs(tmpl.defaultLatencyMs);
    setBudget(tmpl.defaultBudget);
    setUxSteps(tmpl.uxJourney);
  };

  const switchParadigm = (next: ArchitectureParadigm) => {
    setParadigm(next);
    const preset = buildPresetTopology(next);
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setSelectedNodeId(preset.nodes[2]?.id ?? preset.nodes[0]?.id ?? null);
  };

  // Validation Engine
  const validationIssues = useMemo(
    () => validateTopology(nodes, edges, dau, targetLatencyMs, enabledFeatures),
    [nodes, edges, dau, targetLatencyMs, enabledFeatures]
  );

  // Live Mermaid.js Generators
  const liveTopologyMermaid = useMemo(() => generateTopologyMermaid(nodes, edges), [nodes, edges]);
  const liveSequenceMermaid = useMemo(
    () =>
      generateFeatureSequenceMermaid(
        activeDomain.name,
        paradigm,
        rolloutStrategy,
        enabledFeatures
      ),
    [activeDomain.name, paradigm, rolloutStrategy, enabledFeatures]
  );

  // Stage 4 CI auto-progression
  useEffect(() => {
    if (!ciRunning) return;
    const timer = window.setTimeout(() => {
      if (ciStepIdx >= CI_STAGES.length - 1) {
        setCiRunning(false);
        return;
      }
      setCiStepIdx((prev) => prev + 1);
    }, prefersReducedMotion ? 120 : 650);
    return () => window.clearTimeout(timer);
  }, [ciRunning, ciStepIdx, prefersReducedMotion]);

  // Stage 5 Discrete-Event Packet Motion Loop
  useEffect(() => {
    if (stage !== 5 || !simPlaying || prefersReducedMotion) {
      setPacketPhase(0.5);
      return;
    }
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const speedFactor = 0.6 + Math.min(2.2, trafficRps / 15000);
      const dt = ((now - last) / 1400) * speedFactor;
      last = now;
      setPacketPhase((prev) => (prev + dt) % 1);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [stage, simPlaying, trafficRps, prefersReducedMotion]);

  // Stage 5 Discrete-Event Telemetry Metrics
  const runtimeTelemetry = useMemo(() => {
    const redisNode = nodes.find((n) => n.type === 'redis-cache');
    const pgNode = nodes.find((n) => n.type === 'postgresql');
    const kafkaNode = nodes.find((n) => n.type === 'kafka-broker');
    const gwNode = nodes.find((n) => n.type === 'api-gateway' || n.type === 'load-balancer');

    const redisHealthy = Boolean(redisNode && !redisNode.killed);
    const cacheHitPct = redisHealthy ? (redisNode?.throttled ? 54 : 82) : 0;

    // Effective compute capacity
    const computeNodes = nodes.filter((n) => INFRA_NODE_CATALOG[n.type].category === 'compute');
    const aliveComputeCapacity = computeNodes.reduce((acc, n) => {
      if (n.killed) return acc;
      const baseCap = INFRA_NODE_CATALOG[n.type].capacityRpsPerReplica * n.replicas;
      return acc + (n.throttled ? baseCap * 0.45 : baseCap);
    }, 0);

    const dbReadShare = trafficRps * (1 - cacheHitPct / 100);
    const pgCapacity =
      pgNode && !pgNode.killed
        ? INFRA_NODE_CATALOG.postgresql.capacityRpsPerReplica * pgNode.replicas * (pgNode.throttled ? 0.5 : 1)
        : 0;

    const gatewayDown = Boolean(gwNode && gwNode.killed);
    const dbDown = Boolean(pgNode && pgNode.killed);
    const overloadedCompute = aliveComputeCapacity > 0 && trafficRps > aliveComputeCapacity;
    const overloadedDb = pgNode && !pgNode.killed && dbReadShare > pgCapacity;

    const injectedLatency = nodes.reduce((acc, n) => acc + (n.killed ? 0 : n.latencyInjectedMs ?? 0), 0);

    let errorRatePct = 0.03;
    if (gatewayDown) errorRatePct = 100;
    else if (dbDown) errorRatePct = 42.5;
    else {
      if (overloadedCompute) {
        errorRatePct += Math.min(48, ((trafficRps - aliveComputeCapacity) / trafficRps) * 65);
      }
      if (overloadedDb) {
        errorRatePct += Math.min(35, ((dbReadShare - pgCapacity) / Math.max(1, dbReadShare)) * 50);
      }
      const killedCompute = computeNodes.filter((n) => n.killed).length;
      if (killedCompute > 0) errorRatePct += killedCompute * 14;
    }
    errorRatePct = Number(Math.min(100, errorRatePct).toFixed(2));

    const basePathLatency = paradigm === 'monolith' ? 28 : 44;
    const cachePenalty = redisHealthy ? 0 : 95;
    const overloadPenalty = overloadedCompute || overloadedDb ? 240 : 0;
    const p99Ms = gatewayDown
      ? 0
      : Math.round(basePathLatency + cachePenalty + overloadPenalty + injectedLatency + trafficRps / 850);

    const circuitBreakerOpen = errorRatePct >= 15 || p99Ms >= 650;
    const kafkaQueueDepth =
      kafkaNode && !kafkaNode.killed
        ? Math.max(0, Math.round((trafficRps * 0.12) * (overloadedDb || circuitBreakerOpen ? 3.4 : 0.2)))
        : 0;

    return {
      cacheHitPct,
      errorRatePct,
      p99Ms,
      circuitBreakerOpen,
      kafkaQueueDepth,
      aliveComputeCapacity: Math.round(aliveComputeCapacity),
      overloadedCompute,
      overloadedDb,
    };
  }, [nodes, trafficRps, paradigm]);

  // React Flow synchronization
  const rfNodes: Node<CustomFlowNodeData>[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: 'flightNode',
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          techStack: n.techStack,
          category: INFRA_NODE_CATALOG[n.type].category,
          replicas: n.replicas,
          killed: n.killed,
          latencyInjectedMs: n.latencyInjectedMs,
          throttled: n.throttled,
          selectedNode: n.id === selectedNodeId,
        },
      })),
    [nodes, selectedNodeId]
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: !prefersReducedMotion,
        style: {
          stroke:
            e.packetKind === 'cache'
              ? '#d97706'
              : e.packetKind === 'checkout'
                ? '#059669'
                : e.packetKind === 'async'
                  ? '#7c3aed'
                  : '#0284c7',
          strokeWidth: 1.8,
        },
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      })),
    [edges, prefersReducedMotion]
  );

  const handleNodesChange: OnNodesChange<Node<CustomFlowNodeData>> = useCallback((changes) => {
    setNodes((prev) => {
      const mapped: Node<CustomFlowNodeData>[] = prev.map((n) => ({
        id: n.id,
        type: 'flightNode',
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          techStack: n.techStack,
          category: INFRA_NODE_CATALOG[n.type].category,
          replicas: n.replicas,
        },
      }));
      const updated = changes.applyTo(mapped);
      const posMap = new Map(updated.map((u) => [u.id, u.position]));
      return prev
        .filter((n) => posMap.has(n.id))
        .map((n) => {
          const pos = posMap.get(n.id)!;
          return { ...n, x: Math.round(pos.x), y: Math.round(pos.y) };
        });
    });
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    setEdges((prev) => {
      const nextRf = addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        },
        prev.map((e) => ({ id: e.id, source: e.source, target: e.target }))
      );
      const added = nextRf[nextRf.length - 1];
      if (!added) return prev;
      return [
        ...prev,
        {
          id: added.id,
          source: added.source,
          target: added.target,
          label: 'Wired Flow',
          packetKind: 'search',
        },
      ];
    });
  }, []);

  const addNodeFromPalette = (type: InfraNodeType) => {
    const spec = INFRA_NODE_CATALOG[type];
    const colX = spec.category === 'edge' ? 190 : spec.category === 'compute' ? 430 : 690;
    const countSame = nodes.filter((n) => INFRA_NODE_CATALOG[n.type].category === spec.category).length;
    const newId = `n-${type}-${Date.now().toString().slice(-4)}`;
    const newNode: FlightNodeData = {
      id: newId,
      type,
      label: spec.label,
      x: colX + (countSame % 2) * 24,
      y: 45 + countSame * 84,
      techStack: spec.defaultTechStack,
      replicas: 2,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  const injectDirectDbAntiPattern = () => {
    const client = nodes.find((n) => n.type === 'web-client');
    const db = nodes.find((n) => n.type === 'postgresql' || n.type === 'nosql-db');
    if (!client || !db) return;
    const exists = edges.some((e) => e.source === client.id && e.target === db.id);
    if (exists) return;
    setEdges((prev) => [
      ...prev,
      {
        id: `e-direct-db-${Date.now()}`,
        source: client.id,
        target: db.id,
        label: 'Unsafe Direct DB!',
        packetKind: 'checkout',
      },
    ]);
  };

  const updateSelectedNode = (patch: Partial<FlightNodeData>) => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.map((n) => (n.id === selectedNodeId ? { ...n, ...patch } : n)));
  };

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const toggleFeatureModule = (featId: string) => {
    const feat = FEATURE_MODULES.find((f) => f.id === featId);
    if (!feat) return;
    const enabling = !enabledFeatures.includes(featId);
    setEnabledFeatures((prev) =>
      enabling ? [...prev, featId] : prev.filter((id) => id !== featId)
    );
    // Auto-inject any missing required nodes onto the canvas when enabling a feature
    if (enabling) {
      setNodes((prev) => {
        const present = new Set(prev.map((n) => n.type));
        const additions: FlightNodeData[] = [];
        feat.requiredNodes.forEach((reqType, idx) => {
          if (!present.has(reqType)) {
            const spec = INFRA_NODE_CATALOG[reqType];
            additions.push({
              id: `n-${reqType}-${Date.now().toString().slice(-3)}${idx}`,
              type: reqType,
              label: spec.label,
              x: spec.category === 'edge' ? 200 : spec.category === 'compute' ? 430 : 695,
              y: 60 + (prev.length + idx) * 65,
              techStack: spec.defaultTechStack,
              replicas: 2,
            });
            present.add(reqType);
          }
        });
        return additions.length > 0 ? [...prev, ...additions] : prev;
      });
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );
  const selectedSpec = selectedNode ? INFRA_NODE_CATALOG[selectedNode.type] : null;

  const srsContractJson = useMemo(
    () =>
      JSON.stringify(
        {
          product: activeDomain.name,
          targetDau: dau,
          budgetTier: budget,
          p99LatencyTargetMs: targetLatencyMs,
          paradigm,
          repoModel,
          branchingStrategy: branchModel,
          rolloutStrategy,
          endpoints: uxSteps
            .filter((s) => s.enabled)
            .map((s) => ({ screen: s.screen, method: s.method, path: s.endpoint })),
        },
        null,
        2
      ),
    [activeDomain.name, dau, budget, targetLatencyMs, paradigm, repoModel, branchModel, rolloutStrategy, uxSteps]
  );

  const stageMeta: { id: FlightStage; short: string; role: string }[] = [
    { id: 1, short: '1. Product & UX', role: 'Inception' },
    { id: 2, short: '2. Architect Canvas', role: 'Topology' },
    { id: 3, short: '3. Code & Features', role: 'Engineering' },
    { id: 4, short: '4. CI/CD Pipeline', role: 'DevOps' },
    { id: 5, short: '5. Live Runtime & Chaos', role: 'SRE Sim' },
    { id: 6, short: '6. Mermaid & Blueprint', role: 'Export' },
  ];

  return (
    <section className="space-y-6">
      {/* Pilot Cockpit Header */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>6-Stage Pilot Cockpit</span>
          <span aria-hidden="true">·</span>
          <span>React Flow Drag-and-Drop Canvas</span>
          <span aria-hidden="true">·</span>
          <span>Discrete-Event Runtime &amp; Chaos Engine</span>
          <span aria-hidden="true">·</span>
          <span>Live Mermaid.js Sync</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
          SDLC &amp; System Architecture Flight Simulator
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Pilot a software product from blank product requirements and UX wireframes to a live, high-traffic production architecture. Click any node in the canvas, runtime simulator, or Mermaid diagram to open the 4-tab Deep Learning Inspector.
        </p>
      </div>

      {/* 6-Stage Progressive Cockpit Stepper */}
      <nav aria-label="Flight Simulator Stages" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stageMeta.map((st) => {
          const active = stage === st.id;
          const completed = stage > st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setStage(st.id)}
              className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                <span className={active ? 'text-sky-700 dark:text-sky-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                  {st.role}
                </span>
                {completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />}
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 whitespace-nowrap truncate">
                {st.short}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Main Two-Zone Pilot Layout: Left Active Stage (8 cols) + Right Click-to-Inspect Drawer (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT STAGE AREA */}
        <div className={selectedNode ? 'xl:col-span-8 space-y-5' : 'xl:col-span-12 space-y-5'}>
          {/* ============================================================== */}
          {/* STAGE 1: PROJECT INCEPTION & UX WIREFRAME MAPPER               */}
          {/* ============================================================== */}
          {stage === 1 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Stage 1 · Product Manager &amp; UX Designer Handoff
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Project Inception, Scale Targets &amp; UX-to-API Contract Mapper
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 whitespace-nowrap"
                >
                  Handoff to Architect (Stage 2)
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Domain Templates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DOMAIN_TEMPLATES.map((tmpl) => {
                  const active = tmpl.id === domainId;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => selectDomainTemplate(tmpl.id)}
                      className={`text-left rounded-lg border p-3.5 transition-colors ${
                        active
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tmpl.name}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{tmpl.tagline}</p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Requirements Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="dau-slider" className="font-semibold text-slate-800 dark:text-slate-200">
                      Daily Active Users
                    </label>
                    <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                      {dau.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="dau-slider"
                    type="range"
                    min={20000}
                    max={2000000}
                    step={20000}
                    value={dau}
                    onChange={(e) => setDau(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label htmlFor="latency-slider" className="font-semibold text-slate-800 dark:text-slate-200">
                      Target p99 Latency
                    </label>
                    <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                      {targetLatencyMs} ms
                    </span>
                  </div>
                  <input
                    id="latency-slider"
                    type="range"
                    min={40}
                    max={300}
                    step={10}
                    value={targetLatencyMs}
                    onChange={(e) => setTargetLatencyMs(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Budget Tier</div>
                  <div className="flex gap-1.5">
                    {(['startup', 'growth', 'enterprise'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setBudget(tier)}
                        className={`flex-1 py-1.5 rounded-md border text-xs font-medium capitalize transition-colors ${
                          budget === tier
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive UX Wireframe -> Backend Data Contract Mapper */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  UX Designer Wireframe Mapper (Toggle screens to shape API contracts)
                </h3>
                <div className="space-y-2">
                  {uxSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`rounded-lg border p-3 transition-colors flex flex-wrap items-center justify-between gap-3 ${
                        step.enabled
                          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70'
                          : 'border-slate-200/60 dark:border-slate-800/50 bg-slate-50/60 dark:bg-slate-950/40 opacity-60'
                      }`}
                    >
                      <label className="flex items-start gap-2.5 cursor-pointer min-w-[220px] flex-1">
                        <input
                          type="checkbox"
                          checked={step.enabled}
                          onChange={() =>
                            setUxSteps((prev) =>
                              prev.map((item) =>
                                item.id === step.id ? { ...item, enabled: !item.enabled } : item
                              )
                            )
                          }
                          className="mt-0.5 rounded border-slate-300 accent-sky-600"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {idx + 1}. {step.screen}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{step.userAction}</div>
                        </div>
                      </label>
                      <div className="font-mono text-[11px] text-sky-800 dark:text-sky-300">
                        {step.method} {step.endpoint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated SRS & API Contract Blueprint */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-300">
                    Generated Output · srs-api-blueprint.json
                  </span>
                  <CopyButton text={srsContractJson} label="Copy Blueprint" />
                </div>
                <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[220px]">
                  {srsContractJson}
                </pre>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 2: ARCHITECT TOPOLOGY BUILDER (REAL REACT FLOW CANVAS)   */}
          {/* ============================================================== */}
          {stage === 2 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Stage 2 · System Architect Drag-and-Drop Topology Builder
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Monolith vs. Microservices Canvas &amp; Smart Validation
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => switchParadigm('monolith')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        paradigm === 'monolith'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Monolithic
                    </button>
                    <button
                      type="button"
                      onClick={() => switchParadigm('microservices')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        paradigm === 'microservices'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Microservices
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStage(3)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                  >
                    Code &amp; Features (Stage 3)
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Infrastructure Node Palette */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Click any component to drop onto the canvas (drag nodes &amp; connect handles freely)
                  </span>
                  <button
                    type="button"
                    onClick={injectDirectDbAntiPattern}
                    className="text-xs font-medium text-rose-700 dark:text-rose-400 hover:underline"
                  >
                    + Test Anti-Pattern (Client -&gt; DB Link)
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {(
                    [
                      { cat: 'edge', title: 'Edge & Routing', icon: Globe },
                      { cat: 'compute', title: 'Compute & Services', icon: Cpu },
                      { cat: 'data', title: 'Data & Messaging', icon: Database },
                    ] as const
                  ).map((grp) => {
                    const Icon = grp.icon;
                    const items = Object.values(INFRA_NODE_CATALOG).filter(
                      (i) => i.category === grp.cat && i.type !== 'web-client'
                    );
                    return (
                      <div
                        key={grp.cat}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5 space-y-2"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Icon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                          {grp.title}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {items.map((item) => (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => addNodeFromPalette(item.type)}
                              className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                              {item.shortLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live React Flow Canvas */}
              <div className="h-[430px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <ReactFlow
                  nodes={rfNodes}
                  edges={rfEdges}
                  nodeTypes={NODE_TYPES}
                  onNodesChange={handleNodesChange}
                  onConnect={handleConnect}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  fitView
                  fitViewOptions={{ padding: 0.16 }}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background gap={18} size={1} />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </div>

              {/* Smart Architecture Validation Engine */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Smart Validation Engine ({validationIssues.length} finding{validationIssues.length === 1 ? '' : 's'})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {validationIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`rounded-lg border p-3 text-xs space-y-1 ${
                        issue.severity === 'error'
                          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
                          : issue.severity === 'warning'
                            ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30'
                            : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                        {issue.severity === 'error' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                        )}
                        <span>{issue.title}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{issue.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 3: CODEBASE, TECH STACK & FEATURE SCAFFOLDING            */}
          {/* ============================================================== */}
          {stage === 3 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Stage 3 · Software Engineering &amp; Feature Scaffolding
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Tech Stack Assignment, Git Strategy &amp; Injectable Feature Modules
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStage(4)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                >
                  Build &amp; Deploy (Stage 4)
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Repo & Branching Orchestration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Repository &amp; Git Orchestration
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['monorepo', 'polyrepo'] as const).map((rm) => (
                      <button
                        key={rm}
                        type="button"
                        onClick={() => setRepoModel(rm)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium capitalize ${
                          repoModel === rm
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rm}
                      </button>
                    ))}
                    {(['trunk-based', 'gitflow'] as const).map((bm) => (
                      <button
                        key={bm}
                        type="button"
                        onClick={() => setBranchModel(bm)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium capitalize ${
                          branchModel === bm
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {bm}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGitFeed((prev) => [
                        `[${repoModel}/${branchModel}] eng-priya opened PR #${420 + prev.length} -> CI lint + unit green`,
                        ...prev.slice(0, 3),
                      ])
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Simulate Engineer Commit &amp; PR
                  </button>
                </div>

                <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-slate-500">Live Multi-Engineer Git Activity</div>
                  {gitFeed.map((line, i) => (
                    <div key={i} className="truncate">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-Node Tech Stack Selector */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Assign Languages &amp; Frameworks per Canvas Node
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {nodes.map((node) => {
                    const spec = INFRA_NODE_CATALOG[node.type];
                    return (
                      <div
                        key={node.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(node.id)}
                          className="text-left min-w-0"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate hover:text-sky-600">
                            {node.label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">{spec.category}</div>
                        </button>
                        <select
                          aria-label={`Select tech stack for ${node.label}`}
                          value={node.techStack}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id ? { ...n, techStack: e.target.value } : n
                              )
                            )
                          }
                          className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-mono text-slate-800 dark:text-slate-200"
                        >
                          {spec.techOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5 Predefined Feature Modules */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Predefined Feature Modules (Enabling auto-scaffolds required services)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FEATURE_MODULES.map((feat) => {
                    const active = enabledFeatures.includes(feat.id);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => toggleFeatureModule(feat.id)}
                        aria-pressed={active}
                        className={`text-left rounded-lg border p-3.5 transition-colors space-y-1.5 ${
                          active
                            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {feat.name}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              active ? 'text-sky-700 dark:text-sky-400' : 'text-slate-400'
                            }`}
                          >
                            {active ? 'INJECTED' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {feat.summary}
                        </p>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {feat.apiContract}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 4: AUTOMATED BUILD & DEPLOYMENT PIPELINE (DEVOPS)        */}
          {/* ============================================================== */}
          {stage === 4 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Stage 4 · DevOps CI/CD Automation &amp; Environment Promotion
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Automated Build Track &amp; Multi-Environment Rollout
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCiStepIdx(0);
                      setCiRunning(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Run CI Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage(5)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                  >
                    Launch Live Traffic (Stage 5)
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* CI Track */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {CI_STAGES.map((st, idx) => {
                  const done = idx < ciStepIdx || (!ciRunning && idx <= ciStepIdx);
                  const active = ciRunning && idx === ciStepIdx;
                  return (
                    <motion.div
                      key={st.id}
                      animate={active && !prefersReducedMotion ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                      transition={{ duration: 0.45 }}
                      className={`rounded-lg border p-3 space-y-1.5 ${
                        done
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : active
                            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{st.label}</div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{st.detail}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Environment Promotion + Rollout Strategy */}
              <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Environment Promotion (Dev -&gt; QA/Staging -&gt; Production)
                  </div>
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    {(
                      [
                        { id: 'rolling', label: 'Rolling Update' },
                        { id: 'blue-green', label: 'Blue-Green' },
                        { id: 'canary', label: 'Canary (ACA)' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRolloutStrategy(r.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                          rolloutStrategy === r.id
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { idx: 0, env: 'DEV', desc: 'Auto-synced immutable digest sha256:81f0b9e · Synthetic fixtures' },
                    { idx: 1, env: 'QA / STAGING', desc: 'E2E Playwright + OWASP ZAP DAST + 2x load test verified' },
                    {
                      idx: 2,
                      env: 'PRODUCTION',
                      desc:
                        rolloutStrategy === 'canary'
                          ? 'Canary progressive ramp 5% -> 25% -> 100% with Prometheus SLO guard'
                          : rolloutStrategy === 'blue-green'
                            ? 'Green stack smoke-tested -> Atomic < 2s Load Balancer cutover'
                            : 'Rolling Update maxSurge=25%, maxUnavailable=0 with /healthz probes',
                    },
                  ].map((item) => {
                    const reached = promotedEnvIdx >= item.idx;
                    return (
                      <button
                        key={item.env}
                        type="button"
                        onClick={() => setPromotedEnvIdx(item.idx)}
                        className={`text-left rounded-lg border p-4 space-y-1.5 transition-colors ${
                          reached
                            ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/25'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{item.env}</span>
                          <span className={reached ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                            {reached ? 'DEPLOYED' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 5: LIVE TRAFFIC, ANIMATED PACKETS & CHAOS SIMULATOR      */}
          {/* ============================================================== */}
          {stage === 5 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Stage 5 · Live Traffic &amp; Discrete-Event Chaos Simulator
                  </div>
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Real-Time Packet Flow, Cache Hit vs. Miss &amp; Fault Injection
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSimPlaying((p) => !p)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-sky-500"
                  >
                    {simPlaying ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
                    {simPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNodes((prev) =>
                        prev.map((n) => ({ ...n, killed: false, latencyInjectedMs: 0, throttled: false }))
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-emerald-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Heal All Nodes
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage(6)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
                  >
                    Mermaid &amp; Export
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Virtual Load Generator Slider + Live Telemetry KPIs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="flight-load-slider" className="font-semibold text-slate-900 dark:text-slate-100">
                      Virtual Load Generator
                    </label>
                    <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                      {trafficRps.toLocaleString()} RPS
                    </span>
                  </div>
                  <input
                    id="flight-load-slider"
                    type="range"
                    min={100}
                    max={50000}
                    step={500}
                    value={trafficRps}
                    onChange={(e) => setTrafficRps(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Normal 1K', val: 1000 },
                      { label: 'Peak 12K', val: 12000 },
                      { label: 'Flash Sale 45K', val: 45000 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setTrafficRps(p.val)}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-sky-500"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono tabular-nums">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                    <div className="text-[11px] text-slate-500">p99 Latency</div>
                    <div className={`text-base font-bold mt-0.5 ${runtimeTelemetry.p99Ms > targetLatencyMs ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {runtimeTelemetry.p99Ms} ms
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                    <div className="text-[11px] text-slate-500">HTTP 5xx</div>
                    <div className={`text-base font-bold mt-0.5 ${runtimeTelemetry.errorRatePct > 1 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {runtimeTelemetry.errorRatePct}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                    <div className="text-[11px] text-slate-500">Redis Hit %</div>
                    <div className="text-base font-bold mt-0.5 text-sky-700 dark:text-sky-400">
                      {runtimeTelemetry.cacheHitPct}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                    <div className="text-[11px] text-slate-500">Circuit / Queue</div>
                    <div className={`text-sm font-bold mt-1 ${runtimeTelemetry.circuitBreakerOpen ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {runtimeTelemetry.circuitBreakerOpen ? 'OPEN' : `Q:${runtimeTelemetry.kafkaQueueDepth}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color-Coded Packet Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span>Packet Legend (Click any node below to inject chaos or inspect):</span>
                <span className="font-mono text-sky-700 dark:text-sky-400">● Blue: Search GET</span>
                <span className="font-mono text-amber-700 dark:text-amber-400">● Amber: Redis Cache Hit (&lt;2ms)</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">● Green: Checkout Write / DB Hydrate</span>
                <span className="font-mono text-rose-700 dark:text-rose-400">● Red: HTTP 500 / Killed Node</span>
              </div>

              {/* Live Animated Packet SVG Mirror of User's Exact Graph */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3 overflow-x-auto">
                <svg viewBox="0 0 900 420" className="w-full min-w-[720px] h-auto max-h-[400px]" role="img" aria-label="Live runtime packet simulation across architecture topology">
                  {/* Edges + Animated Color-Coded Particles */}
                  {edges.map((edge) => {
                    const src = nodes.find((n) => n.id === edge.source);
                    const dst = nodes.find((n) => n.id === edge.target);
                    if (!src || !dst) return null;

                    const sx = src.x + 82;
                    const sy = src.y + 28;
                    const ex = dst.x + 82;
                    const ey = dst.y + 28;
                    const isErrorPath =
                      Boolean(src.killed || dst.killed) || runtimeTelemetry.errorRatePct > 15;

                    const dotColor = isErrorPath
                      ? '#dc2626'
                      : edge.packetKind === 'cache'
                        ? '#d97706'
                        : edge.packetKind === 'checkout'
                          ? '#059669'
                          : '#0284c7';

                    const px = sx + (ex - sx) * packetPhase;
                    const py = sy + (ey - sy) * packetPhase;
                    // Return fast-path dot for Redis cache hits!
                    const rx = ex + (sx - ex) * packetPhase;
                    const ry = ey + (sy - ey) * packetPhase;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke={isErrorPath ? '#ef4444' : '#94a3b8'}
                          strokeWidth={isErrorPath ? 2.2 : 1.5}
                          strokeDasharray={isErrorPath ? '5 4' : undefined}
                        />
                        <circle cx={px} cy={py} r={4.5} fill={dotColor} stroke="#ffffff" strokeWidth={1.3} />
                        {edge.packetKind === 'cache' && !dst.killed && (
                          <circle cx={rx} cy={ry} r={3.5} fill="#d97706" stroke="#ffffff" strokeWidth={1.1} />
                        )}
                      </g>
                    );
                  })}

                  {/* Clickable Live Runtime Nodes */}
                  {nodes.map((node) => {
                    const isSelected = node.id === selectedNodeId;
                    const stroke = node.killed
                      ? '#dc2626'
                      : isSelected
                        ? '#0284c7'
                        : node.latencyInjectedMs || node.throttled
                          ? '#d97706'
                          : '#64748b';
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedNodeId(node.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <rect
                          width={164}
                          height={56}
                          rx={8}
                          className={
                            node.killed
                              ? 'fill-rose-50 dark:fill-rose-950/80'
                              : isSelected
                                ? 'fill-sky-50 dark:fill-sky-950/70'
                                : 'fill-white dark:fill-slate-900'
                          }
                          stroke={stroke}
                          strokeWidth={isSelected || node.killed ? 2.4 : 1.2}
                        />
                        <text x={10} y={20} className="text-[10.5px] font-semibold fill-slate-900 dark:fill-slate-100">
                          {node.label.slice(0, 22)}
                        </text>
                        <text x={10} y={35} className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400">
                          {node.techStack.slice(0, 22)}
                        </text>
                        <text
                          x={10}
                          y={49}
                          className={`text-[9px] font-mono font-semibold ${
                            node.killed
                              ? 'fill-rose-600 dark:fill-rose-400'
                              : node.latencyInjectedMs
                                ? 'fill-amber-700 dark:fill-amber-400'
                                : 'fill-emerald-700 dark:fill-emerald-400'
                          }`}
                        >
                          {node.killed
                            ? 'KILLED (500)'
                            : `x${node.replicas} ${node.latencyInjectedMs ? `+${node.latencyInjectedMs}ms` : 'OK'}`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 6: LIVE MERMAID.JS DIAGRAMS & ARCHITECTURE EXPORT        */}
          {/* ============================================================== */}
          {stage === 6 && (
            <div className="space-y-5">
              <FlightMermaidViewer
                title="Live Auto-Generated Architecture Flowchart (Mermaid.js)"
                subtitle="Directly reflects your canvas nodes, replicas, tech stacks, and chaos state. Click any Mermaid node to open the 4-Tab Inspector."
                mermaidCode={liveTopologyMermaid}
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNodeId={(nid) => setSelectedNodeId(nid)}
              />

              <FlightMermaidViewer
                title="End-to-End Request & Cache Hit/Miss Sequence Diagram (Mermaid.js)"
                subtitle={`Generated for ${activeDomain.name} (${paradigm}) with ${rolloutStrategy} rollout and active feature modules.`}
                mermaidCode={liveSequenceMermaid}
              />
            </div>
          )}
        </div>

        {/* RIGHT ZONE: NON-BLOCKING 4-TAB CLICK-TO-INSPECT DEEP LEARNING DRAWER */}
        {selectedNode && selectedSpec && (
          <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 space-y-4 sticky top-20">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  Click-to-Inspect Engine · {selectedSpec.category.toUpperCase()}
                </div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {selectedNode.label}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedNode.techStack} · Replicas: {selectedNode.replicas}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                aria-label="Close concept inspector"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Direct Chaos & Scaling Controls on Selected Node */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => updateSelectedNode({ killed: !selectedNode.killed })}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  selectedNode.killed
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                <Flame className="w-3 h-3" aria-hidden="true" />
                {selectedNode.killed ? 'Revive Node' : 'Kill Node'}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSelectedNode({
                    latencyInjectedMs: selectedNode.latencyInjectedMs ? 0 : 450,
                  })
                }
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedNode.latencyInjectedMs
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Zap className="w-3 h-3" aria-hidden="true" />
                {selectedNode.latencyInjectedMs ? 'Clear +450ms' : '+450ms Latency'}
              </button>
              <button
                type="button"
                onClick={() => updateSelectedNode({ throttled: !selectedNode.throttled })}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedNode.throttled
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sliders className="w-3 h-3" aria-hidden="true" />
                {selectedNode.throttled ? 'Unthrottle' : 'Throttle Net'}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSelectedNode({ replicas: Math.min(12, selectedNode.replicas + 1) })
                }
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500"
              >
                <Rocket className="w-3 h-3" aria-hidden="true" />
                Scale +1
              </button>
              {selectedNode.type !== 'web-client' && (
                <button
                  type="button"
                  onClick={removeSelectedNode}
                  aria-label="Remove node from topology"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-800 px-2 py-1 text-[11px] text-rose-600 dark:text-rose-400 hover:border-rose-400"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* 4-Tab Inspection Bar */}
            <SegmentedTabBar
              ariaLabel="Node Inspection Tabs"
              activeTab={inspectorTab}
              onChange={setInspectorTab}
              tabs={[
                { id: 'what-why', label: '1. What & Why' },
                { id: 'live-dfd', label: '2. Live DFD' },
                { id: 'algorithms', label: '3. Algorithms' },
                { id: 'handoff', label: '4. Handoff' },
              ]}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedNode.id}-${inspectorTab}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
                className="space-y-3 text-xs leading-relaxed"
              >
                {inspectorTab === 'what-why' && (
                  <>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Plain-English Definition</div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedSpec.whatAndWhy.definition}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Role in Architecture</div>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedSpec.whatAndWhy.role}</p>
                    </div>
                    <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3">
                      <div className="font-semibold text-rose-800 dark:text-rose-300">What Breaks If Removed</div>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">
                        {selectedSpec.whatAndWhy.whatBreaksIfRemoved}
                      </p>
                    </div>
                  </>
                )}

                {inspectorTab === 'live-dfd' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Wire Protocol: {selectedSpec.liveDataDfd.protocol}</span>
                      <span>Base: {selectedSpec.baseLatencyMs}ms</span>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
                        <span className="text-[11px] font-mono text-slate-300">Live Payload / Wire Frame</span>
                        <CopyButton text={selectedSpec.liveDataDfd.samplePayload} label="Copy" />
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        {selectedSpec.liveDataDfd.samplePayload}
                      </pre>
                    </div>
                  </div>
                )}

                {inspectorTab === 'algorithms' && (
                  <div className="space-y-2.5">
                    <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/25 p-3 space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedSpec.algorithm.name}
                      </div>
                      <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
                        Complexity: {selectedSpec.algorithm.complexity}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 pt-1">
                        {selectedSpec.algorithm.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {inspectorTab === 'handoff' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                      <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      <span>Primary Owner: {selectedSpec.teamHandoff.owner}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedSpec.teamHandoff.handoffChain}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </aside>
        )}
      </div>
    </section>
  );
};

export const FlightSimulatorStudio = withStudioBoundary(FlightSimulatorStudioInner, {
  studioName: 'SDLC & System Architecture Flight Simulator',
});
