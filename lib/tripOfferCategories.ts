export const tripOfferCategories = [
  {
    key: "allinclusive",
    label: "All inclusive",
    title: "Wakacje All Inclusive",
    lead: "Gotowe pakiety z wyżywieniem, lotem i hotelem. Najtańsze aktualne warianty pokazujemy na górze.",
    searchTerms: ["Egipt", "Turcja", "Tunezja", "Grecja", "Hiszpania", "Cypr"],
  },
  {
    key: "exotic",
    label: "Egzotyka",
    title: "Egzotyka i dalekie wakacje",
    lead: "Tropiki i dalsze kierunki z aktualnej puli partnerów — bez pustych przekierowań.",
    searchTerms: ["Zanzibar", "Kenia", "Mauritius", "Sri Lanka", "Dominikana", "Meksyk"],
  },
  {
    key: "citybreak",
    label: "City break",
    title: "City break",
    lead: "Krótkie wyjazdy na 2–5 nocy. Najpierw konkretna cena i termin, potem wybór miasta.",
    searchTerms: ["Rzym", "Mediolan", "Barcelona", "Malta", "Lizbona", "Porto"],
  },
  {
    key: "ski",
    label: "Narty",
    title: "Narty i zimowe wyjazdy",
    lead: "Zimowe wyjazdy z aktualnej puli ofert — narty, Alpy i górskie hotele.",
    searchTerms: ["Narty", "Austria", "Włochy", "Słowacja", "Czechy", "Szwajcaria"],
  },
  {
    key: "ski-italy",
    label: "Narty we Włoszech",
    title: "Narty we Włoszech",
    lead: "Włoskie Alpy i Dolomity — szukamy ofert zimowych z aktualnego feedu.",
    searchTerms: ["Narty Włochy", "Dolomity", "Livigno", "Włochy"],
  },
  {
    key: "ski-austria",
    label: "Narty w Austrii",
    title: "Narty w Austrii",
    lead: "Tyrol, Salzburg i austriackie kurorty zimowe z aktualnej puli partnerów.",
    searchTerms: ["Narty Austria", "Tyrol", "Salzburg", "Austria"],
  },
  {
    key: "touring",
    label: "Wycieczki objazdowe",
    title: "Wycieczki objazdowe",
    lead: "Objazdówki i gotowe programy zwiedzania, gdy feed partnera zawiera konkretny termin i cenę.",
    searchTerms: ["Wycieczka objazdowa", "Objazd", "Tour"],
  },
  {
    key: "cruise",
    label: "Rejsy",
    title: "Rejsy",
    lead: "Rejsy i oferty z rejsem, jeśli są dostępne w aktualnym feedzie.",
    searchTerms: ["Rejs", "Cruise"],
  },
  {
    key: "safari",
    label: "Safari",
    title: "Safari",
    lead: "Safari i wyjazdy łączące zwiedzanie z wypoczynkiem — tylko gdy feed zwraca właściwy produkt.",
    searchTerms: ["Safari", "Kenia Safari", "Tanzania Safari"],
  },
  {
    key: "selfdrive",
    label: "Dojazd własny",
    title: "Wakacje z dojazdem własnym",
    lead: "Hotele i pobyty bez obowiązkowego przelotu — dla osób jadących własnym autem.",
    searchTerms: ["Dojazd własny", "Polska", "Czechy", "Słowacja", "Austria", "Niemcy"],
  },
  {
    key: "aquapark",
    label: "Hotele z aquaparkami",
    title: "Hotele z aquaparkami",
    lead: "Rodzinne hotele z aquaparkiem i zjeżdżalniami — filtrujemy po danych z oferty.",
    searchTerms: ["Aquapark", "Aqua Park", "Waterpark"],
  },
  {
    key: "kidsclub",
    label: "Hotele z klubem dziecięcym",
    title: "Hotele z klubem dziecięcym",
    lead: "Hotele rodzinne z kids clubem, mini clubem lub animacjami dla dzieci.",
    searchTerms: ["Kids club", "Mini club", "Klub dziecięcy"],
  },
  {
    key: "bestseller",
    label: "Hotelowe bestsellery",
    title: "Hotelowe bestsellery",
    lead: "Najmocniejsze aktualne oferty z wysokim Deal Score i dobrym stosunkiem ceny do jakości.",
    searchTerms: [],
  },
  {
    key: "groups",
    label: "Wyjazdy grupowe",
    title: "Wyjazdy grupowe",
    lead: "Oferty grupowe i produkty opisane przez partnera jako wyjazd dla grup.",
    searchTerms: ["Wyjazd grupowy", "Grupa"],
  },
  {
    key: "adults",
    label: "Wakacje dla dorosłych",
    title: "Wakacje dla dorosłych",
    lead: "Hotele adults only i obiekty przeznaczone wyłącznie dla dorosłych.",
    searchTerms: ["Adults only", "Adult only", "Dla dorosłych"],
  },
  {
    key: "voucher",
    label: "Vouchery na wakacje",
    title: "Vouchery na wakacje",
    lead: "Vouchery i bony wakacyjne, jeśli pojawiają się w aktualnej ofercie partnera.",
    searchTerms: ["Voucher", "Bon wakacyjny"],
  },
  {
    key: "promo",
    label: "Odlotowe czwartki",
    title: "Odlotowe czwartki i promocje EXIM",
    lead: "Promocje partnera pokazujemy tylko wtedy, gdy da się je zweryfikować w bieżącej ofercie.",
    searchTerms: ["Odlotowe czwartki", "Promocja"],
  },
] as const;

export type OfferCategoryKey = (typeof tripOfferCategories)[number]["key"];

export type OfferCategoryInput = {
  city?: string;
  country?: string;
  nights?: number;
  board?: string;
  hotel?: string;
  departure?: string;
  dates?: string;
  reason?: string;
  description?: string;
  category?: string[];
  score?: number;
  tag?: string;
};

const categoryKeys = new Set<string>(tripOfferCategories.map((item) => item.key));

const exoticTerms = [
  "zanzibar", "tanzania", "kenia", "kenya", "mauritius", "malediw", "sri lanka",
  "dominikana", "meksyk", "kuba", "jamaj", "tajland", "wietnam", "vietnam", "bali",
  "indonez", "filipin", "seszel", "gambia", "wyspy zielonego przyladka", "polinezja",
];

function normalize(value: string | undefined | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textFor(input: OfferCategoryInput) {
  return normalize([
    input.city,
    input.country,
    input.board,
    input.hotel,
    input.departure,
    input.dates,
    input.reason,
    input.description,
    ...(input.category || []),
  ].filter(Boolean).join(" "));
}

export function isOfferCategoryKey(value: string | undefined | null): value is OfferCategoryKey {
  return Boolean(value && categoryKeys.has(value));
}

export function findTripOfferCategory(value: string | undefined | null) {
  return tripOfferCategories.find((item) => item.key === value);
}

export function offerCategoryHref(key: OfferCategoryKey) {
  return `/okazje?type=${encodeURIComponent(key)}`;
}

export function getOfferCategorySearchTerms(value: string | undefined | null) {
  const category = findTripOfferCategory(value);
  return category ? [...category.searchTerms] : [];
}

export function inferOfferCategoryTags(input: OfferCategoryInput) {
  const text = textFor(input);
  const tags = new Set<string>((input.category || []).map((item) => normalize(item)).filter(Boolean));
  const nights = Number(input.nights || 0);
  const country = normalize(input.country);
  const score = Number(input.score || 0);
  const tag = normalize(input.tag);

  if (/all inclusive|ultra all inclusive|\bai\b/.test(text)) tags.add("allinclusive");
  if ((nights > 0 && nights <= 5) || tags.has("city") || tags.has("weekend")) tags.add("citybreak");
  if (exoticTerms.some((term) => text.includes(term))) tags.add("exotic");

  const skiKeyword = /\bnart|\bski\b|snowboard|alpy|dolomit|livigno|tyrol|stok|skipass/.test(text);
  if (skiKeyword) tags.add("ski");
  if (skiKeyword && /wlochy|italy|italia|dolomit|livigno/.test(text)) tags.add("ski-italy");
  if (skiKeyword && /austria|tyrol|salzburg/.test(text)) tags.add("ski-austria");

  if (/objazd|touring|wycieczk[a-z ]*objazd/.test(text)) tags.add("touring");
  if (/\brejs|\bcruise|statek wycieczk/.test(text)) tags.add("cruise");
  if (/\bsafari\b/.test(text)) tags.add("safari");
  if (/dojazd wlasny|wlasny dojazd|self drive|bez transportu/.test(text)) tags.add("selfdrive");
  if (/aquapark|aqua park|waterpark|water park|zjezdzaln/.test(text)) tags.add("aquapark");
  if (/kids club|kid s club|mini club|klub dzieciecy|animacje dla dzieci/.test(text)) tags.add("kidsclub");
  if (/wyjazd grup|grupow|dla grup/.test(text)) tags.add("groups");
  if (/adults only|adult only|tylko dla doroslych|dla doroslych|\b16\+\b|\b18\+\b/.test(text)) tags.add("adults");
  if (/voucher|bon wakacyj|bon podarunk/.test(text)) tags.add("voucher");
  if (/odlotowe czwartki|promocja exim/.test(text)) tags.add("promo");

  if (score >= 9.2 || tag === "bierzemy" || tags.has("bestseller")) tags.add("bestseller");

  if (country === "wlochy" && tags.has("ski")) tags.add("ski-italy");
  if (country === "austria" && tags.has("ski")) tags.add("ski-austria");

  return Array.from(tags);
}

export function offerMatchesCategory(value: string | undefined | null, input: OfferCategoryInput) {
  if (!value) return true;
  if (!isOfferCategoryKey(value)) return false;
  return inferOfferCategoryTags(input).includes(value);
}
