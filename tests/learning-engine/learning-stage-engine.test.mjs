import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateLearningProgress } from '../../shared/learningStageEngine.ts';

const stageIds = ['understand', 'visualize', 'implement', 'practice', 'master'];

function unitFixture() {
  const objectives = stageIds.map((stage) => ({
    id: `obj-${stage}`,
    statement: `Demonstrate ${stage}`,
    stage,
    dimension: stage === 'master' ? 'transferAbility' : 'understanding',
  }));
  return {
    id: 'unit-evidence-gated',
    academyId: 'system-design-academy',
    title: 'Evidence gated unit',
    description: 'Test unit',
    difficulty: 'Medium',
    audience: 'Test',
    prerequisites: [],
    objectives,
    stages: stageIds.map((id, index) => ({
      id,
      order: index + 1,
      content: [`Content for ${id}`],
      assetIds: [],
      evidenceRequirements: [{
        id: `req-${id}`,
        kind: id === 'practice' ? 'independent-practice' : id === 'master' ? 'unseen-transfer' : 'explain-back',
        objectiveIds: [`obj-${id}`],
        description: `Pass ${id}`,
        required: true,
      }],
    })),
    assets: [],
    version: {
      contentId: 'unit-evidence-gated',
      version: '1.0.0',
      publicationStatus: 'pilot',
      verificationStatus: 'Structurally Valid',
      createdAt: '2026-11-25T00:00:00.000Z',
      updatedAt: '2026-11-25T00:00:00.000Z',
      author: 'test',
      technicalReviewer: null,
      learningReviewer: null,
      reviewHistory: [],
    },
  };
}

function evidenceFor(unit, stageId, overrides = {}) {
  return {
    id: `evidence-${stageId}`,
    unitId: unit.id,
    contentVersion: unit.version.version,
    stageId,
    requirementId: `req-${stageId}`,
    objectiveIds: [`obj-${stageId}`],
    passed: true,
    independent: stageId === 'practice' || stageId === 'master',
    verifiedArtifact: false,
    hintsUsed: 0,
    recordedAt: '2026-11-25T01:00:00.000Z',
    ...overrides,
  };
}

test('stage progression blocks skipping and advances only with required evidence', () => {
  const unit = unitFixture();
  const empty = evaluateLearningProgress(unit, []);
  assert.equal(empty.contractValid, true);
  assert.equal(empty.currentStageId, 'understand');
  assert.equal(empty.stages[0].status, 'not-started');
  assert.ok(empty.stages.slice(1).every((stage) => stage.status === 'blocked'));

  const withUnderstand = evaluateLearningProgress(unit, [evidenceFor(unit, 'understand')]);
  assert.equal(withUnderstand.stages[0].status, 'complete');
  assert.equal(withUnderstand.currentStageId, 'visualize');
  assert.equal(withUnderstand.stages[1].status, 'not-started');
  assert.ok(withUnderstand.stages.slice(2).every((stage) => stage.status === 'blocked'));
});

test('stale, wrong-unit, failed and assisted transfer evidence cannot complete a stage', () => {
  const unit = unitFixture();
  const understand = evidenceFor(unit, 'understand');
  const stale = evidenceFor(unit, 'visualize', { contentVersion: '0.9.0' });
  const wrongUnit = evidenceFor(unit, 'visualize', { unitId: 'another-unit' });
  const failed = evidenceFor(unit, 'visualize', { passed: false });
  const progress = evaluateLearningProgress(unit, [understand, stale, wrongUnit, failed]);
  assert.equal(progress.stages[0].status, 'complete');
  assert.equal(progress.stages[1].status, 'in-progress');
  assert.equal(progress.stages[1].satisfiedEvidenceCount, 0);

  const assistedTransfer = evidenceFor(unit, 'master', { independent: false });
  const withPrereqs = stageIds.slice(0, 4).map((id) => evidenceFor(unit, id));
  const transferProgress = evaluateLearningProgress(unit, [...withPrereqs, assistedTransfer]);
  assert.equal(transferProgress.stages[4].status, 'in-progress');
  assert.equal(transferProgress.allStagesComplete, false);
});

test('complete evidence for the current content version completes all five stages', () => {
  const unit = unitFixture();
  const evidence = stageIds.map((id) => evidenceFor(unit, id));
  const progress = evaluateLearningProgress(unit, evidence);
  assert.equal(progress.contractValid, true);
  assert.equal(progress.allStagesComplete, true);
  assert.equal(progress.currentStageId, null);
  assert.ok(progress.stages.every((stage) => stage.status === 'complete'));
});
