import type { Metadata } from "next";
import PartnerSearchPage from "@/components/PartnerSearchPage";

export const metadata: Metadata = {
  title: "Tanie loty — wyszukiwarka lotów | Tripownia.pl",
  description: "Wyszukaj lot z Tripowni i przejdź do Kiwi.com dopiero z gotowymi parametrami podróży.",
  alternates: { canonical: "/loty" },
};

export default function FlightsPage() {
  return <PartnerSearchPage mode="flights" />;
}
