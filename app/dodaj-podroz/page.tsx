import type { Metadata } from "next";
import AddTripPage from "@/components/AddTripPage";

export const metadata: Metadata = {
  title: "Dodaj własną podróż | Tripownia",
  description: "Dodaj własny wyjazd do Tripowni i uporządkuj termin, lot, hotel, checklistę, organizer oraz plan podróży.",
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <AddTripPage />;
}
