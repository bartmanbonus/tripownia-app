"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

type ReturnContext = {
  savedAt?: string;
  slug?: string;
  partner?: string;
  destination?: string;
  city?: string;
  country?: string;
  tripKind?: "flight" | "hotel" | "package";
};

const STORAGE_KEY = "tripownia-affiliate-return-v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export default function AffiliateReturnPrompt() {
  const [context, setContext] = useState<ReturnContext | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as ReturnContext : null;
      const savedAt = parsed?.savedAt ? new Date(parsed.savedAt).getTime() : 0;
      if (!parsed || !savedAt || Date.now() - savedAt > MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setContext(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const plannerHref = useMemo(() => {
    if (!context) return "/dodaj-podroz?mode=owned";
    const params = new URLSearchParams({
      mode: "owned",
      source: "affiliate",
      city: context.city || "",
      country: context.country || "",
      kind: context.tripKind || "package",
      partner: context.partner || "",
      slug: context.slug || "",
    });
    return `/dodaj-podroz?${params.toString()}`;
  }, [context]);

  if (!context) return null;

  return (
    <aside className="affiliate-return-prompt" aria-label="Dodaj rezerwację do planera Tripowni">
      <button
        type="button"
        className="affiliate-return-close"
        aria-label="Zamknij"
        onClick={() => {
          localStorage.removeItem(STORAGE_KEY);
          setContext(null);
        }}
      >
        <X size={18}/>
      </button>
      <div className="affiliate-return-icon"><CheckCircle2 size={22}/></div>
      <div className="affiliate-return-copy">
        <strong>Rezerwacja gotowa?</strong>
        <span>
          {context.destination ? `Dodaj ${context.destination} do planera i ogarnij resztę wyjazdu w jednym miejscu.` : "Dodaj wyjazd do planera i ogarnij resztę w jednym miejscu."}
        </span>
      </div>
      <Link href={plannerHref} onClick={() => localStorage.removeItem(STORAGE_KEY)}>
        Dodaj do mojego planera
      </Link>
    </aside>
  );
}
