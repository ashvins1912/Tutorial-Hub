import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuizScore, calculateObjectiveResults, aggregateObjectiveMastery, buildObjectiveReviewPlan, selectQuizQuestions, buildAccessibleLessonFilter } from '../../server/routes/learningProgressRoutes.ts';

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


test('objective review scheduling uses performance-based spaced intervals', () => {
  const now = new Date('2026-11-24T12:00:00Z');
  const history = [{
    attemptedAt: '2026-11-24T12:00:00Z',
    objectiveResults: [
      { objectiveId: 'weak', correct: 0, total: 2 },
      { objectiveId: 'developing', correct: 3, total: 4 },
      { objectiveId: 'strong', correct: 4, total: 4 },
    ],
  }];
  const plan = buildObjectiveReviewPlan(history, now);
  assert.deepEqual(plan.map(({ objectiveId, intervalDays, status }) => ({ objectiveId, intervalDays, status })), [
    { objectiveId: 'weak', intervalDays: 1, status: 'scheduled' },
    { objectiveId: 'developing', intervalDays: 3, status: 'scheduled' },
    { objectiveId: 'strong', intervalDays: 14, status: 'scheduled' },
  ]);
});

test('objective review queue uses the latest valid attempt and marks overdue reviews', () => {
  const now = new Date('2026-11-24T12:00:00Z');
  const plan = buildObjectiveReviewPlan([
    { attemptedAt: '2026-11-01T12:00:00Z', objectiveResults: [{ objectiveId: 'A', correct: 0, total: 1 }] },
    { attemptedAt: '2026-11-23T12:00:00Z', objectiveResults: [{ objectiveId: 'A', correct: 1, total: 1 }] },
  ], now);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].intervalDays, 14);
  assert.equal(plan[0].status, 'scheduled');
  const due = buildObjectiveReviewPlan([
    { attemptedAt: '2026-11-01T12:00:00Z', objectiveResults: [{ objectiveId: 'A', correct: 0, total: 1 }] },
  ], now);
  assert.equal(due[0].status, 'due');
});


test('focused practice selects only valid, unique, bounded lesson question indexes', () => {
  const selected = selectQuizQuestions(quiz, [1]);
  assert.deepEqual(selected, { indexes: [1], questions: [quiz[1]] });
  assert.deepEqual(selectQuizQuestions(quiz).indexes, [0, 1]);
  assert.equal(selectQuizQuestions(quiz, []), null);
  assert.equal(selectQuizQuestions(quiz, [0, 0]), null);
  assert.equal(selectQuizQuestions(quiz, [2]), null);
  assert.equal(selectQuizQuestions(quiz, ['1']), null);
});

test('focused practice grading scores the selected objective questions only', () => {
  const selected = selectQuizQuestions([
    { correctAnswer: 'B', objectiveIds: ['A'] },
    { correctAnswer: 'C', objectiveIds: ['B'] },
    { correctAnswer: 'D', objectiveIds: ['A'] },
  ], [0, 2]);
  assert.ok(selected);
  assert.equal(calculateQuizScore(selected.questions, { '0': 'B', '1': 'D' }), 2);
  assert.deepEqual(calculateObjectiveResults(selected.questions, { '0': 'B', '1': 'D' }), [
    { objectiveId: 'A', correct: 2, total: 2, accuracy: 100 },
  ]);
});
