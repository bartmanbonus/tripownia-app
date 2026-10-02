import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dla Ciebie — dopasowane wyjazdy",
  description: "Propozycje wyjazdów dopasowane do Twojego lotniska, budżetu, stylu podróży i zapisanych preferencji.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
