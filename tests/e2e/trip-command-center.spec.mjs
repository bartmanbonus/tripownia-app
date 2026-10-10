import { expect, test } from "@playwright/test";

test("Centrum Podróży guides a first-time visitor", async ({ page }) => {
  await page.goto("/app", { waitUntil: "domcontentloaded" });
  const center = page.locator("#centrum-podrozy");
  await expect(center).toBeVisible();
  await expect(center.locator("h2")).toHaveText("Twoje centrum podróży");
  await expect(center.getByRole("link", { name: /Znajdź wyjazd/ })).toHaveAttribute("href", "/szukaj");
  await expect(center.getByRole("link", { name: /Mam już rezerwację/ })).toHaveAttribute("href", "/dodaj-podroz?mode=owned");
  await expect(center.getByRole("link", { name: /Moje podróże/ })).toHaveAttribute("href", "/moje-podroze");
});

test("Tripownia remembers progress and suggests the next missing service", async ({ page }) => {
  await page.goto("/app", { waitUntil: "domcontentloaded" });
  const center = page.locator("#centrum-podrozy");
  await expect(center).toBeVisible();

  await page.evaluate(() => {
    localStorage.setItem("tripownia-my-trip", JSON.stringify({
      tripId: "e2e-trip-rzym",
      offerSnapshot: { city: "Rzym", country: "Włochy", dates: "15–18 listopada 2026" },
      journeyPieces: { flight: { status: "owned" }, hotel: { status: "selected" } },
      checklist: {},
      dayPlan: [],
    }));
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
  });

  await expect(center.locator("h2")).toContainText("Rzym");
  await expect(center.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(center.locator(".trip-command-next")).toContainText("nocleg");

  await center.getByRole("button", { name: "Oznacz jako zarezerwowane: Nocleg" }).click();
  await expect(center.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await expect(center.locator(".trip-command-next")).toContainText("transfer");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("tripownia-my-trip") || "null"));
  expect(saved.journeyPieces.hotel.status).toBe("owned");

  await center.getByRole("button", { name: "Cofnij oznaczenie: Nocleg" }).click();
  await expect(center.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
});

test("Homepage introduces the unified trip center to visitors", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const banner = page.locator(".trip-command-center-compact");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Twoje centrum podróży");
  await expect(banner.getByRole("link", { name: /Poznaj centrum Tripowni/ })).toHaveAttribute("href", "/app");
});
