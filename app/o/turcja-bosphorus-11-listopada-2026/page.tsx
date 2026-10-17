import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Moon, Plane, Utensils, ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferHeroImage from "@/components/OfferHeroImage";
import { UNPRICED_SOCIAL_OFFERS } from "@/lib/unpricedSocialOffers";

const SLUG = "turcja-bosphorus-11-listopada-2026";
const PATH = `/o/${SLUG}`;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Turcja od 11 listopada — Bosphorus Sorgun | Tripownia.pl" },
  description: "Bosphorus Sorgun, Side. 11–18 listopada 2026, 7 noclegów, wylot z Wrocławia, Ultra All Inclusive. Sprawdź aktualną cenę i dostępność konkretnej oferty.",
  alternates: { canonical: PATH },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Tydzień w Turcji od 11 listopada | Tripownia.pl",
    description: "Side · Bosphorus Sorgun · 7 noclegów · Ultra All Inclusive · Wrocław",
    url: PATH,
    type: "website",
    locale: "pl_PL",
    images: [{ url: "/api/share-preview?design=logo-white-v1", width: 1200, height: 630, alt: "Tripownia.pl" }],
  },
};

export default function BosphorusSocialOfferPage() {
  const offer = UNPRICED_SOCIAL_OFFERS.find(item => item.slug === SLUG);
  if (!offer) notFound();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(new Date());
  const expired = offer.status === "expired" || offer.departureDateISO < today;
  const bookingHref = `/go/live?${new URLSearchParams({
    target: offer.affiliateUrl,
    partner: offer.partner,
    source: "social_offer",
    page: PATH,
    offer: offer.slug,
    destination: `${offer.city}, ${offer.country}`,
    landing: PATH,
  }).toString()}`;

  return (
    <main className="social-offer-page">
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/oferty-z-postow"><ArrowLeft size={17} /> Oferty z naszych postów</Link>
        </div>
        <section className="detail-hero">
          <OfferHeroImage city={offer.city} country={offer.country} src={offer.imageSrc} />
          <div className="detail-copy">
            <div className="eyebrow">TURCJA · RIWIERA TURECKA · SIDE</div>
            <h1>Turcja od 11 listopada</h1>
            <p className="detail-lead"><strong>{offer.hotel}</strong></p>
            <p>Tydzień wypoczynku z wylotem z Wrocławia. Poniżej znajdziesz parametry wyjazdu z posta i przejście do jego aktualnej oferty.</p>
            <div className="detail-meta">
              <span><CalendarDays size={18} /> <b>{offer.dates}</b></span>
              <span><Moon size={18} /> <b>{offer.nights} noclegów</b></span>
              <span><Plane size={18} /> <b>Wylot: {offer.departure}</b></span>
              <span><Utensils size={18} /> <b>{offer.board}</b></span>
            </div>
            {expired ? (
              <div className="detail-action-box">
                <p>Termin tej propozycji już minął. Zachowujemy ją jako archiwalną ofertę z posta.</p>
                <Link className="primary-cta" href="/okazje">Zobacz aktualne okazje</Link>
              </div>
            ) : (
              <div className="detail-action-box">
                <a className="primary-cta" href={bookingHref} rel="sponsored">Sprawdź aktualną cenę i dostępność</a>
                <small className="affiliate-note">Cena nie została potwierdzona — nie podajemy orientacyjnej kwoty. Aktualną cenę, godziny lotów, pokój, bagaż i zakres świadczeń sprawdzisz przed rezerwacją w Wakacje.pl.</small>
                <small className="affiliate-note">Link afiliacyjny Tripowni. Rezerwacja nie wiąże się z dodatkową opłatą od Tripowni.</small>
              </div>
            )}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
