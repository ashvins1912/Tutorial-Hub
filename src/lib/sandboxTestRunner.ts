import type { TestCase, TestSuite } from '../../shared/learningContract';

/**
 * Isolated Client-Side Browser Web Worker Test Runner
 * Executes learner JavaScript strictly inside a disposable, timeout-bounded
 * browser Web Worker with network & storage globals shadowed.
 * Never executes untrusted code on the Express backend process.
 */

export interface TestCaseExecutionResult {
  caseId: string;
  name: string;
  passed: boolean;
  isEdgeCase: boolean;
  isBoundary: boolean;
  inputDisplay: string;
  expectedDisplay: string;
  actualDisplay: string;
  runtimeMs: number;
  error?: string;
}

export interface SuiteExecutionReport {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  edgeCasesPassed: number;
  totalRuntimeMs: number;
  results: TestCaseExecutionResult[];
  fatalError?: string;
}

const WORKER_SCRIPT = `
'use strict';
// Lock down network and external script loading inside the sandbox worker
const blocked = () => { throw new Error('Network and external I/O are disabled in the verification sandbox.'); };
self.fetch = blocked;
self.importScripts = blocked;
self.XMLHttpRequest = function() { blocked(); };
self.WebSocket = function() { blocked(); };
self.EventSource = function() { blocked(); };

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}

function compareValues(actual, expected, comparator) {
  if (comparator === 'unordered-array' && Array.isArray(actual) && Array.isArray(expected)) {
    const sA = [...actual].sort((x, y) => String(x).localeCompare(String(y)));
    const sB = [...expected].sort((x, y) => String(x).localeCompare(String(y)));
    return deepEqual(sA, sB);
  }
  return deepEqual(actual, expected);
}

self.onmessage = function(event) {
  const { sourceCode, fnName, comparator, cases } = event.data;
  try {
    const factory = new Function(
      '"use strict";\\n' + sourceCode + '\\nreturn typeof ' + fnName + ' === "function" ? ' + fnName + ' : null;'
    );
    const userFn = factory();
    if (typeof userFn !== 'function') {
      self.postMessage({ fatalError: 'Function "' + fnName + '" was not found. Keep the exact function signature.' });
      return;
    }

    const results = [];
    let totalRuntimeMs = 0;
    for (const tc of cases) {
      const clonedArgs = JSON.parse(JSON.stringify(tc.args));
      const t0 = performance.now();
      try {
        const actual = userFn(...clonedArgs);
        const elapsed = Math.max(0.01, Number((performance.now() - t0).toFixed(2)));
        totalRuntimeMs += elapsed;
        const passed = compareValues(actual, tc.expected, comparator);
        results.push({
          caseId: tc.id,
          name: tc.name,
          passed,
          isEdgeCase: Boolean(tc.isEdgeCase),
          isBoundary: Boolean(tc.isBoundary),
          inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
          expectedDisplay: JSON.stringify(tc.expected),
          actualDisplay: actual === undefined ? 'undefined' : JSON.stringify(actual),
          runtimeMs: elapsed,
        });
      } catch (err) {
        const elapsed = Math.max(0.01, Number((performance.now() - t0).toFixed(2)));
        totalRuntimeMs += elapsed;
        results.push({
          caseId: tc.id,
          name: tc.name,
          passed: false,
          isEdgeCase: Boolean(tc.isEdgeCase),
          isBoundary: Boolean(tc.isBoundary),
          inputDisplay: tc.args.map((a) => JSON.stringify(a)).join(', '),
          expectedDisplay: JSON.stringify(tc.expected),
          actualDisplay: 'Runtime Error',
          runtimeMs: elapsed,
          error: err && err.message ? String(err.message) : String(err),
        });
      }
    }
    self.postMessage({ results, totalRuntimeMs: Number(totalRuntimeMs.toFixed(2)) });
  } catch (compileErr) {
    self.postMessage({ fatalError: compileErr && compileErr.message ? String(compileErr.message) : String(compileErr) });
  }
};
`;

export function runJsTestSuiteInSandbox(
  sourceCode: string,
  suite: TestSuite,
  timeoutMs = 1500
): Promise<SuiteExecutionReport> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      resolve({
        allPassed: false,
        passedCount: 0,
        totalCount: suite.cases.length,
        edgeCasesPassed: 0,
        totalRuntimeMs: 0,
        results: [],
        fatalError: 'Browser Web Worker sandbox is unavailable in this environment.',
      });
      return;
    }

    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    let settled = false;

    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        allPassed: false,
        passedCount: 0,
        totalCount: suite.cases.length,
        edgeCasesPassed: 0,
        totalRuntimeMs: timeoutMs,
        results: [],
        fatalError: `Execution timed out after ${timeoutMs}ms (possible infinite loop or O(2^n) blowup).`,
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();

      const data = event.data as {
        fatalError?: string;
        results?: TestCaseExecutionResult[];
        totalRuntimeMs?: number;
      };

      if (data.fatalError) {
        resolve({
          allPassed: false,
          passedCount: 0,
          totalCount: suite.cases.length,
          edgeCasesPassed: 0,
          totalRuntimeMs: 0,
          results: [],
          fatalError: data.fatalError,
        });
        return;
      }

      const results = data.results ?? [];
      const passedCount = results.filter((r) => r.passed).length;
      const edgeCasesPassed = results.filter((r) => r.passed && (r.isEdgeCase || r.isBoundary)).length;

      resolve({
        allPassed: passedCount === suite.cases.length && suite.cases.length > 0,
        passedCount,
        totalCount: suite.cases.length,
        edgeCasesPassed,
        totalRuntimeMs: data.totalRuntimeMs ?? 0,
        results,
      });
    };

    worker.onerror = (err) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      resolve({
        allPassed: false,
        passedCount: 0,
        totalCount: suite.cases.length,
        edgeCasesPassed: 0,
        totalRuntimeMs: 0,
        results: [],
        fatalError: err.message || 'Sandbox runtime error.',
      });
    };

    const casesPayload: TestCase[] = suite.cases;
    worker.postMessage({
      sourceCode,
      fnName: suite.entryFunctionName.javascript,
      comparator: suite.comparator,
      cases: casesPayload,
    });
  });
}
