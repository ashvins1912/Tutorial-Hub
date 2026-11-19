// Real-time N-Gram Fuzzy Search computation engine across all 4 pipeline stages

export interface TokenSpan {
  token: string;
  indices: number[]; // indices in source display string
  label?: string;
}

export interface BpeMergeStep {
  round: number;
  pair: [string, string];
  merged: string;
  frequency: number;
  tokens: string[];
}

export interface SimilarityMetricsBundle {
  gramsA: string[];
  gramsB: string[];
  setA: string[];
  setB: string[];
  intersection: string[];
  union: string[];
  onlyA: string[];
  onlyB: string[];
  jaccard: number;
  dice: number;
  overlap: number;
  braunBlanquet: number;
  tversky: number;
  kulczynski: number;
  cosineBinary: number;
  cosineTfIdf: number;
  okapiBm25: number;
  softTfIdf: number;
  kondrakPositional: number;
  ukkonenL1Distance: number;
  ukkonenSimilarity: number;
  ngramLevenshteinDist: number;
  ngramLevenshteinSim: number;
  ngramDpMatrix: number[][];
  freqDiffs: { gram: string; countA: number; countB: number; diff: number }[];
}

export interface PruningCandidate {
  id: number;
  doc: string;
  len: number;
  sharedGrams: number;
  passLength: boolean;
  passCount: boolean;
  passPosition: boolean;
  passPrefix: boolean;
  editDistance: number;
  maxUpperBound: number;
}

export interface MinHashLshResult {
  numHashes: number;
  sigA: number[];
  sigB: number[];
  estimatedJaccard: number;
  exactJaccard: number;
  bands: { bandIndex: number; bucketA: string; bucketB: string; collided: boolean }[];
  anyBandCollision: boolean;
}

export interface SimHashResult {
  bitsA: number[];
  bitsB: number[];
  xorBits: number[];
  hammingDistance: number;
  similarity: number;
  weightsA: number[];
}

export interface BloomFilterResult {
  size: number;
  bits: boolean[];
  docBits: { gram: string; h1: number; h2: number }[];
  queryChecks: { gram: string; h1: number; h2: number; present: boolean; trueMatch: boolean }[];
  hitRatio: number;
  falsePositiveChecks: number;
}

export interface BkTreeNodeView {
  word: string;
  parent: string | null;
  edgeDist: number;
  queryDist: number;
  status: 'match' | 'visited' | 'pruned';
  depth: number;
}

export interface NgTrieNodeView {
  prefix: string;
  grams: string[];
  matchedQuery: boolean;
  docs: string[];
}

export const SAMPLE_SEARCH_CORPUS = [
  'algorithm',
  'algoritm',
  'logarithm',
  'algorist',
  'algebraic',
  'alignment',
  'alligator',
  'altruism',
  'analog',
  'catalogue',
  'rhythm',
  'alphanumeric',
];

function cleanText(raw: string): string {
  return raw.trim().toLowerCase() || 'algorithm';
}

// ============================================================================
// STAGE 1: TOKENIZATION & SLICING (7 Algorithms)
// ============================================================================

export function extractCharNGrams(raw: string, n: number): TokenSpan[] {
  const s = cleanText(raw);
  const k = Math.max(1, Math.min(n, s.length));
  const out: TokenSpan[] = [];
  for (let i = 0; i <= s.length - k; i++) {
    const indices: number[] = [];
    for (let j = 0; j < k; j++) indices.push(i + j);
    out.push({ token: s.slice(i, i + k), indices });
  }
  return out;
}

export function extractEdgeNGrams(raw: string, minN = 2, maxN = 5): TokenSpan[] {
  const s = cleanText(raw);
  const words = s.split(/\s+/).filter(Boolean);
  const out: TokenSpan[] = [];
  let offset = 0;
  for (const w of words) {
    const start = s.indexOf(w, offset);
    offset = start + w.length;
    const hi = Math.min(maxN, w.length);
    for (let len = Math.max(1, minN); len <= hi; len++) {
      const indices: number[] = [];
      for (let j = 0; j < len; j++) indices.push(start + j);
      out.push({ token: w.slice(0, len), indices, label: `prefix-${len}` });
    }
  }
  return out;
}

export function extractPaddedNGrams(raw: string, n: number): { padded: string; spans: TokenSpan[] } {
  const s = cleanText(raw);
  const k = Math.max(2, Math.min(n, 5));
  const pad = '_'.repeat(k - 1);
  const padded = `${pad}${s}${pad}`;
  const spans: TokenSpan[] = [];
  for (let i = 0; i <= padded.length - k; i++) {
    const indices: number[] = [];
    for (let j = 0; j < k; j++) indices.push(i + j);
    spans.push({ token: padded.slice(i, i + k), indices });
  }
  return { padded, spans };
}

export function extractKSkipNGrams(raw: string, n: number, kSkip: number): TokenSpan[] {
  const s = cleanText(raw).slice(0, 14);
  const gramLen = Math.max(2, Math.min(n, 3));
  const skip = Math.max(0, Math.min(kSkip, 2));
  const out: TokenSpan[] = [];

  if (gramLen === 2) {
    for (let i = 0; i < s.length; i++) {
      for (let gap = 0; gap <= skip; gap++) {
        const j = i + 1 + gap;
        if (j < s.length) {
          out.push({
            token: s[i] + s[j],
            indices: [i, j],
            label: gap === 0 ? 'contiguous' : `skip-${gap}`,
          });
        }
      }
    }
  } else {
    for (let i = 0; i < s.length; i++) {
      for (let g1 = 0; g1 <= skip; g1++) {
        const j = i + 1 + g1;
        if (j >= s.length) continue;
        for (let g2 = 0; g2 <= skip - g1; g2++) {
          const m = j + 1 + g2;
          if (m < s.length) {
            out.push({
              token: s[i] + s[j] + s[m],
              indices: [i, j, m],
              label: g1 + g2 === 0 ? 'contiguous' : `skip-${g1 + g2}`,
            });
          }
        }
      }
    }
  }
  return out.slice(0, 24);
}

export function extractWordNGrams(raw: string, n: number): { words: string[]; spans: TokenSpan[] } {
  const cleaned = cleanText(raw);
  const words = cleaned.includes(' ')
    ? cleaned.split(/\s+/).filter(Boolean)
    : ['fast', 'fuzzy', 'ngram', 'search', 'engine'];
  const k = Math.max(1, Math.min(n, words.length));
  const spans: TokenSpan[] = [];
  for (let i = 0; i <= words.length - k; i++) {
    const indices: number[] = [];
    for (let j = 0; j < k; j++) indices.push(i + j);
    spans.push({ token: words.slice(i, i + k).join(' '), indices });
  }
  return { words, spans };
}

export function extractVariableNGrams(raw: string): TokenSpan[] {
  const bi = extractCharNGrams(raw, 2).map((s) => ({ ...s, label: '2-gram' }));
  const tri = extractCharNGrams(raw, 3).map((s) => ({ ...s, label: '3-gram' }));
  return [...bi, ...tri];
}

export function runBpeMerges(raw: string, rounds = 4): BpeMergeStep[] {
  const base = cleanText(raw);
  const corpusStr = base.length < 10 ? `${base} ${base}s ${base}ic` : `${base} ${base}`;
  let tokens = corpusStr.split('').map((ch) => (ch === ' ' ? '▁' : ch));
  const steps: BpeMergeStep[] = [];

  for (let r = 1; r <= rounds; r++) {
    const counts = new Map<string, { pair: [string, string]; count: number }>();
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i] === '▁' || tokens[i + 1] === '▁') continue;
      const key = `${tokens[i]}\u0000${tokens[i + 1]}`;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { pair: [tokens[i], tokens[i + 1]], count: 1 });
    }
    let best: { pair: [string, string]; count: number } | null = null;
    for (const entry of counts.values()) {
      if (!best || entry.count > best.count) best = entry;
    }
    if (!best || best.count < 2) break;
    const merged = best.pair[0] + best.pair[1];
    const next: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (i < tokens.length - 1 && tokens[i] === best.pair[0] && tokens[i + 1] === best.pair[1]) {
        next.push(merged);
        i++;
      } else {
        next.push(tokens[i]);
      }
    }
    tokens = next;
    steps.push({
      round: r,
      pair: best.pair,
      merged,
      frequency: best.count,
      tokens: tokens.slice(0, 18),
    });
  }
  return steps;
}

// ============================================================================
// STAGE 2: SIMILARITY & DISTANCE METRICS (12 Algorithms)
// ============================================================================

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function charSim(g1: string, g2: string): number {
  const maxLen = Math.max(g1.length, g2.length, 1);
  return 1 - levenshteinDistance(g1, g2) / maxLen;
}

export function computeAllSimilarityMetrics(
  rawA: string,
  rawB: string,
  n = 3,
  alpha = 0.5,
  beta = 0.5
): SimilarityMetricsBundle {
  const gramsA = extractPaddedNGrams(rawA, n).spans.map((s) => s.token);
  const gramsB = extractPaddedNGrams(rawB, n).spans.map((s) => s.token);

  const setObjA = new Set(gramsA);
  const setObjB = new Set(gramsB);
  const setA = Array.from(setObjA);
  const setB = Array.from(setObjB);
  const intersection = setA.filter((g) => setObjB.has(g));
  const union = Array.from(new Set([...setA, ...setB]));
  const onlyA = setA.filter((g) => !setObjB.has(g));
  const onlyB = setB.filter((g) => !setObjA.has(g));

  const interLen = intersection.length;
  const aLen = Math.max(setA.length, 1);
  const bLen = Math.max(setB.length, 1);

  // 1-6: Set-Based Unweighted
  const jaccard = union.length === 0 ? 1 : interLen / union.length;
  const dice = (2 * interLen) / (aLen + bLen);
  const overlap = interLen / Math.min(aLen, bLen);
  const braunBlanquet = interLen / Math.max(aLen, bLen);
  const tverskyDenom = interLen + alpha * onlyA.length + beta * onlyB.length;
  const tversky = tverskyDenom === 0 ? 1 : interLen / tverskyDenom;
  const kulczynski = 0.5 * (interLen / aLen + interLen / bLen);

  // Frequency maps
  const freqA = new Map<string, number>();
  const freqB = new Map<string, number>();
  for (const g of gramsA) freqA.set(g, (freqA.get(g) ?? 0) + 1);
  for (const g of gramsB) freqB.set(g, (freqB.get(g) ?? 0) + 1);

  // Corpus document frequency for TF-IDF & BM25
  const corpusDocs = [...SAMPLE_SEARCH_CORPUS, cleanText(rawA), cleanText(rawB)];
  const corpusSets = corpusDocs.map((d) => new Set(extractPaddedNGrams(d, n).spans.map((s) => s.token)));
  const N = corpusDocs.length;
  const idf = (g: string) => {
    let df = 0;
    for (const cs of corpusSets) if (cs.has(g)) df++;
    return Math.log((N + 1) / (df + 1)) + 1;
  };

  // 7: Cosine (Binary & TF-IDF)
  const cosineBinary = interLen / Math.sqrt(aLen * bLen);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const g of union) {
    const w = idf(g);
    const va = (freqA.get(g) ?? 0) * w;
    const vb = (freqB.get(g) ?? 0) * w;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  const cosineTfIdf = normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));

  // 8: Okapi BM25 on N-Grams
  const k1 = 1.2;
  const b = 0.75;
  const avgdl =
    corpusDocs.reduce((acc, d) => acc + extractPaddedNGrams(d, n).spans.length, 0) / corpusDocs.length;
  const docLen = gramsB.length;
  let bm25Raw = 0;
  let bm25Max = 0;
  for (const g of setA) {
    const w = idf(g);
    const tf = freqB.get(g) ?? 0;
    if (tf > 0) {
      bm25Raw += w * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * docLen) / avgdl)));
    }
    bm25Max += w * ((1 * (k1 + 1)) / (1 + k1 * (1 - b + (b * gramsA.length) / avgdl)));
  }
  const okapiBm25 = bm25Max === 0 ? 0 : Math.min(1, bm25Raw / bm25Max);

  // 9: Soft TF-IDF (allows secondary char-level similarity >= 0.65 between non-identical n-grams)
  let softScore = 0;
  const normW = (grams: Map<string, number>) => {
    let sumSq = 0;
    for (const [g, c] of grams.entries()) sumSq += (c * idf(g)) ** 2;
    return Math.sqrt(sumSq) || 1;
  };
  const na = normW(freqA);
  const nb = normW(freqB);
  for (const gA of setA) {
    let bestMatchSim = 0;
    let bestGB = '';
    for (const gB of setB) {
      const sim = gA === gB ? 1 : charSim(gA, gB);
      if (sim > bestMatchSim) {
        bestMatchSim = sim;
        bestGB = gB;
      }
    }
    if (bestMatchSim >= 0.65 && bestGB) {
      const wa = ((freqA.get(gA) ?? 0) * idf(gA)) / na;
      const wb = ((freqB.get(bestGB) ?? 0) * idf(bestGB)) / nb;
      softScore += wa * wb * bestMatchSim;
    }
  }
  const softTfIdf = Math.min(1, softScore);

  // 10: Kondrak Positional N-Gram Similarity (order-preserving DP with fractional n-gram match)
  const m = gramsA.length;
  const l = gramsB.length;
  const kdp: number[][] = Array.from({ length: m + 1 }, () => new Array(l + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= l; j++) {
      let samePos = 0;
      const ga = gramsA[i - 1];
      const gb = gramsB[j - 1];
      for (let c = 0; c < Math.min(ga.length, gb.length); c++) {
        if (ga[c] === gb[c]) samePos++;
      }
      const matchScore = samePos / Math.max(ga.length, gb.length, 1);
      kdp[i][j] = Math.max(kdp[i - 1][j], kdp[i][j - 1], kdp[i - 1][j - 1] + matchScore);
    }
  }
  const kondrakPositional = Math.max(m, l) === 0 ? 1 : kdp[m][l] / Math.max(m, l);

  // 11: Ukkonen's Q-Gram Distance (L1 norm of frequency vectors)
  const freqDiffs = union.map((gram) => {
    const countA = freqA.get(gram) ?? 0;
    const countB = freqB.get(gram) ?? 0;
    return { gram, countA, countB, diff: Math.abs(countA - countB) };
  });
  const ukkonenL1Distance = freqDiffs.reduce((sum, item) => sum + item.diff, 0);
  const maxL1 = gramsA.length + gramsB.length || 1;
  const ukkonenSimilarity = 1 - ukkonenL1Distance / maxL1;

  // 12: N-Gram Levenshtein (Generalized Edit Distance over N-Gram sequence)
  const ndp: number[][] = Array.from({ length: m + 1 }, () => new Array(l + 1).fill(0));
  for (let i = 0; i <= m; i++) ndp[i][0] = i;
  for (let j = 0; j <= l; j++) ndp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= l; j++) {
      const cost = gramsA[i - 1] === gramsB[j - 1] ? 0 : 1;
      ndp[i][j] = Math.min(ndp[i - 1][j] + 1, ndp[i][j - 1] + 1, ndp[i - 1][j - 1] + cost);
    }
  }
  const ngramLevenshteinDist = ndp[m][l];
  const ngramLevenshteinSim = 1 - ngramLevenshteinDist / Math.max(m, l, 1);

  return {
    gramsA,
    gramsB,
    setA,
    setB,
    intersection,
    union,
    onlyA,
    onlyB,
    jaccard,
    dice,
    overlap,
    braunBlanquet,
    tversky,
    kulczynski,
    cosineBinary,
    cosineTfIdf,
    okapiBm25,
    softTfIdf,
    kondrakPositional,
    ukkonenL1Distance,
    ukkonenSimilarity,
    ngramLevenshteinDist,
    ngramLevenshteinSim,
    ngramDpMatrix: ndp,
    freqDiffs,
  };
}

// ============================================================================
// STAGE 3: INDEXING, FILTERING & RETRIEVAL SIMULATORS (10 Algorithms)
// ============================================================================

export function simulatePruningFunnel(rawQuery: string, n = 3, maxEditK = 2): {
  countThreshold: number;
  prefixLen: number;
  candidates: PruningCandidate[];
  postingLists: { gram: string; docIds: number[] }[];
} {
  const q = cleanText(rawQuery);
  const qGrams = extractCharNGrams(q, n).map((s) => s.token);
  const qSet = new Set(qGrams);

  const countThreshold = Math.max(1, q.length - n + 1 - maxEditK * n);
  const prefixLen = Math.max(1, Math.min(qGrams.length, qGrams.length - countThreshold + 1));

  // Document frequency for global rarity sorting (AllPairs / PPJoin prefix filter)
  const docGramLists = SAMPLE_SEARCH_CORPUS.map((d) => extractCharNGrams(d, n).map((s) => s.token));
  const df = new Map<string, number>();
  for (const list of docGramLists) {
    for (const g of new Set(list)) df.set(g, (df.get(g) ?? 0) + 1);
  }
  const sortRare = (grams: string[]) =>
    [...new Set(grams)].sort((a, b) => (df.get(a) ?? 0) - (df.get(b) ?? 0) || a.localeCompare(b));

  const qPrefix = new Set(sortRare(qGrams).slice(0, prefixLen));

  const candidates: PruningCandidate[] = SAMPLE_SEARCH_CORPUS.map((doc, idx) => {
    const dGrams = docGramLists[idx];
    const dSet = new Set(dGrams);
    let shared = 0;
    for (const g of qSet) if (dSet.has(g)) shared++;
    const passLength = Math.abs(doc.length - q.length) <= maxEditK;
    const minNeeded = Math.max(1, Math.max(q.length, doc.length) - n + 1 - maxEditK * n);
    const passCount = passLength && shared >= minNeeded;

    // Position filter: check first matching rare gram position upper bound
    const sortedDoc = sortRare(dGrams);
    const dPrefix = sortedDoc.slice(0, Math.max(1, sortedDoc.length - minNeeded + 1));
    const passPrefix = passLength && dPrefix.some((g) => qPrefix.has(g));
    const passPosition = passCount && passPrefix;
    const editDistance = levenshteinDistance(q, doc);
    const maxUpperBound = Number((shared / Math.max(qSet.size, 1) + 0.15).toFixed(2));

    return {
      id: idx + 1,
      doc,
      len: doc.length,
      sharedGrams: shared,
      passLength,
      passCount,
      passPosition,
      passPrefix,
      editDistance,
      maxUpperBound,
    };
  });

  const postingLists = Array.from(qSet)
    .slice(0, 6)
    .map((gram) => ({
      gram,
      docIds: docGramLists
        .map((list, idx) => (list.includes(gram) ? idx + 1 : -1))
        .filter((id) => id !== -1),
    }));

  return { countThreshold, prefixLen, candidates, postingLists };
}

function hashSeeded(str: string, seed: number): number {
  let h = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % 997;
}

export function simulateMinHashLsh(rawA: string, rawB: string, n = 3): MinHashLshResult {
  const setA = Array.from(new Set(extractCharNGrams(rawA, n).map((s) => s.token)));
  const setB = Array.from(new Set(extractCharNGrams(rawB, n).map((s) => s.token)));
  const seeds = [11, 29, 53, 97, 131, 193, 257, 389];
  const minFor = (set: string[], seed: number) =>
    set.length === 0 ? 0 : Math.min(...set.map((g) => hashSeeded(g, seed)));

  const sigA = seeds.map((s) => minFor(setA, s));
  const sigB = seeds.map((s) => minFor(setB, s));
  let matches = 0;
  for (let i = 0; i < seeds.length; i++) if (sigA[i] === sigB[i]) matches++;

  const unionSize = new Set([...setA, ...setB]).size || 1;
  const interSize = setA.filter((g) => setB.includes(g)).length;

  // 4 bands of 2 rows each
  const bands = [0, 1, 2, 3].map((b) => {
    const bucketA = `${sigA[b * 2]}-${sigA[b * 2 + 1]}`;
    const bucketB = `${sigB[b * 2]}-${sigB[b * 2 + 1]}`;
    return { bandIndex: b + 1, bucketA, bucketB, collided: bucketA === bucketB };
  });

  return {
    numHashes: seeds.length,
    sigA,
    sigB,
    estimatedJaccard: matches / seeds.length,
    exactJaccard: interSize / unionSize,
    bands,
    anyBandCollision: bands.some((b) => b.collided),
  };
}

export function simulateSimHash(rawA: string, rawB: string, n = 3): SimHashResult {
  const BITS = 16;
  const fingerprint = (text: string) => {
    const grams = extractCharNGrams(text, n).map((s) => s.token);
    const weights = new Array<number>(BITS).fill(0);
    for (const g of grams) {
      const h = hashSeeded(g, 733) * 67 + hashSeeded(g, 19);
      for (let bit = 0; bit < BITS; bit++) {
        weights[bit] += (h >> bit) & 1 ? 1 : -1;
      }
    }
    return { bits: weights.map((w) => (w >= 0 ? 1 : 0)), weights };
  };

  const a = fingerprint(rawA);
  const b = fingerprint(rawB);
  const xorBits = a.bits.map((bit, i) => bit ^ b.bits[i]);
  const hammingDistance = xorBits.reduce((s, v) => s + v, 0);

  return {
    bitsA: a.bits,
    bitsB: b.bits,
    xorBits,
    hammingDistance,
    similarity: 1 - hammingDistance / BITS,
    weightsA: a.weights,
  };
}

export function simulateBloomFilter(rawQuery: string, rawDoc: string, n = 3): BloomFilterResult {
  const size = 16;
  const bits = new Array<boolean>(size).fill(false);
  const docGrams = Array.from(new Set(extractCharNGrams(rawDoc, n).map((s) => s.token)));
  const docSet = new Set(docGrams);
  const queryGrams = Array.from(new Set(extractCharNGrams(rawQuery, n).map((s) => s.token)));

  const docBits = docGrams.map((gram) => {
    const h1 = hashSeeded(gram, 17) % size;
    const h2 = hashSeeded(gram, 61) % size;
    bits[h1] = true;
    bits[h2] = true;
    return { gram, h1, h2 };
  });

  const queryChecks = queryGrams.map((gram) => {
    const h1 = hashSeeded(gram, 17) % size;
    const h2 = hashSeeded(gram, 61) % size;
    const present = bits[h1] && bits[h2];
    return { gram, h1, h2, present, trueMatch: docSet.has(gram) };
  });

  const hits = queryChecks.filter((q) => q.present).length;
  const falsePositiveChecks = queryChecks.filter((q) => q.present && !q.trueMatch).length;

  return {
    size,
    bits,
    docBits,
    queryChecks,
    hitRatio: queryChecks.length === 0 ? 0 : hits / queryChecks.length,
    falsePositiveChecks,
  };
}

// ============================================================================
// STAGE 4: HYBRID & PHONETIC VARIANTS (4 Algorithms)
// ============================================================================

export function computeSoundex(raw: string): string {
  const s = cleanText(raw).replace(/[^a-z]/g, '').toUpperCase();
  if (!s) return 'A000';
  const map: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };
  let code = s[0];
  let prev = map[s[0]] ?? '';
  for (let i = 1; i < s.length && code.length < 4; i++) {
    const digit = map[s[i]] ?? '';
    if (digit && digit !== prev) code += digit;
    prev = digit;
  }
  return code.padEnd(4, '0');
}

export function computeSimpleMetaphone(raw: string): string {
  let s = cleanText(raw).replace(/[^a-z]/g, '').toUpperCase();
  if (!s) return 'ALGR';
  s = s
    .replace(/PH/g, 'F')
    .replace(/V/g, 'F')
    .replace(/CK/g, 'K')
    .replace(/C(?=[EIY])/g, 'S')
    .replace(/C/g, 'K')
    .replace(/Q/g, 'K')
    .replace(/Z/g, 'S')
    .replace(/GH/g, '')
    .replace(/(.)\1+/g, '$1');
  const first = s[0];
  const rest = s.slice(1).replace(/[AEIOUHY]/g, '');
  return (first + rest).slice(0, 6);
}

export function simulateBkTree(rawQuery: string, maxEditK = 2): BkTreeNodeView[] {
  const q = cleanText(rawQuery);
  const words = ['algorithm', 'algoritm', 'logarithm', 'algorist', 'alligator', 'rhythm', 'analog'];

  interface Node {
    word: string;
    children: Map<number, Node>;
  }
  const root: Node = { word: words[0], children: new Map() };
  for (let i = 1; i < words.length; i++) {
    let cur = root;
    const w = words[i];
    while (true) {
      const d = levenshteinDistance(cur.word, w);
      const next = cur.children.get(d);
      if (!next) {
        cur.children.set(d, { word: w, children: new Map() });
        break;
      }
      cur = next;
    }
  }

  const out: BkTreeNodeView[] = [];
  const traverse = (node: Node, parent: string | null, edgeDist: number, depth: number, pruned: boolean) => {
    const d = levenshteinDistance(q, node.word);
    const status: BkTreeNodeView['status'] = pruned ? 'pruned' : d <= maxEditK ? 'match' : 'visited';
    out.push({ word: node.word, parent, edgeDist, queryDist: d, status, depth });

    for (const [childEdge, child] of node.children.entries()) {
      const childPruned = pruned || childEdge < d - maxEditK || childEdge > d + maxEditK;
      traverse(child, node.word, childEdge, depth + 1, childPruned);
    }
  };
  traverse(root, null, 0, 0, false);
  return out;
}

export function simulateNgTree(rawQuery: string, n = 3): NgTrieNodeView[] {
  const q = cleanText(rawQuery);
  const qGrams = new Set(extractCharNGrams(q, n).map((s) => s.token));
  const groups = new Map<string, { grams: Set<string>; docs: Set<string> }>();

  for (const doc of SAMPLE_SEARCH_CORPUS.slice(0, 8)) {
    const grams = extractCharNGrams(doc, n).map((s) => s.token);
    for (const g of grams) {
      const prefix = g.slice(0, Math.min(2, g.length));
      if (!groups.has(prefix)) groups.set(prefix, { grams: new Set(), docs: new Set() });
      groups.get(prefix)!.grams.add(g);
      groups.get(prefix)!.docs.add(doc);
    }
  }

  return Array.from(groups.entries())
    .slice(0, 8)
    .map(([prefix, info]) => {
      const grams = Array.from(info.grams).slice(0, 4);
      const matchedQuery = grams.some((g) => qGrams.has(g));
      return { prefix, grams, matchedQuery, docs: Array.from(info.docs).slice(0, 3) };
    });
}
