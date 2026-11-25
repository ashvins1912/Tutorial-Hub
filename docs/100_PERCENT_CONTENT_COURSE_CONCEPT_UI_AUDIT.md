# 100% Content, Course, Concept and UI Audit

## Purpose

Complete a source-backed review of every learner-visible topic, course, concept, lesson, exercise, code sample, answer, hint, explanation, visualization, interactive state and relevant UI surface in Tutorial Hub. This is a coverage and evidence objective—not a claim that subjective educational quality can be mathematically guaranteed.

This audit continues after PR #69, which was merged as `2b9308e341544a68b0b9f0579502e81db621ac47`. Its guide inventory, writing standard, bounded corrections and tests are inherited baseline work; they do not count as full application completion.

## Coverage model: no sampling

Audit each registered source path and every learner-visible content unit inside it. Maintain stable identifiers and a disposition for every unit. A unit is not complete merely because its file was opened, a build passed, or a related test exists.

### Content unit types

- Topic, course, module, chapter, lesson and concept title/description/objectives/prerequisites.
- Definitions, terminology, analogies, explanations, proof/intuition, edge cases and counterexamples.
- Algorithm/data structure steps, invariants, correctness reasoning, complexity and assumptions.
- Code examples, starter code, expected output, language/runtime versions, tests and error cases.
- Worked examples, trace tables, diagrams, animations and interactive visualizations.
- Quiz questions, choices, correct answers, distractors, hints, explanations, scoring and remediation.
- Exercises, constraints, examples, hidden/visible tests, solution walkthroughs and alternative approaches.
- Interview prompts, follow-up twists, model answers and evaluation rubrics.
- Published, seeded, database-backed, generated, user-authored, cached and fallback content.

### Per-unit audit record

For each unit record:
1. Stable source path, exported symbol/record key, unit ID and learner-facing route/surface.
2. Exact unit type and rendered text/code/media/state; record dynamic variants and locale if present.
3. Technical correctness and source/reasoning evidence; assumptions, preconditions, postconditions and complexity model.
4. Pedagogical quality: prerequisite fit, clarity, sequencing, cognitive load, misconception risk, examples and transfer.
5. Editorial quality: grammar, terminology, consistency, accessibility of language, formatting and references.
6. Severity and disposition: pass, corrected, intentionally excluded with reason, or unresolved; link the fix and regression test.
7. Reviewer/date and evidence (test, build, manual UI result, or cited authoritative technical source).

## UI and interaction audit: every surface and state

Use the merged `docs/learning-surface-registry.json` as the initial inventory, then reconcile it against routes, navigation, lazy imports, feature flags, content registries, API routes, seeders, DB schemas and runtime loaders. Add any missing surface/source before reviewing.

For every route/component and each content type, inspect:
- Initial, loading, empty, populated, error, retry, offline, permission-denied and expired-session states where applicable.
- Desktop, tablet and narrow mobile widths; overflow, clipping, wrapping, touch target and scroll behavior.
- Keyboard-only navigation, visible focus, semantic headings/landmarks, labels, accessible names, screen-reader announcements, reduced motion and contrast.
- Interactive controls, state transitions, persistence, refresh/back navigation, repeated actions, boundary inputs and failure recovery.
- Code editors/runners, visualizers, diagrams, quizzes, modals, tabs, accordions, tooltips, search/filter/sort/pagination and progress/mastery UI.
- API/UI contract, auth/authorization, content sanitization, stale cache, error messages and user data/progress preservation.
- Browser console, network/API failures, layout screenshots or equivalent reproducible evidence for each required viewport/state.

A surface is complete only when all registered units and required states have dispositions and no unresolved release-blocking issue remains.

## Accuracy standards

- State the precise input domain and assumptions before giving complexity or correctness claims.
- Distinguish worst-case, average/expected, amortized, output-sensitive and distribution-dependent bounds.
- Include auxiliary space versus input/output space, recursion stack, preprocessing, memory and I/O where relevant.
- Validate edge cases, overflow, mutation, duplicate values, empty/singleton inputs, invalid parameters and adversarial inputs.
- Avoid unsupported speedups, fixed hardware cutoffs, guaranteed latency, absolute convergence/durability/security claims and unqualified “optimal” labels.
- Explain when a technique does not apply and what alternative or invariant is required.
- Use original explanations and examples; book-informed principles are not copied prose.

## Completion dashboard and release gates

Maintain a machine-readable ledger and report:
- Total registered routes/surfaces/source paths and reconciled additions/removals.
- Total learner-visible content units by type and source (static, seed, DB, generated, user-authored, cached).
- Units dispositioned / total and percentage, with separate pass/corrected/excluded/unresolved counts.
- Severity totals P0/P1/P2/P3; every P0/P1 must be resolved or explicitly blocked with owner and rationale.
- UI surfaces and required state/viewport combinations completed / total.
- Test coverage, type-check, lint, build, accessibility checks, runtime smoke tests and manual verification evidence.
- Remaining risks, exclusions, unknown dynamic sources and confidence by topic/course/concept/surface.

Do not report 100% until the denominator is reconciled, every in-scope unit and required UI state has an evidence-backed disposition, all critical/high findings are resolved, regression checks pass on the exact final commit, and all exceptions are explicitly approved. If an external/generated source cannot be enumerated, mark that scope unverified rather than silently excluding it.

## Execution order

1. Reconcile the 22-surface/149-path PR #69 registry with current main and discover missing routes, sources and dynamic loaders.
2. Build an exact unit inventory across all topics, courses and concepts; deduplicate only with explicit canonical IDs and references.
3. Audit each unit in source order, recording findings before edits; fix by severity and add regression coverage.
4. Trace runtime content from API/DB/seed/generation/cache to rendered UI and audit each variant.
5. Audit all surfaces, interactions, responsive states and accessibility requirements; capture reproducible evidence.
6. Run focused tests after each batch, then full CI/build and final-head validation.
7. Reconcile the final ledger and confidence report; keep this PR draft until every gate is met.

## Constraints

Preserve existing routes, stable topic/lesson IDs, progress, quiz history, persisted keys, API/schema contracts and working behavior. No deployment, paid service, hosting change, or external spend. Keep changes in this PR and do not merge until the user reviews the completed evidence and final CI.
