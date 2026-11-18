import { useState } from 'react';
import {
  Award,
  Brain,
  CalendarClock,
  CheckCircle2,
  Grid3X3,
  Layers,
  Lock,
  Play,
  RotateCcw,
} from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { CURRICULUM_PATTERNS, CURRICULUM_TIERS } from '../../data/curriculum';
import { RankTier } from '../../types/dsa';

const RANKS: {
  rank: RankTier;
  num: string;
  topics: string;
  quizId: string;
  problemId: string;
}[] = [
  {
    rank: 'Noob',
    num: 'Rank 1',
    topics: 'Arrays, Strings, HashMaps & Paper Dry-Runs',
    quizId: 'sliding-window',
    problemId: 'two-sum',
  },
  {
    rank: 'Apprentice',
    num: 'Rank 2',
    topics: 'Brute Force -> HashMap & Prefix Sum Compression',
    quizId: 'sliding-window',
    problemId: 'two-sum',
  },
  {
    rank: 'Practitioner',
    num: 'Rank 3',
    topics: 'Two Pointers, Sliding Window, Binary Search, Monotonic Stack',
    quizId: 'monotonic-stack',
    problemId: 'longest-substring',
  },
  {
    rank: 'Strategist',
    num: 'Rank 4',
    topics: 'Linked Lists, Trees BFS/DFS, Heaps, Graphs & Topo Sort',
    quizId: 'graph-topo-sort',
    problemId: 'trapping-rain-water',
  },
  {
    rank: 'Pro',
    num: 'Rank 5',
    topics: 'Backtracking, 1D/2D DP (SRTBOT), Union-Find, Segment Trees',
    quizId: 'dp-1d',
    problemId: 'coin-change',
  },
];

export function NoobToProSkillTree() {
  const brainProfile = usePatternForgeStore((s) => s.brainProfile);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const openTopicQuiz = usePatternForgeStore((s) => s.openTopicQuiz);

  // Rank 0 Warmup state
  const [warmupTab, setWarmupTab] = useState<'grid' | 'digits' | 'recursion'>('grid');
  const [gridN, setGridN] = useState(4);
  const [gridCursor, setGridCursor] = useState(0);
  const [digitNum, setDigitNum] = useState(4729);
  const [digitSteps, setDigitSteps] = useState<{ rem: number; q: number }[]>([]);
  const [recStep, setRecStep] = useState(3);
  const [tierFilter, setTierFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const currentRankIndex = RANKS.findIndex((r) => r.rank === brainProfile.currentTier);
  const accuracy = brainProfile.cognitiveMetrics.logicAssemblyAccuracy;

  const filteredPatterns = CURRICULUM_PATTERNS.filter((p) => {
    if (tierFilter === 'easy') return p.tier <= 2;
    if (tierFilter === 'medium') return p.tier === 3 || p.tier === 4;
    if (tierFilter === 'hard') return p.tier >= 5;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Today's 1-3-7-21 Brain Recall Banner */}
      <section className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
              <CalendarClock className="w-4 h-4" aria-hidden="true" />
              TODAY’S 1–3–7–21 SPACED REPETITION RECALL
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {brainProfile.spacedRepetitionQueue.length} Scheduled Pattern Review(s)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Recall mode shuffles logic blocks, hides hints, and tests a modified constraint twist to build permanent pattern reflexes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {brainProfile.spacedRepetitionQueue.slice(0, 2).map((item) => (
              <div
                key={item.problemId}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-2 max-w-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.problemTitle}
                    </span>
                    <span className="text-sky-600 dark:text-sky-400">
                      Day {item.intervalStage} Stage
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Twist: {item.twistConstraint}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => selectProblem(item.problemId, { recallMode: true })}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors"
                >
                  <Play className="w-3 h-3" aria-hidden="true" />
                  Launch Zero-Hint Recall
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cognitive Telemetry Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Signal Recognition',
            value: `${brainProfile.cognitiveMetrics.signalRecognitionScore}%`,
            note: 'Problem text -> pattern accuracy',
          },
          {
            label: 'Bottleneck Diagnosis',
            value: `${brainProfile.cognitiveMetrics.bottleneckDiagnosisScore}%`,
            note: 'Spotting O(N²) redundant work',
          },
          {
            label: 'Logic Assembly Accuracy',
            value: `${accuracy}%`,
            note: 'Gate requires >= 80% for Rank-Up',
          },
          {
            label: 'Paper Dry-Run Streak',
            value: `${brainProfile.cognitiveMetrics.paperDryRunStreak}`,
            note: 'Solved manually before coding',
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</p>
            <p className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
              {metric.value}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{metric.note}</p>
          </div>
        ))}
      </section>

      {/* Rank 0: Logic & Loop Warmup (Namaste DSA / Striver Style) */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              RANK 0 · LOGIC & LOOP WARMUP (NAMASTE DSA / STRIVER FOUNDATION)
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Build Loop, Modulo & Call-Stack Reflexes Before Arrays
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: 'grid', label: 'Nested Loop Grid' },
                { id: 'digits', label: 'Digit Extraction (% /)' },
                { id: 'recursion', label: 'Recursion Stack' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setWarmupTab(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  warmupTab === t.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {warmupTab === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <label htmlFor="warmup-grid-n" className="text-slate-700 dark:text-slate-300">
                  Pattern Size N = {gridN}
                </label>
                <span className="text-slate-500">
                  row = {Math.floor(gridCursor / gridN)}, col = {gridCursor % gridN}
                </span>
              </div>
              <input
                id="warmup-grid-n"
                type="range"
                min={3}
                max={6}
                value={gridN}
                onChange={(e) => {
                  setGridN(Number(e.target.value));
                  setGridCursor(0);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs leading-5">
{`for (int row = 0; row < ${gridN}; row++) {
  for (int col = 0; col <= row; col++) {
    print("*"); // Active when col <= row
  }
}`}
              </pre>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGridCursor((c) => (c + 1) % (gridN * gridN))}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold"
                >
                  Step (row, col)
                </button>
                <button
                  type="button"
                  onClick={() => setGridCursor(0)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>

            <div
              className="grid gap-1.5 max-w-xs mx-auto"
              style={{ gridTemplateColumns: `repeat(${gridN}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: gridN * gridN }, (_, idx) => {
                const r = Math.floor(idx / gridN);
                const c = idx % gridN;
                const isStar = c <= r;
                const isActive = idx === gridCursor;
                return (
                  <div
                    key={idx}
                    className={`w-11 h-11 rounded-md border flex items-center justify-center font-mono text-sm font-bold ${
                      isActive
                        ? 'border-sky-500 bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100'
                        : isStar
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {isStar ? '*' : '·'}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {warmupTab === 'digits' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                Current n = {digitNum}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={digitNum === 0}
                  onClick={() => {
                    const rem = digitNum % 10;
                    const q = Math.floor(digitNum / 10);
                    setDigitSteps((prev) => [...prev, { rem, q }]);
                    setDigitNum(q);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40"
                >
                  Extract Last Digit (n % 10, n / 10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDigitNum(4729);
                    setDigitSteps([]);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {digitSteps.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click "Extract Last Digit" to peel digits one-by-one from right to left.
                </p>
              ) : (
                digitSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                  >
                    Step {idx + 1}: digit = <strong>{s.rem}</strong> → next n = {s.q}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {warmupTab === 'recursion' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                Call Stack Depth for factorial({recStep})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecStep((n) => Math.max(1, n - 1))}
                  className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-mono"
                >
                  Pop Frame
                </button>
                <button
                  type="button"
                  onClick={() => setRecStep((n) => Math.min(5, n + 1))}
                  className="px-3 py-1 rounded-md bg-sky-600 text-white text-xs font-mono font-semibold"
                >
                  Push Frame
                </button>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-1.5 max-w-sm">
              {Array.from({ length: recStep }, (_, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 font-mono text-xs flex justify-between"
                >
                  <span>fact({idx + 1})</span>
                  <span className="text-slate-500">
                    {idx === 0 ? 'Base Case -> returns 1' : `waits for fact(${idx})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5-Rank Mastery Gatekeeper */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Noob-to-Pro Mastery Gatekeeper
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {RANKS.map((item, idx) => {
            const isCurrent = item.rank === brainProfile.currentTier;
            const isUnlocked = idx <= currentRankIndex;
            const quizPassed = brainProfile.passedTopicQuizzes.includes(item.quizId);

            return (
              <div
                key={item.rank}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-4 ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30'
                    : isUnlocked
                      ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">{item.num}</span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {item.rank}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.topics}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => selectProblem(item.problemId)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    Practice Lab
                  </button>
                  <button
                    type="button"
                    onClick={() => openTopicQuiz(item.quizId)}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {quizPassed ? 'Quiz Passed (Retake)' : 'Take Gate Quiz'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Complete 6-Tier, 18-Pattern Curriculum Matrix */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              20 Core Algorithmic Patterns (Easy → Hardest)
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All 20 Patterns' },
                { id: 'easy', label: 'Tier 1–2 Easy' },
                { id: 'medium', label: 'Tier 3–4 Med' },
                { id: 'hard', label: 'Tier 5–6 Hardest' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTierFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  tierFilter === f.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatterns.map((pattern) => {
            const tierInfo = CURRICULUM_TIERS.find((t) => t.tier === pattern.tier);
            return (
              <div
                key={pattern.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{pattern.tierLabel}</span>
                    <span className="font-mono text-sky-700 dark:text-sky-400 font-semibold">
                      {pattern.timeComplexity} · {pattern.spaceComplexity}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {pattern.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {pattern.topicGroup} — {tierInfo?.focusSummary}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                      PROBLEM READING SIGNAL CLUES
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {pattern.signalClues.map((clue) => (
                        <li key={clue}>• {clue}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="text-rose-700 dark:text-rose-400">
                      <span className="font-mono font-semibold">Brute:</span> {pattern.bruteProgression}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-400">
                      <span className="font-mono font-semibold">Optimal:</span> {pattern.optimalProgression}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {pattern.canonicalProblems.join(' · ')}
                  </span>
                  {pattern.linkedProblemId ? (
                    <button
                      type="button"
                      onClick={() => selectProblem(pattern.linkedProblemId!)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold shrink-0 hover:bg-slate-800 dark:hover:bg-sky-400"
                    >
                      Open Lab
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
                      <Brain className="w-3 h-3" aria-hidden="true" />
                      Reference
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
