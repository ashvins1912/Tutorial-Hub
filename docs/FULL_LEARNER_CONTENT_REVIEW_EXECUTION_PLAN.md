# Full Learner Content Review — Remaining Scope Execution Plan

**PR:** #69 — Full learner content review and code walkthrough UI  
**Branch:** `content/full-learner-content-review`  
**State:** execution plan; not evidence of completion  
**Constraints:** one consolidated PR; preserve existing behavior and learner data; no deployment, hosting changes, secrets, or external spend.

## Review contract

This plan closes the gap between an inventory and an actual review. Every in-scope learner-facing unit must receive a disposition with source, stable key/ID, exact location, technical evidence, severity, and reviewer rationale. A source is not complete because it was sampled, scanned, edited, or passed through a build.

For each source, review the complete file and its dependencies, including:
- rendered copy, headings, navigation labels, buttons, tooltips, helper text, accessibility names, empty/loading/error/success states;
- lesson bodies, definitions, prerequisites, hints, quiz prompts/options/answers/explanations, code comments and annotations;
- algorithm steps, visualizer labels, traces, diagrams, expected outputs and complexity claims;
- data contracts, stable IDs, persisted progress keys, API request/response behavior and runtime fallbacks;
- conditional states, mobile layouts, keyboard/focus behavior and reduced-motion behavior where applicable.

## Required disposition record

Each unit must be assigned exactly one status:
- `keep-verified`: correct, clear, complete for its purpose, and evidence recorded.
- `rewrite-verified`: corrected and verified against code, trace, example or authoritative technical reasoning.
- `split`, `merge`, `move`, `remove`, `add-example`, `add-caveat`: change applied and resulting content re-reviewed.
- `blocked-subject-matter`: specific question, owner/evidence needed, severity and learner impact recorded.
- `not-in-scope`: reason recorded; never used for learner-facing content merely to reduce workload.

No blank or default `unreviewed` value counts as reviewed. Candidate extraction must be reconciled against rendered sentence boundaries and must not silently discard units.

## Depth rubric

### Algorithms and data structures
For every concept/problem family, verify:
1. Problem definition, input/output contract, constraints and prerequisite vocabulary.
2. Recognition signals and conditions under which the method is valid.
3. Intuition separated from formal correctness; state the invariant/proof obligation.
4. A complete worked trace with intermediate states and exact output.
5. Implementation consistency: indexes, mutation, return value, duplicates, boundaries, empty/singleton cases and overflow.
6. Time complexity derived from operations and parameter definitions; distinguish worst, average/expected and amortized bounds.
7. Auxiliary, output and recursion/stack space separated.
8. Counterexample or “when not to use it”; compare an appropriate alternative.
9. Practice progression and feedback that diagnoses misconceptions, not just marks right/wrong.

Check specific families: hashing and collision behavior; two-pointer/window invariants; binary-search interval and termination; sorting stability/in-place/space; graph direction, weights and visited states; DP state/transition/base/order; greedy proof; recursion depth; randomized/probabilistic assumptions; streaming estimator error; string matching collision verification.

### System design and distributed systems
For every architecture/component, verify requirements and exclusions, workload assumptions and units, estimates labelled illustrative, component ownership, data model/index/partition key, read/write sequence, consistency/durability semantics, bottlenecks/backpressure, failure and recovery paths, retries/idempotency, security/privacy, observability, cost and alternatives. State protocol/configuration assumptions. Remove unconditional claims about exactly-once delivery, availability, failover, convergence, ordering or durability unless the mechanism and assumptions prove them.

### Programming languages, OOP and patterns
Check language/version and runnable syntax; explain memory/object lifecycle, mutability, equality/hash contracts, collection complexity, concurrency visibility/atomicity, exception behavior, inheritance/composition trade-offs, SOLID/pattern intent and misuse. Distinguish language guarantees from implementation details and framework conventions.

### Database, cloud, DevOps and full-stack
Check SQL semantics, transaction isolation, locks/deadlocks, index selectivity, query plans, migrations, backup/restore and recovery assumptions. For cloud/DevOps, distinguish service capability from configuration/region/plan limits; verify IAM/security boundaries, CI/CD stages, secrets handling, container health, rollout/rollback and infrastructure drift. For full-stack examples, trace request, auth, validation, persistence, async work, failure response and UI state end to end.

### AI/LLM and fuzzy retrieval
Check model/API names and version-sensitive behavior, prompt/data boundaries, retrieval chunking and ranking assumptions, embedding/vector dimensions, evaluation metrics, hallucination and injection risks, tool permission boundaries, rate limits and failure fallback. For fuzzy search, define normalization/tokenization, similarity metric, threshold, pruning correctness and exact-match verification after approximate candidates.

### Learning runtime, assessment and learner state
Trace canonical source → seed/bootstrap/API → persisted/published/generated content → UI. Verify content sanitization, authorization, ownership, versioning, progress/quiz history compatibility, idempotent writes, retry behavior and stale-cache handling. AI-generated and user-authored content must have a distinct provenance and review/safety policy; do not imply it has passed static editorial review.

## Surface-by-surface execution matrix

Review every registered component, data source and API route—not just the representative entry point.

| Surface | Review emphasis and enhancement targets |
|---|---|
| Universal problem solver | Problem contract, decomposition prompts, hint progression, optimization claims, imported problem provenance, answer validation and accessible feedback. |
| Concept knowledge engine | Authoring/publishing lifecycle, schema validation, sanitization, code execution sandbox boundaries, lesson versioning and learner-facing generated content. |
| AI engineering academy | Curriculum prerequisites, RAG/agents/MCP definitions, current API/version claims, threat model, evaluation and failure scenarios. |
| DSA curriculum workspace | Topic ordering, prerequisites, stable lesson IDs, examples, quiz alignment, progress continuity and complete edge-case coverage. |
| Algorithms studio | Catalog consistency, visualizer/code parity, sorting properties, algorithm assumptions and complexity/space distinctions. |
| N-gram and fuzzy search lab | Tokenization, normalization, metric math, threshold behavior, pruning proof, collision/false-match handling and language edge cases. |
| OOP/SOLID/design patterns | Correct intent, responsibilities, trade-offs, anti-patterns, runnable examples and composition/inheritance decisions. |
| AI engineering studio | LLM architecture assumptions, retrieval/evaluation, model limitations, security, cost/latency trade-offs and current terminology. |
| Database internals studio | SQL/query-plan accuracy, indexes, transaction isolation, lock graphs, deadlock resolution, PITR and recovery traces. |
| DevOps/cloud studio | IAM, networking, containers, orchestration, CI/CD, rollout/rollback, secrets, service limits and operational failure modes. |
| SDLC/architecture flight simulator | Scenario constraints, decision consequences, diagram-to-flow parity, risk scoring and realistic recovery paths. |
| Programming languages studio | Syntax/runtime correctness, collection contracts, memory, concurrency, exceptions and version-specific behavior. |
| Full-stack systems studio | End-to-end request/data flow, API/UI contract, auth, persistence, diagnostics, deployment and failure-state consistency. |
| System design studio | Requirements, estimates, component boundaries, data flow, consistency, bottlenecks, failure/recovery and alternatives. |
| Quick revision hub | Accurate concise summaries, prerequisite recall, spaced review, answer rationale and no misleading oversimplification. |
| Noob-to-pro skill tree | Dependency correctness, reachable progression, skill criteria, state transitions and accessible navigation. |
| Database/API schemas reference | Schema/API accuracy, examples, required/optional/null distinctions, validation and backward compatibility. |
| Topic/interview problem bank | Topic taxonomy, difficulty calibration, duplicate/coverage checks, constraints, canonical solutions and explanation quality. |
| Interview sprint war room | Schedule logic, timer/state transitions, scoring, mock feedback, reset/persistence and keyboard/mobile usability. |
| Community/pair programming | User-generated content safety, permission boundaries, collaboration state, conflict handling and accessible controls. |
| Learner profile/progress | Progress calculations, reset/sync semantics, privacy, stale/error states, stable keys and data-loss prevention. |
| Pattern Forge | Stage contracts, pattern recognition, trace engine correctness, mastery scoring, progression, persistence and feedback consistency. |

## Runtime and source tracing

For every surface, follow content through all available origins: canonical static data, server seed, database records, content bootstrap, APIs, AI generation, user authoring, cached/published versions and UI rendering. Record each origin, transformation, validation, fallback and persistence boundary. Where the source cannot be accessed or safely reproduced, record the precise limitation and leave the gate blocked.

## Enhancement standard

Prefer improvements that teach transferable reasoning:
- Add recognition cues, explicit assumptions, worked traces and misconception-specific feedback where missing.
- Use progressive disclosure for deep content; preserve learner position and existing progress.
- Make code examples copyable, language-labelled and line-numbered where useful; explain meaningful lines and show trace/output.
- Align code, explanation, visualizer, quiz and expected output to the same inputs and state.
- Improve semantic headings, keyboard operation, focus visibility, contrast, accessible names, responsive code handling and reduced-motion behavior.
- Use tests for invariants, boundary cases, data contracts, stable IDs and progress compatibility—not brittle tests that only assert exact prose.

## Validation and release gates

A surface may be marked `complete` only when:
- every rendered unit and state has a disposition;
- every technical claim has appropriate evidence;
- canonical/runtime copies are reconciled;
- tests cover corrected behavior and critical boundaries;
- responsive/accessibility checks are recorded;
- the source and PR head pass applicable typecheck, lint, content audits, security/regression tests and production build.

The final report must publish: extracted candidate count; manually reconciled learner-visible unit count; reviewed/dispositioned count and percentage; changed units by severity and action; unresolved P0/P1/P2/P3 findings; dynamic/runtime sources and exclusions; surface completion states; test/build results; manual UI verification results; and any remaining blockers.

**Completion rule:** Do not state “complete,” “fully reviewed,” “no omissions,” or “all 149 sources reviewed” until evidence supports each claim. Keep the PR draft while any required gate remains open.
