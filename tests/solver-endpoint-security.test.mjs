import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSolverRetryAfterSeconds,
  isWithinSolverEndpointLimit,
} from '../server/services/solverEndpointRateLimit.ts';

test('solver AI coach budget is five requests per minute', () => {
  assert.equal(isWithinSolverEndpointLimit('ai-coach', 5), true);
  assert.equal(isWithinSolverEndpointLimit('ai-coach', 6), false);
});

test('external problem import budget is ten requests per minute', () => {
  assert.equal(isWithinSolverEndpointLimit('fetch-url', 10), true);
  assert.equal(isWithinSolverEndpointLimit('fetch-url', 11), false);
});

test('solver rate limits reject invalid counters', () => {
  assert.equal(isWithinSolverEndpointLimit('ai-coach', -1), false);
  assert.equal(isWithinSolverEndpointLimit('fetch-url', 1.25), false);
});

test('solver rate limit retry-after expires at the minute boundary', () => {
  const start = new Date('2026-11-24T10:00:00.000Z');
  const now = new Date('2026-11-24T10:00:17.500Z');
  assert.equal(getSolverRetryAfterSeconds(now, start), 43);
});
