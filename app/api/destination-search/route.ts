import { NextRequest, NextResponse } from "next/server";
import { WORLD_DESTINATIONS, destinationMatches, normalizeDestination, type WorldDestination } from "@/lib/worldDestinations";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

type OpenMeteoLocation = { id?: number; name?: string; country?: string; country_code?: string; admin1?: string; };

function localSuggestions(query: string) {
  return WORLD_DESTINATIONS
    .filter((item) => isTravelDestinationAllowed(item.label, item.region))
    .filter((item) => destinationMatches(query, item))
    .slice(0, 10);
}

function remoteToDestination(row: OpenMeteoLocation): WorldDestination | null {
  const name = String(row?.name || "").trim();
  const country = String(row?.country || "").trim();
  if (!name) return null;
  const label = country && normalizeDestination(name) !== normalizeDestination(country) ? `${name}, ${country}` : name;
  const region = [String(row?.admin1 || "").trim(), country].filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(" · ") || "Świat";
  if (!isTravelDestinationAllowed(label, region)) return null;
  return { label, region, aliases: row?.country_code ? [String(row.country_code)] : undefined };
}

function mergeSuggestions(local: WorldDestination[], remote: WorldDestination[]) {
  const seen = new Set<string>();
  return [...local, ...remote].filter((item) => {
    const key = normalizeDestination(item.label);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

export async function GET(request: NextRequest) {
  const query = String(request.nextUrl.searchParams.get("q") || "").trim();
  if (query.length < 2) {
    return NextResponse.json({ ok: true, suggestions: localSuggestions(query) }, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
    });
  }
  const local = localSuggestions(query);
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "12");
    url.searchParams.set("language", "pl");
    url.searchParams.set("format", "json");
    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`);
    const data = await response.json();
    const remote = (Array.isArray(data?.results) ? data.results : []).map(remoteToDestination).filter(Boolean) as WorldDestination[];
    return NextResponse.json({ ok: true, suggestions: mergeSuggestions(local, remote), source: "open-meteo-geocoding" }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ ok: true, suggestions: local, source: "local-fallback" }, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
    });
  }
}
