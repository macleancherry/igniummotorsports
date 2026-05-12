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
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.trunc(parsed);
}
