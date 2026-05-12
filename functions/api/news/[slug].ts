import { json } from "../../_lib/http";
import type { Context } from "../../_lib/types";

export async function onRequestGet(context: Context) {
  const slug = context.params.slug;
  const row = await context.env.DB.prepare(
    `SELECT id, title, slug, excerpt, body_markdown as bodyMarkdown, cover_image_url as coverImageUrl,
            author, published_at as publishedAt, created_at as createdAt, updated_at as updatedAt
     FROM news_posts
     WHERE slug = ?`
  )
    .bind(slug)
    .first();

  if (!row) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  return json({ result: row });
}
