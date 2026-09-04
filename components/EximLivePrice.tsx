"use client";

import { useEffect, useState } from "react";

type Props = {
  destination: string;
  country: string;
  from: string;
  nights: number;
  board: string;
  fallbackPrice: number;
  compact?: boolean;
  onStateChange?: (state: { loading: boolean; available: boolean; price?: number; isStillDeal?: boolean }) => void;
};

type ApiResult = {
  available: boolean;
  pricePerPerson?: number;
  totalPrice?: number;
  productName?: string;
  checkedAt?: string;
};

export default function EximLivePrice({ destination, country, from, nights, board, fallbackPrice, compact = false, onStateChange }: Props) {
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const qs = new URLSearchParams({ destination, country, from, nights: String(nights), board });
    setLoading(true);
    fetch(`/api/exim/best?${qs.toString()}`, { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((value: ApiResult) => {
        setData(value);
        const price = value.pricePerPerson;
        const isStillDeal = Boolean(value.available && price && price <= Math.round(fallbackPrice * 1.3));
        onStateChange?.({ loading: false, available: Boolean(value.available), price, isStillDeal });
      })
      .catch(() => onStateChange?.({ loading: false, available: false }))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [destination, country, from, nights, board, fallbackPrice, onStateChange]);

  if (loading) {
    return compact ? <span>sprawdzamy cenę…</span> : <><div className="detail-price"><small>sprawdzamy aktualną cenę EXIM</small></div><div className="price-status detail-price-status">Chwila — porównujemy aktualny feed partnera.</div></>;
  }

  if (!data?.available || !data.pricePerPerson) {
    return compact ? <span>sprawdź aktualną cenę</span> : <><div className="detail-price"><small>cena wymaga potwierdzenia</small></div><div className="price-status detail-price-status">Nie pokazujemy starej ceny jako aktualnej okazji.</div></>;
  }

  const live = data.pricePerPerson;
  const isStillDeal = live <= Math.round(fallbackPrice * 1.3);

  if (compact) {
    return <><strong>{live} zł</strong> <span>/ os.</span></>;
  }

  return <>
    <div className="detail-price"><small>aktualnie w feedzie EXIM od</small> <strong>{live} zł</strong> / os.</div>
    <div className="price-status detail-price-status">
      {isStillDeal
        ? `Cena potwierdzona automatycznie w aktualnym feedzie EXIM${data.productName ? ` · ${data.productName}` : ""}.`
        : `Cena wzrosła względem ${fallbackPrice} zł — Tripownia nie traktuje tej propozycji teraz jako okazji.`}
    </div>
  </>;
}
