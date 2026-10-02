import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alerty podróżnicze",
  description: "Ustaw kierunek, miejsce wylotu i budżet. Tripownia pokaże pasujące aktualne oferty i pozwoli wracać do zapisanych kryteriów.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
