const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(js, { exports, URL, URLSearchParams });
  return exports;
}
const { partnerFromUrl, partnerReviewHref, isOfferDetailPath } = load('lib/affiliateJourney.ts');
const { liveOfferLandingHref } = load('lib/liveOfferLanding.ts');
const target = 'https://www2.esky.pl/lot+hotel/portfolio/details/select-room?packageId=abc%3D&flightOptionId=KRK%7C%7CBGY&rooms%5B0%5D%5Badults%5D=2&partner_id=TRIPOWNIAPLPACKAGES';
assert.equal(partnerFromUrl(target), 'esky');
assert.equal(partnerFromUrl('https://www.aviasales.com/search/WAW1212ROM15121?marker=695999.TRIPOWNIAPL'), 'aviasales');
for (const bad of ['https://booking.com.evil.test/', 'http://booking.com/', 'javascript:alert(1)', '//www.booking.com/', 'https://www2.esky.pl/unrelated']) assert.equal(partnerFromUrl(bad), null);
const review = new URL(partnerReviewHref(target, { source: 'search_results', offer: 'alicante-929', destination: 'Alicante' }), 'https://tripownia.pl');
assert.equal(review.pathname, '/sprawdz-oferte');
assert.equal(review.searchParams.get('target'), target);
assert.equal(review.searchParams.get('offer'), 'alicante-929');
const detail = new URL(liveOfferLandingHref({ id: 1000001, city: 'Alicante', country: 'Hiszpania', departure: 'Warszawa', nights: 3, dates: '24–27 listopada 2026', board: 'Bez wyżywienia', affiliateUrl: target, price: 929, partner: 'esky', priceCheckedAt: '2026-10-08T04:00:00Z' }, { source: 'search_results', price: null }), 'https://tripownia.pl');
assert.equal(detail.searchParams.get('target'), target);
assert.equal(detail.searchParams.has('price'), false);
assert.equal(detail.searchParams.get('checkedAt'), '2026-10-08T04:00:00Z');
assert.equal(detail.pathname, '/okazja');
for (const path of ['/okazja', '/sprawdz-oferte', '/loty/oferta', '/o/alicante-929', '/oferta/1']) assert.equal(isOfferDetailPath(path), true);
for (const path of ['/', '/okazje', '/oferty-z-postow', '/porownaj', '/szukaj']) assert.equal(isOfferDetailPath(path), false);
console.log('Offer journey: safe partners, preserved booking parameters, unknown prices and loop prevention OK');
