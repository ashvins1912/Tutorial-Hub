import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import { DSA_COMPLETE_LESSONS } from '../../src/data/dsaCompleteLessons.ts';

const examples = DSA_COMPLETE_LESSONS.flatMap((lesson) =>
  lesson.codeExamples.map((example) => ({ lessonId: lesson.id, ...example })),
);
const javaExamples = examples.filter((example) => example.language === 'Java 21');
const javascriptExamples = examples.filter((example) => example.language === 'JavaScript (Node.js)');
const pythonExamples = examples.filter((example) => example.language === 'Python 3');
const hasJdk = spawnSync('javac', ['-version'], { encoding: 'utf8' }).status === 0;
const pythonCommand = spawnSync('python3', ['--version'], { encoding: 'utf8' }).status === 0 ? 'python3' : null;

test('every DSA JavaScript course code example parses', () => {
  assert.ok(javascriptExamples.length > 0);
  for (const example of javascriptExamples) {
    assert.doesNotThrow(() => new vm.Script(example.code), example.lessonId + ': ' + example.title);
  }
});

test('every DSA Python course code example compiles', { skip: !pythonCommand }, () => {
  assert.ok(pythonExamples.length > 0);
  const dir = mkdtempSync(path.join(os.tmpdir(), 'dsa-python-syntax-'));
  try {
    const files = [];
    pythonExamples.forEach((example, index) => {
      const file = path.join(dir, 'snippet_' + index + '.py');
      writeFileSync(file, example.code + '\n', 'utf8');
      files.push(file);
    });
    execFileSync(pythonCommand, ['-m', 'py_compile', ...files], { stdio: 'pipe' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('every DSA Java course code example compiles as a snippet', { skip: !hasJdk }, () => {
  assert.ok(javaExamples.length > 0);
  const dir = mkdtempSync(path.join(os.tmpdir(), 'dsa-java-syntax-'));
  try {
    const files = [];
    javaExamples.forEach((example, index) => {
      let code = example.code;
      const stubs = [];
      if (/\bNode\b/.test(code) && !/\bclass\s+Node\b/.test(code)) {
        stubs.push('static class Node { int value; Node left, right, next; Node(int v) { value = v; } }');
      }
      if (/\bListNode\b/.test(code) && !/\bclass\s+ListNode\b/.test(code)) {
        stubs.push('static class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }');
      }
      const source = 'import java.util.*;\nimport java.util.stream.*;\nclass DsaSnippet' + index + ' {\n' + stubs.join('\n') + '\n' + code + '\n}\n';
      const file = path.join(dir, 'DsaSnippet' + index + '.java');
      writeFileSync(file, source, 'utf8');
      files.push(file);
    });
    execFileSync('javac', ['-d', dir, ...files], { stdio: 'pipe' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
