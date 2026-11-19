import test from 'node:test';
import assert from 'node:assert/strict';
import { binarySearchTrace, bubbleSortTrace, parseInput } from '../../src/features/intelligent-engine/components/learningAlgorithms.ts';

test('binary search trace finds a target in sorted values', () => {
  const trace = binarySearchTrace([1, 3, 5, 7, 9], 7);
  assert.equal(trace.at(-1)?.variables.result, 3);
  assert.ok(trace.some((step) => step.title === 'Compare the middle value'));
});

test('binary search trace returns -1 when target is absent', () => {
  const trace = binarySearchTrace([2, 4, 6, 8], 5);
  assert.equal(trace.at(-1)?.variables.result, -1);
});

test('bubble sort trace sorts without mutating caller input', () => {
  const input = [5, 1, 4, 2];
  const trace = bubbleSortTrace(input);
  assert.deepEqual(trace.at(-1)?.values, [1, 2, 4, 5]);
  assert.deepEqual(input, [5, 1, 4, 2]);
});

test('input parser rejects non-numeric and oversized inputs', () => {
  assert.throws(() => parseInput('1, two, 3'), /finite numbers/);
  assert.throws(() => parseInput(Array.from({ length: 25 }, (_, i) => i).join(',')), /at most 12/);
});
