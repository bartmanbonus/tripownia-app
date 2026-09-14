import publishedOverridesRaw from "@/data/offer-overrides.json";
import type { Offer } from "@/lib/offers";

export type AvailabilityStatus = "available" | "unknown" | "expired";

export type PublishedOverride = {
  hidden?: boolean;
  featured?: boolean;
  price?: number;
  affiliateUrl?: string;
  imageUrl?: string;
  note?: string;
  updatedAt?: string;
  linkMatch?: "exact" | "parameters" | "destination";
  availabilityStatus?: AvailabilityStatus;
};

const POLISH_MONTHS: Record<string, number> = {
  stycznia: 0,
  lutego: 1,
  marca: 2,
  kwietnia: 3,
  maja: 4,
  czerwca: 5,
  lipca: 6,
  sierpnia: 7,
  wrzesnia: 8,
  października: 9,
  pazdziernika: 9,
  listopada: 10,
  grudnia: 11,
  styczen: 0,
  luty: 1,
  marzec: 2,
  kwiecien: 3,
  maj: 4,
  czerwiec: 5,
  lipiec: 6,
  sierpien: 7,
  wrzesien: 8,
  pazdziernik: 9,
  listopad: 10,
  grudzien: 11,
};

export const publishedOfferOverrides = publishedOverridesRaw as Record<string, PublishedOverride>;

export const featuredOfferIds = new Set(
  Object.entries(publishedOfferOverrides)
    .filter(([, value]) => Boolean(value.featured))
    .map(([id]) => Number(id))
);

function normalizeDateText(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function inferOfferEndDate(value?: string): Date | null {
  if (!value) return null;
  const raw = normalizeDateText(value).replace(/[–—]/g, "-");
  const exact = raw.match(/(?:\d{1,2}\s*-\s*)?(\d{1,2})\s+([a-z]+)\s+(20\d{2})/);
  if (exact) {
    const month = POLISH_MONTHS[exact[2]];
    if (month !== undefined) return new Date(Date.UTC(Number(exact[3]), month, Number(exact[1]), 23, 59, 59));
  }

  const monthOnly = raw.match(/\b([a-z]+)\s+(20\d{2})\b/);
  if (monthOnly) {
    const month = POLISH_MONTHS[monthOnly[1]];
    if (month !== undefined) return new Date(Date.UTC(Number(monthOnly[2]), month + 1, 0, 23, 59, 59));
  }

  return null;
}

export function isOfferExpired(offer: Pick<Offer, "availabilityStatus" | "dates">, now = new Date()) {
  if (offer.availabilityStatus === "expired") return true;
  const end = inferOfferEndDate(offer.dates);
  return Boolean(end && end.getTime() < now.getTime());
}

export function getLinkMatch(offer: Pick<Offer, "linkMatch" | "linkType" | "partner" | "destinationUrl">): "exact" | "parameters" | "destination" | "unsafe" {
  if (offer.linkMatch) return offer.linkMatch;
  if (offer.linkType === "exact") return "exact";
  if (offer.partner === "esky") return "parameters";
  if (offer.partner === "tui") return "unsafe";
  if (offer.destinationUrl) return "destination";
  return "unsafe";
}

export function formatPriceCheckedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
