import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Backpack, BookOpenCheck, BusFront, CircleCheckBig, FileCheck2, Landmark, Luggage, PlaneTakeoff, ShieldCheck, Smartphone, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Przed wyjazdem – checklista podróżna, dokumenty, bagaż i transfer",
  description: "Praktyczna checklista przed podróżą: dokumenty, odprawa, bagaż, ubezpieczenie, dojazd na lotnisko, transfer, eSIM, płatności i atrakcje.",
  alternates: { canonical: "/przed-wyjazdem" },
  openGraph: {
    title: "Przed wyjazdem – checklista podróżna | Tripownia.pl",
    description: "Co sprawdzić przed wyjazdem: dokumenty, bagaż, odprawa, transfer, internet, pieniądze i plan na miejscu.",
    url: "https://tripownia.pl/przed-wyjazdem",
  },
  robots: { index: true, follow: true },
};

const steps = [
  { icon: FileCheck2, title: "Dokumenty i wjazd", text: "Sprawdź ważność dokumentu, wymagania wjazdowe i aktualne komunikaty dla kraju docelowego.", href: "https://www.gov.pl/web/dyplomacja/informacje-dla-podrozujacych", external: true },
  { icon: PlaneTakeoff, title: "Odprawa i lot", text: "Zapisz numer rezerwacji, sprawdź godzinę odprawy i upewnij się, z którego lotniska oraz terminala lecisz.", href: "/poradniki" },
  { icon: Luggage, title: "Bagaż", text: "Zweryfikuj limit dla konkretnej taryfy, wymiary bagażu i zasady dotyczące płynów oraz jedzenia.", href: "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych" },
  { icon: ShieldCheck, title: "Ubezpieczenie", text: "Sprawdź koszty leczenia, ratownictwo, transport medyczny i wyłączenia odpowiedzialności.", href: "/ubezpieczenia" },
  { icon: BusFront, title: "Dojazd i transfer", text: "Zaplanuj dojazd na lotnisko i przejazd z lotniska do noclegu, szczególnie przy późnym przylocie.", href: "/transfery" },
  { icon: Smartphone, title: "Internet", text: "Sprawdź roaming, obsługę eSIM i przygotuj pakiet danych zanim będziesz potrzebować internetu po lądowaniu.", href: "/esim" },
  { icon: WalletCards, title: "Płatności", text: "Przygotuj zapasową metodę płatności, sprawdź walutę i nie polegaj na jednej karcie.", href: "/poradniki" },
  { icon: Landmark, title: "Atrakcje", text: "Zarezerwuj wcześniej tylko te miejsca, gdzie terminy naprawdę znikają. Resztę zostaw elastycznie.", href: "/atrakcje" },
];

const timeline = [
  ["7+ dni przed", "Dokumenty, ubezpieczenie, transfer, eSIM i najważniejsze atrakcje."],
  ["3 dni przed", "Pogoda, dojazd na lotnisko, limity bagażu i potwierdzenia rezerwacji."],
  ["24 h przed", "Odprawa online, boarding pass, pakowanie i zapisanie dokumentów offline."],
  ["W dniu wyjazdu", "Dokumenty, telefon, ładowarka, leki, karta i sprawdzenie statusu lotu."],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Jak przygotować się do podróży",
  description: "Checklista przygotowania do wyjazdu zagranicznego.",
  step: timeline.map(([name, text]) => ({ "@type": "HowToStep", name, text })),
};

export default function BeforeTripPage() {
  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="shell guides-hub before-trip-hub">
        <header className="guides-hero">
          <div className="guides-hero-icon"><Backpack size={28}/></div>
          <div>
            <div className="kicker">PRZED WYJAZDEM</div>
            <h1>Masz już wyjazd? Teraz ogarnij resztę.</h1>
            <p>Jedna checklista do rzeczy, o których najłatwiej zapomnieć: dokumenty, bagaż, odprawa, transfer, internet, płatności i plan na miejscu.</p>
          </div>
        </header>

        <nav className="guides-quick-links" aria-label="Skróty przed wyjazdem">
          <Link href="/organizer"><BookOpenCheck size={18}/><span>Organizer</span></Link>
          <Link href="/moja-podroz"><CircleCheckBig size={18}/><span>Moja podróż</span></Link>
          <Link href="/poradniki"><Luggage size={18}/><span>Poradniki</span></Link>
          <Link href="/atrakcje"><Landmark size={18}/><span>Atrakcje</span></Link>
        </nav>

        <section className="before-trip-timeline">
          <div className="kicker">CO KIEDY ZROBIĆ</div>
          <h2>Nie wszystko trzeba robić naraz</h2>
          <div className="before-trip-timeline-grid">
            {timeline.map(([when, text], index) => <article key={when}><strong>{index + 1}</strong><div><span>{when}</span><p>{text}</p></div></article>)}
          </div>
        </section>

        <div className="guides-section-grid before-trip-grid">
          {steps.map(({ icon: Icon, title, text, href, external }) => (
            <article className="guides-section-card" key={title}>
              <div className="guides-section-head"><Icon size={22}/><div><h2>{title}</h2><p>{text}</p></div></div>
              {external ? <a className="before-trip-card-link" href={href} target="_blank" rel="noopener noreferrer">Sprawdź aktualne informacje <ArrowRight size={16}/></a> : <Link className="before-trip-card-link" href={href}>Przejdź dalej <ArrowRight size={16}/></Link>}
            </article>
          ))}
        </div>

        <section className="guides-checklist before-trip-cta">
          <div>
            <div className="kicker">TWOJA PODRÓŻ</div>
            <h2>Jeśli masz już konkretny wyjazd, przenieś checklistę do organizera.</h2>
            <p>Organizer Tripowni trzyma rezerwacje, listę pakowania, plan dzień po dniu i priorytety zależne od czasu do wylotu.</p>
          </div>
          <div className="guides-checklist-actions">
            <Link className="primary-cta" href="/organizer">Otwórz organizer <ArrowRight size={17}/></Link>
            <Link href="/moje-podroze">Moje podróże</Link>
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
