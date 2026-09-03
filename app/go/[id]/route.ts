import { NextRequest, NextResponse } from "next/server";
import { offers } from "@/lib/offers";
import { recordClick } from "@/lib/clickStats";

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const offerId = Number(id);

  if (!Number.isFinite(offerId)) {
    return NextResponse.redirect(new URL("/okazje", request.url), 307);
  }

  const offer = offers.find((item) => item.id === offerId);

  if (!offer || offer.availabilityStatus === "expired") {
    return NextResponse.redirect(new URL(`/oferta/${offerId}`, request.url), 307);
  }

  /*
   * EXIM:
   * Nie wysyłamy użytkownika na ogólną stronę kierunku.
   * Korzystamy z istniejącego endpointu Tripowni, który wybiera najlepszą/
   * najtańszą konkretną ofertę w obrębie wskazanego kierunku i lotniska.
   */
  if (offer.partner === "exim" && offer.destinationUrl) {
    try {
      const eximPath = new URL(offer.destinationUrl).pathname;
      const qs = new URLSearchParams({
        path: eximPath,
        from: offer.airportCode || "WAW",
      });

      const source = request.nextUrl.searchParams.get("source") || "offer_card";
      qs.set("source", source);

      return NextResponse.redirect(
        new URL(`/go/exim-best?${qs.toString()}`, request.url),
        307
      );
    } catch {
      // fallback do zwykłego affiliateUrl poniżej
    }
  }

  /*
   * eSky / Kiwi / Wakacje / inni:
   * offer.affiliateUrl ma zachować parametry oferty i tracking.
   * eSky ma sortowanie ceny rosnąco ustawione w partners.ts.
   * Kiwi przekazuje custom_url do Travelpayouts, więc nie wolno go tu przepisywać.
   */
  const target = safeExternalUrl(offer.affiliateUrl);

  if (!target) {
    return NextResponse.redirect(new URL(`/oferta/${offerId}`, request.url), 307);
  }

  const source = request.nextUrl.searchParams.get("source") || "offer_detail";

  console.info(
    "[tripownia_affiliate_click]",
    JSON.stringify({
      event: "affiliate_click",
      ts: new Date().toISOString(),
      partner: offer.partner,
      source,
      offer: offer.id,
      destination: `${offer.city}, ${offer.country}`,
      targetHost: target.hostname,
      path: request.nextUrl.pathname,
    })
  );

  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  recordClick(request, response, {
    partner: offer.partner,
    source,
    offer: String(offer.id),
    destination: `${offer.city}, ${offer.country}`,
  });

  const cookieName = `tripownia_click_${offerId}`;
  const previous = Number(request.cookies.get(cookieName)?.value || "0");

  response.cookies.set(cookieName, String(Math.min(previous + 1, 999)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
