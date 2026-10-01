import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, TicketCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Atrakcje i bilety w podróży",
  description: "Znajdź atrakcje, bilety i wycieczki dopiero po wyborze kierunku. Tripownia pomaga przejść od planu podróży do konkretnych aktywności.",
  alternates: { canonical: "/atrakcje" },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function AttractionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = first(params.q).trim();

  let outboundHref = "";
  if (query) {
    const destination = new URL("https://www.getyourguide.pl/s/");
    destination.searchParams.set("q", query);
    const tracked = partners.getyourguide.buildUrl(destination.toString());
    const out = new URLSearchParams({
      url: tracked,
      source: "attractions_page",
      destination: query,
    });
    outboundHref = `/out/getyourguide?${out.toString()}`;
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell service-page">
        <div className="kicker">NA MIEJSCU</div>
        <h1>Atrakcje dopiero wtedy, gdy wiesz dokąd jedziesz.</h1>
        <p className="hub-lead">
          Wpisz miasto lub region. Tripownia nie wyrzuca Cię z menu na obcą stronę — najpierw wybierasz kierunek, potem świadomie przechodzisz do aktualnych biletów i wycieczek.
        </p>

        <form className="service-destination-search" action="/atrakcje" method="get">
          <label htmlFor="attractions-destination"><MapPin size={17}/> Gdzie jedziesz?</label>
          <div>
            <input id="attractions-destination" name="q" defaultValue={query} placeholder="np. Rzym, Madera, Bangkok" autoComplete="off" />
            <button type="submit">Znajdź atrakcje <ArrowRight size={16}/></button>
          </div>
        </form>

        {query && (
          <section className="service-result-card">
            <div>
              <div className="kicker">WYBRANY KIERUNEK</div>
              <h2>{query}</h2>
              <p>Sprawdź bilety, wycieczki i aktywności. Przed zakupem porównaj godzinę, miejsce zbiórki i zasady anulacji.</p>
            </div>
            <a className="primary-cta" href={outboundHref} target="_blank" rel="sponsored noopener noreferrer">
              Pokaż aktualne atrakcje <TicketCheck size={17}/>
            </a>
          </section>
        )}

        <div className="experience-signals-grid" aria-label="Jak wybierać atrakcje">
          <div className="experience-signal"><span>1</span><strong>Najpierw plan dnia</strong><small>Nie kupuj atrakcji, które kolidują ze sobą godzinowo.</small></div>
          <div className="experience-signal"><span>2</span><strong>Sprawdź lokalizację</strong><small>Policz realny dojazd z hotelu i między punktami.</small></div>
          <div className="experience-signal"><span>3</span><strong>Czytaj warunki</strong><small>Zwrot, pogoda, język przewodnika i miejsce spotkania.</small></div>
          <div className="experience-signal"><Sparkles size={19}/><strong>Dodaj do planu</strong><small>Zapisz atrakcję później w swojej podróży.</small></div>
        </div>

        <div className="deals-end-cta">
          <div><strong>Masz już kupioną atrakcję?</strong><span>Dodaj ją do planu dnia i trzymaj bilety, godziny oraz notatki w jednym miejscu.</span></div>
          <Link href="/moja-podroz">Otwórz Moją podróż <ArrowRight size={16}/></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
