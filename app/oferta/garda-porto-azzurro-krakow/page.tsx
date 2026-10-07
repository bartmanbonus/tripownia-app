import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Moon, Plane, Utensils } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";

const ESKY_URL = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&departureDate=2026-11-11&returnDate=2026-11-15&stayLength=3:4&departurePlaces=ap-KRK,ap-WAW,ap-WMI&context=pl-packages&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=2dcfeeb4-c744-471d-84eb-23cda4ed1d7e&fmg_filter=2mp&packageId=MjYxMTEyOjM6cGw6MTY3NTkw&flightOptionId=S1JLQkdZMjYxMTEyNzh8fEZSODg5OjA6MCxCR1lLUksyNjExMTU3OEl8fEZSMzUwNDowOjE&departureCode=KRK&arrivalCode=BGY&checkInDate=2026-11-12&checkOutDate=2026-11-15&destinationDepartureDate=2026-11-12&returnArrivalDate=2026-11-15&metaCode=167590&pricePresentation=perpax&selectedDeparturePlaces=ap-KRK,ap-WAW,ap-WMI&destinationArrivalDate=2026-11-12&returnDepartureDate=2026-11-15&refreshToken=1791395629045";

export const metadata: Metadata = {
  title: "Jezioro Garda z Krakowa — Hotel Porto Azzurro | Tripownia.pl",
  description: "Konkretny pakiet lot + hotel: Kraków → Bergamo, 12–15 listopada 2026, 3 noce w Hotelu Porto Azzurro 3★ w Sirmione nad jeziorem Garda.",
  alternates: { canonical: "/oferta/garda-porto-azzurro-krakow" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Jezioro Garda z Krakowa — 3 noce | Tripownia.pl",
    description: "12–15 listopada 2026 • Hotel Porto Azzurro 3★ • lot + hotel",
    url: "/oferta/garda-porto-azzurro-krakow",
    type: "website",
  },
};

export default function GardaPortoAzzurroKrakowOfferPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17} /> Wróć do okazji</Link>
        </div>

        <section className="detail-hero">
          <div className="detail-image">
            <TravelImage
              city="Sirmione"
              country="Włochy"
              alt="Sirmione i jezioro Garda"
              className="detail-photo-img"
              searchQuery="Sirmione Lake Garda Italy"
              preferDynamic
            />
            <span className="badge">WYBRANE PRZEZ TRIPOWNIĘ</span>
          </div>

          <div className="detail-copy">
            <div className="eyebrow">🇮🇹 Włochy • Jezioro Garda</div>
            <h1>Sirmione / Jezioro Garda</h1>

            <div className="detail-price-card">
              <div className="detail-price">
                <small>lot + hotel</small> <strong>Sprawdź aktualną cenę</strong>
              </div>
              <div className="price-status detail-price-status">
                Cena i dostępność są potwierdzane na bieżąco po przejściu do eSky.
              </div>
            </div>

            <p className="detail-lead">
              Konkretny pakiet eSky: lot z Krakowa do Bergamo + 3 noce w Hotelu Porto Azzurro 3★ w Sirmione nad jeziorem Garda.
            </p>

            <div className="detail-meta">
              <span><Plane /> <b>Kraków</b></span>
              <span><Moon /> <b>3 noce</b></span>
              <span><Utensils /> <b>wyżywienie do wyboru u partnera</b></span>
              <span><MapPin /> <b>Hotel Porto Azzurro 3★</b></span>
              <span>📅 <b>12–15 listopada 2026</b></span>
            </div>

            <div className="booking-summary" aria-label="Najważniejsze elementy oferty">
              <div><small>Wylot</small><strong>Kraków (KRK)</strong></div>
              <div><small>Przylot</small><strong>Bergamo (BGY)</strong></div>
              <div><small>Termin</small><strong>12–15.11.2026</strong></div>
              <div><small>Pobyt</small><strong>3 noce</strong></div>
              <div><small>Hotel</small><strong>Porto Azzurro 3★</strong></div>
              <div><small>Wyżywienie</small><strong>do wyboru w eSky</strong></div>
            </div>

            <div className="offer-decision-box">
              <small>CO DOSTAJESZ PO KLIKNIĘCIU</small>
              <strong>Dokładnie tę konfigurację wyjazdu w eSky.</strong>
              <span>Tripownia pokazuje ofertę i jej najważniejsze parametry. Rezerwację i płatność finalizujesz dopiero u partnera.</span>
            </div>

            <div className="detail-source">
              <strong>Tripownia wybiera i porównuje. Partner finalizuje płatność.</strong>
              {" "}Link prowadzi do konkretnego pakietu z wylotem z Krakowa i datami 12–15 listopada 2026.
            </div>

            <div className="detail-action-box">
              <TrackedPartnerLink
                className="primary-cta"
                href={ESKY_URL}
                partner="esky"
                offerId={167590}
                destination="Sirmione / Jezioro Garda"
                price={0}
                placement="offer_detail_primary"
                returnContext={{
                  departure: "Kraków",
                  hotel: "Hotel Porto Azzurro 3★",
                  board: "do wyboru u partnera",
                  nights: 3,
                  start: "2026-11-12",
                  end: "2026-11-15",
                }}
              >
                Przejdź do rezerwacji <ExternalLink size={18} />
              </TrackedPartnerLink>
              <small className="booking-note">
                Cena, dostępność, wariant pokoju i wyżywienia mogą zmienić się do momentu rezerwacji. Sprawdź finalne warunki przed płatnością.
              </small>
            </div>
          </div>
        </section>
      </div>

      <div className="mobile-booking-bar">
        <div><small>Lot + hotel z Krakowa</small><strong>12–15.11.2026</strong></div>
        <TrackedPartnerLink
          href={ESKY_URL}
          partner="esky"
          offerId={167590}
          destination="Sirmione / Jezioro Garda"
          price={0}
          placement="offer_detail_mobile_bar"
          returnContext={{
            departure: "Kraków",
            hotel: "Hotel Porto Azzurro 3★",
            board: "do wyboru u partnera",
            nights: 3,
            start: "2026-11-12",
            end: "2026-11-15",
          }}
        >
          Sprawdź cenę <ExternalLink size={16} />
        </TrackedPartnerLink>
      </div>

      <SiteFooter />
    </main>
  );
}
