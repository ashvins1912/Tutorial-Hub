import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  Layers,
  Lock,
  Network,
  Play,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Zap,
} from 'lucide-react';
import {
  ISOLATION_LEVELS_MATRIX,
  JOIN_ALGORITHMS,
  QUERY_PIPELINE_STAGES,
  SQL_PLAYGROUND_PRESETS,
  STORAGE_ENGINE_COMPARISON,
  simulateSqlOptimizer,
  type IndexStrategyId,
} from '../../data/databaseInternalsData';
import { CopyButton, SegmentedTabBar } from '../ui';

type DeepDiveSubTab = 'playground' | 'storage' | 'acid-isolation' | 'distributed';

const INDEX_STRATEGY_OPTIONS: { id: IndexStrategyId; label: string }[] = [
  { id: 'none', label: 'No Index (Seq Scan)' },
  { id: 'btree-single', label: 'Plain Single B-Tree' },
  { id: 'composite-covering-expression', label: 'Composite Partial + Covering' },
  { id: 'gin-jsonb', label: 'GIN (jsonb_path_ops)' },
];

const ARIES_STEPS = [
  {
    phase: '1. Analysis Phase',
    summary: 'Scan WAL forward from the last Checkpoint record to reconstruct the Dirty Page Table (DPT) and Active Transaction Table (ATT) at the exact moment of crash.',
    walAction: 'Identifies committed vs. in-flight loser transactions and earliest RecLSN.',
  },
  {
    phase: '2. Redo Phase (Repeating History)',
    summary: 'Scan WAL forward from the smallest RecLSN in the Dirty Page Table and replay EVERY logged change whose page LSN < log LSN — restoring the exact pre-crash state.',
    walAction: 'Guarantees durability of all committed transactions even if dirty pages never flushed to disk.',
  },
  {
    phase: '3. Undo Phase',
    summary: 'Walk backward through WAL records of uncommitted ("loser") transactions using prevLSN pointers, reversing partial changes and writing Compensation Log Records (CLRs).',
    walAction: 'Guarantees atomicity and ensures recovery itself is idempotent if a second crash happens mid-recovery.',
  },
];

const WRITE_SKEW_SQL = `-- Transaction A (Doctor Alice)          | -- Transaction B (Doctor Bob)
BEGIN ISOLATION LEVEL REPEATABLE READ;   | BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT COUNT(*) FROM on_call             | SELECT COUNT(*) FROM on_call
WHERE shift = 'night' AND active = true; | WHERE shift = 'night' AND active = true;
-- Returns 2 (safe to leave!)            | -- Also sees 2 from same MVCC snapshot!
UPDATE on_call SET active = false        | UPDATE on_call SET active = false
WHERE doctor = 'Alice';                  | WHERE doctor = 'Bob';
COMMIT;                                  | COMMIT; -- SUCCEEDS! Now 0 doctors on call!

-- FIX 1: Serializable Snapshot Isolation (SSI)
BEGIN ISOLATION LEVEL SERIALIZABLE;      -- Postgres detects SIREAD/RW cycle -> ERROR 40001

-- FIX 2: Atomic Update / Pessimistic Locking for Lost Updates
UPDATE accounts SET balance = balance - 100
WHERE id = 1 AND balance >= 100;         -- Atomic check-and-write, zero race window

-- FIX 3: Lock-Free Queue Workers with SKIP LOCKED
SELECT job_id FROM job_queue
WHERE status = 'PENDING'
ORDER BY created_at
FOR UPDATE SKIP LOCKED LIMIT 1;`;

export function QueryPipelinePlayground() {
  const [subTab, setSubTab] = useState<DeepDiveSubTab>('playground');

  // SQL Optimizer Playground State
  const [presetId, setPresetId] = useState(SQL_PLAYGROUND_PRESETS[0].id);
  const [rowCountMillions, setRowCountMillions] = useState(20);
  const [indexStrategy, setIndexStrategy] = useState<IndexStrategyId>('none');
  const [workMemMb, setWorkMemMb] = useState(4);
  const [joinAlgo, setJoinAlgo] = useState<'auto' | 'nested-loop' | 'hash-join' | 'merge-join'>('auto');
  const [activeStageId, setActiveStageId] = useState<string>('optimizer');

  // Storage Engine Path Simulator State
  const [ioWorkload, setIoWorkload] = useState<'write-burst' | 'point-read'>('write-burst');

  // ARIES Crash Recovery State
  const [ariesStep, setAriesStep] = useState(0);

  // Distributed Quorum & Sharding State
  const [quorumN, setQuorumN] = useState(5);
  const [quorumW, setQuorumW] = useState(3);
  const [quorumR, setQuorumR] = useState(3);
  const [shardNodes, setShardNodes] = useState(6);

  const activePreset = useMemo(
    () => SQL_PLAYGROUND_PRESETS.find((p) => p.id === presetId) ?? SQL_PLAYGROUND_PRESETS[0],
    [presetId]
  );

  const simulation = useMemo(
    () =>
      simulateSqlOptimizer({
        preset: activePreset,
        rowCount: rowCountMillions * 1_000_000,
        indexStrategy,
        workMemMb,
        joinAlgorithm: joinAlgo,
      }),
    [activePreset, rowCountMillions, indexStrategy, workMemMb, joinAlgo]
  );

  const activeStage = useMemo(
    () => QUERY_PIPELINE_STAGES.find((s) => s.id === activeStageId) ?? QUERY_PIPELINE_STAGES[3],
    [activeStageId]
  );

  const isStrongQuorum = quorumW + quorumR > quorumN && quorumR > 0 && quorumW > 0;
  const quorumOverlap = Math.max(0, quorumW + quorumR - quorumN);

  const moduloMovedPct = useMemo(() => {
    // Fraction of keys whose (k % N) != (k % (N + 1)) over a large keyspace
    const sample = 10000;
    let moved = 0;
    for (let i = 0; i < sample; i++) {
      if (i % shardNodes !== i % (shardNodes + 1)) moved++;
    }
    return Number(((moved / sample) * 100).toFixed(1));
  }, [shardNodes]);

  const consistentMovedPct = useMemo(
    () => Number(((1 / (shardNodes + 1)) * 100).toFixed(1)),
    [shardNodes]
  );

  const handleSelectPreset = (nextId: string) => {
    const found = SQL_PLAYGROUND_PRESETS.find((p) => p.id === nextId);
    if (!found) return;
    setPresetId(found.id);
    setRowCountMillions(Math.round(found.tableRowsDefault / 1_000_000));
    setIndexStrategy(found.defaultIndex);
    setWorkMemMb(4);
    setJoinAlgo('auto');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabBar<DeepDiveSubTab>
          ariaLabel="Engine internals sections"
          activeTab={subTab}
          onChange={setSubTab}
          tabs={[
            { id: 'playground', label: '5-Stage Pipeline & SQL Optimizer', shortLabel: 'SQL Optimizer', icon: Cpu },
            { id: 'storage', label: 'B+ Tree vs. LSM-Tree Storage', shortLabel: 'Storage', icon: HardDrive },
            { id: 'acid-isolation', label: 'WAL, MVCC & Isolation Matrix', shortLabel: 'ACID & Locks', icon: Lock },
            { id: 'distributed', label: 'Quorum, Raft & Consistent Hashing', shortLabel: 'Distributed', icon: Network },
          ]}
        />
      </div>

      {/* SUB-TAB 1: 5-STAGE QUERY PIPELINE + SIMULATED SQL OPTIMIZER PLAYGROUND */}
      {subTab === 'playground' && (
        <div className="space-y-6">
          {/* Interactive 5-Stage Query Execution Pipeline */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  1. Five-Stage Query Execution Pipeline
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Select any architectural stage to inspect internal data structures, live simulated timing, and production safeguards.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Total Simulated Time: {simulation.actualTimeMs} ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {QUERY_PIPELINE_STAGES.map((stage) => {
                const isSelected = stage.id === activeStage.id;
                const stageMs = simulation.stageLatenciesMs[stage.id] ?? 0;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStageId(stage.id)}
                    className={`text-left rounded-lg border p-3.5 transition-colors ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      <span>0{stage.step}</span>
                      <span className="text-sky-700 dark:text-sky-400 font-semibold">{stageMs} ms</span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {stage.shortName}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {stage.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                    Stage 0{activeStage.step}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeStage.artifacts.join('  ->  ')}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {activeStage.name}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeStage.internals}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Production Architecture Rule
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                  {activeStage.productionNote}
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Simulated SQL Optimizer Playground */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  2. Live Simulated SQL Optimizer Playground
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Manipulate table cardinality, index strategy, and work_mem to observe real-time planner cost and buffer I/O changes.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIndexStrategy(activePreset.recommendedIndex);
                    setWorkMemMb(32);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  Apply Production Fix
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIndexStrategy(activePreset.defaultIndex);
                    setWorkMemMb(4);
                    setRowCountMillions(Math.round(activePreset.tableRowsDefault / 1_000_000));
                    setJoinAlgo('auto');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            {/* Scenario Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {SQL_PLAYGROUND_PRESETS.map((preset) => {
                const selected = preset.id === activePreset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`text-left rounded-lg border p-3.5 transition-colors ${
                      selected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {preset.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {preset.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Two-Zone Sandbox: Controls Left, Live Execution Plan Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 5 Cols: Query & Engine Knobs */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target SQL Query
                    </span>
                    <CopyButton text={activePreset.sql} label="Copy SQL" copiedLabel="Copied" size="xs" />
                  </div>
                  <pre className="p-3.5 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                    {activePreset.sql}
                  </pre>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <label htmlFor="db-row-slider" className="inline-flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        Table Size
                      </label>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {rowCountMillions}M rows
                      </span>
                    </div>
                    <input
                      id="db-row-slider"
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={rowCountMillions}
                      onChange={(e) => setRowCountMillions(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <label htmlFor="db-workmem-slider">Session work_mem</label>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {workMemMb} MB
                      </span>
                    </div>
                    <input
                      id="db-workmem-slider"
                      type="range"
                      min={4}
                      max={64}
                      step={4}
                      value={workMemMb}
                      onChange={(e) => setWorkMemMb(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Active Index Configuration
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {INDEX_STRATEGY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIndexStrategy(opt.id)}
                          className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-colors ${
                            indexStrategy === opt.id
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activePreset.joinUsed !== 'none' && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="join-algo-select"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Optimizer Join Strategy
                      </label>
                      <select
                        id="join-algo-select"
                        value={joinAlgo}
                        onChange={(e) =>
                          setJoinAlgo(e.target.value as 'auto' | 'nested-loop' | 'hash-join' | 'merge-join')
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-slate-100"
                      >
                        <option value="auto">Auto (Cost-Based Optimizer)</option>
                        <option value="nested-loop">Nested Loop Join — O(N log M)</option>
                        <option value="hash-join">Hash Join — O(N + M)</option>
                        <option value="merge-join">Merge Join — O(N + M)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Right 7 Cols: Live Telemetry + EXPLAIN ANALYZE Plan Output */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Execution Time</div>
                    <div
                      className={`text-lg font-mono font-bold tabular-nums mt-0.5 ${
                        simulation.actualTimeMs <= 5
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : simulation.actualTimeMs <= 150
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {simulation.actualTimeMs} ms
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Disk Blocks Read</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                      {simulation.sharedReads.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Buffer Hit Ratio</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                      {simulation.bufferHitPct}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Temp Disk Spill</div>
                    <div
                      className={`text-lg font-mono font-bold tabular-nums mt-0.5 ${
                        simulation.diskSpillKb === 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {simulation.diskSpillKb.toLocaleString()} kB
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>
                      Operator: <strong className="text-slate-900 dark:text-slate-100">{simulation.scanType}</strong>
                    </span>
                    <span className="font-mono tabular-nums">
                      Heap Fetches: {simulation.heapFetches.toLocaleString()}
                    </span>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                    {simulation.planLines.join('\n')}
                  </pre>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                  <strong className="text-slate-900 dark:text-slate-100">Optimizer Analysis: </strong>
                  {simulation.diagnosis}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Recommended Production Index DDL
                    </span>
                    <CopyButton text={activePreset.fixedSql} label="Copy DDL" copiedLabel="Copied" size="xs" />
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                    {activePreset.fixedSql}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Join Algorithms Selected by CBO */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              3. Cost-Based Optimizer Join Algorithms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {JOIN_ALGORITHMS.map((algo) => (
                <div
                  key={algo.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{algo.name}</h3>
                    <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                      {algo.complexity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">{algo.mechanism}</p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p>
                      <strong className="text-slate-900 dark:text-slate-200">Best when:</strong> {algo.bestWhen}
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-slate-200">Memory:</strong> {algo.memoryFootprint}
                    </p>
                    <p>
                      <strong className="text-amber-700 dark:text-amber-400">Failure mode:</strong> {algo.watchOut}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SUB-TAB 2: B+ TREES VS LSM-TREES */}
      {subTab === 'storage' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  B+ Trees vs. Log-Structured Merge Trees (LSM-Trees)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Toggle workload patterns to trace exact disk I/O paths inside SQL (in-place pages) vs. NoSQL (append-only SSTables).
                </p>
              </div>
              <SegmentedTabBar<'write-burst' | 'point-read'>
                ariaLabel="Storage workload simulator"
                activeTab={ioWorkload}
                onChange={setIoWorkload}
                size="xs"
                tabs={[
                  { id: 'write-burst', label: 'Write Burst Path' },
                  { id: 'point-read', label: 'Point Read Path' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    B+ Tree Engine (PostgreSQL, MySQL InnoDB)
                  </h3>
                  <span className="text-xs font-mono text-slate-500">8KB / 16KB Pages</span>
                </div>
                {ioWorkload === 'write-burst' ? (
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">01.</span>
                      <span>Append change record sequentially to WAL / Redo Log on disk (`fsync`).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">02.</span>
                      <span>Locate target 8KB/16KB leaf page inside the RAM Buffer Pool (or fault it in via random read).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">03.</span>
                      <span>Mutate page in-place; if full (common with random UUIDv4 keys), perform expensive 50/50 page split.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">04.</span>
                      <span>Checkpointer later flushes dirty pages randomly back to disk; VACUUM reclaims dead tuple space.</span>
                    </li>
                  </ol>
                ) : (
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">01.</span>
                      <span>Traverse Root -&gt; Internal -&gt; Leaf node in O(log_B N): only 3–4 page hops for 1 billion rows.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">02.</span>
                      <span>Upper tree levels stay pinned in RAM Buffer Pool (~99.5% hit rate).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">03.</span>
                      <span>Exact key exists in at most one leaf page — zero need to merge across multiple files.</span>
                    </li>
                  </ol>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    LSM-Tree Engine (Cassandra, RocksDB, ScyllaDB)
                  </h3>
                  <span className="text-xs font-mono text-slate-500">MemTable + SSTables</span>
                </div>
                {ioWorkload === 'write-burst' ? (
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">01.</span>
                      <span>Append write sequentially to CommitLog / WAL and insert into sorted in-memory MemTable (SkipList / Red-Black Tree).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">02.</span>
                      <span>Return ACK immediately — zero random disk seeks and zero in-place page splits.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">03.</span>
                      <span>When MemTable fills, flush sequentially to disk as an immutable Level-0 SSTable + Bloom Filter.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">04.</span>
                      <span>Background Compaction merges overlapping SSTables, deduplicates overwritten keys, and purges tombstones.</span>
                    </li>
                  </ol>
                ) : (
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">01.</span>
                      <span>Check active MemTable and immutable MemTables in RAM first.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">02.</span>
                      <span>Query per-SSTable Bloom Filters to skip files guaranteed not to contain the key (saves disk seeks).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">03.</span>
                      <span>Inspect remaining candidate SSTables across L0..Ln and reconcile the newest timestamp (or tombstone).</span>
                    </li>
                  </ol>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-semibold">Feature</th>
                    <th className="py-2.5 px-4 font-semibold">B+ Tree (SQL Engines)</th>
                    <th className="py-2.5 pl-4 font-semibold">LSM-Tree (Write-Heavy NoSQL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {STORAGE_ENGINE_COMPARISON.map((row) => (
                    <tr key={row.feature} className="align-top">
                      <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-5">
                        {row.bPlusTree}
                      </td>
                      <td className="py-3 pl-4 text-slate-700 dark:text-slate-300 leading-5">
                        {row.lsmTree}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* SUB-TAB 3: WAL, ARIES, MVCC, ISOLATION LEVELS & LOCKS */}
      {subTab === 'acid-isolation' && (
        <div className="space-y-6">
          {/* ARIES WAL Recovery + MVCC Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Write-Ahead Logging (WAL) & ARIES Recovery
                </h2>
                <button
                  type="button"
                  onClick={() => setAriesStep((s) => (s + 1) % ARIES_STEPS.length)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                >
                  <Play className="w-3 h-3" aria-hidden="true" />
                  Next Phase
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                Before any dirty page in the Buffer Pool is modified or flushed, the delta is appended sequentially to the WAL on disk. Step through crash recovery:
              </p>
              <div className="space-y-2">
                {ARIES_STEPS.map((item, idx) => (
                  <button
                    key={item.phase}
                    type="button"
                    onClick={() => setAriesStep(idx)}
                    className={`w-full text-left rounded-lg border p-3.5 transition-colors ${
                      ariesStep === idx
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.phase}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-5">{item.summary}</p>
                    {ariesStep === idx && (
                      <p className="text-xs font-medium text-sky-700 dark:text-sky-300 mt-2">{item.walAction}</p>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                MVCC Engines & Lock Mechanics
              </h2>
              <div className="space-y-3 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    PostgreSQL MVCC (Append-Only Tuples: xmin / xmax)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-5">
                    Every UPDATE inserts a new tuple version stamped with <code className="font-mono">xmin</code> and marks the previous tuple&apos;s <code className="font-mono">xmax</code>. Readers never block writers; background <code className="font-mono">autovacuum</code> reclaims dead tuples and updates the Visibility Map.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    MySQL InnoDB / Oracle MVCC (In-Place + Undo Rollback Segment)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-5">
                    Updates the clustered B+ Tree row in-place and pushes the prior image into a separate Undo Log linked by rollback pointers. Old snapshots walk the undo chain to reconstruct historical row versions.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Deadlock Detection (Wait-For Graph) & Queue Locking
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-5">
                    The Lock Manager inspects directed Wait-For Graphs after <code className="font-mono">deadlock_timeout</code> (default 1s) and aborts the youngest cycle participant. Use Advisory Locks for app-level mutexes and <code className="font-mono">SELECT ... FOR UPDATE SKIP LOCKED</code> for high-throughput job queues.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ANSI SQL Isolation Levels Matrix */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                ANSI SQL Isolation Levels & Concurrency Anomalies Matrix
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Choosing the wrong isolation level causes silent financial or inventory corruption under high concurrency.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3 font-semibold">Isolation Level</th>
                    <th className="py-2.5 px-3 font-semibold">Dirty Read</th>
                    <th className="py-2.5 px-3 font-semibold">Non-Repeatable</th>
                    <th className="py-2.5 px-3 font-semibold">Phantom Read</th>
                    <th className="py-2.5 px-3 font-semibold">Write Skew</th>
                    <th className="py-2.5 pl-3 font-semibold">Internal Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {ISOLATION_LEVELS_MATRIX.map((row) => (
                    <tr key={row.level} className="align-top">
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {row.level}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.badge}</div>
                      </td>
                      {[row.dirtyRead, row.nonRepeatableRead, row.phantomRead, row.writeSkew].map((val, i) => {
                        const safe = val.startsWith('Prevented');
                        return (
                          <td
                            key={i}
                            className={`py-3 px-3 font-mono font-semibold whitespace-nowrap ${
                              safe
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {safe ? '✓ ' : '✗ '}
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-3 pl-3 text-slate-700 dark:text-slate-300 leading-5">
                        {row.mechanism}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Write Skew vs SSI & Lost Update SQL Lab */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Hands-On SQL Lab: Write Skew, Lost Updates & SKIP LOCKED
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Never read a balance in app code and write back <code className="font-mono">balance = new_balance</code>. Enforce atomicity inside the engine.
                </p>
              </div>
              <CopyButton text={WRITE_SKEW_SQL} label="Copy SQL Lab" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
              {WRITE_SKEW_SQL}
            </pre>
          </section>
        </div>
      )}

      {/* SUB-TAB 4: DISTRIBUTED REPLICATION, RAFT & CONSISTENT HASHING */}
      {subTab === 'distributed' && (
        <div className="space-y-6">
          {/* Interactive Quorum Consistency Simulator */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Leaderless Quorum Consistency Simulator (W + R &gt; N)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Adjust replica count (N), Write Quorum (W), and Read Quorum (R) to verify guaranteed replica overlap in Cassandra / DynamoDB.
                </p>
              </div>
              <div
                className={`text-xs font-mono font-semibold tabular-nums ${
                  isStrongQuorum
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                W ({quorumW}) + R ({quorumR}) = {quorumW + quorumR}{' '}
                {isStrongQuorum ? `> N (${quorumN}) · Strong Consistency` : `<= N (${quorumN}) · Stale Read Risk`}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <label htmlFor="quorum-n">Replicas (N)</label>
                  <span className="font-mono tabular-nums font-semibold">{quorumN} nodes</span>
                </div>
                <input
                  id="quorum-n"
                  type="range"
                  min={3}
                  max={7}
                  step={1}
                  value={quorumN}
                  onChange={(e) => {
                    const nextN = Number(e.target.value);
                    setQuorumN(nextN);
                    setQuorumW((w) => Math.min(w, nextN));
                    setQuorumR((r) => Math.min(r, nextN));
                  }}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <label htmlFor="quorum-w">Write Quorum (W)</label>
                  <span className="font-mono tabular-nums font-semibold">{quorumW}</span>
                </div>
                <input
                  id="quorum-w"
                  type="range"
                  min={1}
                  max={quorumN}
                  step={1}
                  value={quorumW}
                  onChange={(e) => setQuorumW(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <label htmlFor="quorum-r">Read Quorum (R)</label>
                  <span className="font-mono tabular-nums font-semibold">{quorumR}</span>
                </div>
                <input
                  id="quorum-r"
                  type="range"
                  min={1}
                  max={quorumN}
                  step={1}
                  value={quorumR}
                  onChange={(e) => setQuorumR(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            {/* Visual Replica Overlap Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2.5">
              {Array.from({ length: quorumN }, (_, idx) => {
                const hasWrite = idx < quorumW;
                const hasRead = idx >= quorumN - quorumR;
                const isOverlap = hasWrite && hasRead;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 text-center space-y-1 ${
                      isOverlap
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                        : hasWrite
                          ? 'border-sky-400 bg-sky-50/60 dark:bg-sky-950/30'
                          : hasRead
                            ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                      Node {idx + 1}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                      {isOverlap ? 'W + R Overlap' : hasWrite ? 'Write ACK' : hasRead ? 'Read Probe' : 'Idle'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono tabular-nums">
              <span>Guaranteed Overlap Nodes: {quorumOverlap}</span>
              <span aria-hidden="true">·</span>
              <span>Write Fault Tolerance: {quorumN - quorumW} node(s) down</span>
              <span aria-hidden="true">·</span>
              <span>Read Fault Tolerance: {quorumN - quorumR} node(s) down</span>
            </div>
          </section>

          {/* Consistent Hashing vs Modulo Sharding + Consensus Evolution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Modulo Sharding vs. Consistent Hashing
                </h2>
                <span className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">
                  Scale {shardNodes} -&gt; {shardNodes + 1} shards
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <label htmlFor="shard-slider">Current Cluster Size (N)</label>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {shardNodes} nodes
                  </span>
                </div>
                <input
                  id="shard-slider"
                  type="range"
                  min={3}
                  max={24}
                  step={1}
                  value={shardNodes}
                  onChange={(e) => setShardNodes(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                    Modulo: hash(key) % N
                  </div>
                  <div className="text-2xl font-mono font-bold tabular-nums text-rose-700 dark:text-rose-400">
                    {moduloMovedPct}%
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Keys invalidated &amp; migrated on scale-out, causing massive cache/disk storms.
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1">
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Consistent Hashing Ring
                  </div>
                  <div className="text-2xl font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {consistentMovedPct}%
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Only 1/(N+1) keys move from adjacent neighbors on the 0..2^32 virtual-node ring.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Replication &amp; Consensus Evolution
              </h2>
              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Single-Leader vs. Multi-Leader Replication
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Single-Leader streams WAL asynchronously (fast, stale-read lag risk) or synchronously (zero data loss, higher write RTT). Multi-Leader accepts regional writes using Hybrid Logical Clocks (LWW) or CRDTs for conflict resolution.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Legacy 2-Phase Commit (2PC)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>Modern Raft / Paxos Consensus</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    2PC blocks all participants indefinitely if the coordinator crashes mid-prepare. Modern NewSQL engines (CockroachDB, TiDB, YugabyteDB, etcd) use Raft leader election and majority log replication to survive minority node failures automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Raft tolerates f failures using 2f + 1 replicas (e.g., 3 nodes survive 1 outage; 5 nodes survive 2).</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
