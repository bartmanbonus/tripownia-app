import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const legacy = JSON.parse(read("data/legacy-content.json"));
const aliasSource = read("lib/internalAliases.ts");
const aliasMatches = [...aliasSource.matchAll(/'([^']+)'/g)].map(m=>m[1]);
const routes = new Set(["/","/okazje","/poradniki","/parkingi","/atrakcje","/loty","/hotele","/esim","/ubezpieczenia","/transfery","/wynajem-auta","/planowanie-podrozy","/admin",...legacy.map(x=>(x.path||"/").replace(/\/$/,"")||"/"),...aliasMatches]);
const broken = new Map();

for (const item of legacy) {
  const html = item.html || "";
  const hrefs = [...html.matchAll(/href=["']([^"']+)/gi)].map(m=>m[1]);
  for (const href of hrefs) {
    let pathname = null;
    try {
      if (href.startsWith("https://tripownia.pl")) pathname = new URL(href).pathname;
      else if (href.startsWith("/")) pathname = new URL(href,"https://tripownia.pl").pathname;
    } catch {}
    if (!pathname) continue;
    pathname = pathname.replace(/\/$/,"") || "/";
    if (!routes.has(pathname) && !pathname.startsWith("/wp-")) broken.set(pathname,(broken.get(pathname)||0)+1);
  }
}

if (broken.size) {
  console.error(`❌ ${broken.size} nierozwiązanych wewnętrznych adresów`);
  for (const [p,n] of broken) console.error(`${n}× ${p}`);
  process.exit(1);
}

function requireText(file, text, label) {
  const source = read(file);
  if (!source.includes(text)) {
    console.error(`❌ Regresja: ${label} (${file})`);
    process.exit(1);
  }
}

function forbidText(file, text, label) {
  const source = read(file);
  if (source.includes(text)) {
    console.error(`❌ Regresja: ${label} (${file})`);
    process.exit(1);
  }
}

// Krytyczne zasady Tripowni: konkretne wyszukiwanie nie może ratować się
// losowymi kierunkami, a kliknięcia do partnerów muszą przechodzić przez
// kontrolowany i śledzony resolver.
forbidText(
  "app/api/today-offers/route.ts",
  "const rescueTerms = BROAD_SEARCH_TERMS",
  "automatyczny broad rescue wrócił do wyszukiwania konkretnego kierunku"
);
requireText(
  "app/api/today-offers/route.ts",
  "candidateMatchesQuery",
  "brakuje twardego dopasowania wyników do query"
);
requireText(
  "app/go/exim-best/route.ts",
  'new URL("/go/live"',
  "EXIM omija centralny tracking live"
);
forbidText(
  "app/go/exim-best/route.ts",
  "eximFallback",
  "EXIM znów może spaść na ogólną stronę kierunku"
);
requireText(
  "app/api/tui-go/route.ts",
  "destinationMatchesProduct",
  "TUI nie wymaga dopasowania kierunku"
);
requireText(
  "app/api/tui-go/route.ts",
  'new URL("/go/live"',
  "TUI omija centralny tracking live"
);
requireText(
  "app/go/live/route.ts",
  "validTradeDoublerWrapper",
  "brakuje walidacji programu TradeDoubler"
);
requireText(
  "app/go/live/route.ts",
  "belongsToPartner",
  "brakuje powiązania partnera z docelową domeną"
);
forbidText(
  "app/sitemap.ts",
  "const offerPages",
  "transient strony ofert wróciły do sitemap"
);
requireText(
  "app/oferta/[id]/page.tsx",
  "robots: { index: false, follow: true }",
  "strony transient ofert mogą znów trafić do indeksu"
);

// Loty, hotele i atrakcje: użytkownik ma zostać w Tripowni do ostatniego
// kroku, a wszystkie wyszukiwania lotów mają używać jednego buildera Kiwi.
forbidText(
  "lib/offers.ts",
  "www2.esky.pl",
  "stary URL eSky wrócił do katalogu ofert"
);
forbidText(
  "lib/offers.ts",
  'partner:"esky"',
  "stare oferty znów raportują partnera jako eSky zamiast Kiwi"
);
requireText(
  "lib/partners.ts",
  "buildKiwiFlightSearchUrl",
  "brakuje centralnego buildera wyszukiwania Kiwi"
);
requireText(
  "lib/partners.ts",
  "https://www.kiwi.com/en/search/results/",
  "builder Kiwi nie używa aktualnego formatu strony wyników"
);
forbidText(
  "components/MyTrip.tsx",
  "partners.getyourguide",
  "Moja podróż znów omija wewnętrzny ekran Atrakcje"
);
requireText(
  "components/MyTrip.tsx",
  "manualTrip ? trip.offerSnapshot : catalogOffer || trip.offerSnapshot",
  "Moja podróż znów ignoruje ręcznie dodany snapshot wyjazdu"
);
forbidText(
  "components/MyTripResolver.tsx",
  "offers.push",
  "resolver Mojej podróży znów mutuje globalny katalog ofert"
);
requireText(
  "components/MyTripResolver.tsx",
  "const tripId = saved.tripId || \"legacy\"",
  "resolver Mojej podróży nie rozróżnia zapisanych wyjazdów po tripId"
);
requireText(
  "components/MyTrip.tsx",
  "upsertTripArchive(normalized)",
  "zmiany w Mojej podróży nie synchronizują się z archiwum wyjazdów"
);
requireText(
  "components/MyTripsPage.tsx",
  "upsertTripArchive(active, false)",
  "lista Moje podróże nie migruje starszej aktywnej podróży do archiwum"
);
requireText(
  "app/konto/page.tsx",
  "favorite_offer_snapshots:",
  "konto nie zapisuje snapshotów ulubionych w chmurze"
);
requireText(
  "app/konto/page.tsx",
  "trip_archive:",
  "konto nie zapisuje archiwum podróży w chmurze"
);
requireText(
  "app/konto/page.tsx",
  "organizer_state:",
  "konto nie zapisuje danych Organizera razem z podróżą"
);
requireText(
  "app/konto/page.tsx",
  "toolkit_state:",
  "konto nie zapisuje danych Toolkit razem z podróżą"
);
requireText(
  "app/konto/page.tsx",
  "restorePerTripState(cloudArchive)",
  "wczytanie chmury nie odtwarza danych per podróż"
);
requireText(
  "lib/tripArchive.ts",
  "...existing, ...trip",
  "aktualizacja archiwum może zgubić dodatkowe dane podróży"
);
requireText(
  "app/konto/page.tsx",
  "alert_settings:",
  "konto nie zapisuje ustawień alertów w chmurze"
);
requireText(
  "app/konto/page.tsx",
  "window.dispatchEvent(new Event(TRIP_ARCHIVE_EVENT))",
  "wczytanie chmury nie odświeża listy Moje podróże"
);
requireText(
  "lib/tripArchive.ts",
  "setActiveOfferTrip",
  "brakuje wspólnego mechanizmu ustawiania aktywnej podróży z oferty"
);
requireText(
  "components/OfferCard.tsx",
  "setActiveOfferTrip(offerSnapshot)",
  "karta oferty omija wspólny mechanizm aktywnej podróży"
);
requireText(
  "app/oferta/[id]/page.tsx",
  "<AddToTripButton offer={o} />",
  "szczegóły oferty nie pozwalają dodać jej do Mojej podróży"
);
forbidText(
  "components/TripToolkit.tsx",
  "partners.getyourguide",
  "Toolkit znów omija wewnętrzny ekran Atrakcje"
);
forbidText(
  "components/TripToolkit.tsx",
  "partners.booking",
  "Toolkit znów omija wewnętrzny ekran Hotele"
);
forbidText(
  "components/TripToolkit.tsx",
  "partners.kiwi",
  "Toolkit znów omija wewnętrzny ekran Loty"
);
requireText(
  "components/SearchHub.tsx",
  "SZERSZE WYSZUKIWANIE",
  "brakuje fallbacku Loty/Hotele/Atrakcje poza feedem pakietowym"
);
requireText(
  "components/SiteHeader.tsx",
  '{ href: "/loty", label: "Loty"',
  "Loty w headerze znów omijają Tripownię"
);
requireText(
  "components/SiteHeader.tsx",
  '{ href: "/hotele", label: "Hotele"',
  "Hotele w headerze znów omijają Tripownię"
);
requireText(
  "components/SiteHeader.tsx",
  '{ href: "/atrakcje", label: "Atrakcje"',
  "Atrakcje w headerze znów omijają Tripownię"
);

// Homepage ma być strukturalnie live-first już w SSR/HTML, a nie dopiero po
// schowaniu starej treści przez JavaScript.
forbidText(
  "app/page.tsx",
  "SelfSearchLegacy",
  "stara druga wyszukiwarka wróciła do homepage"
);
forbidText(
  "app/page.tsx",
  "getDailyOffers",
  "statyczna dzienna pula wróciła jako fallback homepage"
);
forbidText(
  "app/page.tsx",
  "#szukaj-samodzielnie",
  "stara kotwica wyszukiwarki wróciła do homepage"
);
requireText(
  "app/page.tsx",
  'useState<TripOffer[]>([])',
  "homepage nie startuje od pustej puli live"
);
requireText(
  "app/page.tsx",
  "DAILY_CACHE_MAX_AGE_MS",
  "homepage nie ma limitu wieku ostatniej dobrej puli"
);

console.log(`✅ Audyt OK: ${legacy.length} zmigrowanych stron + ${aliasMatches.length} naprawionych starych adresów. Brak znanych wewnętrznych linków prowadzących do 404.`);
console.log("✅ Krytyczne guardy OK: search scope, live-first homepage, EXIM/TUI exact flow, Kiwi/Booking/Atrakcje inside-first, affiliate validation i SEO transient ofert.");
