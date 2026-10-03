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
      readySearchItems={[
        { href: "/szukaj?airport=KTW&budget=2500&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "KATOWICE · 7 NOCY · DO 2 500 ZŁ", title: "All Inclusive z Katowic", meta: "Ciepłe kierunki · pełne wyżywienie · najtańsze najpierw" },
        { href: "/szukaj?airport=WAWA&budget=3000&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "WARSZAWA · 7 NOCY · DO 3 000 ZŁ", title: "All Inclusive z Warszawy", meta: "WAW + WMI · aktualne pakiety" },
        { href: "/szukaj?airport=POZ&budget=3000&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "POZNAŃ · 7 NOCY · DO 3 000 ZŁ", title: "All Inclusive z Poznania", meta: "Aktualne kierunki z POZ" },
        { href: "/szukaj?destination=Egipt&budget=3000&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "EGIPT · 7 NOCY · DO 3 000 ZŁ", title: "Egipt All Inclusive", meta: "Różne polskie lotniska · pełne wyżywienie" },
        { href: "/szukaj?destination=Wyspy%20Kanaryjskie&budget=3500&duration=7&board=all%20inclusive&tab=All%20Inclusive", eyebrow: "KANARY · 7 NOCY", title: "Wyspy Kanaryjskie All Inclusive", meta: "Słońce zimą · aktualne warianty" },
      ]}
    />
  </>;
}
