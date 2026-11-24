import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('application-wide content quality audit covers every surface with honest evidence states', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-learning-content-quality-audit.mjs'], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /22 surfaces/);
});
