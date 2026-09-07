import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeoEximOffers from "@/components/SeoEximOffers";
import { partners } from "@/lib/partners";
import { getSeoLanding, seoLandings } from "@/lib/seoLandings";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return seoLandings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLanding(slug);
  if (!page) return {};

  return {
    title: `${page.title} | Tripownia.pl`,
    description: page.lead,
    alternates: { canonical: `/podroze/${page.slug}` },
    openGraph: {
      title: `${page.title} | Tripownia.pl`,
      description: page.lead,
      type: "website",
      url: `/podroze/${page.slug}`,
    },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoLanding(slug);
  if (!page) notFound();

  const bookingUrl = partners.booking.buildUrl(
    `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(page.query)}`
  );

  const kiwiDeep = new URL("https://www.kiwi.com/deep");
  kiwiDeep.searchParams.set("from", "WAW");
  kiwiDeep.searchParams.set("to", page.kiwiCode || "anywhere");
  kiwiDeep.searchParams.set("sort", "price");
  kiwiDeep.searchParams.set("asc", "1");
  kiwiDeep.searchParams.set("currency", "PLN");
  kiwiDeep.searchParams.set("locale", "pl");

  const kiwiUrl = partners.kiwi.buildUrl(kiwiDeep.toString());

  return (
    <main>
      <SiteHeader />
      <BreadcrumbSchema items={[
        { name: "Tripownia", url: "https://tripownia.pl/" },
        { name: "Pomysły na podróże", url: "https://tripownia.pl/podroze" },
        { name: page.title, url: `https://tripownia.pl/podroze/${page.slug}` },
      ]}/>

      <section className="seo-landing-hero">
        <div className="shell">
          <div className="kicker">{page.eyebrow}</div>
          <h1>{page.title}</h1>
          <p>{page.lead}</p>
          <div className="seo-hero-actions">
            <Link className="primary-cta" href="/#wyszukiwarka">Ustaw własne parametry →</Link>
            <a className="secondary-cta" href="#aktualne-oferty">Zobacz oferty</a>
          </div>
        </div>
      </section>

      <section className="shell seo-offer-section" id="aktualne-oferty">
        <div className="section-heading">
          <div>
            <div className="kicker">AKTUALNE OFERTY</div>
            <h2>Najlepsze dostępne propozycje dla tego kierunku</h2>
            <p>
              Pobieramy bieżące produkty, ceny i terminy automatycznie. Każda karta prowadzi bezpośrednio do konkretnej oferty.
            </p>
          </div>
        </div>
        <SeoEximOffers
          query={page.query}
          departure={page.departure}
          minNights={page.minNights}
          maxNights={page.maxNights}
          maxPrice={page.maxPrice}
        />
      </section>

      <section className="shell seo-partners-section">
        <div className="section-heading">
          <div>
            <div className="kicker">SZUKAJ SZERZEJ</div>
            <h2>Porównaj aktualne ceny</h2>
          </div>
        </div>
        <div className="big-partner-grid">
          <a href={kiwiUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🛫</span><strong>Loty</strong><small>Porównaj ceny</small><b>Porównaj →</b></a>
          <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🏨</span><strong>Noclegi</strong><small>Noclegi w wybranym miejscu</small><b>Sprawdź hotele →</b></a>
        </div>
      </section>

      <section className="shell seo-copy-section">
        <div className="kicker">WARTO WIEDZIEĆ</div>
        <h2>{page.title}</h2>
        {page.paragraphs.map((text) => <p key={text}>{text}</p>)}
        <p>
          Ceny i dostępność zmieniają się dynamicznie. Tripownia pokazuje zapisane propozycje
          i prowadzi dalej dopiero wtedy, gdy chcesz sprawdzić aktualną cenę przed zakupem.
        </p>
      </section>

      <section className="shell seo-related-block">
        <div className="kicker">MOŻE CIĘ TEŻ ZAINTERESOWAĆ</div>
        <div className="seo-related-links">
          {seoLandings.filter(item => item.slug !== page.slug).slice(0, 4).map(item => (
            <Link key={item.slug} href={`/podroze/${item.slug}`}>{item.title} →</Link>
          ))}
        </div>
        <div className="seo-related">
          <Link href="/podroze">← Wszystkie pomysły na podróże</Link>
          <Link href="/kierunki">Zobacz wszystkie kierunki →</Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
