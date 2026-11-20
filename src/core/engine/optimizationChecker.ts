import type {
  ComplexityOrder,
  EngineAnalysisResult,
} from '../knowledge-base/types';
import type { UniversalCatalogMatchBundle } from './catalogStrategyBridge';
import { getAlgorithmUpgradeSpec } from '../../data/algorithmUpgradeLadders';
import { getAlgorithmTutorGuide } from '../../data/algorithmTutorGuides';

export type ComplexityChoice = 'auto' | ComplexityOrder;

export type OptimizationVerdict = 'optimal' | 'improvable' | 'tle-risk';

export interface RefinementSuggestion {
  id: string;
  title: string;
  algorithmId?: string;
  masterNumber?: number;
  fromComplexity: string;
  toComplexity: string;
  spaceComplexity: string;
  whyFaster: string;
  keyInvariantShift: string;
  isPowerCombo?: boolean;
}

export interface ComplexityTierMarker {
  order: ComplexityOrder;
  rank: number;
  label: string;
  isUser: boolean;
  isOptimal: boolean;
  isCeiling: boolean;
  isUnsafe: boolean;
}

export interface OptimizationReport {
  verdict: OptimizationVerdict;
  verdictLabel: string;
  verdictSummary: string;
  detectedApproachLabel: string;
  userTimeComplexity: ComplexityOrder;
  userSpaceComplexity: string;
  userRank: number;
  optimalAlgorithmName: string;
  optimalAlgorithmId?: string;
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
  optimalRank: number;
  constraintCeiling: ComplexityOrder;
  constraintCeilingRank: number;
  exceedsCeiling: boolean;
  complexityGapSteps: number;
  detectedBottlenecks: string[];
  refinementSuggestions: RefinementSuggestion[];
  complexityLadder: ComplexityTierMarker[];
}

const RANK_TO_ORDER: Record<number, ComplexityOrder> = {
  1: 'O(1)',
  2: 'O(log N)',
  3: 'O(N)',
  4: 'O(N log N)',
  5: 'O(N^2)',
  6: 'O(2^N)',
  7: 'O(N!)',
};

const ORDER_TO_RANK: Record<ComplexityOrder, number> = {
  'O(1)': 1,
  'O(log N)': 2,
  'O(N)': 3,
  'O(N log N)': 4,
  'O(N^2)': 5,
  'O(2^N)': 6,
  'O(N!)': 7,
};

export function parseBigORank(raw: string): number {
  const s = raw.toLowerCase().replace(/\s+/g, '');
  if (s.includes('n!') || s.includes('factorial')) return 7;
  if (s.includes('2^') || s.includes('3^') || s.includes('exponential') || s.includes('k^n')) return 6;
  if (
    s.includes('n^3') ||
    s.includes('n³') ||
    s.includes('v^3') ||
    s.includes('n^2') ||
    s.includes('n²') ||
    s.includes('v*e') ||
    s.includes('ve') ||
    s.includes('n*m') ||
    s.includes('quadratic')
  ) {
    return 5;
  }
  if (
    s.includes('nlogn') ||
    s.includes('nlog') ||
    s.includes('mlog') ||
    s.includes('elogv') ||
    s.includes('eloge') ||
    s.includes('(v+e)log') ||
    s.includes('logk')
  ) {
    return 4;
  }
  if (s.includes('logn') || s.includes('logv') || s.includes('logm') || s.includes('log(')) {
    return 2;
  }
  if (s.includes('o(1)') || s.includes('constant')) return 1;
  return 3;
}

interface InferredUserApproach {
  rank: number;
  order: ComplexityOrder;
  space: string;
  label: string;
  bottlenecks: string[];
}

/**
 * Analyzes a learner's free-form approach description or code draft to infer
 * likely time/space complexity and hidden algorithmic bottlenecks.
 */
export function inferUserApproachProfile(
  rawInput: string,
  claimedComplexity: ComplexityChoice = 'auto'
): InferredUserApproach {
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const bottlenecks: string[] = [];

  // Count loop constructs for code-snippet detection
  const loopMatches = lower.match(/\b(for|while)\s*(\(|[a-z_][a-z0-9_]*\s+in\b)/g) ?? [];
  const hasNestedLoopCode = loopMatches.length >= 2;
  const hasTripleLoopCode = loopMatches.length >= 3;

  // Detect hidden O(N) operations inside loops (classic interview trap!)
  const hasHiddenInnerScan =
    loopMatches.length >= 1 &&
    /(\.includes\(|\.indexof\(|\.splice\(|\.shift\(|\.remove\(|\bin\s+[a-z_][a-z0-9_]*\b|\bmin\(|\bmax\(|\bsum\()/i.test(
      text
    );

  // Detect unmemoized recursion
  const hasRecursionHint =
    /\b(recurs|backtrack|dfs\(|solve\(|helper\(|permute|all subsets|all combinations|try every)\b/i.test(
      lower
    );
  const hasMemoHint = /\b(memo|cache|lru_cache|@cache|dp\[|tabulat|visited)\b/i.test(lower);

  // Detect sorting / heap / binary search / hash map / linear patterns
  const hasSortHint =
    /\b(sort|sorted\(|arrays\.sort|\.sort\(|merge sort|quick sort|heap|priority queue|heapq|priorityqueue|treemap|treeset)\b/i.test(
      lower
    );
  const hasBinarySearchHint =
    /\b(binary search|bisect|mid\s*=|lo\s*\+\s*hi|left\s*\+\s*\(right|halve|divide by 2|fenwick|segment tree|bit\b)\b/i.test(
      lower
    );
  const hasLinearPatternHint =
    /\b(hash ?map|hash ?set|dict|unordered_map|two pointer|sliding window|monotonic stack|monotonic queue|prefix sum|kadane|union[- ]?find|dsu|bfs|kahn|topological|kmp|z-algorithm|manacher|single pass|one pass|linear scan|o\(n\))\b/i.test(
      lower
    );
  const hasConstantHint =
    /\b(o\(1\)|constant time|closed[- ]form|math formula|xor trick|bit trick|direct lookup|lru cache|o\(1\) get)\b/i.test(
      lower
    );
  const hasQuadraticHint =
    /\b(nested (?:for |while )?loops?|double (?:for |while )?loops?|two (?:for |while )?loops?|all pairs|every (?:pair|subarray|substring|slice|combination of two)|check every|all substrings|all subarrays|brute force|o\(n\^2\)|o\(n2\)|n\^2|n²)\b/i.test(
      lower
    );
  const hasFactorialHint = /\b(all permutations|o\(n!\)|factorial|every ordering)\b/i.test(lower);
  const hasExponentialHint =
    /\b(o\(2\^n\)|exponential|all subsets|2\^n|try every combination|branching recursion)\b/i.test(
      lower
    );

  // Explicit bottleneck warnings
  if (hasHiddenInnerScan && !hasQuadraticHint) {
    bottlenecks.push(
      'Hidden inner scan detected (e.g. `.includes()`, `.indexOf()`, `.shift()`, or `in list` inside a loop) — silently turns an O(N) loop into O(N²). Replace with a HashSet/HashMap or index pointer.'
    );
  }
  if (hasRecursionHint && !hasMemoHint) {
    bottlenecks.push(
      'Recursion/backtracking without memoization or visited-state caching risks recomputing overlapping subproblems exponentially (O(2^N)).'
    );
  }
  if (hasTripleLoopCode || /\b(triple loop|three nested|o\(n\^3\))\b/i.test(lower)) {
    bottlenecks.push(
      'Triple-nested iteration (O(N³)) will time out for N > 500. Fix one index and replace the inner pair with Two Pointers, Prefix Sums, or a HashMap.'
    );
  }
  if (/\b(string concat|\+=\s*['"`]|str\s*\+=)\b/i.test(lower) && loopMatches.length >= 1) {
    bottlenecks.push(
      'Repeated string concatenation inside a loop copies the entire string each step (O(N²)). Collect chunks in an array/StringBuilder and join once.'
    );
  }

  let rank = 3;
  let label = 'Single-Pass / Linear Approach';

  if (hasFactorialHint) {
    rank = 7;
    label = 'Factorial Permutation Search';
  } else if (hasExponentialHint || (hasRecursionHint && !hasMemoHint && !hasLinearPatternHint)) {
    rank = 6;
    label = 'Unmemoized Exponential Recursion / Backtracking';
  } else if (hasTripleLoopCode || hasQuadraticHint || hasNestedLoopCode || hasHiddenInnerScan) {
    rank = 5;
    label = hasHiddenInnerScan && !hasNestedLoopCode
      ? 'Loop with Hidden O(N) Inner Scan'
      : 'Nested-Loop / Brute-Force Pairwise Scan';
  } else if (hasSortHint) {
    rank = 4;
    label = 'Sorting / Heap / Tree-Ordered Strategy';
  } else if (hasConstantHint && !hasLinearPatternHint) {
    rank = 1;
    label = 'Constant-Time / Direct Formula Approach';
  } else if (hasBinarySearchHint && !hasLinearPatternHint && !hasSortHint) {
    rank = 2;
    label = 'Logarithmic Divide-and-Conquer / Binary Search';
  } else if (hasLinearPatternHint) {
    rank = 3;
    label = 'Linear-Time Pattern (HashMap / Window / Pointers / Stack)';
  } else if (!text) {
    rank = 5;
    label = 'Baseline Brute-Force Draft (Enter your approach above)';
  }

  // Honor explicit complexity override if user picked one manually
  if (claimedComplexity !== 'auto') {
    rank = ORDER_TO_RANK[claimedComplexity];
    if (!text) {
      label = `Selected Complexity Baseline (${claimedComplexity})`;
    }
  }

  // Space inference
  let space = 'O(1)';
  if (/\b(2d|matrix|dp\[.*\]\[.*\]|n\^2 space|adjacency matrix)\b/i.test(lower)) {
    space = 'O(N^2)';
  } else if (
    /\b(hash|map|set|dict|memo|cache|dp\[|stack|queue|heap|trie|visited|prefix|array|list|recursive|dfs|bfs)\b/i.test(
      lower
    )
  ) {
    space = 'O(N)';
  } else if (hasBinarySearchHint && !hasSortHint) {
    space = 'O(1)';
  }

  return {
    rank,
    order: RANK_TO_ORDER[rank] ?? 'O(N)',
    space,
    label,
    bottlenecks,
  };
}

/**
 * Compares the user's current approach against both the problem's constraint ceiling
 * and known optimal algorithms from the 94-Algorithm Studio + 16 Power Combinations.
 */
export function evaluateOptimization(params: {
  userApproachText: string;
  claimedComplexity?: ComplexityChoice;
  analysis: EngineAnalysisResult;
  catalogMatches: UniversalCatalogMatchBundle;
}): OptimizationReport {
  const { userApproachText, claimedComplexity = 'auto', analysis, catalogMatches } = params;

  const inferred = inferUserApproachProfile(userApproachText, claimedComplexity);
  const topAlgo = catalogMatches.matchedAlgorithms[0]?.algorithm ?? null;
  const topStrategy = analysis.topStrategy;

  const optimalAlgorithmName =
    topAlgo?.name ?? topStrategy?.strategy.name ?? 'Constraint-Optimal Algorithm';
  const optimalTimeComplexity =
    topAlgo?.timeComplexity ?? topStrategy?.strategy.optimalTime ?? analysis.deconstruction.hardestCeiling;
  const optimalSpaceComplexity =
    topAlgo?.spaceComplexity ?? topStrategy?.strategy.optimalSpace ?? 'O(N)';
  const optimalRank = Math.min(
    parseBigORank(optimalTimeComplexity),
    analysis.deconstruction.hardestCeilingRank
  );

  const constraintCeiling = analysis.deconstruction.hardestCeiling;
  const constraintCeilingRank = analysis.deconstruction.hardestCeilingRank;
  const exceedsCeiling = inferred.rank > constraintCeilingRank;
  const complexityGapSteps = Math.max(0, inferred.rank - optimalRank);

  let verdict: OptimizationVerdict = 'optimal';
  let verdictLabel = 'Optimal Complexity Reached';
  let verdictSummary = `Your ${inferred.order} approach matches the known optimal bound (${optimalTimeComplexity}) and safely fits inside the ${constraintCeiling} constraint ceiling.`;

  if (exceedsCeiling || complexityGapSteps >= 2) {
    verdict = 'tle-risk';
    verdictLabel = exceedsCeiling
      ? 'TLE Risk · Exceeds Constraint Ceiling'
      : 'Significant Optimization Available';
    verdictSummary = exceedsCeiling
      ? `Your current ${inferred.order} approach exceeds the problem's ${constraintCeiling} time budget and will likely Time Limit Exceed (TLE) on large inputs. Upgrade to ${optimalAlgorithmName} (${optimalTimeComplexity}).`
      : `Your ${inferred.order} approach is ${complexityGapSteps} Big-O tiers slower than ${optimalAlgorithmName} (${optimalTimeComplexity}). Refining the core data structure unlocks a major speedup.`;
  } else if (complexityGapSteps === 1) {
    verdict = 'improvable';
    verdictLabel = 'Can Be Refined to Optimal';
    verdictSummary = `Your ${inferred.order} approach is functional, but a faster ${optimalTimeComplexity} algorithm (${optimalAlgorithmName}) exists for this problem type—often expected in senior interviews.`;
  }

  const detectedBottlenecks = [...inferred.bottlenecks];
  if (exceedsCeiling) {
    detectedBottlenecks.unshift(
      `Constraint Mismatch: ${inferred.order} exceeds the derived ceiling (${constraintCeiling}) for this input size.`
    );
  }
  if (verdict !== 'optimal' && topAlgo) {
    const upgrade = getAlgorithmUpgradeSpec(topAlgo);
    if (upgrade?.brute.bottleneckOrWin) {
      detectedBottlenecks.push(`Core Bottleneck: ${upgrade.brute.bottleneckOrWin}`);
    }
  }

  // Build ranked refinement suggestions from matched 94-Algo Studio algorithms + Power Combos
  const refinementSuggestions: RefinementSuggestion[] = [];

  for (const match of catalogMatches.matchedAlgorithms.slice(0, 3)) {
    const algo = match.algorithm;
    const algoRank = parseBigORank(algo.timeComplexity);
    // Include if faster than user OR if it's the primary reference algorithm when already optimal
    if (algoRank < inferred.rank || refinementSuggestions.length === 0) {
      const upgrade = getAlgorithmUpgradeSpec(algo);
      const guide = getAlgorithmTutorGuide(algo.id);
      refinementSuggestions.push({
        id: `ref-${algo.id}`,
        title: algo.name,
        algorithmId: algo.id,
        masterNumber: match.masterNumber,
        fromComplexity: inferred.order,
        toComplexity: algo.timeComplexity,
        spaceComplexity: algo.spaceComplexity,
        whyFaster:
          algoRank < inferred.rank
            ? `${algo.complexityLeap}. ${upgrade.optimal.bottleneckOrWin}`
            : `Matches optimal tier (${algo.timeComplexity}). Focus on cleanly maintaining the invariant and minimizing constant factors (${algo.spaceComplexity} space).`,
        keyInvariantShift: guide?.simpleAnalogy
          ? `${algo.loopInvariant} (${guide.simpleAnalogy})`
          : algo.loopInvariant,
      });
    }
  }

  // Surface a synergistic Algorithm Power Combination if applicable
  const combo = catalogMatches.matchedCombos[0];
  if (combo) {
    refinementSuggestions.push({
      id: `combo-${combo.id}`,
      title: `Power Combo: ${combo.title}`,
      algorithmId: combo.partnerIds[0],
      fromComplexity: inferred.order,
      toComplexity: combo.interviewUseCase,
      spaceComplexity: 'Combined Pipeline',
      whyFaster: combo.synergyOutput,
      keyInvariantShift: combo.architectureFlow,
      isPowerCombo: true,
    });
  }

  // 6-tier complexity ladder for visual comparison
  const ladderOrders: Array<{ order: ComplexityOrder; rank: number; label: string }> = [
    { order: 'O(1)', rank: 1, label: 'Constant' },
    { order: 'O(log N)', rank: 2, label: 'Logarithmic' },
    { order: 'O(N)', rank: 3, label: 'Linear' },
    { order: 'O(N log N)', rank: 4, label: 'Linearithmic' },
    { order: 'O(N^2)', rank: 5, label: 'Quadratic' },
    { order: 'O(2^N)', rank: 6, label: 'Exponential' },
  ];

  const clampedUserRank = Math.min(6, Math.max(1, inferred.rank));
  const clampedOptimalRank = Math.min(6, Math.max(1, optimalRank));
  const clampedCeilingRank = Math.min(6, Math.max(1, constraintCeilingRank));

  const complexityLadder: ComplexityTierMarker[] = ladderOrders.map((tier) => ({
    ...tier,
    isUser: tier.rank === clampedUserRank,
    isOptimal: tier.rank === clampedOptimalRank,
    isCeiling: tier.rank === clampedCeilingRank,
    isUnsafe: tier.rank > clampedCeilingRank,
  }));

  return {
    verdict,
    verdictLabel,
    verdictSummary,
    detectedApproachLabel: inferred.label,
    userTimeComplexity: inferred.order,
    userSpaceComplexity: inferred.space,
    userRank: inferred.rank,
    optimalAlgorithmName,
    optimalAlgorithmId: topAlgo?.id,
    optimalTimeComplexity,
    optimalSpaceComplexity,
    optimalRank,
    constraintCeiling,
    constraintCeilingRank,
    exceedsCeiling,
    complexityGapSteps,
    detectedBottlenecks: Array.from(new Set(detectedBottlenecks)).slice(0, 4),
    refinementSuggestions: refinementSuggestions.slice(0, 4),
    complexityLadder,
  };
}
