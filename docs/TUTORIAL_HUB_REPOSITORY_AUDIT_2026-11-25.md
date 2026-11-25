# Tutorial Hub — Repository Audit and Gap Analysis

**Audit date:** 2026-11-25  
**Repository:** `ashvins1912/Tutorial-Hub`  
**Branch audited:** `main`  
**Audited HEAD:** `512c342ac17825398b9aafde24b706ecd1d9a3a6`  
**Method:** GitHub tree/API inspection, review of canonical audit ledgers, representative frontend/backend/content sources, recent pull-request history, GitHub Actions run and job logs.  
**Evidence boundary:** Static code and documentation review. No deployed browser walkthrough, live database verification, screen-reader test, mobile-device test, or learner study is claimed.

## 1. Executive assessment

Tutorial Hub has a broad multi-academy learning architecture and substantial learning-engineering work already implemented. The primary problem is not a general absence of learning features. It is the gap between (a) a rich collection of domain-specific content and interactions and (b) a consistently evidenced, learner-tested, technically verified experience across all academies.

The repository has useful foundations: a typed learning-surface registry, content-quality ledger, topic-candidate extractor, DSA lesson contracts, Pattern Forge's five-stage curriculum, deterministic trace generation, domain-specific prediction simulators, objective-linked quiz/progress support, content-authoring/publishing controls, and a CI workflow.

However:
- all 21 registered learning surfaces remain `contentStatus: not_assessed` and `verificationStatus: not_assessed` in the application-wide ledger;
- the 28-pattern Pattern Forge curriculum has 3 published reference pilots and 25 inventory-only patterns;
- the latest `main` CI run fails at the registry audit because the new `pattern-forge` TopView is missing from the canonical surface registry;
- the latest run did not reach the downstream content-ledger audit, topic inventory job, or production build;
- the previous successful run predates the latest Pattern Forge navigation commit and therefore does not validate current HEAD.

This audit does not recommend a bulk content rewrite. The best route is to repair the current integration/CI failure, complete the evidence inventory, then use a small, reviewed pilot to establish a reusable teaching standard.

## 2. Current repository snapshot

| Attribute | Observed value |
|---|---|
| Default branch | `main` |
| Audited HEAD | `512c342ac17825398b9aafde24b706ecd1d9a3a6` |
| Repository visibility | Public |
| GitHub repository permissions | Admin/maintain/push available to connected account |
| Existing canonical surface registry snapshot | 21 surfaces, registry baseline 2026-11-23 |
| Registry's recorded tracked-file snapshot | 442 files (historical snapshot; not recomputed for audited HEAD) |
| Topic extractor manifest | 27 canonical source files across 12 learning surfaces |
| CI workflow | `.github/workflows/ci.yml`, Node 22, Python 3.12, Java 21 |
| Deployments | Not inspected/verified in this audit |

Do not use the 442 figure as the current audited-HEAD file count: it is the registry's earlier baseline value.

## 3. Current application surface inventory

The canonical registry contains 21 entries:
1. Universal problem solver
2. Concept knowledge engine
3. AI engineering academy
4. DSA curriculum workspace
5. Algorithms studio
6. N-gram/fuzzy search lab
7. OOP/SOLID/design patterns
8. AI engineering studio
9. Database internals
10. DevOps/cloud
11. SDLC/architecture flight simulator
12. Programming languages
13. Full-stack systems
14. System design
15. Quick revision
16. Skill tree
17. Database/API schemas
18. Interview problem bank/roadmap
19. Interview sprint
20. Community/pair programming
21. Learner profile/progress

The latest commit adds a 22nd `TopView` value, `pattern-forge`, and renders it in application navigation. It is not yet represented in the 21-surface registry. This mismatch is the immediate CI blocker (see LRN-001).

The application also includes cross-cutting components for problem decomposition, code progression, recursion/DP visualization, pattern recognition, progress, interview preparation and collaborative practice. These are reusable assets; they should not be duplicated in each academy.

## 4. Audit evidence and status interpretation

The ledger `docs/learning-content-quality-audit.json`:
- was dated 2026-11-24;
- declares the 2026-11-24 earlier baseline commit `8c83bc6d2bed2222ae08a524a78c20b1ede9d930`;
- covers the 21 surface IDs present in the registry;
- sets all content statuses to `not_assessed`;
- sets all verification statuses to `not_assessed`.

This is an honest governance state, not evidence that all content is poor. The validator checks ledger completeness, path integrity, state semantics and evidence references. It does not evaluate teaching quality or technical correctness.

The topic inventory document states that the AST extractor:
- scans stable ID/display-name object candidates in 27 canonical TS source files;
- records path, line, structural candidate kind and selected field presence;
- does not inventory every paragraph, diagram, code sample, quiz or rendered interaction;
- leaves every candidate `not_assessed`.

Consequently, the repository currently has good discovery metadata but does not yet have a completed topic-level quality scorecard for every lesson across all 21 surfaces.

## 5. Topic-level quality assessment framework

Apply the repository's existing 0–4 rubric to every actual topic/subtopic:
- 0: missing, misleading or materially incorrect;
- 1: named or outlined, not enough to teach reliably;
- 2: basic explanation, but depth/examples/practice incomplete;
- 3: complete teaching unit with examples, practice and outcome-linked assessment;
- 4: independently reviewed, technically verified, and supported by transfer/retention evidence.

Assess each applicable dimension separately:
1. outcomes and prerequisites;
2. beginner accessibility and terminology;
3. conceptual explanation and internal mechanics;
4. worked examples and state-by-state reasoning;
5. visual/trace correctness and accessibility;
6. implementation, language/version and reproducible tests;
7. correctness proof/invariant and complexity derivation;
8. edge cases, misconceptions and debugging;
9. guided-to-independent practice progression;
10. objective-linked assessment and feedback;
11. transfer to unfamiliar constraints/problems;
12. professional application and trade-offs;
13. revision and delayed recall;
14. sources, content version, technical review and learning review.

Scores must link to lesson-level evidence. Do not score entire academies using titles, field counts, file size or a component's existence.

## 6. Academy-wise gap matrix

Status below describes repository evidence, not a claim of absence:
- **Mapped** means a registry/source path is recorded.
- **Partial evidence** means at least some focused tests or structured contracts exist.
- **Not assessed** means full topic-by-topic teaching and learner validation is absent from the ledger.

| Surface | Existing evidence/assets | Most important unclosed audit work | Priority |
|---|---|---|---|
| Pattern Forge | 28 canonical IDs, five stages, deterministic traces, 3 reference pilots, mastery/revision engine | 25 inventory-only topics; expand reviewer-backed verified content and test current route integration | P0 |
| DSA workspace | 23-module curriculum plan, structured topic lesson fields, 293 interview inventory and selected Java/JS/Python tests | Score every topic/lesson; independently reconcile problem coverage and verify implementation/trace/assessment links | P0 |
| Algorithms | Core/advanced/system packs and visual stages | Verify each algorithm's preconditions, invariant, complexity, trace-to-code agreement and unseen exercises | P0 |
| Knowledge Engine | Authoring pipeline, generated lesson schema, published view, quiz and progress APIs, security tests | Validate rendering, objective alignment, semantic consistency and review/publication state across real lessons | P0 |
| Database Internals | SQL/query/transaction/deadlock/recovery/vector labs | Validate engine/version-specific assumptions, query-plan claims, transaction outcomes and simulator boundaries | P0 |
| System Design | Learning academy, DFD/architecture simulators, traffic simulation engine | Add scenario assumptions, workload math, failure/recovery fixtures and objective-linked decisions per topic | P0 |
| AI Academy | Seven-phase curriculum; 77 lessons documented; dedicated curriculum/progress tests | Technical version review, outcome mapping, hands-on transfer evidence and consistency across AI Studio | P1 |
| AI Engineering Studio | AI/LLM architecture data and labs | Align architecture diagrams, implementation examples, evaluation/security/cost explanations and assessments | P1 |
| DevOps/Cloud | Cloud curriculum, CI/CD visual and interactive simulators | Verify provider versions, IAM/network, cost, rollback, artifact provenance and pipeline failure scenarios | P1 |
| Languages | Java/Python tutorials, collections/concurrency workspaces | Validate runtime/version specificity, memory/concurrency claims and executable examples by topic | P1 |
| OOD/SOLID | Principles, patterns and animation components | Before/after design exercises, trade-off explanations, anti-patterns and refactoring rubrics | P1 |
| Full Stack | Framework/runtime, storage and diagnostics labs | End-to-end request lifecycle; framework versions, performance/security failure exercises and verified code | P1 |
| Universal Solver | Decomposition, logic builder, adaptive coach, optimization checker | Link reasoning stages to canonical outcomes; test hint quality, independence and unseen transfer | P1 |
| Fuzzy Search | N-gram taxonomy, visual stages and pruning simulator | Metric definitions, corpus/threshold assumptions, precision/recall fixtures and pruning correctness | P1 |
| Flight Simulator | Architecture/SDLC scenario simulator | Validate decision rubrics, failure injection, assumptions and scoring explanation | P1 |
| Revision | Flashcards, notes, due objective queue, spaced-revision API | Check question quality, source-objective linkage, retrieval correctness and delayed recall evidence | P1 |
| Skill Tree | Topic progression and concept drawer | Verify prerequisite graph, no false mastery, and progress recommendations against canonical topic outcomes | P1 |
| Problem Bank | 293 question inventory and catalog API | Refresh title audit against canonical records, complete 5-stage content, preserve exact/partial/blueprint states | P1 |
| Sprint | Interview sprint/war-room flows | Evaluate challenge quality, diagnostic validity, feedback and link to actual curriculum outcomes | P2 |
| Schemas | DB/API schema reference data | Freshness, provenance, version and validation examples | P2 |
| Community | Community and pair-programming | Test accessibility/moderation/collaboration behavior; do not treat activity as individual mastery | P2 |
| Profile | Learner state/progress summary | Validate progress semantics, privacy, accessibility and distinction between attempts and mastery | P2 |

No numeric quality scores are assigned because comprehensive topic-level evidence has not been collected.

## 7. Confirmed high-priority gaps

### LRN-001 — Current CI is broken by an incomplete navigation registry
**Priority:** P0  
**Evidence:** Latest HEAD adds `'pattern-forge'` to `TopView`, makes it the default active view, and renders it in `src/App.tsx`. The canonical `docs/learning-surface-registry.json` still contains only 21 entries and lacks this surface.  
**Observed CI:** Run 45463738557, workflow run #542, on 2026-11-24 at HEAD `512c342...`, failed at `npm run audit:learning-surfaces`. The validator reports expected `pattern-forge` but actual registry IDs omit it. The run's type-check, handwritten DSA, DSA completeness pilot, arrays batch, content-authoring, content-bootstrap security, system-design AI security, solver security and 293-question inventory steps passed. The content ledger audit, topic inventory and frontend build were skipped after failure.  
**Resolution:** Add Pattern Forge as a registry surface with accurate component/data/API/test mappings; update audit ledger to cover the new surface with honest `not_assessed` status; update documentation baseline/evidence. Then rerun the complete CI workflow on the fix commit.  
**Acceptance:** Registry validator, content-ledger validator, topic inventory and frontend build all pass on the same HEAD.

### LRN-002 — Pattern Forge rollout is 3/28 reference-complete
**Priority:** P0  
**Evidence:** `shared/patternForgeCurriculum.ts` derives all 28 canonical DSA pattern IDs. `shared/pilotPatternsData.ts` contains reference-grade pilot data for HashMap/HashSet, dynamic sliding window and dynamic programming. `tests/learning-engine/pattern-forge-pilot.test.mjs` asserts 3 pilot topics published and 25 structurally valid only. Inventory topics render an explicit not-yet-published message and have no verified problem suites/traces/assessments.  
**Resolution:** Continue the pilot in evidence-backed waves, not content bulk-generation. Each new topic must pass content, technical, visual, test, assessment and review requirements before publication.  
**Acceptance:** Each topic independently meets the full contract, with a traceable reviewer record and tests. Keep non-pilot topics clearly marked inventory-only until then.

### LRN-003 — All-surface content audit remains not assessed
**Priority:** P0  
**Evidence:** The application-wide ledger includes 21 surfaces and records all content/verification statuses as `not_assessed`. The topic extractor covers only selected 27 canonical TS sources across 12 surfaces and inventories object candidates, not rendered content or every learning artifact.  
**Resolution:** Expand the canonical content manifest and inventory actual nested topic/subtopic/lesson IDs, imported/composed sources, quiz, code, trace and simulator associations. Review each topic against the 0–4 scorecard.  
**Acceptance:** Every actual lesson has a stable ID, source path, evidence record, dimension scores, reviewers and open gaps. No inferred completeness from field presence.

### LRN-004 — Current DSA question inventory needs semantic reconciliation
**Priority:** P1  
**Evidence:** `docs/DSA_MASTER_QUESTION_COVERAGE_AUDIT.md` (2026-11-19) recorded 99 exact title matches, 21 partial/related and 173 no exact match for a 293-question target. A later section documents 194 topic-specific inventory records added for missing/variant questions, explicitly `needs-authoring`; this did not migrate or verify five-stage solution content. The CI test confirms 293 topic-scoped inventory records and honest blueprint statuses, not the correctness/completeness of the 293 lessons.  
**Resolution:** Re-run title reconciliation against the current source-of-truth catalog; verify aliases and duplicate topic contexts; distinguish exact question, related problem, inventory blueprint, authored draft, code-verified and published lesson.  
**Acceptance:** 293/293 records have explicit canonical topic, unique stable ID, provenance, exact/alias/related status and current authoring/verification status; only reviewed content receives verified labels.

### LRN-005 — Cross-academy shared learning lifecycle is only partially unified
**Priority:** P1  
**Evidence:** Pattern Forge has a shared five-stage contract and dedicated learning engine. Other academies still have distinct curriculum datasets and custom studios; the cross-application inventory calls out missing universal lesson-to-lab/objective binding in some surfaces.  
**Resolution:** Introduce adapters/migrations to shared contracts, not a rewrite of each studio. Preserve academy-specific pedagogy and simulators behind reusable lesson, progress and assessment interfaces.  
**Acceptance:** A learner sees consistent stages and evidence semantics where applicable; domain-specific experiences remain accurate and existing IDs/progress are preserved.

### LRN-006 — Technical correctness needs domain-level validation
**Priority:** P1  
**Evidence:** Domain prediction simulator PRs explicitly retain simplified teaching-model boundaries (database cost illustrations rather than real EXPLAIN, system steady-state serial capacity rather than queueing, controlled concurrency interleaving rather than engine execution, cloud policy fixtures rather than actual providers).  
**Resolution:** Record model assumptions and versions; attach independently verified fixtures and negative cases; do not overstate what a simulator executes. Use real adapters only when safe, versioned and separately approved.  
**Acceptance:** Each scenario has an assumptions panel, reproducible fixture, edge/failure tests and subject-matter review.

### LRN-007 — CI and surface-specific regression coverage is uneven
**Priority:** P1  
**Evidence:** The 21-surface registry lists only 13 global test files plus surface-specific tests; several mapped areas have zero surface-specific tests (including fuzzy search, OOD, AI Engineering Studio, database internals, DevOps/cloud, flight simulator, languages, full stack and system design).  
**Resolution:** Create risk-based test suites for topic contract, representative examples, deterministic traces, assessment objective bindings, accessibility/keyboard behavior and critical navigation/persistence. Do not add empty smoke tests just to increase counts.  
**Acceptance:** Every P0/P1 surface has at least one behavior-focused suite and explicit manual review record for non-automatable checks.

### LRN-008 — Accessibility and learner outcomes are not globally evidenced
**Priority:** P1  
**Evidence:** Some simulator PRs report semantic native controls, focus states, live feedback and responsive layouts. The application-wide audit standard explicitly excludes global screen-reader/mobile/user studies from existing static review.  
**Resolution:** Add a consistent keyboard, contrast, reduced-motion, screen-reader, zoom and mobile checklist. Run representative manual tests across shared components and academy-specific controls. Add transfer/delayed-recall measurement for pilot cohorts when available.  
**Acceptance:** Evidence links to environment, tested routes/viewports/assistive technology, defects and remediation. Repository unit tests alone must not be called learner validation.

### LRN-009 — Mastery evidence was cross-credited between unrelated dimensions
**Priority:** P0  
**Evidence:** The Pattern Forge implementation path set `complexityCheckPassed` after JavaScript tests passed; the pattern-recognition scorer also set it at 75%; the mastery calculator then added pattern-recognition performance to the complexity-analysis score. The published standard requires 80% independently for each dimension. The client assessment fallback also stored the overall assessment score as transfer evidence, while the server stored the overall score in `transferAssessmentBestPct` even though questions carry explicit dimensions.  
**Resolution:** Compute assessment totals and per-dimension scores through one shared pure scorer; derive transfer evidence only from `transferAbility` questions and complexity evidence only from `complexityAnalysis` questions; align pattern-recognition pass threshold to 80%; have the server recompute pattern-recognition results from canonical prompt answers; ignore legacy `complexityCheckPassed` flags when calculating mastery and retain a new dimension-specific score field for verified evidence.  
**Acceptance:** Regression tests prove that 75% recognition does not pass, 80% does; perfect recognition alone does not increase complexity mastery; overall quiz percentage cannot substitute for transfer or complexity evidence; client fallback and server grading use identical dimension rules.

## 8. Reusable assets to preserve

| Existing asset | Reuse strategy |
|---|---|
| `shared/learningContract.ts` | Canonical lesson/topic/objective/problem/trace contracts |
| `shared/patternForgeCurriculum.ts` | Pattern Forge reference curriculum and IDs |
| `shared/pilotPatternsData.ts` | Pilot lesson examples and mastery requirements |
| `shared/traceEngine.ts` | Deterministic trace logic independent of rendering |
| `shared/masteryEngine.ts` | Evidence-based mastery and spaced revision |
| `shared/learningValidator.ts` | Structural/governance validator; extend evidence checks carefully |
| `src/features/visualizer/engine/stepGenerator.ts` | Domain trace generation foundation |
| `src/engine/simulationEngine.ts` | Pure system-design traffic simulation engine |
| `shared/domainSimulatorContract.ts` | Domain simulator schema/objective binding |
| `server/modules/content-authoring` | Authoring/generation/publishing pipeline |
| `PublishedLessonView` and visualization renderer | Safe rendering and publishing pipeline |
| `learningProgressRoutes` and objective mastery | Server-side grading and progress evidence |
| `docs/learning-surface-registry.json` | Canonical map from UI view to components/data/routes/tests |
| `docs/learning-content-quality-audit.json` | Honest audit state/evidence ledger |
| Content inventory scripts | Candidate/source discovery, not automatic quality scoring |

Do not create a second progress system, duplicate visualizer engine, duplicate lesson schema or separate per-academy mastery calculator without a proven domain need.

## 9. Pilot plan

The existing Pattern Forge pilots should remain the baseline. The next pilot should test generalization across distinct learning demands:
1. **Beginner/foundational:** Arrays or Strings (clear mental model, memory/representation, edge handling).
2. **Reasoning-intensive:** Binary Search on Answer (monotonic predicate, first/last true proof and counterexamples).
3. **Stateful visualization:** Linked List or Graph BFS (pointer/queue state and trace correctness).
4. **Practical engineering:** Database indexing/transactions (engine assumptions, query/transaction fixture).
5. **Professional application:** System design capacity/backpressure or cloud deployment pipeline (explicit workload/provider assumptions and operational trade-offs).

Before authoring, score current material and choose the topic with the highest learner-impact gap and strongest available source evidence. Do not create duplicate content for topics already complete.

Every pilot should include:
- outcomes and prerequisite bridge;
- intuitive and formal explanation;
- internal workings and decision/counterdecision rules;
- brute-force/baseline comparison;
- full worked example with intermediate states;
- topic-bound deterministic visualization and prediction checkpoint;
- runnable, version-labeled code/config/query and tests where applicable;
- correctness argument and complexity/trade-off derivation;
- edge cases, failure injection and debugging;
- guided, independent and unseen transfer exercises;
- outcome-linked assessment with explanatory feedback;
- real-world/professional case and interview communication where relevant;
- revision prompts and delayed recall;
- technical reviewer, instructional reviewer, source provenance and content version.

## 10. Prioritized implementation roadmap (proposed; not started)

| Phase | Scope | Priority | Dependencies | Completion evidence |
|---|---|---|---|---|
| 0 | Repair Pattern Forge registry/ledger/CI integration | P0 | Current HEAD/source mappings | CI green on fix commit; no runtime/content rewrite |
| 1 | Complete topic-level inventory and scorecards across canonical sources | P0 | Registry repaired; canonical source manifest | Every lesson/topic ID mapped; evidence and score dimensions |
| 2 | Reconcile 293-question bank against source-of-truth | P1 | Current catalog and exact matching rules | 293 records reconciled with honest states |
| 3 | Select and deliver cross-domain reference pilots | P1 | Topic audit and pilot selection | Five representative, reviewed topic packages |
| 4 | Shared lifecycle adapters across academies | P1 | Pilot contract validated | Consistent shared UX with preserved domain assets and IDs |
| 5 | Domain simulator/visualizer verification | P1 | Topic/objective mapping | Deterministic fixtures, edge/failure tests, SME review |
| 6 | Accessibility and learner-outcome validation | P1 | Stable pilot surfaces | Manual test reports; transfer/retention evidence |
| 7 | Scale reviewed pattern across topics in batches | P2 | Pilot sign-off, automated acceptance gates | Incremental verified coverage; no filler or blanket completion |

## 11. Specific acceptance criteria

- Canonical registry equals the actual `TopView` union, one-to-one.
- Quality ledger equals registry coverage and every review state has an evidence boundary.
- All canonical lesson/topic IDs are discoverable with source path and composition/import lineage.
- Every applicable topic has a separate score for each lesson-quality dimension.
- Publication state is separate from structural validity, code verification and learner validation.
- Every visual trace/simulator is bound to a matching lesson/objective or explicitly declared standalone.
- All learner-facing code examples declare language/runtime version and have reproducible tests where feasible.
- Every question/assessment is linked to at least one learning outcome.
- Learner progress does not infer mastery from page views or passive checklists.
- Existing IDs, saved progress, URLs, authentication and published lessons remain backward compatible.
- No paid service, new hosting or deployment without explicit approval.

## 12. Limitations and items requiring manual verification

- No production deployment or live URL was provided for runtime walkthrough.
- No production MongoDB/Supabase configuration or persisted data was inspected.
- No complete browser or mobile interaction test was performed.
- Accessibility and screen-reader behavior were not manually evaluated.
- No subject-matter expert has been engaged independently in this audit.
- Existing reviewer role labels in source data are not independently authenticated credentials.
- Some cross-application gap-register descriptions are historical; later PRs have superseded specific implementation gaps. Current source and test evidence should determine status.
- GitHub Actions was inspected for latest HEAD; it failed at the registry audit before later checks ran.

## 13. Audit decision

**Repository and architecture audit: completed to static-evidence level.**  
**All-topic content-quality audit: not yet completed.** The current repository does not supply enough per-topic content review evidence to honestly mark it complete.

No application code, learning content, production functionality, authentication, learner progress or deployment was changed in this audit. A dedicated audit branch may contain this report only.

**Required next approval:** approve Phase 0 (the narrow registry + ledger + CI correction) and the proposed topic inventory/pilot sequence. Bulk content enrichment remains blocked until review of this report.

## Follow-up verification — 2026-11-25

This section supersedes time-sensitive CI and inventory statements above where they refer to the earlier audited HEAD `512c342ac17825398b9aafde24b706ecd1d9a3a6`. The earlier findings remain preserved as a historical snapshot.

- Current verified `main` HEAD: `82a26434496bc0a63b07576da73ee06830696756`.
- The canonical learning-surface registry and quality ledger now each contain **22** surfaces, including `pattern-forge`. The registry's tracked-file baseline is refreshed to **510** files at this commit.
- The Pattern Forge registry/ledger integration gap (LRN-001) is resolved in current source. The previous CI failure described under LRN-001 belongs to the earlier commit and is not the current CI state.
- The current main workflow run **45529681550** completed successfully. Its single validation job passed TypeScript, handwritten DSA curriculum checks, DSA topic completeness, source-authored DSA solution execution, content-authoring/security checks, the 293-question inventory boundary checks, Pattern Forge governance, registry and quality-ledger validation, topic inventory, and the frontend build.
- The Heap lesson's JavaScript/Python examples are now inside the canonical `codeExamples` array. The Java test harness was corrected to select only `language === 'Java 21'`; PRs #56 and #57 contain the corrective work.
- The quality ledger intentionally remains **not_assessed** for all 22 surfaces. Passing structural and CI checks is not a substitute for topic-level subject-matter review, accessibility testing or learner outcome evidence.
- Pattern Forge still has three reference pilots out of 28 patterns. The other 25 remain inventory-only and unpublished.
- This follow-up is static repository and CI evidence only. It does not claim a production browser walkthrough, manual assistive-technology review, independent SME review or learner study.

The overall all-topic content-quality audit therefore remains open. Continue with topic-level evidence collection and risk-based pilots; do not bulk-promote inventory records or change publication status without the required review evidence.
