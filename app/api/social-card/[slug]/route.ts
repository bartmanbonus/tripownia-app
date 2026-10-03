import { ImageResponse } from "next/og";
import { getSocialOffer } from "@/lib/socialOffers";
import { SocialCardImage, type SocialCardFormat } from "@/lib/socialCardImage";

export const runtime = "edge";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = getSocialOffer(slug);
  if (!offer) return new Response("Offer not found", { status: 404 });

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
