import type { DomainSimulatorScenario } from './domainSimulatorContract';

export type DomainScenarioInputs = {
  database: { rowCount: number; selectivityPct: number; hasIndex: boolean; coveringIndex: boolean };
  system: { incomingRps: number; gatewayCapacity: number; orderCapacity: number; inventoryCapacity: number };
  concurrency: { initialBalance: number; firstWithdrawal: number; secondWithdrawal: number };
  cloud: { secretDetected: boolean; testsPass: boolean; vulnerabilityScanPass: boolean; signatureValid: boolean };
};

export const DEFAULT_DOMAIN_SCENARIO_INPUTS: DomainScenarioInputs = {
  database: { rowCount: 1_000_000, selectivityPct: 0.2, hasIndex: true, coveringIndex: false },
  system: { incomingRps: 1_200, gatewayCapacity: 2_000, orderCapacity: 1_000, inventoryCapacity: 700 },
  concurrency: { initialBalance: 100, firstWithdrawal: 30, secondWithdrawal: 50 },
  cloud: { secretDetected: true, testsPass: true, vulnerabilityScanPass: true, signatureValid: true },
};

export type DomainPrediction = { prompt: string; options: string[]; correctOption: string; rationale: string };
export type DomainScenarioFrame = { title: string; detail: string; metrics: Array<{ label: string; value: string }>; prediction?: DomainPrediction };

const checkpoint = (prompt: string, correctOption: string, alternatives: string[], rationale: string): DomainPrediction => ({
  prompt, options: [correctOption, ...alternatives].filter((value, index, all) => all.indexOf(value) === index), correctOption, rationale,
});
const frame = (title: string, detail: string, metrics: DomainScenarioFrame['metrics'], prediction?: DomainPrediction): DomainScenarioFrame => ({ title, detail, metrics, ...(prediction ? { prediction } : {}) });

export function buildDomainScenario(scenario: DomainSimulatorScenario, inputs: DomainScenarioInputs = DEFAULT_DOMAIN_SCENARIO_INPUTS): DomainScenarioFrame[] {
  switch (scenario) {
    case 'database-query-plan': {
      const db = inputs.database;
      const matchedRows = Math.max(0, Math.round(db.rowCount * db.selectivityPct / 100));
      const useIndex = db.hasIndex && db.selectivityPct <= 5;
      const accessPath = useIndex ? 'Index scan' : 'Sequential scan';
      const heapWork = useIndex && !db.coveringIndex;
      return [
        frame('Read the query workload', `The table contains ${db.rowCount.toLocaleString()} rows; the predicate matches ${db.selectivityPct}% (${matchedRows.toLocaleString()} estimated rows). ${db.hasIndex ? 'A B-tree index is available.' : 'No usable index is available.'}`, [{ label: 'Table rows', value: db.rowCount.toLocaleString() }, { label: 'Selectivity', value: `${db.selectivityPct}%` }, { label: 'Estimated matches', value: matchedRows.toLocaleString() }, { label: 'Index', value: db.hasIndex ? 'Available' : 'Unavailable' }], checkpoint('Which access path is favored by this simplified selectivity model?', accessPath, [useIndex ? 'Sequential scan' : 'Index scan', 'Full table sort', 'Nested-loop join'], useIndex ? 'A selective predicate and available index make an index access path attractive in this simplified model. Real optimizers compare page costs, correlation, cache and statistics.' : 'Without a usable index or with a broad predicate, scanning the table can be cheaper than many scattered index lookups. Real optimizers use engine-specific cost estimates.')),
        frame('Fetch the required row data', heapWork ? 'The index identifies matching tuple locations, but this query is not covered by the index. Heap access and visibility checks remain.' : db.coveringIndex && useIndex ? 'The selected columns are covered by the index, so the engine may avoid most heap visits (subject to visibility and engine rules).' : 'The sequential scan reads table pages and evaluates the predicate as it goes.', [{ label: 'Chosen path', value: accessPath }, { label: 'Heap tuple visits', value: heapWork ? 'Expected' : db.coveringIndex && useIndex ? 'Often reduced' : 'Part of table scan' }], checkpoint('What is the main benefit of a covering index for this projection?', db.coveringIndex ? 'The needed columns can be read from index entries' : 'Add the projected columns to the index to reduce heap visits', ['Increase the number of table rows', 'Disable statistics collection'], db.coveringIndex ? 'A covering index stores the projected values and may satisfy the query without fetching each heap tuple.' : 'A non-covering index still needs heap tuples. Including projected columns can reduce heap I/O, at the cost of larger index entries and write overhead.')),
        frame('Evaluate the trade-off', 'Index scans trade fewer pages for index traversal and potentially random heap I/O. Sequential scans trade reading more pages for efficient sequential access.', [{ label: 'Plan', value: accessPath }, { label: 'Covering', value: db.coveringIndex ? 'Configured' : 'Not configured' }], checkpoint('Which evidence should decide whether this estimated plan is actually faster?', 'Compare EXPLAIN ANALYZE and representative workload measurements', ['Assume index scans are always faster', 'Use row count alone', 'Disable the query planner'], 'Actual execution time, buffers, row-estimate error, cache state and representative parameter values validate the plan.')),
        frame('Interpret the plan carefully', 'This deterministic model teaches selectivity and heap-work trade-offs. It is not a database optimizer and does not execute SQL.', [{ label: 'Decision', value: accessPath }, { label: 'Model', value: 'Selectivity heuristic' }, { label: 'Verification', value: 'EXPLAIN (ANALYZE, BUFFERS)' }]),
      ];
    }
    case 'system-capacity': {
      const sys = inputs.system;
      const capacities = [{ name: 'API Gateway', value: sys.gatewayCapacity }, { name: 'Order Service', value: sys.orderCapacity }, { name: 'Inventory Service', value: sys.inventoryCapacity }];
      const bottleneck = capacities.reduce((min, item) => item.value < min.value ? item : min);
      const excess = Math.max(0, sys.incomingRps - bottleneck.value);
      const stable = excess === 0;
      return [
        frame('Inject traffic into the request path', `Requests traverse API Gateway → Order Service → Inventory Service. Offered traffic is ${sys.incomingRps.toLocaleString()} requests/second.`, [{ label: 'Incoming RPS', value: sys.incomingRps.toLocaleString() }, ...capacities.map((item) => ({ label: item.name, value: `${item.value.toLocaleString()} RPS` }))], checkpoint('Which dependency sets the steady-state ceiling for this serial path?', bottleneck.name, capacities.filter((item) => item.name !== bottleneck.name).map((item) => item.name), 'For a serial path, the minimum capacity among required dependencies bounds steady-state throughput in this simplified model.')),
        frame('Propagate the capacity constraint', stable ? 'Offered traffic is within the smallest stated service capacity; this model predicts no sustained queue growth from throughput alone.' : `Arrival rate exceeds the path capacity by ${excess.toLocaleString()} RPS. A queue grows until bounded capacity, timeout or rejection behavior intervenes.`, [{ label: 'Path capacity', value: `${bottleneck.value.toLocaleString()} RPS` }, { label: 'Excess load', value: `${excess.toLocaleString()} RPS` }], checkpoint('What is the expected queue behavior at this offered load?', stable ? 'No sustained queue growth from capacity mismatch alone' : 'Queue depth and latency rise until backpressure or a limit intervenes', ['The path automatically exceeds its bottleneck capacity', 'Retries always reduce load'], 'When arrivals exceed service capacity, backlog grows. If arrivals remain below capacity, this simple steady-state model does not predict overload.')),
        frame('Choose the scaling target', 'Scale the constrained dependency or reduce the work it performs. Scaling upstream services alone does not raise the serial path ceiling.', [{ label: 'Bottleneck', value: bottleneck.name }, { label: 'Scaling target', value: bottleneck.name }], checkpoint('Which single change directly raises the current path capacity?', `Increase ${bottleneck.name} capacity`, ['Scale only the API Gateway', 'Increase unbounded client retries'], 'Increasing capacity at a non-bottleneck does not change the minimum capacity. Retry budgets and load shedding prevent overload amplification.')),
        frame('Validate with realistic traffic', 'Real distributed systems also need queueing distributions, fan-out, retries, deadlines, partial failures, autoscaling delays and load tests.', [{ label: 'Simplified path ceiling', value: `${bottleneck.value.toLocaleString()} RPS` }, { label: 'Bottleneck', value: bottleneck.name }, { label: 'Model boundary', value: 'Steady-state serial path' }]),
      ];
    }
    case 'concurrency-lost-update': {
      const tx = inputs.concurrency;
      const t1Value = tx.initialBalance - tx.firstWithdrawal;
      const t2Value = tx.initialBalance - tx.secondWithdrawal;
      const serialValue = tx.initialBalance - tx.firstWithdrawal - tx.secondWithdrawal;
      return [
        frame('Both transactions read the same value', `Initial balance is ${tx.initialBalance}. T1 and T2 both read ${tx.initialBalance} before either commits.`, [{ label: 'Initial balance', value: String(tx.initialBalance) }, { label: 'T1 withdrawal', value: String(tx.firstWithdrawal) }, { label: 'T2 withdrawal', value: String(tx.secondWithdrawal) }], checkpoint('What value does T1 calculate from its earlier read?', String(t1Value), [String(t2Value), String(tx.initialBalance), String(serialValue)], 'T1 independently computes initial balance minus its own withdrawal.')),
        frame('T1 commits its value', `T1 writes ${t1Value}. T2 still holds its earlier snapshot and has independently calculated ${t2Value}.`, [{ label: 'Stored after T1', value: String(t1Value) }, { label: 'T2 stale calculation', value: String(t2Value) }], checkpoint('If T2 writes its stale read-modify-write result, what is stored?', String(t2Value), [String(serialValue), String(t1Value), String(tx.initialBalance)], 'T2 overwrites T1 with a value derived from the original balance. The first withdrawal is lost.')),
        frame('Compare actual and serial outcomes', `The lost-update interleaving stores ${t2Value}; serial execution would produce ${serialValue}. The difference is ${t2Value - serialValue}.`, [{ label: 'Interleaved final', value: String(t2Value) }, { label: 'Serial expected', value: String(serialValue) }, { label: 'Lost update amount', value: String(t2Value - serialValue) }], checkpoint('Which technique prevents this stale overwrite?', 'Atomic conditional UPDATE or row-level locking', ['Retry stale writes unchanged', 'Read from a lagging replica', 'Increase client timeout'], 'An atomic update, correctly scoped lock or serializable transaction with retry handling protects the invariant.')),
        frame('Choose a concurrency-safe design', 'Use atomic conditional updates, row-level locks or serializable isolation with bounded retries and idempotency. Validate the exact database isolation semantics.', [{ label: 'Invariant', value: 'No lost withdrawal' }, { label: 'Safe patterns', value: 'Atomic update · lock · serializable retry' }, { label: 'Model', value: 'Two-transaction schedule' }]),
      ];
    }
    case 'cloud-pipeline-gate': {
      const cloud = inputs.cloud;
      const firstOutcome = cloud.secretDetected ? 'Fail closed and block promotion' : 'Continue to build and test';
      const secondOutcome = cloud.secretDetected ? 'Rotate the exposed credential before retry' : 'Keep the credential scan gate enabled';
      const finalOutcome = cloud.testsPass && cloud.vulnerabilityScanPass && cloud.signatureValid ? 'Promote the signed, verified image digest' : 'Block promotion until every required gate passes';
      return [
        frame('Inspect source before building', cloud.secretDetected ? 'The secret scanner detected a committed credential. The credential may already be exposed even if it is removed from the latest source tree.' : 'No committed secret was detected in this scan. Continue only through the remaining required checks.', [{ label: 'Secret detected', value: cloud.secretDetected ? 'Yes' : 'No' }, { label: 'Gate policy', value: 'Fail closed' }], checkpoint('What should happen when a credential is detected?', firstOutcome, [cloud.secretDetected ? 'Continue with a warning' : 'Deploy immediately', 'Disable secret scanning'], 'A detected credential blocks promotion. Remove it from source and rotate it because deleting it from the latest commit does not revoke an exposed secret.')),
        frame('Resolve the security finding', cloud.secretDetected ? 'Remove the secret from source and history as appropriate, rotate the credential, then regenerate the artifact.' : 'Keep scanning active and ensure credentials are injected through approved secret management.', [{ label: 'Credential remediation', value: cloud.secretDetected ? 'Required' : 'No finding in this fixture' }], checkpoint('What is required after a credential exposure?', secondOutcome, ['Only rename the environment variable', 'Reuse the exposed credential', 'Disable the gate'], 'An exposed credential must be rotated or revoked. Source cleanup alone does not invalidate it.')),
        frame('Verify build and artifact evidence', 'A release candidate needs successful tests, vulnerability policy checks and a signature/provenance statement bound to its immutable digest.', [{ label: 'Tests', value: cloud.testsPass ? 'Pass' : 'Fail' }, { label: 'Vulnerability scan', value: cloud.vulnerabilityScanPass ? 'Pass' : 'Fail' }, { label: 'Digest signature', value: cloud.signatureValid ? 'Valid' : 'Invalid' }], checkpoint('What should deployment admission verify?', finalOutcome, ['Only a mutable image tag', 'Only that a pipeline ran', 'The developer workstation name'], 'Promotion should verify all required gates and provenance for the exact immutable artifact digest.')),
        frame('Promote only a verified artifact', 'Use a controlled rollout, observe service health and error budgets, and retain a tested rollback path. This fixture does not invoke a CI provider or cloud API.', [{ label: 'Promotion decision', value: finalOutcome.startsWith('Promote') ? 'Allowed by fixture' : 'Blocked by fixture' }, { label: 'Rollout', value: 'Canary / progressive delivery' }, { label: 'Rollback', value: 'Required' }]),
      ];
    }
  }
}
