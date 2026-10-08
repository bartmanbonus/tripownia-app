"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, RotateCcw, MousePointerClick, Database, ShieldCheck } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";

type Stats = {
  total: number;
  byPartner: Record<string, number>;
  bySource: Record<string, number>;
  byOffer: Record<string, { count: number; partner: string; destination: string }>;
  recent: Array<{
    ts: string;
    partner: string;
    source: string;
    offer?: string | null;
    destination?: string | null;
    price?: string | null;
    page?: string | null;
  }>;
  byDay?: Record<string, number>;
  byAttributionSource?: Record<string, number>;
  byLanding?: Record<string, number>;
  googleOrganicByLanding?: Record<string, number>;
  googleOrganicClicks?: number;
  updatedAt?: string;
  scope?: "global" | "local";
  days?: number;
  authStatus?: "admin" | "signed_out" | "forbidden" | "unauthorized" | "error";
  truncated?: boolean;
};

const empty: Stats = { total: 0, byPartner: {}, bySource: {}, byOffer: {}, recent: [], byDay: {} };

function labelSource(value: string) {
  return value
    .replace("offer_card:homepage", "Karta — strona główna")
    .replace("offer_image:homepage", "Zdjęcie — strona główna")
    .replace("offer_card:app_home", "Karta — aplikacja")
    .replace("offer_image:app_home", "Zdjęcie — aplikacja")
    .replace("offer_card:search_results", "Karta — wyszukiwarka")
    .replace("offer_image:search_results", "Zdjęcie — wyszukiwarka")
    .replace("offer_card:okazje", "Karta — Okazje")
    .replace("offer_image:okazje", "Zdjęcie — Okazje")
    .replace("offer_card:live_sales_rail", "Karta — karuzela live")
    .replace("offer_image:live_sales_rail", "Zdjęcie — karuzela live")
    .replace("offer_detail_primary", "Oferta — główne CTA")
    .replace("offer_detail_mobile", "Oferta — mobile")
    .replace("search_flights", "Wyszukiwarka — loty")
    .replace("search_hotels", "Wyszukiwarka — hotele")
    .replaceAll("_", " ");
}

function downloadCsv(rows: string[][], filename: string) {
  const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminAffiliateDashboard() {
  const [stats, setStats] = useState<Stats>(empty);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  async function load(period = days) {
    setLoading(true);
    try {
      const response = await adminFetch(`/api/admin/click-stats?days=${period}`);
      const data = await response.json();
      setStats(data.stats || empty);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(days); }, [days]);

  const partners = useMemo(
    () => Object.entries(stats.byPartner).sort((a,b) => b[1] - a[1]),
    [stats.byPartner]
  );
  const sources = useMemo(
    () => Object.entries(stats.bySource).sort((a,b) => b[1] - a[1]),
    [stats.bySource]
  );
  const offers = useMemo(
    () => Object.entries(stats.byOffer).sort((a,b) => b[1].count - a[1].count),
    [stats.byOffer]
  );
  const landings = useMemo(
    () => Object.entries(stats.byLanding || {}).sort((a,b) => b[1] - a[1]),
    [stats.byLanding]
  );
  const googleLandings = useMemo(
    () => Object.entries(stats.googleOrganicByLanding || {}).sort((a,b) => b[1] - a[1]),
    [stats.googleOrganicByLanding]
  );
  const dayRows = useMemo(
    () => Object.entries(stats.byDay || {}).sort((a,b) => a[0].localeCompare(b[0])),
    [stats.byDay]
  );

  const topPartner = partners[0]?.[0] || "—";
  const topSource = sources[0]?.[0] || "—";
  const topLanding = landings[0]?.[0] || "—";
  const maxDay = Math.max(1, ...dayRows.map(([,count]) => count));
  const isGlobal = stats.scope === "global";

  async function reset() {
    if (isGlobal) return;
    if (!window.confirm("Wyzerować lokalne statystyki klików w tej przeglądarce?")) return;
    await adminFetch("/api/admin/click-stats", { method: "DELETE" });
    setStats(empty);
  }

  function exportCsv() {
    const rows = [
      ["Typ","Nazwa","Kliknięcia"],
      ...partners.map(([name,count]) => ["Partner", name, String(count)]),
      ...sources.map(([name,count]) => ["Źródło CTA", labelSource(name), String(count)]),
      ...offers.map(([id,data]) => ["Oferta", `#${id} ${data.destination || ""} (${data.partner})`, String(data.count)]),
      ...dayRows.map(([day,count]) => ["Dzień", day, String(count)]),
    ];
    downloadCsv(rows, `tripownia-kliki-afiliacyjne-${days}d-${new Date().toISOString().slice(0,10)}.csv`);
  }

  return (
    <div className="affiliate-dashboard">
      <div className="admin-panel-head">
        <div>
          <h2>Dashboard klików afiliacyjnych</h2>
          <p>
            {isGlobal
              ? `Globalne wyjścia do partnerów ze wszystkich urządzeń — ostatnie ${days} dni.`
              : "Lokalny podgląd tej przeglądarki. Globalny raport wymaga zalogowanego konta z rolą admin."}
          </p>
        </div>
        <div className="admin-audit-actions">
          {[7,30,90].map(period => (
            <button
              key={period}
              type="button"
              className={days === period ? "admin-export active" : "admin-export"}
              onClick={() => setDays(period)}
              disabled={loading}
            >
              {period} dni
            </button>
          ))}
          <button type="button" className="admin-export" onClick={() => load(days)} disabled={loading}>
            <RefreshCw size={16}/> Odśwież
          </button>
          <button type="button" className="admin-export" onClick={exportCsv} disabled={!stats.total}>
            <Download size={16}/> CSV
          </button>
          {!isGlobal && (
            <button type="button" className="admin-reset-draft" onClick={reset} disabled={!stats.total}>
              <RotateCcw size={16}/> Wyzeruj lokalne
            </button>
          )}
        </div>
      </div>

      <div className="admin-local-warning">
        {isGlobal ? (
          <span><ShieldCheck size={16}/> <strong>Globalny raport aktywny.</strong> Dane są zapisane w Supabase i obejmują użytkowników niezależnie od urządzenia i zgody na GA.</span>
        ) : (
          <span>
            <Database size={16}/> <strong>Tryb lokalny.</strong>{" "}
            {stats.authStatus === "forbidden"
              ? "Jesteś zalogowana/y, ale konto nie ma roli admin."
              : stats.authStatus === "unauthorized"
                ? "Sesja wygasła — zaloguj się ponownie."
                : "Zaloguj się na konto administracyjne, aby zobaczyć globalne dane."}{" "}
            <Link href="/konto">Przejdź do konta →</Link>
          </span>
        )}
      </div>

      {stats.truncated && (
        <div className="admin-local-warning">
          <span><Database size={16}/> <strong>Raport osiągnął limit 50 tys. rekordów.</strong> Skróć zakres do 7 lub 30 dni, żeby zobaczyć pełne dane bez zaniżania.</span>
        </div>
      )}

      <div className="affiliate-kpis">
        <div><small>KLIKNIĘCIA</small><strong>{stats.total}</strong><span>{isGlobal ? `wszyscy użytkownicy · ${days} dni` : "ta przeglądarka"}</span></div>
        <div><small>GOOGLE → PARTNER</small><strong>{stats.googleOrganicClicks || 0}</strong><span>wyjścia afiliacyjne z ruchu organicznego</span></div>
        <div><small>TOP PARTNER</small><strong>{topPartner}</strong><span>{partners[0]?.[1] || 0} kliknięć</span></div>
        <div><small>TOP MIEJSCE</small><strong>{topSource === "—" ? "—" : labelSource(topSource)}</strong><span>{sources[0]?.[1] || 0} kliknięć</span></div>
        <div><small>TOP LANDING</small><strong>{topLanding}</strong><span>{landings[0]?.[1] || 0} wyjść do partnera</span></div>
        <div><small>OSTATNIA AKTYWNOŚĆ</small><strong>{stats.updatedAt ? new Date(stats.updatedAt).toLocaleString("pl-PL") : "—"}</strong><span>ostatni zapis</span></div>
      </div>

      {!stats.total ? (
        <div className="affiliate-empty">
          <MousePointerClick size={28}/>
          <strong>Jeszcze nie ma klików w wybranym zakresie.</strong>
          <span>Po wyjściu użytkownika do partnera zdarzenie pojawi się tutaj automatycznie.</span>
        </div>
      ) : (
        <div className="affiliate-dashboard-grid">
          <section>
            <h3>Partnerzy</h3>
            <div className="affiliate-bars">
              {partners.map(([name,count]) => (
                <div key={name}>
                  <div><strong>{name}</strong><span>{count}</span></div>
                  <i><b style={{ width: `${Math.max(8,(count/stats.total)*100)}%` }}/></i>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Skąd wychodzą użytkownicy</h3>
            <div className="affiliate-bars">
              {sources.map(([name,count]) => (
                <div key={name}>
                  <div><strong>{labelSource(name)}</strong><span>{count}</span></div>
                  <i><b style={{ width: `${Math.max(8,(count/stats.total)*100)}%` }}/></i>
                </div>
              ))}
            </div>
          </section>

          {googleLandings.length > 0 && (
            <section className="affiliate-wide">
              <h3>Google Organic → partner: landingi sprzedażowe</h3>
              <div className="affiliate-offer-table">
                {googleLandings.slice(0,15).map(([landing,count]) => (
                  <div key={landing}>
                    <span><strong>{landing}</strong></span>
                    <span>Google Organic</span>
                    <b>{count}</b>
                  </div>
                ))}
              </div>
            </section>
          )}

          {landings.length > 0 && (
            <section className="affiliate-wide">
              <h3>Landingi, które najczęściej kończą się wyjściem do partnera</h3>
              <div className="affiliate-offer-table">
                {landings.slice(0,15).map(([landing,count]) => (
                  <div key={landing}>
                    <span><strong>{landing}</strong></span>
                    <span>wszystkie źródła</span>
                    <b>{count}</b>
                  </div>
                ))}
              </div>
            </section>
          )}

          {dayRows.length > 0 && (
            <section className="affiliate-wide">
              <h3>Kliknięcia dziennie</h3>
              <div className="affiliate-bars">
                {dayRows.slice(-30).map(([day,count]) => (
                  <div key={day}>
                    <div><strong>{new Date(day + "T12:00:00Z").toLocaleDateString("pl-PL")}</strong><span>{count}</span></div>
                    <i><b style={{ width: `${Math.max(4,(count/maxDay)*100)}%` }}/></i>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="affiliate-wide">
            <h3>Najczęściej klikane oferty</h3>
            <div className="affiliate-offer-table">
              {offers.slice(0,15).map(([id,data]) => (
                <div key={id}>
                  <span><strong>#{id}</strong> {data.destination || "Oferta Tripowni"}</span>
                  <span>{data.partner}</span>
                  <b>{data.count}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="affiliate-wide">
            <h3>Ostatnie wyjścia do partnerów</h3>
            <div className="affiliate-recent">
              {stats.recent.map((item,index) => (
                <div key={`${item.ts}-${index}`}>
                  <time>{new Date(item.ts).toLocaleString("pl-PL")}</time>
                  <strong>{item.partner}</strong>
                  <span>{labelSource(item.source)}</span>
                  <span>{item.destination || (item.offer ? `Oferta #${item.offer}` : "—")}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
