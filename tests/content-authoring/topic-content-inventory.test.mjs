import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('topic inventory extracts canonical ID/title candidates without asserting quality', () => {
  const output = execFileSync(process.execPath, ['scripts/audit-topic-content-inventory.mjs'], { encoding: 'utf8' });
  const report = JSON.parse(output);
  assert.equal(report.schemaVersion, 1);
  assert.ok(report.sourceCount >= 10);
  assert.ok(report.candidateRecordCount > 0);
  assert.equal(report.records.length, report.candidateRecordCount);
  assert.ok(report.records.every((record) => record.id && record.title && record.sourcePath && record.surfaceId));
  assert.ok(report.records.every((record) => record.reviewStatus === 'not_assessed'));
  assert.ok(report.records.some((record) => record.surfaceId === 'workspace'));
  assert.ok(report.records.some((record) => record.surfaceId === 'db-internals'));
});
