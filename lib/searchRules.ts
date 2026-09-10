export type CatalogOffer = {
  id: number | string; price: number; provider?: string; partner?: string;
  sourceKey?: string; priceCheckedAt?: string; availabilityStatus?: string;
  departure?: string; airportCode?: string; nights?: number; board?: string;
  city?: string; country?: string; hotel?: string; destination?: string; title?: string;
  startDateISO?: string; endDateISO?: string;
};
export type CatalogFilters = {
  q?: string; destinations?: string[]; from?: string; nights?: string; board?: string;
  weekend?: boolean; maxPrice?: number; dateFrom?: string; dateTo?: string;
  tripType?: "any" | "citybreak"; provider?: string;
};
export function normalizeSearch(value: unknown = ""): string {
  return String(value ?? "").toLowerCase().replace(/ł/g, "l").normalize("NFD")
    .replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
export function offerKey(o: CatalogOffer): string {
  return `${o.provider || o.partner || "unknown"}:${o.sourceKey || o.id}`;
}
export function dedupeOffers<T extends CatalogOffer>(rows: T[] = []): T[] {
  const unique = new Map<string, T>();
  for (const o of rows) {
    const previous = unique.get(offerKey(o));
    // Newer observations supersede older prices, even when the new price is higher.
    if (!previous || (Date.parse(o.priceCheckedAt || "") || 0) >= (Date.parse(previous.priceCheckedAt || "") || 0)) unique.set(offerKey(o), o);
  }
  return [...unique.values()];
}
export function warsawDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function validISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function activeOffer(o: CatalogOffer, now = new Date()): boolean {
  return o.availabilityStatus !== "expired" && Number.isFinite(o.price) && o.price > 0
    && (!o.startDateISO || (validISODate(o.startDateISO) && o.startDateISO >= warsawDate(now)));
}
function departureMatches(o: CatalogOffer, raw = ""): boolean {
  if (!raw) return true;
  const code = String(o.airportCode || "").toUpperCase().replace(/^AP-/, "");
  const label = normalizeSearch(o.departure);
  const names: Record<string, RegExp> = { KRK: /krakow|balice/, KTW: /katowice|pyrzowice/, GDN: /gdansk|rebiechowo/, WRO: /wroclaw|strachowice/, POZ: /poznan|lawica/, RZE: /rzeszow/, LCJ: /lodz/, LUZ: /lublin/, SZZ: /szczecin/, BZG: /bydgoszcz/, IEG: /zielona gora/ };
  return raw.split(",").some(value => {
    const selected = value.trim().toUpperCase();
    if (selected === "WAWA") return ["WAW", "WMI"].includes(code) || /warszawa|chopin|modlin/.test(label);
    if (/^[A-Z]{3}$/.test(code)) return code === selected;
    if (selected === "WMI") return /modlin/.test(label);
    if (selected === "WAW") return !/modlin/.test(label) && /warszawa|chopin/.test(label);
    return names[selected]?.test(label) || false;
  });
}
function nightsMatches(o: CatalogOffer, range = "any"): boolean {
  if (range === "any") return true;
  const n = Number(o.nights);
  if (!Number.isFinite(n)) return false;
  if (range === "15+") return n >= 15;
  const [min, max] = range.split("-").map(Number);
  return n >= min && n <= max;
}
function boardMatches(o: CatalogOffer, filter = "any"): boolean {
  if (filter === "any") return true;
  const text = normalizeSearch(o.board);
  const rules: Record<string, RegExp> = {
    allinclusive: /all inclusive|allinclusive|\bai\b/, ultraallinclusive: /ultra all|ultraall/,
    breakfast: /sniad|breakfast|\bbb\b/, halfboard: /half board|\bhb\b|2 posil/,
    fullboard: /full board|\bfb\b|3 posil|pelne wyzywienie/,
    roomonly: /bez wyzywienia|room only|self catering|no meals|\bro\b/,
  };
  return Boolean(rules[filter]?.test(text)) && (filter !== "allinclusive" || !/ultra/.test(text));
}
function containsAll(text: string, query: string): boolean {
  return normalizeSearch(query).split(" ").filter(Boolean).every(token => text.includes(token));
}
/** Full catalog filtering. There is intentionally no Radar argument or fallback. */
export function filterCatalog<T extends CatalogOffer>(rows: T[] = [], f: CatalogFilters = {}, now = new Date()): T[] {
  return dedupeOffers(rows).filter(o => {
    if (!activeOffer(o, now)) return false;
    if (f.provider && (o.provider || o.partner) !== f.provider) return false;
    const place = normalizeSearch([o.city, o.country, o.destination].filter(Boolean).join(" "));
    const text = `${place} ${normalizeSearch([o.hotel, o.title].filter(Boolean).join(" "))}`;
    // A label like Rzym, Włochy is one destination, not city OR country.
    if (f.destinations?.length && !f.destinations.some(q => containsAll(place, q))) return false;
    if (f.q && !containsAll(text, f.q)) return false;
    if (!departureMatches(o, f.from) || !nightsMatches(o, f.nights) || !boardMatches(o, f.board)) return false;
    if (f.maxPrice !== undefined && o.price > f.maxPrice) return false;
    if (f.tripType === "citybreak" && !(Number(o.nights) >= 2 && Number(o.nights) <= 5)) return false;
    if (f.dateFrom || f.dateTo || f.weekend) {
      if (!o.startDateISO || !validISODate(o.startDateISO)) return false;
      if (f.dateFrom && o.startDateISO < f.dateFrom) return false;
      if (f.dateTo && o.startDateISO > f.dateTo) return false;
    }
    if (f.weekend) {
      const start = new Date(`${o.startDateISO}T12:00:00Z`);
      const untilSaturday = (6 - start.getUTCDay() + 7) % 7;
      if (!(Number(o.nights) > untilSaturday + 1)) return false;
    }
    return true;
  }).sort((a, b) => a.price - b.price || offerKey(a).localeCompare(offerKey(b)));
}
export function paginate<T>(rows: T[], page = 1, pageSize = 200) {
  const size = Number.isFinite(pageSize) ? Math.min(200, Math.max(1, Math.floor(pageSize))) : 200;
  const current = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  return { page: current, pageSize: size, totalMatches: rows.length, offers: rows.slice((current - 1) * size, current * size) };
}
export function parseCatalogQuery(p: URLSearchParams): { filters: CatalogFilters; page: number; pageSize: number } {
  const choice = (key: string, allowed: string[], fallback: string) => {
    const value = p.get(key) || fallback;
    if (!allowed.includes(value)) throw new Error(`Nieprawidłowy filtr: ${key}`);
    return value;
  };
  const integer = (key: string, fallback: number, max: number) => {
    const value = p.has(key) ? Number(p.get(key)) : fallback;
    if (!Number.isSafeInteger(value) || value < 1 || value > max) throw new Error(`Nieprawidłowy parametr: ${key}`);
    return value;
  };
  const dateFrom = p.get("dateFrom") || "", dateTo = p.get("dateTo") || "";
  if ((dateFrom && !validISODate(dateFrom)) || (dateTo && !validISODate(dateTo)) || (dateFrom && dateTo && dateTo < dateFrom)) throw new Error("Nieprawidłowy zakres dat wylotu.");
  const maxPrice = p.has("maxPrice") ? Number(p.get("maxPrice")) : undefined;
  if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) throw new Error("Nieprawidłowy budżet.");
  const destinations = p.getAll("destination"), q = p.get("q") || "", from = p.get("from") || "";
  if (q.length > 200 || destinations.length > 20 || destinations.some(v => !v.trim() || v.length > 150)) throw new Error("Zbyt długie zapytanie.");
  if (from && from.split(",").some(v => !["WAWA", "WAW", "WMI", "KRK", "KTW", "GDN", "WRO", "POZ", "RZE", "LCJ", "LUZ", "SZZ", "BZG", "IEG"].includes(v))) throw new Error("Nieobsługiwane lotnisko.");
  return { filters: { q, destinations, from, dateFrom, dateTo, maxPrice,
    nights: choice("nights", ["any", "1-2", "3-4", "5-7", "8-10", "11-14", "15+"], "any"),
    board: choice("board", ["any", "allinclusive", "ultraallinclusive", "breakfast", "halfboard", "fullboard", "roomonly"], "any"),
    weekend: choice("weekend", ["0", "1"], "0") === "1",
    tripType: choice("tripType", ["any", "citybreak"], "any") as "any" | "citybreak",
    provider: choice("provider", ["", "exim", "tui", "wakacje"], ""),
  }, page: integer("page", 1, 1000000), pageSize: integer("pageSize", 200, 200) };
}
