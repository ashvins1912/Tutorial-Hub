import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Filter,
  GitBranch,
  Layers,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  DATA_ENG_AI_DB_TOPICS,
  DATA_ENG_PILLAR_META,
  HYBRID_RAG_CORPUS,
  HYBRID_RAG_QUERIES,
  type DataEngDbTopic,
  type DataEngPillarId,
} from '../../data/dataEngAndAiDbData';
import { CopyButton, SegmentedTabBar } from '../ui';

type LabMode = 'topics-guide' | 'cursor-chunk-sim' | 'cdc-wap-sim' | 'ai-rag-sql-sim';
type ChunkStrategy = 'offset' | 'cursor' | 'keyset-batch';

interface CdcEvent {
  lsn: number;
  op: 'INSERT' | 'UPDATE' | 'DELETE' | 'CORRUPT';
  customerId: number;
  name: string;
  city: string;
  plan: string;
  detail: string;
}

interface Scd2Row {
  sk: number;
  customerId: number;
  name: string;
  city: string;
  plan: string;
  validFrom: string;
  validTo: string;
  isCurrent: boolean;
}

/* ============================================================================
   SUB-COMPONENT: ANIMATED 5-NODE SVG DFD FOR DATA ENG & AI DB TOPICS
   ============================================================================ */

function DataEngAnimatedDfd({ topic }: { topic: DataEngDbTopic }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [packetProgress, setPacketProgress] = useState(0.5);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    setStepIdx(0);
    setPacketProgress(0);
  }, [topic.id]);

  useEffect(() => {
    if (!isPlaying) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % topic.dfdSteps.length);
      setPacketProgress(0);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [isPlaying, topic.dfdSteps.length, topic.id]);

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
  }, [isPlaying, stepIdx, topic.id]);

  const currentStep = topic.dfdSteps[stepIdx] ?? topic.dfdSteps[0];
  const nodeById = useMemo(
    () => new Map(topic.dfdNodes.map((n) => [n.id, n])),
    [topic.dfdNodes]
  );

  const primaryEdge =
    topic.dfdEdges.find((e) => currentStep.activeEdgeIds.includes(e.id)) ?? topic.dfdEdges[0];
  const fromNode = primaryEdge ? nodeById.get(primaryEdge.from) : undefined;
  const toNode = primaryEdge ? nodeById.get(primaryEdge.to) : undefined;
  const px = fromNode && toNode ? fromNode.x + (toNode.x - fromNode.x) * packetProgress : 0;
  const py = fromNode && toNode ? fromNode.y + (toNode.y - fromNode.y) * packetProgress : 0;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Animated Internal Data Flow Diagram
          </p>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Step {currentStep.step} of {topic.dfdSteps.length}: {currentStep.title}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => (p - 1 + topic.dfdSteps.length) % topic.dfdSteps.length);
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
              setStepIdx((p) => (p + 1) % topic.dfdSteps.length);
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

      <div className="p-4 bg-slate-50/80 dark:bg-slate-950/70 overflow-x-auto">
        <svg
          viewBox="0 0 680 220"
          className="w-full min-w-[560px] h-auto max-h-[250px]"
          role="img"
          aria-label={`${topic.shortTitle} animated internal data flow`}
        >
          <defs>
            <marker
              id={`de-arrow-off-${topic.id}`}
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
              id={`de-arrow-on-${topic.id}`}
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

          {topic.dfdEdges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const isActive = currentStep.activeEdgeIds.includes(edge.id);
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.hypot(dx, dy) || 1;
            const x1 = from.x + (dx / dist) * 54;
            const y1 = from.y + (dy / dist) * 24;
            const x2 = to.x - (dx / dist) * 58;
            const y2 = to.y - (dy / dist) * 24;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 - 12;

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth={isActive ? 2.6 : 1.5}
                  strokeDasharray={isActive ? '6 4' : undefined}
                  markerEnd={`url(#de-arrow-${isActive ? 'on' : 'off'}-${topic.id})`}
                  className={
                    isActive
                      ? 'stroke-sky-600 dark:stroke-sky-400'
                      : 'stroke-slate-300 dark:stroke-slate-700'
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

          {topic.dfdNodes.map((node) => {
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

          {fromNode && toNode && (
            <g transform={`translate(${px}, ${py})`}>
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

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap gap-2">
          {topic.dfdSteps.map((s, idx) => (
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
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {s.step}. {s.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              Plain-English Walkthrough
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.plainEnglish}
            </p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="font-mono text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1">
              Engine Internals Detail
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
   MAIN COMPONENT: DATA ENGINEERING, CURSORS/CHUNK FETCH & AI DATABASES STUDIO
   ============================================================================ */

export function DataEngAndAiDatabasesLab() {
  const [labMode, setLabMode] = useState<LabMode>('topics-guide');

  // Track 1: 19-Topic Guide State
  const [pillarFilter, setPillarFilter] = useState<'all' | DataEngPillarId>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(DATA_ENG_AI_DB_TOPICS[0].id);

  // Track 2: Cursor, Pointer & Large-Data Chunk Fetch/Update Simulator State
  const [chunkStrategy, setChunkStrategy] = useState<ChunkStrategy>('keyset-batch');
  const [chunkSize, setChunkSize] = useState<number>(2000);
  const [chunkStep, setChunkStep] = useState<number>(1);
  const [concurrentInserts, setConcurrentInserts] = useState<number>(0);
  const [updatedTotal, setUpdatedTotal] = useState<number>(2000);
  const [chunkLog, setChunkLog] = useState<string[]>([
    'Initialized 10,000,000-row orders table. Ready to compare OFFSET vs Server Cursor Pointer vs Keyset Chunk Batching.',
  ]);

  // Track 3: CDC -> Medallion -> WAP & SCD Type 2 Interactive Lab State
  const [lsnCounter, setLsnCounter] = useState<number>(1042);
  const [snapshotVersion, setSnapshotVersion] = useState<number>(1);
  const [bronzeEvents, setBronzeEvents] = useState<CdcEvent[]>([
    {
      lsn: 1041,
      op: 'INSERT',
      customerId: 101,
      name: 'Maya Patel',
      city: 'NYC',
      plan: 'FREE',
      detail: 'Initial signup captured from PostgreSQL WAL (pgoutput).',
    },
    {
      lsn: 1042,
      op: 'INSERT',
      customerId: 102,
      name: 'Liam Chen',
      city: 'London',
      plan: 'PRO',
      detail: 'Initial Pro customer captured from WAL.',
    },
  ]);
  const [wapStagedEvents, setWapStagedEvents] = useState<CdcEvent[]>([]);
  const [wapAuditState, setWapAuditState] = useState<'IDLE' | 'PASSED' | 'BLOCKED'>('IDLE');
  const [wapAuditNote, setWapAuditNote] = useState<string>(
    'Trigger OLTP changes to populate Bronze -> stage into isolated WAP branch -> Audit before atomic Publish!'
  );
  const [scd2Rows, setScd2Rows] = useState<Scd2Row[]>([
    {
      sk: 1,
      customerId: 101,
      name: 'Maya Patel',
      city: 'NYC',
      plan: 'FREE',
      validFrom: '2026-01-10',
      validTo: '9999-12-31',
      isCurrent: true,
    },
    {
      sk: 2,
      customerId: 102,
      name: 'Liam Chen',
      city: 'London',
      plan: 'PRO',
      validFrom: '2026-02-04',
      validTo: '9999-12-31',
      isCurrent: true,
    },
  ]);

  // Track 4: AI Hybrid Search (BM25 + HNSW Vector + RRF) & Text-to-SQL Semantic Layer State
  const [selectedRagQueryId, setSelectedRagQueryId] = useState<string>(HYBRID_RAG_QUERIES[0].id);
  const [ragTenantFilter, setRagTenantFilter] = useState<'all' | 'acme-fin' | 'health-corp' | 'travel-ops'>(
    'travel-ops'
  );
  const [ragSearchMode, setRagSearchMode] = useState<'hybrid' | 'vector' | 'bm25'>('hybrid');
  const [efSearch, setEfSearch] = useState<number>(80);
  const [semanticGuardMode, setSemanticGuardMode] = useState<'semantic-safe' | 'raw-unsafe'>(
    'semantic-safe'
  );

  const filteredTopics = useMemo(
    () =>
      pillarFilter === 'all'
        ? DATA_ENG_AI_DB_TOPICS
        : DATA_ENG_AI_DB_TOPICS.filter((t) => t.pillar === pillarFilter),
    [pillarFilter]
  );

  const activeTopic =
    DATA_ENG_AI_DB_TOPICS.find((t) => t.id === selectedTopicId) ??
    filteredTopics[0] ??
    DATA_ENG_AI_DB_TOPICS[0];

  /* --- Track 2 Derived Telemetry (10M Row Table Simulation) --- */
  const cursorRowId = chunkStep * chunkSize;
  const pageNumber = Math.floor(cursorRowId / 120); // ~120 tuples per 8KB heap page
  const slotOffset = (cursorRowId % 120) + 1;
  const rowsDiscardedThisFetch =
    chunkStrategy === 'offset' ? Math.max(0, (chunkStep - 1) * chunkSize) : 0;
  const estLatencyMs =
    chunkStrategy === 'offset'
      ? Math.round(12 + rowsDiscardedThisFetch * 0.018)
      : chunkStrategy === 'cursor'
        ? Math.round(4 + chunkSize * 0.004)
        : Math.round(6 + chunkSize * 0.005);
  const clientRamMb = (chunkSize * 0.0018).toFixed(1);
  const driftDetected = chunkStrategy === 'offset' && concurrentInserts > 0;
  const snapshotPinRisk = chunkStrategy === 'cursor' && chunkStep >= 6;

  const liveChunkSql =
    chunkStrategy === 'offset'
      ? `SELECT order_id, user_id, amount_cents\nFROM orders\nORDER BY created_at DESC\nOFFSET ${(chunkStep - 1) * chunkSize} LIMIT ${chunkSize}; -- Scans & throws away ${rowsDiscardedThisFetch.toLocaleString()} rows!`
      : chunkStrategy === 'cursor'
        ? `-- Stateful Server Portal holding MVCC Snapshot (ctid = (${pageNumber},${slotOffset}))\nFETCH FORWARD ${chunkSize} FROM orders_export_cur;`
        : `-- Stateless O(log N) Keyset Seek + SKIP LOCKED Batch Update!\nWITH batch AS (\n  SELECT order_id FROM orders\n  WHERE order_id > ${(chunkStep - 1) * chunkSize}\n  ORDER BY order_id ASC LIMIT ${chunkSize}\n  FOR UPDATE SKIP LOCKED\n)\nUPDATE orders o SET normalized = TRUE\nFROM batch b WHERE o.order_id = b.order_id\nRETURNING MAX(o.order_id) AS next_cursor_id;`;

  const handleFetchNextChunk = (isUpdate: boolean) => {
    const nextStep = chunkStep + 1;
    setChunkStep(nextStep);
    if (isUpdate) {
      setUpdatedTotal((u) => u + chunkSize);
    }
    const actionLabel = isUpdate ? 'BATCH UPDATE' : 'CHUNK FETCH';
    const nextOffset = (nextStep - 1) * chunkSize;
    const msg =
      chunkStrategy === 'offset'
        ? `[${actionLabel} #${nextStep}] OFFSET ${nextOffset.toLocaleString()} scanned & discarded ${nextOffset.toLocaleString()} rows (${Math.round(12 + nextOffset * 0.018)}ms)!${concurrentInserts > 0 ? ' WARNING: Concurrent insert shifted page boundaries -> duplicate/skipped rows!' : ''}`
        : chunkStrategy === 'cursor'
          ? `[${actionLabel} #${nextStep}] Server cursor pointer moved to ctid=(${Math.floor((nextStep * chunkSize) / 120)},${((nextStep * chunkSize) % 120) + 1}). Client RAM stayed flat at ${clientRamMb}MB.${nextStep >= 6 ? ' TIP: Remember to CLOSE cursor promptly so MVCC Vacuum can run!' : ''}`
          : `[${actionLabel} #${nextStep}] B-Tree Keyset Seek (order_id > ${nextOffset.toLocaleString()}) processed ${chunkSize.toLocaleString()} rows with SKIP LOCKED in ~${estLatencyMs}ms. Checkpoint saved; zero lock stalls!`;
    setChunkLog((prev) => [msg, ...prev.slice(0, 6)]);
  };

  const handleResetChunkSim = (nextStrategy?: ChunkStrategy) => {
    if (nextStrategy) setChunkStrategy(nextStrategy);
    setChunkStep(1);
    setConcurrentInserts(0);
    setUpdatedTotal(chunkSize);
    setChunkLog([
      `Reset 10M-row table simulation (${nextStrategy ?? chunkStrategy}). Ready at Chunk #1.`,
    ]);
  };

  /* --- Track 3 CDC -> Medallion -> WAP & SCD2 Handlers --- */
  const pushCdcMutation = (kind: 'upgrade' | 'move' | 'corrupt' | 'delete') => {
    const nextLsn = lsnCounter + 1;
    setLsnCounter(nextLsn);
    let evt: CdcEvent;
    if (kind === 'upgrade') {
      evt = {
        lsn: nextLsn,
        op: 'UPDATE',
        customerId: 101,
        name: 'Maya Patel',
        city: 'NYC',
        plan: 'ENTERPRISE',
        detail: 'OLTP UPDATE: Maya upgraded FREE -> ENTERPRISE (triggers new SCD Type 2 version!).',
      };
    } else if (kind === 'move') {
      evt = {
        lsn: nextLsn,
        op: 'UPDATE',
        customerId: 102,
        name: 'Liam Chen',
        city: 'Austin',
        plan: 'PRO',
        detail: 'OLTP UPDATE: Liam moved London -> Austin (preserves historical London revenue!).',
      };
    } else if (kind === 'delete') {
      evt = {
        lsn: nextLsn,
        op: 'DELETE',
        customerId: 102,
        name: 'Liam Chen',
        city: 'Austin',
        plan: 'CHURNED',
        detail: 'OLTP HARD DELETE captured from WAL -> closes active SCD Type 2 row cleanly!',
      };
    } else {
      evt = {
        lsn: nextLsn,
        op: 'CORRUPT',
        customerId: 0,
        name: 'NULL_CORRUPT_KEY',
        city: 'UNKNOWN',
        plan: 'NEGATIVE_PRICE',
        detail: 'BUGGY UPSTREAM PAYLOAD: customer_id = NULL / negative amount landed in Bronze!',
      };
    }
    setBronzeEvents((prev) => [evt, ...prev.slice(0, 6)]);
    setWapStagedEvents((prev) => [...prev, evt]);
    setWapAuditState('IDLE');
    setWapAuditNote(
      `Captured LSN #${nextLsn} in Bronze & staged into hidden WAP branch (${wapStagedEvents.length + 1} pending). Click "Run WAP Audit Gate"!`
    );
  };

  const runWapAudit = () => {
    if (wapStagedEvents.length === 0) {
      setWapAuditNote('No pending staged rows yet — fire an OLTP mutation above first!');
      return;
    }
    const hasCorrupt = wapStagedEvents.some((e) => e.op === 'CORRUPT' || e.customerId <= 0);
    if (hasCorrupt) {
      setWapAuditState('BLOCKED');
      setWapAuditNote(
        'AUDIT FAILED! Found NULL primary key / corrupt row in staging branch. PUBLISH BLOCKED — Production Gold table remains 100% uncorrupted!'
      );
    } else {
      setWapAuditState('PASSED');
      setWapAuditNote(
        `AUDIT PASSED! Checked ${wapStagedEvents.length} staged CDC event(s): 0 NULL PKs, 0 duplicates, schema valid. Ready for atomic Iceberg PUBLISH!`
      );
    }
  };

  const quarantineBadRows = () => {
    const clean = wapStagedEvents.filter((e) => e.op !== 'CORRUPT' && e.customerId > 0);
    setWapStagedEvents(clean);
    setWapAuditState(clean.length > 0 ? 'PASSED' : 'IDLE');
    setWapAuditNote(
      'Quarantined corrupt row(s) to dead-letter table `silver.quarantine_bad_records`. Staging branch is now clean & Audit PASSED!'
    );
  };

  const publishWapToGold = () => {
    if (wapAuditState !== 'PASSED' || wapStagedEvents.length === 0) return;
    const nextSnap = snapshotVersion + 1;
    const todayStamp = `2026-11-${String(Math.min(28, 20 + nextSnap)).padStart(2, '0')}`;
    let updatedRows = [...scd2Rows];
    let nextSk = Math.max(...updatedRows.map((r) => r.sk)) + 1;

    for (const evt of wapStagedEvents) {
      // Close currently active SCD2 row for this natural customer_id
      updatedRows = updatedRows.map((row) =>
        row.customerId === evt.customerId && row.isCurrent
          ? { ...row, validTo: todayStamp, isCurrent: false }
          : row
      );
      if (evt.op !== 'DELETE') {
        updatedRows.push({
          sk: nextSk++,
          customerId: evt.customerId,
          name: evt.name,
          city: evt.city,
          plan: evt.plan,
          validFrom: todayStamp,
          validTo: '9999-12-31',
          isCurrent: true,
        });
      }
    }

    setScd2Rows(updatedRows);
    setSnapshotVersion(nextSnap);
    setWapStagedEvents([]);
    setWapAuditState('IDLE');
    setWapAuditNote(
      `ATOMIC PUBLISH COMPLETE! Iceberg main pointer fast-forwarded to Snapshot S${nextSnap}. Gold SCD Type 2 history updated with zero downtime!`
    );
  };

  /* --- Track 4 Hybrid RAG (BM25 + HNSW Vector + RRF) Live Scorer --- */
  const activeRagQuery =
    HYBRID_RAG_QUERIES.find((q) => q.id === selectedRagQueryId) ?? HYBRID_RAG_QUERIES[0];

  const ragRankedResults = useMemo(() => {
    const queryTokens = activeRagQuery.queryText
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, ' ')
      .split(' ')
      .filter((t) => t.length >= 3);

    const eligible =
      ragTenantFilter === 'all'
        ? HYBRID_RAG_CORPUS
        : HYBRID_RAG_CORPUS.filter((doc) => doc.tenant === ragTenantFilter);

    // 1. Compute BM25-like lexical score
    const scored = eligible.map((doc) => {
      const textBlob = `${doc.title} ${doc.snippet} ${doc.keywords.join(' ')}`.toLowerCase();
      let hits = 0;
      for (const tok of queryTokens) {
        if (textBlob.includes(tok)) hits += tok.includes('_') || tok.includes('-') ? 2.5 : 1.0;
      }
      const bm25Score = Number((hits / Math.max(1, queryTokens.length)).toFixed(3));
      const vectorScore = doc.semanticScores[activeRagQuery.id] ?? 0.2;
      return { doc, bm25Score, vectorScore };
    });

    // 2. Assign separate ranks for BM25 and Vector to compute true RRF (k=60)
    const byBm25 = [...scored].sort((a, b) => b.bm25Score - a.bm25Score);
    const byVec = [...scored].sort((a, b) => b.vectorScore - a.vectorScore);
    const bm25RankMap = new Map(byBm25.map((x, idx) => [x.doc.id, idx + 1]));
    const vecRankMap = new Map(byVec.map((x, idx) => [x.doc.id, idx + 1]));

    const withRrf = scored.map((item) => {
      const rLex = bm25RankMap.get(item.doc.id) ?? 99;
      const rVec = vecRankMap.get(item.doc.id) ?? 99;
      const rrf = Number((1 / (60 + rLex) + 1 / (60 + rVec)).toFixed(5));
      const sortVal =
        ragSearchMode === 'hybrid'
          ? rrf
          : ragSearchMode === 'vector'
            ? item.vectorScore
            : item.bm25Score;
      return { ...item, rLex, rVec, rrf, sortVal };
    });

    return withRrf.sort((a, b) => b.sortVal - a.sortVal);
  }, [activeRagQuery, ragTenantFilter, ragSearchMode]);

  const estimatedRecallPct = efSearch >= 200 ? '99.4%' : efSearch >= 80 ? '97.8%' : '89.2%';
  const estimatedHnswMs = efSearch >= 200 ? '14.2ms' : efSearch >= 80 ? '6.1ms' : '2.4ms';

  return (
    <div className="space-y-6">
      {/* Top Studio Header & 4-Track Switcher */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Data Engineering, Large-Data Processing &amp; AI Databases Studio
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Cursors, Chunk Fetch/Update, OLTP -&gt; OLAP Lakehouse, CDC/WAP &amp; Vector AI Search
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Master row pointers, zero-downtime 10M-row batched updates, Star/SCD2 schemas, Iceberg/Parquet/Medallion, Debezium CDC, Write-Audit-Publish, HNSW Hybrid RAG, Feature Stores &amp; Text-to-SQL Semantic Layers.
          </p>
        </div>

        <SegmentedTabBar<LabMode>
          ariaLabel="Data Engineering and AI Database studio modes"
          activeTab={labMode}
          onChange={setLabMode}
          wrap
          tabs={[
            {
              id: 'topics-guide',
              label: '19 Topics + Animated DFDs',
              count: DATA_ENG_AI_DB_TOPICS.length,
              icon: Layers,
            },
            {
              id: 'cursor-chunk-sim',
              label: 'Cursor & 10M Chunk Fetch/Update',
              icon: Database,
            },
            {
              id: 'cdc-wap-sim',
              label: 'CDC -> WAP & SCD Type 2 Lab',
              icon: GitBranch,
            },
            {
              id: 'ai-rag-sql-sim',
              label: 'AI Hybrid RAG & Text-to-SQL',
              icon: Brain,
            },
          ]}
        />
      </div>

      {/* ====================================================================
          TRACK 1: 19 COMPLETE TOPICS + ANIMATED DFDs ACROSS ALL 5 PILLARS
         ==================================================================== */}
      {labMode === 'topics-guide' && (
        <div className="space-y-5">
          {/* Pillar Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {DATA_ENG_PILLAR_META.map((pillar) => {
              const active = pillar.id === pillarFilter;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => {
                    setPillarFilter(pillar.id);
                    const next =
                      pillar.id === 'all'
                        ? DATA_ENG_AI_DB_TOPICS
                        : DATA_ENG_AI_DB_TOPICS.filter((t) => t.pillar === pillar.id);
                    if (next.length > 0 && !next.some((t) => t.id === selectedTopicId)) {
                      setSelectedTopicId(next[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {pillar.label}
                </button>
              );
            })}
          </div>

          {/* Topic Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {filteredTopics.map((topic) => {
              const selected = topic.id === activeTopic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {topic.shortTitle}
                  </div>
                  <div className="text-[10px] font-mono text-sky-700 dark:text-sky-400 mt-1 truncate">
                    {topic.complexityOrScale}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Topic Header & Definitions */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                {activeTopic.complexityOrScale}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                {activeTopic.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Plain-English Mental Model
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeTopic.simpleEnglish}
                </p>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Technical Architecture Definition
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeTopic.technicalDefinition}
                </p>
              </div>
            </div>
          </div>

          {/* Animated 5-Node SVG DFD */}
          <DataEngAnimatedDfd topic={activeTopic} />

          {/* When to Use / When NOT to Use / Production Pitfall */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                When to Use
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeTopic.whenToUse.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                When NOT to Use
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeTopic.whenNotToUse.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="border border-amber-200 dark:border-amber-900/70 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Production Pitfall &amp; Staff Fix
              </h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeTopic.pitfallAndFix}
              </p>
            </div>
          </div>

          {/* Copyable SQL / Code Blueprint */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                {activeTopic.codeLanguageLabel}
              </span>
              <CopyButton text={activeTopic.sqlOrCodeSnippet} label="Copy SQL" />
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
              <code>{activeTopic.sqlOrCodeSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ====================================================================
          TRACK 2: INTERACTIVE CURSOR, POINTER & 10M-ROW CHUNK FETCH/UPDATE LAB
         ==================================================================== */}
      {labMode === 'cursor-chunk-sim' && (
        <div className="space-y-5">
          {/* Strategy Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'offset' as ChunkStrategy,
                title: '1. Naive OFFSET / LIMIT',
                badge: 'O(N) Discard · Page Drift Bug',
                desc: 'Scans and throws away every previous row on each page. Collapses past 100K rows and duplicates/skips rows on live inserts!',
              },
              {
                id: 'cursor' as ChunkStrategy,
                title: '2. Server Cursor Pointer (FETCH N)',
                badge: 'O(chunk) RAM · Pins MVCC Snapshot',
                desc: 'Walks physical `ctid(page, slot)` tuple pointers sequentially in flat client RAM. Great on Read Replicas; close promptly!',
              },
              {
                id: 'keyset-batch' as ChunkStrategy,
                title: '3. Keyset Seek + SKIP LOCKED Batch',
                badge: 'O(log N) Seek · Zero Lock Stall',
                desc: 'Production gold standard for 10M+ row chunk fetches & live table backfills: resumable checkpoint, zero drift, bounded WAL.',
              },
            ].map((item) => {
              const active = chunkStrategy === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleResetChunkSim(item.id)}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-mono text-sky-700 dark:text-sky-400 mt-1">
                    {item.badge}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Interactive Controls & Live Metrics */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFetchNextChunk(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
                >
                  <Play className="w-3.5 h-3.5" />
                  Fetch Next Chunk ({chunkSize.toLocaleString()} rows)
                </button>
                <button
                  type="button"
                  onClick={() => handleFetchNextChunk(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Run Batched Chunk UPDATE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConcurrentInserts((c) => c + 1);
                    setChunkLog((prev) => [
                      `[CONCURRENT OLTP INSERT] New order inserted at head of table! ${chunkStrategy === 'offset' ? 'OFFSET shifted all row positions -> next page will re-read duplicate rows!' : 'Keyset / Cursor snapshot immune to row-shift drift!'}`,
                      ...prev.slice(0, 6),
                    ]);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Inject Concurrent Insert
                </button>
                <button
                  type="button"
                  onClick={() => handleResetChunkSim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500">Chunk Size:</span>
                {[500, 2000, 10000].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setChunkSize(sz)}
                    className={`px-2 py-1 rounded border text-xs tabular-nums ${
                      chunkSize === sz
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sz.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Engine Telemetry Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono tabular-nums">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[10px] text-slate-500">ACTIVE POINTER</div>
                <div className="text-sm font-semibold text-sky-700 dark:text-sky-400 mt-0.5">
                  ctid({pageNumber},{slotOffset})
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[10px] text-slate-500">ROWS DISCARDED</div>
                <div
                  className={`text-sm font-semibold mt-0.5 ${
                    rowsDiscardedThisFetch > 0
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {rowsDiscardedThisFetch.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[10px] text-slate-500">CHUNK LATENCY</div>
                <div
                  className={`text-sm font-semibold mt-0.5 ${
                    estLatencyMs > 100
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {estLatencyMs} ms
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[10px] text-slate-500">CLIENT BUFFER RAM</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {clientRamMb} MB
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-[10px] text-slate-500">UPDATED TOTAL</div>
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {updatedTotal.toLocaleString()} rows
                </div>
              </div>
            </div>

            {/* Alerts for Drift or MVCC Snapshot Pinning */}
            {driftDetected && (
              <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Page Drift Detected!</strong> {concurrentInserts} concurrent insert(s) shifted row indices under `OFFSET`, causing duplicate rows across chunks. Switch to Keyset Seek (`WHERE order_id &gt; $last_id`) to guarantee zero drift!
                </span>
              </div>
            )}
            {snapshotPinRisk && (
              <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>MVCC Snapshot Pin Warning:</strong> Keeping a server-side cursor open across many slow chunks holds `xmin` open and pauses Autovacuum on primary! Run long cursor exports on a Read Replica or switch to stateless Keyset chunk commits.
                </span>
              </div>
            )}

            {/* Visual Heap Pages Strip */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Visual 8KB Table Heap Pages (12 chunks shown — hover/inspect scanned vs active pointer):
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {Array.from({ length: 12 }, (_, idx) => {
                  const n = idx + 1;
                  const isActive = n === Math.min(12, chunkStep);
                  const isPast = n < Math.min(12, chunkStep);
                  const isWastedScan = chunkStrategy === 'offset' && isPast;
                  return (
                    <div
                      key={n}
                      className={`p-2 rounded-lg border text-center font-mono text-[10px] tabular-nums transition-colors ${
                        isActive
                          ? 'border-sky-500 bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 font-bold'
                          : isWastedScan
                            ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : isPast
                              ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500'
                      }`}
                    >
                      <div>C{n}</div>
                      <div className="text-[9px] mt-0.5">
                        {isActive ? 'PTR' : isWastedScan ? 'RE-SCAN' : isPast ? 'DONE' : 'IDLE'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Generated SQL + Event Trace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    Executed SQL for Current Step #{chunkStep}
                  </span>
                  <CopyButton text={liveChunkSql} label="Copy" />
                </div>
                <pre className="p-3.5 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
                  <code>{liveChunkSql}</code>
                </pre>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col">
                <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  Execution Engine Trace Log
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs flex-1">
                  {chunkLog.map((line, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-2 text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-950/40"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TRACK 3: LIVE CDC -> MEDALLION -> WAP & SCD TYPE 2 PIPELINE LAB
         ==================================================================== */}
      {labMode === 'cdc-wap-sim' && (
        <div className="space-y-5">
          {/* Interactive Pipeline Controls */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Interactive Lakehouse Pipeline Simulator
                </p>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  OLTP WAL CDC -&gt; Bronze -&gt; Write-Audit-Publish (WAP) -&gt; Gold SCD Type 2
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                Iceberg Main Snapshot: S{snapshotVersion} · Pending WAP Stage: {wapStagedEvents.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => pushCdcMutation('upgrade')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300"
              >
                <Zap className="w-3.5 h-3.5" />
                1. OLTP Update: Maya -&gt; ENTERPRISE
              </button>
              <button
                type="button"
                onClick={() => pushCdcMutation('move')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300"
              >
                <Zap className="w-3.5 h-3.5" />
                1. OLTP Update: Liam London -&gt; Austin
              </button>
              <button
                type="button"
                onClick={() => pushCdcMutation('delete')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                1. OLTP Hard DELETE (Liam)
              </button>
              <button
                type="button"
                onClick={() => pushCdcMutation('corrupt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-800 dark:text-rose-300"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Inject Bad NULL Row (Test Audit!)
              </button>
            </div>

            {/* WAP Gate Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={runWapAudit}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-900 dark:text-amber-300"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                2. Run WAP Audit Gate
              </button>
              {wapAuditState === 'BLOCKED' && (
                <button
                  type="button"
                  onClick={quarantineBadRows}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-xs font-semibold text-rose-800 dark:text-rose-300"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Quarantine Bad Row &amp; Re-Audit
                </button>
              )}
              <button
                type="button"
                onClick={publishWapToGold}
                disabled={wapAuditState !== 'PASSED' || wapStagedEvents.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                3. Atomic PUBLISH to Gold (Fast-Forward)
              </button>
            </div>

            {/* Audit Status Banner */}
            <div
              className={`p-3.5 rounded-lg border text-xs ${
                wapAuditState === 'BLOCKED'
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                  : wapAuditState === 'PASSED'
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <strong className="font-mono uppercase mr-2">WAP GATE [{wapAuditState}]:</strong>
              {wapAuditNote}
            </div>
          </div>

          {/* Side-by-Side Bronze WAL Stream & Gold SCD Type 2 Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bronze Immutable CDC Log */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Bronze Layer: Immutable Debezium CDC Stream
                </span>
                <span className="text-[10px] font-mono text-slate-500">WAL Append-Only</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {bronzeEvents.map((ev) => (
                  <div key={ev.lsn} className="p-3 space-y-0.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span
                        className={`font-semibold ${
                          ev.op === 'CORRUPT'
                            ? 'text-rose-700 dark:text-rose-400'
                            : ev.op === 'DELETE'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-sky-700 dark:text-sky-400'
                        }`}
                      >
                        LSN #{ev.lsn} · {ev.op} · cust_id={ev.customerId || 'NULL'}
                      </span>
                      <span className="text-slate-500">
                        {ev.city} / {ev.plan}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{ev.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold SCD Type 2 Dimension Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Gold Layer: `dim_customer` (SCD Type 2 · Snapshot S{snapshotVersion})
                </span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                  {scd2Rows.length} versioned rows
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-50/80 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-3 py-2">SK</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">City</th>
                      <th className="px-3 py-2">Plan</th>
                      <th className="px-3 py-2">Valid Window</th>
                      <th className="px-3 py-2">Current</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {scd2Rows.map((row) => (
                      <tr
                        key={row.sk}
                        className={
                          row.isCurrent
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }
                      >
                        <td className="px-3 py-2 font-semibold">{row.sk}</td>
                        <td className="px-3 py-2">{row.customerId}</td>
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2">{row.city}</td>
                        <td className="px-3 py-2">{row.plan}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {row.validFrom}..{row.validTo}
                        </td>
                        <td className="px-3 py-2 font-semibold">
                          {row.isCurrent ? 'TRUE' : 'FALSE'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TRACK 4: AI HYBRID SEARCH (BM25 + HNSW + RRF) & TEXT-TO-SQL LAB
         ==================================================================== */}
      {labMode === 'ai-rag-sql-sim' && (
        <div className="space-y-5">
          {/* Part A: Interactive Hybrid RAG & Metadata Pre-Filter Simulator */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Interactive Vector ANN + BM25 Hybrid RAG Simulator
                </p>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  Test BM25 vs Cosine Vector vs Reciprocal Rank Fusion (RRF) &amp; Tenant Pre-Filtering
                </h3>
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                HNSW Recall@10: <strong className="text-emerald-700 dark:text-emerald-400">{estimatedRecallPct}</strong> · p99:{' '}
                <strong className="text-sky-700 dark:text-sky-400">{estimatedHnswMs}</strong>
              </div>
            </div>

            {/* Query Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {HYBRID_RAG_QUERIES.map((q) => {
                const active = q.id === activeRagQuery.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSelectedRagQueryId(q.id);
                      setRagTenantFilter(q.recommendedTenant);
                    }}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-sky-700 dark:text-sky-400 flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Target Tenant: {q.recommendedTenant}
                    </div>
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100 mt-1">
                      &ldquo;{q.queryText}&rdquo;
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Retrieval Mode, Tenant Pre-Filter & HNSW ef_search Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-mono text-slate-500 mr-1">Retriever:</span>
                {(
                  [
                    { id: 'hybrid', label: 'Hybrid RRF (BM25 + Vector)' },
                    { id: 'vector', label: 'Vector Only (Cosine)' },
                    { id: 'bm25', label: 'BM25 Keyword Only' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRagSearchMode(m.id)}
                    className={`px-2.5 py-1 rounded-lg border font-medium ${
                      ragSearchMode === m.id
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">SQL Metadata Filter:</span>
                {(['travel-ops', 'acme-fin', 'health-corp', 'all'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRagTenantFilter(t)}
                    className={`px-2 py-1 rounded border ${
                      ragTenantFilter === t
                        ? t === 'all'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t === 'all' ? 'NONE (Leak Risk!)' : t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500">HNSW ef_search:</span>
                {[20, 80, 200].map((ef) => (
                  <button
                    key={ef}
                    type="button"
                    onClick={() => setEfSearch(ef)}
                    className={`px-2 py-1 rounded border tabular-nums ${
                      efSearch === ef
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ef}
                  </button>
                ))}
              </div>
            </div>

            {ragTenantFilter === 'all' && (
              <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Cross-Tenant RAG Security Leak!</strong> Without SQL Metadata Pre-Filtering (`WHERE tenant_id = $tid`), confidential `health-corp` HIPAA docs and `acme-fin` ledgers leak into another customer’s LLM context window!
                </span>
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {activeRagQuery.explanation}
            </p>

            {/* Live Ranked Results Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
              {ragRankedResults.map((row, idx) => (
                <div
                  key={row.doc.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-950/30"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {row.doc.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        [{row.doc.tenant} · {row.doc.docType}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{row.doc.snippet}</p>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums shrink-0">
                    <div>
                      <div className="text-[9px] text-slate-500">BM25</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {row.bm25Score.toFixed(2)} (#{row.rLex})
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500">COSINE</div>
                      <div className="font-semibold text-sky-700 dark:text-sky-400">
                        {row.vectorScore.toFixed(2)} (#{row.rVec})
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500">RRF (k=60)</div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.rrf.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Part B: Text-to-SQL Semantic Layer vs Raw Unsafe LLM Comparator */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Text-to-SQL Governance &amp; Semantic Layer Defense
                </p>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Prompt: &ldquo;Show Q3 Net Revenue by Region for Enterprise customers&rdquo;
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSemanticGuardMode('semantic-safe')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold ${
                    semanticGuardMode === 'semantic-safe'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Governed Semantic Layer + RLS
                </button>
                <button
                  type="button"
                  onClick={() => setSemanticGuardMode('raw-unsafe')}
                  className={`px-3 py-1.5 rounded-lg border font-semibold ${
                    semanticGuardMode === 'raw-unsafe'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Raw-Schema LLM (Unsafe!)
                </button>
              </div>
            </div>

            {semanticGuardMode === 'semantic-safe' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="border border-emerald-200 dark:border-emerald-900/70 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/30 font-mono text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Generated Verified SQL (Read-Only + RLS + 5s Timeout)
                  </div>
                  <pre className="p-3.5 font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
                    <code>{`BEGIN READ ONLY;
SET LOCAL statement_timeout = '5000ms';
SET LOCAL app.current_tenant_id = 'acme-fin';

SELECT d.region,
       SUM(f.net_revenue_usd) AS net_revenue_usd
FROM gold.v_semantic_orders f
JOIN gold.dim_customer d ON f.customer_sk = d.customer_sk
WHERE f.order_date BETWEEN '2026-07-01' AND '2026-09-30'
  AND d.plan_tier = 'ENTERPRISE'
GROUP BY d.region
ORDER BY net_revenue_usd DESC
LIMIT 100;
COMMIT;`}</code>
                  </pre>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    Why This Passes Production Audit
                  </div>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li>• <strong>Canonical Metric:</strong> `net_revenue_usd` automatically subtracts refunds &amp; test accounts via Gold Semantic View.</li>
                    <li>• <strong>Exact SCD2 Surrogate Join:</strong> Uses `customer_sk` so customers who upgraded in Q4 do not distort Q3 Enterprise totals!</li>
                    <li>• <strong>Zero-Trust Security:</strong> `BEGIN READ ONLY` + AST parser + DB Row-Level Security (`app.current_tenant_id`) neutralize prompt injection completely.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className="border border-rose-200 dark:border-rose-900/70 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-rose-200 dark:border-rose-900/70 bg-rose-50/50 dark:bg-rose-950/30 font-mono text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Hallucinated Raw-Table SQL (4 Critical Bugs!)
                  </div>
                  <pre className="p-3.5 font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
                    <code>{`-- BUG 1: Queries raw OLTP primary directly (no timeout!)
-- BUG 2: Sums gross amount_cents INCLUDING cancelled/refunded orders!
-- BUG 3: Joins natural customer_id on SCD2 -> 3x fan-out inflation!
-- BUG 4: Missing tenant_id filter -> leaks ALL customers' revenue!
SELECT c.region, SUM(o.amount_cents)
FROM raw_orders_v2 o
JOIN raw_customers_history c ON o.customer_id = c.customer_id
WHERE o.created_at >= '2026-07-01'
GROUP BY c.region;`}</code>
                  </pre>
                </div>
                <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                  <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    What Goes Wrong Without a Semantic Layer
                  </div>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <li>• <strong>Metric Hallucination:</strong> LLM guesses `SUM(amount_cents)` (in cents, including refunds!) instead of true Net Revenue USD.</li>
                    <li>• <strong>SCD Fan-Out Bug:</strong> Joining raw natural `customer_id` multiplies sales by the number of historical customer rows!</li>
                    <li>• <strong>Outage &amp; Data Leak:</strong> Runs an unbounded full scan on live OLTP primary with zero tenant Row-Level Security.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
