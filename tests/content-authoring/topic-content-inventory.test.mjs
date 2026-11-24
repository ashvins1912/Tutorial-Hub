import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('topic inventory extracts canonical ID/title candidates without asserting quality', () => {
  const output = execFileSync(process.execPath, ['scripts/audit-topic-content-inventory.mjs'], { encoding: 'utf8' });
  const report = JSON.parse(output);
  assert.equal(report.schemaVersion, 1);
  assert.ok(report.sourceCount >= 27, 'inventory must cover all registered TypeScript data sources');
  assert.ok(report.surfaceCount >= 12, 'inventory must cover every surface with mapped TypeScript data sources');
  assert.ok(report.sourceCount >= 10);
  assert.ok(report.candidateRecordCount > 0);
  assert.equal(report.records.length, report.candidateRecordCount);
  assert.ok(report.records.every((record) => record.id && record.title && record.sourcePath && record.surfaceId && record.recordKey));
  assert.equal(new Set(report.records.map((record) => record.recordKey)).size, report.records.length);
  assert.ok(report.records.every((record) => record.reviewStatus === 'not_assessed'));
  assert.equal(report.qualityDimensions.length, 8);
  assert.ok(report.records.every((record) => record.qualityReview.status === 'not_assessed'));
  assert.ok(report.records.every((record) => report.qualityDimensions.every((dimension) => record.qualityReview.dimensions[dimension]?.score === null && record.qualityReview.dimensions[dimension]?.evidence.length === 0)));
  assert.ok(report.records.some((record) => record.surfaceId === 'workspace'));
  assert.ok(report.records.some((record) => record.surfaceId === 'db-internals'));
  assert.ok(report.records.some((record) => record.surfaceId === 'pattern-forge'), 'Pattern Forge canonical content must be inventoried');
  assert.equal(report.surfaceSummaries.reduce((sum, surface) => sum + surface.candidateRecordCount, 0), report.candidateRecordCount);
  assert.ok(report.surfaceSummaries.every((surface) => surface.reviewStatus === 'not_assessed'));
  assert.ok(report.surfaceSummaries.every((surface) => surface.sourceCount > 0));
});
