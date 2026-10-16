import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Approved Tripownia EGZOTYKA graphic that Metricool received at full resolution.
// TikTok rejects PNG photos, so this endpoint only converts the existing original to JPEG.
const ORIGINAL = "https://static.metricool.com/planner/202610/7111875-file-11530245918240320696.png";

export async function GET() {
  try {
    const response = await fetch(ORIGINAL, { next: { revalidate: 86400 } });
    if (!response.ok) return new NextResponse("Graphic unavailable", { status: 502 });
    const source = Buffer.from(await response.arrayBuffer());
    if (source.length < 10000 || source.length > 12000000) {
      return new NextResponse("Invalid graphic", { status: 502 });
    }
    const background = await sharp(source)
      .resize(1080, 1920, { fit: "cover", position: "centre" })
      .blur(32)
      .modulate({ brightness: 0.58 })
      .toBuffer();
    const foreground = await sharp(source)
      .resize(1080, 1920, { fit: "contain", background: "#00000000" })
      .png()
      .toBuffer();
    const jpg = await sharp(background)
      .composite([{ input: foreground, gravity: "centre" }])
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toBuffer();
    return new NextResponse(new Uint8Array(jpg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'inline; filename="tripownia-londyn-city-break.jpg"',
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Content-Type-Options": "nosniff"
      },
    });
  } catch {
    return new NextResponse("Could not prepare TikTok image", { status: 502 });
  }
}
