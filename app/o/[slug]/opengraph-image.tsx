import { ImageResponse } from "next/og";

export const alt = "Tripownia.pl";
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
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 34,
            width: 820,
            height: 330,
            borderRadius: 36,
            background: "#fffaf5",
            border: "2px solid #f1e7de",
          }}
        >
          <img
            src="https://tripownia.pl/tripownia-app-icon-v2.png"
            width="154"
            height="154"
            style={{ objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column", color: "#211d1a" }}>
            <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-3px" }}>Tripownia.pl</div>
            <div style={{ marginTop: 10, fontSize: 26, color: "#6f645e" }}>Znajdź wyjazd. Zaplanuj całą podróż.</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
