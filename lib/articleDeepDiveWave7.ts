import type { ArticleDeepDive } from "@/lib/articleDeepDive";

const wave7: Record<string, ArticleDeepDive> = {
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
    ],
    faq: [
      { question: "Która grecka wyspa jest najlepsza na pierwszy raz?", answer: "Najbardziej uniwersalne są Kreta i Rodos. Kreta daje więcej różnorodności, a Rodos jest łatwiejsze do ogarnięcia przy tygodniowym pobycie." },
      { question: "Która wyspa jest najlepsza z dziećmi?", answer: "Najłatwiej znaleźć rodzinne hotele na Krecie, Rodos, Kos i Korfu. Ważniejszy od samej wyspy jest konkretny kurort, plaża i długość transferu." },
      { question: "Czy warto brać All Inclusive w Grecji?", answer: "Tak, jeśli hotel jest Twoją główną bazą wypoczynku. Jeśli chcesz często jeść w tawernach i jeździć po wyspie, lepiej rozważyć śniadania lub brak wyżywienia." },
    ],
    searchPresets: ["Grecja", "Kreta", "Rodos", "Kos"],
    searchMode: "holiday",
  },

  "/malta": {
    kicker: "MALTA 2026",
    title: "Malta na 3 dni czy tydzień? Wybór bazy robi większą różnicę niż hotel",
    quickAnswer: "Na 3–4 dni najlepiej celować w dobrze skomunikowaną Sliemę, Vallettę albo okolice Gżiry. St. Julian’s sprawdzi się, jeśli chcesz więcej życia wieczorem. Mellieħa jest lepsza przy nastawieniu na plażę, a Gozo warto traktować jako osobny, spokojniejszy fragment wyjazdu.",
    sections: [
      {
        title: "Gdzie spać na Malcie?",
        table: {
          headers: ["Baza", "Najlepsza dla", "Co dostajesz"],
          rows: [
            ["Valletta", "Krótki city break i zabytki", "Klimat miasta, promy, dobra baza bez auta"],
            ["Sliema / Gżira", "Pierwszy wyjazd", "Dobra komunikacja, prom do Valletty, dużo restauracji"],
            ["St. Julian’s", "Wieczory i życie nocne", "Restauracje, bary, bardziej intensywny charakter"],
            ["Mellieħa", "Plaża i spokojniejszy pobyt", "Bliskość dużych plaż, dalej od głównych miejskich atrakcji"],
            ["Gozo", "Spokój i natura", "Wolniejsze tempo, zatoki, dobre uzupełnienie dłuższego wyjazdu"],
          ],
        },
      },
      {
        title: "3–4 dni czy 5–7 dni?",
        bullets: [
          "3–4 dni: Valletta, Trzy Miasta, Mdina, krótki rejs i jedna wybrana część wybrzeża.",
          "5–7 dni: dołóż Gozo, więcej zatok, rejs i spokojniejszy dzień bez gonienia między atrakcjami.",
          "Na krótki pobyt nie warto oszczędzać na hotelu położonym daleko od głównych połączeń — czas jest cenniejszy niż kilka euro różnicy.",
        ],
      },
      {
        title: "Malta na plażę czy zwiedzanie?",
        paragraphs: ["Malta jest mocniejsza jako miks miasta, historii, widoków i morza niż jako klasyczna tygodniowa plażówka. Jeśli priorytetem są szerokie piaszczyste plaże i hotelowy wypoczynek, porównaj Maltę z Cyprem, Grecją albo Majorką."],
      },
    ],
    checklist: [
      "Wybierz bazę pod plan dnia, nie tylko pod cenę hotelu.",
      "Przy 3–4 nocach sprawdź godziny lotów — późny przylot i wczesny powrót potrafią zabrać cały dzień.",
      "Zaplanuj promy i komunikację przed wyjazdem, jeśli chcesz zobaczyć kilka części wyspy.",
      "Jeśli zależy Ci na plaży, sprawdź odległość od konkretnej zatoki, a nie tylko hasło „blisko morza”.",
    ],
    faq: [
      { question: "Gdzie najlepiej nocować na pierwszy wyjazd na Maltę?", answer: "Najbardziej uniwersalne są Sliema i Gżira. Dają łatwy dostęp do Valletty, restauracji i komunikacji bez konieczności wynajmowania auta." },
      { question: "Czy 3 dni na Maltę wystarczą?", answer: "Tak na city break, ale plan trzeba ograniczyć. Na 5–7 dni można dołożyć Gozo, więcej wybrzeża i spokojniejsze tempo." },
      { question: "Czy Malta jest dobra na typowe wakacje plażowe?", answer: "Może być, ale nie jest klasycznym kierunkiem resortowym. Malta wygrywa połączeniem zwiedzania, klifów, zatok i miasta." },
    ],
    searchPresets: ["Malta"],
    searchMode: "all",
  },

  "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute": {
    kicker: "WYSPY KANARYJSKIE 2026",
    title: "Którą wyspę wybrać? Teneryfa, Gran Canaria, Fuerteventura czy Lanzarote",
    quickAnswer: "Teneryfa jest najbardziej uniwersalna, Gran Canaria łączy plaże z dużą różnorodnością krajobrazu, Fuerteventura wygrywa szerokimi plażami i sportami wodnymi, a Lanzarote daje najbardziej charakterystyczne wulkaniczne krajobrazy i spokojniejszy rytm zwiedzania.",
    sections: [
      {
        title: "Cztery najpopularniejsze wyspy — bez zgadywania",
        table: {
          headers: ["Wyspa", "Najlepsza dla", "Charakter"],
          rows: [
            ["Teneryfa", "Pierwszy wyjazd, miks plaży i zwiedzania", "Najwięcej różnorodności; południe bardziej resortowe, północ bardziej zielona"],
            ["Gran Canaria", "Plaże + objazd wyspy", "Maspalomas, góry, miasteczka i duży wybór hoteli"],
            ["Fuerteventura", "Plaże, surfing, spokój", "Szerokie wybrzeże i więcej wiatru"],
            ["Lanzarote", "Krajobraz, auto, pary", "Wulkany, architektura i wyspa dobra do objechania"],
          ],
        },
      },
      {
        title: "Kanary zimą — co ma największe znaczenie?",
        bullets: [
          "Nie patrz tylko na nazwę wyspy — konkretny kurort i ekspozycja na wiatr potrafią zmienić odczuwalną pogodę.",
          "Na Teneryfie zimą najczęściej szuka się noclegu na południu wyspy, jeśli priorytetem jest słońce i plaża.",
          "Fuerteventura jest świetna dla osób, które lubią wiatr i sporty wodne, ale nie każdy uzna to za idealną plażówkę.",
          "Przy tygodniu auto może dać więcej niż dopłata do wyższego standardu hotelu, szczególnie na Lanzarote i Gran Canarii.",
        ],
      },
      {
        title: "All Inclusive czy objazd?",
        paragraphs: ["All Inclusive dobrze działa przy krótkim zimowym odpoczynku, jeśli chcesz głównie słońca i basenu. Jeśli wybierasz Lanzarote, Gran Canarię albo północ Teneryfy ze względu na krajobraz, warto zostawić sobie więcej swobody na jazdę po wyspie."],
      },
    ],
    checklist: [
      "Najpierw wybierz wyspę i konkretną część wyspy.",
      "Sprawdź wiatr oraz położenie hotelu, nie tylko średnią temperaturę.",
      "Porównaj hotel z wyżywieniem z opcją auta i większej swobody.",
      "Przy zimowym wyjeździe zwróć uwagę na basen podgrzewany, jeśli jest dla Ciebie ważny.",
    ],
    faq: [
      { question: "Która wyspa kanaryjska jest najlepsza na pierwszy raz?", answer: "Najbardziej uniwersalna jest Teneryfa. Łączy plaże, Teide, kurorty i wiele opcji wycieczek." },
      { question: "Która wyspa ma najlepsze plaże?", answer: "Jeśli priorytetem są szerokie piaszczyste plaże, bardzo mocna jest Fuerteventura. Gran Canaria i Teneryfa oferują większy miks plaż i pozostałych atrakcji." },
      { question: "Która wyspa jest najlepsza zimą?", answer: "Nie ma jednej odpowiedzi dla całego archipelagu. Przy nastawieniu na słońce często wybiera się południe Teneryfy lub południe Gran Canarii, ale warto sprawdzić warunki dla konkretnego kurortu." },
    ],
    searchPresets: ["Wyspy Kanaryjskie", "Teneryfa", "Gran Canaria", "Fuerteventura"],
    searchMode: "holiday",
  },

  "/riwiera-turecka-czy-egejska-co-wybrac": {
    kicker: "TURCJA — SZYBKI WYBÓR",
    title: "Riwiera Turecka czy Egejska? Decyzja w 30 sekund",
    quickAnswer: "Riwierę Turecką wybierz, jeśli chcesz duży resort, mocne All Inclusive, aquaparki i prosty wypoczynek bez planowania. Wybrzeże Egejskie wybierz, jeśli ważniejsze są zatoki, rejsy, marina, restauracje i częstsze wychodzenie poza hotel.",
    sections: [
      {
        title: "Jeśli zależy Ci na…",
        table: {
          headers: ["Priorytet", "Lepszy wybór", "Dlaczego"],
          rows: [
            ["Rodzinny resort", "Riwiera Turecka", "Więcej dużych hoteli, aquaparków i animacji"],
            ["All Inclusive", "Riwiera Turecka", "Bardzo duża podaż pakietów i hoteli resortowych"],
            ["Rejsy i zatoki", "Turcja Egejska", "Wybrzeże jest bardziej urozmaicone i łatwiej budować aktywny plan"],
            ["Wieczory poza hotelem", "Turcja Egejska", "Bodrum i Marmaris mocniej żyją poza samymi resortami"],
            ["Październik", "Riwiera Turecka", "Sezon jest zwykle dłuższy i łatwiej znaleźć klasyczne wakacyjne pakiety"],
            ["Pierwszy wyjazd z małym dzieckiem", "Riwiera Turecka", "Prostsza logistyka hotelowa i duży wybór rodzinnych obiektów"],
          ],
        },
      },
      {
        title: "Które kurorty porównywać?",
        bullets: [
          "Riwiera: Lara, Belek, Side, Alanya, Kemer.",
          "Egejska: Bodrum, Marmaris, Fethiye, Kuşadası, Çeşme.",
          "Nie porównuj tylko regionów — konkretna lokalizacja hotelu i długość transferu potrafią zmienić cały wyjazd.",
        ],
      },
      {
        title: "Najczęstszy błąd przy wyborze Turcji",
        paragraphs: ["Kupowanie najtańszego hotelu bez sprawdzenia, czy chcesz spędzać cały dzień w resorcie, czy wychodzić do miasta. Na Riwierze dobra infrastruktura hotelowa może być największą zaletą. Na wybrzeżu egejskim warto zapłacić za lokalizację, z której rzeczywiście skorzystasz."],
      },
    ],
    checklist: [
      "Sprawdź realny czas transferu z lotniska do hotelu.",
      "Zobacz typ plaży przy konkretnym hotelu.",
      "Porównaj zakres All Inclusive, a nie tylko samą etykietę.",
      "Jeśli chcesz zwiedzać, sprawdź położenie hotelu względem miasta i atrakcji.",
    ],
    faq: [
      { question: "Riwiera Turecka czy Egejska z dziećmi?", answer: "Z małymi dziećmi częściej wygrywa Riwiera Turecka ze względu na duże rodzinne resorty, aquaparki i animacje." },
      { question: "Gdzie jest lepiej dla par?", answer: "Jeśli lubicie wychodzić poza hotel, mariny, restauracje i rejsy, częściej lepiej sprawdzi się Turcja Egejska." },
      { question: "Który region wybrać jesienią?", answer: "Przy późniejszym terminie częściej łatwiej znaleźć klasyczny wakacyjny wypoczynek na Riwierze Tureckiej. Zawsze sprawdź pogodę i dostępność dla konkretnego terminu." },
    ],
    searchPresets: ["Turcja", "Antalya", "Bodrum", "Marmaris"],
    searchMode: "holiday",
  },
};

export function getArticleDeepDiveWave7(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return wave7[normalized];
}
