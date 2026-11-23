import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const registry = JSON.parse(readFileSync(resolve(root, 'docs/learning-surface-registry.json'), 'utf8'));
const audit = JSON.parse(readFileSync(resolve(root, 'docs/learning-content-quality-audit.json'), 'utf8'));

assert.equal(audit.schemaVersion, 1, 'Unsupported content quality audit schema');
assert.equal(audit.baseline.branch, 'main', 'Audit baseline must identify main');
assert.ok(/^\\d{4}-\\d{2}-\\d{2}$/.test(audit.auditDate), 'Audit date must be ISO date');
assert.ok(Array.isArray(audit.surfaces), 'Audit surfaces must be an array');

const registryIds = registry.surfaces.map((surface) => surface.id);
const auditIds = audit.surfaces.map((surface) => surface.surfaceId);
assert.equal(new Set(auditIds).size, auditIds.length, 'Audit contains duplicate surface IDs');
assert.deepEqual([...auditIds].sort(), [...registryIds].sort(),
  'Audit must cover every registered learning surface exactly once');

const allowedPriorities = new Set(['P0', 'P1', 'P2']);
const allowedInventory = new Set(['mapped', 'mapping_incomplete']);
const allowedContent = new Set(['not_assessed', 'topic_review_in_progress', 'content_complete']);
const allowedVerification = new Set(['not_assessed', 'verified', 'learning_validated']);

for (const item of audit.surfaces) {
  const source = registry.surfaces.find((surface) => surface.id === item.surfaceId);
  assert.ok(source, item.surfaceId + ': unknown registry surface');
  assert.ok(item.title && item.title === source.title, item.surfaceId + ': title must match registry');
  assert.ok(allowedPriorities.has(item.priority), item.surfaceId + ': invalid priority');
  assert.ok(allowedInventory.has(item.inventoryStatus), item.surfaceId + ': invalid inventory status');
  assert.ok(allowedContent.has(item.contentStatus), item.surfaceId + ': invalid content status');
  assert.ok(allowedVerification.has(item.verificationStatus), item.surfaceId + ': invalid verification status');
  assert.ok(Array.isArray(item.reviewFocus) && item.reviewFocus.length >= 3, item.surfaceId + ': add at least three review focus areas');
  assert.ok(Array.isArray(item.requiredEvidence) && item.requiredEvidence.length >= 3, item.surfaceId + ': required evidence is incomplete');
  assert.ok(Array.isArray(item.reviewedSourcePaths), item.surfaceId + ': reviewedSourcePaths must be an array');
  for (const path of item.reviewedSourcePaths) {
    assert.ok(!path.startsWith('/') && !path.split('/').includes('..'), item.surfaceId + ': unsafe source path');
    assert.ok(existsSync(resolve(root, path)), item.surfaceId + ': missing source path ' + path);
    assert.ok([...source.componentPaths, ...source.dataSources].includes(path),
      item.surfaceId + ': source path is not mapped by the canonical registry: ' + path);
  }
  assert.equal(item.knownEvidence.mappedComponents, source.componentPaths.length, item.surfaceId + ': component count drift');
  assert.equal(item.knownEvidence.mappedDataSources, source.dataSources.length, item.surfaceId + ': data-source count drift');
  assert.equal(item.knownEvidence.mappedApiRoutes, source.apiRoutes.length, item.surfaceId + ': API route count drift');
  assert.equal(item.knownEvidence.mappedTestFiles, source.testFiles.length, item.surfaceId + ': test count drift');

  if (item.verificationStatus === 'verified' || item.verificationStatus === 'learning_validated') {
    assert.ok(item.evidence && Array.isArray(item.evidence) && item.evidence.length > 0,
      item.surfaceId + ': verified states require explicit evidence references');
  }
  if (item.verificationStatus === 'learning_validated') {
    assert.ok(item.learnerValidation && item.learnerValidation.transfer && item.learnerValidation.retention,
      item.surfaceId + ': learning validation requires transfer and retention evidence');
  }
}

console.log('Content quality audit valid: ' + audit.surfaces.length +
  ' surfaces, complete registry coverage, truthful evidence states.');
