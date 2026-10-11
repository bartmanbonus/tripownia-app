import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferHeroImage from "@/components/OfferHeroImage";
import OfferJourney from "@/components/OfferJourney";

const slug = "paryz-provinces-opera-1169";
const path = `/o/${slug}`;
const affiliateUrl = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&departureDate=2027-02-13&returnDate=2027-02-15&stayLength=2:2&departurePlaces=ap-WAW,ap-WMI&arrivalPlaces=ci-PAR&context=pl-packages&metaCode=121507&departureCode=WMI&checkInDate=2027-02-13&checkOutDate=2027-02-15&destinationDepartureDate=2027-02-13&returnArrivalDate=2027-02-15&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=65aa3d76-0372-4fbe-8f40-3e3909e09c9b&fmg_filter=2mp&packageId=MjcwMjEzOjI6cGw6MTIxNTA3&flightOptionId=V01JQlZBMjcwMjEzNzh8fEZSMTg4ODowOjAsQlZBV01JMjcwMjE1NzhJfHxGUjE4ODk6MDox&arrivalCode=BVA&pricePresentation=perpax&selectedDeparturePlaces=ap-WAW,ap-WMI";

export const metadata: Metadata = {
  title: { absolute: "Paryż na walentynki: lot + hotel ze śniadaniami od 1169 zł/os. | Tripownia.pl" },
  description: "13–15 lutego 2027, 2 noce w Hotel Vacances Bleues Provinces Opéra, śniadania i lot Warszawa–Modlin ↔ Paryż–Beauvais. Sprawdź cenę i dostępność.",
  alternates: { canonical: path },
  robots: { index: false, follow: true },
  openGraph: { type: "website", siteName: "Tripownia", locale: "pl_PL", url: path,
    title: "Paryż na walentynki od 1169 zł/os.",
    description: "13–15.02.2027 · lot + 2 noce · śniadania · Warszawa–Modlin",
    images: [{ url: "/images/destinations/paryz.jpg", alt: "Paryż — ilustracja kierunku" }] },
};

export default async function ParisOffer({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const tracking = new URLSearchParams({ target: affiliateUrl, partner: "esky", source: "social_offer", page: path,
    offer: slug, destination: "Paryż, Francja", price: "1169", landing: path });
  for (const [input, output] of [["utm_source", "utmSource"], ["utm_medium", "utmMedium"], ["utm_campaign", "utmCampaign"], ["utm_content", "utmContent"]]) {
    const raw = query[input]; const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) tracking.set(output, value);
  }
  const expired = Date.now() >= Date.parse("2027-02-13T00:00:00+01:00");
  return <main className="social-offer-page offer-journey-page">
    <SiteHeader />
    <div className="shell">
      <div className="offer-detail-top"><Link href="/oferty-z-postow">Wszystkie oferty z social mediów</Link></div>
      <OfferJourney offerId={slug} destination="Paryż" partner="esky" price={1169} source="social_offer" />
      <section className="detail-hero">
        <OfferHeroImage city="Paryż" country="Francja" src="/images/destinations/paryz.jpg" />
        <div className="detail-copy">
          <div className="eyebrow">Francja · City break</div>
          <h1>Paryż na walentynki</h1>
          <p className="detail-lead"><strong>Hotel Vacances Bleues Provinces Opéra</strong></p>
          <div className="detail-price-card">
            <div className="detail-price"><small>cena z oferty od</small> <strong>1169 zł</strong> / os.</div>
            <div className="price-status detail-price-status">Cena zapisana 11 października 2026 dla 2 dorosłych w 1 pokoju. Aktualna cena i dostępność są potwierdzane przed rezerwacją.</div>
          </div>
          <dl style={{ display: "grid", gridTemplateColumns: "minmax(90px,1fr) minmax(0,2fr)", gap: 12, margin: "24px 0" }}>
            <dt>Termin</dt><dd>13–15 lutego 2027</dd>
            <dt>Pobyt</dt><dd>2 noce · 2 osoby · 1 pokój</dd>
            <dt>Lot</dt><dd>Warszawa–Modlin ↔ Paryż–Beauvais</dd>
            <dt>Wyżywienie</dt><dd>Śniadania</dd>
            <dt>Pakiet dla 2 osób</dt><dd>2338 zł według zapisanej ceny, przed ewentualnymi dodatkami</dd>
          </dl>
          <div className="detail-action-box">{expired
            ? <Link className="primary-cta" href="/okazje">Zobacz aktualne okazje</Link>
            : <a className="primary-cta" href={`/go/live?${tracking.toString()}`} rel="sponsored" data-partner-exit="1" data-affiliate-source="social_offer" data-sales-partner="esky" data-sales-offer-id={slug} data-sales-price="1169" data-sales-destination="Paryż, Francja">Sprawdź aktualną cenę →</a>}
          </div>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>Przed płatnością sprawdź godziny lotów, bagaż, warunki zmian, dojazd z lotniska Beauvais i ewentualne opłaty lokalne. Ich zakres nie został potwierdzony w zapisie oferty. Zdjęcie ilustruje kierunek, nie widok z hotelu.</p>
        </div>
      </section>
    </div>
    <SiteFooter />
  </main>;
}
