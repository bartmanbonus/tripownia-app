import { ImageResponse } from "next/og";

export const runtime = "edge";

const PHOTO =
  "https://images.unsplash.com/photo-1742665764542-aff4f4bc064e?auto=format&fit=crop&w=1800&q=86";

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
        <div style={{ display: "flex", justifyContent: vertical ? "center" : "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: compact ? 360 : vertical ? 560 : 450, padding: compact ? "22px 36px" : vertical ? "30px 46px" : "26px 42px", borderRadius: 999, background: orange, color: "#fff", fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: compact ? 28 : vertical ? 44 : 36 }}>
            Sprawdź ofertę →
          </div>
        </div>
      </div>
    </div>
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ format: string }> }) {
  const { format } = await params;

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
