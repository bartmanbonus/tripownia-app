import type { Metadata } from "next";
import MyTrip from "@/components/MyTrip";

export const metadata: Metadata = {
  title: "Moja podróż | Tripownia.pl",
  description: "Twój wyjazd w jednym miejscu: oferta, hotel, lot, plan, checklista i notatki.",
};

export default function Page() {
  return <MyTrip />;
}
