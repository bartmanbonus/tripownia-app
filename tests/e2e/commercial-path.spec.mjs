import { expect, test } from "@playwright/test";

function isoDate(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function mockOffers() {
  const start = isoDate(30);
  const end = isoDate(33);
  const checkedNow = new Date().toISOString();
  const staleChecked = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 1700000001,
      flag: "🇮🇹",
      city: "Rzym",
      country: "Włochy",
      price: 649,
      priceCheckedAt: checkedNow,
      availabilityStatus: "available",
      departure: "Warszawa",
      airportCode: "WAW",
      nights: 3,
      weather: "sprawdź",
      score: 9.1,
      tag: "BIERZEMY",
      reason: "3 noce · lot + hotel",
      image: "/images/destinations/rzym.jpg",
      category: ["city", "weekend"],
      hotel: "Hotel Roma Test",
      board: "Śniadanie",
      dates: `${start}–${end}`,
      partner: "esky",
      affiliateUrl: `https://www2.esky.pl/lot+hotel/portfolio/details/select-room?packageId=E2E-ROME&partner_id=TRIPOWNIAPLPACKAGES&departureCode=WAW&checkInDate=${start}&checkOutDate=${end}`,
      linkType: "exact",
      linkMatch: "exact",
      startDateISO: start,
      endDateISO: end,
    },
    {
      id: 1700000002,
      flag: "🇲🇹",
      city: "Malta",
      country: "Malta",
      price: 729,
      priceCheckedAt: staleChecked,
      availabilityStatus: "unknown",
      departure: "Kraków",
      airportCode: "KRK",
      nights: 3,
      weather: "sprawdź",
      score: 8.7,
      tag: "OKAZJA",
      reason: "3 noce · lot + hotel",
      image: "/images/destinations/valletta.jpg",
      category: ["city", "weekend"],
      hotel: "Hotel Malta Test",
      board: "Bez wyżywienia",
      dates: `${start}–${end}`,
      partner: "exim",
      affiliateUrl: "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-E2E)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2F)",
      linkType: "exact",
      linkMatch: "exact",
      startDateISO: start,
      endDateISO: end,
    },
  ];
}

function apiPayload() {
  const offers = mockOffers();
  return {
    ok: true,
    key: new Date().toISOString().slice(0, 10),
    mode: "search",
    checkedAt: new Date().toISOString(),
    sourceCount: offers.length,
    partial: false,
    sourceStatus: {
      esky: { partial: false, hasMore: false },
      exim: { configured: true, attempted: 1, succeeded: 1, failed: 0 },
      tui: { configured: true, attempted: 0, succeeded: 0, failed: 0 },
      feedsFailed: 0,
    },
    providers: ["esky", "exim"],
    coverage: "available_feed_results",
    sourceType: "live",
    exactSourceCount: offers.length,
    destinationCount: offers.length,
    offers,
  };
}

async function mockOfferApis(page) {
  const payload = apiPayload();
  await page.route("**/api/today-offers**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) });
  });
  await page.route("**/api/deals**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) });
  });
}

test.beforeEach(async ({ page }) => {
  await mockOfferApis(page);
});

test("home -> concrete Tripownia offer -> monetized partner CTA", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const verified = page.locator('[data-offer-id="1700000001"]').first();
  await expect(verified).toBeVisible();
  await expect(verified).toHaveAttribute("data-price-verified", "true");
  await expect(verified.locator(".price")).toContainText("649");
  await expect(verified.locator(".price")).toContainText("zł");

  const cardCta = verified.locator("a.card-cta");
  await cardCta.focus();
  await expect(cardCta).toHaveAttribute("href", /^\/okazja\?ref=/);
  const cardHref = await cardCta.getAttribute("href");
  expect(cardHref).not.toContain("target=");
  expect(cardHref).not.toContain("partner_id");

  await cardCta.click();
  await expect(page).toHaveURL(/\/okazja\?/);

  const partnerCta = page.locator("a.tripownia-buy-cta");
  await expect(partnerCta).toBeVisible();
  await expect(partnerCta).toContainText(/Sprawdź (?:aktualną )?cenę/i);

  const outboundHref = await partnerCta.getAttribute("href");
  expect(outboundHref).toMatch(/^\/przejdz\/[A-Za-z0-9_-]{40,}$/);
  expect(outboundHref).not.toContain("target=");
  expect(outboundHref).not.toContain("partner_id");
  expect(outboundHref).not.toContain("TRIPOWNIAPLPACKAGES");
});

test("stale or unknown price is never shown as a current numeric price", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const stale = page.locator('[data-offer-id="1700000002"]').first();
  await expect(stale).toBeVisible();
  await expect(stale).toHaveAttribute("data-price-verified", "false");
  await expect(stale.locator(".price")).toHaveText(/Sprawdź aktualną cenę/i);
  await expect(stale.locator(".price")).not.toContainText("729");
});

test("Okazje uses the same internal-first affiliate path", async ({ page }) => {
  await page.goto("/okazje", { waitUntil: "domcontentloaded" });

  const cards = page.locator(".offer-card");
  await expect(page.locator('[data-offer-id="1700000001"]').first()).toBeVisible();
  await expect(page.locator('[data-offer-id="1700000002"]').first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(2);

  const hrefs = await cards.locator("a.card-cta").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") || "")
  );

  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href).not.toMatch(/^https?:\/\//);
    expect(href).not.toContain("target=");
    expect(href).not.toContain("partner_id");
    expect(href).toMatch(/^\/(okazja|oferta|sprawdz-oferte)\b/);
  }
});

test("mobile layout keeps core sales content inside the viewport", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only assertion");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const card = page.locator('[data-offer-id="1700000001"]').first();
  await expect(card).toBeVisible();

  const overflow = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(2);

  await expect(card.locator("a.card-cta")).toBeVisible();
});

test("partner-bound CTA skips extra screen while keeping affiliate URL encrypted", async ({ page }) => {
  await page.goto("/okazje", { waitUntil: "domcontentloaded" });

  // Any partner-bound search/SEO link should resolve to an opaque Tripownia
  // exit, never a plaintext affiliate URL or an extra review landing.
  await page.evaluate(() => {
    const anchor = document.createElement("a");
    anchor.id = "checkout-test-link";
    anchor.href = "https://www.kiwi.com/pl/search/results/warsaw-poland/rome-italy";
    anchor.textContent = "Sprawdź lot";
    document.body.appendChild(anchor);
  });

  const link = page.locator("#checkout-test-link");
  await link.hover();
  await expect(link).toHaveAttribute("href", /^\/przejdz\/[A-Za-z0-9_-]{40,}$/);

  const href = await link.getAttribute("href");
  expect(href).not.toContain("kiwi");
  expect(href).not.toContain("target=");
  await expect(link).toHaveAttribute("rel", /sponsored/);
  await expect(link).not.toHaveAttribute("target", "_blank");

  const response = await page.request.get(href, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const location = response.headers().location || "";
  expect(location).toMatch(/^https:\/\//);
  expect(location).not.toContain("/sprawdz-oferte");
});

test("previously issued opaque review URL skips UI and preserves secure exit", async ({ page }) => {
  const token = await page.request.post("/api/affiliate-link", {
    data: {
      target: "https://www.kiwi.com/pl/search/results/warsaw-poland/rome-italy",
      partner: "kiwi",
      mode: "review",
      context: { source: "seo_landing", destination: "Rzym" },
    },
  });
  expect(token.status()).toBe(200);
  const { href } = await token.json();
  expect(href).toMatch(/^\/sprawdz-oferte\?ref=/);

  const response = await page.request.get(href, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const location = response.headers().location || "";
  expect(location).toMatch(/^\/przejdz\/[A-Za-z0-9_-]{40,}$/);
  expect(location).not.toContain("target=");
  expect(location).not.toContain("kiwi");
});
