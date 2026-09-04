import { NextRequest, NextResponse } from "next/server";
import { eskyApiConfig, searchEskyFlights } from "@/lib/eskyApi";

export const dynamic = "force-dynamic";

const IATA_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const from = (params.get("from") || "").toUpperCase();
  const to = (params.get("to") || "").toUpperCase();
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || "";
  const adults = Math.max(1, Math.min(9, Number(params.get("adults") || 1)));

  if (!IATA_RE.test(from) || !IATA_RE.test(to) || !DATE_RE.test(departureDate) || (returnDate && !DATE_RE.test(returnDate))) {
    return NextResponse.json({ ok: false, error: "invalid_parameters", results: [] }, { status: 400 });
  }

  const config = eskyApiConfig();
  if (!config.configured) {
    return NextResponse.json({
      ok: true,
      configured: false,
      results: [],
      message: "Set ESKY_PARTNER_CODE, ESKY_PARTNER_PREFIX and ESKY_REDIRECT_DOMAIN in Vercel.",
    });
  }

  try {
    const results = await searchEskyFlights({
      departureCode: from,
      arrivalCode: to,
      departureDate,
      returnDate: returnDate || undefined,
      adults,
      currency: "PLN",
      language: "PL",
    });

    return NextResponse.json({ ok: true, configured: true, results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[esky_api_error]", error);
    return NextResponse.json({ ok: false, configured: true, results: [], error: "esky_api_error" }, { status: 502 });
  }
}
