import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IATA_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function splitDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function cabinEnum(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === "PREMIUM_ECONOMY") return "CABIN_CLASS_PREMIUM_ECONOMY";
  if (normalized === "BUSINESS") return "CABIN_CLASS_BUSINESS";
  if (normalized === "FIRST") return "CABIN_CLASS_FIRST";
  return "CABIN_CLASS_ECONOMY";
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.SKYSCANNER_API_KEY?.trim() || "";
  const params = request.nextUrl.searchParams;
  const from = (params.get("from") || "").toUpperCase();
  const to = (params.get("to") || "").toUpperCase();
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || "";
  const adults = Math.max(1, Math.min(9, Number(params.get("adults") || 1)));
  const cabin = cabinEnum(params.get("cabin") || "ECONOMY");

  if (!IATA_RE.test(from) || !IATA_RE.test(to) || !DATE_RE.test(departureDate) || (returnDate && !DATE_RE.test(returnDate))) {
    return NextResponse.json({ ok: false, error: "invalid_parameters" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      configured: false,
      provider: "skyscanner",
      message: "Set SKYSCANNER_API_KEY in Vercel after Skyscanner partner approval.",
    });
  }

  const queryLegs = [
    {
      originPlaceId: { iata: from },
      destinationPlaceId: { iata: to },
      date: splitDate(departureDate),
    },
  ];

  if (returnDate) {
    queryLegs.push({
      originPlaceId: { iata: to },
      destinationPlaceId: { iata: from },
      date: splitDate(returnDate),
    });
  }

  const payload = {
    query: {
      market: "PL",
      locale: "pl-PL",
      currency: "PLN",
      queryLegs,
      adults,
      cabinClass: cabin,
      nearbyAirports: true,
      includeSustainabilityData: true,
    },
  };

  try {
    const createResponse = await fetch("https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const createData = await createResponse.json().catch(() => null);
    if (!createResponse.ok || !createData) {
      return NextResponse.json({
        ok: false,
        configured: true,
        provider: "skyscanner",
        error: "skyscanner_create_error",
        status: createResponse.status,
      }, { status: 502 });
    }

    const sessionToken = String(createData?.sessionToken || "");
    if (!sessionToken) {
      return NextResponse.json({
        ok: true,
        configured: true,
        provider: "skyscanner",
        sessionToken: "",
        data: createData,
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const pollResponse = await fetch(
      `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/${encodeURIComponent(sessionToken)}`,
      {
        method: "POST",
        headers: { "x-api-key": apiKey },
        cache: "no-store",
      },
    );
    const pollData = await pollResponse.json().catch(() => null);

    return NextResponse.json({
      ok: true,
      configured: true,
      provider: "skyscanner",
      sessionToken,
      data: pollResponse.ok && pollData ? pollData : createData,
      partial: !pollResponse.ok,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[skyscanner_flights_error]", error);
    return NextResponse.json({
      ok: false,
      configured: true,
      provider: "skyscanner",
      error: "skyscanner_flights_error",
    }, { status: 502 });
  }
}
