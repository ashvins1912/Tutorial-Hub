import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDomainScenario } from '../../src/features/intelligent-engine/components/domainPredictionScenarios.ts';
import { validateDomainLessonSimulator } from '../../src/features/intelligent-engine/components/domainSimulatorContract.ts';

const scenarios = ['database-query-plan', 'system-capacity', 'concurrency-lost-update', 'cloud-pipeline-gate'];

test('all four domains provide deterministic multi-step scenario fixtures', () => {
  for (const scenario of scenarios) {
    const frames = buildDomainScenario(scenario);
    assert.equal(frames.length, 4);
    assert.ok(frames[0].prediction);
    assert.ok(frames.slice(0, 3).every((frame) => frame.prediction?.options.includes(frame.prediction.correctOption)));
    assert.ok(frames.every((frame) => frame.title && frame.detail && frame.metrics.length > 0));
    assert.deepEqual(buildDomainScenario(scenario), frames);
  }
});

test('database prediction is about query access paths, not generic animation', () => {
  const [first] = buildDomainScenario('database-query-plan');
  assert.match(first.prediction.prompt, /access path/);
  assert.equal(first.prediction.correctOption, 'Index scan');
});

test('system design prediction identifies the lowest-capacity dependency', () => {
  const [first] = buildDomainScenario('system-capacity');
  assert.equal(first.prediction.correctOption, 'Inventory Service');
});

test('concurrency scenario demonstrates a lost update and safe correction', () => {
  const frames = buildDomainScenario('concurrency-lost-update');
  assert.equal(frames[2].metrics.find((metric) => metric.label === 'Actual final')?.value, '50');
  assert.equal(frames[2].metrics.find((metric) => metric.label === 'Expected serial result')?.value, '20');
  assert.equal(frames[2].prediction.correctOption, 'Atomic UPDATE or row-level locking');
});

test('cloud scenario blocks promotion when a secret is exposed', () => {
  const [first] = buildDomainScenario('cloud-pipeline-gate');
  assert.equal(first.prediction.correctOption, 'Fail closed and block promotion');
});

test('domain simulator contract rejects unknown scenarios and invalid objective bindings', () => {
  const base = { schemaVersion: 1, id: 'db-plan', kind: 'domain-prediction', scenario: 'database-query-plan', title: 'Query plan', description: 'Predict the plan', objectiveIds: ['objective-1'] };
  assert.ok(validateDomainLessonSimulator(base, ['objective-1']));
  assert.equal(validateDomainLessonSimulator({ ...base, scenario: 'generic-animation' }), null);
  assert.equal(validateDomainLessonSimulator({ ...base, objectiveIds: [] }), null);
  assert.equal(validateDomainLessonSimulator(base, ['different-objective']), null);
});
