import type { Offer } from "./offers";

const lessObvious = new Set([
  "Marrakesz", "Riwiera Albańska", "Madera", "Marsa Alam", "Bodrum", "Sycylia", "Djerba", "Pafos"
]);

export function isLessObvious(offer: Offer) {
  return lessObvious.has(offer.city);
}

export function offerQualityIssues(offer: Offer) {
  return getOfferQualityIssues({
    availabilityStatus: offer.availabilityStatus,
    priceCheckedAt: offer.priceCheckedAt,
    linkMatch: offer.linkMatch ?? (offer.linkType === "exact" ? "exact" : offer.destinationUrl ? "destination" : "parameters"),
  }).map(issue => issue.label);
}

export function offerQualityScore(offer: Offer) {
  const issues = getOfferQualityIssues({
    availabilityStatus: offer.availabilityStatus,
    priceCheckedAt: offer.priceCheckedAt,
    linkMatch: offer.linkMatch ?? (offer.linkType === "exact" ? "exact" : offer.destinationUrl ? "destination" : "parameters"),
  });

  if (offer.availabilityStatus === "expired") return 0;

  const penalty = issues.reduce((sum, issue) => {
    return sum + (issue.severity === "high" ? 35 : issue.severity === "medium" ? 15 : 5);
  }, 0);

  return Math.max(0, 100 - penalty);
}

export type SmartPreset = "all" | "cheap" | "warm" | "city" | "allinclusive" | "discover";

export function matchesPreset(offer: Offer, preset: SmartPreset) {
  if (preset === "all") return true;
  if (preset === "cheap") return offer.price <= 1200;
  if (preset === "warm") return offer.category.includes("cieplo");
  if (preset === "city") return offer.category.includes("city") && offer.nights <= 5;
  if (preset === "allinclusive") return offer.board.toLowerCase().includes("all inclusive");
  if (preset === "discover") return isLessObvious(offer);
  return true;
}

export function recommendationScore(offer: Offer, preset: SmartPreset) {
  let score = offer.score * 10;
  score += offer.linkType === "exact" ? 4 : 0;
  score += offer.tag === "BIERZEMY" ? 4 : offer.tag === "OKAZJA" ? 2 : 0;
  if (preset === "cheap") score += Math.max(0, 15 - offer.price / 150);
  if (preset === "discover" && isLessObvious(offer)) score += 8;
  if (preset === "warm" && offer.category.includes("cieplo")) score += 5;
  return score;
}


export type OfferQualityIssue = {
  code: "expired" | "unknown-status" | "stale-price" | "weak-link" | "missing-price-date";
  label: string;
  severity: "high" | "medium" | "low";
};

export function getPriceAgeDays(priceCheckedAt?: string, now = new Date()) {
  if (!priceCheckedAt) return null;
  const checked = new Date(priceCheckedAt);
  if (Number.isNaN(checked.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - checked.getTime()) / 86400000));
}

export function isPriceStale(priceCheckedAt?: string, maxAgeDays = 2, now = new Date()) {
  const age = getPriceAgeDays(priceCheckedAt, now);
  return age === null ? true : age > maxAgeDays;
}

export function getOfferQualityIssues(offer: {
  availabilityStatus?: "available" | "unknown" | "expired";
  priceCheckedAt?: string;
  linkMatch?: "exact" | "parameters" | "destination" | "unsafe";
}) {
  const issues: OfferQualityIssue[] = [];
  if (offer.availabilityStatus === "expired") {
    issues.push({ code: "expired", label: "Oferta wygasła", severity: "high" });
  } else if (!offer.availabilityStatus || offer.availabilityStatus === "unknown") {
    issues.push({ code: "unknown-status", label: "Dostępność do sprawdzenia", severity: "medium" });
  }

  if (!offer.priceCheckedAt) {
    issues.push({ code: "missing-price-date", label: "Brak daty sprawdzenia ceny", severity: "medium" });
  } else if (isPriceStale(offer.priceCheckedAt)) {
    issues.push({ code: "stale-price", label: "Cena starsza niż 48 h", severity: "medium" });
  }

  if (offer.linkMatch === "destination" || offer.linkMatch === "parameters" || offer.linkMatch === "unsafe") {
    issues.push({ code: "weak-link", label: "Brak deeplinku do konkretnej oferty", severity: offer.linkMatch === "unsafe" ? "high" : "low" });
  }

  return issues;
}
