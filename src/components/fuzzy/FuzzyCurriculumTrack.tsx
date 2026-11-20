import { useState } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Code2,
  Play,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  type FuzzyCurriculumModule,
  type ModuleStudioLink,
} from '../../data/fuzzyCurriculumModules';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { useSprintStore } from '../../store/useSprintStore';
import { useAccountState } from '../../hooks/useAccountState';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';

interface TestOutcome {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

const MODULE_STORAGE_KEY = 'patternforge_fuzzy_modules_done_v1';

export function FuzzyCurriculumTrack() {
  const {
    data: { curriculumModules: FUZZY_CURRICULUM_MODULES },
  } = useAsyncCatalog('ngram-fuzzy-catalog');
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const openArchitecture = usePatternForgeStore((s) => s.openArchitecture);
  const openNGramAlgorithm = usePatternForgeStore((s) => s.openNGramAlgorithm);
  const openTrainerForProblem = useSprintStore((s) => s.openTrainerForProblem);

  const [activeModId, setActiveModId] = useState<string>(FUZZY_CURRICULUM_MODULES[0].id);
  const [completedIds, setCompletedIds] = useAccountState<string[]>(
    'fuzzy-modules-completed',
    [],
    MODULE_STORAGE_KEY
  );
  const [codeByModule, setCodeByModule] = useState<Record<string, string>>({});
  const [testRunByModule, setTestRunByModule] = useState<
    Record<string, { outcomes: TestOutcome[]; compileError?: string; allPassed: boolean }>
  >({});

  const mod: FuzzyCurriculumModule =
    FUZZY_CURRICULUM_MODULES.find((m) => m.id === activeModId) ?? FUZZY_CURRICULUM_MODULES[0];

  const currentCode = codeByModule[mod.id] ?? mod.exercise.starterCode;
  const currentRun = testRunByModule[mod.id];
  const isCompleted = completedIds.includes(mod.id);

  const handleRunExercise = () => {
    const code = codeByModule[mod.id] ?? mod.exercise.starterCode;
    let fn: ((...args: unknown[]) => unknown) | null = null;
    try {
      const factory = new Function(
        `${code}\nreturn typeof ${mod.exercise.functionName} === 'function' ? ${mod.exercise.functionName} : null;`
      );
      fn = factory() as ((...args: unknown[]) => unknown) | null;
    } catch (err) {
      setTestRunByModule((prev) => ({
        ...prev,
        [mod.id]: {
          outcomes: [],
          compileError: err instanceof Error ? err.message : String(err),
          allPassed: false,
        },
      }));
      return;
    }

    if (typeof fn !== 'function') {
      setTestRunByModule((prev) => ({
        ...prev,
        [mod.id]: {
          outcomes: [],
          compileError: `Expected function "${mod.exercise.functionName}" to be defined.`,
          allPassed: false,
        },
      }));
      return;
    }

    const outcomes: TestOutcome[] = mod.exercise.testCases.map((tc) => {
      try {
        const clonedArgs = JSON.parse(JSON.stringify(tc.args)) as unknown[];
        const actual = fn!(...clonedArgs);
        const expectedStr = JSON.stringify(tc.expected);
        const actualStr = JSON.stringify(actual);
        return {
          label: tc.label,
          passed: actualStr === expectedStr,
          expected: expectedStr,
          actual: actualStr,
        };
      } catch (err) {
        return {
          label: tc.label,
          passed: false,
          expected: JSON.stringify(tc.expected),
          actual: 'Runtime Error',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });

    const allPassed = outcomes.length > 0 && outcomes.every((o) => o.passed);
    setTestRunByModule((prev) => ({
      ...prev,
      [mod.id]: { outcomes, allPassed },
    }));
    if (allPassed) {
      setCompletedIds((prev) => (prev.includes(mod.id) ? prev : [...prev, mod.id]));
    }
  };

  const handleStudioLink = (link: ModuleStudioLink) => {
    if (link.type === 'algorithm') {
      openAlgorithm(link.targetId, 'mental');
    } else if (link.type === 'architecture') {
      openArchitecture(link.targetId);
    } else if (link.type === 'pruning-sim') {
      openNGramAlgorithm(link.targetId, 'pruning-sim');
    } else if (link.type === 'case-study') {
      openNGramAlgorithm(link.targetId, 'case-study');
    } else {
      openNGramAlgorithm(link.targetId, 'taxonomy');
    }
  };

  const handleOpenProblem = (slug: string) => {
    openTrainerForProblem(slug);
    setActiveView('roadmap');
  };

  return (
    <div className="space-y-6">
      {/* 5-Module Mastery Stepper */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              5-MODULE FUZZY SEARCH ENGINEERING TRACK · COMPLETED: {completedIds.length} / {FUZZY_CURRICULUM_MODULES.length} MILESTONES
            </p>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              From String Foundations to Production Filter-and-Refine Architecture
            </h2>
          </div>
          <div className="w-full sm:w-48 space-y-1">
            <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.round((completedIds.length / FUZZY_CURRICULUM_MODULES.length) * 100)}%`,
                }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-right tabular-nums">
              {Math.round((completedIds.length / FUZZY_CURRICULUM_MODULES.length) * 100)}% Mastery
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {FUZZY_CURRICULUM_MODULES.map((m) => {
            const active = m.id === mod.id;
            const done = completedIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveModId(m.id)}
                className={`text-left p-3 rounded-lg border transition-colors space-y-1 ${
                  active
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{m.stageTag}</span>
                  {done && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {m.shortTitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Module Curriculum Breakdown & Studio Quick Links */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
              {mod.stageTag} · Milestone {mod.number} of 5
              {isCompleted && (
                <span className="text-emerald-600 dark:text-emerald-400"> · Milestone Passed</span>
              )}
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              {mod.title}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{mod.goal}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 shrink-0">
            {mod.studioLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleStudioLink(link)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-400 whitespace-nowrap"
              >
                {link.label}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mod.sections.map((sec) => (
            <div
              key={sec.code}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <span className="font-mono text-sky-700 dark:text-sky-400 mr-1.5">{sec.code}</span>
                  {sec.title}
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                {sec.concepts.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                Underlying DSA Pattern: {sec.dsaPattern}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real-World Application Problem & Production Solution */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
              Real-World Application: {mod.realWorldProblem.title}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {mod.realWorldProblem.companyContext}
          </span>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {mod.realWorldProblem.prompt}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2">
            <div className="font-mono font-semibold text-amber-700 dark:text-amber-400">
              Production Constraints & Failure Modes
            </div>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
              {mod.realWorldProblem.constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              Complexity: {mod.realWorldProblem.complexity}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
            <div className="font-mono font-semibold text-emerald-800 dark:text-emerald-300">
              Step-by-Step Engineering Solution
            </div>
            <ol className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
              {mod.realWorldProblem.solutionWalkthrough.map((step, idx) => (
                <li key={idx}>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 mr-1.5">
                    0{idx + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Hands-On Coding Milestone Lab */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
              {mod.exercise.title}
            </h3>
          </div>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Milestone Verified
            </span>
          )}
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {mod.exercise.prompt}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
          {/* Editable JS Code Editor */}
          <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/90">
              <span className="text-xs font-mono text-slate-300">
                JavaScript · fn <strong className="text-sky-400">{mod.exercise.functionName}</strong>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCodeByModule((prev) => ({ ...prev, [mod.id]: mod.exercise.starterCode }));
                    setTestRunByModule((prev) => {
                      const next = { ...prev };
                      delete next[mod.id];
                      return next;
                    });
                  }}
                  className="px-2.5 py-1 rounded-md border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Reset Starter
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCodeByModule((prev) => ({ ...prev, [mod.id]: mod.exercise.solutionCode }))
                  }
                  className="px-2.5 py-1 rounded-md border border-slate-700 text-xs font-medium text-sky-300 hover:bg-slate-800"
                >
                  Load Reference Solution
                </button>
                <button
                  type="button"
                  onClick={handleRunExercise}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400"
                >
                  <Play className="w-3 h-3" />
                  Run Milestone Tests
                </button>
              </div>
            </div>
            <textarea
              value={currentCode}
              onChange={(e) => setCodeByModule((prev) => ({ ...prev, [mod.id]: e.target.value }))}
              spellCheck={false}
              rows={15}
              aria-label={`Milestone coding editor for ${mod.exercise.functionName}`}
              className="w-full flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-6 focus:outline-hidden resize-y"
            />
          </div>

          {/* Live Unit Test Verification Output */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Milestone Test Suite ({mod.exercise.testCases.length})
              </span>
              {currentRun && (
                <span
                  className={`font-semibold tabular-nums ${
                    currentRun.allPassed
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {currentRun.outcomes.filter((o) => o.passed).length}/{mod.exercise.testCases.length} Passed
                </span>
              )}
            </div>

            {currentRun?.compileError && (
              <div className="p-2.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-800 dark:text-rose-300">
                {currentRun.compileError}
              </div>
            )}

            {!currentRun ? (
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  Complete <code className="font-mono font-semibold text-slate-900 dark:text-slate-100">{mod.exercise.functionName}</code> or load the reference solution, then run the suite to unlock Module {mod.number}.
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
                  {mod.exercise.testCases.map((tc, i) => (
                    <div key={i} className="text-slate-500 dark:text-slate-400">
                      Case {i + 1}: {tc.label}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {currentRun.outcomes.map((o, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                        {o.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        {o.label}
                      </span>
                      <span className={o.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                        {o.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="pl-5 text-[11px] text-slate-600 dark:text-slate-400 break-all">
                      Exp: <span className="text-slate-900 dark:text-slate-100">{o.expected}</span> · Got:{' '}
                      <span className={o.passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                        {o.actual}
                      </span>
                    </div>
                    {o.error && <div className="pl-5 text-[11px] text-rose-600">{o.error}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Linked DSA Interview Problems to Master This Module */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div>
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
            Linked DSA Problems to Reinforce Module {mod.number}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Open any problem directly in the Big Tech Solution Trainer to practice the underlying DSA pattern.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {mod.linkedProblems.map((prob) => (
            <div
              key={prob.slug}
              className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    #{prob.number}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {prob.title}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
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
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{prob.whyLinked}</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenProblem(prob.slug)}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap shrink-0"
              >
                Solve in Trainer
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
