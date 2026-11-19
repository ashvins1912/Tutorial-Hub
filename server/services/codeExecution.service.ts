export type SupportedCodeLanguage = 'java' | 'javascript' | 'python';
export const JUDGE0_LANGUAGE_IDS: Record<SupportedCodeLanguage, number> = { java: 62, javascript: 63, python: 71 };

export function validateExecutionRequest(input: unknown): { language: SupportedCodeLanguage; sourceCode: string; stdin: string } {
  if (!input || typeof input !== 'object') throw new Error('INVALID_EXECUTION_REQUEST');
  const value = input as Record<string, unknown>;
  if (!['java', 'javascript', 'python'].includes(String(value.language))) throw new Error('UNSUPPORTED_LANGUAGE');
  if (typeof value.sourceCode !== 'string' || !value.sourceCode.trim()) throw new Error('SOURCE_CODE_REQUIRED');
  if (value.sourceCode.length > 20_000) throw new Error('SOURCE_CODE_TOO_LARGE');
  if (value.stdin !== undefined && (typeof value.stdin !== 'string' || value.stdin.length > 5_000)) throw new Error('STDIN_TOO_LARGE');
  return { language: value.language as SupportedCodeLanguage, sourceCode: value.sourceCode, stdin: typeof value.stdin === 'string' ? value.stdin : '' };
}

function decodeOutput(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  try { return Buffer.from(value, 'base64').toString('utf8').slice(0, 12_000); }
  catch { return ''; }
}

function judge0Headers() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const apiKey = process.env.CODE_EXECUTION_API_KEY?.trim();
  if (apiKey) headers['X-Auth-Token'] = apiKey;
  return headers;
}

export async function executeInJudge0(input: { language: SupportedCodeLanguage; sourceCode: string; stdin: string }) {
  const configuredProvider = (process.env.CODE_EXECUTION_PROVIDER || '').trim().toLowerCase();
  const baseUrl = (process.env.CODE_EXECUTION_BASE_URL || '').trim().replace(/\/+$/, '');
  if (configuredProvider !== 'judge0' || !baseUrl) throw new Error('CODE_EXECUTION_NOT_CONFIGURED');
  let endpoint: URL;
  try { endpoint = new URL(baseUrl); } catch { throw new Error('CODE_EXECUTION_ENDPOINT_INVALID'); }
  const localDevelopmentEndpoint = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(endpoint.hostname);
  const allowedProtocol = endpoint.protocol === 'https:' || (localDevelopmentEndpoint && endpoint.protocol === 'http:');
  if (!allowedProtocol || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error('CODE_EXECUTION_ENDPOINT_MUST_USE_HTTPS');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const headers = judge0Headers();
    const payload = {
      source_code: Buffer.from(input.sourceCode, 'utf8').toString('base64'),
      stdin: Buffer.from(input.stdin, 'utf8').toString('base64'),
      language_id: JUDGE0_LANGUAGE_IDS[input.language],
      cpu_time_limit: 2,
      cpu_extra_time: 1,
      wall_time_limit: 5,
      memory_limit: 128000,
      stack_limit: 64000,
      max_processes_and_or_threads: 30,
      max_file_size: 1024,
      enable_network: false,
    };
    const submit = await fetch(`${baseUrl}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST', headers, body: JSON.stringify(payload), signal: controller.signal,
    });
    if (!submit.ok) throw new Error(`JUDGE0_SUBMIT_FAILED_${submit.status}`);
    const submitted = await submit.json() as { token?: string; status?: { id?: number; description?: string }; stdout?: string; stderr?: string; compile_output?: string; time?: string; memory?: number };
    let result = submitted;
    if (!submitted.token && (submitted.status?.id ?? 0) < 3) throw new Error('JUDGE0_RESPONSE_INVALID');
    if (submitted.token && (submitted.status?.id === undefined || submitted.status.id < 3)) {
      let finished = false;
      for (let attempt = 0; attempt < 25; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const poll = await fetch(`${baseUrl}/submissions/${encodeURIComponent(submitted.token)}?base64_encoded=true&fields=token,stdout,stderr,compile_output,status,time,memory`, {
          headers, signal: controller.signal,
        });
        if (!poll.ok) throw new Error(`JUDGE0_POLL_FAILED_${poll.status}`);
        result = await poll.json() as typeof result;
        if ((result.status?.id ?? 0) >= 3) { finished = true; break; }
      }
      if (!finished) throw new Error('JUDGE0_EXECUTION_PENDING');
    }
    return {
      status: result.status?.description || 'Unknown',
      statusId: result.status?.id ?? 0,
      stdout: decodeOutput(result.stdout),
      stderr: decodeOutput(result.stderr),
      compileOutput: decodeOutput(result.compile_output),
      time: typeof result.time === 'string' ? result.time : null,
      memory: typeof result.memory === 'number' ? result.memory : null,
    };
  } catch (error) {
    if (controller.signal.aborted) throw new Error('JUDGE0_TIMEOUT');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
