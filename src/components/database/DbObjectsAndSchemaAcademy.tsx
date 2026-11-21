import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Code2,
  Compass,
  Cpu,
  Database,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  DB_OBJECT_AND_ASSOC_MODULES,
  DB_SCHEMA_DESIGN_TECHNIQUES,
  SQL_PROGRESSIVE_SCENARIOS,
  type DbMiniDfdEdge,
  type DbMiniDfdNode,
  type DbMiniDfdStep,
  type DbObjectCategory,
  type DbObjectModule,
  type DbObjectSimKind,
  type DbSchemaTechnique,
  type SqlProgressiveScenario,
  type SqlScenarioLevel,
} from '../../data/dbCompleteObjectsAndSchemaData';
import { CopyButton, SegmentedTabBar } from '../ui';

type AcademyTrack = 'objects-assoc' | 'sql-scenarios' | 'schema-design';
type WorkloadAdvisorGoal = 'all' | 'oltp' | 'analytics' | 'saas' | 'audit' | 'scale';

/* ============================================================================
   ANIMATED MINI-DFD ENGINE (4-STAGE SVG + requestAnimationFrame)
   ============================================================================ */

interface DbMiniDfdAnimatorProps {
  title: string;
  nodes: DbMiniDfdNode[];
  edges: DbMiniDfdEdge[];
  steps: DbMiniDfdStep[];
  resetKey: string;
}

function DbMiniDfdAnimator({ title, nodes, edges, steps, resetKey }: DbMiniDfdAnimatorProps) {
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
      }, 2500);
      return () => window.clearInterval(timer);
    }

    lastTimeRef.current = performance.now();
    let localT = 0;
    const tick = (now: number) => {
      const dt = Math.min(80, now - lastTimeRef.current);
      lastTimeRef.current = now;
      localT += dt / 2300;
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
    const m = new Map<string, DbMiniDfdNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const currentStep = steps[stepIdx] ?? steps[0];
  const activeNodes = new Set(currentStep?.activeNodeIds ?? []);
  const activeEdges = new Set(currentStep?.activeEdgeIds ?? []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Execution Pipeline Animation (DFD)
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play Flow'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => (p - 1 + steps.length) % steps.length);
              setPacketT(0.55);
            }}
            aria-label="Previous step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
              setStepIdx((p) => (p + 1) % steps.length);
              setPacketT(0.55);
            }}
            aria-label="Next step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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
            aria-label="Reset animation"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50/40 dark:bg-slate-950/40 space-y-3">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 668 220"
            className="w-full min-w-[540px] h-auto max-h-[235px]"
            role="img"
            aria-label={`Data flow diagram for ${title}`}
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
              const x1 = from.x + ux * 64;
              const y1 = from.y + uy * 26;
              const x2 = to.x - ux * 68;
              const y2 = to.y - uy * 26;
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
                    x={midX - 46}
                    y={midY - 8.5}
                    width={92}
                    height={16}
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
                    y={midY + 2}
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
              const w = 132;
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
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-5">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                Step {currentStep.step} — Simple English
              </div>
              <p className="text-slate-700 dark:text-slate-300">{currentStep.plainEnglish}</p>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
              <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 mb-1">
                Engine Internals
              </div>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                {currentStep.technicalDetail}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   LIVE INTERACTIVE FEATURE SIMULATORS (4 HANDS-ON LABS)
   ============================================================================ */

const SAMPLE_SALES_ROWS = [
  { id: 1, dept: 'Cloud', rep: 'Asha', sales: 900 },
  { id: 2, dept: 'Cloud', rep: 'Ben', sales: 900 },
  { id: 3, dept: 'Cloud', rep: 'Cara', sales: 720 },
  { id: 4, dept: 'AI', rep: 'Dev', sales: 1150 },
  { id: 5, dept: 'AI', rep: 'Elena', sales: 840 },
  { id: 6, dept: 'AI', rep: 'Farid', sales: 840 },
];

function DbFeatureInteractiveSimulator({
  simKind,
  moduleShortTitle,
}: {
  simKind: DbObjectSimKind;
  moduleShortTitle: string;
}) {
  // 1. Window Function Live Simulator
  const [partitionByDept, setPartitionByDept] = useState<boolean>(true);
  const [winFn, setWinFn] = useState<'ranking' | 'running' | 'lag'>('ranking');

  // 2. View vs Materialized View Simulator
  const [baseOrders, setBaseOrders] = useState([
    { id: 101, region: 'US', amount: 420 },
    { id: 102, region: 'EU', amount: 310 },
    { id: 103, region: 'US', amount: 280 },
  ]);
  const [matSnapshot, setMatSnapshot] = useState({ us: 700, eu: 310, syncedCount: 3 });
  const [viewTrace, setViewTrace] = useState(
    'Both Virtual View and Materialized View match right now. Insert a new order to see the Materialized View go stale until refreshed!'
  );

  // 3. Trigger & Foreign-Key Simulator
  const [fkPolicy, setFkPolicy] = useState<'RESTRICT' | 'CASCADE'>('RESTRICT');
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Asha', balance: 500 },
    { id: 2, name: 'Liam', balance: 250 },
  ]);
  const [orders, setOrders] = useState([
    { id: 901, customerId: 1, total: 120 },
  ]);
  const [auditLog, setAuditLog] = useState<string[]>([
    'INIT: Trigger trg_audit_accounts armed (BEFORE overdraft guard + AFTER JSONB audit).',
  ]);

  // 4. NoSQL Association Strategy Simulator
  const [nosqlModel, setNosqlModel] = useState<'embed' | 'reference' | 'extended'>('extended');
  const [nosqlActionResult, setNosqlActionResult] = useState(
    'Pick a NoSQL Association model and run Read vs Update Customer Name to compare round-trips and write fan-out!'
  );

  // Computed Window Function rows
  const windowComputed = useMemo(() => {
    const groups = new Map<string, typeof SAMPLE_SALES_ROWS>();
    for (const row of SAMPLE_SALES_ROWS) {
      const key = partitionByDept ? row.dept : 'ALL';
      const arr = groups.get(key) ?? [];
      arr.push(row);
      groups.set(key, arr);
    }

    const out: Array<
      (typeof SAMPLE_SALES_ROWS)[number] & {
        rowNum: number;
        rank: number;
        denseRank: number;
        runningSum: number;
        lagVal: number | null;
        lagDelta: number | null;
      }
    > = [];

    for (const [, list] of groups) {
      const sorted = [...list].sort((a, b) => b.sales - a.sales);
      let running = 0;
      let dense = 0;
      let prevSales: number | null = null;
      let lastRank = 0;

      sorted.forEach((row, idx) => {
        const rowNum = idx + 1;
        const rank = prevSales !== null && row.sales === prevSales ? lastRank : rowNum;
        if (prevSales === null || row.sales !== prevSales) {
          dense += 1;
          lastRank = rank;
        }
        running += row.sales;
        out.push({
          ...row,
          rowNum,
          rank,
          denseRank: dense,
          runningSum: running,
          lagVal: prevSales,
          lagDelta: prevSales === null ? null : row.sales - prevSales,
        });
        prevSales = row.sales;
      });
    }
    return out;
  }, [partitionByDept]);

  // View/MatView handlers
  const liveTotals = useMemo(
    () => ({
      us: baseOrders.filter((o) => o.region === 'US').reduce((s, o) => s + o.amount, 0),
      eu: baseOrders.filter((o) => o.region === 'EU').reduce((s, o) => s + o.amount, 0),
    }),
    [baseOrders]
  );

  const isMatStale = matSnapshot.syncedCount !== baseOrders.length;

  const handleInsertOrder = (region: 'US' | 'EU') => {
    const nextId = (baseOrders[baseOrders.length - 1]?.id ?? 100) + 1;
    const amt = region === 'US' ? 150 : 200;
    setBaseOrders((prev) => [...prev, { id: nextId, region, amount: amt }]);
    setViewTrace(
      `INSERT order #${nextId} (${region} $${amt}): Standard View immediately shows the new total (42ms live scan), while Materialized View stays at 1.4ms STALE snapshot!`
    );
  };

  const handleRefreshMatView = () => {
    setMatSnapshot({ us: liveTotals.us, eu: liveTotals.eu, syncedCount: baseOrders.length });
    setViewTrace(
      'REFRESH MATERIALIZED VIEW CONCURRENTLY completed! Snapshot synced via UNIQUE INDEX with zero reader downtime.'
    );
  };

  // Trigger & FK handlers
  const handleDebit = (custId: number, amount: number) => {
    const c = customers.find((x) => x.id === custId);
    if (!c) return;
    if (c.balance - amount < 0) {
      setAuditLog((prev) => [
        `BEFORE TRIGGER ABORT: Overdraft blocked on ${c.name} ($${c.balance} - $${amount} < 0). Transaction rolled back!`,
        ...prev.slice(0, 4),
      ]);
      return;
    }
    const nextBal = c.balance - amount;
    setCustomers((prev) => prev.map((x) => (x.id === custId ? { ...x, balance: nextBal } : x)));
    setAuditLog((prev) => [
      `AFTER TRIGGER AUDIT: ${c.name} balance OLD=$${c.balance} -> NEW=$${nextBal} logged atomically.`,
      ...prev.slice(0, 4),
    ]);
  };

  const handleDeleteCustomer1 = () => {
    const childCount = orders.filter((o) => o.customerId === 1).length;
    if (childCount > 0 && fkPolicy === 'RESTRICT') {
      setAuditLog((prev) => [
        `FK RESTRICT BLOCKED DELETE: Customer #1 (Asha) still has ${childCount} order(s). Orphan prevented!`,
        ...prev.slice(0, 4),
      ]);
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== 1));
    setOrders((prev) => prev.filter((o) => o.customerId !== 1));
    setAuditLog((prev) => [
      `FK CASCADE EXECUTED: Deleted Customer #1 AND automatically cascaded deletion to ${childCount} child order(s)!`,
      ...prev.slice(0, 4),
    ]);
  };

  const handleNosqlOp = (op: 'read-orders' | 'rename-customer') => {
    if (op === 'read-orders') {
      if (nosqlModel === 'embed') {
        setNosqlActionResult(
          'EMBEDDED READ: 1 single disk seek (0.8ms)! Orders + Items returned together in 1 JSON doc. Warning: grows toward 16MB if user places 10,000 orders!'
        );
      } else if (nosqlModel === 'reference') {
        setNosqlActionResult(
          'REFERENCED READ ($lookup): 2 collection probes (4.5ms) — reads orders, then probes customers index via foreignField to attach customer name.'
        );
      } else {
        setNosqlActionResult(
          'EXTENDED REFERENCE READ: 1 single disk seek (0.9ms)! Order doc already embeds { customerId, customerName } so zero $lookup join needed AND doc stays tiny!'
        );
      }
    } else {
      if (nosqlModel === 'embed') {
        setNosqlActionResult(
          'EMBEDDED UPDATE: Updated 1 user document (1 write). Zero fan-out because everything lives inside the user doc.'
        );
      } else if (nosqlModel === 'reference') {
        setNosqlActionResult(
          'REFERENCED UPDATE: Updated 1 customer document (1 write, 100% normalized consistency — zero fan-out!).'
        );
      } else {
        setNosqlActionResult(
          'EXTENDED REFERENCE UPDATE: Updated customer doc + Change Stream asynchronously fanned out name update to recent 12 order docs (eventual consistency in ~80ms).'
        );
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Interactive Database Behavior Simulator
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Live Experiment: {moduleShortTitle}
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Hands-On Playground
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. WINDOW FUNCTION LIVE SIMULATOR */}
        {simKind === 'window-fn' && (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <SegmentedTabBar<'ranking' | 'running' | 'lag'>
                ariaLabel="Window function mode"
                activeTab={winFn}
                onChange={setWinFn}
                size="xs"
                tabs={[
                  { id: 'ranking', label: 'ROW_NUMBER vs RANK vs DENSE_RANK' },
                  { id: 'running', label: 'SUM() Running Total' },
                  { id: 'lag', label: 'LAG() Previous Row Delta' },
                ]}
              />
              <button
                type="button"
                onClick={() => setPartitionByDept((p) => !p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                  partitionByDept
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                PARTITION BY dept: {partitionByDept ? 'ON' : 'OFF (Global)'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <th className="py-2 px-3">dept</th>
                    <th className="py-2 px-3">rep</th>
                    <th className="py-2 px-3">sales</th>
                    {winFn === 'ranking' && (
                      <>
                        <th className="py-2 px-3 text-sky-700 dark:text-sky-400">ROW_NUMBER()</th>
                        <th className="py-2 px-3 text-amber-700 dark:text-amber-400">RANK()</th>
                        <th className="py-2 px-3 text-emerald-700 dark:text-emerald-400">DENSE_RANK()</th>
                      </>
                    )}
                    {winFn === 'running' && (
                      <th className="py-2 px-3 text-emerald-700 dark:text-emerald-400">
                        SUM(sales) OVER (Running Total)
                      </th>
                    )}
                    {winFn === 'lag' && (
                      <>
                        <th className="py-2 px-3 text-sky-700 dark:text-sky-400">LAG(sales)</th>
                        <th className="py-2 px-3 text-emerald-700 dark:text-emerald-400">sales - LAG</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {windowComputed.map((r) => (
                    <tr key={r.id} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">{r.dept}</td>
                      <td className="py-2 px-3">{r.rep}</td>
                      <td className="py-2 px-3">${r.sales}</td>
                      {winFn === 'ranking' && (
                        <>
                          <td className="py-2 px-3 font-bold text-sky-700 dark:text-sky-400">{r.rowNum}</td>
                          <td className="py-2 px-3 font-bold text-amber-700 dark:text-amber-400">{r.rank}</td>
                          <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">{r.denseRank}</td>
                        </>
                      )}
                      {winFn === 'running' && (
                        <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                          ${r.runningSum}
                        </td>
                      )}
                      {winFn === 'lag' && (
                        <>
                          <td className="py-2 px-3 text-sky-700 dark:text-sky-400">
                            {r.lagVal === null ? 'NULL' : `$${r.lagVal}`}
                          </td>
                          <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                            {r.lagDelta === null ? '—' : `${r.lagDelta >= 0 ? '+' : ''}$${r.lagDelta}`}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Notice how all <strong>6 individual rows remain intact</strong> (unlike GROUP BY), and on tied values ($900 and $840), <code>RANK()</code> skips a number (1, 1, <strong>3</strong>) while <code>DENSE_RANK()</code> stays continuous (1, 1, <strong>2</strong>)!
            </p>
          </>
        )}

        {/* 2. VIEW VS MATERIALIZED VIEW SIMULATOR */}
        {simKind === 'view-matview' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInsertOrder('US')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                INSERT US Order ($150)
              </button>
              <button
                type="button"
                onClick={() => handleInsertOrder('EU')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                INSERT EU Order ($200)
              </button>
              <button
                type="button"
                onClick={handleRefreshMatView}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-700 text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                REFRESH MATERIALIZED VIEW CONCURRENTLY
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1.5">
                <div className="flex justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span>Standard View (v_revenue)</span>
                  <span>100% FRESH · ~42ms</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  US Revenue: <strong>${liveTotals.us}</strong> · EU Revenue: <strong>${liveTotals.eu}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Base orders scanned live: {baseOrders.length} rows
                </div>
              </div>

              <div
                className={`rounded-lg border p-3.5 space-y-1.5 ${
                  isMatStale
                    ? 'border-amber-400 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-sky-300 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20'
                }`}
              >
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Materialized View (mv_revenue)</span>
                  <span className={isMatStale ? 'text-amber-700 dark:text-amber-400' : 'text-sky-700 dark:text-sky-400'}>
                    {isMatStale ? 'STALE SNAPSHOT' : 'SYNCED'} · ~1.4ms
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  US Revenue: <strong>${matSnapshot.us}</strong> · EU Revenue: <strong>${matSnapshot.eu}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Snapshot built at {matSnapshot.syncedCount} rows (behind by {baseOrders.length - matSnapshot.syncedCount})
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {viewTrace}
            </p>
          </>
        )}

        {/* 3. TRIGGER & FOREIGN-KEY CASCADE SIMULATOR */}
        {simKind === 'trigger-fk' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDebit(1, 100)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Debit Asha -$100 (Valid)
              </button>
              <button
                type="button"
                onClick={() => handleDebit(1, 900)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Debit Asha -$900 (Test BEFORE Guard)
              </button>
              <button
                type="button"
                onClick={() => setFkPolicy((p) => (p === 'RESTRICT' ? 'CASCADE' : 'RESTRICT'))}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                FK Policy: ON DELETE {fkPolicy}
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer1}
                disabled={!customers.some((c) => c.id === 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                DELETE Customer #1
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomers([
                    { id: 1, name: 'Asha', balance: 500 },
                    { id: 2, name: 'Liam', balance: 250 },
                  ]);
                  setOrders([{ id: 901, customerId: 1, total: 120 }]);
                  setAuditLog(['RESET: Restored customers & orders.']);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs font-mono">
              <div className="lg:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  Base Tables (customers &amp; child orders)
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  {customers.map((c) => (
                    <div key={c.id}>
                      Customer #{c.id} ({c.name}): <strong>${c.balance}</strong>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-400">
                    Child Orders: {orders.length === 0 ? 'none' : orders.map((o) => `#${o.id} (cust=${o.customerId})`).join(', ')}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 space-y-1.5">
                <div className="font-bold text-sky-700 dark:text-sky-400">
                  Trigger &amp; FK Execution Trace (account_audit_log)
                </div>
                {auditLog.map((line, i) => (
                  <div key={i} className="text-[11px] text-slate-700 dark:text-slate-300">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 4. NOSQL ASSOCIATIONS SIMULATOR */}
        {simKind === 'nosql-assoc' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedTabBar<'embed' | 'reference' | 'extended'>
                ariaLabel="NoSQL association strategy"
                activeTab={nosqlModel}
                onChange={setNosqlModel}
                size="xs"
                tabs={[
                  { id: 'embed', label: '1. Embedding (Inline)' },
                  { id: 'reference', label: '2. Referencing ($lookup)' },
                  { id: 'extended', label: '3. Extended Reference' },
                ]}
              />
              <button
                type="button"
                onClick={() => handleNosqlOp('read-orders')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Simulate Hot Read (Order Feed)
              </button>
              <button
                type="button"
                onClick={() => handleNosqlOp('rename-customer')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Simulate Rare Write (Rename Customer)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">Read Round-Trips</div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {nosqlModel === 'reference' ? '2 Probes ($lookup)' : '1 Single Seek'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">16MB Doc Limit Risk</div>
                <div className="font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                  {nosqlModel === 'embed' ? 'HIGH if unbounded' : 'SAFE (Bounded)'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5">
                <div className="text-[10px] text-slate-500">Rename Write Fan-Out</div>
                <div className="font-bold text-sky-700 dark:text-sky-400 mt-0.5">
                  {nosqlModel === 'extended' ? 'Async CDC Fan-Out' : '1 Atomic Doc Write'}
                </div>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {nosqlActionResult}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT: DB OBJECTS, SQL SCENARIOS & SCHEMA DESIGN ACADEMY
   ============================================================================ */

export function DbObjectsAndSchemaAcademy() {
  const [track, setTrack] = useState<AcademyTrack>('objects-assoc');

  // Track 1 state
  const [objCat, setObjCat] = useState<'all' | DbObjectCategory>('all');
  const [selectedObjId, setSelectedObjId] = useState<string>(DB_OBJECT_AND_ASSOC_MODULES[0].id);

  // Track 2 state
  const [sqlLevel, setSqlLevel] = useState<'all' | SqlScenarioLevel>('all');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SQL_PROGRESSIVE_SCENARIOS[0].id);
  const [sqlDrafts, setSqlDrafts] = useState<Record<string, string>>({});

  // Track 3 state
  const [advisorGoal, setAdvisorGoal] = useState<WorkloadAdvisorGoal>('all');
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string>(
    DB_SCHEMA_DESIGN_TECHNIQUES[0].id
  );

  // Filtered Track 1
  const visibleObjects = useMemo(
    () =>
      objCat === 'all'
        ? DB_OBJECT_AND_ASSOC_MODULES
        : DB_OBJECT_AND_ASSOC_MODULES.filter((m) => m.category === objCat),
    [objCat]
  );

  const activeObj: DbObjectModule =
    visibleObjects.find((m) => m.id === selectedObjId) ?? visibleObjects[0];

  useEffect(() => {
    if (!visibleObjects.some((m) => m.id === selectedObjId) && visibleObjects[0]) {
      setSelectedObjId(visibleObjects[0].id);
    }
  }, [visibleObjects, selectedObjId]);

  // Filtered Track 2
  const visibleScenarios = useMemo(
    () =>
      sqlLevel === 'all'
        ? SQL_PROGRESSIVE_SCENARIOS
        : SQL_PROGRESSIVE_SCENARIOS.filter((s) => s.level === sqlLevel),
    [sqlLevel]
  );

  const activeScenario: SqlProgressiveScenario =
    visibleScenarios.find((s) => s.id === selectedScenarioId) ?? visibleScenarios[0];

  useEffect(() => {
    if (!visibleScenarios.some((s) => s.id === selectedScenarioId) && visibleScenarios[0]) {
      setSelectedScenarioId(visibleScenarios[0].id);
    }
  }, [visibleScenarios, selectedScenarioId]);

  const currentSql = sqlDrafts[activeScenario.id] ?? activeScenario.starterSql;

  const scenarioRuleResults = useMemo(
    () =>
      activeScenario.rules.map((r) => ({
        ...r,
        passed: r.test(currentSql),
      })),
    [activeScenario, currentSql]
  );
  const scenarioPassCount = scenarioRuleResults.filter((r) => r.passed).length;

  const updateSqlDraft = useCallback(
    (sql: string) => {
      setSqlDrafts((prev) => ({ ...prev, [activeScenario.id]: sql }));
    },
    [activeScenario.id]
  );

  // Filtered Track 3
  const visibleTechniques = useMemo(
    () =>
      advisorGoal === 'all'
        ? DB_SCHEMA_DESIGN_TECHNIQUES
        : DB_SCHEMA_DESIGN_TECHNIQUES.filter((t) => t.workloadMatch === advisorGoal),
    [advisorGoal]
  );

  const activeTechnique: DbSchemaTechnique =
    visibleTechniques.find((t) => t.id === selectedTechniqueId) ?? visibleTechniques[0];

  useEffect(() => {
    if (!visibleTechniques.some((t) => t.id === selectedTechniqueId) && visibleTechniques[0]) {
      setSelectedTechniqueId(visibleTechniques[0].id);
    }
  }, [visibleTechniques, selectedTechniqueId]);

  return (
    <div className="space-y-6">
      {/* Top Track Switcher */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Complete Relational &amp; Non-Relational Engineering Academy
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
            DB Views, Triggers, Windows, NoSQL Associations, SQL Scenarios &amp; Schema Design
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Master exact definitions, real-world use cases, when-to-use-what decision guides, interactive simulators, beginner-to-principal SQL practice, and 8 complete schema design techniques.
          </p>
        </div>

        <SegmentedTabBar<AcademyTrack>
          ariaLabel="Database Mastery Academy tracks"
          activeTab={track}
          onChange={setTrack}
          wrap
          tabs={[
            {
              id: 'objects-assoc',
              label: 'SQL & NoSQL Features + Assoc',
              shortLabel: 'Features & NoSQL',
              count: DB_OBJECT_AND_ASSOC_MODULES.length,
              icon: Layers,
            },
            {
              id: 'sql-scenarios',
              label: 'Beginner-to-Pro SQL Practice',
              shortLabel: 'SQL Scenarios',
              count: SQL_PROGRESSIVE_SCENARIOS.length,
              icon: Terminal,
            },
            {
              id: 'schema-design',
              label: 'DB Schema Design Techniques',
              shortLabel: 'Schema Design',
              count: DB_SCHEMA_DESIGN_TECHNIQUES.length,
              icon: Boxes,
            },
          ]}
        />
      </div>

      {/* ====================================================================
          TRACK 1: RELATIONAL & NON-RELATIONAL OBJECTS, FUNCTIONS & ASSOCIATIONS
          ==================================================================== */}
      {track === 'objects-assoc' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SegmentedTabBar<'all' | DbObjectCategory>
                ariaLabel="Filter relational vs non-relational modules"
                activeTab={objCat}
                onChange={setObjCat}
                size="xs"
                tabs={[
                  { id: 'all', label: 'All 12 Modules', count: DB_OBJECT_AND_ASSOC_MODULES.length },
                  {
                    id: 'relational',
                    label: 'Relational SQL (Views, Triggers, Windows, FK, Assoc)',
                    count: DB_OBJECT_AND_ASSOC_MODULES.filter((m) => m.category === 'relational').length,
                  },
                  {
                    id: 'non-relational',
                    label: 'Non-Relational NoSQL (Pipelines, $lookup, Embed/Ref, Graph)',
                    count: DB_OBJECT_AND_ASSOC_MODULES.filter((m) => m.category === 'non-relational').length,
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {visibleObjects.map((m) => {
                const active = m.id === activeObj.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedObjId(m.id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {m.shortTitle}
                      </span>
                      <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400">
                        {m.category === 'relational' ? 'SQL' : 'NoSQL'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {m.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Feature Simulator */}
          <DbFeatureInteractiveSimulator
            simKind={activeObj.simKind}
            moduleShortTitle={activeObj.shortTitle}
          />

          {/* Detailed Definition, Use Cases & When-to-Use-What Guide */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                {activeObj.category === 'relational'
                  ? 'Relational Database Architecture'
                  : 'Non-Relational (NoSQL) Architecture'}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {activeObj.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  In Simple English
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeObj.simpleEnglish}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <Cpu className="w-3.5 h-3.5" />
                  Standard Engineering Definition
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeObj.standardDefinition}
                </p>
              </div>
            </div>

            {/* Real-World Use Cases */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Real-World Production Use Cases
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {activeObj.useCases.map((uc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                      0{idx + 1}.
                    </span>
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* When to Use vs When NOT to Use */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  When to Use This
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeObj.whenToUse}
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  When NOT to Use (Watch Out!)
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeObj.whenNotToUse}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/25 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sky-800 dark:text-sky-300">Principal Performance Tip: </strong>
                {activeObj.performanceTip}
              </div>
            </div>
          </section>

          {/* Animated Execution DFD */}
          <DbMiniDfdAnimator
            title={activeObj.title}
            nodes={activeObj.dfdNodes}
            edges={activeObj.dfdEdges}
            steps={activeObj.dfdSteps}
            resetKey={activeObj.id}
          />

          {/* Production Code Blueprint */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-400">
                <Code2 className="w-3.5 h-3.5" />
                {activeObj.codeLanguage} — {activeObj.shortTitle}
              </div>
              <CopyButton text={activeObj.codeExample} label="Copy" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
              <code>{activeObj.codeExample}</code>
            </pre>
          </div>
        </div>
      )}

      {/* ====================================================================
          TRACK 2: BEGINNER-TO-ADVANCED SQL SCENARIOS & INTERACTIVE PRACTICE
          ==================================================================== */}
      {track === 'sql-scenarios' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SegmentedTabBar<'all' | SqlScenarioLevel>
                ariaLabel="Filter SQL scenarios by difficulty"
                activeTab={sqlLevel}
                onChange={setSqlLevel}
                size="xs"
                tabs={[
                  { id: 'all', label: 'All 8 Scenarios', count: SQL_PROGRESSIVE_SCENARIOS.length },
                  { id: 'Beginner', label: 'Beginner' },
                  { id: 'Intermediate', label: 'Intermediate' },
                  { id: 'Advanced', label: 'Advanced' },
                  { id: 'Principal', label: 'Principal' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {visibleScenarios.map((sc) => {
                const active = sc.id === activeScenario.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-sky-700 dark:text-sky-400">
                        Scenario {sc.number}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{sc.level}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-2">
                      {sc.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-1">
                      {sc.concepts}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Scenario Brief + Interactive SQL Editor + Verification */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                  Scenario {activeScenario.number} · {activeScenario.level} · {activeScenario.concepts}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeScenario.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateSqlDraft(activeScenario.solutionSql)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300"
                >
                  Load Optimal Solution
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSqlDraft(activeScenario.starterSql)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs leading-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Business Scenario
                </div>
                <p className="text-slate-700 dark:text-slate-300">{activeScenario.businessScenario}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                <div className="font-semibold text-sky-700 dark:text-sky-400 mb-1">
                  Table Schema
                </div>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {activeScenario.schemaSummary}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3">
                <div className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  Your Goal (Plain English)
                </div>
                <p className="text-slate-700 dark:text-slate-300">{activeScenario.plainEnglishGoal}</p>
              </div>
            </div>

            {/* Editor + Live Verification Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <label
                  htmlFor="sql-scenario-practice-editor"
                  className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  SQL Practice Editor (live semantic &amp; structural check on every edit)
                </label>
                <textarea
                  id="sql-scenario-practice-editor"
                  value={currentSql}
                  onChange={(e) => updateSqlDraft(e.target.value)}
                  spellCheck={false}
                  rows={14}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed p-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="lg:col-span-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Query Verification
                  </span>
                  <span
                    className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded ${
                      scenarioPassCount === scenarioRuleResults.length
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {scenarioPassCount}/{scenarioRuleResults.length} PASS
                  </span>
                </div>

                <div className="space-y-2">
                  {scenarioRuleResults.map((r) => (
                    <div
                      key={r.id}
                      className={`rounded-lg border p-2.5 text-xs ${
                        r.passed
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {r.label}
                          </div>
                          {!r.passed && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Hint: {r.hint}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-by-Step Walkthrough */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 space-y-2">
              <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Why This Query Works — Step-by-Step Execution Walkthrough
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {activeScenario.walkthrough.map((step, i) => (
                  <p key={i}>{step}</p>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ====================================================================
          TRACK 3: DATABASE SCHEMA DESIGN TECHNIQUES (8 ARCHITECTURAL PATTERNS)
          ==================================================================== */}
      {track === 'schema-design' && (
        <div className="space-y-6">
          {/* Interactive Schema Decision Advisor */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Interactive Schema Decision Advisor — Pick Your Workload Goal:
                </span>
              </div>
              <SegmentedTabBar<WorkloadAdvisorGoal>
                ariaLabel="Filter schema techniques by workload"
                activeTab={advisorGoal}
                onChange={setAdvisorGoal}
                size="xs"
                wrap
                tabs={[
                  { id: 'all', label: 'All 8 Techniques' },
                  { id: 'oltp', label: 'OLTP Write Integrity' },
                  { id: 'analytics', label: 'BI & Analytics' },
                  { id: 'saas', label: 'Multi-Tenant SaaS' },
                  { id: 'audit', label: 'Audit / History / Ledger' },
                  { id: 'scale', label: 'Massive Scale & Feeds' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {visibleTechniques.map((tech) => {
                const active = tech.id === activeTechnique.id;
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => setSelectedTechniqueId(tech.id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-sky-700 dark:text-sky-400">
                        {tech.number}. {tech.shortTitle}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {tech.category}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                      {tech.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Schema Technique Deep Dive */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div>
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                Technique {activeTechnique.number} · {activeTechnique.category}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {activeTechnique.title}
              </h3>
            </div>

            {/* Visual Entity Blueprint Cards */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Visual Schema Structure (Tables, Keys &amp; Indexes)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeTechnique.entities.map((ent) => (
                  <div
                    key={ent.name}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {ent.name}
                      </span>
                      <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400">
                        {ent.role}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {ent.columns.map((col) => (
                        <div
                          key={col.name}
                          className="px-3 py-1.5 flex items-center justify-between text-xs font-mono"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{col.name}</span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500">{col.type}</span>
                            {col.badge && (
                              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400">
                                {col.badge}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple English + Technical + Why Use */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  In Simple English
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeTechnique.simpleEnglish}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                  Technical Architecture
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeTechnique.technicalExplanation}
                </p>
              </div>
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/25 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                  Why Engineers Choose It
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-6">
                  {activeTechnique.whyUse}
                </p>
              </div>
            </div>

            {/* 4-Dimension Trade-Off Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[11px] text-slate-500">Read Speed</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeTechnique.tradeOffs.readSpeed}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[11px] text-slate-500">Write Speed</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeTechnique.tradeOffs.writeSpeed}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[11px] text-slate-500">Consistency</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeTechnique.tradeOffs.consistency}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="text-[11px] text-slate-500">Storage Cost</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeTechnique.tradeOffs.storageCost}
                </div>
              </div>
            </div>

            {/* When to Use vs When to Avoid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  When to Use This Schema Technique
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {activeTechnique.whenToUse.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  When to Avoid (Anti-Patterns)
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {activeTechnique.whenToAvoid.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Production DDL Blueprint */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                  <Code2 className="w-3.5 h-3.5" />
                  Production DDL Blueprint — {activeTechnique.shortTitle}
                </div>
                <CopyButton text={activeTechnique.ddlBlueprint} label="Copy" copiedLabel="Copied" size="xs" />
              </div>
              <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
                <code>{activeTechnique.ddlBlueprint}</code>
              </pre>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
