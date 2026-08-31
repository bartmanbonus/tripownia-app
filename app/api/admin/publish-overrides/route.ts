import { NextRequest, NextResponse } from "next/server";

type OverridePatch = Record<string, Record<string, unknown>>;

const FILE_PATH = "data/offer-overrides.json";

function githubConfig() {
  const token = process.env.TRIPOWNIA_GITHUB_TOKEN;
  const repo = process.env.TRIPOWNIA_GITHUB_REPO;
  const branch = process.env.TRIPOWNIA_GITHUB_BRANCH || "main";
  const secret = process.env.TRIPOWNIA_ADMIN_SECRET;
  return { token, repo, branch, secret };
}

async function getCurrentFile(token: string, repo: string, branch: string) {
  const url = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (response.status === 404) return { sha: undefined, data: {} as OverridePatch };
  if (!response.ok) throw new Error(`GitHub GET: ${response.status}`);

  const file = await response.json();
  const decoded = Buffer.from(file.content || "", "base64").toString("utf8");
  let data: OverridePatch = {};
  try { data = JSON.parse(decoded || "{}"); } catch { data = {}; }
  return { sha: file.sha as string | undefined, data };
}

export async function GET() {
  const { token, repo, secret } = githubConfig();
  return NextResponse.json({
    configured: Boolean(token && repo && secret),
    repoConfigured: Boolean(repo),
  });
}

export async function POST(request: NextRequest) {
  const { token, repo, branch, secret } = githubConfig();

  if (!token || !repo || !secret) {
    return NextResponse.json(
      { ok: false, error: "Publikacja GitHub nie jest jeszcze skonfigurowana w Vercel." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null) as
    | { adminSecret?: string; overrides?: OverridePatch }
    | null;

  if (!body || body.adminSecret !== secret) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowe hasło publikacji." }, { status: 401 });
  }

  const incoming = body.overrides || {};
  const current = await getCurrentFile(token, repo, branch);

  const merged: OverridePatch = { ...current.data };
  for (const [id, patch] of Object.entries(incoming)) {
    if (!patch || typeof patch !== "object") continue;
    merged[id] = { ...(merged[id] || {}), ...patch };
  }

  const content = Buffer.from(JSON.stringify(merged, null, 2) + "\n", "utf8").toString("base64");
  const url = `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: `Tripownia admin: aktualizacja ofert ${new Date().toISOString()}`,
      content,
      branch,
      ...(current.sha ? { sha: current.sha } : {}),
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: result?.message || `GitHub PUT: ${response.status}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    commit: result?.commit?.sha || null,
    message: "Zmiany zapisane w GitHubie. Vercel powinien uruchomić nowy deployment.",
  });
}
