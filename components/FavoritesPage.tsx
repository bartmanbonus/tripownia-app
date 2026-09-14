"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers, type Offer } from "@/lib/offers";
import { FAVORITE_OFFER_SNAPSHOTS_KEY, readSavedOfferSnapshots, type SavedOfferSnapshots } from "@/lib/savedOfferSnapshots";

export default function FavoritesPage() {
  const [ids, setIds] = useState<number[]>([]);
  const [snapshots, setSnapshots] = useState<SavedOfferSnapshots>({});

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]");
        setIds(Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number") : []);
        setSnapshots(readSavedOfferSnapshots(FAVORITE_OFFER_SNAPSHOTS_KEY));
      } catch {
        setIds([]);
        setSnapshots({});
      }
    };
    load();
    window.addEventListener("tripownia-favorites-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-favorites-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const favorites = useMemo(
    () => ids
      .map((id) => snapshots[String(id)] || offers.find((offer) => offer.id === id))
      .filter((offer): offer is Offer => Boolean(offer)),
    [ids, snapshots]
  );
  const activeFavorites = favorites.filter((offer) => offer.availabilityStatus !== "expired");
  const expiredFavorites = favorites.filter((offer) => offer.availabilityStatus === "expired");
  const favoriteIds = new Set(favorites.map((offer) => offer.id));
  const alternatives = offers
    .filter((offer) => offer.availabilityStatus !== "expired" && !favoriteIds.has(offer.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return <main>
    <SiteHeader />
    <section className="shell hub-page favorites-page">
      <div className="kicker">TWOJA LISTA</div>
      <h1>Ulubione</h1>
      <p className="hub-lead">Oferty zapisane na tym urządzeniu. Zachowujemy także dane ofert znalezionych na żywo, żeby nie znikały po odświeżeniu.</p>

      {favorites.length ? (
        <>
          {activeFavorites.length > 0 && <>
            <div className="section-heading"><div><div className="kicker">ZAPISANE</div><h2>Twoje oferty</h2><p>Przy starszej zapisanej ofercie zawsze potwierdź aktualną cenę u partnera.</p></div></div>
            <div className="cards-grid">{activeFavorites.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
          </>}
          {expiredFavorites.length > 0 && <>
            <div className="section-heading favorites-expired-heading"><div><div className="kicker">WYGASŁE</div><h2>Zapisane wcześniej</h2><p>Nie usuwamy ich automatycznie — możesz wrócić do oferty i zobaczyć podobne aktualne propozycje.</p></div></div>
            <div className="cards-grid">{expiredFavorites.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
          </>}
          {expiredFavorites.length > 0 && alternatives.length > 0 && <>
            <div className="section-heading favorites-alternatives"><div><div className="kicker">ZAMIAST WYGASŁYCH</div><h2>Inne propozycje Tripowni</h2></div></div>
            <div className="cards-grid">{alternatives.map((offer) => <OfferCard key={offer.id} offer={offer}/>)}</div>
          </>}
        </>
      ) : (
        <div className="favorites-empty">
          <Heart size={34}/>
          <h2>Nie masz jeszcze zapisanych ofert</h2>
          <p>Kliknij serduszko przy interesującej propozycji, a znajdziesz ją tutaj przy kolejnej wizycie na tym urządzeniu.</p>
          <Link className="primary-cta" href="/okazje"><ArrowLeft size={17}/> Zobacz aktualne okazje</Link>
        </div>
      )}
    </section>
    <SiteFooter />
  </main>;
}
