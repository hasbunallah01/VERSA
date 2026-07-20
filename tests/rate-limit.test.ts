/**
 * Unit tests for lib/rate-limit's sliding-window counter.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { checkRateLimit } from '../lib/rate-limit';

test('allows requests up to the limit', () => {
  const key = `test-key-${Math.random()}`;
  assert.equal(checkRateLimit(key).allowed, true);
  assert.equal(checkRateLimit(key).allowed, true);
  assert.equal(checkRateLimit(key).allowed, true);
});

test('blocks the request after the limit is reached', () => {
  const key = `test-key-${Math.random()}`;
  checkRateLimit(key);
  checkRateLimit(key);
  checkRateLimit(key);
  const fourth = checkRateLimit(key);
  assert.equal(fourth.allowed, false);
  if (!fourth.allowed) {
    assert.ok(fourth.retryAfterSeconds > 0);
    assert.ok(fourth.retryAfterSeconds <= 60);
  }
});

test('different keys are tracked independently', () => {
  const keyA = `test-a-${Math.random()}`;
  const keyB = `test-b-${Math.random()}`;
  checkRateLimit(keyA);
  checkRateLimit(keyA);
  checkRateLimit(keyA);
  // keyA is now at its limit; keyB should be unaffected.
  assert.equal(checkRateLimit(keyA).allowed, false);
  assert.equal(checkRateLimit(keyB).allowed, true);
});
