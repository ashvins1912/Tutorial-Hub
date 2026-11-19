import 'dotenv/config';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectMongo, isMongoConnected } from './server/db/connectMongo';
import cognitiveRoutes from './server/routes/cognitiveRoutes';
import problemRoutes from './server/routes/problemRoutes';
import leetcodeProblemRoutes from './server/routes/leetcodeProblemRoutes';
import sprintRoutes from './server/routes/sprintRoutes';
import authRoutes from './server/routes/authRoutes';
import userStateRoutes from './server/routes/userStateRoutes';
import { attachPairWebSocketServer } from './server/ws/pairRoomServer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectMongo();

  const app = express();
  const httpServer = http.createServer(app);
  attachPairWebSocketServer(httpServer);

  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/user-state', userStateRoutes);

  // Cognitive Brain-Training & Spaced Repetition API
  app.use('/api/cognitive', cognitiveRoutes);

  // Big Tech Topic-Wise 36 Problem Bank API
  app.use('/api/problems', problemRoutes);
  // Cached, read-only LeetCode statement/examples/constraints source
  app.use('/api/leetcode/problem', leetcodeProblemRoutes);

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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`PatternForge DSA server + WebSocket running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
