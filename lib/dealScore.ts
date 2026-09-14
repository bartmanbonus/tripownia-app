import type { Offer } from "@/lib/offers";
import { isPriceStale } from "@/lib/offerQuality";

type DealVerdict = "BIERZ" | "DOBRA OPCJA" | "SPRAWDŹ CENĘ";

export type DealScoreResult = {
  score: number;
  verdict: DealVerdict;
  confidence: "wysoka" | "średnia" | "niska";
  reasons: string[];
};

export function getDealScore(offer: Offer, displayPrice = offer.price, isLiveExact = false): DealScoreResult {
  const hasCheckedPrice = Boolean(offer.priceCheckedAt);
  const freshPrice = hasCheckedPrice && !isPriceStale(offer.priceCheckedAt);
  const exactLink = offer.linkMatch === "exact" || offer.linkType === "exact";
  const available = offer.availabilityStatus !== "expired";

  // Ocena bazowa opisuje jakość samego wyjazdu, ale nie może sama tworzyć
  // mocnego werdyktu cenowego. Większą wagę dostają dopiero świeże dane.
  let score = Math.round(Math.max(0, Math.min(10, offer.score)) * 6);
  const reasons: string[] = [];

  if (isLiveExact && freshPrice && available) {
    score += 22;
    reasons.push("świeża cena i dokładny link");
  } else if (freshPrice) {
    score += 10;
    reasons.push("cena sprawdzona niedawno");
  } else if (exactLink) {
    score += 4;
    reasons.push("dokładny link do oferty");
  }

  if (offer.pricePrevious && offer.pricePrevious > displayPrice && freshPrice) {
    const drop = Math.round(((offer.pricePrevious - displayPrice) / offer.pricePrevious) * 100);
    if (drop >= 3) {
      score += Math.min(8, Math.max(2, Math.round(drop / 3)));
      reasons.push(`cena niższa o ${drop}%`);
    }
  }

  if (offer.baggageIncluded) {
    score += 3;
    reasons.push("bagaż w cenie");
  }

  if (offer.transferIncluded) {
    score += 3;
    reasons.push("transfer w cenie");
  }

  const categories = new Set(offer.category || []);
  if (categories.has("tanio") && freshPrice) {
    score += 2;
    reasons.push("niska cena wejściowa");
  }
  if (categories.has("weekend") && offer.nights <= 4) {
    score += 2;
    reasons.push("dobry krótki termin");
  }
  if (categories.has("allinclusive") && offer.nights >= 7) {
    score += 2;
    reasons.push("pełny pakiet wypoczynkowy");
  }

  if (!freshPrice) score -= 6;
  if (!exactLink) score -= 4;

  score = Math.max(0, Math.min(100, score));

  const confidence: DealScoreResult["confidence"] = isLiveExact && freshPrice
    ? "wysoka"
    : freshPrice || exactLink
      ? "średnia"
      : "niska";

  const verdict: DealVerdict = confidence === "wysoka" && score >= 86
    ? "BIERZ"
    : score >= 72 && confidence !== "niska"
      ? "DOBRA OPCJA"
      : "SPRAWDŹ CENĘ";

  if (!reasons.length) reasons.push("cena wymaga potwierdzenia");

  return { score, verdict, confidence, reasons: reasons.slice(0, 3) };
}
