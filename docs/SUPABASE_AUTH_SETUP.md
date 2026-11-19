# Supabase authentication setup

Tutorial Hub uses Supabase Auth for identity and MongoDB for the application's account and learning data.

## 1. Create a Supabase project

1. Create a project in the Supabase dashboard.
2. Open **Project Settings → API**.
3. Copy the Project URL and publishable/anon key.
4. Copy the service-role key for the server only. Never expose this key to the browser or commit it.

## 2. Configure Supabase Auth

In **Authentication → URL Configuration**:

- Set the Site URL to the deployed Render service URL.
- Add the Render service URL to Redirect URLs.
- For local development, add `http://localhost:3000`.

Enable email/password sign-in. Email confirmation can remain enabled; new users will be asked to verify their email before their first session.

For Google sign-in, configure Google OAuth credentials in **Authentication → Providers → Google** and add the Supabase callback URL shown by the dashboard to the Google OAuth client.

## 3. Configure Render environment variables

Set these on the `tutorial-hub` Web Service:

| Variable | Where it is used |
| --- | --- |
| `VITE_SUPABASE_URL` | Browser Supabase client; available at build time |
| `VITE_SUPABASE_ANON_KEY` | Browser Supabase client; available at build time |
| `SUPABASE_URL` | Server-side token verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side token verification only; secret |
| `MONGODB_URI` | Persist account and learning profile documents |
| `GEMINI_API_KEY` | Optional Gemini-powered features |
| `NODE_ENV` | Set to `production` |

Redeploy after setting the `VITE_*` values because Vite embeds them into the frontend build.

## 4. Data flow

1. Sign-up and sign-in are performed by Supabase Auth.
2. The browser stores the Supabase session using the Supabase client.
3. Authenticated API requests send the Supabase access token as a Bearer token.
4. Express verifies the token with Supabase before allowing access to cognitive and sprint APIs.
5. `GET /api/auth/me` upserts the Supabase user ID, email, name and avatar into MongoDB's `UserAccount` collection and creates the user's `UserBrainProfile` if needed.
6. Learning profiles and sprints are keyed by the verified Supabase user ID, not a client-supplied user ID.

Supabase Auth remains the source of truth for credentials. Do not store passwords in MongoDB.

## 5. Authenticated API surface

All user-specific routes require `Authorization: Bearer <Supabase access token>`. The server verifies the token and derives the owner from its Supabase user ID; clients must not send a user ID to select an account.

| Route | Purpose |
| --- | --- |
| `GET /api/auth/me` | Upsert the account and initialise its learning profile |
| `GET /api/cognitive/profile` | Read the signed-in learner's cognitive profile |
| `POST /api/cognitive/complete-problem` | Record a completed problem and spaced-repetition update |
| `GET /api/cognitive/quiz/:topicId` / `GET /api/cognitive/quizzes` | Read quiz content |
| `POST /api/cognitive/quiz/submit` | Grade and persist quiz progress |
| `GET /api/cognitive/notes` / `GET /api/cognitive/notes/:problemId` | Read the learner's notes |
| `POST /api/cognitive/notes` | Create or update a note |
| `GET /api/cognitive/mastered-problems` / `POST /api/cognitive/mastered-problems` | Read or record mastered Big Tech problems |
| `POST /api/cognitive/warmup/complete` | Record a completed warm-up drill |
| `GET /api/sprints/companies/meta` | Read sprint company metadata |
| `POST /api/sprints/create` | Create a 14-day sprint for the signed-in user |
| `GET /api/sprints/active` | Read the signed-in user's active sprint |
| `PATCH /api/sprints/:sprintId/complete-task` | Complete a task belonging to the signed-in user's sprint |

The public read-only `/api/problems` catalogue and cached `/api/leetcode/problem/:slug` statement proxy do not contain user data and do not require a session.

In production, MongoDB is required. The service fails startup when `MONGODB_URI` is missing or unreachable, and `/api/health` reports HTTP 503 if database readiness is lost. Learning progress and sprint mutations are not silently replaced with browser-only writes.

## 6. Verify

After deployment:

- Visit the Render URL and create an account.
- Confirm the email if confirmation is enabled.
- Sign in and verify that the app opens.
- Call `/api/health`; it should report MongoDB storage mode.
- In MongoDB, confirm `UserAccount` and `UserBrainProfile` documents were created for the new Supabase user ID.
- Sign out and verify that the login screen appears.
