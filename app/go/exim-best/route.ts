import { NextRequest, NextResponse } from "next/server";
import { findBestEximOffer } from "@/lib/eximLive";

export const dynamic = "force-dynamic";

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

    // productUrl z feedu przekazujemy 1:1. Nie budujemy deeplinku ponownie.
    if (result.available && result.productUrl) {
      return NextResponse.redirect(result.productUrl, 307);
    }

    // Jeśli konkretna kombinacja chwilowo zniknęła z feedu, nie cofamy klienta
    // do Tripowni z technicznym komunikatem. Otwieramy właściwy kierunek EXIM.
    if (fallbackPath.startsWith("/kierunki/")) {
      return NextResponse.redirect(new URL(fallbackPath, "https://www.exim.pl"), 307);
    }
    return NextResponse.redirect(new URL("https://www.exim.pl/"), 307);
  } catch (error) {
    console.error("[tripownia_exim_feed]", error);
    // Jeśli konkretna kombinacja chwilowo zniknęła z feedu, nie cofamy klienta
    // do Tripowni z technicznym komunikatem. Otwieramy właściwy kierunek EXIM.
    if (fallbackPath.startsWith("/kierunki/")) {
      return NextResponse.redirect(new URL(fallbackPath, "https://www.exim.pl"), 307);
    }
    return NextResponse.redirect(new URL("https://www.exim.pl/"), 307);
  }
}
