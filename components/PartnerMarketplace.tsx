"use client";

import { useEffect, useId } from "react";
import EskyLiveWidget from "@/components/EskyLiveWidget";
import { partners } from "@/lib/partners";

type Mode = "city" | "holiday" | "lastminute";

const copy = {
  city: {
    kicker: "PEŁNA OFERTA — NIE TYLKO REKOMENDACJE",
    title: "Wyszukaj dowolny city break i wybierz samodzielnie",
    lead: "Nasze okazje są tylko skrótem. Poniżej możesz przeszukać pełne bazy partnerów i kupić wyjazd bez ograniczenia do ofert publikowanych przez Tripownię.",
  },
  holiday: {
    kicker: "PEŁNE WAKACJE PARTNERÓW",
    title: "Porównaj wakacje z kilku źródeł",
    lead: "All Inclusive, rodzinne wakacje, egzotyka i klasyczne pakiety. Tripownia pokazuje inspiracje, ale decyzję możesz podjąć na pełnej ofercie partnerów.",
  },
  lastminute: {
    kicker: "PEŁNE LAST MINUTE PARTNERÓW",
    title: "Sprawdź wszystko, co jest dostępne teraz",
    lead: "Last minute zmienia się bardzo szybko, dlatego obok naszych propozycji dajemy bezpośredni dostęp do pełnych baz touroperatorów.",
  },
} as const;

export default function PartnerMarketplace({ mode = "holiday" }: { mode?: Mode }) {
  const uid = useId().replace(/:/g, "");
  const wakacjeId = `wakacje-search-${uid}`;

  useEffect(() => {
    const host = document.getElementById(wakacjeId);
    if (!host) return;
    host.innerHTML = "";
    const holder = document.createElement("div");
    const holderId = `${wakacjeId}-holder`;
    holder.id = holderId;
    holder.dataset.widget = "search";
    holder.dataset.branding = "false";
    holder.dataset.affiliate = "3212";
    holder.dataset.campaign = "3212-tripownia.pl";
    host.appendChild(holder);
    const script = document.createElement("script");
    script.src = `https://widget.wakacje.pl/v2/public/js/widgets/search-widget-v2.js?c=${encodeURIComponent(holderId)}`;
    script.async = true;
    host.appendChild(script);
    return () => { host.innerHTML = ""; };
  }, [wakacjeId]);

  const tuiUrl = partners.tui.buildUrl(mode === "lastminute" ? "https://www.tui.pl/last-minute" : "https://www.tui.pl/wypoczynek");
  const eximUrl = partners.exim.buildUrl(mode === "lastminute" ? "https://www.exim.pl/last-minute" : "https://www.exim.pl/wakacje");
  const wakacjeUrl = partners.wakacje.buildUrl(mode === "lastminute" ? "https://www.wakacje.pl/last-minute/" : "https://www.wakacje.pl/");
  const eskyUrl = partners.esky.buildUrl("https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages");
  const c = copy[mode];

  return <section className="partner-marketplace">
    <div className="partner-marketplace-head">
      <div className="kicker">{c.kicker}</div>
      <h2>{c.title}</h2>
      <p>{c.lead}</p>
    </div>

    <div className="partner-marketplace-grid">
      <article className="partner-marketplace-live partner-marketplace-esky">
        <div className="partner-marketplace-title"><span>✈️</span><div><strong>eSky</strong><small>Lot + hotel i city break</small></div></div>
        <EskyLiveWidget mode="packages" />
        <a className="partner-marketplace-link" href={eskyUrl} target="_blank" rel="sponsored noopener noreferrer">Otwórz pełną ofertę eSky →</a>
      </article>

      <article className="partner-marketplace-live partner-marketplace-wakacje">
        <div className="partner-marketplace-title"><span>🏖️</span><div><strong>Wakacje.pl</strong><small>Pakiety wielu biur podróży</small></div></div>
        <div id={wakacjeId} className="partner-marketplace-widget" />
        <a className="partner-marketplace-link" href={wakacjeUrl} target="_blank" rel="sponsored noopener noreferrer">Otwórz pełną ofertę Wakacje.pl →</a>
      </article>
    </div>

    <div className="partner-direct-grid">
      <a href={tuiUrl} target="_blank" rel="sponsored noopener noreferrer"><span>🌴</span><div><strong>TUI</strong><small>Pełna baza wakacji i pakietów</small></div><b>Sprawdź →</b></a>
      <a href={eximUrl} target="_blank" rel="sponsored noopener noreferrer"><span>☀️</span><div><strong>EXIM Tours</strong><small>Wakacje, czartery i last minute</small></div><b>Sprawdź →</b></a>
    </div>
    <p className="partner-marketplace-note">Ceny, terminy i dostępność są pobierane lub finalnie potwierdzane w systemach partnerów. Linki są afiliacyjne.</p>
  </section>;
}
