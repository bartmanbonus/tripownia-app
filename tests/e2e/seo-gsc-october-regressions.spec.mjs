import { expect, test } from "@playwright/test";

test("New Year editorial guide keeps a distinct indexable URL", async ({ request }) => {
  const path = "/gdzie-na-sylwestra-2026-2027-15-kierunkow";
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('rel="canonical"');
  expect(html).toContain("gdzie-na-sylwestra-2026-2027-15-kierunkow");
  expect(html).toContain("Gdzie polecieć na Sylwestra 2026/2027?");
  expect(html).toContain("/sylwester");
});

test("baggage guide answers weight question in its H1", async ({ request }) => {
  const response = await request.get("/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toMatch(/<h1[^>]*>Czy bagaż podręczny jest ważony\?/);
  expect(html).toContain("Limity i zasady dwóch bagaży");
});

test("migrated baggage article has only one primary H1", async ({ request }) => {
  const response = await request.get("/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect((html.match(/<h1(?:\s|>)/gi) || []).length).toBe(1);
});

test("legacy WordPress post_id alias redirects to the canonical article", async ({ request }) => {
  const clean = "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych";
  const response = await request.get(clean + "/post_id", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(new URL(response.headers()["location"], "https://tripownia.pl").pathname).toBe(clean);
});

test("sitemap advertises only the canonical New Year article URL", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml).toContain("https://tripownia.pl/gdzie-na-sylwestra-2026-2027-15-kierunkow");
  expect(xml).not.toContain("/post_id</loc>");
});

test("Alicante and Malaga guide answers the Andalusia question with bookable searches", async ({ request }) => {
  const response = await request.get("/alicante-czy-malaga-gdzie-lepiej-poleciec-na-wakacje");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Czy Alicante leży w Andaluzji?");
  expect(html).toContain("Alicante znajduje się we Wspólnocie Walenckiej");
  expect(html).toContain("/szukaj?destination=Alicante");
  expect(html).toContain("/szukaj?destination=Malaga");
});

test("Poznan hub links to dedicated commercial city-break page", async ({ request }) => {
  const response = await request.get("/z-poznania");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("City break z Poznania");
  expect(html).toContain("/podroze/city-break-z-poznania");
});

test("Alicante vs Malaga guide never recommends unrelated destination cards", async ({ request }) => {
  const response = await request.get("/alicante-czy-malaga-gdzie-lepiej-poleciec-na-wakacje");
  expect(response.status()).toBe(200);
  const html = await response.text();
  // This page must compare the two cities and never fall back to arbitrary destinations.
  expect(html).toContain("Czy Alicante leży w Andaluzji?");
  // Limit assertions to the actual recommendation section; unrelated cities
  // can legitimately occur in the full article as travel comparisons.
  const offersStart = html.indexOf('class="legacy-offers article-related-offers"');
  if (offersStart >= 0) {
    const offersHtml = html.slice(offersStart, html.indexOf("</section>", offersStart));
    expect(offersHtml).not.toContain("Djerba");
    expect(offersHtml).not.toContain("Marrakesz");
    expect(offersHtml).not.toContain("Kreta");
  }
});
