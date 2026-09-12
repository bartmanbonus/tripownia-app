import { NextRequest, NextResponse } from "next/server";
import { findBestEximOffer } from "@/lib/eximLive";
import { partners } from "@/lib/partners";

export const dynamic = "force-dynamic";

function eximFallback(path: string) {
  const destinationUrl = path.startsWith("/kierunki/")
    ? new URL(path, "https://www.exim.pl").toString()
    : "https://www.exim.pl/";

  return partners.exim.buildUrl(destinationUrl);
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const destination = p.get("destination") || "";
  const fallbackPath = p.get("path") || "";

  try {
    const result = await findBestEximOffer({
      destination,
      country: p.get("country") || "",
      from: p.get("from") || "WAW",
      nights: Number(p.get("nights") || p.get("duration") || 0),
      board: p.get("board") || "",
    });

    // productUrl from the TradeDoubler feed is already tracked, so preserve it 1:1.
    if (result.available && result.productUrl) {
      return NextResponse.redirect(result.productUrl, 307);
    }

    // If the exact live combination is temporarily unavailable, keep the user
    // on the relevant EXIM destination while preserving Tripownia affiliate tracking.
    return NextResponse.redirect(eximFallback(fallbackPath), 307);
  } catch (error) {
    console.error("[tripownia_exim_feed]", error);
    return NextResponse.redirect(eximFallback(fallbackPath), 307);
  }
}
