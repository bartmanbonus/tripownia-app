import { ImageResponse } from "next/og";

export const alt = "Tripownia.pl — Znajdź wyjazd. Zaplanuj całą podróż za 0 zł.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #f7fbff 0%, #e8f7f2 42%, #fff1e9 100%)",
          color: "#171412",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            right: -110,
            top: -170,
            background: "rgba(52, 184, 168, .16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            left: -120,
            bottom: -190,
            background: "rgba(255, 107, 53, .14)",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "62px 72px 58px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 900, letterSpacing: -2, color: "#ff6b35" }}>
              tripownia
            </div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 900, letterSpacing: -2 }}>
              .pl
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
            <div style={{ display: "flex", fontSize: 27, fontWeight: 800, letterSpacing: 2, color: "#19766c" }}>
              WYSZUKIWANIE + DARMOWY PLANNER PODRÓŻY
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 84, lineHeight: .98, fontWeight: 900, letterSpacing: -4 }}>
              Znajdź wyjazd.
            </div>
            <div style={{ display: "flex", marginTop: 8, fontSize: 72, lineHeight: 1, fontWeight: 900, letterSpacing: -3 }}>
              Zaplanuj całą podróż za 0 zł.
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 28, lineHeight: 1.35, maxWidth: 850, color: "#3a3531" }}>
              Lot, hotel, transfer, atrakcje, dokumenty, eSIM i checklista — w jednym miejscu.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: 999,
                background: "#171412",
                color: "white",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              tripownia.pl
            </div>
            <div style={{ display: "flex", fontSize: 21, fontWeight: 700, color: "#4a4541" }}>
              My szukamy. Ty lecisz.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
