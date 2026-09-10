import { getLinkMatch, type Offer } from "@/lib/offers";
import { assessPriceGem, rankByPriceGem, type PriceGemAssessment } from "@/lib/price-gems";
import { getSocialOfferPoolData } from "@/lib/social-offer-pool";

export type SocialTone = "short" | "sales" | "daily";
export type SocialSlotKind = "market" | "city" | "seasonal";

export type SocialPlanItem = {
  offer: Offer;
  time: string;
  label: string;
  kind: SocialSlotKind;
  tone: SocialTone;
  priceGem: PriceGemAssessment;
};

export type SocialDailyPlan = {
  dayName: string;
  theme: string;
  description: string;
  dateKey: string;
  items: SocialPlanItem[];
};

const TIMES = ["08:30", "11:30", "14:30", "18:00", "20:30"];
const DAY_NAMES: Record<number, string> = {
  0: "Niedziela", 1: "Poniedziałek", 2: "Wtorek", 3: "Środa",
  4: "Czwartek", 5: "Piątek", 6: "Sobota",
};

function normalize(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function dateKeyInWarsaw(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

function weekdayInWarsaw(now: Date) {
  const short = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Warsaw", weekday: "short" }).format(now);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[short] ?? 0;
}

function monthInWarsaw(now: Date) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Warsaw", month: "numeric" }).format(now));
}

function isCityBreak(offer: Offer) {
  const categories = offer.category.map(normalize);
  return categories.includes("city") || (offer.nights >= 2 && offer.nights <= 5);
}

function isSeasonalForDate(offer: Offer, planDate: Date) {
  const month = monthInWarsaw(planDate);
  const text = normalize(`${offer.city} ${offer.country}`);
  if ([11, 12, 1, 2, 3].includes(month)) {
    return /egipt|hurghada|marsa alam|sharm|teneryfa|fuerteventura|gran canaria|cypr|malta|zanzibar|kenia|mauritius|malediw|tajland|dominikan|meksyk|dubaj|emirat/.test(text);
  }
  if ([9, 10].includes(month)) {
    return /turcj|grecj|egipt|hiszpan|teneryfa|fuerteventura|cypr|malta|tunez|djerba|alban/.test(text);
  }
  return /turcj|grecj|egipt|hiszpan|bulgar|tunez|cypr|alban|wloch/.test(text);
}

function sourcePool(source: Offer[], evaluationNow: Date) {
  const live = getSocialOfferPoolData(evaluationNow).offers;
  const combined = [...live, ...source]
    .filter((offer, index, all) => all.findIndex((item) => item.id === offer.id) === index)
    .filter((offer) => offer.availabilityStatus !== "expired" && getLinkMatch(offer) !== "unsafe");
  return rankByPriceGem(combined, evaluationNow);
}

function choose(pool: Offer[], picked: Offer[], test: (offer: Offer) => boolean, preferredLevels: Array<PriceGemAssessment["level"]>, evaluationNow: Date) {
  const unused = pool.filter((offer) => !picked.some((item) => item.id === offer.id));
  for (const level of preferredLevels) {
    const found = unused.find((offer) => assessPriceGem(offer, pool, evaluationNow).level === level && test(offer));
    if (found) return found;
  }
  return unused.find(test) || unused[0];
}

function itemLabel(offer: Offer, pool: Offer[], evaluationNow: Date, fallback: string) {
  const assessment = assessPriceGem(offer, pool, evaluationNow);
  if (assessment.level !== "unverified") return `${assessment.emoji} ${assessment.label}`;
  return `⚪ ${fallback}`;
}

export function getSocialDailyPlan(source: Offer[], planDate = new Date()): SocialDailyPlan {
  const evaluationNow = new Date();
  const weekday = weekdayInWarsaw(planDate);
  const pool = sourcePool(source, evaluationNow);
  const picked: Offer[] = [];
  const items: SocialPlanItem[] = [];

  const slots: Array<{ test: (offer: Offer) => boolean; kind: SocialSlotKind; tone: SocialTone; fallback: string }> = [
    { test: () => true, kind: "market", tone: "daily", fallback: "Najmocniejsza cena dnia" },
    { test: (offer) => offer.nights >= 6, kind: "market", tone: "sales", fallback: "Wakacje 6+ nocy" },
    { test: isCityBreak, kind: "city", tone: "short", fallback: "City break" },
    { test: (offer) => isSeasonalForDate(offer, planDate), kind: "seasonal", tone: "sales", fallback: "Kierunek sezonowy" },
    { test: () => true, kind: "market", tone: "short", fallback: "Mocna oferta" },
  ];

  slots.forEach((slot, index) => {
    const offer = choose(pool, picked, slot.test, ["gem", "very-good", "good", "unverified"], evaluationNow);
    if (!offer) return;
    picked.push(offer);
    const priceGem = assessPriceGem(offer, pool, evaluationNow);
    items.push({
      offer,
      time: TIMES[index],
      label: itemLabel(offer, pool, evaluationNow, slot.fallback),
      kind: slot.kind,
      tone: slot.tone,
      priceGem,
    });
  });

  const verifiedCount = items.filter((item) => item.priceGem.level !== "unverified").length;
  const gemCount = items.filter((item) => item.priceGem.level === "gem").length;

  return {
    dayName: DAY_NAMES[weekday],
    theme: gemCount ? `${gemCount} cenowych perełek` : "Najmocniejsze zweryfikowane ceny",
    description: `${verifiedCount}/5 ofert ma świeżą weryfikację ceny. 💎 oznacza min. 12% poniżej mediany podobnych ofert lub top 15% cen, przy świeżej cenie, konkretnym terminie i deeplinku.`,
    dateKey: dateKeyInWarsaw(planDate),
    items: items.slice(0, 5),
  };
}
