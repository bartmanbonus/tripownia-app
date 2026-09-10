import { getDailyOffers, getLinkMatch, type Offer } from "@/lib/offers";

export type SocialTone = "short" | "sales" | "daily";
export type SocialSlotKind = "best" | "cheap" | "city" | "sun" | "beach" | "allinclusive" | "weekend" | "exotic";

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

type ThemeSlot = {
  kind: SocialSlotKind;
  label: string;
  tone: SocialTone;
};

type DayTheme = {
  name: string;
  theme: string;
  description: string;
  slots: ThemeSlot[];
};

const TIMES = ["08:30", "11:30", "14:30", "18:00", "20:30"];

const THEMES: Record<number, DayTheme> = {
  1: {
    name: "Poniedziałek",
    theme: "Tanie strzały",
    description: "Mocne ceny na start tygodnia, ale bez pięciu podobnych kierunków.",
    slots: [
      { kind: "cheap", label: "💸 Cena dnia", tone: "daily" },
      { kind: "city", label: "🏙️ City break", tone: "short" },
      { kind: "sun", label: "☀️ Do słońca", tone: "sales" },
      { kind: "allinclusive", label: "🍹 All Inclusive", tone: "daily" },
      { kind: "best", label: "⭐ Mocna okazja", tone: "short" },
    ],
  },
  2: {
    name: "Wtorek",
    theme: "Słońce i plaża",
    description: "Więcej ciepłych kierunków, z domieszką city breaku i dobrej ceny.",
    slots: [
      { kind: "sun", label: "☀️ Ciepło", tone: "daily" },
      { kind: "beach", label: "🏖️ Plaża", tone: "sales" },
      { kind: "allinclusive", label: "🍹 All Inclusive", tone: "short" },
      { kind: "city", label: "🏙️ City break", tone: "sales" },
      { kind: "cheap", label: "💸 Tania okazja", tone: "daily" },
    ],
  },
  3: {
    name: "Środa",
    theme: "City break",
    description: "Krótkie wyjazdy w roli głównej, ale nie cały dzień w jednym stylu.",
    slots: [
      { kind: "city", label: "🏙️ City break #1", tone: "daily" },
      { kind: "city", label: "🏙️ City break #2", tone: "short" },
      { kind: "cheap", label: "💸 Tani wypad", tone: "sales" },
      { kind: "sun", label: "☀️ Ciepła odmiana", tone: "short" },
      { kind: "best", label: "⭐ Oferta dnia", tone: "daily" },
    ],
  },
  4: {
    name: "Czwartek",
    theme: "All Inclusive",
    description: "Dzień pakietów i wygody, przełamany city breakiem i egzotyką.",
    slots: [
      { kind: "allinclusive", label: "🍹 All Inclusive #1", tone: "daily" },
      { kind: "allinclusive", label: "🍹 All Inclusive #2", tone: "sales" },
      { kind: "beach", label: "🏖️ Plaża", tone: "short" },
      { kind: "city", label: "🏙️ City break", tone: "sales" },
      { kind: "exotic", label: "🌴 Dalej od domu", tone: "daily" },
    ],
  },
  5: {
    name: "Piątek",
    theme: "Weekendowe wypady",
    description: "Krótsze wyjazdy i kierunki, które dobrze sprzedają marzenie o szybkim wyjeździe.",
    slots: [
      { kind: "weekend", label: "🧳 Weekend #1", tone: "daily" },
      { kind: "city", label: "🏙️ Miasto", tone: "sales" },
      { kind: "weekend", label: "🧳 Weekend #2", tone: "short" },
      { kind: "sun", label: "☀️ Słońce", tone: "sales" },
      { kind: "allinclusive", label: "🍹 Tydzień odpoczynku", tone: "daily" },
    ],
  },
  6: {
    name: "Sobota",
    theme: "Egzotyka i inspiracje",
    description: "Kierunki, które zatrzymują scrollowanie, plus jedna mocna cenowo alternatywa.",
    slots: [
      { kind: "exotic", label: "🌴 Egzotyka #1", tone: "sales" },
      { kind: "exotic", label: "🌴 Egzotyka #2", tone: "daily" },
      { kind: "allinclusive", label: "🍹 All Inclusive", tone: "short" },
      { kind: "sun", label: "☀️ Ciepło", tone: "sales" },
      { kind: "cheap", label: "💸 Dobra cena", tone: "daily" },
    ],
  },
  0: {
    name: "Niedziela",
    theme: "TOP 5 Tripowni",
    description: "Pięć najmocniejszych różnych ofert na domknięcie tygodnia.",
    slots: [
      { kind: "best", label: "🥇 TOP #1", tone: "daily" },
      { kind: "best", label: "🥈 TOP #2", tone: "sales" },
      { kind: "best", label: "🥉 TOP #3", tone: "short" },
      { kind: "best", label: "⭐ TOP #4", tone: "sales" },
      { kind: "best", label: "⭐ TOP #5", tone: "daily" },
    ],
  },
};

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

function isConcrete(offer: Offer) {
  return !/wybrane|jesien|wiosn|lato|zima|najblizszy|dowoln|2026\s*$/.test(normalize(offer.dates || ""));
}

function isExotic(offer: Offer) {
  const text = normalize(`${offer.country} ${offer.city}`);
  return /zanzibar|kenia|mauritius|malediw|tajland|bali|indonez|sri lanka|dominikan|meksyk|kuba|jamaj|wietnam|dubaj|emirat|gambia|seszel|zielonego przyladka/.test(text);
}

function matches(kind: SocialSlotKind, offer: Offer) {
  const categories = new Set(offer.category.map(normalize));
  const board = normalize(offer.board || "");
  if (kind === "best") return true;
  if (kind === "cheap") return offer.price <= 1900 || categories.has("tanio");
  if (kind === "city") return categories.has("city") || (offer.nights >= 2 && offer.nights <= 5);
  if (kind === "sun") return categories.has("cieplo") || categories.has("plaza") || isExotic(offer);
  if (kind === "beach") return categories.has("plaza") || categories.has("wakacje") || /resort/.test(normalize(offer.hotel));
  if (kind === "allinclusive") return categories.has("allinclusive") || /all inclusive|allinclusive/.test(board);
  if (kind === "weekend") return categories.has("weekend") || (offer.nights >= 2 && offer.nights <= 4);
  if (kind === "exotic") return isExotic(offer);
  return true;
}

function qualityScore(offer: Offer, now = new Date()) {
  let value = offer.score * 100;
  const match = getLinkMatch(offer);
  if (match === "exact") value += 300;
  else if (match === "parameters") value += 180;
  else if (match === "destination") value += 60;

  if (isConcrete(offer)) value += 140;
  if (offer.tag === "BIERZEMY") value += 90;
  else if (offer.tag === "OKAZJA") value += 60;

  if (offer.price <= 1400) value += 100;
  else if (offer.price <= 2000) value += 70;
  else if (offer.price <= 2800) value += 35;

  if (/all inclusive/i.test(offer.board || "")) value += 30;

  if (offer.priceCheckedAt) {
    const checked = new Date(offer.priceCheckedAt).getTime();
    if (Number.isFinite(checked)) {
      const ageHours = Math.max(0, (now.getTime() - checked) / 3600000);
      if (ageHours <= 48) value += 160;
      else if (ageHours <= 168) value += 90;
    }
  }
  return value;
}

function rankedPool(source: Offer[], now: Date) {
  const active = source.filter((offer) => offer.availabilityStatus !== "expired" && getLinkMatch(offer) !== "unsafe");
  const daily = getDailyOffers(active, Math.min(24, active.length), now);
  const combined = [...daily, ...active].filter((offer, index, all) => all.findIndex((item) => item.id === offer.id) === index);
  return combined.sort((a, b) => qualityScore(b, now) - qualityScore(a, now));
}

export function getSocialDailyPlan(source: Offer[], now = new Date()): SocialDailyPlan {
  const weekday = weekdayInWarsaw(now);
  const theme = THEMES[weekday];
  const pool = rankedPool(source, now);
  const picked: Offer[] = [];

  const choose = (kind: SocialSlotKind) => {
    const unused = pool.filter((offer) => !picked.some((item) => item.id === offer.id));
    const freshCountry = unused.filter((offer) => !picked.some((item) => normalize(item.country) === normalize(offer.country)));
    return freshCountry.find((offer) => matches(kind, offer))
      || unused.find((offer) => matches(kind, offer))
      || freshCountry[0]
      || unused[0];
  };

  const items: SocialPlanItem[] = [];
  theme.slots.forEach((slot, index) => {
    const offer = choose(slot.kind);
    if (!offer) return;
    picked.push(offer);
    items.push({
      offer,
      time: TIMES[index],
      label: slot.label,
      kind: slot.kind,
      tone: slot.tone,
    });
  });

  return {
    dayName: theme.name,
    theme: theme.theme,
    description: theme.description,
    dateKey: dateKeyInWarsaw(now),
    items: items.slice(0, 5),
  };
}
