import { NextRequest, NextResponse } from "next/server";
import { sealAffiliateLink } from "@/lib/affiliateLinkToken";
import { kiwiDate, kiwiFlightDeepUrl, kiwiIata } from "@/lib/kiwiFlights";
import { partners } from "@/lib/partners";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function short(value: string | null, length: number) {
  return String(value || "").replace(/[\r\n\t]/g, " ").trim().slice(0, length);
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const from = kiwiIata(input.get("from"));
  const destination = input.get("to") || "anywhere";
  const to = destination === "anywhere" ? "anywhere" : kiwiIata(destination);
  const rawOutbound = input.get("departure") || "";
  const rawInbound = input.get("return") || "";
  const departure = kiwiDate(rawOutbound);
  const returnDate = kiwiDate(rawInbound);

  if (!from || !to || (rawOutbound && !departure) || (rawInbound && (!returnDate || !departure || returnDate < departure))) {
    return NextResponse.redirect(new URL("/loty", request.url), 307);
  }

  try {
    // Use Kiwi's documented /deep format rather than a generic Kiwi homepage.
    // Conversion is attributed by the existing Travelpayouts Kiwi partner.
    const deep = kiwiFlightDeepUrl({ origin: from, destination: to, departure, returnDate });
    const target = partners.kiwi.buildUrl(deep);
    const ref = sealAffiliateLink({
      mode: "exit",
      partner: "kiwi",
      target,
      context: {
        source: short(input.get("source"), 80) || "flight_search",
        offer: short(input.get("offer"), 80),
        destination: short(input.get("destination"), 160) || to,
        price: short(input.get("price"), 40),
        page: "/go/flight",
      },
    });
    const response = NextResponse.redirect(new URL("/przejdz/" + ref, request.url), 307);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    console.error("[kiwi_flight_redirect_error]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "flight_link_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
