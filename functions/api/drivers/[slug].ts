import { json } from "../../_lib/http";
import type { Context } from "../../_lib/types";

export async function onRequestGet(context: Context) {
  const slug = context.params.slug;
  const row = await context.env.DB.prepare(
    `SELECT id, name, slug, handle, iracing_customer_id as iracingCustomerId, race_number as raceNumber,
            country, bio, avatar_url as avatarUrl, twitch_url as twitchUrl, youtube_url as youtubeUrl,
            active
     FROM drivers
     WHERE slug = ?`
  )
    .bind(slug)
    .first();

  if (!row) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  return json({ result: row });
}
