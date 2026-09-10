import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminSocialWeekPlanner from "@/components/AdminSocialWeekPlanner";

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
          O 07:00 dostajesz świeży zestaw znaleziony tego samego dnia. Maksymalnie jedna pozycja to perłka lotnicza, a pozostałe oferty różnią się kierunkiem i typem wyjazdu. Najpierw zatwierdzasz, potem publikujesz według godzin w planie.
        </p>
        <AdminSocialWeekPlanner/>
      </section>
      <SiteFooter/>
    </main>
  );
}
