import { NextRequest, NextResponse } from "next/server";

const allowedHosts: Record<string, string[]> = {
  // eSky is now a legacy alias that resolves to the Kiwi affiliate programme.
  esky: ["esky.pl", "www.esky.pl", "www2.esky.pl", "kiwi.com", "www.kiwi.com", "c111.travelpayouts.com", "kiwi.tpk.lv"],
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
  rentacar: ["getrentacar.tpk.lv"],
  kiwitaxi: ["kiwitaxi.tpk.lv"],
  gettransfer: ["gettransfer.tpk.lv"],
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

  if (target.protocol !== "https:" || !hostAllowed(partner, target)) {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }

  const tracked = new URL("/go/live", request.url);
  tracked.searchParams.set("target", target.toString());
  tracked.searchParams.set("partner", partner);
  tracked.searchParams.set("source", source);
  if (offer) tracked.searchParams.set("offer", offer);
  if (destination) tracked.searchParams.set("destination", destination);
  tracked.searchParams.set("page", request.headers.get("referer") || request.nextUrl.pathname);

  const response = NextResponse.redirect(tracked, 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
