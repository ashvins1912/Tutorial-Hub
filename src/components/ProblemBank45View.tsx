import { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { HIGH_ROI_45_PROBLEMS, HighRoiProblemEntry } from '../data/highRoi45';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import {
  useProblemStatusTracker,
  type ProblemDifficulty,
  type ProblemStatus,
} from '../hooks/useProblemStatusTracker';
import {
  normalizeDifficulty,
  ProblemFilterBar,
  StatusCycleButton,
  toggleFilterValue,
} from './shared/ProblemFilterBar';

const COLLECTIONS = ['All', 'Blind 75', 'NeetCode 150', 'Grind 75', 'Sean Prashad', 'Top Interview 150'] as const;

export function ProblemBank45View() {
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const completedProblemIds = usePatternForgeStore((s) => s.brainProfile.completedProblemIds);
  const [query, setQuery] = useState('');
  const [collection, setCollection] = useState<string>('All');
  const [patternFilter, setPatternFilter] = useState<string>('All');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProblemStatus[]>([]);
  const [expandedNum, setExpandedNum] = useState<number | null>(1);

  const { getStatus, cycleStatus, markInProgressIfUnattempted } = useProblemStatusTracker({
    legacySolvedIds: completedProblemIds,
  });

  const getItemId = (item: HighRoiProblemEntry) => item.labProblemId ?? `highroi-${item.number}`;

  const uniquePatterns = useMemo(
    () => ['All', ...Array.from(new Set(HIGH_ROI_45_PROBLEMS.map((p) => p.primaryPattern)))],
    []
  );

  const baseScope = useMemo(() => {
    return HIGH_ROI_45_PROBLEMS.filter((p) => {
      const matchesCollection =
        collection === 'All' ||
        p.collections.includes(collection as HighRoiProblemEntry['collections'][number]);
      const matchesPattern = patternFilter === 'All' || p.primaryPattern === patternFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.primaryPattern.toLowerCase().includes(q) ||
        p.secondaryStructure.toLowerCase().includes(q) ||
        p.signalPhrases.some((s) => s.toLowerCase().includes(q));
      return matchesCollection && matchesPattern && matchesQuery;
    });
  }, [collection, patternFilter, query]);

  const filterCounts = useMemo(() => {
    const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const status = { solved: 0, 'in-progress': 0, unattempted: 0 };
    for (const p of baseScope) {
      difficulty[normalizeDifficulty(p.difficulty)] += 1;
      status[getStatus(getItemId(p))] += 1;
    }
    return { difficulty, status };
  }, [baseScope, getStatus]);

  const filtered = useMemo(() => {
    return baseScope.filter((p) => {
      if (
        selectedDifficulties.length > 0 &&
        !selectedDifficulties.includes(normalizeDifficulty(p.difficulty))
      ) {
        return false;
      }
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(getStatus(getItemId(p)))
      ) {
        return false;
      }
      return true;
    });
  }, [baseScope, selectedDifficulties, selectedStatuses, getStatus]);

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              PATTERN CROSSOVER ENGINE · 45 HIGH-ROI INTERVIEW BENCHMARKS
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Blind 75 · NeetCode 150 · Grind 75 · Top Interview 150
            </h2>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problem, signal, structure..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {COLLECTIONS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setCollection(col)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  collection === col
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter by Primary Pattern"
            value={patternFilter}
            onChange={(e) => setPatternFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {uniquePatterns.map((pat) => (
              <option key={pat} value={pat}>
                {pat === 'All' ? 'All 9 Core Patterns' : pat}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-auto tabular-nums">
            Showing {filtered.length} / {HIGH_ROI_45_PROBLEMS.length} problems
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
          <ProblemFilterBar
            selectedDifficulties={selectedDifficulties}
            onToggleDifficulty={(d) => setSelectedDifficulties((prev) => toggleFilterValue(prev, d))}
            onClearDifficulties={() => setSelectedDifficulties([])}
            selectedStatuses={selectedStatuses}
            onToggleStatus={(s) => setSelectedStatuses((prev) => toggleFilterValue(prev, s))}
            onClearStatuses={() => setSelectedStatuses([])}
            counts={filterCounts}
            totalMatching={filtered.length}
            totalCount={baseScope.length}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const isOpen = expandedNum === item.number;
          const itemId = getItemId(item);
          const status = getStatus(itemId);
          return (
            <div
              key={item.number}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <StatusCycleButton
                      status={status}
                      title={item.title}
                      onClick={() => cycleStatus(itemId)}
                      showLabel
                    />
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      #{item.number}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        item.difficulty === 'Easy'
                          ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                          : item.difficulty === 'Medium'
                            ? 'text-amber-700 dark:text-amber-400 font-medium'
                            : 'text-rose-700 dark:text-rose-400 font-medium'
                      }
                    >
                      {item.difficulty}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.primaryPattern} + {item.secondaryStructure}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Signals: {item.signalPhrases.join(' · ')} · Max N: {item.inputConstraintMax}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedNum(isOpen ? null : item.number);
                      markInProgressIfUnattempted(itemId);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                  >
                    {isOpen ? 'Hide Blueprint' : 'Brute -> Better -> Optimal'}
                  </button>
                  {item.labProblemId && (
                    <button
                      type="button"
                      onClick={() => {
                        markInProgressIfUnattempted(itemId);
                        selectProblem(item.labProblemId!);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap shrink-0"
                    >
                      Interactive Lab
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
                      <div className="font-mono font-semibold text-rose-700 dark:text-rose-400 mb-1">
                        1. BRUTE FORCE
                      </div>
                      <div className="text-slate-800 dark:text-slate-200">{item.bruteApproach}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
                      <div className="font-mono font-semibold text-amber-700 dark:text-amber-400 mb-1">
                        2. BETTER TRADE-OFF
                      </div>
                      <div className="text-slate-800 dark:text-slate-200">{item.betterApproach}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
                      <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                        3. OPTIMAL PATTERN
                      </div>
                      <div className="text-slate-800 dark:text-slate-200">{item.optimalApproach}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Aha! Insight: </span>
                      <span className="text-slate-600 dark:text-slate-400">{item.ahaInsight}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Follow-Up Twist: </span>
                      <span className="text-slate-600 dark:text-slate-400">{item.followUpTwist}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Collections: {item.collections.join(' · ')}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
