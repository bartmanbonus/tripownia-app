import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/clickStats";

const allowedHosts: Record<string, string[]> = {
  esky: ["esky.pl", "www.esky.pl", "www2.esky.pl"],
  kiwi: ["kiwi.com", "www.kiwi.com", "c111.travelpayouts.com", "kiwi.tpk.lv"],
  booking: ["booking.com", "www.booking.com"],
  wakacje: ["wakacje.pl", "www.wakacje.pl"],
  exim: ["exim.pl", "www.exim.pl", "reklamy.exim.pl"],
  tui: ["tui.pl", "www.tui.pl", "clk.tradedoubler.com"],
  getyourguide: ["getyourguide.com", "www.getyourguide.com", "getyourguide.pl", "www.getyourguide.pl", "clk.tradedoubler.com"],
  seeplaces: ["seeplaces.com", "www.seeplaces.com", "ad.seeplaces.com"],
  holidaypark: ["holidaypark.pl", "www.holidaypark.pl", "visit.holidaypark.pl"],
  fonia: ["fonia.app", "www.fonia.app", "clk.tradedoubler.com"],
  parklot: ["parklot.pl", "www.parklot.pl"],
};

function hostAllowed(partner: string, url: URL) {
  const hosts = allowedHosts[partner] || [];
  return hosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ partner: string }> }
) {
  const { partner } = await context.params;
  const targetRaw = request.nextUrl.searchParams.get("url") || "";
  const source = request.nextUrl.searchParams.get("source") || "unknown";
  const offer = request.nextUrl.searchParams.get("offer") || "";
  const destination = request.nextUrl.searchParams.get("destination") || "";

  let target: URL;
  try {
    target = new URL(targetRaw);
  } catch {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }

  if (!["http:", "https:"].includes(target.protocol) || !hostAllowed(partner, target)) {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }

  console.info("[tripownia_affiliate_click]", JSON.stringify({
    event: "affiliate_click",
    ts: new Date().toISOString(),
    partner,
    source,
    offer: offer || null,
    destination: destination || null,
    targetHost: target.hostname,
    path: request.nextUrl.pathname,
  }));

  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  recordClick(request, response, {
    partner,
    source,
    offer: offer || null,
    destination: destination || null,
  });

  return response;
}
