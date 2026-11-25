import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('application content advisory scan covers registered source paths', () => {
  const result = spawnSync(process.execPath, ['scripts/audit-application-content.mjs'], {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.surfaceCount, 22);
  assert.ok(report.uniqueSourcePaths > 100);
  assert.ok(report.counts.sourceFiles > 100);
  assert.ok(Array.isArray(report.findings.absoluteClaims));
  assert.ok(Array.isArray(report.limitations) && report.limitations.length > 0);
});
