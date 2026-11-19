import type {
  AdaptiveTelemetryState,
  CognitiveDomain,
  DropRecord,
  MicroDrillQuestion,
  MicroDrillSpec,
  ProgressionTier,
  Sm2ReviewItem,
  SocraticPhase,
} from '../knowledge-base/types';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const memoryFallback = new Map<string, string>();

export function createSafeStorageAdapter(): StorageAdapter {
  return {
    getItem: (k) => memoryFallback.get(k) ?? null,
    setItem: (k, v) => {
      memoryFallback.set(k, v);
    },
  };
}

export function getInitialTelemetryState(): AdaptiveTelemetryState {
  return {
    drops: [],
    microDrills: [],
    sm2Queue: [],
    unlockedTier: 'Easy',
    completedProblemIds: [],
  };
}

export function loadTelemetryState(storage: StorageAdapter = createSafeStorageAdapter()): AdaptiveTelemetryState {
  const raw = storage.getItem('adaptive_telemetry');
  if (!raw) return getInitialTelemetryState();
  try {
    const parsed = JSON.parse(raw) as Partial<AdaptiveTelemetryState>;
    return {
      drops: Array.isArray(parsed.drops) ? parsed.drops : [],
      microDrills: Array.isArray(parsed.microDrills) ? parsed.microDrills : [],
      sm2Queue: Array.isArray(parsed.sm2Queue) ? parsed.sm2Queue : [],
      unlockedTier: parsed.unlockedTier ?? 'Easy',
      completedProblemIds: Array.isArray(parsed.completedProblemIds) ? parsed.completedProblemIds : [],
    };
  } catch {
    return getInitialTelemetryState();
  }
}

export function saveTelemetryState(
  state: AdaptiveTelemetryState,
  storage: StorageAdapter = createSafeStorageAdapter(),
): void {
  storage.setItem('adaptive_telemetry', JSON.stringify(state));
}

interface GapDiagnosis {
  title: string;
  diagnosedGap: string;
  questions: MicroDrillQuestion[];
}

function diagnoseDropPhase(phase: SocraticPhase, domain: CognitiveDomain): GapDiagnosis {
  if (phase === 'DECONSTRUCT') {
    return {
      title: '2-Min Constraint-to-Complexity Drill',
      diagnosedGap: `Dropped during Deconstruction (${domain}): struggling to convert numerical bounds (N <= 10^5, 1e9, O(1) space) into hard complexity ceilings.`,
      questions: [
        {
          id: 'q-dec-1',
          prompt: 'A problem specifies N <= 2 * 10^5 and asks for a contiguous subarray property. Which brute-force class is IMMEDIATELY disqualified?',
          options: ['O(N) Sliding Window', 'O(N log N) Prefix + Sort', 'O(N^2) Nested Loop Enumeration', 'O(N) Prefix Sum + Hash Map'],
          correctIndex: 2,
          explanation: 'With N = 2*10^5, N^2 = 4*10^10 operations (~40s+ TLE). You must target O(N) or O(N log N).',
        },
        {
          id: 'q-dec-2',
          prompt: 'A corpus has 10M product titles with a <10ms typo-tolerant search SLA. Why does single-stage Levenshtein fail?',
          options: [
            'Levenshtein cannot handle typos',
            'O(10M * L^2) exceeds 10ms; Stage 1 Inverted N-Gram index must prune to <= 500 candidates first',
            'Hash maps cannot store strings',
            'Binary search handles typos faster',
          ],
          correctIndex: 1,
          explanation: 'Two-Stage Filter-and-Refine decouples recall (<5ms postings merge) from precision (edit distance on top-K only).',
        },
      ],
    };
  }

  if (phase === 'HYPOTHESIZE') {
    return {
      title: '2-Min Pattern & Invariant Disambiguation Drill',
      diagnosedGap: `Dropped during Hypothesis (${domain}): hesitation choosing between competing mental models (e.g., Sliding Window vs Prefix Sum, or BFS vs Invariant).`,
      questions: [
        {
          id: 'q-hyp-1',
          prompt: 'You need the number of subarrays summing to K, and the array contains NEGATIVE numbers. Why does variable Sliding Window break?',
          options: [
            'Negative numbers break monotonicity: expanding right can decrease sum and shrinking left can increase sum',
            'Sliding Window only works on strings',
            'Hash maps fail on negative keys',
            'Two pointers require even array lengths',
          ],
          correctIndex: 0,
          explanation: 'Without monotonicity, you cannot prove shrinking left will restore sum <= K. Switch to Prefix Sum + Frequency Map!',
        },
        {
          id: 'q-hyp-2',
          prompt: 'Two opposite corners of an 8x8 chessboard are removed. Which mental model proves 1x2 domino tiling is impossible in O(1)?',
          options: [
            'Greedy longest-row placement',
            '2-Coloring Parity Invariant (32 White vs 30 Black squares)',
            'Binary search on domino count',
            'Dijkstra shortest path',
          ],
          correctIndex: 1,
          explanation: 'Each 1x2 domino covers 1 White + 1 Black square (delta = 0), so a +2 color imbalance can never reach 0.',
        },
      ],
    };
  }

  if (phase === 'ELIMINATE_OR_BUILD') {
    return {
      title: '2-Min Transition & Loop Invariant Builder Drill',
      diagnosedGap: `Dropped during Build/Elimination (${domain}): difficulty locking loop guards, pointer updates, or constraint propagation steps.`,
      questions: [
        {
          id: 'q-bld-1',
          prompt: 'In a Variable Sliding Window ("longest valid window"), WHEN should you update best = Math.max(best, right - left + 1)?',
          options: [
            'Before expanding right',
            'Immediately after expanding right, before checking violation',
            'Only AFTER the inner while-loop restores the window validity invariant',
            'Only after the outer loop finishes',
          ],
          correctIndex: 2,
          explanation: 'Recording length before restoring the invariant can count an invalid window as the answer.',
        },
        {
          id: 'q-bld-2',
          prompt: 'In a 4x4 bijection Truth Elimination Grid, confirming cell (Row 2, Col 3) immediately implies:',
          options: [
            'Nothing until all clues are read',
            'Every other cell in Row 2 and Col 3 must be eliminated (✗)',
            'Diagonal cells must be confirmed',
            'The puzzle has a contradiction',
          ],
          correctIndex: 1,
          explanation: 'A 1-to-1 bijection permits at most one ✓ per row and per column; cross-eliminating exposes naked singles.',
        },
      ],
    };
  }

  // VERIFY_EDGE_CASES
  return {
    title: '2-Min Edge-Case Breaker Drill',
    diagnosedGap: `Dropped during Edge-Case Verification (${domain}): missing boundary traps like empty prefixes, duplicate indices, or negative modulo.`,
    questions: [
      {
        id: 'q-ver-1',
        prompt: 'In Prefix Sum + Hash Map ("subarray sum equals K"), what critical initialization prevents missing subarrays that start at index 0?',
        options: [
          'freq.set(0, 1)',
          'freq.set(k, 1)',
          'Starting the loop at index 1',
          'Sorting the array first',
        ],
        correctIndex: 0,
        explanation: 'Seeding prefix sum 0 with count 1 ensures that when prefix[i] === K, lookup (K - K = 0) finds 1 valid subarray [0..i].',
      },
      {
        id: 'q-ver-2',
        prompt: 'Why does boundary padding ("  word  ") matter in Character Trigram Fuzzy Search?',
        options: [
          'It doubles database storage for speed',
          'Without padding, a typo in the first or last letter destroys fewer/unbalanced trigrams vs middle letters',
          'JavaScript strings require leading spaces',
          'It eliminates the need for an inverted index',
        ],
        correctIndex: 1,
        explanation: 'Padding ensures start/end characters participate in 3 trigrams just like interior characters, giving fair similarity scores.',
      },
    ],
  };
}

function computeUnlockedTier(queue: Sm2ReviewItem[]): ProgressionTier {
  const count = queue.length;
  if (count === 0) return 'Easy';
  const avgMastery = queue.reduce((acc, item) => acc + item.masteryScore, 0) / count;
  if (count >= 5 && avgMastery >= 80) return 'System Design';
  if (count >= 3 && avgMastery >= 75) return 'Hard';
  if (count >= 1) return 'Medium';
  return 'Easy';
}

/**
 * Logs problem abandonment at a specific Socratic phase, diagnoses the exact
 * cognitive gap, and auto-queues a targeted 2-minute Micro-Drill.
 */
export function trackProblemDropFromState(
  state: AdaptiveTelemetryState,
  problemId: string,
  problemTitle: string,
  domain: CognitiveDomain,
  droppedAtPhase: SocraticPhase,
): { state: AdaptiveTelemetryState; createdDrill: MicroDrillSpec; dropRecord: DropRecord } {
  const now = new Date().toISOString();
  const diagnosis = diagnoseDropPhase(droppedAtPhase, domain);

  const dropRecord: DropRecord = {
    id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    problemId,
    problemTitle,
    domain,
    droppedAtPhase,
    diagnosedGap: diagnosis.diagnosedGap,
    timestamp: now,
  };

  const createdDrill: MicroDrillSpec = {
    id: `drill-${droppedAtPhase.toLowerCase()}-${Date.now()}`,
    title: diagnosis.title,
    targetPhase: droppedAtPhase,
    domain,
    diagnosedGap: diagnosis.diagnosedGap,
    estimatedMinutes: 2,
    createdAt: now,
    sourceProblemId: problemId,
    completed: false,
    questions: diagnosis.questions,
  };

  const filteredDrills = state.microDrills.filter(
    (d) => !(d.targetPhase === droppedAtPhase && d.sourceProblemId === problemId && !d.completed),
  );

  const nextState: AdaptiveTelemetryState = {
    ...state,
    drops: [dropRecord, ...state.drops].slice(0, 25),
    microDrills: [createdDrill, ...filteredDrills].slice(0, 12),
  };

  return { state: nextState, createdDrill, dropRecord };
}

export function trackProblemDrop(
  problemId: string,
  problemTitle: string,
  domain: CognitiveDomain,
  droppedAtPhase: SocraticPhase,
  storage: StorageAdapter = createSafeStorageAdapter(),
): { state: AdaptiveTelemetryState; createdDrill: MicroDrillSpec; dropRecord: DropRecord } {
  const state = loadTelemetryState(storage);
  const res = trackProblemDropFromState(state, problemId, problemTitle, domain, droppedAtPhase);
  saveTelemetryState(res.state, storage);
  return res;
}

export function trackProblemCompleteFromState(
  state: AdaptiveTelemetryState,
  problemId: string,
  problemTitle: string,
  domain: CognitiveDomain,
  hintsUsed: number,
  independent: boolean,
): { state: AdaptiveTelemetryState; reviewItem: Sm2ReviewItem } {
  const now = new Date();
  const baseScore = independent ? 96 : 78;
  const masteryScore = Math.max(35, Math.min(100, baseScore - hintsUsed * 9));

  const quality = Math.max(0, Math.min(5, Math.round(masteryScore / 20)));
  const existing = state.sm2Queue.find((item) => item.problemId === problemId);

  let repetitions = existing ? existing.repetitions : 0;
  let easeFactor = existing ? existing.easeFactor : 2.5;
  let intervalDays = existing ? existing.intervalDays : 1;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  easeFactor = Number(
    Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))).toFixed(2),
  );

  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const reviewItem: Sm2ReviewItem = {
    problemId,
    problemTitle,
    domain,
    masteryScore,
    hintsUsed,
    independent,
    repetitions,
    easeFactor,
    intervalDays,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextDate.toISOString(),
  };

  const nextQueue = [
    reviewItem,
    ...state.sm2Queue.filter((item) => item.problemId !== problemId),
  ];

  const completedIds = Array.from(new Set([...state.completedProblemIds, problemId]));
  const unlockedTier = computeUnlockedTier(nextQueue);

  const nextState: AdaptiveTelemetryState = {
    ...state,
    sm2Queue: nextQueue,
    completedProblemIds: completedIds,
    unlockedTier,
  };

  return { state: nextState, reviewItem };
}

export function trackProblemComplete(
  problemId: string,
  problemTitle: string,
  domain: CognitiveDomain,
  hintsUsed: number,
  independent: boolean,
  storage: StorageAdapter = createSafeStorageAdapter(),
): { state: AdaptiveTelemetryState; reviewItem: Sm2ReviewItem } {
  const state = loadTelemetryState(storage);
  const res = trackProblemCompleteFromState(state, problemId, problemTitle, domain, hintsUsed, independent);
  saveTelemetryState(res.state, storage);
  return res;
}

export function completeMicroDrillFromState(
  state: AdaptiveTelemetryState,
  drillId: string,
): AdaptiveTelemetryState {
  return {
    ...state,
    microDrills: state.microDrills.map((d) =>
      d.id === drillId ? { ...d, completed: true } : d,
    ),
  };
}

export function completeMicroDrill(
  drillId: string,
  storage: StorageAdapter = createSafeStorageAdapter(),
): AdaptiveTelemetryState {
  const state = loadTelemetryState(storage);
  const nextState = completeMicroDrillFromState(state, drillId);
  saveTelemetryState(nextState, storage);
  return nextState;
}
