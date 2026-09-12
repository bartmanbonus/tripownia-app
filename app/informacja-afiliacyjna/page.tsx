import LegalPage from "@/components/LegalPage";

export default function AffiliateInfoPage() {
  return (
    <LegalPage
      kicker="TRANSPARENTNOŚĆ"
      title="Jak działa afiliacja w Tripowni"
      intro="Tripownia może zarabiać, gdy po przejściu z naszego serwisu rezerwujesz podróż u partnera. Chcemy, żeby ten mechanizm był jasny i nie wpływał na zaufanie do rekomendacji."
      sections={[
        {
          title: "1. Co oznacza link afiliacyjny",
          paragraphs: [
            "Część odnośników prowadzących do hoteli, lotów, pakietów lub atrakcji zawiera parametry partnerskie. Dzięki nim partner może rozpoznać, że użytkownik trafił do niego z Tripowni.",
          ],
        },
        {
          title: "2. Czy użytkownik płaci więcej",
          paragraphs: [
            "Sama obecność linku afiliacyjnego nie oznacza doliczenia przez Tripownię dodatkowej opłaty do ceny widocznej u partnera. Ostateczna cena i warunki są zawsze prezentowane przez serwis, w którym finalizujesz rezerwację.",
          ],
        },
        {
          title: "3. Jak wybieramy propozycje",
          paragraphs: [
            "Celem Tripowni jest pokazywanie konkretnych, użytecznych propozycji. Przy wyborze i porządkowaniu ofert bierzemy pod uwagę m.in. cenę, kierunek, termin, jakość danych, dostępność i dopasowanie do danego scenariusza podróży.",
            "Nie stosujemy sztucznego scarcity ani fałszywych liczników zainteresowania. Jeśli cena nie jest potwierdzona na żywo, oznaczamy ją jako orientacyjną.",
          ],
        },
        {
          title: "4. Partner odpowiada za rezerwację",
          paragraphs: [
            "Po przejściu do partnera to on prezentuje finalną dostępność, cenę, regulamin i warunki zakupu. W razie rozbieżności wiążące są informacje wyświetlone przed zawarciem umowy u partnera.",
          ],
        },
        {
          title: "5. Kontakt",
          paragraphs: [
            "Jeśli masz pytanie dotyczące sposobu oznaczania ofert albo konkretnego linku partnerskiego, napisz na kontakt@tripownia.pl.",
          ],
        },
      ]}
      note="Afiliacja finansuje rozwój Tripowni, ale nie zmienia naszej zasady: najpierw użyteczność dla podróżującego, potem kliknięcie."
    />
  );
}
