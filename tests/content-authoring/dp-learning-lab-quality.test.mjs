import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { DP_PRACTICE_PROBLEMS } from '../../src/data/dpPracticeProblems.ts';
import { DP_GUIDED_LESSONS } from '../../src/data/dpGuidedLessons.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'src/components/DpLearningLab.tsx'), 'utf8');
const lessonSource = readFileSync(path.join(root, 'src/data/dpGuidedLessons.ts'), 'utf8');

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
  assert.match(lessonSource, /export const DP_GUIDED_LESSONS/);
  for (let i = 1; i <= 8; i++) assert.match(source, new RegExp("title: '" + i + "\\."));
  assert.match(lessonSource, /n > 91/);
  assert.match(lessonSource, /Math\.addExact/);
  assert.match(lessonSource, /long\[\] dp/);
  assert.match(lessonSource, /codePoints\(\)/);
  assert.match(lessonSource, /for \(int k = l; k < r; k\+\+\)/);
});

test('DP guided lessons have unique complete structures and accurate House Robber prefix state', () => {
  assert.equal(DP_GUIDED_LESSONS.length, 8);
  assert.equal(new Set(DP_GUIDED_LESSONS.map((lesson) => lesson.title)).size, 8);
  for (const lesson of DP_GUIDED_LESSONS) {
    for (const field of ['idea', 'state', 'recurrence', 'base', 'order', 'complexity', 'java', 'checkpoint']) {
      assert.ok(lesson[field]?.trim(), lesson.title + ': missing ' + field);
    }
  }
  const robber = DP_GUIDED_LESSONS.find((lesson) => lesson.title.includes('House Robber'));
  assert.ok(robber);
  assert.match(robber.state, /first i houses/i);
  assert.match(robber.base, /dp\[0\] = 0/);
  assert.match(robber.recurrence, /money\[i - 1\]/);
  assert.match(robber.java, /twoBack = 0L, oneBack = 0L/);
  assert.match(robber.complexity, /all-negative.*returns 0/i);
  assert.match(DP_GUIDED_LESSONS[5].order, /0\\/1.*descends.*Unbounded.*ascends/i);
  assert.match(DP_GUIDED_LESSONS[6].complexity, /code points/i);
});

test('DP lab UI exposes accessible lesson, hint, search, and practice states', () => {
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
