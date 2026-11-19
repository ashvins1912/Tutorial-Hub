import test from 'node:test';
import assert from 'node:assert/strict';
import { AIAcademyProgress } from '../../server/models/AIAcademyProgress.ts';
import { gradeAcademyAnswer, isKnownAcademyLesson } from '../../server/routes/aiAcademyProgressRoutes.ts';

test('AI Academy progress is uniquely scoped to authenticated user and lesson', () => {
  const indexes = AIAcademyProgress.schema.indexes();
  assert.ok(indexes.some(([keys, options]) => keys.userId === 1 && keys.lessonId === 1 && options.unique === true));
});

test('AI Academy progress has server-owned completion and quiz fields', () => {
  assert.equal(AIAcademyProgress.schema.path('completed').instance, 'Boolean');
  assert.equal(AIAcademyProgress.schema.path('quizPassed').instance, 'Boolean');
  assert.equal(AIAcademyProgress.schema.path('quizAttempts').options.min, 0);
});

test('only curriculum lesson IDs are accepted', () => {
  assert.equal(isKnownAcademyLesson('python-data-model'), true);
  assert.equal(isKnownAcademyLesson('made-up-lesson'), false);
});

test('quiz answer is graded against server-side curriculum answer', () => {
  assert.equal(gradeAcademyAnswer('python-data-model', 1), true);
  assert.equal(gradeAcademyAnswer('python-data-model', 0), false);
  assert.equal(gradeAcademyAnswer('python-data-model', '1'), null);
  assert.equal(gradeAcademyAnswer('python-data-model', 99), null);
  assert.equal(gradeAcademyAnswer('unknown', 1), null);
});
