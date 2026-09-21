import type { Metadata } from "next";
import AddTripPage from "@/components/AddTripPage";

export const metadata: Metadata = {
  title: "Darmowy personalizowany plan podróży | Tripownia",
  description: "Podaj kierunek i termin. Tripownia za darmo utworzy personalizowany plan podróży z checklistą, dokumentami, pogodą, transportem, atrakcjami i przygotowaniem wyjazdu.",
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <AddTripPage />;
}
