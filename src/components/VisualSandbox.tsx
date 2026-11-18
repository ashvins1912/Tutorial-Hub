import { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';

export function VisualSandbox() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const markSandboxSolved = usePatternForgeStore((s) => s.markSandboxSolved);
  const setPolyaStep = usePatternForgeStore((s) => s.setPolyaStep);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const cfg = problem.sandboxConfig;

  // Two Sum local state
  const [tsMap, setTsMap] = useState<Record<number, number>>({});
  const [tsSelected, setTsSelected] = useState<number[]>([]);
  const [tsStatus, setTsStatus] = useState('Click array cells from left to right to inspect complements.');

  // Sliding Window local state
  const [swL, setSwL] = useState(0);
  const [swR, setSwR] = useState(0);
  const [swBest, setSwBest] = useState(1);

  // Monotonic Stack local state
  const [msIdx, setMsIdx] = useState(0);
  const [msStack, setMsStack] = useState<number[]>([]);
  const [msAns, setMsAns] = useState<number[]>(() => new Array(cfg.sampleArray?.length ?? 7).fill(0));

  // Rain Water local state
  const [rwL, setRwL] = useState(0);
  const [rwR, setRwR] = useState((cfg.sampleArray?.length ?? 12) - 1);
  const [rwLMax, setRwLMax] = useState(0);
  const [rwRMax, setRwRMax] = useState(0);
  const [rwWaterByBar, setRwWaterByBar] = useState<Record<number, number>>({});
  const [rwWarning, setRwWarning] = useState<string | null>(null);

  // Coin Change DP local state
  const [ccDp, setCcDp] = useState<(number | null)[]>([0, null, null, null, null, null, null]);
  const [ccActiveAmount, setCcActiveAmount] = useState(1);

  const resetAll = () => {
    setTsMap({});
    setTsSelected([]);
    setTsStatus('Click array cells from left to right to inspect complements.');
    setSwL(0);
    setSwR(0);
    setSwBest(1);
    setMsIdx(0);
    setMsStack([]);
    setMsAns(new Array(cfg.sampleArray?.length ?? 7).fill(0));
    setRwL(0);
    setRwR((cfg.sampleArray?.length ?? 12) - 1);
    setRwLMax(0);
    setRwRMax(0);
    setRwWaterByBar({});
    setRwWarning(null);
    setCcDp([0, null, null, null, null, null, null]);
    setCcActiveAmount(1);
  };

  // Two Sum Handler
  const handleTwoSumClick = (idx: number) => {
    const arr = cfg.sampleArray ?? [2, 11, 7, 15];
    const target = cfg.targetSum ?? 9;
    const val = arr[idx];
    const comp = target - val;
    if (tsMap[comp] !== undefined && tsMap[comp] !== idx) {
      setTsSelected([tsMap[comp], idx]);
      setTsStatus(`HashMap hit! Needed ${comp} for ${val}; found at index ${tsMap[comp]}. Pair [${tsMap[comp]}, ${idx}] = ${target}.`);
      markSandboxSolved();
    } else {
      setTsMap((prev) => ({ ...prev, [val]: idx }));
      setTsSelected([idx]);
      setTsStatus(`Checked map[${comp}] -> miss. Stored map[${val}] = ${idx}.`);
    }
  };

  // Sliding Window Handlers
  const swStr = cfg.sampleString ?? 'abcabcbb';
  const swWindowSlice = swStr.slice(swL, swR + 1).split('');
  const swHasDup = new Set(swWindowSlice).size !== swWindowSlice.length;

  const handleSwExpand = () => {
    if (swR >= swStr.length - 1 || swHasDup) return;
    const nextR = swR + 1;
    setSwR(nextR);
    const nextSlice = swStr.slice(swL, nextR + 1).split('');
    if (new Set(nextSlice).size === nextSlice.length) {
      const nextBest = Math.max(swBest, nextR - swL + 1);
      setSwBest(nextBest);
      if (nextBest >= 3 && nextR >= 3) markSandboxSolved();
    }
  };

  const handleSwShrink = () => {
    if (swL >= swR) return;
    const nextL = swL + 1;
    setSwL(nextL);
    const nextSlice = swStr.slice(nextL, swR + 1).split('');
    if (new Set(nextSlice).size === nextSlice.length) {
      const nextBest = Math.max(swBest, swR - nextL + 1);
      setSwBest(nextBest);
      if (nextL >= 1) markSandboxSolved();
    }
  };

  // Monotonic Stack Handler
  const handleMsStep = () => {
    const temps = cfg.sampleArray ?? [73, 74, 75, 71, 69, 72, 76];
    if (msIdx >= temps.length) return;
    const nextStack = [...msStack];
    const nextAns = [...msAns];
    while (nextStack.length > 0 && temps[msIdx] > temps[nextStack[nextStack.length - 1]]) {
      const popped = nextStack.pop()!;
      nextAns[popped] = msIdx - popped;
    }
    nextStack.push(msIdx);
    setMsStack(nextStack);
    setMsAns(nextAns);
    const nextIdx = msIdx + 1;
    setMsIdx(nextIdx);
    if (nextIdx >= temps.length - 1) markSandboxSolved();
  };

  // Rain Water Handlers
  const handleRwStep = (side: 'L' | 'R') => {
    const h = cfg.sampleArray ?? [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
    if (rwL >= rwR) return;
    if (side === 'L' && h[rwL] > h[rwR]) {
      setRwWarning(`Pause: height[L]=${h[rwL]} is taller than height[R]=${h[rwR]}. Step the SHORTER wall (R) so water cannot leak!`);
      return;
    }
    if (side === 'R' && h[rwR] > h[rwL]) {
      setRwWarning(`Pause: height[R]=${h[rwR]} is taller than height[L]=${h[rwL]}. Step the SHORTER wall (L) so water cannot leak!`);
      return;
    }
    setRwWarning(null);
    if (side === 'L') {
      const newLMax = Math.max(rwLMax, h[rwL]);
      const trapped = Math.max(0, newLMax - h[rwL]);
      setRwLMax(newLMax);
      setRwWaterByBar((prev) => ({ ...prev, [rwL]: trapped }));
      const nextL = rwL + 1;
      setRwL(nextL);
      if (nextL >= rwR) markSandboxSolved();
    } else {
      const newRMax = Math.max(rwRMax, h[rwR]);
      const trapped = Math.max(0, newRMax - h[rwR]);
      setRwRMax(newRMax);
      setRwWaterByBar((prev) => ({ ...prev, [rwR]: trapped }));
      const nextR = rwR - 1;
      setRwR(nextR);
      if (rwL >= nextR) markSandboxSolved();
    }
  };

  // Coin Change DP Handler
  const handleCcComputeNext = () => {
    if (ccActiveAmount > 6) return;
    const coins = cfg.sampleArray ?? [1, 3, 4];
    let best = Infinity;
    for (const c of coins) {
      if (ccActiveAmount - c >= 0) {
        const prev = ccDp[ccActiveAmount - c];
        if (prev !== null) best = Math.min(best, 1 + prev);
      }
    }
    const next = [...ccDp];
    next[ccActiveAmount] = best;
    setCcDp(next);
    if (ccActiveAmount === 6) {
      markSandboxSolved();
    }
    setCcActiveAmount(ccActiveAmount + 1);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
            STAGE 2 · HANDS-ON DRY-RUN SANDBOX
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Solve the Small Sample by Hand
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{cfg.instruction}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Sample
          </button>
          <button
            type="button"
            onClick={() => setPolyaStep('plan')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            Lock Loop Invariant (Plan)
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Sandbox Interactive Canvas */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
        {cfg.type === 'two-sum' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {(cfg.sampleArray ?? [2, 11, 7, 15]).map((val, idx) => {
                const isSelected = tsSelected.includes(idx);
                const isInMap = tsMap[val] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTwoSumClick(idx)}
                    className={`w-24 h-24 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                        : isInMap
                          ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500'
                    }`}
                  >
                    <span className="text-xs font-mono text-slate-400">idx {idx}</span>
                    <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {val}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      need {(cfg.targetSum ?? 9) - val}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">{tsStatus}</p>
              <div className="font-mono text-xs text-sky-700 dark:text-sky-300 shrink-0">
                seen Map: {JSON.stringify(tsMap)}
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'sliding-window' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {swStr.split('').map((ch, idx) => {
                const inWin = idx >= swL && idx <= swR;
                const isL = idx === swL;
                const isR = idx === swR;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-14 h-16 rounded-lg border flex flex-col items-center justify-center font-mono ${
                        inWin
                          ? swHasDup
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px]">{idx}</span>
                      <span className="text-xl font-bold">{ch}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 h-4">
                      {isL && isR ? 'L,R' : isL ? 'L' : isR ? 'R' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-sm">
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  Window [{swL}..{swR}] = "{swStr.slice(swL, swR + 1)}"
                </span>
                <span className="mx-2 text-slate-400">·</span>
                <span className={swHasDup ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                  {swHasDup ? 'DUPLICATE DETECTED (Shrink Left)' : `VALID · Best Length = ${swBest}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwShrink}
                  disabled={swL >= swR}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Shrink Left (L++)
                </button>
                <button
                  type="button"
                  onClick={handleSwExpand}
                  disabled={swR >= swStr.length - 1 || swHasDup}
                  className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-700 transition-colors"
                >
                  Expand Right (R++)
                </button>
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'monotonic-stack' && (
          <div className="space-y-5">
            <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
              {(cfg.sampleArray ?? [73, 74, 75, 71, 69, 72, 76]).map((temp, i) => {
                const processed = i < msIdx;
                const onStack = msStack.includes(i);
                const isCurrent = i === msIdx;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-center font-mono ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                        : onStack
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                          : processed
                            ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Day {i}</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{temp}°</div>
                    <div className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                      ans: {msAns[i]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Monotonic Decreasing Stack (indices): [{msStack.map((i) => `${i}(${(cfg.sampleArray ?? [])[i]}°)`).join(' , ')}]
              </div>
              <button
                type="button"
                onClick={handleMsStep}
                disabled={msIdx >= (cfg.sampleArray?.length ?? 7)}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-700 transition-colors"
              >
                {msIdx >= (cfg.sampleArray?.length ?? 7) ? 'All Days Processed' : `Process Day ${msIdx}`}
              </button>
            </div>
          </div>
        )}

        {cfg.type === 'rain-water' && (
          <div className="space-y-5">
            <div className="flex items-end justify-center gap-2 h-44 pt-4">
              {(cfg.sampleArray ?? []).map((barH, idx) => {
                const water = rwWaterByBar[idx] ?? 0;
                const isL = idx === rwL;
                const isR = idx === rwR;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="flex flex-col-reverse w-9 sm:w-11 h-32 justify-start items-stretch">
                      <div
                        style={{ height: `${barH * 28}px` }}
                        className={`rounded-t-sm transition-all ${
                          isL || isR
                            ? 'bg-sky-600 dark:bg-sky-400'
                            : 'bg-slate-700 dark:bg-slate-600'
                        }`}
                      />
                      {water > 0 && (
                        <div
                          style={{ height: `${water * 28}px` }}
                          className="bg-cyan-400/75 dark:bg-cyan-500/60 border-t border-cyan-600 flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 dark:text-white"
                        >
                          +{water}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 h-4">
                      {isL && isR ? 'L,R' : isL ? 'L' : isR ? 'R' : idx}
                    </span>
                  </div>
                );
              })}
            </div>
            {rwWarning && (
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg p-3">
                {rwWarning}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                leftMax = {rwLMax} · rightMax = {rwRMax} · Trapped ={' '}
                {Object.values(rwWaterByBar).reduce((a, b) => a + b, 0)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRwStep('L')}
                  disabled={rwL >= rwR}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Step Left (L++)
                </button>
                <button
                  type="button"
                  onClick={() => handleRwStep('R')}
                  disabled={rwL >= rwR}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Step Right (R--)
                </button>
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'coin-change' && (
          <div className="space-y-5">
            <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
              {ccDp.map((val, amt) => {
                const isNext = amt === ccActiveAmount;
                return (
                  <div
                    key={amt}
                    className={`p-3 rounded-lg border text-center font-mono ${
                      isNext
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                        : val !== null
                          ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-[11px] text-slate-500">dp[{amt}]</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
                      {val === null ? '?' : val}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Coins: [1, 3, 4] · Notice greedy on 6 gives 4+1+1 (3 coins), whereas dp[6] = 1 + dp[3] = 2 coins!
              </div>
              <button
                type="button"
                onClick={handleCcComputeNext}
                disabled={ccActiveAmount > 6}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-700 transition-colors"
              >
                {ccActiveAmount > 6 ? 'DP Table Complete' : `Compute dp[${ccActiveAmount}]`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Insight Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          {progress.sandboxSolved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                Dry-run intuition verified! Proceed to Plan (Loop Invariant) or build your logic blocks.
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Hint: {cfg.hint}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
