import type { Metadata } from "next";

export type ShareTravelKind = "package" | "flight" | "hotel" | "search" | "trip";

export type TravelShareDetails = {
  city: string;
  url: string;
  kind: ShareTravelKind;
  country?: string;
  departure?: string;
  dates?: string;
  hotel?: string;
  board?: string;
  nights?: number;
  price?: number | null;
  checkedAt?: string;
  titleOverride?: string;
};

/** Historical prices must not be advertised as current in social previews. */
export function isSharePriceFresh(checkedAt?: string, now = Date.now()): boolean {
  if (!checkedAt) return false;
  const timestamp = Date.parse(checkedAt);
  if (!Number.isFinite(timestamp)) return false;
  const age = now - timestamp;
  return age >= -5 * 60_000 && age <= 6 * 60 * 60_000;
}

function clean(value: string | undefined, max = 85) {
  return (value || "").replace(/[\r\n\t<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function formattedPrice(price: number | null | undefined, checkedAt: string | undefined) {
  if (!Number.isFinite(price) || !price || price <= 0 || price >= 100000 || !isSharePriceFresh(checkedAt)) return "";
  return Math.round(price).toLocaleString("pl-PL");
}

/**
 * One social-preview system for live offers, curated packages and travel-search pages.
 * The preview URL contains only public descriptive data, never partner tokens or URLs.
 */
export function travelShareMetadata(input: TravelShareDetails): Metadata {
  const city = clean(input.city, 65) || "Wyjazdy";
  const country = clean(input.country, 60);
  const departure = clean(input.departure, 65);
  const dates = clean(input.dates, 110);
  const hotel = clean(input.hotel, 95);
  const board = clean(input.board, 50);
  const price = formattedPrice(input.price, input.checkedAt);
  const kind: ShareTravelKind = ["flight", "hotel", "package", "search", "trip"].includes(input.kind) ? input.kind : "search";
  const typeLabel = kind === "flight" ? "LOTY" : kind === "hotel" ? "HOTELE" : kind === "trip" ? "PLAN PODRÓŻY" : kind === "search" ? "SZUKAJ PODRÓŻY" : "LOT + HOTEL";
  const titleBase = kind === "flight" ? `Loty: ${city}`
    : kind === "hotel" ? `Noclegi: ${city}`
    : kind === "trip" ? `Wyjazd: ${city}`
    : kind === "search" ? `Oferty: ${city}` : city;
  const title = input.titleOverride
    ? clean(input.titleOverride, 125)
    : `${titleBase}${price ? ` od ${price} zł/os.` : ""} | Tripownia.pl`;
  const details = [
    kind === "flight" ? "Wyszukaj loty" : kind === "hotel" ? "Porównaj noclegi" : kind === "trip" ? "Zaplanuj wyjazd" : kind === "search" ? "Sprawdź pasujące podróże" : "Sprawdź pakiet lot + hotel",
    country ? `${city}, ${country}` : city,
    departure ? `wylot: ${departure}` : "",
    dates,
    hotel,
    board,
  ].filter(Boolean);
  const description = `${details.join(" · ")}. ${price ? `Cena od ${price} zł/os. była niedawno sprawdzana. ` : ""}Aktualną cenę i dostępność potwierdź przed rezerwacją.`.slice(0, 400);
  const card = new URL("/api/share-preview", "https://tripownia.pl");
  for (const [key, value] of Object.entries({
    city, country, departure, dates, hotel, board, kind, price, label: typeLabel,
  })) if (value) card.searchParams.set(key, value);
  const pageUrl = new URL(input.url, "https://tripownia.pl").toString();
  const image = "https://tripownia.pl/api/share-preview?design=logo-white-v1";

  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Tripownia",
      locale: "pl_PL",
      url: pageUrl,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${city} — ${typeLabel} — Tripownia.pl` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
