/**
 * Guards the hex-color contract the palette relies on. The creative
 * engine must only ever surface #rrggbb colors; this documents and
 * locks that rule.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const isHex = (c: string): boolean => /^#[0-9a-fA-F]{6}$/.test(c);

test('accepts standard 6-digit hex', () => {
  assert.equal(isHex('#1a1a2e'), true);
  assert.equal(isHex('#FFFFFF'), true);
});

test('rejects 3-digit shorthand', () => {
  assert.equal(isHex('#fff'), false);
});

test('rejects missing hash', () => {
  assert.equal(isHex('1a1a2e'), false);
});

test('rejects non-hex characters', () => {
  assert.equal(isHex('#12345g'), false);
});
