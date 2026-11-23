import type { DomainSimulatorScenario } from './domainSimulatorContract';

export type DomainPrediction = {
  prompt: string;
  options: string[];
  correctOption: string;
  rationale: string;
};
export type DomainScenarioFrame = {
  title: string;
  detail: string;
  metrics: Array<{ label: string; value: string }>;
  prediction?: DomainPrediction;
};

const checkpoint = (prompt: string, correctOption: string, alternatives: string[], rationale: string): DomainPrediction => ({
  prompt,
  options: [correctOption, ...alternatives].filter((value, index, all) => all.indexOf(value) === index),
  correctOption,
  rationale,
});

export function buildDomainScenario(scenario: DomainSimulatorScenario): DomainScenarioFrame[] {
  switch (scenario) {
    case 'database-query-plan':
      return [
        {
          title: 'Read the query workload',
          detail: 'The table has 1,000,000 rows. The predicate matches 0.2% of rows and a B-tree index exists on the filtered column.',
          metrics: [{ label: 'Rows', value: '1,000,000' }, { label: 'Selectivity', value: '0.2%' }, { label: 'Index', value: 'B-tree available' }],
          prediction: checkpoint('Which access path should the cost-based optimizer prefer for this selective predicate?', 'Index scan', ['Sequential scan', 'Full table sort', 'Nested-loop join'], 'A selective predicate can avoid reading most heap pages through the B-tree. The exact choice still depends on table statistics, correlation, cache state and the database cost model.'),
        },
        {
          title: 'Choose the access path',
          detail: 'The optimizer estimates about 2,000 matching rows. It chooses an index scan, then fetches the matching heap tuples.',
          metrics: [{ label: 'Estimated rows', value: '2,000' }, { label: 'Chosen path', value: 'Index scan' }],
          prediction: checkpoint('After locating matching index entries, what work remains before rows can be returned?', 'Fetch and recheck matching heap tuples', ['Read every table page', 'Build a hash table for a join', 'Write a WAL checkpoint'], 'A non-covering index points to heap tuples. Visibility checks and heap access may still be required.'),
        },
        {
          title: 'Account for heap access',
          detail: 'The plan visits matching heap pages and applies any remaining filter. A covering index could avoid some heap reads.',
          metrics: [{ label: 'Heap fetches', value: 'Required for this plan' }, { label: 'Residual filter', value: 'Applied after fetch' }],
          prediction: checkpoint('What change is most likely to make this query cheaper when the selected columns are also in the index?', 'Use a covering index where supported', ['Increase the table row count', 'Disable statistics collection', 'Force a full sequential scan'], 'A covering index can satisfy the projection from index entries and reduce heap visits, subject to visibility-map and engine-specific behavior.'),
        },
        {
          title: 'Interpret the plan carefully',
          detail: 'The index plan is a reasoned estimate, not a guarantee. If selectivity rises or random I/O becomes expensive, a sequential scan may win.',
          metrics: [{ label: 'Decision', value: 'Cost-based, statistics-dependent' }, { label: 'Caveat', value: 'Validate with EXPLAIN ANALYZE' }],
        },
      ];
    case 'system-capacity':
      return [
        {
          title: 'Inject incoming traffic',
          detail: 'A request path traverses API Gateway → Order Service → Inventory Service. Incoming load is 1,200 requests/second.',
          metrics: [{ label: 'Incoming RPS', value: '1,200' }, { label: 'Gateway capacity', value: '2,000 RPS' }, { label: 'Order capacity', value: '1,000 RPS' }, { label: 'Inventory capacity', value: '700 RPS' }],
          prediction: checkpoint('Which component becomes the first throughput bottleneck on this serial request path?', 'Inventory Service', ['API Gateway', 'Order Service', 'Database cache'], 'Inventory has the lowest stated service capacity (700 RPS), so it limits steady-state throughput before upstream components.'),
        },
        {
          title: 'Propagate the capacity limit',
          detail: 'The serial path cannot sustainably complete more requests than its lowest-capacity required dependency. Excess requests queue or fail.',
          metrics: [{ label: 'Path capacity', value: '700 RPS' }, { label: 'Excess load', value: '500 RPS' }],
          prediction: checkpoint('If traffic remains at 1,200 RPS and no buffering or shedding is added, what is the most likely immediate symptom?', 'Queue growth and rising latency at Inventory', ['Higher successful throughput than 1,200 RPS', 'Lower latency at every service', 'Automatic capacity increase'], 'Arrival rate exceeds service rate by 500 RPS. A finite queue eventually saturates; timeout and rejection behavior depends on configured limits.'),
        },
        {
          title: 'Select a safe control',
          detail: 'Apply bounded queues, deadlines, backpressure and load shedding. Scale the actual bottleneck or reduce its work.',
          metrics: [{ label: 'Controls', value: 'Backpressure · deadlines · load shedding' }, { label: 'Scale target', value: 'Inventory dependency' }],
          prediction: checkpoint('Which scaling action directly raises the current path ceiling?', 'Increase Inventory Service capacity', ['Add API Gateway replicas only', 'Increase client retry frequency', 'Remove request deadlines'], 'Scaling a non-bottleneck does not raise the minimum capacity of the serial path. Retries without budgets can amplify overload.'),
        },
        {
          title: 'Verify the new operating point',
          detail: 'Recalculate the path minimum after scaling, then load-test with realistic latency distributions, retries and failure rates.',
          metrics: [{ label: 'Method', value: 'Bottleneck re-evaluation + load test' }, { label: 'Model limit', value: 'Steady-state serial capacity only' }],
        },
      ];
    case 'concurrency-lost-update':
      return [
        {
          title: 'Both transactions read the same value',
          detail: 'Account balance starts at 100. T1 and T2 each read 100 before either write becomes visible.',
          metrics: [{ label: 'Initial balance', value: '100' }, { label: 'T1 reads', value: '100' }, { label: 'T2 reads', value: '100' }],
          prediction: checkpoint('T1 withdraws 30 and T2 withdraws 50 using read-modify-write. What value does T1 calculate locally?', '70', ['50', '20', '100'], 'T1 computes 100 − 30 = 70 from its own earlier read. T2 independently computes 50.'),
        },
        {
          title: 'T1 writes its derived value',
          detail: 'T1 stores 70. T2 still holds its stale local value 100 from the earlier read.',
          metrics: [{ label: 'Stored balance', value: '70' }, { label: 'T2 local snapshot', value: '100' }],
          prediction: checkpoint('If T2 now writes its previously calculated value, what will the stored balance become?', '50', ['20', '70', '150'], 'T2 overwrites 70 with 100 − 50 = 50. The update from T1 is lost.'),
        },
        {
          title: 'Observe the lost update',
          detail: 'The final value is 50, although the two withdrawals total 80 and the serially correct balance would be 20.',
          metrics: [{ label: 'Actual final', value: '50' }, { label: 'Expected serial result', value: '20' }, { label: 'Lost amount', value: '30' }],
          prediction: checkpoint('Which approach prevents this read-modify-write overwrite for a single account row?', 'Atomic UPDATE or row-level locking', ['Retry both stale writes unchanged', 'Use a longer client timeout', 'Read from a replica'], 'An atomic conditional update or correctly scoped row lock serializes the conflicting modification. Serializable isolation is another option with retry handling.'),
        },
        {
          title: 'Choose a concurrency-safe design',
          detail: 'Use an atomic balance update with a sufficient-funds predicate, or lock the row and handle serialization failures. Test retries for idempotency.',
          metrics: [{ label: 'Safe pattern', value: 'Atomic update / lock / serializable retry' }, { label: 'Assumption', value: 'Single-row account invariant' }],
        },
      ];
    case 'cloud-pipeline-gate':
      return [
        {
          title: 'Run source and build gates',
          detail: 'A delivery pipeline performs secret scanning, build, unit/contract tests, vulnerability scanning, image signing and deployment promotion.',
          metrics: [{ label: 'Pipeline stages', value: '6' }, { label: 'Current stage', value: 'Secret scan + build' }],
          prediction: checkpoint('A committed credential is detected by the secret scanner. What should the pipeline do?', 'Fail closed and block promotion', ['Continue and warn only', 'Deploy, then rotate later', 'Skip all downstream checks'], 'A leaked credential is a security incident. Block the artifact, remove the secret from source and rotate the exposed credential.'),
        },
        {
          title: 'Stop at the failed security gate',
          detail: 'The artifact is not promoted. The secret must be removed and rotated; history remediation may also be required.',
          metrics: [{ label: 'Gate', value: 'Secret scan' }, { label: 'Outcome', value: 'Blocked' }],
          prediction: checkpoint('After removing the secret from the current commit, what else is required before retry?', 'Rotate the exposed credential', ['Only rename the environment variable', 'Disable secret scanning', 'Promote the existing artifact'], 'Removing a secret from the latest tree does not invalidate a credential that may already have been exposed.'),
        },
        {
          title: 'Rebuild and verify the artifact',
          detail: 'Run tests and vulnerability checks, produce an immutable image digest, then sign and attest that exact artifact.',
          metrics: [{ label: 'Artifact identity', value: 'Immutable digest' }, { label: 'Evidence', value: 'Tests + scan + signature' }],
          prediction: checkpoint('What should the deployment admission policy verify?', 'Signature and provenance for the exact image digest', ['Only a mutable image tag', 'The developer workstation hostname', 'That the pipeline had no warnings'], 'A signature and provenance bound to the immutable digest prevent substituting a different image after verification.'),
        },
        {
          title: 'Promote only verified artifacts',
          detail: 'Deploy through a controlled rollout, observe health and error budgets, and retain rollback capability.',
          metrics: [{ label: 'Promotion', value: 'Verified digest only' }, { label: 'Rollout', value: 'Canary / progressive delivery' }],
        },
      ];
  }
}
