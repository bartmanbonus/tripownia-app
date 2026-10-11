import { expect, test } from "@playwright/test";

test("elastyczne loty mają jasne ustawienia początkowe i działające filtry", async ({ page }) => {
  await page.goto("/loty", { waitUntil: "domcontentloaded" });

  const finder = page.locator(".flight-hunt-clean").first();
  await expect(finder).toBeVisible();

  const origin = finder.locator(".flight-hunt-picker-trigger").first();
  const destination = finder.locator(".flight-hunt-picker-trigger").nth(1);
  const searchButton = finder.locator(".flight-hunt-submit");

  await expect(origin).toContainText("Warszawa");
  await expect(destination).toContainText("Gdziekolwiek");
  await expect(searchButton).toBeEnabled();
  await expect(searchButton).toContainText("Odkryj tanie kierunki");

  const tripLengths = finder.locator(".flight-hunt-stay-pills button");
  await expect(tripLengths).toHaveCount(4);
  await expect(tripLengths.nth(0)).toHaveAttribute("aria-pressed", "true");
  await tripLengths.nth(1).click();
  await expect(tripLengths.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(tripLengths.nth(0)).toHaveAttribute("aria-pressed", "false");

  await destination.click();
  const picker = finder.locator(".flight-hunt-checkbox-picker").nth(1);
  await expect(picker.locator(".flight-hunt-picker-menu")).toBeVisible();
  await picker.locator(".flight-hunt-check-row").filter({ hasText: "Barcelona" }).click();
  await picker.getByRole("button", { name: "Gotowe" }).click();

  await expect(destination).toContainText("Barcelona");
  await expect(searchButton).toContainText("Pokaż najtańsze loty");
  await expect(searchButton).toBeEnabled();

  const months = finder.locator(".flight-hunt-month select option");
  await expect(months).toHaveCount(16);

  // The search button must fit in the viewport on small screens.
  if (page.viewportSize()?.width <= 780) {
    const bounds = await searchButton.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, viewport: window.innerWidth };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(-1);
    expect(bounds.right).toBeLessThanOrEqual(bounds.viewport + 1);
  }
});

test("zmiana na konkretne daty zachowuje oddzielną wyszukiwarkę lotów", async ({ page }) => {
  await page.goto("/loty", { waitUntil: "domcontentloaded" });

  const switcher = page.locator(".flights-mode-switch");
  await switcher.getByRole("tab", { name: /Mam konkretne daty/ }).click();
  await expect(page.locator(".flights-exact-panel")).toBeVisible();
  await expect(page.locator(".flight-hunt-clean")).toHaveCount(0);
});
