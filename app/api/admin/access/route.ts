import { NextRequest, NextResponse } from "next/server";
import { adminAuthError, verifyAdminRequest } from "@/lib/adminAuthServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) return adminAuthError(auth);

  return NextResponse.json(
    {
      ok: true,
      user: {
        id: auth.user.id,
        email: auth.user.email || null,
        role: "admin",
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
