import test from 'node:test';
import assert from 'node:assert/strict';
import { binarySearchTrace, bubbleSortTrace, buildTracePrediction, parseInput } from '../../src/features/intelligent-engine/components/learningAlgorithms.ts';

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


test('trace prediction offers the actual next transition among distinct alternatives', () => {
  const trace = binarySearchTrace([1, 3, 5, 7, 9], 7);
  const prediction = buildTracePrediction(trace, 0);
  assert.ok(prediction);
  assert.equal(prediction.prompt, 'What happens in the next transition?');
  assert.ok(prediction.options.includes(prediction.correctOption));
  assert.equal(new Set(prediction.options).size, prediction.options.length);
  assert.ok(prediction.options.length >= 2);
});

test('trace prediction rotates the correct option and skips terminal frames', () => {
  const trace = bubbleSortTrace([3, 1, 2]);
  const first = buildTracePrediction(trace, 0);
  const second = buildTracePrediction(trace, 1);
  assert.ok(first && second);
  assert.notEqual(first.options.indexOf(first.correctOption), second.options.indexOf(second.correctOption));
  assert.equal(buildTracePrediction(trace, trace.length - 1), null);
  assert.equal(buildTracePrediction(trace, -1), null);
});

test('trace prediction safely skips traces without a distinct alternative', () => {
  const trace = [{ title: 'Done', explanation: 'Finished.', values: [], active: [], variables: {} }];
  assert.equal(buildTracePrediction(trace, 0), null);
});
