import { renderBrandSocialPreview } from "@/lib/brandSocialPreview";
export const runtime = "edge";
export function GET() { return renderBrandSocialPreview(); }
