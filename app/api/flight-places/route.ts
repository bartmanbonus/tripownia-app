import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Place = {
  type?: string;
  code?: string;
  name?: string;
  city_code?: string;
  city_name?: string;
  country_name?: string;
};

export async function GET(request: NextRequest) {
  const q = String(request.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ ok: true, places: [] });

  const url = new URL("https://autocomplete.travelpayouts.com/places2");
  url.searchParams.set("term", q);
  url.searchParams.set("locale", "pl");
  url.searchParams.append("types[]", "city");
  url.searchParams.append("types[]", "airport");

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`Travelpayouts autocomplete HTTP ${response.status}`);
    const rows = (await response.json()) as Place[];
    const seen = new Set<string>();
    const places = rows
      .map((row) => {
        const code = String(row.city_code || row.code || "").toUpperCase();
        const name = String(row.city_name || row.name || "").trim();
        const country = String(row.country_name || "").trim();
        const airport = row.type === "airport" ? String(row.name || "").trim() : "";
        return { code, name, country, airport, type: row.type || "city" };
      })
      .filter((row) => row.code && row.name)
      .filter((row) => {
        const key = `${row.code}|${row.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);

    return NextResponse.json(
      { ok: true, places },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ ok: true, places: [] }, { status: 200 });
  }
}
