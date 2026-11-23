import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTER_INTERVIEW_PROBLEM_ADDITIONS,
  MASTER_INTERVIEW_PROBLEM_ADDITION_COUNT,
} from '../../server/seed/masterInterviewProblemSeed.ts';
import { buildMasterProblemLesson } from '../../server/seed/masterProblemLessonAuthor.ts';

const inventory = MASTER_INTERVIEW_PROBLEM_ADDITIONS;
const normalize = (value) => value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

test('master interview inventory contains exactly 293 topic-scoped records across 22 topics', () => {
  assert.equal(MASTER_INTERVIEW_PROBLEM_ADDITION_COUNT, 293);
  assert.equal(inventory.length, 293);
  assert.equal(new Set(inventory.map((item) => item.slug)).size, 293, 'Every record must have a unique topic-scoped slug');
  assert.equal(new Set(inventory.map((item) => item.topicId)).size, 22, 'Expected 22 canonical topic IDs');

  const topicTitleKeys = inventory.map((item) => item.topicId + ':' + normalize(item.title));
  assert.equal(new Set(topicTitleKeys).size, 293, 'A topic must not contain duplicate normalized problem titles');
});

test('every inventory record has valid metadata and explicit review status', () => {
  for (const item of inventory) {
    assert.ok(item.slug && item.title && item.topicId && item.topic, 'Missing canonical identity fields');
    assert.ok(['Easy', 'Medium', 'Hard'].includes(item.difficulty), item.slug + ': invalid difficulty');
    assert.equal(item.catalogStatus, 'review', item.slug + ': inventory must not claim authored status');
    assert.equal(item.contentStatus, 'in-progress', item.slug + ': content must remain in progress');
    assert.ok(Array.isArray(item.aliases) && Array.isArray(item.relatedTitles));
  }
});

test('all 293 records generate a five-stage blueprint without inventing official statements or tests', () => {
  const requiredStages = ['understand', 'visualize', 'implement', 'practice', 'master'];
  const requiredEvidence = [
    'official-statement',
    'official-examples',
    'official-constraints',
    'problem-specific-java',
    'problem-specific-javascript',
    'problem-specific-python',
    'executable-tests',
    'visual-trace-validation',
  ];

  for (const item of inventory) {
    const lesson = buildMasterProblemLesson(item);
    assert.ok(lesson.statement.includes('curriculum-generated paraphrase'), item.slug + ': statement must disclose generated status');
    assert.ok(lesson.statement.includes('not an official platform statement'), item.slug + ': statement must not impersonate a source');
    assert.deepEqual(lesson.examples, [], item.slug + ': do not fabricate official examples');
    assert.deepEqual(lesson.constraints, [], item.slug + ': do not fabricate official constraints');

    for (const stage of requiredStages) {
      assert.ok(lesson.stages[stage], item.slug + ': missing stage ' + stage);
    }

    const implementation = lesson.stages.implement;
    assert.equal(implementation.languageStatus, 'blueprint-not-submission', item.slug + ': generated checklists are not verified code');
    for (const language of ['java', 'javascript', 'python']) {
      assert.ok(implementation[language].includes('checklist'), item.slug + ': missing ' + language + ' authoring checklist');
      assert.ok(implementation[language].includes('verified problem-specific'), item.slug + ': must disclose that a real submission is still required');
    }

    assert.equal(lesson.authoringMetadata.status, 'draft-needs-problem-specific-verification');
    for (const evidence of requiredEvidence) {
      assert.ok(lesson.authoringMetadata.missingEvidence.includes(evidence), item.slug + ': missing evidence marker ' + evidence);
    }
    assert.equal(lesson.stages.practice.officialExamplesRequired, true);
    assert.equal(lesson.stages.practice.officialConstraintsRequired, true);
    assert.ok(lesson.stages.master.quiz.length >= 4);
  }
});
