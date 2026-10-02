import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";

export const metadata: Metadata = {
  title: "Budapeszt 16–19.10.2026 — lot + 3 noce od 572 zł/os. | Tripownia",
  description: "Składany city break Tripowni: lot Warszawa–Budapeszt z Kiwi + 3 noce w GoodWind Apartments z Booking.com. Cena od 572 zł/os. przy cenie członkowskiej Genius.",
  robots: { index: false, follow: true },
};

const kiwiUrl = "https://www.kiwi.com/en/search/results/warsaw-poland/budapest-hungary/2026-10-16/2026-10-19?adults=2&shmarker=740301.TRIPOWNIAPL";
const bookingUrl = "https://www.booking.com/hotel/hu/goodwind-aparthotel.pl.html?aid=818288&checkin=2026-10-16&checkout=2026-10-19&group_adults=2&no_rooms=1&group_children=0";

export default function BudapestOfferPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="kicker">CITY BREAK · OFERTA SKŁADANA TRIPOWNI</div>
        <h1>Budapeszt od 572 zł/os.</h1>
        <p style={{ maxWidth: 760 }}>
          16–19 października 2026 · 3 noce · wylot z Warszawy. Łączymy tani lot z Kiwi
          i nocleg z Booking.com w jedną prostą propozycję.
        </p>

        <div className="detail-grid" style={{ marginTop: 28 }}>
          <div>
            <img
              src="/images/destinations/budapeszt.jpg"
              alt="Budapeszt nad Dunajem"
              style={{ width: "100%", borderRadius: 28, display: "block" }}
            />
          </div>
          <div>
            <div className="offer-decision-box">
              <small>ŁĄCZNY KOSZT OD</small>
              <strong>572 zł/os.</strong>
              <span>
                Wyliczenie dla 2 osób: lot RT z Kiwi od ok. 47 USD/os. + GoodWind Apartments
                na 3 noce w cenie członkowskiej Booking Genius. Bez ceny członkowskiej koszt
                może być wyższy — sprawdź finalną cenę przed rezerwacją.
              </span>
            </div>

            <div className="offer-facts" style={{ marginTop: 18 }}>
              <div><small>Termin</small><strong>16–19.10.2026</strong></div>
              <div><small>Pobyt</small><strong>3 noce</strong></div>
              <div><small>Wylot</small><strong>Warszawa</strong></div>
              <div><small>Nocleg</small><strong>GoodWind Apartments</strong></div>
              <div><small>Ocena Booking</small><strong>8,6</strong></div>
              <div><small>Lokalizacja</small><strong>9,3</strong></div>
            </div>

            <div className="detail-action-box" style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <TrackedPartnerLink
                className="primary-cta"
                href={kiwiUrl}
                partner="kiwi"
                offerId={1000572}
                destination="Budapeszt"
                price={572}
                placement="social_budapest_572_flight"
              >
                Sprawdź lot w Kiwi →
              </TrackedPartnerLink>
              <TrackedPartnerLink
                className="primary-cta"
                href={bookingUrl}
                partner="booking"
                offerId={1000572}
                destination="Budapeszt"
                price={572}
                placement="social_budapest_572_hotel"
              >
                Sprawdź nocleg w Booking →
              </TrackedPartnerLink>
              <small className="booking-note">
                To nie jest gotowy pakiet touroperatora. Lot i nocleg rezerwujesz osobno.
                Ceny są dynamiczne i mogą zmienić się przed kliknięciem.
              </small>
            </div>
          </div>
        </div>
        <OfferAlternativeFinder
          city="Budapeszt"
          country="Węgry"
          nights={3}
          board="Bez wyżywienia"
          departure="Warszawa"
          airportCode="WAW"
          dates="16–19 października 2026"
          hotel="GoodWind Apartments"
        />
      </section>
      <SiteFooter />
    </main>
  );
}
