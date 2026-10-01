import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RawPlace = {
  type?: string;
  code?: string;
  name?: string;
  city_code?: string;
  city_name?: string;
  country_code?: string;
  country_name?: string;
};

type Place = {
  code: string;
  name: string;
  country: string;
  airport: string;
  type: string;
  searchCode?: string;
};

const QUERY_ALIASES: Record<string, string> = {
  rpa: "South Africa",
  "afryka poludniowa": "South Africa",
  "republika poludniowej afryki": "South Africa",
  "south africa": "South Africa",
  kapsztad: "Cape Town",
  "cape town": "Cape Town",
  kenia: "Kenya",
  kenya: "Kenya",
  gambia: "Gambia",
  banjul: "Banjul",
  maskat: "Muscat",
  muscat: "Muscat",
  oman: "Oman",
  zea: "United Arab Emirates",
  usa: "United States",
};

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pl-PL")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scorePlace(place: Place, rawQuery: string, resolvedQuery: string) {
  const raw = normalized(rawQuery);
  const resolved = normalized(resolvedQuery);
  const code = normalized(place.code);
  const name = normalized(place.name);
  const country = normalized(place.country);

  if (code === raw || name === raw) return 0;
  if (name === resolved) return 0;
  if (place.type === "country" && country === resolved) return 0;
  if (country === resolved) return 1;
  if (name.startsWith(resolved) || resolved.startsWith(name)) return 2;
  if (name.includes(resolved) || country.includes(resolved)) return 3;
  if (name.startsWith(raw) || country.startsWith(raw)) return 4;
  if (name.includes(raw) || country.includes(raw)) return 5;
  return 20;
}

export async function GET(request: NextRequest) {
  const q = String(request.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ ok: true, places: [] });

  const alias = QUERY_ALIASES[normalized(q)];
  const resolvedQuery = alias || q;

  const url = new URL("https://autocomplete.travelpayouts.com/places2");
  url.searchParams.set("term", resolvedQuery);
  url.searchParams.set("locale", "pl");
  url.searchParams.append("types[]", "country");
  url.searchParams.append("types[]", "city");
  url.searchParams.append("types[]", "airport");

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`Travelpayouts autocomplete HTTP ${response.status}`);

    const rows = (await response.json()) as RawPlace[];
    const primaryCityByCountry = new Map<string, string>();

    for (const row of rows) {
      if (row.type !== "city") continue;
      const countryCode = String(row.country_code || "").toUpperCase();
      const cityCode = String(row.city_code || row.code || "").toUpperCase();
      if (countryCode && /^[A-Z]{3}$/.test(cityCode) && !primaryCityByCountry.has(countryCode)) {
        primaryCityByCountry.set(countryCode, cityCode);
      }
    }

    const mapped: Place[] = rows
      .map((row) => {
        if (row.type === "country") {
          const code = String(row.code || "").toUpperCase();
          const name = String(row.name || "").trim();
          const searchCode = primaryCityByCountry.get(code);
          return {
            code,
            name,
            country: name,
            airport: "",
            type: "country",
            ...(searchCode ? { searchCode } : {}),
          };
        }

        const code = String(row.city_code || row.code || "").toUpperCase();
        const name = String(row.city_name || row.name || "").trim();
        const country = String(row.country_name || "").trim();
        const airport = row.type === "airport" ? String(row.name || "").trim() : "";
        return {
          code,
          name,
          country,
          airport,
          type: row.type || "city",
          searchCode: code,
        };
      })
      .filter((row) => /^[A-Z]{2,3}$/.test(row.code) && row.name);

    const ranked = mapped
      .map((place, index) => ({ place, index, score: scorePlace(place, q, resolvedQuery) }))
      .sort((a, b) => a.score - b.score || a.index - b.index);

    const hasRelevant = ranked.some((row) => row.score <= 5);
    const seen = new Set<string>();
    const places = ranked
      .filter((row) => !hasRelevant || row.score <= 5)
      .map((row) => row.place)
      .filter((row) => {
        const key = `${row.type}|${row.code}|${row.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);

    return NextResponse.json(
      { ok: true, places },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("[flight_places_error]", error);
    return NextResponse.json({ ok: true, places: [] }, { status: 200 });
  }
}
