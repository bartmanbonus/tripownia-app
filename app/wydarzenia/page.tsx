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
  title: "Wyjazdy na mecze piłkarskie — Barcelona, Inter i więcej | Tripownia.pl",
  description: "Wyjazdy na mecze piłkarskie: Barcelona, Inter, Real, Premier League i Liga Mistrzów. Terminarze połączone z lotami i noclegami.",
  alternates: { canonical: "/wydarzenia" },
};

export const revalidate = 21600;

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

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const trips = await getSportsTrips();
  const live = Boolean(process.env.FOOTBALL_DATA_API_KEY);

  const selectedFrom = one(params.from) || "WAWA";
  const selectedClub = one(params.club);
  const selectedCompetition = one(params.competition);
  const selectedMonth = one(params.month);
  const parsedNights = Number(one(params.nights) || "3");
  const selectedNights = [2, 3, 4].includes(parsedNights) ? parsedNights : 3;
  const parsedPeople = Number(one(params.people) || "2");
  const selectedPeople = [1, 2, 3, 4].includes(parsedPeople) ? parsedPeople : 2;

  const months: string[] = Array.from(new Set<string>(trips.map(trip => monthValue(trip.kickoff))));
  const filteredTrips = trips.filter(trip => {
    if (selectedClub && trip.clubSlug !== selectedClub) return false;
    if (selectedCompetition && trip.competitionCode !== selectedCompetition) return false;
    if (selectedMonth && monthValue(trip.kickoff) !== selectedMonth) return false;
    return true;
  });

  const activeDeparture = sportsDepartures.find(item => item.code === selectedFrom) || sportsDepartures[0];

  return (
    <main>
      <SiteHeader/>
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Mecze piłkarskie", url: "https://tripownia.pl/wydarzenia" },
      ]}/>

      <section className="sports-hero">
        <div className="shell sports-hero-inner">
          <div>
            <div className="kicker">LECIMY NA MECZ?</div>
            <h1>Wyjazdy na mecze piłkarskie. Mecz może być najlepszym powodem, żeby gdzieś polecieć.</h1>
            <p>
              Łączymy terminarz wydarzeń z lotami i noclegami. Tripownia pilnuje dat,
              wyłapuje mecze domowe i zamienia je w gotowy pomysł na wyjazd.
            </p>
            <div className="sales-quick-tags">
              <a href="/wydarzenia?club=fc-barcelona">⚽ Barcelona</a>
              <a href="/wydarzenia?club=inter-mediolan">⚫🔵 Inter</a>
              <a href="/wydarzenia?club=real-madryt">⚪ Real</a>
              <a href="/wydarzenia?competition=PL">🔴 Premier League</a>
            </div>
          </div>

          <aside className="sports-sync-card">
            <small>AUTOMATYCZNA SYNCHRONIZACJA</small>
            <strong>{live ? "Terminarze live" : "Tryb startowy"}</strong>
            <span>
              {live
                ? "Dane wydarzeń odświeżają się automatycznie co maksymalnie 6 godzin."
                : "Moduł korzysta z technicznego fallbacku do czasu poprawnego pobrania terminarzy live."}
            </span>
            <b>{filteredTrips.length} wyjazdów po filtrach</b>
          </aside>
        </div>
      </section>

      <section className="shell sports-section">
        <div className="section-heading">
          <div>
            <div className="kicker">NAJBLIŻSZE WYJAZDY</div>
            <h2>Wybierz mecz. Resztę wyjazdu składamy od razu.</h2>
            <p>
              Klikasz raz — eSky i Booking dostają już kierunek oraz daty. Domyślnie lecimy dzień przed meczem.
            </p>
          </div>
        </div>

        <form className="sports-filters" method="get">
          <label>
            <span>Skąd lecisz?</span>
            <select name="from" defaultValue={selectedFrom}>
              {sportsDepartures.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </label>

          <label>
            <span>Klub</span>
            <select name="club" defaultValue={selectedClub}>
              <option value="">Wszystkie kluby</option>
              {sportsClubs.map(club => <option key={club.slug} value={club.slug}>{club.displayName}</option>)}
            </select>
          </label>

          <label>
            <span>Rozgrywki</span>
            <select name="competition" defaultValue={selectedCompetition}>
              <option value="">Wszystkie ligi</option>
              {sportsCompetitions.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>

          <label>
            <span>Kiedy?</span>
            <select name="month" defaultValue={selectedMonth}>
              <option value="">Dowolny termin</option>
              {months.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}
            </select>
          </label>

          <label>
            <span>Długość wyjazdu</span>
            <select name="nights" defaultValue={String(selectedNights)}>
              <option value="2">2 noce</option>
              <option value="3">3 noce</option>
              <option value="4">4 noce</option>
            </select>
          </label>

          <label>
            <span>Ile osób?</span>
            <select name="people" defaultValue={String(selectedPeople)}>
              <option value="1">1 osoba</option>
              <option value="2">2 osoby</option>
              <option value="3">3 osoby</option>
              <option value="4">4 osoby</option>
            </select>
          </label>

          <div className="sports-filter-actions">
            <button type="submit">Pokaż mecze</button>
            <a href="/wydarzenia">Wyczyść</a>
          </div>
        </form>

        <div className="sports-filter-summary">
          <strong>✈️ {activeDeparture.label}</strong>
          <span>•</span>
          <span>przylot dzień przed meczem</span>
          <span>•</span>
          <span>{selectedNights} noce</span>
          <span>•</span>
          <span>{selectedPeople} {selectedPeople === 1 ? "osoba" : "osoby"}</span>
        </div>

        {filteredTrips.length ? (
          <div className="sports-event-grid">
            {filteredTrips.map(trip => {
              const club = sportsClubs.find(item => item.slug === trip.clubSlug);
              const links = buildSportsTripLinks(trip, selectedFrom, selectedNights, selectedPeople);
              return (
                <article className="sports-event-card" key={`${trip.clubSlug}-${trip.id}`}>
                  <div className="sports-event-top">
                    <span>{club?.emoji || "⚽"}</span>
                    <div>
                      <small>{trip.competition}</small>
                      <strong>{trip.club} – {trip.opponent}</strong>
                    </div>
                  </div>

                  <div className="sports-event-details">
                    <div><small>KIEDY</small><strong>{formatKickoff(trip.kickoff)}</strong></div>
                    <div><small>GDZIE</small><strong>{trip.venue || trip.city}</strong></div>
                    <div><small>WYJAZD</small><strong>{trip.city}, {trip.country}</strong></div>
                  </div>

                  <div className="sports-auto-plan">
                    <div><small>WYLOT</small><b>{links.departureDate}</b></div>
                    <div><small>POWRÓT</small><b>{links.returnDate}</b></div>
                    <div><small>TRASA</small><b>{activeDeparture.label} → {links.arrivalLabel}</b></div>
                  </div>

                  <div className="sports-event-actions">
                    <a href={links.flightUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">✈️ Loty</a>
                    <a href={links.hotelUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">🏨 Hotel</a>
                    <a href={links.packageUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">🧳 Lot + hotel</a>
                    <a href={links.ticketUrl} target="_blank" rel="noopener noreferrer">🎟️ Bilety</a>
                  </div>

                  <div className="sports-event-cta">
                    <span>🔥 Pomysł Tripownii:</span>
                    <b>
                      {activeDeparture.label} → {links.arrivalLabel}. Wylot {links.departureDate}, mecz {trip.kickoff.slice(0, 10)}, powrót {links.returnDate}. Wszystko w linkach ustawione automatycznie.
                    </b>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sports-empty-state">
            <strong>Nie ma meczów dla tego zestawu filtrów.</strong>
            <p>Zmień miesiąc, klub lub rozgrywki — nie wyłączamy całego modułu.</p>
            <a href="/wydarzenia">Pokaż wszystkie mecze</a>
          </div>
        )}
      </section>

      <section className="sports-clubs">
        <div className="shell">
          <div className="section-heading">
            <div>
              <div className="kicker">OBSERWOWANE KLUBY</div>
              <h2>Terminarze, które Tripownia śledzi automatycznie</h2>
            </div>
          </div>
          <div className="sports-club-grid">
            {sportsClubs.map(club => (
              <a href={`/wydarzenia?club=${club.slug}&from=${selectedFrom}&nights=${selectedNights}&people=${selectedPeople}`} key={club.slug}>
                <span>{club.emoji}</span>
                <strong>{club.displayName}</strong>
                <small>{club.city}</small>
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter/>
    </main>
  );
}
