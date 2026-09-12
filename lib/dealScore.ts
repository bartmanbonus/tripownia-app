import type { Offer } from "@/lib/offers";

type DealVerdict = "BIERZ" | "DOBRA OPCJA" | "SPRAWDŹ CENĘ";

export type DealScoreResult = {
  score: number;
  verdict: DealVerdict;
  confidence: "wysoka" | "średnia";
  reasons: string[];
};

export function getDealScore(offer: Offer, displayPrice = offer.price, isLiveExact = false): DealScoreResult {
  let score = Math.round(Math.max(0, Math.min(10, offer.score)) * 8);
  const reasons: string[] = [];

  if (isLiveExact) {
    score += 8;
    reasons.push("aktualna oferta partnera");
  }

  if (offer.pricePrevious && offer.pricePrevious > displayPrice) {
    const drop = Math.round(((offer.pricePrevious - displayPrice) / offer.pricePrevious) * 100);
    score += Math.min(8, Math.max(2, Math.round(drop / 3)));
    reasons.push(`cena niższa o ${drop}%`);
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
  if (categories.has("tanio")) {
    score += 3;
    reasons.push("mocna cena");
  }
  if (categories.has("weekend") && offer.nights <= 4) {
    score += 2;
    reasons.push("dobry krótki termin");
  }
  if (categories.has("allinclusive") && offer.nights >= 7) {
    score += 2;
    reasons.push("pełny pakiet wypoczynkowy");
  }

  score = Math.max(0, Math.min(100, score));

  const verdict: DealVerdict = score >= 86 ? "BIERZ" : score >= 74 ? "DOBRA OPCJA" : "SPRAWDŹ CENĘ";
  const confidence = isLiveExact || Boolean(offer.pricePrevious) ? "wysoka" : "średnia";

  if (!reasons.length) reasons.push("dobry balans ceny i jakości");

  return { score, verdict, confidence, reasons: reasons.slice(0, 3) };
}
