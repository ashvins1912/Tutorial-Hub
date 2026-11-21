import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Pause,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  FAST_FETCH_TO_COMPRESS_STAGES,
  SQL_COMPLETE_REFERENCE,
  SQL_INTELLIGENCE_PRESETS,
  SQL_JOIN_SPECS,
  type SqlJoinKind,
  type SqlReferenceCategory,
} from '../../data/sqlMasteryIntelligenceData';
import {
  analyzeSqlIntelligence,
  createInitialMiniDatabase,
} from '../../utils/miniSqlEngine';
import { CopyButton, SegmentedTabBar } from '../ui';

type LabSubView = 'joins-ops-fns' | 'intelligence-engine' | 'fetch-insert-compress';
type FetchStrategy = 'offset' | 'keyset' | 'covering-keyset';
type InsertStrategy = 'single-row' | 'batch-1k' | 'copy-deferred';
type CompressionCodec = 'none' | 'lz4' | 'zstd' | 'columnar-zstd';

export function SqlQueryIntelligenceLab() {
  const [subView, setSubView] = useState<LabSubView>('joins-ops-fns');

  // --- Sub-View 1: Joins Venn + Complete Operators / Functions / Fetch Reference ---
  const [activeJoinId, setActiveJoinId] = useState<SqlJoinKind>('left');
  const [refCategory, setRefCategory] = useState<'all' | SqlReferenceCategory>('all');

  const activeJoin = useMemo(
    () => SQL_JOIN_SPECS.find((j) => j.id === activeJoinId) ?? SQL_JOIN_SPECS[0],
    [activeJoinId]
  );

  const visibleRefItems = useMemo(
    () =>
      refCategory === 'all'
        ? SQL_COMPLETE_REFERENCE
        : SQL_COMPLETE_REFERENCE.filter((r) => r.category === refCategory),
    [refCategory]
  );

  // --- Sub-View 2: Enhanced SQL Intelligence Review & Recommendation Engine ---
  const [sampleDb] = useState(() => createInitialMiniDatabase());
  const [reviewSql, setReviewSql] = useState<string>(SQL_INTELLIGENCE_PRESETS[0].sql);
  const [activePresetId, setActivePresetId] = useState<string>(SQL_INTELLIGENCE_PRESETS[0].id);

  const intelligenceReport = useMemo(
    () => analyzeSqlIntelligence(reviewSql, sampleDb),
    [reviewSql, sampleDb]
  );

  const handleInspectInEngine = (sql: string) => {
    setReviewSql(sql);
    setActivePresetId('custom');
    setSubView('intelligence-engine');
  };

  // --- Sub-View 3: Animated Fast-Fetch -> Bulk Insert & Compression Pipeline ---
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [isPipelinePlaying, setIsPipelinePlaying] = useState<boolean>(false);
  const [rowCountK, setRowCountK] = useState<number>(500); // thousands of rows (10k -> 5,000k)
  const [fetchStrategy, setFetchStrategy] = useState<FetchStrategy>('covering-keyset');
  const [insertStrategy, setInsertStrategy] = useState<InsertStrategy>('copy-deferred');
  const [codec, setCodec] = useState<CompressionCodec>('zstd');

  useEffect(() => {
    if (!isPipelinePlaying) return;
    const id = window.setInterval(() => {
      setStageIdx((prev) => (prev + 1) % FAST_FETCH_TO_COMPRESS_STAGES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [isPipelinePlaying]);

  const pipelineMetrics = useMemo(() => {
    const rows = rowCountK * 1000;
    const rawSizeGb = (rows * 420) / (1024 * 1024 * 1024); // ~420 bytes avg row payload

    const fetchMsPer100k =
      fetchStrategy === 'offset' ? 1450 : fetchStrategy === 'keyset' ? 210 : 75;
    const fetchMs = Math.round((rowCountK / 100) * fetchMsPer100k);

    const insertRowsPerSec =
      insertStrategy === 'single-row'
        ? 1800
        : insertStrategy === 'batch-1k'
          ? 42000
          : 165000;
    const insertMs = Math.round((rows / insertRowsPerSec) * 1000);

    const compressionRatio =
      codec === 'none' ? 1.0 : codec === 'lz4' ? 2.6 : codec === 'zstd' ? 4.1 : 6.8;
    const compressedGb = rawSizeGb / compressionRatio;
    const cpuOverheadPct =
      codec === 'none' ? 2 : codec === 'lz4' ? 7 : codec === 'zstd' ? 16 : 21;
    const walReductionPct =
      insertStrategy === 'copy-deferred' ? 78 : insertStrategy === 'batch-1k' ? 54 : 0;

    return {
      rows,
      rawSizeMb: Math.round(rawSizeGb * 1024),
      compressedMb: Math.max(1, Math.round(compressedGb * 1024)),
      compressionRatio,
      fetchMs,
      insertMs,
      totalSec: ((fetchMs + insertMs) / 1000).toFixed(2),
      insertRowsPerSec,
      cpuOverheadPct,
      walReductionPct,
    };
  }, [rowCountK, fetchStrategy, insertStrategy, codec]);

  const activePipelineStage = FAST_FETCH_TO_COMPRESS_STAGES[stageIdx];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Complete SQL Mastery &amp; Intelligence Engine
              </span>
              <span aria-hidden="true">·</span>
              <span>All Operators, Functions, 7 Joins, Fetch Patterns &amp; Insert Compression</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              SQL Operators, Functions, Joins &amp; Fast-Fetch-to-Compression Optimizer
            </h2>
          </div>

          <SegmentedTabBar<LabSubView>
            ariaLabel="SQL Mastery and Intelligence sections"
            activeTab={subView}
            onChange={setSubView}
            size="xs"
            tabs={[
              { id: 'joins-ops-fns', label: 'Joins, Operators & Functions', shortLabel: 'SQL Catalog', icon: Layers },
              { id: 'intelligence-engine', label: 'Intelligence Review Engine', shortLabel: 'Review Engine', icon: Sparkles },
              { id: 'fetch-insert-compress', label: 'Fast Fetch -> Insert Compression', shortLabel: 'Compression Lab', icon: Zap },
            ]}
          />
        </div>
      </section>

      {/* SUB-VIEW 1: INTERACTIVE JOINS VENN + COMPLETE OPERATORS / FUNCTIONS / FETCH PATTERNS */}
      {subView === 'joins-ops-fns' && (
        <div className="space-y-6">
          {/* Interactive 7-Join Venn & Row Matcher */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Visual SQL Join Explorer (All 7 Join Patterns)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Select any join type to inspect the Venn overlap, NULL-padding behavior, planner join algorithm, and exact SQL.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SQL_JOIN_SPECS.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setActiveJoinId(j.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap ${
                      j.id === activeJoin.id
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {j.shortName}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5: SVG Venn + Simple English */}
              <div className="lg:col-span-5 space-y-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 flex flex-col items-center">
                  <svg viewBox="0 0 320 150" role="img" aria-label={activeJoin.name} className="w-full max-w-[290px] h-auto">
                    <defs>
                      <clipPath id="clip-left-circle">
                        <circle cx="122" cy="76" r="52" />
                      </clipPath>
                    </defs>
                    {/* Left Circle */}
                    <circle
                      cx="122"
                      cy="76"
                      r="52"
                      fill={activeJoin.vennMask.left ? '#0284c7' : 'transparent'}
                      fillOpacity={activeJoin.vennMask.left ? 0.25 : 0}
                      stroke="#0284c7"
                      strokeWidth="2"
                    />
                    {/* Right Circle */}
                    <circle
                      cx="198"
                      cy="76"
                      r="52"
                      fill={activeJoin.vennMask.right ? '#10b981' : 'transparent'}
                      fillOpacity={activeJoin.vennMask.right ? 0.25 : 0}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    {/* Intersection Overlay */}
                    {activeJoin.vennMask.overlap && (
                      <circle
                        cx="198"
                        cy="76"
                        r="52"
                        clipPath="url(#clip-left-circle)"
                        fill="#0284c7"
                        fillOpacity="0.55"
                      />
                    )}
                    <text x="96" y="79" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-900 dark:fill-slate-100">
                      users
                    </text>
                    <text x="224" y="79" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-900 dark:fill-slate-100">
                      orders
                    </text>
                    <text x="160" y="142" textAnchor="middle" className="text-[10px] font-mono font-semibold fill-sky-700 dark:fill-sky-400">
                      {activeJoin.name}
                    </text>
                  </svg>
                </div>

                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 text-xs space-y-1">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                    In Simple English
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">
                    {activeJoin.simpleEnglish}
                  </p>
                </div>

                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 px-1">
                  Planner Tip: {activeJoin.algorithmNote}
                </div>
              </div>

              {/* Right 7: Exact SQL + Live Row Result Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Standard SQL Pattern
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInspectInEngine(activeJoin.sqlExample)}
                        className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                      >
                        Analyze in Intelligence Engine →
                      </button>
                      <CopyButton text={activeJoin.sqlExample} label="Copy" copiedLabel="Copied" size="xs" />
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                    {activeJoin.sqlExample}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                    Result Set Visualization ({activeJoin.resultRows.length} sample rows)
                  </div>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Left Side</th>
                        <th className="py-2 px-3">Right Side</th>
                        <th className="py-2 px-3">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activeJoin.resultRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 text-slate-900 dark:text-slate-100">{row.leftVal}</td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.rightVal}</td>
                          <td className="py-2 px-3 text-sky-700 dark:text-sky-400 font-semibold">
                            {row.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Complete Operators, Functions, Window & Fetching Patterns Reference */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Complete SQL Operators, Functions &amp; Data-Fetching Playbook
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Every SQL operator, scalar/window function, CTE/LATERAL/EXISTS fetching pattern, and fast-insert compression idiom with 1-click Intelligence Engine inspection.
                </p>
              </div>
              <SegmentedTabBar<'all' | SqlReferenceCategory>
                ariaLabel="Filter SQL operators and functions category"
                activeTab={refCategory}
                onChange={setRefCategory}
                size="xs"
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'operators', label: 'Operators' },
                  { id: 'functions', label: 'Scalar Functions' },
                  { id: 'window-agg', label: 'Aggregates & Window' },
                  { id: 'fetch-patterns', label: 'Fetching Ways' },
                  { id: 'fast-insert-compression', label: 'Insert & Compress' },
                ]}
              />
            </div>

            <div className="space-y-4">
              {visibleRefItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                >
                  <div className="lg:col-span-7 space-y-2 text-xs leading-5">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
                      Syntax: {item.syntax}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>Simple English:</strong> {item.simpleEnglish}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Performance &amp; Indexing Rule:</strong> {item.performanceNote}
                    </p>
                  </div>

                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleInspectInEngine(item.sqlExample)}
                        className="font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                      >
                        Review in Intelligence Engine →
                      </button>
                      <CopyButton text={item.sqlExample} label="Copy" copiedLabel="Copied" size="xs" />
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                      {item.sqlExample}
                    </pre>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SUB-VIEW 2: ENHANCED SQL INTELLIGENCE REVIEW & RECOMMENDATION ENGINE */}
      {subView === 'intelligence-engine' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Enhanced SQL Intelligence Engine — Live Query Review &amp; Rewrite Recommender
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Detects non-SARGable predicates, leading wildcards, deep OFFSET scans, NOT IN NULL traps, SELECT * bloat, unbatched INSERT loops, and suggests exact Index DDL + LZ4/ZSTD compression rewrites.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SQL_INTELLIGENCE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActivePresetId(preset.id);
                    setReviewSql(preset.sql);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                    activePresetId === preset.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 6: Live SQL Input + Score Summary */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Paste or Edit SQL Query to Audit Live
                  </span>
                  <CopyButton text={reviewSql} label="Copy SQL" copiedLabel="Copied" size="xs" />
                </div>
                <textarea
                  aria-label="SQL Intelligence Engine Input"
                  value={reviewSql}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setReviewSql(e.target.value);
                  }}
                  rows={9}
                  spellCheck={false}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-6 p-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* 4 Intelligence KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">SQL Health Score</div>
                  <div
                    className={`text-2xl font-mono font-bold tabular-nums ${
                      intelligenceReport.score >= 85
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : intelligenceReport.score >= 60
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {intelligenceReport.score}/100 ({intelligenceReport.grade})
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Estimated Speedup</div>
                  <div className="text-base font-mono font-bold text-sky-700 dark:text-sky-400 mt-1">
                    {intelligenceReport.estimatedSpeedup}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Detected Path</div>
                  <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {intelligenceReport.detectedScan}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Compression Gain</div>
                  <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                    {intelligenceReport.compressionOpportunity}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6: Prioritized Actionable Recommendations & Auto-DDL */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prioritized DBA Recommendations ({intelligenceReport.findings.length})
              </div>
              {intelligenceReport.findings.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-xl border p-4 space-y-2 text-xs ${
                    f.severity === 'critical'
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/25'
                      : f.severity === 'high'
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/25'
                        : f.severity === 'good'
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/25'
                          : 'border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-bold uppercase text-slate-900 dark:text-slate-100">
                      {f.severity === 'good' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            f.severity === 'critical'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      {f.severity} · {f.category}
                    </span>
                    <span className="font-semibold text-sky-700 dark:text-sky-400">
                      {f.estimatedImpact}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{f.title}</div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">{f.explanation}</p>
                  <p className="text-slate-800 dark:text-slate-200 leading-5">
                    <strong>Recommended Fix:</strong> {f.recommendation}
                  </p>
                  {f.suggestedSql && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Recommended DDL / Optimized Rewrite
                        </span>
                        <CopyButton text={f.suggestedSql} label="Copy Fix" copiedLabel="Copied" size="xs" />
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-950 text-emerald-300 font-mono text-[11px] leading-5 overflow-x-auto border border-slate-800">
                        {f.suggestedSql}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: FAST FETCH -> BULK INSERT & STORAGE COMPRESSION PIPELINE */}
      {subView === 'fetch-insert-compress' && (
        <div className="space-y-6">
          {/* Animated 4-Stage Fetch-to-Insert Compression Lifecycle */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Animated Pipeline: Fast Fetch → Wire Batching → Bulk Insert → Storage Compression
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Trace how production data pipelines move millions of rows from OLTP reads into compressed analytical/archive storage with minimal latency and disk footprint.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPipelinePlaying((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
              >
                {isPipelinePlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    Pause Flow
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Animate Pipeline
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {FAST_FETCH_TO_COMPRESS_STAGES.map((st, idx) => {
                const active = idx === stageIdx;
                return (
                  <button
                    key={st.step}
                    type="button"
                    onClick={() => {
                      setIsPipelinePlaying(false);
                      setStageIdx(idx);
                    }}
                    className={`text-left rounded-xl border p-4 space-y-1.5 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                      <span>{st.subtitle}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {st.title}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                      {st.impact}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              <div className="lg:col-span-7 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {activePipelineStage.title} — Simple English Explanation
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-5">
                  {activePipelineStage.plainEnglish}
                </p>
              </div>
              <div className="lg:col-span-5 space-y-1 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-4">
                <div className="font-semibold text-sky-700 dark:text-sky-400">
                  Engine Mechanism
                </div>
                <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-5">
                  {activePipelineStage.mechanism}
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Fast-Fetch -> Insert Compression Trade-Off Simulator */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Interactive Fast-Fetch &amp; Insert-Compression Trade-Off Simulator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Tune extraction method, batching strategy, and storage compression codec to compare end-to-end migration speed, WAL savings, and compressed disk size.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Dataset Volume
                    </span>
                    <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                      {(rowCountK * 1000).toLocaleString()} rows (~{pipelineMetrics.rawSizeMb} MB raw)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={5000}
                    step={50}
                    value={rowCountK}
                    onChange={(e) => setRowCountK(Number(e.target.value))}
                    aria-label="Dataset volume in thousands of rows"
                    className="w-full accent-sky-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    1. Source Fetch Strategy
                  </div>
                  <SegmentedTabBar<FetchStrategy>
                    ariaLabel="Source fetch strategy"
                    activeTab={fetchStrategy}
                    onChange={setFetchStrategy}
                    size="xs"
                    tabs={[
                      { id: 'offset', label: 'OFFSET + SELECT *' },
                      { id: 'keyset', label: 'Keyset Seek' },
                      { id: 'covering-keyset', label: 'Covering Index + Seek' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    2. Target Insert Strategy
                  </div>
                  <SegmentedTabBar<InsertStrategy>
                    ariaLabel="Target insert strategy"
                    activeTab={insertStrategy}
                    onChange={setInsertStrategy}
                    size="xs"
                    tabs={[
                      { id: 'single-row', label: '1-by-1 INSERT' },
                      { id: 'batch-1k', label: 'Batch 1k VALUES' },
                      { id: 'copy-deferred', label: 'COPY + Deferred Index' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    3. Insert / Storage Compression Codec
                  </div>
                  <SegmentedTabBar<CompressionCodec>
                    ariaLabel="Storage compression codec"
                    activeTab={codec}
                    onChange={setCodec}
                    size="xs"
                    tabs={[
                      { id: 'none', label: 'None (1.0x)' },
                      { id: 'lz4', label: 'PG TOAST LZ4' },
                      { id: 'zstd', label: 'ZSTD Block' },
                      { id: 'columnar-zstd', label: 'Columnar Delta+ZSTD' },
                    ]}
                  />
                </div>
              </div>

              {/* Right: Live Telemetry Readouts */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      End-to-End Pipeline Time
                    </div>
                    <div className="text-xl font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                      {pipelineMetrics.totalSec} s
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      Fetch {pipelineMetrics.fetchMs}ms · Insert {pipelineMetrics.insertMs}ms
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ingest Throughput
                    </div>
                    <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {pipelineMetrics.insertRowsPerSec.toLocaleString()} rows/s
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
                      WAL saved: {pipelineMetrics.walReductionPct}%
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compressed Storage Size
                    </div>
                    <div className="text-xl font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {pipelineMetrics.compressedMb} MB
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                      Down from {pipelineMetrics.rawSizeMb} MB ({pipelineMetrics.compressionRatio}x ratio)
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compression CPU Cost
                    </div>
                    <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      +{pipelineMetrics.cpuOverheadPct}% CPU
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Saves {Math.round((1 - 1 / pipelineMetrics.compressionRatio) * 100)}% Disk &amp; IOPS
                    </div>
                  </div>
                </div>

                {/* Compression Bar Visual */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      Disk Footprint Comparison
                    </span>
                    <span className="tabular-nums text-emerald-700 dark:text-emerald-400 font-bold">
                      -{Math.round((1 - 1 / pipelineMetrics.compressionRatio) * 100)}% Storage
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="w-20 text-slate-500 dark:text-slate-400">Raw</span>
                      <div className="flex-1 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="w-16 text-right tabular-nums">{pipelineMetrics.rawSizeMb} MB</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="w-20 text-emerald-700 dark:text-emerald-400 font-semibold">Compressed</span>
                      <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-200"
                          style={{ width: `${Math.max(8, Math.round(100 / pipelineMetrics.compressionRatio))}%` }}
                        />
                      </div>
                      <span className="w-16 text-right tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                        {pipelineMetrics.compressedMb} MB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
