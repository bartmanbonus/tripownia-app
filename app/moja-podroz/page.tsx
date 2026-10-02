import type { Metadata } from "next";
import MyTripResolver from "@/components/MyTripResolver";

export const metadata: Metadata = {
  title: "Darmowy planner podróży",
  description: "Twój darmowy personalizowany planner podróży: plan dnia, lot, hotel, dokumenty, pogoda, atrakcje, checklista i przygotowanie wyjazdu w jednym miejscu.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <MyTripResolver />;
}
