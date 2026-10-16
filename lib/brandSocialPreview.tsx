import { ImageResponse } from "next/og";

export const BRAND_SOCIAL_IMAGE = "https://tripownia.pl/api/share-preview?design=logo-white-v1";

export function renderBrandSocialPreview() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#ffffff", color: "#123254", fontFamily: "Arial, sans-serif",
      }}>
        <img src="https://tripownia.pl/tripownia-logo.webp" alt="Tripownia"
          width="210" height="210" style={{ width: 210, height: 210, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 16, fontSize: 72, fontWeight: 900, letterSpacing: "-1.5px" }}>
          <span>TRIPOWNIA</span><span style={{ color: "#f47c34" }}>.PL</span>
        </div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 29, fontWeight: 600, color: "#516273" }}>My szukamy. Ty lecisz.</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=300, s-maxage=86400" } },
  );
}
