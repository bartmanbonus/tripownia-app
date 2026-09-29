"use client";

import { useEffect, useMemo, useState } from "react";
import OfferCard from "@/components/OfferCard";
import { offers, isOfferExpired, type Offer } from "@/lib/offers";
import { isTravelDestinationAllowed } from "@/lib/travelSafety";
import styles from "./LiveDepartureDeals.module.css";

type Props = { airportCodes?: string[]; weekendOnly?: boolean; limit?: number };

function uniqueDirections(rows: Offer[]) {
  const seen = new Set<string>();
  return rows.filter((offer) => {
    const key = `${offer.city.toLowerCase()}|${offer.country.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function LiveDepartureDeals({ airportCodes = [], weekendOnly = false, limit = 18 }: Props) {
  const [rows, setRows] = useState<Offer[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "fallback">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    fetch(`/api/today-offers?key=${encodeURIComponent(key)}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        const result = Array.isArray(data?.offers) ? data.offers as Offer[] : [];
        if (!response.ok || data?.ok === false || !result.length) throw new Error("today-offers");
        setRows(result);
        setStatus("live");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setRows(offers);
        setStatus("fallback");
      });
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const result = rows
      .filter((offer) => offer && offer.id && offer.price > 0 && offer.affiliateUrl)
      .filter((offer) => !isOfferExpired(offer))
      .filter((offer) => isTravelDestinationAllowed(offer.city, offer.country))
      .filter((offer) => !airportCodes.length || airportCodes.includes(offer.airportCode))
      .filter((offer) => !weekendOnly || (offer.nights >= 2 && offer.nights <= 4))
      .sort((a, b) => b.score - a.score || a.price - b.price);
    return uniqueDirections(result).slice(0, limit);
  }, [rows, airportCodes, weekendOnly, limit]);

  if (status === "loading") return <div className={styles.loading}>Pobieramy aktualną pulę ofert…</div>;
  if (!filtered.length) return <div className={styles.empty}><strong>Nie ma teraz potwierdzonej oferty spełniającej te warunki.</strong><span>Nie podstawiamy starej ceny tylko po to, żeby zapełnić listę. Zajrzyj później albo ustaw alert.</span></div>;

  return <>
    <div className={styles.status}>{status === "live" ? "● aktualny feed" : "ostatnia bezpieczna pula"} · {filtered.length} różnych kierunków</div>
    <div className={styles.grid}>{filtered.map((offer) => <OfferCard offer={offer} key={offer.id} />)}</div>
  </>;
}
