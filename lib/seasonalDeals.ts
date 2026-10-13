import type { Offer } from "@/lib/offers";
import { getLinkMatch } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

// Konserwatywne, zaokrąglone średnie miesięcznych maksimów i temperatury morza.
// To sezonowość klimatyczna, NIE prognoza na datę wyjazdu.
// Źródła odniesienia: timeanddate climate normals, climate-data.org,
// regionalne średnie SST. W przyszłości można nadpisać krótkoterminową prognozą.
type Climate = {
  area: string;
  high: readonly number[];
  sea?: readonly number[];
  rainy?: readonly number[];
  beachMonths?: readonly number[];
  lateCutoff?: { month: number; day: number };
};
export type CuratedOffer = Offer & { startDateISO?: string };
export type SeasonalReview = {
  eligible: boolean;
  warm: boolean;
  avgHigh: number | null;
  avgSea: number | null;
  climateLabel: string;
  valueRatio: number;
  reason: string;
};

const redSea: Climate = {
  area: "wybrzeże Morza Czerwonego",
  high: [22, 24, 26, 30, 33, 35, 36, 36, 34, 31, 27, 24],
  sea: [23, 23, 23, 24, 26, 27, 29, 30, 29, 28, 26, 25],
};
const djerba: Climate = {
  area: "Djerba",
  high: [17, 18, 20, 22, 25, 29, 32, 33, 31, 27, 22, 18],
  sea: [16, 15, 16, 17, 19, 22, 26, 28, 27, 24, 21, 18],
  beachMonths: [6, 7, 8, 9, 10],
  lateCutoff: { month: 10, day: 15 },
};
const northTunisia: Climate = {
  area: "północne wybrzeże Tunezji",
  high: [16, 17, 19, 21, 24, 28, 31, 32, 29, 25, 21, 17],
  sea: [16, 15, 16, 17, 19, 22, 25, 27, 25, 23, 20, 18],
  beachMonths: [6, 7, 8, 9],
};
const greekIslands: Climate = {
  area: "greckie wyspy",
  high: [15, 16, 18, 21, 24, 28, 31, 31, 28, 24, 20, 17],
  sea: [17, 17, 17, 18, 20, 23, 25, 27, 26, 23, 21, 19],
  beachMonths: [6, 7, 8, 9],
};
const rhodes: Climate = {
  area: "Rodos",
  high: [16, 16, 18, 21, 24, 28, 30, 31, 29, 25, 21, 17],
  sea: [18, 17, 17, 18, 20, 23, 26, 27, 26, 24, 22, 19],
  beachMonths: [6, 7, 8, 9, 10],
  lateCutoff: { month: 10, day: 15 },
};
const cyprus: Climate = {
  area: "wybrzeże Cypru",
  high: [17, 17, 19, 22, 26, 30, 32, 33, 31, 28, 23, 19],
  sea: [18, 17, 18, 19, 21, 24, 27, 28, 27, 25, 22, 20],
  beachMonths: [5, 6, 7, 8, 9, 10],
};
const turkeyCoast: Climate = {
  area: "Riwiera Turecka",
  high: [16, 16, 19, 22, 26, 31, 34, 34, 31, 27, 21, 17],
  sea: [18, 17, 17, 18, 21, 25, 28, 29, 28, 25, 22, 19],
  beachMonths: [6, 7, 8, 9, 10],
  lateCutoff: { month: 10, day: 21 },
};
const canaries: Climate = {
  area: "południowe Wyspy Kanaryjskie",
  high: [22, 22, 23, 23, 24, 26, 28, 29, 28, 27, 25, 23],
  sea: [20, 19, 19, 19, 20, 21, 22, 23, 23, 23, 22, 21],
};
const madeira: Climate = {
  area: "Madera",
  high: [19, 19, 19, 20, 21, 23, 25, 26, 26, 24, 22, 20],
  sea: [18, 18, 18, 18, 19, 20, 22, 23, 23, 22, 21, 19],
};
const capeVerde: Climate = {
  area: "Sal, Cabo Verde",
  high: [24, 24, 25, 25, 26, 27, 28, 29, 30, 29, 28, 25],
  sea: [23, 22, 22, 22, 23, 24, 25, 27, 27, 27, 26, 24],
  rainy: [8, 9],
};
const dubai: Climate = {
  area: "ZEA",
  high: [24, 25, 28, 33, 38, 40, 41, 41, 39, 35, 30, 26],
  sea: [22, 21, 23, 26, 29, 31, 33, 33, 32, 30, 27, 24],
};
const phuket: Climate = {
  area: "wybrzeże Morza Andamańskiego",
  high: [32, 33, 33, 33, 32, 31, 31, 31, 30, 31, 31, 31],
  sea: [28, 28, 29, 30, 30, 29, 29, 29, 29, 29, 29, 28],
  rainy: [5, 6, 7, 8, 9, 10],
};
const bali: Climate = {
  area: "Bali",
  high: [30, 30, 31, 31, 30, 29, 29, 29, 30, 31, 31, 30],
  sea: [29, 29, 29, 29, 28, 27, 27, 27, 27, 28, 29, 29],
  rainy: [12, 1, 2, 3],
};
const zanzibar: Climate = {
  area: "Zanzibar",
  high: [32, 32, 32, 31, 30, 29, 29, 29, 30, 31, 32, 32],
  sea: [29, 29, 29, 29, 28, 27, 26, 26, 27, 27, 28, 29],
  rainy: [3, 4, 5, 11],
};
const caribbean: Climate = {
  area: "Karaiby",
  high: [28, 28, 29, 29, 30, 31, 31, 31, 31, 30, 29, 28],
  sea: [26, 26, 26, 27, 28, 28, 29, 29, 29, 29, 28, 27],
  rainy: [9, 10],
};

function key(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function climateFor(offer: CuratedOffer): Climate | null {
  const city = key(offer.city);
  const country = key(offer.country);
  if (/marsa alam|hurghad|sharm|safaga|el gouna/.test(city)) return redSea;
  if (/djerba|dz(er|er)ba/.test(city)) return djerba;
  if (/tunezja/.test(country)) return northTunisia;
  if (/rodos|rhodes/.test(city)) return rhodes;
  if (/kreta|kos|zakynth|kefalon|korfu|corfu|santorin|mykonos/.test(city)) return greekIslands;
  if (/grecja/.test(country)) return greekIslands;
  if (/cypr/.test(country)) return cyprus;
  if (/antalya|alanya|side|belek|kemer|bodrum|marmaris/.test(city)) return turkeyCoast;
  if (/teneryf|tenerif|fuerteventur|gran canaria|lanzarote/.test(city)) return canaries;
  if (/madera|madeira|funchal/.test(city)) return madeira;
  if (/wyspa sal|cabo verde|zielonego przyladka/.test(city + " " + country)) return capeVerde;
  if (/dubaj|dubai|abu dhabi/.test(city)) return dubai;
  if (/phuket|krabi|khao lak/.test(city)) return phuket;
  if (/bali|denpasar|ubud/.test(city)) return bali;
  if (/zanzibar/.test(city)) return zanzibar;
  if (/dominikana|jamajka|kuba/.test(country)) return caribbean;
  return null;
}

const DAY_MS = 86_400_000;
function readISO(value: string) {
  const token = value.trim();
  const pl = /^(\d{1,2})\.(\d{1,2})\.(20\d{2})$/.exec(token);
  const iso = pl ? pl[3] + "-" + pl[2].padStart(2, "0") + "-" + pl[1].padStart(2, "0") : token;
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(iso)) return null;
  const timestamp = Date.parse(iso + "T00:00:00Z");
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === iso ? timestamp : null;
}

export function datedTrip(offer: CuratedOffer, now = Date.now()) {
  const tokens = (offer.dates || "").match(/20\d{2}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.20\d{2}/g) || [];
  const start = readISO(offer.startDateISO || tokens[0] || "");
  const end = tokens.length >= 2 ? readISO(tokens[1]) : null;
  if (start === null || end === null || !Number.isInteger(offer.nights) || offer.nights < 1) return null;
  if (Math.round((end - start) / DAY_MS) !== offer.nights) return null;
  const today = new Date(now).toISOString().slice(0, 10);
  if (new Date(start).toISOString().slice(0, 10) < today || start > now + 420 * DAY_MS) return null;
  return { start: new Date(start), lastNight: new Date(end - DAY_MS) };
}

function isBeachTrip(offer: CuratedOffer) {
  const board = key(offer.board);
  const categories = new Set(offer.category || []);
  const allInclusive = /all\s*inclusive|ultra all/.test(board);
  const beach = allInclusive || (categories.has("plaza") && !categories.has("city"))
    || (categories.has("wakacje") && offer.nights >= 6 && !categories.has("city"));
  return { allInclusive, beach };
}

function priceCeiling(offer: CuratedOffer, kind: { allInclusive: boolean; beach: boolean }) {
  const city = key(offer.city);
  const country = key(offer.country);
  const longHaul = /malediw|tajland|tanzania|zanzibar|kenia|mauritius|seszel|indonez|bali|dominik|meksyk|jamaj|sri lanka/.test(city + " " + country);
  const flight = (offer.category || []).includes("flight");
  if (flight) return longHaul ? 2400 : 440;
  if (kind.allInclusive) {
    const base = /egipt|marsa|hurghad/.test(city + " " + country) ? 3100
      : /tunezj|djerba|grecj|kreta|rodos|kos/.test(city + " " + country) ? 2700
      : /turcj/.test(country) ? 3000 : longHaul ? 5500 : 3200;
    return Math.round(base * Math.pow(offer.nights / 7, 0.72));
  }
  if (kind.beach) return Math.round((longHaul ? 4400 : 2450) * Math.pow(offer.nights / 7, 0.72));
  if (longHaul) return Math.round(4400 * Math.pow(Math.max(3, offer.nights) / 7, 0.7));
  return offer.nights <= 3 ? 1050 : offer.nights <= 5 ? 1500 : 2150;
}

export function reviewSeasonalDeal(offer: CuratedOffer, now = Date.now()): SeasonalReview {
  const fail = (reason: string): SeasonalReview => ({ eligible: false, warm: false, avgHigh: null, avgSea: null, climateLabel: "", valueRatio: Infinity, reason });
  if (!isTravelDestinationAllowed(offer.city, offer.country)) return fail("Kierunek niedopuszczony");
  const trip = datedTrip(offer, now);
  if (!trip) return fail("Brak pełnego, przyszłego terminu");
  const checked = Date.parse(offer.priceCheckedAt || "");
  if (!Number.isFinite(checked) || checked > now + 60_000 || now - checked > 6 * 60 * 60 * 1000) return fail("Cena niepotwierdzona w ostatnich 6 h");
  if (offer.availabilityStatus !== "available" || getLinkMatch(offer) !== "exact" || offer.linkType !== "exact") return fail("Brak dokładnego, dostępnego wariantu");
  if (!Number.isFinite(offer.price) || offer.price <= 0 || !offer.affiliateUrl) return fail("Brak ceny lub linku");
  if (!offer.hotel || /^(hotel|resort)\s*[2345]\s*★?$|^hotel w centrum$/i.test(offer.hotel)) return fail("Brak konkretnego hotelu");
  if (!offer.departure || !offer.board || !offer.country) return fail("Niekompletne dane");

  const profile = climateFor(offer);
  const kinds = isBeachTrip(offer);
  const months = Array.from(new Set([trip.start.getUTCMonth() + 1, trip.lastNight.getUTCMonth() + 1]));
  const high = profile ? Math.min(...months.map((month) => profile.high[month - 1])) : null;
  const sea = profile?.sea ? Math.min(...months.map((month) => profile.sea![month - 1])) : null;
  const rainy = Boolean(profile?.rainy?.some((month) => months.includes(month)));
  const late = Boolean(profile?.lateCutoff && months.includes(profile.lateCutoff.month)
    && (trip.start.getUTCMonth() + 1 === profile.lateCutoff.month && trip.start.getUTCDate() > profile.lateCutoff.day));
  const withinBeachSeason = Boolean(profile && (!profile.beachMonths || months.every((month) => profile.beachMonths!.includes(month))));
  const comfortableHeat = high !== null && high <= 36;
  const warm = Boolean(high !== null && high >= 25 && high <= 35 && !rainy);
  if (kinds.beach && (!profile || !withinBeachSeason || rainy || late || high === null || high < 24 || !comfortableHeat || (sea !== null && sea < 22))) {
    return fail("Pogoda poza dobrym sezonem kąpielowym");
  }
  if (!kinds.beach && profile && (rainy || (high !== null && high > 38))) return fail("Pora deszczowa lub uciążliwe upały");
  const cap = priceCeiling(offer, kinds);
  if (offer.price > cap) return fail("Cena powyżej limitu selekcji");
  const climateLabel = profile && high !== null
    ? "Klimat: " + profile.area + " · średnia maks. ok. " + high + "°C"
      + (sea !== null ? " · morze ok. " + sea + "°C" : "")
      + " (średnie sezonowe, nie prognoza)"
    : "Klimat: brak pewnej średniej regionalnej — kierunek na zwiedzanie, nie na plażowanie";
  return {
    eligible: true,
    warm,
    avgHigh: high,
    avgSea: sea,
    climateLabel,
    valueRatio: offer.price / cap,
    reason: "Cena w konserwatywnym limicie Tripowni; termin i sezon sprawdzone.",
  };
}

export function selectCuratedSeasonalDeals(rows: CuratedOffer[], now = Date.now(), limit = 36) {
  const candidates = rows.map((offer) => ({ offer, assessment: reviewSeasonalDeal(offer, now) }))
    .filter((item) => item.assessment.eligible)
    .sort((a, b) => a.assessment.valueRatio - b.assessment.valueRatio || a.offer.price - b.offer.price);
  const seen = new Set<string>();
  const result: CuratedOffer[] = [];
  for (const { offer, assessment } of candidates) {
    const month = datedTrip(offer, now)!.start.toISOString().slice(0, 7);
    const destination = key(offer.city + "|" + offer.country).trim();
    const unique = destination + "|" + month + "|" + (offer.category.includes("flight") ? "flight" : "package");
    if (seen.has(unique)) continue;
    seen.add(unique);
    const category = (offer.category || []).filter((item) => item !== "cieplo" && item !== "plaza");
    if (assessment.warm) category.push("cieplo");
    if (isBeachTrip(offer).beach) category.push("plaza");
    result.push({
      ...offer,
      weather: assessment.climateLabel,
      category,
      reason: "Dobry termin na " + (isBeachTrip(offer).beach ? "wypoczynek" : "zwiedzanie")
        + ". Cena spełnia próg jakości Tripowni dla tego rodzaju wyjazdu.",
    });
    if (result.length >= limit) break;
  }
  return result;
}
