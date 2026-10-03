import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Sales-first SEO wave: high-intent budget pages that lead directly to offers.
 * These pages are intentionally commercial, not editorial.
 */
export const seoSalesWave29: SeoLanding[] = [
  {
    slug: "city-break-do-500-zl",
    title: "City break do 500 zł — najtańsze krótkie wyjazdy",
    eyebrow: "CITY BREAK DO 500 ZŁ",
    lead: "City break do 500 zł za osobę: najtańsze krótkie wyjazdy na 2–4 dni z polskich lotnisk. Sprawdź aktualne kierunki i ceny, które naprawdę mieszczą się w budżecie.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxPrice: 500,
    maxNights: 4,
    paragraphs: [
      "Przy budżecie do 500 zł liczy się elastyczność kierunku, terminu i lotniska. Najlepsza opcja może pojawić się poza klasycznym piątek–niedziela.",
      "Porównuj pełny koszt lotu, bagażu i transferu. Jeśli nie ma aktualnego trafienia do 500 zł, sprawdź próg do 700 lub 1000 zł zamiast wybierać przypadkową ofertę."
    ],
  },
  {
    slug: "city-break-do-700-zl",
    title: "City break do 700 zł — tanie loty + hotel na weekend",
    eyebrow: "CITY BREAK DO 700 ZŁ",
    lead: "City break do 700 zł za osobę: tanie loty + hotel, weekendy i krótkie wyjazdy na 2–5 dni. Porównaj aktualne propozycje z polskich lotnisk.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxPrice: 700,
    maxNights: 5,
    paragraphs: [
      "Przy city breaku do 700 zł warto porównać kilka miast dla tych samych dat. Dobra cena często pojawia się tam, gdzie akurat jest tani lot i niedrogi nocleg.",
      "Sprawdź godziny lotów, bagaż i transfer z lotniska do centrum. Najtańszy bilet nie zawsze daje najtańszy cały wyjazd."
    ],
  },
  {
    slug: "wakacje-do-1000-zl",
    title: "Wakacje do 1000 zł — tanie wyjazdy z Polski",
    eyebrow: "WAKACJE DO 1000 ZŁ",
    lead: "Wakacje do 1000 zł za osobę: tanie wyjazdy, krótkie pakiety i aktualne okazje z polskich lotnisk. Zobacz, co naprawdę mieści się w budżecie.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "tanio", "plaza", "cieplo"],
    maxPrice: 1000,
    minNights: 3,
    paragraphs: [
      "Budżet do 1000 zł najczęściej oznacza krótszy pobyt albo bardzo dobrą okazję. Elastyczny termin i lotnisko zwiększają szansę na znalezienie realnej oferty.",
      "Nie porównuj tylko ceny startowej. Sprawdź bagaż, transfer, wyżywienie i liczbę pełnych dni na miejscu."
    ],
  },
  {
    slug: "wakacje-do-1500-zl",
    title: "Wakacje do 1500 zł — tanie pakiety i Last Minute",
    eyebrow: "WAKACJE DO 1500 ZŁ",
    lead: "Wakacje do 1500 zł za osobę: tanie pakiety, Last Minute i ciepłe kierunki z polskich lotnisk. Porównaj aktualne ceny i terminy.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "lastminute", "tanio", "plaza", "cieplo"],
    maxPrice: 1500,
    minNights: 4,
    paragraphs: [
      "Przy budżecie do 1500 zł warto porównywać kilka krajów i lotnisk jednocześnie. Różnica kilku dni może zmienić cenę całego pakietu.",
      "Sprawdź pełny koszt z bagażem, transferem i wyżywieniem oraz końcową cenę u partnera przed rezerwacją."
    ],
  },
  {
    slug: "wakacje-do-3000-zl",
    title: "Wakacje do 3000 zł — All Inclusive i lot + hotel",
    eyebrow: "WAKACJE DO 3000 ZŁ",
    lead: "Wakacje do 3000 zł za osobę: All Inclusive, lot + hotel i tygodniowe wyjazdy z polskich lotnisk. Porównaj aktualne pakiety i pełny koszt.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "allinclusive", "plaza", "cieplo"],
    maxPrice: 3000,
    minNights: 5,
    paragraphs: [
      "Budżet do 3000 zł daje większy wybór tygodniowych pakietów, hoteli i wyżywienia. W tej półce warto mocniej patrzeć na jakość hotelu i godziny lotów.",
      "Porównuj kilka kierunków dla tego samego tygodnia. Niewielka różnica ceny może oznaczać dużo lepszy hotel, transfer albo więcej pełnych dni na miejscu."
    ],
  },
  {
    slug: "tanie-wycieczki-zagraniczne-do-1000-zl",
    title: "Tanie wycieczki zagraniczne do 1000 zł — aktualne okazje",
    eyebrow: "WYJAZDY ZA GRANICĘ DO 1000 ZŁ",
    lead: "Tanie wycieczki zagraniczne do 1000 zł za osobę: city breaki, krótkie wakacje i okazje z polskich lotnisk. Sprawdź aktualne propozycje.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "wakacje", "tanio"],
    maxPrice: 1000,
    maxNights: 7,
    paragraphs: [
      "Przy budżecie do 1000 zł najlepiej zaczynać od ceny i terminu, a dopiero potem wybierać kierunek. To zwiększa szansę na znalezienie realnej okazji.",
      "Sprawdź pełny koszt z bagażem, transferem i noclegiem. Tripownia pokazuje aktualne propozycje i prowadzi dalej do rezerwacji u partnera."
    ],
  },
];
