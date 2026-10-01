import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konto i logowanie | Tripownia.pl",
  description: "Zaloguj się do Tripowni, aby synchronizować podróże, profil, checklisty, rezerwacje, alerty i zapisane oferty między urządzeniami.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
