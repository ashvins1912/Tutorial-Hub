# Application-wide content quality audit and review standard

**Audit date:** 2026-11-25  
**Baseline:** `main` at `512c342ac17825398b9aafde24b706ecd1d9a3a6`  
**Scope:** All 21 registered learning surfaces in `docs/learning-surface-registry.json`  
**Method:** Static source and curriculum review. Browser walkthroughs, learner studies, screen-reader testing and subject-matter sign-off are not claimed.

## 1. Purpose and evidence boundary

This initiative makes content quality measurable without confusing source-code presence with a complete lesson. The machine-readable ledger at `docs/learning-content-quality-audit.json` covers every registered surface and identifies its review focus, priority and evidence still required.

The current ledger deliberately records every surface as `contentStatus: not_assessed` and `verificationStatus: not_assessed`. This is not a negative judgement about all of its lessons. It means there is not yet a complete, topic-by-topic evidence trail that justifies a stronger claim.

The audit has three distinct levels:

1. **Surface inventory:** which learner-facing areas, components, data sources, routes and tests exist.
2. **Topic/lesson quality:** whether each actual topic and subtopic teaches the required material accurately and coherently.
3. **Learner validation:** whether learners can independently explain, implement, debug, transfer and retain the knowledge.

A passing registry validator proves path integrity only. A passing content audit validator proves ledger completeness and honest status semantics only. Neither proves that the lessons are correct.

## 2. Universal lesson contract

Every applicable topic should provide:

| Dimension | Required evidence |
|---|---|
| Orientation | Audience, level, purpose, prerequisites, scope and measurable outcomes |
| Explanation | Plain-English intuition, vocabulary, formal model, assumptions and mechanism |
| Worked examples | Complete input, intermediate states, output and reasoning |
| Visual reasoning | Diagram or trace tied to the same topic and learning objective |
| Implementation | Runnable code, query, configuration or design artifact with version/context |
| Correctness | Invariant, proof, validation rule or explicit rationale appropriate to the domain |
| Complexity and trade-offs | Time/space, latency, throughput, cost, operational and security implications where applicable |
| Failure learning | Edge cases, counterexamples, common misconceptions and debugging exercises |
| Practice | Guided, independent and progressively harder exercises |
| Assessment | Questions/tasks explicitly mapped to learning outcomes, with explanatory feedback |
| Transfer | At least one new-context or changed-constraint exercise |
| Retention | Retrieval prompts and scheduled review evidence |

An item may be marked not applicable only with a written rationale. It must not silently disappear.

## 3. Topic scorecard rubric

Score each **individual topic**, not the entire surface, on a 0–4 scale:

| Score | Meaning |
|---:|---|
| 0 | Missing, misleading or materially incorrect |
| 1 | Mentioned or outlined; learner cannot reliably explain it |
| 2 | Basic explanation exists; examples, depth or practice are incomplete |
| 3 | Complete teaching unit with examples, practice and objective-linked assessment |
| 4 | Independently reviewed, technically verified and validated for transfer/retention |

Use these dimensions:

- Coverage and prerequisites
- Explanation clarity and technical depth
- Worked examples and implementation
- Visualization/trace correctness
- Edge cases, failure modes and debugging
- Assessment and feedback
- Transfer and retention
- Accessibility and learner usability

A score of 3 or 4 requires linked evidence. A score of 4 additionally requires reviewer identity/role, review date, tested versions/fixtures and relevant learner-validation evidence. Do not average away a critical failure: a materially incorrect explanation, unsafe code sample or broken assessment blocks publication regardless of the numeric average.

Suggested release thresholds:
- **Ready for review:** no critical correctness/security issue; all applicable sections present.
- **Content complete:** average at least 3.0; no applicable dimension below 2; every objective assessed.
- **Verified:** content complete plus technical review and reproducible example/visual fixtures.
- **Learning validated:** verified plus independent transfer and delayed-recall evidence.

These are content gates, not learner mastery thresholds.

## 4. Surface review register

The JSON ledger contains all 22 registered surfaces, including the Pattern Forge five-stage workspace added on 2026-11-25. Priority indicates audit sequencing, not a claim that the surface is defective.

| Priority | Surfaces | First review focus |
|---|---|---|
| P0 | Knowledge engine, DSA workspace, algorithms, database internals, system design | Lesson completeness, objective binding, correctness and executable/trace evidence |
| P1 | AI Academy, AI engineering, DevOps/cloud, languages, OOD, full-stack, fuzzy search, flight simulator, solver, roadmap, skill tree, revision | Domain-specific depth, examples, failure scenarios, assessment and transfer |
| P2 | Schemas, sprint, community, profile | Reference freshness, feedback quality, progress semantics and separation from mastery |

The surface ledger maps existing paths; it is not yet a complete nested lesson inventory. The next data migration should add stable topic IDs and subtopic IDs from the canonical content sources without inventing IDs or duplicating canonical content.

## 5. Domain-specific review requirements

- **DSA/algorithms:** brute force before optimization, invariant/proof, complexity derivation, edge cases, runnable Java/TypeScript/Python examples where appropriate, trace fixtures and unseen variations.
- **Java/Python/runtime:** language and runtime version, memory model, concurrency semantics, exceptions, performance assumptions and executable tests.
- **Database:** engine/version, schema/data assumptions, query plan evidence, index trade-offs, transaction anomalies, lock behavior, recovery and failure handling. Do not present a deterministic teaching fixture as actual database execution.
- **System design/distributed systems:** workload assumptions, capacity math, bottlenecks, queueing, backpressure, retries, idempotency, consistency, partitions, observability and recovery. Distinguish illustrative simulation from production-grade modeling.
- **DevOps/cloud:** provider/service versions, IAM, network boundaries, secret handling, Terraform state, deployment/rollback, CI failure diagnosis, cost and operational ownership.
- **AI/ML/LLM:** model/data assumptions, evaluation, retrieval quality, hallucination and prompt-injection risks, agent tool boundaries, latency/cost and production monitoring.
- **Full-stack/OOD:** end-to-end request lifecycle, framework internals, security, performance, design alternatives, refactoring and pattern misuse.
- **Fuzzy search:** metric definition, dataset, precision/recall, threshold trade-offs, pruning guarantees and reproducible evaluation.
- **Revision/progression:** canonical objective linkage, misconception-aware retrieval, delayed recall and no mastery inference from opens or self-attested completion.

## 6. Implementation sequence

1. Establish the machine-readable surface ledger and validator (this PR).
2. Build canonical topic/subtopic inventories from existing data sources; detect duplicates, orphan content and missing mappings.
3. Generate topic-level scorecards and identify the lowest-evidence/highest-impact gaps.
4. Select one representative pilot lesson per major domain and bring it to the complete lesson contract.
5. Add executable example fixtures and expected-state visual/simulator fixtures.
6. Map assessments to objectives and add transfer tasks.
7. Add keyboard, screen-reader, reduced-motion and mobile acceptance evidence for interactive surfaces.
8. Expand the verified lesson pattern domain by domain; do not bulk-mark existing lessons complete.

## 7. Non-negotiable integrity rules

- Never infer content completeness from file size, number of titles, number of questions or presence of a component.
- Never infer technical correctness from rendering or structural validation.
- Never label a simulator production-realistic if it uses deterministic teaching fixtures.
- Never infer mastery from lesson opens, simulator completion or quiz completion alone.
- Keep learner mastery, content quality, code verification, visualization verification and accessibility evidence separate.
- Preserve existing content IDs, learner progress keys, authentication and security boundaries during curriculum migration.
- No deployment, paid service, external execution provider or hosting change is part of this audit.

## 8. Current baseline and honest status

The registry contains 21 surfaces. The audit ledger covers those 21 surfaces and preserves their `not_assessed` content and verification states until topic-level evidence exists. The repository already has stronger evidence in selected DSA pilot lessons and AI Academy curriculum tests; those local tests should be linked to the exact lesson IDs in a later topic-level ledger rather than generalized to an entire surface.

**Exit condition for this PR:** ledger coverage, path integrity, status integrity and CI validation. It does not claim that all lessons have been rewritten or verified.
