import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Porównaj wyjazdy",
  description: "Porównaj zapisane oferty podróży: cenę, pełny koszt, długość pobytu, wyżywienie i najważniejsze warunki.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
