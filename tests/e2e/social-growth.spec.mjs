import { expect, test } from "@playwright/test";

function sharedDestination(href) {
  const popup = new URL(href);
  expect(popup.hostname).toBe("www.facebook.com");
  const destination = popup.searchParams.get("u");
  expect(destination).toBeTruthy();
  return new URL(destination);
}

test("Radar can be shared and offers a trackable Facebook follow path", async ({ page }) => {
  await page.goto("/radar-tripowni");

  await expect(page.getByRole("heading", { name: /5 wyjazdów, które dziś warto/i })).toBeVisible();

  const shareBox = page.locator(".share-box").first();
  await expect(shareBox.getByRole("button", { name: "Wyślij Radar znajomym" })).toBeVisible();

  const shareHref = await shareBox.getByRole("link", { name: "Udostępnij na Facebooku" }).getAttribute("href");
  const shared = sharedDestination(shareHref);
  expect(shared.origin).toBe("https://tripownia.pl");
  expect(shared.pathname).toBe("/radar-tripowni");
  expect(shared.searchParams.get("utm_source")).toBe("facebook");
  expect(shared.searchParams.get("utm_medium")).toBe("social_share");
  expect(shared.searchParams.get("utm_campaign")).toBe("organic_share");
  expect(shared.searchParams.get("utm_content")).toBe("daily_radar");

  const follow = page.locator(".facebook-growth-strip a").first();
  await expect(follow).toBeVisible();
  await expect(follow).toHaveAttribute("href", "https://www.facebook.com/987707741084438");
});

test("Social offer sharing stays inside Tripownia and shows Facebook follow after offer details", async ({ page }) => {
  await page.goto("/o/rzym-529");

  const shareBox = page.locator(".share-box").first();
  await expect(shareBox.getByText("Kto poleciałby z Tobą?")).toBeVisible();

  const href = await shareBox.getByRole("link", { name: "Udostępnij na Facebooku" }).getAttribute("href");
  const shared = sharedDestination(href);
  expect(shared.origin).toBe("https://tripownia.pl");
  expect(shared.pathname).toBe("/o/rzym-529");
  expect(shared.searchParams.get("utm_content")).toBe("social_offer_after_details");
  await expect(page.locator(".facebook-growth-strip a").first()).toHaveAttribute("href", "https://www.facebook.com/987707741084438");
});


test("Social comments landing offers airport-specific options and keeps main offers", async ({ page }, testInfo) => {
  await page.goto("/oferty-z-postow#lotniska");

  await expect(page.getByRole("heading", { name: "Oferty z social mediów", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Z którego lotniska chcesz polecieć?" })).toBeVisible();

  const links = page.locator('[class*="SocialDepartureChoices_airportCard"]');
  await expect(links).toHaveCount(6);
  const choices = [
    ["/z-warszawy", "Warszawa"],
    ["/z-krakowa", "Kraków"],
    ["/z-katowic", "Katowice"],
    ["/z-gdanska", "Gdańsk"],
    ["/z-wroclawia", "Wrocław"],
    ["/z-poznania", "Poznań"],
  ];
  for (const [href, city] of choices) {
    await expect(links.filter({ hasText: city })).toHaveAttribute("href", href);
  }

  const categories = page.locator('[class*="SocialDepartureChoices_typeCard"]');
  await expect(categories).toHaveCount(3);
  await expect(categories.filter({ hasText: "Wyjazd z dziećmi" })).toHaveAttribute("href", "/wakacje-z-dziecmi");
  await expect(categories.filter({ hasText: "All Inclusive" })).toHaveAttribute("href", "/tanie-all-inclusive");

  const follow = page.locator(".facebook-growth-strip a").first();
  await expect(follow).toHaveAttribute("href", "https://www.facebook.com/987707741084438");

  if (testInfo.project.name.includes("mobile")) {
    const overflow = await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  }
});
