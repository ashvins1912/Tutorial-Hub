import { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Cpu,
  FlaskConical,
  HelpCircle,
  Layers,
  Search,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  TOTAL_AI_PHASES,
  TOTAL_AI_QUIZZES,
  type AiPhaseId,
} from '../data/aiEngineeringData';
import {
  AI_PATTERN_DEEP_SPECS,
  AI_PHASE_DEEP_SPECS,
  buildAiPhaseMermaidDfd,
} from '../data/aiStudioDeepEnrichmentData';
import { useAccountState } from '../hooks/useAccountState';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { AiDfdVisualizer as AiDfdVisualizerBase } from './AiDfdVisualizer';
import { FlightMermaidViewer } from './flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from './shared/LiveTrafficFlowSimulator';
import { withStudioBoundary } from './hoc';
import { CopyButton, SegmentedTabBar } from './ui';
import { TopicBridgeBar } from './shared/TopicBridgeBar';

const AiDfdVisualizer = withStudioBoundary(AiDfdVisualizerBase, {
  studioName: 'AI Architecture DFD Visualizer',
});

interface AiEngineeringProgress {
  completedPhases: string[];
  solvedQuizIds: string[];
  bookmarkedPatterns: string[];
  inspectedNodes: string[];
}

const EMPTY_AI_PROGRESS: AiEngineeringProgress = {
  completedPhases: [],
  solvedQuizIds: [],
  bookmarkedPatterns: [],
  inspectedNodes: [],
};

type WorkspaceTab = 'ontology-dfd' | 'patterns' | 'lab' | 'quiz';
type RoadmapPace = 'fast-3m' | 'deep-6m';

export function AiEngineeringStudio() {
  const { data: AI_ENGINEERING_PHASES } = useAsyncCatalog('ai-engineering-phases');
  const [progress, setProgress] = useAccountState<AiEngineeringProgress>(
    'ai-engineering-progress',
    EMPTY_AI_PROGRESS
  );
  const [activePhaseId, setActivePhaseId] = useState<AiPhaseId>(AI_ENGINEERING_PHASES[0].id);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('ontology-dfd');
  const [patternSearch, setPatternSearch] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [quizSelections, setQuizSelections] = useState<Record<string, string>>({});
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [pace, setPace] = useState<RoadmapPace>('fast-3m');
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [showHeaderTraffic, setShowHeaderTraffic] = useState(false);
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

  const safeProgress: AiEngineeringProgress = {
    completedPhases: Array.isArray(progress?.completedPhases) ? progress.completedPhases : [],
    solvedQuizIds: Array.isArray(progress?.solvedQuizIds) ? progress.solvedQuizIds : [],
    bookmarkedPatterns: Array.isArray(progress?.bookmarkedPatterns)
      ? progress.bookmarkedPatterns
      : [],
    inspectedNodes: Array.isArray(progress?.inspectedNodes) ? progress.inspectedNodes : [],
  };

  const completedPhaseSet = useMemo(
    () => new Set(safeProgress.completedPhases),
    [safeProgress.completedPhases]
  );
  const solvedQuizSet = useMemo(
    () => new Set(safeProgress.solvedQuizIds),
    [safeProgress.solvedQuizIds]
  );
  const bookmarkSet = useMemo(
    () => new Set(safeProgress.bookmarkedPatterns),
    [safeProgress.bookmarkedPatterns]
  );

  const activePhaseIndex = AI_ENGINEERING_PHASES.findIndex((p) => p.id === activePhaseId);
  const activePhase = AI_ENGINEERING_PHASES[activePhaseIndex] ?? AI_ENGINEERING_PHASES[0];
  const isPhaseCompleted = completedPhaseSet.has(activePhase.id);
  const activePhaseMermaid = useMemo(() => buildAiPhaseMermaidDfd(activePhase), [activePhase]);
  const phaseDeepSpec = AI_PHASE_DEEP_SPECS[activePhase.id];

  const handleInspectNode = useCallback(
    (nodeId: string) => {
      setProgress((prev) => {
        const cur: AiEngineeringProgress = {
          completedPhases: Array.isArray(prev?.completedPhases) ? prev.completedPhases : [],
          solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
          bookmarkedPatterns: Array.isArray(prev?.bookmarkedPatterns)
            ? prev.bookmarkedPatterns
            : [],
          inspectedNodes: Array.isArray(prev?.inspectedNodes) ? prev.inspectedNodes : [],
        };
        if (cur.inspectedNodes.includes(nodeId)) return cur;
        return { ...cur, inspectedNodes: [...cur.inspectedNodes, nodeId] };
      });
    },
    [setProgress]
  );

  const togglePhaseCompleted = (phaseId: string) => {
    setProgress((prev) => {
      const cur: AiEngineeringProgress = {
        completedPhases: Array.isArray(prev?.completedPhases) ? prev.completedPhases : [],
        solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
        bookmarkedPatterns: Array.isArray(prev?.bookmarkedPatterns) ? prev.bookmarkedPatterns : [],
        inspectedNodes: Array.isArray(prev?.inspectedNodes) ? prev.inspectedNodes : [],
      };
      const exists = cur.completedPhases.includes(phaseId);
      return {
        ...cur,
        completedPhases: exists
          ? cur.completedPhases.filter((id) => id !== phaseId)
          : [...cur.completedPhases, phaseId],
      };
    });
  };

  const toggleBookmarkPattern = (patternId: string) => {
    setProgress((prev) => {
      const cur: AiEngineeringProgress = {
        completedPhases: Array.isArray(prev?.completedPhases) ? prev.completedPhases : [],
        solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
        bookmarkedPatterns: Array.isArray(prev?.bookmarkedPatterns) ? prev.bookmarkedPatterns : [],
        inspectedNodes: Array.isArray(prev?.inspectedNodes) ? prev.inspectedNodes : [],
      };
      const exists = cur.bookmarkedPatterns.includes(patternId);
      return {
        ...cur,
        bookmarkedPatterns: exists
          ? cur.bookmarkedPatterns.filter((id) => id !== patternId)
          : [...cur.bookmarkedPatterns, patternId],
      };
    });
  };

  const handleAnswerQuiz = (quizId: string, optionId: string, isCorrect: boolean) => {
    setQuizSelections((prev) => ({ ...prev, [quizId]: optionId }));
    if (isCorrect) {
      setProgress((prev) => {
        const cur: AiEngineeringProgress = {
          completedPhases: Array.isArray(prev?.completedPhases) ? prev.completedPhases : [],
          solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
          bookmarkedPatterns: Array.isArray(prev?.bookmarkedPatterns)
            ? prev.bookmarkedPatterns
            : [],
          inspectedNodes: Array.isArray(prev?.inspectedNodes) ? prev.inspectedNodes : [],
        };
        if (cur.solvedQuizIds.includes(quizId)) return cur;
        return { ...cur, solvedQuizIds: [...cur.solvedQuizIds, quizId] };
      });
    }
  };

  const handleCopyStarterCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(activePhase.lab.starterCode).then(() => {
        setCopiedCode(true);
        window.setTimeout(() => setCopiedCode(false), 1800);
      });
    }
  };

  const filteredPatterns = useMemo(() => {
    const q = patternSearch.trim().toLowerCase();
    return activePhase.patterns.filter((pat) => {
      if (onlyBookmarked && !bookmarkSet.has(pat.id)) return false;
      if (!q) return true;
      return (
        pat.name.toLowerCase().includes(q) ||
        pat.category.toLowerCase().includes(q) ||
        pat.coreAlgorithms.toLowerCase().includes(q) ||
        pat.whenToUse.toLowerCase().includes(q)
      );
    });
  }, [activePhase.patterns, patternSearch, onlyBookmarked, bookmarkSet]);

  const totalMilestones = TOTAL_AI_PHASES + TOTAL_AI_QUIZZES;
  const completedMilestones =
    safeProgress.completedPhases.length + safeProgress.solvedQuizIds.length;
  const overallPct = Math.round((completedMilestones / Math.max(1, totalMilestones)) * 100);

  const scheduleSummary = useMemo(() => {
    const baseHoursPerWeek = pace === 'fast-3m' ? 14 : 7;
    const userHoursPerWeek = dailyHours * 7;
    const scaleFactor = baseHoursPerWeek / Math.max(1, userHoursPerWeek);
    const phaseWeeks = AI_ENGINEERING_PHASES.map((phase) => {
      const baseWeeks = pace === 'fast-3m' ? phase.estimatedWeeksFast : phase.estimatedWeeksDeep;
      const adjustedWeeks = Math.max(1, Math.round(baseWeeks * scaleFactor * 10) / 10);
      return {
        id: phase.id,
        phaseNumber: phase.phaseNumber,
        shortTitle: phase.shortTitle,
        weeks: adjustedWeeks,
      };
    });
    const totalWeeks = Math.round(phaseWeeks.reduce((a, b) => a + b.weeks, 0) * 10) / 10;
    return { phaseWeeks, totalWeeks };
  }, [pace, dailyHours]);

  return (
    <div className="space-y-6">
      {/* Studio Overview Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-medium text-sky-700 dark:text-sky-400">
              Zero-to-Production 5-Phase Roadmap · Open-Source &amp; Free Labs
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AI Engineering Mastery Studio
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Master Python &amp; Math foundations, Classical ML patterns, Deep Learning
              backpropagation &amp; Transformers, Production Hybrid RAG &amp; AI Agents, and MLOps
              deployment through interactive Data Flow Diagrams and scenario quizzes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0 min-w-[230px]">
            <div className="w-full space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Roadmap Progress</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {safeProgress.completedPhases.length}/{TOTAL_AI_PHASES} phases ·{' '}
                  {safeProgress.solvedQuizIds.length}/{TOTAL_AI_QUIZZES} quizzes ({overallPct}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-600 dark:bg-sky-400 transition-all duration-300"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHeaderTraffic((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                  showHeaderTraffic
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                {showHeaderTraffic ? 'Hide Live AI Traffic' : 'Live AI Pipeline Traffic'}
              </button>
              <button
                type="button"
                onClick={() => setPlannerOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
              >
                <CalendarClock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                {plannerOpen ? 'Hide Study Timeline' : 'Customize Study Timeline (3m / 6m)'}
              </button>
            </div>
          </div>
        </div>

        {showHeaderTraffic && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <LiveTrafficFlowSimulator
              mermaidCode={activePhaseMermaid}
              mermaidTitle={`${activePhase.shortTitle} AI Pipeline`}
              domain="system-design"
              allowPresetSwitcher
              compact
              heading={`Live AI Pipeline Traffic Simulator — ${activePhase.dfdTitle}`}
            />
          </div>
        )}

        {/* Interactive Study Timeline Calculator (3-Month vs 6-Month + Daily Study Hours) */}
        {plannerOpen && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Personalized Study Pace Calculator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimate your week-by-week timeline across all 5 phases based on target depth and
                  daily hours.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setPace('fast-3m')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      pace === 'fast-3m'
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    3-Month Fast Track
                  </button>
                  <button
                    type="button"
                    onClick={() => setPace('deep-6m')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      pace === 'deep-6m'
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    6-Month Deep Mastery
                  </button>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="whitespace-nowrap">Daily study:</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.5}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-24 accent-sky-600"
                  />
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 w-14">
                    {dailyHours}h/day
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {scheduleSummary.phaseWeeks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePhaseId(item.id)}
                  className="text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 hover:border-sky-400 transition-colors"
                >
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Phase {item.phaseNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {item.shortTitle}
                  </div>
                  <div className="text-sm font-mono tabular-nums font-bold text-sky-700 dark:text-sky-400 mt-1">
                    {item.weeks} wks
                  </div>
                </button>
              ))}
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/30 p-3">
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                  Total Duration
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  Zero to Production
                </div>
                <div className="text-sm font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {scheduleSummary.totalWeeks} wks
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5-Phase Horizontal Progression Strip */}
        <div
          role="tablist"
          aria-label="AI Engineering 5 Phases"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800"
        >
          {AI_ENGINEERING_PHASES.map((phase) => {
            const isSelected = phase.id === activePhase.id;
            const done = completedPhaseSet.has(phase.id);
            const quizzesSolvedHere = phase.quizzes.filter((q) => solvedQuizSet.has(q.id)).length;
            return (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setActivePhaseId(phase.id);
                  setCopiedCode(false);
                }}
                className={`text-left rounded-lg border p-3.5 transition-colors ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/45'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400">
                    Phase 0{phase.phaseNumber}
                  </span>
                  {done ? (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-label="Phase completed"
                    />
                  ) : (
                    <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {quizzesSolvedHere}/{phase.quizzes.length} quiz
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {phase.shortTitle}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {phase.dfdTitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Phase Workspace Card & Progressive Tabs */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Phase {activePhase.phaseNumber} of {TOTAL_AI_PHASES}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {activePhase.estimatedWeeksFast}–{activePhase.estimatedWeeksDeep} weeks
              </span>
              <span aria-hidden="true">·</span>
              <span>Outcome: {activePhase.coreOutcome}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {activePhase.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {activePhase.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => togglePhaseCompleted(activePhase.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 self-start ${
              isPhaseCompleted
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-sky-500'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            {isPhaseCompleted ? 'Phase Mastered (+40 XP)' : 'Mark Phase Complete'}
          </button>
        </div>

        {/* 4 Progressive Workspace Tabs */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <SegmentedTabBar
            ariaLabel="Phase learning sections"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'ontology-dfd', label: 'Ontology & Interactive DFD', icon: Layers },
              {
                id: 'patterns',
                label: 'Algorithm Pattern Matrix',
                count: activePhase.patterns.length,
                icon: BookOpen,
              },
              { id: 'lab', label: 'Free Lab & Starter Code', icon: FlaskConical },
              {
                id: 'quiz',
                label: `Reasoning Quiz (${activePhase.quizzes.filter((q) => solvedQuizSet.has(q.id)).length}/${activePhase.quizzes.length})`,
                icon: HelpCircle,
              },
            ]}
          />
        </div>
      </section>

      {/* TAB 1: Simple English Ontology + Clickable DFD Pipeline + Mermaid & Live Traffic */}
      {activeTab === 'ontology-dfd' && (
        <div className="space-y-6">
          {/* Complete Phase Formal Definition & Architecture Blueprint */}
          {phaseDeepSpec && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                Complete Phase Architecture Definition &amp; Production Mechanics
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 text-xs leading-5">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Formal Definition</div>
                  <p className="text-slate-700 dark:text-slate-300">{phaseDeepSpec.formalDefinition}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">System Architecture Flow</div>
                  <p className="text-slate-700 dark:text-slate-300">{phaseDeepSpec.architectureBlueprint}</p>
                </div>
                <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-1">
                  <div className="font-semibold text-amber-800 dark:text-amber-300">Primary Bottleneck &amp; Mitigation</div>
                  <p className="text-slate-700 dark:text-slate-300">{phaseDeepSpec.keyBottleneckAndMitigation}</p>
                </div>
              </div>
            </section>
          )}

          {/* Ontology Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activePhase.ontology.map((concept, idx) => (
              <article
                key={concept.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Concept 0{idx + 1}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {concept.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {concept.plainEnglish}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                    <strong className="font-semibold text-slate-700 dark:text-slate-300">
                      Analogy:{' '}
                    </strong>
                    {concept.analogy}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-mono text-sky-800 dark:text-sky-300">
                  {concept.keyFormulaOrRule}
                </div>
              </article>
            ))}
          </div>

          {/* Interactive Node-Based DFD Visualizer */}
          <AiDfdVisualizer
            title={activePhase.dfdTitle}
            subtitle={activePhase.dfdSubtitle}
            nodes={activePhase.dfdNodes}
            edges={activePhase.dfdEdges}
            inspectedNodeIds={safeProgress.inspectedNodes}
            onInspectNode={handleInspectNode}
          />

          {/* Rendered Mermaid.js Architecture & Data Flow Diagram */}
          <FlightMermaidViewer
            title={`${activePhase.dfdTitle} — Architecture & DFD (Mermaid.js)`}
            subtitle="Live Mermaid.js flow generated from this phase's pipeline contract with 1-click Live Traffic Flow and source view."
            mermaidCode={activePhaseMermaid}
            trafficDomain="system-design"
            compact
          />

          {/* Synchronized Live Traffic Packet Simulation for this AI Phase */}
          <LiveTrafficFlowSimulator
            mermaidCode={activePhaseMermaid}
            mermaidTitle={`${activePhase.dfdTitle} Live Pipeline`}
            domain="system-design"
            compact
            heading={`Live Data & Request Flow Simulation — ${activePhase.dfdTitle}`}
          />
        </div>
      )}

      {/* TAB 2: Filterable Algorithm & System Pattern Matrix */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={patternSearch}
                onChange={(e) => setPatternSearch(e.target.value)}
                placeholder="Filter algorithms, Big-O, or use cases..."
                aria-label="Filter algorithm patterns"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyBookmarked((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                onlyBookmarked
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              Bookmarked Only ({safeProgress.bookmarkedPatterns.length})
            </button>
          </div>

          {filteredPatterns.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No patterns match the current filter in Phase {activePhase.phaseNumber}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPatternSearch('');
                  setOnlyBookmarked(false);
                }}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
              >
                Reset pattern filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatterns.map((pat) => {
                const isSaved = bookmarkSet.has(pat.id);
                const deepSpec = AI_PATTERN_DEEP_SPECS[pat.id];
                const isExpanded = expandedPatternId === pat.id;
                return (
                  <article
                    key={pat.id}
                    className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 flex flex-col justify-between ${
                      isExpanded ? 'md:col-span-2 border-sky-400 dark:border-sky-600' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
                            {pat.category}
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {pat.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {pat.coreAlgorithms}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBookmarkPattern(pat.id)}
                          aria-label={isSaved ? 'Remove bookmark' : 'Bookmark pattern'}
                          aria-pressed={isSaved}
                          className={`p-2 rounded-lg border transition-colors shrink-0 ${
                            isSaved
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      {deepSpec && (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
                          <strong className="text-slate-900 dark:text-slate-100">Formal Definition: </strong>
                          {deepSpec.formalDefinition}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 dark:border-slate-800 py-2.5">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Training Cost</div>
                          <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                            {pat.trainingComplexity}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400">Inference Cost</div>
                          <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                            {pat.inferenceComplexity}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Use when:{' '}
                          </strong>
                          {pat.whenToUse}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="font-semibold text-rose-700 dark:text-rose-400">
                            Avoid when:{' '}
                          </strong>
                          {pat.whenToAvoid}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        Key tuning knob:{' '}
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {pat.keyHyperparameter}
                        </span>
                      </div>
                      {deepSpec && (
                        <button
                          type="button"
                          onClick={() => setExpandedPatternId(isExpanded ? null : pat.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold hover:border-sky-500 transition-colors whitespace-nowrap"
                        >
                          <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                          {isExpanded ? 'Hide Code, DFD & Live Traffic' : 'Code, Mermaid DFD & Live Traffic'}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded Deep Algorithm Code + Implementation Walkthrough + Mermaid DFD + Live Traffic */}
                    {isExpanded && deepSpec && (
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900">
                              <span className="text-[11px] font-mono text-slate-300">
                                Reference Algorithm Code ({deepSpec.algorithmLanguage})
                              </span>
                              <CopyButton text={deepSpec.algorithmCode} label="Copy Code" copiedLabel="Copied" size="xs" />
                            </div>
                            <pre className="p-3.5 text-xs font-mono text-sky-200 leading-5 overflow-x-auto">
                              {deepSpec.algorithmCode}
                            </pre>
                          </div>

                          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2">
                            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              Deep Implementation Walkthrough
                            </div>
                            <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-5 list-decimal list-inside">
                              {deepSpec.implementationSteps.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <FlightMermaidViewer
                          title={`${pat.name} — Algorithm Data Flow Diagram (Mermaid.js)`}
                          subtitle="Data flow across tensors, indexes, weights, and guardrails for this algorithm."
                          mermaidCode={deepSpec.mermaidDfd}
                          trafficDomain="system-design"
                          compact
                        />

                        <LiveTrafficFlowSimulator
                          mermaidCode={deepSpec.mermaidDfd}
                          mermaidTitle={`${pat.name} Execution Pipeline`}
                          domain="system-design"
                          compact
                          heading={`Live Execution & Traffic Flow — ${pat.name}`}
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Free Lab Launcher & Runnable Starter Code */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Lab Brief, Free Environments & Setup Steps */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                100% Free Open-Source Practice Lab
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {activePhase.lab.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activePhase.lab.miniProjectGoal}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                Recommended Free Environments
              </div>
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                {activePhase.lab.environments.join(' · ')}
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                Open-Source Stack
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-mono">
                {activePhase.lab.openSourceStack.join(' · ')}
              </div>
            </div>

            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Quick-Start Setup Steps
              </div>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {activePhase.lab.setupSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 mt-0.5 shrink-0">
                      0{idx + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: Runnable Starter Code */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-200 truncate">
                <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{activePhase.lab.starterFilename}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyStarterCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    Copied Starter Code
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    Copy Starter Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 overflow-x-auto">
              <code>{activePhase.lab.starterCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: Scenario-Based Reasoning & Debugging Quizzes */}
      {activeTab === 'quiz' && (
        <div className="space-y-5">
          {activePhase.quizzes.map((quiz, idx) => {
            const chosenId = quizSelections[quiz.id] ?? null;
            const chosenOption = quiz.options.find((o) => o.id === chosenId) ?? null;
            const alreadySolved = solvedQuizSet.has(quiz.id);

            return (
              <div
                key={quiz.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                    Debugging Scenario 0{idx + 1}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      alreadySolved
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {alreadySolved ? 'Solved (+25 XP recorded)' : '+25 XP on correct answer'}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {quiz.scenario}
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                  {quiz.question}
                </h3>

                <div className="space-y-2">
                  {quiz.options.map((opt) => {
                    const isPicked = chosenId === opt.id;
                    let cls =
                      'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-sky-400 text-slate-800 dark:text-slate-200';
                    if (isPicked && opt.isCorrect) {
                      cls =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
                    } else if (isPicked && !opt.isCorrect) {
                      cls =
                        'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100';
                    } else if (chosenId && opt.isCorrect) {
                      cls =
                        'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAnswerQuiz(quiz.id, opt.id, opt.isCorrect)}
                        className={`w-full text-left rounded-lg border px-4 py-3 text-xs sm:text-sm transition-colors flex items-start justify-between gap-3 ${cls}`}
                      >
                        <span className="leading-relaxed">{opt.text}</span>
                        {isPicked && opt.isCorrect && (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        {isPicked && !opt.isCorrect && (
                          <XCircle
                            className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {chosenOption && (
                  <div
                    className={`rounded-lg border p-3.5 text-xs sm:text-sm leading-relaxed ${
                      chosenOption.isCorrect
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                        : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <strong className="font-semibold">
                      {chosenOption.isCorrect ? 'Correct Reasoning: ' : 'Why this fails: '}
                    </strong>
                    {chosenOption.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Phase Navigation Footer */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={activePhaseIndex <= 0}
          onClick={() => setActivePhaseId(AI_ENGINEERING_PHASES[activePhaseIndex - 1].id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Previous Phase
        </button>

        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
          Phase {activePhase.phaseNumber} / {TOTAL_AI_PHASES}
        </span>

        <button
          type="button"
          disabled={activePhaseIndex >= AI_ENGINEERING_PHASES.length - 1}
          onClick={() => setActivePhaseId(AI_ENGINEERING_PHASES[activePhaseIndex + 1].id)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          Next Phase
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <TopicBridgeBar studioId="ai-engineering" />
    </div>
  );
}
