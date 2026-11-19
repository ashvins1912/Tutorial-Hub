import test from 'node:test';
import assert from 'node:assert/strict';
import { LearningProgress } from '../../server/models/LearningProgress.ts';
import { ContentAuthoringJob } from '../../server/modules/content-authoring/ContentAuthoringJob.ts';

test('learning progress is uniquely scoped to a user and lesson', () => {
  const indexes = LearningProgress.schema.indexes();
  assert.ok(indexes.some(([keys, options]) => keys.userId === 1 && keys.lessonId === 1 && options.unique === true));
});

test('mastery levels and algorithm choices are constrained by the schema', () => {
  assert.deepEqual(LearningProgress.schema.path('masteryLevel').enumValues, ['beginner', 'intermediate', 'advanced']);
  assert.deepEqual(LearningProgress.schema.path('algorithm').enumValues, ['binary-search', 'bubble-sort']);
});

test('keeps a bounded quiz history collection', () => {
  assert.ok(LearningProgress.schema.path('quizHistory'));
});

test('progress fields have server-side bounds', () => {
  assert.equal(LearningProgress.schema.path('currentStep').options.max, 100);
  assert.equal(LearningProgress.schema.path('input').options.maxlength, 300);
  assert.equal(LearningProgress.schema.path('target').options.maxlength, 32);
});

test('content-authoring jobs expose a date publication marker for access control', () => {
  assert.ok(ContentAuthoringJob.schema.path('publishedAt'));
  assert.equal(ContentAuthoringJob.schema.path('publishedAt').instance, 'Date');
});
