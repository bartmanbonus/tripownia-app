/**
 * Kiwi.com's Travelpayouts program tracks destination-specific searches through
 * https://www.kiwi.com/deep?from=IATA&to=IATA&departure=YYYY-MM-DD&return=YYYY-MM-DD.
 * Generic /search/results pages are not supported affiliate deep links.
 * https://support.travelpayouts.com/hc/en-us/articles/360010109719-Kiwi-com-affiliate-links
 *
 * Only known city/airport aliases are converted. Unknown routes fail closed so
 * we never replace a customer's intended destination with a generic search.
 */
const LOCATION_IATA: Record<string, string> = {
  "warsaw": "WAW", "warszawa": "WAW", "warszawa-chopina": "WAW",
  "warsaw-chopin": "WAW", "warsaw-chopin-airport": "WAW",
  "warsaw-modlin": "WMI", "modlin": "WMI", "wawa": "WAW",
  "krakow": "KRK", "cracow": "KRK", "katowice": "KTW",
  "gdansk": "GDN", "wroclaw": "WRO", "poznan": "POZ", "poznan-lawica": "POZ",
  "rzeszow": "RZE", "szczecin": "SZZ", "lublin": "LUZ", "bydgoszcz": "BZG",
  "lodz": "LCJ", "radom": "RDO", "olsztyn": "SZY", "zielona-gora": "IEG",
  "barcelona": "BCN", "madrid": "MAD", "madryt": "MAD",
  "malaga": "AGP", "alicante": "ALC", "valencia": "VLC", "walencja": "VLC",
  "seville": "SVQ", "sevilla": "SVQ", "sewilla": "SVQ",
  "mallorca": "PMI", "majorca": "PMI", "majorka": "PMI",
  "palma": "PMI", "palma-de-mallorca": "PMI",
  "tenerife": "TFS", "tenerife-south": "TFS",
  "fuerteventura": "FUE", "gran-canaria": "LPA",
  "rome": "ROM", "rzym": "ROM", "milan": "MIL", "mediolan": "MIL",
  "bergamo": "BGY", "naples": "NAP", "neapol": "NAP",
  "venice": "VCE", "wenecja": "VCE", "florence": "FLR", "florencja": "FLR",
  "bari": "BRI", "turin": "TRN", "turyn": "TRN",
  "bologna": "BLQ", "bolonia": "BLQ", "catania": "CTA", "katania": "CTA",
  "palermo": "PMO", "pisa": "PSA", "piza": "PSA",
  "lisbon": "LIS", "lizbona": "LIS", "porto": "OPO",
  "paris": "PAR", "paryz": "PAR", "nice": "NCE", "nicea": "NCE",
  "marseille": "MRS", "marsylia": "MRS",
  "london": "LON", "londyn": "LON", "edinburgh": "EDI", "edynburg": "EDI",
  "manchester": "MAN", "berlin": "BER", "munich": "MUC", "monachium": "MUC",
  "hamburg": "HAM", "vienna": "VIE", "wieden": "VIE",
  "prague": "PRG", "praga": "PRG", "budapest": "BUD", "budapeszt": "BUD",
  "athens": "ATH", "ateny": "ATH", "santorini": "JTR",
  "rhodes": "RHO", "rodos": "RHO", "heraklion": "HER", "kreta": "HER",
  "istanbul": "IST", "stambul": "IST", "ankara": "ESB", "antalya": "AYT",
  "paphos": "PFO", "pafos": "PFO", "larnaca": "LCA",
  "malta": "MLA", "valletta": "MLA", "dublin": "DUB",
  "reykjavik": "KEF", "oslo": "OSL", "stockholm": "STO", "sztokholm": "STO",
  "copenhagen": "CPH", "kopenhaga": "CPH", "helsinki": "HEL",
  "riga": "RIX", "ryga": "RIX", "tallinn": "TLL",
  "vilnius": "VNO", "wilno": "VNO",
  "dubai": "DXB", "dubaj": "DXB", "abu-dhabi": "AUH", "doha": "DOH",
  "marrakech": "RAK", "marrakesz": "RAK", "agadir": "AGA",
  "cairo": "CAI", "kair": "CAI", "hurghada": "HRG",
  "marsa-alam": "RMF", "djerba": "DJE",
  "cape-town": "CPT", "kapsztad": "CPT",
  "johannesburg": "JNB", "nairobi": "NBO", "mombasa": "MBA",
  "zanzibar": "ZNZ", "bangkok": "BKK", "phuket": "HKT",
  "tokyo": "TYO", "tokio": "TYO", "hanoi": "HAN",
  "ho-chi-minh-city": "SGN", "ho-chi-minh": "SGN",
  "singapore": "SIN", "singapur": "SIN", "bali": "DPS", "denpasar": "DPS",
  "kuala-lumpur": "KUL", "new-york": "NYC", "new-york-city": "NYC",
  "nowy-jork": "NYC", "miami": "MIA",
  "los-angeles": "LAX", "san-francisco": "SFO",
  "toronto": "YTO", "buenos-aires": "BUE", "rio-de-janeiro": "RIO",
  "lima": "LIM", "bogota": "BOG", "anywhere": "anywhere", "gdziekolwiek": "anywhere",
};

const COUNTRY_SUFFIXES = [
  "united-arab-emirates", "united-kingdom", "united-states-of-america",
  "united-states", "south-africa", "czech-republic", "north-macedonia",
  "dominican-republic", "saudi-arabia", "new-zealand", "sri-lanka",
  "great-britain", "the-netherlands", "wielka-brytania",
  "united-states", "spain", "hiszpania", "poland", "polska",
  "italy", "wlochy", "portugal", "portugalia", "france", "francja",
  "germany", "niemcy", "austria", "australia", "turkey", "turcja",
  "greece", "grecja", "cyprus", "cypr", "malta", "ireland", "irlandia",
  "czechia", "czechy", "hungary", "wegry", "denmark", "dania",
  "norway", "norwegia", "sweden", "szwecja", "finland", "finlandia",
  "estonia", "latvia", "litwa", "lithuania", "netherlands", "holandia",
  "morocco", "maroko", "egypt", "egipt", "kenya", "kenia",
  "tanzania", "thailand", "tajlandia", "vietnam", "wietnam",
  "japan", "japonia", "indonesia", "indonezja", "singapore",
  "uae", "zea", "usa", "canada", "kanada", "brazil", "brazylia",
  "argentina", "argentyna", "peru", "colombia", "kolumbia",
];

function normalizedName(value: string) {
  return value.trim().toLowerCase().replace(/ł/g, "l").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function kiwiLocationCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const original = value.trim();
  if (/^[A-Za-z]{3}$/.test(original)) return original.toUpperCase();
  const slug = normalizedName(original);
  if (LOCATION_IATA[slug]) return LOCATION_IATA[slug];
  for (const country of COUNTRY_SUFFIXES) {
    if (!slug.endsWith("-" + country)) continue;
    const city = slug.slice(0, -(country.length + 1));
    if (LOCATION_IATA[city]) return LOCATION_IATA[city];
  }
  return null;
}

function safeISODate(value: string | null | undefined): string | null {
  if (!value) return "";
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value : null;
}

/** Return an attributable Kiwi /deep destination URL, or null if route is ambiguous. */
export function normalizedKiwiDeepUrl(target: string): string | null {
  try {
    const url = new URL(target);
    if (url.protocol !== "https:" || url.username || url.password
      || !["kiwi.com", "www.kiwi.com"].includes(url.hostname.toLowerCase())) return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (/^[a-z]{2}(?:-[a-z]{2})?$/.test(parts[0] || "")) parts.shift();

    let from = "";
    let to = "";
    let departure = "";
    let returnDate = "";

    if (parts[0] === "deep" && parts.length === 1) {
      // The provider's official deep-link format.
      if (url.searchParams.has("multicity") || url.searchParams.has("nomad")) return url.toString();
      from = url.searchParams.get("from") || "";
      to = url.searchParams.get("to") || "";
      departure = url.searchParams.get("departure") || "";
      returnDate = url.searchParams.get("return") || "";
    } else if (parts[0] === "search" && parts[1] === "results" && parts.length >= 4) {
      // Older Tripownia offer links pointed to a non-affiliate results page.
      from = parts[2];
      to = parts[3];
      departure = parts[4] || "";
      returnDate = parts[5] || "";
      if (parts.length > 6) return null;
    } else if (parts.length === 0) {
      // Partner searches built by Tripownia's search hub.
      from = url.searchParams.get("origin") || url.searchParams.get("from") || "";
      to = url.searchParams.get("destination") || url.searchParams.get("to") || "";
      departure = url.searchParams.get("outboundDate") || url.searchParams.get("departure") || "";
      returnDate = url.searchParams.get("inboundDate") || url.searchParams.get("return") || "";
    } else {
      return null;
    }

    const origin = kiwiLocationCode(from);
    const destination = kiwiLocationCode(to);
    const startDate = safeISODate(departure);
    const endDate = safeISODate(returnDate);
    if (!origin || !destination || origin === destination || startDate === null
      || endDate === null || (startDate && endDate && endDate < startDate)
      || (endDate && !startDate)) return null;

    const deep = new URL("https://www.kiwi.com/deep");
    deep.searchParams.set("from", origin);
    deep.searchParams.set("to", destination);
    if (startDate) deep.searchParams.set("departure", startDate);
    if (endDate) deep.searchParams.set("return", endDate);
    const adults = Number(url.searchParams.get("adults"));
    if (url.searchParams.has("adults") && Number.isInteger(adults) && adults >= 1 && adults <= 9) {
      deep.searchParams.set("adults", String(adults));
    }
    return deep.toString();
  } catch {
    return null;
  }
}
