export type AffiliateTripKind = "flight" | "hotel" | "package";

export type AffiliateReturnContext = {
  savedAt: string;
  slug?: string;
  partner?: string;
  destination?: string;
  city?: string;
  country?: string;
  tripKind: AffiliateTripKind;
  source?: string;
  offerId?: string;
  price?: string;
  start?: string;
  end?: string;
  departure?: string;
  hotel?: string;
  board?: string;
  nights?: string;
  returnPath?: string;
};

export const AFFILIATE_RETURN_STORAGE_KEY = "tripownia-affiliate-return-v1";
export const AFFILIATE_RETURN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function affiliateTripKind(partner?: string): AffiliateTripKind {
  if (partner === "kiwi") return "flight";
  if (partner === "booking" || partner === "holidaypark") return "hotel";
  return "package";
}

export function saveAffiliateReturnContext(input: {
  partner?: string;
  destination?: string;
  source?: string;
  offerId?: string | number;
  price?: string | number;
  slug?: string;
  tripKind?: AffiliateTripKind;
  start?: string;
  end?: string;
  departure?: string;
  hotel?: string;
  board?: string;
  nights?: string | number;
}) {
  if (typeof window === "undefined") return;

  try {
    const destination = (input.destination || "").trim();
    const [city = "", ...countryParts] = destination.split(",").map((part) => part.trim());
    const payload: AffiliateReturnContext = {
      savedAt: new Date().toISOString(),
      partner: input.partner || "",
      destination,
      city,
      country: countryParts.join(", "),
      tripKind: input.tripKind || affiliateTripKind(input.partner),
      source: input.source || "",
      offerId: input.offerId == null ? "" : String(input.offerId),
      price: input.price == null ? "" : String(input.price),
      slug: input.slug || "",
      start: input.start || "",
      end: input.end || "",
      departure: input.departure || "",
      hotel: input.hotel || "",
      board: input.board || "",
      nights: input.nights == null ? "" : String(input.nights),
      returnPath: `${window.location.pathname}${window.location.search}`,
    };
    localStorage.setItem(AFFILIATE_RETURN_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Brak localStorage nie może blokować wyjścia do partnera.
  }
}
