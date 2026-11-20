import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  RotateCcw,
  ShieldAlert,
  Target,
  XCircle,
} from 'lucide-react';
import {
  PATTERN_DRILL_SCENARIOS,
  type DrillCategory,
  type PatternDrillScenario,
} from '../../data/patternDrillScenarios';
import { useAccountState } from '../../hooks/useAccountState';

interface PatternRecognitionDrillProps {
  onInspectAlgorithm: (algoId: string, tab?: 'mental' | 'practice') => void;
}

interface DrillProgressState {
  solvedIds: string[];
  attempts: number;
  correctCount: number;
  streak: number;
  bestStreak: number;
}

const INITIAL_PROGRESS: DrillProgressState = {
  solvedIds: [],
  attempts: 0,
  correctCount: 0,
  streak: 0,
  bestStreak: 0,
};

const CATEGORIES: ('All' | DrillCategory)[] = [
  'All',
  'Arrays & Windows',
  'Graphs & Shortest Path',
  'Trees & Ranges',
  'DP & Optimization',
];

export function PatternRecognitionDrill({
  onInspectAlgorithm,
}: PatternRecognitionDrillProps) {
  const [category, setCategory] = useState<'All' | DrillCategory>('All');
  const [difficulty, setDifficulty] = useState<'All' | 'Medium' | 'Hard'>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const [progress, setProgress] = useAccountState<DrillProgressState>(
    'algorithm-pattern-drill-v1',
    INITIAL_PROGRESS,
    'patternforge_pattern_drill_v1'
  );

  const filteredScenarios = useMemo(() => {
    return PATTERN_DRILL_SCENARIOS.filter((s) => {
      if (category !== 'All' && s.category !== category) return false;
      if (difficulty !== 'All' && s.difficulty !== difficulty) return false;
      return true;
    });
  }, [category, difficulty]);

  const safeIdx = Math.min(currentIdx, Math.max(0, filteredScenarios.length - 1));
  const scenario: PatternDrillScenario | undefined = filteredScenarios[safeIdx];
  const isAnswered = selectedOptionId !== null;
  const isCorrect = scenario ? selectedOptionId === scenario.optimalOptionId : false;

  const accuracyPct =
    progress.attempts > 0 ? Math.round((progress.correctCount / progress.attempts) * 100) : 0;

  const handleSelectOption = (optionId: string) => {
    if (!scenario || isAnswered) return;
    setSelectedOptionId(optionId);
    const hit = optionId === scenario.optimalOptionId;
    setProgress((prev) => {
      const nextStreak = hit ? prev.streak + 1 : 0;
      const nextSolved =
        hit && !prev.solvedIds.includes(scenario.id)
          ? [...prev.solvedIds, scenario.id]
          : prev.solvedIds;
      return {
        solvedIds: nextSolved,
        attempts: prev.attempts + 1,
        correctCount: prev.correctCount + (hit ? 1 : 0),
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });
  };

  const handleGoToScenario = (idx: number) => {
    setCurrentIdx(idx);
    setSelectedOptionId(null);
  };

  const handleNext = () => {
    if (filteredScenarios.length === 0) return;
    const nextIdx = (safeIdx + 1) % filteredScenarios.length;
    handleGoToScenario(nextIdx);
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
      {/* Header & Persisted Mastery Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            <Target className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Interactive Algorithm Selection Lab · 20 FAANG Trap Scenarios</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pattern Recognition &amp; Constraint-Trap Drill
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-[68ch]">
            Read the interview prompt and constraints, pick the optimal algorithm before coding, and inspect exactly why every tempting distractor fails (TLE or wrong answer).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums">
          <div>
            Mastered:{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {progress.solvedIds.length} / {PATTERN_DRILL_SCENARIOS.length}
            </span>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            Accuracy:{' '}
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{accuracyPct}%</span>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            Streak:{' '}
            <span className="font-bold text-sky-700 dark:text-sky-400">{progress.streak}</span>
            <span className="text-slate-400"> (best {progress.bestStreak})</span>
          </div>
        </div>
      </div>

      {/* Category & Difficulty Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setCurrentIdx(0);
                setSelectedOptionId(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                category === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
            {(['All', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setDifficulty(diff);
                  setCurrentIdx(0);
                  setSelectedOptionId(null);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  difficulty === diff
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setProgress(INITIAL_PROGRESS);
              setSelectedOptionId(null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors"
            title="Reset drill progress"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Split: Scenario Queue + Active Challenge Stage */}
      {scenario ? (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
          {/* Scenario Sidebar List */}
          <div className="max-h-[540px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredScenarios.map((item, idx) => {
              const solved = progress.solvedIds.includes(item.id);
              const active = idx === safeIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleGoToScenario(idx)}
                  className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-start gap-2.5 ${
                    active
                      ? 'bg-sky-50/90 dark:bg-sky-950/40'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold text-slate-400 tabular-nums pt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span
                        className={
                          item.difficulty === 'Hard'
                            ? 'text-rose-700 dark:text-rose-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }
                      >
                        {item.difficulty}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{solved ? 'Mastered' : 'Unsolved'}</span>
                    </span>
                  </span>
                  {solved && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Drill Stage */}
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  Scenario {safeIdx + 1} / {filteredScenarios.length} · {scenario.category} ·{' '}
                  <span
                    className={
                      scenario.difficulty === 'Hard'
                        ? 'text-rose-700 dark:text-rose-400 font-semibold'
                        : 'text-amber-700 dark:text-amber-400 font-semibold'
                    }
                  >
                    {scenario.difficulty}
                  </span>
                </span>
                <span className="text-sky-700 dark:text-sky-400 font-semibold">
                  {scenario.constraints}
                </span>
              </div>

              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                {scenario.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 max-w-[70ch]">
                {scenario.prompt}
              </p>
            </div>

            {/* 4 Candidate Algorithm Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenario.options.map((opt, idx) => {
                const isThisSelected = selectedOptionId === opt.id;
                const isThisOptimal = opt.id === scenario.optimalOptionId;

                let stateClass =
                  'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400';
                if (isAnswered) {
                  if (isThisOptimal) {
                    stateClass =
                      'border-emerald-400 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30';
                  } else if (isThisSelected) {
                    stateClass =
                      'border-rose-400 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/30';
                  } else {
                    stateClass =
                      'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 opacity-85';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`text-left rounded-xl border p-4 transition-colors space-y-2 ${stateClass}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        <span className="font-mono text-xs text-slate-400 tabular-nums">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{opt.label}</span>
                      </span>
                      {isAnswered && isThisOptimal && (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {isAnswered && isThisSelected && !isThisOptimal && (
                        <XCircle
                          className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {isAnswered && opt.failureReason && (
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-rose-700 dark:text-rose-400">
                          Why it fails:{' '}
                        </span>
                        {opt.failureReason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dual-Coded Explanation & Direct Studio Jump */}
            {isAnswered && (
              <div
                className={`rounded-xl border p-4 space-y-3 ${
                  isCorrect
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      <span className="text-emerald-800 dark:text-emerald-300">
                        Exact Specialist Selection — Optimal Invariant Matched
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                      <span className="text-amber-900 dark:text-amber-300">
                        Trap Caught — Review Why the Optimal Pattern Wins
                      </span>
                    </>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {scenario.correctWhy}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectAlgorithm(scenario.optimalAlgorithmId, 'mental')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-500 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                      Visualize Algorithm
                    </button>
                    <button
                      type="button"
                      onClick={() => onInspectAlgorithm(scenario.optimalAlgorithmId, 'practice')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-500 transition-colors"
                    >
                      Code Unit Tests
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors"
                  >
                    Next Scenario
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">
          No scenarios match the selected filters.
        </div>
      )}
    </section>
  );
}
