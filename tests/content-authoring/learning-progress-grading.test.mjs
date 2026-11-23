import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuizScore, calculateObjectiveResults, aggregateObjectiveMastery, buildAccessibleLessonFilter } from '../../server/routes/learningProgressRoutes.ts';

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


test('objective scoring attributes each question to its linked objectives', () => {
  const objectiveQuiz = [
    { correctAnswer: 'B', objectiveIds: ['Understand invariants', 'Trace binary search'] },
    { correctAnswer: ['A', 'C'], objectiveIds: ['Trace binary search'] },
    { correctAnswer: 'D' },
  ];
  assert.deepEqual(calculateObjectiveResults(objectiveQuiz, { '0': 'B', '1': 'A', '2': 'D' }), [
    { objectiveId: 'Trace binary search', correct: 1, total: 2, accuracy: 50 },
    { objectiveId: 'Understand invariants', correct: 1, total: 1, accuracy: 100 },
  ]);
});

test('objective mastery aggregates evidence across attempts and assigns review status', () => {
  const mastery = aggregateObjectiveMastery([
    { attemptedAt: '2026-11-01T10:00:00Z', objectiveResults: [
      { objectiveId: 'A', correct: 1, total: 2 },
      { objectiveId: 'B', correct: 0, total: 1 },
    ] },
    { attemptedAt: '2026-11-02T10:00:00Z', objectiveResults: [
      { objectiveId: 'A', correct: 2, total: 2 },
      { objectiveId: 'B', correct: 1, total: 1 },
    ] },
  ]);
  assert.deepEqual(mastery.map(({ objectiveId, correct, total, attempts, accuracy, status }) => ({ objectiveId, correct, total, attempts, accuracy, status })), [
    { objectiveId: 'A', correct: 3, total: 4, attempts: 2, accuracy: 75, status: 'developing' },
    { objectiveId: 'B', correct: 1, total: 2, attempts: 2, accuracy: 50, status: 'developing' },
  ]);
});
