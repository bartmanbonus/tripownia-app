import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferCard from "@/components/OfferCard";
import { offers } from "@/lib/offers";
import { buildEskyFlightsUrl, buildEskyPackagesUrl, partners } from "@/lib/partners";
import { getSeoLanding, seoLandings } from "@/lib/seoLandings";

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

function normalize(value: string) {
  return value.toLocaleLowerCase("pl");
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoLanding(slug);
  if (!page) notFound();

  const active = offers
    .filter((offer) => offer.availabilityStatus !== "expired")
    .filter((offer) => {
      if (page.maxPrice && offer.price > page.maxPrice) return false;
      if (page.minNights && offer.nights < page.minNights) return false;
      if (page.maxNights && offer.nights > page.maxNights) return false;
      if (page.departure && !normalize(offer.departure).includes(normalize(page.departure))) return false;

      const haystack = normalize(
        `${offer.city} ${offer.country} ${offer.hotel} ${offer.reason} ${offer.category.join(" ")}`
      );
      const cityMatch = !page.cityKeywords?.length || page.cityKeywords.some((keyword) => haystack.includes(normalize(keyword)));
      const categoryMatch = !page.categoryKeywords?.length || page.categoryKeywords.some((keyword) => haystack.includes(normalize(keyword)));

      if (page.cityKeywords?.length && page.categoryKeywords?.length) return cityMatch || categoryMatch;
      return cityMatch && categoryMatch;
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

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
  const eskyFlights = buildEskyFlightsUrl(
    `https://www.esky.pl/tanie-loty/?to=${encodeURIComponent(page.query)}`
  );
  const eskyPackage = buildEskyPackagesUrl();

  return (
    <main>
      <SiteHeader />

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
            <div className="kicker">AKTUALNIE W TRIPOWNI</div>
            <h2>{active.length ? "Oferty, które pasują do tego wyszukiwania" : "Sprawdź aktualne ceny u partnerów"}</h2>
            <p>
              {active.length
                ? "Pokazujemy tylko aktywne propozycje z naszej aktualnej bazy."
                : "Nie mamy dziś zapisanej oferty dokładnie dla tych parametrów, więc nie pokazujemy losowych kart."}
            </p>
          </div>
        </div>
        {active.length > 0 && (
          <div className="cards-grid">
            {active.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}
      </section>

      <section className="shell seo-partners-section">
        <div className="section-heading">
          <div>
            <div className="kicker">SZUKAJ SZERZEJ</div>
            <h2>Porównaj aktualne ceny</h2>
          </div>
        </div>
        <div className="big-partner-grid">
          <a href={eskyFlights} target="_blank" rel="sponsored noopener noreferrer"><span>✈️</span><strong>Loty eSky</strong><small>{page.query}</small><b>Sprawdź loty →</b></a>
          <a href={kiwiUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🛫</span><strong>Kiwi.com</strong><small>Sortowanie od najniższej ceny</small><b>Porównaj →</b></a>
          <a href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🏨</span><strong>Booking.com</strong><small>Noclegi: {page.query}</small><b>Sprawdź hotele →</b></a>
          <a href={eskyPackage} target="_blank" rel="sponsored noopener noreferrer"><span>🧳</span><strong>eSky Lot + Hotel</strong><small>Pakiety podróżnicze</small><b>Sprawdź pakiety →</b></a>
        </div>
      </section>

      <section className="shell seo-copy-section">
        <div className="kicker">WARTO WIEDZIEĆ</div>
        <h2>{page.title}</h2>
        {page.paragraphs.map((text) => <p key={text}>{text}</p>)}
        <p>
          Ceny i dostępność zmieniają się dynamicznie. Tripownia pokazuje zapisane propozycje
          i prowadzi do partnera, u którego zawsze potwierdzasz aktualną cenę przed zakupem.
        </p>
      </section>

      <section className="shell seo-related">
        <Link href="/podroze">← Wszystkie pomysły na podróże</Link>
        <Link href="/kierunki">Zobacz wszystkie kierunki →</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
