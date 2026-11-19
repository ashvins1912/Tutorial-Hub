# Intelligent Content Studio — AI Orchestration Phase

## Architecture
`upload → deterministic analysis → author review → provider adapter → subject-aware prompt → structured lesson JSON → structural validation → persisted unverified draft → human review`

## Provider configuration
Choose one provider on the server only:
- OpenAI-compatible: `CONTENT_AI_PROVIDER=openai-compatible`, `CONTENT_AI_API_KEY`, optional `CONTENT_AI_BASE_URL`, `CONTENT_AI_MODEL`.
- Gemini: `CONTENT_AI_PROVIDER=gemini`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`.

No provider is called until an authorized author explicitly selects Generate. The service returns 503 when no provider key is configured. Never expose these secrets through `VITE_*` variables.

## Subject-specific instruction packs
- DSA: solution derivation, invariants, traces, edge cases and complexity.
- ML: math, dataset splits, training/evaluation, leakage and reproducible experiments.
- AI: architecture, inference/data flow, evaluation and safety.
- Database: schema, indexes, query plans, transactions and isolation.
- System design: requirements, capacity assumptions, component/sequence/DFD, reliability and trade-offs.
- Software engineering: design, code, security, tests and operations.
- General: progressive teaching and suitable visual formats.

## Generated contract
A generated draft contains learning modules, worked examples, code examples, Mermaid/animation/table/equation/chart visualizations, quizzes, practice tasks, references and quality notes. Required section IDs must be covered. Animation requires at least two steps. Invalid output is rejected instead of silently stored.

## Safety and integrity
- Uploaded text is untrusted data and cannot override system instructions.
- Source content is capped in the prompt; model output is not treated as verified fact.
- The engine does not execute generated code, claim compilation, invent official problem statements, or invent references.
- Output status remains `unverified-draft`; no publishing endpoint is provided.
- Only the owning author can trigger generation or retrieve the generated draft.
- Provider timeout and output validation failures are surfaced as controlled API errors.
- API keys stay server-side. Provider calls may transmit uploaded source content to the configured provider; use only content authorized for that provider.

## API
- `POST /api/authoring/jobs/:id/generate` — generate structured learning draft.
- `GET /api/authoring/jobs/:id` — returns the persisted generated lesson (without raw source text).
