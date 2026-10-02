import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SUPABASE_URL = "https://wgbzccgcfhnouakswyvj.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_5S3oW5eD0MTLArG0gZANIw_ORJiqQQl";

function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
}

function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || DEFAULT_SUPABASE_KEY;
}

function bearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

export type AdminAuthResult =
  | { ok: true; token: string; user: { id: string; email?: string; app_metadata?: Record<string, unknown> } }
  | { ok: false; status: 401 | 403; error: string };

export async function verifyAdminRequest(request: NextRequest): Promise<AdminAuthResult> {
  const token = bearerToken(request);
  if (!token) {
    return { ok: false, status: 401, error: "Brak sesji administratora." };
  }

  const key = supabaseKey();
  const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, status: 401, error: "Sesja wygasła lub jest nieprawidłowa." };
  }

  const user = await response.json() as {
    id: string;
    email?: string;
    app_metadata?: Record<string, unknown>;
  };

  if (user.app_metadata?.role !== "admin") {
    return { ok: false, status: 403, error: "Konto nie ma uprawnień administratora." };
  }

  return { ok: true, token, user };
}

export function adminAuthError(result: Extract<AdminAuthResult, { ok: false }>) {
  return NextResponse.json(
    { ok: false, error: result.error },
    {
      status: result.status,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
