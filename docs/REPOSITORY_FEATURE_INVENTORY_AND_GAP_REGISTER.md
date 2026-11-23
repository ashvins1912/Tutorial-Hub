# Tutorial-Hub — Repository Feature Inventory and Gap Register

**Baseline:** `main` at `2acd983e8b5d37fa8cbbf9d9073e232727f1aa1b`  
**Audit date:** 2026-11-23  
**Purpose:** Map the inspected repository structure to the product's learning-quality standard.  
**Scope note:** This is a static repository inventory based on the Git tree and selected source files. It is not a claim that every screen, API behavior, lesson, simulator or deployment has been manually exercised.

## 1. Repository snapshot

The inspected `main` tree contains **442 tracked files**:

| Area | Files | Interpretation |
|---|---:|---|
| `src/components` | 149 | UI components, studios, labs, visualizers and shared UI |
| `src/data` | 90 | Curriculum, problem banks, lesson data, blueprints and registries |
| `src/features` | 66 | Feature-oriented academies and learning engines |
| `server/` | 57 | API routes, models, services, seeders, auth and WebSocket |
| `tests/` | 11 | Content-authoring/learning runtime and DSA batch tests |
| `docs/` | 12 | Architecture, curriculum, readiness and audit documentation |
| Other source/config/root files | 57 | App entry, auth, hooks, stores, libraries, tooling and configuration |
| **Total** | **442** | Git tree count at the baseline commit |

The root tree does not contain a `README.md` or an explicit license file at this baseline. Add an accurate README; make a deliberate license decision with the repository owner rather than assuming a license.

## 2. Product surface inventory

### 2.1 Main navigation / application views

The application entry point is `src/App.tsx`. The inspected active view identifiers include:

- Core DSA workspace, roadmap and revision.
- Algorithms Studio and fuzzy-search/N-gram learning.
- Universal Solver and Concept Knowledge Engine.
- OOP/SOLID/design patterns.
- AI Engineering Studio and AI Engineering Academy.
- Database Internals Studio.
- DevOps & Cloud Engineering.
- Flight Simulator / SDLC and architecture.
- Languages Studio.
- Full-Stack Systems Studio.
- System Design, skill tree and schemas.
- Sprint planning/war room.
- Community Hub and learner profile.

These names identify navigation/rendering surfaces, not proof that all their lesson content is complete or verified.

### 2.2 Representative component inventory

| Domain | Representative components / feature directories | Main learning value |
|---|---|---|
| DSA and algorithms | `CompleteDsaCourse`, `CompleteDsaRoadmap`, `AlgorithmsStudio`, `Master73RoadmapView`, `Patterns28RoadmapView`, `ProblemBank45View`, `TopInterview100Track`, `LeetCode75Track` | Patterns, algorithm explanations, problem practice and interview preparation |
| Problem-solving cognition | `ProblemXRayReader`, `ConstraintComplexityDecoder`, `LogicBlockBuilder`, `PatternRecognitionDrill`, `PolyaWorkflowBar`, `NoobToProSkillTree`, `UniversalSolverStudio` | Problem decomposition, recognition, reasoning and guided solving |
| Recursion / DP | `RecursionBacktrackingLab`, `CallStackVisualizer`, `DpLearningLab`, `DPLadderVisualizer` | Call-stack traces, state transitions and recurrence learning |
| OOP / design patterns | `OodPrinciplesStudio`, `OopCustomDsAcademy`, `OodAnimationStage` | Object modeling, SOLID and design pattern reasoning |
| Database | `DatabaseInternalsStudio`, `DatabasePracticeWorkbench`, `QueryPipelinePlayground`, `DeadlockWaitForVisualizer`, `PitrRecoveryPlayground`, `VectorSimilaritySearchLab` | SQL, internals, transactions, concurrency, recovery and vector retrieval |
| System design | `SystemDesignStudio`, `SystemDesignLearningAcademy`, `SystemPlayground`, `SystemDfdSimulator`, `QuickCommerceLiveSimulator`, `RealWorldArchitecturesAndInterviewLab` | Architecture, data flow, design trade-offs and interview practice |
| Languages / concurrency | `LanguagesTutorialStudio`, `JavaPythonCodingMasteryTrack`, `CollectionsConcurrencyPlayground`, `MultithreadingTelemetryLab`, `ConcurrencyExceptionsDeepDive` | Java/Python concepts, collections, concurrency and runtime behavior |
| DevOps / cloud | `DevOpsCloudStudio`, `DevOpsInteractiveSimulators`, `CloudDevCompleteTutorial`, `FramerCicdPacketAnimator` | Cloud, deployment, CI/CD and infrastructure learning |
| Full stack / runtime | `FullStackSystemsStudio`, `FrameworkRuntimeMatrixLab`, `RuntimeAndInfraInternalsLab`, `StorageAndDiagnosticsLab`, `PolyglotStackCodeLab` | Full-stack architecture, framework/runtime and storage internals |
| AI / ML engineering | `AIEngineeringAcademy`, `AiEngineeringStudio`, `FrontierLlmArchitectureLab`, AI academy data modules | ML, LLM, RAG, agent and MCP curriculum |
| Fuzzy search | `NGramFuzzyStudio`, `NGramVisualStage`, `PruningLogicSimulator`, `ProductSearchCaseStudy` | Similarity search, n-grams and practical search relevance |
| Learner progression | `MasteryStepper`, `MasteryReviewPanel`, `QuickRevisionHub`, profile and sprint views | Progress, review, retention and interview preparation |
| Community / collaboration | `CommunityHubView`, `PairProgrammingCanvas` | Community and collaborative practice |

### 2.3 Data and curriculum sources

The repository has a large static data layer and a canonical bundle registry in `src/data/canonicalDataRegistry.ts`. Key source families include:

- DSA: `algorithmsCatalog`, algorithm core/advanced/system packs, `dsaCompleteLessons`, `completeDsaRoadmap`, `dsa28Patterns`, `dsa28PatternTemplates`, `problems`, `matrixProblems`.
- Interview banks: Top Interview 100, LeetCode 75, high-ROI 45, product-company master bank, curated interview bank and Big Tech topic seeds.
- System design: system design roadmap/data, DFD libraries, real-world architecture blueprints and interview scenarios.
- Databases: database internals, SQL mastery, schema/object academy, query-flow, data engineering/AI DB and deep-gap data.
- Languages: Java/Python mastery, language tutorials, collections/concurrency, OOP/custom data structures and version evolution.
- DevOps/cloud: cloud/DevOps curriculum, deep gaps, masterclass blueprints and Docker/Kubernetes tutorial data.
- Full stack: architecture, deep enrichment, runtime and infrastructure internals.
- AI: seven-phase AI Engineering Academy data and deep-dive, extra, RAG and MCP lesson data.
- Cross-cutting: blueprints, topic resources, knowledge-link registry, component catalog and shared-topic academy.

The canonical registry currently declares eight content domains: algorithms, curriculum, problems, solver, system-design, ngram, ood and ai. The UI feature surface is broader than these registry domains. Confirm this is intentional: not every feature needs to be a MongoDB content bundle, but every learner-facing surface should map to a canonical content owner or be documented as an interactive tool.

### 2.4 Backend/API inventory

The inspected `server.ts` mounts the following route families:

| Mount path | Route module | Responsibility |
|---|---|---|
| `/api/auth` | `authRoutes` | Authentication/session identity |
| `/api/user-state` | `userStateRoutes` | Persisted learner state |
| `/api/profile` | `profileRoutes` | Learner profile and stats |
| `/api/community` | `communityRoutes` | Community functionality |
| `/api/learning-progress` | `learningProgressRoutes` | Learning progress and grading |
| `/api/ai-academy/progress` | `aiAcademyProgressRoutes` | AI Academy progress |
| `/api/code-execution` | `codeExecutionRoutes` | Code-execution capability boundary |
| `/api/cognitive` | `cognitiveRoutes` | Cognitive practice and revision |
| `/api/problems` | `problemRoutes` | Problem bank |
| `/api/interview-problems` | `interviewProblemRoutes` | Topic-wise interview catalog |
| `/api/authoring` | `contentAuthoring.routes` | Protected content authoring |
| `/api/leetcode/problem` | `leetcodeProblemRoutes` | Cached read-only problem source lookup |
| `/api/content-bootstrap` | `contentBootstrapRoutes` | Database content bootstrap |
| `/api/solver` | `universalSolverRoutes` | Solver and optional coaching |
| `/api/system-design` | `systemDesignAiRoutes` | System design walkthrough API |
| `/api/sprints` | `sprintRoutes` | Interview sprint generation |

The server also attaches a pair-programming WebSocket server and exposes `/api/health`. MongoDB startup seeding initializes catalogs, interview problem batches, platform content and Academy indexes.

### 2.5 Persistence and identity

Observed architecture:
- React + TypeScript + Vite frontend.
- Express/TypeScript application server.
- Existing Supabase Auth integration.
- MongoDB/Mongoose models for user, problem, content bundle, progress and related records.
- Zustand stores and account-synced state helpers.
- Content bootstrap with local canonical fallback and optional database hydration.
- WebSocket pair room support.

Do not replace these systems as part of a quality-standard rollout without a separately reviewed migration plan.

## 3. Test and automation inventory

The Git tree contains 11 test files:

- AI Academy curriculum and progress.
- Code execution safety boundary.
- Content generation.
- Learning progress grading and persistence.
- Learning runtime.
- Content-authoring phase 1.
- Published lesson security.
- Visualization renderer.
- DSA arrays verified batch 01.

The current CI workflow runs:
1. Dependency install.
2. TypeScript check via `npm run lint`.
3. DSA arrays batch 01 verification.
4. Content-authoring test suite.
5. Vite production build.

The CI workflow uses Node 22, Python 3.12 and Java 21. The package scripts currently expose `build`, `lint`, `test:dsa:arrays:01` and `test:content-authoring`; there is no single top-level `test` or `test:all` script in the inspected package manifest.

**Coverage interpretation:** 11 test files do not imply every one is run by CI unless included by the configured commands. Confirm the glob and test discovery behavior whenever adding a test. Current automated DSA execution is specifically named for arrays batch 01; do not generalize that to all DSA problems.

## 4. Documentation inventory

Existing docs cover:
- AI Academy production readiness.
- Complete DSA mastery curriculum.
- Content AI orchestration.
- Content visualization engine.
- DSA learning stage playbook.
- DSA master question coverage audit.
- Verified DSA batches.
- Intelligent Content Studio.
- Interactive learning runtime.
- Interview problem catalog API.
- Learner mastery and code execution.
- Supabase auth setup.

The master roadmap and this inventory add the cross-platform acceptance contract and feature mapping. A root README is also added by this PR to provide a contributor and setup entry point.

## 5. Evidence-backed gaps and risks

These are gaps in evidence, governance or repository discoverability. They are not assertions that a feature is broken.

### P0 — Trust and verification
1. **No single global inventory contract:** many feature folders and data files exist; maintain a machine-readable map linking each learner surface to canonical data, owner, route, tests and quality state.
2. **Uneven verification depth:** the DSA audit distinguishes 293 inventory/blueprint records from fully source-verified lessons. Keep this distinction visible.
3. **Visualizer evidence:** map each topic to a visualizer and deterministic fixture; component presence alone is not validation.
4. **Assessment-to-outcome mapping:** ensure every quiz/task maps to an observable learning outcome and authoritative grading where applicable.
5. **Mastery semantics:** align UI states across academies so lesson consumption is never presented as independent mastery.
6. **Content publishing gate:** apply lifecycle metadata and reviewer evidence consistently across authored and generated content.

### P1 — Learner experience and maintainability
1. **Global discovery:** audit search coverage across all domains and distinguish canonical lessons from related tools.
2. **Prerequisite graph:** validate links, missing prerequisites and cycles across DSA, databases, backend, frontend, cloud, system design and AI.
3. **Accessibility:** add repeatable keyboard, screen-reader, contrast, reduced-motion and mobile checks for visualizers and studios.
4. **Documentation:** root README was absent at baseline; onboarding and contribution steps need a maintained entry point.
5. **License decision:** repository license is not declared in the baseline tree; owner must select one deliberately.
6. **Test discoverability:** consolidate commands and ensure every suite is included in CI or explicitly excluded with rationale.
7. **Content freshness:** add review dates and source/version metadata for fast-changing framework, cloud and AI material.

### P2 — Advanced capability
- Adaptive practice based on observed misconceptions.
- Cross-academy capstone projects.
- Architecture/concurrency/database failure-injection simulations.
- Learner export and revision planning improvements where compatible with existing privacy and persistence architecture.

## 6. Recommended implementation order

| Order | Deliverable | Exit evidence |
|---|---|---|
| 1 | Canonical surface inventory (this document as baseline) | Every navigation surface mapped to data/component/API/tests |
| 2 | Topic/prerequisite graph audit | No unexplained duplicates, broken links or unsupported cycles |
| 3 | Content lifecycle metadata and validators | Draft/verified/published states independently validated |
| 4 | DSA 293-question reconciliation | Exact canonical IDs and truthful quality state per problem |
| 5 | One complete pilot lesson per major domain | Reviewer sign-off for explanation, practice, visualization and assessment |
| 6 | Visualizer coverage/fixture suite | Deterministic tests for every visualizer labelled verified |
| 7 | Cross-academy mastery semantics | Same evidence-based progress model across learner surfaces |
| 8 | Accessibility/performance audit | Automated checks plus manual evidence |
| 9 | Full CI suite and release gates | All applicable suites pass for exact commit |
| 10 | Expand content only after pilot | No bulk-generated unreviewed material is published |

## 7. What is not claimed

- This audit does not claim that all 149 components have been manually tested.
- It does not claim all 90 data files contain complete lessons.
- It does not claim the 293 DSA records are 293 fully verified solutions.
- It does not claim every UI view has an equivalent content bundle.
- It does not claim all test files are included in CI.
- It does not claim production deployment, backup/restore, load or accessibility testing has been completed.
- It does not authorize paid APIs, execution infrastructure, deployment or merge to `main`.

## 8. Definition of a complete platform inventory

An inventory item is considered fully audited only when it records:

```yaml
surface_id: ""
surface_name: ""
domain: ""
kind: "academy | topic | lesson | problem_bank | simulator | authoring | profile | community"
entry_point: ""
component_paths: []
canonical_data_sources: []
api_routes: []
persistence_models: []
prerequisite_ids: []
assessment_ids: []
visualizer_ids: []
test_files: []
quality_state: "inventory"
owner: ""
last_reviewed: ""
known_gaps: []
```

This inventory schema should become machine-readable in a later implementation after the full path mapping has been reviewed. Do not fabricate owners, quality states or verification evidence.
