import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  GitBranch,
  Layers,
  Play,
  Search,
  Star,
} from 'lucide-react';
import { ALGORITHMS_CATALOG, AlgorithmDefinition } from '../../data/algorithmsCatalog';
import {
  ALGORITHM_POWER_COMBOS,
  MASTER_73_ROADMAP,
  MASTER_73_SECTIONS,
  Master73Item,
} from '../../data/algorithmCombinationsAndRoadmap';
import { useAccountState } from '../../hooks/useAccountState';
import type { MasteryReviewEntry } from '../shared/MasteryReviewPanel';
import type { AlgorithmDetailTab } from '../../store/usePatternForgeStore';

interface Master73RoadmapViewProps {
  implementedIds: string[];
  onSelectAlgorithm: (algoId: string, tab?: AlgorithmDetailTab) => void;
}

type SectionFilter = 'all' | 'core' | 'advanced' | 'systems';
type ProgressFilter = 'all' | 'implemented' | 'todo' | 'rated';

export function Master73RoadmapView({
  implementedIds,
  onSelectAlgorithm,
}: Master73RoadmapViewProps) {
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [allReviews] = useAccountState<Record<string, MasteryReviewEntry>>(
    'student-mastery-reviews-v1',
    {},
    'patternforge_student_reviews_v1'
  );

  const algoById = useMemo(() => {
    const map = new Map<string, AlgorithmDefinition>();
    for (const algo of ALGORITHMS_CATALOG) {
      map.set(algo.id, algo);
    }
    return map;
  }, []);

  const implementedSet = useMemo(() => new Set(implementedIds), [implementedIds]);

  const stats = useMemo(() => {
    let implementedCount = 0;
    let ratedCount = 0;
    let confidenceSum = 0;

    for (const item of MASTER_73_ROADMAP) {
      if (
        implementedSet.has(item.algorithmId) ||
        (item.secondaryAlgorithmId && implementedSet.has(item.secondaryAlgorithmId))
      ) {
        implementedCount++;
      }
      const review = allReviews[`algo:${item.algorithmId}`];
      if (review) {
        const vals = [
          review.readability,
          review.visualDfd,
          review.implementation,
          review.challenges,
          review.confidence,
        ].filter((v) => v > 0);
        if (vals.length > 0) {
          ratedCount++;
          confidenceSum += vals.reduce((a, b) => a + b, 0) / vals.length;
        }
      }
    }

    return {
      total: MASTER_73_ROADMAP.length,
      implementedCount,
      ratedCount,
      avgRating: ratedCount > 0 ? (confidenceSum / ratedCount).toFixed(1) : '—',
    };
  }, [implementedSet, allReviews]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MASTER_73_ROADMAP.filter((item) => {
      if (sectionFilter !== 'all' && item.section !== sectionFilter) return false;

      const isImpl =
        implementedSet.has(item.algorithmId) ||
        Boolean(item.secondaryAlgorithmId && implementedSet.has(item.secondaryAlgorithmId));
      const review = allReviews[`algo:${item.algorithmId}`];
      const isRated = Boolean(review && review.confidence > 0);

      if (progressFilter === 'implemented' && !isImpl) return false;
      if (progressFilter === 'todo' && isImpl) return false;
      if (progressFilter === 'rated' && !isRated) return false;

      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subsection.toLowerCase().includes(q) ||
        item.productionUse.toLowerCase().includes(q) ||
        item.linkedProblem.toLowerCase().includes(q) ||
        String(item.number).includes(q)
      );
    });
  }, [sectionFilter, progressFilter, searchQuery, implementedSet, allReviews]);

  const groupedSections = useMemo(() => {
    return MASTER_73_SECTIONS.map((sec) => {
      const items = filteredItems.filter((i) => i.section === sec.id);
      const subsections: { name: string; items: Master73Item[] }[] = [];
      for (const item of items) {
        let bucket = subsections.find((s) => s.name === item.subsection);
        if (!bucket) {
          bucket = { name: item.subsection, items: [] };
          subsections.push(bucket);
        }
        bucket.items.push(item);
      }
      return { ...sec, totalMatching: items.length, subsections };
    }).filter((s) => s.totalMatching > 0);
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      {/* Header & Blueprint Telemetry */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              Complete 73-Algorithm Specialist Blueprint · 100% Interactive Coverage · {ALGORITHMS_CATALOG.length} Total Studio Modules
            </p>
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Master Algorithm Reference (#01 – #73): Core, Competitive &amp; Distributed Systems
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              Every numbered topic includes step-by-step animation, interactive Data Flow Diagrams (DFD), Algorithm Power Combinations, linked interview problems, runnable JS unit tests, and personal zero-to-expertise confidence tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Coverage</div>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.total} / 73
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Unit-Tested</div>
              <div className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {stats.implementedCount} / 73
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Self-Rated</div>
              <div className="text-base font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                {stats.ratedCount} / 73
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Avg Rating</div>
              <div className="text-base font-mono font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                {stats.avgRating} / 5.0
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-fit">
            {(
              [
                { id: 'all', label: 'All 73 Topics' },
                { id: 'core', label: '1. Core (#01–#34)' },
                { id: 'advanced', label: '2. Advanced (#35–#62)' },
                { id: 'systems', label: '3. DB & Distributed (#63–#73)' },
              ] as const
            ).map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSectionFilter(sec.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  sectionFilter === sec.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search #number, Raft, B+, Trie..."
                aria-label="Search 73-algorithm blueprint"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'todo', label: 'Remaining' },
                  { id: 'implemented', label: 'Passed' },
                  { id: 'rated', label: 'Rated' },
                ] as const
              ).map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  onClick={() => setProgressFilter(pf.id)}
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                    progressFilter === pf.id
                      ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {pf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Numbered Sections & Subsections */}
      {groupedSections.length === 0 ? (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No blueprint entries match your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSectionFilter('all');
              setProgressFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Reset filters
          </button>
        </section>
      ) : (
        groupedSections.map((sec) => (
          <section
            key={sec.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                  {sec.range} · {sec.totalMatching} items shown
                </div>
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  {sec.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sec.subtitle}</p>
              </div>
            </div>

            <div className="space-y-5">
              {sec.subsections.map((sub) => (
                <div key={sub.name} className="space-y-2.5">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {sub.name} ({sub.items.length})
                  </h3>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {sub.items.map((item) => {
                      const algo = algoById.get(item.algorithmId);
                      const secondaryAlgo = item.secondaryAlgorithmId
                        ? algoById.get(item.secondaryAlgorithmId)
                        : undefined;
                      const isImplemented =
                        implementedSet.has(item.algorithmId) ||
                        Boolean(item.secondaryAlgorithmId && implementedSet.has(item.secondaryAlgorithmId));
                      const review = allReviews[`algo:${item.algorithmId}`];
                      const reviewAvg = review
                        ? (() => {
                            const vals = [
                              review.readability,
                              review.visualDfd,
                              review.implementation,
                              review.challenges,
                              review.confidence,
                            ].filter((v) => v > 0);
                            return vals.length > 0
                              ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                              : null;
                          })()
                        : null;

                      return (
                        <div
                          key={item.number}
                          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-950/50 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-3.5"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                                #{String(item.number).padStart(2, '0')}
                              </span>
                              <button
                                type="button"
                                onClick={() => onSelectAlgorithm(item.algorithmId, 'mental')}
                                className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400 text-left transition-colors"
                              >
                                {item.title}
                              </button>
                              {algo && (
                                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                                  · {algo.timeComplexity} · {algo.spaceComplexity}
                                </span>
                              )}
                              {isImplemented && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                  · <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Passed
                                </span>
                              )}
                              {reviewAvg && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                                  · <Star className="w-3 h-3 fill-current" aria-hidden="true" /> {reviewAvg}/5
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                Production &amp; Interview:{' '}
                              </span>
                              {item.productionUse}
                              <span className="mx-1.5 text-slate-400" aria-hidden="true">·</span>
                              <span className="font-mono text-slate-700 dark:text-slate-300">
                                Problem: {item.linkedProblem}
                              </span>
                            </p>

                            {item.comboPartner && (
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                  <GitBranch className="w-3 h-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                                  Power Combo:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onSelectAlgorithm(item.comboPartner!.id, 'upgrade-trace')}
                                  className="font-mono text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
                                >
                                  {item.comboPartner.label}
                                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectAlgorithm(item.algorithmId, 'mental')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                            >
                              <Play className="w-3 h-3" aria-hidden="true" />
                              Visualize
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectAlgorithm(item.algorithmId, 'upgrade-trace')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
                            >
                              <Layers className="w-3 h-3" aria-hidden="true" />
                              DFD &amp; Combos
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectAlgorithm(item.algorithmId, 'practice')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors whitespace-nowrap"
                            >
                              <Code2 className="w-3 h-3" aria-hidden="true" />
                              Practice
                            </button>
                            {secondaryAlgo && (
                              <button
                                type="button"
                                onClick={() => onSelectAlgorithm(secondaryAlgo.id, 'mental')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-sky-700 dark:text-sky-400 hover:border-sky-500 transition-colors whitespace-nowrap"
                              >
                                + {secondaryAlgo.shortName}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {/* High-Impact Algorithm Combinations Reference */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
            Systems &amp; Interview Synergy Matrix · {ALGORITHM_POWER_COMBOS.length} Flagship Combinations
          </div>
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
            How Combining Algorithms Generates Superior Real-World Output
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Senior interviews and production storage engines rarely rely on one textbook algorithm in isolation—click any partner component below to inspect its animated visual stage and DFD.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ALGORITHM_POWER_COMBOS.map((combo) => (
            <div
              key={combo.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {combo.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {combo.synergyOutput}
                </p>
                <div className="rounded-md border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-[11px] font-mono text-sky-800 dark:text-sky-300 leading-relaxed">
                  {combo.architectureFlow}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Interview Target: </span>
                  {combo.interviewUseCase}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                {combo.partnerIds.map((pid) => {
                  const partner = algoById.get(pid);
                  if (!partner) return null;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => onSelectAlgorithm(pid, 'upgrade-trace')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
                    >
                      {partner.shortName}
                      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
