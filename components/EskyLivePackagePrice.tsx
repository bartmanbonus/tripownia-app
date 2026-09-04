"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Utensils } from "lucide-react";

type LivePrice = {
  ok: boolean;
  price?: number;
  currency?: string;
  checkedAt?: string;
  boardMatched?: boolean;
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
  fallbackPrice,
  board,
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

    fetch(`/api/esky/package-price?offerId=${offerId}`, {
      cache: "no-store",
      signal: controller.signal,
    })
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
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [offerId, onStateChange]);

  const verifiedPrice = data?.ok && data.destinationMatched && typeof data.price === "number" ? data.price : null;
  const isCheaper = verifiedPrice !== null && verifiedPrice < fallbackPrice;
  const normalizedBoard = String(board || "").toLocaleLowerCase("pl-PL");
  const breakfast = normalizedBoard.includes("śniad") || normalizedBoard.includes("sniad");

  if (compact) {
    if (loading) return <><strong>{fallbackPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></>;
    if (verifiedPrice !== null) return <><strong>{verifiedPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></>;
    return <><strong>{fallbackPrice.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span></>;
  }

  return (
    <div className="esky-live-price" aria-live="polite">
      <div className="esky-live-price-main">
        <small>{verifiedPrice !== null ? "potwierdzona cena eSky od" : "ostatnio potwierdziliśmy od"}</small>
        <strong>{(verifiedPrice ?? fallbackPrice).toLocaleString("pl-PL")} zł</strong>
        <span>/ os.</span>
      </div>

      {loading ? (
        <div className="esky-live-price-note"><RefreshCw size={14} className="spin"/> Sprawdzamy, czy eSky potwierdza tę cenę dla właściwego kierunku…</div>
      ) : verifiedPrice !== null ? (
        <div className="esky-live-price-note success">
          <RefreshCw size={14}/>
          {isCheaper ? `eSky potwierdza teraz niższą cenę o ${(fallbackPrice - verifiedPrice).toLocaleString("pl-PL")} zł/os.` : "Cena została potwierdzona automatycznie dla właściwego kierunku."}
        </div>
      ) : (
        <div className="esky-live-price-note">Nie udało się pobrać nowej ceny z eSky. Zostawiamy ostatnią potwierdzoną kwotę zamiast podstawiać przypadkową cenę.</div>
      )}

      {breakfast && (
        <div className={`esky-board-requirement ${data?.boardMatched ? "matched" : ""}`}>
          <Utensils size={14}/>
          <strong>Śniadanie</strong>
          <span>{data?.boardMatched ? "— potwierdzona cena dotyczy wariantu ze śniadaniem." : "— przy wyborze oferty w eSky pilnuj wariantu oznaczonego „Śniadanie”."}</span>
        </div>
      )}
    </div>
  );
}
