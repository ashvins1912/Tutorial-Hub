import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'src/components/CompleteDsaCourse.tsx'), 'utf8');

test('DSA course interactive controls expose their state to assistive technology', () => {
  assert.match(source, /aria-pressed=\{selected\}/, 'selected module should be announced as a toggle state');
  assert.match(source, /aria-pressed=\{checked\}/, 'mastery step should expose checked state');
  assert.match(source, /aria-expanded=\{isOpen\}/, 'section expansion state should be announced');
  assert.match(source, /aria-controls=.{0,80}dsa-section/, 'section button should reference its panel');
  assert.match(source, /id=.{0,80}dsa-section.{0,80}hidden=\{!isOpen\}/, 'controlled panel should remain in the DOM when collapsed');
});

test('DSA code walkthrough is keyboard-scrollable and linked to its explanation', () => {
  assert.match(source, /<pre tabIndex=\{0\}/, 'long code blocks should be keyboard focusable');
  assert.ok(source.includes('aria-label='));
  assert.ok(source.includes('aria-describedby='));
  assert.ok(source.includes('dsa-code-explanation-'));
  assert.match(source, /aria-hidden=\"true\"[^>]*>\{index \+ 1\}/, 'decorative line numbers should not be read as code');
});

test('DSA course search includes glossary, deep-dive, practice and code explanation text', () => {
  assert.match(source, /lesson\.keyTerms/);
  assert.match(source, /lesson\.deepDive/);
  assert.match(source, /lesson\.practice/);
  assert.match(source, /lesson\.codeExamples/);
  assert.doesNotMatch(source, /Runnable code examples/);
  assert.doesNotMatch(source, /Modules mastered/);
});
