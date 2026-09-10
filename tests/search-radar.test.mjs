import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCatalog, paginate, dedupeOffers, normalizeSearch, activeOffer, parseCatalogQuery } from '../lib/searchRules.ts';
import { requestCatalog } from '../lib/catalogClient.ts';
const now = new Date('2026-09-10T12:00:00Z');
const rows = [
  { id: 1, provider: 'exim', city: 'Rzym', country: 'Wlochy', price: 900, nights: 3, board: 'Sniadanie', airportCode: 'WAW', startDateISO: '2026-10-02' },
  { id: 2, provider: 'tui', city: 'Porto', country: 'Portugalia', price: 1200, nights: 4, board: 'Bez wyzywienia', airportCode: 'KRK', startDateISO: '2026-10-03' },
  { id: 3, provider: 'exim', city: 'Malta', country: 'Malta', price: 1600, nights: 7, board: 'All Inclusive', airportCode: 'WMI', departure: 'Warszawa Modlin', startDateISO: '2026-10-04' },
];
test('search finds an offer outside Radar', () => {
  const radar = [rows[0]];
  const result = filterCatalog(rows, { q: 'Porto' }, now);
  assert.deepEqual(result.map(o => o.id), [2]); assert.ok(!radar.includes(result[0]));
});
test('changing Radar cannot alter catalog results', () => {
  let radar = [rows[0]];
  const baseline = filterCatalog(rows, { maxPrice: 1300 }, now);
  radar = [rows[2]];
  assert.equal(radar.length, 1);
  assert.deepEqual(filterCatalog(rows, { maxPrice: 1300 }, now), baseline);
});
test('filters scan every row before pagination, including a match beyond 200', () => {
  const large = Array.from({ length: 450 }, (_, id) => ({ ...rows[0], id: 1000 + id, city: id === 449 ? 'Porto' : 'Rzym' }));
  assert.equal(paginate(filterCatalog(large, { q: 'Porto' }, now), 1, 1).offers[0].id, 1449);
  const page = paginate(filterCatalog(large, {}, now), 2, 20);
  assert.equal(page.totalMatches, 450); assert.equal(page.offers.length, 20);
});
test('zero matches are not broadened', () => { assert.deepEqual(filterCatalog(rows, { q: 'Tokio', maxPrice: 500 }, now), []); });
test('city-country label does not match entire country or missing fields', () => {
  const extra = [{ ...rows[0], id: 4, city: 'Neapol' }, { ...rows[0], id: 5, city: '', country: '' }];
  assert.deepEqual(filterCatalog([...rows, ...extra], { destinations: ['Rzym, Wlochy'] }, now).map(o => o.id), [1]);
});
test('multiple destinations are OR, other filters remain AND', () => {
  assert.deepEqual(filterCatalog(rows, { destinations: ['Rzym, Wlochy', 'Porto, Portugalia'], from: 'KRK' }, now).map(o => o.id), [2]);
});
test('Polish l with stroke is normalized, not removed', () => { assert.equal(normalizeSearch('Włochy'), 'wlochy'); });
test('Chopin is not Modlin; WAWA permits both', () => {
  assert.deepEqual(filterCatalog(rows, { from: 'WAW' }, now).map(o => o.id), [1]);
  assert.deepEqual(filterCatalog(rows, { from: 'WAWA' }, now).map(o => o.id), [1, 3]);
});
test('past departures expire using Warsaw date at midnight', () => {
  assert.equal(activeOffer({ ...rows[0], startDateISO: '2026-09-10' }, new Date('2026-09-10T22:30:00Z')), false);
});
test('weekend filter excludes Sunday return when full Sunday is promised', () => {
  assert.equal(filterCatalog([{ ...rows[0], nights: 2 }], { weekend: true }, now).length, 0);
  assert.equal(filterCatalog([rows[0]], { weekend: true }, now).length, 1);
});
test('unknown dates fail date filters; invalid and reversed parameters fail validation', () => {
  assert.equal(filterCatalog([{ ...rows[0], startDateISO: undefined }], { dateFrom: '2026-09-11' }, now).length, 0);
  for (const query of ['dateFrom=2026-02-31', 'dateFrom=2026-12-01&dateTo=2026-11-01', 'page=NaN', 'page=-1', 'board=invalid', 'maxPrice=NaN']) assert.throws(() => parseCatalogQuery(new URLSearchParams(query)));
});
test('city break is a filter, not a Radar quota', () => {
  const sameCity = Array.from({ length: 50 }, (_, id) => ({ ...rows[0], id }));
  assert.equal(filterCatalog(sameCity, { tripType: 'citybreak' }, now).length, 50);
});
test('deduplication is idempotent and keeps newest higher price', () => {
  const updated = { ...rows[0], price: 950, priceCheckedAt: '2026-09-10T13:00:00Z' };
  const once = dedupeOffers([...rows, updated]);
  assert.deepEqual(dedupeOffers(once), once); assert.equal(once.length, 3); assert.equal(once[0].price, 950);
});
test('client makes only one request for empty results', async () => {
  const calls = [];
  const fake = async url => { calls.push(url); return Response.json({ ok: true, offers: [], totalMatches: 0, broadened: false }); };
  const result = await requestCatalog(new URLSearchParams('q=Tokio&maxPrice=500'), undefined, fake);
  assert.equal(result.totalMatches, 0); assert.equal(calls.length, 1); assert.match(calls[0], /q=Tokio&maxPrice=500/);
});
test('client does not replace API failure with unrelated offers', async () => {
  let calls = 0;
  await assert.rejects(() => requestCatalog(new URLSearchParams('q=Porto'), undefined, async () => { calls++; return Response.json({ ok: false }, { status: 502 }); }));
  assert.equal(calls, 1);
});
