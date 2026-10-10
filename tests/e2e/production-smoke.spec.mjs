import { expect, test } from "@playwright/test";

test.describe("Tripownia production smoke", () => {
  test.skip(process.env.E2E_PRODUCTION !== "1", "Run only with npm run test:e2e:prod");

  async function checkSalesCards(page) {
    const cards = page.locator(".offer-card");
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    const ctas = cards.locator("a.card-cta");
    expect(await ctas.count()).toBeGreaterThan(0);

    // A customer must always enter the Tripownia funnel before leaving for a partner.
    // Reject absolute, protocol-relative, script, empty and fragment-only destinations.
    const broken = await ctas.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")?.trim() || "")
        .filter((href) =>
          !href.startsWith("/") || href.startsWith("//") ||
          /[\\u0000-\\u001f]/.test(href)
        )
    );
    expect(broken).toEqual([]);

    const unverifiedPrices = page.locator('.offer-card[data-price-verified="false"] .price');
    for (let index = 0, count = await unverifiedPrices.count(); index < count; index += 1) {
      await expect(unverifiedPrices.nth(index)).toContainText(/Sprawdź aktualną cenę/i);
    }
  }

  test("homepage retains offers and safe internal purchase links", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await checkSalesCards(page);
  });

  test("Okazje retains offers and safe internal purchase links", async ({ page }) => {
    const response = await page.goto("/okazje", { waitUntil: "domcontentloaded" });
    expect(response?.status() || 0).toBeLessThan(500);
    await checkSalesCards(page);
  });
});
