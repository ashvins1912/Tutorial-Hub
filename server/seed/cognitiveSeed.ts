import { TopicQuiz, UserBrainProfile } from '../../src/types/dsa';

export const SEED_TOPIC_QUIZZES: TopicQuiz[] = [
  {
    topicId: 'sliding-window',
    topicTitle: 'Sliding Window & Subarray Invariants',
    tier: 'Practitioner',
    questions: [
      {
        id: 'sw-q1',
        scenarioText:
          'You receive an array of positive integers representing daily network latency and must find the shortest contiguous interval whose total latency is >= Target.',
        constraintHint: 'N <= 10^5, all values strictly positive (>= 1)',
        questionPrompt: 'Why can a dynamic Sliding Window safely shrink from the left without missing an optimal subarray?',
        options: [
          {
            id: 'sw-q1-a',
            text: 'All values are positive, so shrinking Left strictly decreases the window sum monotonically',
            isCorrect: true,
            cognitiveFeedback:
              'Correct! Monotonicity guarantees that once [L..R] >= Target, any longer window ending after R with the same L can never be shorter, so L can advance permanently.',
          },
          {
            id: 'sw-q1-b',
            text: 'Sorting the array first preserves contiguous subarray indices',
            isCorrect: false,
            cognitiveFeedback:
              'Sorting scrambles element positions and destroys the definition of a contiguous subarray.',
          },
          {
            id: 'sw-q1-c',
            text: 'A Min-Heap automatically tracks contiguous indices in O(1)',
            isCorrect: false,
            cognitiveFeedback:
              'Heaps order by value, not by contiguous index range, and incur O(log N) per push/pop.',
          },
          {
            id: 'sw-q1-d',
            text: 'Prefix sums eliminate the need to track the left boundary',
            isCorrect: false,
            cognitiveFeedback:
              'Prefix sums help when negative numbers exist (with binary search or HashMap), whereas positive-only monotonicity allows an O(N) O(1)-space window.',
          },
        ],
        optimalComplexity: { time: 'O(N)', space: 'O(1)' },
      },
      {
        id: 'sw-q2',
        scenarioText:
          'Now the same problem allows NEGATIVE integers inside the array (e.g., [-5, 8, -2, 6]).',
        constraintHint: 'N <= 10^5, values in [-10^4, 10^4]',
        questionPrompt: 'What breaks the standard Left-shrinking Sliding Window when negative numbers are introduced?',
        options: [
          {
            id: 'sw-q2-a',
            text: 'Adding a future negative number could drop the sum, or removing a negative from Left could increase the sum — breaking monotonicity',
            isCorrect: true,
            cognitiveFeedback:
              'Spot on! Without monotonic sum growth, shrinking Left early might skip a valid shorter window further right. You need Prefix Sum + Monotonic Deque instead.',
          },
          {
            id: 'sw-q2-b',
            text: 'HashMaps cannot store negative integer keys',
            isCorrect: false,
            cognitiveFeedback:
              'HashMaps handle negative keys with zero issue; the breakdown is purely in window sum monotonicity.',
          },
          {
            id: 'sw-q2-c',
            text: 'Negative numbers make O(N) loops take O(N²)',
            isCorrect: false,
            cognitiveFeedback:
              'The loop structure itself is unchanged, only the correctness invariant of shrinking Left fails.',
          },
          {
            id: 'sw-q2-d',
            text: 'Two pointers must start from the middle instead of index 0',
            isCorrect: false,
            cognitiveFeedback:
              'Starting from the middle does not restore monotonicity when positive and negative values interleave.',
          },
        ],
        optimalComplexity: { time: 'O(N)', space: 'O(N)' },
      },
    ],
  },
  {
    topicId: 'monotonic-stack',
    topicTitle: 'Monotonic Stack & Next Greater Element',
    tier: 'Practitioner',
    questions: [
      {
        id: 'ms-q1',
        scenarioText:
          'Given an array of daily temperatures, for each day find how many days you must wait until a warmer temperature occurs.',
        constraintHint: 'N <= 10^5',
        questionPrompt: 'Which data structure resolves all waiting previous colder days in O(1) amortized time per element?',
        options: [
          {
            id: 'ms-q1-a',
            text: 'A Monotonic Decreasing Stack storing unresolved indices',
            isCorrect: true,
            cognitiveFeedback:
              'Correct! While today’s temperature exceeds stack.peek(), we pop that older day and record (i - poppedIndex). Every index is pushed once and popped at most once -> O(N).',
          },
          {
            id: 'ms-q1-b',
            text: 'A FIFO Queue checking only the front element',
            isCorrect: false,
            cognitiveFeedback:
              'A FIFO queue inspects the oldest day first, which might be warmer than intermediate days that should be resolved first.',
          },
          {
            id: 'ms-q1-c',
            text: 'Binary Search on the remaining unsorted suffix',
            isCorrect: false,
            cognitiveFeedback:
              'Temperature suffixes are unsorted, so Binary Search cannot locate the first warmer day.',
          },
          {
            id: 'ms-q1-d',
            text: 'A nested forward scan stopping at the first warmer day',
            isCorrect: false,
            cognitiveFeedback:
              'On strictly decreasing temperatures [90, 89, 88, ...], a forward scan degrades to O(N²) = 10^10 operations (TLE).',
          },
        ],
        optimalComplexity: { time: 'O(N)', space: 'O(N)' },
      },
    ],
  },
  {
    topicId: 'binary-search-answer',
    topicTitle: 'Binary Search on Answer Space',
    tier: 'Practitioner',
    questions: [
      {
        id: 'bs-q1',
        scenarioText:
          'You have N piles of bananas and H hours before guards return. You want the MINIMUM integer eating speed K (bananas/hour) to finish all piles within H hours.',
        constraintHint: 'N <= 10^4, pile[i] <= 10^9, H <= 10^9',
        questionPrompt: 'Why does Binary Search work on speed K even though the piles array itself is unsorted?',
        options: [
          {
            id: 'bs-q1-a',
            text: 'The feasibility predicate canFinish(K) is monotonic: if speed K works, every speed > K also works',
            isCorrect: true,
            cognitiveFeedback:
              'Exact insight! You are binary-searching the monotonic answer space [1..maxPile], not the unsorted input array. Total cost is O(N log(maxPile)).',
          },
          {
            id: 'bs-q1-b',
            text: 'Because greedy always picks the median pile size as K',
            isCorrect: false,
            cognitiveFeedback:
              'The median pile size ignores H and total banana count; feasibility depends on sum(ceil(pile / K)) <= H.',
          },
          {
            id: 'bs-q1-c',
            text: 'Sorting the piles allows O(1) eating speed calculation',
            isCorrect: false,
            cognitiveFeedback:
              'Sorting piles does not tell you the minimum speed K without testing candidate speeds or running binary search.',
          },
          {
            id: 'bs-q1-d',
            text: 'Dynamic programming is required across H hours',
            isCorrect: false,
            cognitiveFeedback:
              'H can be up to 10^9, making any O(H) DP table impossible in time and memory.',
          },
        ],
        optimalComplexity: { time: 'O(N log M)', space: 'O(1)' },
      },
    ],
  },
  {
    topicId: 'graph-topo-sort',
    topicTitle: 'Graph Cycle Detection & Topological Sort',
    tier: 'Strategist',
    questions: [
      {
        id: 'gt-q1',
        scenarioText:
          'A software build system has N modules and directed prerequisite edges [u -> v]. You must return a valid compile order or detect a circular dependency.',
        constraintHint: 'V <= 10^4, E <= 5 x 10^4',
        questionPrompt: 'How does Kahn’s BFS algorithm detect a circular dependency without running separate DFS checks from every node?',
        options: [
          {
            id: 'gt-q1-a',
            text: 'If the count of processed zero-in-degree nodes is < V when the queue empties, a cycle exists',
            isCorrect: true,
            cognitiveFeedback:
              'Correct! Any node trapped in a cycle never drops to in-degree 0, so it never enters the queue. Checking processedCount == V detects cycles in O(V + E).',
          },
          {
            id: 'gt-q1-b',
            text: 'Union-Find detects directed cycles by merging endpoints',
            isCorrect: false,
            cognitiveFeedback:
              'Standard Union-Find treats edges as undirected; a diamond DAG (A->B, A->C, B->D, C->D) has no cycle yet looks cyclic to undirected Union-Find.',
          },
          {
            id: 'gt-q1-c',
            text: 'Dijkstra shortest path flags negative edge weights as cycles',
            isCorrect: false,
            cognitiveFeedback:
              'Build dependencies are unweighted; Dijkstra is for non-negative weighted shortest paths.',
          },
          {
            id: 'gt-q1-d',
            text: 'Sorting nodes by out-degree guarantees topological order',
            isCorrect: false,
            cognitiveFeedback:
              'Global out-degree order ignores local dependency edges; only peeling zero-in-degree sources preserves prerequisite order.',
          },
        ],
        optimalComplexity: { time: 'O(V + E)', space: 'O(V + E)' },
      },
    ],
  },
  {
    topicId: 'dp-1d',
    topicTitle: '1D Dynamic Programming & Greedy Traps',
    tier: 'Pro',
    questions: [
      {
        id: 'dp-q1',
        scenarioText:
          'Given coin denominations [1, 3, 4] and target amount = 6, find the MINIMUM number of coins needed to make 6.',
        constraintHint: 'Coins <= 12, Amount <= 10^4',
        questionPrompt: 'Why does Greedy (always taking the largest coin <= remaining amount) fail on this input?',
        options: [
          {
            id: 'dp-q1-a',
            text: 'Greedy picks 4 + 1 + 1 (3 coins), whereas optimal is 3 + 3 (2 coins) — local largest choice blocks the global minimum',
            isCorrect: true,
            cognitiveFeedback:
              'Spot on! Non-canonical coin systems lack the greedy-choice property. Bottom-up DP evaluates dp[a] = min(dp[a], 1 + dp[a - coin]) across all coins.',
          },
          {
            id: 'dp-q1-b',
            text: 'Greedy cannot sort the coins array in O(N log N)',
            isCorrect: false,
            cognitiveFeedback:
              'Sorting 12 coins is trivial; the failure is mathematical, not sorting cost.',
          },
          {
            id: 'dp-q1-c',
            text: 'Two Pointers would solve it in O(1) space instead',
            isCorrect: false,
            cognitiveFeedback:
              'Two pointers only pick 2 elements, whereas Coin Change allows reusing an unlimited number of coins.',
          },
          {
            id: 'dp-q1-d',
            text: 'Pure recursion without caching already runs in O(Amount)',
            isCorrect: false,
            cognitiveFeedback:
              'Pure recursion branches up to K times per step, exploring exponential O(K^Amount) overlapping subtrees.',
          },
        ],
        optimalComplexity: { time: 'O(Amount * Coins)', space: 'O(Amount)' },
      },
    ],
  },
];

export const INITIAL_BRAIN_PROFILE: UserBrainProfile = {
  userId: 'learner-default',
  currentTier: 'Noob',
  cognitiveMetrics: {
    signalRecognitionScore: 0,
    bottleneckDiagnosisScore: 0,
    logicAssemblyAccuracy: 0,
    paperDryRunStreak: 0,
  },
  passedTopicQuizzes: [],
  completedProblemIds: [],
  spacedRepetitionQueue: [],
};
