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
  sportsMatchKey,
} from "@/lib/sportsEvents";
import styles from "./events.module.css";

export const metadata: Metadata = {
  title: "Wyjazdy na mecze piłkarskie — terminarze i gotowe wyjazdy",
  description: "Mecze w Europie połączone z planem wyjazdu: termin, miasto, lot, nocleg i oficjalne bilety. Filtruj klub, ligę, miesiąc i lotnisko wylotu.",
  alternates: { canonical: "/wydarzenia" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Wyjazdy na mecze piłkarskie — terminarze i gotowe wyjazdy",
    description: "Filtruj mecze po klubie, lidze i terminie, a potem ułóż cały wyjazd z lotem i noclegiem.",
    url: "/wydarzenia",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wyjazdy na mecze piłkarskie | Tripownia",
    description: "Filtruj mecze po klubie, lidze i terminie, a potem ułóż cały wyjazd.",
    images: ["/opengraph-image"],
  },
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
    ? <span className={styles.crest}><img src={src} alt={"Herb " + name} loading="lazy" /></span>
    : <span className={[styles.crest, styles.crestFallback].join(" ")} aria-label={"Herb " + name}>{initials(name)}</span>;
}

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const trips = await getSportsTrips(365);

  const selectedFrom = one(params.from) || "WAWA";
  const selectedClub = one(params.club);
  const selectedCompetition = one(params.competition);
  const selectedMonth = one(params.month);
  const showAll = one(params.all) === "1";
  const parsedNights = Number(one(params.nights) || "3");
  const selectedNights = [2, 3, 4].includes(parsedNights) ? parsedNights : 3;
  const parsedPeople = Number(one(params.people) || "2");
  const selectedPeople = [1, 2, 3, 4].includes(parsedPeople) ? parsedPeople : 2;

  const months = Array.from(new Set(trips.map(trip => monthValue(trip.kickoff))));
  const filteredTripsRaw = trips.filter(trip => {
    if (selectedClub && trip.clubSlug !== selectedClub) return false;
    if (selectedCompetition && trip.competitionCode !== selectedCompetition) return false;
    if (selectedMonth && monthValue(trip.kickoff) !== selectedMonth) return false;
    return true;
  });

  const filteredTrips = Array.from(
    filteredTripsRaw.reduce((map, trip) => {
      const key = sportsMatchKey(trip);
      if (!map.has(key)) map.set(key, trip);
      return map;
    }, new Map<string, (typeof filteredTripsRaw)[number]>()).values()
  );

  const visibleTrips = showAll ? filteredTrips : filteredTrips.slice(0, 48);
  const activeDeparture = sportsDepartures.find(item => item.code === selectedFrom) || sportsDepartures[0];

  const moreParams = new URLSearchParams();
  if (selectedFrom) moreParams.set("from", selectedFrom);
  if (selectedClub) moreParams.set("club", selectedClub);
  if (selectedCompetition) moreParams.set("competition", selectedCompetition);
  if (selectedMonth) moreParams.set("month", selectedMonth);
  moreParams.set("nights", String(selectedNights));
  moreParams.set("people", String(selectedPeople));
  moreParams.set("all", "1");

  return (
    <main className={styles.page}>
      <SiteHeader/>
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Mecze piłkarskie", url: "https://tripownia.pl/wydarzenia" },
      ]}/>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <div className={styles.kicker}>WEEKEND Z MECZEM</div>
            <h1>Najpierw wybierz mecz. Potem ułóż cały wyjazd.</h1>
            <p>Filtruj po klubie, lidze i miesiącu. Tripownia ustawi sensowny termin pobytu, a potem przejdziesz do lotu, noclegu i oficjalnych biletów.</p>
            <div className={styles.quick}>
              <a href="/wydarzenia?club=inter-mediolan">Inter</a>
              <a href="/wydarzenia?club=fc-barcelona">Barcelona</a>
              <a href="/wydarzenia?club=real-madryt">Real Madryt</a>
              <a href="/wydarzenia?competition=PL">Premier League</a>
              <a href="/wydarzenia?competition=CL">Liga Mistrzów</a>
            </div>
          </div>
          <div className={styles.counter}>
            <small>NA RADARZE</small>
            <strong>{filteredTrips.length}</strong>
            <span>{filteredTrips.length === 1 ? "mecz" : "meczów"} do zaplanowania</span>
            <p>Na starcie pokazujemy najbliższe 48. Użyj filtrów, żeby szybciej dojść do konkretnego wyjazdu.</p>
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.filterCard}>
          <div className={styles.filterHead}>
            <div>
              <div className={styles.kicker}>FILTRY WYJAZDU</div>
              <h2>Znajdź mecz pod swój termin</h2>
              <p>Nie musisz przewijać całego terminarza. Wybierz skąd lecisz, klub lub ligę i miesiąc.</p>
            </div>
          </div>
          <form className={styles.filters} method="get">
            <label><span>Skąd lecisz?</span><select name="from" defaultValue={selectedFrom}>{sportsDepartures.map(item => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
            <label><span>Klub</span><select name="club" defaultValue={selectedClub}><option value="">Wszystkie kluby</option>{sportsClubs.map(club => <option key={club.slug} value={club.slug}>{club.displayName}</option>)}</select></label>
            <label><span>Rozgrywki</span><select name="competition" defaultValue={selectedCompetition}><option value="">Wszystkie rozgrywki</option>{sportsCompetitions.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
            <label><span>Kiedy?</span><select name="month" defaultValue={selectedMonth}><option value="">Dowolny termin</option>{months.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label>
            <label><span>Długość</span><select name="nights" defaultValue={String(selectedNights)}><option value="2">2 noce</option><option value="3">3 noce</option><option value="4">4 noce</option></select></label>
            <label><span>Osoby</span><select name="people" defaultValue={String(selectedPeople)}><option value="1">1 osoba</option><option value="2">2 osoby</option><option value="3">3 osoby</option><option value="4">4 osoby</option></select></label>
            <div className={styles.actions}><button type="submit">Pokaż mecze</button><a href="/wydarzenia">Wyczyść filtry</a></div>
          </form>
          <div className={styles.summary}>
            <span>✈️ {activeDeparture.label}</span>
            <span>przylot dzień przed meczem</span>
            <span>{selectedNights} noce</span>
            <span>{selectedPeople} os.</span>
          </div>
        </div>

        <div className={styles.resultsHead}>
          <div><div className={styles.kicker}>NAJBLIŻSZE MECZE</div><h2>{selectedClub || selectedCompetition || selectedMonth ? "Wyniki dla Twoich filtrów" : "Wybierz mecz i jedź"}</h2><p>Godziny spotkań mogą ulec zmianie — przed zakupem lotu potwierdź finalny termin organizatora rozgrywek.</p></div>
        </div>

        {visibleTrips.length ? (
          <>
            <div className={styles.grid}>
              {visibleTrips.map(trip => {
                const links = buildSportsTripLinks(trip, selectedFrom, selectedNights, selectedPeople);
                return (
                  <article className={styles.card} key={trip.clubSlug + "-" + trip.id}>
                    <div className={styles.cardTop}>
                      <span className={styles.pill}>{trip.competition}</span>
                      <span className={[styles.pill, trip.isHome ? styles.home : styles.away].join(" ")}>{trip.isHome ? "DOM" : "WYJAZD"}</span>
                    </div>
                    <div className={styles.match}>
                      <div className={styles.team}><TeamCrest src={trip.homeCrest} name={trip.homeTeam}/><strong>{trip.homeTeam}</strong></div>
                      <div className={styles.vs}><strong>vs</strong><small>{formatKickoff(trip.kickoff)}</small></div>
                      <div className={styles.team}><TeamCrest src={trip.awayCrest} name={trip.awayTeam}/><strong>{trip.awayTeam}</strong></div>
                    </div>
                    <div className={styles.meta}><span>📍 {trip.venue || trip.city}</span><span>🌍 {trip.city}, {trip.country}</span></div>
                    <div className={styles.trip}><strong>{activeDeparture.label} → {trip.city}</strong><span>{links.departureDate} – {links.returnDate} · {selectedNights} noce · {selectedPeople} os.</span></div>
                    <div className={styles.cardActions}>
                      <a className={styles.primary} href={"/dodaj-podroz?source=sport&city=" + encodeURIComponent(trip.city) + "&country=" + encodeURIComponent(trip.country) + "&start=" + links.departureDate + "&end=" + links.returnDate + "&departure=" + encodeURIComponent(activeDeparture.label) + "&match=" + encodeURIComponent(trip.homeTeam + " vs " + trip.awayTeam) + "&venue=" + encodeURIComponent(trip.venue || trip.city) + "&ticket=" + encodeURIComponent(links.ticketUrl)}>Ułóż cały wyjazd →</a>
                      <a href={links.flightUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">Sprawdź lot</a>
                      <a href={links.hotelUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">Znajdź nocleg</a>
                      <a href={links.ticketUrl} target="_blank" rel="noopener noreferrer">Oficjalne bilety</a>
                    </div>
                  </article>
                );
              })}
            </div>
            {!showAll && filteredTrips.length > visibleTrips.length && <div className={styles.more}><a href={"/wydarzenia?" + moreParams.toString()}>Pokaż wszystkie {filteredTrips.length} mecze</a></div>}
          </>
        ) : (
          <div className={styles.empty}><strong>Nie ma meczów dla tego zestawu filtrów.</strong><p>Zmień miesiąc, klub lub rozgrywki.</p><a href="/wydarzenia">Pokaż wszystkie mecze</a></div>
        )}
      </section>

      <section className={styles.clubs}>
        <div className={styles.shell}>
          <div className={styles.kicker}>KLUBY NA RADARZE</div>
          <h2>Wybierz klub i zobacz cały dostępny terminarz.</h2>
          <div className={styles.clubGrid}>
            {sportsClubs.map(club => <a href={"/wydarzenia?club=" + club.slug + "&from=" + selectedFrom + "&nights=" + selectedNights + "&people=" + selectedPeople} key={club.slug}><span>{club.emoji}</span><strong>{club.displayName}</strong><small>{club.city}</small></a>)}
          </div>
        </div>
      </section>

      <SiteFooter/>
    </main>
  );
}
