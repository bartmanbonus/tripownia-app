import type { LegacyItem } from "@/lib/legacy";

export type ArticleSearchMode = "all" | "city" | "holiday" | "lastminute";

export type ArticleContext = {
  destination?: string;
  departure?: string;
  departureCode?: string;
  mode: ArticleSearchMode;
  startDate?: string;
  endDate?: string;
  weekendOnly?: boolean;
  searchTitle: string;
  searchLead: string;
  focusTitle: string;
  focusPoints: string[];
  hasUsefulSearchContext: boolean;
};

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const destinationRules: Array<{ terms: string[]; destination: string }> = [
  { terms: ["teneryf"], destination: "Teneryfa" },
  { terms: ["wyspy kanaryj", "kanary"], destination: "Wyspy Kanaryjskie" },
  { terms: ["malta", "valletta"], destination: "Malta" },
  { terms: ["wietnam", "hanoi", "ho chi minh"], destination: "Wietnam" },
  { terms: ["tajland", "bangkok", "phuket"], destination: "Tajlandia" },
  { terms: ["zanzibar"], destination: "Zanzibar" },
  { terms: ["marsa alam"], destination: "Marsa Alam" },
  { terms: ["hurghad"], destination: "Hurghada" },
  { terms: ["egipt"], destination: "Egipt" },
  { terms: ["djerb"], destination: "Djerba" },
  { terms: ["tunezj"], destination: "Tunezja" },
  { terms: ["kreta"], destination: "Kreta" },
  { terms: ["rodos"], destination: "Rodos" },
  { terms: ["grecj", "pelopone"], destination: "Grecja" },
  { terms: ["cypr", "pafos", "larnak"], destination: "Cypr" },
  { terms: ["madera", "funchal"], destination: "Madera" },
  { terms: ["majork"], destination: "Majorka" },
  { terms: ["barcelon"], destination: "Barcelona" },
  { terms: ["alicante"], destination: "Alicante" },
  { terms: ["walencj"], destination: "Walencja" },
  { terms: ["sewill"], destination: "Sewilla" },
  { terms: ["hiszpan"], destination: "Hiszpania" },
  { terms: ["rzym", "rome"], destination: "Rzym" },
  { terms: ["bergamo"], destination: "Bergamo" },
  { terms: ["mediolan"], destination: "Mediolan" },
  { terms: ["wloch", "włoch"], destination: "Włochy" },
  { terms: ["porto"], destination: "Porto" },
  { terms: ["lizbon"], destination: "Lizbona" },
  { terms: ["portug"], destination: "Portugalia" },
  { terms: ["marrakesz", "marakesz"], destination: "Marrakesz" },
  { terms: ["maroko"], destination: "Maroko" },
  { terms: ["dubaj"], destination: "Dubaj" },
  { terms: ["abu dhabi"], destination: "Abu Dhabi" },
  { terms: ["stambul", "istanbul"], destination: "Stambuł" },
  { terms: ["turcj"], destination: "Turcja" },
  { terms: ["praga"], destination: "Praga" },
  { terms: ["budapeszt"], destination: "Budapeszt" },
  { terms: ["wieden", "wiedeń"], destination: "Wiedeń" },
  { terms: ["londyn"], destination: "Londyn" },
  { terms: ["paryz", "paryż"], destination: "Paryż" },
  { terms: ["islandi", "reykjavik"], destination: "Islandia" },
  { terms: ["norwegi", "fiord"], destination: "Norwegia" },
  { terms: ["japoni", "tokio", "sakura"], destination: "Japonia" },
  { terms: ["bali"], destination: "Bali" },
  { terms: ["singapur"], destination: "Singapur" },
  { terms: ["nowy jork"], destination: "Nowy Jork" },
  { terms: ["keni", "nairobi", "safari"], destination: "Kenia" },
];

const departureRules: Array<{ terms: string[]; departure: string; code: string }> = [
  { terms: ["z warszawy", "z modlina", "warszawa chopina"], departure: "Warszawa Chopina", code: "WAW" },
  { terms: ["z krakowa", "z balic"], departure: "Kraków", code: "KRK" },
  { terms: ["z katowic", "z pyrzowic"], departure: "Katowice", code: "KTW" },
  { terms: ["z gdanska", "z gdańska"], departure: "Gdańsk", code: "GDN" },
  { terms: ["z wroclawia", "z wrocławia"], departure: "Wrocław", code: "WRO" },
  { terms: ["z poznania", "z lawicy", "z ławicy"], departure: "Poznań", code: "POZ" },
];

const destinationFocus: Record<string, string[]> = {
  Malta: [
    "Na krótki wyjazd porównuj Vallettę, Sliemę i St. Julian’s — lokalizacja mocno zmienia charakter pobytu.",
    "Przy 3–4 nocach ważniejsze od najtańszego hotelu są godziny lotów i szybki dojazd z lotniska.",
    "Malta dobrze łączy zwiedzanie z odpoczynkiem, więc nie trzeba wybierać wyłącznie wariantu plażowego albo miejskiego.",
  ],
  Wietnam: [
    "Hanoi, środkowy Wietnam i południe kraju mają różną pogodę w tym samym terminie — nie traktuj Wietnamu jako jednego klimatu.",
    "Przy dłuższej podróży warto porównać lot międzynarodowy z przelotami krajowymi zamiast planować wszystko jednym ciągiem lądowym.",
    "Jeśli celem są plaże, sam pobyt w Hanoi nie wystarczy — wyszukuj konkretny region wypoczynkowy lub lot wewnętrzny.",
  ],
  Teneryfa: [
    "Południe wyspy zwykle wybiera się dla plaż i resortów, północ dla zieleni i bardziej lokalnego charakteru.",
    "Przy tygodniu warto sprawdzić koszt auta, bo wiele najciekawszych miejsc jest poza głównymi kurortami.",
    "Na zimowy wyjazd porównuj nie tylko temperaturę, ale też dokładną część wyspy i ekspozycję na wiatr.",
  ],
  "Wyspy Kanaryjskie": [
    "Teneryfa, Gran Canaria, Lanzarote i Fuerteventura różnią się krajobrazem, wiatrem i stylem wypoczynku.",
    "Przy zimowym słońcu wybór konkretnej wyspy jest ważniejszy niż ogólna etykieta „Kanary”.",
    "Porównuj pakiety z kilku polskich lotnisk — różnice dostępności czarterów potrafią być duże.",
  ],
  Egipt: [
    "Hurghada, Marsa Alam i Sharm el-Sheikh nie są zamiennymi kierunkami — różnią się transferem, rafą i charakterem kurortów.",
    "Przy All Inclusive porównuj konkretny hotel, plażę, rafę i transfer, a nie tylko liczbę gwiazdek.",
    "Poza szczytem lata zwróć uwagę na wiatr i temperaturę wieczorem, nie tylko temperaturę w dzień.",
  ],
  Grecja: [
    "Wyspa lub region ma większe znaczenie niż sama etykieta „Grecja” — Kreta, Rodos i Peloponez dają inne tempo wyjazdu.",
    "Na krótszy pobyt wybieraj prosty transfer z lotniska; przy tygodniu można szerzej porównywać regiony.",
    "Poza wysokim sezonem sprawdzaj pogodę dla konkretnej wyspy i termin działania infrastruktury turystycznej.",
  ],
  Hiszpania: [
    "Kontynent, Baleary i Wyspy Kanaryjskie mają zupełnie inne warunki pogodowe w tym samym miesiącu.",
    "Na city break porównuj Barcelonę, Walencję, Sewillę i Madryt pod kątem godzin lotów, nie tylko ceny.",
    "Na zimowe słońce kieruj wyszukiwanie na Kanary zamiast ogólnego hasła „Hiszpania”.",
  ],
  Rzym: [
    "Przy 3–4 nocach hotel dobrze skomunikowany z centrum jest zwykle ważniejszy niż najniższa cena noclegu.",
    "Porównaj oba główne lotniska i koszt transferu do centrum przed wyborem najtańszego biletu.",
    "Wylot w czwartek lub powrót w poniedziałek często daje lepszy układ godzin niż klasyczny piątek–niedziela.",
  ],
  Barcelona: [
    "Barcelona łączy zwiedzanie i morze, więc warto wybrać dzielnicę pod plan wyjazdu, a nie tylko cenę hotelu.",
    "Sprawdź lotnisko przylotu i realny transfer do miasta — „Barcelona” w ofercie lotniczej nie zawsze oznacza BCN.",
    "Na 3–4 dni dobrze działa centralna baza; przy dłuższym pobycie można dołożyć wybrzeże lub okolice miasta.",
  ],
  Madera: [
    "Funchal jest wygodną bazą, ale trekkingi i punkty widokowe wymagają planu transportu.",
    "Pogoda potrafi różnić się między południem, północą i górami tego samego dnia.",
    "Jeśli celem są levady, sprawdź dojazd do szlaków przed wyborem hotelu.",
  ],
  Islandia: [
    "Przy polowaniu na zorzę zostaw elastyczność — widoczność zależy jednocześnie od chmur i aktywności słonecznej.",
    "Reykjavik może być bazą, ale wiele kluczowych atrakcji wymaga dalszego dojazdu lub objazdu.",
    "W zimie sprawdzaj długość dnia i warunki drogowe przed układaniem zbyt napiętego planu.",
  ],
  Japonia: [
    "Tokio, Kioto i Osaka warto łączyć koleją, ale przy krótszym wyjeździe lepiej ograniczyć liczbę baz.",
    "W sezonie sakury termin ma ogromne znaczenie — prognozy kwitnienia trzeba weryfikować bliżej wyjazdu.",
    "Porównuj nie tylko lot, ale też ceny noclegów w konkretnych miastach w danym tygodniu.",
  ],
};

function inferDestination(haystack: string) {
  return destinationRules.find((rule) => rule.terms.some((term) => haystack.includes(norm(term))))?.destination;
}

function inferDeparture(haystack: string) {
  return departureRules.find((rule) => rule.terms.some((term) => haystack.includes(norm(term))));
}

function inferDates(haystack: string) {
  if (haystack.includes("pazdziernik")) return { startDate: "2026-10-01", endDate: "2026-10-31" };
  if (haystack.includes("listopad")) return { startDate: "2026-11-01", endDate: "2026-11-30" };
  if (haystack.includes("grudzien")) return { startDate: "2026-12-01", endDate: "2026-12-31" };
  if (haystack.includes("sylwestr")) return { startDate: "2026-12-28", endDate: "2027-01-03" };
  if (haystack.includes("wrzesien")) return { startDate: "2026-09-14", endDate: "2026-09-30" };
  return {};
}

function inferMode(haystack: string): ArticleSearchMode {
  if (haystack.includes("last minute") || haystack.includes("last-minute")) return "lastminute";
  if (haystack.includes("city break") || haystack.includes("weekend")) return "city";
  if (haystack.includes("all inclusive") || haystack.includes("wakacje") || haystack.includes("cieplo") || haystack.includes("ciepło")) return "holiday";
  return "all";
}

export function getArticleContext(item: LegacyItem): ArticleContext {
  const haystack = norm(`${item.title} ${item.path} ${item.description || ""}`);
  const destination = inferDestination(haystack);
  const departure = inferDeparture(haystack);
  const dates = inferDates(haystack);
  const mode = inferMode(haystack);
  const weekendOnly = mode === "city" && (haystack.includes("weekend") || haystack.includes("city break"));
  const focusPoints = destinationFocus[destination || ""] || [
    destination
      ? `Wyszukiwanie poniżej jest ustawione na kierunek ${destination}, więc nie startujesz od pustego formularza.`
      : "Wyszukiwarka poniżej dziedziczy typ wyjazdu i termin z tego artykułu, jeśli artykuł je określa.",
    departure
      ? `Punktem startowym jest ${departure.departure}; możesz zmienić lotnisko jednym kliknięciem.`
      : "Jeśli nie wskazaliśmy lotniska w artykule, możesz dobrać je do swojego miejsca startu.",
    dates.startDate
      ? `Termin wyszukiwania odpowiada okresowi opisanemu w artykule: ${dates.startDate} – ${dates.endDate}.`
      : "Daty pozostają edytowalne, bo cena i dostępność zmieniają się dynamicznie.",
  ];

  const hasUsefulSearchContext = Boolean(destination || departure || dates.startDate || mode !== "all");
  const subject = destination ? destination : mode === "city" ? "city break" : mode === "lastminute" ? "last minute" : mode === "holiday" ? "wakacje" : "ten temat";

  return {
    destination,
    departure: departure?.departure,
    departureCode: departure?.code,
    mode,
    startDate: dates.startDate,
    endDate: dates.endDate,
    weekendOnly,
    searchTitle: destination ? `Sprawdź aktualne wyjazdy: ${destination}` : `Sprawdź aktualne opcje: ${subject}`,
    searchLead: destination
      ? `Nie zaczynasz od zera — ustawiliśmy wyszukiwarkę pod ${destination}${departure ? ` z wylotem z ${departure.departure}` : ""}${dates.startDate ? ` w terminie opisanym w artykule` : ""}. Wszystkie pola możesz zmienić.`
      : `Ustawiliśmy wyszukiwarkę zgodnie z intencją tego artykułu${dates.startDate ? " i jego terminem" : ""}. Parametry możesz dowolnie zmienić.`,
    focusTitle: destination ? `${destination}: co ma znaczenie przed rezerwacją` : "Co z tego artykułu przekłada się na wyszukiwanie",
    focusPoints,
    hasUsefulSearchContext,
  };
}
