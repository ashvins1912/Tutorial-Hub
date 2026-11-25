import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registry = JSON.parse(readFileSync(path.join(root, 'docs/learning-surface-registry.json'), 'utf8'));
const ledger = JSON.parse(readFileSync(path.join(root, 'docs/100_PERCENT_AUDIT_LEDGER.json'), 'utf8'));

test('100 percent audit ledger reconciles every registered content and test path', () => {
  const expected = new Map();
  for (const surface of registry.surfaces) {
    for (const [field, role] of [
      ['componentPaths', 'component'],
      ['dataSources', 'data'],
      ['apiRoutes', 'api'],
      ['testFiles', 'test'],
    ]) {
      for (const sourcePath of surface[field] || []) {
        const item = expected.get(sourcePath) || { roles: new Set(), surfaceIds: new Set() };
        item.roles.add(role);
        item.surfaceIds.add(surface.id);
        expected.set(sourcePath, item);
      }
    }
  }
  for (const sourcePath of registry.globalTestFiles) {
    const item = expected.get(sourcePath) || { roles: new Set(), surfaceIds: new Set() };
    item.roles.add('global-test');
    expected.set(sourcePath, item);
  }

  assert.equal(ledger.baseline.registrySurfaceCount, registry.surfaces.length);
  assert.equal(ledger.baseline.contentSourcePathCount,
    new Set(registry.surfaces.flatMap((surface) => [
      ...surface.componentPaths, ...surface.dataSources, ...surface.apiRoutes,
    ])).size);
  assert.equal(ledger.baseline.testSourcePathCount,
    new Set([...registry.globalTestFiles, ...registry.surfaces.flatMap((surface) => surface.testFiles)]).size);
  assert.equal(ledger.paths.length, expected.size);
  assert.equal(new Set(ledger.paths.map((item) => item.path)).size, ledger.paths.length);

  for (const item of ledger.paths) {
    const source = expected.get(item.path);
    assert.ok(source, 'unregistered ledger path: ' + item.path);
    assert.deepEqual([...item.roles].sort(), [...source.roles].sort(), item.path + ': role drift');
    assert.deepEqual([...item.surfaceIds].sort(), [...source.surfaceIds].sort(), item.path + ': surface drift');
    assert.equal(item.reviewStatus, 'not_reviewed',
      item.path + ': path-level review cannot be implied by registry membership');
    assert.equal(item.dispositionedUnitCount, 0);
    assert.equal(item.learnerUnitCount, null, 'unit denominator must remain unknown until reconciled');
    assert.deepEqual(item.findings, []);
    assert.deepEqual(item.evidence, []);
  }

  assert.equal(ledger.surfaces.length, registry.surfaces.length);
  assert.deepEqual(ledger.surfaces.map((surface) => surface.surfaceId).sort(),
    registry.surfaces.map((surface) => surface.id).sort());
  assert.ok(ledger.surfaces.every((surface) => surface.contentStatus === 'not_reviewed' && surface.uiStatus === 'not_reviewed'));
  assert.ok(ledger.reviewedUnits.every((unit) => expected.has(unit.sourcePath)));
  const allowedUnitStatuses = new Set(['corrected-awaiting-ci', 'content-added-awaiting-ci', 'content-corrected-awaiting-ci', 'ui-corrected-awaiting-ci']);
  assert.ok(ledger.reviewedUnits.every((unit) => allowedUnitStatuses.has(unit.reviewStatus)));
  assert.equal(ledger.counts.correctedUnitsAwaitingCi, ledger.reviewedUnits.filter((unit) => unit.reviewStatus === 'corrected-awaiting-ci').length);
  assert.equal(ledger.counts.contentAddedUnitsAwaitingCi, ledger.reviewedUnits.filter((unit) => unit.reviewStatus === 'content-added-awaiting-ci').length);
  assert.equal(ledger.counts.contentCorrectedUnitsAwaitingCi, ledger.reviewedUnits.filter((unit) => unit.reviewStatus === 'content-corrected-awaiting-ci').length);
  assert.equal(ledger.counts.uiCorrectedUnitsAwaitingCi, ledger.reviewedUnits.filter((unit) => unit.reviewStatus === 'ui-corrected-awaiting-ci').length);
  assert.equal(ledger.counts.reviewedPaths, 0);
  assert.equal(
    ledger.counts.correctedUnitsAwaitingCi + ledger.counts.contentAddedUnitsAwaitingCi +
    ledger.counts.contentCorrectedUnitsAwaitingCi + ledger.counts.uiCorrectedUnitsAwaitingCi,
    ledger.reviewedUnits.length,
    'reviewed-unit status buckets must reconcile to the total'
  );
});
