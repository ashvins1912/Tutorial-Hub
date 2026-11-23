import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Code2,
  Cpu,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import {
  JAVA_TO_PYTHON_MODULES,
  type ThinkingTier,
} from '../../data/javaToPythonThinkingData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton, SegmentedTabBar } from '../ui';

interface JavaToPythonThinkingLabProps {
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}

type PythonCompareView = 'pythonic' | 'antipattern';
type PracticeSubTab = 'refactor' | 'check';

export const JavaToPythonThinkingLab: React.FC<JavaToPythonThinkingLabProps> = ({
  completedIds,
  onToggleComplete,
}) => {
  const [tierFilter, setTierFilter] = useState<'All' | ThinkingTier>('All');
  const [selectedId, setSelectedId] = useState<string>(JAVA_TO_PYTHON_MODULES[0].id);
  const [pythonView, setPythonView] = useState<PythonCompareView>('pythonic');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [practiceTab, setPracticeTab] = useState<PracticeSubTab>('refactor');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showLiveFlow, setShowLiveFlow] = useState<boolean>(false);

  const visibleModules = useMemo(
    () =>
      tierFilter === 'All'
        ? JAVA_TO_PYTHON_MODULES
        : JAVA_TO_PYTHON_MODULES.filter((m) => m.tier === tierFilter),
    [tierFilter]
  );

  const activeModule = useMemo(
    () => visibleModules.find((m) => m.id === selectedId) ?? visibleModules[0],
    [visibleModules, selectedId]
  );

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
    setPythonView('pythonic');
    setShowSolution(false);
  }, [activeModule.id]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % activeModule.traceSteps.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeModule.traceSteps.length, prefersReducedMotion]);

  const activeStep =
    activeModule.traceSteps[Math.min(stepIdx, activeModule.traceSteps.length - 1)];

  const draftCode = drafts[activeModule.id] ?? activeModule.refactorDrill.starterCode;
  const evalResults = useMemo(() => {
    const checks = activeModule.refactorDrill.rules.map((r) => ({
      ...r,
      passed: r.test(draftCode),
    }));
    const passedCount = checks.filter((c) => c.passed).length;
    return {
      checks,
      passedCount,
      total: checks.length,
      allPassed: passedCount === checks.length,
    };
  }, [activeModule, draftCode]);

  const isCompleted = completedIds.includes(activeModule.id);

  useEffect(() => {
    if (evalResults.allPassed && !isCompleted) {
      onToggleComplete(activeModule.id);
    }
  }, [evalResults.allPassed, isCompleted, activeModule.id, onToggleComplete]);

  const completedCount = JAVA_TO_PYTHON_MODULES.filter((m) =>
    completedIds.includes(m.id)
  ).length;

  const pickedChoice = quizAnswers[activeModule.id];

  const updateDraft = (next: string) => {
    setDrafts((prev) => ({ ...prev, [activeModule.id]: next }));
  };

  return (
    <div className="space-y-5">
      {/* Studio Overview & Tier Filter */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Interactive Java-to-Python Thinking Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>Java 1+ Core to Python 0+ Core &amp; Modern</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {completedCount}/{JAVA_TO_PYTHON_MODULES.length} Mindsets Mastered
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
              How to Think in Python When You Know Java (Zero-to-Fluent Bridge)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
              Stop writing &ldquo;Java code with Python syntax.&rdquo; Compare Java habits against Java-accented Python anti-patterns and true Pythonic idioms, step through animated runtime memory differences, and refactor live drills.
            </p>
          </div>

          <SegmentedTabBar<'All' | ThinkingTier>
            ariaLabel="Filter Java to Python thinking modules by tier"
            activeTab={tierFilter}
            onChange={(t) => {
              setTierFilter(t);
              const first =
                t === 'All'
                  ? JAVA_TO_PYTHON_MODULES[0]
                  : JAVA_TO_PYTHON_MODULES.find((m) => m.tier === t);
              if (first) setSelectedId(first.id);
            }}
            size="xs"
            wrap
            tabs={[
              { id: 'All', label: `All (${JAVA_TO_PYTHON_MODULES.length})` },
              { id: 'Mindset Shift', label: 'Mindset' },
              { id: 'Core Idioms', label: 'Idioms' },
              { id: 'Data & Flow', label: 'Data & Flow' },
              { id: 'OOP & Safety', label: 'OOP & Safety' },
              { id: 'Runtime & Scale', label: 'Dunders' },
            ]}
          />
        </div>
      </section>

      {/* Two-Zone Layout: Syllabus (Left 4) + Interactive Stage (Right 8) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Syllabus Sidebar */}
        <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              10 Concrete Mindset Shifts
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {visibleModules.length} modules
            </span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[760px] overflow-y-auto">
            {visibleModules.map((mod) => {
              const active = mod.id === activeModule.id;
              const done = completedIds.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedId(mod.id)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                    active
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-xs tabular-nums font-semibold w-6 shrink-0 ${
                      active
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {String(mod.number).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold leading-snug text-slate-900 dark:text-slate-100">
                        {mod.shortTitle}
                      </span>
                      {done && (
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                          aria-label="Mastered"
                        />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {mod.tier} · {mod.versionScope}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Interactive Learning Stage */}
        <div className="xl:col-span-8 space-y-5">
          {/* 1. Header, Habit -> Principle Bridge, Analogy & Formal Definition */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                    Shift {String(activeModule.number).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeModule.tier}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{activeModule.versionScope}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
                  {activeModule.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onToggleComplete(activeModule.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isCompleted
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {isCompleted ? 'Mastered' : 'Mark Mastered'}
              </button>
            </div>

            {/* Java Habit -> Pythonic Principle Callout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Typical Java Habit
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                  {activeModule.javaHabit}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Pythonic Way of Thinking
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                  {activeModule.pythonicPrinciple}
                </p>
              </div>
            </div>

            {/* Simple Analogy + Formal Definition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Mental Model Analogy
                </div>
                <p className="text-slate-600 dark:text-slate-300">{activeModule.plainEnglishAnalogy}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Formal Language &amp; Runtime Specification
                </div>
                <p className="text-slate-600 dark:text-slate-300">{activeModule.formalExplanation}</p>
              </div>
            </div>
          </section>

          {/* 2. Side-by-Side 3-Way Code Comparison */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Java vs. Python Code Comparison
              </div>
              <SegmentedTabBar<PythonCompareView>
                ariaLabel="Toggle Python panel between Pythonic code and Java-accented anti-pattern"
                activeTab={pythonView}
                onChange={setPythonView}
                size="xs"
                tabs={[
                  { id: 'pythonic', label: 'True Pythonic Code', icon: ShieldCheck },
                  { id: 'antipattern', label: 'Java-Accented Python (Avoid)', icon: AlertTriangle },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    Java (1+ Core)
                  </span>
                  <CopyButton text={activeModule.javaCode} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-sky-200 font-mono text-xs leading-5 overflow-x-auto border border-slate-800 flex-1">
                  {activeModule.javaCode}
                </pre>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono font-semibold ${
                      pythonView === 'pythonic'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {pythonView === 'pythonic'
                      ? 'Pythonic Thinking (Recommended)'
                      : 'Java-Accented Python (Trap)'}
                  </span>
                  <CopyButton
                    text={
                      pythonView === 'pythonic'
                        ? activeModule.pythonicCode
                        : activeModule.javaAccentedPython
                    }
                    label="Copy"
                    copiedLabel="Copied"
                    size="xs"
                  />
                </div>
                <pre
                  className={`p-4 rounded-xl bg-slate-950 font-mono text-xs leading-5 overflow-x-auto border flex-1 ${
                    pythonView === 'pythonic'
                      ? 'text-emerald-300 border-slate-800'
                      : 'text-amber-200 border-amber-700/60'
                  }`}
                >
                  {pythonView === 'pythonic'
                    ? activeModule.pythonicCode
                    : activeModule.javaAccentedPython}
                </pre>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 text-xs leading-5 ${
                pythonView === 'pythonic'
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {pythonView === 'pythonic' ? 'Why Pythonic Wins: ' : 'Why Literal Translation Hurts: '}
              </span>
              {pythonView === 'pythonic'
                ? activeModule.whyPythonicWins
                : activeModule.whyAntiPatternHurts}
            </div>

            {/* Translation Cheat-Sheet Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                    <th className="py-2 px-3.5 font-semibold">Java Instinct</th>
                    <th className="py-2 px-3.5 font-semibold">Pythonic Equivalent</th>
                    <th className="py-2 px-3.5 font-semibold">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeModule.keyMentalShifts.map((row) => (
                    <tr key={row.javaWay}>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-amber-800 dark:text-amber-300">
                        {row.javaWay}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                        {row.pythonWay}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Animated Step-by-Step Runtime Mental Model Visualizer */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  <span>Animated JVM vs. Python Runtime Stepper</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Step {stepIdx + 1} / {activeModule.traceSteps.length}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeStep?.title}
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {isPlaying ? 'Pause' : 'Animate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(
                      (p) => (p - 1 + activeModule.traceSteps.length) % activeModule.traceSteps.length
                    );
                  }}
                  aria-label="Previous step"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx((p) => (p + 1) % activeModule.traceSteps.length);
                  }}
                  aria-label="Next step"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(0);
                  }}
                  aria-label="Reset animation"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Stage Progress Bar */}
            <div className="px-4 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeModule.traceSteps.map((st, idx) => (
                <button
                  key={st.stepNumber}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(idx);
                  }}
                  className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                    idx === stepIdx
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 font-semibold text-slate-900 dark:text-slate-100'
                      : idx < stepIdx
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <div className="font-mono text-[10px] tabular-nums">
                    Stage {st.stepNumber} · {st.stage}
                  </div>
                  <div className="truncate mt-0.5">{st.title}</div>
                </button>
              ))}
            </div>

            {activeStep && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-5">
                <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-3.5 space-y-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-300">
                    Inside Java (JVM)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{activeStep.javaMentalModel}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5 space-y-1">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-300">
                    Inside Python (PVM)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{activeStep.pythonMentalModel}</p>
                </div>
                <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 p-3.5 space-y-1">
                  <div className="font-semibold text-sky-900 dark:text-sky-300">
                    Memory &amp; Speed Delta
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{activeStep.memoryDifference}</p>
                </div>
              </div>
            )}
          </section>

          {/* 4. Mermaid.js Execution & Mindset DFD + Optional Live Traffic Simulator */}
          <div className="space-y-3">
            <FlightMermaidViewer
              title={`${activeModule.shortTitle} — Execution & Mental-Model DFD (Mermaid.js)`}
              subtitle="Visualizing how Python’s protocol-driven runtime replaces Java boilerplate step by step."
              mermaidCode={activeModule.mermaidDfd}
              trafficDomain="system-design"
              compact
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowLiveFlow((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:border-sky-500 transition-colors whitespace-nowrap"
              >
                <Workflow className="w-3.5 h-3.5" aria-hidden="true" />
                {showLiveFlow
                  ? 'Hide Live Pipeline Traffic'
                  : 'Simulate Live Pipeline Traffic for This Mindset'}
              </button>
            </div>

            {showLiveFlow && (
              <LiveTrafficFlowSimulator
                mermaidCode={activeModule.mermaidDfd}
                mermaidTitle={`${activeModule.shortTitle} Execution Pipeline`}
                domain="system-design"
                compact
                heading={`Live Execution Flow — ${activeModule.shortTitle}`}
              />
            )}
          </div>

          {/* 5. Hands-On Interactive Practice: Refactor Drill + Quick Mindset Check */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                  Hands-On Confidence Builder
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                  Apply This Pythonic Mindset Interactively
                </h4>
              </div>

              <SegmentedTabBar<PracticeSubTab>
                ariaLabel="Switch between interactive code refactor drill and mindset check"
                activeTab={practiceTab}
                onChange={setPracticeTab}
                size="xs"
                tabs={[
                  {
                    id: 'refactor',
                    label: `Interactive Refactor (${evalResults.passedCount}/${evalResults.total})`,
                  },
                  { id: 'check', label: 'Mindset Check' },
                ]}
              />
            </div>

            {practiceTab === 'refactor' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Task: </span>
                    {activeModule.refactorDrill.prompt}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {activeModule.refactorDrill.quickBlocks.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => updateDraft(b.snippet)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-800 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    aria-label={`Refactor editor for ${activeModule.shortTitle}`}
                    value={draftCode}
                    onChange={(e) => updateDraft(e.target.value)}
                    rows={8}
                    spellCheck={false}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-emerald-200 font-mono text-xs leading-6 p-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                            Show Solution
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDraft(activeModule.refactorDrill.referenceSolution)}
                        className="px-3 py-1.5 rounded-lg border border-sky-500/60 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/70 whitespace-nowrap"
                      >
                        Load Pythonic Solution
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateDraft(activeModule.refactorDrill.starterCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      Reset
                    </button>
                  </div>

                  {showSolution && (
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
                      {activeModule.refactorDrill.referenceSolution}
                    </pre>
                  )}
                </div>

                {/* Live Verification Panel */}
                <div className="lg:col-span-5 space-y-3">
                  <div
                    className={`rounded-lg border p-3 text-xs font-semibold flex items-center justify-between ${
                      evalResults.allPassed
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>
                      {evalResults.allPassed
                        ? 'Pythonic Mindset Verified'
                        : 'Live Idiom Verification'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {evalResults.passedCount}/{evalResults.total}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                    {evalResults.checks.map((chk) => (
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
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeModule.mindsetCheck.question}
                </p>
                <div className="space-y-2">
                  {activeModule.mindsetCheck.options.map((opt) => {
                    const picked = pickedChoice === opt.id;
                    const isCorrect = opt.id === activeModule.mindsetCheck.correctId;
                    const revealed = Boolean(pickedChoice);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({ ...prev, [activeModule.id]: opt.id }));
                          if (isCorrect && !isCompleted) {
                            onToggleComplete(activeModule.id);
                          }
                        }}
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
                {pickedChoice && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {pickedChoice === activeModule.mindsetCheck.correctId
                        ? 'Spot On: '
                        : 'Explanation: '}
                    </span>
                    {activeModule.mindsetCheck.explanation}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
