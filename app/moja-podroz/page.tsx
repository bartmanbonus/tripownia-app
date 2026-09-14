import type { Metadata } from "next";
import Link from "next/link";
import MyTripResolver from "@/components/MyTripResolver";

export const metadata: Metadata = {
  title: "Moja podróż | Tripownia.pl",
  description: "Twój wyjazd w jednym miejscu: oferta, hotel, lot, plan, checklista i notatki.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return (
    <>
      <div className="shell" style={{ paddingTop: 18, paddingBottom: 4, textAlign: "right" }}>
        <Link href="/moje-podroze" style={{ fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Moje podróże →</Link>
      </div>
      <MyTripResolver />
    </>
  );
}
