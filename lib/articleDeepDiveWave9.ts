import type { ArticleDeepDive } from "@/lib/articleDeepDive";

export type Wave9ArticleDeepDive = ArticleDeepDive & {
  hideSearch?: boolean;
};

const wave9: Record<string, Wave9ArticleDeepDive> = {
  "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych": {
    kicker: "BAGAŻ PODRĘCZNY 2026",
    title: "Czy bagaż podręczny jest ważony? Tak — ale limit zależy od linii i taryfy",
    quickAnswer: "Bagaż podręczny może zostać zważony lub zmierzony na lotnisku, więc pakuj się według limitu swojej taryfy. Wizz Air podaje maks. 10 kg dla bezpłatnej torby 40 × 30 × 20 cm. LOT Economy standardowo ma limit 8 kg dla bagażu 55 × 40 × 23 cm. Ryanair dla bezpłatnej małej torby podaje przede wszystkim wymiar 40 × 30 × 20 cm, a dodatkowa walizka kabinowa w opcji Priority ma limit 10 kg.",
    checkedAt: "13.09.2026",
    hideSearch: true,
    sections: [
      {
        title: "Czy linia naprawdę może zważyć bagaż przy bramce?",
        paragraphs: [
          "Tak. To, że na jednym locie nikt nie sprawdził wagi lub wymiarów, nie oznacza, że przewoźnik zrezygnował z limitu. Kontrola może odbyć się przy stanowisku odprawy albo przy bramce.",
          "Najbezpieczniejsza zasada: traktuj limit z rezerwacji jak realny, a nie orientacyjny. Szczególnie dotyczy to większej walizki kabinowej z limitem kilogramów."
        ],
      },
      {
        title: "Najważniejsze limity — szybkie porównanie",
        table: {
          headers: ["Linia", "Bezpłatny bagaż / Economy", "Druga lub większa sztuka"],
          rows: [
            ["Ryanair", "1 mała torba 40 × 30 × 20 cm pod fotel", "Priority: dodatkowo bagaż do 10 kg, 55 × 40 × 20 cm"],
            ["Wizz Air", "1 torba do 10 kg, 40 × 30 × 20 cm pod fotel", "WIZZ Priority: dodatkowo trolley do 10 kg, 55 × 40 × 23 cm"],
            ["LOT Economy", "1 bagaż do 8 kg, maks. 55 × 40 × 23 cm", "Dodatkowy przedmiot osobisty zależnie od warunków taryfy"],
          ],
        },
      },
      {
        title: "Co zrobić, żeby nie dopłacać przy bramce",
        bullets: [
          "Sprawdź warunki dokładnie tej taryfy, którą masz na rezerwacji.",
          "Zmierz torbę po spakowaniu — razem z kółkami, kieszeniami i wystającymi elementami.",
          "Jeśli linia ma limit kilogramów, zważ bagaż w domu, a nie dopiero na lotnisku.",
          "Przy podróży dwiema liniami pakuj się pod bardziej restrykcyjne zasady.",
          "Nie zakładaj, że torebka, torba na laptopa i plecak zawsze liczą się jako jedna sztuka."
        ],
      },
    ],
    checklist: [
      "Sprawdź nazwę taryfy w aplikacji lub potwierdzeniu rezerwacji.",
      "Zmierz i zważ bagaż po pełnym spakowaniu.",
      "Zostaw kilka centymetrów i trochę zapasu wagi na powrót.",
      "Zrób screenshot wykupionego limitu bagażu, jeśli dodawałaś go osobno."
    ],
    faq: [
      { question: "Czy bagaż podręczny jest zawsze ważony?", answer: "Nie. Kontrola nie odbywa się przy każdym pasażerze i na każdym locie, ale linia może sprawdzić wagę lub wymiar. Limit taryfy obowiązuje niezależnie od tego, czy kontrola faktycznie nastąpi." },
      { question: "Czy mały plecak Ryanair ma limit 10 kg?", answer: "Aktualna strona Ryanair dla bezpłatnej małej torby wskazuje wymiar 40 × 30 × 20 cm. Limit 10 kg jest wyraźnie przypisany do większego bagażu kabinowego w opcji Priority." },
      { question: "Czy Wizz Air waży mały bagaż?", answer: "Wizz Air określa dla bezpłatnego bagażu pod fotel maksymalną wagę 10 kg i wymiary 40 × 30 × 20 cm, więc warto trzymać oba limity." },
    ],
    sources: [
      { label: "Ryanair — zasady przewozu bagażu", url: "https://help.ryanair.com/hc/pl/articles/12888036565521-Zasady-przewozu-baga%C5%BCu-Ryanair" },
      { label: "Wizz Air — bagaż kabinowy", url: "https://ssr-weu2.wizzair.com/en-gb/help-centre/booking-information-and-services/baggage/baggage-allowance/cabin-baggage" },
      { label: "LOT — informacje o bagażu podręcznym", url: "https://www.lot.com/pl/pl/podrozuj/bagaz/bagaz-podreczny" },
    ],
  },

  "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu": {
    kicker: "DOJAZD Z LOTNISKA",
    title: "Jak dostać się z lotniska do centrum najtaniej — bez fałszywych oszczędności",
    quickAnswer: "Najpierw sprawdź kod lotniska, potem ostatni pociąg lub autobus, a na końcu koszt taxi dla całej grupy. Tani autobus za kilka euro może przestać być najtańszy, jeśli wymaga dwóch przesiadek, dodatkowego biletu miejskiego i godziny dłuższego dojazdu.",
    hideSearch: true,
    sections: [
      {
        title: "Wybierz transport w 30 sekund",
        table: {
          headers: ["Sytuacja", "Najpierw sprawdź"],
          rows: [
            ["1 osoba, przylot w dzień", "Pociąg lub autobus lotniskowy"],
            ["2 osoby", "Transport publiczny vs taxi aplikacyjne — policz cenę za osobę"],
            ["3–4 osoby", "Taxi lub transfer często zaczyna być konkurencyjny"],
            ["Przylot późno w nocy", "Godzinę ostatniego połączenia jeszcze przed zakupem lotu"],
            ["Dziecko / dużo bagażu", "Liczbę przesiadek i dojście od przystanku do hotelu"],
          ],
        },
      },
      {
        title: "Nie kupuj lotu, dopóki nie sprawdzisz tych 5 rzeczy",
        bullets: [
          "dokładnego kodu lotniska — nazwa miasta na bilecie może oznaczać port daleko od centrum",
          "godziny ostatniego połączenia po planowanym lądowaniu",
          "czy lotniskowy autobus jedzie do centrum czy tylko do dworca na obrzeżach",
          "ceny taxi dla całej grupy, a nie za osobę",
          "planu B, jeśli lot opóźni się o 60–90 minut"
        ],
      },
      {
        title: "Prawdziwy koszt dojazdu",
        paragraphs: [
          "Porównuj trasę drzwi–drzwi. Do biletu lotniskowego dolicz lokalny transport, ewentualne przesiadki i czas. Przy krótkim city breaku godzina oszczędzona na transferze może być więcej warta niż kilka euro różnicy w cenie."
        ],
      },
    ],
    checklist: [
      "Zapisz nazwę i kod lotniska.",
      "Zrób screenshot trasy po przylocie.",
      "Sprawdź opcję nocną na wypadek opóźnienia.",
      "Jeśli jedziecie w kilka osób, podziel cenę taxi przez liczbę pasażerów przed porównaniem."
    ],
    faq: [
      { question: "Co jest zwykle najtańsze z lotniska do centrum?", answer: "Najczęściej autobus miejski lub pociąg, ale nie zawsze po uwzględnieniu przesiadek i liczby osób. Dla 3–4 osób taxi może wyjść bardzo podobnie na osobę." },
      { question: "Kiedy transfer prywatny ma sens?", answer: "Przy nocnym przylocie, większej grupie, dzieciach, dużym bagażu albo lotnisku daleko od miasta. Wtedy płacisz także za prostotę i mniejsze ryzyko utraty połączenia." },
    ],
  },

  "/wakacje-z-psem-za-granica-gdzie-jechac-i-jak-sie-przygotowac": {
    kicker: "WAKACJE Z PSEM 2026",
    title: "Gdzie na camping z psem? Najpierw wybierz obiekt, dopiero potem kraj",
    quickAnswer: "Duży wybór campingów przyjaznych psom znajdziesz m.in. we Włoszech, Chorwacji, Austrii i Niemczech. Nie oznacza to jednak, że każdy camping w tych krajach przyjmuje psy. Sprawdź konkretny obiekt: sezon, liczbę zwierząt, dostęp do plaży lub jeziora, opłatę za psa i zasady prowadzenia na smyczy.",
    checkedAt: "13.09.2026",
    hideSearch: true,
    sections: [
      {
        title: "Które kierunki warto zacząć sprawdzać?",
        table: {
          headers: ["Kierunek", "Dlaczego warto sprawdzić", "Na co uważać"],
          rows: [
            ["Chorwacja", "Dużo campingów nad morzem i obiektów z infrastrukturą dla psów", "Nie każda plaża przy campingu jest dostępna dla psa"],
            ["Włochy", "Bardzo duża baza campingów, szczególnie nad jeziorami i Adriatykiem", "Regulamin może różnić się między parcelą a domkiem mobilnym"],
            ["Austria", "Camping + góry, jeziora i dużo tras spacerowych", "Sprawdź lokalne zasady kąpielisk i kolejek górskich"],
            ["Niemcy", "Duża liczba obiektów i łatwe wyszukiwanie campingów przyjaznych psom", "Niektóre miejsca mają ograniczenia ras, liczby psów lub stref"],
          ],
        },
      },
      {
        title: "Filtr „psy dozwolone” to za mało",
        bullets: [
          "czy pies jest akceptowany również w wysokim sezonie",
          "czy może wejść do konkretnego typu domku lub tylko na parcelę",
          "czy jest limit liczby psów i dodatkowa opłata",
          "czy w pobliżu jest legalna plaża, jezioro lub wybieg dla psa",
          "czy camping ma prysznic dla psów, zacienione miejsca lub wydzieloną strefę",
          "czy wymagany jest kaganiec w komunikacji lub miejscach wspólnych"
        ],
      },
      {
        title: "Dokumenty w UE — minimum, które trzeba sprawdzić",
        paragraphs: [
          "Przy prywatnej podróży z psem między krajami UE standardowo potrzebujesz prawidłowego oznakowania mikroczipem, aktualnego szczepienia przeciw wściekliźnie i ważnego unijnego paszportu zwierzęcia. Dla części kierunków obowiązują dodatkowe wymagania, dlatego sprawdź kraj docelowy przed wyjazdem."
        ],
        bullets: [
          "Finlandia, Irlandia, Malta, Norwegia i Irlandia Północna wymagają u psów odpowiedniego leczenia przeciw Echinococcus multilocularis w określonym czasie przed podróżą.",
          "Przy pierwszym szczepieniu przeciw wściekliźnie obowiązuje okres oczekiwania przed podróżą; szczegóły potwierdź z weterynarzem i w aktualnych przepisach UE."
        ],
      },
    ],
    checklist: [
      "Zarezerwuj camping dopiero po przeczytaniu regulaminu dla zwierząt.",
      "Potwierdź mailowo możliwość pobytu psa w wybranym typie zakwaterowania.",
      "Sprawdź paszport, mikroczip i datę szczepienia przeciw wściekliźnie.",
      "Znajdź najbliższego weterynarza i zasady lokalnych plaż dla psów.",
      "Na długą trasę autem zaplanuj postoje i temperaturę w samochodzie."
    ],
    faq: [
      { question: "Który kraj w Europie jest najbardziej przyjazny psom na campingach?", answer: "Nie ma jednego oficjalnego rankingu. Duże katalogi campingowe pokazują szeroki wybór obiektów przyjaznych psom m.in. w Niemczech, Włoszech, Austrii i Chorwacji. Ważniejszy od kraju jest regulamin konkretnego campingu." },
      { question: "Czy pies potrzebuje paszportu w UE?", answer: "Przy podróży między krajami UE pies co do zasady podróżuje z unijnym paszportem zwierzęcia, mikroczipem i aktualnym szczepieniem przeciw wściekliźnie." },
      { question: "Czy camping może przyjmować psy, ale nie wpuszczać ich na plażę?", answer: "Tak. Zasady campingu i zasady plaży lub kąpieliska mogą być różne, dlatego sprawdź oba regulaminy przed rezerwacją." },
    ],
    sources: [
      { label: "Your Europe — podróżowanie ze zwierzętami w UE", url: "https://europa.eu/youreurope/citizens/travel/carry/pets-and-other-animals/index_pl.htm" },
      { label: "Komisja Europejska — psy, koty i fretki", url: "https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets_en" },
      { label: "camping.info — camping z psem w Europie", url: "https://www.camping.info/en/topic/camping-with-dog" },
    ],
  },

  "/etna-sparalizowala-loty-na-sycylie-co-zrobic-po-odwolaniu-lotu-do-katanii": {
    kicker: "SYCYLIA / ETNA — LOTY 2026",
    title: "Odwołany lot do Katanii przez Etnę? Zrób te rzeczy w tej kolejności",
    quickAnswer: "Najpierw sprawdź status konkretnego lotu u przewoźnika i na stronie lotniska w Katanii. Aktywność Etny może powodować czasowe zamknięcie części przestrzeni, opóźnienia, przekierowania lub odwołania. Jeśli lot zostanie odwołany, przewoźnik powinien zaoferować wybór między zwrotem kosztu biletu a zmianą trasy; prawo do dodatkowego odszkodowania zależy od przyczyny i okoliczności.",
    checkedAt: "13.09.2026",
    searchPresets: ["Sycylia"],
    searchMode: "all",
    sections: [
      {
        title: "Co robić, gdy Etna wpływa na loty",
        bullets: [
          "Nie jedź na lotnisko tylko na podstawie starego komunikatu — sprawdź status swojego numeru lotu u przewoźnika.",
          "Sprawdź aktualności i flight tracking lotniska Catania-Fontanarossa.",
          "Jeśli linia proponuje zmianę trasy, porównaj Katanię z Palermo, Comiso lub innym rozwiązaniem tylko wtedy, gdy przewoźnik potwierdza nowy plan podróży.",
          "Zachowaj potwierdzenia, rachunki i komunikaty dotyczące odwołania lub opóźnienia."
        ],
      },
      {
        title: "Zwrot, zmiana lotu czy odszkodowanie?",
        table: {
          headers: ["Sytuacja", "Co sprawdzić"],
          rows: [
            ["Lot odwołany", "Wybór między zwrotem kosztu a zmianą planu podróży zgodnie z prawami pasażera UE"],
            ["Długie oczekiwanie", "Prawo do opieki może obejmować posiłki, napoje i — gdy trzeba — nocleg"],
            ["Aktywność wulkaniczna / decyzje kontroli ruchu", "Mogą stanowić nadzwyczajne okoliczności, więc dodatkowe odszkodowanie pieniężne nie jest automatyczne"],
            ["Brak jasnej informacji od linii", "Poproś przewoźnika o pisemne wskazanie przyczyny zakłócenia"],
          ],
        },
      },
      {
        title: "Czy loty do Katanii są dziś odwołane?",
        paragraphs: [
          "Tego nie da się odpowiedzialnie ustalić z jednego artykułu, bo sytuacja może zmieniać się w ciągu godzin. Lotnisko w Katanii publikuje bieżące komunikaty związane z Etną i osobny tracking lotów. Zawsze sprawdzaj numer swojego rejsu bezpośrednio przed wyjazdem na lotnisko."
        ],
      },
    ],
    checklist: [
      "Sprawdź aplikację i stronę swojej linii lotniczej.",
      "Sprawdź flight tracking lotniska w Katanii.",
      "Zapisz komunikat o przyczynie odwołania lub opóźnienia.",
      "Nie anuluj samodzielnie rezerwacji przed poznaniem opcji zaproponowanych przez przewoźnika.",
      "Zachowuj rachunki za rozsądne wydatki podczas oczekiwania."
    ],
    faq: [
      { question: "Czy Etna może odwołać loty do Katanii?", answer: "Tak. W 2026 roku lotnisko w Katanii publikowało czasowe ograniczenia i zawieszenia operacji związane z aktywnością Etny oraz późniejsze wznowienia lotów." },
      { question: "Czy za odwołanie z powodu erupcji należy się 250–600 euro?", answer: "Nie automatycznie. Nadzwyczajne okoliczności mogą zwolnić linię z obowiązku wypłaty standardowego odszkodowania, ale nie znoszą podstawowych praw do zmiany trasy lub zwrotu oraz — w odpowiednich sytuacjach — opieki." },
      { question: "Gdzie sprawdzić aktualny status lotu do Katanii?", answer: "Najpierw u przewoźnika dla konkretnego numeru lotu, a następnie w oficjalnym flight trackingu i komunikatach lotniska Catania-Fontanarossa." },
    ],
    sources: [
      { label: "Catania Airport — aktualności i komunikaty Etna", url: "https://aeroporto.catania.it/en/news" },
      { label: "Catania Airport — flight tracking", url: "https://aeroporto.catania.it/en/flight-tracking/arrivals" },
      { label: "Your Europe — prawa pasażerów lotniczych", url: "https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_pl.htm" },
    ],
  },
};

export function getArticleDeepDiveWave9(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return wave9[normalized];
}
