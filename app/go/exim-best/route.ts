import { NextRequest, NextResponse } from "next/server";
import { findBestEximOffer } from "@/lib/eximLive";

export const dynamic = "force-dynamic";

function noMatchRedirect(request: NextRequest, destination: string) {
  const fallback = new URL("/okazje", request.url);
  fallback.searchParams.set("exim", "brak-dopasowania");
  if (destination) fallback.searchParams.set("kierunek", destination);
  return NextResponse.redirect(fallback, 307);
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const destination = p.get("destination") || "";

  try {
    const result = await findBestEximOffer({
      destination,
      country: p.get("country") || "",
      from: p.get("from") || "WAW",
      nights: Number(p.get("nights") || p.get("duration") || 0),
      board: p.get("board") || "",
      targetPrice: Number(p.get("price") || 0),
    });

    if (result.available && result.productUrl) {
      const tracked = new URL("/go/live", request.url);
      tracked.searchParams.set("target", result.productUrl);
      tracked.searchParams.set("partner", "exim");
      tracked.searchParams.set("source", "exim_resolver");
      if (destination) tracked.searchParams.set("destination", destination);
      return NextResponse.redirect(tracked, 307);
    }

    return noMatchRedirect(request, destination);
  } catch (error) {
    console.error("[tripownia_exim_feed]", error);
    return noMatchRedirect(request, destination);
  }
}
