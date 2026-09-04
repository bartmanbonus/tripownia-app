import { NextRequest, NextResponse } from "next/server";
import { findBestEximOffer } from "@/lib/eximLive";

export const dynamic = "force-dynamic";

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
    });

    // productUrl z feedu przekazujemy 1:1. Nie budujemy deeplinku ponownie.
    if (result.available && result.productUrl) {
      return NextResponse.redirect(result.productUrl, 307);
    }

    const fallback = new URL("/okazje", request.url);
    fallback.searchParams.set("exim", "brak-dokladnej-oferty");
    fallback.searchParams.set("kierunek", destination);
    return NextResponse.redirect(fallback, 307);
  } catch (error) {
    console.error("[tripownia_exim_feed]", error);
    const fallback = new URL("/okazje", request.url);
    fallback.searchParams.set("exim", "blad-feedu");
    fallback.searchParams.set("kierunek", destination);
    return NextResponse.redirect(fallback, 307);
  }
}
