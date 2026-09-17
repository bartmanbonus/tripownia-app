"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Compass, MapPin, Sparkles, WalletCards } from "lucide-react";
import { readTravelProfile, saveTravelProfile, type TravelDurationPreference, type TravelIntent, type TravelScheduleMode, type TravelValuePriority } from "@/lib/travelProfile";
import { trackEvent } from "@/lib/analytics";

const departures = ["Warszawa", "Kraków", "Katowice", "Gdańsk", "Poznań", "Wrocław"];
const budgets = [1500, 3000, 5000, 7500];
const scheduleModes: Array<{ value: TravelScheduleMode; label: string; text: string }> = [
  { value: "weekend", label: "Weekend", text: "Chcę wykorzystać głównie sobotę i niedzielę" },
  { value: "short_leave", label: "1–2 dni urlopu", text: "Mogę dołożyć trochę wolnego do weekendu" },
  { value: "leave", label: "Mam urlop", text: "Mogę lecieć w tygodniu i na dłużej" },
  { value: "any", label: "Jestem elastyczna/y", text: "Termin nie ogranicza mnie mocno" },
];
const intents: Array<{ value: TravelIntent; label: string }> = [
  { value: "quick", label: "Po prostu gdzieś polecieć" },
  { value: "rest", label: "Dłuższy odpoczynek" },
  { value: "capitals", label: "Stolice" },
  { value: "new_country", label: "Nowy kraj" },
  { value: "far", label: "Coś dalej" },
  { value: "any", label: "Zaskocz mnie" },
];
const durations: Array<{ value: TravelDurationPreference; label: string }> = [
  { value: "short", label: "2–4 noce" },
  { value: "week", label: "5–8 nocy" },
  { value: "long", label: "9+ nocy" },
  { value: "any", label: "Bez znaczenia" },
];
const priorities: Array<{ value: TravelValuePriority; label: string }> = [
  { value: "price", label: "Najniższa cena" },
  { value: "balance", label: "Cena + wygoda" },
  { value: "time", label: "Wolę dopłacić i oszczędzić czas" },
];

export default function PurchaseGuidePortal() {
  const pathname = usePathname();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [helperOpen, setHelperOpen] = useState(false);
  const [departure, setDeparture] = useState("Warszawa");
  const [budget, setBudget] = useState(3000);
  const [scheduleMode, setScheduleMode] = useState<TravelScheduleMode>("weekend");
  const [maxLeaveDays, setMaxLeaveDays] = useState(2);
  const [intent, setIntent] = useState<TravelIntent>("quick");
  const [durationPreference, setDurationPreference] = useState<TravelDurationPreference>("short");
  const [valuePriority, setValuePriority] = useState<TravelValuePriority>("balance");
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
      scheduleMode,
      maxLeaveDays: scheduleMode === "weekend" ? 0 : scheduleMode === "short_leave" ? maxLeaveDays : Math.max(maxLeaveDays, 5),
      tripIntent: intent,
      durationPreference,
      valuePriority,
      styles: intent === "rest" ? ["plaza", "cieplo"] : intent === "capitals" ? ["city"] : intent === "quick" ? ["city", "weekend"] : current.styles,
      warmOnly: false,
      standard: valuePriority === "price" ? "budget" : current.standard,
      avoidTransfers: valuePriority === "time",
    });
    trackEvent("purchase_guide_path", { path: "guided_recommendation", departure, budget, scheduleMode, maxLeaveDays, intent, durationPreference, valuePriority });
    window.location.href = "/dla-ciebie";
  }

  if (!visible || !host) return null;

  return createPortal(
    <section className="shell purchase-guide" aria-labelledby="purchase-guide-title">
      <div className="purchase-guide-head">
        <div>
          <span className="purchase-guide-kicker"><Sparkles size={14}/> TRIPOWNIA PROWADZI</span>
          <h2 id="purchase-guide-title">Nie wiesz gdzie ani kiedy? To wystarczy.</h2>
          <p>Powiedz nam, jak wygląda Twoje życie: kiedy możesz wyjechać, ile czasu masz i jaki masz budżet. Tripownia dobierze kierunki, które naprawdę mają sens.</p>
        </div>
        <div className="purchase-guide-steps" aria-label="Ścieżka zakupu">
          <span><b>1</b> Ograniczenia</span>
          <span><b>2</b> Sensowne propozycje</span>
          <span><b>3</b> Rezerwacja</span>
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
          <span><small>NIE WIEM, DOKĄD ANI KIEDY</small><strong>Dobierz wyjazd do mojego życia</strong><em>Weekend, urlop, budżet, długość i styl podróży — resztę robimy my.</em></span>
          <ArrowRight size={18}/>
        </button>

        <button type="button" className="purchase-guide-path" onClick={goToDeals}>
          <span className="purchase-guide-icon"><WalletCards size={21}/></span>
          <span><small>CHCĘ SZYBKO</small><strong>Pokaż najlepsze okazje</strong><em>Przejdź prosto do dzisiejszej selekcji Tripowni.</em></span>
          <ArrowRight size={18}/>
        </button>
      </div>

      {helperOpen && (
        <div className="purchase-guide-helper purchase-guide-helper-expanded">
          <div className="purchase-guide-helper-head">
            <div><small>MINUTA</small><strong>Powiedz, co Cię ogranicza. To ważniejsze niż wybranie kierunku.</strong></div>
            <button type="button" onClick={() => setHelperOpen(false)}>Zamknij</button>
          </div>

          <div className="purchase-guide-helper-grid purchase-guide-real-life-grid">
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

            <div className="purchase-guide-choice purchase-guide-wide">
              <span><BriefcaseBusiness size={14}/> Kiedy realnie możesz wyjechać?</span>
              <div>{scheduleModes.map((item) => <button type="button" key={item.value} className={scheduleMode === item.value ? "active" : ""} onClick={() => setScheduleMode(item.value)} title={item.text}>{item.label}</button>)}</div>
            </div>

            {(scheduleMode === "short_leave" || scheduleMode === "leave") && (
              <label>
                <span>Maks. dni roboczych poza pracą</span>
                <select value={maxLeaveDays} onChange={(event) => setMaxLeaveDays(Number(event.target.value))}>
                  {[1,2,3,4,5,7,10,14].map((item) => <option key={item} value={item}>{item} {item === 1 ? "dzień" : "dni"}</option>)}
                </select>
              </label>
            )}

            <div className="purchase-guide-choice purchase-guide-wide">
              <span>Po co teraz chcesz lecieć?</span>
              <div>{intents.map((item) => <button type="button" key={item.value} className={intent === item.value ? "active" : ""} onClick={() => setIntent(item.value)}>{item.label}</button>)}</div>
            </div>

            <div className="purchase-guide-choice">
              <span>Jak długo?</span>
              <div>{durations.map((item) => <button type="button" key={item.value} className={durationPreference === item.value ? "active" : ""} onClick={() => setDurationPreference(item.value)}>{item.label}</button>)}</div>
            </div>

            <div className="purchase-guide-choice purchase-guide-wide">
              <span>Co jest ważniejsze?</span>
              <div>{priorities.map((item) => <button type="button" key={item.value} className={valuePriority === item.value ? "active" : ""} onClick={() => setValuePriority(item.value)}>{item.label}</button>)}</div>
            </div>
          </div>

          <button type="button" className="purchase-guide-submit" onClick={showRecommendations}>Dobierz wyjazdy, które mają sens <ArrowRight size={17}/></button>
          <p>Tripownia nie liczy „dni” z samej różnicy dat. Pokazujemy noce i wpływ wyjazdu na dni robocze; efektywny czas na miejscu liczymy tylko wtedy, gdy źródło udostępnia godziny lotów.</p>
        </div>
      )}
    </section>,
    host,
  );
}
