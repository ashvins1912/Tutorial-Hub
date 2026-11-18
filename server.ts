import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectMongo, isMongoConnected } from './server/db/connectMongo';
import cognitiveRoutes from './server/routes/cognitiveRoutes';
import problemRoutes from './server/routes/problemRoutes';
import sprintRoutes from './server/routes/sprintRoutes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function startServer() {
  await connectMongo();

  const app = express();
  app.use(express.json());

  // Cognitive Brain-Training & Spaced Repetition API
  app.use('/api/cognitive', cognitiveRoutes);

  // Big Tech Topic-Wise 36 Problem Bank API
  app.use('/api/problems', problemRoutes);

  // 14-Day Company-Specific Sprint Generator & War-Room API
  app.use('/api/sprints', sprintRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'patternforge-dsa',
      storageMode: isMongoConnected() ? 'mongodb' : 'in-memory',
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PatternForge DSA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
