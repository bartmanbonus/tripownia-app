"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Utensils } from "lucide-react";

type LivePrice = {
  ok: boolean;
  price?: number;
  currency?: string;
  checkedAt?: string;
  boardMatched?: boolean;
  source?: string;
};

export default function EskyLivePackagePrice({
  offerId,
  fallbackPrice,
  board,
}: {
  offerId: number;
  fallbackPrice: number;
  board?: string;
}) {
  const [data, setData] = useState<LivePrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetch(`/api/esky/package-price?offerId=${offerId}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as LivePrice;
      })
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setData({ ok: false });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [offerId]);

  const livePrice = data?.ok && typeof data.price === "number" ? data.price : null;
  const isCheaper = livePrice !== null && livePrice < fallbackPrice;
  const normalizedBoard = String(board || "").toLocaleLowerCase("pl-PL");
  const breakfast = normalizedBoard.includes("śniad") || normalizedBoard.includes("sniad");

  return (
    <div className="esky-live-price" aria-live="polite">
      <div className="esky-live-price-main">
        <small>{livePrice !== null ? "aktualnie u eSky od" : "cena zapamiętana przez Tripownię od"}</small>
        <strong>{(livePrice ?? fallbackPrice).toLocaleString("pl-PL")} zł</strong>
        <span>/ os.</span>
      </div>

      {loading ? (
        <div className="esky-live-price-note"><RefreshCw size={14} className="spin"/> Sprawdzamy aktualną najniższą cenę…</div>
      ) : livePrice !== null ? (
        <div className="esky-live-price-note success">
          <RefreshCw size={14}/>
          {isCheaper ? `Teraz znaleźliśmy taniej o ${(fallbackPrice - livePrice).toLocaleString("pl-PL")} zł/os.` : "Cena odświeżona automatycznie przy wejściu na ofertę."}
        </div>
      ) : (
        <div className="esky-live-price-note">Aktualna cena i dostępność zostaną potwierdzone po przejściu do eSky.</div>
      )}

      {breakfast && (
        <div className={`esky-board-requirement ${data?.boardMatched ? "matched" : ""}`}>
          <Utensils size={14}/>
          <strong>Śniadanie</strong>
          <span>{data?.boardMatched ? "— cena live została znaleziona przy wariancie ze śniadaniem." : "— wybieraj w wynikach warianty oznaczone „Śniadanie”."}</span>
        </div>
      )}
    </div>
  );
}
