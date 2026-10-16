import { renderBrandSocialPreview } from "@/lib/brandSocialPreview";
export const alt = "Tripownia.pl — logo na białym tle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() { return renderBrandSocialPreview(); }
