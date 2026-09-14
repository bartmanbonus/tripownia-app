import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/clickStats";
import type { PartnerKey } from "@/lib/partners";

const ALLOWED_PARTNERS = new Set<PartnerKey>([
  "wakacje",
  "exim",
  "tui",
  "getyourguide",
  "seeplaces",
  "holidaypark",
  "fonia",
  "parklot",
  "kiwi",
  "booking",
]);

const ALLOWED_HOSTS = new Set([
  "reklamy.exim.pl",
  "www.exim.pl",
  "exim.pl",
  "clk.tradedoubler.com",
  "www.tui.pl",
  "tui.pl",
  "www.wakacje.pl",
  "wakacje.pl",
  "c111.travelpayouts.com",
  "kiwi.tpk.lv",
  "www.kiwi.com",
  "kiwi.com",
  "www.booking.com",
  "booking.com",
  "www.getyourguide.pl",
  "getyourguide.pl",
  "ad.seeplaces.com",
  "seeplaces.com",
  "www.seeplaces.com",
  "visit.holidaypark.pl",
  "www.holidaypark.pl",
  "holidaypark.pl",
  "fonia.app",
  "www.fonia.app",
  "www.parklot.pl",
  "parklot.pl",
]);

function safePartner(value: string | null): PartnerKey | null {
  if (!value || !ALLOWED_PARTNERS.has(value as PartnerKey)) return null;
  return value as PartnerKey;
}

function safeTarget(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.has(host)) return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const target = safeTarget(request.nextUrl.searchParams.get("target"));
  const partner = safePartner(request.nextUrl.searchParams.get("partner"));

  if (!target || !partner) {
    return NextResponse.redirect(new URL("/okazje", request.url), 307);
  }

  const source = request.nextUrl.searchParams.get("source") || "live_offer";
  const offer = request.nextUrl.searchParams.get("offer") || undefined;
  const destination = request.nextUrl.searchParams.get("destination") || undefined;

  console.info(
    "[tripownia_affiliate_click]",
    JSON.stringify({
      event: "affiliate_click",
      ts: new Date().toISOString(),
      partner,
      source,
      offer,
      destination,
      targetHost: target.hostname,
      live: true,
      path: request.nextUrl.pathname,
    })
  );

  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  recordClick(request, response, {
    partner,
    source,
    offer,
    destination,
  });

  return response;
}
