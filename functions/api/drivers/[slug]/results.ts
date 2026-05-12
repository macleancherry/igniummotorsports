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

async function fetchGridRepResults(context: Context, customerId: number, limit: number) {
  const baseUrl = (context.env.GRIDREP_API_BASE_URL ?? "").replace(/\/$/, "");
  if (!baseUrl || !context.env.GRIDREP_API_TOKEN) {
    return [];
  }

  const response = await fetch(
    `${baseUrl}/api/integrations/ignium/results?customerIds=${customerId}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${context.env.GRIDREP_API_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { results?: GridRepResult[] };
  return (data.results ?? []).map((row, index) => ({
    id: -(index + 1),
    source: "gridrep",
    sourceResultId: row.subsessionId ?? null,
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
    official: row.official ? 1 : 0,
    resultUrl: row.resultUrl ?? null,
    completedAt: row.completedAt ?? null,
  }));
}

export async function onRequestGet(context: Context) {
  const db = requireDb(context);
  if (db instanceof Response) return db;

  const slug = context.params.slug;
  const limit = Math.max(1, Math.min(20, toInt(new URL(context.request.url).searchParams.get("limit"), 10)));

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

  const results = await db.prepare(
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

  const localResults = results.results ?? [];
  if (localResults.length > 0 || !driver.iracingCustomerId) {
    return json({ driver, results: localResults });
  }

  const remoteResults = await fetchGridRepResults(context, driver.iracingCustomerId, limit);
  return json({ driver, results: remoteResults });
}
