import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Lightbulb,
  MessageSquareQuote,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  SkipBack,
  SkipForward,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  ADVANCED_ALGORITHM_CATEGORIES,
  ALGORITHMS_CATALOG,
  ALL_PRACTICE_CHALLENGES,
  AlgorithmCategory,
  AlgorithmDefinition,
  CORE_ALGORITHM_CATEGORIES,
} from '../../data/algorithmsCatalog';
import { BIG_TECH_36_PROBLEMS } from '../../../server/seed/bigTechTopicSeed';
import { BigTechTopicCategory, CodeLanguage } from '../../types/dsa';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { useSprintStore } from '../../store/useSprintStore';
import { AlgorithmVisualStage } from './AlgorithmVisualStage';
import {
  ArchitectureDiagramId,
  ArchitectureVisualizer,
} from './ArchitectureVisualizer';
import { SortingAlgorithmLab } from './SortingAlgorithmLab';
import { RecursionBacktrackingLab } from '../../features/recursion-lab/components/RecursionBacktrackingLab';
import { ComplexityDepthToggle } from '../../features/visualizer/components/ComplexityDepthToggle';
import { useAccountState } from '../../hooks/useAccountState';
import { getAlgorithmComplexityProfile } from '../../features/visualizer/data/complexityComparisonData';
import { getAlgorithmTutorGuide } from '../../data/algorithmTutorGuides';

type TierFilter = 'all' | 'core' | 'advanced';
type DetailTab = 'mental' | 'triggers' | 'code' | 'practice';

interface TestCaseRunResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
  note?: string;
}

const STORAGE_KEY = 'patternforge_algo_implemented_v1';

const SPEEDS = [
  { label: '0.5×', ms: 2400 },
  { label: '1×', ms: 1400 },
  { label: '2×', ms: 750 },
] as const;

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

function formatVal(val: unknown): string {
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

export function AlgorithmsStudio({
  onOpenCurriculumTopic,
}: {
  onOpenCurriculumTopic?: (topicId: string) => void;
}) {
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const selectedAlgoId = usePatternForgeStore((s) => s.activeAlgorithmId);
  const setSelectedAlgoId = usePatternForgeStore((s) => s.setActiveAlgorithmId);
  const activeAlgorithmTab = usePatternForgeStore((s) => s.activeAlgorithmTab);
  const studioMode = usePatternForgeStore((s) => s.algorithmsStudioMode);
  const setStudioMode = usePatternForgeStore((s) => s.setAlgorithmsStudioMode);
  const activeArchitectureId = usePatternForgeStore((s) => s.activeArchitectureId);
  const setActiveArchitectureId = usePatternForgeStore((s) => s.setActiveArchitectureId);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const setCurrentStage = usePatternForgeStore((s) => s.setCurrentStage);

  const setSelectedTopic = useSprintStore((s) => s.setSelectedTopic);
  const openTrainerForProblem = useSprintStore((s) => s.openTrainerForProblem);
  const masteredSlugs = useSprintStore((s) => s.masteredSlugs);

  const [tier, setTier] = useState<TierFilter>('all');
  const [category, setCategory] = useState<'All' | AlgorithmCategory>('All');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(1400);
  const [detailTab, setDetailTab] = useState<DetailTab>(activeAlgorithmTab);
  const [codeLang, setCodeLang] = useState<CodeLanguage>('python');
  const [copied, setCopied] = useState(false);
  const [revealedTwistIndices, setRevealedTwistIndices] = useState<number[]>([]);

  // Practice Implementation Lab state (DB-persisted)
  const [implementedIds, setImplementedIds] = useAccountState<string[]>(
    'algorithms-implemented',
    [],
    STORAGE_KEY
  );
  const [userCodeByAlgo, setUserCodeByAlgo] = useState<Record<string, string>>({});
  const [testResultsByAlgo, setTestResultsByAlgo] = useState<
    Record<string, { results: TestCaseRunResult[]; compileError?: string; allPassed: boolean }>
  >({});
  const detailSectionRef = useRef<HTMLElement | null>(null);

  const coreCount = useMemo(
    () => ALGORITHMS_CATALOG.filter((a) => CORE_ALGORITHM_CATEGORIES.includes(a.category)).length,
    []
  );
  const advancedCount = ALGORITHMS_CATALOG.length - coreCount;

  const availableCategories: ('All' | AlgorithmCategory)[] = useMemo(() => {
    if (tier === 'core') return ['All', ...CORE_ALGORITHM_CATEGORIES];
    if (tier === 'advanced') return ['All', ...ADVANCED_ALGORITHM_CATEGORIES];
    return ['All', ...CORE_ALGORITHM_CATEGORIES, ...ADVANCED_ALGORITHM_CATEGORIES];
  }, [tier]);

  const visibleAlgorithms = useMemo(() => {
    return ALGORITHMS_CATALOG.filter((algo) => {
      if (tier === 'core' && !CORE_ALGORITHM_CATEGORIES.includes(algo.category)) return false;
      if (tier === 'advanced' && !ADVANCED_ALGORITHM_CATEGORIES.includes(algo.category)) return false;
      if (category !== 'All' && algo.category !== category) return false;
      return true;
    });
  }, [tier, category]);

  const algorithm: AlgorithmDefinition = useMemo(
    () =>
      ALGORITHMS_CATALOG.find((a) => a.id === selectedAlgoId) ??
      visibleAlgorithms[0] ??
      ALGORITHMS_CATALOG[0],
    [selectedAlgoId, visibleAlgorithms]
  );

  const practiceSpec = ALL_PRACTICE_CHALLENGES[algorithm.id];
  const currentEditorCode = userCodeByAlgo[algorithm.id] ?? practiceSpec?.starterCode ?? '';
  const currentTestRun = testResultsByAlgo[algorithm.id];
  const isCurrentImplemented = implementedIds.includes(algorithm.id);

  const totalFrames = algorithm.frames.length;
  const safeFrameIndex = Math.min(frameIndex, Math.max(0, totalFrames - 1));
  const currentFrame = algorithm.frames[safeFrameIndex] ?? algorithm.frames[0];

  const tutorGuide = useMemo(() => getAlgorithmTutorGuide(algorithm.id), [algorithm.id]);

  useEffect(() => {
    setFrameIndex(0);
    setIsPlaying(false);
    setRevealedTwistIndices([]);
  }, [selectedAlgoId]);

  useEffect(() => {
    setDetailTab(activeAlgorithmTab);
  }, [activeAlgorithmTab, selectedAlgoId]);

  useEffect(() => {
    if (!isPlaying) return;
    if (safeFrameIndex >= totalFrames - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setFrameIndex((prev) => Math.min(prev + 1, totalFrames - 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, safeFrameIndex, totalFrames, speedMs]);

  const handleSelectAlgorithm = (id: string) => {
    setSelectedAlgoId(id);
    setFrameIndex(0);
    setIsPlaying(false);
  };

  const handleTierChange = (nextTier: TierFilter) => {
    setTier(nextTier);
    setCategory('All');
    const nextList = ALGORITHMS_CATALOG.filter((a) => {
      if (nextTier === 'core') return CORE_ALGORITHM_CATEGORIES.includes(a.category);
      if (nextTier === 'advanced') return ADVANCED_ALGORITHM_CATEGORIES.includes(a.category);
      return true;
    });
    if (nextList.length > 0 && !nextList.some((a) => a.id === selectedAlgoId)) {
      setSelectedAlgoId(nextList[0].id);
      setFrameIndex(0);
      setIsPlaying(false);
    }
  };

  const handleCategoryChange = (cat: 'All' | AlgorithmCategory) => {
    setCategory(cat);
    const list = ALGORITHMS_CATALOG.filter((a) => {
      if (tier === 'core' && !CORE_ALGORITHM_CATEGORIES.includes(a.category)) return false;
      if (tier === 'advanced' && !ADVANCED_ALGORITHM_CATEGORIES.includes(a.category)) return false;
      if (cat !== 'All' && a.category !== cat) return false;
      return true;
    });
    if (list.length > 0 && !list.some((a) => a.id === selectedAlgoId)) {
      setSelectedAlgoId(list[0].id);
      setFrameIndex(0);
      setIsPlaying(false);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (safeFrameIndex >= totalFrames - 1) {
        setFrameIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(algorithm.templates[codeLang]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleRunPracticeTests = () => {
    if (!practiceSpec) return;
    const code = userCodeByAlgo[algorithm.id] ?? practiceSpec.starterCode;

    let userFn: ((...args: unknown[]) => unknown) | null = null;
    try {
      const factory = new Function(
        `${code}\nreturn typeof ${practiceSpec.functionName} === 'function' ? ${practiceSpec.functionName} : null;`
      );
      userFn = factory() as ((...args: unknown[]) => unknown) | null;
    } catch (err) {
      setTestResultsByAlgo((prev) => ({
        ...prev,
        [algorithm.id]: {
          results: [],
          compileError: err instanceof Error ? err.message : String(err),
          allPassed: false,
        },
      }));
      return;
    }

    if (typeof userFn !== 'function') {
      setTestResultsByAlgo((prev) => ({
        ...prev,
        [algorithm.id]: {
          results: [],
          compileError: `Expected function "${practiceSpec.functionName}" to be defined.`,
          allPassed: false,
        },
      }));
      return;
    }

    const results: TestCaseRunResult[] = practiceSpec.testCases.map((tc) => {
      try {
        const clonedArgs = deepClone(tc.args);
        const actual = userFn!(...clonedArgs);
        const expectedStr = formatVal(tc.expected);
        const actualStr = formatVal(actual);
        return {
          label: tc.label,
          passed: actualStr === expectedStr,
          expected: expectedStr,
          actual: actualStr,
          note: tc.note,
        };
      } catch (err) {
        return {
          label: tc.label,
          passed: false,
          expected: formatVal(tc.expected),
          actual: 'Runtime Error',
          error: err instanceof Error ? err.message : String(err),
          note: tc.note,
        };
      }
    });

    const allPassed = results.length > 0 && results.every((r) => r.passed);
    setTestResultsByAlgo((prev) => ({
      ...prev,
      [algorithm.id]: { results, allPassed },
    }));

    if (allPassed) {
      setImplementedIds((prev) => (prev.includes(algorithm.id) ? prev : [...prev, algorithm.id]));
    }
  };

  const handleResetStarter = () => {
    if (!practiceSpec) return;
    setUserCodeByAlgo((prev) => ({ ...prev, [algorithm.id]: practiceSpec.starterCode }));
    setTestResultsByAlgo((prev) => {
      const next = { ...prev };
      delete next[algorithm.id];
      return next;
    });
  };

  const handleLoadSolution = () => {
    if (!practiceSpec) return;
    setUserCodeByAlgo((prev) => ({ ...prev, [algorithm.id]: practiceSpec.solutionCode }));
  };

  const handleJumpToPractice = () => {
    setDetailTab('practice');
    detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Linked problems pulled directly from the 48-problem bank (explicit slugs first, then topic matches)
  const linkedProblems = useMemo(() => {
    const bySlug = new Map(BIG_TECH_36_PROBLEMS.map((p) => [p.slug, p]));
    const ordered: typeof BIG_TECH_36_PROBLEMS = [];
    const seen = new Set<string>();

    for (const slug of algorithm.linkedProblemSlugs) {
      const prob = bySlug.get(slug);
      if (prob && !seen.has(prob.slug)) {
        ordered.push(prob);
        seen.add(prob.slug);
      }
    }

    for (const prob of BIG_TECH_36_PROBLEMS) {
      if (algorithm.linkedTopics.includes(prob.topicCategory) && !seen.has(prob.slug)) {
        ordered.push(prob);
        seen.add(prob.slug);
      }
    }

    return ordered;
  }, [algorithm]);

  const handleOpenTopicInBank = (topic: BigTechTopicCategory) => {
    setSelectedTopic(topic);
    setActiveView('roadmap');
  };

  const handleOpenProblemTrainer = (slug: string) => {
    openTrainerForProblem(slug);
    setActiveView('roadmap');
  };

  const handleOpenDpLab = () => {
    setActiveView('workspace');
    setCurrentStage(5);
  };

  const isAdvancedAlgo = ADVANCED_ALGORITHM_CATEGORIES.includes(algorithm.category);

  return (
    <div className="space-y-6">
      {/* Mode Switcher: 45-Algorithm Studio, Sorting Algorithm Lab, Recursion & Backtracking, Architecture Visualizer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit">
          {[
            { id: 'studio' as const, label: '45-Algorithm Animated & Practice Studio' },
            { id: 'sorting-lab' as const, label: 'Sorting Algorithm Lab (Race Mode)' },
            { id: 'recursion-lab' as const, label: 'Recursion & Backtracking Visualizer' },
            { id: 'architecture' as const, label: 'Interactive Architecture Visualizer (SVG)' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setStudioMode(m.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                studioMode === m.id
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {studioMode === 'sorting-lab' ? (
        <SortingAlgorithmLab />
      ) : studioMode === 'recursion-lab' ? (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Recursion & Backtracking Visualizer · Call Stack Depth · Base Cases vs. Recursive Steps
            </p>
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Interactive Call Stack & Backtracking Lab (N-Queens & Subsets)
            </h1>
          </div>
          <RecursionBacktrackingLab
            onOpenCurriculumModule={(topicId) => onOpenCurriculumTopic?.(topicId)}
          />
        </section>
      ) : studioMode === 'architecture' ? (
        <ArchitectureVisualizer
          selectedId={activeArchitectureId as ArchitectureDiagramId}
          onSelectId={(id) => setActiveArchitectureId(id)}
        />
      ) : (
        <>
      {/* Header & Algorithm Tabs Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              Visual Algorithm Studio · {ALGORITHMS_CATALOG.length} Algorithms ({coreCount} Core + {advancedCount} Advanced) · Implemented: {implementedIds.length} / {ALGORITHMS_CATALOG.length}
            </p>
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Step-by-Step Animated Algorithm & Implementation Studio
            </h1>
          </div>

          {/* Tier Segmented Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-fit">
            {[
              { id: 'all' as const, label: `All (${ALGORITHMS_CATALOG.length})` },
              { id: 'core' as const, label: `Core Patterns (${coreCount})` },
              { id: 'advanced' as const, label: `Advanced (${advancedCount})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTierChange(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  tier === t.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 11-Category Filter Strip */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {availableCategories.map((cat) => {
            const count =
              cat === 'All'
                ? tier === 'core'
                  ? coreCount
                  : tier === 'advanced'
                    ? advancedCount
                    : ALGORITHMS_CATALOG.length
                : ALGORITHMS_CATALOG.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  category === cat
                    ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat === 'All' ? `All Categories (${count})` : `${cat} (${count})`}
              </button>
            );
          })}
        </div>

        {/* Algorithm Tabs Strip */}
        <div
          role="tablist"
          aria-label="Algorithms"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 pt-1 max-h-[260px] overflow-y-auto pr-1"
        >
          {visibleAlgorithms.map((algo, idx) => {
            const active = algo.id === algorithm.id;
            const mastered = implementedIds.includes(algo.id);
            return (
              <button
                key={algo.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => handleSelectAlgorithm(algo.id)}
                className={`text-left px-3 py-2 rounded-lg border transition-colors min-w-0 ${
                  active
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                  <span className="truncate">
                    {String(idx + 1).padStart(2, '0')} · {algo.timeComplexity}
                  </span>
                  {mastered && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-label="Implemented"
                    />
                  )}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">{algo.shortName}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-Zone Interactive Animation Sandbox (Stage 65% + Live Step Inspector 35%) */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)] gap-5 items-stretch">
        {/* Left Zone: Interactive Visual Canvas & Playback Controls */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {isAdvancedAlgo ? 'Advanced Tier' : 'Core Pattern'} · {algorithm.category}
                  {isCurrentImplemented && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> · Implemented</span>
                  )}
                </div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {algorithm.name}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">{algorithm.tagline}</p>
              </div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                Time <strong className="text-slate-900 dark:text-slate-100">{algorithm.timeComplexity}</strong>
                <span className="mx-1.5" aria-hidden="true">·</span>
                Space <strong className="text-slate-900 dark:text-slate-100">{algorithm.spaceComplexity}</strong>
              </div>
            </div>

            <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
              Optimization leap: {algorithm.complexityLeap}
            </div>
          </div>

          {/* Time Complexity Toggle: Recursive Depth vs. Iterative Alternative */}
          <ComplexityDepthToggle
            profile={getAlgorithmComplexityProfile(algorithm)}
            currentDepth={
              currentFrame.stackItems && currentFrame.stackItems.length > 0
                ? currentFrame.stackItems.length
                : safeFrameIndex + 1
            }
            currentStep={safeFrameIndex + 1}
            totalSteps={totalFrames}
          />

          {/* Animated Visualizer Stage */}
          <div className="py-1">
            <AlgorithmVisualStage algorithm={algorithm} frame={currentFrame} />
          </div>

          {/* Playback Controls & Scrubber */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      {safeFrameIndex >= totalFrames - 1 ? 'Replay' : 'Play Animation'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setFrameIndex((i) => Math.max(0, i - 1));
                  }}
                  disabled={safeFrameIndex === 0}
                  aria-label="Previous step"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35"
                >
                  <SkipBack className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setFrameIndex((i) => Math.min(totalFrames - 1, i + 1));
                  }}
                  disabled={safeFrameIndex >= totalFrames - 1}
                  aria-label="Next step"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setFrameIndex(0);
                  }}
                  aria-label="Reset animation"
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Speed:</span>
                {SPEEDS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSpeedMs(s.ms)}
                    className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                      speedMs === s.ms
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="algo-step-slider"
                className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums"
              >
                Step {safeFrameIndex + 1} / {totalFrames}
              </label>
              <input
                id="algo-step-slider"
                type="range"
                min={0}
                max={Math.max(0, totalFrames - 1)}
                value={safeFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setFrameIndex(Number(e.target.value));
                }}
                className="flex-1 accent-sky-600"
              />
            </div>
          </div>
        </div>

        {/* Right Zone: Live Step Annotation, State Watch & Quick Lab Launch */}
        <aside className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                Step {currentFrame.step} of {totalFrames}
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {currentFrame.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {currentFrame.explanation}
              </p>
            </div>

            {/* Live Variable State Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2">
              <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                Live State Inspector
              </div>
              <dl className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-xs font-mono">
                {currentFrame.variables.map((v) => (
                  <div key={v.name} className="py-1.5 flex items-center justify-between gap-3">
                    <dt className="text-slate-500 dark:text-slate-400">{v.name}</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 text-right tabular-nums">
                      {v.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Invariant Verification Note */}
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Why This Step Works (Invariant)
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {currentFrame.invariantCheck}
              </p>
            </div>
          </div>

          {/* Direct Action Links into Practice Code / 5-Stage Lab / Topic Bank */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-wrap gap-2">
            {practiceSpec && (
              <button
                type="button"
                onClick={handleJumpToPractice}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
              >
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                Practice Code
              </button>
            )}
            {algorithm.featuredLabId && (
              <button
                type="button"
                onClick={() => selectProblem(algorithm.featuredLabId!)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                5-Stage Lab
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            {algorithm.hasDpLabLink && (
              <button
                type="button"
                onClick={handleOpenDpLab}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 text-xs font-semibold hover:border-sky-400 transition-colors whitespace-nowrap"
              >
                Guided DP Lab
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            {algorithm.linkedTopics[0] && (
              <button
                type="button"
                onClick={() => handleOpenTopicInBank(algorithm.linkedTopics[0])}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Explore Topic: {algorithm.linkedTopics[0]}
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </aside>
      </section>

      {/* Deep Explanation, Templates & Interactive Practice Implementation Lab */}
      <section
        ref={detailSectionRef}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
            {[
              { id: 'mental' as const, label: 'Deep Mental Model' },
              { id: 'triggers' as const, label: 'When to Use & Pitfalls' },
              { id: 'code' as const, label: 'Reusable Code Template' },
              { id: 'practice' as const, label: 'Practice Implementation' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDetailTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  detailTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            Category: {algorithm.category} · {linkedProblems.length} linked interview problems
          </div>
        </div>

        {detailTab === 'mental' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Core Algorithmic Intuition
                </h3>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {algorithm.coreIdea}
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                    Formal Loop Invariant
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {algorithm.loopInvariant}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Repeatable Step-by-Step Execution Recipe
                </h3>
                <ol className="space-y-2.5">
                  {algorithm.mentalModelSteps.map((stepText, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 pt-0.5 tabular-nums">
                        0{idx + 1}.
                      </span>
                      <span className="leading-relaxed">{stepText}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {tutorGuide && (
              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Specialist Tutor Companion
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Plain-English intuition paired with senior interview verbalization and follow-up twists.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {tutorGuide.followUpTwists.length} interview twists · click to test recall
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Simple Everyday Analogy</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {tutorGuide.simpleAnalogy}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
                      <MessageSquareQuote className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>30-Second Senior Interview Script</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {tutorGuide.interviewScript30s}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                    <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Choose This Pattern When
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {tutorGuide.chooseWhen}
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Avoid / Pivot When</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {tutorGuide.avoidWhen}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Interviewer Follow-Up Twists (Active Recall)
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {tutorGuide.followUpTwists.map((twist, idx) => {
                      const isRevealed = revealedTwistIndices.includes(idx);
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedTwistIndices((prev) =>
                                prev.includes(idx)
                                  ? prev.filter((i) => i !== idx)
                                  : [...prev, idx]
                              )
                            }
                            aria-expanded={isRevealed}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors"
                          >
                            <span className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums pt-0.5">
                                T{idx + 1}
                              </span>
                              <span>{twist.question}</span>
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                                isRevealed ? 'rotate-180 text-sky-500' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          {isRevealed && (
                            <div className="px-4 pb-3.5 pt-1 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
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
              </div>
            )}
          </div>
        )}

        {detailTab === 'triggers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Problem Signals That Trigger {algorithm.shortName}
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                {algorithm.whenToUse.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5 rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/40 dark:bg-rose-950/20 p-4">
              <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                Eliminator Rule — When This Algorithm Fails
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {algorithm.whenItFails}
              </p>
            </div>
          </div>
        )}

        {detailTab === 'code' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['python', 'js', 'java'] as CodeLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setCodeLang(lang)}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border transition-colors ${
                      codeLang === lang
                        ? 'border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'js' ? 'JavaScript' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy Template'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
              {algorithm.templates[codeLang]}
            </pre>
          </div>
        )}

        {detailTab === 'practice' && practiceSpec && (
          <div className="space-y-6">
            {/* Challenge Header + 3-Step Structured Blueprint */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {practiceSpec.title}
                    </h3>
                    {isCurrentImplemented && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Implemented
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {practiceSpec.prompt}
                  </p>
                </div>

                {/* Structured 3-Step Blueprint */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                    3-Step Implementation Blueprint
                  </div>
                  <ol className="space-y-2.5">
                    {practiceSpec.structuredSteps.map((s, idx) => (
                      <li key={s.step} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          0{idx + 1}. {s.step}:{' '}
                        </span>
                        {s.detail}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Live Test Case Output Panel */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      Unit Test Runner ({practiceSpec.testCases.length} cases)
                    </span>
                    {currentTestRun && (
                      <span
                        className={`text-xs font-mono font-semibold tabular-nums ${
                          currentTestRun.allPassed
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {currentTestRun.results.filter((r) => r.passed).length} / {practiceSpec.testCases.length} Passed
                      </span>
                    )}
                  </div>

                  {currentTestRun?.compileError && (
                    <div className="rounded-md border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs font-mono text-rose-800 dark:text-rose-300">
                      Error: {currentTestRun.compileError}
                    </div>
                  )}

                  {!currentTestRun ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Implement <code className="font-mono font-semibold text-slate-800 dark:text-slate-200">{practiceSpec.functionName}</code> on the right and click Run Tests to execute all unit tests in-browser.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {currentTestRun.results.map((res, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 space-y-1 text-xs font-mono">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                              {res.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                              )}
                              {res.label}
                            </span>
                            <span className={res.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                              {res.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 pl-5 break-all">
                            Expected: <span className="text-slate-900 dark:text-slate-100">{res.expected}</span>
                            {' · '}
                            Actual: <span className={res.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{res.actual}</span>
                          </div>
                          {res.error && (
                            <div className="text-[11px] text-rose-700 dark:text-rose-300 pl-5">
                              Exception: {res.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Editable JS Practice Editor */}
              <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/90">
                  <div className="text-xs font-mono text-slate-300">
                    JavaScript · fn <span className="text-sky-400 font-semibold">{practiceSpec.functionName}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetStarter}
                      className="px-2.5 py-1 rounded-md border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      Reset Starter
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSolution}
                      className="px-2.5 py-1 rounded-md border border-slate-700 text-xs font-medium text-sky-300 hover:bg-slate-800 transition-colors"
                    >
                      Load Solution
                    </button>
                    <button
                      type="button"
                      onClick={handleRunPracticeTests}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition-colors"
                    >
                      <Play className="w-3 h-3" aria-hidden="true" />
                      Run Tests
                    </button>
                  </div>
                </div>
                <textarea
                  value={currentEditorCode}
                  onChange={(e) =>
                    setUserCodeByAlgo((prev) => ({ ...prev, [algorithm.id]: e.target.value }))
                  }
                  spellCheck={false}
                  aria-label={`JavaScript editor for ${practiceSpec.functionName}`}
                  rows={15}
                  className="w-full flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-6 focus:outline-hidden resize-y"
                />
              </div>
            </div>

            {/* Platform Practice Ladder */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Platform Practice Ladder (LeetCode · NeetCode · CSES · Grind 75)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Reinforce {algorithm.shortName} across progressive difficulty drills.
                </p>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {practiceSpec.platformDrills.map((drill) => (
                  <div
                    key={`${drill.platform}-${drill.number}-${drill.title}`}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                          {drill.platform} {drill.number}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {drill.title}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            drill.difficulty === 'Easy'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : drill.difficulty === 'Medium'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {drill.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{drill.focus}</p>
                    </div>
                    {drill.trainerSlug && (
                      <button
                        type="button"
                        onClick={() => handleOpenProblemTrainer(drill.trainerSlug!)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Open in Trainer
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Linked DSA Topics & Problems Solvable With This Algorithm */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
              DSA Topics & Interview Problems Solved Using {algorithm.shortName}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Launch any problem directly in the full-spec Solution Trainer or jump to its interactive 5-Stage Practice Lab.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {algorithm.linkedTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleOpenTopicInBank(topic)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-400 whitespace-nowrap"
              >
                Topic: {topic}
                <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {linkedProblems.map((prob) => {
            const isMastered = masteredSlugs.includes(prob.slug);
            const topCompany = [...prob.bigTechFrequency].sort(
              (a, b) => b.frequencyScore - a.frequencyScore
            )[0];

            return (
              <div
                key={prob.slug}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      #{prob.number}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {prob.title}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        prob.difficulty === 'Easy'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : prob.difficulty === 'Medium'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{prob.topicCategory}</span>
                    {isMastered && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                        · <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Mastered
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                    {prob.fullDescription || prob.promptSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>Pattern: {prob.primaryPattern}</span>
                    {topCompany && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-sky-700 dark:text-sky-400 font-semibold">
                          Top Asked: {topCompany.company} {topCompany.frequencyScore}%
                        </span>
                      </>
                    )}
                    {prob.studySheets && prob.studySheets.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{prob.studySheets.join(' · ')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {prob.labProblemId && (
                    <button
                      type="button"
                      onClick={() => selectProblem(prob.labProblemId!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      5-Stage Lab
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenProblemTrainer(prob.slug)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                  >
                    Solve & Train
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
        </>
      )}
    </div>
  );
}
