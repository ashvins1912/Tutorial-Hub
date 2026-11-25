import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { DP_PRACTICE_PROBLEMS } from '../../src/data/dpPracticeProblems.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'src/components/DpLearningLab.tsx'), 'utf8');

test('DP practice inventory contains 20 complete, unique problem briefs', () => {
  assert.equal(DP_PRACTICE_PROBLEMS.length, 20);
  const names = DP_PRACTICE_PROBLEMS.map((problem) => problem.name);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual([...new Set(DP_PRACTICE_PROBLEMS.map((problem) => problem.level))].sort(),
    ['Advanced', 'Challenge', 'Core', 'Warm-up'].sort());
  for (const problem of DP_PRACTICE_PROBLEMS) {
    assert.ok(problem.goal.trim(), problem.name + ': missing goal');
    assert.ok(problem.statement.length >= 45, problem.name + ': statement too thin');
    assert.ok(problem.example.trim(), problem.name + ': missing example');
    assert.ok(problem.hint.length >= 35, problem.name + ': missing hint');
  }
  const example = (name) => DP_PRACTICE_PROBLEMS.find((problem) => problem.name === name)?.example;
  assert.match(example('Climbing Stairs'), /n=3.*3/);
  assert.match(example('Decode Ways'), /226.*3/);
  assert.match(example('Coin Change'), /amount=11.*3/);
  assert.match(example('Target Sum'), /target=3.*5/);
  assert.match(example('Stock with Cooldown'), /\[1,2,3,0,2\].*3/);
  assert.match(example('Burst Balloons'), /167/);
  assert.match(example('Traveling Salesperson \/ Assignment DP'), /\[\[0,10,15,20\]/);
  assert.match(example('Traveling Salesperson \/ Assignment DP'), /80/);
  assert.match(example('Regular Expression Matching'), /a\*/);
});

test('DP guided lessons have all eight numbered steps and explicit arithmetic bounds', () => {
  assert.match(source, /export const DP_GUIDED_LESSONS/);
  for (let i = 1; i <= 8; i++) assert.match(source, new RegExp("title: '" + i + "\\."));
  assert.match(source, /n > 91/);
  assert.match(source, /Math\.addExact/);
  assert.match(source, /long\[\] dp/);
  assert.match(source, /codePoints\(\)/);
  assert.match(source, /for \(int k = l; k < r; k\+\+\)/);
});

test('DP lab UI exposes accessible lesson, hint, and practice states', () => {
  assert.match(source, /aria-pressed=\{i === lessonIndex\}/);
  assert.match(source, /aria-current=\{i === lessonIndex \? 'step' : undefined\}/);
  assert.match(source, /h-11 w-11/);
  assert.match(source, /aria-expanded=\{showAnswer\}/);
  assert.match(source, /aria-controls="dp-lesson-hint"/);
  assert.match(source, /aria-pressed=\{isDone\}/);
  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /problem\.statement/);
  assert.match(source, /problem\.example/);
  assert.match(source, /problem\.hint/);
  assert.match(source, /tabIndex=\{0\}/);
  assert.match(source, /aria-pressed=\{filter === g\}/);
  assert.match(source, /doneCount\/\{DP_PRACTICE_PROBLEMS\.length\}/);
});
