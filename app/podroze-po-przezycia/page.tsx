import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { EXPERIENCE_IMAGES } from "@/lib/experienceImages";
import SearchHub from "@/components/SearchHub";

export const metadata: Metadata = {
  title: "Podróże po przeżycia — kiedy lecieć na zorzę, sakurę i safari",
  description: "Kalendarz podróży po przeżycia: najlepsze okna na zorzę, sakurę, fiordy, safari, tulipany i egzotykę.",
  alternates: { canonical: "/podroze-po-przezycia" },
};

export const dynamic = "force-dynamic";

type Idea = { city:string; country:string; airport:string; sample:[string,string]; label:string };
type Experience = { id:string; icon:string; window:string; title:string; lead:string; image:string; searchTab:"City break"|"Wakacje"; note?:string; ideas:Idea[] };

const experiences: Experience[] = [
  { id:"zorza", image:EXPERIENCE_IMAGES.zorza, icon:"🌌", window:"wrzesień – marzec", title:"Zorza polarna", searchTab:"City break", note:"Prognoza zorzy ma sens dopiero blisko terminu. Tutaj wybierasz sezon i bazę, a nie obietnicę konkretnej nocy.", lead:"Największą szansę dają długie, ciemne noce. Najpierw wybierz bazę i kilka dni pobytu, a prognozę aktywności zorzy sprawdzaj dopiero tuż przed wyjazdem.", ideas:[
    {city:"Tromsø",country:"Norwegia",airport:"TOS",sample:["2027-01-21","2027-01-25"],label:"Norwegia · mocna baza na zorzę"},
    {city:"Reykjavík",country:"Islandia",airport:"KEF",sample:["2026-11-19","2026-11-23"],label:"Islandia · zorza + krajobrazy"},
    {city:"Rovaniemi",country:"Finlandia",airport:"RVN",sample:["2027-02-04","2027-02-08"],label:"Laponia · śnieg + zorza"},
  ]},
  { id:"sakura", image:EXPERIENCE_IMAGES.sakura, icon:"🌸", window:"orientacyjnie: koniec marca – połowa kwietnia", title:"Sakura w Japonii", searchTab:"Wakacje", note:"Daty 2027 są przykładowe. Dokładna prognoza kwitnienia pojawia się bliżej sezonu i różni się między regionami.", lead:"Nie wybieraj jednej „pewnej” daty z rocznym wyprzedzeniem. Zacznij od regionu i szerokiego okna, a loty i noclegi dopnij tak, żeby mieć kilka dni marginesu.", ideas:[
    {city:"Tokio",country:"Japonia",airport:"NRT",sample:["2027-03-27","2027-04-04"],label:"Tokio · klasyczny start"},
    {city:"Osaka",country:"Japonia",airport:"KIX",sample:["2027-03-31","2027-04-07"],label:"Osaka + Kioto"},
    {city:"Fukuoka",country:"Japonia",airport:"FUK",sample:["2027-03-22","2027-03-29"],label:"Południe Japonii · zwykle wcześniej"},
  ]},
  { id:"fiordy", image:EXPERIENCE_IMAGES.fiordy, icon:"🏔️", window:"maj – wrzesień", title:"Fiordy Norwegii i długie dni", searchTab:"Wakacje", lead:"Najlepszy sezon na fiordy to długie dni, otwarte drogi widokowe i większy wybór rejsów. Wybierz bazę pod konkretny region zamiast wrzucać całą Norwegię do jednego planu.", ideas:[
    {city:"Bergen",country:"Norwegia",airport:"BGO",sample:["2027-06-10","2027-06-15"],label:"Bergen · Sognefjord i Hardangerfjord"},
    {city:"Ålesund",country:"Norwegia",airport:"AES",sample:["2027-07-01","2027-07-06"],label:"Ålesund · Geirangerfjord i road trip"},
    {city:"Stavanger",country:"Norwegia",airport:"SVG",sample:["2027-06-17","2027-06-22"],label:"Stavanger · Lysefjord i Preikestolen"},
  ]},
  { id:"nowa-zelandia", image:EXPERIENCE_IMAGES.nowa_zelandia, icon:"🥾", window:"listopad – marzec", title:"Nowa Zelandia — lato i road trip", searchTab:"Wakacje", lead:"Gdy w Polsce jest zima, w Nowej Zelandii trwa lato. To najlepsze okno na road trip, szlaki, fiordy i długie dni na trasie.", ideas:[
    {city:"Auckland",country:"Nowa Zelandia",airport:"AKL",sample:["2027-01-14","2027-01-25"],label:"Wyspa Północna · miasta + natura"},
    {city:"Queenstown",country:"Nowa Zelandia",airport:"ZQN",sample:["2027-02-04","2027-02-15"],label:"Wyspa Południowa · góry + fiordy"},
    {city:"Christchurch",country:"Nowa Zelandia",airport:"CHC",sample:["2027-02-18","2027-03-01"],label:"Road trip · południe wyspy"},
  ]},
  { id:"tulipany", image:EXPERIENCE_IMAGES.tulipany, icon:"🌷", window:"kwiecień – początek maja", title:"Tulipany w Holandii", searchTab:"City break", note:"Pełnia kwitnienia zależy od pogody. Traktuj termin jako sezon, a nie gwarancję konkretnego dnia.", lead:"Najlepszy efekt jest zwykle od połowy kwietnia do początku maja, ale dokładny moment zależy od pogody.", ideas:[
    {city:"Amsterdam",country:"Holandia",airport:"AMS",sample:["2027-04-15","2027-04-19"],label:"Amsterdam + Keukenhof"},
    {city:"Rotterdam",country:"Holandia",airport:"RTM",sample:["2027-04-22","2027-04-26"],label:"Rotterdam + pola kwiatów"},
    {city:"Eindhoven",country:"Holandia",airport:"EIN",sample:["2027-04-29","2027-05-03"],label:"Tańsza baza na objazd"},
  ]},
  { id:"safari", image:EXPERIENCE_IMAGES.safari, icon:"🦁", window:"czerwiec – październik", title:"Safari — Kenia i Tanzania", searchTab:"Wakacje", lead:"Pora sucha daje łatwiejsze obserwacje zwierząt i lepsze warunki na objazd parków. W środku tego okna można dopiero polować na konkretny termin.", ideas:[
    {city:"Nairobi",country:"Kenia",airport:"NBO",sample:["2027-07-08","2027-07-17"],label:"Kenia · Masai Mara"},
    {city:"Kilimanjaro",country:"Tanzania",airport:"JRO",sample:["2027-08-05","2027-08-14"],label:"Tanzania · Serengeti"},
    {city:"Zanzibar",country:"Tanzania",airport:"ZNZ",sample:["2027-09-09","2027-09-18"],label:"Safari + ocean"},
  ]},
  { id:"wieloryby", image:EXPERIENCE_IMAGES.fiordy, icon:"🐋", window:"zależnie od akwenu", title:"Wieloryby i ocean", searchTab:"Wakacje", note:"Sezon obserwacji różni się między Azorami, Maderą i Islandią — wybierz akwen, a dopiero potem termin.", lead:"Sezon zależy od akwenu, dlatego pokazujemy kierunki, w których obserwacje mają sens przez dłuższe okno, a nie jeden przypadkowy weekend.", ideas:[
    {city:"Ponta Delgada",country:"Portugalia",airport:"PDL",sample:["2027-05-06","2027-05-12"],label:"Azory · mocny sezon wiosenny"},
    {city:"Funchal",country:"Portugalia",airport:"FNC",sample:["2027-05-13","2027-05-19"],label:"Madera · ocean i natura"},
    {city:"Reykjavík",country:"Islandia",airport:"KEF",sample:["2027-06-03","2027-06-08"],label:"Islandia · rejsy latem"},
  ]},
  { id:"egzotyka", image:EXPERIENCE_IMAGES.egzotyka, icon:"🌴", window:"listopad – marzec", title:"Egzotyka w porze suchej", searchTab:"Wakacje", lead:"Gdy w Polsce jest zima, wybieramy miejsca z lepszym sezonem pogodowym — bez wciskania kierunku tylko dlatego, że jest tani.", ideas:[
    {city:"Zanzibar",country:"Tanzania",airport:"ZNZ",sample:["2027-01-14","2027-01-23"],label:"Zanzibar · ocean + ciepło"},
    {city:"Malé",country:"Malediwy",airport:"MLE",sample:["2027-02-04","2027-02-12"],label:"Malediwy · pora sucha"},
    {city:"Phuket",country:"Tajlandia",airport:"HKT",sample:["2027-02-18","2027-02-28"],label:"Tajlandia · Andamany"},
  ]},
];

type PageProps = {
  searchParams: Promise<{
    destination?: string;
    from?: string;
    to?: string;
    experience?: string;
  }>;
};

function internalExperienceSearch(i: Idea, experienceId: string) {
  const params = new URLSearchParams({
    destination: `${i.city}, ${i.country}`,
    from: i.sample[0],
    to: i.sample[1],
    experience: experienceId,
  });
  return `/podroze-po-przezycia?${params.toString()}#szukaj-przezycie`;
}

function plannerExperienceLink(i: Idea, experienceId: string) {
  const params = new URLSearchParams({
    source: "experience",
    city: i.city,
    country: i.country,
    start: i.sample[0],
    end: i.sample[1],
    experience: experienceId,
  });
  return `/dodaj-podroz?${params.toString()}`;
}

export default async function ExperiencesPage({ searchParams }: PageProps){
  const params = await searchParams;
  const selectedDestination = typeof params.destination === "string" ? params.destination : "";
  const selectedFrom = typeof params.from === "string" ? params.from : "";
  const selectedTo = typeof params.to === "string" ? params.to : "";
  const selectedExperience = typeof params.experience === "string" ? params.experience : "";
  const selectedExperienceData = experiences.find((item) => item.id === selectedExperience);
  const hasSelection = Boolean(selectedDestination);
  const selectedCity = selectedDestination.split(",")[0].trim();
  const selectedDatesValid = /^\d{4}-\d{2}-\d{2}$/.test(selectedFrom)
    && /^\d{4}-\d{2}-\d{2}$/.test(selectedTo) && selectedFrom < selectedTo;
  const datesForLinks: Record<string, string> = selectedDatesValid ? { outbound: selectedFrom, inbound: selectedTo } : {};
  const stayDates: Record<string, string> = selectedDatesValid ? { from: selectedFrom, to: selectedTo } : {};
  const flightHref = `/loty?${new URLSearchParams({ destination: selectedCity, ...datesForLinks }).toString()}`;
  const hotelHref = `/hotele?${new URLSearchParams({ destination: selectedDestination, ...stayDates }).toString()}`;
  const combinedHref = `/szukaj?${new URLSearchParams({ destination: selectedDestination, tab: "Lot + hotel", ...(selectedDatesValid ? { from: selectedFrom, to: selectedTo } : {}) }).toString()}`;
  const otherExperienceIdeas = (selectedExperienceData?.ideas || []).filter((idea) => idea.city.toLowerCase() !== selectedCity.toLowerCase());
  const showMarkets = Date.now() <= new Date("2027-01-07T22:59:59Z").getTime();
  return <main className="experience-expanded-page"><SiteHeader/><BreadcrumbSchema items={[{name:"Tripownia",url:"https://tripownia.pl/"},{name:"Podróże po przeżycia",url:"https://tripownia.pl/podroze-po-przezycia"}]}/>
    <section className="experience-expanded-hero"><div className="shell"><div className="kicker">PODRÓŻE PO PRZEŻYCIA</div><h1>Najpierw wybierz przeżycie. Potem dobierzemy miejsce i termin.</h1><p>Zorza, sakura, fiordy, safari czy egzotyka mają swój sezon. Tripownia pokazuje sensowne okno, konkretne bazy i pozwala od razu wyszukać wyjazd bez wyrzucania Cię do zewnętrznej strony.</p><div className="experience-season-nav"><a href="#zorza">🌌 Zorza</a><a href="#sakura">🌸 Sakura</a><a href="#fiordy">🏔️ Fiordy</a><a href="#nowa-zelandia">🥾 Nowa Zelandia</a><a href="#tulipany">🌷 Tulipany</a><a href="#safari">🦁 Safari</a><a href="#wieloryby">🐋 Wieloryby</a><a href="#egzotyka">🌴 Egzotyka</a>{showMarkets&&<Link href="/jarmarki-bozonarodzeniowe">🎄 Jarmarki</Link>}<Link href="/sylwester">🥂 Sylwester</Link></div></div></section>
    {hasSelection ? <section className="section shell experience-selected-search" id="szukaj-przezycie">
      <div className="section-heading">
        <div>
          <div className="kicker">WYBRANE: {selectedExperienceData?.title || "PODRÓŻ"}</div>
          <h2>Sprawdź {selectedDestination} w wybranym oknie</h2>
          <p>Ustawiliśmy przykładowy termin. Możesz go zmienić, wybrać lotnisko wylotu albo poszerzyć zakres — cały czas zostajesz w Tripowni.</p>
        </div>
      </div>
      <div className="experience-rescue-options" aria-label="Gotowe sposoby znalezienia podróży" style={{ marginBottom: 24 }}>
        <h3>Nie czekaj na gotowy pakiet — ułóż ten wyjazd po swojemu</h3>
        <p>Gotowe pakiety nie zawsze obejmują odległe kierunki i wczesne rezerwacje. Sprawdź osobno loty i noclegi z zachowaniem wybranych dat. Pokazujemy propozycje wyszukiwań, a nie niepotwierdzone ceny.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginTop: 14 }}>
          <Link className="btn primary" href={flightHref}>✈️ Loty do {selectedCity} →</Link>
          <Link className="btn secondary" href={hotelHref}>🏨 Noclegi w {selectedCity} →</Link>
          <Link className="btn secondary" href={combinedHref}>🌏 Spróbuj lot + hotel →</Link>
        </div>
        {otherExperienceIdeas.length > 0 && <div style={{ marginTop: 18 }}>
          <strong>Ten sam sezon, inne miejsca:</strong>
          <div className="experience-idea-actions" style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {otherExperienceIdeas.map(idea => <Link key={idea.city} href={internalExperienceSearch(idea, selectedExperience)}>{idea.city} · {idea.sample[0]}–{idea.sample[1]} →</Link>)}
          </div>
        </div>}
      </div>
      <div className="single-partner-search-wrap">
        <SearchHub
          key={`${selectedDestination}|${selectedFrom}|${selectedTo}`}
          embedded
          initialTab={selectedExperienceData?.searchTab || "Wakacje"}
          initialDestinations={[selectedDestination]}
          initialDateMode="range"
          initialDateFrom={selectedFrom}
          initialDateTo={selectedTo}
          searchRequest={1}
        />
      </div>
    </section> : <section className="shell experience-choice-guide">
      <div><strong>1. Wybierz przeżycie</strong><span>Sakura, fiordy, zorza, safari albo inny sezonowy pomysł.</span></div>
      <div><strong>2. Wybierz bazę</strong><span>Podajemy konkretne miasta zamiast ogólnego kraju.</span></div>
      <div><strong>3. Sprawdź w Tripowni</strong><span>Kierunek i daty wpadają od razu do wyszukiwarki poniżej.</span></div>
    </section>}
    <section className="section shell"><div className="experience-expanded-grid">{experiences.map(item=><article className="experience-expanded-card" id={item.id} key={item.id}><div className="experience-expanded-card-image"><img src={item.image} alt={item.title}/></div><div className="experience-expanded-card-top"><span>{item.icon}</span><div><small>REKOMENDOWANE OKNO</small><h2>{item.title}</h2><b className="experience-window">{item.window}</b></div></div><p className="experience-expanded-lead">{item.lead}</p>{item.note && <div className="experience-forecast-note"><strong>Ważne:</strong> {item.note}</div>}<div className="experience-ideas">{item.ideas.map(i=><div className="experience-idea" key={i.city}><strong>{i.city}</strong><small>{i.label}</small><div className="experience-idea-actions"><Link href={internalExperienceSearch(i, item.id)}>Sprawdź w Tripowni →</Link><Link href={plannerExperienceLink(i, item.id)}>Dodaj do planu</Link></div></div>)}</div></article>)}</div></section>
    {showMarkets&&<section className="shell experience-market-callout"><div><small>SEZONOWO</small><strong>Jarmarki bożonarodzeniowe 2026</strong><span>Sekcja działa tylko w sezonie i znika automatycznie po zakończeniu jarmarków.</span></div><Link href="/jarmarki-bozonarodzeniowe">Zobacz terminy jarmarków →</Link></section>}
    <SiteFooter/></main>
}
