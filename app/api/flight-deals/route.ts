import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RawPrice = {
  destination?: string;
  depart_date?: string;
  return_date?: string;
  number_of_changes?: number;
  value?: number;
  actual?: boolean;
  show_to_affiliates?: boolean;
};

type Direction = {
  iata?: string;
  name?: string;
  country?: string;
};

function safeIata(value: string | null, fallback = "WAW") {
  const normalized = String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
  return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback;
}

async function fetchJson(urls: string[]) {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 900 },
      });
      if (!response.ok) {
        lastError = new Error("HTTP " + response.status);
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("flight_data_unavailable");
}

function searchPath(origin: string, destination: string, departDate: string, returnDate: string) {
  const ddmm = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? match[3] + match[2] : "";
  };
  const outbound = ddmm(departDate);
  const inbound = ddmm(returnDate);
  const path = outbound && inbound
    ? origin + outbound + destination + inbound + "1"
    : "";
  const url = new URL(path ? "https://www.aviasales.com/search/" + path : "https://www.aviasales.com/");
  url.searchParams.set("marker", "695999.TRIPOWNIAPL");
  url.searchParams.set("shmarker", "695999.TRIPOWNIAPL");
  return url.toString();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = safeIata(params.get("origin"));
  const direct = params.get("direct") === "true";
  const minDays = Math.max(1, Math.min(30, Number(params.get("minDays") || 2)));
  const maxDays = Math.max(minDays, Math.min(30, Number(params.get("maxDays") || 14)));

  const query = new URLSearchParams({
    origin_iata: origin,
    period: "year",
    direct: direct ? "true" : "false",
    one_way: "false",
    locale: "pl",
    currency: "pln",
    min_trip_duration_in_days: String(minDays),
    max_trip_duration_in_days: String(maxDays),
  });

  const directionsQuery = new URLSearchParams({
    origin_iata: origin,
    one_way: "false",
    locale: "pl",
  });

  try {
    const [pricesRaw, directionsRaw] = await Promise.all([
      fetchJson([
        "https://map.aviasales.com/prices.json?" + query.toString(),
        "http://map.aviasales.com/prices.json?" + query.toString(),
      ]),
      fetchJson([
        "https://map.aviasales.com/supported_directions.json?" + directionsQuery.toString(),
        "http://map.aviasales.com/supported_directions.json?" + directionsQuery.toString(),
      ]),
    ]);

    const prices: RawPrice[] = Array.isArray(pricesRaw) ? pricesRaw : [];
    const directions: Direction[] = Array.isArray(directionsRaw?.directions) ? directionsRaw.directions : [];
    const names = new Map(directions.map((item) => [String(item.iata || "").toUpperCase(), item]));

    const bestByDestination = new Map<string, RawPrice>();
    for (const row of prices) {
      const destination = String(row.destination || "").toUpperCase();
      const value = Number(row.value || 0);
      if (!/^[A-Z]{3}$/.test(destination) || !value || value <= 0) continue;
      if (row.show_to_affiliates === false) continue;
      const current = bestByDestination.get(destination);
      if (!current || Number(current.value || Infinity) > value) bestByDestination.set(destination, row);
    }

    const offers = Array.from(bestByDestination.entries())
      .map(([destination, row]) => {
        const info = names.get(destination);
        const departDate = String(row.depart_date || "");
        const returnDate = String(row.return_date || "");
        return {
          destination,
          name: String(info?.name || destination),
          country: String(info?.country || ""),
          price: Math.round(Number(row.value || 0)),
          departDate,
          returnDate,
          changes: Number(row.number_of_changes || 0),
          actual: Boolean(row.actual),
          affiliateUrl: searchPath(origin, destination, departDate, returnDate),
        };
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 80);

    return NextResponse.json(
      { ok: true, origin, direct, offers },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
    );
  } catch (error) {
    console.error("[flight_deals_error]", error);
    return NextResponse.json(
      { ok: false, origin, direct, offers: [], error: "flight_deals_unavailable" },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
