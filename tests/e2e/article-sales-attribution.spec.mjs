import { expect, test } from "@playwright/test";

test("organic article traffic can be measured at the moment it moves toward an offer", async ({ page }) => {
  // Consent is explicitly granted for this isolated analytics test.
  await page.addInitScript(() => {
    localStorage.setItem("tripownia-consent-v1", "analytics");
  });
  // Keep GA4's dataLayer wrapper local and observable during the test.
  await page.route("**/googletagmanager.com/gtag/js**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/javascript", body: "/* analytics stub */" });
  });

  await page.goto("/lotniska-w-polsce-bez-limitu-100-ml-plynow");

  const link = page.locator('a[data-article-cta="liquids_city_break"]').first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "/city-break");

  await link.click();
  await expect(page).toHaveURL(/\/city-break(?:[/?#]|$)/);

  const events = await page.evaluate(() => {
    return (window.dataLayer || []).filter((entry) =>
      Array.isArray(entry)
      && entry[0] === "event"
      && entry[1] === "article_to_offer_click"
    );
  });

  expect(events).toHaveLength(1);
  expect(events[0][2].action).toBe("liquids_city_break");
  expect(events[0][2].article_path).toBe("/lotniska-w-polsce-bez-limitu-100-ml-plynow");
  expect(events[0][2].target_path).toBe("/city-break");
});
