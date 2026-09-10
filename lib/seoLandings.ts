export type SeoLanding = {
  slug: string;
  title: string;
  eyebrow: string;
  lead: string;
  query: string;
  kiwiCode?: string;
  departure?: string;
  departureCode?: string;
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "WAW",
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
    departureCode: "KRK",
    categoryKeywords: ["plaza", "cieplo", "city", "allinclusive"],
    paragraphs: [
      "Kraków daje dobry wybór zarówno tanich lotów, jak i wakacyjnych czarterów.",
      "Jeśli zależy Ci na konkretnej dacie, sprawdzaj równolegle gotowe pakiety i sam lot z osobnym noclegiem."
    ],
  },
  {
    slug: "tanie-loty-z-warszawy",
    title: "Tanie loty z Warszawy — okazje lotnicze",
    eyebrow: "TANIE LOTY Z WARSZAWY",
    lead: "Tanie loty z Warszawy i aktualne okazje lotnicze. Porównuj ceny na krótkie city breaki i dłuższe wyjazdy z wylotem ze stolicy.",
    query: "Tanie loty",
    departure: "Warszawa",
    departureCode: "WAW",
    categoryKeywords: ["flight", "tanio", "city"],
    maxNights: 10,
    paragraphs: [
      "Najtańsze bilety z Warszawy często pojawiają się poza piątkowym i niedzielnym szczytem. Warto porównywać kilka terminów oraz lotniska docelowe w tej samej okolicy.",
      "Przy tanim locie sprawdź od razu bagaż, dojazd z lotniska i godziny rejsu. Dopiero pełny koszt pokazuje, czy oferta naprawdę jest okazją."
    ],
  },
  {
    slug: "tanie-loty-z-krakowa",
    title: "Tanie loty z Krakowa — okazje lotnicze",
    eyebrow: "TANIE LOTY Z KRAKOWA",
    lead: "Tanie loty z Krakowa-Balic: aktualne okazje na city break, weekend i dłuższy wyjazd. Sprawdzaj kierunki i ceny w jednym miejscu.",
    query: "Tanie loty",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["flight", "tanio", "city"],
    maxNights: 10,
    paragraphs: [
      "Kraków ma szeroką siatkę połączeń europejskich, dlatego przy elastycznej dacie można znaleźć dobre ceny zarówno na południe Europy, jak i do dużych miast.",
      "Najlepiej porównywać lot w obie strony, bo bardzo tani wylot może łączyć się z drogim powrotem."
    ],
  },
  {
    slug: "tanie-loty-z-katowic",
    title: "Tanie loty z Katowic — okazje z Pyrzowic",
    eyebrow: "TANIE LOTY Z KATOWIC",
    lead: "Tanie loty z Katowic-Pyrzowic: okazje na city break, urlop i ciepłe kierunki. Porównaj aktualne ceny przed rezerwacją.",
    query: "Tanie loty",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["flight", "tanio", "city"],
    maxNights: 10,
    paragraphs: [
      "Katowice są mocnym lotniskiem zarówno dla tanich linii, jak i ruchu wakacyjnego. Dzięki temu warto porównywać sam lot z gotowym pakietem lot + hotel.",
      "Przy wyjeździe z Pyrzowic dolicz koszt dojazdu i parkingu, szczególnie przy bardzo wczesnym wylocie lub późnym powrocie."
    ],
  },
  {
    slug: "tanie-loty-z-gdanska",
    title: "Tanie loty z Gdańska — okazje lotnicze",
    eyebrow: "TANIE LOTY Z GDAŃSKA",
    lead: "Tanie loty z Gdańska: aktualne okazje na krótki wyjazd, weekend i wakacje. Szukaj cen z wylotem z Trójmiasta.",
    query: "Tanie loty",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["flight", "tanio", "city"],
    maxNights: 10,
    paragraphs: [
      "Z Gdańska łatwo zestawić kilka europejskich kierunków na ten sam termin, dlatego opłaca się szukać po cenie, a nie tylko po jednym wcześniej wybranym mieście.",
      "Dobra okazja lotnicza powinna mieć sens także po doliczeniu bagażu i transferu z lotniska docelowego."
    ],
  },
  {
    slug: "last-minute-z-krakowa",
    title: "Last Minute z Krakowa — aktualne wyjazdy",
    eyebrow: "LAST MINUTE Z KRAKOWA",
    lead: "Last minute z Krakowa-Balic: aktualne wakacje, All Inclusive i ciepłe kierunki na najbliższe terminy.",
    query: "Last Minute",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Przy last minute z Krakowa warto porównać kilka krajów jednocześnie. Dostępność czarterów potrafi mocno zmienić relację ceny do standardu hotelu.",
      "Najlepsze okazje mają konkretny termin, hotel i aktualną cenę — sama etykieta last minute nie oznacza automatycznie najtańszej opcji."
    ],
  },
  {
    slug: "last-minute-z-katowic",
    title: "Last Minute z Katowic — aktualne okazje",
    eyebrow: "LAST MINUTE Z KATOWIC",
    lead: "Last minute z Katowic-Pyrzowic: wakacje i All Inclusive z aktualnymi terminami oraz szybkim przejściem do sprawdzenia ceny.",
    query: "Last Minute",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Katowice mają rozbudowaną ofertę czarterową, dlatego przy last minute warto zestawiać Turcję, Grecję, Egipt, Tunezję i inne kierunki dostępne w tym samym tygodniu.",
      "Przed zakupem sprawdź godzinę lotu, bagaż, transfer oraz wyżywienie, bo te elementy potrafią istotnie zmienić realną wartość oferty."
    ],
  },
  {
    slug: "last-minute-z-gdanska",
    title: "Last Minute z Gdańska — wakacje na szybko",
    eyebrow: "LAST MINUTE Z GDAŃSKA",
    lead: "Last minute z Gdańska: aktualne oferty wakacyjne i All Inclusive na najbliższe terminy z wylotem z Trójmiasta.",
    query: "Last Minute",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Przy wylocie z Gdańska warto sprawdzać nie tylko najpopularniejsze kraje, ale także kierunki dostępne sezonowo, bo różnice cenowe bywają duże.",
      "Jeśli termin jest elastyczny o jeden lub dwa dni, porównaj sąsiednie daty — przy końcówce sprzedaży może to znacząco obniżyć cenę."
    ],
  },
  {
    slug: "all-inclusive-z-krakowa",
    title: "All Inclusive z Krakowa — wakacje z wylotem z Balic",
    eyebrow: "ALL INCLUSIVE Z KRAKOWA",
    lead: "All Inclusive z Krakowa: aktualne wakacje z wyżywieniem, lotem i hotelem. Porównuj ciepłe kierunki z wylotem z Balic.",
    query: "All Inclusive",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Przy All Inclusive z Krakowa porównuj nie tylko cenę za osobę, ale też standard hotelu, odległość od plaży i zakres wyżywienia.",
      "Jeżeli kilka kierunków mieści się w podobnym budżecie, wybór warto oprzeć na pogodzie w danym miesiącu i jakości konkretnego hotelu."
    ],
  },
  {
    slug: "all-inclusive-z-katowic",
    title: "All Inclusive z Katowic — wakacje z Pyrzowic",
    eyebrow: "ALL INCLUSIVE Z KATOWIC",
    lead: "All Inclusive z Katowic-Pyrzowic: aktualne pakiety wakacyjne z lotem, hotelem i wyżywieniem na popularnych kierunkach.",
    query: "All Inclusive",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Pyrzowice mają mocną ofertę wakacyjnych czarterów, dlatego przy All Inclusive łatwo porównać kilka krajów dla tego samego tygodnia.",
      "Najniższa cena nie zawsze daje najlepszą wartość — sprawdź oceny hotelu, transfer, bagaż i rzeczywiste godziny pobytu na miejscu."
    ],
  },
  {
    slug: "wakacje-z-katowic",
    title: "Wakacje z Katowic — oferty z Pyrzowic",
    eyebrow: "WAKACJE Z KATOWIC",
    lead: "Wakacje z Katowic-Pyrzowic: aktualne propozycje na urlop, All Inclusive i wyjazdy do ciepłych krajów.",
    query: "Wakacje",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["plaza", "cieplo", "allinclusive", "wakacje"],
    minNights: 5,
    paragraphs: [
      "Z Katowic dostępnych jest wiele kierunków typowo wakacyjnych, dlatego wyszukiwanie warto zaczynać od terminu i budżetu, a dopiero później zawężać kraj.",
      "Porównuj pełny pakiet i szczegóły świadczeń. Dwie oferty o podobnej cenie mogą różnić się bagażem, transferem i standardem pokoju."
    ],
  },
  {
    slug: "wakacje-z-gdanska",
    title: "Wakacje z Gdańska — aktualne oferty",
    eyebrow: "WAKACJE Z GDAŃSKA",
    lead: "Wakacje z Gdańska: aktualne propozycje urlopowe, All Inclusive i słoneczne kierunki z wylotem z Trójmiasta.",
    query: "Wakacje",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["plaza", "cieplo", "allinclusive", "wakacje"],
    minNights: 5,
    paragraphs: [
      "Wylot z Gdańska może być wygodniejszy niż dojazd do centralnej Polski, dlatego warto filtrować oferty bezpośrednio po lotnisku startowym.",
      "Przy wakacjach rodzinnych zwróć uwagę na godziny lotów, transfer i warunki dla dzieci, a nie wyłącznie na cenę widoczną na pierwszej karcie."
    ],
  },
  {
    slug: "city-break-z-krakowa",
    title: "City break z Krakowa — krótki wyjazd z Balic",
    eyebrow: "CITY BREAK Z KRAKOWA",
    lead: "City break z Krakowa: pomysły na 2–5 dni, tanie loty, noclegi i krótkie wyjazdy do europejskich miast.",
    query: "City break",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Przy city breaku z Krakowa największą różnicę robią godziny lotów. Wieczorny wylot i późny powrót mogą dać dodatkowy dzień bez kolejnej nocy w hotelu.",
      "Porównuj cenę biletu razem z noclegiem i dojazdem z lotniska. Najtańszy lot nie zawsze daje najtańszy cały wyjazd."
    ],
  },
];

export function getSeoLanding(slug: string) {
  return seoLandings.find(item => item.slug === slug);
}
