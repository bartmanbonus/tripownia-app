import { NextRequest, NextResponse } from "next/server";
import { offers } from "@/lib/offers";

export const dynamic = "force-dynamic";

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u0142/gi, "ł")
    .replace(/\u015b/gi, "ś")
    .replace(/\u015a/gi, "Ś");
}

function normalize(value: string) {
  return decodeHtml(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function extractPrices(text: string) {
  const prices: number[] = [];
  const patterns = [
    /(?:totalprice|price|amount)[^0-9]{0,24}([0-9]{3,5}(?:[.,][0-9]{1,2})?)/gi,
    /([0-9]{3,5})\s*(?:zł|pln)\b/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      const price = Number(String(match[1]).replace(",", "."));
      if (Number.isFinite(price) && price >= 250 && price <= 100000) prices.push(price);
    }
  }
  return prices;
}

function lowest(values: number[]) {
  return values.length ? Math.min(...values) : null;
}

function hasDestinationEvidence(raw: string, city: string) {
  const normalized = normalize(raw);
  const wanted = normalize(city).trim();
  if (!wanted) return false;

  // Akceptujemy tylko sytuację, gdy eSky faktycznie wyrenderował nazwę kierunku.
  // Sam parametr w URL nie jest dowodem, bo eSky potrafi zignorować błędny kod i pokazać "Dowolny kierunek".
  const strongPatterns = [
    `>${wanted}<`,
    `\"name\":\"${wanted}\"`,
    `\"label\":\"${wanted}\"`,
    `dokad? ${wanted}`,
    `dokąd? ${wanted}`,
  ];
  return strongPatterns.some((pattern) => normalized.includes(pattern));
}


function hasStructuredDestinationParam(urlValue: string) {
  try {
    const url = new URL(urlValue);
    const arrival = url.searchParams.get("arrivalPlaces") || "";
    // eSky akceptuje identyfikatory typu co-MT (kraj), ci-29266 (miasto) i ap-BGY (lotnisko).
    // Sam pusty / ogólny parametr nie jest wystarczający.
    return /^(?:co-[A-Z]{2}|ci-[A-Za-z0-9-]+|ap-[A-Z]{3})$/.test(arrival);
  } catch {
    return false;
  }
}

function plausibleAgainstReference(candidate: number, fallback: number) {
  if (!Number.isFinite(candidate) || candidate < 300) return false;
  if (!Number.isFinite(fallback) || fallback <= 0) return true;
  // Nie publikujemy skoków sugerujących, że parser złapał opłatę, ratę, zniżkę albo cenę innego produktu.
  return candidate >= Math.max(250, fallback * 0.55) && candidate <= fallback * 2.25;
}

export async function GET(request: NextRequest) {
  const offerId = Number(request.nextUrl.searchParams.get("offerId"));
  const offer = offers.find((item) => item.id === offerId);

  if (!offer || offer.partner !== "esky") {
    return NextResponse.json({ ok: false, error: "not_esky_offer" }, { status: 404 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(offer.affiliateUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TripowniaPriceBot/1.1; +https://tripownia.pl)",
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.7",
      },
      signal: controller.signal,
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `partner_http_${response.status}`, checkedAt: new Date().toISOString() }, { status: 200 });
    }

    const raw = await response.text();

    const destinationEvidence = hasDestinationEvidence(raw, offer.city);
    const structuredDestination = hasStructuredDestinationParam(offer.affiliateUrl);
    const normalized = normalize(raw);
    const explicitlyGeneric = normalized.includes("dowolny kierunek");

    // eSky renderuje część wyników po stronie klienta, więc nazwa kierunku nie zawsze występuje
    // w surowym HTML. Dopuszczamy wtedy poprawny, strukturalny arrivalPlaces, ale nigdy gdy
    // strona jawnie wróciła do „Dowolny kierunek”.
    if ((!destinationEvidence && !structuredDestination) || explicitlyGeneric) {
      return NextResponse.json({
        ok: false,
        error: "destination_not_confirmed",
        checkedAt: new Date().toISOString(),
        source: "esky_unverified_page",
      }, { status: 200, headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
    }

    const allPrices = extractPrices(raw);

    const wantsBreakfast = normalize(offer.board).includes("sniad");
    let breakfastPrices: number[] = [];
    if (wantsBreakfast) {
      for (const marker of ["sniadanie", "breakfast"]) {
        let start = 0;
        while (true) {
          const index = normalized.indexOf(marker, start);
          if (index < 0) break;
          const from = Math.max(0, index - 2200);
          const to = Math.min(raw.length, index + 2200);
          breakfastPrices.push(...extractPrices(raw.slice(from, to)));
          start = index + marker.length;
        }
      }
    }

    const boardPrice = lowest(breakfastPrices.filter((price) => plausibleAgainstReference(price, offer.price)));
    const anyPrice = lowest(allPrices.filter((price) => plausibleAgainstReference(price, offer.price)));
    const selectedPrice = boardPrice ?? anyPrice;

    if (selectedPrice === null) {
      return NextResponse.json({
        ok: false,
        error: "verified_price_not_found",
        checkedAt: new Date().toISOString(),
        source: "esky_verified_page_no_safe_price",
      }, { status: 200, headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
    }

    return NextResponse.json({
      ok: true,
      price: Math.round(selectedPrice),
      currency: "PLN",
      boardMatched: Boolean(boardPrice),
      destinationMatched: true,
      checkedAt: new Date().toISOString(),
      source: "esky_verified_package_page",
    }, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" } });
  } catch (error) {
    console.error("[esky_package_price_error]", error);
    return NextResponse.json({ ok: false, error: "partner_fetch_failed", checkedAt: new Date().toISOString() }, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}
