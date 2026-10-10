import { expect, test } from "@playwright/test";

const sample = "/go/rescue?destination=Tokio%2C%20Japonia&from=2027-03-27&to=2027-04-04&airports=WAW&dryRun=1";

test("server builds provider redirects from clean first-party parameters", async ({ request }) => {
  test.skip(process.env.CI !== "true", "Dry-run mode runs in CI only to protect production analytics");
  for (const [kind, host] of [
    ["package", "www2.esky.pl"],
    ["flight", "c111.travelpayouts.com"],
    ["hotel", "www.booking.com"],
  ]) {
    const response = await request.get(`${sample}&kind=${kind}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["cache-control"]).toContain("no-store");
    const location = new URL(response.headers()["location"]);
    expect(location.hostname).toBe(host);
    expect(location.toString()).toContain("2027");
  }
});

test("invalid kinds and unsafe destinations never leave Tripownia", async ({ request }) => {
  for (const query of [
    "kind=flight&destination=Izrael",
    "kind=package&destination=NieistniejaceMiastoQWERTY",
    "kind=hotel&destination=",
    "kind=anything&destination=Tokio",
  ]) {
    const response = await request.get(`/go/rescue?${query}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(new URL(response.headers()["location"], "http://127.0.0.1:3000").pathname).toBe("/szukaj");
  }
});

test("empty package results show three short links that preserve trip intent", async ({ page }) => {
  const empty = JSON.stringify({
    ok: true, offers: [], checkedAt: new Date().toISOString(), partial: false, providers: [],
  });
  await page.route("**/api/today-offers**", async route => {
    await route.fulfill({ status: 200, contentType: "application/json", body: empty });
  });
  await page.route("**/hotelsapi.esky.com/**", async route => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: '{"offers":[],"paging":{}}',
    });
  });
  await page.goto("/szukaj?destination=Tokio%2C%20Japonia&from=2027-03-27&to=2027-04-04");
  const rescue = page.locator('.search-v3-empty-actions a[href^="/go/rescue?"]');
  await expect(rescue).toHaveCount(3, { timeout: 30000 });
  const hrefs = await rescue.evaluateAll(links => links.map(a => a.getAttribute("href") || ""));
  for (const href of hrefs) {
    const url = new URL(href, "https://tripownia.pl");
    expect(url.pathname).toBe("/go/rescue");
    expect(url.searchParams.get("destination")).toBe("Tokio, Japonia");
    expect(url.searchParams.get("target")).toBeNull();
    expect(url.searchParams.get("partner")).toBeNull();
    expect(href).not.toMatch(/(TRIPOWNIA|partner_id|affiliate|tradedoubler|booking\.com|esky\.pl)/i);
  }
  expect(hrefs.map(href => new URL(href, "https://tripownia.pl").searchParams.get("kind")).sort())
    .toEqual(["flight", "hotel", "package"]);
});

test("Tokyo sakura retains same-date flight and hotel alternatives from the live main branch", async ({ request }) => {
  const url = "/podroze-po-przezycia?destination=Tokio%2C%20Japonia&from=2027-03-27&to=2027-04-04&experience=sakura";
  const res = await request.get(url);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("Nie czekaj na gotowy pakiet");
  expect(html).toContain("/loty?destination=Tokio");
  expect(html).toContain("outbound=2027-03-27");
  expect(html).toContain("/hotele?destination=Tokio");
  expect(html).toContain("2027-04-04");
});
