import type { ArticleDeepDive } from "@/lib/articleDeepDive";

const wave25: Record<string, ArticleDeepDive> = {
  "/grecja": {
    kicker: "GRECJA 2026",
    title: "Którą grecką wyspę wybrać? Najpierw styl wyjazdu, potem hotel",
    quickAnswer: "Na pierwszy wyjazd najłatwiej wybrać Kretę albo Rodos. Kreta daje najwięcej różnorodności i najlepiej sprawdza się z autem, Rodos łączy plaże ze zwiedzaniem w kompaktowym formacie, Kos jest spokojniejszy, Korfu bardziej zielone, a Zakynthos wybiera się przede wszystkim dla widoków, zatok i rejsów.",
    sections: [
      {
        title: "Wyspa pod konkretny typ wakacji",
        table: {
          headers: ["Kierunek", "Najlepszy dla", "Na co uważać"],
          rows: [
            ["Kreta", "Pierwszy wyjazd, zwiedzanie, plaże, auto", "Wyspa jest duża — źle wybrana baza oznacza długie dojazdy"],
            ["Rodos", "Plaża + zabytki + łatwy tydzień", "W środku lata potrafi być bardzo gorąco"],
            ["Kos", "Spokojniejszy urlop, rowery, krótsze przejazdy", "Mniej różnorodna niż Kreta"],
            ["Korfu", "Zieleń, zatoki, pary i objazd wyspy", "Drogi bywają kręte, a przejazdy wolniejsze niż sugeruje dystans"],
            ["Zakynthos", "Widoki, rejsy, plaże, młodsze pary", "Najpopularniejsze miejsca warto oglądać poza godzinami szczytu"],
            ["Chalkidiki", "Plaża, rodziny, spokojniejsze wakacje", "Najwygodniej zaplanować transfer lub auto z Salonik"],
          ],
        },
      },
      {
        title: "All Inclusive czy hotel ze śniadaniem?",
        bullets: [
          "All Inclusive ma sens przy hotelu poza miejscowością, z dziećmi albo gdy większość czasu spędzasz przy plaży i basenie.",
          "Śniadania lub brak wyżywienia wygrywają, jeśli planujesz auto, tawerny i codzienne zwiedzanie.",
          "Nie porównuj samych gwiazdek — sprawdź położenie hotelu, typ plaży i realny czas transferu.",
        ],
      },
      {
        title: "Czy w Grecji jest inny czas niż w Polsce?",
        paragraphs: [
          "Tak. Grecja jest o 1 godzinę do przodu względem Polski. Gdy w Polsce jest 12:00, w Grecji jest 13:00.",
          "W 2026 oba kraje przechodzą na czas letni 29 marca i wracają na czas zimowy 25 października. Dzięki temu różnica czasu pozostaje taka sama przez cały rok: +1 godzina w Grecji.",
          "Przy planowaniu transferu, odbioru auta albo kontaktu z hotelem warto pamiętać, że godziny podawane przez greckie lotniska i obiekty są lokalne.",
        ],
      },
      {
        title: "Kiedy lecieć?",
        table: {
          headers: ["Termin", "Dla kogo", "Charakter wyjazdu"],
          rows: [
            ["Maj–czerwiec", "Zwiedzanie i spokojniejszy urlop", "Mniej tłumów, dobry moment na aktywny wyjazd"],
            ["Lipiec–sierpień", "Pewne lato i pełna infrastruktura", "Najgoręcej, najwięcej turystów i zwykle wyższe ceny"],
            ["Wrzesień", "Plaża bez szczytu wakacji", "Bardzo dobry balans temperatury morza i mniejszego tłoku"],
            ["Początek października", "Południowe wyspy i spokojny wypoczynek", "Sprawdzaj konkretną wyspę i hotel, bo sezon zaczyna się wygaszać"],
          ],
        },
      },
    ],
    checklist: [
      "Najpierw wybierz wyspę, dopiero potem hotel.",
      "Sprawdź odległość hotelu od lotniska i planowanych atrakcji.",
      "Jeśli planujesz zwiedzanie, policz koszt auta przed wyborem All Inclusive.",
      "Porównaj wyloty z co najmniej dwóch polskich lotnisk, jeśli masz taką możliwość.",
      "Przy rezerwacjach i transferach pamiętaj, że lokalny czas w Grecji jest o 1 godzinę późniejszy niż w Polsce.",
    ],
    faq: [
      { question: "Która grecka wyspa jest najlepsza na pierwszy raz?", answer: "Najbardziej uniwersalne są Kreta i Rodos. Kreta daje więcej różnorodności, a Rodos jest łatwiejsze do ogarnięcia przy tygodniowym pobycie." },
      { question: "Która wyspa jest najlepsza z dziećmi?", answer: "Najłatwiej znaleźć rodzinne hotele na Krecie, Rodos, Kos i Korfu. Ważniejszy od samej wyspy jest konkretny kurort, plaża i długość transferu." },
      { question: "Czy warto brać All Inclusive w Grecji?", answer: "Tak, jeśli hotel jest Twoją główną bazą wypoczynku. Jeśli chcesz często jeść w tawernach i jeździć po wyspie, lepiej rozważyć śniadania lub brak wyżywienia." },
      { question: "Czy w Grecji jest inny czas niż w Polsce?", answer: "Tak. Grecja jest przez cały rok o 1 godzinę do przodu względem Polski. W 2026 oba kraje zmieniają czas w tych samych dniach: 29 marca i 25 października." },
    ],
    searchPresets: ["Grecja", "Kreta", "Rodos", "Kos"],
    searchMode: "holiday",
  },
};

export function getArticleDeepDiveWave25(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return wave25[normalized];
}
