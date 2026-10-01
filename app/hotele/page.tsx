import type { Metadata } from "next";
import { BedDouble, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SearchHub from "@/components/SearchHub";

export const metadata: Metadata = {
  title: "Hotele i noclegi – wyszukiwarka",
  description: "Znajdź nocleg do swojej podróży bez wychodzenia od razu z Tripowni. Wybierz kierunek, termin i dopiero potem przejdź do aktualnej dostępności.",
  alternates: { canonical: "/hotele" },
};

export default function HotelsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">NOCLEG</div>
        <h1>Najpierw wybierz miejsce. Potem konkretny hotel.</h1>
        <p className="hub-lead">
          Wyszukaj kierunek w Tripowni i dopiero po ustawieniu miejsca przejdź do aktualnych noclegów. Bez przypadkowego wyjścia z serwisu po kliknięciu samego „Hotele”.
        </p>

        <div className="service-signal-row" aria-label="Jak wybierać hotel">
          <div><MapPin size={19}/><strong>Lokalizacja</strong><span>Sprawdź odległość od miejsc, do których naprawdę będziesz jeździć.</span></div>
          <div><ShieldCheck size={19}/><strong>Warunki</strong><span>Porównaj anulację, śniadanie, podatki i finalną cenę.</span></div>
          <div><CheckCircle2 size={19}/><strong>Decyzja</strong><span>Rezerwuj dopiero po sprawdzeniu całego kosztu pobytu.</span></div>
        </div>

        <div className="service-search-shell">
          <SearchHub embedded initialTab="Hotele" />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
