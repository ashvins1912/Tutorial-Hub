import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  Compass,
  ExternalLink,
  Search,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { apiFetch } from '../../../lib/apiFetch';
import { useAccountState } from '../../../hooks/useAccountState';
import {
  useProblemStatusTracker,
  type ProblemDifficulty,
  type ProblemStatus,
} from '../../../hooks/useProblemStatusTracker';
import {
  ProblemFilterBar,
  StatusCycleButton,
  toggleFilterValue,
} from '../../../components/shared/ProblemFilterBar';
import { useAsyncCatalog } from '../../../hooks/useAsyncCatalog';
import {
  CURATED_TOPIC_OPTIONS,
  type CuratedInterviewQuestion,
  type InterviewDifficulty,
  type InterviewTrack,
} from '../data/curatedInterviewBank';

type TrackFilter = 'all' | InterviewTrack;

interface OfficialReference {
  title: string;
  questionId: string;
  difficulty: string;
  slug: string;
  contentHtml?: string;
  exampleTestcases?: string;
  hints?: string[];
}

export interface InterviewProblemCatalogPanelProps {
  activeTopicId?: string;
  onSelectCurriculumTopic?: (topicId: string) => void;
  onOpenProblemTrainer?: (slug: string) => void;
}

const TRACK_TABS: { id: TrackFilter; label: string }[] = [
  { id: 'all', label: 'All Questions' },
  { id: 'blind-75', label: 'Blind 75' },
  { id: 'neetcode-150', label: 'NeetCode 150' },
  { id: 'specialist-twist', label: 'Specialist Twists' },
];

function formatTrackLabel(track: InterviewTrack): string {
  if (track === 'blind-75') return 'Blind 75';
  if (track === 'neetcode-150') return 'NeetCode 150';
  return 'Specialist Twist';
}

function difficultyTextClass(difficulty: InterviewDifficulty): string {
  if (difficulty === 'Easy') return 'text-emerald-700 dark:text-emerald-400';
  if (difficulty === 'Medium') return 'text-amber-700 dark:text-amber-400';
  return 'text-rose-700 dark:text-rose-400';
}

export function InterviewProblemCatalogPanel({
  activeTopicId,
  onSelectCurriculumTopic,
  onOpenProblemTrainer,
}: InterviewProblemCatalogPanelProps) {
  const { data: CURATED_INTERVIEW_BANK } = useAsyncCatalog('curated-interview-bank');
  const [syncWithActiveTopic, setSyncWithActiveTopic] = useState(false);
  const [manualTopicId, setManualTopicId] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState<ProblemDifficulty[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ProblemStatus[]>([]);
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>(CURATED_INTERVIEW_BANK[0]?.slug ?? '');
  const [revealedTwistIndices, setRevealedTwistIndices] = useState<number[]>([]);

  const [solvedSlugs, setSolvedSlugs] = useAccountState<string[]>(
    'curated-interview-solved',
    [],
    'patternforge_curated_solved_v1'
  );

  const { getStatus, setStatus, cycleStatus, markInProgressIfUnattempted } =
    useProblemStatusTracker({
      legacySolvedIds: solvedSlugs,
      onSyncLegacySolved: (id, isSolved) => {
        setSolvedSlugs((prev) => {
          const has = prev.includes(id);
          if (isSolved && !has) return [...prev, id];
          if (!isSolved && has) return prev.filter((s) => s !== id);
          return prev;
        });
      },
    });

  // Optional official LeetCode lookup (on-demand only, never blocks UI)
  const [reference, setReference] = useState<OfficialReference | null>(null);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [referenceError, setReferenceError] = useState('');

  const effectiveTopicId = syncWithActiveTopic && activeTopicId ? activeTopicId : manualTopicId;

  const baseScopeQuestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CURATED_INTERVIEW_BANK.filter((item) => {
      if (effectiveTopicId !== 'all' && item.topicId !== effectiveTopicId) return false;
      if (trackFilter !== 'all' && !item.tracks.includes(trackFilter)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.topicLabel.toLowerCase().includes(q) ||
        item.plainEnglishGoal.toLowerCase().includes(q) ||
        item.patternTrigger.toLowerCase().includes(q) ||
        (item.leetcodeNumber ? String(item.leetcodeNumber).includes(q) : false)
      );
    });
  }, [effectiveTopicId, trackFilter, query]);

  const filterCounts = useMemo(() => {
    const difficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const status = { solved: 0, 'in-progress': 0, unattempted: 0 };
    for (const item of baseScopeQuestions) {
      difficulty[item.difficulty] += 1;
      status[getStatus(item.slug)] += 1;
    }
    return { difficulty, status };
  }, [baseScopeQuestions, getStatus]);

  const filteredQuestions = useMemo(() => {
    return baseScopeQuestions.filter((item) => {
      if (
        selectedDifficulties.length > 0 &&
        !selectedDifficulties.includes(item.difficulty)
      ) {
        return false;
      }
      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(getStatus(item.slug))
      ) {
        return false;
      }
      return true;
    });
  }, [baseScopeQuestions, selectedDifficulties, selectedStatuses, getStatus]);

  const selected: CuratedInterviewQuestion | undefined = useMemo(() => {
    return (
      filteredQuestions.find((item) => item.slug === selectedSlug) ?? filteredQuestions[0]
    );
  }, [filteredQuestions, selectedSlug]);

  useEffect(() => {
    if (selected && selected.slug !== selectedSlug) {
      setSelectedSlug(selected.slug);
    }
  }, [selected, selectedSlug]);

  useEffect(() => {
    setRevealedTwistIndices([]);
    setReference(null);
    setReferenceError('');
  }, [selected?.slug]);

  const blind75Count = useMemo(
    () => CURATED_INTERVIEW_BANK.filter((q) => q.tracks.includes('blind-75')).length,
    []
  );
  const neetcodeCount = useMemo(
    () => CURATED_INTERVIEW_BANK.filter((q) => q.tracks.includes('neetcode-150')).length,
    []
  );
  const solvedInBank = useMemo(
    () => CURATED_INTERVIEW_BANK.filter((q) => getStatus(q.slug) === 'solved').length,
    [getStatus]
  );
  const inProgressInBank = useMemo(
    () => CURATED_INTERVIEW_BANK.filter((q) => getStatus(q.slug) === 'in-progress').length,
    [getStatus]
  );

  const loadOfficialReference = async () => {
    if (!selected) return;
    setReferenceLoading(true);
    setReferenceError('');
    const sourceSlug = selected.title
      .replace(/\(.*?\)/g, '')
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    try {
      const response = await apiFetch('/api/leetcode/problem/' + sourceSlug);
      if (!response.ok) {
        throw new Error('Official LeetCode lookup is unavailable for this problem slug.');
      }
      const payload = await response.json();
      setReference(payload.problem ?? null);
    } catch (e) {
      setReferenceError(
        e instanceof Error ? e.message : 'Unable to load the official reference.'
      );
    } finally {
      setReferenceLoading(false);
    }
  };

  const activeTopicLabel =
    CURATED_TOPIC_OPTIONS.find((t) => t.id === effectiveTopicId)?.label ?? 'All 22 Topics';

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            <Target className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>DSA Specialist Interview Master Bank</span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 dark:text-slate-100">
            Blind 75, NeetCode 150 &amp; Follow-Up Twist Trainer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-[70ch]">
            Every flagship interview question across all 22 curriculum topics—paired with plain-English goals, pattern triggers, brute-to-optimal reasoning, edge cases, and interactive follow-up twists.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {solvedInBank} solved · {inProgressInBank} in-progress · {CURATED_INTERVIEW_BANK.length} total
          </span>
          <span>
            22 topics · {blind75Count} Blind 75 · {neetcodeCount} NeetCode 150
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Track Filter */}
          <div
            role="tablist"
            aria-label="Filter by interview track"
            className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 max-w-full overflow-x-auto"
          >
            {TRACK_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={trackFilter === tab.id}
                onClick={() => setTrackFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  trackFilter === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Toggle Difficulty & Status Filter Bar */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
          <ProblemFilterBar
            selectedDifficulties={selectedDifficulties}
            onToggleDifficulty={(d) => setSelectedDifficulties((prev) => toggleFilterValue(prev, d))}
            onClearDifficulties={() => setSelectedDifficulties([])}
            selectedStatuses={selectedStatuses}
            onToggleStatus={(s) => setSelectedStatuses((prev) => toggleFilterValue(prev, s))}
            onClearStatuses={() => setSelectedStatuses([])}
            counts={filterCounts}
            totalMatching={filteredQuestions.length}
            totalCount={baseScopeQuestions.length}
          />
        </div>

        {/* Topic Selector + Sync Toggle + Search */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,0.75fr)_minmax(220px,1fr)] gap-3">
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by curriculum topic"
              value={effectiveTopicId}
              onChange={(e) => {
                setSyncWithActiveTopic(false);
                setManualTopicId(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {CURATED_TOPIC_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            {activeTopicId && (
              <button
                type="button"
                onClick={() => setSyncWithActiveTopic((v) => !v)}
                className={`shrink-0 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                  syncWithActiveTopic
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-sky-400'
                }`}
              >
                {syncWithActiveTopic ? 'Synced to Topic' : 'Sync Topic'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, LC #, pattern trigger, or topic..."
              className="w-full bg-transparent py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.6fr)] gap-4">
        {/* Question List */}
        <div className="max-h-[600px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="sticky top-0 z-10 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              {filteredQuestions.length} questions · {activeTopicLabel}
            </span>
          </div>

          {filteredQuestions.map((item) => {
            const isSelected = selected?.slug === item.slug;
            const status = getStatus(item.slug);
            return (
              <div
                key={item.slug}
                className={`w-full px-3.5 py-3 transition-colors flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-sky-50/90 dark:bg-sky-950/40'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <StatusCycleButton
                    status={status}
                    title={item.title}
                    onClick={() => cycleStatus(item.slug)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlug(item.slug);
                    markInProgressIfUnattempted(item.slug);
                  }}
                  className="min-w-0 flex-1 text-left space-y-0.5"
                >
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.leetcodeNumber ? `#${item.leetcodeNumber} ` : ''}
                    {item.title}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className={difficultyTextClass(item.difficulty)}>{item.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.topicLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.tracks.map(formatTrackLabel).join(' / ')}</span>
                  </span>
                </button>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No questions match the current filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSyncWithActiveTopic(false);
                  setManualTopicId('all');
                  setTrackFilter('all');
                  setSelectedDifficulties([]);
                  setSelectedStatuses([]);
                  setQuery('');
                }}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Detail Pane */}
        {selected ? (
          <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-5">
            {/* Title + Actions */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {selected.leetcodeNumber && <span>LC #{selected.leetcodeNumber}</span>}
                  {selected.leetcodeNumber && <span aria-hidden="true">·</span>}
                  <span className={`font-semibold ${difficultyTextClass(selected.difficulty)}`}>
                    {selected.difficulty}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selected.topicLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selected.tracks.map(formatTrackLabel).join(' · ')}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  {selected.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label="Set problem status"
                  className="inline-flex items-center gap-1 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  {(
                    [
                      { id: 'unattempted', label: 'Unattempted' },
                      { id: 'in-progress', label: 'In-Progress' },
                      { id: 'solved', label: 'Solved' },
                    ] as const
                  ).map((st) => {
                    const active = getStatus(selected.slug) === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(selected.slug, st.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? st.id === 'solved'
                              ? 'bg-emerald-600 text-white'
                              : st.id === 'in-progress'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 dark:bg-slate-700 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>

                {onSelectCurriculumTopic && (
                  <button
                    type="button"
                    onClick={() => onSelectCurriculumTopic(selected.topicId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-400 transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    Jump to Topic
                  </button>
                )}

                {selected.trainerSlug && onOpenProblemTrainer && (
                  <button
                    type="button"
                    onClick={() => onOpenProblemTrainer(selected.trainerSlug!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                  >
                    Open Trainer
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Plain-English Goal + Pattern Trigger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Plain-English Goal
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selected.plainEnglishGoal}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
                  <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Interview Recognition Trigger</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selected.patternTrigger}
                </p>
              </div>
            </div>

            {/* Brute vs Optimal + Complexity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Brute-Force Baseline
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selected.bruteApproach}
                </p>
              </div>

              <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/35 dark:bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Optimal Specialist Invariant
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    Time {selected.timeComplexity} · Space {selected.spaceComplexity}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selected.optimalApproach}
                </p>
              </div>
            </div>

            {/* Edge Cases */}
            <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/35 dark:bg-amber-950/15 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Edge Cases &amp; Interviewer Bug Traps</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {selected.edgeCases.map((edge, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {edge}
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow-Up Twists (Active Recall) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Interviewer Follow-Up Twists (Click to Reveal Invariant Shift)
                </h4>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {selected.followUpTwists.length} twist{selected.followUpTwists.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                {selected.followUpTwists.map((twist, idx) => {
                  const isOpen = revealedTwistIndices.includes(idx);
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setRevealedTwistIndices((prev) =>
                            prev.includes(idx)
                              ? prev.filter((i) => i !== idx)
                              : [...prev, idx]
                          )
                        }
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors"
                      >
                        <span className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                          <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums pt-0.5">
                            T{idx + 1}
                          </span>
                          <span>{twist.prompt}</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                            isOpen ? 'rotate-180 text-sky-500' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5 pt-1.5 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              Invariant Shift:{' '}
                            </span>
                            {twist.invariantShift}
                          </p>
                          <p className="font-mono text-sky-700 dark:text-sky-400 tabular-nums">
                            Complexity Impact: {twist.complexityImpact}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Official Source Lookup */}
            {selected.leetcodeNumber && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Need the verbatim prompt or sample testcases from LeetCode?
                  </span>
                  <button
                    type="button"
                    onClick={() => void loadOfficialReference()}
                    disabled={referenceLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-400 transition-colors disabled:opacity-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    {referenceLoading ? 'Fetching...' : 'Fetch LeetCode Reference'}
                  </button>
                </div>

                {referenceError && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">{referenceError}</p>
                )}

                {reference && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {reference.title} · #{reference.questionId} · {reference.difficulty}
                      </span>
                      <a
                        className="text-sky-700 dark:text-sky-400 hover:underline font-semibold"
                        href={`https://leetcode.com/problems/${reference.slug}/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open on LeetCode ↗
                      </a>
                    </div>
                    {reference.contentHtml && (
                      <details>
                        <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          Statement Text
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {String(reference.contentHtml)
                            .replace(/<[^>]*>/g, ' ')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&')
                            .replace(/\s+/g, ' ')
                            .trim()}
                        </pre>
                      </details>
                    )}
                    {reference.exampleTestcases && (
                      <details>
                        <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                          Sample Test Input
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-slate-600 dark:text-slate-300">
                          {reference.exampleTestcases}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Select a question from the list to inspect its specialist breakdown and follow-up twists.
          </div>
        )}
      </div>
    </section>
  );
}
