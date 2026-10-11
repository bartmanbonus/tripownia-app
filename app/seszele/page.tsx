import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeychellesDatesLanding from "@/components/SeychellesDatesLanding";

export const metadata: Metadata = {
  title: "Seszele – wybierz termin lotu | Tripownia.pl",
  description: "Zobacz dostępne terminy lotów z Warszawy na Seszele i wybierz ten, który pasuje Ci najbardziej.",
  alternates: { canonical: "/seszele" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Seszele – wybierz termin lotu",
    description: "Wszystkie dostępne terminy w jednym miejscu. Wybierz datę i sprawdź aktualną cenę.",
    url: "/seszele",
    images: [{ url: "/images/destinations/seszele.jpg", alt: "Seszele" }],
  },
};

export default function SeychellesPage() {
  return (
    <main>
      <SiteHeader />
      <SeychellesDatesLanding />
      <SiteFooter />
    </main>
  );
}
