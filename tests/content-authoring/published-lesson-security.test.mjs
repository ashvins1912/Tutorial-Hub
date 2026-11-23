import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublishedLesson } from '../../server/modules/content-authoring/contentAuthoring.routes.ts';

test('published lesson payload never exposes quiz answer keys', () => {
  const published = sanitizePublishedLesson({
    title: 'Binary Search',
    quiz: [{ question: 'Which option?', options: ['A', 'B'], correctAnswer: 'B', explanation: 'Review the midpoint.' }],
  });
  assert.deepEqual(published.quiz, [{
    question: 'Which option?',
    options: ['A', 'B'],
    explanation: 'Review the midpoint.',
  }]);
  assert.equal('correctAnswer' in published.quiz[0], false);
});


test('published lesson retains its validated topic simulator binding', () => {
  const simulator = { id: 'trace-1', title: 'Binary search trace', kind: 'algorithm-trace', algorithm: 'binary-search', initialInput: '1, 3, 5', initialTarget: '3', objectiveIds: ['objective-1'] };
  const published = sanitizePublishedLesson({ title: 'Binary Search', simulator, quiz: [] });
  assert.deepEqual(published.simulator, simulator);
});
