import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: { absolute: "Tripownia – darmowy planer podróży i okazje na wyjazdy" },
  description: "Zaplanuj podróż za darmo: zbierz lot, nocleg, atrakcje, plan dnia i checklistę. Odkrywaj też wakacje, city breaki i okazje Tripowni.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePageClient />;
}
