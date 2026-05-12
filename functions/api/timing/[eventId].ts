import { json, readJson, requireBearer } from "../../_lib/http";
import type { Context } from "../../_lib/types";

type TimingRow = {
  carNumber?: string;
  driverName?: string;
  position?: number;
  classPosition?: number;
  lap?: number;
  lastLap?: string;
  bestLap?: string;
  gap?: string;
  interval?: string;
  pitStatus?: string;
  streamUrl?: string;
};

type TimingPayload = {
  rows?: TimingRow[];
};

export async function onRequestGet(context: Context) {
  const eventId = Number(context.params.eventId);
  if (!Number.isFinite(eventId)) {
    return json({ ok: false, error: "invalid_event_id" }, 400);
  }

  const rows = await context.env.DB.prepare(
    `SELECT id, event_id as eventId, car_number as carNumber, driver_name as driverName, position,
            class_position as classPosition, lap, last_lap as lastLap, best_lap as bestLap,
            gap, interval, pit_status as pitStatus, stream_url as streamUrl, created_at as createdAt
     FROM live_timing_snapshots
     WHERE event_id = ?
     ORDER BY COALESCE(position, 999), COALESCE(class_position, 999), id ASC`
  )
    .bind(eventId)
    .all();

  return json({ eventId, rows: rows.results ?? [] });
}

export async function onRequestPost(context: Context) {
  const authError = requireBearer(context, context.env.TIMING_INGEST_TOKEN);
  if (authError) return authError;

  const eventId = Number(context.params.eventId);
  if (!Number.isFinite(eventId)) {
    return json({ ok: false, error: "invalid_event_id" }, 400);
  }

  const payload = await readJson<TimingPayload>(context.request);
  if (!payload || !Array.isArray(payload.rows)) {
    return json({ ok: false, error: "invalid_body", message: "rows array is required." }, 400);
  }

  for (const row of payload.rows) {
    if (!row?.driverName) {
      return json({ ok: false, error: "invalid_row", message: "driverName is required for every row." }, 400);
    }
  }

  await context.env.DB.prepare("DELETE FROM live_timing_snapshots WHERE event_id = ?").bind(eventId).run();

  for (const row of payload.rows) {
    await context.env.DB.prepare(
      `INSERT INTO live_timing_snapshots (
        event_id, car_number, driver_name, position, class_position, lap,
        last_lap, best_lap, gap, interval, pit_status, stream_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        eventId,
        row.carNumber ?? null,
        row.driverName,
        row.position ?? null,
        row.classPosition ?? null,
        row.lap ?? null,
        row.lastLap ?? null,
        row.bestLap ?? null,
        row.gap ?? null,
        row.interval ?? null,
        row.pitStatus ?? null,
        row.streamUrl ?? null
      )
      .run();
  }

  return json({ ok: true, replaced: payload.rows.length });
}
