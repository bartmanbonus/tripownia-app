import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CalendarRow = {
  currency?: string;
  depart_date?: string;
  depart_stops?: number;
  destination?: string;
  origin?: string;
  return_date?: string;
  return_stops?: number;
  value?: number | null;
};

function safeIata(value: string | null, fallback = "") {
  const normalized = String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
  return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback;
}

function safeMonth(value: string | null) {
  const normalized = String(value || "");
  return /^\d{4}-\d{2}$/.test(normalized) ? normalized : "";
}

function searchUrl(origin: string, destination: string, departDate: string, returnDate: string) {
  const ddmm = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? match[3] + match[2] : "";
  };
  const outbound = ddmm(departDate);
  const inbound = ddmm(returnDate);
  const path = outbound && inbound
    ? origin + outbound + destination + inbound + "1"
    : "";
  const url = new URL(path ? "https://www.aviasales.com/search/" + path : "https://www.aviasales.com/");
  url.searchParams.set("marker", "695999.TRIPOWNIAPL");
  url.searchParams.set("shmarker", "695999.TRIPOWNIAPL");
  return url.toString();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = safeIata(params.get("origin"), "WAW");
  const destination = safeIata(params.get("destination"));
  const fallbackDestination = safeIata(params.get("fallback"));
  const month = safeMonth(params.get("month"));
  const minDays = Math.max(1, Math.min(30, Number(params.get("minDays") || 5)));
  const maxDays = Math.max(minDays, Math.min(30, Number(params.get("maxDays") || 7)));
  const direct = params.get("direct") === "true";

  if (!destination) {
    return NextResponse.json({ ok: false, results: [], error: "invalid_parameters" }, { status: 400 });
  }

  function upstreamUrl(target: string) {
    const upstream = new URL("https://suggest.apistp.com/uaca/v1/get_data_forward");
    upstream.searchParams.set("service", "calendar_aviasales_month");
    upstream.searchParams.set("origin_iata", origin);
    upstream.searchParams.set("currency", "pln");
    upstream.searchParams.set("destination_iata", target);
    upstream.searchParams.set("one_way", "false");
    upstream.searchParams.set("min_trip_duration", String(minDays));
    upstream.searchParams.set("max_trip_duration", String(maxDays));
    upstream.searchParams.set("only_direct", direct ? "true" : "false");
    if (month) upstream.searchParams.set("month", month);
    upstream.searchParams.set("host", "hydra.aviasales.com");
    return upstream;
  }

  async function readCalendar(target: string) {
    const response = await fetch(upstreamUrl(target).toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!response.ok) throw new Error("calendar HTTP " + response.status);
    const data = await response.json() as { month?: Record<string, CalendarRow> };
    return Object.values(data?.month || {});
  }

  try {
    let sourceDestination = destination;
    let calendarRows = await readCalendar(destination);
    if (!calendarRows.some((row) => Number(row.value || 0) > 0) && fallbackDestination && fallbackDestination !== destination) {
      sourceDestination = fallbackDestination;
      calendarRows = await readCalendar(fallbackDestination);
    }

    const rows = calendarRows
      .filter((row) => Number(row.value || 0) > 0 && row.depart_date)
      .map((row) => ({
        price: Math.round(Number(row.value || 0)),
        departDate: String(row.depart_date || ""),
        returnDate: String(row.return_date || ""),
        outboundStops: Number(row.depart_stops || 0),
        returnStops: Number(row.return_stops || 0),
        affiliateUrl: searchUrl(
          origin,
          String(row.destination || sourceDestination),
          String(row.depart_date || ""),
          String(row.return_date || ""),
        ),
      }))
      .sort((a, b) => a.price - b.price);

    return NextResponse.json(
      { ok: true, origin, destination, resolvedDestination: sourceDestination, month: month || "any", results: rows },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } },
    );
  } catch (error) {
    console.error("[flight_calendar_error]", error);
    return NextResponse.json(
      { ok: false, origin, destination, month, results: [], error: "flight_calendar_unavailable" },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
