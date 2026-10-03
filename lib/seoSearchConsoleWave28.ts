import type { SeoLanding } from "@/lib/seoLandings";

/**
 * Landing pages selected from live Search Console demand (2026-09-01..2026-10-03).
 * These pages target commercial intents that were previously landing on broad
 * destination guides or generic hubs at positions ~18-40.
 */
export const seoSearchConsoleWave28: SeoLanding[] = [
  {
    slug: "wyspy-kanaryjskie-all-inclusive",
    title: "Wyspy Kanaryjskie All Inclusive — wakacje i Last Minute",
    eyebrow: "WYSPY KANARYJSKIE ALL INCLUSIVE",
    lead: "Wyspy Kanaryjskie All Inclusive: porównaj aktualne wakacje, Last Minute i pakiety na Teneryfę, Gran Canarię, Fuerteventurę i Lanzarote z polskich lotnisk.",
    query: "Wyspy Kanaryjskie",
    categoryKeywords: ["allinclusive", "wakacje", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Przy All Inclusive na Wyspach Kanaryjskich warto porównywać nie tylko hotel, ale też konkretną wyspę i region. Teneryfa, Gran Canaria, Fuerteventura i Lanzarote różnią się pogodą, plażami, transferami i stylem wypoczynku.",
      "Sprawdź pełny koszt pakietu z bagażem, transferem i wyżywieniem. Jeśli termin jest elastyczny, porównaj kilka wysp i lotnisk wylotu — różnica ceny potrafi być większa niż różnica standardu hotelu."
    ],
  },
  {
    slug: "malta-wakacje",
    title: "Malta wakacje — lot + hotel, pakiety i aktualne oferty",
    eyebrow: "MALTA WAKACJE",
    lead: "Malta na wakacje: porównaj lot + hotel, krótkie pakiety i dłuższe pobyty. Sprawdź aktualne ceny, terminy i oferty z polskich lotnisk.",
    query: "Malta",
    kiwiCode: "MLA",
    categoryKeywords: ["wakacje", "plaza", "cieplo", "city"],
    minNights: 4,
    maxNights: 10,
    paragraphs: [
      "Malta sprawdza się zarówno na krótki city break, jak i na tygodniowe wakacje. Przy dłuższym pobycie szczególnie ważna jest lokalizacja noclegu względem plaż, komunikacji i miejsc, które chcesz zwiedzać.",
      "Porównaj wariant lot + hotel z osobnym lotem i noclegiem. Do ceny dolicz bagaż oraz transfer z lotniska, bo przy podobnych cenach startowych pełny koszt wyjazdu może wyjść zupełnie inaczej."
    ],
  },
  {
    slug: "bulgaria-wakacje",
    title: "Bułgaria wakacje — All Inclusive, Last Minute i tanie oferty",
    eyebrow: "BUŁGARIA WAKACJE",
    lead: "Bułgaria na wakacje: aktualne All Inclusive, Last Minute i pakiety nad Morze Czarne. Porównaj ceny, hotele i lotniska wylotu.",
    query: "Bułgaria",
    categoryKeywords: ["wakacje", "allinclusive", "plaza", "cieplo", "tanio"],
    minNights: 5,
    paragraphs: [
      "Wakacje w Bułgarii warto porównywać między Słonecznym Brzegiem, Złotymi Piaskami i spokojniejszymi kurortami. Sama cena hotelu nie mówi jeszcze, ile wydasz na miejscu ani jak długi będzie transfer.",
      "Przy podobnych ofertach porównaj standard hotelu, zakres All Inclusive, odległość od plaży, godziny lotów i pełną liczbę dni wypoczynku."
    ],
  },
  {
    slug: "hiszpania-all-inclusive",
    title: "Hiszpania All Inclusive — wakacje, wyspy i aktualne oferty",
    eyebrow: "HISZPANIA ALL INCLUSIVE",
    lead: "Hiszpania All Inclusive: porównaj wakacje na kontynencie, Balearach i Wyspach Kanaryjskich. Sprawdź aktualne pakiety z polskich lotnisk.",
    query: "Hiszpania",
    categoryKeywords: ["allinclusive", "wakacje", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Hiszpania ma bardzo różne regiony wypoczynkowe, dlatego porównuj nie tylko cenę, ale też pogodę, lotnisko, transfer i charakter kurortu. Wyspy Kanaryjskie, Baleary i wybrzeże kontynentalne dają inny typ wyjazdu.",
      "W All Inclusive sprawdź dokładny zakres wyżywienia, opinie o hotelu, odległość od plaży i godziny lotów. Najtańsza cena startowa nie zawsze oznacza najniższy pełny koszt."
    ],
  },
  {
    slug: "wyspy-zielonego-przyladka-wakacje",
    title: "Wyspy Zielonego Przylądka wakacje — Sal, Boa Vista i All Inclusive",
    eyebrow: "WYSPY ZIELONEGO PRZYLĄDKA WAKACJE",
    lead: "Wyspy Zielonego Przylądka na wakacje: porównaj Sal i Boa Vista, All Inclusive oraz aktualne pakiety z polskich lotnisk.",
    query: "Wyspy Zielonego Przylądka",
    categoryKeywords: ["wakacje", "allinclusive", "plaza", "cieplo", "egzotyka"],
    minNights: 6,
    paragraphs: [
      "Przy wakacjach na Cabo Verde najpierw wybierz wyspę. Sal daje więcej infrastruktury wokół Santa Maria, a Boa Vista jest spokojniejsza i bardziej resortowa.",
      "Porównaj hotel, wyżywienie, transfer i godziny lotów. Przy dalekim kierunku pełny pakiet bywa wygodniejszy niż składanie podróży z osobnych elementów."
    ],
  },
  {
    slug: "wakacje-z-dziecmi-z-katowic",
    title: "Wakacje z dziećmi z Katowic — rodzinne All Inclusive z KTW",
    eyebrow: "WAKACJE Z DZIEĆMI Z KATOWIC",
    lead: "Wakacje z dziećmi z Katowic-Pyrzowic: porównaj rodzinne All Inclusive, hotele i ciepłe kierunki z wylotem z KTW.",
    query: "Wakacje",
    departure: "Katowice",
    departureCode: "KTW",
    categoryKeywords: ["wakacje", "allinclusive", "plaza", "cieplo"],
    minNights: 5,
    paragraphs: [
      "Przy rodzinnym wyjeździe z Katowic sprawdź przede wszystkim godziny lotów, długość transferu i warunki hotelu dla dzieci. Wygodny rozkład potrafi być ważniejszy niż niewielka różnica w cenie.",
      "Porównuj pełny koszt dla całej rodziny, w tym bagaż, transfer, wyżywienie i dopłaty za konkretny typ pokoju. Dzięki temu oferty są rzeczywiście porównywalne."
    ],
  },
];
