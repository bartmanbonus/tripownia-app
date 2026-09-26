import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import UnifiedPage from "@/components/UnifiedPage";
import { findLegacy, legacyCanonicalPath, legacyItems } from "@/lib/legacy";
import { internalAliasPaths, isInternalAlias } from "@/lib/internalAliases";

const systemPaths = new Set([
  "/okazje", "/poradniki", "/parkingi", "/atrakcje", "/esim",
  "/ubezpieczenia", "/transfery", "/wynajem-auta", "/admin",
  "/podroze-po-przezycia", "/dalekie-podroze"
]);

const dedicatedAppPaths = new Set([
  "/admin",
  "/admin/social",
  "/alerty",
  "/app",
  "/city-break",
  "/city-break-2",
  "/dalekie-podroze",
  "/dane-tripowni",
  "/dla-ciebie",
  "/dla-mediow",
  "/dodaj-podroz",
  "/egipt-2027",
  "/faq",
  "/ferie-2027",
  "/gdzie-jest-cieplo-zima-bez-dalekiego-lotu",
  "/gdzie-leciec",
  "/grecja-2027",
  "/informacja-afiliacyjna",
  "/inspiracje",
  "/jak-dziala-tripownia",
  "/jarmarki-bozonarodzeniowe",
  "/kierunki",
  "/kontakt",
  "/konto",
  "/last-minute",
  "/last-minute-oferty",
  "/magazyn-podrozniczy",
  "/magazyn-podrozniczy/city-break-2026",
  "/magazyn-podrozniczy/last-minute-2026",
  "/majowka-2027",
  "/moja-podroz",
  "/moje-podroze",
  "/o-tripowni",
  "/okazje",
  "/organizer",
  "/planer-podrozy",
  "/podroze",
  "/podroze-po-przezycia",
  "/polityka-prywatnosci",
  "/polska",
  "/poradniki",
  "/porownaj",
  "/profil",
  "/przed-wyjazdem",
  "/radar-tripowni",
  "/regulamin",
  "/standardy-redakcyjne",
  "/sylwester",
  "/tanie-loty",
  "/transfery",
  "/turcja-2027",
  "/ulubione",
  "/wakacje",
  "/wakacje-2027",
  "/wakacje-czerwiec-2027",
  "/wakacje-lipiec-2027",
  "/wakacje-sierpien-2027",
  "/wakacje-z-dziecmi",
  "/wspolpraca",
  "/wydarzenia",
  "/wynajem-auta",
]);

const seoOverrides: Record<string, Metadata> = {
  "/jak-zorganizowac-wyjazd-samodzielnie-bez-biura-podrozy": {
    title: "Indywidualne planowanie podróży – jak zorganizować wyjazd samodzielnie | Tripownia",
    description: "Indywidualne planowanie podróży krok po kroku: kierunek, lot, nocleg, atrakcje, transfer i checklista. Zobacz, jak zorganizować wakacje bez biura podróży.",
  },
  "/bulgaria": {
    title: "Bułgaria wakacje 2026 – Słoneczny Brzeg, Złote Piaski czy Nessebar? | Tripownia",
    description: "Wyjazd do Bułgarii: porównaj Słoneczny Brzeg, Złote Piaski, Nessebar i Warnę. Sprawdź plaże, pogodę, All Inclusive i wybierz region na lato.",
  },
  "/wakacje-z-rzeszowa-all-inclusive-last-minute-i-lot-hotel": {
    title: "Last minute z Rzeszowa – loty, wakacje i All Inclusive z Jasionki | Tripownia",
    description: "Last minute z Rzeszowa i lotniska RZE: sprawdź loty, wakacje, All Inclusive i pakiety z Jasionki. Porównaj aktualne kierunki i pełny koszt wyjazdu.",
  },
  "/zea": {
    title: "ZEA 2026 – Dubaj, Abu Dhabi czy Ras Al Khaimah? | Tripownia",
    description: "Zjednoczone Emiraty Arabskie: Dubaj, Abu Dhabi i Ras Al Khaimah. Ustaw własne daty i sprawdź wakacje, noclegi oraz aktualne propozycje.",
  },

  "/lublin-wakacje-city-break": {
    title: "City break z Lublina, wakacje i lot + hotel z LUZ | Tripownia",
    description: "City break z Lublina na 2–5 dni, wakacje i lot + hotel z LUZ. Sprawdź aktualne kierunki i krótkie wyjazdy z lokalnego lotniska.",
  },
  "/wakacje-z-olsztyna-mazur-all-inclusive-last-minute-i-lot-hotel": {
    title: "Wakacje z Olsztyna-Mazur (Szymany) – last minute i lot + hotel | Tripownia",
    description: "Wakacje z Szyman i lotniska Olsztyn-Mazury (SZY): last minute, lot + hotel i aktualne kierunki. Sprawdź lokalne wyloty bez dojazdu do Warszawy.",
  },
  "/sagrada-familia-osiagnela-maksymalna-wysokosc-20-lutego-2026-historyczna-data-dla-barcelony": {
    title: "Sagrada Familia ma 172,5 m – wysokość bazyliki w 2026 | Tripownia",
    description: "Sagrada Familia osiągnęła 172,5 m wysokości. Sprawdź, kiedy świątynia osiągnęła najwyższy punkt i jak wysoka jest wieża Jezusa Chrystusa.",
  },
  "/wakacje-z-poznania": {
    title: "City break z Poznania, last minute i wakacje – lot + hotel | Tripownia",
    description: "City break z Poznania, last minute i wakacje z Ławicy. Sprawdź krótkie wyjazdy na 2–5 dni, lot + hotel i aktualne kierunki z POZ.",
  },
  "/krakow": {
    title: "City break z Krakowa, last minute i wakacje – lot + hotel | Tripownia",
    description: "City break z Krakowa, last minute i wakacje z Balic. Porównaj wyjazdy na 2–5 dni, lot + hotel i aktualne kierunki z KRK.",
  },
  "/wakacje-z-gdanska-2": {
    title: "City break z Gdańska, last minute i wakacje – lot + hotel | Tripownia",
    description: "City break z Gdańska, last minute i wakacje z GDN. Porównaj tanie loty, lot + hotel i krótkie wyjazdy z Trójmiasta.",
  },
  "/wroclaw": {
    title: "City break i last minute z Wrocławia – loty i wakacje 2026 | Tripownia",
    description: "City break z Wrocławia, last minute, tanie loty i wakacje. Porównaj krótkie wyjazdy, lot + hotel i propozycje z lotniska WRO.",
  },
  "/katowice": {
    title: "City break, All Inclusive i last minute z Katowic 2026 | Tripownia",
    description: "Wyloty z Katowic-Pyrzowic: city break, All Inclusive, last minute i wakacje. Porównaj aktualne propozycje i pełny koszt wyjazdu.",
  },
  "/wakacje-ze-szczecina-all-inclusive-last-minute-i-lot-hotel": {
    title: "Last minute ze Szczecina – wakacje, All Inclusive i lot + hotel 2026 | Tripownia",
    description: "Last minute ze Szczecina, wakacje i All Inclusive z wylotem z SZZ. Sprawdź aktualne propozycje, lot + hotel i pełny koszt wyjazdu.",
  },
  "/babski-wyjazd-za-granice-12-najlepszych-kierunkow-z-przyjaciolkami": {
    title: "Gdzie na babski weekend za granicą? 12 kierunków 2026 | Tripownia",
    description: "Pomysły na babski wyjazd za granicę: 12 kierunków na weekend z przyjaciółkami, od city breaku po słońce, plażę i spa.",
  },
  "/alicante-czy-malaga-gdzie-lepiej-poleciec-na-wakacje": {
    title: "Malaga czy Alicante? Co wybrać, Andaluzja i odległość | Tripownia",
    description: "Malaga czy Alicante? Alicante nie leży w Andaluzji. Porównaj region, plaże, pogodę, zwiedzanie i wybierz lepszą bazę dla swojego wyjazdu.",
  },
  "/wyspy-zielonego-przyladka": {
    title: "Wyspy Zielonego Przylądka – Sal czy Boa Vista? Wakacje 2026 | Tripownia",
    description: "Wyspy Zielonego Przylądka: Sal czy Boa Vista? Porównaj plaże, hotele, pogodę, All Inclusive i styl wakacji, zanim wybierzesz konkretną wyspę.",
  },
  "/jak-tanio-podrozowac-po-europie-10-sposobow-na-tansze-wyjazdy": {
    title: "Tanie podróżowanie po Europie – 10 sposobów na tańszy wyjazd | Tripownia",
    description: "Jak tanio podróżować po Europie? Sprawdź 10 praktycznych sposobów na tańsze loty, noclegi, transport, city breaki i planowanie całego wyjazdu.",
  },
  "/jak-znalezc-tani-hotel-8-sposobow-na-oszczednosc-przy-rezerwacji-noclegow": {
    title: "Jak znaleźć tani hotel? 8 sposobów na tańszy nocleg | Tripownia",
    description: "Jak znaleźć tani hotel i nie przepłacić za nocleg? Sprawdź 8 sposobów na porównanie cen, lokalizacji, warunków anulowania i pełnego kosztu rezerwacji.",
  },
  "/lotniska-w-polsce-bez-limitu-100-ml-plynow": {
    title: "Lotniska bez limitu płynów 2026 – gdzie zniesiono 100 ml? | Tripownia",
    description: "Które lotniska w Polsce zniosły limit 100 ml? Aktualna lista: Kraków, Poznań, Rzeszów, Gdańsk oraz zasady we Wrocławiu i Katowicach.",
  },
  "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych": {
    title: "Ile bagażu podręcznego można zabrać do samolotu? Zasady 2026 | Tripownia",
    description: "Ile bagaży podręcznych można mieć i czy linie je ważą? Sprawdź, od czego zależą liczba sztuk, waga i wymiary bagażu przed lotem.",
  },
  "/czy-mozna-wniesc-jedzenie-do-samolotu-co-wolno-zabrac-na-poklad": {
    title: "Czy można wnieść jedzenie do samolotu? Co wolno zabrać w 2026 | Tripownia",
    description: "Czy można zabrać jedzenie do samolotu? Sprawdź kanapki, napoje, jedzenie dla dzieci, płyny i zasady bagażu podręcznego przed kontrolą bezpieczeństwa.",
  },
  "/gdzie-jest-cieplo-w-listopadzie": {
    title: "Gdzie jest ciepło w listopadzie 2026? 12 kierunków na słońce | Tripownia",
    description: "Gdzie polecieć w listopadzie po słońce? Porównaj Egipt, Kanary, Maroko, Cypr, Maltę i dalsze kierunki oraz wybierz pogodę pod swój budżet i długość lotu.",
  },
  "/gdzie-na-sylwestra-2026-2027-15-kierunkow": {
    title: "Gdzie na Sylwestra 2026/2027? 15 kierunków za granicę | Tripownia",
    description: "Gdzie polecieć na Sylwestra 2026/2027? Zobacz 15 kierunków na city break, Europę i dalszy wyjazd oraz wybierz opcję pod pogodę, budżet i długość lotu.",
  },
  "/gdzie-na-wakacje-we-wrzesniu": {
    title: "Ciepłe wakacje we wrześniu 2026 – gdzie lecieć? | Tripownia",
    description: "Ciepłe wakacje we wrześniu: gdzie lecieć na słońce po sezonie? Porównaj kierunki, długość lotu i styl wyjazdu na późne lato 2026.",
  },
  "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu": {
    title: "Jak dojechać z lotniska do centrum? Autobus, pociąg czy taxi | Tripownia",
    description: "Jak najtaniej dojechać z lotniska do centrum? Porównaj autobus, pociąg, taxi i transfer oraz sprawdź, kiedy każda opcja naprawdę się opłaca.",
  },
  "/wakacje-z-psem-za-granica-gdzie-jechac-i-jak-sie-przygotowac": {
    title: "Które kraje są przyjazne psom na campingach? Europa 2026 | Tripownia",
    description: "Camping z psem za granicą: porównaj Włochy, Chorwację, Austrię i Niemcy oraz sprawdź paszport, szczepienia i zasady pobytu z psem.",
  },
  "/etna-sparalizowala-loty-na-sycylie-co-zrobic-po-odwolaniu-lotu-do-katanii": {
    title: "Katania – odwołane loty na Sycylię? Etna i status lotów 2026 | Tripownia",
    description: "Czy loty do Katanii są odwołane? Zobacz, gdzie sprawdzić aktualny status rejsu i co zrobić po anulowaniu lotu przez zakłócenia związane z Etną.",
  },
  "/gdzie-poleciec-na-weekend-z-polski-12-pomyslow-na-city-break": {
    title: "Gdzie polecieć na weekend za granicę? City break z Polski 2026 | Tripownia",
    description: "Gdzie polecieć na weekend? Porównaj city breaki na 2–4 dni z Polski pod godziny lotów, transfer, nocleg i realny czas na miejscu.",
  },
  "/grecja": {
    title: "Grecja wakacje 2026 – Kreta, Rodos, Kos czy Korfu? | Tripownia",
    description: "Grecja na wakacje 2026: porównaj Kretę, Rodos, Kos, Korfu, Zakynthos i Chalkidiki. Sprawdź plaże, zwiedzanie, All Inclusive i wybierz wyspę dla siebie.",
  },
  "/wlochy": {
    title: "Włochy city break 2026 – Rzym, Mediolan, Bari czy Neapol? | Tripownia",
    description: "City break we Włoszech: porównaj Rzym, Mediolan, Bari, Neapol, Wenecję i Sycylię. Sprawdź pomysły na 2–5 dni, lot + hotel i najlepsze miasta na krótki wyjazd.",
  },
  "/warszawa-modlin": {
    title: "Gdzie można polecieć z Modlina? Loty, city break i last minute 2026 | Tripownia",
    description: "Loty z Warszawy-Modlin (WMI): sprawdź kierunki, city breaki, tanie loty i last minute. Porównaj pomysły na krótki wyjazd z Modlina.",
  },
  "/sylwester-2026-2027-za-granica-gdzie-poleciec-na-nowy-rok": {
    title: "Sylwester 2026/2027 za granicą – gdzie polecieć na Nowy Rok? | Tripownia",
    description: "Sylwester 2026/2027 za granicą: city break, ciepłe kraje i dalsze kierunki. Porównaj pomysły na Nowy Rok i wybierz wyjazd dopasowany do terminu.",
  },
  "/hiszpania": {
    title: "Południowe wybrzeże Hiszpanii – gdzie jechać? Costa del Sol, Costa Blanca i wyspy | Tripownia",
    description: "Gdzie na wakacje w Hiszpanii? Porównaj Costa del Sol, Costa Blanca, Majorkę i Wyspy Kanaryjskie pod kątem plaż, pogody, zwiedzania i dojazdu.",
  },
  "/wietnam": {
    title: "Wietnam 2026 – Hanoi, Da Nang czy Phu Quoc? Gdzie na plażę i zwiedzanie | Tripownia",
    description: "Planujesz Wietnam? Sprawdź różnice między Hanoi, Da Nang, Hoi An, Ho Chi Minh City i Phu Quoc. Dowiedz się, gdzie szukać plaż i jak połączyć regiony.",
  },
  "/cypr": {
    title: "Cypr wakacje 2026 – Pafos, Larnaka, Ayia Napa i plaże | Tripownia",
    description: "Cypr na wakacje: porównaj Pafos, Larnakę, Ayia Napę, Protaras i Limassol. Sprawdź plaże, pogodę, All Inclusive i wybierz najlepszą bazę.",
  },
  "/albania": {
    title: "Albania 2026 – Saranda, Ksamil, Vlora czy Durrës? Kurorty nad morzem | Tripownia",
    description: "Który kurort w Albanii wybrać? Porównaj Sarandę, Ksamil, Vlorę, Durrës i Himarë pod kątem plaż, transferu, rodzin i samodzielnego zwiedzania.",
  },
  "/malta": {
    title: "City break Malta 2026 – lot + hotel, wakacje i plaże | Tripownia",
    description: "City break na Malcie i wakacje: porównaj Vallettę, Sliemę, St. Julian’s, Mellieħę i Gozo. Sprawdź lot + hotel i najlepszą bazę na 3–7 dni.",
  },
  "/maroko": {
    title: "Maroko All Inclusive 2026 – Agadir, Marrakesz i wakacje | Tripownia",
    description: "Maroko All Inclusive i wakacje: porównaj Agadir, Marrakesz i wybrzeże Atlantyku. Sprawdź hotele, plaże, pogodę i najlepszy region na urlop.",
  },
  "/egipt": {
    title: "Egipt All Inclusive 2026 – Hurghada, Marsa Alam i Sharm | Tripownia",
    description: "Egipt All Inclusive: porównaj Hurghadę, Marsa Alam i Sharm el Sheikh. Sprawdź hotele, plaże, rafę, transfer i wybierz region pod swój budżet.",
  },
  "/najlepsze-aplikacje-podroznicze-10-aplikacji-ktore-ulatwia-kazda-podroz": {
    title: "Aplikacje do zwiedzania miast – 10 najlepszych aplikacji podróżniczych | Tripownia",
    description: "Najlepsze aplikacje do zwiedzania miast i podróżowania: mapy, atrakcje, transport, planowanie i rezerwacje. Zobacz 10 praktycznych aplikacji na wyjazd.",
  },
  "/wyspy-kanaryjskie-wakacje-all-inclusive-i-last-minute": {
    title: "Wyspy Kanaryjskie All Inclusive 2026 – wakacje i last minute | Tripownia",
    description: "Wyspy Kanaryjskie All Inclusive: porównaj Teneryfę, Gran Canarię, Fuerteventurę i Lanzarote. Sprawdź wakacje, last minute, plaże i pogodę.",
  },
  "/riwiera-turecka-czy-egejska-co-wybrac": {
    title: "Riwiera Turecka czy Egejska? Antalya, Side, Bodrum czy Marmaris | Tripownia",
    description: "Riwiera Turecka czy Egejska? Porównaj pogodę, plaże, All Inclusive, transfery i kurorty Antalya, Side, Alanya, Bodrum oraz Marmaris przed wyborem wakacji.",
  },
  "/czy-trzeba-drukowac-karte-pokladowa-odprawa-online-krok-po-kroku": {
    title: "Czy trzeba drukować kartę pokładową? Odprawa online 2026 | Tripownia",
    description: "Czy karta pokładowa w telefonie wystarczy? Sprawdź odprawę online, wyjątki linii i lotnisk oraz kiedy warto mieć wydruk przed wylotem.",
  },
  "/kiedy-kupowac-tanie-loty-najlepszy-moment-na-rezerwacje": {
    title: "Kiedy kupować tanie loty? Najlepszy moment na rezerwację 2026 | Tripownia",
    description: "Kiedy najlepiej kupić bilet lotniczy? Sprawdź, ile wcześniej szukać lotów, kiedy ceny zwykle rosną i jak porównywać terminy bez mitów o jednym magicznym dniu.",
  },
  "/tajlandia-czy-wietnam-ktory-kierunek-wybrac-na-wakacje": {
    title: "Tajlandia czy Wietnam? Co wybrać na wakacje w 2026 | Tripownia",
    description: "Tajlandia czy Wietnam? Porównaj pogodę, plaże, zwiedzanie, jedzenie, ceny i logistykę, żeby wybrać lepszy kierunek dla swojego stylu podróży.",
  },
  "/co-zrobic-gdy-linia-lotnicza-zgubi-bagaz-poradnik-dla-podroznych": {
    title: "Zgubiony bagaż na lotnisku – co robić i jakie masz prawa? | Tripownia",
    description: "Linia zgubiła bagaż? Sprawdź zgłoszenie PIR, terminy, zakupy pierwszej potrzeby, odpowiedzialność przewoźnika i jak przygotować reklamację.",
  },
  "/czy-mozna-podrozowac-z-dowodem-osobistym-lista-krajow": {
    title: "Gdzie można lecieć na dowód osobisty? Lista krajów 2026 | Tripownia",
    description: "Do jakich krajów można podróżować na dowód osobisty bez paszportu? Sprawdź listę kierunków i zasady dokumentów przed wyjazdem.",
  },
};

export async function generateStaticParams() {
  const paths = new Set<string>();
  for (const item of legacyItems) paths.add(legacyCanonicalPath(item.path).replace(/^\//, ""));
  for (const path of systemPaths) paths.add(path.replace(/^\//, ""));
  for (const path of internalAliasPaths) paths.add(path.replace(/^\//, ""));
  return [...paths].filter(Boolean).filter((path) => !dedicatedAppPaths.has("/" + path.replace(/^\/+/, ""))).map((path) => ({ slug: path.split("/").filter(Boolean) }));
}

function humanize(path: string) {
  const last = decodeURIComponent(path.split("/").filter(Boolean).pop() || "Tripownia");
  return last.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function withCanonical(path: string, metadata: Metadata): Metadata {
  return {
    ...metadata,
    title: typeof metadata.title === "string"
      ? metadata.title.replace(/\s*\|\s*Tripownia(?:\.pl)?$/i, "")
      : metadata.title,
    openGraph: {
      type: "website", locale: "pl_PL", siteName: "Tripownia",
      title: typeof metadata.title === "string" ? metadata.title : "Tripownia",
      description: metadata.description || undefined,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: typeof metadata.title === "string" ? metadata.title : "Tripownia",
      description: metadata.description || undefined,
      images: ["/opengraph-image"],
    },
    alternates: { ...(metadata.alternates || {}), canonical: path },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const fixed: Record<string, Metadata> = {
    "/okazje": { title: "Okazje podróżnicze | Tripownia.pl", description: "Wybrane przez Tripownię city breaki, wakacje i pakiety z wielu źródeł." },
    "/poradniki": { title: "Poradniki podróżnicze 2026 – loty, bagaż i prawa pasażera | Tripownia", description: "Praktyczne poradniki o lotach, bagażu, odprawie, prawach pasażera, lotniskach, dokumentach i planowaniu podróży." },
    "/parkingi": { title: "Parkingi przy lotniskach | Tripownia.pl", description: "Najpierw sprawdź lotnisko i wyjazd, potem dobierz parking." },
    "/atrakcje": { title: "Atrakcje i bilety | Tripownia.pl", description: "Dobierz atrakcje do konkretnego kierunku i terminu podróży." },
    "/esim": { title: "eSIM i internet w podróży | Tripownia.pl", description: "Internet na wyjeździe — praktyczne informacje i sprawdzony partner." },
    "/ubezpieczenia": { title: "Ubezpieczenie podróżne | Tripownia.pl", description: "Co sprawdzić w polisie przed wyjazdem i jak dopasować zakres do kierunku." },
    "/transfery": { title: "Transfery lotniskowe | Tripownia.pl", description: "Jak zaplanować dojazd z lotniska i kiedy transfer w pakiecie naprawdę się opłaca." },
    "/wynajem-auta": { title: "Wynajem auta na wakacje | Tripownia.pl", description: "Na co uważać przy wynajmie samochodu za granicą." },
    "/podroze-po-przezycia": { title: "Podróże po przeżycia — zorza, sakura, safari i więcej | Tripownia.pl", description: "Kalendarz podróży planowanych pod właściwy moment: zorza polarna, sakura, fiordy, safari, wieloryby, jarmarki i egzotyka." },
    "/dalekie-podroze": { title: "Dalekie podróże — Wietnam, Pekin, Nowy Jork, Japonia i więcej | Tripownia.pl", description: "Pomysły na dalsze podróże z Polski: Wietnam, Pekin, Nowy Jork, Japonia, Tajlandia, Bali, Singapur, RPA i więcej." },
    "/admin": { title: "Panel administracyjny | Tripownia.pl", robots: { index: false, follow: false } },
  };

  if (fixed[path]) return withCanonical(path, fixed[path]);
  if (seoOverrides[path]) return withCanonical(path, seoOverrides[path]);

  const item = findLegacy(path);
  if (item) {
    const canonicalPath = legacyCanonicalPath(path);
    const metadata = seoOverrides[canonicalPath] || { title: item.title, description: item.description || undefined };
    return withCanonical(canonicalPath, metadata);
  }

  if (isInternalAlias(path)) {
    return withCanonical(path, {
      title: `${humanize(path)} | Tripownia.pl`,
      description: "Inspiracje i aktualne propozycje Tripowni dla tego tematu.",
    });
  }

  return {};
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  // Consolidate legacy WordPress /post_id duplicates into their clean canonical URL.
  // GSC still shows substantial impressions/clicks on these aliases, so a permanent
  // redirect preserves existing signals instead of leaving duplicate indexable pages.
  if (path.endsWith("/post_id") && findLegacy(path)) {
    permanentRedirect(legacyCanonicalPath(path));
  }

  const legacyRedirects: Record<string, string> = {
    "/453-2": "/magazyn-podrozniczy",
    "/4557-2": "/gdzie-jest-cieplo-w-listopadzie",
    "/5047-2": "/gdzie-na-wakacje-we-wrzesniu",
    "/5049-2": "/gdzie-na-wakacje-we-wrzesniu",
    "/tripownia-pl/okazje-tripownia": "/okazje",
  };
  if (legacyRedirects[path]) permanentRedirect(legacyRedirects[path]);

  if (path === "/indywidualne-planowanie-podrozy-bez-ukrytych-kosztow") permanentRedirect("/okazje");
  if (path === "/grecja-2") permanentRedirect("/grecja");
  if (path === "/czy-mozna-miec-dwa-bagaze-podreczne-samolocie-zasady-w-liniach-lotniczych") {
    permanentRedirect("/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych");
  }
  const isSystemPath = systemPaths.has(path);
  const legacyItem = findLegacy(path);
  if (!isSystemPath && !legacyItem && !isInternalAlias(path)) notFound();
  return <UnifiedPage path={path} />;
}
