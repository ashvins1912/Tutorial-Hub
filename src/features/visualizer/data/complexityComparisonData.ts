import type { AlgorithmDefinition } from '../../../data/algorithmsCatalog';
import type { RecursionProblemId } from '../../recursion-lab/data/recursionLabData';
import { CALIBRATED_ALGORITHM_PROFILES } from './algorithmComplexityProfiles';

export interface ComplexityComparisonProfile {
  /** Label describing the recursive formulation */
  recursiveApproach: string;
  /** Worst/typical recursive time Big O */
  recursiveTimeBigO: string;
  /** Call stack / auxiliary space Big O */
  recursiveSpaceBigO: string;
  /** Recurrence relation (e.g., T(N) = 2T(N/2) + O(N)) */
  recurrenceRelation: string;
  /** Formula expressing work at live recursive depth d */
  depthWorkFormula: (depth: number) => string;
  /** Max call-stack depth expression in Big O */
  maxDepthBigO: string;
  /** Label describing the iterative alternative */
  iterativeApproach: string;
  /** Iterative time Big O */
  iterativeTimeBigO: string;
  /** Iterative space Big O */
  iterativeSpaceBigO: string;
  /** Iterative call stack overhead */
  iterativeStackOverhead: string;
  /** Concise tradeoff verdict explaining recursive vs iterative choice */
  tradeoffVerdict: string;
}

export const TOPIC_COMPLEXITY_PROFILES: Record<string, ComplexityComparisonProfile> = {
  'arrays-hashing': {
    recursiveApproach: 'Recursive Complement Scan',
    recursiveTimeBigO: 'O(N) / O(N²) naive',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1)',
    depthWorkFormula: (d) => `d = ${d} frames → O(${d}) stack memory`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Hash Map Pass',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(N) hash table',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative hash lookup achieves O(1) complement checks without risking O(N) call-stack overflow at N = 10⁵.',
  },
  'two-pointers': {
    recursiveApproach: 'Tail-Recursive Inward Shrink',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1)',
    depthWorkFormula: (d) => `d = ${d} calls → O(${d}) stack frames`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative while (L < R) Loop',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative two pointers eliminate O(N) recursion frames, compressing space strictly to O(1).',
  },
  'sliding-window': {
    recursiveApproach: 'Recursive Window Advance',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1) amortized',
    depthWorkFormula: (d) => `d = ${d} window shifts → O(${d}) stack`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Amortized L/R Sweep',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(K) char map',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative expand/shrink visits each index at most twice in O(N) time with zero call-stack allocation.',
  },
  'prefix-sum-diff-array': {
    recursiveApproach: 'Recursive Prefix Accumulation',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'P(i) = P(i − 1) + nums[i]',
    depthWorkFormula: (d) => `d = ${d} prefixes → O(${d}) frames`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Running Sum + Hash Map',
    iterativeTimeBigO: 'O(N) build · O(1) query',
    iterativeSpaceBigO: 'O(N) prefix counts',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Single iterative pass computes prefix frequencies cleanly without O(N) recursion overhead.',
  },
  'stacks-monotonic-stack': {
    recursiveApproach: 'Recursive Next-Greater Unwind',
    recursiveTimeBigO: 'O(N²) naive / O(N) memo',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(pops)',
    depthWorkFormula: (d) => `d = ${d} pending items → O(${d}) depth`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Monotonic Stack',
    iterativeTimeBigO: 'O(N) amortized',
    iterativeSpaceBigO: 'O(N) heap stack',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Each element pushes and pops at most once in O(N) total time on an explicit heap-allocated stack.',
  },
  'queues-monotonic-deque': {
    recursiveApproach: 'Recursive Window Maximum',
    recursiveTimeBigO: 'O(N · K)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(K)',
    depthWorkFormula: (d) => `d = ${d} windows → O(${d} · K) work`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Monotonic Deque',
    iterativeTimeBigO: 'O(N) amortized',
    iterativeSpaceBigO: 'O(K) deque',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Monotonic deque drops O(N·K) repeated scans to O(N) linear time with strictly O(K) memory.',
  },
  'sorting-algorithms': {
    recursiveApproach: 'Top-Down Recursive Merge / Quick Sort',
    recursiveTimeBigO: 'O(N log N)',
    recursiveSpaceBigO: 'O(log N) stack (+ O(N) merge)',
    recurrenceRelation: 'T(N) = 2T(N/2) + O(N)',
    depthWorkFormula: (d) => `d = ${d} splits → O(N · ${d}) cumulative`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Bottom-Up Merge / Explicit-Stack Quick',
    iterativeTimeBigO: 'O(N log N)',
    iterativeSpaceBigO: 'O(N) merge / O(log N) heap',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Bottom-up iterative Merge Sort matches O(N log N) time with zero call-stack frames and better cache locality.',
  },
  'linked-lists': {
    recursiveApproach: 'Recursive Reversal / Merge',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1)',
    depthWorkFormula: (d) => `d = ${d} nodes → O(${d}) stack frames`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative 3-Pointer Rewiring',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative pointer rewiring reduces space from O(N) to O(1) and prevents stack overflow on 10⁵-node lists.',
  },
  'binary-search': {
    recursiveApproach: 'Recursive Halving bs(lo, hi)',
    recursiveTimeBigO: 'O(log N)',
    recursiveSpaceBigO: 'O(log N) call stack',
    recurrenceRelation: 'T(N) = T(N/2) + O(1)',
    depthWorkFormula: (d) => `d = ${d} halvings → search space N / 2^${d}`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Iterative while (lo <= hi)',
    iterativeTimeBigO: 'O(log N)',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative binary search keeps identical O(log N) time while cutting stack space from O(log N) to O(1).',
  },
  'trees-bst-nary': {
    recursiveApproach: 'Recursive DFS Traversal',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(H) call stack (O(N) skewed)',
    recurrenceRelation: 'T(N) = T(L) + T(R) + O(1)',
    depthWorkFormula: (d) => `d = ${d} tree height → O(${d}) active frames`,
    maxDepthBigO: 'O(H)',
    iterativeApproach: 'Iterative Explicit Stack / Morris O(1)',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(H) heap / O(1) Morris',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Recursive DFS is concise for balanced trees; iterative stack or Morris traversal protects against skewed O(N) depth.',
  },
  'tries-radix': {
    recursiveApproach: 'Recursive Prefix DFS',
    recursiveTimeBigO: 'O(L) insert · O(Nodes) collect',
    recursiveSpaceBigO: 'O(L) call stack',
    recurrenceRelation: 'T(L) = T(L − 1) + O(1)',
    depthWorkFormula: (d) => `d = ${d} chars → O(${d}) stack depth`,
    maxDepthBigO: 'O(L)',
    iterativeApproach: 'Iterative Cursor Walk',
    iterativeTimeBigO: 'O(L)',
    iterativeSpaceBigO: 'O(1) query aux',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative node pointer traversal (curr = curr.next[c]) runs in O(L) with zero recursion frames.',
  },
  'heaps-priority-queues': {
    recursiveApproach: 'Recursive siftDown(i) / siftUp(i)',
    recursiveTimeBigO: 'O(log N) per op',
    recursiveSpaceBigO: 'O(log N) call stack',
    recurrenceRelation: 'T(N) = T(N/2) + O(1)',
    depthWorkFormula: (d) => `d = ${d} heap levels → O(${d}) swaps`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Iterative Index Loop (2i + 1)',
    iterativeTimeBigO: 'O(log N) per op',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Production binary heaps always sift iteratively in O(1) space without function-call overhead.',
  },
  'recursion-divide-conquer': {
    recursiveApproach: 'Recursive Binary Exponentiation',
    recursiveTimeBigO: 'O(log N)',
    recursiveSpaceBigO: 'O(log N) call stack',
    recurrenceRelation: 'T(N) = T(N/2) + O(1)',
    depthWorkFormula: (d) => `d = ${d} halvings → exponent shrunk by 2^${d}`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Iterative Bitwise Squaring Loop',
    iterativeTimeBigO: 'O(log N)',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative bit-shift squaring matches O(log N) multiplications while dropping O(log N) stack space to O(1).',
  },
  backtracking: {
    recursiveApproach: 'Recursive Backtracking DFS + Pruning',
    recursiveTimeBigO: 'O(b^d) / O(N!) pruned',
    recursiveSpaceBigO: 'O(d) call stack + path',
    recurrenceRelation: 'T(d) = Σ T(d − 1) for valid branches',
    depthWorkFormula: (d) => `d = ${d} decisions → up to O(b^${d}) subtree`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Explicit Frame Stack',
    iterativeTimeBigO: 'O(b^d) / O(N!) pruned',
    iterativeSpaceBigO: 'O(d) heap frame stack',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict:
      'Same exponential worst-case time; recursion gives cleanest choose/unchoose symmetry unless depth exceeds OS stack limits.',
  },
  'greedy-algorithms': {
    recursiveApproach: 'Recursive Activity / Interval Selection',
    recursiveTimeBigO: 'O(N log N)',
    recursiveSpaceBigO: 'O(N) tail-recursion stack',
    recurrenceRelation: 'T(N) = T(N − k) + O(1) after sort',
    depthWorkFormula: (d) => `d = ${d} greedy picks → O(${d}) frames`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative Sort + Single Linear Sweep',
    iterativeTimeBigO: 'O(N log N)',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Greedy decisions never backtrack — iterative sweep after sorting runs in O(1) extra space.',
  },
  'graphs-traversal-dsu': {
    recursiveApproach: 'Recursive DFS / Path-Compression DSU',
    recursiveTimeBigO: 'O(V + E)',
    recursiveSpaceBigO: 'O(V) call stack',
    recurrenceRelation: 'T(V, E) = Σ (1 + deg(u))',
    depthWorkFormula: (d) => `d = ${d} path depth → O(${d}) stack frames`,
    maxDepthBigO: 'O(V)',
    iterativeApproach: 'Iterative BFS Queue / Explicit DFS Stack',
    iterativeTimeBigO: 'O(V + E)',
    iterativeSpaceBigO: 'O(V) heap queue/stack',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict:
      'On deep chain graphs (V = 10⁵), iterative stack/BFS avoids fatal recursion depth overflow.',
  },
  'dynamic-programming': {
    recursiveApproach: 'Top-Down Recursion + Memoization',
    recursiveTimeBigO: 'O(N · M) memo · O(2^(N+M)) naive',
    recursiveSpaceBigO: 'O(N · M) cache + O(N + M) stack',
    recurrenceRelation: 'dp(i, j) = min(dp(i−1, j), dp(i, j−1), dp(i−1, j−1)) + 1',
    depthWorkFormula: (d) => `d = ${d} subproblem depth → O(2^${d}) without memo`,
    maxDepthBigO: 'O(N + M)',
    iterativeApproach: 'Bottom-Up Tabulation / Rolling 1D Row',
    iterativeTimeBigO: 'O(N · M)',
    iterativeSpaceBigO: 'O(min(N, M)) rolling row',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Bottom-up iterative DP removes recursion overhead and enables O(min(N,M)) rolling-row space compression.',
  },
  'segment-fenwick-trees': {
    recursiveApproach: 'Top-Down Recursive Segment Tree',
    recursiveTimeBigO: 'O(log N) query / update',
    recursiveSpaceBigO: 'O(4N) tree + O(log N) stack',
    recurrenceRelation: 'T(N) = 2T(N/2) pruned to ≤ 4 nodes/level',
    depthWorkFormula: (d) => `d = ${d} tree levels → ≤ 4 · ${d} nodes visited`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Iterative Fenwick BIT / Bottom-Up SegTree',
    iterativeTimeBigO: 'O(log N) query / update',
    iterativeSpaceBigO: 'O(N) BIT / O(2N) SegTree',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative BIT / bottom-up Segment Tree cuts memory in half and avoids O(log N) call frames for 2–3× faster cache hits.',
  },
  'bit-manipulation': {
    recursiveApproach: 'Recursive Bit-Shift / Subset Split',
    recursiveTimeBigO: 'O(log V) / O(2^N) subsets',
    recursiveSpaceBigO: 'O(log V) call stack',
    recurrenceRelation: 'T(V) = T(V >> 1) + O(1)',
    depthWorkFormula: (d) => `d = ${d} bit shifts → O(${d}) frames`,
    maxDepthBigO: 'O(log V)',
    iterativeApproach: 'Iterative Kernighan n &= (n − 1) Loop',
    iterativeTimeBigO: 'O(popcount(V)) ≤ O(log V)',
    iterativeSpaceBigO: 'O(1) registers',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative bitwise loops run directly in CPU registers with O(1) space and zero call overhead.',
  },
  'exact-string-matching': {
    recursiveApproach: 'Recursive Prefix Fallback Match',
    recursiveTimeBigO: 'O(N + M)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1) amortized',
    depthWorkFormula: (d) => `d = ${d} chars matched → O(${d}) frames`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Iterative KMP LPS / Rabin-Karp Roll',
    iterativeTimeBigO: 'O(N + M)',
    iterativeSpaceBigO: 'O(M) LPS / O(1) hash',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative KMP automaton processes streaming text of unbounded length in O(N + M) without recursion.',
  },
  'ngram-fuzzy-candidate-retrieval': {
    recursiveApproach: 'Recursive Postings List Merge',
    recursiveTimeBigO: 'O(Σ |P_g|)',
    recursiveSpaceBigO: 'O(Q) call stack',
    recurrenceRelation: 'T(Q) = T(Q − 1) + O(|P_q|)',
    depthWorkFormula: (d) => `d = ${d} query grams → O(${d}) merge frames`,
    maxDepthBigO: 'O(Q)',
    iterativeApproach: 'Iterative Length-Pruned WAND / Count Scan',
    iterativeTimeBigO: 'O(C · log K) pruned',
    iterativeSpaceBigO: 'O(C + K) accumulator & heap',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Iterative length-bound pruning skips >95% of catalog entries in O(1) per candidate without recursion overhead.',
  },
  'confident-fuzzy-reranking': {
    recursiveApproach: 'Recursive Edit Distance (Levenshtein)',
    recursiveTimeBigO: 'O(3^max(M,N)) naive · O(M·N) memo',
    recursiveSpaceBigO: 'O(M + N) call stack',
    recurrenceRelation: 'ed(i,j) = 1 + min(ed(i−1,j), ed(i,j−1), ed(i−1,j−1))',
    depthWorkFormula: (d) => `d = ${d} edit depth → O(3^${d}) unmemoized`,
    maxDepthBigO: 'O(M + N)',
    iterativeApproach: 'Iterative Banded Ukkonen DP (Width 2k+1)',
    iterativeTimeBigO: 'O(k · min(M, N))',
    iterativeSpaceBigO: 'O(min(M, N)) rolling row',
    iterativeStackOverhead: 'O(1) call stack',
    tradeoffVerdict:
      'Iterative banded DP prunes edits exceeding threshold k, cutting O(M·N) reranking down to O(k·min(M,N)) in O(min(M,N)) space.',
  },
};

export const RECURSION_LAB_COMPLEXITY_PROFILES: Record<
  RecursionProblemId,
  ComplexityComparisonProfile
> = {
  'n-queens': {
    recursiveApproach: 'Recursive Row-by-Row Backtracking',
    recursiveTimeBigO: 'O(N!) worst (heavily pruned)',
    recursiveSpaceBigO: 'O(N) call stack + O(N) sets',
    recurrenceRelation: 'T(r) ≤ (N − r) · T(r + 1) + O(1)',
    depthWorkFormula: (d) => `Depth d = ${d} rows → branching ≤ (4 − ${Math.min(d - 1, 4)})!`,
    maxDepthBigO: 'O(N + 1)',
    iterativeApproach: 'Iterative Explicit Stack + Bitmasks',
    iterativeTimeBigO: 'O(N!) pruned (faster constants)',
    iterativeSpaceBigO: 'O(N) bitmask stack',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict:
      'Both explore the same pruned search tree in O(N!) time; iterative bitmasks avoid call-frame allocation and speed up diagonal checks via bitwise shifts.',
  },
  subsets: {
    recursiveApproach: 'Recursive Choose / Unchoose DFS',
    recursiveTimeBigO: 'O(N · 2^N)',
    recursiveSpaceBigO: 'O(N) call stack + path',
    recurrenceRelation: 'T(N) = 2 · T(N − 1) + O(N)',
    depthWorkFormula: (d) => `Depth d = ${d} → 2^${Math.max(0, d - 1)} branches active`,
    maxDepthBigO: 'O(N + 1)',
    iterativeApproach: 'Iterative Bitmask Enumeration (0 .. 2^N − 1)',
    iterativeTimeBigO: 'O(N · 2^N)',
    iterativeSpaceBigO: 'O(1) auxiliary (excl. output)',
    iterativeStackOverhead: 'O(1) stack (0 frames)',
    tradeoffVerdict:
      'Iterative bitmasking (or cascading append) generates all 2^N subsets in identical O(N·2^N) time with zero recursion frames.',
  },
  'combination-sum': {
    recursiveApproach: 'Recursive Branch & Bound DFS',
    recursiveTimeBigO: 'O(N^(T/min)) pruned',
    recursiveSpaceBigO: 'O(T / min(cands)) call stack',
    recurrenceRelation: 'T(rem) = Σ T(rem − cands[j]) for cands[j] ≤ rem',
    depthWorkFormula: (d) => `Depth d = ${d} picks → bounded by ⌊T / min⌋`,
    maxDepthBigO: 'O(T / min)',
    iterativeApproach: 'Iterative Unbounded Knapsack DP / Explicit Stack',
    iterativeTimeBigO: 'O(N · T) count · O(out) enumerate',
    iterativeSpaceBigO: 'O(T) DP buckets / heap stack',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict:
      'When only counting combinations, iterative 1D DP collapses exponential O(N^(T/min)) time down to polynomial O(N·T).',
  },
};

export function getTopicComplexityProfile(topicId: string): ComplexityComparisonProfile {
  return (
    TOPIC_COMPLEXITY_PROFILES[topicId] ?? {
      recursiveApproach: 'Recursive Decomposition',
      recursiveTimeBigO: 'O(N log N) / O(N)',
      recursiveSpaceBigO: 'O(N) / O(log N) call stack',
      recurrenceRelation: 'T(N) = a·T(N/b) + f(N)',
      depthWorkFormula: (d) => `Depth d = ${d} frames`,
      maxDepthBigO: 'O(log N) – O(N)',
      iterativeApproach: 'Iterative Loop / Explicit Structure',
      iterativeTimeBigO: 'O(N) / O(N log N)',
      iterativeSpaceBigO: 'O(1) – O(N) heap',
      iterativeStackOverhead: 'O(1) OS call stack',
      tradeoffVerdict:
        'Iterative conversion removes OS call-stack frames while preserving or improving asymptotic time complexity.',
    }
  );
}

export function getAlgorithmComplexityProfile(
  algo: AlgorithmDefinition
): ComplexityComparisonProfile {
  if (CALIBRATED_ALGORITHM_PROFILES[algo.id]) {
    return CALIBRATED_ALGORITHM_PROFILES[algo.id];
  }
  const cat = algo.category;
  const isLog =
    algo.timeComplexity.includes('log') && !algo.timeComplexity.includes('N log');
  const isNLogN = algo.timeComplexity.includes('N log');
  const isDp =
    cat === 'Advanced Dynamic Programming' ||
    (cat === 'Optimization & Decision Making' && !algo.id.includes('greedy'));
  const isGraph =
    cat === 'Advanced Graph Algorithms' ||
    (cat === 'Tree & Graph Traversal' &&
      (algo.id.includes('graph') ||
        algo.id.includes('bfs') ||
        algo.id.includes('dfs') ||
        algo.id.includes('topo') ||
        algo.id.includes('dsu')));
  const isTree =
    cat === 'Range Queries & Advanced Trees' || cat === 'Tree & Graph Traversal';
  const isBacktrack =
    algo.id.includes('backtrack') || algo.name.toLowerCase().includes('backtrack');

  if (isBacktrack) {
    return TOPIC_COMPLEXITY_PROFILES.backtracking;
  }
  if (isDp) {
    return {
      recursiveApproach: `Top-Down Memoized ${algo.name}`,
      recursiveTimeBigO: `${algo.timeComplexity} (exponential naive)`,
      recursiveSpaceBigO: `${algo.spaceComplexity} + call stack`,
      recurrenceRelation: 'T(state) = combine(T(substates)) + O(1)',
      depthWorkFormula: (d) => `Depth d = ${d} transitions → memoized in O(1) hit`,
      maxDepthBigO: 'O(N)',
      iterativeApproach: `Bottom-Up Iterative ${algo.name}`,
      iterativeTimeBigO: algo.timeComplexity,
      iterativeSpaceBigO: algo.spaceComplexity,
      iterativeStackOverhead: 'O(1) call stack',
      tradeoffVerdict:
        'Bottom-up tabulation eliminates O(N) call-stack frames and enables rolling-array space optimization.',
    };
  }
  if (isTree) {
    return {
      recursiveApproach: `Top-Down Recursive ${algo.name}`,
      recursiveTimeBigO: algo.timeComplexity,
      recursiveSpaceBigO: 'O(log N) – O(H) call stack',
      recurrenceRelation: 'T(N) = 2T(N/2) + O(1) or T(H) = T(H − 1) + O(1)',
      depthWorkFormula: (d) => `Depth d = ${d} levels → O(${d}) active frames`,
      maxDepthBigO: 'O(H) / O(log N)',
      iterativeApproach: `Iterative Pointer / Bottom-Up ${algo.name}`,
      iterativeTimeBigO: algo.timeComplexity,
      iterativeSpaceBigO: algo.spaceComplexity,
      iterativeStackOverhead: 'O(1) call stack',
      tradeoffVerdict:
        'Iterative traversal removes function-call overhead and prevents stack overflow on skewed O(N) trees.',
    };
  }
  if (isGraph) {
    return {
      recursiveApproach: `Recursive DFS ${algo.name}`,
      recursiveTimeBigO: algo.timeComplexity,
      recursiveSpaceBigO: 'O(V) call stack',
      recurrenceRelation: 'T(V, E) = Σ (1 + deg(u))',
      depthWorkFormula: (d) => `Depth d = ${d} hops → O(${d}) DFS frames`,
      maxDepthBigO: 'O(V)',
      iterativeApproach: `Iterative Queue / Heap ${algo.name}`,
      iterativeTimeBigO: algo.timeComplexity,
      iterativeSpaceBigO: algo.spaceComplexity,
      iterativeStackOverhead: 'O(1) OS call stack',
      tradeoffVerdict:
        'Explicit queues/priority queues guarantee safe O(V + E) execution even on 10⁵-vertex chain graphs.',
    };
  }
  if (isLog) {
    return {
      recursiveApproach: `Recursive Divide ${algo.name}`,
      recursiveTimeBigO: algo.timeComplexity,
      recursiveSpaceBigO: 'O(log N) call stack',
      recurrenceRelation: 'T(N) = T(N/2) + O(1)',
      depthWorkFormula: (d) => `Depth d = ${d} splits → range shrunk by 2^${d}`,
      maxDepthBigO: 'O(log N)',
      iterativeApproach: `Iterative Pointer Loop ${algo.name}`,
      iterativeTimeBigO: algo.timeComplexity,
      iterativeSpaceBigO: 'O(1) auxiliary',
      iterativeStackOverhead: 'O(1) stack (0 frames)',
      tradeoffVerdict:
        'Iterative halving preserves O(log N) speed while dropping O(log N) call-stack memory to strictly O(1).',
    };
  }
  if (isNLogN) {
    return {
      recursiveApproach: `Top-Down Divide & Conquer ${algo.name}`,
      recursiveTimeBigO: algo.timeComplexity,
      recursiveSpaceBigO: 'O(log N) stack (+ aux)',
      recurrenceRelation: 'T(N) = 2T(N/2) + O(N)',
      depthWorkFormula: (d) => `Depth d = ${d} levels → O(N) work per level`,
      maxDepthBigO: 'O(log N)',
      iterativeApproach: `Bottom-Up Iterative ${algo.name}`,
      iterativeTimeBigO: algo.timeComplexity,
      iterativeSpaceBigO: algo.spaceComplexity,
      iterativeStackOverhead: 'O(1) OS call stack',
      tradeoffVerdict:
        'Iterative bottom-up passes match O(N log N) time with zero call-stack depth and tighter cache locality.',
    };
  }

  return {
    recursiveApproach: `Recursive Formulation (${algo.name})`,
    recursiveTimeBigO: algo.timeComplexity,
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1)',
    depthWorkFormula: (d) => `Depth d = ${d} frames → O(${d}) stack memory`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: `Iterative Optimal (${algo.name})`,
    iterativeTimeBigO: algo.timeComplexity,
    iterativeSpaceBigO: algo.spaceComplexity,
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict:
      'Iterative execution keeps the same optimal time complexity while eliminating O(N) recursion stack overhead.',
  };
}
