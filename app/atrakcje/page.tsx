import type { Metadata } from "next";
import AttractionSearchPage from "@/components/AttractionSearchPage";

export const metadata: Metadata = {
  title: "Atrakcje i wycieczki – Tripownia",
  description: "Znajdź atrakcje, bilety i wycieczki dla wybranego kierunku. Tripownia prowadzi do aktualnych ofert GetYourGuide i SeePlaces.",
  alternates: { canonical: "/atrakcje" },
};

export default function AttractionsPage() {
  return <AttractionSearchPage />;
}
