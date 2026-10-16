import { NextRequest, NextResponse } from "next/server";
import { adminAuthError, verifyAdminRequest } from "@/lib/adminAuthServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const socialReview = request.nextUrl.searchParams.get("scope") === "social-review";
  const auth = await verifyAdminRequest(request, socialReview);
  if (!auth.ok) return adminAuthError(auth);

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: auth.user.id,
        email: auth.user.email || null,
        role: auth.role,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
