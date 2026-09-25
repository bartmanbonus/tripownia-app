import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Polityka prywatności i RODO",
  description: "Jak Tripownia.pl przetwarza dane, zapisuje preferencje lokalnie, korzysta z analityki za zgodą i realizuje prawa wynikające z RODO.",
  alternates: { canonical: "/polityka-prywatnosci" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="PRYWATNOŚĆ I RODO"
      title="Polityka prywatności"
      intro="Tripownia ma pomagać planować podróże bez zbierania danych na zapas. Poniżej wyjaśniamy prostym językiem, co zapisujemy, po co i jakie masz prawa."
      sections={[
        {
          title: "1. Administrator danych i kontakt",
          paragraphs: [
            "Administratorem danych przetwarzanych w związku z serwisem Tripownia.pl jest podmiot prowadzący serwis Tripownia.pl. Pełne dane identyfikacyjne administratora powinny być podane w informacjach formalnych serwisu przed uruchomieniem kont synchronizowanych lub innych funkcji wymagających przekazywania danych osobowych do Tripowni.",
            "W sprawach dotyczących prywatności, danych osobowych lub realizacji praw możesz napisać na kontakt@tripownia.pl.",
          ],
        },
        {
          title: "2. Profil podróżnika, Ulubione i Moja podróż",
          paragraphs: [
            "Profil podróżnika, Ulubione, Porównaj, alerty, checklisty i Moja podróż są obecnie zapisywane przede wszystkim lokalnie w pamięci przeglądarki na Twoim urządzeniu. Nie tworzymy na tej podstawie automatycznie serwerowego konta użytkownika.",
            "Dane lokalne mogą obejmować m.in. preferowane lotnisko, budżet, styl podróży, zapisane oferty, plan wyjazdu, checklistę, notatki, numer lotu lub dane wpisane przez Ciebie do organizacji podróży. Pozostają na urządzeniu do czasu ich usunięcia przez Ciebie, przeglądarkę lub zmianę działania funkcji.",
          ],
        },
        {
          title: "3. Dane techniczne niezbędne do działania serwisu",
          paragraphs: [
            "Infrastruktura techniczna może przetwarzać standardowe dane potrzebne do wyświetlenia strony, zapewnienia bezpieczeństwa i diagnostyki, np. adres IP, informacje o urządzeniu i przeglądarce, czas żądania, adres odwiedzanej podstrony oraz dane o błędach.",
            "Przetwarzanie takich danych służy prawidłowemu i bezpiecznemu świadczeniu serwisu oraz ochronie przed nadużyciami. Dane techniczne przechowujemy tylko tak długo, jak jest to potrzebne do tych celów lub wymagane przez dostawcę infrastruktury i obowiązujące przepisy.",
          ],
        },
        {
          title: "4. Analityka — wyłącznie po zgodzie",
          paragraphs: [
            "Tripownia może korzystać z Google Analytics 4, aby rozumieć, które wyszukiwania, treści i funkcje są przydatne. Analityka jest uruchamiana dopiero po wybraniu opcji „Akceptuję analitykę”. Do tego czasu pozostaje wyłączona.",
            "W ustawieniach prywatności możesz w dowolnym momencie zmienić decyzję. Dla analityki wyłączamy personalizację reklam i sygnały reklamowe w konfiguracji serwisu.",
          ],
        },
        {
          title: "5. Linki afiliacyjne i partnerzy",
          paragraphs: [
            "Po kliknięciu oferty możesz przejść do zewnętrznego partnera, np. serwisu rezerwacyjnego, przewoźnika lub dostawcy atrakcji. Od tego momentu obowiązuje również polityka prywatności tego partnera.",
            "Link afiliacyjny może zawierać identyfikator techniczny potrzebny do przypisania kliknięcia lub rezerwacji do Tripowni. Dzięki temu możemy otrzymać prowizję, jeśli użytkownik dokona zakupu u partnera. Nie zmienia to ceny dla użytkownika.",
          ],
        },
        {
          title: "6. Cele i podstawy przetwarzania",
          bullets: [
            "działanie serwisu, bezpieczeństwo i obsługa żądań — gdy jest to niezbędne do świadczenia usługi lub wynika z prawnie uzasadnionego interesu w utrzymaniu bezpiecznego serwisu;",
            "odpowiedź na wiadomości przesłane do Tripowni — w celu obsługi kontaktu i ewentualnego ustalenia, obrony lub dochodzenia roszczeń;",
            "analityka korzystania z serwisu — na podstawie Twojej zgody;",
            "realizacja obowiązków prawnych — jeżeli taki obowiązek wynika z przepisów.",
          ],
        },
        {
          title: "7. Odbiorcy danych",
          paragraphs: [
            "W niezbędnym zakresie dane techniczne lub analityczne mogą być przetwarzane przez dostawców infrastruktury, hostingu, analityki i usług wspierających działanie serwisu. Korzystamy z dostawców tylko w zakresie potrzebnym do konkretnej usługi.",
            "Przejście do zewnętrznego partnera oznacza, że partner samodzielnie przetwarza dane zgodnie ze swoją polityką prywatności, szczególnie gdy rozpoczynasz wyszukiwanie, rezerwację lub zakup w jego serwisie.",
          ],
        },
        {
          title: "8. Jak długo przechowujemy dane",
          bullets: [
            "dane lokalne w Twojej przeglądarce — do chwili ich usunięcia lub wyczyszczenia danych witryny;",
            "decyzję dotyczącą analityki — do chwili zmiany ustawienia lub wyczyszczenia danych witryny;",
            "dane techniczne i logi — przez okres potrzebny do bezpieczeństwa, diagnostyki i rozliczalności, zgodnie z ustawieniami dostawcy infrastruktury;",
            "korespondencję — przez okres potrzebny do obsługi sprawy i ewentualnej ochrony roszczeń.",
          ],
        },
        {
          title: "9. Twoje prawa",
          bullets: [
            "prawo dostępu do danych i otrzymania informacji o ich przetwarzaniu;",
            "prawo sprostowania danych;",
            "prawo usunięcia danych lub ograniczenia przetwarzania, gdy spełnione są warunki RODO;",
            "prawo sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie;",
            "prawo przenoszenia danych w przypadkach przewidzianych w RODO;",
            "prawo wycofania zgody w dowolnym momencie bez wpływu na zgodność z prawem wcześniejszego przetwarzania;",
            "prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.",
          ],
        },
        {
          title: "10. Zarządzanie danymi na urządzeniu",
          paragraphs: [
            "W Profilu podróżnika możesz wyeksportować lub usunąć dane zapisane lokalnie przez funkcje osobiste Tripowni. Możesz też wyczyścić dane witryny w ustawieniach przeglądarki.",
            "Usunięcie danych lokalnych może skasować zapisane oferty, ustawienia, checklisty i plan podróży z danego urządzenia. Jeżeli w przyszłości uruchomimy konta synchronizowane z serwerem, przed ich użyciem pokażemy dodatkowe informacje o przetwarzaniu danych.",
          ],
        },
      ]}
      note="Ostatnia aktualizacja: 14 września 2026 r. Politykę będziemy aktualizować wraz z rozwojem kont, synchronizacji danych i nowych integracji."
    />
  );
}
