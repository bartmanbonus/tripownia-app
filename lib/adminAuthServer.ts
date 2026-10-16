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
  | { ok: true; token: string; role: "admin" | "reviewer"; user: { id: string; email?: string; app_metadata?: Record<string, unknown> } }
  | { ok: false; status: 401 | 403; error: string };

export async function verifyAdminRequest(request: NextRequest, allowReviewer = false): Promise<AdminAuthResult> {
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
    email_confirmed_at?: string | null;
  };

  if (user.app_metadata?.role === "admin") {
    return { ok: true, token, user, role: "admin" };
  }

  // Reviewer rights are limited to explicit read-only routes. Never trust user_metadata.
  const reviewers = new Set(
    (process.env.TRIPOWNIA_REVIEWER_EMAILS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
  const verifiedEmail = typeof user.email_confirmed_at === "string" && Boolean(user.email_confirmed_at);
  if (allowReviewer && verifiedEmail && user.email && reviewers.has(user.email.trim().toLowerCase())) {
    return { ok: true, token, user, role: "reviewer" };
  }

  return { ok: false, status: 403, error: "Konto nie ma uprawnień do tego panelu." };
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
