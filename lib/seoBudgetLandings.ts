import type { SeoLanding } from "@/lib/seoLandings";

export const seoBudgetLandings: SeoLanding[] = [
  {
    slug: "wyjazdy-do-1000-zl",
    title: "Wyjazdy do 1000 zł — tanie city breaki i okazje",
    eyebrow: "WYJAZDY DO 1000 ZŁ",
    lead: "Aktualne wyjazdy do 1000 zł za osobę: tanie city breaki, krótkie podróże i okazje z polskich lotnisk. Pokazujemy tylko propozycje mieszczące się w budżecie.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "tanio", "wakacje"],
    maxPrice: 1000,
    maxNights: 7,
    paragraphs: [
      "Przy budżecie do 1000 zł największą różnicę robi elastyczny termin, lotnisko wylotu i długość pobytu. Zamiast zaczynać od jednego miasta, warto porównać kilka kierunków dla tych samych dni.",
      "Tripownia pokazuje aktualne propozycje i prowadzi do partnera dopiero po wyborze konkretnej oferty. Przed rezerwacją sprawdź końcową cenę, bagaż, transfer i warunki noclegu."
    ],
  },
  {
    slug: "city-break-do-1500-zl",
    title: "City break do 1500 zł — lot + hotel i tanie weekendy",
    eyebrow: "CITY BREAK DO 1500 ZŁ",
    lead: "City break do 1500 zł za osobę: krótkie wyjazdy, lot + hotel i tanie weekendy z polskich lotnisk. Porównaj aktualne propozycje mieszczące się w budżecie.",
    query: "City break",
    categoryKeywords: ["city", "weekend", "tanio"],
    maxPrice: 1500,
    maxNights: 5,
    paragraphs: [
      "Budżet do 1500 zł daje większy wybór godzin lotów i lokalizacji noclegu niż najtańsze wyjazdy. Przy 2–5 dniach warto dopłacić do wariantu, który nie zabiera całego pierwszego lub ostatniego dnia.",
      "Porównuj pełny koszt lotu, bagażu, transferu i hotelu. Tani bilet do odległego lotniska może podnieść cenę całego city breaku bardziej niż lepszy nocleg bliżej centrum."
    ],
  },
  {
    slug: "wakacje-do-2000-zl",
    title: "Wakacje do 2000 zł — tanie wczasy z polskich lotnisk",
    eyebrow: "WAKACJE DO 2000 ZŁ",
    lead: "Wakacje do 2000 zł za osobę: aktualne pakiety, ciepłe kierunki i krótsze wczasy z polskich lotnisk. Sprawdź oferty mieszczące się w budżecie.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "tanio"],
    maxPrice: 2000,
    minNights: 4,
    paragraphs: [
      "Przy budżecie do 2000 zł największą różnicę robi elastyczność terminu i lotniska wylotu. Porównuj kilka kierunków równocześnie zamiast zaczynać od jednego kraju.",
      "Sprawdź, czy cena obejmuje bagaż, transfer i wyżywienie. Oferta nieco droższa na starcie może finalnie kosztować mniej, jeśli zawiera więcej elementów wyjazdu."
    ],
  },
  {
    slug: "wakacje-do-2500-zl",
    title: "Wakacje do 2500 zł — pakiety lot + hotel i wczasy",
    eyebrow: "WAKACJE DO 2500 ZŁ",
    lead: "Wakacje do 2500 zł za osobę: pakiety lot + hotel, wczasy i ciepłe kierunki z Polski. Porównaj aktualne ceny, liczbę nocy i zakres wyżywienia.",
    query: "Wakacje",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "allinclusive"],
    maxPrice: 2500,
    minNights: 5,
    paragraphs: [
      "Budżet do 2500 zł otwiera więcej tygodniowych wyjazdów i hoteli z wyżywieniem. Warto porównać kilka lotnisk i sąsiednie terminy, bo różnica kilku dni często mocno zmienia cenę.",
      "Przed rezerwacją sprawdź standard hotelu, transfer, bagaż i godziny lotów. To pozwala porównać realną wartość pakietu, a nie tylko cenę widoczną na liście."
    ],
  },
  {
    slug: "all-inclusive-do-2500-zl",
    title: "All Inclusive do 2500 zł — tanie wakacje z wyżywieniem",
    eyebrow: "ALL INCLUSIVE DO 2500 ZŁ",
    lead: "All Inclusive do 2500 zł za osobę: aktualne pakiety z lotem, hotelem i wyżywieniem. Porównaj najtańsze kierunki i terminy z polskich lotnisk.",
    query: "All Inclusive",
    categoryKeywords: ["allinclusive", "wakacje", "plaza", "cieplo"],
    maxPrice: 2500,
    minNights: 5,
    paragraphs: [
      "Przy All Inclusive do 2500 zł porównuj przede wszystkim pełny zakres pakietu. Dwie oferty w podobnej cenie mogą różnić się bagażem, transferem, standardem pokoju i zakresem napojów.",
      "Największą szansę na dobrą cenę daje elastyczność kierunku oraz terminu. Sprawdź również lokalne lotnisko wylotu, bo dojazd przez pół Polski potrafi zjeść oszczędność."
    ],
  },
  {
    slug: "all-inclusive-do-3000-zl",
    title: "All Inclusive do 3000 zł — wakacje z lotem i hotelem",
    eyebrow: "ALL INCLUSIVE DO 3000 ZŁ",
    lead: "All Inclusive do 3000 zł za osobę: wakacje z lotem, hotelem i pełnym wyżywieniem. Sprawdź aktualne pakiety z polskich lotnisk i porównaj pełny koszt.",
    query: "All Inclusive",
    categoryKeywords: ["allinclusive", "wakacje", "plaza", "cieplo"],
    maxPrice: 3000,
    minNights: 6,
    paragraphs: [
      "Budżet do 3000 zł daje większy wybór hoteli i tygodniowych pobytów. W tej półce warto bardziej patrzeć na jakość hotelu, plażę, transfer i godziny lotów niż na samą różnicę kilkudziesięciu złotych.",
      "Porównuj kilka krajów dla tego samego tygodnia i sprawdzaj końcową cenę u partnera. Dostępność oraz ceny pakietów mogą zmieniać się dynamicznie."
    ],
  }
];
