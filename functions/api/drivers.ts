import { json } from "../_lib/http";
import type { Context } from "../_lib/types";

export async function onRequestGet(context: Context) {
  const rows = await context.env.DB.prepare(
    `SELECT id, name, slug, handle, iracing_customer_id as iracingCustomerId, race_number as raceNumber,
            country, bio, avatar_url as avatarUrl, twitch_url as twitchUrl, youtube_url as youtubeUrl,
            active
     FROM drivers
     WHERE active = 1
     ORDER BY name ASC`
  ).all();

  return json({ results: rows.results ?? [] });
}
