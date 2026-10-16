import { test, expect } from "@playwright/test";

test("homepage starts in universal mode and lets the user choose or clear a category", async ({ page }) => {
  await page.goto("/");
  const search = page.locator("#wyszukiwarka .search-v3").first();
  await expect(search).toBeVisible();
  await expect(search.locator(".search-v3-tabs button[aria-pressed='true']")).toHaveCount(0);
  await expect(search.locator("#tripownia-destination")).toBeVisible();

  const cityBreak = search.locator(".search-v3-tabs button", { hasText: "City break" });
  await cityBreak.click();
  await expect(cityBreak).toHaveAttribute("aria-pressed", "true");
  await cityBreak.click();
  await expect(search.locator(".search-v3-tabs button[aria-pressed='true']")).toHaveCount(0);

  await search.locator("#tripownia-destination").fill("Wietnam");
  await search.locator(".search-v3-submit").click();
  await expect(search.locator(".search-v3-results")).toBeVisible();
  await expect(search.locator(".search-v3-universal-actions")).toBeVisible();
});
