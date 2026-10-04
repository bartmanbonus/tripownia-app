import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";
import OfferAlternativeJump from "@/components/OfferAlternativeJump";

export const metadata: Metadata = {
  title: "Jezioro Garda 12–15.11.2026 — lot + hotel od 869 zł/os. | Tripownia",
  description: "Długi weekend listopadowy nad Jeziorem Garda: Hotel Porto Azzurro w Sirmione, 3 noce ze śniadaniem, loty do Bergamo z Krakowa, Warszawy Chopina lub Modlina od 869 zł/os.",
  robots: { index: false, follow: true },
};

const eskyUrl = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms[0][adults]=2&datesTab=flexDates&departureDate=2026-11-11&returnDate=2026-11-15&stayLength=3:4&departurePlaces=ap-KRK,ap-WAW,ap-WMI&context=pl-packages&sort[TotalPrice]=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=2dcfeeb4-c744-471d-84eb-23cda4ed1d7e&fmg_filter=2mp&packageId=MjYxMTEyOjM6cGw6MTY3NTkw&flightOptionId=S1JLQkdZMjYxMTEyNzh8fEZSODg5OjA6MCxCR1lLUksyNjExMTU3OEl8fEZSODg4OjA6MQ&departureCode=KRK&arrivalCode=BGY&checkInDate=2026-11-12&checkOutDate=2026-11-15&destinationDepartureDate=2026-11-12&returnArrivalDate=2026-11-15&metaCode=167590&pricePresentation=perpax&selectedDeparturePlaces=ap-KRK,ap-WAW,ap-WMI";

export default function GardaOfferPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="kicker">CITY BREAK · DŁUGI WEEKEND LISTOPADOWY</div>
        <h1>Jezioro Garda od 869 zł/os.</h1>
        <p style={{ maxWidth: 820 }}>
          12–15 listopada 2026 · 3 noce · Hotel Porto Azzurro ★★★ w Sirmione ·
          śniadania · bezpośrednie loty do Bergamo. Wybierz wylot z Krakowa, Warszawy Chopina
          albo Warszawy Modlin.
        </p>

        <div className="detail-grid" style={{ marginTop: 28 }}>
          <div>
            <div className="offer-decision-box" style={{ minHeight: 360, display: "grid", alignContent: "center", gap: 12 }}>
              <small>DŁUGI WEEKEND WE WŁOSZECH</small>
              <strong>Jezioro Garda</strong>
              <span>Sirmione · Hotel Porto Azzurro ★★★ · ocena 4,6/5</span>
              <div style={{ marginTop: 16, fontSize: 46, fontWeight: 900 }}>od 869 zł/os.</div>
            </div>
          </div>

          <div>
            <div className="offer-facts">
              <div><small>Termin</small><strong>12–15.11.2026</strong></div>
              <div><small>Pobyt</small><strong>3 noce</strong></div>
              <div><small>Wyżywienie</small><strong>Śniadania</strong></div>
              <div><small>Hotel</small><strong>Porto Azzurro ★★★</strong></div>
              <div><small>Kraków Balice</small><strong>od 869 zł/os.</strong></div>
              <div><small>Warszawa Chopina</small><strong>od 1039 zł/os.</strong></div>
              <div><small>Warszawa Modlin</small><strong>od 1129 zł/os.</strong></div>
              <div><small>Przylot</small><strong>Bergamo</strong></div>
            </div>

            <div className="detail-action-box" style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <TrackedPartnerLink
                className="primary-cta"
                href={eskyUrl}
                partner="esky"
                offerId={869}
                destination="Jezioro Garda, Sirmione"
                price={869}
                placement="social_garda_869"
              >
                Sprawdź ofertę →
              </TrackedPartnerLink>
              <OfferAlternativeJump />
              <small className="booking-note">
                Cena została sprawdzona 4 października 2026 i jest dynamiczna.
                Po przejściu do rezerwacji możesz zmienić wariant lotu między Krakowem,
                Warszawą Chopina i Warszawą Modlin. Finalną cenę potwierdza partner.
              </small>
            </div>
          </div>
        </div>

        <OfferAlternativeFinder
          city="Sirmione"
          country="Włochy"
          nights={3}
          board="Śniadania"
          departure="Kraków / Warszawa Chopina / Warszawa Modlin"
          airportCode="BGY"
          dates="12–15 listopada 2026"
          hotel="Hotel Porto Azzurro"
        />
      </section>
      <SiteFooter />
    </main>
  );
}
