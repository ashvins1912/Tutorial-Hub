import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../middleware/requireAuth';
import { consumeSystemDesignAiRequest } from '../services/systemDesignAiRateLimit';

const router = Router();

export type ArchitectureExplainFocus =
  | 'full-walkthrough'
  | 'data-flow'
  | 'failure-modes'
  | 'scaling-bottlenecks';

interface ExplainArchitectureRequestBody {
  architectureTitle?: unknown;
  sourceWorkspace?: unknown;
  domain?: unknown;
  scaleContext?: unknown;
  summary?: unknown;
  components?: unknown;
  connections?: unknown;
  mermaidDiagram?: unknown;
  focus?: unknown;
}

function clampString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function clampStringList(value: unknown, maxItems: number, maxItemLen: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item) => (typeof item === 'string' ? item.trim().slice(0, maxItemLen) : ''))
    .filter(Boolean);
}

function normalizeFocus(value: unknown): ArchitectureExplainFocus {
  if (
    value === 'data-flow' ||
    value === 'failure-modes' ||
    value === 'scaling-bottlenecks'
  ) {
    return value;
  }
  return 'full-walkthrough';
}

function focusInstructions(focus: ArchitectureExplainFocus): string {
  switch (focus) {
    case 'data-flow':
      return 'Focus deeply on the step-by-step data lifecycle: request payload shape, cache lookup/invalidation logic, database read/write path, indexing/partitioning mechanics, WAL/replication durability, and async event handoffs.';
    case 'failure-modes':
      return 'Focus deeply on step-by-step resilience & failure walkthrough: walk through what happens at each hop when a dependency degrades (cache stampede, DB primary failover, broker lag, slow downstream), including circuit breakers, idempotency keys, retries, and graceful degradation.';
    case 'scaling-bottlenecks':
      return 'Focus deeply on step-by-step scaling logic: pinpoint where CPU, IOPS, lock contention, hot keys, or network fan-out bottlenecks emerge as traffic grows 10x-100x, and walk through the exact architectural techniques that eliminate each bottleneck.';
    case 'full-walkthrough':
    default:
      return 'Provide a clear, logical, end-to-end step-by-step request walkthrough from client entry through edge routing, application compute, caching/messaging, database persistence, and response return.';
  }
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : 'Failed to generate architecture explanation.';
  const lower = raw.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message:
        'Gemini API authorization failed. Please verify your Gemini API key in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return {
      status: 429,
      message:
        'Gemini API quota limit reached. Please wait a moment and retry, or check your API key tier in Settings > Secrets.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 404,
      message: 'Requested Gemini model was not found. Please retry shortly.',
    };
  }
  return {
    status: 502,
    message: raw,
  };
}

/**
 * POST /api/system-design/explain
 * Streams a text-based, step-by-step architectural logic walkthrough via Server-Sent Events (SSE)
 * using @google/genai (gemini-4-hydrogen) strictly on the server.
 */
router.post('/explain', requireAuth, async (req, res) => {
  try {
    const rate = await consumeSystemDesignAiRequest(req.authUser!.id);
    if (!rate.allowed) {
      res.set('Retry-After', String(rate.retryAfterSeconds));
      return res.status(429).json({ code: 'SYSTEM_DESIGN_AI_RATE_LIMITED', error: 'AI walkthrough limit reached. Please retry shortly.' });
    }
  } catch {
    return res.status(503).json({ code: 'SYSTEM_DESIGN_AI_RATE_LIMIT_UNAVAILABLE', error: 'AI walkthroughs are temporarily unavailable. Please retry shortly.' });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      error:
        'GEMINI_API_KEY is not configured on the server. Add your Gemini API key in Settings > Secrets to enable AI architecture walkthroughs.',
    });
    return;
  }

  const body = (req.body ?? {}) as ExplainArchitectureRequestBody;
  const architectureTitle = clampString(body.architectureTitle, 200);
  if (!architectureTitle) {
    res.status(400).json({ error: 'architectureTitle is required.' });
    return;
  }

  const sourceWorkspace = clampString(body.sourceWorkspace, 120) || 'System Design Studio';
  const domain = clampString(body.domain, 120);
  const scaleContext = clampString(body.scaleContext, 240);
  const summary = clampString(body.summary, 1200);
  const components = clampStringList(body.components, 24, 240);
  const connections = clampStringList(body.connections, 32, 240);
  const mermaidDiagram = clampString(body.mermaidDiagram, 3500);
  const focus = normalizeFocus(body.focus);

  const systemInstruction = [
    'You are a Principal Systems Architect writing a crisp, deeply technical, plain-English step-by-step logic walkthrough for engineers studying a production system architecture.',
    'Format requirements:',
    '- Start with a brief "## Architecture Mental Model" (2-3 sentences summarizing the core design thesis).',
    '- Follow with "## Step-by-Step Logic Walkthrough" containing 5 to 7 numbered steps (`1. **Phase Name — Component**: ...`). Each step must explain: what triggers it, the exact internal decision/algorithm or protocol logic happening at that hop, and what passes to the next hop.',
    '- Finish with "## Key Trade-offs & Guardrails" (3 concise bullet points covering consistency, latency, or failure protection).',
    '- Keep the total response focused and scannable (roughly 450–700 words).',
    '- Use plain text and clean Markdown headings, bold emphasis, inline code, and numbered lists only. Do not emit Mermaid code fences.',
  ].join('\n');

  const promptParts = [
    `Architecture: ${architectureTitle}`,
    `Studio Context: ${sourceWorkspace}`,
    domain ? `Domain: ${domain}` : '',
    scaleContext ? `Scale & Targets: ${scaleContext}` : '',
    summary ? `Overview:\n${summary}` : '',
    components.length > 0 ? `Components & Responsibilities:\n- ${components.join('\n- ')}` : '',
    connections.length > 0 ? `Key Connections & Data Flows:\n- ${connections.join('\n- ')}` : '',
    mermaidDiagram ? `Reference Architecture Graph:\n${mermaidDiagram}` : '',
    `Walkthrough Focus:\n${focusInstructions(focus)}`,
  ].filter(Boolean);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Attempt opening the Gemini stream with one brief retry for transient upstream blips before sending SSE headers
  let stream: AsyncIterable<{ text?: string }> | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      stream = await ai.models.generateContentStream({
        model: 'gemini-4-hydrogen',
        contents: promptParts.join('\n\n'),
        config: {
          systemInstruction,
        },
      });
      break;
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message.toLowerCase() : '';
      const isNonRetryable =
        errMsg.includes('api_key_invalid') ||
        errMsg.includes('permission_denied') ||
        errMsg.includes('not_found') ||
        errMsg.includes('400') ||
        errMsg.includes('403') ||
        errMsg.includes('404');
      if (isNonRetryable || attempt === 1) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  if (!stream) {
    const formatted = formatGeminiError(lastError);
    res.status(formatted.status).json({ error: formatted.message });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let clientClosed = false;
  req.on('close', () => {
    clientClosed = true;
  });

  try {
    res.write(`data: ${JSON.stringify({ type: 'meta', model: 'gemini-4-hydrogen' })}\n\n`);

    let totalChars = 0;
    for await (const chunk of stream) {
      if (clientClosed) break;
      const text = chunk.text ?? '';
      if (text) {
        totalChars += text.length;
        res.write(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
      }
    }

    if (!clientClosed) {
      if (totalChars === 0) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', error: 'Gemini returned an empty walkthrough response.' })}\n\n`
        );
      } else {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      }
      res.end();
    }
  } catch (err) {
    if (!clientClosed) {
      const formatted = formatGeminiError(err);
      res.write(`data: ${JSON.stringify({ type: 'error', error: formatted.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
