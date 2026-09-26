import Link from "next/link";
import RelatedTravelGuides from "@/components/RelatedTravelGuides";
import { destinationGuidePaths } from "@/lib/destinationGuides";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticlePartnerSearch from "@/components/ArticlePartnerSearch";
import ArticleDeepDiveBlock from "@/components/ArticleDeepDiveBlock";
import ArticleShare from "@/components/ArticleShare";
import DestinationLandingPanel, { hasDestinationLanding } from "@/components/DestinationLandingPanel";
import type { LegacyItem } from "@/lib/legacy";
import { legacyCanonicalPath } from "@/lib/legacy";
import { offers } from "@/lib/offers";
import { getArticleContext, type ArticleContext } from "@/lib/articleContext";
import { getArticleDeepDive } from "@/lib/articleDeepDive";
import { getArticleDeepDiveWave7 } from "@/lib/articleDeepDiveWave7";
import { getArticleDeepDiveWave8 } from "@/lib/articleDeepDiveWave8";
import { getArticleDeepDiveWave9 } from "@/lib/articleDeepDiveWave9";

type GrowthLink = { href: string; label: string };

type SeoOpportunityBlock = { title: string; lead: string; links: GrowthLink[] };

const seoOpportunityBlocks: Record<string, SeoOpportunityBlock> = {
  "/babski-wyjazd-za-granice-12-najlepszych-kierunkow-z-przyjaciolkami": {
    title: "Gdzie na babski weekend za granicą?",
    lead: "Na 2–4 dni najlepiej sprawdzają się kierunki z prostym lotem, szybkim transferem i dużym wyborem restauracji, atrakcji oraz noclegów. Porównaj kilka miast dla tego samego terminu zamiast zaczynać od jednego kierunku.",
    links: [
      { href: "/city-break", label: "Aktualne city breaki" },
      { href: "/malta", label: "Malta na babski weekend" },
      { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
      { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
    ],
  },
  "/alicante-czy-malaga-gdzie-lepiej-poleciec-na-wakacje": {
    title: "Malaga czy Alicante — co wybrać?",
    lead: "Malaga leży w Andaluzji i daje więcej klasycznego zwiedzania oraz dostęp do Costa del Sol. Alicante leży w Walencji, ma kompaktowe centrum i łatwy dostęp do Costa Blanca. Na krótki city break wygodniejsze bywa Alicante, a przy dłuższym wyjeździe i objazdowym zwiedzaniu Malaga daje więcej opcji.",
    links: [
      { href: "/hiszpania", label: "Hiszpania — porównaj regiony" },
      { href: "/city-break", label: "Aktualne city breaki" },
      { href: "/podroze/city-break-listopad-2026", label: "City break — listopad 2026" },
    ],
  },
  "/sagrada-familia-osiagnela-maksymalna-wysokosc-20-lutego-2026-historyczna-data-dla-barcelony": {
    title: "Jak wysoka jest Sagrada Familia?",
    lead: "Docelowa wysokość centralnej wieży Jezusa Chrystusa to 172,5 m. Dzięki temu bazylika pozostaje nieco niższa od wzgórza Montjuïc, zgodnie z zamysłem Gaudíego. Jeśli szukasz samej liczby: 172,5 metra.",
    links: [
      { href: "/city-break", label: "City break do Barcelony" },
      { href: "/hiszpania", label: "Hiszpania — kierunki i wakacje" },
    ],
  },
  "/etna-sparalizowala-loty-na-sycylie-co-zrobic-po-odwolaniu-lotu-do-katanii": {
    title: "Czy loty do Katanii są odwołane?",
    lead: "Nie da się odpowiedzieć jednym stałym komunikatem — status zmienia się zależnie od aktywności Etny i konkretnego rejsu. Sprawdź numer lotu u przewoźnika i w oficjalnym flight trackingu lotniska Catania-Fontanarossa przed wyjazdem na lotnisko.",
    links: [
      { href: "/tanie-loty", label: "Sprawdź alternatywne loty" },
      { href: "/ubezpieczenia", label: "Ubezpieczenie podróżne" },
      { href: "/alerty", label: "Ustaw alert podróżniczy" },
    ],
  },
  "/wyspy-zielonego-przyladka": {
    title: "Sal czy Boa Vista — którą wyspę wybrać?",
    lead: "Sal ma więcej infrastruktury, restauracji i wycieczek wokół Santa Maria. Boa Vista jest spokojniejsza, bardziej resortowa i mocniej nastawiona na plażę. Jeśli chcesz więcej rzeczy poza hotelem, zwykle łatwiejsza jest Sal; jeśli priorytetem jest odpoczynek i resort, sprawdź Boa Vista.",
    links: [
      { href: "/podroze/wyspy-zielonego-przyladka-listopad-2026", label: "Cabo Verde — listopad 2026" },
      { href: "/podroze/wyspy-zielonego-przyladka-grudzien-2026", label: "Cabo Verde — grudzień 2026" },
      { href: "/wakacje", label: "Aktualne wakacje" },
    ],
  },
  "/jak-zorganizowac-wyjazd-samodzielnie-bez-biura-podrozy": {
    title: "Jak wygląda indywidualne planowanie podróży?",
    lead: "Najprościej zacząć od terminu i budżetu, potem wybrać kierunek, lot, nocleg i dopiero atrakcje oraz transfer. W planerze Tripowni możesz zebrać te elementy w jednym miejscu i zaznaczyć, co masz już zarezerwowane.",
    links: [
      { href: "/planer-podrozy", label: "Otwórz darmowy planer podróży" },
      { href: "/moja-podroz", label: "Zbuduj swoją podróż" },
      { href: "/przed-wyjazdem", label: "Checklista przed wyjazdem" },
    ],
  },
  "/najlepsze-aplikacje-podroznicze-10-aplikacji-ktore-ulatwia-kazda-podroz": {
    title: "Jaka aplikacja do zwiedzania miast?",
    lead: "Na wyjeździe warto rozdzielić potrzeby: mapa i transport, atrakcje, rezerwacje oraz plan całej podróży. Tripownia może pełnić rolę organizera wyjazdu, a do nawigacji i transportu warto korzystać z aplikacji wyspecjalizowanych w danym mieście.",
    links: [
      { href: "/planer-podrozy", label: "Planer podróży Tripowni" },
      { href: "/atrakcje", label: "Atrakcje i bilety" },
      { href: "/transfery", label: "Transfery lotniskowe" },
    ],
  },
  "/bulgaria": {
    title: "Wyjazd do Bułgarii — który region wybrać?",
    lead: "Słoneczny Brzeg daje największy wybór hoteli i rozrywki, Nessebar łączy plażę ze zwiedzaniem, a Złote Piaski i okolice Warny są dobrym punktem startowym na północnym wybrzeżu. Przy wyborze porównaj przede wszystkim region, transfer i standard hotelu.",
    links: [
      { href: "/wakacje", label: "Aktualne wakacje" },
      { href: "/last-minute", label: "Last minute" },
      { href: "/wakacje-z-dziecmi", label: "Wakacje z dziećmi" },
    ],
  },
  "/cypr": {
    title: "Cypr na wakacje — Pafos, Larnaka czy Ayia Napa?",
    lead: "Pafos łączy plaże ze zwiedzaniem, Larnaka jest wygodną bazą z lotniskiem blisko miasta, a Ayia Napa i Protaras są mocniej nastawione na plaże i kurortowy wypoczynek. Wybór zależy od tego, czy ważniejsze jest zwiedzanie, plaża czy spokojniejszy pobyt.",
    links: [
      { href: "/wakacje", label: "Wakacje na Cyprze" },
      { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe kierunki — listopad" },
      { href: "/last-minute", label: "Last minute" },
    ],
  },
  "/warszawa-modlin": {
    title: "Gdzie można polecieć z Modlina?",
    lead: "Najlepiej zaczynać od aktualnej siatki połączeń i terminu, a nie od jednej z góry wybranej destynacji. Dla krótkiego wyjazdu porównaj godziny lotów, koszt dojazdu do Modlina i transfer z lotniska docelowego.",
    links: [
      { href: "/city-break", label: "City break" },
      { href: "/tanie-loty", label: "Tanie loty" },
      { href: "/last-minute", label: "Last minute" },
    ],
  },
  "/wakacje-ze-szczecina-all-inclusive-last-minute-i-lot-hotel": {
    title: "Last minute ze Szczecina — od czego zacząć?",
    lead: "Przy wylocie ze Szczecina-Goleniowa najpierw sprawdź realną dostępność z SZZ dla wybranego terminu. Jeśli lokalnych opcji jest mało, dopiero wtedy porównaj alternatywne lotniska po doliczeniu dojazdu.",
    links: [
      { href: "/podroze/wakacje-ze-szczecina", label: "Wakacje ze Szczecina" },
      { href: "/podroze/city-break-ze-szczecina", label: "City break ze Szczecina" },
      { href: "/last-minute", label: "Aktualne last minute" },
    ],
  },
  "/wakacje-z-poznania": {
    title: "City break z Poznania — gdzie polecieć na 2–5 dni?",
    lead: "Przy krótkim wyjeździe z Poznania najlepiej porównywać nie tylko cenę biletu, ale też godziny lotów i transfer z lotniska docelowego. Jeśli liczy się weekend, wybierz kierunek, który daje pełne dwa lub trzy dni na miejscu.",
    links: [
      { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
      { href: "/podroze/last-minute-z-poznania", label: "Last minute z Poznania" },
      { href: "/podroze/wakacje-z-poznania", label: "Wakacje z Poznania" },
    ],
  },
  "/krakow": {
    title: "City break z Krakowa — lot + hotel z Balic",
    lead: "Na city break z Krakowa porównaj kierunki dla tego samego weekendu i zwróć uwagę na godziny wylotu oraz powrotu. Przy pobycie 2–5 dni dobry rozkład lotów często daje więcej niż kilkadziesiąt złotych oszczędności.",
    links: [
      { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
      { href: "/podroze/last-minute-z-krakowa", label: "Last minute z Krakowa" },
      { href: "/podroze/wakacje-z-krakowa", label: "Wakacje z Krakowa" },
    ],
  },
  "/wakacje-z-gdanska-2": {
    title: "City break z Gdańska — lot + hotel i krótki weekend",
    lead: "Z Gdańska warto porównywać kilka miast dla tych samych dat. Przy krótkim wyjeździe znaczenie mają bezpośredni lot, szybki transfer do centrum i godziny, które nie zabierają połowy pierwszego lub ostatniego dnia.",
    links: [
      { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
      { href: "/podroze/last-minute-z-gdanska", label: "Last minute z Gdańska" },
      { href: "/podroze/wakacje-z-gdanska", label: "Wakacje z Gdańska" },
    ],
  },
  "/lublin-wakacje-city-break": {
    title: "City break z Lublina — dokąd polecieć z LUZ?",
    lead: "Przy wylocie z Lublina najpierw sprawdź bezpośrednie połączenia dla wybranego terminu. Na 2–5 dni wybieraj kierunki, gdzie lot i transfer zostawiają dużo czasu na miejscu.",
    links: [
      { href: "/podroze/city-break-z-lublina", label: "City break z Lublina" },
      { href: "/podroze/wakacje-z-lublina", label: "Wakacje z Lublina" },
      { href: "/podroze/tanie-loty-z-lublina", label: "Tanie loty z Lublina" },
    ],
  },
  "/wakacje-z-olsztyna-mazur-all-inclusive-last-minute-i-lot-hotel": {
    title: "Last minute z Olsztyna-Mazur — wyloty z Szyman",
    lead: "Jeśli chcesz lecieć z Szyman, najpierw sprawdź realną dostępność z SZY dla konkretnego tygodnia. Lokalny wylot może być wygodniejszy nawet przy nieco wyższej cenie, jeśli odpada koszt i czas dojazdu do innego lotniska.",
    links: [
      { href: "/podroze/last-minute-z-olsztyna-mazur", label: "Last minute z Olsztyna-Mazur" },
      { href: "/podroze/wakacje-z-olsztyna-mazur", label: "Wakacje z Olsztyna-Mazur" },
      { href: "/podroze/city-break-z-olsztyna-mazur", label: "City break z Olsztyna-Mazur" },
    ],
  },
  "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute": {
    title: "Wyspy Kanaryjskie All Inclusive — którą wyspę wybrać?",
    lead: "Teneryfa daje najwięcej różnorodności i zwiedzania, Gran Canaria łączy kurorty z większym wyborem miejscowości, Fuerteventura jest mocna plażowo, a Lanzarote wyróżnia się krajobrazem. Przy All Inclusive porównaj też region i transfer, nie tylko nazwę wyspy.",
    links: [
      { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Kanary — listopad 2026" },
      { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Kanary — grudzień 2026" },
      { href: "/wakacje", label: "Aktualne wakacje" },
    ],
  },
  "/wlochy": {
    title: "City break we Włoszech — Rzym, Mediolan, Bari czy Neapol?",
    lead: "Rzym jest najmocniejszy na klasyczne zwiedzanie, Mediolan sprawdza się na bardzo krótki wypad, Bari daje dostęp do Apulii, a Neapol łączy miasto z Pompejami i wybrzeżem. Przy 2–4 dniach wybieraj przede wszystkim pod dobry rozkład lotów.",
    links: [
      { href: "/city-break", label: "Aktualne city breaki" },
      { href: "/podroze/city-break-listopad-2026", label: "City break — listopad 2026" },
      { href: "/tanie-loty", label: "Tanie loty" },
    ],
  },
  "/gdzie-poleciec-na-weekend-z-polski-12-pomyslow-na-city-break": {
    title: "Gdzie polecieć na weekend z Polski?",
    lead: "Na 2–4 dni najlepiej wybierać miasta z bezpośrednim lotem, szybkim transferem do centrum i godzinami, które nie zabierają całego pierwszego ani ostatniego dnia. Dopiero potem porównuj cenę samego biletu.",
    links: [
      { href: "/city-break", label: "Aktualne city breaki" },
      { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
      { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
      { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
    ],
  },
  "/maroko": {
    title: "Maroko na wakacje — Agadir czy Marrakesz?",
    lead: "Agadir jest lepszy, jeśli priorytetem są plaża, hotel i spokojniejszy wypoczynek. Marrakesz wygrywa klimatem miasta, riadami, jedzeniem i zwiedzaniem. Na All Inclusive częściej zaczynaj od Agadiru, a na city break od Marrakeszu.",
    links: [
      { href: "/wakacje", label: "Aktualne wakacje" },
      { href: "/city-break", label: "City break" },
      { href: "/last-minute", label: "Last minute" },
    ],
  },
  "/egipt": {
    title: "Egipt All Inclusive — Hurghada, Marsa Alam czy Sharm?",
    lead: "Hurghada daje największy wybór hoteli i łatwą logistykę, Marsa Alam jest spokojniejsze i mocne pod rafę, a Sharm el Sheikh łączy resorty z dobrym snorkelingiem i nurkowaniem. Porównuj konkretny hotel i długość transferu, nie tylko region.",
    links: [
      { href: "/podroze/egipt-listopad-2026", label: "Egipt — listopad 2026" },
      { href: "/wakacje", label: "Aktualne wakacje" },
      { href: "/last-minute", label: "Last minute" },
    ],
  },
  "/lotniska-w-polsce-bez-limitu-100-ml-plynow": {
    title: "Które lotniska w Polsce zniosły limit płynów?",
    lead: "Zasady zależą od lotniska i zastosowanej kontroli bezpieczeństwa. Przed wylotem sprawdź aktualną informację dla konkretnego portu, zamiast zakładać, że jedna zasada obowiązuje w całej Polsce.",
    links: [
      { href: "/przed-wyjazdem", label: "Checklista przed wylotem" },
      { href: "/tanie-loty", label: "Tanie loty" },
      { href: "/poradniki", label: "Poradniki podróżnicze" },
    ],
  },
  "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych": {
    title: "Czy bagaż podręczny jest ważony i ile sztuk można zabrać?",
    lead: "Tak — linie mogą sprawdzać zarówno wagę, jak i wymiary bagażu. Liczba sztuk i limity zależą od przewoźnika oraz taryfy, dlatego przed lotem warto sprawdzić zasady dla konkretnego biletu.",
    links: [
      { href: "/przed-wyjazdem", label: "Checklista przed wylotem" },
      { href: "/czy-mozna-wniesc-jedzenie-do-samolotu-co-wolno-zabrac-na-poklad", label: "Jedzenie w bagażu podręcznym" },
      { href: "/poradniki", label: "Więcej poradników" },
    ],
  },
  "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu": {
    title: "Jak najtaniej dojechać z lotniska do centrum?",
    lead: "Najtańszy bywa autobus lub pociąg, ale przy 2–4 osobach taxi albo transfer może mieć podobny koszt na osobę. Porównuj cenę, czas dojazdu i godzinę przylotu, a nie tylko najniższą stawkę.",
    links: [
      { href: "/transfery", label: "Transfery lotniskowe" },
      { href: "/city-break", label: "City break" },
      { href: "/planer-podrozy", label: "Planer podróży" },
    ],
  },
  "/jak-tanio-podrozowac-po-europie-10-sposobow-na-tansze-wyjazdy": {
    title: "Jak tanio podróżować po Europie?",
    lead: "Największe oszczędności zwykle daje elastyczny termin, porównanie kilku lotnisk, mały bagaż, nocleg poza ścisłym centrum i liczenie całego kosztu wyjazdu zamiast samego biletu.",
    links: [
      { href: "/tanie-loty", label: "Tanie loty" },
      { href: "/city-break", label: "City break" },
      { href: "/okazje", label: "Okazje Tripowni" },
    ],
  },
  "/jak-znalezc-tani-hotel-8-sposobow-na-oszczednosc-przy-rezerwacji-noclegow": {
    title: "Jak znaleźć tani hotel bez przepłacania?",
    lead: "Porównaj nie tylko cenę pokoju, ale też lokalizację, dojazdy, podatki lokalne, śniadanie i warunki anulowania. Tańszy nocleg daleko od centrum może wyjść drożej po doliczeniu transportu.",
    links: [
      { href: "/hotele", label: "Hotele i noclegi" },
      { href: "/planer-podrozy", label: "Planer podróży" },
      { href: "/city-break", label: "City break" },
    ],
  },
  "/gdzie-na-sylwestra-2026-2027-15-kierunkow": {
    title: "Gdzie polecieć na Sylwestra 2026/2027?",
    lead: "Na przełom roku warto najpierw zdecydować, czy chcesz city break, ciepły kierunek czy dłuższy wyjazd. Potem porównaj pogodę, długość lotu, ceny noclegów i dostępność powrotów 1–3 stycznia.",
    links: [
      { href: "/sylwester", label: "City break na Sylwestra" },
      { href: "/sylwester-2026-2027-za-granica-gdzie-poleciec-na-nowy-rok", label: "Ciepłe kraje na Sylwestra" },
      { href: "/okazje", label: "Aktualne okazje" },
    ],
  },
  "/sylwester-2026-2027-za-granica-gdzie-poleciec-na-nowy-rok": {
    title: "Ciepłe kraje na Sylwestra — gdzie szukać słońca?",
    lead: "Na krótszy lot sprawdź Egipt, Kanary, Maltę i Cypr, a przy większym budżecie także dalsze kierunki. Porównuj nie tylko temperaturę powietrza, ale też temperaturę wody, wiatr i długość dnia.",
    links: [
      { href: "/gdzie-na-sylwestra-2026-2027-15-kierunkow", label: "15 kierunków na Sylwestra" },
      { href: "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu", label: "Ciepło zimą bez dalekiego lotu" },
      { href: "/wakacje", label: "Aktualne wakacje" },
    ],
  },
  "/wakacje-z-psem-za-granica-gdzie-jechac-i-jak-sie-przygotowac": {
    title: "Gdzie na wakacje z psem za granicę?",
    lead: "Najłatwiejsze są kierunki z prostym dojazdem, dużą bazą noclegów przyjaznych zwierzętom i jasnymi zasadami wstępu na plaże oraz campingi. Przed wyjazdem sprawdź dokumenty psa, szczepienia i regulamin noclegu.",
    links: [
      { href: "/ubezpieczenia", label: "Ubezpieczenie podróżne" },
      { href: "/przed-wyjazdem", label: "Checklista przed wyjazdem" },
      { href: "/poradniki", label: "Więcej poradników" },
    ],
  },
};

function norm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function checkedAtIso(value?: string) {
  if (!value) return undefined;
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return undefined;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

const relatedDestinationAliases: Record<string, string[]> = {
  sycylia: ["sycylia", "catania", "palermo"],
  albania: ["albania", "saranda", "vlora", "ksamil", "durres"],
  wietnam: ["wietnam", "hanoi", "da nang", "phu quoc", "ho chi minh"],
  cypr: ["cypr", "pafos", "larnaka", "larnaca"],
  hiszpania: ["hiszpania", "majorka", "teneryfa", "alicante", "malaga", "barcelona"],
};

function relatedOffers(context: ArticleContext, destinationOverride?: string) {
  const selectedDestination = destinationOverride || context.destination;
  if (selectedDestination) {
    const destination = norm(selectedDestination);
    const terms = relatedDestinationAliases[destination] || [destination];
    const matched = offers.filter((offer) => {
      const city = norm(offer.city);
      const country = norm(offer.country);
      return terms.some((term) => term.includes(city) || term.includes(country) || city.includes(term) || country.includes(term));
    }).slice(0, 3);
    if (matched.length) return matched;
  }

  if (context.mode === "city") {
    return offers.filter((offer) => offer.category.includes("city") || offer.category.includes("weekend")).slice(0, 3);
  }

  if (context.mode === "holiday" || context.mode === "lastminute") {
    return offers.filter((offer) => offer.category.includes("allinclusive") || offer.category.includes("plaza") || offer.category.includes("cieplo")).slice(0, 3);
  }

  return [];
}

function contextualGrowthLinks(item: LegacyItem): GrowthLink[] {
  const canonicalPath = legacyCanonicalPath(item.path);
  const hay = `${item.title} ${canonicalPath}`.toLowerCase();

  const airportLandingLinks: Record<string, GrowthLink[]> = {
    "/wakacje-z-poznania": [
      { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
      { href: "/podroze/last-minute-z-poznania", label: "Last minute z Poznania" },
      { href: "/podroze/wakacje-z-poznania", label: "Wakacje z Poznania" },
    ],
    "/krakow": [
      { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
      { href: "/podroze/last-minute-z-krakowa", label: "Last minute z Krakowa" },
      { href: "/podroze/wakacje-z-krakowa", label: "Wakacje z Krakowa" },
    ],
    "/wakacje-z-gdanska-2": [
      { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
      { href: "/podroze/last-minute-z-gdanska", label: "Last minute z Gdańska" },
      { href: "/podroze/wakacje-z-gdanska", label: "Wakacje z Gdańska" },
    ],
    "/wroclaw": [
      { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
      { href: "/podroze/last-minute-z-wroclawia", label: "Last minute z Wrocławia" },
      { href: "/podroze/wakacje-z-wroclawia", label: "Wakacje z Wrocławia" },
    ],
    "/katowice": [
      { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
      { href: "/podroze/last-minute-z-katowic", label: "Last minute z Katowic" },
      { href: "/podroze/wakacje-z-katowic", label: "Wakacje z Katowic" },
    ],
    "/lublin-wakacje-city-break": [
      { href: "/podroze/city-break-z-lublina", label: "City break z Lublina" },
      { href: "/podroze/wakacje-z-lublina", label: "Wakacje z Lublina" },
      { href: "/podroze/tanie-loty-z-lublina", label: "Tanie loty z Lublina" },
    ],
    "/wakacje-z-olsztyna-mazur-all-inclusive-last-minute-i-lot-hotel": [
      { href: "/podroze/last-minute-z-olsztyna-mazur", label: "Last minute z Olsztyna-Mazur" },
      { href: "/podroze/wakacje-z-olsztyna-mazur", label: "Wakacje z Olsztyna-Mazur" },
      { href: "/podroze/city-break-z-olsztyna-mazur", label: "City break z Olsztyna-Mazur" },
    ],
    "/wakacje-z-rzeszowa-all-inclusive-last-minute-i-lot-hotel": [
      { href: "/podroze/last-minute-z-rzeszowa", label: "Last minute z Rzeszowa" },
      { href: "/podroze/wakacje-z-rzeszowa", label: "Wakacje z Rzeszowa" },
      { href: "/podroze/city-break-z-rzeszowa", label: "City break z Rzeszowa" },
    ],
  };
  if (airportLandingLinks[canonicalPath]) return airportLandingLinks[canonicalPath];
  if (hay.includes("limit") && hay.includes("płyn")) return [
    { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
    { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
    { href: "/podroze/city-break-z-katowic", label: "City break z Katowic" },
    { href: "/podroze/city-break-z-gdanska", label: "City break z Gdańska" },
    { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
    { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
  ];
  if (hay.includes("listopad") && (hay.includes("ciepło") || hay.includes("gdzie"))) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe wakacje — listopad 2026" },
    { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Wyspy Kanaryjskie — listopad" },
    { href: "/podroze/egipt-listopad-2026", label: "Egipt — listopad 2026" },
    { href: "/podroze/malta-listopad-2026", label: "Malta — listopad 2026" },
  ];
  if (hay.includes("październik") || hay.includes("pazdziernik")) return [
    { href: "/podroze/city-break-pazdziernik-2026", label: "City break — październik 2026" },
    { href: "/podroze/teneryfa-z-warszawy", label: "Teneryfa z Warszawy" },
    { href: "/podroze/wakacje-do-2500-zl", label: "Wakacje do 2500 zł" },
  ];
  if (hay.includes("grecj")) return [
    { href: "/podroze/wakacje-do-2500-zl", label: "Wakacje do 2500 zł" },
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe kierunki po sezonie" },
    { href: "/wakacje", label: "Aktualne wakacje" },
  ];
  if (hay.includes("hiszpan")) return [
    { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Kanary — listopad" },
    { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Kanary — grudzień" },
    { href: "/city-break", label: "City break w Hiszpanii" },
  ];
  if (hay.includes("wietnam") || hay.includes("hanoi")) return [
    { href: "/dalekie-podroze", label: "Dalekie podróże" },
    { href: "/okazje", label: "Aktualne okazje" },
    { href: "/alerty", label: "Ustaw alert na Wietnam" },
  ];
  if (hay.includes("cypr")) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Ciepłe kierunki — listopad" },
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/last-minute", label: "Last minute" },
  ];
  if (hay.includes("alban")) return [
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/last-minute", label: "Last minute" },
    { href: "/wynajem-auta", label: "Wynajem auta" },
  ];
  if (hay.includes("malta")) return [
    { href: "/podroze/malta-listopad-2026", label: "Malta — listopad 2026" },
    { href: "/city-break", label: "City break" },
    { href: "/tanie-loty", label: "Tanie loty" },
  ];
  if (hay.includes("kanar")) return [
    { href: "/podroze/wyspy-kanaryjskie-listopad-2026", label: "Kanary — listopad 2026" },
    { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Kanary — grudzień 2026" },
    { href: "/podroze/teneryfa-z-warszawy", label: "Teneryfa z Warszawy" },
  ];
  if (hay.includes("riwiera turecka") || hay.includes("egejska")) return [
    { href: "/last-minute", label: "Last minute do Turcji" },
    { href: "/wakacje", label: "Wakacje All Inclusive" },
    { href: "/okazje", label: "Dzisiejsze okazje" },
  ];
  if (hay.includes("weekend") || hay.includes("city break")) return [
    { href: "/city-break", label: "Aktualne city breaki" },
    { href: "/podroze/city-break-z-warszawy", label: "City break z Warszawy" },
    { href: "/podroze/city-break-z-poznania", label: "City break z Poznania" },
    { href: "/podroze/city-break-z-wroclawia", label: "City break z Wrocławia" },
  ];
  if (hay.includes("ciepło") || hay.includes("cieplo")) return [
    { href: "/podroze/cieple-wakacje-listopad-2026", label: "Gdzie ciepło w listopadzie" },
    { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Gdzie ciepło w grudniu" },
    { href: "/podroze/wyspy-kanaryjskie-grudzien-2026", label: "Kanary — grudzień 2026" },
  ];
  if (hay.includes("sylwestr")) return [
    { href: "/sylwester", label: "Aktualne pomysły na Sylwestra" },
    { href: "/podroze/city-break-grudzien-2026", label: "City break — grudzień 2026" },
    { href: "/podroze/cieple-wakacje-grudzien-2026", label: "Ciepłe kierunki w grudniu" },
    { href: "/dalekie-podroze", label: "Dalekie podróże" },
  ];
  if (hay.includes("psem") || hay.includes("z psem")) return [
    { href: "/wakacje", label: "Aktualne wakacje" },
    { href: "/wynajem-auta", label: "Wynajem auta na wyjazd" },
    { href: "/ubezpieczenia", label: "Ubezpieczenie podróżne" },
  ];
  if (hay.includes("etna") || hay.includes("sycyli") || hay.includes("katanii")) return [
    { href: "/tanie-loty", label: "Sprawdź aktualne loty" },
    { href: "/ubezpieczenia", label: "Ubezpieczenie podróżne" },
    { href: "/alerty", label: "Ustaw alert podróżniczy" },
  ];
  if (hay.includes("dojechac") || hay.includes("dojechać") || hay.includes("dostać się z lotniska")) return [
    { href: "/transfery", label: "Transfery lotniskowe" },
    { href: "/wynajem-auta", label: "Wynajem auta" },
    { href: "/city-break", label: "City break" },
  ];
  if (hay.includes("bagaż") || hay.includes("karta pokładowa") || hay.includes("jedzenie do samolotu") || hay.includes("lotnisk")) return [
    { href: "/tanie-loty", label: "Sprawdź tanie loty" },
    { href: "/city-break", label: "Znajdź city break" },
    { href: "/podroze/city-break-z-krakowa", label: "City break z Krakowa" },
  ];
  return [
    { href: "/okazje", label: "Dzisiejsze okazje" },
    { href: "/podroze", label: "Podróże według potrzeb" },
    { href: "/alerty", label: "Ustaw alert podróżniczy" },
  ];
}

export default function LegacyPage({ item }: { item: LegacyItem }) {
  const context = getArticleContext(item);
  const growthLinks = contextualGrowthLinks(item);
  const archived = item.type === "product";
  const canonicalPath = legacyCanonicalPath(item.path);
  const isDestination = destinationGuidePaths.includes(canonicalPath);
  const hasConversionPanel = hasDestinationLanding(canonicalPath);
  const seoOpportunity = seoOpportunityBlocks[canonicalPath];
  const parent = isDestination ? { name: "Kierunki", href: "/kierunki" }
    : item.type === "post" ? { name: "Poradniki", href: "/poradniki" }
    : { name: archived ? "Archiwum ofert" : "Okazje", href: "/okazje" };
  const canonicalUrl = `https://tripownia.pl${canonicalPath}`;
  const deepDiveLookupPath = canonicalPath.startsWith("/gdzie-jest-cieplo-w-pazdzierniku")
    ? "/gdzie-jest-cieplo-w-pazdzierniku"
    : canonicalPath;
  const deepDive = item.type === "post"
    ? getArticleDeepDiveWave9(deepDiveLookupPath) || getArticleDeepDiveWave8(deepDiveLookupPath) || getArticleDeepDiveWave7(deepDiveLookupPath) || getArticleDeepDive(deepDiveLookupPath)
    : undefined;
  const effectiveDestination = context.destination || deepDive?.searchPresets?.[0];
  const related = relatedOffers(context, effectiveDestination);
  const shouldRenderSearch = item.type === "post"
    && !deepDive?.hideSearch
    && (context.hasUsefulSearchContext || Boolean(deepDive?.searchPresets?.length));
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Tripownia", item: "https://tripownia.pl/" },
      { "@type": "ListItem", position: 2, name: parent.name, item: `https://tripownia.pl${parent.href}` },
      { "@type": "ListItem", position: 3, name: item.title, item: canonicalUrl },
    ],
  };
  const dateModified = checkedAtIso(deepDive?.checkedAt);
  const articleJsonLd = item.type === "post" ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.description || undefined,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    dateModified,
    inLanguage: "pl-PL",
    author: {
      "@type": "Organization",
      "@id": "https://tripownia.pl/#organization",
      name: "Redakcja Tripowni",
      url: "https://tripownia.pl/o-tripowni",
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://tripownia.pl/#organization",
      name: "Tripownia",
      url: "https://tripownia.pl",
      logo: { "@type": "ImageObject", url: "https://tripownia.pl/tripownia-logo.webp" },
      publishingPrinciples: "https://tripownia.pl/standardy-redakcyjne",
    },
  } : null;

  return <main><SiteHeader/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbJsonLd).replace(/</g,"\\u003c")}}/>
    {articleJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleJsonLd).replace(/</g,"\\u003c")}}/>}
    <div className="legacy-shell shell">
      <div className="legacy-breadcrumb"><Link href="/">Tripownia</Link><span>›</span><Link href={parent.href}>{parent.name}</Link><span>›</span><span aria-current="page">{item.title}</span></div>
      {archived && <div className="archive-banner"><strong>Oferta archiwalna</strong><span>Cena i dostępność mogły się zmienić. Na dole znajdziesz aktualne propozycje.</span></div>}
      {hasConversionPanel && <DestinationLandingPanel path={canonicalPath} />}
      <article className="legacy-article">
        {!hasConversionPanel && <header>
          <div className="kicker">{archived ? "ARCHIWUM OFERT" : item.type === "post" ? "MAGAZYN TRIPOWNI" : "TRIPOWNIA"}</div>
          <h1>{item.title}</h1>
          {item.type === "post" && <div className="article-publisher-note">
            <span>Redakcja Tripowni</span>
            {dateModified && <span>Zweryfikowano: {dateModified}</span>}
            <Link href="/standardy-redakcyjne">Jak tworzymy i aktualizujemy treści →</Link>
            <ArticleShare title={item.title} />
          </div>}
        </header>}
        {hasConversionPanel && <div className="kicker" style={{marginBottom:12}}>PRZEWODNIK PO KIERUNKU</div>}
        {[
          "/wakacje-z-poznania",
          "/krakow",
          "/wakacje-z-gdanska-2",
          "/wroclaw",
          "/katowice",
          "/lublin-wakacje-city-break",
          "/wakacje-z-olsztyna-mazur-all-inclusive-last-minute-i-lot-hotel",
          "/wakacje-z-rzeszowa-all-inclusive-last-minute-i-lot-hotel",
        ].includes(canonicalPath) && (
          <section className="legacy-internal-links" style={{ marginBottom: 20 }}>
            <div className="kicker">NAJLEPSZE DOPASOWANIE</div>
            <div>{growthLinks.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</div>
          </section>
        )}
        <div className="legacy-content" dangerouslySetInnerHTML={{__html:item.html}}/>
      </article>

      {deepDive && <ArticleDeepDiveBlock deepDive={deepDive} />}

      {seoOpportunity && <section className="legacy-internal-links">
        <div className="kicker">POD FRAZĘ, KTÓREJ SZUKASZ</div>
        <h2>{seoOpportunity.title}</h2>
        <p>{seoOpportunity.lead}</p>
        <div>{seoOpportunity.links.map(link => <Link key={link.href} href={link.href}>{link.label} →</Link>)}</div>
      </section>}

      {(item.type === "post" || isDestination) && <RelatedTravelGuides path={canonicalPath} title={item.title} isDestination={isDestination} />}

      {shouldRenderSearch && <>
        <section className="legacy-internal-links">
          <div className="kicker">KONKRET DLA TEGO ARTYKUŁU</div>
          <h2>{effectiveDestination && !context.destination ? `${effectiveDestination}: sprawdź aktualne możliwości` : context.focusTitle}</h2>
          <ul>{context.focusPoints.map((point) => <li key={point}>{point}</li>)}</ul>
        </section>
        <section className="legacy-article-search">
          <div className="section-heading"><div><div className="kicker">WYSZUKIWANIE USTAWIONE POD ARTYKUŁ</div><h2>{effectiveDestination ? `Sprawdź aktualne wyjazdy: ${effectiveDestination}` : context.searchTitle}</h2><p>{effectiveDestination && !context.destination ? `Ustawiliśmy wyszukiwarkę pod ${effectiveDestination}. Wszystkie pola możesz zmienić.` : context.searchLead}</p></div></div>
          <ArticlePartnerSearch
            mode={deepDive?.searchMode || context.mode}
            initialDestination={effectiveDestination || ""}
            initialDeparture={context.departure || "Warszawa Chopina"}
            initialDepartureCode={context.departureCode}
            initialStartDate={context.startDate}
            initialEndDate={context.endDate}
            initialWeekendOnly={context.weekendOnly}
            presets={deepDive?.searchPresets}
          />
        </section>
      </>}

      {(item.type === "post" || isDestination) && <section className="legacy-internal-links"><h2>Sprawdź dalej w tym temacie</h2><div>{growthLinks.map(link=><Link key={link.href} href={link.href}>{link.label} →</Link>)}</div></section>}

      {related.length > 0 && <section className="legacy-offers"><div className="section-heading"><div><div className="kicker">DOPASOWANE WYNIKI TRIPOWNI</div><h2>{effectiveDestination ? `Aktualne propozycje: ${effectiveDestination}` : "Aktualne propozycje pasujące do artykułu"}</h2></div><Link href="/okazje">Wszystkie okazje →</Link></div><div className="cards-grid">{related.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>}

      <section className="legacy-internal-links"><h2>Zostań na Tripowni</h2><div><Link href="/kierunki">Kierunki</Link><Link href="/city-break">City break</Link><Link href="/last-minute">Last minute</Link><Link href="/poradniki">Poradniki</Link><Link href="/alerty">Alerty</Link></div></section>
    </div><SiteFooter/></main>;
}
