import { getDailyOffers, getLinkMatch, type Offer } from "@/lib/offers";

export type SocialTone = "short" | "sales" | "daily";
export type SocialSlotKind = "market" | "city" | "seasonal";

export type SocialPlanItem = {
  offer: Offer;
  time: string;
  label: string;
  kind: SocialSlotKind;
  tone: SocialTone;
};

export type SocialDailyPlan = {
  dayName: string;
  theme: string;
  description: string;
  dateKey: string;
  items: SocialPlanItem[];
};

const TIMES = ["08:30", "11:30", "14:30", "18:00", "20:30"];

// Polska Izba Turystyki, Zagraniczne wakacje Polaków 2026:
// Turcja 28.3%, Grecja 18.0%, Egipt 13.6%, Hiszpania 9.6%,
// Bułgaria 7.5%, Tunezja 7.3%, Włochy 4.0%.
// Dodatkowo 82.2% klientów wybiera All Inclusive, a prawie 68% pobyty 7-8 dni.
const MARKET_SHARE: Record<string, number> = {
  turcja: 28.3,
  grecja: 18.0,
  egipt: 13.6,
  hiszpania: 9.6,
  bulgaria: 7.5,
  tunezja: 7.3,
  wlochy: 4.0,
  albania: 1.8,
  cypr: 1.4,
  chorwacja: 1.1,
};

// 21 głównych slotów tygodniowo (3 dziennie) rozkładamy zbliżenie do udziałów sprzedaży.
// Turcja 7x, Grecja 4x, Egipt 3x, Hiszpania 2x, Bułgaria 2x, Tunezja 2x, Włochy 1x.
const CORE_ROTATION: Record<number, string[]> = {
  1: ["turcja", "grecja", "egipt"],
  2: ["turcja", "hiszpania", "bulgaria"],
  3: ["grecja", "turcja", "tunezja"],
  4: ["egipt", "turcja", "grecja"],
  5: ["turcja", "bulgaria", "hiszpania"],
  6: ["tunezja", "turcja", "egipt"],
  0: ["grecja", "turcja", "wlochy"],
};

const DAY_NAMES: Record<number, string> = {
  0: "Niedziela",
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
  6: "Sobota",
};

const COUNTRY_LABELS: Record<string, string> = {
  turcja: "Turcja",
  grecja: "Grecja",
  egipt: "Egipt",
  hiszpania: "Hiszpania",
  bulgaria: "Bułgaria",
  tunezja: "Tunezja",
  wlochy: "Włochy",
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function countryKey(offer: Offer) {
  const value = normalize(offer.country);
  if (/turcj/.test(value)) return "turcja";
  if (/grecj/.test(value)) return "grecja";
  if (/egipt/.test(value)) return "egipt";
  if (/hiszpan/.test(value)) return "hiszpania";
  if (/bulgar/.test(value)) return "bulgaria";
  if (/tunez/.test(value)) return "tunezja";
  if (/wloch|ital/.test(value)) return "wlochy";
  if (/alban/.test(value)) return "albania";
  if (/cypr/.test(value)) return "cypr";
  if (/chorw/.test(value)) return "chorwacja";
  return value;
}

function dateKeyInWarsaw(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function weekdayInWarsaw(now: Date) {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    weekday: "short",
  }).format(now);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[short] ?? 0;
}

function monthInWarsaw(now: Date) {
  return Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    month: "numeric",
  }).format(now));
}

function isConcrete(offer: Offer) {
  const dates = normalize(offer.dates || "");
  if (!dates) return false;
  return !/wybrane|jesien|wiosn|lato|zima|najblizszy|dowoln|weekendy/.test(dates);
}

function isCityBreak(offer: Offer) {
  const categories = offer.category.map(normalize);
  const text = normalize(`${offer.city} ${offer.country}`);
  const knownCities = /rzym|barcelona|paryz|praga|budapeszt|wieden|lizbona|porto|mediolan|wenecja|ateny|malta|bergamo|neapol|stambul/;
  return categories.includes("city") || (offer.nights >= 2 && offer.nights <= 5 && knownCities.test(text));
}

function isAllInclusive(offer: Offer) {
  return /all inclusive|allinclusive/.test(normalize(offer.board || ""));
}

function isSeasonalNow(offer: Offer, now: Date) {
  const month = monthInWarsaw(now);
  const text = normalize(`${offer.city} ${offer.country}`);

  // Zima / późna jesień: największy sens mają ciepłe kierunki i egzotyka.
  if ([11, 12, 1, 2, 3].includes(month)) {
    return /egipt|hurghada|marsa alam|sharm|teneryfa|fuerteventura|gran canaria|cypr|malta|zanzibar|kenia|mauritius|malediw|tajland|dominikan|meksyk|dubaj|emirat/.test(text);
  }

  // Wrzesień-październik: wydłużamy lato, ale zaczynamy dokładać zimowe słońce.
  if ([9, 10].includes(month)) {
    return /turcj|grecj|egipt|hiszpan|teneryfa|fuerteventura|cypr|malta|tunez|djerba|alban/.test(text);
  }

  // Wiosna i lato: rdzeń sprzedaży czarterowej.
  return /turcj|grecj|egipt|hiszpan|bulgar|tunez|cypr|alban|wloch/.test(text);
}

function qualityScore(offer: Offer, now = new Date()) {
  let value = offer.score * 100;
  const linkMatch = getLinkMatch(offer);
  if (linkMatch === "exact") value += 320;
  else if (linkMatch === "parameters") value += 190;
  else if (linkMatch === "destination") value += 50;

  if (isConcrete(offer)) value += 180;
  else value -= 80;

  // Najsilniejsze zachowania zakupowe 2026: AI i tydzień pobytu.
  if (isAllInclusive(offer)) value += 240;
  if (offer.nights >= 7 && offer.nights <= 8) value += 210;
  else if (offer.nights >= 6 && offer.nights <= 9) value += 90;

  // Udział kierunku w realnej sprzedaży działa jako prior, ale nie przykrywa jakości oferty.
  value += (MARKET_SHARE[countryKey(offer)] || 0) * 8;

  // Cena ma pomagać znaleźć okazję, nie wymuszać tylko najtańszych wyjazdów.
  if (offer.price <= 2000) value += 170;
  else if (offer.price <= 2800) value += 125;
  else if (offer.price <= 3600) value += 85;
  else if (offer.price <= 4500) value += 35;

  if (offer.tag === "BIERZEMY") value += 90;
  else if (offer.tag === "OKAZJA") value += 55;

  if (offer.priceCheckedAt) {
    const checked = new Date(offer.priceCheckedAt).getTime();
    if (Number.isFinite(checked)) {
      const ageHours = Math.max(0, (now.getTime() - checked) / 3600000);
      if (ageHours <= 24) value += 220;
      else if (ageHours <= 48) value += 170;
      else if (ageHours <= 168) value += 80;
    }
  }

  return value;
}

function rankedPool(source: Offer[], now: Date) {
  const active = source.filter((offer) => offer.availabilityStatus !== "expired" && getLinkMatch(offer) !== "unsafe");
  const daily = getDailyOffers(active, Math.min(30, active.length), now);
  const combined = [...daily, ...active].filter((offer, index, all) => all.findIndex((item) => item.id === offer.id) === index);
  return combined.sort((a, b) => qualityScore(b, now) - qualityScore(a, now));
}

function chooseBest(
  pool: Offer[],
  picked: Offer[],
  test: (offer: Offer) => boolean,
  targetCountry?: string,
) {
  const unused = pool.filter((offer) => !picked.some((item) => item.id === offer.id));
  const unusedCountry = unused.filter((offer) => !picked.some((item) => countryKey(item) === countryKey(offer)));

  const targeted = targetCountry
    ? unusedCountry.filter((offer) => countryKey(offer) === targetCountry && test(offer))
    : [];
  if (targeted[0]) return targeted[0];

  const freshMatch = unusedCountry.find(test);
  if (freshMatch) return freshMatch;

  const fallbackTarget = targetCountry
    ? unused.find((offer) => countryKey(offer) === targetCountry && test(offer))
    : undefined;
  if (fallbackTarget) return fallbackTarget;

  return unused.find(test) || unusedCountry[0] || unused[0];
}

export function getSocialDailyPlan(source: Offer[], now = new Date()): SocialDailyPlan {
  const weekday = weekdayInWarsaw(now);
  const pool = rankedPool(source, now);
  const picked: Offer[] = [];
  const items: SocialPlanItem[] = [];
  const coreCountries = CORE_ROTATION[weekday] || CORE_ROTATION[1];

  // 3/5 publikacji: to, co realnie dominuje w zakupach pakietów turystycznych.
  coreCountries.forEach((targetCountry, index) => {
    const offer = chooseBest(
      pool,
      picked,
      (candidate) => {
        const key = countryKey(candidate);
        const core = MARKET_SHARE[key] >= 4;
        const strongPackage = isAllInclusive(candidate) || (candidate.nights >= 6 && candidate.nights <= 9);
        return core && strongPackage;
      },
      targetCountry,
    );
    if (!offer) return;
    picked.push(offer);
    items.push({
      offer,
      time: TIMES[index],
      label: `🔥 Hit rynku: ${COUNTRY_LABELS[targetCountry] || offer.country}`,
      kind: "market",
      tone: index === 0 ? "daily" : index === 1 ? "sales" : "short",
    });
  });

  // 1/5: model indywidualny/dynamiczny — Europa i krótszy wyjazd.
  const city = chooseBest(pool, picked, isCityBreak);
  if (city) {
    picked.push(city);
    items.push({
      offer: city,
      time: TIMES[3],
      label: "🏙️ Europa / city break",
      kind: "city",
      tone: "sales",
    });
  }

  // 1/5: sezonowość. We wrześniu i październiku wydłużamy lato; zimą preferujemy słońce.
  const seasonal = chooseBest(pool, picked, (offer) => isSeasonalNow(offer, now));
  if (seasonal) {
    picked.push(seasonal);
    items.push({
      offer: seasonal,
      time: TIMES[4],
      label: "☀️ Kierunek sezonowy",
      kind: "seasonal",
      tone: "daily",
    });
  }

  // Gdy któryś segment jest chwilowo pusty w feedzie, dopełniamy tylko jakościowymi i różnymi ofertami.
  while (items.length < 5) {
    const fallback = chooseBest(pool, picked, () => true);
    if (!fallback) break;
    picked.push(fallback);
    items.push({
      offer: fallback,
      time: TIMES[items.length],
      label: "⭐ Mocna oferta",
      kind: "market",
      tone: "short",
    });
  }

  return {
    dayName: DAY_NAMES[weekday],
    theme: "Miks oparty na sprzedaży 2026",
    description: "3 hity rynku + 1 Europa/city break + 1 kierunek sezonowy. Priorytet: All Inclusive, 7–8 nocy, świeża cena i konkretny termin.",
    dateKey: dateKeyInWarsaw(now),
    items: items.slice(0, 5),
  };
}
