# Unified Learning Experience Plan — Repository Review & Single-PR Acceptance

**Review date:** 2026-11-25  
**Repository:** ashvins1912/Tutorial-Hub  
**Reviewed main commit:** 04bfabcfc9fb52371732a5eeb5382011c0aa40f3  
**Source of requirements:** User-approved “Tutorial Hub – Pattern Forge First, Unified Learning Experience Plan” (20 sections plus Definition of Done)  
**Purpose:** One traceable review and acceptance register for the consolidated implementation PR. This document is not a claim that every target is already implemented or content-verified.

## Executive decision

The repository has a meaningful foundation, but the approved plan is not complete end-to-end. The correct implementation strategy is one coordinated PR that adds missing shared foundations and regression protection while preserving existing academy behavior, canonical IDs, progress, and assessment history.

**Evidence reviewed:** shared learning contract, Pattern Forge curriculum builder, trace engine, mastery engine, pilot tests, quality standard, learning-surface registry and audit ledger, repository audit, and CI workflow history. This is a static repository review; no deployed browser, production database, mobile-device, screen-reader, or learner-study validation is claimed.

## Current evidence-based status

| Area | Observed in repository | Status / remaining acceptance |
|---|---|---|
| Shared five-stage lifecycle | `FIVE_STAGE_LIFECYCLE` defines Understand, Visualize, Implement, Practice, Master | Foundation exists; verify stage content and learner journey on every migrated academy |
| Canonical content contract | `shared/learningContract.ts` includes topic, lesson, problem, trace, assessment, mastery and governance types | Foundation exists; validate every academy adapter and migration |
| Pattern Forge curriculum | 28 canonical IDs are mapped; 3 reference pilots; 25 inventory-only topics | Partial; author and verify the remaining 25 before calling the curriculum complete |
| Activity target | Plan specifies 15 activity types per pattern (420 total across 28) | Target, not current inventory; audit actual authored counts and link each to objectives |
| Visualization | Deterministic trace engine and pilot fixtures/checkpoints exist | Partial; add/verify trace coverage, editable input validation, accessible text alternative and algorithm-to-trace fixtures for all published topics |
| Implementations | Pilot includes Java 21, JavaScript and Python examples and test suites | Partial; audit every published solution, all tiers/languages, runtime versions, boundaries and proofs |
| Practice | Progressive problem categories and pilot assessment content exist in contracts | Partial; ensure blind recognition, debugging, mixed-pattern and unseen-transfer activities are actually authored |
| Mastery | Shared dimension scoring and independent transfer/complexity evidence; 8-dimension gate tests | Foundation exists; audit server authority, persistence, idempotency and cross-academy evidence integration |
| Revision | Adaptive 1/3/7/14/30-day schedule and struggle behavior tested | Foundation exists; validate persisted revision lifecycle and delayed recall across academy routes |
| Verification governance | Status types, validators and honesty checks exist | Partial; require evidence and review history at each publication transition; structural validity must not imply correctness |
| Academy integration | `UNIFIED_CURRICULA` currently exports Pattern Forge curriculum | Not migrated platform-wide; implement adapters in waves without changing existing route behavior |
| Shared platform data | Existing progress models/routes and learning APIs exist | Needs entity/API mapping against the proposed entities; preserve historical attempts and mastery versions |
| Code execution safety | Security tests and guarded code-execution boundary exist | Do not claim a secure isolated sandbox without demonstrated OS/process isolation, resource limits, network denial and cleanup; no paid provider is authorized |
| Content quality | 22-surface registry and ledger map application areas | All surfaces remain not assessed; topic-level evidence, accessibility and reviewer records are required |
| Learner validation | No learner study evidence was inspected | Not validated; do not claim learning effectiveness or finalize metrics without baseline data |

## Full plan coverage matrix

Each section below is explicitly covered by this single-PR acceptance register. “Covered” means it has an implementation task and evidence gate, not that the feature is already complete.

1. **Vision and objective:** prove independent understanding, recognition, visualization, implementation, testing, transfer and retention. Acceptance: outcomes map to observable evidence, not engagement-only signals.
2. **Four-layer architecture:** shared experience, canonical content engine, domain academies and platform infrastructure. Acceptance: academy-specific teaching uses shared lifecycle/progress contracts; no unnecessary auth/database rewrite.
3. **Pattern Forge five stages:** Understand, Visualize, Implement, Practice, Master. Acceptance: complete stage assets, stage-specific evidence and consistent learner controls.
4. **Canonical content contract:** stable IDs, objectives, prerequisites, concepts, signals, anti-patterns, examples, traces, implementations, proof, complexity, mistakes, practice, assessment, mastery, revision, references, version and verification. Acceptance: schema validation and reasoned N/A only.
5. **28-pattern curriculum:** preserve existing canonical IDs and resolve naming aliases before migration. Acceptance: all 28 registered; published content has reviewed prerequisite DAG, objectives and actual activities. Plan target: 15 activity types per pattern, 420 total; target must not be reported as current completion.
6. **Visualization engine:** shared trace interfaces and separate execution/rendering. Acceptance: deterministic fixtures, state/invariant/operation snapshots, play/pause/step/reset/speed/progress, validated custom input, variable inspection, checkpoints and accessible fallback.
7. **Code verification:** source/problem/example/constraint verification, authoring, static validation, compilation, tests, boundary tests, complexity and technical/content approval. Acceptance: explicit runtime and test evidence; learner code is never run in the Express process.
8. **Pattern recognition:** constraint and structure reasoning, weighted rubric and delayed answer reveal. Acceptance: weights sum to 100, scoring is server-authoritative where applicable, feedback explains rationale, and unseen tasks test transfer.
9. **Mastery and revision:** independent dimensions and 1/3/7/14/30-day spaced recall. Acceptance: mastery requires independent evidence; struggle, hints and delayed recall adjust scheduling; no lesson-open/easy-problem shortcut.
10. **Unified data architecture:** curriculum/topic/prerequisite/lesson/stage/assets/problem/solution/test/assessment/attempt/evidence/revision/review/version entities. Acceptance: map to existing persistence before introducing migrations; preserve old records and stable IDs.
11. **Content governance:** Draft → Structurally Valid → Technically Reviewed → Code Verified → Content Verified → Learning Validated → Published. Acceptance: each transition has role, evidence and history; structural validation alone cannot publish.
12. **Academy migration:** Wave 1 algorithms/DSA; Wave 2 Java/Python/OOP/Full Stack/Database; Wave 3 System Design/DevOps/AI/Flight Simulator; Wave 4 learner intelligence. Acceptance: shared adapter per academy, compatibility and progress migration tests.
13. **16-week roadmap:** baseline, contracts, 3-pattern pilot, full Pattern Forge, learning intelligence, DSA migration, academy migration and final validation. Acceptance: use as sequencing/exit criteria; do not skip pilot gates for bulk generated content.
14. **Engineering workstreams:** architecture, content, frontend, visualization, execution, assessment, intelligence, migration, QA and analytics. Acceptance: each workstream has owners/outputs/evidence in the PR checklist.
15. **Testing strategy:** unit, integration, end-to-end learner journeys and educational correctness. Acceptance: explanations match code, traces match execution, expected outputs and boundaries are verified, progress persists, and critical regressions block release.
16. **Success metrics:** content quality, independent success, hint reliance, delayed recall, transfer and platform stability. Acceptance: establish actual usage baseline before setting targets; do not fabricate outcome metrics.
17. **Risks:** generated errors, duplicate structures, scope, unsafe execution, mastery inflation, migration regressions and performance. Acceptance: status separation, canonical contracts, pilot-first, sandbox threat model, independent evidence, migration regression and lazy-loading.
18. **Definition of Done:** Pattern Forge foundation, five stages, three languages, verified traces/solutions, mastery/revision, DSA/academy integration, security/accessibility/performance/rollback. Acceptance: checklist evidence per item; “not assessed” remains explicit where not yet tested.
19. **Recommended order:** audit → contracts → shared experience → three pilots → verify → 28 patterns → intelligence → DSA/algorithms → remaining academies → unified profile → regression → release. Acceptance: keep this dependency order.
20. **Scope boundaries and product direction:** prioritize reusable learning standard; avoid new academies, bulk unverified questions, unnecessary UI/database/auth rebuilds, microservices for appearance or premature AI. Acceptance: changes stay within approved scope and preserve existing behavior.

## Consolidated PR acceptance checklist

### Required implementation and regression evidence
- [ ] Canonical IDs and existing routes/API contracts remain compatible.
- [ ] All 28 Pattern Forge IDs are registered and prerequisite graph is valid.
- [ ] Three pilots remain technically verified and regression-tested.
- [ ] Remaining 25 topics are explicitly inventory/unpublished until full authoring and review evidence exists.
- [ ] Content activity counts are measured from actual records, not target constants.
- [ ] Stage contracts, trace invariants, checkpoints and final states are tested.
- [ ] Java 21, modern JavaScript and Python 3.12 published solutions are verified against declared test suites.
- [ ] Mastery dimensions remain independent and server-side evidence cannot be inflated by client-supplied scores.
- [ ] Revision updates are based on recall performance and persisted safely.
- [ ] Academy adapters preserve progress and historical attempts.
- [ ] Validators check IDs, prerequisite DAG, objectives, status transitions, version integrity and evidence references.
- [ ] Security tests ensure untrusted code is not executed in the application server; sandbox readiness is not claimed without isolation evidence.
- [ ] CI: type-check, content-authoring tests, learning-engine tests, inventory/ledger validators and production build pass.
- [ ] No deployment, paid provider, hosting change or external cost.

### Release blockers
Incorrect algorithm explanation; failing verified solution; trace/code disagreement; unsupported mastery; lost progress; broken auth/authorization; critical sandbox vulnerability; inaccessible core interaction; or failing regression suite.

## Single-PR scope and truthful completion rule

The work should land through **one consolidated PR** from the approved branch. Add commits to that branch as the crosswalk and regression gates are implemented; do not open separate feature PRs for this initiative.

The PR can be described as complete only for the implementation and evidence actually delivered in its diff. It must not claim the 25 inventory topics, all 420 target activities, all 22 surfaces, production sandbox, accessibility review or learner effectiveness are complete unless the corresponding artifacts and validation are present. Remaining topic authoring/reviewer/learner evidence must stay visible as open acceptance items rather than being converted to “verified” by documentation alone.


## Concrete curriculum and platform requirements from the source plan

### The 28 canonical pattern families

Preserve existing canonical IDs and reconcile aliases before migration. The source plan names:

1. HashMap and HashSet
2. Prefix Sum and Difference Array
3. Two Pointers — Opposite Ends
4. Two Pointers — Same Direction
5. Sliding Window — Fixed Size
6. Sliding Window — Variable Size
7. Sorting Patterns
8. Intervals
9. Matrix Traversal
10. Kadane's Algorithm
11. Fast and Slow Pointers
12. Linked List Reversal
13. Monotonic Stack
14. Monotonic Queue
15. Binary Search
16. Rotated Binary Search
17. Binary Search on Answer
18. Heap and Priority Queue
19. K-way Merge
20. Tree DFS
21. Tree BFS
22. Trie
23. Graph BFS and DFS
24. Topological Sort
25. Union-Find
26. Dijkstra and Weighted Graphs
27. Backtracking
28. Dynamic Programming

### Minimum authored activities per pattern (target, not current completion)

| Activity | Target per pattern |
|---|---:|
| Conceptual examples | 2 |
| Interactive traces | 3 |
| Brute-force comparisons | 2 |
| Coding problems | 3 |
| Edge-case challenges | 2 |
| Debugging exercise | 1 |
| Mixed-pattern problem | 1 |
| Unseen transfer exercise | 1 |
| **Total** | **15 (420 across 28)** |

The inventory must count actual authored and linked activities. A target constant, generated blueprint, empty placeholder or lesson title does not count as an activity.

### Recognition rubric and mastery dimensions

The source plan's proposed recognition weights are structural understanding 20%, pattern identification 25%, data-structure selection 15%, constraint reasoning 15%, complexity analysis 15%, and alternative-approach evaluation 10%. Validate the total is 100%; calibrate only against learner evidence.

Track the source plan's eight independent mastery dimensions: understanding, pattern recognition, visualization, implementation, correctness, complexity analysis, debugging and transfer ability. The full-platform quality standard additionally calls for teach-back, communication and delayed retention as evidence dimensions/signals where applicable.

### Revision schedule

Start with Day 1, 3, 7, 14 and 30. Adjust using mistakes, assessment scores, hints, time taken, delayed recall and repeated failures. A struggle should trigger reinforcement/relearning rather than silently advance the learner.

### Proposed shared entities

Curriculum; Topic; TopicPrerequisite; Lesson; LessonStage; LearningAsset; Problem; ProblemSolution; TestSuite; Assessment; AssessmentAttempt; MasteryEvidence; RevisionSchedule; ContentReview; ContentVersion.

### Proposed API surface (design target, not a claim of existing routes)

- `GET /api/learning/curricula`
- `GET /api/learning/topics`
- `GET /api/learning/topics/:id`
- `GET /api/learning/topics/:id/lessons`
- `GET /api/learning/lessons/:id`
- `GET /api/learning/problems`
- `GET /api/learning/problems/:id`
- `POST /api/learning/assessments/:id/attempts`
- `GET /api/learning/mastery`
- `GET /api/learning/revisions`
- `POST /api/learning/revisions/:id/attempts`

Before adding routes or tables, reconcile with current routes/models, enforce authenticated ownership, idempotency and version-aware evidence, and preserve existing progress/assessment history.

### Migration waves

- **Wave 1 — algorithms/DSA:** Pattern Forge, DSA Academy, Algorithms Studio, Universal Problem Solver, Interview Problem Catalog and Revision Hub.
- **Wave 2 — core engineering:** Java, Python, OOP/design patterns, Full Stack and Database Internals.
- **Wave 3 — advanced engineering:** System Design, DevOps/Cloud, AI Engineering and Flight Simulator.
- **Wave 4 — learning intelligence:** unified learner profile, cross-academy skill graph, adaptive recommendations, cross-topic assessments, interview readiness and analytics.

Each wave must include adapters, content conversion, duplicate logic removal where safe, learner-progress preservation, route/navigation compatibility and regression tests.

### QA and release gates

Run unit tests for schema, prerequisites, mastery, revision, complexity metadata and trace generation; integration tests for content retrieval, assessment submission, progress persistence, mastery, revision and version changes; end-to-end learner journeys from topic open through revision; and educational tests for explanation/code/trace/output agreement, edge cases, objective mapping and evidence-based mastery.

Release blockers include incorrect explanations, failing verified code, contradictory visualization, unsupported mastery, critical sandbox vulnerabilities, lost learner progress, broken authentication/authorization or unresolved critical regressions. Also validate responsive layout, accessibility, API performance, security, monitoring/logging, backup/recovery and rollback before production release.

### Success measures and risk controls

Measure published-content contract coverage, verified solutions and trace fixtures, objective-linked assessments, first-attempt success, hint improvement/dependence, independent problem solving, delayed recall, unseen transfer, stage time, misconceptions and retention. Establish a baseline before setting outcome targets.

Mitigate generated-content errors with distinct draft/verified states and technical review; duplicate learning logic with one canonical contract; scope risk with three reference pilots first; unsafe execution with an approved isolated sandbox; mastery inflation with independent evidence; migration regression with compatibility tests; and performance/bundle growth with lazy-loaded content and visualization, published-content caching and no all-problem eager loading.
