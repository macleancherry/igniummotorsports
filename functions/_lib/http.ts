import type { Context } from "./types";

export async function readJson<T>(request: Request): Promise<T | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return auth.slice(7).trim() || null;
}

export function requireBearer(context: Context, expectedToken: string | undefined): Response | null {
  if (!expectedToken) {
    return json({ ok: false, error: "missing_server_config", message: "Server token is not configured." }, 500);
  }

  const token = getBearerToken(context.request);
  if (!token || token !== expectedToken) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  return null;
}

function parseOriginHeader(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function requireSameOrigin(context: Context): Response | null {
  const requestOrigin = new URL(context.request.url).origin;
  const origin = parseOriginHeader(context.request.headers.get("origin"));
  const referer = parseOriginHeader(context.request.headers.get("referer"));
  const fetchSite = (context.request.headers.get("sec-fetch-site") ?? "").toLowerCase();

  if (origin === requestOrigin || referer === requestOrigin) {
    return null;
  }

  if ((fetchSite === "same-origin" || fetchSite === "same-site") && !origin && !referer) {
    return null;
  }

  return json({ ok: false, error: "forbidden_origin" }, 403);
}

export function requireDb(context: Context): D1Database | Response {
  const db = (context.env as { DB?: D1Database }).DB;
  if (!db) {
    return json(
      {
        ok: false,
        error: "missing_db_binding",
        message: "D1 binding 'DB' is not configured for this environment.",
      },
      500
    );
  }

  return db;
}

export function toInt(value: string | null | undefined, fallback: number): number {
  if (value === null || value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.trunc(parsed);
}
