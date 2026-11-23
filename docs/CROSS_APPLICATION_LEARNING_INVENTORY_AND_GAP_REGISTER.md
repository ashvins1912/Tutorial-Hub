# Cross-application learning inventory and gap register

**Audit baseline:** `main` at `53cb8b960bfbb2efe9d8b1d5a769d45f707c3dd5`  
**Audit date:** 2026-11-24  
**Method:** Git tree, canonical learning-surface registry, selected frontend/backend source, tests and CI configuration.  
**Evidence level:** Static inspection. No browser walkthrough, screen-reader audit, mobile-device validation, content fact-check or learner study is claimed.

## 1. Executive summary

Tutorial Hub is a multi-domain learning application, not a single course page. It combines curated academies, problem-solving studios, visualizers, simulators, generated/published lessons, code labs, progress systems and community features. The architecture already has useful foundations: a canonical learning-surface registry, topic-specific visualizer step generation, deterministic algorithm traces, a pure system-design traffic simulation engine, guarded code execution, and a published-lesson pipeline.

The principal architectural disconnect is that these capabilities are not yet composed through one lesson contract. The published lesson view renders Markdown as preformatted plain text; the interactive runtime chooses generic binary-search/bubble-sort traces independently of the published topic; and generated visualizations receive structural checks but not semantic proof. As a result, a lesson can contain a topic-specific explanation while its adjacent simulator teaches a different concept.

## 2. Application surface inventory

The machine-readable `docs/learning-surface-registry.json` remains the source for the complete typed `TopView` navigation inventory and representative component/data/API/test paths. The following groups describe the cross-application learning responsibilities and integration points.

| Learning surface family | Representative surfaces/components | Canonical content / engine | Evidence currently visible in repository | Main integration gap |
|---|---|---|---|---|
| DSA curriculum and interview practice | Complete DSA Course/Roadmap, Algorithms Studio, pattern roadmaps, problem banks, interview tracks | DSA catalogs, lesson packs, problem inventories, topic visualizer step generator | DSA inventory, handwritten-notes and selected batch tests | Not every lesson/problem has independently verified explanation, runnable code, visual trace and assessment rubric |
| Problem-solving cognition | Universal Solver, Problem X-Ray, Constraint/Complexity Decoder, Logic Builder, Pattern Recognition Drill, Polya workflow, skill tree | Solver adapters, cognitive routes, roadmap data | Selected route/security tests; surface registry | Reasoning evidence and transfer are not consistently joined to canonical lesson outcomes |
| Intelligent authoring and published learning | Intelligent Engine Studio, Content Authoring Panel, Published Lesson View, Learning Runtime, Code Execution Lab | Authoring pipeline, generated lesson schema, published lesson API, learning-progress API | Generation, publication security, runtime, code-execution tests | Plain-text Markdown display; simulator not lesson-bound; generation validation is structural |
| AI engineering academy | AI Engineering Academy, phase/deep-dive/RAG/agent/MCP lessons | AI academy curriculum/data modules | Curriculum and progress tests | Shared renderer/visualizer/simulator contract not demonstrated across academy content |
| OOP, SOLID and design patterns | OOD principles, custom data structures, animation stage | OOD and pattern data | Registry path mapping | Need explicit links from concept objectives to scenario, code, visualization and assessment |
| Database and data engineering | Database Internals, SQL workbench, query pipeline, deadlock, PITR, vector search labs | Database lesson/data sources and interactive lab logic | Surface registry and source paths | No global contract confirms simulator scenario matches the active database lesson or validates numerical assumptions |
| System design and architecture | System Design Studio/Academy, DFD simulator, Quick Commerce simulator, architecture interview lab | System design roadmaps, DFD/architecture data, `src/engine/simulationEngine.ts` | Pure traffic propagation engine source; system design AI security tests | Simulator engine is capable but scenario setup, learning objective and explanation are not represented by one lesson-level contract |
| Languages, runtime and concurrency | Languages Studio, Java/Python mastery, collections/concurrency, telemetry and exception labs | Language curriculum and interactive lab components | Surface registry | Java/runtime/version assumptions and scenario bindings need explicit metadata and verification |
| DevOps and cloud | DevOps Cloud Studio, CI/CD animator, cloud tutorials and simulators | Cloud/DevOps curriculum data and lab components | Surface registry | Operational simulations need explicit assumptions, failure cases, and reproducible outcome checks |
| Full-stack systems | Full Stack Studio, framework/runtime matrix, runtime/infra internals, storage diagnostics | Full-stack and runtime data | Surface registry | No universal mapping from lesson to relevant interactive lab and verified code sample |
| N-gram/fuzzy search | NGram Fuzzy Studio, visual stage, pruning simulator, product search case study | N-gram topic data and visualizer | Step-generator implementation | Existing trace generation is not necessarily tied to lesson IDs/objectives or assessed predictions |
| Learner progression and retention | Mastery stepper, revision hub, review panel, profile, sprints | Learning progress, AI Academy progress, cognitive routes, user state | Progress/grading tests | Viewed/checklist/quiz evidence must remain distinct from code, transfer and retention evidence |
| Community and collaboration | Community Hub, pair programming canvas | Community routes, pair room WebSocket | Auth/security work and community optimization | Collaborative activity is not equivalent to independently demonstrated topic mastery |

## 3. Core learning pipeline inventory

| Pipeline stage | Current implementation | Finding |
|---|---|---|
| Source ingestion and analysis | Content authoring routes/services and analysis metadata | Exists; source provenance and analysis are separate from proof of lesson correctness |
| Generation | Domain/kind-aware prompts and generated lesson types | Exists; output is correctly retained as `unverified-draft` |
| Validation | Required section checks, visualization type/source checks, minimum animation steps, quiz shape checks | Structural validation only; no proof that a diagram, trace, code or answer is semantically correct |
| Publishing | Published lesson route sanitizes answer keys | Existing security test ensures quiz answer keys are not exposed before submission |
| Explanation rendering | `PublishedLessonView.tsx` | `contentMarkdown` is placed in a `whitespace-pre-wrap` div, not parsed as Markdown |
| Visualization | `VisualizationRenderer.tsx` | Supports Mermaid subset/sequence/ER, chart/table/equation and step animation render paths; renderer coverage does not prove semantic correctness |
| Algorithm trace | `LearningRuntime.tsx` and `learningAlgorithms.ts` | Runtime hardcodes binary search and bubble sort, regardless of the published lesson topic |
| Topic visualizer engine | `src/features/visualizer/engine/stepGenerator.ts` | Existing topic families produce structured trace frames; this is a reusable foundation, not proof of all topics being mapped |
| System design simulation | `src/engine/simulationEngine.ts` | Pure DAG traffic propagation computes capacity, drops, latency, cache absorption and health state; scenario/lesson binding is separate |
| Code practice | `CodeExecutionLab` and code-execution API boundary | Safe capability boundary exists; arbitrary execution is not available in all environments |
| Assessment/progress | Quiz grading, practice checklist, learning progress APIs | Quiz and self-attested checklist are distinct evidence; neither alone proves independent implementation, transfer or retention |

## 4. Cross-application gap register

Severity reflects learner impact and architectural risk, not an assertion that every mapped surface is affected equally.

| ID | Priority | Gap | Evidence / affected layer | Required resolution | Acceptance evidence |
|---|---|---|---|---|---|
| LRN-001 | P0 | Published Markdown is not semantically rendered | Published lesson view displays raw Markdown as plain pre-wrapped text | Safe shared lesson Markdown renderer with headings, paragraphs, lists, tables, blockquotes, links and fenced code | Renderer fixtures plus published-view integration test; unsafe links remain inert |
| LRN-002 | P0 | Simulator is disconnected from lesson topic | Runtime hardcodes binary-search/bubble-sort selector for every published lesson | Versioned topic-specific simulator contract on lesson; runtime renders only a compatible configured simulator | Contract validator tests; runtime tests prove configured topic selection and no unrelated default |
| LRN-003 | P0 | Generated visualization validation is structural | Validator checks supported type/source and minimum two animation steps | Validate configuration shape, bounded data, references and supported simulator kinds; keep semantic correctness explicitly unverified pending review | Positive/negative validator tests and truthful lifecycle metadata |
| LRN-004 | P1 | Lesson-to-visualization relationship is weak | Visualizations are a flat list, not explicitly mapped to outcomes/modules | Add stable objective/module references and accessible descriptions in the content contract | Every displayed visualization has a lesson/module/objective anchor or an explicit standalone designation |
| LRN-005 | P1 | Visual traces lack learner prediction/checkpoints | Animation playback presents states; no required prediction response before reveal | Add prediction and explain-after-reveal in a later interaction-focused increment | Prediction task test and assessment outcome mapping |
| LRN-006 | P1 | Simulator assumptions are not first-class | System design engine computes meaningful metrics but scenario assumptions are external | Capture initial state, controls, metrics, expected relationships, limitations and scenario source | Deterministic scenario fixtures and reproducible expected outcomes |
| LRN-007 | P1 | Assessment evidence is conflated in some progress labels | Quiz score and practice checklist are surfaced alongside mastery language | Distinguish viewed, quiz-proficient, code-verified, simulator-complete, independent-solve, transfer and retained states | API/UI vocabulary audit and state-transition tests |
| LRN-008 | P1 | Visual accessibility evidence is uneven | Some SVGs have role/aria labels; text alternatives and reduced-motion behavior are not uniform | Provide textual trace/summary and keyboard operation; run reduced-motion and screen-reader checks | Automated accessibility assertions plus manual assistive-tech review |
| LRN-009 | P1 | Renderer capability boundaries are easy to overstate | Custom Mermaid parser supports a subset; source fallback exists | Label supported syntax accurately and test each renderer family; do not imply full Mermaid compatibility | Supported-syntax documentation and fixture matrix |
| LRN-010 | P1 | Code, trace and explanation are not guaranteed to agree | Code examples and visual steps are independent generated arrays | Introduce shared example/trace identifiers and reviewed line/state mapping in a later increment | Cross-artifact consistency review fixtures |
| LRN-011 | P1 | Surface registry maps views, not every lesson | Registry is a navigation-level discoverability map | Extend inventory progressively to lesson IDs, simulator IDs, visualizer fixtures, objective IDs and evidence state | Registry validation checks exact references and no orphan IDs |
| LRN-012 | P2 | No learner transfer/retention validation | Existing progress records focus on quiz and checklist state | Add delayed retrieval and novel-context transfer evidence without inferring mastery from opens | Delayed assessment and transfer scenario telemetry with consent/privacy review |

## 5. Shared lesson-to-learning contract

The intended learner journey is:

**Understand** (structured explanation) → **See** (diagram/visualization) → **Trace** (deterministic states) → **Predict** (learner commits to a next state) → **Experiment** (topic-specific simulator) → **Implement** (code) → **Verify** (assessment) → **Transfer** (new context) → **Retain** (spaced retrieval).

The lesson remains the source of truth for its topic, objectives, visualizations, simulator configuration and assessment. Runtime components consume that contract; they must not invent a generic simulator that contradicts the active lesson.

### Evidence vocabulary

- `inventory`: path and surface are catalogued.
- `content_complete`: required instructional sections exist; not proof of correctness.
- `code_verified`: identified examples were executed against recorded tests/environment.
- `visual_verified`: identified visual fixtures were reviewed against expected states.
- `assessment_verified`: answer keys/rubrics were reviewed and grading behavior tested.
- `learning_validated`: learner outcomes were evaluated with transfer/retention evidence.
- `unverified-draft`: generated output has not passed human/independent verification.

Do not upgrade evidence states based only on rendering, page opens, self-attested checklist completion or quiz accuracy.

## 6. Scope delivered in this change

- This register documents the application-wide learning surfaces and evidence-backed integration gaps.
- A shared safe Markdown renderer is introduced for published instructional module content.
- A typed, versioned simulator contract is added to generated/published lesson content.
- The learning runtime consumes the lesson simulator configuration and does not show a generic algorithm simulator when the lesson has no compatible simulator configured.
- This change does not claim all studios have been migrated, all content semantically verified, all visualizations audited, or all learner outcomes validated.
