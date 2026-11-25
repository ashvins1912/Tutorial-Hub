# Learner Content and UI Review Standard

**Purpose:** Make every learner-facing explanation technically correct, easy to understand, complete enough to learn from, and aligned with its code, trace, quiz and visualizer. This standard guides the full sentence-by-sentence review; it is not a claim that every repository sentence has already passed review.

## Teaching references and how they inform the review

Use the following works as sources of teaching principles and technical cross-checks. Write original explanations, examples, diagrams and code. Do not copy passages, distinctive examples, chapter structure or imitate an author's voice.

| Reference | Review lens |
|---|---|
| Aditya Bhargava, *Grokking Algorithms* | Start with an accessible mental model; introduce diagrams and examples before dense notation; make the idea approachable without removing important assumptions. |
| Jay Wengrow, *A Common-Sense Guide to Data Structures and Algorithms* | Explain what the operation does, how the structure supports it, and the practical trade-off in time and memory. |
| Narasimha Karumanchi, *Data Structures and Algorithms Made Easy* | Check breadth, worked problem-solving steps, edge cases and implementation detail; avoid unexplained jumps from definition to final code. |
| Brian Christian & Tom Griffiths, *Algorithms to Live By* | When discussing real-world or decision-making use, distinguish the algorithmic model from the messy real-world situation and state what the model leaves out. |
| Thomas H. Cormen, *Algorithms Unlocked* | Make the problem, algorithm, correctness reasoning and growth-rate analysis explicit; avoid treating a complexity label as a proof. |
| Alex Xu, *System Design Interview*, Vol. 1 | Explain requirements, scale assumptions, component responsibilities, data flow, bottlenecks, alternatives and trade-offs. |
| Roberto Vitillo, distributed-systems material | Describe network, process and failure assumptions; distinguish normal operation from partial failure, retries and recovery. |
| Martin Kleppmann, *Designing Data-Intensive Applications* | Review consistency, replication, partitioning, transactions, durability, stream processing and failure semantics precisely; avoid unconditional distributed-system guarantees. |
| Gaurav Sen, educational system-design material | Use a clear interview-style progression from requirements and estimates to architecture, bottlenecks and alternatives; explain rather than merely name components. |

## Sentence-level review rubric

For every learner-visible sentence, heading, label, tooltip, hint, quiz prompt, answer, explanation, code annotation, animation caption, error/empty state and accessibility label, record:

1. **Location:** route/surface, component, canonical data path, stable key/ID, line or content index.
2. **Purpose:** definition, intuition, prerequisite, recognition clue, method, example, code explanation, correctness, complexity, pitfall, application, assessment or UI instruction.
3. **Plain-language clarity:** common words first; define unavoidable terms at first use; avoid unexplained acronyms and overloaded words.
4. **Technical accuracy:** verify the claim, units, boundary conditions, assumptions, input domain, and whether it is exact, expected, amortized or worst-case.
5. **Completeness:** does this sentence leave out a condition that changes the answer? Does it introduce a term the next sentence relies on?
6. **Code/visual alignment:** names, variables, state, output, trace, diagram and code must describe the same example and execution.
7. **Learner action:** what should the learner understand, predict, implement, compare or explain after reading it?
8. **Disposition:** keep, clarify, rewrite, move, split, merge, remove, add example, add caveat, or flag for subject-matter review.
9. **Severity and evidence:** P0 correctness/safety, P1 learning-blocking, P2 clarity/depth, P3 polish; cite a test, trace, source or reviewer rationale.

Do not use a sentence count or keyword scan as proof of review. A line may contain several claims; a short sentence can be misleading; a valid technical use of “always” may be necessary when backed by an invariant.

## Required explanation pattern for each topic/concept

Use progressive disclosure. Not every topic needs every subsection, but omissions must be intentional and justified.

1. **In one sentence:** what it is, using plain words.
2. **Why it matters:** what problem it solves and what the direct approach costs.
3. **Prerequisites and vocabulary:** define terms and notation before use.
4. **Mental model:** a simple analogy, clearly labelled as an analogy and not a proof.
5. **Mechanics:** what state is stored, what each operation changes, and what remains true.
6. **Recognition:** problem signals, constraints and assumptions that make the technique suitable.
7. **When not to use it:** counterexamples, unsupported input shapes, or a simpler alternative.
8. **Worked example:** small input, expected output, intermediate states and explanation of each decision.
9. **Code deep dive:** language/version, important lines or blocks, variable meaning, mutation, return value, and why each update is safe.
10. **Correctness:** invariant, induction, exchange argument, recurrence or other appropriate reasoning; explain the proof in accessible steps.
11. **Complexity:** define n and other parameters; derive the bound; state worst/expected/amortized case and auxiliary/output/stack space separately.
12. **Edge cases and debugging:** empty/singleton input, duplicates, boundaries, overflow, malformed input, cycles, concurrency or failure cases as relevant.
13. **Applications and trade-offs:** practical use, constraints, memory/latency/cost/consistency trade-offs.
14. **Practice and feedback:** one guided trace, one independent exercise, a transfer variation, and feedback explaining why each answer is right or wrong.

## Algorithm-specific accuracy checks

- **Arrays/hash maps:** distinguish array indexing from hash lookup; hash-table bounds are generally expected/amortized under assumptions, not universal worst-case O(1). Explain collisions, key equality, memory and ordering when relevant.
- **Two pointers/sliding windows:** state sortedness or monotonicity assumptions; explain the invariant and why a pointer movement safely discards candidates. For windows, show why each pointer moves a bounded number of times.
- **Binary search:** specify the search interval convention, loop invariant, termination condition, duplicate behavior and sorted/monotone precondition.
- **Sorting:** state stability, in-place behavior, auxiliary/stack space, worst/expected time and assumptions about pivot or input distribution.
- **Graphs:** define directed/undirected and weighted/unweighted; distinguish visited/discovered/processed; state when BFS, DFS, topological ordering or Dijkstra is valid.
- **Dynamic programming:** define state, transition, base cases, evaluation order and answer location; explain why the state captures all information needed.
- **Greedy:** state the objective and constraints; provide the exchange/stays-ahead proof or a counterexample to unsupported generalization.
- **Probabilistic structures:** explain false positives/negatives, sizing, update/delete behavior and authoritative verification.
- **Concurrency/distributed systems:** name failure model, ordering scope, quorum/consistency assumptions, retries, idempotency, timeouts, partial failure and recovery. Avoid guarantees without their protocol/configuration conditions.

## System-design explanation pattern

For each architecture or component, explain:
- Functional and non-functional requirements, exclusions and workload assumptions.
- Back-of-the-envelope estimates with units and clearly labelled illustrative values.
- Component responsibility and request/data flow.
- Data model, partition key, indexes, retention and ownership.
- Read/write path and sequence of state transitions.
- Bottlenecks, hot keys, backpressure and capacity limits.
- Failure modes, retry policy, duplicate delivery, idempotency, consistency and recovery.
- Alternatives and why one is selected for this workload.
- Security, privacy, observability and operational cost.
- What changes if scale, latency, durability or consistency requirements change.

A diagram must match the described flow. Every animation step must match the actual order and outcome; illustrative latency values must never be presented as guaranteed production measurements.

## UI and accessibility requirements

- Keep a clear hierarchy: topic → concept → explanation → example → practice.
- Use short paragraphs, meaningful headings, readable code font and sufficient contrast.
- Keep definitions near first use; provide a glossary or inline explanation for terms.
- Use progressive disclosure for long deep dives; keep the learner's place and existing progress.
- Code should be copyable, line-numbered where helpful, and accompanied by a language label and explanation.
- Avoid relying on color alone; controls need labels, keyboard focus, semantic buttons and accessible state.
- Explain empty, loading, error, success and disabled states in plain language.
- Keep quiz feedback actionable: explain the misconception and how to reason toward the answer.
- Mobile layouts must not clip code or force page-wide horizontal scrolling.
- Do not change stable IDs, progress keys, quiz history or content schema without a migration and compatibility plan.

## Review workflow and completion evidence

1. Trace navigation and routes to all registered components, canonical data, server seeds, APIs, published lessons and generated content.
2. Extract text into stable source/key/sentence records; include conditional and responsive UI states.
3. Review each record; track exact disposition and rationale. No blank status counts as reviewed.
4. Correct canonical source first; trace and reconcile seeded, cached, published and duplicate copies.
5. Validate code and complexity claims with examples, tests or independent derivation.
6. Run typecheck, lint, content audits, tests and production build; manually inspect UI states and responsive behavior.
7. Report total extracted units, reviewed units, changed units, unresolved findings, exclusions and test results.
8. Only mark a surface complete when every in-scope text unit has a disposition and the required technical/UI checks pass.

## Status meanings

- `not-inventoried`: surface/source not yet fully traced.
- `inventory-complete`: all known rendered states and canonical/runtime sources are mapped.
- `review-in-progress`: some sentence units inspected; remainder still open.
- `sentence-reviewed`: every extracted unit has a recorded disposition.
- `technically-verified`: relevant code/trace/complexity/system behavior checks passed.
- `ui-verified`: responsive, accessibility and state checks passed.
- `complete`: all applicable gates passed and evidence is recorded.

Do not mark an entire surface complete based on a sample or automated keyword scan.
