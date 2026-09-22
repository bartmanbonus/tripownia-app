import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tanie wakacje i city break – najtańsze okazje podróżnicze",
  description: "Sprawdź najtańsze aktualne wakacje i city breaki z polskich lotnisk. Tripownia wybiera najniższą cenę dla kierunku i pozwala filtrować po lotnisku, miesiącu i roku.",
  alternates: { canonical: "/okazje" },
  openGraph: {
    type: "website",
    title: "Najtańsze okazje podróżnicze | Tripownia.pl",
    description: "Aktualne wakacje i city breaki sortowane od najniższej ceny, bez ściany droższych duplikatów.",
    url: "https://tripownia.pl/okazje",
  },
  robots: { index: true, follow: true },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Okazje Tripowni",
  url: "https://tripownia.pl/okazje",
  description: "Aktualne okazje na wakacje i city breaki sortowane od najniższej ceny.",
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

export default function DealsRoute(){
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
    <DealsPage/>
    <div className="shell" style={{paddingBottom:24}}><Link href="/radar-tripowni">Nie chcesz przeglądać wszystkiego? Zobacz 5 wyborów w Radarze Tripowni →</Link></div>
  </>;
}
