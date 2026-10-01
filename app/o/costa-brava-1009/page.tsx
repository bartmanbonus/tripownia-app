import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";

export const metadata: Metadata = {
  title: "Costa Brava 25–28.10.2026 — 3 noce od 1009 zł/os. | Tripownia",
  description: "Costa Brava z Warszawy-Modlin: 3 noce w Htop Amatista od 1009 zł/os. Oferta EXIM Tours zweryfikowana 1.10.2026.",
  robots: { index: false, follow: true },
};

const eximUrl = "https://reklamy.exim.pl/click?a(3487177)p(334260)product(103442-1092862_1093050)ttid(19)url(https%3A%2F%2Fwww.exim.pl%2Fkierunki%2Fhiszpania%2Fcosta-brava%2Flloret-de-mar%2Fh-top-amatista%3FKEY%3DMTc5NDAzNXwyMjgzMjY1MDAwfDEwOTMwNTA%26DS%3D1024%26GIATA%3D35816%26D%3D63242%26HID%3D445849%26MT%3D6%26DI%3DGT06-AO%26NN%3D3%26MNN%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26NNM%3D0%257C1%257C2%257C3%257C4%257C5%257C6%257C7%257C8%257C9%257C10%257C11%257C12%257C13%257C14%257C15%257C16%257C17%257C18%257C19%257C20%257C21%26DF%3D2026-10-18%257C2026-11-11%26RD%3D2026-10-28%26DD%3D2026-10-25%26ERM%3D0%26AC1%3D2%26KC1%3D0%26IC1%3D0%26TO%3D4380%26TT%3D1%26PID%3D445849%26DPR%3DEXIM%2BTOURS%2BPOLAND%26PC%3D3-2026-10-25%26IFC%3DVzZ8MTQxMnwyMDI2LTEwLTI4VDE1OjI1%26OFC%3DVzZ8MTQxMXwyMDI2LTEwLTI1VDExOjMw%26utm_term%3Dfeed)";

export default function CostaBravaOfferPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell" style={{ paddingTop: 36, paddingBottom: 56 }}>
        <div className="kicker">CITY BREAK · OKAZJA TRIPOWNI</div>
        <h1>Costa Brava od 1009 zł/os.</h1>
        <p style={{ maxWidth: 760 }}>
          25–28 października 2026 · 3 noce · wylot z Warszawy-Modlin · Htop Amatista.
          Krótki jesienny wypad nad Morze Śródziemne w cenie od 1009 zł za osobę.
        </p>

        <div className="detail-grid" style={{ marginTop: 28 }}>
          <div>
            <img
              src="https://img.exim.pl/hotels/720/spanelsko/costa-brava/lloret-de-mar/htop-amatista/0d9b0f15121c0dcd37bb47bdd0135409_htop_4.jpg"
              alt="Htop Amatista, Costa Brava"
              style={{ width: "100%", borderRadius: 28, display: "block" }}
            />
          </div>

          <div>
            <div className="offer-decision-box">
              <small>CENA OD</small>
              <strong>1009 zł/os.</strong>
              <span>
                Cena została sprawdzona 1 października 2026. Dostępność i finalną kwotę
                potwierdza EXIM Tours po przejściu do rezerwacji.
              </span>
            </div>

            <div className="offer-facts" style={{ marginTop: 18 }}>
              <div><small>Termin</small><strong>25–28.10.2026</strong></div>
              <div><small>Pobyt</small><strong>3 noce</strong></div>
              <div><small>Wylot</small><strong>Warszawa–Modlin</strong></div>
              <div><small>Hotel</small><strong>Htop Amatista</strong></div>
              <div><small>Wyżywienie</small><strong>Bez wyżywienia</strong></div>
              <div><small>Kierunek</small><strong>Costa Brava, Hiszpania</strong></div>
            </div>

            <div className="detail-action-box" style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <TrackedPartnerLink
                className="primary-cta"
                href={eximUrl}
                partner="exim"
                offerId={646081827}
                destination="Costa Brava"
                price={1009}
                placement="social_costa_brava_1009"
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
