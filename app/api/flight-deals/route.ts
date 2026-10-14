import { eskyFlightExitHref } from "@/lib/eskyFlights";
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

const FALLBACK_DESTINATIONS = [
  { code: "ROM", name: "Rzym", country: "Włochy" },
  { code: "MIL", name: "Mediolan", country: "Włochy" },
  { code: "BCN", name: "Barcelona", country: "Hiszpania" },
  { code: "LIS", name: "Lizbona", country: "Portugalia" },
  { code: "PAR", name: "Paryż", country: "Francja" },
  { code: "LON", name: "Londyn", country: "Wielka Brytania" },
  { code: "ATH", name: "Ateny", country: "Grecja" },
  { code: "PMI", name: "Majorka", country: "Hiszpania" },
  { code: "TFS", name: "Teneryfa", country: "Hiszpania" },
  { code: "AGP", name: "Malaga", country: "Hiszpania" },
  { code: "ALC", name: "Alicante", country: "Hiszpania" },
  { code: "VIE", name: "Wiedeń", country: "Austria" },
  { code: "PRG", name: "Praga", country: "Czechy" },
  { code: "BUD", name: "Budapeszt", country: "Węgry" },
  { code: "CPH", name: "Kopenhaga", country: "Dania" },
  { code: "OSL", name: "Oslo", country: "Norwegia" },
  { code: "ARN", name: "Sztokholm", country: "Szwecja" },
  { code: "TLL", name: "Tallinn", country: "Estonia" },
  { code: "RIX", name: "Ryga", country: "Łotwa" },
  { code: "IST", name: "Stambuł", country: "Turcja" },
  { code: "DXB", name: "Dubaj", country: "ZEA" },
];

type CalendarRow = {
  depart_date?: string;
  depart_stops?: number;
  return_date?: string;
  return_stops?: number;
  value?: number | null;
};

async function fetchCalendarFallback(origin: string, minDays: number, maxDays: number, direct: boolean, months: string[]) {
  const batches: Array<typeof FALLBACK_DESTINATIONS> = [];
  for (let index = 0; index < FALLBACK_DESTINATIONS.length; index += 6) {
    batches.push(FALLBACK_DESTINATIONS.slice(index, index + 6));
  }

  const offers: Array<{
    destination: string;
    name: string;
    country: string;
    price: number;
    departDate: string;
    returnDate: string;
    changes: number;
    actual: boolean;
    affiliateUrl: string;
  }> = [];

  for (const batch of batches) {
    const rows = await Promise.all(batch.map(async (place) => {
      const monthKeys = months.length ? months : [""];
      const candidates = await Promise.all(monthKeys.map(async (month) => {
        try {
          const upstream = new URL("https://suggest.apistp.com/uaca/v1/get_data_forward");
          upstream.searchParams.set("service", "calendar_aviasales_month");
          upstream.searchParams.set("origin_iata", origin);
          upstream.searchParams.set("currency", "pln");
          upstream.searchParams.set("destination_iata", place.code);
          upstream.searchParams.set("one_way", "false");
          upstream.searchParams.set("min_trip_duration", String(minDays));
          upstream.searchParams.set("max_trip_duration", String(maxDays));
          upstream.searchParams.set("only_direct", direct ? "true" : "false");
          if (month) upstream.searchParams.set("month", month);
          upstream.searchParams.set("host", "hydra.aviasales.com");

          const response = await fetch(upstream.toString(), {
            headers: { Accept: "application/json" },
            next: { revalidate: 900 },
          });
          if (!response.ok) return null;
          const data = await response.json() as { month?: Record<string, CalendarRow> };
          const best = Object.values(data?.month || {})
            .filter((row) => Number(row.value || 0) > 0 && row.depart_date && row.return_date)
            .filter((row) => inSelectedMonths(String(row.depart_date || ""), months))
            .sort((a, b) => Number(a.value || Infinity) - Number(b.value || Infinity))[0];
          if (!best) return null;

          const departDate = String(best.depart_date || "");
          const returnDate = String(best.return_date || "");
          return {
            destination: place.code,
            name: place.name,
            country: place.country,
            price: Math.round(Number(best.value || 0)),
            departDate,
            returnDate,
            changes: Math.max(Number(best.depart_stops || 0), Number(best.return_stops || 0)),
            actual: true,
            affiliateUrl: searchPath(origin, place.code, departDate, returnDate),
          };
        } catch {
          return null;
        }
      }));
      return candidates.filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => a.price - b.price)[0] || null;
    }));
    offers.push(...rows.filter((row): row is NonNullable<typeof row> => Boolean(row)));
  }

  return offers.sort((a, b) => a.price - b.price);
}

function safeIata(value: string | null, fallback = "WAW") {
  const normalized = String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
  return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback;
}

function selectedMonths(value: string | null) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const maxMonth = new Date();
  maxMonth.setUTCMonth(maxMonth.getUTCMonth() + 18);
  const upperBound = maxMonth.toISOString().slice(0, 7);
  return [...new Set(String(value || "").split(",").map((value) => value.trim())
    .filter((value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && value >= thisMonth && value <= upperBound))].slice(0, 6);
}

function inSelectedMonths(date: string, months: string[]) {
  return !months.length || months.includes(date.slice(0, 7));
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

      const contentType = response.headers.get("content-type") || "";
      const body = await response.text();
      const trimmed = body.trim();
      if (!contentType.includes("json") && !trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        lastError = new Error("flight_data_non_json");
        continue;
      }

      try {
        return JSON.parse(trimmed);
      } catch {
        lastError = new Error("flight_data_invalid_json");
      }
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("flight_data_unavailable");
}

function searchPath(origin: string, destination: string, departDate: string, returnDate: string) {
  return eskyFlightExitHref({ origin, destination, departure: departDate, returnDate, source: "flight_deals" });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = safeIata(params.get("origin"));
  const direct = params.get("direct") === "true";
  const months = selectedMonths(params.get("months") || params.get("month"));
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

    // Retain several distinct date combinations per direction. A single cheapest
    // date previously hid every other bookable itinerary in the year feed.
    const byDestination = new Map<string, RawPrice[]>();
    for (const row of prices) {
      const destination = String(row.destination || "").toUpperCase();
      const value = Number(row.value || 0);
      if (!/^[A-Z]{3}$/.test(destination) || !value || value <= 0) continue;
      if (row.show_to_affiliates === false || !inSelectedMonths(String(row.depart_date || ""), months)) continue;
      if (!/^20\d{2}-\d{2}-\d{2}$/.test(String(row.depart_date || "")) || !/^20\d{2}-\d{2}-\d{2}$/.test(String(row.return_date || ""))) continue;
      if (String(row.return_date) <= String(row.depart_date)) continue;
      const list = byDestination.get(destination) || [];
      const identity = `${row.depart_date}|${row.return_date}`;
      const index = list.findIndex((candidate) => `${candidate.depart_date}|${candidate.return_date}` === identity);
      if (index === -1) list.push(row);
      else if (Number(list[index].value || Infinity) > value) list[index] = row;
      byDestination.set(destination, list);
    }

    let offers = Array.from(byDestination.entries())
      .flatMap(([destination, rows]) => rows
        .sort((a, b) => Number(a.value || Infinity) - Number(b.value || Infinity))
        .slice(0, 4)
        .map((row) => {
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
      }))
      .sort((a, b) => a.price - b.price)
      ;

    if (!offers.length) {
      offers = await fetchCalendarFallback(origin, minDays, maxDays, direct, months);
    }

    return NextResponse.json(
      { ok: true, origin, direct, months, offers, source: offers.length ? "live" : "empty" },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
    );
  } catch (error) {
    console.warn("[flight_deals_primary_unavailable]", error instanceof Error ? error.message : "unknown");
    try {
      const offers = await fetchCalendarFallback(origin, minDays, maxDays, direct, months);
      return NextResponse.json(
        { ok: true, origin, direct, months, offers, source: "calendar_fallback" },
        { status: 200, headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
      );
    } catch (fallbackError) {
      console.warn("[flight_deals_fallback_unavailable]", fallbackError instanceof Error ? fallbackError.message : "unknown");
      return NextResponse.json(
        { ok: false, origin, direct, offers: [], error: "flight_deals_unavailable" },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }
  }
}
