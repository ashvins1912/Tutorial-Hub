import type {
  CandidateMatch,
  DeconstructionResult,
  RetrievalOutput,
  StrategySignature,
} from '../knowledge-base/types';
import { extractPaddedTrigrams } from './Deconstructor';

interface IndexedStrategyDoc {
  index: number;
  strategy: StrategySignature;
  trigramSet: Set<string>;
  trigramCount: number;
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Stage 2: High-Recall Inverted N-Gram Index with Length & Count Pruning.
 * Pure TypeScript (zero DOM/UI dependencies). Runs in < 5ms over 35+ strategies.
 */
export class CandidateRetriever {
  private readonly docs: IndexedStrategyDoc[] = [];
  private readonly invertedIndex = new Map<string, number[]>();

  constructor(strategies: StrategySignature[]) {
    strategies.forEach((strategy, index) => {
      const corpusText = [
        strategy.name,
        strategy.category,
        strategy.mentalModel,
        ...strategy.structuralClues,
        ...strategy.triggerKeywords,
      ].join(' ');

      const trigrams = extractPaddedTrigrams(corpusText);
      const trigramSet = new Set(trigrams);
      this.docs.push({
        index,
        strategy,
        trigramSet,
        trigramCount: trigramSet.size,
      });

      for (const tri of trigramSet) {
        let posting = this.invertedIndex.get(tri);
        if (!posting) {
          posting = [];
          this.invertedIndex.set(tri, posting);
        }
        posting.push(index);
      }
    });
  }

  public retrieve(deconstruction: DeconstructionResult, topK = 12): RetrievalOutput {
    const start = nowMs();
    const queryTrigrams = deconstruction.paddedTrigrams;
    const querySet = new Set(queryTrigrams);
    const querySize = querySet.size;

    // Accumulate posting list hits via inverted index merge
    const hitCounts = new Int32Array(this.docs.length);
    for (const tri of querySet) {
      const posting = this.invertedIndex.get(tri);
      if (!posting) continue;
      for (let i = 0; i < posting.length; i++) {
        hitCounts[posting[i]] += 1;
      }
    }

    // Dynamic count & length pruning thresholds
    const minCountThreshold = querySize >= 30 ? 4 : querySize >= 12 ? 2 : 1;
    const candidates: CandidateMatch[] = [];
    let prunedCount = 0;

    for (let i = 0; i < this.docs.length; i++) {
      const doc = this.docs[i];
      const overlap = hitCounts[i];

      // Always keep domain-aligned strategies if query is very short, otherwise apply count & length pruning
      const domainMatch = doc.strategy.domains.includes(deconstruction.primaryDomain);
      const lengthRatio =
        querySize > 0 ? Math.min(querySize, doc.trigramCount) / Math.max(querySize, doc.trigramCount) : 0;

      if (overlap < minCountThreshold && !(domainMatch && overlap >= 1)) {
        prunedCount += 1;
        continue;
      }

      // Length pruning: reject tiny overlap on huge query unless domain matches strongly
      if (querySize > 40 && lengthRatio < 0.04 && overlap < 5 && !domainMatch) {
        prunedCount += 1;
        continue;
      }

      const unionSize = querySize + doc.trigramCount - overlap;
      const jaccardScore = unionSize > 0 ? overlap / unionSize : 0;
      const recallScore = querySize > 0 ? overlap / Math.min(querySize, doc.trigramCount) : 0;

      candidates.push({
        strategy: doc.strategy,
        overlapCount: overlap,
        jaccardScore: Number(jaccardScore.toFixed(4)),
        recallScore: Number(recallScore.toFixed(4)),
        matchedTrigrams: overlap,
      });
    }

    // Fallback guarantee: if strict pruning yields < 3 candidates, inject top domain strategies
    if (candidates.length < 3) {
      for (const doc of this.docs) {
        if (
          doc.strategy.domains.includes(deconstruction.primaryDomain) &&
          !candidates.some((c) => c.strategy.id === doc.strategy.id)
        ) {
          candidates.push({
            strategy: doc.strategy,
            overlapCount: hitCounts[doc.index],
            jaccardScore: 0.05,
            recallScore: 0.1,
            matchedTrigrams: hitCounts[doc.index],
          });
        }
      }
    }

    candidates.sort((a, b) => {
      const scoreA = a.recallScore * 0.65 + a.jaccardScore * 0.35;
      const scoreB = b.recallScore * 0.65 + b.jaccardScore * 0.35;
      return scoreB - scoreA;
    });

    const elapsedMs = Number(Math.max(0.05, nowMs() - start).toFixed(2));

    return {
      candidates: candidates.slice(0, topK),
      indexedStrategyCount: this.docs.length,
      totalIndexedTrigrams: this.invertedIndex.size,
      evaluatedCount: this.docs.length - prunedCount,
      prunedCount,
      elapsedMs,
    };
  }
}
