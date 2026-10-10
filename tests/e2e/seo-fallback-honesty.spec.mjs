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

test("SEO sales summary never promotes an unverified stale numeric price", async ({ page }) => {
  const staleOffer = {
    id: 1700000999,
    flag: "🇮🇹",
    city: "Bergamo",
    country: "Włochy",
    price: 649,
    priceCheckedAt: "2025-01-01T12:00:00.000Z",
    availabilityStatus: "unknown",
    departure: "Poznań",
    airportCode: "POZ",
    nights: 3,
    weather: "sprawdź",
    score: 8.9,
    tag: "OKAZJA",
    reason: "Oferta testowa z nieaktualną ceną",
    image: "/images/destinations/bergamo.jpg",
    category: ["city", "weekend"],
    hotel: "Testowy hotel",
    board: "Bez wyżywienia",
    dates: "20–23 listopada 2026",
    partner: "esky",
    affiliateUrl: "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?packageId=SEO-E2E&partner_id=TRIPOWNIAPLPACKAGES",
    linkType: "exact",
    linkMatch: "exact",
  };
  const payload = { ok: true, sourceType: "live", offers: [staleOffer], checkedAt: new Date().toISOString() };
  await page.route("**/api/today-offers**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) })
  );
  await page.route("**/api/deals**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) })
  );
  await page.goto("/podroze/city-break-z-poznania");
  await expect(page.locator(".seo-sales-snapshot")).toContainText("ceny do potwierdzenia");
  await expect(page.locator(".seo-sales-snapshot")).not.toContainText("649 zł");
  const card = page.locator('.seo-live-offers-grid [data-offer-id="1700000999"]');
  await expect(card).toHaveAttribute("data-price-verified", "false");
  await expect(card.locator(".price")).toContainText("Sprawdź aktualną cenę");
});
