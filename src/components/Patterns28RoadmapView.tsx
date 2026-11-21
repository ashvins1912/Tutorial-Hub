import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Download,
  ExternalLink,
  Layers,
  ListChecks,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  classifyQuestionToPattern28,
  type CustomPattern28Problem,
  type Dsa28Difficulty,
  type Dsa28TopicGroupId,
} from '../data/dsa28Patterns';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { useAccountState } from '../hooks/useAccountState';
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
import {
  CatalogSearchInput,
  CopyButton,
  OverlayDialog,
  OverlayHeader,
} from './ui';
import { apiFetch } from '../lib/apiFetch';

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
  onAnalyzeInSolver?: (problem: SolverHandoffProblem) => void;
}

type RoadmapSubView = 'roadmap' | 'compact28' | 'templates';
type TemplateLanguage = 'python' | 'typescript' | 'java';

const DIFFICULTY_TEXT_CLASS: Record<Dsa28Difficulty, string> = {
  Easy: 'text-emerald-600 dark:text-emerald-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Hard: 'text-rose-600 dark:text-rose-400',
};

interface PulledDraft {
  sourcePlatform: 'LeetCode' | 'GeeksforGeeks' | 'Custom';
  sourceUrl: string;
  slug: string;
  title: string;
  difficulty: Dsa28Difficulty;
  statement: string;
  topics: string[];
  constraints: string[];
}

export const Patterns28RoadmapView: React.FC<Patterns28RoadmapViewProps> = ({
  onAnalyzeInSolver,
}) => {
  const {
    data: { groups, patterns, crossCutting, templates },
  } = useAsyncCatalog('dsa-28-patterns');

  const [customProblems, setCustomProblems] = useAccountState<CustomPattern28Problem[]>(
    'dsa-28-custom-problems',
    [],
    'patternforge_dsa28_custom_v1'
  );

  const { getStatus, cycleStatus } = useProblemStatusTracker();

  const [subView, setSubView] = useState<RoadmapSubView>('roadmap');
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    patterns[0]?.id ?? 'hashmap-hashset-lookup'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.patternId ?? 'binary-search-on-answer'
  );
  const [templateLang, setTemplateLang] = useState<TemplateLanguage>('python');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | Dsa28TopicGroupId>('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProblemStatus[]>([]);

  // Pull from LeetCode / GeeksforGeeks modal state
  const [pullOpen, setPullOpen] = useState(false);
  const [pullMode, setPullMode] = useState<'url' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [platformHint, setPlatformHint] = useState<'LeetCode' | 'GeeksforGeeks'>('LeetCode');
  const [pullLoading, setPullLoading] = useState(false);
  const [pullError, setPullError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PulledDraft | null>(null);
  const [chosenPatternId, setChosenPatternId] = useState<string>('hashmap-hashset-lookup');
  const [customKeyIdea, setCustomKeyIdea] = useState('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Manual form fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState<'LeetCode' | 'GeeksforGeeks'>('LeetCode');
  const [manualUrl, setManualUrl] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState<Dsa28Difficulty>('Medium');
  const [manualTags, setManualTags] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const groupMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups]
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
        const st = getStatus(prob.slug);
        if (st === 'solved') {
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
        `${cp.sourcePlatform} ${cp.topics.join(' ')} ${cp.keyIdea}`,
        cp.difficulty,
        cp.slug
      )
    );
    return { canonical, custom };
  }, [activePattern, customByPatternId, selectedDifficulties, selectedStatuses, normalizedQuery, getStatus]);

  // Live classification for either pulled draft or manual entry
  const activeClassification = useMemo(() => {
    if (pullMode === 'url' && draft) {
      return classifyQuestionToPattern28({
        title: draft.title,
        statement: draft.statement,
        topics: draft.topics,
        constraints: draft.constraints,
      });
    }
    if (pullMode === 'manual' && (manualTitle.trim() || manualTags.trim() || manualNotes.trim())) {
      return classifyQuestionToPattern28({
        title: manualTitle,
        statement: manualNotes,
        topics: manualTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    }
    return null;
  }, [pullMode, draft, manualTitle, manualTags, manualNotes]);

  useEffect(() => {
    if (pullMode === 'manual' && activeClassification) {
      setChosenPatternId(activeClassification.best.patternId);
    }
  }, [pullMode, activeClassification]);

  const openPullDialog = () => {
    setPullError(null);
    setSaveNotice(null);
    setPullOpen(true);
  };

  const handlePullFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = urlInput.trim();
    if (!cleaned) {
      setPullError('Paste a LeetCode or GeeksforGeeks problem URL (or slug).');
      return;
    }

    setPullLoading(true);
    setPullError(null);
    setSaveNotice(null);
    try {
      const response = await apiFetch('/api/solver/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleaned, platform: platformHint }),
      });
      const data = await response.json();
      if (!response.ok || !data?.problem) {
        throw new Error(data?.error || 'Could not fetch this problem. Switch to Manual Entry to add it directly.');
      }
      const fetched = data.problem as PulledDraft;
      const classification = classifyQuestionToPattern28({
        title: fetched.title,
        statement: fetched.statement,
        topics: fetched.topics,
        constraints: fetched.constraints,
      });
      setDraft(fetched);
      setChosenPatternId(classification.best.patternId);
      setCustomKeyIdea(
        fetched.statement
          ? fetched.statement.split('\n')[0].slice(0, 150)
          : `Pulled from ${fetched.sourcePlatform}`
      );
    } catch (err) {
      setPullError(
        err instanceof Error
          ? err.message
          : 'Unable to pull question right now. You can add it via Manual Entry.'
      );
    } finally {
      setPullLoading(false);
    }
  };

  const handleAddToEligiblePattern = () => {
    setPullError(null);

    let nextItem: CustomPattern28Problem | null = null;

    if (pullMode === 'url') {
      if (!draft) {
        setPullError('Pull a LeetCode or GeeksforGeeks question first.');
        return;
      }
      const slugKey = `${draft.sourcePlatform.toLowerCase()}-${draft.slug}`;
      nextItem = {
        id: `custom-${slugKey}`,
        patternId: chosenPatternId,
        sourcePlatform: draft.sourcePlatform,
        title: draft.title,
        slug: slugKey,
        url: draft.sourceUrl,
        difficulty: draft.difficulty,
        topics: draft.topics.slice(0, 6),
        keyIdea: customKeyIdea.trim() || `Pulled from ${draft.sourcePlatform}`,
        statement: draft.statement?.slice(0, 1600),
        addedAt: new Date().toISOString(),
        confidence: activeClassification?.best.confidence,
      };
    } else {
      const titleClean = manualTitle.trim();
      if (!titleClean) {
        setPullError('Enter a problem title before adding.');
        return;
      }
      const slugRaw = titleClean
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const slugKey = `${manualPlatform.toLowerCase()}-${slugRaw || Date.now()}`;
      const fallbackUrl =
        manualUrl.trim() ||
        (manualPlatform === 'LeetCode'
          ? `https://leetcode.com/problems/${slugRaw}/`
          : `https://www.geeksforgeeks.org/problems/${slugRaw}/1`);
      const targetPatternId =
        chosenPatternId || activeClassification?.best.patternId || patterns[0].id;
      nextItem = {
        id: `custom-${slugKey}`,
        patternId: targetPatternId,
        sourcePlatform: manualPlatform,
        title: titleClean,
        slug: slugKey,
        url: fallbackUrl,
        difficulty: manualDifficulty,
        topics: manualTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 6),
        keyIdea: manualNotes.trim() || `Added from ${manualPlatform}`,
        statement: manualNotes.trim() || undefined,
        addedAt: new Date().toISOString(),
        confidence: activeClassification?.best.confidence,
      };
    }

    if (!nextItem) return;

    const alreadyExists = customProblems.some(
      (item) => item.slug === nextItem!.slug || item.url === nextItem!.url
    );
    if (alreadyExists) {
      setPullError('This question is already in your 28-Pattern Roadmap.');
      return;
    }

    setCustomProblems((prev) => [nextItem!, ...prev]);
    setSelectedPatternId(nextItem.patternId);
    setSubView('roadmap');
    const matchedPattern = patterns.find((pat) => pat.id === nextItem!.patternId);
    setSaveNotice(
      `Added "${nextItem.title}" to #${matchedPattern?.number ?? ''} ${matchedPattern?.shortTitle ?? ''}.`
    );

    // Reset draft & close after short beat
    setDraft(null);
    setUrlInput('');
    setManualTitle('');
    setManualUrl('');
    setManualTags('');
    setManualNotes('');
    setPullOpen(false);
  };

  const handleRemoveCustomProblem = (id: string) => {
    setCustomProblems((prev) => prev.filter((item) => item.id !== id));
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
            <div className="flex items-center gap-2 text-xs font-mono text-sky-600 dark:text-sky-400">
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
              Master all 28 recurring coding patterns, drill the 1-per-pattern Compact 28 Revision List, reference battle-tested templates for the trickiest patterns, or pull any LeetCode / GeeksforGeeks question directly into its eligible category.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openPullDialog}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Pull from LeetCode / GFG</span>
            </button>
          </div>
        </div>

        {/* Metrics Row (single-elevation hairline dividers, tabular-nums) */}
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
              Custom Pulled Questions
            </p>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.customCount} synced
            </p>
          </div>
        </div>

        {saveNotice && (
          <div className="mt-4 px-3.5 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
            <span>{saveNotice}</span>
            <button
              type="button"
              onClick={() => setSaveNotice(null)}
              className="text-[11px] font-semibold underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* Sub-view Segmented Control & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit max-w-full overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'roadmap', label: '28-Pattern Explorer', icon: Layers },
              { id: 'compact28', label: 'Compact 28 Revision List', icon: ListChecks },
              { id: 'templates', label: `Trickiest Templates (${templates.length})`, icon: Code2 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = subView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubView(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

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

      {/* Filter Bar for Roadmap & Compact 28 views */}
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

      {/* ===================================================================== */}
      {/* VIEW 1: 28-PATTERN ROADMAP EXPLORER                                   */}
      {/* ===================================================================== */}
      {subView === 'roadmap' && activePattern && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Rail: All 28 Patterns Grouped by the 5 Topics */}
          <aside className="lg:col-span-4 xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
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
          <div className="lg:col-span-8 xl:col-span-8 space-y-4">
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

            {/* Problem List Table for Selected Pattern */}
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
                      ? ` + ${activePatternProblems.custom.length} pulled`
                      : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openPullDialog}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                >
                  + Add LeetCode / GFG question
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

                      {/* User-pulled LeetCode / GFG questions assigned to this pattern */}
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
                                  {cp.sourcePlatform} · Pulled
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
                                  onClick={() => handleRemoveCustomProblem(cp.id)}
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

            {/* Cross-Cutting Techniques Note (Greedy & Bit Manipulation) */}
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

      {/* ===================================================================== */}
      {/* VIEW 2: COMPACT 28-QUESTION REVISION LIST (1 CANONICAL PER PATTERN)   */}
      {/* ===================================================================== */}
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

      {/* ===================================================================== */}
      {/* VIEW 3: TRICKIEST PATTERN CODE TEMPLATES                              */}
      {/* ===================================================================== */}
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

              {/* Code Surface */}
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

              {/* Common Pitfalls */}
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

      {/* ===================================================================== */}
      {/* PULL FROM LEETCODE / GEEKSFORGEEKS & AUTO-CATEGORIZE DIALOG           */}
      {/* ===================================================================== */}
      <OverlayDialog
        open={pullOpen}
        onClose={() => setPullOpen(false)}
        ariaLabel="Pull question from LeetCode or GeeksforGeeks"
        maxWidthClass="max-w-2xl"
      >
        <OverlayHeader
          kicker="AUTO-CLASSIFY INTO ELIGIBLE PATTERN"
          title="Pull Question from LeetCode or GeeksforGeeks"
          subtitle="Fetch problem metadata directly from leetcode.com or geeksforgeeks.org, review the matched pattern among the 28 categories, and save it to your synced roadmap."
          onClose={() => setPullOpen(false)}
        />

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-fit">
            <button
              type="button"
              onClick={() => {
                setPullMode('url');
                setPullError(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                pullMode === 'url'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pull by URL / Slug
            </button>
            <button
              type="button"
              onClick={() => {
                setPullMode('manual');
                setPullError(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                pullMode === 'manual'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Quick Manual Entry
            </button>
          </div>

          {pullMode === 'url' ? (
            <form onSubmit={handlePullFromUrl} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  aria-label="Platform hint for bare slugs"
                  value={platformHint}
                  onChange={(e) =>
                    setPlatformHint(e.target.value as 'LeetCode' | 'GeeksforGeeks')
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200 shrink-0"
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="GeeksforGeeks">GeeksforGeeks</option>
                </select>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://leetcode.com/problems/koko-eating-bananas/ or GFG URL"
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
                <button
                  type="submit"
                  disabled={pullLoading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {pullLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>Pulling...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pull Question</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports full URLs from <span className="font-mono">leetcode.com/problems/...</span> and{' '}
                <span className="font-mono">geeksforgeeks.org/problems/...</span> or a bare problem slug.
              </p>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g., Allocate Minimum Number of Pages"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Platform
                </label>
                <select
                  value={manualPlatform}
                  onChange={(e) =>
                    setManualPlatform(e.target.value as 'LeetCode' | 'GeeksforGeeks')
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="GeeksforGeeks">GeeksforGeeks</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Difficulty
                </label>
                <select
                  value={manualDifficulty}
                  onChange={(e) => setManualDifficulty(e.target.value as Dsa28Difficulty)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Problem URL (optional)
                </label>
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://www.geeksforgeeks.org/problems/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Topic Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={manualTags}
                  onChange={(e) => setManualTags(e.target.value)}
                  placeholder="Binary Search, Greedy, Array"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Key Insight / Statement Clues
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Minimize the maximum pages assigned..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {pullError && (
            <div className="px-3.5 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300">
              {pullError}
            </div>
          )}

          {/* Pulled Draft Preview */}
          {pullMode === 'url' && draft && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {draft.sourcePlatform} ·{' '}
                  <span className={`font-semibold ${DIFFICULTY_TEXT_CLASS[draft.difficulty]}`}>
                    {draft.difficulty}
                  </span>
                </div>
                <a
                  href={draft.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Open Original</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {draft.title}
              </h3>
              {draft.topics.length > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tags: {draft.topics.join(' · ')}
                </p>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Revision Note / Key Idea
                </label>
                <input
                  type="text"
                  value={customKeyIdea}
                  onChange={(e) => setCustomKeyIdea(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Auto-Classified Eligible Pattern Selection */}
          {activeClassification && (
            <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/25 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Recommended Eligible Pattern</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    #{String(activeClassification.best.patternNumber).padStart(2, '0')}{' '}
                    {activeClassification.best.patternTitle}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {activeClassification.best.matchedReasons.join(' · ')}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-xs font-bold text-sky-700 dark:text-sky-400 shrink-0">
                  {activeClassification.best.confidence}% match
                </span>
              </div>

              {/* Quick clickable alternatives */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 mr-1">Alternatives:</span>
                {[activeClassification.best, ...activeClassification.alternatives].map((cand) => {
                  const active = chosenPatternId === cand.patternId;
                  return (
                    <button
                      key={cand.patternId}
                      type="button"
                      onClick={() => setChosenPatternId(cand.patternId)}
                      className={`px-2 py-1 rounded-md font-medium border transition-colors ${
                        active
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                      }`}
                    >
                      #{cand.patternNumber} {cand.patternTitle}
                    </button>
                  );
                })}
              </div>

              {/* Full 28-pattern override selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Target Eligible Category (Override Any of 28)
                </label>
                <select
                  value={chosenPatternId}
                  onChange={(e) => setChosenPatternId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                >
                  {groups.map((grp) => (
                    <optgroup key={grp.id} label={grp.title}>
                      {patterns
                        .filter((pat) => pat.groupId === grp.id)
                        .map((pat) => (
                          <option key={pat.id} value={pat.id}>
                            #{String(pat.number).padStart(2, '0')} {pat.title}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setPullOpen(false)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddToEligiblePattern}
            disabled={pullMode === 'url' ? !draft : !manualTitle.trim()}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-40 transition-colors"
          >
            Add to Eligible Category
          </button>
        </div>
      </OverlayDialog>
    </div>
  );
};
