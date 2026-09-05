import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import LegacyPage from "@/components/LegacyPage";
import { legacyPosts, findLegacy } from "@/lib/legacy";
import { isInternalAlias } from "@/lib/internalAliases";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import AdminStudio from "@/components/AdminStudio";


const EXPERIENCE_IMAGE_BY_CITY: Record<string, string> = {
  islandia: "/images/destinations/reykjavik.jpg", reykjavik: "/images/destinations/reykjavik.jpg",
  tokio: "/images/destinations/tokio.jpg", japonia: "/images/destinations/tokio.jpg",
  amsterdam: "/images/destinations/amsterdam.jpg", bergamo: "/images/destinations/bergamo.jpg",
  barcelona: "/images/destinations/barcelona.jpg", dubaj: "/images/destinations/dubaj.jpg", bali: "/images/destinations/bali.jpg",
  madera: "/images/destinations/madera.jpg", porto: "/images/destinations/porto.jpg", lizbona: "/images/destinations/lizbona.jpg",
  rzym: "/images/destinations/rzym.jpg", praga: "/images/destinations/praga.jpg", budapeszt: "/images/destinations/budapeszt.jpg",
  wieden: "/images/destinations/wieden.jpg", teneryfa: "/images/destinations/teneryfa.jpg", zanzibar: "/images/destinations/zanzibar.jpg",
};
function experienceImage<T extends {city:string; image?:string}>(offer:T):T {
  const key=offer.city.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const image=EXPERIENCE_IMAGE_BY_CITY[key];
  return image ? {...offer,image:`${image}?v=20260902`} : offer;
}

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
      bullets: ["Sprawdź, ile masz realnie czasu na miejscu.", "Wybierz 1–2 najważniejsze atrakcje zamiast kupować wszystko na zapas.", "Na końcu sprawdź aktualną dostępność i cenę."],
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

  return <main><SiteHeader/><section className="shell service-page"><div className="kicker">{config.kicker}</div><h1>{config.title}</h1><p className="hub-lead">{config.lead}</p><div className="service-panel"><div><h2>Co sprawdzić?</h2><ul>{config.bullets.map((b)=><li key={b}>{b}</li>)}</ul></div><div className="service-cta">{config.partner ? <><strong>Sprawdź dostępne opcje</strong><p>Po kliknięciu przechodzisz bezpośrednio do rezerwacji. Cena i dostępność są potwierdzane na ostatnim kroku.</p><a href={config.partner.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">Sprawdź teraz →</a></> : <><strong>Porównywarka w przygotowaniu</strong><p>Nie wysyłamy Cię na przypadkową stronę tylko po to, żeby mieć link. Gdy dodamy sprawdzonego partnera, pojawi się tu konkretna opcja.</p><Link href="/poradniki">Zobacz poradniki →</Link></>}</div></div></section><SiteFooter/></main>;
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
        <div className="section-heading"><div><div className="kicker">AKTUALNIE W TRIPOWNI</div><h2>{active.length ? `Aktualne okazje: ${page.partnerQuery}` : `Sprawdź aktualne ceny: ${page.partnerQuery}`}</h2><p>{active.length ? "Najpierw pokazujemy dopasowane aktywne oferty z bazy Tripowni." : "Nie mamy dziś zapisanej karty cenowej dokładnie pod to przeżycie. Nie pokazujemy losowych ofert — przejdź od razu do aktualnego wyszukiwania."}</p></div></div>
        {active.length > 0 && <div className="cards-grid">{active.map(o => <OfferCard key={o.id} offer={experienceImage(o)}/>)}</div>}
        <div className="experience-partner-grid">
          <a href={eskyUrl} target="_blank" rel="sponsored noopener noreferrer"><span>✈️</span><div><strong>Sprawdź loty</strong><small>Kierunek ustawiony na {page.partnerQuery}</small></div><b>Sprawdź →</b></a>
          <a href={kiwiUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🛫</span><div><strong>Loty w Loty</strong><small>Cel ustawiony · sortowanie od najniższej ceny</small></div><b>Sprawdź →</b></a>
          <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🏨</span><div><strong>Noclegi Noclegi</strong><small>Wyszukiwanie dla: {page.partnerQuery}</small></div><b>Sprawdź →</b></a>
        </div>
      </section>
    </section>
    <SiteFooter/>
  </main>;
}


type ExperienceTripSuggestion = {
  flag: string;
  city: string;
  country: string;
  airport: string;
  from: string;
  to: string;
  nights: number;
  tag: string;
  note: string;
  image: string;
};

const experienceTrips: Record<string, ExperienceTripSuggestion[]> = {
  "/islandia-zorza-polarna": [
    {flag:"🇮🇸",city:"Reykjavík",country:"Islandia",airport:"KEF",from:"2026-11-19",to:"2026-11-23",nights:4,tag:"ZORZA + GEOTERMIA",note:"Reykjavík, Golden Circle i wieczorne polowanie na zorzę.",image:"/images/destinations/reykjavik.jpg"},
    {flag:"🇳🇴",city:"Tromsø",country:"Norwegia",airport:"TOS",from:"2027-01-14",to:"2027-01-18",nights:4,tag:"ARKTYCZNA NORWEGIA",note:"Najmocniejsza norweska baza na zorzę, fiordy i zimowe aktywności.",image:"/images/destinations/oslo.jpg"},
    {flag:"🇫🇮",city:"Rovaniemi",country:"Finlandia",airport:"RVN",from:"2026-12-03",to:"2026-12-07",nights:4,tag:"LAPONIA",note:"Zorza, śnieg i arktyczny klimat — gotowy zimowy city break.",image:"/images/destinations/helsinki.jpg"},
  ],
  "/japonia-kwitnienie-wisni": [
    {flag:"🇯🇵",city:"Tokio",country:"Japonia",airport:"NRT",from:"2027-03-27",to:"2027-04-06",nights:10,tag:"SAKURA",note:"Tokio w sezonie kwitnienia + czas na jednodniowe wypady.",image:"/images/destinations/tokio.jpg"},
    {flag:"🇯🇵",city:"Osaka + Kioto",country:"Japonia",airport:"KIX",from:"2027-03-30",to:"2027-04-09",nights:10,tag:"KIOTO I SAKURA",note:"Baza w Kansai: Kioto, Osaka, Nara i świątynie wśród kwitnących wiśni.",image:"/images/destinations/tokio.jpg"},
    {flag:"🇯🇵",city:"Tokio + Osaka",country:"Japonia",airport:"HND",from:"2027-04-01",to:"2027-04-13",nights:12,tag:"JAPONIA PEŁNIEJ",note:"Dłuższy wariant dla tych, którzy chcą połączyć dwa największe regiony.",image:"/images/destinations/tokio.jpg"},
  ],
  "/norwegia-fiordy": [
    {flag:"🇳🇴",city:"Bergen",country:"Norwegia",airport:"BGO",from:"2027-05-20",to:"2027-05-25",nights:5,tag:"FIORDY",note:"Najlepsza baza na norweskie fiordy i rejsy widokowe.",image:"/images/destinations/oslo.jpg"},
    {flag:"🇳🇴",city:"Oslo",country:"Norwegia",airport:"OSL",from:"2027-06-03",to:"2027-06-07",nights:4,tag:"DŁUGIE DNI",note:"Oslo + szybki wypad w naturę i bardzo długie letnie wieczory.",image:"/images/destinations/oslo.jpg"},
    {flag:"🇳🇴",city:"Stavanger",country:"Norwegia",airport:"SVG",from:"2027-06-17",to:"2027-06-22",nights:5,tag:"PREIKESTOLEN",note:"Kierunek pod trekking, fiord Lysefjord i spektakularne widoki.",image:"/images/destinations/oslo.jpg"},
  ],
  "/nowa-zelandia-najlepszy-czas": [
    {flag:"🇳🇿",city:"Auckland",country:"Nowa Zelandia",airport:"AKL",from:"2027-01-13",to:"2027-01-27",nights:14,tag:"WYSPA PÓŁNOCNA",note:"Auckland jako start road tripu po północnej części kraju.",image:"/images/destinations/nowa-zelandia.jpg"},
    {flag:"🇳🇿",city:"Queenstown",country:"Nowa Zelandia",airport:"ZQN",from:"2027-02-03",to:"2027-02-17",nights:14,tag:"WYSPA POŁUDNIOWA",note:"Góry, jeziora i jeden z najlepszych regionów na road trip.",image:"/images/destinations/nowa-zelandia.jpg"},
    {flag:"🇳🇿",city:"Christchurch",country:"Nowa Zelandia",airport:"CHC",from:"2027-02-10",to:"2027-02-24",nights:14,tag:"ROAD TRIP",note:"Dobry punkt startowy do trasy przez Alpy Południowe.",image:"/images/destinations/nowa-zelandia.jpg"},
  ],
  "/jarmarki-bozonarodzeniowe": [
    {flag:"🇦🇹",city:"Wiedeń",country:"Austria",airport:"VIE",from:"2026-12-04",to:"2026-12-07",nights:3,tag:"JARMARK",note:"Klasyk: Rathausplatz, Schönbrunn i trzy noce w świątecznym Wiedniu.",image:"/images/destinations/wieden.jpg"},
    {flag:"🇨🇿",city:"Praga",country:"Czechy",airport:"PRG",from:"2026-12-11",to:"2026-12-14",nights:3,tag:"JARMARK",note:"Rynek Staromiejski, Most Karola i zimowa Praga na weekend.",image:"/images/destinations/praga.jpg"},
    {flag:"🇭🇺",city:"Budapeszt",country:"Węgry",airport:"BUD",from:"2026-12-17",to:"2026-12-20",nights:3,tag:"JARMARK + TERMY",note:"Świąteczny klimat połączony z termami i wieczornym Dunajem.",image:"/images/destinations/budapeszt.jpg"},
  ],
  "/holandia-tulipany": [
    {flag:"🇳🇱",city:"Amsterdam",country:"Holandia",airport:"AMS",from:"2027-04-15",to:"2027-04-19",nights:4,tag:"TULIPANY",note:"Amsterdam + jednodniowy wypad do Keukenhof w środku sezonu.",image:"/images/destinations/amsterdam.jpg"},
    {flag:"🇳🇱",city:"Haarlem",country:"Holandia",airport:"AMS",from:"2027-04-22",to:"2027-04-26",nights:4,tag:"Pola kwiatów",note:"Spokojniejsza baza bliżej pól tulipanów i wybrzeża.",image:"/images/destinations/amsterdam.jpg"},
    {flag:"🇳🇱",city:"Leiden",country:"Holandia",airport:"AMS",from:"2027-04-29",to:"2027-05-03",nights:4,tag:"HOLANDIA WIOSNĄ",note:"Kanały, mniejsze miasto i łatwy dojazd do ogrodów oraz pól.",image:"/images/destinations/amsterdam.jpg"},
  ],
  "/safari-kenia-tanzania": [
    {flag:"🇰🇪",city:"Nairobi",country:"Kenia",airport:"NBO",from:"2027-07-08",to:"2027-07-18",nights:10,tag:"SAFARI KENIA",note:"Start pod Masai Mara i klasyczne safari w porze suchej.",image:"/images/destinations/zanzibar.jpg"},
    {flag:"🇹🇿",city:"Kilimandżaro",country:"Tanzania",airport:"JRO",from:"2027-08-12",to:"2027-08-22",nights:10,tag:"SERENGETI",note:"Najlepsza baza pod Serengeti, Ngorongoro i północ Tanzanii.",image:"/images/destinations/zanzibar.jpg"},
    {flag:"🇹🇿",city:"Zanzibar",country:"Tanzania",airport:"ZNZ",from:"2027-09-02",to:"2027-09-12",nights:10,tag:"SAFARI + PLAŻA",note:"Wariant dla tych, którzy po safari chcą odpocząć nad oceanem.",image:"/images/destinations/zanzibar.jpg"},
  ],
  "/egzotyka-zima": [
    {flag:"🇲🇻",city:"Malediwy",country:"Malediwy",airport:"MLE",from:"2027-01-21",to:"2027-01-30",nights:9,tag:"SUCHA PORA",note:"Rajskie atole w jednym z najlepszych pogodowo miesięcy.",image:"/images/destinations/malediwy.jpg"},
    {flag:"🇹🇿",city:"Zanzibar",country:"Tanzania",airport:"ZNZ",from:"2027-02-04",to:"2027-02-13",nights:9,tag:"ZIMA W SŁOŃCU",note:"Ocean, Stone Town i plaże w środku polskiej zimy.",image:"/images/destinations/zanzibar.jpg"},
    {flag:"🇹🇭",city:"Phuket",country:"Tajlandia",airport:"HKT",from:"2027-02-18",to:"2027-02-28",nights:10,tag:"TAJLANDIA",note:"Ciepło, wyspy i bardzo dobry moment pogodowy na południe Tajlandii.",image:"/images/destinations/phuket.jpg"},
  ],
};

function curatedTripUrl(trip: ExperienceTripSuggestion) {
  const query = `loty Warszawa ${trip.city} ${trip.country} ${trip.from} ${trip.to}`;
  return `https://www.google.com/travel/flights?hl=pl&q=${encodeURIComponent(query)}`;
}

function formatTripDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {day:"2-digit",month:"short",year:"numeric",timeZone:"Europe/Warsaw"}).format(new Date(`${value}T12:00:00Z`));
}

function ExperienceTripCards({ path }: { path: string }) {
  const trips = experienceTrips[path] || [];
  return <div className="experience-concrete-grid">
    {trips.map((trip) => <a className="experience-concrete-card" href={curatedTripUrl(trip)} target="_blank" rel="sponsored noopener noreferrer" key={`${path}-${trip.city}`}>
      <div className="experience-concrete-photo" style={{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.58)),url('${trip.image}')`}}>
        <span>{trip.flag} {trip.country}</span>
        <b>{trip.tag}</b>
      </div>
      <div className="experience-concrete-body">
        <small>KONKRETNY WYJAZD</small>
        <h3>{trip.city}</h3>
        <div className="experience-concrete-meta"><span>📅 {formatTripDate(trip.from)} – {formatTripDate(trip.to)}</span><span>🌙 {trip.nights} nocy</span><span>✈️ Warszawa → {trip.airport}</span></div>
        <p>{trip.note}</p>
        <strong className="experience-concrete-cta">✈️ Sprawdź loty na ten dokładny wyjazd →</strong>
      </div>
    </a>)}
  </div>;
}

function ExperiencesCalendarPage() {
  const cards = [
    ["/islandia-zorza-polarna","WRZESIEŃ–MARZEC","🌌 Zorza polarna","Islandia, północ Norwegii i Laponia — od razu z gotowymi wariantami wyjazdu."],
    ["/japonia-kwitnienie-wisni","MARZEC–KWIECIEŃ","🌸 Kwitnienie wiśni w Japonii","Tokio, Osaka i Kioto w terminach ustawionych pod sezon sakury."],
    ["/norwegia-fiordy","MAJ–WRZESIEŃ","🏔️ Fiordy i białe noce","Bergen, Oslo i Stavanger — trzy różne sposoby na Norwegię."],
    ["/nowa-zelandia-najlepszy-czas","LISTOPAD–MARZEC","🥾 Nowa Zelandia","Auckland, Queenstown i Christchurch jako konkretne początki road tripu."],
    ["/jarmarki-bozonarodzeniowe","LISTOPAD–GRUDZIEŃ","🎄 Jarmarki bożonarodzeniowe","Wiedeń, Praga i Budapeszt w gotowych grudniowych terminach."],
    ["/holandia-tulipany","KWIECIEŃ–MAJ","🌷 Tulipany w Holandii","Amsterdam, Haarlem i Leiden — trzy bazy na sezon tulipanów."],
    ["/safari-kenia-tanzania","CZERWIEC–PAŹDZIERNIK","🦁 Safari w Afryce","Nairobi, Kilimandżaro i Zanzibar — konkretne wejścia w Kenię i Tanzanię."],
    ["/egzotyka-zima","LISTOPAD–MARZEC","🌴 Egzotyka zimą","Malediwy, Zanzibar i Phuket w terminach ustawionych na zimowe słońce."],
  ] as const;

  return <main><SiteHeader/>
    <section className="shell hub-page experience-calendar-page">
      <div className="kicker">PODRÓŻE PO PRZEŻYCIA</div>
      <h1>Nie tylko inspiracja. Od razu wybierz konkretny wyjazd.</h1>
      <p className="hub-lead">Każde przeżycie ma już gotowe propozycje: konkretny kierunek, długość, termin i ustawiony lot z Warszawy. Klikasz wariant i sprawdzasz właśnie ten wyjazd — bez wracania do ogólnej wyszukiwarki.</p>

      <div className="experience-live-list">
        {cards.map(([href, season, title, text]) => <section className="experience-live-row" key={href}>
          <div className="experience-live-head">
            <div><small>{season}</small><h2>{title}</h2><p>{text}</p></div>
            <Link href={href}>Jak zaplanować to przeżycie? →</Link>
          </div>
          <ExperienceTripCards path={href}/>
        </section>)}
      </div>
    </section>
    <SiteFooter/>
  </main>;
}


type LongTrip = {
  id: string;
  flag: string;
  region: string;
  title: string;
  airport: string;
  bookingCity: string;
  duration: number;
  best: string;
  ideal: string;
  lead: string;
  highlights: string;
};

const longTrips: LongTrip[] = [
  { id:"wietnam", flag:"🇻🇳", region:"AZJA", title:"Wietnam", airport:"HAN", bookingCity:"Hanoi", duration:12, best:"listopad – kwiecień*", ideal:"10–16 dni", lead:"Hanoi, Ha Long, środkowy Wietnam i południe kraju. To kierunek, który najlepiej smakuje etapami.", highlights:"Hanoi · Ha Long · Hoi An · Da Nang · Ho Chi Minh" },
  { id:"pekin", flag:"🇨🇳", region:"CHINY", title:"Pekin", airport:"PEK", bookingCity:"Beijing", duration:7, best:"wiosna i jesień", ideal:"5–8 dni", lead:"Wielki Mur, Zakazane Miasto, hutongi i metropolia, która daje zupełnie inną skalę miejskiej podróży.", highlights:"Wielki Mur · Zakazane Miasto · Świątynia Nieba · hutongi" },
  { id:"nowy-jork", flag:"🇺🇸", region:"USA", title:"Nowy Jork", airport:"JFK", bookingCity:"New York", duration:7, best:"kwiecień – czerwiec / wrzesień – listopad", ideal:"6–9 dni", lead:"Manhattan to dopiero początek. Przy tygodniu jest czas na Brooklyn, muzea, punkty widokowe i spacer bez gonienia.", highlights:"Manhattan · Brooklyn · Central Park · muzea · rooftop views" },
  { id:"japonia", flag:"🇯🇵", region:"JAPONIA", title:"Japonia — Tokio i Kioto", airport:"NRT", bookingCity:"Tokyo", duration:12, best:"marzec – maj / październik – listopad", ideal:"10–14 dni", lead:"Tokio, Kioto i szybka kolej między regionami. Jeśli lecieć tak daleko, warto zobaczyć więcej niż jedno miasto.", highlights:"Tokio · Kioto · Osaka · Fuji · shinkansen" },
  { id:"tajlandia", flag:"🇹🇭", region:"TAJLANDIA", title:"Tajlandia — Bangkok i wyspy", airport:"BKK", bookingCity:"Bangkok", duration:12, best:"listopad – marzec*", ideal:"10–14 dni", lead:"Kilka dni w Bangkoku, potem południe albo wyspy. Klasyk, ale nadal jeden z najlepszych pierwszych kierunków w Azji.", highlights:"Bangkok · Phuket / Krabi · street food · świątynie · plaże" },
  { id:"bali", flag:"🇮🇩", region:"INDONEZJA", title:"Bali", airport:"DPS", bookingCity:"Bali", duration:12, best:"maj – październik", ideal:"10–14 dni", lead:"Nie zamykamy Bali w jednym resorcie: południe, Ubud i kilka dni bliżej natury dają dużo ciekawszą podróż.", highlights:"Ubud · świątynie · tarasy ryżowe · ocean · Nusa" },
  { id:"singapur", flag:"🇸🇬", region:"SINGAPUR", title:"Singapur", airport:"SIN", bookingCity:"Singapore", duration:5, best:"cały rok", ideal:"4–6 dni", lead:"Świetny samodzielnie, ale jeszcze lepszy jako stopover przed dalszą Azją. Bardzo łatwy logistycznie.", highlights:"Marina Bay · Gardens by the Bay · hawker centres · Sentosa" },
  { id:"seul", flag:"🇰🇷", region:"KOREA", title:"Seul", airport:"ICN", bookingCity:"Seoul", duration:8, best:"kwiecień – maj / wrzesień – październik", ideal:"7–10 dni", lead:"Nowoczesna metropolia, pałace, dzielnice pełne jedzenia i dobra baza do pierwszej podróży po Korei.", highlights:"Seul · pałace · Hongdae · street food · DMZ" },
  { id:"kapsztad", flag:"🇿🇦", region:"RPA", title:"Kapsztad", airport:"CPT", bookingCity:"Cape Town", duration:10, best:"listopad – marzec", ideal:"8–12 dni", lead:"Góry, ocean, winnice i trasy samochodowe. Kierunek, który bardzo dobrze łączy miasto z naturą.", highlights:"Table Mountain · Cape Point · winnice · ocean · Garden Route" },
  { id:"sydney", flag:"🇦🇺", region:"AUSTRALIA", title:"Sydney", airport:"SYD", bookingCity:"Sydney", duration:12, best:"październik – kwiecień", ideal:"10+ dni", lead:"Tak daleki lot warto potraktować jako początek większej podróży po Australii, nie tylko wizytę przy Operze.", highlights:"Sydney · Blue Mountains · wybrzeże · road trip" },
  { id:"meksyk", flag:"🇲🇽", region:"MEKSYK", title:"Meksyk", airport:"MEX", bookingCity:"Mexico City", duration:12, best:"listopad – kwiecień*", ideal:"10–16 dni", lead:"Mexico City, kultura, kuchnia i możliwość dołożenia drugiego regionu — od Jukatanu po wybrzeże Pacyfiku.", highlights:"Mexico City · Teotihuacán · Oaxaca · Jukatan" },
  { id:"malediwy", flag:"🇲🇻", region:"OCEAN INDYJSKI", title:"Malediwy", airport:"MLE", bookingCity:"Malé", duration:8, best:"styczeń – kwiecień", ideal:"7–10 dni", lead:"Tu mniej znaczy więcej: dobra wyspa, transfer i warunki pogodowe są ważniejsze niż długa lista atrakcji.", highlights:"laguny · snorkeling · resort / lokalna wyspa · nurkowanie" },
];

function longTripIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function longTripDates(stay: number) {
  const departure = new Date();
  departure.setUTCDate(departure.getUTCDate() + 70);
  const ret = new Date(departure);
  ret.setUTCDate(ret.getUTCDate() + stay);
  return { departure: longTripIso(departure), ret: longTripIso(ret) };
}

function longTripEskyUrl(airport: string, stay: number) {
  const { departure, ret } = longTripDates(stay);
  return `https://www2.esky.pl/flights/search/mp/WAWA/ap/${airport}?departureDate=${departure}&returnDate=${ret}&pa=2&py=0&pc=0&pi=0&sc=economy&partner_id=TRIPOWNIAPL&flexDatesOffset=0`;
}

function longTripBookingUrl(city: string, stay: number) {
  const { departure, ret } = longTripDates(stay);
  const params = new URLSearchParams({ ss: city, checkin: departure, checkout: ret, group_adults: "2", no_rooms: "1", group_children: "0", aid: "818288" });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function LongHaulPage() {
  return <main className="long-haul-page">
    <SiteHeader/>
    <section className="long-haul-hero"><div className="shell">
      <div className="kicker">DALEKIE PODRÓŻE</div>
      <h1>Barcelona była. Rzym był. To lecimy dalej.</h1>
      <p>Wietnam, Pekin, Nowy Jork, Japonia i kierunki, dla których warto mieć więcej niż trzy dni. Pokazujemy, ile czasu ma sens, kiedy lecieć i od razu ustawiamy kierunek w wyszukiwarce lotów i noclegów.</p>
      <div className="long-haul-hero-tags"><a href="#wietnam">🇻🇳 Wietnam</a><a href="#pekin">🇨🇳 Pekin</a><a href="#nowy-jork">🇺🇸 Nowy Jork</a><a href="#japonia">🇯🇵 Japonia</a><a href="#tajlandia">🇹🇭 Tajlandia</a><a href="#bali">🇮🇩 Bali</a></div>
    </div></section>
    <section className="section shell long-haul-intro">
      <div className="section-heading"><div><div className="kicker">WIĘKSZA PODRÓŻ</div><h2>Tu nie wybieramy tylko miasta.</h2><p>Przy dalekim wyjeździe liczy się sezon, długość pobytu, przesiadki i to, czy da się sensownie połączyć kilka miejsc.</p></div></div>
      <div className="long-haul-principles"><div><span>🗓️</span><strong>Minimum czasu</strong><p>Nie proponujemy 4 dni w miejscu, do którego leci się kilkanaście godzin.</p></div><div><span>🌦️</span><strong>Sezon ma znaczenie</strong><p>Podpowiadamy lepsze okna pogodowe zamiast udawać, że każdy miesiąc jest taki sam.</p></div><div><span>✈️</span><strong>Lot już ustawiony</strong><p>CTA otwiera gotowe wyszukiwanie lotu z Warszawy do właściwego kierunku i dla przykładowego terminu.</p></div><div><span>🏨</span><strong>Nocleg już ustawiony</strong><p>Otwieramy noclegi z ustawioną miejscowością i tym samym terminem.</p></div></div>
    </section>
    <section className="section shell"><div className="long-haul-list">
      {longTrips.map(trip => <article className="long-haul-detail-card" id={trip.id} key={trip.id}>
        <div className="long-haul-detail-head"><span>{trip.flag}</span><div><small>{trip.region}</small><h2>{trip.title}</h2></div></div>
        <p className="long-haul-detail-lead">{trip.lead}</p>
        <div className="long-haul-detail-facts"><div><small>NAJLEPSZY CZAS</small><strong>{trip.best}</strong></div><div><small>ILE DNI</small><strong>{trip.ideal}</strong></div></div>
        <p className="long-haul-highlights"><b>Co łączyć:</b> {trip.highlights}</p>
        <div className="long-haul-actions"><a href={longTripEskyUrl(trip.airport, trip.duration)} target="_blank" rel="nofollow sponsored noopener noreferrer">✈️ Loty z Warszawy</a><a href={longTripBookingUrl(trip.bookingCity, trip.duration)} target="_blank" rel="nofollow sponsored noopener noreferrer">🏨 Noclegi</a><Link href="/atrakcje">🎟️ Atrakcje</Link></div>
      </article>)}
    </div><p className="long-haul-note">* Warunki pogodowe różnią się między regionami danego kraju. Przed rezerwacją zawsze sprawdź konkretną trasę i aktualną sytuację.</p></section>
    <section className="shell long-haul-final"><div><div className="kicker">NIE WIESZ, OD CZEGO ZACZĄĆ?</div><h2>Najpierw wybierz typ podróży. Potem porównamy konkretne opcje.</h2><p>Możesz wrócić do pełnej wyszukiwarki Tripowni i ustawić własne lotnisko, termin, długość oraz budżet.</p></div><Link href="/#wyszukiwarka">Przejdź do wyszukiwarki →</Link></section>
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
          ? `Zebraliśmy aktualne propozycje pasujące do tematu „${title}”. Otwórz ofertę na Tripowni, sprawdź szczegóły i dopiero potem przejdź do rezerwacji.`
          : `Sprawdź aktualne okazje i inspiracje Tripowni związane z tematem „${title}”. Jeśli nie ma dziś dokładnego dopasowania, pokażemy najciekawsze aktywne propozycje.`}
      </p>
      <div className="cards-grid">{shown.map(o=><OfferCard key={o.id} offer={experienceImage(o)}/>)}</div>
      <div style={{marginTop:30,display:"flex",gap:10,flexWrap:"wrap"}}>
        <Link className="primary-cta" href="/#wyszukiwarka">Wyszukaj po swojemu →</Link>
        <Link className="secondary-cta" href="/okazje">Zobacz wszystkie okazje</Link>
      </div>
    </section>
    <SiteFooter/>
  </main>;
}

export default function UnifiedPage({ path }: { path: string }) {
  if (path === "/admin") return <><SiteHeader/><AdminStudio offers={offers}/><SiteFooter/></>;

  if (path === "/okazje") return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">AKTUALNE OKAZJE</div><h1>Podróże, które warto sprawdzić</h1><p className="hub-lead">Najpierw otwierasz ofertę na Tripowni, sprawdzasz ocenę i szczegóły, a dopiero potem przechodzisz do rezerwacji.</p><div className="cards-grid">{offers.map(o=><OfferCard key={o.id} offer={experienceImage(o)}/>)}</div></section><SiteFooter/></main>;

  if (path === "/poradniki") return <main><SiteHeader/><section className="shell hub-page"><div className="kicker">MAGAZYN TRIPOWNI</div><h1>Poradniki podróżnicze</h1><p className="hub-lead">Dotychczasowe artykuły Tripowni w jednym miejscu.</p><div className="article-grid">{legacyPosts.map(p=><Link key={p.path} href={p.path}><span>PORADNIK</span><strong>{p.title}</strong><p>{p.description}</p><b>Czytaj →</b></Link>)}</div></section><SiteFooter/></main>;

  if (path === "/parkingi") return <ServicePage type="parkingi"/>;
  if (path === "/atrakcje") return <ServicePage type="atrakcje"/>;
  if (path === "/esim") return <ServicePage type="esim"/>;
  if (path === "/ubezpieczenia") return <ServicePage type="ubezpieczenia"/>;
  if (path === "/transfery") return <ServicePage type="transfery"/>;
  if (path === "/wynajem-auta") return <ServicePage type="wynajem-auta"/>;
  if (path === "/podroze-po-przezycia") return <ExperiencesCalendarPage/>;
  if (path === "/dalekie-podroze") return <LongHaulPage/>;
  if (experiencePages[path]) return <ExperiencePage path={path}/>;

  const item = findLegacy(path);
  if (item) return <LegacyPage item={item}/>;
  if (isInternalAlias(path)) return <AliasLandingPage path={path}/>;
  return null;
}
