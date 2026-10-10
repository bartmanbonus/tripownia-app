import { expect, test } from "@playwright/test";

// Redirect checks explicitly disable following partner URLs; no external purchase is made.
for (const [partner, target, expectedHost] of [
  ["airhelp", "https://airhelp.tpk.lv/i479aQSg", "airhelp.tpk.lv"],
  ["zwrotzalot", "https://visit.zwrotzalot.pl/click?p=393367&a=3487177", "visit.zwrotzalot.pl"],
]) {
  test(`affiliate exit stays operational for ${partner}`, async ({ request }) => {
    const params = new URLSearchParams({ partner, target, source: "e2e_conversion" });
    const response = await request.get(`/go/live?${params}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const location = response.headers()["location"];
    expect(new URL(location).hostname).toBe(expectedHost);
  });
}

test("legacy eSky alias to Kiwi is routed to the correct tracking partner", async ({ request }) => {
  const url = new URLSearchParams({
    url: "https://www.kiwi.com/pl/search/results/warsaw/poland",
    source: "legacy_organic",
  });
  const response = await request.get(`/out/esky?${url}`, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const destination = new URL(response.headers()["location"], "http://127.0.0.1:3000");
  expect(destination.pathname).toBe("/go/live");
  expect(destination.searchParams.get("partner")).toBe("kiwi");
});

test("SEO pages use grammatical airport names and offer useful navigation before scripts run", async ({ request }) => {
  const response = await request.get("/podroze/city-break-z-poznania");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("z Poznania");
  expect(html).not.toContain("city break z Poznań");
  expect(html).toContain("Zobacz wyszukiwanie z tymi parametrami");
});

test("partner review shows correct names for both claim-service affiliates", async ({ request }) => {
  for (const [target, name] of [
    ["https://airhelp.tpk.lv/i479aQSg", "AirHelp"],
    ["https://visit.zwrotzalot.pl/click?p=393367&a=3487177", "ZwrotZaLot"],
  ]) {
    const response = await request.get(`/sprawdz-oferte?target=${encodeURIComponent(target)}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(`Przejdziesz do ${name}`);
  }
});
