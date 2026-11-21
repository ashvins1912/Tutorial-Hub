import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldAlert,
  Terminal,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  CONTINUOUS_AI_TASKS,
  DATABASE_MASTERY_QUIZ,
  OUTAGE_SCENARIOS,
} from '../../data/databaseInternalsData';
import { CopyButton, SegmentedTabBar } from '../ui';

type DrillSubTab = 'outage-sim' | 'mastery-quiz' | 'ai-engine';

interface ChaosDrillAndQuizLabProps {
  solvedQuizIds: string[];
  solvedOutageIds: string[];
  onMarkQuizSolved: (questionId: string) => void;
  onResetQuizProgress: () => void;
  onMarkOutageSolved: (scenarioId: string) => void;
}

export function ChaosDrillAndQuizLab({
  solvedQuizIds,
  solvedOutageIds,
  onMarkQuizSolved,
  onResetQuizProgress,
  onMarkOutageSolved,
}: ChaosDrillAndQuizLabProps) {
  const [subTab, setSubTab] = useState<DrillSubTab>('outage-sim');

  // Outage Simulator State
  const [scenarioId, setScenarioId] = useState(OUTAGE_SCENARIOS[0].id);
  const [executedCmdIds, setExecutedCmdIds] = useState<string[]>([]);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);

  // Mastery Quiz State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  const activeScenario = useMemo(
    () => OUTAGE_SCENARIOS.find((s) => s.id === scenarioId) ?? OUTAGE_SCENARIOS[0],
    [scenarioId]
  );

  const selectedDiagnosis = activeScenario.diagnosisOptions.find((o) => o.id === selectedDiagnosisId) ?? null;

  const activeQuestion = DATABASE_MASTERY_QUIZ[questionIndex] ?? DATABASE_MASTERY_QUIZ[0];
  const chosenOptionId = selectedOptions[activeQuestion.id] ?? null;
  const chosenOption = activeQuestion.options.find((o) => o.id === chosenOptionId) ?? null;

  const handleSelectScenario = (nextId: string) => {
    setScenarioId(nextId);
    setExecutedCmdIds([]);
    setSelectedDiagnosisId(null);
  };

  const handleRunCommand = (cmdId: string) => {
    setExecutedCmdIds((prev) => (prev.includes(cmdId) ? prev : [...prev, cmdId]));
  };

  const handlePickDiagnosis = (optId: string) => {
    setSelectedDiagnosisId(optId);
    const opt = activeScenario.diagnosisOptions.find((o) => o.id === optId);
    if (opt?.isCorrect) {
      onMarkOutageSolved(activeScenario.id);
    }
  };

  const handleSelectQuizOption = (questionId: string, optionId: string, isCorrect: boolean) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
    if (isCorrect) {
      onMarkQuizSolved(questionId);
    }
  };

  return (
    <div className="space-y-6">
      <SegmentedTabBar<DrillSubTab>
        ariaLabel="Chaos drills, mastery quiz, and AI engine"
        activeTab={subTab}
        onChange={setSubTab}
        tabs={[
          {
            id: 'outage-sim',
            label: 'Live SRE Outage Simulator',
            shortLabel: 'Outage Sim',
            count: solvedOutageIds.length,
            icon: ShieldAlert,
          },
          {
            id: 'mastery-quiz',
            label: 'Staff Mastery Quiz',
            shortLabel: 'Quiz',
            count: solvedQuizIds.length,
            icon: Trophy,
          },
          {
            id: 'ai-engine',
            label: '4-Stage Continuous AI Task Engine',
            shortLabel: 'AI Task Engine',
            count: CONTINUOUS_AI_TASKS.length,
            icon: ClipboardList,
          },
        ]}
      />

      {/* SUB-TAB 1: LIVE SRE PRODUCTION OUTAGE SIMULATOR */}
      {subTab === 'outage-sim' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Live Production Outage Simulator (Principal SRE Drill)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Inspect live alerts, execute diagnostic engine commands, and pinpoint the zero-downtime root-cause fix.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Incidents Resolved: {solvedOutageIds.length} / {OUTAGE_SCENARIOS.length}
            </span>
          </div>

          {/* Incident Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {OUTAGE_SCENARIOS.map((sc) => {
              const active = sc.id === activeScenario.id;
              const solved = solvedOutageIds.includes(sc.id);
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`text-left rounded-lg border p-3.5 transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="text-rose-700 dark:text-rose-400 font-semibold">
                      {sc.severity} · {sc.engine}
                    </span>
                    {solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {sc.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Alert Banner & Metrics Strip */}
          <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-xs font-mono font-semibold text-rose-800 dark:text-rose-300">
                  {activeScenario.severity} ALERT · {activeScenario.alertTitle}
                </div>
                <ul className="mt-1.5 space-y-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  {activeScenario.initialAlerts.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {activeScenario.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3"
              >
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.label}</div>
                <div
                  className={`text-lg font-mono font-bold tabular-nums mt-0.5 ${
                    m.status === 'critical'
                      ? 'text-rose-700 dark:text-rose-400'
                      : m.status === 'warning'
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Diagnostic Console + Diagnosis Submission */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Step 1: Run Diagnostic Engine Commands
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {executedCmdIds.length} / {activeScenario.commands.length} executed
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeScenario.commands.map((cmd) => {
                  const ran = executedCmdIds.includes(cmd.id);
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => handleRunCommand(cmd.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        ran
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                      }`}
                    >
                      <Play className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>{cmd.label}</span>
                    </button>
                  );
                })}
              </div>

              {executedCmdIds.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  Run one or more diagnostic commands above to inspect live database engine telemetry.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeScenario.commands
                    .filter((c) => executedCmdIds.includes(c.id))
                    .map((cmd) => (
                      <div key={cmd.id} className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                        <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-[11px] font-mono text-sky-400">
                          <span className="truncate">$ {cmd.command.split('\n')[0]}</span>
                          <CopyButton text={cmd.command} label="Copy" copiedLabel="Copied" size="xs" />
                        </div>
                        <pre className="p-3.5 text-slate-200 font-mono text-[11px] leading-5 overflow-x-auto">
                          {cmd.output}
                        </pre>
                        <div className="px-3.5 py-2 bg-slate-900/90 border-t border-slate-800 text-xs text-amber-300">
                          <strong>SRE Clue:</strong> {cmd.clue}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Root-Cause Diagnosis & Zero-Downtime Runbook */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Step 2: Select Root-Cause Diagnosis
              </div>
              <div className="space-y-2">
                {activeScenario.diagnosisOptions.map((opt) => {
                  const chosen = selectedDiagnosisId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePickDiagnosis(opt.id)}
                      className={`w-full text-left rounded-lg border p-3.5 text-xs leading-5 transition-colors ${
                        chosen
                          ? opt.isCorrect
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                            : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-slate-900 dark:text-slate-100'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {selectedDiagnosis && (
                <div
                  className={`rounded-lg border p-4 space-y-3 text-xs ${
                    selectedDiagnosis.isCorrect
                      ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20'
                      : 'border-rose-300 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    {selectedDiagnosis.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                    )}
                    <span>{selectedDiagnosis.isCorrect ? 'Root Cause Verified' : 'Incorrect Assessment — Re-check Engine Output'}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">{selectedDiagnosis.explanation}</p>

                  {selectedDiagnosis.isCorrect && (
                    <div className="pt-2.5 border-t border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                      <div className="font-semibold text-emerald-900 dark:text-emerald-300">
                        Zero-Downtime SRE Remediation Runbook
                      </div>
                      <ol className="space-y-1.5 text-slate-700 dark:text-slate-300 list-decimal pl-4">
                        {activeScenario.remediationSteps.map((step) => (
                          <li key={step} className="leading-5">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SUB-TAB 2: 10-QUESTION STAFF MASTERY QUIZ */}
      {subTab === 'mastery-quiz' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Interactive Mastery Quiz — SQL, NoSQL &amp; Database Internals
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                10 Staff-level scenario questions with hints and internal engine data-structure rationales for every option.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
                Mastered: {solvedQuizIds.length} / {DATABASE_MASTERY_QUIZ.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedOptions({});
                  setShowHints({});
                  setQuestionIndex(0);
                  onResetQuizProgress();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-400 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset Quiz
              </button>
            </div>
          </div>

          {/* Question Number Strip */}
          <div className="flex flex-wrap gap-1.5">
            {DATABASE_MASTERY_QUIZ.map((q, idx) => {
              const isCurrent = idx === questionIndex;
              const isSolved = solvedQuizIds.includes(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-lg border text-xs font-mono font-semibold tabular-nums transition-colors ${
                    isCurrent
                      ? 'border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : isSolved
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Card */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Question {questionIndex + 1} of {DATABASE_MASTERY_QUIZ.length} ·{' '}
                <strong className="text-sky-700 dark:text-sky-400">{activeQuestion.topic}</strong>
              </span>
              <button
                type="button"
                onClick={() =>
                  setShowHints((prev) => ({ ...prev, [activeQuestion.id]: !prev[activeQuestion.id] }))
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                {showHints[activeQuestion.id] ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-7">
              {activeQuestion.question}
            </h3>

            {showHints[activeQuestion.id] && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{activeQuestion.hint}</span>
              </div>
            )}

            <div className="space-y-2.5">
              {activeQuestion.options.map((opt, idx) => {
                const isSelected = chosenOptionId === opt.id;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectQuizOption(activeQuestion.id, opt.id, opt.isCorrect)}
                    className={`w-full text-left rounded-lg border p-3.5 transition-colors space-y-1.5 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                          : 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 text-sm text-slate-900 dark:text-slate-100">
                      <span className="font-mono font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {letter}.
                      </span>
                      <span className="leading-6">{opt.text}</span>
                    </div>
                    {isSelected && (
                      <div
                        className={`text-xs pl-6 leading-5 font-medium ${
                          opt.isCorrect
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {opt.reason}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {chosenOption && !chosenOption.isCorrect && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try another option or review the hint to lock in the internal engine behavior.
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={questionIndex === 0}
                onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                Previous Question
              </button>
              <button
                type="button"
                disabled={questionIndex === DATABASE_MASTERY_QUIZ.length - 1}
                onClick={() =>
                  setQuestionIndex((i) => Math.min(DATABASE_MASTERY_QUIZ.length - 1, i + 1))
                }
                className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold disabled:opacity-40"
              >
                Next Question
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SUB-TAB 3: 4-STAGE CONTINUOUS IMPROVEMENT AI TASK ENGINE */}
      {subTab === 'ai-engine' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Continuous Improvement AI Task Engine (4-Stage Staff Engineering Loop)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Copy and run these structured self-evolving prompts week over week to benchmark chaos response, schema reviews, polyglot trade-offs, and weak-spot retention.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {CONTINUOUS_AI_TASKS.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                      AI Task 0{task.stageNumber} · {task.cadence}
                    </span>
                    <CopyButton text={task.prompt} label="Copy Prompt" copiedLabel="Copied" size="xs" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{task.focus}</p>
                  <blockquote className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-5">
                    {task.prompt}
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
