import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublishedLesson } from '../../server/modules/content-authoring/contentAuthoring.routes.ts';

test('published lesson payload never exposes quiz answer keys', () => {
  const published = sanitizePublishedLesson({
    title: 'Binary Search',
    quiz: [{ question: 'Which option?', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Review the midpoint.', objectiveIds: ['Understand the invariant'] }],
  });
  assert.deepEqual(published.quiz, [{
    question: 'Which option?',
    options: ['A', 'B'],
    explanation: 'Review the midpoint.',
    objectiveIds: ['Understand the invariant'],
  }]);
  assert.equal('correctAnswer' in published.quiz[0], false);
});
