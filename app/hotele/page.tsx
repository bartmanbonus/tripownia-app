import type { Metadata } from "next";
import PartnerSearchPage from "@/components/PartnerSearchPage";

export const metadata: Metadata = {
  title: "Hotele i noclegi — wyszukiwarka | Tripownia.pl",
  description: "Wyszukaj nocleg w Tripowni i przejdź do Booking.com z gotowym kierunkiem i terminem.",
  alternates: { canonical: "/hotele" },
};

export default function HotelsPage() {
  return <PartnerSearchPage mode="hotels" />;
}
