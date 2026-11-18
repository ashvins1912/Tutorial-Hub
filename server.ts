import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cognitiveRoutes from './server/routes/cognitiveRoutes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Cognitive Brain-Training & Spaced Repetition API
  app.use('/api/cognitive', cognitiveRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'patternforge-dsa' });
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
