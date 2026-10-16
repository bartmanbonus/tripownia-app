import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminSocialWeekPlanner from "@/components/AdminSocialWeekPlanner";
import AdminAccessGate from "@/components/AdminAccessGate";

export const metadata = {
  title: "Planner treści | Tripownia.pl",
  robots: { index: false, follow: false },
};

export default function AdminSocialPage() {
  return (
    <AdminAccessGate allowReviewer>
    <main>
      <SiteHeader/>
      <section className="shell hub-page admin-page social-admin-page">
        <div className="kicker">TRIPOWNIA SOCIAL STUDIO</div>
        <h1>Planner treści</h1>
        <p className="hub-lead">
          Codziennie dostępny jest przegląd aktualnych ofert, tekstów i istniejących grafik. Publikacja wymaga osobnych uprawnień administratora. Maksymalnie jedna pozycja to perłka lotnicza, a pozostałe oferty różnią się kierunkiem i typem wyjazdu. Najpierw zatwierdzasz, potem publikujesz według godzin w planie.
        </p>
        <AdminSocialWeekPlanner/>
      </section>
      <SiteFooter/>
    </main>
    </AdminAccessGate>
  );
}
