import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const registry = JSON.parse(readFileSync(resolve(root, 'docs/learning-surface-registry.json'), 'utf8'));
const storeSource = readFileSync(resolve(root, 'src/store/usePatternForgeStore.ts'), 'utf8');
const appSource = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');

function assertRepoPath(path, owner) {
  assert.equal(typeof path, 'string', owner + ': path must be a string');
  assert.ok(path.length > 0, owner + ': path must not be empty');
  assert.ok(!path.startsWith('/') && !path.split('/').includes('..'), owner + ': unsafe repository path ' + path);
  assert.ok(existsSync(resolve(root, path)), owner + ': referenced file does not exist: ' + path);
}

assert.equal(registry.schemaVersion, 1, 'Unsupported learning surface registry schema version');
assert.equal(registry.baseline.branch, 'main', 'Registry baseline must identify its source branch');
assert.ok(Array.isArray(registry.surfaces) && registry.surfaces.length > 0, 'Registry must contain surfaces');
assert.ok(Array.isArray(registry.globalTestFiles), 'Registry must declare global test files');

const topViewBlock = storeSource.match(/export type TopView =([\s\S]*?);/);
assert.ok(topViewBlock, 'Could not locate the TopView union in usePatternForgeStore.ts');
const declaredViews = [...topViewBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const registeredIds = registry.surfaces.map((surface) => surface.id);

assert.equal(new Set(declaredViews).size, declaredViews.length, 'TopView union contains duplicate IDs');
assert.equal(new Set(registeredIds).size, registeredIds.length, 'Registry contains duplicate surface IDs');
assert.deepEqual([...registeredIds].sort(), [...declaredViews].sort(),
  'Registry must map every TopView exactly once and must not invent view IDs');

const allowedNavigation = new Set(['primary', 'hub']);
const allReferencedPaths = new Set(registry.globalTestFiles);

for (const surface of registry.surfaces) {
  assert.ok(surface.id && surface.title && surface.kind && surface.summary, 'Every surface needs an ID, title, kind and summary');
  assert.ok(allowedNavigation.has(surface.navigation), surface.id + ': invalid navigation group');
  assert.equal(surface.qualityState, 'inventory', surface.id + ': inventory state must remain explicit');
  assert.equal(surface.verificationState, 'not_assessed', surface.id + ': do not imply technical verification');
  assert.ok(Array.isArray(surface.componentPaths) && surface.componentPaths.length > 0, surface.id + ': at least one component path is required');
  assert.ok(storeSource.includes("'" + surface.id + "'"), surface.id + ': missing from TopView store union');
  assert.ok(appSource.includes("'" + surface.id + "'"), surface.id + ': no reference found in App.tsx');

  for (const field of ['componentPaths', 'dataSources', 'apiRoutes', 'testFiles']) {
    assert.ok(Array.isArray(surface[field]), surface.id + ': ' + field + ' must be an array');
    for (const path of surface[field]) {
      assertRepoPath(path, surface.id);
      allReferencedPaths.add(path);
    }
  }
}

for (const path of registry.globalTestFiles) assertRepoPath(path, 'globalTestFiles');
assert.equal(registry.globalTestFiles.length, new Set(registry.globalTestFiles).size,
  'Global test file list must not contain duplicates');

console.log('Learning surface inventory valid: ' + registry.surfaces.length + ' TopView entries, ' +
  allReferencedPaths.size + ' unique referenced paths, ' + registry.globalTestFiles.length + ' test files.');
