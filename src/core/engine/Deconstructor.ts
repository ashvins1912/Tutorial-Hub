import type {
  CognitiveDomain,
  ComplexityOrder,
  DeconstructionResult,
  DomainScore,
  ExtractedConstraint,
} from '../knowledge-base/types';

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^a-z0-9\^\+\-\*\/<=≥≤>\(\)\[\]\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates padded character trigrams ("  " + token + "  ") over meaningful words
 * plus phrase-level trigrams to make matching resilient to spelling typos & paraphrases.
 */
export function extractPaddedTrigrams(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];

  const set = new Set<string>();
  const words = norm.split(' ').filter((w) => w.length >= 2);

  for (const word of words) {
    const clean = word.replace(/[^a-z0-9]/g, '');
    if (clean.length < 2) continue;
    const padded = `  ${clean}  `;
    for (let i = 0; i <= padded.length - 3; i++) {
      set.add(padded.slice(i, i + 3));
    }
  }

  // Also include compact phrase trigrams across first 240 chars for multi-word clue continuity
  const phrase = `  ${norm.replace(/[^a-z0-9 ]/g, '').slice(0, 240)}  `;
  for (let i = 0; i <= phrase.length - 3; i++) {
    const tri = phrase.slice(i, i + 3);
    if (tri.trim().length >= 2) {
      set.add(tri);
    }
  }

  return Array.from(set);
}

interface DomainRule {
  domain: CognitiveDomain;
  weight: number;
  patterns: { label: string; regex: RegExp; weight: number }[];
}

const DOMAIN_RULES: DomainRule[] = [
  {
    domain: 'DSA_ALGORITHMIC',
    weight: 1.0,
    patterns: [
      { label: 'array/string/tree/graph', regex: /\b(array|subarray|substring|subsequence|string|linked list|binary tree|bst|trie|heap|graph|dag|matrix|grid|histogram|intervals?)\b/i, weight: 2.2 },
      { label: 'complexity bound', regex: /\b(o\(n|o\(log|o\(1\)|10\^5|10\^6|1e5|1e6|time complexity|auxiliary space|in-place)\b/i, weight: 2.0 },
      { label: 'fuzzy/search/index', regex: /\b(fuzzy|trigram|n-gram|bigram|inverted index|posting list|rerank|levenshtein|jaro|minhash|lsh|symspell|bk-tree|autocomplete|typo|misspell)\b/i, weight: 2.8 },
      { label: 'algo keywords', regex: /\b(sliding window|two pointers|binary search|dynamic programming|dp|knapsack|topological|dijkstra|union find|segment tree|fenwick|monotonic|kmp|rabin|backtrack|sorting)\b/i, weight: 2.6 },
    ],
  },
  {
    domain: 'MATHEMATICAL_LOGIC',
    weight: 1.0,
    patterns: [
      { label: 'invariant/parity/proof', regex: /\b(invariant|monovariant|parity|prove|impossible|chessboard|domino|tiling|opposite corners|coloring|chameleons?)\b/i, weight: 3.0 },
      { label: 'pigeonhole/extremal', regex: /\b(pigeonhole|guaranteed to have|worst[- ]case|minimum draws|socks|drawer|at least two)\b/i, weight: 2.8 },
      { label: 'number theory/combinatorics', regex: /\b(modulo|divisible|prime|gcd|lcm|coprime|bezout|probability|expected value|combinatorics|bayes|monty hall|stars and bars|remainder)\b/i, weight: 2.4 },
    ],
  },
  {
    domain: 'DEDUCTIVE_CONSTRAINT',
    weight: 1.0,
    patterns: [
      { label: 'logic grid/zebra', regex: /\b(einstein|zebra|logic grid|truth elimination|deduce|clues?:|who owns|each person|bijection)\b/i, weight: 3.2 },
      { label: 'truth-tellers/liars', regex: /\b(truth[- ]teller|liar|knights? and knaves?|always tells the truth|always lies)\b/i, weight: 3.4 },
      { label: 'negative constraint phrasing', regex: /\b(neither .+ nor|does not own|lives next to|cannot sit|must be assigned|exactly one)\b/i, weight: 2.2 },
    ],
  },
  {
    domain: 'GAME_THEORY_INVARIANT',
    weight: 1.0,
    patterns: [
      { label: 'optimal two-player game', regex: /\b(both players play optimally|optimal play|first player wins|second player wins|winning strategy|take turns|alice and bob)\b/i, weight: 3.4 },
      { label: 'nim/stones/grundy', regex: /\b(nim|nim-sum|piles? of stones|last stone|remove .+ stones|backward induction|sprague|grundy|minimax)\b/i, weight: 3.0 },
    ],
  },
  {
    domain: 'SYSTEM_STATE_LOGIC',
    weight: 1.0,
    patterns: [
      { label: 'weighing/river/bridge puzzles', regex: /\b(balance scale|weighings?|counterfeit coin|river crossing|wolf.+goat|bridge and torch|egg drop|hourglass|water jugs?|poisoned wine|burn ropes)\b/i, weight: 3.2 },
      { label: 'state machine/bottleneck', regex: /\b(state machine|state space|transition|bottleneck|throughput|under 10ms|10 million|10m records|latency)\b/i, weight: 2.0 },
    ],
  },
];

export function classifyDomain(text: string): DomainScore[] {
  const scores: DomainScore[] = DOMAIN_RULES.map((rule) => {
    let raw = 0;
    const matchedSignals: string[] = [];
    for (const p of rule.patterns) {
      const m = text.match(p.regex);
      if (m) {
        raw += p.weight;
        matchedSignals.push(`${p.label} ("${m[0]}")`);
      }
    }
    return { domain: rule.domain, score: raw, matchedSignals };
  });

  const maxRaw = Math.max(...scores.map((s) => s.score), 0);
  if (maxRaw === 0) {
    // Fallback heuristic: default to DSA_ALGORITHMIC with moderate score
    return scores.map((s) =>
      s.domain === 'DSA_ALGORITHMIC'
        ? { ...s, score: 0.55, matchedSignals: ['default algorithmic fallback'] }
        : { ...s, score: 0.15 }
    );
  }

  return scores
    .map((s) => ({
      ...s,
      score: Number((s.score / (maxRaw + 0.8)).toFixed(3)),
    }))
    .sort((a, b) => b.score - a.score);
}

function numericBoundToCeiling(n: number): { ceiling: ComplexityOrder; rank: number; reason: string } {
  if (n >= 1e8) {
    return { ceiling: 'O(log N)', rank: 2, reason: `N up to ${n.toExponential(0)} requires O(1) or O(log N) math/binary search.` };
  }
  if (n >= 1e6) {
    return { ceiling: 'O(N)', rank: 3, reason: `N up to ${n.toLocaleString()} demands linear O(N) time (no O(N log N) heavy constants or O(N^2)).` };
  }
  if (n >= 5e4) {
    return { ceiling: 'O(N log N)', rank: 4, reason: `N <= ${n.toLocaleString()} caps feasible runtime at O(N) or O(N log N); O(N^2) will TLE.` };
  }
  if (n >= 500) {
    return { ceiling: 'O(N^2)', rank: 5, reason: `N <= ${n.toLocaleString()} allows O(N^2) DP/graph algorithms, pruning O(2^N).` };
  }
  if (n >= 15) {
    return { ceiling: 'O(2^N)', rank: 6, reason: `Small N <= ${n} explicitly signals Backtracking or Bitmask DP O(N * 2^N).` };
  }
  return { ceiling: 'O(N!)', rank: 7, reason: `Tiny N <= ${n} permits factorial search, N-Queens, or exhaustive state analysis.` };
}

export function extractConstraints(text: string): ExtractedConstraint[] {
  const found: ExtractedConstraint[] = [];

  // Match scientific notation like 10^5, 10^9, 1e5, 2*10^5
  const powerRegex = /(?:n|m|len|length|size|records|items|piles|weights?)?\s*(?:<=|≤|<|=|up to|over)?\s*(\d+(?:\.\d+)?)?\s*(?:\*|x)?\s*(?:10\^(\d+)|1e(\d+))/gi;
  let match: RegExpExecArray | null;
  while ((match = powerRegex.exec(text)) !== null) {
    const coeff = match[1] ? Number(match[1]) : 1;
    const exp = Number(match[2] ?? match[3]);
    if (!Number.isFinite(exp) || exp < 1 || exp > 18) continue;
    const val = coeff * Math.pow(10, exp);
    const mapped = numericBoundToCeiling(val);
    found.push({
      raw: match[0].trim(),
      label: `Scale Bound (${match[0].trim()})`,
      numericBound: val,
      ceiling: mapped.ceiling,
      ceilingRank: mapped.rank,
      reason: mapped.reason,
    });
  }

  // Match phrases like "10 million", "10M records", "500k"
  const humanScaleRegex = /(\d+(?:\.\d+)?)\s*(m|million|k|thousand|b|billion)\b/gi;
  while ((match = humanScaleRegex.exec(text)) !== null) {
    const base = Number(match[1]);
    const unit = match[2].toLowerCase();
    const mult = unit.startsWith('b') ? 1e9 : unit.startsWith('m') ? 1e6 : 1e3;
    const val = base * mult;
    const mapped = numericBoundToCeiling(val);
    found.push({
      raw: match[0].trim(),
      label: `Corpus Scale (${match[0].trim()})`,
      numericBound: val,
      ceiling: mapped.ceiling,
      ceilingRank: mapped.rank,
      reason: mapped.reason,
    });
  }

  // Match small explicit N <= 20, N <= 1000, N <= 500
  const plainBoundRegex = /\b[nmk]\s*(?:<=|≤|<|=)\s*(\d{1,7})\b/gi;
  while ((match = plainBoundRegex.exec(text)) !== null) {
    const val = Number(match[1]);
    if (val <= 0) continue;
    const mapped = numericBoundToCeiling(val);
    found.push({
      raw: match[0].trim(),
      label: `Explicit Bound (${match[0].trim()})`,
      numericBound: val,
      ceiling: mapped.ceiling,
      ceilingRank: mapped.rank,
      reason: mapped.reason,
    });
  }

  // Match latency SLA e.g. "under 10ms", "< 5ms"
  const latencyMatch = text.match(/(?:under|<|<=)\s*(\d+)\s*ms/i);
  if (latencyMatch) {
    found.push({
      raw: latencyMatch[0].trim(),
      label: `Latency SLA (${latencyMatch[0].trim()})`,
      ceiling: 'O(N)',
      ceilingRank: 3,
      reason: 'Real-time millisecond SLA mandates sub-linear indexing or two-stage filter-and-refine retrieval.',
    });
  }

  // Match explicit O(...) complexity targets
  if (/o\(1\)\s*(?:extra\s+|auxiliary\s+)?space|in-place/i.test(text)) {
    found.push({
      raw: 'O(1) space',
      label: 'Constant Space Constraint',
      ceiling: 'O(N log N)',
      ceilingRank: 4,
      spaceConstraint: 'O(1)',
      reason: 'Disqualifies O(N) auxiliary hash maps/DP tables unless space-compressed; favors Two Pointers, Bitwise, or In-Place pointers.',
    });
  }
  if (/o\(log\s*n\)/i.test(text)) {
    found.push({
      raw: 'O(log N)',
      label: 'Logarithmic Time Requirement',
      ceiling: 'O(log N)',
      ceilingRank: 2,
      reason: 'Explicit O(log N) target eliminates linear scans; signals Binary Search, Segment/Fenwick Tree, or Fast Math.',
    });
  }
  if (/o\(n\)\s*time/i.test(text)) {
    found.push({
      raw: 'O(N) time',
      label: 'Linear Time Requirement',
      ceiling: 'O(N)',
      ceilingRank: 3,
      reason: 'Explicit linear time budget eliminates sorting O(N log N) and quadratic O(N^2) loops.',
    });
  }

  // Deduplicate by raw label
  const dedup = new Map<string, ExtractedConstraint>();
  for (const c of found) {
    if (!dedup.has(c.raw.toLowerCase())) dedup.set(c.raw.toLowerCase(), c);
  }
  return Array.from(dedup.values());
}

const STRUCTURAL_TRIGGERS = [
  'contiguous subarray',
  'longest substring',
  'at most k',
  'sorted array',
  'negative numbers',
  'o(1) space',
  'top k',
  'kth largest',
  'shortest path',
  'weighted graph',
  'prerequisites',
  'dynamic connectivity',
  'range query',
  'minimize the maximum',
  'all permutations',
  'all subsets',
  'n-queens',
  'fuzzy search',
  'typo tolerant',
  'inverted index',
  'reranking',
  'damerau-levenshtein',
  'jaro-winkler',
  'trigrams',
  'minhash',
  'symspell',
  'bk-tree',
  'invariant',
  'parity',
  'chessboard',
  'domino',
  'pigeonhole',
  'both players play optimally',
  'nim',
  'xor',
  'truth elimination',
  'logic grid',
  'clues',
  'balance scale',
  'weighings',
  'river crossing',
];

const ANTI_PATTERN_PHRASES = [
  'negative numbers',
  'o(1) space',
  'unsorted',
  'non-contiguous',
  'directed cycle',
  '10 million',
  'under 10ms',
  'typo',
];

export function deconstructProblem(rawInput: string): DeconstructionResult {
  const normalizedText = normalizeText(rawInput);
  const domainScores = classifyDomain(rawInput);
  const primaryDomain = domainScores[0]?.domain ?? 'DSA_ALGORITHMIC';
  const constraints = extractConstraints(rawInput);

  // Determine tightest complexity ceiling from constraints (default O(N^2) if unconstrained)
  let hardestCeiling: ComplexityOrder = 'O(N^2)';
  let hardestCeilingRank = 5;
  for (const c of constraints) {
    if (c.ceilingRank < hardestCeilingRank) {
      hardestCeilingRank = c.ceilingRank;
      hardestCeiling = c.ceiling;
    }
  }

  const paddedTrigrams = extractPaddedTrigrams(rawInput);
  const triggerPhrases = STRUCTURAL_TRIGGERS.filter((t) => normalizedText.includes(t));
  const antiPatternSignals = ANTI_PATTERN_PHRASES.filter((a) => normalizedText.includes(a));

  // Extract capitalized entities or quoted identifiers
  const entityMatches = rawInput.match(/\b[A-Z][a-z]{2,}\b/g) ?? [];
  const entities = Array.from(new Set(entityMatches)).slice(0, 10);

  return {
    rawInput,
    normalizedText,
    primaryDomain,
    domainScores,
    constraints,
    hardestCeiling,
    hardestCeilingRank,
    paddedTrigrams,
    triggerPhrases,
    entities,
    antiPatternSignals,
  };
}
