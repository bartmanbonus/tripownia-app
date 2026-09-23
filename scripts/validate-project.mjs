import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const legacy = JSON.parse(read("data/legacy-content.json"));
const aliasSource = read("lib/internalAliases.ts");
const aliasMatches = [...aliasSource.matchAll(/'([^']+)'/g)].map(m=>m[1]);
const routes = new Set(["/","/okazje","/poradniki","/parkingi","/atrakcje","/esim","/ubezpieczenia","/transfery","/wynajem-auta","/planowanie-podrozy","/admin",...legacy.map(x=>(x.path||"/").replace(/\/$/,"")||"/"),...aliasMatches]);
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

// Homepage ma być strukturalnie live-first już w SSR/HTML, a nie dopiero po
// schowaniu starej treści przez JavaScript.
forbidText(
  "app/HomePageClient.tsx",
  "SelfSearchLegacy",
  "stara druga wyszukiwarka wróciła do homepage"
);
forbidText(
  "app/HomePageClient.tsx",
  "getDailyOffers",
  "statyczna dzienna pula wróciła jako fallback homepage"
);
forbidText(
  "app/HomePageClient.tsx",
  "#szukaj-samodzielnie",
  "stara kotwica wyszukiwarki wróciła do homepage"
);
requireText(
  "app/HomePageClient.tsx",
  'useState<TripOffer[]>([])',
  "homepage nie startuje od pustej puli live"
);
requireText(
  "app/HomePageClient.tsx",
  "DAILY_CACHE_MAX_AGE_MS",
  "homepage nie ma limitu wieku ostatniej dobrej puli"
);


requireText("components/AffiliateClickBridge.tsx", 'trackEvent("affiliate_click"', "brakuje pomiaru kliknięć afiliacyjnych w GA4");
requireText("components/AffiliateClickBridge.tsx", 'return "planner_partner"', "planner nie ma osobnego źródła kliknięcia afiliacyjnego");
requireText("components/AffiliateClickBridge.tsx", 'return "search_fallback"', "fallback wyszukiwarki nie ma osobnego źródła kliknięcia afiliacyjnego");
requireText("components/AddTripPage.tsx", "Plan możesz ułożyć bez konta.", "planner ponownie wymusza konto");
requireText("components/AddTripPage.tsx", "partners.fonia.buildUrl()", "planner stracił afiliację eSIM");
requireText("components/AddTripPage.tsx", "partners.parklot.buildUrl()", "planner stracił afiliację parkingu");
requireText("components/SearchHub.tsx", 'if (/\\bbergamo\\b/i.test(normalized)) return "Mediolan, Włochy";', "Bergamo nie jest mapowane na Mediolan");
requireText("components/SearchHub.tsx", "selectedDestinations", "wyszukiwarka straciła wielokrotny wybór kierunków");
requireText("components/SearchHub.tsx", 'type DateMode = "any" | "month" | "range"', "wyszukiwarka straciła elastyczne daty");
requireText("components/AccountCloudSync.tsx", "saveTripowniaUserState", "konto straciło automatyczną synchronizację danych");


requireText("components/UnifiedPage.tsx", "partner: partners.kiwitaxi", "strona transferów straciła afiliację Kiwitaxi");
requireText("components/UnifiedPage.tsx", "partner: partners.rentacar", "wynajem auta omija centralną afiliację");
requireText("components/UnifiedPage.tsx", "return partners.esky.buildUrl(", "dalekie loty omijają builder afiliacyjny eSky");
requireText("components/UnifiedPage.tsx", "return partners.booking.buildUrl(", "dalekie noclegi omijają builder afiliacyjny Booking");


forbidText("components/SearchHub.tsx", "Więcej filtrów", "wyszukiwarka ponownie ukrywa podstawowe filtry");
requireText("components/SearchHub.tsx", 'className="search-v3-board"', "wyżywienie nie jest od razu dostępne w wyszukiwarce");
requireText("app/error.tsx", "Spróbuj ponownie", "brakuje odzyskiwalnego stanu błędu");
requireText("app/not-found.tsx", "Ułóż plan za 0 zł", "404 nie prowadzi użytkownika z powrotem do lejka");

console.log(`✅ Audyt OK: ${legacy.length} zmigrowanych stron + ${aliasMatches.length} naprawionych starych adresów. Brak znanych wewnętrznych linków prowadzących do 404.`);
console.log("✅ Krytyczne guardy OK: search scope, live-first homepage, EXIM/TUI exact flow, affiliate validation i SEO transient ofert.");

