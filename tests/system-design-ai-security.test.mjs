import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SYSTEM_DESIGN_AI_LIMIT_PER_MINUTE,
  getSystemDesignAiRetryAfterSeconds,
  isWithinSystemDesignAiLimit,
} from '../server/services/systemDesignAiRateLimit.ts';

test('System Design AI permits the configured per-user request budget only', () => {
  assert.equal(SYSTEM_DESIGN_AI_LIMIT_PER_MINUTE, 5);
  assert.equal(isWithinSystemDesignAiLimit(1), true);
  assert.equal(isWithinSystemDesignAiLimit(5), true);
  assert.equal(isWithinSystemDesignAiLimit(6), false);
});

test('System Design AI rejects invalid rate-limit counts', () => {
  assert.equal(isWithinSystemDesignAiLimit(-1), false);
  assert.equal(isWithinSystemDesignAiLimit(1.5), false);
});

test('System Design AI retry-after is bounded to the current minute window', () => {
  const windowStart = new Date('2026-11-24T10:00:00.000Z');
  const now = new Date('2026-11-24T10:00:17.500Z');
  assert.equal(getSystemDesignAiRetryAfterSeconds(now, windowStart), 43);
});
