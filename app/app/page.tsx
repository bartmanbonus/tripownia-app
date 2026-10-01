import type { Metadata } from "next";
import AppHomePage from "@/components/AppHomePage";

export const metadata: Metadata = {
  title: "Moja Tripownia — panel podróży",
  description: "Twój panel Tripowni: aktywna podróż, planner, zapisane wyjazdy, ulubione, alerty, profil i wyszukiwarka w jednym miejscu.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <AppHomePage />;
}
