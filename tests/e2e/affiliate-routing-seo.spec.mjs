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
    url: "https://www.kiwi.com/pl/search/results/warsaw-poland/barcelona-spain/2026-10-19/2026-10-21",
    source: "legacy_organic",
  });
  const response = await request.get(`/out/esky?${url}`, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const destination = new URL(response.headers()["location"], "http://127.0.0.1:3000");
  // Legacy wrapper must immediately hide both the original target and tracking ID.
  expect(destination.pathname).toMatch(new RegExp("^/przejdz/[A-Za-z0-9_-]{40,}$"));
  expect(destination.search).toBe("");
  const exit = await request.get(destination.pathname, { maxRedirects: 0 });
  expect(exit.status()).toBe(307);
  const resolved = new URL(exit.headers()["location"]);
  expect(["c111.travelpayouts.com", "kiwi.tpk.lv"]).toContain(resolved.hostname);
});

test("SEO pages use grammatical airport names and offer useful navigation before scripts run", async ({ request }) => {
  const response = await request.get("/podroze/city-break-z-poznania");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("z Poznania");
  expect(html).not.toContain("city break z Poznań");
  expect(html).toContain("Zobacz wyszukiwanie z tymi parametrami");
});

test("Poznań holidays old URL redirects to the indexed transactional landing", async ({ request }) => {
  const response = await request.get("/wakacje-z-poznania", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(new URL(response.headers()["location"], "https://tripownia.pl").pathname)
    .toBe("/podroze/wakacje-z-poznania");

  const landing = await request.get("/podroze/wakacje-z-poznania");
  expect(landing.status()).toBe(200);
  const html = await landing.text();
  expect(html).toContain("Wakacje z Poznania");
  expect(html).toContain("https://tripownia.pl/podroze/wakacje-z-poznania");
});

test("legacy claim-service offers preserve correct partner redirects without extra review UI", async ({ request }) => {
  for (const [target, expectedHost] of [
    ["https://airhelp.tpk.lv/i479aQSg", "airhelp.tpk.lv"],
    ["https://visit.zwrotzalot.pl/click?p=393367&a=3487177", "visit.zwrotzalot.pl"],
  ]) {
    const response = await request.get(`/sprawdz-oferte?target=${encodeURIComponent(target)}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const opaque = new URL(response.headers()["location"], "http://127.0.0.1:3000");
    expect(opaque.pathname).toMatch(/^\/przejdz\/[A-Za-z0-9_-]{40,}$/);
    expect(opaque.search).toBe("");
    expect(opaque.href).not.toContain(expectedHost);

    const exit = await request.get(opaque.pathname, { maxRedirects: 0 });
    expect(exit.status()).toBe(307);
    expect(new URL(exit.headers()["location"]).hostname).toBe(expectedHost);
  }
});

test("Kiwi affiliate links keep Barcelona and selected travel dates", async ({ request }) => {
  const url = new URLSearchParams({
    partner: "kiwi",
    target: "https://www.kiwi.com/pl/search/results/warsaw-poland/barcelona-spain/2026-10-19/2026-10-21",
    source: "regression_barcelona_hanoi",
  });
  const response = await request.get(`/go/live?${url}`, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const affiliate = new URL(response.headers()["location"]);
  expect(affiliate.hostname).toBe("c111.travelpayouts.com");
  const deep = new URL(affiliate.searchParams.get("custom_url"));
  expect(deep.hostname).toBe("www.kiwi.com");
  expect(deep.pathname).toBe("/deep");
  expect(deep.searchParams.get("from")).toBe("WAW");
  expect(deep.searchParams.get("to")).toBe("BCN");
  expect(deep.searchParams.get("departure")).toBe("2026-10-19");
  expect(deep.searchParams.get("return")).toBe("2026-10-21");
  expect(deep.href).not.toMatch(/hanoi|HAN/i);
  expect(affiliate.searchParams.get("shmarker")).toContain("TRIPOWNIAPL");
});

test("Kiwi old affiliate wrappers are repaired rather than redirected blindly", async ({ request }) => {
  const stale = new URL("https://c111.travelpayouts.com/click");
  stale.searchParams.set("custom_url", "https://www.kiwi.com/pl/search/results/warsaw-poland/barcelona-spain/2026-10-19/2026-10-21");
  const params = new URLSearchParams({ partner: "kiwi", target: stale.href });
  const response = await request.get(`/go/live?${params}`, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const exit = new URL(response.headers()["location"]);
  expect(exit.hostname).toBe("c111.travelpayouts.com");
  const deep = new URL(exit.searchParams.get("custom_url"));
  expect(deep.pathname).toBe("/deep");
  expect(deep.searchParams.get("to")).toBe("BCN");
});

test("Kiwi unknown or incomplete routes cannot send visitors to a wrong city", async ({ request }) => {
  for (const target of [
    "https://www.kiwi.com/pl/search/results/warsaw/poland",
    "https://www.kiwi.com/pl/search/results/warsaw-poland/unrecognized-place/2026-10-19/2026-10-21",
  ]) {
    const params = new URLSearchParams({ partner: "kiwi", target });
    const response = await request.get(`/go/live?${params}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(new URL(response.headers()["location"]).pathname).toBe("/okazje");
  }
});

test("Sports Booking links show cheapest hotels first, including older links", async ({ request }) => {
  const bookingUrl = new URL("https://www.booking.com/searchresults.pl.html");
  bookingUrl.searchParams.set("ss", "Mediolan");
  bookingUrl.searchParams.set("checkin", "2026-10-24");
  bookingUrl.searchParams.set("checkout", "2026-10-27");
  bookingUrl.searchParams.set("group_adults", "2");
  bookingUrl.searchParams.set("no_rooms", "1");
  bookingUrl.searchParams.set("aid", "818288");

  for (const source of ["sports_event_hotel", "sports_planner_hotel"]) {
    const query = new URLSearchParams({ partner: "booking", target: bookingUrl.toString(), source });
    const response = await request.get(`/go/live?${query.toString()}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const destination = new URL(response.headers()["location"]);
    expect(destination.hostname).toBe("www.booking.com");
    expect(destination.searchParams.get("order")).toBe("price");
    expect(destination.searchParams.get("ss")).toBe("Mediolan");
    expect(destination.searchParams.get("checkin")).toBe("2026-10-24");
    expect(destination.searchParams.get("checkout")).toBe("2026-10-27");
    expect(destination.searchParams.get("group_adults")).toBe("2");
    expect(destination.searchParams.get("aid")).toBe("818288");
  }
});
