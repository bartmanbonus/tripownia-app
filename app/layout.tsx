import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripownia — My szukamy. Ty lecisz.",
  description: "Codziennie wybieramy podróże, które naprawdę warto brać."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
