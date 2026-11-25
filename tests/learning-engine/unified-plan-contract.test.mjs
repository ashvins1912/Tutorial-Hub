import assert from 'node:assert/strict';
import test from 'node:test';

import { DSA28_PATTERNS } from '../../src/data/dsa28Patterns.ts';
import {
  PATTERN_FORGE_CURRICULUM,
  PATTERN_FORGE_TOPICS,
  getLessonsByTopicId,
} from '../../shared/patternForgeCurriculum.ts';
import { auditCurriculumGovernance } from '../../shared/learningValidator.ts';

const EXPECTED_STAGES = ['understand', 'visualize', 'implement', 'practice', 'master'];
const EXPECTED_PILOTS = [
  'hashmap-hashset-lookup',
  'dynamic-sliding-window',
  'dynamic-programming',
];

test('unified plan contract covers every canonical Pattern Forge topic and five stages', () => {
  assert.deepEqual(PATTERN_FORGE_CURRICULUM.topicIds, DSA28_PATTERNS.map((pattern) => pattern.id));
  assert.equal(PATTERN_FORGE_TOPICS.length, 28);

  for (const topic of PATTERN_FORGE_TOPICS) {
    const lesson = getLessonsByTopicId(topic.id)[0];
    assert.ok(lesson, `missing canonical lesson for ${topic.id}`);
    assert.deepEqual(
      lesson.stages.map((stage) => stage.id),
      EXPECTED_STAGES,
      `${topic.id} must use the shared ordered five-stage lifecycle`
    );

    const objectiveIds = topic.learningObjectives.map((objective) => objective.id);
    assert.equal(new Set(objectiveIds).size, objectiveIds.length, `${topic.id} objective IDs must be unique`);
    for (const objective of topic.learningObjectives) {
      assert.ok(EXPECTED_STAGES.includes(objective.stage), `${topic.id} objective ${objective.id} uses an unknown stage`);
      assert.ok(objective.statement.trim(), `${topic.id} objective ${objective.id} must be actionable`);
    }
  }
});

test('inventory topics cannot be mistaken for authored or verified learning content', () => {
  const pilotIds = PATTERN_FORGE_TOPICS.filter((topic) => topic.isPilotReference).map((topic) => topic.id);
  assert.deepEqual(pilotIds, EXPECTED_PILOTS);

  const inventoryTopics = PATTERN_FORGE_TOPICS.filter((topic) => !topic.isPilotReference);
  assert.equal(inventoryTopics.length, 25);

  for (const topic of inventoryTopics) {
    assert.equal(topic.verificationStatus, 'Structurally Valid', topic.id);
    assert.equal(topic.version.publicationStatus, 'unpublished', topic.id);
    assert.equal(topic.version.technicalReviewer, null, topic.id);
    assert.equal(topic.version.learningReviewer, null, topic.id);
    assert.equal(topic.traceIds.length, 0, topic.id);
    assert.equal(topic.problems.length, 0, topic.id);
    assert.equal(topic.assessments.length, 0, topic.id);
    assert.deepEqual(
      Object.values(topic.activityCounts),
      [0, 0, 0, 0, 0, 0, 0, 0],
      `${topic.id} must not report target activities as authored`
    );
  }

  const governance = auditCurriculumGovernance(PATTERN_FORGE_TOPICS);
  assert.equal(governance.publishedCount, EXPECTED_PILOTS.length);
  assert.equal(governance.structurallyValidOnlyCount, inventoryTopics.length);
  assert.equal(governance.prerequisiteGraphAcyclic, true);
  assert.deepEqual(governance.danglingPrerequisites, []);
});
