import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Exact commercial-query overrides from Search Console.
 * Reuses existing URLs to avoid cannibalization.
 */
export const seoSalesWave32: SeoLanding[] = [
  {
    slug: "wakacje-z-poznania",
    title: "Wakacje z Poznania 2026 — tanie wakacje, Last Minute i All Inclusive",
    eyebrow: "WAKACJE Z POZNANIA / ŁAWICY",
    lead: "Wakacje z Poznania-Ławicy (POZ): tanie wakacje, Last Minute, All Inclusive i lot + hotel. Porównaj aktualne kierunki, ceny i terminy z lokalnym wylotem.",
    query: "Wakacje",
    departure: "Poznań",
    departureCode: "POZ",
    categoryKeywords: ["wakacje", "lastminute", "allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Wakacje z Poznania warto porównywać dla kilku kierunków w tym samym terminie. Lokalny wylot z Ławicy często wygrywa pełnym kosztem i wygodą nawet wtedy, gdy sama cena pakietu jest podobna.",
      "Sprawdź hotel, wyżywienie, bagaż, transfer i godziny lotów. Przy elastycznym terminie porównaj też Last Minute i All Inclusive z POZ."
    ],
  },
  {
    slug: "last-minute-z-gdanska",
    title: "Last Minute z Gdańska — tanie wakacje i All Inclusive z GDN",
    eyebrow: "LAST MINUTE Z GDAŃSKA / TRÓJMIASTA",
    lead: "Last Minute z Gdańska (GDN): tanie wakacje, All Inclusive i pakiety na najbliższe terminy z Trójmiasta. Porównaj aktualne ceny i kierunki.",
    query: "Last Minute",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Last Minute z Gdańska warto traktować jako osobny rynek cenowy. Dostępność czarterów z GDN potrafi mocno różnić się od Warszawy, Poznania czy Katowic.",
      "Porównaj kilka krajów dla tego samego tygodnia i sprawdź pełny koszt pakietu: bagaż, transfer, wyżywienie oraz faktyczną liczbę dni na miejscu."
    ],
  },
  {
    slug: "last-minute-z-wroclawia",
    title: "Last Minute z Wrocławia — tanie wakacje i All Inclusive z WRO",
    eyebrow: "LAST MINUTE Z WROCŁAWIA",
    lead: "Last Minute z Wrocławia (WRO): tanie wakacje, All Inclusive i ciepłe kierunki na najbliższe terminy. Porównaj aktualne pakiety z lokalnego lotniska.",
    query: "Last Minute",
    departure: "Wrocław",
    departureCode: "WRO",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Przy Last Minute z Wrocławia największą szansę na dobrą cenę daje elastyczny kierunek. Porównaj kilka krajów w tym samym tygodniu zamiast zaczynać od jednego hotelu.",
      "Sprawdź bagaż, transfer, wyżywienie i godziny lotów. Lokalny wylot z WRO może być bardziej opłacalny niż tańsza oferta wymagająca dalekiego dojazdu."
    ],
  },
  {
    slug: "all-inclusive-z-warszawy",
    title: "All Inclusive z Warszawy — tanie wakacje z wylotem WAW",
    eyebrow: "ALL INCLUSIVE Z WARSZAWY",
    lead: "All Inclusive z Warszawy (WAW): tanie wakacje z lotem, hotelem i wyżywieniem. Porównaj aktualne kierunki, ceny i terminy z Lotniska Chopina.",
    query: "All Inclusive",
    departure: "Warszawa",
    departureCode: "WAW",
    categoryKeywords: ["allinclusive", "wakacje", "plaza", "cieplo", "tanio"],
    minNights: 5,
    paragraphs: [
      "Warszawa daje szeroki wybór czarterów i pakietów All Inclusive, dlatego warto porównywać kilka kierunków dla tego samego tygodnia.",
      "Najniższa cena ma sens dopiero po sprawdzeniu hotelu, zakresu wyżywienia, bagażu, transferu i godzin lotów."
    ],
  },
  {
    slug: "all-inclusive-z-katowic",
    title: "All Inclusive wylot z Katowic — tanie wakacje z KTW",
    eyebrow: "ALL INCLUSIVE Z KATOWIC / PYRZOWIC",
    lead: "All Inclusive z wylotem z Katowic (KTW): tanie wakacje z lotem, hotelem i wyżywieniem z Pyrzowic. Porównaj aktualne ceny, kierunki i terminy.",
    query: "All Inclusive",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["allinclusive", "wakacje", "plaza", "cieplo", "tanio"],
    minNights: 5,
    paragraphs: [
      "Katowice mają szeroką siatkę czarterową, dlatego przy All Inclusive z KTW warto porównywać kilka krajów w tym samym terminie.",
      "Sprawdź standard hotelu, wyżywienie, transfer, bagaż i godziny lotów. Najtańszy pakiet nie zawsze daje najlepszy pełny koszt."
    ],
  },
];
