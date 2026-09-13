import type { ArticleSearchMode } from "@/lib/articleContext";

export type DeepDiveTable = {
  headers: string[];
  rows: string[][];
};

export type DeepDiveSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: DeepDiveTable;
};

export type DeepDiveSource = {
  label: string;
  url: string;
};

export type ArticleDeepDive = {
  kicker: string;
  title: string;
  quickAnswer: string;
  checkedAt?: string;
  sections: DeepDiveSection[];
  checklist?: string[];
  faq?: Array<{ question: string; answer: string }>;
  sources?: DeepDiveSource[];
  searchPresets?: string[];
  searchMode?: ArticleSearchMode;
};

const details: Record<string, ArticleDeepDive> = {
  "/lotniska-w-polsce-bez-limitu-100-ml-plynow": {
    kicker: "AKTUALNE ZASADY 2026",
    title: "Gdzie w Polsce naprawdę nie obowiązuje już limit 100 ml?",
    quickAnswer: "Nie ma jednej zasady dla wszystkich polskich lotnisk. Na części portów z certyfikowanymi skanerami C3 można przejść kontrolę z płynami w opakowaniach do 2 litrów. Na innych nadal obowiązuje standardowe 100 ml. Sprawdzaj zawsze lotnisko wylotu, a przy przesiadce także lotnisko tranzytowe.",
    checkedAt: "13.09.2026",
    sections: [
      {
        title: "Potwierdzone ułatwienia na polskich lotniskach",
        table: {
          headers: ["Lotnisko", "Co możesz zabrać", "Co ważne"],
          rows: [
            ["Kraków-Balice (KRK)", "Płyny w opakowaniach do 2 l", "Kraków Airport informuje o zniesieniu limitu 100 ml dzięki skanerom CT."],
            ["Poznań-Ławica (POZ)", "Każde opakowanie do 2 l", "Lotnisko podaje, że nie ma łącznego limitu ilości płynów, o ile wszystko mieści się w bagażu podręcznym."],
            ["Rzeszów-Jasionka (RZE)", "Płyny do 2 l", "Port potwierdza pełne wdrożenie skanerów C3 i zniesienie limitu 100 ml."],
            ["Gdańsk (GDN)", "Do 2 l na nowych liniach C3", "Nowe skanery 3D działają od lipca 2026; port wdraża je stopniowo, więc zwróć uwagę, przez którą linię kontroli przechodzisz."],
          ],
        },
      },
      {
        title: "Jeśli lotnisko nie potwierdza nowych zasad",
        bullets: [
          "Przyjmij bezpiecznie, że obowiązuje standard: pojemniki maks. 100 ml w jednej przezroczystej, zamykanej torbie do 1 litra.",
          "Leków, żywności specjalnej i jedzenia dla niemowląt dotyczą wyjątki, ale mogą być sprawdzane osobno.",
          "To, że wylatujesz z lotniska bez limitu 100 ml, nie oznacza automatycznie takich samych zasad przy locie powrotnym.",
          "Jeżeli masz przesiadkę i ponowną kontrolę bezpieczeństwa, zasady lotniska tranzytowego mogą być inne.",
        ],
      },
      {
        title: "Co zalicza się do płynów?",
        paragraphs: ["Nie tylko woda czy perfumy. Do płynów zaliczane są także żele, kremy, pasty, aerozole i mieszaniny płynno-stałe."],
        bullets: ["pasta do zębów", "krem i balsam", "tusz do rzęs", "żel do włosów i pod prysznic", "dezodorant w aerozolu", "zupa, syrop, sos lub produkt o podobnej konsystencji"],
      },
    ],
    checklist: [
      "Sprawdź oficjalną stronę lotniska na 24–48 h przed wylotem.",
      "Sprawdź osobno lotnisko powrotne i ewentualną przesiadkę.",
      "Jeśli nie masz pewności, pakuj według zasady 100 ml — unikniesz wyrzucania kosmetyków przy kontroli.",
    ],
    faq: [
      { question: "Czy skaner CT zawsze oznacza brak limitu 100 ml?", answer: "Nie. Samo posiadanie nowego urządzenia nie wystarcza — znaczenie ma certyfikacja, sposób wdrożenia i konkretna linia kontroli." },
      { question: "Czy butelka 500 ml może być pusta?", answer: "Pusta butelka nie jest płynem; zwykle możesz przejść z nią kontrolę i napełnić ją po kontroli. Ostateczna decyzja należy do operatora kontroli." },
      { question: "Czy reguła 2 litrów dotyczy całego bagażu?", answer: "Nie zawsze. Na lotniskach, które wdrożyły nowe zasady, 2 litry odnoszą się zwykle do pojemności pojedynczego opakowania. Zasady konkretnego portu trzeba sprawdzić przed podróżą." },
    ],
    sources: [
      { label: "Komisja Europejska — zasady dotyczące płynów", url: "https://transport.ec.europa.eu/transport-modes/air/aviation-security/aviation-security-policy/liquids-aerosols-and-gels_en" },
      { label: "Kraków Airport — koniec limitu 100 ml", url: "https://krakowairport.pl/blog/en/koniec-z-limitem-100-ml/" },
      { label: "Poznań-Ławica — kontrola bezpieczeństwa", url: "https://poznanairport.pl/przed-podroza/kontrola-bezpieczenstwa/" },
      { label: "Rzeszów-Jasionka — skanery C3", url: "https://www.rzeszowairport.pl/pl/lotnisko/aktualnosci/326/oficjalne-otwarcie-zmodernizowanego-punktu-kontroli-bezpieczenstwa" },
      { label: "Gdańsk Airport — skanery 3D", url: "https://www.airport.gdansk.pl/aktualnosci/skanery-3d-juz-pracuja-w-gdansku" },
    ],
  },

  "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych": {
    kicker: "BAGAŻ PODRĘCZNY 2026",
    title: "Dwa bagaże podręczne? To zależy od linii i taryfy",
    quickAnswer: "Tak, ale nie zawsze bez dopłaty. Ryanair i Wizz Air w najtańszych taryfach pozwalają standardowo na jedną małą torbę pod fotel. Druga walizka kabinowa wymaga odpowiedniej opcji. LOT standardowo pozwala na walizkę kabinową oraz dodatkowy mały przedmiot osobisty w klasie Economy.",
    checkedAt: "13.09.2026",
    sections: [
      {
        title: "Najważniejsze limity — szybkie porównanie",
        table: {
          headers: ["Linia", "W cenie podstawowej", "Druga sztuka na pokładzie"],
          rows: [
            ["Ryanair", "1 mała torba 40 × 30 × 20 cm pod fotel", "Priority: dodatkowo bagaż do 10 kg, 55 × 40 × 20 cm"],
            ["Wizz Air", "1 torba do 10 kg, 40 × 30 × 20 cm pod fotel", "WIZZ Priority: dodatkowo trolley do 10 kg, 55 × 40 × 23 cm"],
            ["LOT Economy", "1 bagaż do 8 kg, maks. 55 × 40 × 23 cm", "Dodatkowo przedmiot osobisty do 2 kg; wyższe klasy mają większe limity"],
          ],
        },
      },
      {
        title: "Najczęstszy błąd: „mam plecak i walizkę, więc to dwa podręczne”",
        paragraphs: ["Linia liczy sztuki według swojej taryfy, a nie według tego, jak nazywasz bagaż. Mały plecak, torba na laptop i torebka mogą być traktowane jako osobne sztuki, jeśli przewoźnik nie zalicza ich do dodatkowych przedmiotów osobistych."],
        bullets: [
          "Sprawdź taryfę na konkretnym bilecie, nie tylko ogólne zasady linii.",
          "Zmierz bagaż razem z kółkami i wystającymi elementami.",
          "Sprawdź wagę — limit wymiarów i limit kilogramów to dwie osobne rzeczy.",
          "Jeśli lecisz w dwie strony różnymi liniami, pakuj się według bardziej restrykcyjnej z nich.",
        ],
      },
      {
        title: "Co wybrać przy krótkim city breaku?",
        paragraphs: ["Na 2–4 dni najczęściej wystarcza mały bagaż pod fotel, jeśli nie zabierasz dużej kosmetyczki i kilku par butów. Dopłata do walizki kabinowej ma sens, gdy jedziesz zimą, przewozisz sprzęt albo chcesz uniknąć bardzo ciasnego pakowania."],
      },
    ],
    checklist: ["Otwórz rezerwację i sprawdź nazwę taryfy.", "Zmierz torbę po spakowaniu.", "Zważ walizkę, jeśli przewoźnik ma limit kg.", "Zrób screenshot warunków taryfy przed wyjazdem, jeśli dokupowałaś bagaż osobno."],
    faq: [
      { question: "Czy torebka damska liczy się jako drugi bagaż?", answer: "Zależy od linii. W tanich liniach mała torebka może być traktowana jako Twoja jedyna bezpłatna sztuka, jeśli nie masz wykupionej drugiej. W LOT dodatkowy przedmiot osobisty jest przewidziany w limicie." },
      { question: "Czy duty free jest dodatkowym bagażem?", answer: "Zasady mogą różnić się między przewoźnikami i lotniskami. Nie zakładaj automatycznie, że duża torba zakupowa nie będzie liczona przy wejściu na pokład." },
    ],
    sources: [
      { label: "Ryanair — zasady bagażu", url: "https://help.ryanair.com/hc/pl/articles/12888036565521-Zasady-przewozu-baga%C5%BCu-Ryanair" },
      { label: "Wizz Air — limity bagażu", url: "https://ssr-weu2.wizzair.com/en-gb/help-centre/booking-information-and-services/baggage/baggage-allowance" },
      { label: "LOT — limit bagażu podręcznego", url: "https://www.lot.com/pl/pl/centrum-pomocy/centrum-pomocy-bagaz/limit-bagazu-podrecznego" },
    ],
  },

  "/czy-mozna-wniesc-jedzenie-do-samolotu-co-wolno-zabrac-na-poklad": {
    kicker: "JEDZENIE W SAMOLOCIE",
    title: "Co naprawdę możesz zabrać przez kontrolę i na pokład?",
    quickAnswer: "Własne jedzenie możesz zabrać na pokład. Największa różnica dotyczy konsystencji: kanapka czy sucha przekąska zwykle nie podlega limitowi płynów, ale jogurt, sos, pasta, zupa czy kremowy produkt może zostać potraktowany jak płyn. Osobna kwestia to przepisy celne kraju docelowego.",
    checkedAt: "13.09.2026",
    sections: [
      {
        title: "Przez kontrolę bezpieczeństwa — praktyczne przykłady",
        table: {
          headers: ["Produkt", "Jak go traktować"],
          rows: [
            ["Kanapka, ciastko, baton, orzechy", "Zwykle jako żywność stała"],
            ["Owoce i warzywa", "Zwykle przechodzą kontrolę, ale sprawdź przepisy wwozowe miejsca docelowego"],
            ["Jogurt, hummus, masło orzechowe, sos", "Może być traktowane jak płyn/pasta — stosuj regułę płynów obowiązującą na danym lotnisku"],
            ["Zupa, napój, smoothie", "Płyn — podlega zasadom kontroli płynów"],
            ["Żywność dla niemowląt / dieta medyczna", "Może podlegać wyjątkom; przygotuj produkt do osobnej kontroli"],
          ],
        },
      },
      {
        title: "Kontrola bezpieczeństwa to nie to samo co przepisy celne",
        paragraphs: ["To, że jedzenie przeszło kontrolę na lotnisku wylotu, nie oznacza jeszcze, że wolno je wwieźć do kraju docelowego."],
        bullets: [
          "W podróży wewnątrz UE mięso i nabiał na własny użytek są co do zasady dozwolone.",
          "Przy wjeździe do UE z większości państw spoza UE nie wolno przywozić mięsa ani nabiału.",
          "Owoce, warzywa, rośliny i produkty pochodzenia zwierzęcego mogą podlegać dodatkowym ograniczeniom.",
        ],
      },
      {
        title: "Co warto spakować na krótki lot?",
        bullets: ["kanapkę bez mocno płynnego sosu", "orzechy lub baton", "pustą butelkę do napełnienia po kontroli", "małą przekąskę dla dziecka", "chusteczki i woreczek na opakowania"],
      },
    ],
    checklist: ["Sprawdź zasady płynów lotniska wylotu.", "Jeśli lecisz poza UE, sprawdź zasady wwozu żywności kraju docelowego.", "Przy powrocie spoza UE nie pakuj mięsa i nabiału bez sprawdzenia przepisów."],
    faq: [
      { question: "Czy można zabrać kanapkę do samolotu?", answer: "Tak, własna kanapka jest co do zasady dozwolona. Uważaj na bardzo płynne dodatki i na przepisy wwozowe po lądowaniu." },
      { question: "Czy jogurt przejdzie kontrolę?", answer: "Jogurt może być traktowany jako płyn lub półpłynny produkt, więc podlega zasadom płynów obowiązującym na konkretnym lotnisku." },
    ],
    sources: [
      { label: "ULC — żywność w bagażu podręcznym", url: "https://ulc.gov.pl/prawa-pasazera/akty-prawne?id=28" },
      { label: "Your Europe — żywność i produkty pochodzenia zwierzęcego", url: "https://europa.eu/youreurope/citizens/travel/carry/meat-dairy-animal/index_pl.htm" },
    ],
  },

  "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu": {
    kicker: "DOJAZD Z LOTNISKA",
    title: "Jak wybrać najtańszy transport bez straty pół dnia",
    quickAnswer: "Najtańszy autobus nie zawsze jest najlepszym wyborem. Przy 2–4 osobach taxi lub transfer może kosztować niewiele więcej na osobę, a oszczędzić godzinę albo dwie. Porównuj pełny koszt drzwi–drzwi: bilet, przesiadki, dojście i nocny dodatek.",
    sections: [
      {
        title: "Szybka decyzja: co wybrać?",
        table: {
          headers: ["Sytuacja", "Najczęściej najlepsza opcja"],
          rows: [
            ["1 osoba, przylot w dzień, hotel blisko dworca", "Pociąg lub autobus lotniskowy"],
            ["2 osoby, centrum daleko od stacji", "Porównaj transport publiczny z taxi aplikacyjnym"],
            ["3–4 osoby", "Taxi lub prywatny transfer często zaczyna być konkurencyjny na osobę"],
            ["Przylot po północy", "Sprawdź ostatni pociąg/autobus przed zakupem lotu"],
            ["Dziecko / dużo bagażu", "Mniej przesiadek może być warte niewielkiej dopłaty"],
          ],
        },
      },
      {
        title: "5 rzeczy do sprawdzenia przed wylotem",
        bullets: ["nazwa dokładnego lotniska — nie tylko miasto w nazwie biletu", "godzina ostatniego połączenia", "czy bilet kupisz kartą/aplikacją", "dokładny przystanek przy hotelu", "koszt nocnego taxi lub transferu jako plan B"],
      },
      {
        title: "Pułapka taniego lotu",
        paragraphs: ["Lot na lotnisko oddalone 60–100 km od miasta może wyglądać świetnie cenowo, ale po doliczeniu transferu i straconego czasu przestać być okazją. Przy city breaku porównuj cenę lotu razem z dojazdem do centrum."],
      },
    ],
    checklist: ["Zapisz trasę offline przed lądowaniem.", "Zrób screenshot biletu lub kodu QR.", "Sprawdź alternatywę na wypadek opóźnienia lotu.", "Nie zakładaj, że Uber/Bolt działa na każdym lotnisku w tej samej strefie odbioru."],
  },

  "/gdzie-jest-cieplo-w-listopadzie": {
    kicker: "LISTOPAD 2026",
    title: "Gdzie naprawdę lecieć po ciepło w listopadzie?",
    quickAnswer: "Jeśli zależy Ci na realnym cieple, a nie tylko łagodniejszej jesieni, najmocniejsze opcje to Wyspy Kanaryjskie, Egipt i Dubaj. Malta i Madera są świetne na aktywny wyjazd, ale nie gwarantują plażowej pogody każdego dnia.",
    sections: [
      {
        title: "Kierunek dobierz do tego, czego oczekujesz",
        table: {
          headers: ["Kierunek", "Dla kogo", "Charakter listopada"],
          rows: [
            ["Teneryfa / Gran Canaria", "Słońce + aktywność + plaża", "Jedna z najbezpieczniejszych pogodowo opcji blisko Europy"],
            ["Egipt", "All Inclusive i odpoczynek", "Ciepło i duży wybór pakietów z Polski"],
            ["Dubaj", "Miasto + plaża", "Bardzo ciepło, ale zwykle wyższy budżet"],
            ["Madera", "Zwiedzanie i trekking", "Łagodnie, zielono, pogoda zmienna lokalnie"],
            ["Malta", "City break i zwiedzanie", "Przyjemnie, ale nie traktuj jej jak pewnej plażówki"],
            ["Cypr", "Spokojniejszy wyjazd poza sezonem", "Może być bardzo przyjemnie, ale warunki są mniej pewne niż na Kanarach czy w Egipcie"],
          ],
        },
      },
      {
        title: "Jeśli priorytetem jest kąpiel i leżak",
        bullets: ["Najpierw sprawdzaj Kanary i Egipt.", "Nie wybieraj kierunku tylko po średniej temperaturze — sprawdź wiatr, temperaturę wody i położenie konkretnego hotelu.", "Na Teneryfie południe wyspy jest zwykle lepszym wyborem na pogodowy pewniak niż północ."],
      },
      {
        title: "Jeśli chcesz bardziej zwiedzać niż leżeć",
        bullets: ["Malta sprawdza się na 3–5 dni.", "Madera jest lepsza na 5–7 dni i aktywny plan.", "Dubaj ma sens na 4–6 dni, jeśli chcesz połączyć miasto z plażą."],
      },
    ],
    searchPresets: ["Teneryfa", "Egipt", "Madera", "Malta"],
    searchMode: "holiday",
  },

  "/gdzie-jest-cieplo-w-pazdzierniku": {
    kicker: "PAŹDZIERNIK 2026",
    title: "Ciepło w październiku — nie wszystkie południowe kierunki są takie same",
    quickAnswer: "Na początku października duża część południa Europy nadal działa bardzo dobrze. Pod koniec miesiąca pewniejszego ciepła szukaj na Cyprze, Kanarach i w Egipcie. Malta i południowa Hiszpania są świetne na zwiedzanie, ale pogoda bywa bardziej zmienna.",
    sections: [
      {
        title: "Najlepsze zastosowanie kierunków",
        table: {
          headers: ["Kierunek", "Najlepszy na", "Na co uważać"],
          rows: [
            ["Cypr", "Plaża + zwiedzanie", "Pod koniec miesiąca wieczory mogą być chłodniejsze"],
            ["Teneryfa", "Pewniejsze słońce", "Wybierz odpowiednią część wyspy"],
            ["Egipt", "All Inclusive", "Sprawdź wiatr i położenie zatoki"],
            ["Malta", "City break", "Morze może być przyjemne, ale pogoda nie jest tak pewna jak w Egipcie"],
            ["Andaluzja", "Zwiedzanie", "To bardziej city break niż gwarantowana plażówka pod koniec miesiąca"],
          ],
        },
      },
    ],
    searchPresets: ["Cypr", "Teneryfa", "Egipt", "Malta"],
    searchMode: "holiday",
  },

  "/gdzie-na-wakacje-we-wrzesniu": {
    kicker: "WRZESIEŃ 2026",
    title: "Wrzesień bez przypadkowego kierunku — wybierz pod pogodę i styl wyjazdu",
    quickAnswer: "Wrzesień to jeden z najlepszych miesięcy na Morze Śródziemne: morze jest nagrzane, temperatury zwykle łagodniejsze niż w sierpniu, a po rozpoczęciu roku szkolnego część kierunków robi się spokojniejsza. Najmocniejsze opcje to Grecja, Cypr, Turcja, Hiszpania i Malta.",
    sections: [
      {
        title: "Który kierunek dla kogo?",
        table: {
          headers: ["Kierunek", "Najlepszy dla", "Ile dni"],
          rows: [
            ["Kreta", "Plaża + auto + zwiedzanie", "7–10"],
            ["Rodos", "Plaża + łatwe zwiedzanie", "7"],
            ["Cypr", "Słońce i ciepłe morze", "7"],
            ["Turcja", "All Inclusive i wygoda", "7"],
            ["Majorka", "Plaże + krótszy aktywny wyjazd", "4–7"],
            ["Malta", "Zwiedzanie + kąpiele", "4–6"],
          ],
        },
      },
      {
        title: "Pierwsza czy druga połowa września?",
        paragraphs: ["Pierwsza połowa jest bliższa pełnemu latu. W drugiej połowie warto mocniej patrzeć na południowe wyspy i kierunki o dłuższym sezonie, szczególnie jeśli zależy Ci na plaży."],
      },
    ],
    searchPresets: ["Kreta", "Cypr", "Rodos", "Malta"],
    searchMode: "holiday",
  },

  "/gdzie-na-sylwestra-2026-2027-15-kierunkow": {
    kicker: "SYLWESTER 2026/2027",
    title: "Nie 15 przypadkowych miast — wybierz Sylwestra pod styl wyjazdu",
    quickAnswer: "Najpierw zdecyduj, czy chcesz imprezę w mieście, jarmarkowy klimat, czy ucieczkę do ciepła. Dopiero potem porównuj loty. Sylwester jest okresem o wysokim popycie, więc dobre godziny lotów i centralny hotel są często ważniejsze niż najniższa cena biletu.",
    sections: [
      {
        title: "15 kierunków pogrupowanych sensownie",
        table: {
          headers: ["Styl", "Kierunki"],
          rows: [
            ["Klasyczny city break", "Rzym, Barcelona, Lizbona, Praga, Budapeszt"],
            ["Zimowy klimat", "Wiedeń, Kopenhaga, Reykjavik, Oslo"],
            ["Cieplej niż w Polsce", "Malta, Cypr, Sewilla"],
            ["Ciepło i większy budżet", "Dubaj, Marrakesz, Teneryfa"],
          ],
        },
      },
      {
        title: "Najważniejsze przy rezerwacji Sylwestra",
        bullets: ["Sprawdź godzinę powrotu 1 stycznia — bardzo wczesny lot potrafi zepsuć cały plan.", "Hotel w centrum może być więcej wart niż tańszy nocleg wymagający nocnego transportu.", "Sprawdź, czy imprezy plenerowe wymagają wejściówek lub rejestracji.", "Nie czekaj z centralnymi hotelami do ostatniej chwili, nawet jeśli liczysz na tańszy lot."],
      },
    ],
    searchPresets: ["Rzym", "Barcelona", "Malta", "Dubaj"],
    searchMode: "city",
  },
};

export function getArticleDeepDive(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return details[normalized];
}
