import type { Offer } from "@/lib/offers";

export type PriceDecision = {
  action: "BRAĆ" | "OBSERWUJ" | "SPRAWDŹ PONOWNIE";
  trend: "spada" | "rośnie" | "stabilna" | "brak danych";
  message: string;
  deltaPercent?: number;
};

export function getPriceDecision(offer: Offer, currentPrice = offer.price): PriceDecision {
  const previous = offer.pricePrevious;
  if (!previous || previous <= 0) {
    return {
      action: offer.score >= 9.2 ? "BRAĆ" : "OBSERWUJ",
      trend: "brak danych",
      message: offer.score >= 9.2 ? "Oferta wygląda mocno, ale brakuje historii ceny." : "Brakuje historii ceny — warto obserwować.",
    };
  }

  const delta = ((currentPrice - previous) / previous) * 100;
  const deltaPercent = Math.round(Math.abs(delta));

  if (delta <= -6) {
    return { action: "BRAĆ", trend: "spada", deltaPercent, message: `Cena spadła o ok. ${deltaPercent}% względem poprzedniego poziomu.` };
  }
  if (delta >= 6) {
    return { action: "SPRAWDŹ PONOWNIE", trend: "rośnie", deltaPercent, message: `Cena wzrosła o ok. ${deltaPercent}% — warto sprawdzić ponownie przed zakupem.` };
  }
  return { action: offer.score >= 9.2 ? "BRAĆ" : "OBSERWUJ", trend: "stabilna", deltaPercent, message: "Cena jest zbliżona do poprzedniego poziomu." };
}
