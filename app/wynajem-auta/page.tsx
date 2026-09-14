import type { Metadata } from "next";
import { Car, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Wynajem auta na wakacje",
  description: "Sprawdź wynajem samochodu po wyborze kierunku i noclegu. Tripownia kieruje do sprawdzonego partnera i przypomina, co porównać przed rezerwacją.",
  alternates: { canonical: "/wynajem-auta" },
};

const checks = [
  "Depozyt, udział własny i zakres ubezpieczenia.",
  "Zasady paliwowe, limit kilometrów i opłaty dodatkowe.",
  "Miejsce odbioru auta względem lotniska lub hotelu.",
  "Wiek kierowcy, dodatkowego kierowcę i odbiór po godzinach.",
];

export default function CarRentalPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">NA MIEJSCU</div>
        <h1>Wynajem auta bez przypadkowego kliknięcia.</h1>
        <p className="hub-lead">Najpierw wybierz kierunek, termin i nocleg. Dopiero potem porównaj samochód pod realną trasę — inaczej łatwo zapłacić za auto, którego przez połowę wyjazdu nie potrzebujesz.</p>

        <div className="service-panel">
          <div>
            <div className="my-trip-card-head"><Car size={21} /><h2>Co sprawdzić przed rezerwacją?</h2></div>
            <ul>{checks.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>

          <div className="service-cta">
            <ShieldCheck size={24} />
            <strong>Sprawdź auta u partnera Tripowni</strong>
            <p>Przechodzisz przez centralny link afiliacyjny Tripowni. Cena i dostępność są potwierdzane u partnera przed rezerwacją.</p>
            <a href={partners.rentacar.buildUrl()} target="_blank" rel="sponsored noopener noreferrer">
              Porównaj samochody <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="experience-signals-grid" aria-label="Kiedy wynajem auta ma sens">
          <div className="experience-signal"><span>✓</span><strong>Road trip</strong><small>Kilka miejsc i częste zmiany noclegu.</small></div>
          <div className="experience-signal"><span>✓</span><strong>Wyspa</strong><small>Plaże i atrakcje daleko od hotelu.</small></div>
          <div className="experience-signal"><span>✓</span><strong>Słaby transport</strong><small>Mało połączeń poza głównymi miastami.</small></div>
          <div className="experience-signal"><CheckCircle2 size={19}/><strong>Plan przed zakupem</strong><small>Najpierw trasa, potem samochód.</small></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
