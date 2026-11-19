import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  CORE_ROADMAP_MODULES,
  DISTRIBUTED_ALGORITHMS,
  DistributedAlgoId,
  INTERVIEW_FRAMEWORK_STEPS,
  REASONING_QUIZ_ITEMS,
} from '../data/systemDesignMasterRoadmapData';
import { useAccountState } from '../hooks/useAccountState';

type RoadmapSection = 'framework' | 'modules' | 'algorithms' | 'quiz';

interface RoadmapProgressState {
  completedFrameworkSteps: string[];
  reviewedModules: string[];
  reviewedAlgos: string[];
  quizAnswers: Record<string, string>;
}

const INITIAL_ROADMAP_PROGRESS: RoadmapProgressState = {
  completedFrameworkSteps: [],
  reviewedModules: [],
  reviewedAlgos: [],
  quizAnswers: {},
};

function simpleAngleHash(label: string): number {
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 360;
}

function NetworkingDfdDiagram() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 overflow-x-auto">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
        Request Path Data Flow Diagram (DFD)
      </div>
      <svg
        viewBox="0 0 720 210"
        className="w-full min-w-[540px] h-auto"
        role="img"
        aria-label="Client to DNS Geo-Routing to L4 Load Balancer to L7 API Gateway to Service Nodes A and B"
      >
        <defs>
          <marker
            id="sd-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-500" />
          </marker>
        </defs>

        {/* Client */}
        <rect
          x="14"
          y="72"
          width="96"
          height="52"
          rx="8"
          className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
          strokeWidth="1.5"
        />
        <text
          x="62"
          y="96"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-100 text-[12px] font-semibold"
        >
          Client
        </text>
        <text
          x="62"
          y="112"
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
        >
          HTTPS
        </text>

        <line
          x1="110"
          y1="98"
          x2="152"
          y2="98"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.5"
          markerEnd="url(#sd-arrow)"
        />

        {/* DNS Geo-Routing */}
        <rect
          x="158"
          y="72"
          width="118"
          height="52"
          rx="8"
          className="fill-white dark:fill-slate-900 stroke-sky-400 dark:stroke-sky-600"
          strokeWidth="1.5"
        />
        <text
          x="217"
          y="96"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-100 text-[12px] font-semibold"
        >
          DNS
        </text>
        <text
          x="217"
          y="112"
          textAnchor="middle"
          className="fill-sky-700 dark:fill-sky-400 text-[10px] font-mono"
        >
          Geo-Routing
        </text>

        <line
          x1="276"
          y1="98"
          x2="314"
          y2="98"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.5"
          markerEnd="url(#sd-arrow)"
        />

        {/* L4 LB */}
        <rect
          x="320"
          y="72"
          width="112"
          height="52"
          rx="8"
          className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
          strokeWidth="1.5"
        />
        <text
          x="376"
          y="96"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-100 text-[12px] font-semibold"
        >
          L4 Load Balancer
        </text>
        <text
          x="376"
          y="112"
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
        >
          IP / TCP Fast Path
        </text>

        <line
          x1="432"
          y1="98"
          x2="466"
          y2="98"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.5"
          markerEnd="url(#sd-arrow)"
        />

        {/* L7 API Gateway */}
        <rect
          x="472"
          y="66"
          width="124"
          height="64"
          rx="8"
          className="fill-sky-50 dark:fill-sky-950/60 stroke-sky-500 dark:stroke-sky-500"
          strokeWidth="1.5"
        />
        <text
          x="534"
          y="92"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-100 text-[12px] font-semibold"
        >
          L7 API Gateway
        </text>
        <text
          x="534"
          y="109"
          textAnchor="middle"
          className="fill-sky-700 dark:fill-sky-300 text-[10px] font-mono"
        >
          TLS · Auth · Rate Limit
        </text>

        {/* Branches to Service Nodes */}
        <path
          d="M 596 86 L 626 52 L 636 52"
          fill="none"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.5"
          markerEnd="url(#sd-arrow)"
        />
        <path
          d="M 596 110 L 626 146 L 636 146"
          fill="none"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.5"
          markerEnd="url(#sd-arrow)"
        />

        <rect
          x="640"
          y="26"
          width="70"
          height="52"
          rx="8"
          className="fill-white dark:fill-slate-900 stroke-emerald-500 dark:stroke-emerald-600"
          strokeWidth="1.5"
        />
        <text
          x="675"
          y="49"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-100 text-[11px] font-semibold"
        >
          Node A
        </text>
        <text
          x="675"
          y="65"
          textAnchor="middle"
          className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono"
        >
          Stateless
        </text>

        <rect
          x="640"
          y="120"
          width="70"
          height="52"
          rx="8"
          className="fill-white dark:fill-slate-900 stroke-emerald-500 dark:stroke-emerald-600"
          strokeWidth="1.5"
        />
        <text
          x="675"
          y="143"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-100 text-[11px] font-semibold"
        >
          Node B
        </text>
        <text
          x="675"
          y="159"
          textAnchor="middle"
          className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono"
        >
          Stateless
        </text>
      </svg>
    </div>
  );
}

function ConsistentHashingSimulator() {
  const [nodes, setNodes] = useState<{ id: string; angle: number }[]>([
    { id: 'Node A', angle: 0 },
    { id: 'Node B', angle: 135 },
    { id: 'Node C', angle: 270 },
  ]);
  const [keys] = useState<{ id: string; angle: number }[]>([
    { id: 'Key 1', angle: 45 },
    { id: 'Key 2', angle: 180 },
    { id: 'Key 3', angle: 310 },
    { id: 'Key 4', angle: 220 },
  ]);

  const sortedNodes = useMemo(() => [...nodes].sort((a, b) => a.angle - b.angle), [nodes]);

  const ownerForKey = (keyAngle: number): string => {
    if (sortedNodes.length === 0) return 'None';
    const clockwise = sortedNodes.find((n) => n.angle >= keyAngle);
    return (clockwise ?? sortedNodes[0]).id;
  };

  const handleAddNode = () => {
    if (nodes.length >= 6) return;
    const nextLetter = String.fromCharCode(65 + nodes.length);
    const id = `Node ${nextLetter}`;
    const angle = simpleAngleHash(id + nodes.length);
    setNodes((prev) => [...prev, { id, angle }]);
  };

  const handleRemoveLast = () => {
    if (nodes.length <= 2) return;
    setNodes((prev) => prev.slice(0, -1));
  };

  const cx = 130;
  const cy = 120;
  const r = 82;

  const toXY = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Interactive 0°–360° Hash Ring Simulator
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add or remove a server and watch only neighboring keys remap clockwise (K/N).
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddNode}
            disabled={nodes.length >= 6}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Add Server
          </button>
          <button
            type="button"
            onClick={handleRemoveLast}
            disabled={nodes.length <= 2}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 flex justify-center">
          <svg
            viewBox="0 0 260 240"
            className="w-56 h-52 overflow-visible"
            role="img"
            aria-label="Consistent hashing ring with servers and keys"
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {sortedNodes.map((n) => {
              const p = toXY(n.angle, r);
              const lbl = toXY(n.angle, r + 24);
              return (
                <g key={n.id}>
                  <circle cx={p.x} cy={p.y} r="7" className="fill-sky-600 dark:fill-sky-400" />
                  <text
                    x={lbl.x}
                    y={lbl.y + 3}
                    textAnchor="middle"
                    className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-semibold"
                  >
                    {n.id} ({n.angle}°)
                  </text>
                </g>
              );
            })}
            {keys.map((k) => {
              const p = toXY(k.angle, r);
              const lbl = toXY(k.angle, r - 24);
              return (
                <g key={k.id}>
                  <rect
                    x={p.x - 4.5}
                    y={p.y - 4.5}
                    width="9"
                    height="9"
                    rx="2"
                    className="fill-amber-500 dark:fill-amber-400"
                  />
                  <text
                    x={lbl.x}
                    y={lbl.y + 3}
                    textAnchor="middle"
                    className="fill-amber-700 dark:fill-amber-300 text-[9px] font-mono font-semibold"
                  >
                    {k.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="md:col-span-6 divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono tabular-nums">
          {keys.map((k) => (
            <div key={k.id} className="py-2 flex items-center justify-between gap-2">
              <span className="text-slate-700 dark:text-slate-300">
                {k.id} ({k.angle}°)
              </span>
              <span className="text-sky-700 dark:text-sky-400 font-semibold">
                → {ownerForKey(k.angle)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TokenBucketSimulator() {
  const [capacity, setCapacity] = useState(5);
  const [refillRate, setRefillRate] = useState(2);
  const [tokens, setTokens] = useState(5);
  const [log, setLog] = useState<string[]>(['Bucket initialized at full capacity (5 tokens).']);

  const sendRequests = (count: number) => {
    let cur = tokens;
    let allowed = 0;
    let rejected = 0;
    for (let i = 0; i < count; i++) {
      if (cur >= 1) {
        cur -= 1;
        allowed++;
      } else {
        rejected++;
      }
    }
    setTokens(cur);
    setLog((prev) =>
      [
        `Burst of ${count}: ${allowed} allowed (200 OK), ${rejected} rejected (429 Too Many Requests). Remaining: ${cur}/${capacity}.`,
        ...prev,
      ].slice(0, 5),
    );
  };

  const refillTick = () => {
    const next = Math.min(capacity, tokens + refillRate);
    setTokens(next);
    setLog((prev) =>
      [`+1s refill (+${refillRate} tokens capped at ${capacity}) → ${next}/${capacity} available.`, ...prev].slice(
        0,
        5,
      ),
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Interactive Token Bucket Sandbox
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            tokens = min({capacity}, {tokens} + Δt × {refillRate}) · Available: {tokens}/{capacity}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => sendRequests(1)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-500"
          >
            Send 1 Req
          </button>
          <button
            type="button"
            onClick={() => sendRequests(4)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
          >
            Fire Burst (4)
          </button>
          <button
            type="button"
            onClick={refillTick}
            className="px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
          >
            +1s Refill (+{refillRate})
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs font-mono tabular-nums">
        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          Capacity C={capacity}
          <input
            type="range"
            min={3}
            max={10}
            value={capacity}
            onChange={(e) => {
              const nextC = Number(e.target.value);
              setCapacity(nextC);
              setTokens((t) => Math.min(t, nextC));
            }}
            className="w-24 accent-sky-600"
          />
        </label>
        <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          Refill R={refillRate}/s
          <input
            type="range"
            min={1}
            max={5}
            value={refillRate}
            onChange={(e) => setRefillRate(Number(e.target.value))}
            className="w-24 accent-sky-600"
          />
        </label>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: capacity }).map((_, i) => (
          <div
            key={i}
            className={`h-5 flex-1 rounded transition-colors ${
              i < tokens
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      <div className="space-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
        {log.map((entry, idx) => (
          <div key={idx} className={idx === 0 ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

function RaftQuorumInteractive() {
  const [nodes, setNodes] = useState<3 | 5 | 7>(5);
  const quorum = Math.floor(nodes / 2) + 1;
  const maxFailures = Math.floor((nodes - 1) / 2);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          Raft Cluster Quorum & Fault-Tolerance Calculator
        </div>
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900">
          {([3, 5, 7] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNodes(n)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                nodes === n
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              N = {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
        <div>
          <div className="text-slate-500 dark:text-slate-400 font-sans">Cluster Size</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{nodes} nodes</div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400 font-sans">Write / Vote Quorum</div>
          <div className="text-lg font-bold text-sky-700 dark:text-sky-400">{quorum} nodes</div>
        </div>
        <div>
          <div className="text-slate-500 dark:text-slate-400 font-sans">Faults Tolerated</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {maxFailures} crash{maxFailures === 1 ? '' : 'es'}
          </div>
        </div>
      </div>
    </div>
  );
}

function VectorClockComparator() {
  const [a1, setA1] = useState(2);
  const [b1, setB1] = useState(1);
  const [a2, setA2] = useState(1);
  const [b2, setB2] = useState(2);

  const verdict = useMemo(() => {
    const v1LeqV2 = a1 <= a2 && b1 <= b2;
    const v2LeqV1 = a2 <= a1 && b2 <= b1;
    if (v1LeqV2 && v2LeqV1) return { status: 'Identical Versions', tone: 'text-slate-600 dark:text-slate-300', detail: 'V₁ and V₂ represent the exact same causal state.' };
    if (v1LeqV2) return { status: 'V₂ Supersedes V₁ (Causal)', tone: 'text-emerald-700 dark:text-emerald-400', detail: 'Every counter in V₁ ≤ V₂ — safely overwrite V₁ with V₂.' };
    if (v2LeqV1) return { status: 'V₁ Supersedes V₂ (Causal)', tone: 'text-emerald-700 dark:text-emerald-400', detail: 'Every counter in V₂ ≤ V₁ — safely keep V₁.' };
    return {
      status: 'Concurrent Write Conflict!',
      tone: 'text-amber-700 dark:text-amber-400',
      detail: 'Neither vector dominates the other — preserve both siblings for client/CRDT conflict resolution.',
    };
  }, [a1, b1, a2, b2]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3 text-xs">
      <div className="font-semibold text-slate-900 dark:text-slate-100">
        Interactive Vector Clock Causality Checker
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono tabular-nums">
        <div className="space-y-1.5">
          <div className="text-slate-500 dark:text-slate-400">
            Version V₁ = [NodeA: {a1}, NodeB: {b1}]
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              A:
              <input type="number" min={0} max={9} value={a1} onChange={(e) => setA1(Number(e.target.value))} className="w-12 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </label>
            <label className="flex items-center gap-1.5">
              B:
              <input type="number" min={0} max={9} value={b1} onChange={(e) => setB1(Number(e.target.value))} className="w-12 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-slate-500 dark:text-slate-400">
            Version V₂ = [NodeA: {a2}, NodeB: {b2}]
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              A:
              <input type="number" min={0} max={9} value={a2} onChange={(e) => setA2(Number(e.target.value))} className="w-12 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </label>
            <label className="flex items-center gap-1.5">
              B:
              <input type="number" min={0} max={9} value={b2} onChange={(e) => setB2(Number(e.target.value))} className="w-12 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </label>
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className={`font-semibold ${verdict.tone}`}>{verdict.status}</span>{' '}
        <span className="text-slate-600 dark:text-slate-400">— {verdict.detail}</span>
      </div>
    </div>
  );
}

export function SystemDesignMasterRoadmap() {
  const [section, setSection] = useState<RoadmapSection>('framework');
  const [activeModuleId, setActiveModuleId] = useState(CORE_ROADMAP_MODULES[0].id);
  const [activeAlgoId, setActiveAlgoId] = useState<DistributedAlgoId>('consistent-hashing');

  // Interactive Back-of-the-Envelope Estimator state
  const [dauMillions, setDauMillions] = useState(50);
  const [actionsPerUser, setActionsPerUser] = useState(10);
  const [peakMultiplier, setPeakMultiplier] = useState(2.5);
  const [payloadKb, setPayloadKb] = useState(2);
  const [retentionYears, setRetentionYears] = useState(5);

  const [progress, setProgress] = useAccountState<RoadmapProgressState>(
    'system-design-roadmap-progress',
    INITIAL_ROADMAP_PROGRESS,
  );

  const estimation = useMemo(() => {
    const dailyRequests = dauMillions * 1_000_000 * actionsPerUser;
    const avgQps = Math.round(dailyRequests / 86_400);
    const peakQps = Math.round(avgQps * peakMultiplier);
    const dailyStorageGb = (dailyRequests * payloadKb) / (1024 * 1024);
    const totalStorageTb = (dailyStorageGb * 365 * retentionYears) / 1024;
    const peakBandwidthMbps = (peakQps * payloadKb * 8) / 1024;
    return {
      avgQps,
      peakQps,
      dailyStorageGb,
      totalStorageTb,
      peakBandwidthMbps,
    };
  }, [dauMillions, actionsPerUser, peakMultiplier, payloadKb, retentionYears]);

  const toggleListItem = (
    field: 'completedFrameworkSteps' | 'reviewedModules' | 'reviewedAlgos',
    id: string,
  ) => {
    const current = progress[field] ?? [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setProgress({ ...progress, [field]: next });
  };

  const handleAnswerQuiz = (questionId: string, optionId: string) => {
    setProgress({
      ...progress,
      quizAnswers: {
        ...(progress.quizAnswers ?? {}),
        [questionId]: optionId,
      },
    });
  };

  const handleResetQuiz = () => {
    setProgress({
      ...progress,
      quizAnswers: {},
    });
  };

  const quizCorrectCount = REASONING_QUIZ_ITEMS.filter((q) => {
    const picked = progress.quizAnswers?.[q.id];
    return q.options.some((o) => o.id === picked && o.isCorrect);
  }).length;

  const activeModule =
    CORE_ROADMAP_MODULES.find((m) => m.id === activeModuleId) ?? CORE_ROADMAP_MODULES[0];
  const activeAlgo =
    DISTRIBUTED_ALGORITHMS.find((a) => a.id === activeAlgoId) ?? DISTRIBUTED_ALGORITHMS[0];

  const totalMilestones =
    INTERVIEW_FRAMEWORK_STEPS.length +
    CORE_ROADMAP_MODULES.length +
    DISTRIBUTED_ALGORITHMS.length +
    REASONING_QUIZ_ITEMS.length;
  const doneMilestones =
    (progress.completedFrameworkSteps?.length ?? 0) +
    (progress.reviewedModules?.length ?? 0) +
    (progress.reviewedAlgos?.length ?? 0) +
    quizCorrectCount;

  return (
    <div className="space-y-6">
      {/* Header & Section Tabs */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span className="text-sky-700 dark:text-sky-400 font-sans font-semibold">
                System Design & Distributed Algorithms Master Roadmap
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {doneMilestones}/{totalMilestones} milestones completed
              </span>
              <span aria-hidden="true">·</span>
              <span>Quiz {quizCorrectCount}/{REASONING_QUIZ_ITEMS.length}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              End-to-End Interview Execution, Core Modules, Distributed Algorithms & Reasoning Quiz
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Master Roadmap Parts"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950"
          >
            {(
              [
                { id: 'framework', label: '1. 4-Step Framework' },
                { id: 'modules', label: '2. Core Modules (4)' },
                { id: 'algorithms', label: '3. Distributed Algos (6)' },
                { id: 'quiz', label: `4. Reasoning Quiz (${quizCorrectCount}/5)` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={section === tab.id}
                onClick={() => setSection(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  section === tab.id
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PART 1: 4-Step Interview Execution Framework + Back-of-the-Envelope Calculator */}
      {section === 'framework' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTERVIEW_FRAMEWORK_STEPS.map((step) => {
              const isDone = progress.completedFrameworkSteps?.includes(step.id);
              return (
                <article
                  key={step.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400 font-semibold">
                        Step {step.stepNumber} · {step.timeWindow}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {step.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleListItem('completedFrameworkSteps', step.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        isDone
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      {isDone ? 'Mastered' : 'Mark Done'}
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.summary}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {step.checkpoints.map((cp) => (
                      <li key={cp} className="leading-relaxed">
                        • {cp}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          {/* Interactive Back-of-the-Envelope Estimator */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Interactive Back-of-the-Envelope Capacity Estimator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Practice Step 2 (Minutes 5–10): adjust scale parameters to calculate QPS, 5-year storage, and peak bandwidth.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                QPS = (DAU × Actions) / 86,400
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-mono tabular-nums">
              <label className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 block">
                  DAU: <strong className="text-slate-900 dark:text-slate-100">{dauMillions}M</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={500}
                  value={dauMillions}
                  onChange={(e) => setDauMillions(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 block">
                  Actions/User:{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{actionsPerUser}/day</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={actionsPerUser}
                  onChange={(e) => setActionsPerUser(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 block">
                  Peak Factor:{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{peakMultiplier}×</strong>
                </span>
                <input
                  type="range"
                  min={1.5}
                  max={5}
                  step={0.5}
                  value={peakMultiplier}
                  onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 block">
                  Payload Size:{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{payloadKb} KB</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={payloadKb}
                  onChange={(e) => setPayloadKb(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-slate-600 dark:text-slate-400 block">
                  Retention:{' '}
                  <strong className="text-slate-900 dark:text-slate-100">{retentionYears} yrs</strong>
                </span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 font-mono tabular-nums">
              <div>
                <div className="text-xs font-sans text-slate-500 dark:text-slate-400">Average QPS</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {estimation.avgQps.toLocaleString()} req/s
                </div>
              </div>
              <div>
                <div className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  Peak QPS ({peakMultiplier}×)
                </div>
                <div className="text-xl font-bold text-sky-700 dark:text-sky-400">
                  {estimation.peakQps.toLocaleString()} req/s
                </div>
              </div>
              <div>
                <div className="text-xs font-sans text-slate-500 dark:text-slate-400">
                  {retentionYears}-Year Storage
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {estimation.totalStorageTb >= 1000
                    ? `${(estimation.totalStorageTb / 1024).toFixed(2)} PB`
                    : `${estimation.totalStorageTb.toFixed(1)} TB`}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {estimation.dailyStorageGb.toFixed(1)} GB/day
                </div>
              </div>
              <div>
                <div className="text-xs font-sans text-slate-500 dark:text-slate-400">Peak Bandwidth</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  {estimation.peakBandwidthMbps >= 1000
                    ? `${(estimation.peakBandwidthMbps / 1024).toFixed(2)} Gbps`
                    : `${estimation.peakBandwidthMbps.toFixed(0)} Mbps`}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PART 2: Core System Design Modules (1–4) */}
      {section === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Module List Selector */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {CORE_ROADMAP_MODULES.map((mod) => {
              const isSelected = mod.id === activeModule.id;
              const isReviewed = progress.reviewedModules?.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`w-full text-left p-4 transition-colors space-y-1 ${
                    isSelected
                      ? 'bg-sky-50/80 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-sky-700 dark:text-sky-400 font-semibold">{mod.number}</span>
                    {isReviewed && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-sans font-medium">
                        Reviewed
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {mod.title}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {mod.subtitle}
                  </p>
                </button>
              );
            })}
          </aside>

          {/* Active Module Detail */}
          <section className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  {activeModule.number}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeModule.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{activeModule.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleListItem('reviewedModules', activeModule.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  progress.reviewedModules?.includes(activeModule.id)
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                {progress.reviewedModules?.includes(activeModule.id)
                  ? 'Module Reviewed'
                  : 'Mark Reviewed'}
              </button>
            </div>

            <div className="space-y-8">
              {activeModule.subTopics.map((sub) => (
                <div key={sub.id} className="space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {sub.code} {sub.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sub.concept}
                    </p>
                  </div>

                  {sub.hasNetworkingDfd && <NetworkingDfdDiagram />}

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {sub.bullets.map((b) => (
                      <div key={b.label} className="py-2.5 space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {b.label}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {b.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {sub.table && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {sub.table.caption}
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                              {sub.table.headers.map((h) => (
                                <th key={h} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sub.table.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-2.5 px-3 leading-snug ${
                                      cIdx === 0
                                        ? 'font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap'
                                        : 'text-slate-600 dark:text-slate-300'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {sub.interviewThought && (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1">
                      <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                        Interview Thought Process
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        {sub.interviewThought}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* PART 3: Core Distributed Algorithms Deep Dive (6 Algorithms) */}
      {section === 'algorithms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {DISTRIBUTED_ALGORITHMS.map((algo) => {
              const isSelected = algo.id === activeAlgo.id;
              const isReviewed = progress.reviewedAlgos?.includes(algo.id);
              return (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setActiveAlgoId(algo.id)}
                  className={`w-full text-left p-4 transition-colors space-y-1 ${
                    isSelected
                      ? 'bg-sky-50/80 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-sky-700 dark:text-sky-400 font-semibold">
                      {algo.number}. {algo.domain}
                    </span>
                    {isReviewed && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-sans font-medium">
                        Mastered
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {algo.name}
                  </div>
                </button>
              );
            })}
          </aside>

          <section className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  {activeAlgo.number} · {activeAlgo.domain}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeAlgo.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeAlgo.problemSolved}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleListItem('reviewedAlgos', activeAlgo.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  progress.reviewedAlgos?.includes(activeAlgo.id)
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                {progress.reviewedAlgos?.includes(activeAlgo.id) ? 'Mastered' : 'Mark Mastered'}
              </button>
            </div>

            {/* Interactive Simulation Widget per Algorithm */}
            {activeAlgo.id === 'consistent-hashing' && <ConsistentHashingSimulator />}
            {activeAlgo.id === 'token-bucket' && <TokenBucketSimulator />}
            {activeAlgo.id === 'raft' && <RaftQuorumInteractive />}
            {activeAlgo.id === 'vector-merkle' && <VectorClockComparator />}

            {/* Algorithm Mechanics */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Algorithm Mechanics
              </h4>
              <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeAlgo.mechanics.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400 font-semibold shrink-0">
                      0{idx + 1}.
                    </span>
                    <span>{m}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Complexity & Limitation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Time Complexity
                </div>
                <div className="font-mono text-slate-600 dark:text-slate-300">
                  {activeAlgo.timeComplexity}
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Space Complexity
                </div>
                <div className="font-mono text-slate-600 dark:text-slate-300">
                  {activeAlgo.spaceComplexity}
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Key Limitation & Production Trade-Off
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {activeAlgo.limitation}
                </p>
              </div>
            </div>

            {activeAlgo.table && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {activeAlgo.table.caption}
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {activeAlgo.table.headers.map((h) => (
                          <th key={h} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeAlgo.table.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`py-2.5 px-3 leading-snug ${
                                cIdx === 0
                                  ? 'font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap'
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* PART 4: 5-Question Interactive Reasoning Quiz */}
      {section === 'quiz' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              Architectural Reasoning Score:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {quizCorrectCount} / {REASONING_QUIZ_ITEMS.length}
              </strong>{' '}
              correct · Answers persisted to your database profile
            </div>
            <button
              type="button"
              onClick={handleResetQuiz}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-sky-500 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Quiz
            </button>
          </div>

          {REASONING_QUIZ_ITEMS.map((item) => {
            const pickedId = progress.quizAnswers?.[item.id];
            const pickedOption = item.options.find((o) => o.id === pickedId);
            const isCorrect = Boolean(pickedOption?.isCorrect);

            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                      Question 0{item.number} · Real-World Interview Scenario
                    </span>
                    {pickedOption && (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isCorrect
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            Review Reasoning Below
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.scenario}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {item.options.map((opt) => {
                    const isPicked = pickedId === opt.id;
                    let cls =
                      'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 hover:border-sky-500';
                    if (pickedOption) {
                      if (opt.isCorrect) {
                        cls =
                          'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                      } else if (isPicked && !opt.isCorrect) {
                        cls =
                          'border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                      } else {
                        cls =
                          'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 opacity-75';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAnswerQuiz(item.id, opt.id)}
                        className={`text-left p-3 rounded-lg border text-xs leading-relaxed transition-colors ${cls}`}
                      >
                        <span className="font-mono font-semibold mr-2 uppercase">{opt.id}.</span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {pickedOption && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Recommended Architecture: {item.answerSummary}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.reasoning}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
