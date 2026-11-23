# Cross-Application Learning Inventory and Gap Register

**Baseline:** `main` at `53cb8b960bfbb2efe9d1b5a769d45f707c3dd5` (2026-11-24 snapshot)  
**Implementation branch:** `feat/lesson-contract-renderer-20261124`  
**Scope:** learner-facing application surfaces, canonical content, explanation rendering, visualizations, simulations, assessments, progress and evidence.  
**Evidence rule:** inventory presence is not quality verification. This register distinguishes source inspection from test evidence and unverified runtime behavior.

## 1. Executive assessment

Tutorial Hub has substantial domain-specific learning surfaces and a range of purpose-built interactive labs. The architectural weakness is not a lack of visual components: it is the absence of one consistently enforced lesson contract connecting each topic's explanation, objectives, visualization, simulator, code examples, assessment and progress evidence.

The published Content Studio path is especially clear: generated modules carry Markdown but the published view previously displayed it as pre-wrapped plain text; the learning runtime independently offered binary search and bubble sort regardless of the published topic. This creates a mismatch between what the learner reads and what the learner experiments with.

This branch establishes the first vertical slice:
- Safe structured Markdown rendering for published lesson explanations.
- An explicit optional simulator contract attached to the lesson and validated during generation.
- Runtime selection based on that contract; no simulator is shown when a lesson has no supported topic-matched simulator.
- An application-wide inventory and gap register with explicit evidence states.

## 2. Cross-application inventory

| Learning surface / domain | Existing learning assets and interaction | Content / evidence observations | Priority gap |
|---|---|---|---|
| DSA / algorithms | Complete DSA course and roadmap, pattern roadmaps, problem banks, algorithm catalog, visualizer step generator, recursion/backtracking and DP labs | Dedicated trace generation exists for arrays/pointers, sliding window, maps, stack/queue, DP, recursion, trees/graphs and n-gram. Prior DSA work establishes structured topic completeness for 23 lessons, not universal code/visual/assessment verification. | Bind each lesson to a specific trace fixture, code example, invariant and objective; expand verified examples beyond current selected batches. |
| Universal problem solving | Problem X-Ray, constraint/complexity decoder, logic builder, pattern drills, guided solver and optimization panels | Strong decomposition and coaching surface; not every interaction is an authored lesson or has an observable outcome mapping. | Distinguish tool workflows from curriculum lessons; add scenario-specific assessment and transfer evidence. |
| Concept Knowledge Engine / Content Studio | Source ingestion, classification, generated modules, visualization renderer, published lesson view, quiz/practice, code lab | Generation validator enforces structural sections and visualization type; it does not establish semantic correctness. Published lesson rendering and generic simulator mismatch were directly confirmed in source. | Unified lesson schema and rendering; topic-bound simulator contract; semantic review gates. |
| AI Engineering Academy | Phased curriculum, deep-dive lessons, RAG, agent/MCP and extra lesson data; progress endpoints | Dedicated curriculum/progress test files exist. Presence does not verify every lesson, code sample, diagram or current framework claim. | Map each phase/lesson to objective, hands-on lab, source freshness and assessment; test representative end-to-end learner paths. |
| OOP / SOLID / design patterns | OOD principles studio, custom data-structure academy, OOD animation stage | Rich interactive surface; current registry maps components/data but does not certify correctness of each animation or pattern example. | Add pattern-specific scenario, before/after design, trade-off rubric and accessible text trace. |
| Database / SQL / internals | Database internals, query workbench, query pipeline, deadlock, PITR recovery and vector search labs | Multiple interactive tools exist; engine-specific assumptions and correctness fixtures need per-topic evidence. | Link schema/query/transaction lesson to scenario simulator and DB-specific assumptions; add invariant/failure test fixtures. |
| System design / distributed systems | System Design Studio, DFD simulator, system playground, quick-commerce simulator, architecture blueprints; pure DAG traffic simulation engine | Simulation engine models capacity, replicas, latency, dropped traffic, rate limiting, cache absorption and offline/degraded status. This is a genuine quantitative simulator, but the inspected runtime does not yet share a common lesson binding contract with it. | Define scenario contracts, units/assumptions, expected outcomes and failure-diagnosis tasks; avoid claiming measured production performance. |
| Languages / concurrency | Java/Python mastery, language tutorials, collections/concurrency playgrounds, multithreading telemetry | Code and runtime-focused learning surfaces exist; broad version and language-specific correctness coverage is not established by the surface registry. | Bind examples to language/runtime versions, runnable tests and concurrency schedules/interleavings. |
| DevOps / cloud | Cloud/DevOps curriculum, Docker/Kubernetes tutorials, CI/CD packet animator, interactive simulators | Deployment and infrastructure topics change quickly; no universal content freshness or scenario-verification evidence is recorded. | Add provider/version/region assumptions, IaC validation fixtures, incident scenarios and reviewed cost/security caveats. |
| Full-stack / runtime | Full-stack systems studio, framework/runtime matrix, infrastructure and storage diagnostics labs | Multiple layers and framework comparisons; lesson-to-demo and version coverage require deeper inventory. | Bind frontend/API/database flow examples to executable fixtures and explicit failure/observability outcomes. |
| N-gram / fuzzy search | N-gram visual stage, pruning simulator, product-search case study | Topic-specific algorithm traces and staged pipeline concepts exist. | Verify mathematical bounds and sample fixtures, and connect visual steps to code and retrieval-quality trade-offs. |
| Progress / revision / profile | Mastery stepper, quick revision, review panels, profile and sprint workflows | Progress persistence and quiz grading exist. A quiz score or self-checked task is not independent coding mastery, transfer or retention. | Separate evidence types: viewed, quiz proficiency, code verified, simulator task, independent solve, transfer and spaced retention. |
| Community / pair learning | Community hub, leaderboard, pair programming canvas | Authenticated collaboration and progress sharing exist; leaderboard query efficiency has a separate optimization track. | Measure collaborative learning outcomes without conflating participation with mastery; keep identity and room authorization controls explicit. |

## 3. Shared architecture map

| Layer | Existing implementation | Contract needed |
|---|---|---|
| Navigation / discovery | `TopView` and `docs/learning-surface-registry.json` | Surface → canonical topic IDs → owner → lesson IDs → tools → evidence. |
| Canonical content | Static data packs, canonical bundle registry, authored/published lesson bundles | Stable lesson identity, schema version, source/provenance, objectives, prerequisites, modules, review status. |
| Explanation | Published lesson modules with `contentMarkdown`; many academy-specific renderers | One safe instructional Markdown/block renderer with consistent headings, code, tables, lists, callouts and equations. |
| Visualization | Mermaid subset, sequence/ER diagrams, charts, tables, equations and step animation; separate domain-specific SVG/React Flow labs | Visualization kind, objective binding, semantic fixture, text alternative and supported-renderer declaration. |
| Simulator | DSA trace engine, system design DAG simulator and domain-specific interactive labs | Typed simulator kind/config, topic binding, objective IDs, input schema, deterministic fixture and expected output. |
| Code | Code examples and guarded CodeExecutionLab | Language/runtime version, setup/input/output, tests and explicit execution verification state. |
| Assessment | Quiz, practice tasks, problem banks and studio exercises | Outcome mapping, rubric, answer-release policy, authoritative grading and difficulty. |
| Progress | Learning progress, Academy progress, checklist and profile data | Evidence provenance and distinct proficiency/verification/retention states. |
| Quality / CI | Type-check, build, selected DSA and content/security tests, surface path audit | Per-lesson content, code, visualization, simulator, assessment, accessibility and learner-journey evidence. |

## 4. Confirmed implementation gaps

### P0 — architectural correctness
1. **Explanation rendering mismatch — confirmed before this branch.** Published `contentMarkdown` was inserted as text in a `whitespace-pre-wrap` container. Markdown headings, lists, tables, code fences, emphasis and links were not rendered semantically.
2. **Simulator/topic disconnect — confirmed before this branch.** LearningRuntime always presented binary search and bubble sort, independent of the published lesson.
3. **No explicit lesson-to-simulator schema — confirmed.** Generated lesson schema carried modules, visualizations, quiz and practice tasks but no typed simulator binding.
4. **Generated visualization checks are structural, not semantic — confirmed.** Type/title/source and minimum animation step count do not prove a diagram or transition is correct or relevant.
5. **Verification semantics must remain separate.** Generation remains `unverified-draft`; structural validation must not imply subject-matter review, code execution, visual verification or learning effectiveness.

### P1 — cross-domain quality
1. Topic-to-visualization fixture coverage is incomplete and uneven.
2. No common objective mapping spans explanation, visualization, simulator, code and assessment.
3. Accessible text alternatives, keyboard behavior, reduced motion and responsive checks are not uniformly evidenced.
4. Content source/version/review dates are not consistently visible across fast-changing cloud, framework and AI topics.
5. Quiz score and self-attested practice completion must not be presented as proof of independent mastery or transfer.
6. Cross-application prerequisite and duplicate-topic relationships need graph-level integrity checks.

### P2 — advanced learning evidence
1. Prediction-before-reveal and misconception-specific feedback.
2. Failure injection and scenario-based diagnosis across database, concurrency, distributed systems and cloud.
3. Code-to-trace synchronization with verified line mappings.
4. Spaced retrieval and delayed transfer checks.
5. Cohort-level learning effectiveness analysis with privacy-preserving aggregation.

## 5. Evidence and acceptance model

Every lesson/surface should expose independent states; never collapse them into a single green “verified” badge.

| Evidence dimension | Meaning | Minimum evidence |
|---|---|---|
| Inventory | Source paths and product surface are mapped | Registry path integrity |
| Content complete | Required instructional sections and outcomes exist | Schema + completeness test |
| Content reviewed | Explanation and claims reviewed by a qualified reviewer | Reviewer identity/role, date, source and review notes |
| Code verified | Example compiled/executed against declared runtime and tests | Reproducible command, runtime version, test result |
| Visualization verified | Diagram/trace semantics match the lesson | Deterministic fixture and expected states |
| Simulator verified | Inputs, transitions, units and outputs are correct | Deterministic scenario tests and assumptions |
| Assessment verified | Questions map to objectives and grading/rubric is reviewed | Outcome IDs, answer key/rubric and test |
| Accessible | Keyboard, screen-reader, reduced-motion and text alternative checks passed | Repeatable automated/manual evidence |
| Learning validated | Learner can solve independently, transfer and retain | Delayed/transfer task evidence; not page opens |

## 6. This branch: implementation scope and boundaries

- Added `LessonMarkdown`, a dependency-free safe Markdown subset. It renders headings, paragraphs, emphasis, inline code, safe HTTP(S) links, fenced code, lists, blockquotes and basic tables. Raw HTML is not interpreted.
- Added a typed optional `LessonSimulatorConfig` for the currently implemented deterministic algorithm trace simulator. It identifies the algorithm, input, optional target and objective IDs.
- Added generation validation for simulator shape and required objective binding. Unsupported simulator kinds/algorithms are rejected; missing simulator remains valid and means no simulator is displayed.
- Published lesson sanitization preserves the simulator contract while continuing to remove quiz answer keys.
- Runtime uses the published simulator config rather than exposing a generic algorithm selector. Existing persisted progress remains scoped to lesson ID; saved algorithm/input values are only restored when a matching simulator is present.
- No claim is made that all domains now have simulators. The contract is intentionally extensible; system-design and database simulators remain separate implementations until their own typed adapters and deterministic tests are designed.

## 7. Prioritized follow-up register

| ID | Priority | Work item | Exit evidence |
|---|---|---|---|
| INV-01 | P0 | Complete nested lesson/problem catalog across every studio | Every canonical topic mapped to stable lesson ID and owner |
| LES-01 | P0 | Extend common block schema beyond Markdown modules | Typed explanation, code, callout, math, media and activity blocks |
| SIM-01 | P0 | Add simulator adapters for system design, database and concurrency | Contract + deterministic scenario tests per simulator kind |
| VIS-01 | P1 | Semantic validation for diagrams/charts/animations | Expected graph/state fixtures; malformed and misleading inputs rejected |
| CODE-01 | P1 | Per-example code verification | Reproducible Java/Python/JS/SQL test results and runtime versions |
| ASSESS-01 | P1 | Outcome-linked quiz and practice rubrics | Every assessment item maps to an objective and grading evidence |
| A11Y-01 | P1 | Common visualizer accessibility contract | Keyboard/screen-reader/reduced-motion/text-alternative checks |
| FRESH-01 | P1 | Content provenance and freshness | Source URL/version/review date for volatile material |
| MAST-01 | P1 | Evidence-based mastery states | Distinct quiz, code, independent solve, transfer and retention evidence |
| PATH-01 | P2 | Prerequisite and duplicate-topic graph | No unexplained cycles, broken links or duplicate canonical owners |

## 8. Validation caveat

The inventory is a source-level map, not a claim that every listed surface was opened and exercised. Existing components and test filenames are evidence of implementation presence only. The branch CI results must be inspected before claiming type/build/test success; visual browser behavior, assistive technology and learner outcomes require separate validation.
