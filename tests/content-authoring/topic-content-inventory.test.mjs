import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('topic inventory extracts canonical ID/title candidates without asserting quality', () => {
  const output = execFileSync(process.execPath, ['scripts/audit-topic-content-inventory.mjs'], { encoding: 'utf8' });
  const report = JSON.parse(output);
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.sourceCount, 27);
  assert.equal(report.surfaceCount, 12);
  assert.ok(report.sourceCount >= 10);
  assert.ok(report.candidateRecordCount > 0);
  assert.equal(report.records.length, report.candidateRecordCount);
  assert.ok(report.records.every((record) => record.id && record.title && record.sourcePath && record.surfaceId && record.recordKey));
  assert.equal(new Set(report.records.map((record) => record.recordKey)).size, report.records.length);
  assert.ok(report.records.every((record) => record.reviewStatus === 'not_assessed'));
  assert.ok(report.records.some((record) => record.surfaceId === 'workspace'));
  assert.ok(report.records.some((record) => record.surfaceId === 'db-internals'));
  assert.equal(report.surfaceSummaries.reduce((sum, surface) => sum + surface.candidateRecordCount, 0), report.candidateRecordCount);
  assert.ok(report.surfaceSummaries.every((surface) => surface.reviewStatus === 'not_assessed'));
  assert.ok(report.surfaceSummaries.every((surface) => surface.sourceCount > 0));
});
