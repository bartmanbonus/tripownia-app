import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminOfferAudit from "@/components/AdminOfferAudit";
import AdminOfferEditor from "@/components/AdminOfferEditor";
import AdminPublishPanel from "@/components/AdminPublishPanel";
import { offers } from "@/lib/offers";
import { getOfferQualityIssues } from "@/lib/offerQuality";

export const metadata = {
  title: "Panel administracyjny | Tripownia.pl",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const offersNeedingReview = offers.filter(offer => getOfferQualityIssues(offer).some(issue => issue.severity !== "low")).length;
  const expiredOffers = offers.filter(offer => offer.availabilityStatus === "expired").length;
  const exactLinks = offers.filter(offer => offer.linkMatch === "exact").length;
  return (
    <main>
      <SiteHeader/>
      <section className="shell hub-page admin-page">
        <div className="kicker">TRIPOWNIA CONTROL CENTER</div>
        <h1>Kontrola ofert i jakości danych</h1>
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
        <div className="admin-panel">
          <AdminPublishPanel/>
        </div>
        <div className="admin-panel">
          <AdminOfferEditor/>
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
