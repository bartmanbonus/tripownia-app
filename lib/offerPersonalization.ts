import type { Offer } from "@/lib/offers";
import type { TravelProfile } from "@/lib/travelProfile";

function normalize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DEPARTURE_RULES: Array<{ code: string; match: RegExp }> = [
  { code: "WAWA", match: /warszaw|chopin|modlin|\bwaw\b|\bwmi\b/ },
  { code: "KRK", match: /krakow|balice|\bkrk\b/ },
  { code: "KTW", match: /katowic|pyrzowic|\bktw\b/ },
  { code: "GDN", match: /gdansk|rebiechow|\bgdn\b/ },
  { code: "WRO", match: /wroclaw|strachowic|\bwro\b/ },
  { code: "POZ", match: /poznan|lawica|\bpoz\b/ },
];

const WARM_DESTINATIONS = /egipt|hurghad|marsa alam|sharm|tunez|djerba|hammamet|maroko|marrakesz|wyspy kanaryj|teneryf|fuerteventur|gran canaria|lanzarote|cypr|pafos|malta|madera|dubaj|emirat|zanzibar|kenia|mauritius|malediw|seszel|zielonego przyladka|cape verde|gambia|dominikan|meksyk|kuba|jamaj|tajland|bali|indonez|sri lanka|kostaryk|alicante|malaga|sewilla/;
const BEACH_DESTINATIONS = /hurghad|marsa alam|sharm|djerba|hammamet|antal|bodrum|alanya|teneryf|fuerteventur|gran canaria|lanzarote|cypr|pafos|kreta|rodos|zakynth|majork|malta|madera|zanzibar|mauritius|malediw|seszel|zielonego przyladka|cape verde|dominikan|meksyk|kuba|jamaj|bali|phuket|riwiera|alban|sloneczny brzeg|alicante|malaga/;
const CITY_BREAK_DESTINATIONS = /rzym|rome|barcelon|madryt|madrid|lizbon|lisbon|porto|paryz|paris|prag|budapeszt|wieden|vienna|mediolan|milan|wenecj|venice|neapol|naples|bergamo|londyn|london|dublin|edynburg|amsterdam|berlin|kopenhag|copenhagen|helsinki|aten|athens|stambul|istanbul|walencj|valencia|sewill|sevilla|malta|valletta/;

export function departureCodeForProfile(departure: string) {
  const value = normalize(departure);
  if (!value) return "";
  return DEPARTURE_RULES.find((rule) => rule.match.test(value))?.code || "";
}

export function offerMatchesDeparture(offer: Offer, departure: string) {
  const preferred = normalize(departure);
  if (!preferred) return true;

  const haystack = normalize(`${offer.departure || ""} ${offer.airportCode || ""}`);
  const rule = DEPARTURE_RULES.find((item) => item.match.test(preferred));
  if (rule) return rule.match.test(haystack);

  return Boolean(haystack) && (haystack.includes(preferred) || preferred.includes(haystack));
}

export function inferredOfferCategories(offer: Offer) {
  const categories = new Set((offer.category || []).map((item) => normalize(item)).filter(Boolean));
  const text = normalize(`${offer.city} ${offer.country} ${offer.hotel} ${offer.board} ${offer.weather}`);
  const board = normalize(offer.board);

  if (/all inclusive|allinclusive|ultra all/.test(board)) categories.add("allinclusive");
  if (offer.price <= 1800) categories.add("tanio");
  if (offer.nights > 0 && offer.nights <= 4) categories.add("weekend");
  if (WARM_DESTINATIONS.test(text)) categories.add("cieplo");
  if (BEACH_DESTINATIONS.test(text)) categories.add("plaza");
  if (CITY_BREAK_DESTINATIONS.test(text) && offer.nights <= 5) categories.add("city");

  const weatherMatch = String(offer.weather || "").match(/(-?\d{1,2})/);
  const temperature = weatherMatch ? Number(weatherMatch[1]) : NaN;
  if (Number.isFinite(temperature) && temperature >= 22) categories.add("cieplo");

  return categories;
}

export function offerMatchesStyle(offer: Offer, style: string) {
  return inferredOfferCategories(offer).has(normalize(style));
}

export function isStrictProfileMatch(offer: Offer, profile: TravelProfile) {
  if (offer.availabilityStatus === "expired") return false;
  if (profile.budget > 0 && offer.price > profile.budget) return false;
  if (profile.departure && !offerMatchesDeparture(offer, profile.departure)) return false;

  const categories = inferredOfferCategories(offer);
  if (profile.warmOnly && !categories.has("cieplo")) return false;
  if (profile.styles.length && !profile.styles.some((style) => categories.has(normalize(style)))) return false;

  return true;
}

export function scoreOfferForProfile(offer: Offer, profile: TravelProfile) {
  const categories = inferredOfferCategories(offer);
  let score = Number(offer.score || 0) * 10;

  if (profile.budget > 0) {
    if (offer.price <= profile.budget) {
      score += 30;
      const budgetUse = offer.price / profile.budget;
      if (budgetUse >= 0.55 && budgetUse <= 1) score += 5;
    } else {
      score -= Math.min(90, ((offer.price - profile.budget) / profile.budget) * 100);
    }
  }

  if (profile.departure) score += offerMatchesDeparture(offer, profile.departure) ? 36 : -55;

  if (profile.styles.length) {
    const matchingStyles = profile.styles.filter((style) => categories.has(normalize(style))).length;
    score += matchingStyles ? 16 + matchingStyles * 5 : -35;
  }

  if (profile.warmOnly) score += categories.has("cieplo") ? 24 : -60;

  if (profile.standard === "budget") {
    if (categories.has("tanio")) score += 12;
    if (profile.budget > 0 && offer.price <= profile.budget * 0.75) score += 5;
  } else if (profile.standard === "premium") {
    if (/[45]\s*[★*]|\b[45]\s*gwiaz/i.test(offer.hotel || "")) score += 14;
    if (/ultra all/i.test(offer.board || "")) score += 5;
  } else {
    if (/[34]\s*[★*]|\b[34]\s*gwiaz/i.test(offer.hotel || "")) score += 6;
  }

  if (profile.companion === "family") {
    if (categories.has("allinclusive") || offer.nights >= 5) score += 6;
  } else if (profile.companion === "couple") {
    if (categories.has("city") || categories.has("plaza")) score += 5;
  } else if (profile.companion === "friends") {
    if (categories.has("city") || categories.has("weekend")) score += 5;
  } else if (profile.companion === "solo") {
    if (categories.has("city") || categories.has("weekend")) score += 4;
  }

  return score;
}

export function rankOffersForProfile(rows: Offer[], profile: TravelProfile, strict = true) {
  return rows
    .filter((offer) => !strict || isStrictProfileMatch(offer, profile))
    .map((offer) => ({ offer, score: scoreOfferForProfile(offer, profile) }))
    .sort((a, b) => b.score - a.score || a.offer.price - b.offer.price || b.offer.score - a.offer.score)
    .map((row) => row.offer);
}
