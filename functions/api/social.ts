import { json, readJson, requireBearer, requireDb } from "../_lib/http";
import type { Context } from "../_lib/types";

type SyncPostBody = {
  igPostId?: string;
  imageUrl?: string;
  caption?: string;
  permalink?: string;
  postedAt?: string;
};

type SyncBody = {
  posts?: SyncPostBody[];
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
        `SELECT ig_post_id as id, image_url as imageUrl, caption, permalink as url
         FROM instagram_posts
         ORDER BY datetime(posted_at) DESC
         LIMIT 12`
      )
      .all();

    const data = rows.results ?? [];

    const cacheInfoRow = await db
      .prepare(`SELECT MAX(synced_at) as latestSyncedAt FROM instagram_posts`)
      .first<{ latestSyncedAt: string | null }>();

    const cachedAt = cacheInfoRow?.latestSyncedAt || null;
    const cachedMinutesAgo = cachedAt ? Math.floor((Date.now() - new Date(cachedAt).getTime()) / 60000) : null;

    const response = new Response(
      JSON.stringify({
        results: data,
        cachedAt,
        cachedMinutesAgo,
        isFresh: cachedMinutesAgo !== null && cachedMinutesAgo <= 60,
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

  const body = await readJson<SyncBody>(context.request);
  if (!Array.isArray(body?.posts) || body.posts.length === 0) {
    return json({ ok: false, error: "invalid_body", message: "posts must be a non-empty array." }, 400);
  }

  const valid = body.posts.filter(
    (post): post is Required<Pick<SyncPostBody, "igPostId" | "imageUrl">> & SyncPostBody =>
      Boolean(post.igPostId && post.imageUrl)
  );

  if (valid.length === 0) {
    return json(
      { ok: false, error: "invalid_body", message: "each post needs at least igPostId and imageUrl." },
      400
    );
  }

  const now = new Date().toISOString();

  try {
    await db.batch(
      valid.map((post) =>
        db
          .prepare(
            `INSERT INTO instagram_posts (ig_post_id, image_url, caption, permalink, posted_at, synced_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(ig_post_id) DO UPDATE SET
               image_url = excluded.image_url,
               caption = excluded.caption,
               permalink = excluded.permalink,
               posted_at = excluded.posted_at,
               synced_at = excluded.synced_at`
          )
          .bind(post.igPostId, post.imageUrl, post.caption ?? null, post.permalink ?? null, post.postedAt ?? null, now)
      )
    );
  } catch {
    return json({ ok: false, error: "db_error" }, 500);
  }

  return json({ ok: true, upserted: valid.length }, 201);
}
