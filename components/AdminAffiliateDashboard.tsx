"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, RotateCcw, MousePointerClick } from "lucide-react";

type Stats = {
  total: number;
  byPartner: Record<string, number>;
  bySource: Record<string, number>;
  byOffer: Record<string, { count: number; partner: string; destination: string }>;
  recent: Array<{ ts: string; partner: string; source: string; offer?: string | null; destination?: string | null }>;
  updatedAt?: string;
};

const empty: Stats = { total: 0, byPartner: {}, bySource: {}, byOffer: {}, recent: [] };

function labelSource(value: string) {
  return value
    .replace("offer_detail_primary", "Oferta — główne CTA")
    .replace("offer_detail_mobile", "Oferta — mobile")
    .replace("search_flights", "Wyszukiwarka — loty")
    .replace("search_hotels", "Wyszukiwarka — hotele")
    .replaceAll("_", " ");
}

export default function AdminAffiliateDashboard() {
  const [stats, setStats] = useState<Stats>(empty);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/click-stats", { cache: "no-store" });
      const data = await response.json();
      setStats(data.stats || empty);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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

  const topPartner = partners[0]?.[0] || "—";
  const topSource = sources[0]?.[0] || "—";

  async function reset() {
    if (!window.confirm("Wyzerować lokalne statystyki klików w tej przeglądarce?")) return;
    await fetch("/api/admin/click-stats", { method: "DELETE" });
    setStats(empty);
  }

  function exportCsv() {
    const rows = [
      ["Typ","Nazwa","Kliknięcia"],
      ...partners.map(([name,count]) => ["Partner", name, String(count)]),
      ...sources.map(([name,count]) => ["Źródło CTA", labelSource(name), String(count)]),
      ...offers.map(([id,data]) => ["Oferta", `#${id} ${data.destination || ""} (${data.partner})`, String(data.count)]),
    ];
    const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tripownia-kliki-afiliacyjne-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="affiliate-dashboard">
      <div className="admin-panel-head">
        <div>
          <h2>Dashboard klików afiliacyjnych</h2>
          <p>Podgląd klików z tej przeglądarki + globalne zdarzenia nadal trafiają do logów Vercela jako <code>tripownia_affiliate_click</code>.</p>
        </div>
        <div className="admin-audit-actions">
          <button type="button" className="admin-export" onClick={load} disabled={loading}>
            <RefreshCw size={16}/> Odśwież
          </button>
          <button type="button" className="admin-export" onClick={exportCsv} disabled={!stats.total}>
            <Download size={16}/> CSV
          </button>
          <button type="button" className="admin-reset-draft" onClick={reset} disabled={!stats.total}>
            <RotateCcw size={16}/> Wyzeruj
          </button>
        </div>
      </div>

      <div className="affiliate-kpis">
        <div><small>KLIKNIĘCIA</small><strong>{stats.total}</strong><span>zarejestrowane w tej przeglądarce</span></div>
        <div><small>TOP PARTNER</small><strong>{topPartner}</strong><span>{partners[0]?.[1] || 0} kliknięć</span></div>
        <div><small>TOP CTA</small><strong>{topSource === "—" ? "—" : labelSource(topSource)}</strong><span>{sources[0]?.[1] || 0} kliknięć</span></div>
        <div><small>OSTATNIA AKTYWNOŚĆ</small><strong>{stats.updatedAt ? new Date(stats.updatedAt).toLocaleString("pl-PL") : "—"}</strong><span>ostatni zapis</span></div>
      </div>

      {!stats.total ? (
        <div className="affiliate-empty">
          <MousePointerClick size={28}/>
          <strong>Jeszcze nie ma klików do pokazania.</strong>
          <span>Otwórz ofertę i przejdź do partnera — po powrocie tutaj dashboard pokaże zdarzenie.</span>
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
            <h3>Źródła kliknięć</h3>
            <div className="affiliate-bars">
              {sources.map(([name,count]) => (
                <div key={name}>
                  <div><strong>{labelSource(name)}</strong><span>{count}</span></div>
                  <i><b style={{ width: `${Math.max(8,(count/stats.total)*100)}%` }}/></i>
                </div>
              ))}
            </div>
          </section>

          <section className="affiliate-wide">
            <h3>Najczęściej klikane oferty</h3>
            <div className="affiliate-offer-table">
              {offers.slice(0,10).map(([id,data]) => (
                <div key={id}>
                  <span><strong>#{id}</strong> {data.destination || "Oferta Tripownii"}</span>
                  <span>{data.partner}</span>
                  <b>{data.count}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="affiliate-wide">
            <h3>Ostatnie kliknięcia</h3>
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

      <div className="admin-local-warning">
        <span><strong>Ważne:</strong> dashboard bez bazy pokazuje agregaty przypisane do tej przeglądarki administratora. Zdarzenia serwerowe wszystkich użytkowników nadal są zapisywane w logach Vercela. Globalny dashboard wszystkich użytkowników wymaga trwałego magazynu danych, np. Supabase/Vercel Postgres lub systemu analytics.</span>
      </div>
    </div>
  );
}
