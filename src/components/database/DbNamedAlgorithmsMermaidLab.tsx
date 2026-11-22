import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  DB_COMPLETENESS_AUDIT_DOMAINS,
  DB_NAMED_ALGORITHMS,
  type DbAlgoDomain,
} from '../../data/dbNamedAlgorithmsArchitectureData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { CopyButton, SegmentedTabBar } from '../ui';

const DOMAIN_OPTIONS: ('All' | DbAlgoDomain)[] = [
  'All',
  'Storage & Indexing',
  'Query & Joins',
  'Concurrency & Isolation',
  'Recovery & Durability',
  'Distributed & Sharding',
  'Vector & AI Indexing',
];

export const DbNamedAlgorithmsMermaidLab: React.FC = () => {
  const [domainFilter, setDomainFilter] = useState<'All' | DbAlgoDomain>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>(DB_NAMED_ALGORITHMS[0].id);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showAuditMatrix, setShowAuditMatrix] = useState<boolean>(false);

  const filteredAlgos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DB_NAMED_ALGORITHMS.filter((algo) => {
      if (domainFilter !== 'All' && algo.domain !== domainFilter) return false;
      if (!q) return true;
      return (
        algo.name.toLowerCase().includes(q) ||
        algo.shortName.toLowerCase().includes(q) ||
        algo.domain.toLowerCase().includes(q) ||
        algo.usedBy.some((u) => u.toLowerCase().includes(q)) ||
        algo.plainEnglish.toLowerCase().includes(q)
      );
    });
  }, [domainFilter, searchQuery]);

  const activeAlgo = useMemo(
    () => filteredAlgos.find((a) => a.id === selectedId) ?? filteredAlgos[0] ?? DB_NAMED_ALGORITHMS[0],
    [filteredAlgos, selectedId]
  );

  useEffect(() => {
    setStepIdx(0);
  }, [activeAlgo.id]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion || activeAlgo.animationSteps.length <= 1) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % activeAlgo.animationSteps.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isPlaying, prefersReducedMotion, activeAlgo.animationSteps.length]);

  const activeStep =
    activeAlgo.animationSteps[Math.min(stepIdx, activeAlgo.animationSteps.length - 1)];

  return (
    <div className="space-y-5">
      {/* Architect Review Header & Completeness Controls */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Senior Database Architect &amp; System Analyst Reference
              </span>
              <span aria-hidden="true">·</span>
              <span>{DB_NAMED_ALGORITHMS.length} Canonical Named DBMS Algorithms</span>
              <span aria-hidden="true">·</span>
              <span>Animated Visualizations + Live Mermaid.js Diagrams</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              Complete Named Database Algorithms, Internals &amp; Mermaid Flow Encyclopedia
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              End-to-end architectural audit covering every core DBMS kernel subsystem—Storage, Indexing, Query Optimization, Joins, Concurrency Control, ARIES Crash Recovery, Distributed Consensus, Sharding, and Vector ANN—with definitions, worked examples, step-by-step animations, and Mermaid.js diagrams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAuditMatrix((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                showAuditMatrix
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-sky-500'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {showAuditMatrix ? 'Hide Completeness Audit' : 'View Completeness Audit (6 Layers)'}
            </button>
          </div>
        </div>

        {/* Optional Architect Completeness Matrix */}
        {showAuditMatrix && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-1">
            {DB_COMPLETENESS_AUDIT_DOMAINS.map((item) => (
              <div
                key={item.domain}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.domain}
                  </span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                    {item.algorithmsCount} Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-5">
                  {item.coverageScope}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Domain Filter + Quick Search */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
          <SegmentedTabBar<'All' | DbAlgoDomain>
            ariaLabel="Filter named database algorithms by kernel subsystem"
            activeTab={domainFilter}
            onChange={setDomainFilter}
            wrap
            size="xs"
            tabs={DOMAIN_OPTIONS.map((d) => ({
              id: d,
              label: d === 'All' ? `All (${DB_NAMED_ALGORITHMS.length})` : d,
            }))}
          />

          <div className="relative w-full xl:w-72 shrink-0">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ARIES, B+Tree, LSM, Raft, SSI..."
              aria-label="Search named database algorithms"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </section>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Algorithm Catalog */}
        <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Named Algorithms Catalog
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {filteredAlgos.length} shown
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[820px] overflow-y-auto">
            {filteredAlgos.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No named algorithm matches "{searchQuery}". Clear search to view all {DB_NAMED_ALGORITHMS.length} algorithms.
              </div>
            ) : (
              filteredAlgos.map((algo) => {
                const isSelected = algo.id === activeAlgo.id;
                return (
                  <button
                    key={algo.id}
                    type="button"
                    onClick={() => setSelectedId(algo.id)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold tabular-nums w-6 shrink-0 mt-0.5 ${
                        isSelected
                          ? 'text-sky-700 dark:text-sky-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {String(algo.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {algo.shortName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {algo.domain} · {algo.usedBy.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Detailed Architect View */}
        <div className="xl:col-span-8 space-y-5">
          {/* 1. Definition, Inventors & Complexity Matrix */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                  Algorithm #{String(activeAlgo.number).padStart(2, '0')}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeAlgo.domain}</span>
                <span aria-hidden="true">·</span>
                <span>{activeAlgo.inventorsOrPaper}</span>
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
                {activeAlgo.name}
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Production Engines: <span className="font-medium text-slate-700 dark:text-slate-300">{activeAlgo.usedBy.join(' · ')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Plain-English Mental Model
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-5">
                  {activeAlgo.plainEnglish}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Formal Systems Definition
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-5">
                  {activeAlgo.formalDefinition}
                </p>
              </div>
            </div>

            {/* 4-Col Complexity & Guarantees Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 space-y-0.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Time Complexity</div>
                <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {activeAlgo.complexity.time}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 space-y-0.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Space Profile</div>
                <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {activeAlgo.complexity.space}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 space-y-0.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Disk / Network I/O</div>
                <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {activeAlgo.complexity.diskIo}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 space-y-0.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Guarantees</div>
                <div className="font-medium text-emerald-700 dark:text-emerald-400">
                  {activeAlgo.complexity.guarantees}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Interactive Step-by-Step Algorithm Animation Stage */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  <span>Interactive Kernel Algorithm Animation</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Step {stepIdx + 1} / {activeAlgo.animationSteps.length} ({activeStep.phase})
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeAlgo.animationTitle}
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(
                      (prev) =>
                        (prev - 1 + activeAlgo.animationSteps.length) %
                        activeAlgo.animationSteps.length
                    );
                  }}
                  aria-label="Previous animation step"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx((prev) => (prev + 1) % activeAlgo.animationSteps.length);
                  }}
                  aria-label="Next animation step"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(0);
                  }}
                  aria-label="Reset animation"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeStep.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-5">
                  {activeStep.explanation}
                </p>
              </div>

              {/* Animated Kernel State Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeStep.blocks.map((blk) => (
                  <div
                    key={blk.id}
                    className={`rounded-lg border p-3 transition-all duration-200 ${
                      blk.state === 'highlight'
                        ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/35'
                        : blk.state === 'active'
                          ? 'border-sky-400 dark:border-sky-700 bg-sky-50/70 dark:bg-sky-950/35'
                          : blk.state === 'warn'
                            ? 'border-rose-400 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/35'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 opacity-75'
                    }`}
                  >
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {blk.label}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      {blk.sublabel}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Metrics + Worked Example */}
              <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
                {activeStep.metrics.map((m) => (
                  <div key={m.label} className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">{m.label}:</span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Worked Numeric Example:{' '}
                </span>
                {activeAlgo.workedExample}
              </div>
            </div>
          </section>

          {/* 3. Live Rendered Mermaid.js Flow View */}
          <FlightMermaidViewer
            title={`${activeAlgo.shortName} — Architecture & Execution Flow (Mermaid.js)`}
            subtitle="Live syntax-rendered Mermaid.js diagram with source toggle and copyable blueprint."
            mermaidCode={activeAlgo.mermaidDiagram}
          />

          {/* 4. Use Cases, Anti-Patterns, SQL/Config & Completeness Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                Production Use Cases
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                {activeAlgo.useCases.map((u) => (
                  <li key={u} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  When NOT to Use (Anti-Patterns)
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                  {activeAlgo.whenNotToUse.map((w) => (
                    <li key={w} className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100">
                <span className="text-xs font-semibold truncate">{activeAlgo.sqlOrConfigTitle}</span>
                <CopyButton text={activeAlgo.sqlOrConfig} label="Copy" />
              </div>
              <pre className="p-3.5 text-xs font-mono text-slate-100 bg-slate-950 overflow-x-auto leading-5 flex-1">
                {activeAlgo.sqlOrConfig}
              </pre>
              <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100 mr-1">
                  <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Architect Completeness Review:
                </span>
                {activeAlgo.completenessNotes}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
