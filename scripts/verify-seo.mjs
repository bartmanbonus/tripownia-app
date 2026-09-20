import assert from "node:assert/strict";

const base = process.env.SEO_TEST_ORIGIN || "http://127.0.0.1:3000";
const get = path => fetch(new URL(path, base), { redirect: "manual" });
const publicRoutes = ["/", "/planer-podrozy", "/poradniki", "/przed-wyjazdem", "/wietnam"];
for (const path of publicRoutes) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.ok(!response.headers.get("x-robots-tag")?.includes("noindex"), path);
  const html = await response.text();
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical, `canonical ${path}`);
  assert.equal(new URL(canonical).origin, "https://tripownia.pl");
  assert.equal(new URL(canonical).pathname, path);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "";
  assert.equal((title.match(/Tripownia/g) || []).length, 1, `brand once: ${path}`);
  if (path === "/planer-podrozy") {
    assert.ok(html.includes("Darmowy planer podróży"));
    assert.ok(html.includes('href="/dodaj-podroz"'));
    assert.ok(html.includes('href="/przed-wyjazdem"'));
    assert.ok(html.includes("BreadcrumbList"));
  }
}

const privateRoutes = ["/konto", "/profil", "/moja-podroz", "/moje-podroze", "/dodaj-podroz", "/ulubione", "/alerty", "/porownaj", "/dla-ciebie", "/app"];
for (const path of privateRoutes) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  assert.ok(response.headers.get("x-robots-tag")?.includes("noindex"), path);
  assert.ok(response.headers.get("cache-control")?.includes("no-store"), path);
}

const redirects = [
  ["/city-break-2", "/city-break"],
  ["/wakacje-z-gdanska-2", "/podroze/wakacje-z-gdanska"],
  ["/kategoria-produktu/all-inclusive", "/wakacje"],
  ["/wietnam/post_id", "/wietnam"],
];
for (const [from, to] of redirects) {
  const response = await get(from);
  assert.equal(response.status, 308, from);
  assert.equal(new URL(response.headers.get("location"), base).pathname, to);
}

const robots = await (await get("/robots.txt")).text();
for (const path of privateRoutes) assert.ok(!robots.includes(`Disallow: ${path}`), `noindex must be crawlable: ${path}`);
assert.ok(robots.includes("https://tripownia.pl/sitemap.xml"));
const xml = await (await get("/sitemap.xml")).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(urls.length, new Set(urls).size, "unique sitemap URLs");
assert.ok(urls.includes("https://tripownia.pl/planer-podrozy"));
for (const path of [...privateRoutes, ...redirects.map(([from]) => from)]) {
  assert.ok(!urls.includes(`https://tripownia.pl${path}`), `excluded from sitemap: ${path}`);
}
assert.ok(!urls.some(url => new URL(url).pathname.startsWith("/oferta/")));
console.log(`SEO checks passed: ${publicRoutes.length} public pages, ${privateRoutes.length} private routes, ${redirects.length} redirects, robots.txt and ${urls.length} unique sitemap URLs.`);
