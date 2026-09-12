import type { SeoLanding } from "@/lib/seoLandings";

export const seoGrowthLandings: SeoLanding[] = [
  {
    slug: "city-break-z-warszawy",
    title: "City break z Warszawy — krótki wyjazd samolotem",
    eyebrow: "CITY BREAK Z WARSZAWY",
    lead: "City break z Warszawy i Modlina: krótkie wyjazdy na 2–5 dni, aktualne ceny i szybkie porównanie ofert.",
    query: "City break",
    departure: "Warszawa",
    departureCode: "WAW",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Przy krótkim wyjeździe z Warszawy najbardziej liczą się godziny lotów, położenie hotelu i całkowity koszt dojazdów.",
      "Warto porównywać kilka miast dla tego samego terminu — różnica ceny może być większa niż różnica standardu noclegu."
    ],
  },
  {
    slug: "city-break-z-katowic",
    title: "City break z Katowic — weekend z Pyrzowic",
    eyebrow: "CITY BREAK Z KATOWIC",
    lead: "City break z Katowic-Pyrzowic: pomysły na 2–5 dni, aktualne oferty i szybkie porównanie cen.",
    query: "City break",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Katowice mają szeroki wybór połączeń na krótkie wyjazdy, dlatego warto zaczynać od terminu i budżetu, a dopiero później wybierać miasto.",
      "Do ceny lotu dolicz dojazd do Pyrzowic, bagaż oraz transfer na miejscu, żeby porównać realny koszt całego city breaku."
    ],
  },
  {
    slug: "city-break-z-gdanska",
    title: "City break z Gdańska — krótki wyjazd z Trójmiasta",
    eyebrow: "CITY BREAK Z GDAŃSKA",
    lead: "City break z Gdańska: krótkie wyjazdy na 2–5 dni, tanie loty i aktualne propozycje z wylotem z Trójmiasta.",
    query: "City break",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Z Gdańska dobrze sprawdzają się krótkie wypady do miast Europy Północnej i Zachodniej, ale najlepszy kierunek zależy od konkretnego terminu.",
      "Przy weekendzie szukaj lotów, które dają możliwie dużo czasu na miejscu zamiast wyłącznie najniższej ceny biletu."
    ],
  },
  {
    slug: "city-break-z-wroclawia",
    title: "City break z Wrocławia — weekend samolotem",
    eyebrow: "CITY BREAK Z WROCŁAWIA",
    lead: "City break z Wrocławia: aktualne propozycje na 2–5 dni, loty i noclegi na krótki wyjazd.",
    query: "City break",
    departure: "Wrocław",
    departureCode: "WRO",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Przy city breaku z Wrocławia warto porównać kilka kierunków na ten sam weekend, szczególnie gdy termin jest ważniejszy niż konkretne miasto.",
      "Najlepsza oferta łączy dobrą cenę z sensownymi godzinami lotów i noclegiem, z którego łatwo dotrzeć do centrum."
    ],
  },
  {
    slug: "wakacje-z-warszawy",
    title: "Wakacje z Warszawy — aktualne oferty",
    eyebrow: "WAKACJE Z WARSZAWY",
    lead: "Wakacje z Warszawy: aktualne pakiety, ciepłe kierunki, All Inclusive i wyjazdy z wylotem ze stolicy.",
    query: "Wakacje",
    departure: "Warszawa",
    departureCode: "WAW",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Warszawa daje największy wybór lotów i czarterów, dlatego dla jednego terminu warto zestawić kilka krajów oraz standardów hotelu.",
      "Porównuj pełny koszt wyjazdu, warunki bagażu, transfer i godziny lotów — dopiero wtedy widać, która oferta rzeczywiście jest najlepsza."
    ],
  },
  {
    slug: "wakacje-z-wroclawia",
    title: "Wakacje z Wrocławia — aktualne wyjazdy",
    eyebrow: "WAKACJE Z WROCŁAWIA",
    lead: "Wakacje z Wrocławia: aktualne oferty urlopowe, ciepłe kierunki i pakiety z wylotem z WRO.",
    query: "Wakacje",
    departure: "Wrocław",
    departureCode: "WRO",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Wylot z Wrocławia może mocno uprościć cały urlop, dlatego warto najpierw sprawdzić dostępność z lokalnego lotniska, zanim wybierzesz dojazd do innego miasta.",
      "Jeśli kilka kierunków ma podobną cenę, porównaj pogodę, jakość hotelu oraz długość realnego pobytu po uwzględnieniu godzin lotów."
    ],
  },
  {
    slug: "all-inclusive-z-gdanska",
    title: "All Inclusive z Gdańska — wakacje z Trójmiasta",
    eyebrow: "ALL INCLUSIVE Z GDAŃSKA",
    lead: "All Inclusive z Gdańska: aktualne pakiety wakacyjne z lotem, hotelem i wyżywieniem.",
    query: "All Inclusive",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Przy All Inclusive z Gdańska warto porównywać kilka ciepłych kierunków jednocześnie, bo dostępność czarterów mocno wpływa na cenę.",
      "Oprócz ceny sprawdź standard hotelu, odległość od plaży, transfer oraz zakres wyżywienia."
    ],
  },
  {
    slug: "all-inclusive-z-wroclawia",
    title: "All Inclusive z Wrocławia — aktualne wakacje",
    eyebrow: "ALL INCLUSIVE Z WROCŁAWIA",
    lead: "All Inclusive z Wrocławia: aktualne wakacje z lotem, hotelem i wyżywieniem na ciepłych kierunkach.",
    query: "All Inclusive",
    departure: "Wrocław",
    departureCode: "WRO",
    categoryKeywords: ["allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "All Inclusive z Wrocławia warto oceniać przez pryzmat całego pakietu, a nie tylko pierwszej ceny widocznej w wynikach.",
      "Porównaj hotel, bagaż, transfer, godziny lotów i pogodę dla danego terminu, szczególnie poza szczytem sezonu."
    ],
  },
  {
    slug: "last-minute-z-wroclawia",
    title: "Last Minute z Wrocławia — aktualne okazje",
    eyebrow: "LAST MINUTE Z WROCŁAWIA",
    lead: "Last minute z Wrocławia: aktualne wakacje, All Inclusive i ciepłe kierunki na najbliższe terminy.",
    query: "Last Minute",
    departure: "Wrocław",
    departureCode: "WRO",
    categoryKeywords: ["plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Last minute działa najlepiej przy elastycznym wyborze kierunku. Dla jednego tygodnia różnice między krajami mogą być bardzo duże.",
      "Sprawdź, czy cena obejmuje bagaż i transfer oraz ile pełnych dni rzeczywiście spędzisz na miejscu."
    ],
  },
  {
    slug: "tanie-loty-z-wroclawia",
    title: "Tanie loty z Wrocławia — okazje lotnicze",
    eyebrow: "TANIE LOTY Z WROCŁAWIA",
    lead: "Tanie loty z Wrocławia: aktualne okazje na weekend, city break i dłuższy wyjazd.",
    query: "Tanie loty",
    departure: "Wrocław",
    departureCode: "WRO",
    categoryKeywords: ["flight", "tanio", "city"],
    maxNights: 10,
    paragraphs: [
      "Przy tanich lotach z Wrocławia opłaca się porównywać kilka dat i kierunków, bo najniższe ceny często pojawiają się poza weekendowym szczytem.",
      "Do ceny biletu dolicz bagaż i transfer z lotniska docelowego, żeby ocenić prawdziwy koszt wyjazdu."
    ],
  },
  {
    slug: "wakacje-do-2000-zl",
    title: "Wakacje do 2000 zł — aktualne oferty",
    eyebrow: "WAKACJE DO 2000 ZŁ",
    lead: "Wakacje do 2000 zł za osobę: aktualne propozycje, ciepłe kierunki i pakiety, które mieszczą się w założonym budżecie.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "tanio"],
    maxPrice: 2000,
    minNights: 5,
    paragraphs: [
      "Przy budżecie do 2000 zł największe znaczenie ma elastyczność terminu i lotniska wylotu. Warto porównywać kilka kierunków naraz.",
      "Zwróć uwagę na to, co jest w cenie: wyżywienie, bagaż, transfer i długość pobytu mogą mocno zmienić wartość oferty."
    ],
  },
  {
    slug: "wakacje-do-2500-zl",
    title: "Wakacje do 2500 zł — sprawdź aktualne propozycje",
    eyebrow: "WAKACJE DO 2500 ZŁ",
    lead: "Wakacje do 2500 zł za osobę: aktualne oferty na urlop, All Inclusive i ciepłe kierunki.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "plaza", "cieplo"],
    maxPrice: 2500,
    minNights: 5,
    paragraphs: [
      "Budżet do 2500 zł daje większy wybór hoteli i kierunków, dlatego warto porównać standard zamiast automatycznie brać najtańszą kartę.",
      "Sprawdź też alternatywne lotniska wylotu — czasem niewielka zmiana miejsca startu otwiera znacznie lepszą ofertę."
    ],
  },
  {
    slug: "all-inclusive-do-2000-zl",
    title: "All Inclusive do 2000 zł — aktualne okazje",
    eyebrow: "ALL INCLUSIVE DO 2000 ZŁ",
    lead: "All Inclusive do 2000 zł za osobę: aktualne pakiety z lotem, hotelem i wyżywieniem.",
    query: "All Inclusive",
    categoryKeywords: ["allinclusive", "plaza", "cieplo", "tanio"],
    maxPrice: 2000,
    minNights: 5,
    paragraphs: [
      "W tym budżecie kluczowe są termin, lotnisko i aktualna dostępność czarterów. Warto sprawdzać kilka krajów zamiast jednego wybranego kierunku.",
      "Porównuj standard hotelu i zakres wyżywienia, bo dwie oferty o tej samej cenie mogą dawać bardzo różny komfort pobytu."
    ],
  },
  {
    slug: "city-break-z-poznania",
    title: "City break z Poznania — weekend samolotem",
    eyebrow: "CITY BREAK Z POZNANIA",
    lead: "City break z Poznania: krótkie wyjazdy na 2–5 dni, aktualne propozycje i loty z Ławicy.",
    query: "City break",
    departure: "Poznań",
    departureCode: "POZ",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxNights: 5,
    paragraphs: [
      "Przy krótkim wyjeździe z Poznania warto wybierać kierunki, które dają dobre godziny lotów i prosty dojazd z lotniska do centrum.",
      "Jeśli termin jest stały, porównaj kilka miast zamiast szukać tylko jednego — to zwykle najszybsza droga do dobrej ceny."
    ],
  },
  {
    slug: "wakacje-z-poznania",
    title: "Wakacje z Poznania — aktualne oferty",
    eyebrow: "WAKACJE Z POZNANIA",
    lead: "Wakacje z Poznania-Ławicy: aktualne wyjazdy, ciepłe kierunki i pakiety z lotem i hotelem.",
    query: "Wakacje",
    departure: "Poznań",
    departureCode: "POZ",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "allinclusive"],
    minNights: 5,
    paragraphs: [
      "Przy wakacjach z Poznania najpierw sprawdź terminy i budżet, a potem porównaj kilka dostępnych krajów i standardów hotelu.",
      "Wygodny lokalny wylot może być wart więcej niż minimalnie niższa cena z lotniska wymagającego kilku godzin dojazdu."
    ],
  },
];
