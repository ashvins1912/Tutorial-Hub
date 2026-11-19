# DSA Learning Stage Playbook

## Purpose

Turn every curriculum topic into a guided, visual, evidence-based learning experience. The learner should move from intuition to independent problem solving, then retain and transfer the idea. Content must teach the reasoning behind an algorithm, not just its steps or final code.

This is the content contract for Curriculum, Algorithms, Topic Bank, Universal Problem Solver Studio, and Visual Diagram Synthesizer. Reuse a topic's canonical explanation and examples across these surfaces so the learner never encounters contradictory terminology or invariants.

## The five-stage learning journey

Every topic must expose all five stages in this order. Learners may revisit earlier stages, but a stage should unlock its mastery check only after its learning activity is completed.

### Stage 1 — Understand: build a mental model

**Outcome:** The learner can explain the problem a technique solves, recognize its preconditions, and describe the core idea without code.

Required content, in this order:
1. **The problem before the technique:** show a concrete scenario and explain why the obvious approach is slow, awkward, or error-prone.
2. **Why this topic exists:** practical use cases, the computational bottleneck, and what changes when input size grows.
3. **Prerequisite bridge:** link the exact prerequisite concepts; briefly reteach missing prerequisites instead of assuming them.
4. **Plain-language intuition:** one precise analogy, followed immediately by where the analogy stops being accurate.
5. **Formal model:** input, output, constraints, assumptions, and the property that makes the technique applicable.
6. **Vocabulary:** define every important term in context (e.g. invariant, frontier, relaxation, state, transition, monotonicity).
7. **Recognition signals and anti-signals:** phrases or structural properties that suggest the pattern, plus counterexamples where it must not be used.
8. **Prediction checkpoint:** ask the learner to predict what the technique will track or discard before revealing the explanation.

Educator script: *What is the repeated work? What information would make that work unnecessary? What must remain true after each operation?* Never introduce a pattern name as a substitute for deriving the idea.

### Stage 2 — Visualize: see state change over time

**Outcome:** The learner can trace the algorithm and explain why each state transition occurs.

Every topic needs a visual model chosen for its actual data structure and algorithm—not a generic decorative flowchart. Include:
- An annotated initial state with input, indices, pointers, boundaries, and auxiliary structures.
- A step-by-step execution with one meaningful operation per frame.
- A visible current state and a short explanation of why the next operation is legal.
- A state ledger: variables, data structure contents, invariant status, and output after each step.
- A final state and a plain-language interpretation of the result.
- A counterexample or invalid-input mode that demonstrates a precondition failure where relevant.

Visualization types by topic:
- Arrays/strings: indexed cells, read/write pointers, window boundaries, frequency tables, prefix totals.
- Linked lists: node identity, next/prev edges, sentinel nodes, before/after pointer rewiring.
- Stack/queue/deque: ordered contents, push/pop/enqueue/dequeue, monotonic ordering and eviction reasons.
- Binary search/sorting: active interval, comparison, partition boundaries, stable ordering, swaps and passes.
- Recursion/backtracking: call tree, stack frames, local state, choose/explore/unchoose, prune reason, return values.
- Trees/heaps/tries: node relationships, traversal frontier, heap property, prefix path, rotations where applicable.
- Graphs: adjacency, visited set, queue/stack, distance/parent, edge classification, priority queue, DSU components.
- Dynamic programming: state definition, dependency arrows, recurrence, base cases, evaluation order, reconstructed answer.
- Range-query structures: tree nodes, covered intervals, update/query propagation, lazy tags, prefix aggregates.
- Strings/math/bitwise: character positions, automaton states, residues, bit masks, carry/borrow or number-line transformations.

Controls should include play/pause, previous/next, reset, speed, and a scrubber when the sequence is long. The learner must be able to pause and inspect a frame. Parameter changes should regenerate the trace from a deterministic input. Respect reduced-motion preferences; the explanation must remain understandable without animation.

### Stage 3 — Implement: derive, compare, and reason about code

**Outcome:** The learner can independently derive an implementation and justify its correctness and complexity.

Teach in this sequence:
1. Restate the input/output contract and constraints.
2. Build a correct brute-force solution first; show its invariant and complexity.
3. Identify the exact repeated work or bottleneck—do not jump straight to the optimal pattern.
4. Derive the optimization from a reusable observation (ordering, cached information, monotonicity, state compression, pruning, or decomposition).
5. State the optimized algorithm in numbered language-neutral steps and pseudocode.
6. Define the loop/recursion invariant and explain initialization, maintenance, and termination.
7. Prove correctness with an appropriate argument: induction, exchange argument, contradiction, cut property, invariant, or recurrence reasoning.
8. Analyze time and space, including amortized work, recursion depth, auxiliary allocations, and worst-case behavior.
9. Present clean implementations in Java, JavaScript/TypeScript, and Python when supported by the app. Explain language-specific hazards rather than merely translating syntax.
10. Walk through one normal case, one boundary case, and one adversarial case.

For every code block, provide line-level annotations for the decisions that matter. Label assumptions explicitly. Never claim expected O(1) hash operations are worst-case O(1), or that an algorithm is universally optimal without stating its model and constraints.

### Stage 4 — Practice: progress from supported to independent

**Outcome:** The learner can recognize, select, implement, debug, and adapt the technique on unseen problems.

Each practice item must contain a full problem statement, input/output contract, constraints, at least one example with input/output and explanation, and any important edge-case note. Do not use title-only cards or links as a substitute for the problem itself. Attribute external problem IDs/links when used and do not reproduce proprietary editorial text; write original explanations and examples.

Use the following ladder:
- **L0 — Recognition:** classify a short scenario; identify preconditions and reject a tempting wrong pattern.
- **L1 — Guided trace:** fill missing states in a worked example; hints reveal one reasoning step at a time.
- **L2 — Implementation:** implement the canonical pattern with normal constraints and hidden edge tests.
- **L3 — Variation:** change one condition (duplicates, negatives, ordering, memory cap, streaming input, or update/query mix) and adapt the solution.
- **L4 — Mixed challenge:** combine two patterns or hide the pattern in a realistic problem statement.
- **L5 — Interview/contest challenge:** solve independently under a time/space budget, explain trade-offs, prove correctness, and defend against counterexamples.

For each level, show the objective, estimated effort, prerequisite skills, allowed hints, pass criteria, and a review path after failure. Hints should be progressive: clarify the model, point to an invariant, suggest a data structure, then expose pseudocode—never reveal the full solution immediately. After a submission, show the first failing test and explain the violated assumption before showing a corrected approach.

### Stage 5 — Master: retrieve, transfer, and retain

**Outcome:** The learner can recall the concept after a delay and transfer it to a problem that looks different.

Required mastery evidence:
- Explain the idea unaided in 60 seconds.
- State preconditions and give one counterexample where it fails.
- Trace a fresh input without help.
- Implement from a blank editor.
- State and defend the invariant/proof.
- Analyze time and space accurately.
- Pass edge, adversarial, and randomized tests where appropriate.
- Solve one unseen mutation at the next difficulty level.
- Compare the technique with its closest alternative and explain when to choose each.

Use retrieval practice rather than rereading. Schedule review at completion, then 1, 3, 7, 14, and 30 days. Each review should ask the learner to reconstruct the invariant, trace a small input, answer a misconception check, and solve a short variation. Increase challenge when recall is strong; return to a visual trace when the learner cannot explain a transition.

## Difficulty and mastery model

Difficulty is a progression of reasoning independence, not just problem length.

| Level | Learner capability | Content expectation | Promotion evidence |
|---|---|---|---|
| L0 — Orient | Understand vocabulary and recognize the pattern | Analogy, examples, anti-examples | Correctly classify 4/5 scenarios and explain one rejection |
| L1 — Guided | Follow a trace with prompts | Annotated frames and scaffolded questions | Complete a trace with at most one hint |
| L2 — Core | Solve canonical problems | Brute force, optimized recipe, standard implementation | 2 independent problems plus edge tests |
| L3 — Applied | Adapt to changed constraints | Mutation ladder and trade-off comparison | Solve 2 unseen variants and justify the changed approach |
| L4 — Advanced | Combine patterns and prove choices | Multi-step problems, proof, adversarial tests | Solve a mixed problem and defend correctness/complexity |
| L5 — Expert | Transfer under uncertainty and constraints | Interview/contest simulation and counterexample design | Independent solution, proof, tests, and teach-back |

Suggested score per topic: Understanding 15%, Visualization/trace 15%, Implementation 25%, Practice 25%, Mastery/transfer 20%. A topic is mastered only at 85% or above and after all critical gates pass. A high quiz score cannot compensate for an inability to implement or explain the invariant. Keep stage completion, quiz accuracy, hints used, attempts, and revision due date as separate signals.

## Reasoning coach: questions every topic should teach

- What is the brute-force search space? Which choices or pairs are being repeated?
- What information from the past can be stored so it does not need to be recomputed?
- What property makes a pointer move, greedy choice, pruning step, or state transition safe?
- What is the invariant before the loop, after one iteration, and at termination?
- Which assumption would break this algorithm? Construct the smallest counterexample.
- What changes if the input is sorted, contains duplicates, includes negatives, arrives as a stream, or receives updates?
- Is the complexity worst-case, average-case, expected, or amortized? What operation dominates?
- Can memory be reduced? What time cost would that introduce?
- Which alternative is simpler or safer under the actual constraints?

## Quiz and assessment design

Every topic should offer three quiz modes:
1. **Concept check:** definitions, preconditions, invariant, and misconception detection.
2. **Trace/reasoning check:** predict the next state, identify a valid transition, debug a trace, or choose a data structure with justification.
3. **Challenge check:** derive complexity, evaluate a counterexample, select between competing patterns, or solve a small unseen variation.

Question rules:
- Mix recall, application, trace, debugging, proof intuition, and transfer; do not make every quiz a vocabulary test.
- Use plausible distractors based on real misconceptions and explain why each choice fails.
- Include code-trace questions with exact input and deterministic output.
- For multi-select questions, state that all valid choices must be selected.
- Reveal explanations after the attempt; do not expose answers in the question or hint.
- Adapt the next question to the learner's error category: concept gap, invariant gap, implementation bug, complexity error, or constraint mismatch.
- Track accuracy and reasoning quality separately. Ask for a short justification on important decisions.

## Universal Problem Solver Studio orchestration

When a learner submits a problem, guide them through a consistent sequence:
1. Parse the statement into input, output, constraints, and edge cases.
2. Ask the learner to predict the brute-force approach before suggesting patterns.
3. Identify candidate patterns with evidence and confidence; show alternatives and anti-signals.
4. Derive the invariant and data structure contract.
5. Build a small trace and visual state model from the actual input.
6. Offer progressive hints and ask the learner to choose the next step.
7. Compare brute force, improved, and optimal approaches with explicit assumptions.
8. Generate code only after the learner has seen the reasoning; support dry-run and test cases.
9. Test normal, boundary, adversarial, and constraint-specific cases.
10. Finish with complexity, proof sketch, reflection, and a scheduled revision prompt.

The studio should not confidently label a pattern from keywords alone. Explain which structural property supports the recommendation, what assumptions are unknown, and what counterexample would invalidate it.

## Visual Diagram Synthesizer and parametric generator contract

A generated diagram must be algorithm-aware and tied to the current lesson state. A generated problem variation must preserve correctness and state which property changed. Parameters can include input size, duplicates, sign distribution, graph density, tree shape, target value, memory limit, and operation mix when relevant. Validate generated inputs against the problem's constraints before rendering them. Provide a seed or reproducible input so a learner can replay the same trace. Never generate a diagram that implies an invalid invariant or silently changes the problem's assumptions.

## Content quality gate for every topic

A topic is ready for learners only when an educator can verify all of the following:
- All five stages contain topic-specific content, not generic filler.
- Prerequisites and applicability conditions are explicit.
- At least one worked example and one counterexample are included.
- The visual trace uses the real algorithm state and explains every meaningful transition.
- Brute force is derived before optimization.
- The invariant and correctness argument are understandable.
- Complexity states assumptions and worst/average/amortized distinctions.
- Code is consistent with the trace and tested against edge cases.
- Practice items have full statements, examples, constraints, and level tags.
- Quizzes test distinct reasoning skills and give useful feedback.
- Mastery requires implementation and transfer, not only self-reporting.
- Revision prompts are scheduled and progressively varied.

## Example: one concept taught end-to-end — sliding window

**Understand:** A contiguous range can be maintained while the right boundary advances. The technique is valid only when the chosen validity condition can be restored by moving the left boundary in the required direction. For a longest substring with at most K distinct characters, adding a character may violate the distinct-count limit; removing from the left can restore it.

**Visualize:** For the string eceba and K = 2, show [e], [e,c], [e,c,e], then add b; the window becomes invalid, so evict e and then c until [e,b] is valid. Display the frequency map and distinct count on every frame. Explain why left never moves backward.

**Implement:** Start with a brute-force enumeration of all substrings and count distinct characters. Identify repeated recounting. Optimize by maintaining frequencies and a distinct counter. State the invariant: after shrinking, the active window contains at most K distinct characters. Explain why each index enters and leaves at most once, giving O(n) total pointer movement.

**Practice:** L0 classify positive-only sum windows vs arbitrary-negative sum problems. L1 fill the frequency map for a trace. L2 implement longest substring with at most K distinct characters. L3 adapt to exactly K distinct using atMost(K) - atMost(K - 1) for counts. L4 combine with a frequency constraint. L5 explain why a standard variable window fails for arbitrary negative numbers and design a prefix-sum alternative where appropriate.

**Master:** Reconstruct the invariant from memory, solve a fresh string, explain the failure mode for negative-number sum windows, then review at days 1, 3, 7, 14, and 30.