import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Kierunki podróży | Tripownia.pl",
  description: "Wybierz kierunek na city break, wakacje, All Inclusive albo dalszą podróż. Sprawdź inspiracje Tripowni i przejdź do aktualnych ofert.",
  alternates: { canonical: "/kierunki" },
};

const directions = [
  {
    "href": "/grecja",
    "search": "grecja santorini kreta rodos korfu zakynthos",
    "category": "wakacje all-inclusive",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Oia%2C%20Santorini%20HDR%20sunset.jpg?width=1200",
    "alt": "Grecja, Santorini i białe domy w Oia",
    "badges": [
      "Popularny kierunek",
      "Wyspy"
    ],
    "title": "Grecja",
    "description": "Santorini, Kreta, Rodos i greckie wyspy idealne na letnie wakacje."
  },
  {
    "href": "/egipt",
    "search": "egipt hurghada marsa alam sharm el sheikh piramidy",
    "category": "wakacje all-inclusive",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/All%20Gizah%20Pyramids.jpg?width=1200",
    "alt": "Egipt i piramidy w Gizie",
    "badges": [
      "All inclusive",
      "Cały rok"
    ],
    "title": "Egipt",
    "description": "Hotele przy plaży, rafy koralowe, Morze Czerwone i gwarancja słońca."
  },
  {
    "href": "/albania",
    "search": "albania ksamil saranda riwiera albanska durres",
    "category": "wakacje",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Ksamil-ksamil%20islands.jpg?width=1200",
    "alt": "Albania, Ksamil i Riwiera Albańska",
    "badges": [
      "Dobry stosunek ceny",
      "Plaże"
    ],
    "title": "Albania",
    "description": "Ksamil, Saranda, lazurowa woda i coraz popularniejsza riwiera."
  },
  {
    "href": "/hiszpania",
    "search": "hiszpania barcelona madryt majorka minorka costa brava",
    "category": "wakacje city-break all-inclusive",
    "image": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=86",
    "alt": "Hiszpania, Barcelona i panorama miasta",
    "badges": [
      "Wakacje i city break",
      "Hiszpania"
    ],
    "title": "Hiszpania",
    "description": "Barcelona, Majorka, Minorka, Costa Brava i słoneczne wybrzeża."
  },
  {
    "href": "/wlochy",
    "search": "wlochy rzym mediolan bari sycylia sardynia neapol",
    "category": "wakacje city-break",
    "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=86",
    "alt": "Włochy i Koloseum w Rzymie",
    "badges": [
      "City break",
      "Kuchnia"
    ],
    "title": "Włochy",
    "description": "Rzym, Mediolan, Bari, Sycylia i niezliczone pomysły na podróż."
  },
  {
    "href": "/turcja",
    "search": "turcja antalya alanya bodrum side stambul kapadocja",
    "category": "wakacje city-break all-inclusive",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=86",
    "alt": "Turcja i balony nad Kapadocją",
    "badges": [
      "All inclusive",
      "Rodzinne wakacje"
    ],
    "title": "Turcja",
    "description": "Antalya, Side, Alanya, świetne hotele i bogata oferta all inclusive."
  },
  {
    "href": "/chorwacja",
    "search": "chorwacja dubrownik split zadar adriatyk",
    "category": "wakacje city-break",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20view%20of%20the%20Old%20Town%20of%20Dubrovnik%20-%20Croatia.jpg?width=1200",
    "alt": "Chorwacja i stare miasto w Dubrowniku",
    "badges": [
      "Adriatyk",
      "Widoki"
    ],
    "title": "Chorwacja",
    "description": "Dubrownik, Split, Zadar, wyspy i malownicze wybrzeże Adriatyku."
  },
  {
    "href": "/malta",
    "search": "malta valletta blue lagoon comino gozo",
    "category": "wakacje city-break",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Blue%20Lagoon%2C%20Comino.jpg?width=1200",
    "alt": "Malta, Blue Lagoon i wyspa Comino",
    "badges": [
      "Krótki urlop",
      "Cały rok"
    ],
    "title": "Malta",
    "description": "Valletta, Comino, Gozo, historia i lazurowa woda na jednej wyspie."
  },
  {
    "href": "/cypr",
    "search": "cypr pafos larnaka ayia napa nissi beach",
    "category": "wakacje all-inclusive",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Agia%20Napa%20Nissi%20Beach%204.jpg?width=1200",
    "alt": "Cypr i Nissi Beach w Ayia Napa",
    "badges": [
      "Ciepłe morze",
      "Plaże"
    ],
    "title": "Cypr",
    "description": "Pafos, Larnaka, Ayia Napa, piękne plaże i długi sezon wakacyjny."
  },
  {
    "href": "/czarnogora",
    "search": "czarnogora kotor budva zatoka kotorska",
    "category": "wakacje",
    "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Castillo%20de%20San%20Juan%2C%20Kotor%2C%20Bah%C3%ADa%20de%20Kotor%2C%20Montenegro%2C%202014-04-19%2C%20DD%2013.JPG?width=1200",
    "alt": "Czarnogóra, Kotor i Zatoka Kotorska",
    "badges": [
      "Góry i morze",
      "Adriatyk"
    ],
    "title": "Czarnogóra",
    "description": "Kotor, Budva, zatoki, góry i zachwycające widoki Adriatyku."
  },
  {
    "href": "/portugalia",
    "search": "portugalia lizbona porto algarve madera",
    "category": "wakacje city-break",
    "image": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=86",
    "alt": "Portugalia i kolorowa Lizbona",
    "badges": [
      "Ocean",
      "City break"
    ],
    "title": "Portugalia",
    "description": "Lizbona, Porto, Algarve, Madera i niezwykłe wybrzeże Atlantyku."
  },
  {
    "href": "/francja",
    "search": "francja paryz nicea lazurowe wybrzeze marsylia",
    "category": "wakacje city-break",
    "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=86",
    "alt": "Francja i wieża Eiffla w Paryżu",
    "badges": [
      "Romantyczny wyjazd",
      "Paryż"
    ],
    "title": "Francja",
    "description": "Paryż, Nicea, Marsylia, Lazurowe Wybrzeże i francuskie miasteczka."
  },
  {
    "href": "/bulgaria",
    "search": "bulgaria zlote piaski sloneczny brzeg warna burgas",
    "category": "wakacje all-inclusive",
    "image": "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1200&q=86",
    "alt": "Bułgaria i wybrzeże Morza Czarnego",
    "badges": [
      "Tanie wakacje",
      "All inclusive"
    ],
    "title": "Bułgaria",
    "description": "Słoneczny Brzeg, Złote Piaski i rodzinne wakacje nad Morzem Czarnym."
  },
  {
    "href": "/maroko",
    "search": "maroko marrakesz agadir fez casablanca",
    "category": "wakacje city-break egzotyka all-inclusive",
    "image": "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=1200&q=86",
    "alt": "Maroko i architektura Marrakeszu",
    "badges": [
      "Orientalny klimat",
      "Afryka"
    ],
    "title": "Maroko",
    "description": "Marrakesz, Agadir, kolorowe bazary, pustynia i oceaniczne plaże."
  },
  {
    "href": "/tunezja",
    "search": "tunezja djerba hammamet sousse monastir",
    "category": "wakacje all-inclusive",
    "image": "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=86",
    "alt": "Tunezja, biała architektura i morze",
    "badges": [
      "All inclusive",
      "Afryka"
    ],
    "title": "Tunezja",
    "description": "Djerba, Hammamet, szerokie plaże i korzystne pakiety wakacyjne."
  },
  {
    "href": "/dominikana",
    "search": "dominikana punta cana karaiby santo domingo",
    "category": "wakacje all-inclusive egzotyka",
    "image": "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1200&q=86",
    "alt": "Dominikana i tropikalna karaibska plaża",
    "badges": [
      "Karaiby",
      "Egzotyka"
    ],
    "title": "Dominikana",
    "description": "Punta Cana, palmy, biały piasek i wypoczynek w karaibskim stylu."
  },
  {
    "href": "/meksyk",
    "search": "meksyk cancun tulum riviera maya jukatan",
    "category": "wakacje all-inclusive egzotyka",
    "image": "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=86",
    "alt": "Meksyk, Tulum i wybrzeże Morza Karaibskiego",
    "badges": [
      "Riviera Maya",
      "Egzotyka"
    ],
    "title": "Meksyk",
    "description": "Cancún, Tulum, cenoty, piramidy Majów i karaibskie plaże."
  },
  {
    "href": "/tajlandia",
    "search": "tajlandia bangkok phuket krabi koh samui",
    "category": "wakacje city-break egzotyka",
    "image": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=86",
    "alt": "Tajlandia, świątynia i egzotyczny krajobraz",
    "badges": [
      "Azja",
      "Egzotyka"
    ],
    "title": "Tajlandia",
    "description": "Bangkok, Phuket, Krabi, wyspy, świątynie i słynna tajska kuchnia."
  },
  {
    "href": "/wietnam",
    "search": "wietnam hanoi ho chi minh sajgon zatoka ha long",
    "category": "city-break egzotyka",
    "image": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=86",
    "alt": "Wietnam, zatoka Ha Long i zielone wyspy",
    "badges": [
      "Azja",
      "Objazd"
    ],
    "title": "Wietnam",
    "description": "Hanoi, Sajgon, zatoka Ha Long, pola ryżowe i niezwykła kuchnia."
  },
  {
    "href": "/zanzibar",
    "search": "zanzibar tanzania stone town nungwi kendwa",
    "category": "wakacje all-inclusive egzotyka",
    "image": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=86",
    "alt": "Zanzibar i tropikalna plaża nad Oceanem Indyjskim",
    "badges": [
      "Ocean Indyjski",
      "Egzotyka"
    ],
    "title": "Zanzibar",
    "description": "Białe plaże, turkusowy ocean, Stone Town i afrykańska egzotyka."
  },
  {
    "href": "/malediwy",
    "search": "malediwy ocean indyjski atole wille na wodzie",
    "category": "wakacje all-inclusive egzotyka",
    "image": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=86",
    "alt": "Malediwy, tropikalna wyspa i turkusowy ocean",
    "badges": [
      "Rajskie wyspy",
      "Egzotyka"
    ],
    "title": "Malediwy",
    "description": "Turkusowe laguny, rafy koralowe i wypoczynek na rajskich atolach."
  },
  {
    "href": "/zea",
    "search": "zjednoczone emiraty arabskie dubaj abu dhabi ras al khaimah",
    "category": "wakacje city-break all-inclusive egzotyka",
    "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=86",
    "alt": "Zjednoczone Emiraty Arabskie i panorama Dubaju",
    "badges": [
      "Dubaj",
      "Zima w słońcu"
    ],
    "title": "Emiraty Arabskie",
    "description": "Dubaj, Abu Dhabi, nowoczesność, pustynia i plaże Zatoki Perskiej."
  }
];

const filters = [
  { key: "all", label: "🌍 Wszystkie" },
  { key: "wakacje", label: "☀️ Wakacje" },
  { key: "city-break", label: "🏙️ City break" },
  { key: "all-inclusive", label: "🌴 All Inclusive" },
  { key: "egzotyka", label: "🌎 Egzotyka" },
];

export default function KierunkiPage() {
  return (
    <main className="directions-page-v188">
      <SiteHeader/>

      <section className="shell directions-v188-shell">
        <header className="directions-v188-hero">
          <div>
            <div className="kicker">KIERUNKI PODRÓŻY</div>
            <h1>Dokąd chcesz polecieć tym razem?</h1>
            <p>
              Wybierz kraj lub region i przejdź do inspiracji, aktualnych ofert oraz
              dalszego wyszukiwania. Bez ściany przypadkowych linków.
            </p>
          </div>
          <Link href="/#wyszukiwarka" className="directions-v188-cta">
            <span>⌕</span> Wyszukaj po swojemu <b>→</b>
          </Link>
        </header>

        <div className="directions-v188-tools">
          <label className="directions-v188-search">
            <span aria-hidden="true">⌕</span>
            <input
              id="directions-search"
              type="search"
              placeholder="Wpisz kraj lub kierunek, np. Grecja, Egipt, Włochy…"
              aria-label="Wyszukaj kierunek podróży"
            />
          </label>

          <div className="directions-v188-filters" aria-label="Filtry kierunków">
            {filters.map((filter, index) => (
              <button
                key={filter.key}
                type="button"
                className={index === 0 ? "active" : ""}
                data-filter={filter.key}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="directions-v188-heading">
          <div>
            <small>INSPIRACJE NA KOLEJNY WYJAZD</small>
            <h2>Wybierz miejsce i zacznij od konkretu.</h2>
          </div>
          <span id="directions-count">{directions.length} kierunków</span>
        </div>

        <div className="directions-v188-grid" id="directions-grid">
          {directions.map((direction) => (
            <Link
              key={direction.href}
              href={direction.href}
              className="directions-v188-card"
              data-name={direction.search}
              data-category={direction.category}
            >
              <div className="directions-v188-image">
                <img src={direction.image} alt={direction.alt} loading="lazy" decoding="async"/>
                <div className="directions-v188-badges">
                  {direction.badges.slice(0,2).map((badge) => <span key={badge}>{badge}</span>)}
                </div>
                <span className="directions-v188-heart" aria-hidden="true">♡</span>
              </div>

              <div className="directions-v188-body">
                <h3>{direction.title}</h3>
                <p>{direction.description}</p>
                <span className="directions-v188-link">Zobacz kierunek <b>→</b></span>
              </div>
            </Link>
          ))}
        </div>

        <div className="directions-v188-empty" id="directions-empty" hidden>
          <strong>Nie znaleźliśmy takiego kierunku.</strong>
          <span>Spróbuj innej nazwy albo przejdź do pełnej wyszukiwarki Tripowni.</span>
          <Link href="/#wyszukiwarka">Otwórz wyszukiwarkę →</Link>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const search = document.getElementById("directions-search");
              const cards = [...document.querySelectorAll(".directions-v188-card")];
              const filters = [...document.querySelectorAll(".directions-v188-filters button")];
              const count = document.getElementById("directions-count");
              const empty = document.getElementById("directions-empty");
              let active = "all";

              const normalize = (value) => (value || "")
                .toLocaleLowerCase("pl")
                .normalize("NFD")
                .replace(/[\\u0300-\\u036f]/g, "");

              const apply = () => {
                const q = normalize(search?.value);
                let visible = 0;

                cards.forEach((card) => {
                  const name = normalize(card.getAttribute("data-name"));
                  const category = normalize(card.getAttribute("data-category"));
                  const matchesSearch = !q || name.includes(q);
                  const matchesFilter = active === "all" || category.includes(normalize(active));
                  const show = matchesSearch && matchesFilter;
                  card.style.display = show ? "" : "none";
                  if (show) visible += 1;
                });

                if (count) count.textContent = visible + (visible === 1 ? " kierunek" : " kierunków");
                if (empty) empty.hidden = visible !== 0;
              };

              search?.addEventListener("input", apply);

              filters.forEach((button) => {
                button.addEventListener("click", () => {
                  active = button.getAttribute("data-filter") || "all";
                  filters.forEach((item) => item.classList.remove("active"));
                  button.classList.add("active");
                  apply();
                });
              });
            })();
          `
        }}
      />

      <SiteFooter/>
    </main>
  );
}
