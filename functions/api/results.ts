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
      `SELECT r.id, r.source, r.source_result_id as sourceResultId, r.iracing_customer_id as iracingCustomerId,
              r.subsession_id as subsessionId, r.driver_name as driverName, r.team_name as teamName, r.series,
              r.track, r.car, r.car_class as carClass, r.qualifying_position as qualifyingPosition,
              r.start_position as startPosition, r.finish_position as finishPosition,
              r.class_position as classPosition, r.field_size as fieldSize, r.class_field_size as classFieldSize,
              r.laps_completed as lapsCompleted, r.best_lap as bestLap, r.incidents,
              r.strength_of_field as strengthOfField, r.irating_change as iratingChange,
              r.license_change as licenseChange, r.official, r.result_url as resultUrl,
              r.completed_at as completedAt, r.updated_at as updatedAt, r.created_at as createdAt,
              d.slug as driverSlug
       FROM results r
       LEFT JOIN drivers d ON d.id = r.driver_id
       ORDER BY datetime(r.completed_at) DESC, r.id DESC
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
    const newestLocalTimestamp = localResults.reduce<string | null>((latest, row) => {
      const candidate = typeof row.updatedAt === "string" && row.updatedAt.length > 0
        ? row.updatedAt
        : typeof row.createdAt === "string" && row.createdAt.length > 0
          ? row.createdAt
          : null;
      if (!candidate) return latest;
      if (!latest) return candidate;
      return Date.parse(candidate) > Date.parse(latest) ? candidate : latest;
    }, null);

    if (localResults.length > 0 && isFresh(newestLocalTimestamp)) {
      return json({ results: localResults });
    }

    const remoteResults = await fetchRemoteResults(context, limit);
    if (remoteResults.length > 0) {
      try {
        await upsertRemoteResults(db, remoteResults);
        const refreshed = await loadLocalResults(db, limit);
        const refreshedRows = refreshed.results ?? [];
        if (refreshedRows.length > 0) {
          return json({ results: refreshedRows });
        }
      } catch {
        // Fall back to the fresh remote rows below.
      }

      return json({ results: remoteResults });
    }

    return json({ results: localResults });
  } catch {
    return json({ results: [] });
  }
}
