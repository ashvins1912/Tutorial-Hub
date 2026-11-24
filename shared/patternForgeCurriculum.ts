import { DSA28_PATTERNS, DSA28_TOPIC_GROUPS } from '../src/data/dsa28Patterns';
import type {
  CanonicalProblem,
  ContentVersion,
  Curriculum,
  DifficultyLevel,
  LearningObjective,
  LearningTopic,
  Lesson,
  LessonStage,
  TopicPrerequisite,
} from './learningContract';
import { SPACED_REVISION_INTERVALS } from './masteryEngine';
import { PILOT_TOPIC_OVERRIDES, STANDARD_MASTERY_REQUIREMENTS } from './pilotPatternsData';

/**
 * Shared Five-Stage Learning Lifecycle (Layer 1)
 * Identical contract across Pattern Forge and every migrated Tutorial Hub academy.
 */
export const FIVE_STAGE_LIFECYCLE: LessonStage[] = [
  {
    id: 'understand',
    order: 1,
    title: 'Understand',
    subtitle: 'Concept, analogy, invariants & misconceptions',
    requiredEvidenceLabel: 'Complete reading & pass conceptual check',
  },
  {
    id: 'visualize',
    order: 2,
    title: 'Visualize',
    subtitle: 'Interactive deterministic trace & prediction checkpoints',
    requiredEvidenceLabel: 'Run traces & pass prediction checkpoints',
  },
  {
    id: 'implement',
    order: 3,
    title: 'Implement',
    subtitle: 'Brute → Optimal in Java 21, JS & Python 3.12',
    requiredEvidenceLabel: 'Verify solution against test suite & edge cases',
  },
  {
    id: 'practice',
    order: 4,
    title: 'Practice',
    subtitle: 'Progressive levels, blind pattern ID & debugging',
    requiredEvidenceLabel: 'Score on Pattern Recognition & fix debugging challenge',
  },
  {
    id: 'master',
    order: 5,
    title: 'Master',
    subtitle: '8-dimension evidence, unseen transfer & spaced revision',
    requiredEvidenceLabel: 'Meet all 8 mastery thresholds & transfer exam',
  },
];

// Canonical prerequisite DAG over preserved DSA28_PATTERNS IDs
const PREREQUISITE_MAP: Record<string, Array<{ id: string; reason: string; required: boolean }>> = {
  'prefix-sum-difference-array': [
    { id: 'hashmap-hashset-lookup', reason: 'Prefix sums pair with HashMaps to count subarrays matching target sums.', required: false },
  ],
  'two-pointers-same-direction': [
    { id: 'two-pointers-opposite-ends', reason: 'Builds on pointer-boundary invariant reasoning.', required: false },
  ],
  'fixed-sliding-window': [
    { id: 'prefix-sum-difference-array', reason: 'Fixed windows optimize contiguous range sums in O(1) extra space.', required: false },
  ],
  'dynamic-sliding-window': [
    { id: 'hashmap-hashset-lookup', reason: 'Tracks active window character frequencies and last-seen indices in O(1).', required: true },
  ],
  'monotonic-deque': [
    { id: 'monotonic-stack', reason: 'Extends monotonic invariant maintenance to double-ended sliding ranges.', required: true },
    { id: 'fixed-sliding-window', reason: 'Applies monotonic pruning across fixed-width sliding windows.', required: true },
  ],
  'binary-search-on-answer': [
    { id: 'modified-binary-search', reason: 'Generalizes monotonic index elimination to monotonic feasibility predicates.', required: true },
  ],
  'two-heaps': [
    { id: 'top-k-elements-heap', reason: 'Uses paired max-heap and min-heap invariants to balance streaming medians.', required: true },
  ],
  'k-way-merge': [
    { id: 'top-k-elements-heap', reason: 'Uses a size-K min-heap to select the global minimum frontier across K sorted lists.', required: true },
  ],
  'topological-sort': [
    { id: 'graph-bfs-multi-source', reason: 'Kahn’s algorithm extends BFS queue expansion with in-degree tracking.', required: true },
  ],
  'shortest-path-weighted': [
    { id: 'top-k-elements-heap', reason: 'Dijkstra uses a min-heap priority queue to settle minimum-distance nodes greedily.', required: true },
    { id: 'graph-bfs-multi-source', reason: 'Generalizes unweighted BFS shortest path to non-negative edge weights.', required: true },
  ],
  'dynamic-programming': [
    { id: 'hashmap-hashset-lookup', reason: 'Top-down memoization caches subproblem states in O(1) maps/arrays.', required: true },
    { id: 'backtracking', reason: 'Recursive decision trees reveal the overlapping subproblems that DP caches.', required: false },
  ],
};

function inferDifficulty(patternNumber: number): DifficultyLevel {
  if (patternNumber <= 5 || patternNumber === 7 || patternNumber === 11) return 'Easy';
  if (patternNumber >= 24 || patternNumber === 18 || patternNumber === 19 || patternNumber === 14) return 'Hard';
  return 'Medium';
}

const groupTitleById = new Map(DSA28_TOPIC_GROUPS.map((g) => [g.id, g.title]));
const patternTitleById = new Map(DSA28_PATTERNS.map((p) => [p.id, p.title]));

function buildInventoryVersion(id: string): ContentVersion {
  return {
    contentId: id,
    version: '0.1.0-inventory',
    publicationStatus: 'unpublished',
    verificationStatus: 'Structurally Valid',
    createdAt: '2026-11-24T00:00:00.000Z',
    updatedAt: '2026-11-24T00:00:00.000Z',
    author: 'Pattern Forge Inventory Migration',
    technicalReviewer: null,
    learningReviewer: null,
    reviewHistory: [
      {
        id: `${id}-inv-1`,
        version: '0.1.0-inventory',
        role: 'author',
        reviewer: 'Pattern Forge Inventory Migration',
        statusGranted: 'Structurally Valid',
        reviewedAt: '2026-11-24T00:00:00.000Z',
        notes: 'Registered canonical ID, prerequisites, objectives, and signals. Awaiting Wave 1 full 5-stage authoring, verified test suites, and technical review.',
      },
    ],
  };
}

function buildDefaultObjectives(patternId: string, title: string): LearningObjective[] {
  return [
    {
      id: `obj-${patternId}-understand`,
      statement: `Explain the core invariant and when to choose ${title} over brute-force alternatives.`,
      stage: 'understand',
      dimension: 'understanding',
    },
    {
      id: `obj-${patternId}-implement`,
      statement: `Implement ${title} cleanly with verified boundary handling and accurate complexity bounds.`,
      stage: 'implement',
      dimension: 'implementation',
    },
    {
      id: `obj-${patternId}-transfer`,
      statement: `Recognize ${title} recognition signals independently on unseen interview problems.`,
      stage: 'master',
      dimension: 'transferAbility',
    },
  ];
}

export const PATTERN_FORGE_TOPICS: LearningTopic[] = DSA28_PATTERNS.map((raw) => {
  const pilot = PILOT_TOPIC_OVERRIDES[raw.id];
  const prerequisites: TopicPrerequisite[] = (PREREQUISITE_MAP[raw.id] ?? []).map((pr) => ({
    topicId: pr.id,
    title: patternTitleById.get(pr.id) ?? pr.id,
    reason: pr.reason,
    required: pr.required,
  }));

  if (pilot) {
    return {
      id: raw.id,
      academyId: 'pattern-forge',
      number: raw.number,
      groupId: raw.groupId,
      groupTitle: groupTitleById.get(raw.groupId) ?? raw.groupId,
      title: raw.title,
      shortTitle: raw.shortTitle,
      description: raw.summary,
      difficulty: inferDifficulty(raw.number),
      revisionIntervalsDays: SPACED_REVISION_INTERVALS,
      ...pilot,
    };
  }

  return {
    id: raw.id,
    academyId: 'pattern-forge',
    number: raw.number,
    groupId: raw.groupId,
    groupTitle: groupTitleById.get(raw.groupId) ?? raw.groupId,
    title: raw.title,
    shortTitle: raw.shortTitle,
    description: raw.summary,
    difficulty: inferDifficulty(raw.number),
    prerequisites,
    learningObjectives: buildDefaultObjectives(raw.id, raw.shortTitle),
    concepts: [raw.mentalModel, `Time: ${raw.timeComplexity}`, `Space: ${raw.spaceComplexity}`],
    recognitionSignals: raw.triggerSignals,
    antiPatterns: [
      `Applying ${raw.shortTitle} without verifying its structural precondition or complexity budget.`,
    ],
    isPilotReference: false,
    traceIds: [],
    problems: [],
    assessments: [],
    masteryRequirements: STANDARD_MASTERY_REQUIREMENTS,
    revisionIntervalsDays: SPACED_REVISION_INTERVALS,
    references: [{ title: `Canonical Pattern #${raw.number}: ${raw.canonicalSlug}`, source: 'DSA28 Inventory' }],
    version: buildInventoryVersion(raw.id),
    verificationStatus: 'Structurally Valid',
    activityCounts: {
      conceptualExamples: 0,
      interactiveTraces: 0,
      bruteForceComparisons: 0,
      codingProblems: 0,
      edgeCaseChallenges: 0,
      debuggingExercises: 0,
      mixedPatternProblems: 0,
      unseenTransferExercises: 0,
    },
  };
});

export const PATTERN_FORGE_CURRICULUM: Curriculum = {
  id: 'curriculum-pattern-forge',
  academyId: 'pattern-forge',
  title: 'Pattern Forge — 28-Pattern Reference Curriculum',
  description:
    'Evidence-based algorithmic mastery built on the canonical five-stage learning lifecycle (Understand, Visualize, Implement, Practice, Master).',
  version: '1.0.0',
  topicIds: PATTERN_FORGE_TOPICS.map((t) => t.id),
  pilotTopicIds: PATTERN_FORGE_TOPICS.filter((t) => t.isPilotReference).map((t) => t.id),
  targetActivitiesPerTopic: 15, // 2 examples + 3 traces + 2 brute comparisons + 3 coding + 2 edge + 1 debug + 1 mixed + 1 unseen = 15 (420 across 28)
};

export const UNIFIED_CURRICULA: Curriculum[] = [PATTERN_FORGE_CURRICULUM];

// ============================================================================
// Canonical Query Helpers (shared by API routes & client)
// ============================================================================

export function getAllCurricula(): Curriculum[] {
  return UNIFIED_CURRICULA;
}

export function getAllLearningTopics(filter?: {
  academyId?: string;
  verificationStatus?: string;
  pilotOnly?: boolean;
}): LearningTopic[] {
  return PATTERN_FORGE_TOPICS.filter((topic) => {
    if (filter?.academyId && topic.academyId !== filter.academyId) return false;
    if (filter?.verificationStatus && topic.verificationStatus !== filter.verificationStatus) return false;
    if (filter?.pilotOnly && !topic.isPilotReference) return false;
    return true;
  });
}

export function getLearningTopicById(topicId: string): LearningTopic | null {
  return PATTERN_FORGE_TOPICS.find((t) => t.id === topicId) ?? null;
}

export function buildLessonForTopic(topic: LearningTopic): Lesson {
  return {
    id: `lesson-${topic.id}`,
    topicId: topic.id,
    title: `${topic.number}. ${topic.title}`,
    stages: FIVE_STAGE_LIFECYCLE,
    assets: [
      ...topic.traceIds.map((traceId) => ({
        id: traceId,
        kind: 'trace' as const,
        title: traceId,
        verified: topic.verificationStatus === 'Published',
      })),
      ...topic.problems.map((prob) => ({
        id: prob.id,
        kind: 'solution' as const,
        title: prob.title,
        verified: prob.verificationStatus === 'Published',
      })),
    ],
    contentVersion: topic.version.version,
  };
}

export function getLessonsByTopicId(topicId: string): Lesson[] {
  const topic = getLearningTopicById(topicId);
  if (!topic) return [];
  return [buildLessonForTopic(topic)];
}

export function getLessonById(lessonId: string): Lesson | null {
  for (const topic of PATTERN_FORGE_TOPICS) {
    const lesson = buildLessonForTopic(topic);
    if (lesson.id === lessonId) return lesson;
  }
  return null;
}

export function getAllCanonicalProblems(topicId?: string): CanonicalProblem[] {
  const topics = topicId
    ? PATTERN_FORGE_TOPICS.filter((t) => t.id === topicId)
    : PATTERN_FORGE_TOPICS;
  return topics.flatMap((t) => t.problems);
}

export function getCanonicalProblemById(problemId: string): CanonicalProblem | null {
  for (const topic of PATTERN_FORGE_TOPICS) {
    const found = topic.problems.find((p) => p.id === problemId || p.slug === problemId);
    if (found) return found;
  }
  return null;
}

export function getAssessmentById(assessmentId: string) {
  for (const topic of PATTERN_FORGE_TOPICS) {
    const found = topic.assessments.find((a) => a.id === assessmentId);
    if (found) return { topic, assessment: found };
  }
  return null;
}
