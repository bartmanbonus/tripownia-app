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


test("Archived offer shares safe title and image without outdated price", async ({ page }) => {
  await page.goto("/o/rzym-529");
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogTitle).toContain("Rzym");
  expect(ogTitle).toContain("aktualne propozycje");
  expect(ogTitle).not.toContain("529");
  expect(new URL(ogImage).pathname).toBe("/opengraph-image");
});

test("Airport landing shares its own city and organic referral is trackable", async ({ page }) => {
  await page.goto("/z-warszawy");
  const shareBox = page.locator(".share-box").first();
  await expect(shareBox.getByRole("button", { name: "Wyślij okazje z Warszawy" })).toBeVisible();

  const fbHref = await shareBox.getByRole("link", { name: "Udostępnij na Facebooku" }).getAttribute("href");
  const destination = sharedDestination(fbHref);
  expect(destination.origin).toBe("https://tripownia.pl");
  expect(destination.pathname).toBe("/z-warszawy");
  expect(destination.searchParams.get("utm_source")).toBe("facebook");
  expect(destination.searchParams.get("utm_content")).toBe("airport_hub_waw");

  await expect(page.locator(".facebook-growth-strip a").first()).toHaveAttribute(
    "href", "https://www.facebook.com/987707741084438"
  );
});

test("Social offer catalog can be shared without tying friends to one historical price", async ({ page }) => {
  await page.goto("/oferty-z-postow");
  const box = page.locator(".share-box").first();
  await expect(box.getByRole("button", { name: "Wyślij Tripownię znajomym" })).toBeVisible();
  const href = await box.getByRole("link", { name: "Udostępnij na Facebooku" }).getAttribute("href");
  const destination = sharedDestination(href);
  expect(destination.pathname).toBe("/oferty-z-postow");
  expect(destination.searchParams.get("utm_content")).toBe("social_catalog_after_airports");
});


test("Branded organic link keeps the offer inside Tripownia and records its source", async ({ request }) => {
  const response = await request.get("/l/fb/bari-alberobello-669", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const target = new URL(response.headers().location);
  expect(target.pathname).toBe("/o/bari-alberobello-669");
  expect(target.searchParams.get("utm_source")).toBe("facebook");
  expect(target.searchParams.get("utm_medium")).toBe("organic_social");
  expect(target.searchParams.get("utm_campaign")).toBe("tripownia_offers");
  expect(target.searchParams.get("utm_content")).toBe("bari-alberobello-669");
  expect(response.headers()["cache-control"]).toBe("no-store");

  const instagram = await request.get("/l/ig/bari-alberobello-669", { maxRedirects: 0 });
  expect(instagram.status()).toBe(307);
  expect(new URL(instagram.headers().location).searchParams.get("utm_source")).toBe("instagram");

  const unknown = await request.get("/l/fb/nonexistent-trip-ownia-offer", { maxRedirects: 0 });
  expect(unknown.status()).toBe(404);
  const invalidChannel = await request.get("/l/other/bari-alberobello-669", { maxRedirects: 0 });
  expect(invalidChannel.status()).toBe(404);
});


test("Old social prices are not promoted in link previews", async ({ page }) => {
  await page.goto("/o/rzym-529");

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");

  expect(ogTitle).toContain("Rzym");
  expect(ogTitle).not.toContain("529");
  expect(ogDescription).toMatch(/aktualne/i);
  expect(ogImage).toContain("/opengraph-image");
});

test("Social catalog shares a tracked internal Tripownia link without exposing affiliate destinations", async ({ page }) => {
  await page.goto("/oferty-z-postow");

  const shareBox = page.locator(".share-box").first();
  await expect(shareBox.getByRole("button", { name: "Wyślij Tripownię znajomym" })).toBeVisible();

  const href = await shareBox.getByRole("link", { name: "Udostępnij na Facebooku" }).getAttribute("href");
  const destination = sharedDestination(href);
  expect(destination.origin).toBe("https://tripownia.pl");
  expect(destination.pathname).toBe("/oferty-z-postow");
  expect(destination.searchParams.get("utm_source")).toBe("facebook");
  expect(destination.searchParams.get("utm_content")).toBe("social_catalog_after_airports");
  expect(destination.toString()).not.toMatch(/partner_id|affiliate|exim/i);
});


test("Airport-specific follow invitation matches the departure hub without hiding offers", async ({ page }) => {
  await page.goto("/z-krakowa");

  await expect(page.getByRole("heading", { name: "Wakacje i wyjazdy z Krakowa" })).toBeVisible();
  const follow = page.locator(".facebook-growth-strip").first();
  await expect(follow).toContainText("Szukasz wyjazdu z Krakowa?");
  await expect(follow.getByRole("link", { name: /Obserwuj Tripownię/ })).toHaveAttribute("href", "https://www.facebook.com/987707741084438");
  await expect(page.getByRole("heading", { name: "Najpierw konkretne oferty z Krakowa" })).toBeVisible();
});


test("Clean Facebook catalog link preserves a trackable social source", async ({ page }) => {
  await page.goto("/fb");
  const resolved = new URL(page.url());
  expect(resolved.pathname).toBe("/oferty-z-postow");
  expect(resolved.searchParams.get("utm_source")).toBe("facebook");
  expect(resolved.searchParams.get("utm_medium")).toBe("organic_social");
  expect(resolved.searchParams.get("utm_campaign")).toBe("fb_catalog");
  await expect(page.getByRole("heading", { name: "Oferty z social mediów" })).toBeVisible();
});

test("Clean Facebook airport link opens the correct section", async ({ page }) => {
  await page.goto("/fb/lotniska");
  const resolved = new URL(page.url());
  expect(resolved.pathname).toBe("/oferty-z-postow");
  expect(resolved.searchParams.get("utm_campaign")).toBe("fb_airports");
  expect(resolved.hash).toBe("#lotniska");
  await expect(page.getByRole("heading", { name: "Z którego lotniska chcesz polecieć?" })).toBeVisible();
});

test("Facebook family and Radar links keep visitors on Tripownia", async ({ page }) => {
  await page.goto("/fb/rodzina");
  const family = new URL(page.url());
  expect(family.pathname).toBe("/wakacje-z-dziecmi");
  expect(family.searchParams.get("utm_campaign")).toBe("fb_family");

  await page.goto("/fb/radar");
  const radar = new URL(page.url());
  expect(radar.pathname).toBe("/radar-tripowni");
  expect(radar.searchParams.get("utm_campaign")).toBe("fb_radar");
  await expect(page.getByRole("heading", { name: /5 wyjazdów, które dziś warto/ })).toBeVisible();
});

test("Facebook offer short link only redirects to a validated Tripownia offer", async ({ page }) => {
  await page.goto("/fb/bari-alberobello-669");
  const offerUrl = new URL(page.url());
  expect(offerUrl.pathname).toBe("/o/bari-alberobello-669");
  expect(offerUrl.searchParams.get("utm_source")).toBe("facebook");
  expect(offerUrl.searchParams.get("utm_campaign")).toBe("fb_offer");
  expect(offerUrl.searchParams.get("utm_content")).toBe("bari-alberobello-669");

  const invalid = await page.goto("/fb/nieznana-oferta-987");
  expect(invalid?.status()).toBe(404);
});

test("Clean Instagram bio link identifies its own source", async ({ page }) => {
  await page.goto("/ig");
  const resolved = new URL(page.url());
  expect(resolved.pathname).toBe("/oferty-z-postow");
  expect(resolved.searchParams.get("utm_source")).toBe("instagram");
  expect(resolved.searchParams.get("utm_campaign")).toBe("instagram_bio");
});
