"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, MapPin, Sparkles, WalletCards } from "lucide-react";
import { readTravelProfile, saveTravelProfile } from "@/lib/travelProfile";
import { trackEvent } from "@/lib/analytics";

const departures = ["Warszawa", "Kraków", "Katowice", "Gdańsk", "Poznań", "Wrocław"];
const budgets = [1500, 3000, 5000, 7500];
const needs = [
  { value: "city", label: "City break" },
  { value: "cieplo", label: "Ciepło" },
  { value: "plaza", label: "Plaża" },
  { value: "allinclusive", label: "All Inclusive" },
  { value: "tanio", label: "Najlepsza cena" },
] as const;

export default function PurchaseGuidePortal() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [helperOpen, setHelperOpen] = useState(false);
  const [departure, setDeparture] = useState("Warszawa");
  const [budget, setBudget] = useState(3000);
  const [need, setNeed] = useState<(typeof needs)[number]["value"]>("cieplo");
  const visible = pathname === "/";

  useEffect(() => {
    if (!visible) {
      setHost(null);
      return;
    }

    const target = document.querySelector<HTMLElement>("#wyszukiwarka");
    if (!target) return;

    const mount = document.createElement("div");
    mount.className = "purchase-guide-mount";
    target.insertAdjacentElement("beforebegin", mount);
    setHost(mount);

    return () => {
      mount.remove();
      setHost(null);
    };
  }, [pathname, visible]);

  function goToSearch() {
    trackEvent("purchase_guide_path", { path: "known_destination" });
    document.querySelector<HTMLElement>("#wyszukiwarka")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.querySelector<HTMLInputElement>("#tripownia-destination")?.focus(), 520);
  }

  function goToDeals() {
    trackEvent("purchase_guide_path", { path: "best_deals" });
    document.querySelector<HTMLElement>("#okazje")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showRecommendations() {
    const current = readTravelProfile();
    saveTravelProfile({
      ...current,
      departure,
      budget,
      styles: [need],
      warmOnly: need === "cieplo",
      standard: need === "tanio" ? "budget" : current.standard,
      avoidTransfers: true,
    });
    trackEvent("purchase_guide_path", { path: "guided_recommendation", departure, budget, need });
    window.location.href = "/dla-ciebie";
  }

  if (!visible || !host) return null;

  return createPortal(
    <section className="shell purchase-guide" aria-labelledby="purchase-guide-title">
      <div className="purchase-guide-head">
        <div>
          <span className="purchase-guide-kicker"><Sparkles size={14}/> TRIPOWNIA PROWADZI</span>
          <h2 id="purchase-guide-title">Nie musisz wiedzieć wszystkiego. Zacznij od tego, co już wiesz.</h2>
          <p>Wybierz swoją sytuację, a pokażemy Ci najkrótszą drogę do konkretnej oferty.</p>
        </div>
        <div className="purchase-guide-steps" aria-label="Ścieżka zakupu">
          <span><b>1</b> Powiedz czego szukasz</span>
          <span><b>2</b> Porównaj konkretne oferty</span>
          <span><b>3</b> Rezerwuj u partnera</span>
        </div>
      </div>

      <div className="purchase-guide-paths">
        <button type="button" className="purchase-guide-path" onClick={goToSearch}>
          <span className="purchase-guide-icon"><MapPin size={21}/></span>
          <span><small>WIEM, DOKĄD</small><strong>Mam kierunek</strong><em>Ustaw termin, budżet i zobacz aktualne oferty.</em></span>
          <ArrowRight size={18}/>
        </button>

        <button type="button" className="purchase-guide-path is-featured" onClick={() => { setHelperOpen((value) => !value); trackEvent("purchase_guide_path", { path: "need_help_open" }); }}>
          <span className="purchase-guide-icon"><Compass size={21}/></span>
          <span><small>NIE WIEM, DOKĄD</small><strong>Dobierz wyjazd dla mnie</strong><em>Powiedz skąd lecisz, ile chcesz wydać i czego potrzebujesz.</em></span>
          <ArrowRight size={18}/>
        </button>

        <button type="button" className="purchase-guide-path" onClick={goToDeals}>
          <span className="purchase-guide-icon"><WalletCards size={21}/></span>
          <span><small>CHCĘ SZYBKO</small><strong>Pokaż najlepsze okazje</strong><em>Przejdź prosto do dzisiejszej selekcji Tripowni.</em></span>
          <ArrowRight size={18}/>
        </button>
      </div>

      {helperOpen && (
        <div className="purchase-guide-helper">
          <div className="purchase-guide-helper-head">
            <div><small>30 SEKUND</small><strong>Podaj 3 rzeczy. Resztę dobierze Tripownia.</strong></div>
            <button type="button" onClick={() => setHelperOpen(false)}>Zamknij</button>
          </div>

          <div className="purchase-guide-helper-grid">
            <label>
              <span>Skąd lecisz?</span>
              <select value={departure} onChange={(event) => setDeparture(event.target.value)}>
                {departures.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <div className="purchase-guide-choice">
              <span>Budżet / os.</span>
              <div>{budgets.map((item) => <button type="button" key={item} className={budget === item ? "active" : ""} onClick={() => setBudget(item)}>do {item.toLocaleString("pl-PL")} zł</button>)}</div>
            </div>

            <div className="purchase-guide-choice purchase-guide-need">
              <span>Czego najbardziej potrzebujesz?</span>
              <div>{needs.map((item) => <button type="button" key={item.value} className={need === item.value ? "active" : ""} onClick={() => setNeed(item.value)}>{item.label}</button>)}</div>
            </div>
          </div>

          <button type="button" className="purchase-guide-submit" onClick={showRecommendations}>Pokaż mi dopasowane oferty <ArrowRight size={17}/></button>
          <p>Nie zamykamy Cię w jednym wyborze — najpierw pokażemy najlepsze dopasowania, a dalej sensowne alternatywy.</p>
        </div>
      )}
    </section>,
    host,
  );
}
