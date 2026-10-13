import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";
import Link from "next/link";
import type { Offer } from "@/lib/offers";
import { selectEditorialDeals } from "@/lib/editorialDeals";
import liveSnapshot from "@/data/live-offers-snapshot.json";

export const metadata: Metadata = {
  title: "Aktualne okazje podróżnicze – wakacje, city break i last minute",
  description: "Sprawdź aktualne wakacje, city breaki i last minute z polskich lotnisk. Wybieramy świeże oferty z konkretną ceną, dobrym terminem i różnymi kierunkami. Nie pokazujemy cen orientacyjnych jako okazji.",
  alternates: { canonical: "/okazje" },
  openGraph: {
    type: "website",
    title: "Aktualne okazje podróżnicze | Tripownia.pl",
    description: "Aktualne wakacje, city breaki i last minute. Tripownia wybiera potwierdzone ceny, sezonowo odpowiednie terminy i zróżnicowane kierunki.",
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
  // Initial cards come from verified feed snapshots, not old indicative sample prices.
  const initialOffers = !destination && !dealType
    ? selectEditorialDeals((liveSnapshot.offers || []) as unknown as Offer[], 18)
    : [];
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <DealsPage destination={destination} dealType={dealType} initialOffers={initialOffers}/>
    <div className="shell" style={{paddingBottom:24}}><Link href="/radar-tripowni">Nie chcesz przeglądać wszystkiego? Zobacz 5 wyborów w Radarze Tripowni →</Link></div>
  </>;
}
