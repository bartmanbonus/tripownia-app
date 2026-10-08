import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Sales SEO wave 42.
 * Search Console-led overrides for commercial airport intents that are already
 * ranking on page one / top of page two and need stronger exact-match intent.
 */
export const seoSalesWave42: SeoLanding[] = [
  {
    slug: "last-minute-z-katowic",
    title: "Last Minute z Katowic 2026 — tanie wakacje i All Inclusive z KTW",
    eyebrow: "LAST MINUTE Z KATOWIC — AKTUALNE OFERTY",
    lead: "Last Minute z Katowic (KTW): aktualne wakacje, All Inclusive i pakiety lot + hotel z Pyrzowic. Porównaj ceny, terminy i przejdź do konkretnej oferty.",
    query: "Last Minute",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo"],
    minNights: 4,
    paragraphs: [
      "Szukając Last Minute z Katowic, porównuj kilka kierunków w tym samym tygodniu. Pyrzowice mają szeroką siatkę czarterów, więc największą przewagę daje elastyczny kierunek i szybkie porównanie pełnego kosztu.",
      "Sprawdź hotel, wyżywienie, bagaż, transfer i godziny lotów. Najtańszy pakiet nie zawsze daje najwięcej pełnych dni na miejscu."
    ],
  },
  {
    slug: "last-minute-z-krakowa",
    title: "Last Minute z Krakowa 2026 — oferty z KRK, lot + hotel i All Inclusive",
    eyebrow: "LAST MINUTE Z KRAKOWA — OFERTY Z BALIC",
    lead: "Last Minute z Krakowa (KRK): sprawdź aktualne oferty z Balic, lot + hotel i All Inclusive na najbliższe terminy. Porównaj ceny i wybierz konkretny wyjazd.",
    query: "Last Minute",
    departure: "Kraków",
    departureCode: "KRK",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo", "lot-hotel"],
    minNights: 4,
    paragraphs: [
      "Oferty Last Minute z Krakowa zmieniają się szybko, dlatego najwięcej sensu ma porównanie kilku kierunków dla tych samych dat zamiast polowania na jeden kraj.",
      "Porównaj pełny koszt pakietu z bagażem, transferem i wyżywieniem oraz rzeczywistą liczbę dni na miejscu po uwzględnieniu godzin lotów."
    ],
  },
  {
    slug: "city-break-z-gdanska",
    title: "City break z Gdańska 2026 — tanie loty + hotel z GDN",
    eyebrow: "CITY BREAK Z GDAŃSKA — AKTUALNE OFERTY",
    lead: "City break z Gdańska (GDN): aktualne tanie loty + hotel na 2–5 dni z Trójmiasta. Porównaj ceny, kierunki i terminy krótkich wyjazdów.",
    query: "City break",
    departure: "Gdańsk",
    departureCode: "GDN",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Przy city breaku z Gdańska liczy się nie tylko cena biletu, ale też godziny lotów, położenie hotelu i transfer. Na krótkim wyjeździe słaby rozkład potrafi zabrać dużą część pobytu.",
      "Porównaj kilka kierunków w tym samym terminie i wybierz wariant z najlepszym pełnym kosztem oraz największą liczbą godzin na miejscu."
    ],
  },
];
