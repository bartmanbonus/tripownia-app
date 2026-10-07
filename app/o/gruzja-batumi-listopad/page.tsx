import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";
import OfferAlternativeJump from "@/components/OfferAlternativeJump";

export const metadata: Metadata = {
  title: "Gruzja na długi weekend listopadowy | Tripownia",
  description: "Batumi, 12–16 listopada 2026, 4 noce, wylot z Warszawy. Orbi Luxury Apartments i pakiet lot + hotel.",
  robots: { index: false, follow: true },
};

const eskyUrl = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&departureDate=2026-11-11&returnDate=2026-11-15&stayLength=3:4&departurePlaces=ap-WAW,ap-WMI,ap-WRO&context=pl-packages&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=8b582486-79aa-4190-b0ce-4e064db040dd&packageId=MjYxMTEyOjQ6cGw6NjYxMTgw&flightOptionId=V0FXS1VUMjYxMTEyMjIzLjE3M3x8VzYxNTc1OjA6MCxLVVRXQVcyNjExMTYyMjNJLjE3M3x8VzYxNTc2OjA6MQ&departureCode=WAW&arrivalCode=KUT&checkInDate=2026-11-12&checkOutDate=2026-11-16&destinationDepartureDate=2026-11-12&returnArrivalDate=2026-11-16&metaCode=661180&pricePresentation=perpax&selectedDeparturePlaces=ap-WAW,ap-WMI,ap-WRO";

export default function GeorgiaNovemberOfferPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="kicker">CITY BREAK · DŁUGI WEEKEND LISTOPADOWY</div>
        <h1>Gruzja zamiast listopadowej kanapy 🇬🇪</h1>
        <p style={{ maxWidth: 760 }}>
          12–16 listopada 2026 · 4 noce · wylot z Warszawy do Kutaisi · pobyt w Batumi.
          Pakiet lot + hotel z pobytem w Orbi Luxury Apartments.
        </p>

        <div className="detail-grid" style={{ marginTop: 28 }}>
          <div>
            <img
              src="https://static.esky.com/image/hp_661180_a5e3a0645d50_111066548115710682.jpg?format=webp&quality=75&size=1200x"
              alt="Orbi Luxury Apartments w Batumi"
              style={{ width: "100%", borderRadius: 28, display: "block" }}
            />
          </div>
          <div>
            <div className="offer-decision-box">
              <small>AKTUALNA CENA</small>
              <strong>Sprawdź aktualną cenę</strong>
              <span>
                Cena pakietu jest dynamiczna. Po kliknięciu zobaczysz aktualną cenę tej konkretnej konfiguracji.
              </span>
            </div>

            <div className="offer-facts" style={{ marginTop: 18 }}>
              <div><small>Termin</small><strong>12–16.11.2026</strong></div>
              <div><small>Pobyt</small><strong>4 noce</strong></div>
              <div><small>Wylot</small><strong>Warszawa</strong></div>
              <div><small>Przylot</small><strong>Kutaisi</strong></div>
              <div><small>Nocleg</small><strong>Orbi Luxury Apartments</strong></div>
              <div><small>Miejsce</small><strong>Batumi</strong></div>
            </div>

            <div className="detail-action-box" style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <TrackedPartnerLink
                className="primary-cta"
                href={eskyUrl}
                partner="esky"
                offerId={661180}
                destination="Batumi, Gruzja"
                price={0}
                placement="social_georgia_november_2026"
              >
                Sprawdź aktualną ofertę →
              </TrackedPartnerLink>
              <OfferAlternativeJump />
            </div>
          </div>
        </div>

        <OfferAlternativeFinder
          city="Batumi"
          country="Gruzja"
          nights={4}
          board="Bez wyżywienia"
          departure="Warszawa"
          airportCode="WAW"
          dates="12–16 listopada 2026"
          hotel="Orbi Luxury Apartments"
        />
      </section>
      <SiteFooter />
    </main>
  );
}
