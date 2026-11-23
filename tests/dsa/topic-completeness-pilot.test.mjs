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


test('strings topic satisfies the complete learning-unit contract', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'strings');
  assert.ok(lesson, 'strings lesson must exist');
  const required = ['learningOutcomes', 'prerequisites', 'deepDive', 'correctness', 'implementationSteps', 'codeExamples', 'traceExercises', 'realWorldApplications', 'assessment', 'revisionPrompts'];
  for (const field of required) {
    assert.ok(Array.isArray(lesson[field]) && lesson[field].length >= 3, 'strings lesson requires substantive ' + field);
  }
  assert.ok(lesson.codeExamples.some((item) => item.language.startsWith('Java')));
  assert.ok(lesson.codeExamples.some((item) => item.language.startsWith('Python')));
  assert.ok(lesson.deepDive.some((item) => /KMP/.test(item)));
  assert.ok(lesson.deepDive.some((item) => /Unicode/.test(item)));
  assert.ok(lesson.correctness.some((item) => /invariant/i.test(item)));
  assert.ok(lesson.assessment.length >= 5);
});

test('strings Java and Python examples execute against expected outputs', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'strings');
  const javaExamples = lesson.codeExamples.filter((item) => item.language.startsWith('Java'));
  const pythonExample = lesson.codeExamples.find((item) => item.language.startsWith('Python'));
  const directory = mkdtempSync(join(tmpdir(), 'tutorial-hub-dsa-strings-'));
  try {
    const javaSource = [
      'import java.util.*;',
      'public class StringLessonExamples {',
      ...javaExamples.map((item) => item.code),
      'public static void main(String[] args) {',
      'if (!areAnagrams("listen", "silent")) throw new AssertionError("anagram true");',
      'if (areAnagrams("listen", "silence")) throw new AssertionError("anagram false");',
      'if (!Arrays.equals(kmpMatches("ababcabcabababd", "ababd"), new int[]{10})) throw new AssertionError("KMP match");',
      'if (!Arrays.equals(kmpMatches("aaaa", "aa"), new int[]{0, 1, 2})) throw new AssertionError("overlapping matches");',
      'if (!Arrays.equals(kmpMatches("abc", ""), new int[]{0, 1, 2, 3})) throw new AssertionError("empty pattern");',
      '}',
      '}'
    ].join('\n');
    writeFileSync(join(directory, 'StringLessonExamples.java'), javaSource);
    const compile = spawnSync('javac', ['StringLessonExamples.java'], { cwd: directory, encoding: 'utf8' });
    assert.equal(compile.status, 0, compile.stderr || compile.stdout);
    const execute = spawnSync('java', ['StringLessonExamples'], { cwd: directory, encoding: 'utf8' });
    assert.equal(execute.status, 0, execute.stderr || execute.stdout);

    const pythonSource = pythonExample.code + '\nassert is_ascii_alphanumeric_palindrome("A man, a plan, a canal: Panama")\nassert not is_ascii_alphanumeric_palindrome("race a car")\nassert is_ascii_alphanumeric_palindrome("")\n';
    writeFileSync(join(directory, 'string_lesson_examples.py'), pythonSource);
    const python = spawnSync('python', ['string_lesson_examples.py'], { cwd: directory, encoding: 'utf8' });
    assert.equal(python.status, 0, python.stderr || python.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});


test('linked-list topic satisfies the complete learning-unit contract', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'linked-list');
  assert.ok(lesson, 'linked-list lesson must exist');
  const required = ['learningOutcomes', 'prerequisites', 'deepDive', 'correctness', 'implementationSteps', 'codeExamples', 'traceExercises', 'realWorldApplications', 'assessment', 'revisionPrompts'];
  for (const field of required) {
    const minimum = field === 'codeExamples' ? 1 : 3;
    assert.ok(Array.isArray(lesson[field]) && lesson[field].length >= minimum, 'linked-list lesson requires substantive ' + field);
  }
  assert.ok(lesson.codeExamples.some((item) => item.language.startsWith('Java')));
  assert.ok(lesson.correctness.some((item) => /invariant/i.test(item)));
  assert.ok(lesson.deepDive.some((item) => /Floyd/.test(item)));
  assert.ok(lesson.assessment.length >= 5);
});

test('linked-list Java examples execute against expected outputs', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'linked-list');
  const javaExamples = lesson.codeExamples.filter((item) => item.language.startsWith('Java'));
  const directory = mkdtempSync(join(tmpdir(), 'tutorial-hub-dsa-linked-list-'));
  try {
    const javaSource = [
      'public class LinkedListLessonExamples {',
      ...javaExamples.map((item) => item.code),
      'public static void main(String[] args) {',
      'Node a = new Node(1), b = new Node(2), c = new Node(3);',
      'a.next = b; b.next = c;',
      'Node reversed = reverse(a);',
      'if (reversed != c || reversed.next != b || b.next != a || a.next != null) throw new AssertionError("reverse links");',
      'if (hasCycle(reversed)) throw new AssertionError("acyclic list");',
      'Node x = new Node(7); x.next = x;',
      'if (!hasCycle(x)) throw new AssertionError("self cycle");',
      'Node p = new Node(4), q = new Node(5), r = new Node(6);',
      'p.next = q; q.next = r; r.next = q;',
      'if (!hasCycle(p)) throw new AssertionError("middle cycle");',
      '}',
      '}'
    ].join('\n');
    writeFileSync(join(directory, 'LinkedListLessonExamples.java'), javaSource);
    const compile = spawnSync('javac', ['LinkedListLessonExamples.java'], { cwd: directory, encoding: 'utf8' });
    assert.equal(compile.status, 0, compile.stderr || compile.stdout);
    const execute = spawnSync('java', ['LinkedListLessonExamples'], { cwd: directory, encoding: 'utf8' });
    assert.equal(execute.status, 0, execute.stderr || execute.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});


test('stack and queue topic satisfies the complete learning-unit contract', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'stacks-queues');
  assert.ok(lesson, 'stack and queue lesson must exist');
  const required = ['learningOutcomes', 'prerequisites', 'deepDive', 'correctness', 'implementationSteps', 'codeExamples', 'traceExercises', 'realWorldApplications', 'assessment', 'revisionPrompts'];
  for (const field of required) {
    const minimum = field === 'codeExamples' ? 2 : 3;
    assert.ok(Array.isArray(lesson[field]) && lesson[field].length >= minimum, 'stack/queue lesson requires substantive ' + field);
  }
  assert.ok(lesson.codeExamples.some((item) => item.language.startsWith('Java')));
  assert.ok(lesson.correctness.some((item) => /invariant/i.test(item)));
  assert.ok(lesson.deepDive.some((item) => /amortized/i.test(item)));
  assert.ok(lesson.assessment.length >= 5);
});

test('stack and queue Java examples execute against expected outputs', () => {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === 'stacks-queues');
  const javaExamples = lesson.codeExamples.filter((item) => item.language.startsWith('Java'));
  const directory = mkdtempSync(join(tmpdir(), 'tutorial-hub-dsa-stack-queue-'));
  try {
    const javaSource = [
      'import java.util.*;',
      'public class StackQueueLessonExamples {',
      ...javaExamples.map((item) => item.code),
      'public static void main(String[] args) {',
      'TwoStackQueue queue = new TwoStackQueue();',
      'queue.offer(1); queue.offer(2); queue.offer(3);',
      'if (queue.poll() != 1 || queue.poll() != 2) throw new AssertionError("FIFO order");',
      'queue.offer(4);',
      'if (queue.poll() != 3 || queue.poll() != 4 || !queue.isEmpty()) throw new AssertionError("queue transfer");',
      'if (!Arrays.equals(slidingMaximum(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3), new int[]{3, 3, 5, 5, 6, 7})) throw new AssertionError("window maximum");',
      'if (!Arrays.equals(slidingMaximum(new int[]{5, 5, 4}, 2), new int[]{5, 5})) throw new AssertionError("duplicate maxima");',
      '}',
      '}'
    ].join(\n);
    writeFileSync(join(directory, 'StackQueueLessonExamples.java'), javaSource);
    const compile = spawnSync('javac', ['StackQueueLessonExamples.java'], { cwd: directory, encoding: 'utf8' });
    assert.equal(compile.status, 0, compile.stderr || compile.stdout);
    const execute = spawnSync('java', ['StackQueueLessonExamples'], { cwd: directory, encoding: 'utf8' });
    assert.equal(execute.status, 0, execute.stderr || execute.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
