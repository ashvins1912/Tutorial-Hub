import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DSA_COMPLETE_LESSONS } from '../../src/data/dsaCompleteLessons.ts';

const arrayFields = [
  'keyTerms',
  'concepts',
  'recognition',
  'method',
  'workedExample',
  'complexity',
  'pitfalls',
  'interviewChecks',
  'learningOutcomes',
  'prerequisites',
  'deepDive',
  'correctness',
  'implementationSteps',
  'codeExamples',
  'traceExercises',
  'realWorldApplications',
  'assessment',
  'revisionPrompts',
];

function count(value) {
  return Array.isArray(value) ? value.length : 0;
}

test('DSA course has a complete structural inventory for all lesson modules', () => {
  assert.equal(DSA_COMPLETE_LESSONS.length, 23, 'DSA lesson count changed; update the audited inventory intentionally');
  const ids = DSA_COMPLETE_LESSONS.map((lesson) => lesson.id);
  assert.equal(new Set(ids).size, ids.length, 'DSA lesson IDs must be unique and stable');
  assert.ok(ids.every(Boolean));

  for (const lesson of DSA_COMPLETE_LESSONS) {
    assert.ok(lesson.title?.trim(), lesson.id + ': missing title');
    assert.ok(lesson.promise?.trim(), lesson.id + ': missing learning promise');
    assert.ok(count(lesson.keyTerms) > 0, lesson.id + ': add plain-language terms');
    assert.ok(count(lesson.concepts) > 0, lesson.id + ': add concept coverage');
    assert.ok(count(lesson.recognition) > 0, lesson.id + ': add recognition cues');
    assert.ok(count(lesson.method) > 0, lesson.id + ': add a method/checklist');
    assert.ok(count(lesson.workedExample) > 0, lesson.id + ': add worked-example steps');
    assert.ok(count(lesson.complexity) > 0, lesson.id + ': explain complexity');
    assert.ok(count(lesson.pitfalls) > 0, lesson.id + ': cover misconceptions/pitfalls');
    assert.ok(count(lesson.learningOutcomes) > 0, lesson.id + ': state learning outcomes');
    assert.ok(count(lesson.prerequisites) > 0, lesson.id + ': state prerequisites');
    assert.ok(count(lesson.implementationSteps) > 0, lesson.id + ': add implementation steps');
    assert.ok(count(lesson.codeExamples) > 0, lesson.id + ': include code examples');
    assert.ok(count(lesson.traceExercises) > 0, lesson.id + ': include trace exercises');
    assert.ok(count(lesson.assessment) > 0, lesson.id + ': include assessment');
    assert.ok(count(lesson.revisionPrompts) > 0, lesson.id + ': include revision prompts');

    for (const example of lesson.codeExamples) {
      assert.ok(example.language?.trim(), lesson.id + ': code example needs language');
      assert.ok(example.title?.trim(), lesson.id + ': code example needs title');
      assert.ok(example.code?.trim(), lesson.id + ': code example needs code');
      assert.ok(example.explanation?.trim(), lesson.id + ': code example needs explanation');
    }
  }
});

test('DSA course structure totals remain transparent and reviewable', () => {
  const totals = Object.fromEntries(arrayFields.map((field) => [
    field,
    DSA_COMPLETE_LESSONS.reduce((sum, lesson) => sum + count(lesson[field]), 0),
  ]));
  assert.equal(totals.keyTerms, 46);
  assert.equal(totals.concepts, 195);
  assert.equal(totals.workedExample, 111);
  assert.equal(totals.implementationSteps, 172);
  assert.equal(totals.codeExamples, 45);
  assert.equal(totals.traceExercises, 83);
  assert.equal(totals.assessment, 142);
  assert.equal(totals.practice, 115);
  assert.equal(totals.pitfalls, 138);
  assert.equal(totals.revisionPrompts, 120);
  assert.equal(totals.learningOutcomes, 129);
  assert.equal(totals.prerequisites, 82);
});


test('JavaScript sliding-window maximum matches brute force and bounds stale index retention', async () => {
  const { runInNewContext } = await import('node:vm');
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'stacks-queues');
  const example = lesson.codeExamples.find((item) => item.title === 'Queue with two stacks and sliding-window maximum');
  assert.ok(example, 'missing JavaScript sliding-window example');
  assert.match(example.code, /candidates\.splice\(0, head\)/, 'stale prefix must be compacted');
  assert.match(example.code, /head >= k/, 'compaction must bound retained stale indices by the window size');
  const module = { exports: {} };
  runInNewContext(example.code + '\nmodule.exports = { slidingMaximum };', { module });
  const slidingMaximum = module.exports.slidingMaximum;
  const cases = [
    { values: [5, 5, 5, 5, 5, 5], k: 2 },
    { values: [1, 2, 3, 4, 5, 6], k: 3 },
    { values: [6, 5, 4, 3, 2, 1], k: 4 },
    { values: [-8, 0, -8, 3, 3, -2], k: 3 },
    { values: [1], k: 1 },
  ];
  for (const { values, k } of cases) {
    const expected = Array.from({ length: values.length - k + 1 }, (_, i) => Math.max(...values.slice(i, i + k)));
    assert.deepEqual(Array.from(slidingMaximum(values, k)), expected);
  }
  assert.throws(() => slidingMaximum([1, 2], 0), /invalid window/);
  assert.throws(() => slidingMaximum([1, 2], 3), /invalid window/);
});
