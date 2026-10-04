function normalizeDestination(value: string) {
  return (value || "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DESTINATION_EQUIVALENTS: Record<string, string[]> = {
  albania: ["albania"],
  aruba: ["aruba"],
  austria: ["austria"],
  bahrajn: ["bahrajn", "bahrain"],
  bulgaria: ["bulgaria", "bulgaria"],
  chorwacja: ["chorwacja", "croatia", "hrvatska"],
  curacao: ["curacao", "curaçao"],
  cypr: ["cypr", "cyprus"],
  "cypr polnocny": ["cypr polnocny", "northern cyprus", "north cyprus", "kyrenia", "kirenia", "famagusta"],
  czarnogora: ["czarnogora", "montenegro"],
  czechy: ["czechy", "czech republic", "czechia"],
  dominikana: ["dominikana", "dominican republic"],
  egipt: ["egipt", "egypt"],
  filipiny: ["filipiny", "philippines"],
  grecja: ["grecja", "greece"],
  hiszpania: ["hiszpania", "spain"],
  indonezja: ["indonezja", "indonesia"],
  jamajka: ["jamajka", "jamaica"],
  kenia: ["kenia", "kenya"],
  macedonia: ["macedonia", "north macedonia", "macedonia polnocna"],
  "macedonia polnocna": ["macedonia polnocna", "north macedonia", "macedonia"],
  madagaskar: ["madagaskar", "madagascar"],
  malediwy: ["malediwy", "maldives"],
  malezja: ["malezja", "malaysia"],
  malta: ["malta"],
  maroko: ["maroko", "morocco"],
  mauritius: ["mauritius"],
  meksyk: ["meksyk", "mexico"],
  niemcy: ["niemcy", "germany", "deutschland"],
  "polinezja francuska": ["polinezja francuska", "french polynesia", "tahiti"],
  polska: ["polska", "poland"],
  portugalia: ["portugalia", "portugal"],
  seszele: ["seszele", "seychelles"],
  slowacja: ["slowacja", "slovakia"],
  slowenia: ["slowenia", "slovenia"],
  "sri lanka": ["sri lanka"],
  "stany zjednoczone": ["stany zjednoczone", "united states", "usa", "united states of america"],
  szwajcaria: ["szwajcaria", "switzerland"],
  tajlandia: ["tajlandia", "thailand"],
  tanzania: ["tanzania"],
  tunezja: ["tunezja", "tunisia"],
  turcja: ["turcja", "turkey", "turkiye"],
  wegry: ["wegry", "hungary"],
  wietnam: ["wietnam", "vietnam"],
  wlochy: ["wlochy", "italy", "italia"],
  zea: ["zea", "uae", "united arab emirates", "zjednoczone emiraty arabskie"],
  "zjednoczone emiraty arabskie": ["zjednoczone emiraty arabskie", "united arab emirates", "uae", "zea"],
};

export function destinationEquivalentTerms(value: string) {
  const key = normalizeDestination(value);
  const configured = DESTINATION_EQUIVALENTS[key] || [value];
  return Array.from(new Set(configured.map(normalizeDestination).filter(Boolean)));
}

export function destinationQueryMatches(query: string, ...values: Array<string | undefined | null>) {
  const queryTerms = destinationEquivalentTerms(query);
  if (!queryTerms.length) return true;
  const haystack = normalizeDestination(values.filter(Boolean).join(" "));
  return queryTerms.some((term) => haystack.includes(term));
}

export { normalizeDestination };
