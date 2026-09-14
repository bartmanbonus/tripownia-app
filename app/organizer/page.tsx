import type { Metadata } from "next";
import TripOrganizerResolver from "@/components/TripOrganizerResolver";

export const metadata: Metadata = {
  title: "Organizer podróży | Tripownia.pl",
  description: "Prywatny organizer aktywnego wyjazdu: rezerwacje, pakowanie, plan dzień po dniu i praktyczne przygotowanie.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <TripOrganizerResolver />;
}
