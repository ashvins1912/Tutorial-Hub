import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  HelpCircle,
  Radio,
} from 'lucide-react';
import {
  EDA_HANDBOOK_CHAPTERS,
  SYSTEM_DESIGN_30_CONCEPTS,
  type SystemDesignConcept30,
} from '../../data/eventDrivenAnd30ConceptsData';
import { useAccountState } from '../../hooks/useAccountState';
import { CatalogSearchInput } from '../ui';

export const EventDrivenAnd30ConceptsView: React.FC = () => {
  const [subMode, setSubMode] = useState<'eda' | 'concepts30'>('eda');
  const [selectedEdaId, setSelectedEdaId] = useState<string>(EDA_HANDBOOK_CHAPTERS[0].id);
  const [groupFilter, setGroupFilter] = useState<'All' | SystemDesignConcept30['group']>('All');
  const [query, setQuery] = useState('');
  const [checkedConcepts, setCheckedConcepts] = useAccountState<string[]>(
    'sd-30-concepts-mastered',
    [],
    'patternforge_sd_30_concepts_v1'
  );

  const selectedEda =
    EDA_HANDBOOK_CHAPTERS.find((ch) => ch.id === selectedEdaId) ?? EDA_HANDBOOK_CHAPTERS[0];

  const filteredConcepts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SYSTEM_DESIGN_30_CONCEPTS.filter((item) => {
      const matchGroup = groupFilter === 'All' || item.group === groupFilter;
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.plainDefinition.toLowerCase().includes(q) ||
        item.indianExample.toLowerCase().includes(q);
      return matchGroup && matchQuery;
    });
  }, [groupFilter, query]);

  const toggleConcept = (id: string) => {
    setCheckedConcepts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSubMode('eda')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subMode === 'eda'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Event-Driven Architecture &amp; Kafka ({EDA_HANDBOOK_CHAPTERS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubMode('concepts30')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              subMode === 'concepts30'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>30 Must-Know Concepts ({checkedConcepts.length}/30)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Plain-language framing · Indian production examples (UPI, Zomato, IRCTC, Flipkart)
        </div>
      </div>

      {/* MODE 1: EVENT-DRIVEN ARCHITECTURE HANDBOOK */}
      {subMode === 'eda' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden lg:sticky lg:top-24">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Event-Driven Architecture Chapters
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kafka · Sagas · Idempotency · DLQ · Schema Registry
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {EDA_HANDBOOK_CHAPTERS.map((ch) => {
                const selected = ch.id === selectedEda.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedEdaId(ch.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selected
                        ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`text-[11px] font-mono ${
                        selected
                          ? 'text-sky-300 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Chapter {ch.number}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold leading-snug mt-0.5">
                      {ch.title}
                    </div>
                    <div
                      className={`text-[11px] mt-1 line-clamp-1 ${
                        selected
                          ? 'text-slate-300 dark:text-slate-300'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {ch.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                EDA Chapter {selectedEda.number} · {selectedEda.subtitle}
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                {selectedEda.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm leading-relaxed">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  What It Is
                </div>
                <p className="text-slate-700 dark:text-slate-300">{selectedEda.whatItIs}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Why We Need It
                </div>
                <p className="text-slate-700 dark:text-slate-300">{selectedEda.whyWeNeedIt}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Core Mechanics Step-by-Step
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-5">
                {selectedEda.howItWorks.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm leading-relaxed">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/25 p-4 space-y-1">
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Real-World Indian Example
                </div>
                <p className="text-slate-700 dark:text-slate-200">{selectedEda.indianExample}</p>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/25 p-4 space-y-1">
                <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Trade-Offs to Defend in Interviews
                </div>
                <p className="text-slate-700 dark:text-slate-200">{selectedEda.tradeoffs}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Key Takeaways
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                {selectedEda.keyTakeaways.map((kt, idx) => (
                  <li key={idx}>{kt}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Interview Check
              </h4>
              {selectedEda.interviewQa.map((qa, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 text-xs sm:text-sm space-y-1"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Q: {qa.q}</div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">A: {qa.a}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* MODE 2: 30 MUST-KNOW SYSTEM DESIGN CONCEPTS CHECKLIST */}
      {subMode === 'concepts30' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Networking & APIs', 'Data & Scaling', 'Async & Resilience'] as const).map(
                (group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setGroupFilter(group)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                      groupFilter === group
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/45 text-sky-800 dark:text-sky-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {group}
                  </button>
                )
              )}
            </div>

            <CatalogSearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search 30 concepts (e.g., Sharding, CDN, Idempotency)..."
              className="w-full md:w-72"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredConcepts.map((item) => {
              const checked = checkedConcepts.includes(item.id);
              return (
                <article
                  key={item.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
                    checked
                      ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/15'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-mono tabular-nums text-sky-700 dark:text-sky-400">
                          #{String(item.num).padStart(2, '0')} · {item.group}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleConcept(item.id)}
                        aria-label={checked ? `Unmark ${item.name}` : `Mark ${item.name} revised`}
                        className="p-1 rounded-md text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 shrink-0"
                      >
                        {checked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.plainDefinition}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong className="font-semibold text-slate-800 dark:text-slate-200">
                        Why it matters:{' '}
                      </strong>
                      {item.whyItMatters}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] leading-relaxed">
                    <div className="text-emerald-800 dark:text-emerald-300">
                      <strong className="font-semibold">Indian Example: </strong>
                      {item.indianExample}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="font-semibold text-slate-800 dark:text-slate-200">
                        Interview Tip:{' '}
                      </strong>
                      {item.interviewTip}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
