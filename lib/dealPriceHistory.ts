import { touristDestinationKey } from "@/lib/destinationGrouping";

type PriceHistoryOffer = {
  id: number;
  city: string;
  country: string;
  price: number;
  nights?: number;
  board?: string;
};

type PriceObservation = {
  day: string;
  price: number;
};

type PriceHistoryStore = Record<string, PriceObservation[]>;

export type HistoricalPriceHighlight = {
  label: string;
  detail: string;
  observedDays: number;
  spanDays: number;
};

const STORAGE_KEY = "tripownia:deal-price-history-v1";
const HISTORY_WINDOW_DAYS = 30;
const MIN_SPAN_DAYS = 7;
const MIN_OBSERVED_DAYS = 5;

function warsawDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayToUtcMs(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
}

function daysBetween(older: string, newer: string) {
  return Math.max(0, Math.round((dayToUtcMs(newer) - dayToUtcMs(older)) / 86_400_000));
}

function durationBucket(nights = 0) {
  if (nights <= 0) return "unknown";
  if (nights <= 5) return "short";
  if (nights <= 9) return "week";
  return "long";
}

function boardBucket(board = "") {
  const normalized = board
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (/all inclusive|ultra all/.test(normalized)) return "all-inclusive";
  if (/half board|hb|2 posil/.test(normalized)) return "half-board";
  if (/breakfast|sniadan|bb/.test(normalized)) return "breakfast";
  if (/room only|bez wyzyw|self catering/.test(normalized)) return "room-only";
  return normalized || "other";
}

function historyKey(offer: PriceHistoryOffer) {
  return [touristDestinationKey(offer), durationBucket(offer.nights), boardBucket(offer.board)].join("::");
}

function readStore(): PriceHistoryStore {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed as PriceHistoryStore : {};
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return {};
  }
}

function prune(observations: PriceObservation[], today: string) {
  return observations
    .filter((item) => item && /^20\d{2}-\d{2}-\d{2}$/.test(item.day) && Number(item.price) > 0)
    .filter((item) => daysBetween(item.day, today) < HISTORY_WINDOW_DAYS)
    .sort((a, b) => a.day.localeCompare(b.day));
}

export function recordDealPriceHistory(offers: PriceHistoryOffer[]) {
  if (typeof window === "undefined" || !offers.length) return false;

  const today = warsawDay();
  const store = readStore();
  let changed = false;

  for (const offer of offers) {
    const price = Number(offer.price);
    if (!Number.isFinite(price) || price <= 0) continue;

    const key = historyKey(offer);
    const observations = prune(Array.isArray(store[key]) ? store[key] : [], today);
    const todayIndex = observations.findIndex((item) => item.day === today);

    if (todayIndex >= 0) {
      if (price < observations[todayIndex].price) {
        observations[todayIndex] = { day: today, price };
        changed = true;
      }
    } else {
      observations.push({ day: today, price });
      changed = true;
    }

    store[key] = prune(observations, today);
  }

  for (const [key, observations] of Object.entries(store)) {
    const next = prune(Array.isArray(observations) ? observations : [], today);
    if (next.length) store[key] = next;
    else delete store[key];
  }

  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return changed;
}

export function getHistoricalPriceHighlight(offer: PriceHistoryOffer): HistoricalPriceHighlight | null {
  if (typeof window === "undefined") return null;

  const today = warsawDay();
  const observations = prune(readStore()[historyKey(offer)] || [], today);
  if (observations.length < MIN_OBSERVED_DAYS) return null;

  const oldest = observations[0]?.day;
  if (!oldest) return null;
  const spanDays = Math.min(HISTORY_WINDOW_DAYS, daysBetween(oldest, today) + 1);
  if (spanDays < MIN_SPAN_DAYS) return null;

  const currentPrice = Number(offer.price);
  const historicalLow = Math.min(...observations.map((item) => Number(item.price)));
  if (!Number.isFinite(currentPrice) || !Number.isFinite(historicalLow) || currentPrice > historicalLow) return null;

  const previous = observations.filter((item) => item.day !== today);
  const previousLow = previous.length ? Math.min(...previous.map((item) => Number(item.price))) : null;
  const drop = previousLow && currentPrice < previousLow
    ? Math.round((1 - currentPrice / previousLow) * 100)
    : 0;

  const period = spanDays >= 30 ? "30 DNI" : `${spanDays} DNI`;
  const detail = drop >= 2
    ? `${drop}% poniżej poprzedniego minimum · ${observations.length} dni obserwacji`
    : `najniższa z ${observations.length} potwierdzonych dni obserwacji`;

  return {
    label: `NAJNIŻSZA OD ${period}`,
    detail,
    observedDays: observations.length,
    spanDays,
  };
}
