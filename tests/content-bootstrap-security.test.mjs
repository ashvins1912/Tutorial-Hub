import test from 'node:test';
import assert from 'node:assert/strict';
import { isContentBootstrapAdmin } from '../server/routes/contentBootstrapRoutes.ts';

test('canonical content publishing requires an explicitly configured admin identity', () => {
  assert.equal(isContentBootstrapAdmin(undefined, 'admin-1'), false);
  assert.equal(isContentBootstrapAdmin('learner-1', ''), false);
  assert.equal(isContentBootstrapAdmin('learner-1', 'admin-1, admin-2'), false);
  assert.equal(isContentBootstrapAdmin('admin-2', 'admin-1, admin-2'), true);
});

test('author allowlist parsing trims entries and ignores empty values', () => {
  assert.equal(isContentBootstrapAdmin('admin-1', ' , admin-1 ,, admin-2 '), true);
  assert.equal(isContentBootstrapAdmin('admin-3', ' , admin-1 ,, admin-2 '), false);
});
