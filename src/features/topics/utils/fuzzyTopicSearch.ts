import type { CurriculumTopic } from '../types';

function paddedTrigrams(raw: string): Set<string> {
  const clean = raw.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
  if (!clean) return new Set();
  const padded = `  ${clean}  `;
  const grams = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const g of a) {
    if (b.has(g)) inter++;
  }
  return inter / (a.size + b.size - inter);
}

function overlapCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const g of a) {
    if (b.has(g)) inter++;
  }
  return inter / Math.min(a.size, b.size);
}

export interface TopicSearchResult {
  topic: CurriculumTopic;
  score: number;
  matchMode: 'exact' | 'ngram-fuzzy';
}

/**
 * Typo-tolerant topic search powered by padded character trigrams + Overlap/Jaccard scoring.
 * Handles typos like "slidng windw", "fenwik", "dameru", or "monotnic stak".
 */
export function fuzzySearchTopics(
  topics: CurriculumTopic[],
  rawQuery: string
): TopicSearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return topics.map((topic) => ({ topic, score: 1, matchMode: 'exact' }));
  }

  const qGrams = paddedTrigrams(query);
  const scored: TopicSearchResult[] = [];

  for (const topic of topics) {
    const corpus = [
      topic.title,
      topic.shortTitle,
      topic.category,
      topic.tier,
      topic.tagline,
      ...topic.keywords,
    ]
      .join(' ')
      .toLowerCase();

    // Direct substring / prefix fast path
    if (topic.title.toLowerCase().includes(query) || corpus.includes(query)) {
      const prefixBoost = topic.title.toLowerCase().startsWith(query) ? 1.0 : 0.94;
      scored.push({ topic, score: prefixBoost, matchMode: 'exact' });
      continue;
    }

    // Fuzzy padded trigram comparison against title & each keyword
    const candidates = [topic.title, topic.shortTitle, topic.category, ...topic.keywords];
    let bestScore = 0;

    for (const phrase of candidates) {
      const pGrams = paddedTrigrams(phrase);
      const j = jaccardSimilarity(qGrams, pGrams);
      const ov = overlapCoefficient(qGrams, pGrams);
      const blended = 0.55 * ov + 0.45 * j;
      if (blended > bestScore) bestScore = blended;
    }

    if (bestScore >= 0.34) {
      scored.push({ topic, score: bestScore, matchMode: 'ngram-fuzzy' });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.topic.order - b.topic.order);
  return scored;
}
