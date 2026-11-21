import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Code2,
  ExternalLink,
  FileText,
  Layers,
  ListChecks,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  CustomPattern28Problem,
  Dsa28Difficulty,
  Dsa28TopicGroupId,
} from '../data/dsa28Patterns';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import {
  useProblemStatusTracker,
  type ProblemDifficulty,
  type ProblemStatus,
} from '../hooks/useProblemStatusTracker';
import {
  ProblemFilterBar,
  StatusCycleButton,
  toggleFilterValue,
} from './shared/ProblemFilterBar';
import { CatalogSearchInput, CopyButton, SegmentedTabBar } from './ui';
import { AddCustomProblemModal } from './AddCustomProblemModal';

interface SolverHandoffProblem {
  id: string;
  title: string;
  statement: string;
  sourcePlatform?: 'LeetCode' | 'GeeksforGeeks' | 'Custom';
  sourceUrl?: string;
  difficulty?: Dsa28Difficulty;
  examples?: string[];
  constraints?: string[];
  topics?: string[];
}

export interface Patterns28RoadmapViewProps {
  customProblems: CustomPattern28Problem[];
  onOpenAddCustomProblem: (defaultPatternId?: string) => void;
  onRemoveCustomProblem: (id: string) => void;
  onProblemAddedFallback?: (
    problem: CustomPattern28Problem,
    options: { openInSolver: boolean }
  ) => void;
  focusPatternId?: string | null;
  lastAddedNotice?: string | null;
  onDismissNotice?: () => void;
  onAnalyzeInSolver?: (problem: SolverHandoffProblem) => void;
}

type RoadmapSubView = 'roadmap' | 'compact28' | 'custom' | 'templates';
type TemplateLanguage = 'python' | 'typescript' | 'java';

const DIFFICULTY_TEXT_CLASS: Record<Dsa28Difficulty, string> = {
  Easy: 'text-emerald-600 dark:text-emerald-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Hard: 'text-rose-600 dark:text-rose-400',
};

export const Patterns28RoadmapView: React.FC<Patterns28RoadmapViewProps> = ({
  customProblems,
  onOpenAddCustomProblem,
  onRemoveCustomProblem,
  onProblemAddedFallback,
  focusPatternId,
  lastAddedNotice,
  onDismissNotice,
  onAnalyzeInSolver,
}) => {
  const {
    data: { groups, patterns, crossCutting, templates },
  } = useAsyncCatalog('dsa-28-patterns');

  const { getStatus, cycleStatus } = useProblemStatusTracker();

  const [subView, setSubView] = useState<RoadmapSubView>('roadmap');
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    patterns[0]?.id ?? 'hashmap-hashset-lookup'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.patternId ?? 'binary-search-on-answer'
  );
  const [templateLang, setTemplateLang] = useState<TemplateLanguage>('python');
  const [expandedStatementId, setExpandedStatementId] = useState<string | null>(null);
  const [standaloneModalOpen, setStandaloneModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | Dsa28TopicGroupId>('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProblemStatus[]>([]);

  useEffect(() => {
    if (focusPatternId) {
      setSelectedPatternId(focusPatternId);
      setSubView('roadmap');
    }
  }, [focusPatternId]);

  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups]
  );

  const patternMap = useMemo(
    () => new Map(patterns.map((p) => [p.id, p])),
    [patterns]
  );

  const templateByPatternId = useMemo(
    () => new Map(templates.map((t) => [t.patternId, t])),
    [templates]
  );

  const customByPatternId = useMemo(() => {
    const map = new Map<string, CustomPattern28Problem[]>();
    for (const item of customProblems) {
      const existing = map.get(item.patternId) ?? [];
      existing.push(item);
      map.set(item.patternId, existing);
    }
    return map;
  }, [customProblems]);

  const activePattern = useMemo(
    () => patterns.find((pat) => pat.id === selectedPatternId) ?? patterns[0],
    [patterns, selectedPatternId]
  );

  const activeTemplate = useMemo(
    () => templates.find((t) => t.patternId === selectedTemplateId) ?? templates[0],
    [templates, selectedTemplateId]
  );

  const compact28Rows = useMemo(
    () =>
      patterns.map((pat) => {
        const canonical = pat.problems.find((pr) => pr.isCanonical28) ?? pat.problems[0];
        return {
          pattern: pat,
          problem: canonical,
        };
      }),
    [patterns]
  );

  const stats = useMemo(() => {
    let totalCanonical = 0;
    let solvedTotal = 0;
    let solvedCompact28 = 0;

    for (const pat of patterns) {
      for (const prob of pat.problems) {
        totalCanonical++;
        if (getStatus(prob.slug) === 'solved') {
          solvedTotal++;
          if (prob.isCanonical28) solvedCompact28++;
        }
      }
    }
    for (const cp of customProblems) {
      if (getStatus(cp.slug) === 'solved') solvedTotal++;
    }

    return {
      totalProblems: totalCanonical + customProblems.length,
      solvedTotal,
      solvedCompact28,
      customCount: customProblems.length,
    };
  }, [patterns, customProblems, getStatus]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesFilters = (
    title: string,
    extraText: string,
    difficulty: Dsa28Difficulty,
    slug: string
  ) => {
    if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(difficulty)) {
      return false;
    }
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(getStatus(slug))) {
      return false;
    }
    if (normalizedQuery) {
      const hay = `${title} ${extraText}`.toLowerCase();
      if (!hay.includes(normalizedQuery)) return false;
    }
    return true;
  };

  const filteredCompact28 = useMemo(() => {
    return compact28Rows.filter(({ pattern, problem }) => {
      if (selectedGroupFilter !== 'all' && pattern.groupId !== selectedGroupFilter) {
        return false;
      }
      return matchesFilters(
        problem.title,
        `${pattern.title} #${problem.leetcodeNumber} ${problem.keyIdea}`,
        problem.difficulty,
        problem.slug
      );
    });
  }, [compact28Rows, selectedGroupFilter, selectedDifficulties, selectedStatuses, normalizedQuery, getStatus]);

  const activePatternProblems = useMemo(() => {
    if (!activePattern) return { canonical: [], custom: [] };
    const canonical = activePattern.problems.filter((prob) =>
      matchesFilters(
        prob.title,
        `#${prob.leetcodeNumber} ${prob.keyIdea} ${prob.companies.join(' ')}`,
        prob.difficulty,
        prob.slug
      )
    );
    const custom = (customByPatternId.get(activePattern.id) ?? []).filter((cp) =>
      matchesFilters(
        cp.title,
        `${cp.sourcePlatform} ${cp.topics.join(' ')} ${cp.keyIdea} ${cp.statement ?? ''}`,
        cp.difficulty,
        cp.slug
      )
    );
    return { canonical, custom };
  }, [activePattern, customByPatternId, selectedDifficulties, selectedStatuses, normalizedQuery, getStatus]);

  const filteredCustomProblems = useMemo(() => {
    return customProblems.filter((cp) => {
      const pat = patternMap.get(cp.patternId);
      return matchesFilters(
        cp.title,
        `${cp.sourcePlatform} ${pat?.title ?? ''} ${cp.topics.join(' ')} ${cp.keyIdea} ${cp.statement ?? ''}`,
        cp.difficulty,
        cp.slug
      );
    });
  }, [customProblems, patternMap, selectedDifficulties, selectedStatuses, normalizedQuery, getStatus]);

  const triggerAddModal = (patternId?: string) => {
    if (onOpenAddCustomProblem) {
      onOpenAddCustomProblem(patternId);
    } else {
      setStandaloneModalOpen(true);
    }
  };

  const openTemplateForPattern = (patternId: string) => {
    if (templateByPatternId.has(patternId)) {
      setSelectedTemplateId(patternId);
      setSubView('templates');
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedGroupFilter('all');
    setSelectedDifficulties([]);
    setSelectedStatuses([]);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & KPI Strip */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-sky-600 dark:text-sky-400">
              <span>28-PATTERN DSA ROADMAP</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span>5 TOPIC GROUPS</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span>{templates.length} TRICKY CODE TEMPLATES</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              28-Pattern Interview Mastery &amp; Compact Revision List
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Master all 28 recurring coding patterns, drill the 1-per-pattern Compact 28 Revision List, reference battle-tested templates for the trickiest patterns, or parse any LeetCode / GeeksforGeeks URL directly into your problem bank.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => triggerAddModal(activePattern?.id)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Add Custom Problem</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Compact 28 Revision
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.solvedCompact28} / 28
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Roadmap Problems Solved
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.solvedTotal} / {stats.totalProblems}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Tricky Pattern Templates
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {templates.length} patterns
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              My Custom Problems
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.customCount} added
            </p>
          </div>
        </div>

        {lastAddedNotice && (
          <div className="mt-4 px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
            <span>{lastAddedNotice}</span>
            {onDismissNotice && (
              <button
                type="button"
                onClick={onDismissNotice}
                className="text-[11px] font-semibold underline shrink-0"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </section>

      {/* Sub-view Segmented Control & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SegmentedTabBar
          ariaLabel="28-Pattern Roadmap sections"
          activeTab={subView}
          onChange={setSubView}
          tabs={[
            { id: 'roadmap', label: '28-Pattern Explorer', icon: Layers },
            { id: 'compact28', label: 'Compact 28 Revision List', icon: ListChecks },
            { id: 'custom', label: 'My Custom Problems', count: customProblems.length, icon: FileText },
            { id: 'templates', label: 'Trickiest Templates', count: templates.length, icon: Code2 },
          ]}
        />

        {subView !== 'templates' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <CatalogSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search pattern, LC #, or keyword..."
              className="w-full sm:w-64"
            />
          </div>
        )}
      </div>

      {/* Filter Bar */}
      {subView !== 'templates' && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <ProblemFilterBar
            selectedDifficulties={selectedDifficulties}
            onToggleDifficulty={(d) =>
              setSelectedDifficulties((prev) => toggleFilterValue(prev, d))
            }
            onClearDifficulties={() => setSelectedDifficulties([])}
            selectedStatuses={selectedStatuses}
            onToggleStatus={(s) =>
              setSelectedStatuses((prev) => toggleFilterValue(prev, s))
            }
            onClearStatuses={() => setSelectedStatuses([])}
          />
          {subView === 'compact28' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedGroupFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  selectedGroupFilter === 'all'
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All 5 Groups
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroupFilter(g.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    selectedGroupFilter === g.id
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {g.order}. {g.shortTitle}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: 28-PATTERN ROADMAP EXPLORER */}
      {subView === 'roadmap' && activePattern && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Rail */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                All 28 Patterns
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                5 groups
              </span>
            </div>

            <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
              {groups.map((group) => {
                const groupPatterns = patterns.filter((pat) => pat.groupId === group.id);
                return (
                  <div key={group.id} className="py-2">
                    <div className="px-4 py-1.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {group.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                        {group.patternRange}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 px-2">
                      {groupPatterns.map((pat) => {
                        const isSelected = pat.id === activePattern.id;
                        const extraCustom = customByPatternId.get(pat.id) ?? [];
                        const totalInPat = pat.problems.length + extraCustom.length;
                        const solvedInPat =
                          pat.problems.filter((pr) => getStatus(pr.slug) === 'solved').length +
                          extraCustom.filter((cp) => getStatus(cp.slug) === 'solved').length;

                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => setSelectedPatternId(pat.id)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-300'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <span
                                className={`text-[11px] font-mono tabular-nums w-5 shrink-0 ${
                                  isSelected
                                    ? 'text-sky-300 dark:text-sky-400 font-semibold'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {String(pat.number).padStart(2, '0')}
                              </span>
                              <span className="text-xs font-medium truncate">
                                {pat.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {pat.hasTrickyTemplate && (
                                <Code2
                                  className={`w-3 h-3 ${
                                    isSelected
                                      ? 'text-sky-300 dark:text-sky-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                  aria-label="Includes code template"
                                />
                              )}
                              <span
                                className={`text-[11px] font-mono tabular-nums ${
                                  solvedInPat === totalInPat && totalInPat > 0
                                    ? 'text-emerald-500'
                                    : isSelected
                                      ? 'text-slate-300 dark:text-sky-300'
                                      : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {solvedInPat}/{totalInPat}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Pattern Detail Workspace */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">
                      Pattern #{String(activePattern.number).padStart(2, '0')}
                    </span>
                    <span>·</span>
                    <span>{groupMap.get(activePattern.groupId)?.title}</span>
                    <span>·</span>
                    <span>Time {activePattern.timeComplexity}</span>
                    <span>·</span>
                    <span>Space {activePattern.spaceComplexity}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {activePattern.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {activePattern.summary}
                  </p>
                </div>

                {templateByPatternId.has(activePattern.id) && (
                  <button
                    type="button"
                    onClick={() => openTemplateForPattern(activePattern.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-500 dark:hover:border-sky-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    <span>Open Code Template</span>
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Core Mental Model
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {activePattern.mentalModel}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Interview Trigger Signals
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {activePattern.triggerSignals.join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Problem List Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Practice Sheet
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {activePatternProblems.canonical.length} canonical
                    {activePatternProblems.custom.length > 0
                      ? ` + ${activePatternProblems.custom.length} custom`
                      : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerAddModal(activePattern.id)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                >
                  + Add Custom Problem
                </button>
              </div>

              {activePatternProblems.canonical.length === 0 &&
              activePatternProblems.custom.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No problems in this pattern match your current filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/50">
                        <th className="py-2.5 pl-4 pr-2 w-12">State</th>
                        <th className="py-2.5 px-2">Problem &amp; Core Insight</th>
                        <th className="py-2.5 px-2 w-20">Level</th>
                        <th className="py-2.5 px-2 w-28 hidden sm:table-cell">Complexity</th>
                        <th className="py-2.5 pl-2 pr-4 w-36 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      {activePatternProblems.canonical.map((prob) => {
                        const status = getStatus(prob.slug);
                        return (
                          <tr
                            key={prob.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 pl-4 pr-2 align-top">
                              <StatusCycleButton
                                status={status}
                                onClick={() => cycleStatus(prob.slug)}
                                title={prob.title}
                              />
                            </td>
                            <td className="py-3 px-2 align-top">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-mono tabular-nums text-[11px] text-slate-400 dark:text-slate-500">
                                  LC #{prob.leetcodeNumber}
                                </span>
                                <a
                                  href={prob.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1"
                                >
                                  <span>{prob.title}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60 shrink-0" aria-hidden="true" />
                                </a>
                                {prob.isCanonical28 && (
                                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                                    · Compact 28 Pick
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {prob.keyIdea}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {prob.companies.join(' · ')}
                              </p>
                            </td>
                            <td className="py-3 px-2 align-top">
                              <span className={`font-semibold ${DIFFICULTY_TEXT_CLASS[prob.difficulty]}`}>
                                {prob.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-2 align-top hidden sm:table-cell font-mono tabular-nums text-[11px] text-slate-600 dark:text-slate-400">
                              <div>{prob.timeComplexity}</div>
                              <div className="text-slate-400 dark:text-slate-500">{prob.spaceComplexity}</div>
                            </td>
                            <td className="py-3 pl-2 pr-4 align-top text-right">
                              {onAnalyzeInSolver && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onAnalyzeInSolver({
                                      id: prob.id,
                                      title: `LC #${prob.leetcodeNumber}: ${prob.title}`,
                                      statement: `${prob.title} (Pattern #${activePattern.number}: ${activePattern.title}). Key Interview Insight: ${prob.keyIdea}`,
                                      sourcePlatform: 'LeetCode',
                                      sourceUrl: prob.url,
                                      difficulty: prob.difficulty,
                                      topics: [activePattern.title],
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap"
                                >
                                  <span>Solver</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {activePatternProblems.custom.map((cp) => {
                        const status = getStatus(cp.slug);
                        return (
                          <tr
                            key={cp.id}
                            className="bg-sky-50/30 dark:bg-sky-950/15 hover:bg-sky-50/60 dark:hover:bg-sky-950/25 transition-colors"
                          >
                            <td className="py-3 pl-4 pr-2 align-top">
                              <StatusCycleButton
                                status={status}
                                onClick={() => cycleStatus(cp.slug)}
                                title={cp.title}
                              />
                            </td>
                            <td className="py-3 px-2 align-top">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                                  {cp.sourcePlatform} · Custom
                                </span>
                                <a
                                  href={cp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1"
                                >
                                  <span>{cp.title}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60 shrink-0" aria-hidden="true" />
                                </a>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {cp.keyIdea}
                              </p>
                              {cp.topics.length > 0 && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  {cp.topics.join(' · ')}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-2 align-top">
                              <span className={`font-semibold ${DIFFICULTY_TEXT_CLASS[cp.difficulty]}`}>
                                {cp.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-2 align-top hidden sm:table-cell font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
                              {cp.confidence ? `${cp.confidence}% match` : 'Custom'}
                            </td>
                            <td className="py-3 pl-2 pr-4 align-top text-right">
                              <div className="inline-flex items-center gap-2.5">
                                {onAnalyzeInSolver && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAnalyzeInSolver({
                                        id: cp.id,
                                        title: cp.title,
                                        statement: cp.statement || cp.keyIdea,
                                        sourcePlatform: cp.sourcePlatform,
                                        sourceUrl: cp.url,
                                        difficulty: cp.difficulty,
                                        examples: cp.examples,
                                        constraints: cp.constraints,
                                        topics: cp.topics,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap"
                                  >
                                    <span>Solver</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onRemoveCustomProblem(cp.id)}
                                  aria-label={`Remove ${cp.title}`}
                                  className="text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Cross-Cutting Techniques Note */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <span>Cross-Cutting Techniques Alongside the 28 Patterns</span>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                {crossCutting.map((tech) => (
                  <div key={tech.id} className="space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {tech.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tech.summary}
                    </p>
                    <div className="pt-1 space-y-1">
                      {tech.canonicalExamples.map((ex) => (
                        <div key={ex.slug} className="text-[11px] flex items-baseline gap-1.5">
                          <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                            #{ex.leetcodeNumber}
                          </span>
                          <a
                            href={`https://leetcode.com/problems/${ex.slug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 shrink-0"
                          >
                            {ex.title}
                          </a>
                          <span className="text-slate-400 dark:text-slate-500 truncate">
                            — {ex.keyTrick}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPACT 28-QUESTION REVISION LIST */}
      {subView === 'compact28' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Compact 28-Question Revision Sheet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exactly one canonical LeetCode problem per pattern for rapid pre-interview revision.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              Showing {filteredCompact28.length} of 28 · {stats.solvedCompact28} solved
            </span>
          </div>

          {filteredCompact28.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No revision questions match the active filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/50">
                    <th className="py-2.5 pl-4 pr-2 w-12">State</th>
                    <th className="py-2.5 px-2 w-12">#</th>
                    <th className="py-2.5 px-2 w-56">Pattern</th>
                    <th className="py-2.5 px-2">Canonical LeetCode Problem &amp; Key Trick</th>
                    <th className="py-2.5 px-2 w-20">Level</th>
                    <th className="py-2.5 px-2 w-28 hidden md:table-cell">Complexity</th>
                    <th className="py-2.5 pl-2 pr-4 w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {filteredCompact28.map(({ pattern, problem }) => {
                    const status = getStatus(problem.slug);
                    const hasTpl = templateByPatternId.has(pattern.id);
                    return (
                      <tr
                        key={pattern.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 pl-4 pr-2 align-top">
                          <StatusCycleButton
                            status={status}
                            onClick={() => cycleStatus(problem.slug)}
                            title={problem.title}
                          />
                        </td>
                        <td className="py-3 px-2 align-top font-mono tabular-nums text-slate-400 dark:text-slate-500">
                          {String(pattern.number).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-2 align-top">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatternId(pattern.id);
                              setSubView('roadmap');
                            }}
                            className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400"
                          >
                            {pattern.title}
                          </button>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {groupMap.get(pattern.groupId)?.shortTitle}
                          </div>
                        </td>
                        <td className="py-3 px-2 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-[11px] text-slate-400 dark:text-slate-500">
                              LC #{problem.leetcodeNumber}
                            </span>
                            <a
                              href={problem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1"
                            >
                              <span>{problem.title}</span>
                              <ExternalLink className="w-3 h-3 opacity-60 shrink-0" aria-hidden="true" />
                            </a>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {problem.keyIdea}
                          </p>
                        </td>
                        <td className="py-3 px-2 align-top">
                          <span className={`font-semibold ${DIFFICULTY_TEXT_CLASS[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-2 align-top hidden md:table-cell font-mono tabular-nums text-[11px] text-slate-600 dark:text-slate-400">
                          <div>{problem.timeComplexity}</div>
                          <div className="text-slate-400 dark:text-slate-500">{problem.spaceComplexity}</div>
                        </td>
                        <td className="py-3 pl-2 pr-4 align-top text-right">
                          <div className="inline-flex items-center gap-2.5">
                            {hasTpl && (
                              <button
                                type="button"
                                onClick={() => openTemplateForPattern(pattern.id)}
                                className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap"
                              >
                                Template
                              </button>
                            )}
                            {onAnalyzeInSolver && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAnalyzeInSolver({
                                    id: problem.id,
                                    title: `LC #${problem.leetcodeNumber}: ${problem.title}`,
                                    statement: `${problem.title} (Pattern #${pattern.number}: ${pattern.title}). Key Interview Insight: ${problem.keyIdea}`,
                                    sourcePlatform: 'LeetCode',
                                    sourceUrl: problem.url,
                                    difficulty: problem.difficulty,
                                    topics: [pattern.title],
                                  })
                                }
                                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap"
                              >
                                <span>Solver</span>
                                <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MY CUSTOM PROBLEMS */}
      {subView === 'custom' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                My Custom Problems
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                LeetCode and GeeksforGeeks problems parsed via the server API, categorized under your 28-pattern roadmap, and synced to your account.
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerAddModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Custom Problem</span>
            </button>
          </div>

          {customProblems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No custom problems added yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Paste any LeetCode or GeeksforGeeks URL to automatically parse its problem statement, examples, and constraints and save it into your synced practice sheet.
              </p>
              <button
                type="button"
                onClick={() => triggerAddModal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Your First Custom Problem</span>
              </button>
            </div>
          ) : filteredCustomProblems.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No custom problems match your current filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredCustomProblems.map((cp) => {
                const status = getStatus(cp.slug);
                const assignedPattern = patternMap.get(cp.patternId);
                const isExpanded = expandedStatementId === cp.id;
                return (
                  <div key={cp.id} className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="pt-0.5">
                          <StatusCycleButton
                            status={status}
                            onClick={() => cycleStatus(cp.slug)}
                            title={cp.title}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                            <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                              {cp.sourcePlatform}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className={`font-semibold ${DIFFICULTY_TEXT_CLASS[cp.difficulty]}`}>
                              {cp.difficulty}
                            </span>
                            {assignedPattern && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700">·</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatternId(assignedPattern.id);
                                    setSubView('roadmap');
                                  }}
                                  className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                                >
                                  #{String(assignedPattern.number).padStart(2, '0')}{' '}
                                  {assignedPattern.shortTitle}
                                </button>
                              </>
                            )}
                          </div>
                          <a
                            href={cp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>{cp.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" aria-hidden="true" />
                          </a>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {cp.keyIdea}
                          </p>
                          {cp.topics.length > 0 && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {cp.topics.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                        {cp.statement && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedStatementId(isExpanded ? null : cp.id)
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                          >
                            <span>{isExpanded ? 'Hide Statement' : 'Statement'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                          </button>
                        )}
                        {onAnalyzeInSolver && (
                          <button
                            type="button"
                            onClick={() =>
                              onAnalyzeInSolver({
                                id: cp.id,
                                title: cp.title,
                                statement: cp.statement || cp.keyIdea,
                                sourcePlatform: cp.sourcePlatform,
                                sourceUrl: cp.url,
                                difficulty: cp.difficulty,
                                examples: cp.examples,
                                constraints: cp.constraints,
                                topics: cp.topics,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap"
                          >
                            <span>Open in Solver</span>
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveCustomProblem(cp.id)}
                          aria-label={`Remove ${cp.title}`}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && cp.statement && (
                      <div className="ml-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-3">
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {cp.statement}
                        </p>
                        {cp.examples && cp.examples.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {cp.examples.map((ex, idx) => (
                              <pre
                                key={idx}
                                className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto"
                              >
                                {ex}
                              </pre>
                            ))}
                          </div>
                        )}
                        {cp.constraints && cp.constraints.length > 0 && (
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            Constraints: {cp.constraints.join(' · ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: TRICKIEST PATTERN CODE TEMPLATES */}
      {subView === 'templates' && activeTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Trickiest Pattern Templates
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {templates.length} blueprints
              </span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[660px] overflow-y-auto">
              {templates.map((tpl) => {
                const selected = tpl.patternId === activeTemplate.patternId;
                return (
                  <button
                    key={tpl.patternId}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.patternId)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selected
                        ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          selected ? 'text-sky-300 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        Pattern #{String(tpl.patternNumber).padStart(2, '0')} · {tpl.frictionLevel}
                      </span>
                    </div>
                    <p className="text-xs font-semibold mt-0.5">{tpl.title}</p>
                    <p
                      className={`text-[11px] mt-0.5 line-clamp-1 ${
                        selected ? 'text-slate-300 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {tpl.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    Pattern #{String(activeTemplate.patternNumber).padStart(2, '0')} · {activeTemplate.complexity}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {activeTemplate.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {activeTemplate.whenToUse}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatternId(activeTemplate.patternId);
                    setSubView('roadmap');
                  }}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                >
                  View Practice Problems →
                </button>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Critical Loop / Data Invariant
                </p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                  {activeTemplate.keyInvariant}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: 'python', label: 'Python' },
                        { id: 'typescript', label: 'TypeScript' },
                        { id: 'java', label: 'Java' },
                      ] as const
                    ).map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setTemplateLang(lang.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
                          templateLang === lang.id
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  <CopyButton
                    text={activeTemplate.code[templateLang]}
                    label="Copy Template"
                    copiedLabel="Copied"
                    variant="dark-surface"
                    size="xs"
                  />
                </div>
                <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                  <code>{activeTemplate.code[templateLang]}</code>
                </pre>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                  Common Interview Pitfalls to Avoid
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {activeTemplate.commonPitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-rose-500 shrink-0">{idx + 1}.</span>
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {onProblemAddedFallback && (
        <AddCustomProblemModal
          open={standaloneModalOpen}
          onClose={() => setStandaloneModalOpen(false)}
          existingProblems={customProblems}
          defaultPatternId={activePattern?.id}
          onProblemAdded={onProblemAddedFallback}
        />
      )}
    </div>
  );
};
