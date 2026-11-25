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
    assert.ok(problem.example.trim(), problem.id + ': missing example input');
    assert.ok(problem.expectedOutput.trim(), problem.id + ': missing expected output');
    assert.doesNotMatch(problem.example, /standard example|matrix 1\.\.9|standard .* board/i, problem.id + ': example must be reproducible, not a reference to an unnamed standard case');
  }

  const byId = (id) => MATRIX_PROBLEMS.find((problem) => problem.id === id);
  assert.match(byId('m17').javaHint, /long total=.*low\+\(high-low\)\/2/i);
  assert.match(byId('m20').javaHint, /long for min\/max and midpoint/i);
  assert.match(byId('m21').javaHint, /even median/i);
  assert.match(byId('m24').javaHint, /long for deltas\/cumulative values/i);
  assert.match(byId('m37').javaHint, /long for accumulated path costs/i);
  assert.match(byId('m39').javaHint, /long for height×width area/i);
  assert.match(byId('m42').javaHint, /long prefix sums/i);
  assert.match(byId('m20').expectedOutput, /13/);
  assert.match(byId('m25').expectedOutput, /5/);
  assert.match(byId('m31').expectedOutput, /2/);
  assert.match(byId('m40').expectedOutput, /0,1,0/);
  assert.match(byId('m30').example, /\[\['X','X','X','X'\]/);
  assert.match(byId('m33').example, /ABCCED/);
});

test('matrix problem UI searches all visible problem fields and reports data-driven counts', () => {
  for (const field of ['problem.id', 'problem.title', 'problem.prompt', 'problem.approach', 'problem.complexity', 'problem.javaHint', 'problem.example', 'problem.expectedOutput']) {
    assert.ok(ui.includes(field), 'search omits ' + field);
  }
  assert.match(ui, /MATRIX_PROBLEMS\.length/);
  assert.match(ui, /new Set\(completed\.filter\(\(id\) => validIds\.has\(id\)\)\)/);
  assert.match(ui, /aria-pressed=\{isDone\}/);
  assert.match(ui, /aria-expanded=\{isOpen\}/);
  assert.match(ui, /aria-controls=.{0,80}matrix-problem/);
  assert.match(ui, /aria-label="Filter matrix problems by pattern"/);
  assert.match(ui, /aria-label="Filter matrix problems by difficulty"/);
  assert.match(ui, /problem\.example/);
  assert.match(ui, /problem\.expectedOutput/);
  assert.match(ui, /<pre tabIndex=\{0\}/);
});
