import { json, readJson, requireBearer, requireDb } from "../_lib/http";
import type { Context } from "../_lib/types";

type CreateNewsBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  bodyMarkdown?: string;
  coverImageUrl?: string;
  author?: string;
  publishedAt?: string;
};

export async function onRequestGet(context: Context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const db = requireDb(context);
  if (db instanceof Response) return db;

  try {
    const rows = await db
      .prepare(
        `SELECT id, title, slug, excerpt, cover_image_url as coverImageUrl,
                author, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt, cached_at as cachedAt
         FROM news_posts
         ORDER BY datetime(COALESCE(published_at, created_at)) DESC`
      )
      .all();

    const data = rows.results ?? [];
    
    // Get cache freshness
    const cacheInfoRow = await db
      .prepare(`SELECT MAX(cached_at) as latestCachedAt FROM news_posts WHERE cached_at IS NOT NULL`)
      .first<{ latestCachedAt: string | null }>();
    
    const cachedAt = cacheInfoRow?.latestCachedAt || new Date().toISOString();
    const cachedMinutesAgo = Math.floor((Date.now() - new Date(cachedAt).getTime()) / 60000);

    const response = new Response(
      JSON.stringify({
      results: data,
      cachedAt,
      cachedMinutesAgo,
      isFresh: cachedMinutesAgo <= 60,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      }
    );

    await cache.put(cacheKey, response.clone());
    return response;
  } catch {
    return json({
      results: [],
      cachedAt: null,
      cachedMinutesAgo: null,
      isFresh: false,
    });
  }
}

export async function onRequestPost(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  const authError = requireBearer(context, context.env.ADMIN_TOKEN);
  if (authError) return authError;

  const body = await readJson<CreateNewsBody>(context.request);
  if (!body?.title || !body?.slug || !body?.bodyMarkdown) {
    return json({ ok: false, error: "invalid_body", message: "title, slug and bodyMarkdown are required." }, 400);
  }

  const now = new Date().toISOString();

  try {
    await db
      .prepare(
      `INSERT INTO news_posts (title, slug, excerpt, body_markdown, cover_image_url, author, published_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.title,
        body.slug,
        body.excerpt ?? null,
        body.bodyMarkdown,
        body.coverImageUrl ?? null,
        body.author ?? "Ignium Motorsport",
        body.publishedAt ?? now,
        now
      )
      .run();
  } catch {
    return json({ ok: false, error: "conflict_or_db_error" }, 409);
  }

  return json({ ok: true }, 201);
}
