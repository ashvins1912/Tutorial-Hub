import { PROBLEMS } from '../../src/data/problems';
import type { RankTier } from '../../src/types/dsa';

export const RANK_ORDER: RankTier[] = ['Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'];

export const RANK_XP_THRESHOLDS: Record<RankTier, number> = {
  Noob: 0,
  Apprentice: 400,
  Practitioner: 1000,
  Strategist: 1900,
  Pro: 3200,
};

export interface RawBrainProfileSnapshot {
  currentTier?: string;
  cognitiveMetrics?: {
    signalRecognitionScore?: number;
    bottleneckDiagnosisScore?: number;
    logicAssemblyAccuracy?: number;
    paperDryRunStreak?: number;
  };
  passedTopicQuizzes?: string[];
  completedProblemIds?: string[];
  completedWarmupDrills?: string[];
  masteredProblemSlugs?: string[];
  notes?: Map<string, string> | Record<string, string>;
  spacedRepetitionQueue?: unknown[];
  activityLog?: { kind?: string; xp?: number }[];
}

export interface ComputedProgressSummary {
  currentTier: RankTier;
  totalXp: number;
  uniqueProblemsSolved: number;
  completedLabsCount: number;
  compositeAccuracy: number;
  streak: number;
  communityChallengesSolved: number;
  hasProgress: boolean;
  counts: {
    masteredProblemSlugs: number;
    productCompanySolvedCount: number;
    passedTopicQuizzes: number;
    completedWarmupDrills: number;
    xrayDecodedCount: number;
    activeRecallCount: number;
    dpPracticeCount: number;
    matrixCompletedCount: number;
    algorithmsImplCount: number;
    fuzzyModulesCount: number;
    sysDesignCompletedCount: number;
    sysDesignRoadmapCount: number;
    oodMasteredCount: number;
    topicExpertiseChecksCount: number;
    mutationGraphCount: number;
    solverCompletedCount: number;
    solverDrillsDone: number;
    customConceptsCount: number;
    notesCount: number;
  };
}

export function countArrayItems(val: unknown): number {
  return Array.isArray(val) ? val.length : 0;
}

export function countTruthyRecord(val: unknown): number {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return 0;
  let total = 0;
  for (const v of Object.values(val as Record<string, unknown>)) {
    if (Array.isArray(v)) {
      total += v.filter(Boolean).length;
    } else if (v) {
      total += 1;
    }
  }
  return total;
}

export function summarizePayloadCount(key: string, val: unknown): number {
  if (Array.isArray(val)) return val.length;
  if (!val || typeof val !== 'object') return val ? 1 : 0;
  if (key === 'problem-progress') {
    const entries = Object.values(val as Record<string, Record<string, unknown>>);
    return entries.filter(
      (e) =>
        e &&
        (e.quizSolved ||
          e.sandboxSolved ||
          e.invariantSolved ||
          e.bottleneckSolved ||
          e.feynmanCompleted ||
          (Array.isArray(e.exploredSignals) && e.exploredSignals.length > 1))
    ).length;
  }
  if (key === 'system-design-academy-progress') {
    const entries = Object.values(val as Record<string, { done?: boolean; note?: string }>);
    return entries.filter((e) => e?.done || (e?.note && e.note.trim().length > 0)).length;
  }
  if (key === 'system-design-roadmap-progress') {
    const r = val as {
      completedFrameworkSteps?: unknown[];
      reviewedModules?: unknown[];
      reviewedAlgos?: unknown[];
      quizAnswers?: Record<string, unknown>;
    };
    return (
      (Array.isArray(r.completedFrameworkSteps) ? r.completedFrameworkSteps.length : 0) +
      (Array.isArray(r.reviewedModules) ? r.reviewedModules.length : 0) +
      (Array.isArray(r.reviewedAlgos) ? r.reviewedAlgos.length : 0) +
      (r.quizAnswers && typeof r.quizAnswers === 'object' ? Object.keys(r.quizAnswers).length : 0)
    );
  }
  if (key === 'solver-adaptive-telemetry') {
    const t = val as {
      completedProblemIds?: unknown[];
      microDrills?: unknown[];
      drops?: unknown[];
    };
    return (
      (Array.isArray(t.completedProblemIds) ? t.completedProblemIds.length : 0) +
      (Array.isArray(t.microDrills) ? t.microDrills.length : 0) +
      (Array.isArray(t.drops) ? t.drops.length : 0)
    );
  }
  return countTruthyRecord(val);
}

export function computeUserProgressSummary(
  profile: RawBrainProfileSnapshot | null | undefined,
  states: Record<string, unknown>,
  communityChallengesSolved = 0
): ComputedProgressSummary {
  const currentTier = (
    profile?.currentTier && RANK_ORDER.includes(profile.currentTier as RankTier)
      ? profile.currentTier
      : 'Noob'
  ) as RankTier;

  const signalRecognitionScore = profile?.cognitiveMetrics?.signalRecognitionScore ?? 0;
  const bottleneckDiagnosisScore = profile?.cognitiveMetrics?.bottleneckDiagnosisScore ?? 0;
  const logicAssemblyAccuracy = profile?.cognitiveMetrics?.logicAssemblyAccuracy ?? 0;
  const streak = profile?.cognitiveMetrics?.paperDryRunStreak ?? 0;

  const passedTopicQuizzes = profile?.passedTopicQuizzes ?? [];
  const completedProblemIds = profile?.completedProblemIds ?? [];
  const completedWarmupDrills = profile?.completedWarmupDrills ?? [];
  const masteredProblemSlugs = profile?.masteredProblemSlugs ?? [];

  const notesObj: Record<string, string> =
    profile?.notes instanceof Map
      ? Object.fromEntries(profile.notes.entries())
      : ((profile?.notes as Record<string, string>) ?? {});
  const notesCount = Object.values(notesObj).filter(
    (txt) => typeof txt === 'string' && txt.trim().length > 0
  ).length;

  const labProgressMap =
    states['problem-progress'] && typeof states['problem-progress'] === 'object'
      ? (states['problem-progress'] as Record<string, Record<string, unknown>>)
      : {};

  const completedLabsSet = new Set(completedProblemIds);
  for (const p of PROBLEMS) {
    if (labProgressMap[p.id]?.feynmanCompleted) completedLabsSet.add(p.id);
  }
  const completedLabsCount = completedLabsSet.size;

  const xrayDecodedCount = countArrayItems(states['xray-decoded-constraints']);
  const activeRecallCount = countArrayItems(states['active-recall-unlocked']);
  const productCompanySolvedCount = countArrayItems(states['product-company-solved']);
  const dpPracticeCount = countArrayItems(states['dp-practice-completed']);
  const matrixCompletedCount = countArrayItems(states['matrix-problems-completed']);
  const algorithmsImplCount = countArrayItems(states['algorithms-implemented']);
  const fuzzyModulesCount = countArrayItems(states['fuzzy-modules-completed']);
  const sysDesignProgress =
    states['system-design-academy-progress'] &&
    typeof states['system-design-academy-progress'] === 'object'
      ? (states['system-design-academy-progress'] as Record<
          string,
          { done?: boolean; note?: string }
        >)
      : {};
  const sysDesignCompletedCount = Object.values(sysDesignProgress).filter((v) => v?.done).length;
  const sysDesignRoadmapCount = summarizePayloadCount(
    'system-design-roadmap-progress',
    states['system-design-roadmap-progress']
  );
  const oodMasteredCount = countArrayItems(states['ood-mastery-progress']);
  const topicExpertiseChecksCount = countTruthyRecord(states['topic-expertise-checks']);
  const mutationGraphCount = countArrayItems(states['mutation-graph-solved']);
  const solverTelemetryRaw =
    states['solver-adaptive-telemetry'] && typeof states['solver-adaptive-telemetry'] === 'object'
      ? (states['solver-adaptive-telemetry'] as {
          completedProblemIds?: string[];
          microDrills?: { completed?: boolean }[];
        })
      : null;
  const solverCompletedCount = Array.isArray(solverTelemetryRaw?.completedProblemIds)
    ? solverTelemetryRaw.completedProblemIds.length
    : 0;
  const solverDrillsDone = Array.isArray(solverTelemetryRaw?.microDrills)
    ? solverTelemetryRaw.microDrills.filter((d) => d?.completed).length
    : 0;
  const customConceptsCount = countArrayItems(states['engine-custom-concepts']);

  const totalXp =
    completedLabsCount * 120 +
    masteredProblemSlugs.length * 60 +
    productCompanySolvedCount * 45 +
    passedTopicQuizzes.length * 90 +
    completedWarmupDrills.length * 25 +
    xrayDecodedCount * 15 +
    activeRecallCount * 35 +
    dpPracticeCount * 40 +
    matrixCompletedCount * 40 +
    algorithmsImplCount * 50 +
    fuzzyModulesCount * 45 +
    sysDesignCompletedCount * 60 +
    sysDesignRoadmapCount * 30 +
    oodMasteredCount * 45 +
    topicExpertiseChecksCount * 10 +
    mutationGraphCount * 25 +
    solverCompletedCount * 40 +
    solverDrillsDone * 20 +
    customConceptsCount * 35 +
    notesCount * 15 +
    communityChallengesSolved * 50;

  const uniqueProblemsSolved =
    completedLabsCount +
    masteredProblemSlugs.length +
    productCompanySolvedCount +
    dpPracticeCount +
    matrixCompletedCount +
    solverCompletedCount;

  const compositeAccuracy = Math.round(
    (signalRecognitionScore + bottleneckDiagnosisScore + logicAssemblyAccuracy) / 3
  );

  const hasProgress =
    totalXp > 0 ||
    uniqueProblemsSolved > 0 ||
    streak > 0 ||
    compositeAccuracy > 0 ||
    (profile?.spacedRepetitionQueue?.length ?? 0) > 0 ||
    (profile?.activityLog?.length ?? 0) > 0;

  return {
    currentTier,
    totalXp,
    uniqueProblemsSolved,
    completedLabsCount,
    compositeAccuracy,
    streak,
    communityChallengesSolved,
    hasProgress,
    counts: {
      masteredProblemSlugs: masteredProblemSlugs.length,
      productCompanySolvedCount,
      passedTopicQuizzes: passedTopicQuizzes.length,
      completedWarmupDrills: completedWarmupDrills.length,
      xrayDecodedCount,
      activeRecallCount,
      dpPracticeCount,
      matrixCompletedCount,
      algorithmsImplCount,
      fuzzyModulesCount,
      sysDesignCompletedCount,
      sysDesignRoadmapCount,
      oodMasteredCount,
      topicExpertiseChecksCount,
      mutationGraphCount,
      solverCompletedCount,
      solverDrillsDone,
      customConceptsCount,
      notesCount,
    },
  };
}
