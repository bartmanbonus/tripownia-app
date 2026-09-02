import { ImageResponse } from "next/og";

export const alt = "Tripownia.pl — My szukamy. Ty lecisz.";
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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg,#fff7f1 0%,#ffffff 48%,#eaf7ff 100%)",
          color: "#141414",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              background: "#ff4b22",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 900,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 34, fontWeight: 900 }}>Tripownia.pl</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.02, maxWidth: 950 }}>
            Znajdź podróż, którą naprawdę warto zarezerwować.
          </div>
          <div style={{ fontSize: 28, color: "#64645f" }}>
            My szukamy. Ty lecisz.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 20, fontWeight: 700 }}>
          <span>✈ City break</span>
          <span>☀ Wakacje</span>
          <span>🌴 Egzotyka</span>
          <span>🇵🇱 Polska</span>
        </div>
      </div>
    ),
    size
  );
}
