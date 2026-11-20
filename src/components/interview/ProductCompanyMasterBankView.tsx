import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Brain,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  type BankDifficulty,
} from '../../data/productCompanyMasterBank';
import { useAccountState } from '../../hooks/useAccountState';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';
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

const SOLVED_STORAGE_KEY = 'patternforge_product_master95_solved_v1';

interface ProductCompanyMasterBankViewProps {
  onAnalyzeInSolver: (problem: { id: string; title: string; statement: string }) => void;
  onOpenCurriculumTopic: (topicId: string) => void;
}

const ALL_COMPANIES = [
  'All',
  'Google',
  'Amazon',
  'Meta',
  'Microsoft',
  'Uber',
  'Atlassian',
  'Flipkart',
  'Razorpay',
  'Swiggy',
  'Adobe',
] as const;

export const ProductCompanyMasterBankView: React.FC<ProductCompanyMasterBankViewProps> = ({
  onAnalyzeInSolver,
  onOpenCurriculumTopic,
}) => {
  const {
    data: {
      highYield: PRODUCT_COMPANY_HIGH_YIELD,
      master13: MASTER_13_TOPIC_BANK,
      companyCheatsheet: COMPANY_PATTERN_CHEATSHEET,
    },
  } = useAsyncCatalog('product-company-bank');
  const [mode, setMode] = useState<'product-companies' | 'master-13'>('product-companies');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProblemStatus[]>([]);
  const [query, setQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const [solvedIds, setSolvedIds] = useAccountState<string[]>(
    'product-company-solved',
    [],
    SOLVED_STORAGE_KEY
  );

  const { getStatus, cycleStatus, markInProgressIfUnattempted } = useProblemStatusTracker({
    legacySolvedIds: solvedIds,
    onSyncLegacySolved: (id, isSolved) => {
      setSolvedIds((prev) => {
        const has = prev.includes(id);
        if (isSolved && !has) return [...prev, id];
        if (!isSolved && has) return prev.filter((x) => x !== id);
        return prev;
      });
    },
  });

  const totalMasterCount = useMemo(
    () => MASTER_13_TOPIC_BANK.reduce((acc, sec) => acc + sec.problems.length, 0),
    [],
  );

  const solvedProductCount = useMemo(
    () => PRODUCT_COMPANY_HIGH_YIELD.filter((q) => getStatus(q.id) === 'solved').length,
    [getStatus],
  );

  const solvedMasterCount = useMemo(
    () =>
      MASTER_13_TOPIC_BANK.reduce(
        (acc, sec) => acc + sec.problems.filter((pr) => getStatus(pr.id) === 'solved').length,
        0,
      ),
    [getStatus],
  );

  const activeModeScope = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (mode === 'product-companies') {
      return PRODUCT_COMPANY_HIGH_YIELD.filter((item) => {
        const matchCompany =
          companyFilter === 'All' || item.companies.includes(companyFilter);
        const matchSearch =
          !q ||
          `${item.title} ${item.primaryPattern} ${item.whyAsked} ${item.section} ${item.companies.join(' ')}`
            .toLowerCase()
            .includes(q);
        return matchCompany && matchSearch;
      }).map((item) => ({ id: item.id, difficulty: item.difficulty }));
    }
    return MASTER_13_TOPIC_BANK.flatMap((section) =>
      section.problems
        .filter((pr) => {
          const matchCompany =
            companyFilter === 'All' || pr.companies.includes(companyFilter);
          const matchSearch =
            !q ||
            `${pr.title} ${pr.patternClue} ${section.title} ${pr.companies.join(' ')}`
              .toLowerCase()
              .includes(q);
          return matchCompany && matchSearch;
        })
        .map((pr) => ({ id: pr.id, difficulty: pr.difficulty })),
    );
  }, [mode, companyFilter, query]);

  const filterCounts = useMemo(() => {
    const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const status = { solved: 0, 'in-progress': 0, unattempted: 0 };
    for (const item of activeModeScope) {
      difficulty[item.difficulty] += 1;
      status[getStatus(item.id)] += 1;
    }
    return { difficulty, status };
  }, [activeModeScope, getStatus]);

  const filteredProductQuestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_COMPANY_HIGH_YIELD.filter((item) => {
      const matchCompany =
        companyFilter === 'All' || item.companies.includes(companyFilter);
      const matchDiff =
        selectedDifficulties.length === 0 || selectedDifficulties.includes(item.difficulty);
      const matchStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(getStatus(item.id));
      const matchSearch =
        !q ||
        `${item.title} ${item.primaryPattern} ${item.whyAsked} ${item.section} ${item.companies.join(' ')}`
          .toLowerCase()
          .includes(q);
      return matchCompany && matchDiff && matchStatus && matchSearch;
    });
  }, [companyFilter, selectedDifficulties, selectedStatuses, query, getStatus]);

  const productSections = useMemo(() => {
    const map = new Map<string, typeof filteredProductQuestions>();
    for (const item of filteredProductQuestions) {
      const list = map.get(item.section) ?? [];
      list.push(item);
      map.set(item.section, list);
    }
    return Array.from(map.entries());
  }, [filteredProductQuestions]);

  const filteredMasterTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MASTER_13_TOPIC_BANK.map((section) => {
      const problems = section.problems.filter((pr) => {
        const matchCompany =
          companyFilter === 'All' || pr.companies.includes(companyFilter);
        const matchDiff =
          selectedDifficulties.length === 0 || selectedDifficulties.includes(pr.difficulty);
        const matchStatus =
          selectedStatuses.length === 0 || selectedStatuses.includes(getStatus(pr.id));
        const matchSearch =
          !q ||
          `${pr.title} ${pr.patternClue} ${section.title} ${pr.companies.join(' ')}`
            .toLowerCase()
            .includes(q);
        return matchCompany && matchDiff && matchStatus && matchSearch;
      });
      return { ...section, problems };
    }).filter((sec) => sec.problems.length > 0);
  }, [companyFilter, selectedDifficulties, selectedStatuses, query, getStatus]);

  const visibleCount =
    mode === 'product-companies'
      ? filteredProductQuestions.length
      : filteredMasterTopics.reduce((acc, s) => acc + s.problems.length, 0);

  const diffTone = (d: BankDifficulty) =>
    d === 'Easy'
      ? 'text-emerald-700 dark:text-emerald-400'
      : d === 'Medium'
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="space-y-5">
      {/* Header & Mode Switcher */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Curated Product-Company Bank & 13-Topic Master Roadmap</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                {PRODUCT_COMPANY_HIGH_YIELD.length} High-Yield Focus · {totalMasterCount} Master Core Problems
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Product Company High-Yield & Master 95 DSA Sheet
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
              Grouped by company focus areas (Google, Amazon, Meta, Microsoft, Uber, Atlassian, Flipkart, Razorpay, Swiggy, Adobe) and ordered across 13 foundational-to-system DSA topics. Launch any question directly into the Universal Logic Solver or its visual curriculum lab.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-fit shrink-0">
            <button
              type="button"
              onClick={() => setMode('product-companies')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'product-companies'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Product Co. Focus ({solvedProductCount}/{PRODUCT_COMPANY_HIGH_YIELD.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('master-13')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === 'master-13'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>13-Topic Master ({solvedMasterCount}/{totalMasterCount})</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search problem, pattern, or company..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              aria-label="Filter by company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              {ALL_COMPANIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Companies' : c}
                </option>
              ))}
            </select>
          </div>

          <ProblemFilterBar
            selectedDifficulties={selectedDifficulties}
            onToggleDifficulty={(d) => setSelectedDifficulties((prev) => toggleFilterValue(prev, d))}
            onClearDifficulties={() => setSelectedDifficulties([])}
            selectedStatuses={selectedStatuses}
            onToggleStatus={(s) => setSelectedStatuses((prev) => toggleFilterValue(prev, s))}
            onClearStatuses={() => setSelectedStatuses([])}
            counts={filterCounts}
            totalMatching={visibleCount}
            totalCount={activeModeScope.length}
          />
        </div>
      </div>

      {/* MODE 1: PRODUCT COMPANIES HIGH-YIELD + CHEAT SHEET */}
      {mode === 'product-companies' && (
        <div className="space-y-5">
          {/* Company-Specific Pattern Cheat Sheet */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Company-Specific Pattern Cheat Sheet</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Click a company tier to filter questions below
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-4 font-semibold">Company Tier</th>
                    <th className="py-2.5 px-4 font-semibold">Top Algorithmic Themes</th>
                    <th className="py-2.5 px-4 font-semibold">Signature Questions</th>
                    <th className="py-2.5 px-4 font-semibold">Hiring Bar Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {COMPANY_PATTERN_CHEATSHEET.map((row) => (
                    <tr
                      key={row.companyTier}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setCompanyFilter(row.companies[0])}
                          className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 underline-offset-2 hover:underline"
                        >
                          {row.companyTier}
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                        {row.topThemes.join(' · ')}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-indigo-700 dark:text-indigo-300">
                        {row.signatureQuestions.join(', ')}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {row.interviewFocus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Grouped Product-Company Question Sections */}
          {productSections.map(([sectionName, items]) => (
            <section
              key={sectionName}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {sectionName}
                </h3>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {items.filter((i) => solvedIds.includes(i.id)).length} / {items.length} solved
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item) => {
                  const status = getStatus(item.id);
                  const isOpen = expandedCardId === item.id;
                  return (
                    <div key={item.id} className="p-4 space-y-2.5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 shrink-0">
                            <StatusCycleButton
                              status={status}
                              title={item.title}
                              onClick={() => cycleStatus(item.id)}
                            />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedCardId(isOpen ? null : item.id);
                                  markInProgressIfUnattempted(item.id);
                                }}
                                className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left"
                              >
                                {item.title}
                              </button>
                              <span className={`text-xs font-mono font-semibold ${diffTone(item.difficulty)}`}>
                                {item.difficulty}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">·</span>
                              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                {item.primaryPattern}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              <strong className="text-slate-800 dark:text-slate-200">Why asked:</strong>{' '}
                              {item.whyAsked}
                            </p>

                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              Companies: {item.companies.join(' · ')} · Optimal: {item.optimalComplexity}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-6 md:pl-0">
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedCardId(isOpen ? null : item.id);
                              markInProgressIfUnattempted(item.id);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                          >
                            {isOpen ? 'Hide Brute → Optimal' : 'Brute → Optimal'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              markInProgressIfUnattempted(item.id);
                              onAnalyzeInSolver({
                                id: item.id,
                                title: item.title,
                                statement: item.solverPrompt,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            <Brain className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Logic Solver</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenCurriculumTopic(item.curriculumTopicId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 whitespace-nowrap"
                          >
                            <span>Module</span>
                            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 text-xs">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                              Brute Force Baseline
                            </div>
                            <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                              {item.bruteForce}
                            </p>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                              Optimal Pattern ({item.optimalComplexity})
                            </div>
                            <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                              {item.optimalApproach}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* MODE 2: 13-TOPIC MASTER 95 ROADMAP */}
      {mode === 'master-13' && (
        <div className="space-y-3">
          {filteredMasterTopics.map((section) => {
            const isCollapsed = Boolean(collapsedTopics[section.id]);
            const secSolved = section.problems.filter((pr) => solvedIds.includes(pr.id)).length;
            return (
              <section
                key={section.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedTopics((prev) => ({
                        ...prev,
                        [section.id]: !prev[section.id],
                      }))
                    }
                    className="flex items-center gap-2 text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {section.order}. {section.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{section.focus}</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                      {secSolved} / {section.problems.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenCurriculumTopic(section.curriculumTopicId)}
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      <span>Open Topic Lab</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {section.problems.map((pr) => {
                      const status = getStatus(pr.id);
                      return (
                        <div
                          key={pr.id}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5 shrink-0">
                              <StatusCycleButton
                                status={status}
                                title={pr.title}
                                onClick={() => cycleStatus(pr.id)}
                              />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-mono tabular-nums text-xs text-slate-400">
                                  {section.order}.{pr.number}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                                  {pr.title}
                                </span>
                                <span className={`text-xs font-mono font-semibold ${diffTone(pr.difficulty)}`}>
                                  {pr.difficulty}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {pr.patternClue}
                                <span className="text-slate-400"> · </span>
                                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                  {pr.companies.join(', ')}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pl-6 sm:pl-0">
                            <button
                              type="button"
                              onClick={() => {
                                markInProgressIfUnattempted(pr.id);
                                onAnalyzeInSolver({
                                  id: pr.id,
                                  title: pr.title,
                                  statement: pr.solverPrompt,
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              <Brain className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Analyze</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenCurriculumTopic(pr.curriculumTopicId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-500 whitespace-nowrap"
                            >
                              <span>Visual Lab</span>
                              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
