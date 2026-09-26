import type { Metadata } from "next";
import FavoritesPage from "@/components/FavoritesPage";

export const metadata: Metadata = {
  title: "Ulubione oferty | Tripownia.pl",
  description: "Twoje zapisane okazje podróżnicze na Tripownia.pl — bez logowania i zakładania konta.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() {
  return <FavoritesPage/>;
}
