"use client";

import type { ReactNode } from "react";
import { saveAffiliateReturnContext, type AffiliateTripKind } from "@/lib/affiliateReturn";
import { updateActiveTripJourneyPiece, type JourneyPieceKey } from "@/lib/tripJourney";
import { trackEvent } from "@/lib/analytics";

type Props = {
  href: string;
  piece: JourneyPieceKey;
  partner: string;
  destination?: string;
  label: string;
  price?: number;
  source: string;
  tripKind?: AffiliateTripKind;
  className?: string;
  rel?: string;
  children: ReactNode;
  onSelect?: () => void;
};

export default function TripPiecePartnerLink({
  href,
  piece,
  partner,
  destination,
  label,
  price,
  source,
  tripKind = "package",
  className,
  rel = "sponsored",
  children,
  onSelect,
}: Props) {
  function rememberSelection() {
    updateActiveTripJourneyPiece(piece, {
      status: "selected",
      provider: partner,
      label,
      price,
      href,
      selectedAt: new Date().toISOString(),
    }, { destination });

    saveAffiliateReturnContext({
      partner,
      destination,
      source,
      price,
      tripKind,
      piece,
    });

    trackEvent("trip_piece_selected", {
      piece,
      provider: partner,
      destination: destination || "",
      price: price || 0,
      source,
    });
    onSelect?.();
  }

  return (
    <a
      href={href}
      className={className}
      rel={rel}
      data-trip-piece={piece}
      data-affiliate-source={source}
      onClick={rememberSelection}
    >
      {children}
    </a>
  );
}
