# DSA course structural inventory (PR #70)

**Source:** `src/data/dsaCompleteLessons.ts`  
**Source blob:** `5702758284bd5f2a32468b53b439947cb0dca8b9` (main snapshot used for inventory)  
**Status:** structural inventory only; not a semantic/content verification.

A complete structural pass identified 23 stable lesson IDs and counted entries in their teaching arrays. This reconciles the DSA course denominator before topic-by-topic review.

| Teaching unit | Entries |
|---|---:|
| Plain-language key terms | 46 |
| Concepts | 195 |
| Worked-example steps | 111 |
| Implementation steps | 172 |
| Code examples | 42 |
| Trace exercises | 83 |
| Assessment items | 142 |
| Practice items | 115 |
| Pitfall/misconception entries | 138 |
| Revision prompts | 120 |
| Learning outcomes | 129 |
| Prerequisite entries | 82 |

The new `dsa-course-structure-inventory.test.mjs` locks the 23-module registry, stable unique IDs, required nonempty teaching fields, code-example metadata, and the above totals. It is included in the existing content-authoring test command.

## Important limitations

- Counts are array entries/steps, not distinct learner-visible sentences or proof of correctness.
- Some entries may contain multiple claims or substeps; they must be split into auditable units during review.
- This report does not certify the 195 concepts, 42 code examples, 83 traces or 142 assessments as correct or pedagogically complete.
- Per-module technical review, executable code verification, answer/key validation, trace-to-code consistency, learner UI state/accessibility review and runtime content tracing remain outstanding.
- The exact source snapshot should be re-inventoried on the current PR head; update this report if the source changes.

## Required next pass

For each of the 23 lesson IDs, review every concept, worked example, implementation step, code example, trace, assessment, pitfall and revision prompt. Record item-level pass/corrected/blocked dispositions with evidence. No module may be marked complete from this structural test alone.


## First semantic code-example pass: concrete corrections

The first focused review of the DSA course examples found and corrected three issues:

1. **Sliding-window maximum (JavaScript):** a head cursor avoided `Array.shift()` but retained expired indices, so the code's auxiliary storage grew to O(n) despite the intended O(k). Added periodic stale-prefix compaction; total compaction work is amortized O(n), retained index storage O(k), output storage O(n).
2. **Two Sum (Java):** `target - value` in `int` could overflow and create a false complement match. Both map-based and set-based examples now widen subtraction to `long`, range-check before narrowing, and then look up the prior value.
3. **Tree diameter (Java):** a static accumulator could leak a previous tree's diameter into a later independent call. Replaced it with a per-invocation accumulator and a returned diameter result.

The JavaScript sliding-window code is exercised against brute force for duplicate, increasing, decreasing, negative, singleton and invalid-window cases. The Java snippets are compiled and executed in CI for valid Two Sum, overflow false-positive cases, a multi-edge tree, a singleton tree and an empty tree. Source blob after these edits: `da054573218eba496695a9247fad785f6c347f19`.

A CI run on an earlier intermediate head failed because the initial hand-parsed code-example count was 45; the runtime-exported course count is 42. The report and test expectation were corrected to 42. The current-head run is required to confirm all structural totals and the new executable examples.
