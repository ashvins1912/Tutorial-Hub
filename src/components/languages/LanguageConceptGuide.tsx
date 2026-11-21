import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  PlayCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  LANGUAGE_CONCEPTS,
  type LangTrack,
  type SkillLevel,
} from '../../data/languagesTutorialData';
import { CopyButton, SegmentedTabBar } from '../ui';

interface LanguageConceptGuideProps {
  languageFilter: 'all' | LangTrack;
  understoodConceptIds: string[];
  onToggleUnderstood: (id: string) => void;
  onOpenVisualFlow: (flowId: string) => void;
}

export function LanguageConceptGuide({
  languageFilter,
  understoodConceptIds,
  onToggleUnderstood,
  onOpenVisualFlow,
}: LanguageConceptGuideProps) {
  const [levelFilter, setLevelFilter] = useState<'All' | SkillLevel>('All');
  const [topicFilter, setTopicFilter] = useState<
    'all' | 'foundations' | 'collections' | 'concurrency' | 'runtime'
  >('all');
  const [query, setQuery] = useState('');

  const filteredConcepts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANGUAGE_CONCEPTS.filter((c) => {
      if (languageFilter !== 'all' && c.language !== languageFilter) return false;
      if (levelFilter !== 'All' && c.level !== levelFilter) return false;
      if (topicFilter !== 'all') {
        const hay = `${c.category} ${c.title}`.toLowerCase();
        if (
          topicFilter === 'collections' &&
          !/(collection|deque|hashmap|list|dict|set|queue|stream)/.test(hay)
        ) {
          return false;
        }
        if (
          topicFilter === 'concurrency' &&
          !/(thread|concurrency|async|gil|lock|executor|completable|multiprocess|virtual)/.test(hay)
        ) {
          return false;
        }
        if (
          topicFilter === 'foundations' &&
          !/(foundation|oop|control|exception|optional|resilient|idiomatic|pattern|data-oriented)/.test(hay)
        ) {
          return false;
        }
        if (
          topicFilter === 'runtime' &&
          !/(memory|zgc|jmm|panama|jit|descriptor|typing|generic|frontier)/.test(hay)
        ) {
          return false;
        }
      }
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.simpleEnglish.toLowerCase().includes(q) ||
        c.standardDefinition.toLowerCase().includes(q) ||
        c.codeExample.toLowerCase().includes(q)
      );
    });
  }, [languageFilter, levelFilter, topicFilter, query]);

  return (
    <div className="space-y-5">
      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <SegmentedTabBar<'All' | SkillLevel>
            ariaLabel="Filter concepts by skill level"
            activeTab={levelFilter}
            onChange={setLevelFilter}
            size="xs"
            tabs={[
              { id: 'All', label: 'All Levels' },
              { id: 'Basic', label: 'Basic' },
              { id: 'Intermediate', label: 'Intermediate' },
              { id: 'Advanced', label: 'Advanced' },
            ]}
          />

          <div className="relative w-full md:w-72">
            <Search
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search HashMap, deque, Lock, GIL, Virtual..."
              aria-label="Search Python and Java concepts"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <SegmentedTabBar<'all' | 'foundations' | 'collections' | 'concurrency' | 'runtime'>
            ariaLabel="Filter concepts by topic domain"
            activeTab={topicFilter}
            onChange={setTopicFilter}
            size="xs"
            tabs={[
              { id: 'all', label: 'All Topics' },
              { id: 'foundations', label: 'Basics, OOP & Errors' },
              { id: 'collections', label: 'Collections & Streams' },
              { id: 'concurrency', label: 'Multithreading & Async' },
              { id: 'runtime', label: 'Memory, Types & Internals' },
            ]}
          />
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Showing {filteredConcepts.length} of {LANGUAGE_CONCEPTS.length} topics
          </span>
        </div>
      </div>

      {/* Empty Search State */}
      {filteredConcepts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No matching concepts found
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Try clearing your search term or switching back to All Levels.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConcepts.map((concept) => {
            const isUnderstood = understoodConceptIds.includes(concept.id);
            return (
              <article
                key={concept.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className={`font-mono font-semibold ${
                          concept.language === 'python'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {concept.versionTag}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-sky-700 dark:text-sky-400">
                        {concept.level}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{concept.category}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {concept.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenVisualFlow(concept.relatedFlowId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors whitespace-nowrap shrink-0"
                    >
                      <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Watch Animation
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleUnderstood(concept.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        isUnderstood
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isUnderstood ? (
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      {isUnderstood ? 'Understood' : 'Mark Clear'}
                    </button>
                  </div>
                </div>

                {/* 2-Column Content: Definitions & Application (Left) + Code Example (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  <div className="lg:col-span-7 space-y-3 text-xs leading-5">
                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                      <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Simple English Explanation
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{concept.simpleEnglish}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          Standard Technical Definition
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          {concept.standardDefinition}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          Real-World Production Use
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          {concept.realWorldApplication}
                        </p>
                      </div>
                    </div>

                    <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400 px-1">
                      Runtime &amp; Complexity: {concept.runtimeAndComplexity}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3 space-y-1">
                        <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          Common Trap
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{concept.commonTrap}</p>
                      </div>
                      <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 p-3 space-y-1">
                        <div className="font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          Clear Solution
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{concept.clearSolution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right 5 Cols: Copyable Production Code Example */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Modern {concept.versionTag} Code Pattern
                      </span>
                      <CopyButton text={concept.codeExample} label="Copy" copiedLabel="Copied" size="xs" />
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                      {concept.codeExample}
                    </pre>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
