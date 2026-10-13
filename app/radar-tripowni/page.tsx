import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import LivePriceRadar from "@/components/LivePriceRadar";

const title = "Radar tanich podróży – tylko naprawdę dobre ceny";
const description = "Codzienny radar tanich podróży Tripowni. Pięć różnych kategorii: tanie loty, city break, All Inclusive, wypoczynek i egzotyka. Rzeczywiste terminy i jasne zasady cenowe.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/radar-tripowni" },
  openGraph: { type: "website", title, description, url: "/radar-tripowni" },
};

export default function RadarTripowniPage() {
  return <main>
    <SiteHeader />
    <BreadcrumbSchema items={[
      { name: "Tripownia", url: "https://tripownia.pl/" },
      { name: "Radar Tripowni", url: "https://tripownia.pl/radar-tripowni" },
    ]} />
    <LivePriceRadar />
    <section className="shell" style={{ paddingBottom: "32px" }}>
      <div className="seo-related-links" aria-label="Inne sposoby wyszukiwania">
        <Link href="/city-break">City break</Link>
        <Link href="/tanie-loty">Tanie loty</Link>
        <Link href="/tanie-all-inclusive">All Inclusive</Link>
        <Link href="/wakacje-2027">Wakacje 2027</Link>
        <Link href="/moja-podroz">Zaplanuj podróż</Link>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
