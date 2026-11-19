import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Blocks,
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  Compass,
  FlaskConical,
  Gauge,
  Grid3X3,
  HelpCircle,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react';
import { analyzeProblemStatement } from '../../core/engine/UniversalLogicEngine';
import {
  PURE_LOGIC_MODULES,
  SAMPLE_PROBLEMS,
  STRATEGIES_CATALOG,
} from '../../core/knowledge-base/strategiesCatalog';
import type {
  CognitiveDomain,
  SocraticPhase,
  SupportedCodeLanguage,
  WorkspaceKind,
} from '../../core/knowledge-base/types';
import type {
  ArrayTracePresetId,
  InvariantPresetId,
} from '../../core/step-generators/workspaceGenerators';
import {
  completeMicroDrill,
  loadTelemetryState,
  trackProblemComplete,
  trackProblemDrop,
} from '../../core/telemetry/adaptiveTelemetry';
import { ArrayPointerVisualizer } from '../workspaces/ArrayPointerVisualizer';
import { InvariantTrackerTable } from '../workspaces/InvariantTrackerTable';
import { LogicPieceBuilder } from '../workspaces/LogicPieceBuilder';
import { TruthEliminationGrid } from '../workspaces/TruthEliminationGrid';
import { AdaptiveCoachPanel } from './AdaptiveCoachPanel';

interface UniversalSolverStudioProps {
  onOpenCurriculumTopic?: (topicId: string) => void;
}

const DOMAIN_LABELS: Record<CognitiveDomain, string> = {
  DSA_ALGORITHMIC: 'DSA & Algorithmic',
  MATHEMATICAL_LOGIC: 'Mathematical Logic',
  DEDUCTIVE_CONSTRAINT: 'Deductive Constraint',
  GAME_THEORY_INVARIANT: 'Game Theory & Invariants',
  SYSTEM_STATE_LOGIC: 'System & State Logic',
};

type MobilePane = 'problem' | 'builder' | 'visualizer' | 'code';

export const UniversalSolverStudio: React.FC<UniversalSolverStudioProps> = ({
  onOpenCurriculumTopic,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_PROBLEMS[0].id);
  const [problemInput, setProblemInput] = useState<string>(SAMPLE_PROBLEMS[0].statement);
  const [problemTitle, setProblemTitle] = useState<string>(SAMPLE_PROBLEMS[0].title);
  const [activeWorkspaceOverride, setActiveWorkspaceOverride] = useState<WorkspaceKind | null>(
    null,
  );
  const [rightTab, setRightTab] = useState<'workspace' | 'code' | 'coach' | 'logic-modules'>(
    'workspace',
  );
  const [mobilePane, setMobilePane] = useState<MobilePane>('problem');
  const [codeLang, setCodeLang] = useState<SupportedCodeLanguage>('typescript');
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(2); // Optimal by default
  const [completedPhases, setCompletedPhases] = useState<SocraticPhase[]>([]);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [revealedPhases, setRevealedPhases] = useState<SocraticPhase[]>(['DECONSTRUCT']);
  const [telemetry, setTelemetry] = useState(() => loadTelemetryState());
  const [toast, setToast] = useState<{ kind: 'success' | 'warn'; text: string } | null>(null);

  const analysis = useMemo(() => analyzeProblemStatement(problemInput), [problemInput]);

  const activeWorkspace: WorkspaceKind =
    activeWorkspaceOverride ?? analysis.recommendedWorkspace;

  const topStrategy = analysis.topStrategy;

  // Map detected strategy to best default visualizer preset
  const arrayPreset: ArrayTracePresetId = useMemo(() => {
    const id = topStrategy?.strategy.id ?? '';
    if (
      id.includes('ngram') ||
      id.includes('fuzzy') ||
      id.includes('symspell') ||
      id.includes('minhash') ||
      id.includes('bk-tree')
    ) {
      return 'ngram-fuzzy';
    }
    if (id.includes('two-pointers')) return 'two-pointers';
    if (id.includes('binary-search')) return 'binary-search';
    return 'sliding-window';
  }, [topStrategy]);

  const invariantPreset: InvariantPresetId = useMemo(() => {
    const norm = analysis.deconstruction.normalizedText;
    if (norm.includes('nim') || norm.includes('pile') || norm.includes('stone')) return 'nim-xor';
    if (norm.includes('chameleon') || norm.includes('modulo 3')) return 'chameleon-mod3';
    return 'chessboard-parity';
  }, [analysis.deconstruction.normalizedText]);

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_PROBLEMS.find((s) => s.id === sampleId);
    if (!sample) return;
    setSelectedSampleId(sample.id);
    setProblemTitle(sample.title);
    setProblemInput(sample.statement);
    setActiveWorkspaceOverride(null);
    setCompletedPhases([]);
    setRevealedPhases(['DECONSTRUCT']);
    setHintsUsed(0);
    setToast(null);
  };

  const handleTogglePhaseComplete = (phase: SocraticPhase) => {
    setCompletedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase],
    );
  };

  const handleRevealHint = (phase: SocraticPhase) => {
    if (!revealedPhases.includes(phase)) {
      setRevealedPhases((prev) => [...prev, phase]);
      setHintsUsed((h) => h + 1);
    }
  };

  const handleLogDrop = (phase: SocraticPhase) => {
    const res = trackProblemDrop(
      selectedSampleId || `custom-${problemTitle.slice(0, 16)}`,
      problemTitle || 'Custom Problem',
      analysis.deconstruction.primaryDomain,
      phase,
    );
    setTelemetry(res.state);
    setToast({
      kind: 'warn',
      text: `Drop diagnosed at ${phase}. Queued "${res.createdDrill.title}" in Adaptive Coach.`,
    });
    setRightTab('coach');
  };

  const handleCompleteProblem = () => {
    const independent = hintsUsed === 0;
    const res = trackProblemComplete(
      selectedSampleId || `custom-${problemTitle.slice(0, 16)}`,
      problemTitle || 'Custom Problem',
      analysis.deconstruction.primaryDomain,
      hintsUsed,
      independent,
    );
    setTelemetry(res.state);
    setToast({
      kind: 'success',
      text: `Mastery ${res.reviewItem.masteryScore}% recorded! Next SM-2 review scheduled in ${res.reviewItem.intervalDays} day(s). Tier: ${res.state.unlockedTier}.`,
    });
  };

  const handleCompleteDrill = (drillId: string) => {
    const next = completeMicroDrill(drillId);
    setTelemetry(next);
    setToast({
      kind: 'success',
      text: 'Micro-drill completed! Cognitive gap marked repaired.',
    });
  };

  const pendingDrillCount = telemetry.microDrills.filter((d) => !d.completed).length;

  return (
    <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Brain className="w-4 h-4" />
            <span>Universal Logic & DSA Mastery Engine</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {STRATEGIES_CATALOG.length} Indexed Mental Models
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              Stage 1+2 Retrieval {analysis.totalElapsedMs}ms
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Universal Problem Solver Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            Paste any DSA, N-Gram Fuzzy Search, Mathematical Invariant, Deductive Grid, or Game Theory problem. The two-stage engine deconstructs constraints, retrieves strategies via padded trigrams, and mounts the right interactive lab.
          </p>
        </div>

        {/* Telemetry Quick Strip */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span>Unlocked Tier:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {telemetry.unlockedTier}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>SM-2 Queue:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {telemetry.sm2Queue.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRightTab('coach')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              pendingDrillCount > 0
                ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>
              Adaptive Coach{pendingDrillCount > 0 ? ` (${pendingDrillCount} drill)` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-3 ${
            toast.kind === 'success'
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.kind === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sample Problem Launcher */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
          Test Presets:
        </span>
        {SAMPLE_PROBLEMS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleLoadSample(sample.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              selectedSampleId === sample.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {sample.title.split(' ').slice(0, 3).join(' ')}
          </button>
        ))}
      </div>

      {/* Main Split Workspace (Desktop 12-Col Split, Mobile Tabbed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Problem Input, Deconstructor, Ranked Confidence, 4-Phase Socratic Blueprint */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobilePane === 'problem' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Problem Statement Input */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="universal-problem-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Problem Statement (Any Domain · Typo-Tolerant)
              </label>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {analysis.deconstruction.paddedTrigrams.length} trigrams
              </span>
            </div>
            <input
              type="text"
              value={problemTitle}
              onChange={(e) => {
                setProblemTitle(e.target.value);
                setSelectedSampleId('custom');
              }}
              placeholder="Problem title..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              id="universal-problem-input"
              rows={4}
              value={problemInput}
              onChange={(e) => {
                setProblemInput(e.target.value);
                setSelectedSampleId('custom');
                setActiveWorkspaceOverride(null);
              }}
              placeholder="Paste any LeetCode prompt, math puzzle, zebra riddle, game theory problem, or fuzzy search architecture brief..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Stage 1 Deconstruction Summary */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-slate-500 dark:text-slate-400">Detected Domain:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {DOMAIN_LABELS[analysis.deconstruction.primaryDomain]}
                  </span>
                </div>
                <div className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  Ceiling:{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {analysis.deconstruction.hardestCeiling}
                  </span>
                </div>
              </div>

              {analysis.deconstruction.constraints.length > 0 && (
                <div className="space-y-1">
                  {analysis.deconstruction.constraints.map((c) => (
                    <div
                      key={c.raw}
                      className="rounded-md bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                        {c.label} → {c.ceiling}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">· {c.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stage 2 + 3 Ranked Recommendations & Confidence Meters */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Gauge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Calibrated Strategy Reranker (Top 3)</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {analysis.retrieval.evaluatedCount} eval · {analysis.retrieval.prunedCount} pruned ·{' '}
                {analysis.retrieval.elapsedMs}ms
              </span>
            </div>

            <div className="space-y-2.5">
              {analysis.recommendations.slice(0, 3).map((rec, idx) => {
                const pct = Math.round(rec.confidence * 100);
                const isTop = idx === 0;
                return (
                  <div
                    key={rec.strategy.id}
                    className={`rounded-lg border p-3 space-y-2 ${
                      isTop
                        ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">
                            #{idx + 1}
                          </span>
                          <span>{rec.strategy.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          {rec.strategy.category} · {rec.strategy.optimalTime} ·{' '}
                          {rec.strategy.optimalSpace}
                        </div>
                      </div>
                      <span className="font-mono tabular-nums text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        {pct}%
                      </span>
                    </div>

                    {/* Confidence Meter Bar */}
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${rec.strategy.name} confidence ${pct}%`}
                      className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 75
                            ? 'bg-emerald-500'
                            : pct >= 50
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                        } ${
                          pct >= 95
                            ? 'w-full'
                            : pct >= 85
                              ? 'w-11/12'
                              : pct >= 75
                                ? 'w-9/12'
                                : pct >= 65
                                  ? 'w-8/12'
                                  : pct >= 55
                                    ? 'w-7/12'
                                    : pct >= 45
                                      ? 'w-6/12'
                                      : pct >= 35
                                        ? 'w-4/12'
                                        : pct >= 20
                                          ? 'w-3/12'
                                          : 'w-1/12'
                        }`}
                      />
                    </div>

                    {isTop && (
                      <>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {rec.strategy.mentalModel}
                        </p>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>Domain {Math.round(rec.breakdown.domainAlignment * 100)}%</span>
                          <span>·</span>
                          <span>Clues {Math.round(rec.breakdown.exactClueScore * 100)}%</span>
                          <span>·</span>
                          <span>N-Gram {Math.round(rec.breakdown.ngramOverlap * 100)}%</span>
                          {rec.breakdown.penaltyDeduction > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-rose-600 dark:text-rose-400">
                                Penalty -{Math.round(rec.breakdown.penaltyDeduction * 100)}%
                              </span>
                            </>
                          )}
                        </div>

                        {/* Reasoning Trace */}
                        <ul className="space-y-1 pt-1 border-t border-indigo-200/60 dark:border-indigo-900/60 text-[11px] text-slate-600 dark:text-slate-300">
                          {rec.reasoningTrace.map((line, rIdx) => (
                            <li key={rIdx}>• {line}</li>
                          ))}
                        </ul>

                        {/* Pitfall Warnings */}
                        {rec.pitfallWarnings.length > 0 && (
                          <div className="rounded-md border border-amber-200 dark:border-amber-900/80 bg-amber-50/70 dark:bg-amber-950/30 p-2 text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                            <div className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>Pitfall Guardrails</span>
                            </div>
                            {rec.pitfallWarnings.slice(0, 2).map((p, pIdx) => (
                              <div key={pIdx}>• {p}</div>
                            ))}
                          </div>
                        )}

                        {rec.strategy.curriculumTopicId && onOpenCurriculumTopic && (
                          <button
                            type="button"
                            onClick={() => onOpenCurriculumTopic(rec.strategy.curriculumTopicId!)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                          >
                            <span>Deep-Dive in Curriculum Workbench</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4-Phase Socratic Blueprint with Drop & Completion Intelligence */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>4-Phase Socratic Problem-Solving Blueprint</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {completedPhases.length}/4 done · {hintsUsed} hint(s)
              </span>
            </div>

            <div className="space-y-2.5">
              {analysis.blueprint.map((step) => {
                const isDone = completedPhases.includes(step.phase);
                const isRevealed = revealedPhases.includes(step.phase);
                return (
                  <div
                    key={step.phase}
                    className={`rounded-lg border p-3 space-y-2 transition-colors ${
                      isDone
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePhaseComplete(step.phase)}
                        className="flex items-center gap-2 text-left text-xs font-semibold text-slate-900 dark:text-slate-100"
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-400 dark:border-slate-600'
                          }`}
                        >
                          {isDone ? '✓' : ''}
                        </span>
                        <span>{step.label}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLogDrop(step.phase)}
                        className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline shrink-0"
                      >
                        Stuck Here · Log Drop
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">{step.objective}</p>

                    {isRevealed ? (
                      <div className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 space-y-1 text-xs">
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {step.guidingPrompt}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Checkpoint: {step.checkpointCriteria}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRevealHint(step.phase)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Reveal Socratic Guiding Prompt (+1 hint)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Complete to compute Mastery Score & schedule SM-2 review
              </span>
              <button
                type="button"
                onClick={handleCompleteProblem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Problem & Schedule SM-2</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Dynamic Interactive Workspace, Logic Piece Builder, 3-Tier Code, Adaptive Coach */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobilePane !== 'problem' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Right Pane View Tabs (Desktop) */}
          <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRightTab('workspace')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rightTab === 'workspace'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Interactive Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('code')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rightTab === 'code'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Brute → Better → Optimal</span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('logic-modules')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rightTab === 'logic-modules'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pure Logic & Math Modules</span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('coach')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rightTab === 'coach'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Adaptive Coach{pendingDrillCount > 0 ? ` (${pendingDrillCount})` : ''}</span>
              </button>
            </div>

            {rightTab === 'workspace' && (
              <div className="flex items-center gap-1 text-[11px]">
                {(
                  [
                    { id: 'array-pointer', label: 'Array/N-Gram', Icon: Sparkles },
                    { id: 'truth-grid', label: 'Truth Grid', Icon: Grid3X3 },
                    { id: 'invariant-tracker', label: 'Invariant Lab', Icon: FlaskConical },
                    { id: 'logic-builder', label: 'Pieces', Icon: Blocks },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveWorkspaceOverride(id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors ${
                      activeWorkspace === id
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Workspace Content */}
          {(rightTab === 'workspace' || mobilePane === 'visualizer' || mobilePane === 'builder') && (
            <div className="space-y-4">
              {mobilePane === 'builder' ? (
                <LogicPieceBuilder />
              ) : (
                <>
                  {activeWorkspace === 'array-pointer' && (
                    <ArrayPointerVisualizer
                      initialPreset={arrayPreset}
                      strategyName={topStrategy?.strategy.name}
                    />
                  )}
                  {activeWorkspace === 'truth-grid' && <TruthEliminationGrid />}
                  {activeWorkspace === 'invariant-tracker' && (
                    <InvariantTrackerTable initialPreset={invariantPreset} />
                  )}
                  {activeWorkspace === 'logic-builder' && <LogicPieceBuilder />}

                  {/* Always offer Complete-in-Pieces Builder below primary visualizer on desktop */}
                  {activeWorkspace !== 'logic-builder' && (
                    <div className="hidden lg:block">
                      <LogicPieceBuilder
                        initialChallengeId={
                          arrayPreset === 'ngram-fuzzy'
                            ? 'piece-ngram-pipeline'
                            : activeWorkspace === 'invariant-tracker'
                              ? 'piece-invariant-proof'
                              : 'piece-sliding-window'
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 3-Tier Multi-Language Code Progression */}
          {(rightTab === 'code' || mobilePane === 'code') && topStrategy && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {topStrategy.strategy.name} · 3-Tier Progression
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compare Brute Force → Better → Optimal side by side in TypeScript, Python, and Java
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                  {(['typescript', 'python', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCodeLang(lang)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                        codeLang === lang
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {topStrategy.strategy.approaches.map((app, idx) => (
                    <button
                      key={app.tier}
                      type="button"
                      onClick={() => setSelectedTierIdx(idx)}
                      className={`text-left rounded-lg border p-2.5 transition-colors ${
                        selectedTierIdx === idx
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {app.tier}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                        {app.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {app.timeComplexity} · {app.spaceComplexity}
                      </div>
                    </button>
                  ))}
                </div>

                {(() => {
                  const chosen = topStrategy.strategy.approaches[selectedTierIdx];
                  return (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Key Insight: {chosen.keyInsight}
                      </p>
                      <pre className="rounded-lg bg-slate-950 text-slate-100 p-4 text-xs font-mono leading-relaxed overflow-x-auto border border-slate-800">
                        {chosen.code[codeLang]}
                      </pre>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Pure Logic & Math Curriculum Modules */}
          {rightTab === 'logic-modules' && (
            <div className="space-y-3">
              {PURE_LOGIC_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {mod.category} · {mod.difficulty}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {mod.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {mod.complexitySummary}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.summary}
                  </p>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                    Mental Model: {mod.mentalModel}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Patterns: {mod.keyPatterns.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Adaptive Telemetry & Micro-Drills */}
          {rightTab === 'coach' && (
            <AdaptiveCoachPanel
              telemetry={telemetry}
              onCompleteDrill={handleCompleteDrill}
            />
          )}
        </div>
      </div>

      {/* Mobile / Tablet Bottom Tab Bar (< lg) */}
      <nav
        aria-label="Mobile studio panes"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur px-2 py-2 grid grid-cols-4 gap-1"
      >
        {(
          [
            { id: 'problem', label: 'Problem', Icon: Compass },
            { id: 'builder', label: 'Logic', Icon: Blocks },
            { id: 'visualizer', label: 'Visual', Icon: Sparkles },
            { id: 'code', label: 'Code', Icon: Code2 },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMobilePane(id);
              if (id === 'code') setRightTab('code');
              else if (id === 'visualizer' || id === 'builder') setRightTab('workspace');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              mobilePane === id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
