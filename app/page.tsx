import type { Metadata } from "next";
import HomePageV2 from "./HomePageV2";

export const metadata: Metadata = {
  title: { absolute: "Tanie loty, wakacje i darmowy planer podróży | Tripownia.pl" },
  description: "Znajdź aktualne okazje na tanie loty, city break i wakacje z polskich lotnisk. Oceń ofertę, ustaw alert i ułóż całą podróż w darmowym plannerze Tripowni.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePageV2 />;
}
