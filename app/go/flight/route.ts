import { NextRequest, NextResponse } from "next/server";
import { eskyDate, eskyFlightDeepUrl, eskyIata } from "@/lib/eskyFlights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function short(value: string | null, length: number) {
  return String(value || "").replace(/[\r\n\t]/g, " ").trim().slice(0, length);
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const from = eskyIata(input.get("from"));
  const to = eskyIata(input.get("to"));
  const rawOutbound = input.get("departure") || "";
  const rawInbound = input.get("return") || "";
  const departure = eskyDate(rawOutbound);
  const returnDate = eskyDate(rawInbound);

  if (!from || !to || (rawOutbound && !departure) || (rawInbound && (!returnDate || !departure || returnDate < departure))) {
    return NextResponse.redirect(new URL("/loty", request.url), 307);
  }

  try {
    const target = eskyFlightDeepUrl({ origin: from, destination: to, departure, returnDate, adults: 1 });
    const tracked = new URLSearchParams({
      target,
      partner: "esky_flights",
      source: short(input.get("source"), 80) || "flight_search",
      offer: short(input.get("offer"), 80) || `${from}-${to}-${departure}-${returnDate}`,
      destination: short(input.get("destination"), 160) || to,
      price: short(input.get("price"), 40),
      page: "/go/flight",
    });
    const response = NextResponse.redirect(new URL("/go/live?" + tracked.toString(), request.url), 307);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  } catch (error) {
    console.error("[esky_flight_redirect_error]", error instanceof Error ? error.message : "unknown");
    return NextResponse.redirect(new URL("/loty", request.url), 307);
  }
}
