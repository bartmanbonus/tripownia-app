"use client";

import { trackEvent } from "@/lib/analytics";

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
        <small>CODZIENNE OKAZJE NA FACEBOOKU</small>
        <strong>Obserwuj Tripownię i wracaj tylko wtedy, gdy coś naprawdę Cię zainteresuje.</strong>
        <span>Publikujemy konkretne kierunki, ceny i terminy — bez zasypywania przypadkowymi postami.</span>
      </div>
      <a
        href="https://www.facebook.com/987707741084438"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("facebook_follow_click", { placement })}
      >
        Obserwuj Tripownię na Facebooku →
      </a>
    </div>
  );
}
