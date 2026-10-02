import { ImageResponse } from "next/og";

export const runtime = "edge";

const PHOTO =
  "https://images.unsplash.com/photo-1564863756233-e90e6d2f264b?auto=format&fit=crop&fm=jpg&q=82&w=2200";

const navy = "#0b2453";
const orange = "#ff5a16";
const cream = "#fffaf4";

function Details({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 20 : 34, color: navy, fontFamily: "Arial, sans-serif", fontSize: compact ? 24 : 30, fontWeight: 700 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>▣</span><span>20–23 października 2026</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>☾</span><span>2 noce</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>✈</span><span>Wylot z Warszawy</span></div>
    </div>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", fontFamily: "Arial, sans-serif", fontWeight: 900, letterSpacing: 0.5, fontSize: 34 }}>
      <span style={{ color: navy }}>TRIPOWNIA.</span><span style={{ color: orange }}>PL</span>
    </div>
  );
}

function FeedCard({ vertical = false, compact = false }: { vertical?: boolean; compact?: boolean }) {
  return (
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: compact ? 44 : 0, background: cream }}>
      <img src={PHOTO} alt="" width={vertical ? 1080 : 1080} height={vertical ? 1920 : 1080}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(105deg, rgba(255,250,244,.99) 0%, rgba(255,250,244,.97) 44%, rgba(255,250,244,.52) 62%, rgba(255,250,244,0) 79%)" }} />
      <div style={{ position: "absolute", left: compact ? 56 : vertical ? 72 : 64, top: compact ? 54 : vertical ? 80 : 58, right: compact ? 46 : vertical ? 64 : 54, bottom: compact ? 50 : vertical ? 86 : 54, display: "flex", flexDirection: "column" }}>
        <Brand />
        <div style={{ width: compact ? 150 : 190, height: 3, background: navy, marginTop: 20, marginBottom: compact ? 24 : 34 }} />
        <div style={{ color: navy, fontFamily: "Arial, sans-serif", fontSize: compact ? 24 : vertical ? 34 : 29, letterSpacing: compact ? 8 : 11, fontWeight: 600 }}>CITY BREAK</div>
        <div style={{ color: navy, fontFamily: "Georgia, serif", fontSize: compact ? 68 : vertical ? 112 : 91, lineHeight: .9, letterSpacing: -2, fontWeight: 700, marginTop: compact ? 18 : 24, maxWidth: vertical ? 880 : 830 }}>
          BARI +<br/>ALBEROBELLO
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: compact ? 20 : 28 }}>
          <span style={{ color: orange, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: compact ? 96 : vertical ? 150 : 130, lineHeight: .8 }}>669</span>
          <span style={{ color: navy, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: compact ? 38 : vertical ? 58 : 48, marginLeft: 14 }}>zł/os.</span>
        </div>
        <div style={{ marginTop: compact ? 28 : 38, maxWidth: vertical ? 920 : 860 }}>
          <Details compact={compact} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          width: vertical ? 700 : compact ? 510 : 600,
          height: vertical ? 330 : compact ? 210 : 245,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 16px 45px rgba(11,36,83,.18)",
          border: "5px solid rgba(255,255,255,.88)"
        }}>
          <img src={PHOTO} alt="" width={900} height={500} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </div>
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;

  if (format === "preview") {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", background: cream, position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "58%", height: "100%", padding: "54px 56px 48px 62px", boxSizing: "border-box", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src="https://tripownia.pl/tripownia-logo.webp" width="82" height="82" style={{ objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 34, fontWeight: 900, color: navy }}>Tripownia.pl</div>
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 18, color: "#665f58", marginTop: 5 }}>Znajdź wyjazd. Zaplanuj całą podróż.</div>
            </div>
          </div>
          <div style={{ marginTop: 34, fontFamily: "Arial, sans-serif", fontSize: 23, letterSpacing: 7, fontWeight: 700, color: navy }}>CITY BREAK</div>
          <div style={{ marginTop: 14, fontFamily: "Georgia, serif", fontSize: 66, lineHeight: .93, fontWeight: 700, color: navy }}>BARI +<br/>ALBEROBELLO</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 22 }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 84, lineHeight: .85, fontWeight: 700, color: orange }}>669</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 34, fontWeight: 700, color: navy, marginLeft: 12 }}>zł/os.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontFamily: "Arial, sans-serif", fontSize: 21, fontWeight: 700, color: navy }}>
            20–23 października 2026 · 2 noce · Warszawa
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 0, top: 0, width: "48%", height: "100%" }}>
          <img src={PHOTO} alt="" width="760" height="630" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #fffaf4 0%, rgba(255,250,244,.55) 15%, rgba(255,250,244,0) 42%)" }} />
        </div>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  if (format === "feed") {
    return new ImageResponse(<FeedCard />, { width: 1080, height: 1080 });
  }

  if (format === "story") {
    return new ImageResponse(
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <img src={PHOTO} alt="" width={1080} height={1920} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(22px)", transform: "scale(1.08)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "rgba(255,250,244,.12)" }} />
        <div style={{ display: "flex", width: 850, height: 850, boxShadow: "0 28px 80px rgba(0,0,0,.22)", borderRadius: 44, overflow: "hidden" }}>
          <FeedCard compact />
        </div>
      </div>,
      { width: 1080, height: 1920 }
    );
  }

  if (format === "tiktok") {
    return new ImageResponse(<FeedCard vertical />, { width: 1080, height: 1920 });
  }

  return new Response("Not found", { status: 404 });
}
