export function normalizeSearch(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function dedupeOffers(rows = []) {
  const best = new Map();
  for (const offer of rows) {
    const key = `${offer.provider || offer.partner || "unknown"}:${offer.sourceKey || offer.id}`;
    const previous = best.get(key);
    if (!previous || Number(offer.price || Infinity) < Number(previous.price || Infinity)) best.set(key, offer);
  }
  return [...best.values()];
}

function departureMatches(offer, raw) {
  if (!raw) return true;
  const haystack = normalizeSearch(`${offer.departure || ""} ${offer.airportCode || ""}`);
  return raw.split(",").map(x => x.trim().toUpperCase()).filter(Boolean).some(code => {
    if (code === "WAWA") return /warszawa|chopin|modlin|\bwaw\b|\bwmi\b/.test(haystack);
    if (code === "WAW") return /warszawa|chopin|\bwaw\b/.test(haystack);
    if (code === "WMI") return /modlin|\bwmi\b/.test(haystack);
    const names = { KRK: /krakow|balice|\bkrk\b/, KTW: /katowice|pyrzowice|\bktw\b/, GDN: /gdansk|rebiechowo|\bgdn\b/, WRO: /wroclaw|strachowice|\bwro\b/, POZ: /poznan|lawica|\bpoz\b/, RZE: /rzeszow|\brze\b/, LCJ: /lodz|\blcj\b/, LUZ: /lublin|\bluz\b/, SZZ: /szczecin|\bszz\b/, BZG: /bydgoszcz|\bbzg\b/, IEG: /zielona gora|\bieg\b/ };
    return names[code]?.test(haystack) || false;
  });
}

function nightsMatches(offer, range) {
  const n = Number(offer.nights || 0);
  if (!range || range === "any") return true;
  if (range === "1-2") return n >= 1 && n <= 2;
  if (range === "3-4") return n >= 3 && n <= 4;
  if (range === "5-7") return n >= 5 && n <= 7;
  if (range === "8-10") return n >= 8 && n <= 10;
  if (range === "11-14") return n >= 11 && n <= 14;
  if (range === "15+") return n >= 15;
  return true;
}

function boardMatches(offer, filter) {
  if (!filter || filter === "any") return true;
  const value = normalizeSearch(offer.board || "");
  if (filter === "allinclusive") return /all inclusive|allinclusive/.test(value) && !/ultra/.test(value);
  if (filter === "ultraallinclusive") return /ultra all|ultraall/.test(value);
  if (filter === "breakfast") return /sniad|breakfast|\bbb\b/.test(value);
  if (filter === "halfboard") return /half board|\bhb\b|2 posil|sniad.*obiad|sniad.*kolac/.test(value);
  if (filter === "fullboard") return /full board|\bfb\b|3 posil|pelne wyzywienie/.test(value);
  if (filter === "roomonly") return /bez wyzywienia|room only|self catering|no meals/.test(value);
  return true;
}

function weekendMatches(offer, enabled) {
  if (!enabled) return true;
  if (!offer.startDateISO || !offer.nights) return false;
  const start = new Date(`${offer.startDateISO}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return false;
  for (let offset = 0; offset < Number(offer.nights); offset += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + offset);
    if (day.getUTCDay() === 6 && offset + 1 <= Number(offer.nights)) return true;
  }
  return false;
}

function destinationMatches(offer, query) {
  if (!query) return true;
  const terms = query.split(",").map(normalizeSearch).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeSearch([offer.city, offer.country, offer.hotel, offer.destination, offer.title].filter(Boolean).join(" "));
  return terms.some(term => haystack.includes(term) || term.includes(normalizeSearch(offer.city || "")) || term.includes(normalizeSearch(offer.country || "")));
}

function dateMatches(offer, from, to) {
  if (!from && !to) return true;
  const start = String(offer.startDateISO || "");
  if (!start) return false;
  if (from && start < from) return false;
  if (to && start > to) return false;
  return true;
}

export function filterCatalog(rows = [], filters = {}) {
  const maxPrice = Number(filters.maxPrice || 0);
  return dedupeOffers(rows)
    .filter(o => !o.availabilityStatus || o.availabilityStatus !== "expired")
    .filter(o => destinationMatches(o, filters.q || ""))
    .filter(o => departureMatches(o, filters.from || ""))
    .filter(o => nightsMatches(o, filters.nights || "any"))
    .filter(o => boardMatches(o, filters.board || "any"))
    .filter(o => weekendMatches(o, filters.weekend === true || filters.weekend === "1"))
    .filter(o => !maxPrice || Number(o.price || Infinity) <= maxPrice)
    .filter(o => dateMatches(o, filters.dateFrom || "", filters.dateTo || ""))
    .sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));
}

export function paginate(rows, page = 1, pageSize = 200) {
  const safeSize = Math.max(1, Math.min(200, Number(pageSize) || 200));
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * safeSize;
  return { page: safePage, pageSize: safeSize, totalMatches: rows.length, offers: rows.slice(start, start + safeSize) };
}
