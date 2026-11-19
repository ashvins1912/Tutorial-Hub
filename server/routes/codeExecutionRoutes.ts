import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { executeInJudge0, validateExecutionRequest } from '../services/codeExecution.service';

const router = express.Router();
const requestWindows = new Map<string, { startedAt: number; count: number }>();
router.use(requireAuth);

function allowExecution(userId: string) {
  const now = Date.now();
  if (requestWindows.size > 5000) {
    for (const [id, value] of requestWindows) if (now - value.startedAt > 60_000) requestWindows.delete(id);
  }
  const current = requestWindows.get(userId);
  if (!current || now - current.startedAt >= 60_000) {
    requestWindows.set(userId, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}

router.get('/status', (_req, res) => {
  const rawBaseUrl = (process.env.CODE_EXECUTION_BASE_URL || '').trim();
  let secureEndpoint = false;
  try {
    const endpoint = new URL(rawBaseUrl);
    const localDevelopmentEndpoint = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(endpoint.hostname);
    const allowedProtocol = endpoint.protocol === 'https:' || (localDevelopmentEndpoint && endpoint.protocol === 'http:');
    secureEndpoint = allowedProtocol && !endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash;
  } catch { secureEndpoint = false; }
  const configured = (process.env.CODE_EXECUTION_PROVIDER || '').trim().toLowerCase() === 'judge0' && secureEndpoint;
  return res.json({ configured, provider: configured ? 'judge0' : null, languages: ['java', 'javascript', 'python'] });
});

router.post('/run', async (req: Request, res: Response) => {
  if (!allowExecution(req.authUser!.id)) return res.status(429).json({ code: 'EXECUTION_RATE_LIMIT', message: 'Limit reached. Try again in one minute.' });
  let input;
  try { input = validateExecutionRequest(req.body); }
  catch (error) {
    const code = error instanceof Error ? error.message : 'INVALID_EXECUTION_REQUEST';
    return res.status(400).json({ code, message: code.replaceAll('_', ' ').toLowerCase() });
  }
  try {
    const result = await executeInJudge0(input);
    return res.json({ result });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'CODE_EXECUTION_FAILED';
    if (code === 'CODE_EXECUTION_NOT_CONFIGURED' || code === 'CODE_EXECUTION_ENDPOINT_INVALID' || code === 'CODE_EXECUTION_ENDPOINT_MUST_USE_HTTPS') return res.status(503).json({ code: 'CODE_EXECUTION_CONFIGURATION_INVALID', message: 'Configure a valid HTTPS Judge0 endpoint before running code.' });
    if (code === 'JUDGE0_TIMEOUT' || code === 'JUDGE0_EXECUTION_PENDING') return res.status(504).json({ code, message: 'Execution exceeded the response time limit. Try a smaller program.' });
    console.error('[code-execution] Provider request failed:', code);
    return res.status(502).json({ code: 'CODE_EXECUTION_PROVIDER_UNAVAILABLE', message: 'The isolated execution provider is temporarily unavailable.' });
  }
});

export default router;
