import { expect, test } from "@playwright/test";

const eskyTarget = "https://www2.esky.pl/lot+hotel/portfolio?partner_id=TRIPOWNIAPLPACKAGES&context=pl-packages&arrivalPlaces=co-TR";

test("legacy offer review strips affiliate target from visible Tripownia URL", async ({ request }) => {
  const params = new URLSearchParams({ target: eskyTarget, source: "site_outbound" });
  const response = await request.get(`/sprawdz-oferte?${params}`, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const destination = response.headers()["location"];
  expect(destination).toMatch(/\/sprawdz-oferte\?ref=[A-Za-z0-9_-]+/);
  expect(destination).not.toContain("TRIPOWNIA");
  expect(destination).not.toContain("partner_id");
  expect(destination).not.toContain("target=");

  const detail = await request.get(destination);
  expect(detail.status()).toBe(200);
  const html = await detail.text();
  expect(html).toContain("Sprawdź aktualną cenę");
  expect(html).not.toContain("partner_id=TRIPOWNIAPLPACKAGES");
  expect(html).not.toContain("target=https");
});

test("encrypted link keeps partner attribution on final handoff only", async ({ request }) => {
  const sealed = await request.post("/api/affiliate-link", {
    data: {
      target: eskyTarget,
      mode: "exit",
      context: { destination: "Antalya, Turcja", source: "opaque_test", offer: "123" },
    },
  });
  expect(sealed.status()).toBe(200);
  const { href } = await sealed.json();
  expect(href).toMatch(/^\/przejdz\/[A-Za-z0-9_-]{40,}$/);
  expect(href).not.toContain("partner_id");
  expect(href).not.toContain("TRIPOWNIA");

  const exit = await request.get(href, { maxRedirects: 0 });
  expect(exit.status()).toBe(307);
  const target = new URL(exit.headers()["location"]);
  expect(target.hostname).toBe("www2.esky.pl");
  expect(target.searchParams.get("partner_id")).toBe("TRIPOWNIAPLPACKAGES");
});

test("Tokio sakura page offers functional paths despite no packaged inventory", async ({ request }) => {
  const params = new URLSearchParams({
    destination: "Tokio, Japonia", from: "2027-03-27", to: "2027-04-04", experience: "sakura",
  });
  const response = await request.get(`/podroze-po-przezycia?${params}`);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Nie czekaj na gotowy pakiet");
  expect(html).toContain("/loty?destination=Tokio");
  expect(html).toContain("outbound=2027-03-27");
  expect(html).toContain("inbound=2027-04-04");
  expect(html).toContain("/hotele?destination=Tokio");
  expect(html).toContain("Osaka");
  expect(html).toContain("Fukuoka");
});

test("client link bridge navigates to opaque internal URL, never raw affiliate URL", async ({ page }) => {
  await page.goto("/podroze-po-przezycia");
  await page.evaluate((target) => {
    const link = document.createElement("a");
    link.id = "affiliate-opaque-e2e";
    link.href = target;
    link.textContent = "Sprawdź ofertę testową";
    document.body.appendChild(link);
  }, eskyTarget);
  await page.locator("#affiliate-opaque-e2e").click();
  await page.waitForURL(/\/sprawdz-oferte\?ref=/, { timeout: 15000 });
  expect(page.url()).not.toContain("partner_id");
  expect(page.url()).not.toContain("TRIPOWNIA");
});
