# Tutorial-Hub — Perfect Learning Platform Standard

**Status:** Normative product and content quality standard  
**Version:** 1.0  
**Applies to:** Every academy, topic, lesson, problem, simulator, assessment, learning path and release  
**Principle:** Teach understanding. Verify capability. Preserve learner trust.

This standard is the quality contract for Tutorial-Hub. It converts the product vision into measurable acceptance requirements. A page, component, animation, question bank or progress badge is not proof that learning has occurred. Every published claim must be supported by inspectable evidence.

## 1. The outcome: independent capability

A successful learner should be able to:

1. Explain a concept accurately in their own words.
2. Recognize when the concept applies and when it does not.
3. Predict and trace its behavior on a new example.
4. Implement, configure or apply it independently.
5. Test boundary and failure conditions.
6. Justify correctness, complexity, assumptions and trade-offs.
7. Debug a broken or unfamiliar variant.
8. Transfer the concept to a realistic engineering task.
9. Recall and apply it after a meaningful delay.
10. Communicate the reasoning clearly in a review or interview.

The platform measures these outcomes separately. Time on page, lesson opens, streaks and one quiz score are engagement signals, not mastery evidence.

## 2. The universal learning loop

Use the following sequence as a shared backbone. Subject-specific academies may adapt the sections; they must not force unrelated subjects into an algorithm-only template.

| Stage | Learner experience | Evidence of progress |
|---|---|---|
| Orient | Why the topic matters, prerequisites, outcomes | Learner can state the goal |
| Understand | Intuition, vocabulary, formal model, assumptions | Explain-back |
| Predict | A question before the answer or animation | Prediction with rationale |
| Visualize | State, events, data flow, memory or architecture | Correct trace |
| Derive | Compare approaches and reason to a solution | Defensible derivation |
| Implement | Code, query, configuration, design or experiment | Verified artifact |
| Practice | Guided to independent exercises | Correct independent attempt |
| Prove | Correctness, tests, complexity and trade-offs | Reasoned defense |
| Transfer | Unseen variation or real-world scenario | Generalization |
| Retain | Delayed retrieval and targeted revision | Recall over time |

## 3. Topic and lesson contract

Every published topic must include all applicable items below. An item may be marked not applicable only with an explicit reason; it may never disappear silently.

### 3.1 Orientation and prerequisites
- Stable canonical topic and lesson IDs.
- Clear audience, level, estimated effort and observable learning outcomes.
- Prerequisite IDs linked to canonical content.
- Entry diagnostic or bridge content when prerequisites are commonly missing.
- Motivation and a concrete engineering or problem-solving context.
- Explicit scope: what is included, excluded and assumed.

### 3.2 Explanation
- Plain-language introduction before dense formalism.
- Definitions and vocabulary before relying on them.
- Intuition, formal model, assumptions and constraints.
- Small examples that grow in complexity.
- Analogies with their limitations clearly identified.
- Explanation of both what happens and why it happens.
- Alternative approaches and when each is appropriate.
- Counterexamples, misconceptions, failure modes and debugging clues.
- No unexplained leaps, circular definitions or contradictory terminology.

### 3.3 Worked examples
- Complete input/context, intermediate reasoning/state and output.
- Consistency across prose, diagrams, code, tests and assessment.
- At least one normal case and relevant boundary/failure cases.
- Learner prediction checkpoint before revealing key transitions.
- Expected result explained, not merely displayed.

### 3.4 Implementation or applied artifact
- Runnable code, query, configuration, design artifact or experiment appropriate to the subject.
- Language, framework, tool and runtime versions stated where relevant.
- Setup and expected behavior documented.
- Pseudocode explicitly labelled as pseudocode.
- Important decisions and non-obvious lines explained.
- Tests or validation evidence linked.
- Complexity, cost, latency, throughput, operational burden and trade-offs discussed where relevant.
- Security and failure implications called out.

### 3.5 Practice and assessment
- Guided example followed by independent tasks.
- Progressive difficulty and meaningful variations.
- Questions map to explicit learning outcomes.
- Hints reveal reasoning progressively, not the final answer immediately.
- Feedback explains the misconception, failed assumption or missing step.
- Fresh/unseen tasks test transfer.
- Answer keys and authoritative grading stay server-side where applicable.
- Practice completion is not automatically mastery.

### 3.6 Mastery and application
- Explain-back or teach-back.
- Fresh trace or scenario.
- Independent implementation/design/application.
- Correctness, test and trade-off defense.
- Delayed recall and a real-world application/capstone where suitable.
- Versioned review evidence and known limitations.

## 4. Visualization and simulator contract

A visualization must be a teaching instrument, not decoration.

- Choose a representation that matches the underlying subject.
- Define the initial state, transitions, final state and expected result.
- Expose the state that matters: variables, pointers, memory, events, messages, query plan, locks or service boundaries.
- Explain why each transition happens and what changed.
- Make traces deterministic for fixed fixtures.
- Validate editable inputs and regenerate correct traces.
- Provide play/pause, previous/next, reset, speed and seek when appropriate.
- Include failure, invalid-input and boundary paths where they teach the concept.
- Compare the final state with a verified model or implementation.
- Support keyboard use, focus visibility, screen-reader descriptions, mobile layout and reduced motion.
- Provide a text/static alternative when animation is unavailable.
- Disclose unsupported syntax, inputs and simulation simplifications.

A visualization is **verified** only when its fixtures, transitions and expected final state have automated or documented review evidence.

## 5. Code and execution safety

- Never execute learner code through browser `eval`, the application server process, an unisolated Node VM or a shell command assembled from user input.
- Any future execution provider requires explicit approval and a threat-model review.
- A valid sandbox must demonstrate OS/process isolation, network denial by default, filesystem restrictions, CPU/memory/time/output limits, abuse controls and reliable cleanup.
- Keep private tests, grading keys, secrets and privileged logic server-side.
- Do not claim that a code editor executes code if it only provides editing or static examples.
- Mark code as verified only against a declared runtime and test suite.
- Do not add paid execution, model or hosting services without approval.

## 6. Mastery model

Track independent dimensions rather than one opaque completion percentage:

1. Conceptual explanation.
2. Recognition and selection of the right concept.
3. Trace/prediction accuracy.
4. Implementation or applied execution.
5. Correctness and test design.
6. Complexity, assumptions and trade-off reasoning.
7. Debugging and failure analysis.
8. Transfer to an unfamiliar task.
9. Communication/teach-back.
10. Delayed retention.

Suggested states:

- `not_started`
- `learning`
- `practicing`
- `assessed`
- `mastered`
- `review_due`
- `needs_relearning`

Promotion rules must be transparent, versioned and based on independent evidence. Opening a page or passing one easy quiz cannot grant mastery. Spaced review may start at 1, 3, 7, 14 and 30 days, then adapt to actual recall. Avoid repeated identical questions that reward memorization.

Progress requirements:
- Authenticated user ownership enforced by the server.
- Idempotent writes and stable canonical IDs.
- Clear handling of offline, database-unavailable and stale-session states.
- No fake local success when persistence failed.
- Explainable history of attempts and mastery changes.
- Learner export/deletion and retention behavior aligned to product policy.

## 7. Learning path and learner experience

- Clear starting points for beginner, intermediate and advanced learners.
- Prerequisite-aware pathways and visible next steps.
- One canonical lesson with links/aliases rather than duplicated copies.
- Search across academies, topics, lessons, problems and resources.
- Filters for level, domain, duration, format and publication state.
- Resume last meaningful activity.
- Consistent progress states across academies.
- Mobile reading, diagrams, editors and visualizers without horizontal overflow.
- Semantic headings, keyboard navigation, visible focus, labels and accessible dialogs.
- Screen-reader alternatives and non-color-only status indicators.
- Reduced-motion support and text alternatives.
- Useful loading, empty, error, offline and permission-denied states.
- Learner feedback/reporting tied to content ID and version.

## 8. Content lifecycle and evidence

Use these explicit states:

| State | Meaning | What it does not mean |
|---|---|---|
| `missing` | Expected content is absent | Not started content |
| `inventory` | ID/title/metadata exists | A lesson exists |
| `blueprint` | Structure/checklist exists | Full authored content |
| `draft` | Substantive content authored | Technically approved |
| `technical_review` | Awaiting expert review | Verified |
| `code_verified` | Applicable code passed declared tests | Entire lesson verified |
| `visual_verified` | Visual trace passed fixture review | Assessment verified |
| `assessment_verified` | Assessment and grading reviewed | Learner mastery |
| `published` | Applicable gates passed and publication authorized | Permanently current |
| `needs_maintenance` | Content needs reassessment | Safe to rely on unchanged |

Verification dimensions are independent. A lesson can have verified code and an unverified visualizer. Never compress this into a single optimistic boolean.

Required evidence metadata:
- Canonical ID, content version and prerequisite IDs.
- Author/reviewer and review date where available.
- Source references, licenses and version assumptions.
- Code language/runtime, test reference and result.
- Visualizer type, fixture and result.
- Assessment/rubric version and result.
- Accessibility and security review evidence.
- Known gaps, non-applicable checks and maintenance trigger.
- Publication actor/time and change history.

Generated content begins as a draft. It must not self-certify, invent citations, mark its own code verified or publish itself.

## 9. Platform quality and operations

- Preserve authentication, authorization, existing academies, simulators, URLs, IDs and learner progress.
- Enforce role permissions on the server, not only in UI.
- Protect private drafts, assessment keys and learner data.
- Validate and sanitize user-supplied content and embedded links.
- Establish performance budgets for startup, navigation, search, lesson rendering and large visualizers.
- Bound expensive rendering and lazy-load large studios.
- Test API validation, authorization, persistence, migrations and failure behavior.
- Add end-to-end coverage for critical learner journeys.
- Provide safe, privacy-aware error reporting and redacted logs.
- Document backups, restoration and data retention for learner records.
- Review dependencies, frameworks, source links and technical content for staleness.
- No production deployment, infrastructure spend or provider activation without explicit approval.

## 10. Curriculum completeness

Curriculum breadth must be measured by outcomes and verified depth, not by the number of titles.

Maintain a prerequisite-linked coverage map for:
- DSA and problem-solving patterns.
- Programming language fundamentals and runtime internals.
- Computer science foundations: operating systems, networking, architecture, compilers, concurrency and security.
- Backend engineering: APIs, Spring/runtime frameworks, transactions, messaging, testing and observability.
- Frontend engineering: JavaScript runtime, React, browser internals, accessibility and performance.
- Database engineering: indexes, query planning, transactions, MVCC, replication, recovery and operations.
- System design: distributed systems, reliability, consistency, security, capacity and trade-offs.
- Cloud/platform engineering: networking, IAM, containers, Kubernetes, infrastructure as code, CI/CD and operations.
- AI/ML engineering: ML foundations, deep learning, LLMs, retrieval, evaluation, agents, tool safety and operations.
- Professional engineering: code review, debugging, documentation, communication, collaboration and production ownership.

Before adding a new topic, audit existing canonical material to avoid duplication. Missing curriculum should be recorded explicitly rather than filled with shallow placeholder pages.

## 11. Metrics that must remain separate

| Metric | What it measures |
|---|---|
| Inventory coverage | Expected IDs represented |
| Authored coverage | Substantive content exists |
| Technical verification | Claims/code/logic reviewed |
| Code verification | Declared tests pass |
| Visualization verification | Trace fixtures and final state pass |
| Assessment verification | Prompts/rubrics/grading reviewed |
| Accessibility coverage | Automated and manual checks |
| Publication coverage | Applicable release gates passed |
| Mastery coverage | Learners demonstrated independent evidence |
| Retention | Delayed recall and transfer |
| Reliability | API, persistence and critical flow health |
| Freshness | Content within review/version policy |

Never average these into a misleading "platform is 95% complete" score. Show denominators, missing evidence and the date of measurement.

## 12. Release acceptance gate

A topic/platform change is ready for review only when:
1. All applicable checks have evidence.
2. Non-applicable checks have documented reasons.
3. No unresolved critical correctness, security, privacy or data-integrity defect remains.
4. Existing learner flows and stored progress pass regression tests.
5. Type-check, tests and production build pass for the exact commit.
6. Technical subject-matter review is recorded where required.
7. Known limitations and unfinished content are disclosed.

Release labels:
- **Inventory complete** — all expected records accounted for.
- **Content authored** — substantive material exists.
- **Technically verified** — applicable technical/code/visual checks passed.
- **Learning validated** — assessment and learner evidence support the outcomes.
- **Published** — release gates passed and publication was authorized.

"Perfect" is not a permanent badge. The platform is continuously maintained as technologies change and learner evidence reveals new gaps.

## 13. Per-topic sign-off template

```yaml
topic_id: ""
content_version: ""
owner: ""
reviewer: ""
reviewed_at: ""
audience_level: ""
learning_outcomes: []
prerequisite_ids: []
explanation:
  status: "missing"
  evidence: []
worked_examples:
  status: "missing"
  evidence: []
implementation:
  status: "not_applicable"
  reason: ""
  runtime: ""
  test_reference: ""
  test_result: ""
visualization:
  status: "not_applicable"
  reason: ""
  fixture_reference: ""
  verification_result: ""
practice:
  status: "missing"
  evidence: []
assessment:
  status: "missing"
  rubric_version: ""
  grading_test_reference: ""
mastery:
  status: "missing"
  independent_evidence: []
accessibility:
  status: "not_reviewed"
  automated_evidence: []
  manual_evidence: []
security_privacy:
  status: "not_reviewed"
  evidence: []
known_gaps: []
publication:
  status: "draft"
  authorized_by: ""
  published_at: ""
```

## 14. Non-negotiable product principles

1. Truth over vanity metrics.
2. Depth over superficial topic count.
3. Understanding over memorization.
4. Independent evidence over passive consumption.
5. Reuse canonical content over duplication.
6. Accessibility and safety are baseline requirements.
7. Preserve learner trust and historical progress.
8. Generated content is never automatically verified.
9. Every claim is traceable to evidence.
10. Continuous maintenance is part of completion.
