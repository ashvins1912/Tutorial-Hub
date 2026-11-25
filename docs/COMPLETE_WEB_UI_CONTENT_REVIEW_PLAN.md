# Complete Web UI Content Review Plan

**Plan date:** 2026-11-25  
**Repository:** `ashvins1912/Tutorial-Hub`  
**Review branch / PR:** `content/web-ui-sentence-review` / PR #68  
**Goal:** A complete, evidence-backed review and correction of learner-facing web UI content, including definitions, every sentence, use cases, examples, code explanations, quizzes, feedback, and interactive visual narratives.

## 1. Review principles

Use the requested references as high-level instructional benchmarks, not as sources to copy or imitate:

- Aditya Bhargava, *Grokking Algorithms*: intuitive mental models, approachable diagrams and incremental examples.
- Jay Wengrow, *A Common-Sense Guide to Data Structures and Algorithms*: practical reasoning, readable steps and complexity discussion.
- Narasimha Karumanchi, *Data Structures and Algorithms Made Easy*: organized problem-solving and practice progression.
- Brian Christian and Tom Griffiths, *Algorithms to Live By*: connect algorithmic ideas to decisions while separating analogy from formal guarantees.
- Thomas H. Cormen, *Algorithms Unlocked*: explain the problem, method, correctness intuition and efficiency.
- Alex Xu, *System Design Interview*: requirements, component choices, bottlenecks, scaling and trade-offs.
- Roberto Vitillo, *Understanding Distributed Systems*: failure, communication, replication, consistency and operational behavior.
- Martin Kleppmann, *Designing Data-Intensive Applications*: data models, reliability, scalability, consistency and system guarantees.
- Gaurav Sen’s public educational material: interview-oriented decomposition and architecture reasoning.

All rewritten text, examples, code, diagrams and exercises must be original. Verify technical claims independently and cite references in internal review notes where useful; do not reproduce copyrighted passages.

## 2. Initial repository inventory

A recursive Git tree snapshot was taken from `main` for planning. It contained 522 file blobs (615 tree entries including directories). High-level file counts:

| Area | Files | Review purpose |
|---|---:|---|
| `src/data/` | 90 | Canonical catalogs, topic/algorithm explanations, examples, quiz data and architecture content |
| `src/components/` | 152 | Inline UI copy, labels, help text, code walkthroughs, visualizer narratives, feedback and dynamic explanations |
| `server/seed/` and seed-related `server/db/` files | 10 | Seeded/published/AI-authored content, duplicate or transformed copies and runtime delivery |
| `docs/` | 30 | Authoring standards, curriculum and content inventories; not all are learner-facing UI |
| Other repository areas | Remaining files | Inspect routes, API responses, schema, tests and runtime generation paths for text that reaches the UI |

A broad filename/path filter identified 340 candidate files across source, components, data, seeds and docs. This is an over-inclusive candidate set, not a count of content files or sentences. The exact UI surface and sentence totals must be derived by tracing rendered components and extracting content—not by treating every candidate as learner-facing.

## 3. Complete review coverage

### A. Static and canonical content
- Algorithm and data-structure catalogs, pattern templates, roadmaps, topic summaries, metadata and resource descriptions.
- Definitions, recognition cues, invariants, derivations, brute-force and optimized approaches, complexity, pitfalls, examples and language patterns.
- System-design concepts, component descriptions, architecture narratives, decision criteria, bottlenecks, failure modes and trade-offs.
- Database, SQL, operating systems, networking, concurrency, cloud/DevOps, language and OOD lessons.
- Interview problem statements, constraints, expected approaches, solution explanations and follow-up questions.

### B. Interactive and component-owned content
- Components with inline strings, tooltips, placeholders, modal descriptions, empty states, buttons and accessibility labels.
- Code editors, trace tables, variable explanations, line annotations, generated output and error feedback.
- Animations, simulators, packet/step narratives, architecture diagrams, node/edge labels and legends.
- AI tutor prompts and returned content, template-generated descriptions and runtime-composed explanations.

### C. Assessment and reinforcement
- Quiz stems, options, correct answers, distractors, hints, solution rationale and misconception feedback.
- Flashcards, active-recall prompts, spaced-repetition explanations, checkpoints and mastery criteria.
- Difficulty labels and claims about prerequisites or expected completion.

### D. Duplicated and runtime-delivered content
- Frontend canonical sources and backend seed copies.
- Published lessons, sanitized content, generated content, persisted records and migration/seed transforms.
- Content loaded through APIs, feature flags, fallback catalogs, user-created content templates and caching.
- Ensure corrections reach the authoritative source and all supported delivery copies without resetting user progress.

## 4. Required sentence-level audit record

Each learner-facing sentence or short label receives a stable audit row with:

- Surface ID and route/component name.
- Canonical source path and key/record ID; note any seed or published copy.
- Exact original text and sentence index (or label type).
- Content role: definition, claim, instruction, use case, example, caveat, question, feedback, UI label, etc.
- Concept and prerequisite links.
- Claim/assumption review, technical correctness, terminology, ambiguity and reading level.
- Alignment with code, trace, diagram, animation, quiz answer and test oracle.
- Disposition: `correct`, `rewrite`, `expand`, `remove`, `duplicate`, `needs-expert-check`, or `not-learner-facing`.
- Severity, proposed final text, rationale, verification evidence and reviewer/date.

A file is not complete until all its extracted sentences/labels have a disposition. “No change needed” is a valid disposition only with a recorded check; it must not be inferred from an untouched file.

## 5. Technical content review rubric

### Definition
- State the essential properties, not merely a synonym or benefit.
- Distinguish the concept from neighboring concepts and common confusions.
- Explain what is included and what is not included.
- Use precise terms and define unfamiliar vocabulary on first use.

### Explanation and derivation
- Begin with the problem or motivation.
- Show the model/state and the invariant or governing rule.
- Explain why each step is valid; do not present a memorized heuristic as a proof.
- Link the mental model to the actual implementation.

### Use cases
- State the input/problem shape and conditions that make the technique appropriate.
- Explain why it fits and what it optimizes.
- Include a realistic use case and at least one counterexample or non-use case where relevant.
- Avoid implying that one technique applies to every problem in a broad category.

### Examples and code
- Use original, small, traceable examples.
- Walk through input, state transitions, intermediate state and final result.
- Check indices, boundaries, duplicate handling, empty/singleton cases and numeric overflow.
- Verify every language implementation independently; avoid claiming equivalent code when behavior differs.
- Keep code, explanation, animation, quiz and expected output consistent.

### Complexity
- Identify variables (N, V, E, W, H, output size, etc.).
- Distinguish worst-case, average/expected, amortized and output-sensitive bounds.
- State auxiliary space separately from input/output storage.
- Qualify hash, heap, recursion, graph representation and data-dependent claims.
- Do not label illustrative timing as a guarantee.

### System design
- Begin with functional/non-functional requirements and assumptions.
- Explain workload, access pattern, data ownership and consistency needs.
- Discuss throughput, latency, storage, capacity, bottlenecks and failure domains.
- Describe timeout ambiguity, retries, idempotency, ordering, duplication, backpressure and recovery where applicable.
- Distinguish a component’s capability from a configured system guarantee.
- Explain trade-offs and alternatives; avoid universal “best architecture” claims.
- Mark synthetic metrics, traffic and cost figures as illustrative and show assumptions.

## 6. Review phases and exit criteria

### Phase 0 — Freeze scope and protect behavior
- Capture base/head SHA, route list, content registries and existing tests.
- Identify stable IDs, learner progress, quiz history, published-content and API contracts.
- Establish content-only change policy unless a UI defect requires a narrowly scoped code change.

**Exit:** reproducible baseline and explicit protected behavior list.

### Phase 1 — Build the rendered-surface inventory
- Enumerate routes and navigation destinations.
- Trace each route to components and data sources.
- Extract visible text and interactive text from canonical data, inline JSX/TS, backend responses and generated templates.
- Record conditional states, responsive variants, accessibility text and empty/error/loading states.
- Map duplicates to a canonical concept/source.

**Exit:** every reachable learner-facing surface has an owner, source path and extraction method; unexplained gaps are listed.

### Phase 2 — Sentence-by-sentence technical audit
- Audit every sentence/label in the inventory using the record above.
- Check definitions, assumptions, claims, use cases, limitations, terminology, grammar and sentence structure.
- Prioritize critical correctness errors, misleading complexity, unsafe operational guidance and mismatches with code.
- Resolve contradictions across all occurrences of the same concept.

**Exit:** every extracted text unit has a recorded disposition; no high-severity unresolved correctness issue is silently marked complete.

### Phase 3 — Deepen explanations and examples
For each concept, ensure the learner can answer:
1. What is it?
2. Why does it exist / what problem does it solve?
3. When should I recognize it?
4. What assumptions are required?
5. How does it work step by step?
6. Why is the method correct?
7. What are the time and space costs?
8. What are its limits and common failure modes?
9. What is a realistic use case and a non-use case?
10. How does the code implement the explanation?

**Exit:** each concept meets the depth contract appropriate to its level; advanced material includes proof/trade-off details without burying beginner content.

### Phase 4 — Apply edits at the source of truth
- Update canonical records first.
- Propagate to seeds, templates, published/static copies and runtime output paths.
- Preserve IDs, ordering where behavior depends on it, localization keys, progress references and quiz record identity.
- Avoid broad automated prose replacement unless every affected occurrence is reviewed.

**Exit:** no known stale duplicate; changes are traceable to audit rows.

### Phase 5 — Functional and content regression
- Run formatting, typecheck, lint, unit/integration tests, content validators and production build.
- Add tests for corrected claims where feasible: expected output, edge cases, complexity metadata, quiz rationale, animation trace.
- Compare route/surface inventory and extracted text against baseline.
- Manually inspect representative desktop/mobile views and each changed interactive narrative.
- Confirm no content corruption, missing key, broken rendering, progress reset or API/schema change.

**Exit:** checks pass or failures are documented with owner and blocking status; visual and behavioral review is recorded.

### Phase 6 — Completion report and PR readiness
- Publish audited/changed/unchanged/blocked counts by domain and file.
- Link the sentence-level ledger and test results.
- List unresolved expert checks and out-of-scope items explicitly.
- Do not claim “complete” if any reachable surface lacks extraction or disposition.

**Exit:** reviewers can reproduce scope, trace every correction and verify all completion gates.

## 7. Severity and prioritization

- **P0 — Critical:** false algorithm/system guarantee, dangerous operational guidance, code/output mismatch that teaches a wrong result, or data/progress risk.
- **P1 — High:** incorrect definition, invalid use case, wrong complexity, missing assumption that changes correctness, misleading distributed-systems guarantee.
- **P2 — Medium:** incomplete explanation, unclear derivation, inconsistent terminology, poor example/edge-case coverage.
- **P3 — Editorial:** grammar, punctuation, verbosity, formatting, accessibility wording or minor clarity improvements.

Fix P0/P1 first, then P2, then P3 while keeping concept and duplicate consistency.

## 8. Current evidence and status

In PR #68, the following targeted corrections have been made and verified in the branch source:

- Hash-map complexity in the foundations UI is qualified as expected and includes an auxiliary-space trade-off.
- Shared two-pointer guidance requires an invariant/proof to justify discarding candidates.
- System-design descriptions qualify cache benefits, Bloom-filter memory and false-positive behavior, queue durability/retry conditions, and illustrative animation latency.

The prior PR diff contains four files including a focused review report. This is a starting batch, **not** completion of the full inventory. No automated workflow run was observed for the current head at the time of this plan. Full review status remains `in_progress` until phases 1–6 meet their exit criteria.

## 9. Constraints

- Keep work on the existing PR #68 branch unless the user explicitly requests a separate PR.
- Preserve existing functionality, canonical IDs and learner progress.
- No deployment, hosting changes, external paid services or costs.
- Do not mark unreviewed text as reviewed or use an automated grammar scan as a substitute for semantic review.
