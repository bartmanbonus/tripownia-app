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
console.log("✅ Krytyczne guardy OK: search scope, live-first homepage, EXIM/TUI exact flow, affiliate validation i SEO transient ofert.");
