import { json, requireDb } from "../_lib/http";
import type { Context } from "../_lib/types";

export async function onRequestGet(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  try {
    const rows = await db
      .prepare(
        `SELECT id, name, slug, handle, iracing_customer_id as iracingCustomerId, race_number as raceNumber,
                country, bio, avatar_url as avatarUrl, twitch_url as twitchUrl, youtube_url as youtubeUrl,
                active, total_sessions as totalSessions, wins, podiums,
                best_finish_position as bestFinishPosition, latest_series as latestSeries,
                latest_track as latestTrack, irating, cached_at as cachedAt
         FROM drivers
         WHERE active = 1
         ORDER BY name ASC`
      )
      .all();

    // Calculate cache freshness
    const data = rows.results ?? [];
    const cachedAt = data.length > 0 ? data[0].cachedAt : new Date().toISOString();
    const cachedMinutesAgo = Math.floor((Date.now() - new Date(cachedAt).getTime()) / 60000);

    return json({
      results: data,
      cachedAt,
      cachedMinutesAgo,
      isFresh: cachedMinutesAgo <= 60,
    });
  } catch {
    return json({ results: [], cachedAt: null, cachedMinutesAgo: null, isFresh: false });
  }
}
