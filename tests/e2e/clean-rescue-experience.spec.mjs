import { expect, test } from "@playwright/test";

const BASE = "/go/rescue?destination=Tokio%2C%20Japonia&from=2027-03-27&to=2027-04-04&airports=WAW";

test("clean recovery paths redirect directly to a measured partner without exposing a target on the Tripownia URL", async ({ request }) => {
  for (const [kind, expectedHost, required] of [
    ["package", "www2.esky.pl", ["arrivalPlaces", "partner_id"]],
    ["flight", "c111.travelpayouts.com", ["custom_url"]],
    ["hotel", "www.booking.com", ["checkin", "checkout"]],
  ]) {
    const response = await request.get(`${BASE}&kind=${kind}`, { maxRedirects: 0 });
    expect(response.status(), kind).toBe(307);
    expect(response.headers()["cache-control"]).toContain("no-store");
    const redirect = new URL(response.headers()["location"]);
    expect(redirect.hostname, kind).toBe(expectedHost);
    for (const key of required) {
      expect(redirect.searchParams.has(key), `${kind}: ${key}`).toBe(true);
    }
  }
});

test("reject unsafe or missing destination instead of forwarding a free-form target", async ({ request }) => {
  for (const query of [
    "kind=flight&destination=Izrael",
    "kind=package&destination=NieistniejaceMiastoQWERTY",
    "kind=hotel&destination=",
    "kind=car&destination=Tokio",
    "kind=hotel&destination=Tokio&target=https%3A%2F%2Fevil.example.com",
  ]) {
    const response = await request.get(`/go/rescue?${query}`, { maxRedirects: 0 });
    if (query.includes("evil.example.com")) {
      expect(response.status()).toBe(307);
      expect(new URL(response.headers()["location"]).hostname).toBe("www.booking.com");
    } else {
      expect(response.status()).toBe(307);
      expect(new URL(response.headers()["location"], "http://127.0.0.1:3000").pathname).toBe("/szukaj");
    }
  }
});

test("empty search shows short first-party checkout recovery instead of affiliate parameters", async ({ page }) => {
  const payload = JSON.stringify({ ok: true, offers: [], partial: false, checkedAt: new Date().toISOString(), providers: [] });
  await page.route("**/api/today-offers**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: payload }));
  await page.route("**/hotelsapi.esky.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"offers":[],"paging":{}}' }));

  await page.goto("/szukaj?destination=Tokio%2C%20Japonia&from=2027-03-27&to=2027-04-04");
  const rescue = page.locator(".search-v3-empty-actions a[href^='/go/rescue?']");
  await expect(rescue).toHaveCount(3, { timeout: 30000 });

  for (const href of await rescue.evaluateAll((links) => links.map((link) => link.getAttribute("href") || ""))) {
    expect(href).toContain("destination=Tokio");
    expect(href).not.toContain("target=");
    expect(href).not.toContain("partner=");
    expect(href).not.toContain("TRIPOWNIA");
    expect(href).not.toContain("www2.esky");
  }
});

test("sakura experience always has internally linked flight and hotel alternatives", async ({ request }) => {
  const response = await request.get("/podroze-po-przezycia?destination=Tokio%2C%20Japonia&from=2027-03-27&to=2027-04-04&experience=sakura");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("data-experience-alternative=\"flights\"");
  expect(html).toContain("data-experience-alternative=\"hotels\"");
  expect(html).toContain("destination=Tokio");
  expect(html).toContain("outbound=2027-03-27");
  expect(html).toContain("check");
  expect(html).not.toContain("destination=Tokio&amp;target=");
});
