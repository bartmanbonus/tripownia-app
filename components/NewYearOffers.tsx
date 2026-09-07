"use client";

import { useEffect, useMemo, useState } from "react";
import TravelImage from "@/components/TravelImage";
import type { Offer } from "@/lib/offers";

type CuratedIdea = {
  city: string;
  country: string;
  flag: string;
  airport: string;
  dates: [string, string];
  image?: string;
  type: "CITY BREAK" | "DŁUŻEJ";
  why: string;
  see: string;
};

type ApiResponse = {
  ok?: boolean;
  checkedAt?: string;
  offers?: Offer[];
};

const CURATED: CuratedIdea[] = [
  { city: "Budapeszt", country: "Węgry", flag: "🇭🇺", airport: "BUD", dates: ["2026-12-30", "2027-01-03"], image: "/images/destinations/budapeszt.jpg", type: "CITY BREAK", why: "Termy, Dunaj i bardzo dobry klimat na 3–4 noce.", see: "Parlament · Baszta Rybacka · termy · rejs po Dunaju" },
  { city: "Rzym", country: "Włochy", flag: "🇮🇹", airport: "ROM", dates: ["2026-12-29", "2027-01-02"], image: "/images/destinations/rzym.jpg", type: "CITY BREAK", why: "Klasyczny city break z mocnym programem na przełomie roku.", see: "Koloseum · Watykan · Trastevere · punkty widokowe" },
  { city: "Praga", country: "Czechy", flag: "🇨🇿", airport: "PRG", dates: ["2026-12-30", "2027-01-03"], type: "CITY BREAK", why: "Krótko, blisko i bardzo klimatycznie — dobry wybór bez długiego lotu.", see: "Stare Miasto · Most Karola · Hradczany · Mala Strana" },
  { city: "Wiedeń", country: "Austria", flag: "🇦🇹", airport: "VIE", dates: ["2026-12-30", "2027-01-03"], image: "/images/destinations/wieden.jpg", type: "CITY BREAK", why: "Elegancki Sylwester, koncertowy klimat i dużo atrakcji w zasięgu spaceru.", see: "Ring · Schönbrunn · Belweder · centrum" },
  { city: "Stambuł", country: "Turcja", flag: "🇹🇷", airport: "IST", dates: ["2026-12-29", "2027-01-03"], image: "/images/destinations/stambul.jpg", type: "CITY BREAK", why: "Bardziej nieoczywisty city break: Bosfor, hammam i intensywne miasto.", see: "Bosfor · Hagia Sophia · Grand Bazaar · Kadıköy" },
  { city: "Lizbona", country: "Portugalia", flag: "🇵🇹", airport: "LIS", dates: ["2026-12-29", "2027-01-03"], type: "CITY BREAK", why: "Łagodniejsza zima, świetne jedzenie i widokowe miasto na kilka dni.", see: "Alfama · Belém · tramwaj 28 · Miradouros" },
  { city: "Malta", country: "Malta", flag: "🇲🇹", airport: "MLA", dates: ["2026-12-29", "2027-01-03"], type: "CITY BREAK", why: "Mała wyspa, dużo słońca i dobry balans między zwiedzaniem a odpoczynkiem.", see: "Valletta · Mdina · Three Cities · klify" },
  { city: "Pafos", country: "Cypr", flag: "🇨🇾", airport: "PFO", dates: ["2026-12-29", "2027-01-03"], type: "CITY BREAK", why: "Cieplej niż w Europie kontynentalnej i bez potrzeby długiego urlopu.", see: "Pafos · Petra tou Romiou · port · archeologia" },

  { city: "Marrakesz", country: "Maroko", flag: "🇲🇦", airport: "RAK", dates: ["2026-12-27", "2027-01-04"], image: "/images/destinations/marrakesz.jpg", type: "DŁUŻEJ", why: "Riady, Atlas i pustynny klimat — dobry kompromis między city breakiem a egzotyką.", see: "Medyna · Atlas · Agafay · ogrody" },
  { city: "Teneryfa", country: "Hiszpania", flag: "🇪🇸", airport: "TFS", dates: ["2026-12-27", "2027-01-05"], image: "/images/destinations/teneryfa.jpg", type: "DŁUŻEJ", why: "Słońce, ocean i 8–9 nocy bez presji intensywnego zwiedzania.", see: "Teide · Anaga · plaże · Los Gigantes" },
  { city: "Fuerteventura", country: "Hiszpania", flag: "🇪🇸", airport: "FUE", dates: ["2026-12-27", "2027-01-05"], type: "DŁUŻEJ", why: "Wiatr, plaże i dużo przestrzeni — świetna opcja na spokojniejszy Sylwester.", see: "Corralejo · Sotavento · wydmy · ocean" },
  { city: "Hurghada", country: "Egipt", flag: "🇪🇬", airport: "HRG", dates: ["2026-12-27", "2027-01-05"], type: "DŁUŻEJ", why: "Ciepło, All Inclusive i łatwy reset bez skomplikowanej logistyki.", see: "Morze Czerwone · snorkeling · pustynia · marina" },
  { city: "Marsa Alam", country: "Egipt", flag: "🇪🇬", airport: "RMF", dates: ["2026-12-27", "2027-01-05"], type: "DŁUŻEJ", why: "Spokojniej niż w Hurghadzie, za to świetnie na rafy i pełny wypoczynek.", see: "Rafy · Abu Dabbab · pustynia · plaże" },
  { city: "Dubaj", country: "ZEA", flag: "🇦🇪", airport: "DXB", dates: ["2026-12-27", "2027-01-05"], image: "/images/destinations/dubaj.jpg", type: "DŁUŻEJ", why: "Ciepło i spektakularny Sylwester, z czasem także na plażę i pustynię.", see: "Downtown · Marina · pustynia · plaża · Creek" },
  { city: "Zanzibar", country: "Tanzania", flag: "🇹🇿", airport: "ZNZ", dates: ["2026-12-26", "2027-01-06"], type: "DŁUŻEJ", why: "Sylwester boso na plaży i pełne wejście w tropikalny klimat.", see: "Stone Town · Nungwi · Kendwa · rejsy · przyprawy" },
  { city: "Bangkok", country: "Tajlandia", flag: "🇹🇭", airport: "BKK", dates: ["2026-12-26", "2027-01-07"], type: "DŁUŻEJ", why: "Miasto na start, potem można dołożyć wyspę i zrobić z tego pełną podróż.", see: "Bangkok · Ayutthaya · południe Tajlandii" },
  { city: "Malediwy", country: "Malediwy", flag: "🇲🇻", airport: "MLE", dates: ["2026-12-27", "2027-01-06"], type: "DŁUŻEJ", why: "Wyjazd na naprawdę wyjątkowy początek roku — ocean, atol i totalny reset.", see: "atol · snorkeling · sandbank · ocean" },
  { city: "Dominikana", country: "Dominikana", flag: "🇩🇴", airport: "PUJ", dates: ["2026-12-26", "2027-01-07"], type: "DŁUŻEJ", why: "Tropiki, plaża i pełny urlop zamiast krótkiego wypadu.", see: "Punta Cana · Saona · plaże · wycieczki" },
  { city: "Meksyk", country: "Meksyk", flag: "🇲🇽", airport: "CUN", dates: ["2026-12-26", "2027-01-07"], type: "DŁUŻEJ", why: "Plaża, cenoty i możliwość połączenia wybrzeża z historią Majów.", see: "Riviera Maya · cenoty · Tulum · Chichén Itzá" },
  { city: "Mauritius", country: "Mauritius", flag: "🇲🇺", airport: "MRU", dates: ["2026-12-26", "2027-01-07"], type: "DŁUŻEJ", why: "Wyspa na dłuższy wyjazd, gdy chcesz zacząć rok od natury zamiast miasta.", see: "Le Morne · Chamarel · laguny · trekking" },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function nightsFromDates([from, to]: [string, string]) {
  return Math.max(1, Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00Z`));
}

function curatedEximLink(item: CuratedIdea) {
  const params = new URLSearchParams({
    destination: item.city,
    country: item.country,
    from: "WAW",
    nights: String(nightsFromDates(item.dates)),
  });
  return `/go/exim-best?${params.toString()}`;
}

export default function NewYearOffers() {
  const [live, setLive] = useState<Offer[]>([]);
  const [checkedAt, setCheckedAt] = useState<string>("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/today-offers?mode=newyear&provider=exim&refresh=${Date.now()}`, { cache: "no-store" });
        const data = (await response.json()) as ApiResponse;
        if (!active) return;
        setLive(Array.isArray(data.offers) ? data.offers : []);
        setCheckedAt(data.checkedAt || "");
      } catch {
        if (active) setLive([]);
      }
    };
    void load();
    const timer = window.setInterval(load, 10 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const liveByType = useMemo(() => ({
    city: live.filter((offer) => offer.nights >= 3 && offer.nights <= 6),
    longer: live.filter((offer) => offer.nights >= 7 && offer.nights <= 12),
  }), [live]);

  const merged = (type: "CITY BREAK" | "DŁUŻEJ") => {
    const curated = CURATED.filter((item) => item.type === type);
    const liveList = type === "CITY BREAK" ? liveByType.city : liveByType.longer;
    const liveKeys = new Set(liveList.map((offer) => normalize(`${offer.city} ${offer.country}`)));
    return {
      live: liveList,
      curated: curated.filter((item) => !liveKeys.has(normalize(`${item.city} ${item.country}`))),
    };
  };

  const renderSection = (type: "CITY BREAK" | "DŁUŻEJ") => {
    const data = merged(type);
    const isCity = type === "CITY BREAK";
    return (
      <section className="section shell" id={isCity ? "city-break" : "dluzsze"}>
        <div className="section-heading newyear-heading">
          <div>
            <div className="kicker">{isCity ? "CITY BREAK 3–6 NOCY" : "DŁUŻSZE 7–12 NOCY"}</div>
            <h2>{isCity ? "Krótko, intensywnie i z konkretnym planem" : "Ciepło, egzotyka i wyjazdy, dla których warto wziąć więcej wolnego"}</h2>
            <p>{isCity ? "Miks naszych selekcji i aktualnych pakietów na przełom roku." : "Łączymy nasze kierunki z aktualnymi pakietami, żeby dać dużo więcej niż trzy inspiracje."}</p>
          </div>
          {checkedAt && <span className="newyear-live-note">Aktualne pakiety sprawdzamy automatycznie</span>}
        </div>

        <div className="seasonal-grid newyear-expanded-grid">
          {data.live.map((offer) => (
            <article className="seasonal-card newyear-card newyear-live-card" key={`live-${offer.id}`}>
              <div className="newyear-card-media">
                <TravelImage city={offer.city} country={offer.country} alt={`${offer.city} na Sylwestra`} overrideSrc={offer.image}/>
              </div>
              <div className="seasonal-card-body">
                <div className="newyear-price-row"><h2>{offer.city}</h2><strong>od {offer.price.toLocaleString("pl-PL")} zł/os.</strong></div>
                <div className="seasonal-meta"><span>📅 {offer.dates}</span><span>🌙 {offer.nights} nocy</span></div>
                <p><b>{offer.hotel}</b>{offer.board ? ` · ${offer.board}` : ""}</p>
                <p>{offer.reason}</p>
                <div className="seasonal-actions">
                  <a className="newyear-primary-cta" href={offer.affiliateUrl || "#"} target="_blank" rel="sponsored noopener noreferrer">Zobacz tę ofertę →</a>
                </div>
              </div>
            </article>
          ))}

          {data.curated.map((item) => (
            <article className="seasonal-card newyear-card" key={`curated-${item.city}`}>
              <div className="newyear-card-media">
                <TravelImage city={item.city} country={item.country} alt={`${item.city} na Sylwestra`} overrideSrc={item.image}/>
              </div>
              <div className="seasonal-card-body">
                <h2>{item.city}</h2>
                <div className="seasonal-meta"><span>📅 {formatShortDate(item.dates[0])} → {formatShortDate(item.dates[1])}</span><span>🌙 {nightsFromDates(item.dates)} nocy</span></div>
                <p>{item.why}</p>
                <p><b>Co połączyć:</b> {item.see}</p>
                <div className="seasonal-actions">
                  <a className="newyear-primary-cta" href={curatedEximLink(item)} target="_blank" rel="sponsored noopener noreferrer">Sprawdź aktualne pakiety →</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };

  return <>{renderSection("CITY BREAK")}{renderSection("DŁUŻEJ")}</>;
}
