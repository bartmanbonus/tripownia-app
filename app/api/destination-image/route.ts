import { NextRequest, NextResponse } from "next/server";
import { getDestinationImageRule } from "@/lib/destinationImages";

type CommonsPage = {
  title?: string;
  imageinfo?: Array<{
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    mime?: string;
    width?: number;
    height?: number;
  }>;
};

const BAD_TITLE = /\b(map|locator|logo|flag|coat of arms|icon|diagram|poster|advert|advertisement|menu|floor plan|room|interior|selfie)\b/i;

async function searchWikimedia(query: string) {
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
    headers: {
      "User-Agent": "TripowniaImageResolver/2.0 (Tripownia.pl)",
      "Accept": "application/json",
    },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const pages = Object.values(data.query?.pages || {}) as CommonsPage[];

  const candidates = pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;

      const title = String(page.title || "");
      const mime = String(info.mime || "");
      const width = Number(info.width || 0);
      const height = Number(info.height || 0);
      const ratio = height > 0 ? width / height : 0;
      const url = info.thumburl || info.url;

      if (!url) return null;
      if (mime !== "image/jpeg") return null;
      if (BAD_TITLE.test(title)) return null;
      if (width < 1200 || height < 600) return null;
      if (ratio < 1.35 || ratio > 2.4) return null;

      return {
        url,
        source: "wikimedia" as const,
        sourcePage: info.descriptionurl || null,
        title,
        width,
        height,
      };
    })
    .filter(Boolean);

  return candidates[0] || null;
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() || "";
  const country = request.nextUrl.searchParams.get("country")?.trim() || "";

  if (!city) {
    return NextResponse.json({ image: null, error: "Brak miasta" }, { status: 400 });
  }

  const rule = getDestinationImageRule(city, country);
  const image = await searchWikimedia(rule.query);

  return NextResponse.json(
    {
      image,
      destination: rule.label,
      query: rule.query,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=2592000",
      },
    },
  );
}
