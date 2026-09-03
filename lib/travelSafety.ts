/**
 * Centralna blokada kierunków, których Tripownia nie promuje ze względów bezpieczeństwa.
 * Ostatni przegląd: 2026-09-03, na podstawie ostrzeżeń MSZ i aktywnych konfliktów.
 *
 * To nie jest kompletna porada bezpieczeństwa dla podróżnych. Celem tej listy jest wyłącznie
 * niedopuszczenie do automatycznej promocji / rekomendacji kierunków objętych wojną lub
 * najwyższym poziomem ostrzeżeń. Lista jest celowo scentralizowana, żeby można ją było
 * aktualizować w jednym miejscu.
 */
export const TRAVEL_SAFETY_REVIEWED_AT = "2026-09-03";

const blockedCountries = [
  "ukraina",
  "rosja",
  "izrael",
  "palestyna",
  "terytoria palestynskie",
  "liban",
  "iran",
  "irak",
  "syria",
  "jemen",
  "sudan",
  "sudan poludniowy",
  "afganistan",
  "somalia",
  "libia",
  "mjanma",
  "myanmar",
];

const blockedPlaces = [
  "kijow", "kyiv", "lwow", "lviv", "odessa", "odesa", "charkow", "kharkiv", "krym", "crimea",
  "moskwa", "moscow", "sankt petersburg", "st petersburg", "petersburg",
  "tel awiw", "tel aviv", "jerozolima", "jerusalem", "gaza",
  "bejrut", "beirut", "teheran", "tehran", "bagdad", "baghdad", "damaszek", "damascus",
  "sana", "sanaa", "sokotra", "socotra", "chartum", "khartoum", "kabul", "mogadiszu", "mogadishu",
  "try polis", "tripoli", "rangun", "yangon", "mandalay",
];

function normalize(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .trim();
}

export function isTravelDestinationBlocked(...values: Array<string | undefined | null>) {
  const text = normalize(values.filter(Boolean).join(" | "));
  if (!text) return false;
  return blockedCountries.some(item => text.includes(item)) || blockedPlaces.some(item => text.includes(item));
}

export function isTravelDestinationAllowed(...values: Array<string | undefined | null>) {
  return !isTravelDestinationBlocked(...values);
}

export function travelSafetyReason(...values: Array<string | undefined | null>) {
  return isTravelDestinationBlocked(...values)
    ? "Tripownia nie promuje obecnie tego kierunku ze względów bezpieczeństwa."
    : null;
}
