"use client";

import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

export default function FacebookFollowCTA({
  placement,
  compact = false,
}: {
  placement: string;
  compact?: boolean;
}) {
  return (
    <div className={`facebook-growth-strip${compact ? " facebook-growth-strip-compact" : ""}`}>
      <div>
        <small>OKAZJE, KTÓRE WARTO ZŁAPAĆ</small>
        <strong>Obserwuj Tripownię — codziennie pokazujemy konkretne wyjazdy z ceną i terminem.</strong>
        <span>Tanie city breaki, wakacje i loty w jednym miejscu — bez przypadkowych inspiracji i bez szukania od zera.</span>
      </div>
      <a
        href="https://www.facebook.com/987707741084438"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { trackEvent("facebook_follow_click", { placement }); trackMetaCustomEvent("FacebookFollowClick", { placement }); }}
      >
        Obserwuj Tripownię →
      </a>
    </div>
  );
}
