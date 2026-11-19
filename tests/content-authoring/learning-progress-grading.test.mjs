import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuizScore, buildAccessibleLessonFilter } from '../../server/routes/learningProgressRoutes.ts';

const quiz = [
  { correctAnswer: 'B' },
  { correctAnswer: ['A', 'C'] },
];

test('server-side quiz grading calculates single and multiple-choice answers', () => {
  assert.equal(calculateQuizScore(quiz, { '0': 'B', '1': 'C|A' }), 2);
  assert.equal(calculateQuizScore(quiz, { '0': 'A', '1': 'A|C' }), 1);
});

test('server-side quiz grading rejects incomplete or extra answer keys', () => {
  assert.equal(calculateQuizScore(quiz, { '0': 'B' }), null);
  assert.equal(calculateQuizScore(quiz, { '0': 'B', '1': 'A|C', '2': 'anything' }), null);
});

test('learner access permits the owner or a published lesson, not another private draft', () => {
  const filter = buildAccessibleLessonFilter('lesson-123', 'learner-456');
  assert.equal(filter._id, 'lesson-123');
  assert.deepEqual(filter.$or, [
    { ownerId: 'learner-456' },
    { publishedAt: { $type: 'date' } },
  ]);
});
