import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Sales SEO wave 34.
 * Budget intents with direct offer filtering. These pages reuse the unified
 * commercial landing template so SEO growth does not create thin or broken UX.
 */
export const seoSalesWave34: SeoLanding[] = [
  {
    slug: "city-break-do-1000-zl",
    title: "City break do 1000 zł — tani lot + hotel na 2–5 dni",
    eyebrow: "CITY BREAK DO 1000 ZŁ",
    lead: "City break do 1000 zł za osobę: tani lot + hotel, weekendy i krótkie wyjazdy na 2–5 dni. Porównaj aktualne kierunki i oferty mieszczące się w budżecie.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "tanio", "lot-hotel"],
    maxPrice: 1000,
    minNights: 2,
    maxNights: 5,
    paragraphs: [
      "Budżet do 1000 zł daje już większy wybór kierunków i godzin lotów niż najtańsze city breaki. Porównuj kilka miast dla tych samych dat, zamiast zaczynać od jednego kierunku.",
      "Sprawdź pełny koszt z bagażem, transferem i noclegiem. Przy krótkim wyjeździe sensowne godziny lotów i dobra lokalizacja hotelu często są warte więcej niż niewielka różnica w cenie."
    ],
  },
  {
    slug: "last-minute-do-3000-zl",
    title: "Last Minute do 3000 zł — wakacje, lot + hotel i All Inclusive",
    eyebrow: "LAST MINUTE DO 3000 ZŁ",
    lead: "Last Minute do 3000 zł za osobę: wakacje, lot + hotel i All Inclusive z polskich lotnisk. Porównaj aktualne kierunki, terminy i pełny koszt wyjazdu.",
    query: "Last Minute",
    categoryKeywords: ["lastminute", "wakacje", "allinclusive", "plaza", "cieplo"],
    maxPrice: 3000,
    minNights: 5,
    paragraphs: [
      "Przy budżecie do 3000 zł warto porównywać jakość hotelu, godziny lotów i zakres wyżywienia, a nie tylko najniższą cenę. Elastyczny kierunek nadal daje największą szansę na dobrą ofertę.",
      "Przed rezerwacją sprawdź bagaż, transfer, standard pokoju i faktyczną liczbę pełnych dni na miejscu. Cena i dostępność Last Minute mogą zmienić się do momentu finalnej rezerwacji."
    ],
  },
];
