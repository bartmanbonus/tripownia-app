import Link from "next/link";
import { offers } from "@/lib/offers";
import { partners } from "@/lib/partners";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offerQualityIssues, offerQualityScore } from "@/lib/offerQuality";

export const metadata = { title: "Panel administracyjny | Tripownia.pl" };

export default function AdminPage() {
  const exact = offers.filter(o => o.linkType === "exact").length;
  const search = offers.length - exact;
  const byPartner = Object.entries(offers.reduce<Record<string,number>>((acc,o)=>{acc[o.partner]=(acc[o.partner]||0)+1; return acc;},{}));
  const needsWork = offers.filter(o => offerQualityIssues(o).length > 0).length;
  const avgQuality = Math.round(offers.reduce((sum,o)=>sum+offerQualityScore(o),0)/Math.max(offers.length,1));
  return <main><SiteHeader/><section className="shell hub-page admin-page">
    <div className="kicker">PANEL ADMINISTRACYJNY — PROTOTYP</div>
    <h1>Tripownia Control Center</h1>
    <p className="hub-lead">Jedno miejsce do kontroli ofert, linków, zdjęć i jakości danych. Na tym etapie panel jest tylko do odczytu — zapis do bazy dołączymy po spięciu Supabase/API.</p>
    <div className="admin-stats">
      <div><small>OFERTY</small><strong>{offers.length}</strong><span>aktywnych w kodzie</span></div>
      <div><small>DEEPLINK</small><strong>{exact}</strong><span>konkretnych ofert</span></div>
      <div><small>WYSZUKIWANIA</small><strong>{search}</strong><span>linków do wyników/kierunku</span></div>
      <div><small>JAKOŚĆ DANYCH</small><strong>{avgQuality}%</strong><span>średnia kompletność</span></div>
    </div>
    <div className="admin-alert"><strong>⚠️ {needsWork} ofert wymaga jeszcze pracy nad danymi.</strong><span>Najczęściej: brak konkretnego deeplinku albo brak prawdziwej daty sprawdzenia ceny. Panel ma to pokazywać wprost — bez udawania danych live.</span></div><div className="admin-panel">
      <div className="admin-panel-head"><div><h2>Kontrola ofert</h2><p>Najważniejsze pola widoczne bez zaglądania do kodu.</p></div><Link href="/okazje">Podejrzyj frontend →</Link></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ID</th><th>Kierunek</th><th>Wylot</th><th>Cena</th><th>Partner</th><th>Link</th><th>Jakość</th><th>Status</th></tr></thead><tbody>{offers.map(o=><tr key={o.id}><td>#{o.id}</td><td><strong>{o.flag} {o.city}</strong><br/><small>{o.country}</small></td><td>{o.departure}</td><td><strong>{o.price} zł</strong><br/><small>{o.dates}</small></td><td>{partners[o.partner].name}</td><td><span className={o.linkType === "exact" ? "admin-good" : "admin-warn"}>{o.linkType === "exact" ? "konkretna oferta" : "wyniki / kierunek"}</span></td><td><strong>{offerQualityScore(o)}%</strong><br/><small>{offerQualityIssues(o).join(" · ") || "kompletna"}</small></td><td>{o.availabilityStatus === "expired" ? "⛔ wygasła" : "✅ widoczna"}</td></tr>)}</tbody></table></div>
    </div>
  </section><SiteFooter/></main>;
}
