# Application-wide content deep review

**Review baseline:** `main` at `9bd778b8e66b645475b1a74a2b7766dd62316426` (PR #62 merge commit)  
**Review branch:** `docs/application-wide-content-deep-review`  
**Review date:** 2026-11-25  
**Scope:** All 22 registered learner-facing surfaces; canonical content data, authored/published lesson pipeline, teaching components, visualizers and simulators.  
**Evidence type:** Repository/static source review and targeted technical claim corrections. No browser, screen-reader, execution-provider, production, or learner-study verification is claimed.

## 1. Executive assessment

Tutorial Hub is a multi-academy learning application. It contains DSA and interview curricula, algorithms and visualizers, AI engineering, databases, system design, DevOps/cloud, programming languages, full-stack architecture, OOD, fuzzy search, simulator-based learning, revision, learner progress and community features.

The main issue is not simply missing content. It is **content trust and consistency**: some lessons use strong absolute language, some operational outcomes are presented as guarantees despite depending on workload/version/configuration, and some examples omit the assumptions that make the algorithm or architecture correct. The app also contains multiple overlapping content sources; the same idea can be taught differently in a catalog, lesson pack, tutor guide, visualizer, quiz, and simulator.

A deep review must therefore verify each learner-facing claim and each concept-to-example/code/trace/assessment connection—not just count fields or headings.

## 2. Repository snapshot and review boundary

| Measure | Observed at baseline |
|---|---:|
| Tracked repository files | 517 |
| Registered learning surfaces | 22 |
| Unique mapped UI/component source paths | 72 |
| Unique mapped canonical data source paths | 62 |
| Unique mapped API route paths | 15 |
| Repository test files | 29 |
| Registry-declared global test files | 14 |
| Canonical source/data files under `src/data`, feature data, server seed/data | 118 |
| Canonical DSA complete lessons | 23 |

The registry contains 68 data-source mappings across surfaces, resolving to 62 unique paths because some sources are shared. These are inventory counts, not a claim that every line has been read, technically verified, or rewritten.

The existing quality ledger correctly keeps all 22 surfaces at `contentStatus: not_assessed` and `verificationStatus: not_assessed`. This review does not promote a surface to verified merely because selected files were inspected or corrections were committed.

## 3. Surface-by-surface deep-review register

Each row is a content-review responsibility, not a quality certification.

| Surface | Priority | Word-level / technical review focus |
|---|---|---|
| Pattern Forge | P0 | Each of the 28 pattern IDs; distinguish the 3 reference pilots from 25 inventory-only topics; verify Understand/Trace/Implement/Practice/Master stages, objective mapping, trace states and mastery evidence. |
| Concept knowledge engine | P0 | Generated and published lesson copy, Markdown/code rendering, author/source provenance, objective links, topic-specific simulator binding, validation warnings and publication state. |
| DSA curriculum workspace | P0 | All 23 canonical lessons and sub-concepts; preconditions, examples, code, invariant/proof, complexity, edge cases, practice answers and links to the interview bank. |
| Algorithms studio | P0 | Every core/advanced/system algorithm; algorithm variants, preconditions, correctness, complexity assumptions, trace-to-code alignment and counterexamples. |
| Database internals | P0 | Engine/version scope, SQL correctness, transaction/isolation claims, WAL/CDC, lock behavior, query plans, DDL operations, recovery and simulator fixture boundaries. |
| System design studio | P0 | Workload assumptions, capacity arithmetic, P99 targets vs measured facts, API/data contracts, consistency, reliability, failure recovery, cost and security. |
| Universal problem solver | P1 | Each decomposition prompt, hint, reasoning step, optimization suggestion and rubric; ensure hints do not reveal answers prematurely and transfer tasks test independent reasoning. |
| AI engineering academy | P1 | Every lesson on models, RAG, agents and MCP; version/date-sensitive claims, evaluation, data flow, prompt injection, tool permissions, latency/cost and production limits. |
| N-gram/fuzzy search | P1 | Metric definitions, tokenization, corpus assumptions, threshold interpretation, precision/recall, pruning correctness and reproducible examples. |
| OOP/SOLID/design patterns | P1 | Pattern intent, trade-offs, misuse, alternatives, before/after refactoring, coupling/cohesion and whether examples actually require the pattern. |
| AI engineering studio | P1 | Architecture diagrams vs code/data flow; model and retrieval assumptions; evaluation, security, observability and cost. |
| DevOps/cloud studio | P1 | Provider/version scope, IAM/network boundaries, secret handling, Terraform state, CI/CD artifacts, deployment/rollback, migration compatibility and failure recovery. |
| SDLC/architecture flight simulator | P1 | Scenario assumptions, decision rubric, injected failure, scoring rationale and distinction between teaching simulation and real operational measurement. |
| Programming languages studio | P1 | Language/runtime version, implementation-specific behavior, memory model, concurrency, exceptions, collections, code output and portability boundaries. |
| Full-stack systems studio | P1 | End-to-end request lifecycle, framework/runtime assumptions, security, storage, performance, failure behavior and code/diagram agreement. |
| Quick revision hub | P1 | Each prompt’s canonical source/objective, answer correctness, misconception coverage, retrieval quality and separation of recall from mastery. |
| Noob-to-pro skill tree | P1 | Prerequisite graph, objective ownership, progression criteria, recommendations and no inferred mastery from opens or self-attested completion. |
| Topic/interview problem bank | P1 | Problem IDs, source provenance, difficulty, constraints, solution variants, topic tags, duplicates, answer correctness and exact/partial/inventory status. |
| Database/API schemas reference | P2 | Schema provenance, engine/API version, examples, field meaning, nullability, constraints and freshness. |
| Interview sprint war room | P2 | Prompt clarity, timing assumptions, scoring rubric, feedback usefulness and alignment with actual topic outcomes. |
| Community/pair programming | P2 | Instruction clarity, collaboration/accessibility, moderation and distinction between group activity and individual understanding. |
| Learner profile/progress | P2 | Meaning of attempts, completions, streaks and mastery; privacy, data accuracy and accessible explanations of progress. |

## 4. Confirmed content corrections applied in this PR

The following learner-facing statements were revised in source data. These are targeted, confirmed corrections; they do not imply every paragraph in the same file has been reviewed.

### Database and data engineering

- Log-based CDC no longer claims guaranteed delivery or zero dual-write drift. The explanation now states the connector, checkpoint, retry, WAL-retention, schema and downstream-consumer dependencies.
- The quiz no longer claims dual writes are always faster or provide cross-service ACID atomicity. Its question and rationale distinguish partial failure, CDC and idempotent consumption.
- PostgreSQL partition-retention copy no longer presents partition detach/drop as universally instantaneous O(1) or zero-impact. It calls out locking, version and workload validation.
- Replication-slot guidance no longer claims timeout/WAL settings can never allow an inactive slot to pin WAL or xmin. It adds monitoring and recovery concerns.
- The database taxonomy's DDL guidance no longer prescribes a universal two-second lock timeout or millisecond detach guarantee.

### System design and distributed systems

- Short-URL scenario P99 and collision-free wording is now an explicit target under workload/region/cache assumptions; collision handling requires a uniqueness constraint and retry.
- Redis cache-hit ratio is now a measured workload target rather than an assumed 80%+ result.
- Bloom-filter explanation now acknowledges false positives and states that it is not a complete abuse-control mechanism.
- WebSocket learning content now distinguishes connection behavior from durable delivery, ordering scope and offline synchronization.
- Cache copy no longer claims write-through or short TTL prevents stale transactional reads.
- Raft wording now explains that quorum intersection is necessary but must be combined with Raft's log-up-to-date voting and log-matching rules.
- Merkle-tree equality is qualified by cryptographic collision-resistance and consistent canonicalization assumptions.

### Algorithms and programming languages

- Rotated binary-search guidance now distinguishes unique values from duplicates and states the O(N) worst case when duplicate boundaries are ambiguous.
- A* optimality guidance now states the admissibility, graph-search reopening/consistency and correct goal-termination conditions.
- K-d-tree nearest-neighbor copy now distinguishes exact result correctness from favorable expected performance and O(N) worst-case behavior.
- Python object-lifetime copy now scopes prompt reference-count deallocation to CPython and warns against relying on GC timing for resource cleanup.
- Java HashMap copy now explains treeification threshold/capacity conditions and avoids claiming every bucket with eight colliding keys immediately guarantees O(log N).

### DevOps and OOD

- Immutable artifacts are described as improving rollback reproducibility, not guaranteeing a deterministic rollback of config, database migrations and external state.
- Recreate/blue-green deployment descriptions now include database compatibility, rollback and migration sequencing.
- Payment/email example now explains that SMTP need not block a committed payment only when the email side effect is durably queued and retried; idempotency and monitoring remain necessary.

## 5. Authoring pipeline improvements

The content-generation prompt now instructs the model to:

- teach concept-by-concept rather than only fill section headings;
- use original teaching material and high-level instructional principles without imitating named authors or copying source works;
- define terms, assumptions, preconditions, applicability and failure conditions;
- include complete input/output, intermediate trace and reasoning for worked examples;
- explain important code lines, language/runtime, contract, mutation, boundaries, tests and complexity;
- distinguish guarantees from expected, amortized, average and worst-case behavior;
- keep code, trace, quiz, visualization and simulator aligned.

The generated-lesson validator now emits actionable warnings for missing worked examples, incomplete input/output, malformed or unexplained code examples, code modules without code, reasoning modules with too few explicit steps, and missing learning objectives. These remain unverified drafts; warnings do not falsely certify content as complete.

## 6. Remaining review work — not concealed

This PR is a substantial application-wide static review pass, but the **full word-by-word semantic review of all 517 tracked files is not complete**. The application has 118 canonical data/seed files alone, plus component copy, backend-generated content, question banks, diagrams, simulator fixtures and user-authored/published lessons.

Remaining work to earn a complete review status:
1. Review every individual concept and sentence in all 62 unique registered canonical data sources, plus non-registry learner-facing content and dynamically published content.
2. Reconcile duplicates and competing explanations across catalogs, complete lessons, tutor guides, master packs, topic blueprints, problem banks and visualizers.
3. Verify every code sample in its stated language/runtime; compare output and traces; add regression fixtures for corrected claims.
4. Review every quiz answer/rationale and practice solution, not only prompt wording.
5. Perform browser/mobile/keyboard/screen-reader review for content layout and interactive lesson controls.
6. Obtain domain review for database, cloud, distributed systems and AI claims that depend on provider/engine versions.
7. Keep each topic at `not_assessed` until its evidence record is complete; do not mark the whole surface verified from this pass.

## 7. Review method for every sentence and code block

For each learner-visible sentence, label its role (definition, assumption, mechanism, example, warning, claim, instruction or assessment), then check:
- Is it true under explicit conditions?
- Does it define the terms and units?
- Does it avoid unqualified absolutes?
- Does it agree with the adjacent code, trace, diagram, answer and simulator?
- Does it teach a useful decision or reasoning step?
- Is it original and appropriately sourced?
- Can a learner predict or verify the result?

For code, additionally check language/runtime, contract, inputs, output, state changes, error/boundary behavior, test cases and complexity. For architecture and operations, check workload, failure model, consistency, cost and recovery assumptions.

## 8. Reference principles and originality

Use the named books as high-level teaching references only:
- Aditya Bhargava, *Grokking Algorithms*: intuitive mental models, visual walkthroughs and approachable examples.
- Jay Wengrow, *A Common-Sense Guide to Data Structures and Algorithms*: practical trade-offs and readable reasoning.
- Narasimha Karumanchi, *Data Structures and Algorithms Made Easy*: broad problem coverage, multiple approaches and analysis.
- Brian Christian and Tom Griffiths, *Algorithms to Live By*: careful real-world connections and decision framing.
- Thomas H. Cormen, *Algorithms Unlocked*: precise foundations, correctness and efficiency.

Do not reproduce their wording, code, diagrams, examples, exercises or distinctive structure. Tutorial Hub's lesson content must be independently authored and verified.

## 9. Completion gate

The application-wide review is complete only when the ledger has sentence/concept-level evidence for all learner-facing content, every applicable code/trace/quiz/simulator has been checked, all critical findings are resolved, the test suite and production build pass, accessibility is reviewed, and each surface's status is updated based on evidence.

No deployment, paid service, external execution provider or hosting change is included.
