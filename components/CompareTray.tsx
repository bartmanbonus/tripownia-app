"use client";

import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useEffect, useState } from "react";
import { COMPARE_OFFER_SNAPSHOTS_KEY, pruneOfferSnapshots, readSavedOfferSnapshots, type SavedOfferSnapshots } from "@/lib/savedOfferSnapshots";

function readCompareIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem("tripownia-compare") || "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number").slice(-3) : [];
  } catch {
    localStorage.removeItem("tripownia-compare");
    return [];
  }
}

export default function CompareTray() {
  const [ids, setIds] = useState<number[]>([]);
  const [snapshots, setSnapshots] = useState<SavedOfferSnapshots>({});

  useEffect(() => {
    const load = () => { setIds(readCompareIds()); setSnapshots(readSavedOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY)); };
    load();
    window.addEventListener("tripownia-compare-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-compare-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  if (!ids.length) return null;

  function clear() {
    localStorage.removeItem("tripownia-compare");
    localStorage.removeItem(COMPARE_OFFER_SNAPSHOTS_KEY);
    setIds([]);
    setSnapshots({});
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  function remove(id: number) {
    const next = ids.filter((item) => item !== id);
    localStorage.setItem("tripownia-compare", JSON.stringify(next));
    pruneOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY, next);
    setIds(next);
    setSnapshots(readSavedOfferSnapshots(COMPARE_OFFER_SNAPSHOTS_KEY));
    window.dispatchEvent(new Event("tripownia-compare-updated"));
  }

  return (
    <aside className="compare-tray" aria-live="polite" aria-label="Oferty do porównania">
      <div className="compare-tray-copy">
        <Scale size={18} />
        <div>
          <strong>{ids.length === 1 ? "1 oferta do porównania" : `${ids.length} oferty do porównania`}</strong>
          <span>{ids.length < 2 ? "Dodaj jeszcze jedną, żeby zobaczyć zestawienie." : "Możesz porównać do 3 ofert jednocześnie."}</span>
          <div className="compare-tray-items">
            {ids.map((id) => {
              const offer = snapshots[String(id)];
              return (
                <button type="button" key={id} onClick={() => remove(id)} title="Usuń z porównania">
                  <span>{offer?.city || "Oferta"}</span><X size={12} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="compare-tray-actions">
        <button type="button" onClick={clear} aria-label="Wyczyść porównanie"><X size={16} /> Wyczyść</button>
        <Link href="/porownaj" className={ids.length < 2 ? "is-disabled" : ""} aria-disabled={ids.length < 2}>
          Porównaj teraz →
        </Link>
      </div>
    </aside>
  );
}
