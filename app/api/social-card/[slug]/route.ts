import { ImageResponse } from "next/og";
import { getSocialOffer, socialOfferReady } from "@/lib/socialOffers";
import { SocialCardImage, type SocialCardFormat } from "@/lib/socialCardImage";

export const runtime = "edge";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = getSocialOffer(slug);
  if (!offer) return new Response("Offer not found", { status: 404 });
  // Never generate new social assets containing a price that has not been checked recently.
  if (!socialOfferReady(offer)) return new Response("Offer price needs re-verification", { status: 410, headers: { "Cache-Control": "no-store" } });

  const url = new URL(request.url);
  const raw = url.searchParams.get("format") || "feed";
  const format: SocialCardFormat = raw === "story" || raw === "tiktok" || raw === "facebook" ? raw : "feed";
  const size = format === "facebook"
    ? { width: 1200, height: 630 }
    : format === "feed"
      ? { width: 1080, height: 1080 }
      : { width: 1080, height: 1920 };

  return new ImageResponse(
    SocialCardImage({ offer, origin: url.origin, format }),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}
