import { useState } from 'react';
import { CheckCircle2, GitBranch, Layers, Sparkles } from 'lucide-react';

type DpTab = 'recursion' | 'memo' | 'tabulation' | 'space';

const RECURSION_NODES = [
  { id: '6', label: 'f(6)', level: 0, duplicate: false, memoPruned: false },
  { id: '5', label: 'f(5)', level: 1, duplicate: false, memoPruned: false },
  { id: '3a', label: 'f(3)', level: 1, duplicate: true, memoPruned: false },
  { id: '2a', label: 'f(2)', level: 1, duplicate: true, memoPruned: false },
  { id: '4', label: 'f(4)', level: 2, duplicate: false, memoPruned: false },
  { id: '2b', label: 'f(2) dup', level: 2, duplicate: true, memoPruned: true },
  { id: '1a', label: 'f(1)', level: 2, duplicate: true, memoPruned: false },
  { id: '3b', label: 'f(3) dup', level: 2, duplicate: true, memoPruned: true },
  { id: '2c', label: 'f(2) dup', level: 2, duplicate: true, memoPruned: true },
];

export function DPLadderVisualizer() {
  const [activeTab, setActiveTab] = useState<DpTab>('recursion');
  const [stepAmount, setStepAmount] = useState(6);

  const coins = [1, 3, 4];
  const dpValues = [0, 1, 2, 1, 1, 2, 2]; // optimal for coins [1,3,4] up to 6
  const dpViaCoin = ['base', '+1 (0->1)', '+1 (1->2)', '+3 (0->3)', '+4 (0->4)', '+1 (4->5)', '+3 (3->6)'];

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
            DP LADDER VISUALIZER · COINS [1, 3, 4] · TARGET = 6
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            4-Stage Dynamic Programming Evolution
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(
            [
              { id: 'recursion', label: '1. Pure Recursion' },
              { id: 'memo', label: '2. Memoization' },
              { id: 'tabulation', label: '3. Bottom-Up Grid' },
              { id: 'space', label: '4. Greedy vs DP' },
            ] as { id: DpTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'recursion' && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              Exponential Overlapping Subproblems — O(3^A)
            </span>
            <span className="font-mono text-rose-700 dark:text-rose-400 font-semibold">
              REDUNDANT SUBTREES RECOMPUTED
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {RECURSION_NODES.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border text-center font-mono text-xs ${
                  node.duplicate
                    ? 'border-rose-400 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="font-bold">{node.label}</div>
                <div className="text-[10px] mt-0.5">
                  {node.duplicate ? 'OVERLAPPING' : `Depth ${node.level}`}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Notice f(2) and f(3) appear multiple times across separate branches. Without caching, each appearance spawns an identical exponential subtree.
          </p>
        </div>
      )}

      {activeTab === 'memo' && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Top-Down Memoization Cache — O(A · C)
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              CACHE HIT PRUNES ENTIRE SUBTREE
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {RECURSION_NODES.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border text-center font-mono text-xs ${
                  node.memoPruned
                    ? 'border-emerald-400 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="font-bold">{node.label}</div>
                <div className="text-[10px] mt-0.5">
                  {node.memoPruned ? 'O(1) CACHE HIT' : 'COMPUTED ONCE'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            The first time f(2) or f(3) finishes, we save it in memo[rem]. Every repeat visit returns immediately in O(1).
          </p>
        </div>
      )}

      {activeTab === 'tabulation' && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Bottom-Up 1D Table (Topological Order a = 0..6)
            </span>
            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="dp-step-slider" className="text-slate-600 dark:text-slate-400">
                Inspect dp[{stepAmount}]
              </label>
              <input
                id="dp-step-slider"
                type="range"
                min={0}
                max={6}
                value={stepAmount}
                onChange={(e) => setStepAmount(Number(e.target.value))}
                className="accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dpValues.map((val, amt) => {
              const isSelected = amt === stepAmount;
              const isDep = stepAmount > 0 && coins.some((c) => stepAmount - c === amt);
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStepAmount(amt)}
                  className={`p-3 rounded-lg border text-center font-mono transition-colors ${
                    isSelected
                      ? 'border-sky-600 bg-sky-100/70 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100'
                      : isDep
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : amt < stepAmount
                          ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="text-[10px]">dp[{amt}]</div>
                  <div className="text-lg font-bold tabular-nums">{val}</div>
                  <div className="text-[10px] truncate">{dpViaCoin[amt]}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Amber cells show exact dependencies (dp[{stepAmount} - coin]) already finalized before computing dp[{stepAmount}].
          </p>
        </div>
      )}

      {activeTab === 'space' && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400">
              GREEDY TRAP (FAILS)
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Pick largest coin &lt;= 6: [4, 1, 1] → 3 coins
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Taking coin 4 leaves remainder 2, forcing two 1-coins. Greedy cannot backtrack!
            </p>
          </div>
          <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 space-y-2">
            <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              1D DP OPTIMAL (O(A) SPACE)
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              dp[6] = min(1+dp[5], 1+dp[3], 1+dp[2]) = 2 coins (3 + 3)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Because coins can jump back by up to max(coins), 1D array dp[0..amount] is already space-optimal!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
