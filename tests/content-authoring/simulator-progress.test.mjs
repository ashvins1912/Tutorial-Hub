import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSimulatorCompletion } from '../../server/routes/simulatorProgress.ts';

const simulator = { schemaVersion: 1, id: 'db-plan', kind: 'domain-prediction', scenario: 'database-query-plan', title: 'Query plan', description: 'Predict the access path.', objectiveIds: ['objective-1'] };

test('accepts only completed sessions matching the published lesson simulator', () => {
  const now = new Date('2026-11-24T00:00:00.000Z');
  const result = normalizeSimulatorCompletion({ simulatorId: 'db-plan', scenario: 'database-query-plan', completed: true, answeredPredictions: 3 }, simulator, ['objective-1'], now);
  assert.deepEqual(result, { simulatorId: 'db-plan', scenario: 'database-query-plan', answeredPredictions: 3, completedAt: now });
});

test('rejects mismatched, incomplete, malformed and excessive simulator evidence', () => {
  assert.equal(normalizeSimulatorCompletion({ simulatorId: 'other', scenario: 'database-query-plan', completed: true, answeredPredictions: 3 }, simulator, ['objective-1']), null);
  assert.equal(normalizeSimulatorCompletion({ simulatorId: 'db-plan', scenario: 'database-query-plan', completed: false, answeredPredictions: 3 }, simulator, ['objective-1']), null);
  assert.equal(normalizeSimulatorCompletion({ simulatorId: 'db-plan', scenario: 'database-query-plan', completed: true, answeredPredictions: 0 }, simulator, ['objective-1']), null);
  assert.equal(normalizeSimulatorCompletion({ simulatorId: 'db-plan', scenario: 'database-query-plan', completed: true, answeredPredictions: 13 }, simulator, ['objective-1']), null);
  assert.equal(normalizeSimulatorCompletion({ simulatorId: 'db-plan', scenario: 'database-query-plan', completed: true, answeredPredictions: 3 }, simulator, ['other-objective']), null);
});
