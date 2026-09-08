import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { seoLandings } from "@/lib/seoLandings";

export const metadata: Metadata = {
  title: "Pomysły na podróże i tanie wyjazdy | Tripownia.pl",
  description: "City breaki, wakacje, All Inclusive, egzotyka i wyjazdy z polskich lotnisk. Wybierz temat i przejdź do aktualnych ofert.",
  alternates: { canonical: "/podroze" },
};

const landingImages: Record<string, { src: string; label: string }> = {
  "malta-z-warszawy": { src: "/images/destinations/valletta.jpg", label: "Malta" },
  "rzym-z-warszawy": { src: "/images/destinations/rzym.jpg", label: "Rzym" },
  "barcelona-z-warszawy": { src: "/images/destinations/barcelona.jpg", label: "Barcelona" },
  "cypr-z-warszawy": { src: "/images/destinations/pafos.jpg", label: "Cypr" },
  "madera-z-warszawy": { src: "/images/destinations/madera.jpg", label: "Madera" },
  "teneryfa-z-warszawy": { src: "/images/destinations/teneryfa.jpg", label: "Teneryfa" },
  "city-break-do-1000-zl": { src: "/images/destinations/praga.jpg", label: "City break" },
  "city-break-do-1500-zl": { src: "/images/destinations/lizbona.jpg", label: "City break" },
  "all-inclusive-z-warszawy": { src: "/images/destinations/marsa-alam.jpg", label: "All Inclusive" },
  "egzotyka-zima": { src: "/images/destinations/dubaj.jpg", label: "Egzotyka zimą" },
  "last-minute-z-warszawy": { src: "/images/destinations/djerba.jpg", label: "Last Minute" },
  "wakacje-z-krakowa": { src: "/images/destinations/rodos.jpg", label: "Wakacje z Krakowa" },
};

export default function TravelIdeasPage() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell seo-hub-page">
        <div className="kicker">POMYSŁY NA WYJAZD</div>
        <h1>Znajdź podróż po kierunku, budżecie albo lotnisku</h1>
        <p className="hub-lead">
          To nie jest katalog artykułów. Każda strona prowadzi do aktualnych ofert Tripownii
          oraz samodzielnego wyszukiwania lotów, noclegów i pakietów.
        </p>
        <div className="seo-link-grid seo-link-grid-visual">
          {seoLandings.map(item => {
            const image = landingImages[item.slug];
            return (
              <Link href={`/podroze/${item.slug}`} key={item.slug}>
                {image ? (
                  <div className="seo-link-image">
                    <img src={image.src} alt={image.label} loading="lazy" decoding="async" />
                    <span>{image.label}</span>
                  </div>
                ) : null}
                <div className="seo-link-content">
                  <small>{item.eyebrow}</small>
                  <strong>{item.title}</strong>
                  <span>{item.lead}</span>
                  <b>Zobacz aktualne oferty →</b>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
