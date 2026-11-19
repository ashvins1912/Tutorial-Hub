export type SupportedCodeLanguage = 'java' | 'javascript' | 'python';

export const SUPPORTED_CODE_LANGUAGES: SupportedCodeLanguage[] = ['java', 'javascript', 'python'];

export interface CodeExecutionRequest {
  language: SupportedCodeLanguage;
  sourceCode: string;
  stdin: string;
}

export interface CodeExecutionProvider {
  readonly id: string;
  execute(input: CodeExecutionRequest): Promise<{
    status: string;
    statusId: number;
    stdout: string;
    stderr: string;
    compileOutput: string;
    time: string | null;
    memory: number | null;
  }>;
}

export function validateExecutionRequest(input: unknown): CodeExecutionRequest {
  if (!input || typeof input !== 'object') throw new Error('INVALID_EXECUTION_REQUEST');
  const value = input as Record<string, unknown>;
  if (!SUPPORTED_CODE_LANGUAGES.includes(String(value.language) as SupportedCodeLanguage)) throw new Error('UNSUPPORTED_LANGUAGE');
  if (typeof value.sourceCode !== 'string' || !value.sourceCode.trim()) throw new Error('SOURCE_CODE_REQUIRED');
  if (value.sourceCode.length > 20_000) throw new Error('SOURCE_CODE_TOO_LARGE');
  if (value.stdin !== undefined && (typeof value.stdin !== 'string' || value.stdin.length > 5_000)) throw new Error('STDIN_TOO_LARGE');
  return {
    language: value.language as SupportedCodeLanguage,
    sourceCode: value.sourceCode,
    stdin: typeof value.stdin === 'string' ? value.stdin : '',
  };
}

export function getCodeExecutionStatus() {
  return {
    available: false,
    provider: null,
    languages: SUPPORTED_CODE_LANGUAGES,
    reason: 'SANDBOX_NOT_AVAILABLE_ON_RENDER_FREE',
    message: 'Secure arbitrary-code sandboxing is not enabled on the current Render Free deployment.',
  };
}

/**
 * Render Free does not provide a verified isolation boundary for arbitrary learner code.
 * Keep the provider contract for a future sandbox implementation, but fail closed here.
 * Never fall back to eval, child_process, vm, a shell, or the application process.
 */
export async function executeCode(_input: CodeExecutionRequest): Promise<never> {
  throw new Error('CODE_EXECUTION_UNAVAILABLE_ON_RENDER_FREE');
}
