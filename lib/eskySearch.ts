import { buildEskyPackagesUrl } from "@/lib/partners";

export type EskySearch = {
  query?: string; departure?: string; cityBreak?: boolean;
  minNights?: number; maxNights?: number; nights?: string;
  start?: string; end?: string; minPrice?: number; maxPrice?: number;
  timeoutMs?: number;
  board?: string;
  weekendOnly?: boolean;
  lastMinuteOnly?: boolean;
};

const PL_AIRPORTS = new Set(["WAW", "WMI", "KRK", "KTW", "GDN", "WRO", "POZ", "RZE", "LUZ", "SZZ", "LCJ", "BZG", "SZY", "IEG", "RDO"]);
const DESTINATIONS: Record<string, string> = {
  malta: "co-MT", cypr: "co-CY", wlochy: "co-IT", hiszpania: "co-ES", grecja: "co-GR", portugalia: "co-PT",
  francja: "co-FR", albania: "co-AL", czechy: "co-CZ", wegry: "co-HU", austria: "co-AT", niemcy: "co-DE",
  holandia: "co-NL", chorwacja: "co-HR", bulgaria: "co-BG", turcja: "co-TR", tunezja: "co-TN", egipt: "co-EG",
  maroko: "co-MA", wielka_brytania: "co-GB", irlandia: "co-IE", dania: "co-DK", szwecja: "co-SE",
  rzym: "ci-ROM", rome: "ci-ROM", mediolan: "ci-MIL", milan: "ci-MIL", bergamo: "ci-MIL",
  praga: "ci-PRG", prague: "ci-PRG", paryz: "ci-PAR", paris: "ci-PAR", londyn: "ci-LON", london: "ci-LON",
  wieden: "ci-VIE", budapeszt: "ci-BUD", lizbona: "ci-LIS", lisbon: "ci-LIS", neapol: "ci-NAP",
  sewilla: "ci-SVQ", amsterdam: "ci-AMS", kopenhaga: "ci-CPH", malaga: "ci-AGP", split: "ci-SPU",
  barcelona: "ci-BCN", madryt: "ci-MAD", ateny: "ci-ATH", porto: "ci-OPO", wenecja: "ci-VCE",
  alicante: "ci-ALC", walencja: "ci-VLC", nicea: "ci-NCE", berlin: "ci-BER", dublin: "ci-DUB",
  bari: "ci-BRI", brindisi: "ci-BDS",
  helsinki: "ci-HEL", oslo: "ci-OSL", zurych: "ci-ZRH", zurich: "ci-ZRH", genewa: "ci-GVA",
  zadar: "ci-ZAD", marrakesz: "ci-RAK", marrakech: "ci-RAK",
  larnaka: "ci-LCA", larnaca: "ci-LCA",
  cagliari: "ci-CAG",
  bolonia: "ci-BLQ", bologna: "ci-BLQ",
  piza: "ci-PSA", pisa: "ci-PSA",
  turyn: "ci-TRN", turin: "ci-TRN",
  palermo: "ci-PMO",
  katania: "ci-CTA", catania: "ci-CTA",
  stambul: "ci-IST", istanbul: "ci-IST",
  pafos: "ci-PFO", paphos: "ci-PFO",
  marsylia: "ci-MRS", marseille: "ci-MRS",
  sztokholm: "ci-STO", stockholm: "ci-STO",
  edynburg: "ci-EDI", edinburgh: "ci-EDI",
  bruksela: "ci-BRU", brussels: "ci-BRU",
  dubrownik: "ci-DBV", dubrovnik: "ci-DBV",
  florencja: "ci-FLR", florence: "ci-FLR",
  genua: "ci-GOA", genoa: "ci-GOA",
  verona: "ci-VRN",
  ljubljana: "ci-LJU", lublana: "ci-LJU",
  fuerteventura: "ci-FUE",
  reykjavik: "ci-REK",
  majorka: "ci-PMI", mallorca: "ci-PMI", palma: "ci-PMI",
  rodos: "ci-RHO", rhodes: "ci-RHO",
  santorini: "ci-JTR",
  teneryfa: "ci-TFS", tenerife: "ci-TFS",
  djerba: "ci-DJE",
  banjul: "ci-BJL",
  kair: "ci-CAI", cairo: "ci-CAI",
  kapsztad: "ci-CPT", cape_town: "ci-CPT",
  nairobi: "ci-NBO",
  mombasa: "ci-MBA",
  marsa_alam: "ci-RMF",
  zanzibar: "ci-ZNZ",
  abu_dhabi: "ci-AUH",
  doha: "ci-DOH",
  dubaj: "ci-DXB", dubai: "ci-DXB",
  maskat: "ci-MCT", muscat: "ci-MCT",
  bali: "ci-DPS",
  bangkok: "ci-BKK",
  hanoi: "ci-HAN",
  ho_chi_minh: "ci-SGN", saigon: "ci-SGN",
  kuala_lumpur: "ci-KUL",
  pekin: "ci-BJS", beijing: "ci-BJS",
  phuket: "ci-HKT",
  tokio: "ci-TYO", tokyo: "ci-TYO",
  cancun: "ci-CUN",
  los_angeles: "ci-LAX",
  miami: "ci-MIA",
  nowy_jork: "ci-NYC", new_york: "ci-NYC", nyc: "ci-NYC",
  san_francisco: "ci-SFO",
  toronto: "ci-YTO",
  buenos_aires: "ci-BUE",
  rio_de_janeiro: "ci-RIO", rio: "ci-RIO",
  auckland: "ci-AKL",
  melbourne: "ci-MEL",
  sydney: "ci-SYD",
  tbilisi: "ci-TBS",
  tahiti: "ci-PPT", papeete: "ci-PPT",
  madera: "ci-FNC", madeira: "ci-FNC", funchal: "ci-FNC",
};


const COUNTRY_CODES: Record<string, string> = {
  albania: "AL", aruba: "AW", austria: "AT", bahrajn: "BH", bahrain: "BH", belgia: "BE", belgium: "BE", bulgaria: "BG", chorwacja: "HR", croatia: "HR", curacao: "CW",
  cypr: "CY", czechy: "CZ", dania: "DK", denmark: "DK", egipt: "EG", egypt: "EG", estonia: "EE",
  finlandia: "FI", finland: "FI", francja: "FR", france: "FR", grecja: "GR", greece: "GR", hiszpania: "ES",
  spain: "ES", holandia: "NL", netherlands: "NL", irlandia: "IE", ireland: "IE", islandia: "IS", iceland: "IS",
  litwa: "LT", lithuania: "LT", lotwa: "LV", latvia: "LV", malta: "MT", niemcy: "DE", germany: "DE",
  norwegia: "NO", norway: "NO", polska: "PL", portugal: "PT", portugalia: "PT", rumunia: "RO", romania: "RO",
  czarnogora: "ME", montenegro: "ME", macedonia: "MK", macedonia_polnocna: "MK", north_macedonia: "MK", madagaskar: "MG", madagascar: "MG",
  slowacja: "SK", slovakia: "SK", slowenia: "SI", slovenia: "SI", szwajcaria: "CH", switzerland: "CH",
  szwecja: "SE", sweden: "SE", turcja: "TR", turkey: "TR", ukraina: "UA", ukraine: "UA", wegry: "HU",
  hungary: "HU", wielka_brytania: "GB", united_kingdom: "GB", wlochy: "IT", italy: "IT",
  tunezja: "TN", tunisia: "TN", maroko: "MA", morocco: "MA", gambia: "GM", kenia: "KE", kenya: "KE",
  rpa: "ZA", south_africa: "ZA", mauritius: "MU", seszele: "SC", seychelles: "SC", tanzania: "TZ",
  jordania: "JO", jordan: "JO", katar: "QA", qatar: "QA", oman: "OM", zea: "AE", emiraty_arabskie: "AE",
  zjednoczone_emiraty_arabskie: "AE", uae: "AE", chiny: "CN", china: "CN", filipiny: "PH", philippines: "PH",
  indie: "IN", india: "IN", indonezja: "ID", indonesia: "ID", japonia: "JP", japan: "JP", kambodza: "KH",
  cambodia: "KH", korea_poludniowa: "KR", south_korea: "KR", malediwy: "MV", maldives: "MV",
  malezja: "MY", malaysia: "MY", nepal: "NP", singapur: "SG", singapore: "SG", sri_lanka: "LK",
  tajlandia: "TH", thailand: "TH", wietnam: "VN", vietnam: "VN", bahamy: "BS", bahamas: "BS",
  dominikana: "DO", dominican_republic: "DO", jamajka: "JM", jamaica: "JM", kanada: "CA", canada: "CA",
  kostaryka: "CR", costa_rica: "CR", kuba: "CU", cuba: "CU", meksyk: "MX", mexico: "MX", usa: "US",
  stany_zjednoczone: "US", argentyna: "AR", argentina: "AR", brazylia: "BR", brazil: "BR", chile: "CL",
  kolumbia: "CO", colombia: "CO", peru: "PE", australia: "AU", nowa_zelandia: "NZ", new_zealand: "NZ",
  fidzi: "FJ", fiji: "FJ", gruzja: "GE", georgia: "GE", polinezja_francuska: "PF", french_polynesia: "PF",
};

function eskyDestinationKey(query = "") {
  return query.split(",")[0].trim().toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "_");
}

const MULTI_DESTINATIONS: Record<string, string[]> = {
  patagonia: ["co-AR", "co-CL"],
  sycylia: ["ci-CTA", "ci-PMO"],
  sicily: ["ci-CTA", "ci-PMO"],
};

export function eskyArrivals(query = "") {
  const primary = eskyDestinationKey(query);
  const direct = MULTI_DESTINATIONS[primary] || (DESTINATIONS[primary] ? [DESTINATIONS[primary]] : []);
  if (direct.length) return direct;

  const parts = query.split(",").map((part) => eskyDestinationKey(part)).filter(Boolean);
  const countryKey = parts.length > 1 ? parts.at(-1) || "" : primary;
  const countryCode = COUNTRY_CODES[countryKey];
  return countryCode ? [`co-${countryCode}`] : [];
}

export function eskyArrival(query = "") {
  return eskyArrivals(query)[0] || "";
}

export function eskyDepartures(departure = "") {
  return [...new Set(departure.toUpperCase().split(",").flatMap(code => code.trim() === "WAWA" ? ["WAW", "WMI"] : [code.trim()]).filter(code => PL_AIRPORTS.has(code)))];
}

export function eskyNights(search: EskySearch) {
  const match = /^(\d+)(?:-(\d+)|(\+))?$/.exec(search.nights || "");
  const from = Math.max(search.cityBreak ? 2 : 1, search.minNights || (match ? Number(match[1]) : search.cityBreak ? 2 : 1));
  const to = Math.min(search.cityBreak ? 5 : 30, search.maxNights || (match ? Number(match[2] || (match[3] ? 30 : match[1])) : search.cityBreak ? 5 : 14));
  return { from, to };
}

export function eskyInventoryUrl(search: EskySearch, arrival = eskyArrival(search.query), cursor = "") {
  const url = new URL("https://hotelsapi.esky.com/gateway/minilisting/packages");
  const p = url.searchParams;
  p.set("orientation", "vertical"); p.set("branding", "false"); p.set("limit", "15");
  p.set("partnerCode", "TRIPOWNIAPLPACKAGES");
  if (arrival) p.set("arrivals[0]", arrival);
  eskyDepartures(search.departure).forEach((code, i) => p.set(`departures[${i}]`, `ap-${code}`));
  const nights = eskyNights(search);
  p.set("lengthRange[from]", String(nights.from)); p.set("lengthRange[to]", String(nights.to));
  if (search.start) p.set("dateRange[from]", search.start);
  if (search.end) p.set("dateRange[to]", search.end);
  if (search.minPrice) p.set("priceRange[from]", String(search.minPrice));
  const ceiling = search.cityBreak ? Math.min(search.maxPrice || 2000, 2000) : search.maxPrice;
  if (ceiling) p.set("priceRange[to]", String(ceiling));
  if (cursor) p.set("cursor", cursor);
  return url;
}

export function eskySearchUrl(search: EskySearch) {
  const url = new URL(buildEskyPackagesUrl());
  url.searchParams.set("rooms[0][adults]", "2");
  url.searchParams.set("datesTab", "flexDates");
  const arrival = eskyArrival(search.query);
  if (arrival) url.searchParams.set("arrivalPlaces", arrival);
  const departures = eskyDepartures(search.departure);
  if (departures.length) url.searchParams.set("departurePlaces", departures.map(code => `ap-${code}`).join(","));
  const nights = eskyNights(search);
  url.searchParams.set("stayLength", `${nights.from}:${nights.to}`);
  if (search.start) url.searchParams.set("departureDate", search.start);
  if (search.end) url.searchParams.set("returnDate", search.end);
  return url.toString();
}
