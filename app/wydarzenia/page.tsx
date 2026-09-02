import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { formatKickoff, getSportsTrips, sportsClubs } from "@/lib/sportsEvents";

export const metadata: Metadata = {
  title: "Wyjazdy na mecze — Barcelona, Inter i więcej | Tripownia.pl",
  description: "Terminarze meczów połączone z lotami i noclegami. Tripownia automatycznie wyłapuje okazje na wyjazdy sportowe.",
  alternates: { canonical: "/wydarzenia" },
};

export const revalidate = 21600;

export default async function EventsPage() {
  const trips = await getSportsTrips();
  const live = Boolean(process.env.FOOTBALL_DATA_API_KEY);

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
            <p>
              Łączymy terminarz wydarzeń z lotami i noclegami. Tripownia pilnuje dat,
              wyłapuje mecze domowe i zamienia je w gotowy pomysł na wyjazd.
            </p>
            <div className="sales-quick-tags">
              <span>⚽ Barcelona</span>
              <span>⚫🔵 Inter</span>
              <span>⚪ Real</span>
              <span>🔴 Premier League</span>
            </div>
          </div>

          <aside className="sports-sync-card">
            <small>AUTOMATYCZNA SYNCHRONIZACJA</small>
            <strong>{live ? "Terminarze live" : "Tryb startowy"}</strong>
            <span>
              {live
                ? "Dane wydarzeń odświeżają się automatycznie co maksymalnie 6 godzin."
                : "Po dodaniu jednego klucza API moduł przełączy się na terminarze live."}
            </span>
            <b>{trips.length} wyjazdów do sprawdzenia</b>
          </aside>
        </div>
      </section>

      <section className="shell sports-section">
        <div className="section-heading">
          <div>
            <div className="kicker">NAJBLIŻSZE WYJAZDY</div>
            <h2>Wybierz mecz. Resztę wyjazdu złożymy od razu.</h2>
            <p>Mecz domowy + lot + nocleg + oficjalna strona biletowa klubu.</p>
          </div>
        </div>

        <div className="sports-event-grid">
          {trips.map(trip => {
            const club = sportsClubs.find(item => item.slug === trip.clubSlug);
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

                <div className="sports-event-actions">
                  <a href={trip.flightUrl} target="_blank" rel="sponsored noopener noreferrer">✈️ Loty</a>
                  <a href={trip.hotelUrl} target="_blank" rel="sponsored noopener noreferrer">🏨 Hotel</a>
                  <a href={trip.packageUrl} target="_blank" rel="sponsored noopener noreferrer">🧳 Lot + hotel</a>
                  <a href={trip.ticketUrl} target="_blank" rel="noopener noreferrer">🎟️ Bilety</a>
                </div>

                <div className="sports-event-cta">
                  <span>🔥 Pomysł Tripownii:</span>
                  <b>Przylot dzień wcześniej, mecz i 2–3 noce w {trip.city}.</b>
                </div>
              </article>
            );
          })}
        </div>
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
              <div key={club.slug}>
                <span>{club.emoji}</span>
                <strong>{club.displayName}</strong>
                <small>{club.city}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter/>
    </main>
  );
}
