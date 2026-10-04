"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CircleDollarSign, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { Offer } from "@/lib/offers";
import { getDealScore } from "@/lib/dealScore";
import { liveOfferLandingHref } from "@/lib/liveOfferLanding";
import { trackEvent } from "@/lib/analytics";

type Props = {
  city: string;
  country: string;
  nights: number;
  board: string;
  departure: string;
  airportCode?: string;
  currentOfferId?: number;
  currentPrice?: number;
};

type Choice = {
  key: "cheapest" | "best" | "convenient";
  label: string;
  helper: string;
  offer: Offer;
  score: number;
};

function normalize(value?: string) {
  return (value || "")
    .toLocaleLowerCase("pl")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namedHotel(hotel?: string) {
  const value = normalize(hotel);
  if (!value) return false;
  return !/^(hotel|resort|nocleg|obiekt)( w centrum)?( [1-5])?$/.test(value);
}

function convenienceScore(offer: Offer, airportCode?: string, nights?: number, board?: string) {
  let score = Number(offer.score || 0) * 8;
  if (airportCode && offer.airportCode === airportCode) score += 18;
  if (nights && offer.nights === nights) score += 14;
  if (normalize(board) && normalize(offer.board) === normalize(board)) score += 8;
  if (offer.transferIncluded) score += 8;
  if (offer.baggageIncluded) score += 7;
  if (namedHotel(offer.hotel)) score += 5;
  if (offer.linkMatch === "exact" || offer.linkType === "exact") score += 7;
  return score;
}

function uniqueOffers(offers: Offer[]) {
  const seen = new Set<number>();
  return offers.filter((offer) => {
    if (!offer?.id || seen.has(offer.id)) return false;
    seen.add(offer.id);
    return Boolean(offer.price && offer.affiliateUrl);
  });
}

export default function PurchaseChoices({
  city,
  country,
  nights,
  board,
  departure,
  airportCode,
  currentOfferId = 0,
  currentPrice,
}: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      mode: "search",
      q: [city, country].filter(Boolean).join(", "),
      minNights: String(Math.max(1, (nights || 1) - 1)),
      maxNights: String(Math.max(2, (nights || 1) + 2)),
      fast: "1",
    });

    setLoading(true);
    fetch(`/api/today-offers?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        const next = uniqueOffers(Array.isArray(data?.offers) ? data.offers : [])
          .filter((offer) => !currentOfferId || offer.id !== currentOfferId)
          .slice(0, 24);
        setOffers(next);
        setPartial(Boolean(data?.partial || data?.fallback));
      })
      .catch(() => {
        if (!controller.signal.aborted) setOffers([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [city, country, nights, currentOfferId]);

  const choices = useMemo<Choice[]>(() => {
    if (!offers.length) return [];

    const cheapest = [...offers].sort((a, b) => a.price - b.price || b.score - a.score)[0];
    const best = [...offers].sort((a, b) => {
      const scoreA = getDealScore(a, a.price, a.linkMatch === "exact").score;
      const scoreB = getDealScore(b, b.price, b.linkMatch === "exact").score;
      return scoreB - scoreA || a.price - b.price;
    })[0];
    const convenient = [...offers].sort((a, b) =>
      convenienceScore(b, airportCode, nights, board) - convenienceScore(a, airportCode, nights, board)
      || a.price - b.price
    )[0];

    const raw: Choice[] = [
      {
        key: "cheapest",
        label: "Najtaniej",
        helper: "Najniższa aktualnie znaleziona cena",
        offer: cheapest,
        score: getDealScore(cheapest, cheapest.price, cheapest.linkMatch === "exact").score,
      },
      {
        key: "best",
        label: "Najlepszy wybór",
        helper: "Najlepszy balans ceny, jakości i pewności oferty",
        offer: best,
        score: getDealScore(best, best.price, best.linkMatch === "exact").score,
      },
      {
        key: "convenient",
        label: "Najwygodniej",
        helper: airportCode ? `Preferujemy wylot z ${departure}` : "Preferujemy wygodny wariant i kompletny pakiet",
        offer: convenient,
        score: getDealScore(convenient, convenient.price, convenient.linkMatch === "exact").score,
      },
    ];

    const used = new Set<number>();
    const result: Choice[] = [];
    for (const choice of raw) {
      if (!choice.offer || used.has(choice.offer.id)) continue;
      used.add(choice.offer.id);
      result.push(choice);
    }

    if (result.length < 3) {
      for (const offer of offers) {
        if (result.length >= 3) break;
        if (used.has(offer.id)) continue;
        used.add(offer.id);
        result.push({
          key: result.length === 0 ? "cheapest" : result.length === 1 ? "best" : "convenient",
          label: result.length === 0 ? "Najtaniej" : result.length === 1 ? "Najlepszy wybór" : "Dobra alternatywa",
          helper: "Kolejna sensowna opcja dla tego kierunku",
          offer,
          score: getDealScore(offer, offer.price, offer.linkMatch === "exact").score,
        });
      }
    }

    return result.slice(0, 3);
  }, [offers, airportCode, nights, board, departure]);

  if (!loading && choices.length === 0) return null;

  return (
    <section className="purchase-choices" aria-labelledby="purchase-choices-title">
      <div className="purchase-choices-head">
        <div>
          <div className="kicker">TRIPOWNIA WYBRAŁA ZA CIEBIE</div>
          <h2 id="purchase-choices-title">Nie przekopuj dziesiątek ofert. Porównaj 3 sensowne opcje.</h2>
          <p>
            Bierzemy pod uwagę cenę, długość pobytu, miejsce wylotu, kompletność oferty i jakość linku do rezerwacji.
            {typeof currentPrice === "number" && currentPrice > 0 ? ` Punkt odniesienia: od ${currentPrice.toLocaleString("pl-PL")} zł/os.` : ""}
          </p>
        </div>
        <div className="purchase-choices-trust"><ShieldCheck size={18}/> Najpierw wybór w Tripowni, potem płatność u partnera.</div>
      </div>

      {loading ? (
        <div className="purchase-choices-loading"><LoaderCircle size={20}/> Szukamy najlepszych aktualnych wariantów…</div>
      ) : (
        <>
          <div className="purchase-choices-grid">
            {choices.map((choice) => {
              const href = liveOfferLandingHref(choice.offer, {
                price: choice.offer.price,
                note: choice.offer.reason,
                source: `purchase_choice_${choice.key}`,
              });
              const totalForTwo = choice.offer.price * 2;
              const sameDeparture = airportCode && choice.offer.airportCode === airportCode;
              return (
                <article key={`${choice.key}-${choice.offer.id}`} className={`purchase-choice-card ${choice.key === "best" ? "is-best" : ""}`}>
                  <div className="purchase-choice-label">
                    {choice.key === "cheapest" ? <CircleDollarSign size={17}/> : choice.key === "best" ? <Sparkles size={17}/> : <BadgeCheck size={17}/>}
                    <span><strong>{choice.label}</strong><small>{choice.helper}</small></span>
                  </div>
                  <div className="purchase-choice-price">
                    <small>od</small> <strong>{choice.offer.price.toLocaleString("pl-PL")} zł</strong> <span>/ os.</span>
                  </div>
                  <div className="purchase-choice-total">Dla 2 osób: od <strong>{totalForTwo.toLocaleString("pl-PL")} zł</strong></div>
                  <div className="purchase-choice-meta">
                    <span>{choice.offer.departure}{sameDeparture ? " · ten sam wylot" : ""}</span>
                    <span>{choice.offer.dates}</span>
                    <span>{choice.offer.nights} nocy · {choice.offer.board}</span>
                    <span>{choice.offer.hotel}</span>
                  </div>
                  <div className="purchase-choice-score"><b>Tripownia Score {choice.score}/100</b><span>{choice.offer.reason}</span></div>
                  <Link
                    href={href}
                    className="purchase-choice-cta"
                    onClick={() => trackEvent("purchase_choice_click", {
                      choice: choice.key,
                      offer_id: choice.offer.id,
                      destination: choice.offer.city,
                      price: choice.offer.price,
                      score: choice.score,
                    })}
                  >
                    Wybieram tę opcję →
                  </Link>
                </article>
              );
            })}
          </div>
          {partial && <p className="purchase-choices-note">Część źródeł jest chwilowo niepełna — pokazujemy najlepsze warianty, które możemy teraz potwierdzić.</p>}
        </>
      )}
    </section>
  );
}
