import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Original, approved Tripownia WAKACJE artwork in full resolution.
 * Do not crop it: Instagram uses a padded 4:5 version, TikTok a padded 9:16 JPEG.
 */
const ORIGINAL = "https://static.metricool.com/planner/202610/7111875-file-16382382077103305679.png";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ format: string }> },
) {
  const { format } = await params;
  const isFeed = format === "feed.jpg";
  const isTiktok = format === "tiktok.jpg";
  if (!isFeed && !isTiktok) return new NextResponse("Not found", { status: 404 });
  const width = 1080;
  const height = isFeed ? 1350 : 1920;
  try {
    const response = await fetch(ORIGINAL, { next: { revalidate: 86400 } });
    if (!response.ok) return new NextResponse("Approved image unavailable", { status: 502 });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength < 10000 || bytes.byteLength > 12000000) {
      return new NextResponse("Invalid original image", { status: 502 });
    }
    const image = sharp(bytes);
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      return new NextResponse("Invalid artwork dimensions", { status: 502 });
    }
    const background = await sharp(bytes)
      .resize(width, height, { fit: "cover", position: "centre" })
      .blur(38)
      .modulate({ brightness: 0.48, saturation: 0.80 })
      .ensureAlpha()
      .toBuffer();
    const foreground = await sharp(bytes)
      .resize(width, height, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .png()
      .toBuffer();
    const jpeg = await sharp(background)
      .composite([{ input: foreground, gravity: "centre" }])
      .flatten({ background: "#143860" })
      .jpeg({ quality: 93, chromaSubsampling: "4:4:4" })
      .toBuffer();
    return new NextResponse(new Uint8Array(jpeg), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'inline; filename="tripownia-gran-canaria-' + format + '"',
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Content-Type-Options": "nosniff",
      }
    });
  } catch (error) {
    console.error("Tripownia social photo conversion failed", error);
    return new NextResponse("Photo temporarily unavailable", { status: 502 });
  }
}
