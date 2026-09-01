import { NextRequest, NextResponse } from "next/server";
import { getAllOffers } from "@/lib/offers";

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

  const offer = getAllOffers().find(item => item.id === offerId);
  if (!offer || offer.availabilityStatus === "expired") {
    return NextResponse.redirect(new URL(`/oferta/${offerId}`, request.url), 307);
  }

  const target = safeExternalUrl(offer.affiliateUrl);
  if (!target) {
    return NextResponse.redirect(new URL(`/oferta/${offerId}`, request.url), 307);
  }

  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
