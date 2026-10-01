"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search, X } from "lucide-react";
import {
  AFFILIATE_RETURN_MAX_AGE_MS,
  AFFILIATE_RETURN_STORAGE_KEY,
  type AffiliateReturnContext,
} from "@/lib/affiliateReturn";
import { trackEvent } from "@/lib/analytics";

export default function AffiliateReturnPrompt() {
  const [context, setContext] = useState<AffiliateReturnContext | null>(null);

  useEffect(() => {
    const readContext = () => {
      try {
        const raw = localStorage.getItem(AFFILIATE_RETURN_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) as AffiliateReturnContext : null;
        const savedAt = parsed?.savedAt ? new Date(parsed.savedAt).getTime() : 0;
        if (!parsed || !savedAt || Date.now() - savedAt > AFFILIATE_RETURN_MAX_AGE_MS) {
          localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
          setContext(null);
          return;
        }
        setContext(parsed);
      } catch {
        localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
        setContext(null);
      }
    };

    readContext();
    const onFocus = () => readContext();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const plannerHref = useMemo(() => {
    if (!context) return "/dodaj-podroz?mode=owned";
    const params = new URLSearchParams({
      mode: "owned",
      source: "external",
      city: context.city || "",
      country: context.country || "",
      kind: context.tripKind || "package",
      slug: context.slug || "",
    });
    return `/dodaj-podroz?${params.toString()}`;
  }, [context]);

  const retryHref = useMemo(() => {
    if (!context?.destination) return "/okazje";
    return `/okazje?q=${encodeURIComponent(context.destination)}`;
  }, [context]);

  function clearContext() {
    localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
    setContext(null);
  }

  if (!context) return null;

  return (
    <aside className="affiliate-return-prompt" aria-label="Co dalej z wyjazdem">
      <button
        type="button"
        className="affiliate-return-close"
        aria-label="Zamknij"
        onClick={() => {
          trackEvent("affiliate_return_dismiss", { destination: context.destination || "", partner: context.partner || "" });
          clearContext();
        }}
      >
        <X size={18}/>
      </button>
      <div className="affiliate-return-icon"><CheckCircle2 size={22}/></div>
      <div className="affiliate-return-copy">
        <strong>Udało się zarezerwować?</strong>
        <span>
          {context.destination
            ? `Jeśli tak, dodaj ${context.destination} do planera. Jeśli nie — pokażemy podobne aktualne oferty.`
            : "Jeśli tak, dodaj wyjazd do planera. Jeśli nie — wróć do aktualnych okazji."}
        </span>
      </div>
      <div className="affiliate-return-actions">
        <Link
          className="affiliate-return-primary"
          href={plannerHref}
          onClick={() => {
            trackEvent("affiliate_return_booked", { destination: context.destination || "", partner: context.partner || "" });
            clearContext();
          }}
        >
          <CheckCircle2 size={16}/> Tak, mam rezerwację
        </Link>
        <Link
          className="affiliate-return-secondary"
          href={retryHref}
          onClick={() => {
            trackEvent("affiliate_return_retry", { destination: context.destination || "", partner: context.partner || "" });
            clearContext();
          }}
        >
          <Search size={16}/> Nie — pokaż podobne
        </Link>
      </div>
    </aside>
  );
}
