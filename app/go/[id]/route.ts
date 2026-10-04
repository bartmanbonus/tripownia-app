import { NextRequest, NextResponse } from "next/server";
import { offers } from "@/lib/offers";

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
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

  const target = safeExternalUrl(offer.affiliateUrl);
  if (!target) {
    return NextResponse.redirect(new URL(`/oferta/${offerId}`, request.url), 307);
  }

  const tracked = new URL("/go/live", request.url);
  tracked.searchParams.set("target", target.toString());
  tracked.searchParams.set("partner", offer.partner);
  tracked.searchParams.set("source", request.nextUrl.searchParams.get("source") || "offer_detail");
  tracked.searchParams.set("offer", String(offer.id));
  tracked.searchParams.set("destination", `${offer.city}, ${offer.country}`);
  if (offer.price) tracked.searchParams.set("price", String(offer.price));
  tracked.searchParams.set("page", request.headers.get("referer") || request.nextUrl.pathname);

  const response = NextResponse.redirect(tracked, 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
