import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Compass,
  Database,
  GitFork,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  DATABASE_PARADIGMS,
  SHARDING_STRATEGIES,
  SQL_MASTERY_PATTERNS,
  WORKLOAD_MATCHER_PRESETS,
  type SqlMasteryPattern,
} from '../../data/databaseTaxonomyAndSqlData';
import { CopyButton, SegmentedTabBar } from '../ui';

type ModuleSubTab = 'taxonomy' | 'sql-mastery' | 'sharding-scatter';

export function TaxonomyAndSqlMasteryLab() {
  const [subTab, setSubTab] = useState<ModuleSubTab>('taxonomy');

  // Module 1: Taxonomy & CAP/PACELC Matcher State
  const [selectedMatcherId, setSelectedMatcherId] = useState(WORKLOAD_MATCHER_PRESETS[0].id);
  const [selectedParadigmId, setSelectedParadigmId] = useState(DATABASE_PARADIGMS[0].id);

  // Module 2: SQL Mastery Group State
  const [sqlGroup, setSqlGroup] = useState<SqlMasteryPattern['group']>('ddl');

  // Module 5+: Sharding & Scatter-Gather Simulator State
  const [shardCount, setShardCount] = useState(16);
  const [includesShardKey, setIncludesShardKey] = useState(true);
  const [saltingEnabled, setSaltingEnabled] = useState(true);

  const activeMatcher = useMemo(
    () => WORKLOAD_MATCHER_PRESETS.find((w) => w.id === selectedMatcherId) ?? WORKLOAD_MATCHER_PRESETS[0],
    [selectedMatcherId]
  );

  const activeParadigm = useMemo(
    () => DATABASE_PARADIGMS.find((p) => p.id === selectedParadigmId) ?? DATABASE_PARADIGMS[0],
    [selectedParadigmId]
  );

  const activeSqlPattern = useMemo(
    () => SQL_MASTERY_PATTERNS.find((s) => s.group === sqlGroup) ?? SQL_MASTERY_PATTERNS[0],
    [sqlGroup]
  );

  const scatterMetrics = useMemo(() => {
    const shardsQueried = includesShardKey ? 1 : shardCount;
    const baseMs = 2.4;
    // Scatter-gather tail latency grows with max(N) straggler shards + coordinator merge sort
    const p99Ms = includesShardKey
      ? saltingEnabled
        ? 3.1
        : 48.5 // hot celebrity shard contention
      : Number((baseMs + shardCount * 4.8 + Math.log2(shardCount) * 6).toFixed(1));
    const networkRpcs = shardsQueried;
    return {
      shardsQueried,
      p99Ms,
      networkRpcs,
      status: includesShardKey
        ? saltingEnabled
          ? 'Single-Shard Targeted Route (Optimal)'
          : 'Single-Shard Route (Hot-Partition Contention Risk)'
        : `Scatter-Gather Fan-Out (${shardCount} Shards Merged)`,
      healthy: includesShardKey && saltingEnabled,
    };
  }, [shardCount, includesShardKey, saltingEnabled]);

  return (
    <div className="space-y-6">
      <SegmentedTabBar<ModuleSubTab>
        ariaLabel="Taxonomy, SQL Mastery, and Sharding modules"
        activeTab={subTab}
        onChange={setSubTab}
        tabs={[
          {
            id: 'taxonomy',
            label: 'Module 1: SQL & NoSQL Taxonomy (8 Paradigms)',
            shortLabel: '8 Paradigms',
            icon: Compass,
          },
          {
            id: 'sql-mastery',
            label: 'Module 2: SQL Mastery (DDL, DML, DQL & Windows)',
            shortLabel: 'SQL Mastery',
            icon: Code2,
          },
          {
            id: 'sharding-scatter',
            label: 'Module 5: Sharding Keys & Scatter-Gather Sim',
            shortLabel: 'Sharding Sim',
            icon: GitFork,
          },
        ]}
      />

      {/* MODULE 1: COMPLETE 8-PARADIGM DATABASE TAXONOMY + CAP/PACELC MATCHER */}
      {subTab === 'taxonomy' && (
        <div className="space-y-6">
          {/* Interactive Workload -> Paradigm Matcher */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Interactive Workload-to-Database Architect Matcher
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Pick a real-world production system to see which paradigm wins under CAP/PACELC trade-offs and why.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {WORKLOAD_MATCHER_PRESETS.map((preset) => {
                const active = preset.id === activeMatcher.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedMatcherId(preset.id);
                      if (preset.recommendedIds[0]) setSelectedParadigmId(preset.recommendedIds[0]);
                    }}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {preset.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/25 p-4 space-y-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sky-900 dark:text-sky-200">
                  Target Workload: {activeMatcher.label}
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-slate-600 dark:text-slate-400">{activeMatcher.requirements}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-5">
                <strong>Architect Recommendation: </strong>
                {activeMatcher.rationale}
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-5">
                <strong>Companion Pipeline: </strong>
                {activeMatcher.secondaryPattern}
              </p>
            </div>
          </section>

          {/* 8-Paradigm Explorer */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Complete Database Taxonomy — All 8 SQL &amp; NoSQL Paradigms
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Inspect each engine family across CAP/PACELC consistency models, physical storage layouts, and failure modes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DATABASE_PARADIGMS.map((p) => {
                const selected = p.id === activeParadigm.id;
                const recommended = activeMatcher.recommendedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedParadigmId(p.id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      selected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span className="text-sky-700 dark:text-sky-400 font-semibold">{p.capPosition}</span>
                      {recommended && (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Match</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {p.engines}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Paradigm Deep Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-5 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {activeParadigm.name} — {activeParadigm.engines}
                  </h3>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 mt-0.5">
                    CAP: {activeParadigm.capPosition} · PACELC: {activeParadigm.pacelc}
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{activeParadigm.category}</span>
              </div>

              <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900 p-3.5 text-sm text-slate-800 dark:text-slate-200 leading-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 mr-2">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Simple English:
                </span>
                {activeParadigm.simpleEnglish}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Standard Definition</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-5">{activeParadigm.standardDefinition}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Storage &amp; Index Layout</div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">{activeParadigm.storageLayout}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{activeParadigm.indexStructure}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Ideal Workloads</div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {activeParadigm.idealWorkloads.map((w) => (
                      <li key={w}>• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-1">
                  <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    Production Failure Mode &amp; Avoid When
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">{activeParadigm.failureMode}</p>
                  <p className="text-slate-500 dark:text-slate-400">Avoid when: {activeParadigm.avoidWhen}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Production Mitigation &amp; Real-World Example
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">{activeParadigm.mitigation}</p>
                  <p className="text-slate-500 dark:text-slate-400">Used by: {activeParadigm.realWorldExample}</p>
                </div>
              </div>
            </div>

            {/* Compact Full Comparison Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3 font-semibold">Paradigm</th>
                    <th className="py-2.5 px-3 font-semibold">CAP / PACELC</th>
                    <th className="py-2.5 px-3 font-semibold">Consistency</th>
                    <th className="py-2.5 pl-3 font-semibold">Physical Storage Layout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {DATABASE_PARADIGMS.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedParadigmId(p.id)}
                      className={`cursor-pointer transition-colors ${
                        p.id === activeParadigm.id
                          ? 'bg-sky-50/70 dark:bg-sky-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
                        {p.capPosition} · {p.pacelc.split(' ')[0]}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{p.consistencyModel}</td>
                      <td className="py-2.5 pl-3 text-slate-600 dark:text-slate-400">{p.storageLayout}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* MODULE 2: SQL MASTERY — DDL, DML, DQL, WINDOW FUNCTIONS & KEYSET PAGINATION */}
      {subTab === 'sql-mastery' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                SQL Mastery: Anti-Pattern vs. Production-Ready Patterns
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Master DDL migrations, atomic DML upserts/queues, CTEs &amp; Window Functions, Keyset pagination, and pgvector similarity.
              </p>
            </div>
            <SegmentedTabBar<SqlMasteryPattern['group']>
              ariaLabel="SQL Mastery categories"
              activeTab={sqlGroup}
              onChange={setSqlGroup}
              size="xs"
              tabs={[
                { id: 'ddl', label: 'DDL & Partitioning' },
                { id: 'dml', label: 'DML, MERGE & Queues' },
                { id: 'dql', label: 'CTEs & Window Functions' },
                { id: 'pagination-vector', label: 'Keyset & Vector <=>' },
              ]}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                {activeSqlPattern.subtitle}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {activeSqlPattern.title}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                <strong>In Simple English: </strong>
                {activeSqlPattern.simpleEnglish}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-5">
                <strong>Standard Definition: </strong>
                {activeSqlPattern.standardDefinition}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Anti-Pattern */}
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/15 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {activeSqlPattern.antiPatternTitle}
                  </span>
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 text-amber-200 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {activeSqlPattern.antiPatternSql}
                </pre>
                <div className="text-xs font-mono text-rose-700 dark:text-rose-400">
                  Impact: {activeSqlPattern.antiPatternImpact}
                </div>
              </div>

              {/* Production Pattern */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {activeSqlPattern.productionTitle}
                  </span>
                  <CopyButton text={activeSqlPattern.productionSql} label="Copy SQL" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                  {activeSqlPattern.productionSql}
                </pre>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  Impact: {activeSqlPattern.productionImpact}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
              <strong className="text-slate-900 dark:text-slate-100">Architect Takeaway: </strong>
              {activeSqlPattern.keyTakeaway}
            </div>
          </div>
        </section>
      )}

      {/* MODULE 5+: SHARDING STRATEGIES & LIVE SCATTER-GATHER SIMULATOR */}
      {subTab === 'sharding-scatter' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Live Shard Key Routing &amp; Scatter-Gather Query Simulator
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  See why omitting the Shard Key forces a Scatter-Gather fan-out across all N nodes and explodes tail latency.
                </p>
              </div>
              <span
                className={`text-xs font-mono font-semibold ${
                  scatterMetrics.healthy
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {scatterMetrics.status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <label htmlFor="scatter-shards">Cluster Shard Count (N)</label>
                    <span className="font-mono tabular-nums font-semibold">{shardCount} shards</span>
                  </div>
                  <input
                    id="scatter-shards"
                    type="range"
                    min={4}
                    max={32}
                    step={2}
                    value={shardCount}
                    onChange={(e) => setShardCount(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setIncludesShardKey((v) => !v)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                      includesShardKey
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                        : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {includesShardKey
                      ? 'WHERE Includes Shard Key (tenant_id = $1) -> 1 Shard Hit'
                      : 'WHERE Omits Shard Key (email = $1) -> Scatter-Gather All Shards'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaltingEnabled((v) => !v)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                      saltingEnabled
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200'
                        : 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {saltingEnabled
                      ? 'Hot-Partition Mitigation: Salted / Composite Key ON'
                      : 'Hot-Partition Mitigation: OFF (Celebrity Tenant Skew)'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500">Shards Hit</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {scatterMetrics.shardsQueried}/{shardCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500">Network RPCs</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {scatterMetrics.networkRpcs}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500">Est. p99</div>
                    <div
                      className={`text-lg font-mono font-bold tabular-nums ${
                        scatterMetrics.healthy
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {scatterMetrics.p99Ms} ms
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Visual Shard Grid */}
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Live Cluster Fan-Out Visualization ({shardCount} Shards)
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Array.from({ length: shardCount }, (_, idx) => {
                    const hit = !includesShardKey || idx === 2;
                    const isHot = includesShardKey && !saltingEnabled && idx === 2;
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-2 text-center font-mono text-[11px] transition-colors ${
                          isHot
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 font-semibold'
                            : hit
                              ? includesShardKey
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                                : 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-400'
                        }`}
                      >
                        <div>S{String(idx + 1).padStart(2, '0')}</div>
                        <div className="text-[9px] mt-0.5">
                          {isHot ? 'HOT' : hit ? 'HIT' : 'IDLE'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                  {includesShardKey
                    ? saltingEnabled
                      ? 'Router hashes tenant_id directly to Shard S03 in 1 hop. Other shards remain untouched, giving linear horizontal throughput.'
                      : 'Shard S03 owns a mega-tenant receiving 70% of traffic — salt the key (tenant_id#0..15) or isolate whale tenants onto dedicated shards.'
                    : `Because the query omits tenant_id, the coordinator must fan out ${shardCount} parallel RPCs, wait for the slowest straggler shard, and merge-sort results in memory.`}
                </p>
              </div>
            </div>

            {/* Sharding Strategy Comparison Table */}
            <div className="overflow-x-auto pt-4 border-t border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3 font-semibold">Sharding Strategy</th>
                    <th className="py-2.5 px-3 font-semibold">Range Queries</th>
                    <th className="py-2.5 px-3 font-semibold">Scale-Out Rebalance</th>
                    <th className="py-2.5 px-3 font-semibold">Hotspot Risk</th>
                    <th className="py-2.5 pl-3 font-semibold">Best Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {SHARDING_STRATEGIES.map((st) => (
                    <tr key={st.id} className="align-top">
                      <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {st.name}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 leading-5">{st.rangeQueries}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 leading-5">{st.rebalanceCost}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 leading-5">{st.hotspotRisk}</td>
                      <td className="py-3 pl-3 text-slate-600 dark:text-slate-400 leading-5">{st.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
