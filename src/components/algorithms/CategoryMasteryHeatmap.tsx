import { useMemo } from 'react';
import { ArrowRight, Flame, Grid2X2, Target } from 'lucide-react';
import {
  ADVANCED_ALGORITHM_CATEGORIES,
  ALGORITHMS_CATALOG,
  AlgorithmCategory,
  AlgorithmDefinition,
  CORE_ALGORITHM_CATEGORIES,
  SYSTEMS_ALGORITHM_CATEGORIES,
} from '../../data/algorithmsCatalog';
import { useAccountState } from '../../hooks/useAccountState';
import type { MasteryReviewEntry } from '../shared/MasteryReviewPanel';

interface CategoryMasteryRow {
  category: AlgorithmCategory;
  tier: 'Core Patterns' | 'Advanced & Competitive' | 'Systems & DB';
  algorithms: AlgorithmDefinition[];
  implementedCount: number;
  linkedProblemCount: number;
  solvedProblemCount: number;
  avgConfidence: number; // 0..5
  masteryPercent: number; // 0..100
  level: 'Needs Focus' | 'Building' | 'Proficient' | 'Mastered';
  nextWeakAlgoId: string;
}

export interface CategoryMasteryHeatmapProps {
  implementedIds: string[];
  masteredSlugs: string[];
  activeCategory: 'All' | AlgorithmCategory;
  onSelectCategory: (cat: 'All' | AlgorithmCategory) => void;
  onSelectAlgorithm: (algoId: string) => void;
}

function getHeatmapTone(percent: number): {
  level: CategoryMasteryRow['level'];
  tileClass: string;
  barClass: string;
  textClass: string;
} {
  if (percent >= 85) {
    return {
      level: 'Mastered',
      tileClass:
        'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/90 dark:bg-emerald-950/45',
      barClass: 'bg-emerald-600 dark:bg-emerald-400',
      textClass: 'text-emerald-800 dark:text-emerald-300',
    };
  }
  if (percent >= 55) {
    return {
      level: 'Proficient',
      tileClass: 'border-sky-300 dark:border-sky-700/80 bg-sky-50/85 dark:bg-sky-950/40',
      barClass: 'bg-sky-600 dark:bg-sky-400',
      textClass: 'text-sky-800 dark:text-sky-300',
    };
  }
  if (percent >= 25) {
    return {
      level: 'Building',
      tileClass:
        'border-amber-300 dark:border-amber-700/80 bg-amber-50/80 dark:bg-amber-950/35',
      barClass: 'bg-amber-500 dark:bg-amber-400',
      textClass: 'text-amber-800 dark:text-amber-300',
    };
  }
  return {
    level: 'Needs Focus',
    tileClass: 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50',
    barClass: 'bg-slate-400 dark:bg-slate-600',
    textClass: 'text-slate-600 dark:text-slate-400',
  };
}

export function CategoryMasteryHeatmap({
  implementedIds,
  masteredSlugs,
  activeCategory,
  onSelectCategory,
  onSelectAlgorithm,
}: CategoryMasteryHeatmapProps) {
  const [studentReviews] = useAccountState<Record<string, MasteryReviewEntry>>(
    'student-mastery-reviews-v1',
    {},
    'patternforge_student_reviews_v1'
  );

  const implementedSet = useMemo(() => new Set(implementedIds), [implementedIds]);
  const masteredSlugSet = useMemo(() => new Set(masteredSlugs), [masteredSlugs]);

  const rows: CategoryMasteryRow[] = useMemo(() => {
    const orderedCategories: Array<{
      cat: AlgorithmCategory;
      tier: CategoryMasteryRow['tier'];
    }> = [
      ...CORE_ALGORITHM_CATEGORIES.map((cat) => ({ cat, tier: 'Core Patterns' as const })),
      ...ADVANCED_ALGORITHM_CATEGORIES.map((cat) => ({
        cat,
        tier: 'Advanced & Competitive' as const,
      })),
      ...SYSTEMS_ALGORITHM_CATEGORIES.map((cat) => ({ cat, tier: 'Systems & DB' as const })),
    ];

    return orderedCategories.map(({ cat, tier }) => {
      const algos = ALGORITHMS_CATALOG.filter((a) => a.category === cat);
      const implementedCount = algos.filter((a) => implementedSet.has(a.id)).length;

      const uniqueLinkedSlugs = new Set<string>();
      for (const a of algos) {
        for (const s of a.linkedProblemSlugs) uniqueLinkedSlugs.add(s);
      }
      const linkedProblemCount = uniqueLinkedSlugs.size;
      const solvedProblemCount = Array.from(uniqueLinkedSlugs).filter((s) =>
        masteredSlugSet.has(s)
      ).length;

      const confValues = algos
        .map((a) => studentReviews[`algo:${a.id}`]?.confidence ?? 0)
        .filter((v) => v > 0);
      const avgConfidence =
        confValues.length > 0
          ? confValues.reduce((sum, v) => sum + v, 0) / confValues.length
          : 0;

      const implRate = algos.length > 0 ? implementedCount / algos.length : 0;
      const probRate = linkedProblemCount > 0 ? solvedProblemCount / linkedProblemCount : implRate;
      const confRate = avgConfidence / 5;

      // Weighted composite mastery score (0..100):
      // 60% unit-test practice implementation rate, 25% linked problem mastery rate, 15% self-rated confidence
      const rawScore =
        confValues.length > 0
          ? implRate * 60 + probRate * 25 + confRate * 15
          : implRate * 70 + probRate * 30;
      const masteryPercent = Math.round(Math.min(100, Math.max(0, rawScore)));
      const { level } = getHeatmapTone(masteryPercent);

      const nextWeakAlgo =
        algos.find((a) => !implementedSet.has(a.id)) ?? algos[0];

      return {
        category: cat,
        tier,
        algorithms: algos,
        implementedCount,
        linkedProblemCount,
        solvedProblemCount,
        avgConfidence,
        masteryPercent,
        level,
        nextWeakAlgoId: nextWeakAlgo?.id ?? '',
      };
    });
  }, [implementedSet, masteredSlugSet, studentReviews]);

  const overallStats = useMemo(() => {
    const avg =
      rows.length > 0
        ? Math.round(rows.reduce((sum, r) => sum + r.masteryPercent, 0) / rows.length)
        : 0;
    const masteredCats = rows.filter((r) => r.masteryPercent >= 85).length;
    const weakest = [...rows].sort((a, b) => a.masteryPercent - b.masteryPercent).slice(0, 3);
    return { avg, masteredCats, weakest };
  }, [rows]);

  const groupedTiers: Array<{ title: CategoryMasteryRow['tier']; items: CategoryMasteryRow[] }> = [
    {
      title: 'Core Patterns',
      items: rows.filter((r) => r.tier === 'Core Patterns'),
    },
    {
      title: 'Advanced & Competitive',
      items: rows.filter((r) => r.tier === 'Advanced & Competitive'),
    },
    {
      title: 'Systems & DB',
      items: rows.filter((r) => r.tier === 'Systems & DB'),
    },
  ];

  return (
    <section
      aria-label="Algorithm category mastery heatmap"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
    >
      {/* Header & Dual-Coded Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-sky-400 tabular-nums">
            <Grid2X2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              Category Mastery Heatmap · {rows.length} Categories · Overall {overallStats.avg}% ·{' '}
              {overallStats.masteredCats}/{rows.length} Mastered
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Visual Mastery Matrix &amp; Weak-Area Radar
          </h2>
        </div>

        {/* Accessible Dual-Coded Intensity Scale */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
            <span>Needs Focus (&lt;25%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-amber-400 bg-amber-200 dark:bg-amber-800/70" />
            <span>Building (25–54%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-sky-400 bg-sky-200 dark:bg-sky-800/70" />
            <span>Proficient (55–84%)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-emerald-400 bg-emerald-300 dark:bg-emerald-700/80" />
            <span>Mastered (85%+)</span>
          </span>
        </div>
      </div>

      {/* Priority Weak-Spot Callout */}
      {overallStats.weakest.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Priority Improvement Areas:
            </span>
            {overallStats.weakest.map((row, idx) => (
              <span key={row.category} className="inline-flex items-center gap-1.5">
                {idx > 0 && <span className="text-slate-300 dark:text-slate-700">·</span>}
                <button
                  type="button"
                  onClick={() => onSelectCategory(row.category)}
                  className="font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 tabular-nums"
                >
                  {row.category} ({row.masteryPercent}%)
                </button>
              </span>
            ))}
          </div>

          {overallStats.weakest[0]?.nextWeakAlgoId && (
            <button
              type="button"
              onClick={() => {
                const target = overallStats.weakest[0];
                onSelectCategory(target.category);
                onSelectAlgorithm(target.nextWeakAlgoId);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Drill Weakest Algorithm</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Tiered Heatmap Grid */}
      <div className="space-y-4">
        {groupedTiers.map((group) => (
          <div key={group.title} className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {group.title}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {group.items.map((row) => {
                const tone = getHeatmapTone(row.masteryPercent);
                const isSelected = activeCategory === row.category;

                return (
                  <div
                    key={row.category}
                    className={`rounded-lg border p-3 transition-colors space-y-2.5 ${tone.tileClass} ${
                      isSelected ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onSelectCategory(isSelected ? 'All' : row.category)
                      }
                      className="w-full text-left space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {row.category}
                        </span>
                        <span
                          className={`text-sm font-mono font-bold tabular-nums shrink-0 ${tone.textClass}`}
                        >
                          {row.masteryPercent}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] tabular-nums">
                        <span className={`font-semibold ${tone.textClass}`}>{tone.level}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {row.implementedCount}/{row.algorithms.length} tested ·{' '}
                          {row.solvedProblemCount}/{row.linkedProblemCount} probs
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${tone.barClass}`}
                          style={{ width: `${Math.max(row.masteryPercent, 3)}%` }}
                        />
                      </div>
                    </button>

                    {/* Individual Algorithm Mini-Cells */}
                    <div
                      className="flex flex-wrap items-center gap-1 pt-0.5"
                      aria-label={`Algorithms in ${row.category}`}
                    >
                      {row.algorithms.map((algo) => {
                        const isImpl = implementedSet.has(algo.id);
                        const hasSolvedLinked = algo.linkedProblemSlugs.some((s) =>
                          masteredSlugSet.has(s)
                        );
                        const reviewConf = studentReviews[`algo:${algo.id}`]?.confidence ?? 0;

                        const cellTone = isImpl
                          ? 'bg-emerald-500 dark:bg-emerald-400 border-emerald-600 dark:border-emerald-300'
                          : hasSolvedLinked || reviewConf >= 4
                            ? 'bg-sky-400 dark:bg-sky-500 border-sky-500 dark:border-sky-400'
                            : reviewConf >= 2
                              ? 'bg-amber-400 dark:bg-amber-500 border-amber-500 dark:border-amber-400'
                              : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-sky-500';

                        const statusText = isImpl
                          ? 'Unit-tested'
                          : hasSolvedLinked
                            ? 'Linked problem solved'
                            : reviewConf > 0
                              ? `Self-rated ${reviewConf}/5`
                              : 'Not started';

                        return (
                          <button
                            key={algo.id}
                            type="button"
                            onClick={() => {
                              onSelectCategory(row.category);
                              onSelectAlgorithm(algo.id);
                            }}
                            title={`${algo.name} — ${statusText}`}
                            aria-label={`Open ${algo.name} (${statusText})`}
                            className={`w-3.5 h-3.5 rounded-[3px] border transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-sky-500 ${cellTone}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
