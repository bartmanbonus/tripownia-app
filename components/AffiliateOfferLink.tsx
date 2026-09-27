"use client";

import { ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function AffiliateOfferLink({ href, partner, slug, destination }: { href: string; partner: string; slug: string; destination: string }) {
  return (
    <a
      className="primary-cta"
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => trackEvent("affiliate_click", { partner, offer_slug: slug, destination, source: "social_offer" })}
    >
      Sprawdź ofertę w {partner} <ExternalLink size={18}/>
    </a>
  );
}
