import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";
import Link from "next/link";
import { homepageFallbackOffers, isOfferExpired } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";

export const metadata: Metadata = {
  title: "Aktualne okazje podróżnicze – wakacje, city break i last minute",
  description: "Sprawdź aktualne wakacje, city breaki i last minute z polskich lotnisk. Najwyżej pokazujemy oferty z aktualną ceną, konkretnym linkiem i pełnymi danymi do decyzji.",
  alternates: { canonical: "/okazje" },
  openGraph: {
    type: "website",
    title: "Aktualne okazje podróżnicze | Tripownia.pl",
    description: "Aktualne wakacje, city breaki i last minute. Tripownia priorytetyzuje oferty gotowe do sprawdzenia i rezerwacji, a użytkownik może sortować także po cenie.",
    url: "https://tripownia.pl/okazje",
  },
  robots: { index: true, follow: true },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Okazje Tripowni",
  url: "https://tripownia.pl/okazje",
  description: "Aktualne okazje na wakacje, city breaki i last minute, priorytetyzowane pod aktualność, kompletność danych i gotowość do rezerwacji.",
  isPartOf: { "@type": "WebSite", name: "Tripownia.pl", url: "https://tripownia.pl" },
  about: ["tanie wakacje", "city break", "last minute", "okazje podróżnicze"],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Tripownia", item: "https://tripownia.pl/" },
    { "@type": "ListItem", position: 2, name: "Okazje", item: "https://tripownia.pl/okazje" },
  ],
};

export default async function DealsRoute({ searchParams }:{ searchParams: Promise<{ q?: string; destination?: string; type?: string }> }){
  const params = await searchParams;
  const destination = (params.q || params.destination || "").trim();
  const dealType = params.type === "allinclusive" ? "allinclusive" : "";
  const initialOffers = !destination && !dealType
    ? homepageFallbackOffers
        .filter((offer) => !isOfferExpired(offer) && isTravelDestinationAllowed(offer.city, offer.country))
    : [];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <DealsPage destination={destination} dealType={dealType} initialOffers={initialOffers}/>
    <div className="shell" style={{paddingBottom:24}}><Link href="/radar-tripowni">Nie chcesz przeglądać wszystkiego? Zobacz 5 wyborów w Radarze Tripowni →</Link></div>
  </>;
}
