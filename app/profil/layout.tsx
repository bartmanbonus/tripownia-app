import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil podróżnika",
  description: "Ustaw swoje lotnisko, budżet, styl i preferencje podróży, aby Tripownia lepiej dopasowywała propozycje.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
