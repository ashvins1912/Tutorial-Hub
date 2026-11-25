# Focused DP and matrix learning-surface audit

## Inventory snapshot

- Registered learning surfaces: 22.
- Reconciled content source paths: 154; registered test paths: 26; all unique registered paths: 180.
- DSA course: 23 stable modules; 195 concepts; 138 glossary entries; 42 course code examples.
- Dynamic Programming lab: 8 guided lessons and 20 practice problems. The 20 practice items now include a statement, example and hint each. The eight guided lesson records are extracted into a testable data module.
- Matrix problem bank: 42 stable problem IDs, eight pattern groups and three difficulty levels.
- Path-level completion is intentionally 0/180; inventory registration is not review disposition. Registry reconciliation is not a review disposition.

## Corrections and additions in this pass

### DP guided examples
- Climbing-stairs examples now reject negative/out-of-range n, use checked `long` arithmetic and state the 0..91 range for this recurrence.
- Memoization validates the cache size and initialization contract.
- Tabulation uses checked long arithmetic and explicit base cases.
- House Robber uses checked long accumulation and documents that choosing no house is allowed.
- Unique Paths validates positive dimensions and detects long overflow rather than silently wrapping.
- 0/1 knapsack uses long values, validates capacity/array shape and rejects negative weights; complexity remains pseudo-polynomial in W.
- LCS compares Unicode code points rather than UTF-16 char units; grapheme clusters remain a separate text-segmentation concern.
- Split-based interval DP uses k in [l,r−1] and labels its O(n³)/O(n²) bound as specific to that recurrence family.

The new Java harness compiles all eight lesson snippets and executes selected recurrence, boundary, overflow and Unicode cases. A compile/run gate is evidence for those snippets and cases, not every DP algorithm variant.

### DP practice and UI
- Replaced name/goal-only roadmap entries with 20 problem briefs including statement, example and hint.
- Progress is deduplicated and limited to known problem names; totals are data-driven.
- Practice details are expandable with accessible state and stable panel IDs.
- Lesson navigation uses numbered 44px targets and exposes current/pressed state; hints and code blocks expose state/focus semantics.

### Matrix problem bank
- Reviewed the 42 problem records and tightened numeric assumptions for flattened search, kth/median value search, 2D difference updates, path costs, histogram area and submatrix prefix sums.
- Matrix search now trims queries and searches IDs, prompts, approaches, complexity and Java hints.
- Completion count ignores stale/duplicate persisted IDs; problem totals derive from the catalog.
- Pattern/difficulty filters have accessible labels; solved and expanded states are announced and details panels remain addressable.

## Current verification

- CI #891/#892 passed the DSA/DP/Matrix content and report checks.
- CI #898 passed the 180-path registry/ledger and Pattern Forge mastery-stepper test.
- CI #909 passed the shared mastery evidence normalization fix, client/server use, Supabase Node-test environment fix, type-check, content/security validation, registry/ledger checks and frontend build.
- **CI #931 passed** the current application/test head `3efd0260b6251e77defd68169a8425e2f14900ca`, including DSA28 complexity assumptions, duplicate problem/edge-case evidence, idempotent trace-scoped checkpoint records, >=80% mastery checkpoint gate, client/server canonical checkpoint validation, type-check and frontend build.
- The ledger currently records **29 focused units**: 12 targeted corrections, 4 content additions, 6 content corrections and 7 UI corrections. It also records **1 open P1**: 25 Pattern Forge topics remain inventory-only/unpublished. `verifiedUnits` remains 0 and path-level completion remains 0/180.
- Static registry: 22 surfaces, 154 content paths, 26 test paths, 180 unique paths. Dynamic/DB/generated/user-authored content remains to be reconciled.

## Confidence statement

High confidence in the current structural denominators and the exact tests that pass on their tested commits. Moderate confidence in the specific corrected examples after their targeted tests complete. No defensible 100% semantic, pedagogical or UI confidence claim for the whole platform until all registered and discovered dynamic sources, units, states, viewports and accessibility checks are dispositioned with evidence.


### Matrix problem examples

Each of the 42 matrix problems now includes a concrete example input and expected output. The expanded problem panel shows the prompt, example, expected result, approach, complexity and Java hint. The matrix quality test requires both example fields for every stable ID and checks representative outputs (including kth-smallest, target-sum submatrices, eight-direction path length and Game of Life).


### Follow-up content/UI pass (25 November 2026)

- Corrected the Pacific–Atlantic Water Flow matrix sample: the expected coordinates now include `(1,1)`, which is reachable from both oceans. Added a regression assertion for that coordinate.
- Clarified House Robber's DP state as a prefix length, aligned its recurrence/base with the rolling implementation, and documented the choose-none behavior for empty/all-negative inputs.
- DP practice now searches problem names, goals, statements, examples, hints and levels, and announces an empty result. The Java code heading explicitly says these are method snippets requiring imports/class context.
- Extracted the eight DP guided lessons into `src/data/dpGuidedLessons.ts` for direct content tests. A malformed intermediate extraction was caught by CI and repaired; the repaired extraction and cleanup passed the full validation in #891/#892; #898 also passed after the new Pattern Forge test and registry update.
- The ledger now records 29 focused units: 12 targeted corrections, 4 content additions, 6 content corrections and 7 UI corrections, all awaiting final evidence. One P1 blocker remains: 25 Pattern Forge topics are inventory-only. Path-level completion remains 0/180.


## DSA roadmap focused pass

The 55-topic roadmap was inspected. The helper supplies contextual scaffold prompts from each topic's title, first subtopic, recognition signal and outcome; the sliding-window topic now includes explicit pitfalls about negative values, frequency updates and monotonicity. The UI renders outcomes and practice prompts, searches those fields, filters/deduplicates persisted progress and exposes mastery state. It now explicitly disclaims that prompts are full problem briefs, worked solutions or proofs. CI #891/#892 passed the corresponding content and UI checks.

These prompts are explicitly labeled as scaffolds, not topic-specific fully worked problem sets. The new roadmap quality test checks the 55-topic inventory, stable IDs, prerequisite references, required outcomes/pitfalls/practice and UI state/search assertions. Whole-roadmap semantic review remains open.
