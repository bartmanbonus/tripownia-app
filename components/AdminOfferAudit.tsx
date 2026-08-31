"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Filter, Image as ImageIcon, Search, ShieldCheck } from "lucide-react";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import { offerQualityIssues, offerQualityScore } from "@/lib/offerQuality";

type AuditFilter = "all" | "problem" | "exact" | "search" | "expired";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function AdminOfferAudit() {
  const [filter, setFilter] = useState<AuditFilter>("problem");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const exact = offers.filter(o => o.linkType === "exact").length;
    const search = offers.filter(o => o.linkType !== "exact").length;
    const expired = offers.filter(o => o.availabilityStatus === "expired").length;
    const needsWork = offers.filter(o => offerQualityIssues(o).length > 0).length;
    const avg = Math.round(
      offers.reduce((sum, o) => sum + offerQualityScore(o), 0) / Math.max(offers.length, 1)
    );
    return { exact, search, expired, needsWork, avg };
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter(o => {
      const issues = offerQualityIssues(o);
      const matchesFilter =
        filter === "all" ? true :
        filter === "problem" ? issues.length > 0 :
        filter === "exact" ? o.linkType === "exact" :
        filter === "search" ? o.linkType !== "exact" :
        o.availabilityStatus === "expired";

      const matchesQuery = !q || [
        o.city, o.country, o.departure, o.hotel, o.board, partners[o.partner].name
      ].some(v => String(v).toLowerCase().includes(q));

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  function exportCsv() {
    const headers = [
      "ID","Kierunek","Kraj","Wylot","Cena","Partner","Typ linku",
      "Jakość","Problemy","Status","Data ceny","URL"
    ];
    const rows = shown.map(o => [
      o.id, o.city, o.country, o.departure, o.price, partners[o.partner].name,
      o.linkType === "exact" ? "deeplink" : "wyniki/kierunek",
      offerQualityScore(o),
      offerQualityIssues(o).join(" | "),
      o.availabilityStatus ?? "unknown",
      o.priceCheckedAt ?? "",
      o.affiliateUrl
    ]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tripownia-audyt-ofert-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filters: { id: AuditFilter; label: string; count?: number }[] = [
    { id: "problem", label: "Wymaga poprawy", count: stats.needsWork },
    { id: "all", label: "Wszystkie", count: offers.length },
    { id: "exact", label: "Deeplinki", count: stats.exact },
    { id: "search", label: "Wyniki / kierunek", count: stats.search },
    { id: "expired", label: "Wygasłe", count: stats.expired },
  ];

  return (
    <>
      <div className="admin-stats">
        <div><small>OFERTY</small><strong>{offers.length}</strong><span>w aktualnej bazie</span></div>
        <div><small>DO POPRAWY</small><strong>{stats.needsWork}</strong><span>braki lub link search</span></div>
        <div><small>DEEPLINK</small><strong>{stats.exact}</strong><span>konkretnych ofert</span></div>
        <div><small>JAKOŚĆ DANYCH</small><strong>{stats.avg}%</strong><span>średnia kompletność</span></div>
      </div>

      <div className="admin-audit-toolbar">
        <div className="admin-filter-group">
          <Filter size={16}/>
          {filters.map(item => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? "active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label} <span>{item.count}</span>
            </button>
          ))}
        </div>

        <div className="admin-audit-actions">
          <label className="admin-search">
            <Search size={16}/>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Kierunek, hotel, partner..."
            />
          </label>
          <button type="button" className="admin-export" onClick={exportCsv}>
            <Download size={16}/> Eksport CSV
          </button>
        </div>
      </div>

      <div className="admin-results-summary">
        Pokazuję <strong>{shown.length}</strong> z {offers.length} ofert.
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-audit-table">
          <thead>
            <tr>
              <th>Oferta</th>
              <th>Wylot / termin</th>
              <th>Partner</th>
              <th>Link</th>
              <th>Zdjęcie</th>
              <th>Jakość</th>
              <th>Problemy</th>
              <th>Akcja</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(o => {
              const issues = offerQualityIssues(o);
              const score = offerQualityScore(o);
              const imageKnown = Boolean(o.image);
              return (
                <tr key={o.id}>
                  <td>
                    <strong>{o.flag} {o.city}</strong><br/>
                    <small>{o.country} · {o.price} zł/os.</small>
                  </td>
                  <td>
                    {o.departure}<br/>
                    <small>{o.dates}</small>
                  </td>
                  <td>
                    <strong>{partners[o.partner].name}</strong><br/>
                    <small>{o.board}</small>
                  </td>
                  <td>
                    <span className={o.linkType === "exact" ? "admin-good" : "admin-warn"}>
                      {o.linkType === "exact" ? "konkretna oferta" : "wyniki / kierunek"}
                    </span>
                    <small className="admin-date-check">
                      {o.priceCheckedAt ? `Cena: ${o.priceCheckedAt}` : "brak daty ceny"}
                    </small>
                  </td>
                  <td>
                    <span className={imageKnown ? "admin-image-ok" : "admin-image-missing"}>
                      <ImageIcon size={14}/> {imageKnown ? "przypisane" : "brak"}
                    </span>
                  </td>
                  <td>
                    <div className="quality-meter">
                      <span style={{ width: `${score}%` }}/>
                    </div>
                    <strong>{score}%</strong>
                  </td>
                  <td>
                    {issues.length ? (
                      <ul className="admin-issues">
                        {issues.map(issue => <li key={issue}>{issue}</li>)}
                      </ul>
                    ) : (
                      <span className="admin-clean"><ShieldCheck size={14}/> kompletna</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <a href={`/oferta/${o.id}`} target="_blank">Tripownia <ExternalLink size={13}/></a>
                      <a href={o.affiliateUrl} target="_blank" rel="sponsored noopener noreferrer">Partner <ExternalLink size={13}/></a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!shown.length && (
          <div className="admin-empty">Brak ofert pasujących do wybranych filtrów.</div>
        )}
      </div>
    </>
  );
}
