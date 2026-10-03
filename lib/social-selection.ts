import { getLinkMatch, type Offer } from "@/lib/offers";
import { assessPriceGem, rankByPriceGem, type PriceGemAssessment } from "@/lib/price-gems";
import { getSocialOfferPoolData } from "@/lib/social-offer-pool";
import { findSocialOfferForCatalogOffer } from "@/lib/socialOffers";
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

const WEEKDAY_TIMES = ["09:17", "10:11", "11:43", "12:17", "17:19"];
const SATURDAY_TIMES = ["08:47", "10:07", "11:41", "16:17", "18:31"];
const SUNDAY_TIMES = ["09:11", "10:17", "12:13", "17:43", "18:19"];

function publishingTimes(weekday: number) {
  if (weekday === 0) return SUNDAY_TIMES;
  if (weekday === 6) return SATURDAY_TIMES;
  return WEEKDAY_TIMES;
}
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
function hasDurableSocialLanding(offer: Offer) {
  return Boolean(findSocialOfferForCatalogOffer({
    affiliateUrl: offer.affiliateUrl,
    city: offer.city,
    hotel: offer.hotel,
    price: offer.price,
  }));
}

function choose(
  pool: Offer[],
  picked: Offer[],
  test: (offer: Offer) => boolean,
  now: Date,
  options: { strict?: boolean; cheapestFirst?: boolean } = {}
) {
  const unused = pool.filter((offer) => !picked.some((item) => item.id === offer.id) && !offer.category.includes("flight"));
  const different = unused.filter((offer) => diverse(offer, picked));
  const candidates = [...(different.length ? different : unused)]
    .sort((a, b) => options.cheapestFirst
      ? a.price - b.price || rotationPriority(b, now) - rotationPriority(a, now)
      : rotationPriority(b, now) - rotationPriority(a, now) || a.price - b.price);

  const rotationCandidates = candidates.filter((offer) => isDestinationInRotationWindow(offer, now));
  const preferred = rotationCandidates.length >= 3 ? rotationCandidates : candidates;

  if (options.cheapestFirst) {
    const cheapestMatch = preferred.find(test);
    if (cheapestMatch) return cheapestMatch;
  }

  for (const level of ["gem","very-good","good","unverified"] as const) {
    const found = preferred.find((offer) => assessPriceGem(offer, pool, now).level === level && test(offer));
    if (found) return found;
  }
  const matching = preferred.find(test);
  if (matching) return matching;
  return options.strict ? undefined : preferred[0];
}
function flightAssessment(offer: Offer): PriceGemAssessment {
  return { level:"gem", label:"PERŁKA LOTNICZA", emoji:"✈️", median:null, discountPct:null, percentile:null, comparableCount:0, fresh:true, exact:true, concreteDates:true, reason:offer.reason };
}

export function getSocialDailyPlan(_source: Offer[] = [], planDate = new Date()): SocialDailyPlan {
  const evaluationNow = new Date();
  const planKey = dateKeyInWarsaw(planDate);
  const todayKey = dateKeyInWarsaw(evaluationNow);
  const weekday = weekdayInWarsaw(planDate);
  const times = publishingTimes(weekday);

  if (planKey !== todayKey) {
    return { dayName:DAY_NAMES[weekday], theme:"Czeka na poranny skan", description:"Oferty pojawią się tego dnia o 07:00 po świeżym skanie. Nie planujemy przyszłych perełek na podstawie starych cen.", dateKey:planKey, items:[] };
  }

  const provided = _source.filter((offer) => getLinkMatch(offer) !== "unsafe");
  const fallbackPool = provided.length ? null : getSocialOfferPoolData(evaluationNow);
  const sourceOffers = provided.length ? provided : fallbackPool?.offers || [];
  const poolData = {
    offers: sourceOffers,
    flightGemId: provided.length
      ? sourceOffers.find((offer) => offer.category.includes("flight") && offer.price > 0)?.id ?? null
      : fallbackPool?.flightGemId ?? null,
  };
  const pool = rankByPriceGem(sourceOffers, evaluationNow);
  const picked: Offer[] = [];
  const items: SocialPlanItem[] = [];

  const flight = poolData.flightGemId ? pool.find((offer) => offer.id === poolData.flightGemId) : undefined;
  if (flight && isDestinationInRotationWindow(flight, evaluationNow)) {
    picked.push(flight);
    items.push({ offer:flight, time:times[0], label:"✈️ PERŁKA LOTNICZA", kind:"flight", tone:"daily", priceGem:flightAssessment(flight) });
  }

  const cheapCity = (offer: Offer) => isCityBreak(offer) && offer.price > 0 && offer.price <= 1300;
  const durableCheapCity = (offer: Offer) => cheapCity(offer) && hasDurableSocialLanding(offer);
  const feedSlotsNeeded = flight ? 1 : 2;
  const durableFeedCount = pool.filter(durableCheapCity).length;
  const durableSlots = Math.min(feedSlotsNeeded, durableFeedCount);
  const fallbackCheapSlots = feedSlotsNeeded - durableSlots;

  const slots: Array<{
    test:(offer:Offer)=>boolean;
    kind:SocialSlotKind;
    tone:SocialTone;
    fallback:string;
    strict?:boolean;
    cheapestFirst?:boolean;
  }> = [
    ...Array.from({ length: durableSlots }, (_, index) => ({
      test: durableCheapCity,
      kind:"city" as const,
      tone:"short" as const,
      fallback:index === 0 ? "Tani city break" : "Drugi tani city break",
      strict:true,
      cheapestFirst:true,
    })),
    ...Array.from({ length: fallbackCheapSlots }, (_, index) => ({
      test: cheapCity,
      kind:"city" as const,
      tone:"short" as const,
      fallback:index === 0 && durableSlots === 0 ? "Tani city break" : "Drugi tani city break",
      strict:true,
      cheapestFirst:true,
    })),
    { test:(offer)=>offer.nights>=6, kind:"market", tone:"sales", fallback:"Wakacje 6+ nocy" },
    { test:(offer)=>isSeasonalForDate(offer, planDate), kind:"seasonal", tone:"sales", fallback:"Kierunek sezonowy" },
    { test:()=>true, kind:"market", tone:"daily", fallback:"Najmocniejsza cena dnia" },
    { test:()=>true, kind:"market", tone:"short", fallback:"Druga mocna oferta" },
  ];

  for (const slot of slots) {
    if (items.length >= 5) break;
    const offer = choose(pool, picked, slot.test, evaluationNow, {
      strict: slot.strict,
      cheapestFirst: slot.cheapestFirst,
    });
    if (!offer) continue;
    picked.push(offer);
    const priceGem = assessPriceGem(offer, pool, evaluationNow);
    items.push({ offer, time:times[items.length], label:priceGem.level === "unverified" ? `⚪ ${slot.fallback}` : `${priceGem.emoji} ${priceGem.label}`, kind:slot.kind, tone:slot.tone, priceGem });
  }

  const verified = items.filter((item) => item.priceGem.level !== "unverified").length;
  const flightNote = flight
    ? "Maks. 1 zweryfikowana perłka lotnicza dziennie."
    : "Brak zweryfikowanej perłki lotniczej — nie zajmuje miejsca w planie.";
  return {
    dayName:DAY_NAMES[weekday],
    theme:"Świeże okazje bez codziennych powtórek",
    description:`${verified}/${items.length || 5} pozycji ma świeżą weryfikację. Kierunki mają ${DESTINATION_COOLDOWN_DAYS}-dniową rotację, więc ta sama destynacja nie powinna wracać dzień po dniu. ${flightNote}`,
    dateKey:planKey,
    items,
  };
}
