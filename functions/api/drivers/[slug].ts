import { json } from "../../_lib/http";
import type { Context } from "../../_lib/types";

export async function onRequestGet(context: Context) {
  const slug = context.params.slug;
  const row = await context.env.DB.prepare(
    `SELECT id, name, slug, handle, iracing_customer_id as iracingCustomerId, race_number as raceNumber,
            country, bio, avatar_url as avatarUrl, twitch_url as twitchUrl, youtube_url as youtubeUrl,
            active, last_seen_at as lastSeenAt, total_sessions as totalSessions,
            avg_finish_position as avgFinishPosition, wins, podiums, top_fives as topFives,
            latest_series as latestSeries, latest_track as latestTrack,
            latest_finish_position as latestFinishPosition, best_finish_position as bestFinishPosition,
            favorite_track as favoriteTrack, favorite_series as favoriteSeries,
            total_results as totalResults, irating, license_class as licenseClass,
            gridrep_synced_at as gridrepSyncedAt
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
