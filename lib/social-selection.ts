import { getLinkMatch, type Offer } from "@/lib/offers";
import { assessPriceGem, rankByPriceGem, type PriceGemAssessment } from "@/lib/price-gems";
import { getFallbackFlightOffer, getSocialOfferPoolData } from "@/lib/social-offer-pool";
import { DESTINATION_COOLDOWN_DAYS, isDestinationInRotationWindow, rotationPriority } from "@/lib/destination-rotation";

export type SocialTone = "short" | "sales" | "daily";
export type SocialSlotKind = "market" | "city" | "seasonal" | "flight";

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
const DAY_NAMES: Record<number, string> = { 0:"Niedziela",1:"Poniedziałek",2:"Wtorek",3:"Środa",4:"Czwartek",5:"Piątek",6:"Sobota" };

function normalize(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function dateKeyInWarsaw(now: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone:"Europe/Warsaw", year:"numeric", month:"2-digit", day:"2-digit" }).format(now);
}
function weekdayInWarsaw(now: Date) {
  const short = new Intl.DateTimeFormat("en-US", { timeZone:"Europe/Warsaw", weekday:"short" }).format(now);
  return ({Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6} as Record<string,number>)[short] ?? 0;
}
function monthInWarsaw(now: Date) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone:"Europe/Warsaw", month:"numeric" }).format(now));
}
function isCityBreak(offer: Offer) {
  return !offer.category.includes("flight") && (offer.category.map(normalize).includes("city") || (offer.nights >= 2 && offer.nights <= 5));
}
function isSeasonalForDate(offer: Offer, planDate: Date) {
  const month = monthInWarsaw(planDate);
  const text = normalize(`${offer.city} ${offer.country}`);
  if ([11,12,1,2,3].includes(month)) return /egipt|hurghada|marsa alam|sharm|teneryfa|fuerteventura|gran canaria|cypr|malta|zanzibar|kenia|mauritius|malediw|tajland|dominikan|meksyk|dubaj|emirat/.test(text);
  if ([9,10].includes(month)) return /turcj|grecj|egipt|hiszpan|teneryfa|fuerteventura|cypr|malta|tunez|djerba|alban/.test(text);
  return /turcj|grecj|egipt|hiszpan|bulgar|tunez|cypr|alban|wloch/.test(text);
}
function diverse(offer: Offer, picked: Offer[]) {
  return !picked.some((item) => normalize(item.city) === normalize(offer.city) || normalize(item.country) === normalize(offer.country));
}
function choose(pool: Offer[], picked: Offer[], test: (offer: Offer) => boolean, now: Date) {
  const unused = pool.filter((offer) => !picked.some((item) => item.id === offer.id) && !offer.category.includes("flight"));
  const different = unused.filter((offer) => diverse(offer, picked));
  const candidates = (different.length ? different : unused)
    .sort((a, b) => rotationPriority(b, now) - rotationPriority(a, now));

  const rotationCandidates = candidates.filter((offer) => isDestinationInRotationWindow(offer, now));
  const preferred = rotationCandidates.length >= 3 ? rotationCandidates : candidates;

  for (const level of ["gem","very-good","good","unverified"] as const) {
    const found = preferred.find((offer) => assessPriceGem(offer, pool, now).level === level && test(offer));
    if (found) return found;
  }
  return preferred.find(test) || preferred[0];
}
function flightAssessment(offer: Offer): PriceGemAssessment {
  return { level:"gem", label:"PERŁKA LOTNICZA", emoji:"✈️", median:null, discountPct:null, percentile:null, comparableCount:0, fresh:true, exact:true, concreteDates:true, reason:offer.reason };
}
function fallbackFlightAssessment(offer: Offer): PriceGemAssessment {
  return { level:"unverified", label:"LOT DO SPRAWDZENIA", emoji:"✈️", median:null, discountPct:null, percentile:null, comparableCount:0, fresh:false, exact:false, concreteDates:false, reason:offer.reason };
}

export function getSocialDailyPlan(_source: Offer[] = [], planDate = new Date()): SocialDailyPlan {
  const evaluationNow = new Date();
  const planKey = dateKeyInWarsaw(planDate);
  const todayKey = dateKeyInWarsaw(evaluationNow);
  const weekday = weekdayInWarsaw(planDate);

  if (planKey !== todayKey) {
    return { dayName:DAY_NAMES[weekday], theme:"Czeka na poranny skan", description:"Oferty pojawią się tego dnia o 07:00 po świeżym skanie. Nie planujemy przyszłych perełek na podstawie starych cen.", dateKey:planKey, items:[] };
  }

  const poolData = getSocialOfferPoolData(evaluationNow);
  const pool = rankByPriceGem(poolData.offers.filter((offer) => getLinkMatch(offer) !== "unsafe"), evaluationNow);
  const picked: Offer[] = [];
  const items: SocialPlanItem[] = [];

  const flight = poolData.flightGemId ? pool.find((offer) => offer.id === poolData.flightGemId) : undefined;
  if (flight && isDestinationInRotationWindow(flight, evaluationNow)) {
    picked.push(flight);
    items.push({ offer:flight, time:TIMES[0], label:"✈️ PERŁKA LOTNICZA", kind:"flight", tone:"daily", priceGem:flightAssessment(flight) });
  } else {
    const fallbackFlight = getFallbackFlightOffer(evaluationNow);
    picked.push(fallbackFlight);
    items.push({ offer:fallbackFlight, time:TIMES[0], label:"✈️ LOT DO SPRAWDZENIA", kind:"flight", tone:"daily", priceGem:fallbackFlightAssessment(fallbackFlight) });
  }

  const slots: Array<{test:(offer:Offer)=>boolean; kind:SocialSlotKind; tone:SocialTone; fallback:string}> = [
    { test:(offer)=>offer.nights>=6, kind:"market", tone:"sales", fallback:"Wakacje 6+ nocy" },
    { test:isCityBreak, kind:"city", tone:"short", fallback:"City break" },
    { test:(offer)=>isSeasonalForDate(offer, planDate), kind:"seasonal", tone:"sales", fallback:"Kierunek sezonowy" },
    { test:()=>true, kind:"market", tone:"short", fallback:"Mocna oferta" },
    { test:()=>true, kind:"market", tone:"daily", fallback:"Najmocniejsza cena dnia" },
  ];

  for (const slot of slots) {
    if (items.length >= 5) break;
    const offer = choose(pool, picked, slot.test, evaluationNow);
    if (!offer) continue;
    picked.push(offer);
    const priceGem = assessPriceGem(offer, pool, evaluationNow);
    items.push({ offer, time:TIMES[items.length], label:priceGem.level === "unverified" ? `⚪ ${slot.fallback}` : `${priceGem.emoji} ${priceGem.label}`, kind:slot.kind, tone:slot.tone, priceGem });
  }

  const verified = items.filter((item) => item.priceGem.level !== "unverified").length;
  const flightNote = flight ? "Maks. 1 perłka lotnicza dziennie." : "Lot jest dziś pozycją do ręcznego sprawdzenia, bo źródło cen live nie zwróciło perłki.";
  return {
    dayName:DAY_NAMES[weekday],
    theme:"Świeże okazje bez codziennych powtórek",
    description:`${verified}/${items.length || 5} pozycji ma świeżą weryfikację. Kierunki mają ${DESTINATION_COOLDOWN_DAYS}-dniową rotację, więc ta sama destynacja nie powinna wracać dzień po dniu. ${flightNote}`,
    dateKey:planKey,
    items,
  };
}
