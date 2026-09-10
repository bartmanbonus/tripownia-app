import test from "node:test";
import assert from "node:assert/strict";
import { filterCatalog, paginate, dedupeOffers } from "../lib/searchRules.mjs";

const rows = [
  { id:1, provider:"exim", sourceKey:"a", city:"Rzym", country:"Włochy", price:900, nights:3, board:"Śniadanie", departure:"Warszawa", airportCode:"WAW", startDateISO:"2026-10-02", availabilityStatus:"available" },
  { id:2, provider:"tui", sourceKey:"b", city:"Porto", country:"Portugalia", price:1200, nights:4, board:"Bez wyżywienia", departure:"Kraków", airportCode:"KRK", startDateISO:"2026-10-03", availabilityStatus:"available" },
  { id:3, provider:"exim", sourceKey:"c", city:"Malta", country:"Malta", price:1600, nights:7, board:"All Inclusive", departure:"Warszawa", airportCode:"WAW", startDateISO:"2026-10-04", availabilityStatus:"available" },
];

test("search finds offer outside Radar", () => {
  const radar = [rows[0]];
  const result = filterCatalog(rows, { q:"Porto" });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
  assert.ok(!radar.some(x => x.id === 2));
});

test("changing Radar does not change search", () => {
  const expected = filterCatalog(rows, { maxPrice:1300 }).map(x => x.id);
  assert.notDeepEqual([rows[0]], [rows[2]]);
  assert.deepEqual(filterCatalog(rows, { maxPrice:1300 }).map(x => x.id), expected);
});

test("filters apply before pagination and total counts all matches", () => {
  const filtered = filterCatalog(rows, { from:"WAW", maxPrice:2000 });
  const page = paginate(filtered, 1, 1);
  assert.equal(page.totalMatches, 2);
  assert.equal(page.offers.length, 1);
});

test("zero results never broadens criteria", () => {
  assert.deepEqual(filterCatalog(rows, { q:"Tokio", maxPrice:500 }), []);
});

test("repeating catalog update does not create duplicates", () => {
  const once = dedupeOffers([...rows, rows[0]]);
  const twice = dedupeOffers(once);
  assert.deepEqual(twice, once);
  assert.equal(once.length, 3);
});
