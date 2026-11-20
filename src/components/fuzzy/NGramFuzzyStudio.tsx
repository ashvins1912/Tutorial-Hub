import { useEffect, useMemo, useState } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  type NGramAlgorithmEntry,
  type NGramStageId,
} from '../../data/ngramTaxonomy';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';
import { computeAllSimilarityMetrics } from '../../utils/ngramEngine';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { NGramVisualStage } from './NGramVisualStage';
import { ProductSearchCaseStudy } from './ProductSearchCaseStudy';
import { PruningLogicSimulator } from './PruningLogicSimulator';
import { FuzzyCurriculumTrack } from './FuzzyCurriculumTrack';

const SPEEDS = [
  { label: '0.5×', ms: 2200 },
  { label: '1×', ms: 1350 },
  { label: '2×', ms: 700 },
] as const;

const PRESETS = [
  { label: 'Typo Pair', a: 'algorithm', b: 'algoritm' },
  { label: 'Phonetic Pair', a: 'Stephen', b: 'Steven' },
  { label: 'Product Search', a: 'aple iphon', b: 'apple iphone 15 pro' },
  { label: 'Phrase Shingles', a: 'fast fuzzy ngram search engine', b: 'fast fuzzy search engine' },
];

export function NGramFuzzyStudio() {
  const {
    data: { algorithms: NGRAM_ALGORITHMS, stages: NGRAM_STAGES },
  } = useAsyncCatalog('ngram-fuzzy-catalog');
  const studioMode = usePatternForgeStore((s) => s.activeNGramMode);
  const setStudioMode = usePatternForgeStore((s) => s.setActiveNGramMode);
  const storeAlgoId = usePatternForgeStore((s) => s.activeNGramAlgoId);

  const [stageId, setStageId] = useState<NGramStageId>('tokenization');
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(storeAlgoId || NGRAM_ALGORITHMS[0].id);

  useEffect(() => {
    const found = NGRAM_ALGORITHMS.find((a) => a.id === storeAlgoId);
    if (found) {
      setStageId(found.stage);
      setSelectedAlgoId(found.id);
      if (found.defaultA) setStringA(found.defaultA);
      if (found.defaultB) setStringB(found.defaultB);
    }
  }, [storeAlgoId, NGRAM_ALGORITHMS]);

  // Live sandbox inputs
  const [stringA, setStringA] = useState('algorithm');
  const [stringB, setStringB] = useState('algoritm');
  const [nGramSize, setNGramSize] = useState(3);
  const [kSkip, setKSkip] = useState(1);
  const [alpha, setAlpha] = useState(0.5);
  const [beta, setBeta] = useState(0.5);
  const [maxEditK, setMaxEditK] = useState(2);

  // Playback state
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(1350);

  const stageAlgorithms = useMemo(
    () => NGRAM_ALGORITHMS.filter((a) => a.stage === stageId),
    [stageId, NGRAM_ALGORITHMS]
  );

  const algorithm: NGramAlgorithmEntry = useMemo(
    () =>
      NGRAM_ALGORITHMS.find((a) => a.id === selectedAlgoId) ??
      stageAlgorithms[0] ??
      NGRAM_ALGORITHMS[0],
    [selectedAlgoId, stageAlgorithms, NGRAM_ALGORITHMS]
  );

  const activeStageMeta = NGRAM_STAGES.find((s) => s.id === stageId) ?? NGRAM_STAGES[0];
  const totalSteps = algorithm.traceSteps.length;
  const safeStepIndex = Math.min(stepIndex, Math.max(0, totalSteps - 1));
  const activeTrace = algorithm.traceSteps[safeStepIndex] ?? algorithm.traceSteps[0];

  const metrics = useMemo(
    () => computeAllSimilarityMetrics(stringA, stringB, nGramSize, alpha, beta),
    [stringA, stringB, nGramSize, alpha, beta]
  );

  useEffect(() => {
    if (!isPlaying) return;
    if (safeStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, safeStepIndex, totalSteps, speedMs]);

  const handleSelectStage = (nextStage: NGramStageId) => {
    setStageId(nextStage);
    const list = NGRAM_ALGORITHMS.filter((a) => a.stage === nextStage);
    if (list.length > 0) {
      setSelectedAlgoId(list[0].id);
      if (list[0].defaultA) setStringA(list[0].defaultA);
      if (list[0].defaultB) setStringB(list[0].defaultB);
    }
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleSelectAlgo = (algo: NGramAlgorithmEntry) => {
    setStudioMode('taxonomy');
    setStageId(algo.stage);
    setSelectedAlgoId(algo.id);
    if (algo.defaultA) setStringA(algo.defaultA);
    if (algo.defaultB) setStringB(algo.defaultB);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleJumpFromCaseStudy = (algoId: string) => {
    const found = NGRAM_ALGORITHMS.find((a) => a.id === algoId);
    if (found) handleSelectAlgo(found);
  };

  const all12Rows = useMemo(
    () => [
      { id: 'jaccard-similarity', name: 'Jaccard Similarity', group: 'Set-Based', score: metrics.jaccard },
      { id: 'sorensen-dice', name: 'Sørensen–Dice', group: 'Set-Based', score: metrics.dice },
      { id: 'overlap-coefficient', name: 'Overlap (Szymkiewicz–Simpson)', group: 'Set-Based', score: metrics.overlap },
      { id: 'braun-blanquet', name: 'Braun-Blanquet', group: 'Set-Based', score: metrics.braunBlanquet },
      { id: 'tversky-index', name: `Tversky (α=${alpha.toFixed(1)}, β=${beta.toFixed(1)})`, group: 'Set-Based', score: metrics.tversky },
      { id: 'kulczynski-similarity', name: 'Kulczynski', group: 'Set-Based', score: metrics.kulczynski },
      { id: 'cosine-tfidf', name: 'Cosine (TF-IDF)', group: 'Vector/Weighted', score: metrics.cosineTfIdf },
      { id: 'okapi-bm25', name: 'Okapi BM25 on N-Grams', group: 'Vector/Weighted', score: metrics.okapiBm25 },
      { id: 'soft-tfidf', name: 'Soft TF-IDF', group: 'Vector/Weighted', score: metrics.softTfIdf },
      { id: 'kondrak-positional', name: 'Kondrak Positional', group: 'Order-Aware', score: metrics.kondrakPositional },
      { id: 'ukkonen-qgram', name: `Ukkonen Q-Gram (L1=${metrics.ukkonenL1Distance})`, group: 'Order-Aware', score: metrics.ukkonenSimilarity },
      { id: 'ngram-levenshtein', name: `N-Gram Levenshtein (d=${metrics.ngramLevenshteinDist})`, group: 'Order-Aware', score: metrics.ngramLevenshteinSim },
    ],
    [metrics, alpha, beta]
  );

  return (
    <div className="space-y-6">
      {/* Studio Top Bar & Mode Switcher */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Complete N-Gram Fuzzy Search Taxonomy · 5-Module Mastery Track · {NGRAM_ALGORITHMS.length} Algorithms + 10M Catalog Case Study
            </p>
            <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              N-Gram Fuzzy Search Architecture & Visual Lab
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-fit">
            {[
              { id: 'curriculum' as const, label: '5-Module Mastery Track' },
              { id: 'taxonomy' as const, label: '33-Algorithm Taxonomy Lab' },
              { id: 'pruning-sim' as const, label: 'Pruning Logic Simulator' },
              { id: 'case-study' as const, label: '10M Product Search Case Study' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setStudioMode(m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  studioMode === m.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {studioMode === 'taxonomy' && (
          <>
            {/* 4 Pipeline Stage Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              {NGRAM_STAGES.map((st) => {
                const active = st.id === stageId;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStage(st.id)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      active
                        ? 'border-sky-600 dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                      {st.shortTitle}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                      {st.pipelineRole}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stage Algorithm Selector Chips */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              {stageAlgorithms.map((algo, idx) => {
                const active = algo.id === algorithm.id;
                return (
                  <button
                    key={algo.id}
                    type="button"
                    onClick={() => handleSelectAlgo(algo)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap tabular-nums ${
                      active
                        ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {idx + 1}. {algo.shortName}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {studioMode === 'curriculum' ? (
        <FuzzyCurriculumTrack />
      ) : studioMode === 'case-study' ? (
        <ProductSearchCaseStudy onSelectNGramAlgo={handleJumpFromCaseStudy} />
      ) : studioMode === 'pruning-sim' ? (
        <PruningLogicSimulator />
      ) : (
        <>
          {/* Live Interactive Inputs Bar */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Live Sandbox Inputs · {activeStageMeta.title}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setStringA(p.a);
                      setStringB(p.b);
                      setStepIndex(0);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-sky-400"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label htmlFor="ng-str-a" className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  String A (Query)
                </label>
                <input
                  id="ng-str-a"
                  type="text"
                  value={stringA}
                  onChange={(e) => setStringA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="ng-str-b" className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  String B (Candidate)
                </label>
                <input
                  id="ng-str-b"
                  type="text"
                  value={stringB}
                  onChange={(e) => setStringB(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <label htmlFor="ng-size">Window n</label>
                  <strong className="text-sky-700 dark:text-sky-400 tabular-nums">n = {nGramSize}</strong>
                </div>
                <input
                  id="ng-size"
                  type="range"
                  min={2}
                  max={4}
                  step={1}
                  value={nGramSize}
                  onChange={(e) => setNGramSize(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <label htmlFor="ng-kskip">K-Skip Gap</label>
                  <strong className="text-sky-700 dark:text-sky-400 tabular-nums">k = {kSkip}</strong>
                </div>
                <input
                  id="ng-kskip"
                  type="range"
                  min={0}
                  max={2}
                  step={1}
                  value={kSkip}
                  onChange={(e) => setKSkip(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <label htmlFor="ng-editk">Max Edit Budget</label>
                  <strong className="text-sky-700 dark:text-sky-400 tabular-nums">edit &lt;= {maxEditK}</strong>
                </div>
                <input
                  id="ng-editk"
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={maxEditK}
                  onChange={(e) => setMaxEditK(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>
          </section>

          {/* Two-Zone Sandbox: Visual Stage (62%) + Code-Level Execution Trace (38%) */}
          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)] gap-5 items-stretch">
            {/* Left Zone: Graphical Visual Stage + Playback Controls */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {algorithm.subGroup}
                </div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {algorithm.name}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {algorithm.summary}
                </p>
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400 pt-1">
                  Formula: {algorithm.formula}
                </div>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  Complexity Reduction: {algorithm.complexityReduction}
                </div>
              </div>

              <NGramVisualStage
                algorithm={algorithm}
                stringA={stringA}
                stringB={stringB}
                n={nGramSize}
                kSkip={kSkip}
                alpha={alpha}
                beta={beta}
                maxEditK={maxEditK}
                stepIndex={safeStepIndex}
                metrics={metrics}
                onChangeAlpha={setAlpha}
                onChangeBeta={setBeta}
              />

              {/* Playback Bar */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isPlaying && safeStepIndex >= totalSteps - 1) setStepIndex(0);
                      setIsPlaying((p) => !p);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? 'Pause' : safeStepIndex >= totalSteps - 1 ? 'Replay' : 'Play Step Trace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex((i) => Math.max(0, i - 1));
                    }}
                    disabled={safeStepIndex === 0}
                    aria-label="Previous trace step"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-35"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex((i) => Math.min(totalSteps - 1, i + 1));
                    }}
                    disabled={safeStepIndex >= totalSteps - 1}
                    aria-label="Next trace step"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-35"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIndex(0);
                    }}
                    aria-label="Reset trace"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mr-1 tabular-nums">
                    Step {safeStepIndex + 1}/{totalSteps}
                  </span>
                  {SPEEDS.map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => setSpeedMs(sp.ms)}
                      className={`px-2 py-1 rounded text-xs font-mono border ${
                        speedMs === sp.ms
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Zone: Code-Level Synchronized Execution Trace */}
            <aside className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                    Code-Level Execution · Step {safeStepIndex + 1} of {totalSteps}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {activeTrace.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeTrace.detail}
                  </p>
                </div>

                {/* Synchronized Line-Highlighted Code Block */}
                <div className="rounded-lg border border-slate-800 bg-slate-950 py-2.5 overflow-x-auto font-mono text-[11px] leading-6">
                  {algorithm.codeLines.map((line, i) => {
                    const lineNo = i + 1;
                    const isActive = lineNo === activeTrace.activeLine;
                    return (
                      <div
                        key={lineNo}
                        className={`px-3 flex gap-3 transition-colors ${
                          isActive
                            ? 'bg-sky-500/25 text-sky-200 font-semibold'
                            : 'text-slate-300'
                        }`}
                      >
                        <span className="text-slate-500 select-none w-4 text-right tabular-nums">
                          {lineNo}
                        </span>
                        <span className="whitespace-pre">{line}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs font-mono text-emerald-800 dark:text-emerald-300">
                  State Invariant: {activeTrace.stateNote}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStudioMode('case-study')}
                className="w-full py-2.5 px-3 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 transition-colors"
              >
                See This in Action: 10M Product Search Pruning Dry Run →
              </button>
            </aside>
          </section>

          {/* Live All-12 Similarity Metrics Dashboard when on Stage 2 */}
          {stageId === 'similarity' && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                  Live Comparison Across All 12 Similarity & Distance Metrics ("{stringA}" vs "{stringB}")
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Click any metric to inspect its visual math
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {all12Rows.map((row) => {
                  const pct = Math.max(0, Math.min(100, Math.round(row.score * 100)));
                  const isSelected = row.id === algorithm.id;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => handleJumpFromCaseStudy(row.id)}
                      className={`text-left p-3 rounded-lg border transition-colors space-y-1.5 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {row.name}
                        </span>
                        <span className="font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums shrink-0">
                          {row.score.toFixed(3)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-sky-600 dark:bg-sky-400" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {row.group} · {pct}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Problem Solved, Complexity Reduction & Real-Life Production Use Cases */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400">
                1. Bottleneck / Problem Solved
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {algorithm.problemSolved}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                2. How It Reduces Complexity
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {algorithm.howItReducesComplexity}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                3. Real-Life Production Systems
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                {algorithm.realLifeUseCases.map((uc) => (
                  <li key={uc}>{uc}</li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
