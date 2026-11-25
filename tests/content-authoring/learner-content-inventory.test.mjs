import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('learner sentence inventory covers registered sources and labels candidates unreviewed', () => {
  const output = execFileSync(process.execPath, ['scripts/audit-learner-content-sentence-inventory.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  const inventory = JSON.parse(output);
  assert.ok(inventory.surfaceCount > 0);
  assert.ok(inventory.sourceCount > 100, 'expected broad registered-source coverage');
  assert.ok(inventory.sentenceUnitCount > 1000, 'expected extracted sentence candidates');
  assert.deepEqual(inventory.missingSources, []);
  assert.ok(inventory.sample.length > 0);
  assert.ok(inventory.sample.every((item) => item.reviewStatus === 'unreviewed'));
  assert.ok(inventory.sample.every((item) => item.sourcePath && item.line > 0 && item.sentence));
  assert.match(inventory.purpose, /does not prove/i);
});

test('DSA and published lesson code examples use readable line-numbered walkthroughs', async () => {
  const { readFileSync } = await import('node:fs');
  const dsaUi = readFileSync(path.join(root, 'src/components/CompleteDsaCourse.tsx'), 'utf8');
  const publishedUi = readFileSync(path.join(root, 'src/features/intelligent-engine/components/PublishedLessonView.tsx'), 'utf8');
  for (const source of [dsaUi, publishedUi]) {
    assert.match(source, /Code walkthrough|Code example/);
    assert.match(source, /(?:index|lineIndex) \+ 1/);
    assert.match(source, /How this code works|What the code is doing/);
  }
});

test('DSA Academy provides plain-language glossary entries across the course modules', () => {
  const { readFileSync } = await import('node:fs');
  const lessonData = readFileSync(path.join(root, 'src/data/dsaCompleteLessons.ts'), 'utf8');
  const glossaryBlocks = (lessonData.match(/keyTerms: /g) || []).length;
  assert.equal(glossaryBlocks, 23, 'expected a glossary block for each current DSA lesson');
  assert.match(lessonData, /"term":"Invariant"/);
  assert.match(lessonData, /"term":"Monotonic predicate"/);
  assert.match(lessonData, /"term":"Feasibility check"/);
});
