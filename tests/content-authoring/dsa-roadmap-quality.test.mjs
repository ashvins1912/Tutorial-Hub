import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { COMPLETE_DSA_ROADMAP } from '../../src/data/completeDsaRoadmap.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ui = readFileSync(path.join(root, 'src/components/CompleteDsaRoadmap.tsx'), 'utf8');

test('DSA roadmap has a stable 55-topic inventory with full outcome, pitfall and practice scaffolds', () => {
  assert.equal(COMPLETE_DSA_ROADMAP.length, 55);
  const ids = new Set(COMPLETE_DSA_ROADMAP.map((topic) => topic.id));
  assert.equal(ids.size, COMPLETE_DSA_ROADMAP.length);
  assert.deepEqual([...new Set(COMPLETE_DSA_ROADMAP.map((topic) => topic.level))].sort(),
    ['Advanced', 'Core', 'Expert', 'Foundation', 'Intermediate'].sort());
  for (const topic of COMPLETE_DSA_ROADMAP) {
    assert.ok(topic.title.trim(), topic.id + ': title');
    assert.ok(topic.group.trim(), topic.id + ': group');
    assert.ok(topic.subtopics.length > 0, topic.id + ': subtopics');
    assert.ok(topic.recognition.length > 0, topic.id + ': recognition signals');
    assert.ok(topic.outcomes.length > 0, topic.id + ': outcomes');
    assert.ok(topic.pitfalls.length >= 3, topic.id + ': pitfalls');
    assert.ok(topic.practice.length >= 4, topic.id + ': guided practice');
    assert.ok(topic.pitfalls[0].includes(topic.title), topic.id + ': contextual pitfall');
    assert.ok(topic.practice[0].includes(topic.title), topic.id + ': contextual practice');
    assert.doesNotMatch(topic.practice.join(' '), /Concept check|Guided trace|Independent implementation|Unseen variation/);
    for (const prerequisite of topic.prerequisites) assert.ok(ids.has(prerequisite), topic.id + ': unknown prerequisite ' + prerequisite);
  }
});

test('DSA roadmap UI searches and renders all learning dispositions and exposes progress state', () => {
  for (const field of ['item.outcomes', 'item.prerequisites', 'item.pitfalls', 'item.practice']) assert.ok(ui.includes(field), 'search omits ' + field);
  assert.match(ui, /activeTopic\.outcomes\.map/);
  assert.match(ui, /activeTopic\.practice\.map/);
  assert.match(ui, /activeTopic\.pitfalls\.map/);
  assert.match(ui, /aria-pressed=\{selected\}/);
  assert.match(ui, /aria-pressed=\{checked\}/);
  assert.match(ui, /aria-pressed=\{levelFilter === 'All'\}/);
  assert.match(ui, /completedSet\.has\(item\.id\)/);
  assert.match(ui, /activeGateSet\.size/);
  assert.match(ui, /Topics self-marked mastered/);
  assert.match(ui, /Practice prompts \(scaffolds\)/);
  assert.match(ui, /not complete problem statements, worked solutions or proof notes/);
  assert.match(ui, /role="status"/);
  assert.doesNotMatch(ui, /moves from a plain-English mental model to proof, implementation, independent practice and unfamiliar variations/);
});
