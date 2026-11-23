import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  Eye,
  EyeOff,
  GitBranch,
  History,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  VERSION_EVOLUTION_TOPICS,
  type EvolutionTrack,
} from '../../data/versionEvolutionData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { CopyButton, SegmentedTabBar } from '../ui';

interface VersionEvolutionPlaygroundProps {
  completedGoalIds: string[];
  onToggleGoalComplete: (id: string) => void;
}

const TRACK_LABELS: Record<EvolutionTrack, string> = {
  'java-to-java': '1. Java -> Java Versions',
  'python-to-python': '2. Python -> Python Versions',
  'java-to-python': '3. Java -> Python Correlated',
};

export const VersionEvolutionPlayground: React.FC<VersionEvolutionPlaygroundProps> = ({
  completedGoalIds,
  onToggleGoalComplete,
}) => {
  const [activeTrack, setActiveTrack] = useState<'all' | EvolutionTrack>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(VERSION_EVOLUTION_TOPICS[0].id);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [compareBaselineIdx, setCompareBaselineIdx] = useState<number>(0);
  const [goalDrafts, setGoalDrafts] = useState<Record<string, string>>({});
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [quizChoices, setQuizChoices] = useState<Record<string, string>>({});

  const visibleTopics = useMemo(
    () =>
      activeTrack === 'all'
        ? VERSION_EVOLUTION_TOPICS
        : VERSION_EVOLUTION_TOPICS.filter((t) => t.track === activeTrack),
    [activeTrack]
  );

  const activeTopic = useMemo(
    () => visibleTopics.find((t) => t.id === selectedTopicId) ?? visibleTopics[0],
    [visibleTopics, selectedTopicId]
  );

  useEffect(() => {
    setCompareBaselineIdx(0);
    setActiveStageIdx(Math.max(0, activeTopic.stages.length - 1));
    setShowSolution(false);
  }, [activeTopic.id, activeTopic.stages.length]);

  const baselineStage =
    activeTopic.stages[Math.min(compareBaselineIdx, activeTopic.stages.length - 1)];
  const targetStage =
    activeTopic.stages[Math.min(activeStageIdx, activeTopic.stages.length - 1)];

  const goal = activeTopic.microGoal;
  const code = goalDrafts[goal.id] ?? goal.starterCode;

  const evalGoal = useMemo(() => {
    const checks = goal.rules.map((r) => ({
      ...r,
      passed: r.test(code),
    }));
    const passedCount = checks.filter((c) => c.passed).length;
    return {
      checks,
      passedCount,
      total: checks.length,
      allPassed: passedCount === checks.length,
    };
  }, [goal, code]);

  const isGoalDone = completedGoalIds.includes(goal.id);

  useEffect(() => {
    if (evalGoal.allPassed && !isGoalDone) {
      onToggleGoalComplete(goal.id);
    }
  }, [evalGoal.allPassed, isGoalDone, goal.id, onToggleGoalComplete]);

  const totalGoalsSolved = VERSION_EVOLUTION_TOPICS.filter((t) =>
    completedGoalIds.includes(t.microGoal.id)
  ).length;

  const pickedQuiz = quizChoices[activeTopic.correlatedQuiz.id];

  const updateCode = (next: string) => {
    setGoalDrafts((prev) => ({ ...prev, [goal.id]: next }));
  };

  return (
    <div className="space-y-5">
      {/* Header & Track Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <History className="w-3.5 h-3.5" aria-hidden="true" />
                Version-Level Syntax, Statement &amp; Style Evolution
              </span>
              <span aria-hidden="true">·</span>
              <span>Java 1+ &rarr; 21+ · Python 0+/2 &rarr; 3.13+ · Cross-Language Correlation</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {totalGoalsSolved}/{VERSION_EVOLUTION_TOPICS.length} Micro-Goals Achieved
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
              Language Version Evolution, Correlated Quizzes &amp; Micro-Goal Playground
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
              Master how statements, idioms, and features evolved first within Java (1+ &rarr; 5 &rarr; 8 &rarr; 17 &rarr; 21), next within Python (2 &rarr; 3.0 &rarr; 3.6 &rarr; 3.10 &rarr; 3.13+), and finally correlated across Java &rarr; Python—then lock it in with small achievable coding goals.
            </p>
          </div>

          <SegmentedTabBar<'all' | EvolutionTrack>
            ariaLabel="Select language version evolution track"
            activeTab={activeTrack}
            onChange={(t) => {
              setActiveTrack(t);
              const first =
                t === 'all'
                  ? VERSION_EVOLUTION_TOPICS[0]
                  : VERSION_EVOLUTION_TOPICS.find((item) => item.track === t);
              if (first) setSelectedTopicId(first.id);
            }}
            size="xs"
            wrap
            tabs={[
              { id: 'all', label: `All Tracks (${VERSION_EVOLUTION_TOPICS.length})` },
              { id: 'java-to-java', label: 'Java -> Java' },
              { id: 'python-to-python', label: 'Python -> Python' },
              { id: 'java-to-python', label: 'Java -> Python' },
            ]}
          />
        </div>
      </section>

      {/* Main Split: Syllabus (4 cols) + Evolution Workspace (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Evolution Milestones
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {visibleTopics.length} topics
            </span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleTopics.map((topic) => {
              const selected = topic.id === activeTopic.id;
              const goalDone = completedGoalIds.includes(topic.microGoal.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                    selected
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-xs tabular-nums font-semibold w-6 shrink-0 ${
                      selected
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {String(topic.number).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {topic.shortTitle}
                      </span>
                      {goalDone && (
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                          aria-label="Micro-goal achieved"
                        />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {TRACK_LABELS[topic.track]} · {topic.stages.length} eras
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Interactive Stage */}
        <div className="xl:col-span-8 space-y-5">
          {/* 1. Overview & Interactive Era Selector */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-sky-700 dark:text-sky-400">
                  {TRACK_LABELS[activeTopic.track]}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeTopic.category}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
                {activeTopic.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
                {activeTopic.summary}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 text-xs leading-5 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Why This Feature Evolved:{' '}
              </span>
              {activeTopic.whyItEvolved}
            </div>

            {/* Interactive Timeline Stepper Buttons */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Select Version Era to Inspect &amp; Compare
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Left: Baseline ({baselineStage.versionLabel}) · Right: Target ({targetStage.versionLabel})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeTopic.stages.map((st, idx) => {
                  const isTarget = idx === activeStageIdx;
                  const isBase = idx === compareBaselineIdx;
                  return (
                    <button
                      key={st.versionLabel}
                      type="button"
                      onClick={() => {
                        if (idx === 0 && activeTopic.stages.length > 1) {
                          setCompareBaselineIdx(0);
                          setActiveStageIdx(1);
                        } else {
                          setCompareBaselineIdx(Math.max(0, idx - 1));
                          setActiveStageIdx(idx);
                        }
                      }}
                      className={`text-left rounded-lg border p-3 transition-colors ${
                        isTarget
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                          : isBase
                            ? 'border-amber-400 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                        <span className="font-semibold text-sky-700 dark:text-sky-400">
                          {st.versionLabel}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {isTarget ? 'Target' : isBase ? 'Baseline' : `Era ${idx + 1}`}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                        {st.eraTag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Before -> After Version Code Diff */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-slate-50/40 dark:bg-slate-950/50 p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-amber-800 dark:text-amber-300">
                      {baselineStage.versionLabel}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400"> · {baselineStage.eraTag}</span>
                  </div>
                  <CopyButton text={baselineStage.code} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 text-amber-200 font-mono text-xs leading-5 overflow-x-auto border border-slate-800 flex-1">
                  {baselineStage.code}
                </pre>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Runtime Note:</strong>{' '}
                  {baselineStage.runtimeImpact}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15 p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="inline-flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                      {targetStage.versionLabel}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400"> · {targetStage.eraTag}</span>
                  </div>
                  <CopyButton text={targetStage.code} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800 flex-1">
                  {targetStage.code}
                </pre>
                <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 list-disc pl-4">
                  {targetStage.syntaxChanges.map((ch) => (
                    <li key={ch}>{ch}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Evolution Mermaid Flow Diagram */}
          <FlightMermaidViewer
            title={`${activeTopic.shortTitle} — Version Progression Map (Mermaid.js)`}
            subtitle="Visual correlation showing how syntax, type safety, and runtime abstractions progressed across versions."
            mermaidCode={activeTopic.mermaidDfd}
            trafficDomain="system-design"
            compact
          />

          {/* 3. Correlated Quiz Check */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Correlated Version Understanding Quiz
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {activeTopic.correlatedQuiz.question}
            </p>
            <div className="space-y-2">
              {activeTopic.correlatedQuiz.options.map((opt) => {
                const picked = pickedQuiz === opt.id;
                const isCorrect = opt.id === activeTopic.correlatedQuiz.correctId;
                const revealed = Boolean(pickedQuiz);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setQuizChoices((prev) => ({
                        ...prev,
                        [activeTopic.correlatedQuiz.id]: opt.id,
                      }))
                    }
                    className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs transition-colors ${
                      revealed && isCorrect
                        ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                        : revealed && picked && !isCorrect
                          ? 'border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
            {pickedQuiz && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <strong className="text-slate-900 dark:text-slate-100">
                  {pickedQuiz === activeTopic.correlatedQuiz.correctId ? 'Correct: ' : 'Takeaway: '}
                </strong>
                {activeTopic.correlatedQuiz.explanation}
              </div>
            )}
          </section>

          {/* 4. Interactive Micro-Goal Playground */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <Target className="w-3.5 h-3.5" aria-hidden="true" />
                  Small Achievable Goal Playground ({goal.language === 'java' ? 'Java' : 'Python'})
                </div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {goal.goalTitle}
                </h4>
              </div>
              <span
                className={`text-xs font-mono font-semibold tabular-nums ${
                  evalGoal.allPassed
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {evalGoal.passedCount}/{evalGoal.total} Goals Met
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">{goal.prompt}</p>

                <div className="flex flex-wrap gap-1.5">
                  {goal.quickSnippets.map((sn) => (
                    <button
                      key={sn.label}
                      type="button"
                      onClick={() => updateCode(sn.snippet)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                    >
                      <Code2 className="w-3 h-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      {sn.label}
                    </button>
                  ))}
                </div>

                <textarea
                  aria-label={`Micro-goal editor for ${goal.goalTitle}`}
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-sky-200 font-mono text-xs leading-6 p-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSolution((v) => !v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      {showSolution ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                          Hide Solution
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          Show Reference
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCode(goal.referenceSolution)}
                      className="px-3 py-1.5 rounded-lg border border-sky-500/60 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/70 whitespace-nowrap"
                    >
                      Load Solution
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateCode(goal.starterCode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reset
                  </button>
                </div>

                {showSolution && (
                  <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                    {goal.referenceSolution}
                  </pre>
                )}
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div
                  className={`rounded-lg border p-3 text-xs font-semibold flex items-center justify-between ${
                    evalGoal.allPassed
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{evalGoal.allPassed ? 'Goal Achieved!' : 'Goal Verification Checklist'}</span>
                  <span className="font-mono tabular-nums">
                    {evalGoal.passedCount}/{evalGoal.total}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                  {evalGoal.checks.map((chk) => (
                    <div key={chk.id} className="p-3 flex items-start gap-2.5 text-xs">
                      {chk.passed ? (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <div className="space-y-0.5">
                        <div
                          className={`font-semibold ${
                            chk.passed
                              ? 'text-emerald-800 dark:text-emerald-300'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {chk.label}
                        </div>
                        {!chk.passed && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Hint: {chk.hint}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
