# Source-verified DSA authoring batches

The 293-question inventory is authored in bounded batches. A catalog record remains `in-progress` until all required evidence is present and the language solutions pass executable checks.

## Promotion gate

A batch record may be promoted to `validated` only when all of these are true:

1. The statement, official examples, numeric constraints, and follow-up requirements are checked against the linked primary problem source.
2. Java, JavaScript, and Python submissions are problem-specific implementations, not generic checklists.
3. Executable regression tests cover the official examples, boundary cases, and pattern-specific edge cases.
4. CI compiles/runs each language submission against the same test vectors.
5. The visualization includes a problem-specific diagram, animation sequence, and hand-worked trace.
6. The correctness proof and time/space analysis match the submitted algorithm.
7. The catalog API rejects promotion if any evidence category is missing.

The canonical batch data records source URLs and individual quality flags. The startup importer refuses to mark a batch validated while its metadata is still `quality-check-pending`.

## Batch 01 — Arrays

Five source-verified problems are authored in `server/seed/verifiedProblemBatches/arraysBatch01.ts`:

| Problem | LeetCode | Core pattern |
|---|---:|---|
| Two Sum | 1 | Complement lookup with a prefix hash map |
| Best Time to Buy and Sell Stock | 121 | Running minimum / greedy scan |
| Contains Duplicate | 217 | Set membership |
| Maximum Subarray (Kadane's Algorithm) | 53 | Dynamic programming recurrence |
| Product of Array Except Self | 238 | Exclusive prefix and suffix products |

The test runner `tests/dsa/arrays-batch-01.test.mjs` executes the exact stored submissions in Java, JavaScript, and Python. Run it with:

```bash
npm run test:dsa:arrays:01
```

The CI job provisions Node.js, Python, and Java and runs the batch test suite before the production build. The next batch should continue with the remaining Arrays problems, then proceed topic-wise. No records in later batches should be promoted based solely on generated topic templates.


## Arrays lesson enhancement — offline range updates

The Arrays reference lesson now includes matching Java 21 and Python 3 difference-array implementations for offline inclusive range additions. The examples validate update bounds, use an `n + 1` sentinel for an update ending at the last index, and materialize results with one prefix scan. Regression fixtures cover overlapping updates and the final-index boundary. This extends the lesson's existing prefix-sum and compaction examples; it does not promote the full Arrays topic or the 293-question inventory to verified status.


### Difference-array initial-state correction

A follow-up regression review caught that initializing `diff[i]` with `values[i]` only works for a zero-based initial array. The implementation now derives the initial difference representation (`diff[0] = values[0]`; `diff[i] = values[i] - values[i-1]`) before applying update boundary deltas. Java uses a widened subtraction to avoid 32-bit overflow when adjacent input values are far apart. Executable tests cover overlapping updates, final-index sentinel handling, no updates, and empty input. The earlier CI failure was caused by this initial-state defect; the corrected change is being revalidated.


### JavaScript difference-array parity

The Arrays reference lesson now also includes a Node.js implementation of offline inclusive range additions. It preserves the initial array through the difference representation, uses the `n + 1` sentinel, and rejects malformed ranges and unsafe JavaScript integer intermediates rather than silently returning imprecise Number results. CI executes the stored Java 21, JavaScript (Node.js), and Python 3 examples against overlapping updates, final-index updates, no updates, empty input, and invalid/unsafe cases. This remains a lesson-level implementation improvement, not a claim that the complete Arrays topic or all 293 interview records are source-verified.
