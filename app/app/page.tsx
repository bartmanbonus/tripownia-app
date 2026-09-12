import type { Metadata } from "next";
import AppHome from "@/components/AppHome";

export const metadata: Metadata = {
  title: "Moja Tripownia",
  description: "Twój osobisty ekran Tripowni: dopasowane oferty, alerty, podróż i szybkie decyzje w jednym miejscu.",
};

export default function Page() {
  return <AppHome />;
}
