import { NextRequest, NextResponse } from "next/server";
import { GET as trackedPartnerExit } from "@/app/go/live/route";
import { eskyDepartures, eskyArrival, eskySearchUrl } from "@/lib/eskySearch";
import { partners, type PartnerKey } from "@/lib/partners";
import { isTravelDestinationBlocked } from "@/lib/travelSafety";

// Only accepts a destination, dates and a predefined travel mode.
// The customer-facing /go/rescue URL never contains a partner target,
// tracking code, affiliate account or arbitrary external redirect.
export const dynamic = "force-dynamic";

type RescueKind = "package" | "flight" | "hotel";
const VALID_KINDS = new Set(["package", "flight", "hotel"]);

function validDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

function invalid(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/szukaj", request.url), 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const kind = params.get("kind") || "";
  const destination = (params.get("destination") || "").replace(/[\r\n\t]/g, " ").trim().slice(0, 100);
  if (!VALID_KINDS.has(kind) || !destination || isTravelDestinationBlocked(destination)) {
    return invalid(request);
  }

  const from = validDate(params.get("from"));
  const to = validDate(params.get("to"));
  const validRange = from && to && to > from;
  const airports = eskyDepartures((params.get("airports") || "").slice(0, 100)).slice(0, 8);
  const nights = (params.get("nights") || "").trim();
  const duration = /^\d{1,2}(?:-\d{1,2}|\+)?$/.test(nights) ? nights : "all";
  let partner: PartnerKey;
  let target: string;

  if (kind === "package") {
    // Avoid a generic eSky portfolio with no destination selected.
    if (!eskyArrival(destination)) return invalid(request);
    partner = "esky";
    target = eskySearchUrl({
      query: destination,
      departure: airports.join(","),
      cityBreak: params.get("cityBreak") === "1",
      nights: duration,
      start: validRange ? from : "",
      end: validRange ? to : "",
    });
  } else if (kind === "flight") {
    partner = "kiwi";
    const search = new URL("https://www.kiwi.com/pl/");
    search.searchParams.set("destination", destination);
    if (airports.length === 1) search.searchParams.set("origin", airports[0]);
    if (validRange) {
      search.searchParams.set("outboundDate", from);
      search.searchParams.set("inboundDate", to);
    }
    search.searchParams.set("currency", "PLN");
    target = partners.kiwi.buildUrl(search.toString());
  } else {
    partner = "booking";
    const search = new URL("https://www.booking.com/searchresults.pl.html");
    search.searchParams.set("ss", destination);
    if (validRange) {
      search.searchParams.set("checkin", from);
      search.searchParams.set("checkout", to);
    }
    target = partners.booking.buildUrl(search.toString());
  }

  // CI verifies the generated destination without polluting real affiliate-click
  // analytics. Real visitor URLs never include dryRun and always use /go/live.
  if (process.env.CI === "true" && process.env.VERCEL !== "1" && params.get("dryRun") === "1") {
    const response = NextResponse.redirect(target, 307);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  // Reuse the existing validated, measured redirect handler. This responds
  // with a single 307 to the real partner; no long intermediary URL appears
  // in the address bar or in the visitor-facing href.
  const internal = new URL("/go/live", request.url);
  internal.searchParams.set("partner", partner);
  internal.searchParams.set("target", target);
  internal.searchParams.set("source", kind === "package" ? "search_zero_rescue" : `search_zero_${kind}_rescue`);
  internal.searchParams.set("destination", destination);
  let page = "/szukaj";
  try {
    const referrer = request.headers.get("referer");
    const ref = referrer ? new URL(referrer) : null;
    if (ref?.origin === request.nextUrl.origin && ref.pathname.startsWith("/")) page = ref.pathname.slice(0, 160);
  } catch { /* Keep the anonymous search source as fallback. */ }
  internal.searchParams.set("page", page);
  const attribution = ["utmSource", "utmMedium", "utmCampaign", "utmContent", "landing"] as const;
  for (const key of attribution) {
    const value = params.get(key);
    if (value && value.length <= 120) internal.searchParams.set(key, value);
  }

  return trackedPartnerExit(new NextRequest(internal, { headers: request.headers }));
}
