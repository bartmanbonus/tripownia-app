import sharp from "sharp";

export const runtime = "nodejs";

const PHOTO =
  "https://images.unsplash.com/photo-1564863756233-e90e6d2f264b?auto=format&fit=crop&fm=jpg&q=88&w=2200";

function overlaySvg() {
  return Buffer.from(`
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" x2="1">
          <stop offset="0%" stop-color="#fffaf4" stop-opacity="0.99"/>
          <stop offset="50%" stop-color="#fffaf4" stop-opacity="0.96"/>
          <stop offset="78%" stop-color="#fffaf4" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#fffaf4" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#shade)"/>
      <text x="72" y="125" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#0b2453">TRIPOWNIA.</text>
      <text x="327" y="125" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#ff5a16">PL</text>
      <rect x="72" y="160" width="190" height="4" fill="#0b2453"/>
      <text x="72" y="238" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="9" fill="#0b2453">CITY BREAK</text>
      <text x="72" y="365" font-family="Georgia, serif" font-size="112" font-weight="700" fill="#0b2453">BARI +</text>
      <text x="72" y="475" font-family="Georgia, serif" font-size="112" font-weight="700" fill="#0b2453">ALBEROBELLO</text>
      <text x="72" y="640" font-family="Georgia, serif" font-size="154" font-weight="700" fill="#ff5a16">669</text>
      <text x="392" y="640" font-family="Georgia, serif" font-size="58" font-weight="700" fill="#0b2453">zł/os.</text>
      <text x="72" y="748" font-family="Arial, sans-serif" font-size="31" font-weight="700" fill="#0b2453">20–23 października 2026</text>
      <text x="72" y="808" font-family="Arial, sans-serif" font-size="31" font-weight="700" fill="#0b2453">2 noce</text>
      <text x="72" y="868" font-family="Arial, sans-serif" font-size="31" font-weight="700" fill="#0b2453">Wylot z Warszawy</text>
      <rect x="72" y="1545" width="610" height="170" rx="32" fill="#ff5a16"/>
      <text x="377" y="1650" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#ffffff">SPRAWDŹ OFERTĘ</text>
      <text x="72" y="1810" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#0b2453">tripownia.pl</text>
    </svg>
  `);
}

export async function GET() {
  try {
    const photoResponse = await fetch(PHOTO, { cache: "force-cache" });
    if (!photoResponse.ok) {
      return new Response("Background image unavailable", { status: 502 });
    }

    const photo = Buffer.from(await photoResponse.arrayBuffer());
    if (!photo.length) {
      return new Response("Background image unavailable", { status: 502 });
    }

    const output = await sharp(photo)
      .resize(1080, 1920, { fit: "cover", position: "centre" })
      .composite([{ input: overlaySvg(), blend: "over" }])
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    return new Response(output, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(output.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[bari_tiktok_jpeg]", error instanceof Error ? error.message : error);
    return new Response("Image conversion unavailable", { status: 502 });
  }
}
