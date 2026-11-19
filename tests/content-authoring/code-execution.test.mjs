import test from 'node:test';
import assert from 'node:assert/strict';
import { getCodeExecutionStatus, validateExecutionRequest, executeCode } from '../../server/services/codeExecution.service.ts';

test('accepts only supported editor languages and bounded source', () => {
  assert.equal(validateExecutionRequest({ language: 'java', sourceCode: 'class Main {}' }).language, 'java');
  assert.equal(validateExecutionRequest({ language: 'javascript', sourceCode: 'console.log(1)' }).language, 'javascript');
  assert.equal(validateExecutionRequest({ language: 'python', sourceCode: 'print(1)' }).language, 'python');
  assert.throws(() => validateExecutionRequest({ language: 'bash', sourceCode: 'echo hi' }), /UNSUPPORTED_LANGUAGE/);
  assert.throws(() => validateExecutionRequest({ language: 'python', sourceCode: '' }), /SOURCE_CODE_REQUIRED/);
  assert.throws(() => validateExecutionRequest({ language: 'python', sourceCode: 'x'.repeat(20001) }), /SOURCE_CODE_TOO_LARGE/);
  assert.throws(() => validateExecutionRequest({ language: 'python', sourceCode: 'print(1)', stdin: 'x'.repeat(5001) }), /STDIN_TOO_LARGE/);
});

test('reports code execution as unavailable on Render Free for all editor languages', () => {
  const status = getCodeExecutionStatus();
  assert.equal(status.available, false);
  assert.equal(status.provider, null);
  assert.deepEqual(status.languages, ['java', 'javascript', 'python']);
  assert.equal(status.reason, 'SANDBOX_NOT_AVAILABLE_ON_RENDER_FREE');
});

test('fails closed even if legacy external Judge0 environment variables are present', async () => {
  const previousProvider = process.env.CODE_EXECUTION_PROVIDER;
  const previousUrl = process.env.CODE_EXECUTION_BASE_URL;
  const previousKey = process.env.CODE_EXECUTION_API_KEY;
  process.env.CODE_EXECUTION_PROVIDER = 'judge0';
  process.env.CODE_EXECUTION_BASE_URL = 'https://example.invalid';
  process.env.CODE_EXECUTION_API_KEY = 'must-not-be-used';
  await assert.rejects(
    () => executeCode({ language: 'python', sourceCode: 'print(1)', stdin: '' }),
    /CODE_EXECUTION_UNAVAILABLE_ON_RENDER_FREE/,
  );
  if (previousProvider === undefined) delete process.env.CODE_EXECUTION_PROVIDER; else process.env.CODE_EXECUTION_PROVIDER = previousProvider;
  if (previousUrl === undefined) delete process.env.CODE_EXECUTION_BASE_URL; else process.env.CODE_EXECUTION_BASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.CODE_EXECUTION_API_KEY; else process.env.CODE_EXECUTION_API_KEY = previousKey;
});
