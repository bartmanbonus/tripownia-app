import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import {
  buildSportsTripLinks,
  formatKickoff,
  getSportsTrips,
  sportsClubs,
  sportsDepartures,
} from "@/lib/sportsEvents";

export const metadata: Metadata = {
  title: "Wyjazdy na mecze piłkarskie — terminarze i gotowe wyjazdy | Tripownia.pl",
  description: "Najciekawsze mecze w Europie połączone z gotowym planem wyjazdu: termin, miasto, lot, nocleg i oficjalne bilety.",
  alternates: { canonical: "/wydarzenia" },
};

export const dynamic = "force-dynamic";

const sportsCompetitions = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "CL", name: "Liga Mistrzów" },
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function monthValue(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function TeamCrest({ src, name }: { src?: string | null; name: string }) {
  return src
    ? <span className="team-crest"><img src={src} alt={`Herb ${name}`} loading="lazy" /></span>
    : <span className="team-crest team-crest-fallback" aria-label={`Herb ${name}`}>{initials(name)}</span>;
}

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const trips = await getSportsTrips(365);

  const selectedFrom = one(params.from) || "WAWA";
  const selectedClub = one(params.club);
  const selectedCompetition = one(params.competition);
  const selectedMonth = one(params.month);
  const parsedNights = Number(one(params.nights) || "3");
  const selectedNights = [2, 3, 4].includes(parsedNights) ? parsedNights : 3;
  const parsedPeople = Number(one(params.people) || "2");
  const selectedPeople = [1, 2, 3, 4].includes(parsedPeople) ? parsedPeople : 2;

  const months = Array.from(new Set(trips.map(trip => monthValue(trip.kickoff))));
  const filteredTrips = trips.filter(trip => {
    if (selectedClub && trip.clubSlug !== selectedClub) return false;
    if (selectedCompetition && trip.competitionCode !== selectedCompetition) return false;
    if (selectedMonth && monthValue(trip.kickoff) !== selectedMonth) return false;
    return true;
  });

  const activeDeparture = sportsDepartures.find(item => item.code === selectedFrom) || sportsDepartures[0];

  return (
    <main className="sports-page-premium">
      <SiteHeader/>
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Mecze piłkarskie", url: "https://tripownia.pl/wydarzenia" },
      ]}/>

      <section className="sports-hero sports-hero-premium">
        <div className="shell sports-hero-inner">
          <div className="sports-hero-copy">
            <div className="kicker">WEEKEND Z MECZEM</div>
            <h1>Mecz jest pretekstem. My układamy z niego cały wyjazd.</h1>
            <p>Śledzimy terminarze, pilnujemy zmian godzin i od razu podpowiadamy sensowny termin przelotu oraz nocleg.</p>
            <div className="sales-quick-tags">
              <a href="/wydarzenia?club=inter-mediolan">Inter</a>
              <a href="/wydarzenia?club=fc-barcelona">Barcelona</a>
              <a href="/wydarzenia?club=real-madryt">Real Madryt</a>
              <a href="/wydarzenia?competition=PL">Premier League</a>
            </div>
          </div>
          <div className="sports-hero-counter">
            <small>NA RADARZE</small>
            <strong>{filteredTrips.length}</strong>
            <span>{filteredTrips.length === 1 ? "mecz" : "meczów"} do zaplanowania</span>
            <p>Terminarze sprawdzamy automatycznie i uzupełniamy, gdy pojawiają się nowe daty.</p>
          </div>
        </div>
      </section>

      <section className="shell sports-section sports-section-premium">
        <form className="sports-filters sports-filters-premium" method="get">
          <label><span>Skąd lecisz?</span><select name="from" defaultValue={selectedFrom}>{sportsDepartures.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
          <label><span>Klub</span><select name="club" defaultValue={selectedClub}><option value="">Wszystkie kluby</option>{sportsClubs.map(club => <option key={club.slug} value={club.slug}>{club.displayName}</option>)}</select></label>
          <label><span>Rozgrywki</span><select name="competition" defaultValue={selectedCompetition}><option value="">Wszystkie rozgrywki</option>{sportsCompetitions.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
          <label><span>Kiedy?</span><select name="month" defaultValue={selectedMonth}><option value="">Dowolny termin</option>{months.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label>
          <label><span>Długość</span><select name="nights" defaultValue={String(selectedNights)}><option value="2">2 noce</option><option value="3">3 noce</option><option value="4">4 noce</option></select></label>
          <label><span>Osoby</span><select name="people" defaultValue={String(selectedPeople)}><option value="1">1 osoba</option><option value="2">2 osoby</option><option value="3">3 osoby</option><option value="4">4 osoby</option></select></label>
          <div className="sports-filter-actions"><button type="submit">Pokaż mecze</button><a href="/wydarzenia">Wyczyść</a></div>
        </form>

        <div className="sports-filter-summary sports-filter-summary-premium">
          <span>✈️ {activeDeparture.label}</span><span>•</span><span>przylot dzień przed meczem</span><span>•</span><span>{selectedNights} noce</span><span>•</span><span>{selectedPeople} os.</span>
        </div>

        {filteredTrips.length ? (
          <div className="sports-event-grid sports-event-grid-premium">
            {filteredTrips.map(trip => {
              const links = buildSportsTripLinks(trip, selectedFrom, selectedNights, selectedPeople);
              return (
                <article className="sports-event-card sports-event-card-premium" key={`${trip.clubSlug}-${trip.id}`}>
                  <div className="sports-card-headline">
                    <span className="sports-competition-pill">{trip.competition}</span>
                    <span className={`sports-homeaway-pill ${trip.isHome ? "is-home" : "is-away"}`}>{trip.isHome ? "DOM" : "WYJAZD"}</span>
                  </div>

                  <div className="sports-matchup">
                    <div className="sports-team"><TeamCrest src={trip.homeCrest} name={trip.homeTeam}/><strong>{trip.homeTeam}</strong></div>
                    <div className="sports-vs"><span>vs</span><small>{formatKickoff(trip.kickoff)}</small></div>
                    <div className="sports-team sports-team-away"><TeamCrest src={trip.awayCrest} name={trip.awayTeam}/><strong>{trip.awayTeam}</strong></div>
                  </div>

                  <div className="sports-match-meta">
                    <span>📍 {trip.venue || trip.city}</span>
                    <span>🌍 {trip.city}, {trip.country}</span>
                  </div>

                  <div className="sports-trip-line sports-trip-line-premium">
                    <strong>{activeDeparture.label} → {trip.city}</strong>
                    <span>{links.departureDate} – {links.returnDate} · {selectedNights} noce · {selectedPeople} os.</span>
                  </div>

                  <div className="sports-premium-actions">
                    <a className="sports-cta-primary" href={links.flightUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">Zaplanuj lot <span>→</span></a>
                    <a className="sports-cta-secondary" href={links.hotelUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">Znajdź nocleg</a>
                    <a className="sports-cta-ticket" href={links.ticketUrl} target="_blank" rel="noopener noreferrer">Oficjalne bilety</a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sports-empty-state"><strong>Nie ma meczów dla tego zestawu filtrów.</strong><p>Zmień miesiąc, klub lub rozgrywki.</p><a href="/wydarzenia">Pokaż wszystkie mecze</a></div>
        )}
      </section>

      <section className="sports-clubs sports-clubs-premium">
        <div className="shell">
          <div className="section-heading"><div><div className="kicker">KLUBY NA RADARZE</div><h2>Wybierz klub i zobacz cały dostępny terminarz.</h2></div></div>
          <div className="sports-club-grid">
            {sportsClubs.map(club => <a href={`/wydarzenia?club=${club.slug}&from=${selectedFrom}&nights=${selectedNights}&people=${selectedPeople}`} key={club.slug}><span>{club.emoji}</span><strong>{club.displayName}</strong><small>{club.city}</small></a>)}
          </div>
        </div>
      </section>

      <SiteFooter/>
    </main>
  );
}
