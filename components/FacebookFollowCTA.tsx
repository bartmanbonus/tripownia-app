"use client";

import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";

export default function FacebookFollowCTA({
  placement,
  compact = false,
  interest,
}: {
  placement: string;
  compact?: boolean;
  interest?: string;
}) {
  return (
    <div className={`facebook-growth-strip${compact ? " facebook-growth-strip-compact" : ""}`}>
      <div>
        <small>NIE PRZEGAP KOLEJNEJ CENY</small>
        <strong>{interest
          ? `Szukasz wyjazdu z ${interest}? Obserwuj Tripownię i odkrywaj kolejne okazje z polskich lotnisk.`
          : "Obserwuj Tripownię — publikujemy konkretne okazje z ceną, terminem i miejscem wylotu."}</strong>
        <span>City breaki, Last Minute, wakacje i loty. Gdy trafiamy na dobrą cenę, pokazujemy konkretny wyjazd — nie samą inspirację.</span>
      </div>
      <a
        href="https://www.facebook.com/987707741084438"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { trackEvent("facebook_follow_click", { placement, interest }); trackMetaCustomEvent("FacebookFollowClick", { placement, interest }); }}
      >
        Obserwuj Tripownię →
      </a>
    </div>
  );
}
