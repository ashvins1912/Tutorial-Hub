import assert from 'node:assert/strict';
import test from 'node:test';

import { validateCanonicalLearningUnit } from '../../shared/unifiedLearningContract.ts';

const stages = [
  ['understand', 'Explain the system boundary.'],
  ['visualize', 'Trace one request through the system.'],
  ['implement', 'Configure a safe service boundary.'],
  ['practice', 'Diagnose a failed request independently.'],
  ['master', 'Transfer the design to an unfamiliar workload.'],
];

function makeUnit() {
  const objectives = stages.map(([stage, statement], index) => ({
    id: `obj-${stage}`,
    statement,
    stage,
    dimension: index === 4 ? 'transferAbility' : 'understanding',
  }));
  const assets = stages.map(([stage], index) => ({
    id: `asset-${stage}`,
    kind: index === 0 ? 'explanation' : 'worked-example',
    title: `${stage} asset`,
    description: `Support the ${stage} stage`,
    contentRef: `content://${stage}`,
    verified: false,
  }));
  return {
    id: 'system-design-api-boundary',
    academyId: 'system-design-academy',
    title: 'API boundary design',
    description: 'Learn to define a reliable API boundary.',
    difficulty: 'Medium',
    audience: 'Intermediate engineers',
    prerequisites: [],
    objectives,
    stages: stages.map(([id], index) => ({
      id,
      order: index + 1,
      content: [`Authored ${id} content`],
      assetIds: [`asset-${id}`],
      evidenceRequirements: [{
        id: `evidence-${id}`,
        kind: index === 4 ? 'unseen-transfer' : 'explain-back',
        objectiveIds: [`obj-${id}`],
        description: `Demonstrate ${id}`,
        required: true,
      }],
    })),
    assets,
    version: {
      contentId: 'system-design-api-boundary',
      version: '0.1.0',
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

test('academy-neutral learning unit accepts a complete five-stage contract', () => {
  assert.deepEqual(validateCanonicalLearningUnit(makeUnit()), []);
});

test('contract catches missing stages, broken references and unmapped objectives', () => {
  const unit = makeUnit();
  unit.stages = unit.stages.slice(0, 4);
  unit.stages[0].assetIds = ['missing-asset'];
  unit.stages[0].evidenceRequirements[0].objectiveIds = ['missing-objective'];

  const codes = validateCanonicalLearningUnit(unit).map((issue) => issue.code);
  assert.ok(codes.includes('stage-order'));
  assert.ok(codes.includes('unknown-asset'));
  assert.ok(codes.includes('unknown-objective'));
  assert.ok(codes.includes('unmapped-objective'));
});

test('published content requires technical and learning reviewers', () => {
  const unit = makeUnit();
  unit.version.publicationStatus = 'published';
  unit.version.verificationStatus = 'Published';

  assert.ok(
    validateCanonicalLearningUnit(unit).some((issue) => issue.code === 'published-without-review')
  );

  unit.version.technicalReviewer = 'Technical reviewer';
  unit.version.learningReviewer = 'Learning reviewer';
  assert.ok(
    !validateCanonicalLearningUnit(unit).some((issue) => issue.code === 'published-without-review')
  );
});
