import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { executeCode, getCodeExecutionStatus, validateExecutionRequest } from '../services/codeExecution.service';

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

router.get('/status', (_req, res) => res.json(getCodeExecutionStatus()));

router.post('/run', async (req: Request, res: Response) => {
  if (!allowExecution(req.authUser!.id)) {
    return res.status(429).json({ code: 'EXECUTION_RATE_LIMIT', message: 'Limit reached. Try again in one minute.' });
  }
  let input;
  try {
    input = validateExecutionRequest(req.body);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'INVALID_EXECUTION_REQUEST';
    return res.status(400).json({ code, message: code.replaceAll('_', ' ').toLowerCase() });
  }
  try {
    const result = await executeCode(input);
    return res.json({ result });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'CODE_EXECUTION_FAILED';
    if (code === 'CODE_EXECUTION_UNAVAILABLE_ON_RENDER_FREE') {
      return res.status(503).json({
        code,
        message: 'Code execution is currently unavailable on Render Free. Your code has not been executed.',
      });
    }
    console.error('[code-execution] Request rejected:', code);
    return res.status(503).json({ code: 'CODE_EXECUTION_UNAVAILABLE', message: 'Secure code execution is unavailable.' });
  }
});

export default router;
