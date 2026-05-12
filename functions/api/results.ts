import { json, requireDb, toInt } from "../_lib/http";
import type { Context } from "../_lib/types";

export async function onRequestGet(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  const limit = Math.max(1, Math.min(100, toInt(new URL(context.request.url).searchParams.get("limit"), 30)));

  try {
    const rows = await db
      .prepare(
        `SELECT r.id, r.source, r.source_result_id as sourceResultId, r.iracing_customer_id as iracingCustomerId,
                r.subsession_id as subsessionId, r.driver_name as driverName, r.team_name as teamName, r.series,
                r.track, r.car, r.car_class as carClass, r.qualifying_position as qualifyingPosition,
                r.start_position as startPosition, r.finish_position as finishPosition,
                r.class_position as classPosition, r.field_size as fieldSize, r.class_field_size as classFieldSize,
                r.laps_completed as lapsCompleted, r.best_lap as bestLap, r.incidents,
                r.strength_of_field as strengthOfField, r.irating_change as iratingChange,
                r.license_change as licenseChange, r.official, r.result_url as resultUrl,
                r.completed_at as completedAt, d.slug as driverSlug
         FROM results r
         LEFT JOIN drivers d ON d.id = r.driver_id
         ORDER BY datetime(r.completed_at) DESC, r.id DESC
         LIMIT ?`
      )
      .bind(limit)
      .all();

    return json({ results: rows.results ?? [] });
  } catch {
    return json({ ok: false, error: "results_query_failed" }, 500);
  }
}
