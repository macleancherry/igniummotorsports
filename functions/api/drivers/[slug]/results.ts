import { json, requireDb, toInt } from "../../../_lib/http";
import type { Context } from "../../../_lib/types";

type GridRepResult = {
  customerId?: number | null;
  driverName?: string | null;
  subsessionId?: string | null;
  sessionName?: string | null;
  series?: string | null;
  track?: string | null;
  car?: string | null;
  carClass?: string | null;
  qualifyingPosition?: number | null;
  startPosition?: number | null;
  finishPosition?: number | null;
  classPosition?: number | null;
  fieldSize?: number | null;
  classFieldSize?: number | null;
  lapsCompleted?: number | null;
  bestLap?: string | null;
  incidents?: number | null;
  strengthOfField?: number | null;
  iratingChange?: number | null;
  licenseChange?: string | null;
  official?: boolean | null;
  completedAt?: string | null;
  resultUrl?: string | null;
};

const FRESHNESS_WINDOW_MS = 60 * 60 * 1000; // 60 minutes for profile page caching
const DEFAULT_GRIDREP_API_BASE_URL = "https://gridrep.pages.dev";
const IGNIUM_PUBLIC_ORIGIN = "https://igniummotorsports.pages.dev";
const BEST_LAP_SORT_SQL = `
  CASE
    WHEN best_lap IS NULL OR TRIM(best_lap) = '' OR INSTR(best_lap, ':') = 0 THEN 999999.999
    ELSE (CAST(SUBSTR(best_lap, 1, INSTR(best_lap, ':') - 1) AS REAL) * 60.0)
       + CAST(SUBSTR(best_lap, INSTR(best_lap, ':') + 1) AS REAL)
  END
`;

function isFresh(timestamp: string | null | undefined): boolean {
  if (!timestamp) return false;

  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return false;

  return Date.now() - parsed <= FRESHNESS_WINDOW_MS;
}

async function fetchGridRepResults(context: Context, customerId: number, limit: number) {
  const baseUrl = (context.env.GRIDREP_API_BASE_URL ?? DEFAULT_GRIDREP_API_BASE_URL).replace(/\/$/, "");
  if (!baseUrl) {
    return { rows: [] };
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Origin: IGNIUM_PUBLIC_ORIGIN,
    Referer: `${IGNIUM_PUBLIC_ORIGIN}/`,
    "X-Ignium-Origin": IGNIUM_PUBLIC_ORIGIN,
  };

  if (context.env.GRIDREP_API_TOKEN) {
    headers.Authorization = `Bearer ${context.env.GRIDREP_API_TOKEN}`;
  }

  const response = await fetch(
    `${baseUrl}/api/integrations/ignium/results?customerIds=${customerId}&limit=${limit}`,
    {
      headers,
    }
  );

  if (!response.ok) {
    return { rows: [] };
  }

  const data = (await response.json()) as { results?: GridRepResult[] };
  return { rows: data.results ?? [] };
}

function mapGridRepRowsForResponse(rows: GridRepResult[], customerId: number) {
  return rows.map((row, index) => ({
    id: -(index + 1),
    source: "gridrep",
    sourceResultId: row.subsessionId && row.customerId ? `${row.subsessionId}:${row.customerId}` : row.subsessionId ?? null,
    iracingCustomerId: row.customerId ?? customerId,
    subsessionId: row.subsessionId ?? null,
    driverName: row.driverName ?? null,
    teamName: null,
    series: row.series ?? row.sessionName ?? null,
    track: row.track ?? null,
    car: row.car ?? null,
    carClass: row.carClass ?? null,
    qualifyingPosition: row.qualifyingPosition ?? null,
    startPosition: row.startPosition ?? null,
    finishPosition: row.finishPosition ?? null,
    classPosition: row.classPosition ?? null,
    fieldSize: row.fieldSize ?? null,
    classFieldSize: row.classFieldSize ?? null,
    lapsCompleted: row.lapsCompleted ?? null,
    bestLap: row.bestLap ?? null,
    incidents: row.incidents ?? null,
    strengthOfField: row.strengthOfField ?? null,
    iratingChange: row.iratingChange ?? null,
    licenseChange: row.licenseChange ?? null,
    official: row.official === null || row.official === undefined ? null : row.official ? 1 : 0,
    resultUrl: row.resultUrl ?? null,
    completedAt: row.completedAt ?? null,
  }));
}

async function loadLocalResults(db: D1Database, driverId: number, limit: number) {
  return db
    .prepare(
      `WITH ranked_results AS (
         SELECT id, source, source_result_id as sourceResultId, iracing_customer_id as iracingCustomerId,
                subsession_id as subsessionId, driver_name as driverName, team_name as teamName, series, track,
                car, car_class as carClass, qualifying_position as qualifyingPosition, start_position as startPosition,
                finish_position as finishPosition, class_position as classPosition, field_size as fieldSize,
                class_field_size as classFieldSize, laps_completed as lapsCompleted, best_lap as bestLap,
                incidents, strength_of_field as strengthOfField, irating_change as iratingChange,
                license_change as licenseChange, official, result_url as resultUrl, completed_at as completedAt,
                updated_at as updatedAt, created_at as createdAt,
                ROW_NUMBER() OVER (
                  PARTITION BY
                    COALESCE(NULLIF(TRIM(series), ''), 'unknown-series'),
                    strftime('%Y-%W', COALESCE(completed_at, created_at))
                  ORDER BY
                    CASE WHEN class_position IS NULL OR class_position <= 0 THEN 1 ELSE 0 END ASC,
                    CASE WHEN class_position IS NULL OR class_position <= 0 THEN 999999 ELSE class_position END ASC,
                    ${BEST_LAP_SORT_SQL} ASC,
                    datetime(COALESCE(completed_at, created_at)) DESC,
                    id DESC
                ) AS weeklyRank
         FROM results
         WHERE driver_id = ?
       )
       SELECT id, source, sourceResultId, iracingCustomerId, subsessionId, driverName, teamName, series, track,
              car, carClass, qualifyingPosition, startPosition, finishPosition, classPosition, fieldSize,
              classFieldSize, lapsCompleted, bestLap, incidents, strengthOfField, iratingChange,
              licenseChange, official, resultUrl, completedAt, updatedAt, createdAt
       FROM ranked_results
       WHERE weeklyRank = 1
       ORDER BY datetime(COALESCE(completedAt, createdAt)) DESC, id DESC
       LIMIT ?`
    )
    .bind(driverId, limit)
    .all();
}

async function upsertGridRepResults(db: D1Database, driver: { id: number; name: string; iracingCustomerId?: number | null }, rows: GridRepResult[]) {
  const now = new Date().toISOString();

  for (const row of rows) {
    if (!row.subsessionId || row.customerId === null || row.customerId === undefined) {
      continue;
    }

    const sourceResultId = `${row.subsessionId}:${row.customerId}`;
    const existing = await db
      .prepare(`SELECT id FROM results WHERE source = 'gridrep' AND source_result_id = ?`)
      .bind(sourceResultId)
      .first<{ id: number }>();

    if (existing?.id) {
      await db
        .prepare(
          `UPDATE results
           SET driver_id = ?,
               iracing_customer_id = ?,
               subsession_id = ?,
               driver_name = ?,
               team_name = COALESCE(team_name, ?),
               series = ?,
               track = ?,
               car = ?,
               car_class = ?,
               qualifying_position = ?,
               start_position = ?,
               finish_position = ?,
               class_position = ?,
               field_size = ?,
               class_field_size = ?,
               laps_completed = ?,
               best_lap = ?,
               incidents = ?,
               strength_of_field = ?,
               irating_change = ?,
               license_change = ?,
               official = ?,
               result_url = ?,
               completed_at = ?,
               updated_at = ?
           WHERE id = ?`
        )
        .bind(
          driver.id,
          row.customerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          "Ignium Motorsport",
          row.series ?? row.sessionName ?? null,
          row.track,
          row.car,
          row.carClass,
          row.qualifyingPosition,
          row.startPosition,
          row.finishPosition,
          row.classPosition,
          row.fieldSize,
          row.classFieldSize,
          row.lapsCompleted,
          row.bestLap,
          row.incidents,
          row.strengthOfField,
          row.iratingChange,
          row.licenseChange,
          row.official === null || row.official === undefined ? null : row.official ? 1 : 0,
          row.resultUrl,
          row.completedAt,
          now,
          existing.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO results (
            driver_id, source, source_result_id, iracing_customer_id, subsession_id, driver_name, team_name,
            series, track, car, car_class, qualifying_position, start_position, finish_position, class_position,
            field_size, class_field_size, laps_completed, best_lap, incidents, strength_of_field, irating_change,
            license_change, official, result_url, completed_at, updated_at
          ) VALUES (?, 'gridrep', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          driver.id,
          sourceResultId,
          row.customerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          "Ignium Motorsport",
          row.series ?? row.sessionName ?? null,
          row.track,
          row.car,
          row.carClass,
          row.qualifyingPosition,
          row.startPosition,
          row.finishPosition,
          row.classPosition,
          row.fieldSize,
          row.classFieldSize,
          row.lapsCompleted,
          row.bestLap,
          row.incidents,
          row.strengthOfField,
          row.iratingChange,
          row.licenseChange,
          row.official === null || row.official === undefined ? null : row.official ? 1 : 0,
          row.resultUrl,
          row.completedAt,
          now
        )
        .run();
    }
  }
}

export async function onRequestGet(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  const slug = context.params.slug;
  const url = new URL(context.request.url);
  const limit = Math.max(1, Math.min(20, toInt(url.searchParams.get("limit"), 20)));

  const driver = await db.prepare(
    `SELECT id, name, slug, iracing_customer_id as iracingCustomerId
     FROM drivers
     WHERE slug = ?`
  )
    .bind(slug)
    .first<any>();

  if (!driver) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  const results = await loadLocalResults(db, driver.id, limit);
  const localResults = results.results ?? [];

  // Calculate cache freshness
  const cachedAt = localResults.length > 0 && localResults[0].updatedAt
    ? localResults[0].updatedAt
    : new Date().toISOString();
  const cachedMinutesAgo = Math.floor((Date.now() - new Date(cachedAt).getTime()) / 60000);

  return json({
    driver,
    results: localResults,
    cachedAt,
    cachedMinutesAgo,
    isFresh: cachedMinutesAgo <= 60,
  });
}
