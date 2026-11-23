import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLessonSimulator } from '../../src/features/intelligent-engine/components/lessonSimulatorContract.ts';

test('accepts a lesson-bound binary search simulator contract', () => {
  const simulator = validateLessonSimulator({
    schemaVersion: 1,
    id: 'binary-search-lower-bound',
    kind: 'algorithm-trace',
    title: 'Trace lower-bound search',
    description: 'Narrow the sorted interval while preserving the lower-bound invariant.',
    algorithm: 'binary-search',
    initialInput: '1, 3, 5, 7, 9',
    target: '6',
    objectiveIds: ['Maintain a valid interval'],
  }, ['Maintain a valid interval']);
  assert.equal(simulator?.algorithm, 'binary-search');
  assert.equal(simulator?.id, 'binary-search-lower-bound');
  assert.deepEqual(simulator?.objectiveIds, ['Maintain a valid interval']);
});

test('rejects unsupported, malformed, or unbounded simulator configuration', () => {
  assert.equal(validateLessonSimulator({ schemaVersion: 1, id: 'bad', kind: 'generic', title: 'Generic', description: 'Wrong topic', algorithm: 'bubble-sort', initialInput: '1,2' }), null);
  assert.equal(validateLessonSimulator({ schemaVersion: 1, id: 'bad', kind: 'algorithm-trace', title: 'Search', description: 'Search', algorithm: 'binary-search', initialInput: '1,2' }), null);
  assert.equal(validateLessonSimulator({ schemaVersion: 1, id: 'x'.repeat(81), kind: 'algorithm-trace', title: 'Sort', description: 'Sort', algorithm: 'bubble-sort', initialInput: '1,2' }), null);
});

test('rejects unknown and duplicate lesson objective bindings', () => {
  const base = { schemaVersion: 1, id: 'sort-trace', kind: 'algorithm-trace', title: 'Sort trace', description: 'Trace sorting.', algorithm: 'bubble-sort', initialInput: '3, 2, 1' };
  assert.equal(validateLessonSimulator({ ...base, objectiveIds: ['unknown'] }, ['Known objective']), null);
  assert.equal(validateLessonSimulator({ ...base, objectiveIds: ['Known objective', 'Known objective'] }, ['Known objective']), null);
  assert.equal(validateLessonSimulator({ ...base, objectiveIds: ['Known objective'] }, ['Known objective'])?.objectiveIds?.[0], 'Known objective');
});

test('rejects binary search simulator inputs that violate sorted preconditions', () => {
  assert.equal(validateLessonSimulator({
    schemaVersion: 1, id: 'invalid-order', kind: 'algorithm-trace',
    title: 'Binary search', description: 'Search a sorted list.',
    algorithm: 'binary-search', initialInput: '9, 2, 5', target: '5',
  }), null);
});
