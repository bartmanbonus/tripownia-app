"use client";

import { ArrowRight } from "lucide-react";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";

type Props = {
  href: string;
  partner: string;
  slug: string;
  price?: number;
  destination: string;
  tripKind?: "flight" | "hotel" | "package";
  departure?: string;
  hotel?: string;
  board?: string;
  nights?: number;
  start?: string;
  end?: string;
};

export default function AffiliateOfferLink({ href, partner, slug, price, destination, tripKind = "package", departure, hotel, board, nights, start, end }: Props) {
  function rememberTripContext() {
    saveAffiliateReturnContext({
      slug,
      partner,
      destination,
      source: "social_offer",
      price,
      tripKind,
      departure,
      hotel,
      board,
      nights,
      start,
      end,
    });
  }

  return (
    <a
      className="primary-cta"
      href={href}
      rel="sponsored"
      onClick={rememberTripContext}
    >
      Sprawdź ofertę <ArrowRight size={18}/>
    </a>
  );
}
