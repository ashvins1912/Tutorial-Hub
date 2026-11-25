import type {
  AcademyId,
  ContentVersion,
  DifficultyLevel,
  LessonStageId,
  LearningObjective,
} from './learningContract';

/**
 * Academy-neutral learning unit contract.
 *
 * Algorithm-specific LearningTopic remains available for Pattern Forge/DSA.
 * This contract provides a stable migration boundary for database, system-design,
 * cloud, AI and full-stack academies without forcing them to model their subject
 * as an algorithm or replacing existing academy data.
 */
export type UniversalLearningAssetKind =
  | 'explanation'
  | 'worked-example'
  | 'trace'
  | 'diagram'
  | 'code'
  | 'query'
  | 'configuration'
  | 'simulation'
  | 'practice'
  | 'assessment'
  | 'reference';

export type LearningEvidenceKind =
  | 'explain-back'
  | 'prediction'
  | 'verified-artifact'
  | 'independent-practice'
  | 'debugging'
  | 'unseen-transfer'
  | 'delayed-recall';

export interface UniversalLearningAsset {
  id: string;
  kind: UniversalLearningAssetKind;
  title: string;
  description: string;
  contentRef: string;
  verified: boolean;
}

export interface StageEvidenceRequirement {
  id: string;
  kind: LearningEvidenceKind;
  objectiveIds: string[];
  description: string;
  required: boolean;
}

export interface UniversalLearningStage {
  id: LessonStageId;
  order: number;
  content: string[];
  assetIds: string[];
  evidenceRequirements: StageEvidenceRequirement[];
}

export interface CanonicalLearningUnit {
  id: string;
  academyId: AcademyId;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  audience: string;
  prerequisites: string[];
  objectives: LearningObjective[];
  stages: UniversalLearningStage[];
  assets: UniversalLearningAsset[];
  version: ContentVersion;
  /** Domain-specific extension data is owned and validated by the academy adapter. */
  extension?: Record<string, unknown>;
}

export interface LearningUnitContractIssue {
  code:
    | 'missing-id'
    | 'duplicate-id'
    | 'missing-required-field'
    | 'stage-order'
    | 'unknown-objective'
    | 'objective-stage-mismatch'
    | 'unmapped-objective'
    | 'unknown-asset'
    | 'missing-stage-content'
    | 'missing-stage-evidence'
    | 'self-prerequisite'
    | 'published-without-review';
  path: string;
  message: string;
}

const REQUIRED_STAGE_ORDER: LessonStageId[] = [
  'understand',
  'visualize',
  'implement',
  'practice',
  'master',
];

/**
 * Pure structural validator. Passing this function means structurally valid
 * only; it does not certify technical correctness, accessibility or learning
 * effectiveness. Publication requires reviewer evidence in addition to shape.
 */
export function validateCanonicalLearningUnit(
  unit: CanonicalLearningUnit
): LearningUnitContractIssue[] {
  const issues: LearningUnitContractIssue[] = [];
  const add = (code: LearningUnitContractIssue['code'], path: string, message: string) =>
    issues.push({ code, path, message });

  if (!unit.id?.trim()) add('missing-id', 'id', 'A stable canonical unit ID is required.');
  if (!unit.title?.trim()) add('missing-required-field', 'title', 'A learner-facing title is required.');
  if (!unit.description?.trim()) add('missing-required-field', 'description', 'A unit description is required.');
  if (!unit.audience?.trim()) add('missing-required-field', 'audience', 'The intended audience must be stated.');
  if (!unit.version?.contentId || unit.version.contentId !== unit.id) {
    add('missing-required-field', 'version.contentId', 'Content version must reference the canonical unit ID.');
  }

  const objectiveIds = new Set<string>();
  for (const [index, objective] of unit.objectives.entries()) {
    if (!objective.id?.trim()) {
      add('missing-id', `objectives[${index}].id`, 'Every objective requires a stable ID.');
      continue;
    }
    if (objectiveIds.has(objective.id)) {
      add('duplicate-id', `objectives[${index}].id`, `Duplicate objective ID: ${objective.id}.`);
    }
    objectiveIds.add(objective.id);
    if (!objective.statement.trim()) {
      add('missing-required-field', `objectives[${index}].statement`, 'Objective must describe observable capability.');
    }
  }
  if (objectiveIds.size === 0) add('missing-required-field', 'objectives', 'At least one learning objective is required.');

  const actualStages = unit.stages.map((stage) => stage.id);
  if (
    actualStages.length !== REQUIRED_STAGE_ORDER.length ||
    actualStages.some((stageId, index) => stageId !== REQUIRED_STAGE_ORDER[index])
  ) {
    add('stage-order', 'stages', 'Stages must appear exactly once in the shared five-stage order.');
  }

  const assetIds = new Set<string>();
  for (const [index, asset] of unit.assets.entries()) {
    if (!asset.id?.trim()) {
      add('missing-id', `assets[${index}].id`, 'Every asset requires a stable ID.');
      continue;
    }
    if (assetIds.has(asset.id)) {
      add('duplicate-id', `assets[${index}].id`, `Duplicate asset ID: ${asset.id}.`);
    }
    assetIds.add(asset.id);
  }

  const mappedObjectives = new Set<string>();
  const evidenceIds = new Set<string>();
  for (const [stageIndex, stage] of unit.stages.entries()) {
    const stagePath = `stages[${stageIndex}]`;
    if (stage.order !== stageIndex + 1) {
      add('stage-order', `${stagePath}.order`, 'Stage order must be contiguous and start at 1.');
    }
    if (!stage.content.some((item) => item.trim())) {
      add('missing-stage-content', `${stagePath}.content`, `The ${stage.id} stage needs authored content.`);
    }
    if (stage.evidenceRequirements.length === 0) {
      add('missing-stage-evidence', `${stagePath}.evidenceRequirements`, `The ${stage.id} stage needs evidence requirements.`);
    }

    for (const assetId of stage.assetIds) {
      if (!assetIds.has(assetId)) {
        add('unknown-asset', `${stagePath}.assetIds`, `Unknown asset reference: ${assetId}.`);
      }
    }

    for (const requirement of stage.evidenceRequirements) {
      if (!requirement.id?.trim()) {
        add('missing-id', `${stagePath}.evidenceRequirements`, 'Evidence requirement needs a stable ID.');
      } else if (evidenceIds.has(requirement.id)) {
        add('duplicate-id', `${stagePath}.evidenceRequirements`, `Duplicate evidence requirement ID: ${requirement.id}.`);
      } else {
        evidenceIds.add(requirement.id);
      }

      for (const objectiveId of requirement.objectiveIds) {
        const objective = unit.objectives.find((candidate) => candidate.id === objectiveId);
        if (!objective) {
          add('unknown-objective', `${stagePath}.evidenceRequirements`, `Unknown objective reference: ${objectiveId}.`);
        } else if (objective.stage !== stage.id) {
          add(
            'objective-stage-mismatch',
            `${stagePath}.evidenceRequirements`,
            `Objective ${objectiveId} belongs to ${objective.stage}, not ${stage.id}.`
          );
        } else {
          mappedObjectives.add(objectiveId);
        }
      }
    }
  }

  for (const objectiveId of objectiveIds) {
    if (!mappedObjectives.has(objectiveId)) {
      add('unmapped-objective', 'objectives', `Objective ${objectiveId} has no stage evidence mapping.`);
    }
  }

  if (unit.prerequisites.includes(unit.id)) {
    add('self-prerequisite', 'prerequisites', 'A unit cannot require itself.');
  }

  if (
    unit.version.publicationStatus === 'published' &&
    (unit.version.verificationStatus !== 'Published' ||
      !unit.version.technicalReviewer?.trim() ||
      !unit.version.learningReviewer?.trim())
  ) {
    add(
      'published-without-review',
      'version',
      'Published content requires Published verification plus technical and learning reviewers.'
    );
  }

  return issues;
}
