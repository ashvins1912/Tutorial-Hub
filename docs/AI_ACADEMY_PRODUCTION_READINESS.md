# AI Engineering Academy — production readiness and curriculum scope

This document describes the current Academy release boundary. It deliberately uses the existing Tutorial Hub architecture: React/TypeScript/Vite, the existing Supabase Auth project, Express and the existing MongoDB connection. It does not add an identity provider, external service, paid API, worker, hosting resource or runtime dependency.

## Curriculum delivered in this branch

The Academy now contains seven sequential phases and 68 structured lessons:

1. **Foundations** — Python, numerical computing, linear algebra, probability, statistics, data contracts and reproducible pipelines.
2. **Classical Machine Learning** — supervised and unsupervised learning, model selection, regularization, imbalance, thresholding and calibration.
3. **Deep Learning** — neural networks, backpropagation, CNNs, transformers, optimization, regularization and representation learning.
4. **Generative AI** — tokenization, prompting, LLM decoding, embeddings, RAG fundamentals and fine-tuning trade-offs.
5. **MLOps & Production** — model serving, container/resource planning, observability, security, CI/CD, canary releases, SLOs and inference budgets.
6. **Advanced RAG & Knowledge Systems** — document parsing/OCR, provenance, structural chunking, embedding/vector indexes, BM25, hybrid retrieval, reranking, GraphRAG, Visual RAG, evaluation and tenant isolation.
7. **AI Agents & Agentic Systems** — agent architecture and loops, tool contracts, planning, durable workflows, memory, multi-agent coordination, human approvals, prompt-injection defense, evaluation, production architecture, protocol concepts and capstone.

Every new lesson uses the existing lesson runtime contract: motivation, analogy, detailed explanation, key points, worked example, runnable-style code sample, staged visual flow with input/output/failure states, server-graded quiz, applied project, pitfalls and next topic. The curriculum is authored content; it does not execute lesson code.

## Production controls implemented

- Account progress remains authenticated through the existing Supabase token verification middleware. User identity is derived from the verified Supabase user, not request-body identifiers.
- Quiz answer keys remain server-side. The browser submits an option index; the server grades it.
- The progress API validates lesson IDs against the server-owned quiz registry and rejects malformed or extra request fields.
- Database failures return explicit unavailable responses rather than fake local persistence.
- Progress reads no longer return the user ID field.
- Progress read/write operations catch database errors and return controlled service errors.
- Per-user progress API rate limiting uses atomic MongoDB minute buckets (60 requests per user per minute) and a TTL index for cleanup. This works across application instances sharing the same MongoDB database; it is not an IP or general API rate limiter.
- Progress and rate-limit indexes are initialized during startup after the existing MongoDB connection is established. A unique user/lesson index protects upserts from duplicate progress rows.
- Curriculum tests enforce seven phases, minimum lesson/module coverage, unique lesson IDs, rich lesson sections, and exact parity between all lesson IDs and server-side quiz keys.
- No arbitrary code execution was added. The Render Free code lab remains explicitly unavailable as required by the existing project boundary.

## Release gates that still require the actual deployment environment

These are operational verification steps, not requests to introduce new providers or infrastructure.

### Existing Supabase configuration
- [ ] Confirm the deployed frontend and backend point to the same existing Supabase project.
- [ ] Verify the existing public/anon API key is configured on the backend where possible; keep service-role credentials server-only and never expose them in Vite variables.
- [ ] Verify login, token refresh, expired-session rejection and sign-out against the deployed origin.
- [ ] Confirm all Academy progress routes require a verified bearer token and that one user cannot read or mutate another user's progress.

### Existing MongoDB configuration
- [ ] Confirm the existing `MONGODB_URI` uses TLS and a database user with only the permissions required by this application.
- [ ] Confirm `AIAcademyProgress` unique compound index and `AIAcademyRateLimit` unique/TTL indexes exist in the production database.
- [ ] Check for pre-existing duplicate progress rows before creating the unique index; reconcile duplicates deliberately rather than dropping data.
- [ ] Verify automated backups and perform a restore drill before relying on account-level mastery as durable learner records.
- [ ] Set connection pool limits and verify connection behavior under expected concurrent learner traffic.

### Application and operational checks
- [ ] Configure all existing environment variables through the current host's secret settings; do not commit secrets.
- [ ] Verify HTTPS, production origin, CORS allowlist, secure session behavior and SPA deep-link routing.
- [ ] Run the production build and type-check from the exact commit being released.
- [ ] Run the DSA verification suite and all Content Studio/Academy tests.
- [ ] Smoke-test progress GET, completion PUT, quiz PUT, unknown lesson, malformed payload, 401, 429 and MongoDB-unavailable behavior.
- [ ] Load-test progress reads/writes at the expected concurrent learner count; confirm the MongoDB minute-bucket rate limit and database indexes behave as expected.
- [ ] Add host-level uptime/error monitoring and review redacted server logs; never log bearer tokens, service-role keys or full private learner payloads.
- [ ] Confirm privacy notice, retention policy, learner data export/deletion handling and backup retention match the existing product policy.

### Curriculum and agentic safety review
- [ ] Have a subject-matter reviewer validate technical accuracy, code examples and quiz answer keys before publishing the new material to learners.
- [ ] Review the RAG and agent security lessons against the actual product threat model.
- [ ] Keep all agent tools in the curriculum as local/mock examples unless separately approved and secured.
- [ ] Do not enable real external actions, arbitrary shell/code execution, payment, email or data mutation through an agent.
- [ ] Require explicit human approval for consequential actions in any future real agent implementation.

## Important boundary: learning content versus deployed AI services

Phase 6 teaches how to engineer OCR/document ingestion, embeddings, BM25, hybrid retrieval, reranking, GraphRAG, Visual RAG and tenant isolation. Adding these lessons does **not** deploy a RAG backend or connect a new vector database.

Phase 7 teaches agentic architectures and includes local/mock examples. It does **not** add an agent runtime, model provider, MCP server, queue, worker or external tool integration.

The code execution service remains disabled. The Academy must not imply that learner-supplied code or generated agent actions are executed by the platform.

## Release decision

The branch is ready for code review and CI validation. It should not be described as production-approved until the environment-specific Supabase and MongoDB checks, backup/restore drill, load/security tests and curriculum review above are completed. No deployment or infrastructure provisioning is performed by this change.
