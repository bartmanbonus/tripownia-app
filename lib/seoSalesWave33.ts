import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Sales SEO wave 33.
 * Exact, high-intent landing overrides selected from live Search Console demand.
 * Later-wave definitions intentionally override earlier copies of the same slug.
 */
export const seoSalesWave33: SeoLanding[] = [
  {
    slug: "city-break-z-poznania",
    title: "City break z Poznania — tanie loty + hotel z POZ",
    eyebrow: "CITY BREAK Z POZNANIA / ŁAWICY",
    lead: "City break z Poznania (POZ): tanie loty + hotel na 2–5 dni, weekendy i krótkie wyjazdy z Ławicy. Porównaj aktualne kierunki, ceny i godziny lotów.",
    query: "City break",
    departure: "Poznań",
    departureCode: "POZ",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Przy city breaku z Poznania warto porównywać kilka kierunków dla tych samych dat. Lokalny wylot z Ławicy często wygrywa pełnym kosztem i wygodą nawet wtedy, gdy sam bilet z innego miasta jest odrobinę tańszy.",
      "Sprawdź godziny lotów, bagaż, transfer z lotniska i lokalizację hotelu. Przy pobycie 2–5 dni te elementy mają większy wpływ na wartość wyjazdu niż sama cena biletu."
    ],
  },
  {
    slug: "city-break-z-lublina",
    title: "City break z Lublina — tanie loty + hotel z LUZ",
    eyebrow: "CITY BREAK Z LUBLINA",
    lead: "City break z Lublina (LUZ): krótkie wyjazdy na 2–5 dni, tanie loty + hotel i weekendy z lokalnego lotniska. Sprawdź aktualne kierunki i ceny.",
    query: "City break",
    departure: "Lublin",
    departureCode: "LUZ",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Przy wylocie z Lublina największą przewagą jest wygoda lokalnego lotniska. Porównaj kilka kierunków i sąsiednie terminy zamiast zaczynać od jednego miasta.",
      "Na krótkim wyjeździe policz realne godziny na miejscu, dojazd z lotniska do centrum oraz pełny koszt z bagażem i noclegiem."
    ],
  },
  {
    slug: "city-break-z-gdanska",
    title: "City break z Gdańska — tanie loty + hotel z GDN",
    eyebrow: "CITY BREAK Z GDAŃSKA / TRÓJMIASTA",
    lead: "City break z Gdańska (GDN): tanie loty + hotel, weekendy i krótkie wyjazdy na 2–5 dni z Trójmiasta. Porównaj aktualne kierunki i ceny.",
    query: "City break",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "City break z Gdańska warto porównywać po pełnym koszcie i układzie lotów. Tani bilet nie zawsze oznacza dobry krótki wyjazd, jeśli tracisz pół dnia na niewygodne godziny.",
      "Porównaj kilka kierunków w tym samym terminie i sprawdź lokalizację hotelu względem centrum oraz transport z lotniska."
    ],
  },
  {
    slug: "city-break-z-krakowa",
    title: "City break z Krakowa — tanie loty + hotel z KRK",
    eyebrow: "CITY BREAK Z KRAKOWA / BALIC",
    lead: "City break z Krakowa (KRK): tanie loty + hotel, weekendy i krótkie wyjazdy na 2–5 dni z Balic. Porównaj aktualne kierunki, ceny i terminy.",
    query: "City break",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Kraków ma szeroki wybór bezpośrednich połączeń, dlatego przy city breaku warto porównywać kilka kierunków równocześnie i sortować je po pełnym koszcie.",
      "Sprawdź godziny wylotu i powrotu, bagaż oraz dojazd z lotniska docelowego. Przy 2–5 dniach lepszy rozkład potrafi być ważniejszy niż niewielka różnica w cenie."
    ],
  },
  {
    slug: "city-break-z-warszawy",
    title: "City break z Warszawy 2026 — tanie loty + hotel z WAW i WMI",
    eyebrow: "CITY BREAK Z WARSZAWY — AKTUALNE OFERTY",
    lead: "City break z Warszawy 2026: aktualne tanie loty + hotel na 2–5 dni z Lotniska Chopina i Modlina. Porównaj ceny, terminy i wybierz konkretny wyjazd.",
    query: "City break",
    departure: "Warszawa",
    departureCode: "WAW",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Szukasz city breaku z Warszawy? Zacznij od aktualnych ofert z Chopina i Modlina dla tych samych dat. Dzięki temu od razu porównasz realną cenę wyjazdu, a nie tylko sam bilet.",
      "Na 2–5 dni liczą się godziny lotów, hotel i transfer. Wybierz konkretną ofertę w Tripowni, sprawdź szczegóły i dopiero potem przejdź do rezerwacji u partnera."
    ],
  },
  {
    slug: "last-minute-z-poznania",
    title: "Last Minute z Poznania — tanie wakacje i All Inclusive z POZ",
    eyebrow: "LAST MINUTE Z POZNANIA / ŁAWICY",
    lead: "Last Minute z Poznania (POZ): tanie wakacje, All Inclusive i pakiety lot + hotel na najbliższe terminy z Ławicy. Porównaj aktualne kierunki i ceny.",
    query: "Last Minute",
    departure: "Poznań",
    departureCode: "POZ",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo"],
    minNights: 4,
    paragraphs: [
      "Last Minute z Poznania warto porównywać między kilkoma krajami w tym samym tygodniu. Przy elastycznym kierunku łatwiej znaleźć realną obniżkę ceny.",
      "Sprawdź pełny koszt pakietu z bagażem, transferem i wyżywieniem oraz faktyczną liczbę pełnych dni na miejscu."
    ],
  },
  {
    slug: "last-minute-z-krakowa",
    title: "Last Minute z Krakowa 2026 — tanie wakacje i All Inclusive z KRK",
    eyebrow: "LAST MINUTE Z KRAKOWA — AKTUALNE OFERTY",
    lead: "Last Minute z Krakowa (KRK): aktualne tanie wakacje, All Inclusive i pakiety lot + hotel z Balic. Porównaj ceny i przejdź do konkretnej oferty.",
    query: "Last Minute",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo"],
    minNights: 4,
    paragraphs: [
      "Last Minute z Krakowa ma sens wtedy, gdy porównujesz kilka dostępnych kierunków dla tego samego terminu. Tripownia pokazuje aktualne pakiety z KRK i prowadzi do konkretnej oferty, nie do pustej wyszukiwarki.",
      "Przed rezerwacją sprawdź cenę całego pakietu, hotel, wyżywienie, bagaż i transfer. Przy podobnej cenie lokalny wylot z Balic zwykle wygrywa czasem i wygodą."
    ],
  },
];
