import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

type Club = {
  slug: string;
  names: string[];
  displayName: string;
  city: string;
  country: string;
  airportCode: string;
  competitionCodes: string[];
  ticketUrl: string;
  emoji: string;
};

type Match = {
  id: number;
  utcDate: string;
  status: string;
  venue?: string | null;
  competition?: { name?: string; code?: string };
  homeTeam?: { name?: string; shortName?: string };
  awayTeam?: { name?: string; shortName?: string };
};

type Trip = {
  id: string;
  clubSlug: string;
  club: string;
  opponent: string;
  city: string;
  country: string;
  competition: string;
  kickoff: string;
  venue?: string | null;
  ticketUrl: string;
  flightUrl: string;
  hotelUrl: string;
  packageUrl: string;
};

const clubs: Club[] = [
  { slug:"fc-barcelona", names:["FC Barcelona","Barcelona"], displayName:"FC Barcelona", city:"Barcelona", country:"Hiszpania", airportCode:"BCN", competitionCodes:["PD","CL"], ticketUrl:"https://www.fcbarcelona.com/en/tickets/football", emoji:"🔵🔴" },
  { slug:"inter-mediolan", names:["FC Internazionale Milano","Inter Milan","Inter Milano","Internazionale"], displayName:"Inter Mediolan", city:"Mediolan", country:"Włochy", airportCode:"MIL", competitionCodes:["SA","CL"], ticketUrl:"https://www.inter.it/en/tickets", emoji:"⚫🔵" },
  { slug:"real-madryt", names:["Real Madrid CF","Real Madrid"], displayName:"Real Madryt", city:"Madryt", country:"Hiszpania", airportCode:"MAD", competitionCodes:["PD","CL"], ticketUrl:"https://www.realmadrid.com/en-US/tickets", emoji:"⚪" },
  { slug:"ac-milan", names:["AC Milan","Milan"], displayName:"AC Milan", city:"Mediolan", country:"Włochy", airportCode:"MIL", competitionCodes:["SA","CL"], ticketUrl:"https://www.acmilan.com/en/tickets", emoji:"🔴⚫" },
  { slug:"bayern-monachium", names:["FC Bayern München","Bayern Munich","Bayern München"], displayName:"Bayern Monachium", city:"Monachium", country:"Niemcy", airportCode:"MUC", competitionCodes:["BL1","CL"], ticketUrl:"https://fcbayern.com/en/tickets", emoji:"🔴⚪" },
  { slug:"arsenal", names:["Arsenal FC","Arsenal"], displayName:"Arsenal", city:"Londyn", country:"Wielka Brytania", airportCode:"LON", competitionCodes:["PL","CL"], ticketUrl:"https://www.arsenal.com/tickets", emoji:"🔴" },
  { slug:"liverpool", names:["Liverpool FC","Liverpool"], displayName:"Liverpool", city:"Liverpool", country:"Wielka Brytania", airportCode:"LPL", competitionCodes:["PL","CL"], ticketUrl:"https://www.liverpoolfc.com/tickets", emoji:"🔴" },
];

function normalize(value?: string | null) {
  return (value || "").trim().toLocaleLowerCase("pl");
}

function clubMatches(club: Club, team?: string | null) {
  const name = normalize(team);
  return club.names.some(alias => name === normalize(alias) || name.includes(normalize(alias)));
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function eskyFlights(city: string) {
  const url = new URL("https://www.esky.pl/tanie-loty/");
  url.searchParams.set("to", city);
  url.searchParams.set("partner_id", "TRIPOWNIAPL");
  return url.toString();
}

function eskyPackage() {
  const url = new URL("https://www2.esky.pl/lot+hotel/portfolio");
  url.searchParams.set("context", "pl-packages");
  url.searchParams.set("partner_id", "TRIPOWNIAPLPACKAGES");
  url.searchParams.set("sort[TotalPrice]", "asc");
  return url.toString();
}

function booking(city: string) {
  const url = new URL("https://www.booking.com/searchresults.pl.html");
  url.searchParams.set("ss", city);
  url.searchParams.set("aid", "818288");
  return url.toString();
}

async function getTrips(): Promise<Trip[]> {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) return [];

  const now = new Date();
  const dateFrom = ymd(now);
  const dateTo = ymd(addDays(now, 120));
  const codes = [...new Set(clubs.flatMap(c => c.competitionCodes))];

  const groups = await Promise.all(codes.map(async code => {
    try {
      const url = new URL(`https://api.football-data.org/v4/competitions/${code}/matches`);
      url.searchParams.set("dateFrom", dateFrom);
      url.searchParams.set("dateTo", dateTo);
      url.searchParams.set("status", "SCHEDULED");

      const response = await fetch(url, {
        headers: { "X-Auth-Token": token },
        next: { revalidate: 21600 },
      });

      if (!response.ok) return [] as Match[];
      const data = await response.json();
      return Array.isArray(data.matches) ? data.matches as Match[] : [];
    } catch {
      return [] as Match[];
    }
  }));

  const matches = groups.flat();
  const trips: Trip[] = [];

  for (const club of clubs) {
    for (const match of matches) {
      const home = match.homeTeam?.name || match.homeTeam?.shortName || "";
      const away = match.awayTeam?.name || match.awayTeam?.shortName || "";
      if (!clubMatches(club, home)) continue;

      trips.push({
        id: String(match.id),
        clubSlug: club.slug,
        club: club.displayName,
        opponent: away,
        city: club.city,
        country: club.country,
        competition: match.competition?.name || match.competition?.code || "Mecz",
        kickoff: match.utcDate,
        venue: match.venue,
        ticketUrl: club.ticketUrl,
        flightUrl: eskyFlights(club.airportCode),
        hotelUrl: booking(club.city),
        packageUrl: eskyPackage(),
      });
    }
  }

  const unique = new Map<string, Trip>();
  for (const trip of trips) {
    unique.set(`${trip.clubSlug}|${trip.kickoff}|${normalize(trip.opponent)}`, trip);
  }

  return [...unique.values()]
    .sort((a,b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, 40);
}

function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(iso));
}


export const metadata: Metadata = {
  title: "Wyjazdy na mecze — Barcelona, Inter i więcej | Tripownia.pl",
  description: "Terminarze meczów połączone z lotami i noclegami. Tripownia automatycznie wyłapuje okazje na wyjazdy sportowe.",
  alternates: { canonical: "/wydarzenia" },
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const trips = await getTrips();
  const configured = Boolean(process.env.FOOTBALL_DATA_API_KEY);

  return (
    <main>
      <SiteHeader/>
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Wydarzenia", url: "https://tripownia.pl/wydarzenia" },
      ]}/>

      <section className="sports-hero">
        <div className="shell sports-hero-inner">
          <div>
            <div className="kicker">LECIMY NA MECZ?</div>
            <h1>Mecz może być najlepszym powodem, żeby gdzieś polecieć.</h1>
            <p>Tripownia synchronizuje terminarze, łapie mecze domowe i od razu dokłada lot, nocleg oraz oficjalne bilety.</p>
            <div className="sales-quick-tags">
              <span>⚽ Barcelona</span><span>⚫🔵 Inter</span><span>⚪ Real</span><span>🔴 Premier League</span>
            </div>
          </div>

          <aside className="sports-sync-card">
            <small>AUTOMATYCZNA SYNCHRONIZACJA</small>
            <strong>{configured ? "Terminarze live" : "Wymaga klucza API"}</strong>
            <span>{configured ? "Terminarze są pobierane automatycznie i cache'owane przez 6 godzin." : "Dodaj FOOTBALL_DATA_API_KEY w Vercel → Environment Variables."}</span>
            <b>{trips.length} wyjazdów do sprawdzenia</b>
          </aside>
        </div>
      </section>

      <section className="shell sports-section">
        <div className="section-heading"><div><div className="kicker">NAJBLIŻSZE WYJAZDY</div><h2>Wybierz mecz. Resztę wyjazdu składamy od razu.</h2></div></div>

        {!configured && (
          <div className="admin-alert"><strong>Brak FOOTBALL_DATA_API_KEY.</strong><span>Po dodaniu klucza pojawią się automatycznie zsynchronizowane mecze.</span></div>
        )}

        {configured && trips.length === 0 && (
          <div className="admin-alert"><strong>Brak meczów do pokazania.</strong><span>API nie zwróciło teraz zaplanowanych meczów domowych dla obserwowanych klubów w najbliższych 120 dniach.</span></div>
        )}

        <div className="sports-event-grid">
          {trips.map(trip => {
            const club = clubs.find(c => c.slug === trip.clubSlug);
            return (
              <article className="sports-event-card" key={`${trip.clubSlug}-${trip.id}`}>
                <div className="sports-event-top">
                  <span>{club?.emoji || "⚽"}</span>
                  <div><small>{trip.competition}</small><strong>{trip.club} – {trip.opponent}</strong></div>
                </div>
                <div className="sports-event-details">
                  <div><small>KIEDY</small><strong>{formatKickoff(trip.kickoff)}</strong></div>
                  <div><small>GDZIE</small><strong>{trip.venue || trip.city}</strong></div>
                  <div><small>WYJAZD</small><strong>{trip.city}, {trip.country}</strong></div>
                </div>
                <div className="sports-event-actions">
                  <a href={trip.flightUrl} target="_blank" rel="sponsored noopener noreferrer">✈️ Loty</a>
                  <a href={trip.hotelUrl} target="_blank" rel="sponsored noopener noreferrer">🏨 Hotel</a>
                  <a href={trip.packageUrl} target="_blank" rel="sponsored noopener noreferrer">🧳 Lot + hotel</a>
                  <a href={trip.ticketUrl} target="_blank" rel="noopener noreferrer">🎟️ Bilety</a>
                </div>
                <div className="sports-event-cta"><span>🔥 Pomysł Tripownii:</span><b>Przylot dzień wcześniej, mecz i 2–3 noce w {trip.city}.</b></div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sports-clubs">
        <div className="shell">
          <div className="section-heading"><div><div className="kicker">OBSERWOWANE KLUBY</div><h2>Tripownia pilnuje ich terminarzy</h2></div></div>
          <div className="sports-club-grid">
            {clubs.map(club => <div key={club.slug}><span>{club.emoji}</span><strong>{club.displayName}</strong><small>{club.city}</small></div>)}
          </div>
        </div>
      </section>

      <SiteFooter/>
    </main>
  );
}
