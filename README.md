# Tutorial-Hub

Tutorial-Hub is an interactive engineering-learning platform focused on helping learners understand concepts, reason through problems, visualize system behavior, practice independently and build durable engineering skills.

The repository contains learning experiences for data structures and algorithms, interview preparation, programming languages, object-oriented design, databases, system design, full-stack architecture, DevOps/cloud and AI engineering. It also includes visual labs, a problem-solving studio, learner progress, interview sprints and community/collaboration features.

> **Learning principle:** Teach understanding, not memorization. Measure demonstrated capability, not content consumption.

## Learning areas

| Area | Examples |
|---|---|
| DSA and problem solving | Algorithm roadmaps, pattern tracks, interview problem banks, recursion and DP labs |
| Programming languages | Java/Python tutorials, collections, OOP, concurrency and runtime learning |
| Software design | SOLID, object-oriented design, design patterns and system design |
| Databases | SQL practice, query pipeline, indexes, transactions, deadlocks, recovery and vector search |
| Full stack | Framework/runtime internals, storage, architecture and polyglot code labs |
| DevOps and cloud | Cloud tutorials, CI/CD, Docker/Kubernetes and infrastructure learning |
| AI engineering | ML foundations, deep learning, LLMs, RAG, agents and MCP |
| Learning support | Visualizers, guided problem solving, revision, mastery review and interview sprints |

The exact completeness and verification state of each topic is tracked separately. A roadmap, question inventory or lesson blueprint must not be interpreted as a fully authored and technically verified lesson.

## Technology

- React 19, TypeScript and Vite.
- Express and TypeScript application server.
- Supabase Auth integration.
- MongoDB and Mongoose persistence.
- Zustand state management.
- Mermaid and React Flow-based diagrams/visual learning.
- Vitest is not assumed; the repository's current tests use Node's test runner with `tsx`.

## Repository layout

```text
src/
  App.tsx                 Application shell and view navigation
  auth/                   Authentication context and gates
  components/             Studios, labs, visualizers and shared UI
  core/                   Core learning/problem-solving logic
  data/                   Canonical curriculum and problem data
  features/               Feature-oriented academies and engines
  hooks/                  Reusable application hooks
  lib/                    API and client utilities
  store/                  Zustand state stores
server/
  routes/                 Express API route modules
  models/                 Mongoose models
  modules/                Domain modules such as content authoring
  services/               Server-side services
  seed/ and db/           Canonical seed and bootstrap logic
tests/
  content-authoring/      Content, learning runtime and security tests
  dsa/                    Verified DSA batch tests
docs/                     Architecture, curriculum, audits and standards
```

See:
- [Repository feature inventory](docs/REPOSITORY_FEATURE_INVENTORY_AND_GAP_REGISTER.md)
- [Perfect learning platform standard](docs/PERFECT_LEARNING_PLATFORM_STANDARD.md)
- [Master learning roadmap](docs/TUTORIAL_HUB_MASTER_LEARNING_ROADMAP.md)

## Prerequisites

- Node.js 22 (matches the repository CI workflow).
- npm (CI currently uses `npm install`; `bun.lock` is present but Bun is not required by the documented CI).
- A MongoDB database for persistent learner state and catalog features.
- A Supabase project for authentication.
- Java 21 and Python 3.12 are used by the CI environment for language-specific verification.

## Local setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Configure the existing Supabase and MongoDB values. Keep server secrets out of `VITE_*` variables and never commit real credentials.
5. Start the application:
   ```bash
   npm run dev
   ```
6. Open the local URL printed by Vite/Express (the server defaults to port 3000).

The application server attempts to connect to MongoDB and runs the existing catalog/content seeders during startup. For a meaningful persistent learner experience, configure the same intended Supabase project on frontend/backend and a working MongoDB connection.

## Environment configuration

Use `.env.example` as the authoritative variable list. Important groups:

- Supabase frontend configuration: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Server-side Supabase verification: `SUPABASE_URL` and the server-only key configuration described in `.env.example`.
- MongoDB: `MONGODB_URI`.
- Optional authoring controls: `CONTENT_AUTHOR_USER_IDS`, `CONTENT_AI_PROVIDER`, `CONTENT_AI_API_KEY`, `CONTENT_AI_BASE_URL`, `CONTENT_AI_MODEL`.
- Content bootstrap flags: `ENABLE_DB_CONTENT_PUSH_ON_STARTUP`, `ENABLE_DB_CONTENT_PULL`, `VITE_ENABLE_DB_CONTENT_PULL`.
- Problem catalog administration: `PROBLEM_CATALOG_ADMIN_TOKEN`.

Do not paste secrets into issues, PRs, source files or client-side variables. Leave optional AI generation unconfigured unless the feature is explicitly needed and approved. The example file notes that learner code execution is intentionally disabled on Render Free; do not enable unsafe execution as a workaround.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the server and Vite middleware for local development |
| `npm run build` | Build the frontend with Vite |
| `npm run preview` | Preview the built frontend |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run test:dsa:arrays:01` | Run verified DSA arrays batch 01 tests |
| `npm run test:content-authoring` | Run content-authoring and learning-runtime tests |
| `npm run audit:learning-surfaces` | Validate all typed TopView IDs and referenced registry paths |
| `npm run test:dsa:handwritten` | Validate source-aligned handwritten-notes DSA modules |
| `npm run test:dsa:inventory` | Verify the 293-question inventory, unique topic IDs/slugs and honest blueprint evidence states |

CI currently runs type-check, the arrays batch test, content-authoring tests, the DSA inventory integrity test, learning-surface inventory validation and production build. Do not assume that this proves all curriculum entries or all visualizers are verified.

## API overview

The server exposes route groups for authentication, user state, profile, community, learning progress, AI Academy progress, code-execution boundary, cognitive practice, problems, interview problems, content authoring, cached problem lookup, content bootstrap, solver, system design and interview sprints.

The health endpoint is `GET /api/health`. It reports application/database readiness and the pair-programming WebSocket path. In production, database readiness affects the health response.

## Safety and product boundaries

- Existing authentication and authorization are required for protected learner and authoring operations.
- Generated lesson content is not automatically technically verified.
- Keep authoritative assessment answers and grading on the server.
- Do not execute learner code in an unisolated application process or browser `eval`.
- The code execution route must remain within the explicitly documented safe/disabled boundary.
- Do not introduce paid providers, workers, hosting or infrastructure without explicit approval.
- Do not deploy or merge to `main` without the repository owner's approval.

## Contributing

1. Open an issue or describe the gap with the affected canonical topic/surface ID.
2. Check the canonical registry and existing data before adding a duplicate.
3. Preserve existing lesson IDs, saved progress and published links.
4. Add or update tests for the changed behavior and content contracts.
5. Run the relevant local checks and report exactly what was run.
6. Keep inventory, blueprint, authored, verified and published states distinct.
7. Use a review branch and submit a focused pull request with evidence, risks and known limitations.

A complete topic should meet the [Perfect Learning Platform Standard](docs/PERFECT_LEARNING_PLATFORM_STANDARD.md), with per-topic sign-off evidence. See the [repository inventory and gap register](docs/REPOSITORY_FEATURE_INVENTORY_AND_GAP_REGISTER.md) before expanding a domain.

## License

No license file was present in the inspected baseline. Until the repository owner selects and adds a license, do not assume that the code or learning content is open for reuse, redistribution or commercial use.
