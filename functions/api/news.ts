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
  const db = requireDb(context);
  if (db instanceof Response) return db;

  try {
    const rows = await db
      .prepare(
        `SELECT id, title, slug, excerpt, body_markdown as bodyMarkdown, cover_image_url as coverImageUrl,
                author, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt
         FROM news_posts
         ORDER BY datetime(COALESCE(published_at, created_at)) DESC`
      )
      .all();

    return json({ results: rows.results ?? [] });
  } catch {
    return json({ results: [] });
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
