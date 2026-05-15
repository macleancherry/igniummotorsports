import { json, requireDb, toInt } from "../_lib/http";
import type { Context } from "../_lib/types";

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

const DEFAULT_GRIDREP_API_BASE_URL = "https://gridrep.pages.dev";
const IGNIUM_PUBLIC_ORIGIN = "https://igniummotorsports.pages.dev";
const FRESHNESS_WINDOW_MS = 5 * 60 * 1000;
const BEST_LAP_SORT_SQL = `
  CASE
    WHEN r.best_lap IS NULL OR TRIM(r.best_lap) = '' OR INSTR(r.best_lap, ':') = 0 THEN 999999.999
    ELSE (CAST(SUBSTR(r.best_lap, 1, INSTR(r.best_lap, ':') - 1) AS REAL) * 60.0)
       + CAST(SUBSTR(r.best_lap, INSTR(r.best_lap, ':') + 1) AS REAL)
  END
`;

function isFresh(timestamp: string | null | undefined): boolean {
  if (!timestamp) return false;
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) && Date.now() - parsed <= FRESHNESS_WINDOW_MS;
}

function mapRemoteResult(row: GridRepResult, index: number) {
  return {
    id: -(index + 1),
    source: "gridrep",
    sourceResultId: row.subsessionId ?? null,
    iracingCustomerId: row.customerId ?? null,
    subsessionId: row.subsessionId ?? null,
    driverName: row.driverName ?? null,
    teamName: "Ignium Motorsport",
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
    driverSlug: null,
  };
}

async function loadLocalResults(db: D1Database, limit: number) {
  return db
    .prepare(
      `WITH ranked_results AS (
         SELECT r.id, r.source, r.source_result_id as sourceResultId, r.iracing_customer_id as iracingCustomerId,
                r.subsession_id as subsessionId, r.driver_name as driverName, r.team_name as teamName, r.series,
                r.track, r.car, r.car_class as carClass, r.qualifying_position as qualifyingPosition,
                r.start_position as startPosition, r.finish_position as finishPosition,
                r.class_position as classPosition, r.field_size as fieldSize, r.class_field_size as classFieldSize,
                r.laps_completed as lapsCompleted, r.best_lap as bestLap, r.incidents,
                r.strength_of_field as strengthOfField, r.irating_change as iratingChange,
                r.license_change as licenseChange, r.official, r.result_url as resultUrl,
                r.completed_at as completedAt, r.updated_at as updatedAt, r.created_at as createdAt,
                d.slug as driverSlug,
                ROW_NUMBER() OVER (
                  PARTITION BY
                    COALESCE(CAST(r.driver_id AS TEXT), CAST(r.iracing_customer_id AS TEXT), r.driver_name, 'unknown-driver'),
                    COALESCE(NULLIF(TRIM(r.series), ''), 'unknown-series'),
                    strftime('%Y-%W', COALESCE(r.completed_at, r.created_at))
                  ORDER BY
                    CASE WHEN r.class_position IS NULL OR r.class_position <= 0 THEN 1 ELSE 0 END ASC,
                    CASE WHEN r.class_position IS NULL OR r.class_position <= 0 THEN 999999 ELSE r.class_position END ASC,
                    ${BEST_LAP_SORT_SQL} ASC,
                    datetime(COALESCE(r.completed_at, r.created_at)) DESC,
                    r.id DESC
                ) AS weeklyRank
         FROM results r
         LEFT JOIN drivers d ON d.id = r.driver_id
         WHERE r.source = 'gridrep'
       )
       SELECT id, source, sourceResultId, iracingCustomerId, subsessionId, driverName, teamName, series,
              track, car, carClass, qualifyingPosition, startPosition, finishPosition, classPosition,
              fieldSize, classFieldSize, lapsCompleted, bestLap, incidents, strengthOfField,
              iratingChange, licenseChange, official, resultUrl, completedAt, updatedAt, createdAt, driverSlug
       FROM ranked_results
       WHERE weeklyRank = 1
       ORDER BY datetime(COALESCE(completedAt, createdAt)) DESC, id DESC
       LIMIT ?`
    )
    .bind(limit)
    .all();
}

          async function loadAnyLocalResults(db: D1Database, limit: number) {
            return db
              .prepare(
                `WITH ranked_results AS (
                   SELECT r.id, r.source, r.source_result_id as sourceResultId, r.iracing_customer_id as iracingCustomerId,
                          r.subsession_id as subsessionId, r.driver_name as driverName, r.team_name as teamName, r.series,
                          r.track, r.car, r.car_class as carClass, r.qualifying_position as qualifyingPosition,
                          r.start_position as startPosition, r.finish_position as finishPosition,
                          r.class_position as classPosition, r.field_size as fieldSize, r.class_field_size as classFieldSize,
                          r.laps_completed as lapsCompleted, r.best_lap as bestLap, r.incidents,
                          r.strength_of_field as strengthOfField, r.irating_change as iratingChange,
                          r.license_change as licenseChange, r.official, r.result_url as resultUrl,
                          r.completed_at as completedAt, r.updated_at as updatedAt, r.created_at as createdAt,
                          d.slug as driverSlug,
                          ROW_NUMBER() OVER (
                            PARTITION BY
                              COALESCE(CAST(r.driver_id AS TEXT), CAST(r.iracing_customer_id AS TEXT), r.driver_name, 'unknown-driver'),
                              COALESCE(NULLIF(TRIM(r.series), ''), 'unknown-series'),
                              strftime('%Y-%W', COALESCE(r.completed_at, r.created_at))
                            ORDER BY
                              CASE WHEN r.class_position IS NULL OR r.class_position <= 0 THEN 1 ELSE 0 END ASC,
                              CASE WHEN r.class_position IS NULL OR r.class_position <= 0 THEN 999999 ELSE r.class_position END ASC,
                              ${BEST_LAP_SORT_SQL} ASC,
                              datetime(COALESCE(r.completed_at, r.created_at)) DESC,
                              r.id DESC
                          ) AS weeklyRank
                   FROM results r
                   LEFT JOIN drivers d ON d.id = r.driver_id
                 )
                 SELECT id, source, sourceResultId, iracingCustomerId, subsessionId, driverName, teamName, series,
                        track, car, carClass, qualifyingPosition, startPosition, finishPosition, classPosition,
                        fieldSize, classFieldSize, lapsCompleted, bestLap, incidents, strengthOfField,
                        iratingChange, licenseChange, official, resultUrl, completedAt, updatedAt, createdAt, driverSlug
                 FROM ranked_results
                 WHERE weeklyRank = 1
                 ORDER BY datetime(COALESCE(completedAt, createdAt)) DESC, id DESC
                 LIMIT ?`
              )
              .bind(limit)
              .all();
          }

async function fetchRemoteResults(context: Context, limit: number) {
  const customerIds = (context.env.GRIDREP_TEAM_DRIVER_CUSTOMER_IDS ?? "").trim();
  if (!customerIds) return [];

  const baseUrl = (context.env.GRIDREP_API_BASE_URL ?? DEFAULT_GRIDREP_API_BASE_URL).replace(/\/$/, "");
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
    `${baseUrl}/api/integrations/ignium/results?customerIds=${customerIds}&limit=${limit}`,
    { headers }
  );

  if (!response.ok) return [];

  const payload = (await response.json()) as { results?: GridRepResult[] };
  return (payload.results ?? []).map(mapRemoteResult);
}

async function upsertRemoteResults(db: D1Database, rows: ReturnType<typeof mapRemoteResult>[]) {
  const now = new Date().toISOString();

  for (const row of rows) {
    if (!row.subsessionId || row.iracingCustomerId === null) continue;

    const sourceResultId = `${row.subsessionId}:${row.iracingCustomerId}`;
    const driver = await db
      .prepare(`SELECT id, name FROM drivers WHERE iracing_customer_id = ?`)
      .bind(row.iracingCustomerId)
      .first<{ id: number; name: string }>();

    if (!driver) continue;

    const existing = await db
      .prepare(`SELECT id FROM results WHERE source = 'gridrep' AND source_result_id = ?`)
      .bind(sourceResultId)
      .first<{ id: number }>();

    if (existing?.id) {
      await db
        .prepare(
          `UPDATE results
           SET driver_id = ?, iracing_customer_id = ?, subsession_id = ?, driver_name = ?, team_name = ?,
               series = ?, track = ?, car = ?, car_class = ?, qualifying_position = ?, start_position = ?,
               finish_position = ?, class_position = ?, field_size = ?, class_field_size = ?, laps_completed = ?,
               best_lap = ?, incidents = ?, strength_of_field = ?, irating_change = ?, license_change = ?,
               official = ?, result_url = ?, completed_at = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(
          driver.id,
          row.iracingCustomerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          row.teamName,
          row.series,
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
          row.official,
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
          row.iracingCustomerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          row.teamName,
          row.series,
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
          row.official,
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

  const limit = Math.max(1, Math.min(100, toInt(new URL(context.request.url).searchParams.get("limit"), 10)));

  try {
    const rows = await loadLocalResults(db, limit);
    const localResults = rows.results ?? [];
    
    // Get cache metadata
    const cacheInfoRow = await db
      .prepare(`SELECT MAX(cached_at) as latestCachedAt FROM results WHERE cached_at IS NOT NULL`)
      .first<{ latestCachedAt: string | null }>();
    
    const cachedAt = cacheInfoRow?.latestCachedAt || new Date().toISOString();
    const cachedMinutesAgo = Math.floor((Date.now() - new Date(cachedAt).getTime()) / 60000);
    
    if (localResults.length > 0) {
      return json({ results: localResults, cachedAt, cachedMinutesAgo, isFresh: cachedMinutesAgo <= 60 });
    }

    const fallbackRows = await loadAnyLocalResults(db, limit);
    return json({ results: fallbackRows.results ?? [], cachedAt, cachedMinutesAgo, isFresh: false });
  } catch {
    return json({ results: [], cachedAt: null, cachedMinutesAgo: null, isFresh: false });
  }
}
