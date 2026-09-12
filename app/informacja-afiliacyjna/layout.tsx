import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informacja afiliacyjna | Tripownia.pl",
  description: "Jak działają linki partnerskie i afiliacja w Tripownia.pl.",
  alternates: { canonical: "/informacja-afiliacyjna" },
};

export default function AffiliateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
