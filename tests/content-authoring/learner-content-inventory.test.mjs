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
