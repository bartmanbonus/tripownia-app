import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Jarmarki bożonarodzeniowe 2026 — terminy i wyjazdy | Tripownia.pl",
  description: "Wiedeń, Praga, Drezno, Norymberga, Berlin, Budapeszt i Salzburg — terminy jarmarków 2026 i gotowe pomysły na wyjazd.",
  alternates: { canonical: "/jarmarki-bozonarodzeniowe" },
};

export const dynamic = "force-dynamic";

const PUBLISH_UNTIL = new Date("2027-01-07T22:59:59Z").getTime();

const ideas = [
  {
    city: "Wiedeń",
    flag: "🇦🇹",
    market: "13 listopada – 26 grudnia 2026",
    note: "Klasyczny wybór na pierwszy jarmarkowy city break.",
    sample: ["2026-11-20", "2026-11-23"],
    airport: "VIE",
    see: "Rathausplatz · Schönbrunn · Belweder",
    accent: "KLASYK",
  },
  {
    city: "Praga",
    flag: "🇨🇿",
    market: "28 listopada 2026 – 6 stycznia 2027",
    note: "Dobry wybór także między świętami a Nowym Rokiem.",
    sample: ["2026-12-04", "2026-12-07"],
    airport: "PRG",
    see: "Rynek Staromiejski · Most Karola · Zamek",
    accent: "DO STYCZNIA",
  },
  {
    city: "Drezno",
    flag: "🇩🇪",
    market: "25 listopada – 24 grudnia 2026",
    note: "Striezelmarkt — jeden z najbardziej tradycyjnych jarmarków w Niemczech.",
    sample: ["2026-12-04", "2026-12-07"],
    airport: "DRS",
    see: "Altmarkt · Frauenkirche · Stare Miasto",
    accent: "TRADYCJA",
  },
  {
    city: "Norymberga",
    flag: "🇩🇪",
    market: "27 listopada – 24 grudnia 2026",
    note: "Christkindlesmarkt i bardzo mocny świąteczny klimat starego miasta.",
    sample: ["2026-12-03", "2026-12-06"],
    airport: "NUE",
    see: "Hauptmarkt · Frauenkirche · Kaiserburg",
    accent: "TOP NIEMCY",
  },
  {
    city: "Berlin",
    flag: "🇩🇪",
    market: "23 listopada – 31 grudnia 2026",
    note: "Duży wybór jarmarków — od klasycznych po bardziej nowoczesne.",
    sample: ["2026-11-27", "2026-11-30"],
    airport: "BER",
    see: "Gendarmenmarkt · Charlottenburg · Mitte",
    accent: "DUŻY WYBÓR",
  },
  {
    city: "Budapeszt",
    flag: "🇭🇺",
    market: "połowa listopada – 31 grudnia 2026",
    note: "Jarmarki najlepiej połączyć z termami i wieczornym Dunajem.",
    sample: ["2026-12-11", "2026-12-14"],
    airport: "BUD",
    see: "Bazylika św. Stefana · Vörösmarty tér · termy",
    accent: "JARMARK + TERMY",
  },
  {
    city: "Salzburg",
    flag: "🇦🇹",
    market: "19 listopada 2026 – 1 stycznia 2027",
    note: "Bardziej kameralnie niż w Wiedniu, z alpejskim charakterem.",
    sample: ["2026-12-04", "2026-12-07"],
    airport: "SZG",
    see: "Domplatz · Residenzplatz · Mirabell · Hellbrunn",
    accent: "ALPEJSKI KLIMAT",
  },
];

function flightSearch(airport: string, sample: string[]) {
  const u = new URL("https://www.kiwi.com/deep");
  u.searchParams.set("from", "WAW");
  u.searchParams.set("to", airport);
  u.searchParams.set("departure", sample[0]);
  u.searchParams.set("return", sample[1]);
  u.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(u.toString());
}

function gyg(city: string) {
  return partners.getyourguide.buildUrl(
    `https://www.getyourguide.pl/s/?q=${encodeURIComponent(city + " Christmas market")}`,
  );
}

export default function Page() {
  if (Date.now() > PUBLISH_UNTIL) notFound();

  return (
    <main>
      <SiteHeader />
      <section className="seasonal-hero shell market-hero-compact">
        <div className="kicker">SEZON TERAZ · JARMARKI 2026</div>
        <h1>Jarmarki, na które naprawdę warto polecieć.</h1>
        <p>
          Jedno miasto = jedno konkretne okno z terminem, planem i przejściem do wyjazdu. Bez powtarzania tych samych danych dwa razy.
        </p>
      </section>

      <section className="section shell market-section-compact">
        <div className="market-count-strip">
          <strong>{ideas.length} kierunków</strong>
          <span>pełne okresy jarmarków · krótkie city breaki · aktualizacja sezonowa</span>
        </div>

        <div className="market-compact-grid">
          {ideas.map((idea) => (
            <article className="market-compact-card" key={idea.city}>
              <div className="market-compact-head">
                <span className="market-flag" aria-hidden="true">{idea.flag}</span>
                <div>
                  <small>{idea.accent}</small>
                  <h2>{idea.city}</h2>
                </div>
              </div>

              <div className="market-date-main">
                <small>OKRES JARMARKU</small>
                <strong>{idea.market}</strong>
              </div>

              <p className="market-note">{idea.note}</p>
              <p className="market-see"><b>Połącz z:</b> {idea.see}</p>

              <div className="market-compact-actions">
                <a href={flightSearch(idea.airport, idea.sample)} target="_blank" rel="sponsored noopener noreferrer">
                  Sprawdź wyjazd →
                </a>
                <a href={gyg(idea.city)} target="_blank" rel="sponsored noopener noreferrer">
                  Atrakcje
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="seasonal-expiry-note">
          Sekcja jest sezonowa i automatycznie znika z publikacji po 7 stycznia 2027.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
