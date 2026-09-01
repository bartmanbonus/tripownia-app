import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import LegacyPage from "@/components/LegacyPage";
import { legacyPosts, findLegacy } from "@/lib/legacy";
import { isInternalAlias } from "@/lib/internalAliases";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";

type ServiceType = "parkingi" | "atrakcje" | "esim" | "ubezpieczenia" | "transfery" | "wynajem-auta";

function ServicePage({ type }: { type: ServiceType }) {
  const config = {
    parkingi: {
      kicker: "DODATEK DO PODRÓŻY", title: "Parkingi przy lotniskach",
      lead: "Wybierz parking dopiero po sprawdzeniu lotniska wylotu i szczegółów wyjazdu.",
      partner: partners.parklot,
      bullets: ["Sprawdź, z którego lotniska faktycznie lecisz.", "Porównaj dojazd, czas transferu i zasady anulacji.", "Na końcu przejdź do rezerwacji parkingu."],
    },
    atrakcje: {
      kicker: "DODATEK DO PODRÓŻY", title: "Atrakcje i bilety na miejscu",
      lead: "Najpierw wybierz konkretny kierunek i termin, potem dobierz wycieczki, bilety i atrakcje.",
      partner: partners.getyourguide,
      bullets: ["Sprawdź, ile masz realnie czasu na miejscu.", "Wybierz 1–2 najważniejsze atrakcje zamiast kupować wszystko na zapas.", "Na końcu sprawdź dostępność i cenę u partnera."],
    },
    esim: {
      kicker: "DODATEK DO PODRÓŻY", title: "eSIM i internet w podróży",
      lead: "Internet na wyjeździe bez szukania przypadkowej karty SIM po przylocie.",
      partner: partners.fonia,
      bullets: ["Sprawdź, czy Twój telefon obsługuje eSIM.", "Dobierz pakiet danych do długości wyjazdu.", "Kup dopiero po potwierdzeniu kierunku i terminu."],
    },
    ubezpieczenia: {
      kicker: "PRZED WYJAZDEM", title: "Ubezpieczenie podróżne",
      lead: "Nie sprzedajemy jeszcze polisy na Tripowni. Najpierw pokazujemy, jaki zakres warto sprawdzić dla danego wyjazdu.",
      partner: null,
      bullets: ["Sprawdź koszty leczenia, ratownictwo i transport medyczny.", "Dopasuj ochronę do aktywności: sport, trekking, narty lub nurkowanie.", "Zweryfikuj wyłączenia odpowiedzialności i limity świadczeń przed zakupem."],
    },
    transfery: {
      kicker: "PO PRZYLOCIE", title: "Transfery lotniskowe",
      lead: "Porównujemy pakiety całościowo — transfer w cenie może być ważniejszy niż kilkadziesiąt złotych różnicy w cenie wyjazdu.",
      partner: null,
      bullets: ["Sprawdź, czy transfer jest zawarty w pakiecie organizatora.", "Jeśli nie — porównaj transport publiczny, taxi i transfer prywatny.", "Zwróć uwagę na godzinę przylotu i odległość hotelu od lotniska."],
    },
    "wynajem-auta": {
      kicker: "NA MIEJSCU", title: "Wynajem auta na wakacje",
      lead: "Najpierw ustal, czy samochód rzeczywiście będzie potrzebny dla Twojej trasy i miejsca noclegu.",
      partner: null,
      bullets: ["Sprawdź depozyt, udział własny i zakres ubezpieczenia.", "Zweryfikuj zasady paliwowe i limit kilometrów.", "Sprawdź wymagany wiek kierowcy i zasady odbioru po godzinach."],
    },
  }[type];

  return <main><SiteHeader/><section className="shell service-page"><div className="kicker">{config.kicker}</div><h1>{config.title}</h1><p className="hub-lead">{config.lead}</p><div className="service-panel"><div><h2>Co sprawdzić?</h2><ul>{config.bullets.map((b)=><li key={b}>{b}</li>)}</ul></div><div className="service-cta">{config.partner ? <><strong>{config.partner.name}</strong><p>Do partnera przejdziesz dopiero na końcu. Link jest afiliacyjny i może naliczyć Tripowni prowizję bez dodatkowego kosztu dla Ciebie.</p><a href={config.partner.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">Przejdź do {config.partner.name} →</a></> : <><strong>Porównywarka w przygotowaniu</strong><p>Nie wysyłamy Cię na przypadkową stronę tylko po to, żeby mieć link. Gdy dodamy sprawdzonego partnera, pojawi się tu konkretna opcja.</p><Link href="/poradniki">Zobacz poradniki →</Link></>}</div></div></section><SiteFooter/></main>;
}

function humanize(path: string) {
  return decodeURIComponent(path.split("/").filter(Boolean).pop() || "Podróże")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}


const experiencePages: Record<string, {
  kicker: string;
  title: string;
  season: string;
  lead: string;
  highlights: string[];
  keywords: string[];
  partnerQuery: string;
  kiwiCode: string;
  eskyCountryCode?: string;
  eskySlug?: string;
}> = {
  "/islandia-zorza-polarna": {
    kicker: "PODRÓŻ PO PRZEŻYCIA", title: "🌌 Zorza na Islandii", season: "Najlepszy czas: wrzesień–marzec",
    lead: "Wyjazd planowany pod ciemne noce, geotermię, wodospady i szansę zobaczenia zorzy polarnej — nie tylko pod sam Reykjavik.",
    highlights: ["Najwięcej godzin ciemności przypada na późną jesień i zimę.","Zorzę warto łączyć z Golden Circle, gorącymi źródłami i południowym wybrzeżem.","Nie da się zagwarantować zorzy — pogoda i aktywność słoneczna decydują o widoczności."],
    keywords:["islandia","reykjavik"], partnerQuery:"Islandia", kiwiCode:"REK", eskyCountryCode:"is", eskySlug:"islandia",
  },
  "/japonia-kwitnienie-wisni": {
    kicker: "PODRÓŻ PO PRZEŻYCIA", title: "🌸 Kwitnienie wiśni w Japonii", season: "Najczęściej: marzec–kwiecień",
    lead: "Podróż układana pod sakurę. Termin kwitnienia zmienia się z roku na rok i różni się pomiędzy południem, Tokio, Kioto i północą Japonii.",
    highlights: ["Tokio i Kioto zwykle są najmocniej oblegane w szczycie sezonu.","Warto zostawić elastyczność między miastami zamiast przywiązywać cały wyjazd do jednego dnia.","Prognozy kwitnienia najlepiej weryfikować ponownie krótko przed wyjazdem."],
    keywords:["japonia","tokio","tokyo","kioto","kyoto","osaka"], partnerQuery:"Japonia", kiwiCode:"TYO", eskyCountryCode:"jp", eskySlug:"japonia",
  },
  "/norwegia-fiordy": {
    kicker: "PODRÓŻ PO PRZEŻYCIA", title: "🏔️ Fiordy i białe noce", season: "Najlepszy czas: maj–wrzesień",
    lead: "Długie dni, trekking, wodospady i drogi widokowe. To kierunek, w którym pora roku mocno zmienia możliwości zwiedzania.",
    highlights: ["Późna wiosna i lato dają najwięcej czasu na trasy widokowe.","Czerwiec i lipiec oznaczają bardzo długie dni, szczególnie im dalej na północ.","Na trekkingach warunki mogą zmieniać się szybko nawet w środku lata."],
    keywords:["norwegia","oslo","bergen","fiord"], partnerQuery:"Norwegia", kiwiCode:"OSL", eskyCountryCode:"no", eskySlug:"norwegia",
  },
  "/nowa-zelandia-najlepszy-czas": {
    kicker: "PODRÓŻ PO PRZEŻYCIA", title: "🥾 Nowa Zelandia", season: "Najlepszy czas: listopad–marzec",
    lead: "Road trip, góry, trekking i lato na południowej półkuli. Taki wyjazd warto planować pod pogodę i trasę, a nie tylko pod najtańszy lot.",
    highlights: ["Grudzień–luty to lato i jednocześnie najbardziej popularny okres.","Wyspa Północna i Południowa mają różny klimat oraz zupełnie inne tempo podróży.","Przy krótszym wyjeździe lepiej wybrać jedną wyspę niż próbować zobaczyć wszystko."],
    keywords:["nowa zelandia","auckland","queenstown"], partnerQuery:"Nowa Zelandia", kiwiCode:"AKL",
  },
  "/jarmarki-bozonarodzeniowe": {
    kicker:"PODRÓŻ PO PRZEŻYCIA", title:"🎄 Jarmarki bożonarodzeniowe", season:"Najlepszy czas: koniec listopada–grudzień",
    lead:"Krótki zimowy city break z iluminacjami, jarmarkiem i świątecznym klimatem. Tu ważniejsza od samej ceny jest lokalizacja i dobry termin.",
    highlights:["Wiedeń, Praga i Budapeszt są najłatwiejsze na 2–3 noce.","Weekendy są najdroższe — warto sprawdzać niedziela–wtorek lub środek tygodnia.","Hotel blisko centrum ogranicza koszty i czas dojazdów."],
    keywords:["wiedeń","wieden","praga","budapeszt","niemcy","drezno","berlin"], partnerQuery:"Wiedeń", kiwiCode:"VIE",
  },
  "/holandia-tulipany": {
    kicker:"PODRÓŻ PO PRZEŻYCIA", title:"🌷 Tulipany w Holandii", season:"Najlepszy czas: kwiecień–początek maja",
    lead:"Amsterdam plus ogrody i pola tulipanów. Najlepszy efekt daje połączenie miasta z jednodniowym wypadem poza centrum.",
    highlights:["Szczyt kwitnienia zależy od pogody.","Keukenhof warto rezerwować wcześniej w popularne weekendy.","Amsterdam nie musi być jedyną bazą — sprawdź też Haarlem i Leiden."],
    keywords:["amsterdam","holandia","niderlandy"], partnerQuery:"Amsterdam", kiwiCode:"AMS",
  },
  "/safari-kenia-tanzania": {
    kicker:"PODRÓŻ PO PRZEŻYCIA", title:"🦁 Safari w Kenii i Tanzanii", season:"Najlepszy czas: czerwiec–październik",
    lead:"Safari warto planować pod migracje zwierząt, porę suchą i logistykę parków — dopiero potem pod samą cenę lotu.",
    highlights:["Masai Mara i Serengeti dają zupełnie inne warianty trasy.","Pora sucha poprawia widoczność zwierząt, ale podnosi ceny.","Po safari można dołożyć kilka dni na Zanzibarze lub Diani Beach."],
    keywords:["kenia","nairobi","tanzania","zanzibar"], partnerQuery:"Kenia", kiwiCode:"NBO",
  },
  "/egzotyka-zima": {
    kicker:"PODRÓŻ PO PRZEŻYCIA", title:"🌴 Egzotyka zimą", season:"Najlepszy czas: listopad–marzec",
    lead:"Kiedy w Polsce jest zimno, część Azji, Karaibów i Oceanu Indyjskiego wchodzi w najlepszy sezon pogodowy.",
    highlights:["Tajlandia, Zanzibar i Malediwy to mocne kierunki na polską zimę.","Cena lotu to tylko część budżetu — porównuj też transfery i standard noclegu.","Przy dalekim locie zwykle opłaca się zostać minimum 8–10 nocy."],
    keywords:["malediwy","mauritius","seszele","zanzibar","bali","tajlandia","phuket","sri lanka","dominikana","meksyk","wietnam"], partnerQuery:"Malediwy", kiwiCode:"MLE",
  },
};

function ExperiencePage({ path }: { path: string }) {
  const page = experiencePages[path];
  if (!page) return null;

  const active = offers
    .filter(o => o.availabilityStatus !== "expired")
    .filter(o => {
      const haystack = `${o.city} ${o.country} ${o.hotel} ${o.reason} ${o.category.join(" ")}`.toLocaleLowerCase("pl");
      return page.keywords.some(k => haystack.includes(k.toLocaleLowerCase("pl")));
    })
    .sort((a,b) => b.score - a.score)
    .slice(0,4);

  const bookingUrl = partners.booking.buildUrl(`https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(page.partnerQuery)}`);
  const kiwiDeep = new URL("https://www.kiwi.com/deep");
  kiwiDeep.searchParams.set("from", "WAW");
  kiwiDeep.searchParams.set("to", page.kiwiCode);
  kiwiDeep.searchParams.set("sort", "price");
  kiwiDeep.searchParams.set("asc", "1");
  kiwiDeep.searchParams.set("currency", "PLN");
  kiwiDeep.searchParams.set("locale", "pl");
  const kiwiUrl = partners.kiwi.buildUrl(kiwiDeep.toString());
  const eskyUrl = page.eskyCountryCode && page.eskySlug
    ? partners.esky.buildUrl(`https://www.esky.pl/tanie-loty/0/0/co/${page.eskyCountryCode}/${page.eskySlug}`)
    : partners.esky.buildUrl("https://www.esky.pl/tanie-loty/");

  return <main>
    <SiteHeader/>
    <section className="shell experience-detail-page">
      <div className="kicker">{page.kicker}</div>
      <h1>{page.title}</h1>
      <div className="experience-season">{page.season}</div>
      <p className="hub-lead">{page.lead}</p>
      <div className="experience-checklist">{page.highlights.map((item, i) => <div key={item}><span>{i + 1}</span><p>{item}</p></div>)}</div>
      <div className="experience-actions">
        <Link className="primary-cta" href={`/?focus=destination#wyszukiwarka`}>Szukaj po swoich parametrach →</Link>
        <Link className="secondary-cta" href="/podroze-po-przezycia">← Kalendarz przeżyć</Link>
      </div>

      <section className="experience-current-offers">
        <div className="section-heading"><div><div className="kicker">AKTUALNIE W TRIPOWNI</div><h2>{active.length ? `Aktualne okazje: ${page.partnerQuery}` : `Sprawdź aktualne ceny: ${page.partnerQuery}`}</h2><p>{active.length ? "Najpierw pokazujemy dopasowane aktywne oferty z bazy Tripowni." : "Nie mamy dziś zapisanej karty cenowej dokładnie pod to przeżycie. Nie pokazujemy losowych ofert — przejdź od razu do aktualnego wyszukiwania partnerów."}</p></div></div>
        {active.length > 0 && <div className="cards-grid">{active.map(o => <OfferCard key={o.id} offer={o}/>)}</div>}
        <div className="experience-partner-grid">
          <a href={eskyUrl} target="_blank" rel="sponsored noopener noreferrer"><span>✈️</span><div><strong>Loty w eSky</strong><small>Kierunek ustawiony na {page.partnerQuery}</small></div><b>Sprawdź →</b></a>
          <a href={kiwiUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🛫</span><div><strong>Loty w Kiwi.com</strong><small>Cel ustawiony · sortowanie od najniższej ceny</small></div><b>Sprawdź →</b></a>
          <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🏨</span><div><strong>Noclegi Booking.com</strong><small>Wyszukiwanie dla: {page.partnerQuery}</small></div><b>Sprawdź →</b></a>
        </div>
      </section>
    </section>
    <SiteFooter/>
  </main>;
}

function ExperiencesCalendarPage() {
  const cards = [
    ["/islandia-zorza-polarna","WRZESIEŃ–MARZEC","🌌 Zorza na Islandii","Ciemne noce, wodospady, geotermia i polowanie na zorzę."],
    ["/japonia-kwitnienie-wisni","MARZEC–KWIECIEŃ","🌸 Kwitnienie wiśni w Japonii","Wyjazd planowany pod sakurę, a nie tylko pod Tokio i Kioto."],
    ["/norwegia-fiordy","MAJ–WRZESIEŃ","🏔️ Fiordy i białe noce","Długie dni, trekking i spektakularne trasy widokowe."],
    ["/nowa-zelandia-najlepszy-czas","LISTOPAD–MARZEC","🥾 Nowa Zelandia","Road trip, góry i lato na południowej półkuli."],
    ["/jarmarki-bozonarodzeniowe","LISTOPAD–GRUDZIEŃ","🎄 Jarmarki bożonarodzeniowe","Wiedeń, Praga, Budapeszt i świąteczne city breaki."],
    ["/holandia-tulipany","KWIECIEŃ–MAJ","🌷 Tulipany w Holandii","Amsterdam, Keukenhof i kolorowe pola kwiatów."],
    ["/safari-kenia-tanzania","CZERWIEC–PAŹDZIERNIK","🦁 Safari w Afryce","Kenia i Tanzania planowane pod porę suchą i migracje."],
    ["/egzotyka-zima","LISTOPAD–MARZEC","🌴 Egzotyka zimą","Malediwy, Zanzibar, Tajlandia i inne kierunki w najlepszym sezonie."],
  ] as const;

  return <main><SiteHeader/><section className="shell hub-page experience-calendar-page"><div className="kicker">PODRÓŻE PO PRZEŻYCIA</div><h1>Kalendarz przeżyć</h1><p className="hub-lead">Niektóre podróże mają sens właśnie w konkretnym momencie roku. Wybierz doświadczenie, a dostaniesz sezon, wskazówki i od razu ścieżkę do aktualnych ofert.</p><div className="discovery-grid">{cards.map(([href, season, title, text]) => <Link key={href} className="discovery-card experience-calendar-card" href={href}><small>{season}</small><strong>{title}</strong><span>{text}</span><b>Zobacz terminy i oferty →</b></Link>)}</div></section><SiteFooter/></main>;
}


function buildEskyFlightsUrl(destination = "") {
  const base = destination
    ? `https://www.esky.pl/tanie-loty/?to=${encodeURIComponent(destination)}`
    : "https://www.esky.pl/tanie-loty/";
  const url = new URL(base);
  url.searchParams.set("partner_id", "TRIPOWNIAPL");
  return url.toString();
}

function buildKiwiPriceUrl(destination = "") {
  const deep = new URL("https://www.kiwi.com/deep");
  deep.searchParams.set("from", "WAW");
  deep.searchParams.set("to", destination || "anywhere");
  deep.searchParams.set("sort", "price");
  deep.searchParams.set("asc", "1");
  deep.searchParams.set("currency", "PLN");
  deep.searchParams.set("locale", "pl");
  return partners.kiwi.buildUrl(deep.toString());
}

function PurchaseLinks({ query, kiwiCode = "" }: { query: string; kiwiCode?: string }) {
  const booking = partners.booking.buildUrl(`https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(query)}`);
  const eskyFlights = buildEskyFlightsUrl(query);
  const kiwi = buildKiwiPriceUrl(kiwiCode || query);
  const eskyPackage = partners.esky.buildUrl(`https://www2.esky.pl/lot+hotel/portfolio?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&context=pl-packages&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES`);

  return <div className="sales-partner-strip">
    <a href={eskyFlights} target="_blank" rel="sponsored noopener noreferrer"><span>✈️</span><div><strong>Loty eSky</strong><small>partner_id=TRIPOWNIAPL</small></div><b>Sprawdź →</b></a>
    <a href={kiwi} target="_blank" rel="sponsored noopener noreferrer"><span>🛫</span><div><strong>Kiwi.com</strong><small>Sortowanie od najniższej ceny</small></div><b>Sprawdź →</b></a>
    <a href={booking} target="_blank" rel="sponsored noopener noreferrer"><span>🏨</span><div><strong>Booking.com</strong><small>Noclegi dla: {query}</small></div><b>Sprawdź →</b></a>
    <a href={eskyPackage} target="_blank" rel="sponsored noopener noreferrer"><span>🧳</span><div><strong>eSky Lot + Hotel</strong><small>TRIPOWNIAPLPACKAGES</small></div><b>Sprawdź →</b></a>
  </div>;
}

function CityBreakPage() {
  const cityOffers = offers
    .filter(o => o.availabilityStatus !== "expired")
    .filter(o => o.category.includes("city") || o.nights <= 5)
    .sort((a,b) => a.price - b.price)
    .slice(0,8);
  const cities = [
    ["Rzym","ROM","🇮🇹"],["Barcelona","BCN","🇪🇸"],["Porto","OPO","🇵🇹"],["Malta","MLA","🇲🇹"],
    ["Budapeszt","BUD","🇭🇺"],["Wiedeń","VIE","🇦🇹"],["Praga","PRG","🇨🇿"],["Paryż","PAR","🇫🇷"],
  ] as const;
  return <main><SiteHeader/>
    <section className="sales-hero sales-hero-city"><div className="shell sales-hero-inner"><div><div className="kicker">CITY BREAK</div><h1>Krótki wyjazd. Konkretna cena. Rezerwacja bez krążenia po stronach.</h1><p>Najpierw pokazujemy aktualne okazje Tripownii. Jeśli chcesz szukać szerzej, przechodzisz od razu do lotów, noclegów albo pakietu Lot + Hotel.</p><div className="sales-hero-actions"><Link className="primary-cta" href="/?trip=city-break#wyszukiwarka">Ustaw własne parametry →</Link><a className="secondary-cta" href="#city-oferty">Zobacz najtańsze teraz</a></div></div><div className="sales-hero-box"><small>NAJSZYBSZA ŚCIEŻKA</small><strong>2–5 nocy</strong><span>Weekend, długi weekend albo kilka dni poza sezonem.</span><ul><li>lot + nocleg</li><li>sortowanie po cenie</li><li>zakup u partnera</li></ul></div></div></section>
    <section className="shell sales-page" id="city-oferty"><div className="section-heading"><div><div className="kicker">NAJTAŃSZE CITY BREAKI</div><h2>Oferty, od których warto zacząć</h2><p>Nie chowamy ofert za kolejnym kliknięciem. Otwórz kartę, sprawdź szczegóły i przejdź do rezerwacji.</p></div></div><div className="cards-grid">{cityOffers.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>
    <section className="shell sales-page"><div className="section-heading"><div><div className="kicker">POPULARNE TERAZ</div><h2>Wybierz miasto i od razu sprawdź zakup</h2></div></div><div className="destination-sales-grid">{cities.map(([name,code,flag])=><div key={name} className="destination-sales-card"><span>{flag}</span><strong>{name}</strong><p>Loty, noclegi i pakiety w jednym miejscu.</p><PurchaseLinks query={name} kiwiCode={code}/></div>)}</div></section>
    <SiteFooter/></main>;
}

function LastMinutePage() {
  const lastMinute = offers
    .filter(o => o.availabilityStatus !== "expired")
    .filter(o => o.nights >= 5 || o.category.includes("allinclusive") || o.category.includes("plaza"))
    .sort((a,b) => a.price - b.price)
    .slice(0,8);
  const wakacjeUrl = partners.wakacje.buildUrl("https://www.wakacje.pl/lastminute/");
  const eximUrl = partners.exim.buildUrl("https://www.exim.pl/");
  return <main><SiteHeader/>
    <section className="sales-hero sales-hero-last"><div className="shell sales-hero-inner"><div><div className="kicker">LAST MINUTE</div><h1>Najbliższy wyjazd ma prowadzić do ceny, nie do kolejnego poradnika.</h1><p>Aktualne wakacje, All Inclusive i ciepłe kierunki. Najpierw konkretne oferty Tripownii, potem pełne wyszukiwanie partnerów.</p><div className="sales-hero-actions"><Link className="primary-cta" href="/?trip=wakacje#wyszukiwarka">Znajdź po swoich parametrach →</Link><a className="secondary-cta" href="#last-oferty">Pokaż oferty</a></div></div><div className="sales-hero-box hot"><small>SZYBKIE FILTRY</small><strong>Wyjazd w najbliższym terminie</strong><span>Najpierw cena i dostępność, potem dodatki.</span><div className="sales-quick-tags"><span>🍹 All Inclusive</span><span>☀️ Ciepło</span><span>✈️ Z Polski</span><span>💸 Od najtańszych</span></div></div></div></section>
    <section className="shell sales-page" id="last-oferty"><div className="section-heading"><div><div className="kicker">AKTUALNE LAST MINUTE</div><h2>Najtańsze aktywne propozycje</h2></div></div><div className="cards-grid">{lastMinute.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section>
    <section className="shell sales-page"><div className="section-heading"><div><div className="kicker">SZUKAJ SZERZEJ</div><h2>Nie znalazłaś idealnej oferty?</h2><p>Przejdź do partnera z gotową ścieżką zakupową, zamiast wracać do Google.</p></div></div><div className="big-partner-grid"><a href={wakacjeUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🏖️</span><strong>Wakacje.pl Last Minute</strong><small>Pakiety wielu organizatorów</small><b>Sprawdź oferty →</b></a><a href={eximUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🌴</span><strong>EXIM Tours</strong><small>Wakacje i czartery</small><b>Sprawdź oferty →</b></a><a href={partners.esky.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><span>🧳</span><strong>eSky Lot + Hotel</strong><small>Sortuj po najniższej cenie</small><b>Sprawdź pakiety →</b></a><a href={buildEskyFlightsUrl()} target="_blank" rel="sponsored noopener noreferrer"><span>✈️</span><strong>Same loty eSky</strong><small>partner_id=TRIPOWNIAPL</small><b>Szukaj lotów →</b></a></div></section>
    <SiteFooter/></main>;
}

function DirectionsPage() {
  const popular = [
    ["Malta","MLA","🇲🇹"],["Cypr","PFO","🇨🇾"],["Madera","FNC","🇵🇹"],["Egipt","HRG","🇪🇬"],
    ["Turcja","AYT","🇹🇷"],["Albania","TIA","🇦🇱"],["Rzym","ROM","🇮🇹"],["Barcelona","BCN","🇪🇸"],
  ] as const;
  const exotic = [
    ["Malediwy","MLE","🏝️"],["Zanzibar","ZNZ","🌴"],["Tajlandia","BKK","🇹🇭"],["Sri Lanka","CMB","🇱🇰"],
    ["Wietnam","SGN","🇻🇳"],["Japonia","TYO","🇯🇵"],["Mauritius","MRU","🇲🇺"],["Nowa Zelandia","AKL","🇳🇿"],
  ] as const;
  return <main><SiteHeader/>
    <section className="sales-hero sales-hero-directions"><div className="shell sales-hero-inner"><div><div className="kicker">KIERUNKI</div><h1>Wybierz miejsce. My od razu pokażemy Ci, gdzie sprawdzić cenę.</h1><p>Kierunki nie są już katalogiem do czytania. Każdy prowadzi do aktualnych ofert Tripownii oraz lotów, noclegów i pakietów u partnerów.</p><div className="sales-hero-actions"><Link className="primary-cta" href="/?trip=inspiracje&focus=destination#wyszukiwarka">Wpisz własny kierunek →</Link><a className="secondary-cta" href="#popularne-kierunki">Zobacz popularne</a></div></div><div className="sales-hero-box"><small>JAK CHCESZ WYJECHAĆ?</small><div className="sales-quick-tags"><Link href="/?trip=city-break#wyszukiwarka">🏙 City break</Link><Link href="/?trip=wakacje#wyszukiwarka">🏖 Wakacje</Link><Link href="/egzotyka-zima">🌴 Egzotyka</Link><Link href="/podroze-po-przezycia">✨ Przeżycia</Link></div></div></div></section>
    <section className="shell sales-page" id="popularne-kierunki"><div className="section-heading"><div><div className="kicker">POPULARNE TERAZ</div><h2>Kierunki, które warto sprawdzić najpierw</h2></div></div><div className="destination-sales-grid">{popular.map(([name,code,flag])=><div key={name} className="destination-sales-card"><span>{flag}</span><strong>{name}</strong><p>Sprawdź lot, hotel i pakiet bez kolejnego wyszukiwania.</p><PurchaseLinks query={name} kiwiCode={code}/></div>)}</div></section>
    <section className="shell sales-page"><div className="section-heading"><div><div className="kicker">EGZOTYKA</div><h2>Dalej niż Europa</h2><p>Najpierw wybierz kierunek, potem porównaj lot i nocleg. Przy dalekich trasach cena samego lotu nie mówi wszystkiego.</p></div></div><div className="destination-sales-grid exotic-grid">{exotic.map(([name,code,flag])=><div key={name} className="destination-sales-card exotic"><span>{flag}</span><strong>{name}</strong><p>Loty i noclegi z bezpośrednim przejściem do partnerów.</p><PurchaseLinks query={name} kiwiCode={code}/></div>)}</div></section>
    <SiteFooter/></main>;
}

function AliasLandingPage({ path }: { path: string }) {
  const title = humanize(path);
  const q = decodeURIComponent(path).toLocaleLowerCase("pl").replace(/[-/]/g," ");
  const active = offers.filter(o => o.availabilityStatus !== "expired");
  const related = active.filter(o => {
    const haystack = [
      o.city,
      o.country,
      o.hotel,
      o.board,
      ...o.category,
    ].join(" ").toLocaleLowerCase("pl");
    return q.split(/\s+/).filter(Boolean).some(token => token.length > 2 && haystack.includes(token));
  }).slice(0,6);
  const shown = related.length ? related : active.slice(0,6);
  const hasDirectMatches = related.length > 0;

  return <main>
    <SiteHeader/>
    <section className="shell hub-page">
      <div className="kicker">INSPIRACJE TRIPOWNI</div>
      <h1>{title}</h1>
      <p className="hub-lead">
        {hasDirectMatches
          ? `Zebraliśmy aktualne propozycje pasujące do tematu „${title}”. Otwórz ofertę na Tripowni, sprawdź szczegóły i dopiero potem przejdź do partnera.`
          : `Sprawdź aktualne okazje i inspiracje Tripowni związane z tematem „${title}”. Jeśli nie ma dziś dokładnego dopasowania, pokażemy najciekawsze aktywne propozycje.`}
      </p>
      <div className="cards-grid">{shown.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
      <div style={{marginTop:30,display:"flex",gap:10,flexWrap:"wrap"}}>
        <Link className="primary-cta" href="/#wyszukiwarka">Wyszukaj po swojemu →</Link>
        <Link className="secondary-cta" href="/okazje">Zobacz wszystkie okazje</Link>
      </div>
    </section>
    <SiteFooter/>
  </main>;
}

export default function UnifiedPage({ path }: { path: string }) {
  if (path === "/okazje") return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">AKTUALNE OKAZJE</div><h1>Podróże, które warto sprawdzić</h1><p className="hub-lead">Najpierw otwierasz ofertę na Tripowni, sprawdzasz ocenę i szczegóły, a dopiero potem przechodzisz do partnera.</p><div className="cards-grid">{offers.map(o=><OfferCard key={o.id} offer={o}/>)}</div></section><SiteFooter/></main>;

  if (path === "/poradniki") return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">MAGAZYN TRIPOWNI</div><h1>Poradniki podróżnicze</h1><p className="hub-lead">Dotychczasowe artykuły Tripowni w jednym miejscu.</p><div className="article-grid">{legacyPosts.map(p=><Link key={p.path} href={p.path}><span>PORADNIK</span><strong>{p.title}</strong><p>{p.description}</p><b>Czytaj →</b></Link>)}</div></section><SiteFooter/></main>;

  if (path === "/parkingi") return <ServicePage type="parkingi"/>;
  if (path === "/atrakcje") return <ServicePage type="atrakcje"/>;
  if (path === "/esim") return <ServicePage type="esim"/>;
  if (path === "/ubezpieczenia") return <ServicePage type="ubezpieczenia"/>;
  if (path === "/transfery") return <ServicePage type="transfery"/>;
  if (path === "/wynajem-auta") return <ServicePage type="wynajem-auta"/>;
  if (path === "/podroze-po-przezycia") return <ExperiencesCalendarPage/>;
  if (experiencePages[path]) return <ExperiencePage path={path}/>;

  if (path === "/city-break-2") return <CityBreakPage/>;
  if (path === "/last-minute") return <LastMinutePage/>;
  if (path === "/kierunki") return <DirectionsPage/>;

  const item = findLegacy(path);
  if (item) return <LegacyPage item={item}/>;
  if (isInternalAlias(path)) return <AliasLandingPage path={path}/>;
  return null;
}
