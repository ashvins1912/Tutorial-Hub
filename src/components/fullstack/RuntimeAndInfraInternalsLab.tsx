import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  INFRA_CATEGORY_META,
  SYSTEM_INTERNAL_BLUEPRINTS,
  type ArchDfdEdge,
  type ArchDfdNode,
  type ArchDfdStep,
  type InfraCategory,
  type InfraSimKind,
  type SystemInternalBlueprint,
} from '../../data/runtimeAndInfraInternalsData';
import {
  buildBlueprintMermaidDfd,
  INFRA_ALGO_DEEP_SPECS,
} from '../../data/fullStackDeepEnrichmentData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton, SegmentedTabBar } from '../ui';

/* ============================================================================
   ANIMATED 5-STAGE ARCHITECTURE DFD ENGINE
   ============================================================================ */

interface ArchDfdStageProps {
  title: string;
  subtitle: string;
  nodes: ArchDfdNode[];
  edges: ArchDfdEdge[];
  steps: ArchDfdStep[];
  resetKey: string;
}

function ArchDfdStage({
  title,
  subtitle,
  nodes,
  edges,
  steps,
  resetKey,
}: ArchDfdStageProps) {
  const markerPrefix = useId().replace(/:/g, '');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [packetT, setPacketT] = useState(0.5);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
    setPacketT(0.5);
  }, [resetKey]);

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (reducedMotion) {
      setPacketT(0.55);
      const timer = window.setInterval(() => {
        setStepIdx((prev) => (prev + 1) % steps.length);
      }, 2600);
      return () => window.clearInterval(timer);
    }

    lastTimeRef.current = performance.now();
    let localT = 0;
    const duration = 2300;
    const tick = (now: number) => {
      const dt = Math.min(80, now - lastTimeRef.current);
      lastTimeRef.current = now;
      localT += dt / duration;
      if (localT >= 1) {
        localT = 0;
        setStepIdx((prev) => (prev + 1) % steps.length);
      }
      setPacketT(localT);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, reducedMotion, steps.length]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, ArchDfdNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const currentStep = steps[stepIdx] ?? steps[0];
  const activeNodes = new Set(currentStep?.activeNodeIds ?? []);
  const activeEdges = new Set(currentStep?.activeEdgeIds ?? []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Internal Architecture Data Flow Pipeline
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play Pipeline'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => (prev - 1 + steps.length) % steps.length);
              setPacketT(0.55);
            }}
            aria-label="Previous pipeline step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
            {stepIdx + 1}/{steps.length}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => (prev + 1) % steps.length);
              setPacketT(0.55);
            }}
            aria-label="Next pipeline step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
              setPacketT(0.5);
            }}
            aria-label="Reset pipeline"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 680 226"
            className="w-full min-w-[560px] h-auto max-h-[245px]"
            role="img"
            aria-label={`Internal architecture diagram for ${title}`}
          >
            <defs>
              <marker
                id={`${markerPrefix}-idle`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
              </marker>
              <marker
                id={`${markerPrefix}-active`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;
              const x1 = from.x + ux * 58;
              const y1 = from.y + uy * 25;
              const x2 = to.x - ux * 62;
              const y2 = to.y - uy * 25;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2 - 11;
              const isActive = activeEdges.has(edge.id);
              const px = x1 + (x2 - x1) * packetT;
              const py = y1 + (y2 - y1) * packetT;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={isActive ? 2.5 : 1.4}
                    strokeDasharray={isActive ? undefined : '4 4'}
                    markerEnd={`url(#${markerPrefix}-${isActive ? 'active' : 'idle'})`}
                    className={
                      isActive
                        ? 'stroke-sky-600 dark:stroke-sky-400'
                        : 'stroke-slate-300 dark:stroke-slate-700'
                    }
                  />
                  <rect
                    x={midX - 42}
                    y={midY - 8}
                    width={84}
                    height={15}
                    rx={4}
                    strokeWidth={1}
                    className={
                      isActive
                        ? 'fill-sky-50 dark:fill-sky-950/90 stroke-sky-300 dark:stroke-sky-700'
                        : 'fill-white/95 dark:fill-slate-900/95 stroke-slate-200 dark:stroke-slate-800'
                    }
                  />
                  <text
                    x={midX}
                    y={midY + 2.5}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[8.5px] font-mono font-semibold fill-sky-800 dark:fill-sky-300'
                        : 'text-[8.5px] font-mono fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {edge.label}
                  </text>
                  {isActive && (
                    <g>
                      <circle
                        cx={px}
                        cy={py}
                        r={5.5}
                        className="fill-sky-600 dark:fill-sky-400 stroke-white dark:stroke-slate-950"
                        strokeWidth={2}
                      />
                      <g transform={`translate(${px}, ${py - 14})`}>
                        <rect
                          x={-44}
                          y={-8.5}
                          width={88}
                          height={15}
                          rx={4}
                          className="fill-slate-900 dark:fill-sky-500"
                        />
                        <text
                          x={0}
                          y={2}
                          textAnchor="middle"
                          className="text-[8px] font-mono font-bold fill-white dark:fill-slate-950"
                        >
                          {currentStep.packetLabel.slice(0, 16)}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}

            {nodes.map((node) => {
              const isActive = activeNodes.has(node.id);
              const w = 122;
              const h = 52;
              return (
                <g key={node.id} transform={`translate(${node.x - w / 2}, ${node.y - h / 2})`}>
                  <rect
                    width={w}
                    height={h}
                    rx={9}
                    strokeWidth={isActive ? 2 : 1.2}
                    className={
                      isActive
                        ? 'fill-sky-50 dark:fill-sky-950/75 stroke-sky-600 dark:stroke-sky-400'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                    }
                  />
                  <text
                    x={w / 2}
                    y={22}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[10.5px] font-bold fill-slate-900 dark:fill-white'
                        : 'text-[10.5px] font-semibold fill-slate-800 dark:fill-slate-200'
                    }
                  >
                    {node.label}
                  </text>
                  <text
                    x={w / 2}
                    y={39}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[9px] font-mono fill-sky-700 dark:fill-sky-300'
                        : 'text-[9px] font-mono fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {currentStep && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Stage {currentStep.step}. {currentStep.title}
              </div>
              <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                Active Signal: {currentStep.packetLabel}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-5">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  Simple English
                </div>
                <p className="text-slate-700 dark:text-slate-300">{currentStep.plainEnglish}</p>
              </div>
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
                <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mb-1">
                  Internal Mechanism &amp; Memory
                </div>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {currentStep.technicalDetail}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(idx);
                setPacketT(0.55);
              }}
              className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                idx === stepIdx
                  ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400">
                Stage 0{s.step}
              </div>
              <div className="text-xs font-medium truncate">{s.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   LIVE INTERACTIVE ALGORITHM SIMULATORS (TAILORED TO EACH ARCHITECTURE)
   ============================================================================ */

function InteractiveAlgoSimulator({
  simKind,
  blueprintTitle,
}: {
  simKind: InfraSimKind;
  blueprintTitle: string;
}) {
  // 1. Compiler / JIT Tiered Execution Simulator
  const [invocations, setInvocations] = useState<number>(2);
  const [deoptCount, setDeoptCount] = useState<number>(0);
  const [jitTrace, setJitTrace] = useState<string>(
    'Function starts cold in Bytecode Interpreter. Invoke it repeatedly to cross Tier-1 Quickening (20 calls) and Tier-2 Native JIT (100 calls) thresholds!'
  );

  // 2. Load Balancer & Radix Router Simulator
  const [lbStrategy, setLbStrategy] = useState<'p2c' | 'swrr' | 'consistent'>('p2c');
  const [lbNodes, setLbNodes] = useState([
    { id: 'srv-1', weight: 3, active: 2, served: 4, healthy: true },
    { id: 'srv-2', weight: 2, active: 5, served: 3, healthy: true },
    { id: 'srv-3', weight: 1, active: 1, served: 2, healthy: true },
  ]);
  const [lbRoutePath, setLbRoutePath] = useState<string>('/api/v2/orders/482');
  const [lbTrace, setLbTrace] = useState<string>(
    'Pick a balancing algorithm, send requests, or kill a backend node to watch live failover & Radix Trie O(k) path matching.'
  );

  // 3. API Gateway Token Bucket + Auth JWT Simulator
  const [tokens, setTokens] = useState<number>(6);
  const [bucketCap] = useState<number>(6);
  const [jwtValid, setJwtValid] = useState<boolean>(true);
  const [gwStats, setGwStats] = useState({ allowed: 0, rateLimited: 0, unauthorized: 0 });
  const [gwTrace, setGwTrace] = useState<string>(
    'Token Bucket starts full (6/6) with valid EdDSA JWT signature. Burst requests to trigger HTTP 429 or tamper JWT to trigger HTTP 401.'
  );

  // 4. DNS & CDN Edge Cache Simulator
  const [edgeWarm, setEdgeWarm] = useState<boolean>(false);
  const [dnsWarm, setDnsWarm] = useState<boolean>(false);
  const [edgeCoalesced, setEdgeCoalesced] = useState<number>(0);
  const [dnsLatencyMs, setDnsLatencyMs] = useState<number>(0);
  const [dnsTrace, setDnsTrace] = useState<string>(
    'Cold cache state: First resolution walks Root -> TLD -> Authoritative (~48ms) & Edge misses to Origin Shield (~135ms). Run it twice to see Edge HIT!'
  );

  // 5. LLM PagedAttention KV-Cache Simulator
  const [kvBlocks, setKvBlocks] = useState<(string | null)[]>([
    'SYS',
    'SYS',
    'U1',
    'U1',
    'U2',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [nextReqNum, setNextReqNum] = useState<number>(3);
  const [llmTrace, setLlmTrace] = useState<string>(
    'Blocks [0..1] store shared System Prompt (Copy-on-Write). U1 and U2 share scattered non-contiguous VRAM blocks with zero fragmentation!'
  );

  // 6. Kafka Partition Log & Worker Lease Simulator
  const [partitions, setPartitions] = useState<string[][]>([
    ['ord#1', 'ord#4'],
    ['ord#2'],
    ['ord#3', 'ord#5'],
  ]);
  const [offsets, setOffsets] = useState<number[]>([1, 1, 1]);
  const [eventSeq, setEventSeq] = useState<number>(6);
  const [kafkaTrace, setKafkaTrace] = useState<string>(
    'Producers hash keys to Partitions [0..2] with O(1) append. Consumers commit their own offset bookmarks independently.'
  );

  // 7. Database LSM MemTable -> SSTable + Bloom Filter Simulator
  const [memTable, setMemTable] = useState<string[]>(['k_104', 'k_209']);
  const [sstables, setSstables] = useState<string[][]>([['k_011', 'k_042', 'k_088']]);
  const [dbKeyInput, setDbKeyInput] = useState<string>('k_315');
  const [dbTrace, setDbTrace] = useState<string>(
    'Writes append to WAL + RAM MemTable in O(1). Flush creates immutable sorted SSTables; Reads check Bloom Filters to skip disk I/O!'
  );

  // --- Handlers ---
  const jitTier =
    invocations >= 100
      ? { label: 'Tier 2: Optimizing Native JIT (C2 / TurboFan)', latencyNs: 14, tierNum: 2 }
      : invocations >= 20
      ? { label: 'Tier 1: Quickened / Baseline JIT (C1 / Sparkplug)', latencyNs: 165, tierNum: 1 }
      : { label: 'Tier 0: Bytecode Interpreter (Profiling)', latencyNs: 1240, tierNum: 0 };

  const handleJitInvoke = (count: number) => {
    const next = invocations + count;
    setInvocations(next);
    if (next >= 100 && invocations < 100) {
      setJitTrace(
        `PROMOTED TO TIER 2 NATIVE JIT at ${next} calls! SSA Inlining + Escape Analysis compiled loop to raw CPU instructions (~14ns/call, 88x faster).`
      );
    } else if (next >= 20 && invocations < 20) {
      setJitTrace(
        `PROMOTED TO TIER 1 QUICKENING at ${next} calls! Monomorphic Inline Cache locked object shape (~165ns/call).`
      );
    } else {
      setJitTrace(`Executed ${count}x (total ${next} calls) inside ${jitTier.label}.`);
    }
  };

  const handleJitDeopt = () => {
    setInvocations(5);
    setDeoptCount((d) => d + 1);
    setJitTrace(
      'DEOPTIMIZATION BAILOUT! Unexpected object shape/subclass broke the JIT type guard -> runtime safely reconstructed stack frame back in Bytecode Interpreter.'
    );
  };

  const handleLbSend = (burst: number) => {
    const nextNodes = lbNodes.map((n) => ({ ...n }));
    const healthy = nextNodes.filter((n) => n.healthy);
    if (healthy.length === 0) {
      setLbTrace('HTTP 503: All backends unhealthy! Re-enable at least one backend node.');
      return;
    }

    const pickedIds: string[] = [];
    for (let i = 0; i < burst; i++) {
      let chosen = healthy[0];
      if (lbStrategy === 'p2c') {
        const a = healthy[Math.floor(Math.random() * healthy.length)];
        const b = healthy[Math.floor(Math.random() * healthy.length)];
        chosen = a.active <= b.active ? a : b;
      } else if (lbStrategy === 'swrr') {
        chosen = healthy.reduce((best, cur) =>
          cur.served / cur.weight < best.served / best.weight ? cur : best
        );
      } else {
        let h = 0;
        for (let c = 0; c < lbRoutePath.length; c++) h = (h * 31 + lbRoutePath.charCodeAt(c)) >>> 0;
        chosen = healthy[h % healthy.length];
      }
      chosen.served += 1;
      chosen.active = Math.min(12, chosen.active + 1);
      pickedIds.push(chosen.id);
    }

    // Decay a bit of active inflight load to simulate completion
    nextNodes.forEach((n) => {
      if (n.healthy && n.active > 1) n.active = Math.max(1, n.active - Math.floor(burst / 2));
    });
    setLbNodes(nextNodes);
    const segments = lbRoutePath.split('/').filter(Boolean);
    setLbTrace(
      `Radix Trie matched ${segments.length} segments (${lbRoutePath}) in O(k) -> ${lbStrategy.toUpperCase()} routed ${burst} req(s) to [${pickedIds.join(', ')}].`
    );
  };

  const handleGwRequest = (count: number) => {
    let rem = tokens;
    let ok = 0;
    let rl = 0;
    let unauth = 0;
    for (let i = 0; i < count; i++) {
      if (!jwtValid) {
        unauth++;
      } else if (rem > 0) {
        rem--;
        ok++;
      } else {
        rl++;
      }
    }
    setTokens(rem);
    setGwStats((s) => ({
      allowed: s.allowed + ok,
      rateLimited: s.rateLimited + rl,
      unauthorized: s.unauthorized + unauth,
    }));
    if (!jwtValid) {
      setGwTrace(`HTTP 401 Unauthorized (${unauth}x): Local JWKS EdDSA signature verification rejected tampered JWT before hitting backend!`);
    } else if (rl > 0) {
      setGwTrace(`Allowed ${ok}, REJECTED ${rl} with HTTP 429 Too Many Requests! Token Bucket empty (0/${bucketCap}). Click Refill Tick.`);
    } else {
      setGwTrace(`HTTP 200 OK (${ok}x): JWT verified locally in 50us + Token Bucket deducted -> ${rem}/${bucketCap} tokens left.`);
    }
  };

  const handleDnsCdnResolve = (concurrentClients: number) => {
    const dnsMs = dnsWarm ? 2 : 48;
    const edgeMs = edgeWarm ? 8 : 135;
    const total = dnsMs + edgeMs;
    setDnsLatencyMs(total);
    if (!edgeWarm && concurrentClients > 1) {
      setEdgeCoalesced(concurrentClients - 1);
    } else {
      setEdgeCoalesced(0);
    }
    setDnsTrace(
      `${dnsWarm ? 'DNS Cache HIT (2ms)' : 'DNS Cold Walk Root->TLD->Auth (48ms)'} + ${
        edgeWarm
          ? 'CDN Edge PoP L1 HIT (8ms, Origin untouched!)'
          : `CDN MISS -> Collapsed ${concurrentClients} client(s) into 1 Origin Shield fetch (135ms), warming L1 cache!`
      } Total = ${total}ms.`
    );
    setDnsWarm(true);
    setEdgeWarm(true);
  };

  const handleLlmAddPrompt = () => {
    const freeIndices = kvBlocks
      .map((b, i) => (b === null ? i : -1))
      .filter((i) => i >= 0);
    if (freeIndices.length < 2) {
      setLlmTrace('GPU HBM VRAM Full! Click "Step Decode & Evict" to finish a sequence and free physical KV blocks.');
      return;
    }
    const tag = `U${nextReqNum}`;
    const next = [...kvBlocks];
    next[freeIndices[0]] = tag;
    next[freeIndices[1]] = tag;
    setKvBlocks(next);
    setNextReqNum((n) => n + 1);
    setLlmTrace(
      `PagedAttention allocated non-contiguous physical VRAM blocks [${freeIndices[0]}, ${freeIndices[1]}] for ${tag} while sharing [0, 1] SYS prompt!`
    );
  };

  const handleLlmStepEvict = () => {
    const userTag = kvBlocks.find((b) => b !== null && b !== 'SYS');
    if (!userTag) {
      setLlmTrace('Only shared SYS prompt blocks remain in VRAM. Click "Add Prompt" to schedule a new request.');
      return;
    }
    const next = kvBlocks.map((b) => (b === userTag ? null : b));
    setKvBlocks(next);
    setLlmTrace(
      `Continuous Batching: ${userTag} emitted <EOS>, immediately freeing its scattered KV blocks for waiting requests on the very next GPU tick!`
    );
  };

  const handleKafkaProduce = (count: number) => {
    const next = partitions.map((p) => [...p]);
    let seq = eventSeq;
    const targets: number[] = [];
    for (let i = 0; i < count; i++) {
      const pIdx = seq % next.length;
      next[pIdx].push(`ord#${seq}`);
      targets.push(pIdx);
      seq++;
    }
    setPartitions(next);
    setEventSeq(seq);
    setKafkaTrace(
      `Appended ${count} event(s) sequentially to Partition(s) [${targets.join(', ')}] + replicated to ISR High-Watermark in O(1).`
    );
  };

  const handleKafkaConsume = () => {
    let consumed = 0;
    const nextOffsets = offsets.map((off, idx) => {
      if (off < partitions[idx].length) {
        consumed++;
        return off + 1;
      }
      return off;
    });
    setOffsets(nextOffsets);
    setKafkaTrace(
      consumed > 0
        ? `Consumer Group pulled ${consumed} record(s) via zero-copy sendfile() and committed offsets [${nextOffsets.join(', ')}].`
        : 'Consumer Lag = 0 across all partitions! Produce more events to simulate streaming backlog.'
    );
  };

  const handleDbWrite = () => {
    const k = dbKeyInput.trim() || `k_${Math.floor(Math.random() * 900 + 100)}`;
    const nextMem = Array.from(new Set([...memTable, k])).sort();
    setMemTable(nextMem);
    setDbKeyInput(`k_${Math.floor(Math.random() * 900 + 100)}`);
    setDbTrace(`O(1) WAL fsync + SkipList MemTable insert("${k}"). RAM MemTable now holds ${nextMem.length} sorted keys.`);
  };

  const handleDbFlush = () => {
    if (memTable.length === 0) {
      setDbTrace('MemTable is empty! Write keys first before flushing to an immutable SSTable.');
      return;
    }
    setSstables((prev) => [memTable, ...prev]);
    setMemTable([]);
    setDbTrace(
      `Flushed sorted MemTable (${memTable.length} keys) into immutable SSTable L0 + built Bloom Filter bitset in sequential disk I/O.`
    );
  };

  const handleDbRead = () => {
    const k = dbKeyInput.trim();
    if (!k) return;
    if (memTable.includes(k)) {
      setDbTrace(`READ HIT in RAM MemTable for "${k}" (0 disk seeks!).`);
      return;
    }
    let skipped = 0;
    for (let i = 0; i < sstables.length; i++) {
      if (sstables[i].includes(k)) {
        setDbTrace(
          `READ HIT in SSTable #${i} for "${k}"! Bloom Filter skipped ${skipped} irrelevant SSTable(s) before binary-searching block.`
        );
        return;
      }
      skipped++;
    }
    setDbTrace(
      `KEY NOT FOUND ("${k}"): Bloom Filters rejected all ${skipped} SSTable file(s) in RAM -> 0 unnecessary SSD disk reads!`
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Interactive Core Algorithm Sandbox
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Experiment With the Live Algorithm Inside {blueprintTitle}
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Hands-On Simulation
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. COMPILER / VM TIERED JIT SIMULATOR */}
        {simKind === 'compiler-jit' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleJitInvoke(5)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Zap className="w-3.5 h-3.5" />
                Invoke Function +5x
              </button>
              <button
                type="button"
                onClick={() => handleJitInvoke(45)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Activity className="w-3.5 h-3.5" />
                Hot Loop +45x
              </button>
              <button
                type="button"
                onClick={handleJitDeopt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Inject New Shape (Deopt)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvocations(2);
                  setDeoptCount(0);
                  setJitTrace('Reset profiling counter to cold bytecode interpretation.');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { num: 0, name: 'Tier 0: Bytecode Interpreter', thresh: '0–19 calls', speed: '~1,240 ns/op' },
                { num: 1, name: 'Tier 1: Quickened / Baseline JIT', thresh: '20–99 calls', speed: '~165 ns/op' },
                { num: 2, name: 'Tier 2: Optimizing SSA Native JIT', thresh: '100+ calls', speed: '~14 ns/op (88x)' },
              ].map((t) => {
                const active = jitTier.tierNum === t.num;
                return (
                  <div
                    key={t.num}
                    className={`rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{t.name}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      <span>{t.thresh}</span>
                      <span className="font-bold text-sky-700 dark:text-sky-400">{t.speed}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              <span>Invocations: <strong>{invocations}</strong></span>
              <span>Current Latency: <strong>{jitTier.latencyNs} ns</strong></span>
              <span>Deoptimizations: <strong>{deoptCount}</strong></span>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {jitTrace}
            </p>
          </>
        )}

        {/* 2. LOAD BALANCER & RADIX ROUTER SIMULATOR */}
        {simKind === 'load-balancer-router' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedTabBar<'p2c' | 'swrr' | 'consistent'>
                ariaLabel="Load balancing algorithm"
                activeTab={lbStrategy}
                onChange={setLbStrategy}
                size="xs"
                tabs={[
                  { id: 'p2c', label: 'Power of 2 Choices' },
                  { id: 'swrr', label: 'Smooth Weighted RR' },
                  { id: 'consistent', label: 'Consistent Hash' },
                ]}
              />
              <input
                type="text"
                value={lbRoutePath}
                onChange={(e) => setLbRoutePath(e.target.value)}
                aria-label="Route path for Radix Trie"
                className="w-44 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => handleLbSend(1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Send 1 Req
              </button>
              <button
                type="button"
                onClick={() => handleLbSend(6)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Burst 6x
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {lbNodes.map((n, idx) => (
                <div
                  key={n.id}
                  className={`rounded-lg border p-3 space-y-2 ${
                    n.healthy
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
                      : 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {n.id} (w={n.weight})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setLbNodes((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, healthy: !item.healthy, active: item.healthy ? 0 : 1 } : item
                          )
                        )
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        n.healthy
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {n.healthy ? 'HEALTHY (Kill)' : 'EJECTED (Revive)'}
                    </button>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    <span>In-flight: {n.active}</span>
                    <span>Served: {n.served}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={n.healthy ? 'h-full bg-sky-600 dark:bg-sky-400' : 'h-full bg-rose-500'}
                      style={{ width: `${Math.min(100, n.served * 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {lbTrace}
            </p>
          </>
        )}

        {/* 3. API GATEWAY TOKEN BUCKET + JWT VERIFY SIMULATOR */}
        {simKind === 'rate-auth-gateway' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleGwRequest(1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Send API Call
              </button>
              <button
                type="button"
                onClick={() => handleGwRequest(4)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Burst 4x Calls
              </button>
              <button
                type="button"
                onClick={() => {
                  setTokens((t) => Math.min(bucketCap, t + 3));
                  setGwTrace(`Token Bucket refilled +3 tokens -> ${Math.min(bucketCap, tokens + 3)}/${bucketCap} ready.`);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refill +3 Tokens
              </button>
              <button
                type="button"
                onClick={() => setJwtValid((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  jwtValid
                    ? 'bg-slate-900 dark:bg-slate-700 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                JWT Signature: {jwtValid ? 'VALID (Tamper)' : 'TAMPERED (Restore)'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  Token Bucket Capacity ({tokens}/{bucketCap} remaining)
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: bucketCap }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 flex-1 rounded-md border flex items-center justify-center text-[10px] font-mono font-bold ${
                        i < tokens
                          ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {i < tokens ? 'TOK' : '—'}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                  <div className="text-[10px] text-slate-500">200 OK</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{gwStats.allowed}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                  <div className="text-[10px] text-slate-500">429 LIMIT</div>
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400">{gwStats.rateLimited}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                  <div className="text-[10px] text-slate-500">401 AUTH</div>
                  <div className="text-base font-bold text-rose-600 dark:text-rose-400">{gwStats.unauthorized}</div>
                </div>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {gwTrace}
            </p>
          </>
        )}

        {/* 4. DNS & CDN EDGE CACHE SIMULATOR */}
        {simKind === 'dns-cdn-edge' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDnsCdnResolve(1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Resolve &amp; Fetch (1 User)
              </button>
              <button
                type="button"
                onClick={() => handleDnsCdnResolve(500)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Viral Spike (500 Concurrent Users)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDnsWarm(false);
                  setEdgeWarm(false);
                  setEdgeCoalesced(0);
                  setDnsLatencyMs(0);
                  setDnsTrace('Purged DNS TTL + Surrogate-Key Edge Cache! Next request will trace a full Cold Miss.');
                }}
                className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Purge TTL &amp; Edge Cache
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono tabular-nums">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">DNS Resolver</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {dnsWarm ? 'WARM (2ms)' : 'COLD (48ms)'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">CDN Edge L1</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {edgeWarm ? 'HIT (8ms)' : 'MISS (135ms)'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">Coalesced Reqs</div>
                <div className="font-bold text-sky-700 dark:text-sky-400 mt-0.5">{edgeCoalesced}</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">Last Total RTT</div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {dnsLatencyMs > 0 ? `${dnsLatencyMs} ms` : '—'}
                </div>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {dnsTrace}
            </p>
          </>
        )}

        {/* 5. LLM PAGEDATTENTION KV-CACHE SIMULATOR */}
        {simKind === 'llm-paged-kv' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLlmAddPrompt}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule Prompt (+2 KV Blocks)
              </button>
              <button
                type="button"
                onClick={handleLlmStepEvict}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Emit &lt;EOS&gt; &amp; Reclaim Blocks
              </button>
              <span className="ml-auto text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                VRAM Used: {kvBlocks.filter(Boolean).length}/{kvBlocks.length} Physical Pages
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {kvBlocks.map((owner, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-2 text-center font-mono ${
                    owner === 'SYS'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60'
                      : owner
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">PG[{idx}]</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {owner ?? 'FREE'}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {llmTrace}
            </p>
          </>
        )}

        {/* 6. KAFKA PARTITION LOG & WORKER QUEUE SIMULATOR */}
        {simKind === 'kafka-worker-log' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleKafkaProduce(1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Produce Event (+1)
              </button>
              <button
                type="button"
                onClick={() => handleKafkaProduce(3)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Produce Batch (+3)
              </button>
              <button
                type="button"
                onClick={handleKafkaConsume}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white"
              >
                Consume &amp; Commit Offsets
              </button>
              <span className="ml-auto text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                Total Lag:{' '}
                <strong>
                  {partitions.reduce((sum, p, i) => sum + Math.max(0, p.length - offsets[i]), 0)}
                </strong>
              </span>
            </div>

            <div className="space-y-2">
              {partitions.map((records, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 flex flex-wrap items-center gap-2"
                >
                  <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 w-24 shrink-0">
                    Partition {pIdx}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {records.map((rec, rIdx) => {
                      const committed = rIdx < offsets[pIdx];
                      return (
                        <span
                          key={`${pIdx}-${rIdx}`}
                          className={`px-2 py-1 rounded border text-[11px] font-mono ${
                            committed
                              ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-500'
                              : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                          }`}
                        >
                          [{rIdx}] {rec}
                        </span>
                      );
                    })}
                  </div>
                  <span className="ml-auto text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    offset={offsets[pIdx]} · lag={Math.max(0, records.length - offsets[pIdx])}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {kafkaTrace}
            </p>
          </>
        )}

        {/* 7. DATABASE LSM MEMTABLE -> SSTABLE + BLOOM FILTER SIMULATOR */}
        {simKind === 'db-btree-lsm' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={dbKeyInput}
                onChange={(e) => setDbKeyInput(e.target.value)}
                aria-label="Database key"
                className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleDbWrite}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                WAL + Write MemTable
              </button>
              <button
                type="button"
                onClick={handleDbFlush}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Flush -&gt; SSTable
              </button>
              <button
                type="button"
                onClick={handleDbRead}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white"
              >
                <Search className="w-3.5 h-3.5" />
                Read (Bloom Check)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  RAM MemTable (Sorted SkipList)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {memTable.length === 0 ? (
                    <span className="text-xs font-mono text-slate-400">(empty)</span>
                  ) : (
                    memTable.map((k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded border border-emerald-400 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-mono"
                      >
                        {k}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-2">
                <div className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                  Disk Immutable SSTables ({sstables.length}) + Bloom Filters
                </div>
                <div className="space-y-1.5">
                  {sstables.map((tbl, i) => (
                    <div
                      key={i}
                      className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5"
                    >
                      SSTable L{i}: [{tbl.join(', ')}]
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {dbTrace}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT: RUNTIME & INFRASTRUCTURE INTERNALS LAB
   ============================================================================ */

export function RuntimeAndInfraInternalsLab() {
  const [category, setCategory] = useState<'all' | InfraCategory>('all');
  const [selectedId, setSelectedId] = useState<string>(SYSTEM_INTERNAL_BLUEPRINTS[0].id);

  const visibleBlueprints = useMemo(
    () =>
      category === 'all'
        ? SYSTEM_INTERNAL_BLUEPRINTS
        : SYSTEM_INTERNAL_BLUEPRINTS.filter((b) => b.category === category),
    [category]
  );

  const activeBlueprint: SystemInternalBlueprint =
    visibleBlueprints.find((b) => b.id === selectedId) ?? visibleBlueprints[0];

  useEffect(() => {
    if (!visibleBlueprints.some((b) => b.id === selectedId) && visibleBlueprints[0]) {
      setSelectedId(visibleBlueprints[0].id);
    }
  }, [visibleBlueprints, selectedId]);

  return (
    <div className="space-y-6">
      {/* Category Filter Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              16 End-to-End Internal Architectures &amp; Core Algorithms
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              Compilers, VMs &amp; Complete Infrastructure Internals Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Inspect the exact internal pipelines, data structures, and algorithms powering JVM, CPython, V8, LLVM, Web/App Servers, Load Balancers, Dynamic Routers, Auth/IdPs, API Gateways, DNS, CDN, LLM Engines, Kafka, Databases, and Worker Nodes.
            </p>
          </div>
        </div>

        <SegmentedTabBar<'all' | InfraCategory>
          ariaLabel="Filter internal architectures by layer"
          activeTab={category}
          onChange={setCategory}
          wrap
          tabs={INFRA_CATEGORY_META.map((c) => ({
            id: c.id,
            label: c.label,
            count:
              c.id === 'all'
                ? SYSTEM_INTERNAL_BLUEPRINTS.length
                : SYSTEM_INTERNAL_BLUEPRINTS.filter((b) => b.category === c.id).length,
          }))}
        />

        {/* Architecture Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {visibleBlueprints.map((bp) => {
            const active = bp.id === activeBlueprint.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => setSelectedId(bp.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {bp.shortTitle}
                </div>
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 truncate mt-0.5">
                  {bp.examples}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {bp.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Blueprint Overview */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Production Systems: {activeBlueprint.examples}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {activeBlueprint.title}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <BookOpen className="w-3.5 h-3.5" />
              In Simple English
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeBlueprint.simpleEnglish}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
              Engineering Architecture Definition
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeBlueprint.standardDefinition}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Internal Data Structures Used Under the Hood
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeBlueprint.internalDataStructures}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Real-World Bottleneck &amp; Production Mitigation
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeBlueprint.bottleneckAndMitigation}
            </p>
          </div>
        </div>
      </section>

      {/* Animated 5-Stage Internal DFD */}
      <ArchDfdStage
        title={activeBlueprint.shortTitle}
        subtitle="Play or step through each internal component to see how bytes, tasks, and pointers flow."
        nodes={activeBlueprint.dfdNodes}
        edges={activeBlueprint.dfdEdges}
        steps={activeBlueprint.dfdSteps}
        resetKey={activeBlueprint.id}
      />

      {/* Interactive Algorithm Sandbox */}
      <InteractiveAlgoSimulator
        simKind={activeBlueprint.simKind}
        blueprintTitle={activeBlueprint.shortTitle}
      />

      {/* Core Algorithms Breakdown */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Algorithms Powering {activeBlueprint.shortTitle}
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {activeBlueprint.algorithms.map((algo) => (
            <div
              key={algo.name}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 space-y-2.5"
            >
              <div>
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                  {algo.whereUsed}
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {algo.name}
                </h5>
                <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  Complexity: {algo.complexity}
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                {algo.plainEnglish}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-5">
                <strong className="text-slate-800 dark:text-slate-200">Why chosen: </strong>
                {algo.whyChosen}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Algorithm Formal Definition, Executable Code & Implementation Walkthrough */}
      {(() => {
        const algoSpec = INFRA_ALGO_DEEP_SPECS[activeBlueprint.id];
        const blueprintMermaid = buildBlueprintMermaidDfd(activeBlueprint);
        return (
          <>
            {algoSpec && (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                      Algorithm Formal Definition &amp; Production Implementation
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      {algoSpec.algorithmName}
                    </h4>
                  </div>
                  <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 shrink-0">
                    {algoSpec.complexityNote}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  <strong className="text-slate-900 dark:text-slate-100">Formal Definition: </strong>
                  {algoSpec.formalDefinition}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900">
                      <span className="text-[11px] font-mono text-slate-300">
                        Reference Implementation ({algoSpec.language})
                      </span>
                      <CopyButton text={algoSpec.code} label="Copy Code" copiedLabel="Copied" size="xs" />
                    </div>
                    <pre className="p-3.5 text-xs font-mono text-sky-200 leading-5 overflow-x-auto">
                      {algoSpec.code}
                    </pre>
                  </div>

                  <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Step-by-Step Deep Implementation Mechanics
                    </div>
                    <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-5 list-decimal list-inside">
                      {algoSpec.implementationSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            )}

            {/* Rendered Mermaid.js Architecture & Data Flow Diagram */}
            <FlightMermaidViewer
              title={`${activeBlueprint.shortTitle} — Architecture & Data Flow Diagram (Mermaid.js)`}
              subtitle="Live rendered architectural flow showing internal module handoffs, control paths, and data channels. Toggle Live Traffic Flow inside the viewer or use the interactive simulator below."
              mermaidCode={blueprintMermaid}
              trafficDomain="system-design"
              compact
            />

            {/* Synchronized Live Traffic Packet Visualization for this Component */}
            <LiveTrafficFlowSimulator
              mermaidCode={blueprintMermaid}
              mermaidTitle={`${activeBlueprint.shortTitle} Live Internal Data Flow`}
              domain="system-design"
              compact
              heading={`Live Traffic & Packet Flow Simulation — ${activeBlueprint.shortTitle}`}
            />
          </>
        );
      })()}
    </div>
  );
}
