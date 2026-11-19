# Intelligent Content Studio — Phase 1

## Goal
Provide a reusable, format-independent authoring foundation. Authors upload technical knowledge, receive a normalized analysis and editable learning outline, and save a canonical draft before any AI-generated content can be published.

## Phase 1 capabilities
- Authenticated author-only API using the server-side `CONTENT_AUTHOR_USER_IDS` allowlist.
- JSON, Markdown, TXT, YAML, JavaScript, TypeScript, Java, Python and SQL text uploads.
- Content hash, source metadata, owner isolation and MongoDB-backed job history.
- Deterministic domain/type/level detection and a subject-aware proposed outline.
- Editable outline saved to the authoring job.
- Downloadable universal JSON, Markdown, DSA problem, ML/AI, database and system-design templates.
- Canonical draft schema version 1.0.

## Supported input contract
The upload API accepts `POST /api/authoring/upload` with JSON:
```json
{ "fileName": "lesson.md", "mimeType": "text/markdown", "content": "# Topic\n..." }
```
The browser reads text files locally and sends extracted UTF-8 text. Binary PDF/DOCX/image extraction is intentionally not advertised in this first implementation; those need dedicated parsers and limits before they are enabled.

## API
- `GET /api/authoring/templates`
- `GET /api/authoring/templates/:id/download`
- `POST /api/authoring/upload`
- `GET /api/authoring/jobs`
- `GET /api/authoring/jobs/:id`
- `PUT /api/authoring/jobs/:id/structure`

## Status and integrity
Upload jobs are saved as `review_required`; the canonical learning draft remains `draft`. Classification is heuristic and explicitly reports confidence/warnings. It is not an LLM-generated lesson and does not claim technical verification. Source text and SHA-256 are retained for traceability. Only the owner can read or edit their jobs.

## Required backend configuration
Set `CONTENT_AUTHOR_USER_IDS` to a comma-separated list of authorized Supabase user UUIDs. If unset, authoring routes fail closed with 503. Authentication continues to use the existing Supabase `requireAuth` middleware.

## Deliberate non-goals for Phase 1
- No automatic publishing.
- No execution of uploaded code.
- No binary PDF/DOCX/ZIP extraction.
- No paid model/API integration.
- No changes to the existing DSA problem bank or learning progress.
