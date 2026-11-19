import { useState } from 'react';
import { ArrowUpRight, Compass, ShieldAlert } from 'lucide-react';

interface PatternDecisionRule {
  id: string;
  category: 'Arrays & Windows' | 'Trees & Graphs' | 'Search & Order' | 'Optimization & Math';
  symptom: string;
  constraintSignal: string;
  choosePattern: string;
  whyItWins: string;
  trapAlternative: string;
  topicId: string;
  algorithmId: string;
}

const PATTERN_DECISION_RULES: PatternDecisionRule[] = [
  {
    id: 'p-subarray-neg',
    category: 'Arrays & Windows',
    symptom: 'Contiguous subarray sum == K (contains NEGATIVE numbers)',
    constraintSignal: 'N <= 10^5 · negatives present',
    choosePattern: 'Prefix Sum + HashMap',
    whyItWins: 'Rewrites sum(L..R) = K as prefix[R] - prefix[L-1] = K with O(1) complement counts.',
    trapAlternative: 'Sliding Window fails because shrinking left does not monotonically decrease the sum.',
    topicId: 'prefix-sum-diff-array',
    algorithmId: 'prefix-sum-hash',
  },
  {
    id: 'p-subarray-pos',
    category: 'Arrays & Windows',
    symptom: 'Longest / shortest contiguous substring or positive subarray satisfying a rule',
    constraintSignal: 'N <= 10^5 · positive or frequency rule',
    choosePattern: 'Variable Sliding Window',
    whyItWins: 'Both pointers only advance rightward, resolving all windows in amortized O(N) time.',
    trapAlternative: 'Nested loops O(N²) time out at N = 10^5.',
    topicId: 'sliding-window',
    algorithmId: 'sliding-window',
  },
  {
    id: 'p-next-greater',
    category: 'Arrays & Windows',
    symptom: 'Next Greater / Next Smaller element or Largest Histogram span per index',
    constraintSignal: 'N <= 10^5 · nearest boundary query',
    choosePattern: 'Monotonic Stack',
    whyItWins: 'Each index is pushed once and popped once when a dominant element arrives -> O(N).',
    trapAlternative: 'Sorting destroys original positional indices.',
    topicId: 'stacks-monotonic-stack',
    algorithmId: 'monotonic-stack',
  },
  {
    id: 'p-window-max',
    category: 'Arrays & Windows',
    symptom: 'Maximum / minimum over every fixed sliding window of size K',
    constraintSignal: 'N <= 10^5 · fixed window extrema',
    choosePattern: 'Monotonic Deque',
    whyItWins: 'Expires old indices at front and evicts dominated values at back in true O(N).',
    trapAlternative: 'Max-Heap takes O(N log K) with stale entries; plain scan takes O(N·K).',
    topicId: 'queues-monotonic-deque',
    algorithmId: 'monotonic-stack',
  },
  {
    id: 'p-min-max-answer',
    category: 'Search & Order',
    symptom: '"Minimize the maximum" or "Maximize the minimum" capacity / speed / distance',
    constraintSignal: 'Answer range up to 10^9 · monotonic feasibility',
    choosePattern: 'Binary Search on Answer',
    whyItWins: 'Halves the 10^9 search space in ~30 iterations × O(N) greedy feasibility check.',
    trapAlternative: 'Linear simulation over capacity/speed times out immediately.',
    topicId: 'binary-search',
    algorithmId: 'binary-search',
  },
  {
    id: 'p-topk-stream',
    category: 'Search & Order',
    symptom: 'Top-K Largest, K-Way Merge, or Streaming Median',
    constraintSignal: 'Online stream or K << N',
    choosePattern: 'Bounded Heap / Dual Heaps',
    whyItWins: 'Caps memory to O(K) and updates in O(log K) without full O(N log N) re-sorting.',
    trapAlternative: 'Using a Max-Heap of size K for Top-K Largest evicts the largest instead of smallest VIP.',
    topicId: 'heaps-priority-queues',
    algorithmId: 'heap-intervals',
  },
  {
    id: 'p-unweighted-shortest',
    category: 'Trees & Graphs',
    symptom: 'Minimum steps / hops in a grid, maze, or unweighted graph',
    constraintSignal: 'All edge costs == 1',
    choosePattern: 'BFS (Mark Visited on Enqueue)',
    whyItWins: 'Discovers vertices wave-by-wave so first arrival is provably shortest in O(V + E).',
    trapAlternative: 'DFS explores deep arbitrary paths and does not guarantee shortest hops.',
    topicId: 'graphs-traversal-dsu',
    algorithmId: 'tree-bfs-dfs',
  },
  {
    id: 'p-weighted-shortest',
    category: 'Trees & Graphs',
    symptom: 'Minimum cost path with non-negative weights vs negative weights / K stops',
    constraintSignal: 'Weighted directed/undirected graph',
    choosePattern: 'Dijkstra (w >= 0) / Bellman-Ford (w < 0 or <= K stops)',
    whyItWins: 'Min-Heap Dijkstra settles vertices in O((V + E) log V); Bellman-Ford guards negative edges & stop counts.',
    trapAlternative: 'Dijkstra produces wrong answers on negative weights.',
    topicId: 'graphs-traversal-dsu',
    algorithmId: 'dijkstra-shortest-path',
  },
  {
    id: 'p-dynamic-connectivity',
    category: 'Trees & Graphs',
    symptom: 'Merge undirected groups, detect redundant edge, or build Kruskal MST',
    constraintSignal: 'Dynamic undirected edge additions',
    choosePattern: 'Union-Find (DSU)',
    whyItWins: 'Path Compression + Union-by-Size merges & checks connectivity in O(α(V)) ≈ O(1).',
    trapAlternative: 'Do not use DSU for DIRECTED cycle detection (use Kahn Topo Sort instead).',
    topicId: 'graphs-traversal-dsu',
    algorithmId: 'union-find-dsu',
  },
  {
    id: 'p-dynamic-range',
    category: 'Trees & Graphs',
    symptom: 'Interleaved online point/range updates AND range sum/min/max queries',
    constraintSignal: 'N, Q <= 10^5 online mutations',
    choosePattern: 'Fenwick Tree (Sum) / Segment Tree (Min/Max/Lazy)',
    whyItWins: 'Decomposes any range into O(log N) blocks for fast updates and queries.',
    trapAlternative: 'Static Prefix Sums degrade to O(N) on every update.',
    topicId: 'segment-fenwick-trees',
    algorithmId: 'fenwick-tree-bit',
  },
  {
    id: 'p-enumerate-vs-count',
    category: 'Optimization & Math',
    symptom: 'List ALL valid subsets/boards (N <= 20) vs COUNT / OPTIMIZE (N > 30)',
    constraintSignal: 'Small N enumeration vs large N optimization',
    choosePattern: 'Backtracking (list all) / Dynamic Programming (count/optimize)',
    whyItWins: 'Backtracking prunes branches with Choose/Unchoose; DP collapses overlapping states into polynomial tables.',
    trapAlternative: 'Running unmemoized Backtracking for "number of ways" when N = 100 triggers 2^100 TLE.',
    topicId: 'dynamic-programming',
    algorithmId: 'dynamic-programming',
  },
  {
    id: 'p-interval-greedy',
    category: 'Optimization & Math',
    symptom: 'Merge intervals vs max non-overlapping intervals vs jump reachability',
    constraintSignal: 'N <= 10^5 intervals · exchange argument holds',
    choosePattern: 'Greedy (Sort Start for Merge · Sort End for Max Kept)',
    whyItWins: 'Proves local optimal choice never harms remaining subproblem in O(N log N) / O(N).',
    trapAlternative: 'Sorting by start time fails on Max Non-Overlapping when an early interval is very long.',
    topicId: 'greedy-algorithms',
    algorithmId: 'greedy-algorithms',
  },
];

const CATEGORIES = [
  'All',
  'Arrays & Windows',
  'Search & Order',
  'Trees & Graphs',
  'Optimization & Math',
] as const;

interface PatternDecisionMatrixProps {
  onOpenTopic?: (topicId: string) => void;
  onOpenAlgorithm?: (algorithmId: string) => void;
}

export function PatternDecisionMatrix({
  onOpenTopic,
  onOpenAlgorithm,
}: PatternDecisionMatrixProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>('All');

  const visibleRules =
    selectedCategory === 'All'
      ? PATTERN_DECISION_RULES
      : PATTERN_DECISION_RULES.filter((r) => r.category === selectedCategory);

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>DSA Pattern Decision Matrix</span>
          </div>
          <h3 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            Instant Symptom → Optimal Pattern Cheat-Sheet
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[65ch]">
            Match problem clues and constraints to the right algorithm—and spot the exact trap alternative interviewers test.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {visibleRules.map((rule) => (
          <div
            key={rule.id}
            className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-950/50 transition-colors space-y-2"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {rule.symptom}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>{rule.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{rule.constraintSignal}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenTopic && (
                  <button
                    type="button"
                    onClick={() => onOpenTopic(rule.topicId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
                  >
                    Topic
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
                {onOpenAlgorithm && (
                  <button
                    type="button"
                    onClick={() => onOpenAlgorithm(rule.algorithmId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-[11px] font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                  >
                    Algorithm
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Choose: {rule.choosePattern}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rule.whyItWins}
                </p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Watch Out</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rule.trapAlternative}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
