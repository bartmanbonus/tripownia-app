import sharp from "sharp";

export const runtime = "nodejs";

export async function GET() {
  const source = "https://tripownia.pl/social/bari-alberobello-669/tiktok";
  const response = await fetch(source, { cache: "no-store" });

  if (!response.ok) {
    return new Response("Image source unavailable", { status: 502 });
  }

  const input = Buffer.from(await response.arrayBuffer());
  const output = await sharp(input)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  return new Response(output, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
