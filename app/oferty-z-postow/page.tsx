import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialOfferCatalog from "@/components/SocialOfferCatalog";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import SocialDepartureChoices from "@/components/SocialDepartureChoices";
import SocialShare from "@/components/SocialShare";

export const metadata: Metadata = {
  title: "Znajdź ofertę z posta",
  description: "Wróć do ofert Tripowni z social mediów. Wyszukaj kierunek, hotel lub cenę i sprawdź szczegóły konkretnego wyjazdu.",
  alternates: { canonical: "/oferty-z-postow" },
};

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <h1 className="shell" style={{ paddingTop: 28 }}>Oferty z social mediów</h1>
      <SocialOfferCatalog />
      <div className="shell" id="lotniska"><SocialDepartureChoices /></div>
      <section className="shell" aria-label="Poleć katalog podróży Tripowni" style={{ paddingBottom: 26 }}>
        <SocialShare
          url="/oferty-z-postow"
          title="Oferty podróżnicze z Tripowni"
          text="Sprawdź oferty z naszych postów i wybierz swoje lotnisko. Aktualną cenę zawsze potwierdź przed rezerwacją."
          placement="social_catalog_after_airports"
          label="PODAJ DALEJ"
          shareLead="TRIPOWNIA"
          buttonLabel="Wyślij Tripownię znajomym"
          heading="Znasz kogoś, kto szuka okazji na wyjazd?"
          description="Wyślij katalog znajomym. Mogą wyszukać konkretny wyjazd albo wybrać swoje lotnisko — bez wychodzenia do partnera."
        />
      </section>
      <section className="shell" aria-label="Obserwuj nowe okazje podróżnicze" style={{ paddingBottom: 32 }}>
        <FacebookFollowCTA placement="social_offers_catalog_after_offers" compact />
      </section>
      <SiteFooter />
    </main>
  );
}
