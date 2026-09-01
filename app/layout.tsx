import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: "Tripownia — My szukamy. Ty lecisz.", template: "%s" },
  description: "Codziennie wybieramy podróże, które naprawdę warto brać.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Tripownia — My szukamy. Ty lecisz.",
    description: "Codziennie wybieramy podróże, które naprawdę warto brać.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
