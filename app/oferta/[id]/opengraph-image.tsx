import { ImageResponse } from "next/og";
import { offers } from "@/lib/offers";

export const alt = "Okazja Tripowni — LECIMY?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function absoluteImage(src: string) {
  if (!src) return "https://tripownia.pl/tripownia-logo.webp";
  return src.startsWith("http://") || src.startsWith("https://")
    ? src
    : `https://tripownia.pl${src.startsWith("/") ? src : `/${src}`}`;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = offers.find((item) => item.id === Number(id));

  if (!offer) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px",
            background: "#111111",
            color: "white",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>Tripownia.pl</div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 82, fontWeight: 900, letterSpacing: -3 }}>LECIMY?</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 30 }}>Sprawdź aktualne okazje podróżnicze.</div>
        </div>
      ),
      size,
    );
  }

  const priceText = offer.partner === "exim" || offer.partner === "tui"
    ? "Sprawdź aktualną cenę"
    : `od ${offer.price.toLocaleString("pl-PL")} zł / os.`;
  const imageUrl = absoluteImage(offer.image);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#171717",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <img
          src={imageUrl}
          alt=""
          width="1200"
          height="630"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(90deg, rgba(8,8,8,.92) 0%, rgba(8,8,8,.72) 48%, rgba(8,8,8,.18) 100%)",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 64px 52px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 29, fontWeight: 900 }}>
              <span style={{ display: "flex", color: "#ff6b35" }}>tripownia</span>
              <span style={{ display: "flex", opacity: .88 }}>.pl</span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "12px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,.94)",
                color: "#111",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {offer.tag}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 790 }}>
            <div style={{ display: "flex", fontSize: 29, fontWeight: 900, letterSpacing: 3, color: "#ff8a5c" }}>LECIMY?</div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 82, lineHeight: .98, fontWeight: 900, letterSpacing: -4 }}>
              {offer.city}
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 31, fontWeight: 700 }}>
              {offer.country} · z {offer.departure} · {offer.nights} {offer.nights === 1 ? "noc" : "nocy"}
            </div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 25, opacity: .9 }}>
              {offer.dates} · {offer.board}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 18, opacity: .78 }}>TRIPOWNIA ZNALAZŁA</div>
              <div style={{ display: "flex", marginTop: 4, fontSize: 43, fontWeight: 900 }}>{priceText}</div>
            </div>
            <div style={{ display: "flex", fontSize: 21, fontWeight: 700, opacity: .92 }}>My szukamy. Ty lecisz.</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
