import { expect, test } from "@playwright/test";

test("New Year editorial guide keeps a distinct indexable URL", async ({ request }) => {
  const path = "/gdzie-na-sylwestra-2026-2027-15-kierunkow";
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('rel="canonical"');
  expect(html).toContain("gdzie-na-sylwestra-2026-2027-15-kierunkow");
  expect(html).toContain("Gdzie polecieć na Sylwestra 2026/2027?");
  expect(html).toContain("/sylwester");
});

test("baggage guide answers weight question in its H1", async ({ request }) => {
  const response = await request.get("/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toMatch(/<h1[^>]*>Czy bagaż podręczny jest ważony\?/);
  expect(html).toContain("Limity i zasady dwóch bagaży");
});
