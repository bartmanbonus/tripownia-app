"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type LivePrice = {
  ok: boolean;
  price?: number;
  currency?: string;
  checkedAt?: string;
  destinationMatched?: boolean;
  source?: string;
  error?: string;
};

type Props = {
  offerId: number;
  fallbackPrice: number;
  board?: string;
  compact?: boolean;
  onStateChange?: (state: { loading: boolean; verified: boolean; price?: number }) => void;
};

export default function EskyLivePackagePrice({
  offerId,
  fallbackPrice: _fallbackPrice,
  board: _board,
  compact = false,
  onStateChange,
}: Props) {
  const [data, setData] = useState<LivePrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    onStateChange?.({ loading: true, verified: false });

    fetch(`/api/esky/package-price?offerId=${offerId}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as LivePrice;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
        const verified = Boolean(payload.ok && payload.destinationMatched && typeof payload.price === "number");
        onStateChange?.({ loading: false, verified, price: verified ? payload.price : undefined });
      })
      .catch(() => {
        if (!active) return;
        setData({ ok: false, error: "fetch_failed" });
        onStateChange?.({ loading: false, verified: false });
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [offerId, onStateChange]);

  const verifiedPrice = data?.ok && data.destinationMatched && typeof data.price === "number" ? data.price : null;

  if (compact) {
    if (loading) return <span className="esky-price-pending">sprawdzamy…</span>;
    if (verifiedPrice !== null) return <><strong>{verifiedPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></>;
    return <span className="esky-price-unverified">sprawdź cenę</span>;
  }

  return (
    <div className="esky-live-price esky-live-price-clean" aria-live="polite">
      {loading ? (
        <div className="esky-live-clean-row"><RefreshCw size={16} className="spin"/><strong>Sprawdzamy aktualną cenę w eSky…</strong></div>
      ) : verifiedPrice !== null ? (
        <div className="esky-live-price-main">
          <small>aktualnie w eSky od</small>
          <strong>{verifiedPrice.toLocaleString("pl-PL")} zł</strong>
          <span>/ os.</span>
        </div>
      ) : (
        <div className="esky-live-clean-row">
          <strong>Aktualna cena jest dynamiczna</strong>
          <span>Sprawdź najtańszy dostępny wariant bezpośrednio w eSky.</span>
        </div>
      )}
    </div>
  );
}
