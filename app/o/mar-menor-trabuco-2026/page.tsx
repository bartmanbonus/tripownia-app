import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Moon, Plane, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AffiliateOfferLink from "@/components/AffiliateOfferLink";

const slug = "mar-menor-trabuco-2026";
const target = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=months&departureDate=2026-10-05&returnDate=2026-10-31&stayLength=4:5&departurePlaces=ap-KRK&arrivalPlaces=re-879,co-ES&mustIncludeWeekend=true&context=pl-packages&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=60cc465c-0874-412f-b94f-acc1c9ccdbaf&packageId=MjYxMDMxOjQ6cGw6MjIyNDEz&flightOptionId=S1JLQUxDMjYxMDMxNzh8fEZSNjM1NTowOjAsQUxDS1JLMjYxMTA0NzhJfHxGUjYzNTY6MDox&departureCode=KRK&arrivalCode=ALC&checkInDate=2026-10-31&checkOutDate=2026-11-04&destinationDepartureDate=2026-10-31&returnArrivalDate=2026-11-04&metaCode=222413&pricePresentation=perpax&selectedDeparturePlaces=ap-KRK";

const tracked = new URLSearchParams({
  target,
  partner: "esky",
  source: "social_offer",
  page: `/o/${slug}`,
  offer: slug,
  destination: "Santiago de la Ribera, Hiszpania",
  landing: `/o/${slug}`,
});

const affiliateHref = `/go/live?${tracked.toString()}`;

export const metadata: Metadata = {
  title: { absolute: "Mar Menor z Krakowa | Tripownia.pl" },
  description: "31.10–04.11.2026 • 4 noce • Kraków → Alicante • Hotel Trabuco • pakiet lot + hotel.",
  alternates: { canonical: `/o/${slug}` },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "Tripownia",
    locale: "pl_PL",
    url: `/o/${slug}`,
    title: "Mar Menor z Krakowa — 4 noce w Hiszpanii",
    description: "31.10–04.11.2026 • Hotel Trabuco • lot + hotel",
    images: [{ url: "/images/destinations/alicante.jpg", width: 1600, height: 1000, alt: "Hiszpania — Tripownia.pl" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mar Menor z Krakowa — 4 noce w Hiszpanii",
    description: "31.10–04.11.2026 • Hotel Trabuco • lot + hotel",
    images: ["/images/destinations/alicante.jpg"],
  },
};

export default function MarMenorTrabucoOfferPage() {
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
              src="/images/destinations/alicante.jpg"
              alt="Hiszpania, Costa Cálida"
              className="detail-photo-img"
              width={1600}
              height={1000}
              sizes="(max-width: 760px) 100vw, 50vw"
              priority
            />
            <span className="badge hot">CITY BREAK</span>
          </div>

          <div className="detail-copy">
            <div className="eyebrow">Hiszpania</div>
            <h1>Mar Menor • Hotel Trabuco</h1>

            <div className="detail-topline">
              <div className="detail-score">
                <BadgeCheck size={18}/>
                <span>Konkretny pakiet lot + hotel</span>
              </div>
            </div>

            <div className="detail-price-card">
              <div className="detail-price">
                <small>cena jest dynamiczna</small> <strong>sprawdź u partnera</strong>
              </div>
              <div className="price-status detail-price-status">
                Link prowadzi do wskazanego pakietu eSky z afiliacją Tripowni.
              </div>
            </div>

            <p className="detail-lead"><strong>Hotel Trabuco, Santiago de la Ribera</strong></p>

            <div className="detail-meta">
              <span><Plane/> <b>Kraków → Alicante</b></span>
              <span><Moon/> <b>4 noce</b></span>
              <span><CalendarDays/> <b>31 października – 4 listopada 2026</b></span>
              <span><Utensils/> <b>Opcje ze śniadaniem lub HB</b></span>
              <span><MapPin/> <b>Santiago de la Ribera, Mar Menor</b></span>
            </div>

            <div className="detail-source">
              Najpierw oglądasz ofertę w Tripowni. Po kliknięciu „Sprawdź ofertę” przechodzisz do konkretnego pakietu eSky. Rezerwacja i płatność odbywają się bezpośrednio u partnera.
            </div>

            <div className="detail-action-box">
              <AffiliateOfferLink
                href={affiliateHref}
                partner="eSky"
                slug={slug}
                destination="Santiago de la Ribera, Hiszpania"
                tripKind="package"
                departure="Kraków"
                hotel="Hotel Trabuco"
                board="Opcje BB/HB"
                nights={4}
                start="2026-10-31"
                end="2026-11-04"
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
