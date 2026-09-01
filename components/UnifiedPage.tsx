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


function buildExperienceEskyUrl(arrivalPlaces: string) {
  const url = new URL("https://www2.esky.pl/lot+hotel/portfolio");
  url.searchParams.set("rooms[0][adults]", "2");
  url.searchParams.set("datesTab", "flexDates");
  url.searchParams.set("stayLength", "5:10");
  url.searchParams.set("arrivalPlaces", arrivalPlaces);
  url.searchParams.set("departurePlaces", "ap-WAW");
  url.searchParams.set("selectedDeparturePlaces", "ap-WAW");
  url.searchParams.set("context", "pl-packages");
  url.searchParams.set("sort[TotalPrice]", "asc");
  return partners.esky.buildUrl(url.toString());
}

function buildExperienceBookingUrl(query: string) {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", query);
  return partners.booking.buildUrl(url.toString());
}

const experiencePages: Record<string, {
  kicker: string;
  title: string;
  season: string;
  lead: string;
  highlights: string[];
}> = {
  "/islandia-zorza-polarna": {
    kicker: "PODRÓŻ PO PRZEŻYCIA",
    title: "🌌 Zorza na Islandii",
    season: "Najlepszy czas: wrzesień–marzec",
    lead: "Wyjazd planowany pod ciemne noce, geotermię, wodospady i szansę zobaczenia zorzy polarnej — nie tylko pod sam Reykjavik.",
    highlights: [
      "Najwięcej godzin ciemności przypada na późną jesień i zimę.",
      "Zorzę warto łączyć z Golden Circle, gorącymi źródłami i południowym wybrzeżem.",
      "Nie da się zagwarantować zorzy — pogoda i aktywność słoneczna decydują o widoczności.",
    ],
  },
  "/japonia-kwitnienie-wisni": {
    kicker: "PODRÓŻ PO PRZEŻYCIA",
    title: "🌸 Kwitnienie wiśni w Japonii",
    season: "Najczęściej: marzec–kwiecień",
    lead: "Podróż układana pod sakurę. Termin kwitnienia zmienia się z roku na rok i różni się pomiędzy południem, Tokio, Kioto i północą Japonii.",
    highlights: [
      "Tokio i Kioto zwykle są najmocniej oblegane w szczycie sezonu.",
      "Warto zostawić elastyczność między miastami zamiast przywiązywać cały wyjazd do jednego dnia.",
      "Prognozy kwitnienia najlepiej weryfikować ponownie krótko przed wyjazdem.",
    ],
  },
  "/norwegia-fiordy": {
    kicker: "PODRÓŻ PO PRZEŻYCIA",
    title: "🏔️ Fiordy i białe noce",
    season: "Najlepszy czas: maj–wrzesień",
    lead: "Długie dni, trekking, wodospady i drogi widokowe. To kierunek, w którym pora roku mocno zmienia możliwości zwiedzania.",
    highlights: [
      "Późna wiosna i lato dają najwięcej czasu na trasy widokowe.",
      "Czerwiec i lipiec oznaczają bardzo długie dni, szczególnie im dalej na północ.",
      "Na trekkingach warunki mogą zmieniać się szybko nawet w środku lata.",
    ],
  },
  "/nowa-zelandia-najlepszy-czas": {
    kicker: "PODRÓŻ PO PRZEŻYCIA",
    title: "🥾 Nowa Zelandia",
    season: "Najlepszy czas: listopad–marzec",
    lead: "Road trip, góry, trekking i lato na południowej półkuli. Taki wyjazd warto planować pod pogodę i trasę, a nie tylko pod najtańszy lot.",
    highlights: [
      "Grudzień–luty to lato i jednocześnie najbardziej popularny okres.",
      "Wyspa Północna i Południowa mają różny klimat oraz zupełnie inne tempo podróży.",
      "Przy krótszym wyjeździe lepiej wybrać jedną wyspę niż próbować zobaczyć wszystko.",
    ],
  },
};

const experienceOfferConfig: Record<string, {
  terms: string[];
  heading: string;
  emptyText: string;
  eskyArrival: string;
  bookingQuery: string;
}> = {
  "/islandia-zorza-polarna": {
    terms: ["islandia", "reykjavik"],
    heading: "Aktualne okazje na Islandię",
    emptyText: "Nie mamy dziś zapisanej karty cenowej na Islandię, ale możesz od razu sprawdzić aktualne wyniki u naszych partnerów.",
    eskyArrival: "co-IS",
    bookingQuery: "Islandia",
  },
  "/japonia-kwitnienie-wisni": {
    terms: ["japonia", "tokio", "tokyo", "kioto", "kyoto", "osaka"],
    heading: "Aktualne okazje do Japonii 🇯🇵",
    emptyText: "Nie mamy dziś zapisanej karty cenowej do Japonii, ale możesz od razu sprawdzić aktualne wyniki u naszych partnerów.",
    eskyArrival: "co-JP",
    bookingQuery: "Japonia",
  },
  "/norwegia-fiordy": {
    terms: ["norwegia", "oslo", "bergen", "fiord"],
    heading: "Aktualne okazje do Norwegii",
    emptyText: "Nie mamy dziś zapisanej karty cenowej do Norwegii, ale możesz od razu sprawdzić aktualne wyniki u naszych partnerów.",
    eskyArrival: "co-NO",
    bookingQuery: "Norwegia",
  },
  "/nowa-zelandia-najlepszy-czas": {
    terms: ["nowa zelandia", "auckland", "queenstown"],
    heading: "Aktualne okazje do Nowej Zelandii",
    emptyText: "Nie mamy dziś zapisanej karty cenowej do Nowej Zelandii, ale możesz od razu sprawdzić aktualne wyniki u naszych partnerów.",
    eskyArrival: "co-NZ",
    bookingQuery: "Nowa Zelandia",
  },
};

function ExperiencePage({ path }: { path: string }) {
  const page = experiencePages[path];
  if (!page) return null;

  const offerConfig = experienceOfferConfig[path];
  const directOffers = offers
    .filter(o => o.availabilityStatus !== "expired")
    .filter(o => {
      if (!offerConfig) return false;
      const haystack = [o.city, o.country, o.hotel, o.board, ...o.category]
        .join(" ")
        .toLocaleLowerCase("pl");
      return offerConfig.terms.some(term => haystack.includes(term.toLocaleLowerCase("pl")));
    })
    .sort((a,b) => b.score - a.score)
    .slice(0,4);

  return <main>
    <SiteHeader/>
    <section className="shell experience-detail-page">
      <div className="kicker">{page.kicker}</div>
      <h1>{page.title}</h1>
      <div className="experience-season">{page.season}</div>
      <p className="hub-lead">{page.lead}</p>

      <div className="experience-checklist">
        {page.highlights.map((item, i) => <div key={item}>
          <span>{i + 1}</span>
          <p>{item}</p>
        </div>)}
      </div>

      <div className="experience-actions">
        <a className="primary-cta" href="#aktualne-oferty">Sprawdź aktualne okazje →</a>
        <Link className="secondary-cta" href="/podroze-po-przezycia">← Kalendarz przeżyć</Link>
      </div>

      <section className="experience-current-offers" id="aktualne-oferty">
        <div className="section-heading">
          <div>
            <div className="kicker">AKTUALNIE W TRIPOWNI</div>
            <h2>{offerConfig?.heading || "Aktualne okazje"}</h2>
            <p>{directOffers.length
              ? "Pokazujemy tylko aktywne propozycje z bazy Tripowni pasujące do tego kierunku."
              : offerConfig?.emptyText || "Dziś nie mamy aktywnej oferty dla tego kierunku."}</p>
          </div>
        </div>
        {directOffers.length > 0 ? <div className="cards-grid">{directOffers.map(o => <OfferCard key={o.id} offer={o}/>)}</div> : offerConfig && <div className="experience-affiliate-fallback">
          <a href={buildExperienceEskyUrl(offerConfig.eskyArrival)} target="_blank" rel="sponsored noopener noreferrer">✈️ Sprawdź lot + hotel w eSky →</a>
          <a href={buildExperienceBookingUrl(offerConfig.bookingQuery)} target="_blank" rel="sponsored noopener noreferrer">🏨 Sprawdź noclegi w Booking.com →</a>
        </div>}
      </section>
    </section>
    <SiteFooter/>
  </main>;
}

function ExperiencesCalendarPage() {
  const cards = [
    { href:"/islandia-zorza-polarna", season:"WRZESIEŃ–MARZEC", title:"🌌 Zorza na Islandii", text:"Ciemne noce, wodospady, geotermia i polowanie na zorzę.", terms:["islandia","reykjavik"], eskyArrival:"co-IS", bookingQuery:"Islandia" },
    { href:"/japonia-kwitnienie-wisni", season:"WIOSNA", title:"🌸 Kwitnienie wiśni w Japonii", text:"Wyjazd planowany pod sakurę, a nie tylko pod Tokio i Kioto.", terms:["japonia","tokio","tokyo","kioto","kyoto","osaka"], eskyArrival:"co-JP", bookingQuery:"Japonia" },
    { href:"/norwegia-fiordy", season:"MAJ–WRZESIEŃ", title:"🏔️ Fiordy i białe noce", text:"Długie dni, trekking i spektakularne trasy widokowe.", terms:["norwegia","oslo","bergen","fiord"], eskyArrival:"co-NO", bookingQuery:"Norwegia" },
    { href:"/nowa-zelandia-najlepszy-czas", season:"LISTOPAD–MARZEC", title:"🥾 Nowa Zelandia", text:"Road trip, góry i lato na południowej półkuli.", terms:["nowa zelandia","auckland","queenstown"], eskyArrival:"co-NZ", bookingQuery:"Nowa Zelandia" },
  ];

  const activeOffers = offers.filter(o => o.availabilityStatus !== "expired");

  return <main>
    <SiteHeader/>
    <section className="shell hub-page experience-calendar-page">
      <div className="kicker">PODRÓŻE PO PRZEŻYCIA</div>
      <h1>Kalendarz przeżyć</h1>
      <p className="hub-lead">Niektóre podróże mają sens właśnie w konkretnym momencie roku. Wybierz zjawisko lub doświadczenie, a od razu sprawdzisz też aktualne możliwości wyjazdu.</p>
      <div className="experience-calendar-list">
        {cards.map((card) => {
          const matched = activeOffers
            .filter(o => {
              const haystack = [o.city, o.country, o.hotel, o.board, ...o.category].join(" ").toLocaleLowerCase("pl");
              return card.terms.some(term => haystack.includes(term.toLocaleLowerCase("pl")));
            })
            .sort((a,b) => b.score - a.score)
            .slice(0,3);

          return <section key={card.href} className="experience-calendar-block">
            <article className="discovery-card experience-calendar-card">
              <small>{card.season}</small>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
              <div className="experience-card-actions">
                <Link href={card.href}>Przewodnik →</Link>
              </div>
            </article>

            <div className="experience-calendar-offers">
              <div className="experience-calendar-offers-head">
                <strong>Aktualne oferty</strong>
                <span>{matched.length ? "Znalezione w Tripowni" : "Szukaj u partnerów"}</span>
              </div>
              {matched.length ? <div className="experience-mini-offers">
                {matched.map(o => <OfferCard key={o.id} offer={o}/>) }
              </div> : <div className="experience-affiliate-fallback compact">
                <a href={buildExperienceEskyUrl(card.eskyArrival)} target="_blank" rel="sponsored noopener noreferrer">✈️ Lot + hotel w eSky →</a>
                <a href={buildExperienceBookingUrl(card.bookingQuery)} target="_blank" rel="sponsored noopener noreferrer">🏨 Noclegi w Booking.com →</a>
              </div>}
            </div>
          </section>;
        })}
      </div>
    </section>
    <SiteFooter/>
  </main>;
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

  const item = findLegacy(path);
  if (item) return <LegacyPage item={item}/>;
  if (isInternalAlias(path)) return <AliasLandingPage path={path}/>;
  return null;
}
