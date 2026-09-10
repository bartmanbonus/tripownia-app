import type { Offer } from "@/lib/offers";

const DAY_MS = 86400000;
const COOLDOWN_DAYS = 7;

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function warsawDaySerial(date: Date) {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const [year, month, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

export function destinationRotationKey(offer: Offer) {
  return normalize(`${offer.city}-${offer.country}`);
}

export function countryRotationKey(offer: Offer) {
  return normalize(offer.country || offer.city);
}

/**
 * Each concrete destination gets a stable day-of-cycle. This means that even
 * when the same cheap offer appears in the feed every morning, it can only be
 * selected once in a 7-day cycle unless the planner has too few alternatives.
 */
export function isDestinationInRotationWindow(offer: Offer, date = new Date()) {
  const key = destinationRotationKey(offer);
  if (!key) return true;
  return hash(key) % COOLDOWN_DAYS === warsawDaySerial(date) % COOLDOWN_DAYS;
}

export function rotationPriority(offer: Offer, date = new Date()) {
  const key = destinationRotationKey(offer);
  if (!key) return 0;
  const current = warsawDaySerial(date) % COOLDOWN_DAYS;
  const slot = hash(key) % COOLDOWN_DAYS;
  const distance = (current - slot + COOLDOWN_DAYS) % COOLDOWN_DAYS;
  return distance === 0 ? 100 : Math.max(0, 70 - distance * 10);
}

export const DESTINATION_COOLDOWN_DAYS = COOLDOWN_DAYS;
