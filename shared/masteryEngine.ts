import type {
  AssessmentQuestion,
  DimensionMasteryRecord,
  MasteryDimensionId,
  MasteryEvidence,
  MasteryLevel,
  PatternRecognitionPrompt,
  RevisionIntervalDay,
  RevisionSchedule,
  TopicMasterySummary,
} from './learningContract';

/**
 * Shared Mastery, Pattern Recognition Scoring & Adaptive Spaced-Revision Engine
 * Implements Sections 8 and 9 of the Unified Learning Experience Plan.
 */

export const SPACED_REVISION_INTERVALS: RevisionIntervalDay[] = [1, 3, 7, 14, 30];

export const PATTERN_RECOGNITION_WEIGHTS: Record<
  PatternRecognitionPrompt['criteria'][number]['criterion'],
  number
> = {
  structuralUnderstanding: 20,
  patternIdentification: 25,
  dataStructureSelection: 15,
  constraintReasoning: 15,
  complexityAnalysis: 15,
  alternativeApproachEvaluation: 10,
};

export const MASTERY_DIMENSION_LABELS: Record<MasteryDimensionId, string> = {
  understanding: 'Conceptual Understanding',
  patternRecognition: 'Pattern Recognition',
  visualization: 'Visualization & Invariants',
  implementation: 'Independent Implementation',
  correctness: 'Correctness & Edge Cases',
  complexityAnalysis: 'Complexity Analysis',
  debugging: 'Debugging & Root Cause',
  transferAbility: 'Unseen Problem Transfer',
};

export const MASTERY_DIMENSION_THRESHOLDS: Record<MasteryDimensionId, number> = {
  understanding: 80,
  patternRecognition: 80,
  visualization: 80,
  implementation: 80,
  correctness: 80,
  complexityAnalysis: 80,
  debugging: 80,
  transferAbility: 80,
};

export interface PatternRecognitionScoringResult {
  weightedScorePct: number;
  passed: boolean;
  breakdown: Array<{
    criterion: PatternRecognitionPrompt['criteria'][number]['criterion'];
    label: string;
    weight: number;
    earnedWeight: number;
    isCorrect: boolean;
    rationale: string;
  }>;
}

export function scorePatternRecognitionAttempt(
  prompt: PatternRecognitionPrompt,
  selectedOptionByCriterion: Record<string, string>
): PatternRecognitionScoringResult {
  let totalWeight = 0;
  let earned = 0;

  const breakdown = prompt.criteria.map((item) => {
    const selectedId = selectedOptionByCriterion[item.criterion];
    const chosen = item.options.find((opt) => opt.id === selectedId);
    const correctOption = item.options.find((opt) => opt.isCorrect);
    const isCorrect = Boolean(chosen?.isCorrect);
    totalWeight += item.weight;
    const earnedWeight = isCorrect ? item.weight : 0;
    earned += earnedWeight;

    return {
      criterion: item.criterion,
      label: item.label,
      weight: item.weight,
      earnedWeight,
      isCorrect,
      rationale: chosen?.rationale ?? correctOption?.rationale ?? 'Review the problem constraints and invariant.',
    };
  });

  const weightedScorePct = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
  return {
    weightedScorePct,
    passed: weightedScorePct >= 80,
    breakdown,
  };
}

export function scoreAssessmentDimensions(
  questions: AssessmentQuestion[],
  answers: Record<string, string>
): {
  correctCount: number;
  scorePct: number;
  dimensionScores: Partial<Record<MasteryDimensionId, number>>;
} {
  const totals = new Map<MasteryDimensionId, { correct: number; total: number }>();
  let correctCount = 0;

  for (const question of questions) {
    const isCorrect = question.options.some(
      (option) => option.id === answers[question.id] && option.isCorrect
    );
    if (isCorrect) correctCount += 1;
    const current = totals.get(question.dimension) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (isCorrect) current.correct += 1;
    totals.set(question.dimension, current);
  }

  const dimensionScores: Partial<Record<MasteryDimensionId, number>> = {};
  for (const [dimension, result] of totals) {
    dimensionScores[dimension] = Math.round((result.correct / result.total) * 100);
  }

  return {
    correctCount,
    scorePct: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
    dimensionScores,
  };
}

export function createEmptyMasteryEvidence(topicId: string, contentVersion: string): MasteryEvidence {
  return {
    topicId,
    contentVersion,
    understandCompleted: false,
    conceptCheckPassed: false,
    tracesCompleted: [],
    predictionCheckpointsCorrect: 0,
    predictionCheckpointsTotal: 0,
    implementationsVerified: [],
    edgeCasesPassed: 0,
    debuggingExercisesPassed: [],
    patternRecognitionBestPct: 0,
    complexityCheckPassed: false,
    transferAssessmentBestPct: 0,
    delayedRecallPassedCount: 0,
    hintsUsedTotal: 0,
    mistakesCount: 0,
    updatedAt: new Date().toISOString(),
  };
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Computes independent scores for all 8 mastery dimensions from verifiable evidence.
 * Watching a lesson or solving 1 easy problem can NEVER produce 'Mastered'.
 */
export function computeTopicMastery(evidence: MasteryEvidence): TopicMasterySummary {
  const understandingScore = clampPct(
    (evidence.understandCompleted ? 50 : 0) + (evidence.conceptCheckPassed ? 50 : 0)
  );

  const patternRecognitionScore = clampPct(evidence.patternRecognitionBestPct);

  const traceBreadth = Math.min(2, evidence.tracesCompleted.length) * 25; // up to 50
  const checkpointAccuracy =
    evidence.predictionCheckpointsTotal > 0
      ? (evidence.predictionCheckpointsCorrect / evidence.predictionCheckpointsTotal) * 50
      : 0;
  const visualizationScore = clampPct(traceBreadth + checkpointAccuracy);

  const implementationScore = clampPct(
    Math.min(2, evidence.implementationsVerified.length) * 50
  );

  const correctnessScore = clampPct(
    (evidence.implementationsVerified.length > 0 ? 40 : 0) +
      Math.min(3, evidence.edgeCasesPassed) * 20
  );

  // Legacy complexityCheckPassed is intentionally ignored: older clients set it from unrelated activity.
  const complexityScore = clampPct(evidence.complexityAnalysisBestPct ?? 0);

  const debuggingScore = clampPct(evidence.debuggingExercisesPassed.length > 0 ? 100 : 0);

  const transferScore = clampPct(evidence.transferAssessmentBestPct);

  const rawDimensions: Array<{ id: MasteryDimensionId; score: number; count: number; missingHint: string }> = [
    {
      id: 'understanding',
      score: understandingScore,
      count: (evidence.understandCompleted ? 1 : 0) + (evidence.conceptCheckPassed ? 1 : 0),
      missingHint: 'Complete Stage 1 Understand and pass the conceptual check',
    },
    {
      id: 'patternRecognition',
      score: patternRecognitionScore,
      count: evidence.patternRecognitionBestPct > 0 ? 1 : 0,
      missingHint: 'Score >= 80% on Pattern Recognition Intelligence',
    },
    {
      id: 'visualization',
      score: visualizationScore,
      count: evidence.tracesCompleted.length + evidence.predictionCheckpointsCorrect,
      missingHint: 'Complete at least 2 interactive traces and pass prediction checkpoints',
    },
    {
      id: 'implementation',
      score: implementationScore,
      count: evidence.implementationsVerified.length,
      missingHint: 'Verify at least 2 independent code implementations against test suites',
    },
    {
      id: 'correctness',
      score: correctnessScore,
      count: evidence.edgeCasesPassed,
      missingHint: 'Pass boundary & edge-case tests in verified problem suites',
    },
    {
      id: 'complexityAnalysis',
      score: complexityScore,
      count: evidence.complexityAnalysisBestPct > 0 ? 1 : 0,
      missingHint: 'Demonstrate accurate Time & Space complexity reasoning',
    },
    {
      id: 'debugging',
      score: debuggingScore,
      count: evidence.debuggingExercisesPassed.length,
      missingHint: 'Fix and verify at least 1 debugging challenge',
    },
    {
      id: 'transferAbility',
      score: transferScore,
      count: evidence.transferAssessmentBestPct > 0 ? 1 : 0,
      missingHint: 'Score >= 80% on the Unseen Transfer Assessment',
    },
  ];

  const dimensions: DimensionMasteryRecord[] = rawDimensions.map((item) => ({
    dimension: item.id,
    label: MASTERY_DIMENSION_LABELS[item.id],
    scorePct: item.score,
    evidenceCount: item.count,
    metMasteryThreshold: item.score >= MASTERY_DIMENSION_THRESHOLDS[item.id],
    lastUpdatedAt: item.count > 0 ? evidence.updatedAt : null,
  }));

  const overallScorePct = clampPct(
    dimensions.reduce((sum, dim) => sum + dim.scorePct, 0) / dimensions.length
  );

  const missingForMastery = rawDimensions
    .filter((item) => item.score < MASTERY_DIMENSION_THRESHOLDS[item.id])
    .map((item) => item.missingHint);

  const hasAnyEvidence = dimensions.some((d) => d.evidenceCount > 0);
  const metCount = dimensions.filter((d) => d.metMasteryThreshold).length;

  let level: MasteryLevel;
  if (!hasAnyEvidence) {
    level = 'Not Started';
  } else if (
    metCount === dimensions.length &&
    evidence.implementationsVerified.length >= 2 &&
    evidence.debuggingExercisesPassed.length >= 1 &&
    evidence.transferAssessmentBestPct >= 80
  ) {
    level = 'Mastered';
  } else if (
    metCount >= 5 &&
    overallScorePct >= 65 &&
    evidence.implementationsVerified.length >= 1
  ) {
    level = 'Proficient';
  } else if (overallScorePct >= 30 || evidence.implementationsVerified.length >= 1 || evidence.tracesCompleted.length >= 1) {
    level = 'Practicing';
  } else {
    level = 'Learning';
  }

  return {
    topicId: evidence.topicId,
    level,
    overallScorePct,
    dimensions,
    missingForMastery,
    evidence,
  };
}

export interface RevisionAttemptInput {
  scorePct: number;
  hintsUsed: number;
  timeTakenSec: number;
  mistakesCount: number;
}

export function createInitialRevisionSchedule(
  topicId: string,
  topicTitle: string,
  now = new Date()
): RevisionSchedule {
  const intervalDays: RevisionIntervalDay = 1;
  const dueAt = new Date(now.getTime() + intervalDays * 86_400_000).toISOString();
  return {
    id: `rev-${topicId}`,
    topicId,
    topicTitle,
    currentStageIndex: 0,
    intervalDays,
    dueAt,
    lastReviewedAt: now.toISOString(),
    status: 'scheduled',
    consecutiveFailures: 0,
    adjustmentReason: 'Scheduled Day 1 initial spaced-revision checkpoint.',
    history: [],
  };
}

/**
 * Adaptive Spaced-Revision Scheduler (Day 1 -> 3 -> 7 -> 14 -> 30).
 * Struggling learners (low score, high hints, slow recall, repeated failures)
 * receive reinforced practice instead of prematurely advancing.
 */
export function computeNextRevisionSchedule(
  current: RevisionSchedule,
  attempt: RevisionAttemptInput,
  now = new Date()
): RevisionSchedule {
  const struggled =
    attempt.scorePct < 70 ||
    attempt.mistakesCount >= 2 ||
    attempt.hintsUsed >= 2;
  const slowOrAssisted =
    !struggled && (attempt.scorePct < 85 || attempt.hintsUsed >= 1 || attempt.timeTakenSec > 300);

  let nextStageIndex = current.currentStageIndex;
  let consecutiveFailures = current.consecutiveFailures;
  let status: RevisionSchedule['status'] = 'scheduled';
  let outcome: 'advanced' | 'held' | 'reinforced' = 'advanced';
  let adjustmentReason: string;

  if (struggled) {
    consecutiveFailures += 1;
    nextStageIndex = consecutiveFailures >= 2 ? 0 : Math.max(0, current.currentStageIndex - 1);
    status = 'needs-reinforcement';
    outcome = 'reinforced';
    adjustmentReason =
      consecutiveFailures >= 2
        ? 'Repeated recall difficulty detected — reset to Day 1 with additional guided practice.'
        : 'Score below 70% or high hint/mistake count — shortened interval for targeted reinforcement.';
  } else if (slowOrAssisted) {
    consecutiveFailures = 0;
    nextStageIndex = current.currentStageIndex;
    status = 'scheduled';
    outcome = 'held';
    adjustmentReason =
      'Passed with hints or elevated recall time — holding current interval before extending.';
  } else {
    consecutiveFailures = 0;
    nextStageIndex = Math.min(SPACED_REVISION_INTERVALS.length - 1, current.currentStageIndex + 1);
    status = 'scheduled';
    outcome = 'advanced';
    adjustmentReason = `Strong independent recall (${attempt.scorePct}%) — advanced to Day ${SPACED_REVISION_INTERVALS[nextStageIndex]} interval.`;
  }

  const intervalDays = SPACED_REVISION_INTERVALS[nextStageIndex];
  const dueAt = new Date(now.getTime() + intervalDays * 86_400_000).toISOString();

  return {
    ...current,
    currentStageIndex: nextStageIndex,
    intervalDays,
    dueAt,
    lastReviewedAt: now.toISOString(),
    status,
    consecutiveFailures,
    adjustmentReason,
    history: [
      ...current.history.slice(-19),
      {
        attemptedAt: now.toISOString(),
        scorePct: attempt.scorePct,
        hintsUsed: attempt.hintsUsed,
        timeTakenSec: attempt.timeTakenSec,
        nextIntervalDays: intervalDays,
        outcome,
      },
    ],
  };
}
