import { expect, test } from "@playwright/test";

test.describe("Tripownia production smoke", () => {
  test.skip(process.env.E2E_PRODUCTION !== "1", "Run only with npm run test:e2e:prod");

  test("public sales path has offers and never links a card directly to a partner", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const firstCard = page.locator(".offer-card").first();
    await expect(firstCard).toBeVisible({ timeout: 30_000 });

    const cards = page.locator(".offer-card");
    expect(await cards.count()).toBeGreaterThan(0);

    const directExternal = await cards.locator("a.card-cta").evaluateAll((links) =>
      links.filter((link) => /^https?:\/\//i.test(link.getAttribute("href") || "")).length
    );
    expect(directExternal).toBe(0);

    const unverifiedPrices = page.locator('.offer-card[data-price-verified="false"] .price');
    const count = await unverifiedPrices.count();
    for (let index = 0; index < count; index += 1) {
      await expect(unverifiedPrices.nth(index)).toContainText(/Sprawdź aktualną cenę/i);
    }
  });

  test("Okazje renders commercial cards without a 5xx failure", async ({ page }) => {
    const response = await page.goto("/okazje", { waitUntil: "domcontentloaded" });
    expect(response?.status() || 0).toBeLessThan(500);
    await expect(page.locator(".offer-card").first()).toBeVisible({ timeout: 30_000 });
  });
});
