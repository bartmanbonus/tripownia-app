import { expect, test } from "@playwright/test";

test("SEO landing distinguishes archived inspirations when live feed returns no offers", async ({ page }) => {
  const emptyFeed = { ok: true, offers: [], sourceType: "live", checkedAt: new Date().toISOString() };
  await page.route("**/api/today-offers**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(emptyFeed) })
  );
  await page.route("**/api/deals**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(emptyFeed) })
  );

  const response = await page.goto("/podroze/city-break-z-poznania", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.locator(".seo-sales-snapshot")).toContainText("ZAPISANE INSPIRACJE");
  await expect(page.locator(".seo-sales-snapshot")).toContainText("ceny do potwierdzenia");
  await expect(page.locator(".seo-sales-snapshot")).not.toContainText("SPRAWDZONE TERAZ");
  await expect(page.locator(".seo-live-offers-grid .offer-card").first()).toBeVisible();
});
