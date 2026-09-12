import type { Metadata } from "next";
import TravelAdvisor from "@/components/TravelAdvisor";

export const metadata: Metadata = {
  title: "Nie wiem gdzie jechać | Tripownia.pl",
  description: "Podaj budżet, długość wyjazdu i klimat, a Tripownia wybierze 3 najlepiej dopasowane kierunki.",
};

export default function Page() {
  return <TravelAdvisor />;
}
