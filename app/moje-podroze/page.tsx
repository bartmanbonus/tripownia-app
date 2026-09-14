import type { Metadata } from "next";
import MyTripsPage from "@/components/MyTripsPage";

export const metadata: Metadata = {
  title: "Moje podróże",
  description: "Twoje aktywne i zapisane plany podróży w Tripowni.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <MyTripsPage />;
}
