"use client";

import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Flame, Search, Sparkles, Dice5 } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SearchHub from "@/components/SearchHub";
import { airportOptions, destinationOptions, getDailyOffers, offers } from "@/lib/offers";
import { partners } from "@/lib/partners";


const longHaulCards = [
  { href: "/dalekie-podroze#wietnam", flag: "🇻🇳", label: "AZJA", title: "Wietnam", text: "Hanoi, zatoka Ha Long, Hoi An i południe kraju — podróż, której szkoda zamykać w jednym mieście." },
  { href: "/dalekie-podroze#pekin", flag: "🇨🇳", label: "CHINY", title: "Pekin", text: "Wielki Mur, Zakazane Miasto i zupełnie inna skala city breaku niż w Europie." },
  { href: "/dalekie-podroze#nowy-jork", flag: "🇺🇸", label: "USA", title: "Nowy Jork", text: "Manhattan, Brooklyn i miasto, które spokojnie wypełnia tydzień bez szukania atrakcji na siłę." },
  { href: "/dalekie-podroze#japonia", flag: "🇯🇵", label: "JAPONIA", title: "Tokio + Kioto", text: "Nowoczesność, świątynie, jedzenie i kolej — najlepiej jako większa podróż, nie szybki weekend." },
  { href: "/dalekie-podroze#tajlandia", flag: "🇹🇭", label: "TAJLANDIA", title: "Bangkok + wyspy", text: "Miasto, street food i kilka dni nad morzem w jednej podróży." },
  { href: "/dalekie-podroze#bali", flag: "🇮🇩", label: "INDONEZJA", title: "Bali", text: "Świątynie, natura, ocean i wyjazd, który warto układać regionami zamiast wokół jednego hotelu." },
  { href: "/dalekie-podroze#singapur", flag: "🇸🇬", label: "SINGAPUR", title: "Singapur", text: "Azjatycka metropolia idealna także jako pierwszy lub ostatni etap dłuższej podróży." },
  { href: "/dalekie-podroze#kapsztad", flag: "🇿🇦", label: "RPA", title: "Kapsztad", text: "Ocean, góry, winnice i road trip — jeden z tych kierunków, dla których warto polecieć dalej." },
];

const experienceCards = [
  {
    href: "/podroze-po-przezycia#zorza",
    season: "WRZESIEŃ–MARZEC",
    title: "🌌 Zorza na Islandii",
    text: "Ciemne noce, geotermia i wyjazd planowany pod szansę zobaczenia zorzy.",
  },
  {
    href: "/podroze-po-przezycia#sakura",
    season: "MARZEC–KWIECIEŃ",
    title: "🌸 Sakura w Japonii",
    text: "Tokio i Kioto wtedy, gdy kwitnienie wiśni staje się głównym punktem podróży.",
  },
  {
    href: "/podroze-po-przezycia#fiordy",
    season: "MAJ–WRZESIEŃ",
    title: "🏔️ Fiordy i białe noce",
    text: "Długie dni, trekking, rejsy i spektakularne trasy widokowe po Norwegii.",
  },
  {
    href: "/podroze-po-przezycia#nowa-zelandia",
    season: "LISTOPAD–MARZEC",
    title: "🥾 Nowa Zelandia",
    text: "Road trip, góry i lato na południowej półkuli w najlepszym oknie na aktywny wyjazd.",
  },
  {
    href: "/podroze-po-przezycia#tulipany",
    season: "KWIECIEŃ–MAJ",
    title: "🌷 Tulipany w Holandii",
    text: "Krótki city break połączony z polami kwiatów i sezonem, który trwa tylko chwilę.",
  },
  {
    href: "/podroze-po-przezycia#safari",
    season: "CZERWIEC–PAŹDZIERNIK",
    title: "🦁 Safari w Kenii i Tanzanii",
    text: "Suchszy sezon, dzika przyroda i podróż, której termin ma ogromne znaczenie.",
  },
  {
    href: "/podroze-po-przezycia#jarmarki",
    season: "LISTOPAD–GRUDZIEŃ",
    title: "🎄 Jarmarki bożonarodzeniowe",
    text: "Wiedeń, Praga, Budapeszt i inne miasta wtedy, gdy sam klimat jest powodem wyjazdu.",
  },
  {
    href: "/podroze-po-przezycia#egzotyka",
    season: "ZIMA W POLSCE",
    title: "🌴 Egzotyka w porze suchej",
    text: "Tropiki dobrane nie tylko po cenie, ale także po sezonie, opadach i warunkach na miejscu.",
  },
];

export default function Home() {
  const todaysOffers = useMemo(() => getDailyOffers(offers, 8), []);
  const [budget, setBudget] = useState(2500);
  const [surprise, setSurprise] = useState<(typeof offers)[number] | null>(null);
  const [heroAirport, setHeroAirport] = useState("all");
  const [heroDestination, setHeroDestination] = useState("all");
  const [heroDuration, setHeroDuration] = useState("all");
  const [searchRequest, setSearchRequest] = useState(0);

  function pickSurprise() {
    const pool = offers.filter(o => o.price <= budget);
    setSurprise(pool[Math.floor(Math.random() * pool.length)] ?? offers[0]);
  }

  function showTrips() {
    setSearchRequest(v => v + 1);
    setTimeout(() => document.getElementById("wyszukiwarka")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  return (
    <main>
      <SiteHeader />

      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <div className="pill"><Flame size={16}/> Codziennie wybrane okazje</div>
            <h1>Najlepsze okazje podróżnicze<br/><span>w jednym miejscu.</span></h1>
            <p>Codziennie wybieramy najciekawsze loty, city breaki i wakacje. Ty wybierasz ofertę, a rezerwujesz bezpośrednio u sprawdzonego partnera.</p>

            <div className="searchbar hero-searchbar">
              <label>
                <small>Skąd?</small>
                <select value={heroAirport} onChange={e => setHeroAirport(e.target.value)}>
                  <option value="all">Wszystkie lotniska</option>
                  {airportOptions.map(a => <option key={a.code} value={a.code}>{a.label}</option>)}
                </select>
              </label>
              <label>
                <small>Dokąd?</small>
                <select value={heroDestination} onChange={e => setHeroDestination(e.target.value)}>
                  <option value="all">Gdziekolwiek</option>
                  {destinationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
              <label>
                <small>Na ile?</small>
                <select value={heroDuration} onChange={e => setHeroDuration(e.target.value)}>
                  <option value="all">Dowolnie</option>
                  <option value="short">2–4 noce</option>
                  <option value="week">5–8 nocy</option>
                  <option value="long">9+ nocy</option>
                </select>
              </label>
              <button type="button" onClick={showTrips}><Search size={18}/> Pokaż wyniki</button>
            </div>
            <div className="trustline">Bez setek przypadkowych wyników. Tylko wybrane przez Tripownię propozycje.</div>
          </div>

          <div className="hero-brand-card">
            <Image src="/tripownia-logo.webp" alt="Tripownia.pl" width={520} height={420} priority />
            <div className="hero-brand-tag">Podróże, które warto brać.</div>
          </div>
        </div>
      </section>

      <section className="section shell" id="okazje">
        <div className="section-heading">
          <div>
            <div className="kicker">DZISIEJSZA SELEKCJA</div>
            <h2>Dziś bralibyśmy te</h2>
            <p>Nowa selekcja codziennie o 12:00. Pula pozostaje stała do kolejnej publikacji; cena i dostępność są potwierdzane u partnera.</p>
          </div>
          <Link href="/okazje">Zobacz wszystkie <ArrowRight size={16}/></Link>
        </div>
        <div className="cards-grid">{todaysOffers.map(o => <OfferCard offer={o} key={o.id}/>)}</div>
      </section>

      <SearchHub
        initialAirports={heroAirport === "all" ? [] : [heroAirport]}
        initialDestinations={heroDestination === "all" ? [] : [heroDestination]}
        initialDuration={heroDuration}
        searchRequest={searchRequest}
      />

      <section className="budget-wrap" id="budzet">
        <div className="shell budget-grid">
          <div>
            <div className="kicker light">WYNIKI TRIPOWNIA.PL</div>
            <h2>Mam {budget} zł.<br/>Gdzie mogę polecieć?</h2>
            <p>Ustaw kwotę, a Tripownia pokaże tylko wyjazdy, które mieszczą się w Twoim budżecie.</p>
            <input type="range" min="500" max="5000" step="100" value={budget} onChange={e => setBudget(Number(e.target.value))}/>
            <div className="range-labels"><span>500 zł</span><strong>{budget} zł</strong><span>5000 zł</span></div>
          </div>
          <div className="surprise-card">
            <Sparkles size={30}/><h3>Nie wiesz gdzie?</h3><p>Daj nam budżet i daj się zaskoczyć.</p>
            <button onClick={pickSurprise}><Dice5 size={18}/> Zaskocz mnie</button>
            {surprise && (
              <Link className="surprise-result" href={`/oferta/${surprise.id}`}>
                {surprise.flag} <strong>{surprise.city}</strong><span>{surprise.price} zł/os. · {surprise.score}/10 →</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="section shell" id="odkrywaj">
        <div className="section-heading"><div><div className="kicker">NIE TYLKO KLASYKI</div><h2>Masz już za sobą Barcelonę i Rzym?</h2></div></div>
        <div className="discovery-grid">
          <Link className="discovery-card" href="/maroko"><small>BLISKA EGZOTYKA</small><strong>🇲🇦 Maroko</strong><span>Kolor, jedzenie, pustynia i zupełnie inny klimat bez lotu na drugi koniec świata.</span></Link>
          <Link className="discovery-card" href="/riwiera-albanska"><small>MNIEJ OCZYWISTE</small><strong>🇦🇱 Albania</strong><span>Bałkany, morze i kierunek, który wciąż można odkrywać poza utartym szlakiem.</span></Link>
          <Link className="discovery-card" href="/madera"><small>AKTYWNIE</small><strong>🇵🇹 Madera</strong><span>Levada, klify i całoroczna zieleń zamiast klasycznego leżaka.</span></Link>
          <Link className="discovery-card" href="/dubaj"><small>DALEJ</small><strong>🇦🇪 Dubaj i ZEA</strong><span>Słońce zimą i dobra baza do pierwszej dalszej podróży.</span></Link>
        </div>
      </section>

      <section className="section shell long-haul-home" id="dalekie-podroze">
        <div className="section-heading">
          <div>
            <div className="kicker">DALEJ NIŻ WEEKEND</div>
            <h2>Czasem warto polecieć trochę dalej.</h2>
            <p>Nie tylko Europa. Kierunki na większą podróż: Azja, USA, Afryka i miejsca, które naprawdę dają poczucie wyjazdu gdzieś dalej.</p>
          </div>
          <Link href="/dalekie-podroze">Zobacz dalekie podróże <ArrowRight size={16}/></Link>
        </div>
        <div className="long-haul-grid">
          {longHaulCards.map(card => (
            <Link className="long-haul-card" href={card.href} key={card.href}>
              <div className="long-haul-card-top"><span>{card.flag}</span><small>{card.label}</small></div>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
              <b>Zobacz pomysł →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell experience-section" id="przezycia">
        <div className="section-heading">
          <div>
            <div className="kicker">PODRÓŻE PO PRZEŻYCIA</div>
            <h2>Nie wybieraj miejsca.<br/>Wybierz to, co chcesz przeżyć.</h2>
            <p>Sezonowe zjawiska, natura i podróże, dla których naprawdę warto złapać właściwy moment.</p>
          </div>
          <Link href="/podroze-po-przezycia">Zobacz pełny kalendarz <ArrowRight size={16}/></Link>
        </div>

        <div className="discovery-grid experience-home-grid">
          {experienceCards.map(card => (
            <Link className="discovery-card" href={card.href} key={card.href}>
              <small>{card.season}</small>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
            </Link>
          ))}
        </div>

        <div className="experience-signals-grid" aria-label="Co Tripownia bierze pod uwagę przy podróżach po przeżycia">
          <div className="experience-signal"><span>🌦️</span><strong>Pogoda i sezon</strong><small>Pora sucha, deszczowa, temperatury i długość dnia.</small></div>
          <div className="experience-signal"><span>🌌</span><strong>Zjawiska</strong><small>Zorza, kwitnienie, białe noce i krótkie okna sezonowe.</small></div>
          <div className="experience-signal"><span>🐋</span><strong>Natura i migracje</strong><small>Safari, wieloryby i okresy największej aktywności przyrody.</small></div>
          <div className="experience-signal"><span>🧊</span><strong>Warunki na miejscu</strong><small>Lodowce, trekking, stan szlaków i realna dostępność atrakcji.</small></div>
        </div>
      </section>

      <section className="section shell custom-trip">
        <div className="section-heading">
          <div>
            <div className="kicker">WŁASNA PODRÓŻ</div>
            <h2>Masz pomysł? Zbuduj wyjazd po swojemu.</h2>
            <p>Wybierz kierunek, lotnisko, długość i budżet. Tripownia pomoże połączyć lot, nocleg i atrakcje zamiast wciskać gotowy pakiet.</p>
          </div>
        </div>
        <div className="hub-grid">
          <a href="#wyszukiwarka"><strong>🧩 Zacznij od własnych parametrów</strong><span>Ustaw filtry i przeszukaj aktualną bazę Tripowni.</span></a>
          <a href={partners.kiwi.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>✈️ Dobierz lot</strong><span>Sprawdź połączenia przez afiliacyjny link Kiwi.com.</span></a>
          <a href={partners.booking.buildUrl()} target="_blank" rel="sponsored noopener noreferrer"><strong>🏨 Dobierz nocleg</strong><span>Przejdź do Booking.com z identyfikatorem afiliacyjnym Tripowni.</span></a>
        </div>
      </section>

      <section className="section shell content-hubs">
        <div className="section-heading"><div><div className="kicker">ODKRYWAJ Z TRIPOWNIĄ</div><h2>Więcej niż dzisiejsza selekcja</h2></div></div>
        <div className="hub-grid">
          <Link href="/kierunki"><strong>🌍 Kierunki</strong><span>Malta, Grecja, Włochy, Hiszpania i dziesiątki inspiracji.</span></Link>
          <Link href="/city-break-2"><strong>🏙 City break</strong><span>Krótkie wyjazdy, gotowe pomysły i aktualne okazje.</span></Link>
          <Link href="/last-minute"><strong>🏖 Wakacje i Last Minute</strong><span>All Inclusive, słońce i wyjazdy z polskich lotnisk.</span></Link>
          <Link href="/podroze-po-przezycia"><strong>✨ Przeżycia</strong><span>Zjawiska, sezonowość i podróże planowane pod właściwy moment.</span></Link>
          <Link href="/dalekie-podroze"><strong>🌏 Dalekie podróże</strong><span>Wietnam, Pekin, Nowy Jork, Japonia, Tajlandia i dalsze wyprawy.</span></Link>
          <Link href="/poradniki"><strong>🧭 Poradniki</strong><span>Formalności, lotniska, bagaż i praktyczne wskazówki.</span></Link>
          <Link href="/parkingi"><strong>🚗 Parkingi</strong><span>Najpierw wybierz lotnisko, potem przejdź do rezerwacji.</span></Link>
          <Link href="/atrakcje"><strong>🎟 Atrakcje</strong><span>Co robić na miejscu i gdzie kupować bilety.</span></Link>
        </div>
      </section>

      <section className="section shell score-section" id="score">
        <div className="score-copy">
          <div className="kicker">WYNIKI TRIPOWNIA.PL</div>
          <h2>Cena to dopiero początek.</h2>
          <p>Oceniamy wyjazd całościowo: cenę, pogodę, hotel, termin i lot. Dzięki temu od razu wiesz, czy oferta jest naprawdę dobra.</p>
        </div>
        <div className="score-box">
          <div className="bigscore">9,6<span>/10</span></div>
          {[['Cena','10/10'],['Pogoda','8/10'],['Hotel','9/10'],['Termin','10/10'],['Lot','9/10']].map(([a,b]) => <div className="score-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}
          <div className="verdict">🔥 BIERZEMY</div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
