import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Cpu,
  Eye,
  GitBranch,
  HelpCircle,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Workflow,
  XCircle,
} from 'lucide-react';
import {
  createSeededLearningEngine,
  LEGACY_CUSTOM_CONCEPTS_KEY,
  LEGACY_ENGINE_MASTERY_KEY,
} from '../../../core/intelligent-engine/IntelligentLearningEngine';
import { useAccountState } from '../../../hooks/useAccountState';
import type {
  CustomConceptInput,
  DiagramType,
  DifficultyTier,
  GeneratedPracticeProblem,
} from '../../../core/intelligent-engine/intelligent-engine.types';
import { DiagramCanvas } from './DiagramCanvas';
import { CreateTopicModal } from './CreateTopicModal';
import { ContentAuthoringPanel } from './ContentAuthoringPanel';

const DIAGRAM_TABS: { type: DiagramType; label: string }[] = [
  { type: 'FLOWCHART', label: 'Logic Flowchart' },
  { type: 'DFD', label: 'Level-1 DFD' },
  { type: 'STATE_MACHINE', label: 'State Machine' },
  { type: 'DATA_STRUCTURE_TRACE', label: 'Memory & Sequence Trace' },
];

const DIFFICULTIES: ('AUTO' | DifficultyTier)[] = [
  'AUTO',
  'EASY',
  'MEDIUM',
  'HARD',
  'SYSTEM_SCALE',
];

export function IntelligentEngineStudio() {
  const [engine] = useState(() => createSeededLearningEngine());
  const [customSpecs, setCustomSpecs] = useAccountState<CustomConceptInput[]>(
    'engine-custom-concepts',
    [],
    LEGACY_CUSTOM_CONCEPTS_KEY,
  );
  const [masterySnapshot, setMasterySnapshot] = useAccountState<Record<string, number>>(
    'engine-concept-mastery',
    {},
    LEGACY_ENGINE_MASTERY_KEY,
  );
  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {
    for (const spec of customSpecs) {
      engine.registerCustomConceptFromSpec(spec);
    }
    engine.setMasterySnapshot(masterySnapshot);
    setRegistryVersion((v) => v + 1);
  }, [engine, customSpecs, masterySnapshot]);
  const [query, setQuery] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState<string>('ngram-two-stage-search');
  const [studioTab, setStudioTab] = useState<'diagrams' | 'practice'>('diagrams');
  const [activeDiagramType, setActiveDiagramType] = useState<DiagramType>('FLOWCHART');
  const [difficultyMode, setDifficultyMode] = useState<'AUTO' | DifficultyTier>('AUTO');
  const [builderOpen, setBuilderOpen] = useState(false);

  // Practice problem state
  const [problem, setProblem] = useState<GeneratedPracticeProblem>(() =>
    engine.generatePracticeSession('ngram-two-stage-search', undefined, 4201),
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [showExpectedOutput, setShowExpectedOutput] = useState(false);
  const [attemptBanner, setAttemptBanner] = useState<string | null>(null);

  const matchingConcepts = useMemo(
    () => engine.findConcepts(query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, query, registryVersion],
  );

  const visualPack = useMemo(
    () => engine.getVisualLearningPack(selectedConceptId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, selectedConceptId, registryVersion],
  );

  const activeConcept = visualPack.concept;
  const activeDiagram =
    visualPack.diagrams.find((d) => d.type === activeDiagramType) ?? visualPack.diagrams[0];
  const currentMastery = engine.getMastery(selectedConceptId);

  const generateFreshProblem = (conceptId: string, diffMode: 'AUTO' | DifficultyTier) => {
    const forced = diffMode === 'AUTO' ? undefined : diffMode;
    const next = engine.generatePracticeSession(conceptId, forced);
    setProblem(next);
    setSelectedOptions({});
    setRevealedHints({});
    setShowExpectedOutput(false);
    setAttemptBanner(null);
  };

  const handleSelectConcept = (conceptId: string) => {
    setSelectedConceptId(conceptId);
    generateFreshProblem(conceptId, difficultyMode);
  };

  const handleChangeDifficulty = (nextDiff: 'AUTO' | DifficultyTier) => {
    setDifficultyMode(nextDiff);
    generateFreshProblem(selectedConceptId, nextDiff);
  };

  const handleRegisterCustomConcepts = (specs: CustomConceptInput[]) => {
    const merged = [...customSpecs];
    let lastId = selectedConceptId;

    for (const spec of specs) {
      const node = engine.registerCustomConceptFromSpec(spec);
      lastId = node.id;
      const idx = merged.findIndex((s) => s.id === spec.id);
      if (idx >= 0) merged[idx] = spec;
      else merged.push(spec);
    }

    setCustomSpecs(merged);
    setRegistryVersion((v) => v + 1);
    setSelectedConceptId(lastId);
    generateFreshProblem(lastId, difficultyMode);
    setStudioTab('diagrams');
  };

  const allSocraticCorrect =
    problem.socraticSteps.length > 0 &&
    problem.socraticSteps.every((step) => selectedOptions[step.step] === step.correctIndex);

  const hintsUsedCount = Object.values(revealedHints).filter(Boolean).length;

  const handleRecordOutcome = (completed: boolean) => {
    const updated = engine.recordAttempt(selectedConceptId, completed, hintsUsedCount);
    setMasterySnapshot(engine.getMasterySnapshot());
    setRegistryVersion((v) => v + 1);
    setAttemptBanner(
      completed
        ? `Mastery updated to ${updated}% (+${Math.max(5, 16 - hintsUsedCount * 3)} pts, ${hintsUsedCount} hints used). Next problem adapts automatically!`
        : `Logged drop/retry — mastery adjusted to ${updated}%. Difficulty will scaffold down in AUTO mode.`,
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Studio Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sky-600 dark:text-sky-400">
            <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
            <span>INTELLIGENT KNOWLEDGE ENGINE</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400 tabular-nums">
              {engine.listAllConcepts().length} Indexed Concept Blueprints
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400">
              Padded Trigram Search + Live Diagram Synthesizer
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Visual Diagram Synthesizer & Parametric Problem Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select any of the 15 pre-built DSA & System concepts—or hot-plug a new algorithm via Form/JSON—to synthesize live Flowcharts, Level-1 DFDs, State Graphs, and infinite auto-verified practice drills.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBuilderOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Hot-Plug / Import New Concept
        </button>
      </section>

      {/* Main 2-Column Split: Left Concept Registry + Right Synthesizer & Practice Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 4 Cols: Fuzzy N-Gram Registry Browser */}
        <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            <label htmlFor="concept-ngram-search" className="sr-only">
              Fuzzy N-Gram search concepts
            </label>
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="concept-ngram-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Fuzzy search (try 'fuzzi', 'dijksta', 'lru', 'sharding')..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              <span>{matchingConcepts.length} matching concepts</span>
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[680px] overflow-y-auto">
            {matchingConcepts.map((c) => {
              const active = c.id === selectedConceptId;
              const mastery = engine.getMastery(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectConcept(c.id)}
                  className={`w-full text-left p-3.5 transition-colors space-y-1.5 ${
                    active
                      ? 'bg-sky-50/80 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs font-semibold leading-snug ${
                        active
                          ? 'text-sky-900 dark:text-sky-200'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                      {mastery}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                    <span>{c.category}</span>
                    <span>·</span>
                    <span>{c.complexity.time}</span>
                    {c.isCustom && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          CUSTOM HOT-PLUG
                        </span>
                      </>
                    )}
                  </div>
                  <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 dark:bg-sky-400 transition-all"
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right 8 Cols: Active Concept Synthesizer + Parametric Generator */}
        <div className="lg:col-span-8 space-y-4">
          {/* Selected Concept Summary Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-sky-700 dark:text-sky-400 font-semibold">
                    {activeConcept.category}
                  </span>
                  <span>·</span>
                  <span>Time: {activeConcept.complexity.time}</span>
                  <span>·</span>
                  <span>Space: {activeConcept.complexity.space}</span>
                </div>
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  {activeConcept.title}
                </h2>
              </div>

              {/* Adaptive Mastery Meter */}
              <div className="text-right font-mono">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>Adaptive Mastery: {currentMastery}%</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Auto Tier:{' '}
                  {currentMastery < 35
                    ? 'EASY'
                    : currentMastery < 65
                      ? 'MEDIUM'
                      : currentMastery < 85
                        ? 'HARD'
                        : 'SYSTEM_SCALE'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Core Mental Model
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeConcept.coreMentalModel}
                </p>
              </div>
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/30 p-3 space-y-1">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 inline-flex items-center gap-1">
                  <Compass className="w-3 h-3" aria-hidden="true" />
                  <span>Invariant Rule</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {activeConcept.invariantRule}
                </p>
              </div>
            </div>

            {/* Studio Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setStudioTab('diagrams')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    studioTab === 'diagrams'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
                  Visual Diagram Synthesizer (4 Views)
                </button>
                <button
                  type="button"
                  onClick={() => setStudioTab('practice')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    studioTab === 'practice'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  Parametric Problem Generator & Socratic Sandbox
                </button>
              </div>
            </div>
          </div>

          {studioTab === 'diagrams' ? (
            <div className="space-y-3">
              {/* Diagram Type Selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                {DIAGRAM_TABS.map((tab) => (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => setActiveDiagramType(tab.type)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      activeDiagramType === tab.type
                        ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                    }`}
                  >
                    {tab.type === 'FLOWCHART' ? (
                      <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>

              <DiagramCanvas concept={activeConcept} diagram={activeDiagram} />
            </div>
          ) : (
            /* Parametric Practice Problem Generator & Socratic Sandbox */
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              {/* Generator Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1">
                  {DIFFICULTIES.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => handleChangeDifficulty(tier)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                        difficultyMode === tier
                          ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {tier === 'AUTO' ? 'AUTO-ADAPT' : tier}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => generateFreshProblem(selectedConceptId, difficultyMode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Generate Fresh Seed Variation
                </button>
              </div>

              {/* Generated Problem Statement */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                    {problem.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      {problem.difficulty}
                    </span>
                    <span>·</span>
                    <span>Edge Case: {problem.edgeCaseTag}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {problem.statement}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  {problem.constraints.map((c, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="mr-3 text-slate-300 dark:text-slate-700">·</span>}
                      {c}
                    </span>
                  ))}
                </div>

                {/* Sample Input & Auto-Verified Expected Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 space-y-1.5">
                    <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Auto-Generated Sample Input
                    </div>
                    <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed">
                      {JSON.stringify(problem.sampleInput, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Reference Solver Ground-Truth Output
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowExpectedOutput((v) => !v)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        <Eye className="w-3 h-3" aria-hidden="true" />
                        {showExpectedOutput ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    {showExpectedOutput ? (
                      <pre className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 overflow-x-auto leading-relaxed">
                        {JSON.stringify(problem.expectedOutput, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                        Dry-run the Socratic logic pieces below first, then reveal the exact reference-solver output to verify your trace.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Socratic "Complete in Pieces" Checkpoints */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Socratic &ldquo;Complete in Pieces&rdquo; Verification Steps
                </div>
                {problem.socraticSteps.map((s) => {
                  const chosen = selectedOptions[s.step];
                  const answered = chosen !== undefined;
                  const isCorrect = chosen === s.correctIndex;
                  const hintOpen = Boolean(revealedHints[s.step]);

                  return (
                    <div
                      key={s.step}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          <span className="font-mono text-sky-600 dark:text-sky-400 mr-1.5">
                            Step {s.step}:
                          </span>
                          {s.question}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedHints((prev) => ({ ...prev, [s.step]: !prev[s.step] }))
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
                        >
                          <HelpCircle className="w-3 h-3" aria-hidden="true" />
                          {hintOpen ? 'Hide Hint' : 'Hint'}
                        </button>
                      </div>

                      {hintOpen && (
                        <div className="p-2.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-[11px] text-amber-900 dark:text-amber-200">
                          {s.hint}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {s.options.map((opt, idx) => {
                          const isSelected = chosen === idx;
                          const optionRight = answered && idx === s.correctIndex;
                          const optionWrong = isSelected && idx !== s.correctIndex;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({ ...prev, [s.step]: idx }))
                              }
                              className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${
                                optionRight
                                  ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                                  : optionWrong
                                    ? 'border-rose-400 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                              }`}
                            >
                              <span>{opt}</span>
                              {optionRight && (
                                <CheckCircle2
                                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                              {optionWrong && (
                                <XCircle
                                  className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`text-[11px] font-medium ${
                            isCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {isCorrect
                            ? '✓ Correct reasoning! This preserves the core invariant.'
                            : '✕ Not quite — check the hint above and re-evaluate the invariant.'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Adaptive Telemetry Action Strip */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {attemptBanner ? (
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {attemptBanner}
                    </span>
                  ) : (
                    <span>
                      Record your session outcome to adapt difficulty automatically (Current Mastery:{' '}
                      <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                        {currentMastery}%
                      </strong>
                      ).
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecordOutcome(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-500"
                  >
                    Need Easier Scaffold (-8%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpectedOutput(true);
                      handleRecordOutcome(true);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      allSocraticCorrect
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
                    }`}
                  >
                    Complete & Update Mastery
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateTopicModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onRegisterConcepts={handleRegisterCustomConcepts}
      />
    </div>
  );
}
