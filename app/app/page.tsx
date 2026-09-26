import type { Metadata } from "next";
import HomePageClient from "@/app/HomePageClient";

export const metadata: Metadata = {
  title: "Tripownia — wyszukiwarka i planer podróży",
  description: "Ta sama Tripownia w web i aplikacji: wyszukiwarka wyjazdów, okazje, kierunki i darmowy planer podróży.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <HomePageClient />;
}
