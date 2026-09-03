import { NextRequest, NextResponse } from "next/server";
import { partners } from "@/lib/partners";

export const dynamic = "force-dynamic";

const EXIM_HOST = "https://www.exim.pl";

const departureNames: Record<string, string[]> = {
  WAW: ["warszawa", "chopin"],
  WMI: ["warszawa", "modlin"],
  KRK: ["krakow", "kraków"],
  KTW: ["katowice"],
  GDN: ["gdansk", "gdańsk"],
  WRO: ["wroclaw", "wrocław"],
  POZ: ["poznan", "poznań"],
  RZE: ["rzeszow", "rzeszów"],
  LUZ: ["lublin"],
  SZZ: ["szczecin"],
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseIso(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(a: Date | null, b: Date | null) {
  if (!a || !b) return 9999;
  return Math.abs(Math.round((a.getTime() - b.getTime()) / 86400000));
}

type Candidate = {
  url: string;
  price: number;
  departureMatch: boolean;
  dateDelta: number;
};

function extractCandidates(html: string, from: string, requestedStart: string | null): Candidate[] {
  const hrefRx = /href=["']([^"']+\/kierunki\/[^"']+\?[^"']+)["']/gi;
  const requestedDate = parseIso(requestedStart);
  const wantedNames = departureNames[from] || [];
  const seen = new Set<string>();
  const result: Candidate[] = [];
  let match: RegExpExecArray | null;

  while ((match = hrefRx.exec(html))) {
    const rawHref = decodeHtml(match[1]);
    let absolute: URL;
    try {
      absolute = new URL(rawHref, EXIM_HOST);
    } catch {
      continue;
    }
    if (absolute.hostname !== "www.exim.pl" && absolute.hostname !== "exim.pl") continue;
    // Destination landing pages do not contain the offer parameters below.
    if (!absolute.searchParams.has("HID") && !absolute.searchParams.has("PID") && !absolute.searchParams.has("GIATA")) continue;
    const key = absolute.toString();
    if (seen.has(key)) continue;
    seen.add(key);

    const left = Math.max(0, match.index - 3500);
    const right = Math.min(html.length, hrefRx.lastIndex + 6000);
    const context = stripHtml(html.slice(left, right)).toLocaleLowerCase("pl");

    const priceMatches = [...context.matchAll(/(?:całkowita cena|cena całkowita|od)\s*([0-9][0-9\s.,]*)\s*(?:pln|zł)/gi)];
    const prices = priceMatches
      .map(x => Number(String(x[1]).replace(/\s/g, "").replace(",", ".")))
      .filter(x => Number.isFinite(x) && x > 0);
    const price = prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;

    const departureMatch = wantedNames.some(name => context.includes(name));
    const offerDate = parseIso(absolute.searchParams.get("DD") || absolute.searchParams.get("RD"));
    const dateDelta = daysBetween(requestedDate, offerDate);

    result.push({ url: key, price, departureMatch, dateDelta });
  }

  return result;
}

function chooseBest(candidates: Candidate[]) {
  if (!candidates.length) return undefined;
  // 1) najpierw zachowujemy wybrane miasto wylotu, jeżeli EXIM zwróci takie warianty;
  // 2) dla wskazanego terminu preferujemy oferty w oknie ±14 dni;
  // 3) w tej puli ZAWSZE wybieramy najniższą cenę.
  const withDeparture = candidates.filter(item => item.departureMatch);
  const departurePool = withDeparture.length ? withDeparture : candidates;
  const nearDate = departurePool.filter(item => item.dateDelta <= 14);
  const pool = nearDate.length ? nearDate : departurePool;
  return [...pool].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.dateDelta - b.dateDelta;
  })[0];
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawPath = params.get("path") || "/wakacje";
  const from = (params.get("from") || "WAW").toUpperCase();
  const start = params.get("start");

  // Accept only internal EXIM paths — no open redirect.
  const path = rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath : "/wakacje";
  const landingUrl = new URL(path, EXIM_HOST).toString();

  try {
    const response = await fetch(landingUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Tripownia/1.0)" },
      cache: "no-store",
    });

    if (response.ok) {
      const html = await response.text();
      const best = chooseBest(extractCandidates(html, from, start));
      if (best?.url) {
        return NextResponse.redirect(partners.exim.buildUrl(best.url), 307);
      }
    }
  } catch {
    // Fallback below keeps the affiliate flow working even if EXIM temporarily blocks fetching.
  }

  return NextResponse.redirect(partners.exim.buildUrl(landingUrl), 307);
}
