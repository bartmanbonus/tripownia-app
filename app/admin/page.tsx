import Link from "next/link";
import AdminOfferEditor from "@/components/AdminOfferEditor";
import AdminOfferAudit from "@/components/AdminOfferAudit";
import AdminPublishPanel from "@/components/AdminPublishPanel";
import AdminAffiliateDashboard from "@/components/AdminAffiliateDashboard";

export const metadata = {
  title: "Panel administracyjny | Tripownia.pl",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="tripownia-admin-page">
      <section className="shell hub-page">
        <div className="kicker">TRIPOWNIA CONTROL CENTER</div>
        <div className="admin-studio-title">
          <div>
            <h1>Panel administracyjny</h1>
            <p className="hub-lead">Oferty, jakość danych, linki afiliacyjne, publikacja i wyniki w jednym miejscu. Social Studio pozostaje osobnym, prostym modułem do codziennej pracy.</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Link className="secondary-cta" href="/admin/social">📣 Social Studio</Link>
            <Link className="secondary-cta" href="/">← Zobacz stronę</Link>
          </div>
        </div>

        <section className="admin-panel-section"><AdminPublishPanel/></section>
        <section className="admin-panel-section"><AdminOfferEditor/></section>
        <section className="admin-panel-section"><div className="admin-editor-head"><div><h2>Audyt ofert</h2><p>Kontrola zdjęć, cen, statusów i tego, dokąd naprawdę prowadzą linki.</p></div></div><AdminOfferAudit/></section>
        <section className="admin-panel-section"><div className="admin-editor-head"><div><h2>Analityka afiliacyjna</h2><p>Kliknięcia w linki obsługiwane przez wewnętrzny tracking Tripowni.</p></div></div><AdminAffiliateDashboard/></section>
      </section>
    </main>
  );
}
