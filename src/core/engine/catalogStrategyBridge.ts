import {
  ADVANCED_ALGORITHM_CATEGORIES,
  ALGORITHMS_CATALOG,
  AlgorithmDefinition,
  SYSTEMS_ALGORITHM_CATEGORIES,
} from '../../data/algorithmsCatalog';
import {
  ALGORITHM_POWER_COMBOS,
  AlgorithmPowerCombo,
  MASTER_73_ROADMAP,
} from '../../data/algorithmCombinationsAndRoadmap';
import { getAlgorithmTutorGuide } from '../../data/algorithmTutorGuides';
import { getAlgorithmUpgradeSpec } from '../../data/algorithmUpgradeLadders';
import { CURRICULUM_TOPICS } from '../../features/topics/data/curriculumIndex';
import type { AnnotatedCodeLine, CurriculumTopic } from '../../features/topics/types';
import { STRATEGIES_CATALOG } from '../knowledge-base/strategiesCatalog';
import {
  CognitiveDomain,
  DifficultyTier,
  StrategySignature,
  WorkspaceKind,
} from '../knowledge-base/types';

export interface IndexedStrategyMeta {
  strategyId: string;
  algorithmId?: string;
  curriculumTopicId?: string;
  masterNumber?: number;
}

function parseComplexityRank(timeComplexity: string): number {
  const c = timeComplexity.toLowerCase();
  if (c.includes('n!') || c.includes('factorial')) return 7;
  if (c.includes('2^') || c.includes('3^') || c.includes('exponential')) return 6;
  if (c.includes('n^3') || c.includes('v^3') || c.includes('n^2') || c.includes('v * e') || c.includes('ve')) return 5;
  if (c.includes('log n') || c.includes('log v') || c.includes('log k')) {
    if (c.includes('n ') || c.includes('e ') || c.includes('m ') || c.includes('(v')) return 4;
    return 2;
  }
  if (c.includes('o(1)') || c.includes('amortized o(1)')) return 1;
  return 3;
}

function mapAlgoCategory(algo: AlgorithmDefinition): StrategySignature['category'] {
  if (algo.category === 'Advanced String Algorithms') return 'String & Fuzzy Search';
  if (
    algo.category === 'Tree & Graph Traversal' ||
    algo.category === 'Advanced Graph Algorithms' ||
    algo.category === 'Range Queries & Advanced Trees'
  ) {
    return 'Hierarchical & Graph';
  }
  if (
    algo.category === 'Optimization & Decision Making' ||
    algo.category === 'Advanced Dynamic Programming' ||
    algo.category === 'Number Theory & Geometry' ||
    algo.category === 'Randomized & Heuristic Algorithms'
  ) {
    return 'Algorithmic Paradigms';
  }
  return 'Foundations';
}

function mapAlgoDifficulty(algo: AlgorithmDefinition): DifficultyTier {
  if (SYSTEMS_ALGORITHM_CATEGORIES.includes(algo.category)) return 'Applied System Algorithms';
  if (ADVANCED_ALGORITHM_CATEGORIES.includes(algo.category)) return 'Advanced';
  if (algo.category === 'Specialized Algorithms') return 'Intermediate';
  return 'Foundations';
}

function mapAlgoDomains(algo: AlgorithmDefinition): CognitiveDomain[] {
  if (SYSTEMS_ALGORITHM_CATEGORIES.includes(algo.category)) {
    return ['SYSTEM_STATE_LOGIC', 'DSA_ALGORITHMIC'];
  }
  if (algo.category === 'Number Theory & Geometry') {
    return ['MATHEMATICAL_LOGIC', 'DSA_ALGORITHMIC'];
  }
  return ['DSA_ALGORITHMIC'];
}

function mapAlgoWorkspace(algo: AlgorithmDefinition): WorkspaceKind {
  if (
    algo.category === 'Array & String Patterns' ||
    algo.category === 'Searching & Sorting' ||
    algo.category === 'Advanced String Algorithms'
  ) {
    return 'array-pointer';
  }
  if (
    algo.category === 'Optimization & Decision Making' ||
    algo.category === 'Advanced Dynamic Programming' ||
    algo.category === 'Number Theory & Geometry'
  ) {
    return 'invariant-tracker';
  }
  return 'logic-builder';
}

function extractKeywords(text: string): string[] {
  const stop = new Set([
    'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'when', 'your', 'using',
    'over', 'each', 'only', 'need', 'find', 'data', 'algorithm', 'algorithms', 'based',
  ]);
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w));
  return Array.from(new Set(tokens)).slice(0, 14);
}

const TOPIC_BY_NAME_FRAGMENT = CURRICULUM_TOPICS.map((t) => ({
  id: t.id,
  tokens: extractKeywords(`${t.title} ${t.shortTitle} ${t.tagline}`),
}));

function inferCurriculumTopicId(algo: AlgorithmDefinition): string | undefined {
  const haystack = `${algo.name} ${algo.category} ${algo.linkedTopics.join(' ')}`.toLowerCase();
  let bestId: string | undefined;
  let bestHits = 0;
  for (const t of TOPIC_BY_NAME_FRAGMENT) {
    const hits = t.tokens.reduce((acc, tok) => acc + (haystack.includes(tok) ? 1 : 0), 0);
    if (hits > bestHits) {
      bestHits = hits;
      bestId = t.id;
    }
  }
  return bestHits > 0 ? bestId : undefined;
}

function buildAlgorithmStrategySignature(algo: AlgorithmDefinition): StrategySignature {
  const upgrade = getAlgorithmUpgradeSpec(algo);
  const guide = getAlgorithmTutorGuide(algo.id);
  const topicId = inferCurriculumTopicId(algo);

  const keywords = Array.from(
    new Set([
      algo.name.toLowerCase(),
      algo.shortName.toLowerCase(),
      algo.category.toLowerCase(),
      ...algo.linkedTopics.map((t) => t.toLowerCase()),
      ...extractKeywords(`${algo.tagline} ${algo.whenToUse.join(' ')}`),
    ])
  ).slice(0, 18);

  return {
    id: `algo-${algo.id}`,
    name: `${algo.name} (${algo.category})`,
    category: mapAlgoCategory(algo),
    difficulty: mapAlgoDifficulty(algo),
    domains: mapAlgoDomains(algo),
    workspaceKind: mapAlgoWorkspace(algo),
    curriculumTopicId: topicId,
    mentalModel: `${algo.tagline} — ${algo.coreIdea}`,
    structuralClues: algo.whenToUse.slice(0, 4),
    triggerKeywords: keywords,
    antiPatterns: [algo.whenItFails, guide?.avoidWhen ?? ''].filter(Boolean),
    optimalTime: algo.timeComplexity,
    optimalSpace: algo.spaceComplexity,
    complexityRank: parseComplexityRank(algo.timeComplexity),
    pitfalls: [algo.whenItFails, guide?.avoidWhen ?? ''].filter(Boolean),
    socraticPrompts: {
      DECONSTRUCT: `Identify the input constraints and signal phrases that point toward ${algo.name}: ${algo.whenToUse[0] ?? algo.tagline}`,
      HYPOTHESIZE: `Why does the naive ${upgrade.brute.time} brute force stall here? (${upgrade.brute.bottleneckOrWin})`,
      ELIMINATE_OR_BUILD: `State the invariant that unlocks ${algo.timeComplexity}: ${algo.loopInvariant}`,
      VERIFY_EDGE_CASES: `Guard against the top production pitfall: ${algo.whenItFails || guide?.avoidWhen || 'Check empty inputs, boundary indices, and overflow.'}`,
    },
    approaches: [
      {
        tier: 'Brute Force',
        title: upgrade.brute.label,
        timeComplexity: upgrade.brute.time,
        spaceComplexity: upgrade.brute.space,
        keyInsight: `${upgrade.brute.approach} Bottleneck: ${upgrade.brute.bottleneckOrWin}`,
        code: {
          typescript: `// Brute-force baseline for ${algo.name}\n// ${upgrade.brute.approach}\n// Time: ${upgrade.brute.time} | Space: ${upgrade.brute.space}\n// Bottleneck: ${upgrade.brute.bottleneckOrWin}`,
          python: `# Brute-force baseline for ${algo.name}\n# ${upgrade.brute.approach}\n# Time: ${upgrade.brute.time} | Space: ${upgrade.brute.space}\n# Bottleneck: ${upgrade.brute.bottleneckOrWin}`,
          java: `// Brute-force baseline for ${algo.name}\n// ${upgrade.brute.approach}\n// Time: ${upgrade.brute.time} | Space: ${upgrade.brute.space}\n// Bottleneck: ${upgrade.brute.bottleneckOrWin}`,
        },
      },
      {
        tier: 'Better',
        title: upgrade.better.label,
        timeComplexity: upgrade.better.time,
        spaceComplexity: upgrade.better.space,
        keyInsight: `${upgrade.better.approach} Trade-off: ${upgrade.better.bottleneckOrWin}`,
        code: {
          typescript: `// Intermediate refinement for ${algo.name}\n// ${upgrade.better.approach}\n// Time: ${upgrade.better.time} | Space: ${upgrade.better.space}\n${algo.templates.js}`,
          python: `# Intermediate refinement for ${algo.name}\n# ${upgrade.better.approach}\n# Time: ${upgrade.better.time} | Space: ${upgrade.better.space}\n${algo.templates.python}`,
          java: `// Intermediate refinement for ${algo.name}\n// ${upgrade.better.approach}\n// Time: ${upgrade.better.time} | Space: ${upgrade.better.space}\n${algo.templates.java}`,
        },
      },
      {
        tier: 'Optimal',
        title: `${algo.name} (${upgrade.optimal.label})`,
        timeComplexity: algo.timeComplexity,
        spaceComplexity: algo.spaceComplexity,
        keyInsight: `${guide?.simpleAnalogy ?? algo.coreIdea} Invariant: ${algo.loopInvariant}`,
        code: {
          typescript: algo.templates.js,
          python: algo.templates.python,
          java: algo.templates.java,
        },
      },
    ],
  };
}

function joinCodeLines(lines: AnnotatedCodeLine[]): string {
  return lines.map((l) => l.code).join('\n');
}

function buildTopicStrategySignature(topic: CurriculumTopic): StrategySignature {
  const clues = topic.patternClues.map((c) => `${c.signal}: ${c.whyItMatches}`);
  const keywords = Array.from(
    new Set([
      topic.title.toLowerCase(),
      topic.shortTitle.toLowerCase(),
      topic.category.toLowerCase(),
      ...topic.keywords.map((k) => k.toLowerCase()),
      ...extractKeywords(`${topic.tagline} ${topic.mentalModelSteps.join(' ')}`),
    ])
  ).slice(0, 18);

  const brute = topic.solutions.brute;
  const better = topic.solutions.better;
  const optimal = topic.solutions.optimal;

  return {
    id: `topic-${topic.id}`,
    name: `${topic.title} (Curriculum Track)`,
    category:
      topic.tier === 'Foundations'
        ? 'Foundations'
        : topic.category.toLowerCase().includes('string') || topic.category.toLowerCase().includes('fuzzy')
          ? 'String & Fuzzy Search'
          : topic.category.toLowerCase().includes('graph') || topic.category.toLowerCase().includes('tree')
            ? 'Hierarchical & Graph'
            : 'Algorithmic Paradigms',
    difficulty: topic.tier,
    domains:
      topic.tier === 'Applied System Algorithms'
        ? ['SYSTEM_STATE_LOGIC', 'DSA_ALGORITHMIC']
        : ['DSA_ALGORITHMIC'],
    workspaceKind: topic.tier === 'Foundations' ? 'array-pointer' : 'logic-builder',
    curriculumTopicId: topic.id,
    mentalModel: `${topic.tagline} — ${topic.mentalModelSteps[0] ?? optimal.intuition}`,
    structuralClues: clues.slice(0, 4),
    triggerKeywords: keywords,
    antiPatterns: optimal.edgeCases.slice(0, 2),
    optimalTime: optimal.timeComplexity,
    optimalSpace: optimal.spaceComplexity,
    complexityRank: parseComplexityRank(optimal.timeComplexity),
    pitfalls: optimal.edgeCases,
    socraticPrompts: {
      DECONSTRUCT: `Check if the problem exhibits ${topic.title} signals: ${clues[0] ?? topic.tagline}`,
      HYPOTHESIZE: `State the foundational mental model: ${topic.mentalModelSteps[0] ?? optimal.intuition}`,
      ELIMINATE_OR_BUILD: `Apply the optimal upgrade: ${optimal.bottleneckOrUpgrade}`,
      VERIFY_EDGE_CASES: `Watch out for: ${optimal.edgeCases[0] ?? 'boundary conditions and empty inputs.'}`,
    },
    approaches: [
      {
        tier: 'Brute Force',
        title: brute.title,
        timeComplexity: brute.timeComplexity,
        spaceComplexity: brute.spaceComplexity,
        keyInsight: `${brute.intuition} (${brute.bottleneckOrUpgrade})`,
        code: {
          typescript: joinCodeLines(brute.code.javascript),
          python: joinCodeLines(brute.code.python),
          java: joinCodeLines(brute.code.java),
        },
      },
      {
        tier: 'Better',
        title: better.title,
        timeComplexity: better.timeComplexity,
        spaceComplexity: better.spaceComplexity,
        keyInsight: `${better.intuition} (${better.bottleneckOrUpgrade})`,
        code: {
          typescript: joinCodeLines(better.code.javascript),
          python: joinCodeLines(better.code.python),
          java: joinCodeLines(better.code.java),
        },
      },
      {
        tier: 'Optimal',
        title: optimal.title,
        timeComplexity: optimal.timeComplexity,
        spaceComplexity: optimal.spaceComplexity,
        keyInsight: `${optimal.intuition} (${optimal.bottleneckOrUpgrade})`,
        code: {
          typescript: joinCodeLines(optimal.code.javascript),
          python: joinCodeLines(optimal.code.python),
          java: joinCodeLines(optimal.code.java),
        },
      },
    ],
  };
}

export const ALGORITHM_STRATEGIES: StrategySignature[] = ALGORITHMS_CATALOG.map(
  buildAlgorithmStrategySignature
);

export const CURRICULUM_TOPIC_STRATEGIES: StrategySignature[] = CURRICULUM_TOPICS.map(
  buildTopicStrategySignature
);

/**
 * Full unified strategy index combining:
 * - Core Cognitive & Pure Logic Strategies (STRATEGIES_CATALOG)
 * - All 94 Algorithm Studio implementations (ALGORITHM_STRATEGIES)
 * - All 22 Curriculum Topics (CURRICULUM_TOPIC_STRATEGIES)
 */
export const ALL_UNIVERSAL_STRATEGIES: StrategySignature[] = [
  ...STRATEGIES_CATALOG,
  ...ALGORITHM_STRATEGIES,
  ...CURRICULUM_TOPIC_STRATEGIES,
];

export const STRATEGY_META_MAP: Record<string, IndexedStrategyMeta> = (() => {
  const map: Record<string, IndexedStrategyMeta> = {};
  const masterNumByAlgoId = new Map(MASTER_73_ROADMAP.map((m) => [m.algorithmId, m.number]));

  for (const s of STRATEGIES_CATALOG) {
    map[s.id] = { strategyId: s.id, curriculumTopicId: s.curriculumTopicId };
  }
  for (const algo of ALGORITHMS_CATALOG) {
    map[`algo-${algo.id}`] = {
      strategyId: `algo-${algo.id}`,
      algorithmId: algo.id,
      curriculumTopicId: inferCurriculumTopicId(algo),
      masterNumber: masterNumByAlgoId.get(algo.id),
    };
  }
  for (const topic of CURRICULUM_TOPICS) {
    map[`topic-${topic.id}`] = {
      strategyId: `topic-${topic.id}`,
      curriculumTopicId: topic.id,
    };
  }
  return map;
})();

export interface MatchedAlgorithmResult {
  algorithm: AlgorithmDefinition;
  score: number;
  matchedTerms: string[];
  masterNumber?: number;
  plainAnalogy: string;
  loopInvariant: string;
}

export interface MatchedTopicResult {
  topic: CurriculumTopic;
  score: number;
  matchedTerms: string[];
}

export interface UniversalCatalogMatchBundle {
  matchedAlgorithms: MatchedAlgorithmResult[];
  matchedTopics: MatchedTopicResult[];
  matchedCombos: AlgorithmPowerCombo[];
}

/**
 * Scores a raw problem statement against ALL 94 Algorithms, ALL 22 Curriculum Topics,
 * and ALL 16 Algorithm Power Combinations to surface actionable study & optimization paths.
 */
export function matchAlgorithmsAndTopics(
  problemText: string,
  extraTopics: string[] = []
): UniversalCatalogMatchBundle {
  const normalized = `${problemText} ${extraTopics.join(' ')}`.toLowerCase();
  const masterNumByAlgoId = new Map(MASTER_73_ROADMAP.map((m) => [m.algorithmId, m.number]));

  const algoScores: MatchedAlgorithmResult[] = ALGORITHMS_CATALOG.map((algo) => {
    let score = 0;
    const matchedTerms: string[] = [];

    const nameLower = algo.name.toLowerCase();
    const shortLower = algo.shortName.toLowerCase();
    const distinctiveNameTokens = extractKeywords(`${algo.name} ${algo.shortName}`).filter(
      (t) =>
        t.length >= 4 &&
        !['sort', 'tree', 'graph', 'search', 'path', 'shortest', 'array', 'string', 'dynamic', 'algorithm', 'table'].includes(t)
    );

    if (normalized.includes(nameLower)) {
      score += 55;
      matchedTerms.push(algo.name);
    } else if (shortLower.length >= 3 && normalized.includes(shortLower)) {
      score += 42;
      matchedTerms.push(algo.shortName);
    } else {
      for (const tok of distinctiveNameTokens) {
        const stem = tok.replace(/'s$/i, '');
        if (stem.length >= 3 && normalized.includes(stem)) {
          score += 24;
          matchedTerms.push(stem);
        }
      }
    }

    for (const linked of algo.linkedTopics) {
      const l = linked.toLowerCase();
      if (normalized.includes(l)) {
        score += 14;
        matchedTerms.push(linked);
      }
    }

    const clueTokens = extractKeywords(
      `${algo.name} ${algo.category} ${algo.tagline} ${algo.whenToUse.join(' ')}`
    );
    for (const tok of clueTokens) {
      if (tok.length >= 4 && normalized.includes(tok)) {
        score += 5;
        if (matchedTerms.length < 5 && !matchedTerms.includes(tok)) {
          matchedTerms.push(tok);
        }
      }
    }

    // Check explicit problem slug hints in URL or title
    for (const slug of algo.linkedProblemSlugs) {
      const slugWords = slug.replace(/-/g, ' ');
      if (slugWords.length >= 6 && normalized.includes(slugWords)) {
        score += 32;
        matchedTerms.push(slug);
      }
    }

    const guide = getAlgorithmTutorGuide(algo.id);
    return {
      algorithm: algo,
      score,
      matchedTerms: Array.from(new Set(matchedTerms)).slice(0, 4),
      masterNumber: masterNumByAlgoId.get(algo.id),
      plainAnalogy: guide?.simpleAnalogy ?? algo.coreIdea,
      loopInvariant: algo.loopInvariant,
    };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const topicScores: MatchedTopicResult[] = CURRICULUM_TOPICS.map((topic) => {
    let score = 0;
    const matchedTerms: string[] = [];

    if (normalized.includes(topic.title.toLowerCase())) {
      score += 36;
      matchedTerms.push(topic.title);
    } else if (normalized.includes(topic.shortTitle.toLowerCase())) {
      score += 24;
      matchedTerms.push(topic.shortTitle);
    }

    const tokens = extractKeywords(
      `${topic.title} ${topic.tagline} ${topic.keywords.join(' ')} ${topic.patternClues.map((c) => c.signal).join(' ')}`
    );
    for (const tok of tokens) {
      if (tok.length >= 4 && normalized.includes(tok)) {
        score += 5;
        if (matchedTerms.length < 4 && !matchedTerms.includes(tok)) {
          matchedTerms.push(tok);
        }
      }
    }

    return {
      topic,
      score,
      matchedTerms: Array.from(new Set(matchedTerms)).slice(0, 4),
    };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const topAlgoIds = new Set(algoScores.slice(0, 5).map((m) => m.algorithm.id));
  const matchedCombos = ALGORITHM_POWER_COMBOS.filter((combo) => {
    const idOverlap = combo.partnerIds.some((id) => topAlgoIds.has(id));
    if (idOverlap) return true;
    const comboTokens = extractKeywords(`${combo.title} ${combo.synergyOutput} ${combo.interviewUseCase}`);
    const hits = comboTokens.filter((t) => t.length >= 5 && normalized.includes(t)).length;
    return hits >= 2;
  }).slice(0, 3);

  return {
    matchedAlgorithms: algoScores,
    matchedTopics: topicScores,
    matchedCombos,
  };
}
