import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { extractPaddedNGrams } from '../../utils/ngramEngine';

interface ProductRecord {
  id: number;
  title: string;
}

const DEFAULT_PRODUCTS: ProductRecord[] = [
  { id: 101, title: 'apple iphone 15 pro' },
  { id: 102, title: 'apple airpods pro' },
  { id: 103, title: 'samsung galaxy s24' },
  { id: 104, title: 'apple iphone 15 pro max' },
  { id: 105, title: 'wireless noise cancelling headphones' },
];

interface ProductSearchCaseStudyProps {
  onSelectNGramAlgo: (algoId: string) => void;
}

const ARCHITECTURE_STAGES = [
  {
    stage: 1,
    name: '1. Preprocessing',
    dsaTopic: 'String Manipulation & Sliding Window',
    technique: 'Padded Character Trigrams (n=3)',
    role: 'Pad ("  " + s + "  ") and slide window of size 3 so edge typos and missing spaces still generate overlapping tokens.',
    algoStudioId: 'sliding-window',
    ngramAlgoId: 'padded-ngrams',
  },
  {
    stage: 2,
    name: '2. Indexing',
    dsaTopic: 'Hash Maps & Sorted Arrays',
    technique: 'Inverted Index (Posting Lists)',
    role: 'Map each trigram → sorted product_id[]. Cache total trigram count |D| per product_id in an array for O(1) lookup.',
    algoStudioId: 'prefix-sum-hash',
    ngramAlgoId: 'inverted-index-postings',
  },
  {
    stage: 3,
    name: '3. Pruning Gate',
    dsaTopic: 'Mathematical Bounds & Binary Search',
    technique: 'Length & Count Filtering',
    role: 'Before scoring, skip any doc with |D| < threshold·|Q| or |D| > |Q|/threshold, or shared < T.',
    algoStudioId: 'binary-search',
    ngramAlgoId: 'length-filtering',
  },
  {
    stage: 4,
    name: '4. Candidate Retrieval',
    dsaTopic: 'Merge Algorithms / Hash Counting',
    technique: 'Posting List Merging & Accumulation',
    role: 'Traverse posting lists for query trigrams and accumulate exact intersection counts |Q ∩ D|.',
    algoStudioId: 'merge-sort',
    ngramAlgoId: 'count-filtering',
  },
  {
    stage: 5,
    name: '5. Exact Scoring',
    dsaTopic: 'Set Theory',
    technique: 'O(1) Cached-Size Jaccard / Dice',
    role: 'Compute Jaccard = |Q ∩ D| / (|Q| + |D| - |Q ∩ D|) in O(1) without rebuilding sets.',
    algoStudioId: 'prefix-sum-hash',
    ngramAlgoId: 'jaccard-similarity',
  },
  {
    stage: 6,
    name: '6. Top-K Selection',
    dsaTopic: 'Heaps (Priority Queue)',
    technique: 'Bounded Min-Heap of Size k',
    role: 'Track top-k tuples (score, -title.length, -product_id) in O(C log k) instead of sorting all C candidates.',
    algoStudioId: 'heap-intervals',
    ngramAlgoId: 'wand-blockmax',
  },
  {
    stage: 7,
    name: '7. Scale Compression',
    dsaTopic: 'Bit Manipulation / Compression',
    technique: 'Roaring Bitmaps / VarByte Encoding',
    role: 'Compress 10M posting lists into RAM and accelerate bitwise intersection via SIMD.',
    algoStudioId: 'bit-manipulation',
    ngramAlgoId: 'bloom-filter-ngrams',
  },
] as const;

export function ProductSearchCaseStudy({ onSelectNGramAlgo }: ProductSearchCaseStudyProps) {
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);

  const [query, setQuery] = useState('aple iphon');
  const [topK, setTopK] = useState(2);
  const [threshold, setThreshold] = useState(0.3);
  const [dryRunStep, setDryRunStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = 6;

  useEffect(() => {
    if (!isPlaying) return;
    if (dryRunStep >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setDryRunStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [isPlaying, dryRunStep]);

  // Live deterministic pruning math calculation on the catalog
  const dryRun = useMemo(() => {
    const cleanQ = query.trim().toLowerCase() || 'aple iphon';
    const qPadded = extractPaddedNGrams(cleanQ, 3);
    const qSet = new Set(qPadded.spans.map((s) => s.token));
    const qSize = qSet.size;

    const minAllowedD = Math.ceil(threshold * qSize);
    const maxAllowedD = threshold > 0 ? Math.floor(qSize / threshold) : Infinity;

    const evaluated = DEFAULT_PRODUCTS.map((prod) => {
      const dPadded = extractPaddedNGrams(prod.title.toLowerCase(), 3);
      const dSet = new Set(dPadded.spans.map((s) => s.token));
      const dSize = dSet.size;
      const sharedGrams = Array.from(qSet).filter((g) => dSet.has(g));
      const inter = sharedGrams.length;
      const passesLengthBound = dSize >= minAllowedD && dSize <= maxAllowedD;

      // Minimum intersection required for Jaccard >= threshold:
      // inter / (|Q| + |D| - inter) >= t  =>  inter >= ceil( (t / (1 + t)) * (|Q| + |D|) )
      const minInterNeeded = Math.ceil((threshold / (1 + threshold)) * (qSize + dSize));
      const passesCountBound = passesLengthBound && inter >= minInterNeeded;

      const unionSize = qSize + dSize - inter;
      const jaccard = unionSize === 0 ? 0 : inter / unionSize;
      const dice = qSize + dSize === 0 ? 0 : (2 * inter) / (qSize + dSize);
      const passesThreshold = jaccard >= threshold;

      return {
        ...prod,
        dSize,
        sharedGrams,
        inter,
        unionSize,
        minInterNeeded,
        passesLengthBound,
        passesCountBound,
        jaccard,
        dice,
        passesThreshold,
      };
    });

    // Exact tie-breaking: higher score -> shorter title -> smaller product_id
    const ranked = [...evaluated]
      .filter((e) => e.passesThreshold)
      .sort((a, b) => {
        if (Math.abs(b.jaccard - a.jaccard) > 1e-9) return b.jaccard - a.jaccard;
        if (a.title.length !== b.title.length) return a.title.length - b.title.length;
        return a.id - b.id;
      })
      .slice(0, topK);

    return {
      cleanQ,
      qGrams: Array.from(qSet),
      qSize,
      minAllowedD,
      maxAllowedD,
      evaluated,
      ranked,
    };
  }, [query, topK, threshold]);

  const stepMeta = [
    {
      title: 'Step 1 · Normalize & Pad Query Trigrams',
      stageHighlight: 1,
      note: `Normalize "${dryRun.cleanQ}" to lowercase, pad with 2 boundary sentinels, and slide n=3 window to produce |Q| = ${dryRun.qSize} unique trigrams.`,
    },
    {
      title: 'Step 2 · Inverted Index & Cached Size Lookup',
      stageHighlight: 2,
      note: `Look up posting lists for the ${dryRun.qSize} query trigrams in O(|Q|) hash probes. Each product's cached trigram count |D| is read in O(1) RAM.`,
    },
    {
      title: 'Step 3 · Mathematical Length-Bound Pruning',
      stageHighlight: 3,
      note: `For Jaccard >= ${threshold.toFixed(2)}, any candidate MUST satisfy ${dryRun.minAllowedD} <= |D| <= ${dryRun.maxAllowedD} (threshold·|Q| <= |D| <= |Q|/threshold). Out-of-range products are skipped in O(1)!`,
    },
    {
      title: 'Step 4 · Posting Accumulation & Count Lower Bound',
      stageHighlight: 4,
      note: `Accumulate |Q ∩ D| across posting lists. Rearranging Jaccard >= t proves candidates need |Q ∩ D| >= ceil((t/(1+t)) · (|Q|+|D|)).`,
    },
    {
      title: 'Step 5 · Exact O(1) Jaccard Scoring',
      stageHighlight: 5,
      note: `Compute Jaccard = |Q ∩ D| / (|Q| + |D| - |Q ∩ D|) in constant O(1) arithmetic using cached counts—zero string DP!`,
    },
    {
      title: 'Step 6 · Bounded Min-Heap Top-K + Tie-Breaking',
      stageHighlight: 6,
      note: `Maintain Min-Heap of size k=${topK} ordered by (score, -title.length, -product_id) in O(C log k). Final output: [${dryRun.ranked.map((r) => r.id).join(', ')}].`,
    },
  ];

  const activeStep = stepMeta[dryRunStep] ?? stepMeta[0];

  return (
    <div className="space-y-6">
      {/* Problem Statement & Constraints */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              System Design & Interview Blueprint · 10M Product Catalog · &lt; 20 ms P99 Latency
            </p>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              High-Throughput Typo-Tolerant Product Search
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Design an in-memory search module supporting{' '}
              <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                index(product_id, title)
              </code>{' '}
              and{' '}
              <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                search(query, k, threshold)
              </code>{' '}
              across 10⁷ product titles (L ≤ 60) with &lt; 20 ms P99 latency, resilient to single-char typos, transpositions, and missing spaces.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 text-xs font-mono space-y-1 shrink-0">
            <div className="text-slate-500 dark:text-slate-400">Optimal Complexity</div>
            <div className="text-slate-900 dark:text-slate-100">Index: <strong>O(L)</strong> per product</div>
            <div className="text-slate-900 dark:text-slate-100">Search: <strong>O(Σ|Postings| + C log k)</strong></div>
            <div className="text-emerald-700 dark:text-emerald-400">Tie-Break: score ↓ · |title| ↑ · id ↑</div>
          </div>
        </div>

        {/* 3 Pattern Identification Clues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {[
            {
              clue: '1. "10M titles" + "< 20 ms P99"',
              why: 'Eliminates O(N·L·M) global edit-distance DP scans.',
              pattern: 'Filter-and-Refine via Inverted Index',
            },
            {
              clue: '2. "Typos, transpositions, missing spaces"',
              why: 'Breaks exact word hashing and standard prefix tries on first-letter typos.',
              pattern: 'Padded Character Trigrams (Sliding Window)',
            },
            {
              clue: '3. "Score >= threshold" + "Top k"',
              why: 'Avoids full O(C log C) sort and prunes impossible candidates early.',
              pattern: 'Jaccard Bound Pruning + Bounded Min-Heap',
            },
          ].map((item) => (
            <div
              key={item.clue}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1"
            >
              <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                {item.clue}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.why}</p>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 pt-0.5">
                → {item.pattern}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technically Accurate Animated 7-Stage Pipeline Architecture + Live Dry Run */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              Interactive Architecture Flow & Step-by-Step Pruning Math Dry Run
            </p>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeStep.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (!isPlaying && dryRunStep >= totalSteps - 1) setDryRunStep(0);
                setIsPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause Dry Run' : dryRunStep >= totalSteps - 1 ? 'Replay Dry Run' : 'Animate Pruning Math'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setDryRunStep((s) => Math.max(0, s - 1));
              }}
              disabled={dryRunStep === 0}
              aria-label="Previous dry-run step"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-35"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setDryRunStep((s) => Math.min(totalSteps - 1, s + 1));
              }}
              disabled={dryRunStep >= totalSteps - 1}
              aria-label="Next dry-run step"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-35"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setDryRunStep(0);
              }}
              aria-label="Reset dry run"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated 7-Node Pipeline Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {ARCHITECTURE_STAGES.map((st) => {
            const isActive = activeStep.stageHighlight === st.stage;
            const isPassed = activeStep.stageHighlight > st.stage;
            return (
              <div
                key={st.stage}
                className={`p-3 rounded-lg border transition-all space-y-1.5 flex flex-col justify-between ${
                  isActive
                    ? 'border-sky-600 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/50 ring-2 ring-sky-500/25'
                    : isPassed
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-400">
                    {st.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {st.technique}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectNGramAlgo(st.ngramAlgoId)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400 hover:underline pt-1 text-left"
                >
                  Inspect stage
                  <ArrowRight className="w-3 h-3 shrink-0" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Step Narrative Banner */}
        <div className="rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 p-3.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
          {activeStep.note}
        </div>

        {/* Live Editable Query Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-xs">
          <div className="space-y-1">
            <label htmlFor="case-query" className="font-mono font-semibold text-slate-600 dark:text-slate-300 block">
              Query String
            </label>
            <input
              id="case-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono">
              <label htmlFor="case-thresh" className="font-semibold text-slate-600 dark:text-slate-300">
                Jaccard Threshold (t)
              </label>
              <strong className="text-sky-700 dark:text-sky-400 tabular-nums">{threshold.toFixed(2)}</strong>
            </div>
            <input
              id="case-thresh"
              type="range"
              min={0.1}
              max={0.8}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono">
              <label htmlFor="case-topk" className="font-semibold text-slate-600 dark:text-slate-300">
                Top-K Heap Size (k)
              </label>
              <strong className="text-sky-700 dark:text-sky-400 tabular-nums">k = {topK}</strong>
            </div>
            <input
              id="case-topk"
              type="range"
              min={1}
              max={4}
              step={1}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        </div>

        {/* Live Mathematical Pruning Proof & Per-Product Evaluation Table */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 tabular-nums">
              Query |Q| = <strong>{dryRun.qSize}</strong> trigrams · Length Gate:{' '}
              <strong className="text-sky-700 dark:text-sky-400">
                [{dryRun.minAllowedD} .. {dryRun.maxAllowedD}]
              </strong>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
              Returned Top-{topK}: [{dryRun.ranked.map((r) => r.id).join(', ') || 'none'}]
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5 text-right">|D|</th>
                  <th className="p-2.5 text-center">Length Gate</th>
                  <th className="p-2.5 text-right">|Q ∩ D| (Need)</th>
                  <th className="p-2.5 text-right">Jaccard</th>
                  <th className="p-2.5 text-right">Min-Heap Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {dryRun.evaluated.map((row) => {
                  const inTopK = dryRun.ranked.some((r) => r.id === row.id);
                  return (
                    <tr
                      key={row.id}
                      className={
                        inTopK
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/25'
                          : !row.passesLengthBound
                            ? 'bg-rose-50/40 dark:bg-rose-950/15 opacity-75'
                            : 'bg-white dark:bg-slate-900'
                      }
                    >
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          #{row.id} "{row.title}"
                        </div>
                        {row.sharedGrams.length > 0 && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[300px]">
                            shared: {row.sharedGrams.slice(0, 7).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                        {row.dSize}
                      </td>
                      <td className="p-2.5 text-center">
                        {row.passesLengthBound ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> PRUNED
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right tabular-nums">
                        <span className={row.passesCountBound ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>
                          {row.inter}
                        </span>{' '}
                        <span className="text-slate-400">(&gt;={row.minInterNeeded})</span>
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {row.jaccard.toFixed(3)}
                      </td>
                      <td className="p-2.5 text-right font-semibold">
                        {inTopK ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            TOP-{dryRun.ranked.findIndex((r) => r.id === row.id) + 1}
                          </span>
                        ) : row.passesThreshold ? (
                          <span className="text-amber-700 dark:text-amber-400">EVICTED (k={topK})</span>
                        ) : (
                          <span className="text-slate-400">FILTERED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7-Stage DSA Topic & Algorithm Link Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div>
          <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
            DSA Topics & Exact Algorithms Powering Each Stage
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Jump directly to the matching animated algorithm in the 45-Algorithm Studio or inspect its N-Gram module.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {ARCHITECTURE_STAGES.map((st) => (
            <div
              key={st.stage}
              className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-400">{st.name}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{st.technique}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{st.dsaTopic}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.role}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectNGramAlgo(st.ngramAlgoId)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-400 whitespace-nowrap"
                >
                  N-Gram Lab
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openAlgorithm(st.algoStudioId)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
                >
                  DSA Algorithm
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
