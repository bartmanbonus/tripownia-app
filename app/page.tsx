import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: { absolute: "Tripownia – darmowy personalizowany planer podróży" },
  description: "Darmowy personalizowany planer podróży: dokumenty, pogoda, transport, atrakcje, jedzenie, checklista i plan dnia. Znajdź wyjazd lub dodaj ten, który już masz.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePageClient />;
}
