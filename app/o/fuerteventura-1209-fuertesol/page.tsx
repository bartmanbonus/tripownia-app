import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";

export const metadata: Metadata = {
  title: "Fuerteventura 22–25.11.2026 — 3 noce od 1209 zł/os. | Tripownia",
  description: "Fuerteventura z Krakowa: 3 noce w Fuertesol Bungalows od 1209 zł/os. Oferta EXIM Tours sprawdzona 2.10.2026.",
  robots: { index: false, follow: true },
};

const eximUrl = "https://www.exim.pl/kierunki/hiszpania/fuerteventura/caleta-de-fuste/casthotels-fuertesol-bungalows?KEY=MjI2MzE1MXwzMzA1MTMxNzQ5fDEzMTc4MzA&DS=1024&GIATA=30855&D=74459&HID=420923&MT=6&DI=GT06-AO&NN=3&MNN=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&NNM=0%7C1%7C2%7C3%7C4%7C5%7C6%7C7%7C8%7C9%7C10%7C11%7C12%7C13%7C14%7C15%7C16%7C17%7C18%7C19%7C20%7C21&DF=2026-11-15%7C2026-12-09&RD=2026-11-25&DD=2026-11-22&ERM=0&AC1=2&KC1=0&IC1=0&TO=1825&TT=1&PID=420923&DPR=EXIM+TOURS+POLAND&PC=3-2026-11-22&IFC=RlJ8OTgzNnwyMDI2LTExLTI1VDExOjMw&OFC=RlJ8OTgzN3wyMDI2LTExLTIyVDA2OjAw&utm_term=feed&tduid=1c28f57c22c93726771b26b5ccaac104&utm_source=Tradedoubler_3487177&utm_medium=Affiliate&utm_campaign=Ongoing_P_TD";

export default function FuerteventuraOfferPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="kicker">WAKACJE · OKAZJA TRIPOWNI</div>
        <h1>Fuerteventura od 1209 zł/os.</h1>
        <p style={{ maxWidth: 760 }}>
          22–25 listopada 2026 · 3 noce · wylot z Krakowa · Fuertesol Bungalows
          w Caleta de Fuste. Krótki wypad na Wyspy Kanaryjskie w cenie od 1209 zł za osobę.
        </p>

        <div className="detail-grid" style={{ marginTop: 28 }}>
          <div>
            <img
              src="https://img.exim.pl/hotels/300/spanelsko/fuerteventura/caleta-de-fuste/fuertesol/6335/cd2546520116fca0983fca6d3d0b335a_282053056-244.jpg"
              alt="Fuertesol Bungalows, Fuerteventura"
              style={{ width: "100%", borderRadius: 28, display: "block" }}
            />
          </div>

          <div>
            <div className="offer-decision-box">
              <small>CENA OD</small>
              <strong>1209 zł/os.</strong>
              <span>
                Cena została sprawdzona 2 października 2026. Dostępność i finalną kwotę
                potwierdza EXIM Tours po przejściu do rezerwacji.
              </span>
            </div>

            <div className="offer-facts" style={{ marginTop: 18 }}>
              <div><small>Termin</small><strong>22–25.11.2026</strong></div>
              <div><small>Pobyt</small><strong>3 noce</strong></div>
              <div><small>Wylot</small><strong>Kraków</strong></div>
              <div><small>Hotel</small><strong>Fuertesol Bungalows</strong></div>
              <div><small>Miejsce</small><strong>Caleta de Fuste</strong></div>
              <div><small>Kierunek</small><strong>Fuerteventura, Hiszpania</strong></div>
            </div>

            <div className="detail-action-box" style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <TrackedPartnerLink
                className="primary-cta"
                href={eximUrl}
                partner="exim"
                offerId={1209}
                destination="Fuerteventura"
                price={1209}
                placement="social_fuerteventura_1209_fuertesol"
              >
                Sprawdź ofertę →
              </TrackedPartnerLink>
              <small className="booking-note">
                Rezerwacja odbywa się u partnera. Cena jest dynamiczna i może się zmienić.
              </small>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
