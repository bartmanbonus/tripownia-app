import test from 'node:test';
import assert from 'node:assert/strict';
import { collectSnapshot, shouldRefresh } from '../scripts/refresh-core.ts';
import { catalogExport } from '../lib/catalogExport.ts';
const sources = [{ provider: 'exim', requested: 24, failed: 0 }];
const rows = Array.from({ length: 691 }, (_, id) => ({ id: id + 1, provider: 'exim', sourceKey: `o-${id}`, price: 1000 + id, affiliateUrl: `https://example.com/offer/${id}`, priceCheckedAt: '2026-09-10T08:00:00Z' }));
const exporter = (items = rows) => async url => {
  const result = await catalogExport(items, new URL(url).searchParams, sources);
  return Response.json(result.body, { status: result.status });
};
test('all 691 fixture offers are imported, not only first 200', async () => {
  const calls = [];
  const data = await collectSnapshot('https://tripownia.pl', { offers: [] }, async (url, init) => { calls.push(String(url)); return exporter()(url, init); });
  assert.equal(data.offers.length, 691); assert.equal(data.added, 691); assert.equal(calls.length, 4);
});
test('repeated refresh creates no duplicates or fake new offers', async () => {
  const first = await collectSnapshot('https://tripownia.pl', {}, exporter());
  const second = await collectSnapshot('https://tripownia.pl', first, exporter());
  assert.equal(second.offers.length, 691); assert.equal(second.added, 0); assert.equal(second.updated, 0);
});
test('one changed price is one update, not a newly added offer', async () => {
  const next = await collectSnapshot('https://tripownia.pl', { offers: rows }, exporter(rows.map((r, i) => i === 0 ? { ...r, price: 2300 } : r)));
  assert.equal(next.added, 0); assert.equal(next.updated, 1);
});
test('source failures refuse export', async () => {
  const result = await catalogExport(rows, new URLSearchParams(), [{ provider: 'exim', requested: 24, failed: 1 }]);
  assert.equal(result.status, 502);
});
test('failure after page one never mutates previous snapshot', async () => {
  const previous = { offers: rows.slice(0, 5) }, copy = structuredClone(previous);
  await assert.rejects(() => collectSnapshot('https://tripownia.pl', previous, async url => new URL(url).searchParams.get('page') === '1' ? exporter()(url) : Response.json({ ok: false }, { status: 502 })));
  assert.deepEqual(previous, copy);
});
test('changing feed between pages cannot create a mixed snapshot', async () => {
  await assert.rejects(() => collectSnapshot('https://tripownia.pl', {}, async url => exporter(new URL(url).searchParams.get('page') === '1' ? rows : rows.map((r, i) => i === 0 ? { ...r, price: 2300 } : r))(url)));
});
test('old 200-only API is rejected instead of claiming full export', async () => {
  await assert.rejects(() => collectSnapshot('https://tripownia.pl', {}, async () => Response.json({ ok: true, offers: rows.slice(0, 200), sourceCount: 691 })));
});
test('summer and winter delayed runners still execute', () => {
  assert.equal(shouldRefresh('schedule', '10 6 * * *', new Date('2026-09-10T06:13:00Z')), true);
  assert.equal(shouldRefresh('schedule', '10 6 * * *', new Date('2026-09-10T07:40:00Z')), true);
  assert.equal(shouldRefresh('schedule', '10 7 * * *', new Date('2026-12-10T07:13:00Z')), true);
  assert.equal(shouldRefresh('schedule', '10 7 * * *', new Date('2026-09-10T07:13:00Z')), false);
  assert.equal(shouldRefresh('schedule', '10 6 * * *', new Date('2026-12-10T06:13:00Z')), false);
});
test('manual and midday refresh are available', () => {
  assert.equal(shouldRefresh('workflow_dispatch', '', new Date()), true);
  assert.equal(shouldRefresh('schedule', '10 12 * * *', new Date()), true);
  assert.equal(shouldRefresh('push', '', new Date()), false);
});
