# Phases 5 and 6 — Learner Mastery and Render Free Code Lab

## Phase 5: Persistent learner progress

### API
All progress routes require a verified Supabase bearer token:
- `GET /api/learning-progress` — current user's lesson records and aggregate summary.
- `GET /api/learning-progress/:lessonId` — restore progress for a lesson the user owns or that is published.
- `PUT /api/learning-progress/:lessonId` — persist trace position, algorithm inputs, quiz attempt and completed practice items.

### Publishing and learner authorization
- Content authors are restricted by `CONTENT_AUTHOR_USER_IDS`.
- Authors can publish a generated lesson with `POST /api/content-authoring/jobs/:id/publish`.
- Authors can unpublish it with `DELETE /api/content-authoring/jobs/:id/publish`.
- Publishing requires an existing generated lesson and is scoped to the author who owns the job.
- Authenticated learners can retrieve published lesson content through `GET /api/content-authoring/published/:id`; the authoring UI provides a shareable `/?lesson=<id>` learner view.
- Progress access is allowed when the authenticated user owns the draft or the lesson has a valid `publishedAt` timestamp.
- Unpublished drafts remain private to their author. Progress records remain isolated by authenticated user ID.

### Stored mastery data
The MongoDB `LearningProgress` collection is uniquely indexed by `userId + lessonId`. It stores:
- Last algorithm and bounded input configuration, target and current trace step.
- Quiz attempt count, latest score, best score, mastery band, selected answers and the latest 30 score-history entries.
- Completed practice task identifiers and last activity timestamp.

The server derives mastery bands from quiz accuracy: below 50% = beginner, 50–79% = intermediate, 80%+ = advanced. The client cannot set the mastery score directly: the API loads the lesson's stored quiz answer key and grades submitted selections server-side. The progress API fails closed with HTTP 503 when MongoDB is unavailable.

## Phase 6: Render Free code lab

### Deployment decision
Tutorial Hub and its code-lab interface remain on Render Free. The current Render Free environment does not provide a verified isolation boundary for executing arbitrary learner programs. Therefore:
- No Judge0 service is provisioned or called.
- No external execution host, paid API or VM is required.
- The code editor, language selection, starter examples and stdin editor remain available.
- Arbitrary code execution is explicitly disabled. The API returns HTTP 503 with `CODE_EXECUTION_UNAVAILABLE_ON_RENDER_FREE`.
- Submitted source is validated at the API boundary but is not executed, forwarded, or stored.
- No `eval`, `child_process`, Node VM, shell, or in-process execution fallback is permitted.

### Provider extension contract
The service exports a `CodeExecutionProvider` contract so a future provider can be added without changing the learner UI. No provider is registered in the Render Free deployment. A future implementation must first demonstrate OS-level process isolation, network denial, filesystem restrictions, CPU/memory/process limits, bounded output and safe cleanup under Render's actual runtime constraints.

### Supported editor languages
- Java 21
- JavaScript (Node.js)
- Python 3

These are editor language options only; they are not currently executable on the deployed free tier.

### Request validation
- Source code: 20 KB maximum.
- Standard input: 5 KB maximum.
- Per-user API request limit: 8 requests per minute per app process.
- Authentication is required for both status and run endpoints.

### Environment
No code-execution environment variables are required. Do not add a public Judge0 URL or an external runner secret to Render.

## Verification
Run:
```bash
npm run lint
npm run test:content-authoring
npm run build
```
Tests verify published-vs-private lesson authorization filters, server-side quiz grading, language allowlisting, request-size limits, and fail-closed execution behavior.
