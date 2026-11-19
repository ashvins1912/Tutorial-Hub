# Phases 5 and 6 — Learner Mastery and Isolated Code Execution

## Phase 5: Persistent learner progress

### API
All routes require a verified Supabase bearer token:
- `GET /api/learning-progress` — current user's lesson records and aggregate summary.
- `GET /api/learning-progress/:lessonId` — restore one lesson's progress.
- `PUT /api/learning-progress/:lessonId` — persist trace position, algorithm inputs, quiz attempt and completed practice items.

### Stored mastery data
The MongoDB `LearningProgress` collection is uniquely indexed by `userId + lessonId`. It stores:
- Last algorithm and bounded input configuration, target and current trace step.
- Quiz attempt count, latest score, best score, mastery band, selected answers and the latest 30 score-history entries.
- Completed practice task identifiers and last activity timestamp.

The server derives mastery bands from quiz accuracy: below 50% = beginner, 50–79% = intermediate, 80%+ = advanced. The client cannot set the mastery score directly: the API loads the owned lesson's stored quiz answer key and grades submitted selections server-side. Quiz history retains the latest 30 attempts. Every database query is scoped to the authenticated Supabase user ID. The progress API fails closed with HTTP 503 when MongoDB is unavailable; it does not silently pretend that in-memory state is persistent.

## Phase 6: Secure multi-language code execution

### Architecture
The application server is an authenticated broker only. It validates request shape, enforces per-user request limits and forwards source to a separately deployed Judge0-compatible sandbox. It never uses eval, child_process, VM modules or local shell execution for learner code.

Supported languages:
| Language | Judge0 CE language ID |
|---|---:|
| Java (JDK 21) | 62 |
| JavaScript (Node.js) | 63 |
| Python 3 | 71 |

Request limits:
- Source code: 20 KB maximum.
- Standard input: 5 KB maximum.
- Per-user API limit: 8 executions per minute per app process.
- Provider response deadline: 18 seconds.
- Requested sandbox limits: 2 CPU seconds, 5 wall-clock seconds, 128 MB memory, 64 MB stack, 1 KB output file and network disabled.

The UI checks `GET /api/code-execution/status` and submits code to `POST /api/code-execution/run`. Provider output is decoded and truncated before returning to the browser.

### Required server environment
Configure a trusted, private or otherwise access-controlled Judge0 CE-compatible endpoint:
```env
CODE_EXECUTION_PROVIDER=judge0
CODE_EXECUTION_BASE_URL=https://your-judge0-host
CODE_EXECUTION_API_KEY=your-judge0-auth-token
```
The API key is optional for a self-hosted Judge0 instance configured without API authentication. Never put it in a `VITE_` variable or send it to the browser. The endpoint should use TLS, restrict inbound access to the application server, keep outbound networking disabled for submitted programs, and enforce the same or stricter CPU/memory/time limits. Do not expose an unauthenticated public Judge0 instance.

If these settings are absent, execution returns HTTP 503 and the UI disables Run. No source code is executed locally or sent to a provider until the operator configures this endpoint.

### Operational limitations
- The per-user rate limiter is process-local. For horizontally scaled production deployments, move the quota to a shared Redis-backed limiter or API gateway.
- Judge0 isolation depends on the actual host configuration and deployment security; the app cannot independently verify host-level sandbox settings.
- The current UI is a lightweight source editor, not a full IDE. It does not include arbitrary package installation, filesystem persistence or debugger support.
- These changes do not deploy or provision Judge0, create paid resources, configure secrets, merge the PR or deploy the app.

## Verification
Run:
```bash
npm run lint
npm run test:content-authoring
npm run build
```
The code-execution tests cover language allowlisting, payload size bounds, language mapping and fail-closed behavior when the sandbox is not configured.
