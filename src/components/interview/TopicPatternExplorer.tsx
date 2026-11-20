import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Filter, Search, Sparkles } from 'lucide-react';
import { BIG_TECH_36_PROBLEMS, BIG_TECH_TOPICS } from '../../../server/seed/bigTechTopicSeed';
import { ALGORITHMS_CATALOG } from '../../data/algorithmsCatalog';
import { BigTechCompany, BigTechTopicCategory, StudySheetTag } from '../../types/dsa';
import { useSprintStore } from '../../store/useSprintStore';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { TopicArchitectureDiagram } from './TopicArchitectureDiagram';
import {
  useProblemStatusTracker,
  type ProblemDifficulty,
  type ProblemStatus,
} from '../../hooks/useProblemStatusTracker';
import {
  ProblemFilterBar,
  StatusCycleButton,
  toggleFilterValue,
} from '../shared/ProblemFilterBar';

const COMPANIES: (BigTechCompany | 'All')[] = ['All', 'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'];
const SHEETS: ('All' | StudySheetTag)[] = ['All', 'NeetCode 150', 'Blind 75', 'Grind 75', 'LeetCode Top 150'];

export function TopicPatternExplorer() {
  const selectedTopic = useSprintStore((s) => s.selectedTopic);
  const setSelectedTopic = useSprintStore((s) => s.setSelectedTopic);
  const selectedCompanyFilter = useSprintStore((s) => s.selectedCompanyFilter);
  const setSelectedCompanyFilter = useSprintStore((s) => s.setSelectedCompanyFilter);
  const masteredSlugs = useSprintStore((s) => s.masteredSlugs);
  const openTrainerForProblem = useSprintStore((s) => s.openTrainerForProblem);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);

  const [query, setQuery] = useState('');
  const [selectedSheetFilter, setSelectedSheetFilter] = useState<'All' | StudySheetTag>('All');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProblemStatus[]>([]);

  const { getStatus, cycleStatus, markInProgressIfUnattempted } = useProblemStatusTracker({
    legacySolvedIds: masteredSlugs,
  });

  const activeTopicSummary = useMemo(
    () =>
      selectedTopic === 'All'
        ? null
        : BIG_TECH_TOPICS.find((t) => t.topicCategory === selectedTopic) ?? null,
    [selectedTopic]
  );

  const baseScopeProblems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIG_TECH_36_PROBLEMS.filter((p) => {
      if (selectedTopic !== 'All' && p.topicCategory !== selectedTopic) return false;
      if (
        selectedSheetFilter !== 'All' &&
        !p.studySheets?.includes(selectedSheetFilter)
      ) {
        return false;
      }
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
        !(p.fullDescription && p.fullDescription.toLowerCase().includes(q)) &&
        !p.howToIdentify.keywordTriggers.some((k) => k.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [query, selectedCompanyFilter, selectedSheetFilter, selectedTopic]);

  const filterCounts = useMemo(() => {
    const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const status = { solved: 0, 'in-progress': 0, unattempted: 0 };
    for (const p of baseScopeProblems) {
      difficulty[p.difficulty] += 1;
      status[getStatus(p.slug)] += 1;
    }
    return { difficulty, status };
  }, [baseScopeProblems, getStatus]);

  const filteredProblems = useMemo(() => {
    return baseScopeProblems
      .filter((p) => {
        if (
          selectedDifficulties.length > 0 &&
          !selectedDifficulties.includes(p.difficulty)
        ) {
          return false;
        }
        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(getStatus(p.slug))
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedCompanyFilter === 'All') return 0;
        const fa = a.bigTechFrequency.find((f) => f.company === selectedCompanyFilter)?.frequencyScore ?? 0;
        const fb = b.bigTechFrequency.find((f) => f.company === selectedCompanyFilter)?.frequencyScore ?? 0;
        return fb - fa;
      });
  }, [baseScopeProblems, selectedCompanyFilter, selectedDifficulties, selectedStatuses, getStatus]);

  const totalMastered = useMemo(
    () => BIG_TECH_36_PROBLEMS.filter((p) => getStatus(p.slug) === 'solved').length,
    [getStatus]
  );

  return (
    <div className="space-y-6">
      {/* Header & Global Mastery Strip */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              LEETCODE & NEETCODE TOPIC BANK · {BIG_TECH_TOPICS.length} CORE TOPICS · {BIG_TECH_36_PROBLEMS.length} HIGH-FREQUENCY PROBLEMS
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Topic Explorer, Full Specs & Company Pattern Trainer
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono tabular-nums">
              Mastered: <strong className="text-emerald-600 dark:text-emerald-400">{totalMastered}</strong> / {BIG_TECH_36_PROBLEMS.length}
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

        {/* Sheet, Company, Difficulty & Status Filters */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
                <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                Sheet:
              </span>
              {SHEETS.map((sheet) => (
                <button
                  key={sheet}
                  type="button"
                  onClick={() => setSelectedSheetFilter(sheet)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    selectedSheetFilter === sheet
                      ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {sheet}
                </button>
              ))}
            </div>

            {selectedTopic !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedTopic('All')}
                className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                Show all 12 topics
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
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

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
            <ProblemFilterBar
              selectedDifficulties={selectedDifficulties}
              onToggleDifficulty={(d) => setSelectedDifficulties((prev) => toggleFilterValue(prev, d))}
              onClearDifficulties={() => setSelectedDifficulties([])}
              selectedStatuses={selectedStatuses}
              onToggleStatus={(s) => setSelectedStatuses((prev) => toggleFilterValue(prev, s))}
              onClearStatuses={() => setSelectedStatuses([])}
              counts={filterCounts}
              totalMatching={filteredProblems.length}
              totalCount={baseScopeProblems.length}
            />
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
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Prompt Trigger Clues</div>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              {activeTopicSummary.keywordTriggers.join(' · ')}
            </p>
            {(() => {
              const matchedAlgo = ALGORITHMS_CATALOG.find((a) =>
                a.linkedTopics.includes(activeTopicSummary.topicCategory)
              );
              if (!matchedAlgo) return null;
              return (
                <button
                  type="button"
                  onClick={() => openAlgorithm(matchedAlgo.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline pt-1"
                >
                  Watch {matchedAlgo.shortName} Animation
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Bespoke Technically Accurate Animated Topic Architecture Diagram */}
      <TopicArchitectureDiagram
        topic={
          (activeTopicSummary?.topicCategory as BigTechTopicCategory) ?? 'Sliding Window'
        }
      />

      {/* Problem Cards List */}
      <div className="space-y-3">
        {filteredProblems.map((prob) => {
          const status = getStatus(prob.slug);
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
                  <StatusCycleButton
                    status={status}
                    title={prob.title}
                    onClick={() => cycleStatus(prob.slug)}
                    showLabel
                  />
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
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {prob.fullDescription || prob.promptSummary}
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
                  {prob.studySheets && prob.studySheets.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {prob.studySheets.join(' · ')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {prob.labProblemId && (
                  <button
                    type="button"
                    onClick={() => {
                      markInProgressIfUnattempted(prob.slug);
                      selectProblem(prob.labProblemId!);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    5-Stage Lab
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    markInProgressIfUnattempted(prob.slug);
                    openTrainerForProblem(prob.slug);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                >
                  Open Solution Trainer
                </button>
              </div>
            </div>
          );
        })}
        {filteredProblems.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No problems match the selected difficulty, status, and topic filters.
          </div>
        )}
      </div>
    </div>
  );
}
