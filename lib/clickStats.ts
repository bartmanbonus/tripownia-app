import type { NextRequest, NextResponse } from "next/server";

export type ClickEvent = {
  ts: string;
  partner: string;
  source: string;
  offer?: string | null;
  destination?: string | null;
};

export type ClickStats = {
  total: number;
  byPartner: Record<string, number>;
  bySource: Record<string, number>;
  byOffer: Record<string, { count: number; partner: string; destination: string }>;
  recent: ClickEvent[];
  updatedAt?: string;
};

const COOKIE = "tripownia_affiliate_stats";
const EMPTY: ClickStats = { total: 0, byPartner: {}, bySource: {}, byOffer: {}, recent: [] };

function decode(value?: string): ClickStats {
  if (!value) return structuredClone(EMPTY);
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as ClickStats;
    return {
      total: Number(parsed.total || 0),
      byPartner: parsed.byPartner || {},
      bySource: parsed.bySource || {},
      byOffer: parsed.byOffer || {},
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

function encode(stats: ClickStats) {
  return encodeURIComponent(JSON.stringify(stats));
}

export function readClickStats(request: NextRequest) {
  return decode(request.cookies.get(COOKIE)?.value);
}

export function recordClick(
  request: NextRequest,
  response: NextResponse,
  event: Omit<ClickEvent, "ts"> & { ts?: string }
) {
  const stats = readClickStats(request);
  const ts = event.ts || new Date().toISOString();
  const partner = event.partner || "unknown";
  const source = event.source || "unknown";
  const offer = event.offer ? String(event.offer) : "";
  const destination = event.destination || "";

  stats.total += 1;
  stats.byPartner[partner] = (stats.byPartner[partner] || 0) + 1;
  stats.bySource[source] = (stats.bySource[source] || 0) + 1;

  if (offer) {
    const current = stats.byOffer[offer] || { count: 0, partner, destination };
    stats.byOffer[offer] = {
      count: current.count + 1,
      partner: partner || current.partner,
      destination: destination || current.destination,
    };
  }

  stats.recent.unshift({ ts, partner, source, offer: offer || null, destination: destination || null });
  stats.recent = stats.recent.slice(0, 12);
  stats.updatedAt = ts;

  // Cookie is intentionally aggregate/test analytics only.
  // Keep the payload small enough for browser cookie limits.
  const topOffers = Object.entries(stats.byOffer)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);
  stats.byOffer = Object.fromEntries(topOffers);

  response.cookies.set(COOKIE, encode(stats), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });

  return stats;
}

export function clearClickStats(response: NextResponse) {
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
