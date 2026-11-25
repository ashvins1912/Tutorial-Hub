# Full Learner Content Review — Consolidated PR Scope

**PR:** This document belongs to the single consolidated full-review PR created after PR #68 was merged.  
**Intent:** One review and one merge for the requested content, code-example and UI improvements.  
**No deployment or external spend is authorized.**

## Existing baseline

PR #68 is already merged. It corrected selected hash-map, two-pointer, sliding-window, cycle-detection, activity-selection, Bloom-filter, cache, queue, Raft and Kafka statements, and added a review plan/evidence ledger. It did not complete the whole-app review.

## Repository inventory at review start

The current learning-surface registry maps 22 learner surfaces to 149 unique source paths:
- 72 component paths
- 62 canonical data paths
- 15 API-route paths

The repository snapshot contains 525 tracked blobs. These are inventory figures, not counts of rendered sentences or proof that every UI state is covered.

## Work included in this PR

1. `docs/LEARNER_CONTENT_TECHNICAL_WRITING_STANDARD.md`: detailed writing and technical-review standard grounded in the requested books/educators, with original content only.
2. `scripts/audit-learner-content-sentence-inventory.mjs`: extracts static literal/JSX text candidates from registered source paths, records file/line/property and marks every candidate unreviewed by default.
3. `tests/content-authoring/learner-content-inventory.test.mjs`: verifies broad source coverage, source-path integrity and that extraction does not silently mark content reviewed.
4. `package.json`: exposes `npm run audit:learner-sentences`.
5. `src/components/CompleteDsaCourse.tsx`: improves code-example reading with line numbers, stronger type/readability, a clear explanation label and a guided trace prompt.
6. `src/features/intelligent-engine/components/PublishedLessonView.tsx`: improves key-point and reasoning hierarchy and gives published code examples a readable, line-numbered walkthrough.
7. The existing content-quality audit statuses are not promoted to complete without review evidence.

## Why the sentence inventory is advisory

Static source extraction includes string literals that may be internal, code-related, or not rendered. It can miss database-published, user-authored, runtime-generated and remote content. Sentence splitting is heuristic. Therefore:
- Each extracted unit begins as `unreviewed`.
- A human reviewer must merge/split candidates, inspect surrounding context and record a disposition.
- Runtime and seeded/published content must be traced to its canonical source and separately checked.
- No static scan, count, or keyword match is a technical correctness verdict.

## Required full-review gates

- Every registered surface and conditional UI state is mapped to its canonical and runtime source.
- Every learner-facing sentence, label, quiz item, hint, answer explanation, code annotation and visualizer caption has a disposition.
- Definitions use plain words and define terms at first use.
- Each algorithm topic explains recognition, assumptions, method, worked trace, correctness, complexity, edge cases and when not to use it where applicable.
- Code, trace, diagram, output and prose agree.
- System design explanations include requirements, estimates, component responsibilities, data flow, trade-offs, failures and consistency assumptions.
- Accessibility, responsive UI and empty/loading/error states are checked.
- Typecheck, lint, content audits, tests and build pass; any unavailable check is clearly reported.
- Exact coverage counts and unresolved items are published in the evidence ledger.

## Current status

The source inventory, writing standard and two code-reading UI improvements are implemented in this branch. This is not yet a claim that all 149 mapped files or all runtime content have been manually reviewed line by line. The inventory command and CI must run, the remaining content must be reviewed and corrected, and the PR must stay open until evidence meets the gates above.
