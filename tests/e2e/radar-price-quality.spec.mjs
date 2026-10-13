import { expect, test } from "@playwright/test";

const now = () => new Date().toISOString();
function futureDate(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function offer(id, city, country, price, board, nights, partner = "tui", overrides = {}) {
  const start = futureDate(30);
  const end = futureDate(30 + nights);
  const flight = partner === "kiwi";
  const affiliateUrl = flight
    ? "https://c111.travelpayouts.com/click?shmarker=740301.TRIPOWNIAPL&promo_id=3791&source_type=customlink&type=click&custom_url=" +
      encodeURIComponent("https://www.kiwi.com/deep?from=WAW&to=MIL&departure=" + start + "&return=" + end)
    : partner === "esky"
    ? "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?packageId=E2E-TEST&partner_id=TRIPOWNIAPLPACKAGES"
    : "https://pdt.tradedoubler.com/click?a(3487177)p(308388)product(24864-E2E)ttid(19)url(https%3A%2F%2Fwww.tui.pl%2F)";
  return {
    id, flag: "✈️", city, country, price, priceCheckedAt: now(),
    availabilityStatus: "available", departure: "Warszawa Chopina", airportCode: "WAW",
    nights, weather: "sprawdź", score: 8.8, tag: "DOBRA OPCJA",
    reason: "Oferta testowa", image: "/images/destinations/rzym.jpg",
    category: flight ? ["flight", "city"] : nights <= 5 ? ["city"] : ["wakacje"],
    hotel: flight ? "Sam lot" : "Hotel testowy",
    board, dates: start + "–" + end, partner, affiliateUrl,
    linkType: "exact", linkMatch: flight ? "parameters" : "exact",
    ...overrides,
  };
}
test("radar shows cheap DIFFERENT trip types, clear flight disclaimer and tracked internal offer pages", async ({ page }) => {
  const offers = [
    offer(1900000001,"Mediolan","Włochy",145,"Bez hotelu",2,"kiwi"),
    offer(1900000002,"Rzym","Włochy",349,"Bez hotelu",3,"kiwi"),
    offer(1700000001,"Lizbona","Portugalia",699,"Śniadanie",3,"esky"),
    offer(1700000002,"Hurghada","Egipt",1999,"All Inclusive",7),
    offer(1700000003,"Kreta","Grecja",1499,"Śniadanie",7),
    offer(1700000004,"Zanzibar","Tanzania",3299,"Śniadanie",7),
    offer(1700000005,"Djerba","Tunezja",2699,"All Inclusive",7),
    offer(1700000006,"Malta","Malta",8999,"Śniadanie",3,"esky"),
    offer(1700000007,"Barcelona","Hiszpania",199,"Śniadanie",3,"esky",{priceCheckedAt:"2024-01-01T00:00:00.000Z"}),
  ];
  await page.route("**/api/deals**", route => route.fulfill({
    status:200, contentType:"application/json",
    body:JSON.stringify({ok:true,sourceType:"live",checkedAt:now(),offers}),
  }));
  await page.goto("/radar-tripowni");
  const cards = page.locator("[data-radar-kind]");
  await expect(cards).toHaveCount(6);
  await expect(page.getByText("Mediolan").first()).toBeVisible();
  await expect(page.getByText("Hurghada").first()).toBeVisible();
  await expect(page.getByText("Zanzibar").first()).toBeVisible();
  await expect(page.getByText("Cena z kalendarza lotów").first()).toBeVisible();
  await expect(page.getByText("8999 zł")).toHaveCount(0);
  const kinds = await cards.evaluateAll(nodes=>nodes.map(n=>n.getAttribute("data-radar-kind")));
  expect(new Set(kinds).size).toBeGreaterThanOrEqual(4);
  const hrefs = await cards.locator("a").evaluateAll(nodes=>nodes.map(n=>n.getAttribute("href")));
  expect(hrefs.every(href=>href?.startsWith("/okazja?")||href?.startsWith("/okazja?ref="))).toBe(true);
  await page.getByRole("button",{name:/City break/}).click();
  await expect(page.locator("[data-radar-kind]")).toHaveCount(1);
  await page.getByRole("button",{name:/Wszystkie/}).click();
  await expect(page.locator("[data-radar-kind]")).toHaveCount(6);
});
test("radar never fills the screen with fake or expensive offers when source is empty",async ({page})=>{
  await page.route("**/api/deals**",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,sourceType:"published_fallback",checkedAt:now(),offers:[]})}));
  await page.goto("/radar-tripowni");
  await expect(page.locator("[data-radar-kind]")).toHaveCount(0);
  await expect(page.getByText(/nie znaleźliśmy wystarczająco tanich/i)).toBeVisible();
  await expect(page.getByRole("link",{name:/Wyszukaj wszystkie okazje/})).toBeVisible();
});
