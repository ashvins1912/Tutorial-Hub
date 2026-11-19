# Phase 4 — Interactive Learning Runtime

The generated lesson now includes an interactive runtime for learners, not only an author preview.

## Included
- Deterministic binary-search and bubble-sort trace labs with editable numeric input.
- Previous, next and reset controls; each step explains the operation and exposes state variables.
- Sorted-input validation for binary search, finite-number validation and bounded input (12 values) to keep traces readable.
- Quiz submission with single-select and multi-select support, feedback and explanations after submission.
- A simple adaptive next-step recommendation based on quiz accuracy (beginner, intermediate or advanced).
- Practice tasks presented as learner checklists/details.

## Execution and data safety
- The runtime executes only two hand-written, deterministic algorithm implementations. It never evaluates generated JavaScript, Java, Python, HTML or model-provided code.
- Arbitrary code execution is intentionally not enabled. A production code runner requires a separately configured isolated sandbox with CPU, memory, time and network limits; the application server must not execute learner code.
- Quiz attempts and current runtime state are held in component/browser session memory only. Cross-device, account-level mastery history is not claimed in this phase; it requires a dedicated authenticated progress API and persistence model.
- AI lesson content remains unverified and is not automatically published.

## Automated checks
Run `npm run test:content-authoring`. The learning runtime tests cover binary search success/miss cases, bubble sort ordering and input bounds.
