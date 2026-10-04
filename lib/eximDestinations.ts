export type EximDestination = {
  label: string;
  query: string;
  eximPath: string;
};

export const eximDestinations: EximDestination[] = [
  { label: "Albania", query: "Albania", eximPath: "/kierunki/albania" },
  { label: "Aruba", query: "Aruba", eximPath: "/kierunki/aruba" },
  { label: "Austria", query: "Austria", eximPath: "/kierunki/austria" },
  { label: "Bahrajn", query: "Bahrajn", eximPath: "/kierunki/bahrajn" },
  { label: "Bułgaria", query: "Bułgaria", eximPath: "/kierunki/bulgaria" },
  { label: "Chorwacja", query: "Chorwacja", eximPath: "/kierunki/chorwacja" },
  { label: "Curaçao", query: "Curaçao", eximPath: "/kierunki/curacao" },
  { label: "Cypr", query: "Cypr", eximPath: "/kierunki/cypr" },
  { label: "Cypr Północny", query: "Cypr Północny", eximPath: "/kierunki/cypr/cypr-polnocny" },
  { label: "Czarnogóra", query: "Czarnogóra", eximPath: "/kierunki/czarnogora" },
  { label: "Czechy", query: "Czechy", eximPath: "/kierunki/czechy" },
  { label: "Dominikana", query: "Dominikana", eximPath: "/kierunki/dominikana" },
  { label: "Egipt", query: "Egipt", eximPath: "/kierunki/egipt" },
  { label: "Filipiny", query: "Filipiny", eximPath: "/kierunki/filipiny" },
  { label: "Grecja", query: "Grecja", eximPath: "/kierunki/grecja" },
  { label: "Hiszpania", query: "Hiszpania", eximPath: "/kierunki/hiszpania" },
  { label: "Indonezja", query: "Indonezja", eximPath: "/kierunki/indonezja" },
  { label: "Jamajka", query: "Jamajka", eximPath: "/kierunki/jamajka" },
  { label: "Kenia", query: "Kenia", eximPath: "/kierunki/kenia" },
  { label: "Macedonia Północna", query: "Macedonia", eximPath: "/kierunki/macedonia" },
  { label: "Madagaskar", query: "Madagaskar", eximPath: "/kierunki/madagaskar" },
  { label: "Malediwy", query: "Malediwy", eximPath: "/kierunki/malediwy" },
  { label: "Malezja", query: "Malezja", eximPath: "/kierunki/malezja" },
  { label: "Malta", query: "Malta", eximPath: "/kierunki/malta" },
  { label: "Maroko", query: "Maroko", eximPath: "/kierunki/maroko" },
  { label: "Mauritius", query: "Mauritius", eximPath: "/kierunki/mauritius" },
  { label: "Meksyk", query: "Meksyk", eximPath: "/kierunki/meksyk" },
  { label: "Niemcy", query: "Niemcy", eximPath: "/kierunki/niemcy" },
  { label: "Polinezja Francuska", query: "Polinezja Francuska", eximPath: "/kierunki/polinezja-francuska" },
  { label: "Polska", query: "Polska", eximPath: "/kierunki/polska" },
  { label: "Portugalia", query: "Portugalia", eximPath: "/kierunki/portugalia" },
  { label: "Seszele", query: "Seszele", eximPath: "/kierunki/seszele" },
  { label: "Słowacja", query: "Słowacja", eximPath: "/kierunki/slowacja" },
  { label: "Słowenia", query: "Słowenia", eximPath: "/kierunki/slowenia" },
  { label: "Sri Lanka", query: "Sri Lanka", eximPath: "/kierunki/sri-lanka" },
  { label: "Stany Zjednoczone", query: "Stany Zjednoczone", eximPath: "/kierunki/stany-zjednoczone" },
  { label: "Szwajcaria", query: "Szwajcaria", eximPath: "/kierunki/szwajcaria" },
  { label: "Tajlandia", query: "Tajlandia", eximPath: "/kierunki/tajlandia" },
  { label: "Tanzania", query: "Tanzania", eximPath: "/kierunki/tanzania" },
  { label: "Tunezja", query: "Tunezja", eximPath: "/kierunki/tunezja" },
  { label: "Turcja", query: "Turcja", eximPath: "/kierunki/turcja" },
  { label: "Węgry", query: "Węgry", eximPath: "/kierunki/wegry" },
  { label: "Wietnam", query: "Wietnam", eximPath: "/kierunki/wietnam" },
  { label: "Włochy", query: "Włochy", eximPath: "/kierunki/wlochy" },
  { label: "Zjednoczone Emiraty Arabskie", query: "ZEA", eximPath: "/kierunki/zjednoczone-emiraty-arabskie" },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function destinationDealsHref(destination: EximDestination, source = "kierunki_menu") {
  const params = new URLSearchParams({
    destination: destination.query,
    source,
  });
  return `/okazje?${params.toString()}`;
}

export function findEximDestination(value: string) {
  const needle = normalize(value);
  if (!needle) return undefined;
  return eximDestinations.find((item) => normalize(item.label) === needle || normalize(item.query) === needle);
}

export function eximDestinationTarget(value: string) {
  const destination = findEximDestination(value);
  return destination ? `https://www.exim.pl${destination.eximPath}` : "";
}
