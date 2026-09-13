"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, RefreshCw } from "lucide-react";

export default function MobileAppControls() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const visible = pathname === "/app" || pathname.startsWith("/moja-podroz");

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => setShowTop(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="mobile-app-controls" aria-label="Szybkie akcje aplikacji">
      <button type="button" onClick={() => window.location.reload()} aria-label="Odśwież aplikację" title="Odśwież">
        <RefreshCw size={18} strokeWidth={2.2} />
        <span>Odśwież</span>
      </button>
      {showTop && (
        <button
          type="button"
          className="mobile-app-controls-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Przewiń do góry"
          title="Do góry"
        >
          <ArrowUp size={19} strokeWidth={2.3} />
          <span>Góra</span>
        </button>
      )}
    </div>
  );
}
