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


import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('arrays Java and Python examples execute against expected outputs', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'arrays');
  const javaExamples = lesson.codeExamples.filter((item) => item.language.startsWith('Java'));
  const pythonExample = lesson.codeExamples.find((item) => item.language.startsWith('Python'));
  const directory = mkdtempSync(join(tmpdir(), 'tutorial-hub-dsa-arrays-'));
  try {
    const javaSource = [
      'import java.util.Arrays;',
      'public class ArrayLessonExamples {',
      ...javaExamples.map((item) => item.code),
      'public static void main(String[] args) {',
      'long[] prefix = buildPrefix(new int[]{3, -2, 5, 1});',
      'if (!Arrays.equals(prefix, new long[]{0, 3, 1, 6, 7})) throw new AssertionError(Arrays.toString(prefix));',
      'if (sumRange(prefix, 1, 4) != 4L) throw new AssertionError("range sum");',
      'int[] values = {3, 2, 2, 4, 2, 5};',
      'int length = removeValue(values, 2);',
      'if (length != 3 || !Arrays.equals(Arrays.copyOf(values, length), new int[]{3, 4, 5})) throw new AssertionError("stable compaction");',
      '}',
      '}'
    ].join('\n');
    writeFileSync(join(directory, 'ArrayLessonExamples.java'), javaSource);
    const compile = spawnSync('javac', ['ArrayLessonExamples.java'], { cwd: directory, encoding: 'utf8' });
    assert.equal(compile.status, 0, compile.stderr || compile.stdout);
    const execute = spawnSync('java', ['ArrayLessonExamples'], { cwd: directory, encoding: 'utf8' });
    assert.equal(execute.status, 0, execute.stderr || execute.stdout);

    const pythonSource = pythonExample.code + '\nassert build_prefix([3, -2, 5, 1]) == [0, 3, 1, 6, 7]\nassert sum_range(build_prefix([3, -2, 5, 1]), 1, 4) == 4\n';
    writeFileSync(join(directory, 'array_lesson_examples.py'), pythonSource);
    const python = spawnSync('python', ['array_lesson_examples.py'], { cwd: directory, encoding: 'utf8' });
    assert.equal(python.status, 0, python.stderr || python.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
