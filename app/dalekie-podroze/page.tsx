import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { partners, buildEskyFlightsUrl } from "@/lib/partners";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Dalekie podróże — Wietnam, Pekin, Nowy Jork, Japonia i więcej | Tripownia.pl",
  description: "Pomysły na dalsze podróże z Polski: Wietnam, Pekin, Nowy Jork, Japonia, Tajlandia, Bali, Singapur, RPA, Australia, Malediwy i Meksyk. Loty i hotele z gotowym kierunkiem.",
  alternates: { canonical: "/dalekie-podroze" },
  openGraph: {
    title: "Dalekie podróże | Tripownia.pl",
    description: "Kierunki na większą podróż — z podpowiedzią, ile dni warto mieć i kiedy najlepiej lecieć.",
    url: "https://tripownia.pl/dalekie-podroze",
    type: "website",
  },
};

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
  attractionQuery: string;
};

const trips: LongTrip[] = [
  { id:"wietnam", flag:"🇻🇳", region:"AZJA", title:"Wietnam", airport:"HAN", bookingCity:"Hanoi", duration:12, best:"listopad – kwiecień*", ideal:"10–16 dni", lead:"Hanoi, Ha Long, środkowy Wietnam i południe kraju. To kierunek, który najlepiej smakuje etapami.", highlights:"Hanoi · Ha Long · Hoi An · Da Nang · Ho Chi Minh", attractionQuery:"Hanoi" },
  { id:"pekin", flag:"🇨🇳", region:"CHINY", title:"Pekin", airport:"PEK", bookingCity:"Beijing", duration:7, best:"wiosna i jesień", ideal:"5–8 dni", lead:"Wielki Mur, Zakazane Miasto, hutongi i metropolia, która daje zupełnie inną skalę miejskiej podróży.", highlights:"Wielki Mur · Zakazane Miasto · Świątynia Nieba · hutongi", attractionQuery:"Pekin" },
  { id:"nowy-jork", flag:"🇺🇸", region:"USA", title:"Nowy Jork", airport:"JFK", bookingCity:"New York", duration:7, best:"kwiecień – czerwiec / wrzesień – listopad", ideal:"6–9 dni", lead:"Manhattan to dopiero początek. Przy tygodniu jest czas na Brooklyn, muzea, punkty widokowe i spacer bez gonienia.", highlights:"Manhattan · Brooklyn · Central Park · muzea · rooftop views", attractionQuery:"Nowy Jork" },
  { id:"japonia", flag:"🇯🇵", region:"JAPONIA", title:"Japonia — Tokio i Kioto", airport:"NRT", bookingCity:"Tokyo", duration:12, best:"marzec – maj / październik – listopad", ideal:"10–14 dni", lead:"Tokio, Kioto i szybka kolej między regionami. Jeśli lecieć tak daleko, warto zobaczyć więcej niż jedno miasto.", highlights:"Tokio · Kioto · Osaka · Fuji · shinkansen", attractionQuery:"Tokio" },
  { id:"tajlandia", flag:"🇹🇭", region:"TAJLANDIA", title:"Tajlandia — Bangkok i wyspy", airport:"BKK", bookingCity:"Bangkok", duration:12, best:"listopad – marzec*", ideal:"10–14 dni", lead:"Kilka dni w Bangkoku, potem południe albo wyspy. Klasyk, ale nadal jeden z najlepszych pierwszych kierunków w Azji.", highlights:"Bangkok · Phuket / Krabi · street food · świątynie · plaże", attractionQuery:"Bangkok" },
  { id:"bali", flag:"🇮🇩", region:"INDONEZJA", title:"Bali", airport:"DPS", bookingCity:"Bali", duration:12, best:"maj – październik", ideal:"10–14 dni", lead:"Nie zamykamy Bali w jednym resorcie: południe, Ubud i kilka dni bliżej natury dają dużo ciekawszą podróż.", highlights:"Ubud · świątynie · tarasy ryżowe · ocean · Nusa", attractionQuery:"Bali" },
  { id:"singapur", flag:"🇸🇬", region:"SINGAPUR", title:"Singapur", airport:"SIN", bookingCity:"Singapore", duration:5, best:"cały rok", ideal:"4–6 dni", lead:"Świetny samodzielnie, ale jeszcze lepszy jako stopover przed dalszą Azją. Bardzo łatwy logistycznie.", highlights:"Marina Bay · Gardens by the Bay · hawker centres · Sentosa", attractionQuery:"Singapur" },
  { id:"seul", flag:"🇰🇷", region:"KOREA", title:"Seul", airport:"ICN", bookingCity:"Seoul", duration:8, best:"kwiecień – maj / wrzesień – październik", ideal:"7–10 dni", lead:"Nowoczesna metropolia, pałace, dzielnice pełne jedzenia i dobra baza do pierwszej podróży po Korei.", highlights:"Seul · pałace · Hongdae · street food · DMZ", attractionQuery:"Seul" },
  { id:"kapsztad", flag:"🇿🇦", region:"RPA", title:"Kapsztad", airport:"CPT", bookingCity:"Cape Town", duration:10, best:"listopad – marzec", ideal:"8–12 dni", lead:"Góry, ocean, winnice i trasy samochodowe. Kierunek, który bardzo dobrze łączy miasto z naturą.", highlights:"Table Mountain · Cape Point · winnice · ocean · Garden Route", attractionQuery:"Kapsztad" },
  { id:"sydney", flag:"🇦🇺", region:"AUSTRALIA", title:"Sydney", airport:"SYD", bookingCity:"Sydney", duration:12, best:"październik – kwiecień", ideal:"10+ dni", lead:"Tak daleki lot warto potraktować jako początek większej podróży po Australii, nie tylko wizytę przy Operze.", highlights:"Sydney · Blue Mountains · wybrzeże · road trip", attractionQuery:"Sydney" },
  { id:"meksyk", flag:"🇲🇽", region:"MEKSYK", title:"Meksyk", airport:"MEX", bookingCity:"Mexico City", duration:12, best:"listopad – kwiecień*", ideal:"10–16 dni", lead:"Mexico City, kultura, kuchnia i możliwość dołożenia drugiego regionu — od Jukatanu po wybrzeże Pacyfiku.", highlights:"Mexico City · Teotihuacán · Oaxaca · Jukatan", attractionQuery:"Mexico City" },
  { id:"malediwy", flag:"🇲🇻", region:"OCEAN INDYJSKI", title:"Malediwy", airport:"MLE", bookingCity:"Malé", duration:8, best:"styczeń – kwiecień", ideal:"7–10 dni", lead:"Tu mniej znaczy więcej: dobra wyspa, transfer i warunki pogodowe są ważniejsze niż długa lista atrakcji.", highlights:"laguny · snorkeling · resort / lokalna wyspa · nurkowanie", attractionQuery:"Malediwy" },
];


const cheapestWindows: Record<string,{departure:string;ret:string;label:string}> = {
  wietnam:{departure:"2026-11-17",ret:"2026-11-29",label:"17–29 listopada 2026"},
  pekin:{departure:"2026-10-20",ret:"2026-10-27",label:"20–27 października 2026"},
  "nowy-jork":{departure:"2026-11-10",ret:"2026-11-17",label:"10–17 listopada 2026"},
  japonia:{departure:"2026-11-12",ret:"2026-11-24",label:"12–24 listopada 2026"},
  tajlandia:{departure:"2026-11-24",ret:"2026-12-06",label:"24 listopada – 6 grudnia 2026"},
  bali:{departure:"2027-05-11",ret:"2027-05-23",label:"11–23 maja 2027"},
  singapur:{departure:"2027-02-09",ret:"2027-02-14",label:"9–14 lutego 2027"},
  seul:{departure:"2027-05-04",ret:"2027-05-12",label:"4–12 maja 2027"},
  kapsztad:{departure:"2026-11-10",ret:"2026-11-20",label:"10–20 listopada 2026"},
  sydney:{departure:"2027-03-02",ret:"2027-03-14",label:"2–14 marca 2027"},
  meksyk:{departure:"2027-02-16",ret:"2027-02-28",label:"16–28 lutego 2027"},
  malediwy:{departure:"2027-01-19",ret:"2027-01-27",label:"19–27 stycznia 2027"}
};

const cheapestTips: Record<string,string> = {
  wietnam:"Najpierw sprawdzamy drugą połowę listopada i marzec; wyloty wt–czw często są lepsze niż weekend.",
  pekin:"Najpierw sprawdzamy drugą połowę marca i październik po Golden Week — zwykle lepszy kompromis ceny i pogody.",
  "nowy-jork":"Najpierw patrzymy na koniec kwietnia, początek maja oraz listopad przed Świętem Dziękczynienia.",
  japonia:"Jeśli sakura nie jest obowiązkowa, polujemy na drugą połowę maja albo listopad po szczycie sezonu.",
  tajlandia:"Najpierw sprawdzamy koniec listopada i początek grudnia przed świątecznym skokiem cen.",
  bali:"Najpierw sprawdzamy maj, czerwiec i drugą połowę września — poza wakacyjnym szczytem.",
  singapur:"Najczęściej testujemy terminy wt–czw i łączymy Singapur ze stopoverem, żeby obniżyć koszt całej trasy.",
  seul:"Najpierw porównujemy końcówkę kwietnia, maj i drugą połowę października.",
  kapsztad:"Najpierw sprawdzamy listopad i marzec, omijając świąteczno-noworoczny szczyt.",
  sydney:"Najpierw testujemy listopad i marzec; okres świąteczny potrafi być wyraźnie droższy.",
  meksyk:"Najpierw porównujemy końcówkę listopada i luty–marzec poza feriami i świętami.",
  malediwy:"Najpierw sprawdzamy drugą połowę stycznia i marzec; weekendowe wyloty nie zawsze wygrywają ceną."
};

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function travelDates(stay: number) {
  const departure = new Date();
  departure.setUTCDate(departure.getUTCDate() + 70);
  const ret = new Date(departure);
  ret.setUTCDate(ret.getUTCDate() + stay);
  return { departure: iso(departure), ret: iso(ret) };
}

function eskyUrl(airport: string, stay: number, window?: {departure:string;ret:string}) {
  const dates = window || travelDates(stay);
  return buildEskyFlightsUrl(`https://www2.esky.pl/flights/search/mp/WAWA/ap/${airport}?departureDate=${dates.departure}&returnDate=${dates.ret}&pa=2&py=0&pc=0&pi=0&sc=economy&flexDatesOffset=3`);
}

function bookingUrl(city: string, stay: number, window?: {departure:string;ret:string}) {
  const dates = window || travelDates(stay);
  const params = new URLSearchParams({
    ss: city,
    checkin: dates.departure,
    checkout: dates.ret,
    group_adults: "2",
    no_rooms: "1",
    group_children: "0",
    aid: "818288",
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function attractionsUrl(place: string) {
  return partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(place)}`);
}

export default function LongHaulPage() {
  return (
    <main className="long-haul-page">
      <SiteHeader />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Dalekie podróże", url: "https://tripownia.pl/dalekie-podroze" },
      ]}/>

      <section className="long-haul-hero">
        <div className="shell">
          <div className="kicker">DALEKIE PODRÓŻE</div>
          <h1>Barcelona była. Rzym był. To lecimy dalej.</h1>
          <p>
            Wietnam, Pekin, Nowy Jork, Japonia i kierunki, dla których warto mieć więcej niż trzy dni.
            Pokazujemy, ile czasu ma sens, kiedy lecieć i od razu ustawiamy kierunek w wyszukiwarce lotów i noclegów.
          </p>
          <div className="long-haul-hero-tags">
            <a href="#wietnam">🇻🇳 Wietnam</a><a href="#pekin">🇨🇳 Pekin</a><a href="#nowy-jork">🇺🇸 Nowy Jork</a>
            <a href="#japonia">🇯🇵 Japonia</a><a href="#tajlandia">🇹🇭 Tajlandia</a><a href="#bali">🇮🇩 Bali</a>
          </div>
        </div>
      </section>

      <section className="section shell long-haul-intro">
        <div className="section-heading">
          <div><div className="kicker">WIĘKSZA PODRÓŻ</div><h2>Tu nie wybieramy tylko miasta.</h2><p>Przy dalekim wyjeździe liczy się sezon, długość pobytu, przesiadki i to, czy da się sensownie połączyć kilka miejsc.</p></div>
        </div>
        <div className="long-haul-principles">
          <div><span>🗓️</span><strong>Minimum czasu</strong><p>Nie proponujemy 4 dni w miejscu, do którego leci się kilkanaście godzin.</p></div>
          <div><span>🌦️</span><strong>Sezon ma znaczenie</strong><p>Podpowiadamy lepsze okna pogodowe zamiast udawać, że każdy miesiąc jest taki sam.</p></div>
          <div><span>✈️</span><strong>Lot już ustawiony</strong><p>CTA otwiera eSky z Warszawą, właściwym lotniskiem docelowym i przykładowym terminem.</p></div>
          <div><span>🏨</span><strong>Nocleg już ustawiony</strong><p>Booking dostaje konkretną miejscowość oraz te same daty pobytu.</p></div>
        </div>
      </section>

      <section className="section shell">
        <div className="long-haul-list">
          {trips.map(trip => (
            <article className="long-haul-detail-card" id={trip.id} key={trip.id}>
              <div className="long-haul-detail-head">
                <span>{trip.flag}</span>
                <div><small>{trip.region}</small><h2>{trip.title}</h2></div>
              </div>
              <p className="long-haul-detail-lead">{trip.lead}</p>
              <div className="long-haul-detail-facts">
                <div><small>NAJLEPSZY CZAS</small><strong>{trip.best}</strong></div>
                <div><small>ILE DNI</small><strong>{trip.ideal}</strong></div>
              </div>
              <p className="long-haul-highlights"><b>Co łączyć:</b> {trip.highlights}</p>
              <div className="long-haul-cheap-tip"><b>💸 Najpierw sprawdzamy najtańsze okno:</b> {cheapestTips[trip.id]}<br/><strong>Proponowany termin do porównania: {cheapestWindows[trip.id].label}</strong><small> To jest punkt startowy — w eSky możesz przesunąć daty i wybrać dowolny inny termin.</small></div>
              <div className="long-haul-actions">
                <a href={eskyUrl(trip.airport, trip.duration, cheapestWindows[trip.id])} target="_blank" rel="nofollow sponsored noopener noreferrer">💸 Sprawdź sugerowany termin</a>
                <a href={eskyUrl(trip.airport, trip.duration)} target="_blank" rel="nofollow sponsored noopener noreferrer">🗓️ Inny termin / loty</a>
                <a href={bookingUrl(trip.bookingCity, trip.duration, cheapestWindows[trip.id])} target="_blank" rel="nofollow sponsored noopener noreferrer">🏨 Noclegi w tym terminie</a>
                <a href={attractionsUrl(trip.attractionQuery)} target="_blank" rel="nofollow sponsored noopener noreferrer">🎟️ Atrakcje: {trip.attractionQuery}</a>
              </div>
            </article>
          ))}
        </div>
        <p className="long-haul-note">* Warunki pogodowe różnią się między regionami danego kraju. Przed rezerwacją zawsze sprawdź konkretną trasę i aktualną sytuację.</p>
      </section>

      <section className="shell long-haul-final">
        <div><div className="kicker">NIE WIESZ, OD CZEGO ZACZĄĆ?</div><h2>Najpierw wybierz typ podróży. Potem porównamy konkretne opcje.</h2><p>Możesz wrócić do pełnej wyszukiwarki Tripowni i ustawić własne lotnisko, termin, długość oraz budżet.</p></div>
        <Link href="/#wyszukiwarka">Przejdź do wyszukiwarki →</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
