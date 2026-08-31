import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminOfferAudit from "@/components/AdminOfferAudit";

export const metadata = { title: "Panel administracyjny | Tripownia.pl" };

export default function AdminPage() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell hub-page admin-page">
        <div className="kicker">TRIPOWNIA CONTROL CENTER</div>
        <h1>Kontrola ofert i jakości danych</h1>
        <p className="hub-lead">
          Tu kontrolujemy to, co użytkownik faktycznie zobaczy: cenę, partnera, typ linku,
          kompletność danych i przypisanie zdjęcia. To jest panel operacyjny v1 — jeszcze
          bez zapisu do wspólnej bazy. Edycję i publikowanie jednym kliknięciem podłączymy
          po spięciu Supabase.
        </p>
        <div className="admin-alert">
          <strong>Najważniejsza zasada:</strong>
          <span>Oferta bez konkretnego deeplinku albo daty sprawdzenia ceny nie może udawać oferty live.</span>
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
