# Domain-specific prediction simulators

The published lesson runtime supports a versioned `domain-prediction` contract for four deterministic teaching scenarios:

| Domain | Scenario | Learner predicts |
|---|---|---|
| Database | `database-query-plan` | Cost-based access path, heap fetch work and covering-index effect |
| System design | `system-capacity` | Lowest-capacity dependency, overload symptom and effective scaling target |
| Concurrency | `concurrency-lost-update` | Interleaving result, lost update and synchronization strategy |
| DevOps/cloud | `cloud-pipeline-gate` | Fail-closed security gate, credential rotation and digest-bound provenance |

Each scenario has four ordered states. The first three states require a domain-specific prediction before the next state is revealed. Feedback includes the expected result and a rationale. Choices are transient and do not contribute to quiz scores, objective mastery or spaced-revision evidence.

## Model boundaries

- Database cost selection is illustrative. Actual plans depend on engine, statistics, page correlation, cache state, visibility checks and cost parameters; validate with the target database's EXPLAIN tooling.
- System capacity reuses the application's deterministic DAG traffic engine for per-node capacity, drop and latency propagation. The lesson adapter does not model queue-depth distributions, fan-out, retries, autoscaling delay or partial failures.
- Concurrency is a deliberately controlled two-transaction read-modify-write interleaving. Real outcomes depend on the database isolation level, locking, retry policy and transaction boundaries.
- The cloud pipeline models policy gates, not a real CI runner, scanner, signing service or cluster.
- No SQL, thread scheduling, cloud API, shell command or learner-provided code is executed.

## Authoring contract

Attach `domainSimulator` to a lesson with `schemaVersion: 1`, a stable `id`, `kind: domain-prediction`, one supported `scenario`, a title, a concise description and one or more exact `objectiveIds`. Unknown scenarios, duplicate objectives and references outside the lesson objective list are rejected. This remains separate from the legacy binary-search/bubble-sort `simulator` contract.

The four fixtures are deterministic and tested. They are instructional models, not verified measurements of any particular database, architecture, language runtime or cloud provider.


## Parameterized learner controls and evidence

The runtime exposes bounded scenario controls for:
- Database row count, predicate selectivity, index availability and covering-index state.
- System incoming request rate and each serial service's stated capacity.
- Concurrency initial balance and each transaction's withdrawal amount.
- Cloud secret detection, test result, vulnerability policy result and artifact signature/provenance validity.

Each change recalculates the scenario and resets the active prediction session so old answers cannot be applied to new assumptions. The system-capacity adapter reuses the existing `runSimulationTick` DAG traffic engine, exposes per-node processed RPS, dropped RPS, overload count and average latency, and handles tied bottlenecks. All results remain instructional approximations and must be checked against the target database, distributed architecture or CI/CD provider.

Completed sessions are stored in a bounded, authenticated progress history separate from quiz attempts. The server checks the simulator ID, scenario and objective references against the published lesson and records only completion plus the number of answered checkpoints. It deliberately does not accept client-reported correctness and does not award mastery.

## Accessibility and test coverage

Native radio/checkbox/number inputs support keyboard operation; controls have visible focus treatment and labels; the current step exposes progress semantics; feedback uses a polite live region; no forced animation is used. Automated tests cover scenario parameter sensitivity, session state transitions, published-lesson sanitization and rendered accessibility landmarks. Manual assistive-technology and real-device validation remains outstanding.
