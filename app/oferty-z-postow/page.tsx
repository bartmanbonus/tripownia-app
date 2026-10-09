import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialOfferCatalog from "@/components/SocialOfferCatalog";
import FacebookFollowCTA from "@/components/FacebookFollowCTA";
import SocialDepartureChoices from "@/components/SocialDepartureChoices";

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
      <section className="shell" aria-label="Obserwuj nowe okazje podróżnicze" style={{ paddingBottom: 32 }}>
        <FacebookFollowCTA placement="social_offers_catalog_after_offers" compact />
      </section>
      <SiteFooter />
    </main>
  );
}
