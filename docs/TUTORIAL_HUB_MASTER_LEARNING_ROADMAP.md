# Tutorial-Hub — Master Learning Quality & Enhancement Roadmap

**Status:** Proposed implementation baseline  
**Date:** 2026-11-23  
**Repository:** https://github.com/ashvins1912/Tutorial-Hub  
**Target branch:** `main` (review only; this roadmap is not authorization to merge or deploy)  
**Guiding principle:** Teach understanding, not memorization. Measure capability, not content consumption.

---

## 1. Product vision

Tutorial-Hub should take a learner from first principles to confident, independent engineering practice. Every learning path should connect:

1. **Understand** — build an accurate mental model and learn prerequisites.
2. **Visualize** — inspect the concept's real internal state and transitions.
3. **Derive** — reason from the problem and constraints instead of memorizing a template.
4. **Implement** — write, debug and compare correct implementations.
5. **Practice** — progress from guided work to independent and unfamiliar tasks.
6. **Prove** — justify correctness, assumptions and complexity.
7. **Master** — demonstrate retention and transfer after a delay.
8. **Apply** — use the concept in a realistic engineering project.

The goal is not maximum lesson count. The goal is verified learning outcomes, coherent curriculum, accurate implementation and useful practice.

## 2. Repository baseline and evidence

The following baseline is based on the inspected repository files and documentation. It is not a claim that every screen, route or runtime behavior has been exhaustively tested.

| Area | Existing evidence | Gap / interpretation |
|---|---|---|
| DSA curriculum | Roadmaps, topic index, complete lesson records and topic studios | Coverage records and lesson blueprints do not prove every problem is fully authored and verified |
| Interview inventory | 293 topic-scoped questions and five-stage blueprints documented in the DSA audit | Problem-specific statements, constraints, implementations, tests and traces still require evidence |
| Learning methodology | Five-stage DSA playbook | Extend consistently across all academies without creating competing frameworks |
| Visual learning | Topic-specific step generators and visualization renderers | Validate algorithm-specific coverage, correctness, accessibility and editable inputs |
| Interactive runtime | Documented deterministic binary-search and bubble-sort trace labs | Do not imply arbitrary learner code is executed |
| Learner progress | Authenticated progress API and MongoDB persistence documented | Quiz score alone is insufficient proof of mastery |
| AI Engineering Academy | Seven phases and 77 structured lessons documented | Subject-matter review and environment-specific release checks remain |
| Code execution | Explicitly unavailable on Render Free in current deployment boundary | Keep disabled unless a separately approved, genuinely isolated provider is demonstrated |
| Content authoring | Authoring, preview, visualization and publishing flows documented | Add a quality lifecycle and verification evidence |
| Platform UX | React/Vite application with lazy-loaded studios | Audit navigation, mobile, accessibility, search and performance systematically |

### Important DSA baseline

The existing DSA coverage audit documents 293 questions across 22 groups. The initial strict title audit found 99 exact matches, 21 related/partial matches and 173 missing exact-title matches. Later work added inventory records and five-stage blueprints for the 293-question set.

**Do not report 293 fully completed lessons.** The audit explicitly says that the inventory and blueprints are not equivalent to 293 source-verified, tested, visually validated lessons. Preserve this distinction in APIs, UI, reports and progress metrics.

### Existing documentation to treat as source of truth

- `docs/DSA_MASTER_QUESTION_COVERAGE_AUDIT.md`
- `docs/DSA_LEARNING_STAGE_PLAYBOOK.md`
- `docs/INTERACTIVE_LEARNING_RUNTIME.md`
- `docs/CONTENT_VISUALIZATION_ENGINE.md`
- `docs/LEARNER_MASTERY_AND_CODE_EXECUTION.md`
- `docs/AI_ACADEMY_PRODUCTION_READINESS.md`

Before changing an area, inspect its current implementation and tests. Reuse existing components and contracts wherever possible.

---

## 3. Non-negotiable engineering constraints

1. Preserve existing academies, specialized simulators, user progress, authentication and published learning content.
2. Do not replace a working feature merely to standardize its appearance. Prefer adapters and incremental migration.
3. Do not duplicate canonical lessons, topics, question records or visualizers. Establish canonical IDs and explicit aliases.
4. Never promote a generated blueprint to verified content without the required evidence.
5. Never fabricate problem statements, constraints, sample outputs, expected results, citations or answer keys.
6. Keep quiz answer keys and trusted grading on the server.
7. Do not execute learner-provided code in the application server, browser via `eval`, shell, Node VM or an unisolated process.
8. Keep code execution unavailable unless a separately approved provider proves OS/process isolation, network denial, filesystem controls, CPU/memory/time/output limits and cleanup.
9. Do not introduce paid APIs, external providers, workers, databases, hosting or infrastructure without explicit approval.
10. No deployment or production configuration changes are part of this roadmap.
11. Work on a review branch. Do not merge to `main` without explicit approval.
12. Every phase requires tests, a coverage report and a reviewable pull request.

---

## 4. Universal lesson contract

Use the existing five-stage DSA playbook as the starting point. Normalize its ideas into this shared contract; do not force every subject into an algorithm-specific template.

### A. Understand
- Learning objectives and observable outcomes.
- Prerequisites with links to canonical lessons.
- Problem or real-world motivation.
- Plain-language explanation and analogy, including where the analogy breaks.
- Formal model, vocabulary, assumptions and constraints.
- Recognition signals and anti-signals.
- Common misconceptions and a prediction checkpoint.

### B. Visualize
- A visualization selected for the actual subject and data model.
- Initial state, one meaningful transition per step and final state.
- State ledger: variables, structures, invariants, inputs and outputs.
- Why each transition is valid.
- Failure, invalid-input or counterexample path where applicable.
- Play/pause, previous/next, reset, speed and seek when appropriate.
- Editable inputs with deterministic regeneration.
- Keyboard access, mobile layout and reduced-motion alternative.

### C. Derive and implement
- Start with the direct or naive approach when pedagogically appropriate.
- Identify the actual bottleneck and derive the improvement.
- Language-neutral steps or pseudocode.
- Verified implementation(s) for the languages supported by that learning path.
- Line-level explanations for important decisions.
- Normal, boundary and adversarial examples.
- Complexity, memory, assumptions and trade-offs.
- Correctness argument: invariant, induction, exchange argument, recurrence, protocol reasoning or another suitable method.

### D. Practice and assess
- Complete original problem statement, input/output contract and constraints.
- Guided trace and progressive hints.
- Independent implementation or subject-appropriate applied task.
- Variations and mixed/unseen challenges.
- Hidden edge cases where execution is supported.
- Explanatory feedback that identifies the failed assumption, not just a score.

### E. Master and apply
- Explain-back or teach-back check.
- Fresh trace or worked scenario.
- Independent implementation/design task.
- Correctness and trade-off defense.
- Delayed retrieval at 1, 3, 7, 14 and 30 days.
- A realistic application or project.

Not every item applies identically to every topic. The authoring schema must support subject-specific requirements and explicitly mark non-applicable items with a reason rather than generating filler.

---

## 5. Content quality lifecycle

Every topic, lesson and problem must expose a truthful quality state:

1. `missing` — required content does not exist.
2. `inventory` — title/metadata exists; no complete lesson is claimed.
3. `blueprint` — lesson structure and authoring checklist exist.
4. `draft` — substantive content authored, not yet reviewed.
5. `technical_review` — awaiting subject-matter validation.
6. `code_verified` — applicable code compiles/runs against declared tests.
7. `visual_verified` — visualization state matches the canonical algorithm/model.
8. `assessment_verified` — prompts, rubrics and server-side grading reviewed.
9. `published` — all required checks pass and publication is authorized.
10. `needs_maintenance` — a dependency, version, source or review date requires reassessment.

A lesson may have multiple independent verification dimensions. Do not collapse them into one optimistic boolean.

### Required evidence metadata

- Canonical topic/lesson/problem ID.
- Prerequisite IDs.
- Author and reviewer identifiers where available.
- Content version and last-reviewed date.
- Source/reference metadata where applicable.
- Code language, runtime version, test-suite reference and result.
- Visualization type, trace fixture and verification result.
- Assessment/rubric version.
- Known limitations and non-applicable checks.
- Publication state and change history.

No fabricated reviewer, source or verification result is allowed.

---

## 6. Prioritized workstreams

### P0 — Establish truth and close the learning-quality gap

#### P0.1 — Repository-wide content and feature inventory
- Enumerate all academies, topics, lessons, problem banks, simulators, routes and authoring surfaces.
- Map each surface to its canonical data source, component, API, persistence model and tests.
- Detect duplicate topics, duplicate problem records, aliases and conflicting explanations.
- Map each topic to prerequisites and downstream learning paths.
- Produce a machine-readable coverage report and human-readable audit.
- Mark inventory-only and blueprint-only material accurately.

**Acceptance criteria**
- Every visible learning surface maps to one canonical source or has a documented migration plan.
- Duplicate and alias handling is explicit and tested.
- The report distinguishes missing, inventory, blueprint, authored and verified content.
- Existing content is not silently deleted or overwritten.

#### P0.2 — DSA 293-question verification
- Reconcile all 293 topic-scoped slugs with canonical problem records.
- Verify title, source attribution, statement, examples and constraints.
- Author original explanations; do not copy proprietary editorials.
- Verify brute-force/better/optimal approaches where applicable.
- Verify Java, JavaScript/TypeScript and Python implementations where supported.
- Add normal, boundary, duplicate, adversarial and randomized tests as appropriate.
- Verify complexity and correctness reasoning.
- Generate deterministic traces from the same algorithm implementation or a shared trace contract.
- Add progressive hints, assessment and revision metadata.

**Acceptance criteria**
- Exactly one canonical record per requested topic-scoped problem ID.
- Every record has a truthful quality state.
- No record is marked verified without linked evidence.
- CI reports coverage by topic and quality state.
- Partial variants remain related variants unless equivalence is proven and explicitly declared.

#### P0.3 — Universal learning experience
- Reuse and adapt the DSA playbook for backend, frontend, databases, system design, DevOps and AI.
- Create shared authoring types and validation without flattening subject-specific differences.
- Add prerequisite navigation and knowledge bridges.
- Standardize lesson sections, terminology and progress semantics.
- Provide beginner explanations without removing technical depth.

**Acceptance criteria**
- Existing lessons render through compatibility adapters where needed.
- No breaking change to current lesson IDs, saved progress or published links.
- Tests validate required sections by subject type.

#### P0.4 — Visualization correctness and coverage
- Inventory every visualizer and supported visualization type.
- Build a topic-to-visualizer coverage matrix.
- Prioritize arrays, strings, pointers, recursion, trees, graphs, DP, concurrency, JVM, SQL execution and distributed-system flows.
- Use deterministic fixtures and compare each visual state against the underlying algorithm/model.
- Expose state ledgers, invariants, failure modes and explanation per step.
- Ensure editable input, reset, navigation, keyboard support and reduced-motion behavior.

**Acceptance criteria**
- No visualization is labelled verified without deterministic fixtures and tests.
- Every published visual trace has a final state consistent with its expected output.
- Unsupported diagram syntax is clearly disclosed rather than rendered as if correct.
- Existing specialized simulators remain available.

#### P0.5 — Mastery and retention
- Separate lesson consumption, quiz performance, practice completion and demonstrated mastery.
- Add explain-back, independent implementation/design, fresh variation and delayed recall.
- Use server-owned grading/rubrics for authoritative assessments.
- Persist evidence and attempts under authenticated user ownership.
- Add review scheduling without creating duplicate progress records.

**Acceptance criteria**
- A learner cannot gain expert mastery solely by opening lessons or passing one quiz.
- Mastery dimensions and promotion rules are explainable.
- Progress is isolated by authenticated user.
- Database-unavailable behavior remains explicit; no fake persistence.

#### P0.6 — Content quality and publishing gates
- Add author/reviewer workflow and versioned review evidence.
- Validate links, code blocks, examples, diagrams, quizzes and prerequisite references.
- Require technical review for high-risk or fast-changing subjects.
- Keep drafts private and publication permissions enforced.

**Acceptance criteria**
- Draft, reviewed and published states are visibly distinct.
- Publishing fails closed when required checks are missing.
- Changes to a published lesson create a traceable version.

### P1 — Complete the engineering curriculum

Only add a new module after P0.1 confirms that equivalent high-quality content does not already exist.

#### P1.1 — Computer science foundations
- Operating systems: process/thread, scheduling, virtual memory, paging, filesystems.
- Networking: TCP/IP, DNS, HTTP, TLS, HTTP/2/3, WebSockets.
- Computer architecture: CPU, cache, registers, memory hierarchy.
- Compiler/runtime: parsing, AST, bytecode, JIT and garbage collection.
- Concurrency: locks, atomics, race conditions, deadlocks and memory models.
- Security: identity, authorization, OWASP, cryptography and threat modelling.
- Performance: profiling, allocation, contention and bottleneck analysis.

#### P1.2 — Java and backend engineering
- JVM internals, class loading, heap/stack, GC and Java Memory Model.
- Collections internals and complexity.
- Executors, CompletableFuture, ForkJoinPool and virtual threads.
- Spring IoC, bean lifecycle, proxies, auto-configuration and request pipeline.
- Spring Security, OAuth2/OIDC, JWT, CSRF and authorization.
- JPA/Hibernate lifecycle, caching, N+1 and transaction boundaries.
- REST/gRPC, API contracts, resilience and observability.
- Kafka ordering, partitions, consumer groups, retries and DLQ.
- Distributed transactions, saga, idempotency and outbox.
- JUnit, Mockito, integration testing and Testcontainers.

#### P1.3 — Frontend engineering
- JavaScript runtime, event loop, closures, prototypes and memory.
- TypeScript advanced types and API contracts.
- React rendering, reconciliation, hooks and state architecture.
- Server Components and server/client boundaries.
- Browser rendering, layout, paint and compositing.
- Accessibility, performance, security and testing.
- Production frontend architecture and deployment.

#### P1.4 — Database engineering
- PostgreSQL, MySQL and MongoDB internals.
- B-tree indexes, query planning and EXPLAIN ANALYZE.
- MVCC, isolation, locking and deadlocks.
- Connection pools, replication, partitioning and sharding.
- Backup, recovery, migration and operational reliability.
- Vector search and retrieval systems.

#### P1.5 — System design and distributed architecture
- Client/server, API gateway, load balancing, cache and queues.
- Consistency, replication, partition tolerance and consensus.
- Idempotency, ordering, retries, backpressure and rate limits.
- Resilience, circuit breakers, bulkheads and graceful degradation.
- Multi-region, disaster recovery, SLOs and capacity planning.
- Real-world case studies with diagrams, APIs, schema, failure modes and trade-offs.

#### P1.6 — Cloud, DevOps and platform engineering
- AWS IAM, VPC, subnetting, routing and security groups.
- Docker image, networking, volumes and security.
- Kubernetes workloads, services, ingress, scheduling and storage.
- Terraform state, modules, plans and drift.
- CI/CD, GitOps, blue-green and canary deployment.
- Secrets, observability, incident response and cost optimization.

#### P1.7 — AI engineering
- Transformer and attention internals.
- Training, evaluation, fine-tuning, quantization and inference.
- RAG ingestion, chunking, retrieval, reranking and evaluation.
- Vector index trade-offs and hybrid search.
- Agent reliability, tool permissions, approvals and memory.
- MCP interoperability and security.
- AI observability, cost and production operations.

### P1 — Platform usability and accessibility
- Global search across academies, topics, lessons and problems.
- Prerequisite-aware learning paths and clear progress.
- Mobile-friendly visualizers and code editors.
- Keyboard and screen-reader accessibility.
- Reduced-motion and readable diagram alternatives.
- Performance budgets and lazy-loading checks.
- Offline/exportable notes where existing architecture permits.
- Repository README, contribution guide and explicit licensing decision.

### P2 — Advanced learning experiences
- Multi-service architecture sandbox.
- Distributed-system fault injection simulator.
- JVM and garbage-collection lab.
- SQL query-plan and lock visualizer.
- Concurrency/race-condition simulator.
- Cloud deployment topology lab using mock/local scenarios.
- Realistic capstone projects and expert design reviews.
- Adaptive practice based on demonstrated misconceptions, not quiz score alone.

---

## 7. Quality gates and measurement

Track these separately; do not combine them into a misleading single completion percentage.

| Metric | Required interpretation |
|---|---|
| Inventory coverage | Required topic/problem IDs with canonical records |
| Authored coverage | Records with substantive lesson content |
| Verified code coverage | Applicable implementations passing declared tests |
| Visualization coverage | Published visualizers with validated fixtures |
| Assessment coverage | Reviewed questions/rubrics and trusted grading |
| Prerequisite coverage | Valid prerequisite links with no cycles unless explicitly supported |
| Publication coverage | Lessons passing all applicable gates |
| Mastery coverage | Learners demonstrating independent evidence |
| Retention | Delayed recall and transfer performance |
| Accessibility | Automated checks plus manual keyboard/screen-reader review |
| Reliability | API, persistence, error and performance checks |

### CI and review gates
- TypeScript/type check and production build.
- Unit and integration tests for affected features.
- Content schema and canonical-ID validation.
- Duplicate/alias and prerequisite graph checks.
- Problem-specific code tests where execution is available in a safe test environment.
- Visualization fixture tests.
- Server-side quiz answer-key parity.
- Authorization and progress-isolation tests.
- Accessibility checks for changed components.
- Regression tests for existing studios and simulators.
- PR summary showing coverage before and after.

A green build alone does not establish curriculum correctness. Subject-matter review and content evidence remain required.

---

## 8. Delivery sequence

| Sequence | Deliverable | Exit condition |
|---|---|---|
| 0 | Repository inventory and feature map | All existing surfaces and owners/data sources mapped |
| 1 | Canonical content and quality model | IDs, lifecycle states, evidence and aliases validated |
| 2 | DSA verification pilot | A representative topic passes full content/code/visual/assessment gates |
| 3 | DSA 293-question completion | Per-topic evidence report and verified records |
| 4 | Shared lesson experience | Existing academies work through compatible contracts |
| 5 | Visualizer coverage expansion | Deterministic topic-specific traces and tests |
| 6 | Mastery and retention | Independent evidence and delayed review are persisted safely |
| 7 | CS and engineering curriculum | Priority modules authored and reviewed |
| 8 | UX, accessibility and performance | Audited experience with regression evidence |
| 9 | Advanced labs and capstones | Safe, tested simulations and applied projects |

Deliver in small, reviewable PRs or logically grouped PRs. Do not combine broad content expansion, schema migration and major UI replacement into one high-risk change.

---

## 9. First implementation sprint

The first sprint is an audit-and-foundation sprint, not a mass lesson-generation sprint.

1. Generate the repository feature inventory and canonical content map.
2. Reconcile all DSA question IDs against actual content records.
3. Identify existing visualizers and map them to topic IDs.
4. Define a quality-state schema compatible with current content.
5. Add validation tests for IDs, quality states, prerequisites and required evidence.
6. Select one representative DSA topic as a full-quality pilot.
7. Record baseline test results and known gaps.
8. Publish a review report before scaling the pattern to all topics.

**Sprint exit:** no existing feature removed; baseline and gaps are reproducible; quality states are truthful; pilot acceptance criteria are testable; CI is green.

---

## 10. Definition of done

A topic is complete only when it is:

- Correct and technically reviewed.
- Understandable at the intended learner level.
- Connected to prerequisites.
- Visualized appropriately where visual learning helps.
- Implementable or applicable with verified examples.
- Tested against normal and edge cases where applicable.
- Supported by meaningful practice and feedback.
- Assessed independently of lesson consumption.
- Connected to delayed recall and transfer.
- Versioned and maintainable.

A platform release is ready for review only when existing features remain intact, changed paths have regression coverage, CI is green, and the PR reports evidence rather than claims.

**Final principle:** Do not optimize for the number of topics displayed as complete. Optimize for the number of learners who can independently explain, implement, reason about and apply what they learned.


---

## 11. Definition of a perfect learning platform — exhaustive acceptance checklist

This section turns the high-level definition of quality into explicit, reviewable requirements. It is the acceptance contract for each topic, lesson, problem, visualizer and learning-path release. A checkbox is not considered complete because a component exists: reviewers must be able to inspect the evidence.

### 11.1 Topic and lesson acceptance

For every published topic, validate all applicable items:

- [ ] **Learning outcome:** State what the learner will be able to explain, implement, analyze or build. Outcomes must be observable and assessable, not vague statements such as "understand Java".
- [ ] **Prerequisites:** List required concepts and link to canonical lessons. Provide a diagnostic or bridge when a prerequisite is missing. Detect broken links and prerequisite cycles.
- [ ] **Concept explanation:** Explain the problem, motivation, vocabulary, mental model, formal definition and assumptions in a logical progression.
- [ ] **Beginner-to-advanced depth:** Start with intuition and a small example, then add formalism, edge cases, trade-offs and advanced applications without hiding important details.
- [ ] **Analogy quality:** Use analogies only where they clarify; explicitly explain where each analogy stops matching reality.
- [ ] **Worked examples:** Include a complete example with input, intermediate reasoning/state, output and explanation. The learner should be able to reproduce it.
- [ ] **Implementation:** Include runnable or otherwise verifiable examples appropriate to the subject. State language, framework, version, setup and expected behavior. Never present pseudocode as tested executable code.
- [ ] **Line-by-line explanation:** Explain important decisions, data transformations, API interactions and non-obvious statements. Avoid mechanically describing every syntax token.
- [ ] **Correctness and reasoning:** Include proof, invariant, derivation, protocol argument, design rationale or another discipline-appropriate correctness explanation.
- [ ] **Complexity and trade-offs:** Explain time, space, latency, throughput, cost, operational complexity or other relevant dimensions. State assumptions and workload where measurements are shown.
- [ ] **Edge cases:** Cover boundary, invalid, empty, large, duplicate, failure and adversarial cases as relevant. Explain expected behavior.
- [ ] **Common mistakes:** Document misconceptions, anti-patterns, debugging symptoms and how to diagnose them.
- [ ] **Practice:** Include guided examples, progressively harder independent exercises, variations and at least one transfer task.
- [ ] **Assessment:** Include questions or tasks that measure the stated outcomes. Provide useful explanations for correct and incorrect reasoning.
- [ ] **Real-world application:** Show where the concept appears in a real application, codebase, system or engineering decision.
- [ ] **Interview readiness:** Include relevant interview questions, follow-ups, communication prompts and evaluation criteria where the topic supports interview preparation.
- [ ] **Revision:** Schedule retrieval practice and revisit weak concepts with fresh questions rather than repeating identical answers.
- [ ] **Further learning:** Link to the next canonical topic, advanced extension, source references and related concepts.
- [ ] **Review and maintenance:** Record content version, reviewer, review date, source/version assumptions and known limitations.

A topic may mark an item "not applicable" only with a short reason. Missing evidence must remain visible as a gap.

### 11.2 Explanation and pedagogy acceptance

- [ ] Start from the learner's likely prior knowledge and define unfamiliar terms before relying on them.
- [ ] Introduce one major idea at a time; distinguish core concepts from optional depth.
- [ ] Explain both **what happens** and **why it happens**.
- [ ] Compare at least two approaches when meaningful, including when the simpler approach is preferable.
- [ ] Use counterexamples to show where an approach fails.
- [ ] Ask prediction questions before revealing outcomes.
- [ ] Use retrieval and teach-back rather than relying on passive reading.
- [ ] Avoid unexplained jumps, circular definitions, contradictory terminology and unsupported claims.
- [ ] Provide accessible text alternatives for information conveyed only by color, motion, audio or diagrams.
- [ ] Keep examples internally consistent across prose, diagrams, code, tests and quizzes.

### 11.3 Visualization acceptance

- [ ] Visualization is specific to the concept, not a decorative generic animation.
- [ ] Initial state, transitions, final state and expected result are defined.
- [ ] The learner can inspect the relevant variables, structures, pointers, messages, memory, events or system components.
- [ ] Each step explains why the transition occurs and what changed.
- [ ] The trace is deterministic for a given fixture and can be reset/replayed.
- [ ] Editable input is validated and produces a new correct trace.
- [ ] Play, pause, next, previous, reset and speed controls work where relevant.
- [ ] Error, invalid-input, boundary and failure states are shown where they materially aid understanding.
- [ ] The final visual state matches the verified implementation/model and expected output.
- [ ] Keyboard controls, focus order, screen-reader descriptions, mobile layout and reduced-motion behavior are tested.
- [ ] A static or textual explanation remains available if animation cannot be used.
- [ ] Visualizer limitations and unsupported inputs are explicit.

### 11.4 Implementation and code-lab acceptance

- [ ] Code compiles or runs in the declared supported environment, or is clearly labelled illustrative/pseudocode.
- [ ] Dependency and runtime versions are declared where relevant.
- [ ] Tests cover normal, boundary and failure behavior.
- [ ] Expected output is generated from or checked against the verified implementation.
- [ ] Error messages and debugging guidance teach the cause, not only the fix.
- [ ] Learner code is never executed in an unsafe application process or through browser `eval`.
- [ ] Any future execution service has independently reviewed process isolation, network denial, filesystem restrictions, CPU/memory/time/output limits, abuse controls and cleanup.
- [ ] No secrets, private test answers or privileged grading logic are shipped to the client.
- [ ] External dependencies, APIs and paid services are not introduced without approval.

### 11.5 Assessment and mastery acceptance

- [ ] Assessment maps to explicit learning outcomes.
- [ ] Questions test recall, reasoning, application and transfer at appropriate levels.
- [ ] Answer keys and authoritative grading remain server-side where applicable.
- [ ] Feedback explains the misconception, missing step or failed assumption.
- [ ] Learners can retry with meaningful variations rather than memorize a fixed answer.
- [ ] Mastery is based on independent evidence, not page views, time spent or a single quiz.
- [ ] Mastery dimensions are independently visible: conceptual explanation, trace, implementation/application, correctness reasoning, complexity/trade-off analysis and transfer.
- [ ] Promotion thresholds and evidence are transparent and versioned.
- [ ] Spaced repetition uses a configurable schedule (initial default: 1, 3, 7, 14 and 30 days) and adapts to demonstrated recall.
- [ ] Progress is authenticated, user-scoped, idempotent and resilient to refresh/re-login.
- [ ] Database or network failures are reported honestly; the UI must not fabricate saved progress or successful grading.

### 11.6 Learning-path and learner-experience acceptance

- [ ] Learners can identify where to start, why a topic matters and what comes next.
- [ ] Paths support beginner, intermediate and advanced entry points without duplicating canonical lessons.
- [ ] Prerequisites, related topics and knowledge bridges are discoverable.
- [ ] Global search covers academies, topics, lessons, examples and practice items.
- [ ] Search results distinguish published, draft and unavailable content according to permissions.
- [ ] Progress distinguishes not started, in progress, practiced, assessed and mastered.
- [ ] Learners can resume their last meaningful activity.
- [ ] Mobile layouts support reading, diagrams, visualizers and code practice without horizontal overflow.
- [ ] Navigation, forms, controls and dialogs are keyboard accessible.
- [ ] Screen-reader labels, semantic headings, focus management and contrast are verified.
- [ ] Reduced-motion and text alternatives exist for essential animated content.
- [ ] Loading, empty, error, offline and permission-denied states are designed and tested.
- [ ] Learners can report incorrect, confusing or outdated content with topic/version context.

### 11.7 Platform, security and operational acceptance

- [ ] Existing routes, lesson IDs, bookmarks, progress records and published links remain compatible or have explicit migrations.
- [ ] Authorization is enforced server-side for learner, author, reviewer and administrator capabilities.
- [ ] User progress and private drafts cannot be read or modified across users without authorization.
- [ ] Content publishing is auditable and fails closed when required review evidence is absent.
- [ ] Content and API inputs are validated; unsafe HTML, links and embedded content are handled safely.
- [ ] Performance budgets exist for initial load, navigation, search, lesson rendering and large visualizers.
- [ ] Large academies and interactive labs use appropriate lazy loading and bounded rendering.
- [ ] Automated tests cover unit, integration, regression, content schema, authorization and accessibility checks.
- [ ] Critical learner flows have end-to-end coverage.
- [ ] Errors are observable without leaking secrets or sensitive learner data.
- [ ] Backup, recovery and data-retention behavior are documented for persisted learner records.
- [ ] Dependencies and content sources have a maintenance/review process.
- [ ] No deployment, infrastructure spend or external provider activation occurs without approval.

### 11.8 Release gate

A topic or platform release may be called **ready** only when:

1. All applicable lesson, visualization, implementation, assessment and accessibility checks have evidence.
2. Every non-applicable check has a documented reason.
3. No critical correctness, security, privacy or data-integrity issue remains open.
4. Existing learner flows and stored progress pass regression tests.
5. CI is green for the changed scope.
6. Subject-matter review is recorded for technical content.
7. The release notes list known limitations and incomplete areas honestly.

Use these release labels consistently:

- **Inventory complete:** all expected records are accounted for; content may still be missing.
- **Content authored:** substantive learning material exists; verification may still be pending.
- **Technically verified:** applicable technical, code and visualization evidence passed.
- **Learning validated:** learner tasks and assessments demonstrate the stated outcomes.
- **Published:** all applicable release gates passed and publication was authorized.

Do not use "perfect" as a permanent completion claim. A learning platform is continuously maintained: frameworks change, security guidance evolves, APIs deprecate and learner feedback reveals gaps. The target is a transparent, measurable quality system that keeps improving.

### 11.9 Per-topic sign-off record

Every topic release should be accompanied by a review record containing:

| Field | Required evidence |
|---|---|
| Topic ID and version | Canonical stable identifier and content version |
| Learning outcomes | Observable outcomes and assessment mapping |
| Prerequisites | Canonical IDs and validation result |
| Explanation review | Reviewer and review date |
| Examples and code | Runtime/version, test references and results |
| Visualization | Fixture, expected trace and validation result |
| Practice and assessment | Rubric/version, grading checks and results |
| Accessibility | Automated and manual test evidence |
| Security/privacy | Applicable review result |
| Known gaps | Explicit limitations and deferred work |
| Publication | Authorized publisher and timestamp |

This sign-off record is the evidence that a topic meets the platform's definition of quality—not the presence of a lesson page or a completion badge.


## 12. Canonical companion documents

This roadmap is the delivery plan. The following documents are the operational references and must be kept aligned:

- [Perfect Learning Platform Standard](PERFECT_LEARNING_PLATFORM_STANDARD.md) — normative acceptance contract for lessons, visualization, implementation, assessment, mastery, accessibility, security and release.
- [Repository Feature Inventory and Gap Register](REPOSITORY_FEATURE_INVENTORY_AND_GAP_REGISTER.md) — evidence-backed map of current repository surfaces, APIs, data domains, tests and known gaps.
- [Project README](../README.md) — setup, architecture, scripts, safety boundaries and contributor entry point.

The standard defines **what good means**; the inventory records **what exists and what evidence is missing**; this roadmap defines **the order in which gaps should be closed**. Do not treat documentation completion as proof that application features or lessons have passed their quality gates.
