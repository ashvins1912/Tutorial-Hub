import type {
  DeepDifficultyLevel,
  DeepTopicCategory,
  DeepTopicContent,
  LinkedCodingProblem,
  TopicGraphLinkage,
} from '../schema/deepTopic.types';
import { CURRICULUM_TOPICS, getTopicById } from '../../features/topics/data/curriculumIndex';
import { getDeepTopicBlueprint } from '../../features/topics/data/deepTopicBlueprints';
import type { CurriculumTopic } from '../../features/topics/types';

interface RawGraphEdges {
  prerequisites: { id: string; reason: string }[];
  siblings: { id: string; sharedInvariant: string }[];
  nextLevel: { id: string; progressionTwist: string }[];
}

/**
 * Bidirectional Algorithm Knowledge Graph covering all 22 curriculum modules.
 * Maps Prerequisites -> Sibling Invariants -> Next-Level Mutations.
 */
const TOPIC_GRAPH_EDGES: Record<string, RawGraphEdges> = {
  'arrays-hashing': {
    prerequisites: [],
    siblings: [
      { id: 'prefix-sum-diff-array', sharedInvariant: 'O(1) hash lookup of prior computed values' },
      { id: 'two-pointers', sharedInvariant: 'Eliminates nested O(N^2) pair loops' },
    ],
    nextLevel: [
      { id: 'sliding-window', progressionTwist: 'Track dynamic frequency map inside a contiguous moving range' },
      { id: 'prefix-sum-diff-array', progressionTwist: 'Index cumulative prefix sums to handle negative numbers' },
      { id: 'ngram-fuzzy-candidate-retrieval', progressionTwist: 'Scale HashMaps into inverted trigram posting lists' },
    ],
  },
  'two-pointers': {
    prerequisites: [{ id: 'arrays-hashing', reason: 'Index manipulation and pair-search baseline' }],
    siblings: [{ id: 'sliding-window', sharedInvariant: 'Monotonic pointer advancement without backtracking' }],
    nextLevel: [
      { id: 'sliding-window', progressionTwist: 'Same-direction variable window maintaining frequency invariants' },
      { id: 'binary-search', progressionTwist: 'Jump pointer by half the interval instead of 1 step' },
      { id: 'sorting-algorithms', progressionTwist: 'Use two-pointer linear merge & Lomuto/Hoare partition' },
    ],
  },
  'sliding-window': {
    prerequisites: [
      { id: 'arrays-hashing', reason: 'Frequency map & scalar counter maintenance' },
      { id: 'two-pointers', reason: 'Monotonic non-backtracking pointer discipline' },
    ],
    siblings: [{ id: 'prefix-sum-diff-array', sharedInvariant: 'Contiguous subarray optimization in O(N)' }],
    nextLevel: [
      { id: 'queues-monotonic-deque', progressionTwist: 'Upgrade to Monotonic Deque for Sliding Window Maximum' },
      { id: 'prefix-sum-diff-array', progressionTwist: 'Handle negative values where window monotonicity breaks' },
    ],
  },
  'prefix-sum-diff-array': {
    prerequisites: [{ id: 'arrays-hashing', reason: 'HashMap frequency seeding {0: 1}' }],
    siblings: [{ id: 'sliding-window', sharedInvariant: 'O(N) contiguous subarray queries' }],
    nextLevel: [
      { id: 'segment-fenwick-trees', progressionTwist: 'Support O(log N) dynamic point/range updates alongside range sums' },
      { id: 'dynamic-programming', progressionTwist: 'Prefix-optimized DP state transitions' },
    ],
  },
  'stacks-monotonic-stack': {
    prerequisites: [{ id: 'arrays-hashing', reason: 'Linear index traversal and output mapping' }],
    siblings: [{ id: 'queues-monotonic-deque', sharedInvariant: 'Amortized O(N) eviction of dominated candidates' }],
    nextLevel: [
      { id: 'queues-monotonic-deque', progressionTwist: 'Add front-expiry eviction for Sliding Window Maximum O(N)' },
      { id: 'dynamic-programming', progressionTwist: 'Stack-assisted Histogram / Maximal Rectangle DP' },
    ],
  },
  'queues-monotonic-deque': {
    prerequisites: [
      { id: 'stacks-monotonic-stack', reason: 'Monotonic candidate dominance eviction' },
      { id: 'sliding-window', reason: 'Fixed & variable window boundary management' },
    ],
    siblings: [{ id: 'heaps-priority-queues', sharedInvariant: 'Tracks window extrema without O(K) rescanning' }],
    nextLevel: [
      { id: 'graphs-traversal-dsu', progressionTwist: 'FIFO Queue powers BFS shortest paths & 0-1 BFS Deque' },
      { id: 'dynamic-programming', progressionTwist: 'Monotonic Deque DP optimization for bounded jump transitions' },
    ],
  },
  'sorting-algorithms': {
    prerequisites: [{ id: 'two-pointers', reason: 'Linear merge & in-place swap partitioning' }],
    siblings: [{ id: 'recursion-divide-conquer', sharedInvariant: 'Split-in-half O(N log N) recurrence T(N)=2T(N/2)+O(N)' }],
    nextLevel: [
      { id: 'binary-search', progressionTwist: 'Unlock O(log N) lookups once order is established' },
      { id: 'heaps-priority-queues', progressionTwist: 'Upgrade full sort to O(N log K) Top-K selection' },
      { id: 'greedy-algorithms', progressionTwist: 'Interval sorting enables O(N log N) greedy sweeps' },
    ],
  },
  'linked-lists': {
    prerequisites: [{ id: 'two-pointers', reason: 'Fast/slow pointer cycle detection & midpoint split' }],
    siblings: [{ id: 'arrays-hashing', sharedInvariant: 'Pairs with HashMap for O(1) LRU/LFU caches' }],
    nextLevel: [
      { id: 'trees-bst-nary', progressionTwist: 'Generalize single next pointer to left/right recursive branches' },
      { id: 'heaps-priority-queues', progressionTwist: 'Merge K Sorted Linked Lists using a Min-Heap' },
    ],
  },
  'binary-search': {
    prerequisites: [{ id: 'sorting-algorithms', reason: 'Requires monotonic ordering or predicate' }],
    siblings: [{ id: 'two-pointers', sharedInvariant: 'Shrinks valid search interval [lo..hi] monotonically' }],
    nextLevel: [
      { id: 'trees-bst-nary', progressionTwist: 'Dynamic O(log N) search under frequent insertions/deletions' },
      { id: 'dynamic-programming', progressionTwist: 'Accelerate LIS from O(N^2) to O(N log N) via patience tails' },
    ],
  },
  'trees-bst-nary': {
    prerequisites: [
      { id: 'recursion-divide-conquer', reason: 'Subtree post-order / pre-order return contracts' },
      { id: 'linked-lists', reason: 'Pointer-based node traversal' },
    ],
    siblings: [{ id: 'graphs-traversal-dsu', sharedInvariant: 'DFS call stack & BFS level-order queue' }],
    nextLevel: [
      { id: 'tries-radix', progressionTwist: 'Generalize binary branches to 26-way character edges' },
      { id: 'segment-fenwick-trees', progressionTwist: 'Store interval aggregates inside balanced binary tree nodes' },
      { id: 'graphs-traversal-dsu', progressionTwist: 'Add visited set to handle arbitrary cycles & components' },
    ],
  },
  'tries-radix': {
    prerequisites: [{ id: 'trees-bst-nary', reason: 'Hierarchical node traversal' }],
    siblings: [{ id: 'exact-string-matching', sharedInvariant: 'Prefix-driven O(L) string lookup' }],
    nextLevel: [
      { id: 'backtracking', progressionTwist: 'Combine Trie with 2D Grid DFS for Word Search II' },
      { id: 'ngram-fuzzy-candidate-retrieval', progressionTwist: 'Handle fuzzy typos where exact prefix edges miss' },
    ],
  },
  'heaps-priority-queues': {
    prerequisites: [{ id: 'sorting-algorithms', reason: 'Partial order maintenance beats full re-sorting' }],
    siblings: [{ id: 'trees-bst-nary', sharedInvariant: 'O(log N) ordered extraction via complete binary tree' }],
    nextLevel: [
      { id: 'graphs-traversal-dsu', progressionTwist: 'Drive Dijkstra shortest-path relaxation via Min-Heap' },
      { id: 'ngram-fuzzy-candidate-retrieval', progressionTwist: 'Maintain bounded Top-K candidates in O(N log K)' },
    ],
  },
  'recursion-divide-conquer': {
    prerequisites: [{ id: 'arrays-hashing', reason: 'Subarray indexing & base-case boundaries' }],
    siblings: [{ id: 'sorting-algorithms', sharedInvariant: 'Divide -> Conquer -> Combine recurrence' }],
    nextLevel: [
      { id: 'backtracking', progressionTwist: 'Add mutable state Choose -> Recurse -> Undo & pruning' },
      { id: 'dynamic-programming', progressionTwist: 'Memoize overlapping recursive subproblems' },
    ],
  },
  backtracking: {
    prerequisites: [{ id: 'recursion-divide-conquer', reason: 'Call stack depth & base-case termination' }],
    siblings: [{ id: 'graphs-traversal-dsu', sharedInvariant: 'Depth-first exploration with visited marking' }],
    nextLevel: [
      { id: 'dynamic-programming', progressionTwist: 'Collapse repeated decision states via memoization' },
      { id: 'bit-manipulation', progressionTwist: 'Encode N-Queens / visited sets into O(1) bitmasks' },
    ],
  },
  'greedy-algorithms': {
    prerequisites: [{ id: 'sorting-algorithms', reason: 'Sort by deadline / end-time before sweeping' }],
    siblings: [{ id: 'heaps-priority-queues', sharedInvariant: 'Provable local-to-global exchange optimality' }],
    nextLevel: [
      { id: 'dynamic-programming', progressionTwist: 'Pivot to DP whenever a greedy counterexample exists' },
    ],
  },
  'graphs-traversal-dsu': {
    prerequisites: [
      { id: 'trees-bst-nary', reason: 'Recursive DFS and Queue BFS traversal' },
      { id: 'queues-monotonic-deque', reason: 'FIFO queue for level-by-level shortest paths' },
    ],
    siblings: [{ id: 'backtracking', sharedInvariant: 'State-space traversal with visited tracking' }],
    nextLevel: [
      { id: 'heaps-priority-queues', progressionTwist: 'Upgrade unweighted BFS to weighted Dijkstra Min-Heap' },
      { id: 'dynamic-programming', progressionTwist: 'DAG DP & Bellman-Ford over shortest-path graphs' },
    ],
  },
  'dynamic-programming': {
    prerequisites: [
      { id: 'recursion-divide-conquer', reason: 'Recursive subproblem decomposition' },
      { id: 'backtracking', reason: 'Decision-tree state transitions' },
    ],
    siblings: [{ id: 'prefix-sum-diff-array', sharedInvariant: 'Bottom-up tabulation reusing prior computed states' }],
    nextLevel: [
      { id: 'bit-manipulation', progressionTwist: 'Bitmask DP for subset states (N <= 20)' },
      { id: 'confident-fuzzy-reranking', progressionTwist: '2D DP powers Damerau-Levenshtein fuzzy edit distance' },
    ],
  },
  'segment-fenwick-trees': {
    prerequisites: [
      { id: 'prefix-sum-diff-array', reason: 'Static range queries baseline' },
      { id: 'trees-bst-nary', reason: 'Binary divide-and-conquer tree indexing' },
    ],
    siblings: [{ id: 'binary-search', sharedInvariant: 'O(log N) interval halving' }],
    nextLevel: [{ id: 'dynamic-programming', progressionTwist: 'O(log N) range-max DP transition acceleration' }],
  },
  'bit-manipulation': {
    prerequisites: [{ id: 'arrays-hashing', reason: 'O(1) space state compression' }],
    siblings: [{ id: 'backtracking', sharedInvariant: 'Bitmask visited sets replace HashSets in O(1)' }],
    nextLevel: [{ id: 'dynamic-programming', progressionTwist: 'Traveling Salesperson & subset Bitmask DP' }],
  },
  'exact-string-matching': {
    prerequisites: [{ id: 'prefix-sum-diff-array', reason: 'Rolling hash & prefix boundary reuse' }],
    siblings: [{ id: 'tries-radix', sharedInvariant: 'Linear-time character automaton matching' }],
    nextLevel: [
      { id: 'ngram-fuzzy-candidate-retrieval', progressionTwist: 'Relax exact matching to typo-tolerant fuzzy retrieval' },
    ],
  },
  'ngram-fuzzy-candidate-retrieval': {
    prerequisites: [
      { id: 'arrays-hashing', reason: 'Inverted posting list HashMaps' },
      { id: 'exact-string-matching', reason: 'Substring slicing & normalization' },
    ],
    siblings: [{ id: 'tries-radix', sharedInvariant: 'Fast query-time text indexing with lower-bound pruning' }],
    nextLevel: [
      { id: 'confident-fuzzy-reranking', progressionTwist: 'Score Top-K candidates with Damerau-Levenshtein DP' },
    ],
  },
  'confident-fuzzy-reranking': {
    prerequisites: [
      { id: 'ngram-fuzzy-candidate-retrieval', reason: 'High-recall Stage-1 candidate shortlist' },
      { id: 'dynamic-programming', reason: 'Damerau-Levenshtein O(L*M) edit distance' },
    ],
    siblings: [{ id: 'heaps-priority-queues', sharedInvariant: 'Hybrid lexical + edit-distance Top-K confidence scoring' }],
    nextLevel: [],
  },
};

function mapCategory(topic: CurriculumTopic): DeepTopicCategory {
  if (topic.tier === 'Applied System Algorithms' || topic.id === 'exact-string-matching') {
    return 'Advanced Strings & Fuzzy Search';
  }
  if (
    ['trees-bst-nary', 'tries-radix', 'graphs-traversal-dsu', 'segment-fenwick-trees'].includes(
      topic.id,
    )
  ) {
    return 'Trees & Graphs';
  }
  if (['bit-manipulation', 'prefix-sum-diff-array'].includes(topic.id)) {
    return 'Math & Logic';
  }
  if (['recursion-divide-conquer', 'backtracking', 'greedy-algorithms', 'dynamic-programming'].includes(topic.id)) {
    return 'Paradigms';
  }
  return 'Foundations';
}

function mapDifficulty(topic: CurriculumTopic): DeepDifficultyLevel {
  switch (topic.tier) {
    case 'Foundations':
      return 'Beginner';
    case 'Intermediate':
      return 'Intermediate';
    case 'Advanced':
      return 'Advanced';
    case 'Applied System Algorithms':
      return 'System Scale';
  }
}

function formatAnnotatedLines(lines: { code: string }[] | undefined): string {
  if (!lines || lines.length === 0) return '';
  return lines.map((line) => line.code).join('\n');
}

function buildDeepTopicContent(topic: CurriculumTopic): DeepTopicContent {
  const bp = getDeepTopicBlueprint(topic);
  const edges = TOPIC_GRAPH_EDGES[topic.id];
  const relatedAlgIds = [
    ...(edges?.prerequisites.map((p) => p.id) ?? []),
    ...(edges?.nextLevel.map((n) => n.id) ?? []),
  ].slice(0, 3);

  const brutePython = formatAnnotatedLines(topic.solutions.brute.code.python);
  const bruteJava = formatAnnotatedLines(topic.solutions.brute.code.java);
  const bruteTs = formatAnnotatedLines(topic.solutions.brute.code.javascript);
  const optimalPython = formatAnnotatedLines(topic.solutions.optimal.code.python);
  const optimalJava = formatAnnotatedLines(topic.solutions.optimal.code.java);
  const optimalTs = formatAnnotatedLines(topic.solutions.optimal.code.javascript);

  const problemMutationLadder: LinkedCodingProblem[] = bp.linkedProblems.map((prob) => {
    const distractors = [
      'return nums.sort((a, b) => a - b)[0] // destroys index invariant',
      'for (let j = 0; j < n; j++) // accidental O(N^2) re-scan',
      'if (left > right) left = 0 // resets monotonic progress',
    ];
    return {
      problemId: prob.problemId,
      title: prob.title,
      difficulty: prob.difficulty,
      companyTags: prob.companyTags,
      mutationFromPrevious: prob.mutationDelta,
      relatedAlgorithms: relatedAlgIds,
      trainerSlug: prob.trainerSlug,
      blankPageSteps: {
        step1_constraintHint: `${bp.constraintGuide.inputBound} → Target ${bp.constraintGuide.expectedComplexity}`,
        step2_manualDryRunPrompt: `${bp.blankPageDrill.tinyInput} — ${bp.blankPageDrill.manualQuestion}`,
        step3_bruteForceBottleneck: bp.blankPageDrill.bruteBottleneck,
        step4_optimalInvariant: bp.coreInvariant,
      },
      activeRecallChallenge: {
        language: prob.fadedCodeChallenge.language,
        prompt: prob.fadedCodeChallenge.prompt,
        codeTemplateWithBlanks: prob.fadedCodeChallenge.skeletonWithBlanks,
        correctMissingLines: prob.fadedCodeChallenge.missingLines.map((m) => m.expected),
        distractorLines: distractors.slice(0, 2),
        acceptedKeywordsPerBlank: prob.fadedCodeChallenge.missingLines.map((m) => m.acceptedKeywords),
        hintsPerBlank: prob.fadedCodeChallenge.missingLines.map((m) => m.hint),
      },
      solutions: {
        bruteForce: {
          complexity: `${topic.solutions.brute.timeComplexity} Time · ${topic.solutions.brute.spaceComplexity} Space`,
          code: {
            python: brutePython,
            java: bruteJava,
            typescript: bruteTs,
          },
        },
        optimal: {
          complexity: `${topic.solutions.optimal.timeComplexity} Time · ${topic.solutions.optimal.spaceComplexity} Space`,
          code: {
            python: optimalPython,
            java: optimalJava,
            typescript: optimalTs,
          },
        },
      },
    };
  });

  return {
    id: topic.id,
    title: topic.title,
    category: mapCategory(topic),
    difficultyLevel: mapDifficulty(topic),
    intuition: {
      realWorldAnalogy: bp.eli5Analogy,
      oneSentenceRule: bp.coreInvariant,
      whenToUse: bp.whenToUse,
      whenNotToUse: bp.whenNotToUse,
    },
    constraintDecoder: {
      inputSizeRange: bp.constraintGuide.inputBound,
      requiredTimeComplexity: bp.constraintGuide.expectedComplexity,
      correctTierId: bp.constraintGuide.correctTierId,
      eliminatedPatterns: bp.constraintGuide.eliminatedApproaches,
      whyThisWorks: bp.constraintGuide.mathProof,
    },
    visualBlueprint: {
      inputs: [`Input (${bp.constraintGuide.inputBound})`, bp.blankPageDrill.tinyInput],
      stateVariables: [bp.blankPageDrill.memoryBridge, `Space: ${topic.solutions.optimal.spaceComplexity}`],
      stepByStepFlow: topic.mentalModelSteps,
      invariantCondition: bp.coreInvariant,
      outputs: [`Verified Optimal Result (${topic.solutions.optimal.timeComplexity})`],
    },
    bugPreventionLab: bp.commonBugsAndTraps.map((b) => ({
      trapTitle: b.bugTitle,
      brokenLogic: b.badSnippet,
      fixedLogic: b.fixedSnippet,
      explanation: b.whyItHappens,
    })),
    problemMutationLadder,
  };
}

export class AlgorithmGraphService {
  private deepTopics = new Map<string, DeepTopicContent>();
  private trigramIndex = new Map<string, Set<string>>();

  constructor() {
    for (const topic of CURRICULUM_TOPICS) {
      const deep = buildDeepTopicContent(topic);
      this.deepTopics.set(topic.id, deep);
      this.indexTopic(topic, deep);
    }
  }

  private indexTopic(topic: CurriculumTopic, deep: DeepTopicContent): void {
    const corpus = [
      topic.id,
      topic.title,
      topic.category,
      topic.tagline,
      deep.intuition.oneSentenceRule,
      ...deep.problemMutationLadder.map((p) => `${p.title} ${p.companyTags.join(' ')}`),
    ]
      .join(' ')
      .toLowerCase();
    const padded = `  ${corpus}  `;
    for (let i = 0; i <= padded.length - 3; i++) {
      const gram = padded.slice(i, i + 3);
      let bucket = this.trigramIndex.get(gram);
      if (!bucket) {
        bucket = new Set<string>();
        this.trigramIndex.set(gram, bucket);
      }
      bucket.add(topic.id);
    }
  }

  public getDeepTopic(topicId: string): DeepTopicContent {
    const resolved = getTopicById(topicId);
    return this.deepTopics.get(resolved.id) ?? buildDeepTopicContent(resolved);
  }

  public getAllDeepTopics(): DeepTopicContent[] {
    return Array.from(this.deepTopics.values());
  }

  public getTopicLinkage(topicId: string): TopicGraphLinkage {
    const resolved = getTopicById(topicId);
    const raw = TOPIC_GRAPH_EDGES[resolved.id] ?? {
      prerequisites: [],
      siblings: [],
      nextLevel: [],
    };
    const titleOf = (id: string) => getTopicById(id).title;

    return {
      topicId: resolved.id,
      prerequisites: raw.prerequisites.map((p) => ({
        id: p.id,
        title: titleOf(p.id),
        reason: p.reason,
      })),
      siblingTopics: raw.siblings.map((s) => ({
        id: s.id,
        title: titleOf(s.id),
        sharedInvariant: s.sharedInvariant,
      })),
      nextLevelUnlocks: raw.nextLevel.map((n) => ({
        id: n.id,
        title: titleOf(n.id),
        progressionTwist: n.progressionTwist,
      })),
    };
  }

  /**
   * Padded Trigram Fuzzy Topic Search (handles typos like "monotnic", "dijksta", "slidng")
   */
  public searchTopicsFuzzy(query: string): CurriculumTopic[] {
    const cleaned = query.trim().toLowerCase();
    if (!cleaned) return CURRICULUM_TOPICS;

    const padded = `  ${cleaned}  `;
    const scores = new Map<string, number>();
    for (let i = 0; i <= padded.length - 3; i++) {
      const gram = padded.slice(i, i + 3);
      this.trigramIndex.get(gram)?.forEach((id) => {
        scores.set(id, (scores.get(id) ?? 0) + 1);
      });
    }

    for (const t of CURRICULUM_TOPICS) {
      const hay = `${t.title} ${t.category} ${t.tagline}`.toLowerCase();
      if (hay.includes(cleaned)) {
        scores.set(t.id, (scores.get(t.id) ?? 0) + 15);
      }
    }

    return Array.from(scores.entries())
      .filter(([, score]) => score >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => getTopicById(id));
  }
}

export const algorithmGraphService = new AlgorithmGraphService();
