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
    .toLowerCase();
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
      if (Number.isFinite(price) && price >= 100 && price <= 100000) prices.push(price);
    }
  }
  return prices;
}

function lowest(values: number[]) {
  return values.length ? Math.min(...values) : null;
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
        "User-Agent": "Mozilla/5.0 (compatible; TripowniaPriceBot/1.0; +https://tripownia.pl)",
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.7",
      },
      signal: controller.signal,
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `partner_http_${response.status}` }, { status: 200 });
    }

    const raw = await response.text();
    const normalized = normalize(raw);
    const allPrices = extractPrices(raw);

    const wantsBreakfast = normalize(offer.board).includes("sniad");
    let breakfastPrices: number[] = [];
    if (wantsBreakfast) {
      const markers = ["sniadanie", "breakfast"];
      for (const marker of markers) {
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

    const boardPrice = lowest(breakfastPrices);
    const anyPrice = lowest(allPrices);
    const selectedPrice = boardPrice ?? anyPrice;

    if (selectedPrice === null) {
      return NextResponse.json({
        ok: false,
        error: "price_not_found_in_partner_response",
        checkedAt: new Date().toISOString(),
      }, { status: 200, headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
    }

    return NextResponse.json({
      ok: true,
      price: Math.round(selectedPrice),
      currency: "PLN",
      boardMatched: Boolean(boardPrice),
      checkedAt: new Date().toISOString(),
      source: "esky_live_page",
    }, { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" } });
  } catch (error) {
    console.error("[esky_package_price_error]", error);
    return NextResponse.json({ ok: false, error: "partner_fetch_failed" }, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}
