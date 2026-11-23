import assert from 'node:assert/strict';
import test from 'node:test';
import { DSA_COMPLETE_LESSONS } from '../../src/data/dsaCompleteLessons.ts';

test('arrays pilot is a complete learning unit, not only an outline', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'arrays');
  assert.ok(lesson, 'arrays lesson must exist');
  const required = ['learningOutcomes', 'prerequisites', 'deepDive', 'correctness', 'implementationSteps', 'codeExamples', 'traceExercises', 'realWorldApplications', 'assessment', 'revisionPrompts'];
  for (const field of required) {
    assert.ok(Array.isArray(lesson[field]) && lesson[field].length >= 3, 'arrays lesson requires substantive ' + field);
  }
  assert.ok(lesson.codeExamples.every((item) => item.language && item.title && item.code && item.explanation));
  assert.ok(lesson.codeExamples.some((item) => item.language.startsWith('Java')));
  assert.ok(lesson.codeExamples.some((item) => item.language.startsWith('Python')));
  assert.ok(lesson.correctness.some((item) => /invariant/i.test(item)));
  assert.ok(lesson.assessment.length >= 5, 'assessment must test transfer, edge cases and complexity');
});
