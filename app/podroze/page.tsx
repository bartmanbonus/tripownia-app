import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { allSeoLandings } from "@/lib/allSeoLandings";

export const metadata: Metadata = {
  title: "Pomysły na podróże i tanie wyjazdy",
  description: "City breaki, wakacje, All Inclusive, tanie loty, last minute i wyjazdy z polskich lotnisk. Wybierz temat i przejdź do aktualnych ofert.",
  alternates: { canonical: "/podroze" },
};

const landingVisuals: Record<string, { image: string; region: string; type: string; nights: string }> = {
  "malta-z-warszawy": { image: "/images/destinations/valletta.jpg", region: "Europa", type: "City break", nights: "3–7 nocy" },
  "rzym-z-warszawy": { image: "/images/destinations/rzym.jpg", region: "Europa", type: "City break", nights: "2–5 nocy" },
  "barcelona-z-warszawy": { image: "/images/destinations/barcelona.jpg", region: "Europa", type: "City break", nights: "3–5 nocy" },
  "cypr-z-warszawy": { image: "/images/destinations/pafos.jpg", region: "Europa", type: "Wakacje", nights: "5–10 nocy" },
  "madera-z-warszawy": { image: "/images/destinations/madera.jpg", region: "Europa", type: "Aktywnie", nights: "5–10 nocy" },
  "teneryfa-z-warszawy": { image: "/images/destinations/teneryfa.jpg", region: "Europa", type: "Wakacje", nights: "5–10 nocy" },
  "city-break-do-1000-zl": { image: "/images/destinations/praga.jpg", region: "Budżet", type: "City break", nights: "2–4 noce" },
  "city-break-do-1500-zl": { image: "/images/destinations/lizbona.jpg", region: "Budżet", type: "City break", nights: "2–5 nocy" },
  "all-inclusive-z-warszawy": { image: "/images/destinations/marsa-alam.jpg", region: "Afryka", type: "All Inclusive", nights: "7–14 nocy" },
  "egzotyka-zima": { image: "/images/destinations/dubaj.jpg", region: "Egzotyka", type: "Daleka podróż", nights: "7–14 nocy" },
  "last-minute-z-warszawy": { image: "/images/destinations/djerba.jpg", region: "Okazje", type: "Last minute", nights: "5–10 nocy" },
  "wakacje-z-krakowa": { image: "/images/destinations/rodos.jpg", region: "Europa", type: "Wakacje", nights: "5–10 nocy" },
};

function fallbackVisual(slug: string) {
  if (slug.includes("do-2000") || slug.includes("do-2500")) return { image: "/images/destinations/djerba.jpg", region: "Budżet", type: "Dobra cena", nights: "5–10 nocy" };
  if (slug.startsWith("tanie-loty")) return { image: "/images/destinations/barcelona.jpg", region: "Loty", type: "Tanie loty", nights: "2–10 nocy" };
  if (slug.startsWith("last-minute")) return { image: "/images/destinations/djerba.jpg", region: "Okazje", type: "Last minute", nights: "5–10 nocy" };
  if (slug.startsWith("all-inclusive")) return { image: "/images/destinations/marsa-alam.jpg", region: "Wakacje", type: "All Inclusive", nights: "7–14 nocy" };
  if (slug.startsWith("city-break")) return { image: "/images/destinations/rzym.jpg", region: "Europa", type: "City break", nights: "2–5 nocy" };
  return { image: "/images/destinations/rodos.jpg", region: "Wakacje", type: "Wakacje", nights: "5–10 nocy" };
}

function cleanTitle(title: string) {
  return title.replace(" z Warszawy — ", " — ").replace(" z Warszawy", "");
}

export default function TravelIdeasPage() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell travel-hub-page">
        <div className="travel-hub-hero">
          <div>
            <div className="kicker">PODRÓŻE NA WYMIAR</div>
            <h1>Znajdź podróż po kierunku, budżecie albo lotnisku.</h1>
            <p>Każda karta prowadzi do konkretnego pomysłu, aktualnych ofert i dalszego wyszukiwania lotów, noclegów albo gotowych pakietów.</p>
          </div>
          <Link href="/kierunki" className="travel-hub-all"><span>✈</span>Zobacz wszystkie kierunki<b>→</b></Link>
        </div>

        <div className="travel-hub-search-row">
          <Link href="/#szukaj-samodzielnie" className="travel-hub-search"><span aria-hidden="true">⌕</span><strong>Wpisz kierunek, miasto albo hotel, np. Nowy Jork, Wietnam, Resort 4★</strong></Link>
          <Link href="/#szukaj-samodzielnie" className="travel-hub-weekend"><span className="travel-hub-check">✓</span><span><strong>Pobyt obejmuje sobotę i niedzielę</strong><small>Jesteś na miejscu w oba dni</small></span></Link>
        </div>

        <div className="travel-hub-filters" aria-label="Kategorie podróży">
          <span className="active">🌐 Wszystkie</span><span>✈ Tanie loty</span><span>⚡ Last minute</span><span>▦ City break</span><span>△ Wakacje</span><span>◉ All Inclusive</span>
        </div>

        <div className="travel-hub-grid">
          {allSeoLandings.map((item) => {
            const visual = landingVisuals[item.slug] || fallbackVisual(item.slug);
            return (
              <Link className="travel-hub-card" href={`/podroze/${item.slug}`} key={item.slug}>
                <div className="travel-hub-card-image">
                  <img src={visual.image} alt={item.query} loading="lazy" decoding="async" />
                  <span className="travel-hub-region">{visual.region}</span>
                  <span className="travel-hub-heart" aria-hidden="true">♡</span>
                </div>
                <div className="travel-hub-card-body">
                  <strong>{cleanTitle(item.title)}</strong>
                  <p>{item.lead}</p>
                  <div className="travel-hub-card-meta"><span>✈ {visual.type}</span><span>▣ {visual.nights}</span><b>→</b></div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="travel-hub-trust">
          <div><i>◉</i><span><strong>Sprawdzone kierunki</strong><small>Tylko miejsca, które polecamy</small></span></div>
          <div><i>◇</i><span><strong>Dobre ceny</strong><small>Oferty z zaufanych partnerów</small></span></div>
          <div><i>♢</i><span><strong>Bezpieczne podróże</strong><small>Praktyczne wskazówki i porady</small></span></div>
          <div><i>◎</i><span><strong>Inspiracje na cały rok</strong><small>Weekend, wakacje i wielkie podróże</small></span></div>
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
