import type { Metadata } from "next";
import PartnerSearchPage from "@/components/PartnerSearchPage";

const TITLE = "Tanie loty z Polski — wyszukiwarka lotów";
const DESCRIPTION = "Szukaj tanich lotów z Warszawy, Krakowa, Katowic, Gdańska i innych lotnisk. Ustaw kierunek i przejdź do Kiwi.com z gotowymi parametrami podróży.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/loty" },
  openGraph: {
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    type: "website",
    url: "/loty",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Tanie loty z Polski — Tripownia.pl" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function FlightsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://tripownia.pl/loty",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PartnerSearchPage mode="flights" />
    </>
  );
}
