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

export default function TravelIdeasPage() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell seo-hub-page">
        <div className="kicker">POMYSŁY NA WYJAZD</div>
        <h1>Znajdź podróż po kierunku, budżecie albo lotnisku</h1>
        <p className="hub-lead">
          To nie jest katalog artykułów. Każda strona prowadzi do aktualnych ofert Tripownii
          oraz wyszukiwania lotów, noclegów i pakietów u partnerów.
        </p>
        <div className="seo-link-grid">
          {seoLandings.map(item => (
            <Link href={`/podroze/${item.slug}`} key={item.slug}>
              <small>{item.eyebrow}</small>
              <strong>{item.title}</strong>
              <span>{item.lead}</span>
              <b>Zobacz aktualne oferty →</b>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
