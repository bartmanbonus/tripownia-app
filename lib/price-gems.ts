import type { Offer } from "@/lib/offers";

export type PriceGemLevel = "gem" | "very-good" | "good" | "unverified";

export type PriceGemAssessment = {
  level: PriceGemLevel;
  label: string;
  emoji: string;
  median: number | null;
  discountPct: number | null;
  percentile: number | null;
  comparableCount: number;
  fresh: boolean;
  exact: boolean;
  concreteDates: boolean;
  reason: string;
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isAllInclusive(offer: Offer) {
  return /all inclusive|allinclusive/.test(normalize(offer.board || ""));
}

function isConcreteDates(offer: Offer) {
  const value = normalize(offer.dates || "");
  if (!value) return false;
  return !/wybrane|jesien|wiosn|lato|zima|weekend|najbliz|dowoln|termin do sprawdzenia/.test(value);
}

function isFresh(offer: Offer, now: Date, maxHours = 30) {
  if (!offer.priceCheckedAt) return false;
  const checked = new Date(offer.priceCheckedAt).getTime();
  if (!Number.isFinite(checked)) return false;
  const ageHours = (now.getTime() - checked) / 3600000;
  return ageHours >= 0 && ageHours <= maxHours;
}

function comparableTo(a: Offer, b: Offer) {
  if (a.id === b.id) return false;
  if (a.availabilityStatus === "expired" || b.availabilityStatus === "expired") return false;

  const sameCountry = normalize(a.country) === normalize(b.country);
  const sameCity = normalize(a.city) === normalize(b.city);
  const similarNights = Math.abs(a.nights - b.nights) <= 2;
  const sameBoardClass = isAllInclusive(a) === isAllInclusive(b);

  return (sameCity || sameCountry) && similarNights && sameBoardClass;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function assessPriceGem(offer: Offer, pool: Offer[], now = new Date()): PriceGemAssessment {
  const comparable = pool
    .filter((candidate) => comparableTo(offer, candidate))
    .filter((candidate) => candidate.price > 0);

  const prices = comparable.map((candidate) => candidate.price);
  const marketMedian = median(prices);
  const discountPct = marketMedian && marketMedian > 0
    ? Math.round(((marketMedian - offer.price) / marketMedian) * 100)
    : null;

  const rankPool = [...prices, offer.price].sort((a, b) => a - b);
  const rank = rankPool.findIndex((price) => price === offer.price);
  const percentile = rankPool.length > 1 && rank >= 0
    ? Math.round((rank / (rankPool.length - 1)) * 100)
    : null;

  const fresh = isFresh(offer, now);
  const exact = offer.linkMatch === "exact" || offer.linkType === "exact";
  const concreteDates = isConcreteDates(offer);
  const enoughMarket = comparable.length >= 3;

  if (fresh && exact && concreteDates && enoughMarket && ((discountPct ?? 0) >= 12 || (percentile ?? 100) <= 15)) {
    return {
      level: "gem",
      label: "PERŁKA CENOWA",
      emoji: "💎",
      median: marketMedian,
      discountPct,
      percentile,
      comparableCount: comparable.length,
      fresh,
      exact,
      concreteDates,
      reason: discountPct !== null && discountPct >= 12
        ? `Cena ok. ${discountPct}% poniżej mediany podobnych ofert.`
        : `Oferta znajduje się w najtańszych ${Math.max(1, percentile || 1)}% podobnych wyników.`,
    };
  }

  if (fresh && exact && concreteDates && enoughMarket && ((discountPct ?? 0) >= 6 || (percentile ?? 100) <= 30)) {
    return {
      level: "very-good",
      label: "BARDZO DOBRA CENA",
      emoji: "🔥",
      median: marketMedian,
      discountPct,
      percentile,
      comparableCount: comparable.length,
      fresh,
      exact,
      concreteDates,
      reason: discountPct !== null
        ? `Cena ok. ${Math.max(0, discountPct)}% poniżej mediany podobnych ofert.`
        : "Cena należy do mocniejszych w porównywalnej grupie.",
    };
  }

  if (fresh && concreteDates && comparable.length >= 1) {
    return {
      level: "good",
      label: "DOBRA OFERTA",
      emoji: "👍",
      median: marketMedian,
      discountPct,
      percentile,
      comparableCount: comparable.length,
      fresh,
      exact,
      concreteDates,
      reason: "Oferta jest świeża i konkretna, ale nie spełnia progu perełki cenowej.",
    };
  }

  const missing = [
    !fresh ? "świeżej ceny" : null,
    !exact ? "deeplinku do konkretnej oferty" : null,
    !concreteDates ? "konkretnego terminu" : null,
    comparable.length < 3 ? "wystarczającej liczby ofert porównawczych" : null,
  ].filter(Boolean).join(", ");

  return {
    level: "unverified",
    label: "DO WERYFIKACJI",
    emoji: "⚪",
    median: marketMedian,
    discountPct,
    percentile,
    comparableCount: comparable.length,
    fresh,
    exact,
    concreteDates,
    reason: missing ? `Brakuje: ${missing}.` : "Brak wystarczających danych do oceny ceny.",
  };
}

export function rankByPriceGem(pool: Offer[], now = new Date()) {
  const weight: Record<PriceGemLevel, number> = {
    gem: 4,
    "very-good": 3,
    good: 2,
    unverified: 1,
  };

  return [...pool].sort((a, b) => {
    const aa = assessPriceGem(a, pool, now);
    const bb = assessPriceGem(b, pool, now);
    return weight[bb.level] - weight[aa.level]
      || (bb.discountPct ?? -999) - (aa.discountPct ?? -999)
      || a.price - b.price
      || b.score - a.score;
  });
}
