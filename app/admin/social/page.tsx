import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminSocialCenter from "@/components/AdminSocialCenter";

export const metadata = {
  title: "Planner treści | Tripownia.pl",
  robots: { index: false, follow: false },
};

export default function AdminSocialPage() {
  return (
    <main>
      <SiteHeader/>
      <section className="shell hub-page admin-page social-admin-page">
        <div className="kicker">TRIPOWNIA SOCIAL STUDIO</div>
        <h1>Planner treści</h1>
        <p className="hub-lead">
          Automat przygotowuje post na podstawie aktualnej oferty, ale niczego nie publikuje samodzielnie.
          Najpierw widzisz zdjęcie i pełną treść, możesz ją poprawić, a dopiero potem zatwierdzić i opublikować na Facebooku oraz Instagramie.
        </p>
        <AdminSocialCenter/>
      </section>
      <SiteFooter/>
    </main>
  );
}
