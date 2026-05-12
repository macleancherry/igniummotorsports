import { json, readJson, requireBearer, requireDb } from "../_lib/http";
import type { Context } from "../_lib/types";

type LiveBody = {
  title?: string;
  slug?: string;
  teamName?: string;
  series?: string;
  track?: string;
  carClass?: string;
  car?: string;
  startTime?: string;
  status?: "scheduled" | "live" | "finished";
  iracingSessionId?: string;
  subsessionId?: string;
  timingUrl?: string;
  streamUrl?: string;
  notes?: string;
  driverIds?: number[];
};

export async function onRequestGet(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  try {
    const event = await db
      .prepare(
        `SELECT id, title, slug, team_name as teamName, series, track, car_class as carClass, car, start_time as startTime,
                status, iracing_session_id as iracingSessionId, subsession_id as subsessionId, timing_url as timingUrl,
                stream_url as streamUrl, notes
         FROM events
         ORDER BY CASE status WHEN 'live' THEN 0 WHEN 'scheduled' THEN 1 ELSE 2 END, datetime(start_time) DESC
         LIMIT 1`
      )
      .first<any>();

    if (!event) {
      return json({ event: null, drivers: [] });
    }

    const drivers = await db
      .prepare(
        `SELECT d.id, d.name, d.slug, d.race_number as raceNumber, d.country, d.avatar_url as avatarUrl,
                d.twitch_url as twitchUrl, d.youtube_url as youtubeUrl, ed.role, ed.stint_order as stintOrder
         FROM event_drivers ed
         JOIN drivers d ON d.id = ed.driver_id
         WHERE ed.event_id = ?
         ORDER BY COALESCE(ed.stint_order, 9999), d.name ASC`
      )
      .bind(event.id)
      .all();

    return json({ event, drivers: drivers.results ?? [] });
  } catch {
    return json({ ok: false, error: "live_query_failed" }, 500);
  }
}

export async function onRequestPost(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  const authError = requireBearer(context, context.env.ADMIN_TOKEN);
  if (authError) return authError;

  const body = await readJson<LiveBody>(context.request);
  if (!body?.title || !body?.slug) {
    return json({ ok: false, error: "invalid_body", message: "title and slug are required." }, 400);
  }

  const now = new Date().toISOString();
  const status = body.status ?? "scheduled";

  try {
    await db
      .prepare(
        `INSERT INTO events (title, slug, team_name, series, track, car_class, car, start_time, status,
                            iracing_session_id, subsession_id, timing_url, stream_url, notes, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           title = excluded.title,
           team_name = excluded.team_name,
           series = excluded.series,
           track = excluded.track,
           car_class = excluded.car_class,
           car = excluded.car,
           start_time = excluded.start_time,
           status = excluded.status,
           iracing_session_id = excluded.iracing_session_id,
           subsession_id = excluded.subsession_id,
           timing_url = excluded.timing_url,
           stream_url = excluded.stream_url,
           notes = excluded.notes,
           updated_at = excluded.updated_at`
      )
      .bind(
        body.title,
        body.slug,
        body.teamName ?? "Ignium Motorsport",
        body.series ?? null,
        body.track ?? null,
        body.carClass ?? null,
        body.car ?? null,
        body.startTime ?? now,
        status,
        body.iracingSessionId ?? null,
        body.subsessionId ?? null,
        body.timingUrl ?? null,
        body.streamUrl ?? null,
        body.notes ?? null,
        now
      )
      .run();

    if (Array.isArray(body.driverIds)) {
      const event = await db.prepare("SELECT id FROM events WHERE slug = ?").bind(body.slug).first<any>();
      if (event?.id) {
        await db.prepare("DELETE FROM event_drivers WHERE event_id = ?").bind(event.id).run();
        for (let idx = 0; idx < body.driverIds.length; idx += 1) {
          await db
            .prepare(
              "INSERT OR IGNORE INTO event_drivers (event_id, driver_id, role, stint_order) VALUES (?, ?, 'driver', ?)"
            )
            .bind(event.id, body.driverIds[idx], idx + 1)
            .run();
        }
      }
    }
  } catch {
    return json({ ok: false, error: "live_upsert_failed" }, 500);
  }

  return json({ ok: true });
}
