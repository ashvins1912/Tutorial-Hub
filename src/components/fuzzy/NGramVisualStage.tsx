import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { NGramAlgorithmEntry } from '../../data/ngramTaxonomy';
import {
  computeSimpleMetaphone,
  computeSoundex,
  extractCharNGrams,
  extractEdgeNGrams,
  extractKSkipNGrams,
  extractPaddedNGrams,
  extractVariableNGrams,
  extractWordNGrams,
  levenshteinDistance,
  runBpeMerges,
  simulateBkTree,
  simulateBloomFilter,
  simulateMinHashLsh,
  simulateNgTree,
  simulatePruningFunnel,
  simulateSimHash,
  type SimilarityMetricsBundle,
} from '../../utils/ngramEngine';

interface NGramVisualStageProps {
  algorithm: NGramAlgorithmEntry;
  stringA: string;
  stringB: string;
  n: number;
  kSkip: number;
  alpha: number;
  beta: number;
  maxEditK: number;
  stepIndex: number;
  metrics: SimilarityMetricsBundle;
  onChangeAlpha?: (v: number) => void;
  onChangeBeta?: (v: number) => void;
}

export function NGramVisualStage({
  algorithm,
  stringA,
  stringB,
  n,
  kSkip,
  alpha,
  beta,
  maxEditK,
  stepIndex,
  metrics,
  onChangeAlpha,
  onChangeBeta,
}: NGramVisualStageProps) {
  const mode = algorithm.visualMode;
  const cleanA = stringA.trim().toLowerCase() || 'algorithm';
  const cleanB = stringB.trim().toLowerCase() || 'algoritm';

  // Stage 1 derived spans
  const charSpans = useMemo(() => extractCharNGrams(cleanA, n), [cleanA, n]);
  const edgeSpans = useMemo(() => extractEdgeNGrams(cleanA, 2, Math.max(4, n + 2)), [cleanA, n]);
  const paddedData = useMemo(() => extractPaddedNGrams(cleanA, n), [cleanA, n]);
  const skipSpans = useMemo(() => extractKSkipNGrams(cleanA, Math.min(n, 3), kSkip), [cleanA, n, kSkip]);
  const wordData = useMemo(() => extractWordNGrams(cleanA, Math.min(n, 3)), [cleanA, n]);
  const variableSpans = useMemo(() => extractVariableNGrams(cleanA), [cleanA]);
  const bpeSteps = useMemo(() => runBpeMerges(cleanA, 4), [cleanA]);

  // Stage 3 derived simulations
  const funnel = useMemo(() => simulatePruningFunnel(cleanA, n, maxEditK), [cleanA, n, maxEditK]);
  const minHash = useMemo(() => simulateMinHashLsh(cleanA, cleanB, n), [cleanA, cleanB, n]);
  const simHash = useMemo(() => simulateSimHash(cleanA, cleanB, n), [cleanA, cleanB, n]);
  const bloom = useMemo(() => simulateBloomFilter(cleanA, cleanB, n), [cleanA, cleanB, n]);

  // Stage 4 derived simulations
  const bkNodes = useMemo(() => simulateBkTree(cleanA, maxEditK), [cleanA, maxEditK]);
  const ngNodes = useMemo(() => simulateNgTree(cleanA, n), [cleanA, n]);

  // Helper: pick active span based on animation step
  const pickActiveIdx = (len: number) => (len === 0 ? 0 : Math.min(len - 1, stepIndex % len));

  // =========================================================================
  // STAGE 1: TOKENIZATION RENDERERS
  // =========================================================================
  if (mode === 'tok-char' || mode === 'tok-edge' || mode === 'tok-padded' || mode === 'tok-skip' || mode === 'tok-variable') {
    const displayStr = mode === 'tok-padded' ? paddedData.padded : cleanA;
    const spans =
      mode === 'tok-char'
        ? charSpans
        : mode === 'tok-edge'
          ? edgeSpans
          : mode === 'tok-padded'
            ? paddedData.spans
            : mode === 'tok-skip'
              ? skipSpans
              : variableSpans;
    const activeIdx = pickActiveIdx(spans.length);
    const activeSpan = spans[activeIdx];
    const activeSet = new Set(activeSpan?.indices ?? []);

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>
              Active Window: <strong className="text-sky-700 dark:text-sky-400">"{activeSpan?.token ?? ''}"</strong>
              {activeSpan?.label ? ` · ${activeSpan.label}` : ''}
            </span>
            <span className="tabular-nums">
              Emitted: {spans.length} tokens · indices [{(activeSpan?.indices ?? []).join(', ')}]
            </span>
          </div>

          {/* Character Strip with animated active frame */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center py-2">
            {displayStr.split('').map((ch, idx) => {
              const isInWindow = activeSet.has(idx);
              const isPad = mode === 'tok-padded' && ch === '_';
              const isSkippedGap =
                mode === 'tok-skip' &&
                activeSpan &&
                idx > activeSpan.indices[0] &&
                idx < activeSpan.indices[activeSpan.indices.length - 1] &&
                !isInWindow;

              return (
                <motion.div
                  key={`${idx}-${ch}`}
                  layout
                  animate={{ y: isInWindow ? -5 : 0, scale: isInWindow ? 1.06 : 1 }}
                  transition={{ duration: 0.22 }}
                  className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center font-mono transition-colors ${
                    isInWindow
                      ? 'border-sky-600 dark:border-sky-400 bg-sky-100 dark:bg-sky-900/60 text-sky-950 dark:text-sky-100 font-bold'
                      : isSkippedGap
                        ? 'border-dashed border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                        : isPad
                          ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm leading-none">{ch === ' ' ? '␣' : ch}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 tabular-nums">{idx}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Emitted N-Gram Token Stream */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2">
              Generated Sub-Units ({spans.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {spans.slice(0, 18).map((sp, i) => (
                <span
                  key={`${sp.token}-${i}`}
                  className={`px-2 py-1 rounded border text-xs font-mono transition-colors ${
                    i === activeIdx
                      ? 'border-sky-600 dark:border-sky-400 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sp.token}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'tok-word') {
    const activeIdx = pickActiveIdx(wordData.spans.length);
    const activeSpan = wordData.spans[activeIdx];
    const activeSet = new Set(activeSpan?.indices ?? []);
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          W-Shingling Window (w = {Math.min(n, wordData.words.length)}) · Active Shingle:{' '}
          <strong className="text-sky-700 dark:text-sky-400">"{activeSpan?.token}"</strong>
        </div>
        <div className="flex flex-wrap items-center gap-2 py-2 justify-center">
          {wordData.words.map((w, idx) => (
            <motion.div
              key={`${w}-${idx}`}
              animate={{ y: activeSet.has(idx) ? -4 : 0 }}
              className={`px-3 py-2 rounded-lg border font-mono text-xs ${
                activeSet.has(idx)
                  ? 'border-sky-600 dark:border-sky-400 bg-sky-100 dark:bg-sky-900/50 text-sky-950 dark:text-sky-100 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              {w}
            </motion.div>
          ))}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex flex-wrap gap-2">
          {wordData.spans.map((sp, i) => (
            <span
              key={i}
              className={`px-2.5 py-1 rounded border text-xs font-mono ${
                i === activeIdx
                  ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              [{sp.token}]
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'tok-bpe') {
    const activeRound = bpeSteps[Math.min(stepIndex, Math.max(0, bpeSteps.length - 1))];
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-400">
            Statistical BPE Merge Rounds ({bpeSteps.length} merges learned)
          </span>
          {activeRound && (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Round {activeRound.round}: ({activeRound.pair[0]} + {activeRound.pair[1]}) → "{activeRound.merged}" (freq {activeRound.frequency})
            </span>
          )}
        </div>
        <div className="space-y-2">
          {bpeSteps.map((st, idx) => (
            <div
              key={st.round}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-colors ${
                idx === Math.min(stepIndex, bpeSteps.length - 1)
                  ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                <span>
                  Merge #{st.round}: <strong className="text-slate-900 dark:text-slate-100">{st.pair[0]} + {st.pair[1]} → {st.merged}</strong>
                </span>
                <span className="tabular-nums">pair count = {st.frequency}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {st.tokens.map((tok, tIdx) => (
                  <span
                    key={tIdx}
                    className={`px-1.5 py-0.5 rounded border ${
                      tok === st.merged
                        ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tok}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: SIMILARITY & DISTANCE RENDERERS
  // =========================================================================
  if (mode === 'sim-set' || mode === 'sim-tversky' || mode === 'sim-vector') {
    const score = algorithm.metricKey ? metrics[algorithm.metricKey] : metrics.jaccard;
    const pct = Math.round(score * 100);

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
        {/* Live Score Readout Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
            |A| = {metrics.setA.length} · |B| = {metrics.setB.length} · |A ∩ B| ={' '}
            <strong className="text-emerald-700 dark:text-emerald-400">{metrics.intersection.length}</strong> · |A ∪ B| = {metrics.union.length}
          </div>
          <div className="text-sm font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums">
            {algorithm.shortName}: {score.toFixed(3)} ({pct}%)
          </div>
        </div>

        {/* Interactive α / β Sliders for Tversky Index */}
        {mode === 'sim-tversky' && onChangeAlpha && onChangeBeta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1">
                <span>α (penalty on missing A \ B)</span>
                <strong className="text-sky-700 dark:text-sky-300 tabular-nums">{alpha.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={alpha}
                onChange={(e) => onChangeAlpha(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>β (penalty on extra B \ A)</span>
                <strong className="text-sky-700 dark:text-sky-300 tabular-nums">{beta.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={beta}
                onChange={(e) => onChangeBeta(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>
        )}

        {/* 3-Column Set Venn Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Only in A ({metrics.onlyA.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {metrics.onlyA.map((g) => (
                <span key={g} className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {g}
                </span>
              ))}
              {metrics.onlyA.length === 0 && <span className="text-slate-400">None</span>}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Shared A ∩ B ({metrics.intersection.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {metrics.intersection.map((g) => (
                <span key={g} className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-semibold border border-emerald-300 dark:border-emerald-700">
                  {g}
                </span>
              ))}
              {metrics.intersection.length === 0 && <span className="text-slate-400">None</span>}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
              Only in B ({metrics.onlyB.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {metrics.onlyB.map((g) => (
                <span key={g} className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {g}
                </span>
              ))}
              {metrics.onlyB.length === 0 && <span className="text-slate-400">None</span>}
            </div>
          </div>
        </div>

        {/* Visual Score Bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.35 }}
              className="h-full bg-sky-600 dark:bg-sky-400"
            />
          </div>
          {mode === 'sim-vector' && (
            <div className="flex flex-wrap justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums pt-1">
              <span>Binary Cosine: {metrics.cosineBinary.toFixed(3)}</span>
              <span>TF-IDF Cosine: {metrics.cosineTfIdf.toFixed(3)}</span>
              <span>Okapi BM25: {metrics.okapiBm25.toFixed(3)}</span>
              <span>Soft TF-IDF: {metrics.softTfIdf.toFixed(3)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'sim-ukkonen') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-300">
            Ukkonen L1 Profile Distance: <strong className="text-rose-700 dark:text-rose-400">{metrics.ukkonenL1Distance}</strong>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
            Provable Edit Lower Bound: ceil({metrics.ukkonenL1Distance} / {2 * n}) = {Math.ceil(metrics.ukkonenL1Distance / (2 * n))}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {metrics.freqDiffs.slice(0, 12).map((row) => (
            <div
              key={row.gram}
              className={`p-2 rounded-lg border ${
                row.diff === 0
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">"{row.gram}"</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                A:{row.countA} · B:{row.countB} · |Δ|={row.diff}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'sim-levenshtein') {
    const gA = metrics.gramsA.slice(0, 7);
    const gB = metrics.gramsB.slice(0, 7);
    const dp = metrics.ngramDpMatrix;
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-300">
            Order-Aware N-Gram Alignment Grid (showing first {gA.length}×{gB.length} grams)
          </span>
          <span className="text-sky-700 dark:text-sky-400 font-semibold tabular-nums">
            N-Gram Edit Dist: {metrics.ngramLevenshteinDist} · Kondrak Sim: {metrics.kondrakPositional.toFixed(3)}
          </span>
        </div>
        <table className="w-full text-center font-mono text-[11px] border-collapse">
          <thead>
            <tr>
              <th className="p-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400">
                A \ B
              </th>
              <th className="p-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-400">
                ∅
              </th>
              {gB.map((gb, j) => (
                <th key={j} className="p-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  {gb}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: gA.length + 1 }).map((_, i) => (
              <tr key={i}>
                <td className="p-1.5 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
                  {i === 0 ? '∅' : gA[i - 1]}
                </td>
                {Array.from({ length: gB.length + 1 }).map((__, j) => {
                  const isDiagMatch = i > 0 && j > 0 && gA[i - 1] === gB[j - 1];
                  const isCorner = i === gA.length && j === gB.length;
                  return (
                    <td
                      key={j}
                      className={`p-1.5 border border-slate-200 dark:border-slate-800 tabular-nums ${
                        isCorner
                          ? 'bg-sky-600 text-white font-bold'
                          : isDiagMatch
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 font-semibold'
                            : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {dp[i]?.[j] ?? 0}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // =========================================================================
  // STAGE 3: INDEXING, FILTERING & RETRIEVAL RENDERERS
  // =========================================================================
  if (mode === 'ret-inverted') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3">
        <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
          Inverted Index Posting Lists for Query "{cleanA}" (12-doc mini corpus)
        </div>
        <div className="space-y-2">
          {funnel.postingLists.map((pl, idx) => (
            <div
              key={pl.gram}
              className={`flex flex-wrap items-center gap-2 p-2.5 rounded-lg border font-mono text-xs ${
                idx === stepIndex % Math.max(1, funnel.postingLists.length)
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <span className="px-2 py-0.5 rounded bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-bold min-w-[54px] text-center">
                "{pl.gram}"
              </span>
              <span className="text-slate-400">→</span>
              {pl.docIds.length === 0 ? (
                <span className="text-slate-400">[]</span>
              ) : (
                pl.docIds.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 tabular-nums"
                  >
                    Doc #{id}
                  </span>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'ret-funnel' || mode === 'ret-wand') {
    const total = funnel.candidates.length;
    const lenSurvivors = funnel.candidates.filter((c) => c.passLength).length;
    const cntSurvivors = funnel.candidates.filter((c) => c.passCount).length;
    const preSurvivors = funnel.candidates.filter((c) => c.passPrefix).length;
    const exactMatches = funnel.candidates.filter((c) => c.editDistance <= maxEditK).length;

    const funnelStages = [
      { label: '1. Raw Corpus', count: total, scaled: '10,000 docs', pct: 100 },
      { label: `2. Length Filter (|Δ| <= ${maxEditK})`, count: lenSurvivors, scaled: `${Math.round((lenSurvivors / total) * 10000)} docs`, pct: Math.round((lenSurvivors / total) * 100) },
      { label: `3. Count Filter (shared >= ${funnel.countThreshold})`, count: cntSurvivors, scaled: `${Math.round((cntSurvivors / total) * 10000)} docs`, pct: Math.round((cntSurvivors / total) * 100) },
      { label: `4. Prefix / WAND Gate (prefix ${funnel.prefixLen})`, count: preSurvivors, scaled: `${Math.round((preSurvivors / total) * 10000)} docs`, pct: Math.round((preSurvivors / total) * 100) },
      { label: `5. Exact Verified (ed <= ${maxEditK})`, count: exactMatches, scaled: `${exactMatches} exact`, pct: Math.max(8, Math.round((exactMatches / total) * 100)) },
    ];

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-300">
            Candidate Retrieval Pruning Funnel · Query "{cleanA}" · maxEdit k = {maxEditK}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
            T = {funnel.countThreshold} · Rare Prefix = {funnel.prefixLen}
          </span>
        </div>

        {/* Graphical Pruning Funnel Bars */}
        <div className="space-y-2">
          {funnelStages.map((st, idx) => (
            <div key={st.label} className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className={idx === stepIndex % funnelStages.length ? 'font-bold text-sky-700 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400'}>
                  {st.label}
                </span>
                <span className="tabular-nums text-slate-700 dark:text-slate-200">
                  {st.count}/{total} ({st.scaled})
                </span>
              </div>
              <div className="h-2.5 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.max(4, st.pct)}%` }}
                  className={`h-full ${
                    idx === funnelStages.length - 1
                      ? 'bg-emerald-500'
                      : idx === stepIndex % funnelStages.length
                        ? 'bg-sky-600 dark:bg-sky-400'
                        : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Per-Document Pruning Status Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono pt-1">
          {funnel.candidates.slice(0, 9).map((c) => {
            const survived = c.passCount && c.passPrefix;
            return (
              <div
                key={c.id}
                className={`p-2 rounded-lg border ${
                  c.editDistance <= maxEditK
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : survived
                      ? 'border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 opacity-60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  #{c.id} {c.doc}
                </div>
                <div className="text-slate-500 dark:text-slate-400 tabular-nums">
                  shared:{c.sharedGrams} · ed:{c.editDistance} · {c.passCount ? 'KEEP' : 'PRUNED'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'ret-minhash') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
          <span>
            MinHash Est. Jaccard: <strong className="text-sky-700 dark:text-sky-400">{minHash.estimatedJaccard.toFixed(3)}</strong> (Exact: {minHash.exactJaccard.toFixed(3)})
          </span>
          <span className={minHash.anyBandCollision ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
            LSH 4×2 Bands: {minHash.anyBandCollision ? 'CANDIDATE COLLISION!' : 'No Band Collision'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
          {minHash.bands.map((band) => (
            <div
              key={band.bandIndex}
              className={`p-2.5 rounded-lg border space-y-1 ${
                band.collided
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Band {band.bandIndex} {band.collided ? '· HIT' : ''}
              </div>
              <div className="text-slate-500 dark:text-slate-400 tabular-nums">A: [{band.bucketA}]</div>
              <div className="text-slate-500 dark:text-slate-400 tabular-nums">B: [{band.bucketB}]</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'ret-simhash') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap justify-between gap-2 tabular-nums">
          <span>16-Bit SimHash Fingerprint Comparison</span>
          <span className="font-semibold text-sky-700 dark:text-sky-400">
            Hamming Dist (A ⊕ B): {simHash.hammingDistance} / 16 · Sim {(simHash.similarity * 100).toFixed(0)}%
          </span>
        </div>
        {[
          { label: `A ("${cleanA.slice(0, 10)}")`, bits: simHash.bitsA, isXor: false },
          { label: `B ("${cleanB.slice(0, 10)}")`, bits: simHash.bitsB, isXor: false },
          { label: 'XOR (diff = 1)', bits: simHash.xorBits, isXor: true },
        ].map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.label}</div>
            <div className="grid grid-cols-16 gap-1">
              {row.bits.map((b, i) => (
                <div
                  key={i}
                  className={`py-1 rounded text-center font-bold border ${
                    row.isXor
                      ? b === 1
                        ? 'border-rose-500 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
                        : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                      : b === 1
                        ? 'border-sky-400 bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'ret-bloom') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap justify-between gap-2 tabular-nums">
          <span>16-Bit Bloom N-Gram Block Filter (Indexed Doc: "{cleanB}")</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            Query Hit Ratio: {Math.round(bloom.hitRatio * 100)}% · False Positives: {bloom.falsePositiveChecks}
          </span>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
          {bloom.bits.map((set, i) => (
            <div
              key={i}
              className={`p-1.5 rounded border text-center ${
                set
                  ? 'border-sky-500 bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100 font-bold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
              }`}
            >
              <div className="text-[9px] text-slate-400">{i}</div>
              <div>{set ? 1 : 0}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {bloom.queryChecks.slice(0, 8).map((q) => (
            <span
              key={q.gram}
              className={`px-2 py-0.5 rounded border text-[11px] ${
                q.present
                  ? q.trueMatch
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
              }`}
            >
              "{q.gram}" [{q.h1},{q.h2}] {q.present ? (q.trueMatch ? 'HIT' : 'FP') : 'SKIP'}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 4: HYBRID & PHONETIC RENDERERS
  // =========================================================================
  if (mode === 'hyb-phonetic') {
    const sA = computeSoundex(cleanA);
    const sB = computeSoundex(cleanB);
    const mA = computeSimpleMetaphone(cleanA);
    const mB = computeSimpleMetaphone(cleanB);
    const mgA = extractCharNGrams(mA, 2).map((x) => x.token);
    const mgB = extractCharNGrams(mB, 2).map((x) => x.token);

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-4 font-mono text-xs">
        <div className="text-slate-600 dark:text-slate-300">
          Acoustic Normalization → Phonetic N-Gram Pipeline (Try "Stephen" vs "Steven")
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'String A', raw: cleanA, soundex: sA, meta: mA, grams: mgA },
            { label: 'String B', raw: cleanB, soundex: sB, meta: mB, grams: mgB },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-[11px] text-slate-500">{item.label}: "{item.raw}"</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-200 font-bold">
                  Soundex: {item.soundex}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-bold">
                  Metaphone: {item.meta}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Phonetic 2-grams: [{item.grams.join(', ')}]
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'hyb-twostage') {
    const stage1Candidates = funnel.candidates.filter((c) => c.passCount || c.sharedGrams >= 2);
    const verified = stage1Candidates.filter((c) => levenshteinDistance(cleanA, c.doc) <= maxEditK);
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="text-[11px] text-sky-700 dark:text-sky-400 font-bold">Stage 1: N-Gram Filter</div>
            <div className="text-slate-600 dark:text-slate-300">{funnel.candidates.length} docs → {stage1Candidates.length} candidates</div>
            <div className="text-[11px] text-slate-400">O(1) posting lookups</div>
          </div>
          <div className="p-3 rounded-lg border border-sky-400 dark:border-sky-700 bg-sky-50/60 dark:bg-sky-950/40 space-y-1">
            <div className="text-[11px] text-sky-700 dark:text-sky-300 font-bold">Stage 2: Levenshtein DFA</div>
            <div className="text-slate-700 dark:text-slate-200">Accepts edit distance &lt;= {maxEditK}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Linear O(|w|) state transitions</div>
          </div>
          <div className="p-3 rounded-lg border border-emerald-400 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-1">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">Exact Verified Results</div>
            <div className="text-slate-900 dark:text-slate-100 font-semibold">
              {verified.map((v) => v.doc).join(', ') || 'None within k'}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400">100% recall + exact bound</div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'hyb-bktree') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3 font-mono text-xs">
        <div className="text-slate-600 dark:text-slate-300">
          BK-Tree Triangle-Inequality Traversal · Query "{cleanA}" · Radius k = {maxEditK}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {bkNodes.map((node) => (
            <div
              key={node.word}
              className={`p-2.5 rounded-lg border ${
                node.status === 'match'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                  : node.status === 'visited'
                    ? 'border-sky-400 bg-white dark:bg-slate-900'
                    : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/40 opacity-55'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100">{node.word}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                {node.parent ? `edge=${node.edgeDist} from ${node.parent}` : 'ROOT'}
              </div>
              <div className="text-[11px] mt-1 font-semibold tabular-nums">
                d={node.queryDist} · {node.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: hyb-ngtree
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3 font-mono text-xs">
      <div className="text-slate-600 dark:text-slate-300">
        NG-Tree / Shared-Prefix Q-Gram Trie · Query "{cleanA}"
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ngNodes.map((node) => (
          <div
            key={node.prefix}
            className={`p-2.5 rounded-lg border space-y-1 ${
              node.matchedQuery
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-65'
            }`}
          >
            <div className="font-bold text-sky-700 dark:text-sky-400">
              prefix "{node.prefix}*" {node.matchedQuery ? '· HIT' : '· SKIP'}
            </div>
            <div className="text-[11px] text-slate-700 dark:text-slate-300">
              leaves: {node.grams.join(', ')}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              docs: {node.docs.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
