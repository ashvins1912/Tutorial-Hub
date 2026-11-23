import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublishedLesson } from '../../server/modules/content-authoring/publishedLessonSanitizer.ts';

const validSimulator = {
  schemaVersion: 1, id: 'db-query-plan', kind: 'domain-prediction',
  scenario: 'database-query-plan', title: 'Query plan', description: 'Predict access paths.',
  objectiveIds: ['objective-1'],
};

test('published lesson keeps valid objective-bound domain simulator and removes quiz answer keys', () => {
  const result = sanitizePublishedLesson({
    title: 'Database indexes', learningObjectives: ['objective-1'],
    domainSimulator: validSimulator,
    quiz: [{ question: 'Q?', options: ['A', 'B'], correctAnswer: 'A', explanation: 'Because', objectiveIds: ['objective-1'] }],
  });
  assert.deepEqual(result.domainSimulator, validSimulator);
  assert.equal('correctAnswer' in result.quiz[0], false);
  assert.deepEqual(result.quiz[0].objectiveIds, ['objective-1']);
});

test('published lesson drops malformed or unrelated domain simulator configurations', () => {
  const result = sanitizePublishedLesson({
    title: 'Legacy lesson', learningObjectives: ['objective-1'],
    domainSimulator: { ...validSimulator, scenario: 'generic-animation' },
    quiz: [],
  });
  assert.equal('domainSimulator' in result, false);
});

test('published lesson drops domain simulator with stale objective references', () => {
  const result = sanitizePublishedLesson({
    title: 'Changed lesson', learningObjectives: ['objective-2'],
    domainSimulator: validSimulator, quiz: [],
  });
  assert.equal('domainSimulator' in result, false);
});
