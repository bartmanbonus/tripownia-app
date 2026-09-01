import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminOfferAudit from "@/components/AdminOfferAudit";
import AdminOfferEditor from "@/components/AdminOfferEditor";
import AdminPublishPanel from "@/components/AdminPublishPanel";
import AdminSocialDrafts from "@/components/AdminSocialDrafts";
import { offers, getLinkMatch } from "@/lib/offers";
import { getOfferQualityIssues } from "@/lib/offerQuality";

export const metadata = {
  title: "Panel administracyjny | Tripownia.pl",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const offersNeedingReview = offers.filter(offer => getOfferQualityIssues(offer).some(issue => issue.severity !== "low")).length;
  const expiredOffers = offers.filter(offer => offer.availabilityStatus === "expired").length;
  const exactLinks = offers.filter(offer => getLinkMatch(offer) === "exact").length;
  return (
    <main>
      <SiteHeader/>
      <section className="shell hub-page admin-page">
        <div className="kicker">TRIPOWNIA CONTROL CENTER</div>
        <h1>CMS ofert, publikacja i sprzedaż</h1>
        <p className="hub-lead">
          Tu kontrolujemy to, co użytkownik faktycznie zobaczy: cenę, partnera, typ linku,
          kompletność danych i przypisanie zdjęcia. Panel może działać bez Supabase —
          wersje robocze zapisujemy lokalnie, a publikację można wysłać do repozytorium GitHub
          i wdrożyć przez Vercel.
        </p>
        <div className="admin-alert">
          <strong>Najważniejsza zasada:</strong>
          <span>Oferta bez konkretnego deeplinku albo daty sprawdzenia ceny nie może udawać oferty live.</span>
        </div>
        <div className="admin-panel admin-social-entry">
          <div className="admin-panel-head">
            <div>
              <h2>Posty na Facebooka</h2>
              <p>Osobny moduł do wybierania aktualnych ofert, generowania postów i otwierania publikacji na Facebooku.</p>
            </div>
            <a className="primary-cta compact" href="/admin/social">Otwórz Social Center →</a>
          </div>
        </div>

        <div className="admin-panel admin-tracking-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Tracking klików afiliacyjnych</h2>
              <p>Każde wyjście przez przyciski zakupowe zapisuje zdarzenie <code>tripownia_affiliate_click</code> po stronie serwera.</p>
            </div>
          </div>
          <div className="admin-tracking-grid">
            <div><small>PARTNER</small><strong>eSky / Kiwi / Booking / Wakacje / EXIM</strong><span>rozpoznawany przy każdym kliknięciu</span></div>
            <div><small>ŹRÓDŁO CTA</small><strong>search / oferta / mobile</strong><span>widać, skąd użytkownik przeszedł</span></div>
            <div><small>KIERUNEK / OFERTA</small><strong>ID + destination</strong><span>pozwala porównać skuteczność konkretnych okazji</span></div>
          </div>
          <div className="admin-local-warning">
            <span><strong>Gdzie są dane?</strong> W logach Functions/Runtime projektu Vercel wyszukaj frazę <code>tripownia_affiliate_click</code>. To jest tracking serwerowy — nie znika po zamknięciu przeglądarki użytkownika. Do wykresów i stałej historii w panelu potrzebujemy później bazy lub narzędzia analitycznego.</span>
          </div>
        </div>

        <div className="admin-panel">
          <AdminPublishPanel/>
        </div>
        <div className="admin-panel">
          <AdminOfferEditor/>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-head"><div><h2>Social automaty</h2><p>Wybierz ofertę, wygeneruj gotowy post i opublikuj dopiero po sprawdzeniu ceny oraz linku.</p></div></div>
          <AdminSocialDrafts/>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>Audyt ofert</h2>
              <p>Filtruj problemy, otwieraj oba końce linku i eksportuj listę do poprawy.</p>
            </div>
          </div>
          <AdminOfferAudit/>
        </div>
      </section>
      <SiteFooter/>
    </main>
  );
}
