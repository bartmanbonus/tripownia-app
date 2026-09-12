import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Polityka prywatności | Tripownia.pl",
  description: "Informacje o prywatności, danych lokalnych i zewnętrznych partnerach w Tripownia.pl.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="PRYWATNOŚĆ"
      title="Polityka prywatności"
      intro="Projektujemy Tripownię tak, aby do zwykłego przeglądania inspiracji nie trzeba było podawać więcej danych niż jest to potrzebne do działania serwisu."
      sections={[
        {
          title: "1. Dane zapisywane lokalnie",
          paragraphs: [
            "Funkcje takie jak Ulubione, Porównaj i Moja podróż mogą zapisywać wybory w localStorage Twojej przeglądarki. Takie dane pozostają na urządzeniu do czasu ich usunięcia przez Ciebie, przeglądarkę albo zmianę działania danej funkcji.",
          ],
        },
        {
          title: "2. Dane techniczne",
          paragraphs: [
            "Podczas korzystania ze strony infrastruktura techniczna może przetwarzać standardowe informacje potrzebne do obsługi żądania, bezpieczeństwa i diagnostyki działania serwisu, takie jak adres IP, informacje o urządzeniu, przeglądarce, czasie żądania i odwiedzanej podstronie.",
          ],
        },
        {
          title: "3. Linki do zewnętrznych partnerów",
          paragraphs: [
            "Po kliknięciu oferty możesz przejść do serwisu zewnętrznego partnera. Od tego momentu zasady przetwarzania danych określa również polityka prywatności tego partnera. Przed rezerwacją warto się z nią zapoznać.",
          ],
        },
        {
          title: "4. Afiliacja i pomiar skuteczności",
          paragraphs: [
            "Link partnerski może zawierać identyfikator potrzebny do przypisania kliknięcia lub rezerwacji do Tripowni. Dzięki temu partner może rozpoznać, że użytkownik przeszedł z naszego serwisu.",
          ],
        },
        {
          title: "5. Twoje wybory w przeglądarce",
          bullets: [
            "Możesz wyczyścić localStorage i dane witryny w ustawieniach przeglądarki.",
            "Możesz korzystać z ustawień prywatności i blokowania technologii śledzących dostępnych w swojej przeglądarce.",
            "Jeżeli korzystasz z serwisu partnera, jego własne ustawienia prywatności obowiązują niezależnie od Tripowni.",
          ],
        },
        {
          title: "6. Kontakt w sprawach prywatności",
          paragraphs: [
            "Pytania dotyczące prywatności i działania serwisu możesz kierować na kontakt@tripownia.pl.",
          ],
        },
      ]}
      note="Ta strona opisuje aktualny sposób działania Tripowni na poziomie produktu. Wraz z uruchamianiem nowych funkcji, kont lub dodatkowych integracji będziemy aktualizować informacje o prywatności."
    />
  );
}
