import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseDomainPrediction, createDomainSimulatorSession, previousDomainStep, revealDomainPrediction } from '../../src/features/intelligent-engine/components/domainSimulatorSession.ts';

test('prediction cannot advance without a selected answer and checkpoint', () => {
  const initial = createDomainSimulatorSession();
  assert.deepEqual(revealDomainPrediction(initial, undefined, 3), initial);
  assert.deepEqual(revealDomainPrediction(initial, { correctOption: 'A', rationale: 'Reason' }, 3), initial);
});

test('session records prediction evidence separately and advances only after reveal', () => {
  const selected = chooseDomainPrediction(createDomainSimulatorSession(), 'A');
  const revealed = revealDomainPrediction(selected, { correctOption: 'A', rationale: 'Reason' }, 3);
  assert.equal(revealed.step, 1);
  assert.equal(revealed.correctPredictions, 1);
  assert.equal(revealed.answeredPredictions, 1);
  assert.equal(revealed.feedback?.correct, true);
  assert.equal(revealed.choice, '');
});

test('incorrect predictions are recorded without changing quiz or mastery state', () => {
  const selected = chooseDomainPrediction(createDomainSimulatorSession(), 'B');
  const revealed = revealDomainPrediction(selected, { correctOption: 'A', rationale: 'Reason' }, 3);
  assert.equal(revealed.correctPredictions, 0);
  assert.equal(revealed.answeredPredictions, 1);
  assert.equal(revealed.feedback?.answer, 'B');
});

test('previous navigation clears stale feedback and preserves session counts', () => {
  const selected = chooseDomainPrediction(createDomainSimulatorSession(), 'A');
  const revealed = revealDomainPrediction(selected, { correctOption: 'A', rationale: 'Reason' }, 3);
  const previous = previousDomainStep(revealed);
  assert.equal(previous.step, 0);
  assert.equal(previous.feedback, null);
  assert.equal(previous.correctPredictions, 1);
  assert.equal(previous.answeredPredictions, 1);
});

test('cannot advance beyond final step', () => {
  const session = { ...createDomainSimulatorSession(), step: 3, choice: 'A' };
  assert.deepEqual(revealDomainPrediction(session, { correctOption: 'A', rationale: 'Reason' }, 3), session);
});
