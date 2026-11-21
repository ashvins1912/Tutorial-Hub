import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Cpu,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  ARCHITECT_CONCEPTS,
  type ArchitectConcept,
} from '../../data/databaseVisualData';
import { CopyButton, SegmentedTabBar } from '../ui';

type ConceptCategoryFilter = 'All' | ArchitectConcept['category'];

interface DatabaseConceptGuideProps {
  understoodConceptIds: string[];
  onToggleUnderstood: (conceptId: string) => void;
  onOpenVisualFlow: (flowId: string) => void;
}

export function DatabaseConceptGuide({
  understoodConceptIds,
  onToggleUnderstood,
  onOpenVisualFlow,
}: DatabaseConceptGuideProps) {
  const [category, setCategory] = useState<ConceptCategoryFilter>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(ARCHITECT_CONCEPTS[0].id);

  const filteredConcepts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCHITECT_CONCEPTS.filter((c) => {
      if (category !== 'All' && c.category !== category) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.simpleEnglish.toLowerCase().includes(q) ||
        c.standardDefinition.toLowerCase().includes(q) ||
        c.algorithmDetails.name.toLowerCase().includes(q) ||
        c.clearSolution.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const activeConcept = useMemo(
    () =>
      filteredConcepts.find((c) => c.id === selectedId) ??
      filteredConcepts[0] ??
      ARCHITECT_CONCEPTS[0],
    [filteredConcepts, selectedId]
  );

  const isUnderstood = understoodConceptIds.includes(activeConcept.id);

  return (
    <div className="space-y-5">
      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <SegmentedTabBar<ConceptCategoryFilter>
          ariaLabel="Filter database concepts by architecture pillar"
          activeTab={category}
          onChange={setCategory}
          size="xs"
          tabs={[
            { id: 'All', label: 'All Pillars', count: ARCHITECT_CONCEPTS.length },
            { id: 'Query Engine', label: 'Query Engine' },
            { id: 'Storage & Indexing', label: 'Storage & Indexing' },
            { id: 'Concurrency & ACID', label: 'Concurrency & ACID' },
            { id: 'Distributed Systems', label: 'Distributed' },
            { id: 'Security, CDC & AI', label: 'Security, CDC & AI' },
          ]}
        />

        <div className="relative w-full lg:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, algorithms, SQL..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Master-Detail Architect Encyclopedia */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 4 Cols: Concept Index */}
        <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Architect&apos;s Core Curriculum
            </span>
            <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400 font-semibold">
              {understoodConceptIds.length}/{ARCHITECT_CONCEPTS.length} Confident
            </span>
          </div>

          <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConcepts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No concepts match &quot;{query}&quot;. Try clearing your filter.
              </div>
            ) : (
              filteredConcepts.map((item) => {
                const selected = item.id === activeConcept.id;
                const understood = understoodConceptIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-2.5 ${
                      selected
                        ? 'bg-sky-50/80 dark:bg-sky-950/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 shrink-0">
                      {String(item.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.category}
                      </div>
                    </div>
                    {understood && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right 8 Cols: 6-Pillar Concept Blueprint */}
        <article className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                Concept {String(activeConcept.number).padStart(2, '0')} · {activeConcept.category}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {activeConcept.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenVisualFlow(activeConcept.relatedFlowId)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Watch Animated DFD
              </button>
              <button
                type="button"
                onClick={() => onToggleUnderstood(activeConcept.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  isUnderstood
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {isUnderstood ? 'Confident & Mastered' : 'Mark as Understood'}
              </button>
            </div>
          </div>

          {/* 1. Simple English Mental Model */}
          <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 p-4 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              In Simple English (Everyday Mental Model)
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-6">
              {activeConcept.simpleEnglish}
            </p>
          </div>

          {/* 2. Standard Definition & 3. Real-World Application */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Standard Technical Definition
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                {activeConcept.standardDefinition}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Standard Real-World Application
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                {activeConcept.realWorldApplication}
              </p>
            </div>
          </div>

          {/* 4. Algorithm & Data Structure Deep-Dive */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Algorithm &amp; Internal Data Structure
              </div>
              <span className="text-xs font-mono text-sky-700 dark:text-sky-400">
                {activeConcept.algorithmDetails.complexity}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Algorithm</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeConcept.algorithmDetails.name}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Core Data Structure</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeConcept.algorithmDetails.dataStructure}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-6 pt-2 border-t border-slate-200 dark:border-slate-800">
              {activeConcept.algorithmDetails.howItWorks}
            </p>
          </div>

          {/* 5. Common Production Trap vs. 6. Clear Verified Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                Common Production Mistake
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                {activeConcept.commonTrap}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Clear Architect Solution
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                {activeConcept.clearSolution}
              </p>
            </div>
          </div>

          {/* Copyable Production Pattern */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Verified Production Pattern
              </span>
              <CopyButton text={activeConcept.codeExample} label="Copy Pattern" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
              {activeConcept.codeExample}
            </pre>
          </div>
        </article>
      </div>
    </div>
  );
}
