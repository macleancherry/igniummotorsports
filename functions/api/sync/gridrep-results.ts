import { json, requireDb, requireSameOrigin, toInt } from "../../_lib/http";
import type { Context } from "../../_lib/types";

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
const GRIDREP_FETCH_TIMEOUT_MS = 25000;
const DEFAULT_LIMIT_PER_DRIVER = 20;
const DEFAULT_FULL_LIMIT_PER_DRIVER = 100;
const MAX_LIMIT_PER_DRIVER = 250;
const GRIDREP_MAX_ATTEMPTS = 3;
const GRIDREP_INTER_DRIVER_DELAY_MS = 250;

class GridRepHttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GridRepHttpError";
    this.status = status;
  }
}

function parseCustomerIds(raw: string | null): number[] {
  if (!raw) return [];

  const values = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^\d+$/.test(item))
    .map((item) => Number(item));

  return Array.from(new Set(values));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDriverResults(
  context: Context,
  customerId: number,
  limit: number,
  passthroughQuery: URLSearchParams
): Promise<GridRepResult[]> {
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

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let response: Response;
  const params = new URLSearchParams(passthroughQuery);
  params.set("customerIds", String(customerId));
  params.set("limit", String(limit));

  try {
    const fetchPromise = fetch(`${baseUrl}/api/integrations/ignium/results?${params.toString()}`, {
      headers,
      signal: controller.signal,
    });
    const timeoutPromise = new Promise<Response>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`GridRep request timed out for customerId ${customerId}`));
      }, GRIDREP_FETCH_TIMEOUT_MS);
    });

    response = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`GridRep request timed out for customerId ${customerId}`);
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  if (!response.ok) {
    throw new GridRepHttpError(
      `GridRep request failed for customerId ${customerId} with status ${response.status}`,
      response.status
    );
  }

  const payload = (await response.json()) as { results?: GridRepResult[] };
  return payload.results ?? [];
}

function withConservativeDefaults(query: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(query);

  // Keep each GridRep invocation small enough for free-tier Worker CPU/subrequest limits.
  if (!next.has("importConcurrency")) next.set("importConcurrency", "1");
  if (!next.has("importDelayMs")) next.set("importDelayMs", "1200");
  if (!next.has("queryDelayMs")) next.set("queryDelayMs", "600");
  if (!next.has("chunkDelayMs")) next.set("chunkDelayMs", "600");
  if (!next.has("maxChunkFiles")) next.set("maxChunkFiles", "8");
  if (!next.has("driverDelayMs")) next.set("driverDelayMs", "900");

  return next;
}

function buildAttemptRequest(
  baseQuery: URLSearchParams,
  baseLimit: number,
  attempt: number
): { query: URLSearchParams; limit: number } {
  const query = withConservativeDefaults(baseQuery);
  const decay = Math.max(0, attempt - 1);
  const limit = Math.max(5, Math.floor(baseLimit / Math.pow(2, decay)));

  // Progressively reduce fan-out on retries to avoid repeated Worker overload.
  if (!baseQuery.has("maxChunkFiles")) {
    const chunkBudget = Math.max(3, 8 - decay * 2);
    query.set("maxChunkFiles", String(chunkBudget));
  }

  return { query, limit };
}

function isRetryableGridRepError(error: unknown): boolean {
  if (!(error instanceof GridRepHttpError)) return false;
  return error.status === 429 || error.status >= 500;
}

async function fetchDriverResultsWithRetry(
  context: Context,
  customerId: number,
  limit: number,
  passthroughQuery: URLSearchParams,
  maxAttempts = GRIDREP_MAX_ATTEMPTS
): Promise<GridRepResult[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const request = buildAttemptRequest(passthroughQuery, limit, attempt);
      return await fetchDriverResults(context, customerId, request.limit, request.query);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown GridRep fetch error");

      if (!isRetryableGridRepError(err)) {
        break;
      }

      if (attempt < maxAttempts) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError ?? new Error("GridRep fetch failed after retries");
}

export async function onRequestPost(context: Context) {
  const originError = requireSameOrigin(context);
  if (originError) return originError;

  const db = requireDb(context);
  if (db instanceof Response) return db;

  const missing: string[] = [];
  if (!context.env.GRIDREP_API_BASE_URL) {
    missing.push("GRIDREP_API_BASE_URL");
  }

  if (missing.length > 0) {
    return json(
      {
        ok: false,
        error: "missing_gridrep_config",
        missing,
      },
      400
    );
  }

  const url = new URL(context.request.url);
  const fullRequested = url.searchParams.get("full") === "1";
  const requestedLimit = toInt(
    url.searchParams.get("limit"),
    fullRequested ? DEFAULT_FULL_LIMIT_PER_DRIVER : DEFAULT_LIMIT_PER_DRIVER
  );
  const limitPerDriver = Math.max(1, Math.min(MAX_LIMIT_PER_DRIVER, requestedLimit));
  const requestedCustomerIds = parseCustomerIds(url.searchParams.get("customerIds"));

  const passthroughQuery = new URLSearchParams();
  const passthroughKeys = [
    "refreshMode",
    "windowStart",
    "windowEnd",
    "includeHosted",
    "officialOnly",
    "importConcurrency",
    "importDelayMs",
    "queryDelayMs",
    "chunkDelayMs",
    "maxChunkFiles",
    "driverDelayMs",
  ];

  for (const key of passthroughKeys) {
    const value = url.searchParams.get(key);
    if (value !== null && value.trim() !== "") {
      passthroughQuery.set(key, value);
    }
  }

  const driversQuery = await db
    .prepare(
      `SELECT id, name, iracing_customer_id as iracingCustomerId
       FROM drivers
       WHERE active = 1 AND iracing_customer_id IS NOT NULL
       ORDER BY id ASC`
    )
    .all<{ id: number; name: string; iracingCustomerId: number }>();

  const allDrivers = driversQuery.results ?? [];
  const drivers =
    requestedCustomerIds.length > 0
      ? allDrivers.filter((driver) => requestedCustomerIds.includes(driver.iracingCustomerId))
      : allDrivers;

  if (drivers.length === 0) {
    return json({
      ok: true,
      fetched: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      message: "No active drivers to sync.",
      requestedCustomerIds,
    });
  }
  const allowedCustomerIds = new Set(drivers.map((driver) => driver.iracingCustomerId));

  const warnings: string[] = [];
  const perDriverFetched: Record<string, number> = {};
  const fetchedRows: GridRepResult[] = [];
  let failedDrivers = 0;
  let upstreamUnavailable = false;

  for (const driver of drivers) {
    try {
      const rows = await fetchDriverResultsWithRetry(
        context,
        driver.iracingCustomerId,
        limitPerDriver,
        passthroughQuery
      );
      perDriverFetched[String(driver.iracingCustomerId)] = rows.length;
      fetchedRows.push(...rows);

      if (GRIDREP_INTER_DRIVER_DELAY_MS > 0) {
        await sleep(GRIDREP_INTER_DRIVER_DELAY_MS);
      }
    } catch (err) {
      failedDrivers += 1;
      perDriverFetched[String(driver.iracingCustomerId)] = 0;
      warnings.push(
        `Failed to fetch customerId ${driver.iracingCustomerId}: ${err instanceof Error ? err.message : "Unknown error"}`
      );

      // Circuit breaker: if upstream is clearly unavailable, fail fast.
      if (failedDrivers >= 1 && fetchedRows.length === 0) {
        upstreamUnavailable = true;
        break;
      }
    }
  }

  if (upstreamUnavailable || failedDrivers === drivers.length) {
    return json(
      {
        ok: false,
        error: "gridrep_unavailable",
        message: "GridRep integration API failed for all Ignium drivers.",
        fullRequested,
        limitPerDriver,
        driversScanned: drivers.length,
        failedDrivers,
        warnings,
      },
      502
    );
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of fetchedRows) {
    if (!row.subsessionId || row.customerId === null) {
      skipped += 1;
      warnings.push("Skipped a row missing subsessionId or customerId.");
      continue;
    }

    if (!allowedCustomerIds.has(row.customerId)) {
      skipped += 1;
      warnings.push(`Skipped non-Ignium customerId ${row.customerId}.`);
      continue;
    }

    const sourceResultId = `${row.subsessionId}:${row.customerId}`;

    const driver = drivers.find((item) => item.iracingCustomerId === row.customerId);

    if (!driver) {
      skipped += 1;
      warnings.push(`No local driver for customerId ${row.customerId}.`);
      continue;
    }

    const existing = await db.prepare(
      `SELECT id FROM results WHERE source = 'gridrep' AND source_result_id = ?`
    )
      .bind(sourceResultId)
      .first<any>();

    const now = new Date().toISOString();

    if (existing?.id) {
      await db.prepare(
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
             updated_at = ?,
             cached_at = ?
         WHERE id = ?`
      )
        .bind(
          driver.id,
          row.customerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          "Ignium Motorsport",
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
          row.official === null ? null : row.official ? 1 : 0,
          row.resultUrl,
          row.completedAt,
          now,
          now,
          existing.id
        )
        .run();
      updated += 1;
    } else {
      await db.prepare(
        `INSERT INTO results (
          driver_id, source, source_result_id, iracing_customer_id, subsession_id, driver_name, team_name,
          series, track, car, car_class, qualifying_position, start_position, finish_position, class_position,
          field_size, class_field_size, laps_completed, best_lap, incidents, strength_of_field, irating_change,
          license_change, official, result_url, completed_at, updated_at, cached_at
        ) VALUES (?, 'gridrep', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          driver.id,
          sourceResultId,
          row.customerId,
          row.subsessionId,
          row.driverName ?? driver.name,
          "Ignium Motorsport",
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
          row.official === null ? null : row.official ? 1 : 0,
          row.resultUrl,
          row.completedAt,
          now,
          now
        )
        .run();
      inserted += 1;
    }
  }

  const now = new Date().toISOString();
  await db
    .prepare(`UPDATE drivers SET cached_at = ? WHERE active = 1`)
    .bind(now)
    .run();

  return json({
    ok: true,
    fullRequested,
    limitPerDriver,
    requestedCustomerIds,
    passthrough: Object.fromEntries(passthroughQuery.entries()),
    driversScanned: drivers.length,
    fetched: fetchedRows.length,
    perDriverFetched,
    inserted,
    updated,
    skipped,
    warnings,
  });
}
