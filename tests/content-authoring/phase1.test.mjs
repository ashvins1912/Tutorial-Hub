import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent, normalizeUpload } from '../../server/modules/content-authoring/contentAuthoring.service.ts';

test('accepts and normalizes supported text formats', () => {
  const result = normalizeUpload('lesson.md', 'text/markdown', '\uFEFF# Binary Search\r\n\r\nSorted array search.');
  assert.equal(result.sourceFormat, 'md');
  assert.equal(result.content.startsWith('# Binary Search\n'), true);
  assert.equal(result.sha256.length, 64);
});

test('rejects unsupported binary formats and malformed JSON', () => {
  assert.throws(() => normalizeUpload('book.pdf', 'application/pdf', 'not extracted'), /Unsupported format/);
  assert.throws(() => normalizeUpload('lesson.json', 'application/json', '{bad'), /JSON/);
});

test('detects DSA concepts and proposes algorithm-specific learning blocks', () => {
  const source = '# Binary Search\n\nBinary search is an algorithm for a sorted array. Analyze time complexity and invariant.';
  const normalized = normalizeUpload('binary-search.md', 'text/markdown', source);
  const { analysis, draft } = analyzeContent('binary-search.md', normalized.sourceFormat, normalized.content);
  assert.equal(analysis.domain, 'DSA');
  assert.equal(analysis.kind, 'algorithm');
  assert.ok(analysis.outline.some((section) => section.id === 'trace'));
  assert.ok(analysis.recommendedVisualizations.includes('algorithm-animation'));
  assert.equal(draft.status, 'draft');
});

test('honors explicit universal JSON metadata', () => {
  const source = JSON.stringify({ schemaVersion: '1.0', content: { title: 'Indexing', domain: 'DATABASE', type: 'database_concept', level: 'advanced', prerequisites: ['B-Trees'] } });
  const normalized = normalizeUpload('indexing.json', 'application/json', source);
  const { analysis } = analyzeContent('indexing.json', normalized.sourceFormat, normalized.content);
  assert.equal(analysis.domain, 'DATABASE');
  assert.equal(analysis.kind, 'database_concept');
  assert.equal(analysis.level, 'advanced');
  assert.ok(analysis.outline.some((section) => section.id === 'schema'));
});
