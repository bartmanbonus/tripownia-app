import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const title = "Standardy redakcyjne Tripowni – źródła, aktualizacje i afiliacja";
const description = "Zobacz standardy redakcyjne Tripowni: jak opisujemy ceny i terminy, jak korzystamy ze źródeł, jak aktualizujemy treści i jak oznaczamy relacje afiliacyjne.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/standardy-redakcyjne" },
};

export default function EditorialStandardsPage() {
  return <main>
    <SiteHeader/>
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Standardy redakcyjne", url: "https://tripownia.pl/standardy-redakcyjne" },
    ]}/>

    <article className="shell guides-hub">
      <header className="guides-hero">
        <div>
          <div className="kicker">STANDARDY REDAKCYJNE</div>
          <h1>Jak tworzymy i aktualizujemy treści w Tripowni.</h1>
          <p>Podróżnicze informacje szybko się zmieniają. Dlatego oddzielamy inspirację od faktów wymagających aktualnego potwierdzenia i jasno wskazujemy, kiedy ostateczne dane należy sprawdzić u przewoźnika, urzędu lub partnera.</p>
        </div>
      </header>

      <section className="guides-section-grid">
        <section className="guides-section-card"><h2>Źródła</h2><p>W sprawach formalnych, przepisach i zasadach podróży preferujemy źródła urzędowe, przewoźników, lotniska i bezpośrednich dostawców usług. Przy inspiracjach korzystamy także z danych i materiałów branżowych.</p></section>
        <section className="guides-section-card"><h2>Ceny i dostępność</h2><p>Ceny lotów, hoteli i pakietów są dynamiczne. Nie przedstawiamy ceny zewnętrznego dostawcy jako gwarantowanej do momentu zakupu. Ostateczną kwotę użytkownik sprawdza na stronie partnera.</p></section>
        <section className="guides-section-card"><h2>Aktualizacje</h2><p>Treści sezonowe, daty i informacje praktyczne aktualizujemy, gdy zmieniają się warunki albo pojawia się nowsze wiarygodne źródło. Nieaktualne adresy i duplikaty kierujemy do właściwych, aktualnych stron.</p></section>
        <section className="guides-section-card"><h2>Afiliacja</h2><p>Relacja afiliacyjna nie zmienia naszych zasad opisywania oferty. Informujemy, że część linków może generować prowizję dla Tripowni i oddzielamy to od informacji o cenie lub warunkach.</p></section>
        <section className="guides-section-card"><h2>Korekty</h2><p>Jeśli zauważysz błąd lub nieaktualną informację, napisz na kontakt@tripownia.pl. Przy ważnych informacjach praktycznych poprawiamy treść po weryfikacji źródła.</p></section>
        <section className="guides-section-card"><h2>Bezpieczeństwo decyzji</h2><p>Przed zakupem i wyjazdem zachęcamy do sprawdzenia aktualnych wymagań wjazdowych, dokumentów, warunków przewoźnika, ubezpieczenia i finalnych warunków rezerwacji.</p></section>
      </section>

      <section className="guides-checklist">
        <div>
          <div className="kicker">PRZEJRZYSTOŚĆ</div>
          <h2>Treść ma pomagać podjąć decyzję, a nie tylko zdobyć kliknięcie.</h2>
          <p>Dlatego budujemy poradniki, strony kierunkowe i wyszukiwarki wokół konkretnych pytań użytkownika oraz linkujemy do bardziej szczegółowych stron zamiast tworzyć wiele niemal identycznych treści.</p>
        </div>
      </section>

      <nav className="guides-quick-links" aria-label="Zasady i informacje o Tripowni">
        <Link href="/o-tripowni">O Tripowni</Link>
        <Link href="/jak-dziala-tripownia">Jak działa Tripownia</Link>
        <Link href="/informacja-afiliacyjna">Informacja afiliacyjna</Link>
        <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
        <Link href="/faq">FAQ</Link>
      </nav>
    </article>
    <SiteFooter/>
  </main>;
}
