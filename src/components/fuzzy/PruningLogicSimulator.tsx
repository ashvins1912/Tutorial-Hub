import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { extractPaddedNGrams } from '../../utils/ngramEngine';

interface SimCandidate {
  id: number;
  title: string;
}

const INITIAL_CANDIDATES: SimCandidate[] = [
  { id: 101, title: 'apple iphone 15 pro' },
  { id: 102, title: 'apple airpods pro' },
  { id: 103, title: 'samsung galaxy s24' },
  { id: 104, title: 'usb' },
  { id: 105, title: 'wireless noise cancelling bluetooth over ear headphones studio edition' },
  { id: 106, title: 'apple iphone 15' },
];

export function PruningLogicSimulator() {
  const [query, setQuery] = useState('aple iphon');
  const [threshold, setThreshold] = useState(0.35);
  const [nSize, setNSize] = useState(3);
  const [candidates, setCandidates] = useState<SimCandidate[]>(INITIAL_CANDIDATES);
  const [newTitle, setNewTitle] = useState('');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    if (!playing) return;
    if (step >= totalSteps - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const sim = useMemo(() => {
    const cleanQ = query.trim().toLowerCase() || 'aple iphon';
    const qSet = new Set(extractPaddedNGrams(cleanQ, nSize).spans.map((s) => s.token));
    const qLen = qSet.size;

    const minAllowedD = Math.ceil(threshold * qLen);
    const maxAllowedD = threshold > 0 ? Math.floor(qLen / threshold) : 999;

    const rows = candidates.map((cand) => {
      const dSet = new Set(extractPaddedNGrams(cand.title.toLowerCase(), nSize).spans.map((s) => s.token));
      const dLen = dSet.size;
      const sharedGrams = Array.from(qSet).filter((g) => dSet.has(g));
      const shared = sharedGrams.length;

      const lengthReason =
        dLen < minAllowedD
          ? `Too short (${dLen} < ${minAllowedD})`
          : dLen > maxAllowedD
            ? `Too long (${dLen} > ${maxAllowedD})`
            : 'Inside O(1) length bracket';
      const passLength = dLen >= minAllowedD && dLen <= maxAllowedD;

      // Exact Count Lower Bound derived from Jaccard >= t:
      // shared / (|Q| + |D| - shared) >= t  =>  shared >= ceil( (t / (1 + t)) * (|Q| + |D|) )
      const requiredShared = Math.ceil((threshold / (1 + threshold)) * (qLen + dLen));
      const passCount = passLength && shared >= requiredShared;

      const unionLen = qLen + dLen - shared;
      const jaccard = unionLen === 0 ? 0 : shared / unionLen;
      const maxTheoreticalJaccard = Math.min(qLen, dLen) / Math.max(qLen, dLen, 1);

      return {
        ...cand,
        dLen,
        shared,
        sharedGrams,
        passLength,
        lengthReason,
        requiredShared,
        passCount,
        jaccard,
        maxTheoreticalJaccard,
      };
    });

    const lengthPruned = rows.filter((r) => !r.passLength).length;
    const countPruned = rows.filter((r) => r.passLength && !r.passCount).length;
    const survivors = rows.filter((r) => r.passCount).length;
    const axisMax = Math.max(45, maxAllowedD + 8, ...rows.map((r) => r.dLen + 4));

    return {
      cleanQ,
      qGrams: Array.from(qSet),
      qLen,
      minAllowedD,
      maxAllowedD,
      rows,
      lengthPruned,
      countPruned,
      survivors,
      prunedPct: Math.round(((lengthPruned + countPruned) / Math.max(1, rows.length)) * 100),
      axisMax,
    };
  }, [query, threshold, nSize, candidates]);

  const handleAddCandidate = () => {
    const t = newTitle.trim();
    if (!t) return;
    setCandidates((prev) => [
      ...prev,
      { id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 101, title: t },
    ]);
    setNewTitle('');
  };

  const stepDescriptions = [
    {
      title: 'Step 1 · Tokenize Query & Cache |Q|',
      formula: `|Q| = ${sim.qLen} unique padded ${nSize}-grams`,
      detail: `Every candidate stores its precomputed trigram count |D| in an O(1) RAM array so pruning math requires zero string scanning.`,
    },
    {
      title: 'Step 2 · O(1) Length Filtering Bound',
      formula: `ceil(${threshold.toFixed(2)} × ${sim.qLen}) = ${sim.minAllowedD}  <=  |D|  <=  floor(${sim.qLen} / ${threshold.toFixed(2)}) = ${sim.maxAllowedD}`,
      detail: `Even with 100% subset overlap, any document outside [${sim.minAllowedD}, ${sim.maxAllowedD}] has max possible Jaccard < ${threshold.toFixed(2)}. Rejected ${sim.lengthPruned} candidate(s) in O(1)!`,
    },
    {
      title: 'Step 3 · Derive O(1) Count-Filtering Lower Bound T(D)',
      formula: `T(D) = ceil( (${threshold.toFixed(2)} / ${(1 + threshold).toFixed(2)}) × (${sim.qLen} + |D|) )`,
      detail: `Rearranging |Q ∩ D| / (|Q| + |D| - |Q ∩ D|) >= t gives the exact minimum shared trigrams each surviving document MUST accumulate.`,
    },
    {
      title: 'Step 4 · Posting-List Accumulation & Count Rejection',
      formula: `Reject immediately whenever accumulated |Q ∩ D| < T(D)`,
      detail: `Posting intersections eliminate ${sim.countPruned} additional candidate(s) whose overlap falls below T(D), leaving only ${sim.survivors} verified match(es).`,
    },
    {
      title: 'Step 5 · Exact O(1) Jaccard Verification',
      formula: `Jaccard = |Q ∩ D| / (|Q| + |D| - |Q ∩ D|) · Total pruned: ${sim.prunedPct}%`,
      detail: `Only the ${sim.survivors} surviving candidate(s) enter the Top-K Min-Heap—zero O(L·M) edit-distance DP executed.`,
    },
  ];

  const activeStepMeta = stepDescriptions[step] ?? stepDescriptions[0];

  return (
    <div className="space-y-5">
      {/* Controls & Step Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              O(1) Mathematical Pruning Dry Run · {sim.prunedPct}% Candidates Eliminated Before Final Ranking
            </p>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {activeStepMeta.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!playing && step >= totalSteps - 1) setStep(0);
                setPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {playing ? 'Pause Simulation' : step >= totalSteps - 1 ? 'Replay Dry Run' : 'Run Step-by-Step'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
              aria-label="Previous pruning step"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-35"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setStep((s) => Math.min(totalSteps - 1, s + 1));
              }}
              disabled={step >= totalSteps - 1}
              aria-label="Next pruning step"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-35"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setStep(0);
              }}
              aria-label="Reset pruning simulation"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formula & Narrative Banner */}
        <div className="rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/30 p-3.5 space-y-1">
          <div className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 tabular-nums">
            {activeStepMeta.formula}
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeStepMeta.detail}
          </p>
        </div>

        {/* Interactive Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label htmlFor="prune-query" className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
              Query String
            </label>
            <input
              id="prune-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <label htmlFor="prune-thresh">Threshold (t)</label>
              <strong className="text-sky-700 dark:text-sky-400 tabular-nums">{threshold.toFixed(2)}</strong>
            </div>
            <input
              id="prune-thresh"
              type="range"
              min={0.15}
              max={0.85}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
          <div>
            <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <label htmlFor="prune-n">N-Gram Size (n)</label>
              <strong className="text-sky-700 dark:text-sky-400 tabular-nums">n = {nSize}</strong>
            </div>
            <input
              id="prune-n"
              type="range"
              min={2}
              max={4}
              step={1}
              value={nSize}
              onChange={(e) => setNSize(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
          <div>
            <label htmlFor="prune-add" className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
              Add Custom Test Product
            </label>
            <div className="flex gap-1.5">
              <input
                id="prune-add"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCandidate()}
                placeholder="e.g. iphone 15 case"
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleAddCandidate}
                aria-label="Add candidate"
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Gate 1: SVG O(1) Length-Filtering Number Line */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
              Gate 1 · Visual O(1) Length-Filtering Bracket (`t · |Q| &lt;= |D| &lt;= |Q| / t`)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Any product whose cached trigram count |D| falls in the red zones is mathematically impossible to reach t = {threshold.toFixed(2)} and is discarded in O(1).
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            Valid Window: [{sim.minAllowedD}, {sim.maxAllowedD}] grams
          </span>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 760 155"
            className="w-full min-w-[580px] h-auto"
            role="img"
            aria-label="O(1) Length Filtering mathematical pruning bracket"
          >
            {/* Axis baseline */}
            <rect x="40" y="54" width="680" height="24" rx="6" className="fill-rose-100 dark:fill-rose-950/50 stroke-rose-300 dark:stroke-rose-800" strokeWidth="1" />

            {/* Valid Green Zone */}
            {(() => {
              const xOf = (val: number) => 40 + (Math.min(val, sim.axisMax) / sim.axisMax) * 680;
              const xMin = xOf(sim.minAllowedD);
              const xMax = xOf(sim.maxAllowedD);
              const xQ = xOf(sim.qLen);
              return (
                <>
                  <rect
                    x={xMin}
                    y="54"
                    width={Math.max(8, xMax - xMin)}
                    height="24"
                    rx="4"
                    className={
                      step >= 1
                        ? 'fill-emerald-200/80 dark:fill-emerald-900/60 stroke-emerald-500'
                        : 'fill-sky-100 dark:fill-sky-900/40 stroke-sky-400'
                    }
                    strokeWidth="1.5"
                  />
                  {/* Min & Max bound dashed guides */}
                  <line x1={xMin} y1="32" x2={xMin} y2="112" className="stroke-emerald-600 dark:stroke-emerald-400" strokeDasharray="4 3" strokeWidth="1.5" />
                  <text x={xMin} y="24" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[10px] font-mono font-bold">
                    min={sim.minAllowedD}
                  </text>

                  <line x1={xMax} y1="32" x2={xMax} y2="112" className="stroke-emerald-600 dark:stroke-emerald-400" strokeDasharray="4 3" strokeWidth="1.5" />
                  <text x={xMax} y="24" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[10px] font-mono font-bold">
                    max={sim.maxAllowedD}
                  </text>

                  {/* Query marker */}
                  <line x1={xQ} y1="46" x2={xQ} y2="86" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2.5" />
                  <text x={xQ} y="100" textAnchor="middle" className="fill-sky-700 dark:fill-sky-300 text-[10px] font-mono font-bold">
                    |Q|={sim.qLen}
                  </text>

                  {/* Candidate product markers */}
                  {sim.rows.map((r, idx) => {
                    const cx = xOf(r.dLen);
                    const yOffset = idx % 2 === 0 ? 66 : 66;
                    const labelY = idx % 2 === 0 ? 128 : 144;
                    const rejected = step >= 1 && !r.passLength;
                    return (
                      <g key={r.id}>
                        <circle
                          cx={cx}
                          cy={yOffset}
                          r={6.5}
                          className={
                            rejected
                              ? 'fill-rose-500 stroke-white dark:stroke-slate-900'
                              : 'fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900'
                          }
                          strokeWidth="2"
                        />
                        <text
                          x={cx}
                          y={labelY}
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-semibold ${
                            rejected
                              ? 'fill-rose-700 dark:fill-rose-400'
                              : 'fill-slate-700 dark:fill-slate-200'
                          }`}
                        >
                          #{r.id}({r.dLen})
                        </text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      </section>

      {/* Visual Gate 2: Count Filtering Threshold Bars + Step Verdict Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            Gate 2 · Count-Filtering Overlap Threshold (`|Q ∩ D| &gt;= T(D)`) & Rejection Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Each surviving candidate shows its accumulated posting overlap bar versus the vertical dashed threshold T(D).
          </p>
        </div>

        <div className="space-y-2.5">
          {sim.rows.map((r) => {
            const barMax = Math.max(sim.qLen, r.requiredShared, 1);
            const sharedPct = Math.min(100, Math.round((r.shared / barMax) * 100));
            const reqPct = Math.min(100, Math.round((r.requiredShared / barMax) * 100));
            const rejectedByLen = step >= 1 && !r.passLength;
            const rejectedByCount = step >= 3 && r.passLength && !r.passCount;
            const accepted = step >= 3 && r.passCount;

            return (
              <div
                key={r.id}
                className={`p-3.5 rounded-xl border transition-colors space-y-2 ${
                  rejectedByLen
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 opacity-75'
                    : rejectedByCount
                      ? 'border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                      : accepted
                        ? 'border-emerald-400 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/25'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      #{r.id}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      "{r.title}"
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      · |D| = {r.dLen} · maxPossibleJ = {r.maxTheoreticalJaccard.toFixed(2)}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold">
                    {rejectedByLen ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        REJECTED (O(1) Length: {r.lengthReason})
                      </span>
                    ) : rejectedByCount ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <XCircle className="w-3.5 h-3.5" />
                        REJECTED (Count: {r.shared} &lt; T={r.requiredShared})
                      </span>
                    ) : accepted ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED · Jaccard = {r.jaccard.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        Pending Gate · Need T &gt;= {r.requiredShared}
                      </span>
                    )}
                  </div>
                </div>

                {/* Overlap Progress Bar with Threshold Marker */}
                {!rejectedByLen && (
                  <div className="space-y-1">
                    <div className="relative h-3 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          r.passCount ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${step >= 3 ? sharedPct : 0}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white"
                        style={{ left: `${reqPct}%` }}
                        title={`Required T(D) = ${r.requiredShared}`}
                      />
                    </div>
                    <div className="flex flex-wrap justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>
                        Shared |Q ∩ D| = <strong className="text-slate-800 dark:text-slate-200">{step >= 3 ? r.shared : '?'}</strong>
                        {step >= 3 && r.sharedGrams.length > 0 ? ` (${r.sharedGrams.slice(0, 6).join(', ')})` : ''}
                      </span>
                      <span>
                        Minimum Required T(D) = <strong>{r.requiredShared}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
