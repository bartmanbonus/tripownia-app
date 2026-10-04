import sharp from "sharp";

export const runtime = "nodejs";

const SOURCE = "https://static.metricool.com/planner/202610/7111875-file-8127139323159036359.png";

export async function GET() {
  try {
    const response = await fetch(SOURCE, { cache: "force-cache" });
    if (!response.ok) return new Response("Source unavailable", { status: 502 });

    const input = Buffer.from(await response.arrayBuffer());
    const output = await sharp(input)
      .resize(1080, 1920, { fit: "cover", position: "centre" })
      .jpeg({ quality: 94, mozjpeg: true })
      .toBuffer();

    return new Response(output, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(output.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[garda_tiktok_jpeg]", error instanceof Error ? error.message : error);
    return new Response("Image conversion unavailable", { status: 502 });
  }
}
