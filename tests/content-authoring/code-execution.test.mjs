import test from 'node:test';
import assert from 'node:assert/strict';
import { JUDGE0_LANGUAGE_IDS, validateExecutionRequest, executeInJudge0 } from '../../server/services/codeExecution.service.ts';

test('accepts only the supported sandbox languages and bounded source', () => {
  assert.equal(validateExecutionRequest({ language: 'java', sourceCode: 'class Main {}' }).language, 'java');
  assert.equal(validateExecutionRequest({ language: 'javascript', sourceCode: 'console.log(1)' }).language, 'javascript');
  assert.equal(validateExecutionRequest({ language: 'python', sourceCode: 'print(1)' }).language, 'python');
  assert.throws(() => validateExecutionRequest({ language: 'bash', sourceCode: 'echo hi' }), /UNSUPPORTED_LANGUAGE/);
  assert.throws(() => validateExecutionRequest({ language: 'python', sourceCode: '' }), /SOURCE_CODE_REQUIRED/);
  assert.throws(() => validateExecutionRequest({ language: 'python', sourceCode: 'x'.repeat(20001) }), /SOURCE_CODE_TOO_LARGE/);
  assert.throws(() => validateExecutionRequest({ language: 'python', sourceCode: 'print(1)', stdin: 'x'.repeat(5001) }), /STDIN_TOO_LARGE/);
});

test('maps language IDs to Judge0 CE defaults', () => {
  assert.deepEqual(JUDGE0_LANGUAGE_IDS, { java: 62, javascript: 63, python: 71 });
});

test('does not execute code when the isolated provider is not configured', async () => {
  const previousProvider = process.env.CODE_EXECUTION_PROVIDER;
  const previousUrl = process.env.CODE_EXECUTION_BASE_URL;
  delete process.env.CODE_EXECUTION_PROVIDER;
  delete process.env.CODE_EXECUTION_BASE_URL;
  await assert.rejects(() => executeInJudge0({ language: 'python', sourceCode: 'print(1)', stdin: '' }), /CODE_EXECUTION_NOT_CONFIGURED/);
  if (previousProvider === undefined) delete process.env.CODE_EXECUTION_PROVIDER; else process.env.CODE_EXECUTION_PROVIDER = previousProvider;
  if (previousUrl === undefined) delete process.env.CODE_EXECUTION_BASE_URL; else process.env.CODE_EXECUTION_BASE_URL = previousUrl;
});
