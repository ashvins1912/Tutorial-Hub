import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  Eye,
  EyeOff,
  Layers,
  MessageSquare,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Webhook,
  Workflow,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  COMM_ARCHITECTURE_PRIMITIVES,
  REAL_WORLD_DOMAIN_META,
  REAL_WORLD_SYSTEM_BLUEPRINTS,
  type CommPrimitiveId,
  type RealWorldDomain,
  type RealWorldSystemBlueprint,
} from '../../data/realWorldSystemBlueprintsData';
import {
  SYSTEM_DESIGN_MOCK_INTERVIEWS,
  type MockSignalLevel,
} from '../../data/systemDesignMockInterviewData';
import { CopyButton, SegmentedTabBar } from '../ui';
import { QuickCommerceLiveSimulator } from './QuickCommerceLiveSimulator';

type LabTrack = 'blueprints' | 'comm-lab' | 'mock-interview';

interface WebhookLogEntry {
  id: number;
  eventId: string;
  action: string;
  httpStatus: string;
  outcome: 'accepted' | 'deduped' | 'rejected' | 'retried-dlq';
  detail: string;
}

interface WsLogEntry {
  id: number;
  seq: number;
  direction: 'CLIENT -> SERVER' | 'SERVER -> CLIENT' | 'SYSTEM';
  frame: string;
  detail: string;
}

interface QueueLogEntry {
  id: number;
  kind: 'enqueue' | 'burst' | 'process' | 'dlq' | 'replay';
  detail: string;
}

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getHiringVerdict(score: number): {
  title: string;
  summary: string;
  toneClass: string;
} {
  if (score >= 85) {
    return {
      title: 'Strong Hire — Staff / Principal Bar',
      summary:
        'Cleanly isolated consistency boundaries, nailed DB-level sharding and contention math, and handled production failure curveballs with fencing/reconciliation.',
      toneClass: 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30',
    };
  }
  if (score >= 65) {
    return {
      title: 'Hire — Senior Systems Engineer Bar',
      summary:
        'Solid end-to-end architecture and sensible protocol/storage choices. Review the missed failure-mode curveballs below to sharpen to Staff level.',
      toneClass: 'text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30',
    };
  }
  if (score >= 45) {
    return {
      title: 'Lean / Borderline — Deepen Core Trade-offs',
      summary:
        'Good intuition on basic building blocks, but hit classic bottlenecks around contention, sharding keys, or async reliability. Study the matching Blueprint & retry.',
      toneClass: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30',
    };
  }
  return {
    title: 'No Hire (Practice Run) — Review Foundations',
    summary:
      'Several high-severity bottlenecks or data-loss risks appeared in the design. Walk through the animated Blueprint & DB DDL first, then retake this loop!',
    toneClass: 'text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30',
  };
}

function signalTone(signal: MockSignalLevel): string {
  switch (signal) {
    case 'Strong Hire':
      return 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30';
    case 'Hire':
      return 'text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30';
    case 'Lean / Partial':
      return 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30';
    case 'Red Flag':
      return 'text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30';
  }
}

/* ============================================================================
   SUB-COMPONENT: ANIMATED 5-NODE BLUEPRINT SVG DFD SIMULATOR
   ============================================================================ */

function BlueprintAnimatedDfd({ blueprint }: { blueprint: RealWorldSystemBlueprint }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [packetProgress, setPacketProgress] = useState(0.5);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  // Reset step when blueprint changes
  useEffect(() => {
    setStepIdx(0);
    setPacketProgress(0);
  }, [blueprint.id]);

  // Auto-advance step timer
  useEffect(() => {
    if (!isPlaying) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % blueprint.dfdSteps.length);
      setPacketProgress(0);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [isPlaying, blueprint.dfdSteps.length, blueprint.id]);

  // Smooth rAF packet motion along active edge
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !isPlaying) {
      setPacketProgress(0.5);
      return;
    }

    lastFrameRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      setPacketProgress((prev) => (prev + dt * 0.55) % 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, stepIdx, blueprint.id]);

  const currentStep = blueprint.dfdSteps[stepIdx] ?? blueprint.dfdSteps[0];
  const nodeById = useMemo(
    () => new Map(blueprint.dfdNodes.map((n) => [n.id, n])),
    [blueprint.dfdNodes]
  );

  // Compute animated packet coordinates along the first active edge
  const primaryActiveEdge =
    blueprint.dfdEdges.find((e) => currentStep.activeEdgeIds.includes(e.id)) ??
    blueprint.dfdEdges[0];
  const packetFrom = primaryActiveEdge ? nodeById.get(primaryActiveEdge.from) : undefined;
  const packetTo = primaryActiveEdge ? nodeById.get(primaryActiveEdge.to) : undefined;
  const packetX =
    packetFrom && packetTo ? packetFrom.x + (packetTo.x - packetFrom.x) * packetProgress : 0;
  const packetY =
    packetFrom && packetTo ? packetFrom.y + (packetTo.y - packetFrom.y) * packetProgress : 0;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Animated End-to-End Architecture DFD
          </p>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Step {currentStep.step} of {blueprint.dfdSteps.length}: {currentStep.title}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => (p - 1 + blueprint.dfdSteps.length) % blueprint.dfdSteps.length);
            }}
            aria-label="Previous step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => (p + 1) % blueprint.dfdSteps.length);
            }}
            aria-label="Next step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setStepIdx(0);
              setPacketProgress(0);
            }}
            aria-label="Reset animation"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-950/70 overflow-x-auto">
        <svg
          viewBox="0 0 680 220"
          className="w-full min-w-[560px] h-auto max-h-[250px]"
          role="img"
          aria-label={`${blueprint.shortTitle} animated system architecture diagram`}
        >
          <defs>
            <marker
              id={`arrow-inactive-${blueprint.id}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-600" />
            </marker>
            <marker
              id={`arrow-active-${blueprint.id}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-sky-600 dark:fill-sky-400" />
            </marker>
          </defs>

          {/* Edges */}
          {blueprint.dfdEdges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const isActive = currentStep.activeEdgeIds.includes(edge.id);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 - 12;

            // Trim edge endpoints slightly so arrows terminate cleanly at box borders
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.hypot(dx, dy) || 1;
            const padStart = 54;
            const padEnd = 58;
            const x1 = from.x + (dx / dist) * padStart;
            const y1 = from.y + (dy / dist) * (padStart * 0.45);
            const x2 = to.x - (dx / dist) * padEnd;
            const y2 = to.y - (dy / dist) * (padEnd * 0.45);

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth={isActive ? 2.6 : 1.5}
                  strokeDasharray={isActive ? '6 4' : undefined}
                  markerEnd={`url(#arrow-${isActive ? 'active' : 'inactive'}-${blueprint.id})`}
                  className={
                    isActive
                      ? 'stroke-sky-600 dark:stroke-sky-400 transition-colors'
                      : 'stroke-slate-300 dark:stroke-slate-700 transition-colors'
                  }
                />
                <rect
                  x={midX - 42}
                  y={midY - 9}
                  width={84}
                  height={16}
                  rx={4}
                  className={
                    isActive
                      ? 'fill-sky-50 dark:fill-sky-950 stroke-sky-300 dark:stroke-sky-700'
                      : 'fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800'
                  }
                  strokeWidth={1}
                />
                <text
                  x={midX}
                  y={midY + 2}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-medium ${
                    isActive
                      ? 'fill-sky-800 dark:fill-sky-300'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {blueprint.dfdNodes.map((node) => {
            const isActive = currentStep.activeNodeIds.includes(node.id);
            return (
              <g key={node.id} transform={`translate(${node.x - 56}, ${node.y - 25})`}>
                <rect
                  width={112}
                  height={50}
                  rx={8}
                  strokeWidth={isActive ? 2 : 1.25}
                  className={
                    isActive
                      ? 'fill-sky-50 dark:fill-sky-950/90 stroke-sky-600 dark:stroke-sky-400'
                      : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                <text
                  x={56}
                  y={21}
                  textAnchor="middle"
                  className={`text-[10.5px] font-semibold ${
                    isActive
                      ? 'fill-sky-900 dark:fill-sky-100'
                      : 'fill-slate-800 dark:fill-slate-200'
                  }`}
                >
                  {node.label}
                </text>
                <text
                  x={56}
                  y={36}
                  textAnchor="middle"
                  className="text-[8.5px] font-mono fill-slate-500 dark:fill-slate-400"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}

          {/* Animated In-Flight Data Packet */}
          {packetFrom && packetTo && (
            <g transform={`translate(${packetX}, ${packetY})`}>
              <rect
                x={-36}
                y={-11}
                width={72}
                height={22}
                rx={5}
                className="fill-amber-500 dark:fill-amber-400 stroke-amber-700 dark:stroke-amber-200"
                strokeWidth={1.2}
              />
              <text
                x={0}
                y={3.5}
                textAnchor="middle"
                className="text-[8.5px] font-mono font-bold fill-slate-950"
              >
                {currentStep.packetLabel}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Step Selector Pills & Synchronized Explanations */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap gap-2">
          {blueprint.dfdSteps.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(idx);
                setPacketProgress(0.5);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                idx === stepIdx
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {s.step}. {s.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              Plain-English Step Walkthrough
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.plainEnglish}
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="font-mono text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1">
              Under-the-Hood Systems Detail
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.technicalDetail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT: REAL-WORLD ARCHITECTURES, COMM PRIMITIVES & MOCK INTERVIEW
   ============================================================================ */

interface RealWorldArchitecturesAndInterviewLabProps {
  onActiveBlueprintChange?: (blueprintId: string) => void;
}

export function RealWorldArchitecturesAndInterviewLab(
  props: RealWorldArchitecturesAndInterviewLabProps
) {
  const [track, setTrack] = useState<LabTrack>('blueprints');

  // Track 1: Real-World Blueprints state
  const [domainFilter, setDomainFilter] = useState<'all' | RealWorldDomain>('all');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(
    REAL_WORLD_SYSTEM_BLUEPRINTS[0].id
  );

  useEffect(() => {
    props.onActiveBlueprintChange?.(selectedBlueprintId);
  }, [selectedBlueprintId, props]);

  // Track 2: Comm Primitives (Webhook / WebSocket / Enqueue) state
  const [selectedCommId, setSelectedCommId] = useState<CommPrimitiveId>('webhook');

  // Webhook Interactive Sandbox state
  const [whDelivered, setWhDelivered] = useState(1);
  const [whDeduped, setWhDeduped] = useState(0);
  const [whRejected, setWhRejected] = useState(0);
  const [whDlq, setWhDlq] = useState(0);
  const [whLastEventId, setWhLastEventId] = useState('evt_pay_9001');
  const [whSeqCounter, setWhSeqCounter] = useState(9001);
  const [whLogs, setWhLogs] = useState<WebhookLogEntry[]>([
    {
      id: 1,
      eventId: 'evt_pay_9001',
      action: 'POST /webhooks/payments (Valid HMAC)',
      httpStatus: '200 OK (18ms)',
      outcome: 'accepted',
      detail: 'HMAC-SHA256 verified, inserted into idempotency table, enqueued local worker, fast 200 ACK returned.',
    },
  ]);

  // WebSocket Interactive Sandbox state
  const [wsStatus, setWsStatus] = useState<'CLOSED' | 'CONNECTED' | 'RECONNECTING'>('CONNECTED');
  const [wsSeq, setWsSeq] = useState(42);
  const [wsReconnects, setWsReconnects] = useState(0);
  const [wsLogs, setWsLogs] = useState<WsLogEntry[]>([
    {
      id: 1,
      seq: 41,
      direction: 'SYSTEM',
      frame: 'HTTP 101 Switching Protocols',
      detail: 'Persistent full-duplex TCP/TLS WebSocket established with Gateway #14.',
    },
    {
      id: 2,
      seq: 42,
      direction: 'SERVER -> CLIENT',
      frame: 'BINARY TICK [NIFTY 24812.40]',
      detail: '44-byte compact binary frame pushed in 1.4ms (no HTTP headers!).',
    },
  ]);

  // Enqueue & Outbox Interactive Sandbox state
  const [qOutboxCommitted, setQOutboxCommitted] = useState(4);
  const [qDepth, setQDepth] = useState(3);
  const [qProcessed, setQProcessed] = useState(1);
  const [qDlq, setQDlq] = useState(0);
  const [qLogs, setQLogs] = useState<QueueLogEntry[]>([
    {
      id: 1,
      kind: 'enqueue',
      detail: 'Booking #1004 committed in PostgreSQL + Outbox row relayed to Kafka Partition #2.',
    },
  ]);

  // Track 3: Mock Interview Loop state
  const [selectedMockId, setSelectedMockId] = useState<string>(SYSTEM_DESIGN_MOCK_INTERVIEWS[0].id);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0); // 0..4 = phases, 5 = final rubric scorecard
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [whiteboardNotes, setWhiteboardNotes] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const id = window.setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timerSeconds]);

  const filteredBlueprints = useMemo(
    () =>
      domainFilter === 'all'
        ? REAL_WORLD_SYSTEM_BLUEPRINTS
        : REAL_WORLD_SYSTEM_BLUEPRINTS.filter((b) => b.domain === domainFilter),
    [domainFilter]
  );

  const activeBlueprint =
    REAL_WORLD_SYSTEM_BLUEPRINTS.find((b) => b.id === selectedBlueprintId) ??
    filteredBlueprints[0] ??
    REAL_WORLD_SYSTEM_BLUEPRINTS[0];

  const matchingMockForBlueprint = useMemo(
    () => SYSTEM_DESIGN_MOCK_INTERVIEWS.find((m) => m.relatedBlueprintId === activeBlueprint.id),
    [activeBlueprint.id]
  );

  const activeComm =
    COMM_ARCHITECTURE_PRIMITIVES.find((c) => c.id === selectedCommId) ??
    COMM_ARCHITECTURE_PRIMITIVES[0];

  const activeMock =
    SYSTEM_DESIGN_MOCK_INTERVIEWS.find((m) => m.id === selectedMockId) ??
    SYSTEM_DESIGN_MOCK_INTERVIEWS[0];

  const handleSelectMock = (mockId: string) => {
    const target = SYSTEM_DESIGN_MOCK_INTERVIEWS.find((m) => m.id === mockId);
    setSelectedMockId(mockId);
    setActivePhaseIdx(0);
    setSelectedOptions({});
    setWhiteboardNotes({});
    setShowHints(false);
    setTimerSeconds((target?.durationMinutes ?? 45) * 60);
    setTimerRunning(false);
  };

  const handleJumpToBlueprint = (blueprintId: string) => {
    setDomainFilter('all');
    setSelectedBlueprintId(blueprintId);
    setTrack('blueprints');
  };

  // Webhook Sandbox Handlers
  const fireValidWebhook = () => {
    const nextNum = whSeqCounter + 1;
    const evtId = `evt_pay_${nextNum}`;
    setWhSeqCounter(nextNum);
    setWhLastEventId(evtId);
    setWhDelivered((c) => c + 1);
    setWhLogs((prev) => [
      {
        id: Date.now(),
        eventId: evtId,
        action: 'POST /webhooks/payments (Valid HMAC + Fresh Timestamp)',
        httpStatus: '200 OK (14ms)',
        outcome: 'accepted',
        detail: `Signature matched constant-time compare. Inserted ${evtId} into idempotency table & enqueued async ledger worker.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const fireDuplicateWebhook = () => {
    setWhDeduped((c) => c + 1);
    setWhLogs((prev) => [
      {
        id: Date.now(),
        eventId: whLastEventId,
        action: `RETRY POST /webhooks/payments (Duplicate ${whLastEventId})`,
        httpStatus: '200 OK (4ms · NO-OP)',
        outcome: 'deduped',
        detail: `UNIQUE(${whLastEventId}) hit ON CONFLICT DO NOTHING! Returned 200 OK to stop retries with ZERO double-charge.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const fireTamperedWebhook = () => {
    setWhRejected((c) => c + 1);
    setWhLogs((prev) => [
      {
        id: Date.now(),
        eventId: 'evt_spoof_666',
        action: 'POST /webhooks/payments (Modified Amount · Bad HMAC)',
        httpStatus: '401 Unauthorized (2ms)',
        outcome: 'rejected',
        detail: 'HMAC-SHA256 mismatch! Dropped spoofed payload before JSON parsing or DB writes.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const fireOutageWebhook = () => {
    const nextNum = whSeqCounter + 1;
    const evtId = `evt_pay_${nextNum}`;
    setWhSeqCounter(nextNum);
    setWhDlq((c) => c + 1);
    setWhLogs((prev) => [
      {
        id: Date.now(),
        eventId: evtId,
        action: 'Consumer 503 Outage -> Backoff (1m, 5m, 30m, 2h)',
        httpStatus: '503 -> DLQ',
        outcome: 'retried-dlq',
        detail: `Exhausted exponential backoff with jitter for ${evtId}. Parked safely in Dead-Letter Queue + alerted merchant ops for replay.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  // WebSocket Sandbox Handlers
  const openSocket = () => {
    setWsStatus('CONNECTED');
    setWsLogs((prev) => [
      {
        id: Date.now(),
        seq: wsSeq,
        direction: 'SYSTEM',
        frame: 'HTTP 101 Upgrade + Auth JWT',
        detail: `Socket connected. Client subscribed from cursor seq=${wsSeq}.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const sendWsFrame = () => {
    if (wsStatus !== 'CONNECTED') return;
    const nextSeq = wsSeq + 1;
    setWsSeq(nextSeq);
    setWsLogs((prev) => [
      {
        id: Date.now(),
        seq: nextSeq,
        direction: 'CLIENT -> SERVER',
        frame: `FRAME #${nextSeq} { op: "MSG", client_id: "c_${nextSeq}" }`,
        detail: `Gateway persisted to Cassandra & pushed ACK #${nextSeq} in 9ms over open socket.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const pingWs = () => {
    if (wsStatus !== 'CONNECTED') return;
    setWsLogs((prev) => [
      {
        id: Date.now(),
        seq: wsSeq,
        direction: 'SERVER -> CLIENT',
        frame: 'PING (0x9) <-> PONG (0xA)',
        detail: 'Heartbeat refreshed Redis Session Registry TTL (30s) & kept NAT firewall mapping alive.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const dropAndReconnectWs = () => {
    const missedTo = wsSeq + 3;
    setWsStatus('RECONNECTING');
    setWsReconnects((r) => r + 1);
    setWsSeq(missedTo);
    setWsLogs((prev) => [
      {
        id: Date.now(),
        seq: missedTo,
        direction: 'SYSTEM',
        frame: `TUNNEL DROP -> Jitter Reconnect -> REPLAY seq ${wsSeq + 1}..${missedTo}`,
        detail: `Connection dropped in subway! Client backed off with random jitter (avoids thundering herd), reconnected, and seamlessly replayed 3 missed messages.`,
      },
      ...prev.slice(0, 7),
    ]);
    window.setTimeout(() => setWsStatus('CONNECTED'), 450);
  };

  // Enqueue Sandbox Handlers
  const enqueueSingleJob = () => {
    setQOutboxCommitted((c) => c + 1);
    setQDepth((d) => d + 1);
    setQLogs((prev) => [
      {
        id: Date.now(),
        kind: 'enqueue',
        detail: 'ACID Commit + Outbox Insert -> Debezium CDC pushed 1 event to Kafka partition (zero dual-write loss!).',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const burstSpikeJobs = () => {
    setQOutboxCommitted((c) => c + 12);
    setQDepth((d) => d + 12);
    setQLogs((prev) => [
      {
        id: Date.now(),
        kind: 'burst',
        detail: '10:00 AM Tatkal Burst! Absorbed +12 concurrent requests into durable queue without overloading downstream DB workers.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const processWorkerTick = () => {
    if (qDepth <= 0) return;
    const batch = Math.min(3, qDepth);
    setQDepth((d) => d - batch);
    setQProcessed((p) => p + batch);
    setQLogs((prev) => [
      {
        id: Date.now(),
        kind: 'process',
        detail: `Stateless worker pool drained ${batch} job(s) at steady DB-safe concurrency, verified idempotency key, and committed offsets.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const injectPoisonPill = () => {
    setQDlq((d) => d + 1);
    setQLogs((prev) => [
      {
        id: Date.now(),
        kind: 'dlq',
        detail: 'Malformed payload failed 5 visibility-timeout retries -> Isolated into Dead-Letter Queue (DLQ) so healthy jobs never stall!',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const replayDlq = () => {
    if (qDlq <= 0) return;
    const count = qDlq;
    setQDlq(0);
    setQDepth((d) => d + count);
    setQLogs((prev) => [
      {
        id: Date.now(),
        kind: 'replay',
        detail: `Bug fixed & deployed! Replayed ${count} DLQ message(s) cleanly back onto the main processing queue.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  // Compute Mock Interview score across phases
  const answeredCount = Object.keys(selectedOptions).length;
  const totalScore = useMemo(() => {
    return activeMock.phases.reduce((sum, phase, idx) => {
      const chosenId = selectedOptions[idx];
      const opt = phase.options.find((o) => o.id === chosenId);
      return sum + (opt?.points ?? 0);
    }, 0);
  }, [activeMock.phases, selectedOptions]);

  const verdict = getHiringVerdict(totalScore);
  const currentPhase = activeMock.phases[activePhaseIdx];
  const currentSelectedOptId = selectedOptions[activePhaseIdx];
  const currentSelectedOpt = currentPhase?.options.find((o) => o.id === currentSelectedOptId);

  return (
    <div className="space-y-6">
      {/* Header & 3-Track Switcher */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Production Architectures · Async Protocols · Mock Interview Loop
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Real-World Systems, Database Design & Staff Interview Simulator
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Zepto/Blinkit/Instamart, IRCTC, BookMyShow, Flights/GDS, NASDAQ/NSE/BSE, Zerodha,
            ChatGPT/Gemini, Instagram, WhatsApp, Uber, Teams/Slack, 5G Telecom, Google Search &amp; Internet `www.com` — with DB DDL &amp; live Webhooks/WebSockets/Enqueue labs.
          </p>
        </div>

        <SegmentedTabBar
          ariaLabel="Real-world architecture lab tracks"
          activeTab={track}
          onChange={setTrack}
          wrap
          tabs={[
            {
              id: 'blueprints',
              label: `${REAL_WORLD_SYSTEM_BLUEPRINTS.length} Real-World Blueprints + DB`,
              count: REAL_WORLD_SYSTEM_BLUEPRINTS.length,
            },
            {
              id: 'comm-lab',
              label: 'Webhooks, WebSockets & Enqueue',
              count: COMM_ARCHITECTURE_PRIMITIVES.length,
            },
            {
              id: 'mock-interview',
              label: 'Mock Interview Loop (45m)',
              count: SYSTEM_DESIGN_MOCK_INTERVIEWS.length,
            },
          ]}
        />
      </div>

      {/* ====================================================================
          TRACK 1: 16 REAL-WORLD SYSTEM DESIGN BLUEPRINTS + DB-LEVEL SCHEMAS
         ==================================================================== */}
      {track === 'blueprints' && (
        <div className="space-y-5">
          {/* Domain Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {REAL_WORLD_DOMAIN_META.map((dom) => {
              const active = dom.id === domainFilter;
              return (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => {
                    setDomainFilter(dom.id);
                    const nextList =
                      dom.id === 'all'
                        ? REAL_WORLD_SYSTEM_BLUEPRINTS
                        : REAL_WORLD_SYSTEM_BLUEPRINTS.filter((b) => b.domain === dom.id);
                    if (nextList.length > 0 && !nextList.some((b) => b.id === selectedBlueprintId)) {
                      setSelectedBlueprintId(nextList[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {dom.label}
                </button>
              );
            })}
          </div>

          {/* System Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {filteredBlueprints.map((bp) => {
              const selected = bp.id === activeBlueprint.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedBlueprintId(bp.id)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {bp.shortTitle}
                    </span>
                    <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 shrink-0">
                      {bp.dbTables.length} tables
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {bp.scaleBadge}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {bp.commPatterns.join(' · ')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Blueprint Header & Quick Jump to Mock Interview */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-sky-700 dark:text-sky-400">
                  <span>{activeBlueprint.scaleBadge}</span>
                  <span>·</span>
                  <span>Protocols: {activeBlueprint.commPatterns.join(' + ')}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {activeBlueprint.title}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  {activeBlueprint.simpleEnglish}
                </p>
              </div>

              {matchingMockForBlueprint && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMock(matchingMockForBlueprint.id);
                    setTrack('mock-interview');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 shrink-0"
                >
                  <Award className="w-4 h-4" />
                  Practice in 45m Mock Interview
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Capacity Numbers Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {activeBlueprint.capacityNumbers.map((item) => (
                <div
                  key={item.metric}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50"
                >
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {item.metric}
                  </div>
                  <div className="text-sm font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Flow Summary */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                End-to-End Request Pipeline
              </div>
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeBlueprint.architectureSummary}
              </p>
            </div>
          </div>

          {/* Animated 5-Node SVG DFD */}
          <BlueprintAnimatedDfd blueprint={activeBlueprint} />

          {/* Interactive 10-Minute Dark-Store SLA Simulator when Zepto/Blinkit/Instamart is selected */}
          {activeBlueprint.id === 'zepto-blinkit-instamart' && <QuickCommerceLiveSimulator />}

          {/* Core Algorithms + Hardest Bottleneck & Fix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Core Production Algorithms & Patterns
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeBlueprint.coreAlgorithms.map((algo, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{algo}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-amber-200 dark:border-amber-900/70 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-3">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Hardest Production Failure Mode & Staff Fix
              </h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeBlueprint.bottleneckAndFix}
              </p>
            </div>
          </div>

          {/* Complete DB-Level System Design Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Database-Level Architecture, Sharding & DDL
                </p>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Storage Engine, Partition Keys & Atomic Schema Design
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeBlueprint.dbDesignSummary}
            </p>

            {/* Entity Table Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeBlueprint.dbTables.map((table) => (
                <div
                  key={table.tableName}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {table.tableName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {table.engine}
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-sky-700 dark:text-sky-400 bg-sky-50/40 dark:bg-sky-950/20">
                    Shard / Partition Key: {table.partitionOrShardKey}
                  </div>
                  <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                    {table.columns.map((col) => (
                      <div
                        key={col.name}
                        className="px-3.5 py-1.5 flex items-center justify-between gap-2 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {col.key && (
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold shrink-0 ${
                                col.key === 'PK'
                                  ? 'border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50'
                                  : col.key === 'SHARD'
                                    ? 'border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50'
                                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                              }`}
                            >
                              {col.key}
                            </span>
                          )}
                          <span className="text-slate-900 dark:text-slate-100 truncate">
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Production DDL / Query Snippet */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Production SQL / Atomic Storage Blueprint
                </span>
                <CopyButton text={activeBlueprint.dbDdlSnippet} label="Copy SQL" />
              </div>
              <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-950/[0.02] dark:bg-slate-950 overflow-x-auto">
                <code>{activeBlueprint.dbDdlSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TRACK 2: WEBHOOKS, WEBSOCKETS & ENQUEUE INTERACTIVE PROTOCOL LAB
         ==================================================================== */}
      {track === 'comm-lab' && (
        <div className="space-y-5">
          {/* Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {COMM_ARCHITECTURE_PRIMITIVES.map((prim) => {
              const selected = prim.id === activeComm.id;
              const Icon =
                prim.id === 'webhook' ? Webhook : prim.id === 'websocket' ? Radio : Layers;
              return (
                <button
                  key={prim.id}
                  type="button"
                  onClick={() => setSelectedCommId(prim.id)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    {prim.shortTitle}
                  </div>
                  <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 mt-1">
                    {prim.direction}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {prim.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Live Interactive Sandbox for Selected Primitive */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Interactive Protocol Failure & Reliability Sandbox
                </p>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeComm.title}
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {activeComm.direction}
              </span>
            </div>

            {/* SANDBOX A: WEBHOOKS */}
            {activeComm.id === 'webhook' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={fireValidWebhook}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Fire Valid Event (HMAC)
                  </button>
                  <button
                    type="button"
                    onClick={fireDuplicateWebhook}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Send Duplicate Retry (Idempotency)
                  </button>
                  <button
                    type="button"
                    onClick={fireTamperedWebhook}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-800 dark:text-rose-300 hover:border-rose-500"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Tamper Signature (401)
                  </button>
                  <button
                    type="button"
                    onClick={fireOutageWebhook}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:border-amber-500"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Simulate 503 Outage -&gt; DLQ
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">ACCEPTED (200)</div>
                    <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                      {whDelivered}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">DEDUPED SAFE</div>
                    <div className="text-lg font-semibold text-sky-700 dark:text-sky-400">
                      {whDeduped}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">BLOCKED SPOOF (401)</div>
                    <div className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                      {whRejected}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">DEAD-LETTER (DLQ)</div>
                    <div className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                      {whDlq}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                  {whLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-3.5 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 bg-slate-50/40 dark:bg-slate-950/40"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          [{log.eventId}] {log.action}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">{log.detail}</div>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-semibold shrink-0 ${
                          log.outcome === 'accepted'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : log.outcome === 'deduped'
                              ? 'text-sky-700 dark:text-sky-400'
                              : log.outcome === 'rejected'
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {log.httpStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SANDBOX B: WEBSOCKETS */}
            {activeComm.id === 'websocket' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openSocket}
                    disabled={wsStatus === 'CONNECTED'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 disabled:opacity-40"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Open Socket (101)
                  </button>
                  <button
                    type="button"
                    onClick={sendWsFrame}
                    disabled={wsStatus !== 'CONNECTED'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Live Frame
                  </button>
                  <button
                    type="button"
                    onClick={pingWs}
                    disabled={wsStatus !== 'CONNECTED'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Ping / Pong Heartbeat
                  </button>
                  <button
                    type="button"
                    onClick={dropAndReconnectWs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Drop Tunnel (Jitter Reconnect + Replay)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWsStatus('CLOSED')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-800 dark:text-rose-300"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close Socket
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono tabular-nums">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">SOCKET STATE</div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${
                        wsStatus === 'CONNECTED'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : wsStatus === 'RECONNECTING'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {wsStatus}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">LAST ACK CURSOR</div>
                    <div className="text-sm font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                      seq #{wsSeq}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">SEAMLESS REPLAYS</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {wsReconnects}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                  {wsLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-3.5 py-2.5 text-xs space-y-0.5 bg-slate-50/40 dark:bg-slate-950/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {log.frame}
                        </span>
                        <span className="text-[10px] text-sky-700 dark:text-sky-400">
                          {log.direction}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">{log.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SANDBOX C: ENQUEUE & TRANSACTIONAL OUTBOX */}
            {activeComm.id === 'enqueue' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={enqueueSingleJob}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enqueue 1 Job (Outbox)
                  </button>
                  <button
                    type="button"
                    onClick={burstSpikeJobs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Simulate 12x Tatkal Burst
                  </button>
                  <button
                    type="button"
                    onClick={processWorkerTick}
                    disabled={qDepth === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 disabled:opacity-40"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Worker Drain Tick (3 jobs)
                  </button>
                  <button
                    type="button"
                    onClick={injectPoisonPill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-800 dark:text-rose-300"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Inject Poison Pill (-&gt; DLQ)
                  </button>
                  <button
                    type="button"
                    onClick={replayDlq}
                    disabled={qDlq === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Replay DLQ
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">OUTBOX COMMITTED</div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {qOutboxCommitted}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">LIVE QUEUE DEPTH</div>
                    <div className="text-lg font-semibold text-sky-700 dark:text-sky-400">
                      {qDepth}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">WORKERS COMPLETED</div>
                    <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                      {qProcessed}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <div className="text-[10px] text-slate-500">DLQ ISOLATED</div>
                    <div className="text-lg font-semibold text-rose-700 dark:text-rose-400">
                      {qDlq}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                  {qLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-950/40"
                    >
                      <span className="font-mono font-semibold uppercase text-[10px] text-sky-700 dark:text-sky-400 mr-2">
                        [{log.kind}]
                      </span>
                      {log.detail}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plain-English + Technical Definition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Plain-English Mental Model
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeComm.simpleEnglish}
              </p>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Production Systems Architecture
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeComm.technicalDefinition}
              </p>
            </div>
          </div>

          {/* 4-Step Protocol Wire Sequence */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              End-to-End Wire Lifecycle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeComm.protocolDiagramSteps.map((s) => (
                <div
                  key={s.step}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-sky-700 dark:text-sky-400">
                    <span>STEP {s.step}</span>
                    <span>{s.actor}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {s.action}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* When to Use / When Not to Use / Reliability Guarantees */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <h5 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                When to Use {activeComm.shortTitle}
              </h5>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeComm.whenToUse.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <h5 className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                When NOT to Use
              </h5>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeComm.whenNotToUse.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <h5 className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Production Reliability Rules
              </h5>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeComm.reliabilityGuarantees.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Production Code Blueprint */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Production Reference Implementation
              </span>
              <CopyButton text={activeComm.productionCode} label="Copy Code" />
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
              <code>{activeComm.productionCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ====================================================================
          TRACK 3: REALISTIC 45-MINUTE SYSTEM DESIGN MOCK INTERVIEW SIMULATOR
         ==================================================================== */}
      {track === 'mock-interview' && (
        <div className="space-y-5">
          {/* Mock Problem Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SYSTEM_DESIGN_MOCK_INTERVIEWS.map((mock) => {
              const selected = mock.id === activeMock.id;
              return (
                <button
                  key={mock.id}
                  type="button"
                  onClick={() => handleSelectMock(mock.id)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {mock.shortTitle}
                  </div>
                  <div className="text-[10px] font-mono text-sky-700 dark:text-sky-400 mt-1">
                    {mock.difficulty} · {mock.durationMinutes} min
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {mock.companyStyle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interview Room Top Control Bar (Timer + Progress + Study Blueprint Link) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                {activeMock.companyStyle} · {activeMock.difficulty}
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {activeMock.title}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* 45:00 Live Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatClock(timerSeconds)}
                </span>
                <button
                  type="button"
                  onClick={() => setTimerRunning((r) => !r)}
                  className="text-xs font-mono text-sky-700 dark:text-sky-400 hover:underline pl-1"
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(activeMock.durationMinutes * 60);
                  }}
                  aria-label="Reset interview timer"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
                Score: <strong className="text-slate-900 dark:text-slate-100">{totalScore}</strong>/100 ({answeredCount}/5)
              </div>

              <button
                type="button"
                onClick={() => handleJumpToBlueprint(activeMock.relatedBlueprintId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-400"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Study Blueprint &amp; DB
              </button>
            </div>
          </div>

          {/* 5-Phase Interview Stepper + Rubric Tab */}
          <div className="flex flex-wrap gap-2">
            {activeMock.phases.map((phase, idx) => {
              const answered = Boolean(selectedOptions[idx]);
              const isCurrent = activePhaseIdx === idx;
              return (
                <button
                  key={phase.phaseNumber}
                  type="button"
                  onClick={() => setActivePhaseIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    isCurrent
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                      : answered
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  P{phase.phaseNumber}: {phase.phaseName.split(' ')[0]} {answered ? '✓' : ''}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setActivePhaseIdx(activeMock.phases.length)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                activePhaseIdx === activeMock.phases.length
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              Final Rubric Scorecard
            </button>
          </div>

          {/* ACTIVE INTERVIEW PHASE DIALOGUE */}
          {activePhaseIdx < activeMock.phases.length && currentPhase && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left 2 Columns: Interviewer Prompt & Candidate Decision Choices */}
              <div className="lg:col-span-2 space-y-4">
                {activePhaseIdx === 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      Interviewer Opening Brief
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      &ldquo;{activeMock.openingPrompt}&rdquo;
                    </p>
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                      Phase {currentPhase.phaseNumber} of 5 · {currentPhase.phaseName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Target Window: {currentPhase.timeBudget}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                    &ldquo;{currentPhase.interviewerQuestion}&rdquo;
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Interviewer Cue: {currentPhase.contextClue}
                  </p>

                  {/* 4 Selectable Architectural Decisions */}
                  <div className="space-y-2.5 pt-1">
                    {currentPhase.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isChosen = currentSelectedOptId === opt.id;
                      const isBest = opt.points === 20;
                      const reveal = Boolean(currentSelectedOptId);

                      let borderStyle =
                        'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-700';
                      if (reveal && isChosen) {
                        borderStyle = signalTone(opt.signal);
                      } else if (reveal && isBest) {
                        borderStyle =
                          'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20';
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [activePhaseIdx]: opt.id,
                            }))
                          }
                          className={`w-full p-3.5 rounded-xl border text-left transition-colors ${borderStyle}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                              <span className="font-mono font-bold text-sky-700 dark:text-sky-400 shrink-0 mt-0.5">
                                {letter}.
                              </span>
                              <span>{opt.label}</span>
                            </div>
                            {reveal && (isChosen || isBest) && (
                              <span className="text-[10px] font-mono font-semibold shrink-0 tabular-nums">
                                {opt.signal} ({opt.points}/20)
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Interviewer Follow-Up Critique */}
                  {currentSelectedOpt && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${signalTone(
                        currentSelectedOpt.signal
                      )}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-semibold">
                        <span>
                          Interviewer Evaluation: {currentSelectedOpt.signal} (+
                          {currentSelectedOpt.points} / 20 pts)
                        </span>
                        <button
                          type="button"
                          onClick={() => setActivePhaseIdx((p) => p + 1)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90"
                        >
                          {activePhaseIdx < activeMock.phases.length - 1
                            ? 'Next Phase'
                            : 'View Final Rubric Scorecard'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {currentSelectedOpt.interviewerFeedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Candidate Whiteboard Scratchpad + Toggleable Hints */}
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="candidate-whiteboard"
                      className="text-xs font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Candidate Whiteboard Scratchpad
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      Phase {currentPhase.phaseNumber} notes
                    </span>
                  </div>
                  <textarea
                    id="candidate-whiteboard"
                    rows={8}
                    value={whiteboardNotes[activePhaseIdx] ?? ''}
                    onChange={(e) =>
                      setWhiteboardNotes((prev) => ({
                        ...prev,
                        [activePhaseIdx]: e.target.value,
                      }))
                    }
                    placeholder="Sketch your capacity math, API contract, shard keys, or edge cases before locking in your answer..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setShowHints((h) => !h)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-1.5">
                      {showHints ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      Interviewer Whiteboard Hints
                    </span>
                    <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400">
                      {showHints ? 'Hide' : 'Reveal'}
                    </span>
                  </button>
                  {showHints && (
                    <ul className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {activeMock.whiteboardHints.map((hint, i) => (
                        <li key={i}>• {hint}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FINAL HIRING RUBRIC SCORECARD */}
          {activePhaseIdx === activeMock.phases.length && (
            <div className="space-y-4">
              <div className={`p-5 rounded-xl border space-y-2 ${verdict.toneClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <h4 className="text-base font-semibold">{verdict.title}</h4>
                  </div>
                  <div className="text-xl font-mono font-bold tabular-nums">
                    {totalScore} / 100
                  </div>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {verdict.summary}
                </p>
              </div>

              {/* Per-Phase Breakdown Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Phase-by-Phase Hiring Committee Breakdown
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeMock.phases.map((phase, idx) => {
                    const chosen = phase.options.find((o) => o.id === selectedOptions[idx]);
                    const best = phase.options.find((o) => o.points === 20);
                    return (
                      <div key={phase.phaseNumber} className="p-4 space-y-1.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            Phase {phase.phaseNumber}: {phase.phaseName}
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                            {chosen ? `${chosen.signal} (${chosen.points}/20)` : 'Not Answered (0/20)'}
                          </span>
                        </div>
                        {chosen && chosen.points < 20 && best && (
                          <div className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                            <strong>Staff Target Answer:</strong> {best.label}
                          </div>
                        )}
                        {whiteboardNotes[idx]?.trim() && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                            Your Notes: {whiteboardNotes[idx]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model Staff Wrap-Up Checklist */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Model Staff / Principal Architecture Checklist (Final 5-Min Wrap-Up)
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeMock.modelStaffChecklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectMock(activeMock.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retake This Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = SYSTEM_DESIGN_MOCK_INTERVIEWS.findIndex(
                        (m) => m.id === activeMock.id
                      );
                      const nextMock =
                        SYSTEM_DESIGN_MOCK_INTERVIEWS[
                          (currIdx + 1) % SYSTEM_DESIGN_MOCK_INTERVIEWS.length
                        ];
                      handleSelectMock(nextMock.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
                  >
                    Next Mock Interview
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
