# Full-Sentence Concept Review and Deep-Dive Authoring Standard

Status: This document defines the review protocol and provides original exemplars. It does not claim every existing lesson or sentence has already been reviewed.

## 1. Exact scope

Review every learner-facing title, definition, paragraph, use case, code comment, trace step, diagram label, animation, quiz stem, answer option, rationale, hint, solution, simulator prompt, generated lesson, seeded lesson, published lesson and duplicate copy. Include UI messages when they teach or assert a concept. A topic is not complete merely because it has a definition field or required headings.

## 2. Sentence-by-sentence review record

For every sentence, record:
1. Exact file path, stable concept ID, section and sentence number.
2. Sentence role: definition, motivation, assumption, mechanism, guarantee, heuristic, use case, limitation, example, instruction or assessment.
3. Each independently testable claim.
4. Terminology, units, grammar, ambiguity and referent checks.
5. Truth conditions: input domain, language/runtime, system/version, workload, data model and failure assumptions.
6. Pedagogical value: what mental model or decision does this sentence teach?
7. Consistency with code, trace, diagram, quiz, answer and simulator.
8. An exact original rewrite when needed, not merely a comment that it is unclear.
9. Evidence: derivation, primary documentation, test, execution, trace or domain review.
10. Severity and disposition: blocker, major, moderate, minor; corrected, verified, deferred with reason, or not applicable.

Do not mechanically replace every word. Inspect each word for scope, precision and grammar; preserve correct wording and rewrite inaccurate or unclear passages. Avoid needless churn.

## 3. Definition and use-case contract

A complete concept explanation should distinguish definition, purpose and implementation. Include as appropriate:
- precise definition and essential property;
- intuition, clearly labeled as an analogy or simplification;
- problem solved and prerequisites;
- formal model, contract, state or invariant;
- mechanism and step-by-step state transitions;
- input assumptions, guarantees and non-guarantees;
- recognition cues and non-use cases;
- original example with full expected output;
- counterexample and boundary cases;
- correctness reasoning or proof sketch;
- complexity with variables and all relevant assumptions;
- code walkthrough, tests and runtime semantics;
- alternatives and trade-offs;
- practice for recall, application, debugging and transfer.

Each use case must state context, problem, why the concept fits, assumptions, implementation outline, trade-off, failure/alternative and evidence. Avoid unsourced company name-dropping as proof of real-world use.

## 4. Pedagogical references and originality

Use the requested works as high-level learning principles, not as styles to imitate. Do not reproduce wording, code, diagrams, examples, exercises or distinctive chapter structures.

Algorithms and foundations:
- Aditya Bhargava, Grokking Algorithms: approachable intuition, visual state changes and small examples.
- Jay Wengrow, A Common-Sense Guide to Data Structures and Algorithms: practical selection, readable reasoning and explicit trade-offs.
- Narasimha Karumanchi, Data Structures and Algorithms Made Easy: broad coverage, alternative approaches and complexity reasoning.
- Brian Christian and Tom Griffiths, Algorithms to Live By: careful real-world connections and decision framing without overselling analogies.
- Thomas H. Cormen, Algorithms Unlocked: precise foundations, correctness and efficiency.

System design and distributed systems:
- Alex Xu, System Design Interview Vol. 1: clarify requirements, model data/request flow, identify bottlenecks and discuss trade-offs.
- Roberto Vitillo, Understanding Distributed Systems: state assumptions, failures, coordination, replication and protocol behavior.
- Martin Kleppmann, Designing Data-Intensive Applications: data models, replication, partitioning, consistency, transactions, streams and operational consequences.
- Gaurav Sen's public educational material: visual decomposition, request/data-flow explanation and system-design communication. Verify technical claims independently and do not copy presentation or diagrams.

Pedagogical references are not technical evidence for a particular language, database, cloud service or version. Verify claims against suitable primary documentation, derivations and tests.

## 5. Required deep dive

For every concept, when applicable, teach: problem statement; baseline approach and cost; key insight; formal model; step-by-step walkthrough; code and state changes; correctness; complexity; edge cases; use-case decision; alternative comparison; practice with answer rationales.

## 6. Original exemplar: prefix-sum frequency map

Definition: For an array a, define P[0] = 0 and P[j] as the sum of the first j values. The sum of the non-empty subarray a[i..j] is P[j+1] - P[i]. To count subarrays ending at the current index with sum k, count earlier prefix boundaries equal to currentPrefix - k.

Intuition: subtract the sum before a slice from the sum through its end. A frequency map remembers how many eligible earlier boundaries have each prefix value.

Contract: Input is an integer array and target k; output is the count of contiguous non-empty subarrays summing to k. Negative values and zeros are supported. Arithmetic must not overflow. Expected O(n) time assumes expected O(1) hash operations; worst-case hash operations may be slower. Auxiliary space is O(n).

Example: a = [1, 2, 1, -1, 2], k = 3. Prefix boundaries are 0, 1, 3, 4, 3, 5. Matching boundary pairs with difference 3 give four subarrays: [1,2], [2,1], [1,2,1,-1], and [1,-1,2].

JavaScript implementation:

    function countSubarraysWithSum(nums, k) {
      const frequency = new Map([[0, 1]]);
      let prefix = 0;
      let count = 0;
      for (const value of nums) {
        prefix += value;
        count += frequency.get(prefix - k) ?? 0;
        frequency.set(prefix, (frequency.get(prefix) ?? 0) + 1);
      }
      return count;
    }

Line-level explanation: The initial map entry represents the empty prefix boundary. The running sum computes the current prefix. The needed earlier sum is prefix minus k. A map value is a frequency, because repeated prefix sums represent distinct starting boundaries. Query before insertion so the current boundary is not paired with itself when k is zero. Each valid subarray is counted at its unique right endpoint.

Correctness sketch: Before processing a right endpoint, the map contains exactly the prefix frequencies at earlier boundaries. An earlier boundary forms a target-sum subarray exactly when its prefix equals currentPrefix - k. The lookup therefore counts exactly the valid subarrays ending here. Every non-empty subarray has one right endpoint, so each is counted once.

Use case: target-sum subarray counting when values may be negative, zero or positive. A sum-based sliding window is not generally valid with negative values unless its required monotonicity is proven. For repeated immutable range-sum queries, a prefix array alone is simpler after O(n) preprocessing and provides O(1) queries.

## 7. Original exemplar: idempotency in distributed request processing

Definition: An operation is idempotent when repeating the same logical operation produces the same intended effect as performing it once. An idempotency key identifies retries of one logical request. A key alone does not provide idempotency; the server must persist and enforce the key/result relationship atomically with the business effect or through a recoverable workflow.

Scenario: A payment request commits, but the response is lost. The client cannot know whether the first request succeeded and retries. Without deduplication, a second charge or order may be created. A timeout is ambiguity, not proof of failure.

Correct use case: Require a stable key for retries of the same checkout. Persist key, normalized request fingerprint, operation state and result. Reject reuse with a different payload. Enforce uniqueness in durable storage. Concurrent duplicates must converge on one operation record and return the stored result or an explicit in-progress response. The payment provider may require its own idempotency key, and reconciliation is still needed across the provider boundary.

Non-guarantees: Idempotency does not guarantee exactly-once network delivery or make unrelated side effects atomic. An in-memory cache can disappear on restart. A separate write to the key store and business database can leave a failure gap. Document key scope, retention, payload canonicalization and downstream behavior.

Deep-dive lesson should include a sequence diagram and tests for duplicate requests, same key/different payload, concurrent requests, timeout after commit, crash/restart, expired key and provider ambiguity. Phrase guarantees narrowly: at most one business effect within the specified key, scope, retention and atomicity boundary.

## 8. Sentence-level style and claim rules

Prefer one primary claim per sentence. Define acronyms at first use. Keep terminology stable. Put conditions next to the claim they qualify. Distinguish can, usually, expected, guaranteed, requires and must. Include units and quantitative assumptions. Avoid vague pronouns, unsupported absolutes and unexplained code dumps. Ensure summaries do not strengthen a conditional claim into an absolute. Visuals must have text equivalents; color cannot be the only state cue.

## 9. Cross-content consistency and verification

For each stable concept ID, compare canonical lesson, algorithm catalog, tutor guide, problem bank, quiz, simulator, visualization and generated/published copies. Select a source of truth and record divergences.

Verify by claim type: algorithms through independent derivation, invariants, edge tests and execution; APIs through contracts and tests; databases through engine/version semantics and plan evidence; distributed systems through failure models, state machines and recovery tests; system design through workload assumptions, capacity calculations and failure-path analysis; cloud/security through provider documentation, threat model and configuration validation; AI/RAG through model/data versions, evaluation protocol, failure cases and citation grounding.

A CI pass verifies only checks that actually ran. It cannot substitute for semantic review or domain expertise.

## 10. Single-PR completion protocol

Keep all related content corrections and the review ledger in one draft PR. Preserve stable IDs, routes, user progress, quiz history and data contracts. Prioritize false or unsafe claims, incorrect code/output, invalid use cases, missing assumptions, then clarity and style. Run content validation, tests, production build and relevant regression checks. Review rendered lessons on mobile and with accessible text. Do not merge or deploy until the agreed scope is actually reviewed and checks pass.

Completion must be evidence-based: report reviewed, remediated and verified counts by source and concept. If any content remains unreviewed, state that explicitly rather than claiming the application is complete.
