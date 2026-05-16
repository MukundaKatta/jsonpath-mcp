import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { query } from '../src/server.js';

const SHOP = {
  store: {
    book: [
      { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
      { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
    ],
    bicycle: { color: 'red', price: 19.95 },
  },
};

test('top-level field', () => {
  const r = query({ json: SHOP, path: '$.store.bicycle.color' }) as string[];
  assert.deepEqual(r, ['red']);
});

test('wildcard over array', () => {
  const r = query({ json: SHOP, path: '$.store.book[*].title' }) as string[];
  assert.deepEqual(r, ['Sayings of the Century', 'Sword of Honour', 'Moby Dick']);
});

test('recursive descent', () => {
  const r = query({ json: SHOP, path: '$..price' }) as number[];
  assert.deepEqual(r.sort((a, b) => a - b), [8.95, 8.99, 12.99, 19.95]);
});

test('filter expression', () => {
  const r = query({ json: SHOP, path: '$.store.book[?(@.price < 10)].title' }) as string[];
  assert.deepEqual(r.sort(), ['Moby Dick', 'Sayings of the Century']);
});

test('no matches returns empty array', () => {
  const r = query({ json: SHOP, path: '$.does.not.exist' }) as unknown[];
  assert.deepEqual(r, []);
});

test('result_type=path returns JSONPath strings', () => {
  const r = query({ json: SHOP, path: '$.store.book[*].title', result_type: 'path' }) as string[];
  assert.ok(Array.isArray(r));
  assert.ok(r[0].startsWith('$'));
});
