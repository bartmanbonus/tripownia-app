import type { Metadata } from "next";
import Link from "next/link";
import MyTripResolver from "@/components/MyTripResolver";

export const metadata: Metadata = {
  title: "Darmowy planner podróży | Tripownia.pl",
  description: "Twój darmowy personalizowany planner podróży: plan dnia, lot, hotel, dokumenty, pogoda, atrakcje, checklista i przygotowanie wyjazdu w jednym miejscu.",
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
