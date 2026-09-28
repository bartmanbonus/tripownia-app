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
            width: 760,
            height: 360,
            borderRadius: 40,
            background: "#fffaf5",
            border: "2px solid #f1e7de",
          }}
        >
          <img
            src="https://tripownia.pl/tripownia-logo.webp"
            width="560"
            height="220"
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    size,
  );
}
