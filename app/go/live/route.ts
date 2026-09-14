import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/clickStats";
import { partners, type PartnerKey } from "@/lib/partners";

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

function affiliateTarget(partner: PartnerKey, target: URL) {
  const host = target.hostname.toLowerCase();
  const original = target.toString();

  try {
    if (partner === "exim") {
      if (host === "reklamy.exim.pl") return target;
      return new URL(partners.exim.buildUrl(original));
    }

    if (partner === "tui") {
      if (host === "clk.tradedoubler.com") return target;
      return new URL(partners.tui.buildUrl(original));
    }

    if (partner === "wakacje") return new URL(partners.wakacje.buildUrl(original));

    if (partner === "kiwi") {
      if (host === "c111.travelpayouts.com" || host === "kiwi.tpk.lv") return target;
      return new URL(partners.kiwi.buildUrl(original));
    }

    if (partner === "booking") return new URL(partners.booking.buildUrl(original));

    if (partner === "getyourguide") {
      if (host === "clk.tradedoubler.com") return target;
      return new URL(partners.getyourguide.buildUrl(original));
    }

    if (partner === "seeplaces") {
      if (host === "ad.seeplaces.com" || host === "clk.tradedoubler.com") return target;
      return new URL(partners.seeplaces.buildUrl(original));
    }

    if (partner === "holidaypark") {
      if (host === "visit.holidaypark.pl" || host === "clk.tradedoubler.com") return target;
      return new URL(partners.holidaypark.buildUrl(original));
    }

    if (partner === "fonia") {
      if (host === "clk.tradedoubler.com") return target;
      return new URL(partners.fonia.buildUrl(original));
    }

    if (partner === "parklot") return new URL(partners.parklot.buildUrl(original));
  } catch {
    return null;
  }

  return target;
}

export async function GET(request: NextRequest) {
  const originalTarget = safeTarget(request.nextUrl.searchParams.get("target"));
  const partner = safePartner(request.nextUrl.searchParams.get("partner"));

  if (!originalTarget || !partner) {
    return NextResponse.redirect(new URL("/okazje", request.url), 307);
  }

  const target = affiliateTarget(partner, originalTarget);
  if (!target || !safeTarget(target.toString())) {
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
      originalHost: originalTarget.hostname,
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
