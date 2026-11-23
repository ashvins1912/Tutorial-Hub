import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDomainScenario } from '../../src/features/intelligent-engine/components/domainPredictionScenarios.ts';
import { validateDomainLessonSimulator } from '../../src/features/intelligent-engine/components/domainSimulatorContract.ts';
import { DEFAULT_DOMAIN_SCENARIO_INPUTS } from '../../src/features/intelligent-engine/components/domainPredictionScenarios.ts';

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

test('database assumptions change the selected access path and estimated row count', () => {
  const broad = buildDomainScenario('database-query-plan', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, database: { rowCount: 100_000, selectivityPct: 40, hasIndex: true, coveringIndex: false } });
  assert.equal(broad[0].prediction.correctOption, 'Sequential scan');
  assert.equal(broad[0].metrics.find((metric) => metric.label === 'Estimated matches')?.value, '40,000');
  const noIndex = buildDomainScenario('database-query-plan', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, database: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.database, hasIndex: false } });
  assert.equal(noIndex[0].prediction.correctOption, 'Sequential scan');
});

test('system capacity assumptions recalculate bottleneck and overload', () => {
  const frames = buildDomainScenario('system-capacity', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, system: { incomingRps: 500, gatewayCapacity: 900, orderCapacity: 800, inventoryCapacity: 600 } });
  assert.equal(frames[0].prediction.correctOption, 'Inventory Service');
  assert.equal(frames[1].prediction.correctOption, 'No sustained queue growth from capacity mismatch alone');
  const overloaded = buildDomainScenario('system-capacity', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, system: { incomingRps: 1_500, gatewayCapacity: 900, orderCapacity: 800, inventoryCapacity: 600 } });
  assert.equal(overloaded[1].metrics.find((metric) => metric.label === 'Excess load')?.value, '900 RPS');
});

test('concurrency assumptions recalculate the lost-update result', () => {
  const frames = buildDomainScenario('concurrency-lost-update', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, concurrency: { initialBalance: 250, firstWithdrawal: 40, secondWithdrawal: 60 } });
  assert.equal(frames[2].metrics.find((metric) => metric.label === 'Interleaved final')?.value, '190');
  assert.equal(frames[2].metrics.find((metric) => metric.label === 'Serial expected')?.value, '150');
});

test('cloud pipeline blocks when any required evidence gate fails', () => {
  const frames = buildDomainScenario('cloud-pipeline-gate', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, cloud: { secretDetected: false, testsPass: true, vulnerabilityScanPass: false, signatureValid: true } });
  assert.equal(frames[3].metrics.find((metric) => metric.label === 'Promotion decision')?.value, 'Blocked by fixture');
});

test('system design model identifies tied bottlenecks instead of choosing one arbitrarily', () => {
  const frames = buildDomainScenario('system-capacity', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, system: { incomingRps: 1_000, gatewayCapacity: 500, orderCapacity: 500, inventoryCapacity: 900 } });
  assert.equal(frames[0].prediction.correctOption, 'API Gateway + Order Service');
  assert.ok(frames[0].prediction.options.length >= 2);
});

test('covering-index assumption changes the remaining heap-fetch explanation', () => {
  const frames = buildDomainScenario('database-query-plan', { ...DEFAULT_DOMAIN_SCENARIO_INPUTS, database: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.database, coveringIndex: true } });
  assert.match(frames[1].detail, /avoid most heap visits/);
});
