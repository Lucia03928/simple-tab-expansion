import test from 'node:test';
import assert from 'node:assert/strict';
import { expandTabs, contractTabs, expandLine, contractLine } from '../src/index.js';

test('expandLine replaces a tab at column 0 with tabWidth spaces', () => {
  assert.equal(expandLine('\tx', 4), '    x');
});

test('expandLine advances to the next tab stop, not a fixed count', () => {
  // 'ab' occupies columns 0 and 1, so the tab must produce 2 spaces to reach column 4.
  assert.equal(expandLine('ab\tx', 4), 'ab  x');
});

test('expandLine handles a tab landing exactly on a tab stop', () => {
  // 'abcd' is 4 wide, so the tab at column 4 must produce 4 spaces, not 0.
  assert.equal(expandLine('abcd\tx', 4), 'abcd    x');
});

test('expandLine handles multiple tabs on one line', () => {
  assert.equal(expandLine('a\tb\tc', 4), 'a   b   c');
});

test('expandTabs preserves newlines and resets the column per line', () => {
  const input = 'a\tb\ncd\te\r\nf\tg';
  const expected = 'a   b\ncd  e\r\nf   g';
  assert.equal(expandTabs(input, 4), expected);
});

test('expandTabs leaves text with no tabs unchanged', () => {
  assert.equal(expandTabs('hello\nworld', 8), 'hello\nworld');
});

test('expandTabs rejects a non-positive or non-integer tabWidth', () => {
  assert.throws(() => expandTabs('a\tb', 0), RangeError);
  assert.throws(() => expandTabs('a\tb', -1), RangeError);
  assert.throws(() => expandTabs('a\tb', 2.5), RangeError);
});

test('contractLine turns spaces that reach a tab stop into a tab', () => {
  assert.equal(contractLine('    x', 4), '\tx');
});

test('contractLine leaves a partial run before the first stop as spaces', () => {
  // Two leading spaces cannot become a tab without overshooting column 2.
  assert.equal(contractLine('  a', 4), '  a');
});

test('contractLine contracts a run that spans multiple tab stops', () => {
  assert.equal(contractLine('        x', 4), '\t\tx');
});

test('expandTabs and contractTabs round-trip text produced by expansion', () => {
  const original = 'a\tb\ncd\te\r\nf\tg';
  const expanded = expandTabs(original, 4);
  assert.equal(contractTabs(expanded, 4), original);
});

test('contractTabs preserves newlines and only touches spaces', () => {
  const input = '    a\n  b\r\n\tc';
  const expected = '\ta\n  b\r\n\tc';
  assert.equal(contractTabs(input, 4), expected);
});

test('contractTabs rejects a non-positive or non-integer tabWidth', () => {
  assert.throws(() => contractTabs('a b', 0), RangeError);
  assert.throws(() => contractTabs('a b', 2.5), RangeError);
});
