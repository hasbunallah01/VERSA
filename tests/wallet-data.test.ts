/**
 * Unit tests for pure helpers in lib/wallet-data.
 * Run with: npm test  (Node's built-in test runner via tsx).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isEvmAddress } from '../lib/wallet-data';

test('isEvmAddress accepts a valid checksummed address', () => {
  assert.equal(isEvmAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'), true);
});

test('isEvmAddress accepts a lowercase address', () => {
  assert.equal(isEvmAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'), true);
});

test('isEvmAddress trims surrounding whitespace', () => {
  assert.equal(isEvmAddress('  0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045  '), true);
});

test('isEvmAddress rejects too-short input', () => {
  assert.equal(isEvmAddress('0x1234'), false);
});

test('isEvmAddress rejects missing 0x prefix', () => {
  assert.equal(isEvmAddress('d8dA6BF26964aF9D7eEd9e03E53415D37aA96045'), false);
});

test('isEvmAddress rejects non-hex characters', () => {
  assert.equal(isEvmAddress('0xZZZZ6BF26964aF9D7eEd9e03E53415D37aA96045'), false);
});

test('isEvmAddress rejects empty string', () => {
  assert.equal(isEvmAddress(''), false);
});
