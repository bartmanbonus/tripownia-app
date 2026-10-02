import sharp from "sharp";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const source = new URL("/social/bari-alberobello-669/tiktok", request.url);
    const response = await fetch(source, { cache: "no-store" });

    if (!response.ok) {
      return new Response("Image source unavailable", { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "";
    const input = Buffer.from(await response.arrayBuffer());
    if (!contentType.startsWith("image/") || input.length === 0) {
      return new Response("Image source returned no image", { status: 502 });
    }

    const output = await sharp(input)
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    if (!output.length) {
      return new Response("Image conversion failed", { status: 502 });
    }

    return new Response(output, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[bari_tiktok_jpeg]", error instanceof Error ? error.message : error);
    return new Response("Image conversion unavailable", { status: 502 });
  }
}
