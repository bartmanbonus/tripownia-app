import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";

export const metadata: Metadata = {
  title: { absolute: "Tanie All Inclusive – najtańsze oferty z Polski | Tripownia.pl" },
  description: "Sprawdź aktualne tanie All Inclusive z polskich lotnisk. Tripownia pokazuje potwierdzone oferty z pełnym wyżywieniem i sortuje je od najniższej ceny.",
  alternates: { canonical: "/tanie-all-inclusive" },
  openGraph: {
    type: "website",
    title: "Tanie All Inclusive – aktualne najtańsze oferty | Tripownia.pl",
    description: "Aktualne All Inclusive z polskich lotnisk, sortowane od najniższej potwierdzonej ceny.",
    url: "https://tripownia.pl/tanie-all-inclusive",
  },
  robots: { index: true, follow: true },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Tanie All Inclusive",
  url: "https://tripownia.pl/tanie-all-inclusive",
  description: "Aktualne tanie oferty All Inclusive z polskich lotnisk, sortowane od najniższej potwierdzonej ceny.",
  isPartOf: { "@type": "WebSite", name: "Tripownia.pl", url: "https://tripownia.pl" },
  about: ["tanie all inclusive", "all inclusive", "wakacje all inclusive", "last minute all inclusive"],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Tripownia", item: "https://tripownia.pl/" },
    { "@type": "ListItem", position: 2, name: "Tanie All Inclusive", item: "https://tripownia.pl/tanie-all-inclusive" },
  ],
};

export default function CheapAllInclusivePage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <DealsPage
      dealType="allinclusive"
      kicker="TANIE ALL INCLUSIVE 🔥"
      pageTitle="Najtańsze All Inclusive teraz."
      pageLead="Tylko potwierdzone pakiety z All Inclusive. Sortujemy od najniższej ceny i zostawiamy najtańszą ofertę dla każdego kierunku."
    />
  </>;
}
