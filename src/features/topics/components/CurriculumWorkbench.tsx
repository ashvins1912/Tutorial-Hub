import { useEffect, useState } from 'react';
import {
  BookOpen,
  Code2,
  Compass,
  Layers,
  Menu,
  PanelLeftOpen,
  PlayCircle,
  Puzzle,
} from 'lucide-react';
import { CURRICULUM_TOPICS, getTopicById } from '../data/curriculumIndex';
import { TopicSidebar } from './TopicSidebar';
import { TheoryMentalModelPane } from './TheoryMentalModelPane';
import { AlgorithmVisualizer } from '../../visualizer/components/AlgorithmVisualizer';
import { DragDropLogicBuilder } from '../../logic-builder/components/DragDropLogicBuilder';
import { BruteToOptimalCodeViewer } from '../../code-progression/components/BruteToOptimalCodeViewer';
import { AlgorithmMatcherPanel } from '../../matcher/components/AlgorithmMatcherPanel';
import { RecursionBacktrackingLab } from '../../recursion-lab/components/RecursionBacktrackingLab';
import { usePatternForgeStore } from '../../../store/usePatternForgeStore';
import { useSprintStore } from '../../../store/useSprintStore';

type PlaygroundTab = 'visualizer' | 'recursion-lab' | 'logic-builder' | 'code' | 'matcher';
type MobilePane = 'theory' | 'playground';

const STORAGE_KEY = 'patternforge_curriculum_mastered_v1';

interface CurriculumWorkbenchProps {
  externalTopicId?: string | null;
  onConsumeExternalTopic?: () => void;
  onOpenAlgorithmMatcher: () => void;
  onOpenClassicLab: () => void;
}

export function CurriculumWorkbench({
  externalTopicId,
  onConsumeExternalTopic,
  onOpenAlgorithmMatcher,
  onOpenClassicLab,
}: CurriculumWorkbenchProps) {
  const [activeTopicId, setActiveTopicId] = useState<string>(CURRICULUM_TOPICS[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [playgroundTab, setPlaygroundTab] = useState<PlaygroundTab>('visualizer');
  const [mobilePane, setMobilePane] = useState<MobilePane>('theory');
  const [codeDefaultTier, setCodeDefaultTier] = useState<'brute' | 'better' | 'optimal'>('optimal');

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const openNGramAlgorithm = usePatternForgeStore((s) => s.openNGramAlgorithm);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const openTrainerForProblem = useSprintStore((s) => s.openTrainerForProblem);

  useEffect(() => {
    if (externalTopicId) {
      setActiveTopicId(externalTopicId);
      onConsumeExternalTopic?.();
    }
  }, [externalTopicId, onConsumeExternalTopic]);

  const isRecursionOrBacktracking =
    activeTopicId === 'recursion-divide-conquer' || activeTopicId === 'backtracking';

  useEffect(() => {
    if (isRecursionOrBacktracking) {
      setPlaygroundTab('recursion-lab');
    } else if (playgroundTab === 'recursion-lab') {
      setPlaygroundTab('visualizer');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopicId]);

  const persistMastered = (next: string[]) => {
    setMasteredIds(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const toggleMastered = (id: string) => {
    const next = masteredIds.includes(id)
      ? masteredIds.filter((x) => x !== id)
      : [...masteredIds, id];
    persistMastered(next);
  };

  const markMastered = (id: string) => {
    if (!masteredIds.includes(id)) {
      persistMastered([...masteredIds, id]);
    }
  };

  const topic = getTopicById(activeTopicId);
  const isMastered = masteredIds.includes(topic.id);

  const handleOpenDeepLink = () => {
    if (!topic.deepLink) return;
    if (topic.deepLink.kind === 'algorithm') {
      openAlgorithm(topic.deepLink.targetId, 'mental');
    } else if (topic.deepLink.kind === 'pruning-sim') {
      openNGramAlgorithm('length-filtering', 'pruning-sim');
    } else if (topic.deepLink.kind === 'fuzzy-curriculum') {
      openNGramAlgorithm('padded-ngrams', 'curriculum');
    } else {
      openNGramAlgorithm(topic.deepLink.targetId, 'taxonomy');
    }
  };

  const handleOpenProblemTrainer = (slug: string) => {
    openTrainerForProblem(slug);
    setActiveView('roadmap');
  };

  const handleUnlockOptimal = () => {
    markMastered(topic.id);
    setCodeDefaultTier('optimal');
    setPlaygroundTab('code');
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Collapsible Left Sidebar */}
      {!sidebarCollapsed && (
        <TopicSidebar
          activeTopicId={topic.id}
          masteredTopicIds={masteredIds}
          onSelectTopic={(id) => {
            setActiveTopicId(id);
            setMobilePane('theory');
          }}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onCollapseDesktop={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Mobile Drawer when Desktop Sidebar is Collapsed */}
      {sidebarCollapsed && mobileSidebarOpen && (
        <TopicSidebar
          activeTopicId={topic.id}
          masteredTopicIds={masteredIds}
          onSelectTopic={(id) => {
            setActiveTopicId(id);
            setMobilePane('theory');
          }}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onCollapseDesktop={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Responsive Split Workspace */}
      <div className="flex-1 min-w-0 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Compact Workspace Utility Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
              Topics ({masteredIds.length}/{CURRICULUM_TOPICS.length})
            </button>

            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-500 transition-colors whitespace-nowrap"
              >
                <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
                Show Topic Tree
              </button>
            )}

            {/* Mobile/Tablet Stacked Pane Switcher */}
            <div className="xl:hidden flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMobilePane('theory')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  mobilePane === 'theory'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Theory & Ladder
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('playground')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  mobilePane === 'playground'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Playground
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenAlgorithmMatcher}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 transition-colors whitespace-nowrap"
            >
              Algorithm Matcher
            </button>
            <button
              type="button"
              onClick={onOpenClassicLab}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 transition-colors whitespace-nowrap"
            >
              5-Stage Problem Lab
            </button>
          </div>
        </div>

        {/* Two-Pane Split on XL Desktop; Tabbed on Mobile/Tablet */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] gap-6 items-start">
          {/* Pane A: Theory, Mental Model, Complexity Table & 5-Problem Ladder */}
          <div className={mobilePane === 'theory' ? 'block' : 'hidden xl:block'}>
            <TheoryMentalModelPane
              topic={topic}
              isMastered={isMastered}
              onToggleMastered={() => toggleMastered(topic.id)}
              onOpenDeepLink={handleOpenDeepLink}
              onOpenProblemTrainer={handleOpenProblemTrainer}
            />
          </div>

          {/* Pane B: Sticky Interactive Playground (Visualizer + Logic Builder + 3-Tier Code) */}
          <div
            className={`${
              mobilePane === 'playground' ? 'block' : 'hidden xl:block'
            } xl:sticky xl:top-20`}
          >
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
              {/* Playground Segmented Control */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-full sm:w-fit">
                  {[
                    ...(isRecursionOrBacktracking
                      ? [
                          {
                            id: 'recursion-lab' as const,
                            label: 'Call Stack & Blocks',
                            icon: Layers,
                          },
                        ]
                      : []),
                    { id: 'visualizer' as const, label: 'Step Visualizer', icon: PlayCircle },
                    { id: 'logic-builder' as const, label: 'Logic Builder', icon: Puzzle },
                    { id: 'code' as const, label: 'Brute → Optimal Code', icon: Code2 },
                    { id: 'matcher' as const, label: 'Algorithm Matcher', icon: Compass },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = playgroundTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPlaygroundTab(tab.id)}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {playgroundTab === 'recursion-lab' && (
                <RecursionBacktrackingLab
                  activeCurriculumTopicId={topic.id}
                  onOpenCurriculumModule={(topicId) => {
                    setActiveTopicId(topicId);
                    setMobilePane('theory');
                  }}
                />
              )}

              {playgroundTab === 'visualizer' && <AlgorithmVisualizer topic={topic} />}

              {playgroundTab === 'logic-builder' && (
                <DragDropLogicBuilder
                  topic={topic}
                  onUnlockOptimal={handleUnlockOptimal}
                />
              )}

              {playgroundTab === 'code' && (
                <BruteToOptimalCodeViewer
                  topic={topic}
                  initialTier={codeDefaultTier}
                />
              )}

              {playgroundTab === 'matcher' && (
                <AlgorithmMatcherPanel
                  mode="embedded"
                  activeTopic={topic}
                  onSelectTopic={(topicId) => {
                    setActiveTopicId(topicId);
                    setMobilePane('theory');
                  }}
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
