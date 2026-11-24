import { useCallback, useState } from 'react';
import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Cloud,
  Code2,
  Cpu,
  GitBranch,
  GraduationCap,
  History,
  Languages,
  Layers,
  Lock,
  PlayCircle,
  Radio,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import {
  LANGUAGE_CONCEPTS,
  LANGUAGE_MASTERY_QUIZ,
  LANGUAGE_PRACTICE_CHALLENGES,
  LANGUAGE_VISUAL_FLOWS,
  type LangTrack,
} from '../../data/languagesTutorialData';
import {
  CUSTOM_DS_BLUEPRINTS,
  OOP_CODING_MODULES,
} from '../../data/langOopCustomDsData';
import { LANG_CONCURRENCY_EXCEPTIONS_MODULES } from '../../data/langConcurrencyExceptionsData';
import { JAVA_TO_PYTHON_MODULES } from '../../data/javaToPythonThinkingData';
import { VERSION_EVOLUTION_TOPICS } from '../../data/versionEvolutionData';
import { MULTITHREADING_CONCURRENCY_SCENARIOS } from '../../data/multithreadingConcurrencyLabData';
import { useAccountState } from '../../hooks/useAccountState';
import { withStudioBoundary } from '../hoc';
import { SegmentedTabBar } from '../ui';
import { JAVA_PYTHON_MASTERY_LESSONS } from '../../data/javaPythonCodingMasteryData';
import { CLOUD_DEV_CHAPTERS } from '../../data/dockerK8sCloudDevTutorialData';
import { JavaPythonCodingMasteryTrack } from './JavaPythonCodingMasteryTrack';
import { JavaToPythonThinkingLab } from './JavaToPythonThinkingLab';
import { VersionEvolutionPlayground } from './VersionEvolutionPlayground';
import { MultithreadingTelemetryLab } from './MultithreadingTelemetryLab';
import { ConcurrentExecutionVisualizer } from './ConcurrentExecutionVisualizer';
import { ConcurrencyPlayground } from './ConcurrencyPlayground';
import { ThreadTelemetryOverlay } from './ThreadTelemetryOverlay';
import { CloudDevCompleteTutorial } from '../devops/CloudDevCompleteTutorial';
import { LanguageVisualAnimator } from './LanguageVisualAnimator';
import { OopCustomDsAcademy } from './OopCustomDsAcademy';
import { ConcurrencyExceptionsDeepDive } from './ConcurrencyExceptionsDeepDive';
import { CollectionsConcurrencyPlayground } from './CollectionsConcurrencyPlayground';
import { LanguageConceptGuide } from './LanguageConceptGuide';
import { LanguagePracticeWorkbench } from './LanguagePracticeWorkbench';
import { LanguageMasteryQuiz } from './LanguageMasteryQuiz';
import { TopicBridgeBar } from '../shared/TopicBridgeBar';

type LangStudioTab =
  | 'coding-mastery'
  | 'java-to-python'
  | 'version-evolution'
  | 'concurrent-visualizer'
  | 'concurrency-playground'
  | 'thread-telemetry'
  | 'docker-k8s-cloud'
  | 'oop-custom-ds'
  | 'concurrency-exceptions'
  | 'visual-dfd'
  | 'collections-concurrency'
  | 'concepts'
  | 'practice'
  | 'quiz';

interface LanguagesStudioProgress {
  completedCodingIds?: string[];
  completedThinkingIds?: string[];
  completedEvolutionGoalIds?: string[];
  understoodConceptIds: string[];
  completedPracticeIds: string[];
  solvedQuizIds: string[];
}

const DEFAULT_LANG_PROGRESS: LanguagesStudioProgress = {
  completedCodingIds: [],
  completedThinkingIds: [],
  completedEvolutionGoalIds: [],
  understoodConceptIds: [],
  completedPracticeIds: [],
  solvedQuizIds: [],
};

const BoundedJavaPythonCodingMasteryTrack = withStudioBoundary(
  JavaPythonCodingMasteryTrack,
  {
    studioName: 'Java (1+ to Modern LTS) & Python (0+ to Modern 3.x) Zero-to-Expert Coding Track',
  }
);
const BoundedJavaToPythonThinkingLab = withStudioBoundary(
  JavaToPythonThinkingLab,
  {
    studioName: 'How to Think in Python from Java Mindset Lab',
  }
);
const BoundedVersionEvolutionPlayground = withStudioBoundary(
  VersionEvolutionPlayground,
  {
    studioName: 'Version-Level Evolution & Micro-Goal Playground',
  }
);
const BoundedMultithreadingTelemetryLab = withStudioBoundary(
  MultithreadingTelemetryLab,
  {
    studioName: 'Multithreading & Concurrency Live Telemetry Lab',
  }
);
const BoundedConcurrentExecutionVisualizer = withStudioBoundary(
  ConcurrentExecutionVisualizer,
  {
    studioName: 'Concurrent Execution Visualizer (Thread Lifecycle & GIL Telemetry)',
  }
);
const BoundedConcurrencyPlayground = withStudioBoundary(
  ConcurrencyPlayground,
  {
    studioName: 'Drag-and-Drop Concurrency Playground (Java Lock vs Python Lock/Queue)',
  }
);
const BoundedThreadTelemetryOverlay = withStudioBoundary(
  ThreadTelemetryOverlay,
  {
    studioName: 'Thread Telemetry Overlay & Data Flow Pipelines',
  }
);
const BoundedCloudDevCompleteTutorial = withStudioBoundary(
  CloudDevCompleteTutorial,
  {
    studioName: 'Docker, Kubernetes, AWS & GCP Developer Tutorial',
  }
);
const BoundedOopCustomDsAcademy = withStudioBoundary(OopCustomDsAcademy, {
  studioName: 'Zero-to-Pro OOP Internals & Custom Data Structures Academy',
});
const BoundedConcurrencyExceptionsDeepDive = withStudioBoundary(
  ConcurrencyExceptionsDeepDive,
  {
    studioName: 'OOP Dispatch, Exceptions, Collections & CompletableFuture Mastery',
  }
);
const BoundedLanguageVisualAnimator = withStudioBoundary(LanguageVisualAnimator, {
  studioName: 'Java (1+ to 21+) & Python (0+ to 3.13+) Runtime Animations',
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
  const [activeTab, setActiveTab] = useState<LangStudioTab>('coding-mastery');
  const [languageFilter, setLanguageFilter] = useState<'all' | LangTrack>('all');
  const [selectedFlowId, setSelectedFlowId] = useState<string>(LANGUAGE_VISUAL_FLOWS[0].id);
  const [showTelemetryOverlay, setShowTelemetryOverlay] = useState<boolean>(false);

  const [progress, setProgress] = useAccountState<LanguagesStudioProgress>(
    'languages-studio-progress',
    DEFAULT_LANG_PROGRESS,
    'patternforge_languages_studio_progress_v1'
  );

  const completedCodingIds = Array.isArray(progress?.completedCodingIds)
    ? progress.completedCodingIds
    : [];
  const completedThinkingIds = Array.isArray(progress?.completedThinkingIds)
    ? progress.completedThinkingIds
    : [];
  const completedEvolutionGoalIds = Array.isArray(progress?.completedEvolutionGoalIds)
    ? progress.completedEvolutionGoalIds
    : [];
  const understoodConceptIds = Array.isArray(progress?.understoodConceptIds)
    ? progress.understoodConceptIds
    : [];
  const completedPracticeIds = Array.isArray(progress?.completedPracticeIds)
    ? progress.completedPracticeIds
    : [];
  const solvedQuizIds = Array.isArray(progress?.solvedQuizIds) ? progress.solvedQuizIds : [];

  const totalMilestones =
    JAVA_PYTHON_MASTERY_LESSONS.length +
    JAVA_TO_PYTHON_MODULES.length +
    VERSION_EVOLUTION_TOPICS.length +
    LANGUAGE_CONCEPTS.length +
    LANGUAGE_PRACTICE_CHALLENGES.length +
    LANGUAGE_MASTERY_QUIZ.length;
  const completedMilestones =
    completedCodingIds.length +
    completedThinkingIds.length +
    completedEvolutionGoalIds.length +
    understoodConceptIds.length +
    completedPracticeIds.length +
    solvedQuizIds.length;
  const masteryPct = Math.round((completedMilestones / Math.max(1, totalMilestones)) * 100);

  const patchProgress = useCallback(
    (updater: (curr: LanguagesStudioProgress) => LanguagesStudioProgress) => {
      setProgress((prev) =>
        updater({
          completedCodingIds: Array.isArray(prev?.completedCodingIds)
            ? prev.completedCodingIds
            : [],
          completedThinkingIds: Array.isArray(prev?.completedThinkingIds)
            ? prev.completedThinkingIds
            : [],
          completedEvolutionGoalIds: Array.isArray(prev?.completedEvolutionGoalIds)
            ? prev.completedEvolutionGoalIds
            : [],
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

  const handleToggleCodingComplete = useCallback(
    (id: string) => {
      patchProgress((curr) => {
        const list = curr.completedCodingIds ?? [];
        return {
          ...curr,
          completedCodingIds: list.includes(id)
            ? list.filter((c) => c !== id)
            : [...list, id],
        };
      });
    },
    [patchProgress]
  );

  const handleToggleThinkingComplete = useCallback(
    (id: string) => {
      patchProgress((curr) => {
        const list = curr.completedThinkingIds ?? [];
        return {
          ...curr,
          completedThinkingIds: list.includes(id)
            ? list.filter((c) => c !== id)
            : [...list, id],
        };
      });
    },
    [patchProgress]
  );

  const handleToggleEvolutionGoalComplete = useCallback(
    (id: string) => {
      patchProgress((curr) => {
        const list = curr.completedEvolutionGoalIds ?? [];
        return {
          ...curr,
          completedEvolutionGoalIds: list.includes(id)
            ? list.filter((c) => c !== id)
            : [...list, id],
        };
      });
    },
    [patchProgress]
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
                Zero-to-Expert Languages Visual Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>Java (1+ to Modern LTS) &amp; Python (0+ to Modern 3.x) · Core Foundations, Mindset Bridge, Version Evolution &amp; Live Thread Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              Java (1+ to Modern) &amp; Python (0+ to Modern) Mastery Studio
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              Build production confidence from version-agnostic fundamentals to modern LTS features: learn how to think in Python coming from Java, trace version-by-version syntax evolution with correlated quizzes and micro-goals, and inspect live CPU-core multithreading telemetry alongside Mermaid DFDs.
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
            wrap
            tabs={[
              {
                id: 'coding-mastery',
                label: 'Basics to Advanced Coding',
                shortLabel: 'Coding Track',
                count: JAVA_PYTHON_MASTERY_LESSONS.length,
                icon: GraduationCap,
              },
              {
                id: 'java-to-python',
                label: 'Think Python from Java',
                shortLabel: 'Java -> Python',
                count: JAVA_TO_PYTHON_MODULES.length,
                icon: ArrowLeftRight,
              },
              {
                id: 'version-evolution',
                label: 'Version Evolution & Goals',
                shortLabel: 'Version Diff',
                count: VERSION_EVOLUTION_TOPICS.length,
                icon: History,
              },
              {
                id: 'concurrent-visualizer',
                label: 'Concurrent Execution Visualizer',
                shortLabel: 'Lifecycle Viz',
                count: 5,
                icon: Workflow,
              },
              {
                id: 'concurrency-playground',
                label: 'Concurrency Playground',
                shortLabel: 'DnD Blocks',
                count: 3,
                icon: Lock,
              },
              {
                id: 'thread-telemetry',
                label: 'Live Thread Telemetry',
                shortLabel: 'Threads Live',
                count: MULTITHREADING_CONCURRENCY_SCENARIOS.length,
                icon: Activity,
              },
              {
                id: 'docker-k8s-cloud',
                label: 'Docker · K8s · AWS · GCP',
                shortLabel: 'Cloud & K8s',
                count: CLOUD_DEV_CHAPTERS.length,
                icon: Cloud,
              },
              {
                id: 'oop-custom-ds',
                label: 'Zero-to-Pro OOP & Custom DS',
                shortLabel: 'OOP & Custom DS',
                count: OOP_CODING_MODULES.length + CUSTOM_DS_BLUEPRINTS.length,
                icon: Layers,
              },
              {
                id: 'concurrency-exceptions',
                label: 'Exceptions, Futures & Concurrency',
                shortLabel: 'Futures & Sync',
                count: LANG_CONCURRENCY_EXCEPTIONS_MODULES.length,
                icon: GitBranch,
              },
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTelemetryOverlay((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                showTelemetryOverlay
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-sky-500'
              }`}
            >
              <Radio className="w-3.5 h-3.5" aria-hidden="true" />
              {showTelemetryOverlay ? 'Hide Telemetry Overlay' : 'Telemetry Overlay'}
            </button>

            <SegmentedTabBar<'all' | LangTrack>
              ariaLabel="Filter by programming language track"
              activeTab={languageFilter}
              onChange={setLanguageFilter}
              size="xs"
              tabs={[
                { id: 'all', label: 'Python + Java' },
                { id: 'python', label: 'Python (0+ to 3.13+)' },
                { id: 'java', label: 'Java (1+ to 21+ LTS)' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Toggleable Global Telemetry Overlay (Animated Data Flow Pipelines) */}
      {showTelemetryOverlay && (
        <BoundedThreadTelemetryOverlay
          mode="overlay"
          onClose={() => setShowTelemetryOverlay(false)}
        />
      )}

      {/* Active Workspace (Each Isolated by withStudioBoundary HOC) */}
      {activeTab === 'coding-mastery' && (
        <BoundedJavaPythonCodingMasteryTrack
          languageFilter={languageFilter}
          completedIds={completedCodingIds}
          onToggleComplete={handleToggleCodingComplete}
        />
      )}
      {activeTab === 'java-to-python' && (
        <BoundedJavaToPythonThinkingLab
          completedIds={completedThinkingIds}
          onToggleComplete={handleToggleThinkingComplete}
        />
      )}
      {activeTab === 'version-evolution' && (
        <BoundedVersionEvolutionPlayground
          completedGoalIds={completedEvolutionGoalIds}
          onToggleGoalComplete={handleToggleEvolutionGoalComplete}
        />
      )}
      {activeTab === 'concurrent-visualizer' && <BoundedConcurrentExecutionVisualizer />}
      {activeTab === 'concurrency-playground' && <BoundedConcurrencyPlayground />}
      {activeTab === 'thread-telemetry' && (
        <BoundedMultithreadingTelemetryLab languageFilter={languageFilter} />
      )}
      {activeTab === 'docker-k8s-cloud' && <BoundedCloudDevCompleteTutorial />}
      {activeTab === 'oop-custom-ds' && (
        <BoundedOopCustomDsAcademy languageFilter={languageFilter} />
      )}
      {activeTab === 'concurrency-exceptions' && (
        <BoundedConcurrencyExceptionsDeepDive languageFilter={languageFilter} />
      )}
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
