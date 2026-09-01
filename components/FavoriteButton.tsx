"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ offerId }: { offerId: number }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[];
      setLiked(ids.includes(offerId));
    } catch {
      setLiked(false);
    }
  }, [offerId]);

  function toggle() {
    let ids: number[] = [];
    try { ids = JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[]; } catch {}
    const next = ids.includes(offerId) ? ids.filter(id => id !== offerId) : [...ids, offerId];
    localStorage.setItem("tripownia-favorites", JSON.stringify(next));
    setLiked(next.includes(offerId));
    window.dispatchEvent(new Event("tripownia-favorites-updated"));
  }

  return <button type="button" className={`detail-favorite ${liked ? "active" : ""}`} onClick={toggle}>
    <Heart size={18} fill={liked ? "currentColor" : "none"}/>
    {liked ? "Zapisano w ulubionych" : "Dodaj do ulubionych"}
  </button>;
}
