import Link from "next/link";

export const metadata = {
  title: "Panel administracyjny | Tripownia.pl",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#faf9f7", padding: "48px 24px", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: "#ff5a36", marginBottom: 10 }}>
          TRIPOWNIA CONTROL CENTER
        </div>

        <h1 style={{ fontSize: "clamp(38px,6vw,64px)", lineHeight: 1, letterSpacing: -2.5, margin: "0 0 14px" }}>
          Panel administracyjny
        </h1>

        <p style={{ maxWidth: 760, fontSize: 17, lineHeight: 1.6, color: "#666", marginBottom: 34 }}>
          Tryb bezpieczny panelu. Najpierw uruchamiamy pewną stronę administracyjną, a moduły
          dokładamy osobno — dzięki temu jeden błąd w dashboardzie nie blokuje całego admina.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 16,
          marginBottom: 30
        }}>
          <Link href="/admin/social" style={cardStyle}>
            <span style={iconStyle}>📣</span>
            <strong style={titleStyle}>Social Center</strong>
            <span style={textStyle}>Posty, hooki, FOMO i link w komentarzu.</span>
            <b style={ctaStyle}>Otwórz moduł →</b>
          </Link>

          <Link href="/okazje" style={cardStyle}>
            <span style={iconStyle}>✈️</span>
            <strong style={titleStyle}>Oferty na stronie</strong>
            <span style={textStyle}>Podejrzyj aktualne oferty tak, jak widzi je użytkownik.</span>
            <b style={ctaStyle}>Zobacz oferty →</b>
          </Link>

          <Link href="/podroze" style={cardStyle}>
            <span style={iconStyle}>🔎</span>
            <strong style={titleStyle}>SEO i landingi</strong>
            <span style={textStyle}>Sprawdź kierunki, budżety i strony wejściowe z Google.</span>
            <b style={ctaStyle}>Zobacz landingi →</b>
          </Link>

          <Link href="/wydarzenia" style={cardStyle}>
            <span style={iconStyle}>⚽</span>
            <strong style={titleStyle}>Wydarzenia</strong>
            <span style={textStyle}>Terminarze meczów, loty i noclegi zsynchronizowane automatycznie.</span>
            <b style={ctaStyle}>Otwórz wydarzenia →</b>
          </Link>

          <Link href="/polska" style={cardStyle}>
            <span style={iconStyle}>🇵🇱</span>
            <strong style={titleStyle}>Polska</strong>
            <span style={textStyle}>10 kierunków krajowych i ścieżki do noclegów oraz atrakcji.</span>
            <b style={ctaStyle}>Podejrzyj →</b>
          </Link>
        </div>

        <div style={{
          border: "1px solid #eadfd7",
          background: "#fff",
          borderRadius: 18,
          padding: 22,
          display: "grid",
          gap: 9
        }}>
          <strong style={{ fontSize: 18 }}>Status startowy</strong>
          <span style={textStyle}>✅ Admin zabezpieczony loginem i hasłem</span>
          <span style={textStyle}>✅ Social Center działa jako osobny moduł</span>
          <span style={textStyle}>✅ Publiczna część serwisu pozostaje niezależna od panelu</span>
          <span style={textStyle}>ℹ️ CMS ofert, tracking i audyt dołączymy po jednym module po potwierdzeniu, że ten ekran działa.</span>
        </div>
      </section>
    </main>
  );
}

const cardStyle = {
  display: "flex",
  flexDirection: "column" as const,
  minHeight: 220,
  padding: 24,
  borderRadius: 20,
  border: "1px solid #eadfd7",
  background: "#fff",
  textDecoration: "none",
  color: "#151515",
};

const iconStyle = { fontSize: 30, marginBottom: 18 };
const titleStyle = { fontSize: 22, marginBottom: 8 };
const textStyle = { color: "#6d6863", lineHeight: 1.5, fontSize: 14 };
const ctaStyle = { marginTop: "auto", paddingTop: 20, fontSize: 13 };
