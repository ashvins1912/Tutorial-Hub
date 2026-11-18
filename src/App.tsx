import { useEffect, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Database,
  FileCode2,
  Moon,
  NotebookPen,
  Play,
  Sun,
  X,
} from 'lucide-react';
import { usePatternForgeStore, TopView } from './store/usePatternForgeStore';
import { useSprintStore } from './store/useSprintStore';
import { PROBLEMS } from './data/problems';
import { BIG_TECH_36_PROBLEMS } from '../server/seed/bigTechTopicSeed';
import { MasteryStepper } from './components/MasteryStepper';
import { PolyaWorkflowBar } from './components/cognitive/PolyaWorkflowBar';
import { ProblemXRayReader } from './components/ProblemXRayReader';
import { VisualSandbox } from './components/VisualSandbox';
import { LogicBlockBuilder } from './components/LogicBlockBuilder';
import { RaceModeVisualizer } from './components/RaceModeVisualizer';
import { DPLadderVisualizer } from './components/cognitive/DPLadderVisualizer';
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
import { CompleteDsaRoadmap } from './components/CompleteDsaRoadmap';
import { LeetCode75Track } from './components/LeetCode75Track';
import { TopInterview100Track } from './components/TopInterview100Track';
import { SharedTopicAcademy } from './components/SharedTopicAcademy';
import { TopicPatternExplorer } from './components/interview/TopicPatternExplorer';
import { HowToIdentifyTrainer } from './components/interview/HowToIdentifyTrainer';
import { BigTechRubricScorecard } from './components/interview/BigTechRubricScorecard';
import { SprintWarRoomDashboard } from './components/sprint/SprintWarRoomDashboard';
import { SprintConfiguratorModal } from './components/sprint/SprintConfiguratorModal';
import { Mock45SimulatorModal } from './components/sprint/Mock45SimulatorModal';

export default function App() {
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
  const openTopicQuiz = usePatternForgeStore((s) => s.openTopicQuiz);
  const promotionToast = usePatternForgeStore((s) => s.promotionToast);
  const clearPromotionToast = usePatternForgeStore((s) => s.clearPromotionToast);

  const fetchActiveSprint = useSprintStore((s) => s.fetchActiveSprint);
  const setConfiguratorOpen = useSprintStore((s) => s.setConfiguratorOpen);
  const activeTrainerSlug = useSprintStore((s) => s.activeTrainerSlug);
  const closeTrainer = useSprintStore((s) => s.closeTrainer);
  const activeRubricResult = useSprintStore((s) => s.activeRubricResult);
  const clearRubricResult = useSprintStore((s) => s.clearRubricResult);
  const activeSprint = useSprintStore((s) => s.activeSprint);
  const activeSprintTaskContext = useSprintStore((s) => s.activeSprintTaskContext);

  const [academyOpen, setAcademyOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [srtbotOpen, setSrtbotOpen] = useState(false);
  const [bankSubTab, setBankSubTab] = useState<'bigtech36' | 'highroi45' | 'skilltree'>('bigtech36');

  const activeProblem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const trainerProblem = activeTrainerSlug
    ? BIG_TECH_36_PROBLEMS.find((p) => p.slug === activeTrainerSlug) ?? null
    : null;

  useEffect(() => {
    fetchBrainProfile();
    fetchActiveSprint();
  }, [fetchBrainProfile, fetchActiveSprint]);

  const navItems: { id: TopView; label: string }[] = [
    { id: 'workspace', label: 'DSA Lab' },
    { id: 'sprint', label: '14-Day Sprint' },
    { id: 'roadmap', label: 'Big Tech Bank' },
    { id: 'system-design', label: 'System Design' },
    { id: 'revision', label: 'Revision & Notes' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveView('workspace')}
            className="text-lg font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 text-left"
          >
            PatternForge DSA
          </button>

          {/* Zone 2: 5 Concise Single-Line Nav Links */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    active
                      ? 'text-slate-900 dark:text-slate-100 border-sky-600 dark:border-sky-400'
                      : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => openTopicQuiz(activeProblem.topicQuizId)}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
            >
              Pattern Reflex Quiz
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Mobile/Tablet Nav Strip */}
      <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
              activeView === item.id
                ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Workspace Control & Pedagogy Toolbar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="problem-select" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Lab:
            </label>
            <select
              id="problem-select"
              value={activeProblem.id}
              onChange={(e) => selectProblem(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[260px] sm:max-w-none truncate"
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.title} ({p.difficulty} · {p.patternName})
                </option>
              ))}
            </select>

            <span className="hidden sm:inline text-xs text-slate-400">·</span>
            <button
              type="button"
              onClick={() => setActiveView('skill-tree')}
              className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 tabular-nums"
            >
              Rank: <strong className="text-slate-900 dark:text-slate-100">{brainProfile.currentTier}</strong> · Assembly{' '}
              {brainProfile.cognitiveMetrics.logicAssemblyAccuracy}%
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConfiguratorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-400 whitespace-nowrap shrink-0"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              {activeSprint ? `${activeSprint.targetCompany} Day ${activeSprint.currentDay}` : 'Launch 14-Day Sprint'}
            </button>

            <button
              type="button"
              onClick={() => setAcademyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Concept Academy
            </button>

            <button
              type="button"
              onClick={() => setTemplatesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0"
            >
              <FileCode2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Golden Templates
            </button>

            {activeProblem.hasDpLadder && (
              <button
                type="button"
                onClick={() => setSrtbotOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs font-semibold text-amber-800 dark:text-amber-300 whitespace-nowrap shrink-0"
              >
                <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
                SRTBOT Worksheet
              </button>
            )}

            <button
              type="button"
              onClick={() => setInterviewDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0"
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Interview Twists
            </button>

            <button
              type="button"
              onClick={() => setScratchpadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 whitespace-nowrap shrink-0"
            >
              <NotebookPen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Scratchpad
            </button>

            <button
              type="button"
              onClick={() => setActiveView('schemas')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 ${
                activeView === 'schemas'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Schemas
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {promotionToast && (
        <div className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 pt-4">
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

      {/* Main Content */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeView === 'workspace' && (
          <>
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
            {currentStage === 5 && <NoobToProSkillTree />}
          </>
        )}

        {activeView === 'sprint' && <SprintWarRoomDashboard />}

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
                    { id: 'bigtech36' as const, label: 'Big Tech 36 Pattern Trainer' },
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

                {bankSubTab === 'bigtech36' && <TopicPatternExplorer />}
                {bankSubTab === 'highroi45' && <ProblemBank45View />}
                {bankSubTab === 'skilltree' && <NoobToProSkillTree />}
              </>
            )}
          </div>
        )}

        {activeView === 'skill-tree' && <NoobToProSkillTree />}
        {activeView === 'complete-roadmap' && <CompleteDsaRoadmap />}
        {activeView === 'leetcode-75' && <LeetCode75Track />}
        {activeView === 'top-interview-100' && <TopInterview100Track />}
        {activeView === 'topic-academy' && <SharedTopicAcademy />}
        {activeView === 'system-design' && <SystemDesignStudio />}
        {activeView === 'revision' && <QuickRevisionHub />}
        {activeView === 'schemas' && <SchemasReferenceView />}
      </main>

      {/* Drawers & Modals */}
      <InterviewContextDrawer />
      <ConceptAcademyDrawer open={academyOpen} onClose={() => setAcademyOpen(false)} />
      <PatternTemplateModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      <ScratchpadDrawer open={scratchpadOpen} onClose={() => setScratchpadOpen(false)} />
      <SrtbotWorksheetModal open={srtbotOpen} onClose={() => setSrtbotOpen(false)} />
      <TopicPatternQuizModal />
      <SprintConfiguratorModal />
      <Mock45SimulatorModal />
    </div>
  );
}
