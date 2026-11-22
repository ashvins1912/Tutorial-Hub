import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  JAVA_PYTHON_MASTERY_LESSONS,
  type CodingMasteryLevel,
} from '../../data/javaPythonCodingMasteryData';
import type { LangTrack } from '../../data/languagesTutorialData';
import { CopyButton, SegmentedTabBar } from '../ui';

interface JavaPythonCodingMasteryTrackProps {
  languageFilter?: 'all' | LangTrack;
  completedIds: string[];
  onToggleComplete: (id: string) => void;
}

type CodeMode = 'idiomatic' | 'antipattern';
type FocusPane = 'split' | 'python' | 'java';

function CodeBlockWithHighlight({
  title,
  languageLabel,
  code,
  highlightLine,
  isAntiPattern,
}: {
  title: string;
  languageLabel: string;
  code: string;
  highlightLine?: number;
  isAntiPattern: boolean;
}) {
  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div
      className={`rounded-xl border overflow-hidden flex flex-col ${
        isAntiPattern
          ? 'border-amber-300 dark:border-amber-800/80 bg-white dark:bg-slate-950'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            · {languageLabel}
          </span>
        </div>
        <CopyButton text={code} label="Copy" />
      </div>

      <div className="overflow-x-auto p-3 text-xs font-mono leading-5 bg-slate-950 text-slate-100 flex-1">
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const isHighlighted = !isAntiPattern && highlightLine === lineNo;
          return (
            <div
              key={lineNo}
              className={`flex gap-3 px-2 rounded transition-colors ${
                isHighlighted
                  ? 'bg-sky-500/25 text-sky-100 ring-1 ring-inset ring-sky-400/50'
                  : 'text-slate-200'
              }`}
            >
              <span className="select-none w-5 text-right text-slate-500 tabular-nums shrink-0">
                {lineNo}
              </span>
              <span className="whitespace-pre">{line || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const JavaPythonCodingMasteryTrack: React.FC<JavaPythonCodingMasteryTrackProps> = ({
  languageFilter = 'all',
  completedIds,
  onToggleComplete,
}) => {
  const [levelFilter, setLevelFilter] = useState<'All' | CodingMasteryLevel>('All');
  const [selectedId, setSelectedId] = useState<string>(JAVA_PYTHON_MASTERY_LESSONS[0].id);
  const [focusPane, setFocusPane] = useState<FocusPane>(
    languageFilter === 'python' ? 'python' : languageFilter === 'java' ? 'java' : 'split'
  );
  const [codeMode, setCodeMode] = useState<CodeMode>('idiomatic');
  const [traceIdx, setTraceIdx] = useState<number>(0);
  const [isPlayingTrace, setIsPlayingTrace] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (languageFilter === 'python') setFocusPane('python');
    else if (languageFilter === 'java') setFocusPane('java');
    else setFocusPane('split');
  }, [languageFilter]);

  const filteredLessons = useMemo(
    () =>
      levelFilter === 'All'
        ? JAVA_PYTHON_MASTERY_LESSONS
        : JAVA_PYTHON_MASTERY_LESSONS.filter((l) => l.level === levelFilter),
    [levelFilter]
  );

  const activeLesson = useMemo(
    () => filteredLessons.find((l) => l.id === selectedId) ?? filteredLessons[0],
    [filteredLessons, selectedId]
  );

  useEffect(() => {
    setTraceIdx(0);
    setIsPlayingTrace(false);
    setCodeMode('idiomatic');
  }, [activeLesson.id]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isPlayingTrace || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setTraceIdx((prev) => (prev + 1) % activeLesson.traceSteps.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isPlayingTrace, activeLesson.traceSteps.length, prefersReducedMotion]);

  const activeTrace =
    activeLesson.traceSteps[Math.min(traceIdx, activeLesson.traceSteps.length - 1)];
  const activeQuizChoice = quizAnswers[activeLesson.id];
  const isLessonComplete = completedIds.includes(activeLesson.id);
  const completedCount = JAVA_PYTHON_MASTERY_LESSONS.filter((l) =>
    completedIds.includes(l.id)
  ).length;

  return (
    <div className="space-y-5">
      {/* Top Track Controls Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Basics to Advanced Coding Track
              </span>
              <span aria-hidden="true">·</span>
              <span>12 Progressive Engineering Lessons</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {completedCount}/{JAVA_PYTHON_MASTERY_LESSONS.length} Completed
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              Java 21+ &amp; Python 3.13+ Complete Coding Mastery
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedTabBar<'All' | CodingMasteryLevel>
              ariaLabel="Filter lessons by difficulty level"
              activeTab={levelFilter}
              onChange={(lvl) => {
                setLevelFilter(lvl);
                const next =
                  lvl === 'All'
                    ? JAVA_PYTHON_MASTERY_LESSONS[0]
                    : JAVA_PYTHON_MASTERY_LESSONS.find((l) => l.level === lvl);
                if (next) setSelectedId(next.id);
              }}
              size="xs"
              tabs={[
                { id: 'All', label: 'All (12)' },
                { id: 'Basics', label: 'Basics' },
                { id: 'Intermediate', label: 'Intermediate' },
                { id: 'Advanced', label: 'Advanced' },
              ]}
            />

            <SegmentedTabBar<FocusPane>
              ariaLabel="Select language view mode"
              activeTab={focusPane}
              onChange={setFocusPane}
              size="xs"
              tabs={[
                { id: 'split', label: 'Side-by-Side' },
                { id: 'python', label: 'Python Only' },
                { id: 'java', label: 'Java Only' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Zone Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Navigation Syllabus */}
        <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Curriculum Syllabus
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {filteredLessons.length} lessons
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[680px] overflow-y-auto">
            {filteredLessons.map((lesson) => {
              const isSelected = lesson.id === activeLesson.id;
              const isDone = completedIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setSelectedId(lesson.id)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-xs tabular-nums font-semibold w-6 shrink-0 ${
                      isSelected
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {String(lesson.number).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold leading-snug text-slate-900 dark:text-slate-100">
                        {lesson.title}
                      </span>
                      {isDone && (
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                          aria-label="Completed"
                        />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lesson.level} · {lesson.category} · {lesson.readTime}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Interactive Learning Stage */}
        <div className="xl:col-span-8 space-y-5">
          {/* Lesson Header & Mental Model */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
                    Lesson {String(activeLesson.number).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeLesson.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeLesson.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeLesson.readTime}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
                  {activeLesson.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {activeLesson.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleComplete(activeLesson.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isLessonComplete
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {isLessonComplete ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Core Mental Model
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-5">
                  {activeLesson.mentalModel}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Why Production Engineers Care
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-5">
                  {activeLesson.whySeniorsCare}
                </p>
              </div>
            </div>
          </section>

          {/* Side-by-Side Code Workspace + Idiomatic vs Anti-Pattern Toggle */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Production Code Comparison
              </div>
              <SegmentedTabBar<CodeMode>
                ariaLabel="Toggle between idiomatic code and common anti-pattern"
                activeTab={codeMode}
                onChange={setCodeMode}
                size="xs"
                tabs={[
                  { id: 'idiomatic', label: 'Idiomatic Production Code', icon: ShieldCheck },
                  { id: 'antipattern', label: 'Common Anti-Pattern & Bug', icon: AlertTriangle },
                ]}
              />
            </div>

            <div
              className={`grid grid-cols-1 ${
                focusPane === 'split' ? 'lg:grid-cols-2' : ''
              } gap-4 items-stretch`}
            >
              {(focusPane === 'split' || focusPane === 'python') && (
                <div className="flex flex-col gap-2">
                  <CodeBlockWithHighlight
                    title={
                      codeMode === 'idiomatic'
                        ? 'Python 3.13+ Idiomatic'
                        : 'Python Anti-Pattern (Avoid)'
                    }
                    languageLabel="Python"
                    code={
                      codeMode === 'idiomatic'
                        ? activeLesson.pythonIdiomatic
                        : activeLesson.pythonAntiPattern
                    }
                    highlightLine={activeTrace?.highlightLinePy}
                    isAntiPattern={codeMode === 'antipattern'}
                  />
                  {codeMode === 'antipattern' && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">Python Trap: </span>
                      {activeLesson.pythonPitfallNote}
                    </div>
                  )}
                </div>
              )}

              {(focusPane === 'split' || focusPane === 'java') && (
                <div className="flex flex-col gap-2">
                  <CodeBlockWithHighlight
                    title={
                      codeMode === 'idiomatic'
                        ? 'Java 21+ LTS Idiomatic'
                        : 'Java Anti-Pattern (Avoid)'
                    }
                    languageLabel="Java 21"
                    code={
                      codeMode === 'idiomatic'
                        ? activeLesson.javaIdiomatic
                        : activeLesson.javaAntiPattern
                    }
                    highlightLine={activeTrace?.highlightLineJava}
                    isAntiPattern={codeMode === 'antipattern'}
                  />
                  {codeMode === 'antipattern' && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">Java Trap: </span>
                      {activeLesson.javaPitfallNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Interactive Line-by-Line Stack & Heap Execution Tracer */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  <span>Interactive Stack &amp; Heap Stepper</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Step {traceIdx + 1} / {activeLesson.traceSteps.length}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeLesson.traceScenarioTitle}
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPlayingTrace((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                >
                  {isPlayingTrace ? (
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {isPlayingTrace ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingTrace(false);
                    setTraceIdx(
                      (prev) =>
                        (prev - 1 + activeLesson.traceSteps.length) %
                        activeLesson.traceSteps.length
                    );
                  }}
                  aria-label="Previous execution step"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingTrace(false);
                    setTraceIdx((prev) => (prev + 1) % activeLesson.traceSteps.length);
                  }}
                  aria-label="Next execution step"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingTrace(false);
                    setTraceIdx(0);
                  }}
                  aria-label="Reset trace"
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {activeTrace && (
              <div className="p-4 space-y-4">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {activeTrace.action}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Stack Frame */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      Call Stack Frame
                    </div>
                    <div className="space-y-1.5">
                      {activeTrace.stackFrame.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-2 text-xs font-mono border-b border-slate-200/70 dark:border-slate-800/80 pb-1 last:border-b-0 last:pb-0"
                        >
                          <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                          <span className="text-slate-900 dark:text-slate-100 font-semibold tabular-nums">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heap Objects */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Heap / Runtime State
                    </div>
                    <div className="space-y-1.5">
                      {activeTrace.heapObjects.map((obj) => (
                        <div key={obj.ref} className="text-xs space-y-0.5">
                          <div className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                            {obj.ref} · {obj.label}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            {obj.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Console Output */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 space-y-2 text-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                      Runtime Output
                    </div>
                    <div className="font-mono text-xs text-emerald-300 break-words">
                      &gt; {activeTrace.consoleOut}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Language Trade-Offs Comparison Matrix */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Python 3.13+ vs. Java 21+ Key Engineering Differences
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-4 font-semibold">Dimension</th>
                    <th className="py-2.5 px-4 font-semibold">Python 3.13+</th>
                    <th className="py-2.5 px-4 font-semibold">Java 21+ LTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeLesson.keyDifferences.map((row) => (
                    <tr key={row.aspect}>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {row.aspect}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                        {row.python}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                        {row.java}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Inline Quick Mastery Check */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              Quick Mastery Check
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {activeLesson.quickCheck.question}
            </p>
            <div className="space-y-2">
              {activeLesson.quickCheck.options.map((opt) => {
                const picked = activeQuizChoice === opt.id;
                const isCorrect = opt.id === activeLesson.quickCheck.correctId;
                const revealed = Boolean(activeQuizChoice);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setQuizAnswers((prev) => ({ ...prev, [activeLesson.id]: opt.id }));
                      if (opt.id === activeLesson.quickCheck.correctId && !isLessonComplete) {
                        onToggleComplete(activeLesson.id);
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
            {activeQuizChoice && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeQuizChoice === activeLesson.quickCheck.correctId
                    ? 'Correct: '
                    : 'Explanation: '}
                </span>
                {activeLesson.quickCheck.explanation}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
