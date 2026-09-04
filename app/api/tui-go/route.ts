import { NextRequest, NextResponse } from "next/server";

type TdField = { name?: string; value?: string };
type TdOffer = {
  productUrl?: string;
  legacyProductUrl?: string;
  modified?: number;
  priceHistory?: Array<{ price?: { value?: string; currency?: string } }>;
};
type TdProduct = {
  name?: string;
  description?: string;
  fields?: TdField[];
  offers?: TdOffer[];
};

function normalize(value: string | undefined) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fieldMap(product: TdProduct) {
  return Object.fromEntries(
    (product.fields || [])
      .filter((field) => field.name)
      .map((field) => [field.name as string, field.value || ""])
  );
}

function boardScore(expected: string, actual: string) {
  const e = normalize(expected);
  const a = normalize(actual);
  if (!e) return 0;
  if (a === e) return 18;
  if (e.includes("all inclusive") && a.includes("all inclusive")) return 18;
  if (e.includes("sniad") && a.includes("sniad")) return 18;
  if ((e.includes("dwa posil") || e.includes("half board")) && (a.includes("dwa posil") || a.includes("half board"))) return 18;
  return 0;
}

function destinationTerms(destination: string, country: string) {
  const terms = [destination, country];
  const d = normalize(destination);

  if (d === "antalya") terms.push("Riwiera Turecka", "Antalya");
  if (d === "bodrum") terms.push("Wybrzeże Egejskie", "Bodrum");
  if (d === "hurghada") terms.push("Hurghada", "Egipt");
  if (d === "marsa alam") terms.push("Marsa Alam", "Egipt");

  return Array.from(new Set(terms.filter(Boolean)));
}

function scoreProduct(
  product: TdProduct,
  target: {
    destination: string;
    country: string;
    departure: string;
    duration: string;
    board: string;
    start: string;
  }
) {
  const fields = fieldMap(product);
  const haystack = normalize([
    product.name,
    product.description,
    fields.Country,
    fields.Region,
    fields.City,
    fields.HotelName,
  ].filter(Boolean).join(" "));

  let score = 0;
  const dest = normalize(target.destination);
  const country = normalize(target.country);

  if (dest && haystack.includes(dest)) score += 60;
  if (country && normalize(fields.Country) === country) score += 20;

  if (target.departure && normalize(fields.DeparturePlace) === normalize(target.departure)) score += 35;
  if (target.duration && String(fields.Duration || "") === String(target.duration)) score += 22;

  score += boardScore(target.board, fields.ServiceDescription || product.description || "");

  if (target.start && fields.DepartureDate) {
    const [day, month, year] = String(fields.DepartureDate).split(".");
    const normalizedDate = year && month && day ? `${year}-${month}-${day}` : "";
    if (normalizedDate === target.start) score += 35;
    else if (normalizedDate) {
      const wanted = new Date(`${target.start}T12:00:00Z`);
      const found = new Date(`${normalizedDate}T12:00:00Z`);
      if (!Number.isNaN(wanted.getTime()) && !Number.isNaN(found.getTime())) {
        const delta = Math.abs(Math.round((wanted.getTime() - found.getTime()) / 86400000));
        if (delta <= 3) score += 24;
        else if (delta <= 7) score += 14;
        else if (delta <= 14) score += 6;
      }
    }
  }

  // Prefer products with a concrete tracked URL and a recent price.
  if (product.offers?.[0]?.productUrl) score += 15;
  if (product.offers?.[0]?.priceHistory?.[0]?.price?.value) score += 5;

  return score;
}

async function fetchProducts(query: string, token: string) {
  const endpoint = new URL("https://api.tradedoubler.com/1.0/products.json");
  // Tradedoubler Product API uses semicolon-separated path parameters.
  const path = `${endpoint.origin}${endpoint.pathname};q=${encodeURIComponent(query)};page=1;pageSize=100;fid=24864?token=${encodeURIComponent(token)}`;

  const response = await fetch(path, {
    headers: { Accept: "application/json" },
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`Tradedoubler API ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.products) ? (data.products as TdProduct[]) : [];
}

export async function GET(request: NextRequest) {
  const token = process.env.TRADEDOUBLER_TUI_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "Brak TRADEDOUBLER_TUI_TOKEN w zmiennych środowiskowych Vercel.",
      },
      { status: 503 }
    );
  }

  const params = request.nextUrl.searchParams;
  const target = {
    destination: params.get("destination") || "",
    country: params.get("country") || "",
    departure: params.get("departure") || "",
    duration: params.get("duration") || "",
    board: params.get("board") || "",
    start: params.get("start") || "",
  };

  if (!target.destination) {
    return NextResponse.json({ ok: false, error: "Brak kierunku." }, { status: 400 });
  }

  try {
    let products: TdProduct[] = [];

    // First ask the feed for the exact destination. If that does not return
    // useful products, broaden to known region/country terms.
    for (const term of destinationTerms(target.destination, target.country)) {
      const batch = await fetchProducts(term, token);
      products = [...products, ...batch];

      const strong = batch
        .map((product) => ({ product, score: scoreProduct(product, target) }))
        .filter((item) => item.score >= 90);

      if (strong.length) break;
    }

    const unique = new Map<string, TdProduct>();
    for (const product of products) {
      const url = product.offers?.[0]?.productUrl || product.offers?.[0]?.legacyProductUrl;
      if (url) unique.set(url, product);
    }

    const ranked = Array.from(unique.values())
      .map((product) => ({ product, score: scoreProduct(product, target) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const bestUrl = best?.product.offers?.[0]?.productUrl || best?.product.offers?.[0]?.legacyProductUrl;

    // Never send a user to TUI homepage when we cannot match the requested trip.
    if (!best || !bestUrl || best.score < 55) {
      const fallback = new URL("/okazje", request.url);
      fallback.searchParams.set("tui", "brak-dopasowania");
      fallback.searchParams.set("kierunek", target.destination);
      return NextResponse.redirect(fallback);
    }

    return NextResponse.redirect(bestUrl);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Nie udało się pobrać feedu TUI.",
      },
      { status: 502 }
    );
  }
}
