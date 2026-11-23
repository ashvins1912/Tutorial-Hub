import assert from 'node:assert/strict';
import test from 'node:test';
import { DSA_COMPLETE_LESSONS } from '../../src/data/dsaCompleteLessons.ts';

const required = [
  ['queue-deep-dive', 8],
  ['sorting-algorithms', 14],
  ['searching-algorithms', 15],
  ['binary-search-on-answer', 16],
  ['bit-manipulation', 17],
];

test('handwritten-notes topics are integrated with source page references', () => {
  const ids = DSA_COMPLETE_LESSONS.map((lesson) => lesson.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson IDs must be unique');

  for (const [id, page] of required) {
    const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === id);
    assert.ok(lesson, 'missing source-aligned lesson: ' + id);
    assert.deepEqual(lesson.sourcePages, [page], id + ' must retain its handwritten PDF source page');
    assert.ok(lesson.promise.length >= 40, id + ' needs a clear learning promise');
    assert.ok(lesson.mentalModel.length >= 80, id + ' needs a plain-English mental model');

    for (const field of ['concepts', 'recognition', 'method', 'workedExample', 'complexity', 'pitfalls', 'practice', 'interviewChecks']) {
      assert.ok(Array.isArray(lesson[field]) && lesson[field].length >= 4, id + ' needs a complete ' + field + ' section');
    }
    assert.ok(lesson.practice.every((item) => item.task && item.goal && ['Warm-up', 'Core', 'Challenge', 'Transfer'].includes(item.level)),
      id + ' practice items need a level, task and goal');
  }
});

test('source-aligned lessons keep a complete mastery practice ladder', () => {
  for (const [id] of required) {
    const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === id);
    for (const level of ['Warm-up', 'Core', 'Challenge', 'Transfer']) {
      assert.ok(lesson.practice.some((item) => item.level === level), id + ' is missing ' + level);
    }
  }
});
