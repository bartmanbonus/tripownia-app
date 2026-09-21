import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: { absolute: "Tanie wakacje, city break i planer podróży | Tripownia.pl" },
  description: "Znajdź tanie wakacje, city break, lot + hotel i aktualne okazje z polskich lotnisk. Potem zaplanuj wyjazd za darmo: lot, nocleg, atrakcje i checklistę.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePageClient />;
}
