import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "Podróże po przeżycia — kiedy lecieć na zorzę, sakurę, safari i więcej | Tripownia.pl",
  description: "Kalendarz podróży planowanych pod właściwy moment: zorza polarna, sakura, fiordy, tulipany, safari, wieloryby, jarmarki i egzotyka w najlepszym sezonie.",
  alternates: { canonical: "/podroze-po-przezycia" },
  openGraph: {
    title: "Podróże po przeżycia | Tripownia.pl",
    description: "Nie wybieraj tylko miejsca. Wybierz moment i przeżycie, dla którego warto polecieć.",
    url: "https://tripownia.pl/podroze-po-przezycia",
    type: "website",
  },
};

const experiences = [
  {
    id: "zorza",
    icon: "🌌",
    season: "wrzesień – marzec",
    title: "Zorza polarna na Islandii",
    lead: "Wyjazd ustawiony pod długie, ciemne noce — z geotermią, wodospadami i planem awaryjnym na pochmurne dni.",
    best: "Najwięcej sensu ma kilka nocy na miejscu i elastyczny plan, bo zorza nigdy nie jest gwarantowana.",
    watch: "Zachmurzenie, wiatr i aktywność zorzowa potrafią zmienić plan z dnia na dzień.",
  },
  {
    id: "lodowce",
    icon: "🧊",
    season: "jesień – zima",
    title: "Lodowce i jaskinie lodowe",
    lead: "Podróż dla osób, które chcą zobaczyć zimową Islandię nie tylko z drogi — ale też wejść w świat lodowców z lokalnym przewodnikiem.",
    best: "Termin dobieramy do rodzaju aktywności i dostępności tras, a nie do samej ceny lotu.",
    watch: "Warunki terenowe są dynamiczne; wejścia na lodowiec i do jaskiń wymagają aktualnego potwierdzenia operatora.",
  },
  {
    id: "sakura",
    icon: "🌸",
    season: "marzec – kwiecień",
    title: "Kwitnienie wiśni w Japonii",
    lead: "Tokio, Kioto i inne miasta w krótkim okresie, kiedy sakura staje się częścią całego doświadczenia podróży.",
    best: "Warto zostawić margines dat i łączyć kilka regionów, bo szczyt kwitnienia nie przypada wszędzie w tym samym momencie.",
    watch: "Prognozy kwitnienia przesuwają się wraz z pogodą, dlatego zbyt sztywna rezerwacja może minąć się z najlepszym momentem.",
  },
  {
    id: "tulipany",
    icon: "🌷",
    season: "kwiecień – maj",
    title: "Tulipany w Holandii",
    lead: "Amsterdam plus pola kwiatów, ogrody i jednodniowe wycieczki — idealny przykład wyjazdu, który ma sens właśnie w konkretnym sezonie.",
    best: "Kilka dni wystarczy, żeby połączyć miasto z kwiatowym krajobrazem poza centrum.",
    watch: "Pogoda i moment kwitnienia wpływają na to, jak wyglądają pola; weekendy bywają znacznie bardziej zatłoczone.",
  },
  {
    id: "fiordy",
    icon: "🏔️",
    season: "maj – wrzesień",
    title: "Norweskie fiordy i długie dni",
    lead: "Rejsy, trekking i trasy widokowe wtedy, gdy dzień jest długi, a większa część sezonowych dróg i atrakcji działa pełną parą.",
    best: "Najlepszy wyjazd to kombinacja lotu, samochodu lub kolei i minimum kilku dni poza jednym miastem.",
    watch: "Pogoda w górach zmienia się szybko, a część szlaków i dróg może być sezonowo niedostępna.",
  },
  {
    id: "safari",
    icon: "🦁",
    season: "czerwiec – październik",
    title: "Safari w Kenii i Tanzanii",
    lead: "Podróż budowana wokół przyrody: parków narodowych, pory roku, migracji zwierząt i warunków do obserwacji.",
    best: "Zamiast jednego resortu warto porównać regiony i zaplanować kilka etapów podróży.",
    watch: "Najbardziej pożądane terminy oznaczają też większy popyt, dlatego loty i noclegi warto obserwować z wyprzedzeniem.",
  },
  {
    id: "azory",
    icon: "🐋",
    season: "wiosna – jesień",
    title: "Wieloryby i ocean na Azorach",
    lead: "Archipelag dla osób, które chcą połączyć trekking, wulkany, ocean i rejsy obserwacyjne w jednej podróży.",
    best: "Daj sobie kilka dni na wyspie, żeby nie uzależniać całego wyjazdu od jednego rejsu.",
    watch: "Warunki na Atlantyku mogą przesunąć lub odwołać wypłynięcie, więc elastyczność jest częścią planu.",
  },
  {
    id: "nowa-zelandia",
    icon: "🥾",
    season: "listopad – marzec",
    title: "Road trip po Nowej Zelandii",
    lead: "Dłuższa wyprawa nastawiona na góry, jeziora, trekkingi i drogę samą w sobie — najlepiej wtedy, gdy na południowej półkuli trwa cieplejsza część roku.",
    best: "Warto planować etapami i nie próbować zobaczyć obu wysp w zbyt krótkim czasie.",
    watch: "Warunki różnią się między regionami i wysokościami, dlatego jeden opis pogody nie wystarcza dla całej trasy.",
  },
  {
    id: "jarmarki",
    icon: "🎄",
    season: "listopad – grudzień",
    title: "Jarmarki bożonarodzeniowe",
    lead: "Krótki wyjazd, w którym atrakcją jest sam sezon: światła, jedzenie, place miejskie i zimowa atmosfera.",
    best: "Wiedeń, Praga, Budapeszt czy Berlin świetnie nadają się na 2–3 noce z bezpośrednim lotem lub koleją.",
    watch: "Najbardziej popularne weekendy szybko drożeją — często lepiej polecieć w tygodniu lub na początku sezonu.",
  },
  {
    id: "egzotyka",
    icon: "🌴",
    season: "zima w Polsce",
    title: "Egzotyka w najlepszym sezonie",
    lead: "Zamiast wybierać tropiki wyłącznie po cenie, Tripownia patrzy na porę suchą i mokrą, temperaturę, wilgotność i charakter danego regionu.",
    best: "Dobieramy konkretny region do miesiąca — jedna reguła nie działa dla całej Azji, Afryki czy Karaibów.",
    watch: "Pora deszczowa nie zawsze oznacza całodniowy deszcz, ale może wpływać na morze, transfery, rejsy i dostępność części atrakcji.",
  },
];

export default function ExperiencesPage() {
  return (
    <main className="experience-expanded-page">
      <SiteHeader />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Podróże po przeżycia", url: "https://tripownia.pl/podroze-po-przezycia" },
      ]}/>

      <section className="experience-expanded-hero">
        <div className="shell">
          <div className="kicker">PODRÓŻE PO PRZEŻYCIA</div>
          <h1>Podróże, dla których liczy się właściwy moment.</h1>
          <p>
            Nie tylko „gdzie polecieć?”, ale też „kiedy warto tam być?”. Zbieramy zjawiska,
            sezony i doświadczenia, które potrafią zmienić zwykły wyjazd w coś, dla czego naprawdę warto wsiąść do samolotu.
          </p>
          <div className="experience-season-nav">
            <a href="#zorza">🌌 Zorza</a>
            <a href="#sakura">🌸 Sakura</a>
            <a href="#fiordy">🏔️ Fiordy</a>
            <a href="#safari">🦁 Safari</a>
            <a href="#jarmarki">🎄 Jarmarki</a>
            <a href="#egzotyka">🌴 Egzotyka</a>
          </div>
        </div>
      </section>

      <section className="section shell experience-planning-section">
        <div className="section-heading">
          <div>
            <div className="kicker">NIE TYLKO CENA</div>
            <h2>Co sprawdzamy, zanim powiemy „to jest dobry moment”?</h2>
            <p>W tej części Tripowni termin jest równie ważny jak kierunek.</p>
          </div>
        </div>
        <div className="experience-planning-grid">
          <article className="experience-planning-card"><span>🌦️</span><strong>Pogoda i sezon</strong><p>Temperatura, opady, długość dnia i różnice między regionami.</p></article>
          <article className="experience-planning-card"><span>🌌</span><strong>Szansa na zjawisko</strong><p>Zorza, kwitnienie czy migracje to okna sezonowe, a nie gwarancje.</p></article>
          <article className="experience-planning-card"><span>👥</span><strong>Tłok i ceny</strong><p>Najlepszy przyrodniczo termin nie zawsze jest najlepszy cenowo — pokazujemy kompromis.</p></article>
          <article className="experience-planning-card"><span>🧭</span><strong>Logistyka</strong><p>Lot, dojazd, dostępność szlaków, rejsów i atrakcji musi pasować do sezonu.</p></article>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <div className="kicker">KALENDARZ INSPIRACJI</div>
            <h2>Wybierz przeżycie, potem zbudujemy wyjazd.</h2>
          </div>
        </div>

        <div className="experience-expanded-grid">
          {experiences.map(item => (
            <article className="experience-expanded-card" id={item.id} key={item.id}>
              <div className="experience-expanded-card-top">
                <span>{item.icon}</span>
                <div><small>{item.season}</small><h2>{item.title}</h2></div>
              </div>
              <p className="experience-expanded-lead">{item.lead}</p>
              <div className="experience-expanded-meta">
                <div><small>NAJLEPIEJ</small><p>{item.best}</p></div>
                <div><small>UWAŻAJ NA</small><p>{item.watch}</p></div>
              </div>
              <div className="experience-expanded-actions">
                <Link href="/#wyszukiwarka">✈️ Szukaj wyjazdu</Link>
                <Link href="/atrakcje">🎟️ Atrakcje na miejscu</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell experience-final-cta">
        <div>
          <div className="kicker">MASZ KONKRETNE MARZENIE?</div>
          <h2>Zacznij od przeżycia. Tripownia pomoże dobrać kierunek i termin.</h2>
          <p>Możesz też wrócić do wyszukiwarki i samodzielnie ustawić lotnisko, kierunek, długość oraz budżet.</p>
        </div>
        <div className="experience-final-actions">
          <Link href="/#wyszukiwarka">Przejdź do wyszukiwarki →</Link>
          <Link href="/okazje">Zobacz dzisiejsze okazje</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
