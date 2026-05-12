import { json, toInt } from "../../../_lib/http";
import type { Context } from "../../../_lib/types";

export async function onRequestGet(context: Context) {
  const slug = context.params.slug;
  const limit = Math.max(1, Math.min(20, toInt(new URL(context.request.url).searchParams.get("limit"), 10)));

  const driver = await context.env.DB.prepare(
    `SELECT id, name, slug, iracing_customer_id as iracingCustomerId
     FROM drivers
     WHERE slug = ?`
  )
    .bind(slug)
    .first<any>();

  if (!driver) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  const results = await context.env.DB.prepare(
    `SELECT id, source, source_result_id as sourceResultId, iracing_customer_id as iracingCustomerId,
            subsession_id as subsessionId, driver_name as driverName, team_name as teamName, series, track,
            car, car_class as carClass, qualifying_position as qualifyingPosition, start_position as startPosition,
            finish_position as finishPosition, class_position as classPosition, field_size as fieldSize,
            class_field_size as classFieldSize, laps_completed as lapsCompleted, best_lap as bestLap,
            incidents, strength_of_field as strengthOfField, irating_change as iratingChange,
            license_change as licenseChange, official, result_url as resultUrl, completed_at as completedAt
     FROM results
     WHERE driver_id = ?
     ORDER BY datetime(completed_at) DESC, id DESC
     LIMIT ?`
  )
    .bind(driver.id, limit)
    .all();

  return json({ driver, results: results.results ?? [] });
}
