import { useCallback, useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Languages,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  LANGUAGE_CONCEPTS,
  LANGUAGE_MASTERY_QUIZ,
  LANGUAGE_PRACTICE_CHALLENGES,
  LANGUAGE_VISUAL_FLOWS,
  type LangTrack,
} from '../../data/languagesTutorialData';
import { useAccountState } from '../../hooks/useAccountState';
import { withStudioBoundary } from '../hoc';
import { SegmentedTabBar } from '../ui';
import { LanguageVisualAnimator } from './LanguageVisualAnimator';
import { CollectionsConcurrencyPlayground } from './CollectionsConcurrencyPlayground';
import { LanguageConceptGuide } from './LanguageConceptGuide';
import { LanguagePracticeWorkbench } from './LanguagePracticeWorkbench';
import { LanguageMasteryQuiz } from './LanguageMasteryQuiz';
import { TopicBridgeBar } from '../shared/TopicBridgeBar';

type LangStudioTab = 'visual-dfd' | 'collections-concurrency' | 'concepts' | 'practice' | 'quiz';

interface LanguagesStudioProgress {
  understoodConceptIds: string[];
  completedPracticeIds: string[];
  solvedQuizIds: string[];
}

const DEFAULT_LANG_PROGRESS: LanguagesStudioProgress = {
  understoodConceptIds: [],
  completedPracticeIds: [],
  solvedQuizIds: [],
};

const BoundedLanguageVisualAnimator = withStudioBoundary(LanguageVisualAnimator, {
  studioName: 'Python 3.13+ & Java 21+ Runtime Animations',
});
const BoundedCollectionsConcurrencyPlayground = withStudioBoundary(
  CollectionsConcurrencyPlayground,
  {
    studioName: 'Collections Internals & Multithreading Lifecycle Playground',
  }
);
const BoundedLanguageConceptGuide = withStudioBoundary(LanguageConceptGuide, {
  studioName: 'Python & Java Simple English Concept Guide',
});
const BoundedLanguagePracticeWorkbench = withStudioBoundary(LanguagePracticeWorkbench, {
  studioName: 'Side-by-Side Translator & Practice Lab',
});
const BoundedLanguageMasteryQuiz = withStudioBoundary(LanguageMasteryQuiz, {
  studioName: 'Python & Java Mastery Quiz',
});

export function LanguagesTutorialStudio() {
  const [activeTab, setActiveTab] = useState<LangStudioTab>('visual-dfd');
  const [languageFilter, setLanguageFilter] = useState<'all' | LangTrack>('all');
  const [selectedFlowId, setSelectedFlowId] = useState<string>(LANGUAGE_VISUAL_FLOWS[0].id);

  const [progress, setProgress] = useAccountState<LanguagesStudioProgress>(
    'languages-studio-progress',
    DEFAULT_LANG_PROGRESS,
    'patternforge_languages_studio_progress_v1'
  );

  const understoodConceptIds = Array.isArray(progress?.understoodConceptIds)
    ? progress.understoodConceptIds
    : [];
  const completedPracticeIds = Array.isArray(progress?.completedPracticeIds)
    ? progress.completedPracticeIds
    : [];
  const solvedQuizIds = Array.isArray(progress?.solvedQuizIds) ? progress.solvedQuizIds : [];

  const totalMilestones =
    LANGUAGE_CONCEPTS.length +
    LANGUAGE_PRACTICE_CHALLENGES.length +
    LANGUAGE_MASTERY_QUIZ.length;
  const completedMilestones =
    understoodConceptIds.length + completedPracticeIds.length + solvedQuizIds.length;
  const masteryPct = Math.round((completedMilestones / Math.max(1, totalMilestones)) * 100);

  const patchProgress = useCallback(
    (updater: (curr: LanguagesStudioProgress) => LanguagesStudioProgress) => {
      setProgress((prev) =>
        updater({
          understoodConceptIds: Array.isArray(prev?.understoodConceptIds)
            ? prev.understoodConceptIds
            : [],
          completedPracticeIds: Array.isArray(prev?.completedPracticeIds)
            ? prev.completedPracticeIds
            : [],
          solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
        })
      );
    },
    [setProgress]
  );

  const handleToggleConceptUnderstood = useCallback(
    (id: string) => {
      patchProgress((curr) => ({
        ...curr,
        understoodConceptIds: curr.understoodConceptIds.includes(id)
          ? curr.understoodConceptIds.filter((c) => c !== id)
          : [...curr.understoodConceptIds, id],
      }));
    },
    [patchProgress]
  );

  const handleMarkPracticeSolved = useCallback(
    (id: string) => {
      patchProgress((curr) =>
        curr.completedPracticeIds.includes(id)
          ? curr
          : { ...curr, completedPracticeIds: [...curr.completedPracticeIds, id] }
      );
    },
    [patchProgress]
  );

  const handleMarkQuizSolved = useCallback(
    (id: string) => {
      patchProgress((curr) =>
        curr.solvedQuizIds.includes(id)
          ? curr
          : { ...curr, solvedQuizIds: [...curr.solvedQuizIds, id] }
      );
    },
    [patchProgress]
  );

  const handleResetQuizProgress = useCallback(() => {
    patchProgress((curr) => ({ ...curr, solvedQuizIds: [] }));
  }, [patchProgress]);

  const handleOpenVisualFlow = useCallback((flowId: string) => {
    const flow = LANGUAGE_VISUAL_FLOWS.find((f) => f.id === flowId);
    if (flow && languageFilter !== 'all' && languageFilter !== flow.language) {
      setLanguageFilter(flow.language);
    }
    setSelectedFlowId(flowId);
    setActiveTab('visual-dfd');
  }, [languageFilter]);

  return (
    <div className="space-y-6">
      {/* Studio Editorial Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Languages className="w-3.5 h-3.5" aria-hidden="true" />
                Modern Languages Visual Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>Python 3.13+ (Latest) &amp; Java 21+ (LTS) · Basics, OOP, Collections, Multithreading &amp; Concurrency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              Python 3.13+ &amp; Java 21+ Visual Learning Studio
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              Master modern Python and Java end-to-end—from core syntax, OOP, and Collections internals to Multithreading lifecycles, GIL/No-GIL, and Virtual Threads—through animated DFD diagrams, live interactive playgrounds, plain-English guides, and syntax-checked labs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 min-w-[260px]">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Confidence Score</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {masteryPct}%
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Concepts Clear</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {understoodConceptIds.length}/{LANGUAGE_CONCEPTS.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Practice Labs</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {completedPracticeIds.length}/{LANGUAGE_PRACTICE_CHALLENGES.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Mastery Quiz</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {solvedQuizIds.length}/{LANGUAGE_MASTERY_QUIZ.length}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Navigation + Global Language Track Filter */}
        <div className="pt-1 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <SegmentedTabBar<LangStudioTab>
            ariaLabel="Languages Studio workspaces"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: 'visual-dfd',
                label: 'Visual DFD & Lifecycles',
                shortLabel: 'Animations',
                count: LANGUAGE_VISUAL_FLOWS.length,
                icon: PlayCircle,
              },
              {
                id: 'collections-concurrency',
                label: 'Collections & Threads Lab',
                shortLabel: 'Playground',
                icon: Cpu,
              },
              {
                id: 'concepts',
                label: 'Simple English Concepts',
                shortLabel: 'Concepts',
                count: LANGUAGE_CONCEPTS.length,
                icon: BookOpen,
              },
              {
                id: 'practice',
                label: 'Translator & Practice Lab',
                shortLabel: 'Practice',
                count: completedPracticeIds.length,
                icon: Code2,
              },
              {
                id: 'quiz',
                label: 'Mastery Quiz',
                shortLabel: 'Quiz',
                count: solvedQuizIds.length,
                icon: ShieldCheck,
              },
            ]}
          />

          <SegmentedTabBar<'all' | LangTrack>
            ariaLabel="Filter by programming language track"
            activeTab={languageFilter}
            onChange={setLanguageFilter}
            size="xs"
            tabs={[
              { id: 'all', label: 'Python + Java' },
              { id: 'python', label: 'Python 3.13+' },
              { id: 'java', label: 'Java 21+ LTS' },
            ]}
          />
        </div>
      </section>

      {/* Active Workspace (Each Isolated by withStudioBoundary HOC) */}
      {activeTab === 'visual-dfd' && (
        <BoundedLanguageVisualAnimator
          selectedFlowId={selectedFlowId}
          onSelectFlowId={setSelectedFlowId}
          languageFilter={languageFilter}
        />
      )}
      {activeTab === 'collections-concurrency' && (
        <BoundedCollectionsConcurrencyPlayground languageFilter={languageFilter} />
      )}
      {activeTab === 'concepts' && (
        <BoundedLanguageConceptGuide
          languageFilter={languageFilter}
          understoodConceptIds={understoodConceptIds}
          onToggleUnderstood={handleToggleConceptUnderstood}
          onOpenVisualFlow={handleOpenVisualFlow}
        />
      )}
      {activeTab === 'practice' && (
        <BoundedLanguagePracticeWorkbench
          languageFilter={languageFilter}
          completedPracticeIds={completedPracticeIds}
          onMarkPracticeSolved={handleMarkPracticeSolved}
        />
      )}
      {activeTab === 'quiz' && (
        <BoundedLanguageMasteryQuiz
          languageFilter={languageFilter}
          solvedQuizIds={solvedQuizIds}
          onMarkQuizSolved={handleMarkQuizSolved}
          onResetQuizProgress={handleResetQuizProgress}
        />
      )}

      <TopicBridgeBar studioId="languages" />
    </div>
  );
}
