import { NextResponse } from "next/server";
import { getSocialOfferForLanding } from "@/lib/socialOffers";

export const dynamic = "force-dynamic";

const SOCIAL_SOURCES = {
  fb: "facebook",
  ig: "instagram",
  tt: "tiktok",
} as const;

/**
 * Clean, branded, source-aware first-comment links:
 * https://tripownia.pl/l/fb/<curated-social-offer-slug>
 *
 * /l never sends visitors to an affiliate. They always see the offer on
 * Tripownia first, with the original status and price-verification warnings.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ channel: string; slug: string }> },
) {
  const { channel, slug } = await params;
  const source = SOCIAL_SOURCES[channel as keyof typeof SOCIAL_SOURCES];
  const offer = getSocialOfferForLanding(slug);
  if (!source || !offer) {
    return new Response("Nie znaleziono odnośnika Tripowni.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const destination = new URL(`/o/${encodeURIComponent(offer.slug)}`, request.url);
  destination.searchParams.set("utm_source", source);
  destination.searchParams.set("utm_medium", "organic_social");
  destination.searchParams.set("utm_campaign", "tripownia_offers");
  destination.searchParams.set("utm_content", offer.slug);

  const response = NextResponse.redirect(destination, { status: 307 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
