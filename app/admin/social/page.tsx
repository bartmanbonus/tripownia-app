import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminSocialCenter from "@/components/AdminSocialCenter";

export const metadata = {
  title: "Social Center | Tripownia.pl",
  robots: { index: false, follow: false },
};

export default function AdminSocialPage() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell hub-page admin-page social-admin-page">
        <div className="kicker">TRIPOWNIA SOCIAL CENTER</div>
        <h1>Oferty gotowe do pokazania na Facebooku</h1>
        <p className="hub-lead">
          To nie jest CMS strony. Tutaj wybierasz aktualną ofertę Tripownii, generujesz gotowy post,
          oglądasz jego podgląd i przechodzisz bezpośrednio do publikacji na Facebooku.
        </p>
        <AdminSocialCenter/>
      </section>
      <SiteFooter/>
    </main>
  );
}
