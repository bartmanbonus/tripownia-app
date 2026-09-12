import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Regulamin | Tripownia.pl",
  description: "Zasady korzystania z serwisu Tripownia.pl i przechodzenia do ofert partnerów.",
  alternates: { canonical: "/regulamin" },
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="ZASADY KORZYSTANIA"
      title="Regulamin Tripownia.pl"
      intro="Tripownia pomaga odkrywać, porównywać i planować podróże. Poniżej opisujemy najważniejsze zasady korzystania z serwisu w prostym języku."
      sections={[
        {
          title: "1. Czym jest Tripownia",
          paragraphs: [
            "Tripownia.pl jest serwisem informacyjno-inspiracyjnym i afiliacyjnym. Wyszukujemy oraz prezentujemy propozycje podróży, a rezerwacja lub zakup odbywa się u zewnętrznego partnera.",
            "Tripownia nie jest organizatorem turystyki ani stroną umowy zawieranej pomiędzy użytkownikiem a partnerem, chyba że przy konkretnej usłudze wyraźnie wskazano inaczej.",
          ],
        },
        {
          title: "2. Ceny i dostępność",
          paragraphs: [
            "Ceny i dostępność mogą zmieniać się w czasie. Przy ofertach pobieranych z aktualnych feedów pokazujemy informację o weryfikacji, a przy inspiracjach statycznych wyraźnie zaznaczamy, że cena jest orientacyjna.",
            "Przed płatnością zawsze sprawdź ostateczną cenę, termin, zakres świadczeń i warunki rezerwacji bezpośrednio u partnera.",
          ],
        },
        {
          title: "3. Linki partnerskie",
          paragraphs: [
            "Niektóre linki w Tripowni są linkami afiliacyjnymi. Jeśli dokonasz zakupu po przejściu takim linkiem, Tripownia może otrzymać prowizję od partnera. Nie podnosi to ceny dla użytkownika.",
          ],
        },
        {
          title: "4. Funkcje zapisane w przeglądarce",
          bullets: [
            "Ulubione, porównanie i Moja podróż mogą wykorzystywać pamięć lokalną przeglądarki.",
            "Usunięcie danych przeglądarki może usunąć zapisane lokalnie wybory.",
            "Dostępność poszczególnych funkcji może zmieniać się wraz z rozwojem serwisu.",
          ],
        },
        {
          title: "5. Odpowiedzialność użytkownika",
          paragraphs: [
            "Użytkownik powinien samodzielnie zweryfikować wymagania wjazdowe, dokumenty, ubezpieczenie, ograniczenia zdrowotne, bezpieczeństwo kierunku oraz warunki konkretnej usługi przed podróżą.",
          ],
        },
        {
          title: "6. Kontakt",
          paragraphs: [
            "W sprawach dotyczących działania serwisu możesz napisać na kontakt@tripownia.pl.",
          ],
        },
      ]}
      note="Serwis rozwija się dynamicznie. Jeśli istotnie zmienimy sposób działania Tripowni lub zasady korzystania z niej, zaktualizujemy również ten dokument."
    />
  );
}
