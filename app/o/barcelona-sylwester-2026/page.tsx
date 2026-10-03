import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Moon, Plane } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AffiliateOfferLink from "@/components/AffiliateOfferLink";

const slug = "barcelona-sylwester-2026";
const target = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&departureDate=2026-12-29&returnDate=2027-01-02&stayLength=4:4&departurePlaces=ap-WAW,ap-WMI&arrivalPlaces=ci-BCN&context=pl-packages&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=86ff5632-a69a-4df8-9b5a-b135797fdc90&packageId=MjYxMjI5OjQ6cGw6MjIwNTUw&flightOptionId=V0FXQkNOMjYxMjI5MjIzLjE3M3x8VzYxNDc1OjA6MCxCQ05XQVcyNzAxMDIyMjNJLjE3M3x8VzYxNDc2OjA6MQ&departureCode=WAW&arrivalCode=BCN&checkInDate=2026-12-29&checkOutDate=2027-01-02&destinationDepartureDate=2026-12-29&returnArrivalDate=2027-01-02&metaCode=220550&pricePresentation=perpax&selectedDeparturePlaces=ap-WAW,ap-WMI";

const tracked = new URLSearchParams({
  target,
  partner: "esky",
  source: "social_offer",
  page: `/o/${slug}`,
  offer: slug,
  destination: "Barcelona, Hiszpania",
  landing: `/o/${slug}`,
});

const affiliateHref = `/go/live?${tracked.toString()}`;

export const metadata: Metadata = {
  title: { absolute: "Sylwester w Barcelonie | Tripownia.pl" },
  description: "Barcelona na Sylwestra: 29 grudnia 2026 – 2 stycznia 2027, 4 noce, wylot z Warszawy. Sprawdź konkretny pakiet lot + hotel.",
  alternates: { canonical: `/o/${slug}` },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "Tripownia",
    locale: "pl_PL",
    url: `/o/${slug}`,
    title: "Sylwester w Barcelonie",
    description: "29.12.2026–02.01.2027 • 4 noce • Warszawa • lot + hotel",
    images: [{ url: "/images/destinations/barcelona.jpg", width: 1600, height: 1000, alt: "Barcelona — Tripownia.pl" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sylwester w Barcelonie",
    description: "29.12.2026–02.01.2027 • 4 noce • Warszawa • lot + hotel",
    images: ["/images/destinations/barcelona.jpg"],
  },
};

export default function BarcelonaNewYearOfferPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17}/> Zobacz wszystkie okazje</Link>
        </div>

        <section className="detail-hero">
          <div className="detail-image">
            <Image
              src="/images/destinations/barcelona.jpg"
              alt="Barcelona, Hiszpania"
              className="detail-photo-img"
              width={1600}
              height={1000}
              sizes="(max-width: 760px) 100vw, 50vw"
              priority
            />
            <span className="badge hot">SYLWESTER 2026/2027</span>
          </div>

          <div className="detail-copy">
            <div className="eyebrow">Hiszpania</div>
            <h1>Sylwester w Barcelonie</h1>

            <div className="detail-topline">
              <div className="detail-score">
                <BadgeCheck size={18}/>
                <span>Konkretny pakiet lot + hotel</span>
              </div>
            </div>

            <div className="detail-price-card">
              <div className="detail-price">
                <small>aktualna cena</small> <strong>sprawdź u partnera</strong>
              </div>
              <div className="price-status detail-price-status">
                Link prowadzi do wskazanego pakietu eSky z afiliacją Tripowni.
              </div>
            </div>

            <p className="detail-lead"><strong>Barcelona na przełom roku 2026/2027</strong></p>

            <div className="detail-meta">
              <span><Plane/> <b>Warszawa → Barcelona</b></span>
              <span><Moon/> <b>4 noce</b></span>
              <span><CalendarDays/> <b>29 grudnia 2026 – 2 stycznia 2027</b></span>
              <span><MapPin/> <b>Barcelona, Hiszpania</b></span>
            </div>

            <div className="detail-source">
              Najpierw oglądasz ofertę w Tripowni. Po kliknięciu „Sprawdź ofertę” przechodzisz do konkretnego pakietu eSky. Rezerwacja i płatność odbywają się bezpośrednio u partnera.
            </div>

            <div className="detail-action-box">
              <AffiliateOfferLink
                href={affiliateHref}
                partner="eSky"
                slug={slug}
                destination="Barcelona, Hiszpania"
                tripKind="package"
                departure="Warszawa"
                hotel="Pakiet lot + hotel eSky"
                board="Według wybranej oferty"
                nights={4}
                start="2026-12-29"
                end="2027-01-02"
              />
              <small className="affiliate-note">Link partnerski. Możemy otrzymać prowizję bez dodatkowego kosztu dla Ciebie.</small>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
