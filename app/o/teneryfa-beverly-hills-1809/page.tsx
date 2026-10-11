import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferHeroImage from "@/components/OfferHeroImage";
import OfferJourney from "@/components/OfferJourney";

const slug = "teneryfa-beverly-hills-1809";
const path = `/o/${slug}`;
const affiliateUrl = "https://www.exim.pl/kierunki/hiszpania/teneryfa/los-cristianos/ona-beverly-hills-suites?KEY=MjE4NzYxNXwzNTczMjMxMzA0fDEzMjEzNTY&DS=1024&GIATA=429808&D=74465&HID=457643&MT=6&DI=GT06-AO&NN=4&MNN=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&NNM=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&DF=2026-11-15%7C2026-12-10&RD=2026-11-26&DD=2026-11-22&ERM=0&AC1=2&KC1=0&IC1=0&TO=1825&TT=1&PID=457643&DPR=EXIM+TOURS+POLAND&PC=4-2026-11-22&IFC=RlJ8MjY1NHwyMDI2LTExLTI2VDEyOjA1&OFC=RlJ8MjY1NXwyMDI2LTExLTIyVDEzOjAw&utm_term=feed&tduid=c7d243284e2e1a9f478e3768f8d89c2b&utm_source=Tradedoubler_3487177&utm_medium=Affiliate&utm_campaign=Ongoing_P_TD";

export const metadata: Metadata = {
  title: { absolute: "Teneryfa: 4 noce z transferem i ubezpieczeniem od 1809 zł/os. | Tripownia.pl" },
  description: "22–26 listopada 2026 · Ona Beverly Hills Suites · wylot z Krakowa · transfer lotnisko–hotel–lotnisko i podstawowe ubezpieczenie w cenie.",
  alternates: { canonical: path },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "Tripownia",
    locale: "pl_PL",
    url: path,
    title: "Teneryfa od 1809 zł/os.",
    description: "22–26.11.2026 · 4 noce · Kraków · transfer i ubezpieczenie w cenie",
    images: [{ url: "/images/destinations/teneryfa.jpg", alt: "Teneryfa" }],
  },
};

export default async function TenerifeOffer({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const tracking = new URLSearchParams({
    target: affiliateUrl,
    partner: "exim",
    source: "social_offer",
    page: path,
    offer: slug,
    destination: "Teneryfa, Hiszpania",
    price: "1809",
    landing: path,
  });
  for (const [input, output] of [["utm_source", "utmSource"], ["utm_medium", "utmMedium"], ["utm_campaign", "utmCampaign"], ["utm_content", "utmContent"]]) {
    const raw = query[input];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) tracking.set(output, value);
  }

  const expired = Date.now() >= Date.parse("2026-11-22T00:00:00+01:00");

  return (
    <main className="social-offer-page offer-journey-page">
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top"><Link href="/oferty-z-postow">Wszystkie oferty z social mediów</Link></div>
        <OfferJourney offerId={slug} destination="Teneryfa" partner="exim" price={1809} source="social_offer" />
        <section className="detail-hero">
          <OfferHeroImage city="Teneryfa" country="Hiszpania" src="/images/destinations/teneryfa.jpg" />
          <div className="detail-copy">
            <div className="eyebrow">Hiszpania · Wyspy Kanaryjskie</div>
            <h1>Teneryfa</h1>
            <p className="detail-lead"><strong>Ona Beverly Hills Suites</strong></p>
            <div className="detail-price-card">
              <div className="detail-price"><small>cena z oferty od</small> <strong>1809 zł</strong> / os.</div>
              <div className="price-status detail-price-status">Cena dla 2 dorosłych zapisana 11 października 2026. Aktualna cena i dostępność są potwierdzane przed rezerwacją.</div>
            </div>
            <dl style={{ display: "grid", gridTemplateColumns: "minmax(100px,1fr) minmax(0,2fr)", gap: 12, margin: "24px 0" }}>
              <dt>Termin</dt><dd>22–26 listopada 2026</dd>
              <dt>Pobyt</dt><dd>4 noce · 2 osoby</dd>
              <dt>Wylot</dt><dd>Kraków</dd>
              <dt>Wyżywienie</dt><dd>Bez wyżywienia</dd>
              <dt>Transfer</dt><dd>Lotnisko–hotel–lotnisko w cenie</dd>
              <dt>Ubezpieczenie</dt><dd>Podstawowe w cenie</dd>
            </dl>
            <div className="detail-action-box">
              {expired
                ? <Link className="primary-cta" href="/okazje">Zobacz aktualne okazje</Link>
                : <a className="primary-cta" href={`/go/live?${tracking.toString()}`} rel="sponsored" data-partner-exit="1" data-affiliate-source="social_offer" data-sales-partner="exim" data-sales-offer-id={slug} data-sales-price="1809" data-sales-destination="Teneryfa, Hiszpania">Sprawdź aktualną cenę →</a>}
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, opacity: 0.8 }}>
              Przed płatnością sprawdź aktualne godziny lotów, bagaż, warunki ubezpieczenia i ewentualne opłaty lokalne. Cena oraz dostępność mogą się zmienić.
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
