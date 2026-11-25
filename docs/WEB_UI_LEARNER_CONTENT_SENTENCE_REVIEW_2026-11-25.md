# Web UI Learner-Facing Content Review — 2026-11-25

## Purpose and review basis

This is an evidence-based content review of canonical strings currently rendered in the web UI. It applies original instructional principles drawn at a high level from the requested algorithm and system-design references: precise definitions, stated assumptions, proof-aware reasoning, worked traces, realistic use cases, complexity caveats, and trade-offs. It does not copy or imitate any author's wording, examples, code, or distinctive presentation.

## Reviewed sources and edits in this PR

| Source | UI content reviewed | Correction |
|---|---|---|
| `src/features/topics/data/topicsFoundations.ts` | Arrays & Hashing tagline | Replaced unconditional O(1) hash lookup wording with expected O(1), expected O(N) pattern wording and explicit O(N) auxiliary-space trade-off. |
| `src/data/sharedTopicAcademy.ts` | Two Pointers `optimal` explanation | Replaced the ambiguous “candidate worse” heuristic with an invariant/proof requirement for safely discarding candidates. |
| `src/data/systemDesignData.ts` | Redis cache, Bloom filter, Kafka component roles and URL-shortener animation note | Qualified cache benefit by hit rate; explained Bloom filter memory scaling and false positives; made durability/retry conditional on configuration; removed guaranteed 0.2 ms and “blocks fake spam keys” wording. |

## Sentence-level findings

### 1. Hashing complexity

**Problem:** “O(1) hash-table complement and frequency lookups” can be read as a worst-case guarantee. Hash-table operations are expected/amortized constant time under typical assumptions, while pathological collisions or implementation details can increase cost.

**Replacement intent:** state expected O(1) lookup, expected O(N) for the common one-pass pattern, and O(N) auxiliary memory. This is more precise without overwhelming the introductory UI.

**Learner impact:** prevents students from treating complexity claims as unconditional and makes the time/space trade-off explicit.

### 2. Two-pointer movement

**Problem:** “Move the pointer whose current value makes the candidate worse” does not define “worse” or establish why a pointer movement is safe. The rule is not universally valid across all two-pointer problems.

**Replacement intent:** require a problem-specific invariant or elimination proof showing that discarded candidates cannot contain a valid or better answer. The explanation also distinguishes read/write compaction, where the write pointer advances only when an item is retained.

**Learner impact:** teaches the decision proof rather than a memorized heuristic.

### 3. Bloom filter space and correctness

**Problem:** “O(1)-space” is misleading when describing a Bloom filter as a data structure storing membership information for a growing set. Its bit-array size depends on the number of represented elements and the target false-positive rate. A positive membership result means “possibly present,” not “definitely present.”

**Replacement intent:** describe a space-efficient probabilistic membership filter, note scaling with represented keys and false-positive rate, and require cache/database confirmation for a positive result.

**Learner impact:** avoids a false mental model and explains why Bloom filters are a pre-check, not an authoritative source of truth.

### 4. Cache and message queue guarantees

**Problem:** “eliminating DB read pressure” overstates cache benefits; misses still need backing storage and the reduction depends on hit rate. “Async retries” can imply a queue guarantees retry/durability independent of configuration.

**Replacement intent:** explain the conditional cache benefit and note that queue durability/retry behavior depends on topic, acknowledgement, retention and consumer configuration.

**Learner impact:** links architecture benefits to workload and operational settings rather than treating components as automatic performance guarantees.

### 5. Animation timing claim

**Problem:** The URL-shortener animation previously asserted a Bloom-filter decision in 0.2 ms and claimed it “blocks fake spam keys.” This is not a universal latency guarantee and a Bloom filter can return false positives.

**Replacement intent:** state that the filter reports a key may exist, that positive results can be false positives, that backing storage confirms the key, and that the shown timing is illustrative.

**Learner impact:** aligns the animation narrative with the actual probabilistic behavior.

## Review quality gates for the remaining web UI

For every learner-visible sentence or label, continue with the following checks:

1. **Definition:** identify the concept's essential properties and distinguish it from adjacent concepts.
2. **Truth conditions:** state assumptions, input constraints, edge cases and what would make the claim false.
3. **Use case:** explain when it is appropriate and why the problem's structure supports it.
4. **Counterexample/limitation:** include at least one important failure mode or non-use case when it prevents a common misconception.
5. **Complexity:** distinguish worst-case, average/expected and amortized claims; include auxiliary space and the relevant variables.
6. **Trace:** ensure the displayed example's states, indices, queue/stack contents and final answer agree with the code.
7. **Code alignment:** check that explanation, language templates, annotations and the implementation express the same algorithm.
8. **System design:** label illustrative workload numbers; distinguish a component's possible benefit from a guarantee; include failure modes and trade-offs.
9. **UI consistency:** check canonical data, copied/seeded data, published lessons, quizzes, hints, answer explanations and animations for stale duplicates.
10. **Editorial quality:** remove ambiguous pronouns, unexplained jargon, absolute claims, unsupported superlatives and sentences that combine several unrelated ideas.

## Scope and status

This PR makes targeted corrections in three canonical web-UI content files and records the findings above. It is **not** a claim that every learner-facing sentence across the entire application has been audited. The repository contains many additional lesson, quiz, animation, generated and published-content surfaces; they require a source-by-source, sentence-level evidence ledger before being marked reviewed.

## Compatibility and validation

- Content-only edits; no routes, component behavior, canonical IDs, learner progress, quiz history, API contracts or database schema changes intended.
- No deployment, hosting changes or external costs.
- Validate with the repository's normal typecheck, lint, content-quality audit, tests and production build. Review animation output manually to confirm the revised text remains accurate in context.


## Additional semantic corrections from the expanded source review

The review was extended beyond the initial three files to algorithm catalogs, tutor guides and system-design roadmap content. The following source-level claims were corrected:

| Source | Finding | Correction |
|---|---|---|
| `src/data/algorithmsCatalog.ts` | Sliding-window complexity was stated as a guaranteed bound without explaining the amortized pointer argument. | Added the at-most-once entry/exit reasoning for O(N) total pointer movement. |
| `src/data/algorithmsCatalog.ts` | Floyd cycle collision bound used an undefined `C` and omitted cycle-entry distance. | Replaced with the finite-cycle eventual-meeting statement and noted the bound depends on cycle length and entry distance. |
| `src/data/algorithmsCatalog.ts` | Activity selection presented earliest-finish as universally applicable. | Explicitly scoped it to unweighted maximum-cardinality interval selection and distinguished weighted interval scheduling. |
| `src/data/algorithmTutorGuides.ts` | Fast/slow pointer analogy described an inaccurate straight-road halfway behavior. | Replaced with a circular-track explanation and clarified that the proof depends on step sizes and cycle structure. |
| `src/data/algorithmTutorGuides.ts` | Randomized 3-way QuickSort was described as O(1) extra space “in practice.” | Clarified expected time assumptions, recursion-stack space and worst-case O(N²) time. |
| `src/data/algorithmsMasterAdvancedPack.ts` | Bloom filter false-negative statement lacked its no-deletions/standard-filter assumptions; disk-read reduction was a fixed unsupported percentage. | Qualified correctness and replaced the fixed percentage with workload/filter-dependent behavior. |
| `src/data/systemDesignMasterRoadmapData.ts` | Cache warmness, dead-letter isolation, and Raft leader safety were stated as unconditional guarantees. | Added success/configuration/failure conditions and protocol assumptions. |
| `src/data/systemDesignData.ts` | Kafka ordering was stated globally. | Clarified ordering is within a partition and depends on partition-key design. |

## Verification note

These corrections were verified by re-fetching the changed source files on the review branch and checking the replacement text. Repository tests/build could not be run from this environment because a direct Git clone failed due to unavailable network name resolution; no CI run has been observed for the latest branch head. The changes therefore remain subject to CI and code-owner review.
