import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Sales SEO wave 41.
 * Destination + city break + lot/hotel intents. These pages use the same
 * commercial template as existing sales landings: offers first, SEO copy lower.
 */
export const seoSalesWave41: SeoLanding[] = [
  {
    slug: "city-break-rzym-lot-hotel",
    title: "Rzym city break — tani lot + hotel na 2–5 dni",
    eyebrow: "RZYM CITY BREAK / LOT + HOTEL",
    lead: "City break w Rzymie: porównaj tani lot + hotel na 2–5 dni, aktualne terminy i pełny koszt krótkiego wyjazdu do Włoch.",
    query: "Rzym",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Przy city breaku w Rzymie warto patrzeć na godziny lotów, lotnisko przylotu i lokalizację hotelu. Przy 2–5 dniach strata kilku godzin na dojazdy ma większe znaczenie niż niewielka różnica w cenie.",
      "Porównaj lot + hotel dla tego samego terminu i sprawdź pełny koszt z bagażem oraz transferem. Najlepszy wariant to ten, który daje najwięcej realnego czasu w mieście."
    ],
  },
  {
    slug: "city-break-bari-lot-hotel",
    title: "Bari city break — tani lot + hotel i Apulia na 2–5 dni",
    eyebrow: "BARI CITY BREAK / LOT + HOTEL",
    lead: "City break w Bari: porównaj tani lot + hotel na 2–5 dni i potraktuj Bari jako bazę do krótkiego wyjazdu po Apulii. Sprawdź aktualne ceny i terminy.",
    query: "Bari",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Bari sprawdza się zarówno jako samodzielny city break, jak i baza do Polignano a Mare, Monopoli czy Alberobello. Przy krótkim wyjeździe liczy się wygodny lot i nocleg blisko transportu.",
      "Porównaj gotowy wariant lot + hotel z osobnym lotem i noclegiem. Do ceny dolicz bagaż, dojazd z lotniska i ewentualne przejazdy po Apulii."
    ],
  },
  {
    slug: "city-break-malta-lot-hotel",
    title: "Malta city break — tani lot + hotel na 3–5 dni",
    eyebrow: "MALTA CITY BREAK / LOT + HOTEL",
    lead: "City break na Malcie: porównaj tani lot + hotel na 3–5 dni, aktualne terminy i noclegi z dobrym dojazdem do Valletty, Sliemy i St. Julian’s.",
    query: "Malta",
    categoryKeywords: ["city", "weekend", "cieplo", "lot-hotel"],
    minNights: 3,
    maxNights: 5,
    paragraphs: [
      "Przy krótkim pobycie na Malcie lokalizacja noclegu ma duży wpływ na wygodę. Valletta, Sliema i okolice St. Julian’s ułatwiają korzystanie z komunikacji i promów.",
      "Porównaj pełny koszt lotu, bagażu i hotelu oraz godzinę przylotu. Na 3–5 dni warto ograniczyć czas tracony na transfery i codzienne dojazdy."
    ],
  },
  {
    slug: "city-break-barcelona-lot-hotel",
    title: "Barcelona city break — tani lot + hotel na 2–5 dni",
    eyebrow: "BARCELONA CITY BREAK / LOT + HOTEL",
    lead: "City break w Barcelonie: porównaj tani lot + hotel na 2–5 dni, aktualne terminy i noclegi z dobrym dojazdem do centrum.",
    query: "Barcelona",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Przy krótkim wyjeździe do Barcelony sprawdź nie tylko cenę lotu, ale także lotnisko, transfer i położenie hotelu względem metra.",
      "Porównaj lot + hotel dla tych samych dat i policz pełny koszt z bagażem. Dobre godziny lotów mogą dać prawie cały dodatkowy dzień na miejscu."
    ],
  },
];
