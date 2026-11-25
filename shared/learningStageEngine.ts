import {
  validateCanonicalLearningUnit,
  type CanonicalLearningUnit,
  type LearningEvidenceKind,
  type UniversalLearningStage,
} from './unifiedLearningContract';
import type { LessonStageId } from './learningContract';

export interface LearningStageEvidenceRecord {
  id: string;
  unitId: string;
  contentVersion: string;
  stageId: LessonStageId;
  requirementId: string;
  objectiveIds: string[];
  passed: boolean;
  independent: boolean;
  verifiedArtifact: boolean;
  hintsUsed: number;
  recordedAt: string;
}

export type LearningStageStatus = 'blocked' | 'not-started' | 'in-progress' | 'complete';

export interface LearningStageProgress {
  stageId: LessonStageId;
  status: LearningStageStatus;
  requiredEvidenceCount: number;
  satisfiedEvidenceCount: number;
  missingRequirementIds: string[];
  reason: string;
}

export interface LearningProgressEvaluation {
  unitId: string;
  contentVersion: string;
  contractValid: boolean;
  contractIssues: ReturnType<typeof validateCanonicalLearningUnit>;
  stages: LearningStageProgress[];
  currentStageId: LessonStageId | null;
  allStagesComplete: boolean;
}

function evidenceQualifies(
  requirement: UniversalLearningStage['evidenceRequirements'][number],
  evidence: LearningStageEvidenceRecord
): boolean {
  if (!evidence.passed) return false;
  if (!requirement.objectiveIds.every((objectiveId) => evidence.objectiveIds.includes(objectiveId))) {
    return false;
  }

  const independentEvidenceKinds: LearningEvidenceKind[] = [
    'independent-practice',
    'unseen-transfer',
    'delayed-recall',
  ];
  if (independentEvidenceKinds.includes(requirement.kind) && !evidence.independent) {
    return false;
  }
  if (requirement.kind === 'verified-artifact' && !evidence.verifiedArtifact) {
    return false;
  }
  return true;
}

/**
 * Evaluate stage progression using content-versioned evidence.
 *
 * Evidence from stale content versions is ignored. A learner cannot skip a
 * prerequisite stage, and independent/transfer evidence cannot be satisfied
 * by an assisted attempt. This is a pure evaluator; persistence and ownership
 * checks remain the responsibility of the authenticated server route.
 */
export function evaluateLearningProgress(
  unit: CanonicalLearningUnit,
  evidenceRecords: LearningStageEvidenceRecord[]
): LearningProgressEvaluation {
  const contractIssues = validateCanonicalLearningUnit(unit);
  const contractValid = contractIssues.length === 0;
  const stages = unit.stages;
  const currentVersionEvidence = evidenceRecords.filter(
    (record) => record.unitId === unit.id && record.contentVersion === unit.version.version
  );

  const rawStageProgress = stages.map((stage) => {
    const required = stage.evidenceRequirements.filter((requirement) => requirement.required);
    const missing = required.filter((requirement) => {
      const matchingEvidence = currentVersionEvidence.filter(
        (record) => record.stageId === stage.id && record.requirementId === requirement.id
      );
      return !matchingEvidence.some((record) => evidenceQualifies(requirement, record));
    });
    return {
      stage,
      requiredEvidenceCount: required.length,
      satisfiedEvidenceCount: required.length - missing.length,
      missingRequirementIds: missing.map((requirement) => requirement.id),
      rawComplete: missing.length === 0 && required.length > 0,
      hasAnyEvidence: currentVersionEvidence.some((record) => record.stageId === stage.id),
    };
  });

  let previousComplete = true;
  const progress: LearningStageProgress[] = rawStageProgress.map((stageProgress) => {
    const { stage } = stageProgress;
    if (!contractValid) {
      return {
        stageId: stage.id,
        status: 'blocked',
        requiredEvidenceCount: stageProgress.requiredEvidenceCount,
        satisfiedEvidenceCount: 0,
        missingRequirementIds: stageProgress.missingRequirementIds,
        reason: 'The learning unit contract is invalid; progression is disabled until it is corrected.',
      };
    }

    if (!previousComplete) {
      previousComplete = false;
      return {
        stageId: stage.id,
        status: 'blocked',
        requiredEvidenceCount: stageProgress.requiredEvidenceCount,
        satisfiedEvidenceCount: stageProgress.satisfiedEvidenceCount,
        missingRequirementIds: stageProgress.missingRequirementIds,
        reason: 'Complete the preceding stage before advancing.',
      };
    }

    if (stageProgress.rawComplete) {
      previousComplete = true;
      return {
        stageId: stage.id,
        status: 'complete',
        requiredEvidenceCount: stageProgress.requiredEvidenceCount,
        satisfiedEvidenceCount: stageProgress.satisfiedEvidenceCount,
        missingRequirementIds: [],
        reason: 'All required stage evidence is satisfied for this content version.',
      };
    }

    previousComplete = false;
    return {
      stageId: stage.id,
      status: stageProgress.hasAnyEvidence ? 'in-progress' : 'not-started',
      requiredEvidenceCount: stageProgress.requiredEvidenceCount,
      satisfiedEvidenceCount: stageProgress.satisfiedEvidenceCount,
      missingRequirementIds: stageProgress.missingRequirementIds,
      reason: 'Required evidence is still missing.',
    };
  });

  const currentStageId = progress.find((stage) => stage.status !== 'complete')?.stageId ?? null;
  return {
    unitId: unit.id,
    contentVersion: unit.version.version,
    contractValid,
    contractIssues,
    stages: progress,
    currentStageId,
    allStagesComplete: contractValid && progress.length > 0 && progress.every((stage) => stage.status === 'complete'),
  };
}
