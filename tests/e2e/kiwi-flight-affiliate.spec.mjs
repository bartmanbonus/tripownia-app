import { expect, test } from "@playwright/test";

test("flight exit hides Kiwi tracking parameters and preserves route and dates", async ({ request }) => {
  const search = new URLSearchParams({
    from: "WAW", to: "LIS", departure: "2026-12-29",
    return: "2027-01-03", source: "flight_detail", destination: "Lizbona",
  });
  const first = await request.get("/go/flight?" + search, { maxRedirects: 0 });
  expect(first.status()).toBe(307);
  const opaque = new URL(first.headers()["location"], "http://127.0.0.1:3000");
  expect(opaque.pathname).toMatch(/^\/przejdz\/[A-Za-z0-9_-]{40,}$/);
  expect(opaque.search).toBe("");
  expect(opaque.href).not.toContain("kiwi");
  const final = await request.get(opaque.pathname, { maxRedirects: 0 });
  expect(final.status()).toBe(307);
  const tracker = new URL(final.headers()["location"]);
  expect(tracker.hostname).toBe("c111.travelpayouts.com");
  expect(tracker.searchParams.get("promo_id")).toBe("3791");
  expect(tracker.searchParams.get("shmarker")).toContain("TRIPOWNIAPL");
  const deep = new URL(tracker.searchParams.get("custom_url"));
  expect(deep.hostname).toBe("www.kiwi.com");
  expect(deep.pathname).toBe("/deep");
  expect(deep.searchParams.get("from")).toBe("WAW");
  expect(deep.searchParams.get("to")).toBe("LIS");
  expect(deep.searchParams.get("departure")).toBe("2026-12-29");
  expect(deep.searchParams.get("return")).toBe("2027-01-03");
});

test("invalid flight codes are not sent to partner", async ({ request }) => {
  const res = await request.get("/go/flight?from=../../x&to=LIS", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(new URL(res.headers()["location"], "http://127.0.0.1:3000").pathname).toBe("/loty");
});

test("package link keeps its eSky partner tracking", async ({ request }) => {
  const target = "https://www2.esky.pl/lot+hotel/portfolio?partner_id=TRIPOWNIAPLPACKAGES";
  const res = await request.get("/go/live?" + new URLSearchParams({ partner: "esky", target }), { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  const redirect = new URL(res.headers()["location"]);
  expect(redirect.hostname).toBe("www2.esky.pl");
  expect(redirect.searchParams.get("partner_id")).toBe("TRIPOWNIAPLPACKAGES");
});
