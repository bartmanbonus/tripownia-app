import type { Metadata } from "next";
import AppHome from "@/components/AppHome";

export const metadata: Metadata = {
  title: "Moja Tripownia",
  description: "Twój osobisty ekran Tripowni: dopasowane oferty, alerty, podróż i szybkie decyzje w jednym miejscu.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <AppHome />;
}
