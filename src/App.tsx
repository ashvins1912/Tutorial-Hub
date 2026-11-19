import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Compass,
  FileCode2,
  Moon,
  NotebookPen,
  Sun,
  User,
  X,
} from 'lucide-react';
import { usePatternForgeStore, TopView } from './store/usePatternForgeStore';
import { useSprintStore } from './store/useSprintStore';
import { useAuth } from './auth/AuthContext';
import { apiFetch } from './lib/apiFetch';
import { PROBLEMS } from './data/problems';
import { BIG_TECH_36_PROBLEMS } from '../server/seed/bigTechTopicSeed';
import { MasteryStepper } from './components/MasteryStepper';
import { PolyaWorkflowBar } from './components/cognitive/PolyaWorkflowBar';
import { ProblemXRayReader } from './components/ProblemXRayReader';
import { VisualSandbox } from './components/VisualSandbox';
import { LogicBlockBuilder } from './components/LogicBlockBuilder';
import { RaceModeVisualizer } from './components/RaceModeVisualizer';
import { DPLadderVisualizer } from './components/cognitive/DPLadderVisualizer';
import { DpLearningLab } from './components/DpLearningLab';
import { AlgorithmsStudio } from './components/algorithms/AlgorithmsStudio';
import { NGramFuzzyStudio } from './components/fuzzy/NGramFuzzyStudio';
import { NoobToProSkillTree } from './components/cognitive/NoobToProSkillTree';
import { ProblemBank45View } from './components/ProblemBank45View';
import { SchemasReferenceView } from './components/SchemasReferenceView';
import { SystemDesignStudio } from './components/SystemDesignStudio';
import { QuickRevisionHub } from './components/QuickRevisionHub';
import { InterviewContextDrawer } from './components/InterviewContextDrawer';
import { ConceptAcademyDrawer } from './components/cognitive/ConceptAcademyDrawer';
import { PatternTemplateModal } from './components/cognitive/PatternTemplateModal';
import { ScratchpadDrawer } from './components/cognitive/ScratchpadDrawer';
import { SrtbotWorksheetModal } from './components/cognitive/SrtbotWorksheetModal';
import { TopicPatternQuizModal } from './components/cognitive/TopicPatternQuizModal';
import { TopicPatternExplorer } from './components/interview/TopicPatternExplorer';
import { HowToIdentifyTrainer } from './components/interview/HowToIdentifyTrainer';
import { BigTechRubricScorecard } from './components/interview/BigTechRubricScorecard';
import { SprintWarRoomDashboard } from './components/sprint/SprintWarRoomDashboard';
import { SprintConfiguratorModal } from './components/sprint/SprintConfiguratorModal';
import { Mock45SimulatorModal } from './components/sprint/Mock45SimulatorModal';
import { AlgorithmMatcherModal } from './components/AlgorithmMatcherModal';
import { CurriculumWorkbench } from './features/topics/components/CurriculumWorkbench';
import { PatternRecognitionQuizModal } from './features/quiz/components/PatternRecognitionQuizModal';
import { UniversalSolverStudio } from './features/solver-studio/UniversalSolverStudio';
import { ProductCompanyMasterBankView } from './components/interview/ProductCompanyMasterBankView';
import { IntelligentEngineStudio } from './features/intelligent-engine/components/IntelligentEngineStudio';
import { ProfileStatsView } from './components/ProfileStatsView';
import { CommunityHubView } from './components/CommunityHubView';
import { OodPrinciplesStudio } from './components/OodPrinciplesStudio';
import { AIEngineeringAcademy } from './features/ai-academy/components/AIEngineeringAcademy';
import { PublishedLessonView } from './features/intelligent-engine/components/PublishedLessonView';

type HubSubTab = 'notes' | 'system-design' | 'skill-tree' | 'schemas';

export default function App() {
  const { user, signOut } = useAuth();
  const activeView = usePatternForgeStore((s) => s.activeView);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const theme = usePatternForgeStore((s) => s.theme);
  const toggleTheme = usePatternForgeStore((s) => s.toggleTheme);
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const currentStage = usePatternForgeStore((s) => s.currentStage);
  const brainProfile = usePatternForgeStore((s) => s.brainProfile);
  const fetchBrainProfile = usePatternForgeStore((s) => s.fetchBrainProfile);
  const setInterviewDrawerOpen = usePatternForgeStore((s) => s.setInterviewDrawerOpen);
  const promotionToast = usePatternForgeStore((s) => s.promotionToast);
  const clearPromotionToast = usePatternForgeStore((s) => s.clearPromotionToast);

  const fetchActiveSprint = useSprintStore((s) => s.fetchActiveSprint);
  const fetchMasteredSlugs = useSprintStore((s) => s.fetchMasteredSlugs);
  const activeTrainerSlug = useSprintStore((s) => s.activeTrainerSlug);
  const closeTrainer = useSprintStore((s) => s.closeTrainer);
  const activeRubricResult = useSprintStore((s) => s.activeRubricResult);
  const clearRubricResult = useSprintStore((s) => s.clearRubricResult);
  const activeSprintTaskContext = useSprintStore((s) => s.activeSprintTaskContext);

  const [workspaceMode, setWorkspaceMode] = useState<'curriculum' | 'classic-lab'>('curriculum');
  const [jumpTopicId, setJumpTopicId] = useState<string | null>(null);
  const [drillModalOpen, setDrillModalOpen] = useState(false);

  const [academyOpen, setAcademyOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [srtbotOpen, setSrtbotOpen] = useState(false);
  const [matcherOpen, setMatcherOpen] = useState(false);
  const [solverExternalProblem, setSolverExternalProblem] = useState<{
    id: string;
    title: string;
    statement: string;
  } | null>(null);
  const [bankSubTab, setBankSubTab] = useState<
    'product-master' | 'bigtech48' | 'highroi45' | 'skilltree'
  >('product-master');
  const [hubSubTab, setHubSubTab] = useState<HubSubTab>('notes');

  const activeProblem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const trainerProblem = activeTrainerSlug
    ? BIG_TECH_36_PROBLEMS.find((p) => p.slug === activeTrainerSlug) ?? null
    : null;

  useEffect(() => {
    fetchBrainProfile();
    fetchActiveSprint();
    fetchMasteredSlugs();
  }, [fetchBrainProfile, fetchActiveSprint, fetchMasteredSlugs]);

  useEffect(() => {
    let hydrated = false;
    let saveTimer: number | undefined;
    const unsubscribe = usePatternForgeStore.subscribe((state, previous) => {
      if (!hydrated || state.problemProgress === previous.problemProgress) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        void apiFetch('/api/user-state/problem-progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: state.problemProgress }),
        })
          .then((res) => {
            if (res.ok && typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('patternforge:db-sync', {
                  detail: { stateKey: 'problem-progress' },
                }),
              );
            }
          })
          .catch(() => {});
      }, 500);
    });

    apiFetch('/api/user-state/problem-progress')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load saved problem progress.');
        const payload = await response.json();
        if (payload.value && typeof payload.value === 'object') {
          usePatternForgeStore.setState({ problemProgress: payload.value });
        }
        hydrated = true;
      })
      .catch(() => {
        // Do not overwrite server state when it could not be loaded.
      });

    return () => {
      unsubscribe();
      window.clearTimeout(saveTimer);
    };
  }, []);

  // Persist workspace UI preferences (theme, activeLanguage, compareAllLanguages) in DB
  useEffect(() => {
    let hydrated = false;
    let saveTimer: number | undefined;
    const unsubscribe = usePatternForgeStore.subscribe((state, previous) => {
      if (
        !hydrated ||
        (state.theme === previous.theme &&
          state.activeLanguage === previous.activeLanguage &&
          state.compareAllLanguages === previous.compareAllLanguages)
      ) {
        return;
      }
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        void apiFetch('/api/user-state/ui-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            value: {
              theme: state.theme,
              activeLanguage: state.activeLanguage,
              compareAllLanguages: state.compareAllLanguages,
            },
          }),
        })
          .then((res) => {
            if (res.ok && typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('patternforge:db-sync', {
                  detail: { stateKey: 'ui-preferences' },
                }),
              );
            }
          })
          .catch(() => {});
      }, 300);
    });

    apiFetch('/api/user-state/ui-preferences')
      .then(async (response) => {
        if (!response.ok) return;
        const payload = await response.json();
        if (payload.value && typeof payload.value === 'object') {
          const prefs = payload.value as {
            theme?: 'light' | 'dark';
            activeLanguage?: 'python' | 'js' | 'java';
            compareAllLanguages?: boolean;
          };
          const patch: Partial<{
            theme: 'light' | 'dark';
            activeLanguage: 'python' | 'js' | 'java';
            compareAllLanguages: boolean;
          }> = {};
          if (prefs.theme === 'light' || prefs.theme === 'dark') {
            patch.theme = prefs.theme;
            if (typeof document !== 'undefined') {
              document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
            }
          }
          if (
            prefs.activeLanguage === 'python' ||
            prefs.activeLanguage === 'js' ||
            prefs.activeLanguage === 'java'
          ) {
            patch.activeLanguage = prefs.activeLanguage;
          }
          if (typeof prefs.compareAllLanguages === 'boolean') {
            patch.compareAllLanguages = prefs.compareAllLanguages;
          }
          if (Object.keys(patch).length > 0) {
            usePatternForgeStore.setState(patch);
          }
        }
        hydrated = true;
      })
      .catch(() => {
        hydrated = true;
      });

    return () => {
      unsubscribe();
      window.clearTimeout(saveTimer);
    };
  }, []);

  const isHubView =
    activeView === 'revision' ||
    activeView === 'system-design' ||
    activeView === 'skill-tree' ||
    activeView === 'schemas';

  const currentHubTab: HubSubTab =
    activeView === 'system-design'
      ? 'system-design'
      : activeView === 'skill-tree'
        ? 'skill-tree'
        : activeView === 'schemas'
          ? 'schemas'
          : hubSubTab;

  const navItems: { id: TopView; label: string; isActive: boolean }[] = [
    { id: 'solver', label: 'Logic Solver', isActive: activeView === 'solver' },
    { id: 'knowledge-engine', label: 'Concept Engine', isActive: activeView === 'knowledge-engine' },
    { id: 'ai-academy', label: 'AI Academy', isActive: activeView === 'ai-academy' },
    { id: 'workspace', label: 'Curriculum', isActive: activeView === 'workspace' },
    { id: 'algorithms', label: 'Algorithms', isActive: activeView === 'algorithms' },
    { id: 'fuzzy-search', label: 'N-Gram Lab', isActive: activeView === 'fuzzy-search' },
    { id: 'ood', label: 'OOPs & OOD', isActive: activeView === 'ood' },
    { id: 'system-design', label: 'System Design', isActive: isHubView },
    { id: 'roadmap', label: 'Topic Bank', isActive: activeView === 'roadmap' },
    { id: 'sprint', label: 'Sprint', isActive: activeView === 'sprint' },
    { id: 'community', label: 'Community', isActive: activeView === 'community' },
  ];

  const handleSelectNav = (id: TopView) => {
    if (id === 'workspace') {
      setWorkspaceMode('curriculum');
    } else if (id === 'system-design') {
      setHubSubTab('system-design');
    }
    setActiveView(id);
  };

  const isCurriculumFullBleed = activeView === 'workspace' && workspaceMode === 'curriculum';
  const publishedLessonId = new URLSearchParams(window.location.search).get('lesson');

  if (publishedLessonId) return <PublishedLessonView lessonId={publishedLessonId} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      {/* Clean 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => handleSelectNav('workspace')}
            className="text-lg font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 text-left"
          >
            PatternForge DSA
          </button>

          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-5 lg:gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1.5 border-b-2 ${
                  item.isActive
                    ? 'text-slate-900 dark:text-slate-100 border-sky-600 dark:border-sky-400'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('profile')}
              aria-label="Open profile and statistics"
              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'profile'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden xl:inline max-w-32 truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profile'}
              </span>
              <span className="hidden 2xl:inline text-slate-400" aria-hidden="true">
                ·
              </span>
              <span className="hidden 2xl:inline font-mono tabular-nums text-sky-700 dark:text-sky-400">
                {brainProfile.currentTier}
              </span>
            </button>
            <button type="button" onClick={() => void signOut()} className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-rose-400 whitespace-nowrap shrink-0">Sign out</button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setDrillModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              60s Pattern Drill
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Primary Nav Strip */}
      <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectNav(item.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
              item.isActive
                ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveView('profile')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
            activeView === 'profile'
              ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Profile & Stats
        </button>
      </div>

      {/* Feedback Banner */}
      {promotionToast && (
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-3">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-medium text-emerald-800 dark:text-emerald-200">
            <span>{promotionToast}</span>
            <button
              type="button"
              onClick={clearPromotionToast}
              aria-label="Dismiss notification"
              className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      {activeView === 'solver' ? (
        <main className="flex-1 w-full">
          <UniversalSolverStudio
            externalProblem={solverExternalProblem}
            onConsumeExternalProblem={() => setSolverExternalProblem(null)}
            onOpenCurriculumTopic={(topicId) => {
              setJumpTopicId(topicId);
              setWorkspaceMode('curriculum');
              setActiveView('workspace');
            }}
            onOpenLabProblem={(problemId) => {
              selectProblem(problemId);
              setWorkspaceMode('classic-lab');
            }}
          />
        </main>
      ) : isCurriculumFullBleed ? (
        <main className="flex-1 w-full">
          <CurriculumWorkbench
            externalTopicId={jumpTopicId}
            onConsumeExternalTopic={() => setJumpTopicId(null)}
            onOpenAlgorithmMatcher={() => setMatcherOpen(true)}
            onOpenClassicLab={() => setWorkspaceMode('classic-lab')}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
          {activeView === 'workspace' && workspaceMode === 'classic-lab' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWorkspaceMode('curriculum')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    Curriculum
                  </button>
                  <label htmlFor="problem-select" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Active Lab ({PROBLEMS.length}):
                  </label>
                  <select
                    id="problem-select"
                    value={activeProblem.id}
                    onChange={(e) => selectProblem(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[240px] sm:max-w-none truncate"
                  >
                    {PROBLEMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.title} ({p.difficulty} · {p.patternName})
                      </option>
                    ))}
                  </select>
                  <span className="hidden sm:inline text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    · Rank: <strong className="text-slate-900 dark:text-slate-100">{brainProfile.currentTier}</strong> · Accuracy{' '}
                    {brainProfile.cognitiveMetrics.logicAssemblyAccuracy}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMatcherOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 whitespace-nowrap"
                  >
                    <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                    Matcher
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcademyOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Academy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplatesOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setScratchpadOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <NotebookPen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Scratchpad
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewDrawerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Twists
                  </button>
                  {activeProblem.hasDpLadder && (
                    <button
                      type="button"
                      onClick={() => setSrtbotOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs font-semibold text-amber-800 dark:text-amber-300 whitespace-nowrap"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      SRTBOT
                    </button>
                  )}
                </div>
              </div>

              <PolyaWorkflowBar />
              <MasteryStepper />

              {currentStage === 1 && <ProblemXRayReader />}
              {currentStage === 2 && <VisualSandbox />}
              {currentStage === 3 && <LogicBlockBuilder />}
              {currentStage === 4 && (
                <div className="space-y-6">
                  <RaceModeVisualizer />
                  {activeProblem.hasDpLadder && <DPLadderVisualizer />}
                </div>
              )}
              {currentStage === 5 && <DpLearningLab />}
            </>
          )}

          {activeView === 'algorithms' && (
            <AlgorithmsStudio
              onOpenCurriculumTopic={(topicId) => {
                setJumpTopicId(topicId);
                setWorkspaceMode('curriculum');
                setActiveView('workspace');
              }}
            />
          )}

          {activeView === 'knowledge-engine' && <IntelligentEngineStudio />}
          {activeView === 'ai-academy' && <AIEngineeringAcademy />}

          {activeView === 'fuzzy-search' && <NGramFuzzyStudio />}

          {activeView === 'ood' && <OodPrinciplesStudio />}

          {activeView === 'profile' && <ProfileStatsView />}

          {activeView === 'community' && (
            <CommunityHubView
              onOpenProblem={(problemId) => {
                selectProblem(problemId);
                setWorkspaceMode('classic-lab');
              }}
            />
          )}

          {activeView === 'sprint' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit">
                <button
                  type="button"
                  onClick={() => setActiveView('sprint')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 whitespace-nowrap"
                >
                  14-Day War Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHubSubTab('notes');
                    setActiveView('revision');
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                >
                  System Design & Notes
                </button>
              </div>
              <SprintWarRoomDashboard />
            </div>
          )}

          {activeView === 'roadmap' && (
            <div className="space-y-5">
              {trainerProblem ? (
                activeRubricResult && activeRubricResult.problemSlug === trainerProblem.slug ? (
                  <BigTechRubricScorecard
                    problem={trainerProblem}
                    result={activeRubricResult}
                    onContinue={() => {
                      const fromSprint = Boolean(activeSprintTaskContext);
                      clearRubricResult();
                      closeTrainer();
                      if (fromSprint) setActiveView('sprint');
                    }}
                  />
                ) : (
                  <HowToIdentifyTrainer
                    problem={trainerProblem}
                    onBack={() => {
                      const fromSprint = Boolean(activeSprintTaskContext);
                      closeTrainer();
                      if (fromSprint) setActiveView('sprint');
                    }}
                  />
                )
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit">
                    {[
                      { id: 'product-master' as const, label: 'Product Co. 75 & Master 95' },
                      { id: 'bigtech48' as const, label: 'Topic & Company Bank (48)' },
                      { id: 'highroi45' as const, label: '45 High-ROI Sheet' },
                      { id: 'skilltree' as const, label: 'Noob-to-Pro Skill Tree' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setBankSubTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                          bankSubTab === tab.id
                            ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {bankSubTab === 'product-master' && (
                    <ProductCompanyMasterBankView
                      onAnalyzeInSolver={(prob) => {
                        setSolverExternalProblem(prob);
                        setActiveView('solver');
                      }}
                      onOpenCurriculumTopic={(topicId) => {
                        setJumpTopicId(topicId);
                        setWorkspaceMode('curriculum');
                        setActiveView('workspace');
                      }}
                    />
                  )}
                  {bankSubTab === 'bigtech48' && <TopicPatternExplorer />}
                  {bankSubTab === 'highroi45' && <ProblemBank45View />}
                  {bankSubTab === 'skilltree' && <NoobToProSkillTree />}
                </>
              )}
            </div>
          )}

          {isHubView && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit">
                {(
                  [
                    { id: 'system-design', label: 'System Design Studio', view: 'system-design' },
                    { id: 'notes', label: 'Quick Revision Notes', view: 'revision' },
                    { id: 'skill-tree', label: 'Noob-to-Pro Skill Tree', view: 'skill-tree' },
                    { id: 'schemas', label: 'DB & API Schemas', view: 'schemas' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setHubSubTab(tab.id);
                      setActiveView(tab.view);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      currentHubTab === tab.id
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {currentHubTab === 'system-design' && <SystemDesignStudio />}
              {currentHubTab === 'notes' && <QuickRevisionHub />}
              {currentHubTab === 'skill-tree' && <NoobToProSkillTree />}
              {currentHubTab === 'schemas' && <SchemasReferenceView />}
            </div>
          )}
        </main>
      )}

      {/* Modals & Drawers */}
      <PatternRecognitionQuizModal
        open={drillModalOpen}
        onClose={() => setDrillModalOpen(false)}
        onOpenTopic={(topicId) => {
          setJumpTopicId(topicId);
          setWorkspaceMode('curriculum');
          setActiveView('workspace');
        }}
      />
      <InterviewContextDrawer />
      <ConceptAcademyDrawer open={academyOpen} onClose={() => setAcademyOpen(false)} />
      <PatternTemplateModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      <ScratchpadDrawer open={scratchpadOpen} onClose={() => setScratchpadOpen(false)} />
      <SrtbotWorksheetModal open={srtbotOpen} onClose={() => setSrtbotOpen(false)} />
      <TopicPatternQuizModal />
      <SprintConfiguratorModal />
      <Mock45SimulatorModal />
      <AlgorithmMatcherModal
        open={matcherOpen}
        onClose={() => setMatcherOpen(false)}
        onSelectTopic={(topicId) => {
          setJumpTopicId(topicId);
          setWorkspaceMode('curriculum');
          setActiveView('workspace');
        }}
      />
    </div>
  );
}
