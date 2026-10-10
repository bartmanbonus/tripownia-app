import { expect, test } from "@playwright/test";

const campaignPath = "/dlugi-weekend-listopadowy-2026";

test.beforeEach(async ({ page }) => {
  // Campaign navigation can be verified without calling live affiliate feeds.
  const payload = JSON.stringify({
    ok: true,
    offers: [],
    checkedAt: new Date().toISOString(),
    partial: false,
    providers: [],
  });
  await page.route("**/api/deals**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: payload }));
  await page.route("**/api/today-offers**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: payload }));
});

test("November campaign has real travel presets without duplicate internal UTM referrals", async ({ page }) => {
  await page.goto(`${campaignPath}?utm_source=facebook&utm_medium=organic_social&utm_campaign=listopad_2026`);

  await expect(page.getByRole("heading", { name: "Zamień listopadową przerwę na podróż." })).toBeVisible();
  const dates = page.locator('#gotowe-terminy a[data-campaign-action="dates"]');
  await expect(dates).toHaveCount(3);

  const expected = [
    { from: "2026-11-07", to: "2026-11-11", duration: "2-5" },
    { from: "2026-11-11", to: "2026-11-15", duration: "2-5" },
    { from: "2026-11-07", to: "2026-11-15", duration: "3-8" },
  ];

  for (let i = 0; i < expected.length; i += 1) {
    const href = await dates.nth(i).getAttribute("href");
    const url = new URL(href, "https://tripownia.pl");
    expect(url.pathname).toBe("/szukaj");
    expect(url.searchParams.get("from")).toBe(expected[i].from);
    expect(url.searchParams.get("to")).toBe(expected[i].to);
    expect(url.searchParams.get("duration")).toBe(expected[i].duration);
    expect(url.searchParams.get("utm_source")).toBeNull();
    expect(url.searchParams.get("utm_campaign")).toBeNull();
  }

  await expect(page.locator('#lotnisko-listopad a[data-campaign-action="airport"]')).toHaveCount(6);
});

test("November campaign airport shortcut preserves chosen dates and uses Tripownia search", async ({ page }) => {
  await page.goto(`${campaignPath}?from=2026-11-11&to=2026-11-15&utm_source=facebook&utm_campaign=listopad_2026`);

  const warsaw = page.locator('#lotnisko-listopad a[data-campaign-action="airport"]').first();
  const href = await warsaw.getAttribute("href");
  const url = new URL(href, "https://tripownia.pl");
  expect(url.pathname).toBe(campaignPath);
  expect(url.searchParams.get("airport")).toBe("WAW,WMI");
  expect(url.searchParams.get("from")).toBe("2026-11-11");
  expect(url.searchParams.get("to")).toBe("2026-11-15");
  expect(url.searchParams.get("utm_source")).toBeNull();

  const krakow = page.locator('#lotnisko-listopad a[data-campaign-action="airport"]').nth(1);
  await krakow.click();
  await expect(page).toHaveURL(/airport=KRK/);
  await expect(page.getByRole("heading", { name: "Zamień listopadową przerwę na podróż." })).toBeVisible();
});

test("November campaign keeps sales actions usable on small screens", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only assertion");
  await page.goto(campaignPath);
  await expect(page.locator('#gotowe-terminy a[data-campaign-action="dates"]').first()).toBeVisible();
  await expect(page.locator('#lotnisko-listopad a[data-campaign-action="airport"]').first()).toBeVisible();

  const overflow = await page.evaluate(
    () => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(2);
});
