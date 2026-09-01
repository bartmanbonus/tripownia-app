import { NextRequest, NextResponse } from "next/server";
import { getDestinationImageRule } from "@/lib/destinationImages";

type CommonsPage = {
  title?: string;
  imageinfo?: Array<{
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    mime?: string;
  }>;
};

/**
 * Logika zgodna z paczką TRIPOWNIA_ZDJECIA_CALY_SWIAT:
 * - zapytanie z kierunki.csv,
 * - Wikimedia Commons,
 * - namespace plików,
 * - pierwsze trafienie JPEG z thumburl około 1600 px.
 */
async function searchWikimedia(query: string) {
  const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
  endpoint.searchParams.set("action", "query");
  endpoint.searchParams.set("generator", "search");
  endpoint.searchParams.set("gsrsearch", query);
  endpoint.searchParams.set("gsrnamespace", "6");
  endpoint.searchParams.set("gsrlimit", "8");
  endpoint.searchParams.set("prop", "imageinfo");
  endpoint.searchParams.set("iiprop", "url|mime");
  endpoint.searchParams.set("iiurlwidth", "1600");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("origin", "*");

  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "TripowniaImagePack/1.0",
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const pages = Object.values(data.query?.pages || {}) as CommonsPage[];

  for (const page of pages) {
    const info = page.imageinfo?.[0];

    if (
      info &&
      info.mime === "image/jpeg" &&
      info.thumburl
    ) {
      return {
        url: info.thumburl,
        source: "wikimedia" as const,
        sourcePage: info.descriptionurl || null,
        title: page.title || "",
      };
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() || "";
  const country = request.nextUrl.searchParams.get("country")?.trim() || "";

  if (!city) {
    return NextResponse.json(
      { image: null, error: "Brak miasta" },
      { status: 400 },
    );
  }

  const rule = getDestinationImageRule(city, country);
  const image = rule.localPath
    ? {
        url: rule.localPath,
        source: "local" as const,
        sourcePage: null,
        title: rule.label,
      }
    : await searchWikimedia(rule.query);

  return NextResponse.json(
    {
      image,
      destination: rule.label,
      query: rule.query,
    },
    {
      headers: {
        // krótki cache na czas testów; po potwierdzeniu zwiększymy
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
