# Focused DP and matrix learning-surface audit

## Inventory snapshot

- Registered learning surfaces: 22.
- Reconciled content source paths: 154; registered test paths: 24; all unique registered paths: 178.
- DSA course: 23 stable modules; 195 concepts; 138 glossary entries; 42 course code examples.
- Dynamic Programming lab: 8 guided lessons and 20 practice problems. The 20 practice items now include a statement, example and hint each. The eight guided lesson records are extracted into a testable data module.
- Matrix problem bank: 42 stable problem IDs, eight pattern groups and three difficulty levels.
- Path-level completion is intentionally 0/177 at this stage. Registry reconciliation is not a review disposition.

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

- CI run #812 passed the full listed suite and frontend build on tested commit `3ab3d99f1b916e291ca5976023b80efa45a6769c` before the later DP/matrix additions.
- The Latest registry, ledger, DP lesson extraction/search, matrix sample correction and UI/test changes are newer than #812 and require completed final-head CI.
- The focused audit ledger currently records 16 content/UI units awaiting CI: 6 corrections, 3 additions, 2 content corrections and 2 UI corrections.
- The 178 registered paths and every unit inside them remain unreviewed except for the explicitly listed focused units. The full platform audit is not complete.

## Confidence statement

High confidence in the current structural denominators and the exact tests that pass on their tested commits. Moderate confidence in the specific corrected examples after their targeted tests complete. No defensible 100% semantic, pedagogical or UI confidence claim for the whole platform until all registered and discovered dynamic sources, units, states, viewports and accessibility checks are dispositioned with evidence.


### Matrix problem examples

Each of the 42 matrix problems now includes a concrete example input and expected output. The expanded problem panel shows the prompt, example, expected result, approach, complexity and Java hint. The matrix quality test requires both example fields for every stable ID and checks representative outputs (including kth-smallest, target-sum submatrices, eight-direction path length and Game of Life).


### Follow-up content/UI pass (25 November 2026)

- Corrected the Pacific–Atlantic Water Flow matrix sample: the expected coordinates now include `(1,1)`, which is reachable from both oceans. Added a regression assertion for that coordinate.
- Clarified House Robber's DP state as a prefix length, aligned its recurrence/base with the rolling implementation, and documented the choose-none behavior for empty/all-negative inputs.
- DP practice now searches problem names, goals, statements, examples, hints and levels, and announces an empty result. The Java code heading explicitly says these are method snippets requiring imports/class context.
- Extracted the eight DP guided lessons into `src/data/dpGuidedLessons.ts` for direct content tests. A malformed intermediate extraction was caught by CI and repaired; the current extraction and cleanup are newer than the latest completed validation and must be checked on final head.
- The ledger now records 16 focused units: 6 targeted corrections, 3 content additions, 4 content corrections and 3 UI corrections, all pending exact-head CI. This is still a focused set; path-level completion remains 0/178.


## DSA roadmap focused pass

The 55-topic roadmap was inspected. 54 topics had no authored pitfalls and all topics used a generic practice fallback; the UI also omitted the outcome and practice fields. The roadmap helper now generates contextual scaffold prompts from each topic's title, first subtopic, recognition signal and outcome; the UI renders learning outcomes and guided practice, searches those fields, filters/deduplicates persisted progress and exposes mastery state.

These prompts are explicitly labeled as scaffolds, not topic-specific fully worked problem sets. The new roadmap quality test checks the 55-topic inventory, stable IDs, prerequisite references, required outcomes/pitfalls/practice and UI state/search assertions. Whole-roadmap semantic review remains open.
