import type { ArticleDeepDive } from "@/lib/articleDeepDive";

const wave8: Record<string, ArticleDeepDive> = {
  "/hiszpania": {
    kicker: "HISZPANIA 2026",
    title: "Gdzie do Hiszpanii nad morze? Najpierw wybierz region, nie hotel",
    quickAnswer: "Costa del Sol i Costa Blanca są najbardziej uniwersalne na klasyczny wypoczynek, Majorka daje dobry miks plaż i zwiedzania, a Wyspy Kanaryjskie wygrywają poza sezonem letnim. Jeśli jedziesz głównie zwiedzać, Barcelona, Walencja i Sewilla powinny być traktowane jako osobne city breaki, nie jako zamiennik wakacji nad morzem.",
    sections: [
      {
        title: "Region Hiszpanii pod konkretny typ wyjazdu",
        table: {
          headers: ["Region", "Najlepszy dla", "Co warto wiedzieć"],
          rows: [
            ["Costa del Sol", "Plaża + miasta + wycieczki", "Dobra baza do Malagi, Marbelli, Rondy i Andaluzji"],
            ["Costa Blanca", "Klasyczne wakacje i rodziny", "Dużo kurortów, szeroki wybór apartamentów i hoteli"],
            ["Majorka", "Plaże + auto + krótki urlop", "Najwięcej zyskujesz, jeśli wyjedziesz poza jeden kurort"],
            ["Teneryfa / Gran Canaria", "Słońce jesienią i zimą", "Lepszy wybór poza sezonem kontynentalnej Hiszpanii"],
            ["Costa Brava", "Barcelona + morze", "Dobra przy połączeniu miasta z kilkoma dniami na wybrzeżu"],
          ],
        },
      },
      {
        title: "Południowe wybrzeże Hiszpanii — czego nie wrzucać do jednego worka",
        bullets: [
          "Malaga i okolice dobrze łączą plażę ze zwiedzaniem Andaluzji.",
          "Alicante i Costa Blanca są prostsze, jeśli chcesz typowych wakacji nad morzem.",
          "Almeria i część mniej znanych kurortów mogą być spokojniejsze, ale mają mniejszy wybór połączeń i atrakcji.",
          "Jeśli lecisz zimą, porównaj kontynent z Kanarami zamiast patrzeć na ogólną etykietę „Hiszpania”.",
        ],
      },
      {
        title: "City break czy wakacje?",
        paragraphs: ["Barcelona, Sewilla, Madryt i Walencja mają sens jako osobne krótkie wyjazdy. Jeśli priorytetem jest morze, filtruj wyniki po konkretnym regionie lub wyspie zamiast po całej Hiszpanii."],
      },
    ],
    checklist: [
      "Wybierz region pod porę roku.",
      "Sprawdź odległość lotniska od kurortu.",
      "Jeśli planujesz auto, porównaj koszt parkingu przy hotelu.",
      "Na zimowy wyjazd sprawdź Kanary osobno, nie tylko kontynent.",
    ],
    faq: [
      { question: "Gdzie najlepiej do Hiszpanii nad morze na pierwszy raz?", answer: "Najbardziej uniwersalne są Costa del Sol, Costa Blanca i Majorka. Wybór zależy od tego, czy chcesz więcej zwiedzania, czy klasycznego wypoczynku." },
      { question: "Gdzie w Hiszpanii jest najcieplej zimą?", answer: "Jeśli zależy Ci na zimowym słońcu, w pierwszej kolejności porównuj Wyspy Kanaryjskie zamiast kontynentalnej Hiszpanii." },
      { question: "Czy Barcelona jest dobrym kierunkiem na wakacje plażowe?", answer: "Barcelona ma plaże, ale jest przede wszystkim dużym miastem. Na typowy wypoczynek nad morzem lepiej rozważyć wybrzeże poza centrum lub osobny kurort." },
    ],
    searchPresets: ["Hiszpania", "Majorka", "Teneryfa", "Alicante"],
    searchMode: "holiday",
  },

  "/wietnam": {
    kicker: "WIETNAM 2026",
    title: "Hanoi nie jest kierunkiem plażowym — Wietnam trzeba planować regionami",
    quickAnswer: "Hanoi wybierz na kulturę, jedzenie i północ kraju, nie na plażę. Jeśli chcesz połączyć Wietnam z morzem, porównuj osobno środkowe wybrzeże w rejonie Da Nang i Hoi An, wyspy na południu albo dłuższy plan z przelotem krajowym. Jedna wyszukiwarka ustawiona wyłącznie na Hanoi nie odpowiada na potrzeby osoby szukającej plaży.",
    sections: [
      {
        title: "Który region Wietnamu do czego?",
        table: {
          headers: ["Region", "Najlepszy dla", "Charakter wyjazdu"],
          rows: [
            ["Hanoi i północ", "Kultura, kuchnia, miasta, zatoki i góry", "Intensywne zwiedzanie, dobry początek dłuższej trasy"],
            ["Da Nang / Hoi An", "Zwiedzanie + plaża", "Najłatwiejszy kompromis między miastem, historią i morzem"],
            ["Ho Chi Minh City", "Miasto + południe kraju", "Dobra baza do dalszego planu, nie typowy kierunek plażowy"],
            ["Phu Quoc", "Plaża i wypoczynek", "Lepszy wybór, jeśli chcesz zakończyć trasę spokojniejszym pobytem nad morzem"],
          ],
        },
      },
      {
        title: "Najczęstszy błąd: szukanie „plaży w Hanoi”",
        paragraphs: ["Hanoi leży w głębi lądu. Jeśli plaża jest priorytetem, potraktuj Hanoi jako część objazdu, a nie jako bazę wypoczynkową. W praktyce warto budować trasę z osobnym odcinkiem nad morzem lub przelotem krajowym."],
      },
      {
        title: "Ile czasu warto przeznaczyć?",
        bullets: [
          "7–9 dni: wybierz maksymalnie dwa regiony.",
          "10–14 dni: można sensownie połączyć północ ze środkowym lub południowym Wietnamem.",
          "Powyżej 14 dni: objazd kilku regionów zaczyna być realny bez codziennego pakowania walizki.",
        ],
      },
    ],
    checklist: [
      "Zdecyduj, czy priorytetem jest objazd czy plaża.",
      "Nie planuj całego kraju jak jednego klimatu — pogoda różni się regionalnie.",
      "Przy kilku regionach porównaj przeloty krajowe z przejazdami lądowymi.",
      "Sprawdź warunki wjazdu i dokumenty bezpośrednio przed podróżą.",
    ],
    faq: [
      { question: "Czy Hanoi ma plaże?", answer: "Nie jest to kierunek plażowy. Hanoi warto wybrać na zwiedzanie północy, a plażę zaplanować jako osobny etap wyjazdu." },
      { question: "Gdzie pojechać w Wietnamie na plażę?", answer: "Popularne opcje to okolice Da Nang i Hoi An oraz wyspy na południu, np. Phu Quoc. Najlepszy wybór zależy od terminu podróży." },
      { question: "Czy warto łączyć Hanoi z plażą w jednym wyjeździe?", answer: "Tak, szczególnie przy podróży około 10–14 dni. Warto jednak potraktować to jako dwa różne etapy i zaplanować logistykę między nimi." },
    ],
    searchPresets: ["Wietnam", "Da Nang", "Phu Quoc"],
    searchMode: "all",
  },

  "/cypr": {
    kicker: "CYPR 2026",
    title: "Cypr: Pafos, Larnaka czy Ayia Napa? Wybór bazy zmienia cały wyjazd",
    quickAnswer: "Pafos wybierz, jeśli chcesz łączyć plażę ze zwiedzaniem i autem. Larnaka jest wygodna na krótszy wyjazd i dobrą logistykę. Ayia Napa i Protaras są mocniejsze plażowo, a Limassol ma bardziej miejski charakter i sprawdza się jako baza do objazdu wyspy.",
    sections: [
      {
        title: "Gdzie nocować na Cyprze?",
        table: {
          headers: ["Baza", "Najlepsza dla", "Charakter"],
          rows: [
            ["Pafos", "Pierwszy wyjazd, zwiedzanie, pary", "Zabytki, wybrzeże, dobra baza na zachodni Cypr"],
            ["Larnaka", "Krótki pobyt i wygodna logistyka", "Miasto przy lotnisku, dobry punkt startowy"],
            ["Ayia Napa / Protaras", "Plaże i wakacyjny klimat", "Najmocniejsze, jeśli priorytetem jest morze i wypoczynek"],
            ["Limassol", "Miasto + objazd", "Centralne położenie, restauracje i dobra baza do jazdy po wyspie"],
          ],
        },
      },
      {
        title: "Cypr na 4 dni czy tydzień?",
        bullets: [
          "3–4 dni: wybierz jedną bazę i nie próbuj objechać całej wyspy.",
          "7 dni: możesz połączyć plażę z kilkoma wycieczkami i wynajmem auta.",
          "10+ dni: sens ma podział pobytu na dwie części wyspy, jeśli nie chcesz codziennie wracać tą samą trasą.",
        ],
      },
      {
        title: "Kiedy Cypr ma największy sens?",
        paragraphs: ["Cypr ma długi sezon, ale poza latem planuj wyjazd pod konkretny cel. Wiosną i jesienią świetnie łączy się zwiedzanie z przyjemną pogodą; przy nastawieniu wyłącznie na plażę warto sprawdzać warunki dla konkretnego tygodnia."],
      },
    ],
    checklist: [
      "Wybierz lotnisko i bazę jako jeden zestaw logistyczny.",
      "Przy krótkim wyjeździe nie zmieniaj hotelu bez potrzeby.",
      "Jeśli planujesz auto, pamiętaj o ruchu lewostronnym.",
      "Poza szczytem lata sprawdź pogodę dla konkretnego regionu i tygodnia.",
    ],
    faq: [
      { question: "Pafos czy Larnaka na pierwszy raz?", answer: "Pafos jest lepsze, jeśli chcesz więcej zwiedzania i wycieczek po zachodniej części wyspy. Larnaka wygrywa prostą logistyką i sprawdza się na krótszy pobyt." },
      { question: "Gdzie są najlepsze plaże na Cyprze?", answer: "Jeśli plaża jest priorytetem, najczęściej warto porównać Ayia Napę i Protaras." },
      { question: "Czy na Cyprze warto wynająć auto?", answer: "Przy tygodniu i chęci zwiedzania — tak. Przy krótkim city breaku w jednej bazie nie zawsze jest potrzebne." },
    ],
    searchPresets: ["Cypr", "Pafos", "Larnaka"],
    searchMode: "holiday",
  },

  "/albania": {
    kicker: "ALBANIA 2026",
    title: "Albania: Saranda, Ksamil, Vlora czy Durrës? Dobierz kurort do stylu wyjazdu",
    quickAnswer: "Saranda i Ksamil są najlepsze, jeśli priorytetem są widoki, zatoki i południe kraju. Vlora jest bardziej uniwersalna i dobrze łączy morze z objazdem, a Durrës wygrywa prostszym dojazdem z Tirany i dużą bazą hotelową. Albania nie jest jednym kurortem — wybór regionu mocno zmienia całe wakacje.",
    sections: [
      {
        title: "Który kurort wybrać?",
        table: {
          headers: ["Miejsce", "Najlepsze dla", "Na co uważać"],
          rows: [
            ["Saranda", "Pary, widoki, południe Albanii", "W sezonie jest tłoczno, a dojazd z lotniska w Tiranie jest dłuższy"],
            ["Ksamil", "Plaże i turkusowa woda", "Bardzo popularny w szczycie sezonu; nie wybieraj w ciemno hotelu bez sprawdzenia dojścia do plaży"],
            ["Vlora", "Miks plaży, miasta i wycieczek", "Dobra opcja dla osób, które chcą więcej niż sam resort"],
            ["Durrës", "Prostsza logistyka i rodziny", "Łatwiejszy transfer, ale krajobrazowo inny klimat niż południe kraju"],
            ["Himarë / Dhermi", "Spokojniejsze zatoki i road trip", "Najlepiej sprawdzają się przy aucie i bardziej samodzielnym planie"],
          ],
        },
      },
      {
        title: "Pakiet czy wyjazd na własną rękę?",
        bullets: [
          "Pakiet dobrze działa przy Durrës i części większych hoteli, jeśli zależy Ci na prostym urlopie.",
          "Południe Albanii dużo zyskuje przy samodzielnym planie, aucie lub łączeniu kilku miejsc.",
          "Przy Sarandzie i Ksamilu koniecznie sprawdź realny transfer i czas dojazdu, nie tylko cenę hotelu.",
        ],
      },
      {
        title: "Dla kogo Albania ma największy sens?",
        paragraphs: ["To dobry kierunek dla osób, które chcą morza, lokalnych restauracji i trochę bardziej samodzielnego wyjazdu. Jeśli oczekujesz zamkniętego resortu z bardzo rozbudowanym All Inclusive, porównaj Albanię także z Turcją lub Egiptem."],
      },
    ],
    checklist: [
      "Najpierw wybierz region, potem hotel.",
      "Sprawdź transfer z lotniska do konkretnego kurortu.",
      "Jeśli chcesz południe kraju, rozważ auto lub dobrze zaplanowany transport.",
      "W szczycie sezonu rezerwuj popularne plaże i noclegi wcześniej.",
    ],
    faq: [
      { question: "Saranda czy Durrës?", answer: "Saranda wygrywa widokami i południem kraju, Durrës prostszą logistyką i krótszym transferem z Tirany." },
      { question: "Czy Ksamil jest dobry na cały tydzień?", answer: "Tak, jeśli plaża jest głównym celem. Przy tygodniu warto jednak dołożyć Sarandę, Butrint lub inne miejsca południa, żeby nie ograniczać wyjazdu do jednej zatoki." },
      { question: "Czy Albania nadaje się na All Inclusive?", answer: "Tak, ale wybór i standard są bardziej nierówne niż w Turcji czy Egipcie. Warto patrzeć na konkretny hotel i zakres świadczeń, nie tylko etykietę All Inclusive." },
    ],
    searchPresets: ["Albania", "Saranda", "Vlora"],
    searchMode: "holiday",
  },

  "/gdzie-poleciec-na-weekend-z-polski-12-pomyslow-na-city-break": {
    kicker: "CITY BREAK 2026",
    title: "Gdzie polecieć na weekend? Najpierw policz realny czas na miejscu",
    quickAnswer: "Najlepszy city break to nie zawsze najtańszy bilet. Przy 2–4 dniach bardziej liczą się godziny lotów, szybki transfer z lotniska i położenie hotelu. Dobra oferta daje dwa pełne dni na miejscu; zła potrafi zamienić weekend w jedną noc i dwa transfery.",
    sections: [
      {
        title: "Jak wybierać kierunek na 2–4 dni",
        table: {
          headers: ["Priorytet", "Szukaj", "Unikaj"],
          rows: [
            ["Maksimum czasu", "Wylot rano / po pracy i powrót wieczorem", "Lotów, które zabierają pół dnia pobytu"],
            ["Niski koszt", "Lotniska z tanim i szybkim transferem do centrum", "Biletu za 99 zł z transferem droższym od lotu"],
            ["Bez auta", "Miast z dobrym transportem publicznym", "Kurortów wymagających długich dojazdów"],
            ["Pierwszy city break", "Rzym, Wiedeń, Praga, Budapeszt, Malta", "Zbyt napiętego planu z kilkoma miastami"],
          ],
        },
      },
      {
        title: "Weekend z Polski — filtr, który ma znaczenie",
        bullets: [
          "Najpierw wybierz lotnisko wylotu i dokładny weekend.",
          "Porównaj kilka miast dla tych samych dat, zamiast przywiązywać się do jednego kierunku.",
          "Sprawdź czas dojazdu z lotniska docelowego do centrum.",
          "Dolicz bagaż i lokalny transport przed porównaniem cen.",
        ],
      },
      {
        title: "Kiedy city break przestaje być tani?",
        paragraphs: ["Najczęściej wtedy, gdy tani bilet wymusza drogie lotnisko, nocleg daleko od centrum albo dodatkowy dzień urlopu. Tripownia powinna porównywać cały układ wyjazdu, nie samą cenę lotu."],
      },
    ],
    checklist: [
      "Ustaw konkretny weekend.",
      "Wybierz lotnisko startowe.",
      "Sprawdź godzinę przylotu i powrotu.",
      "Porównaj koszt lot + hotel + transfer.",
    ],
    faq: [
      { question: "Ile dni wystarczy na city break?", answer: "Najczęściej 2–4 noce. Przy dobrych godzinach lotów trzy noce mogą dać prawie cztery dni na miejscu." },
      { question: "Co jest ważniejsze: tani lot czy hotel w centrum?", answer: "Przy krótkim wyjeździe często hotel w dobrej lokalizacji. Oszczędność na noclegu może zniknąć przez codzienne dojazdy i stracony czas." },
      { question: "Jak znaleźć tani city break?", answer: "Porównuj kilka kierunków dla jednego terminu i jednego lotniska wylotu. Elastyczność celu podróży zwykle daje więcej niż polowanie na jeden konkretny city break." },
    ],
    searchMode: "city",
  },
};

export function getArticleDeepDiveWave8(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return wave8[normalized];
}
