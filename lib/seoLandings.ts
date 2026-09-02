export type SeoLanding = {
  slug: string;
  title: string;
  eyebrow: string;
  lead: string;
  query: string;
  kiwiCode?: string;
  departure?: string;
  cityKeywords?: string[];
  categoryKeywords?: string[];
  maxPrice?: number;
  minNights?: number;
  maxNights?: number;
  paragraphs: string[];
};

export const seoLandings: SeoLanding[] = [
  {
    slug: "malta-z-warszawy",
    title: "Malta z Warszawy — city break i wakacje",
    eyebrow: "MALTA Z WARSZAWY",
    lead: "Aktualne propozycje na Maltę z Warszawy i Modlina. Najpierw pokazujemy oferty Tripownii, niżej loty, noclegi i pakiety u partnerów.",
    query: "Malta",
    kiwiCode: "MLA",
    departure: "Warszawa",
    cityKeywords: ["malta", "valletta"],
    maxNights: 7,
    paragraphs: [
      "Malta sprawdza się zarówno na 3–4 dni, jak i na pełny tydzień. Przy krótkim wyjeździe największe znaczenie mają godziny lotów i lokalizacja noclegu.",
      "Przy porównywaniu ofert sprawdź osobno sam lot, hotel oraz pakiet lot + hotel — najtańszy wariant nie zawsze jest ten sam."
    ],
  },
  {
    slug: "rzym-z-warszawy",
    title: "Rzym z Warszawy — city break",
    eyebrow: "RZYM Z WARSZAWY",
    lead: "Pomysły na krótki wyjazd do Rzymu z Warszawy: aktualne okazje, loty i noclegi w jednej ścieżce.",
    query: "Rzym",
    kiwiCode: "ROM",
    departure: "Warszawa",
    cityKeywords: ["rzym", "rome"],
    maxNights: 5,
    paragraphs: [
      "Na Rzym zwykle wystarczą 3–4 noce, jeśli hotel jest dobrze skomunikowany z centrum.",
      "Weekendowe terminy bywają droższe, dlatego warto porównać także wylot w czwartek lub powrót w poniedziałek."
    ],
  },
  {
    slug: "barcelona-z-warszawy",
    title: "Barcelona z Warszawy — city break",
    eyebrow: "BARCELONA Z WARSZAWY",
    lead: "Barcelona na kilka dni z Warszawy: oferty Tripownii, loty, hotele i pakiety lot + hotel.",
    query: "Barcelona",
    kiwiCode: "BCN",
    departure: "Warszawa",
    cityKeywords: ["barcelona"],
    maxNights: 5,
    paragraphs: [
      "Barcelona łączy city break z możliwością odpoczynku nad morzem, dlatego dobrze działa zarówno na 3, jak i 5 dni.",
      "Przed rezerwacją porównaj lotniska i koszt transferu — niska cena biletu może zostać zjedzona przez dojazd."
    ],
  },
  {
    slug: "cypr-z-warszawy",
    title: "Cypr z Warszawy — wakacje i krótki wyjazd",
    eyebrow: "CYPR Z WARSZAWY",
    lead: "Pafos, Larnaka i słoneczny Cypr z Warszawy. Sprawdź aktualne oferty oraz ceny lotów i noclegów.",
    query: "Cypr",
    kiwiCode: "PFO",
    departure: "Warszawa",
    cityKeywords: ["cypr", "pafos", "larnaka", "ayia napa"],
    paragraphs: [
      "Cypr ma długi sezon i dobrze sprawdza się także poza wakacyjnym szczytem.",
      "Przy tygodniowym wyjeździe warto porównać pakiet z biurem podróży z samodzielnie kupowanym lotem i hotelem."
    ],
  },
  {
    slug: "madera-z-warszawy",
    title: "Madera z Warszawy — loty i wakacje",
    eyebrow: "MADERA Z WARSZAWY",
    lead: "Madera z Warszawy: aktualne propozycje, loty i noclegi dla osób szukających aktywnego wyjazdu w łagodnym klimacie.",
    query: "Madera",
    kiwiCode: "FNC",
    departure: "Warszawa",
    cityKeywords: ["madera", "funchal"],
    paragraphs: [
      "Madera to kierunek całoroczny, ale pogoda różni się między wybrzeżem a górami.",
      "Przy planowaniu levad i trekkingów większe znaczenie niż All Inclusive ma dobra baza wypadowa oraz transport."
    ],
  },
  {
    slug: "teneryfa-z-warszawy",
    title: "Teneryfa z Warszawy — wakacje przez cały rok",
    eyebrow: "TENERYFA Z WARSZAWY",
    lead: "Teneryfa z Warszawy i Modlina: aktualne wakacje, loty oraz noclegi, szczególnie na jesień i zimę.",
    query: "Teneryfa",
    kiwiCode: "TFS",
    departure: "Warszawa",
    cityKeywords: ["teneryfa", "tenerife"],
    minNights: 5,
    paragraphs: [
      "Teneryfa jest jednym z najbardziej przewidywalnych pogodowo kierunków na zimowy urlop z Polski.",
      "Południe wyspy jest bardziej resortowe i słoneczne, północ daje bardziej lokalny klimat i zieleń."
    ],
  },
  {
    slug: "city-break-do-1000-zl",
    title: "City break do 1000 zł",
    eyebrow: "CITY BREAK DO 1000 ZŁ",
    lead: "Najtańsze krótkie wyjazdy z bazy Tripownii. Filtrujemy aktywne propozycje do 1000 zł za osobę.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxPrice: 1000,
    maxNights: 5,
    paragraphs: [
      "Przy budżecie do 1000 zł największą różnicę robi elastyczny termin i możliwość wylotu w środku tygodnia.",
      "Jeśli dziś nie ma dobrej karty cenowej, przejdź do wyszukiwarki lotów i posortuj wyniki od najniższej ceny."
    ],
  },
  {
    slug: "city-break-do-1500-zl",
    title: "City break do 1500 zł",
    eyebrow: "CITY BREAK DO 1500 ZŁ",
    lead: "Krótkie wyjazdy do 1500 zł za osobę — aktualne oferty Tripownii i szybkie porównanie partnerów.",
    query: "City break",
    categoryKeywords: ["city", "weekend"],
    maxPrice: 1500,
    maxNights: 5,
    paragraphs: [
      "Budżet do 1500 zł otwiera więcej kierunków i pozwala częściej wybrać lepiej położony hotel.",
      "Porównuj całkowity koszt: lot, bagaż, transfer i nocleg, a nie tylko pierwszą cenę z listy."
    ],
  },
  {
    slug: "all-inclusive-z-warszawy",
    title: "All Inclusive z Warszawy",
    eyebrow: "ALL INCLUSIVE Z WARSZAWY",
    lead: "Wakacje All Inclusive z wylotem z Warszawy — aktywne oferty, ciepłe kierunki i szybkie przejście do rezerwacji.",
    query: "All Inclusive",
    departure: "Warszawa",
    categoryKeywords: ["allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "W All Inclusive porównuj nie tylko cenę, ale także standard hotelu, godziny lotów i transfer.",
      "Wylot z Warszawy daje szeroki wybór czarterów, dlatego warto porównać kilka kierunków zamiast zaczynać od jednego kraju."
    ],
  },
  {
    slug: "egzotyka-zima",
    title: "Egzotyka zimą — gdzie lecieć?",
    eyebrow: "EGZOTYKA ZIMĄ",
    lead: "Tajlandia, Zanzibar, Malediwy, Sri Lanka, Wietnam i inne dalekie kierunki na polską zimę.",
    query: "Egzotyka",
    kiwiCode: "BKK",
    cityKeywords: ["tajlandia", "zanzibar", "malediwy", "sri lanka", "wietnam", "mauritius", "seszele", "bali"],
    categoryKeywords: ["egzotyka", "cieplo", "plaza"],
    minNights: 7,
    paragraphs: [
      "Przy dalekiej podróży warto patrzeć na sezon pogodowy, koszt transferów i długość pobytu, a nie tylko cenę biletu.",
      "Na zimę szczególnie dobrze sprawdzają się kierunki z porą suchą między listopadem a marcem."
    ],
  },
  {
    slug: "last-minute-z-warszawy",
    title: "Last Minute z Warszawy",
    eyebrow: "LAST MINUTE Z WARSZAWY",
    lead: "Aktualne wyjazdy last minute z Warszawy: wakacje, All Inclusive i słoneczne kierunki na najbliższe terminy.",
    query: "Last Minute",
    departure: "Warszawa",
    categoryKeywords: ["plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Last minute ma sens wtedy, gdy termin jest elastyczny i decyzję można podjąć szybko.",
      "Najlepiej porównywać kilka kierunków jednocześnie — ten sam tydzień może mieć bardzo różne ceny zależnie od dostępności czarterów."
    ],
  },
  {
    slug: "wakacje-z-krakowa",
    title: "Wakacje z Krakowa",
    eyebrow: "WAKACJE Z KRAKOWA",
    lead: "Wakacje i city breaki z Krakowa-Balic: aktywne propozycje Tripownii oraz wyszukiwanie u partnerów.",
    query: "Wakacje",
    departure: "Kraków",
    categoryKeywords: ["plaza", "cieplo", "city", "allinclusive"],
    paragraphs: [
      "Kraków daje dobry wybór zarówno tanich lotów, jak i wakacyjnych czarterów.",
      "Jeśli zależy Ci na konkretnej dacie, sprawdzaj równolegle gotowe pakiety i sam lot z osobnym noclegiem."
    ],
  },
];

export function getSeoLanding(slug: string) {
  return seoLandings.find(item => item.slug === slug);
}
