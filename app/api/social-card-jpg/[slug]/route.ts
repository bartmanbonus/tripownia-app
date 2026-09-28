import sharp from "sharp";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const origin = url.origin;
  const source = `${origin}/api/social-card/${slug}?format=tiktok`;
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) return new Response("Offer not found", { status: response.status });

  const input = Buffer.from(await response.arrayBuffer());
  const output = await sharp(input).jpeg({ quality: 92 }).toBuffer();

  return new Response(output, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
