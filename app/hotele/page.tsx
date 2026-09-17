import type { Metadata } from "next";
import PartnerSearchPage from "@/components/PartnerSearchPage";

const TITLE = "Hotele i noclegi — wyszukiwarka hoteli";
const DESCRIPTION = "Znajdź hotel lub nocleg dla wybranego kierunku i terminu. Ustaw parametry w Tripowni i przejdź do Booking.com z gotowym wyszukiwaniem.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/hotele" },
  openGraph: {
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    type: "website",
    url: "/hotele",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Hotele i noclegi — Tripownia.pl" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Tripownia.pl`,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function HotelsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://tripownia.pl/hotele",
    isPartOf: { "@type": "WebSite", name: "Tripownia", url: "https://tripownia.pl" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PartnerSearchPage mode="hotels" />
    </>
  );
}
