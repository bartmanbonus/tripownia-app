import { NextRequest, NextResponse } from "next/server";
import { getDestinationImageRule } from "@/lib/destinationImages";

type ImageResult = {
  url: string;
  source: "google" | "wikimedia";
  sourcePage?: string;
  width?: number;
  height?: number;
};

async function searchGoogle(query: string): Promise<ImageResult | null> {
  const key = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!key || !cx) return null;

  const endpoint = new URL("https://www.googleapis.com/customsearch/v1");
  endpoint.searchParams.set("key", key);
  endpoint.searchParams.set("cx", cx);
  endpoint.searchParams.set("searchType", "image");
  endpoint.searchParams.set("q", `${query} -hotel room -booking -tripadvisor -logo -watermark -advertisement -poster -map -selfie`);
  endpoint.searchParams.set("num", "8");
  endpoint.searchParams.set("imgSize", "xxlarge");
  endpoint.searchParams.set("safe", "active");

  const response = await fetch(endpoint, { next: { revalidate: 60 * 60 * 24 * 7 } });
  if (!response.ok) return null;
  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  for (const item of items) {
    const width = Number(item.image?.width || 0);
    const height = Number(item.image?.height || 0);
    if (!item.link || width < 1200 || height <= 0 || width / height < 1.35) continue;
    return { url: item.link, source: "google", sourcePage: item.image?.contextLink, width, height };
  }
  return null;
}

async function searchWikimedia(query: string): Promise<ImageResult | null> {
  const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
  endpoint.searchParams.set("action", "query");
  endpoint.searchParams.set("generator", "search");
  endpoint.searchParams.set("gsrsearch", query);
  endpoint.searchParams.set("gsrnamespace", "6");
  endpoint.searchParams.set("gsrlimit", "12");
  endpoint.searchParams.set("prop", "imageinfo");
  endpoint.searchParams.set("iiprop", "url|size|mime");
  endpoint.searchParams.set("iiurlwidth", "1600");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("origin", "*");

  const response = await fetch(endpoint, {
    headers: { "User-Agent": "Tripownia.pl/1.0 (destination-image-resolver)" },
    next: { revalidate: 60 * 60 * 24 * 14 },
  });
  if (!response.ok) return null;
  const data = await response.json();
  const pages = Object.values(data.query?.pages || {}) as any[];

  const candidates = pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const width = Number(info.width || 0);
      const height = Number(info.height || 0);
      const mime = String(info.mime || "");
      const url = info.thumburl || info.url;
      if (!url || !mime.startsWith("image/") || width < 1200 || height <= 0 || width / height < 1.35) return null;
      return {
        url,
        source: "wikimedia" as const,
        sourcePage: info.descriptionurl,
        width,
        height,
      };
    })
    .filter(Boolean) as ImageResult[];

  return candidates[0] || null;
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() || "";
  const country = request.nextUrl.searchParams.get("country")?.trim() || "";
  if (!city) return NextResponse.json({ image: null }, { status: 400 });

  const rule = getDestinationImageRule(city, country);
  const image = (await searchGoogle(rule.query)) || (await searchWikimedia(rule.query));

  return NextResponse.json(
    { image, landmark: rule.landmark, query: rule.query },
    { headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" } },
  );
}
