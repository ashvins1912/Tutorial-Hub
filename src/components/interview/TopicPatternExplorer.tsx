import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Filter, Search, Sparkles } from 'lucide-react';
import { BIG_TECH_36_PROBLEMS, BIG_TECH_TOPICS } from '../../../server/seed/bigTechTopicSeed';
import { BigTechCompany, BigTechTopicCategory } from '../../types/dsa';
import { useSprintStore } from '../../store/useSprintStore';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';

const COMPANIES: (BigTechCompany | 'All')[] = ['All', 'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;

export function TopicPatternExplorer() {
  const selectedTopic = useSprintStore((s) => s.selectedTopic);
  const setSelectedTopic = useSprintStore((s) => s.setSelectedTopic);
  const selectedCompanyFilter = useSprintStore((s) => s.selectedCompanyFilter);
  const setSelectedCompanyFilter = useSprintStore((s) => s.setSelectedCompanyFilter);
  const selectedDifficultyFilter = useSprintStore((s) => s.selectedDifficultyFilter);
  const setSelectedDifficultyFilter = useSprintStore((s) => s.setSelectedDifficultyFilter);
  const masteredSlugs = useSprintStore((s) => s.masteredSlugs);
  const openTrainerForProblem = useSprintStore((s) => s.openTrainerForProblem);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);

  const [query, setQuery] = useState('');

  const activeTopicSummary = useMemo(
    () =>
      selectedTopic === 'All'
        ? null
        : BIG_TECH_TOPICS.find((t) => t.topicCategory === selectedTopic) ?? null,
    [selectedTopic]
  );

  const filteredProblems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIG_TECH_36_PROBLEMS.filter((p) => {
      if (selectedTopic !== 'All' && p.topicCategory !== selectedTopic) return false;
      if (selectedDifficultyFilter !== 'All' && p.difficulty !== selectedDifficultyFilter) return false;
      if (
        selectedCompanyFilter !== 'All' &&
        !p.bigTechFrequency.some((f) => f.company === selectedCompanyFilter)
      ) {
        return false;
      }
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.primaryPattern.toLowerCase().includes(q) &&
        !p.howToIdentify.keywordTriggers.some((k) => k.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (selectedCompanyFilter === 'All') return 0;
      const fa = a.bigTechFrequency.find((f) => f.company === selectedCompanyFilter)?.frequencyScore ?? 0;
      const fb = b.bigTechFrequency.find((f) => f.company === selectedCompanyFilter)?.frequencyScore ?? 0;
      return fb - fa;
    });
  }, [query, selectedCompanyFilter, selectedDifficultyFilter, selectedTopic]);

  const totalMastered = masteredSlugs.length;

  return (
    <div className="space-y-6">
      {/* Header & Global Mastery Strip */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              BIG TECH TOPIC-WISE PATTERN BANK · 12 CORE TOPICS · 36 HIGH-FREQUENCY BENCHMARKS
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Topic Explorer, Identification Trainer & Company Rubric
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono tabular-nums">
              Mastered: <strong className="text-emerald-600 dark:text-emerald-400">{totalMastered}</strong> / 36
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, signal, pattern..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* 12 Topic Selector Grid with Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {BIG_TECH_TOPICS.map((topic) => {
            const topicProblems = BIG_TECH_36_PROBLEMS.filter(
              (p) => p.topicCategory === topic.topicCategory
            );
            const solvedCount = topicProblems.filter((p) => masteredSlugs.includes(p.slug)).length;
            const pct = Math.round((solvedCount / Math.max(1, topicProblems.length)) * 100);
            const active = selectedTopic === topic.topicCategory;

            return (
              <button
                key={topic.topicCategory}
                type="button"
                onClick={() =>
                  setSelectedTopic(active ? 'All' : (topic.topicCategory as BigTechTopicCategory))
                }
                className={`text-left p-3 rounded-lg border transition-colors space-y-2 ${
                  active
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {topic.topicCategory}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                    {solvedCount}/{topicProblems.length}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      pct === 100 ? 'bg-emerald-500' : 'bg-sky-600 dark:bg-sky-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Company & Difficulty Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              Company:
            </span>
            {COMPANIES.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setSelectedCompanyFilter(comp)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  selectedCompanyFilter === comp
                    ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Difficulty:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  selectedDifficultyFilter === diff
                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {diff}
              </button>
            ))}
            {selectedTopic !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedTopic('All')}
                className="ml-2 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                Show all 12 topics
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pattern Cheat-Card Banner for Selected Topic */}
      {activeTopicSummary && (
        <div className="rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/20 p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-mono font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              PATTERN CHEAT-CARD · {activeTopicSummary.topicCategory.toUpperCase()}
            </div>
            <p className="text-slate-700 dark:text-slate-300">{activeTopicSummary.shortDesc}</p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Complexity Leap & Invariant</div>
            <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              {activeTopicSummary.complexityLeap}
            </p>
            <p className="text-slate-600 dark:text-slate-400">{activeTopicSummary.coreInvariant}</p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Prompt Trigger Clues</div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              {activeTopicSummary.keywordTriggers.join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Problem Cards List */}
      <div className="space-y-3">
        {filteredProblems.map((prob) => {
          const isMastered = masteredSlugs.includes(prob.slug);
          const companyEntry =
            selectedCompanyFilter !== 'All'
              ? prob.bigTechFrequency.find((f) => f.company === selectedCompanyFilter)
              : [...prob.bigTechFrequency].sort((a, b) => b.frequencyScore - a.frequencyScore)[0];

          return (
            <div
              key={prob.slug}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    #{prob.number}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {prob.title}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold ${
                      prob.difficulty === 'Easy'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : prob.difficulty === 'Medium'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{prob.topicCategory}</span>
                  {isMastered && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      · <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> MASTERED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  {prob.promptSummary}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>Pattern: {prob.primaryPattern}</span>
                  {companyEntry && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-sky-700 dark:text-sky-400 font-semibold">
                        {companyEntry.company} {companyEntry.frequencyScore}% ({companyEntry.lastAskedTag})
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>Triggers: {prob.howToIdentify.keywordTriggers.slice(0, 2).join(', ')}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {prob.labProblemId && (
                  <button
                    type="button"
                    onClick={() => selectProblem(prob.labProblemId!)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    5-Stage Lab
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openTrainerForProblem(prob.slug)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                >
                  Open Solution Trainer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
