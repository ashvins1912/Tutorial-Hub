# Current Review Confidence & Enhancement Baseline

**PR:** #69  
**Branch:** content/full-learner-content-review  
**Latest report commit:** 812a6ea70be65514de50d94488310130bccf1943  
**Purpose:** Evidence-backed confidence snapshot; not a completion certificate.

## Current confidence snapshot

| Dimension | Current evidence | Confidence/status |
|---|---|---|
| Registered source inventory | 149 unique registered source paths reported | High confidence in registry count; does not prove every runtime origin is registered |
| Static candidate extraction | 72,747 candidates reported by heuristic extractor | High confidence in extractor output; low confidence it equals learner-visible units |
| Targeted technical edits | Selected algorithm and distributed-systems claims corrected and recorded in the evidence ledger | Moderate confidence for listed edits only; not whole-repository coverage |
| Full line-by-line review | No complete reconciled disposition ledger | **0% evidenced complete** |
| Technical accuracy across all content | No full-source evidence ledger | **Unverified** |
| Database/AI/user-authored runtime content | End-to-end provenance-to-render trace not evidenced | **Unverified / blocked** |
| Manual accessibility/responsive checks | No full surface-by-surface results | **Unverified / blocked** |
| CI latest observed run | Validate Tutorial Hub run #701 on commit 812a6ea70be65514de50d94488310130bccf1943 | **In progress**; type-check completed successfully; remaining jobs pending at last check |
| Release gates | Final-head tests/build/manual checks not yet all evidenced | **Pending** |

## 100% completion definition

100% is a completion target, not a subjective confidence estimate. It requires:
1. Every reconciled learner-visible unit has a review disposition and supporting evidence.
2. Every registered source and discovered runtime origin is traced, or specifically blocked with owner, impact and next action.
3. No unresolved critical/high-severity correctness, security or data-loss issue.
4. Current-head typecheck, lint, content audits, security/regression tests and production build pass.
5. All 22 surfaces have recorded responsive, keyboard and accessibility checks appropriate to their controls.
6. Extractor candidates are reconciled with rendered content and conditional states; missed content and false positives are accounted for.
7. Coverage and exclusions are reproducible and independently auditable.

## Confidence improvement and enhancement actions

### Measurement
- Assign stable IDs to reconciled units; record source, line/property, surface and content origin.
- Report reviewed, verified, changed, blocked, excluded-with-reason and remaining separately.
- Require technical evidence for correctness, complexity, guarantees and worked outputs.
- Perform second-pass verification for proofs, complexity, distributed guarantees, security and answer keys.

### Learning content
- Align problem contract, assumptions, invariant/proof, trace, code, expected output, complexity and edge cases.
- Add misconception-specific feedback and counterexamples.
- Separate worst/average/expected/amortized complexity and auxiliary/stack/output space.
- Keep code, visualizer, quiz, explanation and output consistent.
- Label provenance/review state for static, published, AI-generated and user-authored material.

### Runtime and UX
- Trace canonical source → seed/API/database → publish/cache → rendered state and persisted progress.
- Verify validation, sanitization, authorization, versioning and progress compatibility.
- Check keyboard/focus, accessible names, contrast, reduced motion, mobile overflow and loading/empty/error/success states.
- Test invariants and boundary behavior, not only exact prose.

## Status

This report records the evidenced gap and improvements required. It does **not** claim 100% completion. Keep PR #69 draft until all gates pass and the final evidence ledger supports the claim. No deployment, merge, hosting change or external spend is authorized.


## Latest targeted review update (2026-11-25)

### Source-level improvements committed

A focused technical review of `src/data/algorithmTutorGuides.ts` identified and corrected five high-risk teaching overstatements:

1. **N-Queens bitmask performance:** removed an unsupported fixed “~10× faster” promise. The guide now states the exponential upper bound and qualifies O(1) candidate conflict checks by supported integer width and implementation.
2. **Backtracking applicability:** removed the blanket “N > 25 → DP” rule. It now explains DP only applies when a compact state and recurrence exist, and distinguishes branch-and-bound / meet-in-the-middle / problem-specific pruning.
3. **Shortest-path counting:** clarified that the simple Dijkstra ways-count recurrence assumes strictly positive edge weights; zero-weight shortest-path cycles require a defined walk/simple-path counting model and a suitable method.
4. **Two-pointer complexity:** restricted the O(N) claim to suitable sorted pair-search problems with a valid elimination invariant; explicitly excludes input/output space from auxiliary-space claims.
5. **K-Sum complexity:** clarified fixed-K assumptions, recursion stack, sorting cost and output exclusion.
6. **Binary search on answer:** clarified monotonicity, candidate range R, O(N log R) checker cost and preprocessing caveat.

These edits were applied to the actual learner-facing source and verified by re-fetching the updated blob. They improve confidence in these specific claims only; they do not certify all entries in the 1,159-line guide or the broader curriculum.

### Latest commit and validation

- Latest source correction commit: `41807861925c386e47a01a32e3fb0e3ffe0405ba`
- Previous source correction commit: `eda02fb5569d66f33abe90cb90521621403bfecb`
- CI run #703 was reported in progress for the previous source-correction commit.
- No workflow run had yet been returned for the latest commit when this report was refreshed.

### Updated confidence

- **Targeted correctness confidence:** improved for the six corrected claims; still requires CI and independent review.
- **Whole-file confidence:** remains unverified because all 1,159 lines have not been dispositioned.
- **Whole-platform review completion:** still 0% evidenced complete against the strict 100% criteria above. This is a coverage statement, not a claim that the platform content is 0% correct.
- **100% certification:** not yet supported. Keep PR draft and do not merge/deploy until complete coverage and final-head checks are evidenced.


## Latest enhancement and CI update

- Added `tests/content-authoring/algorithm-tutor-guide-quality.test.mjs`.
- The new test validates that every registered tutor guide has a matching ID and non-empty analogy, interview script, choose/avoid guidance and complete follow-up fields.
- Added targeted regression assertions for the newly corrected N-Queens, backtracking, Dijkstra path-counting, two-pointer and binary-search caveats.
- Test file commit: `16af93127b51543d787d339ac7d0b7cd25f0349d`.
- GitHub Actions validation run #706 is **in progress**; dependency installation is in progress and later checks have not yet run.
- Latest PR head at this update: `16af93127b51543d787d339ac7d0b7cd25f0349d`.

### Confidence, stated precisely

- **Targeted claim edits:** 6/6 intended text corrections were applied and verified in the source blob. This is 100% completion of that small targeted correction set, not 100% accuracy of the whole guide.
- **Regression-test coverage:** the new structural and caveat tests are committed; execution is pending CI.
- **Full guide review:** not complete. The 1,159-line tutor-guide file has not been fully dispositioned.
- **Full platform review:** not complete. No 100% platform content confidence claim is justified yet.


## CI status at the latest source head

At the time of this report update, PR head `16af93127b51543d787d339ac7d0b7cd25f0349d` had validation run **#707 in progress**. The combined commit status endpoint had not yet returned individual statuses. Dependency install/typecheck and all downstream curriculum/security/build checks must complete; do not infer success from a run being created or a job starting.


## Additional algorithm-guide corrections (2026-11-25)

A second targeted pass found three more precision gaps and updated the learner-facing source:

1. **Prefix-sum divisibility:** explicitly handles K ≠ 0 using a positive normalized remainder and routes K = 0 to the zero-sum formulation; map-space bound uses |K|.
2. **Sliding window:** the linear-time guarantee now requires a monotone window-validity condition (examples include non-negative sum bounds and at-most-K distinct). It no longer suggests that frequency counts alone make arbitrary window conditions monotone.
3. **Stream of Characters / Aho-Corasick:** distinguishes reversed-Trie O(L) worst-case query scanning from amortized O(1) automaton state-transition work per stream character, and includes preprocessing/output-reporting costs.

Added regression assertions for these assumptions to `tests/content-authoring/algorithm-tutor-guide-quality.test.mjs`.

- Source correction commit: `d77bad5d0be926cdf61433d694de75aff774ba09`
- Regression test commit: `ba835ea10429dc462b0c0507cd40984eeb8ce725`
- Validation run #709 was queued for the source correction when checked. The test commit's run had not yet appeared in the workflow-run lookup.
- These are additional targeted corrections; whole-guide and whole-platform completion remains unverified.


## Test-commit validation update

Validation run **#710** was created for test commit `ba835ea10429dc462b0c0507cd40984eeb8ce725`. At the latest job check, dependency installation was in progress and type-check plus all downstream checks were pending. This run therefore does not yet establish test success. The evidence-report update itself will also require final-head validation.


## Third focused technical pass: arithmetic and selection bounds

A further source review corrected these learner-facing statements:

- **Modular exponentiation:** O(log e) counts modular multiplications, but reducing after multiplication alone does not prevent intermediate overflow. The guide now requires a sufficiently wide/exact modular multiply and explains the JavaScript Number safe-integer issue.
- **Extended GCD choice:** clarified that Fermat inversion is an optional alternative for prime modulus and coprime a; Extended GCD remains valid whenever gcd(a,m)=1.
- **Quickselect duplicates:** made the linear all-equal case explicitly conditional on 3-way partitioning; randomization alone is not a worst-case linear guarantee.

Added regression assertions for modular multiplication and the 3-way partition condition.

- Source correction commit: `1c6987cd9379778d29b8ccddac71a7c94109ff89`
- Test commit: `2c903b4df3b8163ffacab5d0c6ec3fed935dacdf`
- Run #713 is in progress for the test commit. Run #712 remains in progress at type-check; it has not established downstream validation.
- The source and test blobs were re-fetched. The test includes the new assertions; test execution is pending.


## Fourth focused technical pass: graph bounds and edge cases

The next source pass tightened three graph-algorithm claims:

- **Floyd-Warshall:** documented that negative cycles make affected shortest-path distances unbounded/undefined, despite support for negative edges.
- **0-1 BFS:** removed the incorrect assertion that each edge relaxes at most once; a vertex may be re-enqueued after improvement. Retained the O(V + E) bound for the standard relaxation/stale-entry implementation.
- **Bidirectional BFS:** qualified O(b^(d/2)) as a balanced-branching model rather than a universal bound for irregular graphs.

Regression assertions were added and the source/test blobs re-fetched.

- Graph source commits: `ff01fff234b3875f03c8e7b93a7435e89c4cef92`, `65f8a949853108509685a9a7783ebd98b11b492f`
- Test commit: `2e6c7fdf19b0b80a5109c6a473f9cc41b05cdb62`
- Run #714 passed all listed validation steps and frontend build on its tested commit. New graph assertions require validation on the current final head; that run is pending/in progress.


## Fifth focused technical pass: reachability and auxiliary space

Two further correctness/complexity details were corrected:

- **Bellman-Ford:** the extra relaxation pass detects negative cycles reachable from the chosen source; detecting a cycle anywhere requires initializing all distances to zero (or adding a super-source).
- **Segmented Sieve:** auxiliary space now includes both the [L, R] segment and the base-prime list up to square root of R.

Regression assertions were added and source/test blobs were re-fetched.

- Source commit: `02bdc80400b446d386e731c6f1166cf6f6515e48`
- Test commit: `87c4a70b56cc80128c2c2886afc723cde5c50a8b`
- Run #718 was in progress at type-check when last polled. It tested the prior graph-caveat commit; the newest test/evidence commits still require their own completed validation.


## CI follow-up: assertion targeting correction

Run #718 failed in the new high-risk tutor-guide test because the bidirectional-BFS complexity assertion searched the `bidirectional-bfs` guide, while the Word Ladder follow-up is registered under `tree-bfs-dfs`. The assertion was corrected to inspect the owning guide in commit `351c51a8f3ff60d711db4509474c89c8b74cdfab`. This was a test-selection error, not a reported application/type-check/build failure. Run #721 was still at type-check when polled; the assertion-fix commit needs completed CI.


## Sixth focused technical pass: query/update complexity and sentinels

Three additional source assumptions were made explicit:

- **Mo with updates:** complexity now includes input, query, and update movement (`N + Q + U`) instead of describing only Q.
- **Z algorithm:** the concatenation separator must not occur in the pattern or text (or must be an out-of-alphabet sentinel).
- **Manacher:** boundary sentinels must be distinct and absent from the input; correctness also depends on consistent transformed-index handling.

Regression assertions were added. The Manacher source correction is in commit `eaa81011d395ae48e3b7d505800c6364ebe7e443`; the Mo/Z source correction is `c1a48b891af6ffe3312ada7d3f3491b45d659a54`.

Run #721 failed because the test assertion pointed at the wrong guide (fixed in `351c51a`). Run #725 was queued for the assertion fix; the latest source/report commit requires a completed final-head run.


A further correction in this pass addressed **Quickselect**: the expected O(N) bound is no longer described as a guaranteed half-size geometric series, and the guide distinguishes iterative O(1) auxiliary space from recursive stack space. Regression assertions cover both points (source commit `1016c34036240702c2654b5112f6c1660b14244c`, test commit `ff00b6e716cd0f7b0f6c4c5e4ab545108fda46dc`). Run #727 was in progress at type-check; the newest Quickselect test/evidence commit requires a completed current-head run.


The same pass also corrected **Prim/Kruskal dense-graph comparisons**: Prim’s heap bound now distinguishes indexed/decrease-key from lazy duplicate heaps, and the dense complete-graph comparison explicitly includes Kruskal’s materialized edge-storage cost. Regression assertions were added (source commit `bc3c1f8a1506c182eb37121f0922d45f2da35e5a`, test commit `0531266f562ca7d29226b2585c8a72339723ca1c`). These latest changes require their own completed validation.


## Seventh focused technical pass: source-level graph explanations

Two explanatory claims were aligned with the actual algorithm assumptions:

- **Bellman-Ford analogy:** now scopes settled distances and the V-th-pass negative-cycle signal to source-reachable vertices.
- **Bidirectional BFS script:** now qualifies the O(b^(d/2)) estimate as a balanced-branching/near-middle model and states that it is not universal on irregular graphs.

Regression assertions were added and source/test blobs were re-fetched. Source commit `4659b8389011fece3a25cb687fe71eafacceea97`; test commit `52d6e49a33b5d967c2f22050a2411be51643b1b4`. Run #733 was in progress at type-check for an earlier head; these latest edits still require completed validation.


## Eighth focused technical pass: delimiter and interval boundary assumptions

Two additional edge cases were corrected:

- **KMP / shortest palindrome:** the concatenation delimiter must be absent from the input string (or be an out-of-alphabet sentinel).
- **Sweep line:** empty half-open intervals `[t, t)` are excluded so the end event cannot decrement before the start event.

Regression assertions were added and source/test blobs were re-fetched. Source commit `6f58a11916470ddd647329bb83357f84256ab029`; test commit `8e68ff58d51b10720b7458167b8d79732fba1d33`. Run #736 was at type-check for an earlier head; the latest delimiter/interval test and report commits still need final-head validation.


## Ninth focused technical pass: probabilistic hashing, empirical gains, and arithmetic bounds

The latest source pass removed or qualified six misleading claims:

- **KMP / Rabin-Karp:** separated KMP's deterministic O(N + M) worst-case guarantee from Rabin-Karp's rolling-hash behavior; collisions require verification and can affect runtime.
- **Mo ordering:** removed a fixed 35–45% pointer-step improvement claim; Hilbert/snake order can help in practice but gains depend on query distribution.
- **LCM:** divide-before-multiply reduces overflow risk but does not guarantee the final LCM fits; wide/exact arithmetic and result-range checks remain necessary.
- **Binary exponentiation analogy:** removed the incorrect “10 steps” count for exponent 1000; operation count is logarithmic and includes squarings plus conditional result multiplies.

Regression assertions cover these caveats. Source commit: `1d002ffe498f026970761d912a3aa755ca738cbf`; test commit: `6d1d1f8ab46f526c1e7865c771785713d8fbfbeb`.

## Exact algorithm-guide inventory gate

The tutor-guide module currently registers **53 guide IDs**. The quality test now stores the exact 53-ID inventory and requires exact key equality, matching `algorithmId`, complete non-empty teaching-contract fields, and at least one non-empty follow-up per guide. This prevents silent omission or accidental registration drift. Test commit: `b10001e767b54fb882c52f8d0a52884538b1075e`.

Validation evidence:
- Run #739 passed the full listed validation suite and frontend build on the prior head.
- Run #741 was queued for the focused source/test correction before the exact inventory lock.
- The inventory-lock test and report commit require their own final-head run; no pass is claimed until it completes.
- Source and test blobs were re-fetched after the edits (source `f196b7040c88e24f031ebf0c58009eb52a36a9c4`; test `267a7f00e339d443647d8ec89a80143da8d3fa30`).

This improves coverage of the 53 tutor-guide records, but does **not** certify all 149 registered source paths or every runtime/UI state in the full platform.
