import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { MATRIX_PROBLEMS } from '../../src/data/matrixProblems.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ui = readFileSync(path.join(root, 'src/components/MatrixProblemBank.tsx'), 'utf8');

test('matrix problem bank has an exact, stable and structurally complete inventory', () => {
  assert.equal(MATRIX_PROBLEMS.length, 42);
  const ids = MATRIX_PROBLEMS.map((problem) => problem.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, Array.from({ length: 42 }, (_, index) => 'm' + String(index + 1).padStart(2, '0')));
  const groups = new Set(MATRIX_PROBLEMS.map((problem) => problem.group));
  assert.deepEqual([...groups].sort(), [
    'Backtracking', 'Dynamic Programming', 'Grid BFS/DFS', 'Optimization',
    'Prefix Sum', 'Search', 'Transformation', 'Traversal',
  ].sort());
  assert.deepEqual([...new Set(MATRIX_PROBLEMS.map((problem) => problem.level))].sort(),
    ['Advanced', 'Beginner', 'Intermediate'].sort());
  for (const problem of MATRIX_PROBLEMS) {
    assert.ok(problem.title.trim(), problem.id + ': title');
    assert.ok(problem.prompt.trim(), problem.id + ': prompt');
    assert.ok(problem.approach.trim(), problem.id + ': approach');
    assert.ok(problem.complexity.trim(), problem.id + ': complexity assumptions');
    assert.ok(problem.javaHint.trim(), problem.id + ': implementation hint');
  }
});

test('matrix problem UI searches all visible problem fields and reports data-driven counts', () => {
  for (const field of ['problem.id', 'problem.title', 'problem.prompt', 'problem.approach', 'problem.complexity', 'problem.javaHint']) {
    assert.ok(ui.includes(field), 'search omits ' + field);
  }
  assert.match(ui, /MATRIX_PROBLEMS\.length/);
  assert.match(ui, /new Set\(completed\.filter\(\(id\) => validIds\.has\(id\)\)\)/);
  assert.match(ui, /aria-pressed=\{isDone\}/);
  assert.match(ui, /aria-expanded=\{isOpen\}/);
  assert.match(ui, /aria-controls=.{0,80}matrix-problem/);
  assert.match(ui, /aria-label="Filter matrix problems by pattern"/);
  assert.match(ui, /aria-label="Filter matrix problems by difficulty"/);
});
