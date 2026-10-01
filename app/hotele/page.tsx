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

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function HotelsPage({ searchParams }: Props) {
  const params = await searchParams;
  const destination = first(params.q || params.destination).trim();
  const origin = first(params.origin).trim();
  const from = first(params.from).trim();
  const to = first(params.to).trim();
  const hasRange = /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to);

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
          <SearchHub embedded initialTab="Hotele" initialDestinations={destination ? [destination] : []} initialAirports={origin ? [origin] : []} initialDateMode="range" initialDateFrom={hasRange ? from : ""} initialDateTo={hasRange ? to : ""} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
