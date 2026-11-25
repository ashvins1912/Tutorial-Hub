import 'dotenv/config';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectMongo, isMongoConnected } from './server/db/connectMongo';
import { seedCatalogToDb } from './server/db/seedCatalog';
import cognitiveRoutes from './server/routes/cognitiveRoutes';
import problemRoutes from './server/routes/problemRoutes';
import leetcodeProblemRoutes from './server/routes/leetcodeProblemRoutes';
import sprintRoutes from './server/routes/sprintRoutes';
import interviewProblemRoutes from './server/routes/interviewProblemRoutes';
import contentAuthoringRoutes from './server/modules/content-authoring/contentAuthoring.routes';
import { seedMasterInterviewProblems } from './server/db/seedMasterInterviewProblems';
import { seedVerifiedProblemBatches } from './server/db/seedVerifiedProblemBatches';
import authRoutes from './server/routes/authRoutes';
import userStateRoutes from './server/routes/userStateRoutes';
import profileRoutes from './server/routes/profileRoutes';
import communityRoutes from './server/routes/communityRoutes';
import learningProgressRoutes from './server/routes/learningProgressRoutes';
import learningEngineRoutes from './server/routes/learningEngineRoutes';
import aiAcademyProgressRoutes from './server/routes/aiAcademyProgressRoutes';
import { AIAcademyProgress } from './server/models/AIAcademyProgress';
import { AIAcademyRateLimit } from './server/models/AIAcademyRateLimit';
import codeExecutionRoutes from './server/routes/codeExecutionRoutes';
import contentBootstrapRoutes from './server/routes/contentBootstrapRoutes';
import universalSolverRoutes from './server/routes/universalSolverRoutes';
import systemDesignAiRoutes from './server/routes/systemDesignAiRoutes';
import { seedPlatformContentOnStartup } from './server/db/seedPlatformContent';
import { attachPairWebSocketServer } from './server/ws/pairRoomServer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectMongo();
  if (isMongoConnected()) await Promise.all([AIAcademyProgress.init(), AIAcademyRateLimit.init()]);
  await seedCatalogToDb();
  await seedMasterInterviewProblems();
  await seedVerifiedProblemBatches();
  await seedPlatformContentOnStartup();

  const app = express();
  const httpServer = http.createServer(app);
  attachPairWebSocketServer(httpServer);

  app.use(express.json({ limit: '2mb' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/user-state', userStateRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/learning-progress', learningProgressRoutes);
  app.use('/api/learning', learningEngineRoutes);
  app.use('/api/ai-academy/progress', aiAcademyProgressRoutes);
  app.use('/api/code-execution', codeExecutionRoutes);

  // Cognitive Brain-Training & Spaced Repetition API
  app.use('/api/cognitive', cognitiveRoutes);

  // Big Tech Topic-Wise 36 Problem Bank API
  app.use('/api/problems', problemRoutes);
  // Canonical topic-wise interview problem inventory and authoring API
  app.use('/api/interview-problems', interviewProblemRoutes);
  // Intelligent Content Studio: authenticated, author-allowlisted knowledge ingestion.
  app.use('/api/authoring', contentAuthoringRoutes);
  // Cached, read-only LeetCode statement/examples/constraints source
  app.use('/api/leetcode/problem', leetcodeProblemRoutes);

  // Flag-controlled DB Content Push & Startup Pull Bootstrap API
  app.use('/api/content-bootstrap', contentBootstrapRoutes);

  // Universal Problem Solver URL Fetcher (LeetCode & GFG) + Optional AI Logic Coach
  app.use('/api/solver', universalSolverRoutes);

  // System Design Studio — Server-Side Gemini Architecture Walkthrough SSE API
  app.use('/api/system-design', systemDesignAiRoutes);

  // 14-Day Company-Specific Sprint Generator & War-Room API
  app.use('/api/sprints', sprintRoutes);

  app.get('/api/health', (_req, res) => {
    const databaseReady = isMongoConnected();
    const production = process.env.NODE_ENV === 'production';
    const status = databaseReady || !production ? 200 : 503;
    res.status(status).json({
      ok: databaseReady || !production,
      service: 'patternforge-dsa',
      storageMode: databaseReady ? 'mongodb' : 'in-memory',
      databaseReady,
      pairWs: '/ws/pair',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const assetsPath = path.join(distPath, 'assets');

    // Hashed Vite chunks are immutable; missing old hashes must return 404 (never index.html)
    app.use(
      '/assets',
      express.static(assetsPath, {
        maxAge: '1y',
        immutable: true,
        fallthrough: false,
      }),
      (
        _err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        res.status(404).type('text/plain').send('Asset chunk not found');
      }
    );

    // Other static files (prevent browser caching index.html across redeploys)
    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          }
        },
      })
    );

    app.get('*', (req, res) => {
      // Never serve HTML fallback for missing API or static asset extensions
      if (req.path.startsWith('/api/') || /\.[a-z0-9]{2,6}$/i.test(req.path)) {
        res.status(404).type('text/plain').send('Not found');
        return;
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`PatternForge DSA server + WebSocket running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
