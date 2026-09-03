import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Weekend i wakacje w Polsce | Tripownia.pl",
  description: "Gdańsk, Sopot, Kołobrzeg, Kraków, Wrocław, Poznań, Toruń, Lublin, Łódź i Zakopane. Pomysły na wyjazd w Polsce z noclegami i atrakcjami.",
  alternates: { canonical: "/polska" },
  openGraph: {
    title: "Weekend i wakacje w Polsce | Tripownia.pl",
    description: "10 kierunków na city break, morze, góry i weekend bez samolotu.",
    type: "website",
    url: "/polska",
  },
};

type PolishPlace = {
  name: string;
  image: string;
  type: string;
  lead: string;
  bestFor: string[];
};

const places: PolishPlace[] = [
  { name: "Gdańsk", image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Gda%C5%84sk_Stare_Miasto_-_Old_Town_Hall.jpg", type: "Morze + city break", lead: "Stare Miasto, Motława i szybki wypad nad Bałtyk.", bestFor: ["weekend", "morze", "zwiedzanie"] },
  { name: "Sopot", image: "https://upload.wikimedia.org/wikipedia/commons/3/35/Sopot_pier_1.jpg", type: "Nad morzem", lead: "Plaża, molo i krótki reset bez planowania całych wakacji.", bestFor: ["plaża", "weekend", "we dwoje"] },
  { name: "Kołobrzeg", image: "https://upload.wikimedia.org/wikipedia/commons/2/29/Kolobrzeg_plaza_molo_2026.jpg", type: "Nad morzem", lead: "Dłuższy odpoczynek nad Bałtykiem, spa i spacery po plaży.", bestFor: ["morze", "spa", "rodzinny"] },
  { name: "Kraków", image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Sukiennice_and_Main_Market_Square_Krakow_Poland.JPG", type: "City break", lead: "Rynek, Kazimierz i jeden z najmocniejszych kierunków na weekend.", bestFor: ["city break", "jedzenie", "kultura"] },
  { name: "Wrocław", image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Wroc%C5%82aw%2C_Dolny_%C5%9Al%C4%85sk%2C_Poland_-_Rynek_(Market_Square)_-_panoramio_-_MARELBU_(1).jpg", type: "City break", lead: "Rynek, Ostrów Tumski i dużo atrakcji na 2–3 dni.", bestFor: ["weekend", "rodzinny", "zwiedzanie"] },
  { name: "Poznań", image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Pozna%C5%84-Old_Market_Square.jpg", type: "City break", lead: "Krótki miejski wyjazd, Stary Rynek i dobra gastronomia.", bestFor: ["weekend", "jedzenie", "city break"] },
  { name: "Toruń", image: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Torun%2C_view_of_the_old_town.jpg", type: "Na weekend", lead: "Kompaktowe stare miasto i bardzo wygodny kierunek na 1–2 noce.", bestFor: ["weekend", "rodzinny", "spokojnie"] },
  { name: "Lublin", image: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Old_Town_of_Lublin.jpg", type: "Mniej oczywisty city break", lead: "Stare Miasto, klimat i dobry kierunek na spokojniejszy weekend.", bestFor: ["city break", "tanio", "mniej oczywiste"] },
  { name: "Łódź", image: "https://upload.wikimedia.org/wikipedia/commons/9/92/Ulica_Piotrkowska_in_Lodz.JPG", type: "Miejski weekend", lead: "Piotrkowska, OFF Piotrkowska i industrialny klimat.", bestFor: ["kultura", "jedzenie", "weekend"] },
  { name: "Zakopane", image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Zakopane%2C_Kasprowy_Wierch%2C_Tatry_Zachodnie_1987_m_n.p.m._-_panoramio.jpg", type: "Góry", lead: "Tatry, trekking albo weekend z widokiem na góry.", bestFor: ["góry", "aktywnie", "weekend"] },
];

function bookingUrl(city: string) {
  return partners.booking.buildUrl(
    `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(city + ", Polska")}`
  );
}

function attractionsUrl(city: string) {
  return partners.getyourguide.buildUrl(
    `https://www.getyourguide.pl/s/?q=${encodeURIComponent(city)}`
  );
}

export default function PolandPage() {
  return (
    <main>
      <SiteHeader />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Polska", url: "https://tripownia.pl/polska" },
      ]} />

      <section className="poland-hero">
        <div className="shell poland-hero-inner">
          <div>
            <div className="kicker">POLSKA</div>
            <h1>Nie każdy dobry wyjazd zaczyna się na lotnisku.</h1>
            <p>
              Weekend nad morzem, krótki city break albo góry. Wybierz kierunek,
              zobacz noclegi i atrakcje, a potem rezerwuj bez przekopywania kolejnych stron.
            </p>
            <div className="sales-quick-tags">
              <span>🚆 Bez samolotu</span>
              <span>🌊 Nad morzem</span>
              <span>🏙 City break</span>
              <span>⛰ Góry</span>
            </div>
          </div>

          <div className="poland-hero-card">
            <small>10 KIERUNKÓW NA START</small>
            <strong>Polska na 2–5 dni</strong>
            <span>Dobry wybór, kiedy liczy się krótki dojazd, elastyczny termin i brak lotniska.</span>
            <Link href="#kierunki-polska">Wybierz miejsce ↓</Link>
          </div>
        </div>
      </section>

      <section className="shell poland-section" id="kierunki-polska">
        <div className="section-heading">
          <div>
            <div className="kicker">GDZIE W POLSCE?</div>
            <h2>10 kierunków na weekend i krótki urlop</h2>
            <p>Każdy kafel prowadzi od inspiracji bezpośrednio do noclegu albo atrakcji.</p>
          </div>
        </div>

        <div className="poland-grid">
          {places.map(place => (
            <article className="poland-card" key={place.name}>
              <div className="poland-card-image">
                <img src={place.image} alt={`${place.name} — pomysł na wyjazd w Polsce`} loading="lazy" referrerPolicy="no-referrer" />
                <span>{place.type}</span>
              </div>
              <div className="poland-card-body">
                <h3>{place.name}</h3>
                <p>{place.lead}</p>
                <div className="poland-tags">
                  {place.bestFor.map(tag => <span key={tag}>{tag}</span>)}
                </div>
                <div className="poland-photo-credit">Zdjęcie: Wikimedia Commons</div>
                <div className="poland-card-actions">
                  <a href={bookingUrl(place.name)} target="_blank" rel="sponsored noopener noreferrer">
                    🏨 Sprawdź noclegi
                  </a>
                  <a href={attractionsUrl(place.name)} target="_blank" rel="sponsored noopener noreferrer">
                    🎟 Atrakcje
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="poland-discovery">
        <div className="shell">
          <div className="section-heading">
            <div>
              <div className="kicker">WYBIERZ PO STYLU WYJAZDU</div>
              <h2>Nie wiesz jeszcze dokąd?</h2>
            </div>
          </div>
          <div className="poland-style-grid">
            <a href="#kierunki-polska"><span>🌊</span><strong>Weekend nad morzem</strong><small>Gdańsk · Sopot · Kołobrzeg</small></a>
            <a href="#kierunki-polska"><span>🏙</span><strong>City break w Polsce</strong><small>Kraków · Wrocław · Poznań · Łódź</small></a>
            <a href="#kierunki-polska"><span>⛰</span><strong>Góry na weekend</strong><small>Zakopane i Tatry</small></a>
            <a href="#kierunki-polska"><span>✨</span><strong>Mniej oczywiste</strong><small>Toruń · Lublin</small></a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
