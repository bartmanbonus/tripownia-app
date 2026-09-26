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
  "rentacar",
  "kiwitaxi",
  "gettransfer",
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
  "www.getyourguide.com",
  "getyourguide.com",
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
  "getrentacar.tpk.lv",
  "kiwitaxi.tpk.lv",
  "gettransfer.tpk.lv",
]);

const SITE_ID = "3487177";
const WRAPPER_PROGRAMS: Partial<Record<PartnerKey, string>> = {
  exim: "334260",
  tui: "308388",
  getyourguide: "356307",
  seeplaces: "383711",
  holidaypark: "357058",
  fonia: "373994",
};

function safePartner(value: string | null): PartnerKey | null {
  if (!value || !ALLOWED_PARTNERS.has(value as PartnerKey)) return null;
  return value as PartnerKey;
}

function safeText(value: string | null, max = 160) {
  if (!value) return undefined;
  const normalized = value.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  return normalized || undefined;
}

function safeTarget(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url;
  } catch {
    return null;
  }
}

function hostMatches(url: URL, hosts: string[]) {
  return hosts.includes(url.hostname.toLowerCase());
}

function wrapperValue(wrapper: URL, key: "p" | "a") {
  const queryValue = wrapper.searchParams.get(key);
  if (queryValue && /^\d+$/.test(queryValue)) return queryValue;

  const legacyMatch = wrapper.toString().match(new RegExp(`${key}\\((\\d+)\\)`));
  return legacyMatch?.[1] || null;
}

function embeddedDestination(wrapper: URL) {
  const queryValue = wrapper.searchParams.get("url");
  if (queryValue) return queryValue;

  const legacyMatch = wrapper.toString().match(/url\((.+)\)$/);
  if (!legacyMatch?.[1]) return null;
  try {
    return decodeURIComponent(legacyMatch[1]);
  } catch {
    return legacyMatch[1];
  }
}

function embeddedDestinationMatches(wrapper: URL, allowedHosts: string[]) {
  const value = embeddedDestination(wrapper);
  if (!value) return false;
  try {
    const destination = new URL(value);
    return destination.protocol === "https:" && hostMatches(destination, allowedHosts);
  } catch {
    return false;
  }
}

function validTradeDoublerWrapper(partner: PartnerKey, target: URL, allowedDestinationHosts: string[]) {
  const program = WRAPPER_PROGRAMS[partner];
  if (!program) return false;
  return wrapperValue(target, "p") === program
    && wrapperValue(target, "a") === SITE_ID
    && embeddedDestinationMatches(target, allowedDestinationHosts);
}

function belongsToPartner(partner: PartnerKey, target: URL) {
  const host = target.hostname.toLowerCase();

  if (partner === "exim") {
    if (host === "exim.pl" || host === "www.exim.pl") return true;
    return host === "reklamy.exim.pl" && validTradeDoublerWrapper(partner, target, ["exim.pl", "www.exim.pl"]);
  }

  if (partner === "tui") {
    if (host === "tui.pl" || host === "www.tui.pl") return true;
    return host === "clk.tradedoubler.com" && validTradeDoublerWrapper(partner, target, ["tui.pl", "www.tui.pl"]);
  }

  if (partner === "getyourguide") {
    if (host === "getyourguide.pl" || host === "www.getyourguide.pl") return true;
    return host === "clk.tradedoubler.com" && validTradeDoublerWrapper(partner, target, ["getyourguide.pl", "www.getyourguide.pl"]);
  }

  if (partner === "seeplaces") {
    if (["seeplaces.com", "www.seeplaces.com"].includes(host)) return true;
    return host === "ad.seeplaces.com" && validTradeDoublerWrapper(partner, target, ["seeplaces.com", "www.seeplaces.com"]);
  }

  if (partner === "holidaypark") {
    if (["holidaypark.pl", "www.holidaypark.pl"].includes(host)) return true;
    return host === "visit.holidaypark.pl" && validTradeDoublerWrapper(partner, target, ["holidaypark.pl", "www.holidaypark.pl"]);
  }

  if (partner === "fonia") {
    if (["fonia.app", "www.fonia.app"].includes(host)) return true;
    return host === "clk.tradedoubler.com" && validTradeDoublerWrapper(partner, target, ["fonia.app", "www.fonia.app"]);
  }

  if (partner === "wakacje") return ["wakacje.pl", "www.wakacje.pl"].includes(host);
  if (partner === "booking") return ["booking.com", "www.booking.com"].includes(host);
  if (partner === "parklot") return ["parklot.pl", "www.parklot.pl"].includes(host);
  if (partner === "rentacar") return host === "getrentacar.tpk.lv";
  if (partner === "kiwitaxi") return host === "kiwitaxi.tpk.lv";
  if (partner === "gettransfer") return host === "gettransfer.tpk.lv";

  if (partner === "kiwi") {
    if (["kiwi.com", "www.kiwi.com", "kiwi.tpk.lv"].includes(host)) return true;
    if (host !== "c111.travelpayouts.com") return false;
    const customUrl = target.searchParams.get("custom_url");
    if (!customUrl) return true;
    try {
      const destination = new URL(customUrl);
      return destination.protocol === "https:" && hostMatches(destination, ["kiwi.com", "www.kiwi.com"]);
    } catch {
      return false;
    }
  }

  return false;
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
      if (host === "ad.seeplaces.com") return target;
      return new URL(partners.seeplaces.buildUrl(original));
    }

    if (partner === "holidaypark") {
      if (host === "visit.holidaypark.pl") return target;
      return new URL(partners.holidaypark.buildUrl(original));
    }

    if (partner === "fonia") {
      if (host === "clk.tradedoubler.com") return target;
      return new URL(partners.fonia.buildUrl(original));
    }

    if (partner === "parklot") return new URL(partners.parklot.buildUrl(original));
    if (partner === "rentacar") return new URL(partners.rentacar.buildUrl(original));
    if (partner === "kiwitaxi") return new URL(partners.kiwitaxi.buildUrl(original));
    if (partner === "gettransfer") return new URL(partners.gettransfer.buildUrl(original));
  } catch {
    return null;
  }

  return target;
}

export async function GET(request: NextRequest) {
  const originalTarget = safeTarget(request.nextUrl.searchParams.get("target"));
  const partner = safePartner(request.nextUrl.searchParams.get("partner"));

  if (!originalTarget || !partner || !belongsToPartner(partner, originalTarget)) {
    return NextResponse.redirect(new URL("/okazje", request.url), 307);
  }

  const target = affiliateTarget(partner, originalTarget);
  if (!target || !safeTarget(target.toString()) || !belongsToPartner(partner, target)) {
    return NextResponse.redirect(new URL("/okazje", request.url), 307);
  }

  const source = safeText(request.nextUrl.searchParams.get("source"), 80) || "live_offer";
  const offer = safeText(request.nextUrl.searchParams.get("offer"), 80);
  const destination = safeText(request.nextUrl.searchParams.get("destination"), 160);
  const price = safeText(request.nextUrl.searchParams.get("price"), 40);
  const page = safeText(request.nextUrl.searchParams.get("page"), 160);
  const clickId = safeText(request.nextUrl.searchParams.get("clickId"), 80);
  const utmSource = safeText(request.nextUrl.searchParams.get("utmSource"), 80);
  const utmMedium = safeText(request.nextUrl.searchParams.get("utmMedium"), 80);
  const utmCampaign = safeText(request.nextUrl.searchParams.get("utmCampaign"), 120);
  const utmContent = safeText(request.nextUrl.searchParams.get("utmContent"), 120);
  const landing = safeText(request.nextUrl.searchParams.get("landing"), 160);

  console.info(
    "[tripownia_affiliate_click]",
    JSON.stringify({
      event: "affiliate_click",
      ts: new Date().toISOString(),
      partner,
      source,
      offer,
      destination,
      price,
      page,
      clickId,
      attribution: { source: utmSource, medium: utmMedium, campaign: utmCampaign, content: utmContent, landing },
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
    price,
    page,
    clickId,
  });

  return response;
}
