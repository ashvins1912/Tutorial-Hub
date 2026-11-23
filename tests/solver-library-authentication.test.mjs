import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAuthenticatedActor } from '../server/routes/universalSolverRoutes.ts';

test('solver library actor is derived only from verified auth context', () => {
  const actor = extractAuthenticatedActor({
    authUser: { id: 'verified-user-123', email: 'verified@example.com', userMetadata: { full_name: 'Verified Learner' } },
    headers: { 'x-learner-id': 'attacker-controlled-id', authorization: 'Bearer forged.token.value' },
  });
  assert.deepEqual(actor, {
    userId: 'verified-user-123',
    email: 'verified@example.com',
    authorName: 'Verified Learner',
  });
});

test('solver library actor rejects requests without verified auth context', () => {
  assert.throws(
    () => extractAuthenticatedActor({ headers: { 'x-learner-id': 'attacker-controlled-id' } }),
    /Authenticated user context is required/
  );
});

test('solver library actor uses a safe display-name fallback', () => {
  const actor = extractAuthenticatedActor({
    authUser: { id: 'verified-user-456', email: 'learner@example.com', userMetadata: {} },
    headers: {},
  });
  assert.equal(actor.userId, 'verified-user-456');
  assert.equal(actor.authorName, 'learner');
});
