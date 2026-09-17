import type { Metadata } from "next";
import AttractionSearchPage from "@/components/AttractionSearchPage";

const TITLE = "Atrakcje, bilety i wycieczki na wakacjach";
const DESCRIPTION = "Znajdź atrakcje, bilety i wycieczki dla wybranego kierunku. Tripownia prowadzi do aktualnych ofert GetYourGuide i SeePlaces.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/atrakcje" },
  openGraph: {
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    type: "website",
    url: "/atrakcje",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Atrakcje i wycieczki — Tripownia.pl" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function AttractionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://tripownia.pl/atrakcje",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <AttractionSearchPage />
    </>
  );
}
